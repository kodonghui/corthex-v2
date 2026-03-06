# Story 16.6: P4 메신저 파일 첨부

Status: done

## Story

As a workspace user (직원),
I want to attach files (images, documents) to messenger messages,
so that I can share files directly in channel conversations without leaving the messenger.

## Acceptance Criteria

1. **Given** 메신저 채팅 입력 영역 **When** 📎 버튼 클릭 **Then** 파일 선택 다이얼로그 표시. accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip". 이미지 10MB, 문서 50MB 제한. 메시지당 최대 5개 파일
2. **Given** 파일 선택 후 **When** 업로드 진행 중 **Then** 입력 영역 위에 대기 중인 첨부 파일 프리뷰 표시 (파일명 + 크기 + X 제거 버튼). 업로드 중 프로그레스 바 표시
3. **Given** 첨부 파일 포함 메시지 전송 **When** 서버에 도달 **Then** attachmentIds 배열 유효성 검증 (파일 존재 + 같은 companyId + isActive=true). 유효하지 않은 파일 → 400 FILE_007 에러
4. **Given** 이미지 첨부 메시지 **When** 채팅 영역에 렌더링 **Then** 인라인 썸네일 표시 (max-w-64, 클릭 시 새 탭에서 원본 다운로드)
5. **Given** 문서 첨부 메시지 **When** 채팅 영역에 렌더링 **Then** 문서 카드 표시: `border border-zinc-700 rounded-lg p-3` + 파일 타입 아이콘(pdf=red, xls=green, doc=blue, zip=gray, other=📎) + 파일명 + 크기 + 다운로드 버튼
6. **Given** 드래그 앤 드롭 **When** 파일을 채팅 입력 영역에 드롭 **Then** 자동 업로드 시작 + 대기열에 추가
7. **Given** 50MB 초과 파일 **When** 선택 또는 드롭 **Then** Toast "파일 크기 초과 (최대 50MB)" 즉시 표시
8. **Given** WebSocket 실시간 메시지 **When** 첨부 파일 포함 메시지 수신 **Then** attachments 메타데이터 포함하여 즉시 렌더링
9. **Given** 스레드 답장 **When** 스레드에서 파일 첨부 **Then** 동일한 파일 첨부 기능 동작
10. **Given** turbo build + type-check **When** 전체 빌드 **Then** 8/8 success

## Tasks / Subtasks

- [x] Task 1: DB 스키마 — messengerMessages에 attachmentIds 컬럼 추가 (AC: #3)
  - [x] `packages/server/src/db/schema.ts` — messengerMessages 테이블에 `attachmentIds: text('attachment_ids')` 추가 (JSON 문자열 배열, nullable)
  - [x] 마이그레이션 SQL 생성: `ALTER TABLE messenger_messages ADD COLUMN attachment_ids TEXT;`
  - [x] `packages/server/src/db/migrations/0028_messenger-file-attach.sql` 신규 생성
  - [x] `meta/_journal.json` 업데이트

- [x] Task 2: 서버 API — 메시지 전송에 attachmentIds 지원 (AC: #3, #8)
  - [x] `sendMessageSchema`에 `attachmentIds: z.array(z.string().uuid()).max(5).optional()` 추가
  - [x] 파일 유효성 검증 로직 추가: files 테이블에서 존재 + companyId 일치 + isActive=true 확인
  - [x] 유효하지 않은 파일 → `throw new HTTPError(400, '유효하지 않은 파일이 포함되어 있습니다', 'FILE_007')`
  - [x] INSERT 시 `JSON.stringify(attachmentIds)` 저장
  - [x] WebSocket 브로드캐스트에 attachments 메타데이터 포함

- [x] Task 3: 서버 API — 메시지 조회에 첨부 파일 메타데이터 포함 (AC: #4, #5)
  - [x] GET messages 응답에서 attachmentIds 파싱 → files 테이블 JOIN → `{ id, filename, mimeType, sizeBytes }` 반환
  - [x] 스레드 메시지 조회에도 동일 적용

- [x] Task 4: 프론트엔드 — 파일 첨부 UI (AC: #1, #2, #6, #7)
  - [x] Message 타입에 `attachments?: { id: string; filename: string; mimeType: string; sizeBytes: number }[]` 추가
  - [x] 메시지 입력 영역에 📎 버튼 추가 (전송 버튼 왼쪽)
  - [x] `<input type="file" ref={fileInputRef} hidden multiple />` + accept 속성 설정
  - [x] `pendingFiles` 상태 관리 (업로드 완료된 파일 목록)
  - [x] 업로드: POST `/api/workspace/files` → 성공 시 pendingFiles에 추가
  - [x] 입력 영역 위에 첨부 파일 프리뷰 카드 (파일명 + 크기 + X 제거)
  - [x] 50MB 초과 시 Toast 표시
  - [x] 드래그 앤 드롭: 채팅 입력 영역에 onDragOver/onDrop 이벤트 핸들러
  - [x] 전송 시 content + attachmentIds 함께 POST

- [x] Task 5: 프론트엔드 — 첨부 파일 렌더링 (AC: #4, #5)
  - [x] 이미지 파일 (mimeType.startsWith('image/')): `<img>` 인라인 썸네일, max-w-64 rounded-lg, 클릭 시 `/api/workspace/files/${id}/download` 새 탭
  - [x] 문서 파일: 카드 UI — `border border-zinc-700 rounded-lg p-3 flex items-center gap-3`
  - [x] 파일 타입 아이콘: pdf=빨강, xls/xlsx=초록, doc/docx=파랑, zip=회색, 기타=📎
  - [x] 파일명 + 사이즈 포맷 (KB/MB) + 다운로드 버튼
  - [x] 스레드 패널 메시지에도 동일 렌더링

- [x] Task 6: 스레드 파일 첨부 (AC: #9)
  - [x] 스레드 패널 입력에도 동일한 📎 버튼 + 파일 업로드 + 첨부 기능
  - [x] 스레드 메시지 렌더링에도 첨부 파일 표시

- [x] Task 7: 빌드 검증 (AC: #10)
  - [x] `bunx turbo build type-check` → 8/8 success

## Dev Notes

### Existing Infrastructure (DO NOT re-implement)

1. **파일 업로드 API** (`packages/server/src/routes/workspace/files.ts`)
   - `POST /api/workspace/files` — 10MB 제한, multipart 업로드, files 테이블 INSERT
   - `GET /api/workspace/files/:id/download` — 스트리밍 다운로드, UTF-8 파일명, companyId 검증
   - `DELETE /api/workspace/files/:id` — 소프트 삭제 (isActive=false)
   - **이 API를 그대로 재사용** (UX 스펙: "Reuse POST /api/workspace/files (P2 infrastructure)")

2. **파일 스토리지** (`packages/server/src/lib/file-storage.ts`)
   - 저장 경로: `uploads/{companyId}/{yyyy-mm}/{uuid}.{ext}`
   - `saveFile(buffer, filename, companyId)` → `{ storagePath, savedFilename }`
   - 경로 탐색 방지: `fullPath.startsWith(UPLOADS_ROOT)` 검증
   - **이미 완성, 수정 불필요**

3. **files DB 테이블** (`packages/server/src/db/schema.ts:509-522`)
   ```
   files: id(uuid PK), companyId(FK), userId(FK), filename(varchar 255),
   mimeType(varchar 100), sizeBytes(int), storagePath(text), isActive(bool), createdAt
   ```

4. **채팅 파일 첨부 패턴** (Story 13-2, `packages/server/src/routes/workspace/chat.ts`)
   - `attachmentIds: text('attachment_ids')` — JSON 문자열 배열 (FK 없음, 최대 5개)
   - 유효성 검증: `inArray(files.id, attachmentIds)` + companyId + isActive
   - 에러: `HTTPError(400, '유효하지 않은 파일이 포함되어 있습니다', 'FILE_007')`
   - **이 패턴을 메신저에도 동일하게 적용**

5. **메신저 API** (`packages/server/src/routes/workspace/messenger.ts`)
   - sendMessageSchema: `{ content: z.string(), parentMessageId: z.string().uuid().optional() }`
   - GET messages: main messages (parentMessageId IS NULL) + replyCount + reactions
   - WebSocket broadcast: `messenger::{channelId}`
   - Push 알림: 오프라인 유저에게 web-push (Story 16-5)

6. **메신저 UI** (`packages/app/src/pages/messenger.tsx`)
   - 인라인 컴포넌트 패턴 (1100줄+, 분리하지 않음)
   - Message 타입: `{ id, userId, userName, content, parentMessageId, createdAt, replyCount, reactions }`
   - 입력 영역: textarea + 전송 버튼
   - 모바일 반응형: showChat 토글 (Story 16-5)

### API 구현 주의사항

- **attachmentIds 저장 방식**: chat.ts와 동일하게 `text('attachment_ids')` + JSON.stringify
- **파일 유효성 검증**: 반드시 files 테이블에서 (존재 + companyId + isActive) 3중 확인
- **응답에 파일 메타데이터 포함**: attachmentIds 파싱 → files 테이블 SELECT → `{ id, filename, mimeType, sizeBytes }` 반환
- **WebSocket 브로드캐스트**: 메시지와 함께 attachments 메타데이터 포함 (수신자가 별도 API 호출 불필요)
- **파일 크기 제한**: 기존 files API는 10MB 제한이지만, UX 스펙은 문서 50MB 허용. 파일 API의 크기 제한을 50MB로 올리거나, 메신저 전용 업로드 엔드포인트 검토 필요. 가장 간단한 방법: files.ts의 기존 10MB 제한을 50MB로 확장
- **signed URL**: UX 스펙에 24시간 만료 signed URL 언급 있으나, 현재 files API는 직접 다운로드. P4 범위에서는 기존 다운로드 API 재사용 (인증 기반 접근 제어로 충분)

### 프론트엔드 구현 주의사항

- **파일 첨부 패턴**: chat.tsx의 파일 첨부 코드 참조 (13-2에서 구현)
- **📎 버튼 위치**: 전송 버튼 왼쪽, 기존 아이콘 스타일과 통일
- **pendingAttachments 상태**: 업로드 완료 전 메시지 전송 방지 (uploading 플래그 체크)
- **파일 크기 표시**: `sizeBytes < 1024 → 'B'`, `< 1048576 → 'KB'`, else `'MB'`
- **드래그 앤 드롭**: onDragOver에 `e.preventDefault()` 필수, onDrop에서 `e.dataTransfer.files` 순회
- **Toast**: 기존 toast 시스템 사용 (packages/app/src에 있는 toast 유틸)
- **스레드 입력**: 메인 입력과 동일한 파일 첨부 로직. 코드 중복 최소화를 위해 인라인 헬퍼 함수로 추출

### 보안 고려사항

- 파일 업로드: companyId 테넌트 격리 (기존 files API가 처리)
- 파일 다운로드: 인증 필수 (기존 files API가 처리)
- attachmentIds 검증: 타사 회사 파일 참조 방지 (companyId 매칭)
- XSS: 파일명 렌더링 시 React 자동 이스케이프 (textContent)

### Project Structure Notes

```
packages/server/
├── src/
│   ├── db/
│   │   ├── schema.ts                      ← messengerMessages에 attachment_ids 컬럼 추가
│   │   └── migrations/
│   │       └── 0028_messenger-file-attach.sql  ← 신규 마이그레이션
│   ├── routes/workspace/
│   │   ├── messenger.ts                   ← sendMessage에 attachmentIds 지원 + GET에 메타데이터
│   │   └── files.ts                       ← 파일 크기 제한 50MB 확장 (선택사항)

packages/app/
├── src/
│   └── pages/
│       └── messenger.tsx                  ← 📎 버튼 + 파일 업로드 + 첨부 프리뷰 + 렌더링
```

### References

- [Source: _bmad-output/implementation-artifacts/13-2-file-chat-attach.md] — 채팅 파일 첨부 구현 패턴 (attachmentIds, 검증, UI)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#1309-1313] — P4 메신저 파일 첨부 UX 스펙
- [Source: packages/server/src/db/schema.ts:487-522] — messengerMessages + files 테이블 스키마
- [Source: packages/server/src/routes/workspace/messenger.ts:32-35,450-573] — 메신저 API (sendMessage, getMessages)
- [Source: packages/server/src/routes/workspace/files.ts] — 파일 업로드/다운로드/삭제 API
- [Source: packages/server/src/lib/file-storage.ts] — 파일 스토리지 유틸
- [Source: packages/app/src/pages/messenger.tsx] — 메신저 UI (1100줄+)
- [Source: _bmad-output/implementation-artifacts/16-5-messenger-mobile-pwa.md] — 이전 스토리 (모바일 PWA)

### Previous Story Intelligence (16-5)

- PWA 인프라 완료: SW 캐시, 오프라인 페이지, 설치 배너, Web Push, 모바일 반응형
- messenger.tsx에 showChat 모바일 전환 + safe area + 스레드 모바일 전체화면 추가됨
- 인라인 컴포넌트 패턴 유지 — 파일 첨부도 같은 파일 내 수정
- Code Review: ILIKE 이스케이프, assertMember 누락 등 발견 → 수정됨
- TEA 172건 통과
- 커밋 패턴: `feat: Story X-Y 한글제목 — 핵심내용 + TEA N건`

### Git Intelligence

Recent commits:
- `428399c` feat: Story 16-5 메신저 모바일 PWA — 오프라인 + 푸시 알림 + 설치 배너 + TEA 172건
- `900c080` feat: Story 16-4 메신저 검색 + 알림 — ILIKE 검색 + @멘션 알림 + 미읽음 배지 + TEA 111건
- `6405dd4` feat: Story 16-3 리액션 + 스레드 — 이모지 리액션 CRUD + 스레드 패널 + TEA 75건
- `5c0d5c3` feat: Story 16-2 실시간 메시지 + AI 에이전트 — WS 브로드캐스트 + @멘션 호출 + TEA 84건
- `109c225` feat: Story 16-1 메신저 채널 관리 — 수정/삭제/나가기 + 설정 모달 + TEA 79건

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: DB 스키마 — messengerMessages에 `attachment_ids` text 컬럼 추가 + 마이그레이션 0028
- Task 2: 서버 API — sendMessageSchema에 attachmentIds 추가 + 파일 유효성 검증(files테이블 3중 확인) + INSERT 시 JSON.stringify + WS 브로드캐스트에 attachments 메타데이터
- Task 3: 서버 API — GET messages/thread 응답에 파일 메타데이터 일괄 조회 포함 (parsedAttachmentIds → filesMap)
- Task 4: 프론트엔드 — 📎 버튼 + 파일 업로드(api.upload) + pendingFiles 프리뷰 + 드래그앤드롭 + 50MB Toast
- Task 5: 프론트엔드 — AttachmentRenderer 컴포넌트: 이미지=인라인 썸네일, 문서=카드(아이콘+이름+크기+다운로드)
- Task 6: 스레드 — ThreadPanel에도 동일한 파일 첨부/렌더링 기능 추가
- Task 7: turbo build type-check 8/8 success, 1854 unit tests pass
- 파일 크기 제한 10MB→50MB 확장 (UX 스펙 요구)

### File List

- packages/server/src/db/schema.ts (수정 — messengerMessages에 attachmentIds 컬럼)
- packages/server/src/db/migrations/0028_messenger-file-attach.sql (신규 — 마이그레이션)
- packages/server/src/db/migrations/meta/_journal.json (수정 — journal entry)
- packages/server/src/routes/workspace/messenger.ts (수정 — attachmentIds 검증/저장/조회/WS브로드캐스트)
- packages/server/src/routes/workspace/files.ts (수정 — 파일 크기 제한 50MB 확장)
- packages/app/src/pages/messenger.tsx (수정 — 📎 버튼, 파일 업로드, 드래그앤드롭, AttachmentRenderer, 스레드 파일첨부)
- _bmad-output/implementation-artifacts/sprint-status.yaml (수정 — 스토리 상태 업데이트)
- packages/server/src/__tests__/unit/messenger-file-attach.test.ts (신규 — 87 tests, TEA 포함)
