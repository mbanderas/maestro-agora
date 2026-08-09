// Frozen word lists for the agora-voice measurement pipeline.
//
// Every list here is part of the pipeline contract. Changing a list changes the
// numbers a profile reports, so a change must also raise LEXICON_VERSION in
// pipeline.mjs. A profile built under one lexicon version is not comparable to
// a draft measured under another.

export const ABBREVIATIONS = new Set([
  "a.m", "p.m", "approx", "apr", "aug", "ave", "b.c", "a.d", "c.f", "capt",
  "co", "corp", "dec", "dept", "dr", "e.g", "est", "etc", "feb", "fig", "fri",
  "gen", "gov", "i.e", "inc", "jan", "jr", "jul", "jun", "lt", "ltd", "mar",
  "messrs", "mon", "mr", "mrs", "ms", "mt", "no", "nov", "oct", "p.s", "ph.d",
  "pp", "prof", "rev", "sat", "sep", "sept", "sgt", "sr", "st", "sun", "thu",
  "tue", "u.k", "u.s", "u.s.a", "v.s", "vol", "vs", "wed",
]);

// Function words, grouped by class. Rates are reported per thousand tokens.
export const FUNCTION_WORDS = {
  articles: ["a", "an", "the"],
  prepositions: [
    "about", "above", "across", "after", "against", "along", "among", "around",
    "at", "before", "behind", "below", "beneath", "beside", "between", "beyond",
    "by", "despite", "down", "during", "except", "for", "from", "in", "inside",
    "into", "near", "of", "off", "on", "onto", "outside", "over", "past",
    "since", "through", "throughout", "to", "toward", "towards", "under",
    "until", "up", "upon", "with", "within", "without",
  ],
  auxiliaries: [
    "am", "are", "be", "been", "being", "can", "could", "did", "do", "does",
    "had", "has", "have", "is", "may", "might", "must", "shall", "should",
    "was", "were", "will", "would",
  ],
  conjunctions: [
    "after", "although", "and", "as", "because", "before", "but", "either",
    "for", "if", "neither", "nor", "once", "or", "since", "so", "than", "that",
    "though", "unless", "until", "when", "whenever", "where", "whereas",
    "wherever", "whether", "while", "yet",
  ],
  pronouns: [
    "he", "her", "hers", "herself", "him", "himself", "his", "i", "it", "its",
    "itself", "me", "mine", "my", "myself", "our", "ours", "ourselves", "she",
    "their", "theirs", "them", "themselves", "they", "us", "we", "what",
    "which", "who", "whom", "whose", "you", "your", "yours", "yourself",
    "yourselves",
  ],
};

export const PERSON_CLASSES = {
  first_singular: ["i", "me", "my", "mine", "myself"],
  first_plural: ["we", "us", "our", "ours", "ourselves"],
  second: ["you", "your", "yours", "yourself", "yourselves"],
  third_singular: ["he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself"],
  third_plural: ["they", "them", "their", "theirs", "themselves"],
};

export const HEDGES = [
  "apparently", "arguably", "broadly", "generally", "largely", "likely",
  "mainly", "maybe", "mostly", "often", "partly", "perhaps", "possibly",
  "presumably", "probably", "quite", "rather", "relatively", "roughly",
  "seemingly", "somewhat", "sometimes", "suggests", "tends", "typically",
  "usually",
];

export const BOOSTERS = [
  "absolutely", "always", "certainly", "clearly", "completely", "definitely",
  "entirely", "essential", "every", "exactly", "extremely", "highly",
  "incredibly", "indeed", "never", "obviously", "particularly", "precisely",
  "really", "significantly", "strongly", "surely", "totally", "truly",
  "undoubtedly", "utterly", "very",
];

export const MODALS = [
  "can", "could", "may", "might", "must", "ought", "shall", "should", "will",
  "would",
];

// Sentence-opening classes, checked in the order the features module applies.
export const OPENING_CLASSES = {
  coordinator: ["and", "but", "or", "nor", "so", "yet", "for"],
  subordinator: [
    "after", "although", "as", "because", "before", "if", "once", "since",
    "though", "unless", "until", "when", "whenever", "where", "whereas",
    "wherever", "whether", "while",
  ],
  question_word: ["how", "what", "when", "where", "which", "who", "whom", "whose", "why"],
  discourse_marker: [
    "additionally", "also", "anyway", "besides", "consequently", "conversely",
    "furthermore", "however", "importantly", "instead", "meanwhile", "moreover",
    "nevertheless", "nonetheless", "notably", "otherwise", "similarly",
    "still", "therefore", "thus", "ultimately",
  ],
  subject_pronoun: ["he", "i", "it", "she", "they", "we", "you"],
  determiner: ["a", "an", "the", "this", "that", "these", "those", "each", "every", "no", "some", "any"],
  expletive: ["there", "here"],
  adverbial: [
    "again", "almost", "already", "back", "even", "eventually", "everywhere",
    "finally", "first", "immediately", "later", "lately", "now", "often",
    "once", "only", "originally", "perhaps", "recently", "sometimes", "soon",
    "suddenly", "then", "today", "tomorrow", "tonight", "usually", "yesterday",
  ],
  preposition: FUNCTION_WORDS.prepositions,
};

// Contractible pairs. The contraction rate counts contracted forms against the
// eligible contexts where the expanded form appears, so the two columns are
// measured on the same opportunity set rather than on raw frequency.
export const CONTRACTION_PAIRS = [
  { contracted: ["can't"], expanded: [["can", "not"], ["cannot"]] },
  { contracted: ["don't"], expanded: [["do", "not"]] },
  { contracted: ["doesn't"], expanded: [["does", "not"]] },
  { contracted: ["didn't"], expanded: [["did", "not"]] },
  { contracted: ["isn't"], expanded: [["is", "not"]] },
  { contracted: ["aren't"], expanded: [["are", "not"]] },
  { contracted: ["wasn't"], expanded: [["was", "not"]] },
  { contracted: ["weren't"], expanded: [["were", "not"]] },
  { contracted: ["won't"], expanded: [["will", "not"]] },
  { contracted: ["wouldn't"], expanded: [["would", "not"]] },
  { contracted: ["shouldn't"], expanded: [["should", "not"]] },
  { contracted: ["couldn't"], expanded: [["could", "not"]] },
  { contracted: ["haven't"], expanded: [["have", "not"]] },
  { contracted: ["hasn't"], expanded: [["has", "not"]] },
  { contracted: ["hadn't"], expanded: [["had", "not"]] },
  { contracted: ["it's"], expanded: [["it", "is"], ["it", "has"]] },
  { contracted: ["that's"], expanded: [["that", "is"]] },
  { contracted: ["there's"], expanded: [["there", "is"], ["there", "has"]] },
  { contracted: ["what's"], expanded: [["what", "is"]] },
  { contracted: ["here's"], expanded: [["here", "is"]] },
  { contracted: ["i'm"], expanded: [["i", "am"]] },
  { contracted: ["i've"], expanded: [["i", "have"]] },
  { contracted: ["i'll"], expanded: [["i", "will"]] },
  { contracted: ["i'd"], expanded: [["i", "would"], ["i", "had"]] },
  { contracted: ["you're"], expanded: [["you", "are"]] },
  { contracted: ["you've"], expanded: [["you", "have"]] },
  { contracted: ["you'll"], expanded: [["you", "will"]] },
  { contracted: ["we're"], expanded: [["we", "are"]] },
  { contracted: ["we've"], expanded: [["we", "have"]] },
  { contracted: ["we'll"], expanded: [["we", "will"]] },
  { contracted: ["they're"], expanded: [["they", "are"]] },
  { contracted: ["they've"], expanded: [["they", "have"]] },
  { contracted: ["they'll"], expanded: [["they", "will"]] },
  { contracted: ["let's"], expanded: [["let", "us"]] },
];

// The generic AI-vocabulary list the tell gate bans. A profile's owned list can
// suppress the ban for a measured word, and only for the words it measured.
// Sourced from the vocabulary section of the canonical reference.
export const GENERIC_AI_VOCABULARY = [
  "bespoke", "bolster", "breathtaking", "comprehensive", "craft", "curated",
  "cutting-edge", "delve", "elevate", "embark", "empower", "enhance",
  "ecosystem", "essential", "facilitate", "forefront", "forge", "foster",
  "game-changer", "groundbreaking", "harness", "holistic", "innovative",
  "intricate", "invaluable", "journey", "landscape", "leverage", "meticulous",
  "multifaceted", "navigate", "nuanced", "paramount", "pivotal", "powerhouse",
  "profound", "realm", "revolutionary", "robust", "seamless", "showcase",
  "spearhead", "state-of-the-art", "streamline", "tapestry", "testament",
  "trailblazer", "transformative", "underscore", "unleash", "unlock",
  "unparalleled", "unprecedented", "vibrant", "vital", "world-class",
];

export function classSet(words) {
  return new Set(words.map((word) => word.toLowerCase()));
}
