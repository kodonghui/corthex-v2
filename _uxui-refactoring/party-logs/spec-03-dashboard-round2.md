# Party Mode Round 2 — Spec 03 Dashboard (Adversarial Lens)

**날짜:** 2026-03-09
**대상:** `_uxui-refactoring/specs/03-dashboard.md` (Round 1 수정 후)
**모드:** Adversarial (의도적 결함 탐색)

---

## Round 1 수정 검증

| Round 1 이슈 | 수정 여부 | 검증 |
|--------------|----------|------|
| Empty 상태 미정의 | OK | 섹션 8.3에 5개 Empty 케이스 추가됨 |
| quick-action-btn 개별 구분 | OK | `quick-action-btn-{id}` 패턴으로 변경됨 |
| budget-percentage/projected testid | OK | data-testid 목록에 추가됨 |
| 최근 사용 명령어 미언급 | OK | 퀵 액션 설명에 "최근 사용 순 서버 정렬" 추가됨 |

---

## Expert Reviews (Adversarial)

### Sally (UX)
Banana2 프롬프트에서 "Error state — clear message when data cannot be loaded"만 있고 **Empty 상태 시각 디자인이 프롬프트에 포함되지 않았습니다.** Banana2가 Empty 상태 UI를 생성하지 않으면 개발자가 임의로 만들게 됩니다. 프롬프트에 empty state 시각 요소를 추가해야 합니다.

### Winston (Architect)
컴포넌트 목록과 data-testid 목록이 정합합니다. UI-only 범위도 잘 유지되어 있습니다. "건드리면 안 되는 것" 리스트도 적절합니다. 구조적 문제 없음.

### Amelia (Dev)
Round 1 수정으로 testid가 보완되었습니다. `satisfaction-period` testid가 3개 버튼(7d/30d/all)인데 하나의 testid만 있어요 — 하지만 이건 버튼 그룹의 컨테이너 testid로 사용하면 되니 괜찮습니다. Playwright 테스트에서 에러 상태(#12)와 예산 퍼센트(#13)가 추가되어 커버리지가 좋아졌습니다.

### Quinn (QA)
Empty/Error/Loading 3종 상태가 모두 정의되어 좋습니다. 한 가지 — **Playwright 테스트 항목에 WebSocket 연결 상태 표시 테스트가 없습니다.** `ws-status` testid가 있지만 테스트 항목 12개 중 WS 상태 확인이 빠져 있어요. 연결됨/끊김 표시 확인 테스트를 추가해야 합니다.

### John (PM)
v1 기능이 모두 커버되어 있습니다. "최근 사용 순 서버 정렬" 명시도 좋습니다. 기능 누락 없음.

### Bob (SM)
범위 적절합니다. Empty 상태 추가로 약간 작업량이 늘었지만 UI-only 범위 내입니다. 리스크 없음.

### Mary (BA)
비즈니스 가치 명확합니다. CEO가 아침에 빠르게 상태를 파악하는 시나리오가 잘 지원됩니다. Empty 상태가 추가되어 첫 사용자 경험도 고려되었습니다.

---

## Cross-talk

**Quinn → Amelia:** "ws-status testid는 있는데 Playwright 테스트에 WS 연결 상태 확인이 없어요. 추가해야 하지 않을까요?"

**Amelia → Quinn:** "맞습니다. 간단히 `ws-status` 요소 존재 확인 테스트를 추가하면 됩니다. 실제 WS 연결/끊김 시뮬레이션은 e2e에서 어려울 수 있지만, 최소한 인디케이터가 렌더링되는지는 확인해야 합니다."

---

## New Issues (Round 2)

| # | 심각도 | 내용 | 조치 |
|---|--------|------|------|
| 1 | **Low** | Banana2 프롬프트에 Empty 상태 디자인 요청 누락 | 프롬프트에 empty state 항목 추가 |
| 2 | **Low** | Playwright 테스트에 ws-status 확인 항목 누락 | 테스트 항목 #14로 추가 |

---

## UXUI Checklist

- [x] Core actions within 3 clicks? — 요약 카드 스캔(0클릭), 기간 토글(1클릭), 퀵 액션(1클릭), 드릴다운(1클릭)
- [x] Empty/error/loading states defined? — 섹션 8에 3종 상태 모두 정의
- [x] data-testid for all interactive elements? — 18개 testid 정의, 동적 패턴 포함
- [x] All existing features covered? — v1 spec 9번 항목 전체 체크됨
- [x] Banana2 prompt context+function centered (no layout forcing)? — "YOU DECIDE" 명시, 레이아웃 강제 없음
- [x] Responsive breakpoints (375px, 768px, 1440px) specified? — 섹션 9에 3단계 정의
- [x] UI-only scope (no feature logic changes)? — "건드리면 안 되는 것" 6개 항목 명시

---

## Final Score

**8 / 10 — PASS**

**감점 사유:**
- -1: Banana2 프롬프트에 Empty 상태 시각 요소 미포함 (수정 적용)
- -1: WS 상태 테스트 항목 누락 (수정 적용)

**종합 평가:** 대시보드 spec이 전반적으로 잘 작성되어 있습니다. 데이터 바인딩, 색상 체계, 반응형 breakpoint 모두 명확하고, v1 기능 커버리지도 완전합니다. Round 1~2에서 발견된 이슈들(Empty 상태, testid 개선, Banana2 프롬프트 보완)이 모두 수정 적용되어 구현 준비가 완료된 상태입니다.
