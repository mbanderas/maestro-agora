// Deterministic release evaluation; raw model outputs remain ignored local custody.
export const LEGACY_PROTECTED_DIMENSIONS = [
  "truth-discipline",
  "first-read-comprehension",
  "concrete-action-clarity",
];

const score = (scores, dimension) => Number(scores?.[dimension] ?? 0);

export const protectedDrops = (record) => LEGACY_PROTECTED_DIMENSIONS
  .map((dimension) => {
    const candidate = score(record.final.candidateScores, dimension);
    const incumbent = score(record.final.incumbentScores, dimension);
    return { dimension, candidate, incumbent, delta: incumbent - candidate };
  })
  .filter((row) => row.delta > 0);

export const candidateContractFailures = (record) => ({
  vetoes: [...new Set(record.final.candidateVetoes ?? [])],
  hardGates: [...new Set(record.final.candidateHardGateFailures ?? [])],
});

const mean = (values) => values.length
  ? values.reduce((total, value) => total + value, 0) / values.length
  : 0;

export const summarizeDomainQuality = (records, ids) => {
  const selected = records.filter((record) => ids.has(record.id));
  const candidateValues = selected.flatMap((record) => Object.values(record.final.candidateScores ?? {}).map(Number));
  const incumbentValues = selected.flatMap((record) => Object.values(record.final.incumbentScores ?? {}).map(Number));
  const candidateMean = mean(candidateValues);
  const incumbentMean = mean(incumbentValues);
  const contractFailures = selected.filter((record) => {
    const contract = candidateContractFailures(record);
    return contract.vetoes.length || contract.hardGates.length;
  }).map((record) => record.id);

  return {
    total: ids.size,
    candidateWins: selected.filter((record) => record.final.winner === "candidate").length,
    ties: selected.filter((record) => record.final.winner === "tie").length,
    incumbentWins: selected.filter((record) => record.final.winner === "incumbent").length,
    candidateMean,
    incumbentMean,
    meanDelta: candidateMean - incumbentMean,
    contractFailures,
  };
};

export const passesDomainQuality = ({ summary, superiorityTarget, noninferiorityMargin }) =>
  summary.contractFailures.length === 0 && (
    summary.candidateWins >= superiorityTarget
    || summary.meanDelta >= -noninferiorityMargin
  );

export const isMaterialLegacyRegression = (record) => {
  const contract = candidateContractFailures(record);
  if (contract.vetoes.length || contract.hardGates.length) return true;
  if (record.final.winner !== "incumbent") return false;

  const drops = protectedDrops(record);
  const truthMaterial = drops.some((row) =>
    row.dimension === "truth-discipline" && (row.delta >= 1 || row.candidate <= 3));
  const comprehensionDropped = drops.some((row) => row.dimension === "first-read-comprehension");
  const actionDropped = drops.some((row) => row.dimension === "concrete-action-clarity");
  const severeDrop = drops.some((row) => row.delta >= 2 || row.candidate <= 2.5);

  return truthMaterial || (comprehensionDropped && actionDropped) || severeDrop;
};

export const classifyBlindFindings = ({ records, legacyIds, criticalIds }) => {
  const legacyReviewFindings = [];
  const materialLegacyRegressions = [];
  const criticalPreferenceLosses = [];
  const criticalContractFailures = [];
  const candidateHardGateFailures = [];

  for (const record of records) {
    const contract = candidateContractFailures(record);
    if (contract.hardGates.length) {
      candidateHardGateFailures.push({ id: record.id, hardGates: contract.hardGates });
    }

    if (legacyIds.has(record.id) && (protectedDrops(record).length || contract.vetoes.length || contract.hardGates.length)) {
      legacyReviewFindings.push(record.id);
      if (isMaterialLegacyRegression(record)) materialLegacyRegressions.push(record.id);
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
  };
};
