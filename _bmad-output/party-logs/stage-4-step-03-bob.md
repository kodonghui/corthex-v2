# Stage 4 Step 03 — Bob (Critic-C, Scrum Master) Review

**Reviewer:** Bob (Critic-C, Product + Delivery / Scrum Master)
**Date:** 2026-03-22
**Target:** `_bmad-output/planning-artifacts/architecture.md` Step 3 — Starter Template Evaluation (L240-332)
**Weights:** D1=15%, D2=20%, D3=15%, D4=15%, D5=15%, D6=20%

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | 모든 패키지에 설치 버전, 최신 버전, 핀 전략, 용도가 구체적. Sprint 배정 명시. 파일 경로(`packages/office/`, `lib/voyage-client.ts`), tree-shaking 대상(6클래스), 번들 임계값(≤200KB) 구체적. "web-verified 2026-03-22" 검증 일자 명시. |
| D2 완전성 | 20% | 7/10 | **4개 v3 패키지**, 10개 v2 사전 결정, 6개 버전 관리 규칙, 4개 Pre-Sprint 필수 작업 — 핵심 커버 우수. **누락 3건**: (1) `@anthropic-ai/claude-agent-sdk` 0.2.72 — engine 핵심 의존성이 버전 테이블에 없음(L458에 별도 언급되나 Step 3 테이블 누락). (2) Pre-Sprint 필수 작업에 "package.json 핀 전략 변경(`^` → exact)" 미포함 — 현재 6+패키지가 caret 사용 중(아래 D6 참조). (3) @pixi/react 8.0.5 ↔ React 19.2.4 호환성 검증 항목 없음. |
| D3 정확성 | 15% | 8/10 | **설치 버전 전수 검증** — `node_modules/` 실제 확인: Hono 4.12.3 ✅, Drizzle 0.39.3 ✅, React 19.2.4 ✅, Zustand 5.0.11 ✅, Tailwind 4.2.1 ✅, Vite 6.4.1 ✅, Zod 3.25.76 ✅, postgres 3.4.8 ✅, @anthropic-ai/sdk 0.78.0 ✅, Bun 1.3.10 ✅. **오류 1건**: n8n `2.12.2`(L288, L318) vs Step 2에서 `2.12.3`(L83, L160, L1439) — 문서 내 5곳 중 2곳이 다른 버전. |
| D4 실행가능성 | 15% | 8/10 | Pre-Sprint 필수 작업 4개가 구체적이고 실행 가능. Drizzle changelog 리뷰 + SDK E2E 테스트 후 결정이라는 gating 조건 명확. `packages/office/` workspace 추가 절차("turbo.json 1행") 간결. |
| D5 일관성 | 15% | 7/10 | Step 3 내부는 일관적. **Step 2↔3 간 불일치 2건**: (1) n8n 2.12.2(Step 3) vs 2.12.3(Step 2) — 어느 버전이 확정인지 모호. (2) Step 2(L268) `@anthropic-ai/sdk` "NFR-SC5: 0.2.72~0.2.x" 참조 — 이건 `claude-agent-sdk`와 `sdk`가 별개 패키지인데, 문서가 두 패키지의 관계를 명확히 구분하지 않음. |
| D6 리스크 | 20% | 7/10 | Drizzle 6 minor behind 리스크, SDK 0.x breaking change 리스크 적절히 식별. **미식별 리스크 3건**: (1) **핀 전략 실태 괴리**: 실제 `package.json`에서 `@anthropic-ai/sdk: "^0.78.0"`, `drizzle-orm: "^0.39"`, `hono: "^4"` 등 6+패키지가 caret(`^`) 사용 중. 문서는 "exact" 처방이지만 현재 `bun install` 시 자동 업그레이드 가능 — breaking change 유입 경로. (2) **PixiJS ARM64 빌드**: PixiJS 8은 WebGL/WebGPU 기반. ARM64 VPS에서 `bun build`(headless) + Playwright E2E(headless Chromium) 호환성 미검증. (3) **Drizzle 0.39→0.45 마이그레이션 스코프**: "changelog 리뷰" 외에 실패 시 대안(현행 유지) + 기존 60개 마이그레이션 호환성 리스크 미명시. |

---

## 가중 평균: 7.60/10 ✅ PASS

계산: (9×0.15) + (7×0.20) + (8×0.15) + (8×0.15) + (7×0.15) + (7×0.20) = 1.35 + 1.40 + 1.20 + 1.20 + 1.05 + 1.40 = **7.60**

---

## 이슈 목록

### HIGH — 수정 필요

#### 1. [D5] n8n Docker 버전 불일치: 2.12.2 vs 2.12.3

| 위치 | 버전 |
|------|------|
| Step 3 L288 | 2.12.**2** |
| Step 3 L318 | 2.12.**2** |
| Step 2 L83 | 2.12.**3** |
| Step 2 L160 | 2.12.**3** |
| Step 2 lower L1439 | 2.12.**3** |

5곳 중 2곳이 `.2`, 3곳이 `.3`. 하나로 통일 필수.

**권고**: n8n stable 최신을 web 검색으로 확인하여 한 버전으로 통일. 전 5곳 일괄 수정.

#### 2. [D6] 핀 전략 실태 괴리 — `bun install` 자동 업그레이드 리스크

문서 "Pin Strategy"가 "exact"를 처방하지만, 실제 `package.json` 현황:

| Package | Doc says | Actual package.json | 리스크 |
|---------|----------|-------------------|--------|
| @anthropic-ai/sdk | exact (CRITICAL) | `"^0.78.0"` | 0.x caret → 0.80.x auto-install 가능 |
| drizzle-orm | exact | `"^0.39"` | 0.x caret → 0.45.x auto-install = breaking |
| hono | exact | `"^4"` | 4.13.x auto-install 가능 (minor) |
| zod | exact | `"^3.24"` | 낮은 리스크 (SemVer stable) |
| postgres | exact | `"^3.4"` | 낮은 리스크 |
| zustand | exact | `"^5.0.11"` | 낮은 리스크 |

**가장 위험**: `@anthropic-ai/sdk` (0.x caret), `drizzle-orm` (0.x caret). `bun install --frozen-lockfile` 없이 CI에서 실행하면 의도치 않은 버전 업그레이드.

**권고**:
1. Pre-Sprint 필수 작업에 "0.x 패키지 pin specifier 변경: `^` → exact" 항목 추가
2. 또는 "Pin Strategy" 컬럼에 "(현재 ^, Pre-Sprint에서 exact로 변경)" 명시
3. `bun.lockb` + `--frozen-lockfile` CI 규칙은 이미 있으나(L321), lockfile 재생성 시 caret 범위 내 자동 업그레이드 발생 가능

#### 3. [D2] `@anthropic-ai/claude-agent-sdk` 0.2.72 버전 테이블 누락

Step 3 테이블은 `@anthropic-ai/sdk 0.78.0`만 나열. 그러나 engine 핵심 의존성은 **`@anthropic-ai/claude-agent-sdk 0.2.72`** (L458, `engine/agent-loop.ts`에서 직접 사용). 실제 `node_modules/`에 `@anthropic-ai+claude-agent-sdk@0.2.72` 확인.

두 패키지의 관계/차이가 명확하지 않음:
- `@anthropic-ai/sdk`: Anthropic HTTP API SDK (대화, 토큰 등)
- `@anthropic-ai/claude-agent-sdk`: Agent 실행 SDK (messages.create, hooks, tools)

**권고**: Backend 테이블에 `@anthropic-ai/claude-agent-sdk | 0.2.72 | exact | 에이전트 실행 엔진 (agent-loop.ts). 0.x = CRITICAL. @anthropic-ai/sdk와 별개 패키지` 행 추가.

### MEDIUM — 권고

#### 4. [D6] @pixi/react 8.0.5 ↔ React 19.2.4 호환성 미검증

@pixi/react는 React 18 대상으로 출시됨. React 19 concurrent features (use(), transitions) 호환성 확인 필요. Pre-Sprint 또는 Sprint 4 초기에 PoC 항목으로 추가 권고.

#### 5. [D2] Pre-Sprint에 pin 변경 작업 누락

Pre-Sprint 필수 작업(L327-331) 4개에 "package.json 0.x 패키지 exact pin 변경" 미포함. 버전 관리 규칙(L316)에서 처방했으나 실행 시점이 불명확.

**권고**: Pre-Sprint 5번째 항목으로 추가: "0.x 패키지(SDK, Drizzle, voyageai) exact pin 적용 + lockfile 재생성"

---

## Scrum Master 관점 — Step 3 배달 리스크

### Pre-Sprint 스코프 확인

Step 3에서 정의된 Pre-Sprint 필수 작업:
1. Voyage AI SDK 설치 + re-embed + HNSW 재구축 (Go/No-Go #10) — **2-3일 추정**
2. Hono 4.12.3 → 4.12.8 패치 — **30분**
3. @anthropic-ai/sdk 0.78.0 → 0.80.0 평가 — **1일 (E2E 테스트 포함)**
4. Drizzle ORM 0.39.3 → 0.45.1 changelog 리뷰 — **2시간**

**누적: 3-5일**. Solo dev 체제에서 Pre-Sprint이 1주를 넘기면 Sprint 1 착수 지연. Voyage AI 마이그레이션이 크리티컬 패스.

**추가 필요 (이슈 #2, #5에서 도출):**
5. 0.x 패키지 exact pin 변경 + lockfile 재생성 — **1시간**

### 문서 품질

Step 3는 간결하고 실용적. "v2 codebase IS our starter" 결론이 명확하고 정확. 10개 사전 결정 매트릭스가 v3 영향을 잘 정리. 주요 이슈는 n8n 버전 불일치와 핀 전략 실태 괴리 — 둘 다 수정 용이.

---

## Cross-talk 메모

- n8n 2.12.2 vs 2.12.3: Step 2에서 2.12.3으로 3곳 확정했으므로, Step 3의 2.12.2를 2.12.3으로 통일하는 것이 자연스러움. 최신 stable 확인 후 결정.
- 핀 전략 괴리: Dev critic이 코드 레벨에서 동일 이슈를 발견했을 가능성 높음 — 교차 확인 필요.
