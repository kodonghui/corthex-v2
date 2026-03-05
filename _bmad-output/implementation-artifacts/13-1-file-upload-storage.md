# Story 13.1: 파일 업로드 + 저장소 API

Status: done

## Story
As a 사용자, I want 파일을 업로드하고 관리할 수 있다, so that 업무 파일을 안전하게 보관하고 공유할 수 있다.

## Acceptance Criteria
1. POST /api/workspace/files/upload — 파일 업로드 (10MB 제한)
2. GET /api/workspace/files — 파일 목록 조회
3. GET /api/workspace/files/:id/download — 파일 다운로드
4. DELETE /api/workspace/files/:id — 파일 삭제 (소프트 + 실제 파일)
5. turbo build 3/3 성공

## Dev Notes
### 새 파일
- `packages/server/src/routes/workspace/files.ts` — 파일 CRUD API 4개
### 수정 파일
- `packages/server/src/index.ts` — filesRoute import + 등록
