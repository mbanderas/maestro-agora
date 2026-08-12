#!/usr/bin/env node

import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { adjudicationsDisagree, validateEligibility } from "./blind-eligibility.mjs";
import { normalizeOriginalTask } from "./blind-judge-prompt.mjs";

export const BLIND_ORDER_SEED = "agora-v1.7.0-blind-order-v1";

const VALID_JUDGE_WINNERS = new Set(["A", "B", "tie"]);
const VALID_MAPPED_WINNERS = new Set(["candidate", "incumbent", "tie"]);
const EVIDENCE_KEYS = ["excerpt", "gate", "missingPremise"];
const OUTPUT_DIRECTORY = {
  candidate: "generation-a-outputs",
  incumbent: "generation-b-outputs",
};

const orderBits = (id) => createHash("sha256")
  .update(BLIND_ORDER_SEED)
  .update("\0")
  .update(id)
  .digest();

export const expectedBlindOrder = (id, pass) => {
  if (!id || typeof id !== "string") throw new Error("case id must be a nonempty string");
  if (![1, 2, 3].includes(pass)) throw new Error("pass must be 1, 2, or 3");
  const bits = orderBits(id);
  const passOne = bits[0] % 2 === 0
    ? ["candidate", "incumbent"]
    : ["incumbent", "candidate"];
  if (pass === 1) return passOne;
  if (pass === 2) return [...passOne].reverse();
  return bits[1] % 2 === 0
    ? ["candidate", "incumbent"]
    : ["incumbent", "candidate"];
};

const requiredDimensions = (manifest, item) => {
  const dimensions = new Set(manifest.rubric?.dimensions ?? []);
  for (const domain of item.domain_dimensions ?? []) {
    for (const dimension of manifest.rubric?.domain_dimensions?.[domain] ?? []) dimensions.add(dimension);
  }
  return [...dimensions];
};

const validateScores = (scores, dimensions, label) => {
  if (!scores || typeof scores !== "object" || Array.isArray(scores)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(scores).sort();
  const expected = [...dimensions].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} must contain every declared dimension exactly once`);
  }
  for (const dimension of dimensions) {
    const value = scores[dimension];
    if (!Number.isFinite(value) || value < 1 || value > 5) {
      throw new Error(`${label}.${dimension} must be a finite score from 1 to 5`);
    }
  }
};

const validateFailures = (failures, item, label) => {
  if (!Array.isArray(failures) || failures.some((failure) => typeof failure !== "string")) {
    throw new Error(`${label} must be a string array`);
  }
  if (new Set(failures).size !== failures.length) throw new Error(`${label} contains duplicates`);
  const allowed = new Set(item.hard_gates ?? []);
  for (const failure of failures) {
    if (!allowed.has(failure)) throw new Error(`${label} contains undeclared hard gate ${failure}`);
  }
};

const validateHardGateEvidence = ({ failures, evidence, response, originalTask, label }) => {
  if (!Array.isArray(evidence)) throw new Error(`${label} must be an array`);
  const failureSet = new Set(failures);
  const evidenceGates = [];
  for (const [index, entry] of evidence.entries()) {
    const entryLabel = `${label}[${index}]`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`${entryLabel} must be an object`);
    }
    const keys = Object.keys(entry).sort();
    if (JSON.stringify(keys) !== JSON.stringify(EVIDENCE_KEYS)) {
      throw new Error(`${entryLabel} must contain exactly gate, excerpt, and missingPremise`);
    }
    for (const field of EVIDENCE_KEYS) {
      if (typeof entry[field] !== "string" || !entry[field].trim()) {
        throw new Error(`${entryLabel}.${field} must be a nonempty string`);
      }
    }
    evidenceGates.push(entry.gate);
    if (!response.includes(entry.excerpt)) {
      throw new Error(`${entryLabel}.excerpt must occur verbatim in the corresponding response`);
    }
    if (!originalTask.includes(entry.missingPremise)) {
      throw new Error(`${entryLabel}.missingPremise must occur verbatim in ORIGINAL TASK`);
    }
  }
  if (new Set(evidenceGates).size !== evidenceGates.length) {
    throw new Error(`${label} contains duplicate gate evidence`);
  }
  const actual = [...evidenceGates].sort();
  const expected = [...failureSet].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} gates must match the corresponding hard-gate failure IDs exactly once`);
  }
};

export const normalizeBlindJudgment = ({
  manifest,
  item,
  pass,
  judgment,
  originalTask,
  responseA,
  responseB,
}) => {
  if (!item) throw new Error("unknown blind-evaluation case");
  if (!judgment || typeof judgment !== "object" || Array.isArray(judgment)) {
    throw new Error(`case ${item.id} pass ${pass} judgment must be an object`);
  }
  if (!VALID_JUDGE_WINNERS.has(judgment.winner)) {
    throw new Error(`case ${item.id} pass ${pass} has invalid winner ${String(judgment.winner)}`);
  }
  const dimensions = requiredDimensions(manifest, item);
  validateScores(judgment.aScores, dimensions, `case ${item.id} pass ${pass} aScores`);
  validateScores(judgment.bScores, dimensions, `case ${item.id} pass ${pass} bScores`);
  validateFailures(judgment.aHardGateFailures, item, `case ${item.id} pass ${pass} aHardGateFailures`);
  validateFailures(judgment.bHardGateFailures, item, `case ${item.id} pass ${pass} bHardGateFailures`);
  if (typeof originalTask !== "string" || !originalTask.trim()) {
    throw new Error(`case ${item.id} pass ${pass} originalTask must be a nonempty string`);
  }
  if (typeof responseA !== "string" || !responseA.trim()) {
    throw new Error(`case ${item.id} pass ${pass} responseA must be a nonempty string`);
  }
  if (typeof responseB !== "string" || !responseB.trim()) {
    throw new Error(`case ${item.id} pass ${pass} responseB must be a nonempty string`);
  }
  validateHardGateEvidence({
    failures: judgment.aHardGateFailures,
    evidence: judgment.aHardGateEvidence,
    response: responseA,
    originalTask,
    label: `case ${item.id} pass ${pass} aHardGateEvidence`,
  });
  validateHardGateEvidence({
    failures: judgment.bHardGateFailures,
    evidence: judgment.bHardGateEvidence,
    response: responseB,
    originalTask,
    label: `case ${item.id} pass ${pass} bHardGateEvidence`,
  });

  const order = expectedBlindOrder(item.id, pass);
  const aSide = order[0];
  const bSide = order[1];
  const winner = judgment.winner === "tie"
    ? "tie"
    : (judgment.winner === "A" ? aSide : bSide);
  if (!VALID_MAPPED_WINNERS.has(winner)) throw new Error("failed to map blind winner");

  const normalized = {
    pass,
    order,
    winner,
    candidateScores: aSide === "candidate" ? judgment.aScores : judgment.bScores,
    incumbentScores: aSide === "incumbent" ? judgment.aScores : judgment.bScores,
    candidateVetoes: [],
    candidateHardGateFailures: aSide === "candidate"
      ? judgment.aHardGateFailures
      : judgment.bHardGateFailures,
    incumbentHardGateFailures: aSide === "incumbent"
      ? judgment.aHardGateFailures
      : judgment.bHardGateFailures,
  };
  const eligibilityErrors = validateEligibility({
    ...normalized,
    label: `case ${item.id} pass ${pass}`,
  });
  if (eligibilityErrors.length) throw new Error(eligibilityErrors.join("\n"));
  return normalized;
};

const fileExists = async (path) => access(path).then(() => true, () => false);

export const ingestBlindJudgments = async ({
  manifest,
  judgmentsDirectory,
  evaluationRoot = dirname(judgmentsDirectory),
  blindRoot,
}) => {
  if (!blindRoot) throw new Error("blindRoot is required to validate raw hard-gate evidence");
  const adjudications = [];
  for (const item of manifest.cases ?? []) {
    const orderResponses = {};
    const [originalTaskText, candidateResponse, incumbentResponse] = await Promise.all([
      readFile(resolve(blindRoot, item.prompt_file), "utf8"),
      readFile(join(evaluationRoot, OUTPUT_DIRECTORY.candidate, `${item.id}.md`), "utf8"),
      readFile(join(evaluationRoot, OUTPUT_DIRECTORY.incumbent, `${item.id}.md`), "utf8"),
    ]);
    const originalTask = normalizeOriginalTask(originalTaskText);
    orderResponses.candidate = candidateResponse;
    orderResponses.incumbent = incumbentResponse;
    const passes = [];
    for (const pass of [1, 2]) {
      const path = join(judgmentsDirectory, `${item.id}-pass${pass}.json`);
      if (!await fileExists(path)) throw new Error(`missing raw judgment ${item.id} pass ${pass}`);
      const judgment = JSON.parse(await readFile(path, "utf8"));
      const order = expectedBlindOrder(item.id, pass);
      passes.push(normalizeBlindJudgment({
        manifest,
        item,
        pass,
        judgment,
        originalTask,
        responseA: orderResponses[order[0]],
        responseB: orderResponses[order[1]],
      }));
    }

    const needsThird = adjudicationsDisagree(passes[0], passes[1]);
    const thirdPath = join(judgmentsDirectory, `${item.id}-pass3.json`);
    const hasThird = await fileExists(thirdPath);
    if (needsThird && !hasThird) throw new Error(`missing tie-break judgment ${item.id} pass 3`);
    if (!needsThird && hasThird) throw new Error(`unexpected tie-break judgment ${item.id} pass 3`);
    if (needsThird) {
      const judgment = JSON.parse(await readFile(thirdPath, "utf8"));
      const order = expectedBlindOrder(item.id, 3);
      passes.push(normalizeBlindJudgment({
        manifest,
        item,
        pass: 3,
        judgment,
        originalTask,
        responseA: orderResponses[order[0]],
        responseB: orderResponses[order[1]],
      }));
    }
    adjudications.push({ id: item.id, passes });
  }
  return adjudications;
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [manifestPath, judgmentsDirectory] = process.argv.slice(2);
  if (!manifestPath || !judgmentsDirectory) {
    process.stderr.write("Usage: node scripts/blind-judgment-ingest.mjs <manifest.json> <raw-judgments-directory>\n");
    process.exitCode = 2;
  } else {
    try {
      const absoluteManifestPath = resolve(manifestPath);
      const absoluteJudgmentsDirectory = resolve(judgmentsDirectory);
      const manifest = JSON.parse(await readFile(absoluteManifestPath, "utf8"));
      const adjudications = await ingestBlindJudgments({
        manifest,
        judgmentsDirectory: absoluteJudgmentsDirectory,
        evaluationRoot: dirname(absoluteJudgmentsDirectory),
        blindRoot: dirname(absoluteManifestPath),
      });
      process.stdout.write(`${JSON.stringify(adjudications, null, 2)}\n`);
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
