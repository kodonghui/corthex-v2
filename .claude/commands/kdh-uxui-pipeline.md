---
name: 'kdh-uxui-pipeline'
description: 'UXUI 리팩토링 파이프라인. Playwright QA + Banana2 디자인 + Party Mode 리뷰. Usage: /kdh-uxui-pipeline [phase0|phase1|spec PAGENAME|code PAGENAME|phase3|final]'
---

# CORTHEX UXUI Refactoring Pipeline

Playwright QA + Banana2 디자인 + BMAD Party Mode를 결합한 UXUI 리팩토링 자동화 파이프라인.
**이 PC(VS Code) 한 곳에서 전부 진행.** VPS는 서버만 운영.

## Mode Selection

- `phase0`: Playwright 환경 세팅 (한 번만)
- `phase1`: 현재 기능 상태 점검 (스모크 테스트)
- `spec PAGENAME`: 해당 페이지 설명서 작성 + 파티모드 리뷰
- `spec-batch PRIORITY`: 해당 우선순위의 모든 페이지 설명서 일괄 작성 (예: `spec-batch 1`)
- `image-prompt PRIORITY`: 해당 우선순위의 Gemini 이미지 생성 프롬프트 일괄 출력
- `code PAGENAME`: 이미지 보고 코딩 + 파티모드 리뷰 + Playwright 테스트
- `phase3`: 시각 회귀 테스트 기준 이미지 등록
- `final`: 최종 전체 검증
- 인자 없음: 진행 상황 표시 + 다음 작업 안내

---

## 작업 환경

```
이 PC (VS Code) 한 곳에서 전부 진행

Claude Code         → 설명서 작성, 코딩, 테스트 작성, 파티모드 리뷰
Playwright 확장      → ▶ 클릭으로 테스트 실행 + 브라우저 실시간 확인
사용자              → Banana2 이미지 생성 (같은 PC 브라우저)

테스트 대상: 배포 사이트 (https://corthex-hq.com)
```

---

## Party Mode: UXUI 전용 (핵심)

BMAD의 7명 전문가가 **UX/UI 관점에서** 리뷰. **2라운드** 구조 (Collaborative + Adversarial). UX 중심 체크포인트 추가.

### YOLO 모드 (절대 규칙)
```
- 파티모드는 완전 자동 실행 — 사용자 입력/확인/메뉴 표시 금지
- 7명 전문가 역할극을 Claude가 혼자 다 수행
- 매 라운드 시작 시 파일에서 다시 읽기 (기억으로 리뷰 금지)
- 이슈 발견 → 즉시 수정 → 다음 라운드로 자동 진행
- PASS/FAIL 판정도 자동 — 사용자에게 "어떻게 할까요?" 물어보지 말 것
- FAIL이면 자동으로 수정 → 재실행
```

### 7명 전문가 프로필 (역할극용)

**📋 John (PM — Product Manager)**
- 성격: "WHY?"를 끊임없이 묻는 형사 같은 스타일. 직설적이고 날카로움. 군더더기 싫어함.
- UXUI 관점: 사용자 가치, 요구사항 갭, 우선순위. v1에서 동작했던 기능이 빠지면 즉시 지적.
- 말투 예시: "이 페이지의 핵심 사용자 시나리오가 뭐죠? 3클릭 안에 끝나나요?"

**🏗️ Winston (Architect)**
- 성격: 차분하고 실용적. "할 수 있는 것"과 "해야 하는 것"의 균형을 잡음.
- UXUI 관점: 컴포넌트 구조, Tailwind 클래스 합리성, 재사용성, 하드코딩 값 감지.
- 말투 예시: "이 레이아웃은 그리드 시스템으로 가는 게 맞겠습니다. 다만 breakpoint 설계는..."

**🎨 Sally (UX Designer)**
- 성격: 공감 능력 높은 사용자 옹호자. 문제를 "느끼게" 만듦. 그림을 그리듯 설명.
- UXUI 관점: 사용자 흐름, 접근성, 인터랙션, 반응형, 시각적 위계, 빈 상태/에러 상태.
- 말투 예시: "처음 이 화면을 보는 신입 직원을 상상해보세요. 버튼이 5개나 되면 어디를 먼저..."

**💻 Amelia (Developer)**
- 성격: 초간결. 파일 경로와 코드로 말함. 군더더기 제로, 정밀도 극대화.
- UXUI 관점: data-testid 누락, 구현 가능성, 기능 로직 변경 여부 감시, 기술 부채.
- 말투 예시: "data-testid 3개 누락: submit-btn, filter-dropdown, empty-state. 추가 필요."

**🧪 Quinn (QA Engineer)**
- 성격: 실용적이고 직설적. "일단 보내고 개선하자" 스타일. 커버리지 우선.
- UXUI 관점: 엣지케이스(빈 상태, 에러, 로딩), 테스트 커버리지, 콘솔 에러, 회귀 리스크.
- 말투 예시: "로딩 중일 때 skeleton UI가 없네요. 빈 상태도 정의 안 됨. 이거 둘 다 필요."

**🏃 Bob (Scrum Master)**
- 성격: 간결하고 체크리스트 중심. 모호함에 대한 관용 제로.
- UXUI 관점: 작업 범위 현실성, UI만 변경하는지 감시, 다른 페이지 영향 없는지 확인.
- 말투 예시: "범위 확인: 이 PR은 command-center 페이지 UI만 건드리는 거죠? API 변경 없죠?"

**📊 Mary (Business Analyst)**
- 성격: 보물찾기하듯 흥분하는 스타일. 패턴 발견하면 에너지 폭발. 분석을 발견처럼 만듦.
- UXUI 관점: 비즈니스 가치, 사용자가 핵심 작업을 쉽게 완료할 수 있는지, 시장 기대치.
- 말투 예시: "오! 이 대시보드 레이아웃이면 관리자가 한눈에 팀 성과를 파악할 수 있겠어요!"

### Party Mode 적용 시점

| 단계 | 파티모드 | 무엇을 리뷰하는가 |
|------|---------|------------------|
| **설명서 작성 후** | 2라운드 | 디자인 방향이 맞는지, UX가 합리적인지 |
| **코딩 완료 후** | 2라운드 | 구현이 설명서와 일치하는지, 반응형/접근성 |
| 테스트 | 파티모드 없음 | Playwright가 자동 검증 |

**총: 페이지당 4라운드 (설명서 2 + 코딩 2)**

### UXUI 전용 체크포인트 (기존 파티모드에 추가)

**설명서 리뷰 시:**
```
- Sally(UX): 사용자 흐름이 자연스러운가? 핵심 동작이 3클릭 이내인가?
- Winston(Architect): 컴포넌트 구조가 합리적인가? 재사용 가능한가?
- Amelia(Dev): data-testid 목록이 빠짐없는가? 구현 가능한가?
- Quinn(QA): 엣지케이스(빈 상태, 에러, 로딩)가 정의되어 있는가?
- John(PM): v1에서 동작했던 기능이 모두 커버되는가?
- Bob(SM): 작업 범위가 현실적인가? UI만 바꾸고 기능은 안 건드리는가?
- Mary(BA): 이 페이지의 비즈니스 가치가 명확한가?
```

**코딩 리뷰 시:**
```
- Sally(UX): 디자인 이미지와 구현이 일치하는가? 반응형 깨지는 곳 없는가?
- Winston(Architect): Tailwind 클래스가 합리적인가? 하드코딩된 값 없는가?
- Amelia(Dev): data-testid가 전부 추가됐는가? 기능 로직을 건드리지 않았는가?
- Quinn(QA): 콘솔 에러 없는가? 로딩/에러/빈 상태 처리됐는가?
- John(PM): v1에서 동작했던 기능이 깨지지 않았는가?
- Bob(SM): 변경 범위가 해당 페이지에 한정되는가? 다른 페이지 영향 없는가?
- Mary(BA): 사용자가 이 화면에서 핵심 작업을 쉽게 완료할 수 있는가?
```

### Party Log 저장 위치

```
_uxui-refactoring/party-logs/
├── spec-01-command-center-round1.md
├── spec-01-command-center-round2.md
├── code-01-command-center-round1.md
├── code-01-command-center-round2.md
...
```

### Round 구조 (2라운드 — 각 step별 2번)

**Round 1 (Collaborative Lens):**
- 전문가 7명 전원이 우호적 관점에서 리뷰
- 각 전문가가 자기 전문 분야에서 **3~5문장** 코멘트 (인격 반영 필수)
- **최소 2개 이슈 발견** (0개 = 재분석 — 이슈 없는 리뷰는 존재하지 않음)
- 크로스톡 2회 이상 (전문가끼리 의견 주고받기, 반박/보충)
- 발견된 이슈 즉시 스펙 수정 후 Round 2로
- v1-feature-spec.md 교차 확인 시작 (해당 페이지 기능이 전부 커버되는지)

**Round 2 (Adversarial Lens):**
- 전문가 전원이 **적대적 관점으로 전환** — 일부러 문제를 찾으려고 함
- Round 1에서 수정한 것이 진짜 고쳐졌는지 검증 (체크리스트 형태)
- v1-feature-spec.md 기능 커버리지 **최종 확인** (v1에서 됐던 거 빠졌는지)
- UXUI 전용 체크포인트 검증 (아래 체크리스트)
- **최소 1개 새 이슈 발견** (Round 1에서 안 나온 것)
- 이슈 심각도 분류: Critical / Major / Medium / Low
- 품질 점수 X/10
- PASS (7+) 또는 FAIL (6-)
- FAIL 시 이슈 수정 → 2라운드 재실행

### 적대적 리뷰 지침 (Round 2)

```
전문가별 적대적 모드 행동:
- John(PM): "이 기능 v1에서 됐는데 왜 빠졌죠?" — v1-feature-spec 하나하나 대조
- Winston(Architect): "이 구조는 깨집니다" — breakpoint 전환, 컴포넌트 경계 문제 탐색
- Sally(UX): "이 흐름은 사용자를 혼란스럽게 합니다" — 최악의 사용자 시나리오 상상
- Amelia(Dev): "testid가 N개 빠졌습니다" — 모든 인터랙션 요소 하나하나 대조
- Quinn(QA): "이 엣지케이스는 정의 안 됐습니다" — 빈 상태/에러/타임아웃/권한 없음 등
- Bob(SM): "이건 범위를 넘습니다" / "이건 범위 안에서 빠졌습니다" — 범위 경계 감시
- Mary(BA): "비즈니스 관점에서 이건 가치가 없습니다" — ROI와 사용자 임팩트 검증
```

### 이슈 심각도 기준

```
Critical: 기존 기능 누락, 핵심 사용 흐름 불가능, 데이터 바인딩 오류
Major:    반응형 깨짐, 중요 testid 누락, 상태 정의 누락 (에러/로딩/빈)
Medium:   프롬프트 불완전, 색상 체계 불일치, 엣지케이스 미정의
Low:      구현 시 해결 가능한 세부사항, 선택적 개선, 문서 표현 보완
```

### 파티 로그 포맷 템플릿

**Round 1 로그:**
```markdown
# Party Mode Round 1 (Collaborative) — {페이지명}

> 날짜: {YYYY-MM-DD}
> 문서: _uxui-refactoring/specs/{번호}-{페이지명}.md
> 리뷰어: 7-expert panel (Collaborative Lens)

---

## 전문가 리뷰

### John (PM)
{3~5문장, 인격 반영, v1 기능 커버리지 확인}

### Winston (Architect)
{3~5문장, 컴포넌트 구조/breakpoint 분석}

### Sally (UX)
{3~5문장, 사용자 흐름/3클릭/반응형 분석}

### Amelia (Dev)
{3~5문장, testid 커버리지/구현 가능성}

### Quinn (QA)
{3~5문장, 엣지케이스/테스트 커버리지}

### Bob (SM)
{3~5문장, 범위 확인/리스크}

### Mary (BA)
{3~5문장, 비즈니스 가치/사용자 임팩트}

---

## 크로스톡

**{전문가A} → {전문가B}:** "{의견}"
**{전문가B} → {전문가A}:** "{반박 또는 보충}"

**{전문가C} → {전문가D}:** "{의견}"

---

## 발견된 이슈

| # | 심각도 | 발견자 | 이슈 | 수정 방법 |
|---|--------|--------|------|-----------|
| 1 | {Critical/Major/Medium/Low} | {이름} | {설명} | {해결책} |
| 2 | ... | ... | ... | ... |

**수정 적용:** {수정된 내용 요약}

---
```

**Round 2 로그:**
```markdown
# Party Mode Round 2 (Adversarial) — {페이지명}

> 날짜: {YYYY-MM-DD}
> 문서: _uxui-refactoring/specs/{번호}-{페이지명}.md
> 리뷰어: 7-expert panel (Adversarial Lens)

---

## Round 1 이슈 반영 확인

| # | Round 1 이슈 | 반영 여부 |
|---|-------------|----------|
| 1 | {이슈 설명} | [x] 반영됨 — {어디에 어떻게} |
| 2 | ... | ... |

---

## 전문가 리뷰 (적대적 관점)

### John (PM)
{적대적으로 v1-feature-spec 하나하나 대조, 누락 기능 지적}

### Winston (Architect)
{적대적으로 구조 약점 탐색, breakpoint 전환 문제}

### Sally (UX)
{적대적으로 최악의 사용자 시나리오 상상, 접근성 문제}

### Amelia (Dev)
{적대적으로 testid 하나하나 대조, 구현 불가능한 부분}

### Quinn (QA)
{적대적으로 엣지케이스 발굴, 테스트 불가능한 시나리오}

### Bob (SM)
{적대적으로 범위 침범/누락 감시}

### Mary (BA)
{적대적으로 비즈니스 가치 의문 제기}

---

## 크로스톡

**{전문가A} <-> {전문가B}:** {토론 요약}

---

## 신규 발견 이슈

| # | 심각도 | 발견자 | 이슈 | 제안 |
|---|--------|--------|------|------|
| 1 | {Critical/Major/Medium/Low} | {이름} | {설명} | {해결책} |

---

## UXUI 체크포인트

- [x/] 핵심 동작 3클릭 이내 — {구체적 확인 내용}
- [x/] 빈 상태/에러 상태/로딩 상태 정의됨 — {구체적 확인 내용}
- [x/] data-testid가 모든 인터랙션 요소에 할당됨 — {N}개 testid
- [x/] 기존 기능 전부 커버 — {v1-feature-spec 참조 결과}
- [x/] Banana2 프롬프트가 컨텍스트+기능 중심으로 작성됨
- [x/] 반응형 breakpoint (375px, 768px, 1440px) 명시
- [x/] 기능 로직은 안 건드리고 UI만 변경하는 범위

---

## 품질 점수: X/10

**감점 사유:**
- -{N}: {이유}

**강점:**
- {목록}

## 판정: PASS / FAIL
```

---

## 권장 워크플로우: 배치 방식

효율을 위해 **한 페이지씩** 돌리지 않고 **우선순위 그룹 단위**로 배치 처리.

```
[파일럿] 01번 페이지 1개를 spec → image → code 끝까지 완주
  ↓ 파이프라인 검증 완료
[배치] 나머지 페이지를 우선순위별로 몰아서 처리:
  1. spec-batch 1  → 1순위 나머지 설명서 일괄 작성 (파티모드 각각 2라운드)
  2. image-prompt 1 → Gemini한테 줄 프롬프트 일괄 출력 → 사용자가 Gemini에게 전달
  3. Gemini가 이미지 일괄 생성 → designs/ 폴더에 저장
  4. code 페이지명 → 페이지별 순차 코딩 (이미지 참고)
```

### 이미지 생성: Gemini 위임 방식

이미지는 사용자가 직접 만들지 않고 **Gemini(Banana2)한테 위임**.
Claude가 Gemini한테 줄 프롬프트를 생성하고, 사용자가 Gemini에게 전달.

**Gemini 프롬프트 필수 맥락 (01번 파일럿에서 확인됨):**
```
1. "콘텐츠 영역만 디자인" — 앱에 이미 사이드바/헤더가 있으므로 포함 금지
2. "군사 테마 아님" — v1 테마에 얽매이지 않음, 모던 SaaS 생산성 도구
3. "톤/레이아웃 자유" — Gemini가 최적 판단
4. "설명서 파일 읽기" — specs/{번호}-{페이지명}.md를 먼저 읽고 기능 요소 파악
5. "실제 앱 스크린샷처럼" — 와이어프레임/목업 아닌 프로덕션 품질
6. 저장 위치: _uxui-refactoring/designs/{번호}-{페이지명}-desktop.png, mobile.png
```

---

## Mode: phase0 (Playwright 환경 세팅)

한 번만 실행. Playwright + 테스트 파일 골격 생성.

### 실행 순서

```
1. packages/e2e/ 디렉토리 생성
2. package.json 생성
3. playwright.config.ts 생성 (배포 URL 기준)
4. auth.setup.ts 생성 (로그인 자동화)
5. .env.test 템플릿 생성
6. smoke 테스트 파일 생성 (app + admin)
7. .gitignore 업데이트
8. npx playwright install chromium
9. 사용자에게 .env.test 비밀번호 입력 요청
```

### playwright.config.ts (핵심 설정)

```typescript
import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.test' })

export default defineConfig({
  testDir: './src/tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 1,
  reporter: [
    ['html', { open: 'never', outputFolder: 'reports/html' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://corthex-hq.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'auth-setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'app',
      use: { ...devices['Desktop Chrome'], storageState: 'src/fixtures/.auth/user.json' },
      dependencies: ['auth-setup'],
    },
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.ADMIN_URL || 'https://corthex-hq.com/admin',
        storageState: 'src/fixtures/.auth/admin.json',
      },
      dependencies: ['auth-setup'],
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'], storageState: 'src/fixtures/.auth/user.json' },
      dependencies: ['auth-setup'],
    },
  ],
})
```

### 완료 조건
- `npx playwright test --list` 에서 테스트 목록 표시됨
- 사용자가 `.env.test`에 비밀번호 입력 완료

---

## Mode: phase1 (현재 기능 상태 점검)

### 실행 순서

```
1. npx playwright test src/tests/smoke/ 실행
2. 결과 파싱 (통과/실패 페이지 분류)
3. _uxui-refactoring/phase1-baseline.md 에 결과 기록
4. 요약 보고 (앱 ??/23 통과, 어드민 ??/19 통과)
```

### 앱 라우트 (23개)
```
/ /command-center /chat /jobs /reports /sns /messenger
/dashboard /ops-log /nexus /trading /files /org /notifications
/activity-log /costs /cron /argos /agora /classified
/knowledge /performance /settings
```

### 어드민 라우트 (19개)
```
/ /users /employees /departments /agents /credentials /companies
/tools /costs /report-lines /soul-templates /monitoring /org-chart
/org-templates /workflows /template-market /agent-marketplace
/api-keys /settings
```

---

## Mode: spec PAGENAME (설명서 작성 + 파티모드)

### 인자
- `spec command-center`: 사령관실 설명서 작성
- `spec chat`: 에이전트 채팅 설명서 작성
- 등등

### 실행 순서

```
1. 페이지 번호 + 이름 확인 (우선순위 표 참조)
2. 해당 페이지 코드 읽기 (pages/, components/)
3. v1-feature-spec.md에서 해당 기능 확인
4. 설명서 작성 → _uxui-refactoring/specs/{번호}-{페이지명}.md
5. ★ 파티모드 2라운드 (설명서 리뷰) ★
   - Round 1: Collaborative → party-logs/spec-{번호}-{페이지명}-round1.md
   - Round 2: Adversarial → party-logs/spec-{번호}-{페이지명}-round2.md
6. PASS (7+) → 커밋: docs(uxui-spec): {페이지명} 설명서 완료 -- 2 party rounds
7. FAIL (6-) → 이슈 수정 → 2라운드 재실행
8. 사용자에게 안내: "image-prompt로 Gemini 프롬프트를 만들거나, 설명서 10번 항목의 프롬프트를 Gemini에게 전달해 주세요"
```

### Mode: spec-batch PRIORITY (설명서 일괄 작성)

해당 우선순위의 **모든 페이지** 설명서를 한번에 작성. 각 페이지마다 파티모드 2라운드 포함.

```
인자:
- spec-batch 1: 1순위 9개 페이지 (이미 완료된 건 건너뜀)
- spec-batch 2: 2순위 14개 페이지
- spec-batch 3: 3순위 19개 페이지

실행 순서:
1. PROGRESS.md에서 해당 우선순위의 미완료 페이지 목록 확인
2. 각 페이지에 대해 순차적으로:
   a. 페이지 코드 읽기
   b. v1-feature-spec.md에서 기능 확인
   c. 설명서 작성 (섹션 10 프롬프트는 Banana2 작성 규칙 준수)
   d. 파티모드 2라운드
   e. PASS → 커밋
   f. PROGRESS.md 업데이트
3. 전체 완료 후 요약 보고
```

### Mode: image-prompt PRIORITY (Gemini 프롬프트 일괄 출력)

해당 우선순위에서 **spec 완료 + 이미지 미생성** 페이지들의 Gemini 프롬프트를 모아서 출력.
사용자가 이 프롬프트를 통째로 Gemini에게 전달.

```
실행 순서:
1. PROGRESS.md에서 spec ✅ + image 미완료 페이지 확인
2. 각 페이지의 설명서에서 섹션 10 프롬프트 추출
3. Gemini용 통합 프롬프트 생성:
   - 프로젝트 맥락 (한 번만)
   - 앱 쉘 맥락 (한 번만)
   - 공통 디자인 규칙 (한 번만)
   - 페이지별 개별 프롬프트 (N개)
   - 저장 위치 목록
4. 사용자에게 출력 → 사용자가 Gemini에게 전달
```

### 설명서 템플릿

```markdown
# {페이지명} UX/UI 설명서

## 1. 페이지 목적
## 2. 현재 레이아웃 분석
## 3. 현재 문제점
## 4. 개선 방향
## 5. 컴포넌트 목록 (개선 후)
## 6. 데이터 바인딩
## 7. 색상/톤 앤 매너
## 8. 반응형 대응
## 9. v1 참고사항
## 10. Banana2 이미지 생성 프롬프트
### 데스크톱 버전
### 모바일 버전
## 11. data-testid 목록
## 12. Playwright 인터랙션 테스트 항목
```

### Banana2 프롬프트 작성 규칙 (중요)

프롬프트는 **컨텍스트 + 기능 요소 + 톤** 중심으로 작성. **레이아웃은 지정하지 않는다.**
Banana2가 최적의 배치를 스스로 결정하도록 디자인 자유도를 부여.

```
프롬프트 필수 구성:
1. Product context — 이 제품이 뭔지 (CORTHEX = AI 회사 경영 플랫폼)
2. Page purpose — 이 페이지에서 사용자가 뭘 하는지
3. User scenario — 핵심 사용 시나리오 3단계
4. Required elements — 들어가야 하는 기능 요소 목록 (배치는 자유)
5. Tone & mood — 분위기, 색상 체계
6. Design freedom — "Full creative freedom on layout" 명시

프롬프트에 넣지 말 것:
- "left 60%, right 40%" 같은 구체적 레이아웃 비율
- "Split view", "sidebar" 같은 배치 지시
- 현재 구현을 답습하는 설명
```

### 파티모드 UXUI 전용 체크포인트 (Round 2에서 추가 확인)

```
- [ ] 핵심 동작이 3클릭 이내?
- [ ] 빈 상태/에러 상태/로딩 상태 정의됨?
- [ ] data-testid가 모든 인터랙션 요소에 할당됨?
- [ ] v1 기능 전부 커버?
- [ ] Banana2 프롬프트가 컨텍스트+기능 중심으로 작성됨? (레이아웃 강제 없음)
- [ ] 반응형 breakpoint (375px, 768px, 1440px) 명시?
- [ ] 기능 로직은 안 건드리고 UI만 변경하는 범위?
```

---

## Mode: code PAGENAME (코딩 + 파티모드 + Playwright)

### 전제 조건
- `spec PAGENAME` 완료 (설명서 존재)
- Banana2 이미지 존재 (`_uxui-refactoring/designs/{번호}-{페이지명}-desktop.png`)

### 실행 순서

```
1. 이미지 파일 읽기 (Read 도구 — 시각적 확인)
   - designs/{번호}-{페이지명}-desktop.png
   - designs/{번호}-{페이지명}-mobile.png
2. 설명서 읽기 (specs/{번호}-{페이지명}.md)
3. 코드 리팩토링 (UI/레이아웃/스타일만 변경)
   - 기능 로직 절대 안 건드림
   - data-testid 전부 추가
   - 반응형 대응
4. ★ 파티모드 2라운드 (코딩 리뷰) ★
   - Round 1: Collaborative → party-logs/code-{번호}-{페이지명}-round1.md
   - Round 2: Adversarial → party-logs/code-{번호}-{페이지명}-round2.md
5. PASS → 인터랙션 테스트 작성
   - packages/e2e/src/tests/interaction/{app|admin}/{페이지명}.spec.ts
6. Playwright 테스트 실행
   - npx playwright test src/tests/interaction/{app|admin}/{페이지명}.spec.ts
7. 스모크 테스트 실행 (회귀 확인)
   - npx playwright test src/tests/smoke/
8. 전부 통과 → 커밋 + 푸시
   - feat(uxui): {페이지명} UI 리팩토링 -- 2 party rounds, {N} tests
9. PROGRESS.md 업데이트
10. 다음 페이지 안내
```

### 코딩 절대 규칙

```
1. 기능 로직 건드리지 말 것 (API 호출, 상태관리, 이벤트 핸들러 유지)
2. UI/레이아웃/스타일/Tailwind 클래스만 변경
3. 설명서 11번의 data-testid 전부 추가
4. 기존 data-testid 삭제 금지
5. 새 파일 생성 최소화 (기존 파일 수정 선호)
6. 이미지와 설명서를 동시에 참고하여 코딩
```

### 파티모드 코딩 리뷰 전용 체크포인트 (Round 2에서 추가 확인)

```
- [ ] 디자인 이미지와 구현이 일치?
- [ ] 기능 로직이 변경되지 않았는가? (API 호출, 상태관리 동일)
- [ ] data-testid 전부 추가됨?
- [ ] 콘솔 에러 없음?
- [ ] 로딩/에러/빈 상태 UI 처리됨?
- [ ] 반응형 (375px에서 깨지지 않는가)?
- [ ] 다크모드 대응?
- [ ] 다른 페이지에 영향 없음?
```

---

## Mode: phase3 (시각 회귀 기준 등록)

### 전제 조건
- 1순위 페이지들(최소 9개) UXUI 리팩토링 완료

### 실행 순서

```
1. visual regression 테스트 파일 생성 (앱 + 어드민)
2. npx playwright test src/tests/visual/ --update-snapshots 실행
3. 기준 스크린샷 생성됨
4. 커밋: test(visual): baseline screenshots for new UXUI
5. 안내: "이후 코드 수정 시 npx playwright test src/tests/visual/ 로 UI 깨짐 감지 가능"
```

---

## Mode: final (최종 전체 검증)

### 실행 순서

```
1. npx playwright test src/tests/smoke/ (전 페이지 접근)
2. npx playwright test src/tests/interaction/ (기능 동작)
3. npx playwright test src/tests/visual/ (스크린샷 비교)
4. 결과 종합 리포트 생성
5. 실패 항목 있으면 원인 분석 + 수정 제안
6. 전부 통과 → "UXUI 리팩토링 완료" 선언
```

---

## Mode: 인자 없음 (진행 상황 + 다음 안내)

### 실행 순서

```
1. _uxui-refactoring/PROGRESS.md 읽기
2. 현재 진행 상황 요약 (완료/진행중/남은 페이지)
3. 다음 할 일 안내:
   - Phase 0 안 했으면 → "phase0부터 시작하세요"
   - Phase 1 안 했으면 → "phase1으로 현재 상태 점검하세요"
   - 다음 페이지 spec 필요하면 → "spec {페이지명} 으로 설명서 작성하세요"
   - 이미지 대기 중이면 → "{페이지명} 이미지를 생성해 주세요"
   - 이미지 있으면 → "code {페이지명} 으로 코딩하세요"
```

---

## 페이지 우선순위 + 번호 매핑

| # | 패키지 | 페이지명 | 경로 | 우선순위 |
|---|--------|---------|------|---------|
| 01 | app | command-center | /command-center | 1순위 |
| 02 | app | chat | /chat | 1순위 |
| 03 | app | dashboard | /dashboard | 1순위 |
| 04 | app | trading | /trading | 1순위 |
| 05 | app | agora | /agora | 1순위 |
| 06 | app | nexus | /nexus | 1순위 |
| 07 | admin | agents | /agents | 1순위 |
| 08 | admin | departments | /departments | 1순위 |
| 09 | admin | credentials | /credentials | 1순위 |
| 10 | app | sns | /sns | 2순위 |
| 11 | app | messenger | /messenger | 2순위 |
| 12 | app | ops-log | /ops-log | 2순위 |
| 13 | app | reports | /reports | 2순위 |
| 14 | app | jobs | /jobs | 2순위 |
| 15 | app | knowledge | /knowledge | 2순위 |
| 16 | app | files | /files | 2순위 |
| 17 | app | costs | /costs | 2순위 |
| 18 | app | activity-log | /activity-log | 2순위 |
| 19 | admin | workflows | /workflows | 2순위 |
| 20 | admin | tools | /tools | 2순위 |
| 21 | admin | users | /users | 2순위 |
| 22 | admin | employees | /employees | 2순위 |
| 23 | admin | monitoring | /monitoring | 2순위 |
| 24 | app | home | / | 3순위 |
| 25 | app | argos | /argos | 3순위 |
| 26 | app | classified | /classified | 3순위 |
| 27 | app | org | /org | 3순위 |
| 28 | app | cron | /cron | 3순위 |
| 29 | app | performance | /performance | 3순위 |
| 30 | app | notifications | /notifications | 3순위 |
| 31 | app | settings | /settings | 3순위 |
| 32 | admin | org-chart | /org-chart | 3순위 |
| 33 | admin | org-templates | /org-templates | 3순위 |
| 34 | admin | template-market | /template-market | 3순위 |
| 35 | admin | agent-marketplace | /agent-marketplace | 3순위 |
| 36 | admin | soul-templates | /soul-templates | 3순위 |
| 37 | admin | report-lines | /report-lines | 3순위 |
| 38 | admin | api-keys | /api-keys | 3순위 |
| 39 | admin | costs-admin | /costs | 3순위 |
| 40 | admin | companies | /companies | 3순위 |
| 41 | admin | settings-admin | /settings | 3순위 |
| 42 | admin | onboarding | /onboarding | 3순위 |

---

## 참조 파일 위치

| 항목 | 경로 |
|------|------|
| 이 파이프라인 | `.claude/commands/kdh-uxui-pipeline.md` |
| 워크플로우 문서 | `_uxui-refactoring/WORKFLOW.md` |
| 설명서 | `_uxui-refactoring/specs/*.md` |
| 디자인 이미지 | `_uxui-refactoring/designs/*.png` |
| 파티 로그 | `_uxui-refactoring/party-logs/*.md` |
| 진행 상황 | `_uxui-refactoring/PROGRESS.md` |
| Phase 1 결과 | `_uxui-refactoring/phase1-baseline.md` |
| v1 기능 스펙 | `_bmad-output/planning-artifacts/v1-feature-spec.md` |

---

## 절대 규칙

1. **기능 로직 건드리지 말 것** — UI/스타일만 변경
2. **파티모드 없이 설명서 넘어가지 말 것** — spec 2라운드 필수
3. **파티모드 없이 코딩 커밋하지 말 것** — code 2라운드 필수
4. **Playwright 테스트 실패 시 커밋 금지**
5. **data-testid 누락 시 커밋 금지**
6. **v1에서 동작했던 기능이 깨지면 즉시 수정**
7. **이미지 없이 코딩 시작하지 말 것** — 반드시 Banana2 이미지 먼저
8. **각 파티모드는 파일에서 다시 읽어서 리뷰** (기억으로 리뷰 금지)
9. **전문가 코멘트는 3~5문장** (한 줄짜리 금지, 인격 반영 필수)
10. **"이슈 0개" = 재분석** (BMAD 프로토콜)
11. **Round 1 최소 2개, Round 2 최소 1개 신규 이슈 발견** 필수
12. **이슈 심각도 분류** (Critical/Major/Medium/Low) 필수
