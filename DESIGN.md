# DESIGN.md — Andrew Yip Portfolio

Canonical design-system reference for this repo. Any agent generating UI
should read this file first for **visual/design-system rules**. For
technical/dev conventions (stack, file structure, hard constraints on how
code is written), see `CLAUDE.md` instead — that file is authoritative on
process; this one is authoritative on appearance.

Every value in this file traces back to `src/styles/tokens.css`,
`CLAUDE.md`, `src/styles/andrew-ui-kit.html` (the rendered UI kit doc), or
`brand-guidelines.html` (the rendered brand guide) — all four agree with
each other everywhere they overlap. Two known gaps are called out inline
rather than papered over: the `.t-*` typography classes below are fully
specified in the UI kit but not yet wired into `src/styles/typography.css`
as real global classes (components currently hand-roll matching values
locally), and `CLAUDE.md` documents desktop section spacing as 128px while
`src/styles/global.css` currently ships 80px. Treat the shipped CSS as
ground truth for what renders today; treat `CLAUDE.md`/the UI kit as the
intended target where the two disagree, and flag it rather than silently
picking one.

---

## 1. VISUAL THEME & ATMOSPHERE

**Concept: Duality.** The portfolio has two visual worlds that physically
represent Andrew Yip's biography — a UX/UI designer and developer shaped by
both Hong Kong and Canada. They are not a light/dark mode toggle in the
usual sense; they are two distinct emotional environments that together
tell the story of two cities shaping one designer. As the brand guide puts
it: *"Two cities, one designer. HK Night and CA Stone are not just a dark
and light mode — they're the two environments that shaped the work, used
together across every touchpoint of the business."*

| World | `data-theme` | City | Mood | Density | Orientation |
|---|---|---|---|---|---|
| **HK Night** | `dark` | Hong Kong | Dense, electric, mysterious — neon signage glimpsed through night streets | Tight, layered, information-rich | Vertical — stacked signage, glowing edges, things half-revealed |
| **CA Stone** | `light` | Vancouver / Canada | Open, clean, organized — daylight, warm stone, calm confidence | Airy, generous whitespace | Horizontal — flat planes, soft shadows, things fully visible |

Both worlds share one identity: the same amber-to-teal accent swap
signals "you changed city," while the fixed Scorpio purple (`--accent-2`,
section 2) never changes — it's the constant that proves both worlds
belong to the same person. Every design decision on a `dark`-world page
should read as "night market signage," and every decision on a
`light`-world page should read as "stone courtyard in daylight." Neither
world is a muted or inverted copy of the other — daylight genuinely kills
neon (see section 6), and that physical truth is why the two palettes,
glow systems, and shadow treatments are independently tuned rather than
mechanically inverted.

---

## 2. COLOR PALETTE & ROLES

### HK Night (dark) — `[data-theme="dark"]` (also the `:root` default)

| Semantic Name | Hex | Functional Role |
|---|---|---|
| `--bg` | `#111110` | Page background |
| `--bg-2` | `#1a1a18` | Nav card, component-box backgrounds, one step up from page |
| `--bg-3` | `#222220` | Card thumbnails, hover-state surfaces, two steps up |
| `--surface` | `#242422` | Elevated surface (modals, popovers) |
| `--surface-2` | `#19191C` | Secondary elevated surface |
| `--border` | `#2a2a28` | Default hairline border |
| `--border-2` | `#3a3a38` | Stronger hairline (hover states, dividers that need more contrast) |
| `--text-1` | `#F0EDE6` | Primary text |
| `--text-2` | `#A8A49C` | Secondary text, body copy |
| `--text-3` | `#5F5E5A` | Tertiary text, micro-labels, timestamps |
| `--accent` | `#EF9F27` | Primary accent — Amber. Buttons, links, focus rings, the neon-sign glow |
| `--accent-dim` | `rgba(239,159,39,0.12)` | Accent tint background (hover fills, active tag backgrounds) |
| `--accent-text` | `var(--accent)` | Accent color used specifically for text-on-background (identical to `--accent` in dark) |

### CA Stone (light) — `[data-theme="light"]`

| Semantic Name | Hex | Functional Role |
|---|---|---|
| `--bg` | `#F5F3EE` | Page background |
| `--bg-2` | `#ECEAE4` | Nav card, component-box backgrounds |
| `--bg-3` | `#E4E1DA` | Card thumbnails, hover-state surfaces |
| `--surface` | `#FFFFFF` | Elevated surface — pure white |
| `--surface-2` | `#FCFBFD` | Secondary elevated surface |
| `--border` | `#D8D4CB` | Default hairline border |
| `--border-2` | `#C4BFB5` | Stronger hairline |
| `--text-1` | `#1C1C1A` | Primary text |
| `--text-2` | `#6B6860` | Secondary text, body copy |
| `--text-3` | `#A8A49C` | Tertiary text, micro-labels |
| `--accent` | `#1D9E75` | Primary accent — Teal. Buttons, links, focus rings |
| `--accent-dim` | `rgba(29,158,117,0.10)` | Accent tint background |
| `--accent-text` | `#146A4F` | WCAG-safe darker teal for text specifically — `--accent` itself is too light for reliable text contrast on `--bg` in this theme |

### Fixed constants — identical in both worlds

| Semantic Name | Hex | Functional Role |
|---|---|---|
| `--accent-2` | `#534AB7` | "Scorpio" purple — the bridge accent. Never changes between worlds; used for a secondary CTA, badges, or anywhere the design needs to say "this is Andrew" independent of which world the visitor is in |
| `--accent-2-dim` | `rgba(83,74,183,0.14)` dark · `rgba(83,74,183,0.10)` light | Purple tint background |
| `--danger` | `#D4537E` dark · `#C0384F` light | Errors, destructive actions, NDA/locked-content signals |
| `--success` | `#1D9E75` | Success states, confirmation toasts. Identical hex to CA Stone's `--accent` — not a coincidence, teal *is* both "the light world's identity color" and "the universal success color" |
| `--text-on-accent` | `#111110` | Fixed dark ink for text/icons on an accent-filled surface (e.g. `.btn-primary`). Intentionally the same in both themes — `--text-1`/`--bg` flip per theme and would fail contrast in one theme or the other on top of `--accent` |
| `--text-on-image` | `#F0EDE6` | Text placed over photographic backgrounds |
| `--overlay-dark` | `rgba(0,0,0,0.2)` | Darkening overlay on images |
| `--scrim` | `rgba(17,17,16,0.72)` | Heavier scrim (modal backdrops, video posters) |

Case-study brand accents (`--accent-delta` `#700C1B`, `--accent-ant`
`#FD5001`, `--accent-yocale` a `#F37063`→`#3A7BAE` gradient, plus its
solid variants) exist as a fourth, narrower category — client branding
colors used **only** inside that client's own case study page, never as
general UI accents.

---

## 3. TYPOGRAPHY RULES

### Font families

| Family | CSS var | Role | Why |
|---|---|---|---|
| **Cormorant Garamond** | `--font-display` | Display / headings — carries the *depth* | A serif with real editorial weight and italic character, used wherever the design needs to feel considered rather than efficient — hero headlines, section titles, work-card titles. Its italic is reserved for the accent-colored emphasis word in a headline (`.t-display em`) |
| **DM Sans** | `--font-body` | Body / UI — carries the *structure* | A clean grotesque for everything functional: nav, buttons, labels, body copy, form inputs. Where Cormorant Garamond speaks, DM Sans organizes |
| **JetBrains Mono** | `--font-mono` | Code / tokens | Used sparingly for anything that reads as "system output" — token names, easing curves, technical annotations |

`[lang="zh-Hant"]` swaps `--font-display`→`'Noto Serif TC'` and
`--font-body`→`'Noto Sans TC'` (Cormorant Garamond / DM Sans have no CJK
glyphs), layered on top of whichever `data-theme` is active — locale and
world are independent axes.

### Type hierarchy

Fully specified in `andrew-ui-kit.html`; not yet wired into
`typography.css` as global `.t-*` classes (only `body` base styles live
there today — see the gap note at the top of this file). Treat these as
the target spec regardless.

| Class | Font | Size | Weight | Line-height | Letter-spacing | Usage |
|---|---|---|---|---|---|---|
| `.t-display` | Cormorant Garamond | 47px | 300 | 1 | −0.02em | Hero headlines. `em` inside it is italic + `var(--accent)` |
| `.t-heading-1` / `.t-h1` | Cormorant Garamond | 36px | 400 | 1.1 | −0.01em | Section titles |
| `.t-heading-2` / `.t-h2` | Cormorant Garamond | 27px | 400 | 1.2 | normal | Subsections |
| `.t-label` | DM Sans | 11px | 500 | normal | 0.01em | Nav, tags, UI copy |
| `.t-body` | DM Sans | 15px | 300 | 1.7 | normal | Prose, max-width 540px |
| `.t-micro` | DM Sans | 8px | 400 | normal | 0.12em, uppercase | Dates, category labels |
| `.t-mono` | JetBrains Mono | 11px | 400 | normal | normal | Code, tokens — colored `var(--accent-2)` |

Base `body` (as actually shipped in `typography.css`): DM Sans, 16px /
1.6 / weight 300, color `var(--text-1)`, `background 0.5s var(--ease)` +
`color 0.5s var(--ease)` transition on theme switch. Note the UI kit's own
`body` uses 15px, not 16px — a second small, harmless drift between the
kit and the shipped base style worth reconciling if either changes.

---

## 4. COMPONENT STYLINGS

All hover/focus/active states below are the actual CSS, not just resting
appearance.

### Buttons

| Variant | Resting | Hover | Active |
|---|---|---|---|
| `.btn-primary` | `background: var(--accent)`, text `#111110` (i.e. `--text-on-accent`), no shadow | `box-shadow: var(--neon-md)`, `translateY(-1px)`, letter-spacing 0.02em→0.04em | `translateY(0)`, `box-shadow: var(--neon-sm)` |
| `.btn-ghost` | transparent, text `var(--accent)`, 0.5px border in `--bg` (invisible until hover) | `background: var(--accent-dim)`, `box-shadow: var(--neon-md)`, border → `var(--accent)`, `translateY(-1px)` | — |
| `.btn-ghost-purple` | same pattern, `var(--accent-2)` | `background: var(--accent-2-dim)`, `box-shadow: var(--neon-purple)`, border → `var(--accent-2)` | — |
| `.btn-ghost-danger` | same pattern, `var(--danger)` | `background: rgba(212,83,126,0.08)`, `box-shadow: var(--neon-pink)`, border → `var(--danger)` | — |
| `.btn-muted` | `background: var(--bg-2)`, text `var(--text-2)` | `background: var(--bg-3)`, border → `var(--border-2)`, text → `var(--text-1)`, soft neutral glow (`0 0 6px var(--border-2), 0 0 14px rgba(58,58,56,0.3)`) | — |
| `.btn-text` | transparent, text `var(--text-2)`, no border | text → `var(--accent)`; nested `.arrow` translates `+4px` | — |
| `.btn-icon` | `background: var(--bg-2)`, `var(--text-2)`, padding 10px, `--r-sm` | border → `var(--accent)`, text → `var(--accent)`, `box-shadow: var(--neon-sm)` | — |

Base `.btn`: `padding: 10px 20px`, DM Sans 11px/500, letter-spacing
0.02em, `border-radius: var(--r-sm)`, `transition: all 0.2s var(--ease)`.
Sizes: `.btn-sm` (6px 14px, 11px), `.btn-lg` (14px 32px, 15px).

**The neon-sign button — signature interaction, and the one sanctioned
hardcoded-color exception (CLAUDE.md §11).** `.btn-sign` (amber, HK
side) / `.btn-sign-teal` (teal, CA side): transparent background, 1.5px
border in `--bg` at rest, DM Sans 20px/400, letter-spacing 0.08em. On
hover:
- `text-shadow: 0 0 8px var(--accent), 0 0 18px rgba(239,159,39,0.6)` (or the teal/`#1D9E75` equivalent)
- `box-shadow: var(--neon-lg), inset 0 0 20px rgba(239,159,39,0.05)`
- `border-color` → the accent

Base state still uses tokens as normal (`var(--accent)`, `var(--success)`,
`var(--bg)`, `var(--r-sm)`); only the hover glow hand-tunes raw
`rgba()`/hex on top of the token-based glow, calibrated by eye to sell a
"backlit Hong Kong neon sign" effect. This exception is scoped to this one
component's hover glow — every other button uses tokens exclusively.

### Cards

**`.work-card`** — `background: var(--bg-2)`, 0.5px `var(--border)`,
`--r-md`, `overflow: hidden`, `cursor: pointer`, `transition: all 0.25s
var(--ease)`.
- `.work-card-thumb-inner` (the decorative color block inside the
  thumbnail): rests at `opacity: 0.4`; on card hover → `opacity: 0.7`,
  `scale(1.04)` (0.4s ease).
- `.work-card-reveal` (the "View case study →" strip): rests
  `translateY(100%)` (off-screen below); on card hover →
  `translateY(0)` (0.25s ease) — text color `var(--accent)`.

**`.info-card`** — `background: var(--bg-2)`, 0.5px `var(--border)`,
`--r-lg`, `padding: 20px`. On hover: `border-color: var(--accent)`,
`box-shadow: 0 0 0 1px var(--accent-dim), var(--neon-sm)`. Its icon plate
(`.info-card-icon`, 36×36px, `--r-md`) defaults to
`background: var(--accent-dim)`; the purple/teal variants swap in
`--accent-2-dim` / `rgba(29,158,117,0.1)` respectively for a 3-card row
that visually cycles through all three brand colors.

### Inputs

`.input` — `background: var(--bg-2)`, 0.5px `var(--border)`, `--r-sm`,
DM Sans 15px, `transition: all 0.2s var(--ease)`.

| State | Rule |
|---|---|
| Default | as above |
| Hover | `border-color: var(--border-2)` |
| Focus | `border-color: var(--accent)`, `background: var(--bg-3)`, `box-shadow: var(--neon-sm)` |
| Error (`.input-error`) | `border-color: var(--danger) !important`; on focus, `box-shadow: 0 0 8px var(--danger), 0 0 20px rgba(212,83,126,0.3) !important` |
| Success (`.input-success`) | `border-color: var(--success) !important` |

`.field-hint.error` / `.field-hint.success` color the helper text to
match. Placeholder text is always `var(--text-3)`.

### Navigation

`.nav-inner` is a floating rounded card, not a full-width bar:
`background: var(--bg)`, 0.5px `var(--border)`, `--r-lg`, height 68px,
padding `10px 40px`.

| State | Rule |
|---|---|
| **Resting** (top of page) | Solid `var(--bg)` card as above |
| **Scrolled** (`.nav.scrolled`, toggled at `window.scrollY > 20`) | `background: color-mix(in srgb, var(--bg) 65%, transparent)`, `backdrop-filter: blur(16px) saturate(180%)`, `border-color: var(--border-2)` — a glassmorphism transition (`0.3–0.4s var(--ease)`) |

`.nav-link` gets an animated underline: a `::after` bar sitting at
`bottom: 4px`, `scaleX(0)` at rest, `scaleX(1)` on hover/`.active`
(`transform-origin: left`, 0.2s ease). `.nav-cta` matches `.btn-ghost`'s
glow pattern on hover.

---

## 5. LAYOUT PRINCIPLES

### Spacing scale — base 8px

| Token | Value | When to use |
|---|---|---|
| `--space-xs` | 8px | Icon ↔ label, tightest sibling gaps |
| `--space-sm` | 16px | Button / input inner padding |
| `--space-md` | 32px | Image ↔ text, gap between sibling components |
| `--space-lg` | 64px | Content blocks within a section |
| `--space-xl` | 128px | Separation between major page sections (intended — see gap note) |
| `--space-2xl` | 240px | Hero top padding, full-bleed layout gaps |

### Grid

There is no formal 12-column grid system in this codebase — layout is
**content-driven**, not slot-driven. The consistent structural pattern is:

```
<section>
  <div class="padding-global">      ← horizontal gutter only
    <div class="container-main">    ← max-width cap, centered
      <div class="[section]-content"><!-- actual layout lives here --></div>
    </div>
  </div>
</section>
```

`--max-w: 1440px`, `--gutter: 48px` (steps to 24px ≤768px, 16px ≤520px).
Inside `[section]-content`, layouts use purpose-built CSS Grid/Flexbox per
component (`.col-2`, `.col-3`, `.work-grid`, `.help-grid`, etc.) sized to
their actual content rather than snapped to a universal column count.

### Whitespace philosophy

- Generous section-to-section gaps (`--space-xl`/128px intended,
  `--space-lg`/64px on tablet, `--space-md`/32px on mobile) so each
  section reads as its own beat, not a continuous scroll of noise.
- One dominant element per viewport — a hero headline, a single featured
  case study, one testimonial at a time — rather than competing focal
  points.
- Intentional grid breaks: the services hero's showcase gallery and the
  work-card grids deliberately break the single-column rhythm to signal
  "this part of the page is a gallery, not prose," then return to the
  standard `padding-global > container-main` rhythm immediately after.

---

## 6. DEPTH & ELEVATION

This system does not use traditional `box-shadow` elevation (no
"card floats above page" drop-shadow language). Depth is communicated two
ways: **surface stepping** and **neon glow**.

### Surface hierarchy

`--bg` → `--bg-2` → `--bg-3` → `--surface` — each step is a small
lightness increase (dark world) / the move toward pure white (light
world), used to indicate stacking without a shadow:

| Layer | Dark | Light | Used for |
|---|---|---|---|
| `--bg` | `#111110` | `#F5F3EE` | Page canvas |
| `--bg-2` | `#1a1a18` | `#ECEAE4` | Nav card, component boxes, buttons at rest |
| `--bg-3` | `#222220` | `#E4E1DA` | Card thumbnails, hover-state surfaces, focused inputs |
| `--surface` | `#242422` | `#FFFFFF` | Modals, popovers — highest resting layer |

### Neon glow — the real "shadow system"

Three sizes exist per accent color, and **the two worlds are tuned
independently, not inverted** — daylight kills neon, so CA Stone's glow
is a soft ambient drop-shadow rather than a literal light source:

| Token | Dark (HK Night) | Light (CA Stone) |
|---|---|---|
| `--neon-sm` | Tight amber glow: `0 0 6px var(--accent), 0 0 14px rgba(239,159,39,0.45)` | Soft drop-shadow: `0 2px 12px rgba(29,158,117,0.25)` |
| `--neon-md` | `0 0 8px var(--accent), 0 0 22px rgba(239,159,39,0.5), 0 0 42px rgba(239,159,39,0.2)` | `0 4px 20px rgba(29,158,117,0.35), 0 8px 40px rgba(29,158,117,0.15)` |
| `--neon-lg` | Widest spread, up to `0 0 100px rgba(239,159,39,0.1)` | `0 6px 28px rgba(29,158,117,0.4), 0 12px 50px rgba(29,158,117,0.2)` |

Plus named-color variants used regardless of which world's accent is
active: `--neon-purple`, `--neon-pink`, `--neon-teal` (real glow in dark;
`--neon-teal` aliases straight to `--neon-md` in light, since light's
accent already *is* teal). **Pairing rule:** when a component's fill color
is the semantic `--accent` (amber-or-teal depending on world), its glow
must use `--neon-sm/md/lg` — those three are the only glow tokens that
track `--accent` per-theme. A component whose fill is a *named* color
(`--accent-2` purple, `--danger` pink/red) pairs with that color's own
named glow (`--neon-purple`, `--neon-pink`) instead, since those stay
fixed regardless of world.

Border radius (`--r-sm` 3px, `--r-md` 6px, `--r-lg` 12px, `--r-pill`
999px) reinforces the same depth language at small scale — sharper
radius for compact controls (buttons, tags), larger radius for surfaces
that hold content (cards, the nav's floating pill).

---

## 7. DO'S AND DON'TS

Guardrails specific to this system, pulled from `CLAUDE.md`'s hard
constraints table, its design principles, and `brand-guidelines.html`'s
logo-usage rules.

**Do**
- Treat HK Night and CA Stone as different atmospheres, not an inverted
  palette — tune glow, shadow, and density per world rather than
  mechanically flipping values (section 1, section 6).
- Use `var(--ease)` (`cubic-bezier(0.16, 1, 0.3, 1)`) on every transition,
  with no exception. This sharp ease-out is the system's signature —
  the UI kit's own motion demo literally labels it "use this — always."
- Keep the interface still at rest; motion appears only in response to
  scroll or interaction (hover glow, underline draw, card reveal), and it
  always communicates state or hierarchy, never decoration for its own
  sake.
- Reference `tokens.css` for every color, radius, spacing, and easing
  value — no hardcoded hex, no raw `px` size outside the scale, no raw
  `cubic-bezier()` outside `--ease`/`--ease-in`.
- Keep the Scorpio purple (`--accent-2`) identical across both worlds — it's
  the one color allowed to *not* change, because that's what makes it read
  as "Andrew" rather than "whichever world you're in."
- Give every interactive element a visible focus state and sufficient
  contrast in both themes (CLAUDE.md's accessibility principle).

**Don't**
- Don't use `ease-in-out` or `linear` for UI transitions — both are
  explicitly called out in the UI kit's own motion section as "too
  passive" / "robotic — avoid."
- Don't hardcode a hex value, `px` size, or font name directly in CSS —
  always reference a token.
- Don't add inline styles except a genuinely one-off dynamic value (e.g.
  a swatch's own background color).
- Don't stretch, skew, place-on-clashing-background, or add
  effects (drop shadows, gradients) to the logo mark — it stays
  undistorted, on a background it has real contrast against, with no
  applied effects (brand-guidelines.html, "Don't" panel).
- Don't extend the neon-sign hardcoded-glow exception to any other
  component without updating CLAUDE.md §11 first.
- Don't invent a new theme fork (a third `data-theme` value, a
  component-local color override) — every component works in both worlds
  using only the existing CSS variables.

---

## 8. RESPONSIVE BEHAVIOR

### Breakpoints

`520px` (mobile) · `768px` (tablet) · `1024px`–`1025px` (desktop nav
behavior) · `1440px` (`--max-w`, the container cap beyond which layout
stops growing).

- **≤768px**: `.padding-global` steps 48px→24px; `section` padding-block
  steps 128px(intended)/80px(shipped)→64px; the desktop nav (`.nav-links`)
  hides and `.nav-burger` (hamburger) appears.
- **≤520px**: `.padding-global` steps to 16px; `section` padding-block
  steps to 32px; nav bar itself compresses to a 48px-tall bar.
- **≥1025px**: the case-study nav's Work/About/CTA group and its
  section-jump-link group become a single crossfading grid area (desktop
  only — there's no room for a crossfade animation in the mobile overlay
  nav).

### Touch targets

No sitewide minimum is formally codified in tokens, but the one place
it's explicitly engineered is the mobile nav hamburger: `.nav-burger` is a
visually 40×40px icon with an invisible `::before{ inset: -4px }` hit-area
expansion, bringing its actual tappable area to the WCAG-recommended
48×48px without inflating the compact mobile nav bar's visible height
(documented inline in `nav.astro`: *"Invisible hit-area expansion to the
recommended 48x48px touch target."*). Treat 48×48px as the target for any
new mobile-tappable control, using the same invisible-expansion technique
where the visual element itself needs to stay smaller.

### Nav collapse

At `≤768px`, `.nav-links` (desktop Work/About/language-toggle/CTA) is
replaced by `.nav-burger`, which opens `.nav-mobile` — a full-screen
overlay (`inert`/`aria-hidden` toggled for a11y) containing stacked
nav links, the language toggle, and a CTA button.

### What's disabled or downgraded on mobile / low-end devices

- **Closing-image parallax** (`initClosingParallax` in `gsap.js`) is
  explicitly disabled below 768px width (`if (window.innerWidth < 768)
  return;`), independent of the reduced-motion check every animation
  already has. The gallery-row parallax (`initParallax`) has no such
  width cutoff — only the reduced-motion guard.
- **The homepage WebGL fluid hero** (`hero-fluid-bg.astro`): on
  touch/coarse-pointer devices (`matchMedia('(pointer: coarse)')`), it
  automatically renders at a lower simulation quality — `SIM_RESOLUTION`
  192→140, `DYE_RESOLUTION` 1024→640 — rather than switching to a
  different rendering mode. On `prefers-reduced-motion: reduce`, the
  canvas is hidden outright (`display: none`). On a device with no WebGL
  support at all, an explicit text fallback shows instead ("This device
  doesn't support WebGL, so the fluid effect can't render") — there is no
  2D-canvas redraw fallback; it's a canvas-or-message choice, not three
  tiers.

---

## 9. AGENT PROMPT GUIDE

### Quick reference

- **5 most-used hex values**: `#111110` (HK bg) · `#F5F3EE` (CA bg) ·
  `#EF9F27` (HK accent, amber) · `#1D9E75` (CA accent, teal — also
  `--success` everywhere) · `#534AB7` (Scorpio purple, both worlds)
- **Signature easing**: `var(--ease)` = `cubic-bezier(0.16, 1, 0.3, 1)` —
  use on every transition, no exceptions
- **Two font roles**: `var(--font-display)` (Cormorant Garamond — depth,
  headlines) · `var(--font-body)` (DM Sans — structure, everything else)

### Prompt templates

> "Build a [component] for the [dark/light] world using DESIGN.md
> section 2 colors and section 3 typography. Follow the neon-glow pattern
> from section 6 for any interactive hover state."

> "Design a [card/button/form] variant matching the states documented in
> DESIGN.md section 4 — resting, hover, and (if applicable) focus/error/
> success — using only tokens from section 2, never a hardcoded hex."

> "Lay out a new section following DESIGN.md section 5's
> `padding-global > container-main > [section]-content` structure and the
> section-spacing scale, checking section 8 for how it should collapse at
> 768px and 520px."

> "Review this component against DESIGN.md section 7's Do's and Don'ts
> before shipping — confirm it reads as the correct world's atmosphere
> (section 1), uses `var(--ease)` exclusively, and introduces no new
> hardcoded values."
