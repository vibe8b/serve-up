---
description: Generate a pixel-accurate HTML mockup of all IRN screens and email it to eitanbarzeski@gmail.com
---

You are acting as **gfxgod** — a premium mobile UI design specialist. Your output must be production-grade, source-accurate, and visually polished.

## Step 1 — Load design skills

Read these files for design principles:
- `.agents/skills/mobile-design/SKILL.md`
- `.agents/skills/ui-ux-pro-max/SKILL.md`

## Step 2 — Read SwiftUI source (source of truth)

Read each of these files in full:
- `IronLog/IronLogApp.swift` — tab bar structure, AccentColorOption enum, MainAppTab enum
- `IronLog/Views/Onboarding/LoginView.swift` — login screen layout, gradients, field structure
- `IronLog/Views/Dashboard/DashboardView.swift` — dashboard layout, tile grid, start workout btn, templates/recent split
- `IronLog/Views/Log/LogView.swift` — log list, session card, exercise preview rows
- `IronLog/Views/Settings/MoreView.swift` — profile header, workspace nav rows, stats

If there is an active workout view, also read:
- `IronLog/Views/Routines/RoutineListView.swift`

## Step 3 — Generate high-fidelity HTML mockup

Build a **single self-contained HTML file** with:

**iPhone shells:** 393×852px, border-radius 54px, Dynamic Island, status bar "9:41", tab bar
**Dark theme:**
- Background: `#0D0D12`
- Surface: `#1C1C1F` (systemGray6)
- Raised surface: `#242428`
- Border: `rgba(255,255,255,0.09)`

**Accent:** Default is `lavender` = `rgb(176, 156, 240)` = `#B09CF0`

**5 tabs** (exactly from `MainAppTab` enum):
- Exercises · dumbbell.fill
- Stats · chart.bar.fill
- Home · house
- Log · calendar
- Profile · person.fill

**Screens to render** (match actual Swift layouts):
1. Login — layered gradient bg, orange+blue radial glows, IRN mascot, credential fields card, Log In + Apple Sign In side-by-side
2. Dashboard — flask menu toolbar, tile grid (AI Coach + Training Blocks), accentColor Start Workout pill, Templates | Recent HStack split
3. Active Workout — inline nav title (time-of-day session name), timer in accent color, exercise blocks with set logging grid (# / Prev / kg / Reps / ✓)
4. Log — insetGrouped list, month section headers, session cards with mini-stats + exercise preview dots
5. Profile — 52px avatar + camera badge, Sessions/Streak/Since stats row, Calculators+Settings quick row, Workspace nav list

**Design rules (gfxgod):**
- Be opinionated — improve weak spacing/hierarchy while staying source-accurate
- Every detail matters: correct font weights, dividers, opacity levels, corner radii
- Accent glow on active tab icon: `filter: drop-shadow(0 0 6px #B09CF0)`
- Session cards have `1px solid rgba(176,156,240,0.22)` border (from accentColor.opacity(0.2) in code)

## Step 4 — Save HTML to temp file

```bash
MOCKUP_PATH="/tmp/irn_mockup_$(date +%Y%m%d_%H%M%S).html"
cat > "$MOCKUP_PATH" << 'HTMLEOF'
<paste generated HTML here>
HTMLEOF
echo "Saved to $MOCKUP_PATH"
```

Or write the file directly using the Write tool, then note its path.

## Step 5 — Email it

```bash
python3 scripts/send_mockup.py "$MOCKUP_PATH"
```

If `GMAIL_APP_PASSWORD` is not set, remind the user to run the one-time setup:
```bash
python3 scripts/setup_gmail_creds.py
```

## Step 6 — Report

Print:
```
✅ IRN mockup generated and emailed to eitanbarzeski@gmail.com
   Screens: Login · Dashboard · Active Workout · Log · Profile
   File: <path>
```
