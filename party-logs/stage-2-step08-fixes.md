# Step 08 Fixes Applied
Date: 2026-03-21
Writer: John (PM)

## Critic Scores (Initial)

| Critic | Score | Grade |
|--------|-------|-------|
| Bob | 8.30 | ✅ PASS |
| Quinn | 7.80 | ✅ PASS |
| Sally | 8.20 | ✅ PASS |
| Winston | 8.00 | ✅ PASS |
| **Average** | **8.08** | **✅ PASS (Grade B)** |

## Fixes Applied (9 items, consolidated from ~15 raw issues + cross-talk)

### Fix 1 — All 4 critics HIGH: /ws/office 연결 상한 통일
- **Before**: Step 07 L1794: 10, FR-OC2 L2277: 50
- **After**: 양쪽 모두 20 + graceful eviction (idle 연결 자동 해제)
- Bob+Sally cross-talk 합의: 피크 ~11연결 × 2배 안전 마진 = 20

### Fix 2 — Winston+Bob+Sally+Quinn MEDIUM: 리스크 중복 제거 + 참조 통합
- **Before**: Step 08에 7건 리스크 (Step 06과 6건 중복)
- **After**: 고유 항목 2건만 유지 (Sprint 2 과부하 + Sprint 1 연쇄 실패) + "§Innovation 혁신 리스크 참조" 주석

### Fix 3 — Quinn MEDIUM: Sprint 2.5 분할 트리거 기준 추가
- **Added**: "Sprint 2 중간 리뷰 시점에 인프라 트랙 미완료 시 워크플로우 트랙을 Sprint 2.5로 이월"

### Fix 4 — Quinn LOW: Sprint 의존성 연쇄 실패 대응
- **Added**: Sprint 1 지연 시 Sprint 2 n8n 인프라 트랙 병렬 착수 가능 (soul-enricher.ts 비의존)

### Fix 5 — Winston LOW: Pre-Sprint / Layer 0 주석
- **Added**: "Pre-Sprint (디자인 토큰 확정) 및 Layer 0 UXUI 리셋은 전 Sprint 병행 — Go/No-Go #6 참조"

### Fix 6 — Winston LOW: @pixi/tilemap vs pixi-tiledmap 병기
- **Before**: @pixi/tilemap@5.0.2만 명시
- **After**: 두 옵션 병기 + 선택 근거 + Sprint 4 착수 시 확정

### Fix 7 — Bob LOW: Sprint 3 Gemini Embedding 재활용 명시
- **Added**: "Phase 4 @google/genai 재활용" 행 추가

### Fix 8 — Bob LOW: llm-cost-tracker v3 제거 대상 표기
- **Added**: "(v3 제거 대상 — CLI Max 월정액, GATE 2026-03-20)" 주석

### Fix 9 — Sally LOW: 큐잉 라이브러리 오픈소스 추가
- **Added**: pg-boss (조건부) 행 추가 — 아키텍처에서 스케줄링 전략 확정 후 채택 여부 결정

## Not Applied (with reason)

- 없음 — 전 이슈 반영 완료
