# Story 17.5: 전력분석 API (Soul Gym + 성능 지표)

Status: ready-for-dev

## Story

As a CEO/Human 직원,
I want 에이전트별 성능 지표(호출 수, 성공률, 비용, 시간)와 Soul Gym(LLM 기반 개선 제안, 벤치마크 점수, Soul 변이 생성)을 API로 제공받기를,
so that 에이전트 성능을 데이터로 분석하고, Soul Gym을 통해 에이전트의 Soul(성격 문서)을 자동 개선하여 조직 전체의 AI 업무 품질을 높일 수 있다.

## Acceptance Criteria

1. **에이전트 성능 지표 API**: `GET /workspace/performance`
   - 에이전트별 집계: 총 호출 수, 완료 작업 수, 실패 작업 수, 성공률(%), 총 비용(USD), 평균 실행 시간(초), 총 토큰 수
   - 필터: 기간(startDate, endDate), 부서(departmentId), 에이전트(agentId)
   - 정렬: successRate, totalCost, taskCount (기본: taskCount desc)
   - 에이전트 정보(이름, 티어, 부서명) 포함

2. **성능 추세 API**: `GET /workspace/performance/trend`
   - 일별 집계: 날짜, 총 작업 수, 성공 수, 실패 수, 총 비용, 평균 점수
   - 필터: 기간(days, 기본 30), agentId (선택)
   - 차트용 시계열 데이터 반환

3. **품질 점수 추세 API**: `GET /workspace/performance/quality`
   - 에이전트별 품질 리뷰 집계: 총 리뷰 수, 통과율, 평균 점수, 5항목별 평균
   - 필터: 기간, agentId
   - 시계열 데이터(일별 평균 점수) 포함

4. **에이전트 랭킹 API**: `GET /workspace/performance/ranking`
   - 성공률, 품질 점수, 비용 효율(작업당 비용) 기준 순위
   - 상위 N개(기본 10) 반환
   - 티어별(manager/specialist/worker) 필터

5. **Soul Gym 개선 제안 API**: `POST /workspace/performance/soul-gym/analyze`
   - 특정 에이전트의 최근 작업/품질 데이터를 LLM으로 분석
   - 3개 변이(A: 규칙 추가, B: 표현 강화, C: 하이브리드) 제안 생성
   - 각 변이에 예상 개선 이유 + 신뢰도(%) 포함
   - 현재 Soul 문서 + 최근 실패/경고 패턴 기반 분석

6. **Soul Gym 벤치마크 실행 API**: `POST /workspace/performance/soul-gym/benchmark`
   - 원본 Soul + 변이 3개를 동일 벤치마크 문항으로 테스트
   - LLM-as-Judge: 4차원 채점 (BLUF 형식 20점, 전문성 30점, 구체성 30점, 구조 20점)
   - 결과: 원본 vs 변이 A/B/C 점수 비교, 승자 판정
   - 개선 >= 3.0점일 때만 채택 권장

7. **Soul Gym 적용 API**: `POST /workspace/performance/soul-gym/apply`
   - 선택한 변이를 에이전트 Soul에 적용 (agents 테이블 soulMarkdown 업데이트)
   - 적용 이력 기록 (soul_gym_rounds 테이블)
   - 롤백 지원: 이전 Soul 백업 저장

8. **Soul Gym 이력 API**: `GET /workspace/performance/soul-gym/history`
   - agentId 필터, 페이지네이션
   - 각 라운드: 이전 점수, 이후 점수, 개선도, 승자, 비용, 날짜

9. **Soul Evolution (경고 기반 자동 개선) API**: `POST /workspace/performance/soul-evolution/run`
   - 에이전트의 최근 경고/실패 패턴 분석 → Soul 변경 제안 생성
   - 자동 승인/수동 승인 모드
   - `GET /workspace/performance/soul-evolution/proposals` — 대기 중 제안 목록
   - `POST /workspace/performance/soul-evolution/approve/:id` — 제안 승인
   - `POST /workspace/performance/soul-evolution/reject/:id` — 제안 거부

10. **성능 요약 API**: `GET /workspace/performance/summary`
    - 대시보드 카드용: 총 에이전트 수, 평균 성공률, 총 비용, Soul Gym 최근 실행 결과
    - 가장 성과 좋은/나쁜 에이전트 하이라이트

## Tasks / Subtasks

- [ ] Task 1: 성능 집계 서비스 (AC: #1, #2, #3, #4, #10)
  - [ ] 1.1 `packages/server/src/services/performance-analysis.ts` 생성
  - [ ] 1.2 `getAgentPerformance()`: orchestration_tasks + cost_records + quality_reviews JOIN 집계
  - [ ] 1.3 `getPerformanceTrend()`: 일별 시계열 집계 (SQL GROUP BY date)
  - [ ] 1.4 `getQualityTrend()`: quality_reviews 일별/에이전트별 집계
  - [ ] 1.5 `getAgentRanking()`: 성공률/품질/비용효율 기준 순위
  - [ ] 1.6 `getPerformanceSummary()`: 전체 요약 카드 데이터

- [ ] Task 2: Soul Gym 서비스 (AC: #5, #6, #7, #8)
  - [ ] 2.1 `packages/server/src/services/soul-gym.ts` 생성
  - [ ] 2.2 `analyzeSoul()`: LLM으로 에이전트 성능 분석 + 3 변이 생성
  - [ ] 2.3 `runBenchmark()`: 벤치마크 문항 + LLM-as-Judge 4차원 채점
  - [ ] 2.4 `applySoulVariant()`: Soul 업데이트 + 이력 저장 + 롤백 백업
  - [ ] 2.5 `getSoulGymHistory()`: 진화 이력 페이지네이션

- [ ] Task 3: Soul Evolution 서비스 (AC: #9)
  - [ ] 3.1 Soul Evolution 로직: 경고/실패 패턴 분석 → 제안 생성
  - [ ] 3.2 제안 승인/거부 처리 + Soul 자동 업데이트
  - [ ] 3.3 제안 목록/이력 조회

- [ ] Task 4: DB 스키마 확장 (AC: #7, #8, #9)
  - [ ] 4.1 `soul_gym_rounds` 테이블: agentId, roundNum, scoreBefore, scoreAfter, improvement, winner, costUsd, variantsJson, benchmarkJson, createdAt
  - [ ] 4.2 `soul_evolution_proposals` 테이블: agentId, status(pending/approved/rejected), proposalText, warningsAnalyzed, createdAt
  - [ ] 4.3 `soul_backups` 테이블: agentId, soulMarkdown, version, createdAt (롤백용)
  - [ ] 4.4 Drizzle migration 생성

- [ ] Task 5: API 라우트 (AC: #1~#10)
  - [ ] 5.1 `packages/server/src/routes/workspace/performance.ts` 생성
  - [ ] 5.2 성능 집계 엔드포인트 6개 등록
  - [ ] 5.3 Soul Gym 엔드포인트 4개 등록
  - [ ] 5.4 Soul Evolution 엔드포인트 4개 등록
  - [ ] 5.5 Zod 스키마 입력 검증
  - [ ] 5.6 workspace 라우터에 등록

- [ ] Task 6: 공유 타입 정의 (AC: 전체)
  - [ ] 6.1 `packages/shared/src/types.ts`에 Performance 관련 타입 추가

## Dev Notes

### 핵심 패턴 참조 (기존 코드 — 반드시 재사용)

**비용 집계 패턴** (`packages/server/src/services/cost-aggregation.ts`):
- `sum()`, `count()`, `avg()` + `groupBy()` Drizzle 패턴
- 에이전트별/부서별/모델별 3축 집계 — 동일 패턴 성능 집계에 적용

**대시보드 서비스 패턴** (`packages/server/src/services/dashboard.ts`):
- 4-card 요약 데이터 패턴 (performance summary에 재사용)
- 일별 사용량 집계 패턴 (trend API에 재사용)

**품질 게이트 타입** (`packages/server/src/services/chief-of-staff.ts`):
```typescript
interface QualityScores {
  conclusionClarity: number;
  evidenceSufficiency: number;
  riskMention: number;
  formatAdequacy: number;
  logicalConsistency: number;
}
```

**LLM 호출 패턴** (`packages/server/src/services/agent-runner.ts`):
- `llmRouter.call()` — Soul Gym 분석/벤치마크에서 사용
- `buildSystemPrompt(agent)` — 벤치마크 시 변이 Soul로 교체하여 호출

**라우트 등록 패턴** (`packages/server/src/routes/workspace/archive.ts`):
- `authMiddleware` + Zod `zValidator` 패턴
- `{ success: true, data }` 응답 래퍼
- 페이지네이션: `{ data, pagination: { page, limit, total } }`

### DB 스키마 — 기존 테이블 활용

**orchestration_tasks** (성능 집계 핵심):
- agentId, status('completed'/'failed'), startedAt, completedAt (실행 시간 계산)
- commandId → commands 테이블 JOIN

**cost_records** (비용 집계):
- agentId, departmentId, modelName, cost, inputTokens, outputTokens, createdAt

**quality_reviews** (품질 집계):
- scores (JSON: 5항목), passed (boolean), createdAt
- targetId → 결과물 연결

**agents** (에이전트 정보):
- id, name, tier, departmentId, soulMarkdown, modelName, isActive

### v1 Soul Gym 아키텍처 (반드시 참고)

v1 소스: `/home/ubuntu/CORTHEX_HQ/web/soul_gym_engine.py` (581줄)

**v1 핵심 로직 (v2에서 재현해야 할 것):**
1. **변이 생성**: EvoPrompt + OPRO 프레임워크 기반 3개 변이 (A: 규칙 추가, B: 표현 강화, C: 하이브리드)
2. **벤치마크**: 부서별 맞춤 문항 3개씩 (YAML 설정), 원본+변이 모두 응답 생성
3. **LLM-as-Judge 채점**: BLUF(20점) + 전문성(30점) + 구체성(30점) + 구조(20점) = 100점
4. **채택 기준**: 개선 >= 3.0점 이상일 때만 변이 채택 권장
5. **비용 제한**: $50/전체 사이클 상한

**v1 Soul Evolution** (`/home/ubuntu/CORTHEX_HQ/web/handlers/soul_evolution_handler.py`):
- 에이전트 경고(warnings) 패턴 분석 → Soul 변경 제안
- "## 추가할 텍스트" 섹션 추출 → Soul 문서에 append
- 승인/거부/자동 승인 3가지 상태

**v1 성능 메트릭** (`/home/ubuntu/CORTHEX_HQ/web/arm_server.py:700`):
- agent_calls + tasks 테이블 JOIN 집계
- 반환: llm_calls, tasks_completed, tasks_failed, success_rate, cost_usd, avg_execution_seconds, total_tokens

### Soul Gym 벤치마크 설정

v1에서는 `config/soul_gym_benchmarks.yaml`에 에이전트별 벤치마크 문항 정의.
v2에서는 DB에 벤치마크 설정 저장 (동적 조직이므로 YAML 고정 불가):
- `soul_gym_rounds` 테이블의 benchmarkJson에 문항+결과 함께 저장
- 기본 벤치마크 문항은 에이전트 Soul + 부서 정보 기반으로 LLM이 자동 생성

### API 엔드포인트 전체 목록

```
GET    /api/workspace/performance              — 에이전트별 성능 지표
GET    /api/workspace/performance/trend         — 일별 성능 추세
GET    /api/workspace/performance/quality       — 품질 점수 추세
GET    /api/workspace/performance/ranking       — 에이전트 랭킹
GET    /api/workspace/performance/summary       — 요약 카드 데이터
POST   /api/workspace/performance/soul-gym/analyze    — Soul Gym 분석 + 변이 제안
POST   /api/workspace/performance/soul-gym/benchmark  — 벤치마크 실행
POST   /api/workspace/performance/soul-gym/apply      — 변이 적용
GET    /api/workspace/performance/soul-gym/history     — Soul Gym 이력
POST   /api/workspace/performance/soul-evolution/run       — Soul Evolution 실행
GET    /api/workspace/performance/soul-evolution/proposals  — 대기 제안 목록
POST   /api/workspace/performance/soul-evolution/approve/:id — 제안 승인
POST   /api/workspace/performance/soul-evolution/reject/:id  — 제안 거부
```

### 타입 정의 (packages/shared/src/types.ts에 추가)

```typescript
// 에이전트 성능 집계
interface AgentPerformanceMetric {
  agentId: string;
  agentName: string;
  tier: 'manager' | 'specialist' | 'worker';
  departmentName: string | null;
  taskCount: number;
  completedCount: number;
  failedCount: number;
  successRate: number;        // 0-100 %
  totalCost: number;          // USD
  avgExecutionTime: number;   // seconds
  totalTokens: number;
  avgQualityScore: number;    // 0-5
}

// 성능 추세 (일별)
interface PerformanceTrendPoint {
  date: string;               // YYYY-MM-DD
  taskCount: number;
  completedCount: number;
  failedCount: number;
  totalCost: number;
  avgScore: number;
}

// 품질 추세
interface QualityTrendPoint {
  date: string;
  reviewCount: number;
  passRate: number;
  avgScore: number;
  scores: {
    conclusionClarity: number;
    evidenceSufficiency: number;
    riskMention: number;
    formatAdequacy: number;
    logicalConsistency: number;
  };
}

// 에이전트 랭킹
interface AgentRanking {
  rank: number;
  agentId: string;
  agentName: string;
  tier: string;
  departmentName: string | null;
  value: number;              // 랭킹 기준 값
  metric: 'successRate' | 'qualityScore' | 'costEfficiency';
}

// Soul Gym 변이
interface SoulVariant {
  type: 'A' | 'B' | 'C';     // A=규칙추가, B=표현강화, C=하이브리드
  label: string;
  description: string;
  proposedChanges: string;    // 변경 내용 마크다운
  confidence: number;         // 0-100 %
}

// Soul Gym 분석 결과
interface SoulGymAnalysis {
  agentId: string;
  agentName: string;
  currentSoulSummary: string;
  recentIssues: string[];     // 최근 실패/품질 이슈
  variants: SoulVariant[];
}

// 벤치마크 결과
interface BenchmarkResult {
  agentId: string;
  questions: { question: string; topic: string }[];
  scores: {
    original: BenchmarkScore;
    variantA: BenchmarkScore;
    variantB: BenchmarkScore;
    variantC: BenchmarkScore;
  };
  winner: 'original' | 'variantA' | 'variantB' | 'variantC';
  improvement: number;        // 점수 차이
  recommendation: string;
}

interface BenchmarkScore {
  bluf: number;               // 0-20
  expertise: number;          // 0-30
  specificity: number;        // 0-30
  structure: number;          // 0-20
  total: number;              // 0-100
}

// Soul Gym 이력
interface SoulGymRound {
  id: string;
  agentId: string;
  agentName: string;
  roundNum: number;
  scoreBefore: number;
  scoreAfter: number;
  improvement: number;
  winner: string;
  costUsd: number;
  createdAt: string;
}

// Soul Evolution 제안
interface SoulEvolutionProposal {
  id: string;
  agentId: string;
  agentName: string;
  status: 'pending' | 'approved' | 'rejected';
  proposalText: string;
  warningsAnalyzed: number;
  createdAt: string;
}

// 성능 요약
interface PerformanceSummary {
  totalAgents: number;
  activeAgents: number;
  avgSuccessRate: number;
  totalCostUsd: number;
  lastSoulGymResult: { agentName: string; improvement: number } | null;
  topAgent: { name: string; successRate: number } | null;
  bottomAgent: { name: string; successRate: number } | null;
}
```

### 파일 구조

**신규 파일:**
- `packages/server/src/services/performance-analysis.ts` — 성능 집계 서비스
- `packages/server/src/services/soul-gym.ts` — Soul Gym 엔진
- `packages/server/src/routes/workspace/performance.ts` — API 라우트

**수정 파일:**
- `packages/server/src/db/schema.ts` — soul_gym_rounds, soul_evolution_proposals, soul_backups 테이블 추가
- `packages/shared/src/types.ts` — Performance/SoulGym 관련 타입 추가
- `packages/server/src/routes/workspace/index.ts` (또는 app 등록부) — performance 라우트 마운트

### Soul Gym LLM 프롬프트 설계

**변이 생성 프롬프트** (analyzeSoul):
```
당신은 AI 에이전트 성능 최적화 전문가입니다.
다음 에이전트의 현재 Soul(성격 문서)과 최근 성능 데이터를 분석하고,
3가지 개선 변이를 제안해주세요.

[현재 Soul]: {soulMarkdown}
[최근 실패 패턴]: {recentFailures}
[품질 점수 추세]: {qualityTrend}

변이 A (규칙 추가): 명확한 행동 규칙을 추가하여 반복 실패 방지
변이 B (표현 강화): 기존 지시를 더 구체적이고 강하게 표현
변이 C (하이브리드): A+B 결합 + 새로운 접근
```

**벤치마크 채점 프롬프트** (LLM-as-Judge):
```
다음 응답을 4가지 차원으로 평가해주세요:
1. BLUF 형식 (0-20): 결론을 먼저 제시하는가?
2. 전문성 (0-30): 정확하고 논리적인가?
3. 구체성 (0-30): 수치와 근거가 구체적인가?
4. 구조 (0-20): 읽기 쉽고 체계적인가?

JSON 형식으로 반환: { bluf, expertise, specificity, structure, total }
```

### 중요 구현 규칙

1. **LLM 호출은 llmRouter.call() 사용** — 직접 API 호출 금지
2. **Soul Gym 비용 추적**: 분석/벤치마크/채점 모든 LLM 호출에 costTracker 연결
3. **동적 조직 대응**: 벤치마크 문항은 LLM이 에이전트 Soul+부서 기반 자동 생성 (v1처럼 YAML 고정 아님)
4. **rollback 안전**: applySoulVariant 전에 반드시 soul_backups에 현재 Soul 저장
5. **tenant 격리**: 모든 쿼리에 companyId 조건 필수

### Project Structure Notes

- 파일명: kebab-case (`performance-analysis.ts`, `soul-gym.ts`)
- 라우트 마운트: workspace 그룹 하위 (`/workspace/performance`)
- DB 테이블: snake_case 복수형 (`soul_gym_rounds`, `soul_evolution_proposals`)
- API 응답: `{ success: true, data }` 래퍼

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic17] E17-S5 전력분석 API (Soul Gym + 성능 지표), 2 SP, FR73
- [Source: _bmad-output/planning-artifacts/prd.md#FR73] Admin/CEO는 전력분석(Soul Gym)에서 에이전트별 성능 개선 제안을 확인하고 Soul을 업데이트할 수 있다
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Screen10] 전력분석: Soul Gym 카드 + 성능 차트 + 에이전트 테이블, 폴링
- [Source: _bmad-output/planning-artifacts/architecture.md] QualityCheckResult 5항목, CostRecord 스키마, 3계급 역할 구분
- [Source: /home/ubuntu/CORTHEX_HQ/web/soul_gym_engine.py] v1 Soul Gym — 3변이, LLM-as-Judge 4차원 채점, 벤치마크
- [Source: /home/ubuntu/CORTHEX_HQ/web/handlers/soul_evolution_handler.py] v1 Soul Evolution — 경고 기반 자동 개선
- [Source: /home/ubuntu/CORTHEX_HQ/web/arm_server.py:700] v1 Performance API — 에이전트 집계 메트릭
- [Source: packages/server/src/services/cost-aggregation.ts] 비용 집계 Drizzle 패턴
- [Source: packages/server/src/services/dashboard.ts] 대시보드 요약 패턴
- [Source: packages/server/src/services/chief-of-staff.ts] QualityScores 타입
- [Source: packages/server/src/db/schema.ts] 기존 테이블 스키마

### 이전 스토리 학습 (17-1 ~ 17-4)

- 17-1/17-2: ops-log 패턴 (검색/필터/페이지네이션) — 성능 목록에 동일 적용
- 17-3: archive API 패턴 (Drizzle JOIN + 집계) — 성능 집계에 동일 적용
- 17-4: classified UI 패턴 (단일 파일, 서브 컴포넌트 내장) — 17-6 UI에서 참고
- 기존 146개 archive 테스트 + 175개 classified 테스트 regression 없이 안정
- Zod 검증 + authMiddleware 패턴 일관성 유지

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

### File List
