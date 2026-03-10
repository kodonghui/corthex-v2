# 2026-03-10: UXUI Redesign Pipeline Setup

## What was done

### 1. UXUI Redesign 폴더 구조 생성
- `_uxui-redesign/01-spec/` — PRD, API endpoints, shared types
- `_uxui-redesign/02-design/` — 각 도구별 디자인 결과물
- `_uxui-redesign/03-implement/` — 채택 후 실제 구현

### 2. 스펙 파일 준비
- `01-spec/prd.md` ← `_bmad-output/planning-artifacts/prd.md` 복사 (디자인 관련 내용 없음 확인됨)
- `01-spec/api-endpoints.md` ← 서버 라우트에서 자동 생성 (~300개 엔드포인트)
- `01-spec/shared-types.ts` ← `packages/shared/src/types.ts` 복사

### 3. 기존 디자인 산출물 삭제
- `_uxui-refactoring/` 삭제 (lovable/claude 프롬프트 42개 + party logs)
- `design-system/` 삭제 (군사 테마 디자인 문서)
- `.claude/commands/kdh-uxui-pipeline.md` 삭제 (이전 파이프라인)

### 4. Git Worktree 8개 생성
| Worktree | Branch | Tool |
|----------|--------|------|
| `.claude/worktrees/ui-ux-pro-max` | uxui-pro-max | Claude /ui-ux-pro-max |
| `.claude/worktrees/libre-ui-synth` | uxui-libre | Claude /kdh-libre-uxui-full-auto-pipeline |
| `.claude/worktrees/subframe` | uxui-subframe | Claude /subframe:design |
| `.claude/worktrees/gemini` | uxui-gemini | Gemini (기본) |
| `.claude/worktrees/gemini2` | uxui-gemini2 | Gemini (네오 브루탈리즘) |
| `.claude/worktrees/gemini3` | uxui-gemini3 | Gemini (글래스모피즘 다크) |
| `.claude/worktrees/gemini4` | uxui-gemini4 | Gemini (내추럴 오가닉) |
| `.claude/worktrees/gemini5` | uxui-gemini5 | Gemini (모노크롬 타이포) |

### 5. Pipeline 문서화
- `kodonghui_full_pipeline/kdh-uxui-full-auto-pipeline/` 폴더 생성
- README.md, CLAUDE.md, 01-workflow.md, 02-prompts-claude.md, 03-prompts-gemini.md, 04-libre-pipeline-detail.md

### 6. CLAUDE.md 업데이트
- Update Log 규칙 추가 (`.claude/updates/` 에 모든 변경사항 기록 의무화)

### 7. VSCode Live Server 설치
- `ritwickdey.LiveServer` 확장 설치 — HTML 실시간 미리보기용

## Issues encountered
- 워크트리에서 `01-spec/` 누락 → 커밋 안 한 파일은 워크트리에 포함 안 됨
- libre 세션이 메인 경로에 파일 씀 → 프롬프트에 "워크트리에만 써라" 명시 필요
- `design-system/` 폴더가 반복 생성됨 → 다른 세션이 만든 것으로 추정
- Claude Max $220 한도가 30분 만에 소진 → Opus로 3세션 동시에 45페이지 HTML 생성이 원인. Sonnet 사용 권장.

## Key decisions
- 디자인 비교 단계에서는 React가 아닌 **standalone HTML** 사용 (빌드 불필요)
- 각 세션에 **서로 다른 디자인 방향**을 반드시 명시 (안 하면 전부 사이드바+파란색으로 수렴)
- Gemini는 Nano Banana 2로 이미지 시안 먼저 → HTML 변환 (15만원 뽕뽑기)
- 채택 후 React 구현 시: HTML의 Tailwind 클래스 그대로 복붙 + 기존 API 연결 유지

## Files affected
- Created: `_uxui-redesign/01-spec/*`, `kodonghui_full_pipeline/kdh-uxui-full-auto-pipeline/*`, `.claude/updates/`
- Deleted: `_uxui-refactoring/*`, `design-system/*`, `kodonghui_full_pipeline/kdh-uxui-pipeline.md`
- Modified: `CLAUDE.md` (Update Log 규칙 추가)
