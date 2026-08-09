// The measured feature families.
//
// Stylometry has no single fingerprint. These families are partially
// discriminative on their own and are recorded as a bundle, never as a
// fingerprint. Anything the corpus is too small to estimate is returned as
// null so the profile can write "insufficient data" rather than guess.

import {
  BOOSTERS,
  CONTRACTION_PAIRS,
  FUNCTION_WORDS,
  HEDGES,
  MODALS,
  OPENING_CLASSES,
  PERSON_CLASSES,
  classSet,
} from "./lexicon.mjs";
import {
  mean,
  percentile,
  round,
  segmentParagraphs,
  segmentSentences,
  standardDeviation,
  tokenize,
} from "./pipeline.mjs";

// Governance defaults for the minimum observations a statistic needs before it
// is reported. Below these counts the value is unstable rather than merely
// noisy, so it is withheld.
export const MIN_SENTENCES_FOR_SPREAD = 30;
export const MIN_SENTENCES_FOR_TAILS = 60;
export const MIN_PARAGRAPHS_FOR_SPREAD = 20;
export const MATTR_WINDOW = 500;
export const MTLD_THRESHOLD = 0.72;

const HEDGE_SET = classSet(HEDGES);
const BOOSTER_SET = classSet(BOOSTERS);
const MODAL_SET = classSet(MODALS);

function rate(count, total, per) {
  if (!total) return null;
  return round((count / total) * per, 2);
}

function countIn(tokens, set) {
  return tokens.reduce((total, token) => total + (set.has(token) ? 1 : 0), 0);
}

/** Moving-average type-token ratio. Raw ratio is never reported on its own. */
export function movingAverageTypeTokenRatio(tokens, window = MATTR_WINDOW) {
  if (tokens.length < window) return null;
  const counts = new Map();
  let types = 0;
  let total = 0;
  let windows = 0;
  for (let index = 0; index < tokens.length; index += 1) {
    const entering = tokens[index];
    const enteringCount = counts.get(entering) || 0;
    if (enteringCount === 0) types += 1;
    counts.set(entering, enteringCount + 1);
    if (index >= window) {
      const leaving = tokens[index - window];
      const leavingCount = counts.get(leaving);
      if (leavingCount === 1) types -= 1;
      counts.set(leaving, leavingCount - 1);
    }
    if (index >= window - 1) {
      total += types / window;
      windows += 1;
    }
  }
  return windows === 0 ? null : round(total / windows, 3);
}

function mtldPass(tokens) {
  let factors = 0;
  let types = new Set();
  let counted = 0;
  let ratio = 1;
  for (const token of tokens) {
    counted += 1;
    types.add(token);
    ratio = types.size / counted;
    if (ratio <= MTLD_THRESHOLD) {
      factors += 1;
      types = new Set();
      counted = 0;
      ratio = 1;
    }
  }
  if (counted > 0 && ratio < 1) factors += (1 - ratio) / (1 - MTLD_THRESHOLD);
  return factors === 0 ? null : tokens.length / factors;
}

/** Decay-based lexical diversity, forward and backward passes averaged. */
export function measureOfTextualLexicalDiversity(tokens) {
  if (tokens.length < 100) return null;
  const forward = mtldPass(tokens);
  const backward = mtldPass([...tokens].reverse());
  if (forward === null || backward === null) return null;
  return round((forward + backward) / 2, 2);
}

function distribution(values, { minimum, tailMinimum, places = 2 }) {
  if (values.length === 0) return { observations: 0 };
  const sorted = [...values].sort((left, right) => left - right);
  const average = mean(sorted);
  const spread = values.length >= minimum ? standardDeviation(sorted) : null;
  const tails = values.length >= tailMinimum;
  return {
    observations: values.length,
    mean: round(average, places),
    median: round(percentile(sorted, 0.5), places),
    standard_deviation: round(spread, places),
    coefficient_of_variation: spread === null || !average ? null : round(spread / average, 3),
    p10: tails ? round(percentile(sorted, 0.1), places) : null,
    p90: tails ? round(percentile(sorted, 0.9), places) : null,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

function sentenceLengthBins(lengths) {
  if (lengths.length === 0) return null;
  const edges = [8, 15, 25, 35];
  const labels = ["under_8", "8_to_14", "15_to_24", "25_to_34", "35_and_over"];
  const counts = new Array(labels.length).fill(0);
  for (const length of lengths) {
    let bin = edges.length;
    for (let index = 0; index < edges.length; index += 1) {
      if (length < edges[index]) {
        bin = index;
        break;
      }
    }
    counts[bin] += 1;
  }
  return Object.fromEntries(labels.map((label, index) => [label, rate(counts[index], lengths.length, 100)]));
}

/**
 * Clause structure, computed as a conjunction and punctuation proxy. No
 * dependency parser ships here, so these are labelled proxies everywhere they
 * appear and must never be compared against parser-derived figures.
 */
function clauseProxy(sentences) {
  const subordinators = classSet(OPENING_CLASSES.subordinator);
  const coordinators = classSet(OPENING_CLASSES.coordinator);
  let units = 0;
  let subordinate = 0;
  for (const sentence of sentences) {
    const tokens = tokenize(sentence);
    const subordinateHere = countIn(tokens, subordinators);
    const coordinateHere = countIn(tokens, coordinators);
    units += 1 + subordinateHere + coordinateHere;
    subordinate += subordinateHere;
  }
  if (sentences.length === 0) return { clause_units_per_sentence: null, subordination_ratio: null };
  return {
    clause_units_per_sentence: round(units / sentences.length, 2),
    subordination_ratio: units === 0 ? null : round(subordinate / units, 3),
  };
}

// Checked in this order: the first matching class wins, so a word appearing in
// two lists is always resolved the same way.
const OPENING_ORDER = [
  "coordinator",
  "subordinator",
  "question_word",
  "discourse_marker",
  "subject_pronoun",
  "expletive",
  "determiner",
  "adverbial",
  "preposition",
];
const OPENING_SETS = OPENING_ORDER.map((name) => [name, classSet(OPENING_CLASSES[name])]);

function openingClass(sentence) {
  const tokens = tokenize(sentence);
  if (tokens.length === 0) return "other";
  const first = tokens[0];
  for (const [name, words] of OPENING_SETS) {
    if (words.has(first)) return name;
  }
  return "other";
}

function openings(sentences) {
  const counts = new Map();
  let repeats = 0;
  let previous = null;
  for (const sentence of sentences) {
    const name = openingClass(sentence);
    counts.set(name, (counts.get(name) || 0) + 1);
    if (name === previous) repeats += 1;
    previous = name;
  }
  const shares = Object.fromEntries(
    [...counts.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .map(([name, count]) => [name, rate(count, sentences.length, 100)]),
  );
  return {
    class_share_percent: shares,
    distinct_classes: counts.size,
    consecutive_repeat_percent: sentences.length < 2 ? null : rate(repeats, sentences.length - 1, 100),
  };
}

/**
 * Contraction rate inside contexts where both forms were grammatical. A raw
 * count is not comparable across registers; an opportunity-scoped rate is.
 */
function contractions(tokens) {
  const joined = ` ${tokens.join(" ")} `;
  let contracted = 0;
  let expanded = 0;
  for (const pair of CONTRACTION_PAIRS) {
    for (const form of pair.contracted) {
      contracted += (joined.split(` ${form} `).length - 1);
    }
    for (const words of pair.expanded) {
      expanded += (joined.split(` ${words.join(" ")} `).length - 1);
    }
  }
  const eligible = contracted + expanded;
  return {
    eligible_contexts: eligible,
    contracted,
    rate_percent: eligible < 20 ? null : rate(contracted, eligible, 100),
  };
}

function punctuation(text, tokenCount) {
  const marks = {
    comma: /,/g,
    semicolon: /;/g,
    colon: /:/g,
    parenthesis: /\(/g,
    exclamation: /!/g,
    question: /\?/g,
    dash_hyphen: / - /g,
  };
  const output = {};
  for (const [name, pattern] of Object.entries(marks)) {
    output[name] = rate((text.match(pattern) || []).length, tokenCount, 1000);
  }
  return output;
}

function functionWords(tokens) {
  const output = {};
  for (const [name, words] of Object.entries(FUNCTION_WORDS)) {
    output[name] = rate(countIn(tokens, classSet(words)), tokens.length, 1000);
  }
  return output;
}

function personAndStance(tokens, sentenceCount, questionCount) {
  const person = {};
  for (const [name, words] of Object.entries(PERSON_CLASSES)) {
    person[name] = rate(countIn(tokens, classSet(words)), tokens.length, 1000);
  }
  const hedges = countIn(tokens, HEDGE_SET);
  const boosters = countIn(tokens, BOOSTER_SET);
  return {
    person,
    hedges_per_1000: rate(hedges, tokens.length, 1000),
    boosters_per_1000: rate(boosters, tokens.length, 1000),
    modals_per_1000: rate(countIn(tokens, MODAL_SET), tokens.length, 1000),
    hedge_to_booster_ratio: boosters === 0 ? null : round(hedges / boosters, 3),
    questions_per_100_sentences: rate(questionCount, sentenceCount, 100),
  };
}

/** Measure one body of text. Returns every family plus its observation counts. */
export function measure(text) {
  const paragraphs = segmentParagraphs(text);
  const sentences = paragraphs.flatMap((paragraph) => segmentSentences(paragraph));
  const tokens = tokenize(text);
  const sentenceLengths = sentences.map((sentence) => tokenize(sentence).length);
  const paragraphSentenceCounts = paragraphs.map((paragraph) => segmentSentences(paragraph).length);
  const paragraphWordCounts = paragraphs.map((paragraph) => tokenize(paragraph).length);
  const questionCount = sentences.filter((sentence) => sentence.trim().endsWith("?")).length;

  const stance = personAndStance(tokens, sentences.length, questionCount);

  return {
    counts: { tokens: tokens.length, sentences: sentences.length, paragraphs: paragraphs.length },
    sentence_length: {
      ...distribution(sentenceLengths, {
        minimum: MIN_SENTENCES_FOR_SPREAD,
        tailMinimum: MIN_SENTENCES_FOR_TAILS,
      }),
      bins_percent: sentences.length >= MIN_SENTENCES_FOR_SPREAD ? sentenceLengthBins(sentenceLengths) : null,
    },
    clause_structure_proxy: clauseProxy(sentences),
    function_words_per_1000: functionWords(tokens),
    punctuation_per_1000: punctuation(text, tokens.length),
    paragraph_shape: {
      sentences: distribution(paragraphSentenceCounts, {
        minimum: MIN_PARAGRAPHS_FOR_SPREAD,
        tailMinimum: MIN_PARAGRAPHS_FOR_SPREAD,
      }),
      words: distribution(paragraphWordCounts, {
        minimum: MIN_PARAGRAPHS_FOR_SPREAD,
        tailMinimum: MIN_PARAGRAPHS_FOR_SPREAD,
      }),
      one_sentence_share_percent: rate(
        paragraphSentenceCounts.filter((count) => count === 1).length,
        paragraphs.length,
        100,
      ),
    },
    lexical_diversity: {
      mattr_window: MATTR_WINDOW,
      mattr: movingAverageTypeTokenRatio(tokens),
      mtld: measureOfTextualLexicalDiversity(tokens),
      raw_type_token_ratio_withheld:
        "raw ratio falls mechanically as texts grow and is never reported across unequal lengths",
    },
    person_and_stance: stance,
    sentence_openings: openings(sentences),
    contractions: contractions(tokens),
  };
}

/** The subset of features `voice check` compares. Each is a scalar. */
export function coreFeatureVector(measured) {
  return {
    "sentence length mean": measured.sentence_length.mean,
    "sentence length median": measured.sentence_length.median,
    "sentence length standard deviation": measured.sentence_length.standard_deviation,
    "clause units per sentence (proxy)": measured.clause_structure_proxy.clause_units_per_sentence,
    "subordination ratio (proxy)": measured.clause_structure_proxy.subordination_ratio,
    "articles per 1000": measured.function_words_per_1000.articles,
    "prepositions per 1000": measured.function_words_per_1000.prepositions,
    "auxiliaries per 1000": measured.function_words_per_1000.auxiliaries,
    "conjunctions per 1000": measured.function_words_per_1000.conjunctions,
    "pronouns per 1000": measured.function_words_per_1000.pronouns,
    "commas per 1000": measured.punctuation_per_1000.comma,
    "semicolons per 1000": measured.punctuation_per_1000.semicolon,
    "colons per 1000": measured.punctuation_per_1000.colon,
    "parentheses per 1000": measured.punctuation_per_1000.parenthesis,
    "questions per 100 sentences": measured.person_and_stance.questions_per_100_sentences,
    "first person singular per 1000": measured.person_and_stance.person.first_singular,
    "first person plural per 1000": measured.person_and_stance.person.first_plural,
    "second person per 1000": measured.person_and_stance.person.second,
    "hedges per 1000": measured.person_and_stance.hedges_per_1000,
    "boosters per 1000": measured.person_and_stance.boosters_per_1000,
    "paragraph sentences mean": measured.paragraph_shape.sentences.mean,
    "one-sentence paragraph share": measured.paragraph_shape.one_sentence_share_percent,
    "contraction rate percent": measured.contractions.rate_percent,
    "moving-window lexical diversity": measured.lexical_diversity.mattr,
  };
}
