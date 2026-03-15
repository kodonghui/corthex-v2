# 2026-03-15 — Claude Code 2.1.76 전체 적용 + 파이프라인 v7.1/v3.1

## 변경 내용

### 환경 설정
- `hooks.json`: PreCompact 제거 → PostCompact 추가 (2.1.76 신기능)
- `settings.json`: `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS=15000` 추가
- `hooks/post-compact-save.sh` 생성 (압축 후 working-state + git commit)
- `hooks/pre-compact-save.sh` 삭제 (PostCompact로 대체)
- 자동 업데이트 cron 설정: `/home/ubuntu/scripts/claude-code-auto-update.sh` 매일 04:00

### 파이프라인 업그레이드
- `kdh-full-auto-pipeline.md`: v7.0 → v7.1
  - Defense 테이블에 1M context 추가
  - 2.1.76 Enhancements 섹션 추가 (PostCompact, worktree cleanup, partial results, SessionEnd timeout)
  - Anti-pattern 섹션: stale resource 정리를 Claude Code 내장으로 변경
- `kdh-uxui-redesign-full-auto-pipeline.md`: v3.0 → v3.1
  - Safeguards에 2.1.76 Enhancements 섹션 추가

### MEMORY.md
- v1 소스 삭제 반영
- Pipeline 버전 v7.1/v3.1로 업데이트
- 자동 업데이트 cron 항목 추가

## 영향받는 파일
- `.claude/hooks.json`
- `.claude/hooks/post-compact-save.sh` (신규)
- `.claude/hooks/pre-compact-save.sh` (삭제)
- `.claude/commands/kdh-full-auto-pipeline.md`
- `.claude/commands/kdh-uxui-redesign-full-auto-pipeline.md`
- `~/.claude/settings.json`
- `~/scripts/claude-code-auto-update.sh` (신규)

## 결과
- 2.1.76 주요 기능 6개 환경+파이프라인에 반영
- 자동 업데이트로 향후 버전도 자동 적용
