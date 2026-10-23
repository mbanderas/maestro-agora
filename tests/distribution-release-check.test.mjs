import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  collectDistributionInventory,
  createDistributionManifest,
  verifyDistributionRelease,
} from "../scripts/distribution-release-check.mjs";
import { computeExternalManifestRoot, createExternalFileManifest } from "../scripts/external-artifact-manifest.mjs";
import { PLUGIN_FILES } from "../scripts/plugin-package.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION = "1.12.0";
const RECORD = `evals/releases/v${VERSION}.distribution.json`;
const CORE_SHA256 = "e9edf77aa4a8225b57ef834c086f1a478535fc975b9fecd04a15405229088074";
const APPROVAL = {
  decision: "approved",
  basis: "explicit-release-request",
  approved_by: "mbanderas",
  recorded_at: "2026-10-23T12:00:00.000Z",
};
const TOOL_FILES = [
  "scripts/distribution-release-check.mjs",
  "scripts/external-artifact-manifest.mjs",
  "scripts/plugin-package.mjs",
];
// Deliberately leave a plugin-only file out of this synthetic npm payload.
const NPM_FILES = ["package.json", ".claude-plugin/plugin.json", "README.md", "scripts/install.mjs",
  ...PLUGIN_FILES.filter((path) => path !== "DISCLAIMER.md")];
const options = { listNpmFiles: async () => [...NPM_FILES].reverse() };
const fixedInputs = await Promise.all([...PLUGIN_FILES, ...TOOL_FILES].map(async (path) =>
  [path, await readFile(join(ROOT, path))]));

async function put(root, path, bytes) {
  await mkdir(dirname(join(root, path)), { recursive: true });
  await writeFile(join(root, path), bytes);
}

const putJson = (root, path, value) => put(root, path, `${JSON.stringify(value, null, 2)}\n`);

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "agora-distribution-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [path, bytes] of fixedInputs) await put(root, path, bytes);
  for (const path of ["package.json", ".codex-plugin/plugin.json", ".claude-plugin/plugin.json"]) {
    await putJson(root, path, { name: "distribution-fixture", type: "module", version: VERSION });
  }
  await put(root, "README.md", "Distribution fixture\n");
  await put(root, "scripts/install.mjs", "export const version = 1;\n");
  const manifest = await createDistributionManifest({ root, approval: APPROVAL, ...options });
  await putJson(root, RECORD, manifest);
  return { root, manifest };
}

async function snapshot(root, path = "") {
  const entries = [];
  for (const entry of await readdir(join(root, path), { withFileTypes: true })) {
    const name = path ? `${path}/${entry.name}` : entry.name;
    if (entry.isDirectory()) entries.push(...await snapshot(root, name));
    else entries.push({
      path: name,
      sha256: createHash("sha256").update(await readFile(join(root, name))).digest("hex"),
      mtime: (await lstat(join(root, name))).mtimeMs,
    });
  }
  return entries.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}

test("an explicitly approved manifest validates and binds both payloads and the relative core hash", async (t) => {
  const { root, manifest } = await fixture(t);
  assert.deepEqual(await verifyDistributionRelease(root, options), []);
  assert.equal(manifest.schema_version, 1);
  assert.equal(manifest.version, VERSION);
  assert.equal(manifest.title, "Improving human writing capabilities");
  assert.equal(manifest.policy, "owner-approved-content-lock-v1");
  assert.equal(manifest.blind_superiority, "not-established");
  assert.deepEqual(manifest.approval, APPROVAL);
  assert.deepEqual(manifest.npm_files, [...NPM_FILES].sort());
  assert.deepEqual(manifest.plugin_files, PLUGIN_FILES);
  assert.ok(!manifest.npm_files.includes("DISCLAIMER.md"));
  assert.ok(manifest.inventory.files.some(({ path }) => path === "DISCLAIMER.md"));
  assert.ok(TOOL_FILES.every((tool) => manifest.inventory.files.some(({ path }) => path === tool)));
  assert.equal(manifest.inventory.sha256, computeExternalManifestRoot(manifest.inventory.files));
  assert.equal(manifest.core_sha256, CORE_SHA256);
  assert.equal(manifest.core_sha256, computeExternalManifestRoot(manifest.inventory.files
    .filter(({ path }) => path.startsWith("skills/agora/"))
    .map(({ path, sha256 }) => ({ path: path.slice("skills/agora/".length), sha256 }))));
  // JSON object key order is immaterial to validation.
  manifest.inventory.files = manifest.inventory.files.map(({ path, sha256 }) => ({ sha256, path }));
  await putJson(root, RECORD, manifest);
  assert.deepEqual(await verifyDistributionRelease(root, options), []);
});

test("missing, malformed, and unsupported records fail closed", async (t) => {
  const { root } = await fixture(t);
  await rm(join(root, RECORD));
  assert.match((await verifyDistributionRelease(root, options)).join("\n"), /could not be verified/);
  for (const text of ["{", "null", "[]", "{}", "true"]) {
    await put(root, RECORD, text);
    assert.ok((await verifyDistributionRelease(root, options)).length > 0, text);
  }
});

test("approval must be explicit, valid, and supplied by the caller", async (t) => {
  const { root, manifest } = await fixture(t);
  const invalid = [
    undefined, null, [], {},
    { ...APPROVAL, decision: "rejected" },
    { ...APPROVAL, decision: true },
    { ...APPROVAL, basis: "inferred" },
    { ...APPROVAL, approved_by: "someone-else" },
    { ...APPROVAL, recorded_at: null },
    { ...APPROVAL, recorded_at: "2026-10-23" },
    { ...APPROVAL, recorded_at: "not-a-date" },
    { ...APPROVAL, recorded_at: "2026-02-30T12:00:00Z" },
    { ...APPROVAL, recorded_at: "2026-10-23T24:00:00Z" },
    { ...APPROVAL, certification: "passed" },
  ];
  for (const approval of invalid) {
    await putJson(root, RECORD, { ...manifest, approval });
    assert.ok((await verifyDistributionRelease(root, options)).length > 0, JSON.stringify(approval));
    await assert.rejects(createDistributionManifest({ root, approval, ...options }), /approval/);
  }
  for (const recorded_at of ["2026-10-23T12:00:00Z", "2026-10-23T13:00:00.12+01:00"]) {
    await putJson(root, RECORD, { ...manifest, approval: { ...APPROVAL, recorded_at } });
    assert.deepEqual(await verifyDistributionRelease(root, options), []);
  }
});

test("schema, version, title, policy, and false certification claims are rejected", async (t) => {
  const { root, manifest } = await fixture(t);
  for (const patch of [
    { schema_version: 2 }, { schema_version: "1" }, { version: "1.11.0" },
    { title: "A different title" }, { policy: "unsupported" },
    { blind_superiority: "established" }, { blind_superiority: "passed" },
    { blind_superiority: true }, { blind_superiority: null },
    { status: "passed" }, { certification: "passed" },
  ]) {
    await putJson(root, RECORD, { ...manifest, ...patch });
    assert.ok((await verifyDistributionRelease(root, options)).length > 0, JSON.stringify(patch));
  }
});

for (const path of ["README.md", "scripts/install.mjs", "DISCLAIMER.md", "skills/agora-start/SKILL.md",
  "skills/agora/SKILL.md", "scripts/distribution-release-check.mjs"]) {
  test(`changed or removed input fails: ${path}`, async (t) => {
    const { root } = await fixture(t);
    await writeFile(join(root, path), "changed\n");
    assert.ok((await verifyDistributionRelease(root, options)).length > 0);
    await rm(join(root, path));
    assert.ok((await verifyDistributionRelease(root, options)).length > 0);
  });
}

test("new npm payload entries and payload membership changes cannot hide in an unchanged union", async (t) => {
  const { root } = await fixture(t);
  await put(root, "assets/new.txt", "added\n");
  assert.ok((await verifyDistributionRelease(root, {
    listNpmFiles: async () => [...NPM_FILES, "assets/new.txt"],
  })).length > 0);
  // DISCLAIMER.md is already in the union because the plugin ships it.
  assert.match((await verifyDistributionRelease(root, {
    listNpmFiles: async () => [...NPM_FILES, "DISCLAIMER.md"],
  })).join("\n"), /npm_files/);
  assert.match((await verifyDistributionRelease(root, {
    listNpmFiles: async () => NPM_FILES.filter((path) => path !== "skills/agora-start/SKILL.md"),
  })).join("\n"), /npm_files/);
});

for (const tree of ["skills/agora", "skills/agora-start"]) {
  test(`complete scan detects an addition omitted from both listings: ${tree}`, async (t) => {
    const { root } = await fixture(t);
    const added = `${tree}/nested/unlisted.txt`;
    await put(root, added, "unexpected\n");
    const inventory = await collectDistributionInventory(root, options);
    assert.ok(inventory.inventory.files.some(({ path }) => path === added));
    assert.match((await verifyDistributionRelease(root, options)).join("\n"), /inventory/);
  });
}

test("a newly generated record cannot approve changed core content", async (t) => {
  const { root, manifest } = await fixture(t);
  await put(root, "skills/agora/SKILL.md", "changed core\n");
  await assert.rejects(createDistributionManifest({ root, approval: APPROVAL, ...options }), /approved content lock/);
  const changed = await collectDistributionInventory(root, options);
  await putJson(root, RECORD, { ...manifest, ...changed });
  assert.match((await verifyDistributionRelease(root, options)).join("\n"), /approved content lock/);
});

test("omitted entries, altered hashes, wrong aggregates, and unsorted inventories fail", async (t) => {
  const { root, manifest } = await fixture(t);
  const mutations = [
    (m) => { m.inventory = createExternalFileManifest({ root: ".", files: m.inventory.files.slice(1) }); },
    (m) => { m.inventory.files[0].sha256 = "0".repeat(64); },
    (m) => { m.inventory.sha256 = "0".repeat(64); },
    (m) => { m.inventory.file_count--; },
    (m) => { m.inventory.algorithm = "unsupported"; },
    (m) => { m.inventory.root = "skills/agora"; },
    (m) => { m.inventory.files.reverse(); },
    (m) => { m.inventory.files.push(m.inventory.files[0]); },
    (m) => { m.inventory.files[0].path = "../outside"; },
    (m) => { m.inventory.files[0].sha256 = null; },
    (m) => { m.inventory.files = null; },
    (m) => { m.inventory.files[0] = null; },
    (m) => { m.inventory = null; },
    (m) => { m.npm_files.reverse(); },
    (m) => { m.plugin_files.pop(); },
    (m) => { m.plugin_files.push(m.plugin_files[0]); },
    (m) => { m.core_sha256 = "0".repeat(64); },
  ];
  for (const mutate of mutations) {
    const changed = structuredClone(manifest);
    mutate(changed);
    await putJson(root, RECORD, changed);
    assert.ok((await verifyDistributionRelease(root, options)).length > 0, mutate.toString());
  }
});

test("unsafe and duplicate npm paths and listing failures fail closed", async (t) => {
  const { root } = await fixture(t);
  for (const path of ["../README.md", "/README.md", "C:/README.md", "README\\file", "README.md\n",
    "./README.md", "a//b", "README.md ", "a/CON", "README.md", "readme.md", "nonexistent.txt"]) {
    assert.ok((await verifyDistributionRelease(root, {
      listNpmFiles: async () => [...NPM_FILES, path],
    })).length > 0, path);
  }
  for (const value of [[], null, {}, [null]]) {
    assert.ok((await verifyDistributionRelease(root, { listNpmFiles: async () => value })).length > 0);
  }
  assert.match((await verifyDistributionRelease(root, {
    listNpmFiles: async () => { throw new Error("listing failed"); },
  })).join("\n"), /listing failed/);
});

test("symlinked directories cannot supply locked payload files", async (t) => {
  const { root } = await fixture(t);
  await mkdir(join(root, "linked-inputs"));
  await put(root, "linked-inputs/new.txt", "linked\n");
  await symlink(join(root, "linked-inputs"), join(root, "linked"), process.platform === "win32" ? "junction" : "dir");
  assert.match((await verifyDistributionRelease(root, {
    listNpmFiles: async () => [...NPM_FILES, "linked/new.txt"],
  })).join("\n"), /regular directory/);
});

for (const path of [".codex-plugin/plugin.json", ".claude-plugin/plugin.json"]) {
  test(`metadata version mismatch fails even with refreshed hashes: ${path}`, async (t) => {
    const { root, manifest } = await fixture(t);
    await putJson(root, path, { version: "1.11.0" });
    const refreshed = await collectDistributionInventory(root, options);
    await putJson(root, RECORD, { ...manifest, ...refreshed });
    assert.match((await verifyDistributionRelease(root, options)).join("\n"), /version must match/);
  });
}

test("package version must be semantic and selects its own versioned record", async (t) => {
  const { root } = await fixture(t);
  for (const version of ["../escape", "01.12.0", "v1.12.0", "1.12", 112]) {
    await putJson(root, "package.json", { version });
    assert.match((await verifyDistributionRelease(root, options)).join("\n"), /semantic version/);
  }
  for (const path of ["package.json", ".codex-plugin/plugin.json", ".claude-plugin/plugin.json"]) {
    await putJson(root, path, { version: "1.13.0" });
  }
  assert.match((await verifyDistributionRelease(root, options)).join("\n"), /v1\.13\.0\.distribution\.json/);
});

test("successful and failed verification do not mutate any files", async (t) => {
  const { root, manifest } = await fixture(t);
  const before = await snapshot(root);
  assert.deepEqual(await verifyDistributionRelease(root, options), []);
  assert.deepEqual(await snapshot(root), before);
  await putJson(root, RECORD, { ...manifest, policy: "unsupported" });
  const failedBefore = await snapshot(root);
  assert.ok((await verifyDistributionRelease(root, options)).length > 0);
  assert.deepEqual(await snapshot(root), failedBefore);
});

test("the CLI is read/check only and rejects write or bypass flags", () => {
  for (const flag of ["--write", "--generate", "--ignore-approval"]) {
    const result = spawnSync(process.execPath, [join(ROOT, "scripts/distribution-release-check.mjs"), flag], {
      encoding: "utf8", windowsHide: true,
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /read\/check only/);
  }
});

test("real repository inventory uses npm dry-run and includes every plugin input", async () => {
  // The only real npm invocation in this suite. No approval record is generated.
  const result = await collectDistributionInventory(ROOT);
  assert.equal(result.core_sha256, CORE_SHA256);
  assert.ok(result.npm_files.includes("package.json"));
  assert.ok(result.npm_files.includes("scripts/install.mjs"));
  assert.deepEqual(result.plugin_files, PLUGIN_FILES);
  const paths = result.inventory.files.map(({ path }) => path);
  assert.deepEqual(paths, [...paths].sort());
  for (const path of [...result.npm_files, ...PLUGIN_FILES]) assert.ok(paths.includes(path), path);
  assert.equal(result.inventory.sha256, computeExternalManifestRoot(result.inventory.files));
});
