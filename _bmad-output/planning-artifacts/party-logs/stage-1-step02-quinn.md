# Critic-B (QA + Security) Review — Stage 1 Step 02: Technology Stack Analysis

**Reviewer**: Quinn (QA Engineer)
**Date**: 2026-03-20
**Document**: `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` — "Technology Stack Analysis" section (L112-L473)
**Rubric**: Critic-B weights — D1=10%, D2=25%, D3=15%, D4=10%, D5=15%, D6=25%

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | Exact versions pinned (PixiJS 8.17.1, n8n 2.12.3, pgvector npm 0.2.1, PG ext 0.8.0). Bundle sizes in KB/gzip. n8n RAM idle/peak numbers. Reflection cost model with per-token rates + daily/monthly figures. SQL schemas with exact column types. Sources cited throughout. Big Five presets with numeric values. |
| D2 완전성 | 8/10 | 6 domains all covered. Go/No-Go #2/#3/#4/#5/#7/#8 addressed. VPS resource ranking. Version matrix. Co-residence analysis. **BUT**: (1) Key shadowing risk (extraVars overwriting built-in vars — Winston Step 1 cross-talk) not addressed in Domain 3 sanitization. (2) Neon connection pooling impact of adding n8n not analyzed. (3) WebSocket /ws/office memory-per-connection and back-pressure not considered. |
| D3 정확성 | **6/10** | Three factual errors found by code verification: **(1) React 19 claim WRONG**: Doc says "현재 v2는 React 18 — 업그레이드 필요" (L130) but `packages/app/package.json` already has `"react": "^19"`. All 4 packages (app, admin, ui, landing) already on React 19. Sprint 4 선행 조건 자체가 허위. **(2) CI Runner co-residence WRONG**: Doc lists "CI Runner 0 idle / 1-2GB peak" in VPS co-residence table (L238) but `grep` for self-hosted/actions-runner found 0 results — GitHub Actions runs in GitHub cloud, not VPS. Co-residence totals are inflated. **(3) Layer C regex INACCURATE**: Doc says "Regex `\{\{(\w+)\}\}` — only alphanumeric keys" (L290) but actual code at soul-renderer.ts:45 is `\{\{([^}]+)\}\}` — matches ANY non-`}` character including spaces, newlines, special chars. This misrepresents the current security posture. |
| D4 실행가능성 | 8/10 | SQL schemas copy-paste ready. Docker env vars specified. Big Five prompt pattern + presets actionable. Asset pipeline 3 options ranked. MCP tools table for Subframe. Adequate for Step 2 tech overview. |
| D5 일관성 | 8/10 | Sprint order, Known Risks R1-R9, Go/No-Go gates consistent with Step 1. Option B memory strategy maintained. BUT: React 19 error creates inconsistency with actual codebase state — says upgrade needed when already done. |
| D6 리스크 | 7/10 | n8n co-residence analyzed (though CI Runner inflated). Bundle tree-shaking solution. GPU caveat for ComfyUI. Cost model for reflections. 3-layer sanitization outlined. **BUT**: (1) **Key shadowing risk MISSING** — `...extraVars` at soul-renderer.ts:41 can overwrite `agent_list`, `subordinate_list`, `tool_list`, `department_name`, `owner_name`, `specialty`. This is MORE dangerous than value injection (silent system prompt corruption). (2) **Layer C regex gap** — current `[^}]+` regex means template keys accept any characters; doc claims `\w+` restriction that doesn't exist. The security analysis builds on a false premise. (3) **Neon connection pooling** — n8n using external PostgreSQL means more connection pressure on Neon; not analyzed. (4) **N8N_ENCRYPTION_KEY storage** — mentioned but no analysis of where stored, rotation, compromise impact. |

---

## 가중 평균

| 차원 | 점수 | 가중치 | 가중점수 |
|------|------|--------|---------|
| D1 구체성 | 9 | 10% | 0.90 |
| D2 완전성 | 8 | 25% | 2.00 |
| D3 정확성 | 6 | 15% | 0.90 |
| D4 실행가능성 | 8 | 10% | 0.80 |
| D5 일관성 | 8 | 15% | 1.20 |
| D6 리스크 | 7 | 25% | 1.75 |
| **합계** | | **100%** | **7.55/10 ✅ PASS** |

> ⚠️ D3 정확성 6/10 — 자동 불합격 경계 근접. 3건의 사실 오류가 모두 코드 검증으로 확인됨. D3 3점 미만 시 자동 불합격이므로 6점은 통과하나, React 19 오류는 Sprint 4 계획에 직접 영향.

---

## 이슈 목록

### Issue 1 — [D3 정확성] React 19 claim WRONG (HIGH)
- **Doc L130**: "현재 v2는 React 18 — 업그레이드 필요 (Sprint 4 선행 조건)"
- **실제 코드**: `packages/app/package.json:32: "react": "^19"`, `packages/admin/package.json:20: "react": "^19"`, `packages/ui/package.json:12: "react": "^19"`, `packages/landing/package.json:12: "react": "^19"`
- **영향**: Sprint 4 선행 조건이 허위 — 이미 충족된 조건을 미충족으로 기술. Sprint 계획에 불필요한 리스크 플래그 삽입.
- **권장**: L130 경고를 "v2는 이미 React 19 사용 중 — @pixi/react 8.0.5 호환 확인됨 ✅" 로 수정. 선행 조건 제거.

### Issue 2 — [D3 정확성] CI Runner co-residence INACCURATE (Medium)
- **Doc L238**: "CI Runner | 0 | 1-2 GB" in VPS co-residence table
- **실제**: `.github/workflows/` 에 self-hosted runner 설정 없음. GitHub Actions는 GitHub 클라우드에서 실행.
- **영향**: VPS 메모리 peak 합계 8.5GB → 실제 ~6.5GB. 헤드룸 15.5GB → 17.5GB로 더 여유로움.
- **권장**: CI Runner 행 삭제 또는 "GitHub Actions (cloud-hosted, VPS 리소스 미사용)" 으로 수정.

### Issue 3 — [D3 정확성 + D6 리스크] Layer C regex MISREPRESENTED (HIGH)
- **Doc L290**: "Regex `\{\{(\w+)\}\}` — only alphanumeric keys"
- **실제 코드 soul-renderer.ts:45**: `\{\{([^}]+)\}\}` — `[^}]+`는 `}` 외 모든 문자 허용 (공백, 특수문자, 줄바꿈 포함)
- **영향**: 3-layer sanitization의 Layer C가 실제보다 강력하게 기술됨. 보안 분석이 허위 전제 위에 구축. 현재 코드는 `{{hello world}}`, `{{../../../etc/passwd}}` 같은 키도 매칭함.
- **권장**: (1) 현재 코드 regex를 정확히 기술: "`[^}]+` — 제한 없음". (2) 제안된 수정으로 `(\w+)` 변경을 명시적 "PROPOSED FIX"로 분리. (3) 현재 상태 vs 제안 상태를 명확히 구분.

### Issue 4 — [D6 리스크] Key shadowing risk MISSING (HIGH)
- Step 1 cross-talk에서 Winston이 지적하고 Quinn이 확인한 핵심 보안 리스크가 Step 2에 반영되지 않음.
- soul-renderer.ts:41 `...extraVars` spread는 built-in vars (`agent_list`, `subordinate_list`, `tool_list`, `department_name`, `owner_name`, `specialty`) 6개를 모두 덮어쓸 수 있음.
- **영향**: value injection (JSONB → prompt)보다 위험 — 시스템 프롬프트의 조직 구조 정보를 조용히 변조 가능. Agent가 잘못된 부서명/동료 목록으로 동작.
- **권장**: Domain 3 sanitization 섹션에 "Layer 0 (Key Boundary): extraVars 키 allowlist 검증 — built-in 6개 키(`agent_list`, `subordinate_list`, `tool_list`, `department_name`, `owner_name`, `specialty`) 덮어쓰기 거부" 추가. 3-layer → 4-layer sanitization으로 확장.

### Issue 5 — [D2 완전성] Neon connection pooling 미분석 (Medium)
- n8n이 외부 PostgreSQL (Neon)을 사용할 경우, 기존 Bun server + n8n의 동시 연결 수가 Neon 무료 티어 한도(보통 100 connections)에 영향.
- **권장**: Domain 2 또는 Domain 4에 "Neon connection limit 확인 + n8n 연결 풀 사이즈 설정 (max connections)" 추가.

### Issue 6 — [D2 완전성] /ws/office WebSocket scaling 미분석 (Low)
- `/ws/office` 채널에 50+ 동시 접속 시 서버 메모리 사용량, back-pressure, heartbeat 전략 미분석.
- Step 3 Integration Patterns에서 다룰 수 있으나, Step 2에서 "per-connection ~50KB overhead" 같은 baseline 제시 권장.

---

## 자동 불합격 체크

| 조건 | 결과 |
|------|------|
| 할루시네이션 (미존재 API/파일 참조) | ⚠️ BORDERLINE — React 19 "업그레이드 필요"가 허위 사실이나, 참조된 패키지/파일 자체는 실존. 할루시네이션이라기보다 사실 확인 실패. 불합격 수준은 아님. |
| 보안 구멍 | ⚠️ FLAG — Layer C regex 오기술 + key shadowing 누락으로 보안 분석이 불완전. 코드 제안이 아닌 연구 문서이므로 자동 불합격은 아니나, 이 분석 기반으로 코드를 작성하면 보안 구멍 발생. |
| 빌드 깨짐 | ✅ CLEAR |
| 데이터 손실 위험 | ✅ CLEAR |
| 아키텍처 위반 (E8) | ✅ CLEAR |

---

## Cross-talk Notes

- **Winston에게**: Key shadowing이 Step 2에서도 누락됨. Domain 3의 3-layer sanitization이 4-layer로 확장되어야 하며, Layer 0 (Key Boundary)를 아키텍처 관점에서 정의해주기 바랍니다. 또한 Layer C regex `[^}]+` vs `\w+` 불일치 — 아키텍처 결정이 필요 (regex 변경 시 기존 템플릿 호환성 영향).
- **John에게**: React 19 "업그레이드 필요" 주장이 허위입니다. v2가 이미 React 19 — Sprint 4 선행 조건에서 제거 필요. Sprint 계획 영향.

---

## 최종 판정

**7.55/10 ✅ PASS**

6개 도메인 기술 분석으로서 전체 구조는 양호 — 버전 핀, 번들 분석, 코스트 모델, SQL 스키마 모두 구체적. 그러나 **3건의 사실 오류가 코드 검증으로 확인됨** (React 19 이미 사용 중, CI Runner 클라우드 호스팅, Layer C regex 불일치). 특히 React 19 오류는 Sprint 4 계획에 직접 영향하고, Layer C regex 불일치는 보안 분석의 전제를 훼손.

6개 이슈 (3 HIGH, 2 Medium, 1 Low). 수정 적용 시 8.5+ 예상.

---

## Verification (Fixes Applied)

**Date**: 2026-03-20
**Verified by**: Quinn (Critic-B)

### Issue Verification

| # | Issue | Severity | Fix | Verified |
|---|-------|----------|-----|----------|
| 1 | React 19 "업그레이드 필요" | HIGH | L130: "v2는 이미 React 19" + 4개 패키지 코드 검증 기록 | ✅ |
| 2 | Layer C regex 오표기 | HIGH | L298: 현재 코드 `[^}]+` 명시 + 제안 `\w+` 분리 + Go/No-Go #2 `\|\| ''` 충돌 대응 (warning log + default personality) | ✅ |
| 3 | Key shadowing | HIGH | L294-295: Layer 0 (Key Boundary) 신설, 7개 키 allowlist | ⚠️ 부분 — 아래 신규 이슈 참조 |
| 4 | CI Runner co-residence | Medium | L239: "(self-hosted)" 표기 | ✅ **+ Quinn 오류 정정**: `.github/workflows/deploy.yml:17`, `ci.yml:9`, `weekly-sdk-test.yml:14` 모두 `runs-on: self-hosted`. CI Runner는 실제로 VPS에서 실행됨. 원래 이슈가 Quinn의 오판 — 철회. |
| 5 | Neon connection pooling | Medium | Step 3 이관 | ✅ 합리적 |
| 6 | /ws/office WebSocket | Low | Step 3 이관 | ✅ 합리적 |

### 신규 이슈 — knowledge_context allowlist 오분류 (Medium)

Layer 0 Key Boundary(L295)의 allowlist에 `knowledge_context`가 포함되어 있으나, 코드 검증 결과 `knowledge_context`는 **built-in var가 아니라 extraVar**:

- `soul-renderer.ts:34-42`: vars 객체에 6개 built-in만 존재 (`agent_list`, `subordinate_list`, `tool_list`, `department_name`, `owner_name`, `specialty`). `knowledge_context` 없음.
- `call-agent.ts:63`: `soulExtraVars = { knowledge_context: knowledgeCtx }` — extraVars로 주입
- `hub.ts:99`: `extraVars.knowledge_context = knowledgeCtx` — extraVars로 주입
- `soul-renderer.ts:7` 주석은 7개 나열하나 실제 코드는 6개 built-in + 1개 extraVar

**영향**: `knowledge_context`를 reject 대상에 포함하면 `call-agent.ts`와 `hub.ts`의 기존 지식 주입이 **깨짐** — Zero Regression 위반.

**권장**: Layer 0 allowlist에서 `knowledge_context` 제거 → 6개 키만 유지. 또는 Winston Option A(spread 순서 반전: `{ ...extraVars, agent_list: ..., ... }`) 적용 시 allowlist 자체 불필요.

### Verified Scores

| 차원 | Before | After | 변동 | 근거 |
|------|--------|-------|------|------|
| D1 구체성 | 9 | **9** | — | 변동 없음 |
| D2 완전성 | 8 | **8** | — | Neon/WebSocket Step 3 이관 합리적 |
| D3 정확성 | 6 | **8** | +2 | React 19 수정 ✅, Layer C regex 현재/제안 구분 ✅, CI Runner 실제 self-hosted (Quinn 오판 정정). BUT knowledge_context 오분류 -1 |
| D4 실행가능성 | 8 | **8** | — | 변동 없음 |
| D5 일관성 | 8 | **9** | +1 | React 19 inconsistency 해소 |
| D6 리스크 | 7 | **8** | +1 | 4-layer 구조 우수. BUT knowledge_context reject 시 regression 리스크 -1 |

### Verified Weighted Average

| 차원 | 점수 | 가중치 | 가중점수 |
|------|------|--------|---------|
| D1 구체성 | 9 | 10% | 0.90 |
| D2 완전성 | 8 | 25% | 2.00 |
| D3 정확성 | 8 | 15% | 1.20 |
| D4 실행가능성 | 8 | 10% | 0.80 |
| D5 일관성 | 9 | 15% | 1.35 |
| D6 리스크 | 8 | 25% | 2.00 |
| **합계** | | **100%** | **8.25/10 ✅ PASS** |

---

## [Verified] Final Score: 8.25/10 ✅ PASS

HIGH 3건 중 2건 완전 해결 (React 19, Layer C regex). Key shadowing은 Layer 0 구조 우수하나 `knowledge_context` 오분류 1건 잔존 — Step 4 아키텍처에서 Winston Option A(spread 순서 반전) 적용 시 자동 해소.

**Quinn 오판 정정**: Issue #4 (CI Runner cloud-hosted) 철회. 실제로 self-hosted runner 사용 중 (`runs-on: self-hosted` in deploy.yml, ci.yml, weekly-sdk-test.yml). Co-residence 테이블은 원래부터 정확했음.
