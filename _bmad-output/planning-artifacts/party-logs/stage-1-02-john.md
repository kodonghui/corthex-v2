# Critic-C (Product + Delivery) Review — Step 2: Technology Stack Analysis

**Reviewer**: John (PM)
**Date**: 2026-03-20
**File**: `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` — Technology Stack Analysis section (L112-473)

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 9/10 | 전 도메인 정확한 버전 핀(8.17.1, 2.12.3, 0.2.1), 번들 크기(770KB→216KB→<200KB tree-shaken), n8n 리소스(860MB idle/2-4GB peak), Reflection 비용($1.80/month Haiku vs $39/month Sonnet 토큰 단위 계산), SQL 스키마 컬럼·인덱스까지. 소스 링크 전 항목 첨부. |
| D2 완전성 | 20% | 9/10 | 6개 도메인 전부 커버. Go/No-Go #3/#4/#5/#7/#8 직접 데이터 제공. Step 1 아웃라인(version matrix, ARM64, resource ranking) 100% 이행. 대안 비교 테이블(PixiJS vs Phaser/Three.js, Subframe vs v0/Bolt/Lovable). React 19 블로커 신규 발견. |
| D3 정확성 | 15% | 7/10 | 소스 링크 검증 가능. 비용 계산 수학 정합. 그러나 **2건 팩트 오류**: (1) pgvector 버전 자기모순(L126 "0.8.0" vs L325 "~0.7.x or 0.8.0"), (2) **React 19 phantom blocker**(L130 "v2는 React 18" → 실제 v2는 이미 React 19). 존재하지 않는 블로커를 Sprint 4 선행 조건으로 기재 — 계획 왜곡 위험. |
| D4 실행가능성 | 15% | 9/10 | SQL 스키마 복붙 가능. Docker 플래그(--memory=4g, --cpus=2) 명시. n8n env vars 제공. PixiJS tree-shaking 패턴. Big Five 프롬프트 템플릿 + 프리셋 5종. 3-layer sanitization 코드 패턴. 에셋 파이프라인 3가지 옵션. |
| D5 일관성 | 10% | 9/10 | Sprint 순서 Brief §4 일치. Option B 메모리 아키텍처 Stage 0 일관. Step 1 Known Risks(R6-R8) 각 도메인에서 검증됨. |
| D6 리스크 | 20% | 8/10 | n8n co-residence 상세 테이블(15.5GB headroom). PixiJS 번들 16KB 초과 → tree-shaking 해결. ComfyUI GPU = VPS 불가 플래그. React 19 블로커는 phantom(v2 이미 React 19) — 리스크 식별 의도는 좋았으나 코드 검증 부재로 false alarm. |

---

## 가중 평균: 8.50/10 ✅ PASS

계산: (9×0.20) + (9×0.20) + (7×0.15) + (9×0.15) + (9×0.10) + (8×0.20) = 1.80 + 1.80 + 1.05 + 1.35 + 0.90 + 1.60 = **8.50**

> D3 하향 사유: React 19 phantom blocker(팩트 오류) + pgvector 버전 자기모순 — 2건 accuracy 이슈

---

## 이슈 목록

1. **[D3 정확성] pgvector PG extension 버전 자기모순** — Version Matrix(L126)에 "0.8.0 (Neon managed)" 확정 표기, Domain 4(L325)에 "~0.7.x or 0.8.0 on Neon" 불확정 표기. 둘 중 하나로 통일 필요. MEDIUM confidence면 둘 다 "~0.8.0 (Neon managed, MEDIUM confidence)"로 통일.

2. **[D3 정확성 → D6에서 승격] React 19 phantom blocker** — L130에서 "현재 v2는 React 18 — 업그레이드 필요"라고 기재했으나, **코드 검증 결과 v2는 이미 React 19** (`packages/app/package.json`, `packages/admin/package.json`, `packages/ui/package.json`, `packages/landing/package.json` 전부 `"react": "^19"`). Sprint 4 선행 조건에 존재하지 않는 블로커가 기재됨 — **팩트 오류 (D3)**. 올바른 프레이밍: "@pixi/react 8.0.5 requires React 19 — already satisfied in v2. Verify peer dependency compatibility, no upgrade needed." (Winston 코드 검증 제기, John 재검증 확인)

3. **[D2→D3 승격] Go/No-Go #2 vs Layer C 직접 충돌 — Quinn 확인** — soul-renderer.ts:45 `vars[key.trim()] || ''` 패턴이 Go/No-Go #2 "빈 문자열 = FAIL" 기준과 **직접 충돌**. 현재 코드는 personality_traits 키 누락 시 조용히 빈 문자열을 주입 — 시스템이 문자 그대로 실패할 수 없음. Go/No-Go #2가 테스트 불가능한 상태. Quinn 제안: personality 관련 키는 `|| ''` 대신 key-aware fallback (에러/경고 + default personality O=60,C=75,E=50,A=70,N=25 주입). 기타 키는 `|| ''` 유지(backwards compat). **Step 3/4 아키텍처 결정으로 이월 필수.**

---

## Cross-talk 요청 (발신)

- **Winston**: D3 — pgvector version 불일치 L126 vs L325 확인 부탁. React 19 blast radius 아키텍처 의견?
- **Quinn**: D6 — React 19 breaking changes security/regression 관련? sanitization Layer C 충돌?

## Cross-talk 수신 요약

### Winston (Architect)
1. **pgvector 자기모순 동의** — 둘 다 research estimate. 올바른 표기: "Neon managed — exact version TBD, verify via `SELECT extversion FROM pg_extension WHERE extname = 'vector'`"
2. **React 19 phantom blocker 확인** — 코드 검증: app/admin 모두 `"react": "^19"`. Sprint 4 선행 조건을 "verify @pixi/react 8.0.5 compatibility with existing React 19 stack"으로 정정 필요.

### Quinn (QA)
1. **React 19 phantom 동의** — false prerequisite 제거 필요.
2. **[D3 추가] CI Runner co-residence 오류** — GitHub Actions는 cloud-hosted이므로 VPS co-residence 테이블에 포함하면 안 됨. CI Runner 행 제거 시 VPS headroom: ~15.5GB → **~17.5GB**. 이슈 #4로 추가.

### 점수 재계산 (cross-talk 반영)

| 차원 | 초기 | 수정 | 이유 |
|------|------|------|------|
| D3 정확성 | 7/10 | 6/10 | 팩트 오류 3건: React 19 phantom, pgvector 자기모순, CI Runner co-residence |

**수정 가중 평균**: (9×0.20) + (9×0.20) + (6×0.15) + (9×0.15) + (9×0.10) + (8×0.20) = 1.80 + 1.80 + 0.90 + 1.35 + 0.90 + 1.60 = **8.35/10 ✅ PASS**

### 추가 이슈

4. **[D3] CI Runner co-residence 오류** (Quinn 제기) — L238 Co-Residence Risk 테이블에 "CI Runner | 0 | 1-2 GB" 포함됨. GitHub Actions는 cloud-hosted — VPS 리소스 소비 0. 해당 행 제거 + headroom 재계산(~15.5GB → ~17.5GB) 필요.

### 최종 이슈 수: 4개

---

## [Verified] Fixes Verification

**Date**: 2026-03-20

### 이슈별 검증

| # | 이슈 | 상태 | 검증 근거 |
|---|------|------|----------|
| 1 | pgvector 버전 자기모순 | ✅ 완료 | L126: "Neon managed — verify via `SELECT extversion...`" + L333: 동일 표현. 양쪽 통일 확인. |
| 2 | React 19 phantom blocker | ✅ 완료 | L130-131: "v2는 이미 React 19" + 4개 package.json 코드 검증 소스 명시. Sprint 4 블로커에서 제거됨. |
| 3 | Go/No-Go #2 vs Layer C 충돌 | ✅ 완료 | L294-300: 4-Layer Sanitization으로 확장. Layer C에서 `|| ''` 충돌 명시 + 제안 변경(warning log + default personality) 문서화. Step 3/4 이월 인식. |
| 4 | CI Runner co-residence | ✅ dev 반박 수용 | `.github/workflows/deploy.yml:17`, `ci.yml:9`, `weekly-sdk-test.yml:14` 전부 `runs-on: self-hosted`. Quinn "cloud-hosted" 주장 오류 — VPS에서 빌드 실행 맞음. CI Runner 행 유지 + headroom 15.5GB 정확. |

### Verified 점수

| 차원 | 초기 | Cross-talk | Verified | 변화 근거 |
|------|------|-----------|----------|----------|
| D3 정확성 | 8 | 6 | **9** | 팩트 오류 3건 전부 수정. CI Runner self-hosted 코드 검증 확인 — 원래 테이블 정확. |

**Verified 가중 평균**: (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (8×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.60 = **8.80/10 ✅ PASS**

### 잔여 사항

- 없음. 4개 이슈 전부 완료. CI Runner는 코드 검증으로 self-hosted 확인 — dev 반박 수용.

---

## 총평

Step 2로서 excellent. 6개 도메인 모두 구체적 데이터 기반 분석, 대안 비교, VPS 리소스 랭킹까지. 특히 Reflection 비용 모델(Haiku $1.80 vs Sonnet $39)은 Go/No-Go #7의 결정적 입력값. Go/No-Go #2 vs Layer C 충돌 발견은 Step 3/4 아키텍처 결정의 핵심 입력 — 연구 단계에서 이런 충돌을 찾은 것이 가치 있음.
