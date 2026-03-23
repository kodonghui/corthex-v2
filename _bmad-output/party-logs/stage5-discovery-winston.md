# Critic-A (Architecture) Review — Stage 5 Step 2: Discovery

**Reviewer:** Winston (Architect)
**Date:** 2026-03-23
**Document:** `_bmad-output/planning-artifacts/ux-design-specification.md` (Section 2: Discovery, lines 23–237)
**Step File:** `step-02-discovery.md`

## ✅ FINAL SCORE: 9.0/10 (R1: 7.90 → R2: 9.00)

---

## R2 Fix Verification (6 original issues)

| # | Issue | Status | Verification |
|---|-------|--------|-------------|
| 1 | FR-MKT 마케팅 자동화 UX 누락 | ✅ FIXED | DC-5 Line 187: 6단계 파이프라인 UX, Switch 노드 fallback, Admin 엔진 설정 `/admin/marketing-settings`, CEO 읽기 전용 결과 뷰 |
| 2 | CEO 앱 페이지 수 43→35 | ✅ FIXED | Line 82: "~35개 (v2 42 - GATE costs/workflows 제거 - FR-UX 14→6그룹 통합 + /office)" — FR-UX + GATE 모두 반영 |
| 3 | 서버 리소스 병목 UX 영향 | ✅ FIXED | DC-7 신설 (Lines 199-206): WebSocket 50/500 초과 UX, CI/CD 배포 토스트, 3단계 graceful degradation (WS interval→fps→list view) |
| 4 | DC-2 해결안 추상적 | ✅ FIXED | Lines 145-149: 에이전트 수 임계값 (≤10/11-30/30+) + 단계별 전략. PixiJS 구현 패턴은 dev step으로 적절히 deferral |
| 5 | Landing 페이지 UX 미언급 | ⚪ ACCEPTED | packages/landing은 별도 Vite SSG + UXUI pipeline. 제품 앱 UX spec 범위 밖으로 판단 — 수용 |
| 6 | Admin 앱 페이지 수 검증 | ⚪ ACCEPTED | v2 71 - CEO 42 = Admin 29. 사소한 수치 — CEO 쪽 수정이 우선이었고 Admin은 크게 변동 없음 |

---

## R1 Review (Original, preserved below)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | Hex 색상, Sprint 배정, 성능 목표 (FCP ≤3초, ≤200KB, ≤30초/≤2분), aria 속성 전부 명시. DC-2 해결안 ("부서별 방", "줌/패닝")은 구체적 구현 패턴 미정. |
| D2 완전성 | 7/10 | Vision, Users, Challenges, Opportunities 4대 섹션 충족. 그러나 **FR-MKT (마케팅 자동화, 7 FRs)** UX 영향 누락. FR-UX CEO 페이지 통합 미반영. Landing 페이지 UX 미언급. |
| D3 정확성 | 8/10 | v2 통계 정확 (485 API, 86 tables, 71 pages, 10,154 tests). Sprint 순서·아키텍처 결정 (Hono proxy, 4-layer sanitization)·디자인 토큰 전부 검증 일치. **CEO 앱 페이지 수 불일치**: Line 83 "~43개 (v2 42 + /office)" — FR-UX 통합 (14→6그룹) 미반영, 실제 ~35개. |
| D4 실행가능성 | 8/10 | Discovery 단계 수준에서 매우 양호. 페르소나·AHA 모먼트·온보딩 플로우·Design Challenge별 대응안이 구체적. 후속 Step에서 와이어프레임/IA로 발전 가능한 기반. |
| D5 일관성 | 9/10 | PRD 용어 (Hub, Tier, Handoff, NEXUS, ARGOS, Soul)·Sprint 순서·아키텍처 결정·Phase 3 디자인 토큰 전부 정합. Brand promise 인용 vision-identity.md §1.3과 일치. |
| D6 리스크 | 7/10 | Canvas 접근성, 인지 과부하, 성장 지연 인지, n8n OOM/다운 시나리오 커버. **서버 리소스 병목** (CI/CD + n8n + PG 동시 실행 시 4코어 포화)과 **WebSocket 연결 제한** (50/company, 500/server)의 UX 영향 미언급. |

---

## 가중 평균 (Critic-A 가중치)

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 구체성 | 8 | 15% | 1.20 |
| D2 완전성 | 7 | 15% | 1.05 |
| D3 정확성 | 8 | 25% | 2.00 |
| D4 실행가능성 | 8 | 20% | 1.60 |
| D5 일관성 | 9 | 15% | 1.35 |
| D6 리스크 | 7 | 10% | 0.70 |

### **가중 평균: 7.90/10 ✅ PASS**

---

## 이슈 목록 (6건)

### 🔴 Priority 1 (Must Fix)

**Issue #1 — [D2 완전성] FR-MKT 마케팅 자동화 UX 영향 누락**

FR-MKT는 v3 아키텍처에서 7개 FR을 차지하는 주요 기능 (6단계 파이프라인, Switch 노드 fallback, Admin AI 도구 설정). Target Users 섹션에서 Admin이 n8n을 관리한다고만 언급하고, **마케팅 자동화 워크플로우의 UX 흐름** (프리셋 워크플로우 선택 → 외부 API 설정 → fallback 엔진 전환 → 결과 뷰)이 Design Challenge나 Opportunity에서 전혀 다뤄지지 않음.

**Fix:** DC-5에 FR-MKT 워크플로우 UX 흐름 추가하거나 별도 DC-7로 분리. Admin 페르소나에 마케팅 자동화 설정 시나리오 추가.

### 🔴 Priority 2 (Must Fix)

**Issue #2 — [D3 정확성] CEO 앱 페이지 수 불일치 (Line 83)**

현재: "~43개 페이지: v2 42 + /office"
실제: FR-UX (아키텍처 문서 확인) CEO앱 14페이지→6그룹 통합 결정 반영 시 **~35개 페이지** (42 - 14 + 6 + 1). 이 수치는 이후 IA(Information Architecture) 설계의 기준이 되므로 정확해야 함.

**Fix:** Line 83을 FR-UX 통합 반영한 수치로 수정. 예: "~35개 페이지 (v2 42에서 FR-UX 14→6 통합 + /office 신규)"

### 🟡 Priority 3 (Should Fix)

**Issue #3 — [D6 리스크] 서버 리소스 병목의 UX 영향 미언급**

아키텍처 문서가 명시한 위험: CI/CD + n8n Docker + PostgreSQL 동시 실행 시 4코어 포화 가능. 이 상태에서 `/office` WebSocket 지연, n8n 에디터 응답 지연이 CEO/Admin UX에 직접적 영향. DC-5 (n8n)에 "n8n Docker 다운/OOM" 언급은 있으나, **배포 중 성능 저하**와 **WebSocket 50conn/company 초과 시 UX graceful degradation**은 다뤄지지 않음.

**Fix:** DC-1 또는 DC-5에 "서버 리소스 경합 시 /office graceful degradation: WebSocket 연결 실패 → polling fallback 또는 '접속자 초과' 안내" 추가.

### 🟡 Priority 4 (Should Fix)

**Issue #4 — [D1 구체성] DC-2 해결안이 추상적**

"부서별 방(room) 분리 또는 미니맵 도입", "줌/패닝 + 에이전트 검색"은 방향은 맞으나 아키텍처 관점에서 선택이 필요: room 분리는 별도 Canvas 인스턴스 vs 단일 Canvas viewport, 미니맵은 PixiJS Container 기반 vs HTML overlay. Discovery 단계에서 구현 상세는 불필요하나, **선호 패턴 1개를 명시**하면 후속 Step에서 시간 절약.

**Fix:** DC-2에 "아키텍처 권장: 단일 PixiJS Canvas + Container 기반 viewport (부서별 grouping) + CSS overlay 미니맵 — 다중 Canvas는 메모리 과다" 정도의 방향 힌트 추가.

### ⚪ Priority 5 (Nice to Have)

**Issue #5 — [D2 완전성] Landing 페이지 UX 미언급**

`packages/landing`은 별도 Vite SSG로 분리되어 있고 (MEMORY.md 확인), v3 리디자인 범위에 포함. Discovery 섹션에서 Landing 사용자 (잠재 고객, 비로그인)의 UX 고려가 없음. Secondary User로 1줄이라도 언급 필요.

**Fix:** Secondary User 아래에 "잠재 고객 (Landing 페이지): packages/landing Vite SSG. 비로그인 방문자 → 가입 전환. v3 UXUI 리셋 범위 포함." 추가.

### ⚪ Priority 6 (Nice to Have)

**Issue #6 — [D3 정확성] Admin 앱 페이지 수 검증 필요 (Line 56)**

"~29개 페이지: v2 27 + n8n 관리 + /office read-only" — v2 Admin이 정확히 27페이지인지 audit 문서 대조 필요. 전체 71 - CEO 42 = Admin 29 (v2 기준). n8n 관리 + /office read-only 추가 시 ~31. 사소하지만 정확성 차원에서 검증 필요.

**Fix:** audit 문서의 Admin 정확 페이지 수 확인 후 수정.

---

## 자동 불합격 조건 확인

| 조건 | 결과 |
|------|------|
| 할루시네이션 (존재하지 않는 API/파일/함수 참조) | ✅ PASS — 없음 |
| 보안 구멍 | ✅ PASS — 4-layer sanitization 정확히 참조 |
| 빌드 깨짐 | ✅ PASS — N/A (UX spec) |
| 데이터 손실 위험 | ✅ PASS — N/A |
| 아키텍처 위반 (engine/ public API 외 참조) | ✅ PASS — 없음 |

---

## 아키텍처 정합성 요약

### ✅ 정합 (14건)
1. 4 Layer + Sprint 순서 = PRD/Architecture 일치
2. PixiJS 8 + @pixi/react 독립 패키지 = Architecture FR-OC 일치
3. Hono 리버스 프록시 (iframe 아님) = Architecture D31 일치
4. Big Five 0-100 정수 + 4-layer sanitization = Architecture PER-1 일치
5. 3단계 메모리 (관찰→반성→계획) = Architecture FR-MEM 일치
6. WebSocket `/ws/office` 채널 = Architecture 17번째 채널 일치
7. Sovereign Sage 팔레트 = Phase 3 Design Tokens 일치
8. Brand promise 인용 = Vision-Identity §1.3 일치
9. FCP ≤3초, PixiJS ≤200KB = NFR Performance 일치
10. WCAG 2.1 AA 접근성 = NFR Accessibility 일치
11. Voyage AI embedding = Stage 1 Confirmed Decision #1 일치
12. n8n Docker 2.12.3 ARM64 = Architecture 일치
13. 5-state agent animation = Architecture FR-OC 일치
14. ESLint 색상 강제 + Playwright dead button = Architecture L0 전략 일치

### ⚠️ 불일치 (2건)
1. CEO 앱 페이지 수: 43 vs 실제 ~35 (FR-UX 통합 미반영) — Issue #2
2. FR-MKT 7 FRs 미반영 — Issue #1

---

## Cross-talk 요약

- John (Product): FR-MKT 누락 + Landing UX 미언급 확인 요청
- Dev: CEO 페이지 수 FR-UX 통합 반영 여부 + DC-2 PixiJS viewport 패턴 의견 요청

---

## R2 Final Scoring (Post-Fix)

### 차원별 점수 (R1 → R2)

| 차원 | R1 | R2 | 변화 근거 |
|------|-----|-----|----------|
| D1 구체성 | 8 | 9 | DC-2 에이전트 수 임계값 추가 (≤10/11-30/30+), FCP→FCP+TTI 분리, DC-7 degradation 3단계 구체화 |
| D2 완전성 | 7 | 9 | FR-MKT 6단계 파이프라인 추가, 에러/빈/로딩 상태 전 DC 커버, DC-7 서버 리소스 UX, Reflection 비용 모니터링 |
| D3 정확성 | 8 | 9 | CEO 페이지 수 정정 (~35), DC-6 페이지 수 정정 (~67), Sovereign Sage 팔레트 v2/v3 구분 명확화 |
| D4 실행가능성 | 8 | 9 | 모든 DC에 에러/빈/로딩 상태 패턴 정의, 수치 임계값 구체화, 개발자가 바로 구현 가능한 수준 |
| D5 일관성 | 9 | 9 | 유지. 신규 추가분 (DC-7, FR-MKT)도 Architecture와 정합 |
| D6 리스크 | 7 | 9 | DC-7 서버 리소스 병목 전면 커버, WebSocket 한도, CI/CD 저하, graceful degradation chain |

### 가중 평균 (Critic-A 가중치)

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 구체성 | 9 | 15% | 1.35 |
| D2 완전성 | 9 | 15% | 1.35 |
| D3 정확성 | 9 | 25% | 2.25 |
| D4 실행가능성 | 9 | 20% | 1.80 |
| D5 일관성 | 9 | 15% | 1.35 |
| D6 리스크 | 9 | 10% | 0.90 |

### **R2 가중 평균: 9.00/10 ✅ PASS (Excellent)**

### 아키텍처 정합성 (R2): 16/16 checks pass ✅
- R1의 2건 불일치 (CEO 페이지 수, FR-MKT) 모두 해소
- DC-7 신규 내용도 Architecture VPS 제약 + WebSocket 한도와 정합

### 최종 판정
Sally의 Discovery 섹션은 R2에서 모든 must-fix/should-fix 이슈를 해결했다. 아키텍처 정합성 100%, 에러/빈/로딩 상태 전면 커버, 서버 리소스 제약 반영. Discovery 단계로서 매우 탄탄한 기반 — Step 3 Core Experience로 진행 권장.
