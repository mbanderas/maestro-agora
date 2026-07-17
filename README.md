<p align="center">
  <img src="assets/agora-orbit.svg" width="100%" alt="An argument path connects verified reality and evidence to a claim gate, proof, voice, and action." />
</p>

<h1 align="center">Write Agora Marketing</h1>

<p align="center"><strong>Make the case. Then make every word earn its place.</strong></p>

<p align="center">
  <a href="https://agentskills.io/specification"><img alt="Agent Skills compatible" src="https://img.shields.io/badge/Agent%20Skills-open%20standard-8b5cf6" /></a>
  <a href="https://github.com/mbanderas/agora-marketing-skill/actions/workflows/validate.yml"><img alt="Validation status" src="https://github.com/mbanderas/agora-marketing-skill/actions/workflows/validate.yml/badge.svg" /></a>
  <img alt="Zero runtime dependencies" src="https://img.shields.io/badge/runtime%20dependencies-0-22c55e" />
</p>

Strong marketing needs more than polished sentences. It needs a case the reader can follow and the author can defend.

Give the skill verified product truth, an audience, a channel, and one next action. It instructs the agent to build the minimum complete argument, keep proof beside material claims, and return one ready-to-use draft suited to the surface. Its claim gate requires unsupported facts to be narrowed or removed.

```text
Use write-agora-marketing to rewrite this mobile paywall. Keep one CTA and use only the facts below: ...
```

## Install once for the major hosts

The repository contains one canonical [Agent Skill](https://agentskills.io/specification). Its zero-dependency installer copies that skill into documented host locations without rewriting it.

```sh
npx --yes --ignore-scripts git+ssh://git@github.com/mbanderas/agora-marketing-skill.git#v0.1.0 --target universal
```

`universal` installs two identical copies:

- `~/.agents/skills/write-agora-marketing` for Codex CLI/Desktop/IDE, Cursor, Gemini CLI, GitHub Copilot, and Windsurf.
- `~/.claude/skills/write-agora-marketing` for Claude Code, whose official skill path is currently separate.

Some clients scan both locations and do not document duplicate-name precedence. The copies are byte-identical; if you only use one host, choose its native target below instead.

The repository is private, so the command uses SSH and needs GitHub access through your existing Git setup. For a project-only install, keep the skill inside the repository:

```sh
npx --yes --ignore-scripts git+ssh://git@github.com/mbanderas/agora-marketing-skill.git#v0.1.0 --target universal --scope project --project .
```

Preview destinations with `--dry-run`. Re-run with `--force` to update a copy that differs; the installer refuses to overwrite it by default.

### Native target options

Use a native target when you only want one host. `--scope user` is the default.

| Target | User location | Project location |
|---|---|---|
| `shared` or `codex` | `~/.agents/skills` | `.agents/skills` |
| `claude` | `~/.claude/skills` | `.claude/skills` |
| `cursor` | `~/.cursor/skills` | `.cursor/skills` |
| `gemini` | `~/.gemini/skills` | `.gemini/skills` |
| `copilot` | `~/.copilot/skills` | `.github/skills` |
| `windsurf` | `~/.codeium/windsurf/skills` | `.windsurf/skills` |

These paths follow current primary documentation for [Codex](https://learn.chatgpt.com/docs/build-skills), [Claude Code](https://code.claude.com/docs/en/skills), [Cursor](https://cursor.com/docs/skills), [Gemini CLI](https://geminicli.com/docs/cli/skills/), [GitHub Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills), and [Windsurf](https://docs.windsurf.com/windsurf/cascade/skills).

## Activate it

The skill name becomes a direct command in hosts that expose skills through their command menu. No separate slash-command file is needed.

| Host | Explicit activation | Also available |
|---|---|---|
| Claude Code | `/write-agora-marketing ...` | Automatic matching by description |
| Cursor | `/write-agora-marketing ...` | Automatic matching by description |
| GitHub Copilot CLI / VS Code | `/write-agora-marketing ...` | Automatic matching by description |
| Codex CLI / Desktop / IDE | `$write-agora-marketing ...` or select it from `/skills` | Automatic matching by description; direct `/write-agora-marketing` availability is host-version dependent |
| Windsurf Cascade | `@write-agora-marketing ...` | Automatic matching by description |
| Gemini CLI | `Use write-agora-marketing to ...` | Inspect with `/skills list`; Gemini does not document `/write-agora-marketing` |

If a host was already open, follow its refresh behavior: Gemini CLI supports `/skills reload`; Copilot CLI supports `/skills reload`; Claude Code live-detects files unless the top-level skills folder was created after launch. For Codex or Cursor, restart if the new skill does not appear.

## What it handles

- Landing, product, and comparison pages
- CTAs, microcopy, onboarding, upgrades, and paywalls
- Cold email, warm outreach, DMs, ads, and social posts
- Editorial content and campaign arguments
- Spoken audio/video scripts and their written titles, captions, transcripts, descriptions, show notes, and companion pages

The workflow silently routes each asset as indexable public, public non-indexable written, private written, spoken-only, or hybrid. For written work, generative engine optimization and answer engine optimization (GEO/AEO) mean improving extractability, evidence adjacency, semantic clarity, and technical eligibility where relevant. They do not promise retrieval, quotation, citation, ranking, recommendation, referral, conversion, or revenue. Spoken-only delivery is written for cadence and comprehension instead; published derivatives get the written rules separately.

## The operating rule

```text
REALITY → STAKES → REASON TO BELIEVE → PROOF → ACTION
```

Only the moves the asset needs survive the edit. The skill defaults to the shortest complete output, one primary audience, one defensible destination belief, and one CTA intent.

The claim gate forbids invented claims, features, prices, routes, evidence, deadlines, urgency, scarcity, testimonials, comparisons, or results. When proof is missing, the workflow tells the agent to narrow or remove the claim instead of decorating it.

Illustrative input: `The free plan includes three exports per month. The paid plan removes that limit. The requested action is Upgrade.`

```text
Export more than three times this month.
Upgrade to remove the free-plan limit.

Upgrade
```

That example is fictional and demonstrates claim scope, not measured performance.

## Portable by design

The skill follows the open [Agent Skills specification](https://agentskills.io/specification): a concise `SKILL.md`, progressive disclosure, relative references, and no host-only frontmatter. `agents/openai.yaml` is bundled as optional Codex UI metadata; other hosts can safely ignore it.

For another Agent Skills-compatible tool, copy the canonical `write-agora-marketing` folder into that client's documented skills directory. The open specification defines the skill package, not where every client discovers installed skills.

```text
write-agora-marketing/
├── SKILL.md
├── agents/
│   └── openai.yaml
└── references/
    └── agora-marketing.md
```

The full reference preserves the evidence grades, durable sources, ethical limits, AI-writing-tell controls, channel-specific brevity guidance, and GEO/AEO boundaries behind the workflow. The skill reads that authority when it is activated; the README does not duplicate it.

## Verify the package

Node.js 18 or newer is required for the repository installer and checks. The installed skill itself has no runtime dependency.

```sh
npm run check
```

The check validates the strict three-file skill root, frontmatter, relative references, prohibited placeholders, installer behavior, native host paths, safe transactional updates, and exact npm package contents on Windows, Linux, and macOS CI. It proves package integrity, not conversion lift or model-output quality.
