# Full-site QA audit — 2026-07-24

QA Engineer review pass across all 26 pages (EN + `/ch/` mirror), all 23 components,
all 8 stylesheets, and `public/scripts/gsap.js`. Triggered by the PM ahead of a
broad body of uncommitted work landing without a formal QA pass.

Structured by severity. Each finding names the specialist it routes to
(Designer = tokens/system, Full-Stack = component/animation/structure,
SEO = metadata-adjacent).

---

## Build health

`npm run build` succeeds — 25 pages built cleanly, including the full `/ch/`
mirror, `/services/*` routes, and new `src/i18n/` + `case-studies-zh.js`. No
broken imports. No blocking build errors.

---

## BLOCKS SHIP

### B1. Inactive language-toggle link fails WCAG 2.1 AA contrast in BOTH themes — Designer / Full-Stack
- **Where:** `src/components/nav.astro:316` — `.nav-lang-option { color: var(--text-3); }` (also applies to the mobile toggle, lines 450–461, same class).
- **What:** The inactive segment of the EN/中文 switch is a real navigation link and is rendered at 11px in `--text-3`.
  - Dark theme: `--text-3` `#5F5E5A` on `--bg` `#111110` ≈ **2.9:1**.
  - Light theme: `--text-3` `#A8A49C` on `--bg` `#F5F3EE` ≈ **2.2:1**.
  - AA requires 4.5:1 for normal-size text. Fails in both worlds.
- **Why it violates CLAUDE.md:** "Accessible by default — sufficient contrast in both themes" and the standing WCAG 2.1 AA requirement. This is an interactive control the visitor must read to switch languages, not decorative micro-copy, so the placeholder/disabled exemptions do not apply.
- **Note:** It resolves to `--text-1` on `:hover`, but the resting (and keyboard-focus-before-hover) state is what fails. Fix likely belongs to Designer (choose a token that clears 4.5:1 for the resting state, e.g. `--text-2`) rather than a per-component override.
- **Severity: Blocks ship — WCAG AA failure on an interactive element. Per escalation rules this should go to Andrew before it's treated as routine cleanup.**

### B2. `--text-3` as body/essential text is a systemic contrast risk — Designer
- **Where:** token `--text-3` (`tokens.css:15` dark / `:59` light), used anywhere for readable copy (dates, category micro-labels, `.t-micro`, inactive states).
- **What:** As computed in B1, `--text-3` clears neither 4.5:1 (normal) nor 3:1 (large) against `--bg` in either theme (~2.9:1 dark, ~2.2:1 light). Any *essential* text using it fails AA.
- **Why:** Same CLAUDE.md accessibility rule. This is flagged separately from B1 because B1 is one confirmed interactive instance; this is the broader token-usage risk that the Designer should audit (placeholder text and truly decorative labels are exempt; anything a visitor needs to read is not).
- **Severity: Blocks ship for any instance carrying essential text.** Designer to confirm which usages are decorative-only vs. essential; escalate the essential ones.

---

## MINOR / CLEANUP

### M1. Hardcoded `#fff` in `::selection` — Designer
- **Where:** `src/styles/global.css:63` — `::selection { color: #fff; }`.
- **Why:** CLAUDE.md "never hardcode a hex value outside `tokens.css`." Not one of the two sanctioned exceptions. Also a mild contrast note: white on amber `--accent` selection highlight in dark theme is low-contrast, though selection styling is not held strictly to AA.
- **Severity: Minor.** Route to a token (e.g. `--text-on-accent` or `--bg`).

### M2. Hardcoded `#fff` in the 404 page — Full-Stack
- **Where:** `src/pages/404.astro:52` — `color: #fff;`.
- **Why:** Same token rule. Should reference a text token.
- **Severity: Minor.**

### M3. Hardcoded `#000` media-frame background (EN + ch) — Full-Stack
- **Where:** `src/pages/work/yocale.astro:740` and `src/pages/ch/work/yocale.astro:745` — `.landing-gif-wrap { background: #000; }`.
- **Why:** Hardcoded hex outside `tokens.css`, not a sanctioned exception. It's a deliberate black "mat" behind the landing-page GIF, but there's no token for pure black (`--bg` dark is `#111110`), so it's a raw value. No text sits on it, so no contrast impact — this is purely the token-rule violation.
- **Severity: Minor.** Designer + Full-Stack to decide whether to add a token or accept as a documented one-off.

### M4. `section` desktop spacing is a raw `80px` and contradicts CLAUDE.md — Designer
- **Where:** `src/styles/global.css:87` — `section { padding-block: 80px; }` (tablet/mobile below it correctly use `--space-lg` / `--space-md`).
- **Why:** Two issues: (a) `80px` is a raw px literal, not a token (CLAUDE.md CSS rule: never hardcode a px size, always a token); (b) CLAUDE.md §"Section structure → Section spacing" documents desktop as **128px (`--space-xl`)**. The code (80px) matches neither the token system nor the documented spec.
- **Severity: Minor** (consistency + doc drift, not WCAG/world-break). Designer to reconcile: either restore `--space-xl` or update CLAUDE.md to reflect the intended value — but the raw `80px` shouldn't stay either way.

### M5. Raw `linear` timing keyword in nav + CSS marquee — Full-Stack (+ Designer ruling)
- **Where:**
  - `src/components/nav.astro:220, 239, 246` — `transition: opacity 0.3s var(--ease), visibility 0s linear <delay>`. The `linear` is literal but applies to a **0s-duration** visibility toggle, so it has no visual effect — harmless but technically violates "never use `linear`."
  - `src/components/hero-showcase-gallery.astro:243` — `animation: hero-gift-card-scroll 20s linear infinite`. A continuous constant-velocity marquee legitimately needs `linear` (an eased loop would visibly stutter). This is the CSS equivalent of the sanctioned GSAP `ease: 'none'` for continuous/scrubbed motion.
- **Why:** CLAUDE.md bans `linear` for UI transitions, but the easing rules only explicitly sanction `ease: 'none'` for GSAP, with no CSS equivalent carve-out. Neither instance is a genuine defect.
- **Severity: Minor / advisory.** Recommend the Designer add a one-line carve-out to CLAUDE.md permitting `linear` for (a) 0s-duration visibility toggles and (b) continuous constant-velocity marquees, mirroring the GSAP `ease: 'none'` allowance — rather than forcing a contrived fix. Until then these read as rule violations.

### M6. Raw `cubic-bezier` literal as an inline fallback — Full-Stack
- **Where:** `src/components/hero-showcase-gallery.astro:305` — `track.style.transition = ... 'transform 1s var(--ease, cubic-bezier(0.16,1,0.3,1))'`.
- **Why:** Embeds a raw `cubic-bezier(...)` (duplicating the `--ease` token value) as a fallback. `--ease` is defined globally in `tokens.css` and always available, so the fallback never fires — the literal is dead but present, and the easing rule flags raw `cubic-bezier` outside the token definitions.
- **Severity: Minor.** Drop the fallback (keep just `var(--ease)`), or leave it if the team prefers defensive fallbacks — but it's a literal to be aware of.

---

## VERIFIED CLEAN (checked, no findings)

- **Reduced-motion — gsap.js:** all 8 `init*()` functions (`initImageReveal`, `initGalleryRows`, `initMarquee`, `initParallax`, `initClosingParallax`, `initQuotePanelScroll`, `initStatCounters`, `initStaggerReveal`) begin with the `prefers-reduced-motion: reduce` bail-out guard. Pass.
- **Reduced-motion — hero-showcase-gallery (both systems):**
  - JS setInterval vertical scroll: `if (prefersReduced) return;` (line 317) gates the `transitionend` handler AND the `setInterval` — verified it's placed *before* both, so the loop never starts under reduced motion. Pass.
  - CSS gift-card marquee: the `@keyframes` animation is applied only inside `@media (prefers-reduced-motion: no-preference)` (line 241), so it's fully suppressed under reduce. Pass. Both systems genuinely bail out — not just per the comments.
- **Focus states:** `global.css:56` defines a universal `:focus-visible { outline: 2px solid var(--accent); }` covering every interactive element as a baseline. Component-level enhancements verified on nav lang-toggle, split-gate panels/toggle, and contact form inputs. The `outline: none` instances (`contact*.astro`, `hero-fluid-bg` canvas, `hero-showcase` decorative ring) each either replace the indicator (contact inputs → accent border + neon glow) or are on non-interactive/aria-hidden elements. Pass.
- **`data-world`:** zero occurrences site-wide. Theming is `data-theme`-only, including the nested `data-theme` on the split-gate panels. Pass.
- **Inline `style=`:** 4 instances, all genuinely dynamic one-offs (compare-slider aspect-ratio, deliverable-image passthrough, gif aspect-ratio, tech-stack per-tool `--icon-url`) plus the JS scroll-lock `body.style.overflow` in nav — all permitted. Pass.
- **Sanctioned hex exceptions:** hero-showcase gift-card `#FFEDE9` (line 218, commented, Andrew-instructed) and the neon-sign button glow (§11) — not flagged, as instructed.
- **EN/ch structural parity:** section counts match 1:1 across every pair — about 2/2, contact 1/1, portfolio 5/5, services 6/6, services/about 2/2, services/contact 1/1, services/work 5/5, work delta 1/1, ant 3/3, crowd-ease 5/5, yocale 8/8. Discipline held.
- **Four-layer section structure:** spot-checked services.astro and content pages — `<section> > .padding-global > .container-main > content` pattern intact. (See "not reviewed" for coverage limits.)
- **JSON-LD / metadata:** noted in passing — about.astro carries Person + ItemList/Review schema; index.astro WebPage schema. Looks healthy (not my primary lane; SEO Specialist owns confirmation).

---

## NOT REVIEWED / disclosed gaps

To avoid silently implying full coverage:

1. **Per-component line-by-line reads:** I relied on global greps (hex, inline `style=`, easing keywords, `data-world`) across all `.astro`/`.css` files plus the global `:focus-visible` fallback, rather than reading all 23 components in full. Files fully read: nav, hero-showcase-gallery, tokens.css, global.css, index.astro, gsap.js, and targeted sections of contact/yocale/about. Not fully read line-by-line: footer, work-carousel, testimonials, timeline, tech-stack, service-card, case-study-* family, hero-fluid-bg (beyond the shader color note below). Grep-level checks cover them for the mechanical rules; deeper logic/markup review of these was not done this pass.
2. **Exhaustive contrast matrix:** I computed the `--text-3` failures (B1/B2) and spot-checked `--text-2`/`--text-1` on `--bg` (pass). I did NOT compute every token-on-token pairing (e.g. accent-on-surface, danger-on-bg, brand accents `--accent-delta` `#700C1B` / `--accent-ant` `#FD5001` used as text on light `--bg`) across both themes. The client brand accents in particular warrant a dedicated contrast check if used as foreground text — recommend a follow-up pass.
3. **Four-layer structure on every section of every page:** verified via EN/ch section counts and a services.astro read, not by inspecting the inner content-div layer of all ~40 sections individually.
4. **hero-fluid-bg.astro shader color:** line 669 hardcodes `vec3(0.937, 0.624, 0.153)` (= `#EF9F27`, the dark-theme accent) in GLSL. WebGL shaders can't read CSS custom properties, so this is arguably unavoidable, but it (a) duplicates the accent value outside `tokens.css` and (b) will NOT theme-switch — the fluid background stays amber even in light/CA-Stone. Flagged here as an awareness item for Full-Stack rather than a formal finding; worth a decision on whether the light world should get a teal variant.
5. **Content/copy parity of `case-studies.js` vs `case-studies-zh.js`:** structural page parity was verified; the actual translation completeness/accuracy of the data files was not audited (out of QA's lane — content owner).
6. **No visual/browser render pass:** findings are from static source + build analysis, not screenshots. Layout/visual regressions that only appear at runtime are not covered here.

---

## Routing summary for the PM

- **To Andrew (escalate — WCAG AA, both worlds):** B1 (language-toggle contrast), B2 (`--text-3` essential-text contrast).
- **To Designer:** B1/B2 (token choice), M1 (`#fff` selection), M4 (section spacing / CLAUDE.md drift), M5 ruling (linear carve-out), shader-color decision (gap #4).
- **To Full-Stack Developer:** M2 (404 `#fff`), M3 (yocale `#000` ×2), M5 (nav/marquee `linear`), M6 (cubic-bezier fallback).
- **To SEO Specialist:** nothing blocking spotted; JSON-LD looked healthy in passing (not audited in depth).
