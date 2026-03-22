# Stage 2 Step 05 — Success Criteria Fixes Applied

**Writer:** john
**Date:** 2026-03-22
**Section:** PRD lines 500–650 (## Success Criteria)
**Pre-fix scores:** Winston 6.10, Quinn 5.35 (FAIL), Sally 6.40 (FAIL), Bob 5.30 (FAIL) — Avg 5.79

---

## Fixes Applied (12 total)

### CRITICAL (2)

**Fix 1: n8n OOM "4G→6G" → Brief 2G 한도 준수 재작성 (R2 강화)**
- L549: `Docker 메모리 한도 조정 (4G→6G)` → `2G 한도 유지 (Brief 필수, 4G=OOM 확정): 3단계 에스컬레이션 — (1) 워크플로우 메모리 프로파일링 (2) NODE_OPTIONS --max-old-space-size=1536 최적화 (3) 대형 워크플로우 분할 (→소형 2-3개 체인) + max_concurrency=1. 마지막 수단: VPS 전체 스케일업 (n8n 단독 증설 불가)`
- Brief mandate: `--memory=2g`, confirmed decision #2: "4G = OOM 확정"
- R2 강화: Bob's 3-step escalation 반영 (메모리 프로파일링 → NODE_OPTIONS → 분할)
- **Source:** ALL 4 critics (unanimous) + Bob R1 consolidated

**Fix 2: v3 Technical table — #9-#14 게이트 행 추가**
- L594 이후 6행 추가:
  - #9: Observation Poisoning 4-layer 방어 (Sprint 3)
  - #10: Voyage AI 마이그레이션 완료 (Pre-Sprint)
  - #11: 에이전트 보안 Tool Sanitization (Sprint 2-3)
  - #12: v1 기능 패리티 (전체)
  - #13: 사용성 검증 (전체)
  - #14: Capability Evaluation (전체)
- **Source:** ALL 4 critics (unanimous)

### MAJOR (5)

**Fix 3: Gate #6 정의 Brief 정합**
- L585: `디자인 토큰 추출 | tokens.css 생성 + Stitch 2 디자인 시스템 준수` → `UXUI Layer 0 자동 검증 | ESLint 하드코딩 색상 0 + Playwright dead button 0 (Brief §4 기준)`
- Step 4 Fix 2와 동일 정의 (Exec Summary와 통일)
- **Source:** Winston, Sally, Quinn

**Fix 4: P0 priority list 10개→14개 확장**
- #11-#14 추가: Observation Poisoning (#9), Voyage AI (#10), v1 패리티 (#12), Tool Sanitization (#11)
- **Source:** ALL 4 critics

**Fix 5: Failure triggers 4건 추가**
- Voyage AI 마이그레이션 실패 → 배치 축소/병행 컬럼 전략
- Observation Poisoning 방어 우회 → 레이어 강화/수동 전환
- 비용 상한 $17/월 초과 → 크론 자동 일시 중지 (ECC 2.2)
- Tool Sanitization 보안 위반 → sanitization 강화/도구 비활성화
- **Source:** Quinn, Winston, Bob

**Fix 6: Reflection 크론 기준 강화 (Gate #7)**
- L590: `크론 실행 성공 + Haiku ≤ $0.10/일` → `크론 실행 성공 (confidence ≥ 0.7 + reflected=false 20개 트리거) + Haiku ≤ $0.10/일 + 비용 초과 시 크론 자동 일시 중지 (ECC 2.2) + advisory lock 동시 실행 방지`
- Product Scope L910 정합 + confirmed decision #9 advisory lock + Bob #8 auto-blocking
- **Source:** Quinn, Bob, Sally (supplement)

**Fix 7: Sprint completion criteria 게이트 참조 추가**
- Sprint 1: + Go/No-Go #2, #6 참조
- Sprint 2: + Go/No-Go #3, #11 참조
- Sprint 3: + confidence/trigger + Go/No-Go #7/#9/#4/#14 + advisory lock
- Sprint 4: + Go/No-Go #5, #8 참조
- **Source:** ALL 4 critics

### MINOR (3)

**Fix 8: Success declaration v3 — #9-#14 결과 추가**
- 6항목 추가: Observation Poisoning, Voyage AI, Tool Sanitization, v1 패리티, 사용성, Capability Evaluation
- **Source:** Winston, Quinn

**Fix 9: P1 list — 디자인 토큰→UXUI Layer 0, 사용성/Capability 추가**
- `디자인 토큰 추출` → `UXUI Layer 0 자동 검증 (Go/No-Go #6)`
- `Admin 온보딩 ≤ 15분` → `사용성 검증 (Go/No-Go #13)`
- + `Capability Evaluation (Go/No-Go #14)` 추가
- **Source:** Sally, Bob

**Fix 10: Sprint milestones — 전체 재작성 (이전 적용 완료)**
- Pre-Sprint: Voyage AI Go/No-Go #10 추가
- Sprint 1-4: 전체 게이트 참조 + 상세 기준
- 전체 완료: v1 패리티 #12, 사용성 #13, Tool Sanitization #11
- **Source:** ALL 4 critics

### CROSS-TALK ADDITIONS (2)

**Fix 11: UX 실패 트리거 3건 추가 (cross-talk #8)**
- Admin 온보딩 15분 초과/중단 → UI 간소화 + 가이드 패널 (Go/No-Go #13)
- CEO 내비게이션 혼란 (태스크 5분 초과) → IA 재검토 + 퀵액션 (Go/No-Go #13)
- Big Five 슬라이더 설정 시간 초과 (3분+) → 프리셋 원클릭 + Low/Mid/High 3단계
- v3 실패 트리거: 기존 7건(기술만) + 4건(보안/비용) + 3건(UX) = **14건**
- **Source:** Sally, Bob (cross-talk)

**Fix 12: n8n OOM 3단계 에스컬레이션 강화 (cross-talk 보강)**
- Fix 1을 Bob의 3-step으로 강화: 프로파일링→NODE_OPTIONS→분할
- "마지막 수단: VPS 전체 스케일업 (n8n 단독 증설 불가)" 명시
- **Source:** Bob R1 consolidated, Winston

---

## NOT Fixed (deferred or out of scope)

| Item | Reason | Deferred to |
|------|--------|-------------|
| Sprint 마일스톤 구체적 날짜 | Solo dev 일정 유동적, Sprint 기간은 Exec Summary에 정의 | — |

---

## Confirmed Decisions Coverage (Success Criteria 내)

| # | Decision | Status |
|---|----------|--------|
| 1 | Voyage AI 1024d | ✅ Go/No-Go #10 + Pre-Sprint milestone + Technical table |
| 2 | n8n Docker 2G | ✅ Failure trigger "2G 한도 유지 (Brief 필수)" |
| 3 | n8n 8-layer security | ✅ Go/No-Go #3 + Technical table |
| 4 | Stitch 2 → UXUI Layer 0 | ✅ Go/No-Go #6 Brief 정합 |
| 5 | 30일 TTL | ⚠️ Product Scope level detail |
| 6 | LLM Cost $17/mo | ✅ Failure trigger + Gate #7 auto-blocking |
| 7 | reflected/reflected_at | ⚠️ Product Scope level detail |
| 8 | Observation poisoning | ✅ Go/No-Go #9 + Technical table + Failure trigger |
| 9 | Advisory lock | ✅ Gate #7 Reflection criteria |
| 10 | WebSocket limits | ⚠️ Product Scope level detail |
| 11 | Go/No-Go 14 gates | ✅ Technical table 14행 + P0 14개 |
| 12 | host.docker.internal | ⚠️ Architecture level detail |
