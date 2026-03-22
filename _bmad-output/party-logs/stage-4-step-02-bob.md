# Stage 4 Step 02 — Bob (Critic-C, Scrum Master) Review

**Reviewer:** Bob (Critic-C, Product + Delivery / Scrum Master)
**Date:** 2026-03-22
**Target:** `_bmad-output/planning-artifacts/architecture.md` Step 2 — v3 Project Context Analysis Update
**Weights:** D1=15%, D2=20%, D3=15%, D4=15%, D5=15%, D6=20%

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 8/10 | Docker 플래그(`--memory=2g --cpus=2`), 파일 경로(`soul-enricher.ts`, `office-channel.ts`), 정확한 수치(50conn/company, 500/server, 10msg/s), 보안 레이어 상세, WebSocket 채널 수(16→17) 전부 구체적. Sprint 일정(기간/벨로시티)만 미명시. |
| D2 완전성 | 20% | 6/10 | Step 2 상단 섹션(L55-227)은 우수. **그러나**: (1) Pre-Sprint 의존성 트리(L1401-1415)에 Voyage AI 마이그레이션 누락 — Pre-Sprint 블로커임에도 3개 항목만 나열. (2) Go/No-Go 매트릭스 9개만(L1418) — FR 테이블은 14개(L88), 확정 결정은 11개. 5개 게이트(#10~#14) 미정의. (3) 확정 결정 #7 observation 스키마 필드 리네임(`is_processed→reflected`, `processed_at→reflected_at`) 미반영. (4) Sprint별 기간/벨로시티 추정 전무 — Solo dev+AI 체제에서 용량 계획 불가. |
| D3 정확성 | 15% | 5/10 | **7건 이상 팩트 오류**: (1) L1335 "Gemini Embedding 768차원" — 확정 결정 #1 위반(Voyage AI 1024d). (2) L1396 "pgvector 768차원" — 동일 위반. (3) L375 `@google/genai` Phase 4 의존성 목록 잔존. (4) L1332/1350/1368/1424 n8n "6-layer" — 확정 결정 #3은 8-layer, 상단 L83/223도 8-layer. (5) L1353/1396 observations "90일 보관" — 확정 결정 #5는 30일. (6) L1388 n8n peak "~4GB" — `--memory=2g` 캡 상한 초과 불가. (7) L1441 R6 완화책 "4G/2CPU" — 확정 결정 #2는 2G. |
| D4 실행가능성 | 15% | 7/10 | FR 영역별 아키텍처 영향 분석 우수. soul-enricher.ts 단일 진입점 패턴, E8 최소 침습 1행 삽입 등 구현 가이드 명확. **그러나** 3-table vs 2-table 메모리 모델 모순(아래 D5 참조)이 구현자를 혼란시킴 — 어느 모델로 구현해야 하는지 판단 불가. |
| D5 일관성 | 15% | 4/10 | **문서 내부 모순 8건**: (1) **메모리 모델**: L86 "Option B agent_memories 확장" vs L1339-1343 "3-테이블 모델 확정(agent_memories 미변경)". 근본적 스코프 충돌. (2) **NFR 수**: 프론트매터 74개(L13) vs 본문 76개(L90-92: 58+18) vs v3섹션 74개(L1345: 58+16). (3) **n8n 보안**: 상단 8-layer(L83,223) vs 하단 6-layer(L1332,1350,1368,1424) — 4곳 불일치. (4) **Go/No-Go**: 14개(L88) vs 9개(L1418). (5) **컴포넌트 수**: ~35개(L114) vs ~25개(L1377). (6) **FR-PERS**: 9개(L85) vs 8개(L1334). (7) **FR-MEM**: 14개(L86) vs 11개(L1335). (8) **Cross-cutting 이중 정의**: L212-227(#7-12, 6개) vs L1456-1475(#7-11, 5개) — 번호·내용·개수 전부 불일치. |
| D6 리스크 | 20% | 6/10 | Risk Registry R1-R9 양호. n8n OOM(R6), PixiJS 번들(R1), prompt injection(R7) 적절히 식별. **미식별 리스크 4건**: (1) **Sprint 2 과부하**: PRD carry-forward(L1496)에서 "Sprint 2/2.5 분할 결정" 필요 언급했으나 Sprint Dependencies에 미반영. n8n + 마케팅 7 FRs + TOOLSANITIZE 3 FRs + Layer 0 병행 = 16+ FRs 단일 Sprint. (2) **Voyage AI 마이그레이션 지연 리스크**: Pre-Sprint 2-3일 추정(PRD L169)이지만 HNSW 3개 재구축 시간 불확실. 지연 시 전 Sprint 블로커. (3) **3-table vs 2-table 모순→스코프 리스크**: 어느 모델이냐에 따라 Sprint 3 마이그레이션 규모가 완전히 다름. 미확정 시 재작업 확정. (4) **Layer 0 UXUI 60% 게이팅 달성 기준 불명**: ~67페이지의 60% = 40페이지. Sprint별 배분/추적 방법 미정의. |

---

## 가중 평균: 6.00/10 ❌ FAIL

계산: (8×0.15) + (6×0.20) + (5×0.15) + (7×0.15) + (4×0.15) + (6×0.20) = 1.20 + 1.20 + 0.75 + 1.05 + 0.60 + 1.20 = **6.00**

---

## 이슈 목록 (우선순위순)

### CRITICAL — 재작성 필수

#### 1. [D5] 메모리 모델 내부 모순 (2-table vs 3-table)

- **L86** (Step 2 상단 FR-MEM): "Option B, `agent_memories` 확장 (memoryType='reflection' + embedding VECTOR(1024))"
- **L1339-1343** (v3 섹션 FIX-3 해소): "3-테이블 모델 확정. agent_memories 미변경, observations + reflections 독립 테이블"

이 두 모델은 스키마, 마이그레이션, 쿼리 패턴이 **완전히 다름**. 구현자가 어느 모델을 따라야 하는지 판단 불가. Sprint 3 전체 스코프에 영향.

**권고**: 하나로 통일하고 나머지 제거. FIX-3 해소 결정이 PRD Option B를 override했다면, L86도 3-table로 수정 + 상단 cross-cutting #8(L86)도 갱신.

#### 2. [D5] n8n 보안 레이어 수 불일치 (6-layer vs 8-layer)

- 확정 결정 #3: **8-layer** (6→8, N8N_ENCRYPTION_KEY AES-256-GCM + NODE_OPTIONS V8 heap cap 추가)
- Step 2 상단(L83, L223): **8-layer** ✅
- v3 섹션(L1332, L1350, L1368, L1424): **6-layer** ❌

4곳이 구 버전(6) 그대로. 확정 결정 #3 반영 누락.

**권고**: L1332, L1350, L1368, L1424 전부 "8-layer"로 수정. 누락된 2개 레이어(AES-256-GCM, V8 heap cap) 명시 추가.

#### 3. [D3] Gemini 참조 잔존 — 확정 결정 #1 위반

| 라인 | 내용 | 수정 |
|------|------|------|
| L375 | `@google/genai` Phase 4 의존성 | Voyage AI `voyageai` SDK로 교체 |
| L1335 | "Gemini Embedding 768차원 벡터화" | "Voyage AI voyage-3 1024d 벡터화" |
| L1396 | "pgvector 768차원 × 90,000 ≈ 270MB" | "pgvector 1024차원 × 90,000 ≈ 360MB" (1024d면 용량 증가) |

`feedback_no_gemini.md` 절대 규칙 위반. Gemini 단어가 "금지" 맥락 외에 사용 불가.

#### 4. [D5] Go/No-Go 게이트 수 불일치 (9 vs 14)

- FR 테이블(L88): "v2 8개 → v3 14개: +#9 obs poisoning, +#10 Voyage migration, +#11 cost ceiling, +#12 v1 parity, +#13 usability, +#14 capability eval"
- 확정 결정 #11: "8 → 11 gates"
- Go/No-Go 매트릭스(L1418): "9개 — 원본 8개 + #9 Capability Evaluation"

**3가지 다른 숫자** (9, 11, 14). 매트릭스에 게이트 #10~#14 정의 누락.

**권고**: 14개 매트릭스로 통일. 각 게이트의 Sprint, 기준, 실패 시 대응 전부 명시.

### HIGH — 수정 필요

#### 5. [D2] Pre-Sprint 의존성 트리에서 Voyage AI 마이그레이션 누락

Sprint Dependencies(L1401-1404)에 3개만 나열:
1. Stitch 2 디자인 토큰
2. Neon Pro 업그레이드
3. 사이드바 IA 선행 결정

**Voyage AI 768d→1024d 마이그레이션**이 빠짐. 이건 확정 결정 #1이자 전 Sprint 블로커. Infrastructure 섹션(L152)과 cross-cutting(L221)에는 "Pre-Sprint 블로커"로 명시되어 있으나 정작 의존성 트리에서 누락.

**권고**: 4번째 항목으로 추가. HNSW 재구축 포함 예상 소요 시간도 명시.

#### 6. [D3] Observation TTL 불일치 (30일 vs 90일)

- 확정 결정 #5: "30일 (processed observations)"
- Step 2 상단(L101): "observations 30일 TTL" ✅
- v3 섹션(L1353): "observations 90일 보관→아카이브" ❌
- v3 섹션(L1396): "observations 90일 보관" ❌

**권고**: L1353, L1396을 30일로 수정. 디스크 계산도 갱신 (90,000→30,000행 기준).

#### 7. [D3] n8n Docker RAM 수치 모순

- L1388: n8n peak "~4GB" — `--memory=2g` 캡이 있으면 4GB 도달 불가
- L1394: "n8n 4GB 상한 제한" — 확정 결정 #2는 2GB
- L1441 R6 완화: "4G/2CPU 제한" — 2G/2CPU가 맞음

**권고**: n8n RAM을 전부 ≤2GB로 통일. peak도 ~2GB(OOM kill 전 상한).

#### 8. [D5] Cross-Cutting Concerns 이중 정의

Step 2 상단(L212-227)과 v3 섹션(L1446-1475)이 v3 Cross-Cutting을 **각각 다른 번호·내용·개수**로 나열:

| 상단 (L212-227) | v3 섹션 (L1456-1475) |
|-----------------|---------------------|
| #7 soul-enricher | #7 FR-TOOLSANITIZE |
| #8 3개 Sanitization | #8 Cost-aware routing |
| #9 Voyage AI 전파 | #9 call_agent 표준화 |
| #10 n8n 보안 격리 | #10 Memory confidence |
| #11 실시간 상태 파이프라인 | #11 Go/No-Go #9 eval |
| #12 비용 인지 라우팅 | (없음) |

**권고**: 하나의 정의로 통합. 상단에 간략 참조, 하단에 상세. 또는 역방향. 이중 정의 제거.

### MEDIUM — 권고

#### 9. [D6] Sprint 2 과부하 리스크 미반영

Sprint 2 스코프: n8n 6 FRs + 마케팅 7 FRs + TOOLSANITIZE 3 FRs + Layer 0 병행 = **16+ FRs**. PRD Carry-Forward(L1496)에서 "Sprint 2/2.5 분할 결정" 필요성을 인정했으나 Sprint Dependencies(L1398-1416)와 Risk Registry(R1-R9)에 미반영.

**권고**: Sprint 2/2.5 분할 전략을 Sprint Dependencies에 명시. 또는 R10으로 리스크 등록.

#### 10. [D2] 확정 결정 #7 observation 스키마 리네임 미반영

확정 결정 #7: `is_processed` → `reflected`, `processed_at` → `reflected_at`. 문서 어디에도 이 필드 리네임이 명시되지 않음.

**권고**: observations 테이블 설명에 컬럼명 리네임 명시.

#### 11. [D5] FR 개수 불일치

| Area | Step 2 상단 | v3 섹션 |
|------|------------|--------|
| FR-PERS | 9개(L85) | 8개(L1334) |
| FR-MEM | 14개(L86) | 11개(L1335) |
| NFR 총계 | 76개(L90) | 74개(L1345) |

**권고**: PRD 원본 대조 후 정확한 수로 통일.

---

## Scrum Master 관점 — 배달 리스크 진단

### Sprint 계획 위험도: 🔴 HIGH

1. **Sprint 기간/벨로시티 부재**: 4개 Sprint + Pre-Sprint의 기간이 어디에도 없음. Solo dev + AI 체제에서 각 Sprint이 몇 주인지, 전체 v3 타임라인이 얼마인지 추정 불가.

2. **스코프 불확실성**: 메모리 모델(2-table vs 3-table), FR 개수(FR-MEM 11 vs 14), n8n 보안 레이어(6 vs 8), Go/No-Go 게이트(9 vs 14) — 핵심 스코프 정의가 문서 내에서 충돌. 이 상태로 Sprint Planning에 들어가면 중간에 재작업 확정.

3. **Pre-Sprint 블로커 불완전**: Voyage AI 마이그레이션이 의존성 트리에서 누락. HNSW 3개 인덱스 재구축 소요 시간 미추정. 2-3일 추정이 초과하면 전체 Sprint 1 착수 지연.

4. **Sprint 2 과부하**: 16+ FRs를 단일 Sprint에 넣으면 Layer 0 병행 시 완료 불가능할 가능성. 분할 전략 미확정.

### 권고 행동

1. **즉시**: 내부 모순 8건 전부 해소 (단일 진실 원천 확보)
2. **Step 2 완료 전**: 확정 결정 #1~#12 대조 체크리스트 첨부
3. **Step 3 시작 전**: Sprint 기간 + 벨로시티 프레임워크 추가

---

## Cross-talk 메모

- Winston(Critic-A)이 정확성(D3) 관점에서 동일 Gemini/n8n 오류를 발견했을 가능성 높음 — 교차 확인 필요.
- 메모리 모델 2-table vs 3-table 결정은 **아키텍처 결정(Winston 영역)**이지만, Sprint 3 스코프에 직접 영향하므로 **Scrum Master 관점에서도 블로커**로 판정.
