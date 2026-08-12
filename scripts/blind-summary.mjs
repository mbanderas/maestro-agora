#!/usr/bin/env node

// Deterministic adjudication reduction; generation and judgment remain separate.
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { validateEligibility } from "./blind-eligibility.mjs";

export const LEGACY_PROTECTED_DIMENSIONS = [
  "argument-inevitability",
  "sustained-emotional-relevance",
  "proof-salience",
  "mechanism-differentiation",
  "natural-channel-fit",
  "truth-discipline",
  "first-read-comprehension",
  "concrete-action-clarity",
];

const VALID_WINNERS = new Set(["candidate", "incumbent", "tie"]);
const score = (scores, dimension) => Number(scores?.[dimension]);

export const requiredDimensionsForCase = (manifest, item) => {
  const dimensions = new Set(manifest.rubric?.dimensions ?? []);
  for (const domain of item.domain_dimensions ?? []) {
    for (const dimension of manifest.rubric?.domain_dimensions?.[domain] ?? []) dimensions.add(dimension);
  }
  return [...dimensions];
};

export const validateAdjudicationRecords = ({ manifest, records, requireComplete = true }) => {
  const errors = [];
  const expected = new Map((manifest.cases ?? []).map((item) => [item.id, item]));
  const seen = new Set();

  if (!Array.isArray(records)) return ["records must be an array"];

  for (const [index, record] of records.entries()) {
    const label = record?.id ? `record ${record.id}` : `record at index ${index}`;
    if (!record?.id || typeof record.id !== "string") {
      errors.push(`${label} must have a string id`);
      continue;
    }
    if (seen.has(record.id)) errors.push(`${label} is duplicated`);
    seen.add(record.id);

    const item = expected.get(record.id);
    if (!item) {
      errors.push(`${label} is not declared in the manifest`);
      continue;
    }

    const final = record.final;
    if (!final || typeof final !== "object") {
      errors.push(`${label} must have a final adjudication`);
      continue;
    }
    if (!VALID_WINNERS.has(final.winner)) errors.push(`${label} has invalid winner ${String(final.winner)}`);

    for (const field of [
      "candidateVetoes",
      "candidateHardGateFailures",
      "incumbentHardGateFailures",
    ]) {
      if (!Array.isArray(final[field]) || final[field].some((value) => typeof value !== "string")) {
        errors.push(`${label} ${field} must be a string array`);
      } else if (new Set(final[field]).size !== final[field].length) {
        errors.push(`${label} ${field} contains duplicates`);
      }
    }

    const allowedHardGates = new Set(item.hard_gates ?? []);
    for (const field of ["candidateHardGateFailures", "incumbentHardGateFailures"]) {
      for (const gate of Array.isArray(final[field]) ? final[field] : []) {
        if (!allowedHardGates.has(gate)) errors.push(`${label} ${field} contains undeclared hard gate ${gate}`);
      }
    }

    const required = requiredDimensionsForCase(manifest, item);
    const allowed = new Set(required);
    for (const side of ["candidateScores", "incumbentScores"]) {
      const scores = final[side];
      if (!scores || typeof scores !== "object" || Array.isArray(scores)) {
        errors.push(`${label} ${side} must be an object`);
        continue;
      }

      for (const dimension of required) {
        const value = scores[dimension];
        if (!Number.isFinite(value) || value < 1 || value > 5) {
          errors.push(`${label} ${side}.${dimension} must be a finite score from 1 to 5`);
        }
      }
      for (const dimension of Object.keys(scores)) {
        if (!allowed.has(dimension)) errors.push(`${label} ${side} contains undeclared dimension ${dimension}`);
      }
    }
    errors.push(...validateEligibility({
      winner: final.winner,
      candidateHardGateFailures: final.candidateHardGateFailures,
      incumbentHardGateFailures: final.incumbentHardGateFailures,
      candidateScores: final.candidateScores,
      incumbentScores: final.incumbentScores,
      label,
    }));
  }

  if (requireComplete) {
    for (const id of expected.keys()) {
      if (!seen.has(id)) errors.push(`missing adjudication record ${id}`);
    }
  }

  return errors;
};

export const incumbentContractFailures = (record) => ({
  hardGates: [...new Set(record.final.incumbentHardGateFailures ?? [])],
});

export const protectedDrops = (record, dimensions = LEGACY_PROTECTED_DIMENSIONS) => {
  if (incumbentContractFailures(record).hardGates.length) return [];
  return dimensions
    .map((dimension) => {
      const candidate = score(record.final.candidateScores, dimension);
      const incumbent = score(record.final.incumbentScores, dimension);
      return { dimension, candidate, incumbent, delta: incumbent - candidate };
    })
    .filter((row) => Number.isFinite(row.candidate) && Number.isFinite(row.incumbent) && row.delta > 0);
};

export const candidateContractFailures = (record) => ({
  vetoes: [...new Set(record.final.candidateVetoes ?? [])],
  hardGates: [...new Set(record.final.candidateHardGateFailures ?? [])],
});

const mean = (values) => values.length
  ? values.reduce((total, value) => total + value, 0) / values.length
  : Number.NaN;

export const summarizeDomainQuality = ({ records, ids, manifest }) => {
  const selected = records.filter((record) => ids.has(record.id));
  const selectedIds = new Set(selected.map((record) => record.id));
  const missingIds = [...ids].filter((id) => !selectedIds.has(id));
  const comparable = selected.filter(
    (record) => incumbentContractFailures(record).hardGates.length === 0,
  );
  const candidateValues = comparable.flatMap(
    (record) => Object.values(record.final.candidateScores).map(Number),
  );
  const incumbentValues = comparable.flatMap(
    (record) => Object.values(record.final.incumbentScores).map(Number),
  );
  const candidateMean = mean(candidateValues);
  const incumbentMean = mean(incumbentValues);
  const contractFailures = [];
  const incumbentHardGateFailures = [];
  const scoreRegressions = [];

  for (const record of selected) {
    const contract = candidateContractFailures(record);
    if (contract.vetoes.length || contract.hardGates.length) contractFailures.push(record.id);
    const incumbentContract = incumbentContractFailures(record);
    if (incumbentContract.hardGates.length) {
      incumbentHardGateFailures.push({ id: record.id, hardGates: incumbentContract.hardGates });
      continue;
    }
    const item = manifest.cases.find((candidate) => candidate.id === record.id);
    const drops = protectedDrops(record, requiredDimensionsForCase(manifest, item));
    if (drops.length) scoreRegressions.push({ id: record.id, dimensions: drops.map((drop) => drop.dimension) });
  }

  return {
    total: ids.size,
    observed: selected.length,
    coverageComplete: missingIds.length === 0,
    missingIds,
    comparableCaseCount: comparable.length,
    totalCandidateWins: selected.filter((record) => record.final.winner === "candidate").length,
    comparableCandidateWins: comparable.filter((record) => record.final.winner === "candidate").length,
    ties: selected.filter((record) => record.final.winner === "tie").length,
    incumbentWins: selected.filter((record) => record.final.winner === "incumbent").length,
    candidateMean,
    incumbentMean,
    meanDelta: candidateMean - incumbentMean,
    contractFailures,
    incumbentHardGateFailures,
    scoreRegressions,
  };
};

export const passesDomainQuality = ({ summary, superiorityTarget, noninferiorityMargin }) =>
  summary.coverageComplete
  && summary.comparableCaseCount >= superiorityTarget
  && summary.contractFailures.length === 0
  && summary.scoreRegressions.length === 0
  && Number.isFinite(summary.meanDelta)
  && summary.comparableCandidateWins >= superiorityTarget
  && summary.meanDelta >= -noninferiorityMargin;

export const isMaterialLegacyRegression = (record, dimensions = LEGACY_PROTECTED_DIMENSIONS) => {
  const contract = candidateContractFailures(record);
  return contract.vetoes.length > 0
    || contract.hardGates.length > 0
    || protectedDrops(record, dimensions).length > 0;
};

export const classifyBlindFindings = ({ records, legacyIds, criticalIds, manifest }) => {
  const evidenceErrors = validateAdjudicationRecords({ manifest, records });
  if (evidenceErrors.length) throw new Error(`Invalid adjudication evidence:\n- ${evidenceErrors.join("\n- ")}`);

  const legacyReviewFindings = [];
  const materialLegacyRegressions = [];
  const criticalPreferenceLosses = [];
  const criticalContractFailures = [];
  const candidateHardGateFailures = [];
  const incumbentHardGateFailures = [];

  for (const record of records) {
    const contract = candidateContractFailures(record);
    const item = manifest.cases.find((candidate) => candidate.id === record.id);
    const dimensions = requiredDimensionsForCase(manifest, item);
    if (contract.hardGates.length) {
      candidateHardGateFailures.push({ id: record.id, hardGates: contract.hardGates });
    }
    const incumbentContract = incumbentContractFailures(record);
    if (incumbentContract.hardGates.length) {
      incumbentHardGateFailures.push({ id: record.id, hardGates: incumbentContract.hardGates });
    }

    if (legacyIds.has(record.id) && isMaterialLegacyRegression(record, dimensions)) {
      legacyReviewFindings.push(record.id);
      materialLegacyRegressions.push(record.id);
    }

    if (criticalIds.has(record.id)) {
      if (record.final.winner === "incumbent") criticalPreferenceLosses.push(record.id);
      if (contract.vetoes.length || contract.hardGates.length) criticalContractFailures.push(record.id);
    }
  }

  return {
    legacyReviewFindings,
    materialLegacyRegressions,
    criticalPreferenceLosses,
    criticalContractFailures,
    candidateHardGateFailures,
    incumbentHardGateFailures,
  };
};

export const evaluateReleaseGates = ({ manifest, records, releasePlan }) => {
  const gates = manifest.release_gates ?? {};
  const errors = [];
  const usedGates = new Set();
  const useGate = (name) => {
    usedGates.add(name);
    if (!(name in gates)) errors.push(`release plan references missing gate ${name}`);
    return gates[name];
  };

  if (!releasePlan || releasePlan.schema_version !== 1 || !Array.isArray(releasePlan.partitions)) {
    return { pass: false, errors: ["release gates require a schema_version 1 release plan with partitions"] };
  }
  if (releasePlan.skill_version !== manifest.skill_version) {
    errors.push(`release plan skill version ${releasePlan.skill_version} does not match manifest ${manifest.skill_version}`);
  }

  const governanceDefault = useGate(releasePlan.governance_default_gate);
  if (governanceDefault !== true) errors.push(`${releasePlan.governance_default_gate} must be true`);
  const requireNoVetoes = useGate(releasePlan.absolute_veto_gate);
  const legacyAllowed = useGate(releasePlan.legacy_regressions_allowed_gate);
  const criticalAllowed = useGate(releasePlan.critical_contract_failures_allowed_gate);
  const noninferiorityMargin = useGate(releasePlan.noninferiority_margin_gate);

  const manifestIds = new Set(manifest.cases.map((item) => item.id));
  const assignedIds = new Set(releasePlan.legacy_case_ids ?? []);
  for (const id of assignedIds) if (!manifestIds.has(id)) errors.push(`release plan references unknown legacy case ${id}`);

  const criticalIds = new Set(manifest.cases.filter((item) => item.critical).map((item) => item.id));
  let findings;
  try {
    findings = classifyBlindFindings({ records, legacyIds: assignedIds, criticalIds, manifest });
  } catch (error) {
    errors.push(error.message);
  }

  const partitionResults = [];
  for (const partition of releasePlan.partitions) {
    const ids = new Set(partition.case_ids ?? []);
    for (const id of ids) {
      if (!manifestIds.has(id)) errors.push(`partition ${partition.id} references unknown case ${id}`);
      if (assignedIds.has(id)) errors.push(`case ${id} is assigned to more than one release partition`);
      assignedIds.add(id);
    }

    const expectedCount = useGate(partition.case_count_gate);
    const winsRequired = useGate(partition.wins_required_gate);
    const regressionsAllowed = partition.dimension_regressions_allowed_gate
      ? useGate(partition.dimension_regressions_allowed_gate)
      : 0;
    if (ids.size !== expectedCount) {
      errors.push(`partition ${partition.id} declares ${ids.size} cases but ${partition.case_count_gate} requires ${expectedCount}`);
    }

    const summary = summarizeDomainQuality({ records, ids, manifest });
    const pass = summary.coverageComplete
      && summary.comparableCaseCount >= winsRequired
      && summary.contractFailures.length === 0
      && summary.scoreRegressions.length <= regressionsAllowed
      && Number.isFinite(summary.meanDelta)
      && summary.comparableCandidateWins >= winsRequired
      && summary.meanDelta >= -noninferiorityMargin;
    partitionResults.push({ id: partition.id, pass, winsRequired, regressionsAllowed, summary });
  }

  for (const id of manifestIds) if (!assignedIds.has(id)) errors.push(`release plan does not assign case ${id}`);
  for (const gate of Object.keys(gates)) if (!usedGates.has(gate)) errors.push(`release gate ${gate} is not mapped by the release plan`);

  const candidateVetoCount = records.reduce(
    (total, record) => total + new Set(record.final?.candidateVetoes ?? []).size,
    0,
  );
  if (requireNoVetoes === true && candidateVetoCount > 0) errors.push("candidate absolute vetoes are present");
  if (findings && findings.candidateHardGateFailures.length > 0) {
    errors.push("candidate hard-gate failures are present");
  }
  if (findings && findings.materialLegacyRegressions.length > legacyAllowed) {
    errors.push(`legacy material regressions exceed ${legacyAllowed}`);
  }
  if (findings && findings.criticalContractFailures.length > criticalAllowed) {
    errors.push(`critical contract failures exceed ${criticalAllowed}`);
  }

  return {
    pass: errors.length === 0 && partitionResults.every((partition) => partition.pass),
    errors,
    findings,
    partitionResults,
  };
};

export const evaluateBlindRun = ({ manifest, records, releasePlan }) => {
  const evidenceErrors = validateAdjudicationRecords({ manifest, records });
  if (evidenceErrors.length) return { pass: false, evidenceErrors };

  if (manifest.release_gates) {
    const release = evaluateReleaseGates({ manifest, records, releasePlan });
    return { pass: release.pass, evidenceErrors: release.errors, release };
  }

  const legacyIds = new Set(manifest.cases.map((item) => item.id));
  const criticalIds = new Set(manifest.cases.filter((item) => item.critical).map((item) => item.id));
  const findings = classifyBlindFindings({ records, legacyIds, criticalIds, manifest });
  return {
    pass: findings.materialLegacyRegressions.length === 0
      && findings.criticalContractFailures.length === 0
      && findings.candidateHardGateFailures.length === 0,
    evidenceErrors: [],
    findings,
  };
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [manifestPath, recordsPath, suppliedReleasePlanPath] = process.argv.slice(2);
  if (!manifestPath || !recordsPath) {
    process.stderr.write("Usage: node scripts/blind-summary.mjs <manifest.json> <records.json> [release-plan.json]\n");
    process.exitCode = 2;
  } else {
    const [manifest, records] = await Promise.all([
      readFile(resolve(manifestPath), "utf8").then(JSON.parse),
      readFile(resolve(recordsPath), "utf8").then(JSON.parse),
    ]);
    const releasePlanPath = suppliedReleasePlanPath
      ? resolve(suppliedReleasePlanPath)
      : resolve(dirname(resolve(manifestPath)), "..", "..", "releases", `${manifest.skill_version}.gates.json`);
    const releasePlan = manifest.release_gates
      ? await readFile(releasePlanPath, "utf8").then(JSON.parse)
      : undefined;
    const result = evaluateBlindRun({ manifest, records, releasePlan });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (!result.pass) process.exitCode = 1;
  }
}
