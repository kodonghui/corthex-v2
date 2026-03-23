# Critic-C (Product + Delivery) Review — Step 2: Discovery

**Reviewer:** John (PM)
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 23-217)
**Date:** 2026-03-23

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 8/10 | hex 색상 (#faf8f5, #283618, #606C38), FCP ≤ 3초, 페이지 수 (Admin ~29, CEO ~43), Big Five 0-100 정수 스케일, 5-state 열거, 428곳 color-mix, 프리셋 설정 ≤ 30초/수동 ≤ 2분 등 구체적 수치 다수. DC-2 "20명 이상"에 최대 지원 에이전트 수/뷰 임계점 부재 — 사소한 결함. |
| D2 완전성 | 20% | 7/10 | Step 파일 요구 4개 섹션 (Executive Summary, Target Users, Design Challenges, Design Opportunities) 전부 커버. 4 Layer + Layer 0 전부 다룸. 누락: (1) Admin-side 메모리 Tier 한도 설정 UI 언급 없음 (PRD에 $0.10~$0.50/agent/day 비용 모델 명시), (2) Secondary User의 UXUI 리셋 영향 분석 미흡, (3) PixiJS 번들 > 200KB 시 UX fallback 미정의. |
| D3 정확성 | 15% | 9/10 | 수치 전부 검증됨: 485 API, 86 테이블, 71 페이지 (project-context.yaml 일치), 16 WebSocket 채널, Sprint 순서 정합. Big Five 0-100 정수 = Stage 1 Decision 4.3.1 일치. 참고: PRD 내부에 0.0~1.0 (line 136) vs 0-100 정수 (line 146) 불일치 존재 — UX 스펙이 올바른 값(0-100)을 선택함. |
| D4 실행가능성 | 15% | 7/10 | Discovery 단계 특성상 컨셉 수준 기대. 디자인 챌린지별 UX 대응 방안 명확. 온보딩 Wizard 플로우 구체적. 다만 DC-2에서 "방 분리 또는 미니맵" 미결정, DC-5 n8n iframe vs 프록시 혼합 사용의 구체적 전환 시점 미정의. Discovery 단계에서 수용 가능하나 Step 3에서 확정 필요. |
| D5 일관성 | 10% | 9/10 | PRD 용어 완벽 정합 (Hub, NEXUS, Soul, ARGOS, 비서 등). Sprint 순서 일치. Sovereign Sage 팔레트 = Product Brief와 정합. "Natural Organic" vs "Sovereign Sage" 명칭이 DO-5에서 혼용되나 원본 문서에서도 동일하게 사용되어 수용 가능. |
| D6 리스크 | 20% | 7/10 | DC-1~DC-6으로 주요 UX 리스크 식별. n8n OOM UX fallback (DC-5), PixiJS 접근성 (DC-1), 점진적 전환 리스크 (DC-6) 잘 다룸. 누락: (1) PixiJS 번들 200KB 초과 시 사용자 경험 열화 대안, (2) Reflection 비용 폭주 시 Admin 가시성/경고 UI, (3) 네트워크 장애/오프라인 상태 UX 전반. |

---

## 가중 평균: 7.7/10 ✅ PASS

계산: (8×0.20) + (7×0.20) + (9×0.15) + (7×0.15) + (9×0.10) + (7×0.20) = 1.60 + 1.40 + 1.35 + 1.05 + 0.90 + 1.40 = **7.70**

---

## 이슈 목록 (우선순위순)

### 1. **[D2 완전성] Admin 메모리 Tier 한도 설정 UI 누락** — Priority HIGH
PRD Layer 4에서 "Tier별 Reflection 한도 설정 필요 ($0.10~$0.50/agent/day Haiku 기준)"를 명시. DC-4에서 사용자 체감 지연은 다뤘으나, Admin이 Tier별 Reflection 빈도/한도를 설정하는 UI 니즈가 빠져 있음. 이 기능 없이 Sprint 3 구현 시 비용 통제 불가 → 사장님(CEO)이 예상치 못한 API 비용에 노출.

**권장 수정**: DC-4 또는 Target Users Admin 섹션에 "Tier별 Reflection 한도 설정 (빈도, 에이전트당 일일 한도)" UI 니즈 추가.

### 2. **[D6 리스크] PixiJS 200KB 번들 초과 시 UX fallback 미정의** — Priority HIGH
Product Brief + PRD 모두 "PixiJS 번들 ≤ 200KB gzipped 하드 한도"를 명시. DO-1에서 FCP ≤ 3초는 언급했으나, 만약 tree-shaking 후에도 200KB를 초과하면 어떤 UX로 대체하는지 정의 없음. DC-1의 "모바일 간소화 리스트 뷰"가 데스크톱 fallback으로도 사용 가능한지 명확화 필요.

**권장 수정**: DC-1 또는 DO-1에 "번들 200KB 초과 시: 간소화 리스트 뷰를 데스크톱에서도 기본 제공, PixiJS 캔버스는 lazy-load optional" 대안 추가.

### 3. **[D6 리스크] Reflection 비용 폭주 Admin 경고 UI 부재** — Priority MEDIUM
Layer 4 메모리의 Reflection은 매 크론 실행마다 LLM API 호출 발생. 에이전트 수 × 관찰량이 증가하면 비용이 급등할 수 있으나, Admin에게 비용 추이 가시성이나 임계치 경고 알림이 UX 스펙에 없음.

**권장 수정**: DC-4에 "Admin Dashboard에 Reflection 비용 추이 위젯 + 일일 한도 초과 시 경고 알림" 추가.

### 4. **[D2 완전성] Secondary User UXUI 리셋 영향 분석 미흡** — Priority LOW
Secondary User 섹션이 2줄로 끝남. "v3 신규 기능 직접 사용 없음"은 정확하나, Layer 0 UXUI 리셋이 Messenger/Agora 기존 경험에 미치는 영향 (색상 변경, 레이아웃 변경)이 Zero Regression 선언만으로 충분한지 의문. 기존 사용자 혼란 리스크 존재.

**권장 수정**: Secondary User에 "Layer 0 UXUI 리셋 시 Messenger/Agora 시각 변경 범위 + 사용자 공지/전환 안내" 1-2줄 추가.

### 5. **[D1 구체성] DC-2 인지 과부하 임계점 미정의** — Priority LOW
"에이전트 20명 이상"이라고만 언급. 뷰당 최대 표시 에이전트 수, 부서별 방 전환 임계점 (예: 방당 max 12명), 미니맵 활성화 조건 등이 미정. Discovery 단계에서 수용 가능하나 Step 3에서 확정 필요.

---

## Cross-talk 요약

- Bob (Delivery): DC-6의 Sprint 2 게이팅 (≥60% 스펙 매칭) 기준이 UX 검증 가능한 형태인지 확인 요청 예정
- Architect/QA critics: Big Five 0-100 vs PRD 내부 0.0-1.0 불일치 플래그 — UX 스펙이 올바른 값(0-100, Stage 1 Decision 4.3.1)을 선택했으나 PRD 수정 필요

---

## 총평 (R1)

Step 2 Discovery로서 **품질 양호**. 4개 Layer + Layer 0의 UX 맥락을 빠짐없이 다루고, 구체적 수치와 PRD 정합성이 높다. 특히 DC-1(PixiJS 접근성)과 DC-3(Big Five 직관성)의 UX 대응이 실용적이다.

주요 보완점은 **비용 관련 UX** (Admin Tier 한도, Reflection 비용 가시성)와 **번들 초과 fallback** — 이 두 가지는 PRD에서 명시적으로 요구하는 사항이므로 UX 스펙에도 반영 필요.

---

## R2 Re-score (Post-Fixes)

**19 fixes applied** (fixes log: `_bmad-output/party-logs/stage5-discovery-fixes.md`)

### John 이슈 해결 확인

| # | 이슈 | 상태 | 확인 위치 |
|---|------|------|----------|
| 1 | Admin Tier별 Reflection 한도 설정 UI | ✅ 해결 | DC-4 line 174 — Tier별 일일 한도 + 초과 시 자동 중단 + Admin 알림 |
| 2 | PixiJS 200KB 번들 초과 fallback | ✅ 해결 | DC-1 line 135 + DO-1 line 216 — 리스트 뷰 데스크톱 fallback, Go/No-Go #5 연동 |
| 3 | Reflection 비용 폭주 Admin 경고 UI | ✅ 해결 | DC-4 line 175 — 일일 비용 추이 위젯 + 80%/100% 경고 배너 |
| 4 | Secondary User UXUI 리셋 영향 (LOW) | ⚠️ 미적용 | Secondary User 섹션 변경 없음 — Discovery 범위로 수용 가능 |
| 5 | DC-2 인지 과부하 임계점 (LOW) | ✅ 해결 | DC-2 lines 146-148 — ≤10/11~30/30+ 3단계 구체 임계값 |

### 타 Critic 수정 중 Product 관점 검증

- **CEO 페이지 43→~35 (FR-UX 통합 반영)**: ✅ 정확. GATE 제거 + FR-UX 14→6 통합 반영. 내부 일관성 확보.
- **FCP 분리 (FCP ≤1.5s + TTI ≤3s)**: ✅ PM 동의. WOW 모먼트 = 캐릭터가 움직이는 순간 = TTI.
- **DC-4 빈 상태 (Day 1 UX)**: ✅ 필수. "데이터 수집 중 — 첫 Reflection까지 약 24시간" 안내 적절.
- **DC-7 서버 리소스 병목**: ✅ 유의미한 신규 DC. Graceful degradation 순서 (WS→fps→list) 합리적.
- **FR-MKT 마케팅 자동화 UX**: ✅ Winston 지적 수용. 6단계 파이프라인 + fallback 시각화 + 엔진 설정 UI — DC-5 scope 내 적절.
- **DC-6 페이지 수 74→~67**: ✅ 정확 (v2 71 - GATE 4 + v3 3 = ~67, Brief §4 기준).
- **aria-live="assertive" for errors**: ✅ WCAG 정합.

### R2 차원별 점수

| 차원 | 가중치 | R1 | R2 | 변동 근거 |
|------|--------|-----|-----|----------|
| D1 구체성 | 20% | 8 | **9** | DC-2 임계값 3단계 확정, FCP/TTI 분리, 페이지 수 정정, 비용 80%/100% 경고 수치, WS retry 3초/5회 |
| D2 완전성 | 20% | 7 | **9** | Tier 한도 UI, DC-4 빈 상태, FR-MKT 마케팅 UX, DC-7 서버 리소스, 에러/로딩/빈 상태 전 DC 커버 |
| D3 정확성 | 15% | 9 | **9** | 페이지 수 정정 (74→~67, 43→~35). 나머지 유지. |
| D4 실행가능성 | 15% | 7 | **8** | DC-2 결정 기준 확정 (≤10/11-30/30+), 에러/로딩/빈 상태 패턴 구체화, graceful degradation 순서 |
| D5 일관성 | 10% | 9 | **9** | Sovereign Sage 팔레트 구분 명확화, "Controlled Nature" 출처 추가. 유지. |
| D6 리스크 | 20% | 7 | **9** | 번들 fallback 정의, Reflection 비용 모니터링+경고, WS 재연결 전략, DC-7 서버 degradation, n8n degraded mode |

### R2 가중 평균: 8.85/10 ✅ PASS

계산: (9×0.20) + (9×0.20) + (9×0.15) + (8×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.20 + 0.90 + 1.80 = **8.85**

### Cross-talk 요약 (R2 추가)
- Winston: FR-MKT 누락 + Landing 페이지 미언급 + CEO 페이지 수 정정 → FR-MKT/페이지 수 수정됨. Landing 페이지는 Discovery scope 밖으로 판단 (packages/landing은 별도 Vite SSG 프로젝트).
- Dev: FCP 분리, DC-2 임계값, DC-4 빈 상태, 페이지 수 불일치 — 전부 수정됨. PM 동의 내역 상세 기록.
- Quinn: 에러/로딩/빈 상태 체계적 추가 — Product 관점에서 필수 패턴이었으며 Discovery 품질을 크게 높임.

### R2 총평

R1 대비 **+1.15점 상승** (7.70 → 8.85). 19건 수정으로 D2(완전성)와 D6(리스크)가 각 +2점 — Discovery 단계 수준을 넘어 Core Experience 진입에 충분한 기반 마련. 특히 에러/빈/로딩 상태 패턴 체계화와 비용 모니터링 UX가 v3의 운영 복잡성(4 Layer + n8n Docker + PixiJS WS)에 걸맞는 깊이를 갖춤. **Landing 페이지 UX 미포함은 잔여 gap이나, Discovery 범위 내 수용 가능** — Step 3 이후 또는 별도 Landing 디자인 단계에서 다루는 것이 적절.
