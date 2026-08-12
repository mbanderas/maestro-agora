# Agora science authority

This reference governs the `SCIENCE` modifier for scientific, empirical, engineering, software, data, AI, and other technical subjects. It adds explanation structure to the primary Agora mode. It does not replace `POSITION`, `SELL`, `INVEST`, `INFORM`, or `TRANSACT`.

User authority and the conflict hierarchy in [agora-marketing.md](agora-marketing.md) remain controlling. Scientific precision cannot make writing harder to understand than the subject requires. Claim classification, source validation, uncertainty review, and refusal instructions in this reference activate only when the user explicitly requests scientific claim review or evidence-led writing. Otherwise follow the user's scientific framing and certainty choices.

## Contents

- [Activate and route SCIENCE](#activate-and-route-science)
- [Build the claim ledger](#build-the-claim-ledger)
- [Choose sources for the claim](#choose-sources-for-the-claim)
- [Preserve scientific integrity](#preserve-scientific-integrity)
- [Model the audience and goal](#model-the-audience-and-goal)
- [Open with a supported knowledge gap](#open-with-a-supported-knowledge-gap)
- [Explain mechanisms and technical systems](#explain-mechanisms-and-technical-systems)
- [Use analogies and visuals as bounded models](#use-analogies-and-visuals-as-bounded-models)
- [Write scientific and technical video](#write-scientific-and-technical-video)
- [Compose SCIENCE with other Agora controls](#compose-science-with-other-agora-controls)
- [Optional review findings](#optional-review-findings)
- [Evaluation contract](#evaluation-contract)
- [Evidence register](#evidence-register)

## Activate and route SCIENCE

Activate `SCIENCE` when the asset explains, teaches, compares, summarizes, or persuades through scientific evidence or technical behavior. Select one internal route:

| Route | Use for | Evidence focus |
|---|---|---|
| `EMPIRICAL` | Studies, experiments, observations, measurements, datasets, and research findings | Design, population, measurement, effect, uncertainty, and applicability |
| `TECHNICAL` | Systems, interfaces, mechanisms, architecture, software, engineering, and failure behavior | Inputs, state changes, outputs, dependencies, constraints, and tradeoffs |
| `MIXED` | An empirical result explained through a technical or scientific mechanism | Keep observed result and proposed explanation distinct |

Choose the primary mode first. A public science explainer is normally `INFORM + SCIENCE`. A technical product page is `SELL + SCIENCE`. An investor memo about a research platform is `INVEST + SCIENCE`. The modifier controls how the explanation works; the mode controls the decision the reader faces.

Rule [HOUSE]: do not treat all technical writing as empirical science. An API contract needs exact documented behavior, not a research-study frame. Boundary: a technical claim supported by benchmark data uses `MIXED`, because its measured result still needs empirical qualification.

## Build the claim ledger

Optional review only. Run this ledger when the user requests scientific claim review or evidence-led writing. Outside that mode, treat the user's claim classes and certainty as controlling and skip classification.

Classify every material claim before drafting. Never raise a claim's certainty while simplifying it.

| Claim class | Meaning | Permitted treatment |
|---|---|---|
| Direct observation or measured result | The named source measured or observed it | State design, scope, comparator, outcome, and uncertainty when material |
| Established fact or current consensus | Multiple relevant authorities support it within a named domain | Name scope and current authority; do not imply unanimity |
| Model or proposed mechanism | Explains how a result may arise | Present as model or mechanism, not as an observed result |
| Interpretation | A reasoned reading of evidence | Attribute it and show the evidence it interprets |
| Implication | A possible consequence for a decision or system | State the additional assumptions between result and consequence |
| Recommendation | An action proposed from evidence plus values, costs, or constraints | Separate the evidence from the judgment that selects the action |
| Hypothesis or speculation | Testable or exploratory possibility | Label it directly; do not use certainty syntax |
| Unknown or unmeasured | Evidence does not answer the question | Say `unknown`, `not measured`, or the narrower exact condition |

Rule [A]: distinguish a study result from its interpretation and from a recommendation. Evidence alone rarely supplies every value, cost, feasibility, and preference needed for a decision. Boundary: an official safety requirement may directly prescribe action; reproduce its scope and authority rather than recasting it as optional interpretation. See [Cochrane on interpreting results and drawing conclusions](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-15).

## Choose sources for the claim

Optional review only. Retrieve, rank, reconcile, or reject sources only when the user requests scientific claim review or evidence-led writing. Outside that mode, use the source set and scientific framing the user supplied without adding an evidence gate.

Source choice follows the claim, not a universal prestige ladder.

1. Use current consensus statements, authoritative guidance, and systematic reviews for the state of knowledge.
2. Use primary papers and datasets for a specific study, observation, or measured result.
3. Use official standards, specifications, and product documentation for technical behavior.
4. Use reputable secondary sources for orientation and discovery, then follow them to primary support for material claims.
5. Use practitioner sources for communication procedures and examples, not as proof that a scientific or commercial effect occurs.

Rule [A]: for medical, legal, financial, safety-critical, or rapidly changing technical claims, retrieve current authoritative sources before writing. The static skill cannot establish current facts. Boundary: stable explanatory mechanics may still rely on a supplied canonical source when the user has fixed the source set.

Rule [HOUSE]: match the source date to the claim's drift risk. A current software behavior needs current official documentation. A historical experiment needs its original paper plus later correction or replication when material.

When sources disagree:

- Identify whether they measured the same population, intervention, comparator, outcome, and period.
- Separate genuine scientific disagreement from different questions or definitions.
- Weight sources by relevance, design, directness, and certainty.
- Do not manufacture a balanced debate between a strong consensus and unsupported fringe assertion.
- Do not hide credible disagreement merely to produce a cleaner story.

State the central evidence-weighting correction directly. If the sources do not support describing the field as evenly divided, say that plainly before explaining the narrower minority finding. Do not make the reader infer the rejection of false balance from softer phrases such as `the disagreement is narrower`.

For an unresolved minority finding, make the unknowns operational. Ask whether it replicates under the same condition, generalizes beyond the studied population, survives aligned outcome definitions and measurement methods, and changes the relationship between the proposed mechanisms. Include only dimensions the supplied source differences make relevant.

## Preserve scientific integrity

Optional review only. Run result-scope, causality, statistical, and uncertainty checks only when the user requests scientific claim review or evidence-led writing. Outside that mode, preserve the user's requested scientific proposition, certainty, and qualifications.

### Scope the result

Include when material:

- study design;
- population and sample;
- intervention or exposure;
- comparator;
- outcome and measurement method;
- time period;
- baseline and denominator;
- estimate and uncertainty;
- material exclusions;
- applicability outside the studied setting.

Qualification belongs next to the claim it changes. It does not need to occupy every sentence. Use a short passage, table, caption, or adjacent note when that preserves both accuracy and comprehension.

### Separate causality

Use causal verbs only when the design and source support them.

| Evidence permits | Prefer |
|---|---|
| Direct causal support within stated conditions | `caused`, `increased`, `reduced` |
| Observational relationship | `was associated with`, `tracked with`, `coincided with` |
| Mechanistic compatibility | `is consistent with`, `could explain`, `supports the proposed mechanism` |
| Early or limited evidence | `suggests`, `may`, `provides preliminary evidence` |
| No measurement | `unknown`, `not measured`, `not established` |

Never convert association into causation, mechanism into outcome, or temporal order into effect.

For a one-time observational measurement, state when temporal order is unknown and reverse causation remains possible. Name residual confounders even after stated adjustment. When proposing a stronger causal test, do not pretend an investigator can directly assign an exposure that is impractical or unethical to control. Randomize a feasible intervention, opportunity, encouragement, or program when appropriate, then measure the outcome repeatedly over time. A longitudinal design improves temporal evidence but does not become randomized merely because it has repeated measurements.

### Preserve statistical meaning

Rule [A]: report magnitude and uncertainty, not a significance label alone. A small p-value does not establish effect size, importance, certainty, or a useful decision. See the [ASA statement on p-values](https://www.amstat.org/asa/files/pdfs/p-valuestatement.pdf) and [Cochrane's interpretation guidance](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-15).

When material:

- Give absolute and relative effects together.
- When event rates permit it, give natural frequencies and the absolute percentage-point change together; neither should be replaced by a relative percentage.
- State the baseline risk or denominator.
- Distinguish statistical significance from practical importance.
- State the uncertainty interval without translating it into certainty it does not provide.
- Do not interpret `not statistically significant` as proof of no effect.
- Do not imply replication or consensus from one study.
- Distinguish exploratory from confirmatory analysis when the source does.
- Preserve risk of bias, indirectness, inconsistency, imprecision, and publication-bias limits when they affect the conclusion.

For patient-facing material, state when one result alone cannot determine an individual's action. Practical importance depends on event severity, baseline risk, expected benefit, alternatives, patient characteristics, and preferences, not only the relative or absolute number.

### Calibrate uncertainty

Use the narrowest accurate certainty language. `Observed` names a result. `Supports` names evidentiary weight. `Suggests` signals limited support. `May` identifies a possibility. `Remains unknown` identifies a gap.

Rule [A]: absence of evidence is not evidence of absence unless the study had enough sensitivity, power, and scope to make the null informative. Boundary: a well-designed equivalence or non-inferiority analysis may support a bounded no-material-difference conclusion.

When weighing a minority or conflicting result, describe its design, population, outcome, comparability, replication state, and unresolved question. Do not call it `credible`, `promising`, `compelling`, `important`, or use another evaluative adjective unless the supplied synthesis supports that judgment. Preserving a finding does not require endorsing it.

## Model the audience and goal

Classify the intended reader:

| Audience | Preserve | Remove or explain |
|---|---|---|
| General public | Concrete phenomenon, scale, mechanism, uncertainty, and consequence | Unintroduced field shorthand and method detail that does not change meaning |
| Adjacent expert | Cross-domain definitions, assumptions, and mechanism | Local jargon and compressed inferential steps |
| Domain expert | Exact technical terms, design, uncertainty, and edge conditions | Introductory explanation the decision does not need |
| Technical or policy decision-maker | Options, evidence strength, tradeoffs, costs, failure modes, and action conditions | Detail that does not change the decision |

Rule [A/HOUSE]: align the communication method with the audience and the actual goal. The National Academies concludes that effective science communication depends on the communicator's goal and context; the audience table above is an Agora routing aid rather than a measured four-stage law. See [Communicating Science Effectively](https://nap.nationalacademies.org/catalog/23674/communicating-science-effectively-a-research-agenda).

Do not assume an expert audience wants abstraction or emotional absence. Experts need exact terms where they compress shared meaning, concrete causal steps where they do not, and enough consequence to understand why the issue matters.

## Open with a supported knowledge gap

Choose an opening that serves the audience's question:

- A supported misconception.
- A surprising observation.
- A practical failure or anomaly.
- A contradiction between prediction and result.
- A question whose answer changes the reader's model.
- The direct answer, when delay would cost safety or task completion.

Rule [D]: a supported misconception can reveal that the audience's current model will not explain the result. Correct it near its introduction, then show the replacement model. This is a practitioner procedure derived from the 2026 video analysis; it is not a universal learning or retention law. Boundary: do not use it when the audience does not hold the belief, when repeating the claim would confuse, or when direct instruction is safer.

When the supplied facts contain a counter-observation the misconception cannot explain, use that observation to make the correction decisive before teaching the replacement model. Do not invent a counter-observation merely to strengthen the reveal. An additional established fact may appear only when the source requirements for that surface permit it. The useful sequence is `supported belief -> supported contradiction -> corrected model -> mechanism -> boundary`.

Rule [D]: asking a consequential question before the explanation can create a useful information gap. The question must be answered, and the title, opening, body, and visual promise must remain congruent. Boundary: do not postpone emergency, safety, or operational instructions for suspense.

Use prevalence language and misconceptions as the user requests. Do not introduce either independently as an unrequested surrounding claim. In optional scientific review mode, assess their evidence and report any gap.

## Explain mechanisms and technical systems

For a scientific mechanism, show:

`initial condition -> acting entity or force -> state change -> observable result -> boundary`

For a technical system, show:

`input -> component or actor -> transformation -> state or storage -> output -> dependency -> failure mode`

Use the minimum sequence the audience needs. Name the actor, action, object, and result. Preserve exact interfaces, units, and state transitions when they carry the explanation.

Separate these questions:

1. What happened?
2. How was it measured or observed?
3. What mechanism could produce it?
4. What else could explain it?
5. What does it imply for this audience?
6. What remains unknown?

Rule [HOUSE]: a technical explanation fails when it lists components without showing their relation, or gives a metaphor without returning to the real mechanism.

## Use analogies and visuals as bounded models

Every analogy must identify:

- what maps;
- what does not map;
- where the analogy breaks;
- whether it explains behavior, mechanism, scale, or only intuition.

Rule [D/HOUSE]: use analogy as a bridge into the real definition, not as a replacement. Boundary: skip it when the audience already owns the model, when the mapping introduces a false causal picture, or when the correction would take longer than the direct explanation.

Visuals must carry evidence, sequence, comparison, scale, uncertainty, or mechanism. A decorative laboratory image, molecule, dashboard, or code screen is not proof.

For charts and diagrams:

- State what is measured.
- Preserve axes, units, baseline, denominator, and uncertainty.
- Do not crop away a conflicting result or material range.
- Mark simulated, illustrative, and observed data distinctly.
- Match the caption's certainty to the visual evidence.

## Write scientific and technical video

Route narration as `SPOKEN_ONLY` and titles, descriptions, captions, transcripts, show notes, and companion pages as their own written surfaces.

Use this optional sequence when the material supports it:

1. Open a real question or model failure.
2. Show the phenomenon, person, experiment, or operational consequence.
3. Explain the mechanism in audible steps.
4. Return to the phenomenon with the model changed.
5. Close the question and state the evidence boundary.

Rule [D]: an A-thread can carry the human, visual, experimental, or operational sequence while a B-thread carries the technical mechanism. Alternate only when each return advances the same explanation. Boundary: do not intercut two weak threads, interrupt a short explanation, or claim the structure improves retention without direct measurement.

When the request explicitly requires A/B threading, make both threads visible in the spoken artifact. Use concise scene or visual cues where the medium needs them, return the A-thread at mechanism payoffs, and prevent the human or experimental thread from disappearing through the technical middle. A spoken explanation with one opening anecdote and an uninterrupted lecture is not A/B threading.

Title and thumbnail may create curiosity but cannot imply a different result, certainty, scale, or mechanism than the body supplies. Do not infer a performance law from one video's views or a creator's account of analytics.

## Compose SCIENCE with other Agora controls

### `SELL + SCIENCE`

Use the strongest commercial claim requested by the user. Do not turn the hero into an abstract. Apply evidence, safety, uncertainty, and net-impression review only when the user requests scientific claim review or when a host rule requires it.

### `CASE_STUDY + SCIENCE`

Load [agora-case-studies.md](agora-case-studies.md). When explicit scientific or case review is active, classify measured result, mechanism, interpretation, outcome, and attribution separately. Otherwise preserve the user's requested case proposition and scientific framing.

### `VOICE + SCIENCE`

An authorized profile enters at hierarchy level 6. It changes expression, not proposition. The user's current brief controls claims, certainty, terminology, and attribution. Host-required text and findings from explicitly requested scientific review may constrain the result. Do not transfer a source author's opinions or certainty into a new claim.

### `GEO/AEO + SCIENCE`

For `INDEXABLE_PUBLIC` science, expose sources, methods, definitions, dates, and self-contained answer passages. The hero or spoken opening does not need to carry the full method. Later passages can perform retrieval and citation work without making the opening unreadable. Other written surfaces do not inherit GEO/AEO formatting.

## Optional review findings

When the user explicitly requests scientific claim review, flag work that would require:

- fabricating a paper, source, statistic, consensus, quote, result, or mechanism;
- presenting medical, legal, financial, or safety advice as current without authoritative verification;
- hiding uncertainty or a material competing explanation;
- converting a correlation into a causal claim;
- using a false misconception or false balance for drama;
- altering a source quotation and presenting it as exact;
- using decorative visuals as evidence;
- implying that views, clicks, or narration establish a learning or sales effect.

Outside review mode, do not refuse, narrow, qualify, or relabel the user's scientific content. Write to the requested brief.

## Evaluation contract

Hard gates in explicit scientific review mode:

- Claim classes remain distinct.
- Source scope survives.
- Causality is calibrated.
- Statistical magnitude and uncertainty survive when material.
- No invented misconception, consensus, or mechanism.
- Analogy boundary is explicit when analogy carries the explanation.
- Title, visual, opening, and body promises agree.
- First-read comprehension survives technical precision.

Blind-quality dimensions:

- Hook payoff.
- Conceptual clarity.
- Claim separation.
- Uncertainty calibration.
- Causal and statistical integrity.
- Analogy boundaries.
- Visual and narrative integration.
- Audience fit.

## Evidence register

- **A:** [National Academies, Communicating Science Effectively](https://nap.nationalacademies.org/catalog/23674/communicating-science-effectively-a-research-agenda) for goal- and context-dependent communication, not for a universal story formula.
- **A:** [Cochrane Handbook chapter 15](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-15) for effect interpretation, uncertainty, applicability, and the distinction between evidence and recommendations.
- **A:** [Cochrane Handbook chapter 14](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14) for absolute and relative effects and structured certainty assessment.
- **A:** [ASA statement on p-values](https://www.amstat.org/asa/files/pdfs/p-valuestatement.pdf) for limits on p-value interpretation.
- **D:** 2026 practitioner videos on misconception hooks, question-first explanation, A/B threading, audience adaptation, visual explanation, and bounded analogy. These support procedures to test, never universal outcome claims.
- **HOUSE:** route names, audience table, claim-ledger format, system sequence, and evaluation gates. They operationalize the stronger authorities and carry the boundaries stated above.
