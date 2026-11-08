# Source map - learn-ai-customer-support-with-phoebe

Internal build document. Every number a page quotes must appear here with its tier, or be printed by
a bench. Compiled 2026-11-09. Hyphens only.

**Tiers.** [S] read at source on 2026-11-09 (the sentence was on the page). [R] reported: read only
where another outlet quotes it, so it is taught as "reported". [C] constructed for the Quayside
example, labelled "Constructed Quayside example" on every page. [M] computed by a bench in the
browser and by `materials/acs_reference.py` (they agree on 208 values; `compare-ladder.py` also
catches a planted 0.1% fault).

**Fast-moving:** vendor pricing and resolution definitions (Intercom, Zendesk, Salesforce) changed
during 2025-2026. Re-verify the changelog before delivery.

## The question across all six sessions

The vendor says the bot deflects. How many customers actually got their problem solved, at what
cost, and who caught the ones it failed?

## Running case [C]

**Quayside**, a constructed digital bank: about 180,000 customers, 24 support agents, about 14,000
contacts a month across chat (70%) and email (30%). Running artifact: **Quayside's support operating
plan**, one page that grows each session:

| Session | Section added to the plan |
|---|---|
| 1 | The metric definition (true resolution, repeat contact within 7 days, false containment) |
| 2 | The automate / assist / human map |
| 3 | The assist rules |
| 4 | The hand-off rules (triggers, context packet) |
| 5 | The QA plan (sample, rubric, judge, CSAT caveat) |
| 6 | Staffing and cost plan, then the memo |

Quayside's "7 days" repeat window is a Quayside choice [C]; there is no standard window (SQM: 1 to 30
days, see facts). Never Phoebe's employers, clients or projects.

## Per-session coverage

### 1. Deflection is not resolution (green)
Containment, deflection, resolution, repeat contact, false containment. Why vendor dashboards report
containment (Intercom bills an "assumed resolution" when the customer leaves without asking for more;
Zendesk now separates "contained" from "verified"). Build-along: compute Quayside's true resolution
from a constructed 20-row contact log. Links agent-launch b5 for the launch gate.

### 2. Triage: read the message before anyone answers (yellow)
Intent, urgency, risk; the automate / assist / human map (volume x risk x answerability). Playground:
real Banking77 messages, real in-browser classifier, presets and confidence gate, break button.

### 3. Draft with the agent, not instead of them (yellow)
Agent assist vs customer-facing bot. Brynjolfsson, Li and Raymond (both versions). Grounding on the
help centre (link rag b7, ship-internal-assistant b4). Assist rules. Scorecard 1 (forgiving).

### 4. The hand-off: let go before the loop (orange)
Triggers (intent, sentiment, repeated failure, regulated topics), the context packet, the bot loop.
Moffatt v. Air Canada. Phone hand-off links voice s6.

### 5. The quality bar: QA you can trust (orange)
Sampling, auto-QA with an LLM judge (link evals b5, agent-launch b4), CSAT non-response bias, one
rubric for bot and humans. Klarna taught as a disagreement.

### 6. The support plan: price it on the bench (red)
Lever simulator: Erlang C at 80/20, true-resolution funnel, cost per resolved contact,
false-containment cost. Gartner forecasts as context. Capstone memo. Scorecard 2 (strict).

## Verified facts

### Generative AI at Work (Brynjolfsson, Li, Raymond) - three versions, cite the one you quote
- [S] NBER WP 31161 (April 2023, revised November 2023, DOI 10.3386/w31161), abstract: "Access to the
  tool increases productivity, as measured by issues resolved per hour, by 14% on average, including a
  34% improvement for novice and low-skilled workers but with minimal impact on experienced and highly
  skilled workers." Data from 5,179 customer support agents. Also: "AI assistance improves customer
  sentiment, increases employee retention, and may lead to worker learning."
- [S] QJE 2025, vol. 140(2), pp. 889-942, DOI 10.1093/qje/qjae044 (abstract via the Crossref record;
  the OUP page returned 403): 5,172 agents; "by 15% on average, with substantial heterogeneity across
  workers." "Less experienced and lower-skilled workers improve both the speed and quality of their
  output, while the most experienced and highest-skilled workers see small gains in speed and small
  declines in quality." "customers are more polite and less likely to ask to speak to a manager."
  "the gains from AI adoption are largest for moderately rare problems".
- [S] arXiv v2 body (2304.11771v2): low-skill "approximate increase of 30%"; setting "a Fortune 500
  software firm that provides business process software"; most agents "work from offices located in
  the Philippines"; attrition fell, "driven by the retention of newer workers".
- **Teach:** 14% (NBER 2023) and 15% (QJE 2025) average; the 34% novice figure is the NBER version
  only (the QJE-era text says about 30%); for the most skilled, "minimal impact" (NBER) became "small
  gains in speed and small declines in quality" (QJE). This was AGENT ASSIST (the tool suggests, the
  human sends), not a customer-facing bot. The simulator caps assist uplift at 14%.

### Moffatt v. Air Canada, 2024 BCCRT 149 [S, read in full on decisions.civilresolutionbc.ca]
- Issued February 14, 2024; Tribunal Member Christopher C. Rivers; small claims.
- The chatbot said: "If you need to travel immediately or have already travelled and would like to
  submit your ticket for a reduced bereavement rate, kindly do so within 90 days of the date your
  ticket was issued".
- Para 27: "In effect, Air Canada suggests the chatbot is a separate legal entity that is responsible
  for its own actions. This is a remarkable submission." "It should be obvious to Air Canada that it is
  responsible for all the information on its website. It makes no difference whether the information
  comes from a static page or a chatbot."
- Negligent misrepresentation: "I find Air Canada did not take reasonable care to ensure its chatbot
  was accurate."
- Claimed $880; awarded $812.02 total = $650.88 damages + $36.14 pre-judgment interest + $125 CRT
  fees (Canadian dollars; the decision does not print the currency).
- A small-claims tribunal decision in British Columbia: persuasive, not binding precedent elsewhere.
  Say so.

### Erlang C and service level [S]
- ITU-D Teletraffic Engineering Handbook (ITU-D SG 2/16 and ITC, ed. Villy B. Iversen, draft
  2001-06-20), section 12.2.1 eq. (12.6): Erlang's C formula, the probability that an arriving
  customer waits; eq. (12.34): P(wait <= t) = 1 - E2,n(A) x e^(-(n - A) t / s), s = mean service time.
  "The formula has several names: Erlang's C-formula, Erlang's second formula, or Erlang's formula for
  waiting time systems."
- Ger Koole, Call Center Optimization (MG Books 2013, free first chapters): 80/20 means "the minimal
  number of agents required to answer 80% of the calls within 20 seconds." Limitation: "some calls,
  while waiting for service in queue, abandon" is "not part of the Erlang C model"; Koole's
  abandonment model is "Erlang X". [R] the academic name Erlang A (Garnett, Mandelbaum, Reiman 2002)
  was not read at source.
- Koole's worked example [S]: 100 calls per quarter hour, AHT 3:30, 24 agents - Erlang C predicts only
  about 21% wait less than 20 seconds; 28 agents reach 80%. (Use to show how steep the curve is.)
- **Teach:** chat is staffed as one-at-a-time here (no concurrency); concurrency and abandonment both
  move the number, and the widget says so.

### Banking77 [S]
- GitHub README: train 10,003, test 3,080, 77 intents; "Dataset composed of online banking queries
  annotated with their corresponding intents." Hugging Face card: "13,083 customer service queries
  labeled with 77 intents." Licence: CC BY 4.0 (repo LICENSE file, and the HF card).
- Citation: Casanueva, Temcinas, Gerz, Henderson, Vulic (2020), "Efficient Intent Detection with Dual
  Sentence Encoders", Proceedings of the 2nd Workshop on NLP for ConvAI - ACL 2020, arXiv:2003.04807.
- Modified for the playground: 24 train + 8 test rows per intent, seed 20261109; queue mapping and
  Quayside risk tiers are ours.

### Vendor definitions [S unless marked]
- **Intercom** pricing page: "Fin is priced at $0.99 per outcome." Counts when "A customer confirms
  their issue is resolved", "They don't ask for more help after Fin responds", or "Fin completes a
  workflow (Procedure), including handoffs". Help centre: a resolution is counted when, after Fin's
  last answer, the customer confirms "or exits the conversation without requesting further assistance
  (assumed resolution)." Reopen: "that resolution will be deducted and not charged". No hour window is
  stated by Intercom ("24 hours" appears only on community and third-party pages [R], do not cite).
- **Zendesk**: older platform counts an automated resolution "after 72 hours of inactivity" if the AI
  agent gave a generative reply, the user gave "positive feedback or no feedback", no human responded,
  and "The AI evaluation process confirmed that the AI agent's response was relevant." Resolution tiers
  "introduced on May 18, 2026": **Contained** ("handled the interaction to completion without the
  customer requesting further assistance", "does not count against your resolution allowance"),
  **Verified** ("successfully resolved", an LLM "evaluates the text of the conversation to confirm that
  the customer's request was satisfactorily resolved"), **Assisted escalation** (not billed). Windows:
  email 72 hours after the first email; messaging 2 hours by default (up to 72); voice at hang-up. Only
  Verified draws on the allowance, by elimination (the page marks the other two as not counting).
- **Salesforce Agentforce** pricing page: "$2" "Per conversation"; Flex Credits "$500" per 100k credits;
  15 May 2025 release: "One Agentforce action consumes 20 Flex Credits ($0.10 USD)". No Salesforce
  definition of a conversation, containment or deflection could be read [not used].
- **Kaizo** (support-QA vendor blog, 2026): "Containment counts the absence of a human, not the
  presence of a resolution" and "A customer who gave up, abandoned the chat or left with a wrong answer
  is counted as contained". A vendor blog, used as a quotable line only.

### Klarna - teach as a disagreement
- [S] Press release, 27 Feb 2024: 2.3 million conversations, "two-thirds of Klarna's customer service
  chats"; "the equivalent work of 700 full-time agents" (a workload estimate, not a headcount); "on par
  with human agents in regard to customer satisfaction score"; "a 25% drop in repeat inquiries";
  "less than 2 mins compared to 11 mins previously"; "estimated to drive a $40 million USD in profit
  improvement to Klarna in 2024" (an estimate); 23 markets, more than 35 languages.
- [R] May 2025 (Bloomberg, 403; quoted by CX Dive 9 May 2025): CEO Sebastian Siemiatkowski, "As cost
  unfortunately seems to have been a too predominant evaluation factor when organizing this, what you
  end up having is lower quality"; "there will be always a human if you want"; "Really investing in the
  quality of the human support is the way of the future for us"; an "Uber type of setup" (Maginative).
- [S, as given to CX Dive] Spokesperson Clare Nordstrom: "The chatbot still handles two-thirds of all
  customer inquiries."; "AI gives us speed. Talent gives us empathy."; the strategy "will now evolve to
  the next level."
- [R] Q3 2025 earnings call via CX Dive (20 Nov 2025): the assistant "can now do the work of more than
  853 full-time agents"; "$60 million" saved.
- Do NOT use "very much still AI-first" (never found on a page).
- **Teach:** both sides; the disagreement is about what "the work of 700 agents" measured, and the 25%
  repeat-inquiry figure is the one number in the release that speaks to resolution, not containment.

### Gartner [S, read on Gartner's mirror host; cite www.gartner.com]
- 9 July 2024: "Sixty-four percent of customers would prefer that companies didn't use artificial
  intelligence (AI) in their customer service"; survey of 5,728 customers, December 2023; "53% of
  customers would consider switching to a competitor if they found out a company was going to use AI
  for customer service"; top concern "it will get more difficult reaching a person". (The 60% / 46% /
  42% concern shares are in an image only [R], not used.)
- 5 March 2025 (a prediction): "By 2029, agentic AI will autonomously resolve 80% of common customer
  service issues without human intervention, leading to a 30% reduction in operational costs".
- 10 June 2025 (a prediction): "By 2027, 50% of organizations that expected to significantly reduce
  their customer service workforce will abandon these plans"; "many companies struggle to achieve
  their 'agent-less' staffing goals"; "digital first, but not digital only".
- Teach predictions as predictions, never as findings.

### CSAT non-response
- [S] Tyser et al., BMC Health Services Research 2016;16:350 (Press Ganey medical practice survey):
  "The survey response rate was 16.5 %" and the survey "exhibited non-response bias"; response odds
  varied by "age, sex, insurance type, and orthopaedic subspecialty". Shows WHO answers differs; does
  not measure non-respondents' satisfaction. Healthcare, not support: say so.
- [S, preprint, not peer reviewed] Hong and Potteiger, "Dimensionality in Satisfaction Ratings",
  arXiv:2607.11026 (July 2026): "a full-census 2.91 against the surveyed 3.62 on a five-point scale";
  the 2.91 is an LLM estimate over about 9,000 conversations at one firm. Teach as suggestive only.

### Repeat contact / FCR [S]
- SQM Group: internal FCR "is based on whether the customer called back for the same issue within 1 to
  30 days" and "there is no standard for internal FCR measurement". Call Centre Helper poll: "the most
  common method of measuring FCR was to track repeat contacts within a given timeframe".

## Bench canon [M] (node = python, 2026-11-09)

### Playground (session 2): 616 test messages, classifier trained on 1,848
- Classifier: **481 of 616 right (78.1%)**. Per queue: Fraud and loss 48/56, Cards 127/160, Transfers
  61/88, Top-ups and cash 94/136, Payments and fees 86/104, Account and identity 65/72.
- Constructed Quayside tiers: 36 automate, 29 assist, 12 human intents; safe (automate-tier) messages
  are 46.8% of the balanced sample.

| Preset | Automated | Coverage | Wrong intent | % of bot answers wrong | Risky kept from a person | Safe stranded |
|---|---|---|---|---|---|---|
| Automate nothing | 0 | 0.0% | 0 | - | 0 | 0 |
| Automate everything | 616 | 100.0% | 135 | 21.9% | 96 | 0 |
| Automate the busiest 20 | 151 | 24.5% | 34 | 22.5% | 37 | 24 |
| Risk-first map | 296 | 48.1% | 62 | 20.9% | 4 | 14 |
| Risk-first + gate 0.40 | 209 | 33.9% | 29 | 13.9% | 2 | 88 |
| Break: shuffled labels, gate 0.40 | 31 | 5.0% | 31 | 100.0% | 5 | 269 |

- Shuffled-label classifier: 3 of 616 right.
- Busiest 20 by train volume includes five human-tier intents: card payment not recognised, cash
  withdrawal not recognised, direct debit payment not recognised, transaction charged twice, wrong
  amount of cash received.
- Gate scan (risk-first map): 0.30 -> 42.9% coverage, 17.4% wrong; 0.35 -> 39.3%, 15.7%; 0.40 ->
  33.9%, 13.9%; 0.45 -> 24.0%, 11.5%; 0.50 -> 17.9%, 12.7%.
- Top confusions (truth -> predicted): top up reverted -> top up failed (3); activate my card -> card
  about to expire (2); balance not updated after bank transfer -> transfer timing (2); declined cash
  withdrawal -> declined transfer (2); declined cash withdrawal -> pending cash withdrawal (2); get
  disposable virtual card -> getting virtual card (2).

### Simulator (session 6), all inputs constructed
Fixed: 14,000 contacts/month, 70% chat, 30 days x 12 open hours, intraday profile
.05/.07/.09/.10/.10/.09/.08/.08/.09/.09/.09/.07, chat AHT 7.5 min, email 8 min, 80/20, 112 productive
hours per agent-month (160 paid, 30% shrinkage), $4,500 per agent-month, 60% of falsely contained
customers return at 1.5x handle time, the other 40% never return and 15% of those leave ($120 annual
margin), the bot resolves 35% of what it takes beyond the safe 35% of volume.

| Rung | auto | true res | catch | uplift | price | Agents | Peak seats | Falsely contained | Never return | Vendor-reported res | True bot res | Monthly cost | Cost per resolved | All-in | False-containment cost |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Today | 0 | - | 0 | 0 | .99 | 24 | 7 | 0 | 0 | - | - | $108,000 | $7.71 | $7.71 | $0 |
| Vendor pitch | 70% | 85% | 0 | 0 | .99 | 16 | 5 | 3,920 | 1,568 | 100.0% | 60.0% | $81,702 | $6.57 | $8.84 | $50,178 |
| Assist only | 0 | - | 0 | 14% | .99 | 23 | 6 | 0 | 0 | - | - | $103,500 | $7.39 | $7.39 | $0 |
| Automate the safe third | 35% | 85% | 0 | 0 | .99 | 19 | 5 | 735 | 294 | 100.0% | 85.0% | $90,351 | $6.59 | $6.98 | $9,408 |
| + hand-off | 35% | 85% | 70% | 0 | .99 | 19 | 5 | 221 | 88 | 89.5% | 85.0% | $90,351 | $6.49 | $6.61 | $2,823 |
| The plan | 35% | 85% | 70% | 14% | .99 | 18 | 5 | 221 | 88 | 89.5% | 85.0% | $85,851 | $6.17 | $6.29 | $2,698 |
| Push to 90% | 90% | 85% | 70% | 14% | .99 | 14 | 4 | 1,722 | 689 | 68.1% | 54.4% | $75,474 | $5.67 | $6.60 | $21,067 |
| Same plan at $2 | 35% | 85% | 70% | 14% | 2.00 | 18 | 5 | 221 | 88 | 89.5% | 85.0% | $90,800 | $6.53 | $6.64 | $2,920 |

Rounding: both engines round half away from zero (rnd()), so the plan's 220.5 falsely contained prints as 221.
Erlang check: the bench formula reproduces Koole's worked example (100 calls per quarter hour, AHT 3:30): 24 agents 20.6% within 20 s (Koole: "only around 21%"), 25: 44.6, 26: 62.0, 27: 74.4, 28: 83.0 (Koole: 28 reach 80%), 29: 89.0, 30: 93.0.

Reading the ladder: the vendor pitch cuts agents from 24 to 16 and reports 100% resolution, while the
true bot resolution is 60.0% and, counting customers lost, each resolved contact costs $8.84 against
$7.71 today: a WORSE plan. Pushing to 90% has the lowest operating cost ($5.67) and a worse all-in cost
than the plan ($6.60 vs $6.29), with 1,722 customers a month told they were done.

## Seams (absolute links, never reteach)

| Sibling | They own | We link from |
|---|---|---|
| https://phoebefu6.github.io/learn-agent-launch-with-phoebe/courses/b5-gate-the-chatbot.html | the launch gate: containment vs resolution as eval criteria, pricing resolution clauses | s1 |
| https://phoebefu6.github.io/learn-agent-launch-with-phoebe/courses/b4-llm-as-judge.html | LLM-as-judge as an instrument | s5 |
| https://phoebefu6.github.io/learn-voice-multimodal-agents-with-phoebe/courses/06-shipping-the-call.html | phone hand-off, consent notices, cost per minute | s4 |
| https://phoebefu6.github.io/learn-llm-inference-with-phoebe/courses/01-where-the-money-goes.html and 02-routing.html | cost per request; routing between MODELS | s2, s6 |
| https://phoebefu6.github.io/learn-ship-internal-ai-assistant-with-phoebe/courses/b3-golden-questions.html and b4-grounded-answers.html | internal helpdesk build, golden questions, grounding | s3 |
| https://phoebefu6.github.io/learn-rag-with-phoebe/courses/b7-grounding-citations.html | grounding and citations | s3 |
| https://phoebefu6.github.io/learn-ai-evals-with-phoebe/courses/b2-golden-set.html and b5-llm-as-judge.html | golden sets, judge mechanics | s5 |
| https://phoebefu6.github.io/learn-customer-retention-with-phoebe/courses/a7-churn-prediction.html | churn models, CLV | s1, s6 (the churn line is a constructed placeholder) |

## Not covered (honest list)
- Building a bot or a retrieval pipeline (see ship-internal-assistant, rag).
- Phone channel staffing, IVR, call routing, warm transfer on a call (voice s6).
- Chat concurrency (one agent on several chats) and abandonment (Erlang X / Erlang A) in the
  staffing model; both are named on the widget as limits.
- Outbound and sales replies (ai-sales). Churn modelling and CLV (customer-retention).
- Vendor walkthroughs: Self-study only; no vendor account is needed for any build-along.
- Any certificate: none offered here.
- Banking-specific regulation (complaints handling rules, financial ombudsman timelines) by
  jurisdiction: named as a hand-off trigger category, not taught.

## Citation appendix
1. Brynjolfsson E., Li D., Raymond L. (2025). Generative AI at Work. The Quarterly Journal of
   Economics 140(2): 889-942. https://doi.org/10.1093/qje/qjae044 . NBER Working Paper 31161 (2023),
   https://www.nber.org/papers/w31161 . arXiv:2304.11771.
2. Moffatt v. Air Canada, 2024 BCCRT 149 (Feb 14, 2024).
   https://decisions.civilresolutionbc.ca/crt/crtd/en/item/525448/index.do
3. Iversen V.B. (ed.), Teletraffic Engineering Handbook, ITU-D SG 2/16 and ITC (2001 draft), ch. 12.
   https://www.itu.int/dms_pub/itu-d/opb/stg/D-STG-SG02.16.1-2001-PDF-E.pdf
4. Koole G., Call Center Optimization (MG Books 2013), first chapters.
   https://www.gerkoole.com/CCO/downloads/CCO_Koole_first_chapters.pdf
5. Casanueva I., Temcinas T., Gerz D., Henderson M., Vulic I. (2020). Efficient Intent Detection with
   Dual Sentence Encoders. 2nd Workshop on NLP for ConvAI - ACL 2020. arXiv:2003.04807. Data:
   https://github.com/PolyAI-LDN/task-specific-datasets (CC BY 4.0).
6. Intercom pricing https://www.intercom.com/pricing and Fin outcomes
   https://www.intercom.com/help/en/articles/8205718-fin-ai-agent-outcomes
7. Zendesk, About automated resolution tiers
   https://support.zendesk.com/hc/en-us/articles/9570369117338-About-automated-resolution-tiers and
   prior platform https://support.zendesk.com/hc/en-us/articles/5352026794010-About-the-automated-resolutions-platform-prior-to-resolution-tiers
8. Salesforce Agentforce pricing https://www.salesforce.com/agentforce/pricing/ ; Flex Credits release
   https://www.salesforce.com/news/press-releases/2025/05/15/agentforce-flexible-pricing-news/
9. Klarna press release (27 Feb 2024)
   https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/
10. CX Dive (9 May 2025) https://www.customerexperiencedive.com/news/klarna-reinvests-human-talent-customer-service-AI-chatbot/747586/ ;
    CX Dive (20 Nov 2025) https://www.customerexperiencedive.com/news/klarna-says-ai-agent-work-853-employees/805987/ ;
    Maginative (8 May 2025) https://www.maginative.com/article/klarna-dials-back-its-ai-customer-service-strategy-now-its-hiring-humans-again/
11. Gartner newsroom: 2024-07-09 (64%), 2025-03-05 (80% by 2029), 2025-06-10 (50% abandon by 2027),
    https://www.gartner.com/en/newsroom/press-releases/2024-07-09-gartner-survey-finds-64-percent-of-customers-would-prefer-that-companies-didnt-use-ai-for-customer-service ;
    https://www.gartner.com/en/newsroom/press-releases/2025-03-05-gartner-predicts-agentic-ai-will-autonomously-resolve-80-percent-of-common-customer-service-issues-without-human-intervention-by-20290 ;
    https://www.gartner.com/en/newsroom/press-releases/2025-06-10-gartner-predicts-50-percent-of-organizations-will-abandon-plans-to-reduce-customer-service-workforce-due-to-ai
12. Tyser A.R. et al. (2016). BMC Health Services Research 16:350. https://pmc.ncbi.nlm.nih.gov/articles/PMC4972948/
13. Hong and Potteiger (2026), arXiv:2607.11026 (preprint). https://arxiv.org/abs/2607.11026
14. SQM Group, Contact center FCR best practices. https://www.sqmgroup.com/resources/library/blog/contact-center-fcr-best-practices
15. Kaizo, What is containment rate (2026). https://kaizo.com/blog/what-is-containment-rate/
