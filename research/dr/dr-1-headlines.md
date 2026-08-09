# Headlines, titles, subject lines, and hooks

## Evidence-graded craft reference

Grades follow the supplied rubric. **Assumption:** first-party platform specifications and primary observational corpus studies do not fit neatly into A-D. I assign them **C**, the nearest conservative grade, and label them as platform or observational evidence rather than inflate them to controlled-study status. A rule is graded on evidence for the rule itself, not on the prestige of the source. All before-and-after examples below are fictional.

### The competing jobs

A headline is not a single-purpose "attention getter." It is a constrained interface that can perform five different jobs. Optimizing one can damage another.

| Job | Mechanism and evidence | Operational rule and boundary |
|---|---|---|
| **Select the right audience** | In search, Google describes the title link as a primary piece of information people use to decide which result to click. In task-oriented interfaces, descriptive headings provide information scent and support scanning. Google and Microsoft documentation likewise recommend descriptive task-oriented headings. [Google title links](https://developers.google.com/search/docs/appearance/title-link), [Google headings](https://developers.google.com/style/headings), [Microsoft headings](https://learn.microsoft.com/en-us/style-guide/scannable-content/headings). | **Rule [C]: In high-intent contexts, let selection beat interruption.** Name the object, task, audience, or query before adding novelty. **Boundary:** broad-reach editorial and entertainment feeds can tolerate weaker qualification because the immediate objective is discovery rather than task matching. |
| **Make a promise** | Landing-page field work from MarketingExperiments found that pages which continued the value proposition from the preceding click outperformed a control, although the treatment also changed form structure and therefore does not isolate headline causality. Their test explicitly identified a missing continuation of the upstream promise as a defect. [MarketingExperiments field case](https://marketingexperiments.com/value-proposition/value-proposition-headline). | **Rule [C]: State the value exchange before ornament when the next action has economic cost.** The hero must answer what the visitor gets or can do. **Boundary:** a known product, brand, or destination can carry part of the promise implicitly; repeating what the visitor already knows can waste the highest-attention words. |
| **Interrupt attention** | Thousands of randomized Upworthy headline experiments show that linguistic changes can alter clickthrough while article and image are held constant. A separate large analysis of more than 30,000 Washington Post and Upworthy experiments found that simpler headline writing attracted more selection among general readers; professional writers did not show the same preference pattern in the follow-up experiment. [PLOS ONE field experiments](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682), [Science Advances simplicity study](https://www.science.org/doi/10.1126/sciadv.adn2555). | **Rule [A]: In competitive consumer feeds, maximize immediate comprehensibility before adding cleverness.** Novelty has to be decoded faster than adjacent alternatives. **Boundary:** specialist audiences, literary features, and professional writers can tolerate or prefer denser language; the Science Advances follow-up did not reproduce the general-reader simplicity preference among professional writers. |
| **Set expectation for the body** | Misleading or incongruent headlines alter later interpretation. Ecker et al. found that subtle misinformation in headlines affected memory, inferential reasoning, impressions, and behavioral intentions. Carcioppolo and colleagues used two controlled experiments comparing accurate, questioning-clickbait, and exaggerated-clickbait headlines and found that headline-body incongruity can damage learning. [Ecker et al.](https://pubmed.ncbi.nlm.nih.gov/25347407/), [Carcioppolo et al.](https://scholarship.miami.edu/esploro/outputs/journalArticle/Exaggerated-and-Questioning-Clickbait-Headlines-and/991031615121502976). | **Rule [A]: The headline may defer information, but it may not imply a body that the body does not deliver.** The first content unit must confirm the promised subject and direction. **Boundary:** suspense is legitimate when the withheld fact is genuinely resolved in the body and the headline has not planted a false premise. |
| **Survive truncation and scanning** | Google states that `<title>` has no fixed length limit but title links are truncated as needed to fit device width. Search snippets are also truncated to device width. Eye-tracking and usability work shows disproportionate attention to beginnings of lines and scanning landmarks. [Google title links](https://developers.google.com/search/docs/appearance/title-link), [Google snippets](https://developers.google.com/search/docs/appearance/snippet), [NN/g F-pattern research](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/). | **Rule [B/C]: Front-load identity and discriminating information when the rendering surface can clip the end.** Treat the tail as expendable before treating the lead as expendable. **Boundary:** a full-width hero or editorial page with controlled line wrapping is not a search result; forcing every headline into search-style front-loading can make prose monotonous. |

The jobs have a priority order that changes with the surface.

| Context | Job that should win | What it is allowed to sacrifice |
|---|---|---|
| Paid-search landing page | Promise and expectation match | Some novelty and elegance |
| Product homepage hero | Audience selection plus promise | Some comprehensiveness |
| Search result | Query/audience selection plus accurate expectation | Cleverness; nonessential qualifiers at the end |
| Social feed | Attention interruption plus qualified promise | Full explanation, but not truthfulness |
| Email inbox | Recognition/selection plus promise | Context that preview text can carry |
| Video browse surface | Attention plus an accurate viewing promise | Standalone completeness, because thumbnail can carry part of the message |
| Breaking/news headline | Accurate summary and selection | Curiosity |
| Feature headline | Calibrated curiosity plus accurate expectation | Complete summary |
| Documentation | Navigation and task identification | Novelty almost entirely |

**Decision rule [C]: optimize the headline against the next decision the reader actually makes, not against an abstract concept of "engagement."** Searchers decide "is this my answer?", landing-page visitors decide "continue or abandon?", inbox users decide "open or ignore?", video viewers decide "watch or skip?", and documentation users decide "is this the section for my task?" This is a synthesis of first-party platform mechanics and usability evidence rather than a single controlled comparison. **Boundary:** multi-purpose surfaces require an explicit metric hierarchy before the headline can be optimized.

A useful diagnostic is therefore not "Is this headline strong?" but:

> **Which job is this headline spending words on, and is that the job that controls the next decision?**

Before: `The Future of Operations Is Here`

After for a search landing page: `Route 50-500 field technicians without spreadsheet dispatch`

After for a feature: `Why dispatch teams are abandoning the morning schedule`

The second and third versions are not interchangeable improvements. They optimize different jobs.

### Surface-specific mechanics

There is no defensible universal headline-length rule. Some platforms impose hard input limits; others merely render less text according to device, viewport, font, card, or client. Large headline datasets also contradict the simplistic assumption that shorter always wins: length has sometimes correlated positively with clicks in Upworthy experiments, while simplicity rather than raw brevity predicted preference in the Washington Post and Upworthy research. [PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682), [Science Advances](https://www.science.org/doi/10.1126/sciadv.adn2555).

| Surface | Measurable objective | Documented length and truncation behavior | Dominant job | Rule, evidence, boundary |
|---|---|---|---|---|
| **Landing-page hero** | Qualified conversion, revenue, lead completion, or the closest valid downstream action. Raw time-on-page is not the primary objective. | There is no platform character limit. The practical constraints are viewport, wrapping, visual hierarchy, and how quickly the visitor can establish purpose. NN/g research documents fast abandonment and scanning behavior; MarketingExperiments documents conversion effects from stronger value-proposition continuity, although its treatment was compound. [NN/g page behavior](https://www.nngroup.com/articles/how-long-do-users-stay-on-web-pages/), [MarketingExperiments](https://marketingexperiments.com/value-proposition/value-proposition-headline). | Promise, then audience selection and expectation. | **Rule [C]: hero copy must complete the message begun by the ad, referral, search query, or navigation path before introducing a new angle. Boundary:** direct/home traffic has no single upstream message to match, so the hero must prioritize category and primary value proposition instead. |
| **In-page section heading** | Scan-to-target success, comprehension, task location, and reduction in rereading. | Usually no semantic hard limit; site CSS, responsive navigation, TOCs, accordions, and cards can clip. NN/g's web-writing studies found substantial usability gains from concise and scannable presentation, and its "layer-cake" research describes users scanning headings as navigation landmarks. [NN/g concise/scannable writing](https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/), [NN/g layer-cake scanning](https://www.nngroup.com/articles/layer-cake-pattern-scanning/). | Audience/task selection. | **Rule [B]: make section headings describe the information underneath rather than merely decorate it. Boundary:** narrative essays can deliberately use thematic headings when sequential reading, not lookup, is the intended behavior. |
| **Search-result title / title tag** | Qualified organic clicks from relevant impressions, followed by satisfaction with the destination. | Google explicitly says there is **no limit** on `<title>` length. The displayed title link is truncated as needed for the device. Google can generate or rewrite the title link using `<title>`, visible page titles, headings including H1, `og:title`, prominent page text, anchor text, and other signals. Rewriting is especially likely when titles are inaccurate, boilerplate, obsolete, repetitive, partly empty, or otherwise unhelpful. [Google title-link documentation](https://developers.google.com/search/docs/appearance/title-link). | Audience/query selection, accurate expectation, truncation resistance. | **Rule [C, platform]: write a unique, descriptive title whose discriminating query/object information survives if the tail disappears. Do not optimize to a fixed character count. Boundary:** Google can display a different title regardless of author intent, so pixel or character precision cannot guarantee rendering. |
| **Social card / feed headline** | Qualified clicks, meaningful engagement, and downstream consumption rather than an isolated reaction. | Meta's Open Graph implementation uses fields including `og:title`, `og:description`, and `og:image`. LinkedIn likewise uses Open Graph metadata for link presentation. Their first-party organic-sharing documentation does not provide a stable universal character cutoff that can safely be treated as a cross-client law. Rendering therefore has to be treated as card- and device-dependent. [Meta sharing documentation](https://developers.facebook.com/documentation/sharing/webmasters), [Open Graph documentation](https://developers.facebook.com/docs/opengraph/distribution/), [LinkedIn sharing help](https://www.linkedin.com/help/linkedin/answer/a521928). | Interruption plus promise. | **Rule [C, platform]: make the first semantic unit intelligible without the final clause, and let image and headline divide the work rather than duplicate each other. Boundary:** some shares render with altered metadata, missing images, platform-generated text, or different line counts, so no organic-social character number is portable. |
| **Email subject plus preview text** | Downstream click, reply, conversion, retention action, or another business outcome. Open rate is now an unreliable terminal metric because Apple Mail Privacy Protection prevents senders from learning whether protected users actually opened a message. [Apple Mail Privacy Protection](https://support.apple.com/guide/iphone/use-mail-privacy-protection-iphf084865c7/ios). | Inbox display varies by client and device. Litmus documents substantial variation and commonly observed preview truncation in roughly the 35-75-character region rather than a universal cutoff. Apple Intelligence can also show generated message summaries in the inbox instead of the sender-controlled opening text for users with that feature enabled. [Litmus email anatomy](https://www.litmus.com/blog/the-anatomy-of-a-good-email), [Apple Intelligence in Mail](https://support.apple.com/guide/iphone/use-apple-intelligence-in-mail-iph9ae667055/ios). | Recognition/selection plus promise; truncation is unusually important. | **Rule [C]: treat subject and preview as a two-field unit. Subject states the decision-relevant proposition; preview advances or qualifies it instead of repeating it. Boundary:** preview text is not guaranteed to appear, and AI-generated inbox summaries can partially bypass it. |
| **Video title plus thumbnail** | A qualified click that produces meaningful viewing, not an empty click. | YouTube titles have a 100-character input limit. Current YouTube Studio supports A-B testing of titles, thumbnails, or combinations of the two, which makes the package, rather than title alone, the practical optimization unit. Feed/search rendering can still visually shorten titles depending on placement and device. [YouTube title settings](https://support.google.com/youtube/answer/57404), [YouTube title and thumbnail testing](https://support.google.com/youtube/answer/16391400). | Interruption plus accurate viewing promise. | **Rule [C, platform]: write title and thumbnail as one information system. Put complementary information in each rather than saying the same thing twice. Boundary:** search-led tutorials may require the title itself to carry substantially more descriptive information because the thumbnail cannot supply query relevance. |
| **Article / editorial headline** | Selection plus actual reading, comprehension, retention, and publication trust. | There is no universal editorial character optimum. Large field data show that simple headlines tend to attract general readers, while a meta-analysis of 8,977 randomized headline experiments shows that information amount has an inverted-U relationship with clicks. [Science Advances](https://www.science.org/doi/10.1126/sciadv.adn2555), [Scientific Reports](https://www.nature.com/articles/s41598-024-81575-9). | News: expectation/summary. Feature: calibrated curiosity. | **Rule [A]: use more summary-like headlines when accurate rapid selection is the product; reserve stronger information gaps for feature/discovery contexts. Boundary:** excessive concreteness can reduce selection even in a discovery environment, while excessive vagueness also loses clicks. |
| **Documentation / help center** | Findability, task success, reduced navigation time, and accurate retrieval. | The main truncation risks occur in TOCs, sidebars, search-result components, accordions, and responsive navigation rather than in the heading element itself. Google recommends descriptive headings; Microsoft explicitly recommends task-oriented heading structures and parallel construction in procedures. [Google headings](https://developers.google.com/style/headings), [Microsoft headings](https://learn.microsoft.com/en-us/style-guide/scannable-content/headings), [Microsoft instructions](https://learn.microsoft.com/en-us/style-guide/procedures-instructions/writing-step-by-step-instructions). | Selection/navigation overwhelmingly. | **Rule [C, platform/style]: repeat functional syntax when repetition teaches the information architecture. "Import a CSV", "Map columns", and "Resolve import errors" are better than forced stylistic variety. Boundary:** marketing pages and editorial feeds do not receive the same navigation benefit from repetitive imperative templates. |

**Landing-page example**

Before:

> `A Better Way to Work`

After:

> `Schedule 40 field technicians without spreadsheet dispatch`

Subhead:

> `Assign jobs, detect route conflicts, and text schedule changes from one board.`

The after version spends its headline on category, audience-relevant scale, and operational outcome. The subhead supplies mechanism.

**Email example**

Before:

> Subject: `A quick update`  
> Preview: `Read this email to learn more`

After:

> Subject: `Your August renewal price: $149`  
> Preview: `Same plan, billed Aug 28. Change or cancel by Aug 27.`

The pair survives subject truncation because the proposition is front-loaded, while the preview advances the decision.

**Video example**

Before:

> Title: `This Changes Everything`  
> Thumbnail: `GAME CHANGER`

After:

> Title: `Why LED lights flicker at high shutter speeds`  
> Thumbnail: `240 Hz PWM`

The second package distributes explanation between title and image instead of using two curiosity signals with no subject identification.

**Documentation example**

Before, varied for its own sake:

> `Your data's new home`  
> `What about column names?`  
> `When imports go wrong`

After, deliberately parallel:

> `Import a CSV`  
> `Map columns`  
> `Resolve import errors`

The second set violates the proposed "no repeated syntactic template" rule and is better aligned with documented task-heading practice.

### The specificity ladder

Specificity is not monotonically beneficial.

The strongest direct evidence is Le Quere and Matias's 2025 registered report. Their meta-analysis used **8,977 one-image headline experiments containing 35,910 headline observations** from the Upworthy archive. The effect of concreteness depended on the starting level. When the compared headlines were very vague, additional concreteness increased clickthrough. When they were already highly concrete, additional concreteness decreased clickthrough. In the middle range, manipulating concreteness was not expected to produce a reliable CTR difference. At one high-concreteness comparison reported by the authors, increasing concreteness corresponded to a predicted CTR change from 1.17% to 1.06%, a 9.9% decrease. [Scientific Reports](https://www.nature.com/articles/s41598-024-81575-9).

**Rule [A]: move from vague toward concrete until the reader can identify the subject, relevance, and value; stop before the headline closes every useful information gap. Boundary:** discovery-oriented headlines can lose clicks when added detail resolves too much of the reason to click, and high-intent surfaces can still require more detail because qualified selection matters more than maximum CTR.**

A second line of evidence concerns credibility rather than headline CTR. Experimental advertising research has found that specific claims can increase perceived credibility, while research on "sharp" versus round numbers found that exact-looking numbers are more likely to be interpreted as factual rather than approximate. These effects are adjacent evidence, not proof that adding arbitrary digits improves headline conversion. [Specificity and credibility study](https://research.manchester.ac.uk/en/publications/being-specific-being-credible-the-influence-of-claim-specificity-/), [sharp versus round number study](https://www.researchwithrutgers.com/en/publications/it-seems-factual-but-is-it-effects-of-using-sharp-versus-round-nu).

**Rule [B]: use precise facts when their precision has a visible reason to exist. Boundary:** these studies concern perceived claim credibility, not a universal headline-click advantage; precision that is irrelevant, unsupported, or inconsistent with the measurement process does not inherit the finding.**

A practical ladder:

| Rung | What the headline contains | Fictional example | Diagnosis |
|---|---|---|---|
| **Vague aspiration** | Abstract positive state | Before: `Work Smarter` | The reader cannot identify the product, mechanism, audience, or observable outcome. |
| **Category** | Names what the thing is or does | `Project scheduling for service teams` | Selection becomes possible, but there is little value promise. |
| **Outcome** | Category plus desired change | `Keep client projects on schedule` | The reader knows why to care, but not who it is for or how it differs. |
| **Audience plus outcome** | Adds a discriminating reader or use case | `Keep 10-50 person agencies on schedule` | Better qualification; some prospects are now deliberately excluded. |
| **Mechanism** | Adds how the result is produced | `Catch staffing conflicts before they delay client projects` | More credible and useful, while a meaningful "how" remains for the body. |
| **Measured outcome** | Adds a quantified result with context | `Cut late milestones from 18% to 9% in 60 days` | Powerful only when the figures are real, representative, and substantively supportable. |
| **Over-specific** | Adds precision with no informational return | `Cut late milestones 49.73% in exactly 43 days for 12-seat agencies` | Precision starts to look like a claim about the measurement process rather than useful reader information. |

The examples are fictional; the last line deliberately illustrates a failure state.

**Rule [A]: specificity should increase information value, not merely word count. Boundary:** Le Quere and Matias show that once a headline is already highly concrete, still more concreteness can reduce clickthrough.**

**Rule [D]: do not add a number merely because exact numbers "look more credible."** The adjacent experimental evidence shows that sharp numbers can signal factuality, not that invented precision improves response. There is no headline-specific controlled evidence supporting arbitrary pseudo-precision.

A second specificity failure is **unnecessary disqualification**.

Before:

> `Automate weekly invoice reconciliation`

More specific:

> `Automate weekly invoice reconciliation for QuickBooks Online teams with fewer than 10 users`

The second version is superior only when "QuickBooks Online" and "fewer than 10 users" are genuine qualification criteria the seller wants exposed before the click. If those are incidental implementation details, the added specificity has converted a promise into a limitation.

**Rule [D]: surface a limitation in the headline when filtering unsuitable readers has more value than maximizing initial response.** No headline field study reviewed here isolates this exact mechanism, so it should not be upgraded from a decision heuristic to an empirical law.

This distinction resolves an apparent contradiction: "more specific" can simultaneously **reduce CTR and improve economics** because the headline is selecting fewer but better-qualified readers. CTR is not always the objective.

### Headline archetypes and the curiosity gap

Headline formulas are useful as search spaces, not laws. The evidence supports some mechanisms under defined conditions; it does not support a fixed league table of "best formats."

| Archetype | Condition under which it works | Failure condition and overuse mode | Evidence grade |
|---|---|---|---|
| **Direct benefit**: `Reduce X without Y` | The audience already recognizes the category and is deciding whether the result is valuable. Best suited to landing pages, ads, offers, and high-intent search destinations. | Fails when the benefit is generic, unsubstantiated, or identical to every competitor's claim. Overuse produces a site full of interchangeable outcome slogans. | **C.** MarketingExperiments documents value-proposition continuity in conversion work, but its cited treatment was not a headline-only experiment. [Source](https://marketingexperiments.com/value-proposition/value-proposition-headline). **Boundary:** low-intent editorial discovery does not require every title to state a commercial benefit. |
| **News / announcement**: `New X now does Y` | Something is genuinely new and the novelty is itself valuable to the audience. | Fails when "new" is packaging for an unchanged proposition. Repetition creates announcement inflation. | **D** as a universal performance formula. Commercial tradition is extensive, but no controlled evidence reviewed here establishes that announcement syntax generally wins. |
| **How-to**: `How to do X` | The reader has an explicit task, procedural query, or learning objective. | Fails when the article does not actually provide a procedure or when the reader is browsing for analysis rather than instruction. Overuse makes every idea appear procedural. | **C** for task-oriented documentation, based on first-party style and usability guidance. [Microsoft task headings](https://learn.microsoft.com/en-us/style-guide/scannable-content/headings), [Google headings](https://developers.google.com/style/headings). **Boundary:** feature journalism and entertainment do not inherit the task-navigation advantage. |
| **Question**: `Are you losing margin at renewal?` | The question refers directly to a live uncertainty or to the reader. Lai and Farbrot's two experiments found question headlines more effective than declaratives in their tested Twitter and eBay settings, with self-referencing questions particularly effective. [Study](https://www.tandfonline.com/doi/full/10.1080/15534510.2013.847859). | Fails when the obvious answer is "no," when the question substitutes for a claim the writer cannot support, or when the reader has no reason to resolve it. Repeated yes/no questions create editorial evasiveness. | **A within the tested contexts.** **Boundary:** two platform experiments do not establish that questions outperform statements in search, news, email, landing pages, or documentation. The universal rule remains D. |
| **Curiosity gap / forward reference**: `The contract clause most teams notice too late` | The reader knows enough to value the missing information but not enough to resolve it from the headline. | Fails at both ends: too vague gives no reason to care; too concrete eliminates the gap. Overuse produces predictable "this/these/why" machinery. | **A.** Meta-analysis of 8,977 randomized headline experiments supports an interior optimum rather than maximal withholding. [Scientific Reports](https://www.nature.com/articles/s41598-024-81575-9). **Boundary:** the archive is largely Upworthy, an English-language US-oriented publisher already associated with this style. |
| **Command**: `Stop reconciling invoices by hand` | The reader already recognizes the problem and the commanded action aligns with a desired change. | Fails when it creates reactance, assumes a problem the reader does not have, or asks for action before establishing value. Overuse makes the voice hectoring. | **D.** No controlled headline evidence reviewed here establishes imperative syntax as generally superior. |
| **Testimonial-led**: `"We closed payroll in 40 minutes"` | Attribution itself reduces uncertainty: recognizable role, credible user, concrete experience, relevant result. | Fails with anonymous, generic, suspiciously polished, or irrelevant attribution. Overuse replaces the seller's proposition with borrowed praise. | **D** for headline superiority. Testimonial/social-proof literature does not isolate testimonial headlines strongly enough to support a headline-format law in the reviewed sources. |
| **Number-led / list**: `7 failure modes in...` | The number accurately communicates scope or structure and reduces uncertainty about what the reader will receive. | Fails when the number is arbitrary, when list size signals work rather than value, or when specificity gives away all remaining informational value. Formula repetition makes content visibly templated. | **B for precision-as-factuality in adjacent advertising research; D for "number headlines outperform."** [Sharp-number study](https://www.researchwithrutgers.com/en/publications/it-seems-factual-but-is-it-effects-of-using-sharp-versus-round-nu). **Boundary:** factuality perception is not CTR and does not establish odd-number or list superiority. |
| **Negative / problem-led**: `The renewal error that doubles support load` | A credible loss, danger, mistake, or unresolved problem is already salient to the audience. | Fails when negativity exceeds the evidence or creates anxiety with no useful resolution. Overuse changes the publication's perceived emotional baseline. | **B.** Randomized Upworthy headline data found associations between negative-emotion language and headline success under controlled within-test comparisons. [PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682). **Boundary:** the effect is publisher- and audience-specific and does not measure brand, trust, or long-term editorial cost. |
| **Audience callout**: `For finance teams closing 20+ entities` | Excluding the wrong reader is economically valuable and the included reader recognizes the identity immediately. | Fails when the segment is unnecessarily narrow or based on internal marketing taxonomy the audience does not use. Overuse turns every headline into a segmentation label. | **C** as an information-scent and qualification rule. [Google title guidance](https://developers.google.com/search/docs/appearance/title-link), [NN/g scanning](https://www.nngroup.com/articles/layer-cake-pattern-scanning/). **Boundary:** broad-interest editorial content often benefits from not declaring a narrow segment. |
| **Contrast / anti-objection**: `Enterprise controls without enterprise setup` | The audience holds a specific objection and the contrast resolves it economically. | Fails when the implied tradeoff is not one the audience recognizes. Overuse becomes formulaic "X without Y" copy. | **D** as a format-performance law. Use as a message strategy, not a proven syntactic winner. |

The intellectual basis for curiosity-gap headlines predates digital publishing. Loewenstein's information-gap theory describes curiosity as arising when attention is focused on a discrepancy between what a person knows and what the person wants to know. The missing information motivates information seeking. His review also notes that curiosity is transient because maintaining the gap requires attention. [Loewenstein, 1994 PDF](https://www.byrdseed.com/handouts/Psychology%20of%20Curiosity.pdf).

Digital headline data adds an essential correction: **the largest gap is not the strongest gap**. Le Quere and Matias found a curvilinear relationship. At very low information levels, adding information improved clicks; at high information levels, adding still more information reduced clicks.

**Rule [A]: create a resolvable gap, not an information vacuum. Boundary:** informational/search surfaces often need enough disclosure to solve selection before curiosity becomes useful.** [Scientific Reports](https://www.nature.com/articles/s41598-024-81575-9).

A legitimate gap contains four pieces:

> **Known subject + consequence/stakes + specific unresolved variable + credible expectation that the body resolves it**

Example:

Before, empty withholding:

> `You will not believe what happened to this company's invoices`

After, legitimate gap:

> `The tax setting that caused 600 invoices to be regenerated overnight`

The second headline withholds the identity or mechanism of the setting, but not the subject, class of consequence, or existence of a substantive answer.

**Rule [B]: the body must resolve the variable the headline made salient rather than swap in a weaker payoff. Boundary:** a feature can delay the final resolution as part of narrative structure, but it still must quickly confirm that the promised subject and stakes are real.** This rule is supported by information-gap theory and controlled headline-body congruence studies rather than by a direct test of this four-part wording. [Loewenstein](https://www.byrdseed.com/handouts/Psychology%20of%20Curiosity.pdf), [Carcioppolo et al.](https://scholarship.miami.edu/esploro/outputs/journalArticle/Exaggerated-and-Questioning-Clickbait-Headlines-and/991031615121502976).

The backlash evidence needs to be separated into three effects.

**Expectation violation has strong evidence. [A]** Misleading headline implications can survive into readers' later memory, reasoning, impressions, and intentions, and controlled clickbait experiments find learning costs from headline-body incongruity. **Boundary:** not every curiosity gap is incongruent; the harm follows from misleading framing, not from withheld information by itself. [Ecker et al.](https://pubmed.ncbi.nlm.nih.gov/25347407/), [Carcioppolo et al.](https://scholarship.miami.edu/esploro/outputs/journalArticle/Exaggerated-and-Questioning-Clickbait-Headlines-and/991031615121502976).

**Trust cost is real in some designs but not universal. [B]** Some clickbait studies report lower perceived credibility or quality, while other controlled political-news research has found null effects on broader trust in media after exposure. The defensible rule is narrower than "clickbait destroys trust." **Boundary:** item-level credibility, source credibility, publication-level trust, and long-term brand trust are different dependent variables and do not move identically. [NYU Center for Social Media and Politics summary of null findings](https://csmapnyu.org/research/academic-research/the-null-effects-of-clickbait-headlines-on-polarization-trust-and-learning).

**Within-publication decay from repeated curiosity syntax is not established. [D]** I found no A-C evidence measuring a causal decline in CTR as the same publication repeatedly exposes the same audience to curiosity-gap syntax over time. That claim should not be written into an authority document as fact.

The available large-scale longitudinal evidence actually blocks a simple fatigue story. A 2025 analysis of roughly **40 million news headlines** across major outlets and the News on the Web corpus found that headline language became longer, more negative, more verb-heavy, and more likely to contain pronouns and wh-words associated with click-oriented styles over the past two decades. The study is observational and does not show those devices remained causally effective, but it shows production-level convergence toward them rather than abandonment. [Nature Humanities and Social Sciences Communications](https://www.nature.com/articles/s41599-025-04514-7).

### Corpus-level variance

The current default, **"no two headings in one deliverable share a syntactic template," should be rejected as a universal rule.**

It has no measured basis, and in one important surface it directly conflicts with first-party guidance. Microsoft recommends parallel structures for procedural and task-oriented headings because predictable grammar helps users recognize equivalent information types. Google similarly emphasizes descriptive headings that support navigation rather than stylistic novelty. [Microsoft instructions](https://learn.microsoft.com/en-us/style-guide/procedures-instructions/writing-step-by-step-instructions), [Microsoft headings](https://learn.microsoft.com/en-us/style-guide/scannable-content/headings), [Google headings](https://developers.google.com/style/headings).

**Rule [C]: structural repetition is beneficial when syntax is part of the information architecture. Boundary:** this applies to procedures, reference systems, navigation sets, comparison taxonomies, and analogous structures; it does not establish that repetitive promotional or editorial hooks are harmless.**

Example:

Bad documentation produced under an anti-repetition rule:

> `Importing your records`  
> `How do column mappings work?`  
> `Errors: what to know`  
> `The secret to retrying`

Better:

> `Import records`  
> `Map columns`  
> `Resolve errors`  
> `Retry an import`

The repeated imperative template is functional metadata.

For attention-oriented corpora, the evidence is thinner.

Banner-blindness research provides an adjacent mechanism: users learn to ignore elements that look like advertising or repeatedly occupy stereotyped advertising locations. NN/g's eye-tracking work describes this as learned selective attention to predictable visual forms and locations. [NN/g banner blindness](https://www.nngroup.com/articles/banner-blindness-old-and-new-findings/).

**Rule [C]: treat banner blindness as evidence that predictable presentation can become ignorable, not as proof that repeated headline grammar necessarily loses CTR. Boundary:** banner blindness is primarily visual and positional; transferring its effect size to syntactic headline templates would be an unsupported analogy.**

General habituation research likewise defines declining responsiveness to repeated stimuli, but this does not supply a headline-template dose-response curve. A 2023 PLOS ONE paper models habituation in information spreading, while broader cognitive work documents habituation across repeated stimulus classes. [PLOS ONE habituation model](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0280266).

The 2025 headline-evolution study adds a corpus-level fact: stylistic features associated with click-oriented writing have become more common across different outlets, political orientations, and journalistic-quality classifications. It documents convergence, not response decay. [Headline evolution study](https://www.nature.com/articles/s41599-025-04514-7).

The resulting evidence map is:

| Proposition | Grade | Verdict |
|---|---:|---|
| Repetitive visual advertising patterns can become easier to ignore | C | Supported as adjacent usability evidence. |
| Repeated stimuli can produce habituation in general | B/C | Supported in broader cognition/information literature, not headline syntax specifically. |
| Digital news headline styles have converged toward several click-oriented linguistic features over time | C, observational | Supported across a roughly 40-million-headline corpus. |
| A publication's CTR declines after readers see the same headline syntax N times | D | No qualifying direct evidence located. |
| Every adjacent heading should use a unique syntax | D | No evidence, and contradicted as a universal usability rule by documentation practice. |
| There is an empirically known optimum number of syntactic templates per page/site | D | No qualifying evidence located. |

The anti-repetition rule therefore needs to be split by function.

**Replacement rule for structured documentation [C]: use parallel syntax whenever headings are members of the same task or information class. Boundary:** stop parallelizing when the headings no longer represent equivalent units.** [Microsoft](https://learn.microsoft.com/en-us/style-guide/procedures-instructions/writing-step-by-step-instructions).

**Replacement rule for marketing/editorial corpora [D]: manage template concentration rather than demand universal uniqueness.** There is no measured universal threshold, so any numeric default must be explicitly marked as governance, not science.

A workable provisional default is:

> In a rolling window of 12 attention-oriented headlines or major headings, maintain at least four effective syntactic families, and avoid runs longer than two instances of the same non-functional hook family.

Operationalize the template signature as:

`clause type + lead device + promise structure`

Examples include:

`declarative + audience callout + benefit`  
`interrogative + direct address + problem`  
`imperative + no lead device + action`  
`fragment + number + list scope`  
`declarative + forward reference + curiosity gap`  
`quotation + attribution + result`  
`announcement + novelty marker + capability`

Do not define a template by surface wording alone. `7 errors in payroll` and `11 causes of failed imports` belong to the same number-led scope template despite different vocabulary.

For measurement, use concentration rather than pairwise uniqueness. Let \(p_i\) be the share of headlines belonging to template family \(i\).

\[
HHI = \sum_i p_i^2
\]

\[
Effective\ template\ count = \frac{1}{HHI}
\]

A corpus split evenly among four families has HHI = 0.25 and an effective template count of 4. A corpus dominated by one family moves toward 1.0 and an effective count near 1.

**Provisional trigger [D]: flag a rolling 12-headline window when HHI exceeds 0.25 or when the same attention-seeking template occurs more than twice consecutively.** This is a review threshold, not a performance optimum. It replaces an even more arbitrary zero-repetition rule with a measurable concentration rule while preserving deliberate parallelism.

The actual site-specific quantity worth estimating is **exposure decay**:

\[
P(click) = f(template,\ prior\ exposure,\ topic,\ position,\ audience,\ time)
\]

A defensible experiment randomizes semantically equivalent headline families within content, blocks or controls for placement and topic, and estimates the interaction between template and the reader's recent exposure count. Online experimentation literature strongly favors explicit randomization, predeclared metrics, adequate power, and control of multiple testing over post-hoc winner selection. [Microsoft experimentation methodology](https://exp-platform.com/large-scale/), [ExP power calculator](https://exp-platform.com/power-calculator/).

**Rule [A, methodology]: derive a corpus-variance threshold from randomized site-specific exposure data if the site has enough traffic to do so. Boundary:** without user-level exposure logging or enough repeated exposures, the site cannot identify habituation separately from topic, placement, seasonality, or audience change.**

The operational conclusion is intentionally asymmetric:

> **Parallel structure is proven useful in some information architectures. Anti-repetition is not proven useful at any universal quota.**

### Headline-to-body handoff

The headline does not end when the click occurs. It establishes a model of the content that subsequent text either confirms, refines, or violates.

Ecker et al.'s experiments are especially important because they show that headline implications can affect interpretation even when readers receive the article itself. Headlines are therefore not merely traffic acquisition devices; they can change how the body is processed. [Ecker et al.](https://pubmed.ncbi.nlm.nih.gov/25347407/).

Carcioppolo and colleagues separately tested accurate, exaggerated-clickbait, and questioning-clickbait treatments with headline-only and full-article exposure. Their work supports the conclusion that incongruity between headline and article can impair learning. [Carcioppolo et al.](https://scholarship.miami.edu/esploro/outputs/journalArticle/Exaggerated-and-Questioning-Clickbait-Headlines-and/991031615121502976).

**Rule [A]: the opening content must confirm the headline's premise before introducing a second premise. Boundary:** narrative sequencing can postpone the ultimate answer, but it cannot retroactively reveal that the headline was about a materially different claim.**

Bad handoff:

> Headline: `The contract clause that erased a distributor's margin`  
> Opening: `Negotiation has always been part art and part science. Companies of all sizes need better communication.`

The opening makes the reader re-earn context.

Better:

> Headline: `The contract clause that erased a distributor's margin`  
> Opening: `The clause tied every annual price increase to the distributor's original wholesale rate, so its margin shrank each time costs rose.`

The second opening begins paying the exact proposition immediately.

Web-scanning evidence strengthens this rule. Users disproportionately scan beginnings of lines, and NN/g's research on web writing found large usability improvements from concise, scannable, objective presentation. [NN/g F-pattern](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/), [NN/g concise/scannable writing](https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/).

**Rule [B]: put the semantic confirmation of the headline in the earliest practical sentence or content block. Boundary:** literary and feature openings can establish scene before explanation when the scene itself clearly belongs to the promised story; generic throat-clearing receives no such exemption.**

The deck or subhead has a distinct role. The reviewed evidence does **not** provide a strong controlled study isolating deck wording while holding headline and body constant. Its strongest basis is scanning and information-layering research rather than deck-specific conversion data. NN/g's "layer-cake" work shows that people use headings as successive information landmarks.

**Rule [C]: use the deck to add the highest-value information omitted from the headline, not to paraphrase the headline. Boundary:** when the headline is already fully explanatory or the surface does not reliably display a deck, duplication can be safer than dependency.** [NN/g layer-cake research](https://www.nngroup.com/articles/layer-cake-pattern-scanning/).

A robust three-layer handoff looks like this:

> **Headline:** outcome or tension  
> **Deck:** mechanism, boundary, evidence class, or scope  
> **Opening:** immediate confirmation and first piece of proof

Fictional example:

Before:

> Headline: `Why finance teams are changing close software`  
> Deck: `A look at what's changing in finance`  
> Opening: `Finance is changing faster than ever.`

After:

> Headline: `Why multi-entity finance teams are replacing spreadsheet close checklists`  
> Deck: `The failure point is not task tracking. It is dependency visibility across entities.`  
> Opening: `When Harbor Peak added its twelfth subsidiary, one late intercompany reconciliation began blocking four downstream close tasks every month.`

The after version uses each layer for a different information function.

There is also a specific curiosity-handoff error: **re-teasing**.

Headline:

> `The pricing rule that caused cancellations to spike`

Bad opening:

> `The answer may surprise you.`

The body has spent the click but has not reduced the information gap.

**Rule [B]: after a curiosity-led click, decrease uncertainty rather than opening the same gap again. Boundary:** long-form narrative may open a second, deeper question after resolving or concretizing the first.** The rule follows from information-gap theory, which treats curiosity as motivation to close a salient gap, and from evidence that misleading or incongruent handoffs damage processing. [Loewenstein](https://www.byrdseed.com/handouts/Psychology%20of%20Curiosity.pdf), [Ecker](https://pubmed.ncbi.nlm.nih.gov/25347407/).

### What to test and what not to

Headline experimentation has produced a large enough literature to establish one result with high confidence: **context beats formula**.

The Upworthy archive contains randomized comparisons in which impression and click events were logged for headline variants, and researchers can compare variants shown with the same image during the same test period. PLOS researchers explicitly used that randomized structure to isolate differences among headline wording variants. [PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682).

Le Quere and Matias then demonstrated why universal rules fail: the sign of the concreteness effect reverses according to baseline concreteness. More detail can help or hurt. [Scientific Reports](https://www.nature.com/articles/s41598-024-81575-9).

The large Washington Post and Upworthy analysis likewise found that simpler writing attracted general readers, while professional writers did not display the same selection pattern in a follow-up study. [Science Advances](https://www.science.org/doi/10.1126/sciadv.adn2555).

A large 2024 analysis of **17,681 headline A-B tests** also found that pure language-model approaches were weak at reliably predicting A-B winners, reinforcing the gap between recognizable headline patterns and actual causal performance. [LOLA / arXiv](https://arxiv.org/abs/2406.02611). citeturn0academia15

The evidence therefore separates cleanly.

| Test | Decision |
|---|---|
| **Materially different promise or information level** | Test. Large field data show that information amount can reverse direction according to baseline. **[A] Boundary:** test against the business metric appropriate to the surface, not merely CTR. |
| **Simple versus syntactically/lexically complex expression of the same proposition** | Test when serving broad consumer audiences. **[A] Boundary:** expert/professional audiences did not reproduce the same preference pattern. |
| **Accurate summary versus calibrated curiosity** | Test on discovery surfaces, with downstream reading/quality guardrails. **[A] Boundary:** too little and too much information both reduce response. |
| **Negative/problem framing versus neutral framing** | Test when editorial and brand costs are acceptable. **[B] Boundary:** randomized click data do not establish a long-term trust benefit. |
| **Question versus declarative headline** | Test only when the question is semantically natural. **[A in the Lai/Farbrot contexts] Boundary:** Twitter/eBay results are not a universal surface law. |
| **Title alone for video when thumbnail also changed** | Do not infer title causality. YouTube now supports testing titles, thumbnails, and combinations explicitly. **[C, platform] Boundary:** title-only experiments remain valid when the thumbnail is actually held constant. |
| **Email subject based only on open rate** | Do not make it the terminal decision metric where Apple MPP is material. **[C, platform] Boundary:** open data from unaffected clients can remain a diagnostic signal if segmented correctly. |
| **One-word synonym tests at low traffic** | Usually do not test. The minimum detectable effect will be too large or the run too long for the decision value. **[A, statistical design] Boundary:** very high-volume products can resolve small effects economically. [ExP power methodology](https://exp-platform.com/power-calculator/). |
| **Exact character counts, punctuation, "power words," odd versus even number, capitalization minutiae** | Do not elevate to standing rules without first-party data. **[D]** These effects are either unverified, confounded, surface-dependent, or too small to justify universal authority. |
| **Compound page redesign when the question is "which headline caused it?"** | Do not attribute the result to the headline. **[A, experimental-design principle] Boundary:** compound tests are valid when the decision is which complete experience wins, not which element caused the difference. [Microsoft experimentation](https://exp-platform.com/large-scale/). |

A headline test needs a predefined **minimum detectable effect**, not merely a hope for statistical significance. Microsoft experimentation guidance emphasizes power planning, false-positive control, and adequate exposure; the Upworthy analysis likewise used within-experiment comparisons and multiple-comparison corrections rather than treating every raw CTR difference as real. [ExP power calculator](https://exp-platform.com/power-calculator/), [PLOS ONE methods](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682).

**Rule [A]: choose the smallest effect worth acting on before the test and power the experiment for that effect. Boundary:** sequential and adaptive designs require different stopping mathematics than a fixed-horizon two-arm calculation.**

Using a standard two-proportion normal approximation, equal allocation, two-sided alpha = 0.05, 80% power, and no multiplicity adjustment, approximate requirements are:

| Baseline rate | Effect worth detecting | Treatment rate | Approx. sample per arm | Approx. total |
|---:|---:|---:|---:|---:|
| 1% | +20% relative | 1.20% | 42,693 | 85,386 |
| 3% | +10% relative | 3.30% | 53,211 | 106,422 |
| 5% | +20% relative | 6.00% | 8,158 | 16,316 |
| 5% | +10% relative | 5.50% | 31,234 | 62,468 |
| 5% | +5% relative | 5.25% | 122,124 | 244,248 |
| 10% | +10% relative | 11.00% | 14,751 | 29,502 |
| 30% | +10% relative | 33.00% | 3,763 | 7,526 |

The table is a power calculation, not observed headline performance. It demonstrates why most low-traffic headline tests cannot resolve subtle differences.

At a 5% baseline CTR, detecting a 10% relative lift requires roughly **62,500 total eligible impressions** under those assumptions. At 10,000 eligible impressions per day, the raw exposure requirement is about 6.3 days; at 1,000 per day it is about 62.5 days. Weekly seasonality, multiple variants, repeated-user dependence, guardrail metrics, and peeking can increase the required duration or invalidate the naive calculation. [ExP power calculator](https://exp-platform.com/power-calculator/).

**Rule [A]: at ordinary traffic levels, test differences large enough to matter semantically before testing microcopy. Boundary:** extremely high-traffic publishers can economically test effects far below the thresholds practical for a smaller site.**

Three-variant tests are not equivalent to running one ordinary two-arm test three times. Multiple comparisons increase false-positive risk, and selecting the largest observed CTR creates winner's-curse bias. Large experimentation programs explicitly treat multiplicity and power as design issues. [Microsoft experimentation](https://exp-platform.com/large-scale/).

**Rule [A]: do not declare a winner from the largest observed number without a prespecified statistical decision procedure. Boundary:** a properly designed bandit or sequential experiment can allocate traffic adaptively, but its inference rules must match that design.**

Adaptive allocation can be worthwhile at sufficient scale. Research on batched Thompson sampling using Yahoo front-page headline/content optimization reported increased clicks relative to a conventional test-then-rollout strategy, illustrating that experimentation itself can be optimized when traffic and infrastructure justify it. [Batched Thompson Sampling paper](https://arxiv.org/abs/1908.06256). citeturn0academia16

**Rule [B]: use adaptive headline allocation when the cost of spending traffic on inferior variants is material and the statistical infrastructure is mature. Boundary:** ordinary teams without correct sequential inference are safer with a simple preregistered fixed-horizon test.**

The strongest testing hierarchy is therefore:

> **Test proposition before syntax. Test information level before punctuation. Test audience qualification before "power words." Test the whole click unit when the surface presents a whole click unit. Optimize the downstream outcome that makes the click valuable.**

### Folklore appendix

The following rules are widely repeated but fail the evidence standard when stated universally. "Earliest traceable" means the earliest source chain located in this review, not proof that no earlier verbal or print version existed.

| Folklore claim | Earliest traceable origin in this review | Grade and adjudication |
|---|---|---|
| **"On average five times as many people read the headline as read the body copy."** | David Ogilvy, *Confessions of an Advertising Man*, 1963. The line is repeatedly attributed to that book, together with the "eighty cents" formulation. A surviving quotation and attribution can be seen in sources documenting the passage. | **D.** No sampling frame, readership-study citation, experimental method, date range, medium definition, or denominator travels with the assertion. Even if Ogilvy had proprietary readership data behind it, the quoted rule does not expose enough evidence to transport "5x" into modern search, email, social, video, or web-page contexts. The number does not survive scrutiny as a universal empirical constant. |
| **"Eight out of ten people read the headline, two out of ten read the rest."** | The earliest exact dated web instance located in this review is March 31, 2006, in a version of Brian Clark's "80/20 Rule of Headlines"; Copyblogger later repeated it extensively. The 2009 Copyblogger version describes the ratio as applying to a "typical headline environment" but supplies no source for the statistic. | **D.** No primary study is cited. The wording resembles an intuitively memorable Pareto ratio, which helps explain its survival. It should not appear in an authority document as measured reader behavior. |
| **"The best headline length is six words."** | The traceable modern chain runs through a 2014 Buffer article citing a KISSmetrics post by Bnonn Tennant, which in turn invoked unspecified "usability research" saying readers absorb the first and last three words. Buffer itself noted that six-word headlines were rare and cited much longer converting headlines in the same discussion. | **D.** The underlying study is not identified, and current evidence directly undermines a universal six-word optimum. Google has no title-tag length limit; Upworthy field data have sometimes associated greater length with higher CTR; broad-reader research favors simplicity, which is not the same variable as word count. |
| **"Odd numbers outperform even numbers in headlines."** | The traceable commercial claim is Outbrain's widely propagated "20% higher CTR" assertion from its early-2010s headline-analysis material; current Outbrain pages and downstream HubSpot material continue to repeat it. | **D as a general rule.** The surviving repetitions reviewed here do not provide a primary randomized report, sample-construction detail, assignment method, uncertainty estimates, or enough controls to separate parity from topic and list size. Cognitive research showing that odd numbers can be processed differently does not establish headline CTR superiority. The rule persists because "use odd numbers" is concrete, memorable, and trivially executable. |
| **"Questions in headlines increase engagement."** | Question-headline advice predates the web, but the important empirical source located here is Lai and Farbrot's 2014 paper reporting two experiments involving Twitter and eBay-style contexts. [Study](https://www.tandfonline.com/doi/full/10.1080/15534510.2013.847859). | **Universal version: D. Scoped version: A.** The experiments support question headlines under the tested conditions, especially questions referencing the reader. They do not establish a universal advantage in SEO, email, video, news, landing pages, or documentation. The folklore error is not that question syntax can work; it is converting a contextual result into a cross-surface law. **Boundary for the A claim:** do not extrapolate beyond comparable reader-addressed contexts. |
| **"Headlines are 80 percent of your advertising spend."** | Ogilvy's 1963 formulation follows directly from his "five times as many" readership claim: after writing the headline, he said the advertiser had spent "eighty cents out of your dollar." | **D.** This is rhetorical allocation, not an advertising-budget study. It converts a claimed 5:1 readership difference into a memorable economic metaphor. No evidence reviewed here measured 80% of spend, sales impact, creative labor, or media value as attributable to the headline. |
| **"SEO titles should always be 50-60 characters."** | The rule emerged from SEO-tool and SERP-preview conventions built around historical desktop rendering widths, not from a Google character limit. | **D as a universal rule.** Google explicitly states that `<title>` has no length limit and that displayed title links are truncated as needed to fit device width. Google can also rewrite the displayed title. The valid rule is front-load the distinguishing information, not "write 60 characters." [Google documentation](https://developers.google.com/search/docs/appearance/title-link). |
| **"Social headlines should be 70 characters."** | Early Twitter Card and social-optimization guides propagated fixed character recommendations as platform layouts changed. | **D as a current cross-platform rule.** Meta and LinkedIn's current first-party organic-sharing documentation does not define one portable social-card cutoff. Client, viewport, card type, metadata extraction, and rendering differ. [Meta](https://developers.facebook.com/documentation/sharing/webmasters), [LinkedIn](https://www.linkedin.com/help/linkedin/answer/a521928). |
| **"Eight-word headlines get 21% more clicks."** | The claim is part of the same Outbrain-derived headline-statistics cluster later repeated across marketing material. A current Outbrain article repeats both the eight-word and odd-number claims. | **D.** The surviving claim lacks enough primary methodology to justify causal use, and stronger randomized headline evidence does not support a universal short-length optimum. It persists because the percentage appears precise while the qualification burden is hidden. |
| **"A colon or hyphen improves headline CTR by 9%."** | Also traceable through the Outbrain headline-statistics cluster and downstream repetitions. | **D.** No qualifying randomized primary report was located. Punctuation is confounded with two-part headline structure, topic, length, and style. The number should not be encoded as a writing rule. |
| **"Use power words."** | Direct-response and content-marketing formula traditions, later amplified by headline analyzers that assign lexical scores. | **D as a universal lexical rule.** Large randomized headline archives demonstrate that wording effects exist, but those effects are contextual; model-based attempts to infer winners from headline language alone remain weak. [PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682), [LOLA](https://arxiv.org/abs/2406.02611).turn0academia15 |
| **"Always write 25 headlines before choosing one."** | The modern rule is associated with Upworthy-era editorial practice, where generating many candidates became a celebrated production method. | **D as an optimum.** The Upworthy archive demonstrates the value of testing variants, not that 25 ideation attempts is a causal threshold. Twenty-five can be a useful production constraint; it is not an evidence-based optimum. |
| **"Never repeat a syntactic headline template within one deliverable."** | The current working rule supplied for this document has no traced empirical origin. | **D. Replace it.** Documentation guidance supplies an explicit counterexample: parallel heading grammar can improve recognition of equivalent tasks. For attention-oriented corpora, use measured concentration and site-specific decay testing rather than mandatory uniqueness. [Microsoft instructions](https://learn.microsoft.com/en-us/style-guide/procedures-instructions/writing-step-by-step-instructions). |