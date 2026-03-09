# [Party Mode Round 2 -- Adversarial Review] 04-trading

> 날짜: 2026-03-09
> 문서: _uxui-refactoring/specs/04-trading.md
> 리뷰어: 7-expert panel (Adversarial Lens)

---

### Round 1 Fix Verification

- [x] 이슈 1 (자동매매/모의거래 누락): 섹션 9에 자동매매 상태 + 모의거래 뱃지 추가됨. **확인**
- [x] 이슈 2 (태블릿 슬라이드인 미정의): 섹션 8에 backdrop/ESC/overlay/컨텍스트 갱신 명시. **확인**
- [x] 이슈 3 (모바일 호버 대체): 섹션 4.3에 탭 확장 카드 + long-press 금지. **확인**
- [x] 이슈 4 (색상 모호): 섹션 7에 KR/US 구분 명시. **확인**
- [x] 이슈 5 (갱신 실패/검색 0건): 섹션 4.4에 추가. **확인**

---

### Adversarial Agent Discussion

**John (PM):** "자동매매 상태 표시가 추가되었지만, 핵심 질문이 남아있습니다. '자동매매 설정/실행은 별도 페이지(또는 모달)'이라고 했는데, 그 별도 페이지가 이 UXUI 리팩토링 대상에 포함되는지 아닌지가 불명확합니다. 사용자 관점에서 이 페이지에서 자동매매 ON/OFF를 토글할 수 있는 건지, 아니면 읽기 전용 상태 표시만 하는 건지 결정해야 합니다. 지금은 '포트폴리오 요약 영역에 표시'라고만 되어있어서 인터랙션이 불명확합니다."

**Winston (Architect):** "Banana2 프롬프트(섹션 10)가 Round 1에서 발견된 자동매매/모의거래를 반영하지 않았습니다. 프롬프트에는 여전히 'portfolio summary (cash, holdings, total return)'만 있고, 자동매매 상태나 Paper Trading 뱃지 표시가 없습니다. Banana2가 이 프롬프트로 이미지를 생성하면 자동매매 UI가 빠진 디자인이 나올 겁니다. 프롬프트와 스펙 사이에 불일치가 있습니다."

**Sally (UX):** "모바일에서 종목 카드 탭 시 인라인 확장이 추가되었는데, 이 확장이 열린 상태에서 다른 종목을 탭하면 어떻게 되나요? 기존 확장이 먼저 접히고 새 확장이 열리는지(accordion), 아니면 여러 개가 동시에 열리는지 정의가 없습니다. 또한 180px 제한 안에서 확장 카드가 열리면 스크롤 가능 영역이 더 줄어들어서 사실상 1~2개 종목만 보입니다."

**Amelia (Dev):** "자동매매 상태와 모의거래 뱃지가 섹션 9에 추가되었지만, 이에 대응하는 data-testid가 섹션 11에 없습니다. `auto-trade-status`, `investment-style-badge`, `paper-trading-badge` 같은 testid가 필요합니다. 또한 Playwright 테스트 항목(섹션 12)에도 자동매매 상태 표시 확인 테스트가 없습니다."

**Quinn (QA):** "갱신 실패 3회 시 배너가 나온다고 했는데, 이 '3회'는 연속인지 누적인지 불명확합니다. 그리고 배너가 뜬 후 수동 갱신에 성공하면 배너가 자동으로 사라지는지, 사용자가 직접 닫아야 하는지도 정의가 없습니다. 테스트 관점에서 이 시나리오를 검증하려면 명확한 상태 전이가 필요합니다."

**Mary (BA):** "포트폴리오 요약에 자동매매 ON/OFF + 투자 성향 뱃지를 표시한다고 했는데, 이건 읽기 전용이라면 괜찮지만 클릭 가능한 액션이 있다면 비즈니스 플로우가 복잡해집니다. '최근 체결 내역 요약'이라고 했는데 몇 건까지 표시하나요? 1건? 5건? 전체 목록으로 가는 링크가 있나요? 비즈니스 요구사항이 너무 추상적입니다."

**Bob (SM):** "섹션 5 컴포넌트 목록이 Round 1에서 지적된 이후에도 여전히 5개입니다. 자동매매/모의거래 상태 표시가 추가되었으면 포트폴리오 요약 컴포넌트가 확장되는 건지, 별도 컴포넌트인지 명확히 해야 합니다. 컴포넌트 목록은 개발자가 직접 참고하는 스코프 문서인데 업데이트가 안 되면 혼란을 줍니다."

### Cross-talk

**Winston -> Amelia:** "Amelia의 testid 누락 지적에 동의합니다. 프롬프트 불일치 문제와 함께 Banana2 프롬프트에 auto-trade 영역을 추가하면, 그에 맞는 testid도 동시에 추가해야 일관성이 유지됩니다."

**Quinn -> Sally:** "Sally가 말한 accordion 동작 문제는 테스트에도 영향이 큽니다. 확장 카드의 동작이 정의되지 않으면 테스트 케이스를 작성할 수 없습니다. 모바일 인터랙션 정의를 확장해야 합니다."

### New Issues Found (Round 2)

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | MEDIUM | Winston | Banana2 프롬프트에 자동매매/모의거래 UI 미반영 | 프롬프트 portfolio summary에 auto-trade badge + paper trading 추가 |
| 2 | MEDIUM | Amelia | 자동매매/모의거래 관련 data-testid 누락 | auto-trade-status, investment-style-badge, paper-trading-badge 등 추가 |
| 3 | LOW | Sally, Quinn | 모바일 확장 카드 accordion 동작 미정의 | accordion 방식(한 번에 1개) 명시 |
| 4 | LOW | Quinn | 갱신 실패 3회가 연속/누적 불명확 + 배너 해제 조건 미정의 | '3회 연속' 명시 + 수동 갱신 성공 시 배너 자동 닫힘 |
| 5 | LOW | Mary, John | 자동매매 읽기 전용 여부 + 최근 체결 건수 미정의 | 읽기 전용 명시 + 최근 3건 + "전체 보기" 링크 |

### v1-feature-spec Coverage Check
- [x] 포트폴리오 대시보드 -- 커버됨
- [x] 관심종목 -- 커버됨
- [x] 차트 -- 커버됨
- [x] AI 투자 분석 채팅 -- 커버됨
- [x] 종목 비교 -- 커버됨
- [x] 자동매매 -- Round 1에서 추가, Round 2에서 상세화 (읽기 전용, 3건, 프롬프트 반영)
- [x] 모의거래 -- Round 1에서 추가, 프롬프트에도 반영

### UXUI Checklist
- [x] 핵심 동작 3클릭 이내
- [x] 빈 상태/에러 상태/로딩 상태 정의됨
- [x] data-testid가 모든 인터랙션 요소에 할당됨 (28개)
- [x] 기존 기능 전부 커버 (v1 8가지)
- [x] Banana2 프롬프트 3종 (데스크톱/태블릿/모바일)
- [x] 반응형 breakpoint 3단계 명시
- [x] 기능 로직 안 건드리고 UI만 변경

### Fixes Applied
1. Banana2 데스크톱 프롬프트: portfolio summary에 auto-trade badge, investment style, last 3 trades, PAPER watermark 추가
2. data-testid 5개 추가: auto-trade-status, investment-style-badge, paper-trading-badge, recent-trades-summary, stock-refresh-warning
3. 모바일 확장 카드: accordion 방식 (한 번에 1개만 열림) 명시
4. 갱신 실패: '3회 연속' 명시 + 수동 갱신 성공 시 배너 자동 닫힘 + 카운터 리셋
5. 자동매매: '읽기 전용' 명시 + 최근 3건 + "전체 보기" 링크 추가

### Quality Score: 8/10

감점 요인:
- -1: 자동매매 설정 페이지 자체의 UXUI 스펙이 별도로 필요할 수 있음 (이 스펙 범위 밖)
- -1: 모바일 180px 제한에서 accordion 확장 시 실제 사용성은 구현 후 검증 필요

### Final Verdict: PASS
