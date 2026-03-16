# Stitch HTML → React 변환 매핑표

## 소스 디렉토리
`1_stitch_remix_of_design_system_style_guide/stitch_remix_of_design_system_style_guide/`

## App 페이지 (27개)

| # | React 페이지 | HTML 소스 폴더 | 테마 | 비고 |
|---|-------------|---------------|------|------|
| 1 | login.tsx | `login_page` | Natural Organic ✅ | split_variant도 있음 |
| 2 | onboarding.tsx | `onboarding_wizard` | Natural Organic ✅ | detailed_variant도 있음 |
| 3 | hub/secretary-hub-layout.tsx | `hub_command_center_variant_1` | Natural Organic ✅ | |
| 4 | chat.tsx | `agent_chat_variant_2` | Natural Organic ✅ | |
| 5 | dashboard.tsx | `analysis_dashboard` | Natural Organic ✅ | |
| 6 | agents.tsx | `agents` | Natural Organic ✅ | |
| 7 | departments.tsx | `departments` | Natural Organic ✅ | |
| 8 | tiers.tsx | `tiers` | Natural Organic ✅ | |
| 9 | jobs.tsx | `jobs_automation` | Natural Organic ✅ | |
| 10 | reports.tsx | `reports_archive` | Stitch Default ⚠️ | 색상 치환 필요 |
| 11 | trading.tsx | `trading` | Natural Organic ✅ | |
| 12 | nexus.tsx | `nexus_org_chart_variant_3` | Natural Organic ✅ | |
| 13 | knowledge.tsx | `knowledge` | Natural Organic ✅ | |
| 14 | sns.tsx | `sns_sns` | Natural Organic ✅ | |
| 15 | messenger.tsx | `messenger` | Natural Organic ✅ | |
| 16 | agora.tsx | `agora_agora` | Natural Organic ✅ | details도 있음 |
| 17 | files.tsx | — | ❌ 없음 | 다른 페이지 참고해서 생성 |
| 18 | costs.tsx | `costs` | Stitch Default ⚠️ | 색상 치환 필요 |
| 19 | performance.tsx | `performance` | Natural Organic ✅ | |
| 20 | activity-log.tsx | `activity_log` | Natural Organic ✅ | |
| 21 | ops-log.tsx | — | ❌ 없음 | activity_log 참고해서 생성 |
| 22 | notifications.tsx | — | ❌ 없음 | 다른 페이지 참고해서 생성 |
| 23 | classified.tsx | `classified` | Natural Organic ✅ | |
| 24 | settings.tsx | — | ❌ 없음 | 다른 페이지 참고해서 생성 |
| 25 | workflows.tsx | `sketchvibe` 참고 | Natural Organic ✅ | |
| 26 | sketchvibe.tsx | `sketchvibe` | Natural Organic ✅ | |
| 27 | home (dashboard redirect) | `home_dashboard` | Natural Organic ✅ | |

## Admin 페이지 (16개)

| # | React 페이지 | HTML 소스 폴더 | 테마 | 비고 |
|---|-------------|---------------|------|------|
| 1 | dashboard.tsx | `admin_dashboard` | Natural Organic ✅ | |
| 2 | users.tsx | `admin_users` | Stitch Default ⚠️ | 색상 치환 필요 |
| 3 | employees.tsx | `admin_employees` | Stitch Default ⚠️ | 색상 치환 필요 |
| 4 | departments.tsx | `crud_admin_departments` | Natural Organic ✅ | |
| 5 | agents.tsx | `crud_soul_admin_agents` | Natural Organic ✅ | |
| 6 | credentials.tsx | `cli_admin_credentials` | Natural Organic ✅ | |
| 7 | tools.tsx | `admin_tools` | Natural Organic ✅ | |
| 8 | costs.tsx | `admin_costs` | Natural Organic ✅ | |
| 9 | report-lines.tsx | `admin_report_lines` | Natural Organic ✅ | |
| 10 | soul-templates.tsx | `soul_admin` | Natural Organic ✅ | |
| 11 | monitoring.tsx | — | ❌ 없음 | admin_dashboard 참고 |
| 12 | nexus.tsx | `nexus_admin` | Stitch Default ⚠️ | 색상 치환 필요 |
| 13 | onboarding.tsx | `admin_onboarding` | Natural Organic ✅ | |
| 14 | settings.tsx | — | ❌ 없음 | 다른 admin 참고 |
| 15 | companies.tsx | — | ❌ 없음 | admin_dashboard 참고 |
| 16 | workflows.tsx | — | ❌ 없음 | app workflows 참고 |

## 통계
- Natural Organic HTML 있음: 31개 ✅
- Stitch Default (색상 치환 필요): 6개 ⚠️
- HTML 없음 (새로 생성): 6개 ❌
- **총: 43개 페이지**

## 공통 컴포넌트 (별도 변환)
- Design System: `design_system_style_guide`
- Error State: `error_state`
- Empty State: `empty_state`
- Advanced Search: `advanced_search`
