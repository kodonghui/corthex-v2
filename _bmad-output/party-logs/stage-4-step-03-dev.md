# Stage 4 Step 3 — dev (Critic-Implementation) Review

**Reviewer:** dev (Critic-Implementation)
**Date:** 2026-03-22
**Target:** `_bmad-output/planning-artifacts/architecture.md` — Starter Template Evaluation (L240-332)
**Focus:** Code implementability, version accuracy vs actual codebase, pin strategy compliance

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | 모든 패키지 installed/latest 버전 명시, pin rule 6개 규칙 구체적, Pre-Sprint 4개 작업 명확. |
| D2 완전성 | 15% | 9/10 | Runtime+Backend+Frontend 전부 커버, v3 신규 4개 패키지 완전, 10개 inherited decisions, Pre-Sprint 체크리스트 완전. |
| D3 정확성 | 25% | 7/10 | Installed 버전 전부 정확 (node_modules 검증). **BUT**: Pin Strategy 컬럼이 actual package.json과 불일치 (7개 패키지). n8n 버전 내부 불일치 (2.12.2 vs 2.12.3). |
| D4 실행가능성 | 20% | 8/10 | Pre-Sprint 체크리스트 실행 가능. Version Management 6 규칙 명확. pin 전략 "마이그레이션" 단계 미언급. |
| D5 일관성 | 15% | 7/10 | n8n 2.12.2 (Step 3) vs 2.12.3 (Step 2) 내부 모순. Pin strategy vs package.json 불일치가 문서 신뢰성 영향. |
| D6 리스크 | 10% | 8/10 | Drizzle upgrade 리스크, SDK manual-update-only, n8n Docker tag pin 전부 적절. caret→exact 마이그레이션 자체의 리스크 미언급. |

## 가중 평균: 7.90/10 ✅ PASS

계산: (9×0.15)+(9×0.15)+(7×0.25)+(8×0.20)+(7×0.15)+(8×0.10) = 1.35+1.35+1.75+1.60+1.05+0.80 = **7.90**

---

## 이슈 목록

### 1. [D3 Critical] Pin Strategy 컬럼 vs 실제 package.json 불일치 — 7개 패키지

**위치:** architecture.md L252-280 (Existing Stack tables)

Architecture "Pin Strategy" 컬럼이 "exact"으로 기재된 패키지들의 실제 package.json specifier:

| Package | Architecture says | Actual package.json | 파일 |
|---------|------------------|--------------------|----|
| @anthropic-ai/sdk | exact (CRITICAL) | `"^0.78.0"` | packages/server/package.json:21 |
| drizzle-orm | exact | `"^0.39"` | packages/server/package.json:30 |
| hono | exact | `"^4"` | packages/server/package.json:31 |
| zod | exact | `"^3.24"` | packages/server/package.json:42 |
| postgres | exact | `"^3.4"` | packages/server/package.json:39 |
| zustand | exact | `"^5.0.11"` | packages/app/package.json:37 |
| @tanstack/react-query | exact | `"^5.90.21"` | packages/app/package.json:27 |

**검증**: Installed 버전은 `bun.lockb`가 고정하므로 전부 정확 (Hono 4.12.3, Drizzle 0.39.3 등). 그러나 `package.json` specifier 자체가 caret(`^`)이므로 lockfile 없이 `bun install` 시 다른 버전 설치 가능.

**CLAUDE.md 위반**: "SDK pin version (no ^)" — `@anthropic-ai/sdk: "^0.78.0"`은 이 규칙 위반.

**해석 문제**: "Pin Strategy" 컬럼이 현재 상태(descriptive)인지 v3 목표(prescriptive)인지 모호. Architecture doc이 "All versions verified" 문맥에서 작성되었으므로 현재 상태로 읽힘.

**권고 (택 1):**
- **(A)** Pin Strategy 컬럼을 actual로 수정: "exact" → "caret (현행)" + Version Management Strategy에 "Pre-Sprint: caret→exact 마이그레이션 필수 (rule #1 준수)" 추가
- **(B)** Pin Strategy 컬럼을 "target" 으로 리네임 + 현행 상태 별도 표기 + Pre-Sprint 마이그레이션 태스크 추가

### 2. [D3/D5] n8n Docker 버전 불일치: 2.12.2 vs 2.12.3

**위치:**
- Step 2 (L83, L160, L1439): `n8n:2.12.3`
- Step 3 (L288, L318): `n8n:2.12.2`

동일 문서 내에서 n8n Docker 태그가 2곳 다르게 기재. `2.12.2 stable` vs `2.12.3`.

**권고:** 하나로 통일. 실제 사용할 버전 확인 후 전 문서 일괄 수정 (grep `n8n.*2\.12` → 5곳).

### 3. [D4] caret→exact 마이그레이션 단계 미포함

**위치:** Version Management Strategy (L314-321) + Pre-Sprint (L327-331)

Rule #1이 exact pin을 규정하지만, 현재 코드가 전부 caret인 상황에서 "Pre-Sprint: package.json specifier를 exact pin으로 변경" 태스크가 누락. lockfile 의존만으로는 CI 환경 변경, lockfile 충돌 해결 등에서 drift 발생 가능.

**권고:** Pre-Sprint 필수 작업에 "#0. 7개 패키지 package.json caret→exact 마이그레이션" 추가.

---

## 구현 관점 소견

### 긍정 평가

1. **Installed 버전 100% 정확**: node_modules 직접 검증 — Hono 4.12.3 ✅, Drizzle 0.39.3 ✅, SDK 0.78.0 ✅, Zod 3.25.76 ✅, React 19.2.4 ✅, postgres 3.4.8 ✅, drizzle-kit 0.30.6 ✅, Zustand 5.0.11 ✅, TanStack Query 5.90.21 ✅, Tailwind 4.2.1 ✅, Vite 6.4.1 ✅, react-router-dom 7.13.1 ✅.

2. **v3 패키지 영향 분석 우수**: PixiJS tree-shaking 6클래스, voyageai 1:1 교체 경로, n8n Docker sidecar 패턴 — 구현자가 즉시 이해 가능.

3. **10 Inherited Decisions 완전**: 모든 v2 기술 결정 정확히 캐리 포워드. Hook count 5개(Step 2 수정 반영), UXUI 리셋이 기존 토큰 위에서 작업함을 명시.

4. **Version Management 6 규칙 실용적**: Docker tag pin, lockfile commit, Drizzle changelog 리뷰 — 실무적으로 적용 가능한 규칙.

5. **"No starter template" 결론 정확**: 485 API + 86 테이블 + 10,154 테스트 — 이 위에서 확장하는 것이 유일한 합리적 선택.
