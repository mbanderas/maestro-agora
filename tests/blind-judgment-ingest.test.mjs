import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  BLIND_ORDER_SEED,
  expectedBlindOrder,
  ingestBlindJudgments,
  normalizeBlindJudgment,
} from "../scripts/blind-judgment-ingest.mjs";
import { buildBlindJudgePrompt } from "../scripts/blind-judge-prompt.mjs";
import {
  ELIGIBILITY_SCORE_DIMENSIONS,
  validateEligibility,
} from "../scripts/blind-eligibility.mjs";

const dimensions = ["brief-fidelity", "composition-fit"];
const scores = (value) => Object.fromEntries(dimensions.map((dimension) => [dimension, value]));
const manifest = {
  skill_version: "1.7.0",
  rubric: { dimensions, domain_dimensions: {} },
  hard_gate_definitions: { "fact-boundary": "Preserve supplied facts." },
};
const item = {
  id: "case-one",
  domain_dimensions: [],
  hard_gates: ["fact-boundary"],
  prompt_file: "prompts/case-one.md",
};
const originalTask = "Write the page. Closed facts: supplied premise.";
const sideResponses = {
  candidate: "Candidate response with an unsupported claim.",
  incumbent: "Incumbent response with a supported claim.",
};
const evidenceFor = (failures, response) => failures.map((gate) => ({
  gate,
  excerpt: response,
  missingPremise: "Closed facts: supplied premise.",
}));
const digest = (value) => createHash("sha256").update(value).digest("hex");
const judgeRun = {
  schema_version: 1,
  runtime: "codex-subagent",
  model: "gpt-5.6-sol",
  fresh_context: true,
  skill_access: false,
};
const custodyFor = (pass) => ({
  schema_version: 1,
  artifacts: {
    original_task: { path: "evals/blind/v1.7.0/prompts/case-one.md", sha256: digest("task") },
    candidate_response: { path: "generation-a-outputs/case-one.md", sha256: digest("candidate") },
    incumbent_response: { path: "generation-b-outputs/case-one.md", sha256: digest("incumbent") },
    judge_prompt: { path: `judge-prompts/case-one-pass${pass}.md`, sha256: digest(`prompt-${pass}`) },
    raw_judgment: { path: `judgments/case-one-pass${pass}.json`, sha256: digest(`judgment-${pass}`) },
    judge_log: { path: `judge-logs/case-one-pass${pass}.json`, sha256: digest(`log-${pass}`) },
  },
  judge_run: judgeRun,
});
const contextForPass = (pass) => {
  const order = expectedBlindOrder(item.id, pass);
  return {
    originalTask,
    responseA: sideResponses[order[0]],
    responseB: sideResponses[order[1]],
  };
};
const normalize = (values) => normalizeBlindJudgment({
  manifest,
  item,
  ...values,
  ...contextForPass(values.pass),
  custody: values.custody ?? custodyFor(values.pass),
});

const rawJudgment = ({
  pass,
  winner,
  candidateFailures = [],
  incumbentFailures = [],
  candidateScore = 4,
  incumbentScore = 4,
}) => {
  const order = expectedBlindOrder(item.id, pass);
  const values = {
    candidate: {
      scores: scores(candidateScore),
      failures: candidateFailures,
      evidence: evidenceFor(candidateFailures, sideResponses.candidate),
    },
    incumbent: {
      scores: scores(incumbentScore),
      failures: incumbentFailures,
      evidence: evidenceFor(incumbentFailures, sideResponses.incumbent),
    },
  };
  return {
    winner: winner === "tie" ? "tie" : (order[0] === winner ? "A" : "B"),
    aScores: values[order[0]].scores,
    bScores: values[order[1]].scores,
    aHardGateFailures: values[order[0]].failures,
    bHardGateFailures: values[order[1]].failures,
    aHardGateEvidence: values[order[0]].evidence,
    bHardGateEvidence: values[order[1]].evidence,
    rationale: "Private raw rationale",
  };
};

test("seeded orders are deterministic and pass 2 swaps pass 1", () => {
  assert.equal(BLIND_ORDER_SEED, "agora-v1.7.0-blind-order-v1");
  const first = expectedBlindOrder(item.id, 1);
  assert.deepEqual(expectedBlindOrder(item.id, 1), first);
  assert.deepEqual(expectedBlindOrder(item.id, 2), [...first].reverse());
  assert.deepEqual(new Set(expectedBlindOrder(item.id, 3)), new Set(["candidate", "incumbent"]));
});

test("raw A/B judgment maps deterministic evidence and drops rationale", () => {
  const order = expectedBlindOrder(item.id, 1);
  const context = contextForPass(1);
  const normalized = normalize({
    pass: 1,
    judgment: {
      winner: "A",
      aScores: scores(5),
      bScores: scores(3),
      aHardGateFailures: [],
      bHardGateFailures: ["fact-boundary"],
      aHardGateEvidence: [],
      bHardGateEvidence: evidenceFor(["fact-boundary"], context.responseB),
      rationale: "Private raw rationale",
    },
  });

  assert.equal(normalized.winner, order[0]);
  assert.deepEqual(normalized.candidateScores, order[0] === "candidate" ? scores(5) : scores(3));
  assert.deepEqual(
    normalized.candidateHardGateFailures,
    order[0] === "candidate" ? [] : ["fact-boundary"],
  );
  assert.deepEqual(
    normalized.incumbentHardGateFailures,
    order[0] === "incumbent" ? [] : ["fact-boundary"],
  );
  assert.equal("rationale" in normalized, false);
  assert.equal("aHardGateEvidence" in normalized, false);
  assert.equal("bHardGateEvidence" in normalized, false);
  assert.deepEqual(
    normalized.candidateHardGateEvidence,
    order[0] === "candidate" ? [] : evidenceFor(["fact-boundary"], sideResponses.candidate),
  );
  assert.deepEqual(
    normalized.incumbentHardGateEvidence,
    order[0] === "incumbent" ? [] : evidenceFor(["fact-boundary"], sideResponses.incumbent),
  );
  assert.deepEqual(normalized.custody, custodyFor(1));
});

test("normalization maps both sides' failures and enforces symmetric winner eligibility", () => {
  const mapped = normalize({
    pass: 1,
    judgment: rawJudgment({
      pass: 1,
      winner: "tie",
      candidateFailures: ["fact-boundary"],
      incumbentFailures: ["fact-boundary"],
    }),
  });
  assert.deepEqual(mapped.candidateHardGateFailures, ["fact-boundary"]);
  assert.deepEqual(mapped.incumbentHardGateFailures, ["fact-boundary"]);
  assert.equal(mapped.winner, "tie");

  assert.throws(() => normalize({
    pass: 1,
    judgment: rawJudgment({
      pass: 1,
      winner: "tie",
      candidateFailures: ["fact-boundary"],
    }),
  }), /winner must be incumbent because only candidate fails hard gates/);

  assert.throws(() => normalize({
    pass: 1,
    judgment: rawJudgment({
      pass: 1,
      winner: "candidate",
      candidateFailures: ["fact-boundary"],
    }),
  }), /winner must be incumbent because only candidate fails hard gates/);

  assert.throws(() => normalize({
    pass: 1,
    judgment: rawJudgment({
      pass: 1,
      winner: "candidate",
      candidateFailures: ["fact-boundary"],
      incumbentFailures: ["fact-boundary"],
    }),
  }), /winner must be tie because both sides fail hard gates/);
});

test("normalization rejects a uniquely invalid side scoring above the valid side", () => {
  assert.throws(() => normalize({
    pass: 1,
    judgment: rawJudgment({
      pass: 1,
      winner: "incumbent",
      candidateFailures: ["fact-boundary"],
      candidateScore: 5,
      incumbentScore: 4,
    }),
  }), /candidateScores\.composition-fit cannot exceed incumbentScores\.composition-fit/);
});

test("hard-gate evidence is required, exact, verbatim, and source-bound", () => {
  const context = contextForPass(1);
  const valid = {
    winner: "B",
    aScores: scores(3),
    bScores: scores(4),
    aHardGateFailures: ["fact-boundary"],
    bHardGateFailures: [],
    aHardGateEvidence: evidenceFor(["fact-boundary"], context.responseA),
    bHardGateEvidence: [],
    rationale: "A crosses the supplied fact boundary.",
  };
  assert.doesNotThrow(() => normalize({ pass: 1, judgment: valid }));

  const missingEvidence = structuredClone(valid);
  delete missingEvidence.aHardGateEvidence;
  assert.throws(
    () => normalize({ pass: 1, judgment: missingEvidence }),
    /must contain exactly the judge-schema fields/,
  );

  const mismatchedGate = structuredClone(valid);
  mismatchedGate.aHardGateEvidence[0].gate = "different-gate";
  assert.throws(
    () => normalize({ pass: 1, judgment: mismatchedGate }),
    /gates must match the corresponding hard-gate failure IDs exactly once/,
  );

  const absentExcerpt = structuredClone(valid);
  absentExcerpt.aHardGateEvidence[0].excerpt = "Text absent from response A";
  assert.throws(
    () => normalize({ pass: 1, judgment: absentExcerpt }),
    /excerpt must occur verbatim in the corresponding response/,
  );

  const absentPremise = structuredClone(valid);
  absentPremise.aHardGateEvidence[0].missingPremise = "Text absent from original task";
  assert.throws(
    () => normalize({ pass: 1, judgment: absentPremise }),
    /missingPremise must occur verbatim in ORIGINAL TASK/,
  );

  const extraProperty = structuredClone(valid);
  extraProperty.aHardGateEvidence[0].note = "not allowed";
  assert.throws(
    () => normalize({ pass: 1, judgment: extraProperty }),
    /must contain exactly gate, excerpt, and missingPremise/,
  );
});

test("a response with no hard-gate failures requires an empty evidence array", () => {
  const valid = rawJudgment({ pass: 1, winner: "tie" });
  assert.doesNotThrow(() => normalize({ pass: 1, judgment: valid }));
  valid.aHardGateEvidence.push({
    gate: "fact-boundary",
    excerpt: contextForPass(1).responseA,
    missingPremise: "Closed facts: supplied premise.",
  });
  assert.throws(
    () => normalize({ pass: 1, judgment: valid }),
    /gates must match the corresponding hard-gate failure IDs exactly once/,
  );
});

test("raw judgments and normalized custody reject extra or unbound fields", () => {
  const raw = rawJudgment({ pass: 1, winner: "tie" });
  raw.debug = "not allowed";
  assert.throws(
    () => normalize({ pass: 1, judgment: raw }),
    /must contain exactly the judge-schema fields/,
  );

  const invalidCustody = custodyFor(1);
  invalidCustody.artifacts.judge_prompt.path = "judge-prompts/another-case.md";
  assert.throws(
    () => normalize({
      pass: 1,
      judgment: rawJudgment({ pass: 1, winner: "tie" }),
      custody: invalidCustody,
    }),
    /judge_prompt\.path is invalid/,
  );
});

test("every eligibility-critical dimension rejects an invalid-side score advantage", () => {
  for (const dimension of ELIGIBILITY_SCORE_DIMENSIONS) {
    const candidateScores = Object.fromEntries(
      ELIGIBILITY_SCORE_DIMENSIONS.map((name) => [name, name === dimension ? 5 : 4]),
    );
    const incumbentScores = Object.fromEntries(
      ELIGIBILITY_SCORE_DIMENSIONS.map((name) => [name, 4]),
    );
    const errors = validateEligibility({
      winner: "incumbent",
      candidateHardGateFailures: ["fact-boundary"],
      incumbentHardGateFailures: [],
      candidateScores,
      incumbentScores,
      label: "critical-check",
    });
    assert.match(errors.join("\n"), new RegExp(`candidateScores\\.${dimension}`));
  }
});

test("ingestion requires pass 3 when either mapped failure set differs", async () => {
  const root = await mkdtemp(join(tmpdir(), "agora-blind-ingest-"));
  const judgmentsDirectory = join(root, "judgments");
  const fullManifest = { ...manifest, cases: [item] };
  try {
    const template = "HARD GATES\n{{HARD_GATES}}\nTASK\n{{ORIGINAL_TASK}}\nA\n{{RESPONSE_A}}\nB\n{{RESPONSE_B}}\n";
    const promptText = `/agora --no-voice\n${originalTask}\n`;
    await Promise.all([
      mkdir(join(root, "prompts"), { recursive: true }),
      mkdir(join(root, "generation-a-outputs"), { recursive: true }),
      mkdir(join(root, "generation-b-outputs"), { recursive: true }),
      mkdir(judgmentsDirectory, { recursive: true }),
      mkdir(join(root, "judge-prompts"), { recursive: true }),
      mkdir(join(root, "judge-logs"), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(join(root, item.prompt_file), promptText),
      writeFile(join(root, "judge-instructions.md"), template),
      writeFile(join(root, "generation-a-outputs", "case-one.md"), sideResponses.candidate),
      writeFile(join(root, "generation-b-outputs", "case-one.md"), sideResponses.incumbent),
      writeFile(join(judgmentsDirectory, "case-one-pass1.json"), JSON.stringify(rawJudgment({
        pass: 1,
        winner: "incumbent",
      }))),
      writeFile(join(judgmentsDirectory, "case-one-pass2.json"), JSON.stringify(rawJudgment({
        pass: 2,
        winner: "incumbent",
        candidateFailures: ["fact-boundary"],
        candidateScore: 3,
        incumbentScore: 4,
      }))),
    ]);
    for (const pass of [1, 2]) {
      const order = expectedBlindOrder(item.id, pass);
      await Promise.all([
        writeFile(join(root, "judge-prompts", `case-one-pass${pass}.md`), buildBlindJudgePrompt({
          manifest: fullManifest,
          item,
          template,
          originalTask: promptText,
          responseA: sideResponses[order[0]],
          responseB: sideResponses[order[1]],
        })),
        writeFile(join(root, "judge-logs", `case-one-pass${pass}.json`), JSON.stringify(judgeRun)),
      ]);
    }
    await assert.rejects(
      ingestBlindJudgments({
        manifest: fullManifest,
        judgmentsDirectory,
        evaluationRoot: root,
        blindRoot: root,
      }),
      /missing tie-break judgment case-one pass 3/,
    );

    await writeFile(join(judgmentsDirectory, "case-one-pass3.json"), JSON.stringify(rawJudgment({
      pass: 3,
      winner: "incumbent",
      candidateFailures: ["fact-boundary"],
      candidateScore: 3,
      incumbentScore: 4,
    })));
    const thirdOrder = expectedBlindOrder(item.id, 3);
    await Promise.all([
      writeFile(join(root, "judge-prompts", "case-one-pass3.md"), buildBlindJudgePrompt({
        manifest: fullManifest,
        item,
        template,
        originalTask: promptText,
        responseA: sideResponses[thirdOrder[0]],
        responseB: sideResponses[thirdOrder[1]],
      })),
      writeFile(join(root, "judge-logs", "case-one-pass3.json"), JSON.stringify(judgeRun)),
    ]);
    const [adjudication] = await ingestBlindJudgments({
      manifest: fullManifest,
      judgmentsDirectory,
      evaluationRoot: root,
      blindRoot: root,
    });
    assert.equal(adjudication.passes.length, 3);
    assert.deepEqual(adjudication.passes[2].custody.judge_run, judgeRun);
    assert.match(adjudication.passes[2].custody.artifacts.raw_judgment.sha256, /^[a-f0-9]{64}$/);
    assert.equal("rationale" in adjudication.passes[2], false);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test("normalization rejects undeclared failures and incomplete scores", () => {
  assert.throws(() => normalize({
    pass: 1,
    judgment: {
      winner: "tie",
      aScores: { "brief-fidelity": 5 },
      bScores: scores(5),
      aHardGateFailures: [],
      bHardGateFailures: [],
      aHardGateEvidence: [],
      bHardGateEvidence: [],
      rationale: "Incomplete score fixture.",
    },
  }), /every declared dimension exactly once/);

  assert.throws(() => normalize({
    pass: 1,
    judgment: {
      winner: "tie",
      aScores: scores(5),
      bScores: scores(5),
      aHardGateFailures: ["unknown"],
      bHardGateFailures: [],
      aHardGateEvidence: [],
      bHardGateEvidence: [],
      rationale: "Unknown gate fixture.",
    },
  }), /undeclared hard gate/);
});
