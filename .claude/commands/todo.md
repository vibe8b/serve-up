---
description: Parse tasks into todo.md with tier classification and batch tracking
---

Parse the provided task list and append to `todo.md`:

```
## BATCH-{NNN} | {YYYY-MM-DD} | "{batch summary, max 10 words}"
| ID | Task | Tier | Agent | Status | Notes |
|----|------|------|-------|--------|-------|
| {NNN}-1 | Task description | T2 | Builder | pending | |
```

**Tier rules:**
- T1 (< 5 min): trivial. Haiku.
- T2 (5–30 min): moderate. Sonnet.
- T3 (30+ min): complex. Opus.

Reply: `Batch BATCH-{NNN}: N items (NxT3, NxT2, NxT1). Starting: {NNN}-1 [T?/Agent]`
Then immediately start the first item.

**Sub-commands:**
- `/todo list` — all batches + completion % only
- `/todo grind` — autonomous: execute all pending sequentially, no pausing, mark done, report when clear
- `/todo status` — exec report: KPIs + per-item rationale + one optimization each

**Rules:** Append only. Never overwrite. Create `todo.md` on first use. Completed items stay.
