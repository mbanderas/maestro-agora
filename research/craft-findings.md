# YouTube craft mining: findings

Source pass: 20 searches, 158 unique candidates, 35 transcripts fetched and mined. Speakers include April Dunford, Bob Moesta, Joanna Wiebe, Harry Dry, Eddie Shleyner, Talia Wolf, and Peep Laja, plus a UX writing workshop and one vendor split-test roundup.

Grades follow the Agora scale. Almost nothing here is A or B, because YouTube produces practitioner assertion rather than controlled evidence. That is expected. The value is in the exemplars and the operational tests, not the claims. Where a speaker asserts an effect without method, it is graded C or D no matter how well known they are.

Organized by the four target gaps from `00-DIAGNOSIS.md`, not by source.

---

## Gap 2: reader vocabulary and methodology labels

This gap produced the strongest material in the pass. Three sources converge on it independently.

### Rules that survived

**Lead with the category, because an unoriented reader does not read on. [Grade C]**
Peep Laja, Wynter B2B messaging course. A first-time visitor needs three answers before anything else works: where am I, what can I do here, why should I do it here. His prescription is to borrow the journalistic convention: reporters always identify a company through a category lens, as in "this email marketing tool" or "this live chat provider". His diagnosis of the failure is exactly the one in the diagnosed article: "so many companies get into like, we're elevating world's consciousness. Okay, that's great, but what is it?"

Boundary, from the same source: this is a clarity rule for a cold visitor on a key landing page. It is not a rule for every sentence on every surface.

**Category is context, and an existing category is easier than a new one. [Grade C]**
April Dunford. "The job of a market category is it tells your customer at a macro level what you're all about. It gives them some signal about who you are. It orients the customer." Her worked case is Snowflake's original line, "a data warehouse for the cloud", which works because the reader already owns "data warehouse".

This reframes the whole gap usefully. A category label is not a taxonomy retreat when it is doing orientation work. Agora's `Reject flat or synthetic drafts` currently treats "reads as a category definition" as a defect without distinguishing orientation from taxonomy. That distinction needs to exist.

**Jargon is justified when the industry genuinely uses it. [Grade C, and it matches the Grade B research boundary]**
Peep Laja: "jargon is justified when it's an industry, it's how industry calls something. If you're selling ABM software and the buyers are buying ABM software, you don't need to explain it." Paired with his test for everything else: "this needs to be a phrase you would use in a conversation with your colleague, your brother, your mom."

This is practitioner confirmation of the boundary the deep research established, which is that unfamiliar jargon reduces processing fluency while familiar domain terminology used with a domain reader does not.

**The buyer is not a corporate abstraction. [Grade D]**
Peep Laja: "people think that if I'm a B2B software, my buyer is also a fancy B2B person." Useful framing, no evidence attached.

**Get your own voice out of the copy and use the customer's. [Grade C]**
Joanna Wiebe, repeatedly and across four separate talks. The operational method is review mining and interview mining, then inserting captured phrases into a frame rather than paraphrasing them. Her stated target is "the person who is just a step away from where they are right now", and her stated reason for mining rather than writing is that a copywriter cannot invent that person's next self.

Her fastest documented technique: a Google search of the form `"tired of" + [product category] + site:amazon.com` style query against review corpora, to surface pain-point phrasing directly. Grade D as a method claim, genuinely useful as a procedure.

**Boredom inside the company is not evidence the copy is failing. [Grade C, and the most counterintuitive finding in the pass]**
April Dunford, on internal resistance to positioning that works: teams say "we've been saying this forever, it's so boring, everybody knows it already, there's nothing interesting here", and she calls that a bad reason to change it, because the marketing team stares at the homepage every day and the buyer sees it once.

This is a direct counterweight to novelty-seeking and it interacts with the corpus-variance rule. Some repetition that feels stale internally is invisible externally. Agora should not treat internal fatigue as a signal.

### What the mining found that the diagnosis did not anticipate

The orientation-versus-taxonomy distinction. My diagnosis treated category language as a failure mode. Two independent practitioners treat naming the category as the first job of the page. Both are right about different things: naming the category orients, and describing yourself only in category terms leaves you swappable. Agora needs to hold both.

---

## Gap 3: calls to action

### Rules that survived

**Microcopy under the button, built from the reader's live objections. [Grade C]**
Harry Dry, live site teardown. His procedure for a booking or signup control is to answer four questions immediately underneath it: what is the goal, how is it going to work, what are you going to walk away with, and who is this for. He adds an explicit low-pressure line where the commitment is ambiguous, for example "there's no pressure to continue". His method for generating the list is to enumerate the objections the reader has at that exact moment, such as "it's going to take too long", "do I need a code for this", "is it privacy compliant".

This is practitioner grounding for the sub-CTA reassurance line that Agora added and could not source.

**A CTA on a cold page with no motivation built is wasted. [Grade C]**
Peep Laja: "if somebody comes to the site and you have a big sign up now, they're not going to sign up because they don't even know what you're about. Their motivation is very low. It's a waste." His ordering: make clear what it is, make them want it, make it easy, and only then place the control.

**The label must match what actually happens next, including approval states. [Grade C]**
UX writing workshop, working through a real training-registration form. The button read "I participate", but submitting only created a request pending approval. The reviewer's correction: "when you say I'll participate, the user will think okay, I'm part of this training. If that is not the case then maybe it should rather be something like send request."

This is the cleanest available demonstration of Agora's CTA-destination test, and it comes from a live product rather than a hypothetical.

**Over-narrow labels cost as much as vague ones. [Grade D]**
Same source: a contact control labelled "ask about the product" was judged too narrow, because users arrive with questions that are not about the product. Recommended broadening to "get in touch" or "contact us". Worth recording because Agora's current pressure is entirely toward specificity, and this is the failure at the other end.

**The CTA has to exist at all. [Grade D]**
Eddie Shleyner: "first of all it has to exist. You'd be surprised how many times I see something that just doesn't tell people what to do." Also his proportionality rule: a two thousand dollar product needs substantially more copy and selling than a twenty dollar product, so the evidence and the ask scale together.

### Test results worth recording, all vendor-reported [Grade C at best]

From one split-test roundup. Treat every figure as a testable prior, never as a rule. None carries sample size, duration, or significance reporting.

| Change | Reported effect | Note |
|---|---|---|
| `Sign up for free` to `Trial for free` | conversions doubled, reported +104% | Same design, same offer, CTA text only |
| Landing page headline matched to the ad it came from, versus a page-optimized headline | +115% | Message-match and continuity |
| Long page with the CTA below the fold, versus a conventional above-fold layout | +300% | Directly contradicts the above-the-fold rule |
| Larger CTA with increased color contrast | +25% signups | Visual hierarchy, not copy |

The first row is the interesting one for Agora, because both labels are short verb phrases and the winner is the one that names what the reader does with the product rather than what they do with the form. That is consistent with Agora's outcome-naming rule, though a single vendor-reported test cannot establish it.

The third row matters because it is the second independent source in this project contradicting the above-the-fold folklore.

---

## Gap 1: headlines, hooks, and specificity

### Rules that survived

**Specific beats superlative, and superlatives actively destroy credibility. [Grade C]**
Peep Laja's worked pair, which is the best compact demonstration found in the entire pass:

> Weak: "the fastest pizza delivery in town"
> Strong: "we deliver pizzas in 15 minutes"

His reasoning: "nobody's believing superlatives. It adds to the vagueness. It destroys credibility." Same logic applied to benefit claims: "increase your sales" fails because every company in the category promises to make more money and save time.

**Write sentences that can be false. [Grade C, and the strongest operational test in the pass]**
Harry Dry. A line that cannot be false is not a claim. His transmission of the idea, credited to an anonymous Reddit post: "you can't talk, you can only point." The thought experiment is describing a single friend to set them up on a blind date: adjectives fail, specific pointable facts work.

**The competitor-signature test, with an attributed origin and an operational version. [Grade C]**
Harry Dry cites Jim Durfee: never write an ad a competitor can sign. His worked example is a university tagline, "Essential Skills to Excel", which any other university could sign unchanged.

His operational version is better than the conceptual one and Agora should adopt it: **paste the line into a search engine.** If it returns the same sentence across many companies, it is cookie-cutter. That is a checkable procedure, unlike "would a competitor use this", which requires judgment.

**The abstraction audit, as a runnable prompt. [Grade D]**
Harry Dry's own instruction: take the homepage or advert and ask a model to "highlight every word or sentence which contains abstract verbs, abstract nouns, abstract adjectives, and clichés". Crude, and closer to a mechanical check than anything Agora currently has.

**Dead words. [Grade D]**
Harry Dry on a payment provider describing itself as "take your payments to the next level": "the words have been killed. They've lost all their meaning." Consistent with Agora's existing AI-vocabulary section, arrived at independently.

**First line, second line. [Grade D]**
Harry Dry, crediting Dave Gerhardt and Joe Sugarman: the only job of the first line is to get the second line read. His worked example: "It takes 3.1 seconds to read this ad" followed by "the same time it takes a Model S to go from 0 to 60."

**Honesty cannot be parodied. [Grade D]**
Harry Dry on why a sincere factual ad resists the cliché test: "It's a fact. It's honest. You can't parody. You can't cliché honesty." Unmeasurable, and a useful articulation of why Agora's truth discipline and its craft goals point the same direction rather than competing.

### Direct contradiction to record, not resolve

**Question-form subheads.** Peep Laja is explicit: "I see so many subheads phrased in the form of a question. 'Why should you sign up with our company' is a terrible subhead. Instead just say what the answer is. Don't ask questions, give answers."

This contradicts my own site observation in `00-DIAGNOSIS.md`, where the question-form H3s on the audited site read markedly better than the statement H2s. Both can be true and the resolution is probably that the questions beat abstract noun-stack statements while losing to concrete answer statements. That is a hypothesis, not a finding. Recorded as an open conflict.

---

## Gap 4: prosody and rhythm

Thinnest gap in the pass, and it produced the sharpest conflict in the project.

**Practitioner position: uniformly short. [Grade D]**
Peep Laja: "commas typically are a sign that this sentence should be breaking apart. Choppy is what you want. Short sentences, choppy sentences. Paragraphs no more than three lines. Two is better. One sentence would be ideal."
Harry Dry's writing is characterized by his interviewer as having the shortest sentences of anyone he reads, and Dry does not dispute it.

**Deep research position: deliberate variance.** Prompt 6 returned sentence-length standard deviation targets of 8 to 12 words with a coefficient of variation of 0.40 to 0.70, and flags metronomic pacing below roughly 6 words of standard deviation.

**These conflict and neither is graded above D.** The most likely resolution is register: B2B landing-page copy read by a scanning cold visitor is a different problem from expository prose read continuously, and the practitioners above are all talking about the former. Agora should not adopt either as universal. The variance targets should be scoped to continuous prose, and the choppy rule scoped to scanned commercial surfaces. Neither has the evidence to claim more.

**Rhythm through repetition. [Grade D]**
Harry Dry's demonstration is worth keeping because it is concrete: "raise twice the cash, hire twice the staff, spend twice as much on ads, cross both your fingers." He identifies the repeated "twice" and "both" as the rhythm carrier. Note this is deliberate parallelism, which cuts against a naive anti-repetition rule and supports the split-by-function conclusion already reached.

**Read aloud, in a false accent. [Grade D as stated, Grade B for plain read-aloud]**
Harry Dry: "read aloud what you write in a phony American accent", which he attributes to the copy literature without a name. The underlying read-aloud proofreading benefit is Grade B from the research pass. The accent variant is folklore, and plausibly useful for exactly the reason he implies, which is that it strips the writer's internal music from the line.

---

## What the mining did not find

- **No usable evidence on headline corpus variance.** Nobody addresses template repetition across a site. The governance default from the research pass stands unchallenged and unsupported.
- **No evidence on passage or paragraph self-containment for quotation.** Not a practitioner concern.
- **Almost nothing on titles as distinct from headlines.** SERP titles, social titles, and video titles were not treated as separate problems by any source.
- **No controlled CTA evidence.** Every figure is vendor-reported without method.
- **Emotion material was collected but is thin on mechanism.** 240 passages extracted; the substance is largely research-method advice, not craft rules. Talia Wolf's contribution is procedural, which is to interview five to seven customers for fifteen to twenty minutes and mine the language, rather than a theory of which emotions to use.

## Highest-value items for Agora

1. The search-paste competitor test. Operational, checkable, better than the current judgment-based competitor-swap test.
2. The orientation-versus-taxonomy distinction. Fixes a real overreach in the current `Reject flat or synthetic drafts` list.
3. The pending-approval CTA case. The best available demonstration of the CTA-destination test.
4. Falsifiability as the abstraction test. "Write a sentence that could be false" is a sharper instruction than "prefer concrete language".
5. The internal-boredom warning. Prevents Agora from treating staleness-to-the-author as a defect.
