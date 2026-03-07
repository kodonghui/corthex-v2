# UX Step-02 Discovery -- Round 1 (Breadth Scan)

**Date:** 2026-03-07
**Document:** _bmad-output/planning-artifacts/ux-design-specification.md
**Section:** Executive Summary (Project Vision, Target Users, Key Design Challenges, Design Opportunities)

---

## 7-Expert Debate

### PM (John) -- Opening
"Executive Summary의 비전 문장은 명확하다. 하지만 **Target Users 섹션에서 페르소나 3명의 UX 우선순위가 빠져있다**. 김대표와 이사장은 사령관실 중심이고, 박과장은 관리자 콘솔 중심인데 -- 이 둘은 완전히 다른 앱이다. UX Discovery라면 어떤 페르소나의 어떤 화면을 먼저 설계할지 우선순위 매트릭스가 있어야 한다. 지금은 Brief/PRD를 복붙한 수준이다."

"또 하나 -- **Key Design Challenges에 '접근성(Accessibility)'이 전혀 없다**. 비개발자 타겟인데 접근성 고려 없이 UX를 설계하겠다는 건 모순이다."

### Architect (Winston) -- Response
"John의 우선순위 매트릭스 필요성에 동의한다. 그런데 나는 **기술적 관점에서 더 큰 빈틈**을 보고 있다. Design Challenges #2에서 '비동기 다단계 오케스트레이션의 시각화'라고 했는데, **WebSocket 7채널 구조가 어떻게 UX에 매핑되는지 전혀 없다**. architecture.md에서 정의한 7채널(agent-status, task-progress, cost-update, org-change, debate-stream, sketchvibe-stream, chat)이 각각 어떤 UI 컴포넌트에 연결되는지 명시해야 한다."

"Design Opportunities #1 '실시간 위임 체인 시각화'는 좋은 아이디어인데, **구현 가능한 UX 패턴이 제안되지 않았다**. 타임라인? 트리? 플로우차트? 구체적 UI 패턴 없이 '시각적으로 표시'만 반복하고 있다."

### UX Designer (Sally) -- Response
"Winston, 동의하지만 나는 좀 다른 각도에서 본다. **이 Discovery 섹션에서 가장 큰 문제는 정보 아키텍처(IA) 기초가 없다는 것이다.** 22개 기능 영역이 있고, 두 개의 분리된 앱(app + admin)이 있는데 -- 사이트맵이나 네비게이션 구조에 대한 언급이 전혀 없다."

"Design Challenges #3 '22개 기능 영역의 정보 과잉 방지'를 인지했으면서, **해결 방향으로 '점진적 노출'만 한 줄 언급**하고 넘어갔다. Progressive disclosure의 구체적 전략 -- 예를 들어 기본 뷰에서 보이는 메뉴 5개 vs 확장 메뉴 17개, 또는 사용 빈도 기반 동적 메뉴 -- 이런 수준의 구체성이 필요하다."

"John의 접근성 지적에 대해서는 -- **접근성도 중요하지만, 이 단계에서는 '비개발자를 위한 인지 부하 최소화'가 더 핵심**이라고 생각한다. 접근성은 WCAG 기준을 별도 섹션으로 다루는 게 맞다."

### Developer (Amelia) -- Response
"`packages/app` vs `packages/admin` -- 두 SPA가 공유하는 `packages/ui` 컴포넌트가 이미 있다. 그런데 **UX 스펙에서 디자인 시스템/토큰에 대한 언급이 0**이다. Design Challenges #4 '두 개의 분리된 앱 경험 통합'이라고 했으면 -- 공유 디자인 토큰(색상, 타이포, 간격)이 어떻게 정의되는지, 컴포넌트 공유 전략이 뭔지 명시해야 한다."

"Sally의 IA 지적에 동의. v1 `CORTHEX_HQ` 소스를 보면 네비게이션이 이미 12개 메뉴인데, v2는 더 많아진다. **라우팅 구조가 UX 스펙에 없으면 나중에 프론트엔드 라우터 설계할 때 혼란**이 온다."

### QA (Quinn) -- Response
"실질적인 문제를 하나 짚겠다. **Target Users의 페르소나별 '성공 시나리오'가 이 UX 스펙에 없다**. Brief에는 있는데 여기선 빠졌다. UX Discovery가 Brief보다 덜 구체적이면 안 된다."

"또한 Design Challenges #5 '금융 거래 UX의 안전성' -- **실거래/모의거래 시각적 구분 방법이 전혀 없다**. 색상? 배지? 모달 확인? 이건 UX에서 가장 중요한 안전 장치인데, 'Challenge'로만 인식하고 해결 방향은 제시하지 않았다."

"Winston의 WebSocket 채널-UI 매핑 지적은 과하다고 본다. Discovery 단계에서 그 수준은 이르다. 하지만 **어떤 화면에서 실시간 업데이트가 필요한지** 정도는 명시해야 한다."

### Business Analyst (Mary) -- Response
"Quinn, 나는 Winston 편이다. 기술 매핑까지는 아니더라도, **실시간 vs 폴링 vs 정적 데이터가 어떤 화면에 해당하는지** 구분은 Discovery에서 해야 한다. 이게 UX 복잡도를 완전히 바꾸니까."

"내가 가장 우려하는 건 **Design Opportunities가 전부 CEO/김대표 관점**이라는 것이다. 박과장(관리자)과 이사장(투자자)의 Opportunity는 어디 있나? 6개 Opportunity 중 #2 드래그 앤 드롭 조직 설계만 관리자 관련이고, 나머지 5개는 전부 CEO 앱 관점이다. **관리자 콘솔의 UX Opportunity가 과소 대표**되었다."

"비즈니스 관점에서 -- **온보딩 플로우의 UX가 'Design Opportunities'에 #3으로 언급되지만 너무 간략하다**. '템플릿 선택 -> 즉시 사령관실 -> 10분 내 Aha!'가 전부다. 비개발자 온보딩의 마찰 포인트를 구체적으로 식별해야 한다."

### Scrum Master (Bob) -- Response
"전체적으로 보면, 이 Discovery 섹션은 **Brief/PRD의 축약본**이지 UX Discovery가 아니다. UX Discovery라면 다음이 있어야 한다:"

"1. 사용자 멘탈 모델: CEO가 'AI 회사'를 어떻게 인식하는지"
"2. 핵심 태스크 분석: 가장 빈번한 5개 태스크의 스텝 바이 스텝"
"3. 화면 인벤토리: 최소 어떤 화면들이 필요한지"
"4. 네비게이션 모델: 화면 간 이동 구조"

"**이 4개가 전부 빠져있다.** Sally의 IA 지적, John의 우선순위 지적, Mary의 관리자 콘솔 과소 대표 지적이 모두 같은 근본 원인을 가리킨다 -- 이 문서는 아직 '왜(Why)' 수준에 머물러 있고 '어떻게(How)' 수준으로 진입하지 못했다."

"그런데 Amelia의 디자인 시스템/토큰 지적은 **이 단계에서는 시기상조**라고 본다. Discovery에서는 패턴과 구조가 먼저이고, 토큰은 Visual Design 단계에서 정의하는 게 맞다."

---

## Cross-Check: v1 Feature Spec Coverage

| v1 Feature | UX Spec 커버 여부 | 비고 |
|-----------|-----------------|------|
| #1 사령관실 | 부분 -- 비전에서 언급만, 구체적 UX 패턴 없음 | 슬래시 명령어/프리셋/실시간 표시의 UI 패턴 필요 |
| #2 에이전트 조직 | 부분 -- Challenge/Opportunity에 조직도 언급 | 계급별 시각 구분, Soul 편집 UI 없음 |
| #3 도구 시스템 | 미커버 | 도구 호출 로그 UI, 권한 설정 UI 언급 없음 |
| #4 LLM 라우터 | 미커버 | 모델 선택 UI, Batch 상태 UI 없음 |
| #5 AGORA 토론 | 미커버 | SSE 토론 뷰, Diff 뷰 패턴 없음 |
| #6 전략실 | 부분 -- Challenge #5에서 안전성 언급만 | 포트폴리오/관심종목/자동매매 UI 패턴 없음 |
| #7 SketchVibe | Opportunity #6에서 언급 | 캔버스 인터랙션 패턴 미상세 |
| #8 SNS 통신국 | 미커버 | 승인 플로우, 예약 발행 UI 없음 |
| #9 작전현황 | 미커버 | 대시보드 레이아웃, 카드/차트 패턴 없음 |
| #10~#22 | 미커버 | 통신로그/작전일지/기밀문서/전력분석/자동화/크론/정보국/ARGOS/텔레그램/품질게이트/메모리/비용관리 -- 전부 UX 언급 없음 |

**v1 커버리지: 약 15% (22개 중 3개 부분 커버)**

---

## Expert Disagreements

1. **Quinn vs Winston**: WebSocket 채널-UI 매핑의 적정 깊이. Quinn은 "Discovery에서 과하다", Winston은 "실시간 업데이트 화면 식별은 필수". **Mary가 Winston 편에 섰고, 절충안으로 "화면별 실시간/폴링/정적 구분"을 제안.**

2. **Sally vs John (접근성)**: John은 접근성이 Design Challenges에 있어야 한다고 주장. Sally는 "비개발자 인지 부하 최소화가 더 핵심이고, 접근성은 별도 섹션"이라고 주장. **이 단계에서는 Sally의 접근이 더 실용적이지만, Challenges에 한 줄은 있어야 한다.**

3. **Bob vs Amelia (디자인 토큰)**: Bob은 Discovery에서 시기상조, Amelia는 두 앱 통합 Challenge를 언급했으면 공유 전략이 있어야 한다고 주장. **결론: 디자인 시스템 '전략'은 Discovery에서, '토큰 정의'는 나중에.**

---

## Issues Summary

| # | Severity | Issue | Owner | Expert |
|---|----------|-------|-------|--------|
| 1 | MAJOR | UX Discovery가 Brief/PRD 축약본 수준. 멘탈 모델, 태스크 분석, 화면 인벤토리, 네비게이션 모델 부재 | Writer | Bob, Sally |
| 2 | MAJOR | v1 22개 기능 중 약 15%만 UX 관점에서 커버. 대부분 기능의 UI 패턴 미언급 | Writer | 전체 |
| 3 | MAJOR | 정보 아키텍처(IA) 기초 없음 -- 사이트맵, 네비게이션 구조, 화면 간 관계 미정의 | Writer | Sally, Amelia |
| 4 | MEDIUM | 페르소나별 UX 우선순위 매트릭스 없음 (어떤 페르소나의 어떤 화면을 먼저 설계?) | Writer | John |
| 5 | MEDIUM | Design Opportunities가 CEO 앱 편향. 관리자 콘솔 UX Opportunity 과소 대표 | Writer | Mary |
| 6 | MEDIUM | 실시간 업데이트 필요 화면 vs 정적 화면 구분 없음 | Writer | Winston, Mary |
| 7 | MEDIUM | 실거래/모의거래 시각적 구분 등 안전 크리티컬 UX 해결 방향 미제시 | Writer | Quinn |
| 8 | MINOR | Progressive disclosure 전략이 한 줄 언급만. 구체적 메뉴 구조 전략 필요 | Writer | Sally |
| 9 | MINOR | 온보딩 플로우의 마찰 포인트 미식별 | Writer | Mary |
| 10 | MINOR | 디자인 시스템 공유 전략(app vs admin) 미언급 | Writer | Amelia |

---

## Round 1 Verdict

**Status: ACTION REQUIRED**

Major 이슈 3개, Medium 4개, Minor 3개. Discovery 섹션이 Brief/PRD의 요약에 머물러 있고, UX 고유의 분석(IA, 태스크 분석, 화면 인벤토리, 네비게이션 모델)이 부재하다. v1 기능 커버리지도 15% 수준으로 매우 낮다.

**Action Items:**
1. 사용자 멘탈 모델 + 핵심 태스크 분석 추가
2. 화면 인벤토리(최소 app + admin 각각의 주요 화면 목록) 추가
3. 네비게이션 모델(사이트맵 수준) 추가
4. v1 22개 기능 각각의 UX 패턴 최소 한 줄씩 언급
5. 페르소나별 UX 우선순위 매트릭스 추가
6. 관리자 콘솔 Design Opportunities 보강
7. 화면별 데이터 갱신 방식(실시간/폴링/정적) 구분 추가
