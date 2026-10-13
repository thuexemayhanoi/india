# India Hindi website — Phase 1 report (2026-10-13)

## Verified repository inventory
- Target: `thuexemayhanoi/india`, public, default branch `main`.
- Before work: `CNAME` (`hi.rentbikehanoi.com`) and `README.md` only. No published pages, posts, categories or site builder in the repository at inspection time.
- Deployment status and live DNS were **not verified**. No GSC, traffic, keyword volume, or rankings were queried.
- Safety: this change is staged on `feature/hindi-site-foundation`. **Not merged, not deployed, no writer started**.

## Scope and architecture
- Hindi Devanagari URLs, `lang=hi-IN`, one homepage money intent `हनोई में मोटरबाइक किराए पर लें`.
- 25 foundation pages: homepage, category hubs, subcategory pages, FAQ, about, contact, privacy and terms.
- 0 longform supporting articles generated; 300 article editorial planning reserved for Phase 2 after topical collision review.
- Shared JS static generator and site.json produce navigation, header/footer, SEO markup, sitemap and page templates.
- Reference inspiration: Riderly Hanoi layout and browse-by-bike pattern only. No Riderly content, prices, review claims or brand assets copied.

## SEO matrix snapshot
- Source: code inventory on this branch, not a production crawl.
- Homepage PILLAR: `/` owns core commercial intent.
- HUB: 6; SILO: 13; FAQ: 1; UTILITY: 4.
- See `data/seo-master-matrix.json` for each route, purpose and status.
- All category/subcategory pages are *staged draft content* requiring Hindi copy/edit and intent review before publication. In particular: privacy and terms require legal review. No large-scale content or GSC matrix is asserted.

## Content collision guard for Phase 2
- New topic -> normalize Hindi/English/Vietnamese variants -> compare URL/topic registry and PUBLISHED+DRAFT+QUEUE -> evaluate search intent, entity, semantic overlap -> ALLOW_CREATE / UPGRADE_EXISTING / REVIEW_COLLISION / REJECT_DUPLICATE.
- Ambiguity => REVIEW_COLLISION, never auto-publish. Editorial targets capped at up to 300 only after gap evaluation.

## Risk register
1. P0: Production not verified (GitHub Pages, DNS and SSL): verify before merge/deployment.
2. P0: No 300-article matrix/source content: run full gap mapping in Phase 2.
3. P1: Hindi editorial proofreading by native speaker, local place name transliteration, legal/licensing references.
4. P1: New category pages are short: expand only where user search intent and factual evidence justify it before launch.
5. P1: Privacy and terms are preliminary informative copy, not an attorney-reviewed binding policy.
6. P2: Replace custom illustrated bike placeholders with permission-cleared photos of actual fleet only after verifying images represent the offered models.
7. P2: Mobile and Core Web Vitals need instrumented browser QA, not merely static checks.

## Read-only baseline and rollback
- Base main commit: `6a2a5100f84c3bfc3b2974ec84eff5998d76493b`.
- Original root CNAME stays exactly `hi.rentbikehanoi.com`.
- All writes limited to `feature/hindi-site-foundation`; rollback = delete feature branch or abandon PR. Production remains untouched.

## QA and deployment plan
1. Run `node scripts/build.mjs && node tests/qa.mjs` on a working checkout.
2. Compare generated routes, check mobile 375px/768px/1440px and contrast, keyboard navigation.
3. Native Hindi editorial review and check data, legal/privacy content, collision matrix.
4. Verify GitHub Pages source, DNS CNAME and HTTPS, plus crawl staging.
5. Request owner approval separately before merge to main/deploy.
