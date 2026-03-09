# Party Mode Round 2 — Adversarial Lens
## Spec: 02-chat (1:1 에이전트 채팅)
> Date: 2026-03-09

---

### Round 1 수정사항 확인

| # | Round 1 이슈 | 수정 여부 |
|---|-------------|---------|
| 1 | 파일 첨부 기능 누락 | FIXED — 섹션 1, 4.2, 4.3, 9, 10, 11, 12에 모두 반영 |
| 2 | 위임 패널/위임 상태 표시 누락 | FIXED — 레이아웃 다이어그램 + Banana2 프롬프트 + data-testid 추가 |
| 3 | 토론 명령어 누락 | FIXED — 섹션 1, 9에 반영 |
| 4 | data-testid 8개 누락 | FIXED — 16개 신규 testid 추가 (총 34개) |
| 5 | 하위 기능 누락 | FIXED — ToolCallCard 컴포넌트 추가, 날짜 그룹핑 반영 |
| 6 | edge case 미정의 | FIXED — 연결 끊김/재연결/스트리밍 대기 등 색상 테이블에 추가 |
| 7 | Banana2 프롬프트 불완전 | FIXED — 12개 기능 요소로 확대 |

모든 Round 1 이슈가 수정되었습니다.

---

### Adversarial Review — 7 Experts

### Sally (UX)
스펙이 크게 개선되었지만, **모바일에서 파일 첨부 미리보기의 공간 문제**가 고려되지 않았습니다. 375px 폭에서 첨부 파일 5개의 미리보기 칩이 어떻게 배치되는지 명시가 없습니다. 줄 바꿈(flex-wrap)인지 가로 스크롤인지 정해야 합니다. 다만 이것은 구현 디테일이므로 Minor 이슈입니다.

### Winston (Architect)
컴포넌트 목록에 ToolCallCard가 추가된 것은 좋습니다. 그러나 **DebateResultCard**(토론 결과 카드)가 `agora/debate-result-card.tsx`에서 import되어 ChatArea 안에서 사용되고 있는데, 이것은 컴포넌트 목록이나 Banana2 프롬프트에 포함되어 있지 않습니다. 토론 결과가 채팅 안에 인라인으로 표시되는 것은 시각적으로 중요한 요소입니다. **NEW ISSUE**: DebateResultCard 누락.

### Amelia (Dev)
data-testid가 34개로 충분히 보완되었습니다. 한 가지 확인할 점: `chat-input`의 설명이 "입력 textarea"로 되어 있지만, 실제 코드에서는 `<Input type="text">` (corthex/ui의 Input 컴포넌트)를 사용합니다. Playwright 테스트 작성 시 혼동을 줄이기 위해 설명을 정확히 맞추는 것이 좋겠습니다. Minor 이슈입니다.

### Quinn (QA)
edge case가 잘 보강되었습니다. 추가로 확인: **파일 첨부 최대 개수 도달 시**(5개) 📎 버튼이 비활성화되는 동작이 코드에 있는데, Playwright 테스트 항목에는 이 edge case가 없습니다. 또한 **스트리밍 중 입력 비활성화** (sendMessage.isPending || isStreaming일 때 input disabled) 테스트도 빠져 있습니다. Minor이지만 QA 커버리지 향상에 도움됩니다.

### John (PM)
Round 1의 Critical 이슈가 모두 해결되었습니다. 기존 기능 체크리스트가 5개에서 19개로 확장되어 커버리지가 크게 향상되었습니다. DebateResultCard 누락은 Winston이 지적한 대로이지만, 토론 기능 자체가 채팅 페이지의 부차적 기능이므로 Banana2 프롬프트에 별도로 포함하지 않아도 무방합니다. 기존 agora 페이지의 디자인을 따르면 됩니다.

### Bob (SM)
스코프가 적절합니다. UI-only 변경이라는 원칙이 잘 지켜지고 있고, "절대 건드리면 안 되는 것" 목록도 8항목으로 확대되어 안전장치가 충분합니다. 추가 이슈 없음.

### Mary (BA)
비즈니스 가치가 명확하게 드러나는 스펙이 되었습니다. 위임 패널, 파일 첨부, 도구 호출 카드 — 모두 "AI 에이전트가 실제로 일하고 있다"는 것을 시각적으로 보여주는 핵심 요소들입니다. 추가 이슈 없음.

---

### Round 2 신규 이슈 (총 1개)

| # | 심각도 | 이슈 | 발견자 | 처리 |
|---|--------|------|--------|------|
| 1 | **Minor** | DebateResultCard가 컴포넌트 목록/Banana2에 미포함 | Winston | 수용 — 단 agora 스펙에서 다루므로 여기서는 참조 메모만 추가 |

**추가 개선 제안 (non-blocking):**
- 모바일 파일 미리보기 레이아웃 명시 (Sally) — flex-wrap 사용 권장
- `chat-input` 설명 "textarea" → "입력 필드" 수정 (Amelia)
- 파일 5개 제한/스트리밍 중 비활성화 테스트 추가 (Quinn)

---

### UXUI 체크리스트 검증

- [x] Core actions within 3 clicks? — 세션 선택(1) → 입력(2) → 전송(3). OK.
- [x] Empty/error/loading states defined? — ChatArea 빈 상태, SessionPanel 빈 상태, 에러+재시도, 로딩 스켈레톤, 연결 배너 모두 정의됨.
- [x] data-testid for all interactive elements? — 34개 testid, 모든 버튼/입력/패널 커버.
- [x] All existing features covered? — 19개 기능 체크리스트, DebateResultCard만 참조 메모.
- [x] Banana2 prompt is context+function centered? — 12개 기능 요소, 레이아웃 강제 없이 기능 설명 중심. OK.
- [x] Responsive breakpoints (375px, 768px, 1440px) specified? — 3단계 브레이크포인트 + 태블릿 w-60 명시. OK.
- [x] UI-only scope (no feature logic changes)? — "절대 건드리면 안 되는 것" 8항목 명시. OK.

---

### 최종 판정

**Score: 8/10**

감점 요인:
- -1: DebateResultCard 참조 누락 (Minor이지만 완전성 감점)
- -1: 모바일 파일 미리보기 레이아웃 미명시 + chat-input 설명 부정확 (합산 Minor)

**결과: PASS**

Round 1에서 Critical 7개 이슈 → 모두 수정 완료.
Round 2에서 Minor 1개 신규 이슈 → 참조 메모로 해결.
스펙이 실제 코드베이스의 기능을 정확히 반영하며, Banana2 프롬프트와 data-testid 커버리지가 충분합니다.
