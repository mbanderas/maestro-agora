#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const BANNED_TYPOGRAPHY = /[\u2014\u2018\u2019\u201C\u201D]/u;
const SKILL_READ_MARKER = "## Accept direct invocation";
const CONVERSION_READ_MARKER = "## Route the decision before drafting";
const AGORA_SKILL_PATH = /(?:\.agents|\.codex|\.claude)[\\/]skills[\\/]agora[\\/](?:SKILL\.md|references[\\/]agora-conversion\.md)/i;

const names = async (path) => (await readdir(path, { withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .sort();

const equalNames = (actual, expected) => JSON.stringify(actual) === JSON.stringify([...expected].sort());

const GENERATION_LAYOUT = {
  candidate: {
    outputDirectory: "generation-a-outputs",
    logPrefix: "generation-a",
    skillRoot: "generation-a-work/.agents/skills/agora",
  },
  incumbent: {
    outputDirectory: "generation-b-outputs",
    logPrefix: "generation-b",
    skillRoot: "generation-b-work/.agents/skills/agora",
  },
};

const validateGenerationSide = async ({ root, ids, side, requireConversion, errors }) => {
  const layout = GENERATION_LAYOUT[side];
  const outputDirectory = join(root, layout.outputDirectory);
  const logDirectory = join(root, "generation-logs");
  const expectedOutputs = ids.map((id) => `${id}.md`);
  const expectedLogs = ids.map((id) => `${layout.logPrefix}-${id}.json`);
  const actualOutputs = await names(outputDirectory);
  const sideLogs = (await names(logDirectory)).filter((name) => name.startsWith(`${layout.logPrefix}-`));
  if (!equalNames(actualOutputs, expectedOutputs)) errors.push(`${side} output filenames do not match manifest cases`);
  if (!equalNames(sideLogs, expectedLogs)) errors.push(`${side} generation log filenames do not match manifest cases`);

  for (const id of ids) {
    const [output, logText] = await Promise.all([
      readFile(join(outputDirectory, `${id}.md`), "utf8").catch(() => ""),
      readFile(join(logDirectory, `${layout.logPrefix}-${id}.json`), "utf8").catch(() => ""),
    ]);
    if (!output.trim()) errors.push(`${side} output ${id} is empty`);
    if (BANNED_TYPOGRAPHY.test(output)) errors.push(`${side} output ${id} contains banned typography`);
    try {
      const audit = JSON.parse(logText);
      if (audit.schema_version !== 1
        || audit.runtime !== "codex-subagent"
        || audit.model !== "gpt-5.6-sol"
        || audit.fresh_context !== true
        || audit.skill_access !== true
        || audit.skill_root !== layout.skillRoot
        || audit.prompt_file !== `evals/blind/v1.7.0/prompts/${id}.md`
        || audit.output_file !== `${layout.outputDirectory}/${id}.md`) {
        errors.push(`${side} generation ${id} has invalid runtime attestation`);
      }
      if (requireConversion && audit.conversion_reference_access !== true) {
        errors.push(`${side} generation ${id} lacks conversion reference access attestation`);
      }
    } catch {
      errors.push(`${side} generation ${id} log is not valid JSON`);
    }
  }
};

export async function validateEvaluationProvenance({ root, manifest, adjudications }) {
  const errors = [];
  const ids = (manifest.cases ?? []).map((item) => item.id);
  await validateGenerationSide({ root, ids, side: "candidate", requireConversion: true, errors });
  await validateGenerationSide({ root, ids, side: "incumbent", requireConversion: false, errors });

  const expectedJudgments = adjudications.flatMap((item) => item.passes.map((pass) => `${item.id}-pass${pass.pass}.json`));
  const expectedJudgePrompts = adjudications.flatMap((item) => item.passes.map((pass) => `${item.id}-pass${pass.pass}.md`));
  const expectedJudgeLogs = adjudications.flatMap((item) => item.passes.map((pass) => `${item.id}-pass${pass.pass}.json`));
  const actualJudgments = await names(join(root, "judgments"));
  const actualJudgePrompts = await names(join(root, "judge-prompts"));
  const actualJudgeLogs = await names(join(root, "judge-logs"));
  if (!equalNames(actualJudgments, expectedJudgments)) errors.push("raw judgment filenames do not match normalized passes");
  if (!equalNames(actualJudgePrompts, expectedJudgePrompts)) errors.push("blind judge prompt filenames do not match normalized passes");
  if (!equalNames(actualJudgeLogs, expectedJudgeLogs)) errors.push("judge log filenames do not match normalized passes");
  for (const logName of expectedJudgeLogs) {
    const log = await readFile(join(root, "judge-logs", logName), "utf8").catch(() => "");
    if (!log.trim()) errors.push(`judge log ${logName} is empty`);
    if (AGORA_SKILL_PATH.test(log) || log.includes(SKILL_READ_MARKER) || log.includes(CONVERSION_READ_MARKER)) {
      errors.push(`judge log ${logName} contains Agora skill access evidence`);
    }
    try {
      const audit = JSON.parse(log);
      if (audit.schema_version !== 1
        || audit.runtime !== "codex-subagent"
        || audit.model !== "gpt-5.6-sol"
        || audit.fresh_context !== true
        || audit.skill_access !== false) {
        errors.push(`judge log ${logName} has invalid runtime attestation`);
      }
    } catch {
      errors.push(`judge log ${logName} is not valid JSON`);
    }
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [evaluationRoot, manifestPath, adjudicationsPath] = process.argv.slice(2);
  if (!evaluationRoot || !manifestPath || !adjudicationsPath) {
    process.stderr.write("Usage: node scripts/eval-provenance-check.mjs <evaluation-root> <manifest.json> <adjudications.json>\n");
    process.exitCode = 2;
  } else {
    try {
      const [manifest, adjudications] = await Promise.all([
        readFile(resolve(manifestPath), "utf8").then(JSON.parse),
        readFile(resolve(adjudicationsPath), "utf8").then(JSON.parse),
      ]);
      const errors = await validateEvaluationProvenance({
        root: resolve(evaluationRoot),
        manifest,
        adjudications,
      });
      if (errors.length) throw new Error(`Evaluation provenance failed:\n- ${errors.join("\n- ")}`);
      process.stdout.write("Evaluation provenance verified.\n");
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
