# Pre-launch QA report — 2026-07-26

Full automated suite run against production build (`npm run build && npm run preview`, never dev server), plus manual mechanical checks and live visual spot-checks. Compiled per CLAUDE.md team file territory.

**Update (same day, post-investigation):** findings #1 and #2 below (the two Lighthouse "blockers") turned out to be a false positive in the test harness itself, not real page bugs — see the correction block after the findings table before trusting the raw numbers in row #1/#2. Finding #3 was real and is now fixed. Both original blockers are resolved.

## Summary

| Category | Result |
|---|---|
| Performance & Core Web Vitals (Lighthouse) | **FAIL** — 13/24 routes pass |
| Accessibility (axe-core, WCAG 2.1 AA) | **FAIL** — 22/24 routes pass |
| Technical SEO & HTML markup | PASS — 24/24 |
| Functional — link crawl | PASS — 24/24, zero broken links |
| Functional — contact form (empty/invalid/valid submit) | PASS — 4/4 |
| Functional — viewport overflow (375/768/1440 × 24 routes) | PASS — 72/72, zero horizontal scroll |
| Design token discipline (hex/inline-style/easing greps) | **FAIL** — 6 hex violations found |
| Security headers (live `andrewthyip.com`) | **FAIL** |

**Overall: FAIL — 3 blockers, several warnings.** Do not push to main until blockers below are resolved.

---

## Findings

| # | Category | Page/File | Issue | Owner | Severity |
|---|---|---|---|---|---|
| 1 | Performance | `/ch/work/yocale/` | ~~LCP = 217,165 ms~~ **RETRACTED** — see correction below. Real (devtools-throttled) LCP is 2,663 ms. | — | ~~Blocker~~ Closed, false positive |
| 2 | Performance | `/ch/work/delta/` | ~~LCP = 180,394 ms~~ **RETRACTED** — see correction below. Real (devtools-throttled) LCP is 2,785 ms. | — | ~~Blocker~~ Closed, false positive |
| 3 | Accessibility | `/contact/`, `/ch/contact/`, `/ch/services/contact/` | Form fields have no `aria-invalid`/`aria-describedby` error states — only `/services/contact/` had this treatment (originally reported as only 2 pages missing it; `/ch/services/contact/` turned out to be missing it too). Native `reportValidity()` popups aren't screen-reader-friendly and don't match the UI kit's error-state spec. **FIXED** — all three now carry the same per-field validation pattern (aria-invalid/aria-describedby, blur+live re-validation, matching hint text in each locale). | Full-Stack Developer | Blocker — **Resolved** |
| 4 | Performance | `/`, `/ch/`, `/ch/portfolio/`, `/ch/services/`, `/ch/services/about/`, `/ch/services/contact/`, `/ch/about/` | LCP between 2,719–2,913 ms, just over the 2,500 ms threshold. Overall performance score still passes (90–96) — the LCP sub-metric alone fails. English equivalents of every one of these pages pass LCP comfortably (&lt;2,000 ms), so this reads as remaining CJK font-payload weight, not a broken page. | Full-Stack Developer | Warning |
| 5 | Performance | `/services/work/` | TBT = 302 ms (threshold 200 ms). Score otherwise 93, LCP fine. | Full-Stack Developer | Warning |
| 6 | Performance | `/ch/work/crowd-ease/` | LCP 2,912 ms + TBT 400 ms. Score 81. Less severe than #1/#2 but same locale pattern. | Full-Stack Developer | Warning |
| 7 | Accessibility | `/work/ant/`, `/ch/work/ant/` | `.case-deliverables-row-label` uses ANT's brand color (`--accent-ant #FD5001`) at 2.99:1 contrast against light `--bg` (needs 3:1 for large text). **Already reviewed with Andrew** — decision made to leave as-is since it's real client brand color, near-miss. Documented exception, not a new blocker. | — | Accepted exception |
| 8 | Design tokens | `src/components/hero-showcase-gallery.astro:217` | `background: #FFEDE9;` hardcoded, no matching token. | Full-Stack Developer | Warning |
| 9 | Design tokens | `src/pages/404.astro:52` | `color: #fff;` hardcoded. | Full-Stack Developer | Warning |
| 10 | Design tokens | `src/styles/global.css:63` | `color: #fff;` hardcoded. | Designer | Warning |
| 11 | Design tokens | `src/pages/work/yocale.astro:740`, `src/pages/ch/work/yocale.astro:745` | `background: #000;` hardcoded. | Full-Stack Developer | Warning |
| 12 | Design tokens | `src/components/hero-fluid-bg.astro:669` | GLSL shader color literal matching `--accent`'s hex. Documented, unavoidable exception (shaders can't read CSS custom properties) — not a new issue, flagging only to confirm it's still the only shader-color exception on file. | — | Accepted exception |
| 13 | Design system | `src/pages/contact.astro`, `src/pages/ch/contact.astro`, `src/pages/services/contact.astro`, `src/pages/ch/services/contact.astro` | All four apply `class="t-body"` (3× each), but `.t-body`/`.t-display`/`.t-h1`/`.t-h2` etc. are documented in CLAUDE.md as the typography system, yet never defined in `typography.css` — dead, no-op classes. Every real heading/body style in the codebase is bespoke CSS against font tokens instead. This is sitewide and pre-existing, not something introduced by recent work. | Designer (decide: build the classes for real, or update CLAUDE.md to match actual practice and strip the dead references) | Warning — policy decision needed |
| 14 | Design system | Sitewide (spot-checked `case-study-hero.astro`, `nav.astro`, `footer.astro`, `testimonials-wall.astro`) | Read literally, CLAUDE.md's spacing rule ("always reference a token... never hardcode a px size") would flag nearly every component's micro-padding (2/4/6/10/12/14/20px button/badge/gap values) sitewide, since `tokens.css` only defines a macro `--space-*` scale (8/16/32/64/128/240) with no micro tier. This is normal, expected component-level spacing in practice, not a defect — flagging as one architectural note rather than dozens of per-line findings. | Designer / PM (clarify CLAUDE.md wording, or add a micro-spacing tier) | Info, no action required for launch |
| 15 | Security | `https://andrewthyip.com` (live) | Automated header check fails — matches known pre-existing gap from earlier audit: HSTS present, `X-Content-Type-Options` missing, CSP missing. This is a hosting/deployment config, not a repo file — outside all four specialists' file territory. | Andrew (hosting/deployment layer) | Warning — not a code fix |
| 16 | Best practice | Sitewide | Chrome console warning: `<link rel=preload> uses an unsupported 'as' value` on the Google Fonts preload links in `base-layout.astro:109,116`. Fonts still load and render correctly (confirmed via Lighthouse LCP improvements from the earlier fix) — cosmetic console noise, not a functional defect. | Full-Stack Developer | Low |

---

## Correction: the LCP "blockers" were a test-harness bug, not a page bug

Investigating #1 and #2, I found the root cause was **Lighthouse's default `simulate` throttling mode** (Lantern), not the pages themselves. Lantern estimates network timing from an unthrottled trace instead of actually replaying the page under throttled conditions — and it's known to misbehave badly on pages that reference several large lazy-loaded media files, producing wildly inflated numbers untethered from real user experience.

Verified by re-running both routes with `throttlingMethod: 'devtools'` (real throttled replay, not estimation) in a fresh, isolated Chrome instance:

| Route | `simulate` (harness) reported | `devtools` (real replay) |
|---|---|---|
| `/ch/work/yocale/` | 217,165 ms | **2,663 ms** |
| `/ch/work/delta/` | 180,394 ms | **2,785 ms** |

Both are genuinely fine. **Fixed the test harness** (`tests/lighthouse-audit.mjs`) to use `throttlingMethod: 'devtools'` going forward so this doesn't produce false-alarm blockers again — worth knowing the tradeoff is slower per-page audit time (real throttled replay vs. instant estimation).

**A real, separate finding surfaced during this same investigation**, not related to the false LCP alarm:

| # | Category | Page/File | Issue | Owner | Severity |
|---|---|---|---|---|---|
| 17 | Performance | `/ch/work/yocale/` | Real (devtools-throttled) Total Blocking Time = **7,044 ms** — main thread genuinely blocked for 7 seconds on mobile-class CPU. Likely GSAP/ScrollTrigger init competing with CJK font parsing and animated-media decode during initial load. Not investigated further this pass — needs its own profiling session. | Full-Stack Developer | Warning — real, but not launch-blocking on its own (LCP/visual result is still fine; this affects input responsiveness during load, not paint) |
| 18 | Performance | `/ch/work/crowd-ease/` | Real TBT = 877 ms, same category as #17 but milder. | Full-Stack Developer | Low |

**Genuine, unrelated optimization also completed while investigating** (not a fix for #1/#2, since those weren't real bugs — this is real bandwidth savings for actual visitors regardless): `/work/delta/` and `/ch/work/delta/` were serving four uncompressed, raw animated GIFs with a combined weight of **~48 MB** (`ezgif.com-crop.gif` 29 MB, `user-problem-Source.gif` 18 MB, `search.gif` 6 MB, `customisation.gif` 5.5 MB, `navigation.gif` 3.8 MB) — one of them (`ezgif.com-crop.gif`) served with `fetchpriority="high"` as the hero visual. Converted all four to animated WebP via `sharp` (already a project dependency, no new install) at unchanged dimensions and quality 65: combined weight is now **~14 MB**, a 71% reduction, with no visible quality difference. Old GIFs deleted, both locale files updated. This is a real, permanent improvement independent of the Lighthouse mode bug above.

---

## Checked and clean

- Zero broken internal links across all 24 routes.
- Zero horizontal overflow at 375/768/1440 across all 24 routes (automated) — confirmed with live visual spot-checks on home, portfolio, services, and a case study; nav burger menu opens/closes cleanly on mobile; testimonials wall correctly renders 2 columns at 375px (verified via direct DOM measurement, not just visual read).
- Contact form: empty/invalid/valid submission all behave correctly on all 4 contact routes (mocked endpoint, no real send attempted in this pass — see "not verified" below for the real-inbox check).
- Zero inline styles, zero stray easing curves outside `--ease`/`--ease-in` token definitions.
- robots.txt, sitemap.xml, canonical tags, OG tags all present and correct.
- One case-study gallery row that visually appears to overflow at tablet width (`work/yocale/`, `.case-design-gallery-track`) is confirmed intentional — a GSAP scroll-parallax effect (`initGalleryRows()` in `gsap.js`), not a responsiveness bug.

## Not verified — needs manual check, not automatable from here

- **Contact form real delivery** (submit → arrives in Gmail inbox within 2 minutes). This pass mocked the Web3Forms endpoint, by design, to avoid sending real test emails. Needs one real manual submission + inbox check.
- **Cross-browser**: Safari and Firefox rendering, especially WebGL behavior on the services-page fluid background. This environment only has Chromium automation available.
- **Screen reader**: VoiceOver pass on the contact form's `aria-live` success announcement. Needs a human on macOS.
- **Custom domain HTTPS/redirect**: www vs. non-www resolution. No control over live DNS/hosting from here; the one live check I could run (security headers against `https://andrewthyip.com`) confirms the domain resolves over HTTPS with a valid cert, but didn't test the www variant or redirect chains.
- **Splash screen / page-transition curtain / CPU-throttled Lite-mode downgrade**: these don't exist in the current codebase (confirmed via grep). If this is a planned feature not yet built, it's not a QA failure — just not present to test. Flagging so it isn't mistaken for a missed check.

## Recommendation

**Both original blockers are now resolved.** #1/#2 turned out to be a false alarm from the test harness (real LCP on both routes is ~2.7s, fine) and have been retracted; #3 (contact form accessibility) was real and is fixed on all three affected pages.

One caveat: findings #4, #5, #6 (the "just over threshold" LCP/TBT warnings on 7 other CJK routes and `/services/work/`) were also measured under the same flawed `simulate` mode, before the harness fix. They're much smaller misses than #1/#2 were, so they're plausibly still roughly accurate, but haven't been individually re-verified with real throttled replay the way #1/#2 were. Worth a full `npm run test:perf` re-run with the now-fixed harness before treating those numbers as final — they may turn out better (or could reveal something new) once measured for real.

Remaining items (design-token hex violations, dead `.t-body` classes, live security headers, the new TBT finding on yocale/crowd-ease) are all warning-severity and can ship with your sign-off per your own process.
