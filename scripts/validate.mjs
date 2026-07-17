#!/usr/bin/env node

import { access, readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_NAME = "write-agora-marketing";
const SKILL_ROOT = join(ROOT, SKILL_NAME);
const REQUIRED_SKILL_FILES = [
  "SKILL.md",
  "agents/openai.yaml",
  "references/agora-marketing.md",
].sort((a, b) => a.localeCompare(b));
const errors = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(root, base = root, ignored = new Set()) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (ignored.has(entry.name)) continue;
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(path, base, ignored)));
    } else if (entry.isFile()) {
      files.push(relative(base, path).replaceAll("\\", "/"));
    }
  }
  return files;
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;
  const fields = new Map();
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || /^\s/.test(line)) continue;
    const field = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (field) fields.set(field[1], field[2].trim().replace(/^['"]|['"]$/g, ""));
  }
  return fields;
}

function relativeLinks(markdown) {
  const links = [];
  const pattern = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^)]*)?\)/g;
  for (const match of markdown.matchAll(pattern)) {
    const target = match[1].replace(/^<|>$/g, "");
    if (/^(?:[a-z]+:|#)/i.test(target)) continue;
    links.push(decodeURIComponent(target.split(/[?#]/, 1)[0]));
  }
  return links;
}

async function validateRelativeLinks(file) {
  const markdown = await readFile(file, "utf8");
  for (const link of relativeLinks(markdown)) {
    const target = resolve(dirname(file), link);
    check(
      await exists(target),
      `${relative(ROOT, file)} has a broken relative reference: ${link}`,
    );
  }
}

async function main() {
  const skillFiles = await listFiles(SKILL_ROOT);
  check(
    JSON.stringify(skillFiles) === JSON.stringify(REQUIRED_SKILL_FILES),
    `skill folder must contain only ${REQUIRED_SKILL_FILES.join(", ")}; found ${skillFiles.join(", ")}`,
  );

  const skillPath = join(SKILL_ROOT, "SKILL.md");
  const skill = await readFile(skillPath, "utf8");
  const frontmatter = parseFrontmatter(skill);
  check(frontmatter !== null, "SKILL.md must have YAML frontmatter");
  if (frontmatter) {
    check(
      JSON.stringify([...frontmatter.keys()]) === JSON.stringify(["name", "description"]),
      "SKILL.md frontmatter must contain only name and description",
    );
    check(frontmatter.get("name") === SKILL_NAME, "SKILL.md name must match its folder");
    check(
      (frontmatter.get("description") || "").length <= 1024,
      "SKILL.md description must be at most 1024 characters",
    );
  }
  check(skill.split(/\r?\n/).length < 500, "SKILL.md must stay under 500 lines");
  check(
    skill.includes("Treat `/write-agora-marketing` as explicit activation"),
    "SKILL.md must preserve the direct invocation contract",
  );
  check(
    skill.includes("[references/agora-marketing.md](references/agora-marketing.md)"),
    "SKILL.md must link its canonical reference",
  );

  const referencePath = join(SKILL_ROOT, "references", "agora-marketing.md");
  const reference = await readFile(referencePath, "utf8");
  for (const required of [
    "## Evidence register",
    "## Human voice and AI-writing-tell gate",
    "## Written GEO/AEO and citability gate",
    "When this file is used outside CiteSurge",
  ]) {
    check(reference.includes(required), `canonical reference is missing: ${required}`);
  }

  const openaiYaml = await readFile(join(SKILL_ROOT, "agents", "openai.yaml"), "utf8");
  check(/^interface:\r?$/m.test(openaiYaml), "agents/openai.yaml must define interface");
  for (const field of ["display_name", "short_description", "default_prompt"]) {
    check(new RegExp(`^  ${field}:`, "m").test(openaiYaml), `agents/openai.yaml is missing ${field}`);
  }
  check(
    openaiYaml.includes("$write-agora-marketing"),
    "agents/openai.yaml default_prompt must invoke the skill",
  );

  const repoFiles = await listFiles(ROOT, ROOT, new Set([".git", "node_modules", "08-agora-marketing.md"]));
  const scanExtensions = new Set([".md", ".mjs", ".json", ".yaml", ".yml", ".svg"]);
  const forbidden = [
    { pattern: /\[(?:TODO|TBD)(?::[^\]]*)?\]/i, label: "TODO marker" },
    { pattern: new RegExp(`\\bPLACE${"HOLDER"}\\b`, "i"), label: "unfinished marker" },
    { pattern: /\bturn\d+(?:search|fetch|view|open)\d+\b/i, label: "temporary citation token" },
  ];
  for (const file of repoFiles.filter((file) => scanExtensions.has(extname(file)))) {
    const content = await readFile(join(ROOT, file), "utf8");
    for (const item of forbidden) {
      check(!item.pattern.test(content), `${file} contains ${item.label}`);
    }
  }

  for (const file of repoFiles.filter((file) => extname(file) === ".md")) {
    await validateRelativeLinks(join(ROOT, file));
  }

  check(await exists(join(ROOT, "assets", "agora-orbit.svg")), "README hero SVG is missing");
  check(await exists(join(ROOT, "scripts", "install.mjs")), "installer is missing");

  if (errors.length > 0) {
    process.stderr.write("Validation failed:\n");
    for (const error of errors) process.stderr.write(`- ${error}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`Validation passed: ${SKILL_NAME}\n`);
}

await main();
