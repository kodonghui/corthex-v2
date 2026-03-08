# Story 9.6: Admin ↔ CEO 앱 전환

Status: done

## Story

As a company_admin or super_admin,
I want to seamlessly switch between Admin console and CEO app without re-login,
so that I can manage company settings in Admin and use the CEO app for day-to-day operations without authentication friction.

## Acceptance Criteria

1. **AC1: Admin 사이드바에 CEO 앱 전환 버튼**
   - Admin 사이드바 하단(사용자 정보 영역 근처)에 "CEO 앱으로 전환" 버튼 표시
   - 클릭 시 CEO 앱(`/`)으로 이동
   - super_admin은 현재 selectedCompanyId 기반으로 전환 (회사 미선택 시 버튼 비활성)
   - company_admin은 자기 회사로 자동 전환

2. **AC2: CEO 앱 사이드바에 Admin 전환 버튼**
   - CEO 앱 사이드바 하단에 "관리자 콘솔" 버튼 표시
   - admin_users 테이블에 존재하는 사용자만 버튼 표시 (일반 employee는 안 보임)
   - 클릭 시 Admin 콘솔(`/admin`)로 이동

3. **AC3: JWT 세션 공유 — 재로그인 없는 전환**
   - 전환 시 서버에 `POST /api/auth/switch-app` 호출
   - 현재 JWT 토큰을 검증 후, 대상 앱에 맞는 새 JWT 토큰 발급
   - Admin → CEO: admin JWT → user JWT (companyId 포함, role=ceo)
   - CEO → Admin: user JWT → admin JWT (type='admin', companyId='system')
   - 새 토큰을 대상 앱의 localStorage 키에 저장 후 이동
   - 권한 없는 사용자가 switch 시도 → 403

4. **AC4: 권한 검증**
   - admin_users만 양방향 전환 가능
   - 일반 users(employee)는 CEO → Admin 전환 불가 (버튼 자체가 안 보임)
   - super_admin이 CEO로 전환 시 selectedCompanyId의 회사 컨텍스트로 전환
   - company_admin이 CEO로 전환 시 자기 companyId로 전환

5. **AC5: 전환 시 현재 앱 표시**
   - Admin에서는 "Admin Console" 로고 옆에 시각적 표시 (이미 있음)
   - CEO에서는 "CORTHEX" 로고 옆에 시각적 표시 (이미 있음)
   - 전환 버튼에 아이콘(ArrowRightLeft 또는 유사) 사용

6. **AC6: 에러 처리**
   - 토큰 만료 시 전환 실패 → 로그인 페이지로 리다이렉트
   - 네트워크 에러 시 toast 알림
   - company_admin의 회사가 비활성 상태면 전환 거부

## Tasks / Subtasks

- [x] Task 1: Switch App API 엔드포인트 (AC: #3, #4, #6)
  - [x] 1.1 `POST /api/auth/switch-app` 엔드포인트 추가 (packages/server/src/routes/auth.ts)
  - [x] 1.2 요청 body: `{ targetApp: 'admin' | 'ceo', companyId?: string }`
  - [x] 1.3 현재 JWT 검증 → admin_users 테이블 조회 → 권한 확인
  - [x] 1.4 Admin→CEO: users 테이블에서 해당 회사의 ceo 역할 유저 조회 (없으면 에러)
  - [x] 1.5 CEO→Admin: admin_users 테이블에서 해당 유저 조회 → admin JWT 발급
  - [x] 1.6 에러 케이스: 권한 없음(403), 회사 비활성(403), 토큰 만료(401)

- [x] Task 2: Admin 사이드바 전환 버튼 (AC: #1, #5)
  - [x] 2.1 sidebar.tsx 하단에 "CEO 앱으로 전환" 버튼 추가
  - [x] 2.2 super_admin: selectedCompanyId가 있을 때만 활성화
  - [x] 2.3 클릭 핸들러: switch-app API 호출 → CEO 앱 localStorage에 토큰 저장 → `window.location.href = '/'`
  - [x] 2.4 ⇄ 아이콘 + 적절한 스타일링

- [x] Task 3: CEO 사이드바 전환 버튼 (AC: #2, #5)
  - [x] 3.1 sidebar.tsx 하단에 "관리자 콘솔" 버튼 추가
  - [x] 3.2 GET /api/auth/can-switch-admin API로 admin_users 존재 확인 → 미존재시 버튼 숨김
  - [x] 3.3 클릭 핸들러: switch-app API 호출 → Admin 앱 localStorage에 토큰 저장 → `window.location.href = '/admin'`

- [x] Task 4: 공유 유틸리티 (AC: #3)
  - [x] 4.1 앱 전환 로직 공유 타입 (packages/shared/src/types.ts에 SwitchAppTarget, SwitchAppRequest, SwitchAppResponse 추가)
  - [x] 4.2 localStorage 키 정리 (admin: corthex_admin_token/user, app: corthex_token/user)

- [x] Task 5: 테스트 (AC: 전체)
  - [x] 5.1 switch-app API 유닛 테스트 (권한 검증, 토큰 발급, 에러 케이스) — 52 tests
  - [x] 5.2 admin_users만 전환 가능 테스트
  - [x] 5.3 company 비활성 시 전환 거부 테스트

## Dev Notes

### 핵심 아키텍처 이해

**두 앱의 인증 분리 구조:**
- Admin 앱: `POST /api/auth/admin/login` → JWT에 `type: 'admin'`, `companyId: 'system'` (super_admin) 또는 실제 companyId (company_admin)
- CEO 앱: `POST /api/auth/login` → JWT에 `companyId: [actual]`, `role: 'ceo'|'employee'`
- localStorage 키가 다름: Admin(`corthex_admin_token`/`corthex_admin_user`) vs CEO(`corthex_token`/`corthex_user`)

**전환 핵심 로직:**
1. 현재 앱의 JWT로 `/api/auth/switch-app` 호출
2. 서버가 admin_users 테이블에서 사용자 확인 → 대상 앱용 JWT 생성
3. 클라이언트가 대상 앱의 localStorage 키에 새 토큰+유저 정보 저장
4. `window.location.href`로 대상 앱 URL로 이동

### 중요: admin_users ↔ users 매핑

- admin_users에는 companyId 필드가 있음 (Story 9-1에서 추가됨)
- super_admin의 companyId는 null
- company_admin의 companyId는 해당 회사 ID
- Admin→CEO 전환 시, 해당 회사의 users 테이블에서 같은 이메일의 ceo 유저를 찾아야 함
- 없으면 에러 반환 (자동 생성은 온보딩 위저드 E9-S7 범위)

### 참조 파일

| 파일 | 용도 |
|------|------|
| `packages/server/src/routes/auth.ts` | 로그인/회원가입 + JWT 발급 로직. switch-app 추가 위치 |
| `packages/server/src/middleware/auth.ts` | authMiddleware, createToken 함수 |
| `packages/admin/src/components/sidebar.tsx` | Admin 사이드바 — 전환 버튼 추가 위치 |
| `packages/app/src/components/sidebar.tsx` | CEO 사이드바 — 전환 버튼 추가 위치 |
| `packages/admin/src/stores/auth-store.ts` | Admin localStorage: `corthex_admin_token`, `corthex_admin_user` |
| `packages/app/src/stores/auth-store.ts` | CEO localStorage: `corthex_token`, `corthex_user` |
| `packages/admin/src/stores/admin-store.ts` | Admin selectedCompanyId 상태 |
| `packages/server/src/db/schema.ts` | admin_users, users, companies 테이블 |
| `packages/shared/src/types.ts` | RBAC 역할, TenantContext, API 응답 타입 |

### JWT 토큰 구조 (auth.ts 참조)

```typescript
// Admin JWT (admin/login)
{ sub: adminUser.id, companyId: adminUser.companyId ?? 'system', role: mappedRole, type: 'admin' }

// User JWT (login)
{ sub: user.id, companyId: user.companyId, role: user.role }
```

### localStorage 키 정리

```
Admin 앱:
- corthex_admin_token → JWT 문자열
- corthex_admin_user → { id, name, role }
- corthex-admin-company → selectedCompanyId (Zustand persist)

CEO 앱:
- corthex_token → JWT 문자열
- corthex_user → { id, name, role, companyId }
```

### API 응답 패턴 (필수 준수)

```typescript
// 성공
{ success: true, data: { token, user, targetUrl } }

// 실패
{ success: false, error: { code: 'FORBIDDEN', message: '...' } }
```

### 사이드바 스타일링 패턴

Admin 사이드바 하단 영역 (sidebar.tsx):
- 사용자 이름 + 역할 표시
- 빌드 번호 표시
- 여기에 전환 버튼 추가 (작은 버튼, 아이콘 + 텍스트)

CEO 사이드바 하단 영역 (sidebar.tsx):
- 사용자 이름 + 역할 표시
- 여기에 "관리자 콘솔" 버튼 추가 (admin_users만 표시)

### 기존 코드 패턴 준수

- Hono 라우트: `authRoute.post('/switch-app', authMiddleware, async (c) => {...})`
- Zod 검증: `z.object({ targetApp: z.enum(['admin', 'ceo']), companyId: z.string().uuid().optional() })`
- 에러 응답: 기존 auth.ts의 에러 패턴 동일하게 사용
- 프론트엔드: fetch API 직접 사용 (기존 패턴) 또는 TanStack Query mutation

### 보안 고려사항

- switch-app은 반드시 authMiddleware 통과 필요
- admin_users 테이블 존재 여부로 권한 확인 (JWT claim만으로 판단 X)
- 발급된 새 JWT는 기존 JWT와 동일한 만료 시간 (15분)
- company 비활성 체크: companies.isActive === true 확인

### Project Structure Notes

- 새 파일 생성 불필요 — 기존 auth.ts에 엔드포인트 추가, 기존 sidebar.tsx에 버튼 추가
- 타입 추가: packages/shared/src/types.ts에 SwitchAppRequest/Response 타입
- 테스트: packages/server/src/__tests__/unit/app-switching.test.ts (신규)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E9-S6] Admin ↔ CEO 앱 전환 (2 SP)
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision9] Tenant Isolation
- [Source: packages/server/src/routes/auth.ts] JWT 발급 + 로그인 로직
- [Source: packages/admin/src/components/sidebar.tsx] Admin 사이드바 구조
- [Source: packages/app/src/components/sidebar.tsx] CEO 사이드바 구조
- [Source: packages/admin/src/stores/auth-store.ts] Admin auth localStorage 키
- [Source: packages/app/src/stores/auth-store.ts] CEO auth localStorage 키

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- Task 1: Added `POST /api/auth/switch-app` and `GET /api/auth/can-switch-admin` endpoints to auth.ts. Switch validates admin_users table, checks company active status, creates appropriate JWT tokens for target app.
- Task 2: Added SwitchToCeoButton component to Admin sidebar. Disabled when no company selected. Calls switch-app API, stores CEO token in correct localStorage keys, navigates to CEO app.
- Task 3: Added SwitchToAdminButton component to CEO sidebar. Uses can-switch-admin query to conditionally render (hidden for non-admin users). Calls switch-app API, stores admin token in correct localStorage keys.
- Task 4: Added SwitchAppTarget, SwitchAppRequest, SwitchAppResponse types to shared/types.ts.
- Task 5: 52 tests covering API structure, error codes, sidebar buttons, shared types, localStorage isolation, JWT structure, role mapping, visual indicators, and error handling.

### File List

- packages/server/src/routes/auth.ts (modified — added switch-app and can-switch-admin endpoints)
- packages/admin/src/components/sidebar.tsx (modified — added SwitchToCeoButton component)
- packages/app/src/components/sidebar.tsx (modified — added SwitchToAdminButton component)
- packages/shared/src/types.ts (modified — added SwitchAppTarget, SwitchAppRequest, SwitchAppResponse)
- packages/server/src/__tests__/unit/app-switching.test.ts (new — 52 tests)
