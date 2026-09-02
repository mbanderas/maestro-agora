#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expectedBlindOrder, normalizeBlindJudgment } from "./blind-judgment-ingest.mjs";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const artifact = (path, value) => ({ path, sha256: sha256(value) });

export async function summarizeProspectiveRun({ evaluationRoot, manifestPath }) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const blindRoot = dirname(manifestPath);
  const records = [];
  for (const item of manifest.cases) {
    const pass = 1;
    const order = expectedBlindOrder(item.id, pass);
    const [originalTask, candidateResponse, incumbentResponse, rawJudgment, judgePrompt, judgeLog] = await Promise.all([
      readFile(join(blindRoot, item.prompt_file), "utf8"),
      readFile(join(evaluationRoot, "generation-a-outputs", `${item.id}.md`), "utf8"),
      readFile(join(evaluationRoot, "generation-b-outputs", `${item.id}.md`), "utf8"),
      readFile(join(evaluationRoot, "judgments", `${item.id}-pass1.json`), "utf8"),
      readFile(join(evaluationRoot, "judge-prompts", `${item.id}-pass1.md`), "utf8"),
      readFile(join(evaluationRoot, "judge-logs", `${item.id}-pass1.json`), "utf8"),
    ]);
    const responses = { candidate: candidateResponse, incumbent: incumbentResponse };
    const judgeLogValue = JSON.parse(judgeLog);
    const normalized = normalizeBlindJudgment({
      manifest,
      item,
      pass,
      judgment: JSON.parse(rawJudgment),
      originalTask,
      responseA: responses[order[0]],
      responseB: responses[order[1]],
      custody: {
        schema_version: 1,
        artifacts: {
          original_task: artifact(`evals/blind/v${manifest.skill_version}/${item.prompt_file}`, originalTask),
          candidate_response: artifact(`generation-a-outputs/${item.id}.md`, candidateResponse),
          incumbent_response: artifact(`generation-b-outputs/${item.id}.md`, incumbentResponse),
          judge_prompt: artifact(`judge-prompts/${item.id}-pass1.md`, judgePrompt),
          raw_judgment: artifact(`judgments/${item.id}-pass1.json`, rawJudgment),
          judge_log: artifact(`judge-logs/${item.id}-pass1.json`, judgeLog),
        },
        judge_run: judgeLogValue.attestation ?? judgeLogValue,
      },
    });
    records.push({ id: item.id, ...normalized });
  }

  const comparable = records.filter((record) => record.incumbentHardGateFailures.length === 0);
  const protectedDimensions = ["factual-fidelity", "technical-or-legal-precision"];
  const protectedRegressions = comparable.flatMap((record) => protectedDimensions
    .filter((dimension) => record.candidateScores[dimension] < record.incumbentScores[dimension])
    .map((dimension) => ({ id: record.id, dimension })));
  const candidateValues = comparable.flatMap((record) => Object.values(record.candidateScores));
  const incumbentValues = comparable.flatMap((record) => Object.values(record.incumbentScores));
  const improvementDimensions = ["first-read-ease", "sentence-ease", "natural-voice", "register-fit", "author-sample-fit", "control-room-vocabulary-containment", "nonformulaic-structure", "concision-without-loss"];
  const candidateStyleValues = comparable.flatMap((record) => improvementDimensions.map((dimension) => record.candidateScores[dimension]));
  const incumbentStyleValues = comparable.flatMap((record) => improvementDimensions.map((dimension) => record.incumbentScores[dimension]));
  const candidateProtectedValues = comparable.flatMap((record) => protectedDimensions.map((dimension) => record.candidateScores[dimension]));
  const incumbentProtectedValues = comparable.flatMap((record) => protectedDimensions.map((dimension) => record.incumbentScores[dimension]));
  const mean = (values) => values.reduce((total, value) => total + value, 0) / values.length;
  const candidateWins = comparable.filter((record) => record.winner === "candidate").length;
  const summary = {
    schema_version: 1,
    status: "prospective",
    case_count: records.length,
    comparable_case_count: comparable.length,
    candidate_wins: candidateWins,
    incumbent_wins: comparable.filter((record) => record.winner === "incumbent").length,
    ties: comparable.filter((record) => record.winner === "tie").length,
    candidate_hard_gate_failures: records.flatMap((record) => record.candidateHardGateFailures.map((gate) => ({ id: record.id, gate }))),
    incumbent_hard_gate_failures: records.flatMap((record) => record.incumbentHardGateFailures.map((gate) => ({ id: record.id, gate }))),
    protected_dimension_regressions: protectedRegressions,
    candidate_mean: mean(candidateValues),
    incumbent_mean: mean(incumbentValues),
    style_mean_delta: mean(candidateStyleValues) - mean(incumbentStyleValues),
    protected_mean_delta: mean(candidateProtectedValues) - mean(incumbentProtectedValues),
  };
  summary.pass = summary.case_count === 24
    && summary.comparable_case_count >= 16
    && summary.candidate_wins >= Math.ceil(summary.comparable_case_count * 0.3)
    && summary.candidate_hard_gate_failures.length === 0
    && summary.candidate_mean >= summary.incumbent_mean
    && summary.style_mean_delta >= 0
    && summary.protected_mean_delta >= 0;
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [evaluationRoot, manifestPath] = process.argv.slice(2);
  if (!evaluationRoot || !manifestPath) {
    process.stderr.write("Usage: node scripts/prospective-eval-summary.mjs <evaluation-root> <manifest.json>\n");
    process.exitCode = 2;
  } else {
    try {
      const summary = await summarizeProspectiveRun({ evaluationRoot: resolve(evaluationRoot), manifestPath: resolve(manifestPath) });
      process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
      if (!summary.pass) process.exitCode = 1;
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
