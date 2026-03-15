#!/bin/bash
# Remind about update log on session end
set -e

TODAY=$(date +%Y-%m-%d)
LOG_DIR="/home/ubuntu/corthex-v2/.claude/updates"
mkdir -p "$LOG_DIR"

# Check if today's log exists
if ! ls "$LOG_DIR"/${TODAY}-*.md 1>/dev/null 2>&1; then
  echo "⚠️ REMINDER: No update log for today ($TODAY). Create one at .claude/updates/${TODAY}-topic.md"
fi

# Also run cleanup
/home/ubuntu/corthex-v2/.claude/hooks/cleanup.sh 2>/dev/null || true

exit 0
