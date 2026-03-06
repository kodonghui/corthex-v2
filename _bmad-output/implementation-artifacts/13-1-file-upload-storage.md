# Story 13.1: 파일 업로드/저장소 — 업로드 API + 로컬 저장 + 다운로드

Status: done

## Story

As a 사용자,
I want 파일을 업로드하고 다운로드할 수 있다,
so that 업무에 필요한 문서, 이미지 등을 시스템에 저장하고 공유할 수 있다.

## Acceptance Criteria

1. **Given** 인증된 사용자 **When** POST /api/workspace/files에 multipart 파일 전송 **Then** 파일 저장 + files 테이블 기록 + 메타데이터 반환
2. **Given** 업로드 요청 **When** 파일 크기 10MB 초과 **Then** 400 에러 + "파일 크기는 10MB 이하만 허용됩니다"
3. **Given** 업로드 요청 **When** 허용되지 않은 MIME 타입 **Then** 400 에러 + "허용되지 않는 파일 형식입니다"
4. **Given** 인증된 사용자 **When** GET /api/workspace/files **Then** 내 회사 파일 목록 (최신순 50개)
5. **Given** 파일 소유자 또는 같은 회사 **When** GET /api/workspace/files/:id/download **Then** 파일 바이너리 반환 (Content-Disposition 헤더)
6. **Given** 파일 소유자 **When** DELETE /api/workspace/files/:id **Then** files.isActive=false 소프트 삭제
7. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 파일 저장소 유틸리티 (AC: #1)
  - [x] `packages/server/src/lib/file-storage.ts` 생성
  - [x] 로컬 디스크 저장: `uploads/{companyId}/{yyyy-mm}/{uuid}.{ext}` 경로
  - [x] `saveFile(buffer, filename, companyId)` → storagePath 반환
  - [x] `getFilePath(storagePath)` → 절대 경로 반환
  - [x] `deleteFile(storagePath)` → 파일 삭제
  - [x] uploads 디렉토리 자동 생성 (mkdirSync recursive)

- [x] Task 2: 파일 업로드 API (AC: #1, #2, #3)
  - [x] `packages/server/src/routes/workspace/files.ts` 생성
  - [x] POST /api/workspace/files — multipart/form-data 파싱 (Hono c.req.parseBody())
  - [x] MIME 타입 화이트리스트: image/*, application/pdf, text/*, .doc/.xlsx/.pptx
  - [x] 파일 크기 검증: 10MB(10_485_760 bytes) 초과 시 400 에러
  - [x] files 테이블 INSERT + 메타데이터 반환
  - [x] 활동 로그 기록

- [x] Task 3: 파일 목록 + 다운로드 + 삭제 API (AC: #4, #5, #6)
  - [x] GET /api/workspace/files — 회사별 활성 파일 목록 (isActive=true, 최신순 50개)
  - [x] GET /api/workspace/files/:id/download — 파일 바이너리 스트리밍 + Content-Disposition
  - [x] DELETE /api/workspace/files/:id — 소프트 삭제 (isActive=false), 소유자만 허용

- [x] Task 4: 라우터 등록 + 빌드 검증 (AC: #7)
  - [x] `index.ts`에 filesRoute 임포트 + `/api/workspace/files` 마운트
  - [x] `npx turbo build --force` → 3/3 성공

## Dev Notes

### 기존 인프라 활용

1. **files 테이블 이미 존재** (schema.ts:476-488)
   - id, companyId, userId, filename, mimeType, sizeBytes, storagePath, isActive, createdAt
   - companyIdx 인덱스 존재
   - relations: company, user

2. **Hono multipart 처리**
   - `c.req.parseBody()` — Hono 내장 multipart 파서
   - `{ file: File }` 형태로 반환
   - File 객체: `.name`, `.type`, `.size`, `.arrayBuffer()`

3. **라우터 패턴 참조** — 기존 workspace 라우트 구조
   - authMiddleware 사용
   - HTTPError 클래스
   - logActivity 활동 로그

### 허용 MIME 타입

```typescript
const ALLOWED_MIME_PREFIXES = ['image/', 'text/']
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/json',
  'application/zip',
]
```

### 파일 저장 경로 구조

```
uploads/
  {companyId}/
    2026-03/
      {uuid}.pdf
      {uuid}.png
```

### 이전 스토리 교훈

- GET 라우트 순서: 고정 경로를 :id보다 위에 등록
- db.transaction() 필요한 곳에 래핑
- 미사용 import 정리

### Project Structure Notes

- `packages/server/src/lib/file-storage.ts` — 파일 저장소 유틸리티 (신규)
- `packages/server/src/routes/workspace/files.ts` — 파일 API 라우트 (신규)
- `packages/server/src/index.ts` — 라우터 등록 (수정)

### References

- [Source: packages/server/src/db/schema.ts:475-488] — files 테이블 스키마
- [Source: packages/server/src/db/schema.ts:711-713] — files relations
- [Source: packages/server/src/index.ts:14-36] — 라우터 등록 패턴
