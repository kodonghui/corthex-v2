# UXUI Full Auto Pipeline — 전체 워크플로우

## 전제 조건

프로덕트의 기능 구현이 완료된 상태. 백엔드 API가 동작하고, 프론트엔드 페이지가 존재하지만 디자인을 처음부터 새로 하고 싶을 때 사용.

---

## Phase 0: 스펙 준비 (1회)

### 0-1. 스펙 폴더 생성

```bash
mkdir -p _uxui-redesign/01-spec
mkdir -p _uxui-redesign/02-design
mkdir -p _uxui-redesign/03-implement
```

### 0-2. 입력물 준비

`_uxui-redesign/01-spec/` 에 아래 3개 파일을 넣는다:

| 파일 | 내용 | 주의 |
|------|------|------|
| `prd.md` | 제품 요구사항 문서 | 디자인 관련 내용(색상, 테마 등) 제거. 순수 기능만 |
| `api-endpoints.md` | 백엔드 API 엔드포인트 전체 목록 | Method, Path, 설명, Request/Response 포함 |
| `shared-types.ts` | 프론트/백 공유 TypeScript 타입 정의 | 그대로 복사 |

**PRD에서 디자인 관련 내용 확인 방법:**
```bash
grep -i "군사\|military\|color\|색상\|테마\|theme\|dark\|font\|typography" prd.md
```
아무것도 안 나오면 OK. 나오면 해당 내용 제거.

### 0-3. 커밋

```bash
git add _uxui-redesign/01-spec/
git commit -m "docs(uxui): add spec files for UXUI redesign"
git push
```

**중요**: 01-spec을 커밋해야 워크트리에 자동으로 포함됨. 안 하면 워크트리마다 수동 복사 필요.

---

## Phase 1: 워크트리 생성

각 AI 도구마다 독립된 워크트리를 생성한다.

```bash
# Claude 세션용
git worktree add .claude/worktrees/ui-ux-pro-max -b uxui-pro-max
git worktree add .claude/worktrees/libre-ui-synth -b uxui-libre
git worktree add .claude/worktrees/subframe -b uxui-subframe

# Gemini 세션용 (컨셉별)
git worktree add .claude/worktrees/gemini -b uxui-gemini
git worktree add .claude/worktrees/gemini2 -b uxui-gemini2
git worktree add .claude/worktrees/gemini3 -b uxui-gemini3
git worktree add .claude/worktrees/gemini4 -b uxui-gemini4
git worktree add .claude/worktrees/gemini5 -b uxui-gemini5
```

워크트리 확인:
```bash
git worktree list
```

### 워크트리 삭제/재생성

```bash
git worktree remove --force .claude/worktrees/{name}
git branch -D uxui-{name}
git worktree add .claude/worktrees/{name} -b uxui-{name}
```

**주의**: 해당 폴더를 열고 있는 프로그램이 있으면 삭제 실패함 (Device or resource busy). 에디터/탐색기 닫고 재시도.

---

## Phase 2: 병렬 디자인 실행

### 토큰 절약 팁

| 방법 | 효과 |
|------|------|
| Claude는 Sonnet으로 (`/model claude-sonnet-4-6`) | Opus 대비 토큰 ~5배 절약 |
| Gemini로 HTML 대량 생성 | Claude 토큰 절약 |
| 한번에 45페이지 말고 5페이지씩 | 실패 시 손실 최소화 |
| 동시 3세션 이상 주의 | Claude Max 한도 30분 만에 소진 가능 |

### 각 세션 실행 순서

1. 세션 열기 (VSCode에서 워크트리 폴더 열기 또는 터미널에서 `claude` 실행)
2. **Claude**: `/model claude-sonnet-4-6` 입력 (토큰 절약)
3. 프롬프트 붙여넣기 (02-prompts-claude.md 또는 03-prompts-gemini.md 참고)
4. 작업 진행 관찰
5. 결과물은 `_uxui-redesign/02-design/{도구이름}/` 에 저장됨

### 디자인 방향 차별화 (필수!)

"자유롭게 만들어"만 쓰면 전부 똑같이 나옴. 각 세션에 반드시 서로 다른 방향을 지정:

| 세션 | 방향 | 레퍼런스 | 핵심 키워드 |
|------|------|----------|------------|
| ui-ux-pro-max | 미니멀 타이트 | Linear, Vercel, Raycast | 여백, 타이포 중심, 장식 없음 |
| libre-ui-synth | 따뜻하고 친근 | Figma, Notion, Slack | 둥근 모서리, 부드러운 그림자 |
| subframe | 대담하고 밀도 높음 | Discord, Spotify, GitHub | 정보 밀도, 파워유저 |
| gemini | 기본 (첫 시도) | 자유 | - |
| gemini2 | 네오 브루탈리즘 | Gumroad, Figma Community | 두꺼운 보더, 원색, 3D 버튼 |
| gemini3 | 글래스모피즘 다크 | Apple Vision Pro, Linear, Arc | 반투명 카드, 글로우, 그라데이션 |
| gemini4 | 내추럴 오가닉 | Notion, Things 3, Bear | 베이지 배경, 세리프, 따뜻한 색감 |
| gemini5 | 모노크롬 타이포 | Stripe, Apple Developer | 흑백, 타이포 위계, 극미니멀 |

---

## Phase 3: HTML 미리보기

### 방법 1: 더블클릭
`.claude/worktrees/{도구이름}/_uxui-redesign/02-design/{도구이름}/app-home.html` 더블클릭 → 브라우저에서 열림

### 방법 2: VSCode Live Server
1. VSCode 확장 설치: `ritwickdey.LiveServer`
2. HTML 파일 열기
3. 하단 "Go Live" 클릭
4. 수정하면 실시간 반영

---

## Phase 4: 비교 및 채택

모든 세션 완료 후:

1. 각 `02-design/{도구이름}/design-system.html` 열어서 디자인 시스템 비교
2. 대표 페이지 (home, dashboard, command-center) 비교
3. 마음에 드는 디자인 채택
4. 필요하면 **채택한 디자인의 색상만 변경**한 변형도 가능
   - 같은 레이아웃 + 다크 테마
   - 같은 레이아웃 + 다른 액센트 컬러

---

## Phase 5: React 구현 (채택 후)

채택된 HTML을 실제 React 코드로 옮긴다.

### 옮기는 것
- Tailwind 클래스 → **그대로 복붙**
- 레이아웃 구조 → React 컴포넌트로 변환
- 색상, 폰트, 간격 → 그대로

### 추가하는 것
- 더미 데이터 → 실제 API 연결 (`api-endpoints.md` 참고)
- 정적 HTML → 인터랙션 (클릭, 폼, 모달 등)
- 라우팅 연결
- 상태관리 (Zustand, TanStack Query 등)

### 작업 단위
- 페이지 1개씩 진행
- 기존 파일(`packages/app/src/pages/*.tsx`)을 수정 (새 파일 X)
- 기존 API 연결 로직은 그대로 유지, 디자인(Tailwind 클래스)만 교체

결과물 → `_uxui-redesign/03-implement/`에 변경 요약 기록

---

## 워크플로우 정리 요약

```
Phase 0: 스펙 준비
  └─ prd.md + api-endpoints.md + shared-types.ts → 01-spec/

Phase 1: 워크트리 생성
  └─ git worktree add (도구별 독립 브랜치)

Phase 2: 병렬 디자인
  ├─ Claude 세션 × 3 (pro-max, libre, subframe)
  └─ Gemini 세션 × 5 (기본, 브루탈, 글래스, 오가닉, 모노크롬)

Phase 3: HTML 미리보기
  └─ 더블클릭 or Live Server

Phase 4: 비교 및 채택
  └─ design-system.html + 대표 페이지 비교 → 1개 채택

Phase 5: React 구현
  └─ HTML의 Tailwind → 기존 React 페이지에 적용 + API 연결
```
