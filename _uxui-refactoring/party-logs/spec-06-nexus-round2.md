# [Party Mode Round 2 -- Adversarial Review] Nexus / SketchVibe

### Round 1 Fix Verification

| # | Round 1 Issue | Fixed? | Verification |
|---|---------------|--------|--------------|
| 1 | 키보드 단축키/멀티선택/서브그래프 누락 | O | Section 9에 멀티선택, 서브그래프 추가. Section 4.4에 단축키 오버레이 추가. 컴포넌트 #13 KeyboardShortcutOverlay 추가. |
| 2 | 대용량 캔버스 성능 경계/WebSocket 재연결 버튼 | O | 상태별 UI에 "대용량 캔버스 경고" 행 추가. WebSocket 끊김에 재연결 버튼 추가. |
| 3 | AI 명령 실패 에러 원인 구분 없음 | O | "빨간 에러 텍스트 + 원인 요약" 으로 수정됨. |
| 4 | Mermaid 모달 개선 비구체적 | Partial | 문제점 #6에 "코드 하이라이팅 없음"이 기술되어 있고, 개선은 스타일 범위 내로 제한. syntax highlighting은 향후 enhancement로 합의. |

### Adversarial Agent Discussion

**John (PM):** "Round 1 수정은 납득됩니다. 그런데 적대적으로 보면, Section 8 반응형에서 768px~1439px 태블릿 구간이 '캔버스 + 채팅 2패널 (채팅 축소)'로 되어 있는데, 1024px 태블릿에서 채팅 패널(380px) + 캔버스를 동시에 보여주면 캔버스가 640px밖에 안 됩니다. 이건 '캔버스가 주인공'이라는 4.1 디자인 원칙과 모순이에요. 태블릿에서는 채팅을 오버레이나 드로어로 바꿔야 합니다."

**Winston (Architect):** "Round 1에서 추가된 대용량 캔버스 경고(50개+)는 좋은데, 그 경고를 toast로 표시한다고 되어 있습니다. toast는 몇 초 후 사라지죠. 50개 노드를 추가하는 사용자는 이미 복잡한 캔버스에 집중하고 있어서 toast를 놓칠 수 있어요. 다만 이건 Low severity입니다 -- 지속적 배너보다 toast가 덜 방해가 되니까요. 현재 정의로 충분합니다."

**Sally (UX):** "Section 4.4에 키보드 단축키 오버레이가 추가되었지만, `?` 키로 열린다고만 되어 있어요. 그런데 AI 명령 입력란에 포커스가 있을 때 `?`를 누르면 입력에 들어가버리지 단축키 오버레이가 열리지 않습니다. 이건 키보드 이벤트 충돌이에요. 해결책: 입력란에 포커스가 없을 때만 `?` 키가 동작하거나, 별도 버튼으로도 열 수 있어야 합니다. 또한 Tab 키 포커스 이동을 언급했지만 포커스 가시성(focus ring)에 대한 정의가 없어요."

**Amelia (Dev):** "Section 12의 Playwright 테스트 #15 'Undo/Redo'가 '노드 추가 -> Undo 클릭 -> 노드 제거됨'으로 되어 있는데, 이건 UI 버튼 Undo만 테스트합니다. Ctrl+Z 키보드 단축키 Undo도 별도 테스트가 필요해요. 이 두 경로는 구현이 다를 수 있습니다 -- 버튼은 onClick 핸들러, 키보드는 onKeyDown 글로벌 리스너. 둘 다 같은 결과를 보장하는 테스트가 있어야 합니다."

**Quinn (QA):** "Round 1에서 testid `nexus-keyboard-shortcuts`와 `nexus-performance-warning`이 추가되었는데, Section 12 Playwright 테스트에는 이 두 testid를 검증하는 테스트가 없습니다. testid만 정의하고 테스트가 없으면 CI에서 깨져도 모릅니다. 단축키 오버레이 표시 테스트를 추가해야 합니다."

**Mary (BA):** "Banana2 프롬프트의 Required functional elements #9 'Canvas list sidebar (optional, togglable)'가 있는데, 실제 스펙 Section 4.2에서는 '캔버스 사이드바: 필요시만 표시, 기본 숨김'으로 되어 있어요. 프롬프트와 스펙 간 정합성은 OK인데, 한 가지 질문: 캔버스 목록이 비어있을 때(첫 사용) 사이드바를 여는 게 의미가 있나요? 빈 캔버스 상태와 빈 캔버스 목록 상태가 동시에 발생하는 시나리오의 UX가 미정의입니다. 다만 이건 엣지케이스이고 빈 캔버스 안내 카드가 이를 커버하므로 Low severity."

**Bob (SM):** "Section 5 컴포넌트가 13개로 늘어났습니다. 이 중 #7~#13이 전부 nexus.tsx 인라인이에요. 한 파일에 7개 인라인 컴포넌트의 스타일을 동시에 수정하면 diff가 거대해지고 리뷰가 어렵습니다. UXUI 작업을 컴포넌트별 PR로 쪼개야 하는지 결정이 필요합니다. 다만 이건 실행 계획 문제이지 스펙 문제는 아닙니다."

### New Issues Found (Round 2)

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | Medium | John | 태블릿(768~1439px)에서 채팅 2패널이 캔버스 공간을 과도하게 압축. "캔버스가 주인공" 원칙과 모순. | 태블릿: 채팅을 오버레이/드로어로 변경 |
| 2 | Medium | Amelia, Quinn | Undo/Redo 테스트가 UI 버튼만 검증. 키보드 단축키(Ctrl+Z/Y) 경로 미테스트. 단축키 오버레이/성능경고 testid에 대한 테스트도 없음. | 테스트 #16 키보드 Undo/Redo, #17 단축키 오버레이 추가 |
| 3 | Low | Sally | `?` 키 단축키 오버레이가 AI 입력란 포커스 시 충돌 가능. 포커스 가시성(focus ring) 미정의. | 입력란 미포커스 시만 동작 + 포커스 링 스타일 추가 |

### Cross-talk

**John -> Sally:** "태블릿에서 채팅 오버레이로 바꾸면 네가 걱정하는 포커스 문제도 일부 해소돼. 채팅이 캔버스 위에 뜨니까 사용자 시선이 분산되지 않고, AI 입력란과 채팅 입력란의 포커스 충돌도 줄어들지."

**Sally -> John:** "맞아요. 오버레이 방식이면 채팅 열림/닫힘이 명확하니까 키보드 이벤트 라우팅도 단순해져요. 캔버스 뷰일 때만 `?` 키가 동작하면 되니까."

**Quinn -> Amelia:** "키보드 단축키 테스트를 추가하면 기존 #15를 '버튼 Undo/Redo'로 남기고, #16을 '키보드 Ctrl+Z/Y'로 분리하는 게 깔끔해요. 그리고 #17로 단축키 오버레이 표시 테스트도 넣죠."

**Amelia -> Quinn:** "동의합니다. testid가 있는데 테스트가 없으면 의미가 없으니까요."

### v1-feature-spec Coverage Check

| v1 기능 (Section 7) | 스펙 커버 | 비고 |
|---------------------|----------|------|
| 8종 노드 | O | |
| 드래그/편집/삭제 | O | |
| 엣지 생성 (드래그 핸들) | O | |
| 멀티선택 | O | Round 1에서 추가 |
| 서브그래프 그룹핑 | O | Round 1에서 추가 |
| Mermaid 양방향 변환 | O | |
| 저장/불러오기 | O | |
| AI 자연어 명령 | O | |
| AI 프리뷰 (적용/취소) | O | |
| Undo/Redo | O | |
| 자동 정렬 (dagre) | O | |
| 지식 베이스 저장 | O | |
| 채팅+캔버스 컨텍스트 | O | |
| WebSocket 실시간 | O | |
| Command Center -> sessionStorage | O | |

v1 기능 15/15 커버. 누락 없음.

### UXUI Checklist

- [x] 핵심 동작 3클릭 이내 (노드 추가 2, AI 명령 2, 저장 1)
- [x] 빈/에러/로딩 상태 정의 (12개 상태)
- [x] data-testid 전체 인터랙션 요소 커버 (37개)
- [x] 기존 기능 15개 전부 커버
- [x] Banana2 프롬프트 영문 상세 (데스크톱/모바일)
- [x] 반응형 3단계 명시
- [x] UI 변경 범위 명확 (보호 목록 7개)

### Fixes Applied

1. **Section 8**: 태블릿(768~1439px) 채팅을 "2패널 (채팅 축소)" -> "캔버스 전체, 채팅은 오버레이/드로어" 로 수정
2. **Section 12**: 테스트 #15를 "Undo/Redo (버튼)"으로 명확화, #16 "Undo/Redo (키보드)", #17 "단축키 오버레이" 추가
3. **Section 4.4**: 포커스 가시성 `focus-visible:ring-2` 정의 추가

### Quality Score: 8/10

**감점 사유:**
- -1: 인라인 컴포넌트 7개가 단일 파일(nexus.tsx)에 집중 -- 리팩토링 시 diff 관리 어려움 (실행 계획 문제)
- -1: Mermaid 모달 개선이 구체적이지 않음 (syntax highlighting은 향후 enhancement로 분리, 현재는 스타일만)

**강점:**
- v1 기능 15/15 완전 커버
- 상태별 UI 12개 상세 정의 (대용량 경고, WebSocket 포함)
- 37개 testid + 17개 Playwright 테스트
- 키보드 접근성 정의 (단축키 오버레이, 포커스 링)
- 보호 목록 7개로 로직 변경 방지 명확

### Final Verdict: PASS
