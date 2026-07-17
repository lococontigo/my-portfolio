# Team structure — 5-agent Claude Code workflow

How Andrew's portfolio work is organized across Claude Code sessions. This is the durable reference; the PM (main session) re-reads this and `CLAUDE.md` before assigning any task. See [`docs/agent-teams-reference.md`](agent-teams-reference.md) for why this uses **subagents**, not the experimental agent-teams feature: no specialist here needs to message another specialist directly — everything routes through the PM, which is exactly the subagent report-back model.

## Roster

| # | Role | Owns | Model |
|---|---|---|---|
| 0 | **Project Manager** (main session, talks to Andrew) | `docs/task-log.md` | — |
| 1 | **Designer** (`.claude/agents/designer.md`) | `src/styles/tokens.css`, `src/styles/typography.css`, `src/styles/global.css`, `src/styles/animations.css`, `docs/design-decisions.md` | Sonnet |
| 2 | **Full-Stack Developer** (`.claude/agents/fullstack-developer.md`) | `src/components/`, `src/layouts/`, `src/pages/`, `astro.config.mjs`, `public/scripts/gsap.js`, `public/scripts/contact.js` | Sonnet |
| 3 | **SEO Specialist** (`.claude/agents/seo-specialist.md`) | MDX frontmatter in `src/pages/work/*.mdx`, `public/robots.txt`, sitemap considerations, alt-text conventions, `docs/seo-checklist.md` | Sonnet |
| 4 | **QA Engineer** (`.claude/agents/qa-engineer.md`) | `docs/qa-reports/` only — no production code | Sonnet |

## File territory
No agent edits another agent's owned files. A request that falls outside an agent's territory goes back to the PM, who routes it to the correct owner. This is enforced by instruction in each subagent's system prompt, **not** by tool-level sandboxing — Claude Code's `tools` frontmatter field restricts which *tools* a subagent can use, not which *paths* within an allowed tool. Discipline here is convention, and the PM should treat an agent editing outside its lane as a process violation to flag, not silently correct.

## Communication flow
- Andrew speaks only to the PM. The PM speaks to specialists directly (via the `Agent` tool); specialists never message each other.
- **Designer** starts first — no dependencies. PM confirms `tokens.css` is stable before greenlighting Full-Stack work that depends on it.
- **SEO Specialist** starts in parallel with the Designer — no dependency.
- **Full-Stack Developer** starts once the PM confirms tokens are stable, and works in parallel with SEO from that point.
- **QA** reviews continuously as work lands, but the PM triggers a final full review pass only once Designer + Full-Stack + SEO all report done on a given task.
- Every specialist reports completion to the PM, not to Andrew directly. The PM summarizes and reports to Andrew in plain language — raw agent output only on request.

## Plan approval mode
Every specialist submits a plan before writing or editing any file (this mirrors CLAUDE.md's existing "explain your plan, wait for confirmation" rule, applied per-specialist).

- **PM approves routine plans** — work that fits an established pattern within an agent's territory (e.g. "add alt text to a case study image," "adjust a spacing value using an existing token").
- **PM escalates to Andrew** before approving anything that:
  - adds a new page/route
  - changes a token's actual value
  - introduces a new npm package
  - reflects a QA finding that fails WCAG or breaks a world
- When in doubt, escalate — the PM doesn't guess on Andrew's behalf.

## Pre-approved tools
File read/write within each agent's owned territory, and `npm run dev` / `npm run build` for verification, are pre-approved — no need to escalate routine use of these.

## Team size ceiling
5 agents total (PM + 4 specialists). Do not spin up additional subagents beyond this roster without asking Andrew first.

## Notes / corrections made when this was set up (2026-07-17)
- The brief referred to `data-world="dark"/"light"` — the actual (and only correct, per CLAUDE.md) attribute is `data-theme`. `data-world` was explicitly retired; "world" is only the Astro prop name (`<BaseLayout world="dark">`), which Astro maps to `data-theme` in `base-layout.astro`. All specialists verify `data-theme`, never `data-world`.
- The brief referenced "CLAUDE.md section 10 (GSAP rules)" and "section 11 (neon-sign button color exception)" which didn't exist yet as numbered sections. They were written into `CLAUDE.md` from the actual source: GSAP rules from `public/scripts/gsap.js`'s existing `init*()` patterns, and the neon-sign exception from the `.btn-sign` / `.btn-sign-teal` components in `src/styles/andrew-ui-kit.html`.
