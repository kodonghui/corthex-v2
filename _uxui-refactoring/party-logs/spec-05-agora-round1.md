# [Party Mode Round 1 -- Collaborative Review] 05-agora

> 날짜: 2026-03-09
> 문서: _uxui-refactoring/specs/05-agora.md
> 리뷰어: 7-expert panel

---

### Agent Discussion

**John (PM):** "v1에서 '6명 팀장이 토론'한다고 했는데, v2에서는 동적 조직 관리가 핵심이라서 팀장 수가 고정이 아닙니다. 그런데 이 스펙에서 '참여자 선택'이라고만 했지, 참여자를 어떻게 선택하는지 UI가 불명확합니다. 전체 에이전트 목록에서 고르는 건지, 팀장급만 나오는 건지, 몇 명까지 참여할 수 있는지 제한이 있는지. 사용자가 30명 중에 참여자를 고르는 UI와 6명 중에 고르는 UI는 완전히 다릅니다."

**Winston (Architect):** "v1에서는 SSE(Server-Sent Events) 실시간 스트리밍으로 토론 과정을 표시했다고 하는데, 스펙에서는 '5초 자동 갱신(polling)'으로만 되어 있습니다. 이건 구현 방식이 다릅니다. SSE는 서버가 push하는 방식이고 polling은 클라이언트가 pull하는 방식인데, 현재 구현이 polling(useQuery refetchInterval)이라면 스펙에서 'SSE'라는 용어를 쓰면 안 됩니다. UI-only 리팩토링에서는 기존 polling 방식을 그대로 유지하는 게 맞습니다."

**Sally (UX):** "Diff 뷰가 '타임라인 상단에 토글 버튼'이라고 했는데, Diff 뷰가 활성화되면 타임라인이 어떻게 바뀌는지 구체적이지 않습니다. 사이드바이사이드(좌: Round 1, 우: Round 2)인지, 인라인 diff(수정된 부분 하이라이트)인지에 따라 UX가 완전히 다릅니다. 특히 모바일에서는 '세로 스택'이라고 했는데, 긴 토론에서 세로 스택은 스크롤이 길어져서 비교가 어렵습니다."

**Amelia (Dev):** "Banana2 프롬프트에 태블릿 버전이 없습니다. 섹션 8에서 768px~1023px 태블릿 대응을 정의했는데, Banana2 프롬프트는 데스크톱과 모바일만 있어요. 태블릿에서 InfoPanel이 숨겨지고 타임라인 헤더에 참여자 요약이 표시되는 레이아웃을 Banana2에게 요청하지 않으면 디자인 가이드 없이 개발해야 합니다."

**Quinn (QA):** "진행중 토론의 5초 갱신 시 새 발언이 추가되면 타임라인 스크롤 위치가 어떻게 되나요? 사용자가 이전 발언을 읽고 있는데 새 발언이 추가되면서 스크롤이 자동으로 하단으로 이동하면 읽던 위치를 잃어버립니다. auto-scroll 정책이 정의되어 있지 않습니다. 또한 진행중 토론에서 Diff 뷰 토글이 활성화 가능한지, 완료된 토론에서만 가능한지도 불명확합니다."

**Mary (BA):** "v1에서 '책 형식 정리'가 있었다고 feature-spec에 나와있는데, 이 스펙에서는 언급이 없습니다. Diff 뷰는 복원한다고 했지만 '책 형식 정리'는 빠져있어요. 이것이 v2에서 의도적으로 제거된 건지, 누락인지 확인이 필요합니다. 또한 '부분합의' 상태가 consensus-badge testid에 언급되어 있는데, v1 feature-spec에는 합의/비합의만 있고 부분합의는 없습니다."

**Bob (SM):** "컴포넌트 6개 중 DebateResultCard가 '채팅 내 토론 결과 카드'라고 되어있는데, 이건 agora 페이지가 아니라 채팅 페이지에서 사용되는 컴포넌트입니다. 이 UXUI 스펙은 /agora 경로의 스펙인데 다른 페이지 컴포넌트가 포함되어 있으면 스코프가 모호해집니다."

### Cross-talk

**Winston -> Quinn:** "Quinn이 말한 auto-scroll 문제는 아키텍처적으로도 중요합니다. 5초 polling으로 데이터를 받아올 때, 새 데이터가 있으면 React의 re-render가 발생하는데 스크롤 위치를 유지하려면 scrollRestoration 로직이 필요합니다."

**Mary -> John:** "John의 참여자 선택 UI 지적에 동의합니다. v2에서 동적 조직 관리가 핵심이라면, 참여자 선택은 단순 체크박스가 아니라 조직도에서 선택하거나 역할 기반 필터가 필요할 수 있습니다."

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | HIGH | Sally | Diff 뷰의 구체적 UI 형태 미정의 (사이드바이사이드 vs 인라인) | Diff 뷰 형태를 명확히 정의 + 모바일 대안 구체화 |
| 2 | MEDIUM | Amelia | Banana2 태블릿 프롬프트 누락 | 태블릿 768px 프롬프트 추가 |
| 3 | MEDIUM | Quinn | 진행중 토론 auto-scroll 정책 미정의 + Diff 뷰 활성화 조건 미정의 | 스크롤 정책 추가 + Diff 토글 조건 명시 |
| 4 | LOW | Mary | v1 '책 형식 정리' 기능 미언급 + '부분합의' 상태 근거 미상 | 책 형식 제거 여부 명시 + 부분합의 정의 |
| 5 | LOW | Bob | DebateResultCard가 채팅 페이지 컴포넌트인데 이 스펙에 포함 | 관련 컴포넌트로 분류 명확화 |

### Consensus Status
주요 반대 의견 0개. 5개 이슈에 전원 합의.

### v1-feature-spec Coverage Check
- [x] 6명 팀장 토론 -- 커버됨 (v2는 동적 참여자)
- [x] 2/3 라운드 -- 커버됨
- [x] SSE 실시간 -- 현재 구현은 polling(5초), UXUI 스펙에서는 polling 유지 (UI-only)
- [x] Diff 뷰 -- **Round 1에서 상세화 (사이드바이사이드, 완료된 토론에서만)**
- [x] 책 형식 정리 -- **v2에서 Diff 뷰로 대체, 명시적으로 기록**
- [x] 합의/비합의 -- 커버됨 + 부분합의 추가 정의

### Fixes Applied
1. Diff 뷰: 사이드바이사이드 형태 명시 + 완료된 토론에서만 활성화 + 모바일 참여자별 묶어서 세로 스택
2. Banana2 태블릿 프롬프트 추가 (768x1024)
3. auto-scroll 정책: 하단 근처면 자동 스크롤, 위로 스크롤 중이면 "새 발언" 플로팅 버튼
4. 책 형식 정리: v2에서 Diff 뷰로 대체, 명시적으로 기록
5. 부분합의: v2 추가 상태로 정의 (일부 참여자만 합의 시 노랑 뱃지)
6. DebateResultCard: "관련 컴포넌트 -- agora 도메인이므로 여기서 관리" 명시
7. debate-new-statement-btn testid 추가
