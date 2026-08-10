#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { lstat, readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TEXT_SIZE_LIMIT = 2 * 1024 * 1024;

const ALLOWED_TOP_LEVEL = new Set([
  ".agents",
  ".claude-plugin",
  ".codex-plugin",
  ".gitattributes",
  ".github",
  ".gitignore",
  "AGENTS.md",
  "LICENSE",
  "README.md",
  "assets",
  "evals",
  "package-lock.json",
  "package.json",
  "scripts",
  "skills",
  "tests",
]);

const FORBIDDEN_EXTENSIONS = new Set([
  ".7z",
  ".aac",
  ".ass",
  ".avi",
  ".doc",
  ".docx",
  ".flac",
  ".m4a",
  ".mkv",
  ".mov",
  ".mp3",
  ".mp4",
  ".ogg",
  ".pdf",
  ".ppt",
  ".pptx",
  ".rar",
  ".srt",
  ".ttml",
  ".vtt",
  ".wav",
  ".webm",
  ".xls",
  ".xlsx",
  ".zip",
]);

const APPROVED_BINARY_FILES = new Set([
  "assets/icon.png",
  "assets/maestro-agora-banner.png",
]);

const FORBIDDEN_PATH_PARTS = [
  /(^|\/)\.env(?:\.|$)/i,
  /(^|\/)\.private(\/|$)/i,
  /(^|\/)\.tmp(\/|$)/i,
  /(^|\/)downloads?(\/|$)/i,
  /(^|\/)local(\/|$)/i,
  /(^|\/)private-research(\/|$)/i,
  /(^|\/)(?:raw|corrected)[-_ ]?transcripts?(?:[./_-]|$)/i,
  /(^|\/)source[-_ ]?manifest(?:[./_-]|$)/i,
  /(^|\/)correction[-_ ]?notes?(?:[./_-]|$)/i,
  /(^|\/)(?:raw[-_ ]?)?model[-_ ]?outputs?(?:[./_-]|$)/i,
];

const SECRET_PATTERNS = [
  { label: "private key material", pattern: new RegExp(["BEGIN", "PRIVATE", "KEY"].join("[ _-]+"), "i") },
  { label: "GitHub token prefix", pattern: new RegExp(["gh", "p_"].join(""), "i") },
  { label: "Slack token prefix", pattern: new RegExp(["xo", "xb-"].join(""), "i") },
  { label: "AWS access key prefix", pattern: new RegExp(["AK", "IA[0-9A-Z]{16}"].join("")) },
  { label: "OpenAI secret prefix", pattern: new RegExp(["(?:^|[^A-Za-z0-9])s", "k-(?:proj-)?[A-Za-z0-9_-]{20,}"].join("")) },
  { label: "generic assigned secret", pattern: /(?:api[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token|password)\s*[:=]\s*["'][^"'\r\n]{8,}["']/i },
];

const LOCAL_PATH_PATTERNS = [
  /[A-Za-z]:[\\/]Users[\\/][^\s"'<>]+/i,
  /\/(?:Users|home)\/[^\s"'<>]+/,
];

function normalizePath(value) {
  return value.replaceAll("\\", "/").replace(/^\.\//, "");
}

async function walk(root, base = root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if ([".git", "node_modules", ".tmp", ".private", "research"].includes(entry.name)) continue;
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path, base)));
    if (entry.isFile()) files.push(normalizePath(relative(base, path)));
  }
  return files;
}

export function gitVisibleFiles(root) {
  const result = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.error || result.status !== 0) return null;
  return [...new Set(result.stdout.split("\0").filter(Boolean).map(normalizePath))].sort();
}

async function readPrivateTerms(root) {
  const path = join(root, ".tmp", "release-private-denylist.txt");
  try {
    const content = await readFile(path, "utf8");
    return content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function isProbablyBinary(buffer) {
  const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
  return sample.includes(0);
}

function hasForbiddenPrivateArtifactSignature(buffer) {
  const startsWith = (...bytes) => bytes.every((byte, index) => buffer[index] === byte);
  if (buffer.subarray(0, 5).toString("ascii") === "%PDF-") return true;
  if (startsWith(0x50, 0x4b, 0x03, 0x04) || startsWith(0x50, 0x4b, 0x05, 0x06) || startsWith(0x50, 0x4b, 0x07, 0x08)) return true;
  if (buffer.subarray(0, 4).toString("ascii") === "Rar!") return true;
  if (startsWith(0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c)) return true;
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF") return true;
  if (buffer.subarray(0, 3).toString("ascii") === "ID3") return true;
  if (buffer.subarray(0, 4).toString("ascii") === "OggS") return true;
  if (buffer.subarray(0, 4).toString("ascii") === "fLaC") return true;
  if (startsWith(0x1a, 0x45, 0xdf, 0xa3)) return true;
  return buffer.length >= 12 && buffer.subarray(4, 8).toString("ascii") === "ftyp";
}

export async function collectViolations({ root, files, privateTerms = [] }) {
  const violations = [];
  for (const input of files) {
    const file = normalizePath(input);
    const top = file.split("/", 1)[0];
    if (!ALLOWED_TOP_LEVEL.has(top)) {
      violations.push(`${file}: top-level path is not on the public repository allowlist`);
      continue;
    }

    if (FORBIDDEN_EXTENSIONS.has(extname(file).toLowerCase())) {
      violations.push(`${file}: private-source or archive file type is forbidden`);
      continue;
    }

    if (FORBIDDEN_PATH_PARTS.some((pattern) => pattern.test(file))) {
      violations.push(`${file}: path looks like private research, transcript, local, or generated evidence custody`);
      continue;
    }

    const absolute = resolve(root, file);
    const info = await lstat(absolute).catch(() => null);
    if (info?.isSymbolicLink()) {
      violations.push(`${file}: symbolic links are forbidden in public release custody`);
      continue;
    }
    if (!info?.isFile()) {
      violations.push(`${file}: listed public file is missing or not a regular file`);
      continue;
    }

    const buffer = await readFile(absolute);
    if (hasForbiddenPrivateArtifactSignature(buffer)) {
      violations.push(`${file}: content has a forbidden private-artifact signature`);
      continue;
    }
    if (isProbablyBinary(buffer)) {
      if (!APPROVED_BINARY_FILES.has(file)) {
        violations.push(`${file}: unexpected binary file`);
      }
      continue;
    }
    if (buffer.length > TEXT_SIZE_LIMIT) {
      violations.push(`${file}: text file exceeds ${TEXT_SIZE_LIMIT} bytes`);
      continue;
    }

    const content = buffer.toString("utf8");
    for (const { label, pattern } of SECRET_PATTERNS) {
      if (pattern.test(content)) violations.push(`${file}: contains ${label}`);
    }
    for (const pattern of LOCAL_PATH_PATTERNS) {
      if (pattern.test(content)) violations.push(`${file}: contains an absolute user-home path`);
    }
    const lowerFile = file.toLowerCase();
    const lowerContent = content.toLowerCase();
    privateTerms.forEach((term, index) => {
      const needle = term.toLowerCase();
      if (lowerFile.includes(needle) || lowerContent.includes(needle)) {
        violations.push(`${file}: contains private denylist entry ${index + 1}`);
      }
    });
  }
  return violations;
}

export async function runHygiene(root = DEFAULT_ROOT) {
  const files = gitVisibleFiles(root) ?? (await walk(root));
  const privateTerms = await readPrivateTerms(root);
  const violations = await collectViolations({ root, files, privateTerms });
  return { files, privateTerms, violations };
}

function isDirectRun() {
  return process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isDirectRun()) {
  const { files, privateTerms, violations } = await runHygiene();
  if (violations.length > 0) {
    process.stderr.write(`Release hygiene failed with ${violations.length} finding(s):\n`);
    for (const finding of violations) process.stderr.write(`- ${finding}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(
      `Release hygiene passed: ${files.length} public-tree files; private denylist entries loaded: ${privateTerms.length}\n`,
    );
  }
}
