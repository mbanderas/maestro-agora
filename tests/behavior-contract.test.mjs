import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_ROOT = join(ROOT, "skills", "agora");
const SKILL_PATH = join(SKILL_ROOT, "SKILL.md");
const REFERENCE_PATH = join(SKILL_ROOT, "references", "agora-marketing.md");
const CRAFT_PATH = join(SKILL_ROOT, "references", "agora-craft.md");
const VOICE_PATH = join(SKILL_ROOT, "references", "agora-voice.md");
const SCIENCE_PATH = join(SKILL_ROOT, "references", "agora-science.md");
const CASE_STUDY_PATH = join(SKILL_ROOT, "references", "agora-case-studies.md");
const OPENAI_PATH = join(SKILL_ROOT, "agents", "openai.yaml");
const CODEX_PLUGIN_PATH = join(ROOT, ".codex-plugin", "plugin.json");
const CLAUDE_PLUGIN_PATH = join(ROOT, ".claude-plugin", "plugin.json");
const PACKAGE_PATH = join(ROOT, "package.json");
const GITATTRIBUTES_PATH = join(ROOT, ".gitattributes");
const LINK_FIXTURE_PATH = join(ROOT, "tests", "fixtures", "reference-links.v1.4.0.json");
const EVAL_ROOT = join(ROOT, "evals", "blind", "v1.4.0");
const PROMPT_ROOT = join(EVAL_ROOT, "prompts");
const MANIFEST_PATH = join(EVAL_ROOT, "manifest.json");

const [skill, reference, craft, voice, science, caseStudies, openaiYaml, codexPlugin, claudePlugin, packageJson, gitAttributes, linkFixture, manifest] =
  await Promise.all([
    readFile(SKILL_PATH, "utf8"),
    readFile(REFERENCE_PATH, "utf8"),
    readFile(CRAFT_PATH, "utf8"),
    readFile(VOICE_PATH, "utf8"),
    readFile(SCIENCE_PATH, "utf8"),
    readFile(CASE_STUDY_PATH, "utf8"),
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
  assert.match(passes, /Run the final U\+2014 scan across the complete response/);
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

test("comprehension outranks compression, citability, and differentiation", () => {
  const conflicts = extractSection(skill, "Resolve conflicts");
  assert.match(conflicts, /3\. Immediate comprehension by the intended audience\./);
  assert.match(conflicts, /7\. Compression, rhythm, style, and publication optimization\./);
  assert.match(
    conflicts,
    /Compression, cleverness, citability, technical precision, and rhetorical force never make the writing harder to understand/,
  );
  assert.match(conflicts, /Qualify at the passage or section level/);
  assert.match(conflicts, /That rule governs the passage, not the sentence/);

  const referenceHierarchy = extractSection(reference, "Conflict hierarchy");
  assert.match(referenceHierarchy, /3\. Immediate comprehension by the intended audience\./);
  assert.match(referenceHierarchy, /Copy that is accurate and unreadable has failed/);
  assert.match(referenceHierarchy, /Qualification against comprehension/);
  assert.match(referenceHierarchy, /Citability against comprehension/);
});

test("the first-read gate is operational, not a symptom list", () => {
  const gate = extractSection(skill, "Pass the first-read comprehension gate");
  assert.match(gate, /Plain language is not simple language/);
  assert.match(gate, /does not know the organization's internal vocabulary/);
  assert.match(gate, /Rewrite any sentence an intended reader could not restate after reading it once/);
  assert.match(gate, /depends on undefined internal terminology/);
  assert.match(gate, /hides the actor, the action, the object, or the result/);
  assert.match(gate, /is technically correct and practically unclear/);
  assert.match(gate, /Every term the reader does not already own is either decision-required and taught where it appears, or removed/);
  assert.match(gate, /Treat a noun the organization coined as a term the reader has no reason to know/);
  assert.match(gate, /who or what acts, what it does, what it acts on, and what changes for the reader/);
  assert.match(gate, /highest-frequency verb the reader already owns/);
  assert.match(gate, /Abstract nouns are not banned/);
  assert.match(gate, /Abstract nouns are not banned and must not be counted/);
  assert.match(gate, /twenty unrelated companies could publish it unchanged/);
  assert.match(gate, /parallel syntax is correct and should be kept/);
  assert.match(gate, /Treat that as a working default, not a measured threshold/);

  const section = extractSection(reference, "Plain language and first-read comprehension");
  for (const heading of [
    "The reader model",
    "The first-read test",
    "The specialized-term gate",
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
  assert.match(section, /Compression that raises decoding effort is not compression/);
  assert.match(section, /Do not repair unclear writing by adding more jargon/);
  assert.match(section, /Do not apply this test to a single sentence/);
  assert.match(section, /There is no optimal passage length/);
  assert.match(section, /Do not count them/);
  assert.match(section, /Where repetition is correct/);

  const passes = extractSection(skill, "Apply silent final passes");
  assert.match(passes, /Run the first-read comprehension gate, the specialized-term gate, and the CTA gate/);
  assert.match(passes, /before any style, compression, or publication pass/);

  const citability = extractSection(reference, "Written GEO/AEO and citability");
  assert.match(citability, /None of them may raise decoding effort/);
  assert.match(citability, /The unit is the passage, not the individual sentence, and no sentence count defines it/);
});

test("CTAs name an action and a destination, never a mood", () => {
  const cta = extractSection(skill, "Write the CTA as an action label");
  assert.match(cta, /A call to action names an action, not a mood/);
  assert.match(cta, /clear verb \+ concrete object, destination, or result/);
  assert.match(cta, /Never make the reader infer what opens/);
  assert.match(cta, /Keep one canonical label for one materially identical action/);
  assert.match(cta, /Reject them for operational ambiguity/);
  assert.match(cta, /Do not claim they convert worse; no controlled evidence supports that/);

  const standard = extractSection(reference, "CTA standard");
  assert.match(standard, /A CTA is an action label, not a slogan/);
  assert.match(standard, /Name the outcome the reader ends up with, not the motion the interface performs/);
  for (const slogan of ["Take control", "Unlock your potential", "Get clarity", "Start your journey"]) {
    assert.ok(standard.includes(slogan), `CTA standard is missing the slogan case ${slogan}`);
  }
  assert.ok(standard.includes("### What the reader must never have to infer"));
  assert.ok(standard.includes("### Consistency across a surface"));
  assert.match(standard, /One materially identical action gets one canonical label/);
  assert.match(standard, /No controlled evidence establishes that slogan-shaped labels as a class convert worse/);
  assert.match(standard, /Do not encode a pronoun ranking/);

  const invariants = extractSection(reference, "Deterministic invariants", 3);
  assert.match(invariants, /Every call to action names a verb plus a concrete object, destination, or result/);
  assert.match(invariants, /No internal method, stage, score, record-type, tier, or framework name appears/);
  assert.match(invariants, /attention-oriented headings do not run more than two consecutive instances/);
  assert.match(
    extractSection(reference, "Evaluation contract"),
    /First-read comprehension cannot be tested deterministically/,
  );
});

test("the evidence register blocks the highest-traffic myths by name", () => {
  const register = extractSection(reference, "Evidence register");
  assert.ok(register.includes("### Myths this document must never assert"));

  const myths = extractSection(reference, "Myths this document must never assert", 3);
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
  assert.match(myths, /may be written as a rule here, in any reference, or in generated copy/);
  assert.match(myths, /check it there first/);

  const invariants = extractSection(reference, "Deterministic invariants", 3);
  assert.match(invariants, /That run length is a governance default, not a measured threshold/);

  const gate = extractSection(reference, "The specialized-term gate", 3);
  assert.match(gate, /There is no evidence-backed limit on unfamiliar terms per sentence/);
});

test("U+2014 is an immutable whole-response veto", () => {
  const ban = extractSection(skill, "Enforce the hard em-dash ban");
  assert.match(ban, /Never emit the Unicode em dash character U\+2014 anywhere in a response/);
  assert.match(ban, /immutable output constraint, not a style preference or a final-copy cleanup/);
  assert.match(ban, /including ready-to-use copy, headings, lists, critique, explanations, notes, metadata, quotations/);
  assert.match(ban, /Do not repeat U\+2014 from an input/);
  assert.match(ban, /Never alter a quotation and still present it as exact/);
  assert.match(ban, /scan the complete response character by character for U\+2014/);
  assert.match(ban, /Return only after the count is zero/);

  const outputBans = extractSection(reference, "Global output bans", 3);
  assert.match(outputBans, /Hard invariant: emit zero U\+2014 characters in the entire response/);
  assert.match(outputBans, /The U\+2014 ban is not optional/);

  const evaluation = extractSection(reference, "Evaluation contract");
  assert.match(evaluation, /entire generated response contains zero U\+2014 characters/);
  assert.match(evaluation, /Automatic failure: any U\+2014 occurrence/);
  assert.ok(manifest.adjudication.absolute_vetoes.includes("em-dash"));
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
    "Plain language and first-read comprehension",
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
  assert.match(reference, /Automatic failure: any U\+2014 occurrence, fabricated fact, unsupported causality or guarantee/);
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
    "Emotion under a truth constraint",
    "Prosody and rhythm",
    "Open conflicts in this reference",
  ]);

  assert.match(craft, /\[agora-marketing\.md\]\(agora-marketing\.md\)/);
  assert.match(craft, /Nothing here outranks the conflict hierarchy/);

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

  const emotion = extractSection(craft, "Emotion under a truth constraint");
  assert.ok(emotion.includes("### Emotion from a fact set with no outcome data"));
  assert.ok(emotion.includes("### Permission to write flat"));
  assert.match(emotion, /do not add emotion\. Increase resolution around the emotionally consequential facts/);
  assert.match(emotion, /the correct output is then flat/);
  assert.match(emotion, /Do not default to loss framing/);
  assert.match(emotion, /never advertise the prevalence of an undesirable behavior/i);

  const prosody = extractSection(craft, "Prosody and rhythm");
  assert.match(prosody, /Every value in the table below is a \*\*governance default\*\*/);
  assert.match(prosody, /diagnostic signal, not a verdict/);
  assert.match(prosody, /this document adopts neither as universal/);
  assert.match(prosody, /Do not report either as a finding/);

  const conflicts = extractSection(craft, "Open conflicts in this reference");
  assert.match(conflicts, /Question-form subheadings/);
  assert.match(conflicts, /Sentence cadence/);
  assert.match(conflicts, /Do not close either by writing a rule/);
});

test("SKILL.md loads the craft reference only when the task needs it", () => {
  const loading = extractSection(skill, "Load the authority progressively");
  assert.match(loading, /\[references\/agora-craft\.md\]\(references\/agora-craft\.md\)/);
  assert.match(loading, /Load it only for the job it covers/);
  assert.match(loading, /Headlines and titles`/);
  assert.match(loading, /Heroes and short-form sales composition`/);
  assert.match(loading, /Awareness and sophistication staging`/);
  assert.match(loading, /Emotion under a truth constraint`/);
  assert.match(loading, /Prosody and rhythm`/);
  assert.match(loading, /Do not load it for routine/);
});

test("the voice reference measures, stores outside the skill, and refuses impersonation", () => {
  const headings = [...withoutCodeFences(voice).matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(headings, [
    "Contents",
    "What VOICE is",
    "Where profiles live",
    "Corpus admission",
    "What gets measured",
    "The profile format",
    "Writing to a profile",
    "Voice against the tell gate",
    "Checking adherence",
    "Refusals",
  ]);

  const storage = extractSection(voice, "Where profiles live");
  assert.match(storage, /~\/\.agora\/voices\/<slug>\.md/);
  assert.match(storage, /Never inside the skill directory/);
  assert.match(storage, /replaces the installed skill directory/);
  assert.match(storage, /<slug>\.measurements\.json/);
  assert.match(storage, /truncated hashes of each token run rather than as text/);

  const surface = extractSection(voice, "What VOICE is");
  assert.match(surface, /npx -p @maestroagora\/agora agora-voice build/);
  assert.match(surface, /A profile the engine did not produce is not a profile/);
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
  assert.ok(gate.includes("### The owned-vocabulary exception"));
  assert.match(gate, /Voice enters at \*\*level 6\*\* of the conflict hierarchy/);
  assert.match(gate, /Voice never licenses a claim the facts do not support/);
  assert.match(gate, /Voice never overrides the U\+2014 ban/);
  assert.match(gate, /suppresses the generic AI-vocabulary ban for those specific words, and only those/);
  assert.match(gate, /It suppresses the vocabulary ban only/);

  const refusals = extractSection(voice, "Refusals");
  assert.match(refusals, /Refuse to build or apply a profile of a named third party where the purpose is publication under that person's name/);
  assert.match(refusals, /False endorsement/);
  assert.match(refusals, /Fabricated positions/);
  assert.match(refusals, /decline it rather than negotiate/);

  const adherence = extractSection(voice, "Checking adherence");
  assert.match(adherence, /Author approval:/);
  assert.match(adherence, /Never treat a detector score as evidence of authorship/);
});

test("SKILL.md carries VOICE as a modifier with its exception written down", () => {
  const loading = extractSection(skill, "Load the authority progressively");
  assert.match(loading, /\[references\/agora-voice\.md\]\(references\/agora-voice\.md\)/);
  assert.match(loading, /Do not load it for ordinary human-voice cleanup/);

  const job = extractSection(skill, "Choose the job");
  assert.match(job, /`SCIENCE`, `CASE_STUDY`, and `VOICE` are modifiers, not primary jobs/);
  assert.match(job, /`--voice <name>` loads a measured author profile/);
  assert.match(job, /Profiles are stored at `~\/\.agora\/voices\/`, never inside the skill directory/);
  assert.match(job, /Apply the default profile to every mode/);
  assert.match(job, /`--no-voice` or `neutral` \| Load no profile at all/);
  assert.match(job, /Default-on changes nothing above level 6/);
  assert.match(job, /Measurement is computed, never estimated from reading/);
  assert.match(job, /a file that the engine did not produce is not a profile/);

  const conflicts = extractSection(skill, "Resolve conflicts");
  assert.match(conflicts, /An active voice profile enters at level 6/);
  assert.match(conflicts, /never overrides the U\+2014 ban/);
  assert.match(conflicts, /the evidence wins and the profile yields for that sentence/);

  const passes = extractSection(skill, "Apply silent final passes");
  assert.match(passes, /owned-vocabulary list, and only those words, are exempt/);
  assert.match(passes, /strips the voice it was loaded to keep/);
  assert.match(passes, /never makes an unsupported claim writable/);

  const truth = extractSection(skill, "Enforce truth and ethical limits");
  assert.match(truth, /Refuse to build or apply a voice profile of a named third party/);
  assert.match(truth, /declined rather than negotiated/);
});

test("v1.4.0 source links remain available across all references", () => {
  assert.equal(linkFixture.source, "v1.4.0:skills/agora/references/*.md");
  assert.equal(linkFixture.urls.length, 142);
  const current = externalUrls([reference, craft, voice, science, caseStudies].join("\n"));
  const missing = linkFixture.urls.filter((url) => !current.has(url));
  assert.deepEqual(missing, [], `reference dropped source links: ${missing.join(", ")}`);
});

test("public files contain no project-specific residue or temporary citations", () => {
  const publicText = [skill, reference, craft, voice, science, caseStudies, openaiYaml, JSON.stringify(codexPlugin), JSON.stringify(claudePlugin)].join("\n");
  assert.doesNotMatch(publicText, new RegExp(["cite", "surge"].join(""), "i"));
  assert.doesNotMatch(publicText, /turn\d+(?:search|fetch|view|open|file)\d+/i);
  assert.doesNotMatch(publicText, /sandbox:\/\/mnt\/data/i);
  assert.doesNotMatch(skill, /brand-specific|brand overlay|claim ledger/i);
});

test("metadata matches the v1.4.0 release contract", () => {
  const expectedYaml = [
    "interface:",
    '  display_name: "Maestro: Agora"',
    '  short_description: "Truthful persuasion, science, and case studies"',
    '  default_prompt: "Use $agora to turn verified facts into clear, channel-native persuasion, scientific or technical explanations, and evidence-led case studies."',
    "",
  ].join("\n");
  assert.equal(normalizeNewlines(openaiYaml), expectedYaml);
  assert.equal(packageJson.version, "1.4.0");
  assert.equal(codexPlugin.version, packageJson.version);
  assert.equal(claudePlugin.version, packageJson.version);
  assert.match(gitAttributes, /^\* text=auto eol=lf$/m);
  assert.match(gitAttributes, /^\*\.png binary$/m);
  assert.doesNotMatch(skill, /\r\n/);
  assert.doesNotMatch(reference, /\r\n/);
  assert.doesNotMatch(craft, /\r\n/);
  assert.doesNotMatch(voice, /\r\n/);
  assert.doesNotMatch(science, /\r\n/);
  assert.doesNotMatch(caseStudies, /\r\n/);
  assert.doesNotMatch(openaiYaml, /\r\n/);
  assert.equal(codexPlugin.interface.shortDescription, "Truthful persuasion, science, and case studies");
  assert.ok(
    codexPlugin.interface.defaultPrompt.every(
      (prompt) => prompt.startsWith("/agora ") && prompt.length <= 128,
    ),
  );
});

test("blind evaluation corpus tests invariants without expected-answer leakage", async () => {
  assert.equal(manifest.schema_version, 3);
  assert.equal(manifest.skill_version, "1.4.0");
  assert.deepEqual(manifest.generation_contract.pass_to_model, ["prompt_file"]);
  assert.ok(manifest.generation_contract.never_pass_to_model.includes("expected output"));
  assert.equal(manifest.generation_contract.fresh_context_per_case, true);
  assert.equal(manifest.adjudication.method, "blind-pairwise");
  assert.equal(manifest.adjudication.randomize_order, true);
  assert.equal(manifest.adjudication.swap_order, true);
  assert.equal(manifest.adjudication.escalate_on_order_flip, true);
  for (const veto of [
    "unsupported-guarantee",
    "claim-destination-mismatch",
    "invented-misconception",
    "statistical-distortion",
    "false-consensus-or-balance",
    "quote-distortion",
    "permission-or-confidentiality-breach",
    "atypical-result-presented-as-typical",
    "invented-result-or-attribution",
  ]) assert.ok(manifest.adjudication.absolute_vetoes.includes(veto), `missing veto: ${veto}`);
  assert.deepEqual(manifest.rubric.dimensions, [
    "argument-inevitability",
    "sustained-emotional-relevance",
    "proof-salience",
    "mechanism-differentiation",
    "natural-channel-fit",
    "truth-discipline",
    "first-read-comprehension",
    "concrete-action-clarity",
  ]);
  assert.deepEqual(Object.keys(manifest.rubric.domain_dimensions), ["hero", "science", "case-study"]);
  assert.equal(manifest.cases.length, 60);

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
    "sell-mobile-paywall",
    "sell-b2b-cold-email",
    "unsupported-proof",
    "direct-agora-invest",
    "plain-language-insider-terms",
    "cta-names-its-destination",
    "qualifiers-without-clause-stacking",
    "multi-asset-shape-variance",
    "headline-set-across-surfaces",
    "reader-state-mismatch",
    "emotion-without-outcome-data",
    "voice-profile-adherence",
    "voice-build-from-corpus",
    "voice-owned-vocabulary-vs-tell-gate",
    "orientation-without-taxonomy",
    "hero-rivalscope-no-outcome",
    "science-supported-misconception",
    "science-no-misconception",
    "case-permission-pending",
    "case-anonymous-confidential",
    "compose-voice-science-certainty",
  ]);
  const ids = new Set(manifest.cases.map((item) => item.id));
  for (const id of requiredIds) assert.ok(ids.has(id), `missing regression case: ${id}`);

  const promptFiles = new Set();
  for (const item of manifest.cases) {
    assert.equal(Object.hasOwn(item, "expected_output"), false, `${item.id} leaks expected output`);
    assert.ok(Array.isArray(item.hard_gates) && item.hard_gates.length > 0, `${item.id} needs gates`);
    for (const field of [
      "expected_modifiers",
      "expected_science_route",
      "expected_case_family",
      "expected_persuasion_treatment",
      "critical",
      "domain_dimensions",
    ]) assert.ok(Object.hasOwn(item, field), `${item.id} missing ${field}`);
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
