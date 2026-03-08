# Epic 7 회고: Cost Management System

**날짜:** 2026-03-08
**참여:** Bob (SM), Alice (PO), Winston (Architect), Charlie (Senior Dev), Dana (QA), Elena (Junior Dev), ubuntu (Project Lead)

---

## Epic 요약

| 항목 | 수치 |
|------|------|
| 완료 스토리 | 5/5 (100%) |
| 스토리 포인트 | 11 SP |
| 총 테스트 수 | 334개 (단위+통합+TEA+UI) |
| 빌드/타입 실패 | 0건 |
| 리그레션 발생 | 0건 |
| 기술 부채 항목 | 2건 (신규) |
| 프로덕션 인시던트 | 0건 |
| 스키마 마이그레이션 | 0건 (companies.settings JSONB 재사용) |

**스토리별 상세:**

| # | 스토리 | SP | 테스트 | 핵심 성과 |
|---|--------|----|----|-----------|
| 7-1 | 3축 비용 집계 API | 2 | 58 | CostAggregationService 5 methods (byAgent/byModel/byDepartment/summary/daily), 5 GET endpoints, Zod 쿼리 검증, trend % 계산 |
| 7-2 | 예산 한도 자동 차단 | 3 | 72 | BudgetGuardService (60s TTL 캐시, 월간+일일 듀얼 체크), GET/PUT /budget API, LLM Router 통합 (call+stream), budget-warning/exceeded WS 이벤트 |
| 7-3 | 비용 대시보드 Admin A6 | 2 | 66 | 4 요약 카드, 3축 정렬 테이블 (에이전트/모델/부서 탭), div 막대 차트 (7d/30d 토글), 예산 설정 패널 (GET/PUT), 날짜 범위 필터 |
| 7-4 | CEO 비용 카드 드릴다운 | 2 | 90 | 대시보드 비용 카드 클릭 -> /costs 이동, 프로바이더 도넛 차트, 에이전트 Top 10 랭킹 (더보기), 일일 추이 막대 차트, 80%/100% 예산 경고 배너, workspace API 2개 추가 |
| 7-5 | 예산 초과 WS 알림 | 2 | 48 | useBudgetAlerts 훅 (WS cost 채널 필터링), BudgetExceededModal, localStorage 중복 방지 (resetDate 기반 만료), Admin 60s 폴링 알림, Layout 마운트 |

---

## 잘 된 점

### 1. 레이어드 빌드 패턴 6연속 성공 (Epic 2 -> 3 -> 4 -> 5 -> 6 -> 7)

Epic 6 회고에서 예측한 대로 API(7-1, 7-2) -> UI(7-3, 7-4) -> WebSocket(7-5) 순서로 레이어드 빌드 패턴을 적용했다. 7-1에서 CostAggregationService를 구현하면 7-3이 그대로 가져다 쓰고, 7-2에서 BudgetGuard 이벤트를 구현하면 7-5가 클라이언트 리스닝만 추가하는 자연스러운 흐름이 이어졌다. 5개 스토리에서 리그레션 0건 달성. 이 패턴은 이제 팀의 확립된 개발 원칙이다.

### 2. CostAggregationService의 기존 코드 재사용 극대화

cost-tracker.ts에 이미 구현되어 있던 `getCostSummary()`, `getModelCostBreakdown()`, `getDepartmentCostBreakdown()` 함수를 적극 재활용했다. 7-1에서 새로 작성한 코드는 주로 기존 함수 래핑 + API 응답 형태 변환이었다. "데이터는 이미 있고, 집계만 하면 된다"는 Epic 6 회고의 교훈이 그대로 적용되었다.

### 3. BudgetGuard의 LLM Router 통합 위치 선정

BudgetGuard를 AgentRunner가 아닌 LLMRouter.call()/stream()에 통합한 것이 핵심 아키텍처 결정이었다. 이렇게 하면 chat, delegation, job, sns 등 모든 LLM 호출 경로를 한 곳에서 차단할 수 있다. 또한 BudgetGuard 실패 시에도 LLM 호출은 진행되도록 try-catch로 안전하게 처리했다 ("예산 체크 실패가 서비스 장애로 이어지면 안 된다").

### 4. Admin/CEO 양쪽 비용 UI 완성 (같은 데이터, 다른 관점)

Admin 비용 대시보드(7-3)는 3축 정렬 테이블 + 예산 설정 + 날짜 범위 필터로 "관리" 관점을 제공하고, CEO 비용 드릴다운(7-4)은 프로바이더 도넛 + 에이전트 Top 10 + 예산 경고 배너로 "의사결정" 관점을 제공한다. 같은 CostAggregationService를 admin route와 workspace route 양쪽에서 재사용하면서, 인증 계층만 다르게 적용하는 구조가 효과적이었다.

### 5. 서버 코드 수정 없는 7-5 완성

7-5(예산 초과 WebSocket 알림)는 서버 코드를 한 줄도 수정하지 않았다. 7-2에서 이미 BudgetGuard의 `emitBudgetWarning()`/`emitBudgetExceeded()` 이벤트와 EventBus -> WS 브리지가 완성되어 있었으므로, 순수하게 클라이언트 리스닝 + UI 컴포넌트만 구현하면 됐다. 이는 7-2의 이벤트 아키텍처 설계가 잘 되었음을 증명한다.

### 6. 스키마 마이그레이션 0건

Epic 7 전체에서 DB 스키마 마이그레이션이 단 한 건도 없었다. 예산 설정은 이미 존재하는 `companies.settings` JSONB 컬럼에 `budgetConfig` 필드를 추가하는 것으로 해결했다 (6-6에서 추가한 컬럼). JSONB의 확장성이 증명된 사례다. Epic 6 회고에서 "스키마 변경은 파급 효과가 크다"는 교훈을 적용, 아예 마이그레이션 없이 에픽을 완료했다.

### 7. CSS/div 차트 패턴 3연속 재활용

Epic 6에서 검증한 차트 라이브러리 없는 CSS 기반 시각화가 Epic 7에서도 그대로 활용되었다:
- **막대 차트** (일일 비용 추이): 7-3 Admin + 7-4 CEO 양쪽에서 동일 패턴
- **도넛 차트** (프로바이더별 비용): 7-4에서 conic-gradient 재사용
- **진행률 바** (예산 사용률): 7-3에서 ProgressBar 컴포넌트 활용

번들 크기 증가 없이 시각적 요구사항 충족이라는 원칙이 유지되었다.

---

## 어려웠던 점

### 1. Admin API(microdollars) vs Workspace API(USD) 단위 불일치

Admin costs API(7-1)는 `totalCostMicro` (microdollars, 1 = $0.000001)를 반환하는데, 기존 workspace dashboard API는 `costUsd` (USD, 소수점 2자리)를 반환한다. 7-3(Admin UI)에서는 microToUsd 변환이 필요하고, 7-4(CEO UI)에서는 이미 USD라서 변환이 불필요하다. 이 차이가 스토리 간 컨텍스트 전환 시 혼란을 줬다. 향후 API 응답 단위를 통일하는 것이 바람직하다.

### 2. budget API 바디의 단위 혼란

7-2에서 PUT /api/admin/budget의 바디가 microdollars인지 USD인지 명확하지 않았다. Zod 스키마에서 `z.number().min(0)`만 정의했고, 단위 주석이 없었다. 7-3에서 Admin UI 구현 시 Dev Notes를 재확인해야 했고, 결국 "원본 값 그대로 저장"이라는 방식이었다. API 문서/주석에 단위를 명시하는 습관이 필요하다.

### 3. Admin 앱에 WebSocket 인프라 부재

7-5에서 Admin 콘솔에도 예산 알림을 보내야 했는데, Admin 앱에는 WebSocket 연결이 없었다. CEO 앱과 동일한 WS 기반 실시간 알림이 불가능하여, 60초 폴링으로 우회 구현했다. 실시간성이 떨어지지만 Admin은 항상 활성 상태가 아니므로 수용 가능한 트레이드오프였다.

### 4. cost_records에 commandId 컬럼 부재 (Epic 6에서 계속)

Epic 6 회고에서 지적한 cost_records -> commands 직접 JOIN 불가 문제가 여전히 해결되지 않았다. 7-1에서 3축 집계를 구현할 때 "특정 명령의 비용" 조회가 불가능했다. 현재는 agentId, model, departmentId 기준 집계만 가능하고, commandId 기준 집계는 지원하지 않는다.

---

## 핵심 교훈

### 1. BudgetGuard 통합 위치가 아키텍처 품질을 결정한다

BudgetGuard를 LLMRouter에 통합한 것은 "가장 좁은 병목점"에 가드를 배치한 것이다. 만약 AgentRunner에 넣었다면 직접 LLM 호출(delegation, batch 등)은 예산 체크를 우회할 수 있었다. "모든 경로의 공통 진입점"을 찾아 그곳에 가드를 배치하는 원칙은 향후 다른 가드(rate limit, security 등)에도 적용 가능하다.

### 2. JSONB 컬럼은 설정 데이터의 이상적인 저장소

companies.settings JSONB에 budgetConfig, dashboardQuickActions 등 다양한 설정을 마이그레이션 없이 추가할 수 있었다. 정형화된 비즈니스 데이터(cost_records, agents 등)는 정규 컬럼으로, 자주 변경되는 설정 데이터는 JSONB로 저장하는 패턴이 확인되었다. 단, JSONB 내부 데이터의 스키마 검증은 애플리케이션 레벨(Zod)에서 해야 한다.

### 3. WS 이벤트 선발사 + 클라이언트 후구독 패턴의 효과

7-2에서 서버 이벤트를 먼저 구현하고, 7-5에서 클라이언트 리스닝을 나중에 추가하는 패턴이 효과적이었다. 서버 이벤트가 "인터페이스 계약"을 먼저 확정하므로, 클라이언트는 그 계약에 맞추기만 하면 된다. 7-5에서 서버 코드 수정 0건이 이를 증명한다.

### 4. Admin과 CEO의 같은 데이터/다른 관점 구조

CostAggregationService를 한 번 구현하고, admin route와 workspace route에서 인증 계층만 다르게 적용하면 Admin/CEO 양쪽 UI를 지원할 수 있다. 이 패턴은 "서비스 레이어는 비즈니스 로직, 라우트 레이어는 인증+변환"이라는 책임 분리 원칙을 따른다.

### 5. localStorage 기반 알림 중복 방지의 효용

7-5에서 `budget_alert_{type}_{level}_{resetDate}` 키 구조로 알림 중복 표시를 방지했다. resetDate가 바뀌면(월/일 갱신) 이전 키가 자동 만료되므로, 새 기간에는 새 알림이 정상 표시된다. 간단하지만 효과적인 상태 관리 패턴이다.

---

## 이전 회고(Epic 6) 액션 아이템 추적

| # | 액션 아이템 | 상태 | Epic 7에서의 결과 |
|---|------------|------|-------------------|
| 1 | 프론트엔드 테스트 전략 문서화 (4개 에픽째) | 미착수 | Epic 7에서도 "유틸/로직 단위 테스트 + TEA" 패턴으로 ~334개 테스트 작성. 패턴은 확립됐으나 공식 문서화는 여전히 미완 |
| 2 | URL search param 탭 관리 표준화 | 적용 | 7-3 Admin 비용 대시보드에서 3축 탭에 적용. 사실상 표준화 완료 |
| 3 | JWT blocklist 최종 결정 (5개 에픽째) | 미착수 | **6개 에픽 연속 미해결.** Epic 9(Multi-tenancy) 전까지 결정 필수 |
| 4 | cost_records commandId 컬럼 검토 | 미착수 | Epic 7에서 3축 집계 구현 시 commandId 부재 확인. 현재 사용 시나리오 없어서 보류했으나 향후 필요 가능 |
| 5 | chief-of-staff.ts 공통 헬퍼 분리 (2개 에픽째) | 미착수 | Epic 7 범위에서 오케스트레이션 코드 수정 없음. 3개 에픽째 미해결 |
| 6 | ToolPool/HandlerRegistry 문서화 (3개 에픽째) | 미착수 | 4개 에픽째. 여전히 필요 |
| 7 | ActivityLogService any 타입 개선 | 미착수 | Epic 7 범위 아님 |

**분석:** 7개 중 1개 적용(URL param 탭), 0개 완료, 6개 미착수. Epic 7이 비용 관리 특화 에픽이라 백엔드 리팩토링 액션에 손대기 어려웠다. JWT blocklist가 6개 에픽째 미해결인 점은 심각하다. 다음 회고에서 또 미착수이면 "의식적 수용" 결정을 강제한다.

---

## 기술 부채

| # | 항목 | 영향도 | 출처 | 해결 시점 |
|---|------|--------|------|-----------|
| 1 | Admin API(microdollars) vs Workspace API(USD) 단위 불일치 | 낮음 | 7-1, 7-4 | 장기적으로 API 응답 단위 통일 검토. 현재는 클라이언트에서 변환 |
| 2 | Admin 앱 WebSocket 인프라 부재 (폴링 우회) | 중 | 7-5 | Admin 앱에 WS 연결 추가 시 폴링 -> WS 전환. Epic 9에서 검토 |
| 3 | cost_records commandId 컬럼 부재 (Epic 6에서 계속) | 중 | Epic 6-7 | 3개 에픽째. 명령별 비용 추적 필요 시 마이그레이션 추가 |
| 4 | JWT blocklist 미해결 (Epic 2부터 계속) | 높음 | Epic 2~7 | **6개 에픽 연속 미해결. Epic 9에서 반드시 해결 또는 의식적 수용 결정** |
| 5 | chief-of-staff.ts 공통 헬퍼 미분리 (Epic 5에서 계속) | 중 | Epic 5~7 | 3개 에픽째. 다음 오케스트레이션 수정 시 처리 |
| 6 | ToolPool/HandlerRegistry 이중 구조 문서화 (Epic 4에서 계속) | 중 | Epic 4~7 | 4개 에픽째. 새 도구 추가 시 혼란 지속 |
| 7 | 프론트엔드 테스트 전략 미문서화 (Epic 4에서 계속) | 낮음 | Epic 4~7 | 실질적 패턴 확립. 공식 문서화만 필요 |

---

## Epic 8 준비 사항

**Epic 8: Quality Gate Enhancement** (5 stories, 11 SP)

Epic 8은 품질 검수 규칙 YAML 파서, 자동 규칙 검사 엔진, 환각 탐지, 프롬프트 인젝션 방어, QA 탭 강화 UI를 구현한다.

**주요 스토리 (sprint-status.yaml 기준):**
1. 8-1: quality-rules-yaml-parser (backlog)
2. 8-2: auto-rule-inspection-engine (backlog)
3. 8-3: hallucination-detection (backlog)
4. 8-4: prompt-injection-defense (backlog)
5. 8-5: qa-tab-enhanced-ui (backlog)

**Epic 7에서 Epic 8으로의 의존성:**

1. **BudgetGuard 패턴** -- try-catch 안전 래핑 + 가드 실패 시 서비스 계속 동작하는 패턴. Quality Gate에서도 "검사 실패 시 응답은 전달하되 경고 표시" 패턴에 적용 가능
2. **LLM Router 통합 위치** -- Budget 가드가 LLMRouter.call()/stream()에 들어간 것처럼, Quality Gate 검사도 LLM 응답 후처리 단계에서 동일 위치에 통합 가능
3. **EventBus cost 채널 패턴** -- Quality Gate 결과도 EventBus 이벤트로 브로드캐스트하면 실시간 QA 대시보드에 활용 가능

**Epic 7에서 검증된 패턴 (Epic 8에도 적용):**
- 레이어드 빌드: 엔진(8-1, 8-2, 8-3, 8-4) -> UI(8-5)
- 가드 패턴: BudgetGuard처럼 "검사 실패가 서비스 장애로 이어지면 안 된다" 원칙
- WS 이벤트: Quality Gate 결과 실시간 브로드캐스트
- CSS 차트: QA 탭 시각화에 동일 패턴 재활용

**필수 준비 작업:**
- [x] LLM Router 구조 이해 (7-2에서 budget 통합 경험)
- [x] EventBus 이벤트 패턴 이해 (7-2, 7-5에서 활용)
- [x] QA 탭 기존 구조 (6-4에서 구현, 확장 대상)
- [ ] Quality Gate YAML 규칙 포맷 정의
- [ ] 환각 탐지 기법 연구 (LLM 응답 검증 전략)
- [ ] 프롬프트 인젝션 방어 패턴 연구

---

## 액션 아이템

### 프로세스 개선

1. **API 응답 단위 표준 문서화**
   - 담당: Architect (Winston)
   - 기한: Epic 8 시작 전
   - 완료 기준: "Admin API는 microdollars, Workspace API는 USD" 규칙을 공식 문서화. 새 API 설계 시 어떤 단위를 사용할지 가이드라인 수립

2. **프론트엔드 테스트 전략 문서화 (5개 에픽째)**
   - 담당: QA (Quinn) + Senior Dev (Charlie)
   - 기한: Epic 8 시작 전 (더 이상 미룰 수 없음)
   - 완료 기준: "유틸/로직 단위 테스트 + TEA 엣지케이스" 패턴을 공식 문서로 정리. 7개 에픽 동안 ~1,500+ 테스트가 이 패턴으로 작성됨

### 기술 부채

1. **JWT blocklist 최종 결정 (6개 에픽째 -- 강제 마감)**
   - 담당: PM (John) + Architect (Winston)
   - 우선도: **최고** (7회 연속 미해결, 더 이상 미룰 수 없음)
   - 완료 기준: Epic 9 첫 스토리 시작 전까지 "구현" 또는 "의식적 수용 + 사유 문서화" 중 하나 결정. **다음 회고에서 또 미착수이면 자동으로 구현으로 확정**

2. **chief-of-staff.ts 공통 헬퍼 분리 (3개 에픽째)**
   - 담당: Developer (Amelia)
   - 우선도: 중
   - 완료 기준: orchestration-helpers.ts로 공통 함수 분리. 다음 오케스트레이션 관련 작업 시 처리

3. **ToolPool/HandlerRegistry 문서화 (4개 에픽째)**
   - 담당: Architect (Winston)
   - 우선도: 중
   - 완료 기준: 새 도구 추가 가이드 + 두 레지스트리의 관계 설명 문서

### 팀 합의

- **레이어드 빌드 패턴 7번째 에픽에서도 유지**: 엔진/서비스 -> UI -> 실시간 연동 순서
- **가드 패턴 표준**: 가드 실패가 서비스 장애로 이어지면 안 됨 (try-catch 안전 래핑)
- **JSONB 설정 저장 표준**: 자주 변경되는 설정은 companies.settings JSONB에 저장 (마이그레이션 최소화)
- **WS 이벤트 선발사 + 클라이언트 후구독**: 서버 이벤트를 먼저 구현, 클라이언트는 나중에 구독
- **API 단위 주석 필수**: Zod 스키마에 단위(microdollars/USD/percent) 주석 추가
- **3개 에픽 이상 미해결 액션 아이템 강제 결정 유지**: JWT blocklist가 6개 에픽째 테스트 케이스
- **CSS/div 차트 우선 원칙 유지**: 차트 라이브러리 도입은 인터랙티브 기능 필요 시에만

---

## 종합 평가

Epic 7은 CORTHEX v2의 P1 두 번째 에픽으로, AI 비용을 3축(에이전트/모델/부서)으로 집계하고, 예산 한도 설정 + 자동 차단이라는 비즈니스 크리티컬 기능을 완성했다. 5개 스토리를 100% 완료하고 334개 테스트로 검증했으며, 리그레션 0건, 프로덕션 인시던트 0건, 스키마 마이그레이션 0건을 달성했다.

**특히 주목할 성과:**

- **3축 비용 집계**: CostAggregationService 5개 메서드로 에이전트별/모델별/부서별 비용을 다각도로 분석 (trend % 계산 포함)
- **예산 자동 차단**: BudgetGuardService가 LLM Router에 통합되어 모든 LLM 호출 경로에서 예산 체크. 월간+일일 듀얼 체크, 60초 TTL 캐시, try-catch 안전 래핑
- **Admin 비용 대시보드 (A6)**: 4 요약 카드 + 3축 정렬 테이블 + 일일 막대 차트 + 예산 설정 패널 -- 관리자가 비용을 통제하는 원스톱 화면
- **CEO 비용 드릴다운**: 대시보드 비용 카드 클릭 -> 프로바이더 도넛 + 에이전트 랭킹 + 일일 추이 -- CEO가 비용 최적화 의사결정하는 화면
- **실시간 예산 알림**: WS cost 채널로 budget-warning(토스트) + budget-exceeded(모달), localStorage 기반 중복 방지, Admin 폴링 알림

레이어드 빌드 패턴이 6개 에픽 연속 성공하면서, 기존 인프라 재사용률이 극도로 높아졌다. 특히 "서버 코드 수정 0건으로 7-5 완성"은 7-2의 이벤트 아키텍처가 잘 설계되었음을 증명한다. companies.settings JSONB 활용으로 스키마 마이그레이션 없이 예산 설정을 저장한 것도 효율적이었다.

P1 MVP Complete(Epic 6~9) 중 두 번째 에픽이 완료되었으며, 다음은 Epic 8(Quality Gate Enhancement)으로, Epic 7에서 확립한 가드 패턴(BudgetGuard)을 Quality Gate에 적용할 수 있다. LLM Router 통합 경험이 직접적으로 활용될 것이다.

---

*Retrospective facilitated by Bob (Scrum Master)*
*Date: 2026-03-08*
