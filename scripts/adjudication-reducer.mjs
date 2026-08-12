#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import {
  adjudicationsDisagree,
  deriveEligibleWinner,
  majorityFailureSet,
  validateEligibility,
} from "./blind-eligibility.mjs";

const VALID_WINNERS = new Set(["candidate", "incumbent", "tie"]);
const VALID_SIDES = new Set(["candidate", "incumbent"]);

export const REDUCTION_POLICY = "Agreed mapped winners and hard-gate sets use pass 1/2 mean scores and require both-pass consensus for each final hard-gate failure. Winner or either side's hard-gate disagreement requires pass 3 winner and scores; each final hard-gate failure then requires at least two of the three used passes. Candidate and incumbent failures reduce independently under the same rule, then final winner eligibility is derived from those majority failure sets. Per-pass evidence remains preserved.";

const uniqueStrings = (values, label, errors) => {
  if (!Array.isArray(values) || values.some((value) => typeof value !== "string")) {
    errors.push(`${label} must be a string array`);
    return [];
  }
  const unique = [...new Set(values)];
  if (unique.length !== values.length) errors.push(`${label} contains duplicates`);
  return unique;
};

const declaredVetoes = (manifest) => {
  const declarations = manifest.adjudication?.absolute_vetoes ?? manifest.absolute_vetoes ?? [];
  if (Array.isArray(declarations)) return new Set(declarations);
  if (declarations && typeof declarations === "object") return new Set(Object.keys(declarations));
  return new Set();
};

const declaredHardGates = (manifest) => new Set(Object.keys(
  manifest.hard_gate_definitions ?? manifest.adjudication?.hard_gate_definitions ?? {},
));

const requiredDimensions = (manifest, item) => {
  const dimensions = new Set(manifest.rubric?.dimensions ?? []);
  for (const domain of item.domain_dimensions ?? []) {
    for (const dimension of manifest.rubric?.domain_dimensions?.[domain] ?? []) dimensions.add(dimension);
  }
  return [...dimensions];
};

const validateOrder = (order, label, errors) => {
  if (!Array.isArray(order)
    || order.length !== 2
    || new Set(order).size !== 2
    || order.some((side) => !VALID_SIDES.has(side))) {
    errors.push(`${label}.order must contain candidate and incumbent exactly once`);
    return false;
  }
  return true;
};

const validateScores = (scores, dimensions, label, errors) => {
  if (!scores || typeof scores !== "object" || Array.isArray(scores)) {
    errors.push(`${label} must be an object`);
    return;
  }
  const allowed = new Set(dimensions);
  for (const dimension of dimensions) {
    const value = scores[dimension];
    if (!Number.isFinite(value) || value < 1 || value > 5) {
      errors.push(`${label}.${dimension} must be a finite score from 1 to 5`);
    }
  }
  for (const dimension of Object.keys(scores)) {
    if (!allowed.has(dimension)) errors.push(`${label} contains unknown dimension ${dimension}`);
  }
};

const validatePass = ({ pass, item, manifest, dimensions, allowedVetoes, label, errors }) => {
  if (!pass || typeof pass !== "object" || Array.isArray(pass)) {
    errors.push(`${label} must be an object`);
    return;
  }
  validateOrder(pass.order, label, errors);
  if (!VALID_WINNERS.has(pass.winner)) errors.push(`${label}.winner has invalid value ${String(pass.winner)}`);
  validateScores(pass.candidateScores, dimensions, `${label}.candidateScores`, errors);
  validateScores(pass.incumbentScores, dimensions, `${label}.incumbentScores`, errors);

  const vetoes = uniqueStrings(pass.candidateVetoes, `${label}.candidateVetoes`, errors);
  for (const veto of vetoes) {
    if (!allowedVetoes.has(veto)) errors.push(`${label}.candidateVetoes contains unknown veto ${veto}`);
  }

  const failures = uniqueStrings(
    pass.candidateHardGateFailures,
    `${label}.candidateHardGateFailures`,
    errors,
  );
  const allowedGates = new Set(item.hard_gates ?? []);
  for (const gate of failures) {
    if (!allowedGates.has(gate)) errors.push(`${label}.candidateHardGateFailures contains unknown gate ${gate}`);
  }

  const incumbentFailures = uniqueStrings(
    pass.incumbentHardGateFailures,
    `${label}.incumbentHardGateFailures`,
    errors,
  );
  for (const gate of incumbentFailures) {
    if (!allowedGates.has(gate)) errors.push(`${label}.incumbentHardGateFailures contains unknown gate ${gate}`);
  }

  errors.push(...validateEligibility({ ...pass, label }));
};

const union = (passes, field) => [...new Set(passes.flatMap((pass) => pass[field]))];

export function reduceAdjudications({ manifest, adjudications }) {
  const errors = [];
  if (!manifest || typeof manifest !== "object" || !Array.isArray(manifest.cases)) {
    throw new Error("Invalid adjudication passes:\n- manifest must declare a cases array");
  }
  if (!Array.isArray(adjudications)) {
    throw new Error("Invalid adjudication passes:\n- adjudications must be an array");
  }

  const allowedVetoes = declaredVetoes(manifest);
  const knownHardGates = declaredHardGates(manifest);
  const expected = new Map(manifest.cases.map((item) => [item.id, item]));
  const supplied = new Map();

  for (const [index, adjudication] of adjudications.entries()) {
    const label = adjudication?.id ? `case ${adjudication.id}` : `case at index ${index}`;
    if (!adjudication?.id || typeof adjudication.id !== "string") {
      errors.push(`${label} must have a string id`);
      continue;
    }
    if (!expected.has(adjudication.id)) {
      errors.push(`${label} is not declared in the manifest`);
      continue;
    }
    if (supplied.has(adjudication.id)) {
      errors.push(`${label} is duplicated`);
      continue;
    }
    supplied.set(adjudication.id, adjudication);
  }

  for (const item of manifest.cases) {
    for (const gate of item.hard_gates ?? []) {
      if (knownHardGates.size > 0 && !knownHardGates.has(gate)) {
        errors.push(`case ${item.id} declares unknown hard gate ${gate}`);
      }
    }
    if (!supplied.has(item.id)) errors.push(`missing adjudication case ${item.id}`);
  }

  const records = [];
  for (const item of manifest.cases) {
    const adjudication = supplied.get(item.id);
    if (!adjudication) continue;
    const label = `case ${item.id}`;
    if (!Array.isArray(adjudication.passes)) {
      errors.push(`${label}.passes must be an array`);
      continue;
    }

    const byNumber = new Map();
    for (const [index, pass] of adjudication.passes.entries()) {
      const passLabel = `${label} pass ${String(pass?.pass ?? index + 1)}`;
      if (!Number.isInteger(pass?.pass) || pass.pass < 1 || pass.pass > 3) {
        errors.push(`${passLabel}.pass must be 1, 2, or 3`);
        continue;
      }
      if (byNumber.has(pass.pass)) {
        errors.push(`${label} pass ${pass.pass} is duplicated`);
        continue;
      }
      byNumber.set(pass.pass, pass);
    }

    const dimensions = requiredDimensions(manifest, item);
    for (const passNumber of [1, 2, 3]) {
      const pass = byNumber.get(passNumber);
      if (pass) validatePass({
        pass,
        item,
        manifest,
        dimensions,
        allowedVetoes,
        label: `${label} pass ${passNumber}`,
        errors,
      });
    }

    const first = byNumber.get(1);
    const second = byNumber.get(2);
    const third = byNumber.get(3);
    if (!first) errors.push(`${label} is missing pass 1`);
    if (!second) errors.push(`${label} is missing pass 2`);
    if (!first || !second) continue;

    if (Array.isArray(first.order) && Array.isArray(second.order)
      && (first.order[0] !== second.order[1] || first.order[1] !== second.order[0])) {
      errors.push(`${label} passes 1 and 2 must use swapped order`);
    }

    const passesDisagree = adjudicationsDisagree(first, second);
    if (passesDisagree && !third) {
      errors.push(`${label} requires pass 3 because mapped winners or hard-gate failure sets differ`);
    }
    if (!passesDisagree && third) {
      errors.push(`${label} forbids pass 3 because mapped winners and hard-gate failure sets agree`);
    }
    if (passesDisagree && !third) continue;

    const usedPasses = passesDisagree ? [first, second, third] : [first, second];
    const scorePass = passesDisagree ? third : null;
    const candidateScores = {};
    const incumbentScores = {};
    for (const dimension of dimensions) {
      candidateScores[dimension] = scorePass
        ? scorePass.candidateScores?.[dimension]
        : (first.candidateScores?.[dimension] + second.candidateScores?.[dimension]) / 2;
      incumbentScores[dimension] = scorePass
        ? scorePass.incumbentScores?.[dimension]
        : (first.incumbentScores?.[dimension] + second.incumbentScores?.[dimension]) / 2;
    }

    const candidateHardGateFailures = majorityFailureSet(
      usedPasses,
      "candidateHardGateFailures",
    );
    const incumbentHardGateFailures = majorityFailureSet(
      usedPasses,
      "incumbentHardGateFailures",
    );
    const baseWinner = scorePass ? scorePass.winner : first.winner;
    const winner = deriveEligibleWinner({
      baseWinner,
      candidateHardGateFailures,
      incumbentHardGateFailures,
    });
    errors.push(...validateEligibility({
      winner,
      candidateHardGateFailures,
      incumbentHardGateFailures,
      candidateScores,
      incumbentScores,
      label: `${label} final`,
    }));

    records.push({
      id: item.id,
      final: {
        winner,
        candidateVetoes: union(usedPasses, "candidateVetoes"),
        candidateHardGateFailures,
        incumbentHardGateFailures,
        candidateScores,
        incumbentScores,
      },
    });
  }

  if (errors.length) throw new Error(`Invalid adjudication passes:\n- ${errors.join("\n- ")}`);
  return records;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [manifestPath, adjudicationsPath] = process.argv.slice(2);
  if (!manifestPath || !adjudicationsPath) {
    process.stderr.write("Usage: node scripts/adjudication-reducer.mjs <manifest.json> <adjudications.json>\n");
    process.exitCode = 2;
  } else {
    try {
      const [manifest, adjudications] = await Promise.all([
        readFile(resolve(manifestPath), "utf8").then(JSON.parse),
        readFile(resolve(adjudicationsPath), "utf8").then(JSON.parse),
      ]);
      const records = reduceAdjudications({ manifest, adjudications });
      process.stdout.write(`${JSON.stringify(records, null, 2)}\n`);
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
