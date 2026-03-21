# Critic-C Review — Step 08 Scoping & Phased Development

**Reviewer**: Sally (UX Designer / Critic-C)
**Date**: 2026-03-21
**File**: `_bmad-output/planning-artifacts/prd.md` L1949–2131 + L2270–2310
**Step**: step-08-scoping.md

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 9/10 | Sprint 테이블에 Go/No-Go 번호, 블로커 조건, 의존성 명시. FR 26건 전부 [Sprint N] 태그. 오픈소스 패키지 이름+정확한 버전+npm 링크. 리스크에 확률/영향/Sprint 매핑. 직접 구현 목록 10건에 파일 경로 명시. |
| D2 완전성 | 20% | 8/10 | MVP 전략(v2 2단계+v3 4 Sprint), 기능셋(v2 여정+v3 여정), 리스크(v2 7건+v3 7건), 오픈소스(Phase 1~4+Sprint 1~4+직접 구현) 전부 커버. Step-08 요구사항 충족. 단, Step 07 L1947에서 언급된 큐잉 라이브러리(BullMQ/pg-boss)가 오픈소스 테이블에 미포함. |
| D3 정확성 | 15% | 7/10 | Brief §4 Sprint 순서 정확 일치 (Layer 3→2→4→1). Go/No-Go 8개 매핑 정확. **BUT** FR-OC2(L2277) "회사별 최대 **50개** 동시 연결" vs Step 07(L1794) "per-company 연결 **상한 10**" — 동일 PRD 내 수치 불일치. 이건 구현 시 혼란 유발. |
| D4 실행가능성 | 15% | 9/10 | Sprint별 의존성 체인 명확 (Sprint 1→soul-enricher→Sprint 2~3 주입 경로). FR 26건이 Sprint별 그룹화. 직접 구현 10건이 파일 경로+역할까지 명시되어 개발자가 바로 참고 가능. |
| D5 일관성 | 10% | 8/10 | Brief §4 정합 ✅. Step 06 혁신 리스크와 Step 08 스코핑 리스크 내용 중복 있으나 관점(혁신 폴백 vs 프로젝트 확률/영향) 상이로 허용. FR-OC2 수치 불일치는 D3에서 감점. |
| D6 리스크 | 20% | 8/10 | v2 7건 + v3 7건 = 14건. Sprint 2 과부하(신규), 4-layer sanitization(신규), advisory lock 반영(Step 06 연동). "Sprint별 독립 롤백" + "Sprint 2.5 분할" 전략 구체적. |

## 가중 평균: 8.20/10 ✅ PASS

계산: (9×0.20) + (8×0.20) + (7×0.15) + (9×0.15) + (8×0.10) + (8×0.20) = 1.80 + 1.60 + 1.05 + 1.35 + 0.80 + 1.60 = **8.20**

---

## 이슈 목록

### 1. **[D3 정확성] FR-OC2 vs Step 07 /ws/office 연결 상한 불일치** — HIGH
- **위치**: FR-OC2(L2277) vs Step 07 통합 목록(L1794)
- **문제**:
  - FR-OC2: "연결 제한: 회사별 최대 **50개** 동시 연결 (초과 시 연결 거부)"
  - Step 07 통합 목록: "per-company 연결 **상한 10**"
  - 동일 PRD 내 동일 기능에 대해 10 vs 50 — 5배 차이. 구현 시 어느 값을 따를지 혼란.
- **제안**: 하나로 통일. UX 관점 의견:
  - 10은 너무 적음 — CEO + Admin + Human 여러 명이 동시에 /office 열면 10 초과 가능
  - 50은 합리적 — 회사당 Human 10~20명이 각자 탭 2~3개 열어도 커버
  - **50으로 통일하고 Step 07 L1794를 수정** 권장 (또는 20~30 절충)

### 2. **[D2 완전성] 큐잉 라이브러리 오픈소스 테이블 미포함** — LOW
- **위치**: L2105-2113 (v3 Sprint 1~4 오픈소스 테이블)
- **문제**: Step 07 L1947에서 "큐잉(BullMQ/pg-boss)"을 Reflection 크론 스케줄링 옵션으로 언급했고, Step 06 L1671에서 "advisory lock"을 리스크 완화로 추가했으나, 오픈소스 테이블에 큐잉 라이브러리가 없음. 아키텍처에서 확정 후 추가될 수 있으나, Sprint 3 의존성으로 미리 후보를 명시해두면 좋겠음.
- **제안**: Sprint 3 행에 "BullMQ 또는 pg-boss (Reflection 크론 큐잉 — 아키텍처 확정 시)" 조건부 행 추가. 또는 "Phase 5+ 검토" 섹션에 이동.

### 3. **[D5 일관성] Step 06 혁신 리스크 ↔ Step 08 스코핑 리스크 교차 참조 없음** — LOW
- **위치**: L2055-2065 (v3 추가 리스크)
- **문제**: Step 06 혁신 리스크(L1663-1673)와 Step 08 스코핑 리스크(L2055-2065)가 5건 이상 내용 중복 (n8n OOM, PixiJS 번들, Reflection 비용, agent_memories, sanitization). 관점은 다르나(폴백 vs 확률/영향) 교차 참조가 없어 "같은 리스크인지 다른 리스크인지" 불명.
- **제안**: Step 08 리스크 테이블 상단에 "혁신 리스크 상세 → §Innovation 리스크 완화 참조" 1줄 추가.

---

## UX 관점 특별 코멘트

### Sprint 순서 × 사용자 가치 ✅
- Sprint 1(Big Five) → 2(n8n) → 3(Memory) → 4(OpenClaw) 순서가 Brief §4와 정확히 일치
- UX 관점에서도 타당: Sprint 1에서 CEO가 "성격 차이"를 즉시 체감하면 v3 전체에 대한 기대치 형성 → 이후 Sprint의 리텐션 기반

### v3 여정 매핑 × 페르소나 정합 ✅
- Journey 1(CEO Big Five) + Journey 4(Admin Big Five) → Sprint 1에서 양 페르소나 커버
- Journey 8(Admin 마케팅) → Sprint 2 딥 다이브, Journey 10(Admin 메모리) → Sprint 3 딥 다이브
- 각 Sprint에서 최소 1개 페르소나 여정이 검증 가능

### "Sprint별 독립 롤백" 전략 👍
- L1985 "각 Sprint 실패 시 해당 Layer만 비활성화" — 이건 CEO에게 "실패해도 기존 기능 유지" 안심감 제공. v2→v3 전환 리스크 커뮤니케이션에 효과적.

### 직접 구현 목록 (L2121-2131) 👍
- v3 신규 4건 (soul-enricher.ts, memory-reflection.ts, office-channel.ts, Hono proxy) 명시 — "오픈소스로 대체 불가능한 CORTHEX 고유 가치"가 명확

---

## Cross-talk 요청사항

**bob에게**: 이슈 #1(연결 상한 10 vs 50)은 인프라 관점에서 VPS 리소스(WebSocket 연결당 메모리) 고려 시 50이 적절한지 의견 부탁. Step 07 수정 필요 여부.

**Bob 답변**: 50 WS × 10 회사 = 500 연결 = ~2.5MB, VPS 24GB에서 무시 가능. 단, Sally 절충안(20 + graceful eviction)에 최종 합의.

---

## 재검증 (Verification Round)

**검증 대상**: John의 9건 수정 (stage-2-step08-fixes.md)

### 검증 결과

| # | 수정 항목 | Sally 이슈 | 검증 | 위치 |
|---|---------|-----------|------|------|
| 1 | /ws/office 연결 상한 20 + graceful eviction 통일 | **이슈 #1** ✅ | ✅ Step 07 L1794: "상한 20, 초과 시 idle 연결 graceful eviction". FR-OC2 L2276: "회사별 최대 20개 동시 연결 (초과 시 idle 연결 graceful eviction — 가장 오래된 idle 연결 자동 해제 + 새 연결 허용)". 양쪽 수치 일치 + eviction UX 명시. | Step 07 통합 + FR-OC2 |
| 2 | 리스크 중복 제거 + §Innovation 참조 | **이슈 #3** ✅ | ✅ L2057 "혁신별 기술 리스크 상세·폴백은 §Innovation 혁신 리스크 완화 참조" 주석 추가. v3 리스크 7건→2건(고유 항목만). 교차 참조 해소. | v3 추가 리스크 |
| 3 | Sprint 2.5 분할 트리거 기준 | — (Quinn) | ✅ L2061 "분할 트리거: Sprint 2 중간 리뷰 시점에 인프라 트랙 미완료 시 워크플로우 트랙을 Sprint 2.5로 이월". 구체적 트리거 조건 명시. | v3 리스크 Sprint 2 |
| 4 | Sprint 1 연쇄 실패 대응 | — (Quinn) | ✅ L2062 "Sprint 2 n8n Docker는 soul-enricher.ts 비의존(독립 컨테이너) → Sprint 1 Big Five 미완료 시에도 n8n 인프라 트랙 병렬 착수 가능". 의존성 분석 정확. | v3 리스크 Sprint 1 |
| 5 | Pre-Sprint / Layer 0 주석 | — (Winston) | ✅ L1988 "Pre-Sprint (디자인 토큰 확정) 및 Layer 0 UXUI 리셋은 전 Sprint 병행 — Go/No-Go #6 참조 (Brief §4)". Sprint 테이블 하단 배치 적절. | Sprint 전략 |
| 6 | @pixi/tilemap vs pixi-tiledmap 병기 | — (Winston) | ✅ L2112 두 옵션 병기 + "@pixi/tilemap=low-level renderer(경량), pixi-tiledmap=Tiled JSON parser(편의). Sprint 4 착수 시 에셋 파이프라인에 따라 확정". 선택 근거 명확. | 오픈소스 Sprint 4 |
| 7 | Sprint 3 Gemini Embedding 재활용 | — (Bob) | ✅ L2107 "Phase 4 @google/genai 재활용" 행. Epic 10 인프라 재활용 명시. | 오픈소스 Sprint 3 |
| 8 | llm-cost-tracker v3 제거 대상 표기 | — (Bob) | ✅ L2077 "(v3 제거 대상 — CLI Max 월정액, GATE 2026-03-20)" 주석. Step 03 GATE와 정합. | 오픈소스 Phase 1 |
| 9 | pg-boss 큐잉 라이브러리 조건부 추가 | **이슈 #2** ✅ | ✅ L2108 pg-boss 조건부 행 추가. "PostgreSQL 네이티브 (Redis 불필요). 아키텍처에서 스케줄링 전략 확정 후 채택 여부 결정". Step 07 크론 부하 리스크와 연계. | 오픈소스 Sprint 3 |

### 잔여 사항 (Residual)

없음. Sally 이슈 3건 전부 해소.

### 재검증 점수

| 차원 | 가중치 | 초기 | 재검증 | 변동 근거 |
|------|--------|------|--------|---------|
| D1 구체성 | 20% | 9 | 9 | 유지. tilemap 2옵션 선택 근거(#6), Pre-Sprint 주석(#5), Sprint 2.5 트리거(#3) 추가 구체성. |
| D2 완전성 | 20% | 8 | 9 | pg-boss 큐잉 조건부 추가(#9). Gemini Embedding 재활용 명시(#7). llm-cost-tracker 제거 표기(#8). 오픈소스 테이블 완전성 향상. |
| D3 정확성 | 15% | 7 | 9 | 연결 상한 20 + graceful eviction으로 양쪽 통일(#1). PRD 내 수치 불일치 완전 해소. |
| D4 실행가능성 | 15% | 9 | 9 | 유지. Sprint 1 연쇄 실패 시 병렬 착수 전략(#4)으로 실행 유연성 향상. |
| D5 일관성 | 10% | 8 | 9 | 리스크 중복 제거 + §Innovation 교차 참조(#2). Step 06↔08 리스크 관계 명확화. |
| D6 리스크 | 20% | 8 | 9 | Sprint 2 과부하 트리거 구체화(#3). Sprint 1 연쇄 실패 병렬 착수(#4). 고유 리스크만 유지로 가독성 향상. |

### 재검증 가중 평균: 9.00/10 ✅ PASS

계산: (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.80 = **9.00**
