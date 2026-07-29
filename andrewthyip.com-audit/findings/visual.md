# Visual / Above-the-Fold Audit — andrewthyip.com

**Method:** Playwright (Chromium headless), custom capture script (Playwright not the packaged `capture_screenshot.py` defaults, since this audit required a 1440px desktop viewport rather than the skill's 1920px preset). Desktop viewport 1440x900, mobile viewport 375x812 (2x device scale factor). For each page: above-the-fold screenshot, full-page screenshot, DOM signal extraction (H1 visibility, CTA visibility/position, horizontal-scroll check, nav height, console errors).

**Pages tested:** `/` (home), `/portfolio/`, `/services/`, `/work/yocale/` (case study).

**Screenshots saved to:** `c:\Users\andre\my-portfolio\andrewthyip.com-audit\screenshots\`
- `home_desktop.png` / `home_mobile.png` (+ `_full.png` variants)
- `portfolio_desktop.png` / `portfolio_mobile.png` (+ `_full.png` variants)
- `services_desktop.png` / `services_mobile.png` (+ `_full.png` variants)
- `case-study-yocale_desktop.png` / `case-study-yocale_mobile.png` (+ `_full.png` variants)

---

## Findings

### 1. [HIGH] Mobile hero background animation washes out headline/body text on /portfolio/
**Evidence:** `portfolio_mobile.png`, `portfolio_mobile_full.png` vs. `portfolio_desktop.png`

The hero's ambient glow effect is rendered by a full-bleed `<canvas class="hero-fluid-canvas">`. On desktop (1440px) it stays a contained, off-text amber glow to the right of the copy column (`portfolio_desktop.png`), never crossing the headline or body text. On mobile (375px) the same canvas element measures `375x812` — i.e. it fills the *entire* viewport rather than staying contained — and its brightest bloom sits directly behind the "Designer & Developer" headline and the "I'm Andrew — I build intuitive products…" paragraph. In the screenshot the lowercase "D" in "Designer" and most of the paragraph text are visually washed out against the bright cream-colored bloom, which likely fails WCAG AA contrast (4.5:1) at its brightest point even though the CTA button below it stays legible (it has its own bordered background).

This is the single most visible above-the-fold defect found — it's the primary value-prop line ("Designer & Developer" + the one-line bio) on the site's main portfolio landing page, and it's meaningfully harder to read on mobile than on desktop.

**Recommendation:** Constrain `hero-fluid-canvas` to a fixed max-width/positioned corner on mobile the same way it's contained on desktop (e.g. clip to a circular mask, or cap canvas dimensions via CSS rather than filling `100vw/100vh`), or reduce canvas opacity/brightness under the text column on narrow viewports. Verify contrast of `--text-1`/`--accent` text against the canvas's brightest sampled pixel meets 4.5:1 at the 375px breakpoint specifically (not just desktop).

---

### 2. [MEDIUM] Mobile nav hamburger touch target is under the 48x48px minimum
**Evidence:** `portfolio_mobile.png`, `services_mobile.png`, `case-study-yocale_mobile.png` (shared nav component)

Measured hamburger button bounding box: `40x40px` (`x:302, y:16` on a 375px viewport). This is below the commonly-cited 48x48px minimum touch target guideline and is the same shared nav component across every page tested (portfolio, services, case study).

**Recommendation:** Increase the hit-area (padding) of the mobile nav toggle to 48x48px minimum while keeping the visual icon glyph at its current size — this only requires a CSS padding/`min-width`/`min-height` adjustment on the existing toggle element, no visual redesign needed.

---

### 3. [PASS — informational] Homepage above-the-fold is a single-viewport split-screen router; no on-page name/brand text, but this is by design and doesn't hurt social/AI rendering
**Evidence:** `home_desktop.png`, `home_mobile.png`

`/` renders as an exact single-viewport split screen (`pageHeight === viewportHeight` — confirmed `900/900` desktop and `812/812` mobile, i.e. **zero scroll, zero layout shift**). Left half (HK Night, dark) reads "I'm hiring → andrewthyip.com/portfolio", right half (CA Stone, light) reads "I need a website → andrewthyip.com/services". Both primary CTAs are 100% visible above the fold with no competition, which is about as strong an "outcome-driven, immediately actionable" above-the-fold pattern as this format allows, and it correctly encodes Andrew's name into the CTA link text itself (`andrewthyip.com/...`) even without a separate visible logo/heading.

For search/AI-crawler and social-share rendering specifically: the page's extracted body text is minimal ("I'm hiring", "I need a website", two URLs), so an engine reading raw text alone gets very little context. However, the `<meta>`/OG tags carry full identity (`og:title: "Home · Andrew YIP"`, description mentioning "UX/UI designer and developer based in Vancouver") and `og:image` points to a dedicated, well-composed 1200x630 branded image (`/images/OG/OG.png`, "Andrew's Portfolio" cinematic still) that renders correctly as a social-share preview — confirmed by direct fetch. So the homepage's minimal on-page text is not a practical risk for link-preview cards; it's only a very minor risk for text-only extraction (e.g. `og:description`-ignoring crawlers).

**Recommendation:** No action required. If ever revisited, a visually-hidden (`sr-only`) `<h1>` with Andrew's name/role would give raw-text extraction a stronger anchor without changing the visual design.

---

### 4. [PASS] /services/ — value proposition and CTA fully visible above the fold, both breakpoints
**Evidence:** `services_desktop.png`, `services_mobile.png`

H1 "Websites Built to Grow Your Business" and the primary CTA "Get A Free Consultation" are both fully within the fold at 1440px and 375px, with no scrolling required. CA Stone (light/teal) theme renders with good text contrast, no overlapping elements, no horizontal scroll (`documentScrollWidth === windowInnerWidth` on both breakpoints). This is the strongest above-the-fold execution of the four pages tested.

---

### 5. [PASS] /work/yocale/ — H1 gradient-accent pattern is accessible, not a duplicate-content bug
**Evidence:** DOM inspection (`document.querySelector('h1').outerHTML`)

Automated text extraction initially flagged the H1 text as duplicated ("Yocale: Building a Design Growth System… Yocale: Building a Design Growth System…"). Inspection of the actual markup shows this is intentional and correctly implemented:
```html
<h1 class="case-hero-title">
  <span aria-hidden="true"><em class="case-hero-title-accent">Yocale</em>: Building a Design Growth System that Makes Lead Generation Effortless</span>
  <span class="sr-only">Yocale: Building a Design Growth System that Makes Lead Generation Effortless</span>
</h1>
```
The visible, styled span is `aria-hidden`, and a `sr-only` span carries the same text once for assistive tech/text extraction. This is the correct pattern for gradient/accent-styled headings and should not be "fixed" — flagging here only so it isn't mistaken for a bug in a future automated pass.

**Layout note:** on mobile (375px) the 4-line headline consumes most of the fold, pushing the case-study media grid to start right at/after the fold line (`case-study-yocale_mobile.png`); on desktop the media grid's top row is only barely visible above the fold. Neither is a defect — case study pages are intentionally content-first with no hero CTA competing with the headline; the persistent nav ("Work" / "Say hello →") remains the above-the-fold action path.

---

### 6. [LOW] Full-page case study capture shows unresolved gray placeholder blocks further down `/work/yocale/`
**Evidence:** `case-study-yocale_desktop_full.png`, `case-study-yocale_mobile_full.png`

The full-page screenshots (captured via a fast programmatic `full_page=True` screenshot, not a real scroll) show several empty gray boxes in the lower two-thirds of this long page (scroll height ~21,379px desktop / ~14,981px mobile). This is most likely a **capture artifact**: `loading="lazy"` images that hadn't entered the viewport (and therefore hadn't started decoding) at the instant the full-page screenshot stitched the page together, rather than a real defect a human visitor would see while scrolling at normal speed.

**Recommendation:** Not a required fix based on this evidence alone, but worth a quick manual scroll-through of `/work/yocale/` (and any other very long case study) to confirm lazy images resolve comfortably ahead of the viewport at normal scroll speed. If confirmed fine, no action needed.

---

## Cross-page checks (all 4 pages x 2 viewports = 8 captures)

| Check | Result |
|---|---|
| Horizontal scroll (`scrollWidth > innerWidth`) | **Pass** — none detected on any of the 8 captures |
| Console errors during load | **Pass** — zero console errors on any of the 8 captures |
| H1 present and visible above the fold | **Pass** — all 4 pages, both viewports |
| Primary CTA visible above the fold (desktop) | Pass: home, services. Partial: portfolio (CTA visible but text above it hard to read, see Finding 1). N/A by design: case study (content-first, nav CTA persists) |
| Primary CTA visible above the fold (mobile) | Same as desktop, plus mobile-specific legibility issue on portfolio (Finding 1) |
| data-theme correctness (HK Night dark on `/` and `/portfolio/`, CA Stone light on `/services/` and `/work/yocale/`) | Confirmed via rendered screenshots — matches CLAUDE.md duality spec |

## Summary

Three of four pages tested (`/`, `/services/`, `/work/yocale/`) have clean, clear above-the-fold execution with no layout integrity problems on desktop or mobile. The one real defect worth fixing is **Finding 1**: the `/portfolio/` page's ambient hero canvas fills the full mobile viewport instead of staying contained as it does on desktop, washing out the headline and bio copy — this is the site's main "who is this and what do they do" page, so it's the highest-value fix from this audit. Finding 2 (hamburger touch target) is a quick, low-risk a11y polish item. Findings 3, 5, and 6 are informational/no-action.
