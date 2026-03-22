# Critic-Impl Review R2 — Step 5: v3 Implementation Patterns (E11~E22)

**Reviewer**: impl (Implementation Critic)
**Focus**: Code implementability, E8 boundary, existing v2 patterns
**Weights**: D1=15%, D2=15%, D3=25%, D4=20%, D5=15%, D6=10%
**Date**: 2026-03-22
**Round**: R2 (R1 7.40 → R2)

---

## R1 이슈 검증 결과

| R1 이슈 | Fix # | 상태 | 검증 |
|---------|-------|------|------|
| 🔴 E11 EnrichResult type mismatch | F6 | ✅ 해결 | L1978: `Record<string, string>` + "renderSoul extraVars와 타입 일치" 주석 |
| 🔴 FR table L87 PostToolUse 모순 | F9 | ✅ 해결 | L87: "PreToolResult 지점 (toolResults.push 직전) engine/tool-sanitizer.ts — Hook이 아닌 인라인 함수" |
| 🔴 FR table L85 agent-loop 삽입 모순 | F10 | ✅ 해결 | L85: "renderSoul callers(9곳)에서 enrich() 호출 후 extraVars 확장 (E8 경계 — agent-loop.ts 직접 삽입 아님)" |
| 🟡 caller 수 8→9 | F3 | ✅ 해결 | L1950, L1960, L1998 모두 "9개 caller / 10 call sites" |
| 🟡 knowledgeVars 출처 | - | ✅ 해결 | L2004-2005: `existingKnowledgeContext ? { knowledge_context: ... } : {}` 패턴 명시 |
| 🟡 E16 adaptive polling | F13 | ✅ 해결 | L2164: "연결된 클라이언트 있을 때만 폴링" + L2166: diff-based broadcast |

**추가 개선 확인:**
- E16 states: `idle|working|speaking|tool_calling|error|degraded` — PRD FR-OC2 6개 상태 일치 ✅
- E14: `confidence >= 0.7 AND flagged = false` 필터 + `pg_try_advisory_xact_lock` non-blocking ✅
- E15: 5-path mapping (L219/L238/L265/L277/L291) 추가 ✅
- E20b: FR-MKT 전용 패턴 신설 + MarketingSettings interface + 에러 코드 3종 ✅
- E11: Interface contract freeze + additive-only 규칙 ✅
- E20: OOM recovery (Docker restart + healthcheck) ✅
- E22: 6-group list 명시 (Hub/Dashboard/Agents/Library/Jobs/Settings) ✅
- Go/No-Go: #1, #4, #8, #12, #13, #14 검증 추가 ✅

---

## 차원별 점수

| 차원 | R1 | R2 | 근거 |
|------|-----|-----|------|
| D1 구체성 | 8 | 9/10 | E20b MarketingSettings 완전 타입 정의. E15 5-path 매핑. E16 PRD 상태 6종. E22 6-group 열거. |
| D2 완전성 | 8 | 9/10 | E20b FR-MKT 패턴 추가. Go/No-Go 14개 전체 검증 전략. E11 기존 extraVars 보존 가이드. |
| D3 정확성 | 7 | 8/10 | R1 3건 전부 해결. 잔여: E15 line mapping L238/L265 라벨 스왑 + 검증 테이블 L2411 "8개" 잔존. |
| D4 실행가능성 | 7 | 9/10 | E11 타입 일치로 tsc 통과. knowledgeVars 패턴 명시. Interface contract freeze로 Sprint 간 안정성 확보. |
| D5 일관성 | 7 | 9/10 | FR 테이블 ↔ E11/E15 정합 달성. "9개 caller" 일관. 검증 테이블 1곳만 잔존. |
| D6 리스크 | 8 | 9/10 | E16 adaptive polling + backpressure. E14 non-blocking lock. E20 OOM recovery. E20b API 타임아웃. |

---

## 가중 평균: 8.75/10 ✅ PASS

```
D1: 9 × 0.15 = 1.35
D2: 9 × 0.15 = 1.35
D3: 8 × 0.25 = 2.00
D4: 9 × 0.20 = 1.80
D5: 9 × 0.15 = 1.35
D6: 9 × 0.10 = 0.90
─────────────────
Total:          8.75
```

---

## 잔여 이슈 (2건 — 참고)

### 🟡 1. E15 5-path mapping: L238/L265 라벨 스왑

현재 v2 agent-loop.ts 실제:
| Line | 실제 내용 |
|------|----------|
| L219 | PreToolUse blocked → `blockedOutput` (CORTHEX 생성) |
| L238 | **call_agent** → `{success: true, delegatedTo: to}` (CORTHEX 생성) |
| L265 | **MCP error catch** → `[MCP tool error: ...]` (CORTHEX 생성) |
| L277 | MCP success → `mcpOutput` (외부 도구 응답) |
| L291 | Other tools → `[Tool "..." not executable]` (CORTHEX 생성) |

E15 R2 mapping:
| Line | E15 라벨 | 일치 여부 |
|------|---------|----------|
| L219 | `tool_not_found` | ✅ |
| L238 | `tool_error` | ❌ (실제: call_agent) |
| L265 | `call_agent 성공` | ❌ (실제: MCP error) |
| L277 | 일반 MCP tool | ✅ |
| L291 | tool_timeout | ⚠️ (실제: other tools — close enough) |

**영향**: E15의 "BEFORE (v2, L265)" 코드 예시가 `childAgentResponse`를 참조하지만, 실제 L265에는 `mcpOutput` (error)이 있음. v3에서 call_agent가 자식 에이전트 응답을 직접 수집하도록 리팩토링된다면 라인 번호가 변경될 것 — 현재 라벨과 "BEFORE" 코드를 v2 현행 기준으로 수정하거나, v3 계획임을 명시하는 것이 좋음.

**Severity**: Low — E15의 핵심 결정(PreToolResult에서 sanitize, PostToolUse 아님)은 정확. 5-path mapping 자체의 sanitize 필요/불필요 판단도 합리적. 라벨만 수정하면 됨.

### 🟡 2. 검증 테이블 L2411: "8개 caller" 잔존

L2411: `E11 soul-enricher 8개 caller` → `9개 caller` 수정 필요. E11 본문(L1998)과 불일치.

---

## 최종 판정

**8.75/10 ✅ PASS** — R1 대비 +1.35점 향상. 3개 필수 수정 전부 해결. 잔여 2건은 라벨/숫자 오타 수준으로 구현에 영향 없음. E11~E22 패턴은 실제 v2 코드 구조와 정합하며, 코드 스니펫은 tsc 통과 가능. 구현 착수 가능 수준.
