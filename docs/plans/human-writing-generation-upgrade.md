# Human Writing Layer for article generation

Human Writing Layer is the internal name for guidance applied during Agora's existing planning, outlining, drafting, and revision steps. It is not a separate agent or post-generation product.

## Architecture audit

This repository ships Agora as a skill, not as an application service with a separate article generator. `skills/agora/SKILL.md` routes each request, resolves register and voice, preserves the brief, drafts, revises, and returns ready copy. Ordinary `POSITION`, `SELL`, and `INFORM` work loads `agora-writing-runtime.md` and `agora-marketing-runtime.md`. The deep `agora-marketing.md` reference supplies maintainer doctrine; it is not loaded for ordinary drafting. The canonical `human-voice-editing-reference.md` and existing style audit cover language and structural cleanup. The voice engine measures persistent profiles and task samples; those measurements are guidance, never drafting quotas.

No `AGENTS.md` exists in this repository or its parent workspace directories.

| Stage | Current insertion point | Change |
| --- | --- | --- |
| Intake and research | `SKILL.md` brief preservation, writing runtime requirement map, marketing runtime argument inputs | Distinguish task facts, first-party observations, external sources, and style samples. Preserve attribution and uncertainty. No new ingestion service. |
| Article planning | `SKILL.md` register/voice selection and private reader path; marketing runtime `Build the argument` | Add an article-specific private material map and choose one central reader question or tension from supplied material. |
| Outline | Writing runtime `Make the smallest useful outline`; marketing runtime editorial channel guidance | Let sections follow the weight and sequence of the material. No default three-part structure or equal section lengths. |
| Draft | `SKILL.md` `Draft for the reader`; writing and marketing runtimes | Lead with a supplied observation or concrete situation when useful, attach evidence to interpretations, and prefer first-party details over generic explanation. |
| Revision | Writing runtime editing order, `SKILL.md` silent final passes, existing canonical voice rules | Replace generic passages with supported detail, remove repeated claims and recap sections, and trace facts and user instructions through the final article. |

Style and voice enter before outlining through the explicit user brief, persistent profile, and task-only voice sketch. First-party facts are already treated as a closed-world input. Optional research, claim review, and publication checks remain user-directed. The existing `agora-style-audit` is a language check, not the generation pipeline.

## Implementation

1. Add a concise article-generation procedure to the existing skill and compact runtimes. It applies to long-form editorial and article requests, including `INFORM` and article-shaped `SELL` work, without changing short-form or specialized routes.
2. Keep a private map of supplied observations, examples, numbers, decisions, constraints, opinions, failures, lessons, and external sources. Use each according to its actual status. Voice samples supply style only unless the user also designates their facts for use.
3. Plan from the central question and strongest available material. Give important ideas proportionate space. Draft from observation to support to interpretation and, when the user wants it, a recommendation. These are reasoning moves, not required headings or a rigid order.
4. For sparse briefs, write a useful bounded explanation from what is known. Do not fill gaps with fabricated customer stories, first-person experience, statistics, attributed opinions, or precise events. Explicitly authorized fiction and hypothetical work keep their existing route.
5. Revise in place for specific nouns and verbs, unsupported generality, repeated section shapes, unnecessary conclusions, and legalistic internal vocabulary. Say what happened and who said it instead of narrating `evidence`, `claims`, and `qualifications` in ordinary copy. Preserve the user's requested structure, stance, voice, length, exact wording, and commercial purpose.
6. Document the behavior in `README.md`. Keep this guidance inside generation. Do not add a separate review agent, score, detector, blocking gate, or user-facing editorial judgment.

## Verification

- Add contract tests for the article route and priority rules in the shipped prompt sources.
- Add prospective generation cases for a rich first-party brief, a sparse brief, an explicit structure request, a task voice/style request, and plain word choice. Each case should state observable pass criteria and prohibited inventions.
- Run the relevant contract tests, `npm run validate`, and the repository checks. Generative quality still requires a future blind run of the prospective cases; static tests cannot prove model behavior.

## Archive interpretation

The attached archive proposes post-generation review, scores, and rewrite suggestions. The current user request supersedes that design. Only its useful writing principles, such as specificity, evidence placement, and deliberate structure, inform the Human Writing Layer.
