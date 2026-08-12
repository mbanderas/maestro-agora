#!/usr/bin/env node

import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { adjudicationsDisagree, validateEligibility } from "./blind-eligibility.mjs";

export const BLIND_ORDER_SEED = "agora-v1.7.0-blind-order-v1";

const VALID_JUDGE_WINNERS = new Set(["A", "B", "tie"]);
const VALID_MAPPED_WINNERS = new Set(["candidate", "incumbent", "tie"]);

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

export const normalizeBlindJudgment = ({ manifest, item, pass, judgment }) => {
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

export const ingestBlindJudgments = async ({ manifest, judgmentsDirectory }) => {
  const adjudications = [];
  for (const item of manifest.cases ?? []) {
    const passes = [];
    for (const pass of [1, 2]) {
      const path = join(judgmentsDirectory, `${item.id}-pass${pass}.json`);
      if (!await fileExists(path)) throw new Error(`missing raw judgment ${item.id} pass ${pass}`);
      const judgment = JSON.parse(await readFile(path, "utf8"));
      passes.push(normalizeBlindJudgment({ manifest, item, pass, judgment }));
    }

    const needsThird = adjudicationsDisagree(passes[0], passes[1]);
    const thirdPath = join(judgmentsDirectory, `${item.id}-pass3.json`);
    const hasThird = await fileExists(thirdPath);
    if (needsThird && !hasThird) throw new Error(`missing tie-break judgment ${item.id} pass 3`);
    if (!needsThird && hasThird) throw new Error(`unexpected tie-break judgment ${item.id} pass 3`);
    if (needsThird) {
      const judgment = JSON.parse(await readFile(thirdPath, "utf8"));
      passes.push(normalizeBlindJudgment({ manifest, item, pass: 3, judgment }));
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
      const manifest = JSON.parse(await readFile(resolve(manifestPath), "utf8"));
      const adjudications = await ingestBlindJudgments({
        manifest,
        judgmentsDirectory: resolve(judgmentsDirectory),
      });
      process.stdout.write(`${JSON.stringify(adjudications, null, 2)}\n`);
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
