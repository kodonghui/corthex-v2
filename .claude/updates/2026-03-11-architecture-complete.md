# 2026-03-11: Architecture 7/7 완료 (32라운드 파티)

## What Changed
- Architecture Decision Document Step 5~7 완료
- 총 32라운드 파티 모드, 54개 개선사항 반영
- CLAUDE.md에 Engine Patterns 섹션 추가

## Key Outputs
- **Architecture**: `_bmad-output/planning-artifacts/architecture.md` (~1,150줄)
  - Step 5: Implementation Patterns E1~E10 + Anti-Pattern 8개 (4라운드, P1~P17)
  - Step 6: Project Structure + 호출자 6곳 + 회귀 테스트 매트릭스 (4라운드, S1~S19)
  - Step 7: Validation + UX Handoff Items (3라운드, V1~V13)

## Step 5 핵심 (Implementation Patterns)
- E1: SessionContext readonly 타입 레벨 불변
- E2: Hook 시그니처 표준 (PreToolUse/PostToolUse/Stop)
- E3: getDB READ+WRITE (companyId 자동 주입)
- E7: Phase 1 순차 핸드오프 (병렬은 Phase 2+)
- E8: engine/ 공개 API 2파일만 (agent-loop.ts + types.ts)
- E9: SDK 모킹 mock.module() 표준
- E10: engine 경계 CI 검증 스크립트

## Step 6 핵심 (Project Structure)
- Phase 1: 새 ~20, 수정 ~9, 삭제 2 = 총 ~31파일
- 순 변경: -825줄 (69% 삭제)
- 호출자 6곳 전체 매핑 + SessionContext 소스
- "불가침" = 비즈니스 로직만. import 교체 허용
- CI 스크립트 → .github/scripts/
- chat.ts(REST) vs hub.ts(SSE) 역할 분리

## Step 7 핵심 (Validation)
- Coherence ✅, Coverage ✅, Readiness ✅
- SDK exact pin 전략
- UX Handoff Items 6개
- 방어선 다중: CI + tsc + 코드리뷰

## n8n 조사 결과
- 현재 불필요 (자체 오케스트레이션 + croner + inngest/bun 충분)
- Phase 5+ 조건: 외부 SaaS 10개+, CEO 직접 자동화

## Next Steps
1. PRD 메모리 스펙 수정 (즉시)
2. UX Design → `/bmad-bmm-create-ux-design`
3. Epics → `/bmad-bmm-create-epics-and-stories`

## Files Affected
- `_bmad-output/planning-artifacts/architecture.md` — 주 산출물 (~1,150줄)
- `CLAUDE.md` — Engine Patterns 섹션 추가
