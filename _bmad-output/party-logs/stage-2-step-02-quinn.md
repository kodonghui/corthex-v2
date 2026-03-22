# Critic-B (Quinn) Review — Stage 2 Step 02: Discovery

**Reviewer:** Quinn (QA + Security)
**Date:** 2026-03-22
**Cycle:** Reverify (prior cycle: 6.55→8.10)
**Section:** PRD lines 110–264 (Project Discovery)
**References cross-checked:**
- `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md`
- `_bmad-output/planning-artifacts/technical-research-2026-03-20.md`
- `_bmad-output/planning-artifacts/v3-corthex-v2-audit.md`
- `packages/shared/src/types.ts:484-500` (WsChannel — code-verified)
- `packages/server/src/db/schema.ts:1556-1558, 1888` (embedding — code-verified)
- `context-snapshots/planning-v3/stage-2-step-02-scope-snapshot.md`

---

## 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 8/10 | 10% | 버전 번호(PixiJS 8.17.1, n8n 2.12.3), 파일 경로(shared/types.ts:484-501), 복잡도 점수(33/40), Sprint별 코드 줄 수 추정 전부 구체적. Pre-Sprint 항목에 구체적 마감일 없음(1곳). |
| D2 완전성 | 7/10 | 25% | 8개 서브섹션 전부 존재. **여정 B(Sprint 2 n8n)가 여정 A/C/D 대비 현저히 빈약** — 접근성 주석 없음, 에러 경로 없음, 최초 사용 UX 없음. **여정 C도 접근성 주석 없음** (Sally 확인). **Voyage AI 768→1024 마이그레이션이 Sprint 의존성(L165-180)에 누락** — Tech Research L2258/L2367에서 "Sprint 0 blocker, 2-3 days"로 명시됐지만 PRD 의존성 그래프에 미반영 (Winston/Bob 확인). Feature Audit에서 cost 인프라 정리 범위 미언급. |
| D3 정확성 | 8/10 | 15% | WS 16채널 코드 검증 ✅ (types.ts:484-500, 실제 16개). Big Five 0-100 정수 ✅. 485 API/71 pages/86 tables = Audit 일치 ✅. vector(768)→1024 마이그레이션 정확히 식별 ✅. **"Subframe 아키타입" x2곳(L167, L192): Subframe 폐기됨 → Stitch 2로 교체 필요.** |
| D4 실행가능성 | 8/10 | 10% | Sprint 의존성 다이어그램 명확. 코드 추정 테이블 파일명 포함. Feature Audit 결정 명확. 여정 B만 구현 가이드 부족. |
| D5 일관성 | 7/10 | 15% | **"Subframe 아키타입" x2곳: 프론트매터 L102 "Subframe 폐기 → Stitch 2"와 모순.** **"삭제: 0줄"(L223) vs Feature Audit "costs 전면 제거 + workflows 제거"(L247-253): Zero Regression 원칙과 페이지 제거의 범위 정의 불일치.** 그 외 Sprint 번호↔Layer 매핑, "4가지 핵심 능력 + Layer 0", Big Five 0-100 모두 일관적. |
| D6 리스크 | 7/10 | 25% | n8n OOM 860MB idle/4GB peak 구체적 ✅. PixiJS <200KB 임계값 ✅. 3개 신규 공격 표면(n8n 6-layer, personality 4-layer, WS JWT+token bucket) 식별 ✅. Neon Pro 블로커 ✅. **누락: (1) cost 채널/타입 제거 시 기존 구독 클라이언트 영향, (2) n8n Docker 다운 시 여정 B 실패 경로, (3) Feature Audit 페이지 제거 시 데이터 마이그레이션/아카이빙 전략, (4) "485 API 전체 통과" 주장이 cost API 제거 시 stale해짐 (Sally 확인), (5) Reflection LLM 비용 감사 추적 유지 필요 — UI 제거해도 내부 비용 관리는 존속 (Winston 확인).** |

---

## 가중 평균: 7.35/10 ✅ PASS (cross-talk 반영 하향 조정)

D1(8×0.10) + D2(7×0.25) + D3(8×0.15) + D4(8×0.10) + D5(7×0.15) + D6(7×0.25) = 0.80 + 1.75 + 1.20 + 0.80 + 1.05 + 1.75 = **7.35**

> 초기 점수 7.60 → cross-talk 후 7.35 (D6: 8→7, Voyage AI blocker + 485 API stale + cost audit trail 리스크 추가)

---

## 이슈 목록

### Critical (2)

1. **[D3/D5 정확성+일관성] "Subframe 아키타입" → "Stitch 2" 교체 필요 (L167, L192)**
   - PRD 프론트매터 L102에 `Stitch2: "메인 디자인 도구 (Subframe 폐기 → Stitch 2 전환, 2026-03-21)"` 명시
   - CLAUDE.md: "Stitch MCP가 생성한 HTML = 디자인 기준"
   - Brief L88: "디자인 도구: **Stitch 2**(메인)"
   - 하지만 Discovery 섹션 2곳에서 여전히 "Subframe 아키타입" 참조
   - **수정**: "디자인 토큰 확정 (Subframe 아키타입)" → "디자인 토큰 확정 (Stitch 2 DESIGN.md 기반)"
   - 추가: L397 "Subframe MCP 토큰 준수" → "Stitch 2 DESIGN.md 토큰 준수", L566 "Subframe 디자인 시스템 준수" → "Stitch 2 디자인 시스템 준수" (Discovery 섹션 밖이지만 동일 문서)

2. **[D5 일관성] "삭제: 0줄" vs Feature Audit "전면 제거" 모순 (L121/L223 vs L247-255)**
   - L121: "삭제 없음"
   - L223: "삭제: 0줄 (Zero Regression — 기존 코드 삭제 없음)"
   - L247: Admin workflows 🔴 제거, L248: CEO workflows 🔴 제거, L253: costs 전면 제거
   - **QA 질문**: "제거"가 "코드 삭제"인가, "새 UXUI에서 미포함(deprecated)"인가?
   - Zero Regression이 API/DB/Engine 불변만 의미하는지, 프론트엔드 페이지도 포함하는지 명확화 필요
   - **제안**: "삭제: 0줄 (API/DB/Engine 기존 코드 삭제 없음. 프론트엔드 페이지 3종은 UXUI 리셋 과정에서 대체 — 기존 코드 즉시 삭제 아님, 신규 페이지로 교체)" 형태로 범위 한정

### Major (2)

3. **[D2 완전성] 여정 B(Sprint 2 n8n) 접근성·에러 경로 누락 (L208-209)**
   - 여정 A: 접근성 (슬라이더 키보드, aria-valuenow, aria-label) ✅
   - 여정 C: 중간 피드백 설계 (알림, 성공률 차트, 학습 이력) ✅
   - 여정 D: 접근성 (aria-live) + 반응형 (모바일 리스트 뷰) + Admin read-only ✅
   - **여정 B: 1줄만 존재**, 접근성 0, 에러 0, 최초 사용 UX 0
   - **제안 추가**:
     - *접근성*: n8n iframe 내 키보드 네비게이션, 워크플로우 실행 상태 aria-live
     - *에러 경로*: n8n Docker 다운/OOM 시 "서비스 일시 중단" 안내 + 재시도 가이드
     - *최초 사용*: 빈 상태(워크플로우 0개) 시 "첫 번째 워크플로우 만들기" 안내

4. **[D6 리스크] Feature Audit cost 제거 — 기존 인프라 정리 범위 미정의 (L253-255)**
   - 현존하는 cost 관련 인프라:
     - WS 채널: `'cost'` (types.ts:497) — 실시간 비용 이벤트
     - 타입: `CostSummary`, `AdminCostByAgent`, `AdminCostByModel`, `AdminCostByDepartment`, `DashboardBudget` (types.ts:342-424)
     - API 엔드포인트: costs.ts, budget.ts (서버)
     - DB 테이블: cost 관련 테이블들
   - Feature Audit는 "페이지 제거"만 결정, 백엔드 인프라 정리 범위 미결정
   - **리스크**: 프론트엔드만 제거하고 백엔드 방치 시 dead code 누적 + 불필요한 비용 계산 리소스 소비
   - **제안**: Architecture 단계에서 cost 인프라 deprecated 전략 상세 설계 (API 즉시 제거 vs 점진 제거 vs v3 기간 유지)

### Major — Cross-talk 추가 (2)

7. **[D2 완전성] Voyage AI 768→1024 마이그레이션 Sprint 의존성 누락 (L165-180)** *(Winston + Bob)*
   - Tech Research L2258: "Rewrite `embedding-service.ts` from `@google/generative-ai` (768d) → `voyageai` npm SDK (1024d). Update all callers (12+ files). Re-embed existing knowledge_docs. Rebuild HNSW indexes. **Estimated: 2-3 days.**"
   - Tech Research L2367: "Voyage AI SDK migration | 🔴 NOT STARTED | Sprint 3 (Memory) | ... Most time-consuming Sprint 0 task."
   - Sprint 의존성(L165-180)은 Pre-Sprint에 "디자인 토큰", "Neon Pro", "사이드바 IA"만 나열
   - Voyage AI 마이그레이션은 Sprint 3 Memory의 선행 조건이므로 Pre-Sprint 블로커로 추가 필요
   - **제안**: Pre-Sprint 항목에 "Voyage AI embedding 마이그레이션 (768→1024, 12+ files, 2-3일 — Sprint 3 블로커)" 추가

8. **[D5 일관성] n8n 보안 레이어 수: PRD "6-layer" vs Tech Research "8 items" (L158)** *(Bob)*
   - PRD: Docker network → Hono proxy → API key → webhook HMAC → tag isolation → rate limiting (6개)
   - Tech Research L220-229: localhost bind, N8N_HOST, firewall/iptables, N8N_DISABLE_UI, API key, N8N_ENCRYPTION_KEY, Secure by Default, webhook HMAC (8개)
   - PRD에만 있는 것: tag isolation, rate limiting
   - Tech Research에만 있는 것: N8N_ENCRYPTION_KEY (AES-256-GCM), N8N_DISABLE_UI
   - **보안 갭 아님** (다른 추상화 레벨의 그룹핑), 하지만 네이밍 통일 필요
   - **제안**: PRD와 Tech Research의 보안 레이어 명칭을 Architecture 단계에서 통일

### Minor (2)

5. **[D1 구체성] Pre-Sprint 항목 마감일 부재 (L166-169)**
   - "디자인 토큰 확정", "Neon Pro 업그레이드", "사이드바 IA 선행 결정" — 셋 다 Pre-Sprint이지만 구체적 마감일 없음
   - Neon Pro만 "🔴 NOT STARTED" 상태 표시 있음
   - **제안**: "Pre-Sprint (Sprint 1 착수 전 2주)" 등 시간 범위 명시

6. **[D3 정확성] v2 Audit WS 채널 수 불일치 (Audit: 14, 실제: 16)**
   - Audit 문서(AUTHORITY)는 14채널 나열 (strategy, argos 누락)
   - 실제 코드 `types.ts:484-500`: 16채널
   - PRD는 16으로 정확하게 기재 ✅
   - **참고**: Audit 문서 업데이트 필요 (PRD 수정 아님)

---

## 보안 전문 평가 (Critic-B 특화)

### ✅ 양호
- **n8n 6-layer 보안 모델** (L158): Docker network → Hono proxy → API key → webhook HMAC → tag isolation → rate limiting — 방어 심층 체계적
- **personality 4-layer sanitization** (L158): Key Boundary → API Zod → extraVars strip → Template regex — 프롬프트 인젝션 방어 다층
- **/ws/office JWT + token bucket** (L158): 10 msg/s per userId — DDoS 방어
- **Voyage AI 전환 + Gemini 금지**: 임베딩 프로바이더 정책 명확 ✅
- **vector(768)→1024 마이그레이션**: 정확히 식별 + 영향 범위(knowledge_docs, semantic_cache) 명시 ✅

### ⚠️ 주의
- **cost WS 채널 제거 시**: 기존 프론트엔드 클라이언트가 `'cost'` 채널 구독 중이면 채널 폐쇄 후 에러 발생. graceful deprecation 필요.
- **n8n OOM 복구**: in-flight workflow 비복구(Tech Research L252 확인). CORTHEX 측 워크플로우 상태 불일치 리스크.

---

## Cross-talk (완료)

### Winston (Critic-A, 7.60/10) → Quinn
1. **Subframe stale refs 동의** — L397 "Subframe MCP 토큰 준수"도 stale. ✅ 내 이슈 #1에 이미 포함.
2. **n8n RAM "4GB peak" vs Docker 2G cap** — Winston은 Docker가 2G (Brief)라고 지적. **내 확인**: Stage 1 Step 6에서 2G→4G로 fix 적용됨 (context snapshot L33). 하지만 Tech Research Domain 2 body는 여전히 "2 GB limit" (L244, L250). **결론**: PRD "4GB peak"은 Docker 4G limit과 일치. Tech Research가 미업데이트.
3. **Voyage AI migration Sprint 0 blocker 누락** — Tech Research L2258: "Sprint 0 blocker, 2-3 days". Sprint 의존성(L165-180)에 미반영. ✅ **신규 Major 이슈로 채택** (이슈 #7).
4. **Cost audit trail** — Reflection LLM 비용 관리는 UI 제거해도 내부적으로 존속 필요. ✅ D6 점수 하향 반영.

### Sally (6.80/10 ❌ FAIL) → Quinn
1. **Subframe x4 전체 PRD** — Discovery 2곳(L167, L192) + L397 + L566. ✅ 내 이슈 #1에서 L397/L566도 언급.
2. **여정 B + C 접근성 없음** — 여정 C도 접근성 주석 없음. ✅ 맞음 — L211-213 "중간 피드백 설계"는 있으나 접근성 0. **D2 근거에 추가 반영**.
3. **"485 API 전체 통과" stale** — cost API 제거 시 485개 주장이 무효. ✅ **D6 리스크에 추가 반영**, 점수 8→7 하향.

### Bob (Critic-C, 7.70/10) → Quinn
1. **costs + Zero Regression** — 동일 이슈. backend infra 범위 확인 필요. ✅ 내 이슈 #2, #4와 동일.
2. **n8n security layer count: PRD "6-layer" vs Tech Research "8 items"** — 코드 검증 결과:
   - PRD 6-layer: Docker network → Hono proxy → API key → webhook HMAC → tag isolation → rate limiting
   - Tech Research 8 items: localhost bind, N8N_HOST, firewall/iptables/proxy, N8N_DISABLE_UI, API key, N8N_ENCRYPTION_KEY, Secure by Default, webhook HMAC
   - **차이**: PRD에 "tag isolation + rate limiting" 있고 TR에 없음. TR에 "N8N_ENCRYPTION_KEY + N8N_DISABLE_UI" 있고 PRD에 없음. 다른 추상화 레벨의 그룹핑 — 보안 갭이 아닌 네이밍 불일치. **D5 일관성 이슈로 분류** (이슈 #8).
3. **Voyage AI Sprint 0 blocker** — Winston과 동일. ✅ 이슈 #7.
4. **Subframe stale** — 동의. ✅

### Cross-talk 합의
- **4/4 Critics 동의**: Subframe→Stitch 2 교체 필수 (Critical)
- **4/4 Critics 동의**: Zero Regression vs 전면 제거 범위 명확화 필수 (Critical)
- **3/4 Critics 동의**: Voyage AI Sprint 0 blocker 의존성 그래프에 추가 (Major)
- **2/4 Critics 동의**: 여정 B 접근성 보강 (Major)
- **Sally 단독 FAIL (6.80)**: D2에서 여정 B/C 접근성 + Voyage AI blocker를 더 무겁게 평가

---

## 이전 리뷰 대비 변화

| 항목 | 이전 (Cycle 1) | Reverify 발견 | Fix 후 |
|------|---------------|-------------|--------|
| Big Five 스케일 | ❌ 0.0-1.0 (4곳) | ✅ 0-100 정수 | ✅ 유지 |
| 4-layer sanitization | ❌ 미명시 | ✅ 명시됨 (L158) | ✅ 네이밍 개선 |
| PixiJS 번들 | ❌ 300KB | ✅ 200KB | ✅ 유지 |
| WS 채널 수 | ❌ 14 | ✅ 16→17 (L157) | ✅ 유지 |
| Subframe 참조 | ❌ 미검출 | ❌ 2곳 잔존 | ✅ **4곳 전부 수정** |
| Zero Regression 모순 | ❌ 미검출 | ❌ 범위 불명확 | ✅ **정의 추가 + ~200줄 삭제 반영** |
| Voyage AI 블로커 | — | ❌ 의존성 누락 | ✅ **Sprint 의존성에 추가** |
| 여정 B 접근성 | — | ❌ 1줄만 존재 | ✅ **4줄로 확장** |
| 여정 C 접근성 | — | ❌ 미존재 | ✅ **추가됨** |
| n8n 보안 레이어 | — | ❌ 6 vs 8 | ✅ **8-layer 통일** |
| Cost 범위 | — | ❌ 미정의 | ✅ **blockquote 추가** |

---

## Verification (Post-Fix)

**Verified Date:** 2026-03-22

### Fix 검증 결과

| Fix # | 이슈 | 수정 확인 | 검증 방법 |
|-------|------|---------|----------|
| 1 | Subframe x4 → Stitch 2 | ✅ | `grep Subframe prd.md` — L102 프론트매터(역사 기록)만 잔존, body 0건 |
| 2 | "삭제: 0줄" → "~200줄" + ZR 정의 | ✅ | L121 "GATE 결정에 의한 페이지 교체", L228 "~200줄", L231 ZR 정의 확인 |
| 3 | n8n Docker 4GB → 2G cap | ✅ | L155 "Docker 2G cap — Brief mandate --memory=2g, OOM 리스크 상승" |
| 4 | n8n 8-layer + personality naming | ✅ | L158 8개 레이어 나열 확인 |
| 5 | Voyage AI Sprint 0 블로커 | ✅ | L169 + L193 Pre-Sprint 항목에 추가 |
| 6 | Journey B 확장 | ✅ | L210-213 접근성+에러+빈상태 4줄 |
| 7 | Journey C 접근성 | ✅ | L218 차트 키보드, aria-label, 텍스트 요약 |
| 8 | Cost 범위 blockquote | ✅ | L263 UI-only + Reflection 유지 + WS/API Architecture 이관 |
| 9 | /office 색맹 접근성 | ✅ | L222 아이콘/애니메이션 이중 인코딩 |

### 잔여 이슈 (Minor — 수정 요청 아님)

1. **L160 + L243 "71개 페이지"**: GATE 4개 제거 후 Layer 0 UXUI 대상은 ~67개 페이지. L230은 "~67개 페이지 — GATE 제거 4개 제외"로 수정됨. 하지만 L160(복잡도 테이블)과 L243(Sprint 코드 테이블)은 여전히 "71개 페이지". L249 "v2 71개 페이지 전수 조사"는 정확(전수 조사 대상은 71개).
2. **L158 "API key header injection"**: "injection" 용어가 보안 취약점과 혼동 가능 — "API key authentication"이 명확. 기능적 오류 아님.

### Verified 점수

| 차원 | Pre-fix | Post-fix | 근거 |
|------|---------|----------|------|
| D1 구체성 | 8/10 | **9/10** | n8n Docker 2G 명확화, Voyage AI 2-3일 추정, Journey B 상세화 |
| D2 완전성 | 7/10 | **9/10** | Voyage AI 블로커 추가, Journey B/C/D 접근성 전부 보강, Cost 범위 명시 |
| D3 정확성 | 8/10 | **9/10** | Subframe x4 수정, n8n 8-layer 정렬, ZR "~200줄" 반영. L160/L243 71→67 잔여 |
| D4 실행가능성 | 8/10 | **9/10** | Journey B 구현 가능, ZR 정의 명확, Cost deprecated 전략 Architecture 이관 |
| D5 일관성 | 7/10 | **8/10** | Subframe/ZR 모순 해소. L160/L243 "71개" 잔여 (-1) |
| D6 리스크 | 7/10 | **9/10** | n8n OOM Brief 2G 명확화, Voyage AI 블로커 추가, Cost audit trail 보존, 색맹 접근성 |

**Verified 가중 평균: 8.85/10 ✅ PASS**

D1(9×0.10) + D2(9×0.25) + D3(9×0.15) + D4(9×0.10) + D5(8×0.15) + D6(9×0.25) = 0.90 + 2.25 + 1.35 + 0.90 + 1.20 + 2.25 = **8.85**
