# Agent brief - shared by every fan-out page of learn-ai-customer-support-with-phoebe

You are writing ONE static HTML session page. No servers, no npm. **If your target file already
exists on disk, do not write it; report that and stop.** Write the file, return its path and one
line of coverage. No HTML in your reply.

## Read first, in this order

1. The template pages. Copy their structure, classes, SVG grammar and quiz markup EXACTLY,
   including 3 options per quiz question:
   - `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-ai-customer-support-with-phoebe/courses/01-deflection-is-not-resolution.html` (primary template)
   - `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-ai-customer-support-with-phoebe/courses/02-triage-before-anyone-answers.html` (rhythm, second example)
2. The source map: every verified number, its evidence tier, per-session coverage, the seams. Use
   ONLY its numbers; never invent a statistic; if a fact is missing, teach the uncertainty.
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-ai-customer-support-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block for the palette tokens (first 25 lines):
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-ai-customer-support-with-phoebe/assets/style.css`
4. The widget kit (markup contracts for .wipe, .hotspot, .tick, .tryrow, .stakes, .scorecard):
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-ai-customer-support-with-phoebe/materials/widget-kit.md`

## Page skeleton (keep every component)

toolbar (crumb EXACTLY `<a href="../index.html">learn-ai-customer-support-with-phoebe</a> / Session N of 6`, #toggle-all, #zoom-toggle) ·
masthead (eyebrow "Learn AI + Customer Support with Phoebe · Session N of 6", h1 with one
`<span class="accent">`, .sub, .chip-row with the level chip (🟡 for session 3, 🟠 for sessions 4
and 5), two .chip.audience, .chip.time "45 min", .agenda a1-a4 with flex 3/17/22/3) · main.wrap ·
section#intro (Part 0: kicker, .lede, .legend pills, .callout.win "★ What you walk out with tonight.", one open details.card) ·
3 Parts, each `section.section#part-N` with section-kicker (klabel "Part N · covers ...", h2,
`.tag.concept "N min live"`), a `.lede`, ONE figure, `details.card` accordions (summary: `.mode.live`
or `.mode.self`, title, `.mini`, `.caret ▶`), at least one `.callout.example` with `span.ex-pill`
"Real world" per Part · section#demo-1 Build-along (kicker `.tag.demo "★ 22 min · everyone builds"`, .lede, ONE figure,
`.steps > .step`, each step a `<p>` with optional `.prompt-box.good` carrying a `span.label` BELOW the p;
the build-along writes this session's section of Quayside's support operating plan, ending with a
prompt-box labelled "★ Plan section N · ...") · section#exercise Homework (ol, 4 items) · section#quiz (3 x
`.quiz-q data-answer="0-based"`, `p.qtext`, three `button.qopt` "A · ...", "B · ...", "C · ...",
`p.qwhy`; one `p.quiz-score` after the last; vary the correct letter) · section#official, h2 EXACTLY
"What this session teaches, and where it came from", `.covered > .covered-row` (pill solid ✓ / light ◐ +
name + note), then the `.mono` line EXACTLY "Every fact on this page, and its verification tier, is
recorded in the course's source map." · section.cheat#cheatsheet (h3 "Session N cheat sheet <span>· pin this</span>",
.grid-2 of six .cheat-item) · `.callout.next` with `.nx-pill` "Next session" (name the payoff of the
next session, not its topic) · footer.pagefoot · `<script src="../assets/app.js?v=1"></script>`.

Head: copy the template's social meta block with this page's own title/description/url;
`<title>Session N · <title> - learn ai customer support with phoebe</title>`;
`<link rel="stylesheet" href="../assets/style.css?v=1">`. Nothing else external.

First `details.card` in Part 0 is `open`; no other. Sentence case headings. Warm practitioner voice,
concrete, never dry. Inside prompt-boxes escape `&` `<` `>`. 450 to 650 lines is guidance about depth,
never a target. Use at least TWO widget-kit components per page (from .wipe, .tick, .stakes,
.hotspot, .tryrow); session 3 ALSO carries the one .scorecard (below).

## Hard rules (a violation is rework)

- NEVER an em dash or en dash, anywhere (prose, code, aria-labels, comments). Hyphen only.
- No meta text: never "this course", "in this course", "the course teaches", "banned here". State
  the professional norm directly with its reason. The two exact estate phrases above are the only
  self-references; "session 5" cross-references are fine.
- Attribution "by Phoebe Fu". Never "built with" a tool.
- Every number comes from the map or is labelled constructed. For constructed data print "your
  numbers will differ", never invented outputs as if run. Quayside is ALWAYS "Constructed Quayside
  example" or "constructed" where its numbers appear.
- Numbers from the two benches (session 2 playground, session 6 simulator) may be quoted ONLY exactly
  as they appear in the map's "Bench canon" tables, and named as coming from that session's bench.
- Contested or missing evidence: teach the disagreement; never resolve what the literature has not.
- Anything the map marks [R] is written as "reported" with the outlet named. Never use the phrase
  "very much still AI-first".
- NEVER "lottery" or "lotteries".
- Default to English words. No Chinese.
- Titles, widget ids and class names must not collide with siblings: no h1/h2 may reuse these sibling
  titles: "Gate the chatbot: no ground truth, so the outcome is the metric", "LLM-as-judge: an
  instrument, or just another opinion", "LLM-as-judge: an automated grader you can trust, carefully",
  "Shipping the call: phones, handoffs and consent", "Grounding and citations: answer from the sources,
  or not at all", "Grounded answers with citations", "Golden questions from the ticket log", "Building a
  golden set: the data your score depends on", "Read, draft, send", "The triage bench". No new ids
  starting `acs-` (the engine owns that prefix).
- Never name Phoebe's employers, clients or projects. Never use the names Larkline, Beacon, Callwell,
  Cadence, DataDesk, Kiln, Tidewell, Lanternfish, Recall, Harbourline, Linden as a case.

## Figure grammar (hand-drawn, every figure)

Palette, ONLY these hexes (no invented greys): ink `#0D1B33` · muted `#4E5A70` · accent `#0A4DBF` ·
accent-deep `#0A2E73` · accent-mid `#3E6FCE` · accent-soft `#B8CBEF` · accent-50 `#EDF2FC` · warm
contrast `#B8480C` · warm-50 `#FDF0E6` · faint `#CBD4E4` · hairline `#E0E6F1` · `#FFFFFF` · universal
reds `#991B1B` `#FEF2F2` `#FCA5A5` only for a wrong-way panel.

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="the data, not the
  shape">` > `<defs>` + `<style>` + content, then `<figcaption>🔍 Click to zoom - takeaway</figcaption>`.
  Grow H, never W.
- Prefix unique per figure, used for every class and id: `s<session><letter>` (s3a, s3b, s3c, s3d;
  s4a...; s5a...). Never reuse s1x or s2x.
- `<defs>` holds, with the figure prefix P: a wobble filter `id="PSk"`
  (`feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="<int>"` +
  `feDisplacementMap scale="2.4" xChannelSelector="R" yChannelSelector="G"`, `x="-3%" y="-3%"
  width="106%" height="106%"`), optionally a hachure pattern `id="PHc"` (7x7 userSpaceOnUse,
  rotate(-38), one accent line, opacity .5), and an open arrowhead `id="PAr"` (path `M1 1 L9 5 L1 9`,
  fill none, ink stroke 1.6). ALL shapes sit inside ONE `<g filter="url(#PSk)" fill="none"
  stroke="#0D1B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`; rects carry a
  tiny rotation (-4 to 4 degrees for hand-placed items, under 1 for panels). Fills: white, accent-50,
  the hachure for "the pile" or "the data", and the warm contrast ONLY for the one thing the figure is
  about. One doodle anchor per figure at most, simple strokes, never a mascot. Text classes: `.PH` 800
  12px ink heading · `.PL` 600 12px ink label · `.PS` 400 11px muted · `.PB` 800 11px `#B8480C` · `.PV`
  800 16-20px accent-deep value · `.PW` 800 12px white on an accent or warm fill · `.PA` 700 11px accent
  axis caption · `.PN` 400 12px muted note. Hand-stacked items must not overlap as painted rects (the
  gate flags a pile): never stack rects on top of each other.
- ALL `<text>` outside the filtered group, sans stack, never below 10.5px. No text inside the `<g>`.
- Fit: max chars ≈ (box width - 20) / 7 at 12px, 6.4px/char at 11px; full-width note under 110 chars;
  40px between neighbouring point labels; bottom note 22px below the last row, H clears it by 8px.
  No path, arrow, curve or gridline may cross any label (the gate flags line-through-text); route
  arrows around text. When in doubt, shorten.
- Floor: one figure per Part plus one in the build-along (4 per page). Draw the MECHANISM (the
  draft-review-send loop, the hand-off trigger firing and the context packet travelling, the QA
  sample flowing to a rubric and a judge), never a metaphor literally, never decoration.

## Voice and honesty

Every Part gets a real-world story from the map's cases (Brynjolfsson et al., Moffatt v. Air Canada,
Klarna both sides, Gartner, Zendesk / Intercom definitions, the Banking77 rows). Quayside is
constructed and says so. Never claim a vendor feature you did not find in the map.

## Cross-links (absolute URLs, link out, never reteach)

- Launch gate: https://phoebefu6.github.io/learn-agent-launch-with-phoebe/courses/b5-gate-the-chatbot.html
- Judge as instrument: https://phoebefu6.github.io/learn-agent-launch-with-phoebe/courses/b4-llm-as-judge.html
- Klarna at launch time: https://phoebefu6.github.io/learn-agent-launch-with-phoebe/courses/a1-why-bots-fail.html
- Phone hand-off: https://phoebefu6.github.io/learn-voice-multimodal-agents-with-phoebe/courses/06-shipping-the-call.html
- Grounding: https://phoebefu6.github.io/learn-rag-with-phoebe/courses/b7-grounding-citations.html and https://phoebefu6.github.io/learn-ship-internal-ai-assistant-with-phoebe/courses/b4-grounded-answers.html
- Golden questions from tickets: https://phoebefu6.github.io/learn-ship-internal-ai-assistant-with-phoebe/courses/b3-golden-questions.html
- Golden sets and judge mechanics: https://phoebefu6.github.io/learn-ai-evals-with-phoebe/courses/b2-golden-set.html and https://phoebefu6.github.io/learn-ai-evals-with-phoebe/courses/b5-llm-as-judge.html
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Footer chain and session titles

Footer left: `Session N of 6 · learn-ai-customer-support-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>`
Footer right: `<a href="PREV.html">← Prev: PREV TITLE</a> &nbsp;·&nbsp; <a href="NEXT.html">Next: NEXT TITLE →</a>`

Session titles (exact, h1 with the accent span shown in brackets):
1. 01-deflection-is-not-resolution.html · Deflection is not [resolution]
2. 02-triage-before-anyone-answers.html · Triage: read the message [before anyone answers]
3. 03-draft-with-the-agent.html · Draft with the agent, [not instead of them]
4. 04-the-hand-off.html · The hand-off: let go [before the loop]
5. 05-qa-you-can-trust.html · The quality bar: [QA you can trust]
6. 06-price-the-support-plan.html · The support plan: [price it on the bench]
