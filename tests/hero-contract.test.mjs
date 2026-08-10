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
  assert.match(skill, /`PROMOTIONAL` requires explicit campaign context and verified support/);
  assert.match(skill, /do not spend the subhead inventorying inputs, features, outputs, or methodology/);
  assert.match(skill, /Compress multiple data feeds into the relation they establish/);
  assert.doesNotMatch(skill, /\| `HERO` \|/);
});

test("hero doctrine separates truth gates from persuasive optimization", () => {
  assert.match(marketing, /Truth is the safety boundary around persuasion, not the optimization target/);
  assert.match(craft, /Separate the safety floor from the optimization target/);
  assert.match(craft, /Passing the floor does not make the copy good/);
  assert.match(craft, /additional proof or qualification helps only when it improves belief, orientation, or the next decision/);
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
  assert.match(craft, /Do not force an enemy, fear, identity, or loss/);
});
