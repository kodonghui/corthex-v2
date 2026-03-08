# Story 8.1: Quality Rules YAML Parser

Status: done

## Story

As a 시스템 (비서실장 오케스트레이션),
I want quality_rules.yaml 파일을 정의하고 Zod 기반 파서/검증 엔진으로 로드한다,
so that P1 품질 게이트 자동 규칙 검수 엔진(8-2)이 YAML 기반 규칙을 사용하여 에이전트 결과물을 검수할 수 있다.

## Acceptance Criteria

1. **Given** `packages/server/src/config/quality_rules.yaml` 존재 **When** 서버 시작 **Then** YAML 파일 로드 + Zod 스키마 검증 성공, 파서 인스턴스 사용 가능
2. **Given** quality_rules.yaml **When** 카테고리 조회 **Then** completeness, accuracy, safety 3개 카테고리 + 각 카테고리별 규칙 반환
3. **Given** 각 규칙 **When** 구조 검증 **Then** id, category, severity(critical/major/minor), condition(type+params), action(pass/warn/fail) 필드 존재
4. **Given** 파서 API **When** `getRulesByCategory('completeness')` **Then** 해당 카테고리 규칙만 필터링 반환
5. **Given** 파서 API **When** `getRulesBySeverity('critical')` **Then** severity=critical 규칙만 반환
6. **Given** 파서 API **When** `getActiveRules()` **Then** enabled=true인 규칙만 반환 (disabled 규칙 제외)
7. **Given** 잘못된 YAML 구조 **When** 파서 로드 **Then** Zod 검증 에러 + 기본 규칙 fallback 적용 (서버 크래시 방지)
8. **Given** 회사별 오버라이드 **When** companyId 지정 **Then** 기본 규칙 + 회사별 오버라이드 병합 결과 반환
9. **Given** API 엔드포인트 `GET /api/admin/quality-rules` **When** Admin 요청 **Then** 현재 활성 규칙 목록 + 카테고리별 그룹핑 반환
10. **Given** API 엔드포인트 `PUT /api/admin/quality-rules/overrides` **When** 회사별 오버라이드 저장 **Then** DB에 저장 + 파서 캐시 갱신
11. **Given** turbo build **When** 전체 빌드 **Then** 3/3 패키지 성공

## Tasks / Subtasks

- [x] Task 1: quality_rules.yaml 정의 (AC: #1, #2, #3)
  - [x] 1.1 `packages/server/src/config/quality_rules.yaml` 생성
  - [x] 1.2 completeness 카테고리: min-length, has-sources, has-structure, conclusion-present
  - [x] 1.3 accuracy 카테고리: fact-check, hallucination-detect, no-absolute-claims
  - [x] 1.4 safety 카테고리: credential-leak, prompt-injection, pii-exposure
  - [x] 1.5 부서별 루브릭: v1 구조 이식 (default + secretary + finance + strategy + legal + marketing + tech + publishing)
  - [x] 1.6 투자 분석 전용 규칙: balance_required, risk_disclosure, optimism_bias_check, evidence_quality

- [x] Task 2: Zod 스키마 + 타입 정의 (AC: #3)
  - [x] 2.1 `packages/server/src/config/quality-rules-schema.ts` 생성
  - [x] 2.2 Zod 스키마: qualityRuleSchema, qualityRulesConfigSchema, rubricSchema 등
  - [x] 2.3 severity enum: critical | major | minor
  - [x] 2.4 condition type: regex | keyword | threshold | llm-check
  - [x] 2.5 action type: pass | warn | fail
  - [x] 2.6 Zod infer로 TypeScript 타입 자동 생성

- [x] Task 3: 파서/검증 엔진 서비스 (AC: #1, #4, #5, #6, #7, #8)
  - [x] 3.1 `packages/server/src/services/quality-rules.ts` 생성
  - [x] 3.2 loadQualityRulesConfig(): YAML 파일 로드 + Zod 검증 + 에러 시 기본 규칙 fallback
  - [x] 3.3 getRulesByCategory(category): 카테고리별 필터링
  - [x] 3.4 getRulesBySeverity(severity): 심각도별 필터링
  - [x] 3.5 getActiveRules(): enabled=true만 반환
  - [x] 3.6 getRulesForCompany(companyId): 기본 규칙 + companies.settings JSONB 오버라이드 병합
  - [x] 3.7 getRubricForDepartment(deptNameEn): 부서별 루브릭 반환 (없으면 default fallback)
  - [x] 3.8 invalidateCache(companyId): 오버라이드 변경 시 캐시 갱신

- [x] Task 4: Admin API 엔드포인트 (AC: #9, #10)
  - [x] 4.1 `packages/server/src/routes/admin/quality-rules.ts` 생성
  - [x] 4.2 GET /api/admin/quality-rules — 전체 규칙 목록 (카테고리 그룹핑)
  - [x] 4.3 GET /api/admin/quality-rules/rubrics — 부서별 루브릭 목록
  - [x] 4.4 PUT /api/admin/quality-rules/overrides — 회사별 오버라이드 저장
  - [x] 4.5 index.ts에 qualityRulesRoute 등록

- [x] Task 5: DB 스키마 확장 (AC: #8, #10)
  - [x] 5.1 companies.settings JSONB에 qualityRuleOverrides 저장 (budget 패턴과 동일, 별도 테이블 불필요)
  - [x] 5.2 마이그레이션 불필요 (기존 JSONB 컬럼 활용)

- [x] Task 6: 빌드 검증 (AC: #11)
  - [x] 6.1 turbo build 3/3 성공

## Dev Notes

### v1 코드 참고 (필수)

**v1 quality_rules.yaml** (`/home/ubuntu/CORTHEX_HQ/config/quality_rules.yaml`):
- 550줄 상세 루브릭 (부서별 5항목 scoring, 1/3/5 기준, 가중치, critical 표시)
- 공통 체크리스트 (C1-C4) + 부서별 체크리스트 (D1-D3)
- 투자 분석 전용 규칙: balance_required, risk_disclosure, optimism_bias_check, evidence_quality
- 합격 기준: all_required_pass, min_average_score: 3.0, critical_cap: 2.0
- **v2에서는 이 구조를 확장하여 completeness/accuracy/safety 카테고리 + 부서별 루브릭 병합**

**v1 QualityRulesManager** (`/home/ubuntu/CORTHEX_HQ/src/core/quality_rules_manager.py`):
- YAML 로드 + 부서별 루브릭 CRUD + API 응답 직렬화
- get_rubric(division), set_rubric(division, name, prompt), delete_rubric(division)
- v2에서는 TypeScript + Zod 검증으로 재구현

### 기존 코드 (P0 품질 게이트, 확장 대상)

**chief-of-staff.ts** (`packages/server/src/services/chief-of-staff.ts`):
- `QualityScores` 타입 (line 49): conclusionClarity, evidenceSufficiency, riskMention, formatAdequacy, logicalConsistency
- `qualityGate()` 함수 (line 343): LLM 기반 5항목 검수, qualityReviews 테이블 저장
- QUALITY_PASS_THRESHOLD = 15 (합계 15점 이상 통과)
- **이 함수는 8-2에서 YAML 규칙 기반으로 확장될 예정. 8-1에서는 파서만 만들고 chief-of-staff.ts는 수정하지 않음**

**DB 스키마** (`packages/server/src/db/schema.ts`):
- qualityReviews 테이블 (line 760): id, companyId, commandId, taskId, reviewerAgentId, conclusion, scores(jsonb), feedback, attemptNumber
- qualityResultEnum: 'pass' | 'fail' | 'warning'

### 아키텍처 결정 #6: Quality Gate Pipeline

```
P0: 비서실장 LLM 5항목 검수 (현재 구현됨)
P1: quality_rules.yaml 자동 규칙 + 환각 탐지 자동화 (이번 스토리 + 8-2)
```

- quality_rules.yaml은 `packages/server/src/config/` 디렉토리에 models.yaml 옆에 배치
- 파서 서비스는 `packages/server/src/services/quality-rules.ts` (아키텍처 파일 트리 참조: quality-gate.ts 옆)
- Zod 스키마는 같은 디렉토리 config/ 아래에 quality-rules-schema.ts

### 기술 스택

- YAML 파싱: `yaml` 패키지 (이미 bun 환경에서 사용 가능, Bun.file() 또는 fs 로드)
- 스키마 검증: `zod` (이미 프로젝트에 설치됨 — toolpool, 라우트 등에서 사용 중)
- 테스트: `bun:test` (기존 패턴 따름)
- DB: Drizzle ORM (기존 스키마 패턴 따름)

### 파일 구조

```
packages/server/src/
├── config/
│   ├── models.yaml          # 기존 (참고용 구조)
│   ├── models.ts            # 기존 (YAML 로더 참고)
│   ├── quality_rules.yaml   # 신규 - 품질 규칙 YAML
│   └── quality-rules-schema.ts  # 신규 - Zod 스키마
├── services/
│   ├── chief-of-staff.ts    # 기존 (수정 안 함, 8-2에서 확장)
│   └── quality-rules.ts     # 신규 - 파서/검증 엔진
├── routes/
│   └── quality-rules.ts     # 신규 - Admin API
└── db/
    └── schema.ts            # 확장 - quality_rule_overrides 테이블
```

### models.ts 참고 (YAML 로드 패턴)

`packages/server/src/config/models.ts` 에서 YAML 로드 패턴 참고:
- `import { readFileSync } from 'fs'` 또는 `Bun.file()` 사용
- YAML 파싱 후 Zod 검증하는 패턴 따라갈 것

### 코딩 컨벤션 (필수)

- 파일명: kebab-case 소문자 (quality-rules.ts, quality-rules-schema.ts)
- API 응답: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- 테넌트 격리: 모든 DB 쿼리에 companyId WHERE 절 필수
- import 경로 대소문자: git ls-files 기준 실제 케이싱 일치 필수

### 이전 스토리 교훈 (Epic 7에서)

- YAML 파일은 반드시 Zod 검증 + fallback 패턴 (models.ts 참고)
- 서비스 싱글톤 패턴: export const 인스턴스 (lazy init)
- API 라우트: Hono app.route() 패턴으로 등록
- 테스트: describe/it 구조, mock 최소화, 실제 YAML 파싱 테스트 포함

### Project Structure Notes

- `packages/server/src/config/quality_rules.yaml` — 아키텍처 파일 트리에 명시된 위치
- `packages/server/src/services/quality-gate.ts` — 아키텍처에 명시됐으나 아직 미생성. 이번 스토리에서는 quality-rules.ts만 생성. quality-gate.ts는 8-2에서 생성 (규칙 기반 자동 검수 엔진)
- 기존 qualityGate 함수는 chief-of-staff.ts에 인라인 — 8-2에서 quality-gate.ts로 분리 예정

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#6. Quality Gate Pipeline]
- [Source: _bmad-output/planning-artifacts/prd.md#FR53 quality_rules.yaml 자동 검수]
- [Source: _bmad-output/planning-artifacts/epics.md#E8-S1]
- [Source: /home/ubuntu/CORTHEX_HQ/config/quality_rules.yaml — v1 550줄 루브릭]
- [Source: /home/ubuntu/CORTHEX_HQ/src/core/quality_rules_manager.py — v1 파서]
- [Source: packages/server/src/services/chief-of-staff.ts#qualityGate — P0 구현]
- [Source: packages/server/src/db/schema.ts#qualityReviews — DB 스키마]
- [Source: packages/server/src/config/models.ts — YAML 로드 패턴 참고]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- quality_rules.yaml: 11개 규칙 (completeness 4 + accuracy 3 + safety 3 + PII 1), 8개 부서별 루브릭, 투자 분석 전용 규칙 4종
- Zod 스키마: 전체 YAML 구조 검증 (rules, passCriteria, rubrics, investmentAnalysis)
- 파서 서비스: 캐싱, 카테고리/심각도/활성 필터, 회사별 오버라이드 병합
- Admin API: 4개 엔드포인트 (목록, 루브릭, 활성규칙, 오버라이드 저장)
- DB: companies.settings JSONB에 qualityRuleOverrides 저장 (budget 패턴 동일)
- 60 tests passing (452 expect calls)
- turbo build 3/3 성공
- v1 quality_rules.yaml 550줄 루브릭 구조 완전 이식 (8개 부서)

### File List

- packages/server/src/config/quality_rules.yaml (신규)
- packages/server/src/config/quality-rules-schema.ts (신규)
- packages/server/src/services/quality-rules.ts (신규)
- packages/server/src/routes/admin/quality-rules.ts (신규)
- packages/server/src/index.ts (수정 - qualityRulesRoute 등록)
- packages/server/src/__tests__/unit/quality-rules.test.ts (신규)
- packages/server/package.json (수정 - js-yaml, @types/js-yaml 추가)
