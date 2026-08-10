// Profile rendering.
//
// Measurement, interpretation, calibration, and source excerpts stay separate.
// The profile leads with numbers because a number is checkable and a later
// draft can be measured against it. Adjectives belong in the interpretation
// sections, underneath the measurements they interpret.
//
// Nothing in this module is authored prose about a person. Every line is either
// a computed value, a stated governance default, or an explicit statement that
// the corpus could not supply the value.

import { FUNCTION_WORDS, GENERIC_AI_VOCABULARY, classSet } from "./lexicon.mjs";
import { round, segmentParagraphs, segmentSentences, tokenize } from "./pipeline.mjs";

const OWNED_MIN_DOCUMENTS = 3;
const OWNED_MIN_RATE_PER_1000 = 0.1;
const EXCERPT_TARGET = 8;
const EXCERPT_MAX_CHARACTERS = 420;
const AI_VOCABULARY = classSet(GENERIC_AI_VOCABULARY);
// Function words are reported as rates in `## Measured`. Repeating them as
// recurring vocabulary would bury the content words the section is for.
const ALL_FUNCTION_WORDS = classSet(Object.values(FUNCTION_WORDS).flat());

const INSUFFICIENT = "insufficient data";

function value(input, suffix = "") {
  if (input === null || input === undefined) return INSUFFICIENT;
  return `${input}${suffix}`;
}

function table(rows) {
  return ["| Feature | Value | Observations |", "|---|---|---|", ...rows].join("\n");
}

function row(name, input, observations, suffix = "") {
  return `| ${name} | ${value(input, suffix)} | ${observations} |`;
}

/**
 * Words measured as this author's own. Only a word that recurs across
 * independent documents qualifies; a word the draft wanted does not. Below the
 * certification floor no list is issued at all, because a word cannot be shown
 * to recur across genres in a corpus that has one.
 */
export function ownedVocabulary(documents, certified) {
  if (!certified) return { allowlist: [], distinctive: [], withheld: true };
  const totals = new Map();
  const documentCounts = new Map();
  const registers = new Map();
  let tokenTotal = 0;

  for (const document of documents) {
    tokenTotal += document.tokens.length;
    const seen = new Set();
    for (const token of document.tokens) {
      totals.set(token, (totals.get(token) || 0) + 1);
      seen.add(token);
    }
    for (const token of seen) {
      documentCounts.set(token, (documentCounts.get(token) || 0) + 1);
      if (!registers.has(token)) registers.set(token, new Set());
      registers.get(token).add(document.register || "unlabelled");
    }
  }

  const labelledRegisters = new Set(documents.map((document) => document.register || "unlabelled"));
  const needsTwoRegisters = labelledRegisters.size > 1;
  const qualifying = [];
  for (const [token, count] of totals) {
    const perThousand = (count / tokenTotal) * 1000;
    const documentsWith = documentCounts.get(token) || 0;
    const registersWith = registers.get(token)?.size || 0;
    if (documentsWith < OWNED_MIN_DOCUMENTS) continue;
    if (perThousand < OWNED_MIN_RATE_PER_1000) continue;
    if (needsTwoRegisters && registersWith < 2) continue;
    qualifying.push({ token, count, documents: documentsWith, registers: registersWith, per_1000: round(perThousand, 2) });
  }
  qualifying.sort((left, right) => right.per_1000 - left.per_1000 || left.token.localeCompare(right.token));

  return {
    withheld: false,
    // The allowlist is the intersection with the generic ban list. Only a word
    // the tell gate would otherwise strip needs an exception written down.
    allowlist: qualifying.filter((entry) => AI_VOCABULARY.has(entry.token)),
    distinctive: qualifying
      .filter((entry) => !AI_VOCABULARY.has(entry.token) && !ALL_FUNCTION_WORDS.has(entry.token))
      .slice(0, 40),
  };
}

/**
 * An avoidance is recorded only where a stable alternative appears in repeated
 * eligible contexts. Absence alone is weak evidence and is never recorded.
 */
export function measuredAvoidances(measured) {
  const contractions = measured.contractions;
  if (contractions.eligible_contexts < 20 || contractions.rate_percent === null) return [];
  if (contractions.rate_percent <= 5) {
    return [
      `Contracted forms, in ${contractions.eligible_contexts} eligible contexts where both forms were grammatical. The expanded form is the stable alternative at ${contractions.rate_percent} percent contraction.`,
    ];
  }
  if (contractions.rate_percent >= 95) {
    return [
      `Expanded forms, in ${contractions.eligible_contexts} eligible contexts. The contracted form is the stable alternative at ${contractions.rate_percent} percent contraction.`,
    ];
  }
  return [];
}

function excerptCandidates(documents) {
  const candidates = [];
  for (const document of documents) {
    for (const paragraph of segmentParagraphs(document.text)) {
      const sentences = segmentSentences(paragraph);
      const words = tokenize(paragraph).length;
      if (words < 25 || paragraph.length > EXCERPT_MAX_CHARACTERS) continue;
      candidates.push({
        source: document.source,
        register: document.register || "unlabelled",
        text: paragraph,
        words,
        sentences: sentences.length,
        mean_sentence_length: sentences.length === 0 ? 0 : words / sentences.length,
      });
    }
  }
  return candidates;
}

/**
 * Excerpts are stratified, not curated: selected by register, source, and
 * distance from the profile's own central tendency rather than by quality. A
 * profile built only from an author's strongest work encodes an exceptional
 * performance as the central tendency and produces drafts the author does not
 * recognize. At least one deliberately weaker passage is included.
 */
export function selectExcerpts(documents, measured) {
  const candidates = excerptCandidates(documents);
  if (candidates.length === 0) return [];
  const target = measured.sentence_length.mean ?? 0;
  const scored = candidates.map((candidate) => ({
    ...candidate,
    deviation: Math.abs(candidate.mean_sentence_length - target),
  }));

  const selected = [];
  const usedSources = new Set();
  const byRegister = new Map();
  for (const candidate of scored) {
    if (!byRegister.has(candidate.register)) byRegister.set(candidate.register, []);
    byRegister.get(candidate.register).push(candidate);
  }

  // One typical passage per register first, then one per remaining source, so
  // the set spans the corpus before it fills up.
  for (const [, group] of [...byRegister.entries()].sort((left, right) => left[0].localeCompare(right[0]))) {
    const typical = [...group].sort((left, right) => left.deviation - right.deviation)[0];
    if (typical && !usedSources.has(typical.source)) {
      selected.push({ ...typical, demonstrates: `typical cadence for the ${typical.register} register` });
      usedSources.add(typical.source);
    }
  }
  for (const candidate of [...scored].sort((left, right) => left.deviation - right.deviation)) {
    if (selected.length >= EXCERPT_TARGET - 1) break;
    if (usedSources.has(candidate.source)) continue;
    selected.push({ ...candidate, demonstrates: "central tendency, sampled by source rather than by quality" });
    usedSources.add(candidate.source);
  }

  const weakest = [...scored].sort((left, right) => right.deviation - left.deviation)[0];
  if (weakest) {
    selected.push({
      ...weakest,
      demonstrates: "deliberately included weaker passage: the furthest from the profile's central tendency",
    });
  }
  return selected.slice(0, EXCERPT_TARGET);
}

function measuredSection(measured) {
  const sentence = measured.sentence_length;
  const paragraph = measured.paragraph_shape;
  const stance = measured.person_and_stance;
  const sentenceObservations = `${sentence.observations} sentences`;
  const tokenObservations = `${measured.counts.tokens} tokens`;

  const blocks = [
    "### Sentence length",
    "",
    table([
      row("Mean", sentence.mean, sentenceObservations, " words"),
      row("Median", sentence.median, sentenceObservations, " words"),
      row("Standard deviation", sentence.standard_deviation, sentenceObservations),
      row("Coefficient of variation", sentence.coefficient_of_variation, sentenceObservations),
      row("10th percentile", sentence.p10, sentenceObservations, " words"),
      row("90th percentile", sentence.p90, sentenceObservations, " words"),
      row("Shortest", sentence.min, sentenceObservations, " words"),
      row("Longest", sentence.max, sentenceObservations, " words"),
    ]),
    "",
    "Binned shape:",
    "",
    sentence.bins_percent
      ? table(
          Object.entries(sentence.bins_percent).map(([bin, share]) =>
            row(bin.replaceAll("_", " "), share, sentenceObservations, " percent"),
          ),
        )
      : `Binned shape: ${INSUFFICIENT}. Tail and shape statistics are unstable on very few observations.`,
    "",
    "### Clause structure (proxy)",
    "",
    "No dependency parser ships with this pipeline. The two figures below are conjunction and punctuation proxies. Never compare them against parser-derived numbers.",
    "",
    table([
      row("Clause units per sentence", measured.clause_structure_proxy.clause_units_per_sentence, sentenceObservations),
      row("Subordination ratio", measured.clause_structure_proxy.subordination_ratio, sentenceObservations),
    ]),
    "",
    "### Function words, per thousand tokens",
    "",
    table(
      Object.entries(measured.function_words_per_1000).map(([name, input]) =>
        row(name, input, tokenObservations),
      ),
    ),
    "",
    "### Punctuation, per thousand tokens",
    "",
    table(
      Object.entries(measured.punctuation_per_1000).map(([name, input]) =>
        row(name.replaceAll("_", " "), input, tokenObservations),
      ),
    ),
    "",
    "### Paragraph shape",
    "",
    table([
      row("Sentences per paragraph, mean", paragraph.sentences.mean, `${paragraph.sentences.observations} paragraphs`),
      row("Sentences per paragraph, median", paragraph.sentences.median, `${paragraph.sentences.observations} paragraphs`),
      row("Words per paragraph, mean", paragraph.words.mean, `${paragraph.words.observations} paragraphs`),
      row("One-sentence paragraphs", paragraph.one_sentence_share_percent, `${paragraph.sentences.observations} paragraphs`, " percent"),
    ]),
    "",
    "### Lexical diversity",
    "",
    "Raw type-token ratio is withheld by rule: it falls mechanically as texts grow, so a comparison across unequal lengths is an artifact.",
    "",
    table([
      row(`Moving-window ratio, ${measured.lexical_diversity.mattr_window}-token window`, measured.lexical_diversity.mattr, tokenObservations),
      row("Decay-based measure", measured.lexical_diversity.mtld, tokenObservations),
    ]),
    "",
    "### Person and stance",
    "",
    table([
      ...Object.entries(stance.person).map(([name, input]) =>
        row(`${name.replaceAll("_", " ")}, per 1000`, input, tokenObservations),
      ),
      row("Hedges, per 1000", stance.hedges_per_1000, tokenObservations),
      row("Boosters, per 1000", stance.boosters_per_1000, tokenObservations),
      row("Modals, per 1000", stance.modals_per_1000, tokenObservations),
      row("Hedge to booster ratio", stance.hedge_to_booster_ratio, tokenObservations),
      row("Questions, per 100 sentences", stance.questions_per_100_sentences, sentenceObservations),
    ]),
    "",
    "### Sentence openings",
    "",
    table([
      ...Object.entries(measured.sentence_openings.class_share_percent).map(([name, share]) =>
        row(`opens with ${name.replaceAll("_", " ")}`, share, sentenceObservations, " percent"),
      ),
      row("Distinct opening classes", measured.sentence_openings.distinct_classes, sentenceObservations),
      row("Consecutive same-class openings", measured.sentence_openings.consecutive_repeat_percent, sentenceObservations, " percent"),
    ]),
    "",
    "### Contractions",
    "",
    table([
      row("Eligible contexts", measured.contractions.eligible_contexts, "both forms grammatical"),
      row("Contracted", measured.contractions.contracted, "count"),
      row("Rate within eligible contexts", measured.contractions.rate_percent, "opportunity-scoped", " percent"),
    ]),
  ];
  return blocks.join("\n");
}

function structuralHabits(measured, gates) {
  const openings = measured.sentence_openings;
  const dominant = Object.entries(openings.class_share_percent)[0];
  const paragraph = measured.paragraph_shape;
  const lines = [
    "Computed from the corpus. Each statement below restates a measured value; nothing here is inferred about the author's intent.",
    "",
    `- Opening habit: the most frequent first constituent is ${dominant ? `${dominant[0].replaceAll("_", " ")} at ${dominant[1]} percent of sentences` : INSUFFICIENT}. The corpus uses ${openings.distinct_classes} distinct opening classes, and ${value(openings.consecutive_repeat_percent, " percent")} of adjacent sentence pairs open with the same class.`,
    `- Paragraph handling: ${value(paragraph.sentences.mean)} sentences per paragraph on average, with ${value(paragraph.one_sentence_share_percent, " percent")} of paragraphs carrying a single sentence.`,
    `- Pacing spread: a coefficient of variation of ${value(measured.sentence_length.coefficient_of_variation)} across ${measured.sentence_length.observations} sentences. This is the clearest available check for uniform pacing.`,
    `- Question use: ${value(measured.person_and_stance.questions_per_100_sentences)} questions per 100 sentences.`,
    "",
    "The following structural habits cannot be derived from the frozen pipeline alone, because they need a parser or a human reading: where the qualifier sits inside a sentence, whether the conclusion is front-loaded, how a list is introduced, and how long the piece waits before its first concrete example. They are listed in `## Not captured` rather than guessed.",
  ];
  if (gates.registers.filter((entry) => entry.numeric).length > 1) {
    lines.push(
      "",
      "Register overrides exist. Apply the subprofile that matches the register being written, never the pooled numbers alone.",
    );
  }
  return lines.join("\n");
}

function calibrationSection(measured) {
  const stance = measured.person_and_stance;
  const certainty =
    stance.hedge_to_booster_ratio === null
      ? INSUFFICIENT
      : stance.hedge_to_booster_ratio < 0.5
        ? `asserts more than it qualifies (hedge to booster ratio ${stance.hedge_to_booster_ratio})`
        : stance.hedge_to_booster_ratio > 1.5
          ? `qualifies more than it asserts (hedge to booster ratio ${stance.hedge_to_booster_ratio})`
          : `balanced between qualification and assertion (hedge to booster ratio ${stance.hedge_to_booster_ratio})`;

  return [
    "Each scale below is stated with the measurement that sets it. A scale with no measurement behind it is written as insufficient data rather than estimated.",
    "",
    `- **Directness.** Second-person rate ${value(stance.person.second, " per 1000 tokens")}, first-person singular ${value(stance.person.first_singular, " per 1000 tokens")}, median sentence length ${value(measured.sentence_length.median, " words")}.`,
    `- **Certainty.** ${certainty}. Hedges ${value(stance.hedges_per_1000, " per 1000")}, boosters ${value(stance.boosters_per_1000, " per 1000")}, modals ${value(stance.modals_per_1000, " per 1000")}.`,
    `- **Authority.** ${INSUFFICIENT} from the frozen pipeline. Whether this author cites, asserts, or shows needs a source-attribution pass the pipeline does not run.`,
    `- **Humor.** ${INSUFFICIENT}. No measurable proxy exists in this pipeline, and an estimate here would be the flattery the measurement requirement exists to prevent.`,
    `- **Disagreement.** ${INSUFFICIENT}. How this author pushes back needs passages labelled as disagreement, which the corpus does not mark.`,
    "",
    "**Boundary:** a feature match is descriptive. None of these establishes that a draft sounds right to its author, and author approval is never asserted by this tool.",
  ].join("\n");
}

function notCaptured(measured, gates, corpus) {
  const lines = [
    "This section is not optional. A profile that hides its own gaps produces confident wrong output, and the gaps are the part a user cannot infer from the rest of the file.",
    "",
    "### Not measurable from this corpus",
    "",
  ];

  const missing = [];
  if (measured.sentence_length.p10 === null) missing.push("Sentence-length tails and binned shape: too few sentences for percentile estimates to be stable.");
  if (measured.lexical_diversity.mattr === null) missing.push(`Moving-window lexical diversity: the corpus is shorter than the ${measured.lexical_diversity.mattr_window}-token window.`);
  if (measured.lexical_diversity.mtld === null) missing.push("Decay-based lexical diversity: the corpus is too short for the measure to converge.");
  if (measured.contractions.rate_percent === null) missing.push("Contraction rate: fewer than 20 eligible contexts where both forms were grammatical.");
  if (measured.paragraph_shape.sentences.standard_deviation === null) missing.push("Paragraph-length spread: too few paragraphs.");
  missing.push(
    "Qualifier placement, conclusion front-loading, list handling, and distance to the first concrete example: these need a parser or a human reading, neither of which is in the frozen pipeline.",
    "Humor, disagreement behaviour, and citation posture: no measurable proxy exists here.",
  );
  lines.push(...missing.map((item) => `- ${item}`));

  lines.push("", "### Registers missing or under-sampled", "");
  const under = gates.registers.filter((entry) => !entry.numeric);
  if (under.length === 0) lines.push("- Every labelled register met the governance default for its own numbers.");
  else
    lines.push(
      ...under.map(
        (entry) => `- \`${entry.register}\`: ${entry.clean_words} clean words across ${entry.documents} documents, ${entry.note}.`,
      ),
    );
  if (gates.registers.length === 1 && gates.registers[0].register === "unlabelled") {
    lines.push(
      "- No registers were labelled. Personal voice cannot be separated from genre in an unlabelled corpus, so treat this profile as genre-bound and pass `--register` on the next build.",
    );
  }

  lines.push("", "### Features dropped for instability", "");
  const unstable = gates.stability.filter((entry) => !entry.stable);
  if (unstable.length === 0) lines.push("- None. Every evaluated core feature passed both stability rules.");
  else lines.push(...unstable.map((entry) => `- ${entry.feature}: ${entry.reason}.`));

  lines.push("", "### Habits recorded as unusable", "");
  const emDashes = corpus.documents.reduce((total, document) => total + document.typography.em_dash, 0);
  lines.push(
    emDashes > 0
      ? `- The corpus contains ${emDashes} U+2014 characters. That habit is recorded and is unusable: the U+2014 ban is an immutable output constraint at level 1 and voice never overrides it. Output uses other punctuation.`
      : "- The corpus contains no U+2014 characters, so the U+2014 ban costs this profile nothing.",
  );
  const curly = corpus.documents.reduce(
    (total, document) => total + document.typography.curly_single + document.typography.curly_double,
    0,
  );
  if (curly > 0) {
    lines.push(
      `- The corpus contains ${curly} curly quote characters. The curly-quote ban is not vocabulary, so the owned-vocabulary exception does not reach it and final copy uses straight quotes.`,
    );
  }

  lines.push("", "### What would improve this profile", "");
  const wants = [];
  if (gates.clean_words < 10000) wants.push(`Raise the corpus above ${10000} clean words for a persistent production profile; it currently holds ${gates.clean_words}.`);
  else if (gates.clean_words < 20000) wants.push(`Raise the corpus toward 20,000 to 30,000 clean words to estimate tails, rare punctuation, and more than one register.`);
  if (!gates.independence.passed) wants.push(...gates.independence.failures.map((failure) => `Fix document independence: ${failure}.`));
  if (corpus.refused.length > 0) wants.push(`${corpus.refused.length} source(s) were refused and contributed nothing. See the build report.`);
  wants.push("Supply drafts alongside published versions where both exist, so editor-sensitive features can be separated from author features.");
  lines.push(...wants.map((item) => `- ${item}`));

  return lines.join("\n");
}

function frontmatter(name, gates, corpus, pipeline, now) {
  const registers = gates.registers.map((entry) => entry.register).join(", ");
  const excluded = new Map();
  for (const document of corpus.documents) {
    for (const [reason, count] of Object.entries(document.removed || {})) {
      if (count > 0) excluded.set(reason, (excluded.get(reason) || 0) + count);
    }
  }
  const excludedList = [...excluded.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([reason, count]) => `${reason.replaceAll("_", " ")} (${count})`);
  if (corpus.refused.length > 0) excludedList.push(`refused sources (${corpus.refused.length})`);

  return [
    "---",
    `name: ${name}`,
    `created: ${now}`,
    `updated: ${now}`,
    "corpus:",
    `  documents: ${corpus.documents.length}`,
    `  clean_words: ${gates.clean_words}`,
    `  raw_words: ${corpus.documents.reduce((total, document) => total + document.raw_words, 0)}`,
    `  registers: [${registers}]`,
    `  excluded: [${excludedList.join(", ")}]`,
    "pipeline:",
    `  tokenizer: "${pipeline.tokenizer}"`,
    `  segmenter: "${pipeline.segmenter}"`,
    `  lexicon: "${pipeline.lexicon}"`,
    `  parser: "${pipeline.parser}"`,
    `confidence: ${gates.tier.confidence ?? "none"}`,
    `certified: ${gates.certified}`,
    "---",
  ].join("\n");
}

/** Render the complete profile document. */
export function renderProfile({ name, measured, gates, corpus, pipeline, now }) {
  const owned = ownedVocabulary(corpus.documents, gates.certified);
  const avoided = measuredAvoidances(measured);
  const excerpts = selectExcerpts(corpus.documents, measured);

  const vocabulary = [
    "**Owned.** Words measured as recurring across independent documents in this corpus. The list is an allowlist against the generic AI-vocabulary ban and reaches those words only. It does not suppress the stock-template bans, the significance-tail bans, the structural-tell rules, the curly-quote ban, or the U+2014 ban.",
    "",
  ];
  if (owned.withheld) {
    vocabulary.push(
      "No allowlist is issued. The corpus is below the certification floor, and a word cannot be shown to recur across genres in a corpus that has one. An allowlist assembled from a thin corpus is a licence built on noise.",
    );
  } else if (owned.allowlist.length === 0) {
    vocabulary.push(
      "No word on the generic AI-vocabulary ban list met the measurement bar in this corpus, so no exception is issued. The generic ban applies in full.",
    );
  } else {
    vocabulary.push(
      "| Word | Per 1000 tokens | Documents | Registers |",
      "|---|---|---|---|",
      ...owned.allowlist.map(
        (entry) => `| \`${entry.token}\` | ${entry.per_1000} | ${entry.documents} | ${entry.registers} |`,
      ),
    );
  }

  vocabulary.push("", "**Recurring vocabulary outside the generic ban list.** Recorded for calibration. These need no exception and carry no licence.", "");
  vocabulary.push(
    owned.distinctive.length === 0
      ? INSUFFICIENT
      : owned.distinctive.map((entry) => `\`${entry.token}\` (${entry.per_1000})`).join(", "),
  );

  vocabulary.push(
    "",
    "**Avoided.** An avoidance is recorded only from a stated preference or a stable alternative in repeated eligible contexts. Absence alone is weak evidence and is never recorded here.",
    "",
  );
  vocabulary.push(avoided.length === 0 ? `${INSUFFICIENT}: no stable alternation met the bar.` : avoided.map((item) => `- ${item}`).join("\n"));

  const excerptBlock =
    excerpts.length === 0
      ? `${INSUFFICIENT}: no paragraph met the length bounds for a calibration excerpt.`
      : excerpts
          .map(
            (excerpt, index) =>
              `**${index + 1}. ${excerpt.source}** (${excerpt.register}) demonstrates ${excerpt.demonstrates}.\n\n> ${excerpt.text.replace(/\n/g, " ")}`,
          )
          .join("\n\n");

  return [
    frontmatter(name, gates, corpus, pipeline, now),
    "",
    `# Voice profile: ${name}`,
    "",
    "A profile controls how a proposition is expressed. Claims, numbers, quotations, positions, preferences, endorsements, attribution, and publication decisions come from the user's current brief, not from this file.",
    "",
    "Voice enters at level 6 of the conflict hierarchy and never rises above it.",
    "",
    "## Measured",
    "",
    measuredSection(measured),
    "",
    "## Structural habits",
    "",
    structuralHabits(measured, gates),
    "",
    "## Vocabulary",
    "",
    vocabulary.join("\n"),
    "",
    "## Calibration",
    "",
    calibrationSection(measured),
    "",
    "## Excerpts",
    "",
    "Selected by register, source, and distance from the corpus central tendency, not by quality. Excerpts are for calibration and verification, never for sentence completion: transfer the distributions and the tendencies, never the metaphors, slogans, anecdotes, or source sentences.",
    "",
    excerptBlock,
    "",
    "## Not captured",
    "",
    notCaptured(measured, gates, corpus),
    "",
  ].join("\n");
}
