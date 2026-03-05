# Story 9.3: 파일/스크린샷 도구 — 노션 읽기/쓰기 + 텍스트 파일 생성

Status: done

## Story

As a AI 에이전트 사용자,
I want 에이전트가 노션 페이지를 읽고 쓰며, 텍스트 파일을 생성할 수 있다,
so that 에이전트가 문서 관리와 데이터 저장을 자동화할 수 있다.

## Acceptance Criteria

1. `read_notion_page` 핸들러가 Notion API로 페이지 내용을 읽어 텍스트로 반환한다
2. `create_notion_page` 핸들러가 Notion API로 새 페이지를 생성하고 결과를 반환한다
3. `generate_text_file` 핸들러가 주어진 내용으로 텍스트/마크다운 형태의 문자열을 생성하여 반환한다
4. 3개 핸들러 모두 registry.register()로 등록되고 graceful degradation 패턴을 따른다
5. 시드 데이터에 3개 신규 도구(category, tags, inputSchema 포함)가 등록된다
6. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: read_notion_page 핸들러 (AC: #1, #4)
  - [x] `packages/server/src/lib/tool-handlers/builtins/read-notion-page.ts` 생성
  - [x] Notion API v1 blocks.children.list 호출, 블록 텍스트 추출
  - [x] credential vault에서 notion provider 사용 (api_key)
  - [x] `index.ts`에 import + register
- [x] Task 2: create_notion_page 핸들러 (AC: #2, #4)
  - [x] `packages/server/src/lib/tool-handlers/builtins/create-notion-page.ts` 생성
  - [x] Notion API v1 pages.create 호출 (parent: database_id 또는 page_id)
  - [x] 입력: parentId, title, content(마크다운 텍스트)
  - [x] `index.ts`에 import + register
- [x] Task 3: generate_text_file 핸들러 (AC: #3, #4)
  - [x] `packages/server/src/lib/tool-handlers/builtins/generate-text-file.ts` 생성
  - [x] 입력: filename, content, format(text/markdown/csv)
  - [x] 파일 저장 없이 내용 문자열 반환 (에이전트가 사용자에게 전달)
  - [x] `index.ts`에 import + register
- [x] Task 4: 시드 데이터 업데이트 (AC: #5)
  - [x] seed.ts에 3개 신규 도구 추가 + 기존 '노션 연동' placeholder 대체
  - [x] category, tags, inputSchema, handler 포함
- [x] Task 5: 빌드 확인 (AC: #6)
  - [x] `npx turbo build --force` 3/3 성공 확인

## Dev Notes

### Notion API v1 패턴

Notion API는 Bearer token 인증:
```typescript
const headers = {
  'Authorization': `Bearer ${creds.api_key}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
}
```

- blocks.children.list: `GET https://api.notion.com/v1/blocks/{block_id}/children`
- pages.create: `POST https://api.notion.com/v1/pages`

credential-vault에 notion provider 이미 존재 (api_key 필드).

### 블록 텍스트 추출

Notion 블록은 type별로 텍스트 위치가 다름:
- paragraph: block.paragraph.rich_text[].plain_text
- heading_1/2/3: block.heading_X.rich_text[].plain_text
- bulleted_list_item/numbered_list_item: block.*.rich_text[].plain_text

### generate_text_file 패턴

실제 파일 저장이 아닌 내용 문자열 반환. 에이전트가 채팅 메시지로 사용자에게 전달.
향후 Epic 13(파일 관리)에서 실제 파일 저장과 연동 가능.

### 시드 데이터 매핑

| 도구명 | category | tags |
|--------|----------|------|
| read_notion_page | content | ["notion", "api", "document"] |
| create_notion_page | content | ["notion", "api", "document"] |
| generate_text_file | content | ["file", "text", "builtin"] |

### References

- [Source: packages/server/src/services/credential-vault.ts] — notion provider (api_key)
- [Source: packages/server/src/lib/tool-handlers/builtins/search-web.ts] — API 호출 참조 패턴
- [Source: packages/server/src/db/seed.ts] — 기존 '노션 연동' placeholder

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: read_notion_page — Notion API v1 blocks.children.list, 블록 타입별 마크다운 변환
- Task 2: create_notion_page — Notion API v1 pages.create, 줄 단위 paragraph 블록
- Task 3: generate_text_file — 파일 저장 없이 내용 반환, text/markdown/csv 지원
- Task 4: seed.ts에 3개 도구 추가 + '노션 연동' placeholder 대체
- Task 5: turbo build 3/3 성공

### File List

- packages/server/src/lib/tool-handlers/builtins/read-notion-page.ts (신규)
- packages/server/src/lib/tool-handlers/builtins/create-notion-page.ts (신규)
- packages/server/src/lib/tool-handlers/builtins/generate-text-file.ts (신규)
- packages/server/src/lib/tool-handlers/index.ts (수정)
- packages/server/src/db/seed.ts (수정)
