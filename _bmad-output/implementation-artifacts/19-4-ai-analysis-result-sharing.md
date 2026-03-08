# Story 19.4: AI 분석 결과 공유 (보고서 → 메신저 전달)

Status: done

## Story

As a Human Employee (CEO/Employee),
I want to share AI analysis reports directly to messenger conversations,
so that I can quickly send report results to colleagues without manual copy-paste.

## Acceptance Criteria

1. **보고서 공유 버튼**: 보고서 상세 페이지에 "메신저로 공유" 버튼 추가
2. **대화방 선택 모달**: 공유 버튼 클릭 → 참여 중인 대화방 목록 표시 → 선택
3. **공유 API**: POST /conversations/:id/messages에 type='ai_report' + 보고서 참조 정보 전송
4. **AI 보고서 메시지 렌더링**: conversation-chat에서 ai_report 타입 메시지를 카드 형태로 렌더링 (제목, 요약, "전체 보기" 링크)
5. **보고서 링크**: ai_report 메시지 클릭 시 /reports/:id로 이동
6. **서버 공유 API**: POST /api/workspace/conversations/:id/share-report 엔드포인트 — 보고서 존재 확인 + ai_report 메시지 자동 생성

## Tasks / Subtasks

- [x] Task 1: 서버 공유 API (AC: #3, #6)
  - [x] 1.1 `packages/server/src/routes/workspace/conversations.ts`에 POST /:id/share-report 엔드포인트 추가
  - [x] 1.2 Zod 스키마: `{ reportId: z.string().uuid() }`
  - [x] 1.3 참여자 검증 (assertParticipant)
  - [x] 1.4 보고서 존재 + 접근 권한 확인 (reports 테이블 조회, 같은 companyId)
  - [x] 1.5 ai_report 메시지 INSERT: content = JSON `{ reportId, title, summary }`
  - [x] 1.6 WebSocket broadcastToChannel new-message

- [x] Task 2: 보고서 페이지에 공유 버튼 + 대화방 선택 모달 (AC: #1, #2)
  - [x] 2.1 `packages/app/src/components/messenger/share-to-conversation-modal.tsx` 생성
  - [x] 2.2 대화방 목록: GET /api/workspace/conversations → 선택
  - [x] 2.3 공유 호출: POST /api/workspace/conversations/:id/share-report
  - [x] 2.4 reports.tsx에 "메신저로 공유" 버튼 추가

- [x] Task 3: ai_report 메시지 렌더링 (AC: #4, #5)
  - [x] 3.1 conversation-chat.tsx에서 type='ai_report' 메시지 카드 렌더링
  - [x] 3.2 content JSON 파싱 → 보고서 제목 + 요약 표시
  - [x] 3.3 "전체 보기" 버튼 → navigate('/reports/:reportId')

- [x] Task 4: 단위 테스트 (AC: 전체)
  - [x] 4.1 share-report Zod 스키마 검증 테스트
  - [x] 4.2 ai_report content JSON 파싱 로직 테스트
  - [x] 4.3 보고서 카드 렌더링 데이터 추출 로직 테스트

## Dev Notes

### 기존 인프라

**보고서 시스템 (reports.ts):**
- `GET /api/workspace/reports` — 보고서 목록 (authorId/submittedTo 기준)
- `GET /api/workspace/reports/:id` — 보고서 상세
- reports 테이블: id, title, content, status, authorId, submittedTo, companyId
- 보고서 상세 페이지: `packages/app/src/pages/reports.tsx`

**대화 메시지 시스템 (conversations.ts, Story 19-2):**
- POST /conversations/:id/messages — type='ai_report' 이미 지원
- messages 테이블: type='ai_report' 허용 (스키마 + Zod 검증 완료)
- WebSocket broadcastToChannel 패턴 확보

**conversation-chat.tsx (Story 19-3):**
- 현재 ai_report 메시지도 일반 텍스트로 렌더링
- type === 'system'만 별도 스타일 → ai_report 카드 렌더링 추가 필요

### ai_report 메시지 content 포맷

```json
{
  "reportId": "uuid",
  "title": "보고서 제목",
  "summary": "보고서 내용 미리보기 (최대 200자)"
}
```

### Project Structure Notes

**신규 파일:**
- `packages/app/src/components/messenger/share-to-conversation-modal.tsx` — 대화방 선택 모달

**수정 파일:**
- `packages/server/src/routes/workspace/conversations.ts` — share-report 엔드포인트 추가
- `packages/app/src/pages/reports.tsx` — 공유 버튼 추가
- `packages/app/src/components/messenger/conversation-chat.tsx` — ai_report 카드 렌더링

### References

- [Source: packages/server/src/routes/workspace/reports.ts] — 보고서 API
- [Source: packages/server/src/routes/workspace/conversations.ts] — 대화 API
- [Source: packages/app/src/pages/reports.tsx] — 보고서 UI
- [Source: packages/app/src/components/messenger/conversation-chat.tsx] — 채팅 UI

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1: conversations.ts에 POST /:id/share-report 엔드포인트 추가 — reports 테이블 조회, ai_report 메시지 생성, WebSocket broadcast
- Task 2: share-to-conversation-modal.tsx 생성 + reports.tsx에 "메신저로 공유" 버튼 추가
- Task 3: conversation-chat.tsx에 ai_report 카드 렌더링 + parseAiReportContent 헬퍼 + /reports/:id 네비게이션
- Task 4: 13개 단위 테스트 (Zod 4 + JSON 파싱 5 + summary 생성 4)
- TypeScript 빌드 정상 (server, app 모두 clean)
- Code Review: 빈 코드 블록 없음, 보안 이슈 없음

### File List
- packages/server/src/routes/workspace/conversations.ts -- [MODIFIED] share-report 엔드포인트 + shareReportSchema + reports import
- packages/app/src/components/messenger/share-to-conversation-modal.tsx -- [NEW] 대화방 선택 공유 모달
- packages/app/src/components/messenger/conversation-chat.tsx -- [MODIFIED] ai_report 카드 렌더링 + parseAiReportContent + useNavigate
- packages/app/src/pages/reports.tsx -- [MODIFIED] ShareToConversationModal import + 공유 버튼 + showShareModal 상태
- packages/server/src/__tests__/unit/share-report.test.ts -- [NEW] 13개 단위 테스트
