# Story 5.10: 프리셋 CRUD + 슬래시 팝업 (Preset CRUD + Slash Popup)

Status: done

## Story

As a **CEO (앱 사용자)**,
I want **자주 사용하는 명령을 프리셋으로 저장/수정/삭제하고, 슬래시(/) 입력 시 시스템 명령과 함께 프리셋 목록을 보며 빠르게 실행할 수 있는 기능**,
so that **반복적인 명령을 매번 타이핑하지 않고 원클릭으로 실행하여 업무 효율을 높일 수 있다**.

## Acceptance Criteria

1. **프리셋 CRUD API**: 프리셋의 생성/조회/수정/삭제 REST API
   - POST /api/workspace/presets — 프리셋 생성 `{ name, command, description?, category? }`
   - GET /api/workspace/presets — 사용자의 프리셋 목록 조회 (companyId + userId 기반 + isGlobal=true 포함)
   - PATCH /api/workspace/presets/:id — 프리셋 수정 (name, command, description, category, sortOrder, isActive)
   - DELETE /api/workspace/presets/:id — 프리셋 삭제 (본인 소유만)

2. **프리셋 실행 API**: 프리셋에서 바로 명령 실행
   - POST /api/workspace/presets/:id/execute — 프리셋의 command를 기반으로 명령 생성 + 실행
   - commands 테이블에 type='preset', presetId 연결
   - 실행 시 해당 프리셋의 sortOrder 증가 (자주 사용 순서 자동 반영)

3. **슬래시 팝업 프리셋 통합**: `/` 입력 시 기존 8종 시스템 명령 + 사용자 프리셋 함께 표시
   - 시스템 명령 섹션 (상단) + 프리셋 섹션 (하단) 구분
   - 검색/필터 통합 (시스템 명령 + 프리셋 동시 필터)
   - 프리셋 선택 시 command 텍스트를 입력창에 삽입 (시스템 명령과 동일 UX)
   - sortOrder 기준 정렬 (자주 사용하는 것이 위)

4. **프리셋 관리 UI**: 사령관실 내 프리셋 관리 패널/모달
   - 프리셋 목록 보기 (이름 + 명령 미리보기 + 카테고리)
   - 새 프리셋 생성 폼 (이름 + 명령 텍스트 + 설명 + 카테고리)
   - 인라인 편집 또는 편집 모달
   - 삭제 시 확인 다이얼로그
   - 프리셋에서 바로 실행 버튼 (목록에서 원클릭 실행)

5. **데이터 무결성**: 테넌트 격리 + 권한 검증
   - companyId 자동 주입 (테넌트 미들웨어)
   - 수정/삭제 시 본인 소유 검증 (userId 일치 또는 isGlobal)
   - 프리셋 이름 중복 검사 (같은 company + user 내)

## Tasks / Subtasks

- [x] Task 1: 프리셋 CRUD API 라우트 (AC: #1, #5)
  - [x] 1.1 `packages/server/src/routes/workspace/presets.ts` 라우트 생성
  - [x] 1.2 POST / — Zod 스키마 검증 + 이름 중복 체크 + INSERT
  - [x] 1.3 GET / — companyId + (userId OR isGlobal=true) 필터 + sortOrder DESC 정렬
  - [x] 1.4 PATCH /:id — 소유권 확인 + 부분 업데이트
  - [x] 1.5 DELETE /:id — 소유권 확인 + 삭제
  - [x] 1.6 워크스페이스 라우터에 마운트 (/api/workspace/presets)

- [x] Task 2: 프리셋 실행 API (AC: #2)
  - [x] 2.1 POST /:id/execute — 프리셋 조회 + command 텍스트 추출
  - [x] 2.2 commands 테이블에 type='preset' + metadata.presetId로 INSERT
  - [x] 2.3 기존 명령 처리 파이프라인(command-router → chief-of-staff) 연결
  - [x] 2.4 프리셋 sortOrder += 1 업데이트 (사용빈도 반영)

- [x] Task 3: SlashPopup 프리셋 통합 (AC: #3)
  - [x] 3.1 `packages/app/src/pages/command-center/components/slash-popup.tsx` 수정
  - [x] 3.2 프리셋 목록을 props로 받아 시스템 명령 아래에 표시
  - [x] 3.3 "명령어" / "프리셋" 섹션 라벨 구분
  - [x] 3.4 통합 검색 필터 (시스템 명령 + 프리셋 동시 검색)
  - [x] 3.5 프리셋 선택 시 command 텍스트 삽입

- [x] Task 4: usePresets 훅 (AC: #1, #3)
  - [x] 4.1 `packages/app/src/hooks/use-presets.ts` 생성
  - [x] 4.2 useQuery: GET /api/workspace/presets
  - [x] 4.3 useMutation: POST/PATCH/DELETE + 쿼리 무효화
  - [x] 4.4 executeMutation: POST /:id/execute + 명령 이력 무효화

- [x] Task 5: PresetManager 컴포넌트 (AC: #4)
  - [x] 5.1 `packages/app/src/pages/command-center/components/preset-manager.tsx` 생성
  - [x] 5.2 프리셋 목록 (이름 + 명령 미리보기 + 카테고리 뱃지 + 실행/편집/삭제 버튼)
  - [x] 5.3 생성 폼 (이름 + 명령 텍스트 textarea + 설명 + 카테고리 선택)
  - [x] 5.4 편집 모드 (인라인 또는 모달)
  - [x] 5.5 삭제 확인 다이얼로그

- [x] Task 6: CommandCenter에 PresetManager 통합 (AC: #3, #4)
  - [x] 6.1 사령관실 헤더에 "프리셋 관리" 버튼 추가
  - [x] 6.2 PresetManager 패널/모달 연결
  - [x] 6.3 CommandInput에 프리셋 목록 전달 (SlashPopup 연동)
  - [x] 6.4 프리셋 실행 시 대화 이력 업데이트

- [x] Task 7: 단위 테스트 (AC: all)
  - [x] 7.1 프리셋 CRUD 스키마 검증 테스트 (Zod 유효성)
  - [x] 7.2 프리셋 조회 필터 로직 테스트 (userId + isGlobal)
  - [x] 7.3 소유권 검증 테스트 (본인 소유만 수정/삭제)
  - [x] 7.4 프리셋 실행 → 명령 생성 로직 테스트
  - [x] 7.5 이름 중복 검사 테스트
  - [x] 7.6 sortOrder 증가 로직 테스트
  - [x] 7.7 SlashPopup 통합 필터 로직 테스트

## Dev Notes

### 기존 코드 활용 (반드시 확인)

**1. presets 테이블 스키마** (`packages/server/src/db/schema.ts:776`):
```typescript
export const presets = pgTable('presets', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  command: text('command').notNull(),
  category: varchar('category', { length: 50 }),
  isGlobal: boolean('is_global').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```
- 스키마 이미 존재 — **새 테이블 생성 불필요**
- relations도 정의됨 (presetsRelations: company, user)
- isGlobal=true인 프리셋은 같은 company 내 모든 사용자에게 표시

**2. commands 테이블 type enum** (`packages/server/src/db/schema.ts:22`):
```typescript
export const commandTypeEnum = pgEnum('command_type',
  ['direct', 'mention', 'slash', 'preset', 'batch', 'all', 'sequential', 'deepwork'])
```
- 'preset' 타입이 이미 enum에 포함됨

**3. commands.ts 라우트** (`packages/server/src/routes/commands.ts`):
- submitCommandSchema에 `presetId: z.string().uuid().nullish()` 이미 있음
- POST / 에서 presetId를 받을 수 있는 구조
- authMiddleware 적용됨 (tenant에서 companyId, userId 추출)

**4. SlashPopup 컴포넌트** (`packages/app/src/pages/command-center/components/slash-popup.tsx`):
- 현재 8종 시스템 명령 하드코딩 (SLASH_COMMANDS 배열)
- Props: `{ query, selectedIndex, onSelect, onClose }`
- 섹션 라벨 "명령어" 하나만 있음
- **수정 필요**: 프리셋을 Props로 받아 두 번째 섹션으로 추가

**5. CommandInput 컴포넌트** (`packages/app/src/pages/command-center/components/command-input.tsx`):
- SlashPopup을 import하여 사용 중
- handleSlashSelect: 선택 시 텍스트에 `/명령어 ` 삽입
- SLASH_COMMANDS를 필터링에도 사용 — 프리셋 추가 시 키보드 탐색 범위 확장 필요

**6. 워크스페이스 라우트 구조** (`packages/server/src/routes/workspace/`):
- 기존 파일: agents.ts, chat.ts, credentials.ts, jobs.ts, etc.
- 라우터 등록: 해당 디렉토리의 index.ts 또는 상위 app에서 마운트
- 기존 패턴 참조: `packages/server/src/routes/workspace/agents.ts` 등

**7. React Query 패턴** (프로젝트 전반):
```typescript
// 조회
const { data, isLoading } = useQuery({
  queryKey: ['presets'],
  queryFn: () => api.get<{ data: Preset[] }>('/workspace/presets'),
})

// 변경
const mutation = useMutation({
  mutationFn: (body) => api.post('/workspace/presets', body),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presets'] }),
})
```

**8. API 클라이언트** (`packages/app/src/lib/api.ts`):
- api.get, api.post, api.patch, api.delete 메서드 사용
- 자동으로 Authorization 헤더 첨부

### 프리셋 실행 플로우

```
1. 사용자가 프리셋 "삼성전자 주간 보고서" 클릭 (execute)
2. POST /api/workspace/presets/:id/execute
3. 서버: preset.command 텍스트 추출 → createCommand(type='preset', text=preset.command)
4. 기존 명령 파이프라인: classify → chiefOfStaff.process → 결과
5. 프리셋 sortOrder += 1 (빈도 추적)
6. 클라이언트: 명령 이력 새로고침 → 새 명령 표시
```

### SlashPopup 개선 구조

```
┌────────────────────────────┐
│  명령어                    │  ← 시스템 명령 섹션 라벨
│  📡 /전체  모든 팀장에게..  │
│  🔗 /순차  순차적으로...    │
│  ...                       │
│─────────────────────────── │
│  프리셋                    │  ← 프리셋 섹션 라벨
│  ⭐ 삼성전자 주간보고      │
│  ⭐ 시장 분석 요청         │
│  ⭐ 예산 현황 점검         │
└────────────────────────────┘
```

### 라우트 마운트 확인

워크스페이스 라우터에 새 presets 라우트를 마운트해야 함. 기존 패턴 확인:
```typescript
// packages/server/src/routes/workspace/ 내 index.ts 또는 앱 등록 부분 확인
// workspace.route('/presets', presetsRoute) 형태로 추가
```

### API 응답 형식 (프로젝트 규칙)

```typescript
// 성공
{ success: true, data: { ... } }

// 실패
{ success: false, error: { code: 'ERR_CODE', message: '...' } }
```

### 테스트 프레임워크

- bun:test (서버 단위 테스트)
- 테스트 파일 위치: `packages/server/src/__tests__/unit/`
- 파일명: `preset-crud.test.ts`
- 기존 패턴 참고: `packages/server/src/__tests__/unit/report-feedback-api.test.ts`

### Project Structure Notes

**새 파일 생성:**
```
packages/server/src/routes/workspace/presets.ts          # 프리셋 CRUD + 실행 API
packages/app/src/hooks/use-presets.ts                     # 프리셋 React Query 훅
packages/app/src/pages/command-center/components/preset-manager.tsx  # 프리셋 관리 UI
packages/server/src/__tests__/unit/preset-crud.test.ts    # API 단위 테스트
```

**수정할 기존 파일:**
- `packages/app/src/pages/command-center/components/slash-popup.tsx` — 프리셋 섹션 추가
- `packages/app/src/pages/command-center/components/command-input.tsx` — 프리셋 목록 전달 + 키보드 탐색 확장
- `packages/app/src/pages/command-center/index.tsx` — PresetManager 버튼/모달 + usePresets 연동
- 워크스페이스 라우터 등록 파일 — presets 라우트 마운트

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E5-S10] 프리셋 CRUD + 슬래시 팝업 AC
- [Source: packages/server/src/db/schema.ts:776] presets 테이블 스키마 (이미 존재)
- [Source: packages/server/src/db/schema.ts:22] commandTypeEnum에 'preset' 포함
- [Source: packages/server/src/routes/commands.ts:23] submitCommandSchema.presetId 필드
- [Source: packages/app/src/pages/command-center/components/slash-popup.tsx] 기존 SlashPopup (수정 대상)
- [Source: packages/app/src/pages/command-center/components/command-input.tsx] CommandInput (수정 대상)
- [Source: packages/app/src/pages/command-center/index.tsx] CommandCenter 페이지
- [Source: packages/server/src/routes/workspace/] 워크스페이스 라우트 디렉토리

### Previous Story Intelligence (5-9)

- ReportView + ReportDetailModal 구현 완료
- commands.ts에 3개 엔드포인트 추가됨 (feedback, cost, delegation)
- commands.metadata jsonb merge 패턴 확립
- Tabs API 수정됨 (id→value)
- 기존 commands.ts는 authMiddleware + zValidator 패턴 사용
- React Query invalidation 패턴: `queryClient.invalidateQueries({ queryKey: ['commands'] })`

### Git Recent Patterns

- 커밋 메시지 형식: `feat: Story X-Y Title -- 주요변경, N tests`
- 서비스 파일 + 테스트 파일 함께 커밋
- 모든 테스트 통과 확인 후 커밋

### 금지 사항

- presets 테이블 스키마 변경 금지 — 이미 존재하는 스키마 그대로 사용
- 기존 SlashPopup의 시스템 명령 8종을 변경/삭제하지 말 것
- stub/mock 금지 — API 호출, DB CRUD 모두 실제 동작
- 새 npm 라이브러리 설치 금지

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created
- 5 API endpoints: POST create, GET list, PATCH update, DELETE, POST execute
- Preset execute: classify preset.command without presetId → detect slash commands in text → ChiefOfStaff/All/Sequential processing
- sortOrder incremented on each execute (usage frequency tracking)
- SlashPopup enhanced: system commands section + presets section, unified search filter, keyboard navigation across both sections
- PresetManager modal: CRUD list, create/edit form, delete confirmation, execute button
- CommandInput: presets passed via props, keyboard index maps across system cmds + presets
- usePresets hook: React Query for CRUD + execute mutations with query invalidation
- Route registered: app.route('/api/workspace/presets', presetsRoute) in index.ts
- 49 unit tests passing (schema validation, ownership, duplicates, filter logic, execute logic, API response format)
- App builds cleanly (tsc + vite), 62 app tests pass, 0 regressions

### File List

**New files:**
- packages/server/src/routes/workspace/presets.ts (preset CRUD + execute API)
- packages/app/src/hooks/use-presets.ts (React Query hook)
- packages/app/src/pages/command-center/components/preset-manager.tsx (management UI modal)
- packages/server/src/__tests__/unit/preset-crud.test.ts (49 tests)

**Modified files:**
- packages/server/src/index.ts (import + route registration)
- packages/app/src/pages/command-center/components/slash-popup.tsx (presets section + getFilteredCount)
- packages/app/src/pages/command-center/components/command-input.tsx (presets props + keyboard nav)
- packages/app/src/pages/command-center/index.tsx (usePresets + PresetManager + presetItems)
