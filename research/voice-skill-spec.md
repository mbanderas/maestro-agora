# Agora voice synthesis: design spec

Decisions are made, not offered. Rationale is stated so any of them can be overturned deliberately.

## What the user gets

A user feeds Agora a set of things they wrote. Agora reads them, measures them, and writes a voice profile file. Later, the user says "write this in my voice" and Agora loads the profile and writes to it.

```text
/agora voice build --name mark --from ./my-articles/
  -> reads the corpus, writes ~/.agora/voices/mark.md, reports what it measured
     and what it could not measure with the corpus given

/agora voice list
  -> the profiles that exist, corpus size, last updated

/agora sell --voice mark  Write the hero for this product from these facts.
  -> normal Agora, with the profile loaded at the human-voice stage

/agora voice check --voice mark ./draft.md
  -> measures the draft against the profile, reports where it drifted
```

## Decision 1: a mode inside Agora, not a separate skill

`VOICE` becomes a sixth entry alongside POSITION, SELL, INVEST, INFORM, TRANSACT, with one difference: it is not mutually exclusive with them. `--voice <name>` is a modifier on any mode.

Why: one install, one slash command, one place the truth rules live. A separate skill would need its own copy of the claim discipline or would risk being used without it, which is exactly how a voice tool becomes a fabrication tool.

## Decision 2: profiles live outside the skill directory

Storage path: `~/.agora/voices/<slug>.md`, with `~/.agora/voices/index.json` as a lightweight registry.

Why this matters, specifically: the documented update path is

```sh
npx -y @maestroagora/agora@latest --target universal --scope user --force
```

`--force` replaces the destination directory. Any profile stored under `~/.claude/skills/agora/` or `~/.agents/skills/agora/` gets destroyed on the next update, silently, and the user loses work they spent an hour producing. Profiles must live somewhere the installer never touches.

`~/.agora/` also survives switching hosts. A profile built while using Claude Code is available from Codex, which matches how the rest of the package already installs to both.

Override with `--store <path>` for a project-local profile committed alongside a repo, which is the right shape for a team house style.

## Decision 3: the profile is measured, not vibes

An LLM asked to "describe this author's voice" writes flattery. The profile must lead with numbers computed from the corpus, because numbers are checkable and a later draft can be measured against them.

Profile format:

```markdown
---
name: mark
created: 2026-08-09
updated: 2026-08-09
corpus:
  documents: 14
  words: 21430
  genres: [blog post, product page, newsletter]
  date_range: 2024-11 to 2026-07
  excluded: [2 documents, heavily edited by a third party, flagged by user]
confidence: medium
---

# Voice profile: mark

## Measured

| Feature | Value | Corpus spread |
|---|---|---|
| Sentence length, mean | 14.2 words | |
| Sentence length, standard deviation | 8.9 | |
| Sentences under 8 words | 24% | |
| Sentences over 30 words | 6% | |
| Paragraph length, mean | 2.4 sentences | |
| Paragraphs of one sentence | 31% | |
| Contraction rate | 0.71 per 100 words | |
| First person singular | 1.9 per 100 words | |
| Second person | 3.4 per 100 words | |
| Questions | 1.1 per 100 sentences | |
| Passive constructions | 4% of clauses | |
| Semicolons | 0.0 per 1000 words | |
| Parentheticals | 2.1 per 1000 words | |
| Type-token ratio, 1000-word windows | 0.44 | |

Any feature the corpus was too small to estimate is marked "insufficient data"
rather than guessed.

## Structural habits

How this author opens. How they close. Where they put the qualifier. Whether
they front-load the conclusion. How they handle a list. How long they wait
before the first concrete example.

## Vocabulary

Owned: words and constructions that recur across genres and read as this
author's. With frequency and an example line for each.

Avoided: common words this author never uses, computed as words frequent in
comparable writing and absent here. This section is more diagnostic than the
owned list and is usually skipped by naive voice work.

## Calibration

Directness, on a stated scale with an example at this author's level.
Humor: present or absent, and what kind.
Certainty: how they hedge, and what they refuse to hedge.
Disagreement: how they push back.
Authority: whether they cite, assert, or show.

## Excerpts

Six to ten passages chosen to span the corpus, not to be the best writing in it.
Each labeled with what it demonstrates. Deliberately includes at least one
weaker passage, because a profile built only from the author's best work
produces drafts the author does not recognize.

## Not captured

An explicit list. What the corpus could not tell us, what genres are missing,
and what the author should feed in to improve the profile.
```

The `## Not captured` section is not optional. A profile that hides its own gaps produces confident wrong output.

## Decision 4: voice sits at level 6 of the conflict hierarchy

Agora already has the hierarchy (`SKILL.md:36-44`). Voice slots in at level 6, "compression and human voice", and never higher.

Consequences, stated explicitly in the skill text so the model cannot reason around them:

- Voice never licenses a claim the facts do not support. If the author habitually writes with high certainty and the evidence is thin, the evidence wins and the profile is overridden for that sentence.
- Voice never overrides a legal, regulatory, or platform-required phrasing.
- Voice never overrides the U+2014 ban, which is an immutable output constraint.
- Voice never reintroduces a banned AI tell just because the corpus contains it. If the author writes "leverage" constantly, the profile records it as owned vocabulary and Agora may use it, because it is that author's word. That is a real exception to the AI-vocabulary gate and needs writing down, or the gate will strip the author's actual voice.

That last point is the interesting one. The AI-tell gate and a voice profile genuinely conflict. Resolution: the profile's owned-vocabulary list is an explicit allowlist that suppresses the generic ban for those specific words, and only those.

## Decision 5: the anti-impersonation boundary

The build command accepts a corpus and asks one question it will not skip: is this the user's own writing, or writing they have the right to model.

Refuse to build a profile that is presented as a named third party's voice for the purpose of publishing under that person's name. Style itself is not owned and modeling a public writer's technique for one's own work is ordinary craft. Producing text designed to pass as a specific real person's authored work is not, and the skill should decline it rather than negotiate.

This is consistent with what Agora already bans: fabricated human texture, invented credentials, invented motives.

## Decision 6: minimum corpus and honest refusal

Below a threshold the profile is noise dressed as measurement. The research pass settled this and the numbers below replace the provisional ones originally written here, which set the floor far too low.

Measure **clean author-controlled words**: the author's own prose after quotations, forwarded text, copied source material, boilerplate, templates, legal disclaimers, automatic signatures, and house-written headlines have been removed.

- Under 5,000 clean words: refuse to certify a profile. Sample-size experiments put minimum stable stylometric samples at roughly 2,500 words for some corpora and around 5,000 for most modern-language English text; below the stable region, estimates are unreliable rather than merely noisy. Grade B.
- 5,000 to 10,000 clean words: build with `confidence: low`. Restrict the measured section to features stable on short texts and write a loud `## Not captured`.
- 10,000 clean words: the production minimum for a persistent profile. Grade C.
- 20,000 to 30,000 clean words: preferred tier. Enough to estimate tails, rare punctuation, paragraph distributions, and more than one register without a single document dominating. Engineering target, not an empirical threshold.

Require at least **10 independently composed documents**, with no single document supplying more than **25 percent** of the clean tokens. A 20,000-word article is not equivalent to twenty independent 1,000-word samples for measuring cross-document stability.

A register earns its own numerical subprofile only at **2,500 clean words across at least 3 independent documents**. Below that, record qualitative observations and mark the numbers provisional.

**Stability rule.** A candidate global feature fails persistence if register accounts for more than 30 percent of its document-level variance, or if deleting one document moves its pooled estimate by more than 20 percent. Such a feature belongs in a register override or is dropped.

**Heterogeneity stop rule.** Mark the corpus "not profileable as one voice" when more than a third of the proposed core features fail the stability rule, when collaborative or editorial authorship cannot be separated, or when the clean corpus falls below 5,000 words after exclusions. Offer to build two profiles rather than averaging two registers into a voice that belongs to nobody.

**Separate the author from their editor and their employer.** Where drafts and published versions both exist, compute the deltas; any feature editors repeatedly change is editor-sensitive and stays out of the persistent profile unless the author adopts it deliberately. Where only published work exists, compare against other writers at the same outlet and mark broadly shared features as house-style confounds. Cross-genre voice stability cannot be assumed from strong in-domain results.

## Decision 7: adherence checking is measurement plus judgment

`/agora voice check` computes the same features on the draft and reports drift against the profile with tolerances. It states plainly that a feature match does not prove the writing sounds right to the author, and it puts the three largest drifts first.

This is also the eval mechanism. A blind eval case can build a profile from a held-out corpus, generate against it, and measure adherence without a human in the loop.

## Repo work required

New file `skills/agora/references/agora-voice.md`. That breaks the strict three-file root, so the same commit must update:

| File | Change |
|---|---|
| `scripts/validate.mjs:13` | add to the allowlist |
| `scripts/validate.mjs:96-106` | add the path check and content read |
| `scripts/validate.mjs:145` | add the relative link assertion for the new reference |
| `tests/behavior-contract.test.mjs` | add the new reference to the expected set near line 297 |
| `README.md:188` | update the skill tree diagram |
| `skills/agora/SKILL.md` | VOICE mode, the `--voice` modifier, the level-6 hierarchy entry, the owned-vocabulary exception to the AI-tell gate, and progressive loading rules for the new reference |
| `skills/agora/agents/openai.yaml` | mirror whatever mode surface it declares |

`package.json` `files` already ships `skills/agora` wholesale. No change.

## Build order

1. Deep research prompt 6 returns. It carries the corpus-size threshold, the feature list, and the profile format validation.
2. Write `references/agora-voice.md` from it.
3. Wire `VOICE` into `SKILL.md` and update the validator in the same commit so CI never sees a broken intermediate state.
4. Implement the measurement. This is the one part of Agora that wants real computation rather than model judgment, so it should be a small deterministic script rather than an instruction to eyeball sentence length.
5. Add blind eval cases: build-from-corpus, generate-with-voice, voice-versus-truth conflict, and owned-vocabulary-versus-AI-tell-gate conflict.
