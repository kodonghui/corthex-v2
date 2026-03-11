# Story 7.3: 조직 템플릿 + 온보딩

Status: review

## Story

As a 신규 회사 관리자,
I want 가입 시 기본 조직 구조가 자동 생성되는 것을,
so that 빈 화면에서 시작하지 않아도 된다.

## Acceptance Criteria

1. **기본 조직 템플릿 자동 적용**: 회원가입 시 기본 템플릿(CEO + 비서 + 3개 부서 + 부서당 매니저 1명)이 자동 생성됨
2. **템플릿 선택 온보딩**: 가입 후 첫 로그인 시 템플릿 선택 화면 제공 (기본/기술/마케팅/투자 4종)
3. **CLI 토큰 등록 가이드**: 온보딩 위저드에 Claude CLI OAuth 토큰 등록 안내 포함
4. **온보딩 완료 추적**: 회사 settings에 onboardingCompleted 플래그 저장, 완료 전까지 온보딩 화면 표시
5. **템플릿 프리뷰**: 선택 전 부서/에이전트 구성 미리보기 (admin UI의 PreviewModal 재사용)
6. **NFR35 준수**: 템플릿 선택 → 첫 명령 가능까지 < 2분

## Tasks / Subtasks

- [x] Task 1: 회원가입 시 기본 템플릿 자동 적용으로 전환 (AC: #1)
  - [x] 1.1 `packages/server/src/routes/auth.ts` — register 엔드포인트에서 `deployOrganization()` → `applyTemplate()` 전환
  - [x] 1.2 기본 템플릿 ID 조회: `orgTemplates` 테이블에서 `isBuiltin=true AND name LIKE '%기본%'` 으로 찾기
  - [x] 1.3 fallback: 기본 템플릿 없으면 기존 `deployOrganization()` 유지 (안전장치)
  - [x] 1.4 비서 에이전트 자동 생성: 템플릿에 비서가 없으면 별도 생성 (isSecretary=true)

- [x] Task 2: 온보딩 API (AC: #2, #4)
  - [x] 2.1 `GET /api/onboarding/status` — 현재 회사의 온보딩 상태 반환 (companies.settings.onboardingCompleted)
  - [x] 2.2 `POST /api/onboarding/select-template` — 템플릿 선택 + 적용 (applyTemplate 호출)
  - [x] 2.3 `POST /api/onboarding/complete` — 온보딩 완료 마킹 (companies.settings.onboardingCompleted = true)
  - [x] 2.4 `GET /api/onboarding/templates` — 빌트인 템플릿 목록 (인증만, admin 권한 불요)
  - [x] 2.5 온보딩 라우트는 authMiddleware만 적용 (adminOnly 불요 — 일반 CEO 유저도 사용)

- [x] Task 3: 온보딩 프론트엔드 (AC: #2, #3, #5)
  - [x] 3.1 `packages/app/src/pages/onboarding.tsx` — 3단계 위저드
    - Step 1: 환영 + 조직 템플릿 선택 (카드 4개, 클릭 시 프리뷰)
    - Step 2: CLI 토큰 등록 가이드 (가이드 텍스트 + "나중에 설정" 스킵 버튼)
    - Step 3: 완료 확인 + 사령관실로 이동
  - [x] 3.2 App.tsx에 온보딩 라우트 추가: `/onboarding` → OnboardingPage
  - [x] 3.3 로그인 후 onboardingCompleted=false면 `/onboarding`으로 리다이렉트
  - [x] 3.4 PreviewModal 재사용: admin의 org-templates.tsx에서 추출하여 공유 컴포넌트화 또는 inline 구현

- [x] Task 4: 테스트 (AC: 전체)
  - [x] 4.1 register → applyTemplate 연동 테스트
  - [x] 4.2 온보딩 API 테스트 (상태 조회, 템플릿 선택, 완료)
  - [x] 4.3 기본 템플릿 없을 때 fallback 테스트
  - [x] 4.4 이미 온보딩 완료된 회사 재진입 테스트

## Dev Notes

### 기존 코드 현황 (매우 중요 — 중복 작성 금지)

**이미 구현된 것:**
- `packages/server/src/services/organization.ts` — `applyTemplate(tenant, templateId)` 완전 구현됨
  - 머지 전략: 이름 기준 중복 부서/에이전트 건너뜀
  - 반환값: `TemplateApplySummary` (생성/스킵 카운트 + 부서별 상세)
  - 감사 로그 자동 기록
- `packages/server/src/routes/admin/org-templates.ts` — 템플릿 CRUD API
  - GET /org-templates, GET /org-templates/:id, POST /org-templates, POST /:id/apply, POST /:id/publish
  - **주의**: `adminOnly` 미들웨어 적용됨 → 온보딩용은 별도 라우트 필요
- `packages/server/src/db/seed-e7.ts` — 4개 빌트인 템플릿 시드 (기본/기술/마케팅/투자)
- `packages/admin/src/pages/org-templates.tsx` — 관리자 템플릿 페이지 (PreviewModal, ApplyResultModal, TemplateCard)
- `packages/server/src/services/agent-org-deployer.ts` — 29-agent 고정 배치 (교체 대상)
  - `deployOrganization(companyId, userId)` — 현재 auth.ts register에서 호출됨

**현재 register 흐름 (교체 대상):**
```
POST /api/auth/register
  → company INSERT
  → user INSERT (admin role)
  → deployOrganization(companyId, userId)  ← 29명 고정 배치 (교체 대상)
  → JWT 발급
```

**교체 후 흐름:**
```
POST /api/auth/register
  → company INSERT (settings: { onboardingCompleted: false })
  → user INSERT (admin role)
  → applyTemplate(tenant, defaultTemplateId)  ← 기본 템플릿 적용
  → JWT 발급
  → 클라이언트: /onboarding 리다이렉트
```

### 핵심 주의사항

1. **applyTemplate의 tenant 파라미터**: `{ companyId, userId, isAdminUser: false }` 형태
2. **기본 템플릿 식별**: `orgTemplates` 테이블에서 `isBuiltin=true` 중 첫 번째 또는 이름에 '기본' 포함하는 것
3. **companies.settings 컬럼**: `jsonb default '{}'` — `{ onboardingCompleted: boolean }` 추가
4. **온보딩 라우트 권한**: `authMiddleware`만 (adminOnly 아님) — CEO 유저가 온보딩을 완료해야 함
5. **deployOrganization import**: auth.ts에서 제거하되, agent-org-deployer.ts 파일은 삭제하지 말 것 (다른 곳에서 참조 가능)
6. **비서 에이전트**: 기본 템플릿에 비서 에이전트가 포함되어 있는지 확인. 없으면 별도 생성 로직 필요 (isSecretary=true인 에이전트 1명 필수)

### DB 스키마 참고

```
companies: id, name, slug, isActive, settings(jsonb), smtpConfig(jsonb), createdAt, updatedAt
orgTemplates: id, companyId(nullable), name, description, templateData(jsonb), isBuiltin, isActive, isPublished, publishedAt, downloadCount, tags(jsonb), createdBy, createdAt, updatedAt
```

`templateData` 구조:
```json
{
  "departments": [
    {
      "name": "개발팀",
      "description": "기술 개발 담당",
      "agents": [
        {
          "name": "CTO",
          "nameEn": "CTO",
          "role": "기술 총괄",
          "tier": "manager",
          "modelName": "claude-sonnet-4-20250514",
          "soul": "...",
          "allowedTools": ["calculate", "search_web"]
        }
      ]
    }
  ]
}
```

### 파일 구조 가이드

```
packages/server/src/
  routes/
    auth.ts              ← register 수정 (deployOrganization → applyTemplate)
    onboarding.ts        ← 신규 (온보딩 전용 API)
  services/
    organization.ts      ← 기존 applyTemplate 재사용 (수정 불필요)
    agent-org-deployer.ts ← fallback 유지 (삭제 금지)

packages/app/src/
  pages/
    onboarding.tsx       ← 신규 (온보딩 위저드 3단계)
  App.tsx                ← 라우트 추가 + 온보딩 리다이렉트 로직
```

### API 설계

```
# 온보딩 상태 확인 (로그인 후 호출)
GET /api/onboarding/status
→ { success: true, data: { completed: boolean, selectedTemplateId: string | null } }

# 빌트인 템플릿 목록 (온보딩용, admin 권한 불요)
GET /api/onboarding/templates
→ { success: true, data: OrgTemplate[] }

# 템플릿 선택 + 적용
POST /api/onboarding/select-template
Body: { templateId: string }
→ { success: true, data: TemplateApplySummary }

# 온보딩 완료
POST /api/onboarding/complete
→ { success: true, data: { message: "온보딩이 완료되었습니다" } }
```

### CLI 토큰 등록 가이드 콘텐츠

Step 2에 표시할 내용 (v2 OAuth CLI 아키텍처 참고):
- Claude Max 구독 필요 ($220/월)
- CLI 설치: `npm install -g @anthropic-ai/claude-code`
- OAuth 인증: `claude auth login` → 브라우저 → 토큰 자동 발급
- 토큰 등록: 관리자 콘솔 → 자격증명 관리에서 등록
- "나중에 설정" 스킵 가능 (온보딩 완료 후에도 자격증명 페이지에서 등록 가능)

### 이전 스토리 패턴 (7.1, 7.2, 7.4에서 확인)

- API 응답: `{ success: true, data }` / `{ success: false, error: { code, message } }` 일관 사용
- HTTPError 활용: `throw new HTTPError(404, '메시지', 'CODE')`
- 미들웨어 체인: `authMiddleware → tenantMiddleware` (adminOnly는 온보딩에 불요)
- Zod 검증: `zValidator('json', schema)`
- 테스트: bun:test, `packages/server/src/__tests__/unit/` 폴더

### Project Structure Notes

- packages/app = CEO 앱 (프론트엔드). 온보딩 페이지는 여기에 추가
- packages/admin = 관리자 앱. 템플릿 관리는 이미 여기에 있음
- packages/server = 백엔드 API. 온보딩 라우트 추가
- packages/shared = 공유 타입. 필요시 온보딩 타입 추가

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 7, Story 7.3]
- [Source: _bmad-output/planning-artifacts/prd.md — NFR34, NFR35]
- [Source: _bmad-output/planning-artifacts/architecture.md — Onboarding FR]
- [Source: packages/server/src/routes/auth.ts — register 엔드포인트]
- [Source: packages/server/src/services/organization.ts — applyTemplate()]
- [Source: packages/server/src/services/agent-org-deployer.ts — deployOrganization() (교체 대상)]
- [Source: packages/admin/src/pages/org-templates.tsx — PreviewModal, TemplateCard]
- [Source: packages/server/src/db/seed-e7.ts — 4개 빌트인 템플릿]
- [Source: .claude/memory/MEMORY.md — OAuth CLI 아키텍처]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: auth.ts register에서 deployOrganization → applyDefaultTemplate 전환. fallback 유지.
- Task 2: onboarding service (4개 함수) + onboarding route (4개 엔드포인트) 생성. authMiddleware only (no adminOnly).
- Task 3: 3단계 온보딩 위저드 생성 (템플릿 선택 → CLI 가이드 → 완료). App.tsx 라우트 등록.
- Task 4: 43개 테스트 전체 PASS. 서비스/라우트/프론트엔드/아키텍처 컴플라이언스 검증.
- tsc --noEmit 서버 PASS, 앱 PASS.
- 기존 applyTemplate 서비스 완전 재활용 (코드 중복 0)

### Change Log

- 2026-03-11: Story 7.3 구현 완료 — 조직 템플릿 + 온보딩

### File List

- packages/server/src/routes/auth.ts (modified — register에서 applyDefaultTemplate 사용)
- packages/server/src/routes/onboarding.ts (new — 온보딩 API 4개 엔드포인트)
- packages/server/src/services/onboarding.ts (new — 온보딩 서비스 4개 함수)
- packages/server/src/index.ts (modified — onboardingRoute 등록)
- packages/app/src/pages/onboarding.tsx (new — 3단계 온보딩 위저드)
- packages/app/src/App.tsx (modified — /onboarding 라우트 + lazy import)
- packages/server/src/__tests__/unit/onboarding-service.test.ts (new — 43개 테스트)
