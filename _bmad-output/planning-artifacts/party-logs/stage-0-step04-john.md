# Critic-C Review — Step 04: Success Metrics

**Reviewer:** John (PM) — Critic-C (Product + Delivery)
**Date:** 2026-03-20
**File reviewed:** `product-brief-corthex-v3-2026-03-20.md` lines 315–358

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 방침("가볍게 잡고 넘어가라") 감안. 수치 있는 KPI들은 구체적: WOW 90%+, 번들 <200KB, WebSocket <1% 에러, n8n >95%, ARGOS 0%, soul-renderer 100%, agent_memories 0%. 방침상 이월된 수치들은 정당. Business Objectives 표 목표치 없음은 방침 내. |
| D2 완전성 | 7/10 | User Success + Layer 1~4 KPI + Business Objectives 3-tier 구조 완비. Sally AHA 측정 제안(5분+ 체류, 재수정 감소) 모두 포함 ✓. 단, **Business Objectives 표에 측정 방법 컬럼 없음** (User Success 표와 비대칭). Layer 2~3 KPI 중 측정 추적 방법 미명시 항목 존재. |
| D3 정확성 | 7/10 | ARGOS 0% ↔ `services/argos-service.ts` ✓. `agent_memories` 0% 단절 ↔ Option B 채택 ✓. `soul-renderer.ts` `{{personality_traits}}` ✓. **단, "Admin 7단계" (line 323) vs Wizard "Step 1~6" (line 207) 불일치**. n8n 연결이 선택(optional) → Wizard 제외 시 6단계인데 Metrics는 7단계로 카운팅. |
| D4 실행가능성 | 7/10 | 대부분 KPI가 기술적으로 측정 가능. Reflection 비용 이월 투명 명시 ✓. 단, "Admin당 월 활성 워크플로우 수"(n8n API 추출? 자체 DB?), "성격 프리셋 채택률"(어느 테이블에서?) — 추적 방법 미명시. 방침상 PRD 이월 가능이나 Epic 착수 전 결정 필요. |
| D5 일관성 | 8/10 | Zero Regression 용어 ✓. Option B 참조 ✓. Layer 1~4 Step 02 구조 정합 ✓. PixiJS <200KB ↔ VPS 제약 ✓. Admin 단계 수 불일치가 D3와 함께 D5 소폭 감점 요인. |
| D6 리스크 | 6/10 | Reflection 비용 이월 명시 ✓. 번들 하드 한도 ✓. ARGOS 중단율 0% ✓. 단, **리스크 3개 미언급**: (1) "이월" 후 PRD에서 실제 한도가 정의 안 되면 비용 폭탄 오픈 리스크 지속. (2) n8n 5% 실패 케이스(>95% 역수) — 에러 처리 방법 없음. (3) Big Five 채택 실패(대다수 기본값 유지) 시 Feature가 미사용으로 끝날 시나리오 측정 기준 없음. |

---

## 가중 평균 계산

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 구체성 | 8 | 20% | 1.60 |
| D2 완전성 | 7 | 20% | 1.40 |
| D3 정확성 | 7 | 15% | 1.05 |
| D4 실행가능성 | 7 | 15% | 1.05 |
| D5 일관성 | 8 | 10% | 0.80 |
| D6 리스크 | 6 | 20% | 1.20 |

### **가중 평균: 7.10/10 ✅ PASS**

---

## 이슈 목록

### Issue #1 [D3 정확성 + D5 일관성] — Admin 단계 수 불일치 ⚠️ MEDIUM

line 323: `"Admin 7단계 완료 → CEO 초대 완료 퍼널"` — 7단계.
line 207: `"Step 1~6 잠금 해제 Wizard"` — 6단계.

온보딩 ASCII 다이어그램(lines 196–203)을 카운트하면:
1. Admin 계정 생성
2. 회사 설정
3. 조직 구성
4. AI 에이전트 설정
5. [권장] 테스트 태스크 예약
6. n8n 워크플로우 연결 **(선택)**
7. CEO 계정 초대

n8n 연결이 optional이므로 Wizard에서 제외 → **Wizard = 6단계**가 맞음. Metrics의 "7단계"는 전체 플로우 개수를 그대로 쓴 것으로 보임.

**수정안 (둘 중 하나 선택):**
- Option A: line 323을 `"Admin 온보딩 6단계 완료 → CEO 초대 완료 퍼널"`로 수정.
- Option B: Wizard 설명(line 207)을 `"Step 1~7"`로 변경하고 n8n 연결을 Wizard Step으로 포함.

**권장**: Option A (n8n은 optional이므로 필수 Wizard 단계가 아님).

---

### Issue #2 [D2 완전성] — Business Objectives 표 측정 방법 없음 ⚠️ LOW

| 목표 | 지표 | 타임라인 |

User Success 표는 "측정 방법" 컬럼이 있는데 Business Objectives 표에는 없다. "CEO /office 일간 사용률"을 어떻게 측정하는지(session analytics? backend log?), "Admin 직접 생성 비율"을 어디서 집계하는지 미명시.

방침상 PRD 이월 가능이나, Epic 기획 시 분석 인프라 필요 여부 사전 파악이 중요.

**수정안:** Business Objectives 표에 "측정 방법" 컬럼 추가 또는 하단에 "(측정 방법: 상세 PRD 정의)" 주석 1줄.

---

### Issue #3 [D6 리스크] — Reflection 비용 이월 이후 미정의 리스크 지속 ⚠️ LOW

`"Tier별 Reflection LLM 비용 한도: 수치는 PRD에서 정의 (⚠️ 이월 사항)"`

이월 표시 자체는 투명하다. 그러나 이 한도가 PRD에서 실제로 정의되지 않으면 사용자가 Reflection 크론 누적 비용 폭탄을 맞는 리스크가 계속 열린다. Step 02 John Issue #1에서 지적된 핵심 리스크가 이 섹션에서도 닫히지 않았음.

**수정안:** 이월 문장에 블로커 조건 추가: `"(⚠️ 이월 — PRD Step에서 Tier별 한도 미정의 시 v3 출시 블로커)"`

---

## Cross-talk 요약 (수신 후 업데이트)

**Bob (SM) 7.5/10 — 이슈 2개 추가:**
- **UXUI 리셋 KPI 없음 [D2 MEDIUM]**: Layer 1~4 KPI는 전부 있는데 Differentiator 5(UXUI 리셋)만 빠짐. Step 05 Scope에서 UXUI 범위 설정 기준 없어짐. → John 최초 리뷰에 없던 신규 이슈.
- **Analytics 인프라 미언급 [D6 MEDIUM]**: 6개월 후 지표 수집 인프라 없음 → John Issue #2와 overlap.

**Sally (UX) — CEO /office 일간 사용률 인프라 확인 요청 [D4/D6 MEDIUM]:**
- v2에 event analytics 인프라(페이지뷰 로깅, 일간 unique user 집계) 실존 여부 미확인.
- WebSocket 서버 로그 ≠ "일간 사용률" 집계 인프라. 별도 구축 필요 여부 사전 확인 요청.
- → John Issue #2, Bob Issue #2와 3-way overlap.

**AHA 측정 검증 (Sally):** AHA 1(/office 5분 체류) ✓, AHA 2(재수정 감소) ✓ — 둘 다 포함 확인.

**신규 이슈 추가:**

### Issue #4 [D2 완전성] — UXUI 리셋 성공 KPI 없음 ⚠️ MEDIUM (Bob 제기)

Layer 1~4 KPI 전부 있음. Vision Differentiator 5가 "UXUI 완전 리셋"인데 이 Layer에 해당하는 성공 지표가 없다. Step 05 Scope에서 UXUI 리셋 범위를 결정할 때 "무엇이 성공인지" 기준이 없으면 scope 경계 설정 불가.

예시 지표: "Lighthouse Performance Score ≥ 90", "Core Web Vitals 통과", "Phase 7 디자인 토큰 커버리지 100%".

**수정안:** Layer별 KPI 섹션에 "Layer 0 — UXUI 리셋:" 항목 추가. 최소 1개 측정 기준 (예: "디자인 토큰 커버리지 100% — Phase 7 완료 기준").

### Issue #5 [D4 실행가능성 + D6 리스크] — Analytics 측정 인프라 실존 여부 미확인 ⚠️ MEDIUM (Bob+Sally 공동 제기)

Business Objectives 표에서 측정 대상으로 지정한 지표들("일간 사용률", "Admin 직접 생성 비율", "재수정 횟수")을 실제로 수집하려면 event logging / analytics 인프라가 필요하다.

v2에 이 인프라가 있는지 없는지 미확인. WebSocket `/ws/office` 연결 로그는 있겠지만 "일간 unique 사용률" 집계는 별도 구현이다.

**수정안:** Business Objectives 표 하단에 "(측정 인프라: v2 서버 로그 활용 OR 별도 analytics — PRD에서 결정)" 주석 추가. Winston에게 v2 현재 analytics 인프라 실존 여부 크로스톡 요청.

---

**최종 평가**: Issue #1(단계 수) + Issue #4(UXUI KPI) 수정 시 8점대 달성 가능. D6 analytics 이슈는 PRD 이월 처리 가능이나 명시 필요.
