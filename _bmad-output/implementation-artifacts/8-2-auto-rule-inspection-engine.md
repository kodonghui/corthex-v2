# Story 8.2: Auto Rule Inspection Engine

Status: review

## Story

As a 시스템 (비서실장 오케스트레이션),
I want YAML 규칙 기반 자동 검수 + LLM 기반 세밀 검수를 결합한 하이브리드 검수 엔진을 구현한다,
so that 에이전트 결과물의 품질을 규칙 기반(결정적) + LLM 기반(확률적) 양축으로 검수하여 정확하고 일관된 품질 게이트를 운영할 수 있다.

## Acceptance Criteria

1. **Given** InspectionEngine 서비스 **When** 에이전트 결과물 + 적용 규칙 전달 **Then** 규칙별 pass/warn/fail 판정 + 종합 결론 반환
2. **Given** threshold 타입 규칙 (comp-min-length) **When** 응답 길이 50자 미만 **Then** fail 판정, 50자 이상이면 pass
3. **Given** keyword 타입 규칙 (comp-has-sources) **When** 응답에 "출처:" 등 키워드 포함 **Then** pass, 미포함이면 warn
4. **Given** keyword absence 모드 규칙 (acc-no-absolute-claims) **When** "무조건", "100%" 등 포함 **Then** warn 판정
5. **Given** regex 타입 규칙 (safe-credential-leak) **When** API 키 패턴 매치 **Then** fail 판정
6. **Given** regex multiline 옵션 **When** 여러 줄에 걸친 구조 패턴 **Then** multiline 모드로 매칭
7. **Given** llm-check 타입 규칙 (acc-fact-check) **When** LLM에 프롬프트 전달 **Then** LLM이 pass/fail + 점수 + 상세 피드백 반환
8. **Given** llm-check + requireToolData=true **When** 도구 실행 데이터 없음 **Then** 해당 규칙 skip (warn)
9. **Given** 전체 검수 완료 **When** passCriteria 적용 **Then** allCriticalMustPass(critical 규칙 하나라도 fail → 전체 fail), maxFailCount=0 (fail 1개 이상 → 전체 fail), maxWarnCount=3 (warn 4개 이상 → 전체 fail)
10. **Given** 검수 결과 **When** DB 저장 **Then** quality_reviews 테이블에 commandId, conclusion, scores(규칙별 상세), feedback, attemptNumber 저장
11. **Given** chief-of-staff.ts의 qualityGate 호출 **When** InspectionEngine 통합 **Then** 기존 LLM 5항목 검수 + YAML 규칙 검수 결과를 병합하여 최종 판정
12. **Given** 부서별 루브릭 **When** 해당 부서 에이전트 결과물 검수 **Then** 루브릭 scoring 기준으로 LLM에 평가 요청, 가중 평균 점수 반환
13. **Given** 회사별 오버라이드 **When** companyId 지정 **Then** 오버라이드된 규칙으로 검수 (8-1 getRulesForCompany 활용)
14. **Given** turbo build **When** 전체 빌드 **Then** 3/3 패키지 성공

## Tasks / Subtasks

- [x] Task 1: InspectionEngine 핵심 서비스 생성 (AC: #1, #2, #3, #4, #5, #6)
  - [x] 1.1 `packages/server/src/services/inspection-engine.ts` 생성
  - [x] 1.2 `InspectionInput` 타입 정의
  - [x] 1.3 `RuleResult` 타입 정의
  - [x] 1.4 `InspectionResult` 타입 정의 (+ `RubricScore`)
  - [x] 1.5 threshold 조건 평가기: `evaluateThreshold` — responseLength, sourceCount, lineCount, wordCount + 6개 operator
  - [x] 1.6 keyword 조건 평가기: `evaluateKeyword` — presence/absence 모드, minMatches 기준
  - [x] 1.7 regex 조건 평가기: `evaluateRegex` — multiline 옵션, 패턴 배열 순회, invalid regex 스킵
  - [x] 1.8 `evaluateRuleBasedCheck(rule, content)` — 조건 타입별 분기 + action 매핑 → RuleResult

- [x] Task 2: LLM 기반 검수 (AC: #7, #8, #12)
  - [x] 2.1 `evaluateLLMCheck(rule, content, commandText, context, toolData?)` — LLMRouter 통해 검수
  - [x] 2.2 LLM 프롬프트 구성: 규칙 prompt + 결과물 + toolData + checkPatterns
  - [x] 2.3 LLM 응답 파싱: parseLLMJson으로 `{ passed, score, feedback }` 파싱
  - [x] 2.4 requireToolData=true + toolData 없으면 skip (warn, skipped=true)
  - [x] 2.5 LLM 호출 실패 시 graceful degradation: warn + skipped
  - [x] 2.6 `evaluateRubric(content, commandText, rubric, context)` — 부서별 루브릭 LLM 평가

- [x] Task 3: 종합 판정 엔진 (AC: #9, #13)
  - [x] 3.1 `inspect(input)` 메인 함수: 규칙 로드 → rule-based 먼저 → llm-check 후 → 종합 판정
  - [x] 3.2 `applyPassCriteria`: allCriticalMustPass, maxFailCount, maxWarnCount 검사
  - [x] 3.3 스코어: rule-based pass=1/fail=0, llm-check normalized 0-1
  - [x] 3.4 `buildFeedback`: fail/warn 메시지 수집 + severity prefix
  - [x] 3.5 `getRulesForCompany(companyId)` 호출로 회사별 오버라이드 적용

- [x] Task 4: chief-of-staff.ts 통합 (AC: #10, #11)
  - [x] 4.1 qualityGate 함수에 InspectionEngine 호출 추가 (Phase B)
  - [x] 4.2 하이브리드 판정: legacyPassed AND inspectionPassed → overall passed
  - [x] 4.3 quality_reviews scores JSONB에 legacyScores + ruleResults + rubricScores 병합
  - [x] 4.4 최종 pass/fail: 기존 15점 기준 AND InspectionEngine conclusion='pass'
  - [x] 4.5 피드백 병합: legacyFeedback + inspectionFeedback 결합

- [x] Task 5: 빌드 검증 (AC: #14)
  - [x] 5.1 turbo build 3/3 성공

## Dev Notes

### v1 코드 참고 (필수)

**v1 quality_rules_manager.py** (`/home/ubuntu/CORTHEX_HQ/src/core/quality_rules_manager.py`):
- `evaluate_report(report_text, division)` — 부서별 루브릭 기반 검수
- `evaluate_checklist(text, checklist)` — 체크리스트 항목 확인
- `score_rubric(text, scoring)` — LLM에 루브릭 scoring 기준 전달
- v2에서는 TypeScript + 규칙 기반(deterministic) + LLM 하이브리드로 재구현

**v1 chief_of_staff.py** (`/home/ubuntu/CORTHEX_HQ/src/orchestration/chief_of_staff.py`):
- 품질 검수 후 자동 재작업 (최대 2회)
- fail 시 피드백 포함 → 이미 v2 chief-of-staff.ts에 구현됨

### 기존 코드 (확장 대상)

**quality-rules.ts** (`packages/server/src/services/quality-rules.ts`):
- 8-1에서 구현된 YAML 파서/검증 엔진
- `loadQualityRulesConfig()` — YAML 로드 + Zod 검증
- `getActiveRules()` — enabled=true 규칙만 반환
- `getRulesForCompany(companyId)` — 회사별 오버라이드 병합
- `getRubricForDepartment(deptNameEn)` — 부서별 루브릭
- `getPassCriteria()` — 합격 기준

**quality-rules-schema.ts** (`packages/server/src/config/quality-rules-schema.ts`):
- `QualityRule` 타입: id, category, severity, condition(type+params), action
- condition type: `regex | keyword | threshold | llm-check`
- condition params: regexParams(patterns, minMatches, multiline), keywordParams(keywords, minMatches, mode), thresholdParams(field, operator, value), llmCheckParams(prompt, requireToolData, checkPatterns)
- `PassCriteria`: allCriticalMustPass, maxFailCount, maxWarnCount, criticalCap
- `Rubric`: name, commonChecklist, departmentChecklist, scoring(id, label, weight, critical, criteria)

**chief-of-staff.ts** (`packages/server/src/services/chief-of-staff.ts`):
- `qualityGate()` 함수 (line 343): LLM 기반 5항목 검수
- `QualityScores`: conclusionClarity, evidenceSufficiency, riskMention, formatAdequacy, logicalConsistency
- `QUALITY_PASS_THRESHOLD = 15` (합계 15점 이상 통과)
- `qualityReviews` 테이블에 결과 저장
- 이 함수를 **확장**하여 InspectionEngine 결과 병합 (기존 로직 유지 + 추가)

**LLM Router** (`packages/server/src/services/llm-router.ts`):
- `LLMRouter.call(request, context)` — LLM 요청, fallback 포함
- `LLMRouterContext`: { companyId, agentId, agentName, source }
- `LLMRequest`: { model, messages, temperature?, maxTokens? }
- LLM 호출 시 반드시 LLMRouter를 통해야 함 (비용 추적, fallback, circuit breaker)
- 검수용 LLM 호출은 `source: 'delegation'` 사용

**Agent Runner** (`packages/server/src/services/agent-runner.ts`):
- `agentRunner.execute(agentConfig, taskInput, context, toolExecutor?)` — 에이전트 실행
- InspectionEngine의 LLM 검수에서는 직접 LLMRouter.call()을 사용 (agentRunner가 아닌 단순 LLM 호출)

**DB 스키마** (`packages/server/src/db/schema.ts`):
- `qualityReviews` 테이블 (line 774): id, companyId, commandId, taskId, reviewerAgentId, conclusion('pass'|'fail'|'warning'), scores(jsonb), feedback, attemptNumber
- scores JSONB에 기존 QualityScores + 새 ruleResults를 병합 저장

### 아키텍처 결정 #6: Quality Gate Pipeline

```
P0: 비서실장 LLM 5항목 검수 (구현 완료 — chief-of-staff.ts)
P1: quality_rules.yaml 자동 규칙 + LLM 하이브리드 검수 (이번 스토리)
```

- inspection-engine.ts를 아키텍처 파일 트리의 `quality-gate.ts` 대신 생성 (더 명확한 이름)
- 기존 chief-of-staff.ts의 qualityGate 함수는 유지 + InspectionEngine 호출 추가
- InspectionEngine은 독립적으로도 테스트 가능한 순수 서비스

### 하이브리드 검수 전략

```
1. Rule-based (결정적) — 먼저 실행, 빠름
   - threshold: 응답 길이 등 수치 비교
   - keyword: 키워드 존재/부재 확인
   - regex: 패턴 매칭 (크리덴셜, PII 등)

2. LLM-based (확률적) — 후에 실행, 규칙 기반 통과 후
   - llm-check: 사실 확인, 환각 탐지 등 복잡한 판단
   - rubric scoring: 부서별 루브릭 기반 LLM 평가

3. 종합 판정
   - passCriteria 적용 (critical must pass, maxFail, maxWarn)
   - rule-based + llm-based 결과 병합
   - 기존 LLM 5항목 검수와 AND 조합
```

### 기술 스택

- YAML 파서: 8-1의 quality-rules.ts 그대로 활용
- LLM 호출: LLMRouter (이미 구현됨)
- JSON 파싱: 기존 `parseLLMJson` 유틸 또는 직접 JSON.parse
- 테스트: bun:test, mock LLM 호출
- DB: Drizzle ORM — qualityReviews 테이블 기존 스키마 활용

### 파일 구조

```
packages/server/src/
├── services/
│   ├── chief-of-staff.ts    # 수정 — InspectionEngine 통합
│   ├── quality-rules.ts     # 기존 (8-1) — 변경 없음
│   └── inspection-engine.ts # 신규 — 자동 규칙 검수 엔진
└── __tests__/
    └── unit/
        └── inspection-engine.test.ts  # 신규 — 검수 엔진 테스트
```

### 코딩 컨벤션 (필수)

- 파일명: kebab-case 소문자 (inspection-engine.ts)
- API 응답: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- 테넌트 격리: 모든 DB 쿼리에 companyId WHERE 절 필수
- import 경로 대소문자: git ls-files 기준 실제 케이싱 일치 필수
- LLM 호출: 반드시 LLMRouter를 통해야 함 (비용 추적 + fallback)

### 이전 스토리 교훈 (8-1에서)

- YAML 파일은 Zod 검증 + fallback 패턴 — 이미 quality-rules.ts에 구현됨
- 서비스 싱글톤 패턴: export const 인스턴스 or export function
- 테스트: describe/it 구조, LLM 호출은 mock, 규칙 기반은 실제 실행
- regex 패턴 주의: YAML에서 이스케이프 처리 필요 (이미 처리됨)
- bun:test에서 mock: `import { mock } from 'bun:test'` 사용

### LLM 검수 프롬프트 구성 가이드

```
시스템 프롬프트:
"당신은 CORTHEX의 품질 검수 AI입니다. 에이전트 결과물을 평가하고 JSON으로 응답하세요."

사용자 프롬프트 (llm-check):
"## 검수 규칙
{rule.description}

## 검수 지시
{rule.condition.params.prompt}

## 원본 명령
{commandText}

## 에이전트 결과물
{content}

{toolData가 있으면}
## 도구 실행 데이터
{JSON.stringify(toolData)}

JSON으로 응답하세요:
{ "passed": boolean, "score": 1-5, "feedback": "상세 사유" }"
```

```
사용자 프롬프트 (rubric scoring):
"## 검수 기준
{rubric.name}

## 평가 항목
{scoring 항목별 label + weight + criteria 설명}

## 원본 명령
{commandText}

## 에이전트 결과물
{content}

각 항목별 1-5 점수를 JSON 배열로 응답:
[{ "id": "Q1", "score": 1-5, "feedback": "사유" }, ...]"
```

### Project Structure Notes

- `packages/server/src/services/inspection-engine.ts` — 아키텍처의 `quality-gate.ts` 역할
- 기존 chief-of-staff.ts의 qualityGate 함수에 InspectionEngine 호출을 추가하는 방식으로 통합
- qualityReviews 테이블은 기존 스키마 그대로 사용 (scores JSONB가 유연)
- LLM 검수 호출은 비서실장(secretary) 에이전트의 모델을 사용

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#6. Quality Gate Pipeline]
- [Source: _bmad-output/planning-artifacts/prd.md#FR53 quality_rules.yaml 자동 검수]
- [Source: _bmad-output/planning-artifacts/prd.md#FR54 환각 탐지]
- [Source: _bmad-output/planning-artifacts/epics.md#E8-S2]
- [Source: packages/server/src/services/quality-rules.ts — 8-1 YAML 파서]
- [Source: packages/server/src/config/quality-rules-schema.ts — Zod 스키마/타입]
- [Source: packages/server/src/config/quality_rules.yaml — 규칙 정의]
- [Source: packages/server/src/services/chief-of-staff.ts#qualityGate — P0 검수]
- [Source: packages/server/src/services/llm-router.ts — LLM 라우팅]
- [Source: packages/server/src/db/schema.ts#qualityReviews — DB 스키마]
- [Source: /home/ubuntu/CORTHEX_HQ/src/core/quality_rules_manager.py — v1 검수]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- InspectionEngine 서비스: 4가지 조건 평가기 (threshold, keyword, regex, llm-check) + 루브릭 평가
- Rule-based 검수 (결정적): threshold(responseLength/sourceCount/lineCount/wordCount), keyword(presence/absence), regex(multiline 지원)
- LLM-based 검수 (확률적): llm-check(사실확인/환각탐지), rubric scoring(부서별 가중 평가)
- 하이브리드 판정: rule-based 먼저 → llm-check 후 → passCriteria(critical must pass, maxFail, maxWarn) 적용
- chief-of-staff.ts 통합: 기존 LLM 5항목 + InspectionEngine 결과 AND 조합
- quality_reviews DB: 병합 scores JSONB (legacyScores + ruleResults + rubricScores)
- graceful degradation: LLM 실패/파싱 실패 시 skip(warn) 처리, InspectionEngine 전체 실패 시 legacy만으로 판정
- 72 tests passing (inspection-engine.test.ts), 100 tests passing (chief-of-staff.test.ts 기존 유지)
- turbo build 3/3 성공

### File List

- packages/server/src/services/inspection-engine.ts (신규)
- packages/server/src/services/chief-of-staff.ts (수정 — InspectionEngine 통합)
- packages/server/src/__tests__/unit/inspection-engine.test.ts (신규)
- _bmad-output/implementation-artifacts/8-2-auto-rule-inspection-engine.md (수정)
- _bmad-output/implementation-artifacts/sprint-status.yaml (수정)
