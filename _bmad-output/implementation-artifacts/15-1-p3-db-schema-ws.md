# Story 15.1: P3 DB Schema + WebSocket Events

Status: done

## Story

As a CORTHEX platform,
I want P3 phase database tables and WebSocket event types created,
so that Epic 15-18 stories have the foundational schema and real-time infrastructure ready.

## Acceptance Criteria

1. **Given** schema.ts **When** `soulTemplates` table defined **Then** columns: id(uuid PK), companyId(FK nullable - null=built-in), name(varchar 100), description(text), content(text), category(varchar 50), isBuiltin(boolean default false), isActive(boolean default true), createdBy(uuid FK users nullable), createdAt, updatedAt + companyIdx index
2. **Given** schema.ts **When** soulTemplatesRelations 정의 **Then** company(FK companies), creator(FK users) one-to-one 관계 설정
3. **Given** SQL migration **When** 0024_p3-schema-ws.sql 생성 **Then** soul_templates 테이블 CREATE + 인덱스 DDL 포함
4. **Given** shared/types.ts **When** SoulTemplate 타입 추가 **Then** `{ id, companyId, name, description, content, category, isBuiltin, isActive, createdBy, createdAt, updatedAt }` 타입 export
5. **Given** shared/types.ts **When** WsChannel 타입 **Then** 기존 7개 채널 유지 (P3에서 새 WS 채널 추가 불필요 - 기존 agent-status/messenger 채널로 충분)
6. **Given** turbo build + type-check **When** 전체 빌드 **Then** 8/8 성공

## Tasks / Subtasks

- [x] Task 1: DB 스키마 — soulTemplates 테이블 추가 (AC: #1, #2)
  - [x] `packages/server/src/db/schema.ts` — canvasLayouts 뒤에 soulTemplates pgTable 추가
    - id: uuid PK defaultRandom
    - companyId: uuid FK companies nullable (null = 플랫폼 내장 템플릿)
    - name: varchar(100) notNull
    - description: text
    - content: text notNull (마크다운 소울 내용)
    - category: varchar(50) — 'marketer', 'analyst', 'developer', 'secretary', 'researcher', 'custom'
    - isBuiltin: boolean notNull default(false) — true면 수정/삭제 불가
    - isActive: boolean notNull default(true)
    - createdBy: uuid FK users nullable (내장 템플릿은 null)
    - createdAt: timestamp notNull defaultNow
    - updatedAt: timestamp notNull defaultNow
    - index: companyIdx on companyId
  - [x] soulTemplatesRelations 추가: company(one→companies), creator(one→users)

- [x] Task 2: SQL 마이그레이션 생성 (AC: #3)
  - [x] `packages/server/src/db/migrations/0024_p3-schema-ws.sql` 생성
    ```sql
    CREATE TABLE IF NOT EXISTS "soul_templates" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "company_id" uuid,
      "name" varchar(100) NOT NULL,
      "description" text,
      "content" text NOT NULL,
      "category" varchar(50),
      "is_builtin" boolean NOT NULL DEFAULT false,
      "is_active" boolean NOT NULL DEFAULT true,
      "created_by" uuid,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "soul_templates_company_idx" ON "soul_templates" ("company_id");
    ALTER TABLE "soul_templates" ADD CONSTRAINT "soul_templates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
    ALTER TABLE "soul_templates" ADD CONSTRAINT "soul_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
    ```

- [x] Task 3: 공유 타입 업데이트 (AC: #4)
  - [x] `packages/shared/src/types.ts` 수정
    - SoulTemplate 타입 추가:
      ```typescript
      export type SoulTemplate = {
        id: string
        companyId: string | null
        name: string
        description: string | null
        content: string
        category: string | null
        isBuiltin: boolean
        isActive: boolean
        createdBy: string | null
        createdAt: Date
        updatedAt: Date
      }
      ```

- [x] Task 4: WebSocket 채널 확인 (AC: #5)
  - [x] WsChannel 타입 검토 — 현재 7채널(chat-stream, agent-status, notifications, messenger, activity-log, strategy-notes, night-job) 이 P3 Epic 15 스토리에 충분한지 확인
  - [x] 변경 불필요 확인: 소울 템플릿 CRUD는 REST API만 사용, 실시간 구독 불필요
  - [x] 시스템 모니터링(15-4)은 REST polling 방식 (WS 불필요)

- [x] Task 5: 빌드 검증 (AC: #6)
  - [x] `bunx turbo build type-check` -> 8/8 성공

## Dev Notes

### 기존 인프라 활용 (절대 재구현 금지)

1. **schema.ts 패턴** (`packages/server/src/db/schema.ts`, 793줄)
   - 모든 테이블: uuid PK + defaultRandom, companyId FK, createdAt/updatedAt timestamp
   - 인덱스 함수: `(table) => ({ companyIdx: index('...').on(table.companyId) })`
   - relations: `relations(tableName, ({ one, many }) => ({...}))` 패턴
   - nullable FK: `.references(() => table.id)` (nullable 기본)
   - non-null FK: `.notNull().references(() => table.id)`

2. **마이그레이션 번호** — 0024 (마지막 0023_sns-ab-test.sql 다음)
   - 수동 SQL 작성 (drizzle-kit generate 아님)
   - `CREATE TABLE IF NOT EXISTS` + `CREATE INDEX IF NOT EXISTS` 패턴
   - FK 제약조건: `ALTER TABLE ... ADD CONSTRAINT` 패턴

3. **공유 타입 패턴** (`packages/shared/src/types.ts`, 192줄)
   - export type으로 정의, Date 타입 사용
   - nullable 필드: `string | null`

4. **WebSocket 인프라** (`packages/server/src/ws/`)
   - 7채널 멀티플렉싱: channels.ts handleSubscription + broadcastToChannel/broadcastToCompany
   - WsChannel 타입: packages/shared/src/types.ts:136
   - P3에서 새 채널 추가 불필요 — 소울 템플릿은 REST CRUD만, 모니터링은 폴링

### soul_templates 테이블 설계 배경

- **companyId nullable**: null = 플랫폼 내장 템플릿(5개). 값 있으면 해당 회사 커스텀 템플릿
- **isBuiltin**: UX 스펙에서 내장 5개(마케터, 분석가, 개발자, 비서, 연구원) 수정/삭제 불가
- **createdBy nullable**: 내장 템플릿은 시스템이 생성 → null. 커스텀은 관리자 ID
- **content**: 마크다운 소울 텍스트 (에이전트 soul 필드와 같은 형식)
- **category**: 빠른 필터링용. 내장: 'marketer'/'analyst'/'developer'/'secretary'/'researcher'. 커스텀: 'custom' 또는 관리자가 지정

### 이전 마이그레이션 0016에서 soul_templates DROP 이력

- migration 0016_unusual_northstar.sql에서 `DROP TABLE "soul_templates" CASCADE` 실행됨
- Epic 14-18 revert 때 제거된 것으로, 이번에 다시 생성 필요
- 이전 스키마와 동일 구조지만, 이번엔 BMAD 워크플로우를 통해 정식 생성

### 주의사항

- **파일명 kebab-case**: 0024_p3-schema-ws.sql
- **import 순서**: schema.ts 하단 relations 섹션에 soulTemplatesRelations 추가
- **테이블 번호**: 기존 29번(agentDelegationRules) 다음 → 30번 사용
- **FK nullable 주의**: companyId와 createdBy 모두 `.references()` (notNull 아님)
- **기존 agents.soul 필드와의 관계**: 소울 템플릿은 별도 테이블. 에이전트 편집 시 템플릿 content를 agents.soul에 복사하는 방식 (FK 관계 아님, 스냅샷 복사)

### Project Structure Notes

- 서버: `packages/server/src/db/schema.ts` (수정 — soulTemplates 테이블 + relations 추가)
- 서버: `packages/server/src/db/migrations/0024_p3-schema-ws.sql` (신규)
- 공유: `packages/shared/src/types.ts` (수정 — SoulTemplate 타입 추가)

### References

- [Source: packages/server/src/db/schema.ts:1-793] — 전체 스키마 (29 테이블 + relations)
- [Source: packages/server/src/db/migrations/0023_sns-ab-test.sql] — 최신 마이그레이션 (0024 다음 번호)
- [Source: packages/server/src/db/migrations/0016_unusual_northstar.sql:7-13] — soul_templates DROP 이력
- [Source: packages/shared/src/types.ts:135-157] — WsChannel/WsInbound/WsOutbound 타입
- [Source: packages/server/src/ws/channels.ts:1-170] — 7채널 구독 핸들러
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:522-535] — 소울 템플릿 UX 스펙
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:467] — Admin 소울 템플릿 라우트
- [Source: _bmad-output/implementation-artifacts/14-5-ab-test-optimize.md] — 이전 스토리 패턴 참조

### Previous Story Intelligence (Epic 14)

- 마이그레이션 패턴: 수동 SQL DDL (CREATE TABLE + INDEX + FK ALTER)
- schema.ts: pgTable 정의 → relations 정의 (파일 하단)
- shared/types.ts: export type 정의 (nullable은 `| null`)
- 빌드 검증: `bunx turbo build type-check` → 8/8 성공 필수
- 커밋 패턴: `feat: Story 15-1 ...` 형식

### Git Intelligence

최근 커밋:
- `7f1877d` docs: Epic 14 회고 — SNS 파이프라인 5/5 스토리 100%
- `ac92d05` feat: Story 14-5 — A/B 테스트, variantOf FK, migration 0023
- 패턴: 스키마 변경 시 schema.ts + migration SQL + shared types 동시 수정

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: schema.ts에 soulTemplates pgTable 추가 (30번 테이블, canvasLayouts 뒤). 11 컬럼 (id, companyId nullable, name, description, content, category, isBuiltin, isActive, createdBy nullable, createdAt, updatedAt) + companyIdx. soulTemplatesRelations 추가 (company, creator)
- Task 2: 0024_p3-schema-ws.sql 마이그레이션 생성. CREATE TABLE + INDEX + FK 2개 (companies, users)
- Task 3: shared/types.ts에 SoulTemplate 타입 export 추가 (nullable 필드 3개: companyId, description, createdBy)
- Task 4: WsChannel 7개 채널 유지 확인. P3 Epic 15 스토리에 새 WS 채널 불필요 (소울 템플릿=REST, 모니터링=폴링)
- Task 5: turbo build type-check 8/8 성공. 테스트 15건 전체 통과

### File List

- packages/server/src/db/schema.ts (modified — soulTemplates 테이블 + soulTemplatesRelations 추가)
- packages/server/src/db/migrations/0024_p3-schema-ws.sql (new — soul_templates DDL)
- packages/shared/src/types.ts (modified — SoulTemplate 타입 추가)
- packages/server/src/__tests__/unit/p3-schema-ws.test.ts (new — 15건)
