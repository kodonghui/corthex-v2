# Critic-Impl Review — Step 5: v3 Implementation Patterns (E11~E22)

**Reviewer**: impl (Implementation Critic)
**Focus**: Code implementability, E8 boundary, existing v2 patterns
**Weights**: D1=15%, D2=15%, D3=25%, D4=20%, D5=15%, D6=10%
**Date**: 2026-03-22

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 파일 경로, 코드 스니펫, regex 패턴, hex 색상 전부 명시. E19 observation-sanitizer 위치만 "또는 routes 내 인라인" 모호. E20 proxy() import 미명시. |
| D2 완전성 | 8/10 | 12 패턴 + 에러코드 + 검증전략 + 안티패턴 10개 충실. FR-MKT 전용 패턴 없음(E20 인프라만). E11 기존 extraVars 사용처(hub.ts, call-agent.ts) 마이그레이션 가이드 누락. |
| D3 정확성 | 7/10 | **3건 사실 오류**: (1) EnrichResult 타입 불일치, (2) FR 테이블 vs E15 모순, (3) caller 수 9개≠8개. 나머지(agent-loop.ts L277, WsChannel 16개, embedding 768d) 정확. |
| D4 실행가능성 | 7/10 | Before/after 코드 패턴 우수. E11 타입 불일치로 tsc 실패 예상. knowledgeVars 출처 미명시. E20 proxy 라이브러리 미특정. |
| D5 일관성 | 7/10 | E11~E22 내부 정합 우수. **FR 요약 테이블(line 85, 87)이 E11/E15와 모순** — 삽입 위치, 파일 경로, 호출 방식 3곳 불일치. |
| D6 리스크 | 8/10 | Sanitization 체인 격리, PostToolUse 타이밍 리스크, 비용 한도 전부 식별. E16 500ms 폴링 부하(N companies × 100 queries/sec) 완화 전략 부재. |

---

## 가중 평균: 7.40/10 ✅ PASS

```
D1: 8 × 0.15 = 1.20
D2: 8 × 0.15 = 1.20
D3: 7 × 0.25 = 1.75
D4: 7 × 0.20 = 1.40
D5: 7 × 0.15 = 1.05
D6: 8 × 0.10 = 0.80
─────────────────
Total:          7.40
```

---

## 이슈 목록 (6건 — 수정 권장 3건, 참고 3건)

### 🔴 수정 필수 (3건)

**1. [D3/D4] E11 EnrichResult 타입 불일치 — tsc 빌드 차단**

```typescript
// E11 선언:
export interface EnrichResult {
  personalityVars: Record<string, number>;  // ← number
  memoryVars: Record<string, string>;
}

// E11 사용 패턴:
const extraVars = { ...knowledgeVars, ...enriched.personalityVars, ...enriched.memoryVars };
const soul = renderSoul(agent.soul, agentId, companyId, extraVars);

// renderSoul 실제 시그니처 (soul-renderer.ts:12-16):
export async function renderSoul(
  soulTemplate: string, agentId: string, companyId: string,
  extraVars?: Record<string, string>,  // ← string
): Promise<string>
```

`Record<string, number>` 스프레드 → `Record<string, string | number>` → `renderSoul`의 `Record<string, string>` 불일치 → **TypeScript 에러**.

**Fix**: `personalityVars`를 `Record<string, string>`으로 변경 (E12 Layer 3에서 이미 `String(v)` 변환하므로 enrich() 반환 시점에는 string이어야 함)

---

**2. [D3/D5] FR 요약 테이블 line 87 vs E15 모순 — 보안 결정 충돌**

| | FR 테이블 (line 87) | E15 패턴 |
|--|---------------------|----------|
| 삽입 시점 | `PostToolUse` 경로 | `PreToolResult` (toolResults.push 직전) |
| 파일 위치 | `engine/hooks/tool-sanitizer.ts` | `engine/tool-sanitizer.ts` |
| 성격 | "신규 Hook" | "Hook이 아님" |

E15가 정확 — PostToolUse는 side-effect COPY만 처리하므로 LLM에 unsanitized 원본이 도달함 (agent-loop.ts L277→L282 순서 확인됨). FR 테이블이 구버전 결정을 반영 중.

**Fix**: FR 테이블 line 87 → `agent-loop.ts PreToolResult 지점 engine/tool-sanitizer.ts (Hook 아님, ECC-4)` 수정

---

**3. [D3/D5] FR 요약 테이블 line 85 vs E11 모순 — Soul Enricher 호출 위치**

| | FR 테이블 (line 85) | E11 패턴 |
|--|---------------------|----------|
| 호출 위치 | `agent-loop.ts에 soulEnricher.enrich() 1행만 삽입` | `agent-loop.ts에 soul-enricher 직접 import 금지 — callers가 pre-rendered soul 전달` |

E11이 올바른 설계 — callers(hub.ts, commands.ts 등)가 enrich() 호출 후 pre-rendered soul을 agent-loop에 전달하는 방식이 E8 경계를 준수함.

**Fix**: FR 테이블 line 85 → `callers (hub.ts 등)에서 soulEnricher.enrich() 호출 → renderSoul extraVars 주입` 수정

---

### 🟡 참고/개선 권장 (3건)

**4. [D3] renderSoul caller 수: 8개 → 9개 (파일 기준)**

실제 caller (비테스트):
| # | 파일 | 라인 |
|---|------|------|
| 1 | routes/commands.ts | :55 |
| 2 | services/telegram-bot.ts | :96 |
| 3 | routes/workspace/hub.ts | :105-106 |
| 4 | services/organization.ts | :957 |
| 5 | routes/workspace/presets.ts | :45 |
| 6 | services/argos-evaluator.ts | :379 |
| 7 | services/agora-engine.ts | :170 |
| 8 | services/agora-engine.ts | :301 |
| 9 | routes/public-api/v1.ts | :46 |
| 10 | tool-handlers/builtins/call-agent.ts | :67-68 |

9개 파일, 10개 논리적 call site. hub.ts와 call-agent.ts는 이미 extraVars를 사용 중 — E11 마이그레이션 시 기존 knowledge_context extraVars를 보존해야 함.

**Suggestion**: "8개 caller" → "9개 caller (10개 call site)" + 기존 extraVars 사용처 명시

---

**5. [D4] E11 knowledgeVars 출처 불명**

```typescript
const extraVars = { ...knowledgeVars, ...enriched.personalityVars, ...enriched.memoryVars };
```

`knowledgeVars`가 어디서 오는지 패턴에 미명시. 현재 hub.ts는 `knowledge_context`를 직접 구성해서 전달 중 (dept-knowledge injection).

**Suggestion**: knowledgeVars 구성 패턴 또는 "기존 caller의 기존 extraVars 유지" 명시

---

**6. [D6] E16 /ws/office 폴링 부하 미완화**

500ms setInterval × N companies = 잠재적 고부하. 현재 서버 24GB인데 Neon serverless는 연결 풀 제한 있음.

**Suggestion**: "연결된 클라이언트가 있을 때만 폴링 시작, 없으면 중지" adaptive polling 명시 권장

---

## 검증 결과 요약

| 검증 항목 | 결과 |
|-----------|------|
| renderSoul 시그니처 (soul-renderer.ts:12-16) | ✅ extraVars?: Record<string, string> 확인 |
| toolResults.push 위치 (agent-loop.ts:277) | ✅ PostToolUse hooks L282+ 이후 확인 |
| WsChannel union (shared/types.ts:484-500) | ✅ 16개 채널, 'office' 추가 시 17개 |
| embedding-service.ts | ✅ Gemini text-embedding-004, 768d (교체 대상) |
| engine/index.ts E8 barrel | ✅ renderSoul export 확인, soul-enricher는 services/ 배치로 E8 준수 |
| croner 의존성 | ✅ package.json에 croner ^10.0.1 이미 설치 |
| E15 PreToolResult 지점 | ✅ L277 toolResults.push 직전이 정확한 삽입 위치 |

---

## Cross-talk 요약

- 다른 critic 미수신 상태이므로 해당 없음. Issue #2 (FR 테이블 모순)은 보안 결정이므로 QA critic과 교차 검증 권장.
