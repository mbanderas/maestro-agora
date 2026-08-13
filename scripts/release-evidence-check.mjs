#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { REDUCTION_POLICY, reduceAdjudications } from "./adjudication-reducer.mjs";
import { ELIGIBILITY_POLICY } from "./blind-eligibility.mjs";
import { evaluateBlindRun } from "./blind-summary.mjs";
import {
  BLIND_ORDER_SEED,
  expectedBlindOrder,
  validateNormalizedCustody,
} from "./blind-judgment-ingest.mjs";
import { computeEvalTreeLock } from "./eval-locks.mjs";
import {
  buildExternalFileManifest,
  buildGitFileManifest,
  sameExternalFileSet,
  validateExternalFileManifest,
} from "./external-artifact-manifest.mjs";
import { validateJsonSchema } from "./json-schema-validator.mjs";
import { validateGitReleaseProvenance } from "./release-git-provenance.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION = "1.7.0";
const BASELINE_COMMIT = "524b7927648c4fce52290e9d680e1d3a3109987c";
const SHA256 = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const EVIDENCE_KEYS = ["excerpt", "gate", "missingPremise"];

const PATHS = {
  manifest: `evals/blind/v${VERSION}/manifest.json`,
  releasePlan: `evals/releases/v${VERSION}.gates.json`,
  adjudications: `evals/releases/v${VERSION}.adjudications.json`,
  records: `evals/releases/v${VERSION}.records.json`,
  evidence: `evals/releases/v${VERSION}.evidence.json`,
};

export const REQUIRED_HASHED_FILES = [
  PATHS.manifest,
  `evals/blind/v${VERSION}/judge-instructions.md`,
  `evals/blind/v${VERSION}/judge-schema.json`,
  `evals/releases/v${VERSION}.adjudications.schema.json`,
  `evals/releases/v${VERSION}.records.schema.json`,
  PATHS.releasePlan,
  "evals/releases/locks.json",
  "scripts/adjudication-reducer.mjs",
  "scripts/blind-eligibility.mjs",
  "scripts/eval-locks.mjs",
  "scripts/external-artifact-manifest.mjs",
  "scripts/json-schema-validator.mjs",
  "scripts/eval-provenance-check.mjs",
  "scripts/blind-judge-prompt.mjs",
  "scripts/blind-judge-materialize.mjs",
  "scripts/blind-judgment-ingest.mjs",
  "scripts/blind-summary.mjs",
  "scripts/release-evidence-check.mjs",
  "scripts/release-evidence-build.mjs",
  "scripts/release-git-provenance.mjs",
  PATHS.adjudications,
  PATHS.records,
];

export const REQUIRED_PROTOCOL_FILES = REQUIRED_HASHED_FILES.filter(
  (path) => path !== PATHS.adjudications && path !== PATHS.records,
);

const EXACT_PASS_KEYS = [
  "candidateHardGateEvidence",
  "candidateHardGateFailures",
  "candidateScores",
  "candidateVetoes",
  "custody",
  "incumbentHardGateEvidence",
  "incumbentHardGateFailures",
  "incumbentScores",
  "order",
  "pass",
  "winner",
].sort();
const EXACT_ADJUDICATION_KEYS = ["id", "passes"];
const EXACT_EXTERNAL_ARTIFACT_KEYS = [
  "candidate_outputs",
  "candidate_skill_copy",
  "generation_logs",
  "incumbent_outputs",
  "incumbent_skill_copy",
  "judge_logs",
  "judge_prompts",
  "raw_judgments",
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
    total_candidate_wins: domain.totalCandidateWins
      ?? records.filter((record) => record.final.winner === "candidate").length,
    comparable_candidate_wins: domain.comparableCandidateWins ?? 0,
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
    incumbent_hard_gate_failure_count: records.reduce(
      (total, record) => total + new Set(record.final.incumbentHardGateFailures).size,
      0,
    ),
    incumbent_invalid_case_count: records.filter(
      (record) => new Set(record.final.incumbentHardGateFailures).size > 0,
    ).length,
    comparable_case_count: domain.comparableCaseCount ?? 0,
    incumbent_hard_gate_findings: domain.incumbentHardGateFailures ?? [],
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
  if (!COMMIT.test(commits.candidate_freeze ?? "")) errors.push("evidence candidate freeze commit is invalid");
  if (commits.baseline !== BASELINE_COMMIT || commits.baseline_ref !== "v1.6.0") {
    errors.push("evidence baseline does not match v1.6.0");
  }
  if (!COMMIT.test(commits.judge_protocol ?? "")) errors.push("evidence judge protocol commit is invalid");
  if (execution.generator_model !== "gpt-5.6-sol") errors.push("generator model must be gpt-5.6-sol");
  if (execution.judge_model !== "gpt-5.6-sol") errors.push("judge model must be gpt-5.6-sol");
  if (execution.generator_runtime !== "codex-subagent") errors.push("generator runtime must be codex-subagent");
  if (execution.judge_runtime !== "codex-subagent") errors.push("judge runtime must be codex-subagent");
  if (execution.order_seed !== BLIND_ORDER_SEED) errors.push("blind order seed does not match protocol");
  if (execution.eligibility_policy !== ELIGIBILITY_POLICY) {
    errors.push("evaluation eligibility policy does not match protocol");
  }
  if (execution.reduction_policy !== REDUCTION_POLICY) {
    errors.push("evaluation reduction policy does not match protocol");
  }
  if (execution.context_fork !== "none") errors.push("evaluation contexts must not inherit prior turns");
  const started = Date.parse(execution.started_at_utc);
  const completed = Date.parse(execution.completed_at_utc);
  if (!Number.isFinite(started) || !Number.isFinite(completed) || started > completed) {
    errors.push("evaluation timing window is invalid");
  }
  for (const flag of [
    "fresh_context_per_generation",
    "fresh_context_per_judgment",
    "isolated_skill_copy",
    "raw_outputs_outside_repository",
    "runtime_attestations_verified",
    "provenance_check_passed",
  ]) {
    if (execution[flag] !== true) errors.push(`execution.${flag} must be true`);
  }
  return errors;
};

export const validateNormalizedAdjudications = ({ manifest, adjudications }) => {
  const errors = [];
  if (!Array.isArray(adjudications)) return ["normalized adjudications must be an array"];
  if (adjudications.length !== (manifest.cases ?? []).length) {
    errors.push("normalized adjudications must contain every manifest case exactly once");
  }
  const suppliedIds = adjudications.map((item) => item?.id);
  if (new Set(suppliedIds).size !== suppliedIds.length) {
    errors.push("normalized adjudications contain duplicate case IDs");
  }
  for (const [index, item] of (manifest.cases ?? []).entries()) {
    const adjudication = adjudications.find((candidate) => candidate.id === item.id);
    if (!adjudication) {
      errors.push(`normalized adjudications are missing case ${item.id}`);
      continue;
    }
    if (!sameJson(Object.keys(adjudication).sort(), EXACT_ADJUDICATION_KEYS)) {
      errors.push(`case ${item.id} contains non-normalized adjudication fields`);
    }
    if (!Array.isArray(adjudication.passes)) {
      errors.push(`case ${item.id}.passes must be an array`);
      continue;
    }
    const passNumbers = adjudication.passes.map((pass) => pass?.pass);
    const canonicalPasses = adjudication.passes.length === 2 ? [1, 2] : [1, 2, 3];
    if (!sameJson(passNumbers, canonicalPasses)) {
      errors.push(`case ${item.id} passes must use canonical order ${canonicalPasses.join(", ")}`);
    }
    const stableHashes = {};
    for (const pass of adjudication.passes ?? []) {
      if (!sameJson(Object.keys(pass).sort(), EXACT_PASS_KEYS)) {
        errors.push(`case ${item.id} pass ${pass.pass} contains non-normalized fields`);
      }
      const expected = expectedBlindOrder(item.id, pass.pass);
      if (!sameJson(pass.order, expected)) {
        errors.push(`case ${item.id} pass ${pass.pass} does not match seeded blind order`);
      }
      for (const side of ["candidate", "incumbent"]) {
        const failures = pass[`${side}HardGateFailures`];
        const evidence = pass[`${side}HardGateEvidence`];
        if (!Array.isArray(failures) || !Array.isArray(evidence)) {
          errors.push(`case ${item.id} pass ${pass.pass} ${side} hard-gate fields must be arrays`);
          continue;
        }
        const gates = [];
        for (const [evidenceIndex, entry] of evidence.entries()) {
          if (!entry || typeof entry !== "object" || Array.isArray(entry)
            || !sameJson(Object.keys(entry).sort(), EVIDENCE_KEYS)) {
            errors.push(`case ${item.id} pass ${pass.pass} ${side} evidence ${evidenceIndex} has invalid keys`);
            continue;
          }
          if (EVIDENCE_KEYS.some((field) => typeof entry[field] !== "string" || !entry[field].trim())) {
            errors.push(`case ${item.id} pass ${pass.pass} ${side} evidence ${evidenceIndex} has an empty field`);
          }
          gates.push(entry.gate);
        }
        if (new Set(gates).size !== gates.length
          || !sameJson([...gates].sort(), [...failures].sort())) {
          errors.push(`case ${item.id} pass ${pass.pass} ${side} evidence must match failures exactly once`);
        }
      }
      errors.push(...validateNormalizedCustody({
        custody: pass.custody,
        manifest,
        item,
        pass: pass.pass,
        label: `case ${item.id} pass ${pass.pass} custody`,
      }));
      for (const name of ["original_task", "candidate_response", "incumbent_response"]) {
        const hash = pass.custody?.artifacts?.[name]?.sha256;
        if (!(name in stableHashes)) stableHashes[name] = hash;
        else if (stableHashes[name] !== hash) {
          errors.push(`case ${item.id} ${name} custody hash changes across passes`);
        }
      }
    }
    if (adjudication.id !== manifest.cases[index].id) {
      errors.push(`case ${item.id} is not in manifest order`);
    }
  }
  return errors;
};

const manifestEntry = (manifest, path) => manifest?.files?.find((file) => file.path === path);

export const validateExternalArtifacts = async ({ evidence, summary, manifest, adjudications, root }) => {
  const errors = [];
  const suppliedKeys = Object.keys(evidence.external_artifacts ?? {}).sort();
  if (!sameJson(suppliedKeys, EXACT_EXTERNAL_ARTIFACT_KEYS)) {
    errors.push("external_artifacts must contain every external evaluation tree exactly once");
  }
  const ids = (manifest.cases ?? []).map((item) => item.id);
  const passPaths = adjudications.flatMap((item) => item.passes.map((pass) => `${item.id}-pass${pass.pass}`));
  const roots = {
    candidate_outputs: "generation-a-outputs",
    incumbent_outputs: "generation-b-outputs",
    raw_judgments: "judgments",
    generation_logs: "generation-logs",
    judge_logs: "judge-logs",
    judge_prompts: "judge-prompts",
    candidate_skill_copy: "generation-a-work/.agents/skills/agora",
    incumbent_skill_copy: "generation-b-work/.agents/skills/agora",
  };
  const expectedPaths = {
    candidate_outputs: ids.map((id) => `${id}.md`),
    incumbent_outputs: ids.map((id) => `${id}.md`),
    raw_judgments: passPaths.map((path) => `${path}.json`),
    generation_logs: ids.flatMap((id) => [`generation-a-${id}.json`, `generation-b-${id}.json`]),
    judge_logs: passPaths.map((path) => `${path}.json`),
    judge_prompts: passPaths.map((path) => `${path}.md`),
  };
  for (const [name, expected] of Object.entries(expectedPaths)) {
    errors.push(...validateExternalFileManifest({
      manifest: evidence.external_artifacts?.[name],
      expectedRoot: roots[name],
      expectedPaths: expected,
      label: `external_artifacts.${name}`,
    }));
  }
  for (const name of ["candidate_skill_copy", "incumbent_skill_copy"]) {
    errors.push(...validateExternalFileManifest({
      manifest: evidence.external_artifacts?.[name],
      expectedRoot: roots[name],
      label: `external_artifacts.${name}`,
    }));
  }
  const candidateSkill = evidence.external_artifacts?.candidate_skill_copy;
  const incumbentSkill = evidence.external_artifacts?.incumbent_skill_copy;
  try {
    const repositorySkill = await buildExternalFileManifest(root, "skills/agora");
    const normalizedRepositorySkill = { ...repositorySkill, root: roots.candidate_skill_copy };
    if (!sameExternalFileSet(candidateSkill, normalizedRepositorySkill)) {
      errors.push("external candidate skill copy does not match the released skill tree");
    }
  } catch (error) {
    errors.push(`released skill tree could not be manifested: ${error.message}`);
  }
  try {
    const baselineSkill = await buildGitFileManifest({
      repositoryRoot: root,
      commit: BASELINE_COMMIT,
      repositoryPath: "skills/agora",
      manifestRoot: roots.incumbent_skill_copy,
    });
    if (!sameExternalFileSet(incumbentSkill, baselineSkill)) {
      errors.push("external incumbent skill copy does not match the v1.6.0 skill tree");
    }
  } catch (error) {
    errors.push(`v1.6.0 skill tree could not be manifested: ${error.message}`);
  }
  for (const adjudication of adjudications) {
    for (const pass of adjudication.passes) {
      const artifacts = pass.custody?.artifacts ?? {};
      const bindings = {
        candidate_response: ["candidate_outputs", `${adjudication.id}.md`],
        incumbent_response: ["incumbent_outputs", `${adjudication.id}.md`],
        judge_prompt: ["judge_prompts", `${adjudication.id}-pass${pass.pass}.md`],
        raw_judgment: ["raw_judgments", `${adjudication.id}-pass${pass.pass}.json`],
        judge_log: ["judge_logs", `${adjudication.id}-pass${pass.pass}.json`],
      };
      for (const [artifactName, [treeName, relativePath]] of Object.entries(bindings)) {
        const external = manifestEntry(evidence.external_artifacts?.[treeName], relativePath);
        const custody = artifacts[artifactName];
        if (!external || custody?.sha256 !== external.sha256) {
          errors.push(`case ${adjudication.id} pass ${pass.pass} ${artifactName} custody hash is not bound to ${treeName}`);
        }
      }
      const item = (manifest.cases ?? []).find((caseItem) => caseItem.id === adjudication.id);
      const originalTask = artifacts.original_task;
      const expectedOriginalPath = `evals/blind/v${manifest.skill_version}/${item?.prompt_file}`;
      if (originalTask?.path === expectedOriginalPath) {
        try {
          const actualHash = await sha256File(root, expectedOriginalPath);
          if (originalTask.sha256 !== actualHash) {
            errors.push(`case ${adjudication.id} pass ${pass.pass} original_task custody hash differs from repository prompt`);
          }
        } catch (error) {
          errors.push(`case ${adjudication.id} original task could not be hashed: ${error.message}`);
        }
      }
      const logEntry = manifestEntry(
        evidence.external_artifacts?.judge_logs,
        `${adjudication.id}-pass${pass.pass}.json`,
      );
      if (logEntry?.sha256 !== artifacts.judge_log?.sha256) {
        errors.push(`case ${adjudication.id} pass ${pass.pass} judge_run is not bound to its judge log`);
      }
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
  let adjudicationsSchema;
  let recordsSchema;
  try {
    [
      manifest,
      releasePlan,
      adjudications,
      records,
      evidence,
      recordsText,
      adjudicationsSchema,
      recordsSchema,
    ] = await Promise.all([
      readJson(root, PATHS.manifest),
      readJson(root, PATHS.releasePlan),
      readJson(root, PATHS.adjudications),
      readJson(root, PATHS.records),
      readJson(root, PATHS.evidence),
      readFile(join(root, ...PATHS.records.split("/")), "utf8"),
      readJson(root, `evals/releases/v${VERSION}.adjudications.schema.json`),
      readJson(root, `evals/releases/v${VERSION}.records.schema.json`),
    ]);
  } catch (error) {
    return [`release evidence could not be loaded: ${error.message}`];
  }

  errors.push(...validateEvidenceExecution(evidence));
  let adjudicationSchemaErrors = [];
  let recordSchemaErrors = [];
  try {
    adjudicationSchemaErrors = validateJsonSchema({
      schema: adjudicationsSchema,
      value: adjudications,
      label: "adjudications",
    });
    recordSchemaErrors = validateJsonSchema({ schema: recordsSchema, value: records, label: "records" });
  } catch (error) {
    errors.push(`normalized schema validation could not run: ${error.message}`);
  }
  errors.push(...adjudicationSchemaErrors.map((error) => `adjudications schema: ${error}`));
  errors.push(...recordSchemaErrors.map((error) => `records schema: ${error}`));
  if (!adjudicationSchemaErrors.length && Array.isArray(adjudications)) {
    try {
      errors.push(...validateNormalizedAdjudications({ manifest, adjudications }));
    } catch (error) {
      errors.push(`normalized adjudication validation failed: ${error.message}`);
    }
  }
  if (manifest.skill_version !== VERSION || releasePlan.skill_version !== VERSION) {
    errors.push(`manifest and release plan must target ${VERSION}`);
  }

  let reduced;
  try {
    if (adjudicationSchemaErrors.length) throw new Error("reduction skipped because adjudications do not match schema");
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
    errors.push(...await validateExternalArtifacts({
      evidence,
      summary,
      manifest,
      adjudications,
      root,
    }));
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

  errors.push(...await validateGitReleaseProvenance({
    root,
    commits: evidence.commits,
    startedAtUtc: evidence.execution?.started_at_utc,
    evidenceTreeHashes: evidence.tree_hashes,
    requiredProtocolFiles: REQUIRED_PROTOCOL_FILES,
    protocolTreePath: `evals/blind/v${VERSION}`,
  }));

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
