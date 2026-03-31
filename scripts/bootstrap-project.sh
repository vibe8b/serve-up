#!/usr/bin/env bash
# bootstrap-project.sh
# Run once in any existing repo to install the full Claude agent system.
# Usage: bash bootstrap-project.sh [project-name]
# Or from global: bash ~/.claude/scripts/bootstrap-project.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GLOBAL_CLAUDE="${HOME}/.claude"
REPO_ROOT="${PWD}"
CLAUDE_DIR="${REPO_ROOT}/.claude"
PROJECT_NAME="${1:-$(basename "$REPO_ROOT")}"

echo ""
echo "🤖 Claude Project Bootstrap"
echo "   Project: $PROJECT_NAME"
echo "   Root:    $REPO_ROOT"
echo ""

# ── 1. Create .claude structure ────────────────────────────────────────────
mkdir -p "$CLAUDE_DIR/commands"
echo "✅ Created .claude/commands/"

# ── 2. Copy global files ───────────────────────────────────────────────────
files_copied=0
for f in MASTER_PROMPT.md CLAUDE.md; do
  if [ -f "$GLOBAL_CLAUDE/$f" ] && [ ! -f "$CLAUDE_DIR/$f" ]; then
    cp "$GLOBAL_CLAUDE/$f" "$CLAUDE_DIR/$f"
    echo "✅ Copied $f from global config"
    files_copied=$((files_copied + 1))
  elif [ -f "$CLAUDE_DIR/$f" ]; then
    echo "⏭  $f already exists — skipping"
  fi
done

# Copy commands (no overwrite)
if [ -d "$GLOBAL_CLAUDE/commands" ]; then
  for cmd in "$GLOBAL_CLAUDE/commands/"*.md; do
    fname=$(basename "$cmd")
    if [ ! -f "$CLAUDE_DIR/commands/$fname" ]; then
      cp "$cmd" "$CLAUDE_DIR/commands/$fname"
      echo "✅ Copied command: $fname"
      files_copied=$((files_copied + 1))
    fi
  done
fi

# ── 3. Write minimal CLAUDE.md if missing ─────────────────────────────────
if [ ! -f "$CLAUDE_DIR/CLAUDE.md" ]; then
  cat > "$CLAUDE_DIR/CLAUDE.md" << 'EOF'
# Project Instructions

## ⚡ Session Bootstrap
Read `.claude/MASTER_PROMPT.md` at session start. Apply all operating principles.
If AGENTS.md is missing, run `/metaprompt` to generate project-specific agent roster.

## Commands
- `/metaprompt` — generate hyperfocused agent roster for this project's stack
- `/todo [items]` — add tasks with T1/T2/T3 tier classification
- `/todo grind` — autonomous execution mode
- `/mockup` — generate UI mockup + email status report (iOS projects)

See global ~/.claude/CLAUDE.md for full instructions.
EOF
  echo "✅ Created minimal CLAUDE.md"
  files_copied=$((files_copied + 1))
fi

# ── 4. Write settings.local.json if GMAIL_APP_PASSWORD is set ─────────────
if [ -n "$GMAIL_APP_PASSWORD" ] && [ ! -f "$CLAUDE_DIR/settings.local.json" ]; then
  cat > "$CLAUDE_DIR/settings.local.json" << EOF
{
  "env": {
    "GMAIL_APP_PASSWORD": "$GMAIL_APP_PASSWORD"
  }
}
EOF
  echo "✅ Created settings.local.json with GMAIL_APP_PASSWORD"
fi

# Check global settings for GMAIL_APP_PASSWORD and copy
if [ ! -f "$CLAUDE_DIR/settings.local.json" ] && [ -f "$GLOBAL_CLAUDE/settings.local.json" ]; then
  cp "$GLOBAL_CLAUDE/settings.local.json" "$CLAUDE_DIR/settings.local.json"
  echo "✅ Copied settings.local.json from global config"
fi

# ── 5. Update .gitignore ───────────────────────────────────────────────────
GITIGNORE="${REPO_ROOT}/.gitignore"
if [ -f "$GITIGNORE" ]; then
  if ! grep -q "\.claude/settings\.local\.json" "$GITIGNORE"; then
    echo ".claude/settings.local.json" >> "$GITIGNORE"
    echo "✅ Added .claude/settings.local.json to .gitignore"
  fi
else
  echo ".claude/settings.local.json" > "$GITIGNORE"
  echo "✅ Created .gitignore with .claude/settings.local.json"
fi

# ── 6. Create scripts/ directory with send_mockup.py ──────────────────────
SCRIPTS_DIR="${REPO_ROOT}/scripts"
if [ -f "$GLOBAL_CLAUDE/scripts/send_mockup.py" ] && [ ! -f "$SCRIPTS_DIR/send_mockup.py" ]; then
  mkdir -p "$SCRIPTS_DIR"
  cp "$GLOBAL_CLAUDE/scripts/send_mockup.py" "$SCRIPTS_DIR/send_mockup.py"
  cp "$GLOBAL_CLAUDE/scripts/setup_gmail_creds.py" "$SCRIPTS_DIR/setup_gmail_creds.py" 2>/dev/null || true
  echo "✅ Copied scripts/send_mockup.py"
fi

# ── 7. Install git template hooks ─────────────────────────────────────────
if [ -d ".git" ]; then
  GIT_HOOKS="${REPO_ROOT}/.git/hooks"
  if [ -d "$GLOBAL_CLAUDE/git-template/hooks" ]; then
    for hook in "$GLOBAL_CLAUDE/git-template/hooks/"*; do
      hname=$(basename "$hook")
      cp "$hook" "$GIT_HOOKS/$hname"
      chmod +x "$GIT_HOOKS/$hname"
      echo "✅ Installed git hook: $hname"
    done
  fi
fi

# ── 8. Summary ────────────────────────────────────────────────────────────
echo ""
echo "────────────────────────────────────────"
echo "✅ Bootstrap complete for: $PROJECT_NAME"
echo "   Files added: $files_copied"
echo "   Commands: $(ls "$CLAUDE_DIR/commands/" 2>/dev/null | wc -l | tr -d ' ')"
echo ""
echo "Next: Open project in Claude Code and the agent system auto-activates."
echo "      Run /metaprompt to generate project-specific agent roster."
echo "────────────────────────────────────────"
echo ""
