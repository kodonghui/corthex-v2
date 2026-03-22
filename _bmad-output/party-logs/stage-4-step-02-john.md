# Stage 4 Step 2 — Critic-C (John) Review: v3 Project Context Analysis

**Date:** 2026-03-22
**Reviewer:** John (Critic-C, Product + Delivery)
**Writer:** Winston
**Step:** Step 2 — Context Analysis (v3 Update)
**Focus:** PRD alignment, Sprint feasibility, Go/No-Go gate coverage

---

## R1 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 20% | 파일 경로(`soul-enricher.ts`, `memory-reflection.ts`, `office-channel.ts`), 메모리 GB 값, WS 한도(50/company, 500/server, 10msg/s), sanitization 체인 4-layer 각각 명명. "~35개"만 근사치이나 개별 열거됨. |
| D2 완전성 | 8/10 | 20% | Stage 1 확정 결정 12개 전부 반영. v3 7개 capability area + 14개 Go/No-Go 정확 매핑. Cross-cutting concerns 6→12 확장. 누락: (1) 총 LLM 비용 ~$17/mo 미명시, (2) observation 필드명 변경(is_processed→reflected) 미언급. |
| D3 정확성 | 7/10 | 15% | **FR-TOOLSANITIZE 수량 오류**: 아키텍처 "1 FR"이나 PRD는 FR-TOOLSANITIZE1~3 = 3개. v2 comment "72 FRs"이나 Tier&Cost 6→4 감소 반영 시 70. NFR "76개"는 내부 계산(58+18-2) 정합이나 인용한 PRD 메타 "74"와 불일치. Phase 4 의존성 테이블(Step 3 범위)에 `@google/genai` 잔존 — Step 3에서 수정 필수. |
| D4 실행가능성 | 8/10 | 15% | 메모리 예산 테이블 실용적(11GB/24GB). 용량 시나리오 4단계. soul-enricher.ts 1행 삽입 통합점 명확. Sprint 구조 + Layer 0 병행 전략 구체적. |
| D5 일관성 | 8/10 | 10% | Sprint 순서 PRD 정합. 용어 PRD 용어사전과 일치. E8 경계 올바르게 참조. 14개 Go/No-Go 번호 PRD 테이블과 일치. 문서 내부 FR 총수 불일치(116 vs 실제 합산 118+) 존재. |
| D6 리스크 | 7/10 | 20% | 메모리 13GB 여유 분석 우수. CPU 병목 식별. n8n OOM 경고. LISTEN/NOTIFY Neon 불확실성 + advisory lock Neon 호환 플래그. **누락 리스크 3건**: (1) CI/CD runner + n8n Docker + PG 동시 CPU 경합 최악 시나리오, (2) HNSW 1024d × 3개 인덱스 rebuild 시 PG 4GB 할당 메모리 압박, (3) Voyage AI API 장애/rate limit가 Pre-Sprint 일정(R11 Critical)에 미치는 영향. |

### R1 가중 평균: 7.85/10 ✅ PASS

**계산:** (9×0.20) + (8×0.20) + (7×0.15) + (8×0.15) + (8×0.10) + (7×0.20) = 1.80 + 1.60 + 1.05 + 1.20 + 0.80 + 1.40 = **7.85**

---

## R1 이슈 목록

### 🔴 Must Fix (3건)
1. FR-TOOLSANITIZE 1→3
2. v2 FR comment 72→70
3. 총 FR 수 재계산 (116→실제 합산)

### 🟡 Should Fix (3건)
4. HNSW rebuild 메모리 압박
5. CI/CD + n8n + PG CPU 경합
6. Voyage AI Pre-Sprint 일정 리스크

### 💬 Observation (2건)
7. Phase 4 `@google/genai` 잔존 (Step 3 scope)
8. 총 LLM 비용 ~$17/mo 미명시 (Step 4 scope)

---

## R2 Verification — 수정 후 재채점

**수정 확인 결과 (17 unique fixes from 4 critics):**

| # | 이슈 | 수정 결과 | 검증 |
|---|------|----------|------|
| 1 | FR-TOOLSANITIZE 1→3 | ✅ Line 87: `3 | Sprint 2~3`. 상세 설명 추가 (감지+차단+감사+검증). `engine/hooks/tool-sanitizer.ts` 경로 추가. | PRD FR-TOOLSANITIZE1~3과 일치 |
| 2 | v2 FR 72→70 | ✅ Line 61 comment: "70 FRs". Tier&Cost 6→4 반영. | 합산 10+10+5+8+4+6+4+7+2+3+7+4=70 ✅ |
| 3 | 총 FR 재계산 | ✅ Line 59: "123개, 20 Capability Areas — v2:70 + v3:53". FR-UX(3) 추가됨. | 70+11+6+7+9+14+3+3=123 ✅ |
| 4 | HNSW rebuild 메모리 | ✅ Lines 146, 151: PG 4GB 중 ~2GB, 3인덱스 순차 필수, work_mem 일시 증가 고려 | 구체적 수치+대안 포함 |
| 5 | CI/CD+n8n CPU 경합 | ✅ Lines 145, 152: 용량 테이블 신규 행 + n8n `--cpus=1` 일시 제한 대안 | 시나리오+대안 포함 |
| 6 | Voyage Pre-Sprint | ✅ Line 153: R11 Critical, bulk rate limit, batch 간격 설정 필수 | Sprint 1 지연 가능성 명시 |
| 7 | @google/genai | ✅ Line 385: `voyageai` 패키지로 교체 완료 (Dev 수정) | Gemini 잔존 0건 (grep 확인) |
| 8 | LLM 비용 $17/mo | — Step 4 decisions 범위. 현 단계 미적용 합당. | N/A |

**추가 수정 사항 (다른 critic 이슈 중 Product+Delivery 관점 검증):**

| 수정 | 검증 |
|------|------|
| FR-UX 3개 추가 (Quinn) | ✅ Line 88: CEO앱 14→6 통합, GATE 결정 반영. v3=53 FRs 정합 |
| Hook 5개 (Dev) | ✅ Line 70: cost-tracker Hook 유지 (SSE done.costUsd), 사용자 대면 UI만 제거. v2와 정합 |
| Go/No-Go #11 라벨 (Quinn) | ✅ Line 89: "cost ceiling"→"tool sanitization" PRD L604 일치 |
| SessionContext +runId (Dev) | ✅ Line 251: E17 도구 호출 그룹핑. Epic 15 구현과 정합 |
| soul-enricher.ts 경로 (Dev) | ✅ Lines 166, 223: `services/soul-enricher.ts` 명시. E8 안전성 주석 포함 |
| NFR Security 10→9 (Quinn) | ✅ Line 98: S7 삭제 명시. P0 9/9 정합 |
| NFR Data Integrity 8→7 (Quinn) | ✅ Line 102: D7 삭제 명시 |
| n8n proxy path traversal (Quinn) | ✅ Line 154: Step 4 보안 결정으로 deferred |

### R2 차원별 점수

| 차원 | R1 | R2 | 변화 근거 |
|------|-----|-----|----------|
| D1 구체성 | 9 | 9 | 유지. `tool-sanitizer.ts` 경로, FR-UX 상세 추가로 더 강화됨. |
| D2 완전성 | 8 | 9 | FR-UX 3개 추가, NFR 삭제 표기, Go/No-Go #11 라벨 수정. 20 Areas 완전. |
| D3 정확성 | 7 | 9 | FR 수량 전부 수정(123=70+53). NFR 76 정합. Hook 5개 모순 해소. @google/genai 제거. |
| D4 실행가능성 | 8 | 9 | 용량 시나리오 4→6행. 리스크별 구체적 대안(순차 rebuild, cpus 제한, batch 간격). |
| D5 일관성 | 8 | 9 | Upper↔lower 정합 검증됨. FR/NFR/Go/No-Go 번호 전부 일치. |
| D6 리스크 | 7 | 9 | 4개 신규 리스크(HNSW, CPU, Voyage, path traversal) 전부 대안 포함. |

### R2 가중 평균: 9.00/10 ✅ PASS

**계산:** (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.80 = **9.00**

---

## 결론

R1에서 지적한 **6건 전부 수정 완료**. 특히 FR 수량 정확성이 크게 개선(116→123, 내부 합산 검증됨). 다른 critic들의 수정(FR-UX, Hook 5개, Go/No-Go #11 라벨, SessionContext +runId, NFR 삭제 표기)도 Product+Delivery 관점에서 모두 적절. 자동 불합격 조건 0건. **9.00/10 — Excellent.**
