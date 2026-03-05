# Story 9.7: SNS 도구 — 인스타그램 게시물 발행 + 요약 통계

Status: done

## Story

As a AI 에이전트 사용자,
I want 에이전트가 인스타그램에 게시물을 발행하고 계정 통계를 조회할 수 있다,
so that 에이전트가 SNS 마케팅 업무를 자동화할 수 있다.

## Acceptance Criteria

1. `publish_instagram` 핸들러가 Instagram Graph API로 이미지 게시물을 발행하고 결과를 반환한다
2. `get_instagram_insights` 핸들러가 Instagram Graph API로 계정 인사이트(팔로워, 도달, 노출)를 반환한다
3. 2개 핸들러 모두 registry.register()로 등록되고 graceful degradation 패턴
4. 시드 데이터에 2개 도구가 등록된다
5. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: publish_instagram 핸들러 (AC: #1, #3)
  - [x] `packages/server/src/lib/tool-handlers/builtins/publish-instagram.ts` 생성
  - [x] Instagram Graph API: 1) media container 생성 → 2) publish
  - [x] credential vault에서 instagram provider 사용 (access_token, page_id)
  - [x] `index.ts`에 import + register
- [x] Task 2: get_instagram_insights 핸들러 (AC: #2, #3)
  - [x] `packages/server/src/lib/tool-handlers/builtins/get-instagram-insights.ts` 생성
  - [x] Instagram Graph API insights 엔드포인트 호출
  - [x] 결과: followers_count, impressions, reach
  - [x] `index.ts`에 import + register
- [x] Task 3: 시드 데이터 + 빌드 (AC: #4, #5)
  - [x] seed.ts에 2개 도구 추가
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### Instagram Graph API
credential-vault에 instagram provider 이미 존재: access_token, page_id

게시물 발행 2단계:
```
1. POST https://graph.facebook.com/v18.0/{page_id}/media
   Body: { image_url, caption, access_token }
   Response: { id: container_id }

2. POST https://graph.facebook.com/v18.0/{page_id}/media_publish
   Body: { creation_id: container_id, access_token }
   Response: { id: media_id }
```

인사이트 조회:
```
GET https://graph.facebook.com/v18.0/{page_id}/insights
   ?metric=impressions,reach,follower_count
   &period=day
   &access_token={token}
```

### 시드 데이터 매핑
| 도구명 | category | tags |
|--------|----------|------|
| publish_instagram | content | ["instagram", "sns", "api"] |
| get_instagram_insights | utility | ["instagram", "sns", "api", "analytics"] |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- Task 1: publish_instagram — Graph API v18.0 2단계 발행 (container → publish)
- Task 2: get_instagram_insights — followers_count + impressions/reach day 인사이트
- Task 3: seed.ts 2개 도구 추가, turbo build 3/3 성공

### File List

- packages/server/src/lib/tool-handlers/builtins/publish-instagram.ts (신규)
- packages/server/src/lib/tool-handlers/builtins/get-instagram-insights.ts (신규)
- packages/server/src/lib/tool-handlers/index.ts (수정)
- packages/server/src/db/seed.ts (수정)
