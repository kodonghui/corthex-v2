# Critic-C (PM) Review — Story 22.1: Dependency Verification & Version Pinning

**Reviewer**: John (Product Manager)
**File**: `_bmad-output/implementation-artifacts/stories/22-1-dependency-verification-version-pinning.md`
**Date**: 2026-03-24

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 9/10 | 모든 패키지에 정확한 현재→목표 버전 명시 (e.g., `^0.78.0` → `0.78.0`). 파일 경로, 줄 번호 참조 (Dockerfile line 5, deploy.yml line 29). `pino`와 `@hono/zod-validator`만 "resolved exact version"으로 미확정. |
| D2 완전성 | 20% | ~~8~~ → 9/10 | Epic AC 전부 커버 + 확장. **Fix 후**: Pre-Sprint Upgrade Mapping 섹션 추가, 모든 서버 의존성 분류 완료 (croner/openai/web-push/js-yaml/secret-scrubber → Task 2.4 caret 목록). |
| D3 정확성 | 15% | ~~7~~ → 9/10 | **Fix 후**: @google 모순 해결 — Task 2.5에서 제거 명시 금지, Task 2.1에서 exact pin `0.24.1`, "What NOT to Change"에 "Do NOT remove" 추가. 내부 정합성 확보. |
| D4 실행가능성 | 15% | 9/10 | 파일별 변경 매트릭스 + "What NOT to Change" 스코프 경계 명확. 8 Tasks/35+ subtasks로 즉시 실행 가능. 테스트 전략 4단계 (unit → build → regression → Docker). |
| D5 일관성 | 10% | 9/10 | 아키텍처 TO-BE 규칙 (line 325-334)과 정합. 프로젝트 컨벤션 (kebab-case, Gemini 금지) 준수. 두 가지 핀 전략이 아키텍처 결정과 일치. |
| D6 리스크 | 20% | ~~7~~ → 9/10 | **Fix 후**: @google 빌드 파손 리스크 해결 (제거 자체 취소). 롤백 계획 추가 (`git revert` + `bun install`). CI `|| true` 한계 명시. Zod dedup + `@types/bun` 리스크 그대로 유지. |

## 가중 평균: ~~8.10/10~~ → **9.00/10 ✅ PASS (post-fix)**

| Round | Score | Note |
|-------|-------|------|
| Initial | 8.80 | Before cross-talk |
| Revised | 8.10 | Winston의 @google 모순 반영 |
| **Post-fix** | **9.00** | **5개 이슈 전부 수정 확인** |

계산: (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.80 = **9.00**

---

## 이슈 목록

### 0. **[D3 정확성 + D6 리스크] `@google/generative-ai` 제거 — 내부 모순** (HIGH — cross-talk에서 발견)
Task 2.4가 `@google/generative-ai`를 package.json에서 제거하라고 지시하지만, "What NOT to Change" 섹션은 "Do NOT modify any source code beyond package.json and test files"라고 명시. 실제 코드베이스에 4개 import site 존재:
- `packages/server/src/services/embedding-service.ts:1` — `import { GoogleGenerativeAI }`
- `packages/server/src/lib/llm/google.ts:1` — `import { GoogleGenerativeAI, ... }`
- `packages/server/src/__tests__/unit/embedding-service.test.ts:12` — `mock.module`
- `packages/server/src/__tests__/unit/embedding-tea.test.ts:30` — `mock.module`

패키지를 제거하면 AC-4 (`turbo build`) 빌드 실패 불가피. 소스 수정 없이는 해결 불가.
**권고 (택1)**:
- **(A) Defer**: `@google/generative-ai` 제거를 Story 22.2 (Voyage AI 통합)로 이관. 22.1은 pinning only.
- **(B) Expand scope**: "What NOT to Change"에서 embedding-service.ts와 google.ts를 예외로 추가하고, 임시 stub/삭제 태스크 추가.
- **PM 권고: Option A** — 스코프를 깔끔하게 유지하고, 22.2에서 Voyage AI 교체와 함께 한 번에 처리.

### 1. **[D2 완전성] Pre-Sprint 업그레이드 스토리 매핑 누락** (Medium)
아키텍처 Pre-Sprint 필수 작업 (line 340-345)에 "Hono 4.12.3→4.12.8" (항목 #4)과 "@anthropic-ai/sdk 0.78.0→0.80.0 평가" (항목 #5)가 있음. Story 22.1은 "What NOT to Change"에서 명시적으로 제외했으나, 이 업그레이드가 어떤 스토리에서 수행되는지 언급 없음. Pre-Sprint Epic이라면 모든 항목의 스토리 매핑이 보여야 함.
**권고**: Dev Notes에 "Hono/SDK 업그레이드는 Story 22.X에서 처리" 또는 "Deferred to post-sprint" 한 줄 추가.

### 2. **[D6 리스크] 롤백 계획 미제시** (Low)
핀 변경이 빌드/테스트를 깨뜨릴 경우의 롤백 전략이 없음. `git revert` 한 줄이면 충분하지만 명시적으로 없음.
**권고**: Risks 섹션에 "Rollback: `git revert` the pin commit + `bun install` to restore previous state" 추가.

### 3. **[D6 리스크] `lucide-react ^0.577.0` — 0.x 패키지인데 `^` 유지** (Low)
아키텍처 결정 "0.x 패키지: exact pin" (line 1685)과 충돌 가능. `lucide-react`는 0.x이므로 SemVer상 minor 버전에서 breaking change 허용. admin에서는 이미 exact `0.577.0`으로 핀됨. app에서만 `^` 유지하는 이유 불명확.
**권고**: Task 2.3에 `lucide-react`의 `^` 유지 근거를 1줄 추가하거나, admin과 동일하게 exact pin으로 통일.

### 4. **[D1 구체성] `pino`, `@hono/zod-validator` 목표 버전 미확정** (Minor)
Task 2.1에서 "resolved exact version"으로 표기. 다른 패키지는 전부 구체적 버전이 있는데 이 2개만 미확정.
**권고**: `bun pm ls pino` / `bun pm ls @hono/zod-validator`로 현재 resolved 버전 확인 후 명시.

---

## 제품 가치 평가

**명확한 가치**: 결정론적 빌드는 v3 개발의 기반. 버전 드리프트로 인한 "내 환경에서는 됐는데" 문제를 원천 차단. Pre-Sprint 첫 스토리로서 모든 후속 스토리를 블록하므로 우선순위 적절.

**추가 가치**: Zod 이중 버전 문제 발견 및 해결은 런타임 타입 불일치 버그 예방. (`@google/generative-ai` 제거는 가치 있으나 스코프 모순으로 인해 22.2로 이관 권고.)

---

## Cross-talk 요약

### Winston (Critic-A, Architecture) — 6.6/10 FAIL
- **핵심 발견**: `@google/generative-ai` 제거가 4개 import site와 충돌 → 빌드 실패 불가피. 이 모순은 내가 놓친 것. 동의하며 Issue #0으로 승격.
- **서버 미분류 의존성**: croner, openai, web-push, js-yaml, @zapier/secret-scrubber 등이 two-tier 전략에 미분류. D2 점수 하향 반영.
- **PM 판단**: Winston의 FAIL은 타당. `@google/generative-ai` 모순만 해결하면 PASS 가능. Option A (22.2로 이관) 권고.

### Quinn (Critic-B, QA) — 5.60/10 FAIL + Auto-Fail (Build Breakage)
- **핵심 발견**: `@google/generative-ai` 동일 모순 독립적 발견. Auto-Fail 조건 #3 (빌드 깨짐) 적용.
- **Task 6.4 검증 누락**: `@google/generative-ai` import grep이 실제 태스크에 없음 (Zod v4 grep만 있음). Risks에 메모만 존재.
- **AC-5 테스트 수 고정 (10,154)**: 취약한 assertion. "all existing tests pass with zero failures" + `exit code 0`이 더 적절.
- **CI 캐시 무효화**: lockfile 변경 후 stale cache 리스크. Task 8에 서브태스크 추가 필요.
- **@google 이관 동의**: 제거는 소스 교체 시점(22.2)이 자연스러움. 3명 전원 합의.

### 3-Critic 합의 사항
1. **`@google/generative-ai` 제거 → Story 22.2로 이관** (전원 동의)
2. **lucide-react `^0.577.0`**: 0.x 패키지 `^` 유지 근거 필요 또는 exact pin 통일 (전원 지적)
3. **미분류 서버 의존성**: two-tier 전략에 모든 패키지 분류 필요 (Winston, Quinn 지적)
4. **Story 22.2 추적 사항** (Winston): 22.2 AC에 `lib/llm/google.ts` + embedding-service.ts 내 Google 경로 *삭제*를 명시적으로 포함할 것. dead code 방지.

### 최종 점수 요약
| Critic | 점수 | 판정 |
|--------|------|------|
| Winston (Critic-A) | 6.60/10 | ❌ FAIL |
| Quinn (Critic-B) | 5.60/10 | ❌ FAIL + Auto-Fail |
| John (Critic-C) | 8.10/10 | ✅ PASS |
| **3-Critic 평균** | **6.77/10** | **❌ FAIL (< 7.0)** |

> **판정**: 재작성 필요. 핵심 수정 사항은 명확하고 범위가 좁으므로 빠른 수정 후 재리뷰 가능.
