# Story 9.6: 이미지 생성 도구 — AI 이미지 생성 + 번역 도구

Status: review

## Story

As a AI 에이전트 사용자,
I want 에이전트가 AI로 이미지를 생성하고 텍스트를 번역할 수 있다,
so that 에이전트가 콘텐츠 제작과 다국어 업무를 지원할 수 있다.

## Acceptance Criteria

1. `generate_image` 핸들러가 프롬프트로 이미지를 생성하고 URL을 반환한다
2. `translate_text` 핸들러가 텍스트를 지정 언어로 번역하여 반환한다
3. 2개 핸들러 모두 registry.register()로 등록되고 graceful degradation 패턴
4. credential-vault에 openai provider 스키마가 추가된다
5. 시드 데이터에 2개 도구가 등록된다
6. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: openai provider + generate_image 핸들러 (AC: #1, #3, #4)
  - [x] credential-vault에 openai provider 추가 (api_key)
  - [x] `packages/server/src/lib/tool-handlers/builtins/generate-image.ts` 생성
  - [x] OpenAI DALL-E API 호출, URL 반환
  - [x] `index.ts`에 import + register
- [x] Task 2: translate_text 핸들러 (AC: #2, #3)
  - [x] `packages/server/src/lib/tool-handlers/builtins/translate-text.ts` 생성
  - [x] Google Translate API 또는 간단한 번역 API 호출
  - [x] `index.ts`에 import + register
- [x] Task 3: 시드 데이터 + 빌드 (AC: #5, #6)
  - [x] seed.ts에 2개 도구 추가
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### OpenAI DALL-E API
```
POST https://api.openai.com/v1/images/generations
Headers: Authorization: Bearer {api_key}
Body: { model: "dall-e-3", prompt, n: 1, size: "1024x1024" }
Response: { data: [{ url }] }
```

### Google Translate API
```
POST https://translation.googleapis.com/language/translate/v2?key={api_key}
Body: { q: text, target: langCode, source: sourceLang }
Response: { data: { translations: [{ translatedText }] } }
```
tts provider의 api_key 재사용 가능 (같은 Google Cloud 프로젝트).

### 시드 데이터 매핑
| 도구명 | category | tags |
|--------|----------|------|
| generate_image | content | ["openai", "image", "ai", "api"] |
| translate_text | utility | ["translate", "google", "api"] |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- Task 1: generate_image — OpenAI DALL-E 3 API, 1024x1024 기본, URL 반환
- Task 2: translate_text — Google Translate API v2, tts provider 키 재사용, 자동 감지
- Task 3: seed.ts 2개 도구 추가, credential-vault에 openai provider 추가

### File List

- packages/server/src/lib/tool-handlers/builtins/generate-image.ts (신규)
- packages/server/src/lib/tool-handlers/builtins/translate-text.ts (신규)
- packages/server/src/lib/tool-handlers/index.ts (수정)
- packages/server/src/services/credential-vault.ts (수정)
- packages/server/src/db/seed.ts (수정)
