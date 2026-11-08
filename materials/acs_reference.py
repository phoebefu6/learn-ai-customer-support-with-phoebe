"""Reference implementation for learn-ai-customer-support-with-phoebe.

Recomputes, independently of the browser, every number the two benches print:

1. The triage playground (session 2): a TF-IDF nearest-centroid intent classifier trained on the
   1,848 Banking77 rows in assets/acs-sample.js and run on its 616 test rows, then the triage
   metrics for each preset map (automate / assist / human tags plus a confidence gate).
2. The support-plan simulator (session 6): Erlang C staffing at an 80/20 service level over a
   constructed Quayside contact profile, the true-resolution funnel, cost per resolved contact and
   customers falsely contained.

The browser engine (assets/acs-live.js) implements the same arithmetic in the same order. Run
`node materials/run-ladder.js > a.json`, `python3 materials/acs_reference.py > b.json`, then
`python3 materials/compare-ladder.py a.json b.json` (it also proves it can fail).

Everything about Quayside is CONSTRUCTED. Banking77 rows are real (CC BY 4.0).
"""
import json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))


def load_sample():
    src = open(os.path.join(HERE, "..", "assets", "acs-sample.js"), encoding="utf-8").read()
    start = src.index("var ACS_SAMPLE = ") + len("var ACS_SAMPLE = ")
    end = src.index(";\nif (typeof window")
    return json.loads(src[start:end])


def rnd(x, d=0):
    """Round half away from zero, the same formula as rnd() in assets/acs-live.js."""
    p = 10 ** d
    v = math.floor(abs(x) * p + 0.5) / p
    v = -v if x < 0 else v
    return int(v) if d == 0 else v


# ---------------------------------------------------------------- PRNG (mulberry32, as in JS)
def mulberry32(seed):
    state = [seed & 0xFFFFFFFF]

    def nxt():
        state[0] = (state[0] + 0x6D2B79F5) & 0xFFFFFFFF
        t = state[0]
        t = ((t ^ (t >> 15)) * (t | 1)) & 0xFFFFFFFF
        t = (t ^ ((t + (((t ^ (t >> 7)) * (t | 61)) & 0xFFFFFFFF)) & 0xFFFFFFFF)) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296.0
    return nxt


def shuffled(labels, seed):
    y = list(labels)
    nxt = mulberry32(seed)
    for i in range(len(y) - 1, 0, -1):
        j = int(nxt() * (i + 1))
        y[i], y[j] = y[j], y[i]
    return y


# ---------------------------------------------------------------- classifier
TOK = re.compile(r"[a-z0-9]+")


def tokens(text):
    return TOK.findall(text.lower())


def counts(text, vocab=None, grow=False):
    c = {}
    for t in tokens(text):
        if vocab is not None and t not in vocab:
            if not grow:
                continue
            vocab[t] = len(vocab)
        c[t] = c.get(t, 0) + 1
    return c


def train(texts, y, n_class):
    vocab = {}
    docs = [counts(t, vocab, grow=True) for t in texts]
    n = len(docs)
    df = [0] * len(vocab)
    for d in docs:
        for t in d:
            df[vocab[t]] += 1
    idf = [math.log((1 + n) / (1 + f)) + 1 for f in df]
    cent = [[0.0] * len(vocab) for _ in range(n_class)]
    for d, k in zip(docs, y):
        w = [(vocab[t], c * idf[vocab[t]]) for t, c in d.items()]
        nrm = math.sqrt(sum(v * v for _, v in w)) or 1.0
        row = cent[k]
        for i, v in w:
            row[i] += v / nrm
    for row in cent:
        s = 0.0
        for v in row:
            s += v * v
        nrm = math.sqrt(s) or 1.0
        for i in range(len(row)):
            row[i] = row[i] / nrm
    return vocab, idf, cent


def predict(model, text):
    vocab, idf, cent = model
    d = counts(text, vocab)
    w = [(vocab[t], c * idf[vocab[t]]) for t, c in d.items()]
    nrm = math.sqrt(sum(v * v for _, v in w)) or 1.0
    best, bs = 0, -1.0
    for k, row in enumerate(cent):
        s = 0.0
        for i, v in w:
            s += (v / nrm) * row[i]
        if s > bs:
            best, bs = k, s
    return best, bs


def classify_all(S, shuffle_labels=False):
    y = shuffled(S["trainY"], S["seed"]) if shuffle_labels else S["trainY"]
    model = train(S["trainText"], y, len(S["intents"]))
    return [predict(model, t) for t in S["testText"]]


# ---------------------------------------------------------------- triage metrics
def triage(S, preds, tags, theta):
    y = S["testY"]
    risk = S["tier"]
    n = len(y)
    auto = correct = wrong = risky = stranded = 0
    for (p, s), t in zip(preds, y):
        is_auto = tags[p] == 0 and s >= theta
        if is_auto:
            auto += 1
            if p == t:
                correct += 1
            else:
                wrong += 1
            if risk[t] == 2:
                risky += 1
        elif tags[t] == 0:
            stranded += 1
    acc = sum(1 for (p, _), t in zip(preds, y) if p == t)
    return {"n": n, "accuracy": acc, "automated": auto, "correctAuto": correct, "wrongAuto": wrong,
            "riskyAuto": risky, "stranded": stranded,
            "coveragePct": rnd(100.0 * auto / n, 1),
            "wrongOfAutoPct": rnd(100.0 * wrong / auto, 1) if auto else 0.0}


def preset_tags(S, name):
    k = len(S["intents"])
    if name == "nothing":
        return [1] * k
    if name == "everything":
        return [0] * k
    if name == "busiest":
        order = sorted(range(k), key=lambda i: (-S["trainVolume"][i], i))[:20]
        return [0 if i in order else 1 for i in range(k)]
    if name in ("riskfirst", "gated"):
        return list(S["tier"])
    raise ValueError(name)


PRESETS = [("nothing", 0.0), ("everything", 0.0), ("busiest", 0.0), ("riskfirst", 0.0), ("gated", 0.4)]


def playground(S):
    preds = classify_all(S)
    out = {}
    for name, theta in PRESETS:
        out[name] = triage(S, preds, preset_tags(S, name), theta)
    broken = classify_all(S, shuffle_labels=True)
    out["broken"] = triage(S, broken, preset_tags(S, "gated"), 0.4)
    # per-queue accuracy and the top confusions, for the page
    q = S["intentQueue"]
    perq = [[0, 0] for _ in S["queues"]]
    conf = {}
    for (p, _), t in zip(preds, S["testY"]):
        perq[q[t]][1] += 1
        if p == t:
            perq[q[t]][0] += 1
        else:
            conf[(t, p)] = conf.get((t, p), 0) + 1
    out["perQueue"] = [{"queue": S["queues"][i], "correct": a, "n": b} for i, (a, b) in enumerate(perq)]
    top = sorted(conf.items(), key=lambda kv: (-kv[1], kv[0][0], kv[0][1]))[:6]
    out["topConfusions"] = [{"truth": S["intents"][t], "predicted": S["intents"][p], "count": c} for (t, p), c in top]
    out["riskyIntentsInBusiest20"] = [S["intents"][i] for i, tg in enumerate(preset_tags(S, "busiest"))
                                       if tg == 0 and S["tier"][i] == 2]
    out["safeSharePct"] = rnd(100.0 * sum(1 for t in S["testY"] if S["tier"][t] == 0) / len(S["testY"]), 1)
    return out


# ---------------------------------------------------------------- simulator (CONSTRUCTED Quayside)
Q = {
    "contacts": 14000, "chatShare": 0.70, "days": 30, "openHours": 12,
    "profile": [0.05, 0.07, 0.09, 0.10, 0.10, 0.09, 0.08, 0.08, 0.09, 0.09, 0.09, 0.07],
    "chatAhtMin": 7.5, "emailAhtMin": 8.0, "slTarget": 0.80, "slSeconds": 20,
    "productiveHours": 112.0, "fteCost": 4500, "returnShare": 0.60, "repeatAhtFactor": 1.5,
    "safeShare": 0.35, "marginalResolution": 0.35, "agentsToday": 24,
    "churnShare": 0.15, "annualMargin": 120,
}


def erlang_agents(calls_per_hour, aht_min, sl_target, sl_sec):
    if calls_per_hour <= 0:
        return 0
    A = calls_per_hour * aht_min / 60.0
    n = max(1, int(math.floor(A)) + 1)
    while True:
        b = 1.0
        for i in range(1, n + 1):
            b = A * b / (i + A * b)
        c = n * b / (n - A * (1 - b))
        sl = 1 - c * math.exp(-(n - A) * sl_sec / (aht_min * 60.0))
        if sl >= sl_target:
            return n
        n += 1


def simulate(lv):
    """lv: auto (0..0.9), res (bot true resolution on the safe intents), catch (hand-off catches this
    share of the bot's failing conversations), uplift (0..0.14), price (per bot conversation)."""
    V = Q["contacts"]
    a = lv["auto"]
    botN = V * a
    safe = min(a, Q["safeShare"])
    marg = a - safe
    botResolved = V * (safe * lv["res"] + marg * Q["marginalResolution"])
    botFail = botN - botResolved
    handed = botFail * lv["catch"]
    falseContained = botFail - handed
    repeats = falseContained * Q["returnShare"]
    silent = falseContained - repeats
    first = V * (1 - a) + handed
    human = first + repeats
    cs = Q["chatShare"]
    aht = Q["chatAhtMin"] / (1 + lv["uplift"])
    eaht = Q["emailAhtMin"] / (1 + lv["uplift"])
    rf = Q["repeatAhtFactor"]
    chat = human * cs
    chatAht = (first * cs * aht + repeats * cs * aht * rf) / chat
    emailMin = first * (1 - cs) * eaht + repeats * (1 - cs) * eaht * rf
    perDay = chat / Q["days"]
    seats = [erlang_agents(perDay * w, chatAht, Q["slTarget"], Q["slSeconds"]) for w in Q["profile"]]
    emailHours = emailMin / Q["days"] / 60.0
    agentHours = sum(seats) + emailHours
    fte = agentHours * Q["days"] / Q["productiveHours"]
    headcount = int(math.ceil(fte - 1e-9))
    humanCost = headcount * Q["fteCost"]
    aiCost = botN * lv["price"]
    resolved = V - silent
    contained = botN - handed
    hourly = Q["fteCost"] / Q["productiveHours"]
    repeatCost = repeats * (cs * aht + (1 - cs) * eaht) * rf / 60.0 * hourly
    churnCost = silent * Q["churnShare"] * Q["annualMargin"]
    return {
        "peakSeats": max(seats), "headcount": headcount, "fte": rnd(fte, 2),
        "humanContacts": rnd(human), "botConversations": rnd(botN),
        "falseContained": rnd(falseContained), "silentUnresolved": rnd(silent),
        "repeatContacts": rnd(repeats),
        "vendorResolutionPct": rnd(100.0 * contained / botN, 1) if botN else 0.0,
        "trueBotResolutionPct": rnd(100.0 * botResolved / botN, 1) if botN else 0.0,
        "monthlyCost": rnd(humanCost + aiCost),
        "costPerResolved": rnd((humanCost + aiCost) / resolved, 2),
        "falseContainmentCost": rnd(falseContained * lv["price"] + repeatCost + churnCost),
        "allInCostPerResolved": rnd((humanCost + aiCost + churnCost) / resolved, 2),
    }


RUNGS = [
    ("today", {"auto": 0.0, "res": 0.85, "catch": 0.0, "uplift": 0.0, "price": 0.99}),
    ("vendor", {"auto": 0.70, "res": 0.85, "catch": 0.0, "uplift": 0.0, "price": 0.99}),
    ("assistOnly", {"auto": 0.0, "res": 0.85, "catch": 0.0, "uplift": 0.14, "price": 0.99}),
    ("safeOnly", {"auto": 0.35, "res": 0.85, "catch": 0.0, "uplift": 0.0, "price": 0.99}),
    ("withHandoff", {"auto": 0.35, "res": 0.85, "catch": 0.70, "uplift": 0.0, "price": 0.99}),
    ("plan", {"auto": 0.35, "res": 0.85, "catch": 0.70, "uplift": 0.14, "price": 0.99}),
    ("pushTo90", {"auto": 0.90, "res": 0.85, "catch": 0.70, "uplift": 0.14, "price": 0.99}),
    ("perConversation2", {"auto": 0.35, "res": 0.85, "catch": 0.70, "uplift": 0.14, "price": 2.00}),
]


def main():
    S = load_sample()
    out = {"playground": playground(S), "simulator": {k: simulate(v) for k, v in RUNGS}}
    json.dump(out, sys.stdout, indent=1, sort_keys=True)
    print()


if __name__ == "__main__":
    main()
