#!/bin/bash
# Block git commit if tsc fails — enforces CLAUDE.md "Before commit+push" rule
set -e

# Only run if the command is a git commit
if echo "$CLAUDE_TOOL_INPUT" | grep -q '"git commit\|"git.*commit'; then
  cd /home/ubuntu/corthex-v2

  # Run tsc check
  TSC_OUTPUT=$(npx tsc --noEmit -p packages/server/tsconfig.json 2>&1) || {
    echo "⛔ BLOCKED: tsc --noEmit failed. Fix type errors before committing:"
    echo "$TSC_OUTPUT" | head -20
    exit 1
  }
  echo "[tsc] clean — commit allowed"
fi

exit 0
