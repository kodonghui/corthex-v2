# Story 13.2: 파일 채팅 첨부 — 메시지에 파일 첨부 + 인라인 표시

Status: done

## Story

As a 사용자,
I want 채팅 메시지에 파일을 첨부하여 전송할 수 있다,
so that 에이전트와 대화할 때 문서, 이미지 등을 함께 공유하고 참조할 수 있다.

## Acceptance Criteria

1. **Given** 인증된 사용자 **When** 채팅 메시지 전송 시 attachmentIds 포함 **Then** 메시지 + 첨부파일 관계 저장
2. **Given** 첨부 파일 ID 배열 **When** 파일이 같은 회사 소속 **Then** 첨부 허용 (본인 외 회사원 파일도 참조 가능)
3. **Given** 첨부 파일 ID **When** 파일이 존재하지 않거나 다른 회사 **Then** 400 에러
4. **Given** 메시지 조회 **When** GET messages API **Then** 각 메시지의 첨부파일 메타데이터도 함께 반환
5. **Given** 채팅 UI **When** 메시지 입력 영역 **Then** 파일 첨부 버튼 + 첨부 파일 미리보기 표시
6. **Given** 첨부된 메시지 렌더링 **When** 이미지 파일 **Then** 인라인 썸네일, 기타 파일은 다운로드 링크 카드
7. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: DB 스키마 — chatMessages에 attachmentIds 컬럼 추가 (AC: #1)
  - [x]`packages/server/src/db/schema.ts`에 chatMessages 테이블 `attachmentIds` 필드 추가 (`text('attachment_ids')` — JSON 문자열 배열)
  - [x]Drizzle 마이그레이션 생성 + 적용
  - [x]relations 업데이트 불필요 (JSON 문자열이므로)

- [x] Task 2: 채팅 메시지 API 수정 — 첨부 파일 지원 (AC: #1, #2, #3, #4)
  - [x]`packages/server/src/routes/workspace/chat.ts` 수정
  - [x]sendMessageSchema에 `attachmentIds: z.array(z.string().uuid()).max(5).optional()` 추가
  - [x]메시지 전송 시 attachmentIds 검증: files 테이블에서 존재 + companyId 일치 확인
  - [x]chatMessages INSERT에 attachmentIds JSON 저장
  - [x]GET messages 응답에 첨부파일 메타데이터 조인 반환
  - [x]첨부파일 5개 제한

- [x] Task 3: 프론트엔드 — 채팅 입력에 파일 첨부 UI (AC: #5)
  - [x]`packages/app/src/components/chat/chat-area.tsx` 수정
  - [x]메시지 입력 영역에 📎 파일 첨부 버튼 추가
  - [x]클릭 시 기존 files API로 업로드 → 반환된 fileId를 attachmentIds에 추가
  - [x]전송 전 첨부 파일 목록 표시 (파일명 + 크기 + 제거 버튼)
  - [x]메시지 전송 시 content + attachmentIds 함께 전송

- [x] Task 4: 프론트엔드 — 첨부 파일 렌더링 (AC: #6)
  - [x]메시지 버블 아래에 첨부 파일 카드 표시
  - [x]이미지 파일: 인라인 썸네일 (클릭 시 새 탭에서 다운로드)
  - [x]기타 파일: 아이콘 + 파일명 + 크기 + 다운로드 링크
  - [x]Message 타입에 attachments 필드 추가

- [x] Task 5: 빌드 검증 (AC: #7)
  - [x]`npx turbo build --force` → 3/3 성공

## Dev Notes

### 기존 인프라 활용

1. **chatMessages 테이블** (schema.ts:165-176)
   - id, companyId, sessionId, sender, content, createdAt
   - **attachmentIds 필드 없음** → 추가 필요
   - sessionCreatedIdx, companyIdx 인덱스 존재

2. **files 테이블 이미 구현** (schema.ts:476-488)
   - id, companyId, userId, filename, mimeType, sizeBytes, storagePath, isActive, createdAt
   - 파일 업로드/다운로드 API 완전 구현 (Story 13-1)

3. **채팅 메시지 전송 흐름** (chat.ts:120-254)
   - sendMessageSchema: `{ content: string }` → attachmentIds 추가 필요
   - 유저 메시지 INSERT (line 146-154) → attachmentIds 포함
   - GET messages (line 50-90) → 첨부파일 메타데이터 조인 필요

4. **파일 다운로드 API** — GET /api/workspace/files/:id/download 이미 존재

### 설계 결정: JSON 컬럼 vs 조인 테이블

**JSON 컬럼 선택** (attachmentIds text 필드):
- 장점: 마이그레이션 단순, 조회 시 단일 쿼리, 스키마 변경 최소
- 단점: 외래키 제약 없음 (앱 레벨에서 검증)
- 이유: 첨부파일 수 최대 5개로 제한, 역참조 불필요, 단순함 우선

### 첨부파일 검증 로직

```typescript
// 메시지 전송 시 첨부파일 검증
if (attachmentIds?.length) {
  const validFiles = await db
    .select({ id: files.id })
    .from(files)
    .where(and(
      inArray(files.id, attachmentIds),
      eq(files.companyId, tenant.companyId),
      eq(files.isActive, true),
    ))
  if (validFiles.length !== attachmentIds.length) {
    throw new HTTPError(400, '유효하지 않은 파일이 포함되어 있습니다', 'FILE_007')
  }
}
```

### 메시지 조회 시 첨부파일 메타데이터

```typescript
// GET messages 응답에 첨부파일 포함
const messagesWithAttachments = messages.map(msg => {
  const ids = msg.attachmentIds ? JSON.parse(msg.attachmentIds) : []
  return { ...msg, attachmentIds: ids }
})
// 별도 쿼리로 파일 메타데이터 조회
const allFileIds = messagesWithAttachments.flatMap(m => m.attachmentIds)
if (allFileIds.length) {
  const filesMeta = await db.select(...).from(files).where(inArray(files.id, allFileIds))
  // 메시지별 매핑
}
```

### 프론트엔드 첨부 파일 UI 패턴

```tsx
// 파일 첨부 버튼
<button onClick={() => fileInputRef.current?.click()}>
  <PaperclipIcon />
</button>
<input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} />

// 첨부 파일 미리보기 (전송 전)
{pendingAttachments.map(f => (
  <div key={f.id}>
    <span>{f.filename}</span>
    <span>{formatBytes(f.sizeBytes)}</span>
    <button onClick={() => removeAttachment(f.id)}>✕</button>
  </div>
))}
```

### 이전 스토리 교훈 (13-1)

- GET 라우트 순서: 고정 경로를 :id보다 위에 등록
- `c.req.parseBody()` — Hono 내장 multipart 파서
- path traversal 방어: `fullPath.startsWith(UPLOADS_ROOT)` 검증
- logActivity 활동 로그 기록

### Project Structure Notes

- `packages/server/src/db/schema.ts` — chatMessages 테이블 수정 (attachmentIds 추가)
- `packages/server/src/routes/workspace/chat.ts` — 메시지 API 수정
- `packages/app/src/components/chat/chat-area.tsx` — 첨부 UI + 렌더링
- `packages/app/src/components/chat/types.ts` — Message 타입 확장

### References

- [Source: packages/server/src/db/schema.ts:165-176] — chatMessages 테이블
- [Source: packages/server/src/db/schema.ts:476-488] — files 테이블
- [Source: packages/server/src/routes/workspace/chat.ts:26-28] — sendMessageSchema
- [Source: packages/server/src/routes/workspace/chat.ts:120-254] — 메시지 생성 흐름
- [Source: packages/app/src/components/chat/chat-area.tsx:453-505] — 메시지 렌더링
- [Source: packages/app/src/components/chat/types.ts:17-22] — Message 타입
- [Source: packages/server/src/routes/workspace/files.ts] — 파일 업로드/다운로드 API
