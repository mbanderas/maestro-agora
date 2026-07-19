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

Most writing tools start with words. Agora starts with the decision behind them.

Give it verified facts, the real audience, and the surface where the copy will live. Agora finds the consequential shift or stake, explains the mechanism that changes it, selects the proof that matters most, and turns that case into channel-native copy. The result can feel urgent, ambitious, reassuring, or direct. It cannot outrun the evidence.

Use Agora for landing pages, ads, company profiles, investor narratives, sales email, product copy, paywalls, editorial work, interface text, and spoken scripts.

**One suite: fuse the answer, make the case, guard the spend.**

- **[Maestro Frontier](https://github.com/mbanderas/maestro):** Fuses the model CLIs you already run into one judged, grounded answer.
- **[Maestro Agora](https://github.com/mbanderas/maestro-agora):** Turns verified product truth into concise, argument-first copy without inventing the proof.
- **[Maestro CostGuard](https://github.com/mbanderas/costguard):** Audits CI and cloud infrastructure for cost leaks and shows what to fix.

## Install

Install Agora across the shared Agent Skills path and Claude Code:

```sh
npx -y @maestroagora/agora
```

The default user install writes the same reviewed skill to:

- `~/.agents/skills/agora` for Codex and Agent Skills-compatible tools.
- `~/.claude/skills/agora` for Claude Code.

Choose a target or project-local scope when needed:

```sh
npx -y @maestroagora/agora --target cursor --scope project
npx -y @maestroagora/agora --target codex,claude --scope user
npx -y @maestroagora/agora --target universal --dry-run
```

Supported targets are `universal`, `shared`, `codex`, `claude`, `cursor`, `gemini`, `copilot`, and `windsurf`. Add `--force` only when you intend to replace a different copy at the exact `agora` destination.

Update an existing user installation:

```sh
npx -y @maestroagora/agora@latest --target universal --scope user --force
```

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

The npm installer is the broadest route across IDEs. Native plugin commands use the matching Claude or Codex manifest from this repository.

## Use Agora

Invoke the skill directly and provide the facts it may use:

```text
/agora Rewrite this upgrade screen. Make the blocked action matter, state the plan difference clearly, and use one supported CTA.
```

Choose a mode when you want to override inference:

```text
/agora position Turn these verified facts into a 35-word company profile.
/agora sell Build a homepage hero around the strongest buyer stake this evidence supports.
/agora invest Write a one-paragraph capital case from timing, mechanism, proof, and use of funds.
/agora inform Explain this research finding for a public article.
/agora transact Rewrite this confirmation so the state and next action are unmistakable.
```

In Codex, `$agora` and the skills picker can also select the installed skill. Other hosts may expose skills through a picker or mention syntax. Asking the agent to "use the Agora skill" remains portable.

## How the persuasion engine works

Agora reasons through a variable-depth path:

```text
situation -> stake -> criterion when useful -> mechanism -> proof -> destination belief -> next step
```

That path stays internal. It is not a paragraph template.

- Very short copy pairs the strongest market shift, felt stake, or live consequence with the strongest verified differentiator.
- Medium copy adds the mechanism and the proof clue or qualifier that matters most.
- Long copy expands only when another fact resolves a real objection or expensive uncertainty.

This keeps a 35-word profile from sounding like a compressed pitch deck. It also keeps a full investor narrative from collapsing into a feature list.

### Mode routing

| Mode | Use or infer it for |
|---|---|
| `POSITION` | Company profiles, directories, About copy, website summaries, category narratives, and objective descriptions |
| `SELL` | Marketing, sales, ads, landing pages, product pages, outreach, upgrades, and paywalls |
| `INVEST` | Actual funding, capital-allocation, diligence, investor-pitch, and fundraising work |
| `INFORM` | Editorial and educational work |
| `TRANSACT` | Buttons, confirmations, alerts, forms, and utility microcopy |

`POSITION` is the default for descriptive company profiles, even when investors may read them. Agora makes relevance emerge from the shift, mechanism, wedge, and proof. It does not insert phrases such as "for investors" or "merits evaluation."

### Proof salience

Agora ranks facts by decision relevance, differentiation, verifiability, specificity, compression value, and omission risk.

It keeps the facts that change the decision. A measured outcome may outrank five minor features. A named list of supported engines may be the proof when scope is the decision. Diagnostic enumeration stays. Decorative feature volume goes.

### Emotion without invention

Agora chooses one dominant emotional job, such as tension, relief, control, ambition, belonging, or curiosity. It expresses that feeling through a real situation, a supportable consequence, and available agency.

It never manufactures fear, urgency, scarcity, loss, social proof, intimacy, or certainty. Emotion makes the facts consequential. It does not replace them.

## Surface routing

Mode and surface are separate decisions.

| Surface | Treatment |
|---|---|
| `INDEXABLE_PUBLIC` | Public claim review, human-voice and GEO/AEO passes, then relevant technical publication checks |
| `PUBLIC_NON_INDEXABLE_WRITTEN` | Public claim review, written evidence structure, and human-voice pass; no crawl or index checks |
| `WRITTEN_PRIVATE` | Proof fidelity, channel fit, concrete meaning, and human-voice pass |
| `SPOKEN_ONLY` | Proof review, cadence, breath, timing, and listener comprehension; no GEO/AEO formatting |
| `HYBRID` | Spoken delivery and each written derivative are routed separately |

Published titles, descriptions, transcripts, captions, show notes, and companion pages receive written treatment. Spoken-only delivery stays free of search-format scaffolding.

## Silent safeguards

Agora builds the argument before it runs publication and style checks. Those checks remain invisible unless the delivered copy would otherwise be misleading, legally unusable, or operationally unshippable.

- Unsupported claims are narrowed or removed, not buried under a disclaimer.
- Facts, inference, interpretation, aspiration, and promises remain distinct.
- GEO/AEO improves written clarity and evidence structure after the argument exists.
- Human-voice cleanup removes prompt leakage, canned templates, generic significance tails, generated em dashes, and smart quotes.
- Necessary factual series survive the cleanup.
- One ready-to-use result comes first. Near-duplicate variants appear only when requested.

The skill improves writing discipline. It does not replace source review, legal review, or final human judgment.

## Written GEO/AEO boundaries

For written assets, Agora answers the reader's question early when the format calls for it, names entities and scope, keeps proof beside claims, exposes real provenance, and builds useful passages that remain accurate when quoted alone.

For indexable public pages, Agora can also flag relevant crawlability, canonical, sitemap, metadata, structured-data, accessibility, and delivery checks. These practices can improve eligibility and citability. They cannot promise retrieval, selection, quotation, citation, ranking, recommendation, referral, conversion, or revenue.

## How Agora works

<p align="center">
  <img src="assets/agora-orbit.svg" alt="Animated flow from verified truth and evidence through argument, proof, voice, and action into ready copy" width="100%" />
</p>

The skill itself stays intentionally small:

```text
skills/agora/
├── SKILL.md
├── agents/
│   └── openai.yaml
└── references/
    └── agora-marketing.md
```

`SKILL.md` is the concise operating contract. `references/agora-marketing.md` holds the original doctrine, research evidence grades, ethical limits, channel rules, AI-writing-tell controls, GEO/AEO boundaries, examples, and evaluation guidance.

## Verify the package

```sh
npm run check
npx -y @maestroagora/agora --dry-run
```

The validation suite checks the strict three-file skill root, the v1.2 behavior contract, plugin metadata, relative links, installer behavior, source-link retention, project-agnostic content, and the exact npm package allowlist. A committed blind-eval corpus covers known failure modes without passing expected answers or grading rules into generation.

## License

[MIT](LICENSE)
