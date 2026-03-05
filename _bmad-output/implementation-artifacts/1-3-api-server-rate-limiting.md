# Story 1.3: Hono API 서버 + 표준 응답 + Rate Limiting

Status: review

## Story

As a 개발자,
I want API 서버가 표준화된 응답 형식과 보안 기본값으로 동작하기를,
so that 프론트엔드가 예측 가능한 구조로 통신하고 무차별 대입 공격을 방어할 수 있다.

## Acceptance Criteria

1. **Given** 서버 시작 / **When** `GET /api/health` 호출 / **Then** `{ status: 'ok', checks: { db: true }, version: { build, hash, uptime } }` 반환
2. 모든 성공 응답: `{ data: T }` 또는 `{ data: [...], meta: { page, total } }` 구조
3. 모든 에러 응답: `{ error: { code: string, message: string } }` 구조
4. 에러 코드 정의: AUTH_001, AUTH_002, AUTH_003, TENANT_001, AGENT_001, AGENT_002, **TRADE_001, TRADE_002, TOOL_001, TOOL_002** 포함
5. Rate limit: 로그인 엔드포인트 분당 5회 / 일반 API 분당 100회 초과 시 429 응답
6. Graceful Shutdown: SIGTERM 시 진행 중 요청 최대 10초 대기 후 종료
7. `packages/server/src/lib/logger.ts` 개발=텍스트 / 운영=JSON 포맷

## Tasks / Subtasks

- [x] Task 1: `/api/health` 라우트 완성 (AC: #1)
  - [x] `packages/server/src/routes/health.ts` 업데이트
  - [x] DB ping 쿼리 추가 (`SELECT 1` 성공 여부 → `checks.db`)
  - [x] `version.build` = `process.env.BUILD_NUMBER || 'dev'`
  - [x] `version.hash` = `process.env.GITHUB_SHA?.slice(0,7) || ''`
  - [x] `version.uptime` = `Math.floor(process.uptime())` (초 단위)
  - [x] 응답 구조: `{ status: 'ok', checks: { db: true }, version: { build, hash, uptime } }` (data 래핑 없음 — health는 직접 응답)

- [x] Task 2: Rate Limiting 미들웨어 추가 (AC: #5)
  - [x] `packages/server/src/middleware/rate-limit.ts` 생성
  - [x] in-memory Map 기반 구현 (IP+endpoint 키, 1분 윈도우)
  - [x] `loginRateLimit`: 분당 5회, 초과 시 429 + `{ error: { code: 'AUTH_004', message: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' } }`
  - [x] `apiRateLimit`: 분당 100회, 초과 시 429 + `{ error: { code: 'RATE_001', message: 'API 요청 한도 초과' } }`
  - [x] `packages/server/src/index.ts`에 rate limit 미들웨어 등록:
    - `/api/auth/login` 라우트에 `loginRateLimit` 적용
    - `/api/*` 전체에 `apiRateLimit` 적용

- [x] Task 3: Graceful Shutdown 추가 (AC: #6)
  - [x] `packages/server/src/index.ts` 하단에 SIGTERM 핸들러 추가
  - [x] 새 요청 차단 플래그 설정 → 10초 대기 → `process.exit(0)`
  - [x] `console.log('🛑 서버 종료 중...')` 로그 출력

- [x] Task 4: 구조화 로거 구현 (AC: #7)
  - [x] `packages/server/src/lib/logger.ts` 생성
  - [x] `NODE_ENV === 'production'` 시 JSON 포맷: `{ timestamp, level, message, ...meta }`
  - [x] 개발 시 컬러 텍스트 포맷: `[HH:MM:SS] LEVEL message`
  - [x] export: `logger.info()`, `logger.warn()`, `logger.error()`, `logger.debug()`

- [x] Task 5: 에러 코드 표준 완성 (AC: #4)
  - [x] `packages/shared/src/constants.ts`에 누락 코드 추가:
    ```typescript
    TRADE_001: '자동매매 한도 초과',
    TRADE_002: '모의/실투자 모드 불일치',
    TOOL_001: 'API key 없음 또는 조회 실패',
    TOOL_002: '도구 실행 타임아웃',
    ```

## Dev Notes

### ⚠️ 현재 코드베이스 상태

**이미 구현된 항목:**
- ✅ `packages/server/src/index.ts` — Hono 앱, CORS, errorHandler, 라우트 마운트, Bun 정적 서빙, 포트 3000
- ✅ `packages/server/src/middleware/error.ts` — `HTTPError` 클래스 + `errorHandler` (`{ error: { code, message } }` 구조)
- ✅ `packages/server/src/middleware/auth.ts` — JWT 인증 미들웨어
- ✅ `packages/server/src/middleware/tenant.ts` — 테넌트 격리 미들웨어
- ✅ `packages/shared/src/types.ts` — `ApiResponse<T>`, `ApiError` 타입 정의 완료
- ✅ `packages/shared/src/constants.ts` — 에러 코드 부분 정의 (AUTH_001~003, TENANT_001~002, AGENT_001~003 등)

**수정/추가가 필요한 항목:**

| 항목 | 파일 | 현재 상태 | 필요 작업 |
|------|------|----------|----------|
| `/api/health` | `routes/health.ts` | `{ data: { status, version, timestamp } }` — DB체크/build/hash/uptime 없음 | 업데이트 |
| Rate Limiting | — | 미존재 | 신규 생성 |
| Graceful Shutdown | `index.ts` | SIGTERM 핸들러 없음 | 추가 |
| 구조화 로거 | `lib/logger.ts` | 미존재 (`hono/logger`만 사용) | 신규 생성 |
| TRADE_001, TRADE_002, TOOL_001, TOOL_002 | `shared/constants.ts` | 미정의 | 추가 |

### 구현 패턴

**health.ts 수정 예시:**
```typescript
import { Hono } from 'hono'
import { db } from '../db'
import { sql } from 'drizzle-orm'

export const healthRoute = new Hono()

healthRoute.get('/health', async (c) => {
  let dbOk = false
  try {
    await db.execute(sql`SELECT 1`)
    dbOk = true
  } catch { /* db not available */ }

  return c.json({
    status: 'ok',
    checks: { db: dbOk },
    version: {
      build: process.env.BUILD_NUMBER || 'dev',
      hash: process.env.GITHUB_SHA?.slice(0, 7) || '',
      uptime: Math.floor(process.uptime()),
    },
  })
})
```

**rate-limit.ts 구현 가이드:**
```typescript
// packages/server/src/middleware/rate-limit.ts
import type { MiddlewareHandler } from 'hono'

const createRateLimiter = (limit: number, windowMs: number): MiddlewareHandler => {
  const store = new Map<string, { count: number; resetAt: number }>()

  return async (c, next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
    const key = `${ip}:${c.req.path}`
    const now = Date.now()

    const entry = store.get(key)
    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    if (entry.count >= limit) {
      return c.json(
        { error: { code: 'RATE_001', message: 'Too many requests' } },
        429
      )
    }

    entry.count++
    return next()
  }
}

export const loginRateLimit = createRateLimiter(5, 60_000)   // 5/min
export const apiRateLimit = createRateLimiter(100, 60_000)   // 100/min
```

**Graceful Shutdown (index.ts 하단에 추가):**
```typescript
// SIGTERM 핸들러 (Docker 배포 시 사용)
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM 수신 — 서버 종료 중...')
  // Bun HTTP 서버 직접 제어가 어려우므로 10초 후 강제 종료
  setTimeout(() => {
    console.log('✅ 서버 종료')
    process.exit(0)
  }, 10_000)
})
```

**logger.ts 구현:**
```typescript
// packages/server/src/lib/logger.ts
const isProd = process.env.NODE_ENV === 'production'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  if (isProd) {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...meta }))
  } else {
    const time = new Date().toTimeString().slice(0, 8)
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[36m', info: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m'
    }
    console.log(`${colors[level]}[${time}] ${level.toUpperCase()}\x1b[0m ${message}`, meta || '')
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
}
```

### Rate Limiter 등록 위치 (index.ts)

```typescript
import { loginRateLimit, apiRateLimit } from './middleware/rate-limit'

// Rate limiting (글로벌 미들웨어 바로 아래 추가)
app.use('/api/*', apiRateLimit)       // 일반 API: 100/min
// 로그인 라우트에만 별도 제한은 authRoute 내부에서 적용하거나
// app.use('/api/auth/login', loginRateLimit) 형태로 추가
```

### Project Structure Notes

```
packages/server/src/
├── index.ts               ← SIGTERM 핸들러 추가 필요
├── lib/
│   ├── logger.ts          ← 신규 생성 (구조화 로거)
│   ├── activity-logger.ts ← 기존 (활동 로그 DB 기록용)
│   ├── ai.ts              ← 기존
│   ├── job-queue.ts       ← 기존
│   └── ...
├── middleware/
│   ├── rate-limit.ts      ← 신규 생성
│   ├── auth.ts            ← 기존
│   ├── error.ts           ← 기존
│   └── tenant.ts          ← 기존
└── routes/
    └── health.ts          ← 업데이트 필요

packages/shared/src/
└── constants.ts           ← TRADE_001, TRADE_002, TOOL_001, TOOL_002 추가
```

### 파일명 컨벤션

- `rate-limit.ts` (kebab-case, NOT `rateLimit.ts`)
- `logger.ts` (단순 명사)

### References

- [Source: epics.md#Story 1.3] — AC 및 story
- [Source: packages/server/src/index.ts] — 현재 서버 진입점 (이미 구현된 구조)
- [Source: packages/server/src/middleware/error.ts] — `HTTPError` + `errorHandler`
- [Source: packages/server/src/routes/health.ts] — 현재 health 라우트 (수정 필요)
- [Source: packages/shared/src/types.ts] — `ApiResponse<T>`, `ApiError` 타입
- [Source: packages/shared/src/constants.ts] — 현재 에러 코드 (TRADE/TOOL 누락)
- [Source: architecture.md#Component 3] — API Server (Hono) 스펙

## Dev Agent Record

### Agent Model Used

claude-opus-4-6

### Debug Log References

### Completion Notes List

- ✅ Task 1: health 라우트 완성 — DB ping (SELECT 1), build/hash/uptime 포함, data 래핑 없이 직접 응답
- ✅ Task 2: Rate Limiting — in-memory Map 기반, loginRateLimit(5/min, AUTH_004), apiRateLimit(100/min, RATE_001), 5분 간격 만료 정리
- ✅ Task 3: Graceful Shutdown — SIGTERM 핸들러, 10초 대기 후 process.exit(0)
- ✅ Task 4: 구조화 로거 — dev=컬러 텍스트 [HH:MM:SS] LEVEL msg, prod=JSON {timestamp,level,message,...meta}
- ✅ Task 5: 에러 코드 추가 — TRADE_001/002, TOOL_001/002, AUTH_004, RATE_001
- ✅ 전체 빌드 성공 (8 tasks), 타입 체크 성공
- ✅ 전체 테스트 성공 (49 pass, 0 fail): unit(41) + shared(4) + app(4)

### Change Log

- 2026-03-05: Story 1.3 구현 완료 — API 서버 보안 기본값 + 표준화 (5개 태스크)

### File List

- packages/server/src/routes/health.ts (수정 — DB ping, build/hash/uptime 추가)
- packages/server/src/middleware/rate-limit.ts (신규 — Rate Limiting 미들웨어)
- packages/server/src/index.ts (수정 — rate limit 등록 + SIGTERM 핸들러)
- packages/server/src/lib/logger.ts (신규 — 구조화 로거)
- packages/shared/src/constants.ts (수정 — TRADE/TOOL/AUTH_004/RATE_001 에러 코드 추가)
- packages/server/src/__tests__/unit/rate-limit.test.ts (신규 — Rate Limit 테스트 4건)
- packages/server/src/__tests__/unit/logger.test.ts (신규 — 로거 테스트 3건)
- packages/server/src/__tests__/unit/health.test.ts (신규 — Health 라우트 테스트 2건)
- packages/server/src/__tests__/unit/error-codes.test.ts (신규 — 에러 코드 테스트 5건)
