#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { REDUCTION_POLICY, reduceAdjudications } from "./adjudication-reducer.mjs";
import { ELIGIBILITY_POLICY } from "./blind-eligibility.mjs";
import { ingestBlindJudgments, BLIND_ORDER_SEED } from "./blind-judgment-ingest.mjs";
import { evaluateBlindRun } from "./blind-summary.mjs";
import { computeEvalTreeLock } from "./eval-locks.mjs";
import { validateEvaluationProvenance } from "./eval-provenance-check.mjs";
import {
  deriveReleaseEvidenceSummary,
  REQUIRED_HASHED_FILES,
  REQUIRED_PROTOCOL_FILES,
} from "./release-evidence-check.mjs";
import { validateGitReleaseProvenance } from "./release-git-provenance.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION = "1.7.0";
const BASELINE_COMMIT = "524b7927648c4fce52290e9d680e1d3a3109987c";
const BASELINE_SKILL_TREE = {
  file_count: 8,
  sha256: "ff68706d00455ec6a35351bc34b8996506bbe3a95421c2bc5480bf150f1e99aa",
};
const COMMIT = /^[a-f0-9]{40}$/;

const repoPath = (...parts) => join(ROOT, ...parts);
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

const sha256File = async (path) => createHash("sha256")
  .update(await readFile(path))
  .digest("hex");

async function listFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(current, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(root, fullPath));
    else if (entry.isFile()) files.push(relative(root, fullPath).split(sep).join("/"));
  }
  return files.sort((left, right) => left.localeCompare(right));
}

const timingWindow = async (evaluationRoot, paths) => {
  const times = [];
  for (const path of paths) {
    const root = join(evaluationRoot, ...path.split("/"));
    for (const file of await listFiles(root)) {
      times.push((await stat(join(root, ...file.split("/")))).mtimeMs);
    }
  }
  if (!times.length) throw new Error("external evaluation artifacts are empty");
  return {
    started_at_utc: new Date(Math.min(...times)).toISOString(),
    completed_at_utc: new Date(Math.max(...times)).toISOString(),
  };
};

const externalTree = async (evaluationRoot, path) => {
  const value = await computeEvalTreeLock(evaluationRoot, path);
  return { file_count: value.file_count, sha256: value.sha256 };
};

async function buildReleaseEvidence({ evaluationRoot, candidateFreezeCommit, judgeProtocolCommit }) {
  if (!COMMIT.test(candidateFreezeCommit)) throw new Error("candidate freeze commit must be a 40-character Git commit");
  if (!COMMIT.test(judgeProtocolCommit)) throw new Error("judge protocol commit must be a 40-character Git commit");
  const manifestPath = repoPath("evals", "blind", `v${VERSION}`, "manifest.json");
  const releasePlanPath = repoPath("evals", "releases", `v${VERSION}.gates.json`);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const releasePlan = JSON.parse(await readFile(releasePlanPath, "utf8"));
  const adjudications = await ingestBlindJudgments({
    manifest,
    judgmentsDirectory: join(evaluationRoot, "judgments"),
    evaluationRoot,
    blindRoot: dirname(manifestPath),
  });
  const records = reduceAdjudications({ manifest, adjudications });
  const provenanceErrors = await validateEvaluationProvenance({
    root: evaluationRoot,
    manifest,
    adjudications,
  });
  if (provenanceErrors.length) {
    throw new Error(`evaluation provenance failed:\n- ${provenanceErrors.join("\n- ")}`);
  }
  const evaluation = evaluateBlindRun({ manifest, records, releasePlan });
  if (!evaluation.pass) {
    throw new Error(`release gates failed:\n${JSON.stringify(evaluation, null, 2)}`);
  }

  const treeHashes = {};
  for (const path of ["skills/agora", `evals/blind/v${VERSION}`]) {
    const value = await computeEvalTreeLock(ROOT, path);
    treeHashes[path] = { file_count: value.file_count, sha256: value.sha256 };
  }

  const timing = await timingWindow(evaluationRoot, [
    "generation-a-outputs",
    "generation-b-outputs",
    "generation-logs",
    "judge-prompts",
    "judgments",
    "judge-logs",
  ]);
  const externalArtifacts = {
    candidate_skill_copy: await externalTree(evaluationRoot, "generation-a-work/.agents/skills/agora"),
    incumbent_skill_copy: await externalTree(evaluationRoot, "generation-b-work/.agents/skills/agora"),
    candidate_outputs: await externalTree(evaluationRoot, "generation-a-outputs"),
    incumbent_outputs: await externalTree(evaluationRoot, "generation-b-outputs"),
    generation_logs: await externalTree(evaluationRoot, "generation-logs"),
    raw_judgments: await externalTree(evaluationRoot, "judgments"),
    judge_logs: await externalTree(evaluationRoot, "judge-logs"),
    judge_prompts: await externalTree(evaluationRoot, "judge-prompts"),
  };
  const repositorySkill = treeHashes["skills/agora"];
  if (externalArtifacts.candidate_skill_copy.file_count !== repositorySkill.file_count
    || externalArtifacts.candidate_skill_copy.sha256 !== repositorySkill.sha256) {
    throw new Error("external candidate skill copy does not match the released skill tree");
  }
  if (externalArtifacts.incumbent_skill_copy.file_count !== BASELINE_SKILL_TREE.file_count
    || externalArtifacts.incumbent_skill_copy.sha256 !== BASELINE_SKILL_TREE.sha256) {
    throw new Error("external incumbent skill copy does not match the v1.6.0 skill tree");
  }
  const commits = {
    candidate_freeze: candidateFreezeCommit,
    judge_protocol: judgeProtocolCommit,
    baseline_ref: "v1.6.0",
    baseline: BASELINE_COMMIT,
  };
  const gitErrors = await validateGitReleaseProvenance({
    root: ROOT,
    commits,
    startedAtUtc: timing.started_at_utc,
    evidenceTreeHashes: treeHashes,
    requiredProtocolFiles: REQUIRED_PROTOCOL_FILES,
    protocolTreePath: `evals/blind/v${VERSION}`,
  });
  if (gitErrors.length) throw new Error(`Git release provenance failed:\n- ${gitErrors.join("\n- ")}`);

  const adjudicationsPath = repoPath("evals", "releases", `v${VERSION}.adjudications.json`);
  const recordsPath = repoPath("evals", "releases", `v${VERSION}.records.json`);
  await writeFile(adjudicationsPath, json(adjudications), "utf8");
  await writeFile(recordsPath, json(records), "utf8");

  const artifactHashes = {};
  for (const path of REQUIRED_HASHED_FILES) {
    artifactHashes[path] = await sha256File(repoPath(...path.split("/")));
  }
  const evidence = {
    schema_version: 1,
    skill_version: VERSION,
    status: "passed",
    commits,
    execution: {
      generator_model: "gpt-5.6-sol",
      judge_model: "gpt-5.6-sol",
      generator_runtime: "codex-subagent",
      judge_runtime: "codex-subagent",
      fresh_context_per_generation: true,
      fresh_context_per_judgment: true,
      isolated_skill_copy: true,
      context_fork: "none",
      raw_outputs_outside_repository: true,
      runtime_attestations_verified: true,
      provenance_check_passed: true,
      order_seed: BLIND_ORDER_SEED,
      eligibility_policy: ELIGIBILITY_POLICY,
      reduction_policy: REDUCTION_POLICY,
      ...timing,
    },
    artifact_hashes: artifactHashes,
    tree_hashes: treeHashes,
    external_artifacts: externalArtifacts,
    summary: deriveReleaseEvidenceSummary({ records, adjudications, evaluation }),
  };
  await writeFile(repoPath("evals", "releases", `v${VERSION}.evidence.json`), json(evidence), "utf8");
  return evidence;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [evaluationRoot, candidateFreezeCommit, judgeProtocolCommit] = process.argv.slice(2);
  if (!evaluationRoot || !candidateFreezeCommit || !judgeProtocolCommit) {
    process.stderr.write("Usage: node scripts/release-evidence-build.mjs <external-evaluation-root> <candidate-freeze-commit> <judge-protocol-commit>\n");
    process.exitCode = 2;
  } else {
    try {
      const evidence = await buildReleaseEvidence({
        evaluationRoot: resolve(evaluationRoot),
        candidateFreezeCommit,
        judgeProtocolCommit,
      });
      process.stdout.write(`Release evidence built: ${evidence.summary.comparable_candidate_wins} comparable candidate wins (${evidence.summary.total_candidate_wins} total) across ${evidence.summary.case_count} cases\n`);
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
