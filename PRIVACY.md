# Privacy Notice

Last updated: August 10, 2026

## Scope

This notice describes the data behavior of the official Maestro: Agora source code and npm package maintained at [mbanderas/maestro-agora](https://github.com/mbanderas/maestro-agora).

Agora does not operate a hosted writing service, user-account system, analytics service, advertising system, or project-controlled telemetry endpoint.

## Local installation

The Agora installer copies the packaged skill and related files to destinations on your computer that you select. The installer does not send your installed skill files, prompts, drafts, or local documents to the Agora maintainer.

Using `npx` or npm to download Agora contacts the npm registry. npm may process registry, device, account, and network information under the [npm privacy policy](https://docs.npmjs.com/policies/privacy/).

## Prompts and generated content

Agora is a skill that runs inside a host application or model provider selected by the user. That host or provider may process, retain, review, or use prompts, source material, generated content, metadata, and account information under its own terms and privacy policy.

The Agora project does not receive prompts or generated content from those hosts unless a user separately submits that material to the maintainer, such as through a GitHub issue or pull request.

## Voice profiles

The optional `agora-voice` tool processes corpus files locally. By default, it writes profiles and measurements to `~/.agora/voices/`, or to a different local directory selected with `--store`.

Stored profile data can include:

- local source labels or user-supplied URLs;
- measured writing statistics and recurring vocabulary;
- selected corpus excerpts used for calibration;
- register labels, document counts, word counts, timestamps, and profile settings.

These files can contain sensitive or identifiable writing. Users control the corpus, storage location, access, backup, retention, sharing, and deletion of those files.

When a user supplies an HTTP or HTTPS URL as a corpus source, the voice tool fetches that URL from the user's computer. The remote website may receive ordinary request and network information under its own privacy policy. The fetched content and resulting profile are not sent to the Agora maintainer by the tool.

## GitHub interactions

GitHub processes information when users visit the repository, download releases, open issues, create pull requests, or otherwise use GitHub. GitHub's [General Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) applies to that processing.

The maintainer may receive and use information a person voluntarily submits through repository interactions to respond, review contributions, investigate bugs, and maintain the project. Public issues and pull requests are public. Do not submit confidential source material, prompts, drafts, voice corpora, credentials, or sensitive personal information through a public repository interaction.

## Retention and deletion

Agora does not maintain a project-operated server containing user prompts, drafts, outputs, or voice profiles.

Users can delete locally stored Agora files and voice profiles using their operating system. Data held by npm, GitHub, a host application, a model provider, a remote website, or another third party is governed by that third party's retention and deletion process.

## Changes and contact

Material changes to this notice will be published in this file with a revised date.

Privacy questions about the Agora project can be directed to the maintainer through the contact methods available on the [maintainer's GitHub profile](https://github.com/mbanderas). Do not post sensitive personal information in a public issue.
