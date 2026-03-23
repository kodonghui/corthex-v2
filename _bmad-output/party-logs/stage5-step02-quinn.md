# Critic-B (QA) Review — Step 2: Discovery

**Reviewer:** Quinn (QA Engineer)
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 23-217)
**Date:** 2026-03-23
**Rubric:** Critic-B weights (D1=10%, D2=25%, D3=15%, D4=10%, D5=15%, D6=25%)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | hex 색상 (`#faf8f5`, `#283618`, `#606C38`), FCP ≤3초, 번들 ≤200KB gzipped, 슬라이더 0-100 정수, 30초/2분 설정 시간, 5-state 이름까지 명시. "적절한" 류 표현 거의 없음. Sprint 2 게이팅 "≥60%" 등 수치도 좋음. 약간의 감점: DC-2 대응 방안에서 "미니맵 도입"의 구체적 크기/위치 미정의, "줌/패닝" 인터랙션 세부 미명시. |
| D2 완전성 | 8/10 | Step 02 요구사항(Executive Summary, Target Users, Design Challenges, Design Opportunities) 4가지 영역 전부 커버. 온보딩 플로우 순서도 있음. **양호 사항**: DC-1 PixiJS 접근성 대안(aria-live 패널, 이중 인코딩, 모바일 리스트 뷰), DC-3 Big Five aria 속성, DC-4 성장 지표 접근성. **누락**: (1) 에러 상태 UI가 DC-5 n8n에만 있고 다른 영역(PixiJS WebSocket 끊김, Big Five 저장 실패, 메모리 Reflection 크론 실패)은 에러 경로 미정의. (2) 빈 상태(empty state)도 DC-5만 언급 — 에이전트 0명 시 /office, Reflection 0건 시 Dashboard 위젯은? (3) 로딩 상태(skeleton/spinner) 전혀 미언급. |
| D3 정확성 | 9/10 | PRD와 대조 결과: Layer 1~4 스프린트 배정 일치, 4-layer sanitization 경로 일치, OCEAN 0-100 정수 스케일 일치(Stage 1 Decision 4.3.1), PixiJS 200KB Brief §4 일치, Hono 리버스 프록시 경로 `/admin/n8n/*` 일치, WebSocket 채널 16→17 일치(`shared/types.ts:484-501`), 5-state(idle/working/speaking/tool_calling/error) PRD FR-OC와 일치. 사소한 불일치 1건: L56 "v2 27 + n8n 관리 + /office read-only"로 ~29페이지 표기 — PRD는 v2 71페이지 중 GATE 제거 4개 → ~67 유지로 표기. Admin 앱만의 정확한 페이지 수는 PRD에서 별도 분리되어 있지 않아 검증 불가하나 ~29는 합리적 추정. |
| D4 실행가능성 | 7/10 | 디자인 방향과 사용자 문제 정의가 명확하여 다음 Step(Core Experience)으로 넘기기 충분. DC-1~6 각각에 대응 방안이 있어 방향 설정됨. 그러나 Discovery 단계이므로 코드 스니펫이나 컴포넌트 세부 구조는 아직 불필요 — Step 3 이후에서 기대. |
| D5 일관성 | 9/10 | Brief → PRD → Architecture → 이 문서까지 용어 통일: OpenClaw, Big Five, OCEAN, Soul, Reflection, NEXUS 전부 일관. 디자인 토큰(Sovereign Sage: cream/olive/sage)도 Phase 3 design-tokens.md와 일치 확인 필요하나 hex 값이 Brief와 정합. Layer 0~4 + Sprint 순서 PRD와 정확히 일치. 사소한 1건: L40 "Controlled Nature"라는 디자인 방향명이 이 문서에서 처음 등장 — 이전 문서에 없는 신규 용어이므로 이후 단계에서 정의 필요. |
| D6 리스크 | 7/10 | **식별됨**: PixiJS 접근성(DC-1), 인지 과부하(DC-2), OCEAN 직관성(DC-3), 성장 체감 지연(DC-4), n8n UX 일관성+에러 경로(DC-5), 74페이지 점진적 전환(DC-6) — 6개 리스크 전부 대안 포함. **누락 리스크**: (1) **PixiJS WebSocket 연결 실패 시 UX** — `/office` 실시간 데이터가 끊겼을 때 사용자에게 어떤 피드백? stale 상태 표시? 재연결 시도 UI? PRD에 `/ws/office` 채널이 있으나 연결 실패 대응 UX 없음. (2) **Big Five prompt injection 시 사용자 피드백** — 4-layer sanitization 실패/차단 시 사용자에게 어떤 에러 메시지? silent fail? (3) **n8n Docker OOM kill 빈도 리스크** — PRD R6 Critical (860MB idle, 2G cap) 이지만 Discovery에서 사용자 체감 관점의 대응 전략(자동 재시작 알림? degraded mode?)이 약함. DC-5에 "서비스 일시 중단" 안내만 있고 빈도/복구 시간 예상 없음. (4) **1인 창업자 Admin=CEO 동일인 케이스** — L122에 언급되었으나 UX 충돌 가능성 미탐색 (Admin/CEO 앱 전환 시 컨텍스트 스위치 비용, 사이드바 이중 노출 등). |

---

## 가중 평균 계산

| 차원 | 점수 | 가중치 | 가중 점수 |
|------|------|--------|-----------|
| D1 구체성 | 8 | 10% | 0.80 |
| D2 완전성 | 8 | 25% | 2.00 |
| D3 정확성 | 9 | 15% | 1.35 |
| D4 실행가능성 | 7 | 10% | 0.70 |
| D5 일관성 | 9 | 15% | 1.35 |
| D6 리스크 | 7 | 25% | 1.75 |

### **가중 평균: 7.95/10 ✅ PASS**

---

## 이슈 목록

### High Priority
1. **[D2 완전성] 에러 상태 UI 누락 — PixiJS/Big Five/Memory 영역**
   - DC-5 n8n에만 에러 경로가 있음. `/office` WebSocket 끊김, Big Five 슬라이더 저장 실패, Reflection 크론 에러 시 사용자에게 어떤 피드백을 줄 것인지 각 DC에 1줄씩 추가 권장.

2. **[D6 리스크] `/ws/office` WebSocket 연결 실패 시 UX fallback 미정의**
   - PRD에 `/ws/office` 실시간 채널이 명시되어 있으나, 연결 끊김/재연결 시 사용자 UX(stale indicator, retry banner, 자동 재연결)가 DC-1에 없음.

### Medium Priority
3. **[D2 완전성] 빈 상태(empty state) 패턴 부족**
   - 에이전트 0명 시 `/office`, Reflection 0건 시 Dashboard "이번 주 Reflection" 위젯, 성격 미설정 에이전트의 프로필 — 빈 상태 안내가 DC-5 n8n 외에는 없음.

4. **[D2 완전성] 로딩 상태 미정의**
   - PixiJS 캔버스 로딩(≤3초 FCP 목표가 있으나 로딩 중 UI 미정의), Big Five 슬라이더 초기 로딩, Dashboard 성장 지표 로딩 — skeleton/spinner/progressive rendering 등 패턴 언급 없음.

5. **[D6 리스크] n8n Docker OOM kill 사용자 체감 전략 미흡**
   - DC-5에 "서비스 일시 중단" 안내만 있고, R6 Critical 리스크(860MB idle, 2G cap) 고려 시 OOM 빈도 예상, 자동 재시작 시간, degraded mode(n8n 없이도 기존 기능 정상 동작 보장) 등 사용자 관점 대응이 약함.

### Low Priority
6. **[D5 일관성] "Controlled Nature" 신규 용어 — 출처 미정의**
   - L40 첫 등장. Brief/PRD/Architecture 어디에도 없는 새 디자인 방향명. 이후 단계에서 혼동 방지를 위해 출처 또는 정의 추가 권장.

7. **[D6 리스크] Admin=CEO 1인 창업자 UX 충돌 미탐색**
   - L122에 언급만 있고, 두 앱 간 전환 빈도/사이드바 이중 노출/알림 중복 등 실제 UX 마찰 분석이 없음.

---

## Cross-talk 요약
- **Winston/Amelia (Critic-A)에게 확인 요청**: DC-1 aria-live 패널의 구체적 구현 방식 — Shadow DOM 분리? 같은 React 트리 내? ARIA role 선택?
- **Dana (Security)에게 확인 요청**: DO-2의 4-layer sanitization 실패 시 사용자 피드백 UX — silent strip vs 에러 메시지 표시?
- **John/Bob (Critic-C)에게 확인 요청**: DO-4 온보딩 "테스트 태스크 예약" 완료율 측정 가능한 메트릭이 있는지?

---

## 최종 판정 (R1)

**7.95/10 — ✅ PASS**

Discovery 단계로서 프로젝트 비전, 사용자, 디자인 과제, 기회를 포괄적이고 정확하게 다뤘음. PRD/Brief/Architecture와의 정합성이 뛰어남. 에러 상태/빈 상태/로딩 상태의 체계적 커버리지와 WebSocket fallback UX 추가를 권장하며, 이는 Step 3 Core Experience에서 자연스럽게 보완 가능.

---

## R2 Re-Score (Fixes Applied)

**19 fixes applied** (fix log: `_bmad-output/party-logs/stage5-discovery-fixes.md`)

### Quinn 이슈 검증 결과

| # | 이슈 | 상태 | 검증 |
|---|------|------|------|
| 1 | [High] 에러 상태 UI 누락 | ✅ 해결 | DC-1 L133: assertive for errors, L137: WS fallback. DC-3 L160: 저장 실패 롤백. DC-4 L173: 크론 실패 알림 |
| 2 | [High] WS fallback 미정의 | ✅ 해결 | DC-1 L137: stale indicator + retry banner + 3초 자동 재연결 (최대 5회) + 새로고침 버튼 |
| 3 | [Med] 빈 상태 부족 | ✅ 해결 | DC-1 L139: 에이전트 0명 빈 사무실 + CTA. DC-4 L172: Reflection 0건 placeholder + "약 24시간 소요" 안내 |
| 4 | [Med] 로딩 상태 미정의 | ✅ 해결 | DC-1 L138: 크림 배경 + 스피너 + skeleton 실루엣 + 점진적 표시. DC-3 L161: 5개 슬라이더 skeleton |
| 5 | [Med] n8n OOM 전략 미흡 | ✅ 해결 | DC-5 L186: OOM 빈도 조건 (동시 5+ 실행), degraded mode (ARGOS 독립), "n8n 오프라인" 배너 |
| 6 | [Low] "Controlled Nature" 출처 | ✅ 해결 | L40: "(Vision & Identity §2.3)" 출처 명시 |
| 7 | [Low] 1인 창업자 UX | ✅ 해결 | L122: 앱 전환 네비게이션 링크, CEO 초대 단계 조건부 스킵 |

### R2 차원별 점수

| 차원 | R1 | R2 | 변화 근거 |
|------|-----|-----|----------|
| D1 구체성 | 8 | **9** | FCP/TTI 분리 (1.5초/3초), DC-2 에이전트 수 임계값 (≤10/11-30/30+), WS retry 구체화 (3초/5회), graceful degradation 3단계 (500ms→2s, 60→30fps, 리스트뷰) |
| D2 완전성 | 8 | **9** | 에러 상태 전 DC 커버, 빈 상태 DC-1/DC-4 추가, 로딩 상태 DC-1/DC-3 추가, DC-7 서버 리소스 신설, FR-MKT 마케팅 UX 추가 |
| D3 정확성 | 9 | **9** | CEO 앱 ~35페이지 (GATE/FR-UX 반영), DC-6 ~67페이지 (Brief §4 기준) — 수정됨. 신규 추가 내용에 오류 없음 |
| D4 실행가능성 | 7 | **8** | WS fallback 플로우, graceful degradation 순서, 로딩/빈 상태 UI 패턴이 구체화되어 구현 방향 더 명확 |
| D5 일관성 | 9 | **9** | "Controlled Nature" 출처 명시, Sovereign Sage v2↔v3 구분 추가, 페이지 수 정합 |
| D6 리스크 | 7 | **9** | WS fallback 완전 정의, OOM degraded mode, 200KB 번들 초과 fallback (리스트 뷰), DC-7 서버 리소스 병목 신설, Reflection 비용 폭주 경고, graceful degradation 순서 |

### R2 가중 평균 계산

| 차원 | 점수 | 가중치 | 가중 점수 |
|------|------|--------|-----------|
| D1 구체성 | 9 | 10% | 0.90 |
| D2 완전성 | 9 | 25% | 2.25 |
| D3 정확성 | 9 | 15% | 1.35 |
| D4 실행가능성 | 8 | 10% | 0.80 |
| D5 일관성 | 9 | 15% | 1.35 |
| D6 리스크 | 9 | 25% | 2.25 |

### **R2 가중 평균: 8.90/10 ✅ PASS (Excellent)**

R1 7.95 → R2 8.90 (+0.95). 모든 이슈 해결됨. 잔여 이슈 없음.
