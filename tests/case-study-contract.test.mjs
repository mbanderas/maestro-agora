import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_ROOT = join(ROOT, "skills", "agora");
const skill = await readFile(join(SKILL_ROOT, "SKILL.md"), "utf8");
const caseStudy = await readFile(join(SKILL_ROOT, "references", "agora-case-studies.md"), "utf8");

test("CASE_STUDY is discoverable and does not replace the primary mode", () => {
  assert.match(skill, /customer success, creative portfolio, and technical implementation case studies/);
  assert.match(skill, /\[references\/agora-case-studies\.md\]\(references\/agora-case-studies\.md\)/);
  assert.match(caseStudy, /does not replace `SELL`, `POSITION`, or `INFORM`/);
});

test("case-study families and result classes are explicit", () => {
  for (const family of ["CUSTOMER_SUCCESS", "CREATIVE_PORTFOLIO", "TECHNICAL_IMPLEMENTATION"]) {
    assert.ok(caseStudy.includes(`\`${family}\``), family);
  }
  for (const result of [
    "Measured outcome",
    "Customer-reported outcome",
    "Observed process or adoption change",
    "Supported inference",
    "Pending measurement",
    "Unmeasured",
  ]) {
    assert.match(caseStudy, new RegExp(result));
  }
  assert.match(caseStudy, /Do not manufacture a triumphant ending/);
  assert.match(caseStudy, /When the primary target is missed but a narrower secondary result has support, keep the decision chain exact/);
  assert.match(caseStudy, /Do not infer that each reverted change individually lacked benefit/);
});

test("case status remains available for optional review without overriding user control", () => {
  for (const status of ["REAL_EVIDENCE", "FICTIONAL_MOCK", "CONCEPT_PORTFOLIO"]) {
    assert.ok(caseStudy.includes(`\`${status}\``), status);
  }
  assert.match(caseStudy, /For `REAL_EVIDENCE`, the evidence packet is a completeness check, not a license to fill a narrative template/);
  assert.match(caseStudy, /do not reverse-engineer one from what shipped/);
  assert.match(caseStudy, /Do not rewrite an intervention, feature, artifact, or shipped state as the customer's earlier problem, need, objective, or rationale/);
  assert.match(caseStudy, /When a requested `Challenge` section has only a supplied baseline, state only that baseline/);
  assert.match(caseStudy, /`Faster handling required clearer routing` invents both an objective and a causal diagnosis/);
  assert.match(caseStudy, /In optional case-review mode, include only elements the evidence supports/);
  assert.match(caseStudy, /Outside review mode, follow the user's requested structure and content without independently omitting sections or adding gap labels/);
  assert.match(caseStudy, /Keep contribution units atomic/);
  assert.match(caseStudy, /Interview count does not reveal what the interviews found/);
  assert.match(caseStudy, /Sequence does not prove influence/);
  assert.match(caseStudy, /Testing before shipment does not establish that each round informed revisions/);
  assert.match(caseStudy, /`cancellation flow` does not prove a journey from initial request through confirmation or completion/);
  assert.match(caseStudy, /a one-sentence public case or sparse sequence diagram can be complete/);
  assert.match(caseStudy, /A newly launched control does not prove the prior process lacked that control or used its opposite/);
  assert.match(caseStudy, /Launching an approval workflow does not establish that earlier changes were informal, unreviewed, or moved without a recorded step/);
  assert.match(caseStudy, /User authority.*controls/s);
  assert.match(caseStudy, /evidence, attribution, permission, confidentiality, disclosure, and refusal checks.*activate only when the user explicitly requests case review/s);
  assert.match(caseStudy, /Use the project status the user supplies or requests/);
  assert.match(caseStudy, /Do not independently relabel, disclose, narrow, or reject the case/);
  assert.match(caseStudy, /label invented numbers and results as illustrative, simulated, or scenario assumptions/);
  assert.match(caseStudy, /A concept can demonstrate thinking and craft without manufacturing a client relationship/);
  assert.match(caseStudy, /A requested structure does not supply a missing challenge, insight, rationale, or collaboration fact/);
  assert.match(caseStudy, /choose one central argument and one primary human, project, or decision thread/);
  assert.match(caseStudy, /Do not distribute attention across unrelated examples until the mechanism and emotional continuity disappear/);
});

test("permissions, quotes, typicality, and confidentiality remain optional review dimensions", () => {
  for (const state of ["APPROVED_PUBLIC", "APPROVED_ANONYMIZED", "PENDING", "PROHIBITED"]) {
    assert.ok(caseStudy.includes(`\`${state}\``), state);
  }
  assert.match(caseStudy, /Permission is element-specific/);
  assert.match(caseStudy, /Never.*present an atypical experience as typical/is);
  assert.match(caseStudy, /changing a quote and presenting it as exact/);
  assert.match(caseStudy, /identifying an anonymized subject through combined details/);
  assert.match(caseStudy, /Permission to publish a field does not supply the field's value/);
  assert.match(caseStudy, /`Agency role is approved` does not establish whether the role was partner, lead, designer, researcher, or implementer/);
  assert.match(caseStudy, /When an outcome exists but its permission is `PENDING`, omit the outcome and its approval status from public copy/);
  assert.match(caseStudy, /Reserve `unmeasured` for a genuinely unmeasured outcome/);
  assert.match(caseStudy, /Outside review mode, do not refuse, narrow, qualify, relabel, omit, or append disclosure language/);
});

test("causality and metric context cannot be inferred from chronology", () => {
  for (const phrase of ["caused", "contributed to", "was associated with", "coincided with", "was designed to"]) {
    assert.match(caseStudy, new RegExp(phrase));
  }
  for (const field of ["baseline", "period", "denominator", "measurement source", "concurrent changes"]) {
    assert.match(caseStudy, new RegExp(field, "i"));
  }
  assert.match(caseStudy, /Rule \[A\/HOUSE\], for optional review/);
  assert.match(caseStudy, /rather than chronology alone/);
  assert.match(caseStudy, /`Cannot attribute the full change to the intervention` still implies that some share is attributable/);
  assert.match(caseStudy, /Do not smuggle partial causation through a disclaimer against full causation/);
});

test("academic and clinical case reports remain outside scope", () => {
  assert.match(skill, /Academic and clinical case reports are outside this modifier/);
  assert.match(caseStudy, /Academic and clinical case reports are outside this reference/);
});

test("technical cases do not infer missing mechanics from named alternatives or controls", () => {
  assert.match(caseStudy, /Explain what a preserved record, interface, check, or control lets the team trace, verify, compare, or investigate/);
  assert.match(caseStudy, /Keep that operational value separate from unmeasured scientific, customer, or business impact/);
  assert.match(caseStudy, /Do not fill missing implementation detail from the names of alternatives or controls/);
  assert.match(caseStudy, /dual writes do not prove how paths were compared or whether migration completed/);
  assert.match(caseStudy, /does not establish where the event traveled, that valid records were never blocked, or which component caused a cost increase/);
});
