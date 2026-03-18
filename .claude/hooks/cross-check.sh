#!/bin/bash
# Cross-Check: Verify pattern consistency across similar files
# Checks: tenantMiddleware, color imports, icon imports, API response format
# Usage: .claude/hooks/cross-check.sh [project_root]
set -euo pipefail

ROOT="${1:-$(pwd)}"
ADMIN_ROUTES="$ROOT/packages/server/src/routes/admin"
ADMIN_PAGES="$ROOT/packages/admin/src/pages"

echo "========================================="
echo "CORTHEX CROSS-CHECK — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "========================================="

ISSUES=0

# === 1. tenantMiddleware consistency ===
echo ""
echo "--- Check 1: tenantMiddleware in admin routes ---"
for f in "$ADMIN_ROUTES"/*.ts; do
  fname=$(basename "$f")
  # Skip monitoring.ts and companies.ts (intentionally no tenant scoping)
  if [ "$fname" = "monitoring.ts" ] || [ "$fname" = "companies.ts" ]; then
    continue
  fi
  if grep -q "authMiddleware.*adminOnly" "$f" && ! grep -q "tenantMiddleware" "$f"; then
    echo "  MISSING: $fname — has authMiddleware but no tenantMiddleware"
    ISSUES=$((ISSUES + 1))
  fi
done
if [ $ISSUES -eq 0 ]; then echo "  OK: All admin routes have tenantMiddleware"; fi

# === 2. Color imports (no hardcoded hex in pages) ===
echo ""
echo "--- Check 2: Hardcoded colors in admin pages ---"
COLOR_ISSUES=0
for f in "$ADMIN_PAGES"/*.tsx; do
  fname=$(basename "$f")
  if grep -qE "const (olive|oliveBg|cream|sand|warmBrown|terracotta|muted|lightMuted) = " "$f"; then
    echo "  HARDCODED: $fname — has local color constants (should import from lib/colors.ts)"
    COLOR_ISSUES=$((COLOR_ISSUES + 1))
  fi
done
ISSUES=$((ISSUES + COLOR_ISSUES))
if [ $COLOR_ISSUES -eq 0 ]; then echo "  OK: No hardcoded color constants"; fi

# === 3. Material Symbols (should be Lucide React) ===
echo ""
echo "--- Check 3: Material Symbols remnants ---"
ICON_ISSUES=0
if grep -rl "material-symbols\|material-icons" "$ROOT/packages/admin/src/" 2>/dev/null | head -5 | grep -q .; then
  echo "  FOUND: Material Symbols references still exist"
  grep -rl "material-symbols\|material-icons" "$ROOT/packages/admin/src/" 2>/dev/null | head -5 | while read -r f; do
    echo "    - $f"
  done
  ICON_ISSUES=1
fi
if grep -rl "material-symbols\|material-icons" "$ROOT/packages/app/src/" 2>/dev/null | head -5 | grep -q .; then
  echo "  FOUND: Material Symbols in CEO app"
  ICON_ISSUES=1
fi
ISSUES=$((ISSUES + ICON_ISSUES))
if [ $ICON_ISSUES -eq 0 ]; then echo "  OK: No Material Symbols found"; fi

# === 4. Inline companyId query pattern (should use tenantMiddleware) ===
echo ""
echo "--- Check 4: Insecure companyId query pattern ---"
QID_ISSUES=0
for f in "$ADMIN_ROUTES"/*.ts; do
  fname=$(basename "$f")
  if grep -q "c\.req\.query('companyId') || c\.get('tenant')" "$f"; then
    echo "  INSECURE: $fname — inline companyId fallback (use tenantMiddleware instead)"
    QID_ISSUES=$((QID_ISSUES + 1))
  fi
done
ISSUES=$((ISSUES + QID_ISSUES))
if [ $QID_ISSUES -eq 0 ]; then echo "  OK: No insecure companyId patterns"; fi

# === 5. Migration IF NOT EXISTS check ===
echo ""
echo "--- Check 5: Migrations without IF NOT EXISTS ---"
MIG_ISSUES=0
for f in "$ROOT/packages/server/src/db/migrations"/*.sql; do
  fname=$(basename "$f")
  if grep -q "CREATE TABLE " "$f" && ! grep -q "IF NOT EXISTS" "$f"; then
    echo "  UNSAFE: $fname — CREATE TABLE without IF NOT EXISTS"
    MIG_ISSUES=$((MIG_ISSUES + 1))
  fi
done
ISSUES=$((ISSUES + MIG_ISSUES))
if [ $MIG_ISSUES -eq 0 ]; then echo "  OK: All CREATE TABLE use IF NOT EXISTS"; fi

echo ""
echo "========================================="
if [ $ISSUES -gt 0 ]; then
  echo "RESULT: $ISSUES issues found"
  exit 1
else
  echo "RESULT: ALL CHECKS PASSED"
  exit 0
fi
