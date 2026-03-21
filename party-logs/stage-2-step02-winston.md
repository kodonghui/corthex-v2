# Critic-A (Architecture + API) Review — Step 02 Discovery

**Reviewer**: Winston (Architect)
**Target**: `_bmad-output/planning-artifacts/prd.md` §Project Discovery (L108~L222)
**Date**: 2026-03-20

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 8/10 | 버전 번호(PixiJS 8.17.1, n8n 2.12.3), 구체적 수치(485 API, 10,154 테스트, 31/40), Sprint 순서 다이어그램 포함. 2곳 "~3,000줄 추정", "~500줄" 추정치 사용. |
| D2 완전성 | 15% | 7/10 | v3 분류, Sprint 의존성, 사용자 여정 4개, 코드 영향도 전부 포함. Go/No-Go 8개 게이트 미언급(이 섹션 범위 밖일 수 있으나 Sprint 블로커 3개 중 1개만 다이어그램에 표시). v2 섹션 중복(L223-L244) 미정리. |
| D3 정확성 | 25% | 5/10 | **3건 팩트 오류**: (1) BigFive 스케일 0.0~1.0 (L95, L200) — Tech Research 확정 0-100 integer. (2) n8n 프록시 경로 `/admin/n8n/*` (L97, L139) vs Tech Research `/api/workspace/n8n/*`. (3) "3-layer 방어" (L157) — Tech Research "4-Layer Sanitization". |
| D4 실행가능성 | 20% | 7/10 | Sprint 순서, 레이어 매핑, 블로커 조건 명확. 코드 영향도 레이어별 분해 포함. 구현자가 Sprint 착수 순서 판단 가능. |
| D5 일관성 | 15% | 5/10 | **Stage 0/1 결정과 3건 충돌**: BigFive 스케일(Tech Research consensus override 미반영), n8n 라우트 구조(Brief vs Tech Research 불일치 미해결), sanitization 레이어 수 불일치. 용어사전(L95) 미업데이트. |
| D6 리스크 | 10% | 7/10 | Sprint 블로커 3개(Phase 0 선행, Sprint 3 비용 한도, Sprint 4 에셋 승인) 다이어그램에 명시. 다만 n8n OOM 리스크(R6, 4GB peak on 24GB VPS), PixiJS 번들 300KB 타겟(Step 4 결정) 미언급. |

### 가중 평균: 6.30/10 ❌ FAIL

계산: (8×0.15) + (7×0.15) + (5×0.25) + (7×0.20) + (5×0.15) + (7×0.10) = 1.20 + 1.05 + 1.25 + 1.40 + 0.75 + 0.70 = **6.35 → 6.30**

---

## 이슈 목록

### 🔴 Critical (D3 정확성 — 팩트 오류)

**1. BigFive 성격 스케일: 0.0~1.0 → 0-100 integer**

- **위치**: L95 (용어사전 `BigFive성격`), L200 (여정 A: "성실성 1.0, 외향성 0.3")
- **근거**: Tech Research §3 Architecture Decision (L294): _"Brief §4 says '0.0~1.0' but cross-talk consensus (John PM + Winston Architect) overrides to **0-100 integer**"_. Step 4 §4.3.1에서 "0-100 integer throughout" 최종 확정. Step 3 carry-forward에서 "Brief §4 annotation update recommended" 명시.
- **수정안**:
  - L95: `"각 0.0~1.0 슬라이더"` → `"각 0-100 정수 슬라이더 (BIG5-CHAT/Big5-Scaler 연구 기반)"`
  - L200: `"성실성 1.0, 외향성 0.3"` → `"성실성 95, 외향성 30"`

**2. Personality sanitization 레이어 수: 3-layer → 4-layer**

- **위치**: L157 (`"personality_traits prompt injection 3-layer 방어"`)
- **근거**: Tech Research §2 Domain 3 (L296): _"4-Layer Sanitization (R7, Go/No-Go #2)"_ — Layer 0 (Key Boundary) + Layer A (API Zod) + Layer B (extraVars strip) + Layer C (Template regex). Step 4 §4.3에서도 "4-layer sanitization" 확정.
- **수정안**: `"3-layer 방어"` → `"4-layer sanitization (Key Boundary + API Zod + extraVars strip + Template regex)"`

### 🟠 Major (D5 일관성 — Tech Research 충돌)

**3. n8n 프록시 라우트 경로 불일치**

- **위치**: L97 (용어사전), L139 (Detection Signals)
- **PRD 현재**: `/admin/n8n/*`
- **Brief**: `/admin/n8n/*` (Brief L143, L403)
- **Tech Research**: `routes/workspace/n8n-proxy.ts`, `/api/workspace/n8n/*` (Tech Research L627, L972)
- **분석**: Brief는 `/admin/n8n/*`을 명시하지만, Tech Research Step 3에서 `tenantMiddleware`(workspace 패턴)를 사용하는 프록시를 설계. Admin 라우트와 Workspace 라우트는 미들웨어 스택이 다름(admin=adminAuth, workspace=tenantMiddleware).
- **결정 필요**: n8n 관리가 Admin-only(AdminAuth) vs CEO도 워크플로우 트리거 가능(tenantMiddleware)에 따라 라우트 위치 결정. **Architecture 단계에서 해결 권고** — 지금은 Brief 기준(`/admin/n8n/*`) 유지하되 "Tech Research §3.2와 라우트 위치 상충 — Architecture에서 확정" 주석 추가.

### 🟡 Minor (D2 완전성)

**4. v2 섹션 중복 미정리**

- **위치**: L223-L244 (v2 "핵심 사용자 여정 (Phase별)" + "코드 영향도 요약")
- **문제**: L197-L222에 v3 버전이 이미 존재. v2 섹션이 중복으로 남아있어 혼란 유발.
- **수정안**: L223-L244 전체를 `<!-- v2 보존 시작 -->` / `<!-- v2 보존 끝 -->` HTML 주석으로 감싸거나, v3 Sprint 의존성(L177-L179)처럼 `> v2 ... (보존 참고):` 인용문으로 축약.

**5. PixiJS 번들 타겟 누락**

- **위치**: L216 (Layer 1 코드 영향도)
- **문제**: Tech Research Step 4에서 Go/No-Go #5 번들 타겟이 200KB → 300KB로 조정됨 (Sprint 0 벤치마크 확인 조건 부여). PRD Discovery에서 PixiJS 번들 크기 언급 없음.
- **수정안**: L216에 "(번들 타겟: 300KB gzipped, Sprint 0 벤치마크 확인)" 추가, 또는 Sprint 의존성 다이어그램에 Go/No-Go #5 주석.

---

## Cross-talk 요청

- **Quinn에게**: L157 "3-layer 방어" — QA 관점에서 sanitization 레이어 수가 보안 테스트 커버리지에 영향. 4-layer 확인 동의 여부?
- **Bob에게**: v2 섹션 중복(L223-L244) — Product 관점에서 삭제 vs 보존 vs 축약 의견?
- **Sally에게**: BigFive 0-100 스케일 변경이 UX(슬라이더 UI 컴포넌트) 설계에 미치는 영향 확인. 0-100 정수 슬라이더 OK?

---

## 요약

핵심 구조(Sprint 순서, 레이어 매핑, 복잡도 비교)는 잘 작성됨. 그러나 **Tech Research Stage 1에서 확정된 3건의 결정사항이 PRD에 미반영**되어 D3 정확성과 D5 일관성이 낮음. 특히 BigFive 스케일 불일치는 API Zod 스키마, DB JSONB 구조, UI 슬라이더 범위에 전파되는 critical issue. 3건 수정 후 7.5+ 예상.

---

## [Verified] Re-Review — Fixes Applied

**Date**: 2026-03-20

### 수정 검증 결과

| # | 이슈 | 상태 | 검증 |
|---|------|------|------|
| 🔴 #1 | BigFive 0.0~1.0 → 0-100 정수 | ✅ 완료 | L95 용어사전, L144 도메인 근거, L192 요구사항 표, L204 여정A — 전부 "0-100 정수" + "Stage 1 Decision 4.3.1" 참조 |
| 🔴 #2 | 3-layer → 4-layer sanitization | ✅ 완료 | L95 용어사전 "4-layer sanitization: Key Boundary→API Zod→extraVars strip→Template regex", L156 인증/보안 4/5 상향 + 전체 구조 명시 |
| 🟠 #3 | n8n 라우트 경로 | ✅ 완료 | L139 HTML 주석 "정확한 라우트 경로는 Architecture에서 확정" 추가 |
| 🟡 #4 | v2 섹션 중복 | ✅ 완료 | L240-L246 HTML 주석으로 축약 (Bob 추천 인용문 대신 — 기능적으로 OK) |
| 🟡 #5 | PixiJS 번들 타겟 | ✅ 완료 | L176 "PixiJS 번들 < 300KB gzipped (Stage 1 Step 4 결정)" Sprint 다이어그램에 추가 |

### 추가 개선사항 (John 자발적)

- 복잡도 31→33/40 (인증 3→4, 팀역량 2→4). 수학 검증: 3+5+3+4+4+5+5+4 = 33 ✅
- WS 채널 수 14→16 정정 (코드 검증: `shared/types.ts:484-500` 실제 16채널). v3 "16→17" 정확 ✅
- Sprint별 코드 규모 분해 표 추가 (6행, Sprint별 신규/수정/주요 파일)
- 사용자 여정 대폭 확장: 접근성(aria, 키보드), 반응형(모바일 리스트뷰), 프리셋 선택, 중간 체감 설계
- Pre-Sprint에 "Neon Pro 업그레이드" 블로커 추가 (Stage 1 Step 6 §6.4 참조)
- n8n OOM R6 Critical 리스크 복잡도 표에 명시

### 잔여 이슈 (1건, Non-blocking)

1. **v2 규모 표 WS 채널 수**: L260 "14개" vs 실제 코드 16개. 기존 v2 규모 표가 stale. 이 Step 범위 밖이나 Executive Summary 업데이트 시 정정 권고.

### Verified 차원별 점수

| 차원 | 가중치 | Initial | Verified | 변동 근거 |
|------|--------|---------|----------|----------|
| D1 구체성 | 15% | 8 | **9** | Sprint별 코드 분해 표, 접근성 구체 명세(aria-valuenow, 키보드 Arrow keys), 반응형 구체 명세 |
| D2 완전성 | 15% | 7 | **8** | Sprint별 분해, 접근성, 반응형, Neon Pro 블로커, 프리셋 선택 UX 추가 |
| D3 정확성 | 25% | 5 | **8** | 5개 원본 이슈 전부 수정. WS "16→17" 코드 검증 정확. 잔여 1건(v2 규모 표 stale, 범위 밖) |
| D4 실행가능성 | 20% | 7 | **8** | Sprint별 코드 규모 + 주요 파일 리스트 → 구현자 스코프 즉시 판단 가능 |
| D5 일관성 | 15% | 5 | **8** | Stage 0/1 결정 3건 전부 반영. v2 축약 HTML 주석(Bob 인용문 추천과 다르나 기능 OK) |
| D6 리스크 | 10% | 7 | **8** | n8n OOM R6, PixiJS 300KB, 팀역량 학습 곡선(Sprint 4 일정 영향) 추가 |

### Verified 가중 평균: 8.15/10 ✅ PASS

계산: (9×0.15) + (8×0.15) + (8×0.25) + (8×0.20) + (8×0.15) + (8×0.10) = 1.35 + 1.20 + 2.00 + 1.60 + 1.20 + 0.80 = **8.15**

### Cross-talk 반영

- **Quinn**: 4-layer sanitization 동의 + Layer별 테스트 케이스 제시 → john이 L156에 전체 4-layer 구조 명시로 반영
- **Bob**: Option B 인용문 축약 추천 → john은 Option A HTML 주석 사용. 기능적으로 동등, 패턴 통일성은 약간 떨어짐 (non-blocking)
