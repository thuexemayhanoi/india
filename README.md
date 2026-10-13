# India · Hindi Hanoi Motorbike Rental

**Domain:** https://hi.rentbikehanoi.com/  
**Branch:** `feature/hindi-site-foundation` (Phase 1, not production)  
**Language:** Hindi (`hi-IN`), Devanagari URL paths.  
**Owner:** thuexemayhanoi

## Build & QA

```sh
node scripts/build.mjs
node tests/qa.mjs
```

No npm dependencies. Pages are pre-rendered to repository root for future GitHub Pages use. Edit `data/site.json` as the shared architecture/config, update `scripts/build.mjs` templates and `assets/site.css`, then rebuild. HTML is included in the feature branch for review; deployment requires separate approval. Do not edit generated HTML manually.

## Phase 1

Homepage commercial pillar + 24 Hindi pages across topical hubs, nested categories, FAQ, About, Contact, Privacy and Terms. `CNAME` remains unchanged. No 300 article writer is enabled, no stock photos or invented ratings, no live rental booking engine. Prices are reference values and deposit requires confirmation.

## Phase 2 (future, explicitly deferred)

Audit the published/draft registry, create Topical Matrix and evidence-based 300-topic Editorial Plan, integrate collision guard and article production/checkpoints only after review. Follow `reports/phase-1.md`.


## Phase 1.5: Topic architecture + read-only factory preparation

- Master taxonomy: `data/site.json` (36 URL drafts, 6 Hub / 24 Silo).
- GitHub workflow: `.github/workflows/hindi-factory-preflight.yml` (PR checks; no writes).
- Manual dry-run: `.github/workflows/hindi-article-batch.yml` (B01–B06 × 50 article capacity; no writer/publisher).
- Reports: `data/global-content-inventory.json`, `data/cannibalization-matrix.json`, `data/knowledge-graph.json`, `data/internal-linking-matrix.json`, `data/topical-gap-report.json`, `data/content-upgrade-backlog.json`.
- Production remains on main unchanged until explicit merge approval; future factory build needs real semantic collision evaluation, transaction/recovery, article QA and editorial approval.
