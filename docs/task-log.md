# Task log

Running log of every task assigned across the 5-agent team, owned by the PM. See `docs/team-structure.md` for roles/territory and `CLAUDE.md` for project rules.

**Format:** newest entries at the top. Each entry: date, task, owner(s), status, notes (escalations, blockers, plan-approval decisions).

---

## 2026-07-17 — Testimonial slider: hover doesn't reliably pause auto-advance
- **Task:** Fix bug in `src/components/testimonials.astro` — auto-slide should stay paused whenever the mouse is hovering the slider, so visitors get enough time to read.
- **Owner:** Full-Stack Developer
- **Status:** In progress (fix dispatched, awaiting implementation + verification)
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
