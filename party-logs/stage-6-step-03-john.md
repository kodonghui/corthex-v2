# Critic-C Review — Step 3: Create Stories

**Reviewer:** John (PM, Critic-C: Product + Delivery)
**Date:** 2026-03-24
**File:** `_bmad-output/planning-artifacts/epics-and-stories.md` (L1311-L2792)

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 9/10 | 68개 스토리 전부 GWT(Given-When-Then) 포맷. 마이그레이션 파일명(0061~0064), 버전 핀(voyageai@0.2.1, n8n:2.12.3, PixiJS 8.17.1), 정량 임계값(10KB, 500ms, 3s, P95≤200ms, $0.10/day), px 단위(32×32 sprite, 240px sidebar, 56px topbar), hex 색상(#faf8f5, #283618, #5a7247), 파일 경로(services/voyage-embedding.ts, routes/admin/n8n-proxy.ts, packages/office/), AR/FR/NFR/DSR/UXR 참조 전부 명시. 복붙 수준 구체성. |
| D2 완전성 | 20% | 8/10 | **FR 56개(53 new + 3 UX) 전부 스토리에 매핑**. **14 Go/No-Go 게이트 전부 검증 스토리 보유** (24.8, 25.6, 26.5, 27.3, 28.11, 29.8, 29.9). DSR 참조 광범위(SDK-1~4, VEC-1~4, N8N-SEC-1~8, PER-1~6, MEM-1~7, MKT-1~5, NRT-1~5, PIX-1~6). 그러나: (1) **Story 23.19가 4개 페이지 그룹(Documents, ARGOS, Activity, Organization)을 단일 스토리로 묶음** — 각각 다른 레이아웃 타입, 데이터 모델, 기능을 가진 개별 작업. (2) **Story 23.17이 검색+성능+테스팅 3개 관심사를 하나로 번들링**. |
| D3 정확성 | 15% | 9/10 | Sprint 배정이 Step 2 에픽 설계와 정확히 일치. Go/No-Go 참조 전부 정합. 마이그레이션 번호(0061→0062→0063→0064) 순서 정확. FR-OC7(500ms polling, LISTEN/NOTIFY 불가) 정확 반영(Story 29.3). 3개 독립 sanitization 체인(PER-1, MEM-6, TOOLSANITIZE) 분리 정확(AR60). EnrichResult 인터페이스 동결→additive 확장(AR49) 반영. |
| D4 실행가능성 | 15% | 8/10 | GWT 포맷으로 대부분 스토리가 즉시 구현 가능. 파일 경로, 함수 시그니처, 정확한 검증 기준 포함. 그러나: (1) Story 23.19가 단일 dev agent에게 4개 페이지 리디자인은 과대 — 분할 필요. (2) Epic 23 내부 스토리 간 의존성이 명시되지 않음(23.1→23.2→나머지 순서가 자명하지만, 병렬 가능 스토리 식별 어려움). |
| D5 일관성 | 10% | 9/10 | 스토리 번호 체계(Epic.Story) 일관. 모든 스토리가 동일 포맷(user story + AC + references). Sprint 배정 Step 2와 정합. 용어 PRD 일치. Go/No-Go 번호 Step 2 에픽 설계와 일치. |
| D6 리스크 | 20% | 8/10 | 각 Sprint exit에 검증 스토리 포함(24.8, 25.6, 26.5, 27.3, 28.11, 29.9). Go/No-Go #10(Voyage 마이그레이션)과 #1(Zero Regression) 명시적 검증. AR2 비가역 마이그레이션 경고(Story 22.3 staging test). 그러나: (1) **Sprint 2에 14개 스토리(E25:6 + E26:5 + E27:3) — Sprint 1(8개)의 1.75x**. L1185에서 Architecture가 Sprint 2/2.5 분할 고려를 언급했으나 스토리에 미반영. (2) Story 23.19 mega-story가 delivery 일정에 리스크 — 4페이지 리디자인 하나가 지연되면 전체 ≥60% milestone 위협. |

## 가중 평균: 8.45/10 ✅ PASS

**계산:** (9×0.20) + (8×0.20) + (9×0.15) + (8×0.15) + (9×0.10) + (8×0.20) = 1.80 + 1.60 + 1.35 + 1.20 + 0.90 + 1.60 = **8.45/10**

## 이슈 목록 (Priority Order)

### 1. **[D2/D4 완전성+실행가능성] Story 23.19 mega-story — 4개 페이지 그룹 단일 묶음** — MODERATE
- 현재: "Remaining Page Redesigns (Documents, ARGOS, Activity, Organization)" = 1 story
- 문제: 각 페이지 그룹은 **서로 다른 레이아웃 타입**(Master-Detail, Tabbed, Feed, Tabbed+Canvas), **다른 데이터 모델**, **다른 기능 집합**을 가짐
- Documents(Master-Detail): 파일 브라우저 + 지식 검색
- ARGOS(Tabbed): 크론 잡 + 분석 결과
- Activity(Feed): 활동 + 운영 로그 합침
- Organization(Tabbed+Canvas): 에이전트, 부서, NEXUS 조직도
- 단일 dev agent에게 4개 다른 레이아웃의 풀 리디자인은 과대하며, 하나가 지연되면 나머지도 블로킹
- **Fix**: Story 23.19를 최소 2개로 분할:
  - 23.19a: Documents + Activity (simpler layouts: Master-Detail + Feed)
  - 23.19b: ARGOS + Organization (complex layouts: Tabbed + Tabbed+Canvas with NEXUS)

### 2. **[D6 리스크] Sprint 2 과부하 — 14 stories, Sprint 1의 1.75x** — MINOR
- Sprint 2: Epic 25(6) + Epic 26(5) + Epic 27(3) = **14 stories**
- Sprint 1: Epic 24 = 8 stories
- Architecture L1940에서 Sprint 2/2.5 분할 고려 언급했으나, 스토리 설계에 미반영
- Epic 26(Marketing)은 Epic 25(n8n)에 의존 — 순차적이므로 실질적으로 Sprint 2 후반에 집중
- **Fix**: Story 25.6(Go/No-Go #3) 이후 → Epic 26 시작이라는 **Sprint 2 내부 sequencing note** 추가. 또는 sprint-within-sprint milestone 정의 (Sprint 2a: n8n+Security, Sprint 2b: Marketing)

### 3. **[D2 완전성] Story 23.17 — 3개 관심사 번들링** — MINOR
- "Search, Performance & Testing Patterns" = 글로벌 검색(Cmd+K) + 성능 기준(FCP/LCP/번들 크기) + CSS 공존 전략
- 글로벌 검색은 사용자 facing 기능, 성능은 NFR 검증, CSS 공존은 마이그레이션 전략 — 서로 다른 작업
- **Fix**: 현재 크기가 허용 범위 내라면 AC 내부에서 하위 섹션 구분(Search / Performance / Migration) 추가. 아니면 검색을 23.10(Navigation & Command Palette)에 통합하고, 23.17을 Performance & CSS Migration으로 축소

### 4. **[D4 실행가능성] Epic 23 내부 스토리 의존성 미명시** — MINOR
- 23.1(Design Tokens) → 23.2(Radix Components) → 나머지 모든 페이지/컴포넌트 스토리
- 23.4(Page Consolidation) → 23.18, 23.19(페이지별 리디자인)
- 23.8(WebSocket patterns) — 독립, 병렬 가능
- 이 의존성이 명시되지 않으면 Step 4에서 실행 순서 혼란
- **Fix**: Epic 23 상단에 간단한 의존성 메모 추가: "Foundation (23.1→23.2→23.3) → parallel tracks: Pages (23.4→23.18/19), Components (23.13-15), Patterns (23.6-11)"

## Cross-talk 요약

- **Winston (Critic-A)**: Story 23.19 분할 확인 → **Architecture 동의**. Organization이 23.13(NexusCanvas) 의존성 유일 → 23.19(Documents+ARGOS+Activity) / 23.20(Organization) 분할 최적. Epic 23 병렬화 그래프 제공: 23.8(WS)+23.16(State)은 즉시 시작 가능, 23.13-15(Custom Components)는 23.5 이후 병렬, 23.21(Subframe cleanup)은 최후.
- **Winston (Critic-A)**: Epic 23 20→21 stories 확대 → **적절**. 12-15였으면 story당 커버 범위 과대, v2 Phase 7 경험(14 steps/2998 lines) 고려 시 합리적.
- **Quinn (Critic-B)**: Sprint 2a/2b 분할 → **QA 계획에 도움**. 14 stories 동시 QA 부담 완화. Story 23.19 분할은 Go/No-Go #6에 오히려 유리 — 페이지별 독립 테스트+결함 격리 가능.
- **Quinn (Critic-B)**: NFR-O6, NFR-COST1/2, NFR-O8, Story 28.10 카테고리 gap → Product 관점에서 전부 확인+동의. NFR-O6(Soul reflection rate)는 제 리뷰에서 놓친 gap — Quinn이 정확.

---

## Re-Review After Fixes (2026-03-24)

### 수정 검증 결과

| # | 이슈 | 수정 상태 | 검증 |
|---|------|----------|------|
| 1 | Story 23.19 mega-story 분할 | ✅ FIXED | 23.19(Documents+ARGOS+Activity, NexusCanvas 의존성 없음) + 23.20(Organization, 23.13+23.5 의존) + 23.21(Subframe cleanup, 최후). Epic 23: 21 stories. Total: 69. Summary table L1303 "21" 확인, L1310 total "69" 확인. |
| 2 | Sprint 2 과부하 sequencing | ✅ FIXED | L1193: "Sprint 2a (E25+E27 parallel) → Story 25.6 Go/No-Go #3 gates E26 start → Sprint 2b (E26 sequential)" |
| 3 | Story 23.17 번들링 | ✅ FIXED | L1816-1824: AC 내 _Search:_, _Performance:_, _Migration:_ 하위 섹션 레이블 추가 |
| 4 | Epic 23 내부 의존성 미명시 | ✅ FIXED | L1450: "Foundation (23.1→23.2→23.3) → parallel tracks: Pages, Components, Patterns, Infrastructure → 23.21 last" |

### 수정 후 차원별 점수

| 차원 | 가중치 | 수정 전 | 수정 후 | 변동 근거 |
|------|--------|--------|--------|----------|
| D1 구체성 | 20% | 9/10 | 9/10 | 변동 없음 |
| D2 완전성 | 20% | 8/10 | **9/10** | 23.19 분할로 페이지 그룹별 적정 granularity 확보. 23.17 하위 섹션으로 관심사 분리 명확화. |
| D3 정확성 | 15% | 9/10 | 9/10 | 변동 없음 |
| D4 실행가능성 | 15% | 8/10 | **9/10** | Epic 23 의존성 맵으로 병렬/순차 실행 경로 명확. 23.20이 23.13 의존성 명시하여 블로킹 방지. Sprint 2a/2b sequencing으로 delivery 계획 구체화. |
| D5 일관성 | 10% | 9/10 | 9/10 | 변동 없음 |
| D6 리스크 | 20% | 8/10 | **9/10** | Sprint 2a/2b 분할로 과부하 리스크 완화. 23.19/23.20 분할로 ≥60% milestone 리스크 감소 — 페이지 독립 진행 가능. |

### 수정 후 가중 평균: 9.00/10 ✅ PASS

**계산:** (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.80 = **9.00/10**
