# Story 20.1: 조직 템플릿 마켓 API + UI

Status: done

## Story

As a Company Admin / CEO,
I want to browse a marketplace of organization templates published by other companies, publish my own templates, and clone useful templates into my organization,
so that I can discover proven organizational structures and quickly set up my company with best-practice team configurations.

## Acceptance Criteria

1. **마켓 브라우징 API**: GET /api/workspace/template-market에서 isPublished=true인 다른 회사 + builtin 템플릿 목록 조회 (자기 회사 제외, 키워드 검색/태그 필터 지원)
2. **마켓 상세 API**: GET /api/workspace/template-market/:id에서 공개 템플릿 상세 (templateData 포함) 조회
3. **클론 API**: POST /api/workspace/template-market/:id/clone에서 마켓 템플릿을 자기 회사 소유로 복제 (새 orgTemplate 레코드 생성, isPublished=false)
4. **발행 API**: POST /api/admin/org-templates/:id/publish에서 자기 회사 템플릿을 마켓에 공개 (isPublished=true, publishedAt 설정)
5. **발행 취소 API**: POST /api/admin/org-templates/:id/unpublish에서 마켓에서 회수 (isPublished=false)
6. **템플릿 생성 API**: POST /api/admin/org-templates에서 현재 조직 구조를 템플릿으로 저장 (기존 부서+에이전트 → templateData JSON 변환)
7. **마켓 UI (admin)**: 관리자 앱에 "템플릿 마켓" 탭 추가 — 카드 그리드, 검색, 미리보기 모달, 클론 버튼
8. **발행 UI (admin)**: 기존 org-templates 페이지에 "마켓에 공개" 토글 + "현재 조직을 템플릿으로 저장" 버튼 추가
9. **다운로드 카운트**: 클론 시 원본 템플릿의 downloadCount 증가

## Tasks / Subtasks

- [x] Task 1: 스키마 확장 (AC: #1, #9)
  - [x] 1.1 orgTemplates 테이블에 isPublished(boolean, default false), publishedAt(timestamp nullable), downloadCount(integer, default 0), tags(jsonb nullable) 컬럼 추가
  - [x] 1.2 Drizzle migration 또는 db:push로 스키마 반영

- [x] Task 2: 마켓 API — 워크스페이스 라우트 (AC: #1, #2, #3)
  - [x] 2.1 packages/server/src/routes/workspace/template-market.ts 생성
  - [x] 2.2 GET /template-market — isPublished=true AND (companyId != tenant.companyId OR isBuiltin=true) 목록. q(검색), tag(필터) 쿼리파라미터 지원
  - [x] 2.3 GET /template-market/:id — 공개 템플릿 상세 조회 (isPublished=true 검증)
  - [x] 2.4 POST /template-market/:id/clone — 원본 복제 → 자기 회사 소유 새 레코드 INSERT + 원본 downloadCount+1

- [x] Task 3: 관리자 API 확장 (AC: #4, #5, #6)
  - [x] 3.1 POST /api/admin/org-templates — 현재 조직 구조에서 templateData 자동 생성 (departments+agents 조회 → JSON 변환)
  - [x] 3.2 POST /api/admin/org-templates/:id/publish — companyId 일치 검증 → isPublished=true, publishedAt=now()
  - [x] 3.3 POST /api/admin/org-templates/:id/unpublish — companyId 일치 검증 → isPublished=false

- [x] Task 4: 마켓 UI (관리자 앱) (AC: #7)
  - [x] 4.1 packages/admin/src/pages/template-market.tsx 생성 — 마켓 카드 그리드
  - [x] 4.2 검색바 + 태그 필터 UI
  - [x] 4.3 미리보기 모달 (기존 PreviewModal 패턴 재활용) + 클론 버튼
  - [x] 4.4 사이드바에 "템플릿 마켓" 메뉴 추가 + App.tsx 라우트 등록

- [x] Task 5: 발행 UI 확장 (관리자 앱) (AC: #8)
  - [x] 5.1 기존 org-templates.tsx에 "현재 조직을 템플릿으로 저장" 버튼 추가
  - [x] 5.2 각 TemplateCard에 isPublished 상태 뱃지 + 공개/비공개 토글 버튼 추가
  - [x] 5.3 발행 확인 모달 (마켓에 공개되면 다른 회사가 복제 가능하다는 안내)

- [x] Task 6: 서버 index.ts 라우트 등록
  - [x] 6.1 template-market 워크스페이스 라우트를 app.route('/api/workspace', ...) 에 등록

## Dev Notes

### 기존 코드 현황 분석

**이미 존재하는 것:**
- `packages/server/src/db/schema.ts` — orgTemplates 테이블 (id, companyId, name, description, templateData, isBuiltin, isActive, createdBy, createdAt, updatedAt)
- `packages/server/src/services/organization.ts` — getOrgTemplates(), getOrgTemplateById(), applyTemplate() 서비스 함수
- `packages/server/src/routes/admin/org-templates.ts` — GET list, GET detail, POST apply (admin-only)
- `packages/admin/src/pages/org-templates.tsx` — 템플릿 목록 + PreviewModal + ApplyResultModal

**추가해야 할 것:**
- 스키마 확장: isPublished, publishedAt, downloadCount, tags
- 워크스페이스 마켓 라우트 (새 파일)
- 관리자 API 확장 (create, publish, unpublish)
- 마켓 UI 페이지 (새 파일)
- 기존 org-templates.tsx 수정 (발행 기능)

### 핵심 패턴

**라우트 패턴** (workspace/soul-templates.ts 참고):
```typescript
export const workspaceTemplateMarketRoute = new Hono<AppEnv>()
workspaceTemplateMarketRoute.use('*', authMiddleware)
```

**테넌트 격리**: 마켓 API는 공개 템플릿 조회이므로 companyId 필터가 반대 — 자기 회사 것은 보이지 않게 (이미 admin에서 관리하므로). builtin은 항상 표시.

**기존 Admin API 패턴** (org-templates.ts):
```typescript
orgTemplatesRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)
```

**Admin 사이드바** (packages/admin/src/components/sidebar.tsx):
- 메뉴 항목 추가 위치: 기존 "조직 템플릿" 근처에 "템플릿 마켓" 추가

**Admin App.tsx 라우트**:
- `<Route path="/template-market" element={<TemplateMarketPage />} />`

### 스키마 마이그레이션

orgTemplates 테이블에 추가:
```sql
ALTER TABLE org_templates ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE org_templates ADD COLUMN published_at TIMESTAMP;
ALTER TABLE org_templates ADD COLUMN download_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE org_templates ADD COLUMN tags JSONB;
```

Drizzle 스키마 변경:
```typescript
isPublished: boolean('is_published').notNull().default(false),
publishedAt: timestamp('published_at'),
downloadCount: integer('download_count').notNull().default(0),
tags: jsonb('tags'),  // string[]
```

### 마켓 API 쿼리 로직

**목록 조회 (GET /template-market)**:
```typescript
// 공개된 템플릿 중 자기 회사 것은 제외 (builtin은 포함)
where(
  and(
    eq(orgTemplates.isPublished, true),
    eq(orgTemplates.isActive, true),
    or(
      isNull(orgTemplates.companyId),  // builtin
      ne(orgTemplates.companyId, tenant.companyId),  // 다른 회사
    ),
  ),
)
```

**검색**: `ilike(orgTemplates.name, `%${q}%`)` 추가
**태그 필터**: `sql`arrayContains(orgTemplates.tags, [tag])`` 또는 JSON 비교

### 클론 로직

```typescript
// 1. 원본 로드 (isPublished=true 검증)
// 2. 새 레코드 INSERT — companyId=tenant.companyId, isPublished=false, isBuiltin=false
// 3. 원본 downloadCount += 1
```

### "현재 조직을 템플릿으로 저장" 로직

```typescript
// 1. 현재 회사의 departments 조회 (isActive=true)
// 2. 각 부서의 agents 조회
// 3. templateData JSON 생성: {departments: [{name, description, agents: [{name, tier, ...}]}]}
// 4. orgTemplates INSERT
```

### Project Structure Notes

- 서버 라우트: `packages/server/src/routes/workspace/template-market.ts` (NEW)
- 서버 라우트 수정: `packages/server/src/routes/admin/org-templates.ts` (MODIFY — publish/unpublish/create 추가)
- DB 스키마: `packages/server/src/db/schema.ts` (MODIFY — orgTemplates 확장)
- 서비스: `packages/server/src/services/organization.ts` (MODIFY — 마켓 서비스 함수 추가)
- 서버 index: `packages/server/src/index.ts` (MODIFY — 라우트 등록)
- 관리자 UI: `packages/admin/src/pages/template-market.tsx` (NEW)
- 관리자 UI 수정: `packages/admin/src/pages/org-templates.tsx` (MODIFY — 발행 기능)
- 관리자 사이드바: `packages/admin/src/components/sidebar.tsx` (MODIFY — 메뉴 추가)
- 관리자 App: `packages/admin/src/App.tsx` (MODIFY — 라우트 추가)

### References

- [Source: packages/server/src/db/schema.ts#L990-1004] — orgTemplates 테이블 정의
- [Source: packages/server/src/services/organization.ts#L705-800] — getOrgTemplates, getOrgTemplateById, applyTemplate
- [Source: packages/server/src/routes/admin/org-templates.ts] — 기존 admin API (list, detail, apply)
- [Source: packages/admin/src/pages/org-templates.tsx] — 기존 admin UI (PreviewModal, ApplyResultModal, TemplateCard)
- [Source: packages/server/src/routes/workspace/soul-templates.ts] — workspace route 패턴 참고
- [Source: _bmad-output/planning-artifacts/epics.md#L1359-1367] — Epic 20 스토리 정의

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1: orgTemplates 스키마에 isPublished, publishedAt, downloadCount, tags 컬럼 추가 + publishedIdx 인덱스
- Task 2: workspace/template-market.ts 생성 — GET list (검색+태그필터), GET detail, POST clone (downloadCount 증가)
- Task 3: admin/org-templates.ts 확장 — POST create (현재 조직→templateData), POST publish, POST unpublish
- Task 4: admin template-market.tsx 페이지 생성 — 카드 그리드, 검색바, 태그 필터, 미리보기 모달, 클론 버튼, 사이드바+라우트 등록
- Task 5: admin org-templates.tsx 확장 — "현재 조직을 템플릿으로 저장" 버튼+모달, isPublished 뱃지, 마켓 공개 관리 섹션 (publish/unpublish)
- Task 6: server index.ts에 workspaceTemplateMarketRoute 등록
- 29개 단위 테스트 (목록 필터 9 + 클론 4 + 발행 6 + 생성 1 + Zod 8 + 카운트 1)
- TypeScript 빌드 정상 (server + admin 모두 clean)

### File List
- packages/server/src/db/schema.ts -- [MODIFIED] orgTemplates에 isPublished, publishedAt, downloadCount, tags, publishedIdx 추가
- packages/server/src/routes/workspace/template-market.ts -- [NEW] 마켓 API (list, detail, clone)
- packages/server/src/routes/admin/org-templates.ts -- [MODIFIED] create, publish, unpublish 엔드포인트 추가
- packages/server/src/index.ts -- [MODIFIED] workspaceTemplateMarketRoute import + 라우트 등록
- packages/server/src/__tests__/unit/template-market.test.ts -- [NEW] 29개 테스트
- packages/admin/src/pages/template-market.tsx -- [NEW] 템플릿 마켓 페이지
- packages/admin/src/pages/org-templates.tsx -- [MODIFIED] OrgTemplate 타입 확장 + 발행/생성 UI
- packages/admin/src/components/sidebar.tsx -- [MODIFIED] 템플릿 마켓 메뉴 추가
- packages/admin/src/App.tsx -- [MODIFIED] TemplateMarketPage 라우트 추가
