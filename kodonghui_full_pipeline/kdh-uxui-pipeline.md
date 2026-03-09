---
name: 'kdh-uxui-pipeline'
description: 'UXUI 리팩토링 파이프라인. Lovable 와이어프레임 + Claude Code 리팩토링 + 3라운드 파티모드 + Playwright QA. Usage: /kdh-uxui-pipeline [phase0|phase1|prompt PAGENAME|prompt-batch PRIORITY|code PAGENAME|code-batch PRIORITY|phase3|final]'
---

# UXUI Refactoring Pipeline v5 (범용)

Lovable 와이어프레임(디자인) + Claude Code(코딩) + 3라운드 파티모드 + Playwright QA.
**어떤 프로젝트에서든 복사해서 사용 가능.**

> **다른 프로젝트에서 사용할 때**: `_uxui-refactoring/CONFIG.md` 파일을 먼저 만드세요.

---

## 프로젝트 설정 (CONFIG.md)

프로젝트 루트에 `_uxui-refactoring/CONFIG.md`를 아래 형식으로 만드세요:

```markdown
# UXUI Pipeline Config

## 기본 정보
- PROJECT_NAME: My Project
- BASE_URL: https://my-app.com
- ADMIN_URL: https://my-app.com/admin  (없으면 삭제)

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
...

### 3순위
...
```

**CONFIG.md가 없으면?** → Claude가 프로젝트 구조를 자동 분석해서 제안합니다.

---

## Mode Selection

- `phase0`: Playwright 환경 세팅 (한 번만)
- `phase1`: 현재 기능 상태 점검 (스모크 테스트)
- `prompt PAGENAME`: Lovable한테 보낼 와이어프레임 프롬프트 생성 + 3라운드 파티모드
- `prompt-batch PRIORITY`: 해당 우선순위 전체 프롬프트 생성
- `code PAGENAME`: Lovable 와이어프레임 기반 코드 리팩토링 + 3라운드 파티모드 + Playwright
- `code-batch PRIORITY`: 해당 우선순위 전체 리팩토링
- `phase3`: 시각 회귀 테스트 기준 이미지 등록
- `final`: 최종 전체 검증
- 인자 없음: 진행 상황 + 다음 작업 안내

---

## 핵심 원칙

### Lovable = 디자인 전권 위임

**Lovable이 결정하는 것:**
- 레이아웃, 색상, 타이포그래피, spacing, 컴포넌트 디자인, 시각적 위계
- 정보 밀도, 애니메이션, 아이콘, 다크/라이트 모드
- 모든 시각적 결정 — 예외 없음

**프롬프트에 주는 것:**
- 이 페이지가 뭘 하는 페이지인지 (목적)
- 어떤 데이터가 표시되는지 (엔티티, 필드, 상태)
- 사용자가 뭘 할 수 있는지 (모든 인터랙션)
- UX 고려사항 (기능적 요구만 — 시각적 지시 제로)

**프롬프트에 절대 넣지 않는 것:**
- 색상, 폰트, 크기, 비율, 레이아웃 구조, 배치 지시

### 기능 로직 불변

- API 호출, 상태관리, 이벤트 핸들러 100% 유지
- UI/레이아웃/스타일만 변경
- **현재 코드 기준** — 삭제된 기능 부활 방지

---

## 작업 환경

```
이 PC (VS Code) 한 곳에서 전부 진행

오케스트레이터 (메인 Claude Code)
  → 팀 생성, Worker 스폰, 스텝 지시, 커밋+푸시

Worker (tmux 안의 Claude Code)
  → 프롬프트 작성, 코드 리팩토링, 파티모드 3라운드, 테스트 작성

Lovable (브라우저)
  → 사용자가 프롬프트 복붙 → 와이어프레임 생성 → 스크린샷 저장

테스트 대상: CONFIG.md의 BASE_URL (배포된 사이트)
```

---

## 전체 흐름

```
[Phase 0] Playwright 환경 세팅 (1회)
    ↓
[Phase 1] 현재 기능 상태 점검
    ↓
[Phase 2] 페이지별 리팩토링 (반복)
    → A. prompt: Worker가 Lovable 프롬프트 생성 (현재 코드 분석 기반)
    → B. 사용자가 Lovable에 복붙 → 와이어프레임 스크린샷 저장
    → C. code: Worker가 와이어프레임 보고 코드 리팩토링 + 파티모드 3라운드
    → D. Worker가 Playwright 테스트 작성 + 실행
    → E. 오케스트레이터가 커밋 + 푸시
    ↓
[Phase 3] 시각 회귀 테스트 기준 등록
    ↓
[Phase 4] 최종 검증
```

**사용자가 직접 하는 것: B단계 (Lovable에 프롬프트 복붙 + 스크린샷 저장)만.**

---

## Single-Worker 패턴 (kdh-full-auto-pipeline과 동일)

1인 Worker가 작성 + 자기 리뷰 3라운드 + 수정 + 보고. 데드락 0.
Worker는 tmux에서 실행 → 사용자가 실시간 관찰.

### Agent Manifest

Read `_bmad/_config/agent-manifest.csv` for agent definitions. If not found, use defaults:

| Agent | Name | Focus |
|-------|------|-------|
| PM | John | user value, requirements gaps, priorities |
| Architect | Winston | technical contradictions, feasibility, scalability |
| UX Designer | Sally | user experience, accessibility, flow |
| Developer | Amelia | implementation complexity, tech debt, testability |
| QA | Quinn | edge cases, test coverage, quality risks |
| Business Analyst | Mary | business value, market fit, ROI |
| Scrum Master | Bob | scope, dependencies, schedule risks |

---

## Party Mode: 3라운드

kdh-full-auto-pipeline과 동일 구조. Worker가 혼자 7명 역할극.
YOLO 모드 — 사용자 입력/확인 없이 전부 자동.

**Round 1 (Collaborative):** 우호적 리뷰. 최소 2개 이슈. 크로스톡 2회+.
**Round 2 (Adversarial):** 적대적 리뷰. 최소 1개 새 이슈. 기능 커버리지 확인.
**Round 3 (Forensic):** 이슈 재평가. 품질 점수 X/10. PASS (7+) or FAIL (6-).

Party Log 형식: kdh-full-auto-pipeline의 형식과 동일.
저장 경로: `_uxui-refactoring/party-logs/`

---

## Mode: prompt PAGENAME

### Worker가 하는 것

```
1. 현재 페이지 코드 읽기 (pages/, components/)
2. 관련 백엔드 라우트/스키마 읽기
3. Lovable 프롬프트 생성 → _uxui-refactoring/lovable-prompts/{번호}-{페이지명}.md
   - What This Page Is For
   - Data Displayed — In Detail
   - User Actions
   - UX Considerations
   - What NOT to Include
   (색상/폰트/레이아웃 등 시각적 지시 제로)
4. 파티모드 3라운드
   - Round 2 체크: 시각적 지시 없는지? 현재 코드에 있는 기능만인지?
5. 오케스트레이터에게 완료 보고
```

---

## Mode: code PAGENAME

### 전제 조건
- prompt 완료 + Lovable 와이어프레임 존재 (`_uxui-refactoring/wireframes/{번호}-{페이지명}.png`)

### Worker가 하는 것

```
1. 와이어프레임 이미지 읽기 (디자인 목표)
2. Lovable 프롬프트 읽기 (기능 요구사항)
3. 현재 코드 읽기
4. 코드 리팩토링 (UI/스타일만 변경, 기능 로직 불변)
5. data-testid 추가
6. 파티모드 3라운드
   - Round 2 체크: 와이어프레임 매치? 기능 동일? data-testid 완전? 반응형?
7. Playwright 테스트 작성 + 실행
8. 오케스트레이터에게 완료 보고
```

### 코딩 규칙

```
1. 기능 로직 건드리지 말 것 — API 호출, 상태관리, 이벤트 핸들러 100% 유지
2. UI/레이아웃/스타일만 변경
3. data-testid 전부 추가
4. 기존 data-testid 삭제 금지
5. 새 파일 생성 최소화 (기존 파일 수정 선호)
6. import 경로 대소문자 정확히 일치
```

---

## Mode: phase0 (Playwright 환경 세팅)

```
1. CONFIG.md 읽기 (없으면 프로젝트 구조 분석 → 생성 제안)
2. {E2E_DIR}/ 디렉토리 생성
3. playwright.config.ts 생성 (CONFIG.md의 BASE_URL 기준)
4. auth.setup.ts 생성
5. smoke 테스트 파일 생성 (CONFIG.md의 페이지 목록 기반)
6. npx playwright install chromium
7. 사용자에게 .env.test 비밀번호 입력 요청
```

## Mode: phase1

```
1. npx playwright test src/tests/smoke/ 실행
2. 결과 파싱 → 통과/실패 페이지 분류
3. 요약 보고
```

## Mode: phase3

```
1. visual regression 테스트 파일 생성
2. npx playwright test src/tests/visual/ --update-snapshots
3. 기준 스크린샷 생성
4. 커밋: test(visual): baseline screenshots
```

## Mode: final

```
1. smoke 테스트 (전 페이지 접근)
2. interaction 테스트 (기능 동작)
3. visual 테스트 (스크린샷 비교)
4. 결과 종합 → 실패 시 수정 → 전부 통과 → 완료 선언
```

---

## 저장 위치

```
_uxui-refactoring/
├── CONFIG.md                 (프로젝트 설정 — 범용 사용 시 필수)
├── lovable-prompts/          (Lovable 프롬프트)
├── wireframes/               (Lovable 스크린샷)
├── party-logs/               (파티모드 리뷰 로그)
```

---

## Worker 스폰 규칙

```
1. 첫 작업을 spawn 프롬프트에 포함 — "기다려" 금지
2. mode=bypassPermissions
3. 5개 이상 페이지 처리하면 shutdown + 새 Worker 스폰
4. Worker가 멈추면 SendMessage로 리마인더
```

---

## 절대 규칙

1. **Lovable에게 디자인 전권 위임** — 프롬프트에 시각적 지시 제로
2. **현재 코드 기준** — 삭제된 기능 부활 방지
3. **기능 로직 건드리지 말 것** — UI/스타일만 변경
4. **파티모드 3라운드 없이 커밋 금지**
5. **Playwright 테스트 실패 시 커밋 금지**
6. **data-testid 누락 시 커밋 금지**
7. **파일에서 다시 읽어서 리뷰** (기억으로 리뷰 금지)
8. **전문가 코멘트 2~3문장 이상** (인격 반영 필수)
9. **"이슈 0개" = 재분석**
10. **오케스트레이터는 코딩/파티모드 직접 안 함**
11. **Worker spawn 시 첫 작업 포함 필수**
12. **5페이지마다 Worker 교체**
