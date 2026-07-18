# Design decisions

Log of hardcoded-value exceptions and token-system calls that fall outside the
normal "always reference a token" rule (CLAUDE.md's CSS conventions), plus the
reasoning behind them — so future changes to `tokens.css` don't silently break
something that looks unrelated. Companion to CLAUDE.md §11 (neon-sign button
hex exception), which lives in CLAUDE.md itself because it's a sanctioned CSS
exception; the two entries below are logged here instead because one isn't
CSS at all (a GLSL shader) and the other resolves into a new token rather than
staying an open-ended exception.

---

## 1. WebGL shader color literals can't reference CSS tokens

**Where:** `src/components/hero-fluid-bg.astro`, inline `<script>`, `displayShader`
(a GLSL fragment shader compiled at runtime by WebGL — not CSS, and not
processed by Astro/Vite's CSS pipeline at all).

```glsl
vec3 iLow  = vec3(0.55, 0.78, 0.69);
vec3 iMid  = vec3(0.114, 0.620, 0.459);   // = #1D9E75 = --accent (light theme)
vec3 iHigh = vec3(0.043, 0.216, 0.169);
```

**Why it's hardcoded:** GLSL has no mechanism to read a CSS custom property.
The only way to keep `iMid` synced with `--accent` would be for JS to read
`getComputedStyle(document.documentElement).getPropertyValue('--accent')` at
init time and pass it into the shader as a `uniform`, converting the hex to
normalized `vec3` RGB. That wiring wasn't in scope for the `/services` hero
build.

**Drift risk — read this before ever changing `--accent` (light theme):**
`iMid` is a permanent, disconnected copy of `--accent`'s *current* light-theme
value (`#1D9E75` → `rgb(0.114, 0.620, 0.459)` normalized). There is no lint
rule, build check, or visual regression test that ties this literal back to
`tokens.css`. If `--accent` (light) is ever changed:
- `tokens.css` will update everywhere else on the site correctly.
- This shader literal will **not** update, and nothing will fail or warn —
  the `/services` hero fluid background will simply go on rendering the old
  color, quietly out of step with the rest of the light-theme palette.

**Action for whoever changes `--accent` (light) in the future:** grep
`src/components/hero-fluid-bg.astro` for `iMid` and update the `vec3` literal
by hand to match the new hex (converted to 0–1 normalized RGB), or — better —
scope out the `getComputedStyle` → uniform wiring described above so this
becomes a real link instead of a manual one. Flagging that upgrade as a
worthwhile follow-up, not doing it now.

`iLow` and `iHigh` are shader-only gradient anchors (not tied to any existing
token) used to shape the color ramp around `iMid`; only `iMid` has a token
relationship to track.

---

## 2. `.btn-primary` text color — new token added: `--text-on-accent`

**Where:** `src/styles/services.css`, `.btn-primary` (ported from
`src/styles/andrew-ui-kit.html`'s reference button system — this is the first
time this component ships as real, live CSS rather than sitting in a
disconnected reference file).

**What was hardcoded:**
```css
.btn-primary {
  background: var(--accent);
  color:      #111110;   /* now replaced — see resolution below */
  box-shadow: none;
}
```

**Why no existing token fit:** the button needs a fixed dark ink color on top
of an accent-filled background, in *both* themes. Neither `--bg` nor
`--text-1` works because both flip per theme:
- Dark-on-teal (light theme): ≈5:1 contrast — passes WCAG AA.
- Dark-on-amber (dark theme): ≈8.7:1 contrast — passes WCAG AA.
- The theme-flipped alternative (light text on accent) measured ≈3:1 in
  testing — fails WCAG AA in both themes.

So a truly fixed, theme-agnostic value is the correct call here, not a bug to
work around.

**Resolution — new token added:** rather than leave this as a second,
undocumented raw-hex exception (in the spirit of formalizing it the way
CLAUDE.md §11 formalized the neon-sign glow), added a new theme-agnostic token
to `tokens.css`, in the existing "SHARED TOKENS (theme-agnostic)" block
alongside `--text-on-image` (which already solves the analogous "fixed text
color regardless of active theme" problem for text over photographic
backgrounds):

```css
/* Fixed dark ink for text/icons placed on top of an accent-filled surface
   (e.g. .btn-primary) — intentionally the same value in both themes, since
   --text-1/--bg would fail contrast in one theme or the other. */
--text-on-accent: #111110;
```

This is a **new token**, not a change to any existing token's value — no
Andrew sign-off needed per the escalation rule, but flagging it here per the
Designer's standing instruction to record rationale for any new token.

**Follow-up — resolved (2026-07-17):** the Full-Stack Developer applied the
swap; `.btn-primary` in `src/styles/services.css` now reads
`color: var(--text-on-accent);`. Confirmed via QA pass
(`docs/qa-reports/2026-07-17-services-hero-qa.md`, Finding 3): computed
contrast `--text-on-accent` (`#111110`) on light-theme `--accent` (`#1D9E75`)
≈5.6:1, passes AA. No further action needed.

---

## 3. `.intro-location-label` / `.intro-location-dot` contrast — new token added: `--accent-text`

**Where:** `src/styles/index.css` (`.intro-location-label`, `.intro-location-dot`,
lines ~45-71 — live on the homepage today) and the verbatim copy in
`src/styles/services.css` (ported for the unreleased `/services` hero, per
QA report `docs/qa-reports/2026-07-17-services-hero-qa.md`, Finding 6).

**The problem:** both selectors set `color`/`background` to `var(--accent)`
directly. On the light theme ("CA Stone"), `--accent` (`#1D9E75`) against
`--bg` (`#F5F3EE`) computes to ≈3.05:1, and against the actual pill
background (`--accent-dim` composited over `--bg`) it drops to ≈2.76:1 — both
fail WCAG AA's 4.5:1 minimum for this 11px text (well under the "large text"
threshold that would allow 3:1). Dark theme ("HK Night") is unaffected —
amber `--accent` (`#EF9F27`) on near-black `--bg` (`#111110`) has a wide
margin above AA already.

**Why `--accent` itself wasn't changed:** `--accent` is used pervasively
sitewide — buttons, borders, glows, the neon-sign system — so touching its
actual value needs Andrew's explicit sign-off per the escalation rule, and
this fix doesn't require it. This is a small-text-legibility problem specific
to one component, not a reason to darken the whole site's accent color.

**Resolution — new token added**, following the same "add, don't mutate"
pattern as `--text-on-accent`: added `--accent-text` in `tokens.css`, defined
per-theme (unlike `--text-on-accent`, its value genuinely differs by theme,
so it lives in each theme's own block rather than the shared block):

```css
/* dark theme block */
--accent-text: var(--accent); /* dark already passes AA — pure alias, no visual change */

/* light theme block */
--accent-text: #146A4F; /* darker/more-saturated version of the same teal hue, tuned for small-text AA */
```

`#146A4F` was derived by holding `--accent`'s hue and saturation constant
(HSL ≈160.9°, 69%) and reducing lightness until AA passed with a safe margin,
not by picking an arbitrary darker green — so it still reads as "the teal
accent," just legible at small sizes. Computed contrast:
- `#146A4F` on `--bg` (`#F5F3EE`): ≈5.91:1 (passes AA, comfortable margin)
- `#146A4F` on the composited pill background (`--accent-dim` over `--bg`): ≈5.34:1 (passes AA, comfortable margin)

This is a **new token**, not a change to any existing token's value — no
Andrew sign-off needed per the escalation rule.

**Follow-up (outside Designer's file territory):** `src/styles/index.css`
(`.intro-location-label` color, `.intro-location-dot` background and
`::after` background) and the verbatim copy in `src/styles/services.css`
still need `var(--accent)` swapped for `var(--accent-text)` on those three
declarations — that's a Full-Stack Developer edit since neither file is in
the Designer's owned territory. Logging this here so it isn't lost; PM to
route to Full-Stack Developer. Worth a Full-Stack Developer judgment call
while there: whether to also consolidate the now-two verbatim copies of this
component's CSS into one shared location so a future fix doesn't need to
happen twice — not required by this fix, just flagging the opportunity.
