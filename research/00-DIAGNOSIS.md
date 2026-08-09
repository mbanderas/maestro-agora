# Agora craft gap diagnosis

Working document. Not shipped in the npm package (`package.json` `files` allowlist excludes `research/`).

Date: 2026-08-09
Reviewed: `skills/agora/SKILL.md` (174 lines), `skills/agora/references/agora-marketing.md` (764 lines), `scripts/validate.mjs`, `README.md`.

## Summary

Agora enforces claim discipline well and reader-vocabulary discipline barely at all. It reliably prevents the model from saying something it cannot prove. It does not prevent the model from saying a true thing in the writer's vocabulary rather than the reader's. Those are separate failure modes with separate fixes, and only the first is currently instrumented.

The result is copy that is accurate, defensible, and flat. It passes every existing deterministic invariant and still reads like documentation.

## Gap 1: no headline or title craft

There is no section on headlines, titles, subject lines, or hooks anywhere in the authority document.

What exists:

- `Channel architecture > Landing-page heroes and ads`, four lines, all about not opening with taxonomy.
- `Written GEO/AEO and citability`, one bullet: "Use descriptive headings and labels that match the content beneath them."
- `Technical publication boundaries`, one bullet: "unique, accurate titles and descriptions."

What is missing:

- The distinct jobs a headline performs: audience selection, promise, interruption, and handoff into the body. These conflict with each other and the tradeoff is never named.
- The difference between a page headline, a section heading, a nav label, a SERP title, a social title, and a video title. Agora treats all of them as "written derivatives" with the same treatment.
- A specificity ladder. Nothing tells the model that "reduces reconciliation time" is weaker than "finds the mismatch before close" is weaker than "finds the mismatch on day 2, not day 30."
- Any notion of headline variance across a corpus.

### The formula-at-scale defect

`SKILL.md:92` and `references/agora-marketing.md:134` both prescribe, for short POSITION work with no supplied outcome:

> `When [verified condition], [subject] [mechanism].`

This is a good sentence shape and a bad site policy. Applied across a homepage, six product pages, and forty blog titles, it produces a corpus where every headline has the same syntax. Agora already bans "identical paragraph shapes" under `Structural tells` but sanctions an identical sentence shape one document earlier. The rule needs a corpus-level variance constraint, or a set of at least six sanctioned short-form shapes with guidance on when each fits.

## Gap 2: no model of the curse of knowledge

This is the deepest gap and the direct cause of the operator's methodology-label complaint.

The only existing guard is a symptom list in `SKILL.md:120-130` (`Reject flat or synthetic drafts`):

- "reads as a category definition, source-ledger paraphrase, feature inventory, or operational taxonomy"
- "exposes compliance, reasoning, routing, or publication process"

These describe what a bad draft looks like after it exists. They give the model no test to run before drafting. Missing entirely:

- **Curse of knowledge.** The single most-studied cause of exactly this failure. Not named anywhere in the document.
- **Reader knowledge boundary.** No step that asks which vocabulary the reader already owns, which they would need taught, and what the teaching costs in attention.
- **Internal-noun quarantine.** No rule that proper nouns the company invented (pipeline stages, scoring rubrics, agent names, phase labels, architecture names, internal metric names) are not reader-facing nouns by default. A reader has to be given a reason to learn a new noun, and the reason has to be worth more than the friction.
- **Translation discipline.** No requirement to state the internal term and the reader's own term for the same thing, then ship the reader's term unless the internal one earns its place.
- **Awareness and sophistication staging.** Whether naming a mechanism helps or hurts depends entirely on where the reader sits. A sophisticated buyer comparing three vendors wants the mechanism named precisely. An unaware reader needs the problem named first and will bounce off the mechanism. Agora has one treatment for both.

Agora's `Mechanism and differentiation` section actively pushes toward naming mechanisms precisely, which is correct for differentiation and is the exact pressure that produces methodology labels in customer copy when the reader is not sophisticated. The section has no counterweight.

## Gap 3: CTA standard is thin and its own example fails it

`CTA standard` is twelve lines. It does one useful thing: match verb commitment to reader readiness. Everything else is absent.

The operative rule is "Use a verb that tells the reader what happens." That is satisfied by the document's own hero example:

> See the reconciliation flow

This names an artifact the reader will be shown, not an outcome they will get. Under the operator's stated standard ("CTAs should name a clear outcome") the skill's canonical example is a miss.

Missing:

- A requirement that the CTA name what the reader ends up with, not what the interface does next.
- The anti-pattern list: `Learn more`, `Get started`, `Submit`, `Explore`, `Discover`, `Click here`, `Request info`, and bare product names.
- Value-to-friction pairing. What the click costs, what it returns, and whether that trade is stated.
- The sub-CTA reassurance line, which does most of the work on high-friction actions and is not mentioned once.
- First-person completion as a drafting test: the label should finish an implied "I want to ...".
- CTA consistency across a page and across a site. Nothing prevents six different phrasings of the same action.

## Gap 4: no voice capability

`references/agora-marketing.md:435`, one sentence:

> If author samples are supplied, follow stable habits without copying phrases or inventing an identity.

That is a constraint, not a capability. There is no way to extract a voice from samples, no format to record it, no place to store it, and no way to recall it in a later session.

## Gap 5: no prosody or rhythm control

`Structural tells` removes bad structure. Nothing installs good structure.

The strongest surviving machine-writing tell is not vocabulary, it is cadence: sentence lengths cluster tightly around the mean, clause depth stays uniform, and paragraphs come out the same size. Agora's `Read-aloud` test appears once, as a name in a list of six tests, with no instruction attached.

Nothing in the document gives the model a target for sentence-length variance, a rule about where the short sentence goes, or any handle on paragraph shape beyond "avoid identical."

## Gap 6: exemplar starvation

`Applied weak and strong pairs` is well constructed and every fixture is fictional by design ("Examples teach structure, never facts", `SKILL.md:32`).

The truth rationale is sound. The craft cost is real: models acquire voice from exemplars far more efficiently than from rules, and Agora currently offers eight fictional pairs against 764 lines of rules. The fix is not to relax the truth rule. It is to expand the fixture corpus substantially, and to add a clearly-attributed public-example corpus that is quoted for structure with the source named, never mined for claims.

## Repo constraint affecting any fix

`scripts/validate.mjs:9-13` enforces a strict skill root:

```
skills/agora/SKILL.md
skills/agora/agents/openai.yaml
skills/agora/references/agora-marketing.md
```

Adding `references/agora-craft.md` or `references/agora-voice.md` requires coordinated edits to:

- `scripts/validate.mjs` (allowlist, line 13; path checks, lines 96-106; link check, line 145)
- `tests/behavior-contract.test.mjs` (line 297 references the reference path)
- `README.md` (the skill tree diagram, line 188)

`package.json` `files` already ships `skills/agora` wholesale, so no change needed there. A top-level `research/` directory is safe: it is outside the skill root and outside the npm allowlist.

## Fix sequencing

1. Run the six deep research prompts. Output is graded evidence, not opinion.
2. Run the YouTube mining pass. Output is practitioner craft plus an exemplar corpus, graded separately and never merged into doctrine without a grade.
3. Write `references/agora-craft.md` covering headlines, reader vocabulary, CTAs, staging, emotion, and prosody. Update the validator allowlist in the same commit.
4. Write `references/agora-voice.md` plus the `VOICE` mode in `SKILL.md`.
5. Extend `evals/blind/` with cases that specifically fail today: a methodology-label trap, a CTA-outcome trap, a headline-variance trap across five assets from one fact set, and a voice-adherence case.
