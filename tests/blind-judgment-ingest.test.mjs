import assert from "node:assert/strict";
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
import {
  ELIGIBILITY_SCORE_DIMENSIONS,
  validateEligibility,
} from "../scripts/blind-eligibility.mjs";

const dimensions = ["brief-fidelity", "composition-fit"];
const scores = (value) => Object.fromEntries(dimensions.map((dimension) => [dimension, value]));
const manifest = {
  rubric: { dimensions, domain_dimensions: {} },
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

test("raw A/B judgment maps deterministically and drops rationale", () => {
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
  assert.equal("candidateHardGateEvidence" in normalized, false);
  assert.equal("incumbentHardGateEvidence" in normalized, false);
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
    /aHardGateEvidence must be an array/,
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
    await Promise.all([
      mkdir(join(root, "prompts"), { recursive: true }),
      mkdir(join(root, "generation-a-outputs"), { recursive: true }),
      mkdir(join(root, "generation-b-outputs"), { recursive: true }),
      mkdir(judgmentsDirectory, { recursive: true }),
    ]);
    await Promise.all([
      writeFile(join(root, item.prompt_file), `/agora --no-voice\n${originalTask}\n`),
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
    const [adjudication] = await ingestBlindJudgments({
      manifest: fullManifest,
      judgmentsDirectory,
      evaluationRoot: root,
      blindRoot: root,
    });
    assert.equal(adjudication.passes.length, 3);
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
    },
  }), /undeclared hard gate/);
});
