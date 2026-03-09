# Party Mode Log: spec-06-nexus — Round 1 (Collaborative)
> 날짜: 2026-03-09
> 문서: _uxui-refactoring/specs/06-nexus.md
> 리뷰어: 7-expert panel

---

## Expert Debate

### 📋 John (PM)
v1-feature-spec 7번 항목에 대한 체크리스트가 13개 항목으로 빠짐없이 정리되어 있어서 좋습니다. "UI 변경 시 절대 건드리면 안 되는 것" 목록도 명확해요. 다만 **에이전트 선택 드롭다운**이 문제점(#10)에는 언급되었지만, 개선 방향(섹션 4)이나 컴포넌트 목록(섹션 5)에 반영되지 않았습니다. 에이전트 선택 UI 개선이 빠지면 기존 기능 커버리지에 구멍이 생깁니다.

### 🏗️ Winston (Architect)
컴포넌트 목록이 6개로 비교적 간결하지만, **MermaidModal, AI 명령 입력, AI 프리뷰 오버레이, 상태바** 등이 별도 컴포넌트로 존재할 텐데 목록에 빠져 있습니다. 이들이 NexusPage 안에 인라인인지, 별도 컴포넌트인지 명확히 해야 구현 시 혼란이 없어요. 또한 ChatArea(채팅 패널)도 개선 대상인데 컴포넌트 목록에 없습니다.

### 🎨 Sally (UX)
노드 추가 → 배치 → 연결이라는 핵심 워크플로우가 2~3클릭으로 잘 설계되어 있어요. 빈 캔버스 안내 개선 방향도 좋습니다. 다만 **로딩 상태와 에러 상태의 UI 정의가 완전히 누락**되었습니다. 캔버스 목록을 불러오는 동안, AI 명령 처리 중, 저장 실패 시 등 각각의 상태에 대한 비주얼 가이드가 필요해요.

### 💻 Amelia (Dev)
data-testid 25개로 인터랙션 요소가 잘 커버되어 있습니다. 하지만 몇 가지 빠진 것이 있어요: (1) `nexus-autolayout-btn` — 자동 정렬(dagre) 버튼, (2) `nexus-new-btn` — 새 캔버스 버튼, (3) `nexus-clear-btn` — 캔버스 초기화 버튼, (4) `nexus-knowledge-btn` — 지식 베이스 저장 버튼, (5) `nexus-agent-select` — 에이전트 선택 드롭다운. 이 5개는 기존 기능에 포함된 인터랙티브 요소인데 testid가 없습니다.

### 🧪 Quinn (QA)
테스트 항목 10개는 happy path 위주입니다. **엣지케이스 테스트가 부족해요**: (1) AI 명령 빈 텍스트 전송 시 비활성화 확인, (2) 캔버스 저장 실패 시 에러 표시, (3) Mermaid 코드 파싱 에러 시 피드백, (4) 노드 최대 개수 초과 시 처리. 또한 로딩 상태 테스트(캔버스 로딩 중 skeleton)도 추가되어야 합니다.

### 🏃 Bob (SM)
6개 컴포넌트 수정, API 변경 없음 — 범위 자체는 적절합니다. 하지만 **섹션 4.3 "인터랙션 개선"의 "AI 명령 자동완성", "키보드 단축키 힌트 표시"는 새로운 기능 추가**에 해당합니다. UI-only 범위를 명확히 하려면, 이 항목들은 "향후 개선" 또는 "범위 외"로 분리해야 합니다. 자동완성은 특히 백엔드 연동이 필요할 수 있어요.

### 📊 Mary (BA)
SketchVibe는 "AI + 시각 도구" 조합으로 경쟁 제품 대비 독특한 가치를 제공합니다. Banana2 프롬프트가 Figma/Excalidraw/Miro를 참고하면서 CORTHEX의 AI 차별점을 잘 녹여냈어요. 비즈니스 가치가 명확하고, 기존 기능을 보존하면서 비주얼만 개선하는 방향이 안전합니다.

---

## Cross-talk

**Winston → Amelia:** 컴포넌트 목록에 빠진 요소들과 data-testid에 빠진 요소들이 겹치네요. MermaidModal, AI 입력, 상태바 등이 컴포넌트 목록에도, testid에도 보충이 필요합니다. 함께 정리하면 좋겠어요.

**Amelia → Winston:** 맞아요. 특히 `nexus-mermaid-modal`은 testid에는 있는데 컴포넌트 목록에는 없어서 불일치가 생겼네요. 컴포넌트 목록을 보강하면 testid도 자연스럽게 정리될 거예요.

**Bob → Sally:** 로딩/에러 상태 정의가 빠진 건 동의하는데, 로딩 skeleton 디자인을 새로 만드는 것도 범위 확장 아닌가요?

**Sally → Bob:** 기존 앱에서 이미 skeleton 패턴을 쓰고 있다면 그걸 재사용하면 UI-only 범위 안이에요. 새 컴포넌트를 만드는 게 아니라 기존 skeleton을 적용하는 거니까요.

---

## Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|-----------|
| 1 | High | Sally, Quinn | 로딩 상태, 에러 상태 UI 정의 완전 누락 | 섹션 3에 로딩/에러 상태 추가, 관련 testid 추가 |
| 2 | Medium | Amelia | data-testid 5개 누락 (autolayout, new, clear, knowledge, agent-select) | 섹션 11 testid 목록에 추가 |
| 3 | Medium | Winston, Amelia | 컴포넌트 목록 불완전 — MermaidModal, AI입력, 상태바, ChatArea, 에이전트 선택 누락 | 섹션 5 컴포넌트 테이블 보강 |
| 4 | Medium | Bob | 섹션 4.3 "AI 자동완성", "키보드 단축키 힌트"는 UI-only 범위 초과 | 범위 외로 분리하거나 "향후 개선"으로 명시 |
| 5 | Low | John | 에이전트 선택 드롭다운 개선이 문제점에만 있고 해결책 없음 | 개선 방향 및 컴포넌트 목록에 반영 |
| 6 | Low | Quinn | 테스트 항목에 에러/엣지케이스 부족 | 에러 핸들링 테스트 3~4개 추가 |
