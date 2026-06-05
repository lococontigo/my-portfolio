# CLAUDE.md — Andrew Yip Portfolio

## Project identity
Personal portfolio for **Andrew Yip** — UX/UI designer + developer.
Central concept: **Duality** — HK Night (dark mode) and CA Stone (light mode).
Two cities, one cohesive design system.

## Stack
| Layer | Tool |
|---|---|
| Framework | Astro (TypeScript) |
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
    work/*.html        ← static case study pages
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

## CSS conventions
- **No inline styles** except truly one-off dynamic values (e.g. a swatch's background color)
- Class naming: BEM-lite — `.block-element` (e.g. `.work-card-title`, `.nav-link`)
- All component styles live in the relevant `.astro` file's `<style>` block or in `src/styles/`
- 0.5px borders are intentional — keeps the aesthetic hairline-thin

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
