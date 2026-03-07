# Story 1.7: Tenant Isolation Integration Test

Status: done

## Story

As a 시스템 관리자,
I want 테넌트 격리 + RBAC가 정상 동작하는지 검증하는 통합 테스트가 있기를,
so that 회사 간 데이터 유출이 절대 발생하지 않음을 자동으로 보장할 수 있다.

## Acceptance Criteria

1. **Given** 회사A와 회사B가 각각 데이터를 보유 **When** 회사A의 인증으로 조회 **Then** 회사A 데이터만 반환되고 회사B 데이터는 절대 노출되지 않음
2. **Given** CEO 역할 사용자 **When** Admin 전용 API에 접근 시 **Then** 403 반환
3. **Given** 일반 사용자 **When** companyId를 다른 회사로 조작하여 요청 **Then** 차단 (403 또는 401)
4. **Given** 전체 테스트 스위트 실행 **When** 기존 테스트 포함 **Then** 모든 기존 테스트 통과 유지 (regression 없음)

## Tasks / Subtasks

- [x] Task 1: 테넌트 격리 통합 테스트 (AC: #1, #3)
  - [x] 2개 회사 컨텍스트 생성 (companyA, companyB)
  - [x] tenant-helpers (withTenant, scopedWhere, scopedInsert) 크로스-테넌트 검증
  - [x] tenantMiddleware: companyId 누락 → 401, companyId 불일치 body → 403
  - [x] superadmin companyId 오버라이드 동작 검증
  - [x] companyId 조작 시도 차단 테스트
- [x] Task 2: RBAC 통합 테스트 (AC: #2)
  - [x] rbacMiddleware: 허용 역할 통과, 비허용 역할 403
  - [x] super_admin 모든 엔드포인트 통과
  - [x] RBAC 거부 시 감사 로그 기록 검증
  - [x] 미들웨어 체이닝 순서: auth → tenant → rbac
- [x] Task 3: 감사 로그 테넌트 격리 테스트 (AC: #1)
  - [x] createAuditLog: companyId별 격리 검증
  - [x] queryAuditLogs: companyA 로그만 조회, companyB 로그 미포함
  - [x] INSERT ONLY 정책: UPDATE/DELETE 시도 불가 확인
  - [x] withAuditLog 래퍼 동작 검증
- [x] Task 4: 크리덴셜 볼트 테넌트 격리 테스트 (AC: #1)
  - [x] storeCredential: companyA 저장 후 companyB로 조회 불가
  - [x] getCredential/listCredentials: companyId 격리 검증
  - [x] deleteCredential: 다른 회사 크리덴셜 삭제 불가
  - [x] 크리덴셜 접근 시 감사 로그 기록 검증
- [x] Task 5: 시드 데이터/조직 템플릿 테넌트 격리 테스트 (AC: #1)
  - [x] seedSystemAgent: companyId별 독립 생성 검증
  - [x] 빌트인 템플릿: companyId=null (전체 공유) 검증
  - [x] 시드 멱등성: 2회 실행 시 중복 없음 재검증
- [x] Task 6: 크로스-컴포넌트 통합 테스트 (AC: #1, #2, #3)
  - [x] 전체 플로우: tenant middleware → RBAC → audit log → credential vault 연계
  - [x] 에지케이스: 빈 companyId, undefined role, 잘못된 JWT 형식

## Dev Notes

### 기존 코드베이스 분석

**테스트 해야 할 컴포넌트 (Stories 1-1 ~ 1-6):**

1. **스키마 (1-1)**: `packages/server/src/db/schema.ts` -- 모든 테이블에 companyId 칼럼
2. **테넌트 미들웨어 (1-2)**: `packages/server/src/middleware/tenant.ts` -- JWT companyId 추출, body 불일치 체크, superadmin 오버라이드
3. **테넌트 헬퍼 (1-2)**: `packages/server/src/db/tenant-helpers.ts` -- withTenant(), scopedWhere(), scopedInsert()
4. **RBAC 미들웨어 (1-3)**: `packages/server/src/middleware/rbac.ts` -- 역할 기반 접근 제어, super_admin 전체 통과, 거부 시 감사 로그
5. **감사 로그 (1-4)**: `packages/server/src/services/audit-log.ts` -- INSERT ONLY, createAuditLog(), queryAuditLogs(), withAuditLog()
6. **크리덴셜 볼트 (1-5)**: `packages/server/src/services/credential-vault.ts` -- AES-256-GCM 암호화, companyId별 격리, 감사 로그 연동
7. **시드 서비스 (1-6)**: `packages/server/src/services/seed.service.ts` -- 비서실장 + 3종 조직 템플릿, 멱등성

**기존 단위 테스트 파일 (참조용, 중복 금지):**
- `tenant-isolation.test.ts`, `tenant-isolation-tea.test.ts` -- 테넌트 미들웨어/헬퍼 단위 테스트
- `rbac-middleware.test.ts`, `rbac-tea.test.ts` -- RBAC 미들웨어 단위 테스트
- `audit-log.test.ts` -- 감사 로그 단위 테스트
- `credential-vault.test.ts`, `credential-vault-ext.test.ts`, `credential-vault-ext-tea.test.ts` -- 볼트 단위 테스트
- `seed-data.test.ts`, `seed-data-tea.test.ts` -- 시드 데이터 단위 테스트

**핵심 차별점: 단위 테스트 vs 통합 테스트**
- 기존 단위 테스트: 각 컴포넌트를 독립적으로 검증 (mock 사용)
- 이 스토리의 통합 테스트: **컴포넌트 간 연계**를 검증 (크로스-테넌트 시나리오)
  - 테넌트 미들웨어 + RBAC + 감사 로그가 함께 동작하는가?
  - 회사A의 미들웨어 컨텍스트로 회사B의 데이터에 접근 가능한가? (절대 불가여야 함)

### 테스트 구현 패턴

**테넌트 컨텍스트 시뮬레이션:**
```typescript
// 2개 회사 UUID 상수
const COMPANY_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const COMPANY_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

// Hono 미들웨어 테스트를 위한 mock 컨텍스트
const createMockContext = (companyId: string, role: string) => ({
  get: (key: string) => key === 'tenant' ? { companyId, role, userId: 'test-user' } : undefined,
  set: vi.fn(), // or mock
  req: { method: 'GET', path: '/test', query: () => null, header: () => null, json: () => ({}) },
})
```

**테스트 파일명:** `tenant-integration.test.ts`

**테스트 프레임워크:** bun:test (프로젝트 표준)
- `describe`, `test`, `expect` 사용
- `mock` 함수는 `import { mock } from 'bun:test'`
- DB 접근 필요한 테스트: 실제 DB 대신 로직 레벨에서 검증 (tenant-helpers의 SQL 조건 생성 검증)

### 핵심 테스트 시나리오

**1. 테넌트 격리 -- 데이터 유출 방지:**
- withTenant(table.companyId, COMPANY_A)로 생성한 조건이 COMPANY_B 데이터를 필터링하는지
- scopedInsert에 주입된 companyId가 정확한지
- scopedWhere에 companyId AND 추가 조건이 올바르게 결합되는지

**2. RBAC -- 역할별 접근 제어:**
- rbacMiddleware('company_admin') → CEO 역할 → 403
- rbacMiddleware('ceo', 'company_admin') → CEO 역할 → 통과
- super_admin → 항상 통과 (allowedRoles 무관)

**3. 크로스-컴포넌트:**
- RBAC 거부 → audit_logs에 기록됨 (rbac.ts의 logRbacDenial)
- credential vault의 storeCredential → 감사 로그 생성됨
- 미들웨어 체이닝: tenant(401) → rbac(403) 순서로 에러 반환

### Project Structure Notes

- 통합 테스트 파일: `packages/server/src/__tests__/unit/tenant-integration.test.ts` (기존 단위 테스트 디렉토리)
- 파일명: kebab-case (tenant-integration.test.ts)
- import 경로: 상대 경로 `../../middleware/tenant`, `../../middleware/rbac` 등

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E1-S7] -- 스토리 요구사항
- [Source: packages/server/src/middleware/tenant.ts] -- 테넌트 격리 미들웨어
- [Source: packages/server/src/db/tenant-helpers.ts] -- 테넌트 쿼리 헬퍼
- [Source: packages/server/src/middleware/rbac.ts] -- RBAC 미들웨어 + 감사 로그 연동
- [Source: packages/server/src/services/audit-log.ts] -- 감사 로그 서비스 (INSERT ONLY)
- [Source: packages/server/src/services/credential-vault.ts] -- 크리덴셜 볼트 (companyId 격리)
- [Source: packages/server/src/services/seed.service.ts] -- 시드 서비스 (멱등성)
- [Source: packages/server/src/__tests__/unit/tenant-isolation.test.ts] -- 기존 단위 테스트 (중복 금지)
- [Source: packages/server/src/__tests__/unit/rbac-middleware.test.ts] -- 기존 단위 테스트 (중복 금지)

## Dev Agent Record

### Agent Model Used

claude-opus-4-6

### Debug Log References

### Completion Notes List

- Task 1: 테넌트 격리 통합 테스트 -- 2개 회사(COMPANY_A/B) 크로스-테넌트 검증, tenant-helpers/middleware 14개 테스트
- Task 2: RBAC 통합 테스트 -- 역할별 접근 제어 + super_admin 바이패스 + 미들웨어 체이닝 순서 검증 11개 테스트
- Task 3: 감사 로그 테넌트 격리 -- companyId별 격리, INSERT ONLY 정책, withAuditLog 래퍼 검증 8개 테스트
- Task 4: 크리덴셜 볼트 테넌트 격리 -- companyId 강제, maskCredentialFields NFR12, provider validation 12개 테스트
- Task 5: 시드 데이터/조직 템플릿 -- 비서실장 Soul, 3종 템플릿 구조, 빌트인 설정 검증 15개 테스트
- Task 6: 크로스-컴포넌트 -- 전체 미들웨어 체인, RBAC+감사 연계, credential+audit 연계, 에지케이스 17개 테스트
- 총 77개 통합 테스트, 300 expect() 호출, 전부 통과
- 기존 315개 Epic 1 테스트 100% regression 통과 확인

### Change Log

- 2026-03-07: Story 1-7 구현 완료 -- 테넌트 격리 통합 테스트 77개, 300 expect()

### File List

- packages/server/src/__tests__/unit/tenant-integration.test.ts (신규 -- 77개 통합 테스트)
- packages/server/src/__tests__/unit/tenant-integration-tea.test.ts (신규 -- TEA 40개 리스크 기반 테스트)
- packages/server/src/__tests__/unit/tenant-integration-qa.test.ts (신규 -- QA 14개 AC 검증 테스트)
