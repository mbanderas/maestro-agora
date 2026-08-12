# Privacy Notice

Last updated: August 12, 2026

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

## Publication audit

The optional `agora-publication-audit` tool reads local files selected by the user. It computes file hashes and can inspect configured text controls, document properties, comments, notes, tracked changes, image metadata containers, and provenance signals. It does not send source files or audit reports to the Agora maintainer.

The tool does not change source files. It reads each source again after inspection and reports whether its SHA-256 hash stayed unchanged. A report is written to disk only when the user supplies `--output`; the tool refuses to overwrite an existing report.

Audit reports redact metadata values and absolute paths by default. `--show-values` and `--include-paths` can place sensitive or identifying information in terminal output, logs, copied reports, host prompts, or files selected by the user. Users control those options and the storage, sharing, retention, and deletion of reports.

ExifTool, when already installed, runs locally in read mode to add metadata coverage. C2PA verification runs only when the user supplies `--verify-c2pa`; Agora supplies a local settings file that disables remote-manifest fetching. ExifTool, c2patool, the operating system, terminal, host application, and any separately configured wrappers remain third-party software outside the Agora project's control.

## GitHub interactions

GitHub processes information when users visit the repository, download releases, open issues, create pull requests, or otherwise use GitHub. GitHub's [General Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) applies to that processing.

The maintainer may receive and use information a person voluntarily submits through repository interactions to respond, review contributions, investigate bugs, and maintain the project. Public issues and pull requests are public. Do not submit confidential source material, prompts, drafts, voice corpora, credentials, or sensitive personal information through a public repository interaction.

## Retention and deletion

Agora does not maintain a project-operated server containing user prompts, drafts, outputs, or voice profiles.

Users can delete locally stored Agora files, voice profiles, and saved audit reports using their operating system. Data held by npm, GitHub, a host application, a model provider, a remote website, or another third party is governed by that third party's retention and deletion process.

## Changes and contact

Material changes to this notice will be published in this file with a revised date.

Privacy questions about the Agora project can be directed to the maintainer through the contact methods available on the [maintainer's GitHub profile](https://github.com/mbanderas). Do not post sensitive personal information in a public issue.
