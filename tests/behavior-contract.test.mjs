import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_ROOT = join(ROOT, "skills", "agora");
const SKILL_PATH = join(SKILL_ROOT, "SKILL.md");
const REFERENCE_PATH = join(SKILL_ROOT, "references", "agora-marketing.md");
const CONVERSION_PATH = join(SKILL_ROOT, "references", "agora-conversion.md");
const CRAFT_PATH = join(SKILL_ROOT, "references", "agora-craft.md");
const VOICE_PATH = join(SKILL_ROOT, "references", "agora-voice.md");
const SCIENCE_PATH = join(SKILL_ROOT, "references", "agora-science.md");
const CASE_STUDY_PATH = join(SKILL_ROOT, "references", "agora-case-studies.md");
const INVEST_PATH = join(SKILL_ROOT, "references", "agora-invest.md");
const PUBLICATION_PATH = join(SKILL_ROOT, "references", "agora-publication.md");
const ANTI_AI_PATH = join(SKILL_ROOT, "references", "human-voice-editing-reference.md");
const WRITING_RUNTIME_PATH = join(SKILL_ROOT, "references", "agora-writing-runtime.md");
const MARKETING_RUNTIME_PATH = join(SKILL_ROOT, "references", "agora-marketing-runtime.md");
const CONVERSION_RUNTIME_PATH = join(SKILL_ROOT, "references", "agora-conversion-runtime.md");
const OPENAI_PATH = join(SKILL_ROOT, "agents", "openai.yaml");
const CODEX_PLUGIN_PATH = join(ROOT, ".codex-plugin", "plugin.json");
const CLAUDE_PLUGIN_PATH = join(ROOT, ".claude-plugin", "plugin.json");
const PACKAGE_PATH = join(ROOT, "package.json");
const GITATTRIBUTES_PATH = join(ROOT, ".gitattributes");
const DISCLAIMER_PATH = join(ROOT, "DISCLAIMER.md");
const PRIVACY_PATH = join(ROOT, "PRIVACY.md");
const LINK_FIXTURE_PATH = join(ROOT, "tests", "fixtures", "reference-links.v1.7.0.json");
const EVAL_ROOT = join(ROOT, "evals", "prospective", "human-writing-v1.0.0");
const PROMPT_ROOT = join(EVAL_ROOT, "prompts");
const MANIFEST_PATH = join(EVAL_ROOT, "manifest.json");

const [skill, reference, conversion, craft, voice, science, caseStudies, invest, publication, antiAi, writingRuntime, marketingRuntime, conversionRuntime, openaiYaml, codexPlugin, claudePlugin, packageJson, gitAttributes, disclaimer, privacy, linkFixture, manifest] =
  await Promise.all([
    readFile(SKILL_PATH, "utf8"),
    readFile(REFERENCE_PATH, "utf8"),
    readFile(CONVERSION_PATH, "utf8"),
    readFile(CRAFT_PATH, "utf8"),
    readFile(VOICE_PATH, "utf8"),
    readFile(SCIENCE_PATH, "utf8"),
    readFile(CASE_STUDY_PATH, "utf8"),
    readFile(INVEST_PATH, "utf8"),
    readFile(PUBLICATION_PATH, "utf8"),
    readFile(ANTI_AI_PATH, "utf8"),
    readFile(WRITING_RUNTIME_PATH, "utf8"),
    readFile(MARKETING_RUNTIME_PATH, "utf8"),
    readFile(CONVERSION_RUNTIME_PATH, "utf8"),
    readFile(OPENAI_PATH, "utf8"),
    readFile(CODEX_PLUGIN_PATH, "utf8").then(JSON.parse),
    readFile(CLAUDE_PLUGIN_PATH, "utf8").then(JSON.parse),
    readFile(PACKAGE_PATH, "utf8").then(JSON.parse),
    readFile(GITATTRIBUTES_PATH, "utf8"),
    readFile(DISCLAIMER_PATH, "utf8"),
    readFile(PRIVACY_PATH, "utf8"),
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

function withoutCodeFences(markdown) {
  return normalizeNewlines(markdown).replace(/^```[\s\S]*?^```$/gm, "");
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

test("publication audit is explicit, read only, and separate from ordinary writing", () => {
  const loading = extractSection(skill, "Load the small runtime first");
  assert.match(loading, /\[references\/agora-publication\.md\]\(references\/agora-publication\.md\)/);
  assert.match(loading, /explicit publication privacy and provenance audits/);

  const workflow = extractSection(skill, "Inspect publication artifacts only on request");
  assert.match(workflow, /separate read-only workflow/);
  assert.match(workflow, /Use the shipped `scripts\/publication-audit\.mjs`/);
  assert.match(workflow, /Never improvise a cleaner, strip Unicode by category, remove metadata, rewrite text to evade detection/);

  const watermarkBoundary = extractSection(publication, "Model-level text watermark boundary");
  assert.match(watermarkBoundary, /introduced during generation by changing token-selection probabilities/);
  assert.match(watermarkBoundary, /not evidence that Claude uses that exact scheme/);
  assert.match(watermarkBoundary, /Without the provider's verifier or equivalent configuration, the result remains `UNKNOWN`/);
  assert.match(watermarkBoundary, /Unusual Unicode is therefore neither evidence of a model-level watermark nor reliable evidence that one was removed/);

  assert.match(publication, /Never describe this audit as a watermark remover/);
  assert.match(publication, /Do not run it against ordinary chat text/);
  assert.match(publication, /never writes to a source file/);
  assert.match(publication, /Never collapse `UNKNOWN` into success/);
  assert.match(publication, /A carrier hint is not cryptographic validation/);
});

test("routing defaults profiles to POSITION and reserves INVEST for capital decisions", () => {
  const routing = extractSection(skill, "Choose the job and surface");
  assert.match(routing, /`POSITION` \| Company profiles/);
  assert.match(routing, /`INVEST` \| Fundraising, investment evaluation, diligence, and capital allocation/);
  assert.match(routing, /Directory placement or an investor-adjacent audience does not activate `INVEST`/);

  const surfaces = routing;
  for (const surface of [
    "INDEXABLE_PUBLIC",
    "PUBLIC_NON_INDEXABLE_WRITTEN",
    "WRITTEN_PRIVATE",
    "SPOKEN_ONLY",
    "HYBRID",
  ]) {
    assert.ok(surfaces.includes(`\`${surface}\``), `missing surface ${surface}`);
  }
  assert.match(surfaces, /Choose the surface separately/);
  assert.match(skill, /Apply search and technical publication checks only to indexable public work/);
});

test("science compositions preserve evidence gaps and next-step design", () => {
  assert.match(science, /Use scan-ready headings for implementation, validation result, limitation, role, and next decision/);
  assert.match(science, /both an external-validity gap and an unmeasured downstream outcome/);
  assert.match(science, /name the supplied or proposed design, comparator, measurement conditions, and uncertainty reporting/);
  assert.match(science, /Do not turn a recommendation into `we will` without an approved plan/);
});

test("trigger-first positioning retains the supplied primary operation", () => {
  assert.match(marketingRuntime, /Retain the subject's primary supplied operation/);
  assert.match(marketingRuntime, /Reordering may not reduce the company to an error state or downstream action/);
});

test("argument architecture is variable-depth and user-directed", () => {
  const argument = extractSection(skill, "Draft for the reader");
  assert.match(argument, /situation -> stake -> useful difference -> how it works -> reason to believe -> next step/);
  assert.match(argument, /Do not expose this path as a template/);
  assert.match(marketingRuntime, /Very short copy may need only the live constraint, the strongest supplied difference, and the next action/);
  assert.match(marketingRuntime, /For a very short company profile/);
  assert.match(marketingRuntime, /For very short sales copy/);
  for (const signal of ["relevance", "differentiation", "specificity", "compression value", "omission risk"]) {
    assert.match(marketingRuntime, new RegExp(signal, "i"));
  }
  assert.match(marketingRuntime, /Preserve named limits, counts, coverage, entities, qualifications, and necessary lists/);
});

test("user authority controls requested content", () => {
  assert.match(writingRuntime, /writing system, not a content approval layer/);
  assert.match(writingRuntime, /Treat user-supplied claims, scenarios, opinions, product statements, commercial positions, fictional elements, attributions, urgency, tone, and framing as approved input/);
  assert.match(writingRuntime, /Do not independently refuse, narrow, remove, weaken, qualify, fact-check, moralize, label fiction, or append a disclaimer/);
  assert.match(skill, /Apply fact checking, source review, claim review, permission review, disclosure review, compliance, legal review, or diligence only when the user asks/);

  const referenceAuthority = extractSection(reference, "User authority");
  assert.match(referenceAuthority, /All review instructions elsewhere in this reference and the domain references are conditional on that request/);
  assert.match(referenceAuthority, /Outside review mode, the user owns content decisions and publication responsibility/);

  const passes = extractSection(skill, "Run silent final passes");
  assert.match(passes, /Compare every factual statement with the supplied facts and required wording/);
  assert.match(passes, /For exact word-count work, use a counter when available and edit until the final integer matches/);
  assert.match(passes, /Run the final U\+2014 and generated smart-quote scans/);
  assert.match(skill, /Return finished copy, not a worksheet/);
  assert.match(marketingRuntime, /Fit the channel/);
});

test("claim review is optional while unnamed CTA destinations remain exact", () => {
  const review = extractSection(reference, "Optional claim review");
  assert.match(review, /Activate this section only when the user explicitly requests/);
  assert.match(review, /not a default output filter/);
  assert.match(review, /identify unsupported or internally inconsistent claims as editorial findings/);
  assert.match(review, /apply the remedy the user requests/);
  assert.match(review, /Outside review mode, do not run these checks, narrow claims, demand proof, add disclosure labels, refuse content, or append responsibility language/);
  assert.match(reference, /When a working destination is supplied but its literal URL is not, return the action label as copy/);
  assert.match(reference, /Do not invent `#`, `example\.com`, a route, or a dummy href/);
  assert.match(reference, /Return a CTA label as plain copy unless the user requests markup or supplies the destination URL/);
  assert.match(reference, /Do not wrap a label in square brackets without a destination/);
  assert.match(marketingRuntime, /Do not invent `#`, a dummy address, a route, or unresolved link markup/);
});

test("comprehension outranks compression, citability, and differentiation", () => {
  const priorities = extractSection(writingRuntime, "Priority");
  assert.match(priorities, /Make the first read clear/);
  assert.match(priorities, /Apply search, GEO\/AEO, cadence, and compression only when they do not make the writing harder to read/);

  const referenceHierarchy = extractSection(reference, "Conflict hierarchy");
  assert.match(referenceHierarchy, /3\. Immediate comprehension by the intended audience\./);
  assert.match(referenceHierarchy, /Comprehension sits above decision relevance/);
  assert.match(referenceHierarchy, /Qualification against comprehension/);
  assert.match(referenceHierarchy, /Citability against comprehension/);
  assert.match(reference, /State a material fit or exclusion boundary in a complete sentence with its subject and condition/);
  assert.match(reference, /Do not restate the opening situation in the close/);
  assert.match(reference, /Do not invent what the listener currently does, remembers, believes, or struggles with/);
  assert.match(reference, /If the spoken brief supplies no action or CTA, do not manufacture an imperative close/);
  assert.match(reference, /In a short bounded company description, give each sentence a distinct job/);
  assert.match(reference, /When a mechanism uses two or more named input fields, name the fields once/);
});

test("the first-read gate is operational, not a symptom list", () => {
  assert.match(writingRuntime, /rewrite the whole draft for first-read clarity/i);
  assert.match(writingRuntime, /Use one main point per sentence/);
  assert.match(writingRuntime, /Put the subject and action early/);
  assert.match(writingRuntime, /Review an ordinary sentence over 28 words/);
  assert.match(writingRuntime, /Give each paragraph one job/);

  const section = extractSection(reference, "Plain language and first-read comprehension");
  for (const heading of [
    "The reader model",
    "The first-read test",
    "The literal clarity rewrite",
    "The specialized-term gate",
    "Keep control-room vocabulary backstage",
    "Abstraction control",
    "The anti-slogan rule",
    "Corpus-level variance",
    "Failure handling",
    "Required comprehension tests",
  ]) {
    assert.ok(section.includes(`### ${heading}`), `comprehension section missing ${heading}`);
  }
  assert.match(section, /precise language with low decoding effort/);
  assert.match(section, /Industry familiarity is not the same as familiarity with one organization's terms/);
  assert.match(section, /Generic-referent gate/);
  assert.match(section, /Observable-result gate/);
  assert.match(section, /Metaphor-recovery gate/);
  assert.match(section, /Qualification-distribution gate/);
  assert.match(section, /Noun-stack gate/);
  assert.match(section, /Revision-integrity gate/);
  assert.match(section, /Use a finite action the reader owns/);
  assert.match(section, /Compression that raises decoding effort is not compression/);
  assert.match(section, /Do not repair unclear writing by adding more jargon/);
  assert.match(section, /Do not apply this test to a single sentence/);
  assert.match(section, /There is no optimal passage length/);
  assert.match(section, /Do not count them/);
  assert.match(section, /Where repetition is correct/);
  assert.match(section, /Do not present the control system as the product benefit/);
  assert.match(section, /name the concrete object the reader can understand or inspect/);
  assert.match(section, /Do not run a mechanical synonym replacement/);
  assert.match(section, /scientific research, methodology, audit, legal, compliance, diligence, and technical evaluation/);
  assert.match(writingRuntime, /Keep system language backstage/);
  assert.match(writingRuntime, /Do not replace these words mechanically/);
  assert.match(section, /Source review stays backstage unless the user asks to expose it/);
  assert.match(section, /Do not narrow or remove a user-selected claim because Agora considers its support incomplete/);

  const passes = extractSection(skill, "Run silent final passes");
  assert.match(passes, /Rewrite the whole draft for first-read clarity/);
  assert.match(passes, /Apply every mandatory rule from the canonical human-voice reference/);

  const citability = extractSection(reference, "Written GEO/AEO and citability");
  assert.match(citability, /only to `INDEXABLE_PUBLIC` assets/);
  assert.match(citability, /None of them may raise decoding effort/);
  assert.match(citability, /The unit is the passage, not the individual sentence, and no sentence count defines it/);
});

test("CTAs name an action and a destination, never a mood", () => {
  const cta = extractSection(marketingRuntime, "Write calls to action");
  assert.match(cta, /clear verb plus the concrete object, destination, or result/);
  assert.match(cta, /Match the commitment to what happens next/);
  assert.match(cta, /Do not invent a URL or destination/);
  assert.match(cta, /Keep one label for one materially identical action/);

  const standard = extractSection(reference, "CTA standard");
  assert.match(standard, /A CTA is an action label, not a slogan/);
  assert.match(standard, /Match the route as well as the destination/);
  assert.match(standard, /do not substitute another available path/);
  assert.match(standard, /Name the outcome the reader ends up with, not the motion the interface performs/);
  for (const slogan of ["Take control", "Unlock your potential", "Get clarity", "Start your journey"]) {
    assert.ok(standard.includes(slogan), `CTA standard is missing the slogan case ${slogan}`);
  }
  assert.ok(standard.includes("### What the reader must never have to infer"));
  assert.ok(standard.includes("### Consistency across a surface"));
  assert.match(standard, /One materially identical action gets one canonical label/);
  assert.match(standard, /No controlled evidence establishes that slogan-shaped labels as a class convert worse/);
  assert.match(standard, /Do not encode a pronoun ranking/);
  assert.match(standard, /Review the results/);
  assert.doesNotMatch(standard, /Review the evidence/);
  assert.match(standard, /preserve that name in the CTA or adjacent microcopy/);
  assert.match(standard, /This is destination fidelity, not a preferred phrase/);

  const invariants = extractSection(reference, "Deterministic invariants", 3);
  assert.match(invariants, /Every call to action names a verb plus a concrete object, destination, or result/);
  assert.match(invariants, /No internal method, stage, score, record-type, tier, or framework name appears/);
  assert.match(invariants, /attention-oriented headings do not run more than two consecutive instances/);
  assert.match(
    extractSection(reference, "Evaluation contract"),
    /First-read comprehension cannot be tested deterministically/,
  );
});

test("the evidence register records common myths without overriding user content", () => {
  const register = extractSection(reference, "Evidence register");
  assert.ok(register.includes("### Claims Agora does not introduce independently"));

  const myths = extractSection(reference, "Claims Agora does not introduce independently", 3);
  for (const blocked of [
    "A fixed share of readers reads the headline and not the body",
    "Any fixed optimal headline, title, or subject length",
    "first-person button copy beats second-person copy",
    "call to action must sit above the fold",
    "one call to action per page always outperforms several",
    "slogan-shaped labels convert worse as a class",
    "copy should target a fixed reading grade",
    "must create a new category to win",
    "people buy on emotion and justify with logic",
    "losses are twice as powerful as gains",
    "open loops make copy more memorable",
    "fear appeals backfire as a general rule",
    "passive voice is bad",
    "self-contained passage is a fixed number of sentences",
    "AI-detector score establishes authorship",
  ]) {
    assert.ok(myths.includes(blocked), `myth guard is missing: ${blocked}`);
  }
  assert.match(myths, /does not independently introduce them as universal rules/);
  assert.match(myths, /preserve it outside review mode/);
  assert.match(myths, /User-selected claims remain controlling/);

  const invariants = extractSection(reference, "Deterministic invariants", 3);
  assert.match(invariants, /That run length is a governance default, not a measured threshold/);

  const gate = extractSection(reference, "The specialized-term gate", 3);
  assert.match(gate, /There is no evidence-backed limit on unfamiliar terms per sentence/);
});

test("U+2014 is an immutable whole-response veto", () => {
  const ban = extractSection(skill, "Enforce immutable text rules");
  assert.match(ban, /Never emit Unicode U\+2014 anywhere in a response/);
  assert.match(ban, /ready copy, headings, lists, critique, notes, metadata, quotations, and source text/);
  assert.match(ban, /Never alter a quotation and present it as exact/);
  assert.match(ban, /scan the complete response character by character for U\+2014/);
  assert.match(ban, /return only when the count is zero/);

  const outputBans = extractSection(antiAi, "Global Output Bans");
  assert.match(outputBans, /zero em dashes/);

  const evaluation = extractSection(reference, "Evaluation contract");
  assert.match(evaluation, /entire generated response contains zero U\+2014 characters/);
  assert.match(evaluation, /Automatic failure: any U\+2014 occurrence/);
  assert.match(manifest.hard_gate_definitions["canonical-house-style"], /banned typography/);
});

test("the exact attached reference is the canonical human-voice standard", () => {
  const loading = extractSection(skill, "Load the small runtime first");
  assert.match(loading, /\[references\/human-voice-editing-reference\.md\]\(references\/human-voice-editing-reference\.md\)/);
  assert.match(loading, /single canonical authority/);
  assert.match(loading, /reusable prompt is an example/);

  const bans = extractSection(antiAi, "Global Output Bans");
  for (const required of [
    "zero em dashes",
    "zero curly or smart quotation marks",
    "zero stock phrase templates",
    "zero generic significance tails",
    "zero fabricated citations",
    "zero banned vocabulary or connective phrases without a documented",
    "zero unneeded conclusion or recap paragraphs",
    "zero repeated or formulaic tripartite structures",
    "zero deliberate errors",
  ]) {
    assert.ok(bans.includes(required), `priority output bans are missing: ${required}`);
  }

  assert.match(extractSection(antiAi, "5. Structural Tells"), /Paragraph-level patterns to break/);
  assert.match(extractSection(antiAi, "13. Build an Author Voice Profile Before Rewriting"), /three to ten authentic samples/);
  assert.match(extractSection(antiAi, "18. Optional Detector-Panel Protocol"), /Never claim that a passing score proves human authorship/);

  const humanGate = extractSection(reference, "Human voice and AI-writing-tell gate");
  assert.match(humanGate, /single canonical source is \[human-voice-editing-reference\.md\]/);
  assert.match(humanGate, /Never infer authorship or promise detector outcomes/);
});

test("reference leads with doctrine and keeps the deep authority library", () => {
  const headings = [...reference.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(headings.slice(0, 6), [
    "Contents",
    "Core doctrine",
    "User authority",
    "Conflict hierarchy",
    "Commercial routing",
    "Surface routing",
  ]);

  for (const heading of [
    "Emotion as consequential meaning",
    "Proof salience",
    "Plain language and first-read comprehension",
    "Optional claim review",
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

  assert.match(reference, /Build the strongest argument the user's brief calls for/);
  assert.match(reference, /Emotion does not always beat logic/);
  assert.match(reference, /Keep factual enumeration when the list itself is diagnostic/);
  assert.match(reference, /derive the opening from the mechanism's verified trigger/);
  assert.match(reference, /Automatic failure: any U\+2014 occurrence, failure to follow the user's requested claims or framing, unsolicited content review, unsolicited disclaimers/);
});

test("reference examples cover the known failure families", () => {
  const examples = extractSection(reference, "Applied weak and strong pairs");
  const headings = [...examples.matchAll(/^### (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(headings, [
    "Company positioning",
    "Investor description",
    "Hero",
    "Done-for-you service",
    "Paywall",
    "Cold email",
    "Spoken pitch",
    "Necessary enumeration",
    "Insider terminology",
    "Abstraction stacking",
    "Methodology in customer copy",
    "Slogan-shaped CTA",
    "CTA destination clarity",
    "Overloaded qualification",
    "Category orientation",
    "Superlative against specific",
    "CTA that overstates the click",
    "Heading variety across one page",
  ]);

  for (const heading of headings) {
    const pair = extractSection(reference, heading, 3);
    assert.match(pair, /Verified facts:/);
    assert.match(pair, /Weak:/);
    assert.match(pair, /Strong:/);
    assert.match(pair, /Why:/);
  }
});

test("the craft reference carries the five unabsorbed domains with graded rules", () => {
  const headings = [...craft.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(headings, [
    "Contents",
    "How to read the grades",
    "Headlines and titles",
    "Heroes and short-form sales composition",
    "Awareness and sophistication staging",
    "Emotion under a user brief",
    "Prosody and rhythm",
    "Open conflicts in this reference",
  ]);

  assert.match(craft, /\[agora-marketing\.md\]\(agora-marketing\.md\)/);
  assert.match(craft, /Nothing here outranks user authority or the conflict hierarchy/);

  const headlines = extractSection(craft, "Headlines and titles");
  for (const heading of [
    "The competing jobs",
    "Surface mechanics",
    "The specificity ladder",
    "Archetypes and their conditions",
    "The curiosity gap and its handoff",
    "Corpus variance, split by function",
  ]) {
    assert.ok(headlines.includes(`### ${heading}`), `headline section missing ${heading}`);
  }
  assert.match(headlines, /optimize the headline against the next decision the reader actually makes/);
  assert.match(headlines, /never add a number because exact numbers look credible/);
  assert.match(headlines, /A template is `clause type \+ lead device \+ promise structure`/);

  const staging = extractSection(craft, "Awareness and sophistication staging");
  assert.match(staging, /practitioner segmentation heuristic, never as a measured law/);
  assert.match(staging, /Every cell below is \*\*HOUSE\/PI\*\*/);
  assert.match(staging, /mechanism prominence is not monotonic/);
  assert.match(staging, /never report a bounce as evidence that a staging mismatch caused the failure/);
  assert.doesNotMatch(staging, /Schwartz/);

  const emotion = extractSection(craft, "Emotion under a user brief");
  assert.ok(emotion.includes("### Emotion from a fact set with no outcome data"));
  assert.match(emotion, /For identity-led or sensory commercial work, ground recognition in the audience or aesthetic direction the brief supplies/);
  assert.match(emotion, /Do not turn aesthetic direction into a creation fact, audience behavior, wearer effect, or performance claim/);
  assert.ok(emotion.includes("### Permission to write flat"));
  assert.match(emotion, /do not add emotion\. Increase resolution around the emotionally consequential facts/);
  assert.match(emotion, /the correct output is then flat/);
  assert.match(emotion, /Do not default to loss framing/);
  assert.match(emotion, /never advertise the prevalence of an undesirable behavior/i);

  const prosody = extractSection(craft, "Prosody and rhythm");
  assert.match(prosody, /Numeric sentence-length and paragraph-shape measurements belong in `voice check` and optional diagnostics/);
  assert.match(prosody, /diagnostic signal, not a verdict/);
  assert.match(prosody, /this document adopts neither as universal/);
  assert.match(prosody, /Do not report either position as a finding/);

  const conflicts = extractSection(craft, "Open conflicts in this reference");
  assert.match(conflicts, /Question-form subheadings/);
  assert.match(conflicts, /Sentence cadence/);
  assert.match(conflicts, /Do not close either by writing a rule/);
});

test("SKILL.md loads the craft reference only when the task needs it", () => {
  const loading = extractSection(skill, "Load the small runtime first");
  assert.match(loading, /\[references\/agora-craft\.md\]\(references\/agora-craft\.md\)/);
  assert.match(loading, /research-backed headline, hero, awareness, emotion, and diagnostic rhythm guidance/);
  assert.match(loading, /do not load them for ordinary drafting/);
});

test("the voice reference measures, stores outside the skill, and follows user-controlled profile use", () => {
  const headings = [...withoutCodeFences(voice).matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(headings, [
    "Contents",
    "What VOICE is",
    "Task-only voice sketches",
    "Where profiles live",
    "Corpus admission",
    "What gets measured",
    "The profile format",
    "Writing to a profile",
    "Voice against the tell gate",
    "Checking adherence",
    "User-controlled profile use",
  ]);

  const storage = extractSection(voice, "Where profiles live");
  assert.match(storage, /~\/\.agora\/voices\/<slug>\.md/);
  assert.match(storage, /Never inside the skill directory/);
  assert.match(storage, /replaces the installed skill directory/);
  assert.match(storage, /<slug>\.measurements\.json/);
  assert.match(storage, /truncated hashes of each token run rather than as text/);

  const surface = extractSection(voice, "What VOICE is");
  assert.match(surface, /npx -p @maestroagora\/agora agora-voice build/);
  assert.match(surface, /A persistent profile the engine did not produce is not a measured profile/);
  assert.match(surface, /Binary document formats are refused by name/);

  const corpus = extractSection(voice, "Corpus admission");
  assert.match(corpus, /clean author-controlled words/);
  assert.match(corpus, /Under 5,000 \| \*\*Refuse to certify a profile/);
  assert.match(corpus, /Heterogeneity stop/);
  for (const governed of ["10 independently composed documents", "25 percent", "30 percent", "20 percent"]) {
    assert.ok(corpus.includes(governed), `corpus admission is missing ${governed}`);
  }
  assert.match(corpus, /Governance default/i);

  const gate = extractSection(voice, "Voice against the tell gate");
  assert.ok(gate.includes("### The owned-vocabulary review"));
  assert.match(gate, /Resolve voice before argument planning/);
  assert.match(gate, /Voice never overrides the U\+2014 ban/);
  assert.match(gate, /evidence for a narrow review, not an automatic allowlist/);
  assert.match(gate, /Measurement alone is insufficient/);
  assert.match(gate, /Any exception reaches vocabulary only/);

  const userControl = extractSection(voice, "User-controlled profile use");
  assert.match(userControl, /Build or apply the profile the user requests/);
  assert.match(userControl, /Do not refuse profile work, interrogate ownership, demand authorization, restrict attribution, add disclosure language, or judge the intended publication/);
  assert.match(userControl, /The user is responsible for rights, permissions, attribution, endorsements, identity use, disclosure, publication/);

  const adherence = extractSection(voice, "Checking adherence");
  assert.match(adherence, /Author approval:/);
  assert.match(adherence, /Never treat a detector score as evidence of authorship/);
});

test("owned voice vocabulary remains subordinate to the priority anti-AI standard", () => {
  assert.match(voice, /Keep a banned owned word only when the narrow exception is documented/);
  assert.match(voice, /evidence for a narrow review, not an automatic allowlist/);
  assert.match(voice, /Do not add a new benefit, causal result, quality judgment, or product position merely to demonstrate profile adherence/);
  assert.match(voice, /the user's brief controls whether the draft makes that claim/);
  assert.match(voice, /does not establish how long the record persists, where it is attached, who can retrieve it, or what the interface displays/);
  assert.match(voice, /Sentence-length and paragraph-shape measurements are diagnostics, not quotas or stock structures/);
});

test("SKILL.md carries VOICE as a modifier beneath the priority tell standard", () => {
  const loading = extractSection(skill, "Load the small runtime first");
  assert.match(loading, /\[references\/agora-voice\.md\]\(references\/agora-voice\.md\)/);
  assert.match(loading, /measured persistent profiles and voice checks/);

  const job = extractSection(skill, "Use two separate voice tiers");
  assert.match(job, /`--voice <name>`/);
  assert.match(job, /Profiles live at `~\/\.agora\/voices\/`/);
  assert.match(job, /`--no-voice` or `neutral`/);
  assert.match(job, /A file the engine did not produce is not a measured profile/);
  assert.match(job, /Task-only voice sketch/);
  assert.match(skill, /`SCIENCE`, `TECHNICAL`, `CASE_STUDY`, and `VOICE` are modifiers, not primary jobs/);
  assert.match(writingRuntime, /Do not independently refuse, narrow, remove, weaken, qualify, fact-check, moralize/);

  assert.match(voice, /Voice never overrides host-required or user-required text/);
  assert.match(voice, /findings constrain content only when the user requested that review or the host requires them/);

  const finalPasses = extractSection(skill, "Run silent final passes");
  assert.match(finalPasses, /Preserve all material conditions, uncertainty, attribution, names, numbers, dates, quotations, legal terms, and technical terms/);
});

test("current source links remain available across all references", () => {
  assert.equal(linkFixture.source, "unreleased:skills/agora/references/*.md");
  assert.equal(linkFixture.urls.length, 155);
  const current = externalUrls([reference, conversion, craft, voice, science, caseStudies, invest, antiAi].join("\n"));
  const missing = linkFixture.urls.filter((url) => !current.has(url));
  assert.deepEqual(missing, [], `reference dropped source links: ${missing.join(", ")}`);
});

test("public responsibility and privacy notices match the shipped behavior", () => {
  assert.match(disclaimer, /Agora is not a content moderator, fact checker, approval system, legal reviewer, or compliance service/);
  assert.match(disclaimer, /You control the instructions, source material, claims, fictional elements, tone, urgency, attribution, disclosure, publication, and use of every output/);
  assert.match(disclaimer, /does not add use restrictions to that license/);
  assert.match(disclaimer, /The software is provided "as is," without warranty/);

  assert.match(privacy, /does not operate a hosted writing service, user-account system, analytics service, advertising system, or project-controlled telemetry endpoint/);
  assert.match(privacy, /installer does not send your installed skill files, prompts, drafts, or local documents to the Agora maintainer/);
  assert.match(privacy, /By default, it writes profiles and measurements to `~\/\.agora\/voices\/`/);
  assert.match(privacy, /selected corpus excerpts used for calibration/);
  assert.match(privacy, /When a user supplies an HTTP or HTTPS URL as a corpus source, the voice tool fetches that URL from the user's computer/);
  assert.match(privacy, /host or provider may process, retain, review, or use prompts, source material, generated content, metadata, and account information/);
  assert.match(privacy, /`agora-publication-audit` tool reads local files selected by the user/);
  assert.match(privacy, /redact metadata values and absolute paths by default/);
  assert.match(privacy, /disables remote-manifest fetching/);
  assert.match(disclaimer, /It is not a watermark remover, AI detector, authorship determination/);
  assert.match(disclaimer, /`UNKNOWN` coverage remains unresolved/);
});

test("public files contain no project-specific residue or temporary citations", () => {
  const publicText = [skill, reference, conversion, craft, voice, science, caseStudies, invest, publication, openaiYaml, JSON.stringify(codexPlugin), JSON.stringify(claudePlugin)].join("\n");
  assert.doesNotMatch(publicText, new RegExp(["cite", "surge"].join(""), "i"));
  assert.doesNotMatch(publicText, /turn\d+(?:search|fetch|view|open|file)\d+/i);
  assert.doesNotMatch(publicText, /sandbox:\/\/mnt\/data/i);
  assert.doesNotMatch(skill, /brand-specific|brand overlay|claim ledger/i);
});

test("metadata matches the v1.11.0 release contract", () => {
  const expectedYaml = [
    "interface:",
    '  display_name: "Maestro: Agora"',
    '  short_description: "Writing and publication artifact review"',
    '  default_prompt: "Use $agora to write from my brief or inspect a local publication artifact for privacy metadata and provenance."',
    "",
  ].join("\n");
  assert.equal(normalizeNewlines(openaiYaml), expectedYaml);
  assert.equal(packageJson.version, "1.11.0");
  assert.equal(codexPlugin.version, packageJson.version);
  assert.equal(claudePlugin.version, packageJson.version);
  assert.equal(packageJson.scripts["eval:release"], "node scripts/release-evidence-check.mjs");
  assert.equal(packageJson.scripts["release:check"], "npm run check && npm run eval:release");
  assert.equal(packageJson.scripts.prepack, "npm run release:check");
  assert.equal(packageJson.scripts.prepublishOnly, "npm run release:check");
  assert.match(packageJson.scripts["release:check"], /eval:release/);
  assert.match(gitAttributes, /^\* text=auto eol=lf$/m);
  assert.match(gitAttributes, /^\*\.png binary$/m);
  assert.doesNotMatch(skill, /\r\n/);
  assert.doesNotMatch(reference, /\r\n/);
  assert.doesNotMatch(conversion, /\r\n/);
  assert.doesNotMatch(craft, /\r\n/);
  assert.doesNotMatch(voice, /\r\n/);
  assert.doesNotMatch(science, /\r\n/);
  assert.doesNotMatch(caseStudies, /\r\n/);
  assert.doesNotMatch(invest, /\r\n/);
  assert.doesNotMatch(publication, /\r\n/);
  assert.doesNotMatch(openaiYaml, /\r\n/);
  assert.equal(codexPlugin.interface.shortDescription, "Writing and publication artifact review");
  assert.equal(packageJson.bin["agora-publication-audit"], "skills/agora/scripts/publication-audit.mjs");
  assert.equal(packageJson.bin["agora-style-audit"], "scripts/style-audit.mjs");
  const publicMetadata = [
    packageJson.description,
    codexPlugin.description,
    codexPlugin.interface.shortDescription,
    codexPlugin.interface.longDescription,
    ...codexPlugin.interface.defaultPrompt,
    claudePlugin.description,
    openaiYaml,
  ].join("\n");
  assert.doesNotMatch(publicMetadata, /\b(?:evidence|proof|verified|evidentiary)\b|claim discipline|source scope/i);
  assert.ok(
    codexPlugin.interface.defaultPrompt.every(
      (prompt) => prompt.startsWith("/agora ") && prompt.length <= 128,
    ),
  );
});

test("blind evaluation corpus tests invariants without expected-answer leakage", async () => {
  assert.equal(manifest.schema_version, 1);
  assert.equal(manifest.skill_version, "1.10.0");
  assert.deepEqual(manifest.generation_contract.pass_to_model, ["prompt_file"]);
  assert.ok(manifest.generation_contract.never_pass_to_model.includes("rubric"));
  assert.equal(manifest.generation_contract.fresh_context_per_case, true);
  assert.equal(manifest.adjudication.method, "blind-pairwise");
  assert.equal(manifest.adjudication.randomize_order, true);
  assert.equal(manifest.adjudication.swap_order, true);
  assert.equal(manifest.adjudication.escalate_on_order_flip, true);
  assert.equal(manifest.adjudication.report_hard_gate_failures, true);
  assert.deepEqual(manifest.rubric.dimensions, [
    "factual-fidelity",
    "first-read-ease",
    "sentence-ease",
    "natural-voice",
    "register-fit",
    "author-sample-fit",
    "control-room-vocabulary-containment",
    "nonformulaic-structure",
    "concision-without-loss",
    "technical-or-legal-precision",
  ]);
  assert.equal(manifest.cases.length, 24);
  assert.equal(manifest.release_gates.legacy_material_regressions_allowed, 0);
  assert.equal(manifest.release_gates.critical_contract_failures_allowed, 0);
  assert.equal(manifest.release_gates.human_writing_case_count, 24);
  assert.equal(manifest.release_gates.human_writing_minimum_protected_mean_delta, 0);

  const requiredIds = new Set(["northstar-ai-homepage", "datumlane-product", "softnest-profile", "gridfoundry-executive-summary", "sentrybay-professional-email", "orchardloop-case-study", "packetforge-api-docs", "harborlease-legal-clause", "seedtrial-science-explainer", "pinboard-interface", "tallybird-social", "clearline-spoken", "voice-three-samples", "voice-thin-sample", "voice-no-sample", "exact-word-count", "qualified-source-rewrite", "cloudguard-security-homepage", "ironmesh-infrastructure-product"]);
  const ids = new Set(manifest.cases.map((item) => item.id));
  for (const id of requiredIds) assert.ok(ids.has(id), `missing human-writing case: ${id}`);

  const promptFiles = new Set();
  for (const item of manifest.cases) {
    assert.equal(Object.hasOwn(item, "expected_output"), false, `${item.id} leaks expected output`);
    assert.ok(Array.isArray(item.hard_gates) && item.hard_gates.length > 0, `${item.id} needs gates`);
    for (const field of ["critical", "domain_dimensions", "archetype", "primary_outcome"]) assert.ok(Object.hasOwn(item, field), `${item.id} missing ${field}`);
    assert.ok(!promptFiles.has(item.prompt_file), `duplicate prompt file: ${item.prompt_file}`);
    promptFiles.add(item.prompt_file);

    const promptPath = resolve(EVAL_ROOT, item.prompt_file);
    assert.ok(promptPath.startsWith(`${PROMPT_ROOT}${sep}`), `${item.id} escaped prompt root`);
    const prompt = await readFile(promptPath, "utf8");
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
