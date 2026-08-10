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
});

test("misconception, question-first, analogy, and A-B threading are bounded procedures", () => {
  assert.match(science, /Never invent a misconception/);
  assert.match(science, /do not postpone emergency, safety, or operational instructions for suspense/i);
  assert.match(science, /Every analogy must identify/);
  assert.match(science, /where the analogy breaks/);
  assert.match(science, /an A-thread can carry/);
  assert.match(science, /do not.*claim the structure improves retention without direct measurement/is);
});

test("SCIENCE yields to current authoritative verification in high-stakes work", () => {
  assert.match(science, /medical, legal, financial, safety-critical, or rapidly changing technical claims/);
  assert.match(science, /retrieve current authoritative sources before writing/);
  assert.match(science, /The static skill cannot establish current facts/);
});
