# Technical SEO Audit — andrewthyip.com

Audited: 2026-07-27 (live production, fetched directly via curl — no rendering script available in this environment)
Site: Astro static build, hosted on Vercel, bilingual EN (default) / zh-Hant (`/ch/`)

## Category summary

| Category | Status | Notes |
|---|---|---|
| Crawlability | Pass | robots.txt open, sitemap valid and referenced |
| Indexability | Pass | No noindex/X-Robots-Tag found anywhere; canonicals correct |
| Security headers | Fail | CSP, X-Content-Type-Options, X-Frame-Options all missing (HSTS present) |
| URL structure / redirects | Pass with issues | Clean trailing-slash URLs; www→apex redirect uses wrong status code |
| Mobile | Pass | Viewport meta present; no apple-touch-icon |
| Core Web Vitals | Fail | Multiple case-study pages ship 8–32MB GIFs, one marked `fetchpriority="high"` |
| Structured Data | Pass | WebPage/Person/BreadcrumbList/CreativeWork present and valid per page type |
| JS rendering | Pass | Fully static HTML/SSR via Astro; content present with JS disabled |
| hreflang | Pass | Fully reciprocal en / zh-Hant / x-default, matches on sitemap and `<head>` |
| IndexNow | Fail | Not implemented (no key file, no ping calls found) |

**Technical score: 68/100** — pulled down primarily by the GIF payload issue (Critical, directly harms LCP/INP and mobile data cost) and the missing security headers (High).

---

## Critical

### 1. Multi-megabyte GIFs served on case-study pages, one with `fetchpriority="high"`
**Evidence:**
- `/gifs/yocale/0621-ezgif.com-video-to-gif-converter.gif` → **31.9 MB** (`image/gif`, 200 OK), rendered via `src/components/case-study-gif.astro` which sets `fetchpriority="high"` unconditionally on the `<img>` (`src/pages/work/yocale.astro:297` and the zh-Hant twin `src/pages/ch/work/yocale.astro:302`)
- `/gifs/yocale/yocale.homepage.gif` → **21.7 MB**, used via `<CaseStudyDeliverableImage>` at `src/pages/work/yocale.astro:86`
- `/gifs/yocale/Webflow web component.gif` → **13.2 MB**, `/gifs/yocale/Figma MCP.gif` → **8.8 MB**, `/gifs/yocale/Notion to Figma Sync.gif` → **6.8 MB** — all on the same `/work/yocale/` page. Total GIF payload on that single page is **~82 MB**.
- `/work/crowd-ease/` carries a further ~10.9 MB across four GIFs (`DASHBOARD.gif` 2.5 MB, `EVENT.gif` 5.0 MB, `DATA-.gif` 1.9 MB, `MAP.gif` 1.5 MB).
- The custom `404.astro` page preloads `/gifs/in_the_mood_for_love.gif` (**9.4 MB**) with `fetchpriority="high"` (`src/pages/404.astro:5`) — meaning even a mistyped/broken URL costs visitors and crawlers a ~9.4 MB download.
- `case-study-gif.astro` does correctly reserve layout space via `aspect-ratio` on the wrapper (no CLS risk), but does nothing about weight/priority.

**Why it matters:** `fetchpriority="high"` tells the browser to fetch this resource before other page resources — on `/work/yocale/`, that's a 31.9 MB non-hero image competing for bandwidth with the actual above-the-fold content, which will blow LCP well past the 4s "Poor" threshold on any connection slower than a fast fiber/wifi link, and on mobile data this is close to unusable (a 30MB+ single asset can take 30–60+ seconds on a throttled 4G profile Lighthouse mobile test). It also directly contradicts CLAUDE.md's own stated CWV target (LCP < 2.5s) and the project's recent "compress oversized media" commit — these specific files were evidently missed.

**Recommendation:**
- Re-encode all `/gifs/**/*.gif` as `.webm`/`.mp4` (H.264) with a `<video autoplay loop muted playsinline>` fallback — this project already does this pattern elsewhere (`hero-showcase-gallery.astro` has a `video` branch). GIF is a legacy format with no interframe delta compression comparable to modern video codecs; the same visual content typically compresses 10–20x smaller as video.
- Remove `fetchpriority="high"` from `case-study-gif.astro` unless the specific instance is verified to be the actual LCP element on that page (it is not, on `/work/yocale/` — it sits inside the "Overview"/mid-page section, not the hero).
- Replace the 404 page's preloaded GIF with a small, optimized asset (or drop the preload/fetchpriority entirely) — a 404 page should be one of the lightest pages on the site, not one of the heaviest.
- Add a size budget/lint step (even a simple pre-commit check on `public/gifs/**` file size) to prevent regression, since this is a recurring category of issue per the repo's own commit history.

---

## High

### 2. Content-Security-Policy header missing
**Evidence:** `curl -sI https://andrewthyip.com/` and every other fetched URL (home, `/ch/`, `/services/`, `/work/yocale/`, static assets) return no `Content-Security-Policy` header. `vercel.json` (repo root) contains only `{"cleanUrls": true, "trailingSlash": true}` — no `headers` block at all, confirming this isn't a caching/CDN artifact but simply unconfigured.
**Why it matters:** No defense-in-depth against XSS/injection. The site already loads several third-party scripts (Google Tag Manager, Ahrefs analytics, cdnjs-hosted GSAP), which is exactly the kind of surface a CSP is meant to constrain — without one, a compromised or mis-configured third-party script has unrestricted ability to execute/exfiltrate.
**Recommendation:** Add a `headers` array to `vercel.json` for `/(.*)`, e.g.:
```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://analytics.ahrefs.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'self'"
}
```
Start in `Content-Security-Policy-Report-Only` mode to catch any missed allow-listed hosts before enforcing.

### 3. X-Content-Type-Options header missing
**Evidence:** Confirmed absent on HTML responses and static assets (checked an `.svg` icon response — also missing).
**Recommendation:** Add `X-Content-Type-Options: nosniff` in the same `vercel.json` headers block. Zero risk of breaking anything; should ship immediately.

### 4. X-Frame-Options / frame-ancestors missing
**Evidence:** Confirmed absent on all fetched responses.
**Why it matters:** Site can currently be embedded in an `<iframe>` on any third-party domain (clickjacking exposure on the contact form in particular).
**Recommendation:** Add `X-Frame-Options: SAMEORIGIN` (or fold into the CSP `frame-ancestors 'self'` directive above — either satisfies this, but ship at least one).

---

## Medium

### 5. `www` → apex redirect uses a temporary (307) status instead of permanent
**Evidence:**
```
http://www.andrewthyip.com/  → 308 → https://www.andrewthyip.com/
https://www.andrewthyip.com/ → 307 → https://andrewthyip.com/
```
vs. the apex's own scheme upgrade, which correctly uses 308:
```
http://andrewthyip.com/ → 308 → https://andrewthyip.com/
```
**Why it matters:** Search engines treat 307 as a temporary signal and are more conservative about consolidating ranking signals/passing link equity to the target than with a 301/308. Since `www.andrewthyip.com` should always resolve to `andrewthyip.com` permanently, this should be a permanent redirect. It also means visitors hitting `http://www…` take two redirect hops before reaching the canonical URL.
**Recommendation:** In Vercel project settings (Domains), set the `www.andrewthyip.com → andrewthyip.com` redirect to permanent (308), or handle it explicitly in `vercel.json`'s `redirects` array with `"permanent": true`.

### 6. IndexNow protocol not implemented
**Evidence:** No IndexNow key file found in `public/` (`ls public/` shows `favicon.ico, favicon.svg, gifs, images, llms.txt, robots.txt, scripts, sitemap.xml, videos` — no `*.txt` key file matching an IndexNow key), and no ping call to `api.indexnow.org` / `www.bing.com/indexnow` found in the codebase.
**Why it matters:** Bing, Yandex, and Naver support near-instant re-crawl via IndexNow when content changes — relevant here since the site updates fairly often (sitemap `lastmod` dates show edits as recently as 2026-07-24/19). Without it, those engines rely on their normal crawl schedule.
**Recommendation:** Generate an IndexNow key, drop `<key>.txt` (containing just the key) in `public/`, and add a simple post-deploy step (or a small `is:inline` script triggered on deploy hook / GitHub Action) that pings `https://api.indexnow.org/indexnow?url=<changed-url>&key=<key>&keyLocation=https://andrewthyip.com/<key>.txt` for changed URLs. Low effort, no npm package required (a plain `fetch`/`curl` call from a CI step is sufficient — this does not need to run in the browser).

### 7. HSTS header lacks `includeSubDomains` and `preload`
**Evidence:** `Strict-Transport-Security: max-age=63072000` on all responses — no `includeSubDomains`, no `preload` directive.
**Why it matters:** `max-age` alone (2 years, good) doesn't protect subdomains, and the site is not eligible for the HSTS preload list (baked into browsers, removing the first-visit HTTP round trip entirely) without both directives.
**Recommendation:** Update to `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, then submit `andrewthyip.com` at hstspreload.org. Since both apex and `www` already fully redirect to HTTPS, this is safe to enable immediately.

---

## Low

### 8. 404 page has no `meta robots noindex`
**Evidence:** `/nonexistent-page-xyz123/` correctly returns HTTP 404, but the response `<head>` has a `<link rel="canonical" href="https://andrewthyip.com/404/">` and no `<meta name="robots" content="noindex">`. The 404 status code alone is normally sufficient to keep Google from indexing it, but this is a low-cost defense-in-depth addition, and the self-referencing canonical to `/404/` is unnecessary (a 404 page shouldn't advertise a canonical URL at all).
**Recommendation:** Add `<meta name="robots" content="noindex, nofollow">` to `404.astro` and drop the canonical tag on that page.

### 9. Structured data `Person.url` omits trailing slash while canonical uses one
**Evidence:** Homepage JSON-LD: `"url": "https://andrewthyip.com"` (no trailing slash) vs. `<link rel="canonical" href="https://andrewthyip.com/">` and `og:url` (both with trailing slash). Google typically normalizes this, so impact is minimal, but it's an easy inconsistency to fix.
**Recommendation:** Standardize on the trailing-slash form (matching `astro.config.mjs`'s `trailingSlash: 'always'`) everywhere a URL is emitted, including inside JSON-LD.

### 10. No `apple-touch-icon`
**Evidence:** `GET /apple-touch-icon.png` → 404. Only a PNG/SVG favicon pair keyed to `prefers-color-scheme` is declared in `<head>` — iOS "Add to Home Screen" ignores `prefers-color-scheme` on touch icons and falls back to a screenshot of the page instead of the logo.
**Recommendation:** Add a 180×180 `apple-touch-icon.png` and `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` in `base-layout.astro`.

### 11. Non-hashed static assets served with `Cache-Control: public, max-age=0, must-revalidate`
**Evidence:** The large GIFs (and other `/images/`, `/gifs/`, `/videos/` assets) return `Cache-Control: public, max-age=0, must-revalidate` rather than a long `max-age`. Every repeat visit pays a revalidation round trip (a 304 if unchanged, but still a request) instead of reading from local cache.
**Recommendation:** Once GIF weight (Critical #1) is fixed and filenames are either content-hashed or treated as immutable per release, add a long `max-age` + `immutable` Cache-Control rule for `/images/*`, `/gifs/*`, `/videos/*` in `vercel.json`. Do this after addressing #1 so stale huge GIFs aren't cached for a year by mistake.

---

## Pass / no action needed (for completeness)

- **robots.txt**: `User-agent: *` / `Allow: /` / `Sitemap: https://andrewthyip.com/sitemap.xml` — open, correct, single sitemap reference.
- **sitemap.xml**: Valid XML, 24 URLs (matches the ~24–25 expected), every entry carries reciprocal `xhtml:link` hreflang alternates (`en`, `zh-Hant`, `x-default`), `lastmod` dates present and plausible.
- **Canonical tags**: Self-referencing, absolute, trailing-slash-consistent, and match the sitemap `<loc>` on every page checked (home, `/ch/`, `/services/`, `/work/yocale/`).
- **hreflang**: Fully reciprocal between `/` ↔ `/ch/` and every EN/ZH page pair, both in the sitemap and in-page `<link rel="alternate">` tags; `x-default` correctly points to the English version; `<html lang="en">` vs `<html lang="zh-Hant">` set correctly per locale. (Full hreflang validation beyond this — e.g. exhaustive matrix checks — is in scope of the `seo-hreflang` sub-skill if a deeper pass is wanted.)
- **HTTP → HTTPS redirect**: Both `andrewthyip.com` and `www.andrewthyip.com` fully redirect to HTTPS (see Medium #5 for the status-code nuance on the `www` hop).
- **Meta robots / X-Robots-Tag**: No noindex found anywhere in HTML or headers — all indexable pages are actually indexable.
- **JS rendering**: Confirmed via raw HTML fetch (no headless rendering) that full page content (headings, copy, links) is present in the initial static response for every page checked — Astro's static output means there is no CSR dependency; GSAP/ScrollTrigger only add progressive-enhancement animation on top of already-rendered content. No JS-rendering risk for crawlers.
- **Structured Data**: `WebPage` + `Person` on home, `WebPage` + `Person` (via `about`) on `/services/`, `BreadcrumbList` + `CreativeWork` on case studies (`/work/yocale/`) — all valid schema.org types, correctly localized (`inLanguage: "zh-Hant"` set on the `/ch/` variants).
- **Compression**: HTML responses served with `Content-Encoding: br` (Brotli) — good.
- **Mobile viewport**: `<meta name="viewport" content="width=device-width, initial-scale=1">` present on every page checked.
- **Alt text**: Every `<img>` sampled across home, `/services/`, and `/work/yocale/` carries a descriptive `alt` attribute; below-the-fold images use `loading="lazy"`.

---

## Files referenced during this audit
- `C:\Users\andre\my-portfolio\vercel.json`
- `C:\Users\andre\my-portfolio\astro.config.mjs`
- `C:\Users\andre\my-portfolio\src\components\case-study-gif.astro`
- `C:\Users\andre\my-portfolio\src\components\hero-showcase-gallery.astro`
- `C:\Users\andre\my-portfolio\src\pages\work\yocale.astro`
- `C:\Users\andre\my-portfolio\src\pages\ch\work\yocale.astro`
- `C:\Users\andre\my-portfolio\src\pages\work\crowd-ease.astro`
- `C:\Users\andre\my-portfolio\src\pages\404.astro`
- `C:\Users\andre\my-portfolio\public\llms.txt`
- `C:\Users\andre\my-portfolio\public\robots.txt` (mirrors live `https://andrewthyip.com/robots.txt`)
