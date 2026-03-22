# Stage 4 Step 3 — Critic-C (John) Review: Starter Template Evaluation

**Date:** 2026-03-22
**Reviewer:** John (Critic-C, Product + Delivery)
**Writer:** Winston
**Step:** Step 3 — Starter Template Evaluation
**Focus:** PRD alignment, Sprint feasibility, Go/No-Go gate coverage, version accuracy

---

## R1 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 20% | 구체적 버전 번호, file path(`voyage-client.ts`, `docker-compose.n8n.yml`), tree-shaking 6클래스 명시, pin strategy 테이블 명확. |
| D2 완전성 | 8/10 | 20% | v3 4개 패키지 + 10개 inherited decisions + Pre-Sprint 작업 4개. `@anthropic-ai/claude-agent-sdk` 0.2.72 누락 — 실제 설치됨(CLAUDE.md "SDK 0.2.72"). |
| D3 정확성 | 5/10 | 15% | **3개 버전 오류**: (1) n8n 2.12.2 ≠ PRD/Step 2의 2.12.3, (2) PixiJS 8.17.0 ≠ PRD 8.17.1, (3) Pin strategy "exact" 주장이나 실제 package.json은 `^`(caret) 사용 — @anthropic-ai/sdk, drizzle-orm, drizzle-kit, hono 전부 caret. |
| D4 실행가능성 | 8/10 | 15% | Pre-Sprint 작업 4개 명확. Version management 6규칙 실용적. 패키지 placement 구체적. |
| D5 일관성 | 6/10 | 10% | n8n 2.12.2(Step 3) vs 2.12.3(Step 2 line 83, 160, PRD 7곳) 내부 모순. Pin strategy 서술과 codebase 현실 불일치. |
| D6 리스크 | 7/10 | 20% | Drizzle 0.39→0.45 breaking change 경고, SDK manual update 경고. 누락: (1) 현재 caret pin 상태의 즉각적 리스크, (2) pin 교체 시 lockfile 영향 범위, (3) tree-shaking 200KB 미달 시 fallback 전략. |

### R1 가중 평균: 7.35/10 ✅ PASS

---

## R1 이슈 목록

### 🔴 Must Fix (3건)
1. n8n Docker 2.12.2→2.12.3
2. Pin strategy AS-IS vs TO-BE 구분
3. PixiJS 8.17.0→8.17.1

### 🟡 Should Fix (2건)
4. `@anthropic-ai/claude-agent-sdk` 0.2.72 누락
5. caret→exact pin 전환 Pre-Sprint 작업 추가

### 💬 Observation (2건)
6. Zod/postgres/zustand caret (stable, low risk)
7. tree-shaking 6클래스 vs PRD TilingSprite

---

## R2 Verification — 수정 후 재채점

**수정 확인 결과 (8 unique fixes from 4 critics):**

| # | 이슈 | 수정 결과 | 검증 |
|---|------|----------|------|
| 1 | n8n 2.12.2→2.12.3 | ✅ Line 290: "2.12.3 (PRD pin)", line 326: "n8nio/n8n:2.12.3" | PRD/Step 2와 일치 |
| 2 | Pin strategy AS-IS/TO-BE | ✅ Lines 261-270: Backend table에 `AS-IS Pin` + `TO-BE Pin` 2컬럼 추가. 실제 `^` 값 정확히 반영. Lines 316-331: "AS-IS 문제점" + "TO-BE 규칙 8개" 완전 재작성 | package.json grep 결과와 일치 |
| 3 | PixiJS 8.17.0→8.17.1 | ✅ Line 287: "8.17.1" | PRD와 일치 |
| 4 | claude-agent-sdk 누락 | ✅ Line 269: `0.2.72 (exact ✅)` + "engine/agent-loop.ts 핵심 의존" | 설치된 패키지와 일치 |
| 5 | caret→exact Pre-Sprint | ✅ Line 338: Pre-Sprint 작업 #1으로 추가. Line 344: frozen-lockfile 검증 #7 | 실행 가능한 7단계 |

**추가 수정 (다른 critic 이슈 + 발견):**

| 수정 | 검증 |
|------|------|
| `@google/generative-ai` 잔존 발견+플래그 | ✅ Line 270: strikethrough + 🔴 Gemini 금지 + Pre-Sprint 삭제. Line 339: 작업 #2. 확정 결정 #1 정합 |
| Zod dual resolution 주석 | ✅ Line 267: "3.23.8 transitive" 주의사항. TO-BE caret ✅ (SemVer stable) |
| ARM64 CI WebGL 제약 | ✅ Line 293: headless chromium GPU 에뮬레이션 or 번들 크기 테스트만 CI. Sprint 4 실현 가능성 보강 |
| Frontend table AS-IS/TO-BE | ✅ Lines 274-281: 전부 caret TO-BE ✅ (major ≥ 1). 일관된 테이블 구조 |
| Pre-Sprint 4→7개 확장 | ✅ Lines 337-344: pin 교정, Gemini 삭제, Voyage re-embed, Hono patch, SDK eval, Drizzle eval, lockfile 검증 |

### R2 차원별 점수

| 차원 | R1 | R2 | 변화 근거 |
|------|-----|-----|----------|
| D1 구체성 | 9 | 9 | 유지. AS-IS pin에 실제 specifier 추가 (`^4`, `^0.39` 등)로 더 구체적. |
| D2 완전성 | 8 | 9 | claude-agent-sdk 추가, @google/generative-ai 발견+플래그, Pre-Sprint 4→7, ARM64 CI 제약. |
| D3 정확성 | 5 | 9 | n8n/PixiJS 버전 통일, AS-IS/TO-BE 구분으로 pin 현실 정확 반영, Zod transitive 주석. |
| D4 실행가능성 | 8 | 9 | Pre-Sprint 7단계 워크플로우 명확. ARM64 CI 대안(소프트 GPU/번들 사이즈 only) 실용적. |
| D5 일관성 | 6 | 9 | n8n 2.12.3 통일, AS-IS/TO-BE로 모순 해소, Backend/Frontend 테이블 구조 통일. |
| D6 리스크 | 7 | 9 | AS-IS caret 리스크 명시, lockfile 영향 Pre-Sprint #7, @google/generative-ai 잔존 발견, ARM64 WebGL headless 제약. |

### R2 가중 평균: 9.00/10 ✅ PASS

**계산:** (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.80 = **9.00**

---

## 결론

R1의 핵심 문제(version 불일치 + pin strategy 현실 괴리)가 **AS-IS/TO-BE 이중 컬럼 + Pre-Sprint 7단계 교정 계획**으로 완전 해소. 특히 `@google/generative-ai` 잔존 발견은 보너스 — 확정 결정 #1 위반이 코드베이스에 남아있음을 아키텍처 문서가 정확히 포착. 자동 불합격 조건 0건. **9.00/10 — Excellent.**
