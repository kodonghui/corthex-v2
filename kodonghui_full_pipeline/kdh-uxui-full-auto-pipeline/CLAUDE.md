# CLAUDE.md -- kdh-uxui-full-auto-pipeline

## 이 파이프라인이 뭔지
SaaS 프로덕트 UXUI를 여러 AI 도구로 병렬 디자인하고, 비교 후 채택하는 워크플로우.
기존 디자인 없이 처음부터 만들 때 사용.

## 폴더 구조 규칙

```
_uxui-redesign/
├── 01-spec/                      ← 입력물 (PRD, API, 타입)
│   ├── prd.md                    ← 기능 요구사항 (디자인 내용 없어야 함)
│   ├── api-endpoints.md          ← 백엔드 API 목록
│   └── shared-types.ts           ← TypeScript 데이터 타입
├── 02-design/                    ← 각 도구별 디자인 결과물
│   ├── ui-ux-pro-max/            ← Claude /ui-ux-pro-max 결과
│   ├── libre-ui-synth/           ← Claude /libre-ui-synth 결과
│   ├── subframe/                 ← Subframe 결과
│   ├── gemini/                   ← Gemini 기본 결과
│   ├── gemini2/                  ← Gemini 네오 브루탈리즘
│   ├── gemini3/                  ← Gemini 글래스모피즘 다크
│   ├── gemini4/                  ← Gemini 내추럴 오가닉
│   └── gemini5/                  ← Gemini 모노크롬 타이포
└── 03-implement/                 ← 채택된 디자인의 실제 React 코드
```

## 워크트리 규칙
- 각 AI 도구는 독립된 git worktree에서 작업
- 워크트리 경로: `.claude/worktrees/{도구이름}/`
- **절대 메인 경로에 결과물을 쓰지 말 것** (워크트리 내부에만)
- 워크트리 생성: `git worktree add .claude/worktrees/{name} -b uxui-{name}`

## 결과물 형식
- **HTML**: Tailwind CDN 사용, standalone, 더블클릭으로 브라우저 열림
- **React 불필요**: 디자인 비교 단계에서는 순수 HTML+CSS+JS만
- **API 주석**: 각 HTML에 해당 API 엔드포인트를 주석으로 표시
- **한국어 UI**: 메뉴, 라벨 등 모두 한국어

## 디자인 차별화 필수
- 각 세션에 **서로 다른 디자인 방향**을 명시적으로 지정
- "자유롭게 만들어"만 쓰면 전부 사이드바+파란색으로 수렴함
- 레퍼런스 서비스, 색상 방향, 레이아웃 스타일을 구체적으로 지정

## 업데이트 로그
- 모든 주요 변경사항은 `.claude/updates/` 폴더에 기록
- 파일명: `YYYY-MM-DD-topic.md`
- 내용: 뭘 했는지, 왜 했는지, 결과가 뭔지
