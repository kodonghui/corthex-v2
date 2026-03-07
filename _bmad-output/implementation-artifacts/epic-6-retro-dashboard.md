# Epic 6 회고: Dashboard & Activity Monitoring

**날짜:** 2026-03-07
**참여:** Bob (SM), Alice (PO), Winston (Architect), Charlie (Senior Dev), Dana (QA), Elena (Junior Dev), ubuntu (Project Lead)

---

## Epic 요약

| 항목 | 수치 |
|------|------|
| 완료 스토리 | 6/6 (100%) |
| 스토리 포인트 | 14 SP |
| 총 테스트 수 | ~395개 (단위+통합+TEA+UI) |
| 빌드/타입 실패 | 0건 |
| 리그레션 발생 | 0건 |
| 기술 부채 항목 | 3건 |
| 프로덕션 인시던트 | 0건 |
| 스키마 마이그레이션 | 1건 (0032_company-settings.sql) |

**스토리별 상세:**

| # | 스토리 | SP | 테스트 | 핵심 성과 |
|---|--------|----|----|-----------|
| 6-1 | Dashboard Aggregation API | 2 | 52 | getSummary(4카드), getUsage(프로바이더별 일별), getBudget(선형 외삽). TTL 캐시(30s/5min). cost-tracker.ts 재사용 |
| 6-2 | Operations Dashboard UI | 3 | 58 | 4개 요약 카드, div 기반 스택드 바 차트, 예산 진행 바(3색 전환), 퀵 액션 버튼, 반응형 grid |
| 6-3 | Activity Log 4-Tab API | 2 | 40 | ActivityLogService 4개 쿼리 함수, offset 페이지네이션, 날짜/검색/상태 필터, 테넌트 격리 |
| 6-4 | Activity Log 4-Tab UI | 3 | 99 | 4탭(활동/통신/QA/도구) 테이블, URL 탭 상태, QA 확장 행(5항목 점수), debounced 검색 |
| 6-5 | WebSocket Realtime Dashboard | 2 | 79 | cost WS 채널 추가, useDashboardWs/useActivityWs 훅, 폴링->WS 전환, 지수 백오프 재연결, WsStatusIndicator |
| 6-6 | Quick Actions + Satisfaction | 2 | 67 | 퀵 액션 API(CRUD), 만족도 API(JSONB 집계), conic-gradient 도넛 차트, 프리셋 실행 연동, companies.settings 컬럼 |

---

## 잘 된 점

### 1. 레이어드 빌드 패턴 5연속 성공 (Epic 2 -> 3 -> 4 -> 5 -> 6)

Epic 5 회고에서 예측한 대로 API(6-1, 6-3) -> UI(6-2, 6-4) -> WebSocket(6-5) -> 통합(6-6) 순서로 레이어드 빌드 패턴을 적용했다. 6-1에서 만든 DashboardService를 6-2가 바로 사용하고, 6-3의 ActivityLogService를 6-4가 연결하고, 6-5에서 폴링을 WS로 교체하고, 6-6에서 퀵 액션과 만족도를 추가하는 자연스러운 확장이 이루어졌다. 6개 스토리에서 리그레션 0건 달성.

### 2. 기존 인프라의 효과적 재사용

Epic 5에서 구축한 인프라를 대량으로 재사용했다:
- **cost-tracker.ts**: getCostSummary(), getDepartmentCostBreakdown(), microToUsd() 함수를 대시보드 집계에 직접 활용 (재발명 0건)
- **EventBus + WebSocket 채널**: 기존 5개 채널(command, delegation, tool, agent-status, activity-log)에 cost 채널만 추가하여 실시간 갱신 완성
- **DelegationTracker 이벤트**: 대시보드/통신로그의 실시간 데이터 소스로 활용
- **@corthex/ui 컴포넌트**: Tabs, Badge, Skeleton, EmptyState, Input 등 공유 컴포넌트 적극 활용
- **프리셋 시스템(5-10)**: 퀵 액션에서 프리셋 execute API 직접 호출하여 원클릭 명령 실행 구현

### 3. 외부 라이브러리 없는 차트 구현

차트 라이브러리(Chart.js, Recharts 등) 없이 순수 CSS/div로 모든 시각화를 구현했다:
- **스택드 바 차트**: div 높이 비율 계산으로 프로바이더별 사용량 시각화
- **예산 진행 바**: 퍼센트 기반 width + 3색 전환(green/yellow/red) + 점선 예상 마커
- **도넛 차트**: CSS conic-gradient로 만족도 시각화 (긍정/부정/무응답)

번들 크기 증가 없이 시각적 요구사항을 모두 충족했다.

### 4. 폴링 -> WebSocket 전환으로 실시간성 확보

6-2에서 30초 폴링으로 구현한 대시보드 갱신을 6-5에서 WebSocket 이벤트 기반으로 교체했다. react-query invalidation 패턴을 사용하여, WS 이벤트 수신 시 해당 queryKey만 선택적으로 무효화하는 효율적인 구조를 만들었다. 불필요한 30초 폴링이 제거되어 서버 부하도 감소했다.

### 5. 4탭 통신로그 완성도

통신로그 4탭이 CEO가 AI 조직 내부를 투명하게 관찰하는 창이 되었다:
- **활동 탭**: 에이전트별 명령 실행 기록 (누가 무엇을 했는가)
- **통신 탭**: 위임 체인 기록 (누가 누구에게 위임했는가)
- **QA 탭**: 품질 검수 결과 + 5항목 세부 점수 확장 (품질이 어떤가)
- **도구 탭**: 도구 호출 기록 (어떤 도구를 사용했는가)

각 탭에 필터(날짜/검색/상태), 페이지네이션, 상태 Badge 매핑이 일관되게 적용되었다.

### 6. 만족도 차트 + 퀵 액션의 폐루프 완성

6-6에서 명령 피드백(thumbs up/down, 5-9에서 구현)을 집계하는 만족도 차트와, 프리셋을 원클릭 실행하는 퀵 액션을 추가하면서, "명령 -> 실행 -> 보고서 -> 피드백 -> 만족도 시각화 -> 퀵 액션으로 재실행"이라는 폐루프가 완성되었다.

---

## 어려웠던 점

### 1. 4탭 API의 `any` 타입 사용

ActivityLogService에서 `conditions: any[]`, `PaginatedResult<any>` 등 `any` 타입이 다수 사용되었다. 4개 테이블의 컬럼 타입이 모두 다르고, Drizzle ORM의 동적 where 조건 빌드 패턴에서 타입 추론이 어려웠기 때문이다. 코드 리뷰에서도 지적되었으나 "기능적으로 안전하므로 수용" 판정을 받았다. 향후 리팩토링 시 제네릭 타입으로 개선 가능하다.

### 2. cost_records와 orchestration_tasks 간 직접 연결 부재

통신 탭에서 위임 기록의 비용/토큰 정보를 표시해야 하는데, cost_records에 commandId 컬럼이 없어 직접 JOIN이 불가능했다. orchestration_tasks.metadata에서 토큰 정보를 추출하는 우회 방법을 사용했다. 이는 스키마 설계 시점에 예상하지 못한 조인 패턴이었다.

### 3. 기존 dashboard.tsx 완전 재작성의 부담

6-2에서 기존 v0 대시보드(costs/agents/stats 3개 구 API)를 완전히 새로운 3개 API(summary/usage/budget)로 교체해야 했다. 기존 UI 테스트도 모두 재작성이 필요했고, 기존 코드의 API 호출 패턴을 유지하면서 데이터 소스만 바꾸는 작업이 생각보다 복잡했다.

### 4. companies 테이블 스키마 변경 영향

6-6에서 companies 테이블에 settings JSONB 컬럼을 추가하면서 마이그레이션(0032)이 필요했고, 기존 테스트의 mock에서 companies 테이블 export를 참조하는 부분이 모두 깨졌다. 스키마 변경은 항상 파급 효과가 크다는 것을 재확인했다.

---

## 핵심 교훈

### 1. 집계 API는 기존 서비스 재사용이 핵심

대시보드 집계 API(6-1)는 새로운 비즈니스 로직이 거의 없었다. cost-tracker.ts의 getCostSummary(), getDepartmentCostBreakdown()을 호출하고, commands/agents 테이블의 status별 count만 추가하면 됐다. "데이터는 이미 있고, 집계만 하면 된다"는 패턴이 확인되었다. Epic 7(Cost Management)에서도 동일 패턴을 적용할 수 있다.

### 2. 차트 라이브러리 없이도 충분하다

스택드 바, 진행 바, 도넛 차트 모두 CSS/div로 구현했다. 인터랙티브 차트(줌, 팬, 툴팁 등)가 필요하지 않은 대시보드에서는 외부 라이브러리가 오버킬이다. 번들 크기 제로 증가라는 부수 효과도 얻었다.

### 3. WS 이벤트 기반 invalidation > 폴링

30초 폴링을 WS 이벤트 + react-query invalidation으로 교체한 결과:
- 데이터 반영 지연: 30초 -> 즉시 (<500ms)
- 불필요한 API 호출: 30초마다 3개 -> 이벤트 발생 시에만
- 사용자 경험: "새로고침" 필요 -> 자동 갱신

이 패턴은 Epic 7, 8, 9의 대시보드에도 동일하게 적용 가능하다.

### 4. URL search param으로 탭 상태 관리는 필수

통신로그 4탭의 상태를 `?tab=agents` URL param으로 관리한 것이 효과적이었다. 브라우저 뒤로가기, 북마크, 딥링크가 모두 자연스럽게 동작한다. 향후 모든 탭 기반 UI에서 이 패턴을 표준으로 적용해야 한다.

### 5. 스키마 변경은 마지막에 하는 것이 안전하다

6-6에서 companies.settings 컬럼을 추가했을 때 기존 테스트 mock이 모두 깨졌다. 스키마 변경이 에픽 초반에 발생했다면 후속 스토리 전체에 영향을 줬을 것이다. 에픽 마지막 스토리에서 스키마 변경을 처리한 것이 올바른 순서였다.

---

## 이전 회고(Epic 5) 액션 아이템 추적

| # | 액션 아이템 | 상태 | Epic 6에서의 결과 |
|---|------------|------|-------------------|
| 1 | chief-of-staff.ts 공통 헬퍼 분리 (orchestration-helpers.ts) | 미착수 | Epic 6 범위에서 chief-of-staff.ts를 직접 수정하지 않아 기회가 없었음. 여전히 유효 |
| 2 | LLM JSON 응답 파싱 전략 결정 (parseLLMJson 중앙화) | 미착수 | Epic 8(Quality Gate Enhancement) 시작 전까지 결정 예정. 아직 시간 있음 |
| 3 | 프론트엔드 테스트 전략 확정 (3개 에픽째) | 부분 진행 | Epic 6에서 ~260개 프론트엔드 테스트 작성(dashboard 58 + activity-log 99 + WS 33 + satisfaction 67). 실질적 전략은 "유틸/로직 단위 테스트 + TEA 엣지케이스"로 수렴 중. 공식 문서화는 아직 |
| 4 | JWT blocklist 최종 결정 (5개 에픽째) | 미착수 | 5개 에픽 연속 미해결. Epic 9(Multi-tenancy)에서 반드시 해결 필요 |
| 5 | ToolPool/HandlerRegistry 관계 문서화 (3개 에픽째) | 미착수 | Epic 6 범위 아님. 여전히 필요 |
| 6 | 도메인 도구 API 스냅샷 테스트 (3개 에픽째) | 미착수 | Epic 6 범위 아님. 여전히 필요 |

**분석:** 6개 중 0개 완료, 1개 부분 진행, 5개 미착수. Epic 6이 대시보드/UI 중심이라 백엔드 리팩토링 액션에 손대기 어려웠다. 하지만 JWT blocklist가 5개 에픽째 미해결인 점은 심각하다. Epic 9(Multi-tenancy)가 인증/세션 관리를 다루므로 그때 반드시 결정해야 한다.

---

## 기술 부채

| # | 항목 | 영향도 | 출처 | 해결 시점 |
|---|------|--------|------|-----------|
| 1 | ActivityLogService의 `any` 타입 다수 사용 | 낮음 | 6-3 | 제네릭 타입으로 리팩토링 가능. 기능에는 무관 |
| 2 | cost_records와 orchestration_tasks 간 직접 JOIN 불가 | 중 | 6-3 | cost_records에 commandId 컬럼 추가 또는 현행 metadata 추출 방식 유지. Epic 7에서 비용 시스템 확장 시 검토 |
| 3 | chief-of-staff.ts 공통 헬퍼 미분리 (Epic 5에서 계속) | 중 | Epic 5 | 2개 에픽째 미해결. 다음 오케스트레이션 수정 시 반드시 처리 |
| 4 | JWT blocklist 미해결 (Epic 2부터 계속) | 높음 | Epic 2~6 | 5개 에픽 연속 미해결. Epic 9에서 해결 또는 의식적 수용 결정 **필수** |
| 5 | ToolPool/HandlerRegistry 이중 구조 (Epic 4에서 계속) | 중 | Epic 4 | 3개 에픽째. 도구 추가 시 혼란 지속 |
| 6 | 프론트엔드 테스트 전략 미확정 (Epic 4에서 계속) | 낮음 | Epic 4~6 | 실질적으로 "유틸/로직 단위 테스트" 패턴이 정착 중. 공식 문서화만 필요 |

---

## Epic 7 준비 사항

**Epic 7: Cost Management System** (5 stories, 11 SP)

Epic 7은 에이전트별/모델별/부서별 3축 비용 추적, 일일/월 예산 한도 설정, 한도 초과 시 자동 차단을 구현한다.

**주요 스토리 (sprint-status.yaml 기준):**
1. 7-1: 3축 비용 집계 API (in-progress)
2. 7-2: 예산 한도 + 자동 차단 (in-progress)
3. 7-3: 비용 대시보드 UI (관리자 A6) (backlog)
4. 7-4: CEO 앱 비용 카드 드릴다운 (backlog)
5. 7-5: 예산 초과 WebSocket 알림 (backlog)

**Epic 6에서 Epic 7으로의 의존성:**

1. **DashboardService.getBudget()** -- 기본값 $500/month, `isDefaultBudget` 플래그. Epic 7에서 실제 예산 설정 CRUD 구현 시 이 기본값을 교체해야 함
2. **cost WS 채널 (6-5에서 추가)** -- cost_records 기록 시 eventBus.emit('cost'). Epic 7의 예산 초과 알림에 직접 활용 가능
3. **companies.settings JSONB (6-6에서 추가)** -- 퀵 액션 설정 저장. Epic 7에서 monthlyBudget, dailyBudget 설정도 이 컬럼에 저장 가능
4. **비용 카드 (6-2)** -- 대시보드 비용 카드에서 todayUsd, budgetUsagePercent 표시 중. Epic 7에서 실제 예산 한도 연동 시 업데이트 필요
5. **만족도 차트 패턴 (6-6)** -- CSS conic-gradient 도넛 차트. Epic 7 비용 대시보드의 부서별 도넛 차트에 동일 패턴 적용 가능

**Epic 7 현재 상태:**
- 7-1 (3축 비용 집계 API): in-progress
- 7-2 (예산 한도 + 자동 차단): in-progress
- 나머지: backlog

**필수 준비 작업:**

- [x] cost_records 테이블 + CostTracker 서비스 완성 (Epic 3 완료)
- [x] cost WS 채널 구현 (6-5 완료)
- [x] companies.settings JSONB 컬럼 (6-6 완료)
- [x] 대시보드 비용 카드 + 예산 바 (6-1, 6-2 완료)
- [ ] cost_records에 commandId 컬럼 추가 검토 (기술 부채 #2)
- [ ] models.yaml 가격표 최신화 확인

**Epic 6에서 검증된 패턴 (Epic 7에도 적용):**
- 레이어드 빌드: API(7-1, 7-2) -> UI(7-3, 7-4) -> WebSocket(7-5)
- 기존 서비스 재사용: CostTracker, cost-tracker.ts 함수들
- CSS 차트: 도넛 차트, 막대 차트 패턴 재활용
- companies.settings에 설정값 저장 (마이그레이션 없이 확장)

---

## 액션 아이템

### 프로세스 개선

1. **프론트엔드 테스트 전략 문서화 (4개 에픽째)**
   - 담당: QA (Quinn) + Senior Dev (Charlie)
   - 기한: Epic 7 UI 스토리(7-3) 시작 전
   - 완료 기준: "유틸/로직 단위 테스트 + TEA 엣지케이스" 패턴을 공식 문서로 정리. 컴포넌트 렌더링 테스트 범위 결정
   - 참고: Epic 6에서 ~260개 프론트엔드 테스트가 이 패턴으로 작성되었으므로 실질적으로 검증됨

2. **URL search param 탭 관리 표준화**
   - 담당: Developer (Amelia)
   - 기한: Epic 7
   - 완료 기준: 탭 기반 UI에서 `useSearchParams` + `?tab=` 패턴을 표준으로 문서화. 기존 ops-log.tsx, activity-log.tsx가 이미 적용 중

### 기술 부채

1. **JWT blocklist 최종 결정 (5개 에픽째 -- 마감)**
   - 담당: PM (John) + Architect (Winston)
   - 우선도: **최고** (더 이상 미룰 수 없음)
   - 완료 기준: Epic 9(Multi-tenancy) 첫 스토리 시작 전까지 "구현" 또는 "의식적 수용" 결정. 다음 회고에서 또 미착수이면 강제 구현

2. **cost_records commandId 컬럼 검토**
   - 담당: Architect (Winston)
   - 우선도: 중
   - 완료 기준: Epic 7 시작 전, cost_records -> commands 직접 JOIN 필요 여부 확정. 필요하면 마이그레이션 포함

3. **chief-of-staff.ts 공통 헬퍼 분리 (2개 에픽째)**
   - 담당: Developer (Amelia)
   - 우선도: 중
   - 완료 기준: toAgentConfig, createOrchTask, completeOrchTask, makeContext, parseLLMJson을 orchestration-helpers.ts로 분리. 다음 오케스트레이션 관련 스토리에서 처리

4. **ToolPool/HandlerRegistry 문서화 (3개 에픽째)**
   - 담당: Architect (Winston)
   - 우선도: 중
   - 완료 기준: 새 도구 추가 가이드 작성

5. **ActivityLogService any 타입 개선**
   - 담당: Developer (Amelia)
   - 우선도: 낮음
   - 완료 기준: 제네릭 PaginatedResult<T> 적용. 기능에는 무관하므로 여유 있을 때 처리

### 팀 합의

- **레이어드 빌드 패턴 6번째 에픽에서도 유지**: API -> UI -> WebSocket 순서
- **기존 서비스 재사용 최우선**: 새 집계 로직 작성 전 기존 함수 확인 필수
- **차트는 CSS/div 우선**: 인터랙티브 기능 필요 시에만 라이브러리 도입 검토
- **WS 이벤트 + react-query invalidation 패턴 표준화**: 새 대시보드/모니터링 화면에 폴링 대신 WS 사용
- **URL param 탭 관리 필수**: 탭 기반 UI는 반드시 `?tab=` param 사용
- **스키마 변경은 에픽 후반에**: 기존 테스트 mock 파급 효과 최소화
- **3개 에픽 이상 미해결 액션 아이템 강제 결정**: JWT blocklist가 테스트 케이스

---

## 종합 평가

Epic 6은 CORTHEX v2의 P1 첫 에픽으로, P0(Epic 0~5)에서 구축한 오케스트레이션/도구/LLM 인프라의 데이터를 시각화하여 CEO에게 제공하는 "관찰 계층"을 완성했다. 6개 스토리를 100% 완료하고 ~395개 테스트로 검증했으며, 리그레션 0건, 프로덕션 인시던트 0건을 달성했다.

**특히 주목할 성과:**

- **작전현황 대시보드**: 4개 요약 카드(작업/비용/에이전트/연동) + 프로바이더별 스택드 바 차트 + 3색 예산 바 + 도넛 만족도 차트 + 퀵 액션 -- 한 화면에서 조직 전체 현황 파악
- **통신로그 4탭**: 활동/통신/QA/도구 탭으로 AI 조직 내부의 모든 기록을 투명하게 조회 (필터 + 검색 + 페이지네이션)
- **WebSocket 실시간 전환**: 30초 폴링 -> 이벤트 기반 즉시 갱신 (cost 채널 추가, 지수 백오프 재연결, WsStatusIndicator)
- **폐루프 완성**: 명령 -> 실행 -> 보고서 -> 피드백 -> 만족도 시각화 -> 퀵 액션 재실행
- **기존 인프라 재사용률**: cost-tracker.ts, EventBus, WebSocket 채널, 프리셋 시스템, @corthex/ui 컴포넌트 등 Epic 3~5의 산출물을 광범위하게 재활용

레이어드 빌드 패턴이 5개 에픽 연속 성공하면서, "API -> UI -> WebSocket -> 통합"이라는 빌드 순서가 팀의 확립된 개발 원칙으로 자리잡았다. P1 MVP Complete(Epic 6~9) 중 첫 에픽이 완료되었으며, 다음은 Epic 7(Cost Management System)으로, Epic 6에서 구축한 비용 카드, cost WS 채널, companies.settings 인프라를 직접 확장하게 된다.

Epic 7은 cost-tracker.ts의 기존 함수들을 3축(에이전트/모델/부서) 집계로 확장하고, 예산 한도 + 자동 차단이라는 새로운 비즈니스 로직을 추가하는 에픽이다. Epic 6에서 검증된 차트 패턴(도넛, 막대)과 WS 실시간 갱신 패턴을 그대로 적용할 수 있어 순조로운 진행이 기대된다.

---

*Retrospective facilitated by Bob (Scrum Master)*
*Date: 2026-03-07*
