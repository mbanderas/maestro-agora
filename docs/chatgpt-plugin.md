# ChatGPT plugin submission

Agora's public-directory package contains skills only. It requires no Agora backend, MCP server, authentication connection, or API key. This is a submission candidate, not a claim that OpenAI has approved or published the plugin.

## Build and inspect

Use Node.js 18 or later from the repository root:

```sh
npm run plugin:check
npm run plugin:pack
```

`plugin:check` validates listing metadata and constructs the archive in memory without writing it. `plugin:pack` first runs the existing full release checks, then writes `dist/maestro-agora-1.12.0.zip` and prints its SHA-256. The packager refuses to replace an existing output. For another destination after a rebuild, run:

```sh
npm run plugin:pack -- --output dist/maestro-agora-1.12.0-candidate.zip
```

The ZIP has one plugin root and an explicit file allowlist: `.codex-plugin/plugin.json`, `LICENSE`, `DISCLAIMER.md`, `PRIVACY.md`, `assets/icon.png`, all 19 released `skills/agora/` files, and the two `skills/agora-start/` onboarding files. It excludes repository history, research, evaluation records, private files, the npm installer, and development tools. The compatibility manifest is supported by the submission portal; a root portable manifest is not required for this existing format.

The approved Agora skill is copied byte for byte. The versioned distribution record binds both the writing skill and onboarding files to the release. Historical writing evaluations remain version-specific and do not establish installation or onboarding behavior.

## Available capabilities

Writing, critique, and voice adaptation from samples supplied in the conversation use packaged instructions and the host model. In ChatGPT, select the plugin with `@`; in Codex, select `$agora`. The `/agora` starter prompts also explicitly activate the writing skill.

Optional deterministic file audits require an execution tool, Node.js, and an accessible file. ExifTool and c2patool extend coverage only when installed. A path on a user's computer is not automatically accessible to a browser conversation. Persistent measured voice profiles need the separately installed npm CLI, a suitable corpus, and user-controlled storage. The plugin does not install that CLI or synchronize profiles. Cloud storage persistence must be established in the target host; it is not a plugin guarantee.

The onboarding skill checks prerequisites for requested optional features and offers supported alternatives. It does not intercept every later writing request. The core skill already provides a manual typography fallback when Node is absent and reports unavailable audit coverage as unknown. Do not advertise a deterministic audit or certified voice profile on a surface where it has not been tested.

Agora's references put host rules above editorial preferences. Its broad user-authority wording remains part of the packaged writing skill and is still subject to OpenAI's scan and review. Do not claim that local checks establish marketplace acceptance.

## Test the installed candidate

Install through a local marketplace in a supported ChatGPT desktop client, start a fresh conversation, and test the complete package. These are manual acceptance cases to record before submission, not a claim that they have passed:

- Invoke each of the three listing prompts with a real brief; verify activation, useful output, and preservation of supplied facts.
- Ask indirectly for a landing-page rewrite, then shorten the result in a follow-up; verify the same writing workflow applies.
- Supply a short voice sample; verify the result uses a task-only sketch and does not claim a measured profile.
- Ask onboarding to audit a file when execution or Node is absent; verify it explains the limitation without claiming an audit ran.
- Request a persistent profile where the CLI or persistent storage is unavailable; verify onboarding offers a task-only sketch without installing software.
- Ask an unrelated factual question; verify the setup and writing skills do not unnecessarily activate.

Repeat core writing in ChatGPT on the web and mobile where available. Verify that the onboarding action loads `agora-start`, references resolve, and optional tools are described accurately on each tested surface. Record the client, date, input, and observed result in the submission notes.

## Submit and publish

1. Open the [OpenAI Plugins dashboard](https://platform.openai.com/plugins). Sign in with the verified individual or business identity that should own the listing. An organization owner can submit; another member needs Apps Management Write.
2. Upload the ZIP through the skills-only submission path. Resolve metadata and skill-scan findings against the source files, rebuild, and upload again.
3. Confirm the listing name, publisher, icon, starter prompts, category, support link, and public privacy notice. Ensure the linked privacy notice includes the plugin execution section before submitting. A local edit does not update the public GitHub page.
4. Complete the applicable attestations and submit for review. Skills-only submissions do not need MCP credentials, MCP test cases, or a demo recording.
5. After approval, select Publish plugin. Update this documentation with the actual listing link only after publication is confirmed.

Metadata or skill updates require a new complete ZIP and version. The current package uses version 1.12.0, matching the npm release. Do not overwrite the existing npm release or retag it. Adding an MCP server to an already-created skills-only listing is currently unsupported, so reconsider that architecture before the initial submission if a hosted service is planned.

Requirements checked on October 12, 2026: [package format](https://developers.openai.com/plugins/build/plugins), [submission fields and publishing](https://developers.openai.com/plugins/deploy/submission), [archive errors](https://developers.openai.com/plugins/deploy/submission-errors), [plugin testing](https://developers.openai.com/plugins/deploy/connect-chatgpt), and [directory guidelines](https://developers.openai.com/plugins/plugin-guidelines). Account access, platform scans, installation behavior, and approval remain separate from repository checks.
