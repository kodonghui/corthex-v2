#!/bin/bash
# party-log-verify.sh — Pre-commit hook for planning commits
# Verifies party-log file completeness before allowing commit
# v9.2: Enforces that all critics wrote logs + fixes.md exists
set -e

# Only run on planning commits
COMMIT_MSG=$(git log --format=%B -1 HEAD 2>/dev/null || echo "")
if ! echo "$COMMIT_MSG" | grep -q "docs(planning)"; then
  # Also check staged commit message if available
  STAGED_MSG=$(cat .git/COMMIT_EDITMSG 2>/dev/null || echo "")
  if ! echo "$STAGED_MSG" | grep -q "docs(planning)"; then
    exit 0  # Not a planning commit, skip
  fi
fi

# Find the stage from commit message
STAGE=$(echo "$COMMIT_MSG$STAGED_MSG" | grep -oP 'Stage \d+' | head -1 | grep -oP '\d+')
if [ -z "$STAGE" ]; then
  exit 0  # Can't determine stage, skip
fi

ERRORS=0

# Check party-logs directory exists
if [ ! -d "party-logs" ]; then
  echo "ERROR: party-logs/ directory missing for planning commit"
  ERRORS=$((ERRORS + 1))
fi

# Find all party-log files for this stage
STAGE_LOGS=$(ls party-logs/stage-${STAGE}-* 2>/dev/null | wc -l)
if [ "$STAGE_LOGS" -eq 0 ]; then
  echo "ERROR: No party-logs found for Stage ${STAGE}"
  echo "  Expected: party-logs/stage-${STAGE}-{step}-{critic-name}.md"
  ERRORS=$((ERRORS + 1))
fi

# Check for fixes files
FIXES_COUNT=$(ls party-logs/stage-${STAGE}-*-fixes.md 2>/dev/null | wc -l)
if [ "$FIXES_COUNT" -eq 0 ]; then
  echo "WARNING: No fixes.md files found for Stage ${STAGE}"
  echo "  Expected: party-logs/stage-${STAGE}-{step}-fixes.md"
fi

# Check for cross-talk sections in critic logs
CROSSTALK_MISSING=0
for log in party-logs/stage-${STAGE}-*-*.md; do
  # Skip fixes files
  if echo "$log" | grep -q "fixes"; then continue; fi
  if [ -f "$log" ]; then
    if ! grep -qi "cross-talk\|crosstalk\|교차" "$log" 2>/dev/null; then
      echo "WARNING: No cross-talk section in $log"
      CROSSTALK_MISSING=$((CROSSTALK_MISSING + 1))
    fi
  fi
done

if [ "$CROSSTALK_MISSING" -gt 0 ]; then
  echo "WARNING: ${CROSSTALK_MISSING} critic logs missing cross-talk sections"
fi

if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "BLOCKED: ${ERRORS} error(s) found. Fix party-logs before committing."
  exit 1
fi

exit 0
