# Phase 1 Baseline — 스모크 테스트 결과
> 날짜: 2026-03-09
> 테스트 실행 시간: 1분 12초

## 요약
| 항목 | 값 |
|------|-----|
| 전체 테스트 | 67 |
| 통과 | 64 (95.5%) |
| 실패 | 3 (4.5%) |
| 프로젝트 | app(23), admin(19), mobile(23), auth-setup(2) |

## App (일반 사용자) — 23/23 통과
| # | 페이지 | 경로 | Desktop | Mobile | 비고 |
|---|--------|------|---------|--------|------|
| 1 | home | / | OK | OK | |
| 2 | command-center | /command-center | OK | OK | |
| 3 | chat | /chat | OK | OK | |
| 4 | jobs | /jobs | OK | OK | |
| 5 | reports | /reports | OK | OK | |
| 6 | sns | /sns | OK | OK | |
| 7 | messenger | /messenger | OK | OK | |
| 8 | dashboard | /dashboard | OK | OK | |
| 9 | ops-log | /ops-log | OK | OK | |
| 10 | nexus | /nexus | OK | OK | |
| 11 | trading | /trading | OK | OK | |
| 12 | files | /files | OK | OK | |
| 13 | org | /org | OK | OK | |
| 14 | notifications | /notifications | OK | OK | |
| 15 | activity-log | /activity-log | OK | OK | |
| 16 | costs | /costs | OK | OK | |
| 17 | cron | /cron | OK | OK | |
| 18 | argos | /argos | OK | OK | |
| 19 | agora | /agora | OK | OK | |
| 20 | classified | /classified | OK | OK | |
| 21 | knowledge | /knowledge | OK | OK | |
| 22 | performance | /performance | OK | OK | |
| 23 | settings | /settings | OK | OK | |

## Admin (관리자) — 16/19 통과
| # | 페이지 | 경로 | 결과 | 비고 |
|---|--------|------|------|------|
| 1 | admin-home | / | FAIL | /login으로 리다이렉트 (앱 자체 버그) |
| 2 | users | /users | OK | |
| 3 | employees | /employees | OK | |
| 4 | departments | /departments | OK | |
| 5 | agents | /agents | OK | |
| 6 | credentials | /credentials | OK | |
| 7 | companies | /companies | OK | |
| 8 | tools | /tools | OK | |
| 9 | costs | /costs | FAIL | /login?redirect=%2Fcosts로 리다이렉트 |
| 10 | report-lines | /report-lines | OK | |
| 11 | soul-templates | /soul-templates | OK | |
| 12 | monitoring | /monitoring | OK | |
| 13 | org-chart | /org-chart | OK | |
| 14 | org-templates | /org-templates | OK | |
| 15 | workflows | /workflows | OK | |
| 16 | template-market | /template-market | OK | |
| 17 | agent-marketplace | /agent-marketplace | OK | |
| 18 | api-keys | /api-keys | OK | |
| 19 | settings | /settings | FAIL | /login?redirect=%2Fsettings로 리다이렉트 |

## 실패 분석

### 공통 원인
3개 admin 페이지가 모두 `https://corthex-hq.com/login`(일반 사용자 로그인)으로 리다이렉트됨.
`/admin/login`이 아닌 `/login`으로 가는 것이 핵심 — admin 세션이 아닌 app 세션으로 인증을 확인하고 있음.

### 영향 받는 페이지
1. **admin-home (/)** — 대시보드. admin 루트 경로가 제대로 라우팅 안 됨
2. **costs (/costs)** — 비용 관리. redirect 파라미터 포함
3. **settings (/settings)** — 설정. redirect 파라미터 포함

### 수정 방향
- UXUI 리팩토링 과정에서 admin 라우팅/인증 로직 점검 필요
- admin-home, costs, settings 페이지의 인증 가드 확인

## 다음 단계
Phase 1 완료. 다음은 페이지별 UXUI 리팩토링 시작:
1. `spec command-center` — 1순위 첫 번째 페이지 설명서 작성
