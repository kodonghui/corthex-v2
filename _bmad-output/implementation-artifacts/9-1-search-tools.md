# Story 9.1: 검색 도구 카탈로그 — Serper 기반 뉴스/이미지/유튜브/장소 검색 + 시드 카테고리

Status: done

## Story

As a AI 에이전트 사용자,
I want 웹 검색 외에 뉴스, 이미지, 유튜브, 장소 검색 도구를 사용한다,
so that 에이전트가 다양한 유형의 정보를 검색하여 더 풍부한 답변을 제공할 수 있다.

## Acceptance Criteria

1. `search_news` 핸들러가 Serper `/news` 엔드포인트로 뉴스 검색 결과(제목, URL, 날짜, 요약)를 반환한다
2. `search_images` 핸들러가 Serper `/images` 엔드포인트로 이미지 검색 결과(제목, 이미지URL, 출처URL)를 반환한다
3. `search_youtube` 핸들러가 Serper `/videos` 엔드포인트로 유튜브 영상 결과(제목, URL, 채널, 길이)를 반환한다
4. `search_places` 핸들러가 Serper `/places` 엔드포인트로 장소 검색 결과(이름, 주소, 평점, 전화번호)를 반환한다
5. 4개 신규 핸들러 모두 `registry.register()`로 등록되고, 기존 `search_web`과 동일한 에러 처리 패턴을 따른다
6. 기존 6개 + 신규 4개 = 총 10개 도구의 시드 데이터에 `category`, `tags` 값이 반영된다
7. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: search_news 핸들러 (AC: #1, #5)
  - [x] `packages/server/src/lib/tool-handlers/builtins/search-news.ts` 생성
  - [x] Serper `/news` 엔드포인트 호출, 결과 5건 반환
  - [x] `index.ts`에 import + `registry.register('search_news', searchNews)`
- [x] Task 2: search_images 핸들러 (AC: #2, #5)
  - [x] `packages/server/src/lib/tool-handlers/builtins/search-images.ts` 생성
  - [x] Serper `/images` 엔드포인트 호출, 결과 5건 반환
  - [x] `index.ts`에 import + register
- [x] Task 3: search_youtube 핸들러 (AC: #3, #5)
  - [x] `packages/server/src/lib/tool-handlers/builtins/search-youtube.ts` 생성
  - [x] Serper `/videos` 엔드포인트 호출, 결과 5건 반환
  - [x] `index.ts`에 import + register
- [x] Task 4: search_places 핸들러 (AC: #4, #5)
  - [x] `packages/server/src/lib/tool-handlers/builtins/search-places.ts` 생성
  - [x] Serper `/places` 엔드포인트 호출, 결과 5건 반환
  - [x] `index.ts`에 import + register
- [x] Task 5: 시드 데이터 category/tags 반영 (AC: #6)
  - [x] `seed.ts` 또는 별도 시드에서 기존 6개 도구 + 신규 4개 도구에 category, tags 추가
  - [x] 신규 4개 도구의 inputSchema 정의 포함
- [x] Task 6: 빌드 확인 (AC: #7)
  - [x] `npx turbo build --force` 3/3 성공 확인

## Dev Notes

### 핵심 패턴: search_web 참조 구현

기존 `search-web.ts`가 Serper 연동의 참조 구현. 모든 신규 핸들러는 이 패턴을 따른다:

```typescript
// 공통 패턴
import type { ToolHandler } from '../types'

export const searchXxx: ToolHandler = async (input, ctx) => {
  const query = String(input.query || '')
  if (!query) return '검색어가 비어있습니다.'

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('serper')
  } catch {
    return JSON.stringify({ query, results: [], message: 'Serper API 키가 등록되지 않았습니다.' })
  }

  try {
    const res = await fetch('https://google.serper.dev/{endpoint}', {
      method: 'POST',
      headers: { 'X-API-KEY': creds.api_key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 5 }),
    })
    if (!res.ok) return JSON.stringify({ query, results: [], message: `검색 API 오류: ${res.status}` })

    const data = await res.json()
    // endpoint별 응답 파싱...
    return JSON.stringify({ query, results, count: results.length })
  } catch (err) {
    return JSON.stringify({ query, results: [], message: `검색 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}` })
  }
}
```

### Serper API 엔드포인트별 응답 구조

| 엔드포인트 | URL | 응답 키 | 추출 필드 |
|-----------|-----|---------|----------|
| `/news` | `https://google.serper.dev/news` | `news[]` | title, link, date, snippet, source |
| `/images` | `https://google.serper.dev/images` | `images[]` | title, imageUrl, link |
| `/videos` | `https://google.serper.dev/videos` | `videos[]` | title, link, channel, duration |
| `/places` | `https://google.serper.dev/places` | `places[]` | title, address, rating, phone, cid |

### 시드 데이터 category/tags 매핑

| 도구명 | category | tags |
|--------|----------|------|
| get_current_time | utility | ["builtin"] |
| calculate | utility | ["builtin", "math"] |
| search_department_knowledge | search | ["builtin", "internal"] |
| get_company_info | utility | ["builtin", "internal"] |
| search_web | search | ["web", "api", "serper"] |
| create_report | content | ["builtin", "report"] |
| search_news | search | ["web", "api", "serper", "news"] |
| search_images | search | ["web", "api", "serper", "image"] |
| search_youtube | search | ["web", "api", "serper", "video"] |
| search_places | search | ["web", "api", "serper", "local"] |

### inputSchema 정의 (신규 4개 공통)

```json
{
  "type": "object",
  "properties": {
    "query": { "type": "string", "description": "검색할 키워드" }
  },
  "required": ["query"]
}
```

### 파일 구조

```
packages/server/src/lib/tool-handlers/
  builtins/
    search-web.ts          (기존 — 변경 없음)
    search-news.ts         (신규)
    search-images.ts       (신규)
    search-youtube.ts      (신규)
    search-places.ts       (신규)
  index.ts                 (수정 — 4개 import + register 추가)
  registry.ts              (변경 없음)
  types.ts                 (변경 없음)
packages/server/src/db/
  seed.ts                  (수정 — category/tags 추가 + 신규 도구 4개)
```

### Project Structure Notes

- 기존 `builtins/` 폴더에 새 파일 추가. kebab-case 파일명 규칙 준수
- `index.ts`의 import/register 패턴 그대로 확장
- Serper credential provider('serper')는 이미 `credential-vault.ts`의 PROVIDER_SCHEMAS에 등록됨

### References

- [Source: packages/server/src/lib/tool-handlers/builtins/search-web.ts] — Serper 연동 참조 구현
- [Source: packages/server/src/lib/tool-handlers/index.ts] — 핸들러 등록 패턴
- [Source: packages/server/src/lib/tool-handlers/types.ts] — ToolHandler, ToolExecContext 타입
- [Source: packages/server/src/services/credential-vault.ts] — PROVIDER_SCHEMAS (serper: ['api_key'])
- [Source: packages/server/src/db/schema.ts:189-206] — toolDefinitions 테이블 (category, tags 컬럼)
- [Source: _bmad-output/implementation-artifacts/epic-8-retro-2026-03-05.md] — "category, tags 시드 데이터 미반영" 기술 부채

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: search_news — Serper /news 엔드포인트, title/url/date/snippet/source 반환
- Task 2: search_images — Serper /images 엔드포인트, title/imageUrl/sourceUrl 반환
- Task 3: search_youtube — Serper /videos 엔드포인트, title/url/channel/duration 반환
- Task 4: search_places — Serper /places 엔드포인트, name/address/rating/phone 반환
- Task 5: seed.ts에 10개 도구 전체 category/tags 추가 + 신규 4개 도구 inputSchema 포함
- Task 6: turbo build 3/3 성공

### File List

- packages/server/src/lib/tool-handlers/builtins/search-news.ts (신규)
- packages/server/src/lib/tool-handlers/builtins/search-images.ts (신규)
- packages/server/src/lib/tool-handlers/builtins/search-youtube.ts (신규)
- packages/server/src/lib/tool-handlers/builtins/search-places.ts (신규)
- packages/server/src/lib/tool-handlers/index.ts (수정)
- packages/server/src/db/seed.ts (수정)
