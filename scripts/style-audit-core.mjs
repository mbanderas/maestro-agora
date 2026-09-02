import { readFile } from "node:fs/promises";

import { GENERIC_AI_VOCABULARY } from "./voice/lexicon.mjs";
import { segmentParagraphs, segmentSentences, tokenize } from "./voice/pipeline.mjs";

export const REGISTERS = new Set(["plain", "technical", "scientific", "legal", "audit"]);

export const CANONICAL_CONNECTIVES = [
  "moreover",
  "furthermore",
  "additionally",
  "in addition",
  "notably",
  "importantly",
  "indeed",
  "in essence",
  "in summary",
  "in conclusion",
  "ultimately",
  "that said",
  "on the other hand",
  "on one hand",
];

export const CANONICAL_TEMPLATE_PATTERNS = [
  ["important-note", /\bit(?:'s| is) important to note that\b/giu],
  ["worth-noting", /\bit(?:'s| is) worth (?:noting|mentioning) that\b/giu],
  ["fast-paced-world", /\bin today(?:'s|s) fast-paced world\b/giu],
  ["ever-evolving-landscape", /\bin the ever-evolving landscape of\b/giu],
  ["realm", /\bin the realm of\b/giu],
  ["testament", /\ba testament to\b/giu],
  ["stands-as", /\bstands as a\b/giu],
  ["serves-as", /\bserves as a\b/giu],
  ["pivotal-role", /\bplays a (?:crucial|pivotal|vital) role in\b/giu],
  ["not-only", /\bnot only\b[^.!?\n]{0,180}\bbut also\b/giu],
  ["whether-you", /\bwhether you(?:'re| are)\b[^.!?\n]{0,120}\bor\b/giu],
  ["from-to", /\bfrom\b[^,!?.\n]{1,80}\bto\b[^,!?.\n]{1,80},[^.!?\n]{0,120}\bhas\b/giu],
  ["at-core", /\bat its core\b/giu],
  ["when-it-comes", /\bwhen it comes to\b/giu],
  ["navigating-complexities", /\bnavigating the complexities of\b/giu],
  ["unlocking-potential", /\bunlocking the potential of\b/giu],
  ["harnessing-power", /\bharnessing the power of\b/giu],
  ["paving-way", /\bpaving the way for\b/giu],
  ["setting-stage", /\bsetting the stage for\b/giu],
  ["bringing-forefront", /\bbringing\b[^.!?\n]{1,100}\bto the forefront\b/giu],
];

export const CANONICAL_SIGNIFICANCE_TAILS = [
  "emphasizing the significance of",
  "reflecting the continued relevance of",
  "underscoring the importance of",
  "highlighting its role in",
  "demonstrating its impact on",
  "marking a turning point in",
  "cementing its place as",
  "solidifying its reputation for",
  "showcasing its commitment to",
];

export const CANONICAL_PROMPT_LEAKAGE = [
  /\bcertainly!\b/giu,
  /\bof course!\b/giu,
  /\babsolutely!\b/giu,
  /\bgreat question!\b/giu,
  /\bhere is your (?:article|blog post|essay) on\b/giu,
  /\bas an ai language model\b/giu,
  /\bup to my last training update\b/giu,
  /\bi hope this helps!\b/giu,
  /\blet me know if you(?:'d| would) like\b/giu,
  /\bcertainly! here(?:'s| is) a\b/giu,
  /\bsure, i can help with that\b/giu,
];

export const CONTROL_ROOM_TERMS = [
  "evidence", "evidentiary", "proof", "verified", "verification", "claim",
  "substantiation", "provenance", "methodology", "framework", "mechanism",
  "criterion", "criteria", "qualification", "qualifier", "causal", "entailment",
  "proposition", "decision surface", "route", "artifact", "register", "hierarchy",
  "gate", "audit", "ledger", "boundary", "scope", "operational",
];

export const FALSE_REFRAMES = [
  /\bthis is not just\b[^.!?\n]{1,120}[.!?]\s*it is\b/giu,
  /\bthis is not\b[^.!?\n]{1,120}[.!?]\s*it is\b/giu,
  /\b\w[\w -]{0,80} is more than \w/giu,
  /\bthe real issue is not\b[^.!?\n]{1,140}[.!?]\s*it is\b/giu,
  /\bthe question is not whether\b[^.!?\n]{1,160}\bbut how\b/giu,
];

export const QUESTION_FRAGMENT_THEATER = /\b(?:the result|the answer|the problem|the difference|the bottom line)\?/giu;
export const CONVERSATIONAL_THEATER = /\b(?:here is the thing|let us be honest|think about it|imagine this|picture this|you know the feeling|the bottom line is)\b/giu;
export const CORPORATE_HELPERS = /\b(?:provides the ability to|is designed to enable|helps to facilitate|allows users to|offers a way to|serves to|works to|aims to|seeks to|has the potential to)\b/giu;
export const LEGALISTIC_LEAKAGE = /\b(?:with respect to|in relation to|insofar as|pursuant to|herein|therein|whereby|for the avoidance of doubt|where applicable|subject to the foregoing|constitutes|shall)\b/giu;
export const EMPTY_ANALYTICAL_ENDINGS = /\bthis (?:demonstrates that|indicates the importance of|provides a strong foundation for|creates a clear pathway to|supports the broader objective of|aligns with|reinforces|reflects)\b/giu;

const HARD = "hard";
const WARNING = "warning";
const EXACT_START = "<!-- agora-style-audit: exact-start -->";
const EXACT_END = "<!-- agora-style-audit: exact-end -->";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const lineAndColumn = (text, index) => {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, column: lines.at(-1).length + 1 };
};

const finding = (text, match, severity, category, rule, message) => ({
  severity,
  category,
  rule,
  message,
  excerpt: match[0],
  ...lineAndColumn(text, match.index),
});

const maskRange = (characters, start, end) => {
  for (let index = Math.max(0, start); index < Math.min(characters.length, end); index += 1) {
    if (characters[index] !== "\n") characters[index] = " ";
  }
};

export function maskExactText(text, exactTextRanges = []) {
  const characters = [...text];
  const patterns = [
    /```[\s\S]*?```/g,
    /~~~[\s\S]*?~~~/g,
    /`[^`\n]+`/g,
    /^\s*>.*$/gm,
    new RegExp(`${escapeRegExp(EXACT_START)}[\\s\\S]*?${escapeRegExp(EXACT_END)}`, "g"),
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) maskRange(characters, match.index, match.index + match[0].length);
  }
  for (const rangeValue of exactTextRanges) maskRange(characters, rangeValue.start, rangeValue.end);
  return characters.join("");
}

const scanRegex = (text, masked, regex, severity, category, rule, message, findings) => {
  regex.lastIndex = 0;
  for (const match of masked.matchAll(regex)) findings.push(finding(text, match, severity, category, rule, message));
};

const sentenceEntries = (text) => {
  const entries = [];
  let searchFrom = 0;
  for (const paragraph of segmentParagraphs(text)) {
    for (const sentence of segmentSentences(paragraph)) {
      const index = text.indexOf(sentence, searchFrom);
      entries.push({ sentence, index: index < 0 ? searchFrom : index, tokens: tokenize(sentence) });
      if (index >= 0) searchFrom = index + sentence.length;
    }
  }
  return entries;
};

const sentenceWarnings = (text, masked, findings) => {
  const entries = sentenceEntries(masked);
  const joinWords = new Set(["and", "but", "or", "because", "although", "while", "whereas", "which", "that", "whereby", "if", "when", "since"]);
  const prepositions = new Set(["of", "for", "with", "in", "through"]);
  const nounSuffix = /(?:tion|sion|ment|ness|ity|ance|ence|al|ure|ism|ship)$/u;
  for (const entry of entries) {
    const match = { 0: entry.sentence, index: entry.index };
    if (entry.tokens.length > 28) findings.push(finding(text, match, WARNING, "sentence", "sentence-over-28-words", `Ordinary sentence has ${entry.tokens.length} words; review whether a split preserves meaning.`));
    const joins = entry.tokens.filter((token) => joinWords.has(token)).length;
    if (joins >= 3) findings.push(finding(text, match, WARNING, "sentence", "three-or-more-joined-clauses", `Sentence contains ${joins} clause-join proxies.`));
    const prepCount = entry.tokens.filter((token) => prepositions.has(token)).length;
    if (prepCount >= 5) findings.push(finding(text, match, WARNING, "sentence", "preposition-stack", `Sentence contains ${prepCount} common prepositions.`));
    let nounRun = 0;
    let longest = 0;
    for (const token of entry.tokens) {
      nounRun = nounSuffix.test(token) ? nounRun + 1 : 0;
      longest = Math.max(longest, nounRun);
    }
    if (longest >= 3) findings.push(finding(text, match, WARNING, "sentence", "noun-stack", "Sentence contains a possible abstract noun stack."));
  }

  for (let index = 2; index < entries.length; index += 1) {
    const openings = entries.slice(index - 2, index + 1).map((entry) => entry.tokens.slice(0, 2).join(" "));
    if (openings[0] && openings.every((opening) => opening === openings[0])) {
      const entry = entries[index - 2];
      findings.push(finding(text, { 0: openings[0], index: entry.index }, WARNING, "structure", "repeated-openings", "Three consecutive sentences share the same two-word opening."));
    }
  }
};

const paragraphWarnings = (text, masked, findings) => {
  const paragraphs = segmentParagraphs(masked).map((paragraph) => ({
    paragraph,
    words: tokenize(paragraph).length,
    sentences: segmentSentences(paragraph).length,
  }));
  for (let index = 2; index < paragraphs.length; index += 1) {
    const group = paragraphs.slice(index - 2, index + 1);
    const sameSentenceCount = group.every((entry) => entry.sentences === group[0].sentences);
    const smallest = Math.min(...group.map((entry) => entry.words));
    const largest = Math.max(...group.map((entry) => entry.words));
    if (sameSentenceCount && smallest > 0 && largest / smallest <= 1.15) {
      const start = text.indexOf(group[0].paragraph);
      findings.push(finding(text, { 0: group[0].paragraph.slice(0, 80), index: Math.max(0, start) }, WARNING, "structure", "repeated-paragraph-shape", "Three consecutive paragraphs have nearly identical shapes."));
    }
  }
};

export function auditText(text, { register = "plain", exactTextRanges = [] } = {}) {
  if (!REGISTERS.has(register)) throw new Error(`unknown register: ${register}`);
  const masked = maskExactText(text, exactTextRanges);
  const findings = [];

  scanRegex(text, masked, /\u2014/gu, HARD, "punctuation", "u+2014", "Unicode U+2014 is forbidden outside exact text.", findings);
  scanRegex(text, masked, /[\u2018\u2019\u201c\u201d]/gu, HARD, "punctuation", "smart-quote", "Generated smart quotes are forbidden outside exact text.", findings);

  for (const word of GENERIC_AI_VOCABULARY) {
    scanRegex(text, masked, new RegExp(`\\b${escapeRegExp(word)}\\b`, "giu"), HARD, "canonical", `banned-vocabulary:${word}`, "Canonical banned vocabulary requires an explicit exact-text exception.", findings);
  }
  for (const phrase of CANONICAL_CONNECTIVES) {
    scanRegex(text, masked, new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "giu"), HARD, "canonical", `banned-connective:${phrase}`, "Canonical banned connective requires an explicit formal-genre or exact-text exception.", findings);
  }
  for (const [id, pattern] of CANONICAL_TEMPLATE_PATTERNS) {
    scanRegex(text, masked, pattern, HARD, "canonical", `banned-template:${id}`, "Canonical stock template is forbidden.", findings);
  }
  for (const phrase of CANONICAL_SIGNIFICANCE_TAILS) {
    scanRegex(text, masked, new RegExp(`,?\\s*${escapeRegExp(phrase)}\\b`, "giu"), HARD, "canonical", `significance-tail:${phrase}`, "Canonical significance tail is forbidden.", findings);
  }
  for (const [index, pattern] of CANONICAL_PROMPT_LEAKAGE.entries()) {
    scanRegex(text, masked, pattern, HARD, "canonical", `prompt-leakage:${index + 1}`, "Prompt or task meta-commentary is forbidden.", findings);
  }

  if (register === "plain") {
    for (const term of CONTROL_ROOM_TERMS) {
      scanRegex(text, masked, new RegExp(`\\b${escapeRegExp(term)}\\b`, "giu"), WARNING, "register", `control-room:${term}`, "Review whether the reader needs this internal control term.", findings);
    }
  }

  for (const [index, pattern] of FALSE_REFRAMES.entries()) scanRegex(text, masked, pattern, WARNING, "structure", `false-reframe:${index + 1}`, "Review generic false-reframe construction.", findings);
  scanRegex(text, masked, QUESTION_FRAGMENT_THEATER, WARNING, "structure", "question-fragment-theater", "Review generic question-fragment theater.", findings);
  scanRegex(text, masked, CONVERSATIONAL_THEATER, WARNING, "structure", "conversational-theater", "Review conversational theater against the active voice.", findings);
  scanRegex(text, masked, CORPORATE_HELPERS, WARNING, "wording", "corporate-helper", "Replace a corporate helper phrase with a direct verb when meaning permits.", findings);
  if (register !== "legal" && register !== "audit") scanRegex(text, masked, LEGALISTIC_LEAKAGE, WARNING, "register", "legalistic-leakage", "Review legalistic wording outside a legal or audit register.", findings);
  scanRegex(text, masked, EMPTY_ANALYTICAL_ENDINGS, WARNING, "structure", "empty-analytical-ending", "Replace an empty analytical ending with the fact or needed inference.", findings);

  sentenceWarnings(text, masked, findings);
  paragraphWarnings(text, masked, findings);

  findings.sort((left, right) => left.line - right.line || left.column - right.column || left.rule.localeCompare(right.rule));
  const hardFailures = findings.filter((item) => item.severity === HARD);
  const warnings = findings.filter((item) => item.severity === WARNING);
  return {
    schema_version: 1,
    register,
    pass: hardFailures.length === 0,
    hard_failure_count: hardFailures.length,
    warning_count: warnings.length,
    findings,
    limits: {
      authorship: "not assessed",
      detector_evasion: "not promised",
      factual_validation: "outside this lexical and structural tool",
      rewriting: "not performed",
    },
  };
}

export async function auditFile(path, options = {}) {
  return auditText(await readFile(path, "utf8"), options);
}
