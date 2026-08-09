# Agora hardening loop: state

Single source of truth for loop progress. The loop reads this first and updates it last, every iteration.

Status values: `TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`.

## Phases

| # | Phase | Status | Notes |
|---|---|---|---|
| 1 | Absorb the YouTube corrections into existing sections | DONE | Orientation/taxonomy, internal-boredom warning, search-paste competitor test, specificity-over-superlative, falsifiability, objection microcopy. All graded. |
| 2 | Rebuild the fixture corpus as fresh fictional pairs | DONE | 17 pairs. Four new, six reworked, Hero CTA corrected. Weak versions are all factually true. |
| 3 | New reference `agora-craft.md`: headlines, staging, emotion, prosody | DONE | Four-file root now. Validator allowlist, tests, README tree, and SKILL.md loading rules all updated in the same commit. |
| 4 | New reference `agora-voice.md` plus VOICE mode | TODO | |
| 5 | Folklore guard and evidence-register consolidation | TODO | |
| 6 | Eval corpus expansion and blind adjudication | TODO | |
| 7 | Release prep: version, change record, README | TODO | |

## Iteration log

Append one line per iteration. Never rewrite history.

| Date | Phase | What actually changed | Tests |
|---|---|---|---|
| 2026-08-09 | 0 | Loop state created. Prior work: diagnosis, six graded research runs, YouTube mining pass, comprehension and CTA gate landed and rebased. 20/20 tests. | pass |
| 2026-08-09 | 1 | SKILL.md: orientation-is-not-taxonomy paragraph, internal-fatigue warning next to corpus variance, search-paste and falsifiability procedures in the anti-slogan pass, two failure-list bullets rewritten. Reference: new `Orientation against taxonomy`, `Specificity against superlative`, `Differentiation tests`, `Microcopy under the control`; falsifiability check added to `Abstraction control`; competitor-swap row made operational and given a boundary; internal-fatigue paragraph added to `Corpus-level variance`; over-narrow-label boundary added to `The required shape`; new `Practitioner craft pass` subsection in the Evidence register recording what was adopted, what stays refused, and two open conflicts. Every added rule carries a grade and a failure condition. No new numbers. Curly apostrophe removed from `research/mined-sources.md`. | 20/20 pass; validator 16 pre-existing failures, none in files touched |
| 2026-08-09 | 2 | Four new applied pairs: `Category orientation` (espresso machine repair), `Superlative against specific` (soil laboratory), `CTA that overstates the click` (adult education), `Heading variety across one page` (greenhouse frames). Six reworked: `Abstraction stacking` no longer counts abstract nouns, which the research refuted; `CTA destination clarity` moves reassurance out of the label and into microcopy; `Insider terminology` gains the industry-vocabulary boundary; `Methodology in customer copy` gains the reader-dependent boundary; `Slogan-shaped CTA` states the operational-ambiguity basis; `Overloaded qualification` gains the inline-qualifier boundary. `Hero` CTA changed from a transition label to an outcome label. Test heading array extended. Every Weak version is factually true and fails for reader reasons only. Business types now span hospitality, agriculture, education, horticulture, logistics, veterinary, freight, clinical billing, consumer energy, lending, and industrial safety. | 20/20 pass; validator 16 pre-existing failures |
| 2026-08-09 | 3 | New `skills/agora/references/agora-craft.md`. Headlines: five competing jobs with the surface priority order, surface mechanics per publishing surface, the specificity ladder with an over-specific failure rung, eleven archetypes each with its condition and failure, the curiosity gap and its handoff, and the corpus-variance split. Staging: awareness and sophistication as separate axes, the practitioner lineage kept at C and never upgraded, the full 25-cell routing table with every cell marked HOUSE/PI, the three A and B constraints that bound it, state diagnosis, mismatch costs, and committees. Emotion: scoped to the truth constraint, with five graded procedures for a fact set carrying no outcome data, the permission to write flat in four named places, and seven refused levers listed by name. Prosody: rhythm targets as a table where every row is labelled a governance default, plus the variance-against-brevity conflict recorded and left open. Two open conflicts tabled at the end. Wiring in the same commit: validator allowlist plus LF, typography, and required-string checks; two new tests; README tree and description; SKILL.md progressive-loading rules with an explicit do-not-load condition. | 22/22 pass; validator 16 pre-existing failures, none in files touched |

## Standing blockers

None.

## Do not repeat these mistakes

Recorded from the session that produced the current state. Each cost real rework.

1. **A threshold was invented and shipped.** Four numeric rules (one unfamiliar concept per sentence, two abstract nouns per clause, two-or-three-sentence passages, no shared heading templates) were written as doctrine and later refuted by the research. Never write a number into the authority document without a source or an explicit governance label.
2. **A rule was generalized past its evidence.** The anti-repetition rule was actively harmful for task headings, where parallel syntax is correct. Split rules by function before stating them.
3. **Completion was claimed without a tool call.** Work was reported as started when nothing had run. Report only what the transcript shows.
4. **The client name leaked into a research file** and tripped the validator. The residue check is case-insensitive and covers every file in the repo.
