# Agora deep research prompts

Six standalone prompts. Run each in a deep research tool (Claude Research, ChatGPT deep research, or Gemini Deep Research). Each returns a drop-in section for `skills/agora/references/agora-craft.md`.

Run them in separate sessions. Do not run them in one thread: the shared context makes later outputs converge on earlier framing, which defeats the point of independent evidence gathering.

Save each result to `research/dr-<n>-<slug>.md`.

---

## Shared requirements block

Every prompt below already contains this block. It is repeated here so it can be edited once and re-pasted.

```text
OUTPUT CONTRACT

Format: a single markdown section suitable for pasting into a professional writing
authority document. Use H2 for the section, H3 for subsections. No preamble, no
closing summary, no offer of further help.

Evidence grading: attach a grade to every rule you state.
  A  Multiple controlled studies, meta-analysis, or large replicated field data.
  B  One controlled study, or one large-scale documented field test with stated method.
  C  Practitioner consensus with named practitioners and documented commercial results.
  D  Widely repeated, no traceable primary source.

Cite a working URL for every A, B, and C claim. Prefer primary sources: papers,
conference proceedings, published test results, and named practitioner case
documentation. Do not cite content marketing blog posts that restate a claim
without a source.

Folklore appendix: end with a subsection listing every widely repeated rule in
this domain that you could only grade D, with the earliest traceable origin you
can find and a one-line note on why it persists. This appendix is as valuable as
the graded rules. Do not omit it and do not soften it.

Boundary conditions: for every rule graded A, B, or C, state where it fails or
reverses. A rule with no stated failure mode is not usable.

Examples: give before-and-after pairs. Invent fictional companies, products, and
figures for every example. Never present a real company's copy as an example
unless you link the exact page or archive and quote it as attributed structure,
not as a factual claim about that company's results.

Style constraints for your output:
  Do not use the em dash character (U+2014) anywhere in your response.
  Do not use curly or smart quotes.
  Do not hedge. If evidence is weak, say the grade and move on.
  Do not write a significance tail on any paragraph.
```

---

## Prompt 1: headlines, titles, subject lines, and hooks

```text
You are compiling an evidence-graded craft reference on headline and title
construction for a professional copywriting authority document. The audience is
an expert writing system, not a beginner. Assume the reader already knows that
headlines matter. Skip motivation and go straight to mechanism.

Research and deliver the following.

1. THE COMPETING JOBS
   A headline performs several jobs that trade off against each other: selecting
   the right audience, making a promise, interrupting attention, setting
   expectation for the body, and surviving truncation in a feed or a search
   result. Document each job, the evidence that it matters, and the specific
   tradeoffs between them. Name which job should win in which context.

2. SURFACE-SPECIFIC MECHANICS
   Treat these as distinct problems with distinct evidence, not as one problem:
   - Landing page hero headline
   - In-page section heading
   - Search result title (title tag) and the rewriting behavior of search engines
   - Social card title and feed headline
   - Email subject line, including the preview text pairing
   - Video title, including click behavior on thumbnail plus title as a unit
   - Article and editorial headline, including news style versus feature style
   - Documentation and help-center headings
   For each: what the measurable objective actually is, what length behavior is
   documented, what gets truncated where, and which of the competing jobs from
   part 1 dominates.

3. THE SPECIFICITY LADDER
   Build an explicit ladder from vague to specific with worked fictional
   examples at each rung. Document the evidence on whether specificity improves
   response, where it stops helping, and where it backfires (for example when
   specificity reveals a limitation the reader would not have inferred, or when
   a precise number reads as implausible).

4. HEADLINE ARCHETYPES AND THEIR CONDITIONS
   Catalog the recurring structural archetypes that have documented commercial
   use: direct benefit, news or announcement, how-to, question, curiosity gap,
   command, testimonial-led, number-led, negative or problem-led, and any others
   you find with evidence. For each: the condition under which it works, the
   condition under which it fails, and the failure mode when overused.

5. THE CURIOSITY GAP AND ITS COST
   Cover the research on information gaps and curiosity, and the documented
   backlash effects: expectation violation, trust cost, and the decay of
   curiosity-led headlines within a single publication over time. Give the rule
   that separates a legitimate gap from a withheld payoff.

6. CORPUS-LEVEL VARIANCE
   This matters most and is least documented. When one writer or one system
   produces every headline on a site, structural repetition emerges. Research
   what is known about headline homogeneity within a publication or site: reader
   habituation, banner blindness adjacent effects, and any measured decay. Then
   give an operational rule for how much structural variance a corpus needs and
   how to measure it.

7. HEADLINE TO BODY HANDOFF
   The relationship between the headline and the first sentence. What evidence
   exists on the opening line, the deck or subhead, and the cost of a headline
   the body does not immediately pay off.

8. WHAT TO TEST AND WHAT NOT TO
   Summarize what headline A/B testing has reliably shown versus where effect
   sizes are too small or too noisy to act on. Include what is known about
   sample size requirements for headline tests at typical traffic levels.

[PASTE THE SHARED OUTPUT CONTRACT BLOCK HERE]

Specific folklore to adjudicate in the appendix, among others you find:
  "On average five times as many people read the headline as read the body copy."
  "Eight out of ten people read the headline, two out of ten read the rest."
  "The best headline length is six words."
  "Odd numbers outperform even numbers in headlines."
  "Questions in headlines increase engagement."
  "Headlines are 80 percent of your advertising spend."
Trace each to its earliest source and state whether the underlying data survives
scrutiny.
```

---

## Prompt 2: reader vocabulary, the curse of knowledge, and jargon in customer-facing text

```text
You are compiling an evidence-graded craft reference on the single most common
failure in expert-written customer-facing copy: the writer describes the product
in the vocabulary of the people who built it rather than the vocabulary of the
people who buy it.

The consuming system is an AI writing assistant that currently over-produces
methodology labels, internal process names, architecture terms, and pipeline
stage names in customer-facing headlines, body copy, and CTAs. It does this
while being factually correct, which is why accuracy rules do not catch it. The
deliverable must give that system an operational test it can run before drafting,
not a symptom list it can apply after.

Research and deliver the following.

1. THE CURSE OF KNOWLEDGE
   The core cognitive research: what the effect is, how it was demonstrated, its
   effect sizes, and its replication status. Cover the tapping study lineage,
   hindsight bias adjacency, and the work on expert-novice communication gaps.
   Then translate it into what specifically happens to a writer who understands
   the product.

2. WHY EXPERTS PRODUCE JARGON
   Distinguish the causes, because they need different fixes:
   - Genuine compression: the term is the shortest accurate handle.
   - Identity and signaling: the term marks group membership or competence.
   - Insecurity compensation: research exists on abstraction as a competence
     signal and on how readers actually judge it.
   - Copy-paste from internal artifacts: spec documents, tickets, architecture
     diagrams, and slide decks leaking into marketing text.
   For each cause, the evidence and the corresponding intervention.

3. THE READER KNOWLEDGE BOUNDARY
   Build a usable model for deciding which terms a reader already owns, which
   they will accept being taught, and which will cost them. Cover the research on
   processing fluency and its documented effects on judgment, including where
   fluency helps and where disfluency is neutral or beneficial. Include what is
   known about the cost of introducing a novel proper noun into copy: does the
   reader learn it, ignore it, or leave.

4. WHEN A MECHANISM NAME HELPS
   This is the counterweight and it must be as rigorous as the warning. Named
   mechanisms, proprietary process names, and technical differentiators
   demonstrably help under some conditions. Document the conditions: buyer
   sophistication, competitive density, whether the category has an established
   comparison vocabulary, whether the reader is technical, whether the term
   appears in the reader's own search behavior. Give the decision rule that
   separates a mechanism name that differentiates from a methodology label that
   obscures.

5. CONCRETENESS AND IMAGEABILITY
   The linguistic and psychological research on concrete versus abstract
   language: comprehension, memory, persuasion, and trust effects. Include the
   work on nominalization, agentless construction, and the effect of naming an
   actor. Give the measurable markers of concreteness a writing system can check.

6. TRANSLATION DISCIPLINE
   Document the practitioner methods for getting from internal vocabulary to
   customer vocabulary: voice-of-customer mining, review and support-ticket
   mining, sales call language capture, search query language, and message
   testing. For each, what it produces, its known limits, and the failure mode
   of using it naively (for example, adopting customer language that is itself
   wrong about the product).

7. AN OPERATIONAL PRE-DRAFT TEST
   Deliver this as an explicit, checkable procedure. Given a fact set and an
   audience, the system should be able to classify every noun and verb in the
   source material into: reader owns it, reader will accept being taught it, or
   reader will not pay for it. Then a rule for what happens to each class. Make
   it concrete enough to execute without judgment calls where possible.

8. WORKED PAIRS
   At least eight before-and-after pairs using fictional products, spanning:
   B2B SaaS, developer tooling, a consumer app, a professional service, a
   physical product, a financial product, a health product, and an AI product.
   In each pair the "before" must be factually correct and still fail, because
   that is the actual failure being solved. Annotate what the fix changed.

[PASTE THE SHARED OUTPUT CONTRACT BLOCK HERE]

Specific folklore to adjudicate in the appendix, among others you find:
  "Write at a grade 8 reading level."
  "Never use jargon."
  "Readability scores predict conversion."
  "Customers do not care how it works, only what it does."
State where each is true, where it is false, and what the underlying evidence
actually supports.
```

---

## Prompt 3: calls to action, action microcopy, and the decision moment

```text
You are compiling an evidence-graded craft reference on calls to action and
action microcopy for a professional copywriting authority document.

The consuming system currently writes CTAs that name what the interface will do
next rather than what the reader ends up with. It produces labels like "See the
reconciliation flow" and "Explore the platform" while believing them to be
compliant, because its current rule only requires a verb that describes what
happens. The deliverable must replace that rule with something that forces an
outcome.

Research and deliver the following.

1. WHAT A CTA IS ACTUALLY DOING
   Separate the jobs: naming the outcome, setting the commitment level, reducing
   perceived risk, and resolving ambiguity about what happens on click. Document
   which of these the evidence supports as load-bearing.

2. OUTCOME NAMING
   The core requirement. Document the evidence on outcome-framed versus
   action-framed versus artifact-framed button labels. Cover first-person
   framing ("Start my trial" versus "Start your trial" versus "Start trial") and
   what the actual test evidence shows, including the size and reliability of
   reported effects and whether they replicate.

3. COMMITMENT LADDERING
   Match the ask to the reader's evidence state. Document the research on
   escalating commitment, the foot-in-the-door literature and its replication
   status, and the practitioner evidence on micro-conversions. State when a
   low-commitment CTA underperforms because it wastes a ready buyer.

4. FRICTION, COST, AND REASSURANCE
   The sub-label and reassurance line: what it does, what evidence exists for
   it, and how to write it. Cover the documented effects of stating what happens
   next, what is not required, reversibility, and time cost. Cover the research
   on privacy and risk reassurance near a form, including where reassurance
   backfires by raising a concern the reader did not have.

5. CTA COUNT AND COMPETITION
   The evidence on single versus multiple CTAs, primary versus secondary action
   hierarchy, and repeated CTAs down a long page. Include what is known about
   choice overload and its boundary conditions, since it is frequently
   overstated.

6. URGENCY AND SCARCITY
   What the evidence supports, what the effect sizes are, how quickly they decay
   with repeated exposure, and the documented trust and regulatory costs.
   Include the evidence on consumers detecting manufactured urgency. Be strict:
   the consuming system is forbidden from inventing urgency, so this section
   should establish the boundary precisely rather than provide tactics.

7. ANTI-PATTERNS
   A catalog of failing CTA labels with the diagnosis for each: "Learn more",
   "Get started", "Submit", "Explore", "Discover", "Click here", "Request
   information", bare product names, and any others you find documented. For
   each, what the reader cannot infer, and one or more fictional replacements.
   State the narrow conditions under which each anti-pattern is actually correct,
   because several of them are correct sometimes and a blanket ban is wrong.

8. CTA CONSISTENCY ACROSS A SURFACE
   Rarely written about, needed here. What happens when the same action is
   labeled differently in the nav, the hero, the pricing table, and the footer.
   Any evidence on label consistency and recognition.

9. NON-BUTTON ACTION COPY
   Forms, confirmations, errors, permission prompts, empty states, and
   destructive-action confirmations. What the UX writing research and published
   guidelines establish, distinct from marketing CTA practice.

10. AN OPERATIONAL DRAFTING TEST
    Deliver a checkable procedure. At minimum it should include a first-person
    completion test, an outcome-versus-artifact classification, a commitment
    match check against the evidence the page has actually delivered, and a
    consistency check across the surface.

[PASTE THE SHARED OUTPUT CONTRACT BLOCK HERE]

Specific folklore to adjudicate in the appendix, among others you find:
  "Red buttons convert better."
  "Never use the word submit."
  "One CTA per page always outperforms multiple."
  "First person always beats second person on buttons."
  "Above the fold matters."
Several of these trace to single tests on single sites that were then
generalized. Trace them and say so.
```

---

## Prompt 4: audience staging, awareness, sophistication, and message-market match

```text
You are compiling an evidence-graded craft reference on how the same true fact
set must be written differently depending on what the audience already knows and
how many competing claims they have already heard.

The consuming system currently applies one treatment regardless of audience
state. It names mechanisms precisely because precision differentiates, which is
correct for a sophisticated comparing buyer and wrong for someone who does not
yet know the problem has a name. The deliverable must give it a staging model
and a routing rule.

Research and deliver the following.

1. AWARENESS STAGING
   The Schwartz awareness lineage: unaware, problem aware, solution aware,
   product aware, most aware. Document its origin, exactly what it claims, and
   its actual evidential status, which is practitioner rather than experimental.
   Then find the academic work that does or does not support it: consumer
   decision-stage research, information search behavior, and the marketing
   funnel literature. Be honest about the grade. Do not inflate a useful
   practitioner heuristic into evidence it does not have.

2. MARKET SOPHISTICATION
   The Schwartz sophistication stages and their claim: as a market hears more
   claims, direct claims stop working and mechanism, then amplified mechanism,
   then identification become necessary. Document the origin, the practitioner
   evidence, and any academic adjacency, including advertising wearout, claim
   discounting, and persuasion knowledge research. Persuasion knowledge is the
   strongest academic anchor available here. Use it.

3. THE ROUTING CONSEQUENCE
   This is the deliverable's payload. For each combination of awareness stage
   and sophistication stage that occurs in practice, state:
   - what the opening line must do
   - whether the mechanism should be named, gestured at, or omitted
   - whether a proprietary term helps or costs
   - what proof type carries the most weight
   - what the correct commitment level of the CTA is
   Give this as a table plus prose. Mark which cells are evidence-backed and
   which are practitioner inference.

4. DIAGNOSING STAGE FROM AVAILABLE SIGNALS
   Given only a fact set, a product, and a channel, how does a writer infer
   audience stage. Cover the signals that are actually available: traffic
   source, search query intent, channel, referring content, page depth, and what
   the brief states. Give the fallback rule when stage is unknown, and state the
   cost of guessing wrong in each direction.

5. THE COST OF MISMATCH
   Evidence on what actually happens when the message is staged wrong: bounce,
   confusion, distrust, or wasted qualification. Include the research on
   information overload and on premature detail.

6. CATEGORY CREATION AND CATEGORY ENTRY
   When there is no existing comparison vocabulary, the reader has no slot to
   put the product in. Document what is known about category framing,
   positioning against a reference category, and analogy-based comparison. Cover
   the evidence on and against explicit category creation as a strategy.

7. B2B COMMITTEE DYNAMICS
   Where multiple readers with different stages read the same page. What
   research exists on buying groups, the range of roles, and how copy serves an
   economic buyer and a technical evaluator on one surface without failing both.

8. WORKED SET
   Take one fictional product with one fixed fact set. Write the hero headline,
   opening paragraph, and CTA for five different audience states. Annotate what
   changed and why. This single worked set is the most useful artifact in the
   response, so make it thorough.

[PASTE THE SHARED OUTPUT CONTRACT BLOCK HERE]

Specific folklore to adjudicate in the appendix, among others you find:
  "The five stages of awareness are a proven framework."
  "Buyers are 70 percent through the purchase before contacting sales."
  "You must create a new category to win."
  "Nobody reads long copy anymore."
Trace the 70 percent figure in particular. It is repeated constantly and its
provenance is worth documenting precisely.
```

---

## Prompt 5: emotional hooks, narrative transportation, and motivation, with replication status

```text
You are compiling an evidence-graded craft reference on emotional persuasion for
a professional copywriting authority document that has a hard truth constraint:
it may never invent a fact, a feeling, an urgency, a motive, or a risk that the
supplied evidence does not support.

That constraint means this reference must do something unusual. It must document
which emotional mechanisms are real and how to trigger them using only true
material. Tactics that require fabrication are out of scope and should be named
as excluded, not described.

The consuming system currently produces emotionally inert copy: accurate,
mechanically clear, and flat. Fixing it requires knowing which emotional levers
survive contact with a truth constraint.

Research and deliver the following.

1. WHICH EMOTIONS DRIVE WHICH BEHAVIOR
   Move past valence. Document what is known about discrete emotions and their
   behavioral consequences: fear, anger, sadness, anxiety, hope, pride, awe,
   amusement, disgust, and relief. Include the appraisal-tendency work on how
   emotions of the same valence produce opposite decisions. State effect sizes
   and replication status.

2. FEAR AND THREAT APPEALS
   The meta-analytic evidence on fear appeals: when they work, the necessity of
   an efficacy component, and the documented backfire conditions. Give the
   precise conditions under which a threat appeal is legitimate and effective,
   since the consuming system is only permitted to use real, material risks.

3. NARRATIVE TRANSPORTATION AND IDENTIFICATION
   The transportation-imagery research: what transportation is, how it is
   measured, its documented effect on belief change and counterarguing, and the
   boundary conditions. Cover identification with a protagonist and the evidence
   on when a customer story outperforms a claim. Include what is known about
   narrative in commercial versus health and public-interest contexts, because
   most of the strong evidence is from the latter and the transfer is not
   automatic.

4. SPECIFICITY, VIVIDNESS, AND THE IDENTIFIABLE VICTIM
   The research on concrete and vivid detail: when it increases persuasion, when
   it distracts, and the identifiable-victim effect with its replication status.
   Give the practical rule on choosing which detail to make vivid.

5. LOSS FRAMING AND ENDOWMENT
   Prospect theory framing effects in a marketing context specifically, not in
   the original lab paradigm. Document the actual replication picture, including
   the framing meta-analyses and the known variability. Be blunt about how much
   weaker the commercial evidence is than the popular telling.

6. CURIOSITY AND OPEN LOOPS
   Information gap theory, the evidence for curiosity as a motivational state,
   and what is known about open loops in copy and in serialized content. Include
   the cost side: unresolved loops, payoff failure, and trust decay.

7. SOCIAL AND IDENTITY MECHANISMS
   Social proof and its documented boundary conditions and reversals, including
   where descriptive norms backfire. Identity and self-signaling effects. In-group
   framing. For each, state explicitly which uses require fabrication and are
   therefore excluded from the consuming system.

8. EMOTION FROM TRUE MATERIAL ONLY
   The synthesis section. Given a fact set that contains no outcome data, no
   testimonials, and no market claims, what emotional work is still available.
   Cover: the felt texture of a real workflow failure, the recognition response
   to a precisely named situation, the relief of a resolved ambiguity, the
   agency of a reversible decision, and the tension in a real constraint. Give
   drafting procedures for each, with fictional worked examples.

9. WHERE EMOTION IS THE WRONG TOOL
   Document the contexts where emotional framing measurably underperforms plain
   information: high-deliberation purchases, expert audiences, utility
   microcopy, and post-purchase communication. The consuming system needs
   permission to write flat when flat is correct.

[PASTE THE SHARED OUTPUT CONTRACT BLOCK HERE]

Specific folklore to adjudicate in the appendix, among others you find:
  "People buy on emotion and justify with logic."
  "Emotional ads outperform rational ads by 2 to 1."
  "Stories are 22 times more memorable than facts."
  "Loss aversion means losses are twice as powerful as gains."
  "95 percent of purchase decisions are subconscious."
Each of these is repeated constantly in marketing writing. Trace each to origin
and state what the source actually said and measured.
```

---

## Prompt 6: prose rhythm, human voice, stylometry, and encoding a voice profile

```text
You are compiling an evidence-graded craft reference on prose rhythm and
authorial voice, for two purposes.

First, to give an AI writing system positive control over cadence rather than
only a list of words to avoid. Its remaining weakness is not vocabulary, it is
uniform sentence length, uniform clause depth, and uniform paragraph shape.

Second, to specify how a named individual's writing voice can be extracted from
a corpus of their own work, encoded as a compact reusable profile, and applied to
new writing without copying their sentences or fabricating their opinions.

Research and deliver the following.

1. MEASURABLE FEATURES OF PROSE RHYTHM
   From stylometry, forensic linguistics, and readability research, catalog the
   features that are actually measurable and actually vary between authors:
   sentence length mean and variance, sentence length distribution shape, clause
   depth, subordination ratio, function word frequencies, punctuation habits,
   paragraph length distribution, lexical diversity measures and their known
   length-sensitivity problems, contraction rate, question rate, person and
   voice ratios, and any others with documented discriminative power. For each,
   how it is computed and how reliable it is on short texts.

2. WHAT DISTINGUISHES MACHINE PROSE
   The current research on distinguishing model-generated from human text at the
   statistical level, independent of detector products. Specifically: what is
   documented about generated text having lower variance in sentence length,
   flatter perplexity, more uniform structure, and different function word
   distributions. Give measured figures where they exist and state the caveats
   about how quickly this evidence dates.

3. RHYTHM AS CRAFT
   Move from measurement to instruction. The classical and modern writing craft
   on sentence rhythm: variation, the short sentence after long ones, the
   periodic versus loose sentence, cadence at the end of a sentence and the end
   of a paragraph, and what read-aloud testing actually catches. Include what
   evidence exists on reading fluency and on subvocalization. Where evidence is
   absent and this is purely craft tradition, grade it C or D honestly and keep
   it, because the craft is still usable.

4. OPERATIONAL RHYTHM TARGETS
   Deliver checkable targets a writing system can apply: a target range for
   sentence length variance or standard deviation, a rule on paragraph length
   distribution, a rule on consecutive sentences sharing an opening structure,
   and a rule on clause depth. State clearly which targets are evidence-backed
   and which are heuristic. Give the values, not just the concepts.

5. VOICE VERSUS STYLE VERSUS TONE
   Define the distinction precisely and usefully. Voice as the stable properties
   of an author across contexts. Tone as the context-dependent variation.
   Register as the formality axis. State what should be captured in a persistent
   profile and what must be re-decided per document.

6. EXTRACTING A VOICE FROM A CORPUS
   Given a set of an author's own articles, emails, posts, or transcripts, what
   is the defensible procedure for characterizing their voice. Cover:
   - Minimum corpus size for reliable stylometric estimates, with the evidence.
     Be specific about words or documents needed.
   - How to handle mixed registers in one corpus.
   - How to separate the author's voice from their editor's, their employer's
     house style, and the genre conventions of the pieces sampled.
   - Which features are stable enough to be worth recording and which are noise.
   - How to detect that a corpus is too small or too heterogeneous to profile.

7. ENCODING THE PROFILE
   Propose a concrete document format for a reusable voice profile. It must be
   human readable, human editable, and directly usable as instruction by a
   language model. Specify the sections and what goes in each. Cover at minimum:
   measured stylometric values with the corpus they came from, habitual
   structural moves, characteristic openings and closings, vocabulary the author
   uses and reliably avoids, punctuation habits, humor and directness
   calibration, how the author handles uncertainty, how they handle disagreement,
   and a small set of representative excerpts chosen to span the corpus rather
   than to be the best writing in it.

8. APPLYING A PROFILE WITHOUT MIMICRY
   The hard part. How to write in an author's voice without reproducing their
   sentences, importing their factual claims, or inventing opinions they have not
   expressed. Give explicit rules for the boundary. Cover the difference between
   adopting stable habits and copying phrases. Cover what happens when the voice
   profile conflicts with a factual or legal requirement, and state which wins.

9. VERIFYING ADHERENCE
   How to check that a new piece actually matches the profile. Give a checkable
   procedure using the measurable features from part 1. State the limits: what a
   feature match does and does not prove about whether the writing sounds right
   to the author.

10. ETHICAL AND LEGAL BOUNDARY
    Voice profiling of one's own writing versus of a third party. Cover style as
    generally not copyrightable, the distinction between style and expression,
    publicity and endorsement concerns, and the disclosure question when
    generated text is published under a person's name. State the rules a
    responsible tool should enforce, including refusal conditions.

[PASTE THE SHARED OUTPUT CONTRACT BLOCK HERE]

Specific folklore to adjudicate in the appendix, among others you find:
  "Vary your sentence length" as stated without any target.
  "Write like you talk."
  "Average sentence length should be under 20 words."
  "AI detectors work by measuring perplexity and burstiness."
  "Passive voice is bad."
For the detector item, state what the products claim, what the independent
evaluations found, and why the popular explanation is incomplete.
```

---

## After the runs

1. Save each output to `research/dr-<n>-<slug>.md`.
2. Build `research/folklore-ledger.md` by merging all six folklore appendices. Deduplicate. This file is a hard block list: nothing graded D enters the authority document as a rule.
3. Cross-check for contradictions between runs. Prompts 4 and 5 will overlap on persuasion knowledge, and prompts 1 and 6 will overlap on rhythm. Record disagreements rather than resolving them silently.
4. Only then draft `skills/agora/references/agora-craft.md`.
