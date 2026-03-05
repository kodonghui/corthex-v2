# Story 8.5: P2 테넌트 격리 테스트 — 도구/자격증명 API 격리 검증 + 보안 갭 수정

Status: review

## Story

As a 시스템,
I want Epic 8에서 추가/수정된 도구 시스템, 자격증명 관련 API의 테넌트 격리를 검증한다,
so that 타사 데이터 접근이 불가능함을 자동 테스트로 보장할 수 있다.

## Acceptance Criteria

1. **Given** A사 유저 토큰 **When** B사 도구 정의 GET/PUT 시도 **Then** 404 또는 빈 데이터 반환
2. **Given** A사 유저 토큰 **When** B사 CLI 자격증명/API 키 DELETE 시도 **Then** 404 반환
3. **Given** admin tools API **When** GET /tools/:id, PUT /tools/:id **Then** companyId 필터가 적용되어 타사 도구 접근 불가
4. **Given** admin credentials API **When** DELETE /cli-credentials/:id, DELETE /api-keys/:id **Then** companyId 필터 적용
5. **Given** 격리 테스트 스위트 **When** bun test 실행 **Then** 모든 테스트 통과 (기존 + 신규)
6. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: Admin Tools API 보안 갭 수정 (AC: #3)
  - [x] GET /tools/:id — `where(and(eq(id), or(isNull(companyId), eq(companyId))))` 추가
  - [x] PUT /tools/:id — `where(and(eq(id), or(isNull(companyId), eq(companyId))))` 추가
  - [x] platform scope(companyId=null) 도구는 모든 회사에서 접근 가능하므로 `isNull OR eq` 패턴 사용

- [x] Task 2: Admin Credentials API 보안 갭 수정 (AC: #4)
  - [x] DELETE /cli-credentials/:id — `and(eq(id), eq(companyId))` 필터 추가
  - [x] DELETE /api-keys/:id — `and(eq(id), eq(companyId))` 필터 추가

- [x] Task 3: 도구 격리 테스트 추가 (AC: #1)
  - [x] tenant-isolation.test.ts에 `describe('도구 시스템: 타사 도구 접근 불가')` 추가
  - [x] 테스트: 가짜 회사 admin으로 도구 목록 조회 → platform 도구만 반환
  - [x] 테스트: 가짜 회사 admin으로 존재하지 않는 도구 수정 시도 → 404

- [x] Task 4: 자격증명 격리 테스트 추가 (AC: #2)
  - [x] tenant-isolation.test.ts에 `describe('자격증명: 타사 자격증명 접근 불가')` 추가
  - [x] 테스트: 가짜 회사 admin으로 타사 API 키 삭제 시도 → 404
  - [x] 테스트: 가짜 회사 admin으로 타사 CLI 토큰 삭제 시도 → 404

- [x] Task 5: 빌드 + 테스트 검증 (AC: #5, #6)
  - [x] 기존 unit 테스트 172개 전체 통과 확인
  - [x] turbo build 3/3 성공 확인

## Dev Notes

### Admin Tools API 보안 수정

tools.ts에 `AppEnv` 타입 + `or`, `isNull` import 추가. GET/:id와 PUT/:id에서 tenant의 companyId를 검증:
- platform 도구(companyId=null): 모든 회사에서 접근 가능 (`isNull`)
- company 도구: 자기 회사 것만 접근 가능 (`eq(companyId)`)

### Admin Credentials API 보안 수정

credentials.ts에 `AppEnv` 타입 추가. DELETE에서 `and(eq(id), eq(companyId))` 패턴으로 타사 자격증명 삭제 차단.

### Project Structure Notes

- 격리 테스트: packages/server/src/__tests__/tenant-isolation.test.ts
- Admin Tools API: packages/server/src/routes/admin/tools.ts
- Admin Credentials API: packages/server/src/routes/admin/credentials.ts

### References

- [Source: packages/server/src/__tests__/tenant-isolation.test.ts] — 기존 격리 테스트 패턴
- [Source: packages/server/src/routes/admin/tools.ts] — GET/:id, PUT/:id companyId 수정
- [Source: packages/server/src/routes/admin/credentials.ts] — DELETE companyId 수정
- [Source: packages/server/src/routes/admin/agents.ts:44-49] — 참고 패턴 (tenant.companyId 사용)

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1: tools.ts GET/:id, PUT/:id에 `or(isNull(companyId), eq(companyId))` 필터 추가
- Task 2: credentials.ts DELETE cli-credentials/:id, api-keys/:id에 companyId 필터 추가
- Task 3: 도구 격리 테스트 2건 추가 (목록 조회 platform 필터, 수정 404)
- Task 4: 자격증명 격리 테스트 2건 추가 (API 키 삭제 404, CLI 토큰 삭제 404)
- Task 5: unit 테스트 172개 통과, turbo build 3/3 성공

### File List
- packages/server/src/routes/admin/tools.ts (MODIFIED — GET/:id, PUT/:id companyId 격리 + AppEnv 타입)
- packages/server/src/routes/admin/credentials.ts (MODIFIED — DELETE companyId 격리 + AppEnv 타입)
- packages/server/src/__tests__/tenant-isolation.test.ts (MODIFIED — 도구/자격증명 격리 테스트 4건 추가)
