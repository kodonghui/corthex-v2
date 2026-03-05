# Story 3.1: User Login JWT

Status: review

## Story

As a 일반 직원(유저),
I want 아이디/비밀번호로 로그인해서 워크스페이스에 접근하고 싶다,
so that 내 회사의 에이전트와 업무 도구를 사용할 수 있다.

## Acceptance Criteria

1. **Given** 로그인 페이지 **When** 올바른 아이디/비밀번호 입력 **Then** JWT 토큰 발급 + 홈으로 이동
2. **Given** 로그인 페이지 **When** 잘못된 비밀번호 **Then** 한국어 에러 메시지 "아이디 또는 비밀번호가 올바르지 않습니다"
3. **Given** 로그인 페이지 **When** 5회 연속 실패 **Then** 429 응답 + 남은 시간 카운트다운 표시
4. **Given** 인증된 상태 **When** 토큰 만료 (24시간) **Then** 자동으로 로그인 페이지 이동 + "로그인이 만료되었습니다" 안내
5. **Given** 보호된 페이지 URL 직접 접근 **When** 미인증 **Then** /login으로 이동 후, 로그인 완료 시 원래 URL로 복귀
6. **Given** 로그인 성공 **When** 브라우저 새로고침 **Then** localStorage 토큰으로 인증 유지
7. **Given** 로그인 성공 **When** /auth/me 호출 **Then** 유저 정보(id, name, role, companyId) 표시

## Tasks / Subtasks

- [x] Task 1: App API 클라이언트 강화 (AC: #2, #3, #4)
  - [x] 에러 코드 한국어 매핑 (`errorMessages`) — admin api.ts 패턴 복제
  - [x] `RateLimitError` 클래스 + 429 응답 핸들링
  - [x] 401 응답 시 토큰 클리어 + /login 리다이렉트 (현재 URL을 ?redirect= 파라미터로 전달)
- [x] Task 2: Auth Store 강화 (AC: #6, #7)
  - [x] `checkAuth()` 메서드: 앱 시작 시 저장된 토큰으로 `/auth/me` 호출해서 유효성 검증
  - [x] `user` 객체에 `companyId`, `role` 포함 확인
  - [x] `logout()` 시 localStorage 클리어 + /login 이동
- [x] Task 3: 로그인 페이지 UI 개선 (AC: #1, #2, #3, #5)
  - [x] 에러 메시지 한국어 표시 (api.ts의 errorMessages 활용)
  - [x] Rate limit 카운트다운 타이머 (429 시 `Retry-After` 또는 60초 기본)
  - [x] ?redirect 쿼리 파라미터 처리: 로그인 성공 시 해당 경로로 이동
  - [x] 로딩 상태 표시 (버튼 비활성화 + 스피너)
- [x] Task 4: ProtectedRoute 강화 (AC: #5)
  - [x] 미인증 시 현재 경로를 ?redirect= 파라미터로 전달하며 /login으로 이동
  - [x] App.tsx 시작 시 `checkAuth()` 호출
- [x] Task 5: 빌드 + 기존 테스트 통과 확인
  - [x] `turbo build` 3/3 성공
  - [x] `bun test src/__tests__/unit/` 전체 통과

## Dev Notes

### 백엔드: 이미 완성됨 (수정 불필요)

서버측 유저 로그인은 Epic 1에서 구현 완료:
- `POST /api/auth/login` — username/password → JWT 토큰 + user 반환
- `GET /api/auth/me` — Bearer 토큰 → 유저 정보 반환
- JWT: HS256, 24시간 만료, payload `{sub, companyId, role, exp}`
- Rate limit: 로그인 5회/분 (loginRateLimit), API 100회/분 (apiRateLimit)
- 활동 로그: 로그인 성공/실패 자동 기록

### 프론트엔드: 기존 코드 수정/강화

**현재 존재하는 파일:**

| 파일 | 현재 상태 | 필요한 변경 |
|------|----------|------------|
| `packages/app/src/pages/login.tsx` | 기본 폼만 있음 | 에러 한국어, 카운트다운, redirect 지원 |
| `packages/app/src/lib/api.ts` | fetch wrapper만 | errorMessages, RateLimitError, 401 redirect |
| `packages/app/src/stores/auth-store.ts` | 기본 login/logout | checkAuth 추가, companyId 활용 |
| `packages/app/src/App.tsx` | ProtectedRoute 있음 | redirect 파라미터 전달, checkAuth 호출 |

### Admin 참조 패턴 (그대로 따라할 것)

**에러 한국어 매핑** — `packages/admin/src/lib/api.ts`:
```typescript
const errorMessages: Record<string, string> = {
  AUTH_001: '아이디 또는 비밀번호가 올바르지 않습니다',
  AUTH_002: '로그인이 만료되었습니다. 다시 로그인해주세요',
  AUTH_004: '로그인 시도가 너무 많습니다',
  RATE_001: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요',
  TENANT_001: '접근 권한이 없습니다',
}
```

**RateLimitError 클래스** — `packages/admin/src/lib/api.ts`:
```typescript
export class RateLimitError extends Error {
  retryAfter: number
  constructor(message: string, retryAfter: number) {
    super(message)
    this.retryAfter = retryAfter
  }
}
```

**401 자동 리다이렉트** — `packages/admin/src/lib/api.ts`:
```typescript
if (res.status === 401) {
  localStorage.removeItem('corthex_token')
  localStorage.removeItem('corthex_user')
  const currentPath = window.location.pathname
  window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
  throw new Error('인증이 만료되었습니다')
}
```

**카운트다운 타이머** — `packages/admin/src/pages/login.tsx`:
```typescript
const [countdown, setCountdown] = useState(0)
useEffect(() => {
  if (countdown <= 0) return
  const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
  return () => clearInterval(timer)
}, [countdown])
// 429 발생 시: setCountdown(err.retryAfter || 60)
```

### 주의사항

- **admin 앱과 별개**: admin은 `/admin/login`, app은 `/login`. localStorage 키도 다름 (`corthex_admin_token` vs `corthex_token`)
- **워크스페이스 선택은 3-2에서**: 이 스토리에서는 로그인만 담당. 사이드바/워크스페이스 UI는 Story 3-2
- **세션 테이블 INSERT는 스킵**: 현재 서버가 세션 테이블에 기록하지 않음. 이 스토리 범위 아님
- **기존 auth.test.ts 깨지지 않게**: 유저 로그인 API는 변경하지 않으므로 기존 테스트 영향 없음

### Project Structure Notes

```
packages/app/src/
├── pages/login.tsx          ← 수정 (에러 한국어, 카운트다운, redirect)
├── lib/api.ts               ← 수정 (errorMessages, RateLimitError, 401 redirect)
├── stores/auth-store.ts     ← 수정 (checkAuth 추가)
├── App.tsx                  ← 수정 (ProtectedRoute redirect, checkAuth)
```

### References

- [Source: packages/server/src/routes/auth.ts] — POST /auth/login, GET /auth/me 구현
- [Source: packages/server/src/middleware/auth.ts] — JWT 생성/검증, authMiddleware
- [Source: packages/admin/src/lib/api.ts] — 에러 한국어화, RateLimitError, 401 redirect 패턴
- [Source: packages/admin/src/pages/login.tsx] — 카운트다운 타이머, redirect 지원 패턴
- [Source: packages/app/src/stores/auth-store.ts] — 현재 auth store 구조
- [Source: packages/app/src/pages/login.tsx] — 현재 로그인 페이지 (기본)
- [Source: _bmad-output/implementation-artifacts/2-1-admin-login-auth.md] — Admin 로그인 스토리 참조

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- api.ts: errorMessages 한국어 매핑 6개 + RateLimitError 클래스 + 401 자동 리다이렉트 + 429 핸들링
- auth-store.ts: checkAuth() 추가 (앱 시작 시 /auth/me 호출), AuthUser에 companyId 추가, isChecking 상태
- login.tsx: 카운트다운 타이머, ?redirect 파라미터 처리, 이미 인증된 경우 자동 이동, autoComplete 속성
- App.tsx: ProtectedRoute에 redirect 파라미터 전달, useEffect에서 checkAuth() 호출
- 빌드 3/3 성공, 유닛 테스트 69/69 통과, 기존 테스트 회귀 없음

### File List
- packages/app/src/lib/api.ts — errorMessages, RateLimitError, 401/429 핸들링
- packages/app/src/stores/auth-store.ts — checkAuth, companyId, isChecking
- packages/app/src/pages/login.tsx — 카운트다운, redirect, 한국어 에러
- packages/app/src/App.tsx — ProtectedRoute redirect, checkAuth 호출
