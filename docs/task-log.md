# Task log

Running log of every task assigned across the 5-agent team, owned by the PM. See `docs/team-structure.md` for roles/territory and `CLAUDE.md` for project rules.

**Format:** newest entries at the top. Each entry: date, task, owner(s), status, notes (escalations, blockers, plan-approval decisions).

---

## 2026-07-18 — Playwright MCP added; services hero polish (chip sizing, header width)
- **Task:** Set up browser/screenshot capability so pages can be visually verified instead of only code-reviewed, then use it to fix two small issues Andrew spotted: the "Vancouver · Canada" chip stretching full-width, and the hero text column needing an exact 586px max-width on desktop (matching Figma).
- **Owner:** PM (MCP setup + verification), Full-Stack Developer (CSS fixes)
- **Status:** Done — committed locally, not pushed
- **Notes:**
  - Added `.mcp.json` at the project root registering the official Playwright MCP server (`npx @playwright/mcp@latest --browser chromium`). The `claude` CLI wasn't reachable from the tool-execution environment to run `claude mcp add` directly, so the project-level config file was used instead — this is committed so the capability persists across sessions without needing to redo setup.
  - Required two restarts to fully connect (once to load the new `.mcp.json`, once after adding the `--browser chromium` flag when the default Chrome-channel launch failed), plus a one-time Chromium binary download (`npx @playwright/mcp install-browser chrome-for-testing`) since real Google Chrome wasn't installed and installing it needed admin rights.
  - First real use: screenshotted `/services/` and confirmed visually (not just via code read) that `.intro-location` was stretching to fill its parent column instead of hugging its content — root cause was `.hero-header`'s flex column defaulting to `align-items: stretch`. Fixed with `align-self: flex-start`, matching the existing `.hero-cta` precedent in the same file.
  - Also applied Andrew's direct request: `.hero-header` max-width changed from `44ch` to a fixed `586px` on desktop (exact Figma column width), with a `max-width: 100%` override inside the existing `≤1024px` breakpoint so tablet/mobile aren't stuck with an oversized fixed column.
  - Verified with an actual screenshot after the fix (not just computed-style checks) — headline now wraps to 2 lines matching the Figma reference, chip hugs its content correctly.
  - While investigating an odd dark shape visible in an earlier full-page screenshot, traced it to Astro's built-in dev toolbar (`<astro-dev-toolbar>`) — normal dev-server-only chrome, not a bug, not present in production.

## 2026-07-17 — Services hero: rebuilt to match Figma, scrim removed
- **Task:** Andrew reported the hero layout was wrong and pointed to a specific Figma frame (node 589:486, file AyNWCHfnVugfxZsJYFo1qM) as the reference; also asked to remove the contrast scrim added in the prior QA-fix round.
- **Owner:** PM (fetched Figma design via MCP), Full-Stack Developer (implementation)
- **Status:** Done — committed locally, not pushed
- **Notes:**
  - Figma reference revealed the actual intended design differs substantially from what was built: plain black-ish text with no scrim at all (not a light-text-on-scrim treatment), a bottom-anchored two-column layout (text left, client logos in a 2×3 grid flush right) rather than a vertically-centered single column with logos below, and an outline/ghost CTA button rather than a filled one.
  - Removing the scrim reintroduces the "no guaranteed contrast against the animated canvas" risk QA flagged earlier — flagged clearly to Andrew before proceeding; he accepted this tradeoff explicitly (page is still local/pre-launch, he's actively tuning the effect via the debug panel). `--text-1` (now used again) has a much larger rest-state contrast margin (~15:1) than the removed `--text-2`-on-scrim setup did, so it's more robust even though still not formally bounded.
  - Full-Stack Developer ported `.btn-ghost` from `andrew-ui-kit.html` (adapted so the border is visible at rest, not just on hover, per the Figma spec), built a new `.hero-logos-grid` (2×3 CSS grid) scoped to `services.css` rather than reusing the homepage's single-row `.intro-logos` pattern, and changed `.hero-section`/`.hero-content` from centered to bottom-anchored flex layout. Used the real client-logo SVGs, not the generic placeholder shapes shown in the Figma mockup.
  - Mobile breakpoint judgment call: two-column layout collapses to stacked at ≤1024px (documented reasoning: text column + logo column need ~950px+ combined).
  - No browser/screenshot tool available in this environment for either the subagent or PM to visually confirm the render — verification was via build success, served HTML/CSS inspection, and code review. Recommend Andrew eyeball it directly in the browser and flag anything more that's off.

## 2026-07-17 — New /services page: hero section with WebGL fluid background
- **Task:** Build the hero section of a brand-new `/services` page (part of a bigger planned site direction — a split-screen entry choosing between the hiring/portfolio path and the services path — but scoped to just the hero for this task). Local-only, not linked from nav, not pushed to remote per Andrew's instruction.
- **Owner:** Full-Stack Developer (build), Designer (token decisions), QA (review)
- **Status:** Done — committed locally only, awaiting Andrew's go-ahead to push
- **Notes:**
  - Plan mode used given the scope (new page/route + a large novel WebGL integration) — full plan at `C:\Users\andre\.claude\plans\let-s-build-on-the-rippling-gizmo.md`. Andrew supplied a reference screenshot and a full working WebGL fluid-simulation prototype (~600 lines) to adapt.
  - Built `src/components/hero-fluid-bg.astro`, `src/pages/services.astro`, `src/styles/services.css`. Adapted the reference script: full `prefers-reduced-motion` bailout (not just the intro sweep), `IntersectionObserver`-gated visibility (canvas is hero-scoped, not full-page), removed the unused dark-theme shader branch (page is `world="light"` only), TS-typed per the `case-study-compare-slider.astro` convention, debug tuning panel kept per Andrew's request (removal is a follow-up task).
  - **Found and fixed a real gap in team setup**: the `fullstack-developer` subagent's own definition said "never touch `src/styles/*`," broader than intended — Designer's actual territory is four specific files (tokens/typography/global/animations.css), not the whole directory. Page-scoped stylesheets like `services.css` (following the `index.css` precedent) belong to whoever owns the page. Fixed `.claude/agents/fullstack-developer.md` (also had a stale "no TypeScript" line from before the earlier policy update).
  - Along the way, discovered `src/styles/andrew-ui-kit.html` (the documented button/tag system) is a fully disconnected reference file never imported anywhere, and CLAUDE.md's `.t-*` typography utility classes don't actually exist as CSS (`typography.css` only has base `body` styles; `contact.astro` even applies a dead `t-body` class with no effect). Neither blocked this task — followed the real, working convention instead — but flagged to Andrew as a separate loose end.
  - QA found and Andrew approved fixes for: (1) hero text had no guaranteed contrast against the animated canvas — fixed with a `--scrim`/`--text-on-image` backdrop (Full-Stack); (2) debug panel range sliders had zero focus-visible indicator, a WCAG 2.4.7 failure — fixed with a `:focus-visible` style (Full-Stack); (3) QA also caught that `.intro-location-label` (the teal location pill, copied verbatim from the existing homepage) fails WCAG AA contrast on the light theme — **this is a pre-existing bug already live on the homepage today**, not introduced by this task. Andrew approved a fix: new token `--accent-text` (Designer), applied to both `index.astro` and `services.astro` (Full-Stack).
  - Also added a new token `--text-on-accent` (Designer) to formalize `.btn-primary`'s dark-ink-on-accent text color, since it's the first time that button system became real shipped CSS (previously only in the disconnected reference file) — same "fixed value, theme-agnostic" pattern as the existing `--text-on-image`.
  - **Process note — twice today, a subagent ran `taskkill /F /IM node.exe`**, which kills every node process on the machine rather than just its own dev server; flagged both times by the harness as a security concern. Added a new "Dev server hygiene" rule to CLAUDE.md banning blanket process-kill commands. The very next subagent dispatch correctly used a scoped, PID-targeted kill instead — rule appears effective.
  - Everything verified via `npm run dev`/`npm run build` at each step; committed locally, **not pushed** — Andrew was explicit about this staying local until he says otherwise.

## 2026-07-17 — Testimonial slider: implicit-any warning persisted, policy reversed
- **Task:** Fix "Parameter 'index' implicitly has an 'any' type" warning on `goTo(index)` in `src/components/testimonials.astro` — the JSDoc fix from the previous entry didn't actually resolve it.
- **Owner:** PM (CLAUDE.md policy update) + Full-Stack Developer (code revert)
- **Status:** Done
- **Notes:**
  - **Escalated to Andrew:** investigating why JSDoc didn't suppress the warning turned up that two other shipped components — `case-study-compare-slider.astro` and `case-study-video.astro` — already use real TypeScript syntax (type annotations, generics, non-null assertions) in their inline `<script>` blocks. CLAUDE.md's "no TypeScript" hard constraint didn't match actual practice.
  - Andrew chose to match the existing convention rather than keep fighting it with JSDoc or clean up the other two components.
  - PM updated CLAUDE.md's hard-constraints table directly (not owned by any single specialist) — replaced "No TypeScript" with a note permitting type annotations/generics/non-null assertions inside `.astro` `<script>` blocks, still disallowing separate `.ts` files or TS-only npm packages.
  - Full-Stack Developer reverted `goTo` to `function goTo(index: number)`, removed the JSDoc comment, and explicitly typed the `keydown` handler's `(e: KeyboardEvent)` param for consistency with the `(e: PointerEvent)` convention in `case-study-compare-slider.astro`.
  - Agent independently verified the CLAUDE.md change on disk before trusting it, and again declined to install `@astrojs/check` for a full type-check pass — correct call, no new package.
  - Net effect: the earlier "strip TypeScript" fix (see prior task-log entry) is superseded — testimonials.astro now matches the rest of the codebase's convention.

## 2026-07-17 — Testimonial slider: hover doesn't reliably pause auto-advance
- **Task:** Fix bug in `src/components/testimonials.astro` — auto-slide should stay paused whenever the mouse is hovering the slider, so visitors get enough time to read.
- **Owner:** Full-Stack Developer
- **Status:** Done — committed (`534e97f`) and pushed to origin/main
- **Notes:**
  - Root cause found: `startAuto()` is called unconditionally at the end of every dot-click, prev/next-click, and keydown handler, regardless of hover state. If a visitor interacts with the controls while still hovering, the 5s auto-advance timer silently restarts underneath them, since no fresh `mouseenter`/`mouseleave` pair fires to correct it.
  - The base hover listeners (`mouseenter`→`stopAuto`, `mouseleave`→`startAuto` on `#testi-slider`) were already correct — confirmed the CSS grid-stacking/`pointer-events` theory in the original bug report doesn't hold up.
  - Fix approved by PM as routine (in-territory, no new route/token/package) — no escalation to Andrew needed.
  - Bundled in a small related cleanup: the script had TypeScript type annotations (`index: number`, `e: KeyboardEvent`), which violates CLAUDE.md's "no TypeScript" hard constraint. Stripping those in the same edit since it's the same two lines.
  - **Infra note:** the actual `fullstack-developer` subagent isn't loaded yet this session — `.claude/agents/` was created mid-session and Claude Code's file watcher only picks up agent directories that existed at session start. Used `general-purpose` as a stand-in for this task, briefed with the fullstack-developer's territory/rules inline. **A Claude Code restart is needed before the named subagents (designer, fullstack-developer, seo-specialist, qa-engineer) become available.**

## 2026-07-17 — Team setup
- **Task:** Stand up the 5-agent workflow (PM + Designer, Full-Stack Developer, SEO Specialist, QA Engineer).
- **Owner:** PM
- **Status:** Done
- **Notes:**
  - Corrected two gaps found while briefing specialists against CLAUDE.md: the brief referenced `data-world` (retired attribute — real one is `data-theme`) and CLAUDE.md §10/§11 (GSAP rules, neon-sign button exception), which didn't exist as numbered sections yet. Escalated to Andrew; he confirmed `data-theme` is correct and that the missing content should be sourced from the actual code rather than invented.
  - Added CLAUDE.md §10 (GSAP animation rules, sourced from `public/scripts/gsap.js`) and §11 (neon-sign button color exception, sourced from `src/styles/andrew-ui-kit.html`).
  - Created `docs/team-structure.md` (durable reference for roles/territory/communication flow/plan-approval rules).
  - Created subagent definitions: `.claude/agents/designer.md`, `.claude/agents/fullstack-developer.md`, `.claude/agents/seo-specialist.md`, `.claude/agents/qa-engineer.md` — all Sonnet model.
  - No first work task assigned yet — awaiting Andrew's first request.
