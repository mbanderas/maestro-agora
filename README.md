<p align="center">
  <img src="assets/maestro-agora-banner.png" alt="The Maestro mascot writing with a gold fountain pen as evidence cards become a finished page" width="100%" />
</p>

<h1 align="center">Maestro: Agora</h1>

<p align="center"><strong>Verified truth, conducted into copy.</strong></p>

<p align="center">
  <a href="https://github.com/mbanderas/maestro-agora/actions/workflows/validate.yml"><img alt="Validation status" src="https://github.com/mbanderas/maestro-agora/actions/workflows/validate.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@maestroagora/agora"><img alt="npm version" src="https://img.shields.io/npm/v/@maestroagora/agora" /></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-7c3aed" /></a>
</p>

Agora is a portable Agent Skill for truthful persuasion. It turns verified company and product truth into a supported path from a real stake to a defensible belief. The method covers buyer, investor, company-positioning, informational, and transactional copy. It never authorizes a claim the proof cannot carry.

Give it the real situation, evidence, material limits, and requested surface. Agora returns ready-to-use copy first and puts any material verification need after the draft.

**Related Maestro tools:**

- **[Maestro Frontier](https://github.com/mbanderas/maestro):** Fuses the model CLIs you already run into one judged, grounded answer.
- **[Maestro Agora](https://github.com/mbanderas/maestro-agora):** Turns verified truth into proof-bounded arguments for buyers and investors, including objective company positioning.
- **[Maestro CostGuard](https://github.com/mbanderas/costguard):** Audits CI and cloud infrastructure for cost leaks and shows what to fix.

## Install

One command installs Agora for the shared Agent Skills path and Claude Code:

```sh
npx -y @maestroagora/agora
```

The default user install writes the same reviewed skill to:

- `~/.agents/skills/agora` for Codex and Agent Skills-compatible tools.
- `~/.claude/skills/agora` for Claude Code.

Choose a native target or project-local scope when you need one:

```sh
npx -y @maestroagora/agora --target cursor --scope project
npx -y @maestroagora/agora --target codex,claude --scope user
npx -y @maestroagora/agora --target universal --dry-run
```

Supported targets are `universal`, `shared`, `codex`, `claude`, `cursor`, `gemini`, `copilot`, and `windsurf`. Add `--force` only when you intend to replace a different copy at the exact `agora` destination.

### Native plugin install

Claude Code:

```text
/plugin marketplace add mbanderas/maestro-agora
/plugin install maestro-agora@maestro-agora
```

Codex CLI:

```sh
codex plugin marketplace add mbanderas/maestro-agora
codex plugin add maestro-agora@maestro-agora
```

The npm installer is the broadest route across IDEs. The native plugin commands install the repository's matching Claude or Codex manifest.

## Use Agora

Invoke the skill directly, name a mode when you want one, then provide the facts it may use:

```text
/agora sell Rewrite this upgrade screen from one real buyer stake to a defensible belief. Keep one supported CTA. Use only these verified facts: ...
```

In Codex, `$agora` and the skills picker can also select the installed skill. Other hosts may expose skills through their own picker or mention syntax; asking the agent to "use the agora skill" remains portable.

### Commercial modes

An explicit mode wins. When no mode is named, Agora infers one from the requested asset and the audience's decision.

| Mode | Use or infer it for |
|---|---|
| `SELL` | Marketing, sales, ads, landing pages, outreach, or paywalls |
| `INVEST` | Investors, funding, pitches, or capital-focused profiles |
| `POSITION` | Company profiles, category narratives, or brand descriptions |
| `INFORM` | Editorial or educational work |
| `TRANSACT` | Buttons, confirmations, alerts, or utility microcopy |

### Surface routing

Mode and surface are separate decisions. An investor description on Crunchbase is `INVEST` on an indexable public, objective profile surface. A paywall is `SELL` on a written interface surface. A published transcript is written even when its source script is spoken.

| Surface | Treatment |
|---|---|
| `INDEXABLE_PUBLIC` | Public claim review, written human-voice and GEO/AEO gates, plus a technical publication handoff |
| `PUBLIC_NON_INDEXABLE_WRITTEN` | Public claim review, written semantic and evidence rules, plus the human-voice gate; skip crawl and index checks |
| `WRITTEN_PRIVATE` | Proof fidelity, concrete entities, self-contained claims, and the human-voice gate |
| `SPOKEN_ONLY` | Proof review, cadence, breath, timing, and listener comprehension; skip GEO/AEO formatting |
| `HYBRID` | Route every spoken and written derivative separately |

### Commercial spine

For `SELL`, `INVEST`, and `POSITION`, Agora constructs this exact sequence:

```text
Recognizable reality -> consequence or opportunity -> new decision criterion -> company or product mechanism -> defensible destination belief -> action or investment relevance.
```

Moves may share sentences; none may disappear.

1. Recognizable reality. Name the audience's current situation without inventing pain, motive, or urgency.
2. Consequence or opportunity. Make one truthful stake felt through a concrete business effect, decision risk, or available gain.
3. New decision criterion. Establish what a credible choice must do, based on the supplied facts.
4. Company or product mechanism. Explain what changes, what causes the change, and what limits apply.
5. Defensible destination belief. Land one supported commercial conclusion.
6. Action or investment relevance. State the logical next step, or why the company merits evaluation when the channel does not permit a CTA.

### Objective-channel cap

On objective platforms such as Crunchbase, the channel caps tone, not argument. Agora keeps the commercial spine factual and compact. It does not replace the stake with hype or force a sales command where investment relevance is the permitted close. If the channel conflicts with the requested commercial job, Agora returns usable copy first and names the conflict afterward.

## What the skill enforces

Agora chooses the commercial job before it formats the surface. Proof review happens before the later formatting and compression passes.

- Preserve every load-bearing move for `SELL`, `INVEST`, and `POSITION` work before formatting the channel.
- Keep proof beside the claim, with its source, scope, date, qualification, and material limits.
- Use the strongest factual argument an objective channel permits instead of settling for a hollow profile.
- Cut Wikipedia-style flagged vocabulary, connectives, templates, significance tails, generated em dashes, curly quotes, fabricated texture, and decorative recaps.
- Narrow, omit, or flag unsupported claims instead of supplying missing features, prices, routes, urgency, scarcity, testimonials, or results.
- Return one usable draft before assumptions, verification needs, or an objective-channel conflict.
- Remove repetition before cutting a stake, mechanism, proof limit, destination belief, or action relevance.

The skill improves process discipline; it does not replace source review, legal review, or final human verification.

## Written GEO/AEO boundaries

For written assets, Agora treats generative-engine optimization and answer-engine optimization as clarity and evidence work: answer the reader's question early, name entities and scope, keep proof adjacent to claims, expose provenance, and make useful passages self-contained.

For indexable public pages, it can also flag technical publication checks such as crawlability, canonical consistency, structured data, and sitemap inclusion. These practices can improve eligibility and citability; they cannot promise retrieval, selection, quotation, citation, ranking, recommendation, referral, conversion, or revenue.

Spoken-only delivery skips GEO/AEO formatting. Published titles, descriptions, transcripts, captions, show notes, and companion pages receive the written treatment separately.

## How Agora works

<p align="center">
  <img src="assets/agora-orbit.svg" alt="Animated flow from verified truth and evidence through argument, proof, voice, and action into ready copy" width="100%" />
</p>

The public skill stays intentionally small:

```text
skills/agora/
├── SKILL.md
├── agents/
│   └── openai.yaml
└── references/
    └── agora-marketing.md
```

`SKILL.md` contains the operating workflow. `references/agora-marketing.md` is the canonical authority for evidence grades, ethical limits, persuasion controls, AI-writing-tell checks, and GEO/AEO boundaries. CiteSurge-specific rules remain isolated to CiteSurge work.

## Verify the package

```sh
npm run check
npx -y @maestroagora/agora --dry-run
```

The validation suite checks the strict skill root, the v1.1 behavior contract, plugin metadata, relative links, installer behavior, and the exact npm package allowlist. A committed blind-eval corpus covers mode and surface combinations without calling a model during CI.

## License

[MIT](LICENSE)
