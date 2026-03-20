# Critic-B (QA + Security) Review — Stage 1 Step 01: Technical Research Scope Confirmation

**Reviewer**: Quinn (QA Engineer)
**Date**: 2026-03-20
**Document**: `_bmad-output/planning-artifacts/technical-research-2026-03-20.md`
**Rubric**: Critic-B weights — D1=10%, D2=25%, D3=15%, D4=10%, D5=15%, D6=25%

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | VPS 제약 구체적 (24GB RAM, 4-core ARM64 Neoverse-N1, 200KB gzip, port 5678). Layer-Sprint 매핑 표 명시. BUT: "PixiJS 8.x (latest stable)", "n8n 1.x", "pgvector 0.7+" — 버전 범위만 명시, 정확한 pin 없음 (Step 2에서 확정 예정이므로 Step 1 init으로는 허용) |
| D2 완전성 | **7/10** | Brief §4의 6개 도메인 전부 커버. Sprint 순서·Go/No-Go 8개 Step 6 아웃라인에 포함. inputDocuments 6개 전부 실존 확인. **BUT**: (1) Pre-Sprint Phase 0 blocker 미강조. (2) Go/No-Go #2 강화사항(extraVars 빈 문자열 검증)이 scope에서 언급 안 됨. (3) **[Cross-talk John]** Brief HTML comments의 Known Risks 5개(PixiJS learning curve, n8n iframe vs API, pgvector 기존 활용, UXUI 428 color-mix, prd.md 7 issues)를 scope 단계에서 전혀 참조 안 함 — 연구 방향 설정 시 기존 인식된 리스크를 baseline으로 포함해야 |
| D3 정확성 | **8/10** | v2 수치 정확 (485 API, 86 tables, 71 pages — audit doc과 일치). soul-renderer.ts extraVars 실존 확인 (4 occurrences). memory-extractor.ts `services/memory-extractor.ts` 실존. memoryTypeEnum `['learning','insight','preference','fact']` — Brief와 정합. inputDocuments 6개 전부 실존 검증. **BUT [Cross-talk Winston]**: Domain 6 "Subframe + **Stitch** UXUI" — Stitch는 Phase 6에서 폐기됨 (Gemini 프롬프트로 교체). Brief에도 Stitch 언급 없음. 사실 오류 1건 |
| D4 실행가능성 | 7/10 | Step 1 init으로서 적절. Steps 2-6 아웃라인이 도메인별로 무엇을 조사할지 명확. 다만 Step 2-6 각각의 expected output format(코드 스니펫? 비교 표? 벤치마크?)이 미정의 — init이므로 허용 범위 |
| D5 일관성 | 9/10 | Stage 0 Step 05 snapshot과 완전 정합: Sprint 순서(Pre→1→2→3→4), memory-reflection.ts 분리, observations raw INPUT 역할, Go/No-Go 8개. Layer 번호→Sprint 번호 매핑 일치. Brief §4 구조와 동일 |
| D6 리스크 | **6/10** | VPS 하드 한도 5개 명시 (RAM, 코어, 번들, 포트, 인프라 제약). **BUT**: (1) n8n Docker ARM64 호환성 미플래그. (2) AI sprite 재현성/VCS 미플래그. (3) personality_traits JSONB prompt injection 미언급. (4) **[Cross-talk Winston]** Go/No-Go #2 silent failure: soul-renderer.ts L45 `vars[key.trim()] \|\| ''` — personality_traits 키 미존재 시 빈 문자열 주입 + 에러 없음. 성격 미적용을 감지할 수 없는 보안/품질 리스크가 Domain 3 연구 항목에 포함되어야 함. (5) **[Cross-talk John]** n8n Docker 메모리 할당: 24GB VPS에서 Bun+Neon proxy+workers+n8n 공존 시 메모리 경합 리스크 — scope 레벨 인식 필요 |

---

## 가중 평균

| 차원 | 점수 | 가중치 | 가중점수 |
|------|------|--------|---------|
| D1 구체성 | 8 | 10% | 0.80 |
| D2 완전성 | **7** | 25% | 1.75 |
| D3 정확성 | **8** | 15% | 1.20 |
| D4 실행가능성 | 7 | 10% | 0.70 |
| D5 일관성 | 9 | 15% | 1.35 |
| D6 리스크 | **6** | 25% | 1.50 |
| **합계** | | **100%** | **7.30/10 ✅ PASS** |

> ⚠️ **Cross-talk 반영 후 수정**: 초기 7.95 → 7.30. D2 8→7 (Brief Known Risks 미참조), D3 9→8 (Stitch 폐기 사실 오류), D6 7→6 (Go/No-Go #2 silent failure + n8n 메모리 공존 리스크). 여전히 PASS이나 마진 축소.

---

## 이슈 목록

### Issue 1 — [D6 리스크] n8n Docker ARM64 호환성 미플래그 (Medium)
- n8n Docker 공식 이미지가 ARM64 Neoverse-N1에서 돌아가는지는 Step 2 research의 핵심이지만, **scope confirmation 단계에서 이 리스크를 명시적으로 인식**해야 함
- **권장**: VPS Constraints 섹션에 "n8n Docker ARM64 지원 여부: Step 2에서 검증 필수 — 미지원 시 QEMU emulation 또는 소스 빌드 필요" 1줄 추가

### Issue 2 — [D6 리스크] personality_traits JSONB prompt injection 리스크 미언급 (Medium)
- Big Five 슬라이더 UI로 0.0~1.0 범위만 받지만, API 레벨에서 JSONB 직접 조작 시 `extraVars`에 악의적 문자열 주입 가능
- **권장**: Domain 3 연구 범위에 "Big Five JSONB 입력 검증 + extraVars sanitization 패턴" 추가

### Issue 3 — [D2 완전성] Pre-Sprint Phase 0 blocker 미강조 (Low)
- Brief §4 + Stage 0 snapshot 모두 "테마 미확정 시 전 Sprint UI 재작업 리스크" 명시. Domain 6에서 커버 가능하나, scope confirmation 섹션 자체에서 **Layer 0 Pre-Sprint가 전체 Sprint 체인의 blocker**라는 점 명시 필요
- **권장**: Research Goals에 "5. Pre-Sprint Phase 0 테마 결정이 Sprint 1~4 착수 선행 조건임을 인식하고, Layer 0 연구를 타 도메인보다 선행 또는 병행 실행" 추가

### Issue 4 — [D6 리스크] AI sprite 재현성/에셋 버전 관리 (Low)
- AI 생성 스프라이트의 재현성(동일 프롬프트 → 다른 결과), 에셋 VCS 전략이 scope에서 언급 안 됨
- Domain 5 outline에는 "AI sprite generation tool evaluation" 있으나 scope confirmation에서 리스크로 플래그 필요
- **권장**: "AI 생성 에셋 재현성 리스크: 생성 프롬프트·시드·버전 관리 전략 필요 (Step 5에서 조사)" 1줄 추가

### Issue 5 — [D3 정확성] Stitch 폐기 사실 오류 (Medium) ⚡ Cross-talk Winston
- Domain 6 "Subframe + **Stitch** UXUI" — Stitch는 Phase 6에서 폐기됨 (Gemini 프롬프트 4개로 교체). Brief에 Stitch 언급 없음.
- **권장**: Domain 6을 "Subframe + `/kdh-uxui-redesign-full-auto-pipeline` UXUI"로 수정, 또는 Stitch 삭제

### Issue 6 — [D6 리스크] Go/No-Go #2 silent failure 연구 누락 (High) ⚡ Cross-talk Winston
- soul-renderer.ts L45: `vars[key.trim()] || ''` — personality_traits 키가 extraVars에 없으면 **빈 문자열이 주입되고 에러 없음**. 성격이 적용되지 않았는데 시스템이 정상으로 보고하는 silent failure 패턴.
- Stage 0 snapshot에서 이월된 Go/No-Go #2 강화사항임에도 연구 scope에 포함 안 됨.
- **권장**: Domain 3 연구 범위에 "soul-renderer.ts `|| ''` fallback 동작 분석 + extraVars 주입 검증 패턴 (키 존재 + 빈 문자열 여부)" 연구 항목 추가. 이것은 **보안(injection)과 품질(silent failure)의 교차점**.

### Issue 7 — [D2 완전성] Brief Known Risks 5개 미참조 (Medium) ⚡ Cross-talk John
- Brief HTML comments에 명시된 Known Risks 5개가 연구 scope에서 전혀 참조되지 않음:
  1. PixiJS 8 learning curve (new dependency)
  2. n8n iframe embed vs API integration complexity
  3. pgvector already installed (Epic 10)
  4. UXUI 428 color-mix incident → full theme reset
  5. prd.md has 7 known issues
- **권장**: Research Goals 또는 별도 "Known Risks Baseline" 섹션에 Brief의 5개 리스크를 명시적으로 나열하고 각각 해당 Domain 번호 매핑

### Issue 8 — [D6 리스크] n8n Docker 메모리 공존 리스크 (Medium) ⚡ Cross-talk John
- 24GB VPS에서 Bun server + Neon PostgreSQL proxy + 6 background workers + n8n Docker가 공존. 메모리 할당 계획 없이 n8n 추가 시 OOM 리스크.
- **권장**: VPS Constraints에 "n8n Docker 메모리 할당: 기존 서비스 메모리 사용량 baseline 측정 후 n8n 할당 상한 결정 (Step 2 조사 항목)" 추가

---

## 자동 불합격 체크

| 조건 | 결과 |
|------|------|
| 할루시네이션 (미존재 API/파일 참조) | ✅ CLEAR — inputDocuments 6개 전부 실존, soul-renderer.ts/memory-extractor.ts 실존 확인 |
| 보안 구멍 | ✅ CLEAR — scope 단계, 코드 없음 |
| 빌드 깨짐 | ✅ CLEAR — scope 단계, 코드 없음 |
| 데이터 손실 위험 | ✅ CLEAR |
| 아키텍처 위반 (E8) | ✅ CLEAR — E8 경계 준수 언급 |

---

## Cross-talk Notes

- **Winston (Architect)**: Stitch 폐기 사실 오류 + Go/No-Go #2 silent failure(`|| ''` fallback) 지적 수용. D3 9→8, D6 7→6 조정. extraVars sanitization은 아키텍처+QA 공동 관심사.
- **John (PM)**: Brief Known Risks 5개 미참조 + n8n 메모리 공존 리스크 지적 수용. D2 8→7 조정. Pre-Sprint blocker 강조 의견 동의.
- **Winston 리뷰 점수 참고**: 7.45/10 PASS (5 issues). Quinn과 합산하면 평균 7.38 — PASS이나 마진 얇음.

---

## 최종 판정 (Cross-talk 반영)

**7.30/10 ✅ PASS** (초기 7.95 → cross-talk 반영 후 7.30)

총 8개 이슈 (1 High, 4 Medium, 3 Low). 전부 수정 적용 시 8.5+ 예상.

---

## Verification (Fixes Applied)

**Date**: 2026-03-20
**Verified by**: Quinn (Critic-B)

### Issue Verification

| # | Issue | Severity | Fix | Verified |
|---|-------|----------|-----|----------|
| 1 | n8n Docker ARM64 호환성 | Medium | L65: VPS Constraints에 ARM64 검증 필요 명시 + R6 Known Risks | ✅ |
| 2 | personality_traits JSONB injection | Medium | R7 Known Risks + L131 Step 4 sanitization 연구 항목 | ✅ |
| 3 | Pre-Sprint Phase 0 blocker | Low | L71: Sprint Blockers 섹션 신설, 3개 blocker 명시 | ✅ |
| 4 | AI sprite 재현성/VCS | Low | R8 Known Risks + L138 Step 5 reproducibility 항목 | ✅ |
| 5 | Stitch 폐기 사실 오류 ⚡Winston | Medium | L51: "Subframe + UXUI Redesign Pipeline" (Stitch 삭제) | ✅ |
| 6 | Go/No-Go #2 silent failure ⚡Winston | HIGH | R9 Known Risks + L130 Step 4 `\|\| ''` fallback 대응 + Go/No-Go 매핑표 #2에 빈 문자열 검증 명시 | ✅ |
| 7 | Brief Known Risks 미참조 ⚡John | Medium | Known Risks 표 R1-R9: Brief 5개(R1-R5) + critic 4개(R6-R9), 도메인 매핑 + 검증 방법 전부 명시 | ✅ |
| 8 | n8n Docker 메모리 공존 ⚡John | Medium | L68: 기존 서비스 co-residence 명시 + L40 Research Goal #5 "per-domain resource intensity" | ✅ |

**추가 수정 확인:**
- pgvector 버전: L57 "pgvector (npm: ^0.2.1, PG extension: version TBD — Neon managed)" + R3 교차 확인 ✅
- Go/No-Go 8개 게이트 → 연구 도메인 매핑표 (L96-L106) 신설 ✅
- Step 2-5 outline 각각 구체적 연구 항목 보강 (ARM64 manifest, version pinning, silent failure 대응, reproducibility) ✅

### Verified Scores

| 차원 | Before | After | 변동 | 근거 |
|------|--------|-------|------|------|
| D1 구체성 | 8 | **9** | +1 | pgvector npm 버전 명시, Research Goal #5 구체화, Step outline 항목 보강 |
| D2 완전성 | 7 | **9** | +2 | Known Risks R1-R9 전체 매핑, Go/No-Go 8개 매핑표, Sprint Blockers 섹션, Brief 5개 리스크 전부 참조 |
| D3 정확성 | 8 | **9** | +1 | Stitch→UXUI Redesign Pipeline 수정, pgvector 버전 교정 |
| D4 실행가능성 | 7 | **8** | +1 | Step 2-5 outline에 구체적 조사 항목 + 검증 방법 추가 |
| D5 일관성 | 9 | **9** | — | 변동 없음 |
| D6 리스크 | 6 | **9** | +3 | R1-R9 리스크 표 + 검증 방법, Sprint Blockers 3개, VPS co-residence, Go/No-Go #2 silent failure, JSONB injection |

### Verified Weighted Average

| 차원 | 점수 | 가중치 | 가중점수 |
|------|------|--------|---------|
| D1 구체성 | 9 | 10% | 0.90 |
| D2 완전성 | 9 | 25% | 2.25 |
| D3 정확성 | 9 | 15% | 1.35 |
| D4 실행가능성 | 8 | 10% | 0.80 |
| D5 일관성 | 9 | 15% | 1.35 |
| D6 리스크 | 9 | 25% | 2.25 |
| **합계** | | **100%** | **8.90/10 ✅ PASS** |

---

## [Verified] Final Score: 8.90/10 ✅ PASS

8개 이슈 전부 수정 확인. 특히 D6 리스크가 6→9로 대폭 개선 — Known Risks R1-R9 표, Go/No-Go 8개 매핑표, Sprint Blockers 섹션이 추가되면서 Stage 1 init 문서로서 탁월한 리스크 인식 수준 달성.

Winston의 extraVars injection 분석(L45 `|| ''` → silent failure path)이 R9 + Step 4 연구 항목으로 반영된 점은 보안 관점에서 핵심적. 이 패턴이 Step 3-4에서 실제 sanitization 아키텍처로 이어져야 함.
