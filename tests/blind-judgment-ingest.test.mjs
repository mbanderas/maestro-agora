import assert from "node:assert/strict";
import test from "node:test";

import {
  BLIND_ORDER_SEED,
  expectedBlindOrder,
  normalizeBlindJudgment,
} from "../scripts/blind-judgment-ingest.mjs";

const dimensions = ["brief-fidelity", "composition-fit"];
const scores = (value) => Object.fromEntries(dimensions.map((dimension) => [dimension, value]));
const manifest = {
  rubric: { dimensions, domain_dimensions: {} },
};
const item = { id: "case-one", domain_dimensions: [], hard_gates: ["fact-boundary"] };

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
  assert.equal("rationale" in normalized, false);
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
