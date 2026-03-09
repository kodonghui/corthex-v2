# UXUI 리팩토링 진행 상황

## Phase 상태
| Phase | 상태 | 날짜 |
|-------|------|------|
| Phase 0 (Playwright 세팅) | 완료 | 2026-03-09 |
| Phase 1 (스모크 테스트) | 완료 | 2026-03-09 |
| Phase 3 (시각 회귀 기준) | 미시작 | - |
| Final (최종 검증) | 미시작 | - |

## 워크플로우 변경 이력
- 2026-03-09: Gemini(Banana2) 제거 → v0.dev 중심 워크플로우로 전환
- v0가 디자인+코딩 → Claude가 보완+통합+테스트

## 페이지별 진행

### 1순위
| # | 페이지 | spec | v0 | integrate | test | 상태 |
|---|--------|------|----|-----------|------|------|
| 01 | command-center | ✅ | ✅ (v0 PR#1) | ✅ | ✅ 10개 | 완료 (v0 첫 파일럿) |
| 02 | chat | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 03 | dashboard | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 04 | trading | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 05 | agora | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 06 | nexus | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 07 | agents (admin) | ✅ 9/10 | - | - | - | spec 완료, v0 대기 |
| 08 | departments (admin) | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 09 | credentials (admin) | ✅ 9/10 | - | - | - | spec 완료, v0 대기 |

### 2순위
| # | 페이지 | spec | v0 | integrate | test | 상태 |
|---|--------|------|----|-----------|------|------|
| 10 | sns | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 11 | messenger | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 12 | ops-log | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 13 | reports | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 14 | jobs | ✅ 7/10 | - | - | - | spec 완료, v0 대기 |
| 15 | knowledge | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 16 | files | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 17 | costs | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 18 | activity-log | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 19 | workflows (admin) | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 20 | tools (admin) | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 21 | users (admin) | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 22 | employees (admin) | ✅ 8/10 | - | - | - | spec 완료, v0 대기 |
| 23 | monitoring (admin) | ✅ 9/10 | - | - | - | spec 완료, v0 대기 |

### 3순위
| # | 페이지 | spec | v0 | integrate | test | 상태 |
|---|--------|------|----|-----------|------|------|
| 24 | home | - | - | - | - | 미시작 |
| 25 | argos | - | - | - | - | 미시작 |
| 26 | classified | - | - | - | - | 미시작 |
| 27 | org | - | - | - | - | 미시작 |
| 28 | cron | - | - | - | - | 미시작 |
| 29 | performance | - | - | - | - | 미시작 |
| 30 | notifications | - | - | - | - | 미시작 |
| 31 | settings | - | - | - | - | 미시작 |
| 32 | org-chart (admin) | - | - | - | - | 미시작 |
| 33 | org-templates (admin) | - | - | - | - | 미시작 |
| 34 | template-market (admin) | - | - | - | - | 미시작 |
| 35 | agent-marketplace (admin) | - | - | - | - | 미시작 |
| 36 | soul-templates (admin) | - | - | - | - | 미시작 |
| 37 | report-lines (admin) | - | - | - | - | 미시작 |
| 38 | api-keys (admin) | - | - | - | - | 미시작 |
| 39 | costs-admin (admin) | - | - | - | - | 미시작 |
| 40 | companies (admin) | - | - | - | - | 미시작 |
| 41 | settings-admin (admin) | - | - | - | - | 미시작 |
| 42 | onboarding (admin) | - | - | - | - | 미시작 |
