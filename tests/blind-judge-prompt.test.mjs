import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { buildBlindJudgePrompt, normalizeOriginalTask } from "../scripts/blind-judge-prompt.mjs";

const judgeInstructions = await readFile(
  new URL("../evals/blind/v1.7.0/judge-instructions.md", import.meta.url),
  "utf8",
);
const judgeSchema = JSON.parse(await readFile(
  new URL("../evals/blind/v1.7.0/judge-schema.json", import.meta.url),
  "utf8",
));

const manifest = {
  hard_gate_definitions: {
    "fact-boundary": "Do not invent facts.",
  },
};

const item = {
  id: "case-one",
  hard_gates: ["fact-boundary"],
};

const template = `HARD GATES
{{HARD_GATES}}
ORIGINAL TASK
{{ORIGINAL_TASK}}
RESPONSE A
{{RESPONSE_A}}
RESPONSE B
{{RESPONSE_B}}`;

test("judge prompt strips only the activation directive and preserves blind order", () => {
  const prompt = buildBlindJudgePrompt({
    manifest,
    item,
    template,
    originalTask: "/agora --no-voice\nWrite the page.",
    responseA: "First response",
    responseB: "Second response",
  });

  assert.doesNotMatch(prompt, /\/agora/);
  assert.match(prompt, /- fact-boundary: Do not invent facts\./);
  assert.ok(prompt.indexOf("First response") < prompt.indexOf("Second response"));
  assert.doesNotMatch(prompt, /\{\{/);
});

test("ordinary original-task text remains unchanged", () => {
  assert.equal(normalizeOriginalTask("Write /agora literally."), "Write /agora literally.");
  assert.equal(
    normalizeOriginalTask("/agora --no-voice Write the page."),
    "Write the page.",
  );
});

test("unknown hard gates and malformed templates fail closed", () => {
  assert.throws(
    () => buildBlindJudgePrompt({
      manifest,
      item: { ...item, hard_gates: ["unknown"] },
      template,
      originalTask: "Task",
      responseA: "A",
      responseB: "B",
    }),
    /unknown hard gate/,
  );
  assert.throws(
    () => buildBlindJudgePrompt({
      manifest,
      item,
      template: template.replace("{{RESPONSE_B}}", "missing"),
      originalTask: "Task",
      responseA: "A",
      responseB: "B",
    }),
    /RESPONSE_B.*exactly once/,
  );
});

test("versioned judge protocol anchors every score and forbids unknown gate states", () => {
  for (const anchor of [1, 2, 3, 4, 5]) {
    assert.match(judgeInstructions, new RegExp(`- ${anchor}:`));
  }
  assert.match(judgeInstructions, /Every hard gate listed below applies independently to both responses/);
  assert.match(judgeInstructions, /gate ID absent from the array means the response passed/);
  assert.match(judgeInstructions, /Hard gates override scores/);
  assert.match(judgeInstructions, /uniquely invalid response cannot score above the valid response/);

  for (const field of ["aHardGateFailures", "bHardGateFailures"]) {
    assert.ok(judgeSchema.required.includes(field));
    assert.equal(judgeSchema.properties[field].type, "array");
    assert.equal(judgeSchema.properties[field].uniqueItems, true);
    assert.deepEqual(judgeSchema.properties[field].items.type, "string");
  }
});
