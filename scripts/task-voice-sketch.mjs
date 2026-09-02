import { measure } from "./voice/features.mjs";
import { buildOverlapIndex, phraseOverlap } from "./voice/check.mjs";
import { segmentParagraphs, segmentSentences, tokenize } from "./voice/pipeline.mjs";

export const TASK_VOICE_SKETCH = "TASK_VOICE_SKETCH";
export const TASK_SAMPLE_FULL_FLOOR = 3;
export const TASK_SAMPLE_MAXIMUM = 10;

const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const range = (values) => values.length
  ? { minimum: Math.min(...values), median: median(values), maximum: Math.max(...values) }
  : { minimum: null, median: null, maximum: null };

const normalizeSamples = (samples) => samples.map((sample, index) => {
  if (typeof sample === "string") return { id: `sample-${index + 1}`, text: sample, genre: null };
  if (!sample || typeof sample.text !== "string") throw new Error(`sample ${index + 1} must contain text`);
  return {
    id: sample.id || `sample-${index + 1}`,
    text: sample.text,
    genre: sample.genre || null,
  };
});

const selectSamples = (samples, genre) => {
  if (!genre) return { selected: samples, sameGenre: false };
  const sameGenre = samples.filter((sample) => sample.genre === genre);
  return sameGenre.length ? { selected: sameGenre, sameGenre: true } : { selected: samples, sameGenre: false };
};

export function buildTaskVoiceSketch(inputSamples, { genre = null } = {}) {
  if (!Array.isArray(inputSamples)) throw new Error("samples must be an array");
  if (inputSamples.length > TASK_SAMPLE_MAXIMUM) {
    throw new Error(`task voice sketches accept at most ${TASK_SAMPLE_MAXIMUM} samples`);
  }
  if (inputSamples.length === 0) {
    return {
      kind: TASK_VOICE_SKETCH,
      certified: false,
      persistence: "task-only",
      sample_count: 0,
      confidence: "fallback",
      genre,
      same_genre_samples: false,
      observations: ["No samples supplied. Preserve credible choices in the draft and use plain professional writing."],
      measurements: null,
      limitations: ["No author-sample fit can be assessed."],
    };
  }

  const normalized = normalizeSamples(inputSamples);
  const { selected, sameGenre } = selectSamples(normalized, genre);
  const text = selected.map((sample) => sample.text).join("\n\n");
  const paragraphs = segmentParagraphs(text);
  const sentences = paragraphs.flatMap((paragraph) => segmentSentences(paragraph));
  const sentenceWords = sentences.map((sentence) => tokenize(sentence).length);
  const paragraphWords = paragraphs.map((paragraph) => tokenize(paragraph).length);
  const measured = measure(text);
  const lowConfidence = selected.length < TASK_SAMPLE_FULL_FLOOR;

  return {
    kind: TASK_VOICE_SKETCH,
    certified: false,
    persistence: "task-only",
    stores_source_text: false,
    sample_count: selected.length,
    supplied_sample_count: normalized.length,
    confidence: lowConfidence ? "low: cautious local observations only" : "task-local: recurring habits may guide this task",
    genre,
    same_genre_samples: sameGenre,
    observations: [
      `Sentence length in the selected samples ranges from ${range(sentenceWords).minimum} to ${range(sentenceWords).maximum} words, with a median of ${range(sentenceWords).median}.`,
      `Paragraph length ranges from ${range(paragraphWords).minimum} to ${range(paragraphWords).maximum} words, with a median of ${range(paragraphWords).median}.`,
      `First-person singular rate is ${measured.person_and_stance.person.first_singular ?? "unavailable"} per 1000 tokens; second-person rate is ${measured.person_and_stance.person.second ?? "unavailable"}.`,
      `The contraction rate is ${measured.contractions.rate_percent ?? "unavailable at this sample size"}.`,
    ],
    measurements: {
      tokens: measured.counts.tokens,
      sentences: measured.counts.sentences,
      paragraphs: measured.counts.paragraphs,
      sentence_words: range(sentenceWords),
      paragraph_words: range(paragraphWords),
      punctuation_per_1000: measured.punctuation_per_1000,
      person_per_1000: measured.person_and_stance.person,
      contraction_rate_percent: measured.contractions.rate_percent,
    },
    limitations: [
      "This sketch does not establish identity, authorship, statistical matching, personality, or approval.",
      lowConfidence
        ? "One or two samples support only obvious local observations."
        : "Three to ten samples support task-local guidance, not a persistent certified profile.",
      "Measurements describe the samples and never set generation quotas.",
      "Source facts, examples, metaphors, slogans, anecdotes, and distinctive phrases must not transfer.",
    ],
  };
}

export function buildTaskSampleOverlapIndex(inputSamples) {
  const samples = normalizeSamples(inputSamples);
  return buildOverlapIndex(samples.map((sample) => ({ source: sample.id, tokens: tokenize(sample.text) })));
}

export function checkTaskSampleOverlap(draftText, index) {
  return phraseOverlap(draftText, index);
}
