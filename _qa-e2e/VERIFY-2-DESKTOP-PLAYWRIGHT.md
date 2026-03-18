# 전수 E2E 교차 검증 — Desktop App Claude Code (Playwright MCP)

## 역할
CORTHEX v2 (https://corthex-hq.com) **모든 페이지의 모든 인터랙션** 교차 검증.
Agent 1(VS Code)과 **역순**으로 테스트 — CEO 먼저, Admin 나중.
**핵심: 버튼처럼 생겼는데 안 눌리는 것 전부 찾기.**

## 로그인
- **CEO**: `ceo` / `ceo1234` (먼저)
- **Admin**: `admin` / `admin1234` (나중)

## Playwright MCP 도구
`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_take_screenshot`, `browser_console_messages`, `browser_evaluate`, `browser_fill_form`

## 디자인 기준 (Natural Organic — 라이트 모드)
- 배경: **베이지 #faf8f5** (어두운 배경 = 버그)
- 사이드바: **올리브 다크 #283618**
- 액센트: **올리브그린 #606C38**
- `<html class="dark">` 있으면 = **버그**

---

## 절대 규칙

1. **스크린샷만 찍으면 미검사** — 눈에 보이는 모든 요소를 직접 조작
2. **"반응 없음"이 가장 중요한 버그** — 클릭 가능하게 생겼는데 아무 반응 없으면 반드시 기록
3. **href="#" 링크 전부 기록** — 링크인데 아무데도 안 가는 것
4. 매 페이지 아래 **자동 검사 스크립트** 필수 실행
5. 결과를 `_qa-e2e/playwright-claude-code/VERIFY-RESULT-2.md`에 기록

---

## 매 페이지 자동 검사 스크립트

```javascript
(() => {
  const clickables = document.querySelectorAll('button, a, [role="button"], [onclick], [tabindex="0"], input[type="submit"], input[type="button"], .cursor-pointer, [class*="hover:"]')
  const inputs = document.querySelectorAll('input:not([type="hidden"]), textarea, select, [contenteditable="true"], [role="textbox"], [role="combobox"]')
  const matSymbols = document.querySelectorAll('.material-symbols-outlined, [class*="material-symbols"]')
  const asides = document.querySelectorAll('aside')
  const fixedLeftAsides = [...asides].filter(a => {
    const s = getComputedStyle(a); return s.position === 'fixed' && a.getBoundingClientRect().left < 10
  })
  const deadLinks = [...document.querySelectorAll('a[href="#"], a[href=""], a:not([href])')].map(a => a.textContent?.trim()).filter(Boolean)

  return {
    page: window.location.pathname,
    clickableCount: clickables.length,
    inputCount: inputs.length,
    matSymbolCount: matSymbols.length,
    asideCount: asides.length,
    fixedLeftAsideCount: fixedLeftAsides.length,
    darkClass: document.documentElement.classList.contains('dark'),
    deadLinkCount: deadLinks.length,
    deadLinkTexts: deadLinks.slice(0, 30),
    bodyBg: getComputedStyle(document.body).backgroundColor,
  }
})()
```

---

## ROUND 1: CEO 계정 — 보안 먼저 + 25페이지 전수

```
browser_navigate → https://corthex-hq.com/login
ceo / ceo1234 로그인
```

### 1-1. CEO 보안 테스트 (심화)

```javascript
// Admin API 13개 한번에 테스트
const token = localStorage.getItem('corthex_token')
const apis = ['/api/admin/departments','/api/admin/users','/api/admin/agents','/api/admin/credentials','/api/admin/tier-configs','/api/admin/tools','/api/admin/companies','/api/admin/soul-templates','/api/admin/budget','/api/admin/report-lines','/api/admin/monitoring','/api/admin/workflows','/api/admin/costs/summary']
const r = await Promise.all(apis.map(async u => { const res = await fetch(u, {headers:{Authorization:'Bearer '+token}}); return {url:u,status:res.status} }))
r.filter(x => x.status !== 403) // 빈 배열이면 PASS
```

| # | 테스트 | 기대 | 판정 |
|---|--------|------|------|
| 1 | Admin API 13개 | 전부 403 | |
| 2 | /admin 직접 접근 | 리다이렉트/차단 | |
| 3 | /nexus "편집 모드" 토글 | CEO에겐 **안 보임** | |
| 4 | /nexus "Save Draft" | **안 보임** | |
| 5 | /nexus "Publish Changes" | **안 보임** | |

### 1-2. CEO 25페이지 전수 인터랙션

**각 페이지에서 반드시:**
1. 자동 검사 스크립트 실행
2. **눈에 보이는 모든 버튼** 클릭 → 반응 기록
3. **모든 입력 필드** 텍스트 입력
4. **모든 드롭다운** 열어서 선택
5. **모든 탭/토글** 클릭
6. **모든 링크** 클릭 → 이동 확인 (href="#"이면 기록)
7. **반응 없는 요소 전부 기록**
8. 콘솔 에러 기록

| # | 페이지 | 로드 | clickable수 | 클릭한수 | 반응없음수 | input수 | 입력한수 | deadLink수 | 콘솔에러 | 판정 |
|---|--------|------|-----------|---------|----------|--------|---------|----------|---------|------|
| 1 | /hub | | | | | | | | | |
| 2 | /dashboard | | | | | | | | | |
| 3 | /chat | | | | | | | | | |
| 4 | /agents | | | | | | | | | |
| 5 | /departments | | | | | | | | | |
| 6 | /tiers | | | | | | | | | |
| 7 | /jobs | | | | | | | | | |
| 8 | /reports | | | | | | | | | |
| 9 | /trading | | | | | | | | | |
| 10 | /nexus | | | | | | | | | |
| 11 | /knowledge | | | | | | | | | |
| 12 | /sns | | | | | | | | | |
| 13 | /messenger | | | | | | | | | |
| 14 | /agora | | | | | | | | | |
| 15 | /files | | | | | | | | | |
| 16 | /costs | | | | | | | | | |
| 17 | /performance | | | | | | | | | |
| 18 | /activity-log | | | | | | | | | |
| 19 | /ops-log | | | | | | | | | |
| 20 | /workflows | | | | | | | | | |
| 21 | /notifications | | | | | | | | | |
| 22 | /classified | | | | | | | | | |
| 23 | /settings | | | | | | | | | |
| 24 | /sketchvibe | | | | | | | | | |
| 25 | /onboarding | | | | | | | | | |

---

## ROUND 2: Admin 계정 — CRUD 심화 + Admin 패널

```
로그아웃 → admin / admin1234 로그인
```

### 2-1. CRUD 전체 사이클 (4개 대상)

#### 부서 CRUD (이전: UUID 에러로 전부 실패)

| # | 단계 | 조작 | 기대 | 실제 | 판정 |
|---|------|------|------|------|------|
| 1 | READ | /departments → snapshot | 4개 부서 카드 | | |
| 2 | CREATE | "새 부서 추가" → "QA팀" → 저장 | 성공 토스트 | | |
| 3 | READ 확인 | snapshot | 5개 부서 | | |
| 4 | UPDATE | QA팀 편집 → "품질관리팀" → 저장 | 반영됨 | | |
| 5 | DELETE | 삭제 → 확인 | 사라짐 | | |
| 6 | 콘솔 500 | console | **0개** | | |

#### 에이전트 CRUD (이전: 500 빈 목록)

| # | 단계 | 조작 | 기대 | 실제 | 판정 |
|---|------|------|------|------|------|
| 1 | READ | /agents | 카드 보임 | | |
| 2 | CREATE | "테스트봇" → 저장 | 성공 | | |
| 3 | UPDATE | "테스트봇2" → 저장 | 반영 | | |
| 4 | DELETE | 삭제 → 확인 | 사라짐 | | |
| 5 | 비서실장 삭제 | 삭제 클릭 | **거부** (FR33) | | |

#### 작업 CRUD

| # | 단계 | 조작 | 기대 | 판정 |
|---|------|------|------|------|
| 1 | CREATE | 에이전트 선택 → 지시 입력 → 등록 | "작업이 등록되었습니다" | |
| 2 | DELETE | 삭제 → 확인 | "작업이 취소되었습니다" | |

#### 워크플로우 CRUD

| # | 단계 | 조작 | 기대 | 판정 |
|---|------|------|------|------|
| 1 | CREATE | 이름/설명/단계 → 생성 | 카드 추가 | |
| 2 | DELETE | 삭제 → 확인 | 사라짐 | |

### 2-2. Admin App 25페이지 전수

ROUND 1과 동일 — 모든 버튼 클릭, 모든 입력, 반응 없는 것 전부 기록.

### 2-3. Admin 패널 16페이지

```
browser_navigate → /admin/login → admin / admin1234
```

| # | 페이지 | 로드 | 500수 | clickable | 클릭한 | 반응없음 | input | 입력한 | 판정 |
|---|--------|------|------|----------|-------|---------|------|-------|------|
| 1 | /admin | | | | | | | | |
| 2 | /admin/users | | | | | | | | |
| 3 | /admin/employees | | | | | | | | |
| 4 | /admin/departments | | | | | | | | |
| 5 | /admin/agents | | | | | | | | |
| 6 | /admin/credentials | | | | | | | | |
| 7 | /admin/tools | | | | | | | | |
| 8 | /admin/costs | | | | | | | | |
| 9 | /admin/report-lines | | | | | | | | |
| 10 | /admin/soul-templates | | | | | | | | |
| 11 | /admin/monitoring | | | | | | | | |
| 12 | /admin/nexus | | | | | | | | |
| 13 | /admin/onboarding | | | | | | | | |
| 14 | /admin/settings | | | | | | | | |
| 15 | /admin/companies | | | | | | | | |
| 16 | /admin/workflows | | | | | | | | |

---

## 출력

`_qa-e2e/playwright-claude-code/VERIFY-RESULT-2.md`에 기록:

```markdown
# 전수 E2E 교차 검증 리포트 (Agent 2)
> 검증일: {날짜}

## 요약
| 항목 | 수치 |
|------|------|
| 검사 페이지 | /66 |
| 총 클릭 요소 | |
| **반응 없는 요소** | |
| **빈 링크 (href="#")** | |
| 콘솔 403 | |
| 콘솔 500 | |

## 반응 없는 요소 (가장 중요!)
### /페이지명
| 요소 | 타입 | 결과 | 원인 추정 |
|------|------|------|----------|

## 빈 링크 (href="#")
### /페이지명
| 링크 텍스트 | 위치 |
|-----------|------|

## CRUD 결과
| 대상 | C | R | U | D |
|------|---|---|---|---|

## CEO 보안
| 항목 | 결과 |
|------|------|

## 새로 발견된 버그
### BUG-V2-001: {요약}
```

## 규칙
- **코드 수정 금지.** 검증 + 기록만.
- **git commit/push 금지.**
- **반응 없는 요소 = 최고 우선 버그.** 전부 기록.
- **href="#" = 빈 링크.** 전부 기록.
- 스크린샷만 = 미검사.
