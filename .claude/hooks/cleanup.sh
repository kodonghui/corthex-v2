#!/bin/bash
# CORTHEX stale resource cleanup — runs on every session start
set -e

PROJECT_DIR="/home/ubuntu/corthex-v2"

# 1. Prune stale git worktrees
git -C "$PROJECT_DIR" worktree prune 2>/dev/null || true

# 2. Kill old tmux sessions (tab-* except current attached one)
ATTACHED=$(tmux list-sessions -F "#{session_name} #{session_attached}" 2>/dev/null | grep " 1$" | awk '{print $1}')
for session in $(tmux list-sessions -F "#{session_name}" 2>/dev/null | grep -E "^tab-"); do
  if [ "$session" != "$ATTACHED" ]; then
    tmux kill-session -t "$session" 2>/dev/null || true
  fi
done

# 3. Kill stale bash panes (not running claude) in main session
# Keep panes running claude processes, kill orphan bash panes
for pane in $(tmux list-panes -t claude -F "#{pane_index} #{pane_current_command}" 2>/dev/null | grep " bash$" | awk '{print $1}'); do
  # Don't kill pane 0 (main)
  if [ "$pane" != "0" ]; then
    tmux kill-pane -t "claude:0.$pane" 2>/dev/null || true
  fi
done

echo "[cleanup] done: worktrees pruned, stale sessions killed"
