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

Agora helps you turn what your business does, knows, sells, or explains into writing people can understand and act on. It does not make up real-world facts. When fiction, mock work, or a concept is the assignment, Agora can invent within the brief and keeps that status clear.

It starts with the decision behind the copy. Who must understand, believe, choose, approve, fund, or do something next? Agora finds the consequential stake, explains why the subject matters, chooses the details that move the decision, and writes for the actual channel.

Use it for landing pages, heroes, ads, product copy, sales outreach, investor communication, scientific and technical explanation, case studies, company profiles, editorial work, interface text, and spoken scripts.

## What Agora adds

| Capability | What it controls |
|---|---|
| Persuasion | Argument, consequence, reason to believe, CTA, channel fit, and truthful rhetorical force |
| Heroes and short sales copy | Awareness, claim saturation, traffic source, promise grammar, destination fidelity, and the complete first-screen composition |
| `SCIENCE` | Scientific certainty, causal language, statistics, mechanisms, uncertainty, analogies, visuals, sources, and limits |
| `CASE_STUDY` | Real projects, fictional mocks, and concept portfolios with distinct invention, attribution, causality, permission, and disclosure controls |
| `INVEST` | Fundraising, diligence, and capital-allocation communication without invented traction, urgency, commitments, or inevitability |
| `VOICE` | A measured first-party voice profile that stays subordinate to the facts and required language |
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

Invoke Agora directly and provide the facts it may use:

```text
/agora Rewrite this upgrade screen. Make the blocked action matter, state the plan difference clearly, and use one supported CTA.
```

Choose a primary mode when you want to override inference:

```text
/agora position Turn these business facts into a 35-word company profile.
/agora sell Build a homepage hero around the strongest buyer stake these product facts support.
/agora invest Write a fundraising opening from the current results, risks, and purpose of the round.
/agora inform Explain this research finding for a public audience.
/agora transact Rewrite this confirmation so the state and next action are unmistakable.
```

Add modifiers when the subject or asset needs them:

```text
/agora sell science Write a technical product hero without hiding material uncertainty.
/agora inform science Explain this study for a general audience.
/agora sell case study Write a customer success case from this approved project record.
/agora inform science case study Explain this engineering implementation and its measured limits.
/agora invest science Build a deep-tech capital case from the supplied study and scale-up results.
/agora invest case study Use this approved customer case in an investor brief without overstating attribution.
/agora sell --voice house Rewrite this page in the measured house profile.
```

In Codex, `$agora` and the skills picker can also select the installed skill. Other hosts may expose skills through a picker or mention syntax. Asking the agent to use the Agora skill remains portable.

## Routing model

Agora chooses a primary mode first, then the publication surface, then any domain or asset modifiers. `VOICE` enters afterward and cannot override the facts, material uncertainty, or required language.

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
| `SCIENCE` | Adds empirical or technical accuracy, explanation, and uncertainty rules |
| `CASE_STUDY` | Adds case-study structure, result, attribution, permission, and confidentiality rules |
| `VOICE` | Applies an authorized measured voice profile |

The modifiers can compose. A technical fundraising case may use `INVEST + SCIENCE + CASE_STUDY`. A founder-voiced scientific product video may use `SELL + SCIENCE + VOICE + HYBRID`.

### Surfaces

| Surface | Treatment |
|---|---|
| `INDEXABLE_PUBLIC` | Public claim review, human-voice and GEO/AEO passes, then relevant technical publication checks |
| `PUBLIC_NON_INDEXABLE_WRITTEN` | Public claim review, clear written structure, and human-voice pass; no crawl or index checks |
| `WRITTEN_PRIVATE` | Factual fidelity, channel fit, concrete meaning, and human-voice pass |
| `SPOKEN_ONLY` | Factual review, cadence, breath, timing, and listener comprehension; no GEO/AEO formatting |
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

Agora ranks supporting details by decision relevance, differentiation, specificity, reliability, compression value, and omission risk. It keeps facts that change the decision, not facts that merely fill the page.

## Heroes and short-form sales copy

A hero is one distributed argument, not a headline contest. Agora evaluates:

- Optional eyebrow.
- Headline.
- Subhead.
- Primary and optional secondary CTA.
- Result or qualification microcopy.
- Visual, demo, or result context.
- Immediate next section.

It distinguishes a truth gate from a persuasive target. Accurate but generic copy does not pass because it avoided a false claim.

`SELL` on a first-attention surface normally receives a commercially assertive treatment. Mid-funnel explanation receives a persuasive-explanatory treatment. Promotional intensity requires real urgency, novelty, availability, or outcome results supplied in the brief. Missing support causes a lower treatment, not invented force.

Promise grammar matters. `See X`, `Learn how to X`, `We help you X`, `Do X more often`, `You will X`, and an imperative such as `Beat X` require different facts, conditions, and levels of support. CTA language must match the destination and its real commitment level.

## Scientific and technical communication

`SCIENCE` supports three internal routes:

| Route | Subject |
|---|---|
| `EMPIRICAL` | Studies, experiments, observations, measurements, and findings |
| `TECHNICAL` | Systems, interfaces, architecture, mechanisms, dependencies, and failure behavior |
| `MIXED` | Measured findings plus technical mechanism |

Material claims remain classified as observation, established fact or consensus, model, interpretation, implication, recommendation, hypothesis, speculation, or unknown. Simplification cannot move a claim upward in certainty.

Agora preserves study design, population, comparator, baseline, denominator, absolute and relative effects, material uncertainty, and the difference between statistical and practical significance when they matter. Correlation stays separate from causation. One study stays separate from replication or consensus.

Misconception hooks, question-first explanation, analogies, visuals, and alternating narrative threads are optional tools with explicit failure conditions. A misconception cannot be invented for suspense. An analogy must say what maps, what does not, and where it breaks.

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
| Real project | Uses only the supplied project history, roles, artifacts, quotes, permissions, measurements, and results |
| Fictional mock | Invents a coherent case inside an explicitly fictional, mock, synthetic, demo, or sample brief |
| Concept portfolio | Invents a self-initiated or speculative scenario without implying a real client, commission, approval, shipped state, research record, or measured outcome |

Fiction is not a workaround for missing facts in a real case. Fictional and concept work stays visibly labeled wherever a reader could mistake it for real project history. Illustrative metrics remain illustrative. Real identities, quotations, endorsements, and confidential material keep their normal truth and permission controls.

Every result is classified before writing: measured outcome, customer-reported outcome, observed process or adoption change, supported inference, target, pending measurement, or unmeasured.

Delivery activity cannot become business impact. Chronology cannot become causality. When outcome data is missing, Agora writes an honest account of the work and what remains unmeasured instead of manufacturing a triumphant ending.

Permission is tracked separately for names, logos, roles, quotes, metrics, screenshots, and implementation details. `PENDING` material stays internal or is omitted. `PROHIBITED` material never appears. Quotes cannot be repaired into stronger endorsements, combined into synthetic praise, or stripped of material connections and typicality limits.

Academic and clinical case reports remain outside this capability.

## Investment communication

`INVEST` remains one primary mode with three internal routes:

| Route | Decision |
|---|---|
| `FUNDRAISE` | A company seeking capital |
| `DILIGENCE` | Testing an investment case |
| `ALLOCATE` | Comparing or recommending capital allocation |

Agora separates historical results, current state, contracted commitments, customer reports, forecasts, targets, model assumptions, interpretations, scenarios, and unknowns. It also keeps revenue, bookings, pipeline, contracted value, collected cash, retention, margin, burn, runway, market size, and valuation measures distinct.

It can produce warm introductions, direct outreach, spoken openings, decks, briefs, demos, follow-ups, diligence memos, investment-committee briefs, data-room narratives, and progress updates. It does not impose a universal deck order, deck length, meeting script, talk ratio, outreach rule, or opening duration.

Strong fundraising communication makes the decision, present position, remaining risk, purpose of the capital, and next milestone clear. It never invents traction, warm access, investor interest, scarcity, commitments, consensus, or an inevitable future.

A valid weakness remains visible until new results resolve it. Reframing may change context, not the underlying fact.

Investment writing is not legal advice. Securities-law status, offering mechanics, solicitation rules, investor eligibility, and disclosure obligations require current authoritative verification and qualified counsel where applicable.

## Measured voice profiles

`VOICE` modifies another mode rather than replacing it. Profiles are measured from authorized first-party writing, not improvised from adjectives.

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

Profiles live at `~/.agora/voices/`, outside the replaceable skill directory. A default profile can apply across modes. Use `--no-voice`, `neutral`, or `--voice <name>` per request. Scientific uncertainty, quote fidelity, legal language, and the supplied scope override habitual certainty or vocabulary.

Building or applying a third-party profile for publication under that person's name is refused.

## Silent safeguards

Agora builds the argument before running publication and style checks. Those checks stay out of the delivered copy unless a constraint requires disclosure.

- Truth, safety, law, supplied facts, material qualifications, and immediate comprehension outrank persuasion and style.
- Unsupported claims are narrowed or removed, not buried under disclaimers.
- Facts, observations, interpretations, forecasts, targets, aspirations, and promises remain distinct.
- Emotion comes from a real situation, supportable consequence, and available agency.
- Fear, urgency, scarcity, loss, testimonials, intimacy, and certainty cannot be manufactured.
- CTAs use a clear action and a concrete destination, object, or result.
- One supported recommendation comes first. Near-duplicate variants appear only when requested.
- A hard final scan rejects U+2014 and smart-quote characters across the response.

Agora improves writing discipline. It does not replace source review, subject-matter review, legal review, or final human judgment.

## Written GEO/AEO boundaries

For written assets, Agora answers the reader's question early when the format calls for it, names entities and scope, keeps supporting details and qualifications beside claims, exposes real provenance, and builds useful passages that remain accurate when quoted alone.

For indexable public pages, it can flag relevant crawlability, canonical, sitemap, metadata, structured-data, accessibility, and delivery checks. These practices may improve eligibility and citability. They cannot promise retrieval, selection, quotation, citation, ranking, recommendation, referral, conversion, or revenue.

GEO/AEO applies to coherent page passages, not every sentence. It cannot force article-style density into a hero, case-study opening, spoken script, or short CTA.

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
`-- references/
    |-- agora-case-studies.md
    |-- agora-craft.md
    |-- agora-invest.md
    |-- agora-marketing.md
    |-- agora-science.md
    `-- agora-voice.md
```

`SKILL.md` contains routing and the concise operating contract. Ordinary work loads only the reference sections it needs.

- `agora-marketing.md` is the canonical doctrine for argument, truth, channels, GEO/AEO, AI-writing-tell controls, examples, research grades, and conflict handling.
- `agora-craft.md` adds headlines, heroes, awareness and sophistication, emotion, and prose rhythm.
- `agora-science.md` adds empirical and technical claim accuracy.
- `agora-case-studies.md` adds case structure, results, attribution, permissions, and confidentiality.
- `agora-invest.md` adds fundraising, diligence, and allocation procedures.
- `agora-voice.md` adds measured first-party voice profiles.

## Public-package hygiene

Research informed Agora, but research custody is separate from distribution.

The public repository and npm package must not contain raw or corrected transcripts, caption files, supplied PDFs or office documents, audio, video, private source identities, model-output scratch, research working files, local paths, or assigned secrets.

`npm run check` always runs a release-hygiene scan after validation, deterministic tests, and the exact package allowlist. `npm pack` and `npm publish` run the same complete release gate through `prepack` and `prepublishOnly`.

The blind corpus contains 86 prompt and manifest pairs: 28 incumbent cases, 32 hero, science, case-study, and composition cases introduced for v1.4.0, 20 INVEST and cross-capability cases introduced for v1.5.0, three fiction-boundary cases, and three customer-language cases that test whether internal checking terms stay backstage unless a technical audience needs them. Generation contexts receive prompts only, never expected behavior or grading metadata.

## Verify

```sh
npm run check
npm run release:check
npm pack --dry-run --json
npx -y @maestroagora/agora --dry-run
```

The release gate checks skill structure, routing contracts, modifiers, claim boundaries, typography, metadata, reference links, full-tree installer parity, exact npm contents, blind-corpus integrity, and public-tree hygiene.

## Change record

| Version | What changed |
|---|---|
| 1.5.0 | Hardens `INVEST` across fundraising, diligence, and capital allocation. Adds an investment claim ledger, metric separations, asset-specific procedures, decision-led questions, objection handling, defensibility analysis, truthful urgency and commitment language, modifier composition, and current-verification boundaries. Separates real projects from fictional mock and concept-portfolio routes, and permits clearly disclosed invention for mock and hypothetical articles. Adds a customer-language boundary that keeps internal checking terms out of ordinary public copy while preserving them where scientific, methodological, audit, legal, compliance, diligence, or technical work needs them. Expands the blind corpus from 60 to 86 cases. Adds a mandatory public-tree and package hygiene gate that blocks research, transcripts, supplied private documents, raw model outputs, local paths, secrets, unexpected binaries, and private source identities. |
| 1.4.0 | Adds stronger hero and short-form sales composition plus the composable `SCIENCE` and `CASE_STUDY` capabilities. Heroes now separate truth gates from persuasive optimization and treat the complete first-screen composition as one argument. Scientific and technical work preserves claim class, causality, statistics, uncertainty, analogy limits, and source limits. Case studies add result classes, causality, permissions, confidentiality, role attribution, quote, typicality, and visual-support gates. The blind corpus contains 60 cases. |
| 1.3.0 | Adds executable `VOICE` profiles, a deterministic measurement engine, admission gates, local profile storage, register-aware checking, and the craft reference. The archived incumbent corpus contains 28 cases. |
| 1.2.2 | Adds a hard U+2014 ban across the complete response. |
| 1.2.1 | Adds the first-read comprehension gate, specialized-term gate, and CTA standard. |
| 1.2.0 | Adds the blind evaluation corpus, generation isolation, pairwise adjudication, and absolute vetoes. |

Every research-derived rule records its source grade and boundary or failure condition. Numeric thresholds are sourced or labeled as governance defaults. Practitioner procedures remain bounded craft guidance, not scientific or commercial performance laws.

## Maestro suite

- **[Maestro Frontier](https://github.com/mbanderas/maestro):** Fuses the model CLIs you already run into one judged, grounded answer.
- **[Maestro Agora](https://github.com/mbanderas/maestro-agora):** Writes persuasive copy, technical explanations, compelling case studies, and investment communication without inventing results.
- **[Maestro CostGuard](https://github.com/mbanderas/costguard):** Audits CI and cloud infrastructure for cost leaks and shows what to fix.

## License

[MIT](LICENSE)
