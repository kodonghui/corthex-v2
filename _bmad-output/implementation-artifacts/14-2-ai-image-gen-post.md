# Story 14.2: AI 이미지 생성 + 자동 포스팅

Status: done

## Story

As a 사용자,
I want SNS 콘텐츠 생성 시 AI로 이미지를 자동 생성하고, 생성된 이미지를 포함한 콘텐츠를 자동으로 발행할 수 있다,
so that 별도 디자인 작업 없이 AI가 만든 이미지와 텍스트를 한번에 SNS에 게시할 수 있다.

## Acceptance Criteria

1. **Given** 인증된 사용자 **When** POST /api/workspace/sns/generate-with-image에 platform, agentId, topic, imagePrompt 전송 **Then** AI가 텍스트 콘텐츠 + 이미지를 생성하여 SNS 콘텐츠로 저장 (status: draft, imageUrl에 생성된 이미지 URL)
2. **Given** 인증된 사용자 **When** POST /api/workspace/sns/:id/generate-image에 imagePrompt 전송 **Then** 기존 콘텐츠에 AI 이미지가 생성되어 imageUrl에 저장됨 (draft/rejected 상태만)
3. **Given** approved 상태 콘텐츠 + imageUrl 존재 **When** POST /api/workspace/sns/:id/publish **Then** 이미지 포함하여 플랫폼에 발행 (기존 publishContent 스텁 활용)
4. **Given** scheduled 상태 + imageUrl 존재 **When** 예약 시간 도달 **Then** sns-schedule-checker가 이미지 포함하여 자동 발행
5. **Given** AI 이미지 생성 요청 **When** OpenAI API 키 미등록 **Then** 400 에러 + "OpenAI API 키가 등록되지 않았습니다" 메시지
6. **Given** AI 이미지 생성 요청 **When** 이미지 생성 실패 (API 오류 등) **Then** 콘텐츠는 imageUrl 없이 저장 + 에러 메시지 반환 (전체 요청 실패 아님)
7. **Given** SNS 생성 폼 (AI 모드) **When** 사용자가 이미지 프롬프트 입력란에 텍스트 입력 **Then** AI 생성 시 이미지도 함께 생성됨
8. **Given** 콘텐츠 상세 뷰 **When** imageUrl 존재 **Then** 이미지 미리보기 표시
9. **Given** draft/rejected 상태 콘텐츠 **When** 상세 뷰에서 "이미지 생성" 버튼 클릭 **Then** POST /api/workspace/sns/:id/generate-image 호출
10. **Given** turbo build + type-check **When** 전체 빌드 **Then** 8/8 성공

## Tasks / Subtasks

- [x] Task 1: 서버 — AI 이미지 생성 유틸 함수 (AC: #1, #5, #6)
  - [x] `packages/server/src/lib/sns-image-generator.ts` 신규 생성
    - `generateSnsImage(prompt: string, companyId: string): Promise<{ imageUrl: string | null; error?: string }>`
    - 기존 `generate-image.ts` 내장 도구의 OpenAI DALL-E 3 호출 로직 재사용 (getCredentials 패턴)
    - credential-vault에서 'openai' 크레덴셜 조회 (companyId 기반)
    - 성공 시 imageUrl 반환, 실패 시 null + error 반환 (부분 실패 허용)
    - 프롬프트 최대 4000자 검증

- [x] Task 2: 서버 API — generate-with-image + generate-image 엔드포인트 (AC: #1, #2, #5, #6)
  - [x] POST /api/workspace/sns/generate-with-image 신규 엔드포인트
    - 스키마: `{ platform, agentId, topic, imagePrompt?: string }`
    - 텍스트 생성: 기존 generateAgentResponse() 활용 (기존 /sns/generate 로직 동일)
    - 이미지 생성: imagePrompt가 있으면 sns-image-generator 호출
    - 이미지 실패해도 텍스트 콘텐츠는 저장 (imageUrl: null)
    - 응답에 imageGenerationError 필드 포함 (이미지 실패 시)
  - [x] POST /api/workspace/sns/:id/generate-image 신규 엔드포인트
    - 스키마: `{ imagePrompt: z.string().min(1).max(4000) }`
    - 기존 콘텐츠의 draft/rejected 상태 검증
    - 본인 소유 검증 (createdBy === tenant.userId)
    - 이미지 생성 후 imageUrl 업데이트
    - 활동 로그 기록

- [x] Task 3: 프론트엔드 — AI 생성 모드에 이미지 프롬프트 추가 (AC: #7)
  - [x] `packages/app/src/pages/sns.tsx` 수정
    - aiForm에 `imagePrompt: string` 필드 추가
    - AI 생성 모드에 "이미지 설명 (선택)" 입력란 추가
    - generateAi mutation의 mutationFn을 `/workspace/sns/generate-with-image`로 변경
    - 이미지 생성 실패 시 토스트/인라인 경고 표시

- [x] Task 4: 프론트엔드 — 이미지 미리보기 + 개별 이미지 생성 (AC: #8, #9)
  - [x] 상세 뷰에 이미지 미리보기 추가
    - detail.imageUrl이 있으면 `<img>` 태그로 미리보기 표시
    - 둥근 모서리, max-width 100%, 로딩 상태
  - [x] 상세 뷰에 "이미지 생성" 버튼 추가
    - draft/rejected 상태일 때만 표시
    - imagePrompt 입력 다이얼로그 (간단한 인라인 입력)
    - generateImage mutation 추가 (POST /sns/:id/generate-image)
    - 성공 시 detail 쿼리 무효화로 이미지 반영

- [x] Task 5: 빌드 검증 (AC: #10)
  - [x] `bunx turbo build type-check` → 8/8 성공

## Dev Notes

### 기존 인프라 활용 (절대 재구현 금지)

1. **generate-image.ts 도구** (`packages/server/src/lib/tool-handlers/builtins/generate-image.ts`)
   - DALL-E 3 호출 로직이 이미 구현되어 있음
   - `ctx.getCredentials('openai')` 패턴으로 API 키 조회
   - 하지만 이 함수는 ToolHandler 시그니처 (input, ctx)로 되어있어 직접 재사용 불가
   - **해결**: 핵심 로직(fetch → OpenAI API)만 추출하여 `sns-image-generator.ts`에 독립 함수로 생성
   - credential 조회: `packages/server/src/lib/credential-vault.ts`의 getDecryptedCredential 함수 사용

2. **SNS API** (`packages/server/src/routes/workspace/sns.ts`)
   - 기존 POST /sns/generate 엔드포인트가 AI 텍스트 생성 로직 보유
   - generateAgentResponse() → 파싱 → DB 저장 패턴 확립
   - imageUrl 필드는 snsContents 테이블에 이미 존재 (text('image_url'))

3. **SNS 스키마** (`packages/server/src/db/schema.ts:360-381`)
   - snsContents.imageUrl은 이미 nullable text 컬럼으로 존재
   - DB 마이그레이션 불필요

4. **SNS 프론트엔드** (`packages/app/src/pages/sns.tsx`)
   - SnsContent 타입에 imageUrl 이미 포함
   - useMutation/useQuery 패턴 확립
   - aiForm 상태 관리 패턴 확립

5. **sns-publisher.ts** — publishContent()는 이미 imageUrl을 input으로 받음
6. **sns-schedule-checker.ts** — publishContent() 호출 시 이미 imageUrl 전달

### Credential Vault 패턴

```typescript
// credential-vault.ts에서 조회
import { db } from '../db'
import { credentialVault } from '../db/schema'
import { decrypt } from './crypto'
import { eq, and } from 'drizzle-orm'

// companyId 기반으로 'openai' 크레덴셜 조회
const [cred] = await db
  .select()
  .from(credentialVault)
  .where(and(
    eq(credentialVault.companyId, companyId),
    eq(credentialVault.service, 'openai'),
  ))
  .limit(1)

if (!cred) throw new Error('OpenAI API 키가 등록되지 않았습니다')
const decrypted = JSON.parse(await decrypt(cred.encryptedData))
// decrypted.api_key 사용
```

### 주의사항

- **이미지 생성은 부분 실패 허용**: AI 텍스트 생성 성공 + 이미지 실패 → 콘텐츠는 저장, 이미지만 null
- **DALL-E 3 타임아웃**: 60초 (AbortSignal.timeout)
- **이미지 프롬프트 길이**: 최대 4000자 (DALL-E 3 제한)
- **이미지 URL 유효기간**: DALL-E가 반환하는 URL은 임시 URL (1시간 유효). v2에서는 스텁이므로 문제없지만, 실서비스에서는 S3 업로드 필요. 현재는 임시 URL 그대로 저장.
- **테넌트 격리**: 크레덴셜 조회 시 companyId 필터 필수
- **파일명 kebab-case**: `sns-image-generator.ts` (snake_case/camelCase 금지)

### Project Structure Notes

- 서버: `packages/server/src/lib/sns-image-generator.ts` (신규)
- 서버: `packages/server/src/routes/workspace/sns.ts` (수정 — 2개 엔드포인트 추가)
- 프론트: `packages/app/src/pages/sns.tsx` (수정 — 이미지 프롬프트 + 미리보기)
- DB 마이그레이션 불필요 (imageUrl 컬럼 이미 존재)

### References

- [Source: packages/server/src/lib/tool-handlers/builtins/generate-image.ts] — DALL-E 3 호출 패턴
- [Source: packages/server/src/routes/workspace/sns.ts] — 기존 SNS API 전체
- [Source: packages/server/src/db/schema.ts#snsContents] — SNS 테이블 스키마 (imageUrl 이미 존재)
- [Source: packages/server/src/lib/sns-publisher.ts] — 발행 스텁 (imageUrl input 이미 지원)
- [Source: packages/server/src/lib/sns-schedule-checker.ts] — 예약 발행 (imageUrl 전달)
- [Source: packages/app/src/pages/sns.tsx] — SNS 프론트엔드
- [Source: _bmad-output/implementation-artifacts/14-1-sns-content-planning.md] — 이전 스토리 컨텍스트

### Previous Story Intelligence (14-1)

- snsStatusEnum에 'scheduled' 추가 완료, scheduledAt 컬럼 추가 완료
- approve 엔드포인트에서 scheduledAt 분기 로직 확립
- 프론트에서 datetime-local input 패턴, STATUS_LABELS/COLORS 확장 패턴 확인
- sns-schedule-checker.ts의 checkScheduledSns()가 publishContent() 호출하며 imageUrl 포함
- 활동 로그 기록 패턴: logActivity({ companyId, type: 'sns', phase: 'end', ... })

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: sns-image-generator.ts 신규 생성 — generateSnsImage() 함수 (DALL-E 3 호출, credential-vault 연동, 부분 실패 허용)
- Task 2: sns.ts에 2개 엔드포인트 추가 — POST /sns/generate-with-image (AI 텍스트+이미지 동시 생성), POST /sns/:id/generate-image (기존 콘텐츠에 이미지 추가)
- Task 3: sns.tsx AI 생성 모드에 imagePrompt 필드 추가, mutationFn을 generate-with-image로 변경
- Task 4: sns.tsx 상세 뷰에 이미지 미리보기(img 태그) + "이미지 생성" 버튼 + 인라인 프롬프트 입력 UI
- Task 5: turbo build type-check 8/8 성공

### File List

- packages/server/src/lib/sns-image-generator.ts (new)
- packages/server/src/routes/workspace/sns.ts (modified)
- packages/app/src/pages/sns.tsx (modified)
