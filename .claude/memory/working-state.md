# Working State — 2026-03-15

## 현재 작업
- UXUI Redesign Pipeline v3.1 Phase 7 ~85% 완료
- 앱 Stitch 화면 27개 전체 생성 완료 (기존 6 + 신규 21)

## 완료된 것
1. Epic 16-21 완료 (31 스토리, ~1,098 테스트, 6 Go/No-Go 통과)
2. 회고 완료 (epic-16-21-retro-2026-03-15.md)
3. 파이프라인 v7.1 + v3.1 업그레이드 (Libre 통합 + 2.1.76 enhancements)
4. Docker corthex-v2 수정 (CREDENTIAL_ENCRYPTION_KEY)
5. v1 폴더 삭제
6. tmux 모바일 키바인딩 설정
7. Claude Code 2.1.73~76 분석 + 전체 적용
8. 환경: PostCompact hook, SessionEnd 15초, 자동 업데이트 cron
9. LitMaster 메모리 저장
10. UXUI Phase 0~6 완료
11. Phase 7: 토큰+layout+sidebar+64컴포넌트+라우팅+API맵+접근성+색상마이그레이션+API훅13개+테마스위칭+랜딩
12. 앱 Stitch 화면 21개 추가 생성 (Dashboard, Agents, Departments, Settings, Notifications, Knowledge, Costs, Activity Log, Command Center, Reports, Performance, SNS, Trading, Messenger, Ops Log, Files, Org, Login, Agora, Classified, Tiers)

## 핵심 결정
- PreCompact → PostCompact 훅 교체 (2.1.76)
- SessionEnd 타임아웃 15초 (CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS)
- Claude Code 자동 업데이트: 매일 새벽 4시 cron
- 1M 컨텍스트 + stale worktree auto-cleanup 파이프라인 반영

## Stitch 앱 화면 목록 (27개)
| # | 화면 | 파일 |
|---|------|------|
| 01 | App Shell | 01-app-shell.html |
| 02 | Hub | 02-hub.html |
| 03 | Chat | 03-chat.html |
| 04 | NEXUS | 04-nexus.html |
| 05 | Jobs | 05-jobs.html |
| 06 | Profile | 06-profile.html |
| 07 | Dashboard | 07-dashboard.html |
| 08 | Agents | 08-agents.html |
| 09 | Departments | 09-departments.html |
| 10 | Settings | 10-settings.html |
| 11 | Notifications | 11-notifications.html |
| 12 | Knowledge | 12-knowledge.html |
| 13 | Costs | 13-costs.html |
| 14 | Activity Log | 14-activity-log.html |
| 15 | Command Center | 15-command-center.html |
| 16 | Reports | 16-reports.html |
| 17 | Performance | 17-performance.html |
| 18 | SNS | 18-sns.html |
| 19 | Trading | 19-trading.html |
| 20 | Messenger | 20-messenger.html |
| 21 | Ops Log | 21-ops-log.html |
| 22 | Files | 22-files.html |
| 23 | Org | 23-org.html |
| 24 | Login | 24-login.html |
| 25 | Agora | 25-agora.html |
| 26 | Classified | 26-classified.html |
| 27 | Tiers | 27-tiers.html |

## 다음 할 일
- Phase 7 남은 것: 앱 컴포넌트 TSX 변환 + tsc 에러 수정 + 최종 통합 테스트
- tsc 기존 에러 10K+ (packages/ui jsx flag, test files) — Phase 7 이전부터 존재

## 주의사항
- pipeline-status.yaml이 진행 상황 추적
- _corthex_full_redesign/ 폴더에 산출물 저장
- Stitch MCP 프로젝트 ID: 1459313405794412216
