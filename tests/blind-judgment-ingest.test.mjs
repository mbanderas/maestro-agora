import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
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
const item = { id: "case-one", domain_dimensions: [], hard_gates: ["fact-boundary"] };

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
    candidate: { scores: scores(candidateScore), failures: candidateFailures },
    incumbent: { scores: scores(incumbentScore), failures: incumbentFailures },
  };
  return {
    winner: winner === "tie" ? "tie" : (order[0] === winner ? "A" : "B"),
    aScores: values[order[0]].scores,
    bScores: values[order[1]].scores,
    aHardGateFailures: values[order[0]].failures,
    bHardGateFailures: values[order[1]].failures,
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
  const normalized = normalizeBlindJudgment({
    manifest,
    item,
    pass: 1,
    judgment: {
      winner: "A",
      aScores: scores(5),
      bScores: scores(3),
      aHardGateFailures: [],
      bHardGateFailures: ["fact-boundary"],
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
});

test("normalization maps both sides' failures and enforces symmetric winner eligibility", () => {
  const mapped = normalizeBlindJudgment({
    manifest,
    item,
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

  assert.throws(() => normalizeBlindJudgment({
    manifest,
    item,
    pass: 1,
    judgment: rawJudgment({
      pass: 1,
      winner: "tie",
      candidateFailures: ["fact-boundary"],
    }),
  }), /winner must be incumbent because only candidate fails hard gates/);

  assert.throws(() => normalizeBlindJudgment({
    manifest,
    item,
    pass: 1,
    judgment: rawJudgment({
      pass: 1,
      winner: "candidate",
      candidateFailures: ["fact-boundary"],
    }),
  }), /winner must be incumbent because only candidate fails hard gates/);

  assert.throws(() => normalizeBlindJudgment({
    manifest,
    item,
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
  assert.throws(() => normalizeBlindJudgment({
    manifest,
    item,
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
  const fullManifest = { ...manifest, cases: [item] };
  try {
    await Promise.all([
      writeFile(join(root, "case-one-pass1.json"), JSON.stringify(rawJudgment({
        pass: 1,
        winner: "incumbent",
      }))),
      writeFile(join(root, "case-one-pass2.json"), JSON.stringify(rawJudgment({
        pass: 2,
        winner: "incumbent",
        candidateFailures: ["fact-boundary"],
        candidateScore: 3,
        incumbentScore: 4,
      }))),
    ]);
    await assert.rejects(
      ingestBlindJudgments({ manifest: fullManifest, judgmentsDirectory: root }),
      /missing tie-break judgment case-one pass 3/,
    );

    await writeFile(join(root, "case-one-pass3.json"), JSON.stringify(rawJudgment({
      pass: 3,
      winner: "incumbent",
      candidateFailures: ["fact-boundary"],
      candidateScore: 3,
      incumbentScore: 4,
    })));
    const [adjudication] = await ingestBlindJudgments({
      manifest: fullManifest,
      judgmentsDirectory: root,
    });
    assert.equal(adjudication.passes.length, 3);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test("normalization rejects undeclared failures and incomplete scores", () => {
  assert.throws(() => normalizeBlindJudgment({
    manifest,
    item,
    pass: 1,
    judgment: {
      winner: "tie",
      aScores: { "brief-fidelity": 5 },
      bScores: scores(5),
      aHardGateFailures: [],
      bHardGateFailures: [],
    },
  }), /every declared dimension exactly once/);

  assert.throws(() => normalizeBlindJudgment({
    manifest,
    item,
    pass: 1,
    judgment: {
      winner: "tie",
      aScores: scores(5),
      bScores: scores(5),
      aHardGateFailures: ["unknown"],
      bHardGateFailures: [],
    },
  }), /undeclared hard gate/);
});
