## [Party Mode Round 1 -- Collaborative Review] UX Step-04 Emotional Response & Design Language

### Agent Discussion

**Sally (UX Designer):** Emotional Design Goals 테이블이 3명 페르소나에 대해 구체적이다. 특히 김대표의 "권위감-통제감-성취감-자부심-안심" 5가지 감정 목표가 사령관실 UX와 직접 연결된다. 하지만 **Human 직원의 감정 목표가 빠져있다**. step-03에서 Human 직원 UX 패턴을 추가했는데, 이 사용자가 시스템에서 느껴야 할 감정은 무엇인가? "나는 도구를 잘 활용하고 있다" (능숙함)? "내 업무 범위 안에서 AI를 쓰고 있다" (안전감)?

**John (PM):** 톤 & 보이스 가이드라인이 매우 실용적이다. "올바른 표현 vs 피해야 할 표현" 비교 테이블이 개발자에게 즉시 참조 가능한 포맷이다. 하지만 **관리자 콘솔의 에러 메시지 UI Copy가 없다**. CEO 앱 에러 상태 8개는 상세하게 정의했는데, 관리자 콘솔에서 발생할 수 있는 에러(API 키 유효성 실패, 에이전트 생성 실패, 직원 초대 이메일 실패 등)의 UI Copy가 빠져있다.

**Winston (Architect):** Visual Design Language의 색상 체계가 step-03의 에이전트 상태 색상과 **정확히 일치하는지 확인**이 필요하다. step-03에서 정의한 에이전트 상태 8종의 색상(#22C55E, #3B82F6, #8B5CF6, #EAB308, #EF4444, #F97316)이 step-04의 Semantic Colors 테이블과 동일한 것을 확인했다 -- 일치한다. 또한 **다크 모드** 언급이 없다. 설정 화면에 "테마" 설정이 있는데(Screen Inventory #14), 다크 모드 색상 변환 규칙이 필요하지 않은가?

**Amelia (Dev):** Microinteractions 섹션의 애니메이션 타이밍이 구체적이어서 구현하기 좋다. 하지만 **CSS 변수/토큰 네이밍 규칙**이 없다. 색상 Hex 값만 나열되어 있는데, CSS Custom Properties나 Tailwind 클래스명으로 어떻게 매핑되는지 정의가 필요하다. 또한 Lucide Icons를 선택했는데, 현재 프로젝트의 packages/ui에서 **이미 사용 중인 아이콘 라이브러리**와 충돌하지 않는지 확인이 필요하다.

**Quinn (QA):** 에러 상태 8개의 UI Copy가 잘 정의되었다. 하지만 **에러 상태 테스트 기준이 없다**. 예를 들어 "명령 타임아웃(180초)"에서 180초는 어디서 온 수치인가? Architecture NFR에서 정의된 것인가? 또한 "품질 게이트 2회 연속 실패" 시 [그대로 결과 받기] 옵션이 있는데, 이것이 품질 게이트를 우회하는 것인지, 아니면 실패 표시와 함께 결과를 보여주는 것인지 명확하지 않다.

**Mary (BA):** Trust-Building Patterns의 3축(비용 투명성, 에이전트 신뢰성, 데이터 안전성)이 체계적이다. 하지만 **"비용 비교" 패턴이 Phase 2로 표기**되어 있는데, Phase 1에서도 "이전 명령 대비 비용 변화"를 보여줄 수 있지 않나? 학습 데이터 없이도 단순히 이전 N개 명령의 평균 비용을 비교하는 것은 가능하다. 또한 "에이전트 역량 표시"도 Phase 표기가 없어서 언제 구현되는지 불명확하다.

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | Minor | Sally | Human 직원의 감정 목표 미정의 (step-03에서 UX 패턴은 추가했으나 감정 설계 누락) | Human 직원 감정 목표 추가: 능숙함(Competence), 안전감(Safety), 소속감(Belonging) |
| 2 | Minor | John | 관리자 콘솔 에러 메시지 UI Copy 누락 (CEO 앱만 8개 정의) | 관리자 콘솔 에러 4~5개 추가 (API 키 실패, 에이전트 생성 실패, 직원 초대 실패 등) |
| 3 | Minor | Winston | 다크 모드 색상 변환 규칙 미정의 (설정에 테마 존재) | 다크 모드는 Phase 2로 명시하거나, 기본 변환 규칙(배경/텍스트 반전, 시맨틱 색상 유지) 추가 |
| 4 | Minor | Quinn | "품질 게이트 2회 실패 시 [그대로 결과 받기]"의 의미 불명확 (품질 우회 vs 실패 표시 포함 결과) | "FAIL 표시와 함께 결과를 보여줌 (품질 게이트 우회가 아님)" 명확화 |
| 5 | Minor | Mary | Trust-Building 패턴의 Phase 배정 일부 누락 또는 불명확 | 각 패턴에 Phase 배정 추가 (비용 비교: P1에서 단순 평균 비교, Phase 2에서 학습 기반) |

### Consensus Status
- Major objections: 0 / Minor opinions: 5 / Cross-talk exchanges: 2
- Primary consensus: Human 직원 감정 목표 추가가 가장 필요한 보완

### Fixes Applied
1. Human 직원 감정 목표 테이블 추가 (능숙함, 안전감, 소속감)
2. 관리자 콘솔 에러 메시지 UI Copy 5개 추가
3. 다크 모드를 Phase 2로 명시 + 기본 변환 원칙 추가
4. 품질 게이트 2회 실패 시 옵션 명확화 (FAIL 표시 포함 결과)
5. Trust-Building 패턴에 Phase 배정 명시
