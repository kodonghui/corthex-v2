#!/usr/bin/env bash
# Toast-Without-API Lint Check
# Detects onClick handlers that show success toast but never call api.post/mutate
# This catches the "onboarding department Add button" class of bugs

set -euo pipefail

VIOLATIONS=0
REPORT=""

for file in $(find packages/admin/src packages/app/src -name "*.tsx" -type f 2>/dev/null); do
  # Find lines with addToast.*success
  while IFS=: read -r line_num line_content; do
    [ -z "$line_num" ] && continue
    
    # Look backwards 20 lines for the onClick handler start
    start=$((line_num - 20))
    [ "$start" -lt 1 ] && start=1
    
    # Extract the block from onClick to the toast
    block=$(sed -n "${start},${line_num}p" "$file")
    
    # Check if block contains api.post, api.put, api.delete, mutate, mutation
    if echo "$block" | grep -qE 'api\.(post|put|delete|patch)|\.mutate\(|Mutation\.mutate'; then
      continue  # Has API call — OK
    fi
    
    # Check if this is inside a useMutation onSuccess (which is fine — the mutation IS the API call)
    if echo "$block" | grep -qE 'onSuccess|onError'; then
      continue  # Inside mutation callback — OK
    fi
    
    # Check if it's a navigation-only success or local utility (export, copy, download)
    if echo "$block" | grep -qE 'navigate\(|window\.location|exportTo|clipboard|download|window\.open|window\.print'; then
      continue  # Local action toast — OK
    fi
    
    # VIOLATION: success toast without API call in the surrounding block
    VIOLATIONS=$((VIOLATIONS + 1))
    short_file="${file#packages/}"
    REPORT="${REPORT}\n  WARNING: ${short_file}:${line_num} — success toast without visible API call in preceding 20 lines"
    
  done < <(grep -n "addToast.*type.*success\|addToast.*success.*type" "$file" 2>/dev/null || true)
done

if [ "$VIOLATIONS" -gt 0 ]; then
  echo "Toast-Without-API Check: ${VIOLATIONS} potential issue(s) found"
  echo -e "$REPORT"
  echo ""
  echo "BLOCKING: Fix violations before committing. If false positive, add to exclusion patterns above."
  echo "True positives = UI shows success but no actual API call (like the onboarding dept bug)"
fi

exit 2  # BLOCK on violations — Phantom Success is a critical bug class
