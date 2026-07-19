import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_ROOT = join(ROOT, "skills", "agora");
const SKILL_PATH = join(SKILL_ROOT, "SKILL.md");
const REFERENCE_PATH = join(SKILL_ROOT, "references", "agora-marketing.md");
const OPENAI_PATH = join(SKILL_ROOT, "agents", "openai.yaml");
const CODEX_PLUGIN_PATH = join(ROOT, ".codex-plugin", "plugin.json");
const CLAUDE_PLUGIN_PATH = join(ROOT, ".claude-plugin", "plugin.json");
const PACKAGE_PATH = join(ROOT, "package.json");
const GITATTRIBUTES_PATH = join(ROOT, ".gitattributes");
const LINK_FIXTURE_PATH = join(ROOT, "tests", "fixtures", "reference-links.v1.0.1.json");
const EVAL_ROOT = join(ROOT, "evals", "blind", "v1.2.0");
const PROMPT_ROOT = join(EVAL_ROOT, "prompts");
const MANIFEST_PATH = join(EVAL_ROOT, "manifest.json");

const [skill, reference, openaiYaml, codexPlugin, claudePlugin, packageJson, gitAttributes, linkFixture, manifest] =
  await Promise.all([
    readFile(SKILL_PATH, "utf8"),
    readFile(REFERENCE_PATH, "utf8"),
    readFile(OPENAI_PATH, "utf8"),
    readFile(CODEX_PLUGIN_PATH, "utf8").then(JSON.parse),
    readFile(CLAUDE_PLUGIN_PATH, "utf8").then(JSON.parse),
    readFile(PACKAGE_PATH, "utf8").then(JSON.parse),
    readFile(GITATTRIBUTES_PATH, "utf8"),
    readFile(LINK_FIXTURE_PATH, "utf8").then(JSON.parse),
    readFile(MANIFEST_PATH, "utf8").then(JSON.parse),
  ]);

function normalizeNewlines(value) {
  return value.replace(/\r\n/g, "\n");
}

function extractSection(markdown, heading, level = 2) {
  const lines = normalizeNewlines(markdown).split("\n");
  const marker = `${"#".repeat(level)} ${heading}`;
  const start = lines.findIndex((line) => line === marker);
  assert.notEqual(start, -1, `missing ${marker}`);

  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s/);
    if (match && match[1].length <= level) {
      end = index;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n");
}

function externalUrls(markdown) {
  return new Set(
    [...markdown.matchAll(/https?:\/\/[^\s)\]>"']+/g)].map((match) =>
      match[0].replace(/[.,;:]+$/, ""),
    ),
  );
}

test("skill frontmatter and direct activation remain portable", () => {
  const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  assert.ok(frontmatter, "SKILL.md needs frontmatter");
  const keys = [...frontmatter[1].matchAll(/^([a-z_-]+):/gm)].map((match) => match[1]);
  assert.deepEqual(keys, ["name", "description"]);
  assert.match(frontmatter[1], /^name: agora$/m);
  assert.match(frontmatter[1], /Write, rewrite, shorten, critique, or plan/);
  assert.match(skill, /Treat `\/agora` as explicit activation/);
  assert.match(skill, /\[references\/agora-marketing\.md\]\(references\/agora-marketing\.md\)/);
  assert.ok(skill.split(/\r?\n/).length < 500, "SKILL.md must stay under 500 lines");
});

test("routing defaults profiles to POSITION and reserves INVEST for capital decisions", () => {
  const routing = extractSection(skill, "Choose the job");
  assert.match(routing, /`POSITION` \| Default for company profiles/);
  assert.match(routing, /`INVEST` \| Actual funding, capital-allocation/);
  assert.match(routing, /Directory placement or an investor-adjacent audience does not activate `INVEST` by itself/);
  assert.match(routing, /Keep investor relevance implicit in descriptive profiles/);
  assert.match(routing, /Do not write phrases such as `for investors`, `investors should consider`, or `merits evaluation`/);

  const surfaces = extractSection(skill, "Route the surface separately");
  for (const surface of [
    "INDEXABLE_PUBLIC",
    "PUBLIC_NON_INDEXABLE_WRITTEN",
    "WRITTEN_PRIVATE",
    "SPOKEN_ONLY",
    "HYBRID",
  ]) {
    assert.ok(surfaces.includes(`\`${surface}\``), `missing surface ${surface}`);
  }
  assert.match(surfaces, /Do not confuse mode with surface/);
  assert.match(surfaces, /skip GEO\/AEO formatting/);
});

test("argument architecture is variable-depth and proof-salient", () => {
  const argument = extractSection(skill, "Build the argument with variable depth");
  assert.match(
    argument,
    /situation -> stake -> criterion or broken assumption when useful -> mechanism -> proof -> destination belief -> next step/,
  );
  assert.match(argument, /reasoning engine, not a visible template/);
  assert.match(argument, /Very short:/);
  assert.match(argument, /Do not force the full argument path/);
  assert.match(argument, /very short `POSITION` asset with no supplied trend or outcome/);
  assert.match(argument, /trigger-first sentence/);
  assert.match(argument, /Do not retreat to taxonomy merely because quantified impact is missing/);
  assert.match(argument, /very short `SELL` work with no outcome proof/);
  assert.match(argument, /Do not weaken it into generic words/);
  assert.match(argument, /POSITION.*legible, consequential, and distinct/s);
  assert.match(argument, /INVEST.*timing, wedge, evidence, scale logic/s);

  const proof = extractSection(skill, "Rank proof before drafting");
  for (const signal of [
    "decision relevance",
    "differentiation",
    "verifiability",
    "specificity",
    "compression value",
    "omission risk",
  ]) {
    assert.match(proof, new RegExp(signal, "i"));
  }
  assert.match(proof, /Preserve named scope, counts, coverage, entities, qualifications, and material limits/);
  assert.match(proof, /Keep factual enumerations/);
  assert.match(proof, /Every included fact must prove a premise, resolve an objection, distinguish the mechanism, or enable action/);
});

test("truth stays hard while compliance remains silent", () => {
  const truth = extractSection(skill, "Enforce truth and ethical limits");
  assert.match(truth, /Never invent or imply claims, features, prices, routes, results, traction/);
  assert.match(truth, /Treat trend and category-stage language as claims/);
  assert.match(truth, /If evidence is missing, narrow or remove the premise/);
  assert.match(truth, /Preserve agency/);

  const passes = extractSection(skill, "Apply silent final passes");
  assert.match(passes, /Verify each claim and causal link/);
  assert.match(passes, /Apply written GEO\/AEO only to written deliverables/);
  assert.match(passes, /technical publication checks only to indexable public work/);
  assert.match(passes, /Keep these passes invisible/);
  assert.match(passes, /only when silence would make the result misleading, legally unusable, or operationally unshippable/);
  assert.match(passes, /Do not generate em dashes or curly or smart quotes/);
  assert.match(passes, /preserve necessary factual series/);

  const channel = extractSection(skill, "Fit the channel");
  assert.match(channel, /one explanatory turn/);
  assert.match(channel, /Do not restate the same evidence/);
  assert.match(channel, /Omit route-availability or implementation-status prose/);
  assert.match(channel, /End on one supported consequence, decision, or form of agency/);
  assert.match(channel, /rank facts separately for each deliverable/i);
  assert.match(channel, /Do not force every supplied fact into both assets/);
  assert.match(channel, /internal workflow labels/);
  assert.match(channel, /Treat an existence-only route, screen, page, preview, or report as action availability/);
  assert.match(channel, /Do not turn it into a body-copy claim/);
});

test("reference leads with doctrine and keeps the deep authority library", () => {
  const headings = [...reference.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(headings.slice(0, 6), [
    "Contents",
    "Core doctrine",
    "Conflict hierarchy",
    "Commercial routing",
    "Surface routing",
    "Argument engine",
  ]);

  for (const heading of [
    "Emotion as consequential meaning",
    "Proof salience",
    "Truth and ethical limits",
    "Short, medium, and long forms",
    "Channel architecture",
    "Spoken delivery",
    "Human voice and AI-writing-tell gate",
    "Written GEO/AEO and citability",
    "Technical publication boundaries",
    "Applied weak and strong pairs",
    "Evaluation contract",
    "Evidence register",
    "Evidence maintenance",
  ]) {
    assert.ok(headings.includes(heading), `reference is missing ${heading}`);
  }

  assert.match(reference, /Build the supportable argument first/);
  assert.match(reference, /Emotion does not always beat logic/);
  assert.match(reference, /Keep factual enumeration when the list itself is diagnostic/);
  assert.match(reference, /derive the opening from the mechanism's verified trigger/);
  assert.match(reference, /Automatic failure: fabricated fact, unsupported causality, context leakage/);
});

test("reference examples cover the known failure families", () => {
  const examples = extractSection(reference, "Applied weak and strong pairs");
  const headings = [...examples.matchAll(/^### (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(headings, [
    "Company positioning",
    "Investor description",
    "Hero",
    "Paywall",
    "Cold email",
    "Spoken pitch",
    "Necessary enumeration",
  ]);

  for (const heading of headings) {
    const pair = extractSection(reference, heading, 3);
    assert.match(pair, /Verified facts:/);
    assert.match(pair, /Weak:/);
    assert.match(pair, /Strong:/);
    assert.match(pair, /Why:/);
  }
});

test("v1.0.1 source links remain available", () => {
  assert.equal(linkFixture.source, "v1.0.1:skills/agora/references/agora-marketing.md");
  assert.equal(linkFixture.urls.length, 51);
  const current = externalUrls(reference);
  const missing = linkFixture.urls.filter((url) => !current.has(url));
  assert.deepEqual(missing, [], `reference dropped source links: ${missing.join(", ")}`);
});

test("public files contain no project-specific residue or temporary citations", () => {
  const publicText = [skill, reference, openaiYaml, JSON.stringify(codexPlugin), JSON.stringify(claudePlugin)].join("\n");
  assert.doesNotMatch(publicText, new RegExp(["cite", "surge"].join(""), "i"));
  assert.doesNotMatch(publicText, /turn\d+(?:search|fetch|view|open|file)\d+/i);
  assert.doesNotMatch(publicText, /sandbox:\/\/mnt\/data/i);
  assert.doesNotMatch(skill, /brand-specific|brand overlay|claim ledger/i);
});

test("metadata matches the v1.2.1 release contract", () => {
  const expectedYaml = [
    "interface:",
    '  display_name: "Maestro: Agora"',
    '  short_description: "Argument-first copy that earns belief"',
    '  default_prompt: "Use $agora to turn verified facts into the strongest channel-native argument the evidence can support."',
    "",
  ].join("\n");
  assert.equal(normalizeNewlines(openaiYaml), expectedYaml);
  assert.equal(packageJson.version, "1.2.1");
  assert.equal(codexPlugin.version, packageJson.version);
  assert.equal(claudePlugin.version, packageJson.version);
  assert.match(gitAttributes, /^\* text=auto eol=lf$/m);
  assert.match(gitAttributes, /^\*\.png binary$/m);
  assert.equal(codexPlugin.interface.shortDescription, "Argument-first copy that earns belief");
  assert.ok(
    codexPlugin.interface.defaultPrompt.every(
      (prompt) => prompt.startsWith("/agora ") && prompt.length <= 128,
    ),
  );
});

test("blind evaluation corpus tests invariants without expected-answer leakage", async () => {
  assert.equal(manifest.schema_version, 2);
  assert.equal(manifest.skill_version, "1.2.0");
  assert.deepEqual(manifest.generation_contract.pass_to_model, ["prompt_file"]);
  assert.ok(manifest.generation_contract.never_pass_to_model.includes("expected output"));
  assert.equal(manifest.generation_contract.fresh_context_per_case, true);
  assert.equal(manifest.adjudication.method, "blind-pairwise");
  assert.equal(manifest.adjudication.randomize_order, true);
  assert.equal(manifest.adjudication.swap_order, true);
  assert.equal(manifest.adjudication.escalate_on_order_flip, true);
  assert.deepEqual(manifest.adjudication.absolute_vetoes, [
    "fabricated-fact",
    "unsupported-causality",
    "context-leakage",
    "visible-compliance-leakage",
  ]);
  assert.deepEqual(manifest.rubric.dimensions, [
    "argument-inevitability",
    "sustained-emotional-relevance",
    "proof-salience",
    "mechanism-differentiation",
    "natural-channel-fit",
    "truth-discipline",
  ]);

  const requiredIds = new Set([
    "position-directory-short",
    "invest-one-paragraph-diligence",
    "position-proof-scope",
    "short-mechanism-not-taxonomy",
    "enumeration-necessary",
    "silent-compliance",
    "hybrid-surface-split",
    "objective-vs-investment-position",
    "objective-vs-investment-invest",
    "proof-salience-vs-feature-volume",
    "position-no-investor-cosplay",
    "spoken-no-search-scaffolding",
    "factual-triplet-survives",
    "unsupported-proof",
    "direct-agora-invest",
  ]);
  const ids = new Set(manifest.cases.map((item) => item.id));
  for (const id of requiredIds) assert.ok(ids.has(id), `missing regression case: ${id}`);

  const promptFiles = new Set();
  for (const item of manifest.cases) {
    assert.equal(Object.hasOwn(item, "expected_output"), false, `${item.id} leaks expected output`);
    assert.ok(Array.isArray(item.hard_gates) && item.hard_gates.length > 0, `${item.id} needs gates`);
    assert.ok(!promptFiles.has(item.prompt_file), `duplicate prompt file: ${item.prompt_file}`);
    promptFiles.add(item.prompt_file);

    const promptPath = resolve(EVAL_ROOT, item.prompt_file);
    assert.ok(promptPath.startsWith(`${PROMPT_ROOT}${sep}`), `${item.id} escaped prompt root`);
    const prompt = await readFile(promptPath, "utf8");
    assert.match(prompt, /^# Request\s*$/m);
    assert.match(prompt, /^## Supplied facts\s*$/m);
    assert.match(prompt, /^## Constraints\s*$/m);
    assert.doesNotMatch(
      prompt,
      /expected (?:answer|output)|rubric|grader|scoring|destination belief|proof salience|hard gates?/i,
      `${item.id} contains grader leakage`,
    );
    assert.doesNotMatch(prompt, new RegExp(["cite", "surge"].join(""), "i"));
  }

  const actualPromptFiles = (await readdir(PROMPT_ROOT))
    .filter((file) => file.endsWith(".md"))
    .map((file) => `prompts/${file}`)
    .sort();
  assert.deepEqual(actualPromptFiles, [...promptFiles].sort());
});
