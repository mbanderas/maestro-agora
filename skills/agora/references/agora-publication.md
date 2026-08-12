# Agora publication privacy and provenance

Use this reference only for an explicit request to inspect a local artifact before publication or external sharing. Agora remains a writing system during ordinary drafting.

## Contents

- [Purpose and boundary](#purpose-and-boundary)
- [Model-level text watermark boundary](#model-level-text-watermark-boundary)
- [Trigger and non-trigger rules](#trigger-and-non-trigger-rules)
- [Run the audit](#run-the-audit)
- [Interpret the report](#interpret-the-report)
- [Format coverage](#format-coverage)
- [Unicode review](#unicode-review)
- [Metadata and privacy review](#metadata-and-privacy-review)
- [Provenance review](#provenance-review)
- [Publication decision](#publication-decision)
- [Sources](#sources)

## Purpose and boundary

Inspect the artifact that will leave the user's control. Report hidden text controls, document metadata, review material, and provenance carriers without changing source bytes.

Never describe this audit as a watermark remover, AI detector, authorship detector, humanizer, anonymizer, metadata cleaner, or proof that a file is safe or clean. Do not promise detector evasion. A missing finding means only that the named check did not find its configured signal.

Claude's documented text marking is model-level. Do not imply that a Unicode scan can detect or remove it. Unicode review and file metadata review solve narrower publication-hygiene problems.

## Model-level text watermark boundary

A token-distribution watermark is introduced during generation by changing token-selection probabilities. It is not a hidden Unicode string or an ordinary file property. Detection can depend on the matching tokenizer, keyed hash or partition rule, normalization procedure, statistical threshold, and enough eligible text. Without the provider's verifier or equivalent configuration, the result remains `UNKNOWN`.

The Kirchenbauer et al. green-list method is one research example, not evidence that Claude uses that exact scheme. It shows why short or low-entropy text can provide weaker statistical evidence, why editing may dilute rather than deterministically remove a mark, and why a detector can normalize whitespace, homoglyph, or zero-width changes before testing. Unusual Unicode is therefore neither evidence of a model-level watermark nor reliable evidence that one was removed.

Do not estimate model-level watermark status from prose style, generic AI-detector scores, ad hoc word frequencies, or the absence of metadata findings.

## Trigger and non-trigger rules

Load this reference when the user explicitly asks Agora to:

- inspect one or more local files before publication, submission, delivery, or external sharing;
- find hidden Unicode, metadata, comments, notes, tracked changes, personal information, or provenance records;
- perform a publication privacy or provenance audit;
- review an artifact produced by another document, presentation, PDF, site, design, or image tool before release.

Do not load or run the audit merely because writing is public, indexable, generated with AI, or being optimized for GEO/AEO. Do not run it against ordinary chat text unless the user supplies or identifies a local file. Do not create SVG, PNG, JPEG, PDF, DOCX, or PPTX files solely to make this workflow applicable.

## Run the audit

Use the shipped read-only script:

```sh
node <skill-root>/scripts/publication-audit.mjs <path...>
```

Use JSON when another tool or agent will consume the report:

```sh
node <skill-root>/scripts/publication-audit.mjs <path...> --json
```

Keep sensitive metadata values redacted by default. Use `--show-values` only when the user explicitly needs exact values. Use `--include-paths` only when full local paths are necessary. Use `--verify-c2pa` only when local C2PA verification is requested; the script supplies settings that disable remote-manifest fetching.

The script may write an audit report only through an explicit `--output <path>`. It refuses to overwrite an existing report. It never writes to a source file.

## Interpret the report

Use the exact states:

| State | Meaning |
|---|---|
| `FOUND` | The named check observed its configured signal. |
| `NOT_FOUND_BY_THIS_CHECK` | The named check ran and did not observe that signal. |
| `UNKNOWN` | Coverage was unavailable, unsupported, skipped, partial, or not requested. |
| `ERROR` | The named check could not complete. |

Use finding severities as routing aids, not verdicts:

| Severity | Treatment |
|---|---|
| `info` | Normal technical detail that may still matter to publication. |
| `review` | Inspect purpose and intended audience before publishing. |
| `sensitive` | Likely personal, organizational, editorial, or hidden review material. |
| `provenance` | Origin or processing information. Presence is not automatically harmful. |

Never collapse `UNKNOWN` into success. Never translate `NOT_FOUND_BY_THIS_CHECK` into `clean`, `AI-free`, `human-written`, `anonymous`, or `safe`.

## Format coverage

| Format | Built-in inspection |
|---|---|
| TXT, Markdown | UTF-8 decoding and configured invisible or control characters. |
| HTML | Text controls, selected metadata fields, and published comments. |
| SVG | Text controls, metadata blocks, comments, and selected editor fields. |
| DOCX | Core, application, and custom properties; comments; tracked changes; custom XML. |
| PPTX | Core, application, and custom properties; comments; authors; notes; hidden slides; custom XML. |
| PDF | Selected document-information fields, XMP presence, and C2PA carrier hints. |
| PNG | Text chunks, EXIF-container presence, and C2PA carrier hints. |
| JPEG | EXIF, XMP, IPTC, comment-container presence, and C2PA carrier hints. |

ExifTool, when already installed, adds broader read-only metadata inspection for PDF, PNG, and JPEG. The script does not install it. Embedded Office media is reported as uninspected instead of being silently treated as clean.

## Unicode review

Review code point, count, and location. Do not delete characters by category.

Zero-width joiners, zero-width non-joiners, variation selectors, and direction controls can be legitimate in emoji, Persian, Arabic, Hebrew, and other writing systems. Treat them as context-dependent. Treat directional overrides, internal byte-order marks, soft hyphens, and unexplained invisible separators as review findings, not proof of malicious or AI-generated text.

## Metadata and privacy review

Prioritize GPS coordinates, device or owner serials, email addresses, author and company names, local paths, comments, speaker notes, hidden slides, tracked changes, custom properties, custom XML, and edit history.

Report field names and counts without values by default. Avoid pasting a full audit report into a hosted model when the report contains values the user has not approved for disclosure.

## Provenance review

Treat creator software, timestamps, XMP, EXIF, IPTC, and C2PA as provenance signals. Do not assume they are private, harmful, accurate, complete, or forged.

C2PA can bind assertions and ingredients to an asset. A carrier hint is not cryptographic validation. `c2patool` validation may distinguish absent, reported, or problematic manifest information, but it cannot establish the full real-world truth of every assertion.

Do not remove or invalidate provenance because it reveals AI involvement. Preserve, disclose, or remove metadata only through a separate user-directed editing workflow with exact fields and consequences identified. This audit provides no cleaning operation.

## Publication decision

Return findings first, then coverage gaps, then source-integrity status. Separate three decisions:

1. Privacy: whether identified values or hidden review material should be disclosed.
2. Provenance: whether origin and processing records should be preserved or disclosed.
3. Integrity: whether the inspected source stayed byte-identical.

When remediation is requested later, name exact fields and create a separate copy. Never modify the only source artifact. Re-audit the derived copy and report any provenance invalidation or coverage gap caused by the edit.

## Sources

- Anthropic, [How Claude marks AI-generated content](https://support.claude.com/en/articles/16266773-how-claude-marks-ai-generated-content)
- Kirchenbauer et al., [A Watermark for Large Language Models](https://arxiv.org/abs/2301.10226) (research mechanism example, not a Claude implementation specification)
- Coalition for Content Provenance and Authenticity, [C2PA technical specification](https://spec.c2pa.org/specifications/specifications/2.4/specs/ContentCredentials.html)
- Content Authenticity Initiative, [Using C2PA Tool](https://github.com/contentauth/c2pa-rs/blob/main/cli/docs/usage.md)
- Phil Harvey, [ExifTool application documentation](https://exiftool.org/exiftool_pod2.html)
