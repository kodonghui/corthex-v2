# [Party Mode Round 2 -- Adversarial Review] 05-agora

> 날짜: 2026-03-09
> 문서: _uxui-refactoring/specs/05-agora.md
> 리뷰어: 7-expert panel (Adversarial Lens)

---

### Round 1 Fix Verification

- [x] 이슈 1 (Diff 뷰 형태 미정의): 사이드바이사이드 명시 + 완료된 토론만 활성화 + 모바일 참여자별 세로 스택. **확인**
- [x] 이슈 2 (Banana2 태블릿 프롬프트 누락): 768x1024 태블릿 프롬프트 추가됨. **확인**
- [x] 이슈 3 (auto-scroll 정책 + Diff 활성화 조건): 마지막 발언 뷰포트 기준 + "새 발언" 버튼 + 완료된 토론에서만. **확인**
- [x] 이슈 4 (책 형식 정리 + 부분합의): Diff 뷰로 대체 명시 + 부분합의 정의 (노랑 뱃지). **확인**
- [x] 이슈 5 (DebateResultCard 스코프): "관련 컴포넌트 -- agora 도메인" 명시. **확인**

---

### Adversarial Agent Discussion

**John (PM):** "Diff 뷰에서 3라운드 심층토론의 경우, 사이드바이사이드가 2개 라운드만 비교하는 것처럼 기술되어 있습니다. '좌측에 이전 라운드, 우측에 현재 라운드'라고 했는데, Round 1 vs 2, Round 2 vs 3 중 어떤 비교를 보여주나요? 3라운드가 있으면 라운드 쌍 선택 UI가 필요하지 않습니까?"

**Winston (Architect):** "데이터 바인딩에 Diff 뷰 상태가 없습니다. `isDiffMode`같은 useState가 섹션 6에 추가되어야 합니다. 또한 auto-scroll의 '하단 근처' 판정을 위한 scroll position 추적도 상태에 들어갈 수 있는데, 데이터 바인딩 테이블에 누락되면 개발자가 놓칠 수 있습니다."

**Sally (UX):** "Diff 뷰 사이드바이사이드에서 발언 텍스트가 길면 양쪽 컬럼의 높이가 불균형해질 수 있습니다. 또한 태블릿(768px) 2컬럼에서 Diff 뷰를 활성화하면 타임라인 영역이 더 좁아지는데, 이 상태에서 사이드바이사이드가 가능한지 의문입니다. 태블릿에서도 모바일처럼 세로 스택으로 fallback해야 합니다."

**Amelia (Dev):** "Playwright 테스트 항목에 '진행중 토론에서 Diff 토글이 비활성인지' 확인하는 테스트가 없습니다. 스펙에서 '완료된 토론에서만 활성화'라고 했으면 반대 케이스도 테스트해야 합니다. 또한 `debate-new-statement-btn` testid에 대응하는 테스트 항목이 섹션 12에 없습니다."

**Quinn (QA):** "토론 생성 모달에서 참여자 선택 관련 testid가 없습니다. `debate-type-select`는 있지만 참여자를 선택하는 UI 요소의 testid가 없어요. 토론 생성 테스트(#5)에서 참여자 선택 없이 생성이 가능한 건지 동작이 불명확합니다."

**Mary (BA):** "비합의 뱃지 색상이 '노랑/빨강'으로 되어있는데, 부분합의가 노랑이라고 섹션 9에서 정의했으면 비합의는 빨강으로 확정해야 합니다. 색상 테이블(섹션 7)에서 아직 모호합니다."

**Bob (SM):** "auto-scroll 정책의 '하단 근처'라는 표현이 모호합니다. '마지막 발언 카드가 뷰포트 내에 보이면'처럼 구체적이어야 구현자마다 다르게 해석하는 것을 방지합니다."

### Cross-talk

**Sally -> John:** "John의 3라운드 Diff 비교 지적이 맞습니다. 사이드바이사이드는 2개 라운드 비교에 최적화된 UI인데, 3라운드면 라운드 쌍 선택 드롭다운이 필요합니다."

**Amelia -> Quinn:** "Quinn의 참여자 선택 testid 지적에 동의합니다. 최소한 참여자 기본값(전체 팀장 자동 선택?)도 명시해야 합니다."

### New Issues Found (Round 2)

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | MEDIUM | John, Sally | 3라운드 심층토론 Diff 뷰에서 라운드 쌍 선택 UI 미정의 | 라운드 쌍 드롭다운 추가 + 태블릿/모바일은 세로 스택 fallback |
| 2 | MEDIUM | Winston | 데이터 바인딩에 isDiffMode, diffRoundPair 상태 누락 | 섹션 6에 추가 |
| 3 | LOW | Amelia | Diff 비활성 테스트 + 새 발언 버튼 테스트 누락 | Playwright 테스트에 추가 |
| 4 | LOW | Mary | 비합의 색상 '노랑/빨강' 모호 -- 부분합의=노랑, 비합의=빨강으로 확정 필요 | 섹션 7 색상 테이블 수정 |
| 5 | LOW | Bob | auto-scroll '하단 근처' 표현 모호 | '마지막 발언 카드가 뷰포트 내에 보이면'으로 구체화 |
| 6 | LOW | Quinn | 토론 생성 참여자 선택 UX + 기본값 미정의 | 기본 전체 팀장 선택 + 체크박스 해제 방식 명시 |

### v1-feature-spec Coverage Check
- [x] 6명 팀장 토론 -- 커버됨 (v2는 동적, 참여자 선택 UX 추가)
- [x] 2/3 라운드 -- 커버됨
- [x] 실시간 -- polling 5초 유지 (UI-only 범위)
- [x] Diff 뷰 -- 사이드바이사이드 + 3라운드 라운드 쌍 선택
- [x] 책 형식 정리 -- v2에서 Diff 뷰로 대체 (명시적)
- [x] 합의/비합의 -- 합의(초록) + 부분합의(노랑) + 비합의(빨강) 3단계

### UXUI Checklist
- [x] 핵심 동작 3클릭 이내
- [x] 빈 상태/에러 상태/로딩 상태 정의됨
- [x] data-testid 28개 (Round 2에서 2개 추가)
- [x] 기존 기능 전부 커버 (v1 기능 + Diff 뷰 복원)
- [x] Banana2 프롬프트 3종 (데스크톱/태블릿/모바일)
- [x] 반응형 breakpoint 3단계
- [x] 기능 로직 안 건드리고 UI만 변경

### Fixes Applied
1. 3라운드 Diff: 라운드 쌍 선택 드롭다운 추가 (기본값: 마지막 2라운드), 태블릿/모바일은 세로 스택
2. 데이터 바인딩: isDiffMode + diffRoundPair useState 추가
3. 색상 테이블: 부분합의=노랑, 비합의=빨강으로 확정
4. auto-scroll: '마지막 발언 카드가 뷰포트 내에 보이면' 자동 스크롤로 구체화
5. 토론 생성 참여자: 기본 전체 팀장 선택, 체크박스 해제/추가, 최소 2명 필수
6. Playwright 테스트 3개 추가: Diff 비활성(#14), 태블릿 레이아웃(#15), fromChat 복귀(#16)
7. debate-diff-round-select testid 추가

### Quality Score: 8/10

감점 요인:
- -1: 실시간 갱신(5초) 전용 E2E 테스트 없음 (debate-live-indicator로 간접 커버)
- -1: Diff 뷰의 발언 길이 불균형 시 시각 처리는 구현 단계에서 CSS로 조정 필요

### Final Verdict: PASS
