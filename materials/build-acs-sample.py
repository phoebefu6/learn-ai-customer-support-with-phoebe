"""Build assets/acs-sample.js for learn-ai-customer-support-with-phoebe.

Real rows: Banking77 (PolyAI, CC BY 4.0), from
https://github.com/PolyAI-LDN/task-specific-datasets/tree/master/banking_data
Citation: Casanueva, Temcinas, Gerz, Henderson, Vulic (2020), "Efficient Intent Detection with
Dual Sentence Encoders", Proceedings of the 2nd Workshop on NLP for ConvAI - ACL 2020,
arXiv:2003.04807.

Modified (CC BY 4.0 asks us to say so):
- TRAIN: 24 rows per intent drawn with a fixed seed from train.csv (1,848 rows). These are the
  examples the in-browser classifier learns its intent centroids from.
- TEST: 8 rows per intent drawn with a fixed seed from test.csv (616 rows). These are the messages
  the playground triages. The text of every row is shipped unchanged.
- Each of the 77 intents is mapped to one of six display queues, and given a CONSTRUCTED
  Quayside risk tier (automate / assist / human). The tiers are a teaching judgement, not part of
  Banking77, and the page says so.
- trainVolume: the number of rows each intent has in the FULL train split (10,003 rows), used only
  by the "automate the busiest intents" preset as a volume proxy.

Nothing is predicted here. The classifier runs in the browser (assets/acs-live.js) and in
materials/acs_reference.py on exactly these rows.

Usage: python3 build-acs-sample.py <dir with b77_train.csv and b77_test.csv> <repo>/assets/acs-sample.js
"""
import csv, json, random, sys, collections

SEED = 20261109
K_TRAIN = 24
K_TEST = 8

QUEUES = ["Fraud and loss", "Cards", "Transfers", "Top-ups and cash", "Payments and fees", "Account and identity"]
MAP = {
 0: "lost_or_stolen_card lost_or_stolen_phone compromised_card card_payment_not_recognised cash_withdrawal_not_recognised direct_debit_payment_not_recognised card_swallowed",
 1: "activate_my_card card_about_to_expire card_acceptance card_arrival card_delivery_estimate card_linking card_not_working change_pin contactless_not_working disposable_card_limits get_disposable_virtual_card get_physical_card getting_spare_card getting_virtual_card order_physical_card pin_blocked virtual_card_not_working visa_or_mastercard apple_pay_or_google_pay supported_cards_and_currencies",
 2: "balance_not_updated_after_bank_transfer beneficiary_not_allowed cancel_transfer declined_transfer failed_transfer pending_transfer receiving_money transfer_fee_charged transfer_into_account transfer_not_received_by_recipient transfer_timing",
 3: "automatic_top_up pending_top_up top_up_by_bank_transfer_charge top_up_by_card_charge top_up_by_cash_or_cheque top_up_failed top_up_limits top_up_reverted topping_up_by_card verify_top_up atm_support cash_withdrawal_charge declined_cash_withdrawal pending_cash_withdrawal wrong_amount_of_cash_received wrong_exchange_rate_for_cash_withdrawal balance_not_updated_after_cheque_or_cash_deposit",
 4: "Refund_not_showing_up card_payment_fee_charged card_payment_wrong_exchange_rate declined_card_payment exchange_charge exchange_rate exchange_via_app extra_charge_on_statement pending_card_payment request_refund reverted_card_payment? transaction_charged_twice fiat_currency_support",
 5: "age_limit country_support edit_personal_details passcode_forgotten terminate_account unable_to_verify_identity verify_my_identity verify_source_of_funds why_verify_identity",
}

# CONSTRUCTED Quayside risk tiers: 0 automate, 1 assist, 2 human.
HUMAN = ("lost_or_stolen_card lost_or_stolen_phone compromised_card card_payment_not_recognised "
         "cash_withdrawal_not_recognised direct_debit_payment_not_recognised card_swallowed "
         "transaction_charged_twice wrong_amount_of_cash_received terminate_account "
         "unable_to_verify_identity verify_source_of_funds").split()
AUTOMATE = ("activate_my_card age_limit apple_pay_or_google_pay atm_support automatic_top_up "
            "card_about_to_expire card_acceptance card_delivery_estimate card_linking change_pin "
            "country_support disposable_card_limits exchange_charge exchange_rate exchange_via_app "
            "fiat_currency_support get_disposable_virtual_card get_physical_card getting_spare_card "
            "getting_virtual_card order_physical_card receiving_money supported_cards_and_currencies "
            "top_up_by_bank_transfer_charge top_up_by_card_charge top_up_by_cash_or_cheque top_up_limits "
            "topping_up_by_card transfer_into_account transfer_timing verify_my_identity why_verify_identity "
            "visa_or_mastercard edit_personal_details verify_top_up cash_withdrawal_charge").split()


def main(src, out):
    train = list(csv.DictReader(open(src + "/b77_train.csv", encoding="utf-8")))
    test = list(csv.DictReader(open(src + "/b77_test.csv", encoding="utf-8")))
    intents = sorted({r["category"] for r in train})
    assert len(intents) == 77
    iq = {i: q for q, s in MAP.items() for i in s.split()}
    assert set(iq) == set(intents), set(intents) ^ set(iq)
    assert not set(HUMAN) & set(AUTOMATE)
    assert set(HUMAN) <= set(intents) and set(AUTOMATE) <= set(intents)
    tier = [2 if i in HUMAN else 0 if i in AUTOMATE else 1 for i in intents]
    vol = collections.Counter(r["category"] for r in train)

    rng = random.Random(SEED)
    by_tr = collections.defaultdict(list)
    for r in train:
        by_tr[r["category"]].append(r["text"].strip())
    by_te = collections.defaultdict(list)
    for r in test:
        by_te[r["category"]].append(r["text"].strip())
    trX, trY, teX, teY = [], [], [], []
    for k, i in enumerate(intents):
        for t in rng.sample(by_tr[i], K_TRAIN):
            trX.append(t); trY.append(k)
        for t in rng.sample(by_te[i], K_TEST):
            teX.append(t); teY.append(k)

    data = {
        "source": "Banking77 (PolyAI, CC BY 4.0): %d train rows (%d per intent) and %d test rows (%d per intent), seed %d"
                  % (len(trX), K_TRAIN, len(teX), K_TEST, SEED),
        "licence": "CC BY 4.0, https://creativecommons.org/licenses/by/4.0/",
        "citation": "Casanueva, Temcinas, Gerz, Henderson, Vulic 2020, Efficient Intent Detection with Dual Sentence Encoders, arXiv:2003.04807",
        "modified": "rows sampled; intents mapped to six queues; Quayside risk tiers are CONSTRUCTED",
        "seed": SEED,
        "intents": intents,
        "queues": QUEUES,
        "intentQueue": [iq[i] for i in intents],
        "tier": tier,
        "trainVolume": [vol[i] for i in intents],
        "trainText": trX, "trainY": trY,
        "testText": teX, "testY": teY,
    }
    head = ("/* Derived from Banking77 (PolyAI, CC BY 4.0, github.com/PolyAI-LDN/task-specific-datasets). "
            "Modified: rows sampled with seed %d; intents mapped to six queues; Quayside risk tiers are constructed. "
            "Generated by materials/build-acs-sample.py - do not edit by hand. */\n" % SEED)
    with open(out, "w", encoding="utf-8") as f:
        f.write(head + "var ACS_SAMPLE = " + json.dumps(data, ensure_ascii=True, separators=(",", ":")) + ";\n"
                "if (typeof window !== 'undefined') window.ACS_SAMPLE = ACS_SAMPLE;\n"
                "if (typeof module !== 'undefined') module.exports = ACS_SAMPLE;\n")
    print("wrote", out, "train", len(trX), "test", len(teX),
          "tiers automate/assist/human", tier.count(0), tier.count(1), tier.count(2))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
