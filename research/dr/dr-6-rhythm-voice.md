# Craft Reference

## Prose rhythm, stylometry, and voice profiles

### Measurable features of prose rhythm and authorial style

Assumption: this reference treats English prose as the default, counts "words" as tokenizer-defined lexical tokens rather than whitespace strings, and requires the same tokenizer, sentence segmenter, parser, and normalization rules when a corpus is profiled and when new writing is checked. Stylometric measurements are implementation-dependent enough that changing the preprocessing pipeline can move the values.

Stylometry does not identify a single authorial fingerprint. Effective attribution systems combine many partially discriminative variables. Grieve's comparison of 39 textual measurements found no single measure sufficient for general attribution, and later authorship research likewise finds that lexical, character, punctuation, and syntactic features work best in combination. Topic and register are major confounders. [Grieve 2007](https://doi.org/10.1093/llc/fqm020) [Stamatatos 2017](https://aclanthology.org/E17-1107/)

| Feature | Operational computation | What it captures | Discriminative value and short-text reliability |
|---|---|---|---|
| **Sentence-length mean** | If sentence lengths in words are \(x_1...x_n\), compute \(\bar{x}=\sum x_i/n\). Also retain median. | Typical pacing and syntactic packing. | Authors differ, but mean alone is weak because genre, audience, and editing shift it. Grieve's broad comparison supports using it only in a multivariate profile. Under roughly 20 sentences, treat it as unstable. [Grieve 2007](https://doi.org/10.1093/llc/fqm020) |
| **Sentence-length variance and SD** | Sample variance \(s^2=\sum(x_i-\bar{x})^2/(n-1)\); SD \(s=\sqrt{s^2}\). Also compute coefficient of variation \(CV=s/\bar{x}\). | Rhythmic spread. This is the clearest quantitative check for "all the sentences are the same size." | More useful for rhythm than mean alone. Controlled human-vs-LLM comparisons find distributional spread discriminative, but no universal human SD exists. Reliability is poor with very few sentences and improves sharply once a piece contains several dozen. [Muñoz-Ortiz et al. 2024](https://doi.org/10.1007/s10462-024-10903-2) |
| **Sentence-length distribution shape** | Retain p10, p25, median, p75, p90, minimum, maximum, skewness, and optionally histogram bins such as 1-8, 9-15, 16-24, 25-34, 35+ words. | Whether variation comes from a normal spread, a long tail of complex sentences, or alternation between very short and long ones. | More informative than mean plus SD when authors use deliberately bimodal rhythms. Needs at least several dozen sentences for stable tails; p90 and skew are particularly noisy on short pieces. Human news in one controlled study had visibly more scattered distributions and longer tails than outputs from six tested LLMs. [Muñoz-Ortiz et al. 2024](https://doi.org/10.1007/s10462-024-10903-2) |
| **Finite-clause count** | Parse each sentence and count independent plus dependent finite clauses. Record clauses/sentence. | Syntactic density independent of raw sentence length. | Medium value alone, stronger with related syntactic measures. Short samples are parser-sensitive. Lu's syntactic-complexity work operationalizes related clause, T-unit, and subordination measures. [Lu 2010](https://doi.org/10.1075/ijcl.15.4.02lu) |
| **Subordination ratio** | Dependent clauses / all clauses, or dependent clauses / T-units. A T-unit is one independent clause plus its attached dependent material. Freeze one definition in the profile. | Preference for hypotaxis versus coordination or simple sequencing. | Useful, but genre-sensitive. Do not compare values produced by different parsers or definitions. LLM-vs-human evidence also shows that "machine prose has less subordination" is not generally true: in the controlled news comparison, several LLM outputs used more auxiliary structures and subordinate-clause patterns than human news. [Lu 2010](https://doi.org/10.1075/ijcl.15.4.02lu) [Muñoz-Ortiz et al. 2024](https://doi.org/10.1007/s10462-024-10903-2) |
| **Clause nesting depth** | Count nested finite-clause levels: depth 1 = main clause only; depth 2 = one subordinate clause; depth 3 = a clause embedded inside another subordinate clause. Also record mean and p90. | Cognitive and rhythmic complexity more directly than length. | Medium reliability after roughly 30 parsed sentences; poor on fragments, dialogue, lists, or transcript punctuation. Parser errors make exact values implementation-specific. |
| **Dependency-tree depth and dependency distance** | For each sentence, calculate maximum or mean root-to-token depth and mean head-dependent distance. | Structural embedding and how far related words are separated. | Discriminative in controlled comparisons but not interchangeable with clause depth. Muñoz-Ortiz et al. found human and LLM news differed in dependency structures and distances. [Muñoz-Ortiz et al. 2024](https://doi.org/10.1007/s10462-024-10903-2) |
| **Function-word frequencies** | Counts per 1,000 tokens for articles, prepositions, auxiliaries, conjunctions, pronouns, complementizers, particles, and other frequent grammatical words. Record both individual frequencies and selected adjacency or n-gram patterns. | Repeated grammatical preferences that are less tied to subject matter than content words. | Among the most established stylometric families and comparatively useful on shorter samples because tokens are frequent. They are not topic-free: register and grammatical context still move them. Function-word adjacency networks have produced strong attribution performance and contain information not duplicated by raw word frequency. [Segarra, Eisen, and Ribeiro 2015](https://arxiv.org/abs/1406.4469) citeturn17academia30 |
| **Punctuation habits** | Counts per 1,000 tokens or per sentence for commas, semicolons, colons, parentheses, dashes, ellipses, exclamation marks, quotation marks, and sentence-final marks; additionally compute punctuation-sequence frequencies. | Clause packaging, parenthetical habits, list construction, and visual rhythm. | Often discriminative as part of character-level stylometry. Medium reliability in short texts because commas are common; very low reliability for rare marks. Editors can overwrite it almost completely. Punctuation and pronouns appear among useful feature classes in attribution studies. [Sari, Stevenson, and Vlachos 2018](https://aclanthology.org/C18-1029/) |
| **Paragraph-length distribution** | Words/paragraph and sentences/paragraph: mean, median, SD, CV, p10, p90, one-sentence-paragraph share, and longest-paragraph share. | Macro-rhythm and information packaging. | Useful for voice synthesis but weaker as forensic identity evidence because editors, CMS conventions, mobile writing, and genre strongly alter paragraphing. Fewer than about 10 paragraphs produces poor distribution estimates. Desaire et al. found paragraph-level organization differentiated human scientific perspectives from ChatGPT outputs in their controlled domain. [Desaire et al. 2023](https://doi.org/10.1016/j.xcrp.2023.101426) |
| **Raw type-token ratio, TTR** | Unique word types \(V\) / total tokens \(N\). | Vocabulary reuse. | Strongly length-sensitive. It mechanically falls as texts get longer, so unequal-length comparisons can be misleading. [Covington and McFall 2010](https://doi.org/10.1080/09296171003643098) |
| **MATTR** | Compute TTR within a fixed moving window, commonly 50 or 100 tokens, then average windows. | Local lexical diversity with much less direct dependence on whole-document length. | Better than raw TTR for differently sized texts once texts exceed the chosen window. Results still depend on window size and tokenization. [Covington and McFall 2010](https://doi.org/10.1080/09296171003643098) |
| **MTLD** | Measure the average length of token sequences that maintain TTR above a threshold, conventionally near .72, in forward and reverse directions. | Rate at which lexical diversity decays as text grows. | Designed to reduce length sensitivity and performs better than raw TTR, but very short passages still provide too few factors for a stable value. [McCarthy and Jarvis 2010](https://doi.org/10.3758/BRM.42.2.381) |
| **Contraction rate** | Prefer eligible-context rate: contractions used / contexts where contracted and expanded forms were both grammatical. Also keep contractions per 1,000 tokens. | Informality and speech-like compression. | Useful within matched registers. Poor as a global author marker because channel, audience, publication editing, and legal/academic formality dominate it. Rare forms need thousands of words. |
| **Question rate** | Interrogative sentences / all sentences; optionally rhetorical-question rate after manual or classifier annotation. | Reader engagement and rhetorical stance. | Simple question-mark rate is robust to parsing but statistically unstable when questions are rare. Strongly genre-dependent. |
| **Exclamation rate** | Exclamation-final sentences / all sentences, plus marks per 1,000 tokens. | Expressivity. | Usually too sparse for short samples and vulnerable to platform norms. |
| **Person ratios** | First-, second-, and third-person pronouns per 1,000 words and as shares of all personal pronouns. Separate singular/plural where useful. | Self-reference, reader address, distance, and inclusiveness. | Medium frequency but heavily conditioned by genre and subject. Pronoun distributions can discriminate authors and human/LLM writing, but they should be register-specific rather than treated as immutable voice. [Muñoz-Ortiz et al. 2024](https://doi.org/10.1007/s10462-024-10903-2) |
| **Grammatical voice ratio** | Passive finite clauses / all finite clauses. Detect syntactic passives, not every form of "be." | Agent foregrounding and information structure. | Medium reliability in sufficient prose, but topic and genre dominate. Scientific methods and administrative writing can legitimately require much more passive voice than personal essays. |
| **POS distribution** | Counts per 1,000 tokens for nouns, verbs, adjectives, adverbs, pronouns, auxiliaries, determiners, conjunctions, etc.; optionally POS bigrams/trigrams. | Broad grammatical preferences. | Frequently discriminative and relatively topic-resistant compared with content words, though not topic-independent. Human and LLM distributions differ in controlled corpora. [Muñoz-Ortiz et al. 2024](https://doi.org/10.1007/s10462-024-10903-2) |
| **Character n-grams** | Frequencies of overlapping 3-5 character sequences, usually after controlled normalization. | Spelling, affixes, punctuation, whitespace, word fragments, and repeated function-word material simultaneously. | Often among the strongest authorship features, including on short texts, but they are opaque and can contain topic information. Cross-topic masking research exists precisely because superficially strong features can encode subject matter. [Stamatatos 2017](https://aclanthology.org/E17-1107/) |
| **Word n-grams and collocations** | Frequencies of common word sequences after removing rare topical sequences if the goal is voice rather than subject attribution. | Habitual phrase construction. | High discriminative power but high contamination risk from topic, quotations, institutional phrases, and direct copying. Record only common structural combinations in a reusable voice profile. [Stamatatos 2017](https://aclanthology.org/E17-1107/) |
| **Sentence-opening structure** | Classify first constituent as subject NP, adverbial, prepositional phrase, subordinate clause, coordinating conjunction, imperative verb, question word, quotation, fragment, etc. Track transition matrix between opening classes. | Perceived repetitiveness that sentence length alone misses. | Valuable for craft control. As a forensic feature it is less established than function words or n-grams, so treat profile estimates as descriptive unless the corpus is large. |
| **Coordination profile** | Coordinating conjunctions, coordinated clauses, serial lists, and asyndetic sequences per sentence or 1,000 tokens. | Loose versus accumulated sentence movement. | Medium and register-sensitive. |
| **Discourse-marker profile** | Frequencies of items such as "but," "so," "however," "instead," "for example," "in fact," and "because," ideally normalized by eligible construction. | Argument flow and preferred transitions. | Common markers can be stable; rare named phrases are not. Topic and editorial norms matter. |
| **Modal and hedge profile** | may/might/could, perhaps, likely, apparently, "I think," "the evidence suggests," and confidence verbs per 1,000 tokens. | Calibration of uncertainty and epistemic stance. | Important for perceived voice, but often document-purpose dependent. Stable only when measured across comparable claim types and registers. |
| **Imperative rate** | Imperative clauses / finite clauses. | Directness and instruction style. | Useful in instructional writing; almost meaningless when the corpus mixes tutorials with essays. |
| **Readability indices** | For example, Flesch Reading Ease combines words/sentence and syllables/word. | Approximate processing difficulty associated with surface length variables. | Useful as a coarse audience diagnostic, weak as an author signature because formulas collapse several causes into one score. Fixed cutoffs should not be treated as cadence targets. Research on sentence-length perception and readability does not establish a universal optimum sentence length. [Matthews et al. 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC9955962/) |

**Rule [A]. Do not compare raw TTR across substantially unequal text lengths.** Use MATTR or MTLD, or equal-length subsamples, because raw TTR has a documented mathematical and empirical dependence on sample length across lexical-diversity research. **Boundary:** when all samples are truncated to exactly the same sufficiently large token count, raw TTR becomes more interpretable, although sampling noise remains. [Covington and McFall 2010](https://doi.org/10.1080/09296171003643098) [McCarthy and Jarvis 2010](https://doi.org/10.3758/BRM.42.2.381)

**Rule [B]. Store distributions, not only averages.** For sentence and paragraph length, record at least median, SD, p10, p90, and the full binned distribution in addition to the mean. Controlled human-vs-LLM work demonstrates that distributional spread can separate texts even when central tendencies overlap. **Boundary:** percentiles and shape statistics become unstable when there are only a few observations, especially below roughly 20 sentences or 10 paragraphs. [Muñoz-Ortiz et al. 2024](https://doi.org/10.1007/s10462-024-10903-2)

**Rule [B]. Treat function words, character patterns, punctuation, and syntactic distributions as a bundle rather than declaring any one a "voice fingerprint."** Attribution studies repeatedly succeed by combining feature families, while cross-topic experiments show that apparently stylistic signals can also encode topic and genre. **Boundary:** a constrained genre with abundant training data can make one feature family highly predictive without making it a universal authorial invariant. [Grieve 2007](https://doi.org/10.1093/llc/fqm020) [Stamatatos 2017](https://aclanthology.org/E17-1107/)

### Machine-generated prose as a statistical class

There is now controlled evidence for statistical differences between human and model-generated prose, but there is no timeless list of "AI tells." The direction and size of an effect depend on model family, decoding settings, prompt, domain, training date, post-editing, and the model used to compute any probability-based statistic. Research from 2023 on GPT-3.5-era output is evidence about that generation regime, not a permanent property of generative models. Recent work continues to find detectable differences while also showing that they are generator-dependent.

**Sentence-length variation.** Muñoz-Ortiz, Gómez-Rodríguez, and Vilares compared human English news against output from six LLMs spanning several model families. Human sentence-length distributions were more scattered, whereas LLM sentences were more concentrated in middle-length ranges; their distributional tests found significant differences between human text and each tested model. This is direct support for the "uniform sentence length" complaint in that domain. It is not a universal numerical threshold. [Primary paper](https://doi.org/10.1007/s10462-024-10903-2)

**Structural uniformity.** Desaire and colleagues used 64 human-written scientific perspective articles and 128 ChatGPT-generated documents in a tightly controlled scientific domain. Human writing showed differences in paragraph organization, sentence behavior, punctuation, and vocabulary that supported classification above 99 percent in that matched setting. That figure demonstrates separability of the experiment's corpora, not a 99 percent general AI detector. [Desaire et al. 2023](https://doi.org/10.1016/j.xcrp.2023.101426)

A much larger 2026 stylometric essay study used 4,346 paired human/ChatGPT essays over 110 subject areas. On full texts, Burrows's Delta reached 97.98 percent accuracy, random forests 99.93 percent, and SVMs 99.26 percent in that experiment. When texts were shortened to 200 words, Delta still achieved 90.59 percent, but random-forest accuracy fell to 50.69 percent, showing that "stylometry works on short texts" depends heavily on method and feature representation. [Chen 2026](https://doi.org/10.1093/llc/fqag064)

Przystalski and colleagues tested ten-sentence samples covering human Wikipedia and outputs from GPT-3.5, GPT-4, LLaMA families, Orca, and Falcon, including rephrased and summarized variants. Their stylometric classifiers reached multiclass Matthews correlation coefficients up to .87 and binary accuracies from .79 to 1.0; a balanced Wikipedia-versus-GPT-4 comparison reached .98. SHAP analysis implicated grammatical standardization as well as content- and model-specific signals. Again, these are benchmark results, not a portable detector threshold. [Przystalski et al.](https://arxiv.org/abs/2507.00838)turn17academia27

**Perplexity.** The phrase "flatter perplexity" is imprecise. Perplexity is normally computed from token probabilities, and a document can have a mean, distribution, or variation in chunk-level perplexity. Some studies find machine text has **lower and more concentrated** perplexity under a reference model, meaning greater predictability, not necessarily a "flatter" distribution. A 2025 comparison reported lower machine-text perplexity with a sharper peak than human text. Probability-based detection is also evaluator-dependent: DetectGPT did not simply threshold perplexity but used curvature of a source model's log-probability surface, raising AUROC on one GPT-NeoX fake-news experiment from .81 for its strongest zero-shot baseline to .95. [Ardeshirifar et al. 2025](https://link.springer.com/article/10.1007/s43681-025-00699-4) [DetectGPT](https://arxiv.org/abs/2301.11305)

**Function words and grammatical distributions.** Differences are documented, but there is no invariant list of "AI function words." Muñoz-Ortiz et al. found systematic POS and grammatical differences, including more pronouns, auxiliaries, symbols, and numbers in the tested LLM news, while human news used more nouns, adjectives, and punctuation in several comparisons. Zaitsu's stylometric experiments likewise found function-word unigrams, POS patterns, and phrase patterns useful for AI authorship discrimination. The direction of individual features is domain- and model-dependent. [Muñoz-Ortiz et al. 2024](https://doi.org/10.1007/s10462-024-10903-2) [Zaitsu 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12558491/)

**Rule [B]. Use lower sentence-length variance as a diagnostic signal, not as an AI verdict.** Controlled matched-domain work supports a human/LLM difference in several model families. **Boundary:** model prompting, temperature, deliberate editing, genre constraints, and later model generations can erase or reverse the difference; some human genres are intentionally uniform. [Muñoz-Ortiz et al. 2024](https://doi.org/10.1007/s10462-024-10903-2)

**Rule [B]. Do not assume AI syntax is necessarily shallower or less subordinate.** In controlled news comparisons, tested models sometimes used more subordinate and auxiliary structures than human writers. **Boundary:** other domains, models, and prompts can produce simpler syntax, so direction must be measured locally. [Muñoz-Ortiz et al. 2024](https://doi.org/10.1007/s10462-024-10903-2)

**Rule [A]. Never treat an AI-detector score as sole evidence of authorship or misconduct.** Independent evaluations show substantial domain fragility, vulnerability to obfuscation, and demographic bias. Weber-Wulff et al. tested 12 public tools plus two commercial systems and concluded that the available tools were not sufficiently accurate or reliable for that purpose; obfuscation worsened performance. Liang et al. found seven detectors systematically misclassified non-native English writing, with an average false-positive rate reported at about 61 percent for their TOEFL essay set, while native comparison writing was classified far more accurately. **Boundary:** a detector can still be useful as one investigative signal on data closely matched to its training and validation regime; matched-domain research classifiers can achieve very high benchmark accuracy. [Weber-Wulff et al. 2023](https://arxiv.org/abs/2306.15666) [Liang et al. 2023](https://www.sciencedirect.com/science/article/pii/S2666389923001307)

### Rhythm as craft and operational control

Craft tradition correctly recognizes that rhythm is more than word choice, but most prescriptions about "musical prose" have not been tested as controlled writing interventions. Separate mechanisms with experimental support from useful craft heuristics.

**Rule [B]. Read a late draft aloud as a proofreading pass.** In two experiments, Cushing and Bodner found that reading aloud improved detection of both contextual and noncontextual proofreading errors compared with silent proofreading. Use it to expose missing words, duplicated words, awkward local sequences, punctuation problems, and places where the intended phrasing is difficult to articulate. **Boundary:** the experiments establish an error-detection advantage, not proof that read-aloud revision improves literary quality, factual correctness, argument quality, or every aspect of rhythm. [Cushing and Bodner 2022](https://doi.org/10.1037/mac0000011)

There is also experimental support for phonological and prosodic processing during silent reading. Ashby and Clifton found lexical stress affected fixations and reading time in silent sentence reading. Beck and Konieczny found that metrical and rhyme anomalies in silently read poetry disrupted eye movements and induced rereading, supporting rhythmic subvocalization in that highly rhythmic material. A later bilingual eye-tracking corpus study likewise found stressed syllables attracted disproportionate dwell time. This evidence supports the proposition that written rhythm is not exclusively an audible-reading phenomenon, but it does not establish an optimal prose cadence. [Ashby and Clifton 2005](https://doi.org/10.1016/j.cognition.2004.12.006) [Beck and Konieczny 2021](https://doi.org/10.16910/jemr.13.3.5)

**Rule [B]. Use read-aloud friction as a diagnostic, not a veto.** Repeated involuntary pauses, lost syntactic bearings, accidental tongue-twisters, and unintended repetitions justify inspection because phonological structure affects reading and oral proofreading catches additional errors. **Boundary:** deliberate density, technical terminology, legal language, poetry, and written constructions that are clearer on the page than in spontaneous speech should not be flattened merely because they are difficult to perform aloud. [Cushing and Bodner 2022](https://doi.org/10.1037/mac0000011) [Ashby and Clifton 2005](https://doi.org/10.1016/j.cognition.2004.12.006)

**Rule [C]. Vary sentence length deliberately when rhythm or emphasis requires it.** Gary Provost's 1985 *100 Ways to Improve Your Writing* explicitly gives "Vary Sentence Length," "Vary Sentence Construction," "Listen to What You Write," and "Put Emphatic Words at the End" as separate craft tools. The useful principle is purposeful contrast, not random variation. **Boundary:** instructions, contracts, children's prose, highly standardized technical material, and intentional rhetorical repetition can benefit from much narrower distributions. [Provost 1985](https://books.google.com/books/about/100_Ways_to_Improve_Your_Writing.html?id=4dqja0Qf3hQC)

**Rule [C]. A short sentence after a long or heavily subordinate sentence is an emphasis device, not a mandatory pattern.** Craft practitioners use the contrast to reset processing and create a hard cadence. **Boundary:** repeating long-short-long-short mechanically creates another detectable uniformity; the device fails when the short sentence contains no information worthy of emphasis. [Provost 1985](https://books.google.com/books/about/100_Ways_to_Improve_Your_Writing.html?id=4dqja0Qf3hQC)

**Rule [C]. Choose periodic versus loose structure according to where the sentence should resolve.** A periodic sentence delays its syntactic or semantic completion, making the end carry resolution; a loose or cumulative sentence states the grammatical core earlier and adds qualifying or elaborating material afterward. Use the first for suspense, qualification, or culmination and the second for directness plus accretion. **Boundary:** deeply periodic syntax becomes hard to parse when the reader must retain too many unresolved dependencies; exclusively loose syntax can become additive and shapeless. Historical rhetoric and modern craft treat the contrast as a usable structural distinction, not as an empirically established quality hierarchy.

**Rule [C]. Reserve sentence and paragraph endings for information that deserves terminal emphasis when the syntax permits it.** Provost explicitly recommends placing emphatic material at the end, and contemporary craft writers make the same cadence argument. **Boundary:** forcing important material to the end can separate a subject from necessary context, violate chronological or logical order, or make technical instructions harder to scan. [Provost 1985](https://books.google.com/books/about/100_Ways_to_Improve_Your_Writing.html?id=4dqja0Qf3hQC)

The following generic targets are deliberately **D-grade engineering heuristics**. No controlled literature establishes universal values for good prose. They exist because a writing system needs checkable control settings rather than the instruction "sound less uniform."

| Control | Default operational target | Grade | Interpretation |
|---|---|---:|---|
| **Sentence-length SD** | For general expository prose of at least 20 sentences: **8-12 words SD**, with **CV 0.40-0.70**. If an authorized author's profile exists, replace this with the author's corpus range. | D | Below about 6 words SD at an 18-22 word mean is a review trigger for metronomic pacing, not an error. Above about 14-15 words is a review trigger for uncontrolled extremes. |
| **Sentence-length tails** | In a passage of 10 or more sentences, include at least **one sentence of 8 words or fewer** and **one of 25 words or more** only when both are semantically natural. | D | A forcing mechanism against middle-length clustering. Delete the requirement where it produces stunt sentences. |
| **Consecutive similar lengths** | Flag **3 consecutive sentences** when every pair differs by no more than **3 words**. | D | Review for accidental monotony. Parallelism can override the flag. |
| **Paragraph-length variation** | Over 8 or more paragraphs, target **paragraph-length CV >= 0.45** in words. Do not allow more than **50% of paragraphs** to have the same sentence count or adjacent counts unless the form requires it. | D | Prevents identical paragraph blocks without requiring arbitrary one-sentence paragraphs. |
| **Paragraph shape** | Across a normal article, include at least **three paragraph-shape classes** where available: 1-2 sentences, 3-4 sentences, and 5+ sentences. No class is mandatory in short documents. | D | A diversity check, not a readability rule. |
| **Opening structure** | Permit at most **2 consecutive sentences** with the same opening class, such as subject-first declarative, initial subordinate clause, initial prepositional phrase, question, or imperative, unless the repetition is intentional parallelism. | D | Directly addresses repeated "Subject + verb..." starts that length statistics miss. |
| **Opening dominance** | In any rolling 10-sentence window, flag one opening class if it occupies **more than 60%** of sentences. | D | Review trigger only. |
| **Finite-clause depth** | Generic expository target: **35-60% depth 1**, **30-50% depth 2**, **5-20% depth 3+**. Flag depth 4+ for manual review rather than automatically simplifying it. | D | Creates a controlled mixture of simple, subordinate, and deeply embedded sentences. |
| **Clause-count variation** | No more than **4 consecutive sentences** should have the same finite-clause count unless a parallel passage is intentional. | D | Prevents syntactic metronomy that survives sentence-length variation. |
| **Cadential contrast** | After a sentence above the local p90 for length or clause depth, prefer the next two sentences to contain at least one sentence below the local median when meaning allows. | D | Operationalizes the long-to-short reset without requiring a one-sentence punchline. |

For profile-driven synthesis, corpus-relative values should override these generic defaults. A writer whose authorized corpus naturally has sentence-length SD 15 should not be normalized to 10, and a writer whose professional register consists of short briefing paragraphs should not be forced into six-sentence blocks.

The production rule **"a self-contained passage that survives being quoted alone is two or three sentences" is D and should be rejected as a general rule.** Passage-retrieval research does not establish a universal two- or three-sentence unit. In Tellex et al.'s TREC question-answering experiments, one passage algorithm performed best with a three-sentence passage, while another was best at six sentences under their implementation. More recent retrieval work has found benefits from proposition-level, semantically atomic units rather than fixed sentence windows. These tasks concern retrieval, not human comprehension of quotations, so neither result validates a universal writing rule. [Tellex et al. 2003](https://groups.csail.mit.edu/infolab/publications/Tellex-etal-SIGIR03.pdf) [Dense X Retrieval](https://arxiv.org/abs/2312.06648) citeturn9academia36

**Replacement rule [D].** Define a self-contained quotation semantically, not numerically. It passes when it names or unmistakably identifies its subject, contains the claim and material qualifier, has no unresolved "this/that/they/it/former/latter" reference whose antecedent lies outside the passage, and does not depend on an omitted exception. One sentence can pass. Six can pass. Sentence count is metadata, not the criterion.

### Voice, style, tone, and extraction from a corpus

Assumption: for this writing system, **register** is operationalized mainly as the formality axis requested here, while linguistic register theory uses the term more broadly for situation-conditioned variation involving channel, purpose, audience, and activity. Grieve's register-based account of stylometry is especially important: what attribution systems call authorial style partly reflects authors making subtly different register choices. [Grieve 2023](https://doi.org/10.1515/cllt-2022-0040)

| Concept | Operational definition | Persistence |
|---|---|---|
| **Style** | The full set of observable linguistic choices in a document: lexical, syntactic, rhetorical, typographic, structural, and discourse-level. It includes both stable and situational properties. | Umbrella category, not itself a persistent setting. |
| **Voice** | The subset of an author's stylistic tendencies that remains sufficiently stable across topics, documents, and relevant registers after genre and editorial effects are accounted for. | Persistent profile. |
| **Tone** | Document-specific attitude and affect toward subject, reader, and occasion: warm, severe, skeptical, celebratory, conciliatory, dry, urgent, etc. | Re-decide per document. |
| **Register** | In this system, degree and mode of formality, with channel-specific variants such as formal article, professional email, informal post, or spoken transcript. | Re-decide per document, then apply an authorized register override from the profile. |

**Rule [B]. Separate stable author effects from topic and register before calling a feature "voice."** Cross-topic stylometry demonstrates that topic-specific information can contaminate authorship features, while register research shows that situation-conditioned variation is central to what stylometry measures. **Boundary:** a writer who only ever writes in one narrow genre may not supply enough variation to distinguish personal voice from that genre; the profile must then be labeled genre-bound. [Stamatatos 2017](https://aclanthology.org/E17-1107/) [Grieve 2023](https://doi.org/10.1515/cllt-2022-0040)

The single most load-bearing corpus rule is:

**Rule [C]. Use 10,000 clean author-controlled words as the production minimum for a persistent voice profile.** "Clean" means the author's own prose after quoted material, copied boilerplate, signatures, templates, externally supplied headlines, and other non-authorial text have been removed. Luyckx and Daelemans document more than 10,000 words per author as the traditional "reliable minimum" for an authorial set in stylometric research. **Boundary:** the 10,000-word convention comes from authorship-attribution research, not a controlled study of generative voice synthesis. Ten thousand contaminated, single-register, heavily edited, or formulaic words can still be unusable. [Luyckx and Daelemans 2008](https://aclanthology.org/C08-1065/)

**Rule [B]. Do not certify a general stylometric profile from fewer than 5,000 clean words.** Eder's controlled sample-size experiments found minimum stable sample sizes ranging from about 2,500 words for Latin prose to around 5,000 words for most tested modern-language novel corpora, including English; samples below the stable region produced much greater attribution noise. **Boundary:** those results concern Delta-style attribution on literary corpora. Some constrained short-text classifiers can perform well below 5,000 words, while a heterogeneous real-world voice profile may require substantially more. [Eder 2015](https://doi.org/10.1093/llc/fqt066)

**Preferred production tier [D]: 20,000-30,000 clean words.** This is an engineering target, not an empirically established threshold. It supplies enough material to estimate tails, rare punctuation, paragraph distributions, and multiple registers without making a single document dominate the profile.

**Document-diversity rule [D].** Require at least **10 independently composed documents** for a persistent profile, with no single document supplying more than **25%** of the clean tokens. A 20,000-word article is not equivalent to twenty independent 1,000-word samples for measuring cross-document stability.

A defensible extraction pipeline is:

| Stage | Required procedure | Grade and basis |
|---|---|---|
| **Provenance** | Record file, date, genre, channel, intended audience, publication status, known editor, and whether the text is draft, final, transcript, or collaboratively written. | D engineering rule. |
| **Authorship cleaning** | Remove quotations, forwarded email, copied source text, boilerplate, template language, legal disclaimers not written by the author, automatic signatures, and house-written headlines. Preserve the author's spelling, punctuation, contractions, paragraph breaks, and capitalization unless those are known to have been edited. | D engineering rule. |
| **Register stratification** | Separate article, email, post, speech transcript, formal memo, and other materially different modes before computing global values. | **B.** Register and topic materially affect stylometry. **Boundary:** tiny strata cannot support separate estimates. [Grieve 2023](https://doi.org/10.1515/cllt-2022-0040) |
| **Transcript handling** | Keep spoken transcripts in a separate stratum. Do not attribute punctuation or paragraphing to the speaker unless the transcript preserves speaker-supplied written punctuation. | **B.** Transcript normalization and formatting materially affect stylometric attribution. **Boundary:** normalized transcripts also erase some genuine surface habits, so speaker-level lexical and grammatical measures remain more useful than punctuation measures. [Aggazzotti and Smith 2025](https://arxiv.org/abs/2512.13667) citeturn17academia31 |
| **Topic control** | For high-stakes profiling, mask or down-weight proper nouns, rare content words, quotations, and obviously topic-bound n-grams when estimating stable voice. | **B.** Text-distortion experiments improved cross-topic attribution by suppressing topic-specific material. **Boundary:** aggressive masking can also remove genuine lexical preferences and is unnecessary when the profile is intentionally topic-specific. [Stamatatos 2017](https://aclanthology.org/E17-1107/) |
| **Feature extraction** | Compute the feature inventory above independently by document and by register before pooling. | D engineering rule. |
| **Stability testing** | Use document-level distributions, leave-one-document-out estimates, and bootstrap intervals. Do not infer stability from one corpus-wide aggregate. | D engineering rule. |
| **Profile selection** | Keep global features only when they remain directionally and numerically stable across the relevant strata; move register-sensitive features into register overrides. | D engineering rule. |

**Mixed-register rule [D].** A register earns its own numerical subprofile only when it contains at least **2,500 clean words across at least 3 independent documents**. Below that level, record qualitative observations and label the numerical estimate provisional.

**Stability rule [D].** A candidate global feature fails persistence if either condition holds: register accounts for more than **30% of its observed document-level variance**, or deleting one document changes its pooled estimate by more than **20%**. Such a feature belongs in a register override or is excluded.

**Heterogeneity stop rule [D].** Mark the corpus "not profileable as one voice" when more than one-third of the proposed core features fail the preceding stability rule, when collaborative or editorial authorship cannot be separated, or when the clean corpus falls below 5,000 words after exclusions.

Separating the author from editors and house style requires source comparison rather than intuition.

**Paired-edit rule [D].** Where drafts and published versions exist, compute feature deltas between draft and final. Any feature repeatedly changed by editors should be labeled "editor-sensitive" and excluded from persistent voice unless the author explicitly adopts the edited convention.

**House-style rule [D].** When only published work exists, obtain comparison pieces from other writers at the same publication where lawful and practical. Features shared broadly by the outlet, such as headline capitalization, paragraph length, serial-comma policy, citation format, or contraction bans, should be marked "house-style confounded."

**Genre rule [B].** Do not assume excellent in-domain attribution proves cross-genre voice stability. Cross-topic and cross-domain authorship research shows substantial degradation when training and test contexts diverge, and masking topic-dependent information can improve robustness. **Boundary:** a profile intended only for one fixed genre does not need to generalize beyond that genre. [Stamatatos 2017](https://aclanthology.org/E17-1107/)

The most defensible persistent features are frequent grammatical distributions that survive stratification: common function words, broad POS ratios, recurring punctuation tendencies that are demonstrably author-controlled, contraction preference within matched eligible contexts, sentence-length distribution shape, common coordination/subordination patterns, and stable ways of qualifying claims. Character n-grams can be statistically powerful but are better retained as verification features than exposed as human-readable voice instructions. Rare words, named entities, isolated jokes, one-off metaphors, rare punctuation, topic vocabulary, readability score alone, and a single document's paragraph shape should not be promoted to stable voice without cross-document evidence. citeturn17academia30

### Reusable voice-profile encoding

**Schema rule [D].** Store a voice profile as human-readable YAML plus a short Markdown evidence section. Separate measurement, interpretation, document-specific controls, and source excerpts. Never collapse them into an unqualified paragraph such as "Write exactly like Mara."

A profile for the fictional writer Mara Venn can take this form:

```yaml
voice_profile:
  schema_version: "1.0"

  identity:
    profile_name: "Mara Venn"
    status: "fictional example"
    authorization: "owner-authorized"
    profile_scope: "professional explanatory prose"

  corpus:
    clean_words: 18420
    documents: 14
    date_range: "2024-01 to 2026-06"
    registers:
      articles:
        words: 10500
        documents: 6
      professional_email:
        words: 4920
        documents: 5
      posts:
        words: 3000
        documents: 3
    exclusions:
      - quotations
      - editor-written headlines
      - boilerplate
      - signatures
    preprocessing:
      tokenizer: "frozen implementation/version"
      sentence_segmenter: "frozen implementation/version"
      parser: "frozen implementation/version"

  confidence:
    overall: "production"
    limitations:
      - "Published article punctuation may contain copy-editing."
      - "Email sample covers only professional recipients."

  stable_metrics:
    sentence_words:
      mean: 18.7
      median: 16
      sd: 10.1
      cv: 0.54
      p10: 7
      p90: 33
    finite_clauses_per_sentence:
      mean: 1.72
      p90: 3
    clause_depth:
      depth_1_share: 0.46
      depth_2_share: 0.41
      depth_3_plus_share: 0.13
    paragraph_words:
      median: 78
      sd: 49
    questions_per_100_sentences: 4.2
    first_person_per_1000_words: 7.8
    second_person_per_1000_words: 3.1
    passive_clause_share: 0.09
    mattr_window_50: 0.79
    mtld: 91.4

  punctuation:
    comma_per_1000_words: 42
    semicolon_per_1000_words: 1.1
    colon_per_1000_words: 3.8
    parentheses_per_1000_words: 2.4
    exclamation_per_1000_words: 0.2
    habits:
      - "Uses colons for specification more often than semicolons."
      - "Rarely uses exclamation marks."
      - "Parentheses usually contain qualification, not jokes."

  rhythm:
    observed:
      - "Alternates compact claims with longer explanatory sentences."
      - "Long sentences usually contain one main qualification, not multiple nested digressions."
      - "One-sentence paragraphs occur sparingly after analytical buildup."
    generation_targets:
      sentence_sd_tolerance: "profile SD +/- 20%"
      median_sentence_tolerance: "+/- 3 words"
      clause_depth_distribution_tolerance: "+/- 10 percentage points"
      consecutive_same_opening_max: 2

  structural_moves:
    openings:
      common:
        - "Direct claim followed by qualification."
        - "Concrete observation followed by generalization."
      uncommon:
        - "Rhetorical question."
        - "Scene-setting anecdote."
    development:
      - "States claim before supplying examples."
      - "Uses contrast to narrow overbroad claims."
      - "Moves from concrete case to general rule."
    closings:
      common:
        - "Ends on implication or operational consequence."
      uncommon:
        - "Inspirational uplift."
        - "Summary that merely repeats the introduction."

  vocabulary:
    preferred:
      - term: "evidence"
        contexts: "empirical claims"
        corpus_count: 31
      - term: "constraint"
        contexts: "design and policy"
        corpus_count: 18
    reliably_avoided:
      - term: "game-changer"
        evidence: "explicit author preference"
      - term: "revolutionary"
        evidence: "explicit author preference"
    note: "Corpus absence alone is not treated as proof of avoidance."

  stance:
    directness:
      baseline_0_to_4: 3
      description: "States conclusions directly, then qualifies where needed."
    humor:
      baseline_0_to_4: 1
      description: "Occasional dry aside; no extended jokes."
    warmth:
      baseline_0_to_4: 2
    certainty:
      description: "Distinguishes fact, inference, and judgment."

  uncertainty:
    preferred_moves:
      - "Names the missing evidence."
      - "Uses probability language when uncertainty is quantitative."
      - "States the strongest conclusion the evidence supports."
    avoid:
      - "Stacked generic hedges."
      - "False certainty."

  disagreement:
    preferred_moves:
      - "State the disputed claim accurately."
      - "Identify the evidence or reasoning that fails."
      - "Avoid claims about another person's motives without evidence."
    intensity:
      baseline_0_to_4: 3

  register_overrides:
    professional_email:
      contractions: "more frequent than article baseline"
      paragraphs: "shorter"
      directness_delta: +1
    articles:
      contractions: "baseline"
      qualification: "more explicit"
    posts:
      sentence_length: "slightly shorter"
      first_person: "higher"

  content_firewall:
    profile_is_not_a_fact_source: true
    profile_is_not_an_opinion_source: true
    claims_must_come_from:
      - "current brief"
      - "approved factual sources"
      - "explicit author position supplied for this document"

  anti_mimicry:
    do_not_reuse_source_sentences: true
    exact_overlap_review_tokens: 8
    distinctive_phrase_review: true
    representative_excerpts_are_for_calibration_only: true

  verification:
    core_features:
      - sentence_words
      - sentence_length_sd
      - clause_depth
      - function_word_profile
      - punctuation
      - paragraph_words
      - contraction_rate
      - person_ratios
    tolerances:
      median_absolute_document_z: "<= 0.75"
      individual_core_feature_warning: "|z| > 1.5"
      maximum_warning_share: "20%"

  representative_excerpts:
    - register: "article"
      corpus_position: "early"
      excerpt: >
        The obvious explanation is not always the useful one. A pattern can
        be real and still tell us very little about its cause. The next step
        is to ask which competing explanations would produce the same result.
    - register: "professional_email"
      corpus_position: "middle"
      excerpt: >
        I agree with the deadline. I do not agree that the current draft is
        ready for approval. Two claims still need sources, and the table uses
        a definition that changed between versions.
    - register: "post"
      corpus_position: "late"
      excerpt: >
        A good shortcut removes work without removing information. This one
        removes both. That is why the output looks clean and still fails the
        basic check.
```

All names, values, and excerpts above are fictional.

**Representative-excerpt rule [D].** Select **3-6 excerpts** by stratified sampling across register, date, and document type rather than choosing the author's most polished passages. A profile should encode the author's central tendency and controlled variation, not an anthology of exceptional performances.

**Excerpt-length rule [D].** Keep each calibration excerpt around **50-120 words**. That is enough to demonstrate local movement without turning the profile into a reservoir of source text for phrase retrieval.

**Vocabulary-avoidance rule [D].** Never infer "the author avoids X" merely because X is absent from 10,000 words. Record an avoidance only when the author states the preference or when repeated eligible contexts show a stable alternative. Absence is weak evidence for rare lexical choices.

**Measurement-provenance rule [D].** Every numeric feature must carry corpus size, register coverage, date range, preprocessing version, and uncertainty or confidence status. A naked value such as "average sentence length: 18.7" is not reusable evidence.

### Applying a profile without mimicry and verifying adherence

Voice synthesis needs a strict separation between **content authority** and **style authority**.

**Content-firewall rule [D].** The voice profile can authorize *how* a proposition is expressed. It cannot authorize the proposition itself. Facts, quotations, numbers, legal conclusions, policy positions, preferences, endorsements, and personal opinions must come from the current assignment, approved sources, or an explicitly supplied position of the author.

For fictional Mara Venn, a profile entry saying that she "states conclusions directly" permits:

> The pilot missed its retention target.

It does not permit the system to invent:

> I oppose the acquisition.

unless the author or current brief supplies that position.

**Stable-habit rule [D].** Transfer distributions and habits: sentence-length spread, clause packaging, level of directness, contraction preference, punctuation frequency, preferred argument order, uncertainty behavior, and typical opening classes. Do not transfer distinctive metaphors, slogans, signature phrases, anecdotes, factual examples, or repeated source sentences.

**Abstraction rule [D].** Convert a source observation into a category before generation. "The author begins 7 of 14 articles with a concrete contradiction" is usable. "Begin with the exact wording of the author's favorite contradiction" is not.

**Source-removal rule [D].** Where the system architecture permits it, derive the compact profile first and generate primarily from that profile rather than repeatedly injecting the full source corpus into the generation context. Retain excerpts for calibration and verification, not sentence completion.

**Phrase-overlap rule [D].** Post-generation, flag every exact overlap of **8 or more consecutive lexical tokens** with the source corpus, excluding demonstrably generic strings. Also flag shorter phrases that are unusual, slogan-like, or repeatedly associated with the author. The eight-token trigger is an engineering review threshold, not a copyright safe harbor. Copyright law supplies no universal "N words are safe" rule.

**Paraphrase rule [D].** A sentence that preserves the source sentence's distinctive sequence of images, examples, and syntactic turns can still be too close even after synonyms are substituted. Review semantic and structural overlap, not only exact n-grams.

**Opinion rule [D].** When the profile contains representative excerpts expressing positions, treat those positions as evidence only about the excerpted historical document, not as permission to attribute the same view to a new situation.

**Conflict rule [D]. Factual accuracy, legal obligations, safety requirements, required disclosures, quotations, and source fidelity always override the voice profile.** The correct result in the wrong cadence is preferable to an elegant falsehood. A voice profile is never authority to weaken a qualification required by law or evidence.

Verification should distinguish three different questions: "Does the piece match the measured profile?", "Does it avoid copying the corpus?", and "Does the named author actually endorse this piece?" Stylometry can address only the first, anti-overlap checks part of the second, and only the person can answer the third.

**Rule [B]. Do not make a strong stylometric match claim on a new piece below about 5,000 words merely because its feature vector is close to the profile.** Eder's controlled experiments show that attribution estimates can be unstable below corpus-dependent sample-length thresholds around 2,500-5,000 words. **Boundary:** a short piece can still be checked for obvious local deviations such as punctuation, sentence openings, contractions, and cadence; it simply should not receive a high-confidence authorship-style score. [Eder 2015](https://doi.org/10.1093/llc/fqt066)

For shorter production writing, use a graded verification regime:

| New-piece length | Permitted conclusion | Grade |
|---|---|---|
| **Under 500 words** | Report local checks only: sentence lengths, openings, punctuation, contractions, paragraph shape, phrase overlap. No global "voice match" score. | D |
| **500-1,999 words** | Compare common features with wide tolerances and label the result provisional. | D |
| **2,000-4,999 words** | Compare the full feature set, but report substantial sampling uncertainty. | D |
| **5,000+ words** | Full distributional comparison is defensible if genre/register matches and the reference corpus itself is adequate. | B, with Eder's genre limitation noted above. [Eder 2015](https://doi.org/10.1093/llc/fqt066) |

**Verification procedure [D].**

| Check | Computation | Pass/review criterion |
|---|---|---|
| **Pipeline identity** | Confirm identical tokenizer, parser, normalization, and feature definitions. | Mismatch means stop and recompute. |
| **Register match** | Compare against the correct register subprofile, not only the global corpus. | Wrong register means no score. |
| **Core-feature z scores** | For each feature, \(z=(x-\mu_{profile})/\sigma_{document}\), where the denominator comes from document-level variation in the reference corpus rather than token-level pseudo-replication. | Review individual core features at \(|z|>1.5\). |
| **Aggregate deviation** | Median absolute z over core features. | Target <= **0.75**. |
| **Outlier share** | Percentage of core features with \(|z|>1.5\). | Target <= **20%**. |
| **Sentence distribution** | Compare median, SD, p10, p90, and binned shares. | Each primary value should normally remain within the author's observed 10th-90th document range. |
| **Opening diversity** | Count syntactic opening classes and repeated runs. | No >2 identical consecutive opening classes unless deliberate. |
| **Clause shape** | Compare depth 1, 2, and 3+ shares. | Each within **10 percentage points** of register profile unless subject matter requires otherwise. |
| **Paragraph shape** | Compare median, CV, and one-sentence-paragraph rate. | Flag deviations over **25%** from register baseline. |
| **Phrase reuse** | Exact n-gram scan plus distinctive-phrase review. | Review every 8-token exact overlap and any recognizable signature phrase. |
| **Content provenance** | Trace every externally checkable claim to the current brief or approved source. | Untraced claim fails regardless of stylistic fit. |

The numeric pass thresholds in this table are D-grade engineering tolerances, not published scientific cutoffs.

**Rule [B]. A feature match does not prove that prose "sounds right" to its author.** Stylometry is optimized for measurable differentiation and attribution, not subjective approval. Grieve's evaluation shows that authorship evidence emerges from combinations of measures, while register research shows that context changes the expression of authorial tendencies. **Boundary:** with repeated author feedback, subjective ratings can themselves become profile data, but they remain a separate validation layer from stylometric similarity. [Grieve 2007](https://doi.org/10.1093/llc/fqm020) [Grieve 2023](https://doi.org/10.1515/cllt-2022-0040)

A mature system should therefore report something like:

> Rhythm match: within profile.  
> Syntax match: slightly more subordinate than corpus baseline.  
> Paragraph match: within professional-email register.  
> Phrase-overlap check: clear.  
> Content provenance: complete.  
> Author approval: not established.

That separates measurable adherence from identity or endorsement.

### Ethical and legal boundary

Assumption: the legal discussion here is U.S.-centered because no jurisdiction was specified. Copyright, publicity, unfair-competition, professional-responsibility, employment, and disclosure rules can differ materially by state, country, industry, and publication.

U.S. copyright distinguishes protected expression from unprotected ideas, methods, facts, and other underlying elements. A particularly direct writing-style case is *McMahon v. Prentice-Hall*, where the court stated that the plaintiff could not claim copyright infringement merely because another author adopted a writing style the plaintiff had used. The U.S. Copyright Office likewise explains that copyright protects original expression rather than underlying ideas, processes, systems, or concepts. This supports the general proposition that **style as an abstraction is not itself copyrighted**, while the actual sentences, passages, distinctive expressive selections, and other original expression can be. [McMahon v. Prentice-Hall, Inc.](https://law.justia.com/cases/federal/district-courts/FSupp/486/1296/1754213/) [U.S. Copyright Office Circular 33](https://www.copyright.gov/circs/circ33.pdf)

That distinction does not create a license to reproduce protected expression while labeling the operation "style transfer." There is no universal U.S. word-count safe harbor. An output can therefore be stylistically similar without copyright infringement, or stylistically motivated and still infringe because protected expression was copied.

Copyright is also not the only risk. Section 43(a) of the Lanham Act creates liability for certain uses in commerce likely to cause confusion about affiliation, connection, sponsorship, or approval. A generated article presented as endorsed by a living public figure can therefore raise a different legal problem from whether its prose style is copyrightable. [15 U.S.C. §1125(a)](https://www.law.cornell.edu/uscode/text/15/1125)

Rights involving identity also extend beyond copyright. The U.S. Copyright Office's 2024 digital-replicas report concluded that existing law left gaps and recommended federal legislation addressing unauthorized digital replicas that realistically but falsely depict individuals. The legal concept of a replicated "voice" in that debate principally concerns an individual's recognizable vocal identity, not a statistical profile of prose syntax, but the policy concern is relevant to deceptive impersonation. [U.S. Copyright Office, Copyright and Artificial Intelligence](https://www.copyright.gov/ai/)

Commercial testimonials receive still more specific treatment. The FTC's final rule on reviews and testimonials prohibits specified fake or false reviews and testimonials, including misrepresentations involving purported reviewers who did not have the claimed experience and AI-generated fictitious reviewers. A tool must not generate a testimonial in a person's voice and attribute it to that person when the underlying experience or endorsement is not genuine. [FTC final rule announcement](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials)

**Authorization rule [D].** For an author's own writing, or a corpus supplied with that author's authorization, permit full profiling, profile-driven drafting, and profile-specific verification subject to the content firewall.

**Third-party rule [D].** A third party's public corpus may be analyzed for scholarship, criticism, attribution research, or high-level stylistic description, but a responsible production tool should not convert that analysis into deceptive impersonation or falsely attributed publication.

**Attribution rule [D].** Do not publish generated prose under another person's name without that person's authorization. This rule applies even when no source sentence is copied.

**Endorsement rule [D].** Refuse generation whose purpose is to create a false endorsement, testimonial, commercial approval, or other deceptive representation that the named person made or approved a statement. The Lanham Act and FTC testimonial rules supply independent legal reasons for this restriction in covered contexts.

**Opinion-fabrication rule [D].** Refuse instructions to invent a named person's position and then use the voice profile to make the fabricated position appear authentic. A style profile is not evidence of belief.

**High-stakes attribution rule [D].** Do not generate medical, legal, financial, disciplinary, political, employment, or other consequential advice under a real person's identity unless the person has authorized both the use of identity and the substantive content.

**Disclosure rule [D].** When AI-assisted text will be published under a person's name, require that person or their authorized editorial representative to know that generation was used and to approve the final text. Public disclosure of AI assistance is a separate question governed by applicable law, contract, publication policy, and context; there is no basis in the sources reviewed here for declaring one universal disclosure sentence for all bylined prose.

**Provenance rule [D].** Retain corpus provenance, authorization status, profile version, source list for factual claims, generation date, and final human approver. This gives later reviewers a way to distinguish authorized ghostwriting assistance from synthetic impersonation.

**Legal-priority rule [D].** When a profile conflicts with a required disclaimer, legally mandated wording, accurate quotation, factual qualification, accessibility requirement, safety restriction, or professional rule, the requirement wins and the profile yields.

### Folklore appendix

The entries below are D because the popular formulation exceeds the evidence. "Earliest traceable origin" means the earliest source located in this review that clearly contains the rule or its recognizable modern form, not a claim that no earlier version exists.

| Repeated rule | Grade | Earliest traceable origin in this review | Adjudication |
|---|---:|---|---|
| **"Vary your sentence length."** | D | Gary Provost, *100 Ways to Improve Your Writing* (1985), which includes a chapter explicitly titled "Vary Sentence Length." [Google Books](https://books.google.com/books/about/100_Ways_to_Improve_Your_Writing.html?id=4dqja0Qf3hQC) | Useful craft advice, but incomplete as a production specification. It supplies no target variance, distribution, interaction with clause depth, or boundary for intentional repetition. Controlled LLM-vs-human evidence now supports sentence-length spread as a measurable distinction in some domains, but it still does not establish one universally optimal variance. |
| **"Write like you talk."** | D | Provost's 1985 book contains the closely equivalent instruction "Mimic Spoken Language"; Paul Graham used the exact title "Write Like You Talk" in 2015. [Provost](https://books.google.com/books/about/100_Ways_to_Improve_Your_Writing.html?id=4dqja0Qf3hQC) [Graham 2015](https://paulgraham.com/talk.html) | Reject literally. Speech contains repairs, deixis, repetition, incomplete syntax, timing information, and prosody that writing either removes or represents differently. The usable version is narrower: prefer lexical and syntactic choices that preserve the author's natural level of directness and formality. Read-aloud evidence supports proofreading, not wholesale conversion of writing into speech. |
| **"Average sentence length should be under 20 words."** | D | The numerical tradition descends from twentieth-century readability work, especially sentence-length terms in Flesch-style formulas; modern guides frequently convert those relationships into 15-20 or under-20 prescriptions. [Matthews et al. 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC9955962/) | Reject as a universal ceiling. Readability formulas establish associations between surface length and difficulty, not an optimal literary cadence. Audience, syntax, vocabulary, information density, genre, and sentence-length variance all matter. Even GOV.UK's discussion of sentence limits notes that widely repeated comprehension percentages have often been passed around without comparable definitions. [GOV.UK discussion](https://insidegovuk.blog.gov.uk/2014/08/04/sentence-length-why-25-words-is-our-limit/) |
| **"AI detectors work by measuring perplexity and burstiness."** | D | GPTZero popularized the explanation publicly in 2023. Its own current documentation says that it **stopped using perplexity and burstiness in autumn 2023** when it moved to a deep-learning architecture. [GPTZero](https://gptzero.me/news/perplexity-and-burstiness-what-is-it/) | Historically true of some simple detectors, false as a general explanation. Modern detectors can use learned classifiers, token distributions, stylometry, probability curvature, semantic and syntactic representations, ensembles, or other signals. DetectGPT itself uses perturbation-based probability curvature rather than a simple perplexity threshold. Independent evaluations found detector reliability strongly dependent on domain and manipulation: Weber-Wulff et al.'s 14-tool evaluation concluded the tested systems were not sufficiently reliable and that obfuscation materially degraded them; Liang et al. showed severe false-positive bias against non-native English writers. [DetectGPT](https://arxiv.org/abs/2301.11305) [Weber-Wulff et al.](https://arxiv.org/abs/2306.15666) [Liang et al.](https://www.sciencedirect.com/science/article/pii/S2666389923001307) |
| **"Passive voice is bad."** | D | The modern injunction is commonly traced through Strunk's early twentieth-century "Use the active voice" advice and later *Elements of Style* editions, though even that tradition acknowledged legitimate passive constructions. A modern historical critique documents the distortion. [Bad Ideas About Writing chapter](https://human.libretexts.org/Bookshelves/Composition/Specialized_Composition/Bad_Ideas_About_Writing_%28Ball_and_Loewe%29/03%3A_Bad_Ideas_About_Style_Usage_and_Grammar/3.06%3A_The_Passive_Voice_Should_be_Avoided) | Reject categorically. Passive voice changes information structure and agent prominence. It is useful when the patient or result is the discourse topic, when the agent is unknown or immaterial, and in genres where continuity matters more than naming an agent. The operational metric is passive-voice **rate by register**, not "zero passive." |
| **"A self-contained quotable passage is two or three sentences."** | D | No primary source establishing this writing rule was located. The closest empirical antecedent found is passage-retrieval research in which one TREC QA configuration happened to perform best with three-sentence windows. [Tellex et al. 2003](https://groups.csail.mit.edu/infolab/publications/Tellex-etal-SIGIR03.pdf) | Reject. The same study found a different system worked best with six sentences, and later retrieval research supports semantically atomic propositions rather than one fixed passage length. A quotation's self-containment is a referential and semantic property, not a sentence-count property. [Dense X Retrieval](https://arxiv.org/abs/2312.06648) citeturn9academia36 |