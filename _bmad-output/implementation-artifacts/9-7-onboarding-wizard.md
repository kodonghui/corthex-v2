# Story 9.7: 온보딩 위저드 (Onboarding Wizard)

Status: done

## Story

As a company_admin (or super_admin),
I want a 5-step onboarding wizard shown on first admin console access after company creation,
so that I can quickly set up my company (confirm info, select org template, configure API keys, invite employees) within 10 minutes without feeling overwhelmed.

## Acceptance Criteria

1. **AC1: 온보딩 표시 조건**
   - Admin 앱 로드 시 `companies.settings.onboardingCompleted !== true`이면 온보딩 위저드 자동 표시
   - company_admin: 자기 회사의 onboardingCompleted 체크
   - super_admin: selectedCompanyId 회사의 onboardingCompleted 체크 (회사 미선택 시 위저드 미표시)
   - 온보딩 완료 후 다시 표시하지 않음 (flag 기반)
   - 위저드는 전체 화면 오버레이 또는 전용 페이지로 표시

2. **AC2: Step 1 — 환영 + 회사 정보 확인**
   - "CORTHEX에 오신 것을 환영합니다!" 헤딩
   - 현재 회사명, 설명을 읽기 모드로 표시 (기존 `GET /api/admin/companies/:id` 사용)
   - "수정" 버튼 → 인라인 편집 모드 (회사명, 설명 변경 가능)
   - 수정 시 `PATCH /api/admin/companies/:id` 호출로 저장
   - "다음" 버튼으로 Step 2 이동

3. **AC3: Step 2 — 조직 템플릿 선택**
   - `GET /api/admin/org-templates` 호출하여 사용 가능한 템플릿 카드 표시
   - 최소 3개 빌트인 템플릿 카드: 투자분석 / 마케팅 / 올인원
   - "빈 조직으로 시작" 옵션 (템플릿 미적용)
   - 각 카드: 템플릿 이름, 설명, 부서 수, 에이전트 수 표시
   - 템플릿 선택 시 미리보기 (부서+에이전트 트리) 표시
   - "이 조직 사용하기" 클릭 → `POST /api/admin/org-templates/:id/apply` 호출
   - 적용 결과 요약 (생성된 부서 N개, 에이전트 N개)
   - "빈 조직" 선택 시 API 호출 없이 다음으로 이동
   - "건너뛰기" 옵션 있음

4. **AC4: Step 3 — API 키 설정 (선택사항)**
   - OpenAI, Google AI (Gemini) API 키 입력 필드
   - 각 키 입력 시 `POST /api/admin/credentials` (기존 credential vault API) 호출로 저장
   - "나중에 설정하기" 건너뛰기 옵션 (하단 링크)
   - 이미 등록된 키가 있으면 마스킹(****) 표시 + "변경" 버튼
   - credential-vault의 AES-256-GCM 암호화 자동 적용

5. **AC5: Step 4 — 첫 직원 초대 (선택사항)**
   - 이메일 + 이름 입력 필드 (1명씩)
   - "초대하기" 클릭 → `POST /api/admin/employees` 호출
   - 초대 성공 시 초기 비밀번호 표시 (복사 버튼)
   - 부서 선택 드롭다운 (Step 2에서 생성된 부서 목록 — 없으면 표시 안 함)
   - "건너뛰기" 옵션 있음
   - 추가 초대: "한 명 더 초대하기" 버튼

6. **AC6: Step 5 — 완료 요약**
   - 온보딩에서 설정한 내용 요약 (회사명, 적용 템플릿명, 등록 API 키 수, 초대 직원 수)
   - "CORTHEX 사용 시작하기" 버튼
   - 클릭 시: `PATCH /api/admin/companies/:id` → `settings.onboardingCompleted = true` 저장
   - 대시보드(`/admin/`)로 이동

7. **AC7: 진행 바 + 네비게이션**
   - 상단 또는 좌측에 5단계 Progress Bar / Step Indicator
   - 현재 단계 강조 + 완료된 단계 체크마크
   - "이전" 버튼으로 이전 단계 복귀 가능
   - Step 1은 "이전" 비활성
   - Step 2~4는 "건너뛰기" 가능

## Tasks / Subtasks

- [x] Task 1: 온보딩 위저드 라우트 및 진입점 (AC: #1, #7)
  - [x]1.1 `packages/admin/src/pages/onboarding.tsx` 신규 생성 — OnboardingWizardPage 컴포넌트
  - [x]1.2 `packages/admin/src/App.tsx`에 `/admin/onboarding` 라우트 추가
  - [x]1.3 Layout 컴포넌트에서 selectedCompanyId 기준으로 회사 settings 조회 → onboardingCompleted 체크
  - [x]1.4 미완료 시 `/admin/onboarding`으로 자동 리다이렉트 (단, 로그인/로그아웃 페이지는 제외)
  - [x]1.5 위저드 상태 관리: currentStep (1~5), stepData (각 단계 입력 데이터), 이전/다음 핸들러

- [x] Task 2: Step 1 — 환영 + 회사 정보 확인 (AC: #2)
  - [x]2.1 WelcomeStep 컴포넌트: 환영 메시지 + 회사명/설명 표시
  - [x]2.2 "수정" 토글 → 인라인 편집 (input/textarea)
  - [x]2.3 수정 시 `PATCH /api/admin/companies/:id` 호출 (기존 API 사용)
  - [x]2.4 에러 처리: toast 알림

- [x] Task 3: Step 2 — 조직 템플릿 선택 (AC: #3)
  - [x]3.1 TemplateStep 컴포넌트: 템플릿 카드 그리드 + "빈 조직" 카드
  - [x]3.2 `GET /api/admin/org-templates` 호출로 템플릿 목록 fetch
  - [x]3.3 선택 시 미리보기 (부서→에이전트 트리) 모달 또는 인라인 표시
  - [x]3.4 "이 조직 사용하기" → `POST /api/admin/org-templates/:id/apply` 호출
  - [x]3.5 적용 결과 요약 표시 (부서 N개, 에이전트 N개 생성)
  - [x]3.6 "빈 조직으로 시작" 선택 시 apply 없이 진행

- [x] Task 4: Step 3 — API 키 설정 (AC: #4)
  - [x]4.1 ApiKeyStep 컴포넌트: OpenAI + Google AI (Gemini) 키 입력 폼
  - [x]4.2 기존 `GET /api/admin/credentials?provider=openai` 등으로 기존 키 존재 확인
  - [x]4.3 입력 시 `POST /api/admin/credentials` (기존 credential API) 호출
  - [x]4.4 이미 있는 키는 마스킹 표시 + "변경" 옵션
  - [x]4.5 "나중에 설정하기" 건너뛰기 링크

- [x] Task 5: Step 4 — 직원 초대 (AC: #5)
  - [x]5.1 InviteStep 컴포넌트: 이메일 + 이름 + 부서 선택 폼
  - [x]5.2 "초대하기" → `POST /api/admin/employees` 호출
  - [x]5.3 성공 시 초기 비밀번호 표시 + 복사 버튼 (clipboard API)
  - [x]5.4 부서 드롭다운: Step 2에서 생성된 부서 또는 `GET /api/admin/departments` fetch
  - [x]5.5 "한 명 더 초대하기" 버튼 → 폼 리셋 + 기존 초대 목록 표시
  - [x]5.6 "건너뛰기" 링크

- [x] Task 6: Step 5 — 완료 요약 (AC: #6)
  - [x]6.1 SummaryStep 컴포넌트: 각 단계에서 수행한 작업 요약 카드
  - [x]6.2 회사명, 적용 템플릿, 등록 API 키 수, 초대 직원 수 표시
  - [x]6.3 "CORTHEX 사용 시작하기" 버튼
  - [x]6.4 클릭 → `PATCH /api/admin/companies/:id` settings.onboardingCompleted = true
  - [x]6.5 성공 → navigate('/admin/') 대시보드로 이동

- [x] Task 7: Progress Bar + Step Indicator (AC: #7)
  - [x]7.1 StepIndicator 컴포넌트: 5단계 표시, 현재 단계 강조, 완료 체크
  - [x]7.2 "이전"/"다음"/"건너뛰기" 버튼 공통 FooterNav 컴포넌트
  - [x]7.3 Step 1 "이전" 비활성, Step 5 "다음" 대신 완료 버튼

- [x] Task 8: 테스트 (AC: 전체)
  - [x]8.1 온보딩 체크 로직 테스트 (settings 없음/완료/미완료)
  - [x]8.2 각 Step 렌더링 + 폼 인터랙션 테스트
  - [x]8.3 Step 간 이동 (이전/다음/건너뛰기) 테스트
  - [x]8.4 API 호출 모킹 테스트 (템플릿 적용, 직원 초대, credential 저장)
  - [x]8.5 온보딩 완료 플래그 저장 + 리다이렉트 테스트
  - [x]8.6 super_admin 회사 미선택 시 위저드 미표시 테스트

## Dev Notes

### 핵심 아키텍처

**온보딩은 Admin 앱 전용 (CEO 앱 온보딩은 별도 스토리)**
- Admin 앱 Layout에서 selectedCompanyId의 settings.onboardingCompleted 체크
- 미완료 → /admin/onboarding 리다이렉트
- 완료 → 정상 Admin 앱 렌더링

**기존 API 100% 활용 — 새 서버 엔드포인트 불필요**
- 회사 정보: `GET/PATCH /api/admin/companies/:id`
- 템플릿: `GET /api/admin/org-templates`, `POST /api/admin/org-templates/:id/apply`
- API 키: 기존 credential vault API (`/api/admin/credentials`)
- 직원: `POST /api/admin/employees`
- 부서: `GET /api/admin/departments`
- 온보딩 완료 플래그: `PATCH /api/admin/companies/:id` → `{ settings: { onboardingCompleted: true } }`

### 회사 settings JSONB 구조

```typescript
// companies.settings (JSONB field — already exists in schema)
{
  onboardingCompleted: boolean  // true이면 위저드 스킵
  // 기존 settings도 보존해야 함 (spread operator 필수)
}
```

**PATCH 시 주의**: 기존 settings를 덮어쓰지 않도록 서버 코드 확인 필요.
현재 companies.ts의 PATCH는 `settings: z.record(z.unknown()).optional()` — 전체 교체 방식이므로,
클라이언트에서 기존 settings를 먼저 가져온 후 merge하여 전송해야 함:
```typescript
const existing = company.settings || {};
await fetch(`/api/admin/companies/${id}`, {
  method: 'PATCH',
  body: JSON.stringify({ settings: { ...existing, onboardingCompleted: true } })
});
```

### credential API 확인

**File**: `packages/server/src/routes/admin/credentials.ts`
- `GET /api/admin/credentials` — 프로바이더별 키 목록 (키 값은 마스킹)
- `POST /api/admin/credentials` — 새 키 저장 (AES-256-GCM 암호화)
- `DELETE /api/admin/credentials/:id` — 키 삭제

**지원 프로바이더**: openai, google_ai, anthropic, kis, smtp, email, telegram, instagram, serper, notion, google_calendar, tts

### 기존 UI 컴포넌트 사용

| 컴포넌트 | 패키지 | 용도 |
|----------|--------|------|
| `Card`, `CardHeader`, `CardContent` | @corthex/ui | 템플릿 카드, 요약 카드 |
| `Modal` | @corthex/ui | 템플릿 미리보기 (선택적) |
| `Button` | @corthex/ui | 이전/다음/건너뛰기 |
| `Input`, `Textarea` | @corthex/ui | 폼 필드 |
| `Select` | @corthex/ui | 부서 선택 드롭다운 |
| `ProgressBar` | @corthex/ui | 단계 진행률 |
| `Badge` | @corthex/ui | 완료 상태 표시 |
| `Spinner` | @corthex/ui | 로딩 상태 |
| `EmptyState` | @corthex/ui | 빈 템플릿 상태 |

### 라우팅 통합

```typescript
// App.tsx에 추가
{ path: 'onboarding', element: <OnboardingWizardPage /> }

// Layout.tsx에서 온보딩 체크 추가
// selectedCompanyId + companies[id].settings.onboardingCompleted 확인
// 미완료 → navigate('/admin/onboarding')
```

### 이전 스토리에서 학습한 패턴

**9-6 (App Switching)**: localStorage 키 분리 패턴, JWT 세션 공유
**9-5 (Company Settings UI)**: 회사 설정 PATCH 패턴, settings JSONB 사용법
**9-4 (Employee Management UI)**: 직원 초대 폼 + 초기 비밀번호 표시 패턴
**2-8 (Org Template UI)**: 템플릿 카드 표시 + 미리보기 + 적용 패턴

이들 페이지의 코드 패턴을 그대로 재사용할 것:
- `packages/admin/src/pages/org-templates.tsx` — 템플릿 카드 + 미리보기 참조
- `packages/admin/src/pages/employees.tsx` — 직원 초대 폼 참조
- `packages/admin/src/pages/settings.tsx` — 회사 정보 편집 참조
- `packages/admin/src/pages/credentials.tsx` — API 키 저장 참조

### 스타일링 규칙

- Tailwind CSS + CSS variables (기존 패턴)
- 다크모드: `dark:` prefix 필수 적용
- 위저드 레이아웃: 좌측 StepIndicator (w-64) + 우측 콘텐츠 영역
- 또는 상단 Progress Bar + 중앙 콘텐츠 (화면 크기에 따라)
- 반응형: 모바일은 상단 Progress Bar, 데스크탑은 좌측 StepIndicator

### NFR34 준수

온보딩 10분 이내 첫 명령 성공 목표:
- 각 단계 선택사항 표시 (필수 입력 최소화)
- 건너뛰기 옵션 모든 단계에 제공
- 템플릿 선택만으로 조직 자동 구성 (수동 입력 최소화)

### Project Structure Notes

**신규 파일:**
- `packages/admin/src/pages/onboarding.tsx` — 온보딩 위저드 메인 페이지

**수정 파일:**
- `packages/admin/src/App.tsx` — 라우트 추가
- `packages/admin/src/components/layout.tsx` — 온보딩 체크 + 리다이렉트 로직

**테스트 파일:**
- `packages/server/src/__tests__/unit/onboarding-wizard.test.ts` — 온보딩 로직 테스트

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E9-S7] 온보딩 위저드 (2 SP), 의존성: E2-S4, E9-S6
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#12.6] Onboarding Patterns
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#10.2] Journey Map 박과장 Phase A (A1~A5)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Core-User-Flow-3] 온보딩 플로우
- [Source: packages/server/src/routes/admin/companies.ts] PATCH companies/:id — settings 업데이트
- [Source: packages/server/src/routes/admin/org-templates.ts] GET 템플릿 + POST apply
- [Source: packages/server/src/routes/admin/employees.ts] POST 직원 초대
- [Source: packages/server/src/services/credential-vault.ts] credential vault API
- [Source: packages/admin/src/pages/org-templates.tsx] 템플릿 카드 UI 패턴
- [Source: packages/admin/src/pages/employees.tsx] 직원 초대 폼 패턴
- [Source: packages/admin/src/pages/settings.tsx] 회사 정보 편집 패턴
- [Source: packages/admin/src/App.tsx] Admin 앱 라우팅
- [Source: packages/admin/src/components/layout.tsx] Layout + 리다이렉트 로직

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Created OnboardingWizardPage with 5-step wizard, added /onboarding route to App.tsx, added onboarding check + auto-redirect to Layout.
- Task 2: WelcomeStep with company info display, inline edit toggle, PATCH API for name changes.
- Task 3: TemplateStep with template card grid, preview with dept/agent tree, apply API integration, blank org option.
- Task 4: ApiKeyStep for OpenAI + Google AI with provider schema fetch, existing key detection, masked display.
- Task 5: InviteStep with username/name/email form, department dropdown, initial password display + clipboard copy, multi-invite tracking.
- Task 6: SummaryStep with all-steps recap, "Start CORTHEX" button that saves onboardingCompleted=true via PATCH with settings merge.
- Task 7: StepIndicator (5 steps, checkmarks), FooterNav (prev/next/skip), progress bar.
- Task 8: 74 tests covering all steps, AC verification, edge cases, dark mode, API patterns, state flow.

### File List

- packages/admin/src/pages/onboarding.tsx (new — 5-step onboarding wizard page)
- packages/admin/src/App.tsx (modified — added /onboarding route with lazy import)
- packages/admin/src/components/layout.tsx (modified — added onboarding check + redirect logic)
- packages/server/src/__tests__/unit/onboarding-wizard.test.ts (new — 74 tests)
- packages/server/src/__tests__/unit/onboarding-wizard-tea.test.ts (new — 34 TEA risk-based tests)
