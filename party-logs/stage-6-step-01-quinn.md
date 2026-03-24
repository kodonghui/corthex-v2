# Critic-B (QA + Security) Review — Step 1: Requirements Extraction

**Reviewer:** Quinn (QA Engineer)
**File:** `_bmad-output/planning-artifacts/epics-and-stories.md`
**Date:** 2026-03-23
**Focus:** Testability, acceptance criteria potential, NFR measurability, security completeness

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 7/10 | 대부분 구체적 (hex, px, ms, %, exact version pins). NFR-O4/O5/O6/O11 baseline 미정의. UXR139 "evaluate" = 연구과제. **personality_traits JSONB 키 이름 미정의** (cross-talk: dev). **observations.outcome 타입 미정의** (cross-talk: dev). |
| D2 완전성 | 6/10 | 123 FR + 76 NFR + 72 AR + 140 UXR 추출. **그러나 PRD 80개 도메인별 요구사항 본문 누락** — 개요에만 언급, 본문에 열거 안 됨 (cross-talk: john). N8N-SEC-1~8, PER-1, MEM-6, PIX-2, NRT-2 등 테스트 체크리스트가 빠짐. HTTP 보안 헤더, 파일 업로드 보안, 벡터 검색 레이턴시, undo 범위 누락. NFR-S7/D7 삭제 사유 미기재. |
| D3 정확성 | 7/10 | 기술 정보 대부분 정확 (Neon LISTEN/NOTIFY 불가, PixiJS 8.17.1, Voyage voyage-3 1024d). **AR56 "Dark mode only" vs UXR19 "Light mode only" 모순** — 소스 문서 간 충돌을 그대로 추출했으나 플래그 없음. |
| D4 실행가능성 | 7/10 | 요구사항이 스토리로 분해 가능한 수준. 일부 NFR은 baseline 정의 없이 구현/검증 불가. **personality_traits 키 이름 미정의 → 테스트 assertion 작성 불가** (cross-talk: dev). |
| D5 일관성 | 7/10 | AR56 vs UXR19 내부 모순. 나머지 용어/번호 체계 일관. 삭제 항목 추적됨. |
| D6 리스크 | 6/10 | 3개 sanitization 체인 + 14 Go/No-Go 게이트 = 우수. 그러나: HTTP 보안 헤더 전무, 파일 업로드 보안 전무, 인증 rate limiting 전무, 의존성 CVE 스캔 전무, adversarial payload 10종 = 불충분. |

### 가중 평균: 6.55/10 ❌ FAIL

> D1(7×0.10) + D2(6×0.25) + D3(7×0.15) + D4(7×0.10) + D5(7×0.15) + D6(6×0.25) = **6.55**

---

## 이슈 목록 (17건) — cross-talk 반영

### CRITICAL (5건) — 수정 필수

**I1. [D3+D5] AR56 "Dark mode only" ↔ UXR19 "Light mode only" 모순**
- AR56: `"UXUI Reset (Layer 0)... Dark mode only. Applied per-Sprint"`
- UXR19: `"Single theme: Sovereign Sage... Light mode only for v3 launch"`
- 소스: Architecture L2306 `"Dark mode 전용"` (v2 Stitch 기반) vs UX Design L42 `"다크 모드 미지원 (v3 초기 런치)"`
- Architecture 문서가 v2 Phase 7의 다크 모드 지시를 v3 Layer 0에 그대로 carry-forward한 것으로 보임
- **해결 필요:** v3 방향은 Natural Organic (cream/light). AR56에서 "Dark mode only" 삭제 또는 "Light mode only (Natural Organic)" 정정

**I2. [D2+D6] HTTP 보안 헤더 요구사항 전무**
- CSP (Content-Security-Policy), HSTS (Strict-Transport-Security), X-Frame-Options, CORS 정책 없음
- PRD, Architecture, UX Design 3문서 모두에 언급 없음 (Grep 확인)
- 멀티테넌트 SaaS에서 필수 보안 레이어. XSS/Clickjacking 방어의 첫 번째 방어선
- **추가 필요:** NFR-S 카테고리에 HTTP 보안 헤더 요구사항 1건 이상

**I3. [D2+D6] 파일 첨부 보안 (FR65) 사양 전무**
- FR65: "사용자가 파일(이미지/문서)을 첨부하여 에이전트에게 전송"
- 파일 크기 제한, 허용 파일 타입 화이트리스트, 악성코드 스캔 — 전부 없음
- OWASP Top 10 #A08 (Software and Data Integrity Failures)에 해당
- **추가 필요:** FR65에 보안 사양 또는 별도 NFR-S 항목

**I4. [D2] PRD 80개 도메인별 요구사항 본문 누락 (cross-talk: john)**
- 개요 L16에 `"80 domain-specific requirements"` 언급하나 본문에 열거 없음
- 누락된 핵심 테스트 체크리스트: N8N-SEC-1~8 (8-layer 보안 테스트), PER-1 (4-layer sanitization 테스트), MEM-6 (4-layer content defense 테스트), PIX-2 (WebGL→Canvas fallback 테스트), NRT-2 (heartbeat 5s interval 테스트), Go/No-Go gate 교차 참조
- 이 요구사항들이 에픽 테스트 기준에서 빠지면 보안/성능 검증 구멍 발생
- **추가 필요:** 80개 도메인별 요구사항을 별도 섹션으로 본문에 열거

**I5. [D1+D4] personality_traits JSONB 스키마 키 이름 미정의 (cross-talk: dev)**
- FR-PERS2 + AR26: JSONB + Zod + CHECK 명시하지만 5개 OCEAN 키 이름 정의 없음
- `openness`? `conscientiousness`? `extraversion`? `agreeableness`? `neuroticism`? 약어? camelCase?
- 테스트 assertion, 슬라이더 바인딩, 프리셋 시딩 전부 canonical key name 필요
- **추가 필요:** 정확한 5개 키 이름 명시 (FR-PERS2 또는 AR26에)

### HIGH (3건) — 강력 권고

**I6. [D6] Adversarial payload 10종은 불충분**
- FR-TOOLSANITIZE3, Go/No-Go #2(PER-1), #9(MEM-6), #11(TOOLSANITIZE) 모두 "10종 adversarial payload"
- OWASP prompt injection 공격 라이브러리에 50+종 패턴 존재
- 10종 고정 payload = 과적합(overfitting) 위험. 검증된 것처럼 보이지만 미검증 패턴에 취약
- **권고:** 최소 25종 diverse payload per chain + mutation/fuzzing 포함. 또는 "최소 10종 + 확장 가능한 테스트 프레임워크" 명시

**I7. [D2] NFR-S7, NFR-D7 삭제 사유 미기재**
- 현재: `"~~NFR-S7~~: Deleted"`, `"~~NFR-D7~~: Deleted"`
- PRD에는 사유 기재: `"CLI Max 월정액, cost-tracker v3 제거 대상"`, `"CLI Max 월정액, 비용 추적 불필요"`
- 추적성(traceability) 결함 — 이 문서만 읽는 사람은 삭제 이유를 알 수 없음
- **수정:** FR37/FR39처럼 인라인 삭제 사유 추가

**I8. [D1+D2] 운영 NFR 베이스라인 미정의 (O4, O5, O6, O11)**
- NFR-O4: `"10 prompts A/B blind >= existing"` — "existing"이 무엇? v2 기준? 어디서 측정?
- NFR-O5: `"8/10+ scenarios"` — 어떤 10개 시나리오? 목록 없음
- NFR-O6: `"24/30+ = 80%+"` — 어떤 30개 케이스? 목록 없음
- NFR-O11: `"CEO daily task completion: <= 5 minutes"` — 어떤 태스크? 범위 미정의
- **테스트 불가능** — 구체적 시나리오 목록 또는 참조 문서 필요

### MEDIUM (6건) — 개선 권고

**I9. [D1+D4] observations.outcome 컬럼 타입 미정의 (cross-talk: dev)**
- AR42 스키마에 `outcome` 컬럼 열거하나 타입(text? enum? jsonb?)과 유효값 정의 없음
- 메모리 파이프라인 테스트 (FR-MEM1~14)에 valid/invalid outcome 기준 필요
- **추가 필요:** `outcome` 타입 + 허용값 목록 명시

**I10. [D2] 벡터 검색 레이턴시 NFR 없음**
- pgvector cosine 검색: soul-enricher (Sprint 3), knowledge docs (existing)
- 데이터 증가 시 성능 병목 가능성
- **추가 권고:** `"semantic search P95 <= Xms (50 agents, 10K observations 기준)"` 형태 NFR

**I11. [D6] 인증/토큰 엔드포인트 rate limiting 없음**
- 정의된 rate limit: n8n API 60/min, 동시 세션 20, /ws/office 10msg/s
- 미정의: 토큰 등록/검증, 일반 API 엔드포인트
- CLI 토큰 brute-force 공격 미완화
- **추가 권고:** NFR-S 또는 AR에 인증 엔드포인트 rate limit 명시

**I12. [D2] UXR67 "Ctrl+Z undo: last 5 actions" 범위 미정의**
- 어떤 액션이 undo 가능? CRUD 전부? 특정 페이지만?
- NEXUS는 "10-action stack" 명시 — 다른 페이지는?
- **수정:** undo 대상 액션 목록 또는 페이지별 범위 명시

**I13. [D1] UXR139 "evaluate @container" = 연구과제, 요구사항 아님**
- "evaluate"는 테스트 가능한 요구사항이 아님
- **수정:** "사용한다" 또는 요구사항에서 제거하고 연구 태스크로 분류

**I14. [D6] 의존성 취약점 스캔 요구사항 없음**
- AR3은 버전 핀(pin) 적용 — good
- 그러나 알려진 CVE 스캔 메커니즘 없음 (bun audit, Snyk, Dependabot 등)
- 공급망 공격(supply-chain attack) 방어 부재
- **추가 권고:** CI에 의존성 스캔 단계 추가 요구사항

### LOW (3건) — 참고

**I15. [D6] Reflection cron 워커 메모리/CPU 제한 없음**
- n8n Docker: 2G/2CPU 제한 (AR33) ✅
- memory-reflection.ts: 비용 제한은 있으나 리소스 제한 없음
- VPS 동일 프로세스에서 실행 — OOM 시 다른 서비스 영향

**I16. [D3] FR count 개요 불일치 (cross-talk: john)**
- Bob의 리뷰 요청에 "103 active FRs" 명시, 실제 열거 수 = 123
- (68-2) + 4 + 11 + 6 + 7 + 9 + 14 + 3 + 3 = 123
- 다운스트림 테스트 커버리지 매핑에 혼선 가능
- **수정:** 개요 FR 수 정정 (파일 L16은 이미 123 — Bob 메시지만 103)

**I17. [D5] Placeholder 섹션 미완성 — 예상범위**
- `{{requirements_coverage_map}}`, `{{epics_list}}` — Step 1은 요구사항 추출 단계이므로 정상
- Step 2+에서 반드시 채워져야 함

---

## 자동 불합격 조건 검토

| 조건 | 결과 |
|------|------|
| 할루시네이션 (존재하지 않는 API/파일 참조) | ✅ 없음 — 모든 참조가 소스 문서에 존재 |
| 보안 구멍 (하드코딩 시크릿, SQLi, XSS) | ✅ 없음 — 추출 단계이므로 코드 없음 |
| 빌드 깨짐 | N/A — 코드 없음 |
| 데이터 손실 위험 | ✅ 없음 |
| 아키텍처 위반 (engine/ 경계) | ✅ 없음 |

**자동 불합격: 해당 없음**

---

## Cross-talk 요약

### 수신 (john → quinn)
- **FR count 오류**: 개요 "103 active FRs" vs 실제 123건 (I16으로 반영)
- **도메인별 요구사항 80건 본문 누락**: N8N-SEC, PER-1, MEM-6, PIX-2, NRT-2 등 테스트 체크리스트 (I4로 반영)

### 수신 (dev → quinn)
- **personality_traits JSONB 키 이름 미정의**: OCEAN 5개 canonical key 없음 → 테스트 assertion 불가 (I5로 반영)
- **observations.outcome 타입 미정의**: text? enum? jsonb? 유효값 없음 (I9로 반영)

### 발신 (quinn → john)
- NFR-O4/O5/O6/O11 베이스라인 정의 요청. 제품 관점에서 테스트 시나리오 목록 필요.
- UXR67 undo 범위 제품 결정 필요.

### 발신 (quinn → dana)
- 6개 보안 갭 정렬 요청 (HTTP 헤더, 파일 업로드, adversarial payload, rate limiting, dependency scanning, AR56 모순)

### 발신 (quinn → dev)
- AR56 "Dark mode only" vs UXR19 "Light mode only" 모순 확인 요청. HTTP 보안 헤더/파일 업로드 보안 아키텍처 결정 필요.

---

## 총평 (Initial)

요구사항 추출의 **범위와 구체성은 우수** — 4개 문서에서 391개 요구사항을 빠짐없이 추출했고, 대부분 측정 가능한 수치와 함께 기재됨. 그러나 **보안 관점에서 빈틈이 있음**: HTTP 보안 헤더, 파일 업로드 보안, 인증 rate limiting, 의존성 스캔 등 웹 보안 기본기가 누락됨. Adversarial payload 10종도 프로덕션 수준에는 부족. AR56↔UXR19 모순은 소스 문서 간 충돌을 충실히 추출한 것이나, 플래그 없이 넘어가면 이후 에픽/스토리에서 혼선 발생.

---

## Re-Verification (Post-Fixes)

**Date:** 2026-03-24

### 수정 확인 (17건 중 14건 해결, 2건 부분 해결, 1건 LOW 유지)

| # | 이슈 | 상태 | 확인 |
|---|------|------|------|
| I1 | AR56 dark/light 모순 | ✅ 해결 | AR56 L418 "Light mode only" + 조정 테이블 L813 추가 |
| I2 | HTTP 보안 헤더 | ✅ 해결 | NFR-S11 (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, CORS) |
| I3 | 파일 첨부 보안 | ✅ 해결 | NFR-S12 (10MB, type whitelist, filename sanitization, magic bytes) |
| I4 | 80 DSR 본문 누락 | ✅ 해결 | DSR1-DSR80 전체 열거 (L664-L788) |
| I5 | personality_traits 키 | ✅ 해결 | PER-2: `personality_{openness,conscientiousness,extraversion,agreeableness,neuroticism}` |
| I6 | Adversarial payload 수 | ✅ 수용 | "minimum 10 + extensible framework, OWASP 50+ expansion target" |
| I7 | NFR-S7/D7 삭제 사유 | ✅ 해결 | 인라인 사유 추가 |
| I8 | NFR-O4/O5/O6/O11 베이스라인 | ✅ 해결 | O4: 참조 파일, O5: 10 시나리오 목록, O6: 3×10, O11: 5-step flow |
| I9 | observations.outcome 타입 | ✅ 해결 | `VARCHAR(20) DEFAULT 'unknown'` — success/failure/unknown |
| I10 | 벡터 검색 레이턴시 | ✅ 해결 | NFR-P18: P95 ≤ 200ms, soul-enricher ≤ 300ms |
| I11 | 인증 rate limiting | ✅ 해결 | NFR-S13: 10 req/min per IP |
| I12 | UXR67 undo 범위 | ✅ 해결 | CRUD 5 actions (삭제 제외) + NEXUS 10-action stack |
| I13 | UXR139 "evaluate" | ✅ 해결 | "use @container" + 구체적 사용처 명시 |
| I14 | 의존성 취약점 스캔 | ✅ 해결 | NFR-S14: bun audit CI + Dependabot |
| I15 | Reflection cron 리소스 | ⚠️ LOW 유지 | 비용 제한은 있으나 메모리/CPU 미정의 — 리스크 낮음 |
| I16 | FR count 불일치 | ✅ 해결 | 파일 L16 = 123 (정확) |
| I17 | Placeholder 섹션 | ✅ 예상 | TODO 코멘트로 변환됨 |

### Re-Score

| 차원 | Before | After | 근거 |
|------|--------|-------|------|
| D1 구체성 | 7 | **9** | OCEAN 키 정의, outcome 타입, O4-O11 베이스라인, UXR67 범위, UXR139 구체화 |
| D2 완전성 | 6 | **9** | 80 DSR 추가, NFR-S11~S14/P18 추가, 보안 갭 전부 해결. 123 FR + 80 NFR + 75 AR + 140 UXR + 80 DSR |
| D3 정확성 | 7 | **9** | AR56/UXR19 모순 해결 + 조정 테이블 7건 문서화. outcome schema 정확 |
| D4 실행가능성 | 7 | **8** | 키 이름 정의 → assertion 작성 가능. undo 범위 → 구현 가능. O11 5-step → E2E 테스트 가능 |
| D5 일관성 | 7 | **9** | Dark/Light 정합. 조정 테이블로 cross-document 충돌 투명 관리 |
| D6 리스크 | 6 | **8** | HTTP 헤더, 파일 보안, 인증 rate limit, 의존성 스캔 전부 추가. Adversarial 확장 경로 명시 |

### 가중 평균: 8.65/10 ✅ PASS

> D1(9×0.10) + D2(9×0.25) + D3(9×0.15) + D4(8×0.10) + D5(9×0.15) + D6(8×0.25) = **8.65**

### 자동 불합격 조건: 해당 없음 (재확인)

### 잔여 리스크 (non-blocking)
- I15: Reflection cron worker 메모리/CPU 미제한 — Sprint 3 에픽 설계 시 고려 권장
- Adversarial payload: "minimum 10"은 Go/No-Go 최소 기준. 프로덕션 보안 테스트 시 OWASP 50+ 확장 필수

---

## 총평 (Final)

**대폭 개선.** Initial 6.55 → Final **8.65**. 17건 이슈 중 14건 완전 해결, 2건 수용 가능 수준, 1건 LOW 유지. 특히 우수한 수정:
- AR56/UXR19 다크/라이트 모순 → 조정 테이블 + AR56 본문 정정 + CLAUDE.md 맥락 설명 (I1)
- 80개 도메인별 요구사항 전체 열거 — N8N-SEC 8-layer, PER-1 4-layer, MEM-6 4-layer 테스트 체크리스트 포함 (I4)
- 보안 NFR 4건 추가 (S11-S14) — 웹 보안 기본기 완비 (I2, I3, I11, I14)
- observations 스키마 완전 정의 — outcome + domain + importance + confidence + decay 로직 (I9)

**Step 2 에픽 설계로 진행 가능.**
