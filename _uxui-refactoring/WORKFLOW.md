# CORTHEX v2 — UXUI 리팩토링 + Playwright QA 통합 워크플로우

> 작성일: 2026-03-09
> 개정일: 2026-03-09 (v0.dev 중심 워크플로우로 전환)
> 목적: UI를 싹 갈아엎으면서 기능은 절대 깨지지 않도록 하는 전체 작업 순서

---

## 작업 환경 (중요!)

**모든 작업은 Windows PC의 VS Code 한 곳에서 진행.**

```
┌─────────────────────────────────────────────────────┐
│  Windows PC (VS Code)                               │
│                                                     │
│  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │ Claude Code     │  │ Playwright Test 확장     │  │
│  │ (이 창)         │  │ (VS Code 확장, Microsoft)│  │
│  │                 │  │                         │  │
│  │ • 설명서 작성   │  │ • 테스트 실행 (▶ 클릭)  │  │
│  │ • v0 프롬프트   │  │ • 브라우저 실시간 확인   │  │
│  │   생성          │  │ • 실패 스크린샷 확인     │  │
│  │ • v0 코드 보완  │  │ • Trace Viewer          │  │
│  │ • 테스트 코드   │  │                         │  │
│  │   작성          │  │                         │  │
│  └─────────────────┘  └─────────────────────────┘  │
│                                                     │
│  사용자: v0.dev에서 UI 생성 (같은 PC 브라우저)       │
│                                                     │
└──────────────────────┬──────────────────────────────┘
                       │ 배포된 사이트에 접속
                       ▼
              https://corthex-hq.com  (VPS에서 서비스 중)
              https://corthex-hq.com/admin
```

**VPS는 서버만 돌린다.** Playwright 테스트, 코딩, 설명서 작성 전부 이 PC에서 한다.

### 필요한 것

| 항목 | 상태 |
|------|------|
| VS Code | ✅ 이미 있음 |
| Claude Code (VS Code 확장) | ✅ 지금 이거 |
| **Playwright Test for VSCode** (Microsoft) | ✅ 설치 완료 |
| **v0.dev** (Vercel) | ✅ GitHub 연결 완료 (kodonghui/corthex-v2) |

---

## 전체 흐름 한눈에 보기

```
[Phase 0] Playwright 환경 세팅 (이 PC에서, 한 번만) ✅ 완료
    ↓
[Phase 1] 현재 기능 상태 점검 (스모크 테스트) ✅ 완료
    ↓
[Phase 2] UXUI 리팩토링 (페이지별 반복)
    → A. Claude 설명서 작성 + 파티모드
    → B. Claude가 v0 프롬프트 생성
    → C. 사용자가 v0.dev에 전달 → v0가 디자인+코딩 → GitHub PR
    → D. Claude가 v0 브랜치 머지 + 보완 + 파티모드
    → E. Playwright 테스트 작성 + 실행
    → F. 커밋 + 푸시 (자동 배포)
    ↓
[Phase 3] 시각 회귀 테스트 기준 이미지 등록
    ↓
[Phase 4] 최종 전체 검증 + 배포
```

---

## Phase 0: Playwright 환경 세팅 ✅ 완료

> 이미 완료됨. `packages/e2e/` 존재.

---

## Phase 1: 현재 기능 상태 점검 ✅ 완료

> 결과: `_uxui-refactoring/phase1-baseline.md` 참조
> 앱 23/23 통과, 어드민 16/19 통과 (3개 auth 이슈)

---

## Phase 2: UXUI 리팩토링 (페이지별 반복 작업)

> 전체 페이지: 앱 23개 + 어드민 19개 = 42개
> **전부 이 VS Code 안에서 진행**

### 페이지 1개당 작업 순서 (6단계)

```
Step A: Claude가 설명서 작성 + 파티모드 2라운드    ← 자동
Step B: Claude가 v0 프롬프트 생성                   ← 자동
Step C: 사용자가 v0.dev에 프롬프트 전달              ← 사용자 (복붙)
        → v0가 디자인+코딩 → GitHub PR 생성
Step D: Claude가 v0 브랜치 머지 + 보완               ← 자동
        (TypeScript 수정, data-testid, 백엔드 연결)
        + 파티모드 2라운드
Step E: Claude가 Playwright 테스트 작성 + 실행       ← 자동
Step F: 커밋 + 푸시 (자동 배포)                      ← 자동
```

**사용자가 직접 하는 건 Step C(v0에 프롬프트 복붙)만.**

---

### Step A. 설명서 작성 (Claude Code가 자동으로)

```
저장 위치: _uxui-refactoring/specs/{번호}-{페이지명}.md
예시:     _uxui-refactoring/specs/01-command-center.md
```

설명서에 포함되는 내용:

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

---

### Step B. v0 프롬프트 생성 (Claude Code가 자동으로)

Claude가 설명서 + 현재 코드를 바탕으로 v0.dev에 보낼 프롬프트를 생성.
사용자에게 출력하면 사용자가 v0.dev에 복붙.

**v0 프롬프트 표준 구조:**
```
1. Project Context (한 번만 — v0에 처음 줄 때)
2. Page purpose + user scenario
3. Required features (기능 로직은 변경 금지)
4. Design direction (v0에게 디자인 자유도 부여)
5. data-testid list (필수 포함)
6. Current code path (v0가 GitHub에서 읽을 수 있게)
```

---

### Step C. v0.dev에서 디자인+코딩 (사용자가 직접)

1. v0.dev 접속 (같은 PC 브라우저)
2. Claude가 만든 프롬프트 복붙
3. v0가 디자인+코딩 수행 (v0 Pro 모델 권장)
4. 결과 확인 후 "Open PR" 클릭 → GitHub에 브랜치+PR 생성
5. Claude에게 알리기: "v0 PR 만들었어"

---

### Step D. Claude가 v0 코드 통합 + 보완

Claude Code가 하는 일:
1. v0 브랜치 머지
2. TypeScript 타입 에러 수정
3. data-testid 추가/확인 (설명서 11번 대조)
4. 기존 기능 로직 유지 확인 (API 호출, 상태관리)
5. 빠진 부분 보완
6. **파티모드 2라운드** (코드 리뷰)

---

### Step E. Playwright 테스트 작성 + 실행

```
저장 위치: packages/e2e/src/tests/interaction/{app|admin}/{페이지명}.spec.ts
```

---

### Step F. 커밋 + 푸시

```bash
git commit -m "feat(uxui): {페이지명} UI 리팩토링 -- v0 + 2 party rounds, {N} tests"
git push
# → GitHub Actions → VPS 빌드 → 배포 → Cloudflare 캐시 퍼지
```

---

## Phase 3: 시각 회귀 테스트 기준 이미지 등록

> 전제 조건: 1순위 페이지들(최소 9개) UXUI 리팩토링 완료

```bash
cd packages/e2e
npx playwright test src/tests/visual/ --update-snapshots
```

---

## Phase 4: 최종 전체 검증 + 배포

```bash
npx playwright test src/tests/smoke/        # 전 페이지 접근
npx playwright test src/tests/interaction/   # 기능 동작
npx playwright test src/tests/visual/        # 스크린샷 비교
```

---

## 역할 분담 요약

| 단계 | 누가 | 뭘 하는지 | 어디서 |
|------|------|----------|--------|
| Phase 0 세팅 | Claude Code | Playwright 설치 + 설정 | 이 VS Code |
| Phase 1 점검 | Claude Code | 스모크 테스트 실행 + 결과 기록 | 이 VS Code |
| Phase 2-A | Claude Code | 페이지 설명서 작성 + 파티모드 | 이 VS Code |
| Phase 2-B | Claude Code | v0 프롬프트 생성 | 이 VS Code |
| **Phase 2-C** | **사용자** | **v0.dev에 프롬프트 전달 → PR 생성** | **같은 PC 브라우저** |
| Phase 2-D | Claude Code | v0 코드 머지 + 보완 + 파티모드 | 이 VS Code |
| Phase 2-E | Claude Code | 테스트 작성 + 실행 | 이 VS Code |
| Phase 2-F | Claude Code | 커밋 + 푸시 (자동 배포) | 이 VS Code |
| Phase 3 | Claude Code | 기준 스크린샷 등록 | 이 VS Code |
| Phase 4 | Claude Code | 최종 전체 테스트 | 이 VS Code |

**사용자가 직접 하는 건 Phase 2-C(v0에 프롬프트 복붙)만.**

---

## data-testid 네이밍 규칙

```
형식: {페이지명}-{역할}

예시:
  data-testid="command-input"         ← 사령관실 입력창
  data-testid="command-submit"        ← 사령관실 전송 버튼
  data-testid="agent-list"            ← 에이전트 목록
  data-testid="chat-input"            ← 채팅 입력창
```

---

## 트러블슈팅

| 문제 | 원인 | 해결 |
|------|------|------|
| 테스트 시작 안 됨 | Chromium 미설치 | `npx playwright install chromium` |
| VS Code에 테스트 안 보임 | 확장이 config 못 찾음 | `playwright.config.ts` 경로 확인 |
| 로그인 실패 | `.env.test` 비밀번호 오류 | 비밀번호 확인 |
| 페이지 타임아웃 | 배포 사이트 다운 | VPS 서버 상태 확인 |
| v0 빌드 에러 | 모노레포 의존성 | v0 프리뷰는 무시, 코드만 사용 |
| v0 프리뷰 "Network error" | 백엔드 연결 불가 | 정상 — v0 프리뷰는 안 됨 |
| v0 JSX.Element 에러 | React 19 호환성 | Claude가 React.ReactNode로 수정 |
