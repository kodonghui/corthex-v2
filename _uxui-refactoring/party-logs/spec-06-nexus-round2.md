# Party Mode Round 2 (Adversarial) — Nexus / SketchVibe

> 날짜: 2026-03-09
> 문서: _uxui-refactoring/specs/06-nexus.md
> 리뷰어: 7-expert panel (Adversarial Lens)

---

## Round 1 이슈 반영 확인

- [x] 이슈 1 (High): 로딩/에러 상태 UI 정의 누락 → 섹션 3 "상태별 UI 정의" 테이블로 9개 상태 정의됨
- [x] 이슈 2 (Medium): data-testid 5개 누락 → `nexus-autolayout-btn`, `nexus-new-btn`, `nexus-clear-btn`, `nexus-knowledge-btn`, `nexus-agent-select` 모두 추가됨
- [x] 이슈 3 (Medium): 컴포넌트 목록 불완전 → 6개에서 12개로 보강 (MermaidModal, AI 명령 입력, AI 프리뷰, StatusBar, ChatArea, AgentSelect)
- [x] 이슈 4 (Medium): AI 자동완성/키보드 단축키 범위 초과 → 섹션 4.4 "향후 개선 (현재 범위 외)"로 분리
- [x] 이슈 5 (Low): 에이전트 선택 드롭다운 개선 반영 없음 → 섹션 4.3 + 컴포넌트 #12에 반영
- [x] 이슈 6 (Low): 에러/엣지케이스 테스트 부족 → 테스트 #11~#14 추가

---

## 전문가 리뷰

### Sally (UX)
핵심 워크플로우를 적대적으로 따져보겠습니다. 노드 추가는 "팔레트 열기 → 타입 클릭"으로 2클릭, AI 명령은 "입력 → 전송"으로 2클릭, 저장은 1클릭 — 3클릭 이내 기준을 충족합니다. 하지만 **모바일 레이아웃에서 AI 명령 입력란이 캔버스 뷰와 채팅 뷰 중 어디에 속하는지 불명확했습니다**. 캔버스를 보면서 AI 명령을 내리는 것이 자연스러우므로 캔버스 뷰에서만 표시해야 하는데, 이 구분이 원본에 없었어요. 이번 리뷰 과정에서 모바일 뷰 규칙으로 "AI 명령 입력란은 캔버스 뷰에서만 표시"가 스펙에 추가되어 해결되었습니다.

### Winston (Architect)
컴포넌트 #7~#12가 전부 "pages/nexus.tsx (인라인)"으로 되어 있는데, 이것이 실제 코드 구조와 일치하는지는 구현 시 확인이 필요합니다. 만약 인라인 컴포넌트 6개가 한 파일에 있으면 1000줄 이상의 파일이 되어 스타일 수정 시 찾기 어려울 수 있습니다. 다만 "UI만 변경, 구조 유지" 원칙을 따르면 컴포넌트 분리는 별도 작업이므로, 현재로서는 각 인라인 컴포넌트의 함수명만이라도 주석으로 표기하면 충분합니다. 구조적으로는 합리적인 설계입니다.

### Amelia (Dev)
기존 Round 2에서 지적했던 ContextMenu testid 3개(`nexus-context-menu`, `nexus-ctx-duplicate`, `nexus-ctx-delete`)가 이미 스펙에 반영되어 있어 좋습니다. 이번에 추가로 발견한 것: **캔버스 내 개별 노드에 대한 testid가 없었습니다**. ReactFlow 노드가 DOM에 렌더링될 때 `nexus-node-item`이라는 testid를 부여하고 `data-node-type` attribute로 8종 노드를 구분하는 방식을 제안했고, 이번 리뷰 과정에서 스펙에 반영되었습니다. 또한 WebSocket 상태 표시를 위한 `nexus-ws-status` testid도 추가되었습니다. 현재 총 37개 testid로 충분한 커버리지입니다.

### Quinn (QA)
기존 Round 2에서 빠져 있던 Undo/Redo 테스트가 #15로 추가된 것을 확인했습니다. 적대적 관점에서 한 가지 더: **WebSocket 관련 테스트가 완전히 빠져 있었습니다**. 기존 기능 목록에 "WebSocket 실시간 AI 캔버스 업데이트"가 핵심 기능으로 있는데, WebSocket 연결 실패/재연결 상태의 UI 정의와 테스트가 없었어요. 이번 리뷰에서 상태별 UI 정의에 "WebSocket 연결 끊김"과 "WebSocket 재연결 중" 2개 상태가 추가되었고, `nexus-ws-status` testid도 추가되었습니다. 다만 WebSocket 테스트 시나리오 자체는 Playwright에서 WebSocket 모킹의 복잡도를 고려해 선택적으로 남겨둡니다.

### John (PM)
기존 기능 13개 항목 체크리스트가 완전합니다. 이전 Round 2에서 지적한 "sessionStorage를 통한 Command Center 데이터 전달 테스트"는 cross-page 인터랙션이라 Playwright에서 테스트하기 까다롭고, 기능 자체는 "건드리면 안 되는 것" 목록에 있으니 UI 변경으로 깨질 가능성이 낮습니다. 추가로 **캔버스 이름 편집 인터랙션**(헤더의 캔버스명 더블클릭 편집)이 기존 기능 #2 "더블클릭 이름 편집"에 포함되지만, 이것이 노드 이름 편집과 캔버스 제목 편집 두 가지인지 구분이 모호합니다. 다만 이것은 Low severity 수준입니다.

### Bob (SM)
컴포넌트 12개 + Playwright 테스트 15개 — 단일 페이지치고 상당한 볼륨입니다. ReactFlow 캔버스, AI 채팅, Mermaid 모달, 8종 노드 스타일을 모두 건드려야 하므로 **예상 작업 시간이 다른 페이지의 2배 이상**입니다. 다만 섹션 4.4에서 범위 외 항목을 이미 분리했고, "건드리면 안 되는 것" 7개 항목이 명확하므로 스코프 크립 위험은 낮습니다. 볼륨은 크지만 관리 가능한 수준이에요.

### Mary (BA)
Banana2 프롬프트가 "YOU DECIDE" 톤으로 디자인 자유도를 준 것은 올바른 접근입니다. "Canvas must dominate the screen"이라는 우선순위가 비즈니스 가치(AI + 시각 도구 차별화)와 잘 정렬되어 있어요. SketchVibe가 CORTHEX의 독특한 가치 제안이므로, 이 페이지의 비주얼 품질이 전체 제품 인상에 큰 영향을 미칩니다.

---

## 크로스톡

**Amelia <-> Quinn:** 노드 testid 문제를 함께 정리했습니다. `nexus-node-item` + `data-node-type` attribute 방식으로 ReactFlow 커스텀 노드 내부에 testid를 부여하면, 테스트 #2의 기대 결과를 "캔버스 내 `nexus-node-item` 요소 개수가 1 증가"로 구체화할 수 있어요. WebSocket testid도 `nexus-ws-status`로 추가되어 향후 WebSocket 모킹 테스트가 가능해졌습니다.

**Sally <-> Bob:** 모바일 뷰에서 AI 입력란 소속 문제를 논의했습니다. Sally가 "캔버스 뷰에서만 표시"를 제안했고, Bob이 "이것은 기존 동작을 명시하는 것이지 새 기능이 아니다"라고 확인하여 범위 내로 판단했습니다. 스펙에 모바일 뷰 규칙이 추가되었습니다.

**John <-> Winston:** sessionStorage 데이터 전달과 인라인 컴포넌트 구조에 대해 논의했습니다. 둘 다 현재 UI 리팩토링 범위에서는 "있는 그대로 유지"가 원칙이므로, 문서에 주의사항으로 남겨두되 구조 변경은 하지 않기로 합의했습니다.

---

## 신규 발견 이슈

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|-----------|
| 1 | Medium | Amelia, Quinn | 캔버스 내 개별 노드 testid 미정의 | `nexus-node-item` + `data-node-type` attribute 추가 → **스펙 반영 완료** |
| 2 | Medium | Quinn | WebSocket 상태 UI 정의 및 testid 누락 | 상태별 UI에 WebSocket 2개 상태 + `nexus-ws-status` testid 추가 → **스펙 반영 완료** |
| 3 | Low | Sally | 모바일 뷰에서 AI 입력란 소속 뷰 미명시 | 모바일 뷰 규칙 추가 → **스펙 반영 완료** |
| 4 | Low | John | 캔버스 이름 편집 vs 노드 이름 편집 구분 모호 | 기존 기능 #2에 포함, 추가 명시 권장 (선택적) |
| 5 | Low | Bob | 작업 볼륨 과다 (12 컴포넌트 + 15 테스트) | 관리 가능 수준, Phase 분리는 선택적 |

---

## UXUI 체크포인트

- [x] 핵심 동작 3클릭 이내 — 노드 추가 2클릭, AI 명령 2클릭, 저장 1클릭
- [x] 빈 상태/에러 상태/로딩 상태 정의됨 — 섹션 3 상태별 UI 정의 (11개 상태, WebSocket 포함)
- [x] data-testid가 모든 인터랙션 요소에 할당됨 — 37개 (노드, WebSocket, 컨텍스트 메뉴 포함)
- [x] 기존 기능 전부 커버 — 13개 체크리스트 모두 체크
- [x] Banana2 프롬프트가 영문으로 구체적으로 작성됨 — 데스크톱/모바일 각각 상세 프롬프트
- [x] 반응형 breakpoint (375px, 768px, 1440px) 명시 — 섹션 8에 3단계 명시
- [x] 기능 로직은 안 건드리고 UI만 변경하는 범위 — "건드리면 안 되는 것" 7개 항목 명시, 범위 외 항목 분리됨

---

## 품질 점수: 8/10

**감점 사유:**
- -1: 인라인 컴포넌트 6개의 함수명/위치가 구현자에게 불친절 (구조 문서화 부족)
- -1: WebSocket 테스트 시나리오가 testid는 있으나 Playwright 테스트 목록에 미포함 (복잡도 고려 선택적)

**강점:**
- Round 1 이슈 6개 + Round 2 이슈 3개 모두 스펙에 반영 완료
- 상태별 UI 정의가 11개로 매우 상세 (WebSocket 포함)
- 37개 testid로 모든 인터랙션 요소 커버
- Banana2 프롬프트 품질 높음
- 기존 기능 보호 목록 7개 항목 명확

---

## 판정: PASS
