export const ELIGIBILITY_SCORE_DIMENSIONS = [
  "brief-fidelity",
  "prior-calibration",
  "contradiction-handling",
  "composition-fit",
];

export const ELIGIBILITY_POLICY = "symmetric-cross-order-hard-gates-v3";

const failures = (values) => Array.isArray(values) ? values : [];

export const sameFailureSet = (left, right) => {
  const leftSet = new Set(failures(left));
  const rightSet = new Set(failures(right));
  return leftSet.size === rightSet.size && [...leftSet].every((value) => rightSet.has(value));
};

export const adjudicationsDisagree = (left, right) => left.winner !== right.winner
  || !sameFailureSet(left.candidateHardGateFailures, right.candidateHardGateFailures)
  || !sameFailureSet(left.incumbentHardGateFailures, right.incumbentHardGateFailures);

export const deriveEligibleWinner = ({
  baseWinner,
  candidateHardGateFailures,
  incumbentHardGateFailures,
}) => {
  const candidateInvalid = failures(candidateHardGateFailures).length > 0;
  const incumbentInvalid = failures(incumbentHardGateFailures).length > 0;
  if (candidateInvalid && incumbentInvalid) return "tie";
  if (candidateInvalid) return "incumbent";
  if (incumbentInvalid) return "candidate";
  return baseWinner;
};

export const validateEligibility = ({
  winner,
  candidateHardGateFailures,
  incumbentHardGateFailures,
  candidateScores,
  incumbentScores,
  label = "judgment",
}) => {
  const errors = [];
  const candidateInvalid = failures(candidateHardGateFailures).length > 0;
  const incumbentInvalid = failures(incumbentHardGateFailures).length > 0;

  if (candidateInvalid && incumbentInvalid) {
    if (winner !== "tie") errors.push(`${label}.winner must be tie because both sides fail hard gates`);
    return errors;
  }

  if (!candidateInvalid && !incumbentInvalid) return errors;

  const invalidSide = candidateInvalid ? "candidate" : "incumbent";
  const validSide = candidateInvalid ? "incumbent" : "candidate";
  if (winner !== validSide) {
    errors.push(`${label}.winner must be ${validSide} because only ${invalidSide} fails hard gates`);
  }

  const invalidScores = candidateInvalid ? candidateScores : incumbentScores;
  const validScores = candidateInvalid ? incumbentScores : candidateScores;
  for (const dimension of ELIGIBILITY_SCORE_DIMENSIONS) {
    const invalidScore = invalidScores?.[dimension];
    const validScore = validScores?.[dimension];
    if (Number.isFinite(invalidScore) && Number.isFinite(validScore) && invalidScore > validScore) {
      errors.push(
        `${label}.${invalidSide}Scores.${dimension} cannot exceed ${validSide}Scores.${dimension} when only ${invalidSide} fails hard gates`,
      );
    }
  }
  return errors;
};
