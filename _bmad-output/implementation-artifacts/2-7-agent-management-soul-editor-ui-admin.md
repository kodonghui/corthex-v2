# Story 2.7: Agent Management + Soul Editor UI (Admin)

Status: done

## Story

As a 관리자,
I want 관리자 콘솔에서 에이전트를 목록/생성/편집/비활성화하고 Soul 마크다운을 편집/미리보기할 수 있기를,
so that AI 직원의 설정과 성격을 직관적으로 관리할 수 있다.

## Acceptance Criteria

1. **Given** 에이전트 관리 화면 진입 **When** 페이지 로드 **Then** 에이전트 목록 테이블 표시 (이름, 계급, 모델, 부서, 상태) + 필터/검색 가능
2. **Given** "새 AI 직원 추가" 버튼 클릭 **When** 생성 폼에서 이름/계급/모델/부서/Soul 입력 후 생성 **Then** 에이전트 즉시 생성 + 목록 갱신 + 성공 토스트
3. **Given** 에이전트 목록에서 에이전트 클릭 **When** 상세 편집 패널 열림 **Then** 탭 구조(기본 정보 / Soul 편집 / 도구 권한)로 상세 편집 가능
4. **Given** Soul 편집 탭 **When** 마크다운 입력 **Then** 실시간 미리보기(렌더링된 마크다운) 표시 + Soul 템플릿 불러오기 가능
5. **Given** 시스템 에이전트(isSystem=true) **When** 목록 표시 **Then** 잠금 아이콘 + "시스템 필수" 라벨 + 비활성화 버튼 비활성 (FR5)
6. **Given** 계급 선택 **When** Manager/Specialist/Worker 중 선택 **Then** 계급 설명 툴팁 표시 + 기본 모델 자동 배정 (변경 가능)
7. **Given** 에이전트 비활성화 클릭 **When** 확인 모달 표시 **Then** 비활성화 실행 (soft delete) + 목록에서 상태 반영

## Tasks / Subtasks

- [x] Task 1: 에이전트 목록을 테이블 뷰로 리팩터링 (AC: #1)
  - [x] 카드 그리드 -> 테이블 뷰 (이름, 계급, 모델, 부서, 상태 컬럼)
  - [x] 부서별/계급별/상태별 필터 드롭다운
  - [x] 에이전트명 검색 필터
  - [x] 시스템 에이전트 시각적 구분 (잠금 아이콘 + 뱃지)
  - [x] 빈 상태 시 "새 AI 직원 추가" CTA 표시

- [x] Task 2: 에이전트 생성 폼 개선 (AC: #2, #6)
  - [x] 이름(필수), 계급(Manager/Specialist/Worker 선택), 소속 부서(드롭다운), 모델(드롭다운)
  - [x] 계급 선택 시 기본 모델 자동 배정: Manager->claude-sonnet-4-6, Specialist->claude-haiku-4-5, Worker->gemini-2.5-flash
  - [x] 계급 설명 툴팁: Manager="팀을 이끌고 결과를 종합", Specialist="전문 분야 분석", Worker="반복 작업 수행"
  - [x] Soul 템플릿 불러오기 드롭다운 (기존 API 재사용)
  - [x] Soul 마크다운 textarea (생성 단계에서는 단순 textarea)

- [x] Task 3: 에이전트 상세 편집 패널 -- 탭 구조 (AC: #3, #4, #5)
  - [x] 에이전트 클릭 -> 상세 편집 패널 (우측 슬라이드 또는 모달)
  - [x] 탭 1: 기본 정보 (이름, 계급, 모델, 부서, 상태, isSystem 표시)
  - [x] 탭 2: Soul 편집 -- 좌우 분할(에디터 | 미리보기)
    - [x] 마크다운 에디터 (textarea, monospace 폰트)
    - [x] 실시간 미리보기 (마크다운 -> HTML 렌더링)
    - [x] Soul 템플릿 불러오기 버튼
  - [x] 탭 3: 도구 권한 -- allowedTools 체크박스 리스트 (읽기 전용 표시, Epic 4에서 구현)
  - [x] 시스템 에이전트: 비활성화 버튼 숨김 + "시스템 에이전트" 경고 배너

- [x] Task 4: 에이전트 비활성화 확인 모달 (AC: #7)
  - [x] 비활성화 클릭 -> 확인 모달 (에이전트 이름 + "미배속 전환 + 비활성화" 안내)
  - [x] 시스템 에이전트는 비활성화 불가 (서버에서 403 반환, UI에서도 버튼 비활성)
  - [x] 비활성화 후 목록 갱신 + 성공 토스트

- [x] Task 5: 마크다운 렌더링 유틸 (Soul 미리보기용)
  - [x] 경량 마크다운 파서 구현 (의존성 없이 기본 문법만: #heading, **bold**, *italic*, - list, `code`, ```codeblock```)
  - [x] 또는 기존 프로젝트에 마크다운 라이브러리가 있으면 재사용

## Dev Notes

### 현재 코드베이스 상태

**이미 존재하는 것:**
- `packages/admin/src/pages/agents.tsx` -- 기본 에이전트 CRUD 페이지 (카드 그리드 형태)
  - 생성 폼 (인라인): name, role, departmentId, soul, isSecretary
  - 수정 (인라인 편집): name, role, soul, isSecretary
  - 비활성화 (confirm 다이얼로그)
  - react-query 사용 (useQuery, useMutation, useQueryClient)
  - Soul 템플릿 불러오기 드롭다운 이미 구현
  - **문제점:** tier, modelName, allowedTools 필드가 폼에 없음! DB 스키마에는 존재하지만 UI에서 미사용
- `packages/server/src/routes/admin/agents.ts` -- 완전한 REST API
  - GET /admin/agents?companyId=X&departmentId=X&isActive=true -- 목록 (필터 포함)
  - GET /admin/agents/:id -- 단건 조회
  - POST /admin/agents -- 생성 (tier, modelName, allowedTools, soul 모두 지원)
  - PATCH /admin/agents/:id -- 수정 (모든 필드 지원)
  - DELETE /admin/agents/:id -- soft 비활성화
- `packages/server/src/routes/admin/soul-templates.ts` -- Soul 템플릿 CRUD API
  - GET /admin/soul-templates?companyId=X -- 목록
- `packages/server/src/services/organization.ts` -- 비즈니스 로직
  - createAgent(): tier 기본값 'specialist', modelName 기본값 'claude-haiku-4-5'
  - updateAgent(): soul 변경 시 adminSoul도 동기화
  - deactivateAgent(): isSystem=true 시 403 반환
- `packages/server/src/config/models.yaml` -- 사용 가능한 모델 목록
  - claude-sonnet-4-6, claude-haiku-4-5, gpt-4.1, gpt-4.1-mini, gemini-2.5-pro, gemini-2.5-flash

**수정 필요:**

| 항목 | 현재 | 목표 |
|------|------|------|
| 에이전트 목록 | 카드 그리드 | 테이블 뷰 (이름, 계급, 모델, 부서, 상태) |
| 생성 폼 | name/role/dept/soul만 | + tier, modelName 추가 |
| 수정 | 인라인 카드 편집 | 상세 편집 패널 (탭: 기본정보/Soul/도구) |
| Soul 편집 | 단순 textarea | 마크다운 에디터 + 실시간 미리보기 (좌우 분할) |
| 비활성화 | window.confirm() | 확인 모달 (시스템 에이전트 보호 시각화) |
| 필터 | 없음 | 부서별/계급별/상태별 필터 |

### Agent API 스키마 (서버측 -- 변경 불필요)

```typescript
// POST /admin/agents (생성)
{
  userId: string      // UUID, 필수
  departmentId?: string | null
  name: string        // 1~100자, 필수
  nameEn?: string | null
  role?: string | null
  tier?: 'manager' | 'specialist' | 'worker'  // 기본: 'specialist'
  modelName?: string  // 기본: 'claude-haiku-4-5'
  allowedTools?: string[]  // 기본: []
  soul?: string | null
}

// PATCH /admin/agents/:id (수정)
{
  name?, nameEn?, role?, tier?, modelName?,
  departmentId?, allowedTools?, soul?, status?, isActive?
}

// DELETE /admin/agents/:id -> soft deactivation (isActive=false, departmentId=null)
// isSystem=true 시 403 반환
```

### Agent DB 스키마 필드 (schema.ts line 115-137)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| companyId | uuid | FK → companies |
| userId | uuid | FK → users (소유자) |
| departmentId | uuid | FK → departments (nullable) |
| name | varchar(100) | 에이전트 이름 |
| role | varchar(200) | 역할 설명 |
| tier | enum(manager/specialist/worker) | 계급, 기본: specialist |
| nameEn | varchar(100) | 영문 이름 |
| modelName | varchar(100) | LLM 모델, 기본: claude-haiku-4-5 |
| reportTo | uuid | 상위 에이전트 (self-reference) |
| soul | text | 마크다운 성격 정의 |
| adminSoul | text | 관리자 원본 소울 (초기화용) |
| status | enum(online/working/error/offline) | 기본: offline |
| isSecretary | boolean | 비서 역할 |
| isSystem | boolean | 시스템 에이전트 삭제 보호 |
| allowedTools | jsonb | string[] 허용 도구 이름 |
| isActive | boolean | 활성 여부 |

### 사용 가능한 모델 목록 (models.yaml)

| 모델 ID | 용도 |
|---------|------|
| claude-sonnet-4-6 | Manager (고급 추론) |
| claude-haiku-4-5 | Specialist (기본) |
| gpt-4.1 | Manager 대안 |
| gpt-4.1-mini | Specialist 대안 |
| gemini-2.5-pro | Manager 대안 |
| gemini-2.5-flash | Worker (경량) |

### 계급별 기본 모델 배정 (3계급 자동 배정)

| 계급 | 기본 모델 | 역할 설명 |
|------|----------|----------|
| Manager | claude-sonnet-4-6 | 팀을 이끌고 결과를 종합 |
| Specialist | claude-haiku-4-5 | 전문 분야 분석 |
| Worker | gemini-2.5-flash | 반복 작업 수행 |

### 파일 변경 범위

```
packages/admin/src/pages/agents.tsx  -- 전체 리팩터링 (테이블 뷰 + 상세 편집 패널 + Soul 에디터)
```
서버 코드 변경 없음 -- API가 이미 완전히 구현되어 있음.

### UI 패턴 참고 (이전 스토리 2-6에서 배운 점)

- admin-store의 selectedCompanyId를 반드시 사용
- 토스트 알림 패턴: addToast({ type: 'success'|'error', message })
- react-query invalidateQueries 패턴으로 캐시 갱신
- Tailwind CSS 클래스 기반 스타일링 (dark mode 지원)
- 기존 admin 앱 패턴: `packages/admin/src/pages/departments.tsx` (테이블 뷰 참고)
- API 유틸: `packages/admin/src/lib/api.ts` -- api.get/post/patch/delete
- 상태: `packages/admin/src/stores/admin-store.ts` -- selectedCompanyId
- 토스트: `packages/admin/src/stores/toast-store.ts` -- addToast({ type, message })

### UX 디자인 참조 (Admin A3)

- **에이전트 목록 테이블**: 이름, 계급, 모델, 부서, 상태 컬럼 + 부서/계급/상태 필터
- **에이전트 생성 플로우**: 이름(필수) → 계급 선택(툴팁) → 모델 자동배정(변경 가능) → 부서 선택 → Soul 편집 → 도구 설정 → "만들기"
- **에이전트 상세 편집**: 탭 구조 (기본 정보 / Soul 편집 / 도구 권한 / 테스트 명령)
  - 테스트 명령 탭은 Epic 5(오케스트레이션) 이후 구현 -- 이 스토리에서는 "준비 중" 표시
- **Soul 편집**: 마크다운 에디터(좌) + 실시간 미리보기(우) 분할 뷰
  - Soul 템플릿 불러오기 드롭다운 (기존 API 활용)
  - "이것만 바꾸세요" 하이라이트 영역 (역할, 전문분야) -- Soul 템플릿에 가이드 마킹이 있을 경우
- **시스템 에이전트**: 잠금 아이콘 + "시스템 필수" 라벨 + 비활성화 버튼 비활성 + 툴팁 "오케스트레이션에 필수인 에이전트입니다"
- **비활성화**: confirm 다이얼로그가 아닌 모달 컴포넌트 사용

### 마크다운 미리보기 구현 전략

1. **경량 인하우스 파서** (권장): 외부 의존성 없이 기본 마크다운 문법만 지원
   - heading (#, ##, ###)
   - bold (**text**), italic (*text*)
   - unordered list (- item)
   - code (`inline`), code block (```)
   - 줄바꿈
2. **대안**: marked, react-markdown 등 라이브러리 설치 -- 단, 프로젝트 의존성 최소화 원칙 고려

### 중요한 서버 동작 주의사항

- `createAgent()`는 `userId` 필수 -- 현재 admin 페이지에서 이걸 어떻게 처리하는지 확인 필요
  - 현재 코드: `api.post('/admin/agents', { companyId, name, role, ... })` -- userId가 빠져있음
  - **서버 createAgent 함수에서 userId를 body에서 받음** (tenant.userId가 아님)
  - 해결: admin이 선택한 회사의 대표 userId를 사용하거나, 서버 측에서 tenant.userId를 fallback으로 사용
  - 현재 createAgentSchema에 `userId: z.string().uuid()` 필수 -- UI에서 반드시 전달해야 함
  - **확인 필요**: 기존 agents.tsx가 이 문제를 어떻게 해결하는지 (아마 에러 발생 중일 수 있음)

### Project Structure Notes

- `packages/admin/` -- React + Vite + Tailwind CSS + @tanstack/react-query
- 라우팅: `packages/admin/src/App.tsx` -- `/agents` 경로에 AgentsPage 매핑됨
- 공유 UI: `packages/ui` -- Skeleton 등 기본 컴포넌트 import 가능

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E2-S7] -- 스토리 요구사항
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Admin-A3] -- UX 디자인 (에이전트 관리)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#에이전트-생성-플로우] -- 생성 플로우 상세
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#인라인-테스트-명령-패턴] -- 테스트 명령 UX (향후)
- [Source: packages/server/src/routes/admin/agents.ts] -- 에이전트 CRUD API (변경 불필요)
- [Source: packages/server/src/services/organization.ts] -- 에이전트 비즈니스 로직
- [Source: packages/server/src/db/schema.ts#agents] -- 에이전트 DB 스키마
- [Source: packages/server/src/config/models.yaml] -- 사용 가능 LLM 모델 목록
- [Source: packages/admin/src/pages/agents.tsx] -- 현재 UI (리팩터링 대상)
- [Source: packages/admin/src/pages/departments.tsx] -- 테이블 뷰 참고 패턴 (2-6에서 구현)
- [Source: _bmad-output/implementation-artifacts/2-6-department-management-ui-admin.md] -- 이전 스토리 참고

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- 에이전트 목록을 카드 그리드에서 테이블 뷰로 전면 리팩터링 (이름, 계급, 모델, 부서, 상태 컬럼)
- 부서별/계급별/상태별 필터 드롭다운 + 에이전트명 검색 필터 추가
- 에이전트 생성 폼에 tier(계급), modelName(LLM 모델) 필드 추가 -- 기존 폼에는 누락되어 있었음
- 계급 선택 시 기본 모델 자동 배정: Manager->claude-sonnet-4-6, Specialist->claude-haiku-4-5, Worker->gemini-2.5-flash
- 계급 설명 툴팁 inline 표시 (select option에 포함)
- 생성 시 userId를 auth-store에서 가져와 서버 API에 전달 (기존 코드에서 누락)
- 에이전트 클릭 -> 우측 슬라이드 패널로 상세 편집 (탭 구조: 기본 정보 / Soul 편집 / 도구 권한)
- Soul 편집 탭: 좌우 분할 (마크다운 에디터 | 실시간 미리보기)
- 경량 마크다운 렌더러 구현 (외부 의존성 없이): heading, bold, italic, list, code, code block + XSS 방지
- Soul 템플릿 불러오기 드롭다운 (기존 soul-templates API 재사용)
- 도구 권한 탭: 현재 허용 도구 읽기 전용 표시 + "준비 중" 안내 (Epic 4에서 구현)
- 시스템 에이전트: 잠금 아이콘 + "시스템" 뱃지 + 경고 배너 + 비활성화 버튼 숨김
- 비활성화: window.confirm() -> 확인 모달 (에이전트 이름 + 처리 안내)
- 빈 상태 시 "새 AI 직원 추가" CTA 표시
- 116개 단위 테스트 작성 (마크다운 렌더링 12개, 계급-모델 매핑 7개, 필터링 8개, 시스템 에이전트 보호 4개, API 스키마 20개+, TEA 리스크 기반 확장 32개 포함)

### File List

- packages/admin/src/pages/agents.tsx -- 테이블 뷰 + 상세 편집 패널 + Soul 에디터 (전체 리팩터링)
- packages/server/src/__tests__/unit/agent-management-ui.test.ts -- 116개 단위 테스트 (신규)
