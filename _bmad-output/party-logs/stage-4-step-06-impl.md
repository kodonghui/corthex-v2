# Critic-Impl Review — Step 6: v3 Project Structure & Boundaries

**Reviewer**: impl (Implementation Critic)
**Focus**: Code implementability, E8 boundary, existing v2 patterns
**Weights**: D1=15%, D2=15%, D3=25%, D4=20%, D5=15%, D6=10%
**Date**: 2026-03-22

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | 전체 디렉토리 트리, Sprint 주석, Decision 참조, ASCII 아키텍처 다이어그램, 53 FR→파일 매핑 전부 구체적. |
| D2 완전성 | 8/10 | 53 FR 매핑 + 7 cross-cutting + 7 내부통합 + 3 외부통합 + 4 데이터흐름. routes/observations.ts 디렉토리 트리 누락. tool-handlers/ 경로 미기재. |
| D3 정확성 | 7/10 | **마이그레이션 확장자 `.ts` → 실제 `.sql`**. `db/logger` → 실제 `lib/activity-logger.ts`. L265 라벨 스왑 계승. 나머지 경로/구조 정확. |
| D4 실행가능성 | 8/10 | Sprint별 NEW/MODIFY 카운트, 의존성 매트릭스, 데이터 흐름으로 구현 순서 명확. 마이그레이션 확장자 오류 시 혼란 가능. |
| D5 일관성 | 8/10 | E11~E22 결정 → 파일 위치 정합. D22~D34 참조 일관. confirmed-decisions 12건 반영. 검증 테이블 "8개" 잔존은 Step 5 문제. |
| D6 리스크 | 8/10 | n8n Docker 격리 명확. E8 경계 의존성 매트릭스로 방어. `__tests__/security/` 신규 컨벤션은 합리적. 마이그레이션 rollback 전략 미언급. |

---

## 가중 평균: 7.90/10 ✅ PASS

```
D1: 9 × 0.15 = 1.35
D2: 8 × 0.15 = 1.20
D3: 7 × 0.25 = 1.75
D4: 8 × 0.20 = 1.60
D5: 8 × 0.15 = 1.20
D6: 8 × 0.10 = 0.80
─────────────────
Total:          7.90
```

---

## 이슈 목록 (6건 — 수정 필수 2건, 참고 4건)

### 🔴 수정 필수 (2건)

**1. [D3] 마이그레이션 파일 확장자: `.ts` → `.sql`**

문서 (lines 2500-2503):
```
XXXX_add_personality_traits.ts
XXXX_add_observations.ts
XXXX_extend_agent_memories.ts
XXXX_voyage_vector_1024.ts
```

실제 v2 마이그레이션 전체 (0000~0060):
```
0000_overjoyed_thunderbolt_ross.sql
...
0060_agents-user-id-nullable.sql
```

**모든 기존 마이그레이션이 `.sql` 확장자**. Drizzle ORM은 `.sql` 마이그레이션을 사용 중. `.ts` 확장자는 Drizzle가 인식하지 못할 수 있음.

**Fix**: `.ts` → `.sql` 수정. 예: `0061_add_personality_traits.sql`

---

**2. [D2/D3] `routes/observations.ts` 디렉토리 트리 누락**

FR mapping (line 2634) 참조:
```
FR-MEM1~2 Observation 저장 | routes/observations.ts (신규) + observation-sanitizer.ts (E13)
```

하지만 디렉토리 트리 (lines 2489-2492)에서 routes/ 하위에 observations.ts 미기재:
```
├── routes/
│   └── admin/
│       ├── n8n-proxy.ts
│       └── marketing.ts
```

또한, `routes/observations.ts`의 전체 경로 불명 — `routes/workspace/observations.ts` (CEO앱용) vs `routes/admin/observations.ts` (관리자용)?

기존 유사 패턴: `routes/workspace/knowledge.ts` (지식 관리가 workspace에 배치). Observations도 에이전트가 생성하므로 workspace가 적절하나, Admin 모니터링 관점에선 admin일 수도.

**Fix**: 디렉토리 트리에 `routes/workspace/observations.ts` (또는 적절한 경로) 추가 + FR mapping 업데이트

---

### 🟡 참고/개선 권장 (4건)

**3. [D3] 의존성 매트릭스 `db/logger` → 실제 `lib/activity-logger.ts`**

Line 2605:
```
engine/tool-sanitizer.ts | engine/types.ts, db/logger | routes/, services/
```

실제 codebase에 `db/logger`는 존재하지 않음. Activity logging은 `lib/activity-logger.ts`를 통해 수행:
```
packages/server/src/lib/activity-logger.ts
```

**Suggestion**: `db/logger` → `lib/activity-logger.ts`

---

**4. [D2] `tool-handlers/builtins/call-agent.ts` 디렉토리 트리 미기재**

renderSoul 9개 caller 중 하나인 `tool-handlers/builtins/call-agent.ts`가 디렉토리 트리에 없음. 이 파일도 Sprint 1에서 MODIFY 대상 (soul-enricher.enrich() 추가).

실제 위치:
```
packages/server/src/tool-handlers/
├── builtins/       # 서브디렉토리
├── call-agent.ts   # renderSoul caller
├── publish-tistory.ts
├── read-web-page.ts
└── ...
```

**Suggestion**: Sprint 1 MODIFY 목록에 `tool-handlers/call-agent.ts` 명시적 추가 (개발자가 9개 caller 중 1개를 놓칠 수 있음)

---

**5. [D5] L265/L277 라벨 스왑 계승 (Step 5 R2 잔여)**

Lines 2477, 2562, 2665 모두 `L265(call_agent)` 표기. 실제 L265는 MCP error catch.

이 이슈는 Step 5 E15에서 발생했으며 Step 6이 이를 그대로 참조. E15 수정 시 함께 해결.

---

**6. [D6] vector(768)→vector(1024) 마이그레이션 rollback 미언급**

`XXXX_voyage_vector_1024` 마이그레이션이 기존 knowledge_docs.embedding 차원을 변경하면 rollback 시 데이터 손실 위험:
- vector(1024) → vector(768) rollback 시 기존 1024d 임베딩 전부 무효
- Re-embed 필요 (Gemini API는 사용 금지이므로 rollback 시 Voyage로 768d 생성 불가)

**Suggestion**: 마이그레이션에 주석으로 "⚠️ 비가역적 — rollback 시 전체 re-embed 필요" 명시

---

## 검증 결과 요약

| 검증 항목 | 결과 |
|-----------|------|
| services/ 디렉토리 구조 | ✅ credential-vault.ts, embedding-service.ts 확인 |
| engine/ 구조 | ✅ tool-sanitizer.ts 배치 위치 semantic-cache.ts와 동일 레벨 |
| routes/admin/ 구조 | ✅ n8n-proxy.ts, marketing.ts 추가 위치 적절 |
| __tests__/ 구조 | ✅ unit/, integration/ 기존. security/ 신규 합리적 |
| ws/ 구조 | ✅ channels.ts, server.ts 확인 |
| packages/ 워크스페이스 | ✅ admin, app, e2e, landing, server, shared, ui (office/ = NEW) |
| 마이그레이션 확장자 | ❌ 전부 .sql — 문서 .ts 오류 |
| tool-handlers/ 경로 | ⚠️ 문서에 미기재 |
| credential-vault 패턴 | ✅ `getCredentials(companyId, ...)` 7곳 사용 확인 |
| E8 engine/index.ts | ✅ barrel export 패턴 준수 |

---

## Cross-talk 요약

- Step 5 R2 잔여 이슈 (L265/L277 라벨 스왑)가 Step 6에도 전파됨. E15 일괄 수정 시 Step 6 참조도 함께 갱신 필요.
