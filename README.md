<!-- learn-with-phoebe hub banner -->
> ### 📚 Part of [**Learn with Phoebe**](https://phoebefu6.github.io/learn-with-phoebe/)
> The shelf of 191 free, hands-on courses on AI, data, and the craft around them. **[Browse every course ↗](https://phoebefu6.github.io/learn-with-phoebe/)**
<!-- /learn-with-phoebe hub banner -->

# Learn AI + Customer Support with Phoebe

Six 45-minute sessions, one track, for support and CX leads being sold a bot that "deflects 70
percent", and for the team leads and analysts who will run it. One question runs through all six:
how many customers actually got their problem solved, at what cost, and who caught the ones the bot
failed?

**Live:** https://phoebefu6.github.io/learn-ai-customer-support-with-phoebe/

## The sessions

| # | Session | What you leave with |
|---|---------|---------------------|
| 1 | Deflection is not resolution | A metric definition: containment 70 percent, true resolution 45 percent, from one contact log |
| 2 | Triage: read the message before anyone answers | An automate / assist / human map, tested on 616 real customer messages |
| 3 | Draft with the agent, not instead of them | Assist rules, built on both published versions of the strongest study |
| 4 | The hand-off: let go before the loop | Triggers, the context packet, and what Moffatt v. Air Canada means for a bot |
| 5 | The quality bar: QA you can trust | A weekly sample, one rubric for bot and people, a calibrated judge, CSAT with its response rate |
| 6 | The support plan: price it on the bench | Staffing and cost on Erlang C, and the plan memo |

The running case, Quayside, is a constructed digital bank. Every Quayside number is labelled as
constructed.

## What is computed for real

- **Session 2, the triage playground.** A TF-IDF nearest-centroid intent classifier trains in the
  browser on 1,848 Banking77 messages and triages 616 more (481 matched to the right intent). The
  "busiest 20 intents" plan keeps 37 risky messages from a person; a break button shuffles the
  training labels and the classifier drops to 3 of 616.
- **Session 6, the support-plan bench.** Erlang C and its service-level formula, hour by hour at
  80/20. It reproduces Ger Koole's published worked example (24 agents, about 21 percent answered
  within 20 seconds; 28 reach 80 percent). On constructed Quayside inputs, the vendor pitch needs 16
  agents instead of 24 and costs $8.84 per resolved contact against $7.71 today, once the customers
  it falsely contains are counted.

`materials/acs_reference.py` recomputes every bench number in Python; `materials/run-ladder.js`
runs the browser engine in node; `materials/compare-ladder.py` checks the two agree value by value
and proves it can catch a planted 0.1 percent fault.

## Data and licence

Customer messages: Banking77 by PolyAI, licensed CC BY 4.0
(https://github.com/PolyAI-LDN/task-specific-datasets). Citation: Casanueva, Temcinas, Gerz,
Henderson and Vulic (2020), "Efficient Intent Detection with Dual Sentence Encoders",
arXiv:2003.04807. Modified: 24 training and 8 test rows per intent sampled with a fixed seed
(`materials/build-acs-sample.py`); the six queues and Quayside's risk tiers are ours.

## Sources

Every quote and number carries its source and verification tier in
`materials/official-course-map.md`. Vendor prices and resolution definitions change often:
re-verify them before you rely on them.

by Phoebe Fu
