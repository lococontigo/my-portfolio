# Performance Findings — Core Web Vitals (andrewthyip.com, live site)

## Methodology

- Tool: Lighthouse 13.4.1 (CLI, programmatic) against the **live production URLs**, not local dev/preview.
- `formFactor: mobile`, `throttlingMethod: 'devtools'` (real throttled replay) — **not** the default `simulate`/Lantern mode. This project has a documented history of Lantern producing false 180,000ms+ LCP readings on media-heavy pages; devtools mode was used throughout and cross-checked below.
- No Google API/CrUX credentials are configured in this environment, so this is **lab data only**. Recommend validating against CrUX field data (PageSpeed Insights / CrUX Vis) once available — lab conditions here are a controlled, single-run mobile emulation and will not exactly match the 75th-percentile real-user distribution CWV is graded on.
- Routes tested (10): `/`, `/portfolio/`, `/services/`, `/work/yocale/`, `/work/delta/`, `/ch/`, `/ch/portfolio/`, `/ch/services/`, `/ch/work/yocale/`, `/ch/work/delta/`.
- **Sanity-check pass**: the first run executed all 10 routes sequentially in one shared headless Chrome instance. Because the three `/ch/` case-study/services pages came back with unusually high Total Blocking Time (TBT), they were re-tested — along with one English page as a control — using a **fresh, isolated Chrome launch per page** to rule out session/thermal contamination inflating the numbers. Results moved by ~20–40% (normal lab variance) but stayed in the same severity band in both runs, confirming this is a real page-level problem, not a measurement artifact (see Finding 2).

## Summary table

| Route | Perf score | LCP | CLS | TBT (INP proxy) | Page weight | Verdict |
|---|---|---|---|---|---|---|
| `/` | 94 | 2525 ms | 0.002 | 46 ms | 633 KB | LCP just over the 2.5s "Good" line; CLS/TBT good |
| `/portfolio/` | 95 | 2364 ms | 0.000 | 30 ms | 12.6 MB | CWV good; page weight is a latent risk |
| `/services/` | 83 (76 on re-check) | 2257 ms | 0.041 | 525 ms (787 ms on re-check) | 5.5 MB | LCP good; TBT Needs-Improvement/Poor |
| `/work/yocale/` | 85 | 2769 ms | 0.039 | 254 ms | 26.4 MB | LCP Needs-Improvement; page weight critical |
| `/work/delta/` | 85 | 2788 ms | 0.000 | 270 ms | 16.8 MB | LCP Needs-Improvement; page weight critical |
| `/ch/` | 85 | 3075 ms | 0.000 | 204 ms | 1.3 MB | LCP Needs-Improvement |
| `/ch/portfolio/` | 84 | 3070 ms | 0.000 | 244 ms | 13.8 MB | LCP Needs-Improvement |
| `/ch/services/` | 60 (64 on re-check) | 3059 ms | 0.000 | **2200 ms** (1406 ms on re-check) | 7.1–7.2 MB, 96–97 requests | LCP Needs-Improvement; TBT Poor |
| `/ch/work/yocale/` | 51 (53 on re-check) | 3484 ms | 0.000 | **1745 ms** (1174 ms on re-check) | 25.6–27.0 MB | LCP Needs-Improvement (near Poor); TBT Poor |
| `/ch/work/delta/` | 54 (57 on re-check) | 3616 ms | 0.000 | **1438 ms** (1210 ms on re-check) | 19.0 MB | LCP Needs-Improvement (near Poor); TBT Poor |

CWV thresholds used: LCP good ≤2.5s / poor >4.0s; CLS good ≤0.1 / poor >0.25; TBT (lab proxy for INP) good <200ms / poor >600ms per Lighthouse's own scoring curve.

**Headline result: CLS is a non-issue everywhere (0–0.041, all "Good"). TTFB is excellent everywhere (34–244ms). The problems are concentrated in LCP render delay and TBT/INP risk, and they compound badly on the `/ch/` case-study and services pages.**

---

## Finding 1 — LCP is text, not the hero media, and render delay (not network) is the bottleneck

**Severity: High**

**Evidence:** Lighthouse's `lcp-breakdown-insight` audit identifies the actual LCP element on every tested page as a text node — an `<h1>`/`<h2>`/`<p>` in the hero (e.g. home: `h2.split-headline` "I need a website"; `/work/yocale/`: `h1.case-hero-title`; `/ch/services/`: `p.hero-body`) — never an image or video, despite the huge hero media on these pages. The LCP timing breakdown confirms Time-to-First-Byte is trivial (35–244ms across all pages) while **"Element Render Delay" is 2.3–3.4 seconds** — i.e., nearly the entire LCP time is the browser sitting on already-downloaded HTML/text, unable to paint it yet:

| Route | TTFB | Element render delay |
|---|---|---|
| `/` | 218 ms | 2307 ms |
| `/work/yocale/` | 108 ms | 2661 ms |
| `/ch/work/yocale/` | 57 ms | 3427 ms |
| `/ch/services/` | 73 ms | 2986 ms |

This means LCP optimization effort should go into **removing render-blocking work between "bytes received" and "first paint,"** not into hero image/video compression (see Finding 2 for the specific culprit) or server response time (already good).

**Recommendation:**
- Do not spend effort re-compressing hero images/videos to fix LCP specifically — they are not the LCP element on any tested page.
- Focus on removing/deferring anything that runs or downloads between HTML parse and first paint (see Finding 2). `font-display-insight` came back with zero estimated savings on every page, so web font loading is already ruled out as a cause.
- Re-run this LCP-breakdown check after implementing Finding 2's fix to confirm render delay drops.

---

## Finding 2 — A same-origin ~91–94KB script is the #1 render-blocking resource on every single page

**Severity: High**

**Evidence:** Lighthouse's `render-blocking-insight` audit flags the same pattern on **all 10 routes**: a same-origin, extensionless, randomly-hashed URL (e.g. `https://andrewthyip.com/FLIFUKu6ClorJ3AXiTzZMYuRuCE0x-aIrwbuNVCq9HeJ55Euc5qGWX699soCpnjr0...`, a different hash per page) at 91–94KB, contributing **900–1640ms of render-blocking duration** — more than GSAP + ScrollTrigger combined on most pages:

| Route | Blocking resource | Size | Wasted ms |
|---|---|---|---|
| `/` | hashed script | 92 KB | 1450 ms |
| `/ch/` | hashed script | 93 KB | 1500 ms |
| `/work/yocale/` | hashed script | 91 KB | 1050 ms |
| `/ch/services/` | hashed script | 93 KB | 900 ms |

This resource does **not** appear in the raw static HTML (confirmed via direct `curl` of the homepage — only `gtag.js`, `analytics.ahrefs.com/analytics.js`, GSAP CDN, and `/scripts/gsap.js` are present in markup) and 404s when fetched directly outside a real browser session — it is generated/fetched dynamically at runtime. Cross-referencing the third-party breakdown, `analytics.ahrefs.com/analytics.js` (loaded `async` in `<head>`) is the only third-party script capable of spawning this: Ahrefs Web Analytics uses a same-origin, ad-blocker-resistant proxy mode that fetches its actual collector payload through a randomized per-load path on the site's own domain. Vercel's static hosting config (`vercel.json`) has no server-side bot-challenge/firewall middleware that could otherwise explain a dynamically-injected script, which further points to this being the analytics payload rather than a platform-level injection. This is a **high-confidence but not 100%-certain** identification — the exact vendor should be confirmed by checking Network tab in real DevTools before changing anything.

**Recommendation:**
- Confirm the vendor (open DevTools Network tab on a real page load, filter to the hashed same-origin request, check initiator chain — it should point back to `analytics.ahrefs.com/analytics.js`).
- If confirmed as Ahrefs Analytics: its loader is already marked `async`, but the resulting proxied fetch is still executing in the paint-critical window. Delay analytics initialization until after `load` (e.g. wrap the ahrefs snippet call in `window.addEventListener('load', ...)` or `requestIdleCallback`) so it never competes with first paint. This is a config/placement change, not a new dependency, and doesn't touch `tokens.css` or component code.
- Re-measure LCP element-render-delay after the change — expect it to drop by roughly the 900–1600ms currently attributed to this resource.

---

## Finding 3 — Severe TBT (INP-risk) on `/ch/services/`, `/ch/work/yocale/`, `/ch/work/delta/` — confirmed real, not a test artifact

**Severity: Critical**

**Evidence:** These three routes scored in the 51–64 performance range with TBT far past Lighthouse's "Poor" line (>600ms):

| Route | Run 1 (shared Chrome, sequential) | Run 2 (fresh Chrome, isolated) |
|---|---|---|
| `/ch/services/` | score 60, TBT 2200 ms | score 64, TBT 1406 ms |
| `/ch/work/yocale/` | score 51, TBT 1745 ms | score 53, TBT 1174 ms |
| `/ch/work/delta/` | score 54, TBT 1438 ms | score 57, TBT 1210 ms |

Both runs land in the same "Poor" band despite the isolated re-run using a fresh Chrome process per page (ruling out shared-session contamination as the explanation) — this is a genuine problem, not a repeat of the earlier Lantern false-positive. `long-tasks` count hit the audit's cap of 20 on all three pages (vs. 4–7 on the lighter pages), and `mainthread-work-breakdown` shows thousands of ms of `scriptEvaluation`/`styleLayout`/`paintCompositeRender` work concentrated on these three routes specifically.

Root cause is a **combination of two factors that compound on the `/ch/` variants**: (a) the same oversized hero media as the English pages (Finding 4), and (b) GSAP's `gsap.min.js` (loaded from `cdnjs.cloudflare.com`) showing extreme main-thread attribution specifically on the Yocale case study — **2500ms on `/work/yocale/` and 2287ms on `/ch/work/yocale/`**, versus only 48–65ms of gsap.min.js main-thread time on `/ch/services/` and `/ch/work/delta/`. This is consistent with GSAP/ScrollTrigger repeatedly animating or transforming an element that contains the giant unoptimized GIFs/video on the Yocale page, forcing expensive repaint/composite work on every scroll-tick tween.

**Recommendation:**
- Treat `/ch/work/yocale/` as the top-priority page: audit its GSAP/ScrollTrigger usage in `public/scripts/gsap.js` for animations that transform, scale, or scrub an element containing the 8MB GIFs — moving that media out of the animated element's transform chain (e.g. wrap in a static container and only animate opacity/a sibling overlay) should cut most of the 2.3–2.6s gsap.min.js attribution.
- Independently fix Finding 4 (media weight) — reducing decode/paint cost of the underlying assets will reduce TBT on all three pages regardless of the GSAP fix.
- After both fixes, re-run Lighthouse with `throttlingMethod: devtools` on these three routes specifically to confirm TBT drops under 200ms.

---

## Finding 4 — Case-study and portfolio pages ship 12.6–27MB of largely unoptimized media

**Severity: High**

**Evidence:** `total-byte-weight` per route, with the largest individual assets:

| Route | Total weight | Largest assets |
|---|---|---|
| `/work/yocale/` | 26.4 MB | `0621-ezgif.com-video-to-gif-converter.gif` 8.4MB, `yocale.homepage.gif` 8.3MB, `hero-demo.mp4` loaded twice (5.6MB + 3.8MB) |
| `/ch/work/yocale/` | 27.0 MB | Same GIFs (7.7MB + 7.6MB) + `hero-demo.mp4` twice (4.8MB + 4.5MB) + ~2.2MB of CJK webfont subsets |
| `/work/delta/` | 16.8 MB | `ezgif.com-crop.webp` 5.9MB, `user-problem-Source.webp` 4.9MB, `navigation.webp` 3.2MB, `The-Source-Header-1.svg` **1.95MB** (an SVG file — almost certainly a raster image embedded/traced into SVG rather than a real vector) |
| `/ch/work/delta/` | 19.0 MB | Same as above + ~2.4MB CJK webfont subsets |
| `/portfolio/` | 12.6 MB | `Mac-Studio-mockup.svg` 5.9MB, `ant-mockup.svg` 5.1MB, `UI-CROWDEASE-1.svg` 1.2MB — again SVGs at a size only plausible with embedded raster data |
| `/ch/portfolio/` | 13.8 MB | Same SVGs + CJK webfonts |
| `/services/` | 5.5 MB | `ant-brief-introduction.mp4` loaded **twice** (2.5MB + 2.2MB — same clip, investigate duplicate `<video>`/preload) |

Animated GIFs at 7–8MB each are one of the single worst formats for web delivery — every frame is an uncompressed-ish raster frame with no interframe/motion compression, unlike video codecs. These are the primary driver of the "poor" scores in Finding 3.

**Recommendation:**
- Convert `0621-ezgif.com-video-to-gif-converter.gif` and `yocale.homepage.gif` (16MB combined) to `<video>` (H.264 mp4 + webm/AV1) with `autoplay muted loop playsinline` — this alone should cut ~14MB+ off `/work/yocale/` and `/ch/work/yocale/` with no visible quality loss, since GIF→H.264 typically yields 90%+ size reduction for the same visual motion.
- Investigate `The-Source-Header-1.svg` (1.95MB) and the two `/portfolio/` mockup SVGs (5–6MB each) — open them and check for embedded base64 raster data (`<image xlink:href="data:image/png;base64,...">`); if present, export the underlying raster separately as compressed WebP/AVIF and reference it normally rather than inlining it in SVG.
- Convert the Delta case-study `.webp` "gif-like" screen-recordings (5.9MB/4.9MB/3.2MB) to short muted looping `<video>` the same way.
- Confirm whether `hero-demo.mp4` (Yocale) and `ant-brief-introduction.mp4` (services) are genuinely intended to load twice (e.g. two different `<source>` variants for a before/after or a compare-slider component per `case-study-compare-slider.astro`/`case-study-video.astro`) — if it's an accidental duplicate fetch of the identical file, dedupe it.

---

## Finding 5 — Chinese pages carry a consistent ~1.8–2.4MB CJK webfont tax and near-double the request count

**Severity: Medium**

**Evidence:** Every `/ch/` route pulls the same Google Fonts stylesheet (`Noto+Serif+TC` + `Noto+Sans+TC`, 3 weights each) which Google serves pre-sliced into **~28 separate unicode-range `.woff2` files**, totaling 1.8–2.4MB of additional font transfer not present on the English pages (confirmed via the `third-parties-insight` audit's Google Fonts entity: 2192KB on `/ch/work/yocale/`, 2374KB on `/ch/work/delta/`, 1813KB on `/ch/services/`). Request counts nearly double versus the English equivalent: `/ch/services/` = 96–97 requests vs. `/services/` = 74–77.

Main-thread scripting cost from these font files is reported as ~0ms (fonts don't execute), so this is primarily a **data-weight and connection-contention** issue rather than a direct TBT cause — but on throttled/cellular connections it competes for bandwidth with the render-blocking script (Finding 2) and hero media (Finding 4), and 28 separate unicode-range fetches inherently means the browser must resolve which subset(s) it needs before glyphs can render, which is a plausible contributor to the render delay in Finding 1 specifically on `/ch/` pages (compare: `/ch/` element-render-delay 2.3s+ vs some English pages).

**Recommendation:**
- This volume of subset requests is inherent to CJK web fonts and largely unavoidable if genuinely serving the full character range used in the case-study copy — but consider whether all 3 weights of both Noto Serif TC and Noto Sans TC are actually used, or whether one family/weight combination could be dropped to roughly halve this cost.
- For long-form CJK body copy specifically, consider falling back to the visitor's system CJK font (`font-family: ..., "PingFang TC", "Microsoft JhengHei", sans-serif` as a fallback stack) rather than the custom webfont, reserving Noto Serif/Sans TC for headings only — this is the standard mitigation for the "CJK webfont tax" and would cut the 1.8–2.4MB down substantially without materially changing the CA Stone/HK Night typographic feel for body text.

---

## Finding 6 (informational) — CLS and TTFB pass cleanly everywhere; no action needed

**Severity: Informational / Pass**

**Evidence:** CLS ranged 0.000–0.041 across all 10 routes — comfortably under the 0.1 "Good" threshold, with most pages at exactly 0. TTFB ranged 34–244ms across all routes, well within "Good" territory. Neither metric needs remediation.

**Recommendation:** No action required. Keep the current `width`/`height` attribute and font-loading discipline that's keeping CLS at zero as new sections are added.

---

## Priority order for remediation

1. **Finding 3** — fix `/ch/work/yocale/`'s GSAP/media interaction (Critical, single page, clear root cause)
2. **Finding 4** — convert GIFs/oversized SVGs to compressed video/WebP across portfolio + case-study pages (High, benefits LCP resilience, TBT, and real-world mobile data cost simultaneously)
3. **Finding 2** — defer the Ahrefs Analytics same-origin proxy script off the critical rendering path (High, site-wide, low-risk config change)
4. **Finding 5** — trim CJK webfont weight/scope on `/ch/` pages (Medium, site-wide on Chinese routes)
5. **Finding 1** — re-verify LCP once 2–4 are done (should resolve as a side effect, not a separate code change)
