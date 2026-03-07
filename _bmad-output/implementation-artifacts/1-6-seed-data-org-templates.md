# Story 1.6: Seed Data + Org Templates

Status: done

## Story

As a 시스템 관리자,
I want 비서실장(Chief of Staff) 시스템 에이전트와 3종 조직 템플릿("투자분석", "마케팅", "올인원")이 시드 데이터로 생성되기를,
so that 새 회사가 생성될 때 즉시 사용 가능한 기본 에이전트와 조직 구조 템플릿이 준비된다.

## Acceptance Criteria

1. **Given** 시드 스크립트 실행 **When** seed.ts 실행 완료 **Then** 비서실장 시스템 에이전트가 생성됨 (isSystem=true, tier=manager, isSecretary=true, Soul 문서 포함)
2. **Given** 시드 스크립트 실행 **When** seed.ts 실행 완료 **Then** 3종 조직 템플릿이 org_templates 테이블에 생성됨 (isBuiltin=true, companyId=null)
3. **Given** 3종 템플릿 **When** templateData 확인 **Then** 각 템플릿에 부서 + 에이전트 정의가 포함됨 (name, tier, modelName, soul, allowedTools)
4. **Given** 시드 스크립트 **When** 중복 실행 **Then** 에러 없이 멱등성 보장 (기존 데이터 유지, 중복 삽입 없음)
5. **Given** 비서실장 에이전트 **When** RBAC 삭제 요청 **Then** isSystem=true로 403 반환 (기존 RBAC 미들웨어와 연동)

## Tasks / Subtasks

- [x] Task 1: 비서실장 시스템 에이전트 시드 데이터 추가 (AC: #1, #5)
  - [x] 기존 seed.ts의 "H-비서" 에이전트를 비서실장으로 업그레이드
  - [x] isSystem=true, tier='manager', isSecretary=true, modelName='claude-sonnet-4-6' 설정
  - [x] Soul 마크다운: 오케스트레이션 역할 정의 (자동 분류 -> 부서 위임 -> 결과 종합 -> 품질 검수)
  - [x] allowedTools: 기본 플랫폼 도구 전체 허용

- [x] Task 2: 3종 조직 템플릿 시드 데이터 생성 (AC: #2, #3)
  - [x] "투자분석" 템플릿: 재무팀 + CIO(manager) + 투자분석 전문가(specialist) x2 + 리서치 워커(worker) x2
  - [x] "마케팅" 템플릿: 마케팅팀 + CMO(manager) + 콘텐츠 전문가(specialist) + SNS 전문가(specialist) + 디자인 워커(worker)
  - [x] "올인원" 템플릿: 경영지원실 + 개발팀 + 마케팅팀 + 재무팀 + 각 부서별 Manager + Specialist + Worker
  - [x] 각 에이전트에 Soul 마크다운 + allowedTools + modelName 정의
  - [x] org_templates 테이블에 isBuiltin=true, companyId=null로 삽입

- [x] Task 3: 시드 멱등성 보장 (AC: #4)
  - [x] ON CONFLICT DO NOTHING 또는 upsert 패턴 적용
  - [x] 시스템 에이전트: name + companyId + isSystem으로 중복 체크
  - [x] 조직 템플릿: name + isBuiltin으로 중복 체크
  - [x] 중복 실행 시 로그만 출력하고 에러 없이 완료

- [x] Task 4: 시드 서비스 모듈화 (AC: #1~#4)
  - [x] `packages/server/src/services/seed.service.ts` 생성
  - [x] seedSystemAgent(companyId, userId): 비서실장 생성
  - [x] seedOrgTemplates(): 3종 빌트인 템플릿 생성
  - [x] seed.ts에서 서비스 호출하도록 리팩토링

- [x] Task 5: 단위 테스트 작성
  - [x] 비서실장 시드 데이터 검증 (isSystem, tier, soul 존재 여부)
  - [x] 3종 템플릿 templateData 구조 검증
  - [x] 멱등성 테스트 (2회 실행 시 중복 없음)
  - [x] 템플릿 데이터 유효성 (모든 에이전트에 필수 필드 존재)

## Dev Notes

### 기존 코드베이스 분석

**현재 seed.ts 상태:**
- `packages/server/src/db/seed.ts` -- 회사, admin, CEO, 4개 부서, 4개 에이전트(H-비서 + 3개 부서 에이전트), 도구 정의, 관심종목 시드
- "H-비서"는 isSecretary=true이지만 isSystem=false, tier='specialist'(기본값), Soul이 간단함
- org_templates 테이블에 아무 데이터도 없음

**org_templates 스키마:**
```typescript
// packages/server/src/db/schema.ts:787
orgTemplates = pgTable('org_templates', {
  id: uuid().primaryKey().defaultRandom(),
  companyId: uuid().references(() => companies.id),  // null = 플랫폼 내장
  name: varchar(100).notNull(),
  description: text(),
  templateData: jsonb().notNull(),  // {departments: [{name, agents: [{name, tier, modelName, soul, allowedTools}]}]}
  isBuiltin: boolean().notNull().default(false),
  isActive: boolean().notNull().default(true),
  createdBy: uuid().references(() => users.id),
  createdAt, updatedAt
})
```

**agents 스키마 핵심 필드:**
```typescript
// packages/server/src/db/schema.ts:115
agents = pgTable('agents', {
  id, companyId, userId, departmentId,
  name, role, tier(agentTierEnum), nameEn, modelName,
  reportTo, soul, adminSoul, status,
  isSecretary, isSystem, allowedTools(jsonb),
  isActive, createdAt, updatedAt
})
```

**templateData 구조 (Architecture 결정):**
```typescript
interface TemplateData {
  departments: Array<{
    name: string;
    description?: string;
    agents: Array<{
      name: string;
      nameEn?: string;
      role: string;
      tier: 'manager' | 'specialist' | 'worker';
      modelName: string;
      soul: string;
      allowedTools: string[];
    }>;
  }>;
}
```

### 비서실장(Chief of Staff) Soul 정의

v1의 비서실장 역할 기반으로 작성:
- CEO 명령 자동 분류 (direct/mention/slash/all/sequential/deepwork)
- 적절한 부서/매니저로 자동 위임
- 결과 종합 + 5항목 루브릭 품질 검수 (결론, 근거, 리스크, 형식, 논리)
- 최종 보고서 CEO에게 전달
- 모든 회사에 자동 생성됨 (isSystem=true -> 삭제 불가)

### 3종 조직 템플릿 상세

**"투자분석" 템플릿:**
- 재무팀: CIO(Manager, claude-sonnet-4-6) + 투자분석A(Specialist, claude-haiku-4-5) + 투자분석B(Specialist) + 리서치A(Worker, claude-haiku-4-5) + 리서치B(Worker)
- 허용 도구: get_stock_price, get_account_balance, place_stock_order, search_web, search_news, create_report

**"마케팅" 템플릿:**
- 마케팅팀: CMO(Manager, claude-sonnet-4-6) + 콘텐츠 전문가(Specialist) + SNS 전문가(Specialist) + 디자인 워커(Worker)
- 허용 도구: search_web, search_news, search_images, generate_image, publish_instagram, get_instagram_insights, create_report

**"올인원" 템플릿:**
- 경영지원실: COO(Manager) + 경영분석가(Specialist) + 총무(Worker)
- 개발팀: CTO(Manager) + 시니어 개발자(Specialist) + 주니어 개발자(Worker)
- 마케팅팀: CMO(Manager) + 마케팅 전문가(Specialist) + 콘텐츠 워커(Worker)
- 재무팀: CFO(Manager) + 투자 전문가(Specialist) + 리서치 워커(Worker)

### 멱등성 구현 전략

Drizzle ORM에서 ON CONFLICT 사용:
```typescript
import { sql } from 'drizzle-orm'

// 방법 1: 삽입 전 존재 여부 체크
const existing = await db.select().from(agents)
  .where(and(eq(agents.companyId, companyId), eq(agents.isSystem, true), eq(agents.isSecretary, true)))
  .limit(1)
if (existing.length > 0) {
  console.log('비서실장 이미 존재 -- 건너뜀')
  return existing[0]
}

// 방법 2: 템플릿은 name + isBuiltin으로 체크
const existingTemplate = await db.select().from(orgTemplates)
  .where(and(eq(orgTemplates.name, name), eq(orgTemplates.isBuiltin, true)))
  .limit(1)
```

### 파일 구조

```
packages/server/src/
├── db/
│   ├── seed.ts                      # 수정 -- 서비스 호출로 리팩토링
│   └── schema.ts                    # 변경 없음
├── services/
│   └── seed.service.ts              # 신규 -- 비서실장 + 템플릿 시드 로직
└── __tests__/unit/
    └── seed-data.test.ts            # 신규 -- 시드 데이터 검증 테스트
```

### 테스트 전략

- bun:test 사용 (프로젝트 컨벤션)
- DB 접근 없이 순수 로직 테스트: templateData 구조 검증, 필수 필드 체크
- seed.service.ts의 export된 데이터 상수를 직접 import하여 검증
- 멱등성은 mock DB로 2회 호출 테스트

### Project Structure Notes

- 서비스 파일: `packages/server/src/services/` 디렉토리 (기존 패턴 따름)
- 테스트 파일: `packages/server/src/__tests__/unit/` 디렉토리 (기존 패턴)
- 파일명: kebab-case (seed.service.ts, seed-data.test.ts)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E1-S6] -- 스토리 요구사항
- [Source: _bmad-output/planning-artifacts/architecture.md#L374-L388] -- 시스템 에이전트 보호 + 조직 템플릿 인터페이스
- [Source: packages/server/src/db/schema.ts#L787-L800] -- org_templates 테이블 스키마
- [Source: packages/server/src/db/schema.ts#L115-L137] -- agents 테이블 스키마
- [Source: packages/server/src/db/seed.ts] -- 기존 시드 스크립트 (수정 대상)
- [Source: packages/server/src/db/index.ts] -- DB 연결 + Drizzle ORM 설정

## Dev Agent Record

### Agent Model Used

claude-opus-4-6

### Debug Log References

### Completion Notes List

- Task 4: seed.service.ts 생성 -- seedSystemAgent(), seedOrgTemplates() 함수 + 3종 템플릿 데이터 상수 + TemplateData 타입 export
- Task 1: 비서실장(Chief of Staff) isSystem=true, tier=manager, modelName=claude-sonnet-4-6, 5항목 품질 루브릭 포함 Soul
- Task 2: 투자분석(5명), 마케팅(4명), 올인원(12명/4부서) 3종 빌트인 템플릿, isBuiltin=true, companyId=null
- Task 3: 멱등성 -- SELECT 존재 체크 후 INSERT, 중복 시 건너뜀 + 로그 출력
- Task 1 연동: seed.ts의 H-비서 -> seedSystemAgent() 호출로 교체
- Task 2 연동: seed.ts에 seedOrgTemplates() 호출 추가
- Task 5: 195개 단위 테스트 -- Soul 키워드, 템플릿 구조, 에이전트 필수 필드, 3계급 모델 배정, JSON 호환, 한국어 소통 검증

### Change Log

- 2026-03-07: Story 1-6 구현 완료 -- 비서실장 시스템 에이전트 + 3종 조직 템플릿 시드, 195 tests pass

### File List

- packages/server/src/services/seed.service.ts (신규 -- 시드 서비스: 비서실장 + 조직 템플릿)
- packages/server/src/db/seed.ts (수정 -- seedSystemAgent/seedOrgTemplates 호출)
- packages/server/src/__tests__/unit/seed-data.test.ts (신규 -- 195 tests)
- packages/server/src/__tests__/unit/seed-data-tea.test.ts (신규 -- 74 TEA risk-based tests)
