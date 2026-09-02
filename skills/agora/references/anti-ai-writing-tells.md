# Anti-AI Writing Tells: Human-Voice Editing Reference

Source: Wikipedia's *Signs of AI writing* guide (WikiProject AI Cleanup), expanded with current research on detector reliability, style transfer, paraphrase attacks, and semantic fidelity.

Purpose: turn generic AI-assisted drafts into concrete, author-specific writing that holds up under editorial and factual scrutiny. Detector scores are noisy secondary signals, not proof of authorship.

**Scope and limit:** no prompt, checklist, or "humanizer" can guarantee that text will pass every detector. Detectors use different methods, change over time, and sometimes label known human writing as AI-generated. The defensible target is writing that is genuinely shaped by the author: accurate, specific, natural for the genre, consistent with real writing samples, and acceptable under any applicable disclosure policy.

---

## Agora authority and routing

This is Agora's user-selected priority authority for human-voice editing and AI-writing-tell cleanup. It is derived from Wikipedia's WikiProject AI Cleanup guidance and expanded with the research and production rules named in this file. It is not represented as a verbatim copy of Wikipedia.

Within Agora, this reference outranks generic style preferences, measured voice tendencies, cadence targets, compression, and detector-driven edits. Host rules and explicit instructions in the current request still rank above it. Agora's whole-response U+2014 ban is stricter than the generated-copy minimum here and remains immutable.

Apply `The Core Principle`, `Global Output Bans`, Sections 1 through 7, `Meaning-Preservation Gate`, `Calibrate to the Genre`, and `Common Humanizer Failure Modes` to every generated writing deliverable. Load the deeper voice, detector-panel, research, and privacy sections when the task uses those workflows.

The rejection language in this reference changes with the user's requested job. In critique-only work, flag the defect and give an actionable correction. When rewriting is authorized, remove the defect and return the revision. Do not refuse an authorized rewrite merely because the source fails this standard.

`Reusable LLM Editing Prompt` is a portable example. It does not override the current task, force a factual-change audit into every response, or change Agora's normal ready-to-use output contract.

---

## Contents

- [Agora authority and routing](#agora-authority-and-routing)
- [The Core Principle](#the-core-principle)
- [Global Output Bans](#global-output-bans)
- [1. Banned Vocabulary](#1-banned-vocabulary)
- [2. Banned Connective Phrases](#2-banned-connective-phrases)
- [3. Banned Phrase Templates](#3-banned-phrase-templates)
- [4. Present-Participle Significance Tails](#4-present-participle-significance-tails)
- [5. Structural Tells](#5-structural-tells)
- [6. Punctuation and Typography](#6-punctuation-and-typography)
- [7. Prompt and Sycophancy Leakage](#7-prompt-and-sycophancy-leakage)
- [8. Citation Tells](#8-citation-tells)
- [9. The Concrete-Detail Test](#9-the-concrete-detail-test)
- [10. Workflow for AI-Assisted Drafting](#10-workflow-for-ai-assisted-drafting)
- [11. What Wikipedia Explicitly Says About This List](#11-what-wikipedia-explicitly-says-about-this-list)
- [12. What Detectors Actually Measure](#12-what-detectors-actually-measure)
- [13. Build an Author Voice Profile Before Rewriting](#13-build-an-author-voice-profile-before-rewriting)
- [14. Structural Editing Beyond Word Substitution](#14-structural-editing-beyond-word-substitution)
- [15. Meaning-Preservation Gate](#15-meaning-preservation-gate)
- [16. Calibrate to the Genre](#16-calibrate-to-the-genre)
- [17. Multi-Pass Editing Workflow](#17-multi-pass-editing-workflow)
- [18. Optional Detector-Panel Protocol](#18-optional-detector-panel-protocol)
- [19. Common Humanizer Failure Modes](#19-common-humanizer-failure-modes)
- [20. Reusable LLM Editing Prompt](#20-reusable-llm-editing-prompt)
- [21. Research Basis and Limits](#21-research-basis-and-limits)
- [22. Privacy, Provenance, and Process Evidence](#22-privacy-provenance-and-process-evidence)
- [Quick Reference Card](#quick-reference-card)

---

## The Core Principle

No single item on this list proves AI authorship. Humans use every word and mark
described here. Authorship diagnosis still depends on density, repeated patterns,
provenance, and context.

Output policy is different from authorship diagnosis. This reference imposes
strict house rules on AI-assisted deliverables even when one isolated occurrence
would not prove anything about authorship. Apply the bans below before delivery.

The useful signal is **density**: clusters of low-information phrases, repeated templates, and generic positive framing. There is no universal count at which a paragraph becomes "AI-written." Model drafts often regress toward statistically common wording; human writing can be generic too.

**Operational rule:** if a paragraph could describe any company in a category, it is too generic for publication. That is an editing judgment, not an authorship verdict. Make material claims un-substitutable.

---

## Global Output Bans

Unless immutable source text or an explicit legal, technical, brand, or user
requirement makes preservation necessary, final AI-assisted copy must contain:

- zero em dashes;
- zero curly or smart quotation marks;
- zero prompt acknowledgements or task meta-commentary;
- zero stock phrase templates from Section 3;
- zero generic significance tails from Section 4;
- zero fabricated citations, quotations, anecdotes, memories, motives,
  credentials, opinions, comparisons, or facts;
- zero banned vocabulary or connective phrases without a documented,
  load-bearing reason;
- zero unneeded conclusion or recap paragraphs;
- zero repeated or formulaic tripartite structures;
- zero repeated `Not only... but also...` constructions;
- zero deliberate errors, fake informality, synonym soup, or detector-evasion
  promises.

Use straight quotes. Replace an em dash with a comma, colon, parentheses, or a
new sentence. Preserve banned punctuation only inside immutable verbatim text.
Do not silently alter verified quotations, legal wording, code, or identifiers.

These are mandatory output rules derived from an operational editorial
screening list. Wikipedia's AI-cleanup guidance uses these patterns to flag
text for review, and related editorial workflows can adopt the same cues. That
operational use is why this reference bans them even though one occurrence does
not prove AI authorship.

---

## 1. Banned Vocabulary

Strip these words by default. Retain one only when it is load-bearing, exact,
technically required, part of a verified proper name, preserved verbatim, or
explicitly required by the user or house style. A reviewer should be able to
state why the retained term is more accurate than a concrete alternative.

**Verbs to cut:**
delve, underscore, showcase, foster, navigate (as metaphor), harness, leverage, unlock, unleash, empower, streamline, bolster, elevate, facilitate, enhance, optimize (when vague), drive (as metaphor), craft (as metaphor), forge, spearhead

**Adjectives to cut:**
pivotal, crucial, vital, essential, robust, seamless, holistic, comprehensive, multifaceted, nuanced, intricate, meticulous, profound, transformative, groundbreaking, revolutionary, cutting-edge, state-of-the-art, world-class, best-in-class, unparalleled, unprecedented, remarkable, noteworthy, notable, significant, invaluable, indispensable, paramount, breathtaking, stunning, vibrant, rich (as in "rich history"), bespoke, curated

**Nouns to cut (especially as metaphors):**
tapestry, landscape, realm, ecosystem, journey, testament, frontier, forefront, cornerstone, backbone, lifeblood, powerhouse, trailblazer, game-changer

**Test:** if the word is doing emotional work rather than descriptive work, delete it.

---

## 2. Banned Connective Phrases

Model drafts often overuse formal transitions. The same phrases are legitimate in legal, academic, and institutional prose, so judge repetition, information value, genre, and author baseline.

**Cut on sight unless required by immutable verbatim text or formal genre:**
- moreover
- furthermore
- additionally
- in addition
- notably
- importantly
- indeed
- in essence
- in summary
- in conclusion
- ultimately
- that said
- on the other hand / on one hand

**Replacement rule:** delete a transition when the logical relationship remains clear. When one is needed, use language natural to the author and genre; sometimes that is "But," "So," or "Then," and sometimes a formal connective is correct.

---

## 3. Banned Phrase Templates

Delete every generated occurrence. Preserve one only when it appears inside
immutable verbatim text or the user explicitly requires the wording.

- "It's important to note that..."
- "It's worth noting/mentioning that..."
- "In today's fast-paced world..."
- "In the ever-evolving landscape of..."
- "In the realm of..."
- "A testament to..."
- "Stands as a..."
- "Serves as a..."
- "Plays a [crucial/pivotal/vital] role in..."
- "Not only X but also Y"
- "Whether you're X or Y..."
- "From X to Y, [subject] has..."
- "At its core..."
- "When it comes to..."
- "Navigating the complexities of..."
- "Unlocking the potential of..."
- "Harnessing the power of..."
- "Paving the way for..."
- "Setting the stage for..."
- "Bringing X to the forefront"

---

## 4. Present-Participle Significance Tails

Wikipedia's guide identifies this as a recurring pattern. Research does not establish it as the single strongest cue across models and genres. Model drafts often append a floating participial clause to make a statement sound weightier than it is.

**Ban these generated patterns:**
- "..., emphasizing the significance of..."
- "..., reflecting the continued relevance of..."
- "..., underscoring the importance of..."
- "..., highlighting its role in..."
- "..., demonstrating its impact on..."
- "..., marking a turning point in..."
- "..., cementing its place as..."
- "..., solidifying its reputation for..."
- "..., showcasing its commitment to..."

**Rule:** remove every generated significance-tail template. End with the fact
or state a specific, supportable inference directly. Preserve a listed pattern
only inside immutable verbatim text.

---

## 5. Structural Tells

Structural repetition is often more distracting than one flagged word. Break
the generated patterns below before delivery. Do not treat one occurrence in
unrelated human writing as proof of authorship.

**Prompt-leakage openers to remove from deliverables:**
- "Certainly!"
- "Of course!"
- "Absolutely!"
- "Great question!"
- Any acknowledgment of a prompt

**Paragraph-level patterns to break:**
- Every paragraph closing with a summary/significance sentence
- Fractal summaries: previews and recaps repeated at section, paragraph, and conclusion level
- Tripartite parallelism (three adjectives, three clauses, three examples: the rule of three, every time)
- "Not only... but also..." recurring across a piece
- Headings followed by a sentence that restates the heading
- Bullet lists where every item is `**Bolded Term:** followed by a sentence.`
- Balanced both-sides paragraphs that refuse to commit to a claim
- A "conclusion" or summary section on formats that don't require one (product pages, bios, encyclopedia entries, news items)
- One-point dilution: the same claim restated without adding a new fact, relation, boundary, objection, or decision

**Content-shape tells:**
- Generic positive framing replacing specific facts (a person is "highly regarded" instead of "winner of the 2019 X Award")
- "Some argue... others contend..." framing with no named sources
- Definitions repeated across sections
- Smooth transitions between unrelated facts
- Topic sentences that restate the heading
- Raw Markdown, chat acknowledgements, email sign-offs, or other source-channel residue that the destination will expose instead of render naturally

**Fix:** write concrete. Material factual claims should use names, numbers, dates, places, events, or other verifiable detail when the genre and evidence support them. Reflective and analytical claims can be specific without containing those items. If a sentence survives the "could this describe any X" test unchanged, rewrite it.

---

## 6. Punctuation and Typography

- **Em dashes (Unicode U+2014):** do not use them in generated copy. Convert each one to a
  comma, colon, parentheses, or a separate sentence. Preserve one only inside
  immutable verbatim material. The older reference's `3–5x` usage claim has no
  supplied source, so do not repeat it as evidence for this house rule.
- **Curly or smart quotes:** use straight quotes unless immutable verbatim text,
  code, legal wording, or an explicit house style requires curly characters.
- **En dashes (Unicode U+2013) for date ranges:** retain only when the publication's formal
  style requires them; otherwise use hyphens.
- **Title Case mid-sentence:** lowercase generic concepts such as `artificial
  intelligence`, `machine learning`, and `the cloud` unless they are verified
  proper names.
- **Mid-paragraph bold:** remove it from flowing prose unless technical
  documentation, accessibility, or explicit house style requires emphasis.

---

## 7. Prompt and Sycophancy Leakage

These are instant disqualifiers. If any of these appear in a submitted draft, reject it unopened.

- "Here is your [article/blog post/essay] on..."
- "As an AI language model..."
- "Up to my last training update..."
- "I hope this helps!"
- "Let me know if you'd like..."
- "Certainly! Here's a..."
- "Sure, I can help with that."
- Any meta-commentary about the writing task inside the deliverable
- Any reference to "the user" or "you" addressing the person who commissioned the piece

---

## 8. Citation Tells

Relevant for fact-heavy or research-style content.

- Fabricated sources that do not exist
- Real publications paired with wrong authors, wrong dates, or wrong article titles
- URLs that 404
- Every citation sharing the same access date (especially today's date)
- Over-specific invented dates with no supporting evidence
- Citations to "a 2023 study" with no author, journal, or link
- Echoing Wikipedia's own policy language: "independent coverage", "significant coverage in multiple reliable sources", "widely regarded as", "has received critical acclaim"

**Rule:** every citation must be verifiable by clicking the link. If a writer uses AI assistance for research, they verify every source manually before submission. No exceptions.

---

## 9. The Concrete-Detail Test

The deepest LLM tell is lack of specificity. This is what Wikipedia's guide calls regression to the mean. Run every paragraph through this filter:

- Does this sentence name a specific person, number, date, place, product, or event?
- If I deleted the subject's name and dropped this into a competitor's page, would it still read as accurate?
- Does any adjective do descriptive work, or is it just positive emotional padding?
- Could a reader learn a concrete fact from this paragraph that they didn't know before?

If three of four answers are bad, rewrite with research, not thesaurus work.

---

## 10. Workflow for AI-Assisted Drafting

AI assistance is not banned here. Human ownership, factual fidelity, and author-specific writing are the goals.

**Writer workflow:**
1. Use AI only as permitted. Retain source notes and meaningful draft history when authorship or process may matter.
2. Run the draft through this checklist:
   - Search Sections 1 and 2. Delete banned items unless a narrow documented
     exception applies.
   - Search Sections 3 and 4. Remove every generated template and significance
     tail.
   - Convert every generated em dash to a comma, colon, parentheses, or a new
     sentence. Convert curly quotes to straight quotes.
   - Break tripartite parallelism and repeated `Not only... but also...`
     structures unless immutable source form requires them.
   - Remove every conclusion or recap paragraph that the genre does not need.
3. Replace generic descriptions with verified specifics wherever evidence and genre permit. Do not invent detail to satisfy a quota.
4. Read aloud. If it sounds like a TV commercial or a LinkedIn post, rewrite.
5. Verify every citation, quotation, name, number, and date against its source.

**Editorial workflow:**
Reject any draft with Section 7 leakage. Enforce the Global Output Bans and
Sections 1 through 6 before approval. Explain each retained exception. Require
the writer or named author to own the final revision. For review-only work,
return actionable rewrite requests instead of silently fixing the draft. When
rewriting is authorized, supply the revision but require the named author's
final review. Do not infer authorship from a fixed item count.

---

## 11. What Wikipedia Explicitly Says About This List

Direct paraphrase of the guide's own caveats:

- For authorship diagnosis, a listed word is not proof of AI use. For output,
  Section 1 bans it unless a narrow documented exception applies.
- The list is still operationally important: editors use its patterns to find
  and clean likely model-written prose. This reference therefore treats them
  as output bans, not optional warnings.
- Detection tools like GPTZero have non-trivial error rates. Don't rely on them.
- Experienced readers may notice repeated AI-associated patterns, but neither human judgment nor software is reliable enough to prove authorship by itself.
- The patterns are signals of a deeper problem: promotional tone, lack of specific fact, regression to generic framing. Fixing only the surface symptoms makes detection harder but does not produce good writing.

The goal is not to disguise authorship. The goal is to produce writing that is concrete, specific, useful, and recognizably owned by its author. Lower detector scores may follow, but they are not guaranteed and should not override quality or truth.

---

## 12. What Detectors Actually Measure

"AI detection" is not one test. Products may combine several signals:

- **Predictability:** how probable each token is under a language model, often described through likelihood or perplexity.
- **Variation:** changes in sentence length, syntax, and predictability, sometimes marketed as "burstiness."
- **Learned classification:** a model trained to separate examples labeled human and AI-generated.
- **Semantic and stylistic features:** embeddings, discourse structure, repetition, punctuation, or relationships between neighboring sentences.
- **Provenance signals:** watermarks or retrieval against known model outputs, when available.

The same passage can receive conflicting scores because each tool has different training data, thresholds, supported languages, length requirements, and blind spots. Scores are not interchangeable. A 20% result from one product does not mean the same thing as 20% from another.

Performance also changes with:

- the model that produced the draft;
- the subject and genre;
- document length;
- whether the detector has seen that model or domain before;
- ordinary editing, translation, paraphrasing, or grammar correction;
- the detector version and operating threshold.

**Editorial rule:** never treat a detector result as a verdict. First test the detector on several known human samples from the same author and genre. If it flags those, its score is not a useful target for that assignment.

---

## 13. Build an Author Voice Profile Before Rewriting

A list of generic "human" traits is weaker than evidence of how the intended author actually writes. Give the editor or LLM three to ten authentic samples when possible. Samples from the same genre are more useful than unrelated social posts or messages.

Record a short voice profile:

- typical sentence lengths and how often the author uses fragments;
- paragraph length and pacing;
- function-word and grammatical habits: articles, prepositions, conjunctions, and preferred clause connections;
- contractions, first-person language, and level of formality;
- punctuation habits, including semicolons, parentheses, commas, and any source
  use of em dashes that must be normalized under the output ban;
- favored transitions and recurring turns of phrase;
- directness, humor, warmth, skepticism, and degree of qualification;
- how the author opens, changes direction, and ends;
- words or constructions the author avoids;
- natural imperfections that appear consistently in real samples.

Maintain an author-specific rejection register separately from the universal output bans. Record the rejected word or construction, a dated example, the affected genre or channel, and the reason it failed. Recheck the register against recent drafts after a material body of work or at least quarterly when the profile is actively used. Remove stale entries instead of turning temporary model habits into permanent universal bans.

Separate relatively stable habits from genre-dependent ones. Function-word patterns, punctuation preferences, and habitual qualification may persist across topics. Paragraph size, list use, formality, openings, and conclusions often change by genre.

Simple measurements can sharpen an editorial profile: median sentence length, sentence-length range, fragment frequency, paragraph-length range, and relative use of commas, semicolons, parentheses, and dashes. Treat them as descriptive guardrails, not quotas. Three to ten samples can guide editing but cannot statistically prove authorship.

Preserve genuine author habits when they do not conflict with the Global Output
Bans. If authentic samples use em dashes or curly quotes, preserve the author's
voice through cadence, syntax, qualification, and other punctuation while
normalizing those banned marks. This is house style, not an authorship claim.

If no samples are available, preserve the draft's credible individual choices and ask the author to complete a personal edit. Do not invent an idiolect, biography, anecdote, opinion, or mistake.

---

## 14. Structural Editing Beyond Word Substitution

Replacing flagged words with synonyms does not fix AI-shaped prose. Edit the thought structure.

### Paragraph level

- Break the repeated pattern of topic sentence, three supporting points, and summary sentence.
- Let paragraph length follow the size of the idea. A one-sentence paragraph can be natural; so can a longer developed one.
- Remove throat-clearing and begin where the actual information starts.
- Keep a transition only when the logical turn would otherwise be unclear.
- End on the strongest fact, implication, or decision. Do not automatically restate the paragraph.

### Sentence level

- Vary length for a reason: a short sentence can land a conclusion; a longer one can hold a necessary qualification.
- Mix sentence openings. Repeated dependent clauses, gerunds, or "This" constructions create a template even when the vocabulary changes.
- Prefer the verb that names the action over a noun phrase that describes it abstractly.
- Keep necessary technical language. Forced synonyms can make expert writing less accurate.
- Preserve honest uncertainty. Human experts distinguish what they know, infer, remember, and believe.

### Document level

- Allow the argument to have a center of gravity. Not every point deserves equal length or equal praise.
- Include relevant friction: constraints, tradeoffs, exceptions, failed attempts, or reasons for a decision.
- Use details the author can stand behind, not decorative specificity.
- Remove conclusions that merely summarize. Keep a conclusion when the genre expects a recommendation, judgment, request, or next step.

Never add random typos, grammatical errors, slang, rare words, or sentence-length whiplash to manipulate predictability. Those tricks imitate noise rather than a person and often reduce credibility.

---

## 15. Meaning-Preservation Gate

Humanizing software can change names, numbers, causality, qualifications, citations, and the writer's level of certainty. Create a fact ledger before any substantial rewrite.

For each material statement, record:

| Item | Original claim | Status | Must preserve |
|---|---|---|---|
| Fact | Names, dates, numbers, events | Verified or supplied | Exact substance |
| Inference | Conclusion drawn from facts | Inference | Degree of certainty |
| Opinion | Author's judgment | Opinion | Ownership and tone |
| Quote | Exact attributed language | Verified quote | Wording and attribution |
| Term | Legal, medical, scientific, or product term | Required | Correct terminology |

After editing, compare the original and revised versions sentence by sentence:

1. Does every revised factual claim follow from the source draft or supplied evidence?
2. Did any qualification disappear?
3. Did correlation become causation, or possibility become certainty?
4. Did any number, name, title, date, quotation, or citation change?
5. Did the rewrite add praise, criticism, experience, or intent that the author did not provide?
6. Can the author defend every first-person claim?

If meaning and naturalness conflict, preserve meaning and flag the awkward passage for the author.

---

## 16. Calibrate to the Genre

Writing can sound human and still be wrong for its job.

- **Recommendation letter:** establish the recommender's authority and relationship, give comparative judgments backed by firsthand examples, state the recommendation plainly, and avoid inflated claims the recommender could not defend.
- **Academic work:** preserve disciplinary terminology, evidence, citations, and the writer's actual reasoning. Follow the institution's AI-use policy.
- **Professional email:** make the request and context easy to find. Natural brevity is usually more credible than a polished essay.
- **Executive memo:** lead with the decision or finding, show the evidence and tradeoffs, and make ownership clear.
- **Blog or essay:** preserve point of view, selective emphasis, digressions that earn their place, and the author's own relationship to the subject.
- **SEO/GEO copy:** answer the query concretely, but do not force identical headings, paragraph lengths, keyword placements, or miniature conclusions.

Do not sacrifice genre norms to chase a detector score. A law-school recommendation should sound like a serious professional endorsement, not casual conversation with artificial mistakes added.

---

## 17. Multi-Pass Editing Workflow

Do not ask an LLM to "humanize this" in one pass. Use separate passes with explicit constraints.

### Pass 0: Authority and requirements

- Confirm who wrote the source material and what AI use or disclosure rules apply.
- Identify the audience, genre, length, purpose, and non-negotiable facts.
- Preserve source notes, meaningful drafts, and the author's final changes when process evidence may matter.
- Remove confidential material before sending text to an external service.

### Pass 1: Evidence extraction

- Build the fact ledger.
- Separate verified facts, supplied recollections, inference, and opinion.
- Mark anything that requires the author's answer.

### Pass 2: Voice profile

- Analyze authentic samples without copying their subject matter.
- Describe recurring patterns with examples.
- Distinguish stable habits from one-off quirks.

### Pass 3: Macrostructure

- Reorder around the actual purpose and strongest evidence.
- Remove repeated introductions, symmetrical sections, filler, and recap paragraphs.
- Check that paragraph lengths reflect importance rather than a template.

### Pass 4: Sentence texture

- Rewrite templated syntax and vague abstraction.
- Use purposeful variation in length and cadence.
- Preserve the author's natural punctuation and level of formality within the
  Global Output Bans.

### Pass 5: Tell-density scan

- Enforce the Global Output Bans and Sections 1 through 8 as output rules.
- Remove banned marks, phrases, templates, and unsupported exceptions.
- Treat the same items as diagnostics, not proof, when evaluating authorship.

### Pass 6: Fidelity audit

- Compare against the fact ledger and sources.
- Verify every citation and quotation.
- Produce a short change log for any material rephrasing.

### Pass 7: Human read-aloud edit

- Have the intended author read it aloud and change anything they would not naturally say.
- Ask: "What sentence would I be uncomfortable defending in person?" Fix or remove it.
- Keep the author's final changes, even when they are less polished.

### Pass 8: Optional detector panel

- Use the protocol in Section 18.
- Treat results as diagnostics for repeated patterns, not instructions to corrupt the prose.
- Re-run the fidelity audit after any score-driven edit.

### Stop rule

Stop when the author recognizes the text as their own, the facts survive comparison, the genre is right, and an independent reader finds no distracting pattern density. Endless detector chasing overfits the prose to changing black boxes.

---

## 18. Optional Detector-Panel Protocol

Use this only when detector resilience is a practical concern. It is a benchmark, not proof of authorship.

### Calibration set

Assemble at least:

- three known human samples from the intended author, preferably five to ten and same-genre;
- three known human samples from the same genre by other authors;
- the raw draft;
- the human-edited draft;
- the author-final draft.

Keep samples long enough for each detector's stated minimum. Do not paste confidential, privileged, unpublished, or personally sensitive material into a third-party checker without permission.

### Test method

1. Use at least three methodologically different detectors when feasible; one score has little diagnostic value.
2. Record the product, date, disclosed model version or release, mode, language, genre, exact word count, revision stage, operating threshold when disclosed, confidence label, whole-document score, flagged sentences, and repeated-run results.
3. Test all calibration samples in the same session and settings.
4. Preserve the exact input or a stable input hash, then record every one-variable edit so a score swing can be reproduced rather than attributed to a remembered change.
5. Repeat boundary-sensitive tests enough to distinguish a stable result from an unexplained interface or threshold swing.
6. Compare the revised draft with genuine same-author writing, not an arbitrary "0% AI" target.
7. Look for agreement at the sentence or pattern level. Ignore a lone product's unexplained swing.
8. Make only edits that improve voice, clarity, structure, or factual precision.
9. Recheck meaning after every revision round.
10. When possible, use blinded human reviewers to rate clarity, voice match, genre fit, and factual trust without showing detector scores or asking them to guess authorship.
11. Stop after two detector-driven revision rounds unless another round has a clear editorial benefit independent of its score.

Suggested log:

| Date | Tool and mode | Known human baseline | Raw draft | Revised draft | Shared flagged pattern | Action |
|---|---|---:|---:|---:|---|---|
| YYYY-MM-DD | Product/version | Score | Score | Score | Pattern or none | Keep, revise, or disregard |

### Interpretation

- If known human samples score "AI," document the false positive and discount that tool for this task unless adequate same-genre recalibration is possible.
- If tools disagree, do not average their percentages; the scales are not equivalent.
- If several tools flag the same repetitive sentence pattern and a human editor also dislikes it, revise the pattern.
- If a lower score requires inaccurate, awkward, or out-of-character prose, reject the edit.
- Never claim that a passing score proves human authorship or that the text will pass another version tomorrow.

---

## 19. Common "Humanizer" Failure Modes

Reject revisions that introduce any of the following:

- synonym soup or unnecessarily rare vocabulary;
- fabricated anecdotes, emotions, memories, comparisons, or credentials;
- changed figures, dates, names, citations, quotations, or legal meaning;
- deliberate mistakes and fake informality;
- random fragments or abrupt sentence-length oscillation;
- verbosity added solely to change statistical patterns;
- a voice younger, choppier, or more casual than the author;
- plagiarism or close imitation of a supplied style sample;
- loss of technical precision;
- private text uploaded to an opaque service with unclear retention terms;
- repeated rewrite cycles aimed only at one detector's score.

The best revision is not the one with the strangest distribution of words. It is the one the author can read, defend, and revise without pretending.

---

## 20. Reusable LLM Editing Prompt

Copy this reference and the prompt below into the same context. Replace the bracketed fields.

```text
Act as a senior editor. Your job is to turn the supplied draft into accurate,
author-specific writing, not to manufacture errors or promise detector evasion.

Inputs
- Draft: [PASTE]
- Genre and purpose: [DESCRIBE]
- Audience: [DESCRIBE]
- Author's authentic writing samples: [PASTE 3-10 IF AVAILABLE]
- Verified facts and source notes: [PASTE]
- Required terms, quotations, and citations: [PASTE]
- Tone and length constraints: [PASTE]
- Applicable AI-use or disclosure policy: [PASTE OR STATE NONE SUPPLIED]

Follow the attached Human-Voice Editing Reference. Work in this order:
1. Build a compact fact ledger. Do not add facts, memories, opinions, motives,
   comparisons, or experiences that are absent from the inputs.
2. Derive a voice profile from the samples. Use recurring habits, not caricature.
   Do not copy phrases or subject matter from the samples.
3. Diagnose repeated structural and lexical patterns in the draft. Apply the
   reference's vocabulary, connective, phrase, punctuation, and structure bans.
4. Rewrite for the genre, using the author's real level of formality, directness,
   sentence variation, and qualification. Use zero generated em dashes, zero
   curly quotes, and zero prompt leakage.
5. Compare the rewrite against the fact ledger sentence by sentence. Restore any
   lost condition, uncertainty, attribution, number, date, name, or technical term.
6. Read for cadence. Remove promotional filler, forced transitions, symmetrical
   paragraphs, generic conclusions, synonym substitutions, and artificial errors.

Priority order
1. Truth and semantic fidelity
2. The author's ownership and genuine voice
3. Genre and audience fitness
4. Clarity and natural cadence
5. Reduction of repeated AI-associated patterns

Output
A. The revised text, ready to use.
B. A concise factual-change audit confirming what was preserved and identifying
   anything that needs the author's verification.
C. No detector guarantee. If the inputs are too thin to support an authentic
   revision, say exactly what author evidence is missing.
```

---

## 21. Research Basis and Limits

These sources support the reliability and robustness cautions in this reference:

- [RAID benchmark (2024)](https://arxiv.org/abs/2405.07940): a large benchmark spanning models, domains, decoding strategies, and adversarial modifications found major detector weaknesses under distribution shifts and attacks.
- [Krishna et al. (2023)](https://arxiv.org/abs/2303.13408): paraphrasing sharply reduced several detectors' performance, while retrieval against known generations offered a different defense.
- [DAMAGE shared task overview (2025)](https://aclanthology.org/2025.genaidetect-1.9/): testing across many humanizer tools showed that humanized text can defeat detectors, although training across such transformations improves robustness.
- [A Practical Examination of AI-Generated Text Detectors (2025)](https://aclanthology.org/2025.findings-naacl.271/): performance fell across unseen models, domains, and moderate attacks, especially at strict false-positive thresholds.
- [GPT detectors are biased against non-native English writers (2023)](https://arxiv.org/abs/2304.02819): some detectors disproportionately misclassified non-native English writing in the study's setting.
- [GPTZero's detector methodology paper (2026)](https://arxiv.org/abs/2602.13042): even a detector vendor's own technical account identifies distribution shift, standardization, and generalization as open limitations.
- [Can AI-Generated Text be Reliably Detected? (2023)](https://arxiv.org/abs/2303.11156): theoretical and experimental analysis connects detector limits to overlap between human and model text distributions and shows sensitivity to recursive paraphrasing.
- [Almost AI, Almost Human (2025)](https://arxiv.org/abs/2502.15666): eleven detectors frequently misclassified minimally AI-polished human text and struggled to distinguish degrees of AI involvement.
- [Human heuristics for AI-generated language are flawed (2022)](https://arxiv.org/abs/2206.07271): experiments found that people relied on manipulable cues such as contractions and first-person language rather than dependable authorship evidence.
- [Authorship Attribution through Function Word Adjacency Networks (2014)](https://arxiv.org/abs/1406.4469): function-word relationships can capture authorial habits with less dependence on subject matter than content vocabulary.

The older source asserted that LLMs use em dashes at `3–5x` the human rate and
that experienced users detect AI writing correctly about `90%` of the time. No
supporting source accompanied either figure. Do not repeat those numbers as
scientific facts. This does not weaken the bans. Their operational basis is the
screening list itself and its use in editorial cleanup, not either percentage
or a promise that following the list guarantees non-detection.

The popular [30-detector comparison](https://anangsha.substack.com/p/i-tested-30-ai-detectors-here-are) is useful as one person's product test, but it is not a controlled scientific benchmark. It includes affiliate links, and its comment section contains a reported false positive from a reader's own writing. Treat its rankings as anecdotal leads to test, not established performance.

The research does **not** support a universal, permanent "undetectable" method. It supports three narrower conclusions:

1. Detector performance varies materially by data, model, domain, threshold, and revision method.
2. Surface-level transformations can lower some scores while harming meaning and may fail against other or future detectors.
3. Provenance, authentic samples, factual auditing, and human revision are more durable than optimizing prose against a changing classifier.

---

## 22. Privacy, Provenance, and Process Evidence

Detector scores cannot establish how a document was produced. When authorship, policy compliance, or professional accountability matters, preserve process evidence:

- the author's notes and factual inputs;
- source links and verification records;
- meaningful draft versions rather than every autosave;
- the fact ledger and unresolved-question log;
- tracked material revisions;
- the author's final read-through and changes;
- any required AI-use disclosure.

This record does not replace applicable policy, but it is more informative about authorship and editorial control than a classifier score alone.

Before using an external detector, editor, or humanizer, check:

- whether submitted text is stored and for how long;
- whether content may train or improve models;
- opt-out, deletion, and enterprise controls;
- subprocessors, cross-border transfer, and jurisdiction where relevant;
- whether the current terms permit confidential, regulated, educational, or client material.

Do not upload confidential, privileged, unpublished, regulated, or personally sensitive text without authorization. If retention or training terms are unclear, keep the material out of the service.

---

## Quick Reference Card

**Before submission, confirm:**

- [ ] Voice profile derived from authentic samples when available
- [ ] Fact ledger checked after the final rewrite
- [ ] Zero generated em dashes
- [ ] Zero curly or smart quotes unless immutable text requires them
- [ ] Zero prompt leakage phrases
- [ ] Zero banned phrase templates
- [ ] Zero generic significance or importance tail clauses
- [ ] Zero banned vocabulary or connective phrases without a documented exception
- [ ] Zero fabricated citations
- [ ] No invented anecdotes, opinions, motives, or credentials
- [ ] Zero conclusion or recap paragraphs unless required by the genre
- [ ] Each paragraph is specific enough that it could not be pasted into an unrelated piece
- [ ] Zero generated tripartite templates
- [ ] Zero generated `Not only... but also...` constructions
- [ ] House-style capitalization followed (lowercase for generic concepts)
- [ ] Sentence-length variation is purposeful, not random
- [ ] Meaning, uncertainty, names, numbers, dates, and technical terms survived intact
- [ ] Known-human samples were used to calibrate any detector panel
- [ ] Detector-driven edits stopped after two rounds unless they independently improved prose
- [ ] No confidential text was uploaded without approval
- [ ] Source notes, meaningful drafts, and final author changes preserved when process evidence matters
- [ ] The author read the final version aloud and can defend every sentence
- [ ] No claim that a score proves authorship or guarantees future detector results
