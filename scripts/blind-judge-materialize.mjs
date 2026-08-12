#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { buildBlindJudgePrompt } from "./blind-judge-prompt.mjs";
import { expectedBlindOrder } from "./blind-judgment-ingest.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIRECTORY = {
  candidate: "generation-a-outputs",
  incumbent: "generation-b-outputs",
};

export async function materializeBlindJudgePrompt({ evaluationRoot, manifestPath, caseId, pass }) {
  const absoluteManifestPath = resolve(manifestPath);
  const manifest = JSON.parse(await readFile(absoluteManifestPath, "utf8"));
  const item = manifest.cases?.find((candidate) => candidate.id === caseId);
  if (!item) throw new Error(`unknown blind-evaluation case ${caseId}`);
  const order = expectedBlindOrder(caseId, pass);
  const blindRoot = dirname(absoluteManifestPath);
  const [template, originalTask, responseA, responseB] = await Promise.all([
    readFile(join(blindRoot, "judge-instructions.md"), "utf8"),
    readFile(resolve(blindRoot, item.prompt_file), "utf8"),
    readFile(join(evaluationRoot, OUTPUT_DIRECTORY[order[0]], `${caseId}.md`), "utf8"),
    readFile(join(evaluationRoot, OUTPUT_DIRECTORY[order[1]], `${caseId}.md`), "utf8"),
  ]);
  const prompt = buildBlindJudgePrompt({
    manifest,
    item,
    template,
    originalTask,
    responseA,
    responseB,
  });
  const promptDirectory = join(evaluationRoot, "judge-prompts");
  const promptPath = join(promptDirectory, `${caseId}-pass${pass}.md`);
  await mkdir(promptDirectory, { recursive: true });
  await writeFile(promptPath, prompt, "utf8");
  return { promptPath, order };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [evaluationRoot, caseId, suppliedPass, suppliedManifestPath] = process.argv.slice(2);
  const pass = Number(suppliedPass);
  const manifestPath = suppliedManifestPath
    ? resolve(suppliedManifestPath)
    : join(ROOT, "evals", "blind", "v1.7.0", "manifest.json");
  if (!evaluationRoot || !caseId || ![1, 2, 3].includes(pass)) {
    process.stderr.write("Usage: node scripts/blind-judge-materialize.mjs <evaluation-root> <case-id> <pass> [manifest.json]\n");
    process.exitCode = 2;
  } else {
    try {
      const result = await materializeBlindJudgePrompt({
        evaluationRoot: resolve(evaluationRoot),
        manifestPath,
        caseId,
        pass,
      });
      process.stdout.write(`${JSON.stringify(result)}\n`);
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
