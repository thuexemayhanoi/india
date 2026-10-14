# Hindi AI Local + Quick Contact widget
Original sources: `thuexemayhanoi/web` (`assets/js/assistant.js`, `site/partials/floating-ui.html` and `assets/js/app.js` behaviors).
Responsive/keyboard adaptation: `thuexemayhanoi/spanish` (`assets/js/floating-port.js`, CSS block).

## Preserved behavior
- Separate launchers: Quick Contact left, assistant right, desktop and mobile.
- Quick Call expands Call, WhatsApp, Zalo and Google Maps; account availability for WhatsApp/Zalo is not guaranteed.
- Local chatbot continues the original English + Vietnamese rules, session memory, amount calculations, suggestions, site-search ranking, lazy index and no external model/API billing; Hindi localized engine added.
- One active panel at a time, Escape closes, click-away closes Quick Contact, mobile nav hides bubbles, iOS VisualViewport keyboard positioning, accessibly labeled controls.
- Uses only the India business address, phone, hours, site URL and its actual published prices and deposits. Electric rental price is deliberately unspecified.
- Search index is refreshed automatically from *published* `data/site.json` and `content/published/HIxxxx.json` inside `scripts/build.mjs` whenever the standard Factory publisher builds the website. No planned or draft articles are included.
- To render full-content index immediately: `node scripts/build.mjs` and commit generated `assets/chat/search-index.json`. Until then the shipped title-only initial index locates all existing published URLs and all Hub/Silo content.
- Content address/contact/price info and index URL are always India-local; don't copy terms or prices from `/web` or `/spanish`.
- Visual tokens: Blue Titanium gradients from the Spanish implementation blended with India navy/gold. No effect on SEO canonicals or article routes.

## QA
`node scripts/build.mjs`, `node tests/qa.mjs`, `node tests/floating-qa.mjs`, `node tests/factory-integration.mjs`. Test browser mobile drawer, smart chips, pricing, WhatsApp, keyboard, and GA-free lazy index. No more than one writer should own a pending Article ID.

## Mobile obstacle avoidance (2026-10-14)
The shared positioning manager detects collision with the bike-finder form during scroll/resize; when there is room it moves both launchers above the form. This respects the iOS VisualViewport/keyboard and hides float controls when the menu is open. Quick Call switches to a compact 2×2 touch grid on phones with visible labels; inactive desktop tooltips no longer obscure nearby controls.
