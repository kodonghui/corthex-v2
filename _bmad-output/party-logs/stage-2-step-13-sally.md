# Critic-UX (Sally) Review — Stage 2 Step 13: Polish (전체 PRD 교차 일관성)

> Reviewer: Sally (UX Designer)
> Weights: D1=15%, D2=20%, D3=15%, D4=15%, D5=20%, D6=15%
> Section: 전체 PRD `prd.md` L1–2648 (교차 일관성 + 잔여 이슈 해소)
> Cross-refs: Steps 2-12 전체 carry-forward, 확정 결정 12건, Go/No-Go 14 gates, FR-MEM12~14, FR-PERS9, NFR-S10, NFR-A5, NFR-O11, PER-5
> NOTE: 용어 치환 이슈는 Pre-sweep 완료. 구조/로직/정합성만 평가.

---

## Proactive Fix 검증 (11/11)

### "≤ 200KB" 글로벌 수정 (8건)

| # | Line | 검증 | 결과 |
|---|------|------|------|
| 1 | L178 | "≤ 200KB gzipped (Brief §4, Go/No-Go #5, Stage 1 Step 2/4/5/6 일관)" | ✅ |
| 2 | L447 | "≤ 200KB gzipped" | ✅ |
| 3 | L460 | "≤ 200KB (204,800 bytes)" + CI gate `-gt 204800` | ✅ |
| 4 | L526 | "≤ 200KB gzipped (Go/No-Go #5)" | ✅ |
| 5 | L598 | "≤ 200KB gzipped (204,800 bytes) CI 게이트" | ✅ |
| 6 | L621 | "≤ 200KB gzipped" | ✅ |
| 7 | L643 | "≤ 200KB (Go/No-Go #5)" | ✅ |
| 8 | L1245 | "≤ 200KB gzipped" | ✅ |

`grep "< 200KB" prd.md` = **0건** ✅ (Step 5부터 carry-forward된 이슈 최종 해소)

### 기타 수정 (3건)

| # | Line | Before | After | 검증 |
|---|------|--------|-------|------|
| 9 | L1713 | "200KB 미만" | "200KB 이하" | ✅ 서술적 표현 정합 |
| 10 | L2082 | BullMQ 참조 | "크론 오프셋(기본) 또는 pg-boss(조건부)" | ✅ `grep BullMQ` = 0건 |
| 11 | L1472 | PER-5 aria 불완전 | `aria-valuenow`, `aria-valuetext`, `aria-label`, `aria-valuemin`, `aria-valuemax` + keyboard + FR-PERS9·NFR-A5 정합 | ✅ 3-level 정합 완성 |

**11/11 proactive fixes verified ✅**

---

## 전파 패턴 잔여 스캔 (10/10 clean)

| 패턴 | grep 결과 | 상태 |
|------|----------|------|
| `< 200KB` | 0건 | ✅ |
| `200KB 미만` | 0건 | ✅ |
| `BullMQ` | 0건 | ✅ |
| n8n `4G` (잘못된 컨텍스트) | 0건 — 모든 4GB 참조는 "4G=OOM 확정" 또는 PostgreSQL 할당 | ✅ |
| `6-layer` / `SEC-1~6` (n8n) | 0건 | ✅ |
| `15건+` (Sprint 2) | 0건 | ✅ |
| `연결 상한 20` | 0건 | ✅ |
| `reflections 테이블` (잔여) | 0건 — 모든 참조가 "별도 아님/없음" Option B 정합 | ✅ |
| `memoryType.*observation` | 0건 — observation은 별도 테이블, enum 아님 | ✅ |
| `Voyage AI Phase "4"` (NFR-COST2) | 0건 — "Pre-Sprint~Sprint 4" 수정 완료 | ✅ |

---

## 확정 결정 12건 교차 정합 검증

| # | Decision | 전 섹션 정합 | UX 관점 검증 |
|---|----------|------------|-------------|
| 1 | Voyage AI 1024d | ✅ Brief~NFR | 사용자 영향 없음 (백엔드) |
| 2 | n8n Docker 2G | ✅ Brief~NFR-SC9 | OOM 시 "워크플로우 서비스 일시 중단" 메시지 (FR-N8N5) |
| 3 | n8n 8-layer | ✅ Domain~NFR-S9 | Admin proxy 경유 접근 보안 (FR-N8N4/N8N6) |
| 5 | 30일 TTL | ✅ Domain~NFR-D8 | Admin 보존 기간 설정 가능 (FR-MEM13) |
| 8 | Obs Poisoning | ✅ Domain~NFR-S10 | flagged obs Admin 플래그 + 감사 로그 (FR-MEM12) |
| 9 | Advisory lock | ✅ Domain~NFR-O10 | 사용자 영향 없음 (백엔드 안정성) |
| 10 | WS 50/500 | ✅ NRT-5~NFR-SC8 | oldest 연결 해제 + 재연결 안내 (FR-OC2) |
| 11 | Go/No-Go 14 gates | ✅ L585-610 | #13 사용성 검증 NFR-O7/O8/O11로 완비 |
| 12 | host.docker.internal | ✅ L1893 | 사용자 영향 없음 (인프라) |

---

## 교차 섹션 정합 체인 검증 (UX 핵심)

### 1. 성격 슬라이더 a11y 체인
| Level | Source | ARIA 속성 | 상태 |
|-------|--------|-----------|------|
| Go/No-Go | L601 | aria-valuenow + 키보드 ←→ | ✅ (요약) |
| Domain | PER-5 L1472 | valuenow + valuetext + label + valuemin + valuemax + keyboard | ✅ (상세) |
| FR | FR-PERS9 L2466 | valuenow + valuetext + keyboard | ✅ |
| NFR | NFR-A5 L2570 | valuenow + valuetext + label + Arrow keys | ✅ |

3-level chain 완전 정합. Go/No-Go는 요약 수준으로 적절.

### 2. MEM-6 Observation Sanitization 체인
| Level | Source | 내용 | 상태 |
|-------|--------|------|------|
| 확정 결정 | #8 | 4-layer sanitization | ✅ |
| Go/No-Go | #9 L602 | 10종 payload 100% 차단 | ✅ |
| Domain | MEM-6 (Step 7) | 4-layer 방어 + 공격 체인 | ✅ |
| Compliance | Step 9 L2010-2019 | MEM-6 4-layer 테이블 | ✅ |
| Risk | R10 | High — observation poisoning | ✅ |
| FR | FR-MEM12 L2481 | 4-layer 기능 요구 | ✅ |
| NFR | NFR-S10 L2538 | 100% 통과 품질 기준 | ✅ |

7-level chain 완전 정합. Step 11에서 FR, Step 12에서 NFR 추가로 완성.

### 3. CEO 일상 UX 체인
| Level | Source | 내용 | 상태 |
|-------|--------|------|------|
| Go/No-Go | #13 L606 | CEO 일상 태스크 5분 | ✅ |
| Sprint 완료 기준 | L527 | CEO 태스크 5분 | ✅ |
| NFR | NFR-O11 L2609 | /office→Chat→결과 확인 ≤ 5분 | ✅ |

3-level chain 정합.

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | 11건 proactive fix 모두 정확한 라인·값 명시. 10개 전파 패턴 grep 검증. 12건 확정 결정 라인별 교차 참조. |
| D2 완전성 | 9/10 | Steps 2-12 모든 carry-forward 해소. "≤ 200KB" 8건 글로벌 수정. BullMQ 제거. PER-5 aria 확장. 10개 전파 패턴 0 잔여. |
| D3 정확성 | 9/10 | "≤ 200KB"가 CI gate `-gt 204800` 로직과 정합. PER-5 aria 속성이 FR-PERS9·NFR-A5와 3-level 정합. BullMQ → "크론 오프셋/pg-boss"가 기존 결정 보존. |
| D4 실행가능성 | 9/10 | PRD 전체가 자기 일관적 — 모순 없는 구현 경로. Sprint→FR→NFR→Go/No-Go 체인이 명확. |
| D5 일관성 | 9/10 | 핵심 체인 3개 (a11y, MEM-6, CEO UX) 모두 multi-level 정합. 12건 확정 결정 전 섹션 정합. 10개 전파 패턴 완전 해소. |
| D6 리스크 | 9/10 | 모든 carry-forward 해소로 구현 시 "어느 섹션을 봐야 하나" 혼동 리스크 제거. MEM-6 7-level chain = 구현 누락 불가. |

---

## 이슈 목록

### MAJOR (0)

없음.

### MINOR (0)

없음.

### LOW (2 — 점수 미반영)

**L1. Go/No-Go L601 a11y gate에 aria-valuetext 미언급**
- L601: "aria-valuenow + 키보드 조작 (←→ 키)" — aria-valuetext, aria-label 미언급
- PER-5 (L1472), FR-PERS9 (L2466), NFR-A5 (L2570)에서 상세 명시
- Go/No-Go = 요약 수준 검증 포인트이므로 현재 수준 수용
- 구현 시 FR-PERS9 + NFR-A5가 기준 — Go/No-Go는 gate check only

**L2. NFR-SC5 SDK "0.2.72 ~ 0.2.x" wildcard**
- Quinn Step 9 LOW carry-forward
- package.json에서 exact version 확정 시 해소 (구현 단계)

---

## 가중 평균: 9.00/10 ✅ PASS

계산: (9×0.15) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.20) + (9×0.15) = 1.35 + 1.80 + 1.35 + 1.35 + 1.80 + 1.35 = **9.00**

**PASS 사유**: 11건 proactive fix로 Steps 2-12 모든 carry-forward 해소. 10개 전파 패턴 0 잔여. 12건 확정 결정 전 섹션 정합. 교차 섹션 체인 (a11y, MEM-6, CEO UX) 완전 정합. MINOR 이슈 0건 — Polish 단계로서 최종 품질 충분.
