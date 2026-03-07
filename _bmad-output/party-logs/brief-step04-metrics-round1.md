# Party Mode Log: Product Brief - Step 04 Metrics - Round 1
- Date: 2026-03-07
- Document: _bmad-output/planning-artifacts/product-brief-corthex-v2-2026-03-07.md (Success Metrics section)
- Reviewers: 7-expert panel

## Expert Debate

### John (PM) - "WHY?" Detective
지표 구조가 탄탄하다. 사용자 지표(13개) + 시스템 지표(13개) + Business Objectives(3 Phase) + KPI(12개). 페르소나 연결도 잘 되어 있다. **그러나 v1의 주요 기능 중 전략실(Trading), AGORA 토론, SketchVibe에 대한 사용 지표가 전혀 없다.** 전략실은 CEO 아이디어 #001이고, SketchVibe는 #009다. 이 핵심 기능들의 성공을 어떻게 판단하나? "자동매매 실행 건수", "토론 개최 횟수", "캔버스 세션 수" 같은 기능별 활용 지표가 있어야 한다.

### Winston (Architect) - Calm Pragmatist
시스템 안정성 지표가 잘 정의됐다. 오케스트레이션 성공률 95%, 도구 호출 성공률 90%, WebSocket 99.5% -- 현실적 목표다. **"환각 탐지율 > 90%"는 측정 가능성에 의문**이 있다. 분모("실제 환각 비율")를 어떻게 정의하나? 사후 검증(사용자 신고 기반)이 아니면 자동 측정이 어렵다. 측정 방법을 "사용자 신고 + 자동 팩트체크 탐지 비율" 등으로 구체화하면 좋겠다.

### Sally (UX Designer) - Empathetic Advocate
"첫 명령 성공까지 소요 시간 < 10분"이 온보딩 UX의 핵심 KPI로 잘 잡혔다. Aha! 순간과 직결된다. 특별한 이슈 없음.

### Amelia (Developer) - Ultra-succinct
v1-feature-spec 24개 섹션 중 지표가 있는 기능 vs 없는 기능:
- ✅ 지표 있음: 사령관실, 오케스트레이션, 3계급, 도구, LLM, 크론, 비용관리, 품질게이트, 멀티테넌시, 사내메신저 (10개)
- ❌ 지표 없음: AGORA, 전략실, SketchVibe, SNS, ARGOS, 텔레그램, 정보국, 에이전트메모리, 작전현황, 통신로그, 작전일지, 기밀문서, 전력분석, 자동화 (14개)
Brief 수준에서 모든 기능에 지표를 요구하는 것은 과도하지만, **전략실/AGORA/SketchVibe는 v1 핵심 차별화 기능이므로 최소 1개씩은 필요**.

### Quinn (QA) - Ship It & Iterate
Business Objectives의 Phase 분배가 합리적이다. Phase 1(핵심) -> Phase 2(v1 이식) -> Phase 3(안정화). **Phase 2의 "22/22 기능 100% 이식"과 KPI의 "v1 기능 이식률 22/22"가 6개월 시점인데, 이것은 매우 공격적**이다. 22개 기능 전체를 6개월에 이식하는 것이 현실적인지는 의문이지만, Brief의 목표 설정으로서는 문제없다. 실현 가능성은 PRD/Epics에서 검증.

### Mary (Business Analyst) - Treasure Hunter
"월 비용 대비 사용자 가치 > 비용"을 정기 설문으로 측정하는 것은 주관적이지만 초기 단계에서 유효한 접근이다. KPI 12개가 Business Objectives 3 Phase와 시점별로 잘 연결됨. 반대 없음.

### Bob (Scrum Master) - Zero Ambiguity
테이블 구조 일관적. 사용자 지표 3개 테이블 + 시스템 지표 3개 테이블 + KPI 1개 테이블. Phase별 마일스톤도 명확. 반대 없음.

## Stub/Mock Check
- 실제 측정 가능한 지표인가? 대부분 YES. 환각 탐지율만 측정 방법 구체화 필요.
- v1 커버리지? 핵심 3개(전략실/AGORA/SketchVibe) 지표 누락.
