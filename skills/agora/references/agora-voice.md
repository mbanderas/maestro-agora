# Agora voice authority

This reference governs `VOICE`: building a measured voice profile from a corpus, writing to that profile, and checking a draft against it. Load it only when the task builds, applies, inspects, or checks a voice profile.

Voice is a modifier, never a licence. It changes how a supported proposition is expressed. It cannot change the proposition, and it cannot change what the evidence permits. Read [agora-marketing.md](agora-marketing.md) for the truth rules that outrank everything here, and [agora-craft.md](agora-craft.md) for the rhythm controls a profile replaces.

## Contents

- [What VOICE is](#what-voice-is)
- [Where profiles live](#where-profiles-live)
- [Corpus admission](#corpus-admission)
- [What gets measured](#what-gets-measured)
- [The profile format](#the-profile-format)
- [Writing to a profile](#writing-to-a-profile)
- [Voice against the tell gate](#voice-against-the-tell-gate)
- [Checking adherence](#checking-adherence)
- [Refusals](#refusals)

## What VOICE is

`VOICE` sits alongside `POSITION`, `SELL`, `INVEST`, `INFORM`, and `TRANSACT` with one difference: it is not mutually exclusive with them. Every other mode answers what job the copy is doing. `VOICE` answers whose habits the copy is written in, and it rides on top of whichever mode was already selected.

The surface:

```text
voice build --name <slug> --from <corpus path or URL>
  Reads the corpus, measures it, writes the profile, and reports both what it
  measured and what the corpus was too small or too narrow to measure.

voice list
  The profiles that exist, with corpus size, register coverage, and last update.

<mode> --voice <slug>
  Ordinary Agora work, with the profile loaded at the human-voice stage.

voice check --voice <slug> <draft path>
  Measures the draft against the profile and reports the drift, largest first.
```

Every one of these runs through the shipped measurement engine rather than through model judgment:

```text
npx -p @maestroagora/agora agora-voice build --name <slug> --from <path> [--from <path>]...
npx -p @maestroagora/agora agora-voice list
npx -p @maestroagora/agora agora-voice check --voice <slug> <draft path>
npx -p @maestroagora/agora agora-voice default --voice <slug>
```

`--register <name>` labels every `--from` that follows it, `--store <path>` overrides the profile directory, and `--json` returns machine-readable output. Markdown, plain text, and HTML are read. Binary document formats are refused by name rather than partially extracted, because every admission threshold counts clean words and a partial extraction would move all of them without saying so.

`voice build` is a measurement task, not a description task. A model asked to describe an author's voice writes flattery. The profile leads with numbers computed from the corpus, because a number is checkable and a later draft can be measured against it. Adjectives belong in the interpretation sections, underneath the measurements they interpret.

**A profile the engine did not produce is not a profile.** Do not write one by reading a corpus and describing what you notice, and do not load a hand-written file as though it were measured. Where the engine cannot run, say so and work without a profile.

**Boundary:** the measurement is only as good as the pipeline. Stylometric values move when the tokenizer, sentence segmenter, parser, or normalization rules change ([Grieve](https://doi.org/10.1093/llc/fqm020)). Freeze the pipeline in the profile and use the identical one when checking a draft. A comparison across two pipelines is not a comparison.

## Where profiles live

Profiles are stored at `~/.agora/voices/<slug>.md`, with `~/.agora/voices/index.json` as the registry. Never inside the skill directory.

A third file, `~/.agora/voices/<slug>.measurements.json`, carries the machine-readable feature values that `voice check` compares against, so the human-readable profile never has to be parsed back. It also carries the phrase-overlap index as truncated hashes of each token run rather than as text, so the profile store never becomes a second copy of the author's corpus and cannot serve as a phrase reservoir.

This is not a preference. The documented update path replaces the installed skill directory, so a profile written under `~/.claude/skills/agora/` or `~/.agents/skills/agora/` is destroyed on the next update, silently, and the user loses hours of work. `~/.agora/` also survives switching hosts, so a profile built under one client is available from another, which matches how the package already installs to both.

`--store <path>` overrides the location for a project-local profile committed beside a repository. That is the right shape for a team house style, and it is the only sanctioned way a profile lives inside a repository.

**Boundary:** a project-local profile is a house style, not a person. Do not label it with an individual's name unless that individual authorized it, and do not carry an individual profile into a shared repository without their agreement.

## Corpus admission

Measure **clean author-controlled words**: the author's own prose after removing quotations, forwarded text, copied source material, boilerplate, templates, legal disclaimers, automatic signatures, and house-written headlines. Every threshold below counts clean words, never raw ones.

| Clean words | Disposition | Basis |
|---|---|---|
| Under 5,000 | **Refuse to certify a profile.** Report what was found and what the corpus needs. | **B.** Controlled sample-size experiments put minimum stable stylometric samples at roughly 2,500 words for some corpora and around 5,000 for most modern-language English text; below the stable region estimates are unreliable rather than merely noisy ([Eder](https://doi.org/10.1093/llc/fqt066)). |
| 5,000 to 10,000 | Build with `confidence: low`. Restrict the measured section to features that stay stable on short texts, and write a loud `## Not captured`. | **B**, from the same sample-size experiments ([Eder](https://doi.org/10.1093/llc/fqt066)). |
| 10,000 and above | Production minimum for a persistent profile. | **C.** More than 10,000 words per author is the traditional reliable minimum in attribution research ([Luyckx and Daelemans](https://aclanthology.org/C08-1065/)). |
| 20,000 to 30,000 | Preferred tier. Enough to estimate tails, rare punctuation, paragraph distributions, and more than one register without one document dominating. | Governance default, chosen as an engineering target and not an empirical threshold. |

**Boundary on all four rows:** the word counts come from authorship-attribution research on literary and journalistic corpora, not from a controlled study of generative voice synthesis. Ten thousand contaminated, single-register, heavily edited, or formulaic words are still unusable, and the count is a floor rather than a certificate.

Four structural requirements sit on top of the word count. Each is a **governance default**, chosen so the build has something checkable to enforce.

- **Document independence.** Require at least 10 independently composed documents, with no single document supplying more than 25 percent of the clean tokens. Governance default. A single long article is not equivalent to many independent samples, because cross-document stability is the thing being measured.
- **Register subprofiles.** A register earns its own numbers only at 2,500 clean words across at least 3 independent documents. Governance default. Below that, record qualitative observations and mark every number provisional.
- **Feature stability.** A candidate global feature fails persistence when register accounts for more than 30 percent of its document-level variance, or when deleting one document moves its pooled estimate by more than 20 percent. Both figures are governance defaults. A failing feature moves into a register override or is dropped. The variance rule is skipped for a feature whose spread across the whole corpus is under 5 percent of its own pooled value, because a feature that barely moves has no meaningful spread for register to explain and the ratio becomes unstable at that scale. That 5 percent is also a governance default.
- **Heterogeneity stop.** Mark the corpus not profileable as one voice when more than a third of the proposed core features fail the stability rule, when collaborative or editorial authorship cannot be separated, or when the clean corpus falls below the certification floor after exclusions. Offer to build two profiles rather than averaging two registers into a voice that belongs to nobody. Governance default.

**Rule [B]: separate stable author effects from topic and register before calling anything voice.** Topic-specific information contaminates authorship features, and situation-conditioned variation is a large part of what stylometry actually measures ([Stamatatos](https://aclanthology.org/E17-1107/), [Grieve](https://doi.org/10.1515/cllt-2022-0040)). **Boundary:** a writer who only ever writes one narrow genre cannot supply enough variation to separate personal voice from that genre. Label the profile genre-bound and say so in `## Not captured`.

**Rule [B]: do not assume strong in-domain results prove cross-genre stability.** Attribution degrades substantially when training and test contexts diverge ([Stamatatos](https://aclanthology.org/E17-1107/)). **Boundary:** a profile intended for one fixed genre does not need to generalize, and marking it single-genre is a complete answer.

**Separate the author from the editor and the employer.** Where drafts and published versions both exist, compute the deltas; any feature editors repeatedly change is editor-sensitive and stays out of the persistent profile unless the author deliberately adopts it. Where only published work exists, compare against other writers at the same outlet and mark broadly shared features as house-style confounds. **Boundary:** this is a governance procedure with no measured effect size. It is here because an unseparated profile silently models the publication rather than the person.

## What gets measured

Stylometry has no single fingerprint. Attribution works by combining partially discriminative feature families, and topic and register are the major confounders ([Grieve](https://doi.org/10.1093/llc/fqm020), [Stamatatos](https://aclanthology.org/E17-1107/)).

**Rule [B]: treat function words, punctuation, syntax, and character patterns as a bundle. Never declare one of them a voice fingerprint** ([Grieve](https://doi.org/10.1093/llc/fqm020), [Stamatatos](https://aclanthology.org/E17-1107/))**. Boundary:** a constrained genre with plenty of data can make one family highly predictive without making it a general property of that author.

**Rule [B]: store distributions, not only averages.** For sentence and paragraph length, record at least the median, the standard deviation, the tenth and ninetieth percentiles, and the binned shape alongside the mean. Distributional spread separates texts whose central tendencies overlap ([Munoz-Ortiz et al.](https://doi.org/10.1007/s10462-024-10903-2)). **Boundary:** percentiles and shape statistics are unstable on very few observations, so a short corpus gets a median and a mean and an explicit note that the tails are unknown.

**Rule [A]: never compare raw type-token ratio across unequal text lengths.** The measure falls mechanically as texts grow, so an unequal comparison is an artifact ([Covington and McFall](https://doi.org/10.1080/09296171003643098)). Use a moving-window measure or a decay-based one instead ([McCarthy and Jarvis](https://doi.org/10.3758/BRM.42.2.381)). **Boundary:** raw ratio becomes interpretable again when every sample is truncated to the same sufficiently large token count, though sampling noise remains.

The feature families worth recording, and what each is good for:

| Family | Records | Reliability note |
|---|---|---|
| Sentence length | Mean, median, standard deviation, coefficient of variation, percentiles, binned shape | The clearest check for uniform pacing. Unstable below a few dozen sentences. |
| Clause structure | Finite clauses per sentence, subordination ratio, clause-depth shares | Genre-sensitive and parser-sensitive. Freeze one definition and never compare across parsers. |
| Function words | Frequencies per thousand tokens for articles, prepositions, auxiliaries, conjunctions, pronouns | Among the most established families and comparatively usable on shorter samples ([function-word adjacency networks](https://arxiv.org/abs/1406.4469)). Still moved by register. |
| Punctuation | Commas, semicolons, colons, parentheses, ellipses, exclamation marks, per thousand tokens | Discriminative, and an editor can overwrite it almost completely. Rare marks need a large corpus. |
| Paragraph shape | Words and sentences per paragraph, one-sentence-paragraph share, distribution | Useful for synthesis, weak as identity evidence, because platform and editing dominate it. |
| Lexical diversity | Moving-window ratio and a decay-based measure, never raw ratio alone | See the rule above. |
| Person and stance | First, second, and third person rates; hedging and modal profile; certainty behavior | Heavily conditioned by genre. Measure per register. |
| Sentence openings | Class of the first constituent, and the transition pattern between classes | The best available handle on perceived repetitiveness that length statistics miss. |
| Contractions | Rate within contexts where both forms were grammatical, not raw count | Only comparable within a matched register. |

**Boundary on the whole table:** every one of these is descriptive. None of them establishes that a draft sounds right to its author, and a feature match is not approval. Grade B, from the same attribution and register work cited above.

Anything the corpus is too small to estimate is written as insufficient data. It is never guessed, never interpolated, and never quietly omitted.

## The profile format

A profile is human-readable Markdown with YAML frontmatter, stored at the path above. Measurement, interpretation, calibration, and source excerpts stay separate. Never collapse them into a sentence like write exactly like this person.

```markdown
---
name: <slug>
created: <date>
updated: <date>
corpus:
  documents: <count>
  clean_words: <count>
  raw_words: <count>
  registers: [<register>, <register>]
  excluded: [<what the cleaning removed, with counts>]
pipeline:
  tokenizer: "<frozen implementation and version>"
  segmenter: "<frozen implementation and version>"
  lexicon: "<frozen implementation and version>"
  parser: "<frozen implementation and version>"
confidence: low | medium | production
certified: true | false
---

# Voice profile: <slug>

## Measured
A table of features with the value, the corpus spread, and the register it
was computed on. Insufficient data is written, not guessed.

## Structural habits
How this author opens. How they close. Where the qualifier goes. Whether the
conclusion is front-loaded. How a list is handled. How long before the first
concrete example.

## Vocabulary
Owned: words and constructions recurring across genres, with frequency and one
example line each. This list is an allowlist against the AI-vocabulary gate.
Avoided: words frequent in comparable writing and absent here. Record an
avoidance only from a stated preference or a stable alternative in repeated
eligible contexts. Absence alone is weak evidence.

## Calibration
Directness, humor, certainty, disagreement, and authority, each on a stated
scale with an example at this author's level.

## Excerpts
Six to ten passages spanning the corpus by register and date, each labelled
with what it demonstrates. Include at least one weaker passage.

## Not captured
What the corpus could not tell us, which genres are missing, and what the
author should supply to improve the profile.
```

Two sections carry more weight than they look.

**`## Excerpts` is stratified, not curated.** Select by register, date, and document type rather than choosing the author's best passages. A profile built only from an author's strongest work produces drafts the author does not recognize, because it encodes an exceptional performance as the central tendency. **Boundary:** governance default, no measured effect. Keep excerpts short enough to calibrate and too short to serve as a phrase reservoir.

**`## Not captured` is not optional.** A profile that hides its own gaps produces confident wrong output, and the gaps are the part a user cannot infer from the rest of the file. **Boundary:** none. A profile without this section is not a profile.

## Writing to a profile

**The content firewall.** A profile authorizes how a proposition is expressed. It never authorizes the proposition. Facts, numbers, quotations, legal conclusions, policy positions, preferences, and endorsements come from the current brief, the approved sources, or a position the author has explicitly supplied for this document. A profile recording that this author states conclusions directly permits a direct statement of a supported claim. It never permits inventing what they think.

Keep supplied product actions at their stated scope. `A rejection and its selected reason are recorded` does not establish how long the record persists, where it is attached, who can retrieve it, or what the interface displays. Voice work may rephrase the supplied action. It may not fill operational gaps with plausible product behavior.

**Transfer habits, not material.** Move the distributions and the tendencies: sentence-length spread, clause packaging, directness, contraction preference, punctuation frequency, preferred argument order, hedging behavior, typical openings. Do not move distinctive metaphors, slogans, signature phrases, anecdotes, factual examples, or source sentences. **Boundary:** the line is not always obvious. When a construction is both habitual and distinctive, abstract it before use: this author opens with a concrete contradiction is usable; reuse their particular contradiction is not.

**Anti-mimicry checks.** After generating, flag every exact overlap of 8 or more consecutive tokens with the source corpus, excluding demonstrably generic strings, and review any shorter phrase that is unusual or repeatedly associated with the author. The token count is a **governance default** and an engineering review trigger; it is not a legal safe harbour, and no word count is one. Also review structural overlap: a sentence preserving the source's sequence of images and syntactic turns can be too close after every word has been swapped. **Boundary:** an overlap flag is a prompt to look, not a verdict. Common phrasing in a technical domain will trip it.

**Profile-first generation.** Where the architecture allows it, generate from the compact profile rather than re-injecting the whole corpus into context. Excerpts are for calibration and verification, not sentence completion. **Boundary:** governance procedure, no measured effect. It is here because corpus-in-context generation is how phrase reuse happens.

## Voice against the tell gate

Voice enters at **level 6** of the conflict hierarchy, with compression and channel fit. It never rises above it. Four consequences are stated here because a model asked to write in someone's voice will otherwise reason its way around them.

1. **Voice never licenses a claim the facts do not support.** Where the author habitually writes with high certainty and the evidence is thin, the evidence wins and the profile is overridden for that sentence. Note the override rather than hiding it.
2. **Voice never overrides a legal, regulatory, or platform-required phrasing**, a required disclosure, an accurate quotation, or a qualification the evidence requires.
3. **Voice never overrides the U+2014 ban.** That constraint is immutable and sits at level 1. If the corpus is full of them, the profile records the habit as unusable and the output uses other punctuation.
4. **Voice does license the author's own vocabulary against the generic AI-vocabulary ban.** This is a real exception and it needs writing down.

### The owned-vocabulary exception

The AI-tell gate and a voice profile genuinely conflict, and the conflict is not hypothetical. If an author writes `leverage` constantly across years and genres, the generic ban strips the word, the draft comes back in nobody's voice, and the feature the user paid for has been removed by a rule meant to make writing sound human.

**The resolution: a profile's `## Vocabulary` owned list is an explicit allowlist that suppresses the generic AI-vocabulary ban for those specific words, and only those.** Everything not on the list stays banned. The allowlist is scoped to the profile, not to the session, and it does not travel to work written without that profile.

Three conditions bound it:

- **The word has to be on the list because it was measured.** A word recorded from frequency across genres qualifies. A word added because the draft wanted it does not.
- **It suppresses the vocabulary ban only.** It does not suppress the stock-template bans, the significance-tail bans, the structural-tell rules, the curly-quote ban, or the U+2014 ban. Those are not vocabulary.
- **It never converts a banned claim into an acceptable one.** `Revolutionary` on an owned list permits the word where the facts already support the claim it makes. It does not make the claim supportable.

Before drafting, test the measured owned list against the supported propositions. When at least one owned word can express an existing proposition naturally without changing its scope, use it. Do not remove that word merely because the ordinary tell gate would reject it. An owned word is optional only when no supported sentence can carry it. Do not use owned vocabulary to manufacture a benefit, causal result, quality judgment, or product position merely to demonstrate profile adherence. Test the sentence without the owned word first; if the underlying claim is unsupported, omit the claim and accept a lower vocabulary match.

For a production profile whose brief explicitly supplies measured owned vocabulary, treat that test as a required pre-draft step. If `leverage` can truthfully replace `use` in a sentence about an existing input, the word survives. If `robust` would add an unsupported quality judgment, it does not. Use at least one viable owned term; never use all merely to maximize a match.

Sentence-length and paragraph-shape measurements are distributions, not quotas or stock structures. Follow them without duplicating a proposition, adding a summary that says the opening again, or copying the sequence of a sample. The structural-tell gate fails identifiable canned framing, significance tails, decorative triads, and repeated stock templates. It does not fail a draft merely because its sentence and paragraph lengths resemble the authorized profile.

**Boundary:** an owned-vocabulary list assembled from a thin corpus is a licence built on noise. Below the certification floor, no allowlist is issued at all, because a word cannot be shown to recur across genres in a corpus that has one.

## Checking adherence

`voice check` computes the same features on the draft, using the same frozen pipeline, and reports drift against the profile with the three largest deviations first.

**Rule [B]: do not make a strong style-match claim on a short draft merely because its feature vector is close.** Attribution estimates are unstable below corpus-dependent sample lengths in the low thousands of words ([Eder](https://doi.org/10.1093/llc/fqt066)). **Boundary:** a short piece can still be checked for local deviations such as punctuation, sentence openings, contractions, and cadence. It simply does not receive a confidence score.

| Draft length | Permitted conclusion |
|---|---|
| Short drafts below roughly 500 words | Local checks only: sentence lengths, openings, punctuation, contractions, paragraph shape, phrase overlap. No global match score. Governance default. |
| Roughly 500 to 2,000 words | Compare the common features with wide tolerances and label the result provisional. Governance default. |
| Roughly 2,000 to 5,000 words | Compare the full feature set and report the sampling uncertainty alongside it. Governance default. |
| Above 5,000 words | Full distributional comparison is defensible when the register matches and the reference corpus is itself adequate. **B**, with the genre limitation above ([Eder](https://doi.org/10.1093/llc/fqt066)). |

The check runs against the correct register subprofile, never only the global corpus. A wrong-register comparison produces no score at all.

Tolerances are **governance defaults**, engineering settings rather than published cutoffs: review any individual core feature deviating more than 1.5 standard deviations from the profile, target a median absolute deviation across core features at or below 0.75, and treat more than 20 percent of core features in review as a failed match. Each of those three numbers is a governance default.

**Rule [B]: a feature match does not prove the writing sounds right to its author.** Stylometry is optimized for measurable differentiation, not subjective approval ([Grieve](https://doi.org/10.1093/llc/fqm020), [Grieve](https://doi.org/10.1515/cllt-2022-0040)). **Boundary:** repeated author feedback can itself become profile data over time, but it stays a separate validation layer and never becomes the stylometric score.

Report three questions separately, because they are three different things and merging them is how a check becomes a claim it cannot support:

```text
Rhythm and syntax match: <within profile | drifted, with the largest deviations>
Phrase-overlap check:    <clear | flagged, with the passages>
Content provenance:      <every checkable claim traced to the brief or a source>
Author approval:         <not established by this tool>
```

Only the person can answer the last one. The tool never asserts it.

**Never treat a detector score as evidence of authorship.** Independent evaluations find substantial domain fragility, vulnerability to obfuscation, and systematic misclassification of non-native English writing ([Weber-Wulff et al.](https://arxiv.org/abs/2306.15666), [Liang et al.](https://www.sciencedirect.com/science/article/pii/S2666389923001307)). Grade A. **Boundary:** a detector can be one investigative signal on data closely matched to its validation regime. It is never the finding.

## Refusals

Building a profile begins with one question that is never skipped: is this the user's own writing, or writing they hold the right to model.

**Refuse to build or apply a profile of a named third party where the purpose is publication under that person's name.** Style in the abstract is not owned, and modeling a public writer's technique to improve your own work is ordinary craft ([McMahon v. Prentice-Hall](https://law.justia.com/cases/federal/district-courts/FSupp/486/1296/1754213/), [Copyright Office Circular 33](https://www.copyright.gov/circs/circ33.pdf)). Producing text designed to pass as a specific real person's authored work is a different act, and the correct response is to decline it rather than negotiate the terms. **Boundary:** the refusal is about attribution, not analysis. Scholarship, criticism, attribution research, and high-level stylistic description of a public writer remain available, and so does learning from a writer you admire in work published under your own name.

Four further refusals, each independent of the first:

- **False endorsement.** Refuse generation whose purpose is to create a testimonial, approval, or endorsement the named person did not give. Rules on fake and misattributed testimonials and on confusion about affiliation apply in their own right ([FTC final rule](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), [15 U.S.C. 1125](https://www.law.cornell.edu/uscode/text/15/1125)).
- **Fabricated positions.** Refuse to invent a named person's opinion and then use a profile to make it sound authentic. A style profile is evidence about expression and never about belief.
- **High-stakes attribution.** Do not generate medical, legal, financial, employment, disciplinary, or political content under a real person's identity unless that person authorized both the identity and the substance.
- **Undisclosed ghostwriting.** Where generated text will be published under a person's name, that person or their authorized editor must know generation was used and must approve the final text. Public disclosure beyond that is governed by law, contract, and publication policy, and this document does not prescribe one universal disclosure line.

Style transfer is not a defence for reproducing protected expression, and there is no word count that makes copying safe ([Copyright Office Circular 33](https://www.copyright.gov/circs/circ33.pdf), [Copyright Office on AI](https://www.copyright.gov/ai/)). Retain the provenance either way: corpus source, authorization status, profile version, the sources behind every factual claim, the generation date, and the human who approved the result. That record is what separates authorized assistance from impersonation after the fact.
