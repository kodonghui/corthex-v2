# Story 9.5: Company Settings UI (Admin A8)

Status: done

## Story

As a Company Admin,
I want to view and edit company information and manage API keys for external services on a settings page,
so that I can configure company defaults and securely store credentials for tool-specific integrations.

## Acceptance Criteria

1. **AC1: 회사 설정 페이지 라우팅**
   - `/admin/settings` 경로에 회사 설정 페이지 접근 가능
   - 사이드바 하단에 "회사 설정" 메뉴 추가 (UX 명세 준수)
   - 현재 선택된 회사(selectedCompanyId)의 설정만 표시 (테넌트 격리)

2. **AC2: 회사 기본 정보 섹션**
   - 회사명, slug, 생성일, 활성 상태 표시
   - 회사명 편집 가능 (인라인 편집 또는 폼)
   - 저장 시 PATCH `/api/admin/companies/:id` 호출
   - 성공/실패 토스트 표시

3. **AC3: API 키 관리 섹션**
   - 현재 등록된 API 키 목록 표시 (provider, label, scope, 생성일)
   - 키 값은 마스킹 표시 (보안)
   - 새 API 키 추가: provider 선택 → 필수 필드 입력 → 저장
   - API 키 삭제: 확인 다이얼로그 후 삭제
   - API 키 갱신(rotate): 새 값 입력 → PUT으로 업데이트
   - provider 목록은 `/api/admin/api-keys/providers`에서 동적 로드
   - 기존 credential vault (AES-256-GCM) 사용

4. **AC4: 기본 설정 섹션**
   - companies.settings JSONB에 저장되는 기본 설정 표시/편집
   - 예: dashboardQuickActions, defaultModel, timezone 등
   - 저장 시 PATCH `/api/admin/companies/:id` 호출 (settings 필드 업데이트)

5. **AC5: Save/Cancel UX**
   - 변경사항 있을 때만 저장/취소 버튼 활성화
   - 저장 시 optimistic UI (즉시 반영 → 실패 시 롤백)
   - 저장 성공 시 "설정이 저장되었습니다" 토스트
   - 취소 시 원래 값으로 복원

6. **AC6: 테넌트 격리**
   - 현재 선택된 회사의 설정만 표시
   - 회사 전환 시 설정 페이지 자동 갱신
   - 다른 회사 데이터 접근 불가

## Tasks / Subtasks

- [x] Task 1: 회사 설정 API 엔드포인트 추가 (AC: #2, #4)
  - [x] 1.1 `packages/server/src/routes/admin/companies.ts`에 PATCH settings 엔드포인트 추가
  - [x] 1.2 settings JSONB 업데이트 Zod 스키마 정의
  - [x] 1.3 기존 PATCH `/api/admin/companies/:id`에 settings 필드 지원 추가

- [x] Task 2: 회사 설정 페이지 생성 (AC: #1, #2, #4, #5)
  - [x] 2.1 `packages/admin/src/pages/settings.tsx` 생성
  - [x] 2.2 회사 기본 정보 섹션 (이름, slug, 생성일, 상태)
  - [x] 2.3 기본 설정 섹션 (settings JSONB 편집)
  - [x] 2.4 Save/Cancel 로직 (dirty state tracking + optimistic update)

- [x] Task 3: API 키 관리 UI (AC: #3)
  - [x] 3.1 API 키 목록 테이블 (마스킹된 값, provider, scope)
  - [x] 3.2 API 키 추가 폼 (provider 선택 → 동적 필드)
  - [x] 3.3 API 키 삭제 (ConfirmDialog)
  - [x] 3.4 API 키 갱신/Rotate 기능

- [x] Task 4: 라우팅 및 네비게이션 통합 (AC: #1)
  - [x] 4.1 `App.tsx`에 `/settings` 라우트 추가
  - [x] 4.2 `sidebar.tsx`에 하단 "회사 설정" 메뉴 추가 (UX 명세: 하단 배치)

- [x] Task 5: 테넌트 격리 및 회사 전환 (AC: #6)
  - [x] 5.1 selectedCompanyId 변경 시 데이터 refetch
  - [x] 5.2 회사 미선택 시 빈 상태 표시

## Dev Notes

### 기존 코드 분석

**서버 측 (이미 존재하는 API):**
- `packages/server/src/routes/admin/companies.ts` — 회사 CRUD 이미 존재
  - GET `/api/admin/companies/:id` — 회사 상세 조회 ✅
  - PATCH `/api/admin/companies/:id` — 회사 수정 (name, isActive만) → **settings 필드 추가 필요**
- `packages/server/src/routes/admin/credentials.ts` — API 키 CRUD 이미 존재
  - GET `/api/admin/api-keys` — 키 목록 ✅
  - GET `/api/admin/api-keys/providers` — provider 스키마 ✅
  - POST `/api/admin/api-keys` — 키 추가 ✅
  - PUT `/api/admin/api-keys/:id` — 키 갱신 ✅
  - DELETE `/api/admin/api-keys/:id` — 키 삭제 ✅

**프론트엔드 (참조할 패턴):**
- `packages/admin/src/pages/costs.tsx` — 복잡한 admin 페이지 패턴 (Tabs, Query, Mutation)
- `packages/admin/src/pages/credentials.tsx` — API 키 관리 UI (참조하되 별도 settings 페이지에 통합)
- `packages/admin/src/pages/companies.tsx` — 회사 정보 조회/수정 패턴

**핵심: 서버 변경 최소화**
- API 키 CRUD는 이미 `/api/admin/api-keys`와 `/api/admin/credentials.ts`에 완전히 구현됨
- 회사 정보 조회/수정도 `/api/admin/companies`에 구현됨
- **유일한 서버 변경: PATCH companies에 settings JSONB 업데이트 지원 추가**
- 나머지는 **프론트엔드 전용** 작업

### Architecture Compliance

- **API 응답 패턴:** `{ data }` / `{ error: { code, message } }` 필수
- **파일명:** kebab-case 소문자 (settings.tsx)
- **컴포넌트명:** PascalCase (SettingsPage)
- **상태 관리:** Zustand (useAdminStore) + TanStack Query
- **API 클라이언트:** `packages/admin/src/lib/api.ts` (api.get/post/put/patch/delete)
- **테넌트 격리:** selectedCompanyId 기반 쿼리 필터링
- **UI 컴포넌트:** `@corthex/ui` (Card, Button, Input, Skeleton, Tabs, Toggle 등)
- **토스트:** `useToastStore` (addToast({ type, message }))
- **확인 다이얼로그:** `ConfirmDialog` from `@corthex/ui`

### 핵심 참조 파일

| 파일 | 용도 |
|------|------|
| `packages/server/src/routes/admin/companies.ts` | 회사 CRUD API (settings 추가 필요) |
| `packages/server/src/routes/admin/credentials.ts` | API 키 CRUD API (이미 완전 구현) |
| `packages/server/src/services/credential-vault.ts` | AES-256-GCM 암호화 + provider 스키마 |
| `packages/server/src/db/schema.ts` | companies.settings JSONB 칼럼 |
| `packages/admin/src/pages/costs.tsx` | 복잡한 admin 페이지 UI 패턴 |
| `packages/admin/src/pages/credentials.tsx` | API 키 관리 UI 패턴 |
| `packages/admin/src/pages/companies.tsx` | 회사 CRUD UI 패턴 |
| `packages/admin/src/components/sidebar.tsx` | 사이드바 네비게이션 패턴 |
| `packages/admin/src/App.tsx` | 라우터 설정 패턴 |
| `packages/admin/src/stores/admin-store.ts` | selectedCompanyId 상태 |
| `packages/admin/src/stores/toast-store.ts` | 토스트 알림 |
| `packages/admin/src/lib/api.ts` | API 클라이언트 (get/post/put/patch/delete) |

### DB 스키마 참고

```typescript
// companies 테이블
companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  smtpConfig: jsonb('smtp_config'),
  settings: jsonb('settings').$type<Record<string, unknown>>(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// apiKeys 테이블 (credential vault)
apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull(),
  userId: uuid('user_id'),
  provider: varchar('provider', { length: 50 }).notNull(),
  label: varchar('label', { length: 100 }),
  encryptedCredentials: jsonb('encrypted_credentials').notNull(),
  scope: varchar('scope', { length: 20 }).notNull().default('company'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

### PATCH companies 수정 사항

현재 updateCompanySchema:
```typescript
const updateCompanySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
})
```

변경 후 (settings 추가):
```typescript
const updateCompanySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  settings: z.record(z.unknown()).optional(),
})
```

### Credential Vault Provider 목록

```typescript
PROVIDER_SCHEMAS = {
  anthropic: ['api_key'],
  openai: ['api_key'],
  google_ai: ['api_key'],
  kis: ['app_key', 'app_secret', 'account_no'],
  smtp: ['host', 'port', 'user', 'password', 'from'],
  email: ['host', 'port', 'user', 'password', 'from'],
  telegram: ['bot_token', 'chat_id'],
  instagram: ['access_token', 'page_id'],
  serper: ['api_key'],
  notion: ['api_key'],
  google_calendar: ['api_key'],
  tts: ['api_key'],
}
```

### UX 가이드라인 (A8 회사 설정)

- **위치:** 사이드바 하단 (nav 리스트 아래, 로그아웃 위)
- **레이아웃:** 설정 폼 + 크리덴셜 볼트 입력
- **섹션 구분:**
  1. 회사 기본 정보 (이름, slug, 상태, 생성일)
  2. API 키 관리 (provider별 키 목록 + 추가/삭제/갱신)
  3. 기본 설정 (settings JSONB 편집)
- **데이터 갱신:** 정적 (폴링 없음, 사용자 액션 시만 갱신)

### 이전 스토리 학습 (Story 9-1)

- Super Admin 전용 라우트는 `routes/super-admin/`에 분리됨
- Company Admin 라우트는 `routes/admin/`에 유지
- 이 스토리는 Company Admin용 → `routes/admin/` 사용
- PATCH companies에 slug 변경은 중복 체크 필요 (기존 코드 참조)
- adminOnly 미들웨어로 접근 제어

### Project Structure Notes

- 새 파일: `packages/admin/src/pages/settings.tsx`
- 수정 파일: `packages/admin/src/App.tsx` (라우트 추가)
- 수정 파일: `packages/admin/src/components/sidebar.tsx` (메뉴 추가)
- 수정 파일: `packages/server/src/routes/admin/companies.ts` (settings 업데이트 지원)

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#A8] 회사 설정 화면
- [Source: _bmad-output/planning-artifacts/epics.md#E9-S5] 회사 설정 UI (2 SP)
- [Source: packages/server/src/routes/admin/credentials.ts] API 키 CRUD (이미 구현)
- [Source: packages/server/src/services/credential-vault.ts] AES-256-GCM 암호화
- [Source: packages/server/src/routes/admin/companies.ts] 회사 CRUD (settings 추가 필요)
- [Source: packages/admin/src/pages/costs.tsx] 복잡한 admin 페이지 패턴
- [Source: packages/admin/src/components/sidebar.tsx] 사이드바 네비게이션

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Added `settings: z.record(z.unknown()).optional()` to updateCompanySchema in admin companies route. Existing PATCH endpoint already spreads body into update, so settings is now accepted.
- Task 2: Created `settings.tsx` with 3 sections: CompanyInfoSection (name editing, slug/status/date display), DefaultSettingsSection (timezone, default LLM model), and main SettingsPage orchestrator.
- Task 3: ApiKeySection with full CRUD — add (dynamic provider field rendering from /providers endpoint), delete (ConfirmDialog), rotate (inline form). All using existing credential vault APIs. Company-scope keys.
- Task 4: Added `/settings` lazy route in App.tsx. Added settings NavLink in sidebar bottom section (between nav and user info) per UX A8 spec.
- Task 5: All queries keyed by selectedCompanyId. Empty state for no company. Query invalidation on save ensures fresh data on company switch.
- 63 tests passing, 0 regressions on related test files (154 tests across 3 files).

### File List

- packages/admin/src/pages/settings.tsx (new)
- packages/admin/src/App.tsx (modified — added settings route)
- packages/admin/src/components/sidebar.tsx (modified — added settings NavLink at bottom)
- packages/server/src/routes/admin/companies.ts (modified — added settings to updateCompanySchema)
- packages/server/src/__tests__/unit/company-settings-ui.test.ts (new — 63 tests)
- packages/server/src/__tests__/unit/company-settings-ui-tea.test.ts (new — 59 TEA tests)
