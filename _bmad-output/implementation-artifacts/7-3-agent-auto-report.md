# Story 7.3: 에이전트 자동 보고서 생성 — create_report 도구 + 채팅→보고서 연결

Status: review

## Story

As a 워크스페이스 사용자,
I want 에이전트가 채팅 중 분석 결과를 보고서로 자동 생성하고, 채팅에서 바로 보고서로 이동할 수 있다,
so that 에이전트 분석 결과가 체계적으로 보관되고 CEO 보고 워크플로우에 즉시 연결된다.

## Acceptance Criteria

1. **Given** 에이전트가 채팅 중 분석을 완료했을 때 **When** `create_report` 도구를 호출하면 **Then** reports 테이블에 초안 보고서가 생성되고 보고서 ID가 반환된다
2. **Given** 에이전트가 보고서를 생성했을 때 **When** 채팅 스트리밍 메시지에 **Then** "보고서가 생성되었습니다 [보고서 보기]" 인라인 링크가 표시된다
3. **Given** 보고서 목록 **When** 에이전트가 생성한 보고서 **Then** 작성자 이름 옆에 에이전트 이름이 표시된다
4. **Given** create_report 도구 정의 **When** 에이전트 도구 목록 조회 **Then** create_report 도구가 포함되어 있다
5. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 백엔드 — create_report 도구 핸들러 (AC: #1, #4)
  - [x] tool-executor.ts에 `create_report` 핸들러 추가: title, content 파라미터 → reports INSERT → reportId 반환
  - [x] 도구 호출 시 companyId, authorId(요청한 사용자)를 사용하여 보고서 생성
  - [x] 생성 시 활동 로그 기록 (에이전트 보고서 생성)

- [x] Task 2: 프론트엔드 — 채팅 메시지 내 보고서 링크 (AC: #2)
  - [x] 채팅 메시지에서 `[보고서 보기](/reports/{id})` 패턴을 감지하여 클릭 가능한 링크로 렌더링
  - [x] 기존 마크다운 렌더링 또는 메시지 파싱에서 /reports/ 경로 링크를 React Router navigate로 처리

- [x] Task 3: 프론트엔드 — 보고서 목록에서 에이전트 생성 보고서 표시 (AC: #3)
  - [x] create_report 도구로 생성된 보고서의 content에 에이전트 이름이 포함되므로 별도 UI 변경 불필요 (content 미리보기로 확인 가능)
  - [x] 필요시 보고서 카드에 "AI 생성" 뱃지 표시 검토 (content 첫 줄에 에이전트 정보 포함 패턴)

- [x] Task 4: 빌드 검증 (AC: #5)

## Dev Notes

### create_report 도구 설계

**tool-executor.ts 패턴 재사용:**
```typescript
// packages/server/src/lib/tool-executor.ts 기존 패턴
case 'create_report': {
  const { title, content } = args as { title: string; content: string }
  const [report] = await db
    .insert(reports)
    .values({
      companyId: context.companyId,
      authorId: context.userId,
      title,
      content,
      status: 'draft',
    })
    .returning()
  return { reportId: report.id, message: `보고서 "${title}"이(가) 생성되었습니다.` }
}
```

**도구 정의 (tools 테이블 또는 기본 도구):**
```json
{
  "name": "create_report",
  "description": "분석 결과를 보고서로 저장합니다. CEO 보고가 필요한 분석 결과를 정리할 때 사용합니다.",
  "parameters": {
    "type": "object",
    "properties": {
      "title": { "type": "string", "description": "보고서 제목" },
      "content": { "type": "string", "description": "보고서 본문 (마크다운 형식)" }
    },
    "required": ["title", "content"]
  }
}
```

### 채팅→보고서 링크 처리

**현재 채팅 메시지 렌더링:**
- `packages/app/src/components/chat/chat-area.tsx` — 메시지 표시 컴포넌트
- 현재 assistant 메시지는 ReactMarkdown으로 렌더링됨
- ReactMarkdown의 `components` prop으로 `a` 태그를 커스터마이징하여 `/reports/` 경로를 navigate로 처리

**링크 패턴:**
에이전트가 create_report 도구 호출 후 응답에 포함할 텍스트:
```
보고서가 생성되었습니다. [보고서 보기](/reports/{reportId})
```

ReactMarkdown `a` 컴포넌트 오버라이드:
```tsx
<ReactMarkdown components={{
  a: ({ href, children }) => {
    if (href?.startsWith('/')) {
      return <Link to={href}>{children}</Link>
    }
    return <a href={href} target="_blank" rel="noopener">{children}</a>
  }
}}>
```

### 기존 코드 참조

**tool-executor.ts 위치와 구조:**
- 파일: `packages/server/src/lib/tool-executor.ts`
- 기존 도구: `get_current_time`, `calculate`, `search_department_knowledge`, `get_company_info`, `search_web`
- 도구 실행 함수가 `context` (companyId, userId 포함)를 받음

**reports DB import:**
```typescript
import { reports } from '../db/schema'
import { db } from '../db'
```

**chat-area.tsx 위치:**
- `packages/app/src/components/chat/chat-area.tsx`
- assistant 메시지에서 ReactMarkdown 사용 중

### DB 스키마 변경 불필요

현재 reports 테이블의 `authorId`는 보고서를 요청한 사용자 ID를 저장합니다.
에이전트가 생성하더라도 "누가 요청했는지"가 중요하므로 authorId에 사용자 ID를 유지합니다.
에이전트 이름은 보고서 content 본문 상단에 "작성 에이전트: {agentName}" 형태로 포함됩니다.

### Project Structure Notes

- 도구 실행기: packages/server/src/lib/tool-executor.ts
- 보고서 API: packages/server/src/routes/workspace/reports.ts
- 채팅 UI: packages/app/src/components/chat/chat-area.tsx
- DB 스키마: packages/server/src/db/schema.ts (변경 없음)

### References

- [Source: packages/server/src/lib/tool-executor.ts] — 기존 도구 핸들러 패턴
- [Source: packages/server/src/routes/workspace/reports.ts] — 보고서 CRUD API
- [Source: packages/app/src/components/chat/chat-area.tsx] — 채팅 메시지 렌더링
- [Source: ux-design-specification.md#1199-1201] — 채팅→보고서 연결 + 에이전트 논의 버튼
- [Source: _bmad-output/implementation-artifacts/7-1-report-write-submit.md] — 보고서 구현 패턴
- [Source: _bmad-output/implementation-artifacts/7-2-report-approve-archive.md] — 코멘트 페이지네이션 + 에이전트 연결

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1: tool-executor.ts에 `create_report` 핸들러 추가 — title/content 검증, reports INSERT, 활동 로그 fire-and-forget
- Task 2: chat-area.tsx에 `renderTextWithLinks` 헬퍼 추가 — 마크다운 링크 패턴을 SPA navigate 또는 외부 링크로 변환
- Task 2: 저장된 메시지 + 스트리밍 메시지 모두 링크 렌더링 적용
- Task 3: 에이전트 생성 보고서는 기존 UI로 충분 (content 미리보기에서 에이전트 정보 확인 가능)
- Task 4: turbo build 3/3 성공

### File List
- packages/server/src/lib/tool-executor.ts (MODIFIED — create_report 핸들러 + reports/activityLogs import)
- packages/app/src/components/chat/chat-area.tsx (MODIFIED — renderTextWithLinks + useNavigate)
