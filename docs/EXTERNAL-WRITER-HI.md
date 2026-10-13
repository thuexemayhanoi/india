# EXTERNAL WRITER GUIDE — 300 ORIGINAL HINDI ARTICLES

Repository: `thuexemayhanoi/india`
Production: `main` → `https://hi.rentbikehanoi.com/`
Writer inbox: branch `writer-inbox`, directory `content/incoming/`
Article plan: `data/editorial-plan.json`, 300 unique IDs `HI0001`–`HI0300`, six batches of 50.
Source of facts: `data/site.json`; refer to approved business NAP/price and deposit values.

## External AI operating instruction (copy this to the writer)

You are the external Hindi author for `thuexemayhanoi/india`. You may ONLY commit to branch `writer-inbox` and paths `content/incoming/HIxxxx.json`. Never edit a published article, production branch, CNAME, sitemap or CMS. Read fresh `main` and `data/editorial-plan.json` before each batch. Select 2–10 consecutive still-unpublished IDs from the first incomplete batch. Create useful original Hindi writing for each assigned topic and user intent; DO NOT translate or copy /vanchinh, Riderly or other websites. Prefer genuinely researched evidence over word count. Verify prices, deposits, licences and relevant rules; if factual evidence is missing, report a blocker instead of inventing it. Check for existing pages, provide source URLs actually read, and link contextually to existing Hub/Silo paths. Commit the JSON drafts to `writer-inbox`. Observe `Hindi Factory Publish - External Writer Inbox` Actions. On QA failure, repair the exact ID and push again; on PASS, continue the next batch. No further per-post human approvals are required for passing articles. Do not assert successful live deployment until URL has been verified.

## Article input JSON schema

Each file includes:
- `id`: exact ID from plan, e.g. HI0001
- `title`: EXACT title from plan
- `language`: `hi-IN`
- `description`: unique Hindi metadata description (85–205 characters)
- `sections`: >=6 sections each with a unique `heading` and >=2 substantive `paragraphs`, optional `subsections` with `heading` + `paragraphs`; >=850 useful Hindi words overall
- `sources`: >=2 distinct, real verified HTTPS references with `url` and `title`; regulations/licensing require Vietnamese government source
- `relatedPaths`: >=2 valid existing internal Hub or Silo paths
- `editorialChecks`: `{"factsReviewed":true,"hindiReviewed":true,"originalWriting":true}` **only after doing those checks**

Example shape (NOT publishable as-is):

```json
{
  "id": "HI0001",
  "title": "हनोई के यातायात में गियर वाली बाइक किसे चुननी चाहिए",
  "language": "hi-IN",
  "description": "हनोई में गियर बाइक चुनने से पहले सवारी के अनुभव, वाहन की स्थिति, किराये की शर्तों और दस्तावेज़ों के बारे में उपयोगी जानकारी।",
  "sections": [
    {"heading": "अनुभव की जरूरत", "paragraphs": ["पूरा और उपयोगी हिन्दी अनुच्छेद...", "दूसरा अनुच्छेद..."]},
    {"heading": "गियर नियंत्रण", "paragraphs": ["...", "..."]},
    {"heading": "वाहन की स्थिति", "paragraphs": ["...", "..."]},
    {"heading": "यातायात सुरक्षा", "paragraphs": ["...", "..."]},
    {"heading": "किराया और जमा", "paragraphs": ["...", "..."]},
    {"heading": "निर्णय की चेकलिस्ट", "paragraphs": ["...", "..."]}
  ],
  "sources": [
    {"url": "https://example.org/replace-with-real-source", "title": "Real verified source"},
    {"url": "https://example.com/replace-with-real-source", "title": "Second real source"}
  ],
  "relatedPaths": ["/बाइक-के-प्रकार/गियर-बाइक/", "/किराये-की-गाइड/सुरक्षित-सवारी/"],
  "editorialChecks": {"factsReviewed":true,"hindiReviewed":true,"originalWriting":true}
}
```

The example contains placeholders and MUST NOT be submitted without replacing every placeholder and verifying actual sources.

## Automatic processing
- Writer commits at most 10 JSON files per push to `writer-inbox`; the action always pulls FRESH main and only imports earliest pending IDs.
- Pairs of two sequential IDs must both pass QA to publish. If one fails, neither in that pair publishes.
- Pipeline validates one canonical URL per intent, duplicate similarity, substantive Hindi, source format, minimum depth, facts-attestation and SEO score >=80.
- Passing articles are rendered with shared UI, schema Article, breadcrumb, Silo list, sitemap and metadata. PUBLISHED rows are immutable.
- The CI publisher creates a single atomic, non-force commit on `main`, updates checkpoint and exposes blocked report.
- GitHub Pages deployment must be verified separately; the publisher attempts to request a Pages rebuild.

## Practical cautions
Static tests cannot prove every factual claim or source accuracy; the external writer is responsible for checking sources. Do not invent business claims, no-deposit terms, unlimited mileage, insurance coverage or guaranteed rankings. If unknown, stop at REVIEW.
