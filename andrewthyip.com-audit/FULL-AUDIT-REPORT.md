# Full SEO Audit — andrewthyip.com

**Audited:** 2026-07-26/27 · Live production (`https://andrewthyip.com`), 24 URLs (12 route families × EN/zh-Hant)
**Method:** 9 specialist passes (technical, content, schema, sitemap, performance, visual, GEO/AI-search, SXO, backlinks), each independently fetching/measuring the live site, findings cross-checked where they overlapped.

## SEO Health Score: 67 / 100

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 68 | 14.96 |
| Content Quality | 23% | 62 | 14.26 |
| On-Page SEO | 20% | 65 | 13.00 |
| Schema / Structured Data | 10% | 62 | 6.20 |
| Performance (CWV) | 10% | 78 | 7.80 |
| AI Search Readiness (GEO) | 10% | 69 | 6.90 |
| Images | 5% | 70 | 3.50 |
| **Total** | | | **66.6 → 67** |

Supplementary passes not in the weighted score, reported separately below: **Search Experience (SXO)**, **Visual/Above-the-Fold**, **Backlinks**, **Sitemap**.

---

## Top 5 Critical Issues

1. **`andrewthyip.com` does not rank for Andrew's own name.** Every tested variant of "Andrew Yip UX designer Vancouver" surfaces LinkedIn and unrelated namesakes — never the domain itself. The one query that did surface it returned a dead legacy URL. *(SXO — see below; the dead-URL half of this is now fixed, see Resolved.)*
2. **`/work/yocale/` ships ~82MB of GIFs on one page**, one with `fetchpriority="high"` — the largest is 32MB. This directly contradicts the project's own recent GIF-compression work, which covered Delta Controls but missed Yocale. *(Technical + Performance, cross-confirmed)*
3. **Real, confirmed-not-a-fluke TBT failure** on `/ch/services/`, `/ch/work/yocale/`, `/ch/work/delta/` (up to 2200ms — "Poor" territory), re-verified with a fresh isolated Chrome instance per page specifically to rule out measurement contamination. *(Performance)*
4. **No coherent Person/ProfessionalService entity graph.** Zero `@id` used anywhere; the same `Person` is described with different, inconsistent property sets across 10+ page instances; `ProfessionalService` exists only as a bare 3-property stub repeated 24 times. Google/AI has no reliable way to resolve "Andrew Yip the person" and "Andrew Yip's service" into one entity. *(Schema)*
5. **`/about/` ≡ `/services/about/` and `/contact/` ≡ `/services/contact/` are duplicate content** — identical visible body text (679 and 45 words respectively) served at two separate, both-sitemapped, both-self-canonicalized URLs, in both locales. *(Content + SXO, cross-confirmed)*

## Top 5 Quick Wins

1. ~~301-redirect the dead `/ant-rentals-media-branding/` URL~~ — **done during this audit**, see Resolved.
2. Add `X-Content-Type-Options: nosniff` — zero risk, one line in `vercel.json`.
3. Add `datePublished`/`dateModified` to the 4 case studies' `CreativeWork` schema — ~20 min, flagged independently by Technical, Schema, and GEO.
4. Increase the mobile nav hamburger's hit area to 48×48px (currently 40×40) — CSS padding change only.
5. Add one citable sentence around each case-study stat-card metric (e.g. "Andrew's redesign lifted Yocale's CTR by 5.15%") — ~1 hour total across 4 case studies, highest-leverage AI-citation fix on the site.

---

## Resolved during this audit

**Dead legacy URL, indexed, 404ing.** SXO's live-search testing surfaced `https://andrewthyip.com/ant-rentals-media-branding/` as the one query result pointing at this domain — and it 404s. Confirmed independently via direct `curl`. Fixed: added a permanent redirect to `/work/ant/` in `vercel.json`. **This needs a deploy to take effect** (see Next Steps).

---

## Technical SEO — score 68/100

**Critical**
- `/work/yocale/` and its `/ch/` twin ship ~82MB / ~90MB of GIFs respectively across 5 files (32MB, 22MB, 13MB, 9MB, 7MB), one marked `fetchpriority="high"` despite not being the actual LCP element. `/work/crowd-ease/` carries a further ~11MB. `404.astro` itself preloads a 9.4MB GIF with `fetchpriority="high"` — even a broken link costs visitors a ~9MB download.

**High**
- `Content-Security-Policy` missing sitewide (no headers block in `vercel.json` at all).
- `X-Content-Type-Options` missing sitewide.
- `X-Frame-Options`/`frame-ancestors` missing — contact form is clickjacking-exposed.

**Medium**
- `www.andrewthyip.com → andrewthyip.com` redirect is a temporary 307, not permanent (the apex's own HTTP→HTTPS upgrade correctly uses 308).
- IndexNow not implemented — no key file, no ping calls (Bing/Yandex/Naver would benefit given fairly frequent content updates).
- HSTS present (`max-age=63072000`, 2 years — good) but missing `includeSubDomains` and `preload`.

**Low**
- 404 page has no `meta robots noindex` and unnecessarily self-canonicalizes to `/404/`.
- `Person.url` in JSON-LD omits the trailing slash the rest of the site uses consistently.
- No `apple-touch-icon` — iOS "Add to Home Screen" falls back to a page screenshot instead of the logo.
- Large media served with `Cache-Control: public, max-age=0, must-revalidate` instead of a long-lived immutable cache (fix after the GIF weight issue, not before).

**Passing cleanly:** robots.txt, sitemap reference, canonical tags, hreflang (fully reciprocal), HTTP→HTTPS redirects, no stray noindex, fully static/SSR (zero JS-rendering risk for any crawler), Brotli compression, mobile viewport meta, alt text on sampled pages.

---

## Content Quality — score 62/100 (E-E-A-T 64/100, AI citation readiness 65/100)

**High**
1. Homepage (`/` and `/ch/`) carries ~11 words of visible text — the split-gate design is a deliberate UX choice, but it leaves the URL most likely to be treated as the canonical entity page with no topical substance.
2. `/about/` ≡ `/services/about/` — identical 679-word body, two sitemapped self-canonicalizing URLs. Same for the `/ch/` pair.
3. `/contact/` ≡ `/services/contact/` — identical 45-word body, same duplication pattern.

**Medium**
4. `/portfolio/` and `/services/work/` are near-duplicate hubs — verbatim project-card copy, ~85%+ overlap.
5. Ant Rentals case study (188 words) is far thinner than its siblings (510–857 words) and lacks their Problem/Solution structure.
6. No freshness signal anywhere — no `datePublished`/`dateModified`, no visible "completed" date beyond a duration range embedded in prose.
7. Trust-signal gaps: contact routes to a personal Gmail address rather than a branded domain email; no phone/address; no privacy policy despite a data-collecting form.

**Low**
8. `/services/` sits slightly under the ~800-word service-page floor (682 words).
9. Several case-study images have missing/empty `alt` (worth a manual pass to confirm which are genuinely decorative).

**What's genuinely strong:** six real, named testimonials with verifiable employers (Delta Controls Inc., IBM) — rare and valuable for a freelance portfolio. Three of four case studies (Delta, Yocale, Crowd Ease) have real depth and specific, plausible metrics tied to named clients. Hreflang is correct and reciprocal everywhere.

---

## On-Page SEO — score 65/100 (derived from Content + SXO + Technical overlap)

The core on-page problem is the duplicate-title/duplicate-body pattern above: `/about/` and `/services/about/` share not just body text but an identical `<title>` ("About · Andrew YIP") — the meta descriptions do differ, which is the only thing keeping these from being fully interchangeable pages in a crawler's eyes. Same pattern on the contact pair. Heading hierarchy, internal linking, and canonical-tag hygiene are otherwise solid across the rest of the site.

---

## Schema / Structured Data — score 62/100

**High**
1. Testimonial `Review`/`ItemList` markup on `/about`, `/services/about`, and both `/ch/` twins is self-serving per Google's review-snippet eligibility rules (reviews about the site owner's own service, published by the site owner) — will never produce a rich result regardless of tuning, and the same 6-review payload is duplicated across 4 canonical URLs.

**Medium**
2. No `AggregateRating` (moot until #1 is resolved).
3. `ProfessionalService` never defined as a real entity — only a bare `{name, url}` stub, repeated 24 times.
4. No `@id` anywhere — `Person` is duplicated with a different, inconsistent property set on nearly every page.
5. The identical `ItemList`/`Review` payload is hand-copied into 4 separate `.astro` files with no shared source of truth.
6. `/portfolio` has no page-level `WebPage`/`CollectionPage` schema and no `ItemList` enumerating its 4 case studies.

**Low**
7. Testimonial content on zh-Hant pages is untranslated English with no `inLanguage` tag of its own.
8. `BreadcrumbList` never carries `inLanguage`, even on zh-Hant pages.
9. English pages never declare `inLanguage` at all (asymmetric vs. the zh-Hant side).

**Passing cleanly:** all 40 JSON-LD blocks across 24 pages are syntactically valid, correct `@context`, JSON-LD used exclusively (no Microdata/RDFa), all URLs absolute, zero deprecated types anywhere.

A ready-to-use unified `@graph`/`@id` example (Person + ProfessionalService + a CollectionPage for /portfolio) is in `findings/schema.md`.

---

## Performance (Core Web Vitals) — score 78/100 (10 routes measured, lab data, devtools-throttled — not the default Lantern simulation mode, see methodology note)

| Route | Score | LCP | CLS | TBT |
|---|---|---|---|---|
| `/` | 94 | 2525ms | 0.002 | 46ms |
| `/portfolio/` | 95 | 2364ms | 0.000 | 30ms |
| `/services/` | 83 | 2257ms | 0.041 | 525ms |
| `/work/yocale/` | 85 | 2769ms | 0.039 | 254ms |
| `/work/delta/` | 85 | 2788ms | 0.000 | 270ms |
| `/ch/` | 85 | 3075ms | 0.000 | 204ms |
| `/ch/portfolio/` | 84 | 3070ms | 0.000 | 244ms |
| `/ch/services/` | 60–64 | 3059ms | 0.000 | 1406–2200ms |
| `/ch/work/yocale/` | 51–53 | 3484ms | 0.000 | 1174–1745ms |
| `/ch/work/delta/` | 54–57 | 3616ms | 0.000 | 1210–1438ms |

**Key insight — LCP's bottleneck is render delay, not media weight.** The actual LCP element on every tested page is a text node (a headline or paragraph), never an image or video. TTFB is excellent everywhere (34–244ms); 2.3–3.4 seconds of "element render delay" is where the time actually goes. Re-compressing hero media will not move this metric.

**The real cause: a ~91–94KB same-origin, randomly-hashed script blocks render on every single page** (900–1640ms), high-confidence identified as Ahrefs Analytics' bot-resistant same-origin proxy fetch (loaded `async`, but its resulting proxied payload still executes in the paint-critical window). Deferring its initialization until after `load` should recover most of this.

**Critical, confirmed-real TBT** on the three `/ch/` routes above 1000ms — re-tested with a fresh, isolated Chrome process per page specifically to rule out shared-session contamination, and it held. Root cause: GSAP main-thread attribution on `/work/yocale/`/`/ch/work/yocale/` specifically spikes to 2287–2500ms (vs. 48–65ms on the other two affected routes) — consistent with ScrollTrigger animating/transforming an element that contains the giant unoptimized GIFs, forcing expensive repaint work on every scroll tick.

CLS and TTFB are non-issues everywhere — no action needed on either.

---

## AI Search Readiness (GEO) — score 69/100

All major AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) confirmed with live 200 responses; `robots.txt` is a blanket allow. `llms.txt` is present, accurate, and genuinely well-maintained (verified byte-identical live vs. repo, and its content correctly reflects the recent site restructure).

**Highest-impact gap:** case-study headline metrics live as isolated numbers in stat-card components with no surrounding sentence — "5.15%" and "Click-through rate" as two disconnected `<p>` tags, nothing an AI answer engine can confidently quote as a claim. Fixing this (one sentence per stat, ~1 hour total) is the single best AI-citation improvement available.

Other findings: paragraphs run 12–48 words, well under the ~150-word range that citation-friendly passages hit; headings are declarative rather than question-phrased; no `datePublished` anywhere (same gap Technical and Schema both flagged); the homepage's ~79 words of visible text puts the site's most-likely-cited URL at a real disadvantage versus `/about/`'s much richer content one click deeper.

---

## Images — score 70/100 (derived from Content's image audit)

| Page | Total `<img>` | No `alt` | Empty `alt=""` |
|---|---|---|---|
| `/work/ant/` | 48 | 8 | 6 |
| `/work/crowd-ease/` | 44 | 12 | 0 |
| `/work/yocale/` | 48 | 0 | 6 |
| `/services/` | 39 | 0 | 12 |

Empty `alt=""` is correct for genuinely decorative images but should be spot-checked — several appear to be real case-study screenshots.

---

## Supplementary: Search Experience (SXO)

The headline finding across this entire audit: **the site doesn't surface for Andrew's own name.** Every persona score reflects this except the two funnel-aligned pages:

| Persona | Score | Rating |
|---|---|---|
| Personal-Brand Searcher | 8/100 | Critical mismatch |
| Comparison Shopper | 56/100 | Needs work |
| Bilingual HK Visitor | 51/100 | Needs work (partial — `/ch/` not deep-crawled) |
| Recruiter | 62/100 | Good, notable gaps |
| Small-Business Owner | 74/100 | Good |

The homepage (26/100 gap score) is a bare two-tile router with no name, bio, or trust signal — the page most likely to anchor brand-name search, currently the weakest page on the site by this measure. `/portfolio/` (51/100) has zero on-page testimonials despite six strong ones sitting one click away on `/about/`. `/services/` (76/100) is the strongest page on the site by this measure and matches its SERP cluster's dominant format well.

**Caveat on the SERP-invisibility claim specifically:** based on WebSearch results across 6 queries, not Google Search Console position data — a real, strong signal but not the same as verified ranking data. Worth confirming with GSC if/when available.

---

## Supplementary: Visual / Above-the-Fold

**High:** `/portfolio/`'s ambient hero canvas fills the entire mobile viewport (vs. staying contained to a corner on desktop), washing out the "Designer & Developer" headline and bio paragraph behind its brightest bloom — likely a real WCAG contrast failure at that specific point, on the site's main "who is this" page.

**Medium:** shared mobile nav hamburger measures 40×40px, under the 48×48px touch-target guideline, across every page using that nav.

Everything else tested (`/`, `/services/`, `/work/yocale/`) has clean above-the-fold execution on both breakpoints, zero horizontal scroll, zero console errors across all 8 capture combinations tested.

---

## Supplementary: Sitemap

Clean bill of health — valid XML, 24/24 URLs match live routes exactly with zero missing/dead/redirected entries, and (correcting an outdated assumption in the original brief) **already has full, correct, reciprocal hreflang annotations**. Only note: `lastmod` values are hand-maintained rather than build-generated — not a live defect, but a process risk worth automating eventually.

## Supplementary: Backlinks

No credential-gated backlink tools available in this environment (Tier 0: Common Crawl + verification crawler only). Common Crawl has no record of the domain (expected for a small personal site — a coverage gap, not a negative signal). No numeric score produced per the audit methodology's own rule (0 of 7 scoring factors had any data source). One plausible-but-unverified backlink (LinkedIn profile likely lists the site URL) and a clear, low-effort opportunity: no GitHub/Behance/Dribbble links exist anywhere on the site, which would normally be the easiest legitimate first backlinks for a design/dev portfolio.

---

## Limitations of this audit

- No Google Search Console, GA4, CrUX field data, Moz, Bing Webmaster Tools, or DataForSEO credentials were available in this environment — every score above is derived from live lab measurement and direct fetch/crawl, not real-user field data or paid-API backlink/ranking data.
- SXO's ranking-visibility claim uses WebSearch results (6 queries), not verified SERP position data.
- The `/ch/` funnel was spot-checked for hreflang/technical correctness but not deep-crawled page-by-page for the SXO/content-depth passes the way the English side was.
- GEO's platform-specific AI-visibility scores (Google AIO, ChatGPT, Perplexity, Bing Copilot) are heuristic estimates based on known ranking-signal preferences, not live-measured citation rates.
