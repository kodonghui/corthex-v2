# 2026-03-10: Gemini 3.1 Pro HTML→TSX 변환

## What was done

### 1. HTML→TSX 변환 프롬프트 작성
- 1차 프롬프트 (단순 규칙) → Gemini가 HTML 주석, style 문자열, lucide 아이콘 등 놓침
- 2차 프롬프트 (12개 구체 규칙 + before/after 예시) → 완벽 변환
- 프롬프트 저장: `_uxui-redesign/02-design/GEMINI-PROMPT-HTML-TO-TSX.md`

### 2. 변환 결과
- `claude_libre-ui-synth/react/` — 45개 TSX 생성 완료
- `claude_ui-ux-pro-max/react/` — 45개 TSX 생성 완료
- 변환 품질: lucide-react import, JSX 주석, style 객체, href 경로 변환 모두 정상

### 3. 바탕화면 정리 확인
- `corthex_batch1~13.py` — HTML 생성용 Python 배치 (삭제 가능)
- `corthex-v1-backup.env` → Google Drive 이동 예정

## Key decisions
- 기계적 변환은 Gemini 3.1 Pro(Antigravity)에 위임 — Claude 한도 절약
- Gemini에게 구체적 before/after 예시 필수 — 추상적 규칙만 주면 놓침
- 1M 토큰 컨텍스트 + 65K 출력 제한 → 45개 파일 한번에 처리 가능

## Files affected
- Created: `_uxui-redesign/02-design/GEMINI-PROMPT-HTML-TO-TSX.md`
- Created: `_uxui-redesign/02-design/claude_libre-ui-synth/react/` (45 TSX files)
- Created: `_uxui-redesign/02-design/claude_ui-ux-pro-max/react/` (45 TSX files)
- Modified: `.claude/memory/working-state.md`
- Modified: `MEMORY.md`
