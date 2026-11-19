# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Rahulboss7788/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Rahulboss7788/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Atlas — the best offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. Every trophy is shown with its official name, description and grade, plus a guide written in our own words that cites its sources, a five-stage roadmap to the Platinum, missable-trophy flags, and a checklist that saves progress in the browser, exports it to a file and imports it back. Filters cover story, missable, collectibles, activities and online (there are no online trophies — all 55 are single-player), and a spoiler setting hides story trophies until they are earned. The app is plain static files under `app/` with no build step and makes no network requests at run time.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. To hand the entry in locally:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## What's inside

- `app/index.html`, `app/style.css`, `app/app.js` — the guide and tracker (original code, system fonts only, no external assets).
- `app/data/trophies.json` — the official 55-trophy list (names, descriptions, grades exactly as published) with a cited guide, kind, missable flag and roadmap stage for each trophy.
- `screenshots/` — 4 screenshots of the app running in a browser.
- `main.ts` — copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=xt0p49wj&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
