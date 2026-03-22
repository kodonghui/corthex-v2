# Critic-Impl Review — Step 7: v3 Architecture Validation Results

**Reviewer**: impl (Implementation Critic)
**Focus**: Code implementability, E8 boundary, existing v2 patterns
**Weights**: D1=15%, D2=15%, D3=25%, D4=20%, D5=15%, D6=10%
**Date**: 2026-03-22

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | D-number 교차 참조, 53 FR 상세 검증, 14 Go/No-Go 테스트 파일 매핑. 통계 테이블 완비. |
| D2 완전성 | 9/10 | D22~D34 + D1~D21 호환성 전수, 53 FR + 18 NFR + 14 gate 전부 커버. Gap analysis 체계적. |
| D3 정확성 | 7/10 | **E8 경계 claim 모순 2건**: (1) "모든 v3 engine/ 외부" vs E15 engine/ 내부, (2) E16 ws/ ≠ engine/ 혼동. Anti-pattern 카운트 오류. Integration 카운트 오류. |
| D4 실행가능성 | 9/10 | Sprint 순서 합리적. Pre→1→2→3→4 의존성 체인 명확. Handoff 가이드라인 실용적. |
| D5 일관성 | 7/10 | Line 2938 ↔ Line 2952 자기모순. 통계 카운트(anti-pattern, integration) 본문과 불일치. |
| D6 리스크 | 9/10 | Gap analysis 솔직 (0 critical, 2 important, 3 nice-to-have). E15 L265 문제 비차단으로 정확 분류. |

---

## 가중 평균: 8.15/10 ✅ PASS

```
D1: 9 × 0.15 = 1.35
D2: 9 × 0.15 = 1.35
D3: 7 × 0.25 = 1.75
D4: 9 × 0.20 = 1.80
D5: 7 × 0.15 = 1.05
D6: 9 × 0.10 = 0.90
─────────────────
Total:          8.20
```

---

## 이슈 목록 (5건 — 수정 필수 2건, 참고 3건)

### 🔴 수정 필수 (2건)

**1. [D3/D5] E8 경계 claim 자기모순 — 3개 문장이 서로 충돌**

| 위치 | 문장 | 사실 |
|------|------|------|
| L2938 | "E8 engine 경계 완전 준수 — **모든** v3 기능이 engine/ 외부에서 처리" | ❌ E15 tool-sanitizer.ts는 `engine/` 내부. agent-loop.ts도 수정됨 |
| L2952 | "engine/ 내부 수정은 **E15(tool-sanitizer), E16(ws/office channels.ts) 2건만** 허용" | ❌ E16 `ws/channels.ts`는 engine/ 외부 (`packages/server/src/ws/`) |
| L2769 | "9-row 의존성 매트릭스가 E8 engine 경계 완전 준수" | ⚠️ E15 tool-sanitizer는 engine/ 내부에 정당하게 배치. "완전 준수"는 과장 |

파일시스템 확인:
```
packages/server/src/
├── engine/     ← E15 tool-sanitizer.ts + agent-loop.ts 수정
├── ws/         ← E16 channels.ts 수정 (engine/ 외부!)
├── services/
├── routes/
└── ...
```

`engine/`과 `ws/`는 **형제 디렉토리** — E16은 engine/ 수정이 아님.

**Fix**: 3개 문장 통일:
- L2938: "E8 engine 경계 최소 침범 — engine/ 내부 수정은 **E15 tool-sanitizer 1건만** (신규 파일 + agent-loop.ts L265/L277 삽입). 나머지 12 패턴은 전부 engine/ 외부"
- L2952: "engine/ 내부 수정은 **E15 1건만** (tool-sanitizer.ts NEW + agent-loop.ts MODIFY). E16 ws/channels.ts는 engine/ 외부"

---

**2. [D3/D5] 통계 카운트 오류 3건**

| 항목 | 문서 값 | 실제 값 | 위치 |
|------|--------|--------|------|
| v3 Anti-Patterns | 9개 (L2886) | **10개** (lines 2435-2444, 10행) | Process Statistics |
| 내부 Integration | 9개 (L2858) | **8개** (lines 2690-2697, 8행) | Implementation Readiness |
| 총 Integration | 12개 (L2921) | **11개** (8 internal + 3 external) | Completeness Checklist |

**Fix**:
- L2886: "9" → "10" (v3 anti-patterns), total "17" → "18"
- L2858: "9 internal" → "8 internal"
- L2921: "12 integration points" → "11 integration points"

---

### 🟡 참고 (3건)

**3. [D3] D27+D1 호환성 — 검증 결과 정확**

L2748: "PreToolResult는 SDK Hook이 아닌 인라인 함수. E8 경계 내부"

agent-loop.ts 확인: tool-sanitizer.check()는 toolResults.push 직전 삽입이며 SDK의 Hook mechanism과 완전 독립. ✅

---

**4. [D3] v2 FRs "72" → 70 active + 2 deleted**

L2887: "72 v2 FRs" — frontmatter (L13) 에서는 "v2:70+v3:53 = 123". 72에서 2 삭제(FR37, FR39) = 70이 활성. 표기가 혼란스럽지만 계산은 정확 (72-2+53=123).

**Suggestion**: "72 (2삭제=70 활성)" 명시

---

**5. [D4] Sprint 순서 타당성 — 검증 통과**

의존성 체인:
```
Pre-Sprint (Voyage 0061)
    ↓ (Sprint 3에서 embedding 사용)
Sprint 1 (soul-enricher) ←→ Sprint 2 (독립)
    ↓ (Sprint 3에서 memoryVars 확장)
Sprint 3 (memory, Voyage embed)
Sprint 4 (OpenClaw, 가장 독립적)
Layer 0 (각 Sprint 후 순차)
```

Sprint 1과 2는 독립적이므로 병렬 가능하나, agent-loop.ts 수정이 Sprint 2에만 있어 충돌 없음. ✅

---

## 검증 결과 요약

| 검증 항목 | 결과 |
|-----------|------|
| D22~D34 + D1~D21 호환성 9행 | ✅ 충돌 0건 맞음 |
| E11~E22 + E1~E10 패턴 일관성 6행 | ✅ 모두 호환 |
| 53/53 FR 커버리지 | ✅ 전부 매핑 |
| 18/18 NFR 지원 | ✅ 구체적 아키텍처 대응 |
| 14/14 Go/No-Go 테스트 매핑 | ✅ 테스트 파일 명시 |
| E8 engine/ 경계 claim | ❌ 3개 문장 자기모순 (수정 필수) |
| engine/ vs ws/ 디렉토리 분리 | ✅ 형제 디렉토리 확인 (ws/ ≠ engine/) |
| Sprint 순서 feasibility | ✅ 의존성 체인 합리적 |
| 통계 카운트 | ❌ Anti-pattern 9→10, Integration 9→8 |
