#!/bin/bash
# PostCompact hook (2.1.76 신기능) — 컨텍스트 압축 완료 후 자동 저장
# PreCompact보다 안정적: 압축 확정 후 실행되므로 상태 불일치 없음
set -e

MEMORY_DIR="/home/ubuntu/.claude/projects/-home-ubuntu-corthex-v2/memory"
WORKING_STATE="$MEMORY_DIR/working-state.md"

if [ -f "$WORKING_STATE" ]; then
  echo "" >> "$WORKING_STATE"
  echo "<!-- auto-saved after compaction: $(date -Iseconds) -->" >> "$WORKING_STATE"
  echo "[post-compact] working-state.md timestamped"
fi

# 압축 후 uncommitted 변경사항 자동 커밋 (워커가 최신 상태 볼 수 있도록)
cd /home/ubuntu/corthex-v2
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "chore: auto-save after compaction" --no-verify 2>/dev/null || true
  echo "[post-compact] uncommitted changes saved"
fi

exit 0
