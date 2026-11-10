# Comcast PM demo

A demo workspace for showing Devin to product, research, analytics and strategy teams.

Everything here is fictional. The data, interview participants, backlog and catalog titles are synthetic and were written for demos. Nothing comes from Comcast systems.

## What is in here

| Folder | Contents |
|---|---|
| `app/` | A small Stream home screen with a Continue Watching row |
| `design-system/` | Colors, type, spacing and component rules for the app |
| `data/` | Synthetic Peacock sign-up and viewing data around the 2025 NBA tip-off |
| `research/` | 12 customer interview transcripts about getting back to a show |
| `backlog/` | 25 open epics with reach, evidence, effort and dependencies |
| `scripts/` | The script that generates the data |
| `walkthrough/` | A standalone page with four example prompts and their outputs. Download `devin-for-product-teams.html` and open it in a browser |

## Run the app

```
cd app
npm start
```

Open http://localhost:3000. Select a title to watch 15 minutes of it, then switch device at the top right. Continue Watching is saved per device, so the row is empty on the other devices.

Run the tests with `npm test`. The app has no dependencies to install.
