#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { reduceAdjudications } from "./adjudication-reducer.mjs";
import { evaluateBlindRun } from "./blind-summary.mjs";
import { BLIND_ORDER_SEED, expectedBlindOrder } from "./blind-judgment-ingest.mjs";
import { computeEvalTreeLock } from "./eval-locks.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION = "1.7.0";
const CANDIDATE_FREEZE_COMMIT = "8d825a208aac630a44c2694b101cd2e8e49444a5";
const BASELINE_COMMIT = "524b7927648c4fce52290e9d680e1d3a3109987c";
const SHA256 = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;

const PATHS = {
  manifest: `evals/blind/v${VERSION}/manifest.json`,
  releasePlan: `evals/releases/v${VERSION}.gates.json`,
  adjudications: `evals/releases/v${VERSION}.adjudications.json`,
  records: `evals/releases/v${VERSION}.records.json`,
  evidence: `evals/releases/v${VERSION}.evidence.json`,
};

const REQUIRED_HASHED_FILES = [
  PATHS.manifest,
  `evals/blind/v${VERSION}/judge-instructions.md`,
  `evals/blind/v${VERSION}/judge-schema.json`,
  PATHS.releasePlan,
  "evals/releases/locks.json",
  "scripts/adjudication-reducer.mjs",
  "scripts/blind-judge-prompt.mjs",
  "scripts/blind-judgment-ingest.mjs",
  "scripts/blind-summary.mjs",
  "scripts/release-evidence-check.mjs",
  PATHS.adjudications,
  PATHS.records,
];

const EXACT_PASS_KEYS = [
  "candidateHardGateFailures",
  "candidateScores",
  "candidateVetoes",
  "incumbentScores",
  "order",
  "pass",
  "winner",
].sort();

const readJson = async (root, path) => JSON.parse(await readFile(join(root, ...path.split("/")), "utf8"));

const sha256File = async (root, path) => createHash("sha256")
  .update(await readFile(join(root, ...path.split("/"))))
  .digest("hex");

const sameJson = (left, right) => JSON.stringify(left) === JSON.stringify(right);

export const deriveReleaseEvidenceSummary = ({ records, adjudications, evaluation }) => {
  const partition = evaluation.release?.partitionResults?.find((item) => item.id === "conversion");
  const domain = partition?.summary ?? {};
  return {
    pass: evaluation.pass,
    case_count: records.length,
    adjudication_pass_count: adjudications.reduce((total, item) => total + item.passes.length, 0),
    candidate_wins: records.filter((record) => record.final.winner === "candidate").length,
    ties: records.filter((record) => record.final.winner === "tie").length,
    incumbent_wins: records.filter((record) => record.final.winner === "incumbent").length,
    candidate_veto_count: records.reduce(
      (total, record) => total + new Set(record.final.candidateVetoes).size,
      0,
    ),
    candidate_hard_gate_failure_count: records.reduce(
      (total, record) => total + new Set(record.final.candidateHardGateFailures).size,
      0,
    ),
    score_regression_count: domain.scoreRegressions?.length ?? 0,
    candidate_mean: domain.candidateMean,
    incumbent_mean: domain.incumbentMean,
    mean_delta: domain.meanDelta,
  };
};

export const validateEvidenceExecution = (evidence) => {
  const errors = [];
  const execution = evidence?.execution ?? {};
  const commits = evidence?.commits ?? {};
  if (evidence?.schema_version !== 1) errors.push("evidence schema_version must be 1");
  if (evidence?.skill_version !== VERSION) errors.push(`evidence skill_version must be ${VERSION}`);
  if (evidence?.status !== "passed") errors.push("evidence status must be passed");
  if (commits.candidate_freeze !== CANDIDATE_FREEZE_COMMIT) {
    errors.push("evidence candidate freeze commit does not match the frozen candidate");
  }
  if (commits.baseline !== BASELINE_COMMIT || commits.baseline_ref !== "v1.6.0") {
    errors.push("evidence baseline does not match v1.6.0");
  }
  if (!COMMIT.test(commits.judge_protocol ?? "")) errors.push("evidence judge protocol commit is invalid");
  if (execution.generator_model !== "gpt-5.6-sol") errors.push("generator model must be gpt-5.6-sol");
  if (execution.judge_model !== "gpt-5.6-sol") errors.push("judge model must be gpt-5.6-sol");
  if (execution.order_seed !== BLIND_ORDER_SEED) errors.push("blind order seed does not match protocol");
  if (execution.sandbox !== "read-only") errors.push("evaluation sandbox must be read-only");
  for (const flag of [
    "fresh_context_per_generation",
    "fresh_context_per_judgment",
    "isolated_skill_copy",
    "ignored_user_config",
    "ignored_repository_rules",
    "ephemeral_sessions",
  ]) {
    if (execution[flag] !== true) errors.push(`execution.${flag} must be true`);
  }
  return errors;
};

export const validateNormalizedAdjudications = ({ manifest, adjudications }) => {
  const errors = [];
  for (const [index, item] of (manifest.cases ?? []).entries()) {
    const adjudication = adjudications.find((candidate) => candidate.id === item.id);
    if (!adjudication) continue;
    for (const pass of adjudication.passes ?? []) {
      if (!sameJson(Object.keys(pass).sort(), EXACT_PASS_KEYS)) {
        errors.push(`case ${item.id} pass ${pass.pass} contains non-normalized fields`);
      }
      const expected = expectedBlindOrder(item.id, pass.pass);
      if (!sameJson(pass.order, expected)) {
        errors.push(`case ${item.id} pass ${pass.pass} does not match seeded blind order`);
      }
    }
    if (adjudication.id !== manifest.cases[index].id) {
      errors.push(`case ${item.id} is not in manifest order`);
    }
  }
  return errors;
};

const validateExternalArtifacts = ({ evidence, summary }) => {
  const errors = [];
  const expectedCounts = {
    candidate_outputs: summary.case_count,
    incumbent_outputs: summary.case_count,
    raw_judgments: summary.adjudication_pass_count,
    generation_logs: summary.case_count * 2,
    judge_logs: summary.adjudication_pass_count,
  };
  for (const [name, expectedCount] of Object.entries(expectedCounts)) {
    const artifact = evidence.external_artifacts?.[name];
    if (!artifact || artifact.file_count !== expectedCount || !SHA256.test(artifact.sha256 ?? "")) {
      errors.push(`external artifact attestation ${name} is invalid`);
    }
  }
  return errors;
};

export async function verifyReleaseEvidence(root = ROOT) {
  const errors = [];
  let manifest;
  let releasePlan;
  let adjudications;
  let records;
  let evidence;
  let recordsText;
  try {
    [manifest, releasePlan, adjudications, records, evidence, recordsText] = await Promise.all([
      readJson(root, PATHS.manifest),
      readJson(root, PATHS.releasePlan),
      readJson(root, PATHS.adjudications),
      readJson(root, PATHS.records),
      readJson(root, PATHS.evidence),
      readFile(join(root, ...PATHS.records.split("/")), "utf8"),
    ]);
  } catch (error) {
    return [`release evidence could not be loaded: ${error.message}`];
  }

  errors.push(...validateEvidenceExecution(evidence));
  errors.push(...validateNormalizedAdjudications({ manifest, adjudications }));
  if (manifest.skill_version !== VERSION || releasePlan.skill_version !== VERSION) {
    errors.push(`manifest and release plan must target ${VERSION}`);
  }

  let reduced;
  try {
    reduced = reduceAdjudications({ manifest, adjudications });
    const expectedText = `${JSON.stringify(reduced, null, 2)}\n`;
    if (recordsText !== expectedText) errors.push("records are not the byte-for-byte reducer output");
  } catch (error) {
    errors.push(error.message);
  }

  let evaluation;
  if (reduced) {
    evaluation = evaluateBlindRun({ manifest, records: reduced, releasePlan });
    if (!evaluation.pass) errors.push("blind release gates did not pass");
    if (!sameJson(records, reduced)) errors.push("parsed records differ from reducer output");
    const summary = deriveReleaseEvidenceSummary({ records: reduced, adjudications, evaluation });
    if (!sameJson(evidence.summary, summary)) errors.push("evidence summary differs from derived release result");
    errors.push(...validateExternalArtifacts({ evidence, summary }));
  }

  const suppliedFiles = Object.keys(evidence.artifact_hashes ?? {}).sort();
  if (!sameJson(suppliedFiles, [...REQUIRED_HASHED_FILES].sort())) {
    errors.push("evidence artifact_hashes must contain the exact required repository files");
  } else {
    for (const path of REQUIRED_HASHED_FILES) {
      const actual = await sha256File(root, path);
      if (evidence.artifact_hashes[path] !== actual) errors.push(`artifact hash mismatch: ${path}`);
    }
  }

  for (const path of ["skills/agora", `evals/blind/v${VERSION}`]) {
    const expected = evidence.tree_hashes?.[path];
    const actual = await computeEvalTreeLock(root, path);
    if (!expected || expected.file_count !== actual.file_count || expected.sha256 !== actual.sha256) {
      errors.push(`tree hash mismatch: ${path}`);
    }
  }

  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = await verifyReleaseEvidence();
  if (errors.length) {
    process.stderr.write(`Release evidence verification failed:\n- ${errors.join("\n- ")}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`Release evidence verified: Agora v${VERSION}\n`);
  }
}
