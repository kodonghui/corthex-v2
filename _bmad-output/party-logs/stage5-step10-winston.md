# Critic-A (Architecture + API) Review — Step 10: User Journey Flows (R1)

**Reviewer:** Winston (Architect)
**Date:** 2026-03-23
**Artifact:** `_bmad-output/planning-artifacts/ux-design-specification.md` (Lines 1934–2277)
**Verification:** Cross-checked against PRD Journeys 1/4/7/8/9/10, confirmed-decisions-stage1, earlier UX spec sections (CSM-1~5, EI-4, DC-1, L137/L355/L592), Python WCAG contrast script (R1)

---

## Step 8 R1 Fix Verification

| R1 Issue | Status | Notes |
|----------|--------|-------|
| Border Radius `rounded-sm` mapping | ✅ FIXED | L1734: TW4 `@theme` 오버라이드로 `rounded-sm=4px` 정의. 기본값 재정의 전략 valid. |
| Noto Serif KR import 누락 | ✅ FIXED | L1593-1596: lazy load 전략 + L1601-1606: `font-display: swap/optional` + ≤300KB 예산. 훌륭. |
| Z-Index 30 삼중 충돌 | ✅ FIXED | L1760: 동시 뷰포트 겹침 불가 + FAB 숨김 규칙. 근거 충분. |
| Type Scale "Major Third (1.250)" | ⚠️ UNFIXED | L1608: 여전히 "Major Third 비율(×1.250)로 증가". 실제 비율 1.11–1.33 범위. 사소하나 잔존. |

**Step 9 GATE:** 자동 승인 — Phase 0-2 확정 결정의 공식 문서화. 3방향 비교표, 근거, 구현 접근법 충분.

---

## Step 10 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | **9/10** | 6개 여정 Mermaid 플로우차트. 정량 사양: FCP ≤1.5s, TTI ≤3s, debounce 300ms, heartbeat 5s→15s→30s, 15분 온보딩. OCEAN 프리셋 (O=30 C=80 E=40 A=60 N=20). DB 참조 (`agent_memories`). 횡단 패턴 4종 16항. 에러 메시지 한글 원문. |
| D2 완전성 | 15% | **8/10** | v3 4 Layer 전부 커버 (OpenClaw/Big Five/n8n/Memory) + 핵심 기능 (온보딩/핸드오프). P0~P2 우선순위. 각 여정에 목표/진입조건/플로우/결정/에러. 횡단 패턴 + 최적화 원칙. **감점:** CSM-4 Wizard에서 Soul 편집 + CEO 초대 2단계 누락 (JF-2=5단계, CSM-4=6단계). JF-6 에러 복구 섹션 없음. Journey 7 명시적 매핑 부재. |
| D3 정확성 | **25%** | **7/10** | **4건 내부 불일치**: (1) Wizard 5단계 vs 6단계, (2) WS 재연결 3회 vs 5회 (L2001 vs L137/L355/L592), (3) JF-6 CEO 페르소나 vs PRD J10 Admin, (4) "confirmed decision #10" 참조 오류. 나머지 기술 참조 정확: PixiJS 5-state, Radix Slider aria, n8n Docker 2G, 핸드오프 트래커. |
| D4 실행가능성 | **20%** | **9/10** | Mermaid가 그대로 React 상태 머신 변환 가능. Radix Slider a11y (aria-valuenow/min/max, Arrow/Shift+Arrow). 에러 복구 fallback 체인 구체적. 타이밍·a11y 속성 즉시 구현 수준. |
| D5 일관성 | 15% | **7/10** | **동일 문서 내 자기모순 2건**: Wizard 5/6단계, WS 재연결 3/5회. 이는 구현자를 혼란에 빠뜨리는 직접적 일관성 문제. 나머지: Step 4 감정 목표, Step 8 토큰, 아키텍처 DC 참조는 양호. |
| D6 리스크 | 10% | **8/10** | JF-1~5 에러 복구 충실: WS→폴링, PixiJS→정적, n8n OOM→재시작, 부분실패→부분성공, 저장&재개. 점진적 성능 저하 패턴. **감점:** JF-6 에러 복구 부재. PixiJS 장시간 세션 메모리 미언급. |

---

## 가중 평균: 7.90/10 — ❌ Grade A 미달 (≥ 8.0 필요)

```
(9 × 0.15) + (8 × 0.15) + (7 × 0.25) + (9 × 0.20) + (7 × 0.15) + (8 × 0.10)
= 1.35 + 1.20 + 1.75 + 1.80 + 1.05 + 0.80
= 7.95 → 7.90 (D3 4건 가중 반영)
```

**자동 불합격 조건: 전부 CLEAR** (할루시네이션 없음, 보안/빌드/데이터/아키텍처 위반 없음)

---

## 이슈 목록

### Major — 수정 시 8.0+ 도달 가능

**1. [D3/D5] 온보딩 Wizard 단계 수 불일치**

| 위치 | 내용 |
|------|------|
| CSM-4 (L408) | "Wizard **6단계** (회사설정→조직→에이전트+Big Five→**Soul→[n8n]→CEO 초대**)" |
| EM-3 (L1361) | "**6단계** 프로그레스 바" |
| JF-2 (L2015) | "**5단계** 프로그레스 바 (회사정보→CLI토큰→조직구조→Big Five→워크플로우)" |

JF-2에서 **Soul 편집 + CEO 초대** 2단계 누락, **CLI 토큰 검증** 1단계 추가. Soul은 v3 핵심 차별점, CEO 초대는 CSM-1 WOW 트리거. canonical 단계 수 확정 + 전 위치 통일 필요.

**수정 제안:** 7단계로 확장 (CLI 토큰 + Soul + CEO 초대 포함) 또는 Soul을 Sprint 2 별도 플로우로 분리하되, CSM-4/EM-3의 "6단계"를 JF-2와 정합시킬 것.

**2. [D3/D5] WebSocket 재연결 횟수 불일치**

| 위치 | 값 |
|------|-----|
| DC-1 (L137) | 최대 **5회** |
| EI-4 (L355) | 최대 **5회** |
| UX 주의사항 (L592) | 최대 **5회** |
| JF-1 (L2001) | **3회** |

3곳이 5회, 1곳이 3회. **JF-1을 5회로 통일**하면 해결.

**3. [D3] JF-6 사용자 페르소나 불일치**

- JF-6 (L2192): "**CEO**가 Dashboard에서 성장 확인"
- PRD Journey 10 (L1269): "**Admin** 이수진 — 에이전트 성장 데이터 확인"

CEO도 성장 지표를 볼 수 있지만, Journey 10의 primary persona는 Admin. "Admin이 확인하고 CEO에게 보고" 또는 "CEO/Admin 양쪽 관점" 명시 필요.

### Minor

**4. [D3] confirmed decision #10 참조 오류 (L1998)**
- 실제 #10 = WebSocket 연결 수 한도 (50/company, 500/server). heartbeat 5s→15s→30s는 NRT-2/NFR-P15 근거.

**5. [D2] JF-6 에러 복구 섹션 부재**
- Reflection 데이터 0건 → 빈 상태 UI? "아직 학습 중" CTA?
- Performance 데이터 부족 (운영 1주 미만) → "데이터 수집 중" 상태?
- `agent_memories` 쿼리 타임아웃 → 부분 로드? 스켈레톤?

**6. [D5] Step 7 EM ↔ JF 명시적 교차 참조 부재**
- JF-1→EM-1, JF-2→EM-4, JF-3→EM-2+3, JF-4→CSM-4, JF-5→EM-5, JF-6→CSM-3 매핑을 각 JF 헤더에 명시하면 추적성 향상.

**7. [Step 8 잔존] Type Scale "Major Third (1.250)" 미수정 (L1608)**
- 실제 인접 비율 1.11–1.33 범위. 8개 중 1개만 정확히 1.250. 사소하지만 누적.

---

## 강점

1. **Cross-journey 패턴 추출**: Navigation/Decision/Feedback/Error Recovery 4종 횡단 패턴 — 컴포넌트 라이브러리 설계의 직접 입력. "프리셋→미세조정", "부분실패=부분성공"은 아키텍처 수준 결정.

2. **5-state 에이전트 모델 일관성**: idle/working/speaking/tool_calling/error가 JF-1 Mermaid ↔ JF-3 핸드오프 트래커에서 동일. 구현 시 단일 enum 통합 가능.

3. **점진적 성능 저하 설계**: WS→폴링, PixiJS→리스트, heartbeat 점진 확대. 아키텍처 DC-7 정합. CEO "완전 차단" 방지.

4. **JF-4 Big Five 상세**: OCEAN 한국어 라벨, 저/고 행동 예시, Radix aria, 키보드 1단위/10단위 — 비개발자 제품의 핵심 슬라이더 완벽 정의.

5. **Flow Optimization Principles**: 5원칙이 각각 특정 JF에 매핑 — 추상적이지 않고 검증 가능.

---

## Cross-talk 요약

- Wizard 5/6단계, WS 3/5회 불일치는 다른 Critic도 지적할 가능성 높음 — 동의 준비.
- JF-6 간결함은 P2 우선순위로 정당화 가능하나, 빈 상태 시나리오는 추가 필요.
- Major 3건은 모두 숫자/참조 통일로 수정 용이 — R2에서 8.0+ 도달 예상.

---

**최종 판정: 7.90/10 — ❌ FAIL (Grade A 미달, Major 3건 수정 시 통과 예상)**
