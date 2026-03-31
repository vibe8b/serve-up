#!/usr/bin/env bash
# install-git-template.sh
# ONE-TIME setup: installs Claude git template so every future git clone/init
# auto-bootstraps .claude/ in the new repo.
#
# Run once from terminal:
#   bash ~/.claude/scripts/install-git-template.sh

set -e

GLOBAL_CLAUDE="${HOME}/.claude"
GIT_TEMPLATE="${GLOBAL_CLAUDE}/git-template"

echo ""
echo "🔧 Installing Claude git template..."

# Create template dir
mkdir -p "${GIT_TEMPLATE}/hooks"

# Copy hooks
for hook in post-checkout post-merge post-clone; do
  if [ -f "${GLOBAL_CLAUDE}/git-template/hooks/${hook}" ]; then
    cp "${GLOBAL_CLAUDE}/git-template/hooks/${hook}" "${GIT_TEMPLATE}/hooks/${hook}"
    chmod +x "${GIT_TEMPLATE}/hooks/${hook}"
    echo "✅ Hook installed: ${hook}"
  fi
done

# Configure git to use this template globally
git config --global init.templateDir "${GIT_TEMPLATE}"
echo "✅ git config: init.templateDir = ${GIT_TEMPLATE}"

# Add shell function and env var to shell profile
detect_profile() {
  if [ -f "${HOME}/.zshrc" ]; then echo "${HOME}/.zshrc"
  elif [ -f "${HOME}/.bashrc" ]; then echo "${HOME}/.bashrc"
  elif [ -f "${HOME}/.bash_profile" ]; then echo "${HOME}/.bash_profile"
  else echo "${HOME}/.profile"
  fi
}

PROFILE=$(detect_profile)
MARKER="# claude-agent-system"

if ! grep -q "$MARKER" "$PROFILE" 2>/dev/null; then
  cat >> "$PROFILE" << 'SHELLEOF'

# claude-agent-system
export GIT_TEMPLATE_DIR="${HOME}/.claude/git-template"

# newproject <name> [template: ios|web|data|cli|ml]
newproject() {
  local name="${1:?Usage: newproject <name> [ios|web|data|cli|ml]}"
  local template="${2:-}"
  mkdir -p "$name" && cd "$name"
  git init
  bash "${HOME}/.claude/scripts/bootstrap-project.sh" "$name"
  echo ""
  echo "📁 $name/ ready. Open in Claude Code and run /metaprompt to generate agent roster."
  [ -n "$template" ] && echo "   Stack hint: $template — add to /metaprompt prompt for targeted agents."
}

# cloneproject <repo> — clone + auto-bootstrap
cloneproject() {
  local repo="${1:?Usage: cloneproject <owner/repo or url>}"
  git clone "https://github.com/$repo" 2>/dev/null || git clone "$repo"
  local dir=$(basename "$repo" .git)
  cd "$dir"
  bash "${HOME}/.claude/scripts/bootstrap-project.sh" "$dir"
}

SHELLEOF
  echo "✅ Shell profile updated: $PROFILE"
  echo "   Added: \$GIT_TEMPLATE_DIR, newproject(), cloneproject()"
else
  echo "⏭  Shell profile already configured (skipped)"
fi

echo ""
echo "────────────────────────────────────────────────"
echo "✅ Git template installed."
echo ""
echo "What happens now:"
echo "  • Every 'git clone' auto-runs post-checkout → bootstraps .claude/"
echo "  • Every 'git init' starts with the template baked in"
echo "  • 'newproject <name>' creates a new project with full Claude setup"
echo "  • 'cloneproject owner/repo' clones + bootstraps in one step"
echo ""
echo "Activate in current shell:"
echo "  source $PROFILE"
echo "────────────────────────────────────────────────"
echo ""
