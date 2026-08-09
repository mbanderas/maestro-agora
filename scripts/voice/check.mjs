// Adherence checking.
//
// The check computes the same features on the draft, using the same frozen
// pipeline, and reports drift against the profile with the largest deviations
// first. It reports rhythm, phrase overlap, and provenance separately, because
// merging them is how a check becomes a claim it cannot support. Author
// approval is never asserted.

import { createHash } from "node:crypto";

import { coreFeatureVector, measure } from "./features.mjs";
import { round, tokenize } from "./pipeline.mjs";

// Governance defaults. Engineering settings, not published cutoffs.
export const REVIEW_DEVIATION_SIGMA = 1.5;
export const TARGET_MEDIAN_ABSOLUTE_DEVIATION = 0.75;
export const MAX_FEATURES_IN_REVIEW_SHARE = 0.2;
export const OVERLAP_TOKEN_RUN = 8;

export const DRAFT_BANDS = [
  { max: 500, label: "local checks only", scored: false, note: "Below roughly 500 words, only local checks are permitted: sentence lengths, openings, punctuation, contractions, paragraph shape, and phrase overlap. No global match score is issued. Governance default." },
  { max: 2000, label: "provisional", scored: true, note: "Between roughly 500 and 2,000 words, common features are compared with wide tolerances and the result is labelled provisional. Governance default." },
  { max: 5000, label: "full set with sampling uncertainty", scored: true, note: "Between roughly 2,000 and 5,000 words, the full feature set is compared and sampling uncertainty is reported alongside it. Governance default." },
  { max: Infinity, label: "full distributional comparison", scored: true, note: "Above 5,000 words a full distributional comparison is defensible when the register matches and the reference corpus is itself adequate." },
];

export function bandFor(words) {
  return DRAFT_BANDS.find((band) => words <= band.max);
}

/**
 * Exact overlap of 8 or more consecutive tokens with the source corpus. The
 * token count is a governance default and an engineering review trigger. It is
 * not a legal safe harbour, and no word count is one. An overlap flag is a
 * prompt to look, not a verdict.
 */
function runHash(tokens) {
  return createHash("sha256").update(tokens.join(" ")).digest("hex").slice(0, 16);
}

/**
 * Build the stored overlap index. Only truncated hashes of each token run are
 * kept, never the prose, so the profile store never becomes a second copy of
 * the author's corpus and cannot serve as a phrase reservoir.
 */
export function buildOverlapIndex(corpusDocuments, run = OVERLAP_TOKEN_RUN) {
  const hashes = {};
  for (const document of corpusDocuments) {
    const tokens = document.tokens;
    for (let index = 0; index + run <= tokens.length; index += 1) {
      const key = runHash(tokens.slice(index, index + run));
      if (!(key in hashes)) hashes[key] = document.source;
    }
  }
  return { run, hashes };
}

export function phraseOverlap(draftText, index) {
  const run = index.run ?? OVERLAP_TOKEN_RUN;
  const draftTokens = tokenize(draftText);
  const hits = new Map();
  for (let position = 0; position + run <= draftTokens.length; position += 1) {
    const slice = draftTokens.slice(position, position + run);
    const key = runHash(slice);
    const source = index.hashes[key];
    if (source && !hits.has(key)) hits.set(key, { phrase: slice.join(" "), source });
  }
  return [...hits.values()];
}

/**
 * Compare a draft against a stored profile. Deviations are expressed in profile
 * standard deviations where the profile recorded a spread for that feature, and
 * as a relative difference where it did not.
 */
export function compare(draftText, profileMeasured, { registerMatched = true } = {}) {
  const draftMeasured = measure(draftText);
  const words = draftMeasured.counts.tokens;
  const band = bandFor(words);

  const profileVector = coreFeatureVector(profileMeasured);
  const draftVector = coreFeatureVector(draftMeasured);
  const spread = profileMeasured.sentence_length.standard_deviation;

  const deviations = [];
  for (const [name, profileValue] of Object.entries(profileVector)) {
    const draftValue = draftVector[name];
    if (profileValue === null || draftValue === null) {
      deviations.push({ feature: name, profile: profileValue, draft: draftValue, deviation: null, basis: "not comparable" });
      continue;
    }
    const scale = name.startsWith("sentence length") && spread ? spread : Math.abs(profileValue) || 1;
    const deviation = Math.abs(draftValue - profileValue) / scale;
    deviations.push({
      feature: name,
      profile: profileValue,
      draft: draftValue,
      deviation: round(deviation, 2),
      basis: name.startsWith("sentence length") && spread ? "profile standard deviations" : "relative to the profile value",
    });
  }

  const comparable = deviations.filter((entry) => entry.deviation !== null);
  comparable.sort((left, right) => right.deviation - left.deviation);
  const inReview = comparable.filter((entry) => entry.deviation > REVIEW_DEVIATION_SIGMA);
  const sortedDeviations = [...comparable].map((entry) => entry.deviation).sort((left, right) => left - right);
  const medianDeviation =
    sortedDeviations.length === 0
      ? null
      : round(sortedDeviations[Math.floor((sortedDeviations.length - 1) / 2)], 2);
  const reviewShare = comparable.length === 0 ? null : inReview.length / comparable.length;

  return {
    words,
    band,
    register_matched: registerMatched,
    comparable_features: comparable.length,
    largest_deviations: comparable.slice(0, 3),
    features_in_review: inReview.map((entry) => entry.feature),
    median_absolute_deviation: medianDeviation,
    thresholds: {
      review_deviation: REVIEW_DEVIATION_SIGMA,
      target_median_absolute_deviation: TARGET_MEDIAN_ABSOLUTE_DEVIATION,
      max_features_in_review_share: MAX_FEATURES_IN_REVIEW_SHARE,
    },
    // A wrong-register comparison produces no score at all.
    verdict: !registerMatched
      ? "no score: the draft register does not match a subprofile, and a wrong-register comparison produces no score"
      : !band.scored
        ? "no score: local checks only at this draft length"
        : reviewShare > MAX_FEATURES_IN_REVIEW_SHARE || (medianDeviation ?? 0) > TARGET_MEDIAN_ABSOLUTE_DEVIATION
          ? "drifted"
          : "within profile",
    all_deviations: comparable,
  };
}

const OVERLAP_LISTING_LIMIT = 10;

function overlapLine(overlaps) {
  if (overlaps.length === 0) return "clear";
  const shown = overlaps.slice(0, OVERLAP_LISTING_LIMIT);
  const more = overlaps.length - shown.length;
  const listing = shown.map((hit) => `\n  "${hit.phrase}" (${hit.source})`).join("");
  const tail = more > 0 ? `\n  and ${more} more` : "";
  return `flagged ${overlaps.length} run(s) of ${OVERLAP_TOKEN_RUN} or more tokens. An overlap flag is a prompt to look, not a verdict; common phrasing in a technical domain will trip it.${listing}${tail}`;
}

/** Render the four-line report. The last line is never asserted by this tool. */
export function renderReport(result, overlaps) {
  const rhythm =
    result.verdict === "within profile"
      ? "within profile"
      : result.verdict.startsWith("no score")
        ? result.verdict
        : `drifted. Largest deviations: ${result.largest_deviations
            .map((entry) => `${entry.feature} (draft ${entry.draft} against profile ${entry.profile}, ${entry.deviation} ${entry.basis})`)
            .join("; ")}`;

  return [
    `Rhythm and syntax match: ${rhythm}`,
    `Phrase-overlap check:    ${overlapLine(overlaps)}`,
    "Content provenance:      not checked by this tool. Trace every checkable claim to the brief or a source before publication.",
    "Author approval:         not established by this tool.",
    "",
    result.band.note,
    result.verdict.startsWith("no score")
      ? ""
      : `Median absolute deviation across ${result.comparable_features} core features: ${result.median_absolute_deviation} against a governance-default target of ${TARGET_MEDIAN_ABSOLUTE_DEVIATION}. ${result.features_in_review.length} feature(s) in review.`,
    "",
    "A feature match does not prove the writing sounds right to its author. Stylometry is optimized for measurable differentiation, not subjective approval. Never treat a detector score as evidence of authorship.",
  ]
    .filter((line) => line !== "")
    .join("\n");
}
