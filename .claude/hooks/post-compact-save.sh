#!/bin/bash
# PostCompact hook — 컨텍스트 압축 후 자동 컴팩대비
# 1) working-state 타임스탬프
# 2) uncommitted 변경사항 커밋+푸시
# 3) MEMORY.md 업데이트 리마인더 출력 (Claude가 stdout을 읽음)
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
  git push 2>/dev/null || true
fi

# 3. MEMORY.md 업데이트 리마인더
echo ""
echo "=== COMPACTION MEMORY REMINDER ==="
echo "Context was just compacted. You MUST now:"
echo "1. Read MEMORY.md and update Current Status section with today's date"
echo "2. Update epic/story status, remaining issues based on ACTUAL code state"
echo "3. Remove any stale/outdated information"
echo "4. git add + commit + push the updated MEMORY.md"
echo "==================================="

exit 0
