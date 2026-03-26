#!/bin/bash
# Stop hook — 세션 종료 시 오늘의 업데이트 로그 자동 생성
# git log에서 오늘 커밋을 읽어서 .claude/updates/{date}-auto.md 생성
set -e

TODAY=$(date +%Y-%m-%d)
LOG_DIR="/home/ubuntu/corthex-v2/.claude/updates"
mkdir -p "$LOG_DIR"

# 오늘 로그가 이미 있으면 스킵
if ls "$LOG_DIR"/${TODAY}-*.md 1>/dev/null 2>&1; then
  exit 0
fi

# 오늘 커밋이 없으면 스킵
cd /home/ubuntu/corthex-v2
COMMITS=$(git log --since="$TODAY 00:00:00" --until="$TODAY 23:59:59" --oneline 2>/dev/null)
if [ -z "$COMMITS" ]; then
  exit 0
fi

COMMIT_COUNT=$(echo "$COMMITS" | wc -l)
LOG_FILE="$LOG_DIR/${TODAY}-auto.md"

# 오늘 변경된 패키지들 추출
CHANGED_PKGS=$(git log --since="$TODAY 00:00:00" --until="$TODAY 23:59:59" --name-only --pretty=format: 2>/dev/null \
  | grep "^packages/" | cut -d/ -f2 | sort -u | tr '\n' ', ' | sed 's/,$//')

# 커밋 메시지에서 주요 키워드 추출
TOPICS=$(echo "$COMMITS" | sed 's/^[a-f0-9]* //' | head -10)

cat > "$LOG_FILE" << LOGEOF
# ${TODAY} — Auto-generated Update Log

## Summary
- **Commits**: ${COMMIT_COUNT}
- **Packages touched**: ${CHANGED_PKGS:-none}

## Commits
$(echo "$COMMITS" | sed 's/^/- `/' | sed 's/ /` /' )

## Key Changes
$(echo "$TOPICS" | sed 's/^/- /')
LOGEOF

echo "[auto-update-log] Created $LOG_FILE (${COMMIT_COUNT} commits)"
exit 0
