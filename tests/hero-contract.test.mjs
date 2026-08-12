import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_ROOT = join(ROOT, "skills", "agora");
const skill = await readFile(join(SKILL_ROOT, "SKILL.md"), "utf8");
const marketing = await readFile(join(SKILL_ROOT, "references", "agora-marketing.md"), "utf8");
const craft = await readFile(join(SKILL_ROOT, "references", "agora-craft.md"), "utf8");

test("hero work uses an internal treatment without adding a primary mode", () => {
  for (const mode of ["POSITION", "SELL", "INVEST", "INFORM", "TRANSACT"]) {
    assert.ok(skill.includes(`| \`${mode}\` |`), mode);
  }
  assert.match(skill, /Select persuasion treatment internally/);
  assert.match(skill, /`COMMERCIALLY_ASSERTIVE`/);
  assert.match(skill, /Use `PROMOTIONAL` when the user requests campaign intensity or provides campaign context/);
  assert.match(skill, /do not spend the subhead inventorying inputs, features, outputs, or methodology/);
  assert.match(skill, /Compress multiple data feeds into the relation they establish/);
  assert.match(skill, /For a high-stakes hero, controlled commercial force comes from the inspectable operational decision or human agency/);
  assert.match(skill, /Preserve the exact named checks, quantifiers, obligations, human-review step, and material limitations/);
  assert.doesNotMatch(skill, /\| `HERO` \|/);
});

test("hero doctrine separates brief fidelity from persuasive optimization", () => {
  assert.match(marketing, /User direction is the optimization target/);
  assert.match(craft, /Separate the brief-fidelity floor from the optimization target/);
  assert.match(craft, /contradicts the user's requested claim, offer, or framing/);
  assert.match(craft, /inserts an unsolicited warning, disclaimer, disclosure label, or policy judgment/);
  assert.match(craft, /additional proof or qualification helps only when it improves belief, orientation, or the next decision/);
  assert.match(craft, /On medical, clinical, legal, financial, safety, and other high-stakes heroes, preserve the exact supplied name and scope/);
  assert.match(craft, /Compression may distribute those terms across the composition/);
  assert.match(craft, /It may not shorten `configured dose ranges` to `configured dose`/);
  assert.match(craft, /Controlled intensity does not mean a capability label/);
  assert.match(craft, /Lead with the supported operational decision, inspectable reason, or human agency/);
  assert.match(craft, /Carry the exact consequential object into the headline/);
  assert.match(craft, /Preserve high-stakes quantifiers and obligations exactly/);
  assert.match(craft, /`Every`, `each`, `a`, `may`, and `must` are not interchangeable/);
  assert.match(craft, /State the product action directly, then state the required human action directly/);
  assert.match(craft, /If the source says `A reviewer must review and release the item`, keep `must` in the finished composition/);
  assert.match(craft, /Prefer a supported evidence-access or decision-control promise over an imperative/);
  assert.match(craft, /`Know why the order was flagged` promises inspectable information/);
});

test("sales rewrites preserve delivery roles, burden, and source-relative strengths", () => {
  assert.match(skill, /apply `Delivery-model ownership` and, when rewriting supplied copy, `Rewrite regression gate`/);
  assert.match(skill, /Preserve user-selected framing/);
  assert.match(skill, /rewrite regression gate when rewriting supplied copy/);

  assert.match(marketing, /### Delivery-model ownership/);
  assert.match(marketing, /This is source and offer fidelity, not claim, compliance, or moral review/);
  assert.match(marketing, /Do not invent or magnify preparation, training, review cycles, handoffs, approvals, dependencies, response times, frequency, or internal coordination/);
  assert.match(marketing, /A buyer-led headline can be valid when an adjacent element makes provider ownership clear/);
  assert.match(marketing, /Repair responsibility locally/);

  assert.match(marketing, /### Rewrite regression gate/);
  assert.match(marketing, /A candidate can pass every standalone rule and still weaken the source/);
  assert.match(marketing, /supported promise and selected certainty/);
  assert.match(marketing, /buyer effort by type, amount, frequency, timing, dependencies, approvals, and coordination/);
  assert.match(marketing, /Keep the source when the candidate produces no material improvement or introduces a material regression/);
  assert.match(marketing, /Improve your brand's chances of becoming part of the answer/);

  assert.match(craft, /delivery model, including what the provider performs and what the buyer must genuinely supply/);
  assert.match(craft, /For rewrites, run `Rewrite regression gate`/);
});

test("hero is evaluated as a distributed composition", () => {
  for (const element of [
    "headline",
    "subhead",
    "primary CTA",
    "visual or evidence context",
    "immediate next section",
  ]) {
    assert.match(craft, new RegExp(element, "i"));
  }
  assert.match(craft, /The unit is the composition/);
  assert.match(craft, /subhead as a handoff from promise to belief/);
  assert.match(craft, /Do not turn the subhead into an input list, feature ledger, or compressed methodology/);
  assert.match(craft, /When several inputs prove only breadth, compress them to the reader-owned relation that matters/);
  assert.match(craft, /name the decision or artifact the destination actually delivers rather than inventorying every format/);
  assert.match(craft, /Do not let eligibility or delivery limits displace that primary value/);
  assert.match(craft, /supplied response time or service commitment/);
  assert.match(marketing, /properties of the page and coherent passages/);
  assert.match(marketing, /Do not force article-style self-containment into every first-screen sentence/);
});

test("claim grammar and RivalScope remain bounded by destination and outcome evidence", () => {
  for (const grammar of ["See X", "Learn how to X", "We help you X", "Do X more often", "You will X"] ) {
    assert.ok(craft.includes(`\`${grammar}\``), grammar);
  }
  assert.match(craft, /Permanent RivalScope regression fixture/);
  assert.match(craft, /It does not permit a claim that RivalScope improves win rate or guarantees a future victory/);
});

test("hero route generation requires semantic alternatives and one recommended output", () => {
  assert.match(craft, /at least four meaningfully different routes as a governance default, not four synonyms/);
  assert.match(craft, /Return one recommended composition by default/);
  assert.match(craft, /Keep worksheet labels out of the ready-to-use copy/);
  assert.match(craft, /Use labels around the copy when the user requests component fields/);
  assert.match(skill, /Return finished copy, not a worksheet/);
  assert.match(craft, /Follow the emotional direction the user chooses/);
  assert.match(craft, /Keep the headline to one commercial argument/);
  assert.match(craft, /When two numbers make it read like a report/);
  assert.match(craft, /Keep both numbers together only when their relationship is the argument/);
});
