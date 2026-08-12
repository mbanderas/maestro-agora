import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { reduceAdjudications } from "../scripts/adjudication-reducer.mjs";

const dimensions = ["brief-fidelity", "composition-fit"];
const manifest = {
  rubric: {
    dimensions: ["brief-fidelity"],
    domain_dimensions: { conversion: ["composition-fit"] },
  },
  adjudication: { absolute_vetoes: ["fabricated-fact"] },
  hard_gate_definitions: {
    "route-reality-preserved": "Keep the supplied route.",
    "full-composition-fit": "Optimize the complete composition.",
  },
  cases: [{
    id: "case-a",
    domain_dimensions: ["conversion"],
    hard_gates: ["route-reality-preserved", "full-composition-fit"],
  }],
};

const scores = (brief, composition) => ({
  "brief-fidelity": brief,
  "composition-fit": composition,
});

const pass = ({
  number,
  order,
  winner = "candidate",
  candidate = scores(5, 4),
  incumbent = scores(4, 4),
  vetoes = [],
  hardGates = [],
  incumbentHardGates = [],
}) => ({
  pass: number,
  order,
  winner,
  candidateVetoes: vetoes,
  candidateHardGateFailures: hardGates,
  incumbentHardGateFailures: incumbentHardGates,
  candidateScores: candidate,
  incumbentScores: incumbent,
});

test("agreed swapped passes reduce to mapped means", () => {
  const adjudications = [{
    id: "case-a",
    passes: [
      pass({
        number: 1,
        order: ["candidate", "incumbent"],
        candidate: scores(5, 3),
        incumbent: scores(3, 4),
        vetoes: ["fabricated-fact"],
      }),
      pass({
        number: 2,
        order: ["incumbent", "candidate"],
        candidate: scores(4, 5),
        incumbent: scores(4, 4),
      }),
    ],
  }];

  assert.deepEqual(reduceAdjudications({ manifest, adjudications }), [{
    id: "case-a",
    final: {
      winner: "candidate",
      candidateVetoes: ["fabricated-fact"],
      candidateHardGateFailures: [],
      incumbentHardGateFailures: [],
      candidateScores: scores(4.5, 4),
      incumbentScores: scores(3.5, 4),
    },
  }]);
});

test("winner disagreement requires pass 3 and uses its scores", () => {
  const adjudications = [{
    id: "case-a",
    passes: [
      pass({
        number: 1,
        order: ["candidate", "incumbent"],
        winner: "candidate",
      }),
      pass({
        number: 2,
        order: ["incumbent", "candidate"],
        winner: "incumbent",
        vetoes: ["fabricated-fact"],
      }),
      pass({
        number: 3,
        order: ["candidate", "incumbent"],
        winner: "tie",
        candidate: scores(4, 3),
        incumbent: scores(4, 3),
      }),
    ],
  }];

  const [record] = reduceAdjudications({ manifest, adjudications });
  assert.equal(record.final.winner, "tie");
  assert.deepEqual(record.final.candidateScores, scores(4, 3));
  assert.deepEqual(record.final.incumbentScores, scores(4, 3));
  assert.deepEqual(record.final.candidateVetoes, ["fabricated-fact"]);
  assert.deepEqual(record.final.candidateHardGateFailures, []);
  assert.deepEqual(record.final.incumbentHardGateFailures, []);
});

test("gate-set disagreement requires pass 3 even when mapped winners agree", () => {
  const missingTieBreak = [{
    id: "case-a",
    passes: [
      pass({ number: 1, order: ["candidate", "incumbent"], winner: "incumbent" }),
      pass({
        number: 2,
        order: ["incumbent", "candidate"],
        winner: "incumbent",
        candidate: scores(3, 3),
        incumbent: scores(4, 4),
        hardGates: ["route-reality-preserved"],
      }),
    ],
  }];
  assert.throws(
    () => reduceAdjudications({ manifest, adjudications: missingTieBreak }),
    /requires pass 3 because mapped winners or hard-gate failure sets differ/,
  );

  missingTieBreak[0].passes.push(pass({
    number: 3,
    order: ["candidate", "incumbent"],
    winner: "incumbent",
    candidate: scores(3, 3),
    incumbent: scores(4, 4),
    hardGates: ["full-composition-fit"],
  }));
  const [record] = reduceAdjudications({ manifest, adjudications: missingTieBreak });
  assert.equal(record.final.winner, "incumbent");
  assert.deepEqual(record.final.candidateHardGateFailures, [
    "route-reality-preserved",
    "full-composition-fit",
  ]);
  assert.deepEqual(record.final.incumbentHardGateFailures, []);
});

test("reducer unions both sides and derives final eligibility from the union", () => {
  const adjudications = [{
    id: "case-a",
    passes: [
      pass({
        number: 1,
        order: ["candidate", "incumbent"],
        winner: "incumbent",
        candidate: scores(3, 3),
        incumbent: scores(4, 4),
        hardGates: ["route-reality-preserved"],
      }),
      pass({
        number: 2,
        order: ["incumbent", "candidate"],
        winner: "candidate",
        candidate: scores(4, 4),
        incumbent: scores(3, 3),
        incumbentHardGates: ["full-composition-fit"],
      }),
      pass({
        number: 3,
        order: ["candidate", "incumbent"],
        winner: "tie",
        candidate: scores(4, 4),
        incumbent: scores(4, 4),
      }),
    ],
  }];
  const [record] = reduceAdjudications({ manifest, adjudications });
  assert.equal(record.final.winner, "tie");
  assert.deepEqual(record.final.candidateHardGateFailures, ["route-reality-preserved"]);
  assert.deepEqual(record.final.incumbentHardGateFailures, ["full-composition-fit"]);
  assert.deepEqual(record.final.candidateScores, scores(4, 4));
  assert.deepEqual(record.final.incumbentScores, scores(4, 4));
});

test("union-level invalidity rejects contradictory tie-break scores", () => {
  const adjudications = [{
    id: "case-a",
    passes: [
      pass({
        number: 1,
        order: ["candidate", "incumbent"],
        winner: "incumbent",
        candidate: scores(3, 3),
        incumbent: scores(4, 4),
        hardGates: ["route-reality-preserved"],
      }),
      pass({
        number: 2,
        order: ["incumbent", "candidate"],
        winner: "candidate",
        candidate: scores(4, 4),
        incumbent: scores(3, 3),
      }),
      pass({
        number: 3,
        order: ["candidate", "incumbent"],
        winner: "candidate",
        candidate: scores(5, 5),
        incumbent: scores(4, 4),
      }),
    ],
  }];

  assert.throws(
    () => reduceAdjudications({ manifest, adjudications }),
    /case case-a final\.candidateScores\.brief-fidelity cannot exceed incumbentScores\.brief-fidelity/,
  );
});

test("an incumbent-only union failure makes candidate the eligible winner", () => {
  const incumbentInvalid = (number, order) => pass({
    number,
    order,
    winner: "candidate",
    candidate: scores(4, 4),
    incumbent: scores(3, 3),
    incumbentHardGates: ["route-reality-preserved"],
  });
  const [record] = reduceAdjudications({
    manifest,
    adjudications: [{
      id: "case-a",
      passes: [
        incumbentInvalid(1, ["candidate", "incumbent"]),
        incumbentInvalid(2, ["incumbent", "candidate"]),
      ],
    }],
  });
  assert.equal(record.final.winner, "candidate");
  assert.deepEqual(record.final.candidateHardGateFailures, []);
  assert.deepEqual(record.final.incumbentHardGateFailures, ["route-reality-preserved"]);
});

test("pass 3 is required exactly when mapped adjudications differ", () => {
  const missingTieBreak = [{
    id: "case-a",
    passes: [
      pass({ number: 1, order: ["candidate", "incumbent"], winner: "candidate" }),
      pass({ number: 2, order: ["incumbent", "candidate"], winner: "tie" }),
    ],
  }];
  assert.throws(
    () => reduceAdjudications({ manifest, adjudications: missingTieBreak }),
    /requires pass 3 because mapped winners or hard-gate failure sets differ/,
  );

  const surplusTieBreak = [{
    id: "case-a",
    passes: [
      pass({ number: 1, order: ["candidate", "incumbent"] }),
      pass({ number: 2, order: ["incumbent", "candidate"] }),
      pass({ number: 3, order: ["candidate", "incumbent"] }),
    ],
  }];
  assert.throws(
    () => reduceAdjudications({ manifest, adjudications: surplusTieBreak }),
    /forbids pass 3 because mapped winners and hard-gate failure sets agree/,
  );
});

test("reducer rejects ineligible winner and critical-score contradictions", () => {
  const invalidWinner = [{
    id: "case-a",
    passes: [
      pass({
        number: 1,
        order: ["candidate", "incumbent"],
        winner: "tie",
        candidate: scores(3, 3),
        incumbent: scores(4, 4),
        hardGates: ["route-reality-preserved"],
      }),
      pass({ number: 2, order: ["incumbent", "candidate"] }),
    ],
  }];
  assert.throws(
    () => reduceAdjudications({ manifest, adjudications: invalidWinner }),
    /winner must be incumbent because only candidate fails hard gates/,
  );

  const invalidScore = structuredClone(invalidWinner);
  invalidScore[0].passes[0].winner = "incumbent";
  invalidScore[0].passes[0].candidateScores = scores(5, 5);
  assert.throws(
    () => reduceAdjudications({ manifest, adjudications: invalidScore }),
    /candidateScores\.brief-fidelity cannot exceed incumbentScores\.brief-fidelity/,
  );
});

test("reducer rejects unswapped order, duplicate evidence, and incomplete coverage", () => {
  const invalid = [{
    id: "case-a",
    passes: [
      pass({ number: 1, order: ["candidate", "incumbent"], vetoes: ["fabricated-fact", "fabricated-fact"] }),
      pass({ number: 1, order: ["candidate", "incumbent"] }),
    ],
  }, {
    id: "case-a",
    passes: [],
  }];
  assert.throws(
    () => reduceAdjudications({ manifest, adjudications: invalid }),
    /case case-a is duplicated|pass 1 is duplicated|candidateVetoes contains duplicates/,
  );

  const unswapped = [{
    id: "case-a",
    passes: [
      pass({ number: 1, order: ["candidate", "incumbent"] }),
      pass({ number: 2, order: ["candidate", "incumbent"] }),
    ],
  }];
  assert.throws(
    () => reduceAdjudications({ manifest, adjudications: unswapped }),
    /passes 1 and 2 must use swapped order/,
  );

  const expandedManifest = {
    ...manifest,
    cases: [...manifest.cases, { ...manifest.cases[0], id: "case-b" }],
  };
  const validCaseA = [{
    id: "case-a",
    passes: [
      pass({ number: 1, order: ["candidate", "incumbent"] }),
      pass({ number: 2, order: ["incumbent", "candidate"] }),
    ],
  }];
  assert.throws(
    () => reduceAdjudications({ manifest: expandedManifest, adjudications: validCaseA }),
    /missing adjudication case case-b/,
  );
});

test("reducer rejects missing or unknown dimensions, gates, vetoes, and cases", () => {
  const invalidPass = pass({ number: 1, order: ["candidate", "incumbent"] });
  delete invalidPass.candidateScores[dimensions[1]];
  invalidPass.incumbentScores.unknown = 4;
  invalidPass.candidateHardGateFailures = ["unknown-gate"];
  invalidPass.candidateVetoes = ["unknown-veto"];
  const adjudications = [{
    id: "case-a",
    passes: [
      invalidPass,
      pass({ number: 2, order: ["incumbent", "candidate"] }),
    ],
  }, { id: "unknown-case", passes: [] }];

  assert.throws(
    () => reduceAdjudications({ manifest, adjudications }),
    (error) => {
      assert.match(error.message, /candidateScores\.composition-fit must be a finite score/);
      assert.match(error.message, /incumbentScores contains unknown dimension unknown/);
      assert.match(error.message, /unknown gate unknown-gate/);
      assert.match(error.message, /unknown veto unknown-veto/);
      assert.match(error.message, /unknown-case is not declared/);
      return true;
    },
  );
});

test("CLI emits blind-summary-compatible records", async () => {
  const root = await mkdtemp(join(tmpdir(), "agora-adjudication-reducer-"));
  try {
    const manifestPath = join(root, "manifest.json");
    const evidencePath = join(root, "adjudications.json");
    await Promise.all([
      writeFile(manifestPath, JSON.stringify(manifest)),
      writeFile(evidencePath, JSON.stringify([{
        id: "case-a",
        passes: [
          pass({ number: 1, order: ["candidate", "incumbent"] }),
          pass({ number: 2, order: ["incumbent", "candidate"] }),
        ],
      }])),
    ]);

    const result = spawnSync(process.execPath, [
      fileURLToPath(new URL("../scripts/adjudication-reducer.mjs", import.meta.url)),
      manifestPath,
      evidencePath,
    ], { encoding: "utf8", windowsHide: true });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), reduceAdjudications({
      manifest,
      adjudications: JSON.parse(await readFile(evidencePath, "utf8")),
    }));
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});
