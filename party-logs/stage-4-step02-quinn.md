# Critic-B (QA + Security) Review — Step 02: Context Analysis

**Reviewer**: Quinn (QA Engineer)
**File**: `_bmad-output/planning-artifacts/architecture.md` L1233–L1427
**Date**: 2026-03-21
**Rubric**: critic-rubric.md (Critic-B weights: D1 10%, D2 **25%**, D3 15%, D4 10%, D5 15%, D6 **25%**)

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 9/10 | 파일 경로(`shared/types.ts:484-501`), hex 미사용(이 단계에서 불필요), 구체적 수치(485 API, 86 tables, 200KB, cosine ≥ 0.75, 768차원 등) 전부 명시. VPS 리소스 테이블 idle/peak 수치까지 구체적. "적절한" 등 추상적 표현 0건. |
| D2 완전성 | **25%** | 8/10 | Step instruction 7개 시퀀스 중 6.5개 충족. Requirements Overview 상세, Scale Assessment 수치화, Infrastructure Impact 테이블 포함, Sprint Dependencies + Go/No-Go 9개 매트릭스, Risk Registry R1-R9, Cross-Cutting 11개, ECC 5개, PRD Carry-Forward 8건. **감점**: n8n Docker pull/startup 검증 절차 누락, ECC간 의존성 미매핑, Reflection 크론 다중 회사 동시 처리 시나리오 미언급. |
| D3 정확성 | 15% | 7/10 | WS 16채널 `shared/types.ts:484-501` 검증 ✓, `model-selector.ts` 경로 ✓, PostToolUse Hook 순서 ✓, n8n 2.12.3 기술연구 일치 ✓, VPS 리소스 산술 ✓. **감점**: FR 카운트 산술 불일치(이슈 #1 — MEDIUM), NFR 카테고리별 카운트 오류(이슈 #2 — LOW), soul-enricher.ts "확장"→"신규" 오기(이슈 #3 — LOW). |
| D4 실행가능성 | 10% | 8/10 | CallAgentResponse 인터페이스 코드 스니펫 포함, Sprint 의존성 시각적 다이어그램, Go/No-Go 매트릭스가 실패 시 대안까지 명시. FIX-3 해소 결정이 3-테이블 모델 근거까지 제시. Context Analysis 단계로서 충분한 구현 방향성. |
| D5 일관성 | 15% | 9/10 | PRD complexity 33/40 일치 ✓, Sprint 순서(Pre→1→2→3→4) PRD/Brief 정합 ✓, Risk R1-R9 기술연구 일치 ✓, v2 아키텍처 D1-D21/E1-E10 용어 유지 ✓, E8 경계 원칙 준수 ✓. type composition 및 domain 분류도 PRD frontmatter와 동일. |
| D6 리스크 | **25%** | 7/10 | R1-R9 리스크 전부 Stage 1 검증 완료 표시, Go/No-Go 9개 게이트로 체계적 리스크 게이팅. **감점**: JSONB race condition이 Sprint 2 active risk인데 interim mitigation 없이 Step 4 이월만 명시(이슈 #5 — MEDIUM), n8n Docker 초기 pull 실패 시나리오 누락(이슈 #4 — MEDIUM), Reflection 크론 다중 회사 동시 실행 리스크 미식별(이슈 #6 — LOW). |

## 가중 평균: 7.85/10 ✅ PASS

계산: (9×0.10) + (8×0.25) + (7×0.15) + (8×0.10) + (9×0.15) + (7×0.25)
= 0.90 + 2.00 + 1.05 + 0.80 + 1.35 + 1.75 = **7.85**

---

## 이슈 목록

### 1. **[D3 정확성] MEDIUM — FR 카운트 산술 불일치**

- **위치**: L1255
- **현재**: `49개 신규, v2 97개 활성 → 총 116개 활성, 2개 삭제`
- **문제**: 97 + 49 - 2 = 144 ≠ 116. 산술 불일치.
- **근거**: `stage-2-step-11-12-scope-snapshot.md` L49: `FR 활성 | 116개 (v2 97 + v3 19)`. 이 snapshot에서는 v3 신규를 19개로 기록. PRD에서 `^- FR-[A-Z]` 패턴 49건 매칭되므로 개별 FR 항목은 49개이나, PRD 확정 snapshot은 "v3 19"라고 명시.
- **수정 제안**: snapshot 기준이라면 → `19개 신규 FR ID, v2 97개 활성 → 총 116개 활성`. 또는 49개가 맞다면 → v2 활성을 `69개`로 정정 (69+49-2=116). 어느 쪽이든 현재 텍스트는 수학적으로 불가.

### 2. **[D3 정확성] LOW — NFR 카테고리별 카운트 오류 (총합 정확, 내부 오류 2건)**

- **위치**: L1273-1284 NFR 테이블
- **문제 A**: `Operations (O9~O10) | 1` → NFR-O9와 NFR-O10은 2개. `1` → `2`로 정정 필요.
- **문제 B**: `External (EXT3) | 1` → NFR-EXT3는 PRD에서 Phase `1` (v2)로 분류. v3 신규가 아님.
- **영향**: 2건이 상쇄되어 총합 16은 정확하나, 개별 행이 둘 다 틀림.
- **수정 제안**: Operations → `2`, External 행 삭제 (또는 `0`). 또는 EXT3가 v3에서 MKT 타임아웃 예외 추가로 "업데이트"된 것이라면 해당 근거 주석 추가.

### 3. **[D3 정확성] LOW — soul-enricher.ts "확장" → "신규" 오기**

- **위치**: L1305
- **현재**: `soul-enricher.ts 확장`
- **문제**: `soul-enricher.ts` 파일은 현재 코드베이스에 존재하지 않음 (`glob **/soul-enricher*` = 0건). 기존 파일은 `engine/soul-renderer.ts`. soul-enricher.ts는 `packages/server/src/services/` 하위에 신규 생성될 파일 (PRD FR-PERS3 참조).
- **수정 제안**: `soul-enricher.ts 확장` → `soul-enricher.ts 신규`

### 4. **[D2 완전성] MEDIUM — n8n Docker 초기 pull/startup 검증 누락**

- **위치**: Risk Registry R6, Go/No-Go 매트릭스
- **문제**: R6은 런타임 OOM을 다루지만, Pre-Sprint Phase 0에서 n8n Docker 이미지의 ARM64 pull 성공 + 초기 startup 검증 절차가 명시되지 않음. 기술 연구 L65에서 "ARM64 manifest 확인" 언급되었으나 아키텍처 Go/No-Go에는 미반영.
- **수정 제안**: Pre-Sprint Phase 0 블록에 `n8n Docker ARM64 pull + healthz 응답 검증` 추가, 또는 Go/No-Go #3 기준에 "Pre-Sprint: Docker pull + startup 성공" 전제 조건 명시.

### 5. **[D6 리스크] MEDIUM — JSONB race condition Sprint 2 active risk, interim mitigation 부재**

- **위치**: L1427 (PRD Carry-Forward)
- **문제**: `company.settings` JSONB에 AES-256 API 키 저장(FR-MKT1)이 Sprint 2에서 구현되는데, JSONB read-modify-write race condition은 "Step 4에서 결정"으로만 이월됨. Sprint 2 착수 시점에 이 결정이 없으면 데이터 손실 리스크.
- **수정 제안**: Carry-Forward 항목에 `Sprint 2 블로커` 태그 추가 + "Step 4 미결정 시 Sprint 2 MKT API 키 저장을 별도 테이블로 임시 구현" 같은 interim mitigation 명시.

### 6. **[D6 리스크] LOW — Reflection 크론 다중 회사 동시 처리 미언급**

- **위치**: Cross-Cutting Concerns, Risk Registry
- **문제**: NFR-O10에서 "advisory lock(동시 실행 방지)"이 언급되었으나, 이것이 글로벌 단일 실행인지 회사별 실행인지 불명확. 회사 100개일 때 순차 처리하면 30초×100 = 50분 지연 가능. 이 시나리오가 리스크로 식별되지 않음.
- **수정 제안**: Cross-Cutting #10 또는 Risk Registry에 회사별 병렬/순차 처리 전략 언급 추가. "Step 4에서 크론 오프셋 vs pg-boss 큐잉 결정" (L1426)과 연결.

### 7. **[D2 완전성] LOW — ECC-1 Sprint 할당 vs 의존성 미매핑**

- **위치**: L1409 ECC Summary Table
- **문제**: ECC-1 (call_agent 응답 표준화)이 Sprint 1로 배정되었으나, Sprint 3 memory pipeline에서 observations가 call_agent 결과를 참조할 수 있음 (FR-MEM1 "에이전트 실행 완료 시 결과"). ECC-1→ECC-3 의존성이 표에 명시되지 않음.
- **수정 제안**: ECC Summary Table에 "의존성" 컬럼 추가, 또는 비고에 "ECC-1 완료가 ECC-3/ECC-5의 observations 구조화 전제" 명시.

### 8. **[D1 구체성] LOW — VPS 리소스 테이블 CPU 총계 오해 소지**

- **위치**: L1318
- **현재**: 총계 CPU `4코어`
- **문제**: 개별 peak CPU 합계 = 1+0.5+1+2+0.5 = 5코어. "4코어"는 VPS 상한이지 peak 합계가 아님. L1323의 서술("4코어 포화")은 정확하나 테이블 수치가 오해 소지.
- **수정 제안**: 총계 CPU를 `5코어 (VPS 4코어 초과)` 또는 `4코어 상한 / peak 5코어 요구`로 정정.

---

## Cross-talk 요약

- **Winston (Critic-A)에게**: 이슈 #1 FR 카운트는 정확성 차원에서 가장 중요. 아키텍처 결정 단계(Step 4+)에서 FR 매핑 시 혼란 유발 가능. 산술 정정 필수.
- **Amelia에게**: ECC-1→ECC-3 의존성 명시 필요. Sprint 1에서 call_agent 응답 구조를 확정하면 Sprint 3 observations 스키마에 영향.
- **Dana (Security)에게**: 이슈 #5 JSONB race condition — Sprint 2에서 API 키를 JSONB에 저장할 때 concurrent Admin 설정 변경 시 키 유실 가능. 보안 관점에서도 검토 요청.

---

## 최종 판정

**7.85/10 ✅ PASS** — 전체적으로 매우 포괄적인 Context Analysis. v2 baseline 수치, v3 요구사항 매핑, 리스크 레지스트리, Go/No-Go 매트릭스가 체계적으로 구성됨. FIX-3 해소 결정(3-테이블 모델)의 근거가 명확하고 Zero Regression 원칙에 부합. 주요 감점은 FR 카운트 산술 불일치(MEDIUM)와 JSONB race condition interim mitigation 부재(MEDIUM). 8건 이슈 중 MEDIUM 3건 해소 시 8.5+ 도달 가능.
