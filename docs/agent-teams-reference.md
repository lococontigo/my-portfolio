# Claude Code: Agent Teams & Subagents — Reference

Summary of Anthropic's official documentation, for future reference when using Claude Code on this project.

Sources:
- https://code.claude.com/docs/en/agent-teams
- https://code.claude.com/docs/en/sub-agents

---

## Subagents vs. Agent Teams — which to use

|  | Subagents | Agent teams |
|---|---|---|
| Context | Own context window; result returns to caller | Own context window; fully independent |
| Communication | Reports back to the main agent only | Teammates message each other directly |
| Coordination | Main agent manages all work | Shared task list, self-coordinating |
| Best for | Focused tasks where only the result matters | Complex work needing discussion/collaboration |
| Token cost | Lower (summarized back) | Higher (each teammate is a full Claude instance) |

**Rule of thumb:** use subagents for quick, focused workers that report back (research, isolating verbose output, enforcing tool restrictions). Use agent teams only when workers genuinely need to talk to each other and self-coordinate — this project rarely needs that.

---

## Subagents

### What they are
Specialized AI assistants that run in their own context window with a custom system prompt, specific tool access, and independent permissions. Claude delegates to a subagent when a task matches its `description`.

Built-in subagents: **Explore** (read-only search), **Plan** (research during plan mode), **general-purpose** (full tools, complex multi-step work), plus helpers like `statusline-setup` and `claude-code-guide`.

### File format
Markdown file with YAML frontmatter + system prompt body:

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices. Use proactively after code changes.
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

Only `name` and `description` are required.

### Scope (where to save it) — priority order
| Location | Scope | Priority |
|---|---|---|
| Managed settings | Org-wide | 1 (highest) |
| `--agents` CLI flag | Session only | 2 |
| `.claude/agents/` | Current project | 3 |
| `~/.claude/agents/` | All projects | 4 |
| Plugin's `agents/` | Where plugin enabled | 5 |

- Project subagents (`.claude/agents/`) — check into version control, scoped to this repo.
- User subagents (`~/.claude/agents/`) — personal, available everywhere.
- Both scan recursively (subfolders like `agents/review/` are fine — identity comes from `name`, not path).
- New `agents/` directory requires a Claude Code restart to be detected; edits to existing files are picked up live within seconds.

### Key frontmatter fields
| Field | Notes |
|---|---|
| `tools` | Allowlist. Omit to inherit all tools. Use `Skill` field (not listing `Skill` tool) to preload skill content. |
| `disallowedTools` | Denylist, removed from inherited/specified tools. Applied before `tools`. |
| `model` | `sonnet`, `opus`, `haiku`, `fable`, full model ID, or `inherit` (default). |
| `permissionMode` | `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`. Parent's `bypassPermissions`/`acceptEdits`/`auto` mode takes precedence and can't be overridden by the subagent. |
| `maxTurns` | Cap on agentic turns. |
| `skills` | Preload full skill content at startup. |
| `mcpServers` | Scope MCP servers to just this subagent (inline or by name reference). |
| `hooks` | Lifecycle hooks (`PreToolUse`, `PostToolUse`, `Stop`→`SubagentStop`) scoped to this subagent only. |
| `memory` | `user` / `project` / `local` — persistent memory directory across sessions. `project` is the recommended default (shareable via git). |
| `background` | `true` to force background execution. Defaults to Claude's choice (background by default as of v2.1.198). |
| `effort` | Overrides session effort level for this subagent. |
| `isolation` | `worktree` — runs in an isolated git worktree, auto-cleaned if no changes made. |
| `color` | Display color in task list/transcript. |

### Tool access control
- `tools` = allowlist; `disallowedTools` = denylist. If both set, `disallowedTools` applies first.
- MCP server-level patterns supported: `mcp__<server>` or `mcp__<server>__*`.
- Some tools are never available to subagents regardless of `tools`: `AskUserQuestion`, `EnterPlanMode`, `ExitPlanMode` (unless `permissionMode: plan`), `ScheduleWakeup`, `WaitForMcpServers`.
- `Agent` must be explicitly included in `tools` for a subagent to spawn nested subagents (max depth: 5 levels).
- To restrict which subagent *types* an agent running as main thread (`--agent`) can spawn: `tools: Agent(worker, researcher)`.

### Invoking subagents
1. **Natural language** — name it in the prompt; Claude decides whether to delegate.
2. **@-mention** — `@agent-<name>` guarantees that subagent runs.
3. **Session-wide** — `claude --agent <name>` or `"agent": "<name>"` in settings makes the whole session run as that subagent.

### Context passed to a subagent (non-fork)
- Its own system prompt + environment details (not the full Claude Code system prompt).
- The delegation/task message Claude writes.
- Full CLAUDE.md hierarchy (**except** built-in Explore/Plan, which skip it for speed).
- Git status snapshot from session start (also skipped by Explore/Plan).
- Preloaded skills (if `skills` field set).
- **Not passed:** conversation history, output style, auto memory (unless `memory` field set), current context window size (subagent gets its own model's window).

### Forking (`/fork`)
A fork inherits the *entire* conversation so far (system prompt, tools, model, message history) instead of starting fresh — useful for a side task that would need too much re-explaining. Requires `CLAUDE_CODE_FORK_SUBAGENT=1` (or `/fork` directly, enabled by default from v2.1.161). A fork can't spawn further forks.

### Best practices (from official docs)
- **Design focused subagents** — each should excel at one task.
- **Write detailed descriptions** — Claude uses `description` to decide when to delegate; include "use proactively" to encourage automatic use.
- **Limit tool access** — grant only what's needed, for security and focus.
- **Check project subagents into version control** so the team shares them.
- Use subagents to **isolate high-volume output** (test runs, log processing, doc fetches) so verbose output doesn't pollute the main context.
- Use subagents for **parallel independent research** (e.g., explore auth/database/API modules simultaneously) — but each returned summary still costs main-context tokens, so don't run too many at once.
- Prefer the **main conversation** when: task needs frequent back-and-forth, phases share heavy context (plan → implement → test), it's a quick targeted change, or latency matters.

---

## Agent Teams

### Enabling (disabled by default — experimental)
```json
// settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```
Without this, no team is set up, and Claude won't spawn or propose teammates.

### Architecture
| Component | Role |
|---|---|
| Team lead | Main session; spawns teammates, coordinates, synthesizes results |
| Teammates | Independent Claude Code instances, own context windows |
| Task list | Shared work items teammates claim/complete (file-locked to prevent race conditions) |
| Mailbox | Per-agent JSON inbox for direct messaging (`~/.claude/teams/{team}/inboxes/{agent}.json`) |

- One team per session, scoped to that session (no nesting, no named teams, no team-sharing across sessions).
- Teammates **cannot** spawn their own teammates — only the lead manages the team.
- Team config is auto-generated at `~/.claude/teams/{team-name}/`; don't hand-edit it, it's overwritten on state updates.
- Task list persists at `~/.claude/tasks/{team-name}/` (survives session end, subject to `cleanupPeriodDays`).

### Starting a team
Just describe the task and roles in natural language:
```text
Spawn three teammates to explore this from different angles:
one on UX, one on technical architecture, one playing devil's advocate.
```
Claude may use subagents instead if the task doesn't need real collaboration — ask explicitly for "an agent team" if that's what you want.

### Using existing subagent definitions as teammates
Reference a subagent type by name when spawning:
```text
Spawn a teammate using the security-reviewer agent type to audit the auth module.
```
The teammate inherits that definition's `tools` allowlist and `model`; the definition body is appended as extra instructions. Note: `skills` and `mcpServers` frontmatter fields are **not** applied on this path — teammates load skills/MCP from project/user settings normally.

### Display modes
- **In-process** (default): all teammates in one terminal, agent panel below the prompt.
- **Split panes**: one pane per teammate — requires `tmux` or iTerm2 with the `it2` CLI. Not supported in VS Code's integrated terminal, Windows Terminal, or Ghostty.
- Set via `teammateMode` in `~/.claude/settings.json` or `--teammate-mode` flag per session.

### Permissions
- Teammates start with the **lead's** permission mode (if lead uses `--dangerously-skip-permissions`, so do all teammates). Per-teammate mode can be changed after spawn, not at spawn time.
- Teammate permission prompts surface in the **lead session** — approve them there.
- A teammate cannot approve permissions or relay consent on another's behalf; relayed "approvals" are treated as untrusted input.

### Task coordination
- Tasks: pending → in progress → completed, with dependency blocking.
- Lead can assign explicitly, or teammates self-claim unblocked work.
- Use hooks (`TeammateIdle`, `TaskCreated`, `TaskCompleted`) to enforce quality gates — exit code 2 to block/send feedback.

### Best practices (from official docs)
- **Give teammates full context in the spawn prompt** — they don't inherit the lead's conversation history (only CLAUDE.md, MCP, skills).
- **Team size**: start with 3–5 teammates; 5–6 tasks per teammate keeps everyone busy without overload. More teammates ≠ proportionally faster (diminishing returns + coordination overhead).
- **Size tasks appropriately**: not so small that coordination costs exceed benefit; not so large that a teammate goes too long without checking in.
- **Avoid file conflicts** — assign each teammate a distinct set of files/ownership area.
- **Start with research/review tasks** (not parallel implementation) if new to agent teams — lower coordination risk.
- **Monitor and steer** — don't let a team run unattended too long; redirect early if an approach isn't working.
- **Tell the lead to wait** for teammates to finish rather than implementing itself, if it starts doing the work solo.

### Strongest use cases
- **Research and review** — independent investigation of different aspects, then cross-challenge findings.
- **New modules/features** — each teammate owns a separate piece.
- **Debugging with competing hypotheses** — teammates test different theories in parallel and try to disprove each other (fights anchoring bias from sequential investigation).
- **Cross-layer coordination** — frontend/backend/tests owned by different teammates.

Avoid agent teams for: sequential tasks, same-file edits, or work with many interdependencies — a single session or subagents are more efficient there.

### Known limitations (experimental feature)
- No session resumption for in-process teammates (`/resume`/`/rewind` don't restore them).
- Task status can lag — teammates sometimes fail to mark tasks complete, blocking dependents.
- Shutdown can be slow (teammates finish current tool call first).
- One team per session; no nested teams; lead role is fixed for the session's lifetime.
- No background subagents from in-process teammates (their subagents run in foreground only).
- Split-pane mode unsupported in VS Code integrated terminal, Windows Terminal, Ghostty.

---

## Practical takeaway for this project

This is a solo Astro portfolio project with a small, tightly-scoped codebase — most tasks here (styling fixes, section builds, content edits) are **sequential and touch shared files** (`tokens.css`, `global.css`, single `.astro` pages), which is exactly the profile the docs say to avoid for agent teams. Subagents (e.g., `Explore` for locating code, or a custom read-only reviewer) are the more relevant tool here; agent teams would mostly add token overhead without a real collaboration benefit unless doing large multi-page parallel work (e.g., building out several independent case-study pages at once).
