# Agora YouTube craft mining prompt

Paste this into a fresh session after `/clear`. It is self-contained. Working directory should be `C:\Users\mail\Workspaces\TheBunker` so the transcript tooling resolves.

Expect a long run. Let it work in batches.

---

```text
Mine YouTube for copywriting and marketing-writing craft, then turn it into
graded reference material for the Agora skill.

CONTEXT YOU NEED

Agora is a marketing-copy skill at C:\Users\mail\Workspaces\Agora-Marketing-Skill.
Read these two files first, in this order, and do not skip them:
  research/00-DIAGNOSIS.md      the gap analysis this work is fixing
  skills/agora/SKILL.md         the operating contract you are extending

Do not read references/agora-marketing.md end to end. Grep it for headings when
you need to check whether something is already covered.

The four gaps this mining run targets:
  1. No headline or title craft at all.
  2. No model of the curse of knowledge, so methodology labels and internal
     process names leak into customer-facing copy.
  3. CTA guidance that permits artifact-naming instead of outcome-naming.
  4. No prosody, rhythm, or exemplar corpus.

Agora has a hard truth constraint: it may never state a claim it cannot support.
That constraint applies to this mining run too. Practitioner assertions from
YouTube are evidence of practice, not evidence of effect. Grade accordingly and
never promote an ungraded assertion into doctrine.

TOOLING, VERIFIED WORKING

Search YouTube:
  python -m yt_dlp --flat-playlist --dump-json --playlist-end 12 "ytsearch12:QUERY"
Each JSON line has title, channel, duration, url, view_count. Filter before
fetching anything.

Fetch a transcript:
  node .bunker/skills/bunkeros/transcript/transcript.js --save .tmp/agora-mine/SLUG.txt "URL"
Always use --save. Never let a transcript print into context. A one-hour talk is
40k to 60k characters and will blow the window. Save, then Read the file.

Create .tmp/agora-mine/ first. It is gitignored scratch.

SOURCE SELECTION

Quality filter matters more than volume here. YouTube marketing content is
mostly people selling courses about selling courses. Apply these gates:

  KEEP if the speaker has a verifiable track record: they wrote controls that
  ran, they run a company whose copy you can inspect, they publish test data,
  they hold a research or practitioner position, or they are presenting at a
  conference with a review process.

  KEEP conference talks, teardowns of real pages, and recorded workshops over
  talking-head advice videos.

  KEEP anything where the speaker shows the before and after copy on screen and
  explains the reasoning. Those are the highest value per minute in this run.

  DROP anything with a thumbnail promising an income figure, anything under six
  minutes, anything that is a listicle read aloud, anything that is primarily an
  ad for a course, and anything where the transcript is auto-generated from
  heavily accented audio with obvious garbling.

  DROP AI-generated channel content. You will encounter a lot of it. Tells: no
  named speaker, synthetic narration, stock footage, generic channel name.

Start from these people and organizations, then expand from what they cite and
who they appear with. Search each by name plus a topic term:

  Positioning and vocabulary:      April Dunford, Bob Moesta, Chris Do
  Direct response craft:           Joanna Wiebe, Eddie Shleyner, Stefan Georgi,
                                   Justin Goff, Kyle Milligan, Neville Medhora,
                                   Jim Edwards
  Evidence-driven optimization:    Peep Laja, CXL, Momoko Price, Talia Wolf
  Emotional targeting:             Talia Wolf, Bob Moesta
  Brand and short copy:            Harry Dry, Marketing Examples, Dave Gerhardt
  Offer construction:              Alex Hormozi
  UX and microcopy:                Nielsen Norman Group, Torrey Podmajersky,
                                   Kinneret Yifrah, Jared Spool
  Conference channels:             CXL Live, Call to Action Conference,
                                   Business of Software, MicroConf, SaaStr,
                                   Google I/O and Config for UX writing sessions

Run at least these searches, plus any you derive:

  "headline formula teardown copywriting"
  "landing page teardown copy critique"
  "how to write a headline that converts"
  "value proposition workshop"
  "positioning workshop April Dunford"
  "jobs to be done interview demand"
  "voice of customer research copywriting"
  "message testing copy research"
  "call to action button copy test results"
  "microcopy UX writing conference talk"
  "why your copy sounds like everyone else"
  "stop using jargon marketing"
  "explain your product to non technical buyer"
  "emotional targeting conversion"
  "storytelling in sales copy workshop"
  "sales page structure breakdown"
  "cold email teardown b2b"
  "email subject line testing results"
  "writing for skimmers web writing"
  "copywriting rhythm read aloud sentence"
  "conversion copywriting research process"
  "product marketing narrative talk"

PER-VIDEO EXTRACTION

For each kept video, write one YAML file to
C:\Users\mail\Workspaces\Agora-Marketing-Skill\research\mined\<slug>.yaml
with this schema. Do not deviate from it, because these files get merged later.

  source:
    url:
    video_id:
    title:
    channel:
    speaker:            # actual person, not channel name
    published:
    duration_min:
    credibility_basis:  # one line: why this person's claims are worth recording
    tier:               # practitioner_with_record | researcher | conference_talk | unverified

  topics: []            # from: headlines, vocabulary, cta, staging, emotion,
                        # rhythm, structure, research_method, offer, positioning

  claims:
    - claim:            # one sentence, stated as a rule
      type:             # principle | heuristic | anecdote | test_result | process
      quote:            # verbatim, under 40 words, from the transcript
      timestamp:        # approximate mm:ss if derivable
      evidence_basis:   # what the speaker offers as support, verbatim if given
      grade:            # A B C D using the Agora scale, see below
      applies_to:       # surfaces and modes from Agora: POSITION SELL INVEST
                        # INFORM TRANSACT, and surface types
      boundary:         # when the speaker says it fails, or "not stated"
      conflicts_with:   # slug#claim-index of any contradicting claim found

  exemplars:
    - before:           # the weak copy shown or quoted
      after:            # the revised copy
      reasoning:        # the speaker's stated reason for the change
      verbatim:         # true if quoted exactly from the transcript
      real_company:     # name if identifiable, else null

  discard_notes:        # anything you deliberately did not record and why

GRADING SCALE, same as the deep research prompts:
  A  Multiple controlled studies, meta-analysis, or large replicated field data.
  B  One controlled study, or one large-scale documented field test with method.
  C  Practitioner consensus with named practitioners and documented results.
  D  Widely repeated, no traceable primary source.

Most YouTube claims will be C or D. That is expected and it is fine. The value is
in the exemplars and the process descriptions, not in the assertions. Record the
D-grade material anyway, because knowing what the field repeats without evidence
is directly useful.

SYNTHESIS

After the mining pass, produce these three files.

1. research/craft-findings.md
   Organized by the four target gaps, not by source. Under each gap:
   - the rules that survived grading, with grade and source attribution
   - direct contradictions between credible sources, stated as contradictions
     and not resolved by picking a favorite
   - what the mining found that the diagnosis did not anticipate
   - what the mining did not find, which tells us what the deep research prompts
     still have to carry

2. research/exemplar-corpus.md
   The before-and-after pairs, deduplicated and organized by surface: hero,
   subhead, body, CTA, email subject, cold email, paywall, product page,
   comparison, company description, video title, section heading.
   For each pair record the source and whether it is verbatim.
   Mark any pair involving a real company clearly. Agora may quote these as
   attributed structure. It may never restate a real company's results as fact,
   and it may never reuse their copy. Put that warning at the top of the file.

3. research/folklore-ledger-yt.md
   Every D-graded claim, with how often it recurred and which speakers repeated
   it. This merges later with the deep research folklore appendices into a block
   list. Nothing in this file may enter Agora as a rule.

VOLUME AND PACING

Target 40 to 60 videos in the first pass. Prioritize breadth across the four
gaps over depth on any one speaker: three videos per speaker is plenty, and a
teardown beats a keynote.

Work in batches of eight to ten videos. After each batch, write the YAML files,
then continue. Do not hold ten transcripts in context at once.

If a transcript fetch fails, record the url in research/mined/_failed.txt with
the error and move on. Do not retry more than twice.

OUTPUT CONSTRAINTS

Do not use the em dash character (U+2014) in any file you write. The Agora repo
hard-bans it and these files feed that repo.
Do not use curly quotes.
No emojis.

WHEN DONE

Report: videos searched, videos kept, videos dropped and the dominant reason,
claims recorded by grade, exemplar pairs captured, and the three highest-value
findings for each of the four gaps.

Give me a file link and the folder path for each of the three synthesis files.
```

---

## Notes for the operator

- The run is I/O heavy and cheap on tokens if `--save` discipline holds. The main risk is a transcript printing into context.
- `research/mined/` will hold 40 to 60 small YAML files. Keep them: the merge into `agora-craft.md` is a separate pass and will want to re-read them.
- Run this **after** at least prompts 1, 2, and 3 from `deep-research-prompts.md` come back. The mining pass is better at exemplars than at evidence, and knowing what the research already established stops it from recording folklore as discovery.
