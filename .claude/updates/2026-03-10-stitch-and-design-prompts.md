# 2026-03-10 Stitch MCP + 디자인 프롬프트 v1~v5

## 변경 사항

### 1. Google Stitch MCP 연결
- `stitch.googleapis.com/mcp` + API Key 등록
- `.vscode/mcp.json` 생성 + `claude mcp add` 설정
- projectId: `11938638885905518037`
- list_screens API 호출 테스트 성공 — 44+ 스크린 확인 (HTML + React 버전 포함)

### 2. Stitch 프롬프트 v1~v5 작성 (10개)
- v1 네오 브루탈리즘 (웹/모바일)
- v2 다크 사이버펑크 + 글래스모피즘 (웹/모바일)
- v3 미니멀 스위스 타이포그래피 (웹/모바일)
- v4 벤토 그리드 + 소프트 오가닉 (웹/모바일)
- v5 레트로 픽셀 아케이드 (웹/모바일)
- 각 프롬프트: 디자인 시스템 규칙 + 컬러 팔레트 + 레이아웃 규칙 + 45페이지 상세 설명
- 사용법: spec 문서 3개 첨부 + React 출력 지정

### 3. gemini 워크트리 HTML → main 복사
- gemini: 45개 HTML + 32 PNG mockups
- gemini2: 46개 HTML
- gemini3: 19개 HTML + 20 PNG mockups
- gemini4: 55개 HTML
- 경로: `_uxui-redesign/02-design/{gemini,gemini2,gemini3,gemini4}/html/`

### 4. HTML→TSX 변환 프롬프트 업데이트
- `GEMINI-PROMPT-HTML-TO-TSX.md`에 gemini1~4용 프롬프트 추가
- 경로 교체표 포함

### 5. 핵심 결정: 에이전트 리팩토링 먼저
- Claude SDK + Gemini SDK 반영 → API/타입 변경 가능
- UXUI 디자인은 리팩토링 완료 후 진행
- spec 문서(prd.md, api-endpoints.md, shared-types.ts) 재작성 필요

## 영향 파일
- `.vscode/mcp.json` (생성)
- `_uxui-redesign/02-design/GEMINI-PROMPT-HTML-TO-TSX.md` (수정)
- `_uxui-redesign/02-design/gemini/html/` (45개 생성)
- `_uxui-redesign/02-design/gemini/mockups/` (32개 생성)
- `_uxui-redesign/02-design/gemini2/html/` (46개 생성)
- `_uxui-redesign/02-design/gemini3/html/` (19개 생성)
- `_uxui-redesign/02-design/gemini3/mockups/` (20개 생성)
- `_uxui-redesign/02-design/gemini4/html/` (55개 생성)
- `.claude/memory/working-state.md` (업데이트)
- `MEMORY.md` (업데이트)
