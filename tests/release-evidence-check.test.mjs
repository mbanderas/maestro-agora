import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

import {
  deriveReleaseEvidenceSummary,
  validateEvidenceExecution,
  validateNormalizedAdjudications,
} from "../scripts/release-evidence-check.mjs";
import { ELIGIBILITY_POLICY } from "../scripts/blind-eligibility.mjs";
import { BLIND_ORDER_SEED, expectedBlindOrder } from "../scripts/blind-judgment-ingest.mjs";
import { validateGitReleaseProvenance } from "../scripts/release-git-provenance.mjs";

const execFileAsync = promisify(execFile);

const commit = "a".repeat(40);
const candidateFreeze = "b".repeat(40);
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
      eligibility_policy: ELIGIBILITY_POLICY,
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
    incumbentHardGateFailures: [],
  };
  const manifest = { cases: [{ id }] };
  assert.deepEqual(validateNormalizedAdjudications({ manifest, adjudications: [{ id, passes: [pass] }] }), []);
  pass.rationale = "must remain outside repo";
  assert.match(
    validateNormalizedAdjudications({ manifest, adjudications: [{ id, passes: [pass] }] }).join("\n"),
    /non-normalized fields/,
  );
});

test("release summary derives symmetric failure counts and comparable denominator", () => {
  const records = [{
    id: "case-one",
    final: {
      winner: "candidate",
      candidateVetoes: [],
      candidateHardGateFailures: [],
      incumbentHardGateFailures: [],
    },
  }, {
    id: "case-two",
    final: {
      winner: "candidate",
      candidateVetoes: [],
      candidateHardGateFailures: [],
      incumbentHardGateFailures: ["fact-boundary", "route-boundary"],
    },
  }];
  const summary = deriveReleaseEvidenceSummary({
    records,
    adjudications: [
      { id: "case-one", passes: [{}, {}] },
      { id: "case-two", passes: [{}, {}, {}] },
    ],
    evaluation: {
      pass: true,
      release: {
        partitionResults: [{
          id: "conversion",
          summary: {
            scoreRegressions: [],
            comparableCaseCount: 1,
            totalCandidateWins: 2,
            comparableCandidateWins: 1,
            incumbentHardGateFailures: [{
              id: "case-two",
              hardGates: ["fact-boundary", "route-boundary"],
            }],
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
    case_count: 2,
    adjudication_pass_count: 5,
    total_candidate_wins: 2,
    comparable_candidate_wins: 1,
    ties: 0,
    incumbent_wins: 0,
    candidate_veto_count: 0,
    candidate_hard_gate_failure_count: 0,
    incumbent_hard_gate_failure_count: 2,
    incumbent_invalid_case_count: 1,
    comparable_case_count: 1,
    incumbent_hard_gate_findings: [{
      id: "case-two",
      hardGates: ["fact-boundary", "route-boundary"],
    }],
    score_regression_count: 0,
    candidate_mean: 4.5,
    incumbent_mean: 4,
    mean_delta: 0.5,
  });
});

test("Git provenance binds candidate and protocol trees to pre-artifact ancestor commits", async () => {
  const root = await mkdtemp(join(tmpdir(), "agora-git-provenance-"));
  const git = async (args, extra = {}) => execFileAsync("git", args, {
    cwd: root,
    windowsHide: true,
    ...extra,
  });
  try {
    await mkdir(join(root, "skills", "agora"), { recursive: true });
    await mkdir(join(root, "evals", "blind", "v1.7.0"), { recursive: true });
    await mkdir(join(root, "scripts"), { recursive: true });
    await writeFile(join(root, "skills", "agora", "SKILL.md"), "candidate\n");
    await writeFile(join(root, "evals", "blind", "v1.7.0", "manifest.json"), "{\"stage\":1}\n");
    await writeFile(join(root, "scripts", "protocol.mjs"), "export const protocol = 1;\n");
    await git(["init"]);
    await git(["config", "user.email", "test@example.com"]);
    await git(["config", "user.name", "Test"]);
    await git(["add", "."]);
    const commitEnv = {
      ...process.env,
      GIT_AUTHOR_DATE: "2020-01-01T00:00:00Z",
      GIT_COMMITTER_DATE: "2020-01-01T00:00:00Z",
    };
    await git(["commit", "-m", "candidate freeze"], { env: commitEnv });
    const candidate = (await git(["rev-parse", "HEAD"])).stdout.trim();

    await writeFile(join(root, "evals", "blind", "v1.7.0", "manifest.json"), "{\"stage\":2}\n");
    await writeFile(join(root, "scripts", "protocol.mjs"), "export const protocol = 2;\n");
    await git(["add", "."]);
    await git(["commit", "-m", "protocol freeze"], {
      env: {
        ...process.env,
        GIT_AUTHOR_DATE: "2020-01-02T00:00:00Z",
        GIT_COMMITTER_DATE: "2020-01-02T00:00:00Z",
      },
    });
    const protocol = (await git(["rev-parse", "HEAD"])).stdout.trim();
    const input = {
      root,
      commits: {
        candidate_freeze: candidate,
        judge_protocol: protocol,
        baseline: candidate,
      },
      startedAtUtc: "2020-01-03T00:00:00.000Z",
      requiredProtocolFiles: ["scripts/protocol.mjs"],
      protocolTreePath: "evals/blind/v1.7.0",
    };
    assert.deepEqual(await validateGitReleaseProvenance(input), []);

    await writeFile(join(root, "skills", "agora", "SKILL.md"), "drifted candidate\n");
    assert.match(
      (await validateGitReleaseProvenance(input)).join("\n"),
      /candidate skill tree differs/,
    );
    await writeFile(join(root, "skills", "agora", "SKILL.md"), "candidate\n");
    await writeFile(join(root, "scripts", "protocol.mjs"), "export const protocol = 3;\n");
    assert.match(
      (await validateGitReleaseProvenance(input)).join("\n"),
      /protocol file differs from judge protocol commit/,
    );
    assert.match(
      (await validateGitReleaseProvenance({ ...input, startedAtUtc: "2019-01-01T00:00:00.000Z" })).join("\n"),
      /commit is later than external artifact start/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Git provenance fails closed outside a worktree", async () => {
  const root = await mkdtemp(join(tmpdir(), "agora-no-git-"));
  try {
    assert.deepEqual(await validateGitReleaseProvenance({
      root,
      commits: {},
      startedAtUtc: "2020-01-01T00:00:00.000Z",
      requiredProtocolFiles: [],
      protocolTreePath: "evals/blind/v1.7.0",
    }), ["release evidence must be verified inside a Git worktree"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
