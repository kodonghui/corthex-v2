# Critic-B (QA + Security) Implementation Review — Story 24.1 Phase B

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-24

---

## Prior Review Issue Resolution

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | AR31 DB error → {} + log.warn | NOT FIXED | Only `??` coercion for NULL. Corrupt JSONB unhandled. |
| 2 | CHECK constraint unnamed | NOT FIXED | Still anonymous. Low risk. |
| 3 | LIST endpoint NULL→{} | **FIXED** | `agents.ts:82-85` — `.map()` with `??` coercion. |
| 4 | PATCH partial update semantics | **IMPLICIT** | Zod `.strict()` rejects partial keys. Correct behavior, no explicit doc. |
| 5 | Empty object `{}` behavior | **FIXED** | Test at line 140-143 confirms rejection. |
| 6 | `::int` float truncation | **DOCUMENTED** | Migration comment lines 5-6. |
| 7 | CHECK constraint naming | NOT FIXED | Same as #2. |
| 8 | Rollback SQL | **DOCUMENTED** | Migration comment line 4. |

**Resolution rate: 5/8 (63%)** — remaining 3 are low/medium severity.

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | 구현이 스펙과 정확히 일치. 파일, 라인, 패턴 전부 매치. |
| D2 완전성 | 8/10 | AC 1-8 전부 구현됨. 엣지 케이스 대부분 커버. 통합 테스트 미비 (아래 참조). |
| D3 정확성 | 9/10 | SQL 문법, Zod 패턴, 스키마 업데이트 전부 정확. 기존 코드와 호환. |
| D4 실행가능성 | 10/10 | 이미 구현 완료. 29/29 테스트 통과. turbo build 4/4 성공. |
| D5 일관성 | 8/10 | 기존 패턴 준수. 한 가지 불일치: `Record<string, unknown>` 타입 어노테이션. |
| D6 리스크 | 7/10 | 롤백 + float 경고 추가로 개선됨. CHECK 미명명 + 통합 테스트 부재 잔존. |

### 가중 평균: 8.25/10 ✅ PASS

> D1(10%) + D2(25%) + D3(15%) + D4(10%) + D5(15%) + D6(25%)
> = 0.9 + 2.0 + 1.35 + 1.0 + 1.2 + 1.75 = **8.20**

---

## Remaining Issues (3)

### 1. **[D2/D6] 통합 테스트 부재 — route handler 레벨**

29개 테스트 모두 unit 테스트 (Zod schema + `??` 연산자 격리 테스트). 실제 route handler를 통과하는 통합 테스트 없음:

- `agents.ts:82-85` LIST endpoint `.map()` coercion — 테스트 미커버
- `agents.ts:111` DETAIL endpoint `??` coercion — 테스트 미커버
- POST/PATCH → DB → GET 라운드트립 미검증

**Impact:** Zod + `??` 로직은 검증되었으나, route handler 연결 (middleware chain, tenant isolation, actual DB round-trip) 미검증.

**Severity:** Medium — unit 테스트가 핵심 로직을 커버하므로 실패 확률 낮음. 그러나 AR31 coercion이 route에서 정상 동작하는지는 미확인.

### 2. **[D5] `Record<string, unknown>` 타입 손실 — agents.ts:82**

```typescript
const data = result.map((a: Record<string, unknown>) => ({
```

`getAgents()` 반환 타입을 `Record<string, unknown>`으로 캐스팅하면 타입 안전성 손실. 다른 GET 핸들러는 추론된 타입을 직접 사용함.

**Severity:** Low — 런타임 동작에 영향 없음. 타입 일관성 이슈.

### 3. **[D6] CHECK 제약조건 미명명**

이전 리뷰에서 지적. 마이그레이션 멱등성 영향은 낮으나, 향후 제약조건 수정/삭제 시 이름 필요. 현재 단계에서는 blocker 아님.

---

## Security Assessment

| 항목 | 상태 | 검증 방법 |
|------|------|----------|
| FR-PERS2 Injection prevention | ✅ PASS | Zod `.strict()` + `.number().int()` — string/object/array 전부 거부 (tests L74-106) |
| Extra key injection | ✅ PASS | `.strict()` 모드 — 추가 키 거부 (tests L109-125) |
| SQL injection via JSONB | ✅ PASS | CHECK constraint는 `::int` 캐스팅 사용 — 비정수 문자열은 DB 에러 발생 |
| Tenant isolation | ✅ PASS | `tenantMiddleware` 적용됨 (agents.ts:20). companyId 기반 격리. |
| E8 boundary | ✅ PASS | engine/ 미수정. 모든 변경 server/ 내부. |

---

## Test Coverage Matrix

| AC | 테스트 커버리지 | 비고 |
|----|---------------|------|
| AC-1 Migration | ⚠️ Indirect | 빌드 성공으로 간접 검증. 마이그레이션 자체 테스트 없음. |
| AC-2 CHECK | ⚠️ Indirect | Zod가 API 레벨에서 차단. DB CHECK는 미테스트. |
| AC-3 Zod | ✅ Complete | 20+ 테스트 케이스 |
| AC-4 NULL→{} | ⚠️ Partial | `??` 연산자 격리 테스트만. Route 통과 미테스트. |
| AC-5 CRUD | ⚠️ Partial | optional/nullable wrapper 테스트만. 실제 CRUD 미테스트. |
| AC-6 Backward compat | ⚠️ Indirect | 빌드 성공으로 간접 검증. |
| AC-7 schema.ts | ✅ Complete | 코드 확인됨 (line 166). |
| AC-8 Type safety | ✅ Complete | turbo build 4/4 성공. |

---

## Verdict

**✅ PASS (8.20/10)**

구현 품질이 우수함. Zod 방어가 견고하고 FR-PERS2 보안 요구사항 충족. 29개 테스트가 핵심 로직 검증.

**Recommended but not blocking:**
- 통합 테스트 1-2개 추가 (POST→GET round-trip with personality)를 Story 24.2 진행 전에 고려
- CHECK constraint 명명은 다음 마이그레이션에서 `ALTER TABLE agents RENAME CONSTRAINT` 로 보완 가능
