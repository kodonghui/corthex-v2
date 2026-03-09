# Party Mode Round 2 — Adversarial Lens
## Spec: 05-agora (Agora 토론 엔진)

---

### Round 1 수정 검증

| # | Round 1 이슈 | 수정 여부 |
|---|-------------|----------|
| 1 | DebateResultCard 누락 | FIXED — 컴포넌트 #6으로 추가 |
| 2 | 로딩/에러 상태 미정의 | FIXED — 섹션 4.4 추가 |
| 3 | testid 누락 (제출버튼, 합의뱃지, 채팅복귀) | FIXED — 11개 testid 추가 |
| 4 | Diff 뷰 UI 배치 미정의 | FIXED — 섹션 4.3에 구체적 배치 + testid + 테스트 항목 추가 |
| 5 | "사령관실로 돌아가기" 변경 텍스트 | FIXED — "채팅으로 돌아가기"로 명시 |

---

### Sally (UX) — Adversarial
Diff 뷰가 "타임라인 상단에 토글 버튼"이라고 했는데, 모바일에서 Diff 뷰가 어떻게 보이는지 정의가 없습니다. 375px에서 나란히 비교는 불가능하므로, 모바일에서는 Diff 토글을 숨기거나 세로 스택 방식으로 전환해야 합니다. 이건 반응형 섹션(8번)에 추가가 필요합니다.

### Winston (Architect)
`use-agora-ws.ts` 파일이 존재하지만 컴포넌트 목록이나 데이터 바인딩에 WebSocket 관련 언급이 전혀 없습니다. 현재 5초 polling 방식인데, WS 훅이 있다는 건 실시간 업데이트 방식이 변경될 수 있다는 것이므로 최소한 "주의사항"으로 기록해둬야 합니다. 다만 이건 기능 로직이므로 UI 스펙의 범위 밖일 수 있습니다.

### Amelia (Dev)
testid 수정은 잘 되었습니다. 한 가지 — `debate-item`은 목록에서 여러 개가 나오는데, 개별 항목을 구분할 suffix 규칙(예: `debate-item-{id}`)이 없으면 Playwright 테스트에서 특정 토론을 선택하기 어렵습니다. `nth` selector로 해결 가능하지만, 명시해두면 좋겠습니다.

### Quinn (QA)
**새로운 이슈 발견**: 토론 목록이 비어있을 때(토론이 0개)의 빈 상태가 정의되지 않았습니다. 현재 `debate-empty-state`는 "토론 미선택 시"의 빈 상태이지, "토론 자체가 없을 때"와는 다릅니다. 토론 0개일 때 목록 패널에 "아직 토론이 없습니다. 새 토론을 시작해보세요" 같은 상태가 필요합니다.

### John (PM)
Round 1에서 지적한 기능 커버리지 이슈가 잘 수정되었습니다. v1의 "책 형식 정리"는 Diff 뷰로 포괄할 수 있으니 별도 정의 불필요합니다. 기존 기능 체크리스트가 8항목으로 늘어나 충분합니다.

### Bob (SM)
Diff 뷰 구현이 "UI-only"인지 재확인이 필요합니다. 타임라인 API가 이미 라운드별+참여자별 데이터를 반환한다면 프론트엔드에서 재배열만 하면 되므로 UI-only 맞습니다. API 변경이 필요하다면 scope가 넘어갑니다. 스펙에 "기존 timeline API 데이터를 클라이언트에서 재가공"이라고 명시하면 scope 논란을 방지할 수 있습니다.

### Mary (BA)
비즈니스 가치 측면에서 충분히 개선되었습니다. Diff 뷰 복원은 CEO가 토론의 진행 과정을 이해하는 데 핵심적인 기능이므로 우선순위가 높습니다.

---

### UXUI 체크리스트

- [x] Core actions within 3 clicks? — 토론 선택 1클릭, 새 토론 2클릭(버튼+생성), Diff 2클릭(선택+토글)
- [x] Empty/error/loading states defined? — 섹션 4.4에 정의 완료 (Round 2에서 "토론 0개" 빈 상태 추가 필요)
- [x] data-testid for all interactive elements? — 26개 testid 정의 (debate-item suffix 고려)
- [x] All existing features covered? — v1 기능 8항목 체크리스트 완비
- [x] Banana2 prompt context+function centered? — 프롬프트가 기능과 콘텐츠 중심, 레이아웃 강제 없음
- [x] Responsive breakpoints (375px, 768px, 1440px) specified? — 섹션 8 정의 완료
- [x] UI-only scope? — API 변경 없음 명시, Diff 뷰도 클라이언트 재가공

---

### Round 2 새로운 이슈

| # | 이슈 | 심각도 | 발견자 |
|---|------|--------|--------|
| 1 | 모바일에서 Diff 뷰 표시 방식 미정의 | Medium | Sally |
| 2 | 토론 0개일 때 목록 패널 빈 상태 미정의 | Medium | Quinn |
| 3 | Diff 뷰가 "기존 API 데이터 클라이언트 재가공"인지 명시 필요 | Low | Bob |

---

### 최종 점수: 8/10

**PASS**

**감점 사유:**
- -1: 모바일 Diff 뷰 처리 미정의 (반응형 완성도)
- -1: 토론 0개 빈 상태 누락 (엣지케이스)

**총평:** Round 1에서 발견된 5개 이슈가 모두 적절히 수정되었고, v1 기능 커버리지가 완비되었습니다. Round 2에서 발견된 3개 이슈는 모두 Medium~Low 수준으로, 스펙 최종 수정으로 해결 가능합니다.
