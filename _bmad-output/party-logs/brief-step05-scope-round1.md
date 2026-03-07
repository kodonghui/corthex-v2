# Party Mode Log: Product Brief - Step 05 Scope - Round 1
- Date: 2026-03-07
- Document: _bmad-output/planning-artifacts/product-brief-corthex-v2-2026-03-07.md (MVP Scope section)
- Reviewers: 7-expert panel

## Expert Debate

### John (PM)
P0/P1 우선순위가 논리적이다. 동적 조직 + 오케스트레이션 = P0(핵심 가치), 대시보드/로그/비용 = P1(보조 가치). Phase 매핑 테이블도 22개 v1 기능을 빠짐없이 분류했다. Out of Scope의 "미루는 이유"가 구체적이라 납득 가능. MVP Success Criteria 6개도 핵심 가치와 직결. 반대 없음.

### Winston (Architect)
**CEO 아이디어 #005(메모리 금지 원칙)가 Phase 2로 분류되어 있는데(라인 578), 이것은 "기능"이 아니라 "아키텍처 원칙"이다.** "모든 정보는 git 파일에, .claude/ 등 숨김 디렉토리 금지"는 Phase 1 설계부터 적용해야 한다. Phase 2에서 적용하면 Phase 1에서 만든 메모리 구조를 리팩토링해야 한다. 이것은 Out of Scope에서 제거하고 Phase 1 아키텍처 원칙으로 재분류해야 한다.

### Sally (UX)
MVP Success Criteria 6번 "사용자 가치 확인"이 잘 정의됨. "이건 ChatGPT와 다르다"라는 체감 기준이 구체적이다. Future Vision도 Phase 2->3->장기로 자연스럽게 확장. 반대 없음.

### Amelia (Developer)
Phase 1 "핵심 30+ 도구"에서 Phase 2 "125+ 전체"로의 도약이 크다. 어떤 30개를 먼저 할지 선정 기준이 없다. Brief 수준에서는 "카테고리별 핵심 도구 우선"이라는 1줄이면 충분하지만, 현재는 아예 언급 없음. 사소한 이슈.

### Quinn (QA)
**품질 게이트가 P0(오케스트레이션, 라인 484)과 P1(독립 기능, 라인 518-522) 양쪽에 걸쳐있다.** P0에서는 "비서실장 = 편집장 5항목 QA"가 오케스트레이션의 일부로 포함되고, P1에서는 "quality_rules.yaml 기반 독립 검수 시스템"이 별도로 있다. 경계가 불명확하다. P0 = 비서실장이 간단히 결과를 검토하는 것, P1 = 규칙 기반 자동 검수 시스템이라면 명확히 구분하는 1줄이 필요하다.

### Mary (Business Analyst)
Out of Scope 테이블의 "미루는 이유 + Phase 2 우선순위" 구조가 뛰어나다. 높음/중간/낮음 분류로 Phase 2 내에서도 순서가 보인다. Future Vision의 "장기 비전(2년+)"이 제품의 전략적 방향을 잘 제시한다. 반대 없음.

### Bob (Scrum Master)
구조 깔끔: P0(6개) -> P1(5개) -> Out of Scope(17+5) -> Success Criteria(6) -> Future Vision(3 Phase). Phase 매핑 테이블이 한눈에 전체 범위를 보여준다. 반대 없음.

## Stub/Mock Check
- 실제 기능인가? YES -- 모든 P0/P1이 구체적 동작 명시
- v1 커버리지? 22/22 전수 Phase 매핑 확인
- CEO 아이디어 7개 Phase 매핑 확인
