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
| `assets/lab.css` | Shared lab styles (light and dark) |
| `docs/h1-economics-content-map.md` | Syllabus content map and lab plan |

Each lab keeps its items as an inline array near the top of its `<script>` (`TERMS`, `SCEN`, `CHAINS`); add an item there to add it to the drill. Progress is stored per lab in `localStorage` (`synapse-econs-*-v1`). Add `?view=architect` to a lab URL to see item ids and spacing boxes.

## Run locally

```
python3 -m http.server 8000
```
