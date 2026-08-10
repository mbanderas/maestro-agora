# Agora craft authority

This reference holds the five craft domains that the argument doctrine in [agora-marketing.md](agora-marketing.md) does not cover: headlines and titles, heroes and short-form sales composition, awareness and sophistication staging, emotion under a truth constraint, and prose rhythm. Load it only when the task turns on one of those five.

Nothing here outranks the conflict hierarchy in the main reference. Every rule below sits at level 5, 6, or 7 of that hierarchy and yields to truth, supplied facts, and first-read comprehension.

## Contents

- [How to read the grades](#how-to-read-the-grades)
- [Headlines and titles](#headlines-and-titles)
- [Heroes and short-form sales composition](#heroes-and-short-form-sales-composition)
- [Awareness and sophistication staging](#awareness-and-sophistication-staging)
- [Emotion under a truth constraint](#emotion-under-a-truth-constraint)
- [Prosody and rhythm](#prosody-and-rhythm)
- [Open conflicts in this reference](#open-conflicts-in-this-reference)

## How to read the grades

Grades follow the scale defined in `Evidence register` in the main reference: **A**, **B**, **C**, **HOUSE**. Two labels are added here and defined once.

- **HOUSE/PI** marks a prescription derived by practitioner inference. The components underneath it may carry A or B evidence; the prescription itself has never been tested as written. It is usable and it is not a finding. Do not cite it as one.
- **Governance default** marks a number chosen so a writing system has something checkable to enforce, not because a study measured it. Every number in this reference is either followed by a source link or carries this label in the same sentence or the same table row. There are no other numbers.

The research behind this reference uses a five-point scale whose lowest grade, D, has no equivalent here. A D-grade research finding becomes HOUSE or HOUSE/PI when it is adopted as a procedure, and becomes nothing at all when it is an effect claim. That second case is the common one.

## Headlines and titles

### The competing jobs

A headline is not an attention device. It is a constrained interface performing up to five jobs that compete for the same words. Optimizing one damages another, so the first question is which job controls the next decision.

| Job | What it does | Grade and boundary |
|---|---|---|
| Select the audience | Names the object, task, reader, or query so the right person recognizes it and the wrong person does not. | **C.** Platform and usability guidance treat the title link and descriptive headings as the primary selection signal ([Google title links](https://developers.google.com/search/docs/appearance/title-link), [Google headings](https://developers.google.com/style/headings)). Fails on broad-reach discovery surfaces, where qualification can be weaker because the objective is reach rather than task matching. |
| Make a promise | States what the reader gets or can do, continuing the message that produced the click. | **C.** Landing-page field work identifies a missing continuation of the upstream promise as a defect, though the tested treatment changed more than the headline ([MarketingExperiments](https://marketingexperiments.com/value-proposition/value-proposition-headline)). Fails when the brand or destination already carries the promise; repeating what the reader knows spends the most valuable words on nothing. |
| Interrupt attention | Wins a glance against everything adjacent to it. | **A** for the underlying finding that simpler wording attracts more general readers in large randomized field data ([PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682), [Science Advances](https://www.science.org/doi/10.1126/sciadv.adn2555)). Fails for specialist audiences: the same research did not reproduce the simplicity preference among professional writers. |
| Set expectation for the body | Establishes what the body will deliver. | **A.** Misleading headline implications survive into memory, reasoning, and intentions even when the reader goes on to read the article, and headline-body incongruity damages learning ([Ecker et al.](https://pubmed.ncbi.nlm.nih.gov/25347407/), [Carcioppolo et al.](https://scholarship.miami.edu/esploro/outputs/journalArticle/Exaggerated-and-Questioning-Clickbait-Headlines-and/991031615121502976)). Withholding is not the defect. Implying a body that does not exist is. |
| Survive truncation | Keeps working when the rendering surface clips the end. | **B/C.** Titles have no platform length limit and are truncated to device width ([Google title links](https://developers.google.com/search/docs/appearance/title-link), [Google snippets](https://developers.google.com/search/docs/appearance/snippet)); readers attend disproportionately to the beginnings of lines ([NN/g F-pattern](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)). Fails on a full-width hero with controlled wrapping, where forcing search-style front-loading makes every line read the same. |

**Rule [C]: optimize the headline against the next decision the reader actually makes.** A searcher decides whether this is the answer. A landing-page visitor decides whether to continue or leave. An inbox reader decides whether to open. A documentation reader decides whether this is the section for the task. This is a synthesis of platform mechanics and scanning research rather than one controlled comparison ([Google title links](https://developers.google.com/search/docs/appearance/title-link), [NN/g layer-cake scanning](https://www.nngroup.com/articles/layer-cake-pattern-scanning/)). **Boundary:** a surface serving several of those decisions at once needs an explicit priority before the headline can be written at all, and picking one is a business decision, not a craft one.

| Surface | Job that should win | What it may sacrifice |
|---|---|---|
| Paid-search landing page | Promise and expectation match | Novelty |
| Homepage hero | Audience selection plus promise | Comprehensiveness |
| Search result | Query selection plus accurate expectation | Cleverness, and the tail qualifiers |
| Social feed | Interruption plus a qualified promise | Full explanation, never truthfulness |
| Email inbox | Recognition plus promise | Context the preview line can carry |
| Video browse surface | Attention plus an accurate viewing promise | Standalone completeness, since the thumbnail carries part |
| News headline | Accurate summary | Curiosity |
| Feature headline | Calibrated curiosity | Complete summary |
| Documentation | Navigation and task identification | Novelty, almost entirely |

### Surface mechanics

There is no defensible universal headline length. Some surfaces impose an input limit; most merely render less according to device, viewport, and client. Length has sometimes correlated positively with clicks in randomized headline archives, and what predicted general-reader preference was simplicity rather than brevity, which is a different variable ([PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682), [Science Advances](https://www.science.org/doi/10.1126/sciadv.adn2555)).

- **Landing-page hero. [C]** Complete the message the ad, referral, query, or navigation path began, before introducing a new angle. **Boundary:** direct and home traffic has no upstream message to continue, so the hero leads with category and primary value instead.
- **In-page section heading. [B]** Describe the content underneath rather than decorate it; readers use headings as scanning landmarks ([NN/g layer-cake scanning](https://www.nngroup.com/articles/layer-cake-pattern-scanning/)). **Boundary:** an essay read sequentially rather than looked up can use thematic headings.
- **Search-result title. [C, platform]** Write a unique, descriptive title whose discriminating information survives if the tail disappears. Do not write to a character count: there is no length limit, the displayed title is truncated to the device, and the engine can replace it entirely when the supplied title is boilerplate, repetitive, or unhelpful ([Google title links](https://developers.google.com/search/docs/appearance/title-link)). **Boundary:** because the engine can rewrite it, no amount of precision guarantees what renders.
- **Social card. [C, platform]** Make the first semantic unit intelligible without the final clause, and divide the work between image and text rather than duplicating it ([Meta sharing documentation](https://developers.facebook.com/documentation/sharing/webmasters), [LinkedIn sharing help](https://www.linkedin.com/help/linkedin/answer/a521928)). **Boundary:** no cross-client character cutoff is portable, and some shares render with altered or missing metadata.
- **Email subject and preview. [C]** Treat them as one two-field unit: the subject states the decision-relevant proposition, the preview advances or qualifies it instead of repeating it. **Boundary:** preview text is not guaranteed to display, and generated inbox summaries can replace it ([Apple Intelligence in Mail](https://support.apple.com/guide/iphone/use-apple-intelligence-in-mail-iph9ae667055/ios)). Open rate is not a terminal metric where privacy protection is material ([Apple Mail Privacy Protection](https://support.apple.com/guide/iphone/use-mail-privacy-protection-iphf084865c7/ios)).
- **Video title and thumbnail. [C, platform]** Write them as one information system carrying complementary information, not the same message twice ([YouTube title settings](https://support.google.com/youtube/answer/57404)). **Boundary:** a search-led tutorial needs the title to carry the query relevance the thumbnail cannot.
- **Documentation heading. [C, platform]** Repeat functional syntax when the repetition teaches the information architecture ([Microsoft headings](https://learn.microsoft.com/en-us/style-guide/scannable-content/headings)). **Boundary:** marketing and editorial surfaces get no navigation benefit from the same repetition.

### The specificity ladder

Specificity is not monotonically beneficial, and this is the single most misapplied idea in headline craft.

**Rule [A]: move from vague toward concrete until the reader can identify the subject, the relevance, and the value, then stop.** A meta-analysis of randomized headline experiments found the effect of concreteness depends on the starting level: from a vague baseline more concreteness increased clicks, and from an already highly concrete baseline more concreteness decreased them ([Scientific Reports](https://www.nature.com/articles/s41598-024-81575-9)). **Boundary:** high-intent surfaces can still justify more detail than that finding implies, because qualified selection is worth more there than maximum response.

**Rule [B]: use a precise fact when the precision has a visible reason to exist.** Specific claims can raise perceived credibility, and exact-looking numbers are more likely to be read as factual than approximate ([specificity and credibility](https://research.manchester.ac.uk/en/publications/being-specific-being-credible-the-influence-of-claim-specificity-/), [sharp versus round numbers](https://www.researchwithrutgers.com/en/publications/it-seems-factual-but-is-it-effects-of-using-sharp-versus-round-nu)). **Boundary:** these concern perceived claim credibility, not headline response. Precision that is irrelevant, unsupported, or inconsistent with how the thing was measured inherits none of it.

The ladder, using one fictional bicycle-repair business throughout so the rungs are comparable:

| Rung | What it contains | Example | Diagnosis |
|---|---|---|---|
| Vague aspiration | An abstract positive state | `Ride better` | No subject, mechanism, audience, or observable outcome. |
| Category | What the thing is | `Bicycle repair for commuters` | Selection is now possible. No promise yet. |
| Outcome | Category plus the change | `Get your commute back the same day` | The reader knows why to care, not who it is for or how. |
| Audience plus outcome | Adds a discriminating reader | `Same-day repair for people who cycle to work` | Better qualification. Some readers are now deliberately excluded. |
| Mechanism | Adds how the result happens | `We keep the ten commonest commuter parts in stock, so most repairs finish the same day` | Credible and useful, and a real how remains for the body. |
| Measured outcome | Adds a quantified, supported result | `Four out of five commuter repairs left the shop the same day last quarter` | Strong only when the figure is real, current, and representative. |
| Over-specific | Adds precision with no return | `81.4 percent of commuter repairs completed within 6.2 hours across a 13-week window` | The precision now describes the measurement process rather than telling the reader anything. |

**Rule [HOUSE]: never add a number because exact numbers look credible.** The adjacent evidence shows that sharp numbers signal factuality; nothing shows that invented precision improves response, and manufacturing one violates the truth rules regardless. **Boundary:** none. This is absolute.

The second specificity failure is unnecessary disqualification. `Same-day repair for people who cycle to work` is better than `Same-day repair for people who cycle to work on hybrid frames with rim brakes` only if frame type and brake type are genuine qualification criteria the shop wants applied before the click. If they are incidental, the added specificity has converted a promise into a limitation. **Rule [HOUSE/PI]: surface a limitation in the headline when filtering the wrong reader is worth more than maximizing response.** **Boundary:** no field study isolates this, so it is a decision heuristic and stays one. This also dissolves an apparent contradiction: a more specific headline can lower response and improve economics at the same time, because it is selecting fewer and better readers. Response is not always the objective.

### Archetypes and their conditions

Formulas are a search space, not a league table. Each entry below is usable only under its condition, and each has a named failure.

| Archetype | Works when | Fails when | Grade |
|---|---|---|---|
| Direct benefit, `Reduce X without Y` | The reader knows the category and is deciding whether the result is worth having. | The benefit is generic, unsupported, or identical to every competitor's. Overuse produces a site of interchangeable outcome slogans. | **C** ([MarketingExperiments](https://marketingexperiments.com/value-proposition/value-proposition-headline)) |
| News, `New X now does Y` | Something is genuinely new and the novelty itself matters to this reader. | `New` is packaging for an unchanged proposition. Repetition creates announcement inflation. | **HOUSE.** No controlled evidence establishes announcement syntax as a general winner. |
| How-to, `How to do X` | The reader has an explicit task or procedural question. | The piece contains no procedure, or the reader wanted analysis. Overuse makes every idea look like a chore. | **C** for task-oriented documentation ([Microsoft headings](https://learn.microsoft.com/en-us/style-guide/scannable-content/headings)) |
| Question | The question names a live uncertainty and refers to the reader. | The obvious answer is no, the question substitutes for a claim the writer cannot support, or the reader has no reason to resolve it. | **A inside the tested contexts only** ([Lai and Farbrot](https://www.tandfonline.com/doi/full/10.1080/15534510.2013.847859)). Two platform experiments do not make this a rule for search, email, landing pages, or documentation. |
| Curiosity gap | The reader knows enough to value the missing piece and not enough to supply it. | Too vague gives no reason to care; too concrete removes the gap. Overuse produces visible machinery. | **A** for the interior optimum ([Scientific Reports](https://www.nature.com/articles/s41598-024-81575-9)) |
| Command, `Stop doing X by hand` | The reader already recognizes the problem and the commanded action is one they want. | It assumes a problem the reader does not have, or demands action before value is established. Overuse makes the voice hectoring. | **HOUSE.** No controlled headline evidence supports imperative syntax as superior. |
| Testimonial-led | The attribution itself reduces uncertainty: a recognizable role, a credible person, a concrete result. | Attribution is anonymous, generic, or irrelevant. Overuse replaces your proposition with borrowed praise. | **HOUSE.** Social-proof research does not isolate testimonial headlines. Under `Truth and ethical limits` the quotation must also be real. |
| Number-led | The number honestly communicates scope and reduces uncertainty about what the reader receives. | The number is arbitrary, or the count signals work rather than value. | **B** for precision read as factuality ([sharp numbers](https://www.researchwithrutgers.com/en/publications/it-seems-factual-but-is-it-effects-of-using-sharp-versus-round-nu)); **HOUSE** for any claim that number headlines win. |
| Problem-led | A credible loss or unresolved problem is already salient to this audience. | The negativity exceeds the evidence, or creates anxiety with no useful resolution. Overuse resets the publication's emotional baseline. | **B**, publisher-specific ([PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682)) |
| Audience callout, `For X who Y` | Excluding the wrong reader is worth money and the right reader recognizes the identity instantly. | The segment is drawn from internal taxonomy the audience does not use. Overuse turns every headline into a label. | **C** as qualification and information scent ([NN/g scanning](https://www.nngroup.com/articles/layer-cake-pattern-scanning/)) |
| Contrast, `X without Y` | The audience holds the objection the contrast resolves. | The implied tradeoff is not one the reader recognizes. | **HOUSE** as a message strategy, never as a proven syntax. |

### The curiosity gap and its handoff

A legitimate gap has four parts: a known subject, a stake, one specific unresolved variable, and a credible expectation that the body resolves it. Empty withholding has only the fourth.

Weak, and true, for a fictional municipal water utility:

> You will not believe which street had the worst water pressure last winter.

Strong:

> The pressure drop on Cardwell Street traced back to a valve nobody had recorded.

The strong version withholds the valve and its location in the network. It does not withhold the subject, the class of consequence, or the fact that an answer exists.

**Rule [A]: create a resolvable gap, not an information vacuum.** The largest gap is not the strongest gap ([Scientific Reports](https://www.nature.com/articles/s41598-024-81575-9)). **Boundary:** informational and search surfaces often need enough disclosure to solve selection before any curiosity is useful.

**Rule [A]: the opening must confirm the headline's premise before introducing a second premise.** Headline implications change how the body is processed, and incongruity costs comprehension ([Ecker et al.](https://pubmed.ncbi.nlm.nih.gov/25347407/), [Carcioppolo et al.](https://scholarship.miami.edu/esploro/outputs/journalArticle/Exaggerated-and-Questioning-Clickbait-Headlines-and/991031615121502976)). **Boundary:** a narrative can postpone the final answer, but it cannot reveal later that the headline was about a materially different claim.

**Rule [B]: after a curiosity-led click, reduce uncertainty instead of reopening the same gap.** Answering `The answer may surprise you` spends the click and returns nothing. Curiosity is motivation to close a salient gap, and incongruent handoffs damage processing ([Loewenstein](https://www.byrdseed.com/handouts/Psychology%20of%20Curiosity.pdf), [Ecker et al.](https://pubmed.ncbi.nlm.nih.gov/25347407/)). **Boundary:** long-form work may open a second, deeper question once the first is resolved or made concrete.

Three separate backlash claims must not be merged. Expectation violation has strong evidence, above. Trust cost is real in some designs and not universal, and item credibility, source credibility, and publication trust are different variables that do not move together ([null findings on trust](https://csmapnyu.org/research/academic-research/the-null-effects-of-clickbait-headlines-on-polarization-trust-and-learning)). Decay from repeated curiosity syntax within one publication has no qualifying evidence at all and must not be asserted.

### Corpus variance, split by function

This rule is stated in full in `Plain language and first-read comprehension > Corpus-level variance` in the main reference and is not repeated here. Three points belong with the headline material.

**Where repetition is correct [C]:** headings that are members of one task or information class should use parallel syntax, because predictable grammar helps a reader recognize equivalent information types ([Microsoft instructions](https://learn.microsoft.com/en-us/style-guide/procedures-instructions/writing-step-by-step-instructions)). **Boundary:** stop parallelizing when the headings stop representing equivalent units.

**Where repetition costs [HOUSE]:** for attention-oriented headings, manage template concentration rather than demand uniqueness. Banner blindness is visual and positional rather than syntactic, so its effect does not transfer to headline grammar ([NN/g banner blindness](https://www.nngroup.com/articles/banner-blindness-old-and-new-findings/)), and large-scale headline analysis documents stylistic convergence between outlets rather than response decay ([Nature HSSC](https://www.nature.com/articles/s41599-025-04514-7)). **Boundary:** the absence of measured decay is not permission to run one template across a site. It means the reason to vary is the reader's ability to tell sections apart, not a predicted response loss.

**Reading the template signature.** A template is `clause type + lead device + promise structure`, not surface wording. `7 errors in payroll` and `11 causes of failed imports` are the same template. `Import records` and `Map columns` are the same template and correctly so.

## Heroes and short-form sales composition

### The unit is the composition

A hero is not a compressed article, specification, methodology page, or feature inventory. It is a distributed argument whose elements share the work:

- optional eyebrow;
- headline;
- subhead;
- primary CTA;
- optional secondary CTA;
- optional proof or qualification microcopy;
- visual or evidence context;
- immediate next section.

Rule [C/HOUSE]: judge whether the composition answers the reader's next decision, not whether one line repeats every fact. Field practitioners consistently treat headline, subhead, visual, proof, and CTA as a system; the exact composition is an Agora house model. Boundary: a material qualification cannot be hidden in an unrelated visual or distant section merely because the headline is short.

The headline can carry stake or promise while the subhead carries category and mechanism. A proof strip can carry credibility. The CTA can state the available action. The next section can carry method and scope. Repetition is justified only when an element must work outside that composition.

Treat the subhead as a handoff from promise to belief, not as storage for every fact omitted from the headline. Give the reader the minimum category, mechanism, difference, or proof needed to trust the next step. Do not turn the subhead into an input list, feature ledger, or compressed methodology. When several inputs prove only breadth, compress them to the reader-owned relation that matters, such as `recorded buyer decisions and public market changes`. When several outputs prove only scope, name the decision or artifact the destination actually delivers rather than inventorying every format. If removing an item does not reduce orientation, belief, distinction, or destination clarity, move it below the hero. Rule [HOUSE]: the subhead earns its space by strengthening the argument, not by making the composition more complete. Boundary: an expert evaluation surface can need several exact criteria above the fold when those criteria determine eligibility, integration, or product fit.

### Diagnose the hero before drafting

Determine:

- intended audience and decision role;
- awareness state;
- message sophistication or claim saturation;
- traffic source and upstream promise;
- one commercial action the hero must earn;
- actual CTA destination and commitment;
- offer facts and mechanism;
- strongest proof;
- material price, scope, eligibility, safety, or commitment limits;
- visual, navigation, proof strip, microcopy, and adjacent-section context.

Ask only when a missing fact would materially change the audience, promise, offer, or action. Otherwise narrow the claim.

On medical, clinical, legal, financial, safety, and other high-stakes heroes, preserve the exact supplied name and scope of each material check, rule, population, condition, comparator, and limitation. Compression may distribute those terms across the composition. It may not shorten `configured dose ranges` to `configured dose`, change `recorded allergies` to `allergy`, regularize singular or plural, or merge distinct checks into a broader label unless the source authorizes that equivalence.

Controlled intensity does not mean a capability label. Lead with the supported operational decision, inspectable reason, or human agency that matters before the consequential action. Carry the exact consequential object into the headline when it improves orientation; do not replace an order, transaction, specimen, filing, or decision with a generic alert, item, record, or issue. Prefer a concrete shape such as `Know why the order was flagged before release` over `Inspectable alerts for safer work` when the supplied mechanism supports it. Do not escalate fear, imply prevention, or promise safety. Keep material scope, required modality, and human-review limits in the same composition.

Preserve high-stakes quantifiers and obligations exactly. `Every`, `each`, `a`, `may`, and `must` are not interchangeable. State the product action directly, then state the required human action directly. Do not bury the mechanism inside a `Before the reviewer...` opening when sequence is not the argument; that construction weakens the product action and can turn a requirement into a description of what usually happens.

If the source says `A reviewer must review and release the item`, keep `must` in the finished composition. `Before a reviewer reviews and releases the item` and `A reviewer reviews every item` both erase the obligation and alter the quantifier.

Prefer a supported evidence-access or decision-control promise over an imperative that implies controlled safety or performance. `Know why the order was flagged` promises inspectable information. `Make every alert reviewable` may imply that the product controls the review state. The imperative is usable only when the mechanism and destination actually deliver that action.

The hero's dominant job changes by surface:

| Surface | Dominant job | Common failure |
|---|---|---|
| Cold homepage | Category orientation plus primary value and difference | Coined category or feature list before relevance |
| Known-referral campaign | Continue the upstream promise and create desire for the next action | Starting a second message unrelated to the click |
| Product launch | Make supplied novelty consequential | Calling ordinary availability a breakthrough |
| Pricing or upgrade | Clarify offer, value difference, and commitment | Repeating education instead of helping a ready buyer act |
| Enterprise service | Establish credible stake, difference, and path to proof | Using enterprise as a reason for inert language |
| Short ad, subject line, or sales opening | Earn the next moment with one supported tension or promise | Empty curiosity or a complete product summary |

On a cold homepage, lead with the task or result the visitor already recognizes. Do not let eligibility or delivery limits displace that primary value. Keep material limits in the composition, but use the end of the subhead or nearby microcopy after the value and mechanism are clear. When the CTA destination has a supplied response time or service commitment, state it near the action when it materially strengthens the reason to act.

### Separate the safety floor from the optimization target

A candidate fails the safety floor if it:

- contradicts supplied facts;
- invents proof, capability, urgency, scarcity, novelty, or outcome;
- guarantees a result outside the offer's control;
- hides a material price, scope, eligibility, safety, or commitment condition;
- creates a false legal or ethical implication;
- alters the exact name or scope of a material high-stakes check, rule, population, condition, comparator, or limitation;
- promises a destination the next action does not deliver.

Passing the floor does not make the copy good. Among survivors, optimize for:

- immediate desire or tension;
- commercial consequence;
- differentiation;
- memorability;
- first-read clarity;
- product relevance;
- emotional force grounded in facts;
- cadence and read-aloud force;
- forward motion;
- compression without decoding cost;
- awareness, sophistication, traffic, and composition fit.

Rule [HOUSE]: do not award extra quality merely because a safe candidate contains more evidence language. Once the hard gates pass, additional proof or qualification helps only when it improves belief, orientation, or the next decision.

### Draft the boldest supportable promise first

Use this internal process:

1. Define the action the surface must earn.
2. Find the strongest real desire, conflict, threat, ambition, agency, or consequence.
3. Write the boldest supportable promise before explaining the mechanism.
4. Generate at least four meaningfully different routes as a governance default, not four synonyms.
5. Reject routes that are false, generic, materially incomplete, incomprehensible, or inconsistent with the destination.
6. Rank survivors by hard gates first and commercial force second.
7. Add the minimum category, mechanism, or proof needed for belief.
8. Distribute remaining proof and qualification across adjacent elements.
9. Read the full composition aloud.
10. Remove words that explain the company without increasing desire, belief, orientation, or action.

Keep the headline to one commercial argument. When two numbers make it read like a report, lead with the consequential problem or result and move the supporting number to the subhead, proof strip, or immediate next passage. Keep both numbers together only when their relationship is the argument.

Supported route families include competitive threat, ambition, control, avoided loss, category change, broken assumption, direct outcome, provocative contrast, proof-led confidence, and offer-led action. Do not force an enemy, fear, identity, or loss the facts do not contain.

Return one recommended composition by default. Present it as finished copy, not a worksheet labeled `Headline`, `Subhead`, `CTA`, and `Qualification`, unless the user requests component labels or the delivery context would otherwise be ambiguous. Keep internal routes and scoring hidden unless the user requests options or rationale.

### Map promise grammar to evidence

| Grammar | Promise made | Required support |
|---|---|---|
| `See X` | Destination exposes the named artifact or information | X must be visibly delivered |
| `Learn how to X` | Destination teaches an actionable method | More than facts about X; enough method to act or evaluate |
| `We help you X` | Product assists the reader's action | Supported mechanism and truthful scope |
| `Do X more often` | Product improves performance frequency | Comparative or outcome evidence |
| `You will X` | Future outcome or guarantee | Control over the result, evidence, and enforceable conditions |
| Imperative `Beat X` | May imply controllable achievement | Review literal implication, mechanism, and destination |

Rule [HOUSE]: grammar changes the claim even when the nouns remain the same. `See how to respond` can promise an artifact. `Win more deals` promises improved performance. `You will win` promises an outcome. Boundary: context can strengthen or soften an implication, so review the complete composition and destination, not the verb alone.

### Make force carry meaning

Punch is not a word-count target. Prefer:

- one consequential idea per beat;
- active and causal verbs;
- concrete obstacles and states;
- contrast that exposes a real asymmetry;
- strong final words;
- removal of setup clauses;
- strategic fragments only when the missing syntax remains obvious;
- controlled repetition when it builds one argument;
- a line a salesperson could say aloud without translating it.

Reject short lines whose literal meaning is thin. Reject long lines that process every input before the reader feels the stake. The best short line compresses reasoning, not meaning.

### Place proof and qualification without weakening the opening

Keep a material limit close enough to govern the claim. Use the headline, subhead, microcopy, proof strip, visual caption, or immediate next passage according to where the reader needs it.

Rule [HOUSE]: the lower an element sits, the less it can repair a misleading first impression. A qualification directly below the CTA can bound eligibility. A methodology note several screens later cannot repair an unsupported outcome in the headline.

Written GEO/AEO applies to the page and coherent passages. The hero can optimize for attention while later sections provide definitions, sources, scope, methodology, and quotable answers. Do not make every hero sentence independently extractable.

### Permanent RivalScope regression fixture

Available facts: RivalScope imports CRM win/loss records with named competitors and decision reasons, monitors public competitor pricing and product changes, groups buyer feedback by competitor and criterion, and produces comparison reports, battlecard inputs, and recommended messaging changes. It has no measured evidence of improving win rate, revenue, or market share. It can explain where competitors won and recommend responses. It cannot guarantee a future win.

Operational and over-complete:

> RivalScope combines CRM win/loss records, competitor pricing, product pages, and buyer feedback into dashboards, battlecards, and weekly recommendations.

Stake-led but product-light:

> Every lost deal leaves a pattern. The faster you see it, the sooner your pitch can change.

Competitive and directional:

> See where competitors beat you, why buyers chose them, and how to beat them next time.

The third line promises access to a response strategy. It passes only when the destination supplies one. It does not permit a claim that RivalScope improves win rate or guarantees a future victory. The task is to find the strongest truthful composition, not to preserve this wording.

### Evidence boundaries

- **A/B:** existing headline evidence in this reference supports expectation match, bounded specificity, simplicity, and surface fit.
- **C/D:** 2024-2026 practitioner videos support composition review, subhead handoff, benefit orientation, proof placement, and route generation as procedures to test. Their fixed five-second, percentage, and conversion claims remain unverified.
- **HOUSE:** safety-floor split, internal route count, persuasion treatment, promise grammar table, composition model, and RivalScope fixture.

## Awareness and sophistication staging

### The two axes

Awareness belongs to the reader: how much of the problem, the solution class, and this product they already hold. Sophistication belongs to the market: how many competing claims of this kind the reader has already absorbed. Collapsing them is the usual mistake, and it produces both classic failures at once.

A mature category contains first-time readers. A technically expert buyer can be unaware that the problem you have named has a category. A long-standing category buyer is product-unaware with respect to every new entrant.

**Awareness decides how much conceptual context the opening must supply. Sophistication decides how much differentiation and claim resistance the message must overcome.**

### What the staging model is, and is not

**Rule [C]: treat the awareness stages as a practitioner segmentation heuristic, never as a measured law of consumer cognition.** The lineage is a 1966 copywriting book and decades of reuse ([lineage record](https://spdrdng.com/posts/summary-of-breakthrough-advertising-by-eugene-m-schwartz)). No controlled program establishes that readers partition into those exact states, that the states are exhaustive, or that copy matched to them outperforms alternatives. **Boundary:** the model stops helping the moment one label is hiding several different motives, decision roles, or occasions.

What the literature does support is narrower and more useful:

- **[B] Change the information structure when prior category knowledge changes.** Knowledge alters what people process and how they search ([Bettman and Park](https://academic.oup.com/jcr/article/7/3/234/1820883), [Brucks](https://academic.oup.com/jcr/article-abstract/12/1/1/1791043)). **Boundary:** the relationship is not a staircase. Middle-knowledge readers processed more available information than either extreme, so more expertise does not mean more information.
- **[A] Do not equate expertise with willingness to read an introduction.** Higher-prior-knowledge readers learned less about a new product because they attended less during encoding ([Wood and Lynch](https://academic.oup.com/jcr/article-abstract/29/3/416/1800953)). **Boundary:** this concerns complacency about apparently familiar material. It is not a licence to remove decision-relevant technical evidence.
- **[B] Use the stages as message states, not as a sequence every reader must traverse.** Even the classic hierarchy models allowed for purchases that skip stages ([Lavidge and Steiner](https://www.jstor.org/stable/1248516)), and journey research treats the process as multi-touch ([Lemon and Verhoef](https://journals.sagepub.com/doi/10.1509/jm.15.0420)). **Boundary:** a deliberately sequenced education programme can impose an order. That is campaign architecture, not the buyer's internal process.

The same verdict applies to the sophistication ladder. **Rule [C]: use it as a competitive-message audit, not as a law of market development** ([lineage record](https://taylorpearson.me/bookreview/breakthrough-advertising/)). **Boundary:** different segments inside one market have different exposure histories, so a category cannot carry one sophistication number for every audience.

### The routing table

Every cell below is **HOUSE/PI**. No controlled literature tests these combinations as copy treatments, and the prescription has never been run as an experiment. It is a routing aid whose components carry the A and B evidence listed after it. `Proof` means the evidence to foreground, not the only evidence the page may hold. CTA commitment is low (learn, inspect, diagnose), medium (compare, assess, sample), or high (trial, demo, audit, price, buy).

| Awareness | Sophistication | The opening must | Mechanism | Coined term | Proof that carries | CTA |
|---|---|---|---|---|---|---|
| Unaware | Fresh | Make a recognizable symptom or situation salient. | Omit. | Costs. | Concrete observation. | Low |
| Unaware | Repeated claims | Make the problem noticeable without entering the claim contest. | Omit. | Costs. | Consequence or visible diagnostic. | Low |
| Unaware | Claim saturation | Show the familiar symptom, hint the obvious explanation is incomplete. | Gesture. | Costs in the opening. | Simple causal demonstration. | Low |
| Unaware | Mechanism saturation | Connect a lived symptom to why familiar fixes miss it. | Gesture. | High cost until a plain-language model exists. | Conventional approach against this one. | Low |
| Unaware | Exhaustion | Earn recognition through situation or a counterintuitive observation. | Omit or gesture. | High cost. | Credible observation, third-party evidence. | Low |
| Problem aware | Fresh | Name the problem and establish it is solvable. | Gesture. | Usually costs. | Problem scale and the existence of a solution. | Low |
| Problem aware | Repeated claims | Name problem, stake, and attainable outcome. | Gesture. | Usually costs. | Outcome evidence and benchmark. | Low to medium |
| Problem aware | Claim saturation | Explain why the standard attempt fails. | Gesture, then name generically. | Neutral after the explanation. | Causal evidence plus outcome. | Medium |
| Problem aware | Mechanism saturation | Reframe the cause so it separates from familiar fixes. | Name after the plain-language version. | Helps only if it compresses an understood distinction. | Comparative mechanism evidence. | Medium |
| Problem aware | Exhaustion | Establish a point of view that makes the reader feel accurately understood. | Gesture or describe. | Costs unless already circulating. | Peer credibility, independent evidence. | Medium |
| Solution aware | Fresh | State the solution class and the concrete result. | Name generically. | Usually unnecessary. | Demonstration that it works. | Medium |
| Solution aware | Repeated claims | Show why this version fits the use case better. | Gesture or generic name. | Neutral. | Quantified outcome and fit evidence. | Medium |
| Solution aware | Claim saturation | Introduce the discriminating how. | Name. | Helps when interpretable. | Mechanism evidence plus outcome. | Medium to high |
| Solution aware | Mechanism saturation | State the consequential mechanism difference and its tradeoff. | Name precisely. | Helps when it maps to a criterion buyers already use. | Head-to-head or independently verifiable proof. | Medium to high |
| Solution aware | Exhaustion | Lead with fit or decision criterion, then substantiate. | Name selectively. | Helps only if recognized or genuinely compressive. | References, total cost, implementation evidence. | High |
| Product aware | Fresh | Connect the known product to the desired result. | Secondary. | Neutral. | Product demonstration. | High |
| Product aware | Repeated claims | Resolve why this product's claim is stronger or more relevant. | Name if useful. | Neutral. | Case evidence and quantified result. | High |
| Product aware | Claim saturation | Tie the known product to its differentiating mechanism. | Name prominently. | Often helps if credible. | Mechanism plus product-level result. | High |
| Product aware | Mechanism saturation | Make the mechanism advantage legible against known alternatives. | Name precisely. | Helps when it reduces comparison effort. | Comparative benchmark, technical validation. | High |
| Product aware | Exhaustion | Resolve fit, trust, implementation, or the economic case. | Name only if decision-relevant. | Existing shorthand helps; new terms cost. | References, economics, contractual proof. | High |
| Most aware | Fresh | Put the offer or availability first. | Omit. | Irrelevant. | Terms, guarantee, delivery facts. | High |
| Most aware | Repeated claims | Put the offer and the decisive term first. | Omit unless unresolved. | Irrelevant. | Terms and final reassurance. | High |
| Most aware | Claim saturation | Offer first, remaining mechanism objection second. | Secondary. | Use only a familiar term. | Reversibility and final objection proof. | High |
| Most aware | Mechanism saturation | Offer plus one decisive differentiator. | Name only when decisive. | Familiar shorthand helps. | Implementation, compliance, contractual evidence. | High |
| Most aware | Exhaustion | Reduce friction to action rather than reopening the argument. | Background. | Established language can compress meaning. | Operational certainty, commercial terms. | High |

Three evidence-backed constraints bound that table. These are the graded rules; the table is the inference.

- **[A] Experienced audiences need credibility, not louder claims.** Once a selling motive is accessible, readers apply what they know about persuasion and discount accordingly ([Campbell and Kirmani](https://academic.oup.com/jcr/article-abstract/27/1/69/1791556)). **Boundary:** persuasion knowledge is not automatic. Low motive accessibility and constrained attention reduce its use.
- **[B] Plain-language meaning precedes an unfamiliar proper noun.** Jargon measurably reduces processing fluency even when definitions are supplied ([Shulman et al.](https://journals.sagepub.com/doi/10.1177/0261927X20902177)). **Boundary:** familiar technical terminology used with a technical evaluator is not functioning as jargon, and this constraint does not apply to it.
- **[A] Give an unfamiliar product a familiar reference category before asking for new category vocabulary.** The first plausible category label materially shapes how a genuinely new product is understood, and a well-mapped analogy helps when the reference is genuinely familiar ([Moreau, Markman, and Lehmann](https://academic.oup.com/jcr/article-abstract/27/4/489/1810433), [Roehm and Sternthal](https://academic.oup.com/jcr/article/28/2/257/1899200)). **Boundary:** the first category anchors expectations whether or not it is right, so the copy must also say which attributes do not transfer. An analogy that needs its own explanation reverses the benefit.

**Rule [HOUSE/PI]: mechanism prominence is not monotonic.** It rises from unaware through active comparison and falls again once the reader knows the mechanism and is deciding whether to act. The most-aware reader has an offer-friction problem, not a vocabulary problem. **Boundary:** if the mechanism is that reader's last unresolved objection, it belongs in the first sentence after all.

**Rule [HOUSE/PI]: the same true fact occupies different positions at different states.** A pilot result belongs below problem recognition for an unaware reader, beside the differentiation argument for a solution-aware reader, and near the opening for a product-aware buyer. **Boundary:** none of this licenses changing the fact, its scope, or its qualifier to suit the position.

### Diagnosing the state

Infer the state from evidence about the reader, never from the product. A technical product does not imply a sophisticated reader, and a mature category does not imply an oriented visitor.

| Signal | What it legitimately tells you | Grade |
|---|---|---|
| Search query | The explicit language and immediate research task that produced the visit. A symptom query, a category query, a comparison query, and a brand-plus-price query are four different states. | **C.** Large observational search data support behavioral differences between intent classes ([Jansen and Schuster](https://pure.psu.edu/en/publications/bidding-on-the-buying-funnel-for-sponsored-search-and-keyword-adv/)). Not deterministic: one phrase can encode several motives. |
| Referring content | What argument and vocabulary the reader has already consumed. | **HOUSE/PI.** Continue from demonstrated context rather than restarting. |
| Channel | The attention contract and probable intent. | **HOUSE/PI.** Directional only. |
| Brief or customer research | Direct statements about triggers, alternatives, vocabulary, and objections. | **HOUSE/PI**, and it outranks every generic assumption above. |
| Page depth | What the reader has done on the property already. | **HOUSE/PI**, and it is downstream evidence only. Page depth never justifies the opening on the page that produced that depth. Using it that way reverses cause and effect. |

When the state is unknown, the fallback is not to write for the unaware reader and not to write for the expert. **Rule [HOUSE/PI]: build a staged surface.** Open with a recognizable problem or outcome in ordinary language, identify the familiar category where one exists, gesture at the mechanism in plain words, introduce a coined term only after its usefulness is understood, put the detailed proof below clear signposts, and keep the first action low or medium commitment unless the channel itself demonstrates purchase intent. **Boundary:** this has adjacent support from the jargon and choice-complexity evidence and has never been tested as a page treatment.

**Rule [A]: do not use information overload as a blanket argument for less information.** Choice-overload meta-analysis identifies strong moderators rather than a universal penalty, and a separate meta-analysis found an average effect near zero with wide variation ([Chernev et al.](https://myscp.onlinelibrary.wiley.com/doi/10.1016/j.jcps.2014.08.002), [Scheibehenne et al.](https://ideas.repec.org/a/oup/jconrs/v37y2010i3p409-425.html)). Reduce complexity where the reader has no decision structure; keep the detail where the task requires it. **Boundary:** complexity does create overload under the identified moderators, so this is not permission to publish everything.

### The cost of getting it wrong

| Wrong guess | What fails | Grade |
|---|---|---|
| Too advanced for the reader | Undefined concepts, comparison criteria, and mechanism names arrive before the reader has a schema for them. | Jargon cost **B**; the staging rule itself HOUSE/PI. |
| Too basic for the reader | The page repeats what the reader knows and delays the discriminating information the evaluation needs. | Expert inattention **A**; the page rule HOUSE/PI. |
| Too promotional for a persuasion-aware reader | The reader processes the tactic rather than the claim, and discounts. | **A** |
| CTA too advanced for the state | The page asks for commitment before belief or organizational readiness exists. | **C** for the field observation that early conversions are often timing failures rather than quality failures ([6sense](https://6sense.com/science-of-b2b/2024-buyer-experience-report/)). **Boundary:** a consultative sale can legitimately involve salespeople early as educators. |
| CTA too weak for a ready buyer | A qualified buyer is made to consume education instead of transacting. | HOUSE/PI |

**Rule [HOUSE/PI]: never report a bounce as evidence that a staging mismatch caused the failure.** Bounce has many causes, including technical performance, source mismatch, price discovery, and a completed single-page task. **Boundary:** none. Diagnose with an experiment or with direct evidence, or say you do not know.

### Committees

**Rule [C]: model a complex organizational purchase as a group with different information tasks, not one persona at one state** ([Johnston and Bonoma](https://journals.sagepub.com/doi/abs/10.1177/002224298104500312), [Webster and Wind](https://www.jstor.org/stable/1250972)). **Boundary:** low-value, routine, or single-authority purchases collapse the group to one or two people, and treating those as committees adds cost for nothing.

**Rule [HOUSE/PI]: serve a mixed-state group with layered copy, not averaged copy.** The shared layer establishes problem, outcome, category, and the decisive difference in language every role can parse. The layers beneath expose role-specific proof behind explicit labels. **Boundary:** two failure modes sit either side of this. A hero carrying enough security, architecture, economics, and procurement language to satisfy every evaluator is an information-design failure. Deleting the technical specificity to fix that merely reverses the mismatch.

**Rule [HOUSE/PI]: in a committee, name the mechanism near the opening when it is already a recognized comparison criterion, and pair the name with its plain consequence** so the business meaning survives deleting the coined term. **Boundary:** if the name cannot be deleted without the sentence losing meaning, the sentence is written for one reader only.

## Emotion under a truth constraint

### What emotion is for here

Emotion gives supported facts personal importance. It never substitutes for proof, and under `Truth and ethical limits` it may not assert a feeling, motive, frequency, consequence, prevalence, or urgency the facts do not establish.

**Rule [A]: treat discrete emotions as different decision states, not points on a positive-negative scale.** Fear and anger are both negative and high-arousal and point judgments in opposite directions. Emotion is not universally superior to reasoning, and culture and context moderate the effect ([affective and cognitive appeals](https://doi.org/10.1093/joc/jqae042)). **Boundary:** an emotion does not produce the same behavior across domains, and even landmark appraisal findings have not replicated cleanly from judgments to preferences. Do not carry an effect from one domain into another.

**Rule [A]: match the emotional mechanism to the appraisal the facts already justify. Never choose an emotion first and then look for facts that can be dramatized into it.** Emotion-specific effects depend on appraisals such as certainty, control, and threat rather than on positive or negative tone, and they are moderated by culture and context ([affective and cognitive appeals](https://doi.org/10.1093/joc/jqae042)). **Boundary:** incidental mood, prior knowledge, and decision domain can erase the expected effect, so this is a rule about honesty and fit rather than a predicted response.

**Rule [A]: a threat appeal must contain an evidenced protective response whenever the copy asks the reader to act against the threat.** Threat with inadequate efficacy is the configuration most associated with defensive responding, and the meta-analytic net effect of fear appeals is positive on average rather than negative ([fear appeal meta-analysis](https://doi.org/10.1037/a0039729)). **Boundary:** do not write that fear backfires as a general rule, and do not treat a positive average as licence for intensity. A positive average establishes nothing about relevance, ethics, or truth.

Before any threat appears in copy, all of the following must hold. This is a system constraint, not a finding: the hazard exists in the supplied facts; the severity is the evidenced severity and not an escalation of it; applicability is evidenced or written conditionally as `if your team does X`; probability is not invented, so a possible event is called possible and never likely, common, or imminent; the recommended action really performs the protective function; the magnitude of that protection is not invented; any deadline or window comes from the facts; and the message provides a way forward.

**Rule [A]: do not replace quantitative evidence with a customer story when the decision turns on magnitude, frequency, probability, or generality.** Narrative effects are real and modest, and direct comparisons have often favoured statistical evidence for beliefs and attitudes ([narrative persuasion meta-analysis](https://doi.org/10.1080/03637751.2015.1128555)). **Boundary:** an anecdote can carry more weight for intentions and under high personal relevance. It still never establishes generality, and one true customer experience remains one case.

**Rule [A]: make the decision-relevant mechanism vivid, not the decoration around it.** Concrete, imaginable consequences can improve attitudes and intent ([vividness meta-analysis](https://doi.org/10.1080/15534510.2016.1157096)). **Boundary:** the effect is heterogeneous and vivid irrelevance competes with the argument. A scenic office description or founder anecdote consumes attention without improving the decision.

### Emotion from a fact set with no outcome data

This is the section that matters most, because it is Agora's normal condition. Assume the available facts contain product mechanics, workflow steps, interfaces, limits, permissions, prices, dates, terms, error states, and reversibility conditions, and contain no outcome data, no testimonials, no prevalence claims, no market claims, and no evidence of what any user feels.

That fact set is sufficient. The move is to stop treating emotion as an adjective layer over evidence and start exposing the consequential structure already inside the facts.

**The central prohibition: do not add emotion. Increase resolution around the emotionally consequential facts.**

Five procedures, each with its failure condition.

**1. Felt texture of a real failure. [A]** Convert an abstract failure state into the smallest concrete sequence of true operations that makes it mentally simulable. Find the exact point where the work stops, branches, repeats, or loses information; list only actions the facts support; replace category words such as `friction` or `manual work` with those operations; stop before adding an unevidenced consequence; let the reader supply the judgment.

Fictional facts for a school photography service: uploads must contain eight named columns; the import stops at the first missing column; the message reads `Schema invalid`; the message does not name the column; the documented recovery is to compare the file against the eight-column specification and upload again.

Inert:

> The importer validates uploads and reports invalid files.

Truthful and emotional:

> The upload stops at `Schema invalid`. It does not name the column. The recovery step is to compare your file against all eight required columns, fix the mismatch, and upload again.

Nothing says frustrating and nothing needs to. **Boundary:** this fails when the concrete detail is irrelevant or unsupported. `Another twenty minutes hunting for a typo` invents the duration, the waste, and the typo. `You know the sinking feeling` invents the feeling.

**2. Recognition through a precisely named situation. [B]** Name the exact state transition, timing condition, role conflict, or edge case that defines the problem. Do not name the reader's emotion. Perceived similarity and concrete representation both support this; the copy procedure itself has not been separately validated, which is why it is B and not A.

Fictional facts for a community sports club's booking system: a booking can be edited while its status is Draft; once submitted, ordinary members cannot change it; a club administrator can return a submitted booking to Draft; that must happen before the member can edit.

Flat:

> Submitted bookings require administrator intervention to edit.

Recognition-led:

> The booking stays editable until you submit it. Change one line afterwards and an administrator has to send it back to Draft before you can touch it.

**Boundary:** recognition collapses when the situation is generic, or when the writer adds a supposedly universal reaction. `When a request changes after approval` is a situation. `When a last-minute change ruins your afternoon` invents both the timing and the emotion.

**3. Relief through resolved ambiguity. [B]** Put the ambiguity immediately next to its verified resolution. The emotional work is the transition from unknown to known, not a relief adjective. Prefer actual closure to the word relief. **Boundary:** this fails when the resolution is incomplete, deferred beyond the promised scope, or replaced with reassuring language carrying no diagnostic information. It also fails when the copy invents an ambiguity the reader did not have.

**4. Agency through a reversible decision. [B]** State the reversible action, the point until which it stays available, and any real cost of reversal. `Nothing is sent until you press Submit. Until then you can edit or delete the draft` does more emotional work than `Stay in control`, because the control is observable rather than asserted. **Boundary:** reversibility must be operationally true. Do not write risk-free, no commitment, or cancel anytime where there are fees, notice periods, minimum terms, irreversible setup, or data consequences. Naming the exception is the rule, not an exception to it.

**5. Tension inside a real constraint. [B]** State the constraint, the event that activates it, and the choice available. A capacity limit, a dependency order, a compatibility boundary, or an irreversible state carries tension without any invented urgency. `Ten people can edit at once. An eleventh cannot enter edit mode until a seat is released` invents nothing; the limit carries it. **Boundary:** a constraint with no bearing on the reader's task is trivia, and a constraint whose severity or frequency is exaggerated is manipulation.

The drafting order is: what is known, what changes state, what a real person must do, what limit applies, what uncertainty the evidence can close, and what the reader can genuinely do, reverse, defer, or inspect. Then delete every sentence asserting a feeling, motive, frequency, consequence, urgency, prevalence, probability, or risk the evidence does not establish.

**Drafting test:** delete all emotion words from the passage. If it goes emotionally dead, the copy was leaning on emotional assertion instead of situation.

### Permission to write flat

**Rule [A]: a fact set can genuinely contain no emotionally consequential structure, and the correct output is then flat.** Emotional interventions are conditional, their effect sizes are small to moderate, many vary by domain, and several famous findings have failed direct replication ([affective and cognitive appeals](https://doi.org/10.1093/joc/jqae042), [narrative persuasion meta-analysis](https://doi.org/10.1080/03637751.2015.1128555), [vividness meta-analysis](https://doi.org/10.1080/15534510.2016.1157096)). Accurate, mechanically clear, and flat is not defective when the reader's problem is uncertainty rather than motivation.

Flatness is positively correct in four places:

- **Verification tasks.** When the reader's immediate job is to check exact behavior, compatibility, contractual scope, error semantics, measurement method, or a limitation, the documented fact is the whole value. `Requests are encrypted in transit. Customer-managed keys are not supported` needs no emotional upgrade.
- **Utility microcopy.** In validation, permissions, billing, security, destructive actions, and error recovery, emotional copy is wrong whenever it uses space the task information needs or invents the reader's state. `Oops, do not worry, we have got you` does not know that worry exists and does not identify the problem. `Upload failed. Column 6 contains an invalid date. Use YYYY-MM-DD and upload again` is correct because the job is diagnosis and recovery.
- **Post-purchase certainty.** Receipts, invoices, failed payments, security notices, and shipping exceptions exist to establish what happened, what was charged, what changed, and what happens next. A receipt does not need `Great choice, your team is going to love what comes next`, which invents both an evaluation and an outcome.
- **High-deliberation decisions. [B]** Do not sacrifice diagnostic information to create an emotional tone. Experimental advertising evidence shows no universal emotional advantage and identifies high-involvement and utilitarian contexts as the boundary. **Boundary:** high involvement does not mean emotion never works. Product-congruent emotion can still help, and incongruent emotion is what fails there.

There is no evidence that expert readers respond better to facts than to emotion as a general law, and this document does not assert one. Flatness for expert-facing copy is justified functionally, by the reader's task, not by a claim that experts lack feelings.

### Levers this document refuses

Each of the following circulates as craft law and does not enter as a rule. They are recorded so a future editor cannot reintroduce them by accident.

- People buy on emotion and justify with logic. No controlled source establishes the ordering.
- Emotional advertising outperforms rational advertising two to one. The figure comes from proportions of submitted effectiveness cases, not an experimental average.
- Stories are many times more memorable than facts. The often-quoted multiple has no traceable study behind it.
- Losses are twice as powerful as gains, applied to copy. The parameter came from fitting a risky-choice model, and message-framing results are commonly small, null, or in favour of gain framing. **Do not default to loss framing.** Where both framings are factually equivalent, test; otherwise use the one that describes the real decision.
- Open loops make information memorable. The interrupted-task memory advantage did not survive meta-analysis. Use real, closable information gaps instead, and treat an unpaid teaser as a broken promise rather than a measured trust cost.
- A named individual is more persuasive than statistics. The original effect was tiny and preregistered replications failed to reproduce the key demonstrations.
- Most purchase decisions are subconscious. The figure describes an estimate about cognition in general, not a measurement of purchases.

Two social-proof rules do enter, because both are evidenced and both are about avoiding harm:

**Rule [HOUSE]: use a descriptive norm only when the behavior, the reference group, the denominator, and the period are actually known.** **Boundary:** a descriptive norm can move behavior the wrong way. Telling people what the average is has increased the undesired behavior among those already below it.

**Rule [HOUSE]: never advertise the prevalence of an undesirable behavior in order to establish that the problem is common.** That normalizes the thing you are arguing against. **Boundary:** a credible approval signal can neutralize the reversal, but that signal must itself be evidenced. A fabricated badge, count, consensus, or waiting list is excluded by the truth rules regardless.

Both norm rules are graded HOUSE here rather than at the grade the underlying research carries. The norms meta-analyses and the field experiment that demonstrates the reversal are strong, and the project research recorded them without a retrievable citation, so this document applies them as house rules and does not assert them as findings. Restore the grade only when the sources are recorded under `Evidence maintenance`.

## Prosody and rhythm

### What rhythm control is for

The strongest surviving machine-writing tell is cadence rather than vocabulary. Human sentence-length distributions are more scattered; generated text has clustered more tightly in middle-length ranges across several model families in matched-domain comparison ([Munoz-Ortiz et al.](https://doi.org/10.1007/s10462-024-10903-2)).

**Rule [B]: treat low sentence-length variance as a diagnostic signal, not a verdict** ([Munoz-Ortiz et al.](https://doi.org/10.1007/s10462-024-10903-2))**. Boundary:** prompting, editing, genre constraints, and newer model generations can erase or reverse the difference, and some human genres are deliberately uniform. A uniform passage is a reason to look, never a finding.

**Rule [B]: do not assume generated syntax is shallower or less subordinate.** In controlled comparison, tested models sometimes used more subordinate and auxiliary structure than human writers ([Munoz-Ortiz et al.](https://doi.org/10.1007/s10462-024-10903-2)). **Boundary:** direction varies by domain and model, so it has to be measured locally rather than assumed.

**Rule [C]: vary sentence length deliberately when rhythm or emphasis requires it. The principle is purposeful contrast, not random variation** ([Provost](https://books.google.com/books/about/100_Ways_to_Improve_Your_Writing.html?id=4dqja0Qf3hQC)). **Boundary:** instructions, contracts, standardized technical material, and intentional rhetorical repetition are correct with much narrower distributions.

**Rule [C]: a short sentence after a long one is an emphasis device, not a mandatory pattern** ([Provost](https://books.google.com/books/about/100_Ways_to_Improve_Your_Writing.html?id=4dqja0Qf3hQC))**. Boundary:** alternating long and short mechanically produces a second detectable uniformity, and the device fails outright when the short sentence carries nothing worth emphasizing.

**Rule [B]: read a late draft aloud as a proofreading pass.** Reading aloud improved detection of both contextual and noncontextual errors against silent proofreading ([Cushing and Bodner](https://doi.org/10.1037/mac0000011)). Treat read-aloud friction as a reason to inspect, not a veto. **Boundary:** the evidence is for error detection, not for literary quality, argument quality, or cadence. Deliberate density, technical terminology, and legal language should not be flattened because they are awkward to perform aloud.

### The rhythm targets

Every value in the table below is a **governance default**: a control setting chosen so the system has something checkable to enforce instead of the instruction to sound less uniform. The research grades all of them as engineering heuristics with no controlled literature establishing universal values for good prose. None of them is a finding, none may be cited as one, and each is a review trigger rather than an error.

| Control | Default | Status | Reading |
|---|---|---|---|
| Sentence-length spread | For expository prose of at least 20 sentences, a standard deviation of 8 to 12 words with a coefficient of variation of 0.40 to 0.70 | Governance default | Below roughly 6 words of deviation at an 18 to 22 word mean, review for metronomic pacing. Above roughly 15, review for uncontrolled extremes. |
| Length tails | In a passage of 10 or more sentences, include at least one sentence of 8 words or fewer and one of 25 or more, but only where both are natural | Governance default | A forcing mechanism against middle-length clustering. Drop it wherever it produces a stunt sentence. |
| Consecutive similar lengths | Flag 3 consecutive sentences when every pair differs by 3 words or fewer | Governance default | Review for accidental monotony. Deliberate parallelism overrides the flag. |
| Paragraph variation | Over 8 or more paragraphs, aim for a coefficient of variation of at least 0.45 in words | Governance default | Prevents identical blocks without demanding arbitrary one-sentence paragraphs. |
| Opening structure | At most 2 consecutive sentences opening with the same class, such as subject-first declarative, initial subordinate clause, or imperative | Governance default | Catches repeated `Subject plus verb` starts that length statistics miss. Intentional parallelism overrides it. |
| Opening dominance | In a rolling 10-sentence window, flag any opening class occupying more than 60 percent | Governance default | Review trigger only. |
| Clause-count variation | No more than 4 consecutive sentences with the same finite-clause count, unless the passage is deliberately parallel | Governance default | Catches syntactic monotony that survives length variation. |

Where an authorized author profile exists, its measured corpus ranges replace every governance default above, because a measurement of that writer beats a default chosen for everyone. A writer whose corpus naturally runs wider than the spread row must not be normalized down into it, and a writer whose professional register is short briefing paragraphs must not be forced into long blocks.

**Boundary on the whole table:** these are controls for continuous prose. They do not apply to a button, a heading set, a table, a list, a caption, or a form label, and they are not evidence about how any reader responds.

### The conflict this document does not resolve

Two positions on cadence are in direct conflict, and neither side is strong enough to win.

**The research position** is deliberate variance, expressed in the spread targets above.

**The practitioner position** is uniform brevity. Experienced conversion copywriters advise short, choppy sentences, paragraphs of no more than two or three lines, and one-sentence paragraphs as the ideal, on scanned commercial surfaces.

The most likely resolution is register: a landing page read by a scanning cold visitor is a different problem from expository prose read continuously, and the practitioners are talking about the first. That is a hypothesis. It has not been tested, neither position is graded above the level of an engineering heuristic, and this document adopts neither as universal.

**What to do meanwhile:** apply the variance targets to continuous prose, apply the brevity preference to scanned commercial surfaces, and record which you applied if the choice is consequential. Do not report either as a finding, and do not resolve the conflict by quietly picking one.

## Open conflicts in this reference

Recorded so that neither side is lost. Do not close either by writing a rule.

| Conflict | Position A | Position B | Status |
|---|---|---|---|
| Question-form subheadings | Practitioners reject them outright: give the answer instead of asking. | A direct observation in this project found question headings reading better than abstract noun-stack statement headings on the same page. | Open. The untested hypothesis is that questions beat noun stacks and lose to concrete answers. Neither side is graded above an assertion. |
| Sentence cadence | Deliberate variance, per the targets above. | Uniform brevity on scanned commercial surfaces. | Open, probably register-dependent. Neither position is better than an engineering heuristic. |
