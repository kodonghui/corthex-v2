#!/bin/bash
# PostCompact hook — 컨텍스트 압축 후 자동 컴팩대비
# working-state 타임스탬프 + uncommitted 변경사항 커밋 + 푸시
set -e

MEMORY_DIR="/home/ubuntu/.claude/projects/-home-ubuntu-corthex-v2/memory"
WORKING_STATE="$MEMORY_DIR/working-state.md"

# 1. working-state에 압축 타임스탬프
if [ -f "$WORKING_STATE" ]; then
  echo "" >> "$WORKING_STATE"
  echo "<!-- auto-saved after compaction: $(date -Iseconds) -->" >> "$WORKING_STATE"
fi

# 2. uncommitted 변경사항 자동 커밋
cd /home/ubuntu/corthex-v2
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "chore: 컴팩대비 자동저장 (PostCompact hook)" --no-verify 2>/dev/null || true
fi

# 3. 푸시
git push 2>/dev/null || true

echo "[post-compact] 컴팩대비 완료: commit + push"
exit 0
