#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED = [
  ".agents/plugins/marketplace.json",
  ".claude-plugin/marketplace.json",
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  "DISCLAIMER.md",
  "LICENSE",
  "PRIVACY.md",
  "README.md",
  "assets/agora-orbit.svg",
  "assets/icon.png",
  "assets/maestro-agora-banner.png",
  "package.json",
  "scripts/install.mjs",
  "scripts/voice-measure.mjs",
  "scripts/voice/check.mjs",
  "scripts/voice/features.mjs",
  "scripts/voice/gates.mjs",
  "scripts/voice/ingest.mjs",
  "scripts/voice/lexicon.mjs",
  "scripts/voice/pipeline.mjs",
  "scripts/voice/profile.mjs",
  "skills/agora/SKILL.md",
  "skills/agora/agents/openai.yaml",
  "skills/agora/references/agora-case-studies.md",
  "skills/agora/references/agora-conversion.md",
  "skills/agora/references/agora-craft.md",
  "skills/agora/references/agora-invest.md",
  "skills/agora/references/agora-marketing.md",
  "skills/agora/references/agora-publication.md",
  "skills/agora/references/agora-science.md",
  "skills/agora/references/agora-voice.md",
  "skills/agora/scripts/publication-audit.mjs",
].sort();

const cache = await mkdtemp(join(tmpdir(), "agora-npm-pack-"));
try {
  const npmCli = process.env.npm_execpath;
  const packArgs = ["pack", "--dry-run", "--json", "--ignore-scripts", "--cache", cache];
  // Node refuses to spawn a .cmd shim without a shell on Windows, so the direct
  // invocation falls back to one quoted command string. Running through npm
  // takes the npm_execpath branch and needs no shell at all.
  const useShell = !npmCli && process.platform === "win32";
  const command = npmCli
    ? process.execPath
    : useShell
      ? ["npm.cmd", ...packArgs].map((part) => (part.includes(" ") ? `"${part}"` : part)).join(" ")
      : "npm";
  const args = npmCli ? [npmCli, ...packArgs] : useShell ? undefined : packArgs;
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    windowsHide: true,
    shell: useShell,
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.doesNotMatch(
    result.stderr,
    /auto-corrected|bin\[agora\]/i,
    "npm must not normalize away the agora executable",
  );

  // npm 11 and earlier describe the pack as an array of packages. npm 12 returns
  // an object keyed by package name instead (npm/cli#9247). Accept both, so the
  // release path does not break on an npm major this repository never pinned.
  const payload = JSON.parse(result.stdout);
  const packages = Array.isArray(payload) ? payload : Object.values(payload);
  assert.equal(packages.length, 1, "npm pack should describe exactly one package");
  assert.ok(Array.isArray(packages[0]?.files), "npm pack did not report a file list");
  const packed = packages[0].files.map((file) => file.path.replaceAll("\\", "/")).sort();
  assert.deepEqual(packed, EXPECTED, "npm package contents differ from the reviewed allowlist");
  process.stdout.write(`Package contents passed: ${packed.length} files\n`);
} finally {
  await rm(cache, { force: true, recursive: true });
}
