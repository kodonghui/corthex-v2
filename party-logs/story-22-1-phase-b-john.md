# Critic-C (PM) Review — Story 22.1 Phase B: Implementation

**Reviewer**: John (Product Manager)
**Date**: 2026-03-24

---

## AC Verification (spec → implementation)

| AC | Spec Requirement | Implementation | Status |
|----|-----------------|----------------|--------|
| AC-1 | Core packages exact-pinned | 11 deps + 3 devDeps + 1 app dep = 15 pins applied | ✅ |
| AC-2 | `bun install --frozen-lockfile` success | Dev verified: 0 warnings, 0 errors | ✅ |
| AC-3 | `bun.lock` committed | bun.lock in changed files list | ✅ |
| AC-4 | `turbo build` all workspaces | 4/4 build + 5/5 type-check passed | ✅ |
| AC-5 | Tests pass, zero new failures | shared 49/49, app 1194/1200 (6 pre-existing), dep-verify 26/26 | ✅ |
| AC-6 | Zod single version | All resolve to 3.25.76, no overrides needed | ✅ |
| AC-7 | Dockerfile ARM64 + health check | Docker build ✅ + `/api/health` 200 ✅ | ✅ |

## Task-by-Task Verification

### Task 2.1 — Server exact pins (11 deps) ✅
| Package | Spec Target | Actual (package.json) | Match |
|---------|-------------|----------------------|-------|
| `@anthropic-ai/sdk` | `0.78.0` | `0.78.0` | ✅ |
| `hono` | `4.12.3` | `4.12.3` | ✅ |
| `drizzle-orm` | `0.39.3` | `0.39.3` | ✅ |
| `postgres` | `3.4.8` | `3.4.8` | ✅ |
| `@neondatabase/serverless` | `1.0.2` | `1.0.2` | ✅ |
| `@modelcontextprotocol/sdk` | `1.27.1` | `1.27.1` | ✅ |
| `@hono/zod-validator` | `0.5.0` | `0.5.0` | ✅ |
| `hono-rate-limiter` | `0.5.3` | `0.5.3` | ✅ |
| `pino` | `10.3.1` | `10.3.1` | ✅ |
| `pgvector` | `0.2.1` | `0.2.1` | ✅ |
| `@google/generative-ai` | `0.24.1` (pin, NOT remove) | `0.24.1` | ✅ |

### Task 2.2 — Server devDeps (3 pins) ✅
| Package | Spec Target | Actual | Match |
|---------|-------------|--------|-------|
| `drizzle-kit` | `0.30.6` | `0.30.6` | ✅ |
| `@types/bun` | `1.3.10` | `1.3.10` | ✅ |
| `bun-types` | `1.3.10` | `1.3.10` | ✅ |

### Task 2.3 — App 0.x pin ✅
| Package | Spec Target | Actual | Match |
|---------|-------------|--------|-------|
| `lucide-react` | `0.577.0` | `0.577.0` | ✅ |

### Task 2.4 — SemVer-stable `^` retained ✅
croner `^10.0.1`, openai `^6.27.0`, web-push `^3.6.7`, js-yaml `^4.1.1`, @zapier/secret-scrubber `^1.1.6`, zod `^3.24` — all caret, all ≥1.x.

### Task 2.5 — @google/generative-ai NOT removed ✅
Present at server/package.json line 24, pinned exact `0.24.1`.

### CI (Task 8.1) ✅
deploy.yml line 44: `bun install --frozen-lockfile`

### Tests (Task 6.5) ✅
17 new Story 22.1 assertions (lines 103-163):
- 12 exact-pin dependency checks
- 3 exact-pin devDep checks
- 1 app lucide-react pin check
- 1 Zod single-version check

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 9/10 | 모든 버전이 스펙과 1:1 매칭. 테스트 assertion에 정확한 버전 하드코딩. |
| D2 완전성 | 20% | 9/10 | 7 AC 전부 통과. 15 pins + CI 변경 + 17 테스트. 스펙 범위 100% 커버. |
| D3 정확성 | 15% | 10/10 | 15개 버전 핀 전부 스펙과 정확히 일치. @google 제거 안 함 (스펙 준수). CI 변경 정확. |
| D4 실행품질 | 15% | 9/10 | 깔끔한 구현. 불필요한 변경 없음. 테스트가 실제 package.json을 읽어서 검증 — regression guard 견고. |
| D5 일관성 | 10% | 9/10 | 스펙의 two-tier 전략 정확히 반영. admin과 app의 lucide-react 이제 동일. |
| D6 리스크 | 20% | 9/10 | Zod 단일 버전 확인. 6개 pre-existing app 테스트 실패는 기존 문제로 정확히 보고. Docker ARM64 검증 완료. |

## 가중 평균: 9.20/10 ✅ PASS

계산: (9×0.20) + (9×0.20) + (10×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.50 + 1.35 + 0.90 + 1.80 = **9.15** (반올림 9.20)

## 이슈 목록

없음. 구현이 스펙을 정확히 따름.

## 제품 가치 평가

스토리의 핵심 가치 — "결정론적 빌드" — 달성 완료. `--frozen-lockfile` CI 강제로 향후 드리프트 방지. 15개 exact pin으로 0.x 패키지 안정성 확보. 후속 스토리 (22.2 Voyage AI, 22.3 Vector Migration) 진행 가능.
