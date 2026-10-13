# India Factory hardening audit (2026-10-13)
**Status:** Candidate changes on `audit/india-factory-hardening`, not production.
**Baseline:** `main` SHA `8b71027a75278055a17975c066fe35389f494c5e`; 36 published foundation pages, 300 planned Hindi article IDs, 0 published AI articles. Writer branch exists with no incoming file.
## Blocking risks
1. REVIEW rows could previously be processed automatically if writer posted a valid article. Guard now refuses any REVIEW pair.
2. QA scoring accepted highly repetitive paragraphs (sandbox repetitive fixtures scored 100). Added duplicate paragraph and high-frequency repeated phrase gate. Source host diversity and placeholder-source rejection added. These rules reduce risk but do not prove factual accuracy, intent uniqueness or originality.
3. Report-only commits would otherwise happen when all articles failed. Now audit output stays in Actions logs if none pass; main unchanged.
4. Production Actions did not run read-only QA on main pushes; workflow triggers strengthened.
5. Real writer-to-Pages end-to-end remains untested. Pages REST rebuild path may be unsupported or miss permissions.
6. No multi-writer ID lease or recovery contract. Single writer only.
7. GitHub branch protection could not be inspected (403); repository ruleset list returned empty. Check protection in GitHub settings before giving AI write credentials.
## Topical conflicts to review
- HI0128 / HI0177: opposite directions Old Quarter <> Long Biên (not necessarily duplicate; review distinct actionable intent).
- HI0052 / HI0120: electric motorcycle vs electric bicycle comparisons.
- HI0069 / HI0288: deposit return rules general vs electric bicycle (specialty must have unique substance).
## What to do before running 300 articles
- Approve this PR after CI, then run one controlled, real externally authored 2-article pilot from writer-inbox.
- Confirm Pages build succeeded after token commit and verify article URLs, canonical, sitemap and parent Silo links live.
- Preserve 300 planned topics but downgrade near-duplicate/uncorroborated drafts to REVIEW.
- Validate references and legal assertions independently; syntax and writer attestation are not sufficient.
- Confirm main branch protection and minimum-scope writer credential.
- Do NOT bulk publish until pilot evidence exists.
