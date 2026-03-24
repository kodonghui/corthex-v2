# Stage 6 Step 3: Create Stories — Critic-B (Quinn) Review

## Review Target
- **File:** `_bmad-output/planning-artifacts/epics-and-stories.md` lines 1311-2792
- **Scope:** 68 stories across 8 epics (22-29), 5 sprints
- **Focus:** QA + Security (sanitization chains, Go/No-Go gates, NFR coverage, test specificity)

---

## Critic-B Review — Step 3: Create Stories

### 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 대부분 탁월: 파일 경로(`0062_add_personality_traits.sql`), Zod 스키마, 함수 시그니처(`enrich(agentId, companyId)`), 구체적 수치(cosine ≥0.85, ≤200KB). MEM-6 L3 "prompt hardening" 기법 미정의, TOOLSANITIZE 확장 메커니즘 미정의, 평가 카테고리 미정의가 감점 요인. |
| D2 완전성 | 7/10 | 68 스토리, 14 Go/No-Go 게이트 전부 매핑됨. 3개 보안 체인 전용 스토리 있음. **그러나** NFR-O6(Soul reflection 품질 테스트), NFR-COST1/COST2(인프라/Voyage 비용 검증), NFR-O8(NEXUS 시간) 스토리 AC에 없음. |
| D3 정확성 | 8/10 | AR 참조 정확, 기술 선택 아키텍처와 일치, Go/No-Go 번호 AR62와 일치. **그러나** Story 22.4 "Given" clause가 사실과 불일치 — secureHeaders()+cors() 이미 존재하는데 "no security headers"로 기술. |
| D4 실행가능성 | 7/10 | 대부분 AC에서 바로 코드 작성 가능. MEM-6 "prompt hardening"과 TOOLSANITIZE "extensible framework"는 설계 결정 없이 구현 불가. 나머지 스토리는 복붙 수준의 구체성. |
| D5 일관성 | 8/10 | Step 1/2와 강한 정합성. AR60 격리 3개 체인 모두 일관. 네이밍 컨벤션 준수. NFR-O10이 에픽 개요에만 있고 스토리 AC에 없는 점 감점. |
| D6 리스크 | 7/10 | 강점: 3-chain 독립성, Go/No-Go 포괄적, cross-sprint 테스트 범위 문서화. 약점: 스프라이트 에셋 파이프라인 갭(29.4→29.8), 연결 드롭 처리 불완전(29.2), 어드바이저리 락 실패 경로 미정의(28.4), 비용 모니터링 검증 없음. |

### 가중 평균: 7.40/10 ✅ PASS

계산: (8×0.10) + (7×0.25) + (8×0.15) + (7×0.10) + (8×0.15) + (7×0.25) = 0.80 + 1.75 + 1.20 + 0.70 + 1.20 + 1.75 = **7.40**

_Updated after cross-talk with john (Sprint 2 QA load, Story 23.19) and dev (Story 22.4 Given clause, Story 25.5 file list, Story 28.10 test template). D3 adjusted 9→8 due to Story 22.4 inaccuracy._

---

### 이슈 목록

#### CRITICAL (2)

**I1. [D1/D4] Story 28.2 — MEM-6 Layer 3 "prompt hardening" 기법 미정의**

Story 28.2 AC는 "Layer 3: prompt hardening (AR46)"이라고만 명시. PER-1은 "template regex"로 구체화, TOOLSANITIZE는 "10 regex patterns"로 구체화됨. MEM-6만 유일하게 구현 기법이 없음. 개발자가 "prompt hardening"만 보고 무엇을 구현해야 하는지 판단 불가.

**Fix:** Layer 3의 구체적 기법 명시 필요. 예: "known prompt injection pattern regex matching (minimum 10 patterns: system prompt override, role confusion, instruction injection, delimiter abuse, etc.)" 또는 "keyword blocklist + regex hybrid".

**I2. [D1/D4] Story 27.1 — TOOLSANITIZE 확장성 메커니즘 미정의**

AC는 "extensible framework: patterns can be added without code changes"라고 하지만, 구체적 메커니즘이 없음. JSON config 파일? DB 테이블? 환경 변수? 이 아키텍처 결정이 구현에 직접 영향.

**Fix:** 확장 메커니즘 명시. 예: "patterns stored in `config/tool-sanitizer-patterns.json`, loaded at startup, hot-reloadable via Admin API" 또는 "patterns in `sanitizer_patterns` DB table with Admin CRUD endpoints".

---

#### HIGH (5)

**I3. [D2] NFR-O6 (Soul reflection rate) 스토리 AC에 없음**

NFR-O6은 "3 rule scenarios × 10 requests = 30 tests, 24/30+ = 80%+ pass"를 요구. Epic 24에 이 검증을 포함하는 스토리가 없음. Story 24.8 (Sprint 1 exit)은 injection 테스트만 포함, reflection 품질 테스트 미포함.

**Fix:** Story 24.8 AC에 추가: "Soul reflection rate: 3 rule scenarios (prohibition compliance, tool restriction, scope boundary) × 10 requests = 30 tests, 24/30+ pass (NFR-O6)"

**I4. [D6] Story 29.4 → 29.8 스프라이트 에셋 파이프라인 갭**

Story 29.4는 "32×32px pixel art character" 스프라이트를 렌더링해야 하지만, 스프라이트 승인은 Story 29.8에서 진행. Story dependency principle에 따라 29.4는 29.8 이전에 완료 가능해야 함. 플레이스홀더 스프라이트 전략이나 에셋 소스가 미정의.

**Fix:** Story 29.4 AC에 추가: "placeholder sprites (colored rectangles or basic shapes) used for development. Final AI-generated sprites integrated in Story 29.8" 또는 에셋 생성을 29.4 AC에 포함.

**I5. [D1] Story 28.10 — 역량 평가 카테고리 미정의**

"minimum 10 tasks across 5 categories"에서 5 categories가 무엇인지 미정의. 또한 "3+ repeated iterations"의 iteration 정의 불명확 — 단일 태스크 실행? 전체 코퍼스 실행?

**Fix:** 카테고리 예시 명시: "5 categories: information retrieval, creative writing, code analysis, multi-step reasoning, tool usage" + iteration 정의: "each iteration = full corpus run (all 10 tasks)"

**I6. [D6] Story 26.5 — 마케팅 게이트 기준 모호**

"Sprint 2 exit marketing verification passes"는 순환 정의. NFR-P17 타이밍(image ≤2min, posting ≤30s) 외에 구체적 측정 가능한 성공 기준 부족. "full pipeline" 성공이란 무엇인가?

**Fix:** 구체적 기준 추가: "full pipeline success = topic input → AI content generation → human approval → at least 1 platform posting completed without error. Fallback engine test: primary engine deliberately disabled → secondary engine completes generation."

**I7. [D2] NFR-COST1 ($10/month) 및 NFR-COST2 ($5/month Voyage) 검증 스토리 없음**

비용 제약이 스토리 AC에 없음. Sprint exit에 비용 검증이 포함되어야 함. NFR-COST3(reflection $0.10/day)만 Story 28.4에 포함됨.

**Fix:** Story 22.6 (Pre-Sprint exit) AC에 추가: "infrastructure cost estimate documented: VPS + Neon Pro + Voyage AI projected ≤$10/month (NFR-COST1), Voyage embedding budget ≤$5/month (NFR-COST2)"

---

#### MEDIUM (4)

**I8. [D6] Story 28.4 — advisory lock 실패 경로 미정의**

`pg_try_advisory_xact_lock` 실패 시 동작 미정의. Skip + next cycle? Log + alert? 동시 실행 방지는 명시했으나 실패 처리가 없음.

**Fix:** AC에 추가: "lock acquisition failure → skip this cycle, log warning, retry next scheduled run"

**I9. [D6] Story 29.2 — 연결 드롭 프로토콜 불완전**

"oldest dropped + client reconnect notice" — WebSocket close code 미지정, 클라이언트 재연결 backoff 전략 없음.

**Fix:** AC에 추가: "excess connections closed with code 4001 (capacity exceeded). Client implements exponential backoff: 1s, 2s, 4s, max 30s"

**I10. [D1] Story 28.2 — MEM-6 Layer 4 "content classification" 기법 미정의**

Layer 4가 ML 기반 분류인지, regex 패턴 매칭인지, 키워드 블록리스트인지 불명확. 기법 선택이 구현 복잡도에 직접 영향.

**Fix:** "content classification via keyword blocklist + regex pattern matching (same approach as TOOLSANITIZE, not ML — to keep complexity low)"

**I11. [D5] NFR-O10 (Reflection cron stability) — 에픽 개요에만 참조, 스토리 AC에 없음**

Epic 28 개요에 NFR-O10이 Key NFR로 나열되지만, Story 28.4나 28.11의 AC에서 직접 참조하지 않음.

**Fix:** Story 28.4 references에 NFR-O10 추가, AC에 "advisory lock + Voyage API rate compliance verified (NFR-O10)" 추가.

---

#### LOW (5)

**I12. [D3] Story 22.4 — "Given" clause 사실과 불일치** _(cross-talk: dev)_

Story 22.4 AC는 "Given the Hono server currently has no security headers"라고 하지만, `packages/server/src/index.ts:102`에 `secureHeaders()`, `:115`에 `cors()` 이미 존재. 스토리는 "no headers → add" 가 아니라 "existing headers → harden" (HSTS 추가, CSP 강화, 파일 업로드 검증)으로 수정 필요.

**Fix:** "Given the Hono server has basic security headers (secureHeaders + CORS)" → "When security hardening is applied" → "Then HSTS, CSP tightening, file upload validation added on top of existing middleware"

**I13. [D2] Story 25.5 — 삭제 대상 파일 목록 누락** _(cross-talk: dev)_

"existing workflow routes removed" + "no orphaned imports or dead code"가 AC이지만, 구체적으로 어떤 파일(서버 7+개, 테스트 20+개)을 삭제해야 하는지 목록 없음. QA 검증 시 "완전 삭제" 확인 불가.

**Fix:** AC에 삭제 대상 파일/디렉토리 패턴 추가: "All files matching `routes/**/workflow*.ts`, `services/workflow*.ts`, `pages/workflow*`, and their corresponding test files"

**I14. [D6] Sprint 2 QA 부하 집중 (14 stories = Sprint 1의 1.75x)** _(cross-talk: john)_

Sprint 2에 E25(6) + E26(5) + E27(3) = 14 스토리. E26은 E25 완료 후 순차 진행이라 Sprint 2 후반에 QA 집중. Sprint 2a(E25+E27, 보안 중심, 9스토리)/2b(E26, 마케팅, 5스토리) 분할이 QA 계획에 도움.

**Status:** Noted for sprint planning. Not a story-level fix — escalate to sprint planning phase.

**I15. [D1] Story 28.10 — 테스트 계획 템플릿 부재** _(cross-talk: dev)_

Capability evaluation의 AC 패턴(task corpus, iteration measurement, rework %)은 일반 feature story의 Given/When/Then과 근본적으로 다름. 별도 테스트 계획 구조 필요.

**Fix:** AC에 추가: "Test plan follows evaluation template: { task_id, category, iteration_n, input, expected_output, actual_output, rework_needed: boolean, rework_ratio }"

**I16. [D1] Story 28.3 — confidence decay 메커니즘 타이밍 미정의**

"0.1/week" decay가 실시간 계산(read time)인지 주기적 cron 업데이트인지 미정의. 읽기 성능과 구현 방식에 영향.

**Fix:** "confidence decay calculated at read time (not cron): `effective_confidence = stored_confidence - (weeks_since_last_update * 0.1), floor 0.1`" 또는 "weekly cron updates confidence column"

**I17. [D5] Epic 23 스토리 수 집중 (20/68 = 29%)**

Step 2에서 Sprint 1 밀도 리스크로 지적됨. 스토리 레벨에서 완화 전략 없음. 블로커는 아니나 기록.

---

### Cross-talk 요약

**Quinn → john, dev (Round 1):**
- NFR-O6/O8 커버리지 갭, Story 26.5 마케팅 게이트 모호성 (→ john)
- MEM-6 prompt hardening 기법, TOOLSANITIZE 확장 메커니즘, advisory lock 실패 경로 (→ dev)

**john → Quinn (Round 1 response):**
- Sprint 2 QA 부하 (14 stories = 1.75x Sprint 1) — Sprint 2a/2b 분할 제안 → **동의. QA 계획에 도움.** I14로 추가.
- Story 23.19 (4페이지 mega-story) 분할이 Go/No-Go #6에 미치는 영향 → **분할이 리스크 감소. 개별 페이지 지연이 다른 페이지 차단 안 함.**

**dev → Quinn (Round 1 response):**
- Story 22.4 "Given" clause 사실 불일치 — **확인됨.** `secureHeaders()` L102, `cors()` L115 이미 존재. I12로 추가. D3 점수 9→8 조정.
- Story 28.10 테스트 계획 템플릿 필요 — **동의.** Evaluation 패턴이 feature AC와 다름. I15로 추가.
- Story 25.5 삭제 파일 목록 누락 — **동의.** QA 검증 시 완전 삭제 확인 불가. I13으로 추가.

**john → Quinn (Round 2 — NFR gap responses):**
- NFR-O6: **제품 gap 확인.** Story 24.8 AC에 "3 rule scenarios × 10 requests, 24/30+ pass" 추가 필요. I3 강화.
- NFR-COST1/COST2: **부분 동의.** COST1은 22.6에, COST2는 22.2에 각각 추가. I7 세분화.
- Story 26.5: **순환 참조 동의.** "Sprint 2 exit marketing verification passes" 줄 삭제, 위 3개 기준이 곧 게이트. I6 구체화.
- NFR-O8: **제품 gap 확인.** Go/No-Go #1과 별개. Story 23.13 AC에 추가 필요. 새 이슈로 승격하지 않음 — I3와 동일 패턴(NFR 누락).
- Story 28.10 카테고리: 5개 정의 — (1) 대화 품질, (2) 도구 사용 정확도, (3) 지식 검색 관련성, (4) 규칙 준수, (5) 위임 정확도. I5 해결 지침 강화.

**dev → Quinn (Round 2 — Architecture responses):**
- MEM-6 L3: **regex 기반 확인.** 3개 체인 모두 regex but 도메인별 패턴 (observation poisoning vocabulary). I1 fix 보강.
- TOOLSANITIZE 확장: **JSON config 파일** 추천 (`config/tool-sanitize-patterns.json`). DB 과잉, 서버 재시작 허용. I2 fix 보강.
- Advisory lock: **skip + log warn + retry next cycle.** 24h 대기 허용, 큐 불필요. I8 fix 보강.
- WebSocket eviction: **oldest 정책 적합.** LRU는 메모리 오버헤드. Close code 4001 + JSON reason. I9 fix 보강.
- Confidence decay: **read-time 계산.** Formula: `confidence * pow(0.9, seconds_elapsed / 604800)`. HNSW 쓰기 증폭 방지. I16 fix 보강.
- MEM-6 L4: **blocklist + regex 동의.** ML 과잉. 추가 제안: PII 패턴 감지 (flag, 차단 아님). I10 fix 보강.

---

## Round 2: Verification (Post-Fix)

### 검증 결과

**14 of 17 issues resolved:**

| Issue | Status | 검증 |
|-------|--------|------|
| I1 CRITICAL (MEM-6 L3) | ✅ Resolved | L2433: 10 specific patterns named |
| I1 CRITICAL (MEM-6 L4) | ✅ Resolved | L2434: blocklist + regex, not ML |
| I2 CRITICAL (TOOLSANITIZE) | ✅ Resolved | L2352: JSON config + Admin API |
| I3 HIGH (NFR-O6) | ✅ Resolved | L2088: 3 scenarios × 10 requests, 24/30+ |
| I4 HIGH (sprites) | ✅ Resolved | L2724: placeholder rectangles per dept color |
| I5 HIGH (categories) | ⚠️ Accepted | Generic categories used; john's CORTHEX-specific recommended. Refine in sprint planning. |
| I6 HIGH (26.5 gate) | ✅ Resolved | L2323: pipeline success concretely defined |
| I7 HIGH (COST) | ✅ Resolved | L1440: COST1 + COST2 in Story 22.6 |
| I8 MEDIUM (lock) | ✅ Resolved | L2474: skip + log + retry |
| I9 MEDIUM (4001) | ✅ Resolved | L2673: code 4001 + exponential backoff |
| I10 MEDIUM (L4 technique) | ✅ Resolved | Covered in I1 L4 fix |
| I11 MEDIUM (NFR-O10) | ✅ Resolved | L2483: in references |
| I12 LOW (22.4 Given) | ✅ Resolved | L1393: "existing security headers" |
| I13 LOW (25.5 files) | ✅ Resolved | L2197: specific file paths listed |
| I14 LOW (Sprint 2) | N/A | Sprint planning, no fix needed |
| I15 LOW (test template) | ⚠️ Deferred | Not added; minor, can add during implementation |
| I16 LOW (decay) | ✅ Resolved | L2454: read-time formula |
| I17 LOW (Epic 23) | N/A | Noted, no fix needed |

### Remaining minor items (non-blocking):
1. **Story 28.10 categories**: Generic AI benchmarks vs john's CORTHEX-specific. Recommend refinement during sprint planning.
2. **MEM-6 L4 PII flagging**: Dev suggested PII regex (email/phone) → Admin flag. Not included. Good practice, not critical.
3. **NFR-O8**: CEO NEXUS ≤10 min not in any story AC. Minor — can be added to Story 23.13 during implementation.

### Updated 차원별 점수 (Round 2)

| 차원 | R1 점수 | R2 점수 | 변화 근거 |
|------|---------|---------|-----------|
| D1 구체성 | 8 | 9 | MEM-6 L3/L4, TOOLSANITIZE, confidence formula 전부 구체화 |
| D2 완전성 | 7 | 8 | NFR-O6, COST1/COST2, file list 추가. NFR-O8 미포함 감점 유지. |
| D3 정확성 | 8 | 9 | Story 22.4 precondition 수정 |
| D4 실행가능성 | 7 | 8 | MEM-6 layers, lock failure, decay formula 구현 가능 |
| D5 일관성 | 8 | 9 | NFR-O10 참조, Story 22.4 현실 반영 |
| D6 리스크 | 7 | 8 | Lock failure, connection drop, sprite pipeline, cost 검증 전부 추가 |

### 가중 평균: 8.40/10 ✅ PASS

계산: (9×0.10) + (8×0.25) + (9×0.15) + (8×0.10) + (9×0.15) + (8×0.25) = 0.90 + 2.00 + 1.35 + 0.80 + 1.35 + 2.00 = **8.40**

---

## 리뷰 메타데이터

- **리뷰어:** Quinn (Critic-B, QA + Security)
- **날짜:** 2026-03-24
- **대상:** Step 3 Create Stories (68 stories, 8 epics)
- **Round 1 결과:** 7.40/10 ✅ PASS (17 issues: 2 CRITICAL, 5 HIGH, 4 MEDIUM, 6 LOW)
- **Round 2 결과 (fixes 검증):** 8.40/10 ✅ PASS (14 resolved, 1 accepted with note, 2 deferred LOW)
