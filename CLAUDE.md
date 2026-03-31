# Project Instructions

## Style
- Technical, direct, no filler. Say it how it is.
- Analyze from every angle, deliver the most logical response.
- Tables over paragraphs, bullets over prose, code over explanation.
- Never ask "would you like me to..." — just execute.
- Never recap what you're about to do. Do it, then summarize what you did.

## Workflow
- Exhaust local sources before web/API. Don't waste tokens.
- Run independent tool calls in parallel. Never serialize what can parallelize.
- Make reasonable assumptions. Only pause for genuinely ambiguous or irreversible decisions.
- If blocked, try 2-3 alternatives before asking.
- Verify your own work: run tests, check outputs, diff files.
- Self-review after every change: re-read modified code, check for regressions, confirm UI/UX matches existing patterns unless explicitly told otherwise.
- When review identifies speed or memory optimizations, implement them — but never at the expense of app performance or UX.
- Read SKILL.md files before creating documents (docx, pptx, xlsx, pdf).

## Agent Delegation
- See @AGENTS.md for full role definitions.
- **T1** (trivial, <5 min): Do inline, fast, no overthinking. Recommend **Haiku**.
- **T2** (moderate, 5-30 min): Plan briefly, execute, verify. Recommend **Sonnet**.
- **T3** (complex, 30+ min): Plan thoroughly, edge cases, test, review. Recommend **Opus**.

## /TODO System

**`/todo [items]`** — Parse tasks, classify by tier, assign agent, append to `todo.md`:
```
## BATCH-001 | 2026-03-30 | "batch summary max 10 words"
| ID | Task | Tier | Agent | Status | Notes |
| 001-1 | Task description | T2 | Builder | pending | |
```
Reply with: `Batch BATCH-001: 3 items (1xT3, 1xT2, 1xT1). Starting: 001-1 [T3/Architect]`

**`status`** — Exec-level two-section report:
```
## KPIs
Done: X/X (X%) | Blocked: X | Active: BATCH-XXX | ETA: ~X min

## BATCH-XXX | "summary"
| ID | Task | Status | Rationale | Optimization |
| 001-1 | Auth system | done | JWT + refresh, 3 endpoints | Rate limit /login |
| 001-2 | Dashboard | wip | Charts wired, filters next | Lazy-load chart lib → -40% bundle |
```
Include rationale (why the work was split this way, 1 sentence) and one optimization per item.

**`/todo list`** — All batches, completion percentages only.

**`/todo grind`** — Autonomous execution mode (ralph-wiggum pattern):
1. Read `todo.md`, identify all `pending` items
2. Work through every item sequentially without stopping or asking questions
3. For each item: execute → verify → commit → mark `done` → move to next
4. If an item fails after 3 attempts, mark `blocked` with reason, skip to next
5. After each item, re-read `todo.md` to check for new items added mid-grind
6. When all items are `done` or `blocked`, output final `/todo status`
7. IMPORTANT: Do not stop between items. Do not ask for confirmation. Grind until the list is clear.

**Rules:** Append only (never overwrite). Completed items stay (audit trail). Create `todo.md` on first use.

## Dev Focus: Web, iOS & Vibe Coding
- Default stack: **React/Next.js + Tailwind + shadcn/ui** (web), **SwiftUI** (iOS).
- Ship fast. MVP first, polish second. Quick turnarounds over perfect architecture.
- Every feature = working prototype before refactoring. No premature abstraction.
- Mobile-first responsive. Dark mode support by default.
- Use `ui-ux-pro-max` skill for design system generation on any UI work.

## Required Skills (install before first run)
```bash
# UI/UX design intelligence (67 styles, 161 palettes, 57 font pairings)
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill

# SwiftUI best practices (Paul Hudson) — iOS 26+, Swift 6.2+
npx skills add https://github.com/twostraws/swiftui-agent-skill --skill swiftui-pro

# Clean code, frontend, mobile design skills
npx antigravity-awesome-skills
```

| Skill | Source | Use When |
|-------|--------|----------|
| `ui-ux-pro-max` | nextlevelbuilder | Any UI/UX work — auto-generates design systems, palettes, typography |
| `swiftui-pro` | twostraws | All SwiftUI work — fixes deprecated APIs, accessibility, performance. Trigger: `/swiftui-pro` |
| `clean-code` | sickn33/antigravity | Code reviews, refactors, quality enforcement |
| `frontend-design` | sickn33/antigravity | Web component design, layout, responsive patterns |
| `mobile-design` | sickn33/antigravity | SwiftUI/React Native screens, mobile UX patterns |

## Process Checklist (every feature)
1. Parse requirements → break into actionable items
2. Scaffold structure (files, routes, components)
3. Build core logic — working, not pretty
4. Wire up UI with design skill
5. Test (run it, screenshot it, verify it)
6. Ship → update `todo.md`
