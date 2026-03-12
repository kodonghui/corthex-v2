#!/usr/bin/env bash
# E10: engine/ 경계 CI 검증
# engine/ 내부 모듈(hooks, soul-renderer, model-selector, sse-adapter)을
# routes/, lib/ 등 외부에서 직접 import하면 실패
# 허용: engine/agent-loop, engine/types만

set -euo pipefail

SEARCH_DIRS="packages/server/src/routes/ packages/server/src/lib/ packages/server/src/middleware/ packages/server/src/services/ packages/server/src/tool-handlers/"
VIOLATIONS=0

ALLOWED_CALLERS="hub.ts"

check_pattern() {
  local pattern="$1"
  local label="$2"
  local hits
  hits=$(grep -rn "$pattern" $SEARCH_DIRS 2>/dev/null | grep -v "$ALLOWED_CALLERS" || true)
  if [ -n "$hits" ]; then
    echo "$hits"
    echo "ERROR: $label"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
}

check_pattern "from.*engine/hooks/" "Direct hook import from outside engine/"
check_pattern "from.*engine/soul-renderer" "Direct soul-renderer import from outside engine/"
check_pattern "from.*engine/model-selector" "Direct model-selector import from outside engine/"
check_pattern "from.*engine/sse-adapter" "Direct sse-adapter import from outside engine/"

# Story 15.3: semantic-cache E8 boundary check (D19)
# engine/semantic-cache.ts must only be imported by engine/agent-loop.ts
SEMANTIC_VIOLATIONS=$(grep -rn "engine/semantic-cache" packages/server/src --include="*.ts" 2>/dev/null \
  | grep -v "engine/agent-loop.ts" \
  | grep -v "engine/semantic-cache.ts" \
  | grep -v "__tests__/" || true)
if [ -n "$SEMANTIC_VIOLATIONS" ]; then
  echo "$SEMANTIC_VIOLATIONS"
  echo "ERROR: engine/semantic-cache imported outside agent-loop.ts (E8 violation)"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

if [ "$VIOLATIONS" -gt 0 ]; then
  echo ""
  echo "FAIL: $VIOLATIONS engine boundary violation(s) found (E8, E10)"
  echo "Allowed imports: engine/agent-loop, engine/types only"
  exit 1
fi

echo "OK: No engine boundary violations"
