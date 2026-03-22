# Critic-A Review — Stage 2 Step 8: Innovation & Novel Patterns (PRD L1538-1783)

**Reviewer**: Winston (Architecture + API)
**Date**: 2026-03-22
**Artifact**: `_bmad-output/planning-artifacts/prd.md` lines 1538–1783
**Grade Request**: B (reverify)
**Revision**: v1 8.60 → v1b 9.00 → **R2 9.00 PASS FINAL**

---

## Review Score: 9.00/10 ✅ PASS (R2 FINAL)

### 점수 변경 사유

v1 (8.60)은 세션 컴팩션으로 캐시된 **이전 텍스트** 기준 리뷰. Cross-talk 후 재검증 시 현재 PRD 텍스트에서 **4건 전부 해소 확인**. john의 선제 수정이 4G→2G 외에도 L1623, L1663, L1665, L1740, L1741, L1774, L1781, L1782에 적용됨.

### 차원별 점수

| 차원 | 점수 | 가중치 | v1→v1b | 근거 |
|------|------|--------|--------|------|
| D1 구체성 | 9/10 | 15% | 9→9 | 8개 혁신 전부 비교 테이블 + "뒤집는 가정" + 구현 패턴 + 리스크 + 검증 방법. v3 검증 테이블 Sprint/성공기준/Go/No-Go 매핑 완비 |
| D2 완전성 | 9/10 | 15% | 9→9 | v2 4개 + v3 4개 = 8개 혁신 전체 커버. Gate 10/14 커버 (나머지 4개는 인프라/회귀/UX — Innovation 범위 밖 합리적). R10+R14 리스크 테이블 추가 완료 |
| D3 정확성 | 9/10 | **25%** | 8→9 | v1 M1(#4/#14 혼재) ✅ 해소: L1740 이제 "#4 + #9 + #14". v1 M2(R1 오귀속) ✅ 해소: L1774 "(R1)" 제거. enum 'observation' 제거 → Option B 정합. n8n 2G 정합 ✅ |
| D4 실행가능성 | 9/10 | **20%** | 9→9 | L1665 3단계 흐름 완전: obs→reflection→soul-enricher.ts cosine ≥ 0.75 top-3 → Soul 주입 (read-time, 저장 없음). E8 경계 준수. n8n Docker 설정 즉시 복사 가능 |
| D5 일관성 | 9/10 | 15% | 8→9 | v1 L1("< 200KB") ✅ 해소: L1623, L1741 모두 "≤ 200KB". n8n 2G 전체 정합. Option B 일관. Planning = read-time 명시 ("저장 없음 = '계획' 단계") |
| D6 리스크 | 9/10 | 10% | 9→9 | v2 5개 + v3 **9개** 리스크 (R10 Obs Poisoning + R14 Solo dev 추가). 폴백 전략 전부 단계적. R11(Voyage)/R15(WS flood) 미포함 = 인프라 리스크, Innovation 범위 밖 |

**가중 평균**: (9×0.15)+(9×0.15)+(9×0.25)+(9×0.20)+(9×0.15)+(9×0.10) = 1.35+1.35+2.25+1.80+1.35+0.90 = **9.00**

---

## v1 이슈 → 현재 텍스트 상태

| v1 # | 이슈 | v1 상태 | 현재 상태 | 검증 |
|------|------|---------|----------|------|
| M1 | L1740 Go/No-Go #4/#14 혼재 | ⚠️ MINOR | ✅ FIXED | L1740: "#4: agent_memories 단절 0건 + #9: 4-layer E2E + #14: Capability Evaluation". 성공 기준에도 "adversarial 100% 차단" 추가 |
| M2 | L1774 R1 오귀속 | ⚠️ MINOR | ✅ FIXED | L1774: "(R1)" 제거. "PixiJS 8 번들 200KB 초과" — Risk ID 없이 Go/No-Go #5만 참조 |
| L1 | "< 200KB" → "≤ 200KB" 미전파 | ⚠️ LOW | ✅ FIXED | L1623: "≤ 200KB gzipped". L1741: "≤ 200KB gzipped". PIX-1 정합 |
| L2 | R10 혁신 리스크 테이블 미포함 | ⚠️ LOW | ✅ FIXED | L1781: "Observation 콘텐츠 포이즈닝 (R10) \| 4-layer (MEM-6): 10KB + 제어문자 strip + 프롬프트 하드닝 + 콘텐츠 분류. 공격 체인: malicious obs → reflection → Soul 주입 \| Sprint 3 \| #9" |

### 추가 선제 수정 확인

| 위치 | 변경 | 판정 |
|------|------|------|
| L1663 | `memoryTypeEnum`에 `'reflection'` **만** 추가 (이전: `'reflection'`, `'observation'`) + "별도 테이블" 명시 | ✅ Option B (MEM-1) 정합 |
| L1665 | 3단계 흐름에 `soul-enricher.ts cosine ≥ 0.75 top-3 → Soul 주입 (read-time, 저장 없음 = "계획" 단계)` 추가 | ✅ Product Scope L957-959 정합 |
| L1782 | R14 (Solo dev + PixiJS) 리스크 행 추가 | ✅ Risk Registry L418 정합 |

---

## Cross-talk 이슈 교차 검증

### Quinn (7.10 borderline PASS)

| Quinn # | 이슈 | 현재 상태 | 판정 |
|---------|------|----------|------|
| M1 | R10/#9 missing from risk + verification | ✅ FIXED (L1740 #9, L1781 R10) | 이전 텍스트 기준 유효, 현재 해소 |
| M2 | memoryTypeEnum 'observation' 모순 | ✅ FIXED (L1663 'reflection' only) | 이전 텍스트 기준 유효, 현재 해소 |
| m1 | < vs ≤ | ✅ FIXED | — |
| m2 | Planning = read-time 미명확 | ✅ FIXED (L1665 "저장 없음 = '계획' 단계") | — |
| m3 | R11 Voyage 리스크 테이블 미포함 | ⚠️ 잔류 | Pre-Sprint 인프라, Innovation 범위 밖 — LOW |
| m4 | R15 WS flood 리스크 테이블 미포함 | ⚠️ 잔류 | Sprint 4 인프라, Innovation 범위 밖 — LOW |

### Sally (7.45 PASS)

| Sally # | 이슈 | 현재 상태 | 판정 |
|---------|------|----------|------|
| Gate 8/14 커버리지 | #9-#14 누락 | 부분 해소 | L1740 #9+#14 추가 → 10/14. #10(Pre-Sprint), #12(회귀), #11(보안), #13(UX) 미포함 |

**Sally 판정**: #10(Pre-Sprint 인프라)과 #12(회귀 방지)는 Innovation 범위 밖 합리적. #11(Tool Sanitization)은 n8n 혁신 보안으로 포함 가능하나 N8N-SEC-3~8에서 커버. #13(Usability)은 cross-cutting UX — Innovation 검증보다 품질 게이트가 적합. 현재 10/14 커버리지 합리적.

### Bob (6.95 FAIL)

| Bob # | 이슈 | 현재 상태 | 판정 |
|-------|------|----------|------|
| #1 | Innovation 7 impl 2/3 stage만 | ✅ FIXED (L1665 full 3-stage) | 이전 텍스트 기준 유효, 현재 해소 |
| #2 | L1740 #4 only → #4+#9+#14 | ✅ FIXED | — |
| #3 | R10+R14 리스크 테이블 미포함 | ✅ FIXED (L1781, L1782) | — |

---

## 잔류 이슈 (4건 — 전부 LOW, 비차단)

| # | 이슈 | 근거 | 판정 |
|---|------|------|------|
| R1 | R11 (Voyage AI CRITICAL) 혁신 리스크 테이블 미포함 | Pre-Sprint 인프라 전제 조건. Innovation = Sprint 1-4 혁신 리스크 중심 | LOW — 범위 밖 |
| R2 | R15 (WebSocket flood) 혁신 리스크 테이블 미포함 | Sprint 4 인프라. NRT-5 Domain Req에서 커버 | LOW — 범위 밖 |
| R3 | Gate #11 (Tool Sanitization) Innovation 검증 미포함 | N8N-SEC-3~8에서 보안 커버. 별도 Innovation 검증 행 추가 시 중복 | LOW — 합리적 생략 |
| R4 | L1778 messages.create() 분당 상한 수치 미명시 | Anthropic rate limit은 plan별 가변 → 고정 수치 명시 시 오히려 부정확 가능 | LOW — 의도적 |

---

## john 5대 체크포인트 검증 (v1b 재검증)

| # | 체크포인트 | v1 | v1b | 근거 |
|---|-----------|-----|------|------|
| 1 | v2↔v3 혁신 간 일관성 | ✅ | ✅ | 변경 없음 |
| 2 | 검증 기준 ↔ Success Criteria/Go/No-Go 정합 | ⚠️ | ✅ | L1740 이제 #4+#9+#14 — Success Criteria Go/No-Go 정합 완료 |
| 3 | 비교 테이블 경쟁사 정보 정확성 | ✅ | ✅ | 변경 없음 |
| 4 | "계획(Planning)" 개념 vs 구현 정합 | ✅ | ✅ | L1665 "(read-time, 저장 없음 = '계획' 단계)" 명시로 더욱 명확 |
| 5 | 혁신 리스크 ↔ Risk Registry 교차 참조 | ⚠️ | ✅ | L1781 R10, L1782 R14 추가. L1774 "(R1)" 제거. R6, R7, R8 기존 정합 유지 |

---

## 경쟁사 비교 테이블 Architecture 검증

Bob과 Quinn이 기술 차별화 주장의 정확성 확인 요청:

| 테이블 | 주장 | Architecture 판정 |
|--------|------|-----------------|
| L1568-1572 Soul 비교 | CrewAI 30-50줄, LangGraph 20-40줄, AutoGen 30줄+ | 방향적 정확. 정확한 LOC가 아닌 비교 스케일로 적합. Soul=0줄 vs code-required 차별화 유효 |
| L1584-1589 call_agent 비교 | SDK 서브에이전트 깊이 1단계 한계 | Claude Agent SDK 1단계 확인 (PoC Test 7). OpenAI handoff도 1단계. Google ADK sub_agents도 1단계. 기술적 정확 |
| L1653-1660 Memory 비교 | AutoGen "Teachability + Mem0 통합 (벡터+KV+그래프 하이브리드)" | Mem0 통합은 AG2 (AutoGen 0.4+) 기능. "벡터+KV+그래프"는 Mem0 자체 아키텍처 기술. 기술적 합리적 |
| L1653-1660 Memory 비교 | CrewAI "4-type (short/long/entity/contextual)" | CrewAI 공식 문서 기준 4-type 메모리 정확 |
| L1653-1660 Memory 비교 | "능동적 반성 없음" (AutoGen, CrewAI) | CORTHEX만 크론 기반 LLM 반성 수행 — 차별화 주장 유효 |

---

## 자동 불합격 검토

| 조건 | 판정 |
|------|------|
| 할루시네이션 | ❌ 없음 |
| 보안 구멍 | ❌ 없음 — R10 공격 체인까지 명시 |
| 빌드 깨짐 | ❌ N/A |
| 데이터 손실 위험 | ❌ 없음 |
| 아키텍처 위반 | ❌ 없음 |

---

## 긍정 평가

1. **"뒤집는 가정" 프레이밍**: 혁신 가치를 한 줄로 전달
2. **v2↔v3 계층 테이블** (L1552-1558): 유지/확장 관계 한눈에 파악
3. **사용자 체감 vs 기술 혁신 분리** (L1694-1713): 이중 독자 커버
4. **시장 타이밍 수학 근거** (L1719): 6개월 선점 정량 계산
5. **Option B + Planning read-time 완벽 정합**: L1665 "(read-time, 저장 없음)" 명시
6. **폴백 전략 단계적 구성**: 모든 혁신에 실패 시 대안 제시
7. **R10 공격 체인 명시** (L1781): "malicious obs → reflection → Soul 주입" — 보안 리스크 인과 관계 명확
8. **선제 수정 품질**: john의 8건 선제 수정이 cross-talk에서 지적된 이슈 대부분 선해결

---

## R2 Fix Verification (8건 — fixes.md 기준)

### MAJOR (3건)

| Fix # | 이슈 | 검증 | 판정 |
|-------|------|------|------|
| Fix 1 | L1740 Go/No-Go #4→#4+#9+#14 | L1740: "#4: agent_memories 단절 0건 + #9: 4-layer E2E + #14: Capability Evaluation". 성공 기준에 "adversarial 100% 차단" 추가 ✅ | ✅ FIXED |
| Fix 2 | L1663 memoryTypeEnum 'observation' 제거 | L1663: `memoryTypeEnum`에 `'reflection'` 추가 (only). "별도 테이블" 명시. Option B (MEM-1) 정합 ✅ | ✅ FIXED |
| Fix 3 | Quality Gates #9-#14 추가 (6행) | L1751-1756: #9 Obs Poisoning, #10 Voyage AI, #11 Tool Sanitization, #12 v1 패리티, #13 사용성, #14 Capability Eval. 14/14 완전 커버 ✅. Success Criteria (Step 5) 정합 ✅ | ✅ FIXED |

### MINOR (5건)

| Fix # | 이슈 | 검증 | 판정 |
|-------|------|------|------|
| Fix 4 | L1665 3단계 구현 패턴 완성 | "soul-enricher.ts가 다음 태스크 시 cosine ≥ 0.75 top-3 검색 → Soul 주입 (read-time, 저장 없음 = '계획' 단계)" ✅. Product Scope L957-959 정합 ✅ | ✅ FIXED |
| Fix 5 | L1623 + L1741 "≤ 200KB" | L1623: "≤ 200KB gzipped". L1741: "≤ 200KB gzipped". PIX-1 정합 ✅ | ✅ FIXED |
| Fix 6 | L1774 "(R1)" 제거 | "PixiJS 8 번들 200KB 초과" — Risk ID 참조 없음. Go/No-Go #5만 참조 ✅ | ✅ FIXED |
| Fix 7 | R10 + R14 리스크 행 추가 | L1781: R10 공격 체인 ("malicious obs → reflection → Soul 주입"), Go/No-Go #9. L1782: R14 Sprint 4 마지막 배치 + @pixi/react 추상화 ✅ | ✅ FIXED |
| Fix 8 | Innovation 7 adversarial 기준 추가 | L1740 검증: "10종 adversarial payload 차단". 성공: "adversarial 100% 차단" ✅ | ✅ FIXED |

**8/8 FIXED. 0건 잔류 이슈 (MAJOR/MINOR 없음).**

---

## R2 잔류 (4건 — 전부 LOW, 비차단)

| # | 이슈 | 근거 | 판정 |
|---|------|------|------|
| R1 | Go/No-Go #5 L460 "< 200KB" → Step 5 교차 섹션 | Innovation 범위 밖. Sally 확인: PIX-1 "≤"가 정본, CI 로직 `> 204800` 정합 | Step 5 carry-forward |
| R2 | R11/R15 Innovation 리스크 미포함 | Pre-Sprint/Sprint 4 인프라. Domain에서 커버 | 비차단 |
| R3 | Big Five UX 인지 부하 리스크 | Innovation 6 기술 리스크만, UX 리스크 부재. PER-2 프리셋으로 완화 | 관찰급 |
| R4 | L1778 rate limit 수치 미명시 | Anthropic plan별 가변. Architecture carry-forward | 비차단 |

---

## Cross-talk 점수 변화

| Critic | v1 | v1b/R2 |
|--------|----|--------|
| Winston | 8.60 | **9.00** |
| Quinn | 7.10 | **8.90** |
| Sally | 7.45 | **9.00** |
| Bob | 6.95 | **8.55** |
| **Average** | **7.53** | **8.86** |

---

## Carry-Forward to Architecture Stage

1. **R11 Voyage AI Migration**: Innovation 범위 밖이나 Architecture에서 Pre-Sprint → Sprint 3 의존 관계 명시 필요
2. **L1778 rate limit 수치**: Architecture에서 Anthropic plan별 rate limit 확인 후 config 가능 범위 명시 (Quinn 제안: `REFLECTION_API_DELAY_MS` 환경변수 + 429 exponential backoff)
3. **경쟁사 비교 테이블 유지보수**: SDK 버전 변경 시 (특히 AutoGen AG2 → AG3) 비교 업데이트 필요
4. **"< 200KB" 교차 섹션 정리**: Bob 잔류 — 9곳 (L178, L447, L460, L526, L598, L621, L643, L1245, L2085) PIX-1 "≤ 200KB"로 통일 대상
