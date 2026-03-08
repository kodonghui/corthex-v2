# Story 20.2: 에이전트 마켓플레이스 (Soul/도구 교환)

Status: done

## Story

As a Company Admin,
I want to browse a marketplace of agent configurations (Soul + tool sets) published by other companies, publish my own agent configurations, and import useful ones into my organization,
so that I can discover proven agent setups and quickly add specialized AI agents with best-practice configurations.

## Acceptance Criteria

1. **마켓 브라우징 API**: GET /api/workspace/agent-marketplace에서 isPublished=true인 다른 회사 + builtin Soul 템플릿 목록 조회 (자기 회사 제외, 키워드 검색/카테고리 필터/티어 필터 지원)
2. **마켓 상세 API**: GET /api/workspace/agent-marketplace/:id에서 공개 Soul 템플릿 상세 (content, allowedTools 포함) 조회
3. **임포트 API**: POST /api/workspace/agent-marketplace/:id/import에서 마켓 Soul 템플릿을 자기 회사 소유로 복제 (새 soulTemplates 레코드 생성, isPublished=false)
4. **발행 API**: POST /api/admin/soul-templates/:id/publish에서 자기 회사 Soul 템플릿을 마켓에 공개 (isPublished=true, publishedAt 설정)
5. **발행 취소 API**: POST /api/admin/soul-templates/:id/unpublish에서 마켓에서 회수 (isPublished=false)
6. **마켓 UI (admin)**: 관리자 앱에 "에이전트 마켓" 탭 추가 — 카드 그리드, 검색, 카테고리/티어 필터, 미리보기 모달, 임포트 버튼
7. **발행 UI (admin)**: 기존 soul-templates.tsx 페이지에 "마켓에 공개" 토글 + isPublished 상태 뱃지 추가
8. **다운로드 카운트**: 임포트 시 원본 템플릿의 downloadCount 증가

## Tasks / Subtasks

- [x] Task 1: 스키마 확장 (AC: #1, #8)
  - [x] 1.1 soulTemplates 테이블에 isPublished(boolean, default false), publishedAt(timestamp nullable), downloadCount(integer, default 0), tier(varchar nullable), allowedTools(jsonb nullable) 컬럼 추가
  - [x] 1.2 publishedIdx 인덱스 추가

- [x] Task 2: 마켓 API — 워크스페이스 라우트 (AC: #1, #2, #3)
  - [x] 2.1 packages/server/src/routes/workspace/agent-marketplace.ts 생성
  - [x] 2.2 GET /agent-marketplace — isPublished=true AND (companyId != tenant.companyId OR isBuiltin=true) 목록. q(검색), category(필터), tier(필터) 쿼리파라미터 지원
  - [x] 2.3 GET /agent-marketplace/:id — 공개 Soul 템플릿 상세 조회 (isPublished=true 검증)
  - [x] 2.4 POST /agent-marketplace/:id/import — 원본 복제 → 자기 회사 소유 새 soulTemplates 레코드 INSERT + 원본 downloadCount+1

- [x] Task 3: 관리자 API 확장 (AC: #4, #5)
  - [x] 3.1 POST /api/admin/soul-templates/:id/publish — companyId 일치 검증 → isPublished=true, publishedAt=now()
  - [x] 3.2 POST /api/admin/soul-templates/:id/unpublish — companyId 일치 검증 → isPublished=false

- [x] Task 4: 마켓 UI (관리자 앱) (AC: #6)
  - [x] 4.1 packages/admin/src/pages/agent-marketplace.tsx 생성 — 마켓 카드 그리드
  - [x] 4.2 검색바 + 카테고리 필터 + 티어 필터 UI
  - [x] 4.3 미리보기 모달 (Soul content 프리뷰 + 도구 목록 + 임포트 버튼)
  - [x] 4.4 사이드바에 "에이전트 마켓" 메뉴 추가 + App.tsx 라우트 등록

- [x] Task 5: 발행 UI 확장 (관리자 앱) (AC: #7)
  - [x] 5.1 기존 soul-templates.tsx에 isPublished 상태 뱃지 추가
  - [x] 5.2 각 TemplateCard에 공개/비공개 토글 버튼 추가
  - [x] 5.3 발행 확인 모달 (마켓에 공개되면 다른 회사가 복제 가능하다는 안내)

- [x] Task 6: 서버 index.ts 라우트 등록
  - [x] 6.1 agent-marketplace 워크스페이스 라우트를 app.route('/api/workspace', ...) 에 등록

## Dev Notes

### 기존 코드 현황 분석 (20-1 패턴 그대로 따를 것)

**이미 존재하는 것 (재사용):**
- `packages/server/src/db/schema.ts` — soulTemplates 테이블 (id, companyId, name, description, content, category, isBuiltin, isActive, createdBy, createdAt, updatedAt)
- `packages/server/src/routes/admin/soul-templates.ts` — GET list, POST create, PATCH update, DELETE (soft) (admin-only)
- `packages/server/src/routes/workspace/soul-templates.ts` — GET list (workspace, read-only)
- `packages/admin/src/pages/soul-templates.tsx` — Soul 템플릿 카드 그리드 + 생성/편집 폼 + 상세 모달
- **Story 20-1 완료 코드** — template-market.ts (workspace), org-templates.ts (admin publish/unpublish), template-market.tsx (admin UI) → **이 패턴을 동일하게 재사용**

**추가해야 할 것:**
- 스키마 확장: soulTemplates에 isPublished, publishedAt, downloadCount, tier, allowedTools 추가
- 워크스페이스 마켓 라우트 (새 파일: agent-marketplace.ts)
- 관리자 API 확장 (soul-templates.ts에 publish/unpublish 추가)
- 마켓 UI 페이지 (새 파일: agent-marketplace.tsx)
- 기존 soul-templates.tsx 수정 (발행 기능)

### 핵심 패턴 (Story 20-1과 동일 구조)

**워크스페이스 라우트 패턴** (template-market.ts 참고):
```typescript
export const workspaceAgentMarketplaceRoute = new Hono<AppEnv>()
workspaceAgentMarketplaceRoute.use('*', authMiddleware)
```

**마켓 목록 쿼리** (template-market.ts 동일):
```typescript
where(
  and(
    eq(soulTemplates.isPublished, true),
    eq(soulTemplates.isActive, true),
    or(
      isNull(soulTemplates.companyId),  // builtin
      ne(soulTemplates.companyId, tenant.companyId),  // 다른 회사
    ),
  ),
)
```

**검색**: `ilike(soulTemplates.name, '%${q}%')` 추가
**카테고리 필터**: `eq(soulTemplates.category, category)`
**티어 필터**: `eq(soulTemplates.tier, tier)`

**임포트(클론) 로직** (template-market.ts clone 참고):
```typescript
// 1. 원본 로드 (isPublished=true 검증)
// 2. 새 soulTemplates INSERT — companyId=tenant.companyId, isPublished=false, isBuiltin=false
// 3. 원본 downloadCount += 1
// sql`${soulTemplates.downloadCount} + 1`
```

**발행/취소 API** (org-templates.ts publish/unpublish 참고):
```typescript
// POST /api/admin/soul-templates/:id/publish
// companyId 일치 검증 → isPublished=true, publishedAt=now()
// POST /api/admin/soul-templates/:id/unpublish
// companyId 일치 검증 → isPublished=false
```

### 스키마 마이그레이션

soulTemplates 테이블에 추가:
```typescript
isPublished: boolean('is_published').notNull().default(false),
publishedAt: timestamp('published_at'),
downloadCount: integer('download_count').notNull().default(0),
tier: varchar('tier', { length: 20 }),  // 'manager' | 'specialist' | 'worker'
allowedTools: jsonb('allowed_tools'),   // string[] — 추천 도구 목록
```

인덱스:
```typescript
publishedIdx: index('soul_templates_published_idx').on(table.isPublished)
```

### Admin 기존 라우트에 publish/unpublish 추가

`packages/server/src/routes/admin/soul-templates.ts`에 추가:
```typescript
// POST /api/admin/soul-templates/:id/publish
// POST /api/admin/soul-templates/:id/unpublish
// 패턴: org-templates.ts의 publish/unpublish 코드 복사 + 테이블명만 변경
```

### 마켓 UI 패턴 (template-market.tsx 참고)

- 카드 그리드: name, category, tier 뱃지, description, downloadCount
- 검색바 + 카테고리 드롭다운 + 티어 드롭다운
- 미리보기 모달: Soul content (마크다운), 추천 도구 목록, 카테고리, 티어
- 임포트 버튼: "가져오기" → 성공 토스트 → soul-templates 페이지로 이동

### Admin UI 사이드바

`packages/admin/src/components/sidebar.tsx`:
- "에이전트 마켓" 메뉴 추가 (기존 "Soul 템플릿" 근처)
- `{ to: '/agent-marketplace', label: '에이전트 마켓', icon: '🤖' }`

### Admin App.tsx 라우트

```typescript
const AgentMarketplacePage = lazy(() => import('./pages/agent-marketplace'))
<Route path="/agent-marketplace" element={<AgentMarketplacePage />} />
```

### 20-1 Story에서 배운 점 (반드시 적용)

1. **N+1 쿼리 금지**: 배치 쿼리 + Map 그룹핑 사용
2. **confirm() 사용 금지**: 발행 확인은 React 모달로 (publishConfirmId 상태)
3. **Admin JWT로 workspace API 호출 가능**: authMiddleware는 admin+user JWT 모두 수용
4. **JSONB containment 연산자**: `::jsonb @>` 패턴 사용 (태그 필터)
5. **downloadCount 증가**: `sql` 템플릿 태그로 atomic increment

### Project Structure Notes

- 서버 라우트: `packages/server/src/routes/workspace/agent-marketplace.ts` (NEW)
- 서버 라우트 수정: `packages/server/src/routes/admin/soul-templates.ts` (MODIFY — publish/unpublish 추가)
- DB 스키마: `packages/server/src/db/schema.ts` (MODIFY — soulTemplates 확장)
- 서버 index: `packages/server/src/index.ts` (MODIFY — 라우트 등록)
- 관리자 UI: `packages/admin/src/pages/agent-marketplace.tsx` (NEW)
- 관리자 UI 수정: `packages/admin/src/pages/soul-templates.tsx` (MODIFY — 발행 기능)
- 관리자 사이드바: `packages/admin/src/components/sidebar.tsx` (MODIFY — 메뉴 추가)
- 관리자 App: `packages/admin/src/App.tsx` (MODIFY — 라우트 추가)

### References

- [Source: packages/server/src/db/schema.ts] — soulTemplates 테이블 정의 (lines ~816-830)
- [Source: packages/server/src/routes/admin/soul-templates.ts] — 기존 admin CRUD API
- [Source: packages/server/src/routes/workspace/soul-templates.ts] — workspace read-only API
- [Source: packages/admin/src/pages/soul-templates.tsx] — 기존 admin UI (카드 그리드, 생성/편집, 모달)
- [Source: packages/server/src/routes/workspace/template-market.ts] — **20-1 마켓 패턴 (동일 구조 재사용)**
- [Source: packages/server/src/routes/admin/org-templates.ts] — **20-1 publish/unpublish 패턴 (동일 구조 재사용)**
- [Source: packages/admin/src/pages/template-market.tsx] — **20-1 마켓 UI 패턴 (동일 구조 재사용)**
- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 20 스토리 정의

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1: soulTemplates 스키마에 isPublished, publishedAt, downloadCount, tier, allowedTools 컬럼 추가 + publishedIdx 인덱스
- Task 2: workspace/agent-marketplace.ts 생성 — GET list (검색+카테고리+티어 필터), GET detail, POST import (downloadCount 증가)
- Task 3: admin/soul-templates.ts 확장 — POST publish, POST unpublish (companyId 소유권 검증)
- Task 4: admin agent-marketplace.tsx 페이지 생성 — 카드 그리드, 검색바, 카테고리/티어 필터, 미리보기 모달(Soul내용+도구목록), 가져오기 버튼, 사이드바+라우트 등록
- Task 5: admin soul-templates.tsx 확장 — isPublished 뱃지, 마켓 공개 관리 섹션 (publish/unpublish), 발행 확인 모달
- Task 6: server index.ts에 workspaceAgentMarketplaceRoute 등록
- TypeScript 빌드 정상 (server + admin 모두 clean)

### File List
- packages/server/src/db/schema.ts -- [MODIFIED] soulTemplates에 isPublished, publishedAt, downloadCount, tier, allowedTools, publishedIdx 추가
- packages/server/src/routes/workspace/agent-marketplace.ts -- [NEW] 에이전트 마켓 API (list, detail, import)
- packages/server/src/routes/admin/soul-templates.ts -- [MODIFIED] publish, unpublish 엔드포인트 추가 + tenantMiddleware import
- packages/server/src/index.ts -- [MODIFIED] workspaceAgentMarketplaceRoute import + 라우트 등록
- packages/admin/src/pages/agent-marketplace.tsx -- [NEW] 에이전트 마켓 페이지
- packages/admin/src/pages/soul-templates.tsx -- [MODIFIED] SoulTemplate 타입 확장 + 발행 UI (뱃지, 공개관리, 확인모달)
- packages/admin/src/components/sidebar.tsx -- [MODIFIED] 에이전트 마켓 메뉴 추가
- packages/admin/src/App.tsx -- [MODIFIED] AgentMarketplacePage 라우트 추가
