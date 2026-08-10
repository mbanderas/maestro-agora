import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_ROOT = join(ROOT, "skills", "agora");
const [skill, invest] = await Promise.all([
  readFile(join(SKILL_ROOT, "SKILL.md"), "utf8"),
  readFile(join(SKILL_ROOT, "references", "agora-invest.md"), "utf8"),
]);

test("INVEST remains one primary mode with three internal routes", () => {
  const modes = [...skill.matchAll(/^\| `(POSITION|SELL|INVEST|INFORM|TRANSACT)` \|/gm)].map((match) => match[1]);
  assert.deepEqual(modes, ["POSITION", "SELL", "INVEST", "INFORM", "TRANSACT"]);
  assert.match(skill, /\[references\/agora-invest\.md\]\(references\/agora-invest\.md\)/);
  assert.match(skill, /`FUNDRAISE` for a company seeking capital/);
  assert.match(skill, /`DILIGENCE` for an investor evaluating an opportunity/);
  assert.match(skill, /`ALLOCATE` for comparing uses of capital/);
  assert.match(invest, /These routes are perspectives inside `INVEST`, not new public modes or CLI flags/);
  assert.match(invest, /A company description in an investor directory remains `POSITION`/);
});

test("investment claims retain evidence class and metric meaning", () => {
  for (const claimClass of [
    "HISTORICAL_MEASURED",
    "CURRENT_STATE",
    "CONTRACTED_COMMITTED",
    "CUSTOMER_REPORTED",
    "FORECAST",
    "TARGET",
    "MODEL_ASSUMPTION",
    "INTERPRETATION",
    "SCENARIO",
    "UNKNOWN_UNMEASURED",
  ]) assert.ok(invest.includes(`\`${claimClass}\``), `missing investment claim class: ${claimClass}`);
  assert.match(invest, /Never move a claim upward in certainty when compressing it/);
  assert.match(invest, /bookings, recognized revenue, ARR, cash collected, and pipeline/);
  assert.match(invest, /signed, contracted, verbal, indicated, and prospective commitments/);
  assert.match(invest, /A target is not a forecast/);
  assert.match(invest, /Keep every claim coordinate exact: actor, population, sample source, period, milestone, instrument, and evidence stage/);
  assert.match(invest, /Do not infer independence, representativeness, diversity, or typicality from a count/);
  assert.match(invest, /Do not infer that adjacent evidence is absent because one named milestone has not occurred/);
  assert.match(invest, /`No term sheet`, `no stated investment amount`, and `no formal diligence` are separate facts/);
  assert.match(invest, /Do not compress them into a broader claim such as `no investment terms are in progress`/);
  assert.match(invest, /Perform transparent arithmetic when supplied figures make a decision-relevant ratio directly calculable/);
  assert.match(invest, /about 51% is arithmetic/);
});

test("fundraising procedure has no universal deck or meeting formula", () => {
  assert.match(invest, /No fixed duration, speaking ratio, or equal-part formula applies/);
  assert.match(invest, /There is no universal sequence/);
  assert.match(invest, /decision elements, not a fixed slide count or sequence/);
  assert.match(invest, /Do not claim a universal failure rate for direct outreach or a universal advantage for warm introductions/);
  assert.match(invest, /No fixed count converts opinion into market fact/);
  assert.match(invest, /Do not ship universal deck lengths, slide orders, timing laws, speaking ratios, warm-introduction rates, cold-outreach rates, rejection counts, or meeting counts/);
});

test("objections, urgency, commitments, and valid weaknesses remain truthful", () => {
  assert.match(invest, /A valid weakness remains a weakness until evidence changes it/);
  assert.match(invest, /Repeated feedback is not truth by repetition/);
  assert.match(invest, /Urgency must come from a current supplied process fact/);
  assert.match(invest, /Verbal indication.*non-binding verbal interest/s);
  assert.match(invest, /Never imply a term sheet, lead, commitment, advanced diligence, scarcity, competing demand, or closing pressure that does not exist/);
  assert.match(invest, /A true fact can still mislead through omitted context/);
  assert.match(invest, /When no real decision deadline is supplied, request the next decision without a reply-by date/);
  assert.match(invest, /One passed review establishes that one review passed/);
  assert.match(invest, /Do not collapse an earlier stage into a later one/);
  assert.match(invest, /ask for confirmation, relevant participants, and workable time options/);
  assert.match(invest, /For email, include a useful subject line, greeting, body, and sign-off/);
  assert.match(invest, /Close on the actual next decision/);
  assert.match(invest, /An offer to send more material is not a substitute for that decision/);
  assert.match(invest, /A `scheduled closing` remains scheduled/);
  assert.match(invest, /Do not shorten these to `the close`, `ahead of the close`, `closing now`/);
});

test("allocation comparisons do not invent numeric decision policy", () => {
  assert.match(invest, /Compare the named alternatives over the same period, operating base, and decision criteria/);
  assert.match(invest, /Do not calculate expected value or rank options by probability when no probability model is supplied/);
  assert.match(invest, /Do not invent a minimum-runway threshold, financing trigger, hurdle rate, portfolio weight, stop-loss, decision date, or other numeric policy/);
  assert.match(invest, /label the number as a proposed governance default/);
  assert.match(invest, /Missing comparison inputs do not license a precise recommendation/);
});

test("INVEST composes without weakening scientific, case, voice, or public boundaries", () => {
  assert.match(skill, /For `INVEST \+ SCIENCE`/);
  assert.match(skill, /For `INVEST \+ CASE_STUDY`/);
  assert.match(skill, /For `INVEST \+ VOICE`/);
  assert.match(skill, /no term sheet, no stated amount, and no formal diligence cannot become the umbrella claim `no investment terms`/);
  assert.match(invest, /Scientific and technical uncertainty, current authoritative verification.*override investment vision language/s);
  assert.match(invest, /A customer case remains evidence about its stated subject, period, intervention, and measurement/);
  assert.match(invest, /Financial evidence, forecast classification, required disclosure, quote fidelity, and uncertainty override habitual certainty/);
  assert.match(invest, /A confident profile may use `will require` to state a necessary condition/);
  assert.match(invest, /name the concrete action each dependency must complete/);
  assert.match(invest, /`renewals to close` and `contracts to sign`/);
  assert.match(invest, /Do not preface it with `one thing is certain`/);
  assert.match(invest, /Private decks, meetings, diligence responses, and data-room assets do not inherit search formatting/);
  assert.match(invest, /Connect the financing to the exact next validation question/);
});

test("fundraising briefs and future narratives reach a bounded capital decision", () => {
  assert.match(invest, /keep measured or reported result, evidentiary boundary, interpretation, and capital use as distinct sentence jobs/);
  assert.match(invest, /Do not join an evidence limitation to a positive interpretation with `but`/);
  assert.match(invest, /State use of capital as the concrete operating action it funds/);
  assert.match(invest, /`capital-relevant operating objective`, `integration wedge`, or `deployment thesis`/);
  assert.match(invest, /connect present evidence to the proposed use of capital, the operating change or uncertainty the capital is meant to test, and the next investor decision/);
  assert.match(invest, /A stated use of funds does not by itself prove that the named area is the current constraint/);
  assert.match(invest, /finish the argument conditionally: supplied trend in its actual population, current company evidence, next proof required/);
  assert.match(invest, /do not recover rhetorical force by broadening the trend population/);
  assert.match(invest, /A horizon named in rejected source copy is not a supported forecast/);
  assert.match(invest, /Evidence about `computer-vision inspection` does not establish adoption of `autonomous quality control`/);
  assert.match(invest, /A paid pilot supports willingness to pay for that pilot/);
  assert.match(invest, /A use of funds to reduce installation labor does not establish that installation labor caused the current gross margin/);
});

test("private provenance does not enter the public INVEST reference", () => {
  assert.doesNotMatch(invest, /private source|friend sent|source document|proprietary framework/i);
  assert.doesNotMatch(invest, /[A-Za-z]:[\\/]Users[\\/]/i);
  assert.doesNotMatch(invest, /[\u2014\u2018\u2019\u201c\u201d]/);
});
