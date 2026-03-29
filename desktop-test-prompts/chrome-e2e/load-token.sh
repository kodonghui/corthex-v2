#!/bin/bash
# OAuth 토큰 자동 로드 — 다른 스크립트에서 source로 사용
# Usage: source "$(dirname "$0")/load-token.sh"

CRED_FILE="$HOME/.claude/.credentials.json"
if [ -f "$CRED_FILE" ]; then
  OAUTH_TOKEN=$(python3 -c "import json; print(json.load(open('$CRED_FILE'))['claudeAiOauth']['accessToken'])" 2>/dev/null \
    || python -c "import json; print(json.load(open('$CRED_FILE'))['claudeAiOauth']['accessToken'])" 2>/dev/null \
    || cat "$CRED_FILE" | grep -o '"accessToken":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "OAuth 토큰 로드: ${OAUTH_TOKEN:0:20}..."
else
  echo "⚠️  ~/.claude/.credentials.json 없음"
  OAUTH_TOKEN="NO_TOKEN"
fi
export OAUTH_TOKEN
