#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Deliberately independent of npm's broader distribution and the working tree.
export const PLUGIN_FILES = [
  ".codex-plugin/plugin.json",
  "DISCLAIMER.md",
  "LICENSE",
  "PRIVACY.md",
  "assets/icon.png",
  "skills/agora/SKILL.md",
  "skills/agora/agents/openai.yaml",
  "skills/agora/references/agora-article-examples.md",
  "skills/agora/references/agora-article-runtime.md",
  "skills/agora/references/agora-case-studies.md",
  "skills/agora/references/agora-case-study-runtime.md",
  "skills/agora/references/agora-conversion.md",
  "skills/agora/references/agora-conversion-runtime.md",
  "skills/agora/references/agora-craft.md",
  "skills/agora/references/agora-invest.md",
  "skills/agora/references/agora-marketing.md",
  "skills/agora/references/agora-marketing-runtime.md",
  "skills/agora/references/agora-publication.md",
  "skills/agora/references/agora-science.md",
  "skills/agora/references/agora-voice.md",
  "skills/agora/references/agora-writing-runtime.md",
  "skills/agora/references/human-voice-editing-reference.md",
  "skills/agora/scripts/article-typography-check.mjs",
  "skills/agora/scripts/publication-audit.mjs",
  "skills/agora-start/SKILL.md",
  "skills/agora-start/agents/openai.yaml",
].sort();

export function validatePluginManifest(plugin) {
  assert.equal(plugin.name, "maestro-agora", "plugin name must stay stable");
  assert.match(plugin.version, /^\d+\.\d+\.\d+$/, "plugin version must be a release version");
  assert.equal(plugin.skills, "./skills/");
  const text = (value, limit, name) => {
    assert.equal(typeof value, "string", `${name} must be text`);
    assert.ok(value.trim().length > 0 && value.length <= limit, `${name} must contain 1-${limit} characters`);
  };
  text(plugin.description, 4000, "description");
  text(plugin.author?.name, 120, "author.name");
  const ui = plugin.interface;
  assert.ok(ui && typeof ui === "object", "interface is required");
  for (const [name, limit] of Object.entries({ displayName: 30, shortDescription: 30, longDescription: 4000, developerName: 80 })) {
    text(ui[name], limit, `interface.${name}`);
  }
  assert.equal(ui.category, "Productivity");
  assert.ok(Array.isArray(ui.capabilities) && ui.capabilities.length <= 20);
  for (const value of ui.capabilities) text(value, 120, "capability");
  assert.ok(Array.isArray(ui.defaultPrompt) && ui.defaultPrompt.length >= 1 && ui.defaultPrompt.length <= 3,
    "provide one to three starter prompts");
  assert.equal(new Set(ui.defaultPrompt).size, ui.defaultPrompt.length, "starter prompts must be unique");
  for (const prompt of ui.defaultPrompt) {
    text(prompt, 128, "starter prompt");
    assert.ok(!/[\r\n\t@]/.test(prompt), "starter prompts must be single-line text without app mentions");
  }
  for (const field of ["websiteURL", "supportURL", "privacyPolicyURL"]) {
    text(ui[field], 1024, field);
    const url = new URL(ui[field]);
    assert.ok(url.protocol === "https:" && !url.username && !url.password, `${field} must be a public HTTPS URL`);
  }
  for (const field of ["composerIcon", "logo"]) assert.equal(ui[field], "./assets/icon.png", `${field} must use the bundled icon`);
  assert.equal(plugin.extensions?.["com.openai"]?.onboardingSkill, "./skills/agora-start/SKILL.md");
  for (const field of ["apps", "mcpServers", "hooks"]) {
    assert.ok(!(field in plugin) && !(field in (plugin.extensions?.["com.openai"] ?? {})),
      `skills-only package must not declare ${field}`);
  }
  assert.ok(!("screenshots" in ui), "skills-only package must not declare screenshots");
}

async function readRegularFile(root, name) {
  let current = root;
  const parts = name.split("/");
  for (const [index, part] of parts.entries()) {
    current = join(current, part);
    const info = await lstat(current);
    assert.ok(!info.isSymbolicLink(), `package input must not be a symbolic link: ${name}`);
    assert.ok(index === parts.length - 1 ? info.isFile() : info.isDirectory(), `invalid package input: ${name}`);
  }
  return readFile(current);
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Standard ZIP with stored entries. The small package needs neither compression
// nor ZIP64. Fixed DOS timestamps make identical inputs yield identical archives.
function createZip(entries) {
  const local = [];
  const central = [];
  let offset = 0;
  for (const { name, bytes } of entries) {
    const encoded = Buffer.from(name, "utf8");
    const checksum = crc32(bytes);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x0800, 6);
    header.writeUInt16LE(0x0021, 12); // 1980-01-01
    header.writeUInt32LE(checksum, 14);
    header.writeUInt32LE(bytes.length, 18);
    header.writeUInt32LE(bytes.length, 22);
    header.writeUInt16LE(encoded.length, 26);
    local.push(header, encoded, bytes);

    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50, 0);
    directory.writeUInt16LE(20, 4);
    directory.writeUInt16LE(20, 6);
    directory.writeUInt16LE(0x0800, 8);
    directory.writeUInt16LE(0x0021, 14);
    directory.writeUInt32LE(checksum, 16);
    directory.writeUInt32LE(bytes.length, 20);
    directory.writeUInt32LE(bytes.length, 24);
    directory.writeUInt16LE(encoded.length, 28);
    directory.writeUInt32LE(offset, 42);
    central.push(directory, encoded);
    offset += header.length + encoded.length + bytes.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

export async function buildPlugin(root = ROOT) {
  const entries = await Promise.all(PLUGIN_FILES.map(async (name) => ({ name, bytes: await readRegularFile(root, name) })));
  const byName = new Map(entries.map(({ name, bytes }) => [name, bytes]));
  const plugin = JSON.parse(byName.get(".codex-plugin/plugin.json").toString("utf8"));
  validatePluginManifest(plugin);
  const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  assert.equal(plugin.version, pkg.version, "plugin and package versions must match");
  const icon = byName.get("assets/icon.png");
  assert.ok(icon.length >= 24 && icon.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), "icon must be PNG");
  const size = icon.readUInt32BE(16);
  assert.ok(size >= 48 && size <= 4096 && size === icon.readUInt32BE(20) && icon.length <= 5 * 1024 * 1024,
    "icon must be square, 48-4096 pixels, and at most 5 MiB");
  for (const { name, bytes } of entries.filter(({ name }) => name.endsWith(".md"))) {
    const markdown = bytes.toString("utf8");
    if (name.endsWith("/SKILL.md")) {
      assert.match(markdown, /^---\r?\nname: [a-z0-9-]+\r?\ndescription: [^\r\n]+\r?\n---/, `${name} needs skill frontmatter`);
    }
    for (const match of markdown.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^)]*)?\)/g)) {
      const target = match[1];
      if (/^(?:[a-z]+:|#)/i.test(target)) continue;
      const path = resolve(dirname(join(root, name)), decodeURIComponent(target.split(/[?#]/, 1)[0]));
      assert.ok(entries.some((entry) => resolve(root, entry.name) === path), `${name} links outside the archive: ${target}`);
    }
  }
  const zip = createZip(entries);
  assert.ok(zip.length <= 100 * 1024 * 1024, "plugin ZIP exceeds the upload limit");
  return { zip, files: entries.map(({ name }) => name), version: plugin.version, sha256: createHash("sha256").update(zip).digest("hex") };
}

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.length === 1 && args[0] === "--check";
  const customOutput = args.length === 2 && args[0] === "--output";
  assert.ok(args.length === 0 || checkOnly || customOutput, "Usage: node scripts/plugin-package.mjs [--check | --output file.zip]");
  const result = await buildPlugin();
  if (checkOnly) {
    process.stdout.write(`Plugin package checked: ${result.files.length} files, ${result.zip.length} bytes\n`);
    return;
  }
  const output = resolve(customOutput ? args[1] : join(ROOT, "dist", `maestro-agora-${result.version}.zip`));
  assert.ok(output.endsWith(".zip"), "output must be a .zip file");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, result.zip, { flag: "wx" });
  process.stdout.write(`Plugin ZIP: ${output}\nFiles: ${result.files.length}\nSHA-256: ${result.sha256}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`Plugin packaging failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
