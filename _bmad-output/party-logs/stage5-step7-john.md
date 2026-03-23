# Critic-C (Product + Delivery) Review — Step 7: Defining Experience Deep Dive

**Reviewer:** John (PM)
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 1009-1434)
**Date:** 2026-03-23
**Grade Target:** B (avg ≥ 7.0)

---

## R1 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 9/10 | SC-1~5 전부 수치 목표 + 측정 방법 + "작동한다/안 한다" 감정 쌍 정의. EM-1 초단위 타임라인. 경쟁사 대비표 4사. 온보딩 6단계 시간 예산. 혼란 가능 지점 CEO 4건 + Admin 4건. Novel 패턴 교육 전략 6건. |
| D2 완전성 | 20% | 9/10 | Step 파일 요구 5개 섹션 전부 커버. IC 부가가치. 누락: Secondary User, DC-7 degradation. |
| D3 정확성 | 15% | 9/10 | PRD 전수 대조 일치. ≤15min vs ~10min 차이 미명시. |
| D4 실행가능성 | 15% | 9/10 | SC=acceptance criteria, EM=구현 스펙. 감점: EM-4 태스크 예약 API 미정의. |
| D5 일관성 | 10% | 9/10 | SC↔CSM 1:1 대응. EM-4 ≤15min vs PRD ~10min 미주석. |
| D6 리스크 | 20% | 8/10 | Error Path 전수 포함. 누락: WOW fallback, SC-3 측정 UX, DC-7 보호 전략. |

**R1 가중 평균: 8.80/10** ✅ PASS + ✅ Grade B Excellent

---

## R2 재채점 (12건 수정 후)

### R2 차원별 점수

| 차원 | 가중치 | R1 | R2 | 변동 근거 |
|------|--------|-----|-----|----------|
| D1 구체성 | 20% | 9 | **9** | 유지. Secretary Haiku tier ~300ms 주석(L1241), FCP/TTI 병렬 전제(L1129), Big Five A/B 미리보기(L1146), Rate limit cooldown UX(L1263) — R1 이미 높았고, 개선은 정밀도 보강 수준. |
| D2 완전성 | 20% | 9 | **9** | 유지. **EM-5 n8n 워크플로우 관리 신설**(L1405-1434) = 주요 완전성 보강. 재교육 경로 3종(L1202). 모바일 /office 대체(L1248). 단, Secondary User(Step 8 이관) + DC-7 전체 degradation 여전히 미정의 → 10 도달 불가. |
| D3 정확성 | 15% | 9 | **9** | 유지. SC-3 "0ms"→"60fps 유지" 물리적 정확성 복원(L1139). SC-4 confidence ≥ 0.7 PRD FR-MEM3/D28 정확 출처(L1152). SC-4 "4주 10%p" = "PRD 명시값 없음" 정직 표기(L1154). EM-4 ≤15min vs PRD ~10min 차이 명시(L1402). CodeMirror 6 번들 크기 정보(L1293). |
| D4 실행가능성 | 15% | 9 | **9** | 유지. EM-5 = 완전한 구현 스펙 (Initiation→Interaction→Feedback→Error, L1405-1434). WOW fallback 구체적 메커니즘(L1389-1393). CodeMirror 6 ~100KB vs Monaco ~5-10MB(L1293). Rate limit Send 비활성 + cooldown(L1263). 태스크 예약 API는 Sprint 이관으로 수용. |
| D5 일관성 | 10% | 9 | **10** | ↑1. **전 EM에 `[접근성: Step 2 DC-N 참조]` 추가** = Step 2 DC와의 체계적 연결(L1265/1308/1353/1400/1433). SC-4 PRD FR-MEM3 + Architecture D28 이중 출처(L1152). EM-2 Ctrl+Z "EP-2 안전망 — v3 UX 신규 제안" 범위 표기(L1305). EM-4 PRD Journey 4 vs ≤15min 차이 명시(L1402). PRD 미정의 항목에 "v3 UX 신규 제안" 일관 표기. |
| D6 리스크 | 20% | 8 | **9** | ↑1. R1 3대 누락 해소: (1) **CEO WOW fallback** — 활성 에이전트 0명 시 자동 데모 태스크(L1389-1393) ✅, (2) **SC-3 측정 UX** — A/B 미리보기 + 기대 관리 3단 구조(L1146) ✅, (3) DC-7 = 부분 해소 (Rate limit L1263, n8n OOM L1429, 개별 EM Error Path 강화). 추가: Secretary 3단계 폴백 PRD 정합(L1256-1260), Ctrl+Z undo 10회 스택(L1305), n8n Error Workflow 재시도+fallback(L1431), Novel 재교육 경로 3종(L1202). |

---

### R2 가중 평균: 9.10/10 ✅ PASS + ✅ Grade B Excellent

계산: (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (10×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 1.00 + 1.80 = **9.10**

R1 8.80 → R2 9.10 (+0.30). D5 9→10, D6 8→9.

---

## R1 이슈 해소 현황

| # | R1 이슈 | 우선순위 | R2 상태 | 검증 |
|---|---------|---------|---------|------|
| 1 | EM-4 CEO WOW fallback | HIGH | ✅ 해소 | L1389-1393: 활성 에이전트 0명 → 비서실장 자기소개 자동 전송. 정확히 권장 방향. |
| 2 | EM-4 ≤15min vs PRD ~10min | MEDIUM | ✅ 해소 | L1402: "PRD Journey 4 ~10분 + Big Five + n8n = ≤15min" 차이 명시. |
| 3 | SC-3 Big Five 측정 UX | MEDIUM | ✅ 해소 | L1146: A/B 미리보기 + 극단값 안내 + 중간값 부제. 권장보다 풍부. |
| 4 | Secondary User 경험 | LOW | ⏸️ 이관 | Step 8 Visual Foundation으로 이관. 합리적 범위 조정. |
| 5 | 태스크 예약 메커니즘 | LOW | ⏸️ 이관 | Sprint 구현 단계로 이관. WOW fallback(#1)이 해소되어 리스크 감소. |

## Cross-talk 반영 확인

| 출처 | 항목 | R2 상태 |
|------|------|---------|
| Quinn | SC-4 "4주 10%p" PRD 출처 | ✅ "v3 UX 신규 제안 — PRD 명시값 없음" (L1154) |
| Quinn | EM a11y DC-N 참조 | ✅ 5개 EM 전부 `[접근성: Step 2 DC-N 참조]` |
| Quinn | Secretary 3단계 폴백 상세 | ✅ PRD 3단계 + 피드백 루프 (L1256-1260) |
| Dev | SC-3 "0ms" 물리적 오류 | ✅ "60fps 유지" (L1139) |
| Dev | Secretary Haiku tier 주석 | ✅ "~300ms. Sonnet 시 ~1s" (L1241) |
| Dev | Monaco 번들 크기 | ✅ CodeMirror 6 ~100KB 권장 (L1293) |
| Dev | Rate limit UX | ✅ Send 비활성 + cooldown (L1263) |
| Winston | SC-4 confidence ≥ 0.7 | ✅ FR-MEM3, D28 출처 (L1152) |
| Winston | EM-5 n8n 관리 흐름 | ✅ 완전 신설 (L1405-1434) |

---

## R2 잔존 이슈 (추가 수정 불필요)

1. **DC-7 전체 시스템 degradation**: 개별 EM Error Path에서 부분 커버 (Rate limit, WS 재연결, n8n OOM). 전체 시스템 동시 장애 시 "The One Interaction" 보호 전략은 Architecture 레벨 관심사이며, UX 스펙에서 정의하기 어려운 범위. 수용.

2. **EM-1 15초 타임아웃 PRD NFR-P6 출처**: Dev cross-talk에서 "PRD NFR-P6 L570 = 각 단계 ≤15초" 확인됨. 스펙에 출처 주석은 없으나, 수치 자체는 정확. 사소.

3. **SC↔CSM 명시적 cross-reference**: SC가 CSM의 정량적 구현임을 명시하는 1줄이 없음. SC-1~5와 CSM-1~5의 1:1 대응이 구조적으로 자명하여 수용.

---

## R2 총평

12건 수정 후 Step 7은 **이 프로젝트 UX 스펙의 최고 섹션** 지위를 더욱 공고히 했다.

**R1에서 R2로의 핵심 개선:**

1. **CEO WOW 보장이 Admin 의존에서 시스템 보장으로 전환** — 이것이 가장 큰 제품적 개선. "자동 데모 태스크"로 WOW 달성이 Admin 행동과 무관해짐.

2. **EM-5 신설로 n8n 워크플로우 관리 완전 커버** — FR-N8N+FR-MKT 13 FRs를 하나의 Experience Mechanic에 담았고, Error Path까지 포함. Layer 2의 UX 정의가 완성됨.

3. **Big Five 기대 관리 3단 구조** — "극단값 안내 + A/B 미리보기 + 중간값 부제". LLM 성격 반영의 본질적 한계를 사용자에게 정직하게 전달하는 접근. 제품 심리학적으로 우수.

4. **접근성 체계적 연결** — 모든 EM에 Step 2 DC-N 참조. a11y가 사후 첨부가 아닌 구조적으로 통합됨.

5. **PRD 미정의 항목 정직 표기** — "v3 UX 신규 제안" 일관 표기로 스펙 출처 투명성 확보. 개발 시 "이것은 PRD 요구인가 UX 제안인가" 혼란 방지.

**9.10/10 — Grade B Excellent. R1 대비 +0.30, MUST-FIX 이슈 0건.**
