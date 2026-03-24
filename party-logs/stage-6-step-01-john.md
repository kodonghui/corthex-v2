# Critic-C Review — Step 1: Validate Prerequisites (Requirements Extraction)

**Reviewer:** John (PM, Critic-C: Product + Delivery)
**Date:** 2026-03-23
**File:** `_bmad-output/planning-artifacts/epics-and-stories.md`

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 9/10 | FRs에 Phase/Sprint 태그, 구체적 파일 경로(`packages/server/src/services/soul-enricher.ts`), 마이그레이션 번호(`0062`), 정량값(0-100 정수, 200KB gzipped, 500ms polling), hex 색상(#283618, #faf8f5), px 단위(240px sidebar, 56px topbar) 전부 명시. "적절한" 류 추상적 표현 거의 없음. |
| D2 완전성 | 20% | 6/10 | **FRs 123개 전부 나열, NFRs 76개 전부 나열, ARs 72개 전부 나열, UXRs 140개 전부 나열 — 4대 카테고리 완벽.** 그러나 PRD Domain-Specific Requirements 80개(SEC 7, SDK 4, DB 5, ORC 7, SOUL 6, OPS 6, NLM 4, VEC 4, N8N-SEC 8, PER 6, MEM 7, PIX 6, MKT 5, NRT 5)가 overview에서 "80 domain-specific requirements" 언급만 하고 **본문에 미나열**. 이 중 SDK-1~4(사용 API 8개 고정, unstable 금지), DB-1~5(tier_level CHECK, secretary CHECK, rollback script), NLM-1~4(OAuth, async, tool scope), VEC-1~4(chunk 2048 tokens, cosine ≥ 0.7), MEM-4(Admin 전용 삭제), MEM-5(memory 감사 로그), NRT-1(degraded 6th state), NRT-2(heartbeat 5s), PIX-2(WebGL→Canvas fallback), PER-3(default 50), PER-4(Soul injection fallback) 등은 FRs/NFRs/ARs에 없는 **고유 요구사항**. Step 2 epic 설계 시 누락 위험. |
| D3 정확성 | 15% | 7/10 | **FR 개수 오류**: overview에 "103 active FRs" 기재, 실제 나열된 수는 **123개** (FR1-68 minus 2 = 66, +FR69-72 = 70, +OC11 = 81, +N8N6 = 87, +MKT7 = 94, +PERS9 = 103, +MEM14 = 117, +TOOLSANITIZE3 = 120, +UX3 = 123). NFR 76개, AR 72개, UXR 140개는 정확. FR-OC7에서 PRD의 "LISTEN/NOTIFY primary, 500ms polling fallback" → Architecture 확정 "500ms polling only (LISTEN/NOTIFY impossible on Neon)" 반영은 올바른 reconciliation이지만 명시적 문서화 없음. |
| D4 실행가능성 | 15% | 7/10 | 요구사항 나열은 충분히 구체적이어서 Step 2 epic 설계의 입력으로 사용 가능. 그러나 `{{requirements_coverage_map}}`과 `{{epics_list}}`가 template placeholder로 남아있어 Step 2 진행 전 해결 필요. Coverage map 없이는 FR→Epic 추적성 확보 불가. |
| D5 일관성 | 10% | 8/10 | PRD 용어(Hub, Tracker, Library, Tier, Handoff, Soul, NEXUS, OpenClaw, BigFive) 일관 사용. Phase/Sprint 할당이 PRD와 정합. AR/UXR 번호 체계가 원본과 일치. 영문 번역이 원문 의미를 정확히 전달. |
| D6 리스크 | 20% | 6/10 | **Domain-specific requirements 누락이 delivery risk**: Step 2에서 epic 설계 시 SDK constraints(SDK-1~4), DB constraints(DB-1~5), NotebookLM scope(NLM-1~4), Vector search specs(VEC-1~4)가 빠지면 해당 기능의 epic이 불완전해짐. FR count 오류(103 vs 123)는 downstream 문서 참조 시 혼란 유발. PRD-Architecture 결정 충돌(FR-OC7 등) reconciliation policy 미정립 — 향후 Step에서도 동일 이슈 발생 가능. |

## 가중 평균 (초기): 7.10/10 ⚠️ BORDERLINE PASS

**계산:** (9×0.20) + (6×0.20) + (7×0.15) + (7×0.15) + (8×0.10) + (6×0.20) = 1.80 + 1.20 + 1.05 + 1.05 + 0.80 + 1.20 = **7.10/10**

---

## Re-Review After Fixes (2026-03-23)

### 수정 검증 결과

| # | 이슈 | 수정 상태 | 검증 |
|---|------|----------|------|
| 1 | Domain-Specific Requirements 80개 미나열 | ✅ FIXED | L660-L784에 14개 카테고리 80개 전부 나열 확인. grep 카운트 80/80 일치. SEC(7), SDK(4), DB(5), ORC(7), SOUL(6), OPS(6), NLM(4), VEC(4), N8N-SEC(8), PER(6), MEM(7), PIX(6), MKT(5), NRT(5). 각 항목 ID+상세+Phase 포함. |
| 2 | FR count 103→123 | ✅ FIXED | L16: "123 active FRs" 확인 |
| 3 | PRD-Architecture reconciliation | ✅ FIXED | L786-L797에 6건 문서화: FR-OC7(LISTEN/NOTIFY→polling), NFR-SC1(10→20 concurrent), NFR-SC2(50MB→200MB), total memory(3GB→16GB), Soul variables, parallel handoff deferral. 테이블 형식, PRD statement vs Architecture resolution 명확 구분. |
| 4 | Template placeholders | ✅ FIXED | L801, L805에 `<!-- TODO: Step 2 -->` HTML 코멘트로 교체, 용도 설명 포함 |

### 수정 후 차원별 점수

| 차원 | 가중치 | 수정 전 | 수정 후 | 변동 근거 |
|------|--------|--------|--------|----------|
| D1 구체성 | 20% | 9/10 | 9/10 | 변동 없음 |
| D2 완전성 | 20% | 6/10 | **9/10** | 80 DSRs 전부 추가. 5대 카테고리(FR 123 + NFR 76 + AR 72 + UXR 140 + DSR 80 = **491개**) 완비. Coverage map은 Step 2 명시적 TODO. |
| D3 정확성 | 15% | 7/10 | **9/10** | FR count 수정(123). Reconciliation 6건 문서화로 PRD-Architecture 결정 충돌 투명화. |
| D4 실행가능성 | 15% | 7/10 | **8/10** | DSRs가 SDK constraints(8 API 고정), DB CHECK(tier_level, secretary), fallback 동작(PER-4, PIX-2, MKT-2) 등 구현 핵심 context 제공. TODO 명확화. |
| D5 일관성 | 10% | 8/10 | 8/10 | 변동 없음 |
| D6 리스크 | 20% | 6/10 | **8/10** | Reconciliation notes로 PRD-Architecture 충돌 6건 명시. DSRs에 failure modes(PER-4 fallback, MEM-3 isolation, PIX-2 WebGL→Canvas, MKT-2 API fallback) 포함. Domain constraint 누락 리스크 해소. |

### 수정 후 가중 평균: 8.55/10 ✅ PASS

**계산:** (9×0.20) + (9×0.20) + (9×0.15) + (8×0.15) + (8×0.10) + (8×0.20) = 1.80 + 1.80 + 1.35 + 1.20 + 0.80 + 1.60 = **8.55/10**

## 이슈 목록 (Priority Order)

### 1. **[D2 완전성] PRD Domain-Specific Requirements 80개 미나열** — CRITICAL
- Overview에 "80 domain-specific requirements" 언급했으나 본문에 나열 안 됨
- PRD §Domain-Specific Requirements (L1352-L1536): SEC(7), SDK(4), DB(5), ORC(7), SOUL(6), OPS(6), NLM(4), VEC(4), N8N-SEC(8), PER(6), MEM(7), PIX(6), MKT(5), NRT(5)
- **FRs/NFRs/ARs에 없는 고유 요구사항 최소 20+개**: SDK-1~4, DB-1~5, NLM-1~4, VEC-1~4, MEM-4/5, NRT-1/2, PIX-2/4/6, PER-3/4, SEC-7, MKT-3/5
- **Fix**: "From PRD Domain-Specific Requirements" 섹션 추가, 80개 전부 나열. FRs/NFRs/ARs와 중복되는 항목은 cross-reference 표기

### 2. **[D3 정확성] FR 개수 오류 (103 → 123)**
- Overview L16: "103 active FRs" → 실제 나열 123개
- bob의 Review Request 메시지에도 "103 active Functional Requirements" 전파됨
- **Fix**: Overview의 FR count를 123으로 수정. 산출 근거 추가: `(68-2) + 4 + 11 + 6 + 7 + 9 + 14 + 3 + 3 = 123`

### 3. **[D6 리스크] PRD-Architecture 결정 충돌 reconciliation 미문서화**
- FR-OC7: PRD says "LISTEN/NOTIFY primary, 500ms polling fallback" → Extraction says "500ms polling (LISTEN/NOTIFY impossible on Neon serverless)"
- Architecture AR53 기반 올바른 결정이지만 명시적 reconciliation note 없음
- **Fix**: "Reconciliation Notes" 섹션 추가. PRD vs Architecture 결정 충돌 시 Architecture 우선 원칙 + 각 케이스 문서화

### 4. **[D4 실행가능성] Template placeholders 잔존**
- L662: `{{requirements_coverage_map}}` — Step 2 입력에 필요
- L666: `{{epics_list}}` — Step 2-3 출력 대상
- **Fix**: Step 2 진행 전 coverage map placeholder를 실제 FR→Sprint 매핑 테이블로 교체 (또는 Step 2에서 채울 것이라면 명시적 TODO 표기)

## Cross-talk 요약

- **Winston (Critic-A)**: AR1-72 추출 정확성 확인 요청 + domain-specific requirements 중 Architecture 관련(SDK-1~4, DB-1~5, ORC-1~7) 누락 확인 요청
- **Quinn (Critic-B)**: FR count 오류(103 vs 123) 공유 + domain-specific requirements 중 테스트 관련(Go/No-Go gates, PER sanitization, MEM defense, N8N-SEC 8-layer) 누락이 QA 커버리지에 미치는 영향 확인 요청
