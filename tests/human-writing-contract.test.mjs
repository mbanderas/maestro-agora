import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  CANONICAL_CONNECTIVES,
  CANONICAL_SIGNIFICANCE_TAILS,
  CANONICAL_TEMPLATE_PATTERNS,
  CONTROL_ROOM_TERMS,
  auditText,
} from "../scripts/style-audit-core.mjs";
import { GENERIC_AI_VOCABULARY } from "../scripts/voice/lexicon.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_ROOT = join(ROOT, "skills", "agora");
const REFERENCES = join(SKILL_ROOT, "references");
const read = (path) => readFile(join(ROOT, ...path.split("/")), "utf8");

const [skill, runtime, marketingRuntime, conversionRuntime, science, voice, craft, canonical] = await Promise.all([
  read("skills/agora/SKILL.md"),
  read("skills/agora/references/agora-writing-runtime.md"),
  read("skills/agora/references/agora-marketing-runtime.md"),
  read("skills/agora/references/agora-conversion-runtime.md"),
  read("skills/agora/references/agora-science.md"),
  read("skills/agora/references/agora-voice.md"),
  read("skills/agora/references/agora-craft.md"),
  read("skills/agora/references/human-voice-editing-reference.md"),
]);

test("the attached human-voice reference ships byte-for-byte as the canonical authority", () => {
  assert.equal(
    createHash("sha256").update(canonical).digest("hex"),
    "afc04c1f1f6fda707199d855ef74cd937c566eaa383a84ad3b09eea620223270",
  );
  assert.match(skill, /single canonical authority/);
  assert.match(skill, /human-voice-editing-reference\.md/);
});

test("no secondary reference carries a competing canonical list", async () => {
  const names = await readdir(REFERENCES);
  assert.equal(names.includes("anti-ai-writing-tells.md"), false);
  for (const name of names.filter((value) => value.endsWith(".md") && value !== "human-voice-editing-reference.md")) {
    const content = await readFile(join(REFERENCES, name), "utf8");
    assert.doesNotMatch(content, /^### AI-heavy vocabulary$/m, name);
    assert.doesNotMatch(content, /^### Stock templates and significance tails$/m, name);
  }
});

test("every canonical vocabulary item is a hard scanner rule", () => {
  const report = auditText(GENERIC_AI_VOCABULARY.map((word) => `The draft uses ${word}.`).join("\n"));
  for (const word of GENERIC_AI_VOCABULARY) {
    assert.ok(report.findings.some((item) => item.rule === `banned-vocabulary:${word}` && item.severity === "hard"), word);
  }
});

test("every canonical connective and significance tail is a hard scanner rule", () => {
  const text = [
    ...CANONICAL_CONNECTIVES.map((phrase) => `${phrase}, the team shipped.`),
    ...CANONICAL_SIGNIFICANCE_TAILS.map((phrase) => `The team shipped, ${phrase} the work.`),
  ].join("\n");
  const report = auditText(text);
  for (const phrase of CANONICAL_CONNECTIVES) assert.ok(report.findings.some((item) => item.rule === `banned-connective:${phrase}` && item.severity === "hard"), phrase);
  for (const phrase of CANONICAL_SIGNIFICANCE_TAILS) assert.ok(report.findings.some((item) => item.rule === `significance-tail:${phrase}` && item.severity === "hard"), phrase);
});

test("every canonical stock template has a strict scanner pattern", () => {
  const fixtures = [
    "It's important to note that the door is shut.",
    "It's worth mentioning that the door is shut.",
    "In today's fast-paced world, doors move quickly.",
    "In the ever-evolving landscape of doors, locks matter.",
    "In the realm of doors, locks matter.",
    "A testament to the design.",
    "Stands as a useful lock.",
    "Serves as a useful lock.",
    "Plays a pivotal role in access.",
    "Not only fast but also quiet.",
    "Whether you're buying or renting, compare the lock.",
    "From homes to offices, the lock has changed access.",
    "At its core, the lock closes.",
    "When it comes to locks, fit matters.",
    "Navigating the complexities of access takes time.",
    "Unlocking the potential of access takes time.",
    "Harnessing the power of access takes time.",
    "Paving the way for access takes time.",
    "Setting the stage for access takes time.",
    "Bringing locks to the forefront takes time.",
  ];
  assert.equal(fixtures.length, CANONICAL_TEMPLATE_PATTERNS.length);
  const report = auditText(fixtures.join("\n"));
  for (const [id] of CANONICAL_TEMPLATE_PATTERNS) assert.ok(report.findings.some((item) => item.rule === `banned-template:${id}` && item.severity === "hard"), id);
});

test("plain runtime is small, direct, strict, and ready-copy-only", () => {
  assert.ok(runtime.split(/\r?\n/).length <= 260);
  assert.doesNotMatch(runtime, /https?:\/\//);
  assert.doesNotMatch(runtime, /\bRule \[[A-Z]\]/);
  assert.match(runtime, /hard output rules, not density suggestions/);
  assert.match(runtime, /Review an ordinary sentence over 28 words/);
  assert.match(runtime, /Return ready-to-use text first and by default/);
  assert.match(runtime, /Do not append a rationale/);
  for (const term of CONTROL_ROOM_TERMS) assert.ok(runtime.includes(term), term);
});

test("ordinary marketing and conversion load compact runtime files, not deep research", () => {
  assert.match(skill, /Use \[references\/agora-marketing-runtime\.md/);
  assert.match(skill, /Use \[references\/agora-conversion-runtime\.md/);
  assert.match(skill, /do not load them for ordinary drafting/);
  assert.match(marketingRuntime, /The default register is `PLAIN`/);
  assert.match(conversionRuntime, /Use this compact overlay/);
});

test("technical subject words do not choose a specialized register", () => {
  assert.match(skill, /Topic alone never selects a specialized register/);
  assert.match(skill, /AI, software, data, security, or infrastructure product remains `PLAIN`/);
  assert.match(science, /Do not activate either modifier because the subject or product category includes AI, software, data, security, engineering, infrastructure/);
  assert.match(science, /An API guide is normally `INFORM \+ TECHNICAL`/);
});

test("register and both voice tiers resolve before argument planning", () => {
  assert.match(skill, /Select register and voice before planning/);
  assert.match(skill, /Task-only voice sketch/);
  assert.match(voice, /## Task-only voice sketches/);
  assert.match(voice, /With one or two samples, record cautious observations/);
  assert.match(voice, /never stored as a profile/i);
  assert.match(voice, /Never copy distinctive phrases, examples, facts, metaphors, slogans, anecdotes, or subject matter/);
  assert.doesNotMatch(voice, /Voice enters at \*\*level 6\*\*/);
});

test("forced rhythm generation is removed while diagnostics remain", () => {
  const generationSources = `${skill}\n${runtime}\n${marketingRuntime}\n${craft}\n${voice}`;
  assert.doesNotMatch(generationSources, /include at least one sentence of 8 words or fewer and one of 25 or more/i);
  assert.doesNotMatch(generationSources, /aim for a coefficient of variation/i);
  assert.match(skill, /No instruction requires a 25-word sentence/);
  assert.match(craft, /Numeric sentence-length and paragraph-shape measurements belong in `voice check` and optional diagnostics/);
  assert.match(voice, /Do not generate toward them/);
});

test("ready-copy output and factual fidelity remain hard requirements", () => {
  assert.match(skill, /Never invent a name, figure, quotation, outcome, credential, permission, URL, product behavior, destination, or intermediate step/);
  assert.match(skill, /Return one ready-to-use result by default/);
  assert.match(skill, /Do not expose internal planning/);
  assert.match(skill, /Apply fact checking, source review, claim review, permission review, disclosure review, compliance, legal review, or diligence only when the user asks/);
});
