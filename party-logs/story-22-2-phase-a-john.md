# Phase A: PM Critic Review — Story 22.2

**Reviewer:** John (PM, Critic-C)
**Date:** 2026-03-24
**Story:** `_bmad-output/implementation-artifacts/stories/22-2-voyage-ai-sdk-integration.md`
**Outcome:** CONDITIONAL PASS — 5 issues to fix (updated after cross-talk)

---

## Critic-C Review — Story 22.2: Voyage AI SDK Integration

### 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 20% | 모든 파일 경로, 패키지 버전(`voyageai@0.2.1`), 함수 시그니처, retry 딜레이(1s→2s→4s→8s→16s), rate limit(300RPM/1M tok), batchSize=32 전부 명시. "적절한" 같은 추상 표현 0건. SDK API 예시 코드 포함. |
| D2 완전성 | 6/10 | 20% | 핵심 5개 caller 전부 식별, GoogleAdapter 제거 경로 완전, 테스트 7개 서브태스크 포괄. 그러나: (1) `models.yaml` 미포함 — gemini 모델 엔트리 + `fallbackOrder`에서 `google` 미제거, (2) 배포 시 `voyage_ai` credential 설정 요구사항 누락, (3) LLMProviderName 자기모순, (4) Admin UI 영향 미언급. |
| D3 정확성 | 7/10 | 15% | caller grep 5건 전부 일치 확인, 파일 존재 확인, API 시그니처 정확. 그러나: Task 4.4("google 유지")와 "LLM Provider System Impact"("google 제거") 직접 모순. `credentials.apiKey`(camelCase) vs 실제 vault 리턴 `api_key`(underscore) 불일치. |
| D4 실행가능성 | 9/10 | 15% | backoff 코드 스니펫, SDK 사용법, before/after caller 패턴, Files Changed 테이블 포함. 복붙 수준. Task 순서도 논리적(install→create→migrate callers→remove→test). |
| D5 일관성 | 7/10 | 10% | Story 22.1 구조 계승, kebab-case 파일명, AC 넘버링 일관. 내부 모순(Task 4.4 vs LLM Provider Impact)이 일관성을 깨뜨림. |
| D6 리스크 | 6/10 | 20% | Dimension Mismatch Warning 섹션 우수. 0.x SDK 정확 핀 전략 적절. Rate limit backoff 전략 좋음. 그러나: (1) `models.yaml` `fallbackOrder`에 `google` 남아 있으면 fallback 시 throw 발생 — 런타임 크래시 리스크, (2) 배포 후 credential 부재로 인한 embedding 전면 실패 리스크 미언급, (3) 768→1024 DB 쓰기 시 PostgreSQL이 어떤 에러를 던지는지 미명시. |

### 가중 평균: 7.2/10 ✅ PASS (revised after cross-talk)

---

### 이슈 목록

#### 1. **[D3 정확성 — MUST FIX]** LLMProviderName 자기모순

**위치:** Task 4.4 (line 142-145) vs "LLM Provider System Impact" 섹션 (line 322-327)

**문제:**
- Task 4.4: *"CRITICAL: Do NOT remove 'google' from LLMProviderName"* — historical DB records(`costs`, `activity_logs`)에 `provider = 'google'`이 있으므로 유지
- LLM Provider System Impact: *"change to 'anthropic' | 'openai'"* — google 제거 지시

두 지시가 정반대. 개발자가 어느 걸 따라야 하는지 혼란.

**판단:** Task 4.4가 맞음. DB에 `'google'` 레코드가 실존하므로 타입에서 제거하면 `DashboardUsageDay`, `BatchFlushResult`, `LLMError` 등의 타입 캐스트가 깨짐. `dashboard.ts:183`의 `allProviders` 배열도 `'google'`을 포함.

**수정 방법:** "LLM Provider System Impact" 섹션(line 322-327) 전체 삭제하거나, Task 4.4와 일치하도록 수정: *"LLMProviderName은 'google'을 유지한다. Factory만 throw로 차단."*

---

#### 2. **[D2 완전성 — SHOULD FIX]** 배포/설정 요구사항 누락

**문제:** `voyage_ai: ['api_key']`를 PROVIDER_SCHEMAS에 추가하지만, 기존 회사들이 Admin UI에서 `voyage_ai` credential을 설정해야 한다는 점이 어디에도 명시되지 않음.

22.2 완료 후 → 기존 `google_ai` credential은 더 이상 embedding에 사용되지 않음 → `getCredentials(companyId, 'voyage_ai')` 호출 → credential 없음 → 모든 embedding 실패 → `null` 반환 → semantic search 전면 fallback to keyword.

**v3가 프로덕션 전이므로 블로커는 아님**, 하지만 개발/테스트 시 "왜 embedding이 안 되지?"라는 혼란 방지를 위해 명시 필요.

**수정 방법:** "Dev Notes" 하단에 추가:
```markdown
### Deployment Steps
- After code deployment, add Voyage AI API key via Admin UI:
  Settings → Credentials → Add Provider → voyage_ai → api_key: <your-voyage-key>
- Until this is done, all embedding operations will gracefully return null
```

---

#### 3. **[D3 정확성 — SHOULD FIX]** credential 필드명 불일치

**위치:** Task 2.2 (line 87-88), Architecture D31 (line 531)

**문제:** Architecture D31 reference는 `credentials.apiKey` (camelCase)를 사용하지만, credential vault 실제 구현은 PROVIDER_SCHEMAS 키 이름 그대로 반환 → `voyage_ai: ['api_key']` 설정이면 `credentials.api_key` (underscore)가 올바름.

현재 코드의 `extractApiKey()` 헬퍼가 이 불일치를 처리: `credentials.api_key || credentials.apiKey || Object.values(credentials)[0]`

**수정 방법:** Task 2.2에 명시적으로 추가:
```
- Access key via `credentials.api_key` (underscore — matches PROVIDER_SCHEMAS field name)
- Or carry over `extractApiKey()` logic internally for robustness
```

---

#### 4. **[D2 완전성 / D6 리스크 — MUST FIX]** `models.yaml` 누락 (cross-talk: Quinn)

**문제:** `packages/server/src/config/models.yaml`이 Files Changed 테이블에 없음. 현재 상태:
```yaml
# models.yaml
  - id: gemini-2.5-pro
    provider: google
  - id: gemini-2.5-flash
    provider: google
fallbackOrder: [anthropic, openai, google]
```

GoogleAdapter 삭제 후:
- **fallbackOrder 런타임 리스크**: anthropic+openai 둘 다 실패 시 → `google` fallback 시도 → `createProvider('google', ...)` throws → `llm-router.ts`의 try/catch가 잡아주긴 하지만, 불필요한 에러 로깅 + 실질적 fallback 체인 단절
- **gemini model entries**: 만약 DB에 `modelName = 'gemini-2.5-pro'`인 에이전트가 있으면 → `resolveProvider()` returns `'google'` → factory throw → 해당 에이전트 완전 불능

**수정 방법:**
- Task 4에 추가: `models.yaml` — gemini 모델 엔트리 2개 삭제 (또는 주석 처리 + "removed in 22.2" 표기)
- `fallbackOrder: [anthropic, openai]` — google 제거
- Task 7에 추가: `models.yaml` 관련 테스트 업데이트 (provider count, fallback chain length 등)
- Files Changed 테이블에 `models.yaml | MODIFY | Remove gemini entries + fallbackOrder google` 추가

---

#### 5. **[D6 리스크 — SHOULD FIX]** 22.2→22.3 gap 가시성 부족 (cross-talk: Quinn)

**문제:** "Dimension Mismatch Warning" 섹션이 존재하지만, 실제 런타임에서 이 gap이 어떻게 표현되는지 불명확:
- `voyage-embedding.ts`의 `getEmbedding()`: 1024d 벡터 생성 성공
- `updateDocEmbedding()`: `SET embedding = ${vectorStr}::vector` 실행 → PostgreSQL이 VECTOR(768)에 1024d 저장 시도 → **dimension mismatch ERROR**
- `embedDocument()`: catch 블록에서 `return false` → 조용한 실패

**제품 리스크:** 22.3이 지연되면 → 모든 semantic search = keyword fallback, semantic cache = 미작동, 새 문서 = embedding 없음. 기능적으로는 동작하지만 검색 품질 저하.

**수정 방법:**
- Dev Notes에 추가: "22.3 이전에는 embedding 실패 예상됨. 로그에 `embedding dimension mismatch` 경고가 보이면 정상."
- `voyage-embedding.ts`에 서비스 초기화 시 WARNING 로그 추가를 권장: `"⚠️ EMBEDDING_DIMENSIONS (1024) != schema VECTOR(768) — embeddings will fail until Story 22.3 migration"`
- Story 22.3을 22.2 직후 필수 시퀀스로 명시 (현재 Dependencies 섹션은 방향만 명시, 시간 순서 미명시)

---

### 긍정적 포인트

1. **API 단순화 패턴 우수** — Before/After 비교(4줄→1줄)가 명확하고, 모든 caller의 credential 로직 내재화는 올바른 방향
2. **Scope 경계 명확** — "What NOT to Do" 7항목이 Story 22.3과의 책임 분리를 확실히 함
3. **Dimension Mismatch Warning** — 의도적 결정의 근거와 수용 가능한 이유 3가지 제시 (프로덕션 전, 즉시 후속, 관심사 분리)
4. **Test 전략 포괄적** — 7개 서브태스크, mock 전략, dimension assertion, backoff 테스트까지 커버
5. **Files Changed 테이블** — 27개 파일의 Action(CREATE/MODIFY/DELETE/NO CHANGE) 분류 탁월

### Cross-talk 요약

- **quinn (Critic-B)**: Score 5.5/10 FAIL. `models.yaml` 누락, runtime crash 3건, AC gap 지적. → 본 리뷰에 Issue #4, #5로 반영. `models.yaml` 누락은 MUST FIX로 승격.
- **winston (Architect)**: 리뷰 대기 중 — D31 return type 차이, LLMProviderName, credential field name 의견 요청

### PM 판단: Scope & Delivery

**스토리 분할 불필요.** GoogleAdapter 제거를 분리하면 Gemini + Voyage 이중 경로가 공존하는 위험한 중간 상태 발생. 확정 결정 #1 (Gemini 전면 금지)에 따라 한 번에 clean-cut이 올바른 전략. 단, `models.yaml` 추가 후 파일 수 28→29개 — 작업량은 1일(tight) ~ 1.5일(safe) 예상.

**22.3 순서 필수.** 22.2→22.3 사이 gap에서 embedding 전면 실패. 다른 스토리 끼워넣기 금지. Dependencies 섹션에 "22.3 MUST immediately follow 22.2" 명시 필요.

---

## Post-Fix Verification (2026-03-24)

### 수정 확인

| Issue | Status | Evidence |
|-------|--------|----------|
| #1 LLMProviderName 모순 | ✅ Fixed | "LLM Provider System Impact" 섹션 재작성 (line 351-359). Task 4.4와 일치. |
| #2 배포 단계 누락 | ✅ Fixed | "Deployment Steps (Post-Merge)" 섹션 추가 (line 319-327). |
| #3 credential 필드명 | ✅ Fixed | Task 2.2 (line 88)에 `credentials.api_key` + `extractApiKey()` 명시. |
| #4 models.yaml 누락 | ✅ Fixed | Files Changed 테이블에 `models.yaml \| MODIFY` 추가 (line 290). |
| #5 22.3 순서 | ⚠️ Partial | Dimension Mismatch Warning (line 332)에 "immediately follows" 언급. Dependencies 섹션은 미변경. 비차단. |

### Cross-talk 반영

- **Winston**: VoyageAIClient import 수정 확인 (Task 2.2 line 89). SDK API reference 섹션 (line 264-265)은 여전히 `VoyageAI` — 비차단 불일치.
- **Quinn**: batch-collector.ts Files Changed 추가 확인 (line 289). 테스트 제안(credential 부재 테스트, dimension gap 테스트)은 Testing Strategy에 미반영 — 비차단, 구현 시 자연스럽게 추가될 항목.

### 수정 후 점수

| 차원 | Before | After | 변경 근거 |
|------|--------|-------|----------|
| D1 구체성 | 9 | 9 | 변경 없음 |
| D2 완전성 | 6 | 7 | models.yaml + deployment steps 추가 |
| D3 정확성 | 7 | 7 | 모순 해결, credential 명시. SDK reference 불일치 잔존 |
| D4 실행가능성 | 9 | 9 | 변경 없음 |
| D5 일관성 | 7 | 8 | 내부 모순 해결 |
| D6 리스크 | 6 | 7 | 배포 단계 + models.yaml 리스크 해소 |

### 최종 가중 평균: 7.8/10 ✅ VERIFIED PASS
