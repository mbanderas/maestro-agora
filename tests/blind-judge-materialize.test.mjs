import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { materializeBlindJudgePrompt } from "../scripts/blind-judge-materialize.mjs";
import { expectedBlindOrder } from "../scripts/blind-judgment-ingest.mjs";

test("materializer derives blind order and writes one opaque prompt", async () => {
  const root = await mkdtemp(join(tmpdir(), "agora-judge-materialize-"));
  try {
    const blindRoot = join(root, "blind");
    const evaluationRoot = join(root, "evaluation");
    await mkdir(join(blindRoot, "prompts"), { recursive: true });
    for (const side of ["candidate", "incumbent"]) {
      await mkdir(join(evaluationRoot, `${side}-outputs`), { recursive: true });
      await writeFile(join(evaluationRoot, `${side}-outputs`, "case-one.md"), `${side} response\n`);
    }
    const manifest = {
      hard_gate_definitions: { gate: "Preserve facts." },
      cases: [{ id: "case-one", prompt_file: "prompts/case-one.md", hard_gates: ["gate"] }],
    };
    const manifestPath = join(blindRoot, "manifest.json");
    await writeFile(manifestPath, JSON.stringify(manifest));
    await writeFile(join(blindRoot, "prompts", "case-one.md"), "/agora --no-voice Write it.\n");
    await writeFile(
      join(blindRoot, "judge-instructions.md"),
      "{{HARD_GATES}}\n{{ORIGINAL_TASK}}\nA={{RESPONSE_A}}\nB={{RESPONSE_B}}\n",
    );

    const result = await materializeBlindJudgePrompt({
      evaluationRoot,
      manifestPath,
      caseId: "case-one",
      pass: 1,
    });
    assert.deepEqual(result.order, expectedBlindOrder("case-one", 1));
    const prompt = await readFile(result.promptPath, "utf8");
    assert.doesNotMatch(prompt, /\/agora/);
    assert.match(prompt, /- gate: Preserve facts\./);
    assert.ok(
      prompt.indexOf(`${result.order[0]} response`) < prompt.indexOf(`${result.order[1]} response`),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
