# CRITIC-A Review — arch-step04+05 (D22–D29 Decisions + E11–E17 Patterns)

**Reviewer:** CRITIC-A (John/PM, Sally/UX, Mary/BA)
**Target:** architecture.md lines 472–1166 (Steps 04 + 05)
**Date:** 2026-03-14
**Score: 7/10**

---

## Summary

D22–D29 결정들은 Context/Options/Decision/Rationale/Consequences 5항목 구조가 완전하고 논리적으로 일관성이 있다. E11–E17 패턴들은 7개 잠재 충돌 지점을 모두 커버하며 CORRECT/WRONG 예시와 grep 검증 체크리스트까지 포함해 구현 가이드로서 실용적이다. 그러나 **PRD 미승인 채널 scope creep(slack_dm)**, **MCP 네임스페이스 포맷 PRD와 불일치**, **E16 에러 코드 의미 충돌** 3개의 significant 이슈와 4개의 moderate 이슈가 발견되었다.

---

## John (PM) — D22–D29 PRD/기존 결정 정합성

### Issue #1 — SIGNIFICANT: `slack_dm` Phase 2 채널 PRD 미승인 scope creep (lines 648, 1000–1003)

**D27 Consequences (line 648):**
> `save_report` Phase 1 채널: `web_dashboard`, `pdf_email`. Phase 2: **`slack_dm`**. Phase 3: `notion_page`. Phase 4: `google_drive`.

**E15 채널 정의 (lines 1000–1003):**
```
// Phase 1: web_dashboard, pdf_email
// Phase 2: slack_dm     ← ❌
// Phase 3: notion_page  ← ❌
// Phase 4: google_drive
```

PRD FR-RM1 (line 961) 공식 채널 목록:
- web_dashboard: Phase 1 ✅
- pdf_email: Phase 1 ✅
- notion: Phase 2 ✅
- google_drive: Phase 4 ✅
- notebooklm: Phase 2 ✅

**`slack_dm`은 PRD 어디에도 없다.** `notion_page`도 PRD는 `notion`으로 표기(Notion MCP를 통한 채널). PRD line 917 "Capability Contract — 이 섹션에 열거된 기능만 구현 대상. 여기에 없는 기능은 최종 제품에 존재하지 않습니다."를 직접 위반.

**수정:** D27 Consequences와 E15 채널 목록을 PRD FR-RM1과 정확히 일치시킬 것:
- Phase 1: web_dashboard, pdf_email
- Phase 2: notion (not notion_page — Notion MCP 채널명)
- Phase 2: notebooklm
- Phase 4: google_drive
- slack_dm: 삭제

---

### Issue #2 — SIGNIFICANT: MCP 도구 네임스페이스 포맷 PRD와 불일치 (E12 line 816, PRD line 943)

**Architecture E12 (line 814–816):**
```typescript
name: `${mcpServerId}:${t.name}`  // UUID prefix + 콜론 구분자
// 예: "550e8400-e29b-41d4-a716-446655440000:create_page"
```

**PRD FR-MCP4 (line 943):**
```
(네임스페이싱: "notion__create_page", "playwright__click" — 충돌 방지)
```

PRD는 `{server_display_name}__{tool_name}` (더블 언더스코어) 형식을 명시하지만, 아키텍처는 `{uuid}:{tool_name}` (콜론) 형식을 사용한다.

**3가지 문제:**
1. UUID 네임스페이스는 LLM에게 불투명 — `notion__create_page`는 맥락이 명확하지만 `550e8400-...:create_page`는 LLM이 어떤 MCP 서버인지 이해 불가
2. 콜론(`:`) 구분자는 도구 이름 내 콜론과 충돌 가능
3. PRD-명시 포맷과 아키텍처 포맷 불일치 → 테스트 케이스/에픽 구현 혼란

**수정:** `${mcpServerId}:${t.name}` → `${mcpServerConfig.displayName.toLowerCase().replace(/\s+/g,'_')}__${t.name}` 또는 mcp_server_configs에 `slug` 컬럼 추가 후 `${slug}__${t.name}` 사용. PRD 포맷과 일치시킬 것.

---

### Issue #3 — SIGNIFICANT: E16 HTTP 401/403 → AGENT_MCP_CREDENTIAL_MISSING 의미 충돌 (line 1034)

**E16 에러 매핑 (lines 1033–1034):**
```typescript
if (status === 401 || status === 403)
  throw new ToolError('AGENT_MCP_CREDENTIAL_MISSING', `${apiName}: auth failed (${status})`);
```

`AGENT_MCP_CREDENTIAL_MISSING` 정의 (PRD line 1097):
> "MCP spawn 시 credential 미등록"

이 에러 코드는 **MCP 서버 SPAWN 전 credential 템플릿 미해석**에 대한 코드다. 그런데 E16에서는 Tistory API 401, Cloudflare R2 403 등 **빌트인 도구의 HTTP 인증 실패**에도 동일 코드를 사용한다.

결과: Admin이 `AGENT_MCP_CREDENTIAL_MISSING` 에러를 보고 MCP 서버 설정을 확인하러 가지만, 실제 문제는 Tistory 토큰 만료. 잘못된 디버깅 방향 유도.

**수정:** 빌트인 도구 HTTP 401/403에 대한 별도 에러 코드 추가:
- `TOOL_AUTH_FAILED: {service_name}` — credential이 등록됐지만 거부됨 (만료/잘못된 값)
- `AGENT_MCP_CREDENTIAL_MISSING`은 MCP spawn 전 credential 미발견 시에만 사용 (D26, RESOLVE 단계)

에러 코드 extension 목록 (line 108)에 `TOOL_AUTH_FAILED` 추가 필요.

---

## Sally (UX) — 패턴 구현 정확성 및 충돌

### Issue #4 — MODERATE: `AGENT_MCP_SPAWN_TIMEOUT` 에러 코드 미등재 (D26 line 634, line 108)

D26 Consequences (line 634):
> "120s 초과 시 `AGENT_MCP_SPAWN_TIMEOUT` 에러 코드 반환"

그러나 Cross-Cutting Concerns의 에러 코드 확장 목록 (line 108)에 `AGENT_MCP_SPAWN_TIMEOUT`이 없다. NFR-R1: "모든 도구 실패 = TOOL_/AGENT_ prefix typed error 코드" — 문서화되지 않은 에러 코드는 NFR-R1 위반.

**수정:** line 108 에러 코드 목록에 `AGENT_MCP_SPAWN_TIMEOUT` 추가.

### Issue #5 — MODERATE: `updateReportDistribution` getDB() 메서드 정의 없음 (E15 line 986, getDB() lines 355–432)

E15 save_report 핸들러 (line 986):
```typescript
await getDB(ctx.companyId).updateReportDistribution(report.id, distributionResults);
```

E3 확장점 getDB() 메서드 목록 (lines 355–432)에 `updateReportDistribution`이 없다. `insertReport`만 정의됨. 구현 에이전트가 이 메서드를 자의적으로 구현할 경우 reports 테이블 스키마와 불일치 위험.

**수정:** getDB() 확장 섹션에 추가:
```typescript
updateReportDistribution: (id: string, distributionResults: Record<string, string>) =>
  db.update(reports).set({ distributionResults })
    .where(and(eq(reports.id, id), eq(reports.companyId, companyId))),
```

### Issue #6 — MODERATE: E17 코드 예시에서 `startTime` 미선언 (lines 1098, 1109)

E17 code example:
```typescript
durationMs: Date.now() - startTime,  // line 1098, 1109
// ❌ startTime이 선언되지 않음 — ReferenceError
```

`startTime` 변수가 코드 예시 어디에도 선언되지 않았다. 구현 에이전트가 이 패턴을 그대로 따르면 ReferenceError.

**수정:** insertToolCallEvent 호출 직전에 `const startTime = Date.now();` 추가.

### Issue #7 — MODERATE: AES-GCM 저장 포맷 설명 3곳 불일치 (lines 171, 546, 749)

- Line 171 (credentials 스키마 주석): `// AES-256-GCM: base64(iv:tag:ciphertext)` — 단일 base64 블록?
- Line 546 (D23 코드 주석): `// AES-256-GCM: base64(iv:authTag:ciphertext) 형식` — 동일 오류
- Line 749 (E11): `base64(iv):base64(authTag+ciphertext)` — 실제 코드와 일치 ✅

코드(lines 553, 557–558)의 실제 동작: `base64(iv) + ':' + base64(ciphertext_including_authTag)` — 2개의 base64 블록이 ':' 로 구분. Line 749만 맞고 171, 546은 틀렸다.

구현 에이전트가 line 171 스키마 주석을 먼저 읽으면 단일 base64 블록으로 오해해 다른 포맷 구현 가능.

**수정:** Line 171: `// AES-256-GCM: base64(iv):base64(ciphertext+authTag)`로 통일. Line 546 동일 수정.

---

## Mary (BA) — 엔지니어링 리스크 & E1–E10 충돌

### Issue #8 — MINOR: E14 p-queue TimeoutError가 E16 callExternalApi에서 처리되지 않음 (line 912)

E14 withPuppeteer (line 912) 주석:
> "timeout 초과 시 p-queue가 TimeoutError throw → E16에서 TOOL_RESOURCE_UNAVAILABLE로 변환"

E16 callExternalApi (lines 1031–1040):
```typescript
if (err instanceof Response || (err as any).status) { ... }
// TimeoutError는 .status 없음 → 아래로 fall-through
throw new ToolError('TOOL_EXTERNAL_SERVICE_ERROR', ...);  // ← 잘못된 코드!
```

p-queue `TimeoutError`는 `.status` 프로퍼티가 없어서 HTTP 에러 분기를 타지 않고, 최종 catch에서 `TOOL_EXTERNAL_SERVICE_ERROR`로 잘못 변환된다. `TOOL_RESOURCE_UNAVAILABLE`이 나와야 할 곳에 다른 코드가 반환되어 모니터링 알림/에이전트 재시도 로직 오판 가능.

**수정:** E14의 `withPuppeteer`에서 TimeoutError를 직접 catch:
```typescript
} catch (err) {
  if (err instanceof PQueue.TimeoutError) {
    throw new ToolError('TOOL_RESOURCE_UNAVAILABLE', 'puppeteer_pool_timeout');
  }
  throw err;
}
```
또는 E16 callExternalApi에 `PQueue.TimeoutError` 분기 추가.

### Issue #9 — MINOR: Enforcement grep 패턴이 `Promise.allSettled`를 false positive 포함 (line 1161)

```bash
grep -r 'Promise.all(' tool-handlers/  # ← 'Promise.allSettled('도 매칭됨
```

`Promise.allSettled(`는 허용된 패턴인데 `Promise.all(`을 포함해서 grep 위반으로 잘못 분류됨.

**수정:** `grep -r 'Promise\.all(' tool-handlers/ | grep -v allSettled`

---

## D22–D29 결정 구조 완전성 평가

| 결정 | Context | Options | Decision | Rationale | Consequences | 평가 |
|------|---------|---------|---------|-----------|-------------|------|
| D22 | ✅ | ✅ (3개) | ✅ | ✅ | ✅ | 완전 |
| D23 | ✅ | ✅ (3개) | ✅ | ✅ | ✅ | 완전 |
| D24 | ✅ | ✅ (3개) | ✅ | ✅ | ✅ | 완전 |
| D25 | ✅ | ✅ (3개) | ✅ | ✅ | ✅ | 완전 |
| D26 | ✅ | ✅ (3개) | ✅ | ✅ | ✅ | AGENT_MCP_SPAWN_TIMEOUT 미등재 |
| D27 | ✅ | ✅ (3개) | ✅ | ✅ | ⚠️ | slack_dm scope creep |
| D28 | ✅ | ✅ (3개) | ✅ | ✅ | ✅ | 완전 |
| D29 | ✅ | ✅ (3개) | ✅ | ✅ | ✅ | 완전 |

## E11–E17 패턴 충돌 커버리지

| 잠재 충돌 | 패턴 | 커버 | 비고 |
|---------|------|------|------|
| AES-256 포맷 불일치 | E11 | ✅ | 포맷 설명 3곳 불일치 (Issue #7) |
| MCP 도구 이름 충돌 | E12 | ⚠️ | PRD 포맷과 다름 (Issue #2) |
| 빌트인 핸들러 에러 형식 | E13 | ✅ | - |
| Puppeteer 풀 고갈 | E14 | ✅ | TimeoutError 변환 버그 (Issue #8) |
| save_report 부분 실패 | E15 | ✅ | slack_dm scope creep, updateReportDistribution 누락 |
| 외부 API 에러 코드 | E16 | ⚠️ | 401/403 의미 충돌 (Issue #3) |
| telemetry 기록 타이밍 | E17 | ✅ | startTime 미선언 (Issue #6) |

---

## Issues Summary

| # | 심각도 | 위치 | 이슈 |
|---|-------|------|------|
| 1 | SIGNIFICANT | D27 line 648, E15 lines 1000–1003 | slack_dm PRD 미승인 scope creep |
| 2 | SIGNIFICANT | E12 line 816 | MCP 네임스페이스 UUID:tool vs PRD notion__tool |
| 3 | SIGNIFICANT | E16 line 1034 | 401/403 → AGENT_MCP_CREDENTIAL_MISSING 의미 충돌 |
| 4 | MODERATE | D26 line 634, line 108 | AGENT_MCP_SPAWN_TIMEOUT 에러 코드 미등재 |
| 5 | MODERATE | E15 line 986 | updateReportDistribution getDB() 메서드 정의 없음 |
| 6 | MODERATE | E17 lines 1098, 1109 | startTime 변수 미선언 |
| 7 | MODERATE | lines 171, 546, 749 | AES-GCM 저장 포맷 설명 3곳 불일치 |
| 8 | MINOR | E14 line 912 | p-queue TimeoutError → E16에서 잘못된 에러코드 변환 |
| 9 | MINOR | line 1161 | grep 패턴 false positive (allSettled 매칭) |

**Score: 7/10** — 결정 구조 완전성과 패턴 커버리지는 우수. PRD 위반(scope creep) + 2개 의미적 오류 + 4개 구현 갭 수정 필요.
