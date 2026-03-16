# CORTHEX v2 — E2E QA Plan (3-Agent, 2-Account Full Sweep)

## Site
- **App URL**: https://corthex-hq.com
- **Admin URL**: https://corthex-hq.com/admin/*

## 테스트 계정

| 계정 | 아이디 | 비밀번호 | 역할 | 접근 범위 |
|------|--------|---------|------|----------|
| Admin | `admin` | `admin1234` | 관리자 | App 25 + Admin 16 = 41페이지 |
| CEO | `ceo` | `ceo1234` | 대표 | App 25 + Admin 접근 불가(예상) |

## 검수 범위: 2계정 × 41페이지 = 82회 방문 + 보안 16건

### Admin 계정 (41 페이지)
- App 25개: login, hub, chat, dashboard, agents, departments, tiers, jobs, reports, trading, nexus, knowledge, sns, messenger, agora, files, costs, performance, activity-log, ops-log, workflows, notifications, classified, settings, sketchvibe
- Admin 16개: dashboard, users, employees, departments, agents, credentials, tools, costs, report-lines, soul-templates, nexus, onboarding, monitoring, settings, companies, workflows

### CEO 계정 (25 + 16 보안테스트)
- App 25개: 동일
- Admin 16개: 접근 시도 → 거부 확인 (접근되면 Security Bug)

## QA 에이전트 3명

| # | 에이전트 | 도구 | 특화 역할 | 결과 파일 |
|---|---------|------|----------|----------|
| 1 | Claude Code (VS Code) | Playwright MCP | 자동 스크린샷 + 콘솔 에러 수집 | `playwright-claude-code/BUGS.md` |
| 2 | Gemini (Antigravity) | 브라우저 직접 | 수동 시각 검수 + 인터랙션 | `browser-gemini/BUGS.md` |
| 3 | Claude Desktop | 브라우저 직접 | DOM 검사 + 근본 원인 분석 | `browser-claude-desktop/BUGS.md` |

## 버그 접두사
- P = Playwright (Claude Code)
- G = Gemini
- D = Desktop

## 최종 합산
3명의 BUGS.md를 합쳐서 `shared/BUGS-MERGED.md`로 합산.
3명 중 2명 이상이 같은 버그를 보고하면 → 확정 버그.
