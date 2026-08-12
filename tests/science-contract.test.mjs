import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_ROOT = join(ROOT, "skills", "agora");
const skill = await readFile(join(SKILL_ROOT, "SKILL.md"), "utf8");
const science = await readFile(join(SKILL_ROOT, "references", "agora-science.md"), "utf8");

test("SCIENCE is discoverable, progressive, and composable", () => {
  assert.match(skill, /scientific communication, technical explanation, research communication, and science video scripts/);
  assert.match(skill, /\[references\/agora-science\.md\]\(references\/agora-science\.md\)/);
  assert.match(skill, /`SCIENCE`, `CASE_STUDY`, and `VOICE` are modifiers, not primary jobs/);
  assert.match(skill, /`INFORM \+ SCIENCE \+ CASE_STUDY`/);
});

test("science routes empirical, technical, and mixed evidence separately", () => {
  for (const route of ["EMPIRICAL", "TECHNICAL", "MIXED"]) {
    assert.ok(science.includes(`\`${route}\``), route);
  }
  assert.match(science, /do not treat all technical writing as empirical science/i);
});

test("science preserves claim class, causality, statistical meaning, and uncertainty", () => {
  for (const claim of [
    "Direct observation or measured result",
    "Model or proposed mechanism",
    "Interpretation",
    "Recommendation",
    "Hypothesis or speculation",
    "Unknown or unmeasured",
  ]) {
    assert.match(science, new RegExp(claim));
  }
  assert.match(science, /Never raise a claim's certainty while simplifying it/);
  assert.match(science, /absence of evidence is not evidence of absence/);
  assert.match(science, /report magnitude and uncertainty, not a significance label alone/);
  assert.match(science, /For a one-time observational measurement, state when temporal order is unknown and reverse causation remains possible/);
  assert.match(science, /Randomize a feasible intervention, opportunity, encouragement, or program/);
  assert.match(science, /give natural frequencies and the absolute percentage-point change together/);
  assert.match(science, /one result alone cannot determine an individual's action/);
  assert.match(science, /For an unresolved minority finding, make the unknowns operational/);
  assert.match(science, /replicates under the same condition, generalizes beyond the studied population/);
  assert.match(science, /If the sources do not support describing the field as evenly divided, say that plainly/);
  assert.match(science, /Do not call it `credible`, `promising`, `compelling`, `important`/);
  assert.match(science, /Preserving a finding does not require endorsing it/);
});

test("misconception, question-first, analogy, and A-B threading are bounded procedures", () => {
  assert.match(science, /Use prevalence language and misconceptions as the user requests/);
  assert.match(science, /Do not introduce either independently as an unrequested surrounding claim/);
  assert.match(science, /supported belief -> supported contradiction -> corrected model -> mechanism -> boundary/);
  assert.match(science, /Do not invent a counter-observation merely to strengthen the reveal/);
  assert.match(science, /do not postpone emergency, safety, or operational instructions for suspense/i);
  assert.match(science, /Every analogy must identify/);
  assert.match(science, /where the analogy breaks/);
  assert.match(science, /an A-thread can carry/);
  assert.match(science, /When the request explicitly requires A\/B threading, make both threads visible/);
  assert.match(science, /prevent the human or experimental thread from disappearing through the technical middle/);
  assert.match(science, /do not.*claim the structure improves retention without direct measurement/is);
});

test("SCIENCE keeps high-stakes verification inside explicit review mode", () => {
  assert.match(science, /Optional review only\. Run this ledger/);
  assert.match(science, /Outside that mode, treat the user's claim classes and certainty as controlling/);
  assert.match(science, /Retrieve, rank, reconcile, or reject sources only when the user requests scientific claim review or evidence-led writing/);
  assert.match(science, /medical, legal, financial, safety-critical, or rapidly changing technical claims/);
  assert.match(science, /retrieve current authoritative sources before writing/);
  assert.match(science, /The static skill cannot establish current facts/);
});

test("SCIENCE composition cannot silently replace the user's proposition", () => {
  assert.match(science, /It changes expression, not proposition/);
  assert.match(science, /The user's current brief controls claims, certainty, terminology, and attribution/);
  assert.match(science, /Other written surfaces do not inherit GEO\/AEO formatting/);
});
