# Agora hardening loop: final report

Date: 2026-08-09
Release: 1.3.0
Phases: 7 of 7 DONE
Acceptance gate: passed, with two items qualified below.

## What the loop was for

`research/00-DIAGNOSIS.md` found that Agora enforced claim discipline well and reader-vocabulary discipline barely at all. It reliably stopped the model saying something it could not prove. It did nothing to stop the model saying a true thing in the writer's vocabulary rather than the reader's. Six gaps followed from that: no headline craft, no model of the curse of knowledge, a thin CTA standard whose own example failed it, no voice capability, no prosody control, and too few fixtures.

All six are now addressed. What follows is what actually changed, and what did not.

## Rules added, by grade

Grades follow the scale in `Evidence register`: A, B, C, HOUSE. The craft reference adds two labels and defines them once: `HOUSE/PI` for a practitioner-inference prescription whose components carry evidence but which has never been tested as written, and `governance default` for a number chosen so a writing system has something checkable to enforce.

| Grade | Count | Where the weight sits |
|---|---:|---|
| A | 14 | Headline expectation-setting and the concreteness curve; prior knowledge and expert inattention; persuasion knowledge; categorization and analogy; choice overload; appraisal-specific emotion; narrative against statistical evidence; vividness; the lexical-diversity measurement rule; detector limits. |
| B | 12 | Section headings describing their content; precision with a visible reason; the curiosity handoff; knowledge-dependent information structure; jargon before plain meaning; premature detail; four emotion procedures for a fact set with no outcome data; sentence-length variance as a diagnostic; read-aloud proofreading; the stylometric bundle rule; corpus separation of author from register; the short-draft verification limit. |
| C | 19 | Headline job selection per surface and the surface mechanics for seven publishing surfaces; the awareness and sophistication lineage, kept at practitioner status; query-based state diagnosis; committee modelling; early-conversion timing; deliberate sentence-length variation; the terminal-emphasis and periodic-versus-loose structure rules; the 10,000-word production minimum for a voice profile. |
| HOUSE | 21 | The search-paste competitor test; the falsifiability check; objection-built microcopy; specificity against superlative; the over-narrow label boundary; the internal-fatigue warning; the never-invent-a-number rule; the two descriptive-norm rules; the staged-surface fallback; the whole voice storage, profile-format, anti-mimicry, and content-firewall apparatus; five refusals. |
| HOUSE/PI | 25 cells plus 6 rules | The entire awareness-by-sophistication routing table, and the mechanism-prominence, fact-position, committee-layering, page-depth, bounce, and disqualification rules around it. |

Three rules were adopted from maxims that sit on the block list. Each was adopted as a **procedure**, at HOUSE, with the D-grade origin named in the same paragraph and no effect on reader response claimed: the search-paste test, the falsifiability check, and objection-built microcopy. That distinction is the point. A procedure you can run is not the same object as a claim about what it will do.

## Conflicts recorded and left open

Neither side of either conflict is written as a rule. Both are recorded in three places: `agora-craft.md` under `Open conflicts in this reference`, the `Practitioner craft pass` subsection of the Evidence register, and `research/folklore-ledger.md`.

| Conflict | Position A | Position B | Why it stays open |
|---|---|---|---|
| Question-form subheadings | Practitioners reject them outright: give the answer instead of asking. | Question headings were directly observed reading better than abstract noun-stack statement headings on the same page, and two experiments support question headlines in reader-addressed platform contexts. | The untested hypothesis is that questions beat noun stacks and lose to concrete answers. Nobody has run it. |
| Sentence cadence | Deliberate variance, with spread targets. | Uniform brevity on scanned commercial surfaces. | Probably register-dependent. Neither side is graded above an engineering heuristic, so picking one would be inventing a finding. |

The interim instruction is explicit: apply the variance targets to continuous prose, apply the brevity preference to scanned commercial surfaces, record which was applied when it matters, and report neither as a finding.

## Thresholds removed, relabelled, or refused

Four numeric rules had already been refuted before this loop began and were recorded in the Evidence register. This loop found and fixed the places where the document still contradicted its own refutation.

| Threshold | Disposition |
|---|---|
| A self-contained passage is two or three sentences | **Removed from two places where it was still asserted.** `Conflict hierarchy` and `Written GEO/AEO and citability` both stated it as a rule while `Required comprehension tests` and the Evidence register had already refuted it. The semantic self-containment test now governs both. |
| Attention-oriented headings must not run more than two consecutive instances | **Relabelled.** The deterministic invariant carried the number with no label; it now says the run length is a governance default. |
| A sentence carrying two or more reader-unowned terms is a review trigger | **Relabelled** in SKILL.md so the governance-default status sits in the same sentence as the number. |
| Very short, medium, and long word bands | **Relabelled.** All three headings and their introducing sentence now say governance default. |
| At most one unfamiliar concept per sentence | Already refuted. Survives only as an explicitly unmeasured house guardrail. |
| Two abstract nouns per clause | Already refuted. The fixture that still justified itself by counting abstract nouns was rewritten, because it was arguing against the rule it illustrates. |
| Every rhythm target in `agora-craft.md` | Written as governance defaults from the start, in every table row and in the introducing sentence. |
| Every voice threshold except the corpus floors | Written as governance defaults. The two corpus floors carry sample-size research links. |

## Fixtures

The applied-pair corpus went from 13 pairs to 17, and six existing pairs were reworked.

**Added:** `Category orientation` (espresso machine repair), `Superlative against specific` (soil laboratory), `CTA that overstates the click` (adult education), `Heading variety across one page` (greenhouse frames).

**Reworked:** `Abstraction stacking` no longer counts abstract nouns. `CTA destination clarity` moves reassurance out of the button label into the microcopy line. `Insider terminology`, `Methodology in customer copy`, `Slogan-shaped CTA`, and `Overloaded qualification` each gained the boundary where the rule stops applying. The `Hero` pair's call to action changed from a transition label to an outcome label, which the diagnosis had flagged as the document failing its own standard.

Every Weak version is factually accurate and fails for reader reasons only. That constraint is what makes the corpus teach anything: a weak example that fails because it lies is already caught by the truth rules and teaches nothing new.

Business types now span hospitality, agriculture, adult education, horticulture, logistics, veterinary services, freight, clinical billing, consumer energy, lending, industrial safety, browser tooling, and shipping reconciliation. No real company name appears anywhere in the skill directory.

## Eval cases

The blind corpus went from 21 cases to 26.

| Case | What it puts under load |
|---|---|
| `headline-set-across-surfaces` | One fact set written for a page headline, a search title, an email subject and preview pair, and a social post. The surface mechanics had nothing testing them. |
| `reader-state-mismatch` | Audience research showing the reader has not connected the symptom to its cause, alongside a coined mechanism name that genuinely appears on the equipment label. The coined-term decision is a real judgment, not a trick. |
| `emotion-without-outcome-data` | Mechanics, limits, role restrictions, and irreversible states only. Stating what any user feels is forbidden, as is claiming the product is easy or reassuring. |
| `voice-profile-adherence` | Three authorized author samples with visible habits, plus a fact set whose evidence is thin exactly where the author writes with habitual certainty. Tests both directions at once. |
| `orientation-without-taxonomy` | A cold hero for an unfamiliar trade, with a coined self-description the company really uses elsewhere and stated arrival context. |

All 26 case ids are now locked in the contract test, up from the original 15, so a future edit cannot silently drop one.

## Files modified

**New:**

- `skills/agora/references/agora-craft.md`
- `skills/agora/references/agora-voice.md`
- `research/folklore-ledger.md`
- `research/FINAL-REPORT.md`
- five prompt files under `evals/blind/v1.2.0/prompts/`

**Modified:**

- `skills/agora/SKILL.md`
- `skills/agora/references/agora-marketing.md`
- `scripts/validate.mjs`
- `tests/behavior-contract.test.mjs`
- `README.md`
- `package.json`, `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json`
- `evals/blind/v1.2.0/manifest.json`
- `research/LOOP-STATE.md`, `research/mined-sources.md`

The skill root went from three files to five. Every addition updated the validator allowlist, its path and content checks, the contract tests, the README tree, and the progressive-loading rules in SKILL.md in the same commit, so CI never saw a broken intermediate state.

## Acceptance gate

| # | Item | Result |
|---:|---|---|
| 1 | Tests pass, count above 20 | **Pass.** 25 tests, 25 pass, 0 fail. |
| 2 | No validator failure under `skills/`, `tests/`, `evals/`, `research/` | **Pass.** 16 failures, all in `.prompt-4-upload/`, `.prompt-5-upload/`, and `08-agora-marketing.md`. All are gitignored local scratch directories that the validator still walks. |
| 3 | Zero U+2014 and zero curly quotes across every file | **Pass.** Two curly characters were found in `research/mined-sources.md` and removed. |
| 4 | Every numeric threshold sourced or labelled a governance default in the same sentence | **Pass**, after four relabellings listed above. |
| 5 | Every A, B, or C rule carries a source link | **Pass, qualified.** Nine graded rules were found without an inline link. Seven gained the link they were derived from. Two descriptive-norm rules were downgraded to HOUSE instead, because the underlying evidence is strong but the project research recorded it without a retrievable citation, and asserting a grade this document cannot show a source for would be the exact failure this exercise exists to prevent. Link presence is verified; link liveness was not tested against the network in this session. |
| 6 | Every rule states a boundary or failure condition | **Pass by inspection**, not by machine. Every rule added in phases 1 through 5 carries an explicit boundary. This is not deterministically testable and a future editor can violate it without breaking CI. |
| 7 | No claim from the folklore ledger appears as a rule | **Pass.** Audited in phase 5 and recorded in `research/folklore-ledger.md`. Seven emotional levers are additionally listed by name as refused inside the craft reference. |
| 8 | No real company name in any fixture in the skill directory | **Pass**, checked mechanically against the names in the exemplar corpus. |
| 9 | Every applied pair's Weak version is factually accurate and fails for reader reasons | **Pass by inspection**, established when each pair was written. |
| 10 | SKILL.md under 500 lines with no reference-depth content | **Pass.** 298 lines. Depth went into the two new references; SKILL.md gained routing, the level-6 voice line, the owned-vocabulary exception, and the refusal. |
| 11 | Eval corpus covers the four original gaps plus voice | **Pass.** 26 cases. |

## What remains untestable deterministically

Stated plainly, because the value of the whole exercise depends on not overclaiming.

- **First-read comprehension.** Already recorded in the Evaluation contract as blind-quality only. No invariant can tell whether a reader could restate a sentence after one reading.
- **Whether a boundary is real.** Gate 6 is checked by reading. Nothing stops a future editor adding a rule with a boundary clause that does not actually bound anything.
- **Whether a fixture's Weak version fails for reader reasons.** The test asserts the four-part structure. It cannot assert that the weak copy is true.
- **The routing table.** Twenty-five cells of practitioner inference. No controlled literature tests these combinations as copy treatments, and this document says so in the table's own preamble. It is a routing aid, and if it is wrong, it is wrong in a way this repository cannot detect.
- **The two open conflicts.** Resolving either needs site-specific randomized data that nobody in this project has.
- **Voice measurement.** The reference specifies what to measure and the thresholds for refusing to certify. No measurement code exists yet. Until it does, `voice build` and `voice check` are specifications rather than working commands, and a model following the reference will estimate rather than compute. This is the largest single gap left.
- **Link liveness.** Source links are present and syntactically valid. Nothing in CI fetches them, so a link can rot without failing a test.
- **Whether any of this improves the copy.** The blind eval corpus can rank two outputs against each other. It cannot establish that the rules caused the difference, and no claim of that kind appears anywhere in the skill.

## For the operator

Report: `research/FINAL-REPORT.md`
Research folder: `C:\Users\mail\Workspaces\Agora-Marketing-Skill\research\`

The loop state, the full iteration log, and the four mistakes recorded not to repeat are in `research/LOOP-STATE.md`. The block list a future editor must check before adding any rule that sounds familiar is `research/folklore-ledger.md`.

Nothing has been pushed. Seven commits sit on `main` ahead of the remote.
