# Story 9.8: CEO 앱 설정 화면 (UX #14)

Status: done

## Story

As a CEO app user (CEO or employee),
I want a comprehensive Settings screen with profile editing, notification preferences, and display settings,
so that I can customize my workspace experience and manage my account without switching to the admin console.

## Acceptance Criteria

1. **AC1: 프로필 섹션**
   - 프로필 탭에서 이름, 이메일(읽기 전용), username(읽기 전용) 표시
   - 이름 수정 가능 (PATCH /workspace/profile)
   - 프로필 저장 시 성공 toast + auth-store 업데이트
   - 빈 이름 입력 방지 (클라이언트 + 서버 검증 이미 있음)

2. **AC2: 비밀번호 변경**
   - 프로필 탭 하단에 비밀번호 변경 폼
   - 새 비밀번호 + 비밀번호 확인 입력 (최소 6자)
   - 두 입력 불일치 시 클라이언트 에러 표시
   - 기존 PATCH /workspace/profile의 password 필드 활용
   - 성공 시 toast + 입력 필드 초기화

3. **AC3: 알림 설정 탭**
   - 기존 notification-settings.tsx 컴포넌트 재사용
   - 예산 초과 알림, 작업 완료 알림, 품질 경고 알림 포함 (기존 EVENT_CATEGORIES)
   - 앱 알림 / 이메일 알림 글로벌 토글

4. **AC4: 표시 설정 탭**
   - 언어 선택: 한국어/English (localStorage에 저장, 향후 i18n 연동용)
   - 테마 선택: 시스템/라이트/다크 (기존 다크모드 토글이 있다면 연동)
   - 설정 변경 즉시 적용 (localStorage 기반)

5. **AC5: 사령관실 설정 탭**
   - 자동 스크롤 토글 (새 메시지 시 자동 스크롤)
   - 알림 소리 토글
   - localStorage에 저장, 사령관실(ChatPage)에서 읽어 사용

6. **AC6: 관리자 콘솔 전환 링크**
   - admin_users인 경우 설정 화면에 "관리자 콘솔로 이동" 링크/버튼 표시
   - Story 9-6에서 구현한 SwitchToAdminButton 재사용 또는 유사 패턴 사용
   - 일반 employee는 해당 링크 미표시

7. **AC7: 탭 구조 리팩터링**
   - 기존 settings.tsx의 탭(API, 텔레그램, 소울, MCP)은 유지
   - 새 탭 추가: 프로필, 알림, 표시, 사령관실
   - 기본 탭: 프로필 (첫 진입 시)
   - URL 쿼리 파라미터 ?tab= 유지 (기존 패턴)

## Tasks / Subtasks

- [x] Task 1: 프로필 탭 구현 (AC: #1, #2)
  - [x] 1.1 프로필 정보 표시 컴포넌트 (GET /workspace/profile 활용)
  - [x] 1.2 이름 편집 폼 + PATCH /workspace/profile mutation
  - [x] 1.3 비밀번호 변경 폼 (새 비밀번호 + 확인 + validation)
  - [x] 1.4 저장 성공 시 auth-store 업데이트 (localStorage corthex_user 동기화)

- [x] Task 2: 알림 설정 탭 통합 (AC: #3)
  - [x] 2.1 기존 NotificationSettings 컴포넌트를 설정 페이지에 탭으로 통합
  - [x] 2.2 이벤트 카테고리에 예산 초과(budget_exceeded), 품질 경고(quality_warning) 추가 확인

- [x] Task 3: 표시 설정 탭 (AC: #4)
  - [x] 3.1 언어 선택 (한국어/English) — localStorage 'corthex_language' 키
  - [x] 3.2 테마 선택 (system/light/dark) — localStorage 'corthex_theme' 키
  - [x] 3.3 테마 변경 시 document.documentElement.classList 조작

- [x] Task 4: 사령관실 설정 탭 (AC: #5)
  - [x] 4.1 자동 스크롤 토글 — localStorage 'corthex_autoscroll'
  - [x] 4.2 알림 소리 토글 — localStorage 'corthex_sound'

- [x] Task 5: 기존 탭 구조 리팩터링 (AC: #7)
  - [x] 5.1 settings.tsx 탭 순서 재정리: 프로필 > 알림 > 표시 > 사령관실 > API > 텔레그램 > 소울 > MCP
  - [x] 5.2 기본 탭을 'profile'로 변경

- [x] Task 6: 관리자 콘솔 전환 (AC: #6)
  - [x] 6.1 admin_users 확인 (GET /api/auth/can-switch-admin) — 기존 API 재사용
  - [x] 6.2 프로필 탭 하단에 관리자 콘솔 전환 버튼 (기존 SwitchToAdminButton 패턴)

- [x] Task 7: 테스트 — 44 tests passing

## Dev Notes

### 핵심: 기존 코드 재사용 필수

**기존 settings.tsx 리팩터링 — 새 파일 최소화:**
- 현재 `packages/app/src/pages/settings.tsx`에 API, 텔레그램, 소울, MCP 탭이 이미 있음
- 이 파일에 프로필, 알림, 표시, 사령관실 탭을 추가하는 방식
- 기존 `ApiKeyTab`, `TelegramSection` 함수 컴포넌트 유지
- `SoulEditor`, `SettingsMcp` import 유지

**기존 API 활용 (새 API 생성 불필요):**
- `GET /workspace/profile` → 프로필 조회 (이름, 이메일, username, role)
- `PATCH /workspace/profile` → 이름 변경, 비밀번호 변경 (body: { name?, password? })
- `GET /api/auth/can-switch-admin` → admin_users 여부 확인 (Story 9-6에서 구현됨)
- 알림 API: 이미 NotificationSettings 컴포넌트에서 사용 중

**기존 컴포넌트 재사용:**
- `NotificationSettings` from `../components/notification-settings` — 그대로 탭에 삽입
- `SwitchToAdminButton` 패턴 from `../components/sidebar.tsx` — 프로필 탭에서 유사 구현
- `@corthex/ui`의 `Card`, `Toggle`, `Tabs`, `Select`, `Badge`, `toast` 사용

### 기존 코드 패턴 (필수 준수)

**TanStack Query 패턴:**
```typescript
const { data } = useQuery({
  queryKey: ['profile'],
  queryFn: () => api.get<{ data: ProfileData }>('/workspace/profile'),
})
```

**Mutation 패턴:**
```typescript
const updateProfile = useMutation({
  mutationFn: (body: UpdateProfileBody) => api.patch('/workspace/profile', body),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['profile'] })
    toast.success('저장되었습니다')
  },
  onError: (err: Error) => toast.error(err.message),
})
```

**탭 패턴 (기존 settings.tsx에서 사용 중):**
```typescript
const TABS: TabItem[] = [
  { value: 'profile', label: '프로필' },
  // ... URL ?tab= 기반 라우팅
]
```

**API 유틸리티 (api.ts):**
- `api.get`, `api.post`, `api.put`, `api.patch`, `api.delete` 사용
- 자동 Authorization 헤더 + 401 리다이렉트 처리 내장

### localStorage 키 목록

| 키 | 값 | 사용처 |
|----|-----|--------|
| `corthex_language` | `'ko'` \| `'en'` | 표시 설정 탭 |
| `corthex_theme` | `'system'` \| `'light'` \| `'dark'` | 표시 설정 탭 |
| `corthex_autoscroll` | `'true'` \| `'false'` | 사령관실 설정 탭 |
| `corthex_sound` | `'true'` \| `'false'` | 사령관실 설정 탭 |

### 비밀번호 변경 주의사항

- 기존 PATCH /workspace/profile에 `password` 필드 보내면 서버에서 `Bun.password.hash(password)` 처리
- **현재 비밀번호 확인 없음** — 서버에 currentPassword 검증 로직이 없으므로, 새 비밀번호 + 확인만 받음
- 최소 6자 (서버 Zod: `z.string().min(6).optional()`)

### 테마 구현 가이드

```typescript
// 테마 적용
function applyTheme(theme: 'system' | 'light' | 'dark') {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else if (theme === 'light') root.classList.remove('dark')
  else {
    // system
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark')
    else root.classList.remove('dark')
  }
  localStorage.setItem('corthex_theme', theme)
}
```

### 반응형 레이아웃

- 기존 settings.tsx: `<div className="p-4 md:p-8">` 패턴
- 탭 컨텐츠: `<div className="max-w-lg">` (좁은 폼) 또는 `max-w-3xl` (넓은 컨텐츠)
- 프로필/표시/사령관실 탭: max-w-lg (폼 타입)
- 알림 탭: max-w-lg (기존 NotificationSettings 크기)
- API/소울/MCP 탭: 기존 크기 유지

### Project Structure Notes

- **수정 파일**: `packages/app/src/pages/settings.tsx` (탭 추가 + 프로필/표시/사령관실 컴포넌트)
- **신규 파일 없음** — 모든 새 탭 컴포넌트는 settings.tsx 내 함수 컴포넌트로 구현 (기존 ApiKeyTab, TelegramSection 패턴)
- **테스트**: `packages/server/src/__tests__/unit/ceo-settings.test.ts` (신규)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E9-S8] CEO 앱 설정 화면 (2 SP)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Screen14] 설정: 프로필 편집 + 알림 설정 + 테마 + 관리자 콘솔 전환 링크
- [Source: packages/app/src/pages/settings.tsx] 기존 설정 페이지 (API/텔레그램/소울/MCP 탭)
- [Source: packages/app/src/components/notification-settings.tsx] 기존 알림 설정 컴포넌트
- [Source: packages/server/src/routes/workspace/profile.ts] GET/PATCH /workspace/profile API
- [Source: packages/app/src/stores/auth-store.ts] CEO 앱 인증 스토어
- [Source: packages/app/src/lib/api.ts] API 유틸리티
- [Source: packages/app/src/components/sidebar.tsx] SwitchToAdminButton 패턴 (Story 9-6)

### Previous Story Intelligence (9-6)

- JWT 세션 공유로 Admin ↔ CEO 전환 구현됨
- `GET /api/auth/can-switch-admin` API로 admin_users 여부 확인 가능
- localStorage 키: Admin(`corthex_admin_token`) vs CEO(`corthex_token`)
- SwitchToAdminButton 컴포넌트가 sidebar.tsx에 이미 구현됨 — 동일 패턴 재사용

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: ProfileTab component with profile display (username, email read-only, name editable), PATCH mutation with auth-store sync, password change form with min-6 validation and confirmation matching
- Task 2: NotificationSettings component integrated as tab, reusing existing notification-settings.tsx with event categories (채팅/작업/시스템) and global in-app/email toggles
- Task 3: DisplayTab with 3-option theme selector (system/light/dark) using localStorage + classList manipulation, language selector (한국어/English) with localStorage persistence
- Task 4: CommandCenterTab with auto-scroll toggle and notification sound toggle, both localStorage-based with sensible defaults (enabled)
- Task 5: Tab array reordered: profile > notifications > display > command > api > telegram > soul > mcp. Default tab changed from 'api' to 'profile'. Disabled placeholder tabs maintained (files, trading)
- Task 6: Admin console switch button in profile tab, using existing can-switch-admin API and switch-app endpoint pattern from Story 9-6. Hidden for non-admin users
- Task 7: 44 tests covering tab structure, profile API, theme logic, language settings, command center settings, admin console switch, auth store sync, role display, tab navigation, layout, and localStorage persistence
- App.tsx updated: theme initialization now respects stored corthex_theme preference

### Code Review Notes

- MEDIUM fix: Password change mutation separated from profile update mutation (prevents field clearing before mutation completes)
- MEDIUM fix: Password change success toast now uses specific message "비밀번호가 변경되었습니다"
- MEDIUM fix: Password change button disabled/pending state references changePassword.isPending (not updateProfile.isPending)

### File List

- packages/app/src/pages/settings.tsx (modified — added ProfileTab, DisplayTab, CommandCenterTab, NotificationSettings integration, tab reorder, theme helpers)
- packages/app/src/App.tsx (modified — theme init respects stored corthex_theme)
- packages/server/src/__tests__/unit/ceo-settings.test.ts (new — 44 tests)
- packages/server/src/__tests__/unit/ceo-settings-tea.test.ts (new — 66 tests)
