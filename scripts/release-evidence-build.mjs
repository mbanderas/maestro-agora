#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { reduceAdjudications } from "./adjudication-reducer.mjs";
import { ingestBlindJudgments, BLIND_ORDER_SEED } from "./blind-judgment-ingest.mjs";
import { evaluateBlindRun } from "./blind-summary.mjs";
import { computeEvalTreeLock } from "./eval-locks.mjs";
import { validateEvaluationProvenance } from "./eval-provenance-check.mjs";
import {
  deriveReleaseEvidenceSummary,
  REQUIRED_HASHED_FILES,
} from "./release-evidence-check.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION = "1.7.0";
const CANDIDATE_FREEZE_COMMIT = "8389f514fbb647ca34b0d6c3a5161de61a2028dd";
const BASELINE_COMMIT = "524b7927648c4fce52290e9d680e1d3a3109987c";
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

async function buildReleaseEvidence({ evaluationRoot, judgeProtocolCommit }) {
  if (!COMMIT.test(judgeProtocolCommit)) throw new Error("judge protocol commit must be a 40-character Git commit");
  const manifestPath = repoPath("evals", "blind", `v${VERSION}`, "manifest.json");
  const releasePlanPath = repoPath("evals", "releases", `v${VERSION}.gates.json`);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const releasePlan = JSON.parse(await readFile(releasePlanPath, "utf8"));
  const adjudications = await ingestBlindJudgments({
    manifest,
    judgmentsDirectory: join(evaluationRoot, "judgments"),
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

  const adjudicationsPath = repoPath("evals", "releases", `v${VERSION}.adjudications.json`);
  const recordsPath = repoPath("evals", "releases", `v${VERSION}.records.json`);
  await writeFile(adjudicationsPath, json(adjudications), "utf8");
  await writeFile(recordsPath, json(records), "utf8");

  const artifactHashes = {};
  for (const path of REQUIRED_HASHED_FILES) {
    artifactHashes[path] = await sha256File(repoPath(...path.split("/")));
  }
  const treeHashes = {};
  for (const path of ["skills/agora", `evals/blind/v${VERSION}`]) {
    const value = await computeEvalTreeLock(ROOT, path);
    treeHashes[path] = { file_count: value.file_count, sha256: value.sha256 };
  }

  const timing = await timingWindow(evaluationRoot, [
    "candidate-outputs",
    "incumbent-outputs",
    "generation-logs",
    "judgments",
    "judge-logs",
  ]);
  const evidence = {
    schema_version: 1,
    skill_version: VERSION,
    status: "passed",
    commits: {
      candidate_freeze: CANDIDATE_FREEZE_COMMIT,
      judge_protocol: judgeProtocolCommit,
      baseline_ref: "v1.6.0",
      baseline: BASELINE_COMMIT,
    },
    execution: {
      generator_model: "gpt-5.6-sol",
      judge_model: "gpt-5.6-sol",
      codex_cli_version: "0.144.0",
      sandbox: "read-only",
      fresh_context_per_generation: true,
      fresh_context_per_judgment: true,
      isolated_skill_copy: true,
      ignored_user_config: true,
      ignored_repository_rules: true,
      ephemeral_sessions: true,
      provenance_check_passed: true,
      order_seed: BLIND_ORDER_SEED,
      reduction_policy: "Agreed mapped winners use pass 1/2 mean scores; disagreements require pass 3 winner and scores; candidate vetoes and hard-gate failures are unioned across every valid pass.",
      ...timing,
    },
    artifact_hashes: artifactHashes,
    tree_hashes: treeHashes,
    external_artifacts: {
      candidate_skill_copy: await externalTree(evaluationRoot, "candidate-work/.agents/skills/agora"),
      incumbent_skill_copy: await externalTree(evaluationRoot, "incumbent-work/.agents/skills/agora"),
      candidate_outputs: await externalTree(evaluationRoot, "candidate-outputs"),
      incumbent_outputs: await externalTree(evaluationRoot, "incumbent-outputs"),
      generation_logs: await externalTree(evaluationRoot, "generation-logs"),
      raw_judgments: await externalTree(evaluationRoot, "judgments"),
      judge_logs: await externalTree(evaluationRoot, "judge-logs"),
    },
    summary: deriveReleaseEvidenceSummary({ records, adjudications, evaluation }),
  };
  await writeFile(repoPath("evals", "releases", `v${VERSION}.evidence.json`), json(evidence), "utf8");
  return evidence;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [evaluationRoot, judgeProtocolCommit] = process.argv.slice(2);
  if (!evaluationRoot || !judgeProtocolCommit) {
    process.stderr.write("Usage: node scripts/release-evidence-build.mjs <external-evaluation-root> <judge-protocol-commit>\n");
    process.exitCode = 2;
  } else {
    try {
      const evidence = await buildReleaseEvidence({
        evaluationRoot: resolve(evaluationRoot),
        judgeProtocolCommit,
      });
      process.stdout.write(`Release evidence built: ${evidence.summary.candidate_wins} candidate wins across ${evidence.summary.case_count} cases\n`);
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
