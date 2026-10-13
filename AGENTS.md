# India — AGENTS.md (Hindi SEO architecture and content factory contract)
**Scope:** ONLY `thuexemayhanoi/india`. Production domain: https://hi.rentbikehanoi.com/.

## Source of truth
- First read `data/site.json`, `data/seo-master-matrix.json`, `data/editorial-plan.json`, `data/factory-state.json` and this contract.
- Never mix business facts from `/vanchinh`: this site uses Nguyễn Tú, 112 Nguyễn Văn Cừ, Bồ Đề, Long Biên, Hà Nội, +84 942 467 674, 09:00–21:00.
- Production URL / canonical / article / published content must not be altered without separate explicit approval. Never force push.
- No generic "no deposit" claim. E-bike prices must remain "contact to confirm". External references are not proof of this business's prices.

## Taxonomy contract
- Homepage is one PILLAR, six HUB paths are listed in `nav`, child SILO `parent` links to one HUB, SUPPORT routes are created ONLY when their structured Hindi article passes Factory QA and is committed to PUBLISHED.
- Header mega-menu, mobile navigation, footer and breadcrumb derive from `data/site.json`; do not maintain separate hard-coded menu arrays.
- Every URL owns one search intent and one canonical. Do not clone existing URL to satisfy volume targets.
- New SILO files have editorial status STAGED_NEW until review, build and owner-approved merge.

## Factory safety — modeled on /vanchinh, not copied
- 300 approved topic briefs are planned in 6 batches x 50; do not publish filler and REVIEW unverifiable or overlapping topics.
- State `AUTO_PUBLISH_READY`: external AI Writer is authorized to submit on isolated `writer-inbox`; deterministic publisher runs with CI gates, no paid AI API keys.
- Queue, pair quality gate, checkpoint, immutable published rows and Git-atomic publish are implemented; **multi-writer durable leasing and robust recovery for interrupted runs are NOT yet implemented**. Use only one external writer session until further hardening. Treat uncertain or conflicting intent as REVIEW.
- Decisions: ALLOW_CREATE, UPGRADE_EXISTING, REVIEW_COLLISION, REJECT_DUPLICATE. Duplicate check covers known routes, planned titles, queued IDs and published prose; it is a heuristic and cannot guarantee complete semantic detection.
- Do not write 300 template articles before researching intent coverage, accuracy, legal sources and quality.
- No claim of AEO/GEO placement or Google rankings without verified data.

## Build, QA and rollback
- Build: `node scripts/build.mjs`; test: `node tests/qa.mjs`; factory preflight: `node scripts/factory-preflight.mjs`.
- Branch and PR before any production merge; CI green is not proof of legal/Hindi/mobile or SEO readiness.
- Preserve old 25 URL paths and sitemap legacy entries. Rollback by discarding branch before merge or reverting specific merge commit after approval.

## External AI Writer is authorized for auto-publish
- Owner authorized automatic publication of PASS content under the deterministic CI publisher, WITHOUT per-article human approval. Production content protection and safety checks remain mandatory.
- External AI Writer only writes `writer-inbox:content/incoming/HIxxxx.json`; no writes to `main`, no modification of PUBLISHED articles.
- 300 original Hindi topics in `data/editorial-plan.json`; see `docs/EXTERNAL-WRITER-HI.md`. /vanchinh is workflow architecture only, never content source.
- No API key or AI generation in the GitHub Actions workflow; external writer must supply fact-checked text and genuine sources.
