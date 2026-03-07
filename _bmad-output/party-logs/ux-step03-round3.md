## [Party Mode Round 3 -- Forensic Review] UX Step-03 Core Experience

### R1+R2 Fix Verification (Forensic Audit)

| Round | Issue | Fix | Status |
|-------|-------|-----|--------|
| R1-1 | Human 직원 사령관실 UX 미정의 | CEO vs Human 비교 테이블 7행 + 접근 제한 3규칙 추가 (lines 466-481) | VERIFIED -- 구체적 비교 테이블, 접근 불가 안내, @멘션 필터링 모두 포함 |
| R1-2 | QA Fail 복구 루프 상세 미정의 | 품질 실패 상태 확장 (line 709) | VERIFIED -- 반려 사유 + 재작업 회차 + 원본 비교 + 사용자 액션 + R2에서 보고서 자동 교체 추가 |
| R1-3 | quality_review WS 이벤트 누락 | delegation 채널에 3개 이벤트 추가 (lines 785-787) | VERIFIED -- review_started, review_passed, review_failed |
| R1-4 | 도구 호출 결과 UI 표시 규격 미정의 | tool_call_completed에 규격 추가 (line 791) | VERIFIED -- 1줄 요약 + 통신로그 전체 + 4,000자 요약 + 전체 보기 토글 |
| R1-5 | 직원 관리 Core Flow 누락 | Core User Flow 5 추가 (lines 661-695) | VERIFIED -- 초대 폼 + 목록 테이블 + 상세 편집 + 접근 부서 설정 |
| R2-1 | 사령관실 가로 분할 비율 미정의 | 레이아웃 규격에 40%/60% + 상태별 변화 추가 (lines 850-854) | VERIFIED -- 보고서 없을 때 100%, 결과 도착 시 40%+60%, 위임 체인 최대 30% |
| R2-2 | QA Fail 재작업 완료 후 보고서 교체 미정의 | 품질 실패 상태 행에 자동 교체 + 토스트 + 원본 토글 추가 (line 709) | VERIFIED -- "재작업 완료" 토스트 + "원본 보기" 토글 |
| R2-3 | 품질 검수 중 에이전트 상태 혼란 | "완료(검수 대기)" 상태 추가 (line 772) | VERIFIED -- 비서실장 ◐ 검수 중 / 작업 에이전트 ✓ 완료(검수 대기) 분리 |
| R2-4 | Human 직원 명령 범위 불명확 | "자기 명령 + 부서 내 공유 명령(읽기 전용)" 확정 (line 473) | VERIFIED -- 비교 테이블에 반영 |
| R2-5 | 사령관실 상태별 레이아웃 변화 미정의 | 상태별 레이아웃 규칙 3종 추가 (lines 851-854) | VERIFIED -- 빈/대기/처리 중 100%, 결과 40%+60%, 위임 체인 30% |

### Per-Agent Final Assessment

**John (PM) -- 8/10:**
Core Experience가 PRD의 핵심 Journey(1, 4, 5, 6)를 적절히 커버한다. 5개 Core User Flow가 Phase 1 기능을 포괄적으로 정의하고, Journey 6(품질 게이트)의 재작업 UX도 R1+R2 수정 후 충분한 상세를 갖추었다. Journey 2(이사장 투자 루틴)와 Journey 3(박과장 팀 구축)은 Phase 2 전략실과 직접 연결되므로 Core Experience 범위 밖 -- 적절하다. v1 이식 체크리스트 14항목이 잘 정의되어 있으나 검증 기준은 후속 테스트 계획에서 다뤄야 한다.

**Sally (UX Designer) -- 9/10:**
사령관실 레이아웃이 Artifacts 패턴을 적절히 차용하고, 상태별 레이아웃 변화(100% -> 40%+60%)가 명시되어 실제 구현 가능한 수준이다. 5개 Core Flow의 플로우 다이어그램이 모두 ASCII로 시각화되어 있어 팀 간 소통에 유용하다. Human 직원 UX 비교 테이블이 CEO vs 직원 차이를 명확히 보여준다. 위임 체인 패널의 높이 제한(30%)과 접힘 가능 패턴도 적절하다.

**Winston (Architect) -- 8/10:**
WebSocket 이벤트 매핑이 7채널 18이벤트로 포괄적이다. review 3이벤트가 delegation 채널에 배치된 것은 Architecture의 오케스트레이션 흐름과 일치한다. 에이전트 상태 8종(검수 대기 추가 후)이 시스템 상태 머신과 대응 가능하다. 연결 끊김 복구 패턴이 NFR23-25를 직접 참조하여 구현 근거가 명확하다.

**Amelia (Dev) -- 8/10:**
Core Flow 2(동적 조직)의 에이전트 생성 폼이 계급별 모델 자동 배정, Soul 편집, 도구 권한까지 원스텝으로 정의되어 구현 범위가 명확하다. Cascade 위저드 4단계가 DP3(안전한 변경) 원칙을 직접 구현한 좋은 예시다. 인라인 테스트 명령 패턴이 Soul 편집 -> 테스트 루프를 앱 전환 없이 해결한다. 가로 분할 비율이 R2에서 확정되어 CSS 구현 시 참조 가능하다.

**Quinn (QA) -- 8/10:**
Key Screen States가 사령관실 7상태 + 조직도 5상태 + 작전현황 5상태로 총 17개 상태를 정의한다. 각 상태의 조건과 UI 표현이 1:1로 매핑되어 테스트 시나리오 도출이 용이하다. v1 이식 체크리스트 14항목에 검증 기준은 없지만, 변경 사항 열이 v1->v2 차이점을 명시하여 회귀 테스트 기준으로 활용 가능하다. 품질 실패 상태의 재작업 완료 UX가 상세해져 Edge Case 테스트가 가능하다.

**Mary (BA) -- 8/10:**
5개 Core Flow가 Phase 1 P0/P1 기능을 커버한다: 사령관실(P0), 동적 조직(P0), 온보딩(P0), 비용 관리(P1), 직원 관리(P1). PRD의 MoSCoW 분류와 일치한다. Human 직원 워크스페이스 범위가 "자기 명령 + 부서 내 공유(읽기 전용)"으로 확정되어 비즈니스 요구 충족. 직원 초대 플로우가 이메일 기반이지만 MVP에서는 초대 링크만으로도 충분할 수 있다는 유연성이 있다.

**Bob (SM) -- 8/10:**
다음 스텝(step-04 Interaction Patterns)에 필요한 입력이 충분하다: 5개 Core Flow(상호작용 대상), 17개 Screen States(상태 전환), 18개 WS 이벤트(실시간 패턴), 레이아웃 비율(UI 구성). Interaction Patterns 스텝에서는 이 Core Experience를 기반으로 더 세부적인 마이크로 인터랙션을 정의하면 된다.

### Quality Score

| 평가 항목 | 점수 | 근거 |
|----------|------|------|
| Core User Flow 완성도 | 9/10 | 5개 Flow가 P0/P1 기능 전부 커버, ASCII 다이어그램 포함 |
| v1-feature-spec 커버리지 | 9/10 | 14항목 이식 체크리스트 + v1 패턴 테이블 7행 |
| PRD 정합성 | 8/10 | Journey 1,4,5,6 커버. Journey 2,3은 Phase 2로 범위 밖 |
| Architecture 정합성 | 9/10 | WS 7채널 18이벤트 매핑 정확, NFR 참조 명시 |
| Screen States 체계성 | 9/10 | 17개 상태 정의, 조건/UI 표현 1:1 매핑 |
| Human 직원 UX | 8/10 | CEO vs 직원 비교 테이블, 접근 제한, 명령 범위 확정 |
| 레이아웃/실시간 패턴 | 9/10 | 가로 분할, 상태별 변화, 위임 체인 와이어프레임, 에이전트 상태 8종 |
| 내부 일관성 | 8/10 | R1+R2 수정 후 Flow-States-WS 이벤트-레이아웃 간 일치 |
| 다음 스텝 입력 충분성 | 8/10 | Interaction Patterns에 필요한 모든 기반 제공 |

**총점: 8.6 / 10**

### Remaining Minor Items (not blocking)

1. v1 이식 체크리스트에 검증 기준(테스트 시나리오)이 없으나 QA 단계에서 별도 정의
2. CEO 만족도 통계 대시보드의 위치(작전현황 vs 관리자 콘솔) 미확정 -- Interaction Patterns에서 결정
3. 직원 초대의 이메일 인프라 의존성은 Architecture에서 검토 필요 (UX 범위 밖)
4. 에이전트 상태 아이콘(○, ●, ◈ 등)의 접근성(색맹 대응) 미정의 -- Wireframe 단계에서 처리

### Consensus Status
- Major objections: 0
- Minor opinions: 4 (all deferred to later steps)
- All 7 experts: PASS (scores 8-9/10)

### Final Verdict: PASS (8.6/10)

Core Experience 섹션이 CORTHEX v2의 핵심 사용자 경험을 충분한 품질로 정의했다. 5개 Core User Flow, 17개 Screen States, 18개 WS 이벤트 매핑, 상태별 레이아웃 규칙, v1 이식 체크리스트 14항목이 체계적으로 구성되어 있다. R1(5건) + R2(5건) 총 10건의 이슈가 모두 검증되었으며, 남은 4개 minor 항목은 후속 스텝(Interaction Patterns, Wireframe, QA)에서 자연스럽게 해결될 사항이다.
