## [Party Mode Round 2 -- Adversarial Review] UX Step-03 Core Experience

### R1 Fix Verification

| R1 Issue | Fix Applied | Genuine? | Verdict |
|----------|------------|----------|---------|
| Human 직원 사령관실 UX 미정의 | CEO vs Human 직원 비교 테이블 7행 + 접근 불가 안내 + @멘션 필터링 규칙 추가 (lines 466-481) | Yes -- 구체적 비교 테이블과 3가지 접근 제한 규칙 | PASS |
| QA Fail 복구 루프 상세 미정의 | 품질 실패 상태 설명 확장: 반려 사유 카드 + 재작업 회차 + 원본 vs 재작업 비교 + 사용자 액션 (line 709) | Yes -- 상세 UI 표현 명시 | PASS |
| quality_review WS 이벤트 누락 | delegation 채널에 review_started, review_passed, review_failed 3개 이벤트 추가 (lines 785-787) | Yes -- Architecture의 ChiefOfStaff.review() 단계 매핑 | PASS |
| 도구 호출 결과 UI 표시 규격 미정의 | tool_call_completed에 "1줄 요약 + 통신로그 전체 결과 + 4,000자 요약 + 전체 보기 토글" 추가 (line 790) | Yes -- v1-feature-spec 1.2 제한 반영 | PASS |
| 직원 관리 Core Flow 누락 | Core User Flow 5 추가: 직원 초대 폼, 목록 테이블, 상세 편집 플로우 (lines 661-695) | Yes -- P1 기능으로 적절한 범위 | PASS |

### Agent Discussion (Adversarial Lens)

**John (PM) -- "이 Core Experience가 PRD의 6개 Journey를 충분히 커버하는가?":**
PRD Journey 1(김대표 일과), Journey 4(위기 대응), Journey 5(박과장 팀 구축)에 대한 커버리지는 인정한다. 하지만 **Journey 6(품질 게이트 환각 대응)의 UX 경험이 불충분**하다. QA Fail 상태 행 하나와 review WS 이벤트 3개가 추가되었지만, "반려 -> 재작업 -> 재제출 -> 통과"의 **시간적 UX 경험**이 정의되지 않았다. CEO가 QA Fail 이후 30초~120초를 기다리는 동안 화면에 무엇이 보이는가? 재작업 완료 후 자동으로 보고서가 교체되는가? 아니면 별도 알림이 필요한가?

**Sally (UX Designer) -- "이 디자인이 실제로 사용 가능한가?":**
사령관실 레이아웃(line 830)에서 대화 이력과 보고서 패널의 **가로 분할 비율이 여전히 명시되지 않았다**. R1에서 Amelia가 지적했지만 수정되지 않았다. Claude Artifacts를 차용한다면 대화 40% + 보고서 60%가 적합할 수 있지만, 위임 체인 패널이 대화 이력 하단에 있으므로 대화 이력의 가용 높이가 줄어든다. 또한 **보고서 패널이 없을 때**(명령 전송 전, 처리 중) 대화 이력이 100% 폭을 차지하는가? 상태에 따른 레이아웃 변화가 명시되지 않았다.

**Winston (Architect) -- "이 설계로 구현할 수 있는가?":**
WebSocket 이벤트 매핑에서 review_started/passed/failed를 delegation 채널에 배치했는데, Architecture 문서에서 delegation 채널의 이벤트 목록을 확인해야 한다. 현재 Architecture의 WS 채널 정의와 **이벤트 타입 이름이 일치하는지 검증이 필요**하다. 또한 **에이전트 상태 표시에 "품질 검수 중(◐)"이 있지만** 이건 비서실장의 상태인가? 작업 중인 에이전트의 상태인가? 비서실장이 검수 중일 때 해당 에이전트(예: CIO)의 상태는 "완료"인가 "검수 대기"인가? 이 구분이 없으면 위임 체인 패널에서 혼란이 발생한다.

**Amelia (Dev) -- "가로 분할 비율과 반응형은?":**
R1에서 내가 지적한 **보고서 패널 가로 분할 비율**이 아직 해결되지 않았다. 이건 반복되는 이슈다. 또한 Core Flow 5(직원 초대)에서 **이메일 발송 인프라**가 전제되어 있는데, Architecture에서 이메일 서비스가 정의되어 있는지 확인이 필요하다. UX에서 "초대 이메일 발송"이라고 쓰면 구현 시 SMTP/SendGrid 등의 인프라가 필요한데, 이것이 Architecture scope 내인가?

**Quinn (QA) -- "v1 이식 체크리스트의 검증 가능성은?":**
v1 이식 체크리스트 14항목이 잘 정의되었으나 **검증 기준이 없다**. 각 항목에 "어떻게 검증할 것인가?"가 빠져있다. 예를 들어 #2(@멘션 자동완성)의 검증은 "동적 에이전트 추가 후 자동완성에 즉시 표시되는가?"이고, #9(/토론 -> AGORA 전환)의 검증은 "AGORA 화면이 3초 내 로드되는가?"이다. 또한 **14번(CEO 만족도)에서 "만족도 통계 대시보드 연동"**이라고 했는데 이 대시보드가 어느 화면인지 명시되지 않았다.

**Mary (BA) -- "비즈니스 관점에서 빠진 것은?":**
Core Flow 5(직원 초대)가 추가되었지만, **직원이 CEO의 명령 이력을 볼 수 있는가?**가 정의되지 않았다. PRD FR45에서 "자기 워크스페이스 내에서만"이라고 했는데, "워크스페이스"가 "본인이 보낸 명령만"인지 "자기 부서의 모든 명령"인지 불명확하다. Human 직원 비교 테이블에서 "자기가 보낸 명령만"이라고 했는데, 같은 부서의 다른 직원이 보낸 명령은? 부서 내 협업을 위해 공유되어야 하지 않나?

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | Minor | Sally, Amelia | 사령관실 가로 분할 비율 미정의 (R1 Amelia 이슈 미해결) | 대화 40% + 보고서 60% 명시. 보고서 없을 때 대화 100%. 위임 체인 높이 최대 30% |
| 2 | Minor | John | QA Fail -> 재작업 완료 후 보고서 교체 UX 미정의 | "재작업 완료 시 보고서 자동 교체 + '재작업 완료' 토스트 + 원본 보기 토글" 추가 |
| 3 | Minor | Winston | 품질 검수 중 에이전트 상태 혼란 -- 비서실장 vs 작업 에이전트 구분 없음 | 비서실장: ◐ 품질 검수 중, 작업 에이전트(CIO 등): ✓ 완료(검수 대기) -- 2개 상태 분리 |
| 4 | Minor | Mary | Human 직원 "자기가 보낸 명령만" vs "부서 내 공유 명령" 범위 불명확 | "자기 명령 + 부서 내 공유 명령(읽기 전용)" 으로 확정 |
| 5 | Minor | Sally | 사령관실 상태별 레이아웃 변화(보고서 패널 유무) 미정의 | 처리 전: 대화 100%, 결과 도착 후: 대화 40% + 보고서 60% 전환 |

### Cross-Step Consistency Check
- Core Flow 1 WS 이벤트 <-> Real-Time Feedback Patterns WS 매핑: 일치 (review 3 이벤트 추가 후)
- Core Flow 5(직원 관리) <-> Discovery Screen Inventory: 일치 (직원 관리 화면 존재 확인)
- Human 직원 UX <-> PRD FR45: 대체로 일치하나 "워크스페이스" 범위 해석 필요 (Issue #4)
- 에이전트 상태 규격 7종 <-> Architecture agent lifecycle: "검수 대기" 상태 보완 필요 (Issue #3)

### v1-Feature-Spec Coverage Check
- v1 이식 체크리스트 14항목: v1-feature-spec의 주요 사령관실 기능 전부 커버
- v1 #8(Agent Memory): Core Experience에서 언급 없으나 백엔드 기능이라 UX 플로우 불필요
- v1 #14(SNS Publishing): Phase 2이므로 Core Experience에서 다루지 않음 -- 적절
- v1 #15(ARGOS 자동화): Phase 2이므로 Core Experience에서 다루지 않음 -- 적절

### Consensus Status
- Major objections: 0 / Minor opinions: 5 / Cross-talk exchanges: 3
- Primary consensus: 가로 분할 비율과 상태별 레이아웃 변화가 가장 중요한 개선점

### Fixes Applied
1. 사령관실 레이아웃에 가로 분할 비율 명시 (대화 40% + 보고서 60%, 보고서 없을 때 100%)
2. QA Fail 재작업 완료 후 보고서 자동 교체 + 원본 보기 토글 추가
3. 에이전트 상태에 "검수 대기" 상태 추가 (비서실장: ◐ 검수 중, 작업 에이전트: ✓ 완료(검수 대기))
4. Human 직원 명령 범위: "자기 명령 + 부서 내 공유 명령(읽기 전용)" 확정
5. 사령관실 상태별 레이아웃 변화 규칙 추가
