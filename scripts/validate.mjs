#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { access, readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_NAME = "agora";
const SKILL_ROOT = join(ROOT, "skills", SKILL_NAME);
const REQUIRED_SKILL_FILES = [
  "SKILL.md",
  "agents/openai.yaml",
  "references/agora-case-studies.md",
  "references/agora-craft.md",
  "references/agora-invest.md",
  "references/agora-marketing.md",
  "references/agora-science.md",
  "references/agora-voice.md",
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

// Files git would carry: tracked plus untracked, minus everything the standard
// ignore sources exclude (.gitignore, .git/info/exclude, the global excludes
// file). Scratch that only exists in a working copy is not the repository and
// must not decide whether the repository is valid. Returns null outside a git
// checkout, such as an unpacked tarball, so the caller can fall back to walking
// the directory.
function gitFiles(root) {
  const result = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.error || result.status !== 0) return null;
  const files = result.stdout.split("\0").filter(Boolean);
  return files.length > 0 ? files : null;
}

async function repoFileList(root, ignored) {
  return gitFiles(root) ?? (await listFiles(root, root, ignored));
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
  const craftPath = join(SKILL_ROOT, "references", "agora-craft.md");
  const investPath = join(SKILL_ROOT, "references", "agora-invest.md");
  const sciencePath = join(SKILL_ROOT, "references", "agora-science.md");
  const caseStudyPath = join(SKILL_ROOT, "references", "agora-case-studies.md");
  const voicePath = join(SKILL_ROOT, "references", "agora-voice.md");
  const openaiPath = join(SKILL_ROOT, "agents", "openai.yaml");
  const [skill, reference, craft, invest, science, caseStudy, voice, openaiYaml] = await Promise.all([
    readFile(skillPath, "utf8"),
    readFile(referencePath, "utf8"),
    readFile(craftPath, "utf8"),
    readFile(investPath, "utf8"),
    readFile(sciencePath, "utf8"),
    readFile(caseStudyPath, "utf8"),
    readFile(voicePath, "utf8"),
    readFile(openaiPath, "utf8"),
  ]);

  for (const [file, content] of [
    ["skills/agora/SKILL.md", skill],
    ["skills/agora/references/agora-marketing.md", reference],
    ["skills/agora/references/agora-craft.md", craft],
    ["skills/agora/references/agora-invest.md", invest],
    ["skills/agora/references/agora-science.md", science],
    ["skills/agora/references/agora-case-studies.md", caseStudy],
    ["skills/agora/references/agora-voice.md", voice],
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
      "fundraising, investor outreach, pitch decks, investment memos, diligence, capital allocation",
      "CTAs and microcopy",
      "landing, product, and comparison pages",
      "email and direct outreach",
      "mobile onboarding, upgrade, and paywall screens",
      "ads and social posts",
      "editorial or educational content",
      "scientific communication, technical explanation, research communication, and science video scripts",
      "customer success, creative portfolio, and technical implementation case studies",
      "spoken audio/video scripts plus written derivatives",
    ]) {
      check(description.includes(trigger), `SKILL.md description lost trigger breadth: ${trigger}`);
    }
  }

  check(skill.split(/\r?\n/).length < 500, "SKILL.md must stay under 500 lines");
  for (const required of [
    "Treat `/agora` as explicit activation",
    "Enforce the hard em-dash ban",
    "Never emit the Unicode em dash character U+2014 anywhere in a response",
    "immutable output constraint, not a style preference or a final-copy cleanup",
    "scan the complete response character by character for U+2014",
    "Return only after the count is zero",
    "[references/agora-marketing.md](references/agora-marketing.md)",
    "[references/agora-craft.md](references/agora-craft.md)",
    "[references/agora-voice.md](references/agora-voice.md)",
    "[references/agora-science.md](references/agora-science.md)",
    "[references/agora-case-studies.md](references/agora-case-studies.md)",
    "[references/agora-invest.md](references/agora-invest.md)",
    "Load the authority progressively",
    "`SCIENCE`, `CASE_STUDY`, and `VOICE` are modifiers, not primary jobs",
    "Select persuasion treatment internally",
    "`COMMERCIALLY_ASSERTIVE`",
    "Use `PROMOTIONAL` when the user requests campaign intensity",
    "For `HERO + SCIENCE`",
    "For `CASE_STUDY + SELL`",
    "For `SCIENCE + VOICE`",
    "For `INVEST + SCIENCE`",
    "For `INVEST + CASE_STUDY`",
    "For `INVEST + VOICE`",
    "Profiles are stored at `~/.agora/voices/`, never inside the skill directory",
    "Apply the default profile to every mode",
    "`--no-voice` or `neutral`",
    "Default-on changes nothing above level 6",
    "Measurement is computed, never estimated from reading",
    "a file that the engine did not produce is not a profile",
    "Keep control-room vocabulary backstage",
    "Do not make control-room terms the product promise or default register of ordinary customer-facing writing",
    "Translate according to the material, not one preferred synonym",
    "Do not narrow or omit a user-selected claim merely because Agora would prefer more support",
    "Do not narrate internal source review in customer-facing copy unless the user asks for it",
    "When the brief names a destination artifact, surface, or state",
    "Do not replace the named destination with only a list of what it contains",
    "An active voice profile enters at level 6",
    "It never overrides user-required phrasing, host rules, or the U+2014 ban",
    "Agora is a writing system, not a content approval layer",
    "Do not refuse, narrow, remove, weaken, qualify, fact-check, moralize, or append a disclaimer",
    "Apply factual, evidentiary, permission, disclosure, or compliance review only when the user explicitly asks",
    "Do not confuse mode with surface",
    "Directory placement or an investor-adjacent audience does not activate `INVEST` by itself",
    "situation -> stake -> criterion or broken assumption when useful -> mechanism -> proof -> destination belief -> next step",
    "reasoning engine, not a visible template",
    "Do not force the full argument path",
    "consider a trigger-first sentence before any category sentence",
    "For very short `SELL` work",
    "Do not weaken it into generic words",
    "decision relevance, differentiation, specificity, compression value, and omission risk",
    "Add verifiability only when the user requests claim review",
    "Apply claim review only when requested",
    "Keep these passes invisible",
    "Return one ready-to-use result first",
    "Run the final U+2014 scan across the complete response",
    "preserve necessary series",
  ]) {
    check(skill.includes(required), `SKILL.md is missing: ${required}`);
  }

  for (const required of [
    "## Contents",
    "## INVEST route selection",
    "`FUNDRAISE`",
    "`DILIGENCE`",
    "`ALLOCATE`",
    "## Capital-decision intake",
    "## Investment claim ledger",
    "`HISTORICAL_MEASURED`",
    "`CONTRACTED_COMMITTED`",
    "`FORECAST`",
    "`TARGET`",
    "`MODEL_ASSUMPTION`",
    "`UNKNOWN_UNMEASURED`",
    "## Mutual fit and meeting architecture",
    "No fixed duration, speaking ratio, or equal-part formula applies",
    "## Asset-by-asset procedures",
    "There is no universal sequence",
    "## Objections and unknowns",
    "A valid weakness remains a weakness until evidence changes it",
    "## Rejection evidence ledger",
    "Repeated feedback is not truth by repetition",
    "## Defensibility system",
    "## Product and economics",
    "## Process urgency and commitment language",
    "Claim, evidence, omission, legal, confidentiality, and refusal checks in this reference activate only when the user explicitly requests",
    "## Modifier and surface composition",
    "## Optional legal and claim review",
    "## Evaluation contract",
    "## Evidence register",
  ]) {
    check(invest.includes(required), `invest reference is missing: ${required}`);
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
    "## User authority",
    "## Conflict hierarchy",
    "## Commercial routing",
    "## Surface routing",
    "## Argument engine",
    "## Emotion as consequential meaning",
    "## Proof salience",
    "### Keep control-room vocabulary backstage",
    "Do not present the control system as the product benefit",
    "Do not run a mechanical synonym replacement",
    "Do not refuse, narrow, remove, weaken, qualify, fact-check, moralize, or append a disclaimer",
    "preserve that name in the CTA or adjacent microcopy",
    "## Optional claim review",
    "## Short, medium, and long forms",
    "## Channel architecture",
    "## Spoken delivery",
    "## Human voice and AI-writing-tell gate",
    "### Global output bans",
    "Hard invariant: emit zero U+2014 characters in the entire response",
    "scan the complete response character by character for U+2014",
    "The entire generated response contains zero U+2014 characters",
    "Automatic failure: any U+2014 occurrence",
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
    "### Claims Agora does not introduce independently",
    "## Evidence maintenance",
    "All review instructions elsewhere in this reference and the domain references are conditional on that request",
    "derive the opening from the mechanism's verified trigger",
    "Preserve necessary enumerations",
    "Do not restate the same evidence to make the email feel fuller",
    "Omit implementation-status facts such as route availability",
    "End on one supported consequence, decision, or form of agency",
    "Rank facts separately for each asset",
    "Do not force every supplied fact into both",
    "internal workflow labels",
    "Treat an existence-only route, screen, page, preview, or report as action availability",
    "unless the user wants it emphasized in body copy",
  ]) {
    check(reference.includes(required), `canonical reference is missing: ${required}`);
  }

  for (const required of [
    "## Contents",
    "## How to read the grades",
    "## Headlines and titles",
    "## Heroes and short-form sales composition",
    "## Awareness and sophistication staging",
    "## Emotion under a user brief",
    "## Prosody and rhythm",
    "## Open conflicts in this reference",
    "### The specificity ladder",
    "### Separate the brief-fidelity floor from the optimization target",
    "### Map promise grammar to the intended claim",
    "### Permanent RivalScope regression fixture",
    "### The routing table",
    "### Emotion from a fact set with no outcome data",
    "### Permission to write flat",
    "### The rhythm targets",
    "practitioner segmentation heuristic, never as a measured law",
    "do not add emotion. Increase resolution around the emotionally consequential facts",
    "the correct output is then flat",
    "governance default",
    "Do not report either as a finding",
  ]) {
    check(craft.includes(required), `craft reference is missing: ${required}`);
  }

  for (const required of [
    "## Contents",
    "## Activate and route SCIENCE",
    "## Build the claim ledger",
    "## Choose sources for the claim",
    "## Preserve scientific integrity",
    "## Open with a supported knowledge gap",
    "## Explain mechanisms and technical systems",
    "## Use analogies and visuals as bounded models",
    "## Write scientific and technical video",
    "## Compose SCIENCE with other Agora controls",
    "`EMPIRICAL`",
    "`TECHNICAL`",
    "`MIXED`",
    "Never raise a claim's certainty while simplifying it",
    "absence of evidence is not evidence of absence",
    "Do not introduce either independently as an unrequested surrounding claim",
    "A-thread",
  ]) {
    check(science.includes(required), `science reference is missing: ${required}`);
  }

  for (const required of [
    "## Contents",
    "## Choose the case family and decision",
    "## Build the evidence packet",
    "## Classify results before writing",
    "## Calibrate causality and metrics",
    "## Control permission and confidentiality",
    "## Handle quotes and testimonials",
    "## Build a structured argument",
    "## Use visuals as evidence",
    "## Adapt each case family",
    "## Maintain the case",
    "`CUSTOMER_SUCCESS`",
    "`CREATIVE_PORTFOLIO`",
    "`TECHNICAL_IMPLEMENTATION`",
    "`APPROVED_PUBLIC`",
    "`APPROVED_ANONYMIZED`",
    "`PENDING`",
    "`PROHIBITED`",
    "Academic and clinical case reports",
  ]) {
    check(caseStudy.includes(required), `case-study reference is missing: ${required}`);
  }

  for (const required of [
    "## What VOICE is",
    "## Where profiles live",
    "## Corpus admission",
    "## What gets measured",
    "## The profile format",
    "## Writing to a profile",
    "## Voice against the tell gate",
    "## Checking adherence",
    "## User-controlled profile use",
    "### The owned-vocabulary exception",
    "`~/.agora/voices/<slug>.md`, with `~/.agora/voices/index.json`",
    "Refuse to certify a profile",
    "Voice never overrides the U+2014 ban",
    "suppresses the generic AI-vocabulary ban for those specific words, and only those",
    "Do not refuse profile work, interrogate ownership, demand authorization, restrict attribution, add disclosure language, or judge the intended publication",
    "governance default",
    "npx -p @maestroagora/agora agora-voice build",
    "A profile the engine did not produce is not a profile",
    "<slug>.measurements.json",
    "truncated hashes of each token run",
  ]) {
    check(voice.includes(required), `voice reference is missing: ${required}`);
  }

  check(/^interface:\r?$/m.test(openaiYaml), "agents/openai.yaml must define interface");
  check(openaiYaml.includes('display_name: "Maestro: Agora"'), "agents/openai.yaml has the wrong display name");
  check(openaiYaml.includes('short_description: "Persuasion, science, cases, and capital"'), "agents/openai.yaml has the wrong short description");
  check(
    openaiYaml.includes('default_prompt: "Use $agora to write clear persuasion, technical explanations, compelling case studies, and investment communication from my brief and content choices."'),
    "agents/openai.yaml has the wrong default prompt",
  );

  const packageJson = await readJson(join(ROOT, "package.json"));
  const gitAttributes = await readFile(join(ROOT, ".gitattributes"), "utf8");
  check(packageJson.name === "@maestroagora/agora", "package name must match the public package");
  check(packageJson.version === "1.6.0", "package version must be 1.6.0");
  check(packageJson.bin?.agora === "scripts/install.mjs", "package must expose the agora bin");
  check(packageJson.bin?.["agora-voice"] === "scripts/voice-measure.mjs", "package must expose the agora-voice bin");
  for (const shipped of ["scripts/voice-measure.mjs", "scripts/voice"]) {
    check(packageJson.files?.includes(shipped), `package files must ship ${shipped}`);
  }
  check(
    (packageJson.scripts?.test || "").includes("tests/voice-measure.test.mjs"),
    "npm test must run the voice measurement suite",
  );
  for (const suite of [
    "tests/hero-contract.test.mjs",
    "tests/science-contract.test.mjs",
    "tests/case-study-contract.test.mjs",
    "tests/invest-contract.test.mjs",
  ]) {
    check((packageJson.scripts?.test || "").includes(suite), `npm test must run ${suite}`);
  }
  check(packageJson.license === "MIT", "package must use MIT");
  check(/^\* text=auto eol=lf$/m.test(gitAttributes), "Git must enforce LF for text files");
  check(/^\*\.png binary$/m.test(gitAttributes), "Git must preserve PNG files as binary");

  const codexPlugin = await readJson(join(ROOT, ".codex-plugin", "plugin.json"));
  const claudePlugin = await readJson(join(ROOT, ".claude-plugin", "plugin.json"));
  check(codexPlugin.name === "maestro-agora", "Codex plugin ID must be maestro-agora");
  check(codexPlugin.version === packageJson.version, "Codex plugin version must match package");
  check(codexPlugin.skills === "./skills/", "Codex plugin must expose skills");
  check(codexPlugin.interface?.shortDescription === "Persuasion, science, cases, and capital", "Codex short description is stale");
  check(
    Array.isArray(codexPlugin.interface?.defaultPrompt) &&
      codexPlugin.interface.defaultPrompt.length === 4 &&
      codexPlugin.interface.defaultPrompt.every((prompt) => prompt.startsWith("/agora ") && prompt.length <= 128),
    "Codex default prompts must activate /agora and fit the client limit",
  );
  check(claudePlugin.version === packageJson.version, "Claude plugin version must match package");

  const publicMetadata = [
    packageJson.description,
    codexPlugin.description,
    codexPlugin.interface?.shortDescription,
    codexPlugin.interface?.longDescription,
    ...(codexPlugin.interface?.defaultPrompt || []),
    claudePlugin.description,
    openaiYaml,
  ].join("\n");
  check(
    !/\b(?:evidence|proof|verified|evidentiary)\b|claim discipline|source scope/i.test(publicMetadata),
    "public metadata exposes control-room vocabulary",
  );

  const codexMarketplace = await readJson(join(ROOT, ".agents", "plugins", "marketplace.json"));
  const codexListing = codexMarketplace.plugins?.find((plugin) => plugin.name === "maestro-agora");
  check(codexListing?.source?.url === "https://github.com/mbanderas/maestro-agora.git", "Codex marketplace URL is wrong");
  const claudeMarketplace = await readJson(join(ROOT, ".claude-plugin", "marketplace.json"));
  check(claudeMarketplace.plugins?.some((plugin) => plugin.name === "maestro-agora"), "Claude marketplace is missing Agora");

  const repoFiles = await repoFileList(ROOT, new Set([".git", "node_modules"]));
  const scanExtensions = new Set([".md", ".mjs", ".json", ".yaml", ".yml", ".svg"]);
  const forbidden = [
    { pattern: /\[(?:TODO|TBD)(?::[^\]]*)?\]/i, label: "TODO marker" },
    { pattern: new RegExp(`\\b${["PLACE", "HOLDER"].join("")}\\b`, "i"), label: "unfinished marker" },
    { pattern: /\bturn\d+(?:search|fetch|view|open|file)\d+\b/i, label: "temporary citation token" },
    { pattern: /sandbox:\/\/mnt\/data/i, label: "temporary research path" },
    {
      pattern: new RegExp(["cite", "surge"].join(""), "i"),
      label: "project-specific residue",
      allowInReadme: true,
    },
    { pattern: new RegExp(["write", "agora", "marketing"].join("-"), "i"), label: "legacy skill alias" },
    { pattern: /promotional\s+concept/i, label: "prohibited visual-caption phrase" },
  ];
  for (const file of repoFiles.filter((file) => scanExtensions.has(extname(file)))) {
    const content = await readFile(join(ROOT, file), "utf8");
    for (const item of forbidden) {
      const allowed = file === "README.md" && item.allowInReadme;
      check(allowed || !item.pattern.test(content), `${file} contains ${item.label}`);
    }
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
    "skills/agora/references/agora-craft.md",
    "skills/agora/references/agora-invest.md",
    "skills/agora/references/agora-science.md",
    "skills/agora/references/agora-case-studies.md",
    "skills/agora/references/agora-voice.md",
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
