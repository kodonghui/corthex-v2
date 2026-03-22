# Stage 3 Step V-04 — Critic-C (John) Review R2

**Step:** V-04 Product Brief Coverage Validation (Rewrite — fixes from R1 FAIL applied)
**Reviewer:** John (Critic-C, Product + Delivery)
**Date:** 2026-03-22
**Artifact:** `_bmad-output/planning-artifacts/prd-validation-report.md` Lines 125-235

---

## R1 수정 검증

이전 리뷰(5.35/10 FAIL)에서 지적한 필수 수정 5건 확인:

| # | R1 이슈 | R2 상태 |
|---|---------|---------|
| 1 | Go/No-Go: "8개" → 실제 Brief 11, PRD 14 | ✅ 수정됨 — "Brief: 11 gates → PRD: 14 gates (expanded)" 정확 |
| 2 | WebSocket: 허위 불일치 "14→15" 삭제 | ✅ 수정됨 — 해당 gap 완전 제거. Brief/PRD 16→17 정합 확인 |
| 3 | Sub-section 라인번호 업데이트 | ✅ 수정됨 — L273, L330, L471, L668, L740, L1070, L1784, L2085, L2285, L2499 모두 현재 PRD 기준 |
| 4 | Technical Constraints 커버리지 추가 | ✅ 수정됨 — L159-161 "all 9 constraints present + expanded" |
| 5 | Overall Coverage % 재산정 | ✅ 수정됨 — 98% → 95% (moderate gap 2건 반영) |

**R1 수정 품질: 5/5 — 지적사항 전부 해결.**

---

## Critic-C Review — V-04 Brief Coverage Validation (R2)

### 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 8/10 | 20% | Brief 라인번호(L425, L427, L497, L279, L136, L404) 전부 정확 (직접 검증 완료). ECC 번호(2.7, 2.2) 명시. 포맷 `{ status, summary, next_actions, artifacts }` 정확 인용. PRD 라인 참조(L273-306, L117-161 등) 현재 PRD 기준. 감점: Gap FR 삽입 위치(PRD 어느 섹션에 추가할지) 미지정 — "FR 추가" 권고만 있고 구체 삽입점 없음. |
| D2 완전성 | 8/10 | 20% | Coverage Map 20+ 항목 체계적 검증: Vision, Problem, Users, Features(4L+L0), Metrics, Goals, Differentiators, Constraints, Sprint Order, Go/No-Go(11→14), Out of Scope, Onboarding, Marketing Preset, AI Tool Engine, TTL, Voyage AI. 감점: **Brief L498 "비용 기록 immutability — cost-aggregation 데이터 append-only" 기술 제약 검증 누락.** PRD grep "immutab\|append.only\|frozen" = 0건. Brief 자체가 "Architecture에서 설계" 명시 + GATE로 비용 UI 제거되어 Informational이나, 10개 기술 제약 중 1개 미검증. |
| D3 정확성 | 9/10 | 15% | 5개 Gap 전부 직접 검증 완료: (1) ECC 2.7 — PRD 전문 grep "핸드오프 응답\|handoff response\|ECC 2.7" = 0건 확인. (2) ECC 2.2 — PRD FR35는 정적 tier→model 매핑, 동적 태스크 복잡도 기반 라우팅 FR 부재 확인. (3) MCP health — PRD Docker healthcheck는 n8n 전용, MCP 모니터링과 별개. (4) CEO Costs — PRD L259-263 GATE 정확. (5) Big Five scale — Stage 1 Decision 4.3.1 확인. R1 할루시네이션(게이트명 4개, WS 14→15) 완전 제거. 95% 커버리지 수치 합리적. |
| D4 실행가능성 | 8/10 | 15% | 권고사항 명확: FR 추가 2건 + Brief 업데이트 3건. Writer가 실행 가능. 감점: Gap FR 구체 형태 미제시. 이상적으로는 "FR-MEM15: [Sprint 3] call_agent 핸드오프 응답이 `{ status, summary, next_actions, artifacts }` 형식을 따른다" 수준까지 제시했으면 즉시 반영 가능. |
| D5 일관성 | 9/10 | 10% | V-01→V-04 순차 진행 깔끔. 심각도 분류(Critical/Moderate/Informational) 일관. R1에서 V-02 findings와 모순되던 WS 불일치 완전 해소. 확정 결정 #11(8→11 gates)과도 이제 정합. |
| D6 리스크 | 7/10 | 20% | Gap 1 downstream 영향(Tracker UI + 메모리 관찰 품질) 인식 양호. 감점 2건: (1) **Gap 1 배송 리스크 미평가** — ECC 2.7이 Sprint 3 Layer 4 범위인데, FR 없이 Sprint 3 진입 시 late discovery → 재작업. 현 시점(PRD 검증)에서 FR 추가가 최저 비용 해결이라는 점 미명시. (2) **Gap 2와 Risk R3 연결 미명시** — Brief R3 "Reflection LLM 비용 폭발 (H/H)"의 핵심 완화 전략이 Tier별 동적 모델 라우팅(ECC 2.2). FR 없으면 R3 완화 불완전. 이 리스크 연쇄를 리포트에 명시했어야 함. |

### 가중 평균: 8.05/10 ✅ PASS

**계산:** (8×0.20) + (8×0.20) + (9×0.15) + (8×0.15) + (9×0.10) + (7×0.20) = 1.60 + 1.60 + 1.35 + 1.20 + 0.90 + 1.40 = **8.05**

---

### 이슈 목록

#### 1. **[D2 완전성] Informational — Brief L498 "비용 기록 immutability" 미검증**

- Brief L498: "cost-aggregation 데이터 append-only (수정/삭제 불가) — ECC 2.2: 비용 데이터 무결성 보장. frozen dataclass 패턴 Architecture에서 설계."
- PRD: grep "immutab|append.only|frozen" = 0건.
- Brief 자체가 "Architecture에서 설계" 명시 + GATE로 비용 UI 제거 → Informational.
- **권고:** Coverage Map Technical Constraints 항목에 "비용 기록 immutability — Architecture 위임, PRD NFR 불필요" 추가.

#### 2. **[D6 리스크] Moderate — Gap 1 배송 리스크 미평가**

- ECC 2.7 call_agent 핸드오프 응답 표준화는 Brief L425 In Scope Layer 4 (Sprint 3).
- FR 부재 상태로 Sprint 3 진입 시 → 개발 중 발견 → 스펙 재논의 + FR 추가 + 재구현 = late discovery cost.
- **현 단계(PRD 검증)에서 FR 추가 = $0 비용.** Sprint 3 착수 후 발견 = 재작업 비용.
- **권고:** Gap 1 설명에 "Sprint 3 late discovery risk — 현 단계에서 FR 추가가 최저 비용 해결" 문장 추가.

#### 3. **[D6 리스크] Moderate — Gap 2와 R3 리스크 연결 미명시**

- Brief R3 "Reflection LLM 비용 폭발" = Probability H, Impact H.
- R3 완화 전략의 핵심 = Tier별 동적 모델 라우팅 (Haiku $1.80/mo vs Sonnet $39/mo).
- Gap 2 (ECC 2.2 FR 부재) = R3 완화 전략의 FR 레벨 명세가 없는 상태.
- FR 없으면: Tier별 비용 한도 auto-pause만 존재, 능동적 비용 최적화(동적 라우팅) 불가.
- **권고:** Gap 2 Impact에 "R3 (H/H) 완화 전략 불완전" 추가. Severity는 Moderate 유지 (FR35 정적 매핑이 부분 커버하므로).

#### 4. **[D4 실행가능성] Low — Gap FR 삽입 위치 미지정**

권고 수준:
- Gap 1 → PRD L2470 부근 (Sprint 3 Memory FRs), 형태: `FR-MEM15: [Sprint 3] call_agent 핸드오프 응답이 { status, summary, next_actions, artifacts } 형식을 따른다. Tracker UI 정합 + observation content 구조화 (ECC 2.7, Brief L425)`
- Gap 2 → PRD L2345 부근 (Tier Management FRs), 형태: `FR-TIER-ROUTE1: [Sprint 3] 에이전트 실행 시 태스크 복잡도에 따라 Tier 모델을 동적 선택한다. Admin이 Tier별 모델 배정 설정 가능 (ECC 2.2, R3 완화, Brief L427)`

#### 5. **[D1 구체성] Low — Brief 업데이트 대상 라인 미명시**

- Gap 4: Brief L279 "Costs / Reports" → GATE 결정 반영 수정 필요.
- Gap 5: Brief L136 "0.0~1.0", L404 "0.0~1.0" → "0-100 정수" 업데이트 필요.
- (사소 — 이슈 아님, 참고 사항.)

---

### Gap 검증 결과 요약

| Gap # | 분석가 판정 | Critic-C 검증 | 동의? | 비고 |
|-------|-----------|--------------|------|------|
| 1 (ECC 2.7) | Moderate | PRD grep "ECC 2.7" = 0건 | ✅ 동의 | 배송 리스크 코멘트 추가 권고 |
| 2 (ECC 2.2) | Moderate | FR35 = 정적 매핑만. 동적 라우팅 FR 부재 | ✅ 동의 | R3 연결 코멘트 추가 권고 |
| 3 (MCP health) | Informational | Docker healthcheck ≠ MCP 모니터링 | ✅ 동의 | — |
| 4 (Brief outdated) | Informational | PRD L259-263 GATE 정확 | ✅ 동의 | Brief L279 수정 필요 |
| 5 (Brief outdated) | Informational | Stage 1 Decision 4.3.1 확인 | ✅ 동의 | Brief L136, L404 수정 필요 |
| **6 (신규)** | — | Brief L498 "비용 기록 immutability" PRD 미반영 | Informational 추가 권고 | Architecture 위임 명시, GATE로 관련성 저하 |

### False Positive 검증: 0건

분석가의 5개 Gap 중 false positive 없음. R1에서 존재하던 false positive 2건(WS 14→15, 할루시네이션 게이트명) 완전 제거 확인.

---

### Cross-talk 메모

- Winston/Quinn에게: ECC 2.7 `{ status, summary, next_actions, artifacts }` 포맷의 E8 경계 준수 여부 검증 요청. Brief L425는 "engine 외부 레이어에서 구현" 명시 — PRD FR에도 이 경계 조건 반영 필요.
- ECC 2.2 dynamic model routing의 기술적 실현 가능성 — 현재 `tier_configs` 테이블 구조로 task complexity 기반 동적 라우팅이 가능한지 Architecture 단계 검증 필요.

---

### R1 → R2 개선도

| 지표 | R1 | R2 | 변화 |
|------|------|------|------|
| 점수 | 5.35/10 ❌ | 8.05/10 ✅ | +2.70 |
| 할루시네이션 | 2건 (게이트명 4개, WS 14→15) | 0건 | 완전 해소 |
| 사실 오류 | 3건 | 0건 | 완전 해소 |
| Stale 라인번호 | ~15개 | 0개 | 전수 업데이트 |
| 누락 섹션 | 2개 (Tech Constraints, Future Vision) | 1개 (비용 immutability) | 대폭 개선 |

**결론:** R1 FAIL 지적사항 5/5 완벽 수정. R2는 높은 품질. 미세 보완 3건(누락 1건 + 리스크 연결 2건)은 fixes로 즉시 해결 가능. **8.05/10 ✅ PASS.**

---

## [Verified] R2 Fixes — 8.05/10 ✅ PASS (유지)

**Date:** 2026-03-22
**Verification:** 3 Critic 피드백 8건 전부 반영 확인.

| # | Fix | Source | Verified |
|---|-----|--------|----------|
| 1 | 비용 기록 immutability Coverage Map 추가 (L199-202) | John D2 | ✅ |
| 2 | Gap 1 late discovery risk 코멘트 (L211) | John D6 | ✅ |
| 3 | Gap 2 R3 리스크 연결 (L217) | John D6 | ✅ |
| 4 | Gap 2 security angle cross-talk 결과 반영 (L218) | Quinn-John consensus | ✅ |
| 5 | Gap 6 CLI 토큰 유출 자동 비활성화 추가 (L235-239) | Quinn M1 | ✅ |
| 6 | Gap 7 n8n service account API key 추가 (L241-244) | Quinn L2 | ✅ |
| 7 | Gap 8 /office 키보드 에이전트 선택 추가 (L246-249) | Winston | ✅ |
| 8 | Gap 1 cross-cutting risk note (L210) | Winston | ✅ |

**Updated totals verified:** 3 Moderate + 5 Informational = 8 gaps. Coverage 93%. Avg 8.05/10.
**Score 유지:** 8.05/10 — fixes가 내 지적사항을 정확히 반영했으므로 점수 변동 없음.
