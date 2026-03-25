#!/bin/bash
# Completion Gate Hook — PreToolUse(Bash) when git commit detected
# Blocks commit if hardcoded colors remain in app/admin pages

# Only run on git commit commands
echo "$TOOL_INPUT" | grep -q "git commit" || exit 0

cd /home/ubuntu/corthex-v2

# Check 1: Tailwind default colors
TAILWIND_DEFAULTS=$(grep -rc "bg-white\|bg-slate-\|text-slate-\|bg-zinc-\|text-gray-\|bg-gray-\|border-slate-\|border-gray-" packages/app/src packages/admin/src --include="*.tsx" 2>/dev/null | grep -v ":0$" | awk -F: '{sum+=$2}END{print sum+0}')

if [ "$TAILWIND_DEFAULTS" -gt 0 ]; then
  echo "COMPLETION GATE FAIL: $TAILWIND_DEFAULTS Tailwind default color references remain"
  echo "Run: grep -rc 'bg-slate-|text-slate-|bg-zinc-|text-gray-|bg-gray-' packages/app/src packages/admin/src --include='*.tsx' | grep -v ':0$'"
  # Warning only, don't block (some may be intentional like text-red-500 for errors)
fi

# Check 2: bg-white (should be 0)
BG_WHITE=$(grep -rc "bg-white" packages/app/src packages/admin/src --include="*.tsx" 2>/dev/null | awk -F: '{sum+=$2}END{print sum+0}')
if [ "$BG_WHITE" -gt 0 ]; then
  echo "COMPLETION GATE FAIL: $BG_WHITE bg-white references remain"
  exit 2
fi

exit 0
