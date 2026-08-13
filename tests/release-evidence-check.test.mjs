import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

import {
  deriveReleaseEvidenceSummary,
  validateExternalArtifacts,
  validateEvidenceExecution,
  validateNormalizedAdjudications,
} from "../scripts/release-evidence-check.mjs";
import {
  createExternalFileManifest,
  validateExternalFileManifest,
} from "../scripts/external-artifact-manifest.mjs";
import { validateJsonSchema } from "../scripts/json-schema-validator.mjs";
import { REDUCTION_POLICY } from "../scripts/adjudication-reducer.mjs";
import { ELIGIBILITY_POLICY } from "../scripts/blind-eligibility.mjs";
import { BLIND_ORDER_SEED, expectedBlindOrder } from "../scripts/blind-judgment-ingest.mjs";
import { validateGitReleaseProvenance } from "../scripts/release-git-provenance.mjs";

const execFileAsync = promisify(execFile);

const commit = "a".repeat(40);
const candidateFreeze = "b".repeat(40);
const baseline = "524b7927648c4fce52290e9d680e1d3a3109987c";
const hash = "a".repeat(64);
const passFor = (id, pass) => ({
  pass,
  order: expectedBlindOrder(id, pass),
  winner: "tie",
  candidateScores: { quality: 4 },
  incumbentScores: { quality: 4 },
  candidateVetoes: [],
  candidateHardGateFailures: [],
  candidateHardGateEvidence: [],
  incumbentHardGateFailures: [],
  incumbentHardGateEvidence: [],
  custody: custody(id, pass),
});
const custody = (id, pass) => ({
  schema_version: 1,
  artifacts: {
    original_task: { path: `evals/blind/v1.7.0/prompts/${id}.md`, sha256: hash },
    candidate_response: { path: `generation-a-outputs/${id}.md`, sha256: hash },
    incumbent_response: { path: `generation-b-outputs/${id}.md`, sha256: hash },
    judge_prompt: { path: `judge-prompts/${id}-pass${pass}.md`, sha256: hash },
    raw_judgment: { path: `judgments/${id}-pass${pass}.json`, sha256: hash },
    judge_log: { path: `judge-logs/${id}-pass${pass}.json`, sha256: hash },
  },
  judge_run: {
    schema_version: 1,
    runtime: "codex-subagent",
    model: "gpt-5.6-sol",
    fresh_context: true,
    skill_access: false,
  },
});

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
      reduction_policy: REDUCTION_POLICY,
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
  assert.equal(ELIGIBILITY_POLICY, "symmetric-cross-order-hard-gates-v3");
  evidence.execution.eligibility_policy = "symmetric-majority-hard-gates-v2";
  assert.match(validateEvidenceExecution(evidence).join("\n"), /eligibility policy/);
  evidence.execution.eligibility_policy = ELIGIBILITY_POLICY;
  evidence.execution.reduction_policy = `${REDUCTION_POLICY} stale`;
  assert.match(validateEvidenceExecution(evidence).join("\n"), /reduction policy/);
  evidence.execution.reduction_policy = REDUCTION_POLICY;
  evidence.execution.judge_model = "another-model";
  assert.match(validateEvidenceExecution(evidence).join("\n"), /judge model/);
});

test("normalized adjudications enforce seeded per-pass order and exclude raw fields", () => {
  const id = "case-one";
  const pass = passFor(id, 1);
  const manifest = {
    skill_version: "1.7.0",
    cases: [{ id, prompt_file: `prompts/${id}.md` }],
  };
  assert.deepEqual(validateNormalizedAdjudications({
    manifest,
    adjudications: [{ id, passes: [pass, passFor(id, 2)] }],
  }), []);
  assert.match(validateNormalizedAdjudications({
    manifest,
    adjudications: [{ id, passes: [passFor(id, 2), pass] }],
  }).join("\n"), /canonical order 1, 2/);
  pass.rationale = "must remain outside repo";
  assert.match(
    validateNormalizedAdjudications({ manifest, adjudications: [{ id, passes: [pass, passFor(id, 2)] }] }).join("\n"),
    /non-normalized fields/,
  );
});

test("normalized adjudications require exact evidence and custody bindings", () => {
  const id = "case-one";
  const manifest = {
    skill_version: "1.7.0",
    cases: [{ id, prompt_file: `prompts/${id}.md` }],
  };
  const pass = {
    pass: 1,
    order: expectedBlindOrder(id, 1),
    winner: "incumbent",
    candidateScores: { quality: 3 },
    incumbentScores: { quality: 4 },
    candidateVetoes: [],
    candidateHardGateFailures: ["fact-boundary"],
    candidateHardGateEvidence: [{
      gate: "fact-boundary",
      excerpt: "unsupported response text",
      missingPremise: "supplied task premise",
    }],
    incumbentHardGateFailures: [],
    incumbentHardGateEvidence: [],
    custody: custody(id, 1),
  };
  assert.deepEqual(validateNormalizedAdjudications({
    manifest,
    adjudications: [{ id, passes: [pass, passFor(id, 2)] }],
  }), []);

  pass.candidateHardGateEvidence[0].gate = "another-gate";
  assert.match(validateNormalizedAdjudications({
    manifest,
    adjudications: [{ id, passes: [pass, passFor(id, 2)] }],
  }).join("\n"), /evidence must match failures exactly once/);
  pass.candidateHardGateEvidence[0].gate = "fact-boundary";
  pass.custody.artifacts.raw_judgment.path = "judgments/unbound.json";
  assert.match(validateNormalizedAdjudications({
    manifest,
    adjudications: [{ id, passes: [pass, passFor(id, 2)] }],
  }).join("\n"), /raw_judgment\.path is invalid/);
});

test("normalized schemas exclude rationale and require structured evidence custody", async () => {
  const [adjudicationSchema, recordSchema] = await Promise.all([
    readFile(new URL("../evals/releases/v1.7.0.adjudications.schema.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../evals/releases/v1.7.0.records.schema.json", import.meta.url), "utf8").then(JSON.parse),
  ]);
  const pass = adjudicationSchema.$defs.pass;
  assert.equal(pass.additionalProperties, false);
  assert.equal(pass.required.includes("candidateHardGateEvidence"), true);
  assert.equal(pass.required.includes("incumbentHardGateEvidence"), true);
  assert.equal(pass.required.includes("custody"), true);
  assert.equal("rationale" in pass.properties, false);
  assert.equal(recordSchema.items.properties.final.additionalProperties, false);
  assert.equal(recordSchema.items.properties.final.required.includes("candidateHardGateEvidence"), true);
  assert.equal(recordSchema.items.properties.final.required.includes("incumbentHardGateEvidence"), true);
});

test("JSON schemas are executed and fail closed", async () => {
  const [adjudicationSchema, recordSchema] = await Promise.all([
    readFile(new URL("../evals/releases/v1.7.0.adjudications.schema.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../evals/releases/v1.7.0.records.schema.json", import.meta.url), "utf8").then(JSON.parse),
  ]);
  const adjudications = Array.from({ length: 25 }, (_, index) => {
    const id = `case-${index}`;
    return { id, passes: [passFor(id, 1), passFor(id, 2)] };
  });
  assert.deepEqual(validateJsonSchema({ schema: adjudicationSchema, value: adjudications }), []);
  const onePass = structuredClone(adjudications);
  onePass[0].passes.pop();
  assert.match(validateJsonSchema({ schema: adjudicationSchema, value: onePass }).join("\n"), /too few items/);
  const withRationale = structuredClone(adjudications);
  withRationale[0].passes[0].rationale = "private";
  assert.match(validateJsonSchema({ schema: adjudicationSchema, value: withRationale }).join("\n"), /not allowed/);
  const records = Array.from({ length: 25 }, (_, index) => ({
    id: `case-${index}`,
    final: {
      winner: "tie",
      candidateVetoes: [],
      candidateHardGateFailures: [],
      candidateHardGateEvidence: [],
      incumbentHardGateFailures: [],
      incumbentHardGateEvidence: [],
      candidateScores: { quality: 4 },
      incumbentScores: { quality: 4 },
    },
  }));
  assert.deepEqual(validateJsonSchema({ schema: recordSchema, value: records }), []);
  assert.throws(
    () => validateJsonSchema({ schema: { type: "string", allOf: [] }, value: "x" }),
    /unsupported keyword/,
  );
  const uniqueSchema = { type: "array", uniqueItems: true };
  assert.match(validateJsonSchema({
    schema: uniqueSchema,
    value: [{ a: 1, b: 2 }, { b: 2, a: 1 }],
  }).join("\n"), /unique items/);
});

test("external manifests bind custody and reject self-consistent custody tampering", async () => {
  const id = "case-one";
  const passes = [passFor(id, 1), passFor(id, 2)];
  const file = (path, sha256 = hash) => ({ path, sha256 });
  const externalArtifacts = {
    candidate_outputs: createExternalFileManifest({ root: "generation-a-outputs", files: [file(`${id}.md`)] }),
    incumbent_outputs: createExternalFileManifest({ root: "generation-b-outputs", files: [file(`${id}.md`)] }),
    generation_logs: createExternalFileManifest({
      root: "generation-logs",
      files: [file(`generation-a-${id}.json`), file(`generation-b-${id}.json`)],
    }),
    raw_judgments: createExternalFileManifest({
      root: "judgments",
      files: passes.map((pass) => file(`${id}-pass${pass.pass}.json`)),
    }),
    judge_logs: createExternalFileManifest({
      root: "judge-logs",
      files: passes.map((pass) => file(`${id}-pass${pass.pass}.json`)),
    }),
    judge_prompts: createExternalFileManifest({
      root: "judge-prompts",
      files: passes.map((pass) => file(`${id}-pass${pass.pass}.md`)),
    }),
    candidate_skill_copy: createExternalFileManifest({ root: "generation-a-work/.agents/skills/agora", files: [] }),
    incumbent_skill_copy: createExternalFileManifest({ root: "generation-b-work/.agents/skills/agora", files: [] }),
  };
  const evidence = { external_artifacts: externalArtifacts };
  const manifest = { skill_version: "1.7.0", cases: [{ id, prompt_file: `prompts/${id}.md` }] };
  const errors = await validateExternalArtifacts({
    evidence,
    summary: { case_count: 1, adjudication_pass_count: 2 },
    manifest,
    adjudications: [{ id, passes }],
    root: process.cwd(),
  });
  assert.doesNotMatch(errors.join("\n"), /candidate_response custody hash is not bound/);
  passes[0].custody.artifacts.candidate_response.sha256 = "b".repeat(64);
  const tampered = await validateExternalArtifacts({
    evidence,
    summary: { case_count: 1, adjudication_pass_count: 2 },
    manifest,
    adjudications: [{ id, passes }],
    root: process.cwd(),
  });
  assert.match(tampered.join("\n"), /candidate_response custody hash is not bound/);
  passes[0].candidateHardGateEvidence = [{
    gate: "fabricated",
    excerpt: "changed normalized evidence",
    missingPremise: "changed premise",
  }];
  passes[0].custody.artifacts.raw_judgment.sha256 = "b".repeat(64);
  const evidenceTampered = await validateExternalArtifacts({
    evidence,
    summary: { case_count: 1, adjudication_pass_count: 2 },
    manifest,
    adjudications: [{ id, passes }],
    root: process.cwd(),
  });
  assert.match(evidenceTampered.join("\n"), /raw_judgment custody hash is not bound/);
  externalArtifacts.candidate_outputs.files[0].sha256 = "b".repeat(64);
  assert.match(validateExternalFileManifest({
    manifest: externalArtifacts.candidate_outputs,
    expectedRoot: "generation-a-outputs",
    expectedPaths: [`${id}.md`],
    label: "candidate_outputs",
  }).join("\n"), /manifest root/);
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
