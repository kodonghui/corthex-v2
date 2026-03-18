#!/bin/bash
# Smoke Test: Hit every admin + workspace API endpoint on production
# Run after deploy to verify nothing is broken
# Usage: .claude/hooks/smoke-test.sh [base_url] [admin_username] [admin_password]
set -euo pipefail

BASE="${1:-https://corthex-hq.com/api}"
USERNAME="${2:-admin}"
PASSWORD="${3:-admin1234}"

echo "========================================="
echo "CORTHEX SMOKE TEST — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "Target: $BASE"
echo "========================================="

# Login
LOGIN_RES=$(curl -sf -X POST "$BASE/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" 2>/dev/null) || {
  echo "FATAL: Login failed"
  exit 1
}

TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo "FATAL: No token in login response"
  exit 1
fi

# Get first company ID
COMPANIES_RES=$(curl -sf -H "Authorization: Bearer $TOKEN" "$BASE/admin/companies" 2>/dev/null)
CID=$(echo "$COMPANIES_RES" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$CID" ]; then
  echo "FATAL: No company found"
  exit 1
fi

echo "Auth: OK | Company: $CID"
echo ""

PASS=0
FAIL=0
FAILURES=""

check() {
  local name="$1"
  local url="$2"
  local status
  status=$(curl -sf -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$url" 2>/dev/null) || status="000"
  if [ "$status" = "200" ] || [ "$status" = "201" ]; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    FAILURES="${FAILURES}\n  FAIL $status  $name"
  fi
}

echo "--- Admin Endpoints ---"
check "companies"              "$BASE/admin/companies"
check "companies/stats"        "$BASE/admin/companies/stats"
check "companies/:id"          "$BASE/admin/companies/$CID"
check "users"                  "$BASE/admin/users?companyId=$CID"
check "employees"              "$BASE/admin/employees?companyId=$CID"
check "departments"            "$BASE/admin/departments?companyId=$CID"
check "agents"                 "$BASE/admin/agents?companyId=$CID"
check "tools/catalog"          "$BASE/admin/tools/catalog?companyId=$CID"
check "costs/summary"          "$BASE/admin/costs/summary?companyId=$CID"
check "costs/by-agent"         "$BASE/admin/costs/by-agent?companyId=$CID"
check "costs/by-model"         "$BASE/admin/costs/by-model?companyId=$CID"
check "costs/by-department"    "$BASE/admin/costs/by-department?companyId=$CID"
check "costs/daily"            "$BASE/admin/costs/daily?companyId=$CID"
check "budget"                 "$BASE/admin/budget?companyId=$CID"
check "credentials"            "$BASE/admin/credentials?companyId=$CID"
check "api-keys"               "$BASE/admin/api-keys?companyId=$CID"
check "public-api-keys"        "$BASE/admin/public-api-keys?companyId=$CID"
check "report-lines"           "$BASE/admin/report-lines?companyId=$CID"
check "org-chart"              "$BASE/admin/org-chart?companyId=$CID"
check "org-templates"          "$BASE/admin/org-templates?companyId=$CID"
check "nexus/layout"           "$BASE/admin/nexus/layout?companyId=$CID"
check "soul-templates"         "$BASE/admin/soul-templates?companyId=$CID"
check "tier-configs"           "$BASE/admin/tier-configs?companyId=$CID"
check "monitoring/status"      "$BASE/admin/monitoring/status"
check "audit-logs"             "$BASE/admin/audit-logs?companyId=$CID"
check "tool-invocations"       "$BASE/admin/tool-invocations?companyId=$CID"
check "agent-reports"          "$BASE/admin/agent-reports?companyId=$CID"
check "mcp-servers"            "$BASE/admin/mcp-servers?companyId=$CID"
check "quality-rules"          "$BASE/admin/quality-rules?companyId=$CID"
check "security/prompt-guard"  "$BASE/admin/security/prompt-guard?companyId=$CID"
check "company-settings"       "$BASE/admin/company-settings/handoff-depth?companyId=$CID"
check "api-keys/providers"     "$BASE/admin/api-keys/providers?companyId=$CID"

echo "--- Workspace Endpoints ---"
# Login as CEO user for workspace endpoints
CEO_LOGIN=$(curl -sf -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"ceo\",\"password\":\"admin1234\",\"companyId\":\"$CID\"}" 2>/dev/null) || true
CEO_TOKEN=$(echo "$CEO_LOGIN" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$CEO_TOKEN" ]; then
  wcheck() {
    local name="$1"
    local url="$2"
    local status
    status=$(curl -sf -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $CEO_TOKEN" "$url" 2>/dev/null) || status="000"
    if [ "$status" = "200" ] || [ "$status" = "201" ]; then
      PASS=$((PASS + 1))
    else
      FAIL=$((FAIL + 1))
      FAILURES="${FAILURES}\n  FAIL $status  $name"
    fi
  }
  wcheck "dashboard/summary"    "$BASE/workspace/dashboard/summary"
  wcheck "agents"               "$BASE/workspace/agents"
  wcheck "departments"          "$BASE/workspace/departments"
  wcheck "chat/sessions"        "$BASE/workspace/chat/sessions"
  wcheck "notifications"        "$BASE/workspace/notifications"
  wcheck "files"                "$BASE/workspace/files"
  wcheck "profile"              "$BASE/workspace/profile"
  wcheck "knowledge/docs"       "$BASE/workspace/knowledge/docs"
  wcheck "activity/agents"      "$BASE/workspace/activity/agents?page=1&limit=5"
  wcheck "workflows"            "$BASE/workspace/workflows"
  wcheck "presets"              "$BASE/workspace/presets"
else
  echo "  (CEO login failed — skipping workspace endpoints)"
fi

echo ""
echo "========================================="
echo "RESULT: $PASS passed, $FAIL failed"
if [ $FAIL -gt 0 ]; then
  echo -e "FAILURES:$FAILURES"
  echo "========================================="
  exit 1
else
  echo "ALL ENDPOINTS OK"
  echo "========================================="
  exit 0
fi
