# Critic-C Review — Story 22.4: HTTP Security Headers & Rate Limiting

**Reviewer:** John (Product Manager)
**Date:** 2026-03-24
**Spec:** `_bmad-output/implementation-artifacts/stories/22-4-http-security-headers-rate-limiting.md`

---

## NFR Coverage Verification

| NFR | 요구사항 | 스펙 커버리지 | 상태 |
|-----|---------|-------------|------|
| NFR-S11 | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, CORS | AC-1~4: CSP/CORS/X-Frame/X-Content 이미 올바름(verify-only), HSTS 신규 추가 | ✅ |
| NFR-S12 | 10MB, type whitelist, filename sanitization, magic bytes | AC-6~7: magic bytes 검증, filename sanitization, 10MB(knowledge)/50MB(files) 분리 근거 제시 | ✅ |
| NFR-S13 | CLI token rate limiting 10 req/min per IP | AC-5: `cliRateLimit` 10/min, POST /api/admin/cli-credentials 적용 | ✅ |

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | 파일 경로+라인 번호 정확(index.ts:102-113, knowledge.ts:623, files.ts:54, credentials.ts:58-86). Magic bytes 헥스값 6개 포맷 모두 명시. 사소한 점: HSTS 표현 불일치 (Task 1.2는 object `{ maxAge, includeSubDomains }`, Dev Notes는 string `'max-age=...'`). |
| D2 완전성 | 9/10 | NFR-S11/S12/S13 전부 커버. verify-only 접근 적절(이미 올바른 설정 건드리지 않음). 실제 보안 수정 3건(HSTS, path traversal, magic bytes) + rate limit 1건. |
| D3 정확성 | 8/10 | 모든 라인 참조 코드와 대조 확인 완료. CSP 디렉티브 정확. CORS 설정 정확. credentials.ts:58-86 Anthropic API 호출 확인. HSTS 표기법 minor 불일치(이슈 #1). |
| D4 실행가능성 | 9/10 | 6개 Task 구조 명확. magic-bytes.ts 신규 파일 + 기존 파일 수정 지점 정확. sanitizeFilename 규칙 구체적(/, \, .., \0, 0x00-0x1F). |
| D5 일관성 | 9/10 | 기존 rate-limit.ts createRateLimiter 패턴 따름. 에러 응답 `{ error: { code, message, retryAfter } }` 컨벤션 일치. |
| D6 리스크 | 8/10 | Path traversal(knowledge.ts:623) 정확히 식별 — 진짜 보안 취약점. Magic bytes로 extension 위조 방지. 50MB vs 10MB 분리 판단 합리적. Minor: x-forwarded-for 체인 파싱 언급 없음(이슈 #2). |

## 가중 평균: 8.65/10 ✅ PASS

> D1(9×0.20) + D2(9×0.20) + D3(8×0.15) + D4(9×0.15) + D5(9×0.10) + D6(8×0.20) = 1.80 + 1.80 + 1.20 + 1.35 + 0.90 + 1.60 = **8.65**

---

## 이슈 목록

### LOW

1. **[D3 정확성] HSTS 설정 표기 불일치**
   - **위치**: Task 1.2 vs Dev Notes "HSTS via Hono secureHeaders"
   - **문제**: Task 1.2 = `{ maxAge: 31536000, includeSubDomains: true }` (object), Dev Notes = `'max-age=31536000; includeSubDomains'` (string). Hono는 양쪽 다 수용하나, 개발자가 어느 형식을 쓸지 혼란 가능.
   - **수정**: 둘 중 하나로 통일. Hono 문서에 object 형식이 정식.

2. **[D6 리스크] Rate limit IP 식별 — x-forwarded-for 체인 파싱**
   - **위치**: 기존 `rate-limit.ts:15` — `c.req.header('x-forwarded-for')` 전체 문자열 사용
   - **문제**: x-forwarded-for는 `client, proxy1, proxy2` 체인. Cloudflare 뒤에선 첫 번째 IP가 클라이언트이나, 코드는 전체 문자열을 키로 사용. 동일 클라이언트라도 프록시 체인 변경 시 다른 키 → rate limit 우회 가능.
   - **수정 제안**: `x-forwarded-for?.split(',')[0]?.trim()` 또는 Cloudflare의 `CF-Connecting-IP` 헤더 사용
   - **심각도**: LOW — Cloudflare가 자체적으로 DDoS 방어하므로 실질 리스크 낮음. 기존 코드 이슈이며 22.4 scope 밖이지만, `cliRateLimit` 추가 시 함께 개선 가능.

3. **[D1 구체성] HSTS preload 미언급**
   - **문제**: `preload` 디렉티브 없이 HSTS 설정. 브라우저 preload list 등록을 위해 향후 추가 가능하지만, 현재는 필수 아님. 명시적으로 "preload는 Phase 2+ 고려" 정도 노트 있으면 좋음.
   - **심각도**: LOW — 기능에 영향 없음.

---

## 제품 관점 평가

### 스코프 적절성: ✅ 우수
- "이미 올바른 것은 건드리지 않고 테스트로 검증" — 과잉 엔지니어링 없음
- 실제 보안 수정(path traversal, magic bytes, HSTS, rate limit)에 집중
- 50MB vs 10MB 분리 판단 근거 명확 (workspace files ≠ knowledge docs)

### 누락 항목: 없음
- NFR-S11: CSP + HSTS + X-Frame + X-Content + CORS 전부 커버
- NFR-S12: magic bytes + sanitization + size limit 전부 커버
- NFR-S13: CLI rate limit 커버

### 과잉 항목: 없음
- Malware scanning을 Phase 5+로 올바르게 디퍼 (NFR-S12 명시)

---

## Cross-talk 요약

- Winston에게: HSTS 표기 불일치와 x-forwarded-for 체인 파싱을 아키텍처 관점에서 확인 요청.
- Quinn에게: magic bytes 검증 로직이 6개 포맷 전부 커버하는지, sanitizeFilename 규칙이 OWASP path traversal 패턴 전부 방어하는지 QA 관점 확인 요청.

---

## 판정

**✅ PASS (8.65/10)** — NFR-S11/S12/S13 전부 충족. 보안 수정 적절. 스코프 균형 우수. LOW 이슈 3건은 개선 권고이나 블로커 아님.

---

## [Fixes Applied] 재검토 — 2026-03-24

Dev가 John 3건 + Winston 4건 + Quinn 3건 = 총 10건 수정 완료.

| # | 이슈 | 출처 | 상태 | 검증 |
|---|------|------|------|------|
| 1 | HSTS 포맷 불일치 | John | ✅ | Task 1.3: string `'max-age=31536000; includeSubDomains'`으로 통일. Dev Notes 일치. |
| 2 | x-forwarded-for 체인 파싱 | John+Quinn | ✅ | Task 3.1: `cf-connecting-ip` 우선 + `x-forwarded-for.split(',')[0]` 폴백. Dev Notes "CRITICAL FIX" 섹션 추가. |
| 3 | HSTS preload 미언급 | John | ✅ | Dev Notes line 139: "intentionally deferred — hstspreload.org submission required". |
| 4 | base-uri CSP 누락 | Winston | ✅ | Task 1.1: `baseUri: ["'self'"]` + `formAction: ["'self'"]` 추가. |
| 5 | upgrade-insecure-requests | Winston | ✅ | Task 1.2: `upgradeInsecureRequests: []` 추가 (prod only). |
| 6 | Rate limit 적용 지점 모호 | Winston | ✅ | Task 3.3: credentials.ts POST handler에 직접 적용 (index.ts 아님). |
| 7 | WebP RIFF+WEBP 이중 검증 | Winston | ✅ | Task 4.2: offset 0 RIFF + offset 8 WEBP 모두 체크. |
| 8 | SVG XSS 리스크 | Quinn | ✅ | Task 1.6: `image/svg+xml` 명시적 제외. Test 6.9 추가. |
| 9 | Unicode path traversal | Quinn | ✅ | Task 5.2: `name.normalize('NFC')` 선행. Test 6.8: `\u002e\u002e/` 케이스. |
| 10 | text/html inline XSS 노트 | Quinn | ✅ | SVG 제외로 가장 큰 리스크 차단. text/html은 download-only 유지. |

### 재채점

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | HSTS 포맷 통일. CSP 디렉티브 전부 명시. IP 추출 체인 구체적. |
| D2 완전성 | 10/10 | NFR-S11/S12/S13 완전 커버 + SVG 제외, base-uri, form-action, upgrade-insecure-requests 추가. OWASP 기준 충족. |
| D3 정확성 | 9/10 | 포맷 통일. WebP 이중 검증 정확. cf-connecting-ip 동작 설명 정확. |
| D4 실행가능성 | 9/10 | Task 구조 명확. 코드 스니펫 포함. Integration point 정확. |
| D5 일관성 | 9/10 | rate-limit.ts 패턴 유지. 에러 포맷 일치. |
| D6 리스크 | 9/10 | cf-connecting-ip로 rate limit 우회 차단. SVG XSS 차단. Unicode normalization. 포괄적 리스크 대응. |

### 가중 평균: 9.20/10 ✅ PASS

> D1(9×0.20) + D2(10×0.20) + D3(9×0.15) + D4(9×0.15) + D5(9×0.10) + D6(9×0.20) = 1.80 + 2.00 + 1.35 + 1.35 + 0.90 + 1.80 = **9.20**
