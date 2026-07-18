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
const LINK_FIXTURE_PATH = join(ROOT, "tests", "fixtures", "reference-links.v1.0.1.json");
const EVAL_ROOT = join(ROOT, "evals", "blind", "v1.1.0");
const PROMPT_ROOT = join(EVAL_ROOT, "prompts");
const MANIFEST_PATH = join(EVAL_ROOT, "manifest.json");

const [skill, reference, openaiYaml, linkFixture, manifest] = await Promise.all([
  readFile(SKILL_PATH, "utf8"),
  readFile(REFERENCE_PATH, "utf8"),
  readFile(OPENAI_PATH, "utf8"),
  readFile(LINK_FIXTURE_PATH, "utf8").then(JSON.parse),
  readFile(MANIFEST_PATH, "utf8").then(JSON.parse),
]);

function normalizeNewlines(value) {
  return value.replace(/\r\n/g, "\n");
}

function normalizeWhitespace(value) {
  return normalizeNewlines(value).replace(/\s+/g, " ").trim();
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

function assertInOrder(value, expected, label) {
  let cursor = -1;
  for (const item of expected) {
    const next = value.indexOf(item, cursor + 1);
    assert.ok(next > cursor, `${label} is missing or out of order: ${item}`);
    cursor = next;
  }
}

function externalUrls(markdown) {
  return new Set(
    [...markdown.matchAll(/https?:\/\/[^\s)\]>"']+/g)].map((match) =>
      match[0].replace(/[.,;:]+$/, ""),
    ),
  );
}

test("commercial modes and surface routing are explicit and separate", () => {
  const modeSection = extractSection(skill, "Choose the commercial job");
  assert.match(modeSection, /Select one primary mode before drafting\. An explicit mode wins\./);
  assertInOrder(
    modeSection,
    [
      "| `INVEST` | Investors, funding, pitches, or capital-focused profiles |",
      "| `SELL` | Marketing, sales, ads, landing pages, outreach, or paywalls |",
      "| `POSITION` | Company profiles, category narratives, or brand descriptions |",
      "| `INFORM` | Editorial or educational work |",
      "| `TRANSACT` | Buttons, confirmations, alerts, or utility microcopy |",
    ],
    "commercial mode table",
  );
  assert.match(modeSection, /Do not confuse mode with surface\./);
  assert.match(modeSection, /For `INVEST`, state investment relevance in the visible copy\./);
  assert.match(modeSection, /Placement in an investor directory does not carry this move\./);
  assert.match(modeSection, /`merits evaluation because` of a specific supported mechanism or workflow position/);
  assert.match(modeSection, /Do not end with abstract category restatements built on `represents`, `focused on`, `approach to`, or `positioned at`/);
  assert.match(modeSection, /make the longest field carry the complete commercial spine/);
  assert.match(modeSection, /Do not include every supplied capability by default/);

  const surfaceSection = extractSection(skill, "Route the surface separately");
  assertInOrder(
    surfaceSection,
    [
      "`INDEXABLE_PUBLIC`",
      "`PUBLIC_NON_INDEXABLE_WRITTEN`",
      "`WRITTEN_PRIVATE`",
      "`SPOKEN_ONLY`",
      "`HYBRID`",
    ],
    "surface table",
  );
  assert.match(
    normalizeWhitespace(surfaceSection),
    /Channel rules cap tone without deleting the argument\. For objective platforms such as Crunchbase, write the strongest objective argument permitted and explain any channel conflict after the copy\./,
  );
  assert.match(
    normalizeWhitespace(surfaceSection),
    /For a tightly limited objective company profile, preserve the supported operational problem and company transformation\./,
  );
});

test("commercial modes retain the mandatory spine and exact construction order", () => {
  const construction = extractSection(skill, "Follow the exact construction order");
  const constructionOrder =
    "Commercial job -> destination belief -> argument -> proof gate -> channel formatting -> written GEO/AEO when applicable -> AI-writing-tell edit -> compression.";
  assert.ok(construction.includes(constructionOrder), "construction order changed");
  assertInOrder(
    construction,
    [
      "1. **Commercial job.**",
      "2. **Destination belief.**",
      "3. **Argument.**",
      "4. **Proof gate.**",
      "5. **Channel formatting.**",
      "6. **Written GEO/AEO.**",
      "7. **AI-writing-tell edit.**",
      "8. **Compression.**",
    ],
    "construction steps",
  );
  assert.match(construction, /Compliance cannot rescue a missing or unsupported argument\./);

  const spine = extractSection(skill, "Build the mandatory commercial spine");
  const mandatorySpine =
    "Recognizable reality -> consequence or opportunity -> new decision criterion -> company or product mechanism -> defensible destination belief -> action or investment relevance.";
  assert.match(spine, /For `SELL`, `INVEST`, and `POSITION`, construct this exact sequence:/);
  assert.ok(spine.includes(mandatorySpine), "mandatory commercial spine changed");
  assert.match(spine, /Moves may share sentences; none may disappear\./);
  assert.match(spine, /silently locate the exact words that carry each of the six moves/);
  assert.match(spine, /A compact hero, profile, paywall, email, or spoken pitch is not exempt/);
  assert.match(spine, /Words such as `matters`, `confidence`, `better`, or `before acting` do not carry the stake alone/);
});

test("proof, rejection, voice, and output gates remain non-negotiable", () => {
  const proof = extractSection(skill, "Enforce the proof gate");
  assert.match(proof, /Attach proof to the argument before applying channel rules or compliance gates\./);
  assert.match(proof, /every included fact to prove a premise, resolve an objection, or enable action/i);
  assert.match(proof, /Do not turn an operational mismatch, exception, or review task into financial risk/);
  assert.match(proof, /Keep the stake at the supported task or decision\./);
  assert.match(proof, /If proof is missing, narrow or remove the premise\./);
  assert.match(proof, /Do not add a generic disclaimer such as `outcomes are not guaranteed`/);
  assert.match(proof, /similar category-stage or market-trend language as claims/);
  assert.match(proof, /When no market evidence is supplied, name the category and current situation neutrally\./);

  const rejection = extractSection(skill, "Apply the rejection gates");
  for (const required of [
    "It is only a category definition, claim-ledger paraphrase, or feature inventory.",
    "An objective profile uses the shape `Company is [category] that [feature list]` even though the supplied mechanism supports a decision problem or company transformation. Start from that problem or transformation instead.",
    "It has no felt stake, company transformation, or destination belief.",
    "A commercial-spine move disappeared to satisfy a short or objective format.",
    "A paywall merely repeats plan facts without naming the blocked action and how the supported upgrade change resolves it.",
    "The facts do not prove a premise, resolve an objection, or enable action.",
  ]) {
    assert.ok(rejection.includes(required), `rejection contract changed: ${required}`);
  }
  assert.match(
    rejection,
    /Reject primary brand verbs such as `shows`, `helps`, `supports`, or `built for` when a supported causal verb is available\./,
  );

  const voice = extractSection(skill, "Preserve truth, ethics, and voice");
  assert.match(voice, /Do not generate em dashes or curly or smart quotes in final copy\./);
  assert.match(voice, /scan every generated character in the ready copy and any note after it/i);
  assert.match(voice, /Do not let a verification note reintroduce a banned mark\./);
  assert.match(voice, /Run a separate triad sweep\./);
  assert.match(voice, /Never generate the prose syntax `X, Y, and Z` or `X, Y, or Z`/);
  assert.match(voice, /treat this as a mechanical output constraint/);
  assert.match(voice, /A flourish such as `measurement, traceability, and discipline` fails\./);
  assert.match(voice, /A recap such as `evidence capture, prioritization, and human review` also fails/);
  assert.match(voice, /Recast even sourced facts with a natural pair or connected prose\./);
  assert.match(voice, /Scan the final prose from the last sentence backward\./);
  assert.match(voice, /Find every generated `, and` and `, or`/);
  assert.match(voice, /Do not stop after the first repair\./);
  assert.match(voice, /`not merely\.\.\. but\.\.\.`, and `not just\.\.\. but\.\.\.` constructions/);
  assert.match(voice, /Never promise detector evasion\./);
  assert.match(voice, /Never change facts, names, numbers, dates, quotations, citations, causality, uncertainty, or legal meaning to sound human\./);

  const result = extractSection(skill, "Return the result");
  assert.match(result, /^\s*Return ready-to-use copy first\./);
  assert.match(result, /Do not expose chain-of-thought, mode classification, planning scaffolds, private reasoning, or a rule-by-rule explanation\./);
  assert.match(result, /Run the literal punctuation sweep after composing any post-copy note/);
});

test("reference loading is progressive and its leading doctrine order is fixed", () => {
  const loading = extractSection(skill, "Load the authority progressively");
  assert.match(loading, /Load only the sections required for the current job:/);
  assertInOrder(
    loading,
    [
      "Always read `Core doctrine`",
      "For `SELL`, `INVEST`, or `POSITION`",
      "For written work",
      "For spoken work",
      "For CiteSurge work only",
      "Load the evidence register",
    ],
    "progressive loading rules",
  );
  assert.doesNotMatch(skill, /Read \[references\/agora-marketing\.md\]\([^)]*\) before producing or reviewing copy/);

  const levelTwoHeadings = [...reference.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(levelTwoHeadings.slice(0, 5), [
    "Contents",
    "Core doctrine",
    "The destination belief",
    "Mechanism and company transformation",
    "Commercial modes",
  ]);

  for (const heading of [
    "Construction order",
    "Source basis and authority",
    "Proof and claim control",
    "Rejection gates",
    "Human voice and AI-writing-tell gate",
    "Written GEO/AEO and citability gate",
    "Evidence register",
    "Evidence maintenance",
  ]) {
    assert.ok(levelTwoHeadings.includes(heading), `canonical reference lost: ${heading}`);
  }
  assert.match(skill, /Apply CiteSurge .* controls only when the request, named product, or active repository is CiteSurge\./);
  assert.match(skill, /Never apply them to another brand\./);
  assert.match(skill, /Apply technical .* checks only to indexable public work\./);
});

test("the reference contains six factual weak and strong pairs", () => {
  const examples = extractSection(reference, "Applied weak and strong pairs");
  const headings = [...examples.matchAll(/^### (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(headings, [
    "Company positioning",
    "Investor description",
    "Hero",
    "Paywall",
    "Cold email",
    "Spoken pitch",
  ]);

  for (const heading of headings) {
    const pair = extractSection(reference, heading, 3);
    assertInOrder(pair, ["Verified facts:", "Weak:", "Strong:"], `${heading} pair`);
    assert.match(pair, /^\s*Verified facts:\s*\n\s*\n>/, `${heading} must declare shared facts`);

    const strong = pair.match(/Strong:\s*\n\s*\n((?:>.*(?:\n|$))+)/)?.[1] || "";
    assert.ok(strong, `${heading} must include a blockquoted strong example`);
    assert.doesNotMatch(
      strong,
      /,\s+(?:and|or)\b/i,
      `${heading} strong example must not teach a mechanical comma triad`,
    );
    assert.doesNotMatch(
      strong,
      /\b[\w-]+,\s+[\w-]+\s+(?:and|or)\s+[\w-]+\b/i,
      `${heading} strong example must not teach a compressed three-part list`,
    );
  }
});

test("v1.0.1 authority links remain available", () => {
  assert.equal(linkFixture.source, "v1.0.1:skills/agora/references/agora-marketing.md");
  assert.equal(linkFixture.urls.length, 51, "baseline authority-link count changed");
  assert.deepEqual(
    [...new Set(linkFixture.urls)].sort(),
    linkFixture.urls,
    "authority-link fixture must be unique and sorted",
  );

  const current = externalUrls(reference);
  const missing = linkFixture.urls.filter((url) => !current.has(url));
  assert.deepEqual(missing, [], `reference dropped baseline authority links: ${missing.join(", ")}`);
});

test("OpenAI interface metadata matches the v1.1.0 contract", () => {
  const expected = [
    "interface:",
    '  display_name: "Maestro: Agora"',
    '  short_description: "Truthful arguments for buyers and investors"',
    '  default_prompt: "Use $agora to lead one audience from a real stake to a defensible buying or investment belief, then return ready-to-use copy."',
    "",
  ].join("\n");
  assert.equal(normalizeNewlines(openaiYaml), expected);
});

test("blind evaluation corpus is isolated, leak-free, and contract-complete", async () => {
  assert.equal(manifest.schema_version, 1);
  assert.equal(manifest.skill_version, "1.1.0");
  assert.deepEqual(manifest.generation_contract.pass_to_model, ["prompt_file"]);
  assert.ok(manifest.generation_contract.never_pass_to_model.includes("manifest.json"));
  assert.equal(manifest.generation_contract.fresh_context_per_case, true);
  assert.equal(manifest.generation_contract.isolated_skill_copy, true);

  const cases = manifest.cases;
  assert.ok(Array.isArray(cases) && cases.length > 0, "blind manifest has no cases");

  const allowedModes = new Set(["INVEST", "SELL", "POSITION", "INFORM", "TRANSACT"]);
  const allowedSurfaces = new Set([
    "INDEXABLE_PUBLIC",
    "PUBLIC_NON_INDEXABLE_WRITTEN",
    "WRITTEN_PRIVATE",
    "SPOKEN_ONLY",
    "HYBRID",
  ]);
  const allowedSelections = new Set(["explicit", "inferred"]);
  const allowedWrittenGeo = new Set(["apply", "skip", "split"]);
  const requiredAssets = new Set([
    "company-positioning",
    "investor-description",
    "hero",
    "paywall",
    "cold-email",
    "spoken-pitch",
  ]);
  const commercialModes = new Set(["INVEST", "SELL", "POSITION"]);
  const ids = new Set();
  const promptFiles = new Set();

  for (const item of cases) {
    for (const field of [
      "id",
      "prompt_file",
      "selection",
      "explicit_override",
      "expected_mode",
      "expected_surface",
      "asset",
      "mandatory_spine",
      "objective_conflict",
      "written_geo",
      "supported_causal_verbs",
      "hard_gates",
    ]) {
      assert.ok(Object.hasOwn(item, field), `${item.id || "case"} is missing ${field}`);
    }
    assert.equal(Object.hasOwn(item, "expected_output"), false, `${item.id} leaks an expected output`);
    assert.ok(!ids.has(item.id), `duplicate case id: ${item.id}`);
    ids.add(item.id);
    assert.ok(!promptFiles.has(item.prompt_file), `duplicate prompt file: ${item.prompt_file}`);
    promptFiles.add(item.prompt_file);
    assert.ok(allowedModes.has(item.expected_mode), `${item.id} has an invalid mode`);
    assert.ok(allowedSurfaces.has(item.expected_surface), `${item.id} has an invalid surface`);
    assert.ok(allowedSelections.has(item.selection), `${item.id} has an invalid selection type`);
    assert.equal(typeof item.explicit_override, "boolean", `${item.id} explicit_override must be boolean`);
    assert.equal(typeof item.objective_conflict, "boolean", `${item.id} objective_conflict must be boolean`);
    assert.ok(allowedWrittenGeo.has(item.written_geo), `${item.id} has an invalid written_geo value`);
    if (item.selection === "inferred") {
      assert.equal(item.explicit_override, false, `${item.id} inferred selection cannot be an explicit override`);
    }
    if (item.explicit_override) {
      assert.equal(item.selection, "explicit", `${item.id} explicit override must use explicit selection`);
    }
    assert.equal(
      item.mandatory_spine,
      commercialModes.has(item.expected_mode),
      `${item.id} has the wrong spine requirement`,
    );
    assert.ok(Array.isArray(item.supported_causal_verbs), `${item.id} causal verbs must be an array`);
    assert.ok(Array.isArray(item.hard_gates) && item.hard_gates.length > 0, `${item.id} needs hard gates`);

    const promptPath = resolve(EVAL_ROOT, item.prompt_file);
    assert.ok(
      promptPath.startsWith(`${PROMPT_ROOT}${sep}`),
      `${item.id} prompt must stay under the blind prompt directory`,
    );
    const prompt = await readFile(promptPath, "utf8");
    assert.match(prompt, /^# Request\s*$/m, `${item.id} prompt needs a request`);
    assert.match(prompt, /^## Supplied facts\s*$/m, `${item.id} prompt needs supplied facts`);
    assert.match(prompt, /^## Constraints\s*$/m, `${item.id} prompt needs constraints`);
    assert.doesNotMatch(prompt, /\b(?:INVEST|SELL|POSITION|INFORM|TRANSACT)\b/);
    assert.doesNotMatch(
      prompt,
      /\b(?:INDEXABLE_PUBLIC|PUBLIC_NON_INDEXABLE_WRITTEN|WRITTEN_PRIVATE|SPOKEN_ONLY|HYBRID)\b/,
    );
    assert.doesNotMatch(
      prompt,
      /expected (?:answer|output)|rubric|grader|scoring|destination belief|commercial spine|proof gate|hard gates?/i,
      `${item.id} prompt contains grader leakage`,
    );
  }

  assert.deepEqual(new Set(cases.map((item) => item.expected_mode)), allowedModes);
  assert.deepEqual(new Set(cases.map((item) => item.expected_surface)), allowedSurfaces);
  assert.ok(cases.some((item) => item.selection === "explicit"), "explicit selection is uncovered");
  assert.ok(cases.some((item) => item.selection === "inferred"), "inferred selection is uncovered");
  assert.ok(
    cases.some((item) => item.selection === "explicit" && item.explicit_override),
    "explicit override is uncovered",
  );
  assert.ok(cases.some((item) => item.objective_conflict), "objective channel conflict is uncovered");
  assert.ok(cases.some((item) => item.expected_surface === "HYBRID"), "hybrid routing is uncovered");
  for (const asset of requiredAssets) {
    assert.ok(cases.some((item) => item.asset === asset), `paired format is uncovered: ${asset}`);
  }

  const actualPromptFiles = (await readdir(PROMPT_ROOT))
    .filter((file) => file.endsWith(".md"))
    .map((file) => `prompts/${file}`)
    .sort();
  assert.deepEqual(actualPromptFiles, [...promptFiles].sort(), "manifest and prompt directory differ");
});
