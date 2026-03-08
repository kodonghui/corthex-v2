# Story 17.6: 전력분석 UI + Soul Gym 제안

Status: ready-for-dev

## Story

As a CEO/Admin,
I want 전력분석 페이지에서 에이전트별 성능 지표를 확인하고, Soul Gym 개선 제안을 검토하며, Soul을 직접 업데이트할 수 있기를,
so that AI 에이전트의 성능을 데이터 기반으로 분석하고 점진적으로 개선할 수 있다.

## Acceptance Criteria

1. **전력분석 페이지 등록**: `/performance` 경로에 풀 페이지 UI 구현
   - App.tsx에 lazy import + Route 추가
   - Sidebar 운영 그룹에 "전력분석" 항목 추가 (아이콘: 💪, 경로: /performance)
   - 기밀문서 아래, 정보국 위에 위치

2. **3-섹션 레이아웃**: 상단 요약 카드 + 중앙 에이전트 테이블 + 하단 Soul Gym 패널
   - 상단: 요약 통계 카드 4개 (총 에이전트, 평균 성공률, 총 비용, 평균 응답시간)
   - 중앙: 에이전트 성능 테이블 (정렬/필터 지원)
   - 하단: Soul Gym 개선 제안 카드 목록
   - 반응형: md 미만에서 카드 1열 배치

3. **요약 통계 카드 (상단)**:
   - `GET /workspace/performance/summary` 호출
   - 4개 카드: 총 에이전트 수, 평균 성공률(%), 이번 달 총 비용($), 평균 응답 시간(ms)
   - 각 카드에 전월 대비 증감 표시 (↑/↓ + 색상)
   - 30초 폴링으로 자동 갱신

4. **에이전트 성능 테이블 (중앙)**:
   - `GET /workspace/performance/agents` 호출 (페이지네이션 + 필터)
   - 테이블 컬럼: 에이전트명, 부서, 역할, 호출 수, 성공률(%), 평균 비용($), 평균 시간(ms), Soul Gym 상태
   - 정렬: 모든 컬럼 오름차순/내림차순 토글
   - 필터: 부서별, 역할별(Manager/Specialist/Worker), 성능 수준(상/중/하)
   - 20행 페이지네이션
   - 행 클릭 → 에이전트 상세 성능 모달

5. **에이전트 상세 성능 모달**:
   - `GET /workspace/performance/agents/:id` 호출
   - 성능 추이 차트 (최근 30일, 일별 성공률 + 비용 라인 차트)
   - 최근 작업 목록 (최근 10건: 명령, 상태, 비용, 시간)
   - 품질 점수 분포 (bar chart)
   - Soul 정보 표시: 현재 시스템 프롬프트 요약, 허용 도구 수, 모델 정보

6. **Soul Gym 개선 제안 패널 (하단)**:
   - `GET /workspace/performance/soul-gym` 호출
   - 카드 목록: 에이전트별 개선 제안
   - 각 카드: 에이전트명, 현재 성공률, 제안 내용(시스템 프롬프트 개선/도구 추가/모델 변경), 신뢰도(%), 예상 개선률(%), 필요 토큰 추정
   - "적용" 버튼 → 확인 다이얼로그 → `POST /workspace/performance/soul-gym/:id/apply` → Soul 업데이트
   - "무시" 버튼 → 제안 dismiss
   - 제안 없을 때: EmptyState "모든 에이전트가 최적 상태입니다"

7. **성능 수준 뱃지**:
   - 상위(≥80% 성공률): 초록 "우수"
   - 중위(50~79%): 주황 "보통"
   - 하위(<50%): 빨강 "개선 필요"

8. **빈 상태**: EmptyState — "에이전트 성능 데이터가 없습니다" + "사령관실에서 명령을 실행해보세요" CTA

## Tasks / Subtasks

- [ ] Task 1: 페이지 등록 + 라우팅 (AC: #1)
  - [ ] 1.1 `packages/app/src/pages/performance.tsx` 생성 (PerformancePage export)
  - [ ] 1.2 `App.tsx`에 lazy import + Route path="performance" 추가
  - [ ] 1.3 `sidebar.tsx` 운영 그룹에 { to: '/performance', label: '전력분석', icon: '💪' } 추가 (기밀문서 아래)

- [ ] Task 2: 요약 통계 카드 (AC: #3)
  - [ ] 2.1 SummaryCards 컴포넌트: 4개 카드 (에이전트 수, 성공률, 비용, 응답시간)
  - [ ] 2.2 전월 대비 증감 표시 (양수=초록↑, 음수=빨강↓)
  - [ ] 2.3 30초 폴링 (refetchInterval: 30000)

- [ ] Task 3: 에이전트 성능 테이블 (AC: #4, #7)
  - [ ] 3.1 AgentPerformanceTable 컴포넌트: 8컬럼 테이블
  - [ ] 3.2 정렬 헤더 (sortBy, sortOrder 상태 관리)
  - [ ] 3.3 필터 바: 부서, 역할, 성능 수준
  - [ ] 3.4 PerformanceBadge 컴포넌트 (3색 성능 뱃지)
  - [ ] 3.5 20행 페이지네이션

- [ ] Task 4: 에이전트 상세 모달 (AC: #5)
  - [ ] 4.1 AgentDetailModal 컴포넌트
  - [ ] 4.2 성능 추이 차트 (Recharts LineChart: 성공률 + 비용)
  - [ ] 4.3 최근 작업 목록 테이블 (10건)
  - [ ] 4.4 품질 점수 분포 BarChart
  - [ ] 4.5 Soul 정보 카드

- [ ] Task 5: Soul Gym 개선 제안 (AC: #6)
  - [ ] 5.1 SoulGymPanel 컴포넌트: 제안 카드 목록
  - [ ] 5.2 SuggestionCard: 에이전트명, 제안 내용, 신뢰도, 예상 개선률
  - [ ] 5.3 "적용" 버튼 → ConfirmDialog → POST apply → invalidateQueries
  - [ ] 5.4 "무시" 버튼 → dismiss 처리
  - [ ] 5.5 EmptyState (제안 없을 때)

- [ ] Task 6: 빈 상태 + 반응형 (AC: #8, #2)
  - [ ] 6.1 EmptyState 컴포넌트 적용
  - [ ] 6.2 md 미만 반응형: 카드 1열, 테이블 가로 스크롤

## Dev Notes

### 핵심 패턴 참조 (기존 코드 — 반드시 재사용)

**dashboard.tsx 패턴** (`packages/app/src/pages/dashboard.tsx`):
- 요약 카드 4개 + 차트 패턴 동일
- useQuery + refetchInterval 폴링 패턴

**ops-log.tsx / classified.tsx 패턴**:
- 테이블 + 필터 + 페이지네이션 패턴 동일
- useDebounce, 필터 칩, 정렬 — 동일 패턴 사용
- Modal 패턴 재사용

**Recharts 차트** (이미 프로젝트에 설치됨):
- LineChart, BarChart 컴포넌트 사용
- ResponsiveContainer로 감싸기
- dashboard.tsx에서 사용 패턴 참조

**UI 컴포넌트** (`@corthex/ui`):
- Badge, Input, SkeletonTable, EmptyState, Modal, ConfirmDialog, toast — 기존 패턴 동일

**API 클라이언트** (`packages/app/src/lib/api.ts`):
- api.get, api.post — 기존 패턴 동일

### API 엔드포인트 (Story 17-5에서 구현됨)

**중요: 17-5 API가 아직 미구현 상태일 수 있음. 아래 API 스펙을 기반으로 구현하되, 실제 API 응답 구조에 맞춰 조정할 것.**

```
GET    /api/workspace/performance/summary         — 요약 통계
GET    /api/workspace/performance/agents           — 에이전트 성능 목록 (page, limit, departmentId, role, level, sortBy, sortOrder)
GET    /api/workspace/performance/agents/:id       — 에이전트 상세 성능 (차트 데이터 포함)
GET    /api/workspace/performance/soul-gym         — Soul Gym 개선 제안 목록
POST   /api/workspace/performance/soul-gym/:id/apply — 개선 제안 적용
POST   /api/workspace/performance/soul-gym/:id/dismiss — 개선 제안 무시
```

### 예상 타입 정의 (types.ts에 추가 필요)

```typescript
// 요약 통계
type PerformanceSummary = {
  totalAgents: number
  avgSuccessRate: number
  totalCostThisMonth: number
  avgResponseTimeMs: number
  changes: {
    agents: number      // 전월 대비 증감
    successRate: number  // 전월 대비 증감 (pp)
    cost: number         // 전월 대비 증감 (%)
    responseTime: number // 전월 대비 증감 (%)
  }
}

// 에이전트 성능 행
type AgentPerformance = {
  id: string
  name: string
  departmentName: string
  role: 'manager' | 'specialist' | 'worker'
  totalCalls: number
  successRate: number       // 0-100
  avgCostUsd: number
  avgResponseTimeMs: number
  soulGymStatus: 'optimal' | 'has-suggestions' | 'needs-attention'
}

// 에이전트 상세
type AgentPerformanceDetail = AgentPerformance & {
  dailyMetrics: { date: string; successRate: number; costUsd: number }[]  // 30일
  recentTasks: { commandText: string; status: string; costUsd: number; durationMs: number; createdAt: string }[]
  qualityDistribution: { score: number; count: number }[]
  soulInfo: { systemPromptSummary: string; allowedToolsCount: number; modelName: string }
}

// Soul Gym 제안
type SoulGymSuggestion = {
  id: string
  agentId: string
  agentName: string
  currentSuccessRate: number
  suggestionType: 'prompt-improve' | 'add-tool' | 'change-model'
  description: string
  confidence: number          // 0-100
  expectedImprovement: number // 0-100 (pp)
  estimatedTokens: number
}
```

### 성능 수준 뱃지 매핑

```typescript
const PERFORMANCE_BADGE: Record<string, { label: string; color: string }> = {
  high: { label: '우수', color: 'bg-emerald-100 text-emerald-700' },
  mid: { label: '보통', color: 'bg-amber-100 text-amber-700' },
  low: { label: '개선 필요', color: 'bg-red-100 text-red-700' },
}

function getPerformanceLevel(successRate: number): string {
  if (successRate >= 80) return 'high'
  if (successRate >= 50) return 'mid'
  return 'low'
}
```

### 파일 구조 (정확히 따를 것)

**신규 파일:**
- `packages/app/src/pages/performance.tsx` — 전력분석 메인 페이지 (PerformancePage export)

**수정 파일:**
- `packages/app/src/App.tsx` — lazy import + Route 추가
- `packages/app/src/components/sidebar.tsx` — 네비게이션 항목 추가
- `packages/shared/src/types.ts` — Performance 관련 타입 추가

### 반응형 디자인

- lg+: 요약 카드 4열, 테이블 전체 표시, Soul Gym 카드 2열
- md: 요약 카드 2열, 테이블 전체, Soul Gym 카드 1열
- sm(md 미만): 카드 1열, 테이블 가로 스크롤, Soul Gym 카드 1열

### 중요 구현 규칙

1. **단일 페이지 파일**: performance.tsx 하나에 모든 컴포넌트 포함 (classified.tsx, ops-log.tsx 패턴과 동일)
2. **react-query 캐시 키**: `['performance-summary']`, `['performance-agents']`, `['performance-agent-detail', id]`, `['soul-gym-suggestions']`
3. **폴링**: 요약 카드만 30초 폴링 (refetchInterval: 30000)
4. **Recharts**: LineChart (성능 추이), BarChart (품질 분포) — ResponsiveContainer 필수
5. **ConfirmDialog**: Soul Gym 적용 시 반드시 확인 다이얼로그 사용
6. **상세 모달**: 행 클릭 → Modal 컴포넌트로 상세 표시 (ops-log.tsx 패턴)
7. **정렬**: 테이블 헤더 클릭으로 정렬 토글 (sortBy + sortOrder 쿼리 파라미터)

### Project Structure Notes

- 파일명: kebab-case (`performance.tsx`)
- 컴포넌트명: PascalCase (`PerformancePage`, `SummaryCards`, `AgentPerformanceTable`, `SoulGymPanel`)
- API 경로: `/workspace/performance` (server에 Story 17-5로 등록됨)
- Sidebar 위치: 운영 그룹의 기밀문서(`/classified`) 다음

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic17] E17-S6 전력분석 UI + Soul Gym 제안, 3 SP, FR73, UX #10
- [Source: _bmad-output/planning-artifacts/prd.md#FR73] Admin/CEO는 전력분석(Soul Gym)에서 에이전트별 성능 개선 제안을 확인하고 Soul을 업데이트할 수 있다
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Screen13] 전력분석: Soul Gym 카드(개선 제안+신뢰도) + 에이전트 성능 테이블 + 차트, 폴링
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md#13] v1 전력분석: Soul Gym(개선 제안, 신뢰도, 토큰 추정), 품질 대시보드, 에이전트별 성능
- [Source: packages/app/src/pages/dashboard.tsx] 작전현황 — 요약 카드 + 차트 패턴
- [Source: packages/app/src/pages/classified.tsx] 기밀문서 UI — 테이블 + 필터 + 모달 패턴
- [Source: packages/app/src/pages/ops-log.tsx] 작전일지 — 필터/검색/페이지네이션/상세모달 패턴
- [Source: packages/shared/src/types.ts] 기존 타입 정의 참조

### 이전 스토리 학습 (17-1 ~ 17-4)

- 단일 파일 페이지 패턴 (모든 서브 컴포넌트를 한 파일에 정의) 성공적
- useDebounce 훅은 파일 내에 정의
- Badge, EmptyState, SkeletonTable, Modal, ConfirmDialog, toast — @corthex/ui에서 import
- QualityBar, formatTime, formatCost 헬퍼 재사용 가능
- MarkdownRenderer 기존 컴포넌트 재사용
- 필터 칩 패턴 (활성 필터 표시 + 개별 제거 + 전체 초기화) 동작 확인
- API 미존재 시 빈 배열/null 안전 처리 필수

### v1 코드 참고

v1(`/home/ubuntu/CORTHEX_HQ/`)의 전력분석 기능 참고:
- Soul Gym: 에이전트별 개선 제안, 신뢰도 점수, 필요 토큰 추정
- 품질 대시보드: 총 리뷰 수, 통과율, 평균 점수, 실패 작업 목록
- 에이전트별 성능: 호출 수, 성공률, 평균 비용, 평균 시간
- v1에서 동작했던 기능은 v2에서도 반드시 동작해야 함

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

### File List
