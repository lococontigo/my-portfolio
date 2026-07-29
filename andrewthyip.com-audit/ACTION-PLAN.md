# Action Plan — andrewthyip.com

Prioritized from the full audit (`FULL-AUDIT-REPORT.md`). Effort estimates are rough; all are within a solo freelancer's own capability, no new hires/tools required except where noted.

## Phase 1: Critical Fixes (Week 1)

| # | Item | Effort | Files | Source |
|---|---|---|---|---|
| 1 | ~~301-redirect dead `/ant-rentals-media-branding/` → `/work/ant/`~~ | Done | `vercel.json` | SXO |
| 2 | ~~Convert `/work/yocale/`'s ~82MB of GIFs to WebP~~ — 5 case-study GIFs converted via `sharp` (animated WebP, quality 65), both locales re-pointed. Page weight dropped 26.4MB → 7.8MB; English `/work/yocale/` TBT recovered to 176ms (was 254ms, still passing) | Done | `public/gifs/yocale/*.webp`, `src/pages/work/yocale.astro`, `src/pages/ch/work/yocale.astro` | Technical + Performance |
| 3 | ~~Remove hardcoded `fetchpriority="high"` from `case-study-gif.astro`'s default~~ — now behind an opt-in `priority` prop (default `false`, uses `loading="lazy"` instead); `/work/yocale/` (its only caller) doesn't pass it, since the LCP element there is text, not this image | Done | `src/components/case-study-gif.astro` | Technical |
| 4 | ~~Investigate GSAP/ScrollTrigger on `/work/yocale/`~~ — **finding corrected, not applicable.** Grepped every `data-parallax`/`data-stagger-reveal`/`data-marquee` hook on the page: none of the 5 large case-study GIFs/WebPs carry a GSAP animation hook — only small brand-asset thumbnails, gift-card marquee images, and two unrelated screenshots are ever transformed. Re-measured with devtools-mode Lighthouse post-compression: `gsap.min.js` scripting cost is ~2.7-3s on **both** `/work/yocale/` (passing, TBT 176ms) and `/ch/work/yocale/` (still failing, TBT 1356ms) — nearly identical, so GSAP isn't what's differentiating pass from fail. The original hypothesis (a transform-chain wrapping the giant media) doesn't hold up against the code or the data; there's nothing to move. The Chinese variant's remaining TBT is a distinct, unscoped issue — most likely the CJK webfont pipeline (Finding 5's ~2.2MB of Noto Sans/Serif TC subset fetches), not GSAP | Done (no code change — root cause didn't exist) | — | Performance |
| 5 | ~~Defer Ahrefs Analytics initialization until after `window.load`~~ — script tag creation now deferred to the `load` event instead of a static `async` tag, so its same-origin proxy fetch no longer competes with initial render | Done | `src/layouts/base-layout.astro` | Performance |

**Still open, not part of this pass:** the `/ch/work/yocale/` TBT (1356ms) — needs its own investigation into the CJK font-loading path per Finding 5, separate from the GSAP hypothesis above.

## Phase 2: High-Impact Improvements (Weeks 2-3)

| # | Item | Effort | Files | Source |
|---|---|---|---|---|
| 6 | ~~Resolve `/about/` ≡ `/services/about/` duplication~~ — resolved via cross-canonical tag, both pages stay live (different audiences). Added an optional `canonicalPath` override prop to `BaseLayout`; `/services/about/` and `/ch/services/about/` now emit `<link rel="canonical">` pointing at `/about/` and `/ch/about/` respectively, which stay self-canonical. Verified in the built HTML on all 4 pages | Done | `src/layouts/base-layout.astro`, `src/pages/services/about.astro`, `src/pages/ch/services/about.astro` | Content + SXO |
| 7 | ~~Resolve `/contact/` ≡ `/services/contact/` duplication~~ — resolved by removal, not a canonical tag: the portfolio-side `/contact/` and `/ch/contact/` pages are gone. All portfolio-side "Say hello" CTAs (nav, hero, about) now open `mailto:andrewthyip@gmail.com` directly. `/services/contact/` (+ `/ch/` pair) is untouched and remains the only real contact *page* on the site. `vercel.json` 301s the two dead URLs to `/portfolio/`/`/ch/portfolio/`; `sitemap.xml` and `llms.txt` updated to drop the removed pages | Done | `src/components/nav.astro`, `src/pages/portfolio.astro`, `src/pages/ch/portfolio.astro`, `src/pages/ch/about.astro`, `vercel.json`, `public/sitemap.xml`, `public/llms.txt` | Content + SXO |
| 8 | Add `Content-Security-Policy` (start in Report-Only mode), `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` to `vercel.json` | 1 hr (incl. testing CSP doesn't break GTM/Ahrefs/GSAP CDN) | `vercel.json` | Technical |
| 9 | ~~Retype or remove the self-serving `Review`/`ItemList` testimonial schema~~ — removed entirely (chose remove over retype, per the audit's own primary recommendation: the markup can never produce a rich result and carries real guideline risk). Replaced with a minimal self-identifying `WebPage` block on each page. Testimonials remain fully visible in HTML (6 quotes confirmed still rendering on `/about/`) — only the risky structured-data version is gone, so nothing duplicated needs consolidating anymore | Done | `about.astro`, `services/about.astro` + `/ch/` pair | Schema |
| 10 | ~~Define `Person`/`ProfessionalService` once with `@id`, reference everywhere else~~ — added the full `@graph` (per `findings/schema.md`'s generated example) to `base-layout.astro`, so it's inlined on every one of the 23 pages (required — Google resolves `@id` within a single page's own JSON-LD, not across page loads). Every page's own inline `Person` duplicate replaced with `{"@id": "https://andrewthyip.com/#person"}`: the 8 case-study `author` fields, `services.astro`/`services/work.astro`/`services/contact.astro` (+ `/ch/` pairs) `about` fields, and `index.astro`/`ch/index.astro`'s `WebPage.about`. Bare Person-only blocks with no host object (`portfolio.astro`, `ch/portfolio.astro`) were dropped outright — the canonical entity is already present sitewide. Verified with a script that parses all 51 JSON-LD blocks across 23 built pages: 0 parse errors, 0 unresolved `@id` references | Done | `src/layouts/base-layout.astro`, all page-level JSON-LD blocks (18 files) | Schema |
| 11 | Fix mobile hero canvas washing out `/portfolio/`'s headline/bio text — constrain `hero-fluid-canvas` on mobile the way it's already contained on desktop | 1-2 hrs | `src/components/hero-fluid-bg.astro` or `portfolio.astro` styles | Visual |
| 12 | Add a citable sentence around every case-study stat-card metric | 1 hr | `work/*.astro` × 2 locales | GEO |
| 13 | Give the homepage a short visible/`sr-only` identity paragraph (name, role, location) above the funnel fork | 30 min | `index.astro`, `ch/index.astro` | GEO + SXO |
| 14 | Add 1-2 testimonial quotes and an "Open for New Opportunity" status to `/portfolio/` | 1 hr | `portfolio.astro`, `ch/portfolio.astro` | SXO |

## Phase 3: Content & Authority (Month 2)

| # | Item | Effort | Files | Source |
|---|---|---|---|---|
| 15 | ~~Add `datePublished`/`dateModified` to all 4 case studies' `CreativeWork` schema~~ — added to all 8 files (4 case studies × 2 locales). Dates taken from `sitemap.xml`'s existing `lastmod` per locale (the project's one declared date source of truth): `2026-06-30` for the English pages, `2026-07-19` for the `/ch/` pages. Verified by parsing the built HTML's JSON-LD on all 8 pages | Done | `work/{yocale,delta,ant,crowd-ease}.astro` + `/ch/` pair | Technical + Schema + GEO (flagged independently by all three) |
| 16 | Bring the Ant Rentals case study up to parity with the other three (Problem/Solution structure, stakeholder names, deeper Approach section) | 2-3 hrs | `work/ant.astro`, `ch/work/ant.astro` | Content |
| 17 | Add a ~150-word consolidated answer paragraph per major case-study section, starting with Yocale and Delta | 2-3 hrs | `work/yocale.astro`, `work/delta.astro` | GEO |
| 18 | Set up and display a branded domain email; add a short privacy note linked from the contact form/footer | 1-2 hrs (+ email setup outside the repo) | `footer.astro`, `contact.astro` × 2 locales, new privacy page | Content |
| 19 | Add pricing/scope signal to `/services/` (e.g. "packages start at $X" or a typical-range line) | 30 min | `services.astro`, `ch/services.astro` | SXO |
| 20 | ~~Increase mobile nav hamburger hit area to 48×48px~~ — added an invisible `::before` pseudo-element (`inset: -4px`) rather than growing the visual button box, since the button's own 40×40px sits inside a nav bar that's only 48px tall including padding at the ≤520px breakpoint; inflating the box directly would have overflowed it. Visual icon unchanged, tap target now 48×48 | Done | `src/components/nav.astro` | Visual |
| 21 | Add GitHub/Behance/Dribbble links if Andrew has them — easiest legitimate first backlinks | 15 min | `footer.astro`, `about.astro` | Backlinks |
| 22 | Reframe 2-3 headings per case study as questions | 30 min per case study | `work/*.astro` | GEO |

## Phase 4: Monitoring & Iteration (Ongoing)

| # | Item | Effort | Notes |
|---|---|---|---|
| 23 | Fix `www → apex` redirect to permanent (308) in Vercel domain settings | 5 min | Technical |
| 24 | Add `includeSubDomains; preload` to the existing HSTS header, then submit to hstspreload.org | 15 min | Technical |
| 25 | Implement IndexNow (key file + ping on deploy) | 1-2 hrs | Technical |
| 26 | Automate `sitemap.xml`'s `lastmod` from git history instead of hand-editing | 1-2 hrs | Sitemap |
| 27 | Add `apple-touch-icon.png` | 15 min | Technical |
| 28 | Once Phase 1's GIF fix lands, add long-lived immutable `Cache-Control` for `/images/*`, `/gifs/*`, `/videos/*` | 15 min | Technical |
| 29 | Confirm LinkedIn profile lists the site URL (manual check, no tooling) | 5 min | Backlinks |
| 30 | Re-run performance audit with `throttlingMethod: devtools` after Phase 1 items 2-5 land, to confirm TBT/LCP actually recovered | — | Performance |
| 31 | If Google Search Console access becomes available, verify the SXO "doesn't rank for own name" finding against real position/impression data | — | SXO |

## Immediate next step

**The `/ant-rentals-media-branding/` redirect fix (Phase 1, item 1) needs a deploy to take effect** — it's committed to `vercel.json` but Vercel only applies redirect config on the next build/deploy. If this repo auto-deploys on push to `main`, push it; otherwise trigger a manual deploy.
