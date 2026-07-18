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
  check(
    image.length >= 24 && image.subarray(1, 4).toString("ascii") === "PNG",
    `${relative(ROOT, file)} must be a PNG image`,
  );
  return image.length >= 24
    ? { height: image.readUInt32BE(20), width: image.readUInt32BE(16) }
    : { height: 0, width: 0 };
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
    const triggerDescription = frontmatter.get("description") || "";
    for (const requiredTrigger of [
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
      check(
        triggerDescription.includes(requiredTrigger),
        `SKILL.md description must preserve trigger breadth: ${requiredTrigger}`,
      );
    }
  }
  check(skill.split(/\r?\n/).length < 500, "SKILL.md must stay under 500 lines");
  check(
    skill.includes("Treat `/agora` as explicit activation"),
    "SKILL.md must preserve the direct invocation contract",
  );
  check(
    skill.includes("[references/agora-marketing.md](references/agora-marketing.md)"),
    "SKILL.md must link its canonical reference",
  );
  check(
    skill.includes("Load the authority progressively"),
    "SKILL.md must load the canonical reference progressively",
  );
  check(
    skill.includes("and `Human voice and AI-writing-tell gate`."),
    "SKILL.md must always load the global human-voice gate",
  );
  for (const mode of ["SELL", "INVEST", "POSITION", "INFORM", "TRANSACT"]) {
    check(skill.includes(`\`${mode}\``), `SKILL.md must define the ${mode} mode`);
  }
  check(
    skill.includes("An explicit mode wins"),
    "SKILL.md must let an explicit mode override inference",
  );
  check(
    skill.includes("Do not confuse mode with surface"),
    "SKILL.md must route commercial mode and surface separately",
  );
  check(
    skill.includes("Recognizable reality -> consequence or opportunity -> new decision criterion -> company or product mechanism -> defensible destination belief -> action or investment relevance"),
    "SKILL.md must preserve the mandatory commercial spine",
  );
  check(
    skill.includes("Moves may share sentences; none may disappear"),
    "SKILL.md must preserve every commercial-spine move",
  );
  check(
    skill.includes("Commercial job -> destination belief -> argument -> proof gate -> channel formatting -> written GEO/AEO when applicable -> AI-writing-tell edit -> compression"),
    "SKILL.md must preserve the exact construction order",
  );
  check(
    skill.includes("Channel rules cap tone without deleting the argument") &&
      skill.includes("For objective platforms such as Crunchbase, write the strongest objective argument permitted and explain any channel conflict after the copy"),
    "SKILL.md must preserve the objective-channel cap",
  );
  check(
    skill.includes("prove a premise, resolve an objection, or enable action"),
    "SKILL.md must require every fact to advance the argument",
  );
  check(
    skill.includes("category definition, claim-ledger paraphrase, or feature inventory"),
    "SKILL.md must reject non-persuasive fact restatements",
  );
  check(
    skill.includes("Reject primary brand verbs such as `shows`, `helps`, `supports`, or `built for`"),
    "SKILL.md must enforce the weak-primary-verb rule",
  );
  check(
    skill.includes("Return ready-to-use copy first"),
    "SKILL.md must return ready copy before notes",
  );
  check(
    skill.includes("Do not generate em dashes or curly or smart quotes in final copy"),
    "SKILL.md must enforce the global punctuation bans",
  );
  check(
    skill.includes("banned vocabulary, connectives, phrase templates, significance tails"),
    "SKILL.md must enforce the consolidated lexical and structural bans",
  );

  const referencePath = join(SKILL_ROOT, "references", "agora-marketing.md");
  const reference = await readFile(referencePath, "utf8");
  for (const required of [
    "## Core doctrine",
    "## The destination belief",
    "## Mechanism and company transformation",
    "## Commercial modes",
    "## Construction order",
    "## Evidence register",
    "## Rejection gates",
    "## Spoken delivery",
    "## Applied weak and strong pairs",
    "### Company positioning",
    "### Investor description",
    "### Hero",
    "### Paywall",
    "### Cold email",
    "### Spoken pitch",
    "## Human voice and AI-writing-tell gate",
    "### Global output bans",
    "### Banned vocabulary and connectives",
    "### Banned templates and significance tails",
    "### Banned structural and typography patterns",
    "## Written GEO/AEO and citability gate",
    "When this file is used outside CiteSurge",
    "Apply this gate to every Agora deliverable",
    "Wikipedia-style",
    "zero generated em dashes and zero curly or smart quotes",
    "zero generated tripartite templates",
  ]) {
    check(reference.includes(required), `canonical reference is missing: ${required}`);
  }
  const orderedReferenceSections = [
    "## Core doctrine",
    "## The destination belief",
    "## Mechanism and company transformation",
    "## Commercial modes",
    "## Construction order",
  ];
  const referenceIndexes = orderedReferenceSections.map((section) => reference.indexOf(section));
  check(
    referenceIndexes.every((index, position) => index >= 0 && (position === 0 || index > referenceIndexes[position - 1])),
    "canonical reference must lead with doctrine, destination belief, mechanism, modes, and construction order",
  );

  const openaiYaml = await readFile(join(SKILL_ROOT, "agents", "openai.yaml"), "utf8");
  check(/^interface:\r?$/m.test(openaiYaml), "agents/openai.yaml must define interface");
  for (const field of ["display_name", "short_description", "default_prompt"]) {
    check(new RegExp(`^  ${field}:`, "m").test(openaiYaml), `agents/openai.yaml is missing ${field}`);
  }
  check(
    openaiYaml.includes("$agora"),
    "agents/openai.yaml default_prompt must invoke the skill",
  );
  check(
    openaiYaml.includes('short_description: "Truthful arguments for buyers and investors"'),
    "agents/openai.yaml short_description must match the v1.1.0 contract",
  );
  check(
    openaiYaml.includes('default_prompt: "Use $agora to lead one audience from a real stake to a defensible buying or investment belief, then return ready-to-use copy."'),
    "agents/openai.yaml default_prompt must match the v1.1.0 contract",
  );

  const packageJson = await readJson(join(ROOT, "package.json"));
  check(packageJson.name === "@maestroagora/agora", "package name must match the public npm package");
  check(packageJson.version === "1.1.1", "package version must match the patch release");
  check(packageJson.bin?.agora === "scripts/install.mjs", "package must expose the agora bin");
  check(packageJson.license === "MIT", "package must declare the MIT license");

  const codexPlugin = await readJson(join(ROOT, ".codex-plugin", "plugin.json"));
  check(codexPlugin.name === "maestro-agora", "Codex plugin ID must be maestro-agora");
  check(codexPlugin.version === packageJson.version, "Codex plugin version must match package version");
  check(codexPlugin.skills === "./skills/", "Codex plugin must expose the skills directory");
  check(codexPlugin.interface?.displayName === "Maestro: Agora", "Codex display name must be Maestro: Agora");
  check(
    codexPlugin.interface?.composerIcon === "./assets/icon.png",
    "Codex plugin must use the Agora icon",
  );
  check(
    Array.isArray(codexPlugin.interface?.defaultPrompt) && codexPlugin.interface.defaultPrompt.length === 3,
    "Codex plugin must expose exactly three supported default prompts",
  );
  check(
    codexPlugin.interface.defaultPrompt.every(
      (prompt) => typeof prompt === "string" && prompt.length <= 128 && prompt.startsWith("/agora "),
    ),
    "every Codex default prompt must activate /agora and fit the 128-character client limit",
  );

  const claudePlugin = await readJson(join(ROOT, ".claude-plugin", "plugin.json"));
  check(claudePlugin.name === "maestro-agora", "Claude plugin ID must be maestro-agora");
  check(claudePlugin.version === packageJson.version, "Claude plugin version must match package version");
  check(claudePlugin.displayName === "Maestro: Agora", "Claude display name must be Maestro: Agora");

  const codexMarketplace = await readJson(join(ROOT, ".agents", "plugins", "marketplace.json"));
  const codexListing = codexMarketplace.plugins?.find((plugin) => plugin.name === "maestro-agora");
  check(Boolean(codexListing), "Codex marketplace must list maestro-agora");
  check(
    codexListing?.source?.url === "https://github.com/mbanderas/maestro-agora.git",
    "Codex marketplace must point at the public repository",
  );

  const claudeMarketplace = await readJson(join(ROOT, ".claude-plugin", "marketplace.json"));
  check(
    claudeMarketplace.plugins?.some((plugin) => plugin.name === "maestro-agora"),
    "Claude marketplace must list maestro-agora",
  );

  for (const file of [
    "README.md",
    "package.json",
    ".agents/plugins/marketplace.json",
    ".claude-plugin/marketplace.json",
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
  ]) {
    const content = await readFile(join(ROOT, file), "utf8");
    check(
      !/(?:\u2014|&mdash;|&#8212;|&#x2014;)/i.test(content),
      `${file} contains an em dash in public copy`,
    );
    check(
      !/(?:[\u2018\u2019\u201c\u201d]|&(?:ldquo|rdquo|lsquo|rsquo);|&#(?:8216|8217|8220|8221);|&#x(?:2018|2019|201c|201d);)/i.test(content),
      `${file} contains a curly or smart quote in public copy`,
    );
  }

  const repoFiles = await listFiles(ROOT, ROOT, new Set([".git", "node_modules", "08-agora-marketing.md"]));
  const scanExtensions = new Set([".md", ".mjs", ".json", ".yaml", ".yml", ".svg"]);
  const forbidden = [
    { pattern: /\[(?:TODO|TBD)(?::[^\]]*)?\]/i, label: "TODO marker" },
    { pattern: new RegExp(`\\bPLACE${"HOLDER"}\\b`, "i"), label: "unfinished marker" },
    { pattern: /\bturn\d+(?:search|fetch|view|open)\d+\b/i, label: "temporary citation token" },
    { pattern: new RegExp(["promotional", "concept"].join("\\s+"), "i"), label: "prohibited visual-caption phrase" },
    { pattern: new RegExp(["write", "agora", "marketing"].join("-"), "i"), label: "legacy skill alias" },
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

  check(await exists(join(ROOT, "assets", "agora-orbit.svg")), "workflow SVG is missing");
  check(await exists(join(ROOT, "assets", "maestro-agora-banner.png")), "README banner is missing");
  check(await exists(join(ROOT, "assets", "icon.png")), "plugin icon is missing");
  check(await exists(join(ROOT, "scripts", "install.mjs")), "installer is missing");

  const banner = await pngDimensions(join(ROOT, "assets", "maestro-agora-banner.png"));
  check(banner.width === banner.height * 3, "README banner must be exactly 3:1");
  const icon = await pngDimensions(join(ROOT, "assets", "icon.png"));
  check(icon.width === icon.height, "plugin icon must be square");

  const workflowSvg = await readFile(join(ROOT, "assets", "agora-orbit.svg"), "utf8");
  check(workflowSvg.includes("prefers-reduced-motion"), "workflow SVG must support reduced motion");
  check(workflowSvg.includes("pen-stroke"), "workflow SVG must preserve its pen-stroke motif");

  if (errors.length > 0) {
    process.stderr.write("Validation failed:\n");
    for (const error of errors) process.stderr.write(`- ${error}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`Validation passed: ${SKILL_NAME}\n`);
}

await main();
