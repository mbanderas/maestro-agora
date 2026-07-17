#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED = [
  "README.md",
  "assets/agora-orbit.svg",
  "package.json",
  "scripts/install.mjs",
  "write-agora-marketing/SKILL.md",
  "write-agora-marketing/agents/openai.yaml",
  "write-agora-marketing/references/agora-marketing.md",
].sort();

const cache = await mkdtemp(join(tmpdir(), "agora-npm-pack-"));
try {
  const npmCli = process.env.npm_execpath;
  const command = npmCli ? process.execPath : process.platform === "win32" ? "npm.cmd" : "npm";
  const args = npmCli
    ? [npmCli, "pack", "--dry-run", "--json", "--ignore-scripts", "--cache", cache]
    : ["pack", "--dry-run", "--json", "--ignore-scripts", "--cache", cache];
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const payload = JSON.parse(result.stdout);
  assert.equal(payload.length, 1, "npm pack should describe exactly one package");
  const packed = payload[0].files.map((file) => file.path.replaceAll("\\", "/")).sort();
  assert.deepEqual(packed, EXPECTED, "npm package contents differ from the reviewed allowlist");
  process.stdout.write(`Package contents passed: ${packed.length} files\n`);
} finally {
  await rm(cache, { force: true, recursive: true });
}
