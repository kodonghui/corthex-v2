# Story 3.2: credential-scrubber — PostToolUse Hook (보안 최우선)

Status: done

## Story

As a 보안 시스템,
I want 도구 출력에서 민감 패턴(API 키, 토큰, 비밀번호)이 자동 마스킹되는 것을,
so that AI가 민감 정보를 학습하거나 WebSocket으로 노출하지 않는다.

## Acceptance Criteria

1. [ ] `packages/server/src/engine/hooks/credential-scrubber.ts` (~20줄) 생성
2. [ ] PostToolUse 시그니처: `(ctx, toolName, toolOutput) => string` (E2)
3. [ ] `@zapier/secret-scrubber` 기반 패턴 탐지 (JSON 페이로드에서 민감 키 자동 감지)
4. [ ] 추가 정규식 패턴: CLI 토큰 (`sk-ant-*`), KIS API 키, 텔레그램 봇 토큰
5. [ ] 마스킹 형식: `***REDACTED***`
6. [ ] PostToolUse 순서: **1번째** — redactor, delegation-tracker보다 먼저 (D4)
7. [ ] 단위 테스트: 5개+ 패턴 마스킹 확인

## Tasks / Subtasks

- [x] Task 1: credential-scrubber.ts 구현 (AC: #1~#6)
  - [x] 1.1 `credential-scrubber.ts` 파일 생성 in `engine/hooks/`
  - [x] 1.2 PostToolUse 시그니처: `(ctx, toolName, toolOutput) => string` (동기 함수)
  - [x] 1.3 정규식 패턴 배열: sk-ant-*, KIS appkey, Telegram bot token
  - [x] 1.4 정규식 매칭 → `***REDACTED***` 치환
  - [x] 1.5 JSON 페이로드: `@zapier/secret-scrubber`의 `findSensitiveValues` + `scrub` 적용
  - [x] 1.6 비JSON 문자열: 정규식만 적용 (try/catch로 분기)

- [x] Task 2: 단위 테스트 (AC: #7)
  - [x] 2.1 `packages/server/src/__tests__/unit/credential-scrubber.test.ts` 생성
  - [x] 2.2 테스트: Claude CLI 토큰 (`sk-ant-api03-xxx...`) 마스킹
  - [x] 2.3 테스트: Telegram 봇 토큰 (`123456789:ABCdefGHI...`) 마스킹
  - [x] 2.4 테스트: KIS API 키 패턴 마스킹
  - [x] 2.5 테스트: JSON 페이로드에서 password/api_key 등 자동 감지
  - [x] 2.6 테스트: 민감 정보 없는 문자열 → 원본 그대로 반환
  - [x] 2.7 테스트: 여러 패턴 동시 존재 → 모두 마스킹

- [x] Task 3: 빌드 검증
  - [x] 3.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — 0 errors
  - [x] 3.2 `bun test packages/server/src/__tests__/unit/credential-scrubber.test.ts` — 7 PASS

## Dev Notes

### Architecture Decisions

- **D4 (Hook 순서):** PostToolUse에서 credential-scrubber가 **1번째**로 실행. redactor → delegation-tracker 순서. 순서 위반 = 보안 사고 (마스킹 안 된 토큰이 WebSocket 노출).
- **E2 (Hook 구현 표준):** PostToolUse 시그니처: `(ctx: SessionContext, toolName: string, toolOutput: string) => string`. 동기 함수 (DB 접근 불필요).
- **E9 (SDK 모킹):** `@zapier/secret-scrubber`는 순수 함수 → 모킹 불필요, 실제 실행.

### Function Signature

```typescript
export function credentialScrubber(
  _ctx: SessionContext,
  _toolName: string,
  toolOutput: string,
): string
```

### Imports

```typescript
import { scrub, findSensitiveValues } from '@zapier/secret-scrubber'
import type { SessionContext } from '../types'
```

### @zapier/secret-scrubber API

- `scrub<T>(input: T, secretValues: string[])` — 입력에서 secretValues 문자열을 마스킹
- `findSensitiveValues(obj: object)` — 객체에서 sensitive key (api_key, auth, token, password 등)에 해당하는 값 추출
- SENSITIVE_SUBSTRINGS: `['api_key', 'apikey', 'api-key', 'auth', 'jwt', 'passwd', 'password', 'pswd', 'secret', 'set-cookie', 'signature', 'token']`
- 라이브러리 위치: `node_modules/.bun/@zapier+secret-scrubber@1.1.6/`

### 정규식 패턴 설계

```typescript
const REDACTED = '***REDACTED***'

const PATTERNS: RegExp[] = [
  /sk-ant-[a-zA-Z0-9_-]{20,}/g,        // Claude CLI tokens (sk-ant-api03-xxx...)
  /\bPS[a-zA-Z0-9]{30,}/g,              // KIS API appkey (PS로 시작하는 32자+)
  /\b\d{8,10}:[A-Za-z0-9_-]{35,}/g,     // Telegram bot tokens (123456789:ABCdef...)
]
```

### 구현 로직

```typescript
// 1. 정규식 패턴 매칭 → ***REDACTED*** 치환
for (const pattern of PATTERNS) {
  result = result.replace(pattern, REDACTED)
}

// 2. JSON 페이로드 → @zapier/secret-scrubber 적용
try {
  const obj = JSON.parse(result)
  const secrets = findSensitiveValues(obj)
  if (secrets.length > 0) {
    result = JSON.stringify(scrub(obj, secrets))
  }
} catch { /* 비JSON — 정규식만 적용 */ }
```

### 테스트 전략

- **모킹 불필요:** `@zapier/secret-scrubber`는 순수 함수이므로 실제 실행 (E9)
- **패턴 테스트:** 각 정규식 패턴별 독립 테스트
- **JSON 테스트:** `findSensitiveValues`가 password/api_key 감지하는지 확인
- **안전 테스트:** 일반 문자열은 변경 안 됨 확인

### Previous Story Intelligence (Story 3.1)

- **패턴:** engine/hooks/ 디렉토리 이미 생성됨 (Story 3.1)
- **테스트:** `makeCtx()` 헬퍼 패턴 동일
- **빌드:** tsc 0 errors + bun test 전부 PASS 필수
- **차이점:** credential-scrubber는 동기 함수 (DB 접근 없음). tool-permission-guard는 async.

### Project Structure Notes

- `packages/server/src/engine/hooks/` 디렉토리 존재 (Story 3.1에서 생성)
- 테스트: `packages/server/src/__tests__/unit/credential-scrubber.test.ts`
- `@zapier/secret-scrubber` 이미 설치됨 (Story 1.1에서 설치, package.json 확인)

### References

- [Source: epics.md → Story 3.2 (lines 379-398)]
- [Source: architecture.md → D4 (Hook 순서), E2 (Hook 구현 표준), E9 (모킹 전략)]
- [Source: engine/types.ts → SessionContext (line 4-13)]
- [Source: @zapier/secret-scrubber → scrub(), findSensitiveValues(), SENSITIVE_SUBSTRINGS]
- [Source: Story 3.1 → engine/hooks/ 디렉토리 생성, 테스트 패턴]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- **credential-scrubber.ts:** 30 lines. Synchronous PostToolUse hook with 3 regex patterns (Claude CLI tokens, KIS API keys, Telegram bot tokens) + @zapier/secret-scrubber JSON payload detection.
- **Dual-layer scrubbing:** Regex for domain-specific patterns + findSensitiveValues/scrub for JSON payloads with sensitive keys (api_key, password, auth, token, etc.)
- **Tests:** 7 tests — Claude CLI token, Telegram bot token, KIS API key, JSON api_key/password detection, clean passthrough, multi-pattern simultaneous masking, JSON password field.
- **tsc:** 0 errors. All 7 tests pass.

### File List

- `packages/server/src/engine/hooks/credential-scrubber.ts` — NEW: PostToolUse credential scrubber (30 lines)
- `packages/server/src/__tests__/unit/credential-scrubber.test.ts` — NEW: 7 unit tests
