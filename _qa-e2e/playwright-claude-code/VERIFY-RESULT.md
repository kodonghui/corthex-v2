# 전수 E2E 검증 리포트
> 검증일: 2026-03-17
> 빌드: #559 / 커밋: 2603ff5
> 사이트: https://corthex-hq.com
> 계정: Admin (admin/admin1234)

## 요약
| 항목 | 수치 |
|------|------|
| 검사 페이지 수 | **66** (App 25×Admin + Admin 16 + CEO App 25) |
| 총 clickable 요소 | 990개 (App 25페이지 합계) |
| 총 input 요소 | 56개 |
| **반응 없는 버튼** | **21개** |
| **빈 링크 (href="#")** | **41개** (App 35 + Admin 6) |
| 콘솔 403 에러 | 1 (/agents) |
| 콘솔 500 에러 | 5 App + Admin 전체 (budget/costs) |
| Material Symbols 잔재 | **0** ✅ |
| fixed 이중 사이드바 | **0** ✅ |
| dark 클래스 | **false** ✅ |
| slate 잔재 (950+900) | 26개 (nexus 22, costs 7, chat 1, sketchvibe 1, departments 1, jobs 1) |
| cyan 잔재 (400+300) | 13개 (nexus 5, chat 4, sketchvibe 4) |

---

## 반응 없는 버튼 목록 (가장 중요!)

### /sns
| # | 버튼 텍스트 | 클릭 결과 | 원인 추정 |
|---|-----------|----------|----------|
| 1 | "Generate New Content" | 무반응 | onClick 미구현 — AI 생성 기능 미연결 |
| 2 | "Approve" | 무반응 | 상태 변경 핸들러 없음 |
| 3 | "Edit Draft" | 무반응 | 에디터 열기 미구현 |
| 4 | "Reschedule" | 무반응 | 날짜 변경 UI 미구현 |
| 5 | "View Stats" | 무반응 | 통계 표시 미구현 |

### /trading
| # | 버튼 텍스트 | 클릭 결과 | 원인 추정 |
|---|-----------|----------|----------|
| 6 | "BUY" | 무반응 | 주문 다이얼로그 미구현 |
| 7 | "SELL" | 무반응 | 주문 다이얼로그 미구현 |
| 8 | "1H" | 무반응 | 타임프레임 전환 미구현 |
| 9 | "4H" | 무반응 | 타임프레임 전환 미구현 |
| 10 | "1D" | 무반응 | 타임프레임 전환 미구현 |
| 11 | "1W" | 무반응 | 타임프레임 전환 미구현 |

### /departments
| # | 버튼 텍스트 | 클릭 결과 | 원인 추정 |
|---|-----------|----------|----------|
| 12 | "새 부서 추가" | 무반응 | 이전 /admin/departments 폼과 달리 App 측 부서 추가 미구현 |

### /settings
| # | 탭 텍스트 | 클릭 결과 | 비고 |
|---|----------|----------|------|
| - | 일반~소울 편집 (7개) | 클릭됨, 탭 전환됨 | ✅ URL ?tab= 변경 확인 |
| - | "MCP 연동" | 버튼 미발견 | 8번째 탭 미구현? |
| - | "이름 저장" | DISABLED | 변경 전 비활성 — 정상 |

### /nexus
| # | 버튼 텍스트 | 클릭 결과 | 원인 추정 |
|---|-----------|----------|----------|
| 13 | "Save Draft" | 무반응 | org-chart API 500으로 저장 불가 |

### /costs
| 14 | "Set Monthly Budget" | 무반응 | 예산 API 미구현 |

### /sketchvibe
| 15 | "Share" | 무반응 | 공유 기능 미구현 |
| 16 | "시작" | 무반응 | React Flow 노드 추가 미연결 |
| 17 | "종료" | 무반응 | 동일 |
| 18 | "에이전트" | 무반응 | 동일 |
| 19 | "시스템" | 무반응 | 동일 |
| 20 | "Export" | 무반응 | 내보내기 미구현 |

### /performance
| 21 | "View Full Report" | 무반응 | 보고서 상세 미구현 |

### 동작 확인된 버튼

| 페이지 | 버튼 | 결과 |
|--------|------|------|
| /sns | Content Library | ✅ 반응 |
| /sns | Publication Queue | ✅ 반응 |
| /sns | Card News | ✅ 반응 |
| /sns | Performance Stats | ✅ 반응 |
| /sns | Linked Accounts | ✅ 반응 |
| /jobs | 새로운 작업 생성 | ✅ 반응 |
| /jobs | New Workspace | ✅ 반응 |
| /jobs | 야간 작업/반복 스케줄/ARGOS 트리거 | ✅ 반응 |
| /knowledge | New Document | ✅ 반응 |
| /knowledge | 문서/에이전트 기억 탭 | ✅ 반응 |
| /knowledge | 새 문서/문서 만들기/새 폴더 | ✅ 반응 |
| /workflows | 워크플로우 생성 | ✅ 반응 |
| /workflows | Workflows/Suggestions 탭 | ✅ 반응 |
| /notifications | 전체/시스템/에이전트/미확인 | ✅ 클릭됨 |
| /files | 업로드 | ✅ 파일 선택 대화상자 열림 |
| /files | 전체/이미지/문서/기타 | ✅ 클릭됨 |
| /settings | 일반~소울 편집 7개 탭 | ✅ 탭 전환 |

---

## 빈 링크 (href="#") 목록 — 총 35개

### /hub (3개)
| # | 링크 텍스트 | 위치 |
|---|-----------|------|
| 1 | "Workspace Hub" | inner sidebar 탭 |
| 2 | "Active Tasks" | inner sidebar 탭 |
| 3 | "Agent Directory" | inner sidebar 탭 |

### /dashboard (1개)
| 1 | "모두 보기" | 에이전트 현황 섹션 |

### /departments (6개)
| 1 | "대시보드" | inner sidebar |
| 2 | "부서 관리" | inner sidebar |
| 3 | "에이전트 설정" | inner sidebar |
| 4 | "워크스페이스" | inner sidebar |
| 5 | "시스템 설정" | inner sidebar |
| 6 | "모든 내역 보기" | 최근 변경 내역 |

### /jobs (5개)
| 1 | "Dashboard" | inner sidebar |
| 2 | "Jobs" | inner sidebar |
| 3 | "Schedules" | inner sidebar |
| 4 | "Triggers" | inner sidebar |
| 5 | "Settings" | inner sidebar |

### /reports (5개)
| 1 | "Dashboard" | inner sidebar |
| 2 | "Reports" | inner sidebar |
| 3 | "Analytics" | inner sidebar |
| 4 | "Agents" | inner sidebar |
| 5 | "Workspace Settings" | inner sidebar |

### /trading (3개)
| 1 | "Strategy Room" | 탭 |
| 2 | "Portfolio" | 탭 |
| 3 | "Analytics" | 탭 |

### /messenger (3개)
| 1 | "Messages" | 탭 |
| 2 | "Contacts" | 탭 |
| 3 | "Files" | 탭 |

### /agora (6개)
| 1 | "Workspace" | 탭 |
| 2 | "Debates" | 탭 |
| 3 | "Archive" | 탭 |
| 4 | "API Documentation" | footer |
| 5 | "Ethical Standards" | footer |
| 6 | "System Logs" | footer |

### /onboarding (3개)
| 1~3 | Hub 탭 3개 | (Hub로 리다이렉트됨) |

---

## 25페이지 자동 검사 결과

| # | 페이지 | 로드 | clickable | input | aside | fixedL | matSym | slate | cyan | deadLink | API에러 | 판정 |
|---|--------|------|----------|-------|-------|--------|--------|-------|------|----------|--------|------|
| 1 | /hub | ✅ | 34 | 3 | 3 | 0 | 0 | 0 | 0 | 3 | - | ✅ |
| 2 | /dashboard | ✅ | 37 | 1 | 1 | 0 | 0 | 0 | 0 | 1 | - | ✅ |
| 3 | /chat | ✅ | 42 | 3 | 3 | 0 | 0 | 1 | 4 | 0 | - | ⚠️ 테마 |
| 4 | /agents | ❌ | 29 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 403 | ❌ |
| 5 | /departments | ✅ | 55 | 2 | 2 | 0 | 0 | 1 | 0 | 6 | - | ⚠️ |
| 6 | /tiers | ❌ | 29 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 500 | ❌ |
| 7 | /jobs | ✅ | 40 | 2 | 2 | 0 | 0 | 1 | 0 | 5 | - | ✅ |
| 8 | /reports | ✅ | 40 | 2 | 2 | 0 | 0 | 0 | 0 | 5 | - | ✅ |
| 9 | /trading | ✅ | 45 | 2 | 1 | 0 | 0 | 0 | 0 | 3 | - | ⚠️ 무반응 |
| 10 | /nexus | ✅ | 57 | 2 | 2 | 0 | 0 | 22 | 5 | 0 | - | ❌ 테마 |
| 11 | /knowledge | ✅ | 41 | 4 | 2 | 0 | 0 | 0 | 0 | 0 | 500 | ⚠️ |
| 12 | /sns | ✅ | 49 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | - | ⚠️ 무반응 |
| 13 | /messenger | ✅ | 51 | 3 | 3 | 0 | 0 | 0 | 0 | 3 | - | ✅ |
| 14 | /agora | ✅ | 36 | 1 | 1 | 0 | 0 | 0 | 0 | 6 | - | ✅ |
| 15 | /files | ✅ | 39 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | - | ✅ |
| 16 | /costs | ✅ | 35 | 1 | 1 | 0 | 0 | 7 | 0 | 0 | - | ⚠️ 테마 |
| 17 | /performance | ✅ | 37 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 500 | ⚠️ |
| 18 | /activity-log | ✅ | 60 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | - | ✅ |
| 19 | /ops-log | ✅ | 32 | 7 | 1 | 0 | 0 | 0 | 0 | 0 | - | ✅ |
| 20 | /workflows | ✅ | 32 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 500 | ⚠️ |
| 21 | /notifications | ✅ | 35 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | - | ✅ |
| 22 | /classified | ✅ | 34 | 2 | 3 | 0 | 0 | 0 | 0 | 0 | - | ✅ |
| 23 | /settings | ✅ | 39 | 7 | 1 | 0 | 0 | 0 | 0 | 0 | - | ✅ |
| 24 | /sketchvibe | ✅ | 44 | 3 | 1 | 0 | 0 | 1 | 4 | 0 | - | ⚠️ 테마 |
| 25 | /onboarding | ✅→hub | 34 | 3 | 3 | 0 | 0 | 0 | 0 | 3 | 500 | ⚠️ |

**PASS: 11/25, 테마잔재: 4, 무반응버튼: 2, API에러: 5, 빈화면: 2**

---

## 테마 잔재 상세

| 페이지 | slate-950 | slate-900 | cyan-400 | 심각도 |
|--------|-----------|-----------|----------|--------|
| /nexus | 0 | **22** | **5** | ❌ 심각 — React Flow 노드 |
| /costs | 0 | **7** | 0 | ⚠️ — 차트 영역 |
| /chat | **1** | 0 | **4** | ⚠️ — 채팅 내부 |
| /sketchvibe | **1** | 0 | **4** | ⚠️ — 캔버스 내부 |
| /departments | 0 | **1** | 0 | 미미 |
| /jobs | 0 | **1** | 0 | 미미 |

---

## API 에러 잔존

| 페이지 | 에러 | HTTP | 심각도 |
|--------|------|------|--------|
| /agents | /api/admin/agents | 403 | ❌ 빈화면 |
| /tiers | /api/workspace/tier-configs | 500 | ❌ 빈화면 |
| /knowledge | /api/workspace/knowledge/docs | 500 | ⚠️ UI있음 |
| /performance | /api/workspace/performance/summary | 500 | ⚠️ UI있음 |
| /workflows | /api/workspace/workflows/suggestions | 500 | ⚠️ UI있음 |
| /onboarding | /api/onboarding/templates | 500 | ⚠️ hub리다이렉트 |

---

## 새로 발견된 버그

### BUG-V001: /sns 5개 버튼 무반응
- **심각도**: Major
- **페이지**: /sns
- **버튼**: Generate New Content, Approve, Edit Draft, Reschedule, View Stats
- **재현**: 각 버튼 클릭
- **실제**: 아무 반응 없음 (모달/상태변경/에러 없음)
- **원인**: onClick 핸들러 미구현

### BUG-V002: /trading 6개 버튼 무반응
- **심각도**: Major
- **페이지**: /trading
- **버튼**: BUY, SELL, 1H, 4H, 1D, 1W
- **재현**: 각 버튼 클릭
- **실제**: 아무 반응 없음
- **원인**: 이벤트 핸들러 미연결 — 정적 UI만 존재

### BUG-V003: href="#" 빈 링크 35개
- **심각도**: Minor
- **페이지**: /hub(3), /dashboard(1), /departments(6), /jobs(5), /reports(5), /trading(3), /messenger(3), /agora(6), /onboarding(3)
- **패턴**: inner sidebar 탭, footer 링크들이 href="#"으로 아무데도 안 감
- **원인**: 페이지별 inner navigation 미구현

### BUG-V004: /departments "새 부서 추가" 무반응
- **심각도**: Major
- **페이지**: /departments (App)
- **재현**: "새 부서 추가" 버튼 클릭
- **실제**: 아무 반응 없음 (/admin/departments에서는 동작)
- **원인**: App 측 부서 관리 CRUD 미연결

### BUG-V005: /settings "MCP 연동" 탭 미존재
- **심각도**: Minor
- **페이지**: /settings
- **실제**: 8개 탭 중 "MCP 연동" 버튼이 발견되지 않음 (7개만 존재)

### BUG-V006: /settings useBlocker 콘솔 에러
- **심각도**: Minor
- **페이지**: /settings
- **콘솔**: `Error: useBlocker must be used within a data router`
- **재현**: 탭 전환 시 발생

### BUG-V007: CEO에게 "새 부서 추가" 버튼 노출 (RBAC 미적용)
- **심각도**: Major
- **페이지**: /departments (CEO 계정)
- **재현**: CEO 로그인 → /departments 이동
- **실제**: "새 부서 추가" 버튼이 CEO에게도 보임
- **기대**: CEO는 부서 관리 권한 없음 — Admin 전용 버튼 숨겨야 함

### BUG-V008: Admin 부서 CREATE 무반응 (토스트 없음)
- **심각도**: Major
- **페이지**: /admin/departments
- **재현**: 새 부서 생성 → "QA팀" 입력 → 생성 클릭
- **실제**: 에러도 성공도 없음 — 아무 피드백 없이 폼 유지
- **이전**: UUID "system" 에러 토스트 → 이제 토스트 자체가 안 나옴

### BUG-V009: /nexus, /costs, /sketchvibe, /performance 다수 버튼 무반응
- **심각도**: Major
- **페이지**: /nexus(1), /costs(1), /sketchvibe(6), /performance(1)
- **총 9개 버튼**: Save Draft, Set Monthly Budget, Share/시작/종료/에이전트/시스템/Export, View Full Report
- **원인**: 정적 UI — 이벤트 핸들러 미연결

## CRUD 테스트 결과

| 대상 | Create | Read | Update | Delete | 비고 |
|------|--------|------|--------|--------|------|
| 부서 (Admin) | ❌ 무반응 | ✅ 4개 | 미테스트 | 미테스트 | CREATE 후 피드백 없음 |
| 에이전트 (Admin) | ⚠️ 폼열림 (500) | ❌ 빈목록 | - | - | API 500 |
| 직원 (Admin) | ✅ 초대 성공 | ✅ 2명 | - | - | 임시비밀번호 생성 ✅ |
| 티어 | - | ❌ 빈화면(500) | - | - | API 500 |
| 워크플로우 | ✅ 폼열림 | ✅ empty state | - | - | suggestions API 500 |

## CEO 25페이지 검증 결과

| 항목 | 결과 |
|------|------|
| Admin API 13개 차단 | ✅ 전부 403 |
| /nexus 편집 모드 | ✅ CEO에겐 안 보임 |
| Hub 제안카드 | ⚠️ 이전 세션 있으면 안 보임 (새 세션에서만 표시) |
| /departments Admin 버튼 | ❌ "새 부서 추가" CEO에게 노출 (BUG-V007) |

## 로그인 페이지 검증

| 항목 | 이전 | 현재 | 상태 |
|------|------|------|------|
| 빈 폼 제출 유효성 | 없음 | 없음 | ❌ BUG-I002 유지 |
| 틀린 비번 에러 메시지 | "인증이 만료" | **"아이디 또는 비밀번호가 올바르지 않습니다"** | ✅ 수정됨! |
| Copyright | 2024 | **2026** | ✅ 수정됨! |
| href="#" 링크 | 4개 | 4개 (아이디 찾기/비밀번호 찾기/개인정보/이용약관) | ❌ 유지 |
| Hub 에러 메시지 | "INTERNAL_ERROR" | **"CLI 토큰이 등록되지 않았습니다"** | ✅ 수정됨! |

---

### BUG-V006: /settings useBlocker 에러
- **심각도**: Minor
- **페이지**: /settings
- **콘솔**: `Error: useBlocker must be used within a data router`
- **재현**: 탭 전환 시 발생

---

## Admin 패널 16페이지 전수 결과

| # | 페이지 | 로드 | 버튼 | 입력 | deadLink | API 500 | 판정 |
|---|--------|------|------|------|----------|---------|------|
| 1 | /admin | ✅ "Total Companies 4" | 3 | 1 | 0 | budget, costs, agents | ⚠️ |
| 2 | /admin/users | ✅ "User Management" | 10 | 3 | 0 | budget, costs, agents | ⚠️ |
| 3 | /admin/employees | ✅ "2명의 직원" | 16 | 1 | 0 | budget, costs | ✅ |
| 4 | /admin/departments | ✅ "부서 관리" 4부서 | 10 | 0 | 0 | budget, costs, agents | ⚠️ |
| 5 | /admin/agents | ✅ "Agent Management" | 1 | 1 | 0 | budget, costs, agents, soul-templates | ❌ 빈목록 |
| 6 | /admin/tools | ✅ "도구 정의 관리" | 1 | 2 | 0 | budget, costs, tools/catalog, agents | ❌ 빈목록 |
| 7 | /admin/costs | ✅ "비용 및 예산 관리" | 9 | 2 | 0 | budget, costs, by-department, daily | ⚠️ |
| 8 | /admin/credentials | ✅ "CLI 인증 관리" | 4 | 0 | 0 | budget, costs | ✅ |
| 9 | /admin/report-lines | ✅ "보고 라인 설정" | 8 | 5 | 0 | budget, costs | ✅ |
| 10 | /admin/soul-templates | ✅ "Natural Organic Admin" | 11 | 9 | **5** | budget, costs, soul-templates | ⚠️ |
| 11 | /admin/monitoring | ✅ "System Monitoring" | 1 | 0 | 0 | budget, costs | ✅ |
| 12 | /admin/nexus | ❌ EMPTY | 0 | 0 | 0 | budget, costs, org-chart, nexus/layout | ❌ |
| 13 | /admin/onboarding | ✅ "Admin Onboarding" | 2 | 0 | **1** | budget, costs | ✅ |
| 14 | /admin/settings | ✅ "Settings" | 1 | 5 | 0 | budget, costs, api-keys | ✅ |
| 15 | /admin/companies | ✅ "3 companies" | 8 | 1 | 0 | budget, costs | ✅ |
| 16 | /admin/workflows | ✅ "Admin Workflow Manager" | 6 | 0 | 0 | budget, costs, 404 workflows | ⚠️ |

**PASS: 8/16, 빈목록: 2, 빈화면: 1, API에러만: 5**

### Admin 빈 링크 추가

| 페이지 | 링크 텍스트 |
|--------|-----------|
| /admin/soul-templates | Dashboard, Templates Library, User Management, API Logs, Settings (5개) |
| /admin/onboarding | Onboarding Documentation (1개) |

---

## CEO 보안 테스트 결과

| # | 테스트 | 기대 | 실제 | 판정 |
|---|--------|------|------|------|
| 1 | Admin API 13개 차단 | 전부 403 | **13/13 차단** | ✅ |
| 2 | /admin 직접 접근 | 리다이렉트/차단 | ⚠️ Admin 세션 쿠키 살아있어 접근됨 (URL: /admin) | ❌ BUG-S001 잔존 |
| 3 | /nexus "편집 모드" 토글 | CEO에겐 안 보임 | **안 보임** | ✅ |
| 4 | /nexus "Save Draft" | 안 보임 | **안 보임** | ✅ |
| 5 | /nexus "Publish Changes" | 안 보임 | **안 보임** | ✅ |

**Admin API**: CEO 토큰으로 13개 Admin API 전부 403 → ✅ 완벽 차단
**NEXUS 편집**: CEO에겐 편집 모드/Save/Publish 안 보임 → ✅ RBAC 동작
**/admin 세션**: Admin 세션 쿠키가 별도로 유지되어 CEO 브라우저에서도 /admin 접근 가능 → ❌ 기존 BUG-S001 미해결

---

## 이전 버그 대비 수정 상태 요약

| 항목 | 이전 | 현재 | 상태 |
|------|------|------|------|
| dark 클래스 | true | **false** | ✅ 수정 |
| body 배경 | 검정 | **베이지 rgb(250,248,245)** | ✅ 수정 |
| sidebar 배경 | slate-900 | **올리브 #283618** | ✅ 수정 |
| fixed 이중사이드바 | 다수 | **0** | ✅ 수정 |
| Material Symbols | 다수 | **0** | ✅ 수정 |
| App 렌더링 | 1/25 | **23/25** | ✅ 대부분 수정 |
| /agents 403 | 403 | 403 | ❌ 미해결 |
| /tiers | 403→500 | 500 | ❌ 미해결 |
| 부서 CRUD UUID | 500 | Admin에서 미검증 | 확인필요 |
| Admin budget/costs 500 | 전페이지 | 미검증 | 확인필요 |
| © 연도 | 2024 | **2026** | ✅ 수정 |
| theme-color | 없음 | **#faf8f5** | ✅ 수정 |
| Noto Serif KR | 미로드 | **로드됨** | ✅ 수정 |
