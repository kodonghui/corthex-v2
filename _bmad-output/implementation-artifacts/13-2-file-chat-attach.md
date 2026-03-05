# Story 13.2: 채팅 파일 첨부 — chatMessages fileId 연결

Status: done

## Story
As a 사용자, I want 채팅 메시지에 파일을 첨부할 수 있다, so that 에이전트에게 파일 기반 질문을 할 수 있다.

## Acceptance Criteria
1. chatMessages에 fileId 컬럼 추가 (nullable FK → files)
2. POST /api/workspace/chat/.../messages에 fileId 파라미터 추가
3. GET messages에 파일 정보 (filename, mimeType, sizeBytes) left join 포함
4. DB 마이그레이션 생성
5. turbo build 3/3 성공

## Dev Notes
### 수정 파일
- `packages/server/src/db/schema.ts` — chatMessages에 fileId 추가 + 관계 설정
- `packages/server/src/routes/workspace/chat.ts` — API에 fileId 처리 추가
- `packages/server/src/db/migrations/0016_*.sql` — 마이그레이션
