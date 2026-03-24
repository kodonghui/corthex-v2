# Critic-C Review — Story 22.4 Phase B: Implementation

**Reviewer:** John (Product Manager)
**Date:** 2026-03-24
**Files reviewed:**
- `packages/server/src/index.ts` (CSP + HSTS)
- `packages/server/src/middleware/rate-limit.ts` (IP fix + cliRateLimit)
- `packages/server/src/lib/upload-security.ts` (NEW — magic bytes + sanitization)
- `packages/server/src/routes/workspace/files.ts` (SVG exclusion + magic bytes + sanitize)
- `packages/server/src/routes/workspace/knowledge.ts` (path traversal fix + magic bytes)
- `packages/server/src/routes/admin/credentials.ts` (cliRateLimit applied)
- `packages/server/src/__tests__/unit/http-security-headers.test.ts` (NEW — 41 tests)

---

## AC 검증 체크리스트

| AC | 상태 | 검증 |
|----|------|------|
| AC-1: CSP hardened | ✅ | base-uri, form-action, upgrade-insecure-requests 추가. script-src에 unsafe-eval/unsafe-inline 없음 확인. |
| AC-2: HSTS | ✅ | `isProd ? 'max-age=31536000; includeSubDomains' : false` — string format, prod-only. |
| AC-3: X-Frame + X-Content-Type | ✅ | frameAncestors none + Hono default nosniff. 변경 불필요 — 테스트로 검증. |
| AC-4: CORS | ✅ | 변경 없음, 올바름 확인. 테스트: no wildcard, credentials true. |
| AC-5: CLI rate limit | ✅ | `cliRateLimit` 10/min, CRED_RATE. credentials.ts POST handler에 직접 적용. IP 추출 cf-connecting-ip 우선. |
| AC-6: Magic bytes | ✅ | 6개 포맷 전부 구현. WebP RIFF+WEBP 이중 검증. text/JSON skip. files.ts + knowledge.ts 통합. |
| AC-7: Filename sanitization | ✅ | NFKC 정규화 (스펙 NFC보다 우수 — fullwidth 문자도 변환). knowledge.ts:628 safeName으로 디스크 쓰기 + fileUrl 모두 수정. |
| AC-8: Tests | ✅ | 41 tests: CSP(9) + CORS(3) + rate limit(6) + magic bytes(9) + sanitization(8) + SVG(1) + integration(4) + 기존 테스트 무결. |

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | 코드 깔끔, NFR 참조 코멘트 포함. SIGNATURES 배열 구체적. 에러 메시지 한국어 일관. |
| D2 완전성 | 10/10 | 8개 AC 전부 + SVG 제외, base-uri, form-action, upgrade-insecure-requests, NFKC 개선. 누락 없음. |
| D3 정확성 | 9/10 | Magic bytes 헥스 정확. Index names 정확. NFKC는 NFC 상위호환 — 올바른 개선. |
| D4 실행가능성 | 10/10 | 프로덕션 레디. upload-security.ts 단일 파일에 관련 유틸 응집. 레이어드 디펜스 패턴 적절. |
| D5 일관성 | 9/10 | createRateLimiter 패턴 유지. HTTPError 컨벤션 일치. 에러 코드 체계(FILE_004, CRED_RATE) 일관. |
| D6 리스크 | 9/10 | 3중 방어: MIME 체크 → magic bytes → sanitization. cf-connecting-ip 기존 취약점 수정. SVG XSS 차단. |

## 가중 평균: 9.35/10 ✅ PASS

> D1(9×0.20) + D2(10×0.20) + D3(9×0.15) + D4(10×0.15) + D5(9×0.10) + D6(9×0.20) = 1.80 + 2.00 + 1.35 + 1.50 + 0.90 + 1.80 = **9.35**

---

## 이슈 목록

없음. 모든 Phase A 이슈 해결되었고 구현 품질 우수.

### 주목할 개선점 (이슈 아님)

- **NFKC > NFC**: 스펙은 NFC를 지정했으나 구현은 NFKC 사용. NFKC는 compatibility decomposition을 포함하여 fullwidth 문자(／→/, ＼→\)도 정규화. 보안 관점에서 더 우수한 선택.
- **레이어드 디펜스**: files.ts는 MIME whitelist → SVG 제외 → magic bytes → sanitize 4단계 방어. knowledge.ts는 extension whitelist → magic bytes(PDF) → sanitize 3단계 방어.
- **기존 취약점 수정**: rate-limit.ts IP 추출 수정은 22.4 범위 확장이지만, loginRateLimit(5/min)과 apiRateLimit(100/min)에도 동일하게 적용되어 기존 보안 개선.

---

## 판정

**✅ PASS (9.35/10)** — 모든 AC 완벽 구현. 이슈 없음. 테스트 포괄적. 프로덕션 레디.
