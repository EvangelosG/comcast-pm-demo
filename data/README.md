# Subscriber data

Synthetic data for product demos. No real customers are represented. Regenerate with `python3 scripts/generate_data.py`.

The data covers 6,000 Peacock sign-ups between 1 October and 15 November 2025, observed until 15 January 2026. The NBA tip-off window is 21 to 27 October 2025.

## subscribers.csv

One row per subscriber.

| Column | Meaning |
|---|---|
| `subscriber_id` | Unique ID |
| `signup_date` | Date the subscription started |
| `plan` | `Premium` or `Premium Plus` |
| `signup_device` | Device used to sign up |
| `acquisition_channel` | How the subscriber arrived |
| `promo_offer` | Offer used at sign-up, or `None` |
| `region` | US region |
| `cancel_date` | Date the subscriber cancelled; empty if still active on 15 January 2026 |

## subscriber_events.csv

One row per event.

| Column | Meaning |
|---|---|
| `subscriber_id` | Matches `subscribers.csv` |
| `event_date` | Date of the event |
| `event_type` | `signup`, `stream` or `cancel` |
| `content_category` | Category watched (stream events only) |
| `minutes_watched` | Minutes watched (stream events only) |
| `device` | Device used |

A subscriber counts as churned within 30 days when `cancel_date` is 30 days or fewer after `signup_date`.
