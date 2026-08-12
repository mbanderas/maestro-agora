import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { evaluateBlindRun, validateAdjudicationRecords } from "../scripts/blind-summary.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_ROOT = join(ROOT, "skills", "agora");
const EVAL_ROOT = join(ROOT, "evals", "prospective", "conversion-context-v1.0.0");
const PROMPT_ROOT = join(EVAL_ROOT, "prompts");
const FROZEN_ROOT = join(ROOT, "evals", "blind", "v1.7.0");
const REGRESSION_ROOT = join(ROOT, "evals", "regression", "conversion-context-v1.7.0-development");
const ATTEMPT1_ROOT = join(ROOT, "evals", "regression", "conversion-context-v1.7.0-confirmatory-attempt1");

const [skill, conversion, craft, manifest] = await Promise.all([
  readFile(join(SKILL_ROOT, "SKILL.md"), "utf8"),
  readFile(join(SKILL_ROOT, "references", "agora-conversion.md"), "utf8"),
  readFile(join(SKILL_ROOT, "references", "agora-craft.md"), "utf8"),
  readFile(join(EVAL_ROOT, "manifest.json"), "utf8").then(JSON.parse),
]);

const [frozenManifest, frozenReleasePlan, regressionManifest, attempt1Manifest] = await Promise.all([
  readFile(join(FROZEN_ROOT, "manifest.json"), "utf8").then(JSON.parse),
  readFile(join(ROOT, "evals", "releases", "v1.7.0.gates.json"), "utf8").then(JSON.parse),
  readFile(join(REGRESSION_ROOT, "manifest.json"), "utf8").then(JSON.parse),
  readFile(join(ATTEMPT1_ROOT, "manifest.json"), "utf8").then(JSON.parse),
]);

test("conversion context loads progressively without adding a mode", () => {
  assert.match(skill, /\[references\/agora-conversion\.md\]\(references\/agora-conversion\.md\) governs conversion-context work/);
  assert.match(skill, /writes, rewrites, plans, reviews, compares, tests, measures, or optimizes a conversion-relevant/);
  assert.match(skill, /landing page, product page, pricing page, enterprise page, paywall, checkout, form, upgrade path, onboarding sequence, funnel, or experiment/);
  assert.match(skill, /New drafts count; do not require the user to say `conversion` or `optimize`/);
  assert.match(skill, /This load is mandatory and precedes the general marketing and optional craft reads below/);
  assert.match(skill, /bounded overlay inside `SELL` or `TRANSACT`, not a primary mode, modifier, or source of universal conversion laws/);
  assert.ok(skill.indexOf("references/agora-conversion.md") < skill.indexOf("Use [references/agora-marketing.md]"));
  assert.doesNotMatch(skill, /\| `CONVERSION` \|/);
});

test("closed-world core delegates general conversion contracts", () => {
  assert.match(skill, /^## Preserve closed-world facts$/m);
  assert.match(skill, /Write only supplied facts and necessary logical entailments/);
  assert.match(skill, /Preserve exact qualifiers, roles, quote status, causal status, commitments, terms, routes, and destinations/);
  assert.match(skill, /Never fill plausible defaults, strengthen or rename facts, convert a paraphrase into a quotation/);
  assert.match(skill, /Prefer the supplied task verb when it precisely names the action/);
  assert.match(skill, /Necessary entailments and direct, bounded buyer interpretations are allowed/);
  assert.match(skill, /Invented intermediate operations, vendor behavior, and outcomes are not/);
  assert.match(skill, /apply its surface-specific route, pricing, experiment, proof, qualification, and placement contracts/);
  assert.match(skill, /classify every requested component as an implementation recommendation, visible copy, or both/i);
  assert.match(skill, /Examples in this skill and its references illustrate reasoning only/);
  assert.match(skill, /Reproduce wording only when the current brief marks it `REQUIRED EXACT`/);
});

test("conversion priors preserve context, objectives, and user authority", () => {
  for (const heading of [
    "Purpose",
    "Route the decision before drafting",
    "Use patterns as bounded priors",
    "Build product-led and enterprise buying paths",
    "Calibrate research-derived guidance",
    "Resolve contradictions",
    "Evidence basis",
    "Evaluation contract",
  ]) assert.match(conversion, new RegExp(`^## ${heading}$`, "m"));

  assert.match(conversion, /Treat conversion patterns as contextual priors, not laws/);
  assert.match(conversion, /A click is not activation, a completed form is not a qualified lead, purchase intent is not a purchase/);
  assert.match(conversion, /Do not invent a company KPI or claim a likely lift/);
  assert.match(conversion, /Never make benefit-first structure universal/);
  assert.match(conversion, /Never claim that fewer fields always produce a better business result/);
  assert.match(conversion, /Treat top-performing sites as composition references only/);
  assert.match(conversion, /Do not transport their effect sizes into another business/);
  assert.match(conversion, /Outside explicit review mode, preserve the user's supplied claims and framing/);
});

test("closed-world conversion contracts preserve fact dimensions", () => {
  assert.match(skill, /A section labeled `Supplied facts`, `Supplied terms`, or equivalent is a closed fact set/);
  assert.match(skill, /A request to write, rewrite, recommend, compose, or improve conversion is not authorization to invent business facts/);
  assert.match(skill, /For every draft, build a private fact ledger covering the complete response/);
  assert.match(skill, /Plausibility, convention, usefulness, and likely implementation do not count as entailment/);

  assert.match(conversion, /Track facts at the level of actor, action, object, status, timing, scope, qualifier, evidence form, route, destination, permission, consent, price, term, and limitation/);
  assert.match(conversion, /Support for one field does not supply an adjacent field/);
  assert.match(conversion, /price, billing period, renewal, trial, cancellation right.*does not establish collection timing/s);
  assert.match(conversion, /permission or consent choice does not establish a fallback.*extra data use/s);
  assert.match(conversion, /A result does not become a quotation, causal claim, customer identity, segment result, or plan-specific result/);
  assert.match(conversion, /named role, plan, review, or process does not establish a different role name, approval, ownership, deliverable, authority, schedule, coverage, or result/);
  assert.match(conversion, /stated exclusion does not establish the unnamed alternative/);
  assert.match(conversion, /These limits prohibit invented vendor facts, not useful buyer-side interpretation/);
  assert.match(conversion, /actor who can use or review it, the decision or uncertainty it directly addresses/);
  assert.match(conversion, /Avoid tautological noun repetition/);
  assert.match(conversion, /Prefer the action verb supplied by the brief when it precisely names the task/);
  assert.match(conversion, /Do not invent an intermediate operation, vendor behavior, or outcome to make the argument flow/);
});

test("component and flow contracts preserve action hierarchy", () => {
  assert.match(conversion, /Classify every requested component before drafting: implementation recommendation, visible copy, or both/);
  assert.match(conversion, /Keep editorial directions outside ready-to-use copy/);
  assert.match(skill, /worksheet-label ban applies inside ready-to-use copy/);
  assert.match(craft, /Keep worksheet labels out of the ready-to-use copy/);
  assert.match(conversion, /Give each component one incremental decision job/);
  assert.match(conversion, /Repeat only material terms or boundaries that must remain decision-adjacent/);
  assert.match(conversion, /make them describe the same interface state/);

  assert.match(conversion, /conversion overlay never waives the canonical CTA standard/);
  assert.match(conversion, /supported buyer commitment and its object or destination/);
  assert.match(conversion, /unknown next destination, use neutral continuation language/);
  assert.match(conversion, /Trace a primary-action spine across every multi-step flow/);
  assert.match(conversion, /prerequisite cannot replace activation/);
  assert.match(conversion, /optional action after the event remains secondary/);
  assert.match(conversion, /Optional consent remains visually and semantically separate from the primary action/);
  assert.match(conversion, /The name of an event establishes only that the event occurred/);
  assert.match(conversion, /each primary decision unit must carry its supported route type, exclusivity status, material commitment, and action or destination/);
  assert.match(conversion, /FAQ may reinforce the route distinction, but it cannot be the first component that supplies it/);
  assert.match(conversion, /Every checklist or readiness item must add a distinct verification, dependency, consequence, or preparation action grounded in supplied facts/);
  assert.match(conversion, /Do not use `review` or `confirm` merely to restate a claim from an earlier section/);
});

test("pricing, route, proof, and persuasion contracts remain general", () => {
  assert.match(conversion, /make both routes legible without pretending they perform the same job/);
  assert.match(conversion, /Do not treat the absence of a sales team as a conversion ideal or an eligibility test/);
  assert.match(conversion, /do not invent a signup, trial, public price, or instant-purchase route/);
  assert.match(conversion, /Treat a pricing page as a complete buying decision, not a tariff/);
  assert.match(conversion, /Do not hide a supplied public price merely because a custom enterprise route also exists/);
  assert.match(conversion, /Arithmetic can establish a total, not shared collection timing/);
  assert.match(conversion, /Run a temporal audit across collection, access, and start language/);
  assert.match(conversion, /Do not connect them with `after`, `before`, `then`, or `until`/);
  assert.match(conversion, /Preserve exact capability names, regions, role names, availability windows, document status, access conditions, and exclusions/);
  assert.match(conversion, /Do not infer a positive delivery model from an excluded one/);
  assert.match(conversion, /Do not let enterprise claim safety flatten the argument into an evaluation checklist/);
  assert.match(conversion, /establish the strongest supported shared job before distinguishing buying routes/);
  assert.match(conversion, /Use quotation marks only for verbatim wording supplied by the user/);
  assert.match(conversion, /summary of what someone said supplies meaning, not exact speech/);
  assert.match(conversion, /support and evidence gap as separate facts/);
  assert.match(skill, /after that floor passes, preserve the strongest supported reader job, task, or operational decision as the argument/);
});

test("frozen fixture recipes are absent from reusable skill guidance", () => {
  const reusable = [skill, conversion, craft].join("\n");
  const leakedRecipes = [
    /Request received\. We will send the report to your work email\./,
    /Request an enterprise demo/,
    /Send demo request for review/,
    /Continues to the next step\. Your subscription does not start here\./,
    /Your order will be charged immediately/,
    /successful account sync/,
    /factory-planning route/,
    /plant-data review/,
    /high-ticket self-serve plan/,
    /Employees can sign in through your organization's SAML setup/,
    /EU or US region choice/,
    /security report available under NDA/,
    /For a migration proof section/,
    /Attribute it as `a named customer`/,
    /For a practical replacement-product composition/,
    /restrained nocturnal fragrance opening/,
    /For those who keep their own hours/,
    /dry wood.*tannic tea.*powder-soft iris/s,
    /The action uses `Buy`/,
  ];
  for (const recipe of leakedRecipes) assert.doesNotMatch(reusable, recipe);
});

test("structurally different holdouts map to shared invariants", () => {
  const holdouts = [
    {
      id: "permit-gated-calibration",
      contracts: [
        /Trace a primary-action spine/,
        /prerequisite cannot replace activation/,
        /optional action after the event remains secondary/,
      ],
    },
    {
      id: "museum-membership-renewal",
      contracts: [
        /every material price, unit, timing, charge, renewal, cancellation, access, trial, permission, and limitation/,
        /Arithmetic can establish a total, not shared collection timing/,
      ],
    },
    {
      id: "regulated-document-review",
      contracts: [
        /actor who can use or review it, the decision or uncertainty it directly addresses/,
        /Use quotation marks only for verbatim wording supplied by the user/,
      ],
    },
    {
      id: "unknown-kiosk-transition",
      contracts: [
        /unknown next destination, use neutral continuation language/,
        /explain the known transition in adjacent microcopy/,
      ],
    },
  ];

  for (const holdout of holdouts) {
    for (const contract of holdout.contracts) {
      assert.match(conversion, contract, `${holdout.id} lacks transferable contract ${contract}`);
    }
  }
});

test("unseen-domain holdouts map to abstract decision and entailment contracts", () => {
  const holdouts = [
    {
      id: "harbor-berth-options",
      contracts: [
        /each primary decision unit must carry its supported route type, exclusivity status, material commitment, and action or destination/,
        /FAQ may reinforce the route distinction, but it cannot be the first component that supplies it/,
      ],
    },
    {
      id: "archive-preservation-readiness",
      contracts: [
        /Every checklist or readiness item must add a distinct verification, dependency, consequence, or preparation action grounded in supplied facts/,
        /Direct, bounded buyer implications are allowed; unsupplied vendor behavior and outcomes are not/,
      ],
    },
    {
      id: "seasonal-lease-timing",
      contracts: [
        /When their sequence is absent, keep the known terms in separate clauses or sentences/,
        /Do not connect them with `after`, `before`, `then`, or `until`/,
      ],
    },
    {
      id: "fleet-handoff-entailment",
      contracts: [
        /Prefer the action verb supplied by the brief when it precisely names the task/,
        /Necessary entailments and direct, bounded buyer interpretations are allowed/,
        /Do not invent an intermediate operation, vendor behavior, or outcome/,
      ],
    },
  ];

  for (const holdout of holdouts) {
    for (const contract of holdout.contracts) {
      assert.match(conversion, contract, `${holdout.id} lacks transferable contract ${contract}`);
    }
  }
});

test("experiment guidance preserves interpretability without a frozen recipe", () => {
  assert.match(conversion, /preserve enough structure to interpret the named business outcome/);
  assert.match(conversion, /Define the eligible population and outcome denominator consistently/);
  assert.match(conversion, /Use stable assignment when repeat exposure could cross variants/);
  assert.match(conversion, /Specify an unchanged comparator and an isolated treatment from available inputs/);
  assert.match(conversion, /Separate the primary outcome from guardrails and diagnostics/);
  assert.match(conversion, /Use direction-neutral hypotheses and symmetrical decisions for benefit, harm, null, and uncertainty/);
  assert.match(conversion, /Present population, measurement, sample-size, interval, exclusion, duration, and stopping methods as proposed procedures/);
  assert.doesNotMatch(conversion, /completed-first-order outcome requires new customers/);
});

test("research-derived guidance stays observed, contextual, or explicitly unproven", () => {
  for (const label of ["OBSERVED_COMMON", "CONTEXTUAL", "HYPOTHESIS_TO_TEST", "NOT_INFERABLE"]) {
    assert.ok(conversion.includes(`\`${label}\``), `missing research label: ${label}`);
  }
  assert.match(conversion, /Never turn cross-sectional page frequency into an expected effect size/);
  assert.match(conversion, /Do not infer an optimal signup form from pages whose rendered fields were not observed/);
  assert.match(conversion, /self-serve adoption and enterprise sales can coexist/);
  assert.match(conversion, /visible entry prices, trials, and custom or sales routes can coexist/);
});

test("conversion evidence records design and outcome boundaries", () => {
  assert.match(conversion, /randomized assurance-seal field experiment/);
  assert.match(conversion, /multi-retailer trust-seal field data/);
  assert.match(conversion, /app-adoption experiments/);
  assert.match(conversion, /Intent is not observed purchase behavior/);
  assert.match(conversion, /combined improvement estimate is not a causal copy-treatment effect/);
  assert.match(conversion, /Practitioner tests point in different directions/);
});

test("prospective pack is evaluator-compatible but not release evidence", async () => {
  assert.equal(manifest.schema_version, 1);
  assert.equal(manifest.status, "prospective-unfrozen");
  assert.equal(Object.hasOwn(manifest, "release_gates"), false);
  assert.deepEqual(manifest.generation_contract.pass_to_model, ["prompt_file"]);
  assert.equal(manifest.generation_contract.fresh_context_per_case, true);
  assert.equal(manifest.adjudication.method, "blind-pairwise");
  assert.equal(manifest.cases.length, 13);

  const requiredCases = new Set([
    "dual-route-enterprise-pricing",
    "sales-led-no-invented-self-serve",
    "enterprise-risk-specificity",
    "pricing-decision-contract",
    "enterprise-proof-placement",
  ]);
  for (const id of requiredCases) assert.ok(manifest.cases.some((item) => item.id === id), `missing new case: ${id}`);

  const ids = new Set();
  const promptFiles = new Set();
  const knownHardGates = new Set(Object.keys(manifest.hard_gate_definitions));
  for (const item of manifest.cases) {
    assert.ok(!ids.has(item.id), `duplicate case id: ${item.id}`);
    ids.add(item.id);
    assert.ok(!promptFiles.has(item.prompt_file), `duplicate prompt file: ${item.prompt_file}`);
    promptFiles.add(item.prompt_file);
    assert.ok(item.hard_gates.length > 0, `${item.id} needs hard gates`);
    for (const gate of item.hard_gates) assert.ok(knownHardGates.has(gate), `${item.id} has unknown hard gate ${gate}`);

    const promptPath = resolve(EVAL_ROOT, item.prompt_file);
    assert.ok(promptPath.startsWith(`${PROMPT_ROOT}${sep}`), `${item.id} escaped prompt root`);
    const prompt = await readFile(promptPath, "utf8");
    assert.doesNotMatch(prompt, /expected (?:answer|output)|rubric|grader|scoring|hard gates?/i, `${item.id} contains evaluator leakage`);
    assert.doesNotMatch(prompt, /[\u2014\u2018\u2019\u201c\u201d]/, `${item.id} contains banned typography`);
    assert.doesNotMatch(prompt, /[A-Za-z]:[\\/]Users[\\/]/, `${item.id} contains a local path`);
  }

  const actualPromptFiles = (await readdir(PROMPT_ROOT))
    .filter((file) => file.endsWith(".md"))
    .map((file) => `prompts/${file}`)
    .sort();
  assert.deepEqual(actualPromptFiles, [...promptFiles].sort());

  const completeRecords = manifest.cases.map((item) => ({
    id: item.id,
    final: {
      winner: "tie",
      candidateVetoes: [],
      candidateHardGateFailures: [],
      incumbentHardGateFailures: [],
      candidateScores: Object.fromEntries(manifest.rubric.dimensions.map((dimension) => [dimension, 5])),
      incumbentScores: Object.fromEntries(manifest.rubric.dimensions.map((dimension) => [dimension, 5])),
    },
  }));
  assert.deepEqual(validateAdjudicationRecords({ manifest, records: completeRecords }), []);
});

test("v1.7 second conversion release pack is fresh, fully mapped, and fail-closed", async () => {
  assert.equal(frozenManifest.status, "frozen-release");
  assert.equal(frozenManifest.skill_version, "1.7.0");
  assert.equal(frozenManifest.release_gates.conversion_case_count, 20);
  assert.equal(frozenManifest.release_gates.conversion_minimum_comparable_cases, 13);
  assert.equal(frozenManifest.release_gates.conversion_minimum_win_rate, 0.77);
  assert.match(
    frozenManifest.hard_gate_definitions["no-invented-proof-or-rationale"],
    /description of what a quotation says is not verbatim wording/,
  );
  assert.match(
    frozenManifest.hard_gate_definitions["route-reality-preserved"],
    /preserves every supplied action route and its next state/,
  );
  assert.deepEqual(frozenReleasePlan.legacy_case_ids, []);
  assert.equal(frozenReleasePlan.partitions[0].minimum_comparable_cases_gate, "conversion_minimum_comparable_cases");
  assert.equal(frozenReleasePlan.partitions[0].minimum_win_rate_gate, "conversion_minimum_win_rate");
  assert.equal(Object.hasOwn(frozenReleasePlan.partitions[0], "wins_required_gate"), false);

  const releaseIds = frozenManifest.cases.map((item) => item.id);
  assert.deepEqual(releaseIds, frozenReleasePlan.partitions[0].case_ids);
  assert.equal(new Set(releaseIds).size, 20);
  assert.equal(frozenManifest.cases.filter((item) => item.critical).length, 18);
  for (const id of ["boltbasin-parts-basket", "night-ferry-fragrance-sample"]) {
    assert.equal(frozenManifest.cases.find((item) => item.id === id)?.critical, false);
  }

  const releasePromptFiles = new Set();
  for (const item of frozenManifest.cases) {
    assert.equal(item.prompt_file, `prompts/${item.id}.md`);
    assert.ok(!releasePromptFiles.has(item.prompt_file), `duplicate release prompt: ${item.prompt_file}`);
    releasePromptFiles.add(item.prompt_file);
    const prompt = await readFile(join(FROZEN_ROOT, item.prompt_file), "utf8");
    assert.match(prompt, /^\/agora --no-voice\r?\n/);
    assert.doesNotMatch(prompt, /expected (?:answer|output)|rubric|grader|scoring|hard gates?/i, `${item.id} contains evaluator leakage`);
    assert.doesNotMatch(prompt, /[\u2014\u2018\u2019\u201c\u201d]/, `${item.id} contains banned typography`);
    assert.doesNotMatch(prompt, /[A-Za-z]:[\\/]Users[\\/]/, `${item.id} contains a local path`);
  }
  const actualReleasePrompts = (await readdir(join(FROZEN_ROOT, "prompts")))
    .filter((file) => file.endsWith(".md"))
    .map((file) => `prompts/${file}`)
    .sort();
  assert.deepEqual(actualReleasePrompts, [...releasePromptFiles].sort());

  const talloway = frozenManifest.cases.find((item) => item.id === "talloway-foundry-qualification");
  const doorwake = frozenManifest.cases.find((item) => item.id === "doorwake-capability-limits");
  const wardenBloom = frozenManifest.cases.find((item) => item.id === "warden-bloom-pilot-proof");
  const sundialBraid = frozenManifest.cases.find((item) => item.id === "sundial-braid-application");
  assert.equal(talloway.hard_gates.includes("enterprise-risk-specificity"), false);
  assert.equal(doorwake.hard_gates.includes("proof-uncertainty-match"), false);
  assert.equal(wardenBloom.hard_gates.includes("no-effect-transfer-in-review"), false);
  assert.equal(sundialBraid.hard_gates.includes("enterprise-risk-specificity"), false);
  assert.match(
    await readFile(join(FROZEN_ROOT, "prompts", "talloway-foundry-qualification.md"), "utf8"),
    /a submit control label/,
  );
  assert.match(
    await readFile(join(FROZEN_ROOT, "prompts", "quarry-line-engagement-terms.md"), "utf8"),
    /rows for scope, payment, survey window, and drawing delivery/,
  );
  assert.match(
    await readFile(join(FROZEN_ROOT, "prompts", "river-step-petition.md"), "utf8"),
    /remove@riverstep\.pt/,
  );

  const records = frozenManifest.cases.map((item) => ({
    id: item.id,
    final: {
      winner: "tie",
      candidateVetoes: [],
      candidateHardGateFailures: [],
      incumbentHardGateFailures: [],
      candidateScores: Object.fromEntries(frozenManifest.rubric.dimensions.map((dimension) => [dimension, 5])),
      incumbentScores: Object.fromEntries(frozenManifest.rubric.dimensions.map((dimension) => [dimension, 5])),
    },
  }));

  const tied = evaluateBlindRun({ manifest: frozenManifest, records, releasePlan: frozenReleasePlan });
  assert.equal(tied.pass, false);
  assert.deepEqual(tied.evidenceErrors, []);

  for (const record of records) record.final.winner = "candidate";
  const winning = evaluateBlindRun({ manifest: frozenManifest, records, releasePlan: frozenReleasePlan });
  assert.equal(winning.pass, true);
  assert.deepEqual(winning.evidenceErrors, []);
  assert.equal(winning.release.partitionResults[0].winsRequired, 16);

  for (const [index, record] of records.entries()) {
    record.final.winner = index < 11 || index >= 13 ? "candidate" : "tie";
    if (index >= 13) {
      const item = frozenManifest.cases[index];
      record.final.incumbentHardGateFailures = [item.hard_gates[0]];
    }
  }
  const minimumDenominator = evaluateBlindRun({ manifest: frozenManifest, records, releasePlan: frozenReleasePlan });
  assert.equal(minimumDenominator.pass, true);
  assert.equal(minimumDenominator.release.partitionResults[0].summary.comparableCaseCount, 13);
  assert.equal(minimumDenominator.release.partitionResults[0].winsRequired, 11);
});

test("development fixtures remain regression-only and cannot enter the superiority partition", async () => {
  const releaseIds = new Set(frozenReleasePlan.partitions.flatMap((partition) => partition.case_ids));
  const regressionIds = new Set(regressionManifest.cases.map((item) => item.id));

  assert.equal(regressionIds.size, 13);
  assert.equal([...regressionIds].some((id) => releaseIds.has(id)), false);
  assert.ok(regressionIds.has("checkout-trust-relevance"));
  assert.ok(regressionIds.has("enterprise-proof-placement"));

  const expectedPromptFiles = regressionManifest.cases.map((item) => item.prompt_file).sort();
  const actualPromptFiles = (await readdir(join(REGRESSION_ROOT, "prompts")))
    .filter((file) => file.endsWith(".md"))
    .map((file) => `prompts/${file}`)
    .sort();
  assert.deepEqual(actualPromptFiles, expectedPromptFiles);
});

test("spent attempt1 pack remains immutable regression evidence and cannot re-enter superiority", async () => {
  const releaseIds = new Set(frozenReleasePlan.partitions.flatMap((partition) => partition.case_ids));
  const attempt1Ids = new Set(attempt1Manifest.cases.map((item) => item.id));
  assert.equal(attempt1Manifest.cases.length, 13);
  assert.equal([...attempt1Ids].some((id) => releaseIds.has(id)), false);

  const expectedPromptFiles = attempt1Manifest.cases.map((item) => item.prompt_file).sort();
  const actualPromptFiles = (await readdir(join(ATTEMPT1_ROOT, "prompts")))
    .filter((file) => file.endsWith(".md"))
    .map((file) => `prompts/${file}`)
    .sort();
  assert.deepEqual(actualPromptFiles, expectedPromptFiles);
  assert.equal((await readdir(ATTEMPT1_ROOT)).sort().join(","), "README.md,judge-instructions.md,judge-schema.json,manifest.json,prompts");
  assert.match(await readFile(join(ATTEMPT1_ROOT, "README.md"), "utf8"), /failed its release gates/);
});
