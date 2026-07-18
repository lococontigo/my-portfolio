# CLAUDE.md — Andrew Yip Portfolio

## Project identity
Personal portfolio for **Andrew Yip** — UX/UI designer + developer.

### Design concept: Duality
The portfolio has two visual worlds that physically represent Andrew's biography:

| World | Theme | City | Palette |
|---|---|---|---|
| **HK Night** | `data-theme="dark"` | Hong Kong | Deep blacks, amber neon, purple accent |
| **CA Stone** | `data-theme="light"` | California | Warm stone, teal accent, soft shadows |

These aren't just light/dark modes — they are distinct emotional environments that together tell the story of two cities shaping one designer. Every design decision should reinforce this duality.

## Design principles
Apply these alongside the Duality concept on every design decision:

- **Outcome-driven** — every section should move the visitor toward a goal: understanding Andrew's story, exploring a case study, or making contact. Cut anything that doesn't serve one of these.
- **Anticipatory** — surface the next likely action before it's asked for (sticky nav CTA, "Open for New Opportunity" status on the timeline, related links at the end of case studies).
- **Trust by transparency** — real names, roles, and links only (testimonials, LinkedIn, email). No placeholder content in shipped pages.
- **Micro-interactions, macro impact** — hover/focus states (neon glow, tag highlights, dot-ping) should feel deliberate and reinforce each world's personality — HK Night = electric/neon, CA Stone = soft/warm.
- **Motion with intent** — animation communicates state or hierarchy (active, current, loading), never decoration for its own sake. Always `var(--ease)` / `var(--ease-in)` per the easing rules below.
- **Accessible by default** — every interactive element needs a visible focus state, sufficient contrast in both themes, and descriptive alt/aria text.
- **Consistent across breakpoints** — the duality and interaction language must read the same on mobile, tablet, and desktop — only density and layout change.

## Stack
| Layer | Tool |
|---|---|
| Framework | Astro |
| Styling | CSS custom properties — no Tailwind, no CSS-in-JS |
| Animation | GSAP 3 + ScrollTrigger |
| Fonts | Cormorant Garamond · DM Sans · JetBrains Mono (Google Fonts) |
| Deployment | TBD |

## Dev commands
```
npm run dev      # start dev server
npm run build    # production build
npm run preview  # preview build output
```

**Dev server hygiene:** when you start `npm run dev` for verification, stop it afterward using a scoped method — kill only the specific process/PID you started. **Never run a blanket process-kill command** like `taskkill /F /IM node.exe` (Windows) or `pkill node` — these kill *every* node process on the machine, not just your dev server, and can silently terminate unrelated work (other projects, editor tooling, etc.) the user has running. If you can't cleanly target just your own process, it's safer to leave the dev server running in the background than to risk killing something else.

## File structure
```
src/
  styles/
    tokens.css       ← single source of truth for all design tokens
    typography.css   ← type classes (.t-display, .t-body, etc.)
    global.css       ← resets + imports tokens/typography/animations
    animations.css   ← keyframes + utility animation classes
  layouts/
    base-layout.astro  ← wraps every page; sets data-theme on <html>
  components/
    nav.astro
  pages/
    index.astro        ← loads in HK Night (world="dark")
    about.astro
    work/*.astro       ← case study pages (world="light")
  scripts/
    gsap.js
public/
  scripts/gsap.js
```

## Design system rules

### Theming
- Theme is set via `data-theme="dark"` or `data-theme="light"` on `<html>`
- Passed as the `world` prop on `<BaseLayout>` — defaults to `"dark"`
- **Never use** `data-world` (old attribute, replaced)

### Tokens — never hardcode values
Always use CSS custom properties. All defined in `src/styles/tokens.css`.

**Colors**
```
--bg / --bg-2 / --bg-3 / --surface
--border / --border-2
--text-1 / --text-2 / --text-3
--accent        amber #EF9F27 (dark) · teal #1D9E75 (light)
--accent-dim    rgba version of accent at low opacity
--accent-2      Scorpio purple #534AB7 — same in both themes
--accent-2-dim
--danger        #D4537E (dark) · #C0384F (light)
--success       #1D9E75
```

**Neon glow** (use on hover/focus states)
```
--neon-sm / --neon-md / --neon-lg   amber glow (dark) · soft drop shadow (light)
--neon-purple / --neon-pink / --neon-teal
```

**Border radius**
```
--r-sm: 3px   --r-md: 6px   --r-lg: 12px   --r-pill: 999px
```

**Spacing scale** (base 8px)
```
--space-xs: 8px   --space-sm: 16px   --space-md: 32px
--space-lg: 64px  --space-xl: 128px  --space-2xl: 240px
```

**Easing — use exclusively `var(--ease)` on every transition**
```
--ease:    cubic-bezier(0.16, 1, 0.3, 1)   ← sharp ease-out, signature of the system
--ease-in: cubic-bezier(0.55, 0, 1, 0.45)
```
Never use `ease-in-out` or `linear` for UI transitions.

## Typography
Font families are CSS vars: `var(--font-display)` · `var(--font-body)` · `var(--font-mono)`

| Class | Font | Size | Weight | Use |
|---|---|---|---|---|
| `.t-display` | Cormorant Garamond | 47px | 300 | Hero headlines |
| `.t-heading-1` / `.t-h1` | Cormorant Garamond | 36px | 400 | Section titles |
| `.t-heading-2` / `.t-h2` | Cormorant Garamond | 27px | 400 | Subsections |
| `.t-label` | DM Sans | 11px | 500 | Nav, tags, UI copy |
| `.t-body` | DM Sans | 15px | 300 | Prose |
| `.t-micro` | DM Sans | 8px | 400 | Dates, category labels |
| `.t-mono` | JetBrains Mono | 11px | 400 | Code, tokens |

- `.t-display em` and `.t-heading-*` italic spans should use `color: var(--accent)`
- Body base: 15px / weight 300 / line-height 1.6

## Layout & responsiveness
- Max viewport width: **1440px** (`--max-w: 1440px`) unless explicitly specified otherwise
- Default horizontal gutter: `--gutter: 48px`
- All layouts must be fully responsive — mobile-first, no fixed widths on content containers
- Use `clamp()` for fluid type/spacing where scale matters across breakpoints
- Common breakpoints: 520px (mobile) · 768px (tablet) · 1024px (desktop)

## Section structure
Every section on every page must follow this four-layer structure — no exceptions:

```html
<section>
  <div class="padding-global">
    <div class="container-main">
      <div class="[section]-content">
        <!-- section content here -->
      </div>
    </div>
  </div>
</section>
```

| Layer | Type | Purpose |
|---|---|---|
| `<section>` | HTML tag | Semantic grouping |
| `.padding-global` | `div` | Horizontal gutter (48px → 24px → 16px across breakpoints) |
| `.container-main` | `div` | Max-width 1440px, centered via `margin-inline: auto` |
| content `div` | `div` | Section-specific layout — name it after the section (e.g. `.hero`, `.work-grid`) |

Both `.padding-global` and `.container-main` are global utilities defined in `src/styles/global.css`.
The content div's styles live in the component's scoped `<style>` block.

**Section spacing** — defined globally in `src/styles/global.css`, do not override per section:
```
desktop  →  padding-block: 128px  (--space-xl)
tablet   →  padding-block: 64px   (--space-lg)
mobile   →  padding-block: 32px   (--space-md)
```

- Page `<main>` needs `padding-top: 96px` (80px tablet · 72px mobile) to clear the fixed nav

## Content spacing
These values apply inside case study pages (`work/*.astro`). Use `clamp()` or breakpoint overrides to scale down on tablet/mobile as noted.

| Relationship | Desktop | Tablet | Mobile |
|---|---|---|---|
| Section → section | `128px` | `80px` | `40px` |
| Section title → section content (e.g. "01 Overview" → body) | `80px` | `48px` | `32px` |
| Title → image | `40px` | `28px` | `20px` |
| Title → body text | `24px` | `24px` | `16px` |
| Grid gap | `24px` | `24px` | `12px` |
| Subtitle → body text | `8px` | `8px` | `8px` |

Section → section spacing is handled globally via `padding-block` on `<section>` in `global.css` — do not override it per section.

**Implementation pattern** — prefer `clamp()` for fluid scaling:
```css
.section-title   { margin-bottom: clamp(32px, 5.5vw, 80px); } /* section title → content */
.title-to-image  { margin-bottom: clamp(20px, 2.8vw, 40px); } /* title → image */
.title-to-body   { margin-bottom: clamp(16px, 1.7vw, 24px); } /* title → body */
.grid            { gap: clamp(12px, 1.7vw, 24px); }           /* grid gap */
.subtitle        { margin-bottom: 8px; }                       /* subtitle → body (fixed) */
```

## CSS conventions
- **No inline styles** except truly one-off dynamic values (e.g. a swatch's background color)
- Class naming: BEM-lite — `.block-element` (e.g. `.work-card-title`, `.nav-link`)
- All component styles live in the relevant `.astro` file's `<style>` block or in `src/styles/`
- 0.5px borders are intentional — keeps the aesthetic hairline-thin

## SEO & performance
- **Keep `public/llms.txt` in sync** — whenever a page, section, or piece of content is majorly edited, added, replaced, or removed, update `public/llms.txt` in the same change so AI crawlers never see stale guidance
- Add JSON-LD schema markup on every page (at minimum `Person` on index, `WebPage` on all others)
- `<title>` format: `Page Name · Andrew YIP`
- Every `<img>` must have a descriptive `alt` attribute
- Use `loading="lazy"` on below-the-fold images; hero images get `fetchpriority="high"`
- Prefer `font-display: swap` (already set via Google Fonts `display=swap`)
- No render-blocking resources — CSS via frontmatter import, scripts deferred or `is:inline`
- Target Core Web Vitals: LCP < 2.5s, CLS = 0, INP < 200ms

## Before every task
Before writing any code, explain your plan step by step and wait for confirmation.
Only proceed once the plan is approved.

## Hard constraints — never break these
| Rule | Detail |
|---|---|
| No npm packages | Ask before installing anything new |
| No token edits | Never change hex values in `tokens.css` |
| No `<link>` for CSS | Always use frontmatter `import '../styles/...'` |
| No JS in `src/scripts/` | Always `public/scripts/` + `<script is:inline>` |
| No `ease-in-out` | Always `var(--ease)` or `var(--ease-in)` |
| No inline styles | Always CSS classes; only exception: truly dynamic one-off values |
| TypeScript in scripts | See note below — type annotations/generics are allowed inside `.astro` `<script>` blocks; no separate `.ts` files or TS-only npm packages |
| No Tailwind | CSS custom properties from `tokens.css` only |

**Note on TypeScript in scripts (updated 2026-07-17):** the original "no TypeScript" wording didn't match established practice — `case-study-compare-slider.astro` and `case-study-video.astro` already ship with real TS syntax in their `<script>` blocks (type annotations like `next: number`, generics like `querySelectorAll<HTMLElement>`, non-null assertions like `knob!`), and Astro/Vite transpiles this at build time with no extra tooling. Going forward: type annotations, generics, and non-null assertions are fine inside a component's inline `<script>` block, since the strict `tsconfig.json` (`astro/tsconfigs/strict`) will otherwise flag implicit-`any` errors on untyped function parameters anyway. Still off-limits: a separate `.ts`/`.tsx` file, shared `interface`/`type` declarations imported across files, or any TS-specific npm package — this project stays plain Astro components with locally-scoped script logic, just no longer fighting the type checker with JSDoc workarounds.

## CSS/styling tasks — additional rule
Use only CSS custom properties from `tokens.css`. **Never hardcode** a hex value, a `px` size, or a font name directly in CSS. Always reference a token (`var(--accent)`, `var(--space-md)`, `var(--font-body)`).

## Component tasks — additional rule
Every component must work correctly in both worlds using only CSS variables — no theme-specific class forks. The theme switch (`data-theme="dark"` / `data-theme="light"` on `<html>`) should be the only thing that changes the appearance.

## 10. GSAP animation rules
GSAP 3 + ScrollTrigger are loaded once, globally, in `base-layout.astro` via CDN `<script is:inline>` tags, followed by `public/scripts/gsap.js`. Never add a second GSAP `<script>` include on an individual page.

- **Every scroll-driven or ambient animation function must bail out first** if the visitor prefers reduced motion:
  ```js
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  ```
  This is non-negotiable — every `init*` function in `gsap.js` starts with this guard.
- **Bind behavior with `data-*` attributes, not classes.** Existing hooks: `data-reveal`, `data-marquee` (+ `data-marquee-track`, `data-marquee-reverse`), `data-parallax`, `data-stagger-reveal` (+ `data-stagger-child`). Add new animations the same way — a data attribute the component opts into, read by a dedicated `init*()` function in `gsap.js`.
- **Easing split by animation type:**
  - Scroll-scrubbed tweens (`scrollTrigger: { scrub: true }`) use `ease: 'none'` — the scrollbar itself is the easing curve.
  - Discrete reveal/counter tweens (triggered once on entry) use `ease: 'power4.out'`.
  - This GSAP `ease` option is separate from the CSS `var(--ease)` rule above — `var(--ease)` governs CSS `transition`, GSAP tweens use GSAP's own eases.
- **Recompute on load, not just DOMContentLoaded**: lazy/late-decoding images can shift layout after `DOMContentLoaded`, so `window.addEventListener('load', () => ScrollTrigger.refresh())` runs once at the end of `gsap.js`. Any new animation whose measurements depend on image dimensions should set `invalidateOnRefresh: true` on its `scrollTrigger`.
- All animation logic lives in `public/scripts/gsap.js` (per the hard constraint: no JS in `src/scripts/`, always `public/scripts/` + `is:inline`). New animation functions get added to the `initX()` list and registered in the `DOMContentLoaded` listener at the bottom of the file.

## 11. Neon-sign button color exception
The `.btn-sign` / `.btn-sign-teal` buttons (see `src/styles/andrew-ui-kit.html`, "03 · Buttons") are the **one sanctioned exception** to "never hardcode a hex/rgba value in CSS."

- Base state (background, text color, border, radius) still uses tokens as normal: `var(--accent)`, `var(--success)`, `var(--bg)`, `var(--r-sm)`.
- The **hover glow** (`text-shadow` and part of `box-shadow`) hand-tunes raw `rgba()`/hex values layered on top of the token-based glow (`var(--neon-lg)`, `var(--neon-teal)`) — e.g. `text-shadow: 0 0 8px var(--accent), 0 0 18px rgba(239,159,39,0.6)`. These specific glow-intensity values are calibrated by eye to sell the "backlit Hong Kong neon sign" effect and are exempt from the token-only rule.
- This exception is scoped **only** to the neon-sign button hover glow. Every other component — including all other buttons in `.btn`, `.btn-primary`, `.btn-ghost`, etc. — must still use tokens exclusively with no exceptions.
- Do not extend this exception to new components without updating this section first.

## How to maintain this file
Whenever a prompt or instruction is significant and reusable across sessions, add it here.
This keeps Claude's context current without repeating rules every conversation.

## Validation rules

After every component or style change:
- Check localhost:4321 renders without console errors
- Confirm no hex values exist outside tokens.css (search: #[0-9a-fA-F])
- Confirm no inline styles were added (search: style=")
- Confirm all transitions use var(--ease), not a raw cubic-bezier

Before committing:
- Run npm run build — if it fails, fix before committing

## Git workflow
After every meaningful change:
1. Stage the relevant files (`git add <files>` — never `git add .` blindly)
2. Commit locally with a clean message
3. Push to `origin main`

**Commit message rules**
- Imperative mood, no trailing period, ≤72 chars subject line
- Body line (optional): explain *why*, not *what*
- Examples: `Add hero section to index page` · `Fix neon glow on nav CTA hover`

**Push**
- Remote: `https://github.com/lococontigo/my-portfolio.git`
- Branch: `main`
- Always push after committing — keep remote in sync with local
