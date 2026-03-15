# Story 16.1: Dependency Verification & Dockerfile Setup

Status: done

## Story

As a **Technical Admin (박현우)**,
I want all Phase 1 new packages (puppeteer, p-queue, aws-sdk, marked) to be verified working on ARM64, and the Dockerfile to have Korean font and Puppeteer cache support,
So that subsequent tool stories can rely on these dependencies without compatibility surprises.

## Acceptance Criteria

**AC1 — ARM64 패키지 설치 (puppeteer)**
- Given: ARM64 Bun 환경
- When: `bun add puppeteer@22.15.0 p-queue@8.0.1 @aws-sdk/client-s3@3.717.0 marked@12.0.0` 실행 (exact pin, `^` 없음)
- Then: 모든 패키지 ARM64-specific 에러 없이 설치 완료 ✅
- And: Puppeteer launch → snap Chromium 경유 (`PUPPETEER_EXECUTABLE_PATH=/snap/bin/chromium`) ✅

**AC2 — Dockerfile 한국어 폰트 + Puppeteer 캐시**
- Given: Dockerfile production 스테이지
- When: Alpine `apk add chromium font-noto font-noto-cjk` + `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser` 추가
- Then: Docker 빌드 레이어 업데이트 완료 ✅

**AC3 — p-queue ESM import 검증**
- Given: Bun 런타임
- When: `import PQueue from 'p-queue'`
- Then: ✅ import 성공, `concurrency: 5` 설정 확인

**AC4 — MCP stdio PoC (Notion MCP 3-way handshake)**
- Given: `child_process.spawn('npx', ['-y', '@notionhq/notion-mcp-server'], { env: {...} })`
- When: newline-delimited JSON으로 initialize 요청 전송
- Then: ✅ initialize response 수신 (protocolVersion: 2024-11-05, cold start: 5506ms)
- And: ✅ `tools/list` → 22개 Notion MCP 도구 반환 (Epic 18 feasibility confirmed)

## Tasks / Subtasks

- [x] Task 1: 패키지 설치 및 ARM64 호환성 검증 (AC: #1)
  - [x] 1.1: `packages/server/package.json`에 4개 의존성 추가 (exact pin, no `^`)
    - `puppeteer`: `22.15.0` ✅
    - `p-queue`: `8.0.1` ✅
    - `@aws-sdk/client-s3`: `3.717.0` ✅
    - `marked`: `12.0.0` ✅
  - [x] 1.2: `bun install` 실행 → ARM64 에러 없음 확인 (372 packages installed)
  - [x] 1.3: Puppeteer ARM64 실행 테스트 스크립트 작성 (`scripts/verify-deps.ts`)
    - 결과: 번들 Chromium x64 전용 (ENOEXEC on aarch64)
    - 해결: `PUPPETEER_EXECUTABLE_PATH=/snap/bin/chromium` → `Chrome/145.0.7632.116` ✅

- [x] Task 2: p-queue ESM import 검증 (AC: #3)
  - [x] 2.1: `scripts/verify-deps.ts`에 p-queue import 테스트 포함 ✅
  - [x] 2.2: ESM import 성공 — fallback `async-sema` 불필요 ✅

- [x] Task 3: Dockerfile 수정 (AC: #2)
  - [x] 3.1: Alpine 기반 유지 + `apk add chromium nss freetype harfbuzz ca-certificates`
  - [x] 3.2: 한국어 폰트 레이어: `apk add font-noto font-noto-cjk`
  - [x] 3.3: `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` + `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser`
  - [x] 3.4: Dockerfile 수정 완료

- [x] Task 4: MCP stdio PoC 스크립트 작성 (AC: #4)
  - [x] 4.1: `scripts/mcp-poc.ts` 작성 — Notion MCP child_process.spawn + newline-delimited JSON
  - [x] 4.2: initialize 응답 파싱 검증 ✅ (4493ms)
  - [x] 4.3: `tools/list` 전송 + 22개 도구 반환 확인 ✅ (9ms)
  - [x] 4.4: `scripts/mcp-poc-result.md`에 결과 기록 ✅ (cold start 5506ms, npx first-run 포함)

- [x] Task 5: 검증 테스트 작성 (AC: #1, #3)
  - [x] 5.1: `packages/server/src/__tests__/unit/deps-verification.test.ts` 작성 (21 tests)
  - [x] 5.2: p-queue import + PQueue 인스턴스 생성 테스트 ✅
  - [x] 5.3: marked import + markdown→HTML 변환 기본 테스트 ✅ (한국어, 테이블, 코드블록)
  - [x] 5.4: @aws-sdk/client-s3 import + S3Client 인스턴스 생성 테스트 ✅

## Dev Notes

### 핵심 아키텍처 컨텍스트

**이 스토리의 목적:**
Story 16.1은 Epic 16~21 전체 Phase 1 구현의 **"착륙 테스트(smoke test)"** 스토리. 실제 tool 핸들러 구현 전에 의존성 호환성을 확인하여 이후 스토리에서 ARM64 호환성 문제가 재발하지 않도록 보장.

**블로킹 관계:**
- Story 16.1 완료 → 16.3 (AES-256 크립토), 17.2 (Puppeteer 풀), 17.5 (R2), 18.1 (MCP DB), 18.2 (MCP 트랜스포트) 착수 가능
- MCP PoC 성공이 Epic 18 전체 아키텍처(E12: 8단계 수명주기)의 타당성 전제

**D24 Puppeteer 풀 (확인 완료):**
- ARM64 결정: `PUPPETEER_EXECUTABLE_PATH` 필수 (번들 Chromium = x64 전용)
- 로컬 ARM64: `/snap/bin/chromium` (Chrome 145.0.7632.116)
- Docker (Alpine): `/usr/bin/chromium-browser` (apk add chromium)

**D25 MCP Transport (PoC 완료):**
- Phase 1: stdio CONFIRMED — child_process.spawn Bun 호환 ✅
- **중요 발견**: `@notionhq/notion-mcp-server`는 **newline-delimited JSON** 사용 (LSP Content-Length framing 아님)
- mcp-manager.ts (Story 18.3) 구현 시 `split('\n')` 기반 파싱 필수

**D26 MCP Cold Start:**
- npx first-run cold start: 5506ms (npm 패키지 다운로드 포함)
- Warm start (캐시 후): 훨씬 빠를 것 (3s SLA 달성 가능)
- tools/list 응답: 9ms (extremely fast once initialized)

### 파일 위치 규칙

```
packages/server/
├── package.json          [MODIFIED: 4개 의존성 추가, exact pin]
└── scripts/
    ├── verify-deps.ts    [NEW: ARM64 + ESM 검증 스크립트]
    ├── mcp-poc.ts        [NEW: Notion MCP JSON-RPC PoC]
    └── mcp-poc-result.md [NEW: PoC 결과 기록]

/Dockerfile               [MODIFIED: Alpine chromium + fonts + PUPPETEER_EXECUTABLE_PATH]

packages/server/src/__tests__/unit/
└── deps-verification.test.ts [NEW: 21 tests]
```

### Dockerfile 수정 가이드

현재 Dockerfile은 `oven/bun:1.3.10-alpine` 사용. Alpine에서 Puppeteer(Chromium) 실행 시 주의:

**Option A (권장 시도 순서):**
```dockerfile
# Production 스테이지에서 Chromium + 폰트 설치 (Alpine)
FROM oven/bun:1.3.10-alpine AS production
WORKDIR /app

# Chromium 시스템 의존성 (ARM64 호환)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    font-noto \
    font-noto-cjk

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

**결정 포인트:** 이 스토리에서 두 방식 테스트 후 성공한 방법으로 Dockerfile 확정.

### 패키지 버전 확정 가이드

```
Architecture.md 명시 버전 범위:
- puppeteer: 22.x → 22.15.0 (2026-03-15 기준 최신 22.x stable)
- p-queue: 8.x → 8.0.1 (순수 ESM)
- @aws-sdk/client-s3: 3.x → 3.717.0 (2026-03 stable)
- marked: 12.x → 12.0.0
```

**중요:** `package.json`에 `^` 없이 exact pin. CLAUDE.md: "exact pin version (no ^). Manual update only after PoC re-run"

### p-queue ESM 호환성

`p-queue@8.x`는 순수 ESM 패키지 (CJS import 불가). Bun에서 ESM 네이티브 지원으로 동작 확인됨 ✅

```typescript
import PQueue from 'p-queue';
const queue = new PQueue({ concurrency: 5 }); // D24: 풀 크기
```

### MCP PoC 스크립트 구조

**핵심 발견**: `@notionhq/notion-mcp-server`는 newline-delimited JSON 사용

```typescript
// 올바른 방식 (newline-delimited JSON)
proc.stdin.write(JSON.stringify(initReq) + '\n');

// 틀린 방식 (LSP Content-Length framing — 이 서버에서 응답 없음)
proc.stdin.write(`Content-Length: ${len}\r\n\r\n${body}`);
```

mcp-manager.ts (Story 18.3)에서 반드시 반영 필요.

### 기존 코드 참조

**현재 MCP 관련 코드 (참고용 — 수정 대상 아님):**
- `packages/server/src/mcp/sketchvibe-mcp.ts` — 기존 SketchVibe MCP 서버
- `packages/server/src/engine/agent-loop.ts` — messages.create() 엔진

### Project Structure Notes

- scripts/ 폴더는 server 패키지 루트 (`packages/server/scripts/`)에 위치
- test 파일: `packages/server/src/__tests__/unit/deps-verification.test.ts` (bun:test)
- Dockerfile: 프로젝트 루트 `/Dockerfile`

### References

- [Source: _bmad-output/planning-artifacts/tools-integration/architecture.md#New-Dependencies-Phase-1]
- [Source: _bmad-output/planning-artifacts/tools-integration/architecture.md#D24] — Puppeteer 풀 크기
- [Source: _bmad-output/planning-artifacts/tools-integration/architecture.md#D25] — stdio Phase 1 전용
- [Source: _bmad-output/planning-artifacts/tools-integration/architecture.md#D26] — cold start 120s timeout
- [Source: _bmad-output/planning-artifacts/tools-integration/epics-and-stories.md#Story-16.1]
- [Source: Dockerfile] — Alpine 기반 멀티스테이지 빌드

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- **ARM64 Puppeteer issue**: `ENOEXEC on aarch64` — bundled Chrome is x64. Fix: `PUPPETEER_EXECUTABLE_PATH`.
- **MCP Protocol discovery**: Tried LSP Content-Length framing first → no response. Bash test revealed newline-delimited JSON protocol.
- **MCP cold start**: 5506ms on first run (npx downloads package). Warm start expected <3s.

### Completion Notes List

- ✅ Task 1: 4개 패키지 exact pin으로 설치 (puppeteer@22.15.0, p-queue@8.0.1, @aws-sdk/client-s3@3.717.0, marked@12.0.0)
- ✅ Task 2: p-queue ESM import 확인, async-sema fallback 불필요
- ✅ Task 3: Dockerfile에 Alpine Chromium + 한국어 폰트(font-noto-cjk) + PUPPETEER 환경변수 추가
- ✅ Task 4: MCP stdio PoC — Notion MCP 22 tools 발견, **newline-delimited JSON** 프로토콜 확인 (D25 confirmed)
- ✅ Task 5: 21개 단위 테스트 모두 통과 (p-queue, marked, s3, mcp protocol tests)
- ✅ tsc --noEmit: 타입 에러 없음
- **Important finding for Story 18.3**: mcp-manager.ts는 `readline` 또는 `split('\n')` 기반 파싱 사용 필수

### File List

- `packages/server/package.json` — 4개 의존성 추가 (exact pin)
- `packages/server/scripts/verify-deps.ts` — ARM64 의존성 검증 스크립트 (NEW)
- `packages/server/scripts/mcp-poc.ts` — MCP stdio PoC 스크립트 (NEW)
- `packages/server/scripts/mcp-poc-result.md` — PoC 결과 기록 (NEW)
- `packages/server/src/__tests__/unit/deps-verification.test.ts` — 21개 단위 테스트 (NEW)
- `Dockerfile` — Alpine Chromium + 한국어 폰트 + PUPPETEER 환경변수 (MODIFIED)
- `bun.lock` — lockfile 업데이트 (MODIFIED)
