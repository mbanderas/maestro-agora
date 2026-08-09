// The frozen measurement pipeline.
//
// Stylometric values move when the tokenizer, segmenter, or normalization rules
// change, so a comparison across two pipelines is not a comparison. Every
// profile records these version strings and `voice check` refuses to score a
// draft measured under a different one.
//
// Raise the version when the behaviour of the corresponding stage changes.

import { ABBREVIATIONS } from "./lexicon.mjs";

export const TOKENIZER_VERSION = "agora-word/1";
export const SEGMENTER_VERSION = "agora-sentence/1";
export const LEXICON_VERSION = "agora-lexicon/1";
// No dependency parser ships with this package. Clause figures are punctuation
// and conjunction proxies, labelled as proxies wherever they are reported.
export const PARSER_VERSION = "none: clause metrics are conjunction proxies";

export const PIPELINE = Object.freeze({
  tokenizer: TOKENIZER_VERSION,
  segmenter: SEGMENTER_VERSION,
  lexicon: LEXICON_VERSION,
  parser: PARSER_VERSION,
});

// Typography is addressed by numeric code point throughout. This repository
// holds a zero U+2014 and zero curly-quote invariant across every file, so no
// source file may contain the characters it needs to match.
const CODE_POINTS = {
  curlySingle: [0x2018, 0x2019, 0x201a, 0x201b],
  curlyDouble: [0x201c, 0x201d, 0x201e, 0x201f],
  emDash: [0x2014],
  enDash: [0x2013],
  ellipsis: [0x2026],
  nonBreakingSpace: [0x00a0],
};

function charactersOf(name) {
  return CODE_POINTS[name].map((point) => String.fromCodePoint(point)).join("");
}

function characterClass(name) {
  return new RegExp("[" + charactersOf(name) + "]", "g");
}

const CURLY_SINGLE = characterClass("curlySingle");
const CURLY_DOUBLE = characterClass("curlyDouble");
const EM_DASH = characterClass("emDash");
const EN_DASH = characterClass("enDash");
const ELLIPSIS_CHARACTER = characterClass("ellipsis");
const ELLIPSIS_ANY = new RegExp("[" + charactersOf("ellipsis") + "]|\\.\\.\\.", "g");
const NON_BREAKING_SPACE = characterClass("nonBreakingSpace");
const WORD_PATTERN_SOURCE = "[\\p{L}\\p{N}]+(?:['-][\\p{L}\\p{N}]+)*";

/**
 * Normalize text for measurement. Curly quotes fold to straight ones so that a
 * curly and a straight contraction are the same token. Counts of the original
 * characters are taken before this runs, by countTypography.
 */
export function normalize(text) {
  return text
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(CURLY_SINGLE, "'")
    .replace(CURLY_DOUBLE, '"')
    .replace(ELLIPSIS_CHARACTER, "...")
    .replace(NON_BREAKING_SPACE, " ");
}

/** Counts of typography the profile records as habits rather than as tokens. */
export function countTypography(text) {
  return {
    em_dash: (text.match(EM_DASH) || []).length,
    en_dash: (text.match(EN_DASH) || []).length,
    curly_single: (text.match(CURLY_SINGLE) || []).length,
    curly_double: (text.match(CURLY_DOUBLE) || []).length,
    ellipsis: (text.match(ELLIPSIS_ANY) || []).length,
  };
}

function wordPattern() {
  return new RegExp(WORD_PATTERN_SOURCE, "gu");
}

function hasWord(text) {
  return new RegExp(WORD_PATTERN_SOURCE, "u").test(text);
}

/** Word tokens, lowercased. Hyphenated and apostrophed forms stay one token. */
export function tokenize(text) {
  return (normalize(text).match(wordPattern()) || []).map((token) => token.toLowerCase());
}

function endsWithAbbreviation(chunk) {
  const trailing = chunk.match(/([\p{L}.]+)\.$/u);
  if (!trailing) return false;
  const candidate = trailing[1].replace(/\.$/, "").toLowerCase();
  if (ABBREVIATIONS.has(candidate)) return true;
  // A single capital letter before a period is an initial, not a full stop.
  return /^\p{Lu}$/u.test(trailing[1]);
}

/**
 * Split a paragraph into sentences. A terminator ends a sentence when it is
 * followed by whitespace and an opening character, and when the text before it
 * is neither a frozen abbreviation nor an initial.
 */
export function segmentSentences(paragraph) {
  const text = normalize(paragraph).replace(/\s+/g, " ").trim();
  if (text === "") return [];

  const sentences = [];
  let start = 0;
  let index = 0;
  while (index < text.length) {
    if (!".!?".includes(text[index])) {
      index += 1;
      continue;
    }
    let end = index;
    while (end + 1 < text.length && ".!?".includes(text[end + 1])) end += 1;
    let after = end + 1;
    while (after < text.length && "\"')]".includes(text[after])) after += 1;

    if (after >= text.length) {
      sentences.push(text.slice(start).trim());
      start = text.length;
      break;
    }
    const breaks =
      text[after] === " " &&
      /^["'(\[]?[\p{Lu}\p{N}]/u.test(text.slice(after + 1)) &&
      !endsWithAbbreviation(text.slice(start, end + 1));
    if (breaks) {
      sentences.push(text.slice(start, after).trim());
      start = after + 1;
    }
    index = end + 1;
  }
  if (start < text.length) {
    const tail = text.slice(start).trim();
    if (tail !== "") sentences.push(tail);
  }
  return sentences.filter(hasWord);
}

/** Paragraphs are blank-line separated blocks that contain at least one word. */
export function segmentParagraphs(text) {
  return normalize(text)
    .split(/\n{2,}/)
    .map((block) => block.replace(/\n/g, " ").trim())
    .filter((block) => block !== "" && hasWord(block));
}

/**
 * Linear-interpolation percentile, the R-7 definition. Frozen: a different
 * percentile definition moves every reported tail value.
 */
export function percentile(sorted, fraction) {
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return sorted[0];
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

export function mean(values) {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function standardDeviation(values) {
  if (values.length < 2) return null;
  const average = mean(values);
  const variance = values.reduce((total, value) => total + (value - average) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/** Round to fixed places so repeated runs emit byte-identical output. */
export function round(value, places = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const factor = 10 ** places;
  return Math.round(value * factor + Number.EPSILON * factor) / factor;
}
