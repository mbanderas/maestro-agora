#!/usr/bin/env node

import { access, readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_NAME = "agora";
const SKILL_ROOT = join(ROOT, "skills", SKILL_NAME);
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
    if (entry.isDirectory()) files.push(...(await listFiles(path, base, ignored)));
    if (entry.isFile()) files.push(relative(base, path).replaceAll("\\", "/"));
  }
  return files;
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;
  const fields = new Map();
  for (const line of match[1].split(/\r?\n/)) {
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
    check(await exists(resolve(dirname(file), link)), `${relative(ROOT, file)} has a broken link: ${link}`);
  }
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    check(false, `${relative(ROOT, file)} is not valid JSON: ${error.message}`);
    return {};
  }
}

async function pngDimensions(file) {
  const image = await readFile(file);
  check(image.length >= 24 && image.subarray(1, 4).toString("ascii") === "PNG", `${relative(ROOT, file)} must be PNG`);
  return image.length >= 24
    ? { width: image.readUInt32BE(16), height: image.readUInt32BE(20) }
    : { width: 0, height: 0 };
}

async function main() {
  const skillFiles = await listFiles(SKILL_ROOT);
  check(
    JSON.stringify(skillFiles) === JSON.stringify(REQUIRED_SKILL_FILES),
    `skill folder must contain only ${REQUIRED_SKILL_FILES.join(", ")}; found ${skillFiles.join(", ")}`,
  );

  const skillPath = join(SKILL_ROOT, "SKILL.md");
  const referencePath = join(SKILL_ROOT, "references", "agora-marketing.md");
  const openaiPath = join(SKILL_ROOT, "agents", "openai.yaml");
  const [skill, reference, openaiYaml] = await Promise.all([
    readFile(skillPath, "utf8"),
    readFile(referencePath, "utf8"),
    readFile(openaiPath, "utf8"),
  ]);

  for (const [file, content] of [
    ["skills/agora/SKILL.md", skill],
    ["skills/agora/references/agora-marketing.md", reference],
    ["skills/agora/agents/openai.yaml", openaiYaml],
  ]) {
    check(!content.includes("\r\n"), `${file} must use LF line endings`);
  }

  const frontmatter = parseFrontmatter(skill);
  check(frontmatter !== null, "SKILL.md must have YAML frontmatter");
  if (frontmatter) {
    check(
      JSON.stringify([...frontmatter.keys()]) === JSON.stringify(["name", "description"]),
      "SKILL.md frontmatter must contain only name and description",
    );
    check(frontmatter.get("name") === SKILL_NAME, "SKILL.md name must match its folder");
    check((frontmatter.get("description") || "").length <= 1024, "SKILL.md description must be at most 1024 characters");
    const description = frontmatter.get("description") || "";
    for (const trigger of [
      "Write, rewrite, shorten, critique, or plan",
      "marketing and sales copy",
      "CTAs and microcopy",
      "landing, product, and comparison pages",
      "email and direct outreach",
      "mobile onboarding, upgrade, and paywall screens",
      "ads and social posts",
      "editorial or educational content",
      "spoken audio/video scripts plus written derivatives",
    ]) {
      check(description.includes(trigger), `SKILL.md description lost trigger breadth: ${trigger}`);
    }
  }

  check(skill.split(/\r?\n/).length < 500, "SKILL.md must stay under 500 lines");
  for (const required of [
    "Treat `/agora` as explicit activation",
    "[references/agora-marketing.md](references/agora-marketing.md)",
    "Load the authority progressively",
    "Do not confuse mode with surface",
    "Directory placement or an investor-adjacent audience does not activate `INVEST` by itself",
    "situation -> stake -> criterion or broken assumption when useful -> mechanism -> proof -> destination belief -> next step",
    "reasoning engine, not a visible template",
    "Do not force the full argument path",
    "draft a trigger-first sentence before any category sentence",
    "Do not retreat to taxonomy merely because quantified impact is missing",
    "For very short `SELL` work with no outcome proof",
    "Do not weaken it into generic words",
    "decision relevance, differentiation, verifiability, specificity, compression value, and omission risk",
    "Keep factual enumerations",
    "Never invent or imply claims, features, prices, routes, results, traction",
    "Keep these passes invisible",
    "Return one ready-to-use result first",
    "Do not generate em dashes or curly or smart quotes",
    "preserve necessary factual series",
  ]) {
    check(skill.includes(required), `SKILL.md is missing: ${required}`);
  }
  for (const mode of ["POSITION", "SELL", "INVEST", "INFORM", "TRANSACT"]) {
    check(skill.includes(`\`${mode}\``), `SKILL.md must define ${mode}`);
  }
  for (const surface of [
    "INDEXABLE_PUBLIC",
    "PUBLIC_NON_INDEXABLE_WRITTEN",
    "WRITTEN_PRIVATE",
    "SPOKEN_ONLY",
    "HYBRID",
  ]) {
    check(skill.includes(`\`${surface}\``), `SKILL.md must define ${surface}`);
  }

  for (const required of [
    "## Contents",
    "## Core doctrine",
    "## Conflict hierarchy",
    "## Commercial routing",
    "## Surface routing",
    "## Argument engine",
    "## Emotion as consequential meaning",
    "## Proof salience",
    "## Truth and ethical limits",
    "## Short, medium, and long forms",
    "## Channel architecture",
    "## Spoken delivery",
    "## Human voice and AI-writing-tell gate",
    "### Global output bans",
    "### AI-heavy vocabulary",
    "### Stock templates and significance tails",
    "### Structural tells",
    "## Written GEO/AEO and citability",
    "## Technical publication boundaries",
    "## Applied weak and strong pairs",
    "### Company positioning",
    "### Investor description",
    "### Hero",
    "### Paywall",
    "### Cold email",
    "### Spoken pitch",
    "### Necessary enumeration",
    "## Evaluation contract",
    "## Evidence register",
    "## Evidence maintenance",
    "Keep factual enumeration when the list itself is diagnostic",
    "derive the opening from the mechanism's verified trigger",
    "Preserve necessary enumerations",
    "Do not restate the same evidence to make the email feel fuller",
    "Omit implementation-status facts such as route availability",
    "End on one supported consequence, decision, or form of agency",
    "Rank facts separately for each asset",
    "Do not force every supplied fact into both",
    "internal workflow labels",
    "Treat an existence-only route, screen, page, preview, or report as action availability",
    "Do not turn it into a body-copy claim",
  ]) {
    check(reference.includes(required), `canonical reference is missing: ${required}`);
  }

  check(/^interface:\r?$/m.test(openaiYaml), "agents/openai.yaml must define interface");
  check(openaiYaml.includes('display_name: "Maestro: Agora"'), "agents/openai.yaml has the wrong display name");
  check(openaiYaml.includes('short_description: "Argument-first copy that earns belief"'), "agents/openai.yaml has the wrong short description");
  check(
    openaiYaml.includes('default_prompt: "Use $agora to turn verified facts into the strongest channel-native argument the evidence can support."'),
    "agents/openai.yaml has the wrong default prompt",
  );

  const packageJson = await readJson(join(ROOT, "package.json"));
  const gitAttributes = await readFile(join(ROOT, ".gitattributes"), "utf8");
  check(packageJson.name === "@maestroagora/agora", "package name must match the public package");
  check(packageJson.version === "1.2.2", "package version must be 1.2.2");
  check(packageJson.bin?.agora === "scripts/install.mjs", "package must expose the agora bin");
  check(packageJson.license === "MIT", "package must use MIT");
  check(/^\* text=auto eol=lf$/m.test(gitAttributes), "Git must enforce LF for text files");
  check(/^\*\.png binary$/m.test(gitAttributes), "Git must preserve PNG files as binary");

  const codexPlugin = await readJson(join(ROOT, ".codex-plugin", "plugin.json"));
  const claudePlugin = await readJson(join(ROOT, ".claude-plugin", "plugin.json"));
  check(codexPlugin.name === "maestro-agora", "Codex plugin ID must be maestro-agora");
  check(codexPlugin.version === packageJson.version, "Codex plugin version must match package");
  check(codexPlugin.skills === "./skills/", "Codex plugin must expose skills");
  check(codexPlugin.interface?.shortDescription === "Argument-first copy that earns belief", "Codex short description is stale");
  check(
    Array.isArray(codexPlugin.interface?.defaultPrompt) &&
      codexPlugin.interface.defaultPrompt.length === 3 &&
      codexPlugin.interface.defaultPrompt.every((prompt) => prompt.startsWith("/agora ") && prompt.length <= 128),
    "Codex default prompts must activate /agora and fit the client limit",
  );
  check(claudePlugin.version === packageJson.version, "Claude plugin version must match package");

  const codexMarketplace = await readJson(join(ROOT, ".agents", "plugins", "marketplace.json"));
  const codexListing = codexMarketplace.plugins?.find((plugin) => plugin.name === "maestro-agora");
  check(codexListing?.source?.url === "https://github.com/mbanderas/maestro-agora.git", "Codex marketplace URL is wrong");
  const claudeMarketplace = await readJson(join(ROOT, ".claude-plugin", "marketplace.json"));
  check(claudeMarketplace.plugins?.some((plugin) => plugin.name === "maestro-agora"), "Claude marketplace is missing Agora");

  const repoFiles = await listFiles(ROOT, ROOT, new Set([".git", "node_modules"]));
  const scanExtensions = new Set([".md", ".mjs", ".json", ".yaml", ".yml", ".svg"]);
  const forbidden = [
    { pattern: /\[(?:TODO|TBD)(?::[^\]]*)?\]/i, label: "TODO marker" },
    { pattern: new RegExp(`\\b${["PLACE", "HOLDER"].join("")}\\b`, "i"), label: "unfinished marker" },
    { pattern: /\bturn\d+(?:search|fetch|view|open|file)\d+\b/i, label: "temporary citation token" },
    { pattern: /sandbox:\/\/mnt\/data/i, label: "temporary research path" },
    { pattern: new RegExp(["cite", "surge"].join(""), "i"), label: "project-specific residue" },
    { pattern: new RegExp(["write", "agora", "marketing"].join("-"), "i"), label: "legacy skill alias" },
    { pattern: /promotional\s+concept/i, label: "prohibited visual-caption phrase" },
  ];
  for (const file of repoFiles.filter((file) => scanExtensions.has(extname(file)))) {
    const content = await readFile(join(ROOT, file), "utf8");
    for (const item of forbidden) check(!item.pattern.test(content), `${file} contains ${item.label}`);
  }

  for (const file of [
    "README.md",
    "package.json",
    ".agents/plugins/marketplace.json",
    ".claude-plugin/marketplace.json",
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "skills/agora/SKILL.md",
    "skills/agora/references/agora-marketing.md",
  ]) {
    const content = await readFile(join(ROOT, file), "utf8");
    check(!/[\u2014\u2018\u2019\u201c\u201d]/.test(content), `${file} contains banned typography`);
  }

  for (const file of repoFiles.filter((file) => extname(file) === ".md")) {
    await validateRelativeLinks(join(ROOT, file));
  }

  const banner = await pngDimensions(join(ROOT, "assets", "maestro-agora-banner.png"));
  const icon = await pngDimensions(join(ROOT, "assets", "icon.png"));
  check(banner.width === banner.height * 3, "README banner must be exactly 3:1");
  check(icon.width === icon.height, "plugin icon must be square");
  const workflowSvg = await readFile(join(ROOT, "assets", "agora-orbit.svg"), "utf8");
  check(workflowSvg.includes("prefers-reduced-motion"), "workflow SVG must support reduced motion");
  check(workflowSvg.includes("pen-stroke"), "workflow SVG must preserve the pen-stroke motif");

  if (errors.length > 0) {
    process.stderr.write("Validation failed:\n");
    for (const error of errors) process.stderr.write(`- ${error}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`Validation passed: ${SKILL_NAME}\n`);
}

await main();
