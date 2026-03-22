# Critic-UX (Sally) Review — Stage 2 Step 8: Innovation & Novel Patterns

> Reviewer: Sally (UX Designer)
> Weights: D1=15%, D2=20%, D3=15%, D4=15%, D5=20%, D6=15%
> Section: PRD `prd.md` lines 1538–1775 (## Innovation & Novel Patterns)
> Cross-refs: Success Criteria L586-607 (14 Go/No-Go), Domain Req MEM-6 (Obs Poisoning), PIX-1 (≤200KB), Product Scope L957-960 (Planning=read-time), confirmed-decisions-stage1.md
> NOTE: 용어 치환 이슈는 Pre-sweep 완료. 구조/로직/정합성만 평가.

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 8개 혁신 각각: 비교 테이블 + 구현 패턴 + 핵심 리스크 + 검증 방법 + Go/No-Go 참조. 사용자 체감 vs 기술 혁신 7+8 항목 구분 우수. 시장 타이밍 근거 수치 제시 (6개월 선점). **약점:** 검증 테이블이 Go/No-Go #1-#8만 커버, #9-#14 부재. |
| D2 완전성 | 7/10 | 4 v2 + 4 v3 혁신 전부 커버. User/Tech 관점 분리, 시장 타이밍, 검증 접근법, 리스크 완화 — 구조 우수. **그러나:** **(1)** 검증 테이블에 Go/No-Go #9-#14 전무 (Obs Poisoning, Voyage AI, Tool Sanitization, v1 Feature Parity, Usability, Capability Evaluation). **(2)** Innovation 7 (Memory) 리스크에 Observation Poisoning (Go/No-Go #9, MEM-6) 부재. 비용 리스크만 있고 보안 리스크 없음. |
| D3 정확성 | 8/10 | 2G/2CPU proactive fix 적용 확인 (L1688, L1769). Option B 구현 패턴 정확 (L1662-1666). 경쟁사 비교 합리적 (AutoGen Mem0, CrewAI 4-type, LangGraph Checkpointer). **약점:** L1741 "< 200KB" — PIX-1 Step 7 Fix 11에서 "≤ 200KB"로 교정됐으나 Innovation 섹션 미반영. L1649 "계획에 활용" — Planning이 read-time semantic search임을 명시 안 함. |
| D4 실행가능성 | 8/10 | 구현 패턴이 파일 수준 (soul-enricher.ts, memory-reflection.ts, agent-loop.ts) 제시. Sprint 배정 정확 (Big Five=S1, n8n=S2, Memory=S3, OpenClaw=S4). Risk/fallback 쌍 명확. **약점:** #9-#14 검증 부재로 Sprint 3-4 보안/품질 게이트 실행 지침 불완전. |
| D5 일관성 | 7/10 | v2↔v3 혁신 계층 매핑 우수 (L1552-1558). Brief 3대 문제 → 4 혁신 매핑 정확. **약점:** **(1)** 검증 테이블 8/14 gate — Success Criteria (14 gate) 불일치. **(2)** "< 200KB" vs PIX-1 "≤ 200KB". **(3)** "3단계 (관찰→반성→계획)" 개념 모델은 정당하나, Step 6에서 교정한 "Planning = read-time search" 구현과 연결 문구 부재. |
| D6 리스크 | 7/10 | v2 리스크 5건 + v3 리스크 7건 — 각각 폴백 전략 명시. Sprint + Go/No-Go 참조 양호. **약점:** Innovation 7 리스크에 Observation Poisoning (Go/No-Go #9) 부재. 검증 테이블에 #9 (Obs Poisoning E2E), #11 (Tool Sanitization) 보안 검증 부재. |

---

## 이슈 목록

### MAJOR (1)

**1. [D2/D5/D6] 검증 테이블 Go/No-Go #9-#14 부재**
- v3 검증 테이블 (L1736-1741): #2, #3, #4, #5 — 4개 혁신 고유 gate
- v3 품질 게이트 (L1745-1750): #1, #6, #7, #8 — 4개 공통 gate
- **총 8/14 gate만 커버.** 누락 6개:
  - #9 Observation Poisoning 4-layer E2E (Sprint 3) — Innovation 7 보안 검증
  - #10 Voyage AI 마이그레이션 (Pre-Sprint) — 전제 조건
  - #11 Tool Sanitization (Sprint 2-3) — Innovation 8 보안 검증
  - #12 v1 Feature Parity (전체) — 전체 혁신 회귀
  - #13 Usability (전체) — UX 관점 핵심
  - #14 Capability Evaluation (전체) — Innovation 7 성과 측정
- Success Criteria (Step 5)에서 14 gate로 확장한 것이 이 섹션에 전파되지 않음
- **수정**: v3 검증/품질 게이트 테이블에 #9-#14 6행 추가

### MINOR (5)

**2. [D3/D5] L1741 "< 200KB" → "≤ 200KB" (PIX-1 정합)**
- PIX-1 (Step 7 Fix 11): "≤ 200KB gzipped"
- L1741 (Innovation): "번들 < 200KB gzipped"
- L1623 (Innovation): "번들 < 200KB gzipped"
- L1768 (Risk): "200KB 초과" (리스크 설명이므로 OK)
- **수정**: L1741, L1623 "< 200KB" → "≤ 200KB"

**3. [D3/D5] "계획(Planning)" 개념 모델 — 구현 정합성 주석 필요**
- L1547, L1558, L1647, L1649: "3단계 (관찰→반성→계획)"
- 개념적 모델명 자체는 정당 (Park et al., a16z AI Town 참조 L962)
- 그러나 Step 6 Fix 2에서 "Planning = read-time semantic search (soul-enricher.ts, 저장 엔티티 아님)"으로 명확히 교정
- Innovation 섹션에서 개념 ↔ 구현 연결 문구 없음 → 개발자가 Planning 테이블을 만들려 할 위험 (Step 6 동일 이슈 재발 가능)
- **수정**: L1662 구현 패턴 말미에 "**3단계 중 '계획'은 개념적 명칭** — 구현은 soul-enricher.ts가 Soul 주입 직전 agent_memories(reflection)에서 cosine ≥ 0.75 상위 3건을 검색하여 `{relevant_memories}` 변수로 주입. 별도 Planning 테이블/저장 없음" 추가

**4. [D6] Innovation 7 리스크 — Observation Poisoning 부재**
- L1772: "Reflection 크론 LLM 비용 폭주" — Memory 비용 리스크 ✅
- L1774: "agent_memories 데이터 단절" — Zero Regression 리스크 ✅
- **누락:** Observation content 악의적 주입 → Reflection 오염 → 에이전트 행동 변질. Go/No-Go #9, MEM-6, confirmed decision #8
- PER-1 personality injection (R7, L1770)은 있으나 observation poisoning은 별개 체인
- **수정**: v3 리스크 테이블에 "Observation 콘텐츠 poisoning (R10) | 4-layer 방어 (MEM-6): 10KB + 제어문자 + 하드닝 + 분류. 우회 시 admin-only 수동 전환 | Sprint 3 | #9" 추가

**5. [D2] Innovation 7 검증 — Capability Evaluation (Go/No-Go #14) 미연결**
- L1658: "성장 측정 | ✅ 재수정 횟수 감소 추적" — 비교 테이블에서 CORTHEX만 가능하다고 강조
- L1740: "3회 반복 → 품질 향상 측정 | 3회차가 1회차보다 재수정 ≤ 50%" — 검증 테이블에 있으나 Go/No-Go #14 참조 없음
- Go/No-Go #14 (Success Criteria L607): "동일 태스크 N≥3회 반복 시 3회차 재수정 ≤ 1회차의 50% (task corpus 3개)"
- L1740의 성공 기준과 #14가 사실상 동일인데 연결 안 됨
- **수정**: L1740 Go/No-Go 열에 "#4 + **#14**" 추가

**6. [D3] L1768 R1 오귀속 (Cross-talk: Winston M2)**
- L1768: "PixiJS 8 번들 200KB 초과 (R1)" — Risk Registry L404: R1 = "PixiJS 8 학습 곡선 (팀 경험 없음)"
- 번들 200KB ≠ 학습 곡선. Risk ID 불일치
- **수정**: L1768 "(R1)" 참조 제거 (Go/No-Go #5에서 CI로 이미 관리) 또는 별도 risk ID 신설

---

### 긍정적 관찰

- **사용자 체감 혁신 (L1696-1703)**: CEO 관점 7개 항목이 User Journeys J1-J10과 자연스럽게 대응. "사무실이 살아있다"(J9), "에이전트가 성장했다"(J10), "개발자 없이 자동화"(J8) 등.
- **v2↔v3 혁신 계층 테이블 (L1552-1558)**: 기반(유지) vs 확장(신규) 분리가 명확하고, v3가 v2 혁신 위에 어떻게 쌓이는지 시각적으로 보여줌.
- **경쟁사 비교 (4개 테이블)**: AutoGen Mem0 통합, CrewAI 4-type memory, LangGraph Checkpointer 등 2026-03 기준 구체적 비교. "뒤집는 가정" 패턴으로 차별점 프레임 우수.
- **2G proactive fix 확인**: L1688, L1769 모두 "2G/2CPU" — N8N-SEC-5 Brief 정합 ✅

---

## 가중 평균: 7.45/10 ✅ PASS

계산: (8×0.15) + (7×0.20) + (8×0.15) + (8×0.15) + (7×0.20) + (7×0.15) = 1.20 + 1.40 + 1.20 + 1.20 + 1.40 + 1.05 = **7.45**

---

## Cross-talk 완료

### 스코어 비교

| Critic | Score | Status |
|--------|-------|--------|
| Winston (Architecture) | 8.60 | ✅ PASS |
| Sally (UX) | 7.45 | ✅ PASS |
| Quinn (QA/Security) | 7.10 | ✅ PASS (borderline) |
| Bob (Scrum) | 6.95 | ❌ FAIL |

### Cross-talk 채택

**#6 (from Winston M2). [D3] L1768 R1 오귀속 (minor)**
- L1768: "PixiJS 8 번들 200KB 초과 (R1)" — 그러나 Risk Registry L404: R1 = "PixiJS 8 학습 곡선 (팀 경험 없음)"
- 번들 사이즈 리스크 ≠ 학습 곡선 리스크. Risk ID 불일치
- **수정**: L1768 "(R1)" 참조 제거 또는 별도 risk ID 신설. UX 권고: 제거 (Go/No-Go #5에서 CI 레벨로 이미 관리)

### Cross-talk 관찰 (스코어 비변동)

**Obs-1 (from Winston Q1). CEO 통합 여정 부재**
- 사용자 체감 혁신 7항목(L1696-1703)이 개별 나열만. "OpenClaw에서 에이전트 보고 → n8n으로 자동화 구축"이라는 cross-innovation 여정 없음
- L1719 "시장 타이밍" 단락이 부분적 커버("성격+메모리+시각적 존재감 = 팀원")하나 체감 테이블과 분리
- Innovation 섹션 역할(개별 차별점+검증)에서 벗어나지 않으므로 스코어 변동 없음. User Journeys (J8-J10) 범위

**Obs-2 (from Winston Q2). Big Five 슬라이더 UX 리스크 부재**
- Innovation 6 리스크(L1643)는 보안(R7)만 다루고 UX 리스크(5축 동시 조작 인지 부하) 부재
- 완화: PER-2 프리셋(L1638), Step 5 UX failure trigger "슬라이더 시간 초과"
- PRD Innovation 범위 밖 (Domain Requirements PER-2에서 커버). 관찰급

**Obs-3 (from Quinn). memoryTypeEnum 'observation' 모순**
- L1663: "memoryType enum에 'observation' 추가" — 그러나 Option B에서 observations는 별도 테이블. agent_memories에 observation memoryType 필요 없음
- Domain Requirements MEM-1 Option B 범위에서 명확화 필요. Innovation 섹션 자체보다 Step 7 정합 이슈

### Cross-talk 확인 (기존 이슈 강화)

- **Quinn**: MAJOR #1 (#9-#14 부재) 완전 합의. #11 Tool Sanitization n8n→에이전트 공격 체인 구체화 유용
- **Quinn**: issue #5 (#14 reference) 동일 발견
- **Bob**: issue #3 (Planning read-time) 동일 발견. "Planning 관리 UI 만들 위험" UX 핵심 정확히 일치
- **Bob**: Big Five a11y (PER-5 `aria-valuetext`) — Step 7 잔류와 연결. 구현 결정 범위
- **Winston**: issue #2 ("≤ 200KB") 동일 발견. 정본 = PIX-1 "≤ 200KB" (CI 로직 `> 204800` 기준)

### "≤ 200KB" 정본 분석 (Winston Q3 답변)

| 위치 | 현재 | 정본 | 수정 필요 |
|------|------|------|-----------|
| PIX-1 (Step 7) | ≤ 200KB | ✅ | — |
| Go/No-Go #5 (L460) | < 200KB | ≤ 200KB | Step 5 범위 |
| Innovation L1741 | < 200KB | ≤ 200KB | Step 8 issue #2 |
| Innovation L1623 | < 200KB | ≤ 200KB | Step 8 issue #2 |
| Risk L1768 | "200KB 초과" | OK | — (초과 = >) |

---

## R2 Post-fix Verification

> 8 fixes applied by John (`stage-2-step-08-fixes.md`)
> PRD lines re-read: L1618-1632, L1655-1674, L1730-1789

### Fix Verification (8/8)

| # | Fix | Verified | Evidence |
|---|-----|----------|----------|
| 1 | Innovation 7 Go/No-Go #4+#9+#14 | ✅ | L1740: `#4: agent_memories 단절 0건 + #9: 4-layer E2E + #14: Capability Evaluation` |
| 2 | memoryTypeEnum 'observation' 제거 | ✅ | L1663: `memoryTypeEnum에 'reflection' 추가` — observation 제거, Option B 정합 |
| 3 | Quality Gates #9-#14 6행 추가 | ✅ | L1751-1756: #9 Obs Poisoning, #10 Voyage AI, #11 Tool Sanitization, #12 v1 패리티, #13 사용성, #14 Capability — 14/14 완전 커버 |
| 4 | Planning = read-time search 명시 | ✅ | L1665: `soul-enricher.ts가 다음 태스크 시 cosine ≥ 0.75 top-3 검색 → Soul 주입 (read-time, 저장 없음 = "계획" 단계)` |
| 5 | "< 200KB" → "≤ 200KB" | ✅ | L1623: `≤ 200KB gzipped`, L1741: `번들 ≤ 200KB gzipped` |
| 6 | L1774 "(R1)" 오귀속 제거 | ✅ | L1774: `PixiJS 8 번들 200KB 초과` — R1 참조 없음 |
| 7 | Risk table R10 + R14 추가 | ✅ | L1781: R10 Obs Poisoning 공격 체인 + MEM-6 + #9. L1782: R14 Solo dev + Sprint 4 격리 + #5 |
| 8 | Adversarial payload 기준 추가 | ✅ | L1740: `10종 adversarial payload 차단` + `adversarial 100% 차단` |

### R2 차원별 점수

| 차원 | R1 | R2 | 변화 근거 |
|------|-----|-----|----------|
| D1 구체성 | 8 | 9 | 14/14 gates 완전 커버. Planning read-time impl 패턴 완성. Adversarial 기준 추가로 검증 구체성 향상 |
| D2 완전성 | 7 | 9 | #9-#14 6행 추가로 Quality Gates 완전. R10+R14 리스크 추가. memoryTypeEnum Option B 정합 |
| D3 정확성 | 8 | 9 | "(R1)" 오귀속 해결. "≤ 200KB" PIX-1 정합. memoryTypeEnum 'observation' 제거 → Option B 아키텍처 정확 |
| D4 실행가능성 | 8 | 9 | 14 gates + Sprint 배정으로 완전한 실행 로드맵. Planning read-time 명시로 "Planning UI" 위험 제거 |
| D5 일관성 | 7 | 9 | 14/14 gates — Success Criteria 완전 정합. "≤ 200KB" — PIX-1 정합. Planning — Step 6 fix 정합. memoryTypeEnum — MEM-1 Option B 정합 |
| D6 리스크 | 7 | 9 | R10 Obs Poisoning 공격 체인 명시 (보안 리스크 완전). R14 Solo dev 격리 전략. 9 risk rows로 v3 혁신 전체 커버 |

### R2 가중 평균: 9.00/10 ✅ PASS

계산: (9×0.15) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.20) + (9×0.15) = 1.35 + 1.80 + 1.35 + 1.35 + 1.80 + 1.35 = **9.00**

### Residuals (non-blocking, deferred)

| Item | Source | Notes |
|------|--------|-------|
| Go/No-Go #5 L460 "< 200KB" → "≤ 200KB" | Winston Q3, Sally | Step 5 범위 — Innovation 섹션 자체는 수정됨. Step 5 재검증 시 포함 |
| CEO 통합 여정 서사 | Winston Q1 | Obs-1: 개별 혁신 나열만, cross-innovation 통합 서사 부재. L1719 시장 타이밍에서 부분 커버. User Journeys 범위 |
| Big Five 슬라이더 UX 리스크 | Winston Q2 | Obs-2: Innovation 6 리스크에 UX 부하 미포함. PER-2 프리셋 + Step 5 failure trigger로 커버 |
