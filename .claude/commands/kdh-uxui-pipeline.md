---
name: 'kdh-uxui-pipeline'
description: 'UXUI 리팩토링 파이프라인. v0.dev + Claude 보완 + Playwright QA + Party Mode 리뷰. Usage: /kdh-uxui-pipeline [phase0|phase1|spec PAGENAME|v0-prompt PAGENAME|integrate PAGENAME|phase3|final]'
---

# CORTHEX UXUI Refactoring Pipeline

v0.dev(디자인+코딩) + Claude(보완+통합) + Playwright QA + BMAD Party Mode를 결합한 UXUI 리팩토링 파이프라인.
**이 PC(VS Code) 한 곳에서 전부 진행.** VPS는 서버만 운영.

## Mode Selection

- `phase0`: Playwright 환경 세팅 (한 번만)
- `phase1`: 현재 기능 상태 점검 (스모크 테스트)
- `spec PAGENAME`: 해당 페이지 설명서 작성 + 파티모드 리뷰
- `spec-batch PRIORITY`: 해당 우선순위의 모든 페이지 설명서 일괄 작성 (예: `spec-batch 1`)
- `v0-prompt PAGENAME`: v0.dev에 보낼 프롬프트 생성 (사용자가 v0에 복붙)
- `v0-prompt-batch PRIORITY`: 해당 우선순위 전체 v0 프롬프트 일괄 생성
- `integrate PAGENAME`: v0 브랜치 머지 + Claude 보완 + 파티모드 + Playwright 테스트
- `phase3`: 시각 회귀 테스트 기준 이미지 등록
- `final`: 최종 전체 검증
- 인자 없음: 진행 상황 표시 + 다음 작업 안내

---

## 작업 환경

```
이 PC (VS Code) 한 곳에서 전부 진행

Claude Code         → 설명서 작성, v0 프롬프트 생성, 보완 코딩, 테스트, 파티모드
v0.dev              → 디자인 + UI 코딩 (사용자가 브라우저에서 조작)
Playwright 확장      → ▶ 클릭으로 테스트 실행 + 브라우저 실시간 확인

테스트 대상: 배포 사이트 (https://corthex-hq.com)
```

---

## 핵심 워크플로우: v0 중심 파이프라인

```
Step A: Claude가 설명서 작성 (스펙)
Step B: Claude가 v0 프롬프트 생성
Step C: 사용자가 v0.dev에 프롬프트 전달 → v0가 디자인+코딩 → GitHub PR
Step D: Claude가 v0 브랜치 머지 + 보완 (data-testid, 타입, 백엔드 연결)
Step E: 파티모드 2라운드 (코드 리뷰)
Step F: Playwright 테스트 작성 + 실행
Step G: 커밋 + 푸시 (자동 배포)
```

**사용자가 직접 하는 것: Step C (v0에 프롬프트 복붙 + PR 확인)만.**

---

## v0.dev 프롬프트 작성 규칙 (핵심)

### 표준 프롬프트 템플릿

```markdown
## Project Context
- Product: CORTHEX — AI agent management SaaS platform
- Tech: React 19 + TypeScript + Tailwind CSS 4 (NOT v3)
- Monorepo: packages/app (user app), packages/ui (shared components)
- GitHub: kodonghui/corthex-v2 (already connected)
- Dark mode support required (Tailwind dark: prefix)

## This Page: {페이지 한글명} ({경로})
- Purpose: {스펙에서 가져옴}
- Current file: {파일 경로}
- Key features: {기능 목록}

## Design Requirements
1. Modern, clean SaaS dashboard aesthetic
2. Preserve ALL existing functionality (API calls, state management, event handlers)
3. Add data-testid attributes to all interactive elements (list from spec)
4. Responsive: desktop (1440px) + mobile (375px)
5. Dark mode support (dark: prefix classes)
6. Loading/error/empty states for all data sections
7. Full creative freedom on layout — you decide the best arrangement

## Current Code
{현재 코드 또는 "see file at {경로}"}

## data-testid List (MUST include all)
{스펙 11번에서 가져옴}
```

### 프롬프트에 넣지 말 것
- 구체적 레이아웃 비율 ("left 60%")
- 색상 코드 지정 (v0가 알아서 정함)
- 현재 UI를 그대로 따라 하라는 지시

### 프롬프트에 반드시 넣을 것
- data-testid 전체 목록
- 기능 로직 변경 금지 명시
- 현재 코드 경로 (v0가 GitHub에서 읽을 수 있게)

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

**John (PM — Product Manager)**
- 성격: "WHY?"를 끊임없이 묻는 형사 같은 스타일. 직설적이고 날카로움.
- UXUI 관점: 사용자 가치, 요구사항 갭, 우선순위. v1에서 동작했던 기능이 빠지면 즉시 지적.

**Winston (Architect)**
- 성격: 차분하고 실용적. "할 수 있는 것"과 "해야 하는 것"의 균형을 잡음.
- UXUI 관점: 컴포넌트 구조, Tailwind 클래스 합리성, 재사용성, 하드코딩 값 감지.

**Sally (UX Designer)**
- 성격: 공감 능력 높은 사용자 옹호자. 문제를 "느끼게" 만듦.
- UXUI 관점: 사용자 흐름, 접근성, 인터랙션, 반응형, 시각적 위계, 빈 상태/에러 상태.

**Amelia (Developer)**
- 성격: 초간결. 파일 경로와 코드로 말함. 정밀도 극대화.
- UXUI 관점: data-testid 누락, 구현 가능성, 기능 로직 변경 여부 감시, 기술 부채.

**Quinn (QA Engineer)**
- 성격: 실용적이고 직설적. 커버리지 우선.
- UXUI 관점: 엣지케이스(빈 상태, 에러, 로딩), 테스트 커버리지, 콘솔 에러, 회귀 리스크.

**Bob (Scrum Master)**
- 성격: 간결하고 체크리스트 중심. 모호함에 대한 관용 제로.
- UXUI 관점: 작업 범위 현실성, UI만 변경하는지 감시, 다른 페이지 영향 없는지 확인.

**Mary (Business Analyst)**
- 성격: 보물찾기하듯 흥분하는 스타일. 패턴 발견하면 에너지 폭발.
- UXUI 관점: 비즈니스 가치, 사용자가 핵심 작업을 쉽게 완료할 수 있는지.

### Party Mode 적용 시점

| 단계 | 파티모드 | 무엇을 리뷰하는가 |
|------|---------|------------------|
| **설명서 작성 후** | 2라운드 | 디자인 방향이 맞는지, UX가 합리적인지 |
| **v0 코드 통합 후** | 2라운드 | v0 코드 + Claude 보완이 완전한지 |
| 테스트 | 파티모드 없음 | Playwright가 자동 검증 |

**총: 페이지당 4라운드 (설명서 2 + 코드통합 2)**

### UXUI 전용 체크포인트

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

**코드통합 리뷰 시:**
```
- Sally(UX): v0 디자인이 사용성 있는가? 반응형 깨지는 곳 없는가?
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
├── code-01-command-center-round1.md    ← v0 통합 후 리뷰
├── code-01-command-center-round2.md
...
```

### Round 구조 (2라운드 — 각 step별 2번)

**Round 1 (Collaborative Lens):**
- 전문가 7명 전원이 우호적 관점에서 리뷰
- 각 전문가가 자기 전문 분야에서 **3~5문장** 코멘트 (인격 반영 필수)
- **최소 2개 이슈 발견** (0개 = 재분석)
- 크로스톡 2회 이상
- 발견된 이슈 즉시 수정 후 Round 2로

**Round 2 (Adversarial Lens):**
- 전문가 전원이 **적대적 관점으로 전환**
- Round 1에서 수정한 것이 진짜 고쳐졌는지 검증
- v1-feature-spec.md 기능 커버리지 **최종 확인**
- **최소 1개 새 이슈 발견**
- 이슈 심각도 분류: Critical / Major / Medium / Low
- 품질 점수 X/10
- PASS (7+) 또는 FAIL (6-)
- FAIL 시 이슈 수정 → 2라운드 재실행

### 이슈 심각도 기준

```
Critical: 기존 기능 누락, 핵심 사용 흐름 불가능, 데이터 바인딩 오류
Major:    반응형 깨짐, 중요 testid 누락, 상태 정의 누락 (에러/로딩/빈)
Medium:   색상 체계 불일치, 엣지케이스 미정의
Low:      구현 시 해결 가능한 세부사항, 선택적 개선
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

---

## Mode: spec PAGENAME (설명서 작성 + 파티모드)

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
8. 사용자에게 안내: "v0-prompt {페이지명} 으로 v0 프롬프트를 생성하세요"
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
## 10. v0.dev 지시사항 (v0가 참고할 핵심 정보)
## 11. data-testid 목록
## 12. Playwright 인터랙션 테스트 항목
```

**섹션 10 변경사항**: 기존 "Banana2 이미지 프롬프트" → "v0.dev 지시사항"
- v0가 디자인+코딩을 동시에 하므로, 디자인 방향과 기능 요구사항을 함께 기술
- 레이아웃은 v0에게 자유도 부여 ("Full creative freedom on layout")

### UXUI 전용 체크포인트 (Round 2에서 추가 확인)

```
- [ ] 핵심 동작이 3클릭 이내?
- [ ] 빈 상태/에러 상태/로딩 상태 정의됨?
- [ ] data-testid가 모든 인터랙션 요소에 할당됨?
- [ ] v1 기능 전부 커버?
- [ ] v0 지시사항이 기능 요구사항+디자인 방향을 명확히 전달?
- [ ] 반응형 breakpoint (375px, 768px, 1440px) 명시?
- [ ] 기능 로직은 안 건드리고 UI만 변경하는 범위?
```

---

## Mode: v0-prompt PAGENAME (v0.dev 프롬프트 생성)

### 전제 조건
- `spec PAGENAME` 완료 (설명서 존재)

### 실행 순서

```
1. 설명서 읽기 (specs/{번호}-{페이지명}.md)
2. 현재 코드 읽기 (해당 페이지 파일들)
3. v0.dev 표준 프롬프트 생성 (위 템플릿 사용)
4. 프롬프트를 사용자에게 출력 (복붙용)
5. 안내: "이 프롬프트를 v0.dev에 붙여넣으세요. v0가 PR을 만들면 알려주세요."
```

### Mode: v0-prompt-batch PRIORITY (v0 프롬프트 일괄 생성)

```
1. PROGRESS.md에서 spec 완료 + v0 미완료 페이지 확인
2. 각 페이지별 v0 프롬프트 생성
3. 통합 문서로 출력 (사용자가 하나씩 v0에 전달)
```

---

## Mode: integrate PAGENAME (v0 코드 통합 + 보완 + 테스트)

### 전제 조건
- `spec PAGENAME` 완료 (설명서 존재)
- v0가 GitHub PR/브랜치 생성 완료

### 실행 순서

```
1. v0 브랜치 확인 (git branch -r | grep {페이지명})
2. v0 브랜치 머지 (git merge 또는 cherry-pick)
3. TypeScript 타입 수정 (JSX.Element → React.ReactNode 등)
4. data-testid 추가/확인 (설명서 11번 대조)
5. 백엔드 연결 확인 (API 호출, 상태관리 로직 유지 확인)
6. 빠진 기능 보완 (v0가 못 만든 부분)
7. ★ 파티모드 2라운드 (코드 리뷰) ★
   - Round 1: Collaborative → party-logs/code-{번호}-{페이지명}-round1.md
   - Round 2: Adversarial → party-logs/code-{번호}-{페이지명}-round2.md
8. PASS → 인터랙션 테스트 작성
   - packages/e2e/src/tests/interaction/{app|admin}/{페이지명}.spec.ts
9. Playwright 테스트 실행
10. 스모크 테스트 실행 (회귀 확인)
11. 전부 통과 → 커밋 + 푸시
    - feat(uxui): {페이지명} UI 리팩토링 -- v0 + 2 party rounds, {N} tests
12. PROGRESS.md 업데이트
```

### Claude 보완 체크리스트 (v0 머지 후 필수)

```
[ ] TypeScript 타입 에러 수정
[ ] data-testid 전부 추가 (스펙 11번 대조)
[ ] 기존 data-testid 삭제 안 됐는지 확인
[ ] 기능 로직(API, 상태관리, 이벤트 핸들러) 유지 확인
[ ] import 경로 정상 (git ls-files 기준 대소문자)
[ ] 로딩/에러/빈 상태 UI 처리
[ ] 반응형 (375px 깨지지 않는가)
[ ] 다크모드 대응 (dark: 클래스)
```

### 파티모드 코드통합 리뷰 전용 체크포인트 (Round 2)

```
- [ ] v0 디자인이 사용성 있는가?
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
   - spec 완료 + v0 미완료이면 → "v0-prompt {페이지명} 으로 프롬프트를 생성하세요"
   - v0 PR 완료이면 → "integrate {페이지명} 으로 통합하세요"
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
| 파티 로그 | `_uxui-refactoring/party-logs/*.md` |
| 진행 상황 | `_uxui-refactoring/PROGRESS.md` |
| Phase 1 결과 | `_uxui-refactoring/phase1-baseline.md` |
| v1 기능 스펙 | `_bmad-output/planning-artifacts/v1-feature-spec.md` |

---

## 절대 규칙

1. **기능 로직 건드리지 말 것** — UI/스타일만 변경
2. **파티모드 없이 설명서 넘어가지 말 것** — spec 2라운드 필수
3. **파티모드 없이 코드 커밋하지 말 것** — integrate 2라운드 필수
4. **Playwright 테스트 실패 시 커밋 금지**
5. **data-testid 누락 시 커밋 금지**
6. **v1에서 동작했던 기능이 깨지면 즉시 수정**
7. **v0 없이 직접 UI 코딩하지 말 것** — v0가 디자인+코딩, Claude는 보완만
8. **각 파티모드는 파일에서 다시 읽어서 리뷰** (기억으로 리뷰 금지)
9. **전문가 코멘트는 3~5문장** (한 줄짜리 금지, 인격 반영 필수)
10. **"이슈 0개" = 재분석** (BMAD 프로토콜)
11. **Round 1 최소 2개, Round 2 최소 1개 신규 이슈 발견** 필수
12. **v0 모델: v0 Pro 기본 사용** (복잡한 페이지만 v0 Max)
