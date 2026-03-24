# Critic-A Review — Story 22.2: Voyage AI SDK Integration

**Reviewer**: Winston (Architect)
**Date**: 2026-03-24
**Story**: `_bmad-output/implementation-artifacts/stories/22-2-voyage-ai-sdk-integration.md`
**Phase**: A (Story Spec Review)

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 8/10 | 파일 경로·줄 번호·함수명·backoff 지연값 전부 명시. test 파일 google 참조가 실제보다 적게 나열됨 (batch-collector 8곳인데 2곳만 기재) |
| D2 완전성 | 15% | 7/10 | 핵심 AC 9개 + 8 Tasks 전부 커버. **models.yaml** (Gemini 2개 + fallbackOrder) 미포함. `toCredentialProvider()` 함수 미언급 |
| D3 정확성 | 25% | 6/10 | **voyageai SDK import 오류** — `import VoyageAI from 'voyageai'` + `new VoyageAI()` 잘못됨. 실제: `import { VoyageAIClient } from 'voyageai'` + `new VoyageAIClient()`. LLMProviderName 자기모순 (Task 4.4 ↔ Impact 섹션) |
| D4 실행가능성 | 20% | 8/10 | Before/After 패턴 명확. 코드 스니펫 포함. Task 단위 분해 우수. SDK 오류 수정 후 바로 구현 가능 |
| D5 일관성 | 15% | 7/10 | Architecture D31·E18·AR76 정합. **Task 4.4 ("keep google") vs LLM Provider System Impact ("remove google") 자기모순** 해결 필요 |
| D6 리스크 | 10% | 8/10 | 차원 불일치 기간 인지·scope containment "What NOT to Do" 우수. models.yaml dead config → 예상치 못한 fallback 리스크 미언급 |

### 가중 평균: 7.15/10 ✅ PASS (barely)

---

## 이슈 목록

### 🔴 CRITICAL — Must Fix Before Dev

#### Issue 1: [D3] voyageai SDK API 오류 — 잘못된 import/class name

**현재 (spec Task 2.2 + Dev Notes):**
```typescript
import VoyageAI from 'voyageai'
const client = new VoyageAI({ apiKey })
```

**실제 voyageai@0.2.1 API (npm + GitHub 검증 완료):**
```typescript
import { VoyageAIClient } from 'voyageai'
const client = new VoyageAIClient({ apiKey })
```

`VoyageAI`는 default export가 아니라 namespace(타입). Client class는 `VoyageAIClient` named export.
나머지 API(`client.embed({ input, model })`, `result.data[0].embedding`)는 정확함.

**수정 위치**: Task 2.2, Task 2.3, Dev Notes "Voyage AI SDK API" 코드블록, Dev Notes "Architecture References" D31 참조 설명.

> ⚠️ 이것은 architecture D31 원본도 동일하게 틀림. 스토리만의 문제가 아니라 상위 문서 오류 전파.

#### Issue 2: [D5] LLMProviderName 자기모순 — 두 섹션이 상반된 지시

- **Task 4.4** (line 142-145): `CRITICAL: Do NOT remove 'google' from LLMProviderName`
- **LLM Provider System Impact** (line 326): `change to 'anthropic' | 'openai'`

이 둘은 정면 충돌. 구현자가 어느 쪽을 따를지 판단 불가.

**올바른 결정**: **Task 4.4 유지** (keep `'google'`). 이유:
1. DB에 `provider='google'` 레코드 존재 (costs, activity_logs)
2. Dashboard aggregation에서 historical data 표시 필요
3. TypeScript type 제거 시 `as` 캐스트 전부 깨짐

**수정**: "LLM Provider System Impact" 섹션을 Task 4.4와 일치하도록 수정. `'google'` 제거 권고 문장 삭제.

---

### 🟡 MAJOR — Should Fix

#### Issue 3: [D2] models.yaml 미포함 — Dead Gemini Config

`packages/server/src/config/models.yaml`에 여전히:
```yaml
- id: gemini-2.5-pro
  provider: google
- id: gemini-2.5-flash
  provider: google

fallbackOrder: [anthropic, openai, google]
```

**영향:**
1. `getFallbackModels('claude-sonnet-4-6')` → Gemini 모델 포함 가능 → `resolveProvider` → `'google'` → factory throws
2. `fallbackOrder`에 dead provider 포함 → 불필요한 fallback 시도 + 에러
3. config/UI에 "Gemini 2.5 Pro" 표시 가능 → 사용자 혼란

**권장**:
- Task 4에 sub-task 추가: models.yaml에서 Gemini 모델 2개 제거 + `fallbackOrder: [anthropic, openai]`로 축소
- Files Changed 테이블에 `models.yaml | MODIFY` 추가

#### Issue 4: [D2] `toCredentialProvider()` 함수 (llm-router.ts:83-85)

```typescript
function toCredentialProvider(provider: LLMProviderName): string {
  if (provider === 'google') return 'google_ai'
  return provider
}
```

이 함수는 `'google'` provider를 credential vault의 `'google_ai'` 키로 매핑. GoogleAdapter 제거 후 이 함수는 dead code가 됨. 삭제하거나 정리 필요.

**권장**: Task 4에 4.7로 추가 — `toCredentialProvider()`에서 google 분기 제거하거나 함수 자체 인라인화. 또는 "dead code로 남겨도 무해" 판단이면 Dev Notes에 명시.

---

### 🟢 MINOR — Nice to Fix

#### Issue 5: [D1] test 파일 google 참조 불완전 나열

Spec Task 7.7 `batch-collector.test.ts` "lines 63, 822"라고 했으나, 실제 google 참조: lines **49, 63, 69, 297, 377, 381, 449, 822** (8곳).

`cost-recording.test.ts` "line 546"이지만 추가로 lines **38-39, 48, 52, 556** (Gemini 모델 mock config 포함).

`provider-fallback.test.ts` "line 340"이지만 추가로 lines **167-177, 210, 215, 253** (circuit breaker + fallback 시나리오).

이 줄들을 모두 나열할 필요는 없지만, "등 다수" 또는 "grep 결과 전체 처리" 정도로 표현하면 구현 시 누락 방지.

#### Issue 6: [D6] 차원 불일치 기간 — 구체적 실패 함수 미열거

"Dimension Mismatch Warning" 섹션이 `embedDocument`, `embedAllDocuments`, `saveToSemanticCache`, `checkSemanticCache` 4개 함수가 22.2→22.3 사이에 실패한다는 것을 명시하면 더 좋음. 특히 **semantic_cache 테이블도 VECTOR(768)**이라 semantic cache도 깨진다는 점이 빠져 있음.

현재 서술: "embedding operations will fail dimension validation"
권장 서술: "embedDocument, embedAllDocuments, saveToSemanticCache, checkSemanticCache — 4개 함수가 1024d→VECTOR(768) INSERT 시 PG 에러 → null 반환. semantic_cache.query_embedding도 VECTOR(768)이므로 semantic cache 읽기/쓰기 모두 비활성화됨"

---

## Dev가 요청한 6개 검증 답변

| # | 질문 | 답변 |
|---|------|------|
| 1 | Package swap scope (embedding-service + google.ts) | ✅ 정확. 둘 다 `@google/generative-ai` import. 단, **models.yaml Gemini 엔트리도 scope에 포함해야 함** (Issue 3) |
| 2 | LLMProviderName 'google' 유지 결정 | ✅ Task 4.4 유지가 올바름. **BUT "LLM Provider System Impact" 섹션이 반대 지시** (Issue 2) |
| 3 | Dimension mismatch → runtime crash? | ❌ **crash는 아님** (VEC-2 null fallback). 다만 embedding 4개 함수 전부 silent fail. semantic_cache 포함. Non-prod이므로 수용 가능 |
| 4 | Caller migration 완전성 (5 source + 1 engine) | ✅ 정확. `grep` 검증 완료. 누락 없음 |
| 5 | Exponential backoff 아키텍처 정합 | ✅ AR76 "1s→2s→4s→max 30s" 정합. 8s·16s는 spec 추가이나 max 30s cap 범위 내. 문제 없음 |
| 6 | voyageai SDK API 정확성 | 🔴 **import/class name 오류** (Issue 1). `embed()` 메서드·`data[0].embedding` 응답은 정확 |

---

## Cross-talk 요약

- Quinn (Critic-B)에게: `toCredentialProvider()` dead code 잔류 → 보안 리뷰 시 google credential 경로가 아직 호출될 수 있는지 확인 요청
- John (Critic-C)에게: models.yaml Gemini 엔트리 잔류 → 프로덕트 관점에서 Admin UI "모델 선택" 드롭다운에 Gemini가 표시되는지 확인 요청

### Post Cross-talk Update (Quinn + John 피드백 반영)

**Quinn 발견 — 🔴 CRITICAL 추가:**
- **`batch-collector.ts` 누락**: `flushGoogleFallback()` (line 440-479)이 `createProvider('google', apiKey)`를 직접 호출. GoogleAdapter 제거 후 runtime throw. Files Changed에도 Tasks에도 없음. 내 초기 리뷰에서 놓친 항목 — D2 완전성 점수 하향 필요.
- 이 발견으로 D2를 7→6으로 하향, 가중 평균 7.15→7.00으로 조정. 여전히 borderline PASS이나 수정 없이는 FAIL에 근접.

**John 질문 답변:**
1. LLMProviderName: Task 4.4 (keep 'google') 동의 — 내 리뷰 Issue 2와 일치
2. D31 `Promise<number[]>` vs spec `Promise<number[] | null>`: **Valid deviation**. D31은 happy-path 의사코드. VEC-2가 명시적으로 "failure → null, not thrown error" 요구. 아키텍처 addendum 불필요 — VEC-2가 상위 규칙.
3. D31 `credentials.apiKey` vs vault `api_key`: **추가 정확성 이슈**. Credential vault의 `PROVIDER_SCHEMAS`는 snake_case(`api_key`) 반환. D31 코드가 `credentials.apiKey`(camelCase) 사용 — 실제로는 `credentials.api_key`여야 함. 또 다른 D31 상류 문서 오류.

**점수 조정:**

| 차원 | 초기 | 조정 | 이유 |
|------|------|------|------|
| D2 완전성 | 7 | 6 | batch-collector.ts 누락 (Quinn 발견) |
| D3 정확성 | 6 | 5 | SDK import + credentials.apiKey camelCase 오류 추가 (John 발견) |

**조정 가중 평균**: D1:8×15 + D2:**6**×15 + D3:**5**×25 + D4:8×20 + D5:7×15 + D6:8×10 = 1.2+0.9+**1.25**+1.6+1.05+0.8 = **6.80/10 ❌ FAIL**

**판정 변경**: CONDITIONAL PASS → **FAIL**. batch-collector.ts 누락 + SDK 정확성 이슈 누적으로 7.0 미달.

### Fallback Chain Deep-Dive (Quinn 추가 분석 후 검증)

models.yaml 이슈를 🟡→🔴 CRITICAL로 격상. 이유:

`llm-router.ts` fallback loop (line 157-208) 전체 경로:
1. `getFallbackModels()` → `fallbackOrder: [anthropic, openai, google]`에서 Gemini 모델 포함
2. `resolveProvider('gemini-2.5-pro')` → `'google'`
3. `getAdapter('google', companyId)` → `toCredentialProvider('google')` → `'google_ai'`
4. `getCredentials(companyId, 'google_ai')` → 저장된 자격증명 불필요하게 복호화
5. `createProvider('google', apiKey)` → throws
6. `normalizeLLMError` → `{ code: 'unknown', retryable: false }`
7. `circuitBreaker.recordFailure('google')` → 의미 없는 실패 기록

**영향**: 매 fallback 시도마다 credential vault 복호화 + circuit breaker 오염. 서버 crash는 아니지만 모니터링 신뢰도 하락 + 불필요한 latency.

**수정**: models.yaml에서 Gemini 엔트리 2개 + `fallbackOrder` 'google' 제거 = runtime path 자체를 차단.

---

## Verification Round — Post-Fixes (2026-03-24)

### 검증 체크리스트

| # | 이슈 | 수정 확인 | 검증 |
|---|------|----------|------|
| W1 🔴 | voyageai SDK: `VoyageAIClient` named export | Task 2.2 (line 89), SDK API block (lines 265-266), D31 ref (line 220) | ✅ 4곳 전부 `VoyageAIClient` |
| W2 🔴 | LLMProviderName contradiction | "LLM Provider System Impact" (lines 354-361) | ✅ Task 4.4와 일치 — "must NOT be changed" |
| Q1 🔴 | batch-collector.ts 누락 | Task 4.7 (lines 151-154), Files Changed (line 290) | ✅ flushGoogleFallback 삭제 + routing 제거 |
| Q2 🔴 | models.yaml 누락 | Task 4.8 (lines 155-159), Files Changed (line 291) | ✅ Gemini 2개 삭제, fallbackOrder 축소 |
| W4 🟡 | toCredentialProvider dead code | Task 4.6 (lines 148-150) | ✅ Dead code comment + backward compat 근거 |
| J3 🟡 | credentials.api_key snake_case | Task 2.2 (line 88) | ✅ `credentials.api_key` + extractApiKey robustness |
| W7 🟢 | Test file refs 불완전 | Task 7.7 (lines 196-207) | ✅ 대폭 확장 — 11개 test 파일 구체적 나열 |
| W8 🟢 | Dimension mismatch 함수 미열거 | Dependencies (line 386) | ✅ 5개 affected 기능 명시 |
| J2 | Deployment steps 누락 | Lines 320-327 | ✅ 신규 섹션 추가 |
| J5 | 22.3 sequence constraint | Dependencies (line 386) | ✅ MUST immediately follow + 영향 함수 |
| Q5 | API key logging risk | Task 2.2 (line 92) | ✅ 로깅 가이드 추가 |

### John 플래그 검증

John이 "SDK API reference section (lines 264-265) still has the old VoyageAI default import"라 했으나, 현재 파일 lines 265-266 확인 결과:
```typescript
import { VoyageAIClient } from 'voyageai'
const client = new VoyageAIClient({ apiKey: 'xxx' })
```
**정확함**. John이 중간 버전을 본 것으로 판단. Non-issue.

### Verified 차원별 점수

| 차원 | 가중치 | 초기 | 조정(cross-talk) | 검증 후 | 근거 |
|------|--------|------|-----------------|---------|------|
| D1 구체성 | 15% | 8 | 8 | **9** | Task 7.7 대폭 확장, deployment steps 추가, dimension 함수 열거 |
| D2 완전성 | 15% | 7→6 | 6 | **9** | batch-collector + models.yaml + 22.3 constraint + deployment 모두 추가 |
| D3 정확성 | 25% | 6→5 | 5 | **8** | VoyageAIClient 수정, credentials.api_key 수정. toCredentialProvider "backward compat" 근거 약간 부정확(dashboard가 아닌 LLM call 경로)이나 사소 |
| D4 실행가능성 | 20% | 8 | 8 | **9** | 코드 스니펫 전부 정확, caller simplification 패턴 명확, deployment guide 추가 |
| D5 일관성 | 15% | 7 | 7 | **9** | LLMProviderName 모순 해결, 모든 섹션 정합 |
| D6 리스크 | 10% | 8 | 8 | **9** | fallback chain 리스크 해결, dimension mismatch 기간 명시, 로깅 보안 추가 |

### Verified 가중 평균: 8.75/10 ✅ PASS

`9×0.15 + 9×0.15 + 8×0.25 + 9×0.20 + 9×0.15 + 9×0.10 = 1.35 + 1.35 + 2.00 + 1.80 + 1.35 + 0.90 = 8.75`

### 최종 판정: **[Verified] 8.75/10 — PASS**

10개 이슈 (3 CRITICAL, 4 HIGH, 3 SHOULD) 전부 해결됨. 3 critic cross-talk 피드백 완전 통합. Story spec은 이제 구현 준비 완료.

---

## 최종 판정

**7.15/10 — CONDITIONAL PASS**

🔴 Issue 1 (SDK import 오류) + Issue 2 (LLMProviderName 모순) 수정 필수.
🟡 Issue 3 (models.yaml) 강력 권고.
🟢 Issue 4-6은 optional improvement.

Issue 1+2 수정 후 재검증 시 D3→8, D5→9 예상 → 가중 평균 ~8.0으로 상승.
