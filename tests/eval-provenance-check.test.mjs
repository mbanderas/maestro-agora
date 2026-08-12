import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { validateEvaluationProvenance } from "../scripts/eval-provenance-check.mjs";

const manifest = { cases: [{ id: "case-one" }] };
const adjudications = [{ id: "case-one", passes: [{ pass: 1 }, { pass: 2 }] }];

async function withEvidence(callback) {
  const root = await mkdtemp(join(tmpdir(), "agora-eval-provenance-"));
  try {
    for (const directory of ["generation-a-outputs", "generation-b-outputs", "generation-logs", "judge-prompts", "judgments", "judge-logs"]) {
      await mkdir(join(root, directory));
    }
    await writeFile(join(root, "generation-a-outputs", "case-one.md"), "Candidate response\n");
    await writeFile(join(root, "generation-b-outputs", "case-one.md"), "Incumbent response\n");
    await writeFile(join(root, "generation-logs", "generation-a-case-one.json"), JSON.stringify({
      schema_version: 1,
      runtime: "codex-subagent",
      model: "gpt-5.6-sol",
      fresh_context: true,
      skill_access: true,
      conversion_reference_access: true,
      skill_root: "generation-a-work/.agents/skills/agora",
      prompt_file: "evals/blind/v1.7.0/prompts/case-one.md",
      output_file: "generation-a-outputs/case-one.md",
    }));
    await writeFile(join(root, "generation-logs", "generation-b-case-one.json"), JSON.stringify({
      schema_version: 1,
      runtime: "codex-subagent",
      model: "gpt-5.6-sol",
      fresh_context: true,
      skill_access: true,
      conversion_reference_access: false,
      skill_root: "generation-b-work/.agents/skills/agora",
      prompt_file: "evals/blind/v1.7.0/prompts/case-one.md",
      output_file: "generation-b-outputs/case-one.md",
    }));
    for (const pass of [1, 2]) {
      await writeFile(join(root, "judge-prompts", `case-one-pass${pass}.md`), "Blind prompt\n");
      await writeFile(join(root, "judgments", `case-one-pass${pass}.json`), "{}\n");
      await writeFile(join(root, "judge-logs", `case-one-pass${pass}.json`), JSON.stringify({
        schema_version: 1,
        runtime: "codex-subagent",
        model: "gpt-5.6-sol",
        fresh_context: true,
        skill_access: false,
      }));
    }
    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("complete isolated generation and blind-judge provenance passes", async () => {
  await withEvidence(async (root) => {
    assert.deepEqual(await validateEvaluationProvenance({ root, manifest, adjudications }), []);
  });
});

test("missing conversion read, banned typography, and judge skill access fail", async () => {
  await withEvidence(async (root) => {
    await writeFile(join(root, "generation-logs", "generation-a-case-one.json"), JSON.stringify({
      schema_version: 1,
      runtime: "codex-subagent",
      model: "gpt-5.6-sol",
      fresh_context: true,
      skill_access: true,
      conversion_reference_access: false,
      skill_root: "generation-a-work/.agents/skills/agora",
      prompt_file: "evals/blind/v1.7.0/prompts/case-one.md",
      output_file: "generation-a-outputs/case-one.md",
    }));
    await writeFile(join(root, "generation-a-outputs", "case-one.md"), "Invalid \u2014 output\n");
    await writeFile(join(root, "judge-logs", "case-one-pass1.json"), JSON.stringify({
      schema_version: 1,
      runtime: "codex-subagent",
      model: "gpt-5.6-sol",
      fresh_context: true,
      skill_access: false,
      path: ".agents/skills/agora/SKILL.md",
    }));
    const errors = await validateEvaluationProvenance({ root, manifest, adjudications });
    assert.match(errors.join("\n"), /banned typography/);
    assert.match(errors.join("\n"), /conversion reference access attestation/);
    assert.match(errors.join("\n"), /skill access evidence/);
  });
});
