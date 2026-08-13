import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  classifyBlindFindings,
  evaluateBlindRun,
  isMaterialLegacyRegression,
  passesDomainQuality,
  protectedDrops,
  requiredComparableWins,
  requiredDimensionsForCase,
  summarizeDomainQuality,
  validateAdjudicationRecords,
} from "../scripts/blind-summary.mjs";

const historical = JSON.parse(await readFile(new URL("../evals/blind/v1.5.0/manifest.json", import.meta.url), "utf8"));
const historicalReleasePlan = JSON.parse(await readFile(new URL("../evals/releases/v1.5.0.gates.json", import.meta.url), "utf8"));
const dimensions = [
  "truth-discipline",
  "first-read-comprehension",
  "concrete-action-clarity",
  "source-promise-preservation",
  "buyer-effort-preservation",
  "friction-preservation",
  "emotional-desirability",
  "delivery-role-preservation",
];
const manifest = {
  rubric: {
    dimensions,
    domain_dimensions: { commercial: ["composition-fit"] },
  },
  cases: [
    {
      id: "case-a",
      domain_dimensions: ["commercial"],
      critical: false,
      hard_gates: ["required-boundary", "delivery-role-preservation"],
    },
    {
      id: "case-b",
      domain_dimensions: ["commercial"],
      critical: true,
      hard_gates: ["required-boundary", "delivery-role-preservation"],
    },
  ],
};

const scores = (overrides = {}) => Object.fromEntries([
  ...dimensions.map((dimension) => [dimension, 5]),
  ["composition-fit", 5],
].map(([dimension, value]) => [dimension, overrides[dimension] ?? value]));

const record = ({
  id = "case-a",
  winner = "candidate",
  candidate = {},
  incumbent = {},
  vetoes = [],
  hardGates = [],
  incumbentHardGates = [],
} = {}) => ({
  id,
  final: {
    winner,
    candidateVetoes: vetoes,
    candidateHardGateFailures: hardGates,
    incumbentHardGateFailures: incumbentHardGates,
    candidateScores: scores(candidate),
    incumbentScores: scores(incumbent),
  },
});

const completeRecords = () => [record(), record({ id: "case-b", winner: "tie" })];

test("adjudication evidence requires complete unique manifest coverage", () => {
  assert.deepEqual(validateAdjudicationRecords({ manifest, records: completeRecords() }), []);
  assert.match(validateAdjudicationRecords({ manifest, records: [record()] })[0], /missing adjudication record case-b/);
  assert.match(validateAdjudicationRecords({ manifest, records: [record(), record()] })[0], /duplicated/);
  assert.match(validateAdjudicationRecords({ manifest, records: [...completeRecords(), record({ id: "unknown" })] }).join("\n"), /not declared/);
});

test("adjudication evidence rejects missing, unknown, and invalid scores", () => {
  const missing = completeRecords();
  delete missing[0].final.candidateScores["buyer-effort-preservation"];
  assert.match(validateAdjudicationRecords({ manifest, records: missing }).join("\n"), /buyer-effort-preservation must be a finite score/);

  const unknown = completeRecords();
  unknown[0].final.candidateScores.unregistered = 4;
  assert.match(validateAdjudicationRecords({ manifest, records: unknown }).join("\n"), /undeclared dimension unregistered/);

  const invalid = completeRecords();
  invalid[0].final.incumbentScores["friction-preservation"] = 6;
  assert.match(validateAdjudicationRecords({ manifest, records: invalid }).join("\n"), /friction-preservation must be a finite score from 1 to 5/);
});

test("adjudication evidence rejects hard-gate-ineligible final winners", () => {
  const records = completeRecords();
  records[0].final.incumbentHardGateFailures = ["required-boundary"];
  records[0].final.winner = "tie";
  assert.match(
    validateAdjudicationRecords({ manifest, records }).join("\n"),
    /winner must be candidate because only incumbent fails hard gates/,
  );
});

test("adjudication evidence rejects invalid-side score advantages", () => {
  const records = completeRecords();
  records[0].final.incumbentHardGateFailures = ["required-boundary"];
  records[0].final.winner = "candidate";
  records[0].final.incumbentScores["brief-fidelity"] = 5;
  records[0].final.candidateScores["brief-fidelity"] = 4;
  assert.match(
    validateAdjudicationRecords({ manifest, records }).join("\n"),
    /incumbentScores\.brief-fidelity cannot exceed candidateScores\.brief-fidelity/,
  );
});

test("candidate win cannot hide a protected commercial regression", () => {
  const item = record({
    winner: "candidate",
    candidate: { "source-promise-preservation": 4 },
  });
  assert.deepEqual(protectedDrops(item, dimensions).map((drop) => drop.dimension), ["source-promise-preservation"]);
  assert.equal(isMaterialLegacyRegression(item, dimensions), true);
});

test("hard-gate and veto failures remain material regardless of winner", () => {
  assert.equal(isMaterialLegacyRegression(record({ hardGates: ["required-boundary"] }), dimensions), true);
  assert.equal(isMaterialLegacyRegression(record({ vetoes: ["claim-destination-mismatch"] }), dimensions), true);
});

test("classification fails closed before interpreting malformed evidence", () => {
  assert.throws(() => classifyBlindFindings({
    records: [record()],
    legacyIds: new Set(["case-a", "case-b"]),
    criticalIds: new Set(["case-b"]),
    manifest,
  }), /missing adjudication record case-b/);
});

test("critical preferences stay visible and contract failures block", () => {
  const records = completeRecords();
  records[1].final.winner = "incumbent";
  records[1].final.candidateHardGateFailures = ["delivery-role-preservation"];
  const result = classifyBlindFindings({
    records,
    legacyIds: new Set(["case-a", "case-b"]),
    criticalIds: new Set(["case-b"]),
    manifest,
  });

  assert.deepEqual(result.criticalPreferenceLosses, ["case-b"]);
  assert.deepEqual(result.criticalContractFailures, ["case-b"]);
  assert.deepEqual(result.materialLegacyRegressions, ["case-b"]);
});

test("domain quality fails on incomplete coverage or any required score regression", () => {
  const ids = new Set(["case-a", "case-b"]);
  const incomplete = summarizeDomainQuality({ records: [record()], ids, manifest });
  assert.equal(incomplete.coverageComplete, false);
  assert.equal(passesDomainQuality({ summary: incomplete, superiorityTarget: 1, noninferiorityMargin: 0.25 }), false);

  const records = completeRecords();
  records[0].final.candidateScores["emotional-desirability"] = 4;
  const regressed = summarizeDomainQuality({ records, ids, manifest });
  assert.deepEqual(regressed.scoreRegressions, [{ id: "case-a", dimensions: ["emotional-desirability"] }]);
  assert.equal(passesDomainQuality({ summary: regressed, superiorityTarget: 1, noninferiorityMargin: 0.25 }), false);
});

test("incumbent-invalid cases are findings and excluded from scores and superiority quota", () => {
  const records = completeRecords();
  records[1] = record({
    id: "case-b",
    winner: "candidate",
    candidate: { "emotional-desirability": 1 },
    incumbent: { "emotional-desirability": 5 },
    incumbentHardGates: ["required-boundary"],
  });
  const ids = new Set(["case-a", "case-b"]);
  const summary = summarizeDomainQuality({ records, ids, manifest });
  assert.equal(summary.comparableCaseCount, 1);
  assert.equal(summary.totalCandidateWins, 2);
  assert.equal(summary.comparableCandidateWins, 1);
  assert.deepEqual(summary.scoreRegressions, []);
  assert.equal(summary.candidateMean, 5);
  assert.equal(summary.incumbentMean, 5);
  assert.deepEqual(summary.incumbentHardGateFailures, [{
    id: "case-b",
    hardGates: ["required-boundary"],
  }]);
  assert.equal(passesDomainQuality({
    summary,
    superiorityTarget: 2,
    noninferiorityMargin: 0.25,
  }), false);

  const findings = classifyBlindFindings({
    records,
    legacyIds: ids,
    criticalIds: new Set(["case-b"]),
    manifest,
  });
  assert.deepEqual(findings.incumbentHardGateFailures, [{
    id: "case-b",
    hardGates: ["required-boundary"],
  }]);
});

test("partition superiority gate fails when comparable denominator is below its win quota", () => {
  const records = completeRecords();
  records[1] = record({
    id: "case-b",
    winner: "candidate",
    incumbentHardGates: ["required-boundary"],
  });
  const gatedManifest = {
    ...manifest,
    skill_version: "test",
    release_gates: {
      governance_default: true,
      all_cases_pass_absolute_vetoes: true,
      legacy_material_regressions_allowed: 0,
      critical_contract_failures_allowed: 0,
      domain_mean_noninferiority_margin: 0.25,
      conversion_case_count: 2,
      conversion_wins_required: 2,
    },
  };
  const releasePlan = {
    schema_version: 1,
    skill_version: "test",
    governance_default_gate: "governance_default",
    absolute_veto_gate: "all_cases_pass_absolute_vetoes",
    legacy_regressions_allowed_gate: "legacy_material_regressions_allowed",
    critical_contract_failures_allowed_gate: "critical_contract_failures_allowed",
    noninferiority_margin_gate: "domain_mean_noninferiority_margin",
    legacy_case_ids: [],
    partitions: [{
      id: "conversion",
      case_count_gate: "conversion_case_count",
      wins_required_gate: "conversion_wins_required",
      case_ids: ["case-a", "case-b"],
    }],
  };
  const result = evaluateBlindRun({ manifest: gatedManifest, records, releasePlan });
  assert.equal(result.pass, false);
  assert.equal(result.release.partitionResults[0].summary.totalCandidateWins, 2);
  assert.equal(result.release.partitionResults[0].summary.comparableCandidateWins, 1);
  assert.equal(result.release.partitionResults[0].summary.comparableCaseCount, 1);
});

const dynamicReleaseFixture = ({ caseCount, comparableCaseCount, comparableCandidateWins }) => {
  const cases = Array.from({ length: caseCount }, (_, index) => ({
    id: `dynamic-${index + 1}`,
    domain_dimensions: ["commercial"],
    critical: false,
    hard_gates: ["required-boundary"],
  }));
  const dynamicManifest = {
    rubric: manifest.rubric,
    cases,
    skill_version: "dynamic-test",
    release_gates: {
      governance_default: true,
      all_cases_pass_absolute_vetoes: true,
      legacy_material_regressions_allowed: 0,
      critical_contract_failures_allowed: 0,
      domain_mean_noninferiority_margin: 0.25,
      conversion_case_count: caseCount,
      conversion_minimum_comparable_cases: 13,
      conversion_minimum_win_rate: 0.77,
    },
  };
  const dynamicRecords = cases.map((item, index) => {
    const incumbentInvalid = index >= comparableCaseCount;
    return record({
      id: item.id,
      winner: incumbentInvalid || index < comparableCandidateWins ? "candidate" : "tie",
      incumbentHardGates: incumbentInvalid ? ["required-boundary"] : [],
    });
  });
  const releasePlan = {
    schema_version: 1,
    skill_version: "dynamic-test",
    governance_default_gate: "governance_default",
    absolute_veto_gate: "all_cases_pass_absolute_vetoes",
    legacy_regressions_allowed_gate: "legacy_material_regressions_allowed",
    critical_contract_failures_allowed_gate: "critical_contract_failures_allowed",
    noninferiority_margin_gate: "domain_mean_noninferiority_margin",
    legacy_case_ids: [],
    partitions: [{
      id: "conversion",
      case_count_gate: "conversion_case_count",
      minimum_comparable_cases_gate: "conversion_minimum_comparable_cases",
      minimum_win_rate_gate: "conversion_minimum_win_rate",
      case_ids: cases.map((item) => item.id),
    }],
  };
  return { manifest: dynamicManifest, records: dynamicRecords, releasePlan };
};

test("comparable win-rate quota rounds upward at release boundaries", () => {
  assert.equal(requiredComparableWins({ comparableCaseCount: 13, minimumWinRate: 0.77 }), 11);
  assert.equal(requiredComparableWins({ comparableCaseCount: 20, minimumWinRate: 0.77 }), 16);

  for (const [caseCount, candidateWins, expectedWins] of [[13, 11, 11], [20, 16, 16]]) {
    const result = evaluateBlindRun(dynamicReleaseFixture({
      caseCount,
      comparableCaseCount: caseCount,
      comparableCandidateWins: candidateWins,
    }));
    assert.equal(result.pass, true);
    assert.equal(result.release.partitionResults[0].winsRequired, expectedWins);

    const belowBoundary = evaluateBlindRun(dynamicReleaseFixture({
      caseCount,
      comparableCaseCount: caseCount,
      comparableCandidateWins: candidateWins - 1,
    }));
    assert.equal(belowBoundary.pass, false);
    assert.equal(belowBoundary.release.partitionResults[0].winsRequired, expectedWins);
  }
});

test("dynamic superiority excludes invalid incumbents from its denominator", () => {
  const result = evaluateBlindRun(dynamicReleaseFixture({
    caseCount: 20,
    comparableCaseCount: 13,
    comparableCandidateWins: 11,
  }));
  const partition = result.release.partitionResults[0];
  assert.equal(result.pass, true);
  assert.equal(partition.summary.totalCandidateWins, 18);
  assert.equal(partition.summary.comparableCaseCount, 13);
  assert.equal(partition.summary.comparableCandidateWins, 11);
  assert.equal(partition.winsRequired, 11);
});

test("dynamic superiority fails below its minimum comparable denominator", () => {
  const result = evaluateBlindRun(dynamicReleaseFixture({
    caseCount: 20,
    comparableCaseCount: 12,
    comparableCandidateWins: 12,
  }));
  const partition = result.release.partitionResults[0];
  assert.equal(result.pass, false);
  assert.equal(partition.summary.comparableCaseCount, 12);
  assert.equal(partition.winsRequired, 10);
  assert.equal(partition.pass, false);
});

test("domain quality fails closed when no case has a valid incumbent comparator", () => {
  const records = [
    record({ incumbentHardGates: ["required-boundary"] }),
    record({ id: "case-b", incumbentHardGates: ["required-boundary"] }),
  ];
  const summary = summarizeDomainQuality({
    records,
    ids: new Set(["case-a", "case-b"]),
    manifest,
  });
  assert.equal(summary.comparableCaseCount, 0);
  assert.equal(Number.isNaN(summary.candidateMean), true);
  assert.equal(passesDomainQuality({ summary, superiorityTarget: 1, noninferiorityMargin: 0.25 }), false);
});

test("complete non-regressive domain evidence can pass", () => {
  const records = completeRecords();
  for (const item of records) {
    for (const dimension of Object.keys(item.final.incumbentScores)) item.final.incumbentScores[dimension] = 4.9;
  }
  const summary = summarizeDomainQuality({ records, ids: new Set(["case-a", "case-b"]), manifest });
  assert.equal(summary.coverageComplete, true);
  assert.equal(passesDomainQuality({ summary, superiorityTarget: 1, noninferiorityMargin: 0.25 }), true);
});

test("run evaluation returns evidence errors instead of passing incomplete input", () => {
  const result = evaluateBlindRun({ manifest, records: [record()] });
  assert.equal(result.pass, false);
  assert.match(result.evidenceErrors.join("\n"), /missing adjudication record case-b/);
});

test("any candidate hard-gate failure blocks the run", () => {
  const records = completeRecords();
  records[0] = record({
    winner: "incumbent",
    hardGates: ["required-boundary"],
  });
  const result = evaluateBlindRun({ manifest, records });
  assert.equal(result.pass, false);
  assert.deepEqual(result.findings.candidateHardGateFailures, [{
    id: "case-a",
    hardGates: ["required-boundary"],
  }]);
});

test("historical voice hard gates retain bounded definitions", () => {
  assert.match(historical.adjudication.hard_gate_definitions["owned-vocabulary-survives-the-generic-ban"], /at least one supplied measured owned term/);
  assert.match(historical.adjudication.hard_gate_definitions["structural-tells-still-banned"], /Matching a supplied measured sentence-length or paragraph-shape distribution is not itself a failure/);
});

const historicalRecords = (winner) => historical.cases.map((item) => {
  const caseScores = Object.fromEntries(requiredDimensionsForCase(historical, item).map((dimension) => [dimension, 5]));
  return {
    id: item.id,
    final: {
      winner,
      candidateVetoes: [],
      candidateHardGateFailures: [],
      incumbentHardGateFailures: [],
      candidateScores: { ...caseScores },
      incumbentScores: { ...caseScores },
    },
  };
});

test("v1.5 release quotas reject complete all-tie evidence", () => {
  const result = evaluateBlindRun({
    manifest: historical,
    records: historicalRecords("tie"),
    releasePlan: historicalReleasePlan,
  });
  assert.equal(result.pass, false);
  assert.equal(result.evidenceErrors.length, 0);
  assert.ok(result.release.partitionResults.every((partition) => partition.pass === false));
});

test("v1.5 release plan maps every gate and case", () => {
  const result = evaluateBlindRun({
    manifest: historical,
    records: historicalRecords("candidate"),
    releasePlan: historicalReleasePlan,
  });
  assert.equal(result.pass, true);
  assert.deepEqual(result.evidenceErrors, []);
  assert.ok(result.release.partitionResults.every((partition) => partition.pass));
});

test("release evaluation fails closed on an incomplete gate map", () => {
  const releasePlan = structuredClone(historicalReleasePlan);
  releasePlan.partitions.pop();
  const result = evaluateBlindRun({
    manifest: historical,
    records: historicalRecords("candidate"),
    releasePlan,
  });
  assert.equal(result.pass, false);
  assert.match(result.evidenceErrors.join("\n"), /not mapped|does not assign/);
});
