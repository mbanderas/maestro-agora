import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildOverlapIndex, bandFor, compare, phraseOverlap } from "../scripts/voice/check.mjs";
import { coreFeatureVector, measure, movingAverageTypeTokenRatio } from "../scripts/voice/features.mjs";
import { CERTIFICATION_FLOOR, admissionTier, runGates } from "../scripts/voice/gates.mjs";
import { cleanDocument, collectCorpus, refusalMessage } from "../scripts/voice/ingest.mjs";
import { PIPELINE, percentile, segmentParagraphs, segmentSentences, tokenize } from "../scripts/voice/pipeline.mjs";
import { ownedVocabulary, renderProfile, selectExcerpts } from "../scripts/voice/profile.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Built from code points because this repository holds a zero U+2014 and zero
// curly-quote invariant across every file, including this one.
const EM_DASH = String.fromCodePoint(0x2014);
const RIGHT_SINGLE_QUOTE = String.fromCodePoint(0x2019);
const BANNED_TYPOGRAPHY = new RegExp(
  `[${[0x2014, 0x2018, 0x2019, 0x201c, 0x201d].map((point) => String.fromCodePoint(point)).join("")}]`,
);

// A deterministic generator with genuine within-document variation, so the
// stability gates are exercised against spread rather than against a corpus of
// near-identical sentences.
function syntheticDocument(seedWord, paragraphs, seed = 1) {
  let state = seed * 7919 + seedWord.length * 104729;
  const next = () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
  const short = [
    "Nobody wrote it down.",
    "We changed the routine.",
    "That was the whole problem.",
    "It cost us a delivery.",
    "The sheet stayed blank.",
  ];
  const long = [
    `Because the count was late the order went out against a number that was already wrong, and the ${seedWord} delivery arrived short by the middle of the week.`,
    `A supplier can only answer the question you actually asked, so we started asking a different one about ${seedWord} stock on the Monday review.`,
    `The invoice tells you what arrived and what you were charged for it, but it does not tell you what the ${seedWord} team actually used.`,
    `We do not have a stock problem in the ${seedWord} room, and it took two quarters of arguing about it before anyone checked the counting sheet.`,
  ];
  const blocks = [];
  for (let index = 0; index < paragraphs; index += 1) {
    const sentences = [];
    const count = 2 + Math.floor(next() * 4);
    for (let position = 0; position < count; position += 1) {
      sentences.push(next() < 0.45 ? short[Math.floor(next() * short.length)] : long[Math.floor(next() * long.length)]);
    }
    blocks.push(sentences.join(" "));
  }
  return blocks.join("\n\n");
}

test("the pipeline is frozen and its stages are named", () => {
  assert.equal(PIPELINE.tokenizer, "agora-word/1");
  assert.equal(PIPELINE.segmenter, "agora-sentence/1");
  assert.equal(PIPELINE.lexicon, "agora-lexicon/1");
  assert.match(PIPELINE.parser, /^none:/);
});

test("the tokenizer keeps contractions whole and folds curly quotes", () => {
  assert.deepEqual(tokenize("Don't stop."), ["don't", "stop"]);
  assert.deepEqual(tokenize(`Don${RIGHT_SINGLE_QUOTE}t stop.`), ["don't", "stop"]);
  assert.deepEqual(tokenize("well-known cases"), ["well-known", "cases"]);
  assert.deepEqual(tokenize("Row 42 held 3 items."), ["row", "42", "held", "3", "items"]);
});

test("the segmenter respects abbreviations and initials", () => {
  assert.deepEqual(segmentSentences("Dr. Smith went home. He was tired."), [
    "Dr. Smith went home.",
    "He was tired.",
  ]);
  assert.equal(segmentSentences("We shipped it, e.g. on Monday. Then we stopped.").length, 2);
  assert.equal(segmentSentences("J. R. Hartley wrote a book. It sold well.").length, 2);
  assert.deepEqual(segmentSentences("Was it ready? Yes! Ship it."), ["Was it ready?", "Yes!", "Ship it."]);
});

test("paragraphs split on blank lines and ignore empty blocks", () => {
  assert.equal(segmentParagraphs("One line.\n\n\n\nTwo line.\n\n   \n\nThree.").length, 3);
});

test("percentiles use the linear-interpolation definition", () => {
  assert.equal(percentile([1, 2, 3, 4], 0.5), 2.5);
  assert.equal(percentile([10], 0.9), 10);
  assert.equal(percentile([], 0.5), null);
});

test("measurement is stable across repeated runs on the same input", () => {
  const text = syntheticDocument("kitchen", 12);
  assert.deepEqual(measure(text), measure(text));
  assert.deepEqual(coreFeatureVector(measure(text)), coreFeatureVector(measure(text)));
});

test("raw type-token ratio is withheld and window measures are used instead", () => {
  const measured = measure(syntheticDocument("counting", 30));
  assert.match(measured.lexical_diversity.raw_type_token_ratio_withheld, /falls mechanically/);
  assert.equal(Object.hasOwn(measured.lexical_diversity, "type_token_ratio"), false);
  assert.equal(movingAverageTypeTokenRatio(["a", "b", "c"], 500), null);
});

test("statistics that need observations are withheld rather than guessed", () => {
  const short = measure("One short line. Another short line.");
  assert.equal(short.sentence_length.p10, null);
  assert.equal(short.sentence_length.bins_percent, null);
  assert.equal(short.lexical_diversity.mattr, null);
  assert.equal(short.contractions.rate_percent, null);
});

test("the contraction rate is scoped to eligible contexts, not raw count", () => {
  const contracted = measure(new Array(30).fill("I don't know and it's fine.").join(" ")).contractions;
  assert.ok(contracted.eligible_contexts >= 20);
  assert.equal(contracted.rate_percent, 100);
  const expanded = measure(new Array(30).fill("I do not know and it is fine.").join(" ")).contractions;
  assert.equal(expanded.rate_percent, 0);
});

test("cleaning removes quotations, code, tables, and headings before counting", () => {
  const raw = [
    "---",
    "title: something",
    "---",
    "",
    "# A house-written headline",
    "",
    "The author wrote this sentence and this one too.",
    "",
    "> A quotation that belongs to somebody else entirely.",
    "",
    "```",
    "const code = 1;",
    "```",
    "",
    "| a | b |",
    "|---|---|",
    "| 1 | 2 |",
  ].join("\n");
  const cleaned = cleanDocument(raw, { source: "sample.md", format: "markdown" });
  assert.match(cleaned.text, /The author wrote this sentence/);
  assert.doesNotMatch(cleaned.text, /quotation that belongs/);
  assert.doesNotMatch(cleaned.text, /const code/);
  assert.doesNotMatch(cleaned.text, /house-written headline/);
  assert.equal(cleaned.removed.frontmatter, 1);
  assert.equal(cleaned.removed.blockquotes, 1);
  assert.equal(cleaned.removed.headings, 1);
  assert.ok(cleaned.clean_words < cleaned.raw_words);
});

test("binary document formats are refused by name rather than partly extracted", () => {
  for (const extension of [".docx", ".pdf", ".rtf"]) {
    const message = refusalMessage("letter" + extension, extension);
    assert.match(message, /not supported/);
    assert.match(message, /Export it to Markdown, plain text, or HTML/);
  }
});

test("typography habits are counted before normalization", () => {
  const cleaned = cleanDocument(`A line${EM_DASH}with a dash and a ${RIGHT_SINGLE_QUOTE}quote${RIGHT_SINGLE_QUOTE}.`, {
    source: "x.md",
    format: "markdown",
  });
  assert.equal(cleaned.typography.em_dash, 1);
  assert.equal(cleaned.typography.curly_single, 2);
});

test("a corpus below the certification floor is refused, not degraded", () => {
  const tier = admissionTier(CERTIFICATION_FLOOR - 1);
  assert.equal(tier.certified, false);
  assert.equal(tier.confidence, null);
  assert.match(tier.reason, /below the 5000-word certification floor/);

  assert.equal(admissionTier(7000).confidence, "low");
  assert.equal(admissionTier(12000).confidence, "medium");
  assert.equal(admissionTier(25000).confidence, "production");
});

test("document independence enforces its two governance defaults", () => {
  const documents = [
    { source: "one.md", text: syntheticDocument("one", 200), clean_words: 9000, tokens: [], register: "blog" },
    { source: "two.md", text: syntheticDocument("two", 20), clean_words: 900, tokens: [], register: "blog" },
  ];
  const gates = runGates(documents, measure(documents.map((item) => item.text).join("\n\n")));
  assert.equal(gates.independence.passed, false);
  assert.match(gates.independence.failures.join(" "), /only 2 independently composed documents/);
  assert.match(gates.independence.failures.join(" "), /percent of the clean tokens/);
});

test("a register earns its own numbers only above the governance default", () => {
  const documents = [];
  for (let index = 0; index < 12; index += 1) {
    const text = syntheticDocument(`blog${index}`, 12);
    documents.push({ source: `blog-${index}.md`, text, tokens: tokenize(text), clean_words: tokenize(text).length, register: "blog" });
  }
  const thin = syntheticDocument("note", 2);
  documents.push({ source: "note.md", text: thin, tokens: tokenize(thin), clean_words: tokenize(thin).length, register: "email" });

  const gates = runGates(documents, measure(documents.map((item) => item.text).join("\n\n")));
  const blog = gates.registers.find((entry) => entry.register === "blog");
  const email = gates.registers.find((entry) => entry.register === "email");
  assert.equal(blog.numeric, true);
  assert.ok(blog.measured);
  assert.equal(email.numeric, false);
  assert.equal(email.measured, null);
  assert.match(email.note, /2500 clean words across 3 independent documents/);
});

test("no owned-vocabulary allowlist is issued below the certification floor", () => {
  const documents = [{ source: "a.md", tokens: tokenize("leverage leverage leverage"), register: "blog" }];
  const withheld = ownedVocabulary(documents, false);
  assert.equal(withheld.withheld, true);
  assert.deepEqual(withheld.allowlist, []);
});

test("the allowlist holds only measured words that the generic ban would strip", () => {
  const documents = [];
  for (let index = 0; index < 4; index += 1) {
    documents.push({
      source: `doc-${index}.md`,
      register: "blog",
      tokens: tokenize("we leverage the shelf count and the shelf count works because we leverage it"),
    });
  }
  const owned = ownedVocabulary(documents, true);
  assert.ok(owned.allowlist.some((entry) => entry.token === "leverage"));
  assert.equal(owned.allowlist.every((entry) => entry.token !== "shelf"), true);
  assert.ok(owned.distinctive.some((entry) => entry.token === "shelf"));
  assert.equal(owned.distinctive.every((entry) => entry.token !== "the"), true);
});

test("excerpts are stratified across sources and include a weaker passage", () => {
  const documents = [];
  for (let index = 0; index < 6; index += 1) {
    const text = syntheticDocument(`source${index}`, 3);
    documents.push({ source: `doc-${index}.md`, text, tokens: tokenize(text), register: index % 2 ? "email" : "blog" });
  }
  const measured = measure(documents.map((item) => item.text).join("\n\n"));
  const excerpts = selectExcerpts(documents, measured);
  assert.ok(excerpts.length > 1);
  assert.ok(excerpts.some((excerpt) => excerpt.demonstrates.includes("weaker passage")));
  assert.ok(new Set(excerpts.map((excerpt) => excerpt.register)).size > 1);
});

test("phrase overlap matches token runs through the hashed index", () => {
  const corpus = [{ source: "a.md", tokens: tokenize("the counting sheet records what arrived and what was used here") }];
  const index = buildOverlapIndex(corpus);
  assert.equal(Object.values(index.hashes).length > 0, true);
  const hits = phraseOverlap("the counting sheet records what arrived and what was used here", index);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].source, "a.md");
  assert.deepEqual(phraseOverlap("a completely different string of words entirely unrelated", index), []);
  // The index stores hashes, never the corpus prose.
  assert.equal(JSON.stringify(index).includes("counting sheet"), false);
});

test("draft length bands gate what the check may conclude", () => {
  assert.equal(bandFor(200).scored, false);
  assert.match(bandFor(200).note, /No global match score/);
  assert.equal(bandFor(1200).label, "provisional");
  assert.equal(bandFor(3000).label, "full set with sampling uncertainty");
  assert.equal(bandFor(9000).label, "full distributional comparison");
});

test("a wrong-register comparison produces no score at all", () => {
  const profile = measure(syntheticDocument("kitchen", 40));
  const result = compare(syntheticDocument("kitchen", 20), profile, { registerMatched: false });
  assert.match(result.verdict, /^no score: the draft register does not match/);
});

test("a draft matching its profile stays within profile, and a divergent one drifts", () => {
  const profile = measure(syntheticDocument("kitchen", 60));
  const same = compare(syntheticDocument("kitchen", 30), profile);
  assert.equal(same.verdict, "within profile");

  const divergent = new Array(180)
    .fill("Stop. Wait. Go. Now. Yes. No. Fine. Done. Next. Move.")
    .join(" ");
  const drifted = compare(divergent, profile);
  assert.equal(drifted.verdict, "drifted");
  assert.equal(drifted.largest_deviations.length, 3);
});

test("a full build refuses a thin corpus and certifies an adequate one", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "agora-voice-"));
  try {
    const blog = join(workspace, "blog");
    const email = join(workspace, "email");
    await mkdir(blog, { recursive: true });
    await mkdir(email, { recursive: true });
    for (let index = 0; index < 8; index += 1) {
      await writeFile(join(blog, `post-${index}.md`), `# Heading ${index}\n\n${syntheticDocument(`blog${index}`, 14)}`, "utf8");
    }
    for (let index = 0; index < 5; index += 1) {
      await writeFile(join(email, `note-${index}.md`), syntheticDocument(`email${index}`, 10), "utf8");
    }

    const corpus = await collectCorpus([blog, email], { cwd: workspace });
    assert.equal(corpus.documents.length, 13);
    assert.deepEqual(corpus.refused, []);
    for (const document of corpus.documents) document.register = document.source.includes("post") ? "blog" : "email";

    const measured = measure(corpus.documents.map((document) => document.text).join("\n\n"));
    const gates = runGates(corpus.documents, measured);
    assert.equal(gates.certified, true);
    assert.ok(gates.clean_words >= CERTIFICATION_FLOOR);

    const rendered = renderProfile({
      name: "fixture",
      measured,
      gates,
      corpus,
      pipeline: PIPELINE,
      now: "2026-08-09",
    });
    for (const heading of [
      "## Measured",
      "## Structural habits",
      "## Vocabulary",
      "## Calibration",
      "## Excerpts",
      "## Not captured",
    ]) {
      assert.ok(rendered.includes(heading), `profile is missing ${heading}`);
    }
    assert.match(rendered, /^---\nname: fixture\n/);
    assert.match(rendered, /confidence: (low|medium|production)/);
    assert.match(rendered, /Voice enters at level 6 of the conflict hierarchy/);
    assert.match(rendered, /U\+2014 ban is an immutable output constraint|costs this profile nothing/);
    assert.equal(rendered.includes(EM_DASH), false);
    // Rendering is deterministic for a fixed corpus and a fixed date.
    assert.equal(
      rendered,
      renderProfile({ name: "fixture", measured, gates, corpus, pipeline: PIPELINE, now: "2026-08-09" }),
    );

    const thin = await collectCorpus([join(blog, "post-0.md")], { cwd: workspace });
    const thinGates = runGates(thin.documents, measure(thin.documents[0].text));
    assert.equal(thinGates.certified, false);
    assert.equal(thinGates.heterogeneity.stopped, true);
  } finally {
    await rm(workspace, { force: true, recursive: true });
  }
});

test("shipped voice sources carry no banned typography", async () => {
  for (const file of [
    "scripts/voice-measure.mjs",
    "scripts/voice/check.mjs",
    "scripts/voice/features.mjs",
    "scripts/voice/gates.mjs",
    "scripts/voice/ingest.mjs",
    "scripts/voice/lexicon.mjs",
    "scripts/voice/pipeline.mjs",
    "scripts/voice/profile.mjs",
  ]) {
    const content = await readFile(join(ROOT, file), "utf8");
    assert.doesNotMatch(content, BANNED_TYPOGRAPHY, `${file} contains banned typography`);
    assert.doesNotMatch(content, /\r\n/, `${file} must use LF line endings`);
  }
});
