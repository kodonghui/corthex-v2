# 2026-03-10: Subframe 페이지 목록 수집 + 디자인 폴더 정리

## What was done

### 1. Oracle VPS v1 완전 삭제
- corthex v1 전체 삭제 (~6GB 확보)
- .env 55개 키 → 로컬 백업: `C:\Users\elddl\Desktop\corthex-v1-backup.env`

### 2. 디자인 폴더 tool-prefix 이름 정리 (커밋 2fc0e19)
- `claude_libre-ui-synth/`, `claude_ui-ux-pro-max/`, `gemini5/` 로 통일
- `claude_subframe/` 폴더 생성

### 3. Subframe 44페이지 ID 수집
- MCP `list_pages`로 전체 44페이지 ID 수집
- `_uxui-redesign/02-design/claude_subframe/README.md` 에 정리
- TSX 샘플 3개 저장 (CommandCenter, CommandCenter2, AgoraDebateArena)
- **전체 TSX 저장 중단** — 한도 절약, `/subframe:develop` 때 MCP가 직접 fetch

## Key decisions
- Subframe TSX 로컬 저장 불필요 → MCP가 페이지 ID로 직접 가져옴
- HTML 대량 생성 시 Sonnet 사용 필수 (Opus는 한도 과다 소비)

## Files affected
- Created: `_uxui-redesign/02-design/claude_subframe/README.md`
- Created: `_uxui-redesign/02-design/claude_subframe/CommandCenter.tsx` (샘플)
- Created: `_uxui-redesign/02-design/claude_subframe/CommandCenter2.tsx` (샘플)
- Created: `_uxui-redesign/02-design/claude_subframe/AgoraDebateArena.tsx` (샘플)
- Modified: `.claude/memory/working-state.md`
- Modified: `MEMORY.md`
