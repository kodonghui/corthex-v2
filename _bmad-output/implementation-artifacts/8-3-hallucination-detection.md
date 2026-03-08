# Story 8.3: Hallucination Detection

Status: review

## Story

As a 시스템 (품질 게이트),
I want 에이전트 결과물에서 도구 조회 실제 데이터와 에이전트 주장을 비교하여 환각(사실과 다른 내용)을 자동 탐지한다,
so that CEO에게 허위 정보가 전달되기 전에 걸러내고, 환각 탐지율 >90% 목표를 달성할 수 있다.

## Acceptance Criteria

1. **Given** HallucinationDetector 서비스 **When** 에이전트 결과물 + toolCalls 데이터 전달 **Then** 사실적 주장(숫자, 날짜, 이름, URL, 통계)을 추출하고 도구 데이터와 비교하여 불일치를 탐지한다
2. **Given** 에이전트 응답에 "삼성전자 주가 72,000원" 주장 **When** toolCalls 결과에 "68,500원" 기록 **Then** 해당 주장을 잠재적 환각으로 플래그하고 confidence score 포함
3. **Given** 에이전트 응답에 도구 데이터가 없는 상태로 구체적 수치 포함 **When** 해당 수치에 대한 toolCalls 기록 없음 **Then** "출처 없는 수치" 경고 (warn, unsourced claim)
4. **Given** 금융 데이터 콘텐츠 (주가, 환율, 재무제표 수치) **When** 환각 검사 실행 **Then** 금융 전용 비교 로직 적용 (허용 오차 범위 ±1% 등)
5. **Given** 일반 텍스트 콘텐츠 **When** 환각 검사 실행 **Then** 날짜, 이름, URL 등 일반 사실 클레임 비교
6. **Given** 코드 콘텐츠 **When** 환각 검사 실행 **Then** 존재하지 않는 API/라이브러리 주장 탐지 (llm-check 위임)
7. **Given** 환각 탐지 완료 **When** 결과 반환 **Then** HallucinationReport 포함: claims 목록, matches/mismatches, confidence scores, 종합 verdict (clean/warning/critical)
8. **Given** critical 환각 (핵심 수치 불일치) **When** 판정 **Then** auto-reject (fail) 권고
9. **Given** minor 환각 (사소한 날짜 오차 등) **When** 판정 **Then** warn 처리 (CEO에게 주의 표시)
10. **Given** InspectionEngine과 통합 **When** inspect() 호출 시 toolData 존재 **Then** HallucinationDetector가 자동 실행되어 ruleResults에 환각 탐지 결과 병합
11. **Given** quality_reviews DB 저장 **When** 환각 탐지 결과 포함 **Then** scores JSONB에 hallucinationReport 필드 추가
12. **Given** turbo build **When** 전체 빌드 **Then** 3/3 패키지 성공

## Tasks / Subtasks

- [x] Task 1: ClaimExtractor — 사실적 주장 추출기 (AC: #1, #2, #3)
  - [x] 1.1 `packages/server/src/services/hallucination-detector.ts` 생성
  - [x] 1.2 `FactualClaim` 타입 정의: { type: 'number'|'date'|'name'|'url'|'statistic', value: string, context: string, position: number }
  - [x] 1.3 `extractNumberClaims(content)` — 숫자 + 단위 추출 (정규식: 숫자+원/달러/%, 온도, 건수 등)
  - [x] 1.4 `extractDateClaims(content)` — 날짜/시간 추출 (YYYY-MM-DD, MM/DD, "오늘", "어제" 등)
  - [x] 1.5 `extractNameClaims(content)` — 기관명, 인물명, 회사명 추출 (한글 고유명사 패턴)
  - [x] 1.6 `extractUrlClaims(content)` — URL 패턴 추출
  - [x] 1.7 `extractAllClaims(content)` — 통합 추출 함수

- [x] Task 2: ToolDataMatcher — 도구 데이터 비교기 (AC: #2, #3, #4, #5)
  - [x] 2.1 `ToolDataEntry` 타입: { toolName: string, input: unknown, output: string, timestamp: string }
  - [x] 2.2 `parseToolData(toolData)` — toolCalls 레코드를 구조화된 ToolDataEntry[] 로 변환
  - [x] 2.3 `matchClaimToToolData(claim, toolEntries)` — 각 claim에 대해 관련 도구 데이터 찾기
  - [x] 2.4 `compareNumericClaim(claim, toolValue, contentType)` — 숫자 비교 (금융: ±1% 허용, 일반: 정확 일치)
  - [x] 2.5 `compareDateClaim(claim, toolValue)` — 날짜 비교
  - [x] 2.6 `compareNameClaim(claim, toolValue)` — 이름/기관명 비교 (fuzzy match)
  - [x] 2.7 `ClaimVerification` 타입: { claim, matched: boolean, toolSource?: string, discrepancy?: string, confidence: number }

- [x] Task 3: HallucinationDetector 메인 서비스 (AC: #7, #8, #9)
  - [x] 3.1 `HallucinationReport` 타입: { claims: ClaimVerification[], unsourcedClaims: FactualClaim[], verdict: 'clean'|'warning'|'critical', score: number, details: string }
  - [x] 3.2 `detectContentType(content, commandText)` — 콘텐츠 유형 판별 (financial/code/general)
  - [x] 3.3 `detect(content, toolData, commandText)` — 메인 탐지 함수
  - [x] 3.4 verdict 판정 로직: critical 불일치 1개+ → critical, minor 불일치 3개+ → warning, 나머지 → clean
  - [x] 3.5 unsourced claims 처리: 도구 데이터 없는 구체적 수치 → warn
  - [x] 3.6 LLM fallback: 복잡한 환각 판단은 기존 acc-hallucination-detect LLM 규칙에 위임

- [x] Task 4: InspectionEngine 통합 (AC: #10, #11)
  - [x] 4.1 `inspection-engine.ts`의 `inspect()` 함수에 hallucination detection 단계 추가
  - [x] 4.2 toolData 존재 시 HallucinationDetector.detect() 호출
  - [x] 4.3 hallucinationReport를 InspectionResult에 포함
  - [x] 4.4 chief-of-staff.ts의 mergedScores에 hallucinationReport 필드 추가

- [x] Task 5: 빌드 검증 (AC: #12)
  - [x] 5.1 turbo build 3/3 성공

## Dev Notes

### v1 코드 참고 (필수)

**v1 quality_gate.py** (`/home/ubuntu/CORTHEX_HQ/src/core/quality_gate.py`):
- 환각 관련 키워드: "hallucination", "fact check"
- v1에서는 LLM 기반으로만 환각 탐지 (규칙 기반 사전 필터 없음)
- v2에서는 **규칙 기반 claim 추출 + 도구 데이터 비교 + LLM fallback** 3단계로 강화

**v1 quality_rules.yaml** (`/home/ubuntu/CORTHEX_HQ/config/quality_rules.yaml`):
- 환각 탐지 관련 규칙 정의 존재
- v2 quality_rules.yaml에 이미 `acc-fact-check`(도구 데이터 비교)와 `acc-hallucination-detect`(환각 패턴) 규칙 정의됨

### 기존 코드 (확장 대상)

**inspection-engine.ts** (`packages/server/src/services/inspection-engine.ts`):
- 8-2에서 구현된 하이브리드 검수 엔진
- `inspect(input)`: 규칙별 검수 → LLM 검수 → 종합 판정
- `InspectionInput`: content, commandText, companyId, commandId, agentId, departmentNameEn, **toolData**, attemptNumber
- **toolData가 이미 파라미터로 전달됨** — 이를 활용하여 환각 탐지 추가
- `evaluateLLMCheck()`: LLM 기반 검수 (acc-fact-check, acc-hallucination-detect 규칙이 이미 이 함수로 처리됨)
- **이번 스토리**: LLM 호출 전에 규칙 기반 claim 추출 + 도구 데이터 비교를 먼저 수행하여, LLM 호출 없이도 명백한 환각을 빠르게 탐지

**quality-rules.ts** (`packages/server/src/services/quality-rules.ts`):
- `getRulesForCompany(companyId)`: 회사별 오버라이드 포함 규칙 로드
- 변경 없음 — 기존 그대로 사용

**quality_rules.yaml** (`packages/server/src/config/quality_rules.yaml`):
- `acc-fact-check`: llm-check, requireToolData=true, "도구 데이터와 다른 사실" 검수
- `acc-hallucination-detect`: llm-check, checkPatterns 포함, "환각 징후 탐지"
- 이 규칙들은 기존 InspectionEngine에서 LLM으로 평가됨
- **이번 스토리에서 추가**: 규칙 기반 사전 탐지 → LLM은 복잡한 판단만 담당

**chief-of-staff.ts** (`packages/server/src/services/chief-of-staff.ts`):
- `qualityGate()` 함수 (line 345): Legacy 5항목 + InspectionEngine 하이브리드 판정
- `mergedScores` JSONB에 legacyScores, ruleResults, rubricScores 저장
- **이번 스토리에서 추가**: `hallucinationReport` 필드를 mergedScores에 포함

**toolCalls 테이블** (`packages/server/src/db/schema.ts`, line 332):
- `id`, `companyId`, `sessionId`, `agentId`, `toolId`, `toolName`, `input`(jsonb), `output`(text), `status`, `durationMs`, `createdAt`
- HallucinationDetector의 도구 데이터 소스: qualityGate에 전달되는 `toolData` 파라미터
- toolData는 `{ [toolName]: { input, output } }` 형태로 chief-of-staff에서 전달됨

### 아키텍처 결정

```
Phase 1 (규칙 기반, 결정적): ClaimExtractor + ToolDataMatcher
  - 숫자/날짜/이름/URL 정규식으로 추출
  - 도구 데이터와 직접 비교 (LLM 호출 없음, 비용 0원)
  - 명백한 불일치 즉시 탐지

Phase 2 (LLM 기반, 확률적): 기존 acc-fact-check + acc-hallucination-detect
  - 복잡한 맥락 판단 (논리적 모순, 존재하지 않는 기관 등)
  - 이미 InspectionEngine에서 처리됨

Phase 3 (통합): InspectionResult에 hallucinationReport 병합
  - 규칙 기반 결과 + LLM 결과 결합
  - verdict 판정: clean/warning/critical
```

### 콘텐츠 유형별 비교 전략

```
financial (금융 데이터):
  - 주가, 환율, 재무제표 수치: ±1% 허용 오차
  - 거래량: ±5% 허용 오차
  - 날짜: 정확 일치 필수

general (일반 텍스트):
  - 수치: 정확 일치
  - 날짜: ±1일 허용
  - 이름: fuzzy match (Levenshtein distance ≤ 2)

code (코드):
  - API/라이브러리명: 정확 일치
  - 버전: major.minor 일치 필수
  - LLM에 위임하여 존재 여부 확인
```

### confidence score 계산

```
confidence = base_score × match_quality × source_reliability

base_score:
  - 정확 일치 (도구 데이터 있음): 0.95
  - 근사 일치 (허용 오차 내): 0.80
  - 불일치: 0.90 (높은 확신으로 환각)
  - 출처 없음: 0.60 (중간 확신)

match_quality:
  - 동일 도구에서 직접 매칭: 1.0
  - 유사 도구에서 간접 매칭: 0.85
  - 매칭 도구 없음: 0.50
```

### 파일 구조

```
packages/server/src/
├── services/
│   ├── hallucination-detector.ts  # 신규 — 환각 탐지 서비스
│   ├── inspection-engine.ts       # 수정 — hallucination detection 통합
│   └── chief-of-staff.ts         # 수정 — hallucinationReport 저장
└── __tests__/
    └── unit/
        └── hallucination-detector.test.ts  # 신규 — 환각 탐지 테스트
```

### 코딩 컨벤션 (필수)

- 파일명: kebab-case 소문자 (hallucination-detector.ts)
- API 응답: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- 테넌트 격리: 모든 DB 쿼리에 companyId WHERE 절 필수
- import 경로 대소문자: git ls-files 기준 실제 케이싱 일치 필수
- LLM 호출: 반드시 LLMRouter를 통해야 함 (비용 추적 + fallback)
- 테스트: bun:test, describe/it 구조

### 이전 스토리 교훈 (8-2에서)

- InspectionEngine의 evaluate 함수들은 순수 함수 + async LLM 호출 분리 패턴
- LLM 호출 실패 시 graceful degradation: warn + skipped=true
- parseLLMJson 유틸: ```json 코드 블록 추출 → JSON.parse → fallback regex
- bun:test에서 mock: `import { mock } from 'bun:test'`
- 규칙 기반은 LLM 호출 없이 결정적으로 테스트 가능
- RuleResult 타입 재사용: ruleId, ruleName, category, severity, result, score, message, skipped

### Project Structure Notes

- `hallucination-detector.ts`는 독립 서비스로, InspectionEngine에서 호출
- InspectionEngine의 inspect() 함수에 Phase 2.5로 삽입 (rule-based → **hallucination** → llm-check)
- DB 스키마 변경 없음 — quality_reviews.scores JSONB가 유연하므로 hallucinationReport 추가만
- 새 YAML 규칙 추가 불필요 — 기존 acc-fact-check, acc-hallucination-detect 규칙 활용

### References

- [Source: _bmad-output/planning-artifacts/prd.md#FR54 환각 탐지]
- [Source: _bmad-output/planning-artifacts/epics.md#E8-S3]
- [Source: packages/server/src/services/inspection-engine.ts — 8-2 검수 엔진]
- [Source: packages/server/src/services/quality-rules.ts — YAML 파서]
- [Source: packages/server/src/config/quality_rules.yaml — acc-fact-check, acc-hallucination-detect]
- [Source: packages/server/src/services/chief-of-staff.ts#qualityGate — 품질 게이트]
- [Source: packages/server/src/db/schema.ts#toolCalls — 도구 호출 로그]
- [Source: packages/server/src/db/schema.ts#qualityReviews — QA 결과]
- [Source: /home/ubuntu/CORTHEX_HQ/src/core/quality_gate.py — v1 품질 게이트]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- HallucinationDetector 서비스: 3단계 파이프라인 (ClaimExtractor → ToolDataMatcher → Verdict)
- ClaimExtractor: 5종 claim 추출기 (숫자/날짜/이름/URL/통계) — 정규식 기반, LLM 호출 없음
- ToolDataMatcher: 도구 실행 데이터와 claim 비교, 40% 범위 내 관련 수치 매칭
- 콘텐츠 유형별 비교 전략: financial(±1%), code(LLM 위임), general(정확 일치)
- Verdict 판정: critical(핵심 수치 불일치) → auto-reject, warning(경미/출처없음) → warn, clean → pass
- InspectionEngine 통합: Phase 2.5로 삽입 (rule-based → hallucination → llm-check)
- chief-of-staff.ts: mergedScores에 hallucinationReport 필드 추가
- Confidence score: 0-1 범위, 매칭 품질 + 소스 신뢰도 기반
- graceful degradation: 환각 탐지 실패 시 기존 검수 엔진만으로 판정 계속
- 77 tests passing (hallucination-detector.test.ts)
- 72 tests passing (inspection-engine.test.ts, 기존 유지)
- 100 tests passing (chief-of-staff.test.ts, 기존 유지)
- turbo build 3/3 성공

### File List

- packages/server/src/services/hallucination-detector.ts (신규)
- packages/server/src/services/inspection-engine.ts (수정 — hallucinationReport 통합)
- packages/server/src/services/chief-of-staff.ts (수정 — mergedScores에 hallucinationReport 추가)
- packages/server/src/__tests__/unit/hallucination-detector.test.ts (신규)
- _bmad-output/implementation-artifacts/8-3-hallucination-detection.md (수정)
- _bmad-output/implementation-artifacts/sprint-status.yaml (수정)
