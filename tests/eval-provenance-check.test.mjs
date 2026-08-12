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
    for (const directory of ["candidate-outputs", "incumbent-outputs", "generation-logs", "judgments", "judge-logs"]) {
      await mkdir(join(root, directory));
    }
    await writeFile(join(root, "candidate-outputs", "case-one.md"), "Candidate response\n");
    await writeFile(join(root, "incumbent-outputs", "case-one.md"), "Incumbent response\n");
    await writeFile(
      join(root, "generation-logs", "candidate-case-one.log"),
      "## Accept direct invocation\n## Route the decision before drafting\n",
    );
    await writeFile(join(root, "generation-logs", "incumbent-case-one.log"), "## Accept direct invocation\n");
    for (const pass of [1, 2]) {
      await writeFile(join(root, "judgments", `case-one-pass${pass}.json`), "{}\n");
      await writeFile(join(root, "judge-logs", `case-one-pass${pass}.log`), "Blind evaluator completed.\n");
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
    await writeFile(join(root, "generation-logs", "candidate-case-one.log"), "## Accept direct invocation\n");
    await writeFile(join(root, "candidate-outputs", "case-one.md"), "Invalid \u2014 output\n");
    await writeFile(join(root, "judge-logs", "case-one-pass1.log"), ".agents/skills/agora/SKILL.md\n");
    const errors = await validateEvaluationProvenance({ root, manifest, adjudications });
    assert.match(errors.join("\n"), /banned typography/);
    assert.match(errors.join("\n"), /conversion reference read evidence/);
    assert.match(errors.join("\n"), /skill access evidence/);
  });
});
