// Corpus admission.
//
// Word counts come from authorship-attribution research on literary and
// journalistic corpora, not from a controlled study of generative voice
// synthesis. Every count below is a floor rather than a certificate, and the
// four structural rules on top of it are governance defaults chosen so the
// build has something checkable to enforce.

import { coreFeatureVector, measure } from "./features.mjs";
import { round } from "./pipeline.mjs";

export const CERTIFICATION_FLOOR = 5000;
export const PRODUCTION_MINIMUM = 10000;
export const PREFERRED_TIER = 20000;
export const MIN_DOCUMENTS = 10;
export const MAX_SINGLE_DOCUMENT_SHARE = 0.25;
export const REGISTER_MIN_WORDS = 2500;
export const REGISTER_MIN_DOCUMENTS = 3;
export const MAX_REGISTER_VARIANCE_SHARE = 0.3;
export const MAX_LEAVE_ONE_OUT_SHIFT = 0.2;
export const HETEROGENEITY_FAILURE_SHARE = 1 / 3;
// The register-variance rule asks how much of a feature's spread register
// explains. When a feature barely moves across the whole corpus there is no
// meaningful spread for register to explain, and the ratio becomes unstable:
// an arbitrarily small between-register difference divides an arbitrarily small
// total and reports a high share. A feature whose relative spread is below this
// value is treated as stable without evaluating the share. Governance default.
export const NEGLIGIBLE_RELATIVE_SPREAD = 0.05;

/** The confidence tier the clean word count permits. */
export function admissionTier(cleanWords) {
  if (cleanWords < CERTIFICATION_FLOOR) {
    return {
      certified: false,
      confidence: null,
      disposition: "refused",
      reason: `${cleanWords} clean words is below the ${CERTIFICATION_FLOOR}-word certification floor. Below the stable region, stylometric estimates are unreliable rather than merely noisy, so no profile is certified.`,
    };
  }
  if (cleanWords < PRODUCTION_MINIMUM) {
    return {
      certified: true,
      confidence: "low",
      disposition: "built with restricted features",
      reason: `${cleanWords} clean words sits between the ${CERTIFICATION_FLOOR}-word floor and the ${PRODUCTION_MINIMUM}-word production minimum. Only features that stay stable on short texts are reported.`,
    };
  }
  if (cleanWords < PREFERRED_TIER) {
    return {
      certified: true,
      confidence: "medium",
      disposition: "production minimum met",
      reason: `${cleanWords} clean words meets the ${PRODUCTION_MINIMUM}-word production minimum for a persistent profile.`,
    };
  }
  return {
    certified: true,
    confidence: "production",
    disposition: "preferred tier",
    reason: `${cleanWords} clean words reaches the ${PREFERRED_TIER}-word preferred tier, which is a governance default chosen as an engineering target and not an empirical threshold.`,
  };
}

function documentIndependence(documents, cleanWords) {
  const largest = documents.reduce(
    (winner, document) => (document.clean_words > (winner?.clean_words ?? -1) ? document : winner),
    null,
  );
  const share = largest && cleanWords ? largest.clean_words / cleanWords : 0;
  const failures = [];
  if (documents.length < MIN_DOCUMENTS) {
    failures.push(
      `only ${documents.length} independently composed documents; the governance default is at least ${MIN_DOCUMENTS}, because cross-document stability is the thing being measured`,
    );
  }
  if (share > MAX_SINGLE_DOCUMENT_SHARE) {
    failures.push(
      `${largest.source} supplies ${round(share * 100, 1)} percent of the clean tokens; the governance default caps any single document at ${MAX_SINGLE_DOCUMENT_SHARE * 100} percent`,
    );
  }
  return {
    documents: documents.length,
    largest_document_share_percent: round(share * 100, 1),
    passed: failures.length === 0,
    failures,
  };
}

function registerSubprofiles(documents) {
  const groups = new Map();
  for (const document of documents) {
    const register = document.register || "unlabelled";
    if (!groups.has(register)) groups.set(register, []);
    groups.get(register).push(document);
  }
  return [...groups.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([register, members]) => {
      const cleanWords = members.reduce((total, member) => total + member.clean_words, 0);
      const qualifies = cleanWords >= REGISTER_MIN_WORDS && members.length >= REGISTER_MIN_DOCUMENTS;
      return {
        register,
        documents: members.length,
        clean_words: cleanWords,
        numeric: qualifies,
        note: qualifies
          ? null
          : `below the governance default of ${REGISTER_MIN_WORDS} clean words across ${REGISTER_MIN_DOCUMENTS} independent documents; observations here stay qualitative and every number is provisional`,
        measured: qualifies ? measure(members.map((member) => member.text).join("\n\n")) : null,
      };
    });
}

function variance(values) {
  if (values.length < 2) return 0;
  const average = values.reduce((total, value) => total + value, 0) / values.length;
  return values.reduce((total, value) => total + (value - average) ** 2, 0) / (values.length - 1);
}

/**
 * A candidate global feature fails persistence when register accounts for more
 * than 30 percent of its document-level variance, or when deleting one document
 * moves its pooled estimate by more than 20 percent. Both are governance
 * defaults. A failing feature moves into a register override or is dropped.
 */
function featureStability(documents, pooled) {
  const perDocument = documents.map((document) => ({
    register: document.register || "unlabelled",
    vector: coreFeatureVector(measure(document.text)),
    words: document.clean_words,
  }));
  const pooledVector = coreFeatureVector(pooled);
  const results = [];

  for (const [name, pooledValue] of Object.entries(pooledVector)) {
    if (pooledValue === null) continue;
    const values = perDocument.map((entry) => entry.vector[name]).filter((value) => value !== null);
    if (values.length < 2) {
      results.push({ feature: name, stable: false, reason: "too few documents supplied this feature" });
      continue;
    }

    const total = variance(values);
    const registers = new Map();
    for (const entry of perDocument) {
      if (entry.vector[name] === null) continue;
      if (!registers.has(entry.register)) registers.set(entry.register, []);
      registers.get(entry.register).push(entry.vector[name]);
    }
    let within = 0;
    let weight = 0;
    for (const group of registers.values()) {
      if (group.length < 2) continue;
      within += variance(group) * (group.length - 1);
      weight += group.length - 1;
    }
    const withinAverage = weight === 0 ? total : within / weight;
    const registerShare = total === 0 ? 0 : Math.max(0, (total - withinAverage) / total);
    const relativeSpread = pooledValue === 0 ? 0 : Math.sqrt(total) / Math.abs(pooledValue);
    const negligibleSpread = relativeSpread < NEGLIGIBLE_RELATIVE_SPREAD;

    let worstShift = 0;
    for (let index = 0; index < values.length; index += 1) {
      const withoutOne = values.filter((_, position) => position !== index);
      const average = withoutOne.reduce((sum, value) => sum + value, 0) / withoutOne.length;
      const shift = pooledValue === 0 ? 0 : Math.abs(average - pooledValue) / Math.abs(pooledValue);
      worstShift = Math.max(worstShift, shift);
    }

    const reasons = [];
    if (registers.size > 1 && !negligibleSpread && registerShare > MAX_REGISTER_VARIANCE_SHARE) {
      reasons.push(
        `register accounts for ${round(registerShare * 100, 1)} percent of document-level variance, above the ${MAX_REGISTER_VARIANCE_SHARE * 100} percent governance default`,
      );
    }
    if (worstShift > MAX_LEAVE_ONE_OUT_SHIFT) {
      reasons.push(
        `deleting one document moves the pooled estimate by ${round(worstShift * 100, 1)} percent, above the ${MAX_LEAVE_ONE_OUT_SHIFT * 100} percent governance default`,
      );
    }
    results.push({
      feature: name,
      stable: reasons.length === 0,
      register_variance_share: negligibleSpread ? null : round(registerShare, 3),
      relative_spread: round(relativeSpread, 4),
      worst_leave_one_out_shift: round(worstShift, 3),
      negligible_spread: negligibleSpread,
      reason: reasons.join("; ") || null,
    });
  }
  return results;
}

/**
 * Mark the corpus not profileable as one voice when more than a third of the
 * proposed core features fail the stability rule, or when the clean corpus
 * falls below the certification floor after exclusions. Offer to build two
 * profiles rather than averaging two registers into a voice that belongs to
 * nobody. Governance default.
 */
function heterogeneityStop(stability, tier, registers) {
  const evaluated = stability.length;
  const failed = stability.filter((entry) => !entry.stable).length;
  const share = evaluated === 0 ? 1 : failed / evaluated;
  const reasons = [];
  if (evaluated > 0 && share > HETEROGENEITY_FAILURE_SHARE) {
    reasons.push(
      `${failed} of ${evaluated} core features fail the stability rule (${round(share * 100, 1)} percent, above the one-third governance default)`,
    );
  }
  if (!tier.certified) reasons.push("the clean corpus falls below the certification floor after exclusions");
  const namedRegisters = registers.filter((entry) => entry.register !== "unlabelled");
  return {
    stopped: reasons.length > 0,
    failed_features: failed,
    evaluated_features: evaluated,
    reasons,
    remedy:
      reasons.length > 0 && namedRegisters.length > 1
        ? `Build one profile per register (${namedRegisters.map((entry) => entry.register).join(", ")}) rather than averaging them into a voice that belongs to nobody.`
        : reasons.length > 0
          ? "Supply more independent documents, or label registers with --register so two profiles can be built instead of one average."
          : null,
  };
}

/** Run every admission gate over a cleaned corpus. */
export function runGates(documents, pooled) {
  const cleanWords = documents.reduce((total, document) => total + document.clean_words, 0);
  const tier = admissionTier(cleanWords);
  const independence = documentIndependence(documents, cleanWords);
  const registers = registerSubprofiles(documents);
  const stability = tier.certified ? featureStability(documents, pooled) : [];
  const heterogeneity = heterogeneityStop(stability, tier, registers);
  return {
    clean_words: cleanWords,
    tier,
    independence,
    registers,
    stability,
    heterogeneity,
    certified: tier.certified && !heterogeneity.stopped,
  };
}
