# Gemini 브라우저 QA 버그 리포트
> 검사일: 2026-03-16
> 검사자: Gemini (Antigravity 브라우저)
> 사이트: https://corthex-hq.com
> 디자인 기준: Natural Organic (올리브그린 #5a7247, 베이지 #faf8f5)

## 요약
- Admin: 6/41 페이지 검사 완료, 버그 6개 발견
- CEO: 대기 중
- 총: 확인 중...


## Admin 사이드바 메뉴 목록
1. COMMAND: Dashboard, 허브, NEXUS, 채팅
2. ORGANIZATION: 에이전트, 부서, 작업, 티어, 보고서
3. TOOLS: 워크플로우, 스케치바이브, SNS, 전략실, 메신저, 라이브러리, AGORA
4. SYSTEM: 파일, 비용, 전력분석, 통신로그, 작전일지, 기밀문서, 설정

## CEO 사이드바 메뉴 목록
(조사 중...)

## 페이지별 상태 (Admin)
| # | 경로 | 레퍼런스 일치 | 기능 정상 | 판정 |
|---|------|-------------|---------|------|
| 1 | /hub | ❌ (다크 사이드바/Cyan 포인트) | ❌ (채팅 전송불가) | 버그 |
| 2 | /chat | ❌ (Cyan 색상/다크 사이드바) | ❌ (채팅 연결오류) | 버그 |
| 3 | /dashboard | ❌ (Cyan 색상 혼용) | ⚠️ (기능 부족) | 버그 |
| 4 | /agents | ❌ (Cyan 엑센트/다크 사이드바) | ❌ (403 권한오류) | 버그 |
| 5 | /departments | ❌ (Cyan 엑센트) | ❌ (403 권한오류) | 버그 |
| 6 | /tiers | ❌ (Cyan 엑센트) | ❌ (403 권한오류) | 버그 |
| 7 | /jobs | ❌ (Cyan 엑센트) | ❌ (403 권한오류/데이터없음) | 버그 |
| 8 | /reports | ❌ (Cyan 엑센트) | ❌ (403 권한오류/데이터없음) | 버그 |
| 9 | / trading | ❌ (Cyan 엑센트) | ❌ (API 실패) | 버그 |
| 10 | /nexus | ❌ (전체 다크모드 위반) | ⚠️ (캔버스 로드 안됨) | 버그 |
| 11 | /knowledge | ❌ (일부만 Olive/대부분 Cyan) | ❌ (API 에러) | 버그 |
| 12 | /sns | ❌ (Cyan 엑센트/다크 사이드바) | ❌ (데이터없음) | 버그 |
| 13 | /messenger | ❌ (Cyan 엑센트/다크 사이드바) | ❌ (데이터없음) | 버그 |
| 14 | /agora | ❌ (Cyan 엑센트/다크 사이드바) | ❌ (데이터없음) | 버그 |
| 15 | /files | ❌ (Cyan 검색창 포커스) | ❌ (데이터없음) | 버그 |
| 16 | /costs | ❌ (다크 사이드바) | ❌ (데이터없음) | 버그 |
| 17 | /performance | ❌ (Cyan 검색창 포커스) | ⚠️ (데이터없음) | 버그 |
| 18 | /activity-log | ❌ (Cyan 검색창 포커스) | ⚠️ (데이터없음) | 버그 |
| 19 | /ops-log | ❌ (Cyan 검색창/전체 다크요소) | ⚠️ (데이터없음) | 버그 |
| 20 | /workflows | ❌ (Cyan 활성메뉴/다크 사이드바) | ⚠️ (데이터없음) | 버그 |
| 21 | /notifications | ❌ (Cyan 검색창 포커스) | ⚠️ (데이터없음) | 버그 |
| 22 | /classified | ❌ (Cyan 검색창 포커스) | ⚠️ (데이터없음) | 버그 |
| 23 | /settings | ❌ (Cyan 검색창 포커스) | ⚠️ (데이터없음) | 버그 |
| 24 | /sketchvibe | ❌ (Cyan 검색창/주황색 버튼) | ⚠️ (정상 로드) | 버그 |
| 25 | /onboarding | ❌ (Cyan 엑센트/다크 사이드바) | ❌ (/hub로 강제이동) | 버그 |
| 26 | /admin/dashboard | ❌ (Indigo 사이드바) | ⚠️ (정상 로드) | 버그 |
| 27 | /admin/users | ❌ (Indigo 사이드바) | ⚠️ (정상 로드) | 버그 |
| 28 | /admin/employees | ❌ (Indigo 사이드바) | ⚠️ (정상 로드) | 버그 |
| 29 | /admin/credentials | ❌ (Indigo 사이드바) | ✅ (키 노출 없음) | 버그 |
| 30 | /admin/tools | ❌ (Indigo 사이드바) | ⚠️ (정상 로드) | 버그 |
| 31 | /admin/costs | ❌ (Indigo 사이드바) | ⚠️ (정상 로드) | 버그 |
| 32 | /admin/report-lines | ❌ (Indigo 사이드바) | ⚠️ (정상 로드) | 버그 |
| 33 | /admin/soul-templates | ❌ (Indigo 사이드바) | ⚠️ (정상 로드) | 버그 |
| 34 | /admin/nexus | ❌ (전체 Indigo 다크/화이트 혼용) | ⚠️ (정상 로드) | 버그 |
| 35 | /admin/onboarding | ❌ (Indigo 사이드바) | ⚠️ (정상 로드) | 버그 |
| 36 | /admin/monitoring | ❌ (Indigo 사이드바) | ⚠️ (정상 로드) | 버그 |
| 37 | /admin/settings | ❌ (Indigo 사이드바/Orange 버튼) | ⚠️ (정상 로드) | 버그 |
| 38 | /admin/companies | ❌ (Indigo 사이드바/Orange 버튼) | ⚠️ (정상 로드) | 버그 |
| 39 | /admin/workflows | ❌ (Indigo 사이드바) | ⚠️ (정상 로드) | 버그 |
| 40 | CEO Security Test | N/A | ✅ (접근 차단됨) | **안전** |

## 버그 목록

### BUG-G000b: 관리자 전역 사이드바 테마 위반 (Indigo)
- **심각도**: Major
- **계정**: Admin
- **페이지**: /admin 하위 모든 페이지
- **증상**: App 공간(`/hub` 등)과 달리 Admin 공간에서는 관리자 전용 사이드바가 렌더링되나, 이 사이드바 시스템 전체가 **레거시 Indigo 테마**(`bg-indigo-50`, `text-indigo-700`)를 아직도 사용하고 있습니다. 
  - Natural Organic 테마의 **Olive Green(`bg-[#5a7247]/10`, `text-[#5a7247]`)**으로 전면 교체가 필요합니다.
  - 최하단 'Switch to CEO App' 좌측 하단 버튼도 Indigo 색상입니다.

### BUG-G000: 전역 디자인 테마 규칙 위반 (Critical)
- **심각도**: Critical
- **계정**: Admin/CEO 공통 예상
- **페이지**: 거의 모든 페이지
- **증상**: `Natural Organic` 테마의 핵심인 '베이지(#faf8f5) 메인 배경 + 올리브그린(#5a7247) 포인트 색상' 규칙이 지켜지지 않음.
  - 전역 사이드바가 어두운 Navy/Slate 톤으로 고정되어 있음.
  - 거의 모든 텍스트 라우팅 활성 배경, 텍스트 포커스 링, 버튼 인디케이터가 이전 버전 색상인 `Cyan(#22d3ee)`으로 표시됨.
  - 특히 `/nexus` 페이지는 전체 배경 자체가 매우 어두운 색상으로 렌더링되어 라이트 모드 기준을 완전히 위반함.
  - 유일하게 `/knowledge` 내부의 일부 버튼만 올리브그린이 적용되어 있는 등 테마 일관성이 파괴된 상태.

### BUG-G001: `/hub` 레이아웃 및 디자인 테마 위반
- **심각도**: Major
- **계정**: Admin
- **페이지**: /hub
- **레퍼런스**: `hub_command_center_variant_1/screen.png`
- **레퍼런스와 차이점**: 
  - 기준 디자인(Natural Organic)은 전체적으로 밝은 베이지(#faf8f5) 배경과 올리브그린(#5a7247) 포인트를 써야 함.
  - 현재 사이드바(좌측) 및 상단 헤더가 전체 다크 네이비(slate-900) 색상임.
  - 활성화된 메뉴("허브"), 아이콘, 텍스트 입력창 포커스 링(ring) 색상이 모두 **Cyan(#22d3ee)** 계열로 렌더링됨.
- **기능 문제**: 채팅 전송(Reconnecting 상태 지연 작동 안 함)
- **증상**: 우측 상단 "Reconnecting..." 상태 고정. 하단 텍스트 에어리어 타이핑 후 전송 시 반응 없음.
- **콘솔 에러**: 401 Unauthorized (`/api/auth/login`)

### BUG-G002: `/chat` 레이아웃 색상 위반 및 기능 불가
- **심각도**: Major
- **계정**: Admin
- **페이지**: /chat
- **레퍼런스**: `agent_chat_variant_2/screen.png`
- **레퍼런스와 차이점**: 베이지/올리브그린 기반이어야 하나, 좌측 내비게이션 및 채팅 입력바가 다크 톤(Dark Slate)이며 활성 링크 및 전송 버튼 등이 Cyan 색상임.
- **기능 문제**: 에이전트 채팅 불가
- **증상**: "연결이 끊어졌습니다. 재연결 중..." 배너 노출됨. 입력 불가능.

### BUG-G003: `/dashboard` (Home) Cyan 색상 잔재
- **심각도**: Minor
- **계정**: Admin
- **페이지**: /dashboard
- **레퍼런스**: `home_dashboard/screen.png`
- **레퍼런스와 차이점**: 메인 배경은 베이지 테마를 따르고 있으나, 작은 UI 요소 및 검색창 포커스 시 Cyan 포커스 링 발생. 올리브그린(#5a7247)으로 교체해야 함. 
- **기능 문제**: 메인 차트 및 7D/30D 필터 부재 (현재 CEO 대시보드 v2 형태로 간소화 됨, 레퍼런스와 레이아웃 상이)

### BUG-G004: `/agents` 등 리스트 페이지 403 API Error (치명적)
- **심각도**: Critical
- **계정**: Admin
- **페이지**: /agents, /departments, /tiers
- **레퍼런스**: 각각 `agents/screen.png`, `departments/screen.png`, `tiers/screen.png`
- **레퍼런스와 차이점**: (공통) 좌측 메인 사이드바가 어두운 배경이며 링크 및 아이콘이 모두 Cyan 색상으로 렌더링되고 있음. (Natural Organic의 베이지+올리브그린 규칙 위배)
- **기능 문제**: Admin임에도 데이터 조회 거부 (권한 없음)
- **증상**: 에이전트 메뉴 진입 시 "에이전트 목록을 불러올 수 없습니다" 등의 데이터 페칭 실패 UI가 렌더링 됨.
- **콘솔 에러**: 
  - `GET https://corthex-hq.com/api/admin/agents?isActive=true 403 (Forbidden)`
  - `GET https://corthex-hq.com/api/admin/departments 403 (Forbidden)`

