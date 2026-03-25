#!/bin/bash
# Batch Checklist — 배치 작업 시작 전 전수 목록 생성
# Usage: bash .claude/hooks/batch-checklist.sh [package]
# Output: 전체 파일 목록 + 현재 상태

PACKAGE="${1:-app}"
DIR="packages/$PACKAGE/src/pages"

echo "=== $PACKAGE FULL PAGE LIST ==="
TOTAL=0
for f in "$DIR"/*.tsx "$DIR"/*/index.tsx; do
  [ -f "$f" ] || continue
  page=$(echo "$f" | sed "s|$DIR/||;s|/index\.tsx||;s|\.tsx||")
  TOTAL=$((TOTAL+1))
  echo "  $page"
done
echo ""
echo "TOTAL: $TOTAL pages"
echo ""
echo "=== VERIFY: assign ALL $TOTAL to batches before starting ==="
