#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createExternalFileManifest, computeExternalManifestRoot } from "./external-artifact-manifest.mjs";
import { PLUGIN_FILES } from "./plugin-package.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TITLE = "Improving human writing capabilities";
const POLICY = "owner-approved-content-lock-v1";
const CORE_SHA256 = "e9edf77aa4a8225b57ef834c086f1a478535fc975b9fecd04a15405229088074";
const METADATA = ["package.json", ".codex-plugin/plugin.json", ".claude-plugin/plugin.json"];
const TOOLS = [
  "scripts/distribution-release-check.mjs",
  "scripts/external-artifact-manifest.mjs",
  "scripts/plugin-package.mjs",
];
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const exactKeys = (value, keys) => isObject(value) && same(Object.keys(value).sort(compare), [...keys].sort(compare));

function safePath(path) {
  return typeof path === "string" && /^[\x20-\x7e]+$/.test(path)
    && !/[\\:<>"|?*]/.test(path) && !path.startsWith("/")
    && path.split("/").every((part) => part && part !== "." && part !== ".."
      && !/[. ]$/.test(part) && !/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part));
}

function checkedPaths(paths, label) {
  if (!Array.isArray(paths) || paths.length === 0) throw new Error(`${label} must be a nonempty path array`);
  const seen = new Set();
  for (const path of paths) {
    if (!safePath(path)) throw new Error(`${label} contains an unsafe path: ${String(path)}`);
    const key = path.toLowerCase();
    if (seen.has(key)) throw new Error(`${label} contains a duplicate path: ${path}`);
    seen.add(key);
  }
  return [...paths].sort(compare);
}

// Check every component: a file beneath a symlinked directory is not a locked input.
async function regularPath(root, path, directory = false) {
  if (!safePath(path)) throw new Error(`unsafe distribution path: ${String(path)}`);
  let current = root;
  const parts = path.split("/");
  for (const [index, part] of parts.entries()) {
    current = join(current, part);
    const stat = await lstat(current);
    const isDirectory = directory || index < parts.length - 1;
    if (stat.isSymbolicLink() || !(isDirectory ? stat.isDirectory() : stat.isFile())) {
      throw new Error(`distribution input must be a regular ${isDirectory ? "directory" : "file"}: ${path}`);
    }
  }
  return current;
}

async function scanTree(root, path) {
  const directory = await regularPath(root, path, true);
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = `${path}/${entry.name}`;
    if (entry.isDirectory()) paths.push(...await scanTree(root, name));
    else {
      await regularPath(root, name);
      paths.push(name);
    }
  }
  return paths;
}

async function listNpmFiles(root) {
  const cache = await mkdtemp(join(tmpdir(), "agora-distribution-pack-"));
  try {
    const args = ["pack", "--dry-run", "--ignore-scripts", "--json"];
    const npmCli = process.env.npm_execpath;
    const shell = !npmCli && process.platform === "win32";
    // The Windows shell command is constant; no input paths are interpolated.
    const result = spawnSync(npmCli ? process.execPath : shell ? `npm.cmd ${args.join(" ")}` : "npm",
      npmCli ? [npmCli, ...args] : shell ? [] : args, {
        cwd: root, encoding: "utf8", windowsHide: true, shell,
        env: { ...process.env, npm_config_cache: cache },
        timeout: 120_000, maxBuffer: 16 * 1024 * 1024,
      });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`npm pack inventory failed: ${result.stderr || result.stdout}`);
    const output = JSON.parse(result.stdout);
    const packages = Array.isArray(output) ? output : isObject(output) ? Object.values(output) : [];
    if (packages.length !== 1 || !Array.isArray(packages[0]?.files)) {
      throw new Error("npm pack must describe exactly one package with a file list");
    }
    return packages[0].files.map((file) => file?.path);
  } finally {
    await rm(cache, { recursive: true, force: true });
  }
}

async function readJson(root, path) {
  return JSON.parse(await readFile(await regularPath(root, path), "utf8"));
}

async function readVersion(root) {
  const pkg = await readJson(root, "package.json");
  if (typeof pkg?.version !== "string" || !SEMVER.test(pkg.version)) {
    throw new Error("package.json version must be a semantic version");
  }
  for (const path of METADATA.slice(1)) {
    if ((await readJson(root, path))?.version !== pkg.version) {
      throw new Error(`${path} version must match package.json version ${pkg.version}`);
    }
  }
  return pkg.version;
}

function validTimestamp(value) {
  if (typeof value !== "string") return false;
  const match = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.exec(value);
  if (!match || !Number.isFinite(Date.parse(value))) return false;
  const date = new Date(`${match[1]}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === match[1];
}

function approvalErrors(approval) {
  const errors = [];
  if (!exactKeys(approval, ["decision", "basis", "approved_by", "recorded_at"])) {
    return ["approval must contain exactly decision, basis, approved_by, and recorded_at"];
  }
  if (approval.decision !== "approved") errors.push("approval.decision must be approved");
  if (approval.basis !== "explicit-release-request") errors.push("approval.basis must be explicit-release-request");
  if (approval.approved_by !== "mbanderas") errors.push("approval.approved_by must be mbanderas");
  if (!validTimestamp(approval.recorded_at)) errors.push("approval.recorded_at must be a valid ISO timestamp");
  return errors;
}

// Only the expensive npm listing is injectable. Hashes, tree scans, plugin inputs,
// and the approved core lock always come from the filesystem and this policy.
export async function collectDistributionInventory(root = ROOT, { listNpmFiles: list = listNpmFiles } = {}) {
  const npm_files = checkedPaths(await list(root), "npm files");
  const plugin_files = checkedPaths(PLUGIN_FILES, "plugin files");
  const trees = (await Promise.all(["skills/agora", "skills/agora-start"].map((path) => scanTree(root, path)))).flat();
  const paths = checkedPaths([...new Set([...npm_files, ...plugin_files, ...METADATA, ...TOOLS, ...trees])], "inventory");
  const files = await Promise.all(paths.map(async (path) => ({
    path,
    sha256: createHash("sha256").update(await readFile(await regularPath(root, path))).digest("hex"),
  })));
  const core = files.filter(({ path }) => path.startsWith("skills/agora/"))
    .map(({ path, sha256 }) => ({ path: path.slice("skills/agora/".length), sha256 }));
  return {
    npm_files,
    plugin_files,
    inventory: createExternalFileManifest({ root: ".", files }),
    core_sha256: computeExternalManifestRoot(core),
  };
}

export async function createDistributionManifest({ root = ROOT, approval, listNpmFiles: list = listNpmFiles } = {}) {
  const errors = approvalErrors(approval);
  if (errors.length) throw new Error(errors.join("; "));
  const version = await readVersion(root);
  const inventory = await collectDistributionInventory(root, { listNpmFiles: list });
  if (inventory.core_sha256 !== CORE_SHA256) throw new Error("skills/agora core hash does not match the approved content lock");
  return {
    schema_version: 1,
    version,
    title: TITLE,
    policy: POLICY,
    approval: { ...approval },
    blind_superiority: "not-established",
    ...inventory,
  };
}

export async function verifyDistributionRelease(root = ROOT, options = {}) {
  try {
    const version = await readVersion(root);
    const manifest = await readJson(root, `evals/releases/v${version}.distribution.json`);
    const errors = [];
    if (!exactKeys(manifest, ["schema_version", "version", "title", "policy", "approval", "blind_superiority",
      "npm_files", "plugin_files", "inventory", "core_sha256"])) {
      return ["distribution manifest must contain exactly the supported schema fields"];
    }
    if (manifest.schema_version !== 1) errors.push("distribution schema_version must be 1");
    if (manifest.version !== version) errors.push("distribution version must match package.json version");
    if (manifest.title !== TITLE) errors.push(`distribution title must be ${TITLE}`);
    if (manifest.policy !== POLICY) errors.push(`distribution policy must be ${POLICY}`);
    errors.push(...approvalErrors(manifest.approval));
    if (manifest.blind_superiority !== "not-established") errors.push("blind_superiority must be not-established");
    if (errors.length) return errors;

    const actual = await collectDistributionInventory(root, options);
    for (const key of ["npm_files", "plugin_files"]) {
      checkedPaths(manifest[key], key);
      if (!same(manifest[key], actual[key])) errors.push(`${key} must match the complete, ASCII-sorted payload paths`);
    }
    const expected = manifest.inventory;
    if (!exactKeys(expected, ["algorithm", "root", "file_count", "files", "sha256"]) || !Array.isArray(expected.files)) {
      errors.push("inventory must be a complete file manifest");
    } else {
      checkedPaths(expected.files.map((file) => file?.path), "inventory files");
      if (expected.files.some((file) => !exactKeys(file, ["path", "sha256"])
        || typeof file.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(file.sha256))) {
        errors.push("inventory files must contain exactly path and a SHA256 hash");
      } else if (!same(expected.files, actual.inventory.files)) {
        // Object field order is immaterial; file order and every byte hash are not.
        const normalized = expected.files.map(({ path, sha256 }) => ({ path, sha256 }));
        if (!same(normalized, actual.inventory.files)) errors.push("inventory files or hashes differ from the complete distribution");
      }
      for (const key of ["algorithm", "root", "file_count", "sha256"]) {
        if (expected[key] !== actual.inventory[key]) errors.push(`inventory.${key} does not match the distribution`);
      }
    }
    if (manifest.core_sha256 !== CORE_SHA256 || actual.core_sha256 !== CORE_SHA256) {
      errors.push("skills/agora core hash does not match the approved content lock");
    }
    return errors;
  } catch (error) {
    return [`distribution release could not be verified: ${error.message}`];
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = process.argv.length > 2
    ? ["Usage: node scripts/distribution-release-check.mjs (read/check only)"]
    : await verifyDistributionRelease();
  if (errors.length) {
    process.stderr.write(`Distribution release verification failed:\n- ${errors.join("\n- ")}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write("Distribution authorization and content integrity verified; blind superiority is not established.\n");
  }
}
