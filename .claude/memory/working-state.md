# 현재 작업 상태
> 마지막 업데이트: 2026-03-10 (세션4)

## 지금 하고 있는 것
에이전트 시스템 리팩토링 (다른 세션에서 Claude SDK + Gemini SDK 반영 중)
→ 이 작업 완료 후 UXUI 디자인 진행

## 핵심 결정사항
- **에이전트 리팩토링 먼저, UXUI 나중** — API/타입 바뀌면 디자인 다시 해야 하므로
- Stitch 프롬프트 v1~v5 (웹+모바일 10개) 준비 완료
- Stitch MCP 연결 완료 — projectId: 11938638885905518037
- gemini HTML 전부 main에 있음 (gemini1~5)
- **워크트리 전부 삭제 완료** — main만 남음
- HTML→TSX 변환 프롬프트 단일화 완료 (`GEMINI-PROMPT-HTML-TO-TSX.md`)

## UXUI 진행 순서 (리팩토링 완료 후)
1. spec 문서 재작성 (prd.md, api-endpoints.md, shared-types.ts)
2. Stitch에 새 spec 첨부 → v1~v5 프롬프트 돌리기 (React 출력)
3. gemini HTML→TSX 변환 (단일 프롬프트를 Antigravity에 붙여넣기)
4. 전체 시안 비교 → 채택
5. 채택 시안 기반 `03-implement/` React 구현

## 디자인 시안 파일 현황 (main)
| 폴더 | HTML | TSX | 비고 |
|---|---|---|---|
| gemini/html/ | 45 | - | + mockups/ 32 PNG |
| gemini2/html/ | 46 | - | |
| gemini3/html/ | 19 | - | + mockups/ 20 PNG |
| gemini4/html/ | 55 | - | |
| gemini5/html/ + admin/ | 29+20=49 | - | 모노크롬 타이포 |
| claude_libre-ui-synth/ | 47 | 45 | |
| claude_ui-ux-pro-max/ | 45 | 45 | |
| claude_subframe/ | - | - | 44페이지 ID (MCP) |

## MCP 설정
- Stitch: `stitch.googleapis.com/mcp` + X-Goog-Api-Key
- Subframe: projectId `fe1d14ed3033`

## 주의사항
- 커밋 전 `npx tsc --noEmit -p packages/server/tsconfig.json` 필수
- HTML→TSX 변환 프롬프트: `GEMINI-PROMPT-HTML-TO-TSX.md` (단일 프롬프트, 경로만 교체)
