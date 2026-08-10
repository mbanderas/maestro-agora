import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyBlindFindings,
  isMaterialLegacyRegression,
  passesDomainQuality,
  protectedDrops,
  summarizeDomainQuality,
} from "../scripts/blind-summary.mjs";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../evals/blind/v1.5.0/manifest.json", import.meta.url), "utf8"));

const record = ({
  id = "case",
  winner = "incumbent",
  candidate = {},
  incumbent = {},
  vetoes = [],
  hardGates = [],
} = {}) => ({
  id,
  final: {
    winner,
    candidateVetoes: vetoes,
    candidateHardGateFailures: hardGates,
    candidateScores: {
      "truth-discipline": 5,
      "first-read-comprehension": 5,
      "concrete-action-clarity": 5,
      ...candidate,
    },
    incumbentScores: {
      "truth-discipline": 5,
      "first-read-comprehension": 5,
      "concrete-action-clarity": 5,
      ...incumbent,
    },
  },
});

test("single one-point preference drop remains a review finding", () => {
  const item = record({
    candidate: { "concrete-action-clarity": 4 },
  });
  assert.deepEqual(protectedDrops(item), [{
    dimension: "concrete-action-clarity",
    candidate: 4,
    incumbent: 5,
    delta: 1,
  }]);
  assert.equal(isMaterialLegacyRegression(item), false);
});

test("candidate win cannot become a material regression from one score preference", () => {
  const item = record({
    winner: "candidate",
    candidate: { "first-read-comprehension": 4 },
  });
  assert.equal(isMaterialLegacyRegression(item), false);
});

test("material truth, paired comprehension-action, and severe drops remain material", () => {
  assert.equal(isMaterialLegacyRegression(record({ candidate: { "truth-discipline": 4 } })), true);
  assert.equal(isMaterialLegacyRegression(record({ candidate: {
    "first-read-comprehension": 4,
    "concrete-action-clarity": 4,
  } })), true);
  assert.equal(isMaterialLegacyRegression(record({ candidate: { "concrete-action-clarity": 2.5 } })), true);
});

test("half-point truth preference and a lone competent score remain review-only", () => {
  assert.equal(isMaterialLegacyRegression(record({
    candidate: { "truth-discipline": 4.5 },
  })), false);
  assert.equal(isMaterialLegacyRegression(record({
    candidate: { "first-read-comprehension": 3 },
    incumbent: { "first-read-comprehension": 4 },
  })), false);
});

test("hard-gate failures remain material regardless of pairwise winner", () => {
  const item = record({ winner: "candidate", hardGates: ["required-boundary"] });
  assert.equal(isMaterialLegacyRegression(item), true);
});

test("critical preference losses stay visible without becoming contract failures", () => {
  const preference = record({ id: "critical-preference" });
  const failure = record({ id: "critical-failure", hardGates: ["causality"] });
  const result = classifyBlindFindings({
    records: [preference, failure],
    legacyIds: new Set(),
    criticalIds: new Set([preference.id, failure.id]),
  });

  assert.deepEqual(result.criticalPreferenceLosses, ["critical-preference", "critical-failure"]);
  assert.deepEqual(result.criticalContractFailures, ["critical-failure"]);
  assert.deepEqual(result.candidateHardGateFailures, [{ id: "critical-failure", hardGates: ["causality"] }]);
});

test("ambiguous voice hard gates have bounded definitions", () => {
  assert.match(manifest.adjudication.hard_gate_definitions["owned-vocabulary-survives-the-generic-ban"], /at least one supplied measured owned term/);
  assert.match(manifest.adjudication.hard_gate_definitions["structural-tells-still-banned"], /Matching a supplied measured sentence-length or paragraph-shape distribution is not itself a failure/);
});

test("domain quality keeps superiority targets but accepts bounded noninferiority", () => {
  const records = [
    record({ id: "win", winner: "candidate" }),
    record({ id: "tie", winner: "tie", candidate: { "first-read-comprehension": 4.9 } }),
    record({ id: "loss", winner: "incumbent", candidate: { "first-read-comprehension": 4.8 } }),
  ];
  const summary = summarizeDomainQuality(records, new Set(records.map((item) => item.id)));
  assert.equal(summary.candidateWins, 1);
  assert.equal(summary.ties, 1);
  assert.equal(summary.incumbentWins, 1);
  assert.equal(passesDomainQuality({ summary, superiorityTarget: 3, noninferiorityMargin: 0.25 }), true);
});

test("domain contract failures and material mean regressions still block", () => {
  const failed = summarizeDomainQuality([
    record({ id: "failure", winner: "candidate", hardGates: ["required-boundary"] }),
  ], new Set(["failure"]));
  assert.equal(passesDomainQuality({ summary: failed, superiorityTarget: 1, noninferiorityMargin: 0.25 }), false);

  const regressed = summarizeDomainQuality([
    record({ id: "regressed", candidate: {
      "truth-discipline": 4,
      "first-read-comprehension": 4,
      "concrete-action-clarity": 4,
    } }),
  ], new Set(["regressed"]));
  assert.equal(passesDomainQuality({ summary: regressed, superiorityTarget: 1, noninferiorityMargin: 0.25 }), false);
});
