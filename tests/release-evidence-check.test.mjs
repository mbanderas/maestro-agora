import assert from "node:assert/strict";
import test from "node:test";

import {
  deriveReleaseEvidenceSummary,
  validateEvidenceExecution,
  validateNormalizedAdjudications,
} from "../scripts/release-evidence-check.mjs";
import { BLIND_ORDER_SEED, expectedBlindOrder } from "../scripts/blind-judgment-ingest.mjs";

const commit = "a".repeat(40);
const candidateFreeze = "4eb65795d57c88d30517a5dcb48d61f9de213f45";
const baseline = "524b7927648c4fce52290e9d680e1d3a3109987c";

test("execution evidence freezes model, isolation, baseline, and order seed", () => {
  const evidence = {
    schema_version: 1,
    skill_version: "1.7.0",
    status: "passed",
    commits: {
      candidate_freeze: candidateFreeze,
      baseline,
      baseline_ref: "v1.6.0",
      judge_protocol: commit,
    },
    execution: {
      generator_model: "gpt-5.6-sol",
      judge_model: "gpt-5.6-sol",
      generator_runtime: "codex-subagent",
      judge_runtime: "codex-subagent",
      order_seed: BLIND_ORDER_SEED,
      context_fork: "none",
      started_at_utc: "2026-08-12T10:00:00.000Z",
      completed_at_utc: "2026-08-12T11:00:00.000Z",
      fresh_context_per_generation: true,
      fresh_context_per_judgment: true,
      isolated_skill_copy: true,
      raw_outputs_outside_repository: true,
      runtime_attestations_verified: true,
      provenance_check_passed: true,
    },
  };
  assert.deepEqual(validateEvidenceExecution(evidence), []);
  evidence.execution.judge_model = "another-model";
  assert.match(validateEvidenceExecution(evidence).join("\n"), /judge model/);
});

test("normalized adjudications enforce seeded per-pass order and exclude raw fields", () => {
  const id = "case-one";
  const pass = {
    pass: 1,
    order: expectedBlindOrder(id, 1),
    winner: "tie",
    candidateScores: { quality: 4 },
    incumbentScores: { quality: 4 },
    candidateVetoes: [],
    candidateHardGateFailures: [],
  };
  const manifest = { cases: [{ id }] };
  assert.deepEqual(validateNormalizedAdjudications({ manifest, adjudications: [{ id, passes: [pass] }] }), []);
  pass.rationale = "must remain outside repo";
  assert.match(
    validateNormalizedAdjudications({ manifest, adjudications: [{ id, passes: [pass] }] }).join("\n"),
    /non-normalized fields/,
  );
});

test("release summary is derived from normalized records and gate evaluation", () => {
  const records = [{
    id: "case-one",
    final: {
      winner: "candidate",
      candidateVetoes: [],
      candidateHardGateFailures: [],
    },
  }];
  const summary = deriveReleaseEvidenceSummary({
    records,
    adjudications: [{ id: "case-one", passes: [{}, {}] }],
    evaluation: {
      pass: true,
      release: {
        partitionResults: [{
          id: "conversion",
          summary: {
            scoreRegressions: [],
            candidateMean: 4.5,
            incumbentMean: 4,
            meanDelta: 0.5,
          },
        }],
      },
    },
  });
  assert.deepEqual(summary, {
    pass: true,
    case_count: 1,
    adjudication_pass_count: 2,
    candidate_wins: 1,
    ties: 0,
    incumbent_wins: 0,
    candidate_veto_count: 0,
    candidate_hard_gate_failure_count: 0,
    score_regression_count: 0,
    candidate_mean: 4.5,
    incumbent_mean: 4,
    mean_delta: 0.5,
  });
});
