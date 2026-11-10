"""Generates the synthetic datasets in data/. All records are made up.

Run: python3 scripts/generate_data.py
"""
import csv
import random
from datetime import date, timedelta
from pathlib import Path

random.seed(2025)
OUT = Path(__file__).resolve().parent.parent / "data"

SIGNUP_START = date(2025, 10, 1)
SIGNUP_END = date(2025, 11, 15)
TIPOFF_START = date(2025, 10, 21)
TIPOFF_END = date(2025, 10, 27)
OBSERVED_UNTIL = date(2026, 1, 15)
N_SUBSCRIBERS = 6000

PLANS = [("Premium", 0.68), ("Premium Plus", 0.32)]
DEVICES = [("Smart TV", 0.38), ("Mobile", 0.27), ("Streaming stick", 0.18), ("Web", 0.11), ("Game console", 0.06)]
CHANNELS = [("Organic search", 0.24), ("Paid social", 0.22), ("Xfinity bundle", 0.20), ("TV ad", 0.14),
            ("App store", 0.12), ("Referral", 0.08)]
REGIONS = [("Northeast", 0.27), ("South", 0.31), ("Midwest", 0.20), ("West", 0.22)]
CATEGORIES = ["Sports", "Drama", "Comedy", "Reality", "Movies", "Kids", "News"]

CHURN_BASE = 0.11
CHURN_MULTIPLIER = {
    "NBA Tip-Off $2.99 first month": 2.5,
    "Annual plan discount": 0.2,
    "Included with Xfinity": 0.45,
    "Paid social": 1.45,
    "Referral": 0.7,
    "Mobile": 1.3,
    "Smart TV": 0.8,
    "Premium Plus": 0.7,
}


def pick(options):
    r, total = random.random(), 0.0
    for value, weight in options:
        total += weight
        if r <= total:
            return value
    return options[-1][0]


def signup_date():
    days = (SIGNUP_END - SIGNUP_START).days + 1
    weights = [4.0 if TIPOFF_START <= SIGNUP_START + timedelta(d) <= TIPOFF_END else 1.0 for d in range(days)]
    return SIGNUP_START + timedelta(random.choices(range(days), weights)[0])


def promo_for(channel, signed_up):
    if channel == "Xfinity bundle":
        return "Included with Xfinity"
    in_window = TIPOFF_START <= signed_up <= TIPOFF_END
    r = random.random()
    if in_window and r < (0.75 if channel in ("Paid social", "TV ad") else 0.45):
        return "NBA Tip-Off $2.99 first month"
    if r > 0.90:
        return "Annual plan discount"
    return "None"


def main():
    OUT.mkdir(exist_ok=True)
    subscribers, events = [], []
    for i in range(1, N_SUBSCRIBERS + 1):
        sid = "S%05d" % i
        signed_up = signup_date()
        plan, device, channel, region = pick(PLANS), pick(DEVICES), pick(CHANNELS), pick(REGIONS)
        promo = promo_for(channel, signed_up)

        sports_fan = random.random() < (0.8 if promo.startswith("NBA") else 0.35)
        n_categories = 1 if sports_fan and random.random() < 0.55 else random.randint(2, 4)
        favorites = (["Sports"] if sports_fan else []) + random.sample(CATEGORIES[1:], 3)
        favorites = favorites[:n_categories]

        p = CHURN_BASE
        for key in (promo, channel, device, plan):
            p *= CHURN_MULTIPLIER.get(key, 1.0)
        p *= 1.7 if n_categories == 1 else 0.75
        churned_30 = random.random() < min(p, 0.9)

        if churned_30:
            if promo.startswith("NBA") and random.random() < 0.65:
                tenure = random.randint(27, 30)  # cancels just before the price steps up
            else:
                tenure = random.randint(3, 30)
        elif random.random() < 0.12:
            tenure = random.randint(31, 75)
        else:
            tenure = None
        cancel_date = signed_up + timedelta(tenure) if tenure else None
        if cancel_date and cancel_date > OBSERVED_UNTIL:
            cancel_date = None

        subscribers.append([sid, signed_up.isoformat(), plan, device, channel, promo, region,
                            cancel_date.isoformat() if cancel_date else ""])
        events.append([sid, signed_up.isoformat(), "signup", "", "", device])

        last_day = cancel_date or OBSERVED_UNTIL
        active_days = (last_day - signed_up).days
        sessions_per_week = random.uniform(0.6, 2.0) if churned_30 else random.uniform(1.0, 3.2)
        n_sessions = max(1, min(30, int(active_days / 7 * sessions_per_week)))
        for _ in range(n_sessions):
            day = signed_up + timedelta(random.randint(0, max(active_days - 1, 0)))
            category = random.choice(favorites)
            minutes = random.randint(60, 170) if category == "Sports" else random.randint(15, 95)
            watch_device = device if random.random() < 0.8 else pick(DEVICES)
            events.append([sid, day.isoformat(), "stream", category, minutes, watch_device])
        if cancel_date:
            events.append([sid, cancel_date.isoformat(), "cancel", "", "", ""])

    events.sort(key=lambda e: (e[1], e[0]))
    with open(OUT / "subscribers.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["subscriber_id", "signup_date", "plan", "signup_device", "acquisition_channel",
                    "promo_offer", "region", "cancel_date"])
        w.writerows(subscribers)
    with open(OUT / "subscriber_events.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["subscriber_id", "event_date", "event_type", "content_category", "minutes_watched", "device"])
        w.writerows(events)
    print(len(subscribers), "subscribers,", len(events), "events")


if __name__ == "__main__":
    main()
