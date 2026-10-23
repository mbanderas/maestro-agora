import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { buildPlugin, PLUGIN_FILES, validatePluginManifest } from "../scripts/plugin-package.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(join(ROOT, ".codex-plugin", "plugin.json"), "utf8"));

// Read the archive through its central directory, as ZIP consumers do, rather
// than relying on the order of the writer's local records.
function extractStoredZip(zip) {
  const end = zip.length - 22;
  assert.equal(zip.readUInt32LE(end), 0x06054b50);
  const count = zip.readUInt16LE(end + 10);
  let cursor = zip.readUInt32LE(end + 16);
  const directoryEnd = cursor + zip.readUInt32LE(end + 12);
  const result = new Map();
  for (let index = 0; index < count; index++) {
    assert.equal(zip.readUInt32LE(cursor), 0x02014b50);
    assert.equal(zip.readUInt16LE(cursor + 10), 0, "entry must be stored");
    const size = zip.readUInt32LE(cursor + 24);
    const nameLength = zip.readUInt16LE(cursor + 28);
    const extraLength = zip.readUInt16LE(cursor + 30);
    const commentLength = zip.readUInt16LE(cursor + 32);
    const local = zip.readUInt32LE(cursor + 42);
    const name = zip.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8");
    assert.equal(zip.readUInt32LE(local), 0x04034b50);
    assert.equal(zip.readUInt32LE(local + 14), zip.readUInt32LE(cursor + 16));
    assert.equal(zip.readUInt32LE(local + 22), size);
    const body = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    assert.equal(zip.subarray(local + 30, local + 30 + nameLength).toString("utf8"), name);
    assert.ok(!result.has(name), "archive names must be unique");
    result.set(name, zip.subarray(body, body + size));
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  assert.equal(cursor, directoryEnd);
  assert.equal(directoryEnd, end);
  return result;
}

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "agora-plugin-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const file of [...PLUGIN_FILES, "package.json"]) {
    await mkdir(dirname(join(root, file)), { recursive: true });
    await cp(join(ROOT, file), join(root, file));
  }
  return root;
}

test("submission ZIP is deterministic and preserves every packaged input byte", async () => {
  const first = await buildPlugin();
  const second = await buildPlugin();
  assert.deepEqual(first.zip, second.zip);
  assert.equal(first.sha256, second.sha256);
  const extracted = extractStoredZip(first.zip);
  assert.deepEqual([...extracted.keys()], PLUGIN_FILES);
  assert.ok(extracted.has(".codex-plugin/plugin.json"), "hidden manifest must survive archiving");
  assert.equal([...extracted.keys()].filter((file) => file.startsWith("skills/agora/")).length, 19);
  assert.ok(extracted.has("skills/agora/references/agora-article-runtime.md"));
  assert.ok(extracted.has("skills/agora/references/agora-article-examples.md"));
  for (const [name, bytes] of extracted) assert.deepEqual(bytes, await readFile(join(ROOT, name)), name);
});

test("unlisted working-tree and private files never enter the plugin", async (t) => {
  const root = await fixture(t);
  await writeFile(join(root, ".env"), "private fixture data");
  await writeFile(join(root, "skills/agora/notes.txt"), "unreleased notes");
  const archive = extractStoredZip((await buildPlugin(root)).zip);
  assert.ok(!archive.has(".env"));
  assert.ok(!archive.has("skills/agora/notes.txt"));
  assert.ok(!archive.has("package.json"));
  assert.ok(!archive.has("scripts/install.mjs"));
});

test("missing inputs and links outside the archive fail packaging", async (t) => {
  const root = await fixture(t);
  const skillPath = join(root, "skills/agora-start/SKILL.md");
  await writeFile(skillPath, `${await readFile(skillPath, "utf8")}\n[Absent resource](missing.md)\n`);
  await assert.rejects(buildPlugin(root), /links outside the archive/);
  await rm(skillPath);
  await assert.rejects(buildPlugin(root), /ENOENT/);
});

test("listing rejects known portal blockers", () => {
  validatePluginManifest(manifest);
  const mutations = [
    [(p) => { p.interface.shortDescription = "x".repeat(31); }, /shortDescription/],
    [(p) => { p.interface.defaultPrompt.push("A fourth prompt"); }, /one to three/],
    [(p) => { delete p.interface.logo; }, /logo/],
    [(p) => { p.interface.privacyPolicyURL = "http://example.com/privacy"; }, /HTTPS/],
    [(p) => { p.apps = "./.app.json"; }, /must not declare apps/],
    [(p) => { p.extensions["com.openai"].hooks = "./hooks"; }, /must not declare hooks/],
    [(p) => { p.interface.defaultPrompt[0] = "@agora write a page"; }, /app mentions/],
    [(p) => { p.extensions["com.openai"].onboardingSkill = "./absent/SKILL.md"; }, /agora-start/],
  ];
  for (const [mutate, expected] of mutations) {
    const changed = structuredClone(manifest);
    mutate(changed);
    assert.throws(() => validatePluginManifest(changed), expected);
  }
});

test("packaging rejects mismatched release versions and nonsquare icons", async (t) => {
  const root = await fixture(t);
  const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  await writeFile(join(root, "package.json"), JSON.stringify({ ...pkg, version: "0.0.0" }));
  await assert.rejects(buildPlugin(root), /versions must match/);
  await writeFile(join(root, "package.json"), JSON.stringify(pkg));
  const icon = await readFile(join(root, "assets/icon.png"));
  icon.writeUInt32BE(47, 16);
  await writeFile(join(root, "assets/icon.png"), icon);
  await assert.rejects(buildPlugin(root), /icon must be square/);
});

test("CLI creates a ZIP and refuses to replace an existing output", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "agora-plugin-output-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const output = join(dir, "submission.zip");
  const run = () => spawnSync(process.execPath, [join(ROOT, "scripts/plugin-package.mjs"), "--output", output],
    { encoding: "utf8", windowsHide: true });
  assert.equal(run().status, 0);
  const before = await readFile(output);
  const duplicate = run();
  assert.notEqual(duplicate.status, 0);
  assert.match(duplicate.stderr, /EEXIST/);
  assert.deepEqual(await readFile(output), before);
  assert.equal(extractStoredZip(before).size, PLUGIN_FILES.length);
});
