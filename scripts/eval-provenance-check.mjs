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

const validateGenerationSide = async ({ root, ids, side, requireConversion, errors }) => {
  const outputDirectory = join(root, `${side}-outputs`);
  const logDirectory = join(root, "generation-logs");
  const expectedOutputs = ids.map((id) => `${id}.md`);
  const expectedLogs = ids.map((id) => `${side}-${id}.log`);
  const actualOutputs = await names(outputDirectory);
  const sideLogs = (await names(logDirectory)).filter((name) => name.startsWith(`${side}-`));
  if (!equalNames(actualOutputs, expectedOutputs)) errors.push(`${side} output filenames do not match manifest cases`);
  if (!equalNames(sideLogs, expectedLogs)) errors.push(`${side} generation log filenames do not match manifest cases`);

  for (const id of ids) {
    const [output, log] = await Promise.all([
      readFile(join(outputDirectory, `${id}.md`), "utf8").catch(() => ""),
      readFile(join(logDirectory, `${side}-${id}.log`), "utf8").catch(() => ""),
    ]);
    if (!output.trim()) errors.push(`${side} output ${id} is empty`);
    if (BANNED_TYPOGRAPHY.test(output)) errors.push(`${side} output ${id} contains banned typography`);
    if (!log.includes(SKILL_READ_MARKER)) errors.push(`${side} generation ${id} lacks successful Agora skill read evidence`);
    if (requireConversion && !log.includes(CONVERSION_READ_MARKER)) {
      errors.push(`${side} generation ${id} lacks successful conversion reference read evidence`);
    }
  }
};

export async function validateEvaluationProvenance({ root, manifest, adjudications }) {
  const errors = [];
  const ids = (manifest.cases ?? []).map((item) => item.id);
  await validateGenerationSide({ root, ids, side: "candidate", requireConversion: true, errors });
  await validateGenerationSide({ root, ids, side: "incumbent", requireConversion: false, errors });

  const expectedJudgments = adjudications.flatMap((item) => item.passes.map((pass) => `${item.id}-pass${pass.pass}.json`));
  const expectedJudgeLogs = adjudications.flatMap((item) => item.passes.map((pass) => `${item.id}-pass${pass.pass}.log`));
  const actualJudgments = await names(join(root, "judgments"));
  const actualJudgeLogs = await names(join(root, "judge-logs"));
  if (!equalNames(actualJudgments, expectedJudgments)) errors.push("raw judgment filenames do not match normalized passes");
  if (!equalNames(actualJudgeLogs, expectedJudgeLogs)) errors.push("judge log filenames do not match normalized passes");
  for (const logName of expectedJudgeLogs) {
    const log = await readFile(join(root, "judge-logs", logName), "utf8").catch(() => "");
    if (!log.trim()) errors.push(`judge log ${logName} is empty`);
    if (AGORA_SKILL_PATH.test(log) || log.includes(SKILL_READ_MARKER) || log.includes(CONVERSION_READ_MARKER)) {
      errors.push(`judge log ${logName} contains Agora skill access evidence`);
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
