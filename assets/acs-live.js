/* ============================================================
   acs-live.js - learn-ai-customer-support-with-phoebe
   Two benches, computed for real in your browser.

   1. TRIAGE PLAYGROUND (session 2). A real TF-IDF nearest-centroid
      intent classifier is trained on 1,848 real Banking77 messages
      (assets/acs-sample.js) and run on 616 more. You tag each intent
      automate / assist / human and add a confidence gate; the page
      counts what the bot would have answered, what it got wrong and
      which risky messages it would have kept from a person.
      REAL: the rows, the classifier, every count.
      CONSTRUCTED: Quayside's risk tier per intent.

   2. SUPPORT-PLAN SIMULATOR (session 6). Erlang C staffing (the real
      formula, ITU-D Teletraffic Engineering Handbook eq. 12.6 and
      12.34) at an 80/20 service level, the true-resolution funnel,
      cost per resolved contact and customers falsely contained.
      REAL: the queueing arithmetic.
      CONSTRUCTED: every Quayside volume, time, cost and rate.

   materials/acs_reference.py recomputes every number in Python, in
   the same order, and materials/compare-ladder.py checks they agree.
   ============================================================ */
(function () {
  "use strict";

  /* ------------------------------------------------ shared helpers */
  function rnd(x, d) {
    d = d || 0;
    var p = Math.pow(10, d);
    var v = Math.floor(Math.abs(x) * p + 0.5) / p;
    return x < 0 ? -v : v;
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
      t = (t ^ ((t + (Math.imul(t ^ (t >>> 7), t | 61) >>> 0)) >>> 0)) >>> 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffled(labels, seed) {
    var y = labels.slice(), nxt = mulberry32(seed);
    for (var i = y.length - 1; i > 0; i--) {
      var j = Math.floor(nxt() * (i + 1));
      var tmp = y[i]; y[i] = y[j]; y[j] = tmp;
    }
    return y;
  }

  /* ------------------------------------------------ the classifier */
  function tokens(text) { return String(text).toLowerCase().match(/[a-z0-9]+/g) || []; }

  function counts(text, vocab, grow) {
    var c = new Map(), tk = tokens(text);
    for (var i = 0; i < tk.length; i++) {
      var t = tk[i];
      if (!vocab.has(t)) { if (!grow) continue; vocab.set(t, vocab.size); }
      c.set(t, (c.get(t) || 0) + 1);
    }
    return c;
  }

  function weights(c, vocab, idf) {
    var w = [];
    c.forEach(function (n, t) { var id = vocab.get(t); w.push([id, n * idf[id]]); });
    return w;
  }

  function train(texts, y, nClass) {
    var vocab = new Map();
    var docs = texts.map(function (t) { return counts(t, vocab, true); });
    var n = docs.length, V = vocab.size, df = new Array(V).fill(0);
    docs.forEach(function (d) { d.forEach(function (_, t) { df[vocab.get(t)] += 1; }); });
    var idf = df.map(function (f) { return Math.log((1 + n) / (1 + f)) + 1; });
    var cent = [];
    for (var k = 0; k < nClass; k++) cent.push(new Float64Array(V));
    for (var di = 0; di < n; di++) {
      var w = weights(docs[di], vocab, idf), s = 0;
      for (var a = 0; a < w.length; a++) s += w[a][1] * w[a][1];
      var nrm = Math.sqrt(s) || 1, row = cent[y[di]];
      for (var b = 0; b < w.length; b++) row[w[b][0]] += w[b][1] / nrm;
    }
    cent.forEach(function (row) {
      var s2 = 0;
      for (var i = 0; i < row.length; i++) s2 += row[i] * row[i];
      var n2 = Math.sqrt(s2) || 1;
      for (var j = 0; j < row.length; j++) row[j] = row[j] / n2;
    });
    return { vocab: vocab, idf: idf, cent: cent };
  }

  function predict(model, text) {
    var w = weights(counts(text, model.vocab, false), model.vocab, model.idf), s = 0;
    for (var a = 0; a < w.length; a++) s += w[a][1] * w[a][1];
    var nrm = Math.sqrt(s) || 1, best = 0, bs = -1;
    for (var k = 0; k < model.cent.length; k++) {
      var row = model.cent[k], sc = 0;
      for (var b = 0; b < w.length; b++) sc += (w[b][1] / nrm) * row[w[b][0]];
      if (sc > bs) { best = k; bs = sc; }
    }
    return [best, bs];
  }

  function classifyAll(S, shuffleLabels) {
    var y = shuffleLabels ? shuffled(S.trainY, S.seed) : S.trainY;
    var model = train(S.trainText, y, S.intents.length);
    return S.testText.map(function (t) { return predict(model, t); });
  }

  /* ------------------------------------------------ triage metrics */
  function triage(S, preds, tags, theta) {
    var y = S.testY, risk = S.tier, n = y.length;
    var auto = 0, correct = 0, wrong = 0, risky = 0, stranded = 0, acc = 0;
    for (var i = 0; i < n; i++) {
      var p = preds[i][0], s = preds[i][1], t = y[i];
      if (p === t) acc++;
      if (tags[p] === 0 && s >= theta) {
        auto++;
        if (p === t) correct++; else wrong++;
        if (risk[t] === 2) risky++;
      } else if (tags[t] === 0) stranded++;
    }
    return { n: n, accuracy: acc, automated: auto, correctAuto: correct, wrongAuto: wrong,
      riskyAuto: risky, stranded: stranded,
      coveragePct: rnd(100 * auto / n, 1),
      wrongOfAutoPct: auto ? rnd(100 * wrong / auto, 1) : 0 };
  }

  function presetTags(S, name) {
    var k = S.intents.length, out = [], i;
    if (name === "nothing") { for (i = 0; i < k; i++) out.push(1); return out; }
    if (name === "everything") { for (i = 0; i < k; i++) out.push(0); return out; }
    if (name === "busiest") {
      var order = [];
      for (i = 0; i < k; i++) order.push(i);
      order.sort(function (a, b) { return (S.trainVolume[b] - S.trainVolume[a]) || (a - b); });
      var top = order.slice(0, 20);
      for (i = 0; i < k; i++) out.push(top.indexOf(i) >= 0 ? 0 : 1);
      return out;
    }
    if (name === "riskfirst" || name === "gated") return S.tier.slice();
    throw new Error(name);
  }

  var PRESETS = [["nothing", 0], ["everything", 0], ["busiest", 0], ["riskfirst", 0], ["gated", 0.4]];

  function playground(S) {
    var preds = classifyAll(S, false), out = {};
    PRESETS.forEach(function (p) { out[p[0]] = triage(S, preds, presetTags(S, p[0]), p[1]); });
    out.broken = triage(S, classifyAll(S, true), presetTags(S, "gated"), 0.4);
    var q = S.intentQueue, perq = S.queues.map(function () { return [0, 0]; }), conf = {};
    for (var i = 0; i < preds.length; i++) {
      var p = preds[i][0], t = S.testY[i];
      perq[q[t]][1] += 1;
      if (p === t) perq[q[t]][0] += 1;
      else { var key = t + "," + p; conf[key] = (conf[key] || 0) + 1; }
    }
    out.perQueue = perq.map(function (v, i2) { return { queue: S.queues[i2], correct: v[0], n: v[1] }; });
    var list = Object.keys(conf).map(function (key) { var tp = key.split(","); return [+tp[0], +tp[1], conf[key]]; });
    list.sort(function (a, b) { return (b[2] - a[2]) || (a[0] - b[0]) || (a[1] - b[1]); });
    out.topConfusions = list.slice(0, 6).map(function (c) { return { truth: S.intents[c[0]], predicted: S.intents[c[1]], count: c[2] }; });
    var bt = presetTags(S, "busiest");
    out.riskyIntentsInBusiest20 = S.intents.filter(function (_, i3) { return bt[i3] === 0 && S.tier[i3] === 2; });
    out.safeSharePct = rnd(100 * S.testY.filter(function (t) { return S.tier[t] === 0; }).length / S.testY.length, 1);
    return out;
  }

  /* ------------------------------------------------ the simulator */
  var Q = {
    contacts: 14000, chatShare: 0.70, days: 30, openHours: 12,
    profile: [0.05, 0.07, 0.09, 0.10, 0.10, 0.09, 0.08, 0.08, 0.09, 0.09, 0.09, 0.07],
    chatAhtMin: 7.5, emailAhtMin: 8.0, slTarget: 0.80, slSeconds: 20,
    productiveHours: 112.0, fteCost: 4500, returnShare: 0.60, repeatAhtFactor: 1.5,
    safeShare: 0.35, marginalResolution: 0.35, agentsToday: 24,
    churnShare: 0.15, annualMargin: 120
  };

  function erlangAgents(callsPerHour, ahtMin, slTarget, slSec) {
    if (callsPerHour <= 0) return 0;
    var A = callsPerHour * ahtMin / 60.0;
    var n = Math.max(1, Math.floor(A) + 1);
    for (;;) {
      var b = 1.0;
      for (var i = 1; i <= n; i++) b = A * b / (i + A * b);
      var c = n * b / (n - A * (1 - b));
      var sl = 1 - c * Math.exp(-(n - A) * slSec / (ahtMin * 60.0));
      if (sl >= slTarget) return n;
      n += 1;
    }
  }

  function simulate(lv) {
    var V = Q.contacts, a = lv.auto;
    var botN = V * a;
    var safe = Math.min(a, Q.safeShare);
    var marg = a - safe;
    var botResolved = V * (safe * lv.res + marg * Q.marginalResolution);
    var botFail = botN - botResolved;
    var handed = botFail * lv.catch;
    var falseContained = botFail - handed;
    var repeats = falseContained * Q.returnShare;
    var silent = falseContained - repeats;
    var first = V * (1 - a) + handed;
    var human = first + repeats;
    var cs = Q.chatShare;
    var aht = Q.chatAhtMin / (1 + lv.uplift);
    var eaht = Q.emailAhtMin / (1 + lv.uplift);
    var rf = Q.repeatAhtFactor;
    var chat = human * cs;
    var chatAht = (first * cs * aht + repeats * cs * aht * rf) / chat;
    var emailMin = first * (1 - cs) * eaht + repeats * (1 - cs) * eaht * rf;
    var perDay = chat / Q.days;
    var seats = Q.profile.map(function (w) { return erlangAgents(perDay * w, chatAht, Q.slTarget, Q.slSeconds); });
    var emailHours = emailMin / Q.days / 60.0;
    var seatSum = 0;
    for (var i = 0; i < seats.length; i++) seatSum += seats[i];
    var agentHours = seatSum + emailHours;
    var fte = agentHours * Q.days / Q.productiveHours;
    var headcount = Math.ceil(fte - 1e-9);
    var humanCost = headcount * Q.fteCost;
    var aiCost = botN * lv.price;
    var resolved = V - silent;
    var contained = botN - handed;
    var hourly = Q.fteCost / Q.productiveHours;
    var repeatCost = repeats * (cs * aht + (1 - cs) * eaht) * rf / 60.0 * hourly;
    var churnCost = silent * Q.churnShare * Q.annualMargin;
    return {
      peakSeats: Math.max.apply(null, seats), headcount: headcount, fte: rnd(fte, 2),
      humanContacts: rnd(human), botConversations: rnd(botN),
      falseContained: rnd(falseContained), silentUnresolved: rnd(silent),
      repeatContacts: rnd(repeats),
      vendorResolutionPct: botN ? rnd(100 * contained / botN, 1) : 0,
      trueBotResolutionPct: botN ? rnd(100 * botResolved / botN, 1) : 0,
      monthlyCost: rnd(humanCost + aiCost),
      costPerResolved: rnd((humanCost + aiCost) / resolved, 2),
      falseContainmentCost: rnd(falseContained * lv.price + repeatCost + churnCost),
      allInCostPerResolved: rnd((humanCost + aiCost + churnCost) / resolved, 2)
    };
  }

  var RUNGS = [
    ["today", { auto: 0.0, res: 0.85, catch: 0.0, uplift: 0.0, price: 0.99 }],
    ["vendor", { auto: 0.70, res: 0.85, catch: 0.0, uplift: 0.0, price: 0.99 }],
    ["assistOnly", { auto: 0.0, res: 0.85, catch: 0.0, uplift: 0.14, price: 0.99 }],
    ["safeOnly", { auto: 0.35, res: 0.85, catch: 0.0, uplift: 0.0, price: 0.99 }],
    ["withHandoff", { auto: 0.35, res: 0.85, catch: 0.70, uplift: 0.0, price: 0.99 }],
    ["plan", { auto: 0.35, res: 0.85, catch: 0.70, uplift: 0.14, price: 0.99 }],
    ["pushTo90", { auto: 0.90, res: 0.85, catch: 0.70, uplift: 0.14, price: 0.99 }],
    ["perConversation2", { auto: 0.35, res: 0.85, catch: 0.70, uplift: 0.14, price: 2.00 }]
  ];

  var ENGINE = { rnd: rnd, mulberry32: mulberry32, shuffled: shuffled, tokens: tokens, train: train,
    predict: predict, classifyAll: classifyAll, triage: triage, presetTags: presetTags,
    playground: playground, PRESETS: PRESETS, Q: Q, erlangAgents: erlangAgents, simulate: simulate,
    RUNGS: RUNGS };

  if (typeof module !== "undefined" && module.exports) module.exports = ENGINE;
  if (typeof window === "undefined") return;
  window.ACS_ENGINE = ENGINE;

  /* ================================================ DOM widgets */
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function pretty(intent) { return intent.replace(/\?$/, "").replace(/_/g, " ").replace(/^./, function (c) { return c.toUpperCase(); }); }
  function fmt(n) { return Number(n).toLocaleString("en-US"); }
  function money(n, d) { return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function shell(root, title, sub) {
    var wk = el("div", "wk acs-wk");
    var head = el("div", "wk-head");
    head.appendChild(el("b", null, title));
    if (sub) head.appendChild(el("span", "wk-hint", sub));
    wk.appendChild(head);
    var body = el("div", "wk-body");
    wk.appendChild(body);
    root.appendChild(wk);
    return body;
  }
  function meter(parent, label, cls) {
    var m = el("div", "acs-meter " + (cls || ""));
    var big = el("output", "acs-big", "-");
    m.appendChild(big);
    m.appendChild(el("span", "acs-mlab", label));
    var sub = el("span", "acs-msub", "");
    m.appendChild(sub);
    parent.appendChild(m);
    return { big: big, sub: sub, box: m };
  }

  /* ------------------------------------------------ playground */
  function mountTriage(root) {
    var S = window.ACS_SAMPLE;
    if (!S) { root.textContent = "The Banking77 sample did not load."; return; }
    var body = shell(root, "Triage playground: 616 real customer messages",
      "Banking77 rows, a classifier trained in your browser");
    var preds = classifyAll(S, false), broken = null;
    var state = { tags: presetTags(S, "riskfirst"), theta: 0, broken: false, preset: "riskfirst" };

    var acc = el("p", "acs-note");
    body.appendChild(acc);

    var bar = el("div", "acs-presets");
    var PRE = [["nothing", "Automate nothing", 0], ["everything", "Automate everything", 0],
      ["busiest", "Automate the busiest 20", 0], ["riskfirst", "Risk-first map", 0],
      ["gated", "Risk-first + confidence gate", 0.4]];
    var preBtns = {};
    PRE.forEach(function (p) {
      var b = el("button", "acs-chip", p[1]);
      b.type = "button";
      b.addEventListener("click", function () { setPreset(p[0]); });
      preBtns[p[0]] = b;
      bar.appendChild(b);
    });
    body.appendChild(bar);

    var ctl = el("div", "acs-ctl");
    var lab = el("label", "acs-slider");
    lab.appendChild(el("span", null, "Confidence gate: only automate when the classifier's score is at least "));
    var thOut = el("b", null, "0.00");
    lab.appendChild(thOut);
    var th = document.createElement("input");
    th.type = "range"; th.min = "0"; th.max = "0.8"; th.step = "0.05"; th.value = "0";
    th.setAttribute("aria-label", "Confidence gate");
    th.addEventListener("input", function () { state.theta = Number(th.value); state.preset = null; render(); });
    lab.appendChild(th);
    ctl.appendChild(lab);
    var brk = el("button", "acs-break", "Break it: shuffle the training labels");
    brk.type = "button";
    brk.addEventListener("click", function () {
      state.broken = !state.broken;
      if (state.broken && !broken) broken = classifyAll(S, true);
      render();
    });
    ctl.appendChild(brk);
    body.appendChild(ctl);

    var reads = el("div", "acs-reads");
    var mCov = meter(reads, "of messages answered by the bot");
    var mWrong = meter(reads, "bot answers to the wrong intent", "acs-warn");
    var mRisk = meter(reads, "risky messages the bot kept from a person", "acs-bad");
    var mStr = meter(reads, "safe messages that still reached a person");
    body.appendChild(reads);

    var verdict = el("p", "acs-verdict");
    body.appendChild(verdict);

    var det = el("details", "acs-intents");
    det.appendChild(el("summary", null, "Tag the 77 intents yourself (A automate, S assist, H human)"));
    var table = el("div", "acs-itable");
    var rowBtns = [];
    var perIntent = S.intents.map(function () { return [0, 0]; });
    preds.forEach(function (pr, i) { var t = S.testY[i]; perIntent[t][1]++; if (pr[0] === t) perIntent[t][0]++; });
    S.queues.forEach(function (qn, qi) {
      table.appendChild(el("div", "acs-qhead", qn));
      S.intents.forEach(function (name, k) {
        if (S.intentQueue[k] !== qi) return;
        var r = el("div", "acs-irow");
        r.appendChild(el("span", "acs-iname", pretty(name)));
        r.appendChild(el("span", "acs-iacc", perIntent[k][0] + "/" + perIntent[k][1] + " right"));
        var seg = el("span", "acs-seg");
        var bs = ["A", "S", "H"].map(function (lbl, v) {
          var b = el("button", "acs-tag t" + v, lbl);
          b.type = "button";
          b.setAttribute("aria-label", pretty(name) + ": " + ["automate", "assist", "human"][v]);
          b.addEventListener("click", function () { state.tags[k] = v; state.preset = null; render(); });
          seg.appendChild(b);
          return b;
        });
        rowBtns[k] = bs;
        r.appendChild(seg);
        table.appendChild(r);
      });
    });
    det.appendChild(table);
    body.appendChild(det);

    var ex = el("details", "acs-examples");
    ex.appendChild(el("summary", null, "Read the messages the bot would have answered wrongly"));
    var exList = el("ol", "acs-exlist");
    ex.appendChild(exList);
    body.appendChild(ex);

    body.appendChild(el("p", "acs-rail",
      "Real: the 2,464 Banking77 messages (PolyAI, CC BY 4.0, modified: sampled), the classifier and every count. " +
      "Constructed: Quayside's risk tier per intent. The sample is balanced at 8 messages per intent; real queues are not."));

    function setPreset(name) {
      state.preset = name;
      state.tags = presetTags(S, name);
      state.theta = name === "gated" ? 0.4 : 0;
      th.value = String(state.theta);
      render();
    }

    function render() {
      var P = state.broken ? broken : preds;
      var r = triage(S, P, state.tags, state.theta);
      acc.innerHTML = "";
      acc.appendChild(document.createTextNode("Classifier: "));
      acc.appendChild(el("b", null, r.accuracy + " of " + r.n));
      acc.appendChild(document.createTextNode(" messages matched to the right intent (" + rnd(100 * r.accuracy / r.n, 1) + "%)" +
        (state.broken ? ", trained on shuffled labels. It learned nothing, and the gate now passes almost nothing." : ".")));
      thOut.textContent = state.theta.toFixed(2);
      mCov.big.textContent = r.coveragePct + "%";
      mCov.sub.textContent = r.automated + " of " + r.n;
      mWrong.big.textContent = String(r.wrongAuto);
      mWrong.sub.textContent = r.automated ? r.wrongOfAutoPct + "% of bot answers" : "no bot answers";
      mRisk.big.textContent = String(r.riskyAuto);
      mRisk.sub.textContent = "fraud, disputes, identity";
      mStr.big.textContent = String(r.stranded);
      mStr.sub.textContent = "coverage you gave up";
      mRisk.box.classList.toggle("on", r.riskyAuto > 0);
      verdict.textContent = r.automated === 0
        ? "Nothing automated: no wrong answers, no savings, and every message waits for a person."
        : r.riskyAuto > 10
          ? "The bot is answering lost cards, unrecognised payments and double charges. Those customers needed a person."
          : r.wrongOfAutoPct > 15
            ? "Few risky misses, but more than one bot answer in seven goes to the wrong intent. Each is a false containment waiting to happen."
            : "Fewer, safer automations. The wrong answers that remain are the reason session 4 builds the hand-off.";
      brk.classList.toggle("on", state.broken);
      brk.textContent = state.broken ? "Restore the real labels" : "Break it: shuffle the training labels";
      Object.keys(preBtns).forEach(function (k) { preBtns[k].classList.toggle("on", state.preset === k); });
      rowBtns.forEach(function (bs, k) { bs.forEach(function (b, v) { b.classList.toggle("on", state.tags[k] === v); }); });
      exList.innerHTML = "";
      var shown = 0;
      for (var i = 0; i < P.length && shown < 6; i++) {
        var p = P[i][0], t = S.testY[i];
        if (state.tags[p] === 0 && P[i][1] >= state.theta && p !== t) {
          var li = el("li");
          li.appendChild(el("q", null, S.testText[i]));
          li.appendChild(el("span", "acs-exmeta", " needed: " + pretty(S.intents[t]) + " · bot answered: " + pretty(S.intents[p]) +
            (S.tier[t] === 2 ? " · a person should have taken it" : "")));
          exList.appendChild(li);
          shown++;
        }
      }
      if (!shown) exList.appendChild(el("li", null, "No wrong bot answers under this map."));
      window.ACS_TRIAGE.last = r;
    }

    window.ACS_TRIAGE = { preset: setPreset, result: function () { return window.ACS_TRIAGE.last; },
      setTheta: function (v) { state.theta = v; th.value = String(v); render(); },
      breakIt: function (on) { state.broken = !!on; if (on && !broken) broken = classifyAll(S, true); render(); } };
    setPreset("riskfirst");
  }

  /* ------------------------------------------------ simulator */
  function mountPlan(root) {
    var body = shell(root, "Quayside's support plan, priced",
      "Erlang C staffing at 80/20, the true-resolution funnel, cost per resolved contact");
    var lv = { auto: 0, res: 0.85, catch: 0, uplift: 0, price: 0.99 };
    var showVendor = false;

    var bar = el("div", "acs-presets");
    var RL = { today: "Today, no AI", vendor: "The vendor pitch: 70%", assistOnly: "Assist only",
      safeOnly: "Automate the safe third", withHandoff: "+ a hand-off", plan: "The plan",
      pushTo90: "Push to 90%", perConversation2: "Same plan at $2" };
    var rBtns = {};
    RUNGS.forEach(function (r) {
      var b = el("button", "acs-chip", RL[r[0]]);
      b.type = "button";
      b.addEventListener("click", function () { setRung(r[0]); });
      rBtns[r[0]] = b;
      bar.appendChild(b);
    });
    body.appendChild(bar);

    var sliders = el("div", "acs-sliders");
    var SL = [
      ["auto", "Share of contacts the bot takes first", 0, 0.9, 0.05, function (v) { return Math.round(v * 100) + "%"; }],
      ["res", "Bot's true resolution on the intents it is good at", 0.5, 0.95, 0.05, function (v) { return Math.round(v * 100) + "%"; }],
      ["catch", "Share of the bot's failing chats the hand-off catches", 0, 1, 0.1, function (v) { return Math.round(v * 100) + "%"; }],
      ["uplift", "Agent-assist uplift in resolutions per hour (cap: the published 14%)", 0, 0.14, 0.01, function (v) { return Math.round(v * 100) + "%"; }],
      ["price", "AI price per bot conversation", 0, 2, 0.01, function (v) { return "$" + v.toFixed(2); }]
    ];
    var inputs = {};
    SL.forEach(function (s) {
      var lab = el("label", "acs-slider");
      lab.appendChild(el("span", null, s[1] + " "));
      var out = el("b", null, "");
      lab.appendChild(out);
      var inp = document.createElement("input");
      inp.type = "range"; inp.min = String(s[2]); inp.max = String(s[3]); inp.step = String(s[4]);
      inp.setAttribute("aria-label", s[1]);
      inp.addEventListener("input", function () { lv[s[0]] = Number(inp.value); cur = null; render(); });
      lab.appendChild(inp);
      sliders.appendChild(lab);
      inputs[s[0]] = { inp: inp, out: out, f: s[5] };
    });
    body.appendChild(sliders);

    var anti = el("label", "acs-anti");
    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.addEventListener("change", function () { showVendor = cb.checked; render(); });
    anti.appendChild(cb);
    anti.appendChild(document.createTextNode(" Show the vendor dashboard: count every chat that did not reach a person as resolved"));
    body.appendChild(anti);

    var reads = el("div", "acs-reads");
    var mHead = meter(reads, "agents to hire at 80/20");
    var mCost = meter(reads, "cost per resolved contact");
    var mFalse = meter(reads, "customers falsely contained a month", "acs-bad");
    var mRes = meter(reads, "bot resolution, measured truly");
    body.appendChild(reads);

    var verdict = el("p", "acs-verdict");
    body.appendChild(verdict);
    var table = el("table", "clean acs-ledger");
    body.appendChild(table);

    var memoWrap = el("div", "acs-memo");
    var memoBtn = el("button", "acs-chip acs-memo-btn", "Write Quayside's plan memo from these numbers");
    memoBtn.type = "button";
    var gate = el("p", "acs-gate");
    var memo = el("div", "prompt-box good acs-memo-text");
    memo.style.display = "none";
    memoWrap.appendChild(memoBtn);
    memoWrap.appendChild(gate);
    memoWrap.appendChild(memo);
    body.appendChild(memoWrap);
    var forceOpen = false;
    memoBtn.addEventListener("click", function () {
      var got = window.LWP_PASSPORT ? window.LWP_PASSPORT.count() : 0;
      if (got < 4 && !forceOpen) {
        gate.innerHTML = "";
        gate.appendChild(document.createTextNode("The memo unlocks at 4 passport stamps (you have " + got + "). "));
        var by = el("a", null, "Open it anyway");
        by.href = "#";
        by.addEventListener("click", function (e) { e.preventDefault(); forceOpen = true; gate.textContent = ""; showMemo(); });
        gate.appendChild(by);
        gate.appendChild(document.createTextNode(": the stamps are a nudge, not a lock."));
        return;
      }
      showMemo();
    });

    body.appendChild(el("p", "acs-rail",
      "Real: the Erlang C formula and the service-level formula (ITU-D Teletraffic Engineering Handbook, eq. 12.6 and 12.34), run hour by hour. " +
      "Constructed: every Quayside number (14,000 contacts a month, 70% chat, 7.5 and 8 minute handle times, $4,500 per agent-month, 30% shrinkage, " +
      "60% of failed customers come back at 1.5 times the handle time, 15% of the rest leave, the bot's 35% resolution past the safe third). Your numbers will differ."));

    var cur = null, last = null;
    function setRung(id) {
      for (var i = 0; i < RUNGS.length; i++) if (RUNGS[i][0] === id) {
        var v = RUNGS[i][1];
        Object.keys(v).forEach(function (k) { lv[k] = v[k]; });
      }
      cur = id;
      render();
    }
    function showMemo() {
      var r = last;
      memo.style.display = "";
      memo.innerHTML = "";
      memo.appendChild(el("span", "label", "★ Quayside support operating plan, priced on the bench"));
      memo.appendChild(document.createTextNode(
        "Automate " + Math.round(lv.auto * 100) + "% of contacts first, only on intents with a true resolution near " + Math.round(lv.res * 100) + "%.\n" +
        "Hand-off catches " + Math.round(lv.catch * 100) + "% of failing bot conversations before the loop.\n" +
        "Agent assist assumed at +" + Math.round(lv.uplift * 100) + "% resolutions per hour.\n" +
        "Staff " + r.headcount + " agents (today: 24), peak " + r.peakSeats + " seats at 80/20.\n" +
        "Cost per resolved contact " + money(r.costPerResolved, 2) + " (" + money(r.allInCostPerResolved, 2) + " counting customers lost).\n" +
        "Customers falsely contained: " + fmt(r.falseContained) + " a month, " + fmt(r.silentUnresolved) + " of them never come back.\n" +
        "Vendor dashboard would report " + r.vendorResolutionPct + "% resolution; the true figure is " + r.trueBotResolutionPct + "%.\n" +
        "Constructed Quayside example. Re-verify vendor pricing before you sign."));
    }
    function render() {
      Object.keys(inputs).forEach(function (k) { inputs[k].inp.value = String(lv[k]); inputs[k].out.textContent = inputs[k].f(lv[k]); });
      var r = simulate(lv), base = simulate(RUNGS[0][1]);
      last = r;
      mHead.big.textContent = String(r.headcount);
      mHead.sub.textContent = "today: 24 · peak seats " + r.peakSeats;
      mCost.big.textContent = money(r.costPerResolved, 2);
      mCost.sub.textContent = money(r.allInCostPerResolved, 2) + " counting customers lost";
      mFalse.big.textContent = fmt(r.falseContained);
      mFalse.sub.textContent = fmt(r.silentUnresolved) + " never come back";
      mFalse.box.classList.toggle("on", r.falseContained > 500);
      if (showVendor) {
        mRes.big.textContent = r.botConversations ? r.vendorResolutionPct + "%" : "-";
        mRes.box.querySelector(".acs-mlab").textContent = "bot resolution, as the vendor dashboard counts it";
        mRes.sub.textContent = r.botConversations ? "true figure: " + r.trueBotResolutionPct + "%" : "no bot running";
      } else {
        mRes.big.textContent = r.botConversations ? r.trueBotResolutionPct + "%" : "-";
        mRes.box.querySelector(".acs-mlab").textContent = "bot resolution, measured truly";
        mRes.sub.textContent = r.botConversations ? "dashboard says " + r.vendorResolutionPct + "%" : "no bot running";
      }
      mRes.box.classList.toggle("acs-vendor", showVendor);
      var worse = r.allInCostPerResolved > base.allInCostPerResolved;
      verdict.textContent = r.botConversations === 0
        ? (lv.uplift > 0 ? "No bot at all, and assist alone takes a seat or two off the plan." : "Quayside today: 24 agents, every contact reaches a person.")
        : worse
          ? "Fewer agents, and a worse plan: counting the customers it loses, each resolved contact costs more than it does today."
          : r.falseContained > 1000
            ? "The operating cost looks good. Over a thousand customers a month were told they were done when they were not."
            : "Fewer agents, a lower cost per resolved contact, and the false containments are a number someone owns.";
      table.innerHTML = "";
      [["Contacts a month", fmt(Q.contacts), "constructed"],
       ["Bot conversations", fmt(r.botConversations), "billed at " + money(lv.price, 2) + " each"],
       ["Reached a person (incl. repeats)", fmt(r.humanContacts), fmt(r.repeatContacts) + " are repeat contacts"],
       ["Monthly operating cost", money(r.monthlyCost), r.headcount + " agents x $4,500 + AI fees"],
       ["False-containment cost", money(r.falseContainmentCost), "fees paid on failures + repeat handling + customers lost"]
      ].forEach(function (row, i) {
        var tr = el("tr");
        row.forEach(function (c) { tr.appendChild(el(i < 0 ? "th" : "td", null, c)); });
        table.appendChild(tr);
      });
      Object.keys(rBtns).forEach(function (k) { rBtns[k].classList.toggle("on", cur === k); });
      if (memo.style.display !== "none") showMemo();
      window.ACS_BENCH.last = r;
    }
    window.ACS_BENCH = { setRung: setRung, result: function () { return window.ACS_BENCH.last; },
      set: function (k, v) { lv[k] = v; cur = null; render(); },
      vendorView: function (on) { cb.checked = !!on; showVendor = !!on; render(); } };
    setRung("today");
  }

  function boot() {
    var t = document.getElementById("acs-triage");
    if (t) mountTriage(t);
    var p = document.getElementById("acs-plan");
    if (p) mountPlan(p);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
