#!/usr/bin/env node

// agora-voice: the measurement engine behind VOICE.
//
// `voice build` is a measurement task, not a description task. A model asked to
// describe an author's voice writes flattery, so every number this tool reports
// is computed from the corpus by a frozen pipeline and anything the corpus
// cannot support is written as insufficient data rather than guessed.
//
// Profiles are written to ~/.agora/voices/, never inside the skill directory.
// The documented update path replaces the installed skill directory, so a
// profile stored there is destroyed silently on the next update.

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildOverlapIndex, compare, phraseOverlap, renderReport } from "./voice/check.mjs";
import { measure } from "./voice/features.mjs";
import { runGates } from "./voice/gates.mjs";
import { collectCorpus } from "./voice/ingest.mjs";
import { PIPELINE } from "./voice/pipeline.mjs";
import { renderProfile } from "./voice/profile.mjs";

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,62}$/;

function usage() {
  return `agora-voice: measure a corpus, write a voice profile, check a draft against one.

Usage:
  agora-voice build --name <slug> --from <path|url> [--from <path|url>]...
  agora-voice list
  agora-voice check --voice <slug> <draft path>
  agora-voice default --voice <slug>

Options:
  --name <slug>       Profile slug. Lowercase letters, digits, and hyphens.
  --from <path|url>   Corpus source. A file, a directory, or an http(s) URL.
                      Repeatable. Directories expand to readable text files.
  --register <name>   Label applied to every --from that follows it, until the
                      next --register. A register earns its own numbers only at
                      2,500 clean words across 3 independent documents.
  --voice <slug>      Profile to check against or to make the default.
  --store <path>      Profile directory. Defaults to ~/.agora/voices.
  --keep-headings     Count headings as author prose. Off by default, because
                      headlines are often house-written.
  --now <iso date>    Freeze the created and updated dates. For reproducible runs.
  --json              Machine-readable output.
  -h, --help          Show this help.

Markdown, plain text, and HTML are read. Binary document formats are refused by
name rather than partially extracted, because a partial extraction would move
every admission threshold without saying so.

Examples:
  agora-voice build --name house --register blog --from ./posts --register email --from ./letters
  agora-voice check --voice house ./draft.md`;
}

function parseArgs(argv) {
  const options = {
    command: null,
    name: null,
    voice: null,
    store: null,
    sources: [],
    positional: [],
    keepHeadings: false,
    now: null,
    json: false,
    help: false,
  };
  let register = null;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const takeValue = () => {
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) throw new Error(`${arg} requires a value`);
      index += 1;
      return next;
    };

    if (arg === "-h" || arg === "--help") options.help = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--keep-headings") options.keepHeadings = true;
    else if (arg === "--name") options.name = takeValue();
    else if (arg === "--voice") options.voice = takeValue();
    else if (arg === "--store") options.store = takeValue();
    else if (arg === "--now") options.now = takeValue();
    else if (arg === "--register") register = takeValue();
    else if (arg === "--from") options.sources.push({ source: takeValue(), register });
    else if (arg.startsWith("--")) throw new Error(`unknown option: ${arg}`);
    else if (options.command === null) options.command = arg;
    else options.positional.push(arg);
  }
  options.register = register;
  return options;
}

function storeDirectory(options) {
  return options.store ? resolve(options.store) : join(homedir(), ".agora", "voices");
}

async function readIndex(directory) {
  try {
    return JSON.parse(await readFile(join(directory, "index.json"), "utf8"));
  } catch {
    return { default: null, profiles: {} };
  }
}

async function writeIndex(directory, index) {
  await writeFile(join(directory, "index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
}

function assertSlug(slug, option) {
  if (!slug) throw new Error(`${option} is required`);
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`${option} must be lowercase letters, digits, and hyphens: got '${slug}'`);
  }
}

function reportGates(gates, corpus, refusedFirst = true) {
  const lines = [];
  if (refusedFirst && corpus.refused.length > 0) {
    lines.push("Refused sources:", ...corpus.refused.map((message) => `  ${message}`), "");
  }
  lines.push(
    `Documents:   ${corpus.documents.length}`,
    `Clean words: ${gates.clean_words} (raw ${corpus.documents.reduce((total, document) => total + document.raw_words, 0)})`,
    `Tier:        ${gates.tier.disposition}. ${gates.tier.reason}`,
    `Independence: ${gates.independence.passed ? "passed" : "failed"}`,
  );
  for (const failure of gates.independence.failures) lines.push(`  ${failure}`);
  lines.push("Registers:");
  for (const entry of gates.registers) {
    lines.push(
      `  ${entry.register}: ${entry.clean_words} clean words across ${entry.documents} documents, ${entry.numeric ? "own numbers issued" : `qualitative only (${entry.note})`}`,
    );
  }
  if (gates.stability.length > 0) {
    const unstable = gates.stability.filter((entry) => !entry.stable);
    lines.push(
      `Feature stability: ${gates.stability.length - unstable.length} of ${gates.stability.length} core features stable`,
    );
    for (const entry of unstable) lines.push(`  dropped ${entry.feature}: ${entry.reason}`);
  }
  if (gates.heterogeneity.stopped) {
    lines.push("Heterogeneity stop: this corpus is not profileable as one voice.");
    for (const reason of gates.heterogeneity.reasons) lines.push(`  ${reason}`);
    if (gates.heterogeneity.remedy) lines.push(`  ${gates.heterogeneity.remedy}`);
  }
  return lines.join("\n");
}

async function build(options) {
  assertSlug(options.name, "--name");
  if (options.sources.length === 0) throw new Error("build needs at least one --from source");

  // Collect one source group at a time so each document carries the register
  // label that was in force when its --from was named.
  const corpus = { documents: [], refused: [] };
  const seen = new Set();
  for (const entry of options.sources) {
    const group = await collectCorpus([entry.source], { keepHeadings: options.keepHeadings });
    corpus.refused.push(...group.refused);
    for (const document of group.documents) {
      if (seen.has(document.source)) continue;
      seen.add(document.source);
      corpus.documents.push({ ...document, register: entry.register });
    }
  }
  corpus.documents.sort((left, right) => left.source.localeCompare(right.source));

  if (corpus.documents.length === 0) {
    const detail = corpus.refused.length > 0 ? `\n\nRefused sources:\n  ${corpus.refused.join("\n  ")}` : "";
    throw new Error(`no readable documents were found in the supplied sources${detail}`);
  }

  const pooledText = corpus.documents.map((document) => document.text).join("\n\n");
  const measured = measure(pooledText);
  const gates = runGates(corpus.documents, measured);
  const now = options.now || new Date().toISOString().slice(0, 10);

  if (!gates.certified) {
    const report = [
      "No profile was certified.",
      "",
      reportGates(gates, corpus),
      "",
      "Nothing was written. Report what the corpus needs, supply it, and rerun.",
    ].join("\n");
    if (options.json) {
      process.stdout.write(`${JSON.stringify({ certified: false, gates, refused: corpus.refused }, null, 2)}\n`);
    } else {
      process.stdout.write(`${report}\n`);
    }
    process.exitCode = 1;
    return;
  }

  const directory = storeDirectory(options);
  await mkdir(directory, { recursive: true });
  const profilePath = join(directory, `${options.name}.md`);
  const measurementsPath = join(directory, `${options.name}.measurements.json`);

  await writeFile(profilePath, renderProfile({ name: options.name, measured, gates, corpus, pipeline: PIPELINE, now }), "utf8");
  await writeFile(
    measurementsPath,
    `${JSON.stringify(
      {
        name: options.name,
        updated: now,
        pipeline: PIPELINE,
        confidence: gates.tier.confidence,
        measured,
        registers: gates.registers.map((entry) => ({
          register: entry.register,
          numeric: entry.numeric,
          measured: entry.measured,
        })),
        // Hashed token runs only. The store never holds the corpus prose.
        overlap_index: buildOverlapIndex(corpus.documents),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const index = await readIndex(directory);
  index.profiles[options.name] = {
    documents: corpus.documents.length,
    clean_words: gates.clean_words,
    registers: gates.registers.map((entry) => entry.register),
    confidence: gates.tier.confidence,
    pipeline: PIPELINE,
    updated: now,
  };
  if (!index.default) index.default = options.name;
  await writeIndex(directory, index);

  if (options.json) {
    process.stdout.write(`${JSON.stringify({ certified: true, profile: profilePath, gates }, null, 2)}\n`);
    return;
  }
  process.stdout.write(
    [
      `Wrote ${profilePath}`,
      `Wrote ${measurementsPath}`,
      "",
      reportGates(gates, corpus),
      "",
      "Read the profile's `## Not captured` section before writing with it. It lists what this corpus could not tell us.",
      "",
    ].join("\n"),
  );
}

async function list(options) {
  const directory = storeDirectory(options);
  const index = await readIndex(directory);
  const names = Object.keys(index.profiles).sort();
  if (options.json) {
    process.stdout.write(`${JSON.stringify({ store: directory, ...index }, null, 2)}\n`);
    return;
  }
  if (names.length === 0) {
    process.stdout.write(`No profiles in ${directory}.\n`);
    return;
  }
  process.stdout.write(`Profiles in ${directory}:\n`);
  for (const name of names) {
    const entry = index.profiles[name];
    process.stdout.write(
      `  ${name}${index.default === name ? " (default)" : ""}: ${entry.clean_words} clean words, ${entry.documents} documents, registers [${entry.registers.join(", ")}], confidence ${entry.confidence}, updated ${entry.updated}\n`,
    );
  }
}

async function check(options) {
  const directory = storeDirectory(options);
  const index = await readIndex(directory);
  const slug = options.voice || index.default;
  assertSlug(slug, "--voice");
  const draftPath = options.positional[0];
  if (!draftPath) throw new Error("check needs a draft path");

  let stored;
  try {
    stored = JSON.parse(await readFile(join(directory, `${slug}.measurements.json`), "utf8"));
  } catch {
    throw new Error(`no measurements found for '${slug}' in ${directory}. Run build first.`);
  }
  for (const [stage, version] of Object.entries(PIPELINE)) {
    if (stored.pipeline[stage] !== version) {
      throw new Error(
        `pipeline mismatch on ${stage}: the profile was built with '${stored.pipeline[stage]}' and this tool runs '${version}'. A comparison across two pipelines is not a comparison. Rebuild the profile.`,
      );
    }
  }

  const draft = await readFile(resolve(draftPath), "utf8");
  const requested = options.register ?? null;
  const subprofile = requested
    ? stored.registers.find((entry) => entry.register === requested && entry.numeric)
    : null;
  const registerMatched = requested === null || Boolean(subprofile);
  const reference = subprofile?.measured ?? stored.measured;

  const result = compare(draft, reference, { registerMatched });
  const overlaps = phraseOverlap(draft, stored.overlap_index);

  if (options.json) {
    process.stdout.write(`${JSON.stringify({ voice: slug, draft: basename(draftPath), result, overlaps }, null, 2)}\n`);
    return;
  }
  process.stdout.write(
    `Checking ${basename(draftPath)} against '${slug}'${requested ? ` (register ${requested})` : ""}\n\n${renderReport(result, overlaps)}\n`,
  );
}

async function setDefault(options) {
  assertSlug(options.voice, "--voice");
  const directory = storeDirectory(options);
  const index = await readIndex(directory);
  if (!index.profiles[options.voice]) throw new Error(`no profile named '${options.voice}' in ${directory}`);
  index.default = options.voice;
  await writeIndex(directory, index);
  process.stdout.write(`Default voice is now '${options.voice}'.\n`);
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n\n${usage()}\n`);
    process.exitCode = 1;
    return;
  }
  if (options.help || options.command === null) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  const commands = { build, list, check, default: setDefault };
  const handler = commands[options.command];
  if (!handler) {
    process.stderr.write(`Error: unknown command '${options.command}'\n\n${usage()}\n`);
    process.exitCode = 1;
    return;
  }
  try {
    await handler(options);
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exitCode = 1;
  }
}

// Run only when invoked as a command, so the tests can import the parser.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}

export { main, parseArgs, storeDirectory };
