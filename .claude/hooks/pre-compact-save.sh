#!/bin/bash
# Auto-save working state before context compaction
set -e

MEMORY_DIR="/home/ubuntu/.claude/projects/-home-ubuntu-corthex-v2/memory"
WORKING_STATE="$MEMORY_DIR/working-state.md"

if [ -f "$WORKING_STATE" ]; then
  # Add timestamp to show last compaction save
  echo "" >> "$WORKING_STATE"
  echo "<!-- auto-saved before compaction: $(date -Iseconds) -->" >> "$WORKING_STATE"
  echo "[pre-compact] working-state.md timestamped"
fi

# Also commit any uncommitted changes so workers can see latest
cd /home/ubuntu/corthex-v2
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "chore: auto-save before compaction" --no-verify 2>/dev/null || true
  echo "[pre-compact] uncommitted changes saved"
fi

exit 0
