# Critic-B (QA) Review — Step 7: Defining Experience Deep Dive

**Reviewer:** Quinn (QA Engineer)
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 1009-1374)
**Date:** 2026-03-23
**Rubric:** Critic-B weights (D1=10%, D2=25%, D3=15%, D4=10%, D5=15%, D6=25%)
**Grade Target:** B (avg ≥ 7.0)

---

## Step Requirements Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Defining experience clearly articulated | PASS | "자연어로 AI 팀에게 일을 시키면, 에이전트들이 실시간으로 일하는 모습을 눈으로 본다." + 경쟁사 대비표 |
| User mental model thoroughly analyzed | PASS | CEO ("진짜 회사처럼") + Admin ("HR+IT 관리자") + 공통 은유 7개 + 혼란 가능 지점 각 4건 |
| Success criteria established | PASS | SC-1~5 전부 수치 목표 + 측정 방법 + 감정 정의 |
| Novel vs. established patterns evaluated | PASS | Established 8 + Novel 6 + Innovative Combinations 3 |
| Experience mechanics designed in detail | PASS | EM-1~4 전부 Initiation/Interaction/Feedback/Completion/Error Path |

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | SC-1~5 전부 구체적 수치 (라우팅 80%/95%, FCP ≤1.5초, TTI ≤3초, 상태 반영 ≤500ms, 슬라이더 드래그 0ms/60fps, debounce 100ms, 관찰 20건 트리거, 성공률 ≥10%p/4주, 온보딩 ≤15분, 이탈률 ≤5%, 태스크 예약 ≥90%). EM-1~4 타임스탬프 시나리오 (0.5초/1초/1~2초/3~20초). 경쟁사 4사 비교. Wizard 6단계 각각 시간 추정. |
| D2 완전성 | 8/10 | Step 7 요구사항 5가지 전부 커버. EM-1~4 전부 Error Path 포함 — 훌륭. **양호**: EM-1 WS 끊김, EM-2 부서 삭제 확인/Undo/구문 오류, EM-3 크론 실패/보안 위반, EM-4 15분 초과/토큰 실패/초대 미완료. **누락**: (1) **접근성(a11y) 고려가 EM 흐름에 전혀 없음** — Novel 패턴(Big Five 슬라이더, /office PixiJS) 교육 전략에서 스크린리더/키보드 사용자를 어떻게 교육할 것인지 미정의. Step 2 DC-1/DC-3에서 aria 속성을 정의했으나 Step 7 EM 흐름에서 이를 재참조하지 않음. (2) EM-1~4에 **모바일/반응형 분기 없음** — EM-1 `/office` split-screen은 데스크톱 전제, 모바일에서는? DC-1에서 "모바일 리스트 뷰"를 정의했으나 EM 흐름에 미반영. (3) **Secondary User (일반 직원)의 경험 미포함** — Chat/Messenger는 일반 직원도 사용하는데 EM에서 CEO만 다룸. |
| D3 정확성 | 9/10 | **PRD와 대조 확인**: SC-1 라우팅 80%/95% ✅ (PRD L386, L480, L616), SC-2 FCP 1.5초/TTI 3초 ✅ (Step 2 Fix 일치), SC-4 관찰 20건 트리거 ✅ (PRD L376, L951, L1279), EM-1 타임아웃 15초 ✅ (PRD L570 "각 단계 ≤15초", L1150). EM-3 새벽 3시 크론 ✅ (PRD L1279). EM-3 "Voyage AI 시맨틱 분석" — PRD에서 Voyage AI 확정됨 (Gemini 임베딩 폐기, CLAUDE.md). **사소한 불일치**: SC-4 "4주 후 ≥10%p 개선" — PRD에서 이 구체적 수치의 출처를 찾지 못함. UX 스펙 신규 제안으로 합리적이나 PRD와의 명시적 연결 없음. |
| D4 실행가능성 | 8/10 | EM-1~4 스텝별 흐름이 구현 가능한 수준으로 상세. 특히 EM-1 Processing 단계(0.5초→1초→1~2초→3~20초)는 WebSocket 이벤트 타이밍으로 직접 변환 가능. EM-4 Wizard 6단계 각각 시간/콘텐츠 명확. SC 측정 방법도 구현 가능 (activity_logs, Web Vitals, Ticker stats). |
| D5 일관성 | 9/10 | Step 2 DC-1~6 대응 방안과 정합: WS fallback (DC-1 L137 → EM-1 Error Path), Reflection 크론 (DC-4 → EM-3), 온보딩 Wizard (Step 2 온보딩 플로우 → EM-4). Step 3 Core Loop CEO/Admin 구조 반영. SC-2 FCP/TTI가 Step 2 Fix와 일치. 경쟁사 비교표가 DO-1 차별점과 정합. **사소한**: EM-2 "Ctrl+Z undo (최근 10회)" — NEXUS에서 undo 기능은 이전 Step에서 미언급. 신규 제안으로 합리적이나 표시 없음. |
| D6 리스크 | 7/10 | **식별됨**: EM-1~4 전부 Error Path 포함 — 라우팅 실패, 타임아웃, WS 끊김, 부서 삭제 확인, Soul 구문 오류, 크론 실패, 보안 위반, 비용 초과, 15분 초과, 토큰 실패. **누락**: (1) **Secretary 라우팅 <50% 시나리오** — PRD L1764에 "3단계 폴백 (규칙→태그→프리라우팅)" 명시되어 있으나 EM-1 Error Path에 없음. SC-1 80% baseline = 20% 실패율은 높은 편 — 이 20% 케이스의 UX 경험이 약함. "다른 에이전트에게" 버튼 외에 자동 폴백 메커니즘의 사용자 인지 방법 미정의. (2) **동시 접속 과부하 시 UX** — PRD L1264-1265에 "/office WebSocket 연결 50+ 시 제한 + heartbeat fallback 5→15→30초" 명시. EM-1에서 이 degraded mode 사용자 체감 미포함. (3) **Big Five 슬라이더 ↔ 실제 행동 변화의 불확실성 리스크** — SC-3 "다음 Chat 응답부터 톤 변화 체감"이라고 하지만, LLM의 성격 반영이 사용자 기대만큼 명확하지 않을 수 있음. 이 불확실성에 대한 fallback UX (기대 관리, 미묘한 차이 설명 등) 미정의. (4) **Novel Pattern 교육 실패 리스크** — /office, Secretary 라우팅, Big Five, Reflection 4가지 Novel 패턴 중 사용자가 학습 실패 시 fallback 경로 미정의. 온보딩 오버레이 1회로 충분한가? 재교육 접근 방법 (도움말 아이콘, 가이드 모드 등)은? |

---

## 가중 평균 계산

| 차원 | 점수 | 가중치 | 가중 점수 |
|------|------|--------|-----------|
| D1 구체성 | 9 | 10% | 0.90 |
| D2 완전성 | 8 | 25% | 2.00 |
| D3 정확성 | 9 | 15% | 1.35 |
| D4 실행가능성 | 8 | 10% | 0.80 |
| D5 일관성 | 9 | 15% | 1.35 |
| D6 리스크 | 7 | 25% | 1.75 |

### **가중 평균: 8.15/10 ✅ PASS (Great, Grade A)**

---

## 이슈 목록

### High Priority

1. **[D2+D6] Novel 패턴 접근성(a11y) 커버리지 없음**
   - EM-1~4 흐름에서 스크린리더/키보드 사용자의 경험이 전혀 다뤄지지 않음.
   - 특히 Novel 패턴: (a) /office PixiJS = 캔버스 스크린리더 불가 → EM-1 `/office` 흐름에 "aria-live 텍스트 대안 패널에서도 동일 흐름 체험 가능" 1줄 추가. (b) Big Five 슬라이더 = 키보드 Arrow keys 조작 → EM-2 성격 설정 흐름에 "키보드: Tab으로 슬라이더 이동, Arrow로 값 조정" 1줄 추가.
   - Step 2 DC-1/DC-3에서 aria 속성을 이미 정의했으므로, EM에서 참조만 하면 됨.

2. **[D6] Secretary 라우팅 20% 실패 케이스의 UX 흐름 부족**
   - SC-1 baseline 80% = 5회 중 1회 misroute. PRD L1764에 3단계 폴백 (규칙→태그→프리라우팅)이 있으나 EM-1 Error Path에는 "다른 에이전트에게" 수동 버튼만 있음.
   - 권장: (a) misroute 시 자동 감지 메커니즘의 사용자 표시 방법 추가 (예: "이 응답이 적절하지 않다면" 피드백 버튼), (b) 반복 misroute 시 Admin 알림 메커니즘 언급.

### Medium Priority

3. **[D2] EM 흐름에 모바일/반응형 분기 없음**
   - EM-1 "split-screen 또는 별도 탭"은 데스크톱 전제. 모바일에서 Chat+/office 동시 경험은 불가 — 이 대안 흐름 (순차 탐색? 알림 기반?) 미정의.
   - DC-1에서 "모바일 리스트 뷰" 정의 완료 — EM에서 "모바일: /office 리스트 뷰에서 상태 텍스트로 확인" 1줄 참조로 충분.

4. **[D6] Big Five 행동 변화 불확실성 리스크**
   - SC-3 "다음 Chat 응답부터 톤 변화 체감" — LLM의 성격 반영은 프롬프트 의존적이며 사용자 기대만큼 극적이지 않을 수 있음.
   - 권장: SC-3에 "변화가 미묘할 경우의 기대 관리" 또는 "A/B 비교 기능으로 차이 확인" 안내 추가. Step 3 CSM-2에서 "성실성 30 vs 85 → 전혀 다른 응답"이라고 했는데, 50 vs 55 같은 미세 차이는?

5. **[D6] Novel 패턴 재교육 접근 방법 부재**
   - /office 온보딩 오버레이 "1회"만 언급. 사용자가 dismiss 후 잊어버리면? 도움말 아이콘, 가이드 모드, "다시 보기" 옵션 등 재교육 경로 미정의.

### Low Priority

6. **[D3] SC-4 "4주 후 ≥10%p 개선" — PRD 출처 없음**
   - PRD에서 이 구체적 수치의 근거를 찾지 못함. UX 스펙 신규 제안으로 합리적이나, 출처 또는 "UX 목표 (신규)" 표시 권장.

7. **[D5] EM-2 "Ctrl+Z undo (최근 10회)" — 이전 Step 미언급**
   - NEXUS undo 기능이 이 Step에서 처음 등장. Step 3/Step 6에서 미정의. 신규 제안으로 합리적이나 표시 없음.

---

## 접근성(a11y) 상세 분석 (sally 중점 리뷰 요청 대응)

### Novel 패턴별 a11y 커버리지 평가

| Novel 패턴 | Step 2 DC에서 정의된 a11y | Step 7 EM에서 반영됨? | 상태 |
|-----------|-------------------------|---------------------|------|
| /office PixiJS | DC-1: aria-live="polite" 텍스트 대안 패널, assertive for error, 이중 인코딩, 모바일 리스트 뷰 | EM-1: `/office` 흐름에 a11y 대안 경로 **미참조** | GAP |
| Big Five 슬라이더 | DC-3: aria-valuenow, aria-valuemin/max, aria-label, Arrow keys 조작 | EM-2: 성격 설정 흐름에 키보드 **미참조** | GAP |
| Secretary 라우팅 | (해당 없음 — 텍스트 기반) | EM-1: 라우팅 경로 태그는 시맨틱 텍스트 ✅ | OK |
| Reflection 알림 | DC-4: 차트 키보드 탐색, aria-label, 스크린리더 텍스트 대안 | EM-3: Channel A/B/C에 a11y **미참조** | GAP |
| Soul 편집 | (모나코 에디터 기본 a11y) | EM-2: 모나코 에디터 a11y **미언급** | MINOR GAP |
| NEXUS 조직도 | (React Flow 기본 a11y) | EM-2: React Flow a11y **미언급** | MINOR GAP |

**요약**: Step 2에서 정의한 a11y 대응 방안이 Step 7 EM 흐름에서 연결되지 않음. a11y 사용자의 "지시→관찰→성장" 경험 흐름이 불완전.

**권장 수정**: 각 EM에 `[접근성 참고: DC-1/DC-3/DC-4]` 참조 1줄 추가. 또는 EM-1~4 각각에 "[스크린리더/키보드 대안]" 1~2줄 병행 경로 추가.

---

## Cross-talk

- **Dev에게**: SC-2 FCP ≤1.5초 + TTI ≤3초 — PixiJS 번들 200KB + WebSocket 연결 시간 고려 시 TTI ≤3초는 빠듯할 수 있음. 번들 200KB 초과 fallback (리스트 뷰)에서의 TTI 기준도 정의 필요.
- **John에게**: SC-4 "4주 후 ≥10%p" PRD 미출처 — PM 관점에서 이 수치의 실현 가능성? Reflection 20건 트리거 → 일 1회 크론 → 4주 28회 실행 기회 → 10%p 개선은 어느 정도 합리적인가?
- **Winston에게**: IC-1~3 Innovative Combinations — 이들 조합이 아키텍처에 미치는 영향 (WebSocket 채널 공유, 상태 동기화 timing) 검토 요청.

---

## 최종 판정

**8.15/10 — ✅ PASS (Great, Grade A)**

Step 7은 "지시→관찰→성장" 핵심 경험을 매우 구체적이고 정확하게 풀어냈음. SC-1~5의 수치 목표가 PRD와 정합하고, EM-1~4의 Error Path가 충실함. 주요 개선점은 a11y 경험 흐름의 명시적 연결(Step 2 DC 참조)과 Secretary 라우팅 20% 실패 케이스 UX 보강.

---

## R2 Verification (12 fixes applied)

### Issue-by-Issue Resolution Check

| # | R1 Issue | Severity | Status | Evidence |
|---|----------|----------|--------|----------|
| 1 | Novel 패턴 a11y 커버리지 없음 | HIGH | **RESOLVED** | EM-1 L1265: DC-1 aria-live 참조 + assertive/polite 구분. EM-2 L1308: DC-3 슬라이더 aria + 키보드 Arrow. EM-3 L1353: DC-4 Reflection 스크린리더 + Dashboard 데이터 테이블 대체. EM-4 L1400: CSM-4 Wizard 키보드 + focus + aria-valuenow. EM-5 L1433: CSM-5 키보드 탐색 + n8n 외부 의존 명시. **전 5개 EM에 a11y 참조 추가.** |
| 2 | Secretary 20% 실패 UX 부족 | HIGH | **RESOLVED** | L1256-1260: 4-tier error handling — (1) PRD 3단계 자동 폴백 (Soul 규칙→태그→프리라우팅), (2) routing 태그로 CEO 인지, (3) "다른 에이전트에게" 수동 복구, (4) misroute 신고 1-click + 3회+ Admin 알림. 서버/UX 레이어 분리 명확. |
| 3 | EM 흐름 모바일/반응형 분기 없음 | MEDIUM | **RESOLVED** | L1247-1248: "데스크톱 전용" 표기 + "(모바일: Hub 에이전트 상태 리스트 뷰로 대체 — Step 3 Platform Strategy 반응형 참조)" ✅ |
| 4 | Big Five 행동 변화 불확실성 리스크 | MEDIUM | **RESOLVED** | L1146: 3가지 UX 대응 — (1) "극단값일수록 차이 뚜렷" 안내, (2) A/B 미리보기 버튼 (변경 전/후 샘플 응답), (3) 중간값 부제. Excellent addition. |
| 5 | Novel 패턴 재교육 경로 부재 | MEDIUM | **RESOLVED** | L1202: 3가지 재교육 경로 — (1) `?` 아이콘 미니 팝업 (항시 접근), (2) Settings "튜토리얼 다시 보기", (3) Hub 도움말 위젯. |
| 6 | SC-4 "4주 ≥10%p" PRD 미출처 | LOW | **RESOLVED** | L1154: "v3 UX 신규 제안 — PRD 명시값 없음" 명시 ✅ |
| 7 | EM-2 Ctrl+Z 이전 Step 미언급 | LOW | **RESOLVED** | L1305: "EP-2 안전망 — v3 UX 신규 제안" 주석 ✅ |

### Bonus Improvements (from other critics, verified)

| Fix | Source | Line(s) | Quality |
|-----|--------|---------|---------|
| SC-3 "0ms" → "60fps 유지" | dev must-fix | L1139 | Correct — 60fps = 16.7ms/frame, "0ms" physically impossible |
| SC-2 병렬 실행 명시 | dev must-fix | L1129 | Excellent — shell+WS parallel = TTI ≤3s achievable |
| Haiku tier timing annotation | dev should-fix | L1241 | Good — "(Haiku ~300ms. Sonnet ~1s)" sets realistic expectation |
| CodeMirror 6 recommendation | dev should-fix | L1292-1293 | Good — ~100KB vs Monaco ~5-10MB. Architecture Decision noted |
| Rate limit UX | dev should-fix | L1263 | Good — Send 비활성 + cooldown. a11y note at L1265 covers it |
| SC-4 confidence ≥ 0.7 | winston | L1152 | Correct — matches FR-MEM3, Architecture D28 |
| EM-5 n8n 워크플로우 흐름 | winston | L1405-1434 | Excellent — full EM structure with OOM/API error paths |
| EM-4 WOW fallback | john | L1389-1393 | Excellent — auto-demo task when Admin skips test task |
| 온보딩 시간 PRD 차이 설명 | quinn low | L1402 | Good — v2 10분 + v3 Big Five/n8n 추가 = ≤15분 |

### R2 Dimension Scores (Critic-B Weights)

| Dimension | R1 | R2 | Weight | Weighted | Evidence |
|-----------|----|----|--------|----------|----------|
| D1 Specificity | 9 | **9**/10 | 10% | 0.90 | Maintained. Haiku ~300ms/Sonnet ~1s, CodeMirror ~100KB/Monaco ~5-10MB, confidence ≥ 0.7 precision added. |
| D2 Completeness | 8 | **9**/10 | **25%** | 2.25 | All 5 EM a11y references ✅. EM-5 n8n flow new ✅. Re-education 3 paths ✅. Big Five expectation management ✅. Mobile EM-1 note ✅. Rate limit error path ✅. |
| D3 Accuracy | 9 | **9**/10 | 15% | 1.35 | Maintained. SC-4 PRD source annotated ✅. SC-3 "0ms"→"60fps" corrected ✅. SC-4 confidence matches FR-MEM3 ✅. Onboarding time v2 vs v3 explained ✅. |
| D4 Implementability | 8 | **9**/10 | 10% | 0.90 | CodeMirror 6 with bundle size ✅. Rate limit UX pattern ✅. A/B preview button ✅. WOW fallback auto-demo ✅. n8n OOM recovery ✅. |
| D5 Consistency | 9 | **9**/10 | 15% | 1.35 | Maintained. SC-4 confidence ≥ 0.7 matches FR-MEM3/D28. All DC/CSM references verified correct. Onboarding time reconciled. |
| D6 Risk Awareness | 7 | **9**/10 | **25%** | 2.25 | Secretary 4-tier error handling ✅. Rate limit UX ✅. WOW fallback ✅. Big Five expectation management ✅. Re-education paths ✅. n8n OOM/API failure ✅. CodeMirror bundle warning ✅. |

### **R2 Weighted Average: 9.00/10 ✅ PASS — Grade A**

**Improvement: 8.15 → 9.00 (+0.85)**

All 7 issues resolved. 9 bonus fixes from other critics significantly improved completeness and risk awareness. Standout additions: EM-5 n8n flow (winston), WOW fallback auto-demo (john), Big Five A/B preview (john+quinn), 5-EM a11y reference chain (quinn).
