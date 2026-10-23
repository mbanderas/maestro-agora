import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(join(ROOT, ...path.split("/")), "utf8");
const [skill, writingRuntime, marketingRuntime, articleRuntime, articleExamples, manifestText, plan, readme] = await Promise.all([
  read("skills/agora/SKILL.md"),
  read("skills/agora/references/agora-writing-runtime.md"),
  read("skills/agora/references/agora-marketing-runtime.md"),
  read("skills/agora/references/agora-article-runtime.md"),
  read("skills/agora/references/agora-article-examples.md"),
  read("evals/prospective/article-generation-v1.0.0/manifest.json"),
  read("docs/plans/human-writing-generation-upgrade.md"),
  read("README.md"),
]);
const manifest = JSON.parse(manifestText);

test("the internal name describes generation rather than a review product", () => {
  assert.match(plan, /^# Human Writing Layer for article generation/m);
  assert.match(plan, /applied during Agora's existing planning, outlining, drafting, and revision steps/);
  const oldName = ["Human", "Writing", "Critic"].join(" ");
  for (const content of [plan, skill, writingRuntime, marketingRuntime, articleRuntime, articleExamples, manifestText]) {
    assert.equal(content.toLowerCase().includes(oldName.toLowerCase()), false);
  }
});

test("article generation follows the existing brief, voice, outline, draft, and revision path", () => {
  assert.match(skill, /For an article or long-form editorial request, use the existing brief, voice, argument, draft, and revision path/);
  assert.match(skill, /single article procedure/);
  assert.match(skill, /ordinary `INFORM` article uses \[references\/agora-article-runtime\.md\]\(references\/agora-article-runtime\.md\) instead of the marketing runtime/);
  assert.match(skill, /Article-shaped `SELL` work uses both/);
  assert.match(articleRuntime, /Before outlining, privately separate/);
  assert.match(articleRuntime, /In a first-party article, begin with the supplied event or decision, or the reader question it raises/);
  assert.match(articleRuntime, /Do not stage that material with an invented claim about what teams often or typically do/);
  assert.match(articleRuntime, /During revision, replace generic sentences with the user's concrete details/);
  assert.match(skill, /run the shipped `scripts\/article-typography-check\.mjs`/);
  assert.match(skill, /rerun the check, and preserve immutable source text/);
  assert.match(skill, /If Node is unavailable, scan the final string character by character/);
  assert.match(marketingRuntime, /### Article and editorial path/);
  assert.match(marketingRuntime, /Use \[agora-article-runtime\.md\]\(agora-article-runtime\.md\) for article development/);
  assert.match(writingRuntime, /Article development lives in `agora-article-runtime\.md`/);
  assert.match(writingRuntime, /for articles, organize around the reader's question and the strongest supplied material/);
});

test("first-party material informs article structure without changing its factual status", () => {
  assert.match(articleRuntime, /customer examples, numbers, events, decisions, failures, lessons, opinions, external sources, and voice samples/);
  assert.match(articleRuntime, /Keep straight who said what, what was counted, and what remains unknown/);
  assert.match(articleRuntime, /Let the strength and importance of the material determine section order and length/);
  assert.match(articleRuntime, /a customer report into a measured result, or a possibility into an event/);
  assert.match(articleRuntime, /Explain which detail matters and what follows from it/);
  assert.match(articleRuntime, /A number, quotation, or scene earns space through what it explains/);
  assert.match(articleRuntime, /Introduce background when the reader needs it to understand the next move/);
  assert.match(writingRuntime, /let supplied observations, examples, decisions, and constraints determine where detail and space go/i);
  assert.match(articleRuntime, /without presenting an inference as an observation or inventing the author's beliefs/);
});

test("sparse briefs cannot trigger invented experience or supporting facts", () => {
  assert.match(articleRuntime, /For a sparse brief, make the clearest useful point the known facts allow/);
  assert.match(articleRuntime, /Do not invent a customer, first-person story, personal opinion, failure, quotation, precise event, study, statistic, or outcome/);
  assert.match(articleRuntime, /Carry any supplied unmeasured outcome or negative limit into visible copy once when it bounds the conclusion/);
  assert.match(articleRuntime, /Place it beside the inference it limits/);
  assert.match(articleRuntime, /Use external facts only when supplied or when the user requests research and the sources support them/);
  assert.match(skill, /Explicitly authorized fiction or hypotheticals retain their existing route/);
});

test("user instructions and active voice remain ahead of article preferences", () => {
  assert.match(articleRuntime, /Follow an outline, section order, or format the user explicitly requests/);
  assert.match(articleRuntime, /treat the numbers as list markers unless the user asks for numbered headings/);
  assert.match(articleRuntime, /Do not turn a supplied recommendation into an unattributed command/);
  assert.match(articleRuntime, /Trace the user's instructions, first-party material, required facts, length, structure, and active voice through the final article/);
  assert.match(articleRuntime, /A voice sample supplies style habits, not article facts, unless the user also designates those facts for this article/);
  assert.match(articleRuntime, /entrypoint and shared writing runtime still govern factual fidelity, user authority, register, voice, house style, and ready-copy output/);
  assert.match(marketingRuntime, /Follow any structure, stance, or length the user requests/);
  assert.match(marketingRuntime, /Keep a supplied recommendation attributed to its speaker/);
  assert.match(marketingRuntime, /Preserve the requested voice, format, and every material fact while revising/);
});

test("ordinary articles use reader language instead of internal review vocabulary", () => {
  assert.match(skill, /Ordinary articles and customer copy should name the actual event, count, decision, source, or limit/);
  assert.match(articleRuntime, /If it sounds like a legal brief, source review, or writing assessment, recast the passage in ordinary words/);
  assert.match(writingRuntime, /name the actual event, number, person, decision, or limit instead of calling it `evidence`/);
  assert.match(writingRuntime, /State the underlying fact once in reader language instead of announcing a private check/);
  assert.match(articleRuntime, /Run the shared final checks and return only the requested deliverable/);
});

test("article development follows relationships in the material without imposing a template", () => {
  assert.match(articleRuntime, /not a compulsory outline/);
  assert.match(articleRuntime, /Do not manufacture conflict or suspense/);
  assert.match(articleRuntime, /Follow the dependency between ideas instead of filling equal sections/);
  assert.match(articleRuntime, /carry the same example into the next complication/);
  assert.match(articleRuntime, /take the strongest relevant alternative or objection seriously/);
  assert.match(articleRuntime, /retain a failed step when it explains why the next step changed/);
  assert.match(articleRuntime, /End at the state the material reaches/);
  assert.match(articleRuntime, /do not add a decorative callback, maxim, triumph, or recap to manufacture closure/);
  assert.match(articleRuntime, /Keep useful complexity and the author's credible individual choices/);
});

test("optional article examples remain discoverable without automatic activation", () => {
  assert.doesNotMatch(skill, /When article teaching examples are available/);
  assert.match(readme, /\[Article examples\]\(skills\/agora\/references\/agora-article-examples\.md\)/);
  assert.match(readme, /They are not loaded automatically/);
  assert.match(articleExamples, /original synthetic demonstration with a closed fact set/);
  assert.match(articleExamples, /not a published excerpt, author profile, article fact source, or required structure/);
  assert.match(articleExamples, /Transfer the editorial decision, not its wording or subject matter/);
  assert.match(articleExamples, /The user's requested structure and voice take priority/);
  assert.match(articleExamples, /Skip a move that the material does not support/);
  assert.match(writingRuntime, /A teaching example is neither an author sample nor a measured profile/);
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
