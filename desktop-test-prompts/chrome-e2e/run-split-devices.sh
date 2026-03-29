#!/bin/bash
# 두 디바이스 병렬 분할 실행 가이드
# Mac: Part 1(01-08) + Part 2(01-06)
# Windows: Part 1(09-15) + Part 2(07-12)
# Part 3, 4는 어느 한 쪽에서만 실행 (순서 의존성)
#
# 사용법:
#   Mac에서    → bash run-split-devices.sh mac
#   Windows에서→ bash run-split-devices.sh win
#
# 결과 폴더를 공유 드라이브나 Git으로 합쳐서 cycle-report.md 생성

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

DEVICE="${1:-}"
if [ -z "$DEVICE" ]; then
  echo "사용법: bash run-split-devices.sh mac|win"
  echo "  mac: Part 1 (01-08) + Part 2 (01-06)"
  echo "  win: Part 1 (09-15) + Part 2 (07-12) + Part 3 + Part 4"
  exit 1
fi

case "$DEVICE" in
  mac)
    echo "=== Mac 디바이스: Part 1(01-08) + Part 2(01-06) ==="
    echo "--- Part 1 Admin (파트 1~8) ---"
    START_PART=1 END_PART=8 bash "$SCRIPT_DIR/run-all.sh"
    echo ""
    echo "--- Part 2 App (파트 1~6) ---"
    START_PART=1 END_PART=6 bash "$SCRIPT_DIR/run-all-part2.sh"
    ;;
  win)
    echo "=== Windows 디바이스: Part 1(09-15) + Part 2(07-12) + Part 3 + Part 4 ==="
    echo "--- Part 1 Admin (파트 9~15) ---"
    START_PART=9 END_PART=15 bash "$SCRIPT_DIR/run-all.sh"
    echo ""
    echo "--- Part 2 App (파트 7~12) ---"
    START_PART=7 END_PART=12 bash "$SCRIPT_DIR/run-all-part2.sh"
    echo ""
    echo "--- Part 3 모바일 ---"
    bash "$SCRIPT_DIR/run-all-part3.sh"
    echo ""
    echo "--- Part 4 풀플로우 ---"
    bash "$SCRIPT_DIR/run-all-part4.sh"
    ;;
  *)
    echo "알 수 없는 디바이스: $DEVICE (mac 또는 win 사용)"
    exit 1
    ;;
esac

echo ""
echo "=== $DEVICE 분할 실행 완료: $(date) ==="
echo "결과: $SCRIPT_DIR/results/"
