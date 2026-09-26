import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(join(ROOT, ...path.split("/")), "utf8");
const [skill, writingRuntime, marketingRuntime, manifestText, plan] = await Promise.all([
  read("skills/agora/SKILL.md"),
  read("skills/agora/references/agora-writing-runtime.md"),
  read("skills/agora/references/agora-marketing-runtime.md"),
  read("evals/prospective/article-generation-v1.0.0/manifest.json"),
  read("docs/plans/human-writing-generation-upgrade.md"),
]);
const manifest = JSON.parse(manifestText);

test("the internal name describes generation rather than a review product", () => {
  assert.match(plan, /^# Human Writing Layer for article generation/m);
  assert.match(plan, /applied during Agora's existing planning, outlining, drafting, and revision steps/);
  const oldName = ["Human", "Writing", "Critic"].join(" ");
  for (const content of [plan, skill, writingRuntime, marketingRuntime, manifestText]) {
    assert.equal(content.toLowerCase().includes(oldName.toLowerCase()), false);
  }
});

test("article generation follows the existing brief, voice, outline, draft, and revision path", () => {
  assert.match(skill, /For an article or long-form editorial request, use the existing brief, voice, argument, draft, and revision path/);
  assert.match(skill, /Before outlining, privately separate/);
  assert.match(skill, /When the brief supplies a first-party event or decision, open the article with it/);
  assert.match(skill, /Do not stage that material with an invented claim about what teams often or typically do/);
  assert.match(skill, /During revision, replace generic sentences with the user's concrete details/);
  assert.match(skill, /run the shipped `scripts\/article-typography-check\.mjs`/);
  assert.match(marketingRuntime, /### Article and editorial path/);
  assert.match(writingRuntime, /for articles, organize around the reader's question and the strongest supplied material/);
});

test("first-party material informs article structure without changing its factual status", () => {
  assert.match(skill, /customer examples, numbers, events, decisions, failures, lessons, opinions, external sources, and voice samples/);
  assert.match(skill, /Keep straight who said what, what was counted, and what remains unknown/);
  assert.match(skill, /Let the strength and importance of the material determine section order and length/);
  assert.match(skill, /a customer report into a measured result, or a possibility into an event/);
  assert.match(marketingRuntime, /Put the user's example, count, or decision beside the point it explains/);
  assert.match(writingRuntime, /let supplied observations, examples, decisions, and constraints determine where detail and space go/);
});

test("sparse briefs cannot trigger invented experience or supporting facts", () => {
  assert.match(skill, /For a sparse brief, make the clearest useful point the known facts allow/);
  assert.match(skill, /Do not invent a customer, first-person story, personal opinion, failure, quotation, precise event, study, statistic, or outcome/);
  assert.match(skill, /carry any supplied unmeasured outcome or negative limit into visible copy once/);
  assert.match(skill, /Use external facts only when supplied or when the user requests research and the sources support them/);
  assert.match(marketingRuntime, /without manufacturing a case, study, statistic, personal experience, or opinion/);
});

test("user instructions and active voice remain ahead of article preferences", () => {
  assert.match(skill, /Follow an outline, section order, or format the user explicitly requests/);
  assert.match(skill, /treat the numbers as list markers unless the user asks for numbered headings/);
  assert.match(skill, /Do not turn a supplied recommendation into an unattributed command/);
  assert.match(skill, /Trace the user's instructions, first-party material, required facts, length, structure, and active voice through the final article/);
  assert.match(skill, /A voice sample supplies style habits, not article facts/);
  assert.match(marketingRuntime, /Follow any structure, stance, or length the user requests/);
  assert.match(marketingRuntime, /Keep a supplied recommendation attributed to its speaker/);
  assert.match(marketingRuntime, /Preserve the requested voice, format, and every material fact while revising/);
});

test("ordinary articles use reader language instead of internal review vocabulary", () => {
  assert.match(skill, /Ordinary articles and customer copy should name the actual event, count, decision, source, or limit/);
  assert.match(skill, /if it sounds like a legal brief, source review, or writing assessment, recast the passage in ordinary words/);
  assert.match(writingRuntime, /name the actual event, number, person, decision, or limit instead of calling it `evidence`/);
  assert.match(marketingRuntime, /Remove prose that sounds like a legal brief or source review/);
  assert.match(marketingRuntime, /State the actual fact, speaker, or limit in everyday words instead/);
});

test("prospective cases cover all requested generation behaviors", async () => {
  assert.equal(manifest.status, "prospective");
  assert.equal(manifest.generation_contract.fresh_context_per_case, true);
  assert.deepEqual(manifest.generation_contract.pass_to_model, ["prompt_file"]);
  const cases = new Map(manifest.cases.map((entry) => [entry.id, entry]));
  assert.equal(cases.size, 5);
  for (const id of ["first-party-article", "sparse-brief-article", "user-structure-controls", "task-voice-article", "plain-word-choice"]) {
    const entry = cases.get(id);
    assert.ok(entry, id);
    assert.ok(entry.acceptance.length >= 3, id);
    assert.ok(entry.prohibited_content.length >= 3, id);
    assert.match(entry.prompt_file, /^prompts\/[a-z-]+\.md$/);
    const prompt = await read(`evals/prospective/article-generation-v1.0.0/${entry.prompt_file}`);
    assert.match(prompt, /^\/agora /);
    assert.match(prompt, /Return only the article/);
  }
  const firstParty = await read("evals/prospective/article-generation-v1.0.0/prompts/first-party-article.md");
  assert.match(firstParty, /76 duplicate tickets/);
  assert.match(firstParty, /11 hours/);
  const sparse = await read("evals/prospective/article-generation-v1.0.0/prompts/sparse-brief-article.md");
  assert.match(sparse, /No company facts, customer examples, research, outcomes, or numbers are supplied/);
  const userStructure = await read("evals/prospective/article-generation-v1.0.0/prompts/user-structure-controls.md");
  assert.match(userStructure, /Use exactly these three section heading texts/);
  assert.match(userStructure, /numbers indicate order and are not part of the headings/);
  assert.match(userStructure, /End with this exact question/);
  const voice = await read("evals/prospective/article-generation-v1.0.0/prompts/task-voice-article.md");
  assert.match(voice, /samples below show style only/);
  assert.match(voice, /no rhetorical questions/);
  const plain = await read("evals/prospective/article-generation-v1.0.0/prompts/plain-word-choice.md");
  assert.match(plain, /retail managers/);
  assert.doesNotMatch(plain, /\b(?:evidence|claim|qualification|framework)\b/i);
});
