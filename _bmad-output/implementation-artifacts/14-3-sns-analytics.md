# Story 14.3: SNS 분석 대시보드

Status: done

## Story

As a 사용자,
I want SNS 콘텐츠의 발행 현황, 플랫폼별 통계, 상태별 분포를 한눈에 파악할 수 있는 분석 대시보드를 볼 수 있다,
so that SNS 마케팅 성과를 데이터 기반으로 분석하고 전략을 개선할 수 있다.

## Acceptance Criteria

1. **Given** 인증된 사용자 **When** GET /api/workspace/sns/stats?days=30 **Then** SNS 통계 데이터 반환 (총 콘텐츠 수, 상태별 분포, 플랫폼별 분포, 일별 생성 추이)
2. **Given** 인증된 사용자 **When** GET /api/workspace/sns/stats?days=7 **Then** 최근 7일 기준 통계 데이터 반환 (days 파라미터에 따라 기간 변경)
3. **Given** 통계 데이터 **When** 상태별 분포 확인 **Then** draft/pending/approved/scheduled/rejected/published/failed 각 상태별 건수 반환
4. **Given** 통계 데이터 **When** 플랫폼별 분포 확인 **Then** instagram/tistory/daum_cafe 각 플랫폼별 건수 + 발행 성공 건수 반환
5. **Given** 통계 데이터 **When** 일별 추이 확인 **Then** 해당 기간 내 일자별 생성 건수 배열 반환 (날짜 + count)
6. **Given** SNS 페이지 **When** 사용자가 "통계" 탭 클릭 **Then** 통계 요약 카드 4개 (총 콘텐츠, 발행 완료, 발행 성공률, 대기 중) + 상태별 분포 + 플랫폼별 분포 + 일별 추이 차트 표시
7. **Given** 통계 탭 **When** 기간 선택 (7일/30일/90일) **Then** 선택한 기간에 따라 통계 갱신
8. **Given** SNS 콘텐츠 0건 **When** 통계 탭 진입 **Then** EmptyState "아직 SNS 콘텐츠가 없습니다" 표시
9. **Given** 테넌트 격리 **When** 통계 조회 **Then** companyId 필터링으로 본인 회사 데이터만 반환
10. **Given** turbo build + type-check **When** 전체 빌드 **Then** 8/8 성공

## Tasks / Subtasks

- [x] Task 1: 서버 API — GET /api/workspace/sns/stats 통계 엔드포인트 (AC: #1, #2, #3, #4, #5, #9)
  - [x] `packages/server/src/routes/workspace/sns.ts`에 GET /sns/stats 추가
  - [x] 쿼리 파라미터: `days` (기본 30, 최대 365, 최소 1)
  - [x] 통계 쿼리:
    - 총 콘텐츠 수: `COUNT(*)`
    - 상태별 분포: `GROUP BY status`
    - 플랫폼별 분포: `GROUP BY platform` + 플랫폼별 published 건수 (FILTER WHERE)
    - 일별 생성 추이: `GROUP BY to_char(created_at, 'YYYY-MM-DD')` + 날짜별 count
  - [x] 응답 타입:
    ```typescript
    {
      total: number
      byStatus: { status: string; count: number }[]
      byPlatform: { platform: string; total: number; published: number }[]
      dailyTrend: { date: string; count: number }[]
      days: number
    }
    ```
  - [x] companyId 필터 필수 (테넌트 격리)

- [x] Task 2: 프론트엔드 — SNS 페이지에 "통계" 탭 추가 (AC: #6, #7, #8)
  - [x] `packages/app/src/pages/sns.tsx` 수정
  - [x] view 상태에 `'stats'` 추가: `useState<'list' | 'create' | 'detail' | 'stats'>('list')`
  - [x] 헤더에 "통계" 버튼 추가 (목록 뷰일 때)
  - [x] 통계 뷰 구현:
    - 기간 선택 버튼 (7일/30일/90일), 기본 30일
    - 요약 카드 4개 (그리드 4열):
      1. 총 콘텐츠 (total)
      2. 발행 완료 (published count from byStatus)
      3. 발행 성공률 (published / (published + failed) * 100)%
      4. 대기 중 (pending + approved + scheduled count)
    - 상태별 분포: 가로 바 형태 (각 상태별 bar, STATUS_LABELS/COLORS 재사용)
    - 플랫폼별 분포: 간단한 카드 (PLATFORM_LABELS 재사용)
    - 일별 추이: div bar 형태 (최대값 대비 비율 width)
  - [x] EmptyState 처리: total === 0이면 안내 메시지

- [x] Task 3: 빌드 검증 (AC: #10)
  - [x] `bunx turbo build type-check` → 8/8 성공

## Dev Notes

### 기존 인프라 활용 (절대 재구현 금지)

1. **SNS API** (`packages/server/src/routes/workspace/sns.ts`)
   - 기존 GET /sns 목록, GET /sns/:id 상세 패턴 확립
   - authMiddleware로 tenant (companyId, userId, role) 접근
   - `snsContents` 테이블에서 직접 쿼리
   - **주의**: GET /sns/stats 경로가 GET /sns/:id보다 먼저 등록되어야 함 (Hono 라우터 매칭 순서)

2. **snsContents 테이블** (`packages/server/src/db/schema.ts:360-381`)
   - status: snsStatusEnum — `['draft', 'pending', 'approved', 'scheduled', 'rejected', 'published', 'failed']`
   - platform: snsPlatformEnum — `['instagram', 'tistory', 'daum_cafe']`
   - createdAt: timestamp (일별 추이 집계 기준)
   - companyId: uuid (테넌트 격리)

3. **대시보드 API 패턴** (`packages/server/src/routes/workspace/dashboard.ts`)
   - days 쿼리 파라미터 패턴: `const days = Number(c.req.query('days')) || 30`
   - 날짜 범위 필터: `gte(table.createdAt, since)` where `since = new Date(Date.now() - days * 86400000)`
   - SQL 집계: `sql<number>\`count(*)\`` 패턴

4. **프론트엔드 SNS 페이지** (`packages/app/src/pages/sns.tsx`)
   - view 상태 패턴: `useState<'list' | 'create' | 'detail'>('list')` → `'stats'` 추가
   - STATUS_LABELS, STATUS_COLORS, PLATFORM_LABELS 상수 이미 존재
   - useQuery 패턴 확립
   - 기존 대시보드 페이지(`packages/app/src/pages/dashboard.tsx`)의 StatCard/테이블 패턴 참고

5. **Drizzle ORM 집계 패턴**
   - `import { sql, count, eq, and, gte } from 'drizzle-orm'`
   - GROUP BY: `db.select({ status: snsContents.status, count: count() }).from(snsContents).groupBy(snsContents.status)`
   - DATE 추출: `sql<string>\`DATE(${snsContents.createdAt})\``

### 라우트 등록 순서 주의

Hono에서 `/sns/stats`는 `/sns/:id`보다 **먼저** 등록해야 함. 그렇지 않으면 "stats"가 `:id`로 매칭됨.
현재 파일에서 GET /sns (목록) 다음, GET /sns/:id (상세) 이전에 배치할 것.

### 차트 라이브러리 사용하지 않음

외부 차트 라이브러리(Recharts 등) 설치하지 않음. 일별 추이는 간단한 텍스트/바 형태로 표현:
- 각 날짜의 count를 최대값 대비 비율로 width 조절하는 div bar
- 또는 단순 테이블 (날짜 | 건수)

### 주의사항

- **테넌트 격리**: 모든 쿼리에 `eq(snsContents.companyId, tenant.companyId)` 필수
- **빈 결과 처리**: 콘텐츠 0건이면 빈 배열 반환 (에러 아님)
- **성공률 계산**: published + failed > 0일 때만 계산, 아니면 0% (0으로 나누기 방지)
- **날짜 형식**: dailyTrend의 date는 'YYYY-MM-DD' ISO 문자열
- **파일명 kebab-case**: 신규 파일 생성 없음 (기존 sns.ts, sns.tsx 수정만)

### Project Structure Notes

- 서버: `packages/server/src/routes/workspace/sns.ts` (수정 — /sns/stats 엔드포인트 추가)
- 프론트: `packages/app/src/pages/sns.tsx` (수정 — stats 뷰 추가)
- DB 마이그레이션 불필요 (기존 테이블에서 집계만)
- 신규 파일 생성 없음

### References

- [Source: packages/server/src/routes/workspace/sns.ts] — 기존 SNS API 전체 (627줄)
- [Source: packages/server/src/routes/workspace/dashboard.ts] — 대시보드 API 패턴 (days 파라미터, 집계 쿼리)
- [Source: packages/server/src/db/schema.ts#snsContents] — SNS 테이블 스키마 (status/platform enum, createdAt)
- [Source: packages/app/src/pages/sns.tsx] — SNS 프론트엔드 (view 상태, STATUS_LABELS/COLORS, PLATFORM_LABELS)
- [Source: packages/app/src/pages/dashboard.tsx] — 대시보드 프론트엔드 (StatCard 패턴, 테이블 패턴)
- [Source: _bmad-output/implementation-artifacts/14-1-sns-content-planning.md] — Story 14-1 컨텍스트
- [Source: _bmad-output/implementation-artifacts/14-2-ai-image-gen-post.md] — Story 14-2 컨텍스트

### Previous Story Intelligence (14-1, 14-2)

- snsStatusEnum에 'scheduled' 추가 완료 → stats에서 7가지 상태 모두 카운트
- snsContents.scheduledAt 컬럼 존재 → 예약 관련 통계도 가능
- sns.tsx에 STATUS_LABELS/COLORS 7개 상태 모두 정의 완료 → 재사용
- sns.tsx view 상태 패턴: useState 3개 값 → 'stats' 추가만 하면 됨
- 활동 로그 기록 패턴: logActivity() — 통계 조회는 기록 불필요 (읽기 전용)
- AI 이미지 생성 (14-2) 추가로 imageUrl이 있는 콘텐츠 존재 → 통계에 영향 없음

### Git Intelligence

- 최근 커밋: 14-1 (예약 발행), 14-2 (AI 이미지), 12-1/12-2 소급 BMAD
- sns.ts에 이미 11개 엔드포인트 존재 (627줄) — GET /sns/stats 추가 시 라우트 순서 주의
- turbo build 8/8 기준 유지

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: sns.ts에 GET /sns/stats 엔드포인트 추가 — Promise.all 4병렬 쿼리 (총건수, 상태별, 플랫폼별, 일별추이), days 클램핑 1~365, FILTER WHERE로 플랫폼별 published 건수 집계
- Task 2: sns.tsx에 stats 뷰 추가 — 기간 선택(7/30/90일), 요약 카드 4개, 상태별 바 차트, 플랫폼별 카드, 일별 추이 바 차트, EmptyState 처리
- Task 3: turbo build type-check 8/8 성공
- Unit tests: 57건 전체 통과 (TEA 확장 — days 파싱, 성공률 계산, 상태별/플랫폼별 처리, 바 비율, 날짜 범위, 테넌트 격리, API 응답 구조, 경계값, 뷰 전환)
- Code Review: 1 MEDIUM (sns-stats 캐시 무효화 누락) + 1 LOW (모바일 그리드) 자동 수정

### File List

- packages/server/src/routes/workspace/sns.ts (modified — GET /sns/stats 추가, drizzle-orm imports 추가)
- packages/app/src/pages/sns.tsx (modified — SnsStats 타입, stats 뷰, 통계 버튼, statsDays 상태, sns-stats 캐시 무효화, 모바일 반응형 그리드)
- packages/server/src/__tests__/unit/sns-analytics.test.ts (new — 57 unit tests)
- _bmad-output/implementation-artifacts/tests/test-summary-14-3.md (new — TEA 요약)
