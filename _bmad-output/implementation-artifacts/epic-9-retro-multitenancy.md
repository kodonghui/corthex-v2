# Epic 9 회고 — Multi-tenancy & Admin Console

**날짜:** 2026-03-08
**Epic:** 9 — Multi-tenancy & Admin Console
**상태:** 전체 완료 (8/8 스토리, 100%)

## 참여자

- Bob (Scrum Master) — 진행
- Alice (Product Owner)
- Charlie (Senior Dev)
- Dana (QA Engineer)
- Elena (Junior Dev)
- ubuntu (Project Lead)

## Epic 요약

| 항목 | 값 |
|------|-----|
| 스토리 완료 | 8/8 (100%) |
| 총 SP | 17 SP |
| 테스트 | 905개 (123+151+73+126+122+92+108+110) |
| PRD 매핑 | FR43-FR45, FR47 (멀티테넌시 & 사용자 관리) |
| Architecture 매핑 | Decision #9 (Tenant Isolation Middleware) |
| UX 매핑 | Admin A4, A8, 온보딩 위저드, Admin↔CEO 전환 |
| 신규 스키마 | 2개 (employee_departments, admin_users.companyId 추가) |
| 마이그레이션 | 2개 (0033, 0034) |

### 스토리 목록

| # | 스토리 | SP | 테스트 | 핵심 성과 | 상태 |
|---|--------|-----|--------|----------|------|
| 9-1 | Company CRUD API | 2 | 123 | Super Admin 전용 라우트 분리, cascade soft delete, 관리자 계정 자동 생성 | done |
| 9-2 | Human Employee Management API | 3 | 151 | 7개 엔드포인트, 부서 매핑 테이블, 보안 이슈 발견/수정 | done |
| 9-3 | Employee Command Center Restriction | 2 | 73 | departmentScopeMiddleware, 6개 라우트 스코핑 | done |
| 9-4 | Employee Management UI (Admin A4) | 2 | 126 | 서버 사이드 페이지네이션, 부서 멀티셀렉트, 1회성 비밀번호 표시 | done |
| 9-5 | Company Settings UI (Admin A8) | 2 | 122 | 3섹션(회사정보+API키+기본설정), credential vault 연동 | done |
| 9-6 | Admin↔CEO App Switching | 2 | 92 | JWT 세션 공유 전환, can-switch-admin API, 양방향 전환 | done |
| 9-7 | Onboarding Wizard | 2 | 108 | 5단계 위저드, 기존 API 100% 재사용, 10분 NFR34 준수 | done |
| 9-8 | CEO App Settings Screen | 2 | 110 | 8개 탭 통합, 프로필/알림/표시/사령관실 설정, 테마 관리 | done |

## 잘 된 점

### 1. 기존 API 완벽 재사용 — 서버 변경 최소화
Charlie (Senior Dev): "Epic 9의 가장 큰 승리는 기존 API를 최대한 활용한 점이에요. 9-7 온보딩 위저드는 새 서버 엔드포인트가 **0개** — 회사 CRUD, 템플릿, credential vault, 직원 초대 API를 전부 기존 것으로 연결했습니다."

Alice (Product Owner): "9-5 회사 설정도 서버 변경이 settings JSONB 추가 한 줄뿐이었어요. credential vault API가 이미 완전히 구현되어 있어서 프론트엔드 작업만으로 끝났습니다."

### 2. 보안 이슈 조기 발견 및 수정
Dana (QA Engineer): "9-2에서 CRITICAL 보안 이슈를 코드 리뷰 단계에서 발견했어요. employee API가 role 필터 없이 쿼리하면 admin 계정도 조작 가능한 상태였는데, 모든 쿼리에 `role='user'` 필터를 추가해서 해결했습니다."

Bob (Scrum Master): "이건 Epic 8에서 배운 교훈이 바로 적용된 사례예요. '새 API 추가 시 격리 체크리스트' — 실제로 동작했습니다."

### 3. departmentScopeMiddleware 설계의 우아함
Charlie (Senior Dev): "9-3의 `undefined = 전체 접근` 패턴이 정말 깔끔했어요. CEO/admin은 departmentIds가 undefined라 필터 없이 통과, employee는 배열로 스코핑. 기존 6개 라우트에 미들웨어 한 줄 추가만으로 모든 부서 격리가 완성됐습니다."

### 4. 패턴 확립과 연쇄 재사용
Elena (Junior Dev): "9-1에서 확립한 패턴(페이지네이션, 감사 로그, 비밀번호 생성)이 9-2→9-4→9-7까지 계속 재사용됐어요. generateSecurePassword, 서버 사이드 페이지네이션, 1회성 비밀번호 표시 모달 — 한 번 잘 만들어 놓으니 나머지 스토리가 빨라졌습니다."

### 5. JWT 세션 공유 전환의 매끄러움
Alice (Product Owner): "9-6의 Admin↔CEO 전환이 재로그인 없이 작동하는 게 사용자 경험 면에서 큰 차이에요. localStorage 키 분리 + switch-app API가 깔끔하게 동작합니다."

### 6. 테스트 커버리지 우수
Dana (QA Engineer): "8개 스토리에서 총 905개 테스트. 스토리당 평균 113개. TEA 리스크 기반 테스트까지 포함해서 엣지 케이스 커버리지가 탄탄합니다."

## 어려웠던 점 / 개선 필요

### 1. admin_users 테이블 스키마 미비
Charlie (Senior Dev): "9-1에서 admin_users에 companyId가 없다는 걸 발견하고 스키마 변경이 필요했어요. 초기 설계 때 company_admin과 회사의 연결을 고려하지 않은 거죠. 마이그레이션 0033을 추가하면서 해결했지만, 스키마 설계 때 더 신중했어야 합니다."

### 2. 기존 users.tsx vs 새 employees.tsx 병행
Elena (Junior Dev): "9-4에서 기존 users.tsx를 건드리지 않고 새 employees.tsx를 만드는 전략이었는데, Sidebar 링크만 변경하다 보니 사용자가 기존 /users 경로로 직접 접근하면 레거시 페이지가 보여요. 완전한 마이그레이션 전략이 필요합니다."

### 3. settings JSONB 전체 교체 위험
Bob (Scrum Master): "9-7 온보딩에서 settings.onboardingCompleted를 저장할 때, PATCH API가 settings 전체를 교체하는 방식이라 기존 설정이 날아갈 위험이 있었어요. 클라이언트에서 기존 settings를 먼저 가져와서 merge하는 패턴으로 해결했지만, 서버 측에서 deep merge를 지원하는 게 더 안전합니다."

### 4. 통합 테스트 환경 여전히 미구축
Dana (QA Engineer): "905개 테스트가 전부 unit test예요. 실제 Admin→CEO 전환이 동작하는지, 온보딩에서 템플릿 적용 후 부서가 실제로 생기는지 — 이런 end-to-end 시나리오는 수동 확인에 의존하고 있습니다."

## Epic 8 회고 액션 아이템 추적

| 액션 | 상태 | 비고 |
|------|------|------|
| Hono 타입 제네릭 일관성 (AppEnv) | ✅ 완료 | 9-1에서 새 라우트 생성 시 `Hono<AppEnv>()` 패턴 적용 |
| nightJobs FK 제약 | ⏳ 미완료 | Epic 9 범위 외, 향후 해결 |
| Admin Tools 목록 companyId 필터 정책 | ⏳ 미완료 | Epic 9 범위 외, 정책 결정 필요 |
| DB 테스트 환경 구축 | ❌ 미완료 | 여전히 인프라 스프린트 필요 |
| 프론트엔드 컴포넌트 테스트 | ❌ 미완료 | 여전히 인프라 스프린트 필요 |

Bob (Scrum Master): "Hono 타입 제네릭은 Epic 9에서 새 라우트 파일들이 일관되게 적용했어요. DB 테스트와 프론트엔드 컴포넌트 테스트는 계속 이월 중인데, 기능 개발 우선순위 때문에 밀리고 있습니다."

## 기술 부채

### 신규 (Epic 9에서 발생)

1. **기존 users.tsx 레거시 병행** — /admin/users 경로 접근 시 레거시 페이지 노출. 완전 제거 또는 리다이렉트 필요
2. **settings JSONB 전체 교체 방식** — 서버 측 deep merge 미지원. 클라이언트 merge에 의존
3. **Admin→CEO 전환 시 users 테이블에 CEO 계정 없으면 에러** — 온보딩 위저드에서 자동 생성 안 함, 수동 매핑 필요
4. **password change에 현재 비밀번호 확인 없음** — 9-8 CEO 설정에서 새 비밀번호만 입력받음. 보안 개선 필요

### 이월 (이전 에픽에서 계속)

- StreamEvent/OrchestrateEvent 타입 서버/프론트 중복
- DB 테스트 환경 미구축
- 프론트엔드 컴포넌트 테스트 부재
- react-markdown이 app 전용 → @corthex/ui 미포함
- nightJobs FK DB 레벨 제약 없음

## 액션 아이템

### 프로세스 개선

1. **settings JSONB deep merge 서버 구현**
   - 소유: Dev
   - 기준: PATCH /companies/:id에서 settings를 deep merge 처리
   - 효과: 클라이언트 merge 실수로 인한 설정 손실 방지

2. **레거시 users.tsx 정리**
   - 소유: Dev
   - 기준: /admin/users → /admin/employees 리다이렉트 추가 또는 users.tsx 제거
   - 효과: 사용자 혼동 방지

### 기술 부채

1. **비밀번호 변경 시 현재 비밀번호 확인 추가**
   - 소유: Dev
   - 우선순위: 중간
   - 대상: PATCH /workspace/profile의 password 필드

2. **Admin→CEO 전환 시 CEO 계정 자동 매핑/생성**
   - 소유: Dev
   - 우선순위: 낮음
   - 대상: POST /auth/switch-app에서 users 테이블에 CEO 계정이 없을 때 처리

### 인프라 부채 (별도 관리)

- DB 테스트 환경, 프론트엔드 컴포넌트 테스트, E2E 테스트 — 기능 개발과 분리하여 필요 시 별도 스프린트로 처리

## Epic 10 준비 상태

- **블로커:** 없음
- **의존성:** Epic 5 (오케스트레이션), Epic 4 (도구 시스템) — 이미 완료
- **Epic 10 내용:** Strategy Room & Trading — KIS 증권 API 연동, 포트폴리오 대시보드, CIO+VECTOR 분리, 자율/승인 실행, 실/모의거래 분리
- **핵심 준비사항:**
  - Epic 4의 ToolPool 프레임워크 → Finance 도구 5종 추가 기반 확보
  - Epic 8의 P2 스키마 (nightJobSchedules, files 등) 선제 준비 완료
  - Epic 9의 멀티테넌시 → companyId 기반 투자 데이터 격리 가능
- **진행 가능:** Epic 10 backlog 상태

## 핵심 교훈

1. **기존 API 재사용이 최고의 전략** — 새 엔드포인트를 최소화하고 기존 API를 조합하면 구현 속도와 안정성 모두 확보 가능
2. **보안은 코드 리뷰에서 잡는다** — role 필터 누락 같은 CRITICAL 이슈는 자동 테스트로 잡기 어려움. 코드 리뷰의 보안 체크리스트가 필수
3. **패턴 확립 → 연쇄 재사용** — 첫 스토리(9-1)에서 투자한 패턴(페이지네이션, 감사 로그, 비밀번호 생성)이 나머지 7개 스토리의 생산성을 크게 높임
4. **undefined = 전체 접근 패턴** — middleware에서 역할별 분기를 단순화하는 우아한 접근. 향후 다른 스코핑에도 적용 가능

## 팀 합의

- 새 API 추가 시 보안 체크리스트 (테넌트 격리 + role 필터) 필수 적용 계속 유지
- settings JSONB는 서버 측 deep merge로 개선 (다음 관련 스토리에서)
- 레거시 페이지 병행은 최대 1 에픽까지만 허용 — 이후 정리

## 다음 단계

1. Sprint status 업데이트 (epic-9 → done, epic-9-retrospective → done)
2. Phase 2 에픽 중 우선순위 결정 (Epic 10~18)
3. Epic 10 (Strategy Room & Trading) 시작 준비
