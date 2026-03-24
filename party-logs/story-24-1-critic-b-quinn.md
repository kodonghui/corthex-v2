# Critic-B (QA + Security) Review — Story 24.1

**Reviewer:** Quinn (QA Engineer)
**Artifact:** `_bmad-output/implementation-artifacts/stories/24-1-personality-traits-db-schema.md`
**Date:** 2026-03-24

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | 파일 경로, SQL 패턴, Zod 코드 스니펫, 라인 번호 전부 명시. Task 4.2 "GET endpoints"만 모호 (list vs detail 둘 다인지 불명확). |
| D2 완전성 | 7/10 | 핵심 AC 8개 커버. 그러나 4개 엣지 케이스 누락 — 아래 이슈 목록 참조. |
| D3 정확성 | 9/10 | 마이그레이션 넘버링(0062), SQL 문법, Zod 패턴, 파일 경로 전부 실제 코드베이스와 일치 확인됨. schema.ts 라인 "~168" → 실제 166 (사소). |
| D4 실행가능성 | 9/10 | SQL + Zod 복붙 가능. Anti-patterns 목록 포함. 태스크 분해 명확. |
| D5 일관성 | 9/10 | 기존 Zod 패턴(`createAgentSchema` 구조), 마이그레이션 네이밍, API 응답 포맷 전부 일관. D33/E12/FR-PERS 아키텍처 참조 정합. |
| D6 리스크 | 6/10 | 4개 리스크 미식별 — CHECK 제약조건 subquery 호환성, float 무시 캐스팅, 롤백 전략, 제약조건 명명. |

### 가중 평균: 7.75/10 ✅ PASS

> 가중치: D1(10%) + D2(25%) + D3(15%) + D4(10%) + D5(15%) + D6(25%)
> = 0.9 + 1.75 + 1.35 + 0.9 + 1.35 + 1.5 = **7.75**

---

## 이슈 목록

### 1. **[D2 완전성] AR31 불완전 — DB error → empty result + log.warn 누락**

AR31 원문: _"NULL personality_traits -> empty objects. **DB error -> empty result + log.warn**"_

AC-4는 NULL→`{}` 변환만 다루고, DB 에러 시 empty result + log.warn 처리가 누락됨. GET에서 `personality_traits` 파싱이 실패하는 경우 (corrupt JSONB 등) 어떻게 처리할지 명시 필요.

**Fix:** AC-4에 "DB 에러 또는 corrupt JSONB → `{}` 반환 + `log.warn()`" 추가.

### 2. **[D2 완전성] LIST endpoint NULL→{} 적용 범위 불명확**

AC-4는 "API returns the agent"이라고만 명시. GET `/agents` (목록)에서도 각 에이전트의 `personality_traits: null` → `{}` 변환이 필요한지 불분명.

**Fix:** AC-4에 "GET /agents (list) 및 GET /agents/:id (detail) 모두 적용" 명시.

### 3. **[D2 완전성] 빈 객체 `{}` 입력 동작 미정의**

Zod `.strict()`는 `{}` 입력을 거부함 (5개 필수 키 누락). 이는 의도된 동작이나 명시적 AC가 없음. 클라이언트가 "성격 초기화" 의도로 `personality_traits: {}` 보낼 수 있음.

**Fix:** AC에 "personality 초기화는 `personality_traits: null`로 전송" 명시, 또는 `{}` → NULL 자동 변환 검토.

### 4. **[D2 완전성] PATCH partial update 시맨틱 미정의**

`PATCH /agents/:id`에서 `personality_traits: { openness: 50 }` (일부 키만) 전송 시 동작 미정의. Zod `.strict()`에 모든 키가 required이므로 거부되지만, 이 동작이 의도적인지 명시 없음. "전체 교체만 허용" vs "부분 업데이트 가능" 명확화 필요.

**Fix:** AC-5에 "personality_traits 업데이트는 전체 5개 키 교체만 허용 (partial update 불가)" 명시.

### 5. **[D6 리스크] CHECK 제약조건 subquery — pg_dump 호환성**

```sql
(SELECT count(*) FROM jsonb_object_keys(personality_traits)) = 5
```

PostgreSQL은 CHECK 내 set-returning function subquery를 허용하지만, 이는 SQL 표준 위반이며 `pg_dump` → restore 시 경고/실패 가능성 있음. Neon serverless에서 검증 필요.

**Fix:** 대안 — `jsonb_object_keys` count 대신 `NOT personality_traits ?| ARRAY[<excluded key patterns>]` 패턴 고려. 또는 Neon 환경에서 이 패턴이 안전함을 Dev Notes에 명시.

### 6. **[D6 리스크] `::int` 캐스팅 — float 무시 조용히 통과**

DB CHECK에서 `(personality_traits->>'openness')::int`는 float 값을 조용히 truncate함. 예: `50.7::int` = `51`. Zod `.int()` 가 API 레벨에서 차단하지만, 직접 DB 삽입(마이그레이션, 스크립트, 내부 서비스) 시 방어 불가.

**Fix:** Dev Notes에 "DB CHECK는 float truncation을 허용하므로, 모든 DB 삽입은 반드시 Zod 검증 후 수행" 경고 추가. 또는 CHECK에 `(personality_traits->>'openness')::text ~ '^\d+$'` 정규식 추가.

### 7. **[D6 리스크] CHECK 제약조건 미명명 — 마이그레이션 멱등성**

`ADD COLUMN IF NOT EXISTS`는 멱등하지만, CHECK 제약조건에 이름이 없음. 마이그레이션 재실행 시 자동 생성된 이름이 달라져 충돌 가능.

**Fix:** `CONSTRAINT chk_personality_traits_valid CHECK (...)` 명시적 이름 부여.

### 8. **[D6 리스크] 롤백 전략 미언급**

마이그레이션 실패 시 rollback SQL 미제공. `ADD COLUMN IF NOT EXISTS`이므로 부분 실행 가능. CHECK 제약조건만 실패하면 컬럼은 있으나 제약 없는 상태.

**Fix:** Dev Notes에 rollback 명령 추가: `ALTER TABLE agents DROP COLUMN IF EXISTS personality_traits;`

---

## 테스트 커버리지 제안 (Task 5 보강)

현재 Task 5의 테스트 항목은 기본적이나, 아래 엣지 케이스 추가 권장:

| # | 테스트 케이스 | 유형 |
|---|-------------|------|
| E1 | `personality_traits: {}` 빈 객체 → Zod 거부 확인 | Unit |
| E2 | 일부 키만 전송 `{ openness: 50 }` → Zod 거부 확인 | Unit |
| E3 | 값이 float `{ openness: 50.5, ... }` → Zod `.int()` 거부 확인 | Unit |
| E4 | 값이 string `{ openness: "high", ... }` → Zod 거부 (FR-PERS2) | Unit |
| E5 | 6번째 키 추가 `{ ...valid, extra: 50 }` → `.strict()` 거부 확인 | Unit |
| E6 | GET /agents 목록에서 NULL→`{}` 변환 확인 | Integration |
| E7 | GET /agents/:id에서 NULL→`{}` 변환 확인 | Integration |
| E8 | PATCH personality_traits: null → 성격 초기화 확인 | Integration |
| E9 | 마이그레이션 후 기존 에이전트 CRUD 정상 (AC-6 회귀) | Integration |
| E10 | 경계값: 0, 100, -1, 101 → 0/100 통과, -1/101 거부 | Unit |

---

## Cross-talk 요약

- 아직 다른 Critic의 리뷰 미수신. Winston(Critic-A)의 아키텍처/API 관점 리뷰 대기 중.
- D33/E12 참조 정합성은 내가 직접 architecture.md에서 검증 완료 — 정확함.

---

**결론:** 스펙 품질은 전반적으로 좋음. D6 리스크 영역에서 DB 레벨 방어 관련 4개 이슈가 있으나, 모두 Dev Notes 보강이나 제약조건 명명으로 해결 가능. **PASS (7.75/10)** 이나 이슈 #1(AR31 불완전)과 #7(CHECK 명명)은 구현 전 반영 권장.
