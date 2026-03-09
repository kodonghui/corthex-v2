---
name: 'kdh-uxui-pipeline'
description: 'UXUI 리팩토링 파이프라인. Playwright QA + Banana2 디자인 + Party Mode 리뷰. Usage: /kdh-uxui-pipeline [phase0|phase1|spec PAGENAME|code PAGENAME|phase3|final]'
---

# UXUI Refactoring Pipeline (범용)

Playwright QA + Banana2 디자인 + BMAD Party Mode를 결합한 UXUI 리팩토링 자동화 파이프라인.
**이 PC(VS Code) 한 곳에서 전부 진행.**

> **다른 프로젝트에서 사용할 때**: 아래 "프로젝트 설정" 섹션을 먼저 채워야 합니다.
> 프로젝트 루트에 `_uxui-refactoring/CONFIG.md` 파일을 만들어 주세요.

---

## 프로젝트 설정 (CONFIG.md)

이 파이프라인을 새 프로젝트에서 사용하려면, 프로젝트 루트에 `_uxui-refactoring/CONFIG.md`를 아래 형식으로 만드세요:

```markdown
# UXUI Pipeline Config

## 기본 정보
- PROJECT_NAME: My Project
- BASE_URL: https://my-app.com
- ADMIN_URL: https://my-app.com/admin  (없으면 삭제)
- FEATURE_SPEC: _bmad-output/planning-artifacts/v1-feature-spec.md  (없으면 삭제)

## 프론트엔드 구조
- FRAMEWORK: React + Vite + Tailwind  (또는 Next.js, Vue 등)
- APP_DIR: packages/app  (또는 src/, app/ 등)
- ADMIN_DIR: packages/admin  (없으면 삭제)
- E2E_DIR: packages/e2e  (Playwright 테스트 위치)

## 페이지 목록 (우선순위별)
### 1순위
| # | 패키지 | 페이지명 | 경로 |
|---|--------|---------|------|
| 01 | app | dashboard | /dashboard |
| 02 | app | settings | /settings |
...

### 2순위
| # | 패키지 | 페이지명 | 경로 |
...

### 3순위
| # | 패키지 | 페이지명 | 경로 |
...
```

**CONFIG.md가 없으면?** → Claude가 프로젝트 구조를 자동 분석해서 라우트 목록을 만들어 제안합니다.

---

## Mode Selection

- `phase0`: Playwright 환경 세팅 (한 번만)
- `phase1`: 현재 기능 상태 점검 (스모크 테스트)
- `spec PAGENAME`: 해당 페이지 설명서 작성 + 파티모드 리뷰
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

테스트 대상: CONFIG.md의 BASE_URL (배포된 사이트)
```

---

## 초기화 (새 프로젝트에서 처음 실행 시)

```
1. _uxui-refactoring/CONFIG.md 를 위 템플릿으로 작성
2. /kdh-uxui-pipeline phase0 실행
3. Playwright Test for VSCode 확장 설치 (Microsoft)
4. .env.test에 테스트 계정 비밀번호 입력
5. /kdh-uxui-pipeline phase1 실행 → 현재 상태 파악
6. /kdh-uxui-pipeline spec {첫번째-페이지명} → 시작!
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
- UXUI 관점: 사용자 가치, 요구사항 갭, 우선순위. 기존에 동작했던 기능이 빠지면 즉시 지적.
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
- 말투 예시: "범위 확인: 이 PR은 해당 페이지 UI만 건드리는 거죠? API 변경 없죠?"

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
- John(PM): 기존에 동작했던 기능이 모두 커버되는가?
- Bob(SM): 작업 범위가 현실적인가? UI만 바꾸고 기능은 안 건드리는가?
- Mary(BA): 이 페이지의 비즈니스 가치가 명확한가?
```

**코딩 리뷰 시:**
```
- Sally(UX): 디자인 이미지와 구현이 일치하는가? 반응형 깨지는 곳 없는가?
- Winston(Architect): Tailwind 클래스가 합리적인가? 하드코딩된 값 없는가?
- Amelia(Dev): data-testid가 전부 추가됐는가? 기능 로직을 건드리지 않았는가?
- Quinn(QA): 콘솔 에러 없는가? 로딩/에러/빈 상태 처리됐는가?
- John(PM): 기존에 동작했던 기능이 깨지지 않았는가?
- Bob(SM): 변경 범위가 해당 페이지에 한정되는가? 다른 페이지 영향 없는가?
- Mary(BA): 사용자가 이 화면에서 핵심 작업을 쉽게 완료할 수 있는가?
```

### Party Log 저장 위치

```
_uxui-refactoring/party-logs/
├── spec-01-{페이지명}-round1.md
├── spec-01-{페이지명}-round2.md
├── code-01-{페이지명}-round1.md
├── code-01-{페이지명}-round2.md
...
```

### Round 구조 (2라운드 — 각 step별 2번)

**Round 1 (Collaborative Lens):**
- 전문가 7명 전원이 우호적 관점에서 리뷰
- 각 전문가가 자기 전문 분야에서 2~3문장 코멘트
- 최소 2개 이슈 발견 (0개 = 재분석)
- 크로스톡 2회 이상 (전문가끼리 의견 주고받기)
- 발견된 이슈 즉시 수정 후 Round 2로

**Round 2 (Adversarial Lens):**
- 전문가 전원이 적대적 관점으로 전환 — 일부러 문제를 찾으려고 함
- Round 1에서 수정한 것이 진짜 고쳐졌는지 검증
- 기존 기능 커버리지 확인 (FEATURE_SPEC 참조)
- UXUI 전용 체크포인트 검증 (아래 체크리스트)
- 최소 1개 새 이슈 발견
- 품질 점수 X/10
- PASS (7+) 또는 FAIL (6-)
- FAIL 시 이슈 수정 → 2라운드 재실행

---

## Mode: phase0 (Playwright 환경 세팅)

한 번만 실행. Playwright + 테스트 파일 골격 생성.

### 실행 순서

```
1. CONFIG.md 읽기 (없으면 프로젝트 구조 분석 → CONFIG.md 생성 제안)
2. {E2E_DIR}/ 디렉토리 생성
3. package.json 생성
4. playwright.config.ts 생성 (CONFIG.md의 BASE_URL 기준)
5. auth.setup.ts 생성 (로그인 자동화)
6. .env.test 템플릿 생성
7. smoke 테스트 파일 생성 (CONFIG.md의 페이지 목록 기반)
8. .gitignore 업데이트
9. npx playwright install chromium
10. 사용자에게 .env.test 비밀번호 입력 요청
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
    baseURL: process.env.BASE_URL,   // CONFIG.md에서 가져온 값
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
    // ADMIN_URL이 CONFIG.md에 있으면 추가:
    // {
    //   name: 'admin',
    //   use: { ...devices['Desktop Chrome'], baseURL: process.env.ADMIN_URL, storageState: 'src/fixtures/.auth/admin.json' },
    //   dependencies: ['auth-setup'],
    // },
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
4. 요약 보고 (통과/실패 페이지 수 + 목록)
```

---

## Mode: spec PAGENAME (설명서 작성 + 파티모드)

### 인자
- `spec dashboard`: 대시보드 설명서 작성
- `spec settings`: 설정 페이지 설명서 작성
- 등등 (CONFIG.md의 페이지명 사용)

### 실행 순서

```
1. CONFIG.md에서 페이지 번호 + 이름 확인
2. 해당 페이지 코드 읽기 (pages/, components/)
3. FEATURE_SPEC에서 해당 기능 확인 (있으면)
4. 설명서 작성 → _uxui-refactoring/specs/{번호}-{페이지명}.md
5. ★ 파티모드 2라운드 (설명서 리뷰) ★
   - Round 1: Collaborative → party-logs/spec-{번호}-{페이지명}-round1.md
   - Round 2: Adversarial → party-logs/spec-{번호}-{페이지명}-round2.md
6. PASS (7+) → 커밋: docs(uxui-spec): {페이지명} 설명서 완료 -- 2 party rounds
7. FAIL (6-) → 이슈 수정 → 2라운드 재실행
8. 사용자에게 안내: "설명서의 10번 항목에서 Banana2 프롬프트를 복사해서 이미지를 생성해 주세요"
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
## 9. 기존 기능 참고사항
## 10. Banana2 이미지 생성 프롬프트
### 데스크톱 버전
### 모바일 버전
## 11. data-testid 목록
## 12. Playwright 인터랙션 테스트 항목
```

### 파티모드 UXUI 전용 체크포인트 (Round 2에서 추가 확인)

```
- [ ] 핵심 동작이 3클릭 이내?
- [ ] 빈 상태/에러 상태/로딩 상태 정의됨?
- [ ] data-testid가 모든 인터랙션 요소에 할당됨?
- [ ] 기존 기능 전부 커버?
- [ ] Banana2 프롬프트가 영문으로 구체적으로 작성됨?
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
   - {E2E_DIR}/src/tests/interaction/{app|admin}/{페이지명}.spec.ts
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
- 1순위 페이지들 UXUI 리팩토링 완료

### 실행 순서

```
1. visual regression 테스트 파일 생성
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
   - CONFIG.md 없으면 → "CONFIG.md부터 만드세요"
   - Phase 0 안 했으면 → "phase0부터 시작하세요"
   - Phase 1 안 했으면 → "phase1으로 현재 상태 점검하세요"
   - 다음 페이지 spec 필요하면 → "spec {페이지명} 으로 설명서 작성하세요"
   - 이미지 대기 중이면 → "{페이지명} 이미지를 생성해 주세요"
   - 이미지 있으면 → "code {페이지명} 으로 코딩하세요"
```

---

## 참조 파일 위치

| 항목 | 경로 |
|------|------|
| 설정 | `_uxui-refactoring/CONFIG.md` |
| 설명서 | `_uxui-refactoring/specs/*.md` |
| 디자인 이미지 | `_uxui-refactoring/designs/*.png` |
| 파티 로그 | `_uxui-refactoring/party-logs/*.md` |
| 진행 상황 | `_uxui-refactoring/PROGRESS.md` |
| Phase 1 결과 | `_uxui-refactoring/phase1-baseline.md` |

---

## 절대 규칙

1. **기능 로직 건드리지 말 것** — UI/스타일만 변경
2. **파티모드 없이 설명서 넘어가지 말 것** — spec 2라운드 필수
3. **파티모드 없이 코딩 커밋하지 말 것** — code 2라운드 필수
4. **Playwright 테스트 실패 시 커밋 금지**
5. **data-testid 누락 시 커밋 금지**
6. **기존에 동작했던 기능이 깨지면 즉시 수정**
7. **이미지 없이 코딩 시작하지 말 것** — 반드시 Banana2 이미지 먼저
8. **각 파티모드는 파일에서 다시 읽어서 리뷰** (기억으로 리뷰 금지)
9. **전문가 코멘트는 2-3문장 이상** (한 줄짜리 금지)
10. **"이슈 0개" = 재분석** (BMAD 프로토콜)
