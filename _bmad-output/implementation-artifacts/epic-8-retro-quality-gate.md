# Epic 8 회고: Quality Gate Enhancement

**날짜:** 2026-03-08
**참여:** Bob (SM), Alice (PO), Winston (Architect), Charlie (Senior Dev), Dana (QA), Elena (Junior Dev), ubuntu (Project Lead)

---

## Epic 요약

| 항목 | 수치 |
|------|------|
| 완료 스토리 | 5/5 (100%) |
| 스토리 포인트 | 11 SP |
| 총 테스트 수 | 605개 (단위+통합+TEA+UI) |
| 빌드/타입 실패 | 0건 |
| 리그레션 발생 | 0건 |
| 기술 부채 항목 | 1건 (신규) |
| 프로덕션 인시던트 | 0건 |
| 스키마 마이그레이션 | 0건 (companies.settings JSONB 재사용) |

**스토리별 상세:**

| # | 스토리 | SP | 테스트 | 핵심 성과 |
|---|--------|----|----|-----------|
| 8-1 | Quality Rules YAML Parser | 2 | 135 | quality_rules.yaml 11개 규칙 (completeness/accuracy/safety) + 8개 부서별 루브릭, Zod 스키마 검증, 회사별 오버라이드 병합, Admin API 4개 엔드포인트 |
| 8-2 | Auto Rule Inspection Engine | 3 | 124 | InspectionEngine 하이브리드 검수 (threshold/keyword/regex/llm-check 4가지 평가기), 루브릭 LLM 평가, passCriteria 종합 판정, chief-of-staff.ts 통합 |
| 8-3 | Hallucination Detection | 2 | 104 | ClaimExtractor 5종 추출기 (숫자/날짜/이름/URL/통계), ToolDataMatcher 도구 데이터 비교, 콘텐츠 유형별 비교 전략 (financial ±1%, code LLM 위임, general 정확 일치), 3단계 verdict |
| 8-4 | Prompt Injection Defense | 2 | 145 | PromptGuard 28개 인젝션 패턴 (한국어 6패턴 포함), OutputFilter 12개 크리덴셜 패턴, 민감도 3단계 (strict/moderate/permissive), Hono 미들웨어, 보안 감사 로깅 |
| 8-5 | QA Tab Enhanced UI | 2 | 97 | 4 서브탭 상세 패널 (규칙별/루브릭/환각/기존점수), 프로그레스 바 점수 시각화, 보안 알림 배너, conclusion/severity 필터, WebSocket 실시간 갱신 |

---

## 잘 된 점

### 1. 레이어드 빌드 패턴 7연속 성공 (Epic 2 -> ... -> 7 -> 8)

Epic 7 회고에서 예측한 대로 파서(8-1) -> 엔진(8-2) -> 환각 탐지(8-3) -> 보안 방어(8-4) -> UI(8-5) 순서로 완벽한 레이어드 빌드가 이루어졌다. 8-1의 quality-rules.ts 파서를 8-2 InspectionEngine이 그대로 import하고, 8-3 HallucinationDetector가 InspectionEngine에 Phase 2.5로 삽입되며, 8-5 UI가 이미 DB에 저장된 scores JSONB를 읽기만 하면 되는 자연스러운 흐름이었다. 5개 스토리에서 리그레션 0건 달성.

### 2. 하이브리드 검수 아키텍처의 성공적 설계

규칙 기반(결정적, 비용 0원) + LLM 기반(확률적, 복잡한 판단) 2단계 하이브리드 검수가 매우 효과적이었다. threshold/keyword/regex 조건은 LLM 호출 없이 즉시 판정하고, 복잡한 사실 확인이나 환각 탐지만 LLM에 위임하는 구조가 비용 효율적이면서도 정확한 검수를 가능하게 했다. Epic 7 회고의 "가드 패턴: 실패 시 서비스 장애로 이어지면 안 된다" 원칙도 graceful degradation으로 잘 적용되었다.

### 3. v1 quality_rules.yaml 550줄 루브릭 완전 이식

v1의 부서별 루브릭(8개 부서 x 5항목 scoring, 가중치, critical 표시)을 v2 YAML 구조로 완전히 이식했다. 투자 분석 전용 규칙(balance_required, risk_disclosure, optimism_bias_check, evidence_quality)까지 포함하여 v1 대비 오히려 강화되었다. "v1에서 동작했으면 v2에서도 반드시 동작해야 한다" 원칙이 지켜졌다.

### 4. 기존 코드 재사용 극대화 (중복 0건)

8-4 Prompt Injection Defense에서 기존 credential-masker.ts, agent-runner.ts의 scanForCredentials(), audit-log.ts의 createAuditLog()를 모두 재사용했다. 중복 패턴 정의 없이 확장만 추가하는 방식으로 구현했다. 특히 credential-masker.ts의 패턴을 import해서 output-filter.ts에서 확장한 것은 DRY 원칙의 좋은 사례였다.

### 5. 서버 변경 최소화로 8-5 UI 완성

8-5 QA Tab Enhanced UI에서 서버 변경은 보안 알림 API 1개 추가뿐이었다. 기존 getQualityReviews()가 이미 scores JSONB 전체를 반환하고 있었으므로, ruleResults, rubricScores, hallucinationReport 모두 프론트엔드 타입 정의와 렌더링만 추가하면 됐다. 이는 8-2에서 mergedScores 설계가 잘 되었음을 증명한다.

### 6. 보안 방어의 Quality Gate와 역할 분리

8-4(Prompt Guard)와 8-2(Inspection Engine)의 역할을 명확히 분리한 것이 아키텍처 품질을 높였다:
- **Prompt Guard (8-4)** = 실시간 입출력 방어 (동기 미들웨어, 차단)
- **Quality Gate (8-2)** = 에이전트 결과물 사후 검수 (비동기 엔진, 평가)

같은 패턴(safe-prompt-injection)이 YAML 규칙에도, 미들웨어에도 있지만 역할이 다르다: 하나는 입력 차단, 하나는 출력 검수. 이 분리가 각 계층의 책임을 명확하게 만들었다.

### 7. 스키마 마이그레이션 0건 2연속 (Epic 7 -> 8)

Epic 7에 이어 Epic 8에서도 DB 스키마 마이그레이션이 0건이었다. 회사별 promptGuard 설정은 companies.settings JSONB에, 품질 규칙 오버라이드도 같은 JSONB에 저장했다. qualityReviews.scores JSONB의 유연성이 ruleResults, rubricScores, hallucinationReport 모든 신규 데이터를 수용했다. "JSONB 컬럼은 설정 데이터의 이상적인 저장소" 원칙이 재확인되었다.

---

## 어려웠던 점

### 1. InspectionEngine과 chief-of-staff.ts의 결합 복잡성

8-2에서 InspectionEngine을 chief-of-staff.ts의 기존 qualityGate() 함수에 통합할 때, 기존 LLM 5항목 검수(legacy)와 새 규칙 기반 검수(inspection)를 AND 조합으로 병합하는 로직이 복잡했다. legacyPassed AND inspectionPassed → overall passed라는 단순 규칙이지만, mergedScores JSONB에 legacyScores + ruleResults + rubricScores + hallucinationReport를 모두 담으면서 기존 테스트(100개)도 유지해야 했다. chief-of-staff.ts가 점점 비대해지고 있다는 우려가 커졌다.

### 2. 환각 탐지의 정규식 기반 한계

8-3 HallucinationDetector의 ClaimExtractor가 정규식으로 숫자/날짜/이름/URL을 추출하는데, 한국어 텍스트에서 "약 72,000원 수준" 같은 모호한 표현이나 "삼성전자(005930)" 같은 종목코드 포함 표현의 정확한 추출이 어려웠다. 정규식이 완벽할 수 없으므로 LLM fallback에 의존하는 구간이 예상보다 넓었다. 그러나 명확한 수치(72,000원, $45.50)는 정규식으로 충분히 추출되므로, "빠르게 잡을 수 있는 것은 규칙으로, 나머지는 LLM으로" 전략 자체는 유효했다.

### 3. 프롬프트 인젝션 패턴의 오탐(False Positive) 관리

8-4에서 28개 인젝션 패턴을 정의했는데, "act as" 같은 major 패턴이 합법적인 비즈니스 명령("AI가 act as 분석가로 역할극 하라")에서 오탐될 가능성이 있었다. 화이트리스트 컨텍스트 감지(보안 토론, 코드 리뷰 관련 25개 키워드)로 완화했지만, 완벽한 오탐 제거는 불가능하다. 민감도 3단계(strict/moderate/permissive)로 운영 유연성을 확보한 것이 현실적인 해결책이었다.

### 4. QA 탭 UI 복잡성 급증

8-5에서 activity-log.tsx가 505줄에서 ~900줄로 증가했다. 4개 서브탭(규칙별 결과, 루브릭, 환각 보고서, 기존 점수) + 보안 알림 배너 + 필터 강화가 한 파일에 집중되었다. 컴포넌트 분리가 필요하지만 이번 스토리 범위에서는 처리하지 못했다.

---

## 핵심 교훈

### 1. 하이브리드 검수(규칙+LLM)는 비용 효율과 정확성을 동시에 달성한다

규칙 기반 검수는 LLM 호출 없이 즉시 실행되므로 비용이 0원이다. threshold(길이 체크), keyword(키워드 존재), regex(패턴 매칭) 3가지로 명백한 문제를 먼저 걸러내고, 복잡한 판단(사실 확인, 논리적 모순, 환각)만 LLM에 위임하면 LLM 호출 횟수를 최소화할 수 있다. 이 패턴은 향후 다른 검증 시스템에도 적용 가능하다.

### 2. JSONB의 유연성은 "미래를 위한 확장 공간"을 제공한다

qualityReviews.scores JSONB가 P0에서는 5개 점수만 저장했지만, Epic 8에서 ruleResults, rubricScores, hallucinationReport를 추가로 저장할 수 있었다. 스키마 마이그레이션 없이 새 데이터 구조를 수용하는 JSONB의 유연성이 7개 에픽 연속 증명되었다. 단, 애플리케이션 레벨에서 Zod 검증이 필수다.

### 3. 보안 방어는 계층별로 분리해야 한다

입력 검증(Prompt Guard 미들웨어) → 출력 필터링(Output Filter) → 결과 검수(Quality Gate) 3계층이 각각 다른 시점에 다른 역할을 수행한다. 한 곳에 모든 보안을 집중하면 복잡해지고 우회 경로가 생긴다. "여러 곳에서 조금씩 방어"하는 심층 방어(Defense in Depth) 원칙이 효과적이었다.

### 4. v1 기능 이식 시 "구조 이해 → 재설계 → 구현" 순서가 중요하다

v1 quality_rules.yaml의 550줄 루브릭을 v2로 이식할 때, 단순 복사가 아닌 v2 아키텍처(Zod 검증, 카테고리 분류, 회사별 오버라이드)에 맞게 재설계했다. 이 과정에서 v1에 없던 safety 카테고리(credential-leak, prompt-injection, pii-exposure)가 추가되어 v1보다 강화되었다. "이식"은 "복사"가 아닌 "진화"여야 한다.

### 5. 가드 패턴의 핵심: "가드 실패가 서비스 장애로 이어지면 안 된다"

Epic 7의 BudgetGuard 패턴이 Epic 8에서도 그대로 적용되었다. InspectionEngine 전체 실패 시 legacy 검수만으로 판정 계속, HallucinationDetector 실패 시 기존 검수 엔진만으로 진행, Prompt Guard에서 설정 로드 실패 시 기본 moderate 적용. 모든 가드에 try-catch 안전 래핑이 적용되었다.

---

## 이전 회고(Epic 7) 액션 아이템 추적

| # | 액션 아이템 | 상태 | Epic 8에서의 결과 |
|---|------------|------|-------------------|
| 1 | API 응답 단위 표준 문서화 | 미착수 | Epic 8은 API 단위 이슈 없었음. 여전히 미문서화 |
| 2 | 프론트엔드 테스트 전략 문서화 (5개 에픽째) | 미착수 | **6개 에픽째 미해결.** Epic 8에서 605개 테스트 작성했지만 공식 문서화 없음 |
| 3 | JWT blocklist 최종 결정 (6개 에픽째) | 미착수 | **7개 에픽 연속 미해결.** Epic 7 회고에서 "다음 회고에서 또 미착수이면 자동으로 구현으로 확정"이라 했으므로, **구현 확정** |
| 4 | chief-of-staff.ts 공통 헬퍼 분리 (3개 에픽째) | 악화 | **4개 에픽째.** 8-2에서 InspectionEngine 통합으로 chief-of-staff.ts가 더 비대해짐. 분리 필요성 증가 |
| 5 | ToolPool/HandlerRegistry 문서화 (4개 에픽째) | 미착수 | **5개 에픽째.** Epic 8 범위에서 도구 관련 작업 없음 |

**분석:** 5개 중 0개 완료, 0개 진행, 5개 미착수. Epic 8이 품질 게이트 특화 에픽이라 기존 기술 부채 해소에 손대기 어려웠다. JWT blocklist가 7개 에픽째 미해결로, Epic 7 회고의 강제 마감 규칙에 따라 **구현 확정**으로 전환한다.

---

## 기술 부채

| # | 항목 | 영향도 | 출처 | 해결 시점 |
|---|------|--------|------|-----------|
| 1 | JWT blocklist 미해결 (Epic 2부터 계속) | **최고** | Epic 2~8 | **7개 에픽 연속 미해결. Epic 7 강제 마감 규칙에 따라 구현 확정. Epic 9 첫 스토리 전 반드시 처리** |
| 2 | chief-of-staff.ts 공통 헬퍼 미분리 (Epic 5부터 계속) | 높음 | Epic 5~8 | **4개 에픽째. 8-2에서 InspectionEngine 통합으로 더 비대해짐. 다음 오케스트레이션 작업 시 필수 분리** |
| 3 | ToolPool/HandlerRegistry 이중 구조 문서화 (Epic 4부터 계속) | 중 | Epic 4~8 | 5개 에픽째. 새 도구 추가 시 혼란 지속 |
| 4 | 프론트엔드 테스트 전략 미문서화 (Epic 4부터 계속) | 낮음 | Epic 4~8 | 6개 에픽째. 실질적 패턴 확립(~2,100+ 테스트). 공식 문서화만 필요 |
| 5 | activity-log.tsx 900줄 비대화 (신규) | 중 | Epic 8 | 8-5에서 4 서브탭+보안 알림 추가로 급증. 컴포넌트 분리 필요 |
| 6 | cost_records commandId 컬럼 부재 (Epic 6부터 계속) | 중 | Epic 6~8 | 4개 에픽째. 현재 사용 시나리오 없어서 보류 중 |
| 7 | Admin 앱 WebSocket 인프라 부재 (Epic 7에서 계속) | 중 | Epic 7~8 | 2개 에픽째. 폴링 우회 상태 유지 중 |

---

## Epic 9 준비 사항

**Epic 9: Multi-tenancy & Admin Console** (8 stories, 17 SP)

Epic 9는 회사 CRUD, 인간 직원 관리, 직원별 명령 센터 제한, Admin UI 강화, 온보딩 마법사, CEO 앱 설정을 구현한다.

**주요 스토리 (sprint-status.yaml 기준):**
1. 9-1: company-crud-api (done)
2. 9-2: human-employee-management-api (done)
3. 9-3: employee-command-center-restriction (done)
4. 9-4: employee-management-ui-admin-a4 (done)
5. 9-5: company-settings-ui-admin-a8 (done)
6. 9-6: admin-ceo-app-switching (done)
7. 9-7: onboarding-wizard (done)
8. 9-8: ceo-app-settings-screen (done)

**참고:** Sprint status에 따르면 Epic 9 스토리들이 이미 done 상태이므로, Epic 9 회고도 곧 실행 가능.

**Epic 8에서 Epic 9으로의 의존성:**

1. **companies.settings JSONB 패턴** -- Epic 8에서 qualityRuleOverrides, promptGuard 설정을 JSONB에 저장한 패턴이 Epic 9의 회사별 설정(온보딩, 앱 전환 등)에 그대로 적용 가능
2. **보안 미들웨어 패턴** -- 8-4의 Prompt Guard 미들웨어가 직원별 명령 제한(9-3)의 참고 구조
3. **audit-log 보안 액션** -- 8-4에서 추가한 SECURITY_* 액션이 직원 관리 감사 로그에 활용 가능
4. **JWT blocklist** -- Epic 7 회고 강제 마감 규칙에 따라 Epic 9 시작 전 구현 필수

**Epic 8에서 검증된 패턴 (Epic 9에도 적용):**
- 레이어드 빌드: API(9-1~9-3) -> UI(9-4~9-5) -> 통합(9-6~9-8)
- JSONB 설정 저장: companies.settings 확장
- 가드 패턴: 직원 권한 검사에 동일 try-catch 안전 래핑
- Hono 미들웨어: 직원별 제한 미들웨어 구현에 8-4 패턴 활용

---

## 액션 아이템

### 프로세스 개선

1. **chief-of-staff.ts 리팩토링 (4개 에픽째 -- 강제 마감)**
   - 담당: Developer (Amelia) + Architect (Winston)
   - 우선도: **최고**
   - 완료 기준: qualityGate 로직을 quality-gate-service.ts로 분리, 공통 헬퍼를 orchestration-helpers.ts로 분리. chief-of-staff.ts는 오케스트레이션 흐름 관리에만 집중

2. **activity-log.tsx 컴포넌트 분리 (신규)**
   - 담당: Frontend Dev
   - 우선도: 중
   - 완료 기준: QualityDetailPanel, HallucinationReportPanel, SecurityAlertBanner를 별도 컴포넌트 파일로 분리. activity-log.tsx는 500줄 이하로 복귀

### 기술 부채

1. **JWT blocklist 구현 확정 (7개 에픽째 -- 자동 확정)**
   - 담당: PM (John) + Architect (Winston) + Developer
   - 우선도: **최고** (Epic 7 강제 마감 규칙 발동)
   - 완료 기준: **구현**. Epic 9 첫 스토리 시작 전까지 JWT revocation 메커니즘 구현. 더 이상 "의식적 수용" 옵션 없음

2. **ToolPool/HandlerRegistry 문서화 (5개 에픽째)**
   - 담당: Architect (Winston)
   - 우선도: 중
   - 완료 기준: 새 도구 추가 가이드 + 두 레지스트리의 관계 설명

3. **프론트엔드 테스트 전략 문서화 (6개 에픽째)**
   - 담당: QA (Quinn) + Senior Dev (Charlie)
   - 우선도: 낮음 (패턴은 확립, 문서화만 필요)
   - 완료 기준: 2,100+ 테스트에서 사용된 패턴을 공식 가이드로 정리

### 팀 합의

- **레이어드 빌드 패턴 8번째 에픽에서도 유지**: 파서/엔진 -> 서비스 -> UI 순서
- **하이브리드 검수 패턴 표준**: 규칙 기반(결정적, 비용 0원) 먼저 → LLM(확률적) 나중에
- **심층 방어 원칙**: 입력 검증 → 출력 필터링 → 결과 검수 3계층 분리
- **가드 패턴 표준 유지**: 가드 실패 → 서비스 계속 동작 (try-catch 안전 래핑)
- **JSONB 설정 저장 표준 유지**: 자주 변경되는 설정은 companies.settings JSONB
- **3개 에픽 이상 미해결 액션 아이템 강제 결정 유지**: JWT blocklist가 자동 확정 테스트 케이스
- **v1 기능 이식 = 재설계 + 진화**: 단순 복사가 아닌 v2 아키텍처에 맞게 강화

---

## 종합 평가

Epic 8은 CORTHEX v2의 P1 세 번째 에픽으로, AI 에이전트 결과물의 품질을 자동으로 검수하는 Quality Gate를 근본적으로 강화했다. 5개 스토리를 100% 완료하고 605개 테스트로 검증했으며, 리그레션 0건, 프로덕션 인시던트 0건, 스키마 마이그레이션 0건을 달성했다.

**특히 주목할 성과:**

- **YAML 기반 품질 규칙**: quality_rules.yaml로 11개 규칙 + 8개 부서별 루브릭을 정의하고, Zod 스키마로 검증. 회사별 오버라이드 지원으로 멀티테넌시 대응
- **하이브리드 검수 엔진**: InspectionEngine이 규칙 기반(threshold/keyword/regex, 비용 0원) + LLM 기반(llm-check/rubric scoring) 2단계로 검수. 기존 P0 qualityGate와 AND 조합으로 통합
- **환각 탐지**: ClaimExtractor가 정규식으로 사실적 주장을 추출하고, ToolDataMatcher가 도구 실행 데이터와 비교하여 불일치를 탐지. 금융 데이터 ±1% 허용 오차, 일반 텍스트 정확 일치 등 콘텐츠 유형별 전략 적용
- **프롬프트 인젝션 방어**: 28개 인젝션 패턴(한국어 포함) + 12개 크리덴셜 패턴으로 입출력 실시간 보안. Hono 미들웨어로 commands 라우트에 통합, 민감도 3단계 지원
- **QA 탭 강화 UI**: 규칙별 상세 결과, 루브릭 점수, 환각 보고서, 보안 알림을 4개 서브탭으로 투명하게 표시. 점수 프로그레스 바, severity/conclusion 필터 추가

하이브리드 검수 아키텍처(규칙+LLM)와 심층 방어(입력→출력→검수) 2가지 핵심 패턴이 확립되었으며, v1의 quality_rules.yaml 루브릭을 완전 이식하면서 safety 카테고리를 추가로 강화했다. companies.settings JSONB 활용으로 2개 에픽 연속 마이그레이션 0건을 달성한 것도 주목할 점이다.

P1 MVP Complete(Epic 6~9) 중 세 번째 에픽이 완료되었으며, 다음은 Epic 9(Multi-tenancy & Admin Console)로, Epic 8에서 확립한 보안 미들웨어 패턴과 JSONB 설정 패턴이 직접적으로 활용될 것이다. **JWT blocklist는 7개 에픽째 미해결로 강제 마감 규칙에 따라 구현 확정되었으며, Epic 9 시작 전 반드시 처리해야 한다.**

---

*Retrospective facilitated by Bob (Scrum Master)*
*Date: 2026-03-08*
