# Context Snapshot — Stage 2, Step 08 Scoping & Phased Development (GATE)
Date: 2026-03-21
Pipeline: /kdh-full-auto-pipeline planning (v9.0)
Project: CORTHEX v3 "OpenClaw"

---

## Step 08 Outcome

**Status**: ✅ PASS (avg 9.00/10, Grade A, GATE Option A)

| Critic | Initial | Verified |
|--------|---------|----------|
| Bob | 8.30 ✅ | 9.00 ✅ |
| Quinn | 7.80 ✅ | 9.00 ✅ |
| Sally | 8.20 ✅ | 9.00 ✅ |
| Winston | 8.00 ✅ | 9.00 ✅ |

## Key Content (L1949-2110)

### v3 Sprint 전략:
- **Pre-Sprint**: 디자인 토큰 확정 + Layer 0 UXUI 리셋 (전 Sprint 병행)
- **Sprint 1**: Big Five 성격 시스템 (Layer 3) — Go/No-Go #3
- **Sprint 2**: n8n 워크플로우 자동화 (Layer 2) — Go/No-Go #4, 인프라 트랙 병렬 가능
- **Sprint 3**: 에이전트 메모리 3단계 (Layer 4) — Go/No-Go #5
- **Sprint 4**: OpenClaw 가상 사무실 (Layer 1) — Go/No-Go #2,#8

### Sprint 순서 근거 (Brief §4):
1. Sprint 1 성격 → Sprint 3 메모리에 personality_* 주입
2. Sprint 2 n8n → Sprint 3 Reflection 크론 트리거
3. Sprint 3 메모리 → Sprint 4 OpenClaw activity_logs tail
4. Sprint 4 PixiJS 에셋 리스크 → 맨 마지막

### 수정사항 (10건):
1. /ws/office 연결 상한 20 + graceful eviction (4명 합의)
2. 리스크 중복 제거: Step 06과 6건 중복 → 고유 2건만 유지 + §Innovation 참조
3. Sprint 2.5 분할 트리거 기준 추가
4. Sprint 1→2 n8n 인프라 병렬 착수 가능 (FR-N8N1~5 soul-enricher 비의존)
5. Pre-Sprint / Layer 0 주석 추가
6. @pixi/tilemap vs pixi-tiledmap 두 옵션 병기
7. Sprint 3 Gemini Embedding 재활용 명시
8. llm-cost-tracker v3 제거 대상 표기
9. pg-boss 조건부 채택 추가
10. Sprint 2 dependency 정정: "Sprint 1 (MKT 도구 엔진만 — n8n 인프라 병렬 가능)"

### FR Phase 매핑 업데이트:
- FR-OC1~8: [Phase 5] → [Sprint 4]
- FR-N8N1~5: [Phase 5] → [Sprint 2]
- FR-MEM1~8: [Phase 5] → [Sprint 3]
- FR-PERS1~5: 이미 [Sprint 1] (변경 없음)
- FR-OC2: 연결 상한 50 → 20 + graceful eviction

## Carry-Forward

1. /office RBAC "관찰 전용"/"메인 사용" 라벨 통일 — Sally 이월 (점수 무영향)
2. n8n 백업 전략 — PRD 범위 밖, 아키텍처/운영 문서에서 다룰 사항

## Output File

`_bmad-output/planning-artifacts/prd.md`
Project Scoping & Phased Development v3 완료 + Sprint 전략 + FR Phase 매핑 + 10건 수정
