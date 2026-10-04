# Synapse Econs

Retrieval practice, spaced repetition and confidence checks for Singapore-Cambridge A-Level **H1 Economics (8843)**. Built from the Synapse Tamil structure.

## Structure

A static site with no build step, deployed on Vercel (`vercel.json`, clean URLs).

| File | What it is |
|---|---|
| `index.html` | Home page: learning science and the labs grid |
| `concepts.html` | Concepts Lab (AO1): every H1 definition, drilled both ways |
| `shifts.html` | Diagrams Lab: pick the curve that shifts, then the new equilibrium; draws the diagram |
| `chains.html` | Chains Lab (AO3): order the links of an explain-question chain of reasoning |
| `data.html` | Data Response Lab (AO2): mini case studies with extract, table, chart; MCQ calculations and self-marked explain questions |
| `evaluate.html` | Evaluation Lab (AO4): unstated assumptions, "it depends on", strongest judgement |
| `assets/lab.css` | Shared lab styles (light and dark) |
| `docs/h1-economics-content-map.md` | Syllabus content map and lab plan |

Each lab keeps its items as an inline array near the top of its `<script>` (`TERMS`, `SCEN`, `CHAINS`, `SETS`, `EVALS`), each tagged with a syllabus topic code (`k`, e.g. `2.1`); add an item there to add it to the drill. Progress is stored per lab in `localStorage` (`synapse-econs-*-v1`). Add `?view=architect` to a lab URL to see item ids and spacing boxes.

## Run locally

```
python3 -m http.server 8000
```

## JC1 / JC2

The labs open on JC1 topics (Theme 1 and Theme 2: scarcity, markets, market failure and micro policies). Theme 3 (macroeconomics) is treated as JC2 and can be switched on in the Concepts, Diagrams and Chains labs. The Data Response and Evaluation labs currently hold JC1 items only.

## Sign-up and usage tracking

Students are asked once for their name, school, level and email, with a consent tick box (PDPA). With their consent the app records page views, finished rounds and finished cases against a random id. Skipping works: nothing is sent and the labs behave exactly as before. Progress is still saved on the device.

- `assets/track.js` is the form and sender, `assets/config.js` holds the settings. Leave `endpoint` empty to switch it all off.
- `docs/tracking/apps-script.gs` is the receiver. It runs in a Google Sheet owned by the site owner and writes to the `Signups`, `Events` and `Withdrawals` tabs. It can only add rows, so nothing can be read back through the public URL.
- Setup steps are in `docs/tracking/SETUP.md`.
