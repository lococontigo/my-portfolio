---
version: alpha
name: Andrew-Yip-Duality-design-analysis
description: An interpretation of the Duality system powering Andrew Yip's UX/UI design + development portfolio — two independently-tuned worlds (HK Night: near-black canvas, weight-300 Cormorant Garamond display type, amber neon-glow accent; CA Stone: warm stone canvas, teal accent, daylight-softened shadow) bridged by one constant Scorpio-purple accent, a single cubic-bezier(0.16,1,0.3,1) sharp ease-out used on every transition without exception, and a hairline-bordered, glow-elevated component language in place of traditional box-shadow depth.

colors:
  bg: "#111110 / #F5F3EE"
  bg-2: "#1a1a18 / #ECEAE4"
  bg-3: "#222220 / #E4E1DA"
  surface: "#242422 / #FFFFFF"
  surface-2: "#19191C / #FCFBFD"
  border: "#2a2a28 / #D8D4CB"
  border-2: "#3a3a38 / #C4BFB5"
  text-1: "#F0EDE6 / #1C1C1A"
  text-2: "#A8A49C / #6B6860"
  text-3: "#5F5E5A / #A8A49C"
  accent: "#EF9F27 / #1D9E75"
  accent-dim: "rgba(239,159,39,0.12) / rgba(29,158,117,0.10)"
  accent-text: "#EF9F27 / #146A4F"
  accent-2: "#534AB7"
  accent-2-dim: "rgba(83,74,183,0.14) / rgba(83,74,183,0.10)"
  danger: "#D4537E / #C0384F"
  success: "#1D9E75"
  text-on-accent: "#111110"
  text-on-image: "#F0EDE6"
  overlay-dark: "rgba(0,0,0,0.2)"
  scrim: "rgba(17,17,16,0.72)"

typography:
  display:
    fontFamily: Cormorant Garamond, serif
    fontSize: 47px
    fontWeight: 300
    lineHeight: 47px
    letterSpacing: -0.02em
  heading-1:
    fontFamily: Cormorant Garamond, serif
    fontSize: 36px
    fontWeight: 400
    lineHeight: 39.6px
    letterSpacing: -0.01em
  heading-2:
    fontFamily: Cormorant Garamond, serif
    fontSize: 27px
    fontWeight: 400
    lineHeight: 32.4px
  label:
    fontFamily: DM Sans, sans-serif
    fontSize: 11px
    fontWeight: 500
    lineHeight: normal
    letterSpacing: 0.01em
  body:
    fontFamily: DM Sans, sans-serif
    fontSize: 15px
    fontWeight: 300
    lineHeight: 25.5px
  body-base:
    fontFamily: DM Sans, sans-serif
    fontSize: 16px
    fontWeight: 300
    lineHeight: 25.6px
  micro:
    fontFamily: DM Sans, sans-serif
    fontSize: 8px
    fontWeight: 400
    lineHeight: normal
    letterSpacing: 0.12em
  mono:
    fontFamily: JetBrains Mono, monospace
    fontSize: 11px
    fontWeight: 400
    lineHeight: normal

rounded:
  sm: 3px
  md: 6px
  lg: 12px
  pill: 999px

spacing:
  xs: 8px
  sm: 16px
  md: 32px
  lg: 64px
  xl: 128px
  2xl: 240px

components:
  nav-bar:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-1}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "10px 40px"
  nav-link:
    textColor: "{colors.text-2}"
    typography: "{typography.label}"
  nav-cta:
    textColor: "{colors.accent}"
    borderColor: "{colors.bg}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "6px 14px"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.text-on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.accent}"
    borderColor: "{colors.bg}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-ghost-purple:
    backgroundColor: transparent
    textColor: "{colors.accent-2}"
    borderColor: "{colors.bg}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-muted:
    backgroundColor: "{colors.bg-2}"
    textColor: "{colors.text-2}"
    borderColor: "{colors.bg}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-icon:
    backgroundColor: "{colors.bg-2}"
    textColor: "{colors.text-2}"
    borderColor: "{colors.bg}"
    rounded: "{rounded.sm}"
    padding: "10px"
  button-sign:
    backgroundColor: transparent
    textColor: "{colors.accent}"
    borderColor: "{colors.bg}"
    typography: "font-size 20px, weight 400, letter-spacing 0.08em"
    rounded: "{rounded.sm}"
    padding: "10px 28px"
  text-input:
    backgroundColor: "{colors.bg-2}"
    textColor: "{colors.text-1}"
    borderColor: "{colors.border}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  work-card:
    backgroundColor: "{colors.bg-2}"
    textColor: "{colors.text-1}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "0"
  info-card:
    backgroundColor: "{colors.bg-2}"
    textColor: "{colors.text-1}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "20px"
  tag:
    backgroundColor: "{colors.bg-2}"
    textColor: "{colors.text-2}"
    borderColor: "{colors.border}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  toast:
    backgroundColor: "{colors.bg-2}"
    textColor: "{colors.text-1}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "14px 16px"

  # ─── Examples (illustrative) — re-derived from real site sections ───
  ex-case-study-card:
    description: "Selected-work grid tile. Re-uses work-card chrome — thumbnail block, category/title/subtitle body, reveal-on-hover CTA strip."
    backgroundColor: "{colors.bg-2}"
    textColor: "{colors.text-1}"
    rounded: "{rounded.md}"
  ex-service-tier-card:
    description: "The three 'I Can Help You With' cards (Design / Development / Full Package) on /services/. Re-uses info-card chrome — icon plate, title, one-line body."
    backgroundColor: "{colors.bg-2}"
    textColor: "{colors.text-1}"
    rounded: "{rounded.lg}"
    padding: "20px"
  ex-contact-form-card:
    description: "The services contact form. text-input primitives (default/focus/error/success) inside a plain content block, no outer card chrome of its own."
    backgroundColor: "{colors.bg}"
    borderColor: "{colors.border}"
    rounded: "{rounded.sm}"
  ex-testimonial-card:
    description: "TestimonialsWall entries — quote body in body typography, attribution in label typography."
    backgroundColor: "{colors.bg-2}"
    textColor: "{colors.text-1}"
    rounded: "{rounded.lg}"
  ex-timeline-item:
    description: "Career-history / workflow-step entries (Timeline component) — title + body pair per step, no card chrome, separated by the spacing scale."
    textColor: "{colors.text-1}"
    typography: "{typography.body}"
  ex-nav-mobile-drawer:
    description: "The ≤768px hamburger overlay — full-screen inert panel, stacked nav-link-styled entries, a nav-cta-styled button at the base."
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-1}"
  ex-nda-locked-toast:
    description: "'This work is under NDA' notice on password-gated case studies. Re-uses toast chrome, amber/accent-tinted variant."
    backgroundColor: "{colors.bg-2}"
    borderColor: "rgba(239,159,39,0.3)"
    rounded: "{rounded.md}"
---

## Overview

Andrew Yip's portfolio wears its identity as a deliberate **duality**: every page renders in one of two independently-tuned worlds rather than a single palette with a dark-mode toggle bolted on. **HK Night** (`data-theme="dark"`) is a near-black `{colors.bg}` canvas lit by a vivid amber `{colors.accent}` neon-glow accent — dense, electric, vertical, the visual language of Hong Kong signage glimpsed at night. **CA Stone** (`data-theme="light"`) is a warm stone `{colors.bg}` canvas with a teal `{colors.accent}`, softened daylight shadows in place of glow — open, clean, horizontal. One accent bridges both without ever changing: the Scorpio purple `{colors.accent-2}` (`#534AB7`), identical in both worlds, the constant that says "this is still Andrew" regardless of which city's atmosphere the visitor is standing in.

Display typography carries the second signature. **Cormorant Garamond** — a serif with real editorial weight — sets every headline at an unusually *light* weight (300 at hero scale) rather than the heavy weight-900 stencil approach a fintech brand might use; the effect is closer to an art-house film credit than a SaaS landing page. **DM Sans** carries structure (nav, buttons, body, labels) and **JetBrains Mono** appears sparingly wherever the design needs to read as "system output" — token names, easing curves.

Depth has no traditional box-shadow language at all. Elevation is communicated by surface-stepping (`{colors.bg}` → `{colors.bg-2}` → `{colors.bg-3}` → `{colors.surface}`) and, on interactive elements, a **neon glow** system tuned per world — vivid and literal in HK Night, a soft ambient drop-shadow in CA Stone, because daylight genuinely kills neon.

**Key Characteristics:**
- Two independently-tuned worlds, not an inverted palette — `{colors.accent}` swaps amber↔teal, but glow intensity, shadow softness, and density are re-tuned per world rather than mechanically flipped.
- One constant bridge color — `{colors.accent-2}` Scorpio purple, `#534AB7`, byte-identical in both themes.
- Neon glow is the shadow system. Three sizes (`sm`/`md`/`lg`) per world, real diffuse light in dark, ambient drop-shadow in light.
- A single signature ease — `cubic-bezier(0.16, 1, 0.3, 1)` — used on every transition, no exceptions, no `ease-in-out`, no `linear`.
- Three-face type system with strict roles: Cormorant Garamond (depth/display), DM Sans (structure/UI), JetBrains Mono (code/tokens).
- One sanctioned hardcoded-color exception in the entire system: the neon-sign button's hover glow (`button-sign`), calibrated by eye rather than token, because it's meant to read as a literal backlit sign.

## Colors

Every paired value below reads **dark-world / light-world**; a single value means the token is identical in both worlds.

### Surface
- **Background** (`{colors.bg}` — `#111110` / `#F5F3EE`): Page canvas.
- **Background 2** (`{colors.bg-2}` — `#1a1a18` / `#ECEAE4`): Nav card, component boxes, resting buttons.
- **Background 3** (`{colors.bg-3}` — `#222220` / `#E4E1DA`): Card thumbnails, hover-state surfaces, focused inputs.
- **Surface** (`{colors.surface}` — `#242422` / `#FFFFFF`): Highest resting layer — modals, popovers.
- **Surface 2** (`{colors.surface-2}` — `#19191C` / `#FCFBFD`): Secondary elevated surface.
- **Border** (`{colors.border}` — `#2a2a28` / `#D8D4CB`): Default hairline.
- **Border 2** (`{colors.border-2}` — `#3a3a38` / `#C4BFB5`): Stronger hairline for hover states.

### Text
- **Text 1** (`{colors.text-1}` — `#F0EDE6` / `#1C1C1A`): Primary text.
- **Text 2** (`{colors.text-2}` — `#A8A49C` / `#6B6860`): Secondary text, body copy.
- **Text 3** (`{colors.text-3}` — `#5F5E5A` / `#A8A49C`): Tertiary text, micro-labels, timestamps.
- **Text on Accent** (`{colors.text-on-accent}` — `#111110`, fixed both worlds): Ink for text sitting on an accent-filled surface — intentionally the same in both themes, since `--text-1`/`--bg` would fail contrast in one world or the other on top of `{colors.accent}`.
- **Text on Image** (`{colors.text-on-image}` — `#F0EDE6`, fixed): Text placed over photographic backgrounds.

### Brand & Accent
- **Accent** (`{colors.accent}` — `#EF9F27` amber / `#1D9E75` teal): The primary accent — the one token that IS the "which world am I in" signal. Buttons, links, focus rings, the neon-sign glow.
- **Accent Dim** (`{colors.accent-dim}`): Low-opacity accent tint for hover fills and active tag backgrounds.
- **Accent Text** (`{colors.accent-text}` — `#EF9F27` / `#146A4F`): Accent color specifically for text use — the light-world value is a WCAG-safe darker teal, since raw `{colors.accent}` is too light for reliable text contrast on `{colors.bg}` in CA Stone.
- **Accent 2** (`{colors.accent-2}` — `#534AB7`, fixed both worlds): "Scorpio" purple — the bridge accent, never changes.
- **Accent 2 Dim** (`{colors.accent-2-dim}`): Low-opacity purple tint.

### Semantic
- **Danger** (`{colors.danger}` — `#D4537E` / `#C0384F`): Errors, destructive actions, NDA/locked-content signals.
- **Success** (`{colors.success}` — `#1D9E75`, fixed both worlds): Success states, confirmations. Not a coincidence that this equals CA Stone's own `{colors.accent}` — teal is both "the light world's identity color" and "the universal success color."
- **Overlay Dark** (`{colors.overlay-dark}` — `rgba(0,0,0,0.2)`): Darkening overlay on images.
- **Scrim** (`{colors.scrim}` — `rgba(17,17,16,0.72)`): Heavier scrim for modal backdrops and video posters.

A fourth, narrower category exists outside this palette entirely: per-case-study brand accents (Delta `#700C1B`, Ant `#FD5001`, Yocale a coral→blue gradient) — client branding colors, used only inside that one client's own case-study page, never as general UI accents.

## Typography

### Font Family
Three faces, strictly role-separated:
1. **Cormorant Garamond** — serif, carries the *depth*. Every display headline and section title, always at a light-to-regular weight (300–400), never bold. Its italic form is reserved for the accent-colored emphasis word inside a `{typography.display}` headline.
2. **DM Sans** — sans, carries the *structure*. Nav, buttons, labels, body copy, form inputs — everything functional.
3. **JetBrains Mono** — monospace, used sparingly for anything that should read as system output: token names, easing-curve values.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display}` | 47px | 300 | 47px | -0.02em | Hero headlines. |
| `{typography.heading-1}` | 36px | 400 | 39.6px | -0.01em | Section titles. |
| `{typography.heading-2}` | 27px | 400 | 32.4px | normal | Subsections. |
| `{typography.label}` | 11px | 500 | normal | 0.01em | Nav, tags, buttons, UI copy. |
| `{typography.body}` | 15px | 300 | 25.5px | normal | Prose blocks, max-width 540px. |
| `{typography.body-base}` | 16px | 300 | 25.6px | normal | Default `<body>` paragraph text. |
| `{typography.micro}` | 8px | 400 | normal | 0.12em, uppercase | Dates, category labels. |
| `{typography.mono}` | 11px | 400 | normal | normal | Code, tokens — colored `{colors.accent-2}`. |

### Principles
- **Cormorant Garamond for the brand moment, DM Sans for everything else.** Strict role separation — the two faces never substitute for each other.
- **Weight stays light at display scale.** 300 at hero, 400 at heading — this system's "signature weight" is the opposite move from a heavy-stencil brand: restraint, not force.

### Note on Fonts
All three faces — Cormorant Garamond, DM Sans, JetBrains Mono — are free, open Google Fonts already in production use (loaded via `@font-face`/Google Fonts CDN with `font-display: swap`). No proprietary substitution is needed.

## Layout

### Spacing System
- **Base unit**: 8px.
- **Tokens**: `{spacing.xs}` 8px · `{spacing.sm}` 16px · `{spacing.md}` 32px · `{spacing.lg}` 64px · `{spacing.xl}` 128px · `{spacing.2xl}` 240px.
- **Section padding**: `{spacing.xl}` (128px) top/bottom between major sections on desktop, intended — the currently shipped CSS uses a hardcoded 80px here; treat 128px as the documented target and reconcile the drift before relying on it precisely.
- **Card interior**: info cards at 20px; content generally at `{spacing.sm}`–`{spacing.md}`.

### Grid & Container
- No formal 12-column grid — layout is content-driven. The one universal structural pattern is `padding-global > container-main > [section]-content`: a horizontal-gutter wrapper, then a max-width cap, then purpose-built content.
- Container caps at 1440px, centered; gutter is 48px, stepping to 24px ≤768px and 16px ≤520px.
- Grids are sized to their content (`.col-2`, `.col-3`, work-card grids, service-tier rows) rather than snapped to a universal column count.

### Responsive Strategy

#### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | ≤ 520px | Gutter → 16px; section padding → 32px; nav bar compresses to 48px tall. |
| Tablet | ≤ 768px | Gutter → 24px; section padding → 64px; desktop nav hides, hamburger appears. |
| Desktop | ≥ 1025px | Full nav, including the case-study section-jump crossfade group. |
| Container cap | 1440px | Layout stops growing past this width regardless of viewport. |

#### Touch Targets
No sitewide minimum is formally tokenized, but the one place it's explicitly engineered sets the standard: the mobile nav hamburger is a visually 40×40px icon with an invisible `inset: -4px` hit-area expansion, bringing its real tappable area to 48×48px (WCAG-recommended) without inflating the compact mobile nav bar's visible height. Use 48×48px as the target for any new mobile-tappable control, expanding the *hit area* rather than the *visual element* where the icon itself needs to stay small.

#### Image Behavior
Every `<img>` carries a descriptive `alt`. Below-the-fold images load `loading="lazy"`; hero images get `fetchpriority="high"` instead. Case-study and showcase imagery is served as `.webp`.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Surface step | `{colors.bg}` → `{colors.bg-2}` → `{colors.bg-3}` → `{colors.surface}`, each a small lightness/whiteness increase, no shadow at all. | Default stacking cue for any non-interactive surface. |
| Glow — sm | Dark: tight glow, `0 0 6px accent, 0 0 14px accent@45%`. Light: soft drop-shadow, `0 2px 12px accent@25%`. | Subtle hover (icon buttons, inputs on focus). |
| Glow — md | Dark: wider glow, three layers out to 42px spread. Light: `0 4px 20px accent@35%, 0 8px 40px accent@15%`. | Standard button/card hover. |
| Glow — lg | Dark: widest, out to 100px spread at low opacity. Light: `0 6px 28px accent@40%, 0 12px 50px accent@20%`. | Neon-sign hover, the system's most emphatic state. |

The two worlds are **independently tuned, not inverted** — CA Stone's glow is a literal soft ambient shadow rather than a light source, because daylight kills neon. Named-color glow variants (`--neon-purple`, `--neon-pink`) exist alongside the accent-tracking `sm`/`md`/`lg` set for components whose fill is a *named* color (`{colors.accent-2}`, `{colors.danger}`) rather than the world-swapping `{colors.accent}`.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.sm}` | 3px | Buttons, tags, compact controls. |
| `{rounded.md}` | 6px | Work-card thumbnails, icon plates. |
| `{rounded.lg}` | 12px | Cards, the nav's floating pill, surfaces that hold content. |
| `{rounded.pill}` | 999px | Tags, badges, fully-rounded controls. |

## Components

### Buttons

**`button-primary`** — the accent-filled CTA. Background `{colors.accent}`, text `{colors.text-on-accent}`, `{typography.label}`, `{rounded.sm}`. Hover: `{colors.accent}` background holds, glow `md`, lifts 1px, letter-spacing widens slightly.

**`button-ghost`** / **`button-ghost-purple`** — transparent-fill outline buttons in `{colors.accent}` / `{colors.accent-2}`. Hover: fills with the matching `-dim` tint, glow `md`/`purple`, border becomes the solid accent, lifts 1px.

**`button-muted`** — background `{colors.bg-2}`, text `{colors.text-2}`. Hover: background steps to `{colors.bg-3}`, text → `{colors.text-1}`, a neutral (non-accent) glow.

**`button-icon`** — background `{colors.bg-2}`, `{rounded.sm}`, 10px padding. Hover: border and text → `{colors.accent}`, glow `sm`.

**`button-sign`** — the signature interaction, and the one sanctioned hardcoded-color exception in the whole system. Transparent at rest, DM Sans 20px/400, letter-spacing 0.08em, 1.5px border in `{colors.bg}` (invisible until hover). On hover: `text-shadow` glow directly in the accent's raw rgba (hand-tuned, not tokenized) plus `{rounded.lg}`-spread glow and a solid accent border — calibrated by eye to read as a literal backlit sign rather than a generic hover state.

### Cards & Containers

**`work-card`** — background `{colors.bg-2}`, `{rounded.md}`, `cursor: pointer`. The thumbnail's inner color block sits at 40% opacity at rest, 70%+scale(1.04) on card hover; a "View case study →" strip sits translated fully off-screen at rest and slides to `translateY(0)` on hover.

**`info-card`** — background `{colors.bg-2}`, `{rounded.lg}`, 20px padding. Hover: border → `{colors.accent}`, glow `sm` plus a 1px accent-dim ring. Its icon plate defaults to `{colors.accent-dim}`; purple/teal variants swap in `{colors.accent-2-dim}` for a row that visually cycles through the palette.

**`tag`** — `{rounded.pill}`, 4px/10px padding, `{typography.label}`. Amber/teal variants gain a soft glow on hover; the default/purple/danger variants don't.

### Inputs & Forms

**`text-input`** — background `{colors.bg-2}`, `{colors.border}`, `{rounded.sm}`, `{typography.body}`. Hover: border → `{colors.border-2}`. Focus: border → `{colors.accent}`, background steps to `{colors.bg-3}`, glow `sm`. Error: border → `{colors.danger}` (forced), focus glow switches to danger-colored. Success: border → `{colors.success}` (forced).

### Navigation

**`nav-bar`** — not a full-width bar but a floating rounded card: background `{colors.bg}`, `{rounded.lg}`, 68px tall, 10px/40px padding. At rest it sits solid at the top of the page; once `scrollY > 20`, it crossfades into a glassmorphism state — `color-mix(bg 65%, transparent)` + `backdrop-filter: blur(16px) saturate(180%)` — over 0.3–0.4s.

**`nav-link`** — `{typography.label}`, text `{colors.text-2}`. An underline bar sits at `scaleX(0)` at rest, animates to `scaleX(1)` on hover/active from the left edge.

**`nav-cta`** — text `{colors.accent}`, transparent fill, 0.5px border. Hover: fills `{colors.accent-dim}`, border solidifies, glow `sm`.

### Signature Components

**Neon-sign button hover** (see Buttons above) — the system's single most distinctive interaction; every other hover state in the system uses tokens exclusively, this one alone hand-tunes raw color values on top of the token-based glow.

**Nav glassmorphism on scroll** — the only place `backdrop-filter` appears in the system; reserved for the nav specifically, not a general card treatment.

**Work-card reveal** — the translate-in "View case study →" strip is the system's signature card-hover pattern, reused (in spirit) anywhere a card needs a hidden call-to-action that appears only on intent.

### Examples (illustrative)

> Re-derived mappings from real site sections onto the primitives above — not new visual treatments, just named anchors for common page archetypes so new pages stay consistent with what already ships.

**`ex-case-study-card`** — Selected-work grid tile. Re-uses `work-card` chrome.
- Properties: `backgroundColor`, `textColor`, `rounded`

**`ex-service-tier-card`** — The three "I Can Help You With" cards on `/services/`. Re-uses `info-card` chrome.
- Properties: `backgroundColor`, `textColor`, `rounded`, `padding`

**`ex-contact-form-card`** — The services contact form. `text-input` primitives, no outer card chrome of its own.
- Properties: `backgroundColor`, `borderColor`, `rounded`

**`ex-testimonial-card`** — TestimonialsWall entries.
- Properties: `backgroundColor`, `textColor`, `rounded`

**`ex-timeline-item`** — Career-history / workflow-step entries. No card chrome — just spacing-scale-separated title/body pairs.
- Properties: `textColor`, `typography`

**`ex-nav-mobile-drawer`** — The ≤768px hamburger overlay.
- Properties: `backgroundColor`, `textColor`

**`ex-nda-locked-toast`** — "This work is under NDA" notice on password-gated case studies. Re-uses `toast` chrome, amber-tinted.
- Properties: `backgroundColor`, `borderColor`, `rounded`

## Do's and Don'ts

### Do
- Treat HK Night and CA Stone as different atmospheres, not an inverted palette — re-tune glow, shadow, and density per world rather than mechanically flipping values.
- Use `var(--ease)` (`cubic-bezier(0.16, 1, 0.3, 1)`) on every transition, no exception — the system's own motion reference literally labels it "use this — always."
- Keep `{colors.accent-2}` Scorpio purple byte-identical across both worlds — it's the one color allowed not to change, because that's what makes it read as "Andrew" rather than "whichever world you're in."
- Reference a token for every color, radius, spacing, and easing value — no hardcoded hex, no raw px outside the scale, no raw `cubic-bezier()` outside the one signature ease.
- Give every interactive element a visible focus state and sufficient contrast in both themes.

### Don't
- Don't use `ease-in-out` or `linear` for UI transitions — both are explicitly flagged as "too passive" / "robotic — avoid" in the system's own reference.
- Don't stretch, skew, place-on-clashing-background, or add effects (drop shadows, gradients) to the logo mark.
- Don't extend the neon-sign button's hardcoded-glow exception to any other component.
- Don't invent a third `data-theme` value or a component-local color override — every component works in both worlds using only the existing tokens.
- Don't repurpose `{colors.accent}` as a generic "brand color" fill on both worlds identically — its entire job is to be the thing that's different between HK Night and CA Stone.
