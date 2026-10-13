# Hindi India — Hub/Silo architecture audit and implementation proposal

Date: 2026-10-13 · Target `thuexemayhanoi/india`, source `main` SHA `7ef8c754ea6142d282dd8514eebcdbad6e812e37`.

## Evidence baseline (read-only inventory)
- India `main` before branch: 25 static pages, 1 homepage PILLAR, 6 HUBs, 13 SILOs, 1 FAQ and 4 UTILITY pages; canonical domain `https://hi.rentbikehanoi.com/`. `CNAME` unchanged.
- `/vanchinh` inspected: seven workflows including `factory-publish.yml`, `article-quality.yml`, `article-batch.yml`; operates external-writer queue 2–10 articles, pair QA/publish, claims/checkpoint/transaction state, separate site-quality.
- Do NOT copy `/vanchinh` business info, its 2,000-article count, URLs or writer tokens. India target max 300 articles.
- GSC data unavailable: no claims of existing ranking, crawl coverage or keyword volume.

## Audit classification
- KEEP: existing 25 routes, canonical domain, CNAME, shared HTML generator, and all reference prices.
- UPGRADE: menu/footer taxonomy (previously top-level only), Hub contextual copy, home and silo breadcrumbs, CI taxonomy checks.
- CREATE (on isolated branch; not production): 11 missing Silo routes with unique intended purpose, totaling 36 routes. New pages require native Hindi, factual and semantic review before merging.
- REVIEW: content depth of category pages; privacy and terms are not attorney-reviewed and should be verified before publishing changes.
- SUPPORT: 0 new long-form articles now, 300-article research phase deferred.

## Completed taxonomy
- **बाइक के प्रकार** `/बाइक-के-प्रकार/` — 5 SILOs
  - /बाइक-के-प्रकार/गियर-बाइक/ (PUBLISHED_BASELINE)
  - /बाइक-के-प्रकार/ऑटोमैटिक-स्कूटर/ (PUBLISHED_BASELINE)
  - /बाइक-के-प्रकार/पचास-सीसी/ (PUBLISHED_BASELINE)
  - /बाइक-के-प्रकार/इलेक्ट्रिक-बाइक/ (PUBLISHED_BASELINE)
  - /बाइक-के-प्रकार/इलेक्ट्रिक-साइकिल/ (STAGED_NEW)
- **किराया और कीमतें** `/किराया-और-कीमतें/` — 3 SILOs
  - /किराया-और-कीमतें/दैनिक-किराया/ (PUBLISHED_BASELINE)
  - /किराया-और-कीमतें/साप्ताहिक-किराया/ (PUBLISHED_BASELINE)
  - /किराया-और-कीमतें/मासिक-किराया/ (PUBLISHED_BASELINE)
- **जमा और बुकिंग** `/जमा-और-बुकिंग/` — 3 SILOs
  - /जमा-और-बुकिंग/सुरक्षा-जमा/ (STAGED_NEW)
  - /जमा-और-बुकिंग/बुकिंग-प्रक्रिया/ (STAGED_NEW)
  - /जमा-और-बुकिंग/डिलीवरी-और-वापसी/ (STAGED_NEW)
- **हनोई के इलाके** `/हनोई-के-इलाके/` — 7 SILOs
  - /हनोई-के-इलाके/ओल्ड-क्वार्टर/ (PUBLISHED_BASELINE)
  - /हनोई-के-इलाके/लॉन्ग-बिएन/ (PUBLISHED_BASELINE)
  - /हनोई-के-इलाके/होआन-कीएम/ (PUBLISHED_BASELINE)
  - /हनोई-के-इलाके/वेस्ट-लेक/ (PUBLISHED_BASELINE)
  - /हनोई-के-इलाके/गिया-लाम/ (STAGED_NEW)
  - /हनोई-के-इलाके/बा-दिन्ह/ (STAGED_NEW)
  - /हनोई-के-इलाके/हाई-बा-त्रुंग/ (STAGED_NEW)
- **किराये की गाइड** `/किराये-की-गाइड/` — 4 SILOs
  - /किराये-की-गाइड/कागजात-और-लाइसेंस/ (PUBLISHED_BASELINE)
  - /किराये-की-गाइड/सुरक्षित-सवारी/ (PUBLISHED_BASELINE)
  - /किराये-की-गाइड/वाहन-जाँच/ (STAGED_NEW)
  - /किराये-की-गाइड/किराया-अनुबंध/ (STAGED_NEW)
- **यात्रा के मार्ग** `/सुझाए-गए-रूट/` — 2 SILOs
  - /सुझाए-गए-रूट/शहर-की-यात्रा/ (STAGED_NEW)
  - /सुझाए-गए-रूट/लंबी-यात्रा-की-तैयारी/ (STAGED_NEW)

## P0–P4 plan
- P0: run full QA and inspect canonical/metadata changes; check main remains unchanged.
- P1: enhance Hub/Silo navigation, mobile dropdown, footer, breadcrumbs and related links using one config; validate.
- P2: evaluate supporting article quality and contextual links after traffic data and production inventory.
- P3: research unique topics against all current pages and draft editorial items, then fill 300-cap plan only with genuine information gaps.
- P4: optional topic expansion on evidence; never bulk-create templates or AI duplicates.

## Deliverables
- Global inventory: `data/seo-master-matrix.json` (all 36 routes, with branch-vs-live status).
- Cannibalization guard: `scripts/factory-preflight.mjs`, `data/content-collision-spec.json`; exact route and normalized title screening is implemented, semantic checks still need design/integration in Phase 2.
- Topical Coverage / Knowledge Graph: `data/topical-coverage.json` + `data/site.json` (route > parent Hub relation).
- Internal Linking: generated nav dropdown, footer, breadcrumbs and Hub children; external links unchanged.
- Editorial Plan: `data/editorial-plan.json` is EMPTY intentionally, cap 300, no fabricated keyword volume or rankings.
- Factory state: `data/factory-state.json` PAUSED; no secret, no writer, no auto-publish.
- QA: `tests/qa.mjs` + `hindi-factory-preflight.yml`, existing `hindi-site-qa.yml`.
- Rollback: discard feature branch if not approved. Do not merge or deploy automatically.

## Risks / uncertainty
1. **P0**: New draft SILOs need native Hindi proofreading and credible topical content review prior to production indexing.
2. **P0**: Legal privacy/terms and driver licensing need authoritative references/legal review.
3. **P1**: Automated collision preflight is lexical and URL-based only; semantic intent screening and PUBLISHED/DRAFT/QUEUE ingestion incomplete — it fails closed on insufficient evidence.
4. **P1**: Browser-based visual and mobile testing, Lighthouse/Core Web Vitals not completed by the repo CI.
5. **P1**: No GSC data or actual search volumes; gap plan cannot accurately name all 300 article topics yet.
6. **P2**: Planned static routing in Devanagari must be tested across deployment/CDN and browser combinations.
