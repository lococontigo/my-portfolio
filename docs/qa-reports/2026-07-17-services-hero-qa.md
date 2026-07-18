# QA Report — /services hero (fluid WebGL background)

**Date:** 2026-07-17
**Reviewer:** QA Engineer
**Scope:** `src/components/hero-fluid-bg.astro`, `src/pages/services.astro`, `src/styles/services.css`, new `--text-on-accent` token in `src/styles/tokens.css`, `docs/design-decisions.md`. Local-only, not linked from nav, `world="light"` only. Checked: WCAG 2.1 AA contrast, focus-visible, prefers-reduced-motion bailout, hardcoded hex/inline styles, theme forcing, four-layer section structure. `npm run build` passed (9 pages, no errors); dev-server DevTools emulation of reduced-motion was not available in this environment (no browser-automation tool), so that check is code-review-only — flagged below where relevant.

---

## Finding 1 — BLOCKS SHIP: hero text has no guaranteed contrast against the animated WebGL canvas
**Where:** `src/components/hero-fluid-bg.astro` (displayShader, splat/intro logic), `src/styles/services.css` `.hero-headline` / `.hero-body`
**Severity: blocks ship (WCAG risk)**

The hero text (`.hero-headline` = `var(--text-1)`, `.hero-body` = `var(--text-2)`) is painted directly over the fluid-sim `<canvas>` with no scrim, gradient, or backdrop behind it (unlike `--text-on-image` usages elsewhere, which pair with `--scrim`/`--overlay-dark`). At rest the canvas's "stone" base color (`vec3(0.961,0.953,0.933)`) is a close match to `--bg` (`#F5F3EE` light), so static contrast computes fine:
- `--text-1` on `--bg`: ≈15.4:1 (passes easily)
- `--text-2` on `--bg`: ≈5.0:1 (passes AA 4.5:1, but only by a thin margin)

However, the canvas is **not static**: an automatic "intro" sequence (`stepIntro`, no user input required, plays for ~3.2s on load, centered at `cx=0.5, cy=0.52` in canvas space) and subsequent user click-drag splats (`splatDye`) push the rendered color from the light "stone" ramp toward a dark ink ramp (`iHigh = vec3(0.043, 0.216, 0.169)`, near-black-green) in whatever region the density lands, and existing dye is further redistributed by velocity from ordinary (non-click) mouse movement via advection. There is no code that keeps density/darkening out from under the text region, no minimum-contrast guard, and no reduced-motion-style "freeze at rest state" fallback for users who don't trigger the intro differently. Given `--text-2`'s baseline margin above the 4.5:1 minimum is thin, any local darkening (or, depending on hue, lightening) under the text at the moment a visitor looks at the page could plausibly drop below AA.

This is inherently harder to guarantee than text over a flat token color, and nothing in the current implementation bounds it. Recommend one of: a scrim/gradient (`--scrim`/`--overlay-dark`) behind `.hero-header`, constraining the sim's interactive/intro region away from the text column, or clamping `uExposure`/density under the text area — Full-Stack Developer's call on mechanism, but some guarantee is needed before this ships live.

**Escalation:** per your instructions, flagging this explicitly as WCAG-risk/world-breaking class — recommend it goes to Andrew before being treated as routine cleanup, since it's a design-approach question (does the fluid bg need a contrast guarantee mechanism at all), not just a token swap.

---

## Finding 2 — BLOCKS SHIP: range sliders have zero visible focus indicator
**Where:** `src/components/hero-fluid-bg.astro`, `<style>` block, `.hero-fluid-row input[type='range']` (around line 195)
**Severity: blocks ship (WCAG 2.4.7 Focus Visible failure)**

```css
.hero-fluid-row input[type='range'] {
  ...
  outline: none;
  cursor:  pointer;
}
```

This explicitly removes the sitewide `:focus-visible` outline (`src/styles/global.css:56`, `outline: 2px solid var(--accent)`) from all four debug-panel sliders (Glow/Rise/Swirl/Linger), and no replacement `:focus-visible` rule is defined for the input or its `::-webkit-slider-thumb` / `::-moz-range-thumb`. A keyboard user tabbing through the panel gets no visible indication of which slider is focused. This is a real, concrete AA failure for CLAUDE.md's "visible focus-visible on every interactive element" rule.

Note: the toggle button, the Clear button, and the CTA link (`.hero-cta`, via `.btn`) do **not** have this problem — they don't set `outline: none`, so they correctly inherit the global `:focus-visible` rule (and the toggle/Clear button additionally layer a custom color/opacity change on top). Only the range inputs are broken.

**Escalation:** flagging as WCAG failure per your instructions — Full-Stack Developer should add a `:focus-visible` style to the range input/thumb (e.g. an outline or a stronger border/box-shadow on the thumb) before this ships.

---

## Finding 3 — Minor: `docs/design-decisions.md` is stale re: `.btn-primary` color token
**Where:** `docs/design-decisions.md` §2 "Follow-up" paragraph vs. `src/styles/services.css` line 187
**Severity: minor (doc/code drift, not a live bug)**

The doc's "Follow-up" note says `.btn-primary` in `services.css` "still needs `color: #111110;` swapped for `color: var(--text-on-accent);`" and asks the PM to route that to the Full-Stack Developer. The actual `services.css` already reads `color: var(--text-on-accent);` — the fix has been applied, but the doc wasn't updated to reflect it. Recommend whoever owns `design-decisions.md` (Designer, per its own header) strike the stale follow-up so it doesn't get re-routed as an open task. Verified via computed contrast: `--text-on-accent` (`#111110`) on light-theme `--accent` (`#1D9E75`) ≈ 5.6:1 — passes AA. No action needed on the CSS itself.

---

## Finding 4 — Minor: undocumented hardcoded color literal in `smokeColor()`, not covered by design-decisions.md
**Where:** `src/components/hero-fluid-bg.astro`, `smokeColor()` function (~line 847)
**Severity: minor (code-quality/documentation gap, not a visible bug)**

```js
function smokeColor(intensity, v = 0) {
  const j = 0.85 + Math.random() * 0.3;
  return {
    r: 0.937 * intensity * j,
    g: (0.624 - v * 0.14) * intensity * j,
    b: (0.153 - v * 0.05) * intensity * j,
  };
}
```

`0.937, 0.624, 0.153` normalizes to `#EF9F27` — the **dark-theme (HK Night) amber accent**, not the light-theme teal used everywhere else in this shader (`iMid` in `displayShader` is correctly the light-theme teal). Functionally this doesn't produce an amber-looking canvas, because `displayShader` derives its displayed hue purely from `density = max(dye.r, dye.g, dye.b)` mapped through the `iLow`/`iMid`/`iHigh` ramp — the raw RGB weights fed into the dye buffer only affect density magnitude, not final hue. So there's no visible color bug. But it is a leftover/hardcoded literal not logged in `docs/design-decisions.md` alongside the other documented shader-literal exception (`iMid` et al.), and it's confusing for whoever next touches this file (looks like the "amber branch" removal mentioned in the script's own top comment wasn't fully completed). Recommend either logging it in `design-decisions.md` under the same rationale as the `iMid` entry, or simplifying it to reference normalized teal values for clarity. Not blocking.

---

## Finding 5 — Minor: JS toggles inline `element.style.display` instead of a CSS class
**Where:** `src/components/hero-fluid-bg.astro` script, `showStaticFallback()` and the `prefersReduced` early-bailout branch (~lines 311-335)
**Severity: minor (convention nit)**

```js
if (canvas) canvas.style.display = 'none';
if (toggle) toggle.style.display = 'none';
if (panel) panel.style.display = 'none';
```

This sets inline styles at runtime rather than toggling a class (the codebase already has a precedent for the latter — `.hero-fluid-panel.is-open`). CLAUDE.md's "no inline styles, only genuinely dynamic one-off values" is aimed mostly at markup `style=` attributes rather than JS `.style` assignment, and there's no static `style=` attribute in the markup (confirmed via grep — none found in either file), so this isn't a hard violation. But for consistency with the rest of the codebase's show/hide pattern, recommend a `.is-hidden { display: none; }` class toggled via `classList.add` instead. Not blocking.

---

## Finding 6 — Confirm scope: `.intro-location-label` contrast failure is pre-existing, not new
**Where:** `src/styles/services.css` `.intro-location-label` (ported "verbatim from `src/styles/index.css:35-71`" per the file's own comment); same pattern confirmed present in `src/styles/index.css`.
**Severity: blocks ship (WCAG failure) — but flagging as sitewide, not scoped to this task**

Computed contrast, light theme (`data-theme="light"`):
- `--accent` (`#1D9E75`) text on `--bg` (`#F5F3EE`): **≈3.05:1**
- `--accent` text against the actual `.intro-location` pill background (`--accent-dim` tint over `--bg`): **≈2.76:1**

Both fail WCAG AA for normal-size text (11px `.intro-location-label` is well under the "large text" threshold, so the required minimum is 4.5:1, not 3:1). Since this component is copied verbatim from the existing homepage `index.css`, this is **not a new regression introduced by the `/services` build** — it appears to be a pre-existing sitewide contrast issue on the light theme (CA Stone) "Vancouver · Canada" location pill, wherever that component is used (at minimum `index.astro` and now `services.astro`).

**Escalation:** flagging as a WCAG failure per your instructions since it fails AA outright, but noting it's a pre-existing issue that likely needs to be fixed at the token/component level (Designer), not specific to this task's three files. Recommend Andrew be made aware since it affects the homepage as shipped today, not just an unreleased page.

---

## Items checked with no findings (pass)

- **prefers-reduced-motion bailout (item 3):** `hero-fluid-bg.astro`'s script checks `window.matchMedia('(prefers-reduced-motion: reduce)').matches` first, before any `getContext('webgl'...)` call or `requestAnimationFrame` start, and `return`s immediately (hiding canvas/toggle/panel via style). Confirmed via code read — no WebGL context is created and no RAF loop starts when reduced motion is on. This is a correct, full bailout, not just skipping an intro tween. (Could not additionally verify live via DevTools emulation in this environment — no browser-automation tool available — but the code path is unambiguous.)
- **No hardcoded hex/inline styles outside sanctioned exceptions (item 4):** grepped all three new files for `#[0-9a-fA-F]{3,8}` and `style=` — zero matches outside the sanctioned GLSL shader literals (see Finding 4 for one undocumented-but-harmless literal) and the new `--text-on-accent` token itself living correctly in `tokens.css`.
- **Easing (bonus check):** grepped `services.css` and `hero-fluid-bg.astro` for `ease-in-out`, `linear`, raw `cubic-bezier` — none found; all transitions use `var(--ease)`/`var(--ease-in)`.
- **Theme forced per-page, no `data-world` (item 5):** `base-layout.astro` sets `<html data-theme={world}>` fresh on every page load from the `world` prop (no localStorage/theme-persistence code found anywhere in `src`), and `services.astro` explicitly passes `world="light"`. Grepped the whole `src/` tree for `data-world` — zero matches. Theme is driven only by `data-theme`, as required.
- **Four-layer section structure (item 6):** `services.astro`'s hero section is `<section class="hero-section"><HeroFluidBg /><div class="padding-global"><div class="container-main"><div class="hero-content">...</div></div></div></section>`. `HeroFluidBg` renders `display: contents` so its canvas/toggle/panel become direct absolutely-positioned children of `.hero-section` rather than participating in the box tree — the required four-layer nesting for actual content is intact and unbroken by the canvas sibling, consistent with the documented layering approach.
- **`npm run build`:** succeeded, 9 static pages generated including `/services/index.html`, no errors or warnings surfaced.

---

## Summary for PM routing

- **Full-Stack Developer:** Finding 1 (hero text vs. animated canvas contrast — recommend Andrew weigh in on approach) and Finding 2 (range slider focus-visible, straightforward fix) are both WCAG-class and should go back before this ships live. Finding 4 and 5 are minor/optional cleanup.
- **Designer:** Finding 3 (stale doc note in `design-decisions.md`) and Finding 6 (pre-existing `.intro-location-label` contrast failure, sitewide — likely needs a token-level fix, e.g. a darker/higher-contrast accent-on-light variant for small text use).
- **Andrew:** recommend escalating Finding 1 and Finding 6 explicitly, per your standing rule for WCAG-failure-class findings — Finding 1 because it's a design-approach question (not just a swap-a-token fix) and Finding 6 because it already affects the live homepage today, not just this unreleased page.
