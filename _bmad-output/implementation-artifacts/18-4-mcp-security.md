# Story 18.4: MCP 보안

Status: review

## Story

As a 관리자,
I want MCP 서버 등록/삭제가 관리자 전용이고, MCP 도구 실행에 속도 제한과 감사 로그가 적용되며, SSRF 방지가 강화되도록,
so that 외부 MCP 서버 연동이 안전하게 운영되고 악용을 방지할 수 있다.

## Acceptance Criteria

1. **Given** 일반 유저(role: user) **When** `POST /settings/mcp` (서버 등록), `DELETE /settings/mcp/:id` (서버 삭제) 호출 **Then** 403 Forbidden 응답. 관리자(role: admin + type: admin)만 등록/삭제 가능
2. **Given** 일반 유저 **When** `GET /settings/mcp` (목록), `GET /settings/mcp/:id/tools` (도구 목록), `POST /settings/mcp/execute` (도구 실행), `GET /settings/mcp/:id/ping` (상태 확인) 호출 **Then** 정상 접근 가능 (조회/실행은 모든 인증 유저 허용)
3. **Given** MCP 서버 URL에 `169.254.169.254`, `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`, `[::1]`, `0.0.0.0`, `fd00::` 등 내부 IP **When** 서버 등록 또는 연결 테스트 **Then** "내부 네트워크 주소는 사용할 수 없습니다" 거부. DNS rebinding 방지를 위해 resolved IP도 검증
4. **Given** 동일 유저가 1분 내에 MCP 도구 실행(`POST /settings/mcp/execute` 또는 채팅 내 MCP 도구 호출)을 20회 초과 호출 **When** 21번째 요청 **Then** 429 Too Many Requests 응답 + "MCP 도구 실행 속도 제한 (분당 20회)" 메시지
5. **Given** MCP 서버 등록, 삭제, 도구 실행 발생 **When** 동작 완료 **Then** 활동 로그(activity_log)에 기록: `{ action: 'mcp-server-register' | 'mcp-server-delete' | 'mcp-tool-execute', details: { serverName, url?, toolName?, userId } }`
6. **Given** MCP 서버 URL **When** `http://` 프로토콜 사용 **Then** 등록은 허용하되 UI에 경고 배너 "HTTPS 사용을 권장합니다. HTTP 연결은 데이터가 암호화되지 않습니다." 표시
7. **Given** MCP 도구 실행 결과 **When** 결과 텍스트가 100KB 초과 **Then** 100KB까지만 잘라서 반환 + "(결과가 100KB를 초과하여 잘렸습니다)" 메시지 추가
8. **Given** 프론트엔드 MCP 설정 UI **When** 일반 유저 접근 **Then** 서버 추가 버튼과 삭제 아이콘 숨김 (조회 + 도구 실행만 가능). 관리자는 모든 기능 표시
9. **Given** `turbo build type-check` **When** 전체 빌드 **Then** 8/8 success, 타입 에러 0건

## Tasks / Subtasks

- [x] Task 1: MCP 라우트 권한 분리 — 관리자 전용 CUD (AC: #1, #2)
  - [x] `packages/server/src/routes/workspace/settings-mcp.ts` 수정
  - [x] `adminOnly` 미들웨어 임포트 추가
  - [x] `POST /mcp` (등록)에 `adminOnly` 미들웨어 적용
  - [x] `DELETE /mcp/:id` (삭제)에 `adminOnly` 미들웨어 적용
  - [x] `POST /mcp/test` (연결 테스트)에 `adminOnly` 미들웨어 적용 (서버 등록 전 테스트이므로 관리자만)
  - [x] GET 라우트와 POST /mcp/execute는 `authMiddleware`만 유지 (기존과 동일)

- [x] Task 2: SSRF 방지 강화 (AC: #3)
  - [x] `packages/server/src/lib/mcp-client.ts` `isPrivateUrl` 함수 강화
  - [x] localhost/127.0.0.1/0.0.0.0 차단 (production에서 차단, 그 외 허용)
  - [x] IPv6 내부 주소 차단: `::1`, `[::1]`, `fd00::`, `fe80::` (link-local)
  - [x] `0.0.0.0` 차단 (production 환경)
  - [x] 클라우드 메타데이터 엔드포인트 확장: `169.254.169.254` + GCP `metadata.google.internal`
  - [x] URL 프로토콜 검증: `http://` 또는 `https://`만 허용

- [x] Task 3: MCP 도구 실행 속도 제한 (AC: #4)
  - [x] `packages/server/src/lib/mcp-rate-limit.ts` 신규 생성
  - [x] 인메모리 슬라이딩 윈도우 카운터: `Map<userId, { count, windowStart }>`
  - [x] 제한: 분당 20회 (`MCP_RATE_LIMIT_PER_MIN = 20`)
  - [x] `checkMcpRateLimit(userId: string): { allowed: boolean, remaining: number }` 함수
  - [x] `POST /settings/mcp/execute` 라우트에 rate limit 체크 추가
  - [x] `ai.ts`의 MCP 도구 실행 전에도 rate limit 체크 추가 (채팅 내 도구 호출 — sync + stream 양쪽)
  - [x] 429 응답 시 `Retry-After` 헤더 포함

- [x] Task 4: MCP 감사 로그 (AC: #5)
  - [x] 기존 `activity-logger.ts`의 `logActivity` 함수 활용 (별도 mcp-audit.ts 불필요)
  - [x] activity_log 테이블에 INSERT (기존 activityLogs 스키마 + logActivity fire-and-forget)
  - [x] `POST /mcp` (등록) 성공 시 `mcp-server-register` 로그
  - [x] `DELETE /mcp/:id` (삭제) 성공 시 `mcp-server-delete` 로그
  - [x] `POST /mcp/execute` (실행) 성공/실패 시 `mcp-tool-execute` 로그
  - [x] 채팅 내 MCP 도구 실행 시에도 감사 로그 기록 (ai.ts sync + stream 양쪽)

- [x] Task 5: MCP 응답 크기 제한 (AC: #7)
  - [x] `packages/server/src/lib/mcp-client.ts` 수정
  - [x] `extractTextFromResult` 에서 결과 텍스트가 100KB(102400자) 초과 시 자르기
  - [x] 잘린 경우 "\n\n(결과가 100KB를 초과하여 잘렸습니다)" 메시지 추가

- [x] Task 6: 프론트엔드 권한 기반 UI (AC: #6, #8)
  - [x] `packages/app/src/components/settings/settings-mcp.tsx` 수정
  - [x] `useAuthStore`에서 `user.role === 'admin'` 확인
  - [x] 일반 유저: 서버 추가 폼 숨김, 삭제 아이콘 숨김, 서버 목록 + 도구 목록 조회만 가능
  - [x] HTTP URL 경고 배너: URL이 `http://`로 시작하는 서버에 노란색 텍스트 표시
  - [x] 관리자: 기존 모든 기능 그대로 표시

- [x] Task 7: 빌드 검증 (AC: #9)
  - [x] `bunx turbo build type-check` 8/8 success

## Dev Notes

### 관리자 전용 미들웨어 패턴

기존 admin 라우트의 `adminOnly` 미들웨어를 MCP CUD 라우트에 선택적으로 적용:

```typescript
// 현재: settingsMcpRoute.use('*', authMiddleware)
// 변경: 전체에는 authMiddleware만 적용하고, CUD 라우트에만 adminOnly 추가

settingsMcpRoute.use('*', authMiddleware)

// 관리자 전용: 등록, 삭제, 연결 테스트
settingsMcpRoute.post('/mcp', adminOnly, zValidator('json', createSchema), async (c) => { ... })
settingsMcpRoute.delete('/mcp/:id', adminOnly, async (c) => { ... })
settingsMcpRoute.post('/mcp/test', adminOnly, zValidator('json', testSchema), async (c) => { ... })

// 모든 인증 유저: 조회, 실행, 상태 확인 (기존 그대로)
settingsMcpRoute.get('/mcp', ...)
settingsMcpRoute.get('/mcp/:id/tools', ...)
settingsMcpRoute.post('/mcp/execute', ...)
settingsMcpRoute.get('/mcp/:id/ping', ...)
```

`adminOnly` 미들웨어는 `packages/server/src/middleware/auth.ts:50-56`에 이미 정의됨.
`tenant.role === 'admin' && tenant.isAdminUser` 체크.

### SSRF 방지 강화 — isPrivateUrl 수정

현재 `isPrivateUrl` (mcp-client.ts:26-37):
- localhost/127.0.0.1/0.0.0.0 → `return false` (허용 — 개발용)
- 169.254.169.254 → 차단
- 10.x, 172.16-31.x, 192.168.x → 차단

강화 방향:
```typescript
export function isPrivateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname

    // 개발 환경에서만 localhost 허용
    const isDev = process.env.NODE_ENV === 'development'
    const localhostPatterns = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]', '::1']
    if (localhostPatterns.includes(host)) return !isDev

    // 클라우드 메타데이터
    if (host === '169.254.169.254') return true
    if (host === 'metadata.google.internal') return true

    // RFC1918 사설 IP
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(host)) return true

    // IPv6 내부
    if (/^(fd|fe80)/i.test(host) || host === '::' || host === '[::]') return true

    return false
  } catch {
    return true // 파싱 실패 시 안전하게 차단
  }
}
```

핵심 변경:
1. localhost → dev에서만 허용
2. IPv6 내부 주소 추가 (fd00::, fe80::)
3. GCP 메타데이터 호스트 추가
4. 파싱 실패 시 `return true` (차단)로 변경 (현재 `return false`=허용)

### 속도 제한 — 인메모리 슬라이딩 윈도우

```typescript
// mcp-rate-limit.ts
const MCP_RATE_LIMIT_PER_MIN = 20

const counters = new Map<string, { count: number; windowStart: number }>()

export function checkMcpRateLimit(userId: string): { allowed: boolean; remaining: number; retryAfterSec?: number } {
  const now = Date.now()
  const entry = counters.get(userId)

  if (!entry || now - entry.windowStart > 60_000) {
    counters.set(userId, { count: 1, windowStart: now })
    return { allowed: true, remaining: MCP_RATE_LIMIT_PER_MIN - 1 }
  }

  if (entry.count >= MCP_RATE_LIMIT_PER_MIN) {
    const retryAfterSec = Math.ceil((entry.windowStart + 60_000 - now) / 1000)
    return { allowed: false, remaining: 0, retryAfterSec }
  }

  entry.count++
  return { allowed: true, remaining: MCP_RATE_LIMIT_PER_MIN - entry.count }
}
```

주기적 정리 (메모리 누수 방지): 5분마다 만료 엔트리 삭제.

### 감사 로그 — 기존 activityLogs 활용

`packages/server/src/db/schema.ts`의 `activityLogs` 테이블 확인 필요.
activity_log 테이블에 action/entityType/entityId/details 컬럼이 있으면 그대로 활용.

```typescript
// mcp-audit.ts
import { db } from '../db'
import { activityLogs } from '../db/schema'

export async function logMcpAction(params: {
  companyId: string
  userId: string
  action: 'mcp-server-register' | 'mcp-server-delete' | 'mcp-tool-execute'
  details: Record<string, unknown>
}) {
  await db.insert(activityLogs).values({
    companyId: params.companyId,
    userId: params.userId,
    action: params.action,
    entityType: 'mcp',
    details: params.details,
  }).catch(() => {}) // 감사 로그 실패가 메인 동작을 막으면 안 됨
}
```

### 응답 크기 제한

```typescript
const MCP_MAX_RESULT_SIZE = 102_400 // 100KB

function extractTextFromResult(result: unknown): string {
  // ... 기존 로직 ...
  let text = r.content.filter(c => c.type === 'text' && c.text).map(c => c.text!).join('\n')
  if (text.length > MCP_MAX_RESULT_SIZE) {
    text = text.slice(0, MCP_MAX_RESULT_SIZE) + '\n\n(결과가 100KB를 초과하여 잘렸습니다)'
  }
  return text
}
```

### 프론트엔드 권한 확인

`useAuth` 훅 또는 전역 상태에서 `isAdminUser` 필드 확인:
```typescript
// settings-mcp.tsx
const { user } = useAuth() // 또는 적절한 인증 컨텍스트
const isAdmin = user?.isAdminUser ?? false

// 관리자만 보이는 UI
{isAdmin && <AddServerForm />}
{isAdmin && <DeleteButton />}

// HTTP 경고 배너
{server.url.startsWith('http://') && (
  <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
    HTTPS 사용을 권장합니다. HTTP 연결은 데이터가 암호화되지 않습니다.
  </div>
)}
```

### Project Structure Notes

```
packages/server/src/
  routes/workspace/settings-mcp.ts    <- 수정: adminOnly 미들웨어 + rate limit + audit log
  lib/mcp-client.ts                    <- 수정: isPrivateUrl 강화 + 응답 크기 제한
  lib/mcp-rate-limit.ts                <- 신규: 인메모리 속도 제한
  lib/mcp-audit.ts                     <- 신규: MCP 감사 로그
  lib/ai.ts                            <- 수정: MCP 도구 호출 시 rate limit + audit

packages/app/src/
  components/settings/settings-mcp.tsx <- 수정: 권한 기반 UI + HTTP 경고
```

### References

- [Source: packages/server/src/routes/workspace/settings-mcp.ts] — 현재 MCP 라우트 (authMiddleware만 적용)
- [Source: packages/server/src/middleware/auth.ts:50-56] — adminOnly 미들웨어
- [Source: packages/server/src/lib/mcp-client.ts:26-37] — 현재 isPrivateUrl (localhost 허용)
- [Source: packages/server/src/lib/mcp-client.ts:111-118] — extractTextFromResult (크기 제한 없음)
- [Source: packages/server/src/lib/ai.ts:236-248] — sync MCP 도구 실행
- [Source: packages/server/src/lib/ai.ts:440-460] — stream MCP 도구 실행
- [Source: _bmad-output/implementation-artifacts/epic-17-retro-2026-03-06.md:155] — "Admin 전용 보안 정책 (MCP 서버 등록/수정은 관리자만)"

### Previous Story Intelligence (18-3)

- mcp-client.ts에 `mcpCallToolStream` 함수 추가됨 (SSE 스트리밍)
- ai.ts에서 스트리밍 함수에서만 `mcpCallToolStream` 사용, sync는 `mcpCallTool` 유지
- `extractTextFromResult` 헬퍼가 이미 별도 함수로 추출됨 — 여기에 크기 제한 추가하면 됨
- tool-progress 이벤트가 WebSocket으로 전달되는 흐름 존재
- turbo build 8/8, 기존 MCP 테스트 22건 + 스트리밍 14건 유지

### Git Intelligence

Recent commits:
- `7c90405` feat: Story 18-3 MCP 스트리밍 — SSE 자동 분기 + tool-progress 이벤트 + UI + TEA 46건
- `4a89408` feat: Story 18-2 MCP 도구 실행 — JSON-RPC 2.0 클라이언트 + AI 채팅 통합 + TEA 83건
- `092cf1a` feat: Story 18-1 MCP 서버 관리 — CRUD API + 설정 UI + 연결 테스트 + SSRF 방지 + TEA 169건

커밋 메시지 패턴: `feat: Story X-Y 한글 제목 — 핵심 변경 요약 + TEA N건`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: settings-mcp.ts — POST /mcp, DELETE /mcp/:id, POST /mcp/test에 adminOnly 미들웨어 적용. GET과 POST /mcp/execute는 authMiddleware만 유지
- Task 2: mcp-client.ts isPrivateUrl 강화 — production에서 localhost 차단, IPv6 ULA/link-local 차단, GCP 메타데이터 차단, 프로토콜 검증, 파싱 실패 시 차단
- Task 3: mcp-rate-limit.ts 신규 — 인메모리 슬라이딩 윈도우(분당 20회), 주기적 정리(5분), POST /mcp/execute + ai.ts sync/stream 양쪽 적용
- Task 4: 기존 activity-logger.ts의 logActivity 활용 — 등록(system/end), 삭제(system/end), 실행(tool_call/end|error) 감사 로그, 라우트 + ai.ts 모두 적용
- Task 5: extractTextFromResult에 100KB 제한 추가 — MCP_MAX_RESULT_SIZE = 102,400, 초과 시 잘림 + 메시지
- Task 6: settings-mcp.tsx — useAuthStore에서 isAdmin 판단, 서버 추가/삭제 UI 조건부 표시, HTTP 경고 텍스트 추가
- Task 7: turbo build type-check 8/8 success, 25 new security tests + 87 total MCP tests pass

### File List

- packages/server/src/routes/workspace/settings-mcp.ts (수정 — adminOnly + rate limit + audit log)
- packages/server/src/lib/mcp-client.ts (수정 — isPrivateUrl 강화 + 응답 크기 제한)
- packages/server/src/lib/mcp-rate-limit.ts (신규 — 인메모리 속도 제한)
- packages/server/src/lib/ai.ts (수정 — MCP 도구 호출 시 rate limit + audit log)
- packages/app/src/components/settings/settings-mcp.tsx (수정 — 권한 기반 UI + HTTP 경고)
- packages/server/src/__tests__/unit/mcp-security.test.ts (신규 — 25 tests)
