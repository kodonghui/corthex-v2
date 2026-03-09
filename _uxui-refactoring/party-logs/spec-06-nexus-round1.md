# [Party Mode Round 1 -- Collaborative Review] Nexus / SketchVibe

### Agent Discussion

**John (PM):** "WHY does this spec not mention keyboard shortcuts at all? v1 had Space bar for connection mode toggle and Ctrl+Click for multi-select. If a power user opens this tool and can't use keyboard shortcuts, they'll bounce immediately. The discoverability story is zero -- there's no shortcut overlay, no tooltip hints, nothing. WHY should the user care about a 'design tool' that doesn't respect design tool conventions? Every competitor -- Figma, Miro, Excalidraw -- has a `?` key for shortcut help. We need this."

**Winston (Architect):** "I see a practical scaling concern. The spec defines no performance boundaries. ReactFlow can handle ~200 nodes comfortably, but the current spec has zero guidance on what happens at 50, 100, or 500 nodes. Under load, the canvas will stutter, the AI preview overlay will block interaction, and the status bar node count becomes meaningless because the user can't see most nodes anyway. We need at minimum a soft warning at 50+ nodes and a documented expectation that the canvas targets up to 200 nodes. Also, the WebSocket reconnection section says 'warning text (red)' but provides no user action -- no reconnect button, no retry mechanism."

**Sally (UX):** "A real user working on a complex diagram would absolutely need multi-select and subgraph grouping. v1 had compound parent support and Ctrl+Click multi-select, but Section 9 (existing features checklist) doesn't mention either of these. If we lose these during UXUI refactoring, a user who built a complex 30-node diagram with subgroups in v1 will be stranded. Also, the AI command failure state just says 'red error text' -- but what error? 'Something went wrong' is useless. The user needs to know if it was a network issue, a parsing failure, or an AI timeout so they can decide whether to retry or rephrase."

**Amelia (Dev):** "`pages/nexus.tsx` has 7 inline components (items 7-12 in the component table). That's a massive single file. During UXUI refactoring, touching one inline component risks breaking others. The spec should at minimum note which inline components are candidates for extraction. Also, the `nexus-node-item` testid uses a `data-node-type` attribute but the spec doesn't define the 8 expected values for that attribute -- test authors will guess."

**Quinn (QA):** "What happens when WebSocket disconnects mid-AI-command? The spec defines WebSocket disconnection and AI command failure as separate states but never addresses the intersection. If I'm testing: user sends AI command -> WebSocket drops -> AI result arrives via HTTP fallback? Or does it just fail silently? Also, test item #15 (Undo/Redo) says 'add node then Undo' but doesn't specify whether keyboard shortcut Ctrl+Z or the button should be tested. We need both paths."

**Mary (BA):** "The business case for the Mermaid import/export is interesting but the spec undersells it. In v1, Mermaid was the bridge between AI-generated diagrams and human-editable canvases. The spec mentions Mermaid modal has 'basic textarea, no code highlighting' as a problem (#6) but the fix in Section 4 doesn't explicitly address it -- it just says 'modal style improvement.' We need to be specific: syntax highlighting, line numbers, error gutter. This is a core differentiator, not a nice-to-have."

**Bob (SM):** "The scope of this spec is ambitious. 12 components, 8 node types, WebSocket, AI commands, Mermaid integration, chat panel, undo/redo -- and we're supposed to do 'UXUI only' without touching any logic. But the checklist in Section 9 mixes logic items (ReactFlow config, mutation handlers) with style items. The boundary is unclear. I need an explicit 'UXUI scope boundary' section that says: 'We change CSS/layout/markup only. We do NOT change: [list].' Without that, every developer will interpret the scope differently."

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | High | John, Sally | 키보드 단축키 및 멀티선택/서브그래프 기능이 Section 9 체크리스트에 누락됨. v1에서 Space바 연결 모드, Ctrl+Click 멀티선택, compound parent가 있었으나 명시되지 않음. | Section 9에 멀티선택, 서브그래프 추가. 단축키 오버레이(`?` 키) 컴포넌트 추가. |
| 2 | High | Winston | 대용량 캔버스 성능 경계 미정의. WebSocket 끊김 시 사용자 복구 액션(재연결 버튼) 없음. | 노드 50개+ 경고 상태 추가. WebSocket 끊김 상태에 재연결 버튼 추가. |
| 3 | Medium | Sally | AI 명령 실패 시 에러 메시지가 "빨간 에러 텍스트"로만 정의 -- 원인 구분 없음. | 에러 유형별 메시지 가이드 추가 (네트워크/파싱/타임아웃). |
| 4 | Medium | Mary | Mermaid 모달 개선이 Section 4에서 구체적이지 않음 (syntax highlighting, line numbers 등 미언급). | Section 4.2 또는 별도 항목으로 Mermaid 모달 구체 개선안 명시. (단, 현재 UXUI 범위에서는 스타일 수준으로 제한 가능) |

### Consensus Status

4개 이슈 중 #1, #2는 즉시 수정 합의. #3은 에러 텍스트에 "원인 요약" 추가로 합의. #4는 Mermaid 모달 개선은 스타일 범위 내에서 다루되, syntax highlighting은 향후 enhancement로 분리하기로 합의.

주요 반대 의견 0개. 모든 전문가가 수정 방향에 동의.

### Cross-talk

**Winston -> Sally:** "WebSocket 끊김 + AI 명령 실패의 교차 상태를 네가 제기한 에러 메시지 구분과 연결하면, 에러 메시지에 '실시간 연결 끊김 -- 재연결 후 다시 시도하세요' 같은 구체적 안내를 넣을 수 있겠어."

**Sally -> Winston:** "동의해요. 에러 원인별로 CTA(Call-to-Action)를 다르게 하면 사용자가 즉시 다음 행동을 알 수 있어요. 네트워크 에러면 '재연결 버튼', AI 타임아웃이면 '다시 시도' 버튼."

**John -> Bob:** "Bob이 말한 'UXUI 범위 경계' 문제는 진짜 중요한데, Section 9에 이미 '절대 건드리면 안 되는 것' 목록이 있으니 그걸 'UXUI 범위 외'로 리라벨링하면 되지 않을까?"

**Bob -> John:** "그 목록은 '건드리면 안 되는 로직'이지, '무엇을 변경하는가'는 아니에요. 양쪽 다 명시해야 범위가 선명해집니다."

### v1-feature-spec Coverage Check

| v1 기능 (Section 7) | 스펙 커버 여부 | 비고 |
|---------------------|--------------|------|
| 8종 노드 | O | Section 9 체크리스트 |
| 드래그/편집/삭제 | O | |
| 엣지 생성 | O | |
| Mermaid 양방향 변환 | O | |
| 저장/불러오기 | O | |
| AI 자연어 명령 | O | |
| AI 프리뷰 | O | |
| Undo/Redo | O | |
| 자동 정렬 (dagre) | O | |
| 지식 베이스 저장 | O | |
| 채팅+캔버스 컨텍스트 | O | |
| WebSocket 실시간 | O | |
| Command Center -> sessionStorage | O | |
| 멀티선택 (Ctrl+Click) | **X -> 수정 완료** | Section 9에 추가 |
| 서브그래프 그룹핑 | **X -> 수정 완료** | Section 9에 추가 |
| Space바 연결 모드 | 해당 없음 (v2는 ReactFlow 드래그 핸들 방식) | v1 Cytoscape 전용 기능 |

### Fixes Applied

1. **Section 9**: 멀티선택(Ctrl+클릭/Shift+클릭), 서브그래프 그룹핑(compound parent) 체크리스트 항목 추가
2. **상태별 UI 정의**: 대용량 캔버스 경고 (노드 50개+) 행 추가
3. **상태별 UI 정의**: WebSocket 끊김 상태에 재연결 버튼 추가
4. **상태별 UI 정의**: AI 명령 실패에 "원인 요약" 추가
5. **Section 4.4**: 키보드 단축키 표시 섹션 신규 추가 (`?` 키 오버레이, Tab 포커스 이동)
6. **Section 5**: KeyboardShortcutOverlay 컴포넌트 추가 (#13)
7. **Section 11**: `nexus-keyboard-shortcuts`, `nexus-performance-warning` testid 추가
