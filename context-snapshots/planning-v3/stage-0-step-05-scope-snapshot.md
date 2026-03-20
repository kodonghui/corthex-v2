# Context Snapshot — Stage 0, Step 05 MVP Scope
Date: 2026-03-20
Pipeline: /kdh-full-auto-pipeline planning (v9.0)
Project: CORTHEX v3 "OpenClaw"

---

## Step 05 Outcome

**Status**: ✅ PASS (avg 8.75/10 after fixes — Stage 0 최고점)

| Critic | Initial | Verified | Note |
|--------|---------|----------|------|
| John | 7.35 ✅ | 8.30 ✅ | Pre-Sprint 선행 + 에셋 리스크 2-layer + 레드라인 |
| Bob | 7.55 ✅ | 9.00 ✅ | memory-reflection.ts 분리 + Go/No-Go #2 silent failure |
| Sally | 8.10 ✅ | 9.00 ✅ | D6 리스크 7→9 (3-layer 리스크 구조) |
| Winston | 8.10 ✅ | 8.70 ✅ | observations 3단계 흐름 + Neon migration 패턴 |

## GATE 결정 (사장님)

- **Option A**: 단일 릴리즈, 4개 레이어 전부 v3에 포함
- **Sprint 순서**: Pre-Sprint(Phase 0) → Sprint 1(Layer 3) → Sprint 2(Layer 2) → Sprint 3(Layer 4) → Sprint 4(Layer 1). Layer 0 전 과정 병행.
- **PixiJS 에셋**: AI 생성 또는 직접 제작 (별도 구매 없음). Technical Research(Stage 1)에서 최신 AI 스프라이트 생성 도구 조사.

## 핵심 결정사항

- **Pre-Sprint Phase 0**: 테마 결정 = Sprint 1 착수 선행 조건. 미확정 시 전 Sprint UI 재작업 리스크 명시.
- **memory-reflection.ts 신규 분리**: memory-extractor.ts의 이중 모드(즉시+크론) race condition 방지. E8 경계 + SRP 준수. 3단계 흐름: 실행완료 → observations(raw INPUT) → memory-reflection.ts 크론 → agent_memories[reflection](OUTPUT).
- **observations 역할**: raw INPUT 계층. agent_memories 대체 아님. Neon zero-downtime migration 패턴 적용.
- **Go/No-Go 7개 → 8개**: #8 에셋 품질 승인 추가 (Sprint 4 착수 선행 조건).
- **Go/No-Go #2 강화**: renderSoul() extraVars 키 존재 여부 + 빈 문자열 여부 검증 (빈 문자열 = FAIL). soul-renderer.ts L45 `|| ''` fallback 대응.
- **Layer 0 Sprint 분류**: Sprint별 해당 기능 페이지 UXUI 병행. 중간 게이팅: Sprint 2 종료까지 ≥60% 미달 시 레드라인.
- **사이드바 IA 선행 결정**: n8n 관리(Admin) + /office read-only(Admin) + /office(CEO) 배치 → 해당 기능 Sprint 착수 전 완료.
- **Sprint 3 블로커**: PRD Tier 비용 한도 확정 선행 필수. 미확정 시 Sprint 3 착수 불가.

## 이월 사항 (Step 06 Complete → PRD)

- `completedSteps` 배열 추가 여부 — PRD 결정
- Tier별 Reflection LLM 비용 한도 수치 — PRD 결정 (블로커)
- 온보딩 완료율 step-level 퍼널 구현 — PRD 결정
- Go/No-Go #2 Winston 이월 주의사항: PRD/Architecture에서 extraVars 주입 여부 별도 검증 기준 추가 권장 (Brief 통과 문제없음)

## Fixes Applied

총 9개 이슈 전부 적용 (party-logs/stage-0-step05-fixes.md)
- Pre-Sprint Phase 0 선행 조건 — Sprint 1~3 재작업 리스크 차단
- memory-reflection.ts 분리 — race condition 방지 + E8 경계 준수
- observations 역할 명확화 — PRD 작성자 혼동 방지
- Go/No-Go 7개 → 8개 (에셋 품질 승인 추가)
- Sprint 3 블로커 조건 표에 명시

## Output File

`_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md`
§4 MVP Scope 섹션 (Layer 0~4 In/Out of Scope, Sprint 순서 표, Go/No-Go 8개)
