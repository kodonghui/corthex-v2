# Story 2.1: Admin Login & Auth

Status: done

## Story

As a 관리자,
I want 별도 관리자 계정으로 안전하게 로그인하기를,
so that 관리 기능에 접근하고 보안 사고를 방지할 수 있다.

## Acceptance Criteria

1. **Given** admin URL **When** admin_users 계정으로 ID/PW 입력 **Then** admin JWT 발급 + 대시보드 표시
2. **Given** admin URL **When** users 테이블의 일반 직원 계정으로 로그인 시도 **Then** 로그인 거부
3. **Given** 로그인 5회 실패 **When** 6번째 시도 **Then** "잠시 후 다시 시도하세요 (N초 후 잠금 해제)" 카운트다운 표시
4. **Given** 관리자 로그인 상태 **When** JWT 만료 또는 401 응답 **Then** `/login?redirect={현재경로}` 리다이렉트
5. **Given** 리다이렉트로 로그인 **When** 재로그인 성공 **Then** 원래 페이지로 복귀
6. **Given** admin JWT **When** `/api/admin/*` 호출 **Then** 정상 접근. 일반 유저 JWT로 호출 시 403

## Tasks / Subtasks

- [x] Task 1: admin_users 전용 로그인 라우트 (AC: #1, #2)
  - [x] `POST /api/auth/admin/login` 신규 라우트: admin_users 테이블에서 조회
  - [x] 기존 `/api/auth/login`은 users 테이블만 조회 (admin_users 미조회)
  - [x] admin JWT에 `type: 'admin'` 클레임 추가, adminOnly 미들웨어에서 검증
- [x] Task 2: 로그인 Rate Limit + 카운트다운 UI (AC: #3)
  - [x] 서버: `/api/auth/admin/login` 5회/분 제한, 초과 시 `retryAfter` 초 응답
  - [x] 프론트: 429 응답 시 카운트다운 타이머 표시 (1초 간격 감소)
- [x] Task 3: 401 리다이렉트 + 원래 페이지 복귀 (AC: #4, #5)
  - [x] `packages/admin/src/lib/api.ts` 401 시 `?redirect=` 쿼리 포함 리다이렉트
  - [x] LoginPage에서 redirect 쿼리 확인 후 로그인 성공 시 해당 경로로 이동
- [x] Task 4: 테스트 (AC: #6)
  - [x] admin JWT ↔ user JWT 분리 테스트: 유저 JWT로 admin 라우트 접근 → 403
  - [x] admin_users 로그인 + users 테이블 로그인 거부 테스트
  - [x] Rate limit 초과 시 429 응답 테스트

## Dev Notes

### 현재 코드베이스 상태

**이미 존재하는 것:**
- `packages/admin/src/pages/login.tsx` — 로그인 UI 완성. 현재 `/api/auth/login` 호출 후 `role !== 'admin'` 체크
- `packages/server/src/routes/auth.ts` — `/api/auth/login` (users 테이블만 조회)
- `packages/server/src/middleware/auth.ts` — JWT 생성/검증 + `adminOnly` 미들웨어
- `packages/server/src/db/schema.ts` — `admin_users` 테이블 존재 (username, passwordHash, name, role)
- `packages/server/src/middleware/rate-limit.ts` — rate-limit 미들웨어

**수정이 필요한 것:**

| 항목 | 현재 | 목표 |
|------|------|------|
| 로그인 라우트 | users 테이블 조회 + role 체크 | admin_users 전용 라우트 분리 |
| JWT 구분 | 동일 시크릿, role만 다름 | `type: 'admin'` 클레임 추가 |
| Rate limit UI | 없음 | 카운트다운 표시 |
| 401 처리 | 로그인 페이지로만 이동 | redirect 쿼리 포함 |

### 파일 변경 범위

```
packages/server/src/routes/auth.ts          — admin 로그인 라우트 추가
packages/server/src/middleware/auth.ts       — JwtPayload에 type 추가, adminOnly 수정
packages/admin/src/pages/login.tsx           — 카운트다운 + redirect 쿼리
packages/admin/src/lib/api.ts               — 401 시 redirect 쿼리
packages/server/src/__tests__/              — 테스트
```

### References

- [Source: packages/server/src/routes/auth.ts] — 현재 로그인 로직
- [Source: packages/server/src/middleware/auth.ts] — JWT 생성/검증
- [Source: packages/admin/src/pages/login.tsx] — 현재 로그인 UI
- [Source: packages/server/src/db/schema.ts] — admin_users 테이블
- [Source: UX spec] — Rate limit 기준: IP+계정 조합, 5회→1분 잠금, 카운트다운

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- admin_users 전용 로그인 라우트 구현 (POST /api/auth/admin/login)
- JWT에 type:'admin' 클레임 추가, adminOnly 미들웨어에서 이중 검증
- 로그인 5회/분 rate limit + 카운트다운 UI 구현
- 401 시 redirect 쿼리 포함 리다이렉트 + 재로그인 후 원래 페이지 복귀
- 코드리뷰: 로그인 실패 감사 로그 추가 (일반 + 관리자)

### File List
- packages/server/src/routes/auth.ts — admin 로그인 라우트 + 실패 감사 로그
- packages/server/src/middleware/auth.ts — JwtPayload type 추가, adminOnly 수정
- packages/admin/src/pages/login.tsx — 카운트다운 + redirect 쿼리
- packages/admin/src/lib/api.ts — 401 시 redirect 쿼리
