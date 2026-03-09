# 데스크톱 앱 코딩 프롬프트

> 이 파일의 프롬프트를 **Claude Code 데스크톱 앱**에 복사-붙여넣기 하세요.
> 페이지별로 하나씩 실행합니다. `{PAGE}` 부분만 바꿔서 반복합니다.

---

## 시작 전 필수: 맥락 주입 프롬프트 (첫 대화에서 한 번만)

아래를 데스크톱 앱 첫 메시지로 보내세요:

```
너는 CORTHEX v2 프로젝트의 UXUI 리팩토링 코더야.

## 프로젝트 개요
- CORTHEX = AI 직원을 관리하는 플랫폼 (Slack + Linear 같은 느낌)
- 모노레포: packages/app (직원용), packages/admin (관리자용), packages/server, packages/shared, packages/ui
- 프론트엔드: React 19 + Vite 6 + Tailwind CSS 4
- 상태: Zustand + TanStack Query

## 네가 할 일
기능 로직은 절대 건드리지 않고, **UI/레이아웃/Tailwind 클래스만** 변경하는 UXUI 리팩토링.
디자인 이미지 + 설명서를 보고 기존 페이지의 외관을 개선한다.

## 핵심 규칙
1. **기능 로직 건드리지 말 것** — API 호출, 상태관리, 이벤트 핸들러는 그대로 유지
2. **UI/레이아웃/스타일/Tailwind 클래스만 변경**
3. **⚠️ 디자인 이미지가 레이아웃의 최종 기준** — 이미지가 3단 레이아웃이면 3단으로 만들 것. 설명서에 "현재 구조 유지"라고 써 있어도 이미지가 다르면 이미지를 따를 것. 이미지 = 목표 디자인
4. **설명서 11번의 data-testid 전부 추가** (기존 data-testid 삭제 금지)
5. **새 파일 생성 최소화** — 기존 파일 수정 선호
6. **반응형 필수** — 데스크톱(1440px), 태블릿(768px), 모바일(375px)
7. **다크모드 고려** — 이미지가 다크면 다크, 라이트면 라이트
8. **"군사/사령관/military" 표현 절대 금지** — UI 텍스트에도, 주석에도

## 참고 파일 위치
- 설명서: `_uxui-refactoring/specs/{번호}-{페이지명}.md`
- 디자인 이미지: `_uxui-refactoring/designs/{번호}-{페이지명}-desktop.png`, `-mobile.png`, `-tablet.png`
- v1 기능 스펙: `_bmad-output/planning-artifacts/v1-feature-spec.md`
- 진행 상황: `_uxui-refactoring/PROGRESS.md`

## 파이프라인 커맨드
이 프로젝트에 `/kdh-uxui-pipeline` 슬래시 커맨드가 설치되어 있어.
`/kdh-uxui-pipeline code {페이지명}` 으로 실행하면 전체 절차가 나와.

알겠으면 "준비 완료"라고만 답해.
```

---

## 페이지별 코딩 프롬프트 (이미지 생성 후 하나씩 실행)

### 방법 1: 슬래시 커맨드 사용 (추천)

```
/kdh-uxui-pipeline code command-center
```

이렇게 한 줄이면 됩니다. 파이프라인이 알아서:
1. 이미지 읽기
2. 설명서 읽기
3. 코딩
4. 파티모드 2라운드
5. Playwright 테스트
6. 커밋

까지 전부 해줍니다.

---

### 방법 2: 직접 프롬프트 (슬래시 커맨드가 안 먹히면)

`{PAGE}`를 실제 페이지명으로 바꾸세요. `{NUM}`은 번호.

```
UXUI 리팩토링: {NUM}-{PAGE}

## 1단계: 자료 읽기
아래 파일들을 전부 읽어:
- `_uxui-refactoring/designs/{NUM}-{PAGE}-desktop.png` (디자인 이미지 - 데스크톱)
- `_uxui-refactoring/designs/{NUM}-{PAGE}-mobile.png` (디자인 이미지 - 모바일)
- `_uxui-refactoring/specs/{NUM}-{PAGE}.md` (설명서)

## 2단계: 현재 코드 파악
해당 페이지의 현재 코드를 읽어. 위치:
- app 페이지 (01~06): `packages/app/src/pages/` 아래
- admin 페이지 (07~09): `packages/admin/src/pages/` 아래
관련 컴포넌트도 함께 확인해.

## 3단계: 코딩
디자인 이미지 + 설명서를 보고 UI를 **디자인 이미지처럼** 만들어.

⚠️ 가장 중요한 규칙 — 이미지 vs 설명서 우선순위:
- **레이아웃/구조/배치/크기/색상** → 디자인 이미지가 최종 기준
- **data-testid/기능 요소/상태 정의** → 설명서가 기준
- 설명서에 "현재 구조 유지"라고 써 있어도, 이미지가 다른 레이아웃이면 → 이미지를 따라
- 이미지가 보여주는 것이 "목표 디자인"이야. 소폭 개선이 아니라 이미지대로 만들어야 해

절대 규칙:
- 기능 로직(API 호출, 상태관리, 이벤트 핸들러) 절대 건드리지 마
- Tailwind 클래스, 레이아웃, 스타일만 변경
- **디자인 이미지의 레이아웃/구조를 충실히 재현**할 것
- 설명서 11번의 data-testid 전부 추가
- 기존 data-testid 삭제 금지
- 반응형: 데스크톱(1440px), 태블릿(768px), 모바일(375px)

## 4단계: 검증
코딩 끝나면:
1. `npx tsc --noEmit -p packages/server/tsconfig.json` 실행 (타입 체크)
2. 브라우저 미리보기에서 직접 확인
3. 깨지는 곳 있으면 수정

## 5단계: 커밋
전부 통과하면 커밋:
`feat(uxui): {PAGE} UI 리팩토링`
```

---

## 페이지 순서 (이 순서대로 하나씩)

| 순서 | 명령어 | 패키지 |
|------|--------|--------|
| 1 | `/kdh-uxui-pipeline code command-center` | app |
| 2 | `/kdh-uxui-pipeline code chat` | app |
| 3 | `/kdh-uxui-pipeline code dashboard` | app |
| 4 | `/kdh-uxui-pipeline code trading` | app |
| 5 | `/kdh-uxui-pipeline code agora` | app |
| 6 | `/kdh-uxui-pipeline code nexus` | app |
| 7 | `/kdh-uxui-pipeline code agents` | admin |
| 8 | `/kdh-uxui-pipeline code departments` | admin |
| 9 | `/kdh-uxui-pipeline code credentials` | admin |

---

## 트러블슈팅

### 슬래시 커맨드가 안 먹힌다
→ 방법 2의 직접 프롬프트 사용

### 이미지를 못 읽는다
→ "이 파일을 읽어줘: `_uxui-refactoring/designs/01-command-center-desktop.png`" 라고 직접 요청

### 기능이 깨졌다
→ "기능 로직은 건드리지 말라고 했어. 원래 코드의 API 호출, 상태관리, 이벤트 핸들러를 복원해" 라고 지시

### 타입 에러가 난다
→ "`npx tsc --noEmit -p packages/server/tsconfig.json` 실행해서 에러 확인하고 수정해" 라고 지시
