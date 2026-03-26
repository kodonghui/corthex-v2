#!/usr/bin/env bash
# Frontend-Backend Wiring Check
# Cross-references frontend api.post/put/delete calls with server route registrations
# Detects endpoints that frontend calls but server doesn't implement

set -euo pipefail

WARNINGS=0
REPORT=""

# Extract frontend API calls (endpoint paths)
FRONTEND_CALLS=$(grep -rohn "api\.\(post\|put\|delete\|patch\).*['\"][^'\"]*['\"]" \
  packages/admin/src packages/app/src --include="*.tsx" --include="*.ts" 2>/dev/null | \
  sed -n "s/.*['\"]\/\?\(api\/[^'\"]*\|admin\/[^'\"]*\)['\"].*/\1/p" | sort -u || true)

# Extract server route registrations
SERVER_ROUTES=$(grep -rohn "\.\(post\|put\|delete\|patch\|get\)(" \
  packages/server/src/routes --include="*.ts" 2>/dev/null | \
  sed -n "s/.*\.\(post\|put\|delete\|patch\|get\)(.*/\1/p" | sort -u || true)

# Simple count check — more detailed cross-reference needs AST parsing
FRONTEND_COUNT=$(echo "$FRONTEND_CALLS" | grep -c . 2>/dev/null || echo 0)
SERVER_COUNT=$(echo "$SERVER_ROUTES" | grep -c . 2>/dev/null || echo 0)

if [ "$FRONTEND_COUNT" -gt 0 ]; then
  echo "Wiring Check: ${FRONTEND_COUNT} frontend API calls found, ${SERVER_COUNT} server route methods found"

  # Check for common mismatches
  for call in $FRONTEND_CALLS; do
    # Normalize the path (remove /api prefix, query params)
    normalized=$(echo "$call" | sed 's|^api/||' | sed 's|\?.*||' | sed 's|/:[^/]*||g')
    if ! grep -qr "$normalized" packages/server/src/routes --include="*.ts" 2>/dev/null; then
      WARNINGS=$((WARNINGS + 1))
      REPORT="${REPORT}\n  WARNING: Frontend calls '${call}' but no matching server route found"
    fi
  done
fi

if [ "$WARNINGS" -gt 0 ]; then
  echo "Wiring Check: ${WARNINGS} potential mismatch(es)"
  echo -e "$REPORT"
  echo ""
  echo "These may be false positives (dynamic routes, proxy endpoints)."
fi

exit 0  # Warning only — not blocking (cross-reference is approximate)
