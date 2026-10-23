#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const TEMPLATE_TOKENS = ["HARD_GATES", "ORIGINAL_TASK", "RESPONSE_A", "RESPONSE_B"];

const requireOnce = (source, name) => {
  const token = `{{${name}}}`;
  const first = source.indexOf(token);
  const last = source.lastIndexOf(token);
  if (first < 0 || first !== last) throw new Error(`judge template must contain ${token} exactly once`);
};

export const normalizeOriginalTask = (task) => task
  .replace(/^\uFEFF?\/agora --no-voice(?:[ \t]+|\r?\n)?/, "")
  .trim();

export const buildBlindJudgePrompt = ({ manifest, item, template, originalTask, responseA, responseB }) => {
  if (!item) throw new Error("unknown blind-evaluation case");
  const definitions = manifest.hard_gate_definitions ?? {};
  const hardGates = (item.hard_gates ?? []).map((id) => {
    const definition = definitions[id];
    if (!definition) throw new Error(`case ${item.id} references unknown hard gate ${id}`);
    return `- ${id}: ${definition}`;
  }).join("\n");

  const values = {
    HARD_GATES: hardGates,
    ORIGINAL_TASK: normalizeOriginalTask(originalTask),
    RESPONSE_A: responseA,
    RESPONSE_B: responseB,
  };

  const prompt = template.trim();
  for (const name of TEMPLATE_TOKENS) requireOnce(prompt, name);
  const tokens = /\{\{([A-Z_]+)\}\}/g;
  for (const match of prompt.matchAll(tokens)) {
    if (!TEMPLATE_TOKENS.includes(match[1])) throw new Error("judge template contains an unknown token");
  }
  // Validate only the template, then insert data literally in one pass. A
  // replacement string would interpret $$, $&, $`, and $'; sequential filling
  // would also mistake token-like article text for template syntax.
  return `${prompt.replace(tokens, (_match, name) => values[name].trim())}\n`;
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [manifestPath, caseId, responseAPath, responseBPath] = process.argv.slice(2);
  if (!manifestPath || !caseId || !responseAPath || !responseBPath) {
    process.stderr.write("Usage: node scripts/blind-judge-prompt.mjs <manifest.json> <case-id> <response-a> <response-b>\n");
    process.exitCode = 2;
  } else {
    try {
      const absoluteManifestPath = resolve(manifestPath);
      const manifest = JSON.parse(await readFile(absoluteManifestPath, "utf8"));
      const item = manifest.cases?.find((candidate) => candidate.id === caseId);
      if (!item) throw new Error(`unknown blind-evaluation case ${caseId}`);
      const root = dirname(absoluteManifestPath);
      const [template, originalTask, responseA, responseB] = await Promise.all([
        readFile(resolve(root, "judge-instructions.md"), "utf8"),
        readFile(resolve(root, item.prompt_file), "utf8"),
        readFile(resolve(responseAPath), "utf8"),
        readFile(resolve(responseBPath), "utf8"),
      ]);
      process.stdout.write(buildBlindJudgePrompt({
        manifest,
        item,
        template,
        originalTask,
        responseA,
        responseB,
      }));
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
