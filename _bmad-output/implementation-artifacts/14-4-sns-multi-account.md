# Story 14.4: SNS 멀티 계정

Status: done

## Story

As a 사용자,
I want 여러 개의 SNS 계정을 등록하고 콘텐츠 작성 시 발행할 계정을 선택할 수 있다,
so that 다수의 SNS 채널(같은 플랫폼 내 복수 계정 포함)을 하나의 화면에서 관리할 수 있다.

## Acceptance Criteria

1. **Given** 인증된 사용자 **When** POST /api/workspace/sns-accounts에 platform, accountName, accountId, credentials 전송 **Then** SNS 계정이 등록되고 credentials는 AES-256-GCM 암호화 저장
2. **Given** 인증된 사용자 **When** GET /api/workspace/sns-accounts **Then** 본인 회사의 SNS 계정 목록 반환 (credentials 제외)
3. **Given** 인증된 사용자 **When** PUT /api/workspace/sns-accounts/:id에 accountName, credentials 전송 **Then** 계정 정보 수정됨 (본인 회사 소유 검증)
4. **Given** 인증된 사용자 **When** DELETE /api/workspace/sns-accounts/:id **Then** 계정 삭제 (연결된 콘텐츠가 없을 때만, 있으면 400)
5. **Given** SNS 콘텐츠 생성 시 **When** snsAccountId를 지정 **Then** 해당 계정에 연결되어 저장 (nullable — 미지정 시 기존 동작 유지)
6. **Given** SNS 콘텐츠 발행 시 **When** snsAccountId가 있는 콘텐츠 **Then** 해당 계정의 credentials로 발행 시도 (publishContent에 계정 정보 전달)
7. **Given** SNS 콘텐츠 목록 **When** accountId 쿼리 파라미터 전달 **Then** 해당 계정의 콘텐츠만 필터링
8. **Given** SNS 프론트엔드 **When** 콘텐츠 생성 폼 **Then** 등록된 계정 목록에서 선택 가능 (선택 안 하면 null)
9. **Given** SNS 프론트엔드 **When** 계정 관리 섹션 **Then** 계정 추가/수정/삭제 UI 제공 (모달)
10. **Given** turbo build + type-check **When** 전체 빌드 **Then** 8/8 성공

## Tasks / Subtasks

- [x] Task 1: DB 스키마 — snsAccounts 테이블 + snsContents.snsAccountId 추가 (AC: #1, #5)
  - [x]`packages/server/src/db/schema.ts`에 snsAccounts 테이블 정의
    - id: uuid PK
    - companyId: uuid FK → companies.id (테넌트 격리)
    - platform: snsPlatformEnum (instagram, tistory, daum_cafe)
    - accountName: varchar(100) — 표시 이름 (예: "회사 공식 인스타")
    - accountId: varchar(200) — 플랫폼 상 계정 ID/핸들
    - credentials: text — AES-256-GCM 암호화된 JSON (apiKey, accessToken 등)
    - isActive: boolean default true
    - createdBy: uuid FK → users.id
    - createdAt, updatedAt: timestamp
  - [x]snsContents에 snsAccountId: uuid nullable FK → snsAccounts.id 추가
  - [x]SQL 마이그레이션 `packages/server/src/db/migrations/0022_sns-multi-account.sql`
    - CREATE TABLE sns_accounts (...)
    - ALTER TABLE sns_contents ADD COLUMN sns_account_id UUID REFERENCES sns_accounts(id)

- [x] Task 2: 서버 API — SNS 계정 CRUD (AC: #1, #2, #3, #4)
  - [x]`packages/server/src/routes/workspace/sns-accounts.ts` 신규 파일 생성
    - POST / — 계정 등록 (credentials를 encrypt() 후 저장)
    - GET / — 계정 목록 (credentials 필드 제외, isActive 포함)
    - PUT /:id — 계정 수정 (companyId 검증, credentials 재암호화)
    - DELETE /:id — 계정 삭제 (연결된 snsContents 존재 시 400)
  - [x]index.ts 또는 workspace 라우터에 sns-accounts 라우트 등록
  - [x]zod 스키마: createSnsAccountSchema, updateSnsAccountSchema

- [x] Task 3: 서버 API — 기존 SNS 라우트에 accountId 연동 (AC: #5, #6, #7)
  - [x]`packages/server/src/routes/workspace/sns.ts` 수정
    - createSnsSchema에 snsAccountId: z.string().uuid().optional() 추가
    - POST /sns 생성 시 snsAccountId 저장 (존재하면 계정 유효성 검증)
    - GET /sns 목록에 ?accountId= 필터 파라미터 추가
    - GET /sns/:id 응답에 snsAccountId + 계정 정보(accountName, platform) 포함
  - [x]sns-publisher.ts 수정
    - publishContent()에 account 정보(credentials) 파라미터 추가
    - 계정 credentials 복호화 후 플랫폼별 함수에 전달 (여전히 스텁이지만 시그니처 확장)
  - [x]sns-schedule-checker.ts 수정
    - scheduled 콘텐츠 조회 시 snsAccountId JOIN으로 계정 정보 포함
    - publishContent() 호출 시 계정 credentials 전달

- [x] Task 4: 공유 타입 — SnsAccount 타입 추가 (AC: #2)
  - [x]`packages/shared/src/types.ts` 수정
    - SnsAccount 타입 추가: { id, companyId, platform, accountName, accountId, isActive, createdAt }
    - SnsContent 타입에 snsAccountId?: string 추가

- [x] Task 5: 프론트엔드 — 계정 관리 UI + 콘텐츠 폼 연동 (AC: #8, #9)
  - [x]`packages/app/src/pages/sns.tsx` 수정
    - 계정 관리 모달 (추가/수정/삭제)
      - platform 선택 드롭다운
      - accountName, accountId 입력
      - credentials JSON 입력 (password 타입)
    - 상단에 "계정 관리" 버튼 추가
    - 콘텐츠 생성 폼(수동/AI 모두)에 계정 선택 드롭다운 추가
      - 등록된 계정 없으면 비활성 + "계정을 먼저 등록하세요" 안내
      - 선택 안 하면 snsAccountId: null (기존 동작 호환)
    - 목록에 계정별 필터 기능 (셀렉트 드롭다운)
    - 콘텐츠 카드에 계정 이름 표시 (snsAccountId 있을 때)

- [x] Task 6: 빌드 검증 (AC: #10)
  - [x]`bunx turbo build type-check` → 8/8 성공

## Dev Notes

### 기존 인프라 활용 (절대 재구현 금지)

1. **Credential Vault 암호화 패턴** (`packages/server/src/lib/credential-vault.ts`)
   - AES-256-GCM encrypt/decrypt 함수 이미 존재
   - 패턴: `encrypt(JSON.stringify({ apiKey, accessToken }))` → encrypted text 저장
   - 복호화: `JSON.parse(await decrypt(encryptedData))`
   - **주의**: credential-vault.ts의 encrypt/decrypt는 credentialVault 테이블 전용
   - snsAccounts에는 같은 crypto 함수를 직접 사용: `packages/server/src/lib/crypto.ts`의 `encrypt()`/`decrypt()`

2. **SNS API** (`packages/server/src/routes/workspace/sns.ts`, 627줄)
   - 전체 CRUD + 승인/반려/발행 워크플로 이미 구현
   - zod 스키마 패턴: `createSnsSchema`, `updateSnsSchema` 확립
   - 테넌트 격리 패턴: `eq(snsContents.companyId, tenant.companyId)`

3. **SNS 스키마** (`packages/server/src/db/schema.ts:359-381`)
   - snsContents 테이블 — snsAccountId 컬럼 없음 (이번에 추가)
   - snsPlatformEnum: `['instagram', 'tistory', 'daum_cafe']`
   - snsStatusEnum: `['draft', 'pending', 'approved', 'scheduled', 'rejected', 'published', 'failed']`

4. **sns-publisher.ts** (`packages/server/src/lib/sns-publisher.ts`, 71줄)
   - publishContent() — 스텁 (콘솔 로그 + 가짜 URL 반환)
   - SnsContentInput 타입에 account 정보 없음 (이번에 확장)

5. **sns-schedule-checker.ts** (`packages/server/src/lib/sns-schedule-checker.ts`, 117줄)
   - checkScheduledSns() — scheduled 상태 콘텐츠 폴링 (60초)
   - publishContent() 호출 시 계정 정보 전달 필요 (이번에 추가)

6. **프론트엔드** (`packages/app/src/pages/sns.tsx`, 416줄)
   - SnsContent 타입 로컬 정의 + STATUS_LABELS/COLORS 확립
   - useMutation/useQuery 패턴 확립
   - 모달 패턴: detail 상세 뷰 이미 존재

7. **공유 타입** (`packages/shared/src/types.ts:68-84`)
   - SnsContent 타입 정의 — snsAccountId 없음 (이번에 추가)
   - SnsPlatform, SnsStatus 타입 존재

### 암호화 패턴 — crypto.ts 직접 사용

```typescript
import { encrypt, decrypt } from '../lib/crypto'

// 등록 시
const encryptedCreds = await encrypt(JSON.stringify(body.credentials))
// snsAccounts에 credentials: encryptedCreds 저장

// 발행 시
const decryptedCreds = JSON.parse(await decrypt(account.credentials))
// decryptedCreds.apiKey, decryptedCreds.accessToken 사용
```

### 라우트 등록 패턴

```typescript
// packages/server/src/routes/workspace/index.ts (또는 직접 등록 위치)
import snsAccountsRoutes from './sns-accounts'
workspace.route('/sns-accounts', snsAccountsRoutes)
```

### 주의사항

- **하위 호환**: snsAccountId는 nullable — 기존 콘텐츠는 null로 유지, 새 콘텐츠도 미선택 가능
- **테넌트 격리**: snsAccounts 조회/수정/삭제 시 반드시 companyId 필터
- **삭제 보호**: 연결된 snsContents가 있는 계정은 삭제 불가 (400 에러)
- **credentials 보안**: GET 응답에 credentials 필드 절대 포함하지 않음
- **파일명 kebab-case**: `sns-accounts.ts` (PascalCase/camelCase 금지)
- **기존 마이그레이션 번호**: 0021 (14-1에서 생성) → 이번은 0022

### Project Structure Notes

- 서버: `packages/server/src/db/schema.ts` (수정 — snsAccounts 테이블 + snsContents.snsAccountId)
- 서버: `packages/server/src/db/migrations/0022_sns-multi-account.sql` (신규)
- 서버: `packages/server/src/routes/workspace/sns-accounts.ts` (신규)
- 서버: `packages/server/src/routes/workspace/sns.ts` (수정 — accountId 연동)
- 서버: `packages/server/src/lib/sns-publisher.ts` (수정 — account 시그니처 확장)
- 서버: `packages/server/src/lib/sns-schedule-checker.ts` (수정 — account JOIN)
- 공유: `packages/shared/src/types.ts` (수정 — SnsAccount 타입)
- 프론트: `packages/app/src/pages/sns.tsx` (수정 — 계정 관리 UI + 선택 드롭다운)
- DB 마이그레이션: 0022

### References

- [Source: packages/server/src/db/schema.ts#snsContents] — 기존 SNS 테이블 (snsAccountId 없음)
- [Source: packages/server/src/routes/workspace/sns.ts] — 기존 SNS API 전체 (627줄)
- [Source: packages/server/src/lib/sns-publisher.ts] — 발행 스텁 (71줄)
- [Source: packages/server/src/lib/sns-schedule-checker.ts] — 예약 발행 (117줄)
- [Source: packages/server/src/lib/crypto.ts] — AES-256-GCM encrypt/decrypt
- [Source: packages/shared/src/types.ts#SnsContent] — 공유 타입
- [Source: packages/app/src/pages/sns.tsx] — SNS 프론트엔드 (416줄)
- [Source: _bmad-output/implementation-artifacts/14-2-ai-image-gen-post.md] — 이전 스토리 (AI 이미지)
- [Source: _bmad-output/implementation-artifacts/14-1-sns-content-planning.md] — 이전 스토리 (예약 발행)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#10.7] — SNS UX 사양

### Previous Story Intelligence (14-1, 14-2)

- snsStatusEnum: draft → pending → approved → scheduled/published/failed (+ rejected)
- scheduledAt 컬럼 + cancel-schedule 엔드포인트 추가 완료 (14-1)
- imageUrl + generate-with-image + generate-image 엔드포인트 추가 완료 (14-2)
- sns-image-generator.ts: DALL-E 3 호출 + credential-vault 연동 패턴
- 활동 로그 패턴: logActivity({ companyId, type: 'sns', phase: 'end', ... })
- 프론트 패턴: aiForm 상태, useMutation, STATUS_LABELS/COLORS 확장
- sns-schedule-checker.ts: 60초 폴링, publishContent() 호출

### Git Intelligence

최근 커밋 패턴:
- `bb2377b` feat: Story 14-2 — DALL-E 3 + 부분 실패 허용 + TEA 65건
- `5068f4c` feat: Story 14-1 — scheduled 상태 + 워커 + 취소 + TEA 60건
- 패턴: feat 접두사, Story 번호 + 핵심 변경 + TEA 건수

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: schema.ts에 snsAccounts 테이블 추가 (10컬럼), snsContents에 snsAccountId FK 추가, 0022 마이그레이션 생성, relations 추가
- Task 2: sns-accounts.ts 신규 생성 — CRUD 4개 엔드포인트 (GET, POST, PUT, DELETE), AES-256-GCM 암호화, 삭제 보호(연결 콘텐츠 체크), index.ts에 라우트 등록
- Task 3: sns.ts createSnsSchema에 snsAccountId 추가, POST /sns에 계정 유효성 검증, GET /sns 목록에 accountId 필터 + accountName JOIN, GET /sns/:id에 accountName JOIN. sns-publisher.ts에 SnsAccountInfo 타입 추가. sns-schedule-checker.ts에 계정 정보 JOIN + decrypt 처리
- Task 4: shared/types.ts에 SnsAccount 타입 추가, SnsContent에 snsAccountId 추가
- Task 5: sns.tsx에 SnsAccount 타입, 계정 관리 뷰(추가/수정/삭제 모달), 계정 필터, 콘텐츠 생성 시 계정 선택 드롭다운, 상세 뷰에 계정명 표시
- Task 6: turbo build type-check 8/8 성공, 기존 SNS 테스트 182건 전부 통과

### File List

- packages/server/src/db/schema.ts (modified — snsAccounts 테이블 + snsContents.snsAccountId + relations)
- packages/server/src/db/migrations/0022_sns-multi-account.sql (new)
- packages/server/src/routes/workspace/sns-accounts.ts (new — CRUD API)
- packages/server/src/routes/workspace/sns.ts (modified — accountId 연동)
- packages/server/src/lib/sns-publisher.ts (modified — SnsAccountInfo 타입)
- packages/server/src/lib/sns-schedule-checker.ts (modified — account JOIN)
- packages/server/src/index.ts (modified — snsAccountsRoute 등록)
- packages/shared/src/types.ts (modified — SnsAccount 타입)
- packages/app/src/pages/sns.tsx (modified — 계정 관리 UI)
- packages/server/src/__tests__/unit/sns-analytics.test.ts (modified — TS 타입 수정)
