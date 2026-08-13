<p align="center">
  <img src="assets/maestro-agora-banner.png" alt="The Maestro mascot turning rough notes into a finished page with a gold fountain pen" width="100%" />
</p>

<h1 align="center">Maestro: Agora</h1>

<p align="center"><strong>Say what matters. Make it land.</strong></p>

<p align="center">
  <a href="https://github.com/mbanderas/maestro-agora/actions/workflows/validate.yml"><img alt="Validation status" src="https://github.com/mbanderas/maestro-agora/actions/workflows/validate.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@maestroagora/agora"><img alt="npm version" src="https://img.shields.io/npm/v/@maestroagora/agora" /></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-7c3aed" /></a>
</p>

Agora helps you turn what your business does, knows, sells, imagines, or explains into writing people can understand and act on.

It starts with the decision behind the copy. Who must understand, believe, choose, approve, fund, or do something next? Agora finds the consequential stake, explains why the subject matters, chooses the details that move the decision, and writes for the actual channel.

Use it for landing pages, heroes, ads, product copy, sales outreach, investor communication, scientific and technical explanation, case studies, company profiles, editorial work, interface text, and spoken scripts. Agora follows your brief. It does not approve, reject, narrow, or moralize about your claims or creative choices.

## What Agora adds

| Capability | What it controls |
|---|---|
| Persuasion | Argument, consequence, reason to believe, CTA, channel fit, and rhetorical force |
| Heroes and short sales copy | Awareness, claim saturation, traffic source, promise grammar, destination fidelity, and the complete first-screen composition |
| `SCIENCE` | Scientific certainty, causal language, statistics, mechanisms, uncertainty, analogies, visuals, sources, and limits |
| `CASE_STUDY` | Real projects, fictional mocks, and concept portfolios shaped around the story and status you choose |
| `INVEST` | Fundraising, diligence, and capital-allocation communication shaped around your thesis, claims, urgency, and next decision |
| `VOICE` | A measured voice profile built from the corpus you choose |
| Written GEO/AEO | Clear entities, self-contained passages, source transparency, and relevant publication checks |

Agora returns one ready-to-use result by default. Alternatives, internal routes, and rationale stay out of the final copy unless requested.

## When buyers ask AI, is your brand part of the answer?

More decisions now start inside an AI answer. Buyers ask for comparisons, explanations, and recommendations; brands either enter that answer or they do not.

[CiteSurge](https://citesurge.com/) tracks how your brand and competitors appear across ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews, Bing Copilot, and Grok. Run Prompt Scans for the questions your customers may ask. Measure competitive Share of Voice. See which brands and sources shape each answer. Then turn what you find into prioritized Content Recommendations and keep monitoring the same prompts as the competitive picture changes.

**[Find out where your brand stands when buyers ask AI.](https://citesurge.com/)**

## Install

Install Agora across the shared Agent Skills path and Claude Code:

```sh
npx -y @maestroagora/agora
```

The default user install writes the same reviewed skill to:

- `~/.agents/skills/agora` for Codex and Agent Skills-compatible tools.
- `~/.claude/skills/agora` for Claude Code.

Open a new task or restart the host after installation so its skill registry and slash menu reload.

Install one target or use project-local scope:

```sh
npx -y @maestroagora/agora --target codex --scope user
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

The npm installer provides the broadest host coverage. Native plugin commands use the matching Claude or Codex manifest from this repository.

## Quick start

Invoke Agora directly and provide the brief, material, and claims you want it to use:

```text
/agora Rewrite this upgrade screen. Make the blocked action matter, state the plan difference clearly, and use one supported CTA.
```

Choose a primary mode when you want to override inference:

```text
/agora position Turn these business facts into a 35-word company profile.
/agora sell Build a homepage hero around the strongest buyer stake in this brief.
/agora invest Write a fundraising opening from the current results, risks, and purpose of the round.
/agora inform Explain this research finding for a public audience.
/agora transact Rewrite this confirmation so the state and next action are unmistakable.
```

Add modifiers when the subject or asset needs them:

```text
/agora sell science Write a technical product hero with this certainty and framing.
/agora inform science Explain this study for a general audience.
/agora sell case study Write a customer success case from this approved project record.
/agora inform science case study Explain this engineering implementation and its measured limits.
/agora invest science Build a deep-tech capital case from the supplied study and scale-up results.
/agora invest case study Use this customer case to strengthen the investor brief.
/agora sell --voice house Rewrite this page in the measured house profile.
```

In Codex, `$agora` and the skills picker can also select the installed skill. Other hosts may expose skills through a picker or mention syntax. Asking the agent to use the Agora skill remains portable.

## Publication privacy and provenance

Agora writes copy. It does not create SVG, PNG, JPEG, PDF, DOCX, or PPTX files by itself. Other document, presentation, PDF, site, design, or image tools may place Agora copy into those artifacts.

When you explicitly request a publication audit, Agora can inspect the local artifact before it leaves your control:

```text
/agora publication audit Inspect ./launch-deck.pptx before I share it.
```

Run the packaged read-only inspector directly when you want a deterministic report:

```sh
npx -y -p @maestroagora/agora@latest agora-publication-audit ./launch-deck.pptx
npx -y -p @maestroagora/agora@latest agora-publication-audit ./public-assets --json --output audit.json
```

The inspector covers configured hidden or control characters in text, selected HTML and SVG metadata, Office properties and review material, PDF metadata, PNG and JPEG metadata containers, and C2PA carrier hints. ExifTool adds broader read-only PDF and image metadata coverage when it is already installed. `c2patool` verification is opt-in through `--verify-c2pa`, with remote-manifest fetching disabled by supplied settings.

Source files are read only and compared by SHA-256 before and after inspection. Sensitive values and absolute paths are redacted by default. Missing or partial coverage is reported as `UNKNOWN`.

This is publication hygiene, not a watermark remover or authorship detector. A result cannot prove that content is AI-generated, human-written, anonymous, clean, or safe. Claude's documented model-level text marking is not equivalent to unusual Unicode or ordinary file metadata.

Model-level text watermarks are statistical generation signals, not hidden characters or metadata fields. Without the matching provider verifier or detector configuration and enough eligible text, Agora reports that question as uninspected instead of guessing from style, Unicode, or generic detector scores.

## Routing model

Agora chooses a primary mode first, then the publication surface, then any domain or asset modifiers. `VOICE` enters afterward and preserves your required language and content choices.

### Primary modes

| Mode | Use or infer it for |
|---|---|
| `POSITION` | Company profiles, directories, About copy, website summaries, category narratives, and objective descriptions |
| `SELL` | Marketing, sales, ads, landing pages, product pages, outreach, upgrades, and paywalls |
| `INVEST` | Actual funding, diligence, investor-pitch, and capital-allocation decisions |
| `INFORM` | Editorial, educational, scientific, and technical explanation |
| `TRANSACT` | Buttons, confirmations, alerts, forms, and utility microcopy |

`POSITION` remains the default for descriptive company profiles, even when investors may read them. Directory placement does not convert an objective profile into a capital pitch.

### Composable modifiers

| Modifier | Function |
|---|---|
| `SCIENCE` | Adds empirical or technical explanation and optional claim-review tools |
| `CASE_STUDY` | Adds case-study structure, result framing, and optional attribution or permission review |
| `VOICE` | Applies a measured voice profile from the corpus you select |

The modifiers can compose. A technical fundraising case may use `INVEST + SCIENCE + CASE_STUDY`. A founder-voiced scientific product video may use `SELL + SCIENCE + VOICE + HYBRID`.

### Surfaces

| Surface | Treatment |
|---|---|
| `INDEXABLE_PUBLIC` | Human-voice and GEO/AEO passes, then relevant technical publication checks |
| `PUBLIC_NON_INDEXABLE_WRITTEN` | Clear written structure and human-voice pass; no crawl or index checks |
| `WRITTEN_PRIVATE` | Channel fit, concrete meaning, and human-voice pass |
| `SPOKEN_ONLY` | Cadence, breath, timing, and listener comprehension; no GEO/AEO formatting |
| `HYBRID` | Spoken delivery and each written derivative are routed separately |

Titles, descriptions, captions, show notes, transcripts, and companion pages receive written treatment. Spoken narration stays free of search-format scaffolding.

## How the argument works

Agora reasons through a variable-depth path:

```text
situation -> stake -> criterion when useful -> mechanism -> reason to believe -> destination belief -> next step
```

This path is not a paragraph template.

- Short copy pairs the strongest live consequence with the strongest supplied differentiator.
- Medium copy adds the mechanism and the result, detail, or qualification that matters most.
- Long copy expands only when another fact resolves a real objection or expensive uncertainty.

Agora ranks supporting details by decision relevance, differentiation, specificity, compression value, and omission risk. It keeps material that changes the decision, not material that merely fills the page.

## Heroes and short-form sales copy

A hero is one distributed argument, not a headline contest. Agora evaluates:

- Optional eyebrow.
- Headline.
- Subhead.
- Primary and optional secondary CTA.
- Result or qualification microcopy.
- Visual, demo, or result context.
- Immediate next section.

It distinguishes brief fidelity from persuasive quality. Copy does not pass merely because it repeats the input without making an argument.

`SELL` on a first-attention surface normally receives a commercially assertive treatment. Mid-funnel explanation receives a persuasive-explanatory treatment. Promotional intensity follows the campaign context and force you request.

Promise grammar matters. `See X`, `Learn how to X`, `We help you X`, `Do X more often`, `You will X`, and an imperative such as `Beat X` create different expectations. CTA language must match the destination and its commitment level.

## Scientific and technical communication

`SCIENCE` supports three internal routes:

| Route | Subject |
|---|---|
| `EMPIRICAL` | Studies, experiments, observations, measurements, and findings |
| `TECHNICAL` | Systems, interfaces, architecture, mechanisms, dependencies, and failure behavior |
| `MIXED` | Measured findings plus technical mechanism |

When you request scientific claim review, Agora can classify material as observation, established fact or consensus, model, interpretation, implication, recommendation, hypothesis, speculation, or unknown. Without that request, it follows the certainty and framing in your brief.

Agora can preserve study design, population, comparator, baseline, denominator, absolute and relative effects, material uncertainty, and the difference between statistical and practical significance when your task needs that precision.

Misconception hooks, question-first explanation, analogies, visuals, and alternating narrative threads are optional tools. Agora uses the level of disclosure, certainty, and dramatic force you request.

## Case studies built around what happened

`CASE_STUDY` supports:

| Family | Primary focus |
|---|---|
| `CUSTOMER_SUCCESS` | Buyer problem, intervention, measured result, attribution, and decision relevance |
| `CREATIVE_PORTFOLIO` | Brief, constraints, insight, concept, role, decisions, execution, and results |
| `TECHNICAL_IMPLEMENTATION` | System constraint, alternatives, architecture, rollout, failure modes, observed performance, and tradeoffs |

Case family and project status are separate:

| Project status | What Agora permits |
|---|---|
| Real project | Builds from the history, roles, artifacts, quotes, measurements, and results you provide |
| Fictional mock | Invents a coherent case to the scope and realism you request |
| Concept portfolio | Builds a self-initiated or speculative scenario to the framing you request |

You choose whether a case is real, fictional, mixed, anonymous, attributed, disclosed, or presented without a status label. Agora does not police that choice.

Every result is classified before writing: measured outcome, customer-reported outcome, observed process or adoption change, supported inference, target, pending measurement, or unmeasured.

Agora can separate delivery activity, business impact, chronology, and causality when you request case review. Otherwise it follows the outcome framing in your brief.

Permission, attribution, confidentiality, quote, and disclosure review are optional. Activate them explicitly when you want Agora to audit a case before publication.

Academic and clinical case reports remain outside this capability.

## Investment communication

`INVEST` remains one primary mode with three internal routes:

| Route | Decision |
|---|---|
| `FUNDRAISE` | A company seeking capital |
| `DILIGENCE` | Testing an investment case |
| `ALLOCATE` | Comparing or recommending capital allocation |

Agora can separate historical results, current state, contracted commitments, customer reports, forecasts, targets, model assumptions, interpretations, scenarios, and unknowns when you request diligence or claim review. It can also preserve distinctions among revenue, bookings, pipeline, contracted value, collected cash, retention, margin, burn, runway, market size, and valuation measures.

It can produce warm introductions, direct outreach, spoken openings, decks, briefs, demos, follow-ups, diligence memos, investment-committee briefs, data-room narratives, and progress updates. It does not impose a universal deck order, deck length, meeting script, talk ratio, outreach rule, or opening duration.

Strong fundraising communication makes the decision, present position, purpose of the capital, and next milestone clear. Agora uses the traction, access, interest, scarcity, commitments, and future framing you choose.

When diligence is the task, Agora can keep a weakness visible until new results resolve it. In fundraising work, it follows the strategic framing you request.

Legal, securities, offering, solicitation, eligibility, and disclosure review is optional and must be requested explicitly.

## Measured voice profiles

`VOICE` modifies another mode rather than replacing it. Profiles are measured from the corpus you select, not improvised from adjectives.

Build and inspect a profile with the shipped engine:

```sh
npx -p @maestroagora/agora agora-voice build --name house \
  --register blog --from ./posts \
  --register email --from ./letters

npx -p @maestroagora/agora agora-voice list
npx -p @maestroagora/agora agora-voice check --voice house ./draft.md
```

The engine reads Markdown, plain text, and HTML from files, directories, and URLs. It removes quotations, code, tables, signatures, front matter, and headings before measurement. Binary document formats are refused by name rather than partially extracted.

A profile records sentence and paragraph distributions, function words, punctuation, openings, stance, contraction behavior, and supported vocabulary. It states what the corpus was too small to measure and refuses certification below 5,000 clean author-controlled words.

Profiles live at `~/.agora/voices/`, outside the replaceable skill directory. A default profile can apply across modes. Use `--no-voice`, `neutral`, or `--voice <name>` per request. Your required wording overrides habitual profile tendencies.

Agora builds or applies the profile you request. You are responsible for corpus rights, identity use, attribution, endorsements, disclosure, and publication.

## User control and responsibility

Agora is a writing tool, not a content moderator, fact checker, approval system, or legal reviewer. It follows your claims, framing, tone, urgency, fictional choices, attribution choices, and publication instructions.

- Agora does not refuse, narrow, weaken, qualify, remove, or label content because it considers a claim unsupported or a writing choice too aggressive.
- Agora does not append warnings, moral judgments, policy notes, or generic disclaimers to requested copy.
- Fact checking, source review, evidence review, permission review, confidentiality review, disclosure review, due diligence, and compliance review run only when you request them.
- Host platforms and model providers may still apply their own terms and safety policies.
- You are responsible for reviewing and using every output, including its accuracy, legality, claims, permissions, confidentiality, attribution, disclosures, and compliance with platform rules.

Read [User Responsibility and Disclaimer](DISCLAIMER.md) and [Privacy Notice](PRIVACY.md).

## Written GEO/AEO boundaries

For indexable public assets, Agora answers the reader's question early when the format calls for it, names entities and scope, keeps supporting details and qualifications beside claims, exposes supplied provenance, and builds useful passages that remain accurate when quoted alone.

For indexable public pages, it can flag relevant crawlability, canonical, sitemap, metadata, structured-data, accessibility, and delivery checks. These practices may improve eligibility and citability. They cannot promise retrieval, selection, quotation, citation, ranking, recommendation, referral, conversion, or revenue.

GEO/AEO applies to coherent passages on indexable public pages, not every sentence. It does not automatically apply to private, non-indexable, or spoken work, and it cannot force article-style density into a hero, case-study opening, or short CTA.

## Package architecture

<p align="center">
  <img src="assets/agora-orbit.svg" alt="Animated flow from source material through argument, voice, and action into ready copy" width="100%" />
</p>

The shipped skill stays progressively loaded:

```text
skills/agora/
|-- SKILL.md
|-- agents/
|   `-- openai.yaml
|-- scripts/
|   `-- publication-audit.mjs
`-- references/
    |-- agora-case-studies.md
    |-- agora-conversion.md
    |-- agora-craft.md
    |-- agora-invest.md
    |-- agora-marketing.md
    |-- agora-publication.md
    |-- agora-science.md
    `-- agora-voice.md
```

`SKILL.md` contains routing and the concise operating contract. Ordinary work loads only the reference sections it needs.

- `agora-marketing.md` is the canonical doctrine for user authority, argument, channels, optional claim review, GEO/AEO, AI-writing-tell controls, examples, research grades, and conflict handling.
- `agora-craft.md` adds headlines, heroes, awareness and sophistication, emotion, and prose rhythm.
- `agora-science.md` adds empirical and technical explanation plus optional scientific claim review.
- `agora-case-studies.md` adds case structure, results, and optional attribution, permission, and confidentiality review.
- `agora-conversion.md` adds bounded conversion priors, outcome matching, self-serve and enterprise route design, pricing decision contracts, decision-adjacent proof, contradiction handling, and experiment interpretation for funnel surfaces.
- `agora-invest.md` adds fundraising, diligence, allocation, and optional claim-review procedures.
- `agora-publication.md` adds explicit read-only publication privacy and provenance review for local artifacts.
- `agora-voice.md` adds measured voice profiles and user-controlled profile use.
- `publication-audit.mjs` produces a deterministic, source-preserving inspection report without a cleaning operation.

## Public-package hygiene

Research informed Agora, but research custody is separate from distribution.

The public repository and npm package must not contain raw or corrected transcripts, caption files, supplied PDFs or office documents, audio, video, private source identities, model-output scratch, research working files, local paths, or assigned secrets.

`npm run check` runs validation, deterministic tests, the exact package allowlist, and release hygiene. `npm run release:check` is the proportional mandatory release gate and runs those same checks. `npm pack` and `npm publish` invoke it through `prepack` and `prepublishOnly`.

Behavioral evaluation is optional research, not a pack or publish blocker. `npm run eval:release` preserves the version-specific v1.7 evidence audit and must be run from a matching v1.7 checkout. Existing evaluation artifacts remain frozen for reproducibility; new blind or confirmatory generations are not required for later releases.

The versioned directories under `evals/blind/` are public pairwise-release artifacts, not permanently secret holdouts. `v1.2.0`, `v1.4.0`, `v1.5.0`, and `v1.7.0` are frozen by exact tree hashes in `evals/releases/locks.json`; validation fails on additions, deletions, or edits.

`evals/prospective/conversion-context-v1.0.0/` remains the development source for conversion-context cases. Earlier fixture sets are preserved under `evals/regression/` for regression analysis and historical reproducibility. `evals/blind/v1.7.0/` contains 25 independently authored conversion scenarios with versioned judging and reduction tooling.

Deterministic tests verify instruction structure, routing contracts, static invariants, and evaluation-record shape. Versioned blind-evaluation tooling remains available for repeatable development analysis without turning model preference into a universal conversion claim.

## Verify

```sh
npm run check
npm run release:check
node scripts/eval-locks.mjs
npm pack --dry-run --json
npx -y @maestroagora/agora --dry-run
```

The mandatory release gate checks skill structure, routing contracts, user-authority boundaries, modifiers, typography, metadata, reference links, full-tree installer parity, exact npm contents, frozen evaluation-tree locks, public-tree hygiene, and deterministic tests. It does not require model generation or blind adjudication.

## Change record

| Version | What changed |
|---|---|
| 1.8.0 | Adds opt-in publication privacy and provenance review plus a packaged read-only audit CLI. Reports configured hidden Unicode, document and image metadata, Office review material, and C2PA carrier or validation signals without changing source files. Redacts sensitive values and paths by default, preserves unknown coverage, and makes no watermark-removal or authorship claim. |
| 1.7.0 | Adds a progressively loaded conversion-context reference with bounded conversion priors, downstream outcome matching, self-serve and enterprise route design, pricing decision contracts, proof placement, and contradiction handling. Tightens closed-world fact preservation and limits written GEO/AEO requirements to indexable public work. |
| 1.6.0 | Expands user control across every writing mode. User-selected claims, fiction, urgency, attribution, profile use, and publication choices now control the draft. Claim, evidence, permission, disclosure, confidentiality, diligence, and compliance review are opt-in. Adds a user-responsibility disclaimer and an accurate privacy notice. |
| 1.5.0 | Hardens `INVEST` across fundraising, diligence, and capital allocation. Adds an investment claim ledger, metric separations, asset-specific procedures, decision-led questions, objection handling, defensibility analysis, truthful urgency and commitment language, modifier composition, and current-verification boundaries. Separates real projects from fictional mock and concept-portfolio routes, and permits clearly disclosed invention for mock and hypothetical articles. Adds a customer-language boundary that keeps internal checking terms out of ordinary public copy while preserving them where scientific, methodological, audit, legal, compliance, diligence, or technical work needs them. Expands the blind corpus from 60 to 86 cases. Adds a mandatory public-tree and package hygiene gate that blocks research, transcripts, supplied private documents, raw model outputs, local paths, secrets, unexpected binaries, and private source identities. |
| 1.4.0 | Adds stronger hero and short-form sales composition plus the composable `SCIENCE` and `CASE_STUDY` capabilities. Heroes now separate truth gates from persuasive optimization and treat the complete first-screen composition as one argument. Scientific and technical work preserves claim class, causality, statistics, uncertainty, analogy limits, and source limits. Case studies add result classes, causality, permissions, confidentiality, role attribution, quote, typicality, and visual-support gates. The blind corpus contains 60 cases. |
| 1.3.0 | Adds executable `VOICE` profiles, a deterministic measurement engine, admission gates, local profile storage, register-aware checking, and the craft reference. The archived incumbent corpus contains 28 cases. |
| 1.2.2 | Adds a hard U+2014 ban across the complete response. |
| 1.2.1 | Adds the first-read comprehension gate, specialized-term gate, and CTA standard. |
| 1.2.0 | Adds the blind evaluation corpus, generation isolation, pairwise adjudication, and absolute vetoes. |

Every research-derived rule records its source grade and boundary or failure condition. Numeric thresholds are sourced or labeled as governance defaults. Practitioner procedures remain bounded craft guidance, not scientific or commercial performance laws.

## Maestro suite

- **[Maestro Frontier](https://github.com/mbanderas/maestro):** Fuses the model CLIs you already run into one judged, grounded answer.
- **[Maestro Agora](https://github.com/mbanderas/maestro-agora):** Writes persuasive copy, technical explanations, compelling case studies, and investment communication to your brief.
- **[Maestro CostGuard](https://github.com/mbanderas/costguard):** Audits CI and cloud infrastructure for cost leaks and shows what to fix.

## License

[MIT](LICENSE). See [User Responsibility and Disclaimer](DISCLAIMER.md) and [Privacy Notice](PRIVACY.md).
