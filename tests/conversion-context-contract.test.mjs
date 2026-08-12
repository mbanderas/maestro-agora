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

const [skill, conversion, manifest] = await Promise.all([
  readFile(join(SKILL_ROOT, "SKILL.md"), "utf8"),
  readFile(join(SKILL_ROOT, "references", "agora-conversion.md"), "utf8"),
  readFile(join(EVAL_ROOT, "manifest.json"), "utf8").then(JSON.parse),
]);

const [frozenManifest, frozenReleasePlan] = await Promise.all([
  readFile(join(FROZEN_ROOT, "manifest.json"), "utf8").then(JSON.parse),
  readFile(join(ROOT, "evals", "releases", "v1.7.0.gates.json"), "utf8").then(JSON.parse),
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

test("closed-world core stays compact while conversion contracts load progressively", () => {
  assert.match(skill, /^## Preserve closed-world facts$/m);
  assert.match(skill, /Write only supplied facts and necessary logical entailments/);
  assert.match(skill, /Preserve exact qualifiers, roles, quote status, causal status, commitments, terms, routes, and destinations/);
  assert.match(skill, /Never fill plausible defaults, strengthen or rename facts, convert a paraphrase into a quotation/);
  assert.match(skill, /When the conversion overlay is loaded, apply its surface-specific route, pricing, experiment, proof, qualification, and placement contracts/);
  assert.match(skill, /Return only the requested components/);
  assert.doesNotMatch(skill, /A two-variant paywall keeps every supplied buying term/);
  assert.doesNotMatch(skill, /An enterprise page whose only supplied capabilities are SAML SSO/);

  assert.match(conversion, /Request received\. We will send the report to your work email\./);
  assert.match(conversion, /Treat activation and setup completion as separate states/);
  assert.match(conversion, /Keep full price units visible in every variant/);
  assert.match(conversion, /do not invent a calculation formula, subtract refunds, add completion metrics/);
  assert.match(conversion, /visible `Customer quote` block with an attributed paraphrase/);
  assert.match(conversion, /For a practical replacement-product composition/);
  assert.match(conversion, /Never write `cloud-based`, `cloud deployment only`, or `cloud-only`/);
  assert.match(conversion, /Never write `before offering a meeting time`/);
  assert.match(conversion, /The visible composition and the numbered placement order must describe one identical sequence/);
  assert.match(conversion, /For a two-route pricing composition/);
  assert.match(conversion, /For a sales-led factory-planning route/);
  assert.match(conversion, /For a high-ticket self-serve plan/);
  assert.match(conversion, /For a migration proof section/);
  assert.match(conversion, /For this bounded enterprise capability set/);
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
  assert.match(conversion, /Do not scatter decorative badges, invent trust marks, or impose a fixed seal count/);
  assert.match(conversion, /Never claim that fewer fields always produce a better business result/);
  assert.match(conversion, /Do not turn an analytics objective into a customer-facing claim/);
  assert.match(conversion, /Treat top-performing sites as composition references only/);
  assert.match(conversion, /Do not transport their effect sizes into another business/);
  assert.match(conversion, /Outside explicit review mode, preserve the user's supplied claims and framing/);
});

test("closed-world briefs block plausible but unsupplied conversion details", () => {
  assert.match(skill, /A section labeled `Supplied facts`, `Supplied terms`, or equivalent is a closed fact set/);
  assert.match(skill, /In every drafting task, treat the user's named product, offer, customer, proof, route, price, permission, process, timing, legal, operational, and outcome facts as complete factual authority/);
  assert.match(skill, /A request to write, rewrite, recommend, compose, or improve conversion is not authorization to invent business facts/);
  assert.match(skill, /resolve each named defect explicitly with an action such as remove, relocate, replace, retain, or rewrite/);
  assert.match(skill, /Write only supplied facts and necessary logical entailments/);
  assert.match(skill, /For every draft, build a private fact ledger covering the complete response/);
  assert.match(skill, /Plausibility, convention, usefulness, and likely implementation do not count as entailment/);
  assert.match(skill, /Do not append a process explanation, compliance note, self-audit, rationale, alternate route, or offer to do more/);
  assert.match(conversion, /^### Closed-world conversion briefs$/m);
  assert.match(conversion, /Payment processed by a named provider does not establish security, encryption, a particular widget, or a field layout/);
  assert.match(conversion, /omission from the placement list is not enough/);
  assert.match(conversion, /A monthly renewal term does not establish an immediate first charge/);
  assert.match(conversion, /An optional consent choice does not establish unsubscribe mechanics, confirmation branching, merge fields, or future message frequency/);
  assert.match(conversion, /Preserve the supplied consent scope exactly/);
  assert.match(conversion, /A required permission does not establish a manual fallback, skipped path, post-permission success, or extra data use/);
  assert.match(conversion, /A successful account sync does not establish automatic budget construction, automatic updates, absence of manual entry, notification subjects, or any post-sync customer result/);
  assert.match(conversion, /do not invent a motivational before-state, problem contrast, data recency, estimate comparison, settings path, or reason the user should care/);
  assert.match(conversion, /When submission starts review and a meeting may be offered afterward, the action requests review/);
  assert.match(conversion, /Preserve every explicit funnel boundary the user supplies/);
  assert.match(conversion, /do not call the action an immediate download or invent a file type, link, merge field, delivery time, unsubscribe term, or confirmation branch/);
  assert.match(conversion, /Write proposed test procedures as recommendations, not facts about the current analytics, checkout, accounting, refund window, payment method, customer behavior, cash flow, churn, or decision policy/);
  assert.match(conversion, /For an experiment with possible repeat exposure, use a stable assignment unit/);
  assert.match(conversion, /For a decision-grade experiment brief in an evidence review, include the controls required to run and interpret the test/);
  assert.match(conversion, /a completed-first-order outcome requires new customers rather than a mixed new-and-returning population/);
  assert.match(conversion, /Keep a requested concise experiment plan bounded to the stated decision/);
  assert.match(conversion, /`Revenue less refunds` does not authorize subtracting chargebacks/);
  assert.match(conversion, /Generic enterprise capability does not authorize claims about spreadsheets replaced, integrations, migration sequence, rollout order, packaged scope, implementation-plan delivery, or post-review follow-up/);
  assert.match(conversion, /do not assign the manager or plan any action the brief does not name/);
  assert.match(conversion, /A requirement for internal review is not a requirement for approval/);
  assert.match(conversion, /The absence of on-premises deployment does not establish cloud-only delivery/);
  assert.match(conversion, /A request form destination does not establish which fields it collects/);
  assert.match(conversion, /The existence of a plan or named manager is not proof of downtime, duration, or success/);
  assert.match(conversion, /Do not explain how the plan or manager works, what either controls, when either acts, or why outcomes vary/);
  assert.match(conversion, /Risk specificity can be contextual without becoming causal/);
  assert.match(conversion, /For a payment-area composition, make the final commitment scannable/);
  assert.match(conversion, /visible composition and the numbered placement order must describe one identical sequence/);
  assert.match(conversion, /payment fields; shipping and return terms; `Your order will be charged immediately`; purchase button/);
  assert.match(conversion, /When an enterprise demo request starts specialist review, keep the familiar heading `Request an enterprise demo`/);
  assert.match(conversion, /Continues to the next step\. Your subscription does not start here\./);
  assert.match(conversion, /Each complete variant must repeat every material price, charge, renewal, cancellation, access, and no-trial term/);
  assert.match(conversion, /When reviewing a proposed rule for `every CTA`, distinguish commitment actions from navigation and informational controls/);
  assert.match(conversion, /When a supplied customer is described as named but the name itself is absent, do not create a fill-in token/);
  assert.match(conversion, /Attribute it as `a named customer`/);
  assert.match(conversion, /implementation note explaining that proof does not imply causality does not satisfy this requirement/);
  assert.match(conversion, /render a visible `Customer quote` block with an attributed paraphrase at the named placement/);
  assert.match(conversion, /For a practical replacement-product composition, avoid repeating the maintenance interval/);
  assert.match(conversion, /^### Identity-led openings without invented provenance$/m);
  assert.match(conversion, /make the headline express a reader identity or self-conception/);
  assert.match(conversion, /use a reader callout such as `For those who keep their own hours`/);
  assert.match(conversion, /Do not mistake the ban on invented effects for a ban on sensory writing/);
  assert.match(conversion, /at least two concrete material adjectives and at least one relation or contrast among the notes/);
  assert.match(conversion, /Connect supplied capabilities to recognizable organizational requirements without assigning unsupplied product behavior/);
  assert.match(conversion, /Employees can sign in through your organization's SAML setup/);
  assert.match(conversion, /Never upgrade a migration plan to a `documented plan`, `written plan`, `rollout plan`, or implementation process/);
  assert.match(conversion, /For this bounded enterprise capability set, write `migration plan` exactly/);
  assert.match(conversion, /Never write `defined plan`, `clear plan`, `agreed plan`, `guided plan`, `planned move`/);
  assert.match(conversion, /Administrative access follows role, so employee sign-in and administrative authority remain separate decisions\./);
  assert.match(conversion, /Use this finished-copy order: hero without a CTA/);
  assert.match(conversion, /The exact fit block is/);
  assert.match(conversion, /Never write `cloud-based`, `cloud deployment only`, or `cloud-only`/);
  assert.match(conversion, /Prefer concrete capability sentences over abstract phrases/);
  assert.match(conversion, /A trial does not establish automatic billing, renewal, access after expiration, or cancellation mechanics/);
  assert.match(conversion, /A supplied result is not a quotation, does not establish causality, and does not belong to a specific plan/);
  assert.match(conversion, /Keep full price units visible in every variant/);
  assert.match(conversion, /Treat activation and setup completion as separate states/);
  assert.match(conversion, /do not invent a calculation formula, subtract refunds, add completion metrics/);
  assert.match(conversion, /A supplied sensory note does not establish temporal progression, projection, persistence, noticeability, mood, or effect/);
  assert.match(conversion, /When direction is unknown, state a non-directional hypothesis such as `may change`, not `will increase`/);
});

test("enterprise conversion architecture preserves real routes and decision terms", () => {
  assert.match(conversion, /make both routes legible without pretending they perform the same job/);
  assert.match(conversion, /Do not treat the absence of a sales team as a conversion ideal or an eligibility test/);
  assert.match(conversion, /do not invent a signup, trial, public price, or instant-purchase route/);
  assert.match(conversion, /Treat a pricing page as a complete buying decision, not a tariff/);
  assert.match(conversion, /Do not hide a supplied public price merely because a custom enterprise route also exists/);
  assert.match(conversion, /absence of self-serve, a trial, instant purchase, and public price does not establish the absence of a standard configuration/);
  assert.match(conversion, /put destination microcopy immediately after each action/);
  assert.match(conversion, /Show the calculable combined amount due today/);
  assert.match(conversion, /Do not use `enterprise-grade` as the sole explanation/);
  assert.match(conversion, /Place proof where it resolves the live doubt/);
  assert.match(conversion, /After both complete plan cards, add a visible `Customer result` block/);
  assert.match(conversion, /Place directly below both plan cards/);
  assert.match(conversion, /For one named customer, monthly report preparation fell from six hours to two after adoption/);
  assert.match(conversion, /visible `Customer quote` block with an attributed paraphrase/);
  assert.match(conversion, /do not rename a supplied migration manager as an owner, lead, contact, or coordinator/);
  assert.match(conversion, /Do not copy a competitor's headline formula, current category fashion, or AI language/);
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
      candidateScores: Object.fromEntries(manifest.rubric.dimensions.map((dimension) => [dimension, 5])),
      incumbentScores: Object.fromEntries(manifest.rubric.dimensions.map((dimension) => [dimension, 5])),
    },
  }));
  assert.deepEqual(validateAdjudicationRecords({ manifest, records: completeRecords }), []);
});

test("v1.7 conversion release pack is frozen, fully mapped, and fail-closed", () => {
  assert.equal(frozenManifest.status, "frozen-release");
  assert.equal(frozenManifest.skill_version, "1.7.0");
  assert.equal(frozenManifest.release_gates.conversion_case_count, 13);
  assert.equal(frozenManifest.release_gates.conversion_wins_required, 10);
  assert.deepEqual(frozenReleasePlan.legacy_case_ids, []);

  const records = frozenManifest.cases.map((item) => ({
    id: item.id,
    final: {
      winner: "tie",
      candidateVetoes: [],
      candidateHardGateFailures: [],
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
});
