# Party Mode Log: spec-04-trading — Round 2 (Adversarial)
> 날짜: 2026-03-09
> 문서: _uxui-refactoring/specs/04-trading.md
> 리뷰어: 7-expert panel (Adversarial Lens)

---

## Round 1 Fix Verification

| # | Round 1 이슈 | 수정 확인 |
|---|-------------|----------|
| 1 | 에러 상태 UI 미정의 | OK — 섹션 4.4 추가됨 (로딩/에러/채팅에러/빈 상태) |
| 2 | data-testid 4개 누락 | OK — 6개 추가됨 (error-state, stock-add, chart-period-selector, portfolio-summary, chat-overlay-toggle, retry-button) |
| 3 | 태블릿 오버레이 미정의 | OK — 섹션 8에 "우측 슬라이드인 패널, position: fixed, width: 360px" 구체화 |
| 4 | 테스트 항목 부족 | OK — 8개 → 14개로 확대 (에러/빈/포트폴리오/기간/비교/태블릿 추가) |
| 5 | 관심종목 추가 플로우 | OK — 섹션 1에 시나리오 추가 |

---

## Adversarial Expert Debate

### 📋 John (PM)
Round 1 수정이 잘 반영되었습니다. 하지만 한 가지 더 — **실시간 가격 "60초 자동 갱신"이 섹션 9에만 언급되고, Banana2 프롬프트에서는 "real-time prices"로만 표현됩니다.** 갱신 주기가 프롬프트에 없어도 디자인에는 영향이 없으므로 큰 문제는 아니지만, 마지막 갱신 시각 표시 UI가 spec에 없는 건 사용자 신뢰 측면에서 아쉽습니다.

### 🏗️ Winston (Architect)
태블릿 슬라이드인 정의가 추가되어 좋습니다. 그런데 **데이터 바인딩 테이블(섹션 6)에 태블릿 채팅 오버레이 상태(`isChatOpen`)가 빠져 있습니다.** 슬라이드인 열림/닫힘을 제어하려면 useState가 하나 더 필요한데, 현재 mobileTab, isCompareMode, CenterPanel 3개만 있어요. 이건 구현 시 혼란을 줄 수 있습니다.

### 🎨 Sally (UX)
Round 1에서 에러 상태가 잘 추가되었어요. 3클릭 체크: 종목 선택(1) → 차트 확인(0, 자동), 비교 모드(1, 토글), 채팅(0, 항상 보임), 검색→추가(2, 검색입력+추가클릭) — 모두 3클릭 이내입니다. 문제없어요.

### 💻 Amelia (Dev)
testid 20개로 충분한 커버리지입니다. Banana2 프롬프트 점검 — 데스크톱 프롬프트에서 "empty state"와 "loading state"가 포함되어 있고, 레이아웃 강제 없이 기능 중심으로 잘 작성되었어요. **한 가지, Banana2 프롬프트에 에러 상태 디자인 요청이 빠져 있습니다.** 섹션 4.4에서 에러 상태를 정의했는데, 프롬프트에서 에러 상태 시안을 요청하지 않으면 디자인이 나오지 않습니다.

### 🧪 Quinn (QA)
테스트 14개로 edge case 커버리지가 개선되었습니다. 드래그 정렬 테스트가 여전히 빠져 있지만, 드래그 테스트는 Playwright에서 구현 난이도가 높아 별도 처리하는 게 맞겠어요. 나머지는 충분합니다.

### 🏃 Bob (SM)
UI-only 범위 확인: 5개 컴포넌트 수정 + 태블릿 슬라이드인 추가. 슬라이드인은 CSS position: fixed + 토글 state만 추가하면 되므로 범위 안입니다. "절대 건드리면 안 되는 것" 리스트가 명확하고, 기능 로직 변경은 없어요. 범위 적절합니다.

### 📊 Mary (BA)
비즈니스 가치 명확합니다. 트레이딩 워크스테이션은 CORTHEX의 핵심 차별화 포인트이고, 이번 리팩토링은 그 가치를 훼손하지 않으면서 비주얼 품질만 올립니다. 에러/빈 상태 추가로 첫 사용자 경험도 개선될 거예요.

---

## Cross-talk

**Amelia → Winston:** 데이터 바인딩에 isChatOpen 추가하는 건 간단한 useState 하나라 구현에 영향 작지만, spec 완성도를 위해 넣는 게 맞겠어요.

**Quinn → Amelia:** Banana2 프롬프트에 에러 상태 요청 추가하는 건 동의합니다. "Error state — when data fails to load, show retry prompt" 한 줄이면 됩니다.

---

## New Issues Found (Round 2)

| # | 심각도 | 이슈 | 제안 |
|---|--------|------|------|
| 1 | 보통 | Banana2 프롬프트에 에러 상태 디자인 요청 누락 | Required elements에 "7. Error state" 추가 |
| 2 | 경미 | 데이터 바인딩 테이블에 isChatOpen (태블릿 오버레이 상태) 누락 | 섹션 6에 추가 |

---

## UXUI Checklist

- [x] Core actions within 3 clicks? — 종목선택(1), 비교토글(1), 채팅(0), 검색추가(2)
- [x] Empty/error/loading states defined? — 섹션 4.4에 4가지 상태 모두 정의
- [x] data-testid for all interactive elements? — 20개, 모든 인터랙션 커버
- [x] All existing features covered? — 섹션 9 체크리스트 6/6 완료
- [x] Banana2 prompt context+function centered (no layout forcing)? — 기능 중심, 레이아웃 강제 없음 (수정 후)
- [x] Responsive breakpoints (375px, 768px, 1440px) specified? — 섹션 8에 3단계 정의
- [x] UI-only scope (no feature logic changes)? — "절대 건드리면 안 되는 것" 리스트 명확

---

## Final Score: 8/10

**PASS**

**감점 사유:**
- -1: Banana2 프롬프트에 에러 상태 누락 (Round 2에서 발견, 수정 예정)
- -1: 데이터 바인딩 테이블 불완전 (isChatOpen 누락)

**총평:** 트레이딩 워크스테이션의 핵심 기능 6개가 빠짐없이 커버되고, Round 1에서 발견된 에러/로딩 상태, testid, 태블릿 오버레이 이슈가 모두 수정되었습니다. Round 2의 경미한 2건도 아래에서 바로 수정합니다.
