# QA Report — Language toggle functional bug investigation

**Date:** 2026-07-20
**Scope:** Andrew's report — "I just tried the language toggle button, and it doesn't work."
**Files reviewed:** `src/components/nav.astro`, `src/layouts/base-layout.astro`, `src/pages/index.astro`, `src/pages/ch/index.astro`, `astro.config.mjs`, `src/i18n/en.json`, `src/i18n/zh-hant.json`, `src/pages/work/delta.astro` + `src/pages/ch/work/delta.astro` (representative case-study pair), `public/scripts/gsap.js`.
**Method:** Static read-through of all logic paths, `git diff` against the pre-toggle version of `nav.astro`, a full `npm run build` with direct inspection of generated `dist/**/index.html` for `/about/`, `/ch/about/`, `/services/`, `/ch/services/`, `/work/delta/`, `/ch/work/delta/`, and a parallel check against `npm run dev` output for the same pages (to rule out a dev-vs-build `Astro.currentLocale` resolution gap).

## Ruled out
- **`Astro.currentLocale` resolution**: Confirmed correct in both `npm run dev` and `npm run build` output for every page tested — the active/inactive span-vs-anchor split is always correct (English pages render `<span class="...active">EN</span>` + `<a href="/ch/...">中文</a>`, and vice versa on `/ch/*` pages). No dev/build gap.
- **`enHref`/`zhHref` computation, `TRANSLATED_PATHS` fallback, `NAV_ROUTES` per-variant routing**: All verified correct in generated HTML for `portfolio` variant, `services` variant, and case-study pages (`/work/delta/` ↔ `/ch/work/delta/`, produces `/ch/work/delta/` and `/work/delta/` respectively — the real same-page translation, not a home-page fallback).
- **`navVariant` prop wiring**: `services.astro` and its `/ch/` counterpart, plus `services/work.astro`, `services/about.astro`, `services/contact.astro` (both locales) all correctly pass `navVariant="services"` into `BaseLayout`, which forwards it to `<Nav variant={navVariant}>`. Not a source of the bug.
- **CSS blocking/stacking on the toggle in its normal (non-case-mode) state**: no unexpected `pointer-events`, z-index, or opacity issue found for `.nav-lang-toggle`/`.nav-lang-option` outside of case-mode.

## Finding 1 — Homepage split-gate language toggle can enter a silent redirect loop back to the wrong locale (blocks ship)

**Where:** `src/pages/index.astro` lines 38–47 (the `localStorage`-driven auto-redirect script), in combination with `src/components/nav.astro` lines 474–479 (the click handler that writes `localStorage.setItem('preferredLocale', ...)`), and `src/pages/ch/index.astro` (which has **no** reciprocal redirect-guard script).

**What's wrong:** `index.astro`'s inline script unconditionally does `window.location.replace('/ch/')` on every load of `/` if `localStorage.getItem('preferredLocale') === 'zh-Hant'`. That flag is written only by `nav.astro`'s click handler on `a.nav-lang-option` elements (present on every non-homepage page), and is **never cleared** by the homepage's own split-gate toggle (`src/pages/index.astro` line 18, `<a href="/ch/" class="split-lang-toggle">`) or its Chinese counterpart's EN link (`src/pages/ch/index.astro` line 19, `<a href="/" class="split-lang-toggle">EN</a>`) — neither of those two links carries the `nav-lang-option` class, so neither is wired to the `localStorage.setItem` listener at all.

**Repro:**
1. Visit any chrome-bearing page in English, e.g. `/about/`. Click the "中文" nav toggle → navigates to `/ch/about/` and (as intended) sets `localStorage.preferredLocale = 'zh-Hant'`.
2. Later, land on the bare homepage `/` again (typed URL, bookmark, back button, or the logo doesn't even go here so most likely a fresh navigation). The homepage's script immediately fires and silently redirects to `/ch/` before the visitor can interact with anything.
3. On `/ch/`, click the "EN" pill (`href="/"`). The browser navigates to `/` — but `/`'s own script re-checks `localStorage`, still sees `'zh-Hant'` (nothing ever reset it), and immediately redirects straight back to `/ch/`.
4. Net effect: clicking "EN" on the homepage never lands the visitor on the English homepage — it flashes and bounces back to Chinese every time. From the visitor's perspective the language toggle **does nothing** — exactly matching Andrew's report, with no console error to point at.

**Why it violates CLAUDE.md:** Nav/toggle behavior must be a real, working, anticipatory interaction ("surface the next likely action") — a control that silently self-reverts is a functional regression, not a design nuance. It also breaks "both worlds render correctly and consistently" in spirit: the visitor becomes unable to reach the English world's homepage at all once the flag is set, via the one control designed for exactly that.

**Severity: blocks ship.** This is a genuinely broken, easily-reproduced core navigation control on the most prominent instance of the toggle (the homepage split gate), not a cosmetic nit. Escalating this class of finding per QA charter.

**Suggested fix direction (for the Full-Stack Developer, not applied by me):** Either (a) also wire `.split-lang-toggle` clicks (on both `index.astro` and `ch/index.astro`) to update `localStorage.preferredLocale`, so clicking "EN" clears the stale `'zh-Hant'` flag before the redirect script re-checks it, or (b) drop the auto-redirect approach in favor of only redirecting once per session (e.g. a second flag like `localeRedirectSeen`) so an explicit click of "EN" is never immediately overridden.

## Finding 2 — Language toggle becomes invisible and unclickable on case-study pages after scrolling past the hero (desktop) — likely the exact repro if Andrew tested on a `/work/*/` page

**Where:** `src/components/nav.astro` lines 203–234 (pre-existing "Case study section nav (crossfade)" block, `@media (min-width: 1025px)`), specifically:
```css
.nav.case-mode .nav-links-default {
  opacity:        0;
  pointer-events: none;
}
```
This rule targets `.nav-links-default`, which is also the container the new `.nav-lang-toggle` was added inside (nav.astro line 70).

**What's wrong:** On any page that passes a `sections` prop to `<Nav>` (the four case studies: `/work/delta/`, `/work/ant/`, `/work/crowd-ease/`, `/work/yocale/`, and their `/ch/` counterparts), scrolling past the hero switches the nav into `case-mode`, which crossfades `.nav-links-default` (Work/About/**language toggle**/CTA) out in favor of `.nav-links-sections` (the in-page jump links). The section-jump replacement has no language-toggle equivalent, so a visitor who has scrolled even slightly into a case study on desktop cannot reach the language toggle at all: it is `opacity: 0` (invisible) and `pointer-events: none` (a click literally does nothing). This is confirmed directly in the case study markup — the toggle is present and correct in the initial DOM but sits inside the element governed by this rule.

Additionally, because `opacity: 0` (not `display: none` or `visibility: hidden`) is used, the two toggle segments (and the Work/About/CTA links) remain in the tab order while invisible — a keyboard user tabbing through the page in case-mode will focus an invisible control with no visible focus indicator.

**Why it violates CLAUDE.md:**
- Functionally, this exactly reproduces "I clicked the toggle and it doesn't work" for anyone testing on a case-study page after scrolling — a very likely thing for Andrew to have done while reviewing case studies.
- The tab-order/invisible-focus behavior fails **WCAG 2.1 AA** (2.4.7 Focus Visible / 2.4.3 Focus Order — a focusable control with no visible indicator when focused). Per CLAUDE.md's "Accessible by default" principle and the QA charter's explicit instruction to check focus-visible on every interactive element, this is a real accessibility defect, not just a UX nice-to-have.

**Severity: this fails WCAG (keyboard-focus-on-invisible-element) and functionally breaks the toggle on 4 pages at desktop widths post-scroll — flagging as a class that should be escalated to Andrew**, even though the crossfade behavior itself for Work/About/CTA appears to be a pre-existing, intentional design (not introduced by this change). The language toggle simply inherited it without anyone deciding it should apply to a control that has no in-page equivalent.

**Suggested fix direction (for the Full-Stack Developer):** Either give the language toggle its own always-visible slot outside `.nav-links-default`/`.nav-links-sections` (so it's unaffected by case-mode), or add it into `.nav-links-sections` so it crossfades in alongside the section links instead of disappearing, and add `tabindex="-1"` (toggled via JS alongside the `case-mode` class) to the hidden segment's controls so keyboard focus can't land on invisible elements.

## Not a bug, confirmed working correctly
- Mobile nav (`#nav-mobile`) toggle: unaffected by case-mode (it's a separate DOM subtree only shown via the hamburger overlay), and both the close-on-click and `localStorage` listeners attach to the same anchors without conflict.
- All `enHref`/`zhHref`/`TRANSLATED_PATHS` routing math, in both directions, on both `portfolio` and `services` variants, in both dev and build output.
- `Astro.currentLocale` resolution timing — no dev/build discrepancy found.

## Summary for routing
- **Full-Stack Developer**: two distinct, real defects to fix — (1) `src/pages/index.astro` + `src/pages/ch/index.astro` homepage split-gate redirect loop (blocks ship), and (2) `src/components/nav.astro` case-mode crossfade swallowing the language toggle on case-study pages at desktop widths, with an invisible-but-focusable side effect that fails WCAG (recommend escalating this one to Andrew before treating it as routine).
- No Designer or SEO changes indicated by this investigation — the underlying token/typography usage in the toggle markup itself was clean (uses `var(--ease)`, tokens for color/spacing, no hardcoded hex, no inline styles).
