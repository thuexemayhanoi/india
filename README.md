# India · Hindi Hanoi Motorbike Rental

**Domain:** https://hi.rentbikehanoi.com/  
**Production branch:** `main` · **Writer branch:** `writer-inbox`  
**Language:** Hindi (`hi-IN`), Devanagari URL paths.  
**Owner:** thuexemayhanoi

## Build & QA

```sh
node scripts/build.mjs
node tests/qa.mjs
```

No npm dependencies. Pages are pre-rendered to repository root for future GitHub Pages use. Edit `data/site.json` as the shared architecture/config, update `scripts/build.mjs` templates and `assets/site.css`, then rebuild. HTML is included in the feature branch for review; deployment requires separate approval. Do not edit generated HTML manually.

## Phase 1

Homepage commercial pillar + foundation Hub/Silo/utility pages generated from shared site.json. `CNAME` remains unchanged. Writer automation is implemented separately from UI; no stock photos, invented ratings or live rental booking engine. Prices are reference values and deposit requires confirmation.

## Phase 2 architecture (implemented with manual editorial verification)

The approved 300-topic editorial plan and deterministic external-writer auto publisher have now been added. No articles were authored or published during setup; verify source credibility and search intent during authoring. Follow `reports/phase-1.md`.


## Phase 1.5: Topic architecture + read-only factory preparation

- Master taxonomy: `data/site.json` (36 URL drafts, 6 Hub / 24 Silo).
- GitHub workflow: `.github/workflows/hindi-factory-preflight.yml` (PR checks; no writes).
- Manual dry-run: `.github/workflows/hindi-article-batch.yml` (B01–B06 × 50 article capacity; no writer/publisher).
- Reports: `data/global-content-inventory.json`, `data/cannibalization-matrix.json`, `data/knowledge-graph.json`, `data/internal-linking-matrix.json`, `data/topical-gap-report.json`, `data/content-upgrade-backlog.json`.
- Writer operates only on a dedicated branch. Publisher updates main with Git atomic commits after QA; no per-post approval. Semantic ambiguity requires REVIEW; multi-writer leasing is not implemented.

## External Hindi Writer Factory
The Editorial Plan has 300 topic briefs (6 batches × 50). Writer pushes pairs of structured Hindi JSON to `writer-inbox/content/incoming/`. GitHub Actions `hindi-factory-publish.yml` imports only allowed IDs, runs deterministic QA and publishes accepted pages automatically to `main`. See `docs/EXTERNAL-WRITER-HI.md`. No article content is copied from `/vanchinh`.

## Hindi Local AI & Quick Contact (shared /web feature port)
The on-page two floating buttons are ported from `thuexemayhanoi/web`; responsive behaviour is adapted from `thuexemayhanoi/spanish`. The India pages keep blue/navy/gold styling.
The widgets are injected on every page by existing `assets/site.js`, so all published/future Hindi articles get them without changing URL, canonical, sitemap or SEO markup.

- Quick Contact lower-left: Phone, WhatsApp, Zalo, Maps
- AI Local lower-right: full English/Vietnamese /web rules + Hindi, stateful model/duration/quantity, VND arithmetic, searchable content, related article links, topic chips, cached index refreshed on open, no external model API
- Mobile: iOS VisualViewport keyboard protection, no floating controls over menu, mutual exclusion, Escape and click-away, aria-expanded.
- Business facts from `data/site.json`, prices published only. Electric price unknown; never invent.
- Search index `assets/chat/search-index.json` auto-rebuilt by `scripts/build.mjs` using **published** articles and Hub/Silo pages (never drafts). It loads lazily when opening chat.
- WhatsApp and Zalo phone links exist but account activation has not been verified.

Validate: `node scripts/build.mjs && node tests/qa.mjs && node tests/floating-qa.mjs`. Read `docs/INDIA-FLOATING-AI-QUICK-CALL.md`.
