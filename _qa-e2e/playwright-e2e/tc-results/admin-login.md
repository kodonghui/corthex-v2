# /admin/login — TC Results

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-LOGIN-001 | PASS | Filled admin/admin1234, clicked 세션 시작. POST `/api/auth/admin/login` returned 200. Token saved (localStorage `corthex_admin_token`). Redirected to `/admin` dashboard. 0 console errors. |
| TC-LOGIN-002 | PASS | Cleared username, filled password. Clicked 세션 시작. HTML5 `required` attribute blocked submission with native validation ("Please fill out this field."). No POST request sent. Stayed on login page. |
| TC-LOGIN-003 | PASS | Filled username "admin", cleared password. Clicked 세션 시작. HTML5 `required` attribute blocked submission. No POST request sent. Stayed on login page. |
| TC-LOGIN-004 | FAIL | Filled admin/wrongpass, clicked 세션 시작. POST `/api/auth/admin/login` returned 401 correctly. **BUG: No error message displayed.** Page silently redirects to `/admin/login?redirect=%2Flogin` via `window.location.href` in `api.ts:57-61`. The 401 interceptor fires before the login form's catch block can call `setError()`. Expected: "아이디 또는 비밀번호가 올바르지 않습니다" (defined in `api.ts:16` as `AUTH_001`). |
| TC-LOGIN-005 | PASS | Sent 6 rapid failed login attempts. Attempts 1-5 returned 401. Attempt 6 returned **429** (rate limited). UI displayed: "잠시 후 다시 시도하세요 (53초 후 잠금 해제)". Button changed to "53초 후 재시도" and was **disabled**. Countdown timer actively decrementing. |
| TC-LOGIN-006 | PASS | Waited ~26 seconds (remainder of 60s lockout from TC-005). Button text changed back to "세션 시작", `disabled` attribute removed. Form fully interactive again. |
| TC-LOGIN-007 | FAIL | Navigated to `/admin/login?redirect=/admin/agents`, logged in with admin/admin1234. POST returned 200. **BUG: Redirected to `/admin/admin/agents` (doubled prefix) → 404 page.** Root cause: `login.tsx:35` reads `redirect=/admin/agents` from query param, then `navigate('/admin/agents')` resolves relative to the admin app's base path `/admin`, producing `/admin/admin/agents`. |

## Summary
- Total: 7
- PASS: 5
- FAIL: 2
- SKIP: 0

## Bugs Found

### BUG-1: No error message on wrong password (TC-LOGIN-004)
- **Severity**: HIGH
- **File**: `packages/admin/src/lib/api.ts` lines 57-62
- **Description**: The global 401 interceptor in `api.ts` does `window.location.href = '/admin/login?redirect=...'` on ANY 401 response, including login failures. This full-page redirect fires before the login form's `catch` block can call `setError()`, so no error message is ever shown to the user.
- **Expected**: Display "아이디 또는 비밀번호가 올바르지 않습니다" error message (already defined as `AUTH_001` in `errorMessages` map).
- **Fix suggestion**: In `api.ts`, skip the 401 redirect when the request path is `/auth/admin/login`. Let the error propagate to the caller so `login.tsx` can show `setError()`. Example:
  ```typescript
  if (res.status === 401 && !path.includes('/auth/admin/login')) {
    // existing redirect logic
  }
  ```
- **Screenshot**: `screenshots/tc-login-004-no-error-msg.png`

### BUG-2: Redirect URL doubled prefix → 404 (TC-LOGIN-007)
- **Severity**: MEDIUM
- **File**: `packages/admin/src/pages/login.tsx` line 35-36
- **Description**: When `?redirect=/admin/agents` is in the URL, `navigate('/admin/agents')` resolves relative to the React Router base `/admin`, producing the path `/admin/admin/agents`, which is a 404.
- **Expected**: Redirect to `/admin/agents` after login.
- **Fix suggestion**: Strip the `/admin` prefix from the redirect param before navigating, since React Router already handles the base path:
  ```typescript
  const redirect = searchParams.get('redirect')?.replace(/^\/admin/, '') || '/'
  navigate(redirect)
  ```
- **Screenshot**: `screenshots/tc-login-007-double-prefix-404.png`

### Note: BUG-1 causes BUG-2 indirectly
The 401 redirect in `api.ts:60` calculates `currentPath` as `window.location.pathname.replace(/^\/admin/, '')`, which for the login page `/admin/login` produces `/login`. The redirect becomes `?redirect=%2Flogin`. When the user logs in again, `navigate('/login')` goes to `/admin/login` — an infinite redirect loop. However, this scenario only triggers from failed login → redirect → re-login, so it doesn't affect normal auth-expired flows.
