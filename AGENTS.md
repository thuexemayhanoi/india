# India — AGENTS.md (Hindi SEO architecture and content factory contract)
**Scope:** ONLY `thuexemayhanoi/india`. Production domain: https://hi.rentbikehanoi.com/.

## Source of truth
- First read `data/site.json`, `data/seo-master-matrix.json`, `data/editorial-plan.json`, `data/factory-state.json` and this contract.
- Never mix business facts from `/vanchinh`: this site uses Nguyễn Tú, 112 Nguyễn Văn Cừ, Bồ Đề, Long Biên, Hà Nội, +84 942 467 674, 09:00–21:00.
- Production URL / canonical / article / published content must not be altered without separate explicit approval. Never force push.
- No generic "no deposit" claim. E-bike prices must remain "contact to confirm". External references are not proof of this business's prices.

## Taxonomy contract
- Homepage is one PILLAR, six HUB paths are listed in `nav`, child SILO `parent` links to one HUB, SUPPORT is a planned future article and does not create routes yet.
- Header mega-menu, mobile navigation, footer and breadcrumb derive from `data/site.json`; do not maintain separate hard-coded menu arrays.
- Every URL owns one search intent and one canonical. Do not clone existing URL to satisfy volume targets.
- New SILO files have editorial status STAGED_NEW until review, build and owner-approved merge.

## Factory safety — modeled on /vanchinh, not copied
- 300 articles MAXIMUM target, not an automatic publication quota; 6 possible batches x 50, article plans may be fewer if no genuine topical gap.
- Status `PREFLIGHT_ONLY`, no AI Writer/cron/API keys, no auto publishing; `hindi-factory-preflight.yml` is read-only.
- Phase 2 must implement verified queue + claim + scoped quality and SEO thresholds + checkpoint/recovery + transactional publish. Treat uncertain or conflicting intent as REVIEW; never auto-publish.
- Decisions: ALLOW_CREATE, UPGRADE_EXISTING, REVIEW_COLLISION, REJECT_DUPLICATE. Duplicate check covers published, draft, plan and writer queue.
- Do not write 300 template articles before researching intent coverage, accuracy, legal sources and quality.
- No claim of AEO/GEO placement or Google rankings without verified data.

## Build, QA and rollback
- Build: `node scripts/build.mjs`; test: `node tests/qa.mjs`; factory preflight: `node scripts/factory-preflight.mjs`.
- Branch and PR before any production merge; CI green is not proof of legal/Hindi/mobile or SEO readiness.
- Preserve old 25 URL paths and sitemap legacy entries. Rollback by discarding branch before merge or reverting specific merge commit after approval.
