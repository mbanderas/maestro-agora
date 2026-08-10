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
});

test("permissions, quotes, typicality, and confidentiality are hard boundaries", () => {
  for (const state of ["APPROVED_PUBLIC", "APPROVED_ANONYMIZED", "PENDING", "PROHIBITED"]) {
    assert.ok(caseStudy.includes(`\`${state}\``), state);
  }
  assert.match(caseStudy, /Permission is element-specific/);
  assert.match(caseStudy, /Never.*present an atypical experience as typical/is);
  assert.match(caseStudy, /changing a quote and presenting it as exact/);
  assert.match(caseStudy, /identifying an anonymized subject through combined details/);
});

test("causality and metric context cannot be inferred from chronology", () => {
  for (const phrase of ["caused", "contributed to", "was associated with", "coincided with", "was designed to"]) {
    assert.match(caseStudy, new RegExp(phrase));
  }
  for (const field of ["baseline", "period", "denominator", "measurement source", "concurrent changes"]) {
    assert.match(caseStudy, new RegExp(field, "i"));
  }
  assert.match(caseStudy, /not merely because work preceded a result/);
});

test("academic and clinical case reports remain outside scope", () => {
  assert.match(skill, /Academic and clinical case reports are outside this modifier/);
  assert.match(caseStudy, /Academic and clinical case reports are outside this reference/);
});
