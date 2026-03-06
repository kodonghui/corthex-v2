# Story 14.5: A/B 테스트 최적화

Status: done

## Story

As a SNS 콘텐츠 관리자,
I want 같은 주제의 SNS 콘텐츠를 여러 변형(A/B)으로 생성하고, 성과를 비교하여 최적 콘텐츠를 선택할 수 있다,
so that 데이터 기반으로 더 효과적인 SNS 콘텐츠 전략을 수립할 수 있다.

## Acceptance Criteria

1. **Given** 기존 SNS 콘텐츠 **When** POST /api/workspace/sns/:id/create-variant에 요청 **Then** 원본 콘텐츠의 variantOf FK를 가진 새 변형 콘텐츠가 draft 상태로 생성 (제목/본문/해시태그 수정 가능)
2. **Given** AI 에이전트 **When** POST /api/workspace/sns/:id/generate-variants에 count(2~5)와 strategy 전송 **Then** AI가 원본 기반으로 count개의 변형 콘텐츠를 자동 생성 (variantOf 연결)
3. **Given** SNS 콘텐츠 **When** GET /api/workspace/sns/:id 조회 **Then** variantOf(원본 ID)와 variants(하위 변형 목록) 포함하여 반환
4. **Given** 발행된 A/B 변형 콘텐츠들 **When** PUT /api/workspace/sns/:id/metrics에 views/likes/shares/clicks 입력 **Then** 해당 콘텐츠의 metadata.metrics에 성과 데이터 저장
5. **Given** variantOf로 연결된 콘텐츠 그룹 **When** GET /api/workspace/sns/:id/ab-results **Then** 원본+전체 변형의 성과 비교 데이터 반환 (winner 자동 판정 포함)
6. **Given** A/B 테스트 결과 **When** winner 자동 판정 **Then** 총 engagement(views+likes*2+shares*3+clicks*2) 점수 기준 1위를 winner로 표시
7. **Given** SNS 프론트엔드 **When** 콘텐츠 상세 뷰 **Then** "변형 생성" 버튼 + AI 변형 생성 모달 + 변형 목록 + 성과 입력/비교 UI 제공
8. **Given** SNS 콘텐츠 목록 **When** ?variantOf=root 쿼리 파라미터 **Then** 원본 콘텐츠만 필터 (변형 제외), ?variantOf=<id>면 해당 원본의 변형만 표시
9. **Given** 변형 콘텐츠 삭제 시 **When** 원본이 삭제되면 **Then** 하위 변형의 variantOf가 null로 설정 (cascade 아님, orphan 허용)
10. **Given** turbo build + type-check **When** 전체 빌드 **Then** 8/8 성공

## Tasks / Subtasks

- [x] Task 1: DB 스키마 — snsContents.variantOf 컬럼 추가 (AC: #1, #3, #9)
  - [x]`packages/server/src/db/schema.ts` snsContents에 `variantOf: uuid('variant_of').references(() => snsContents.id, { onDelete: 'set null' })` 추가
  - [x]SQL 마이그레이션 `packages/server/src/db/migrations/0023_sns-ab-test.sql`
    - ALTER TABLE sns_contents ADD COLUMN variant_of UUID REFERENCES sns_contents(id) ON DELETE SET NULL
  - [x]snsContentsRelations에 variantOf self-reference 추가

- [x] Task 2: 서버 API — 변형 생성 + AI 변형 생성 (AC: #1, #2)
  - [x]`packages/server/src/routes/workspace/sns.ts` 수정
    - POST /sns/:id/create-variant — 원본 복제 후 사용자 수정 사항 적용, variantOf 설정
      - zod: `createVariantSchema = { title?: string, body?: string, hashtags?: string, imageUrl?: string }`
      - 원본 존재 확인 + companyId 검증
      - 원본 필드 복사 + override + variantOf = id + status = 'draft'
    - POST /sns/:id/generate-variants — AI로 변형 자동 생성
      - zod: `generateVariantsSchema = { count: z.number().min(2).max(5), strategy: z.enum(['tone', 'length', 'hashtag', 'headline', 'mixed']) }`
      - 원본 조회 → AI 프롬프트로 count개 변형 생성 → 각각 INSERT (variantOf = id)
      - strategy별 프롬프트 분기 (tone: 어조 변경, length: 길이 변경, hashtag: 해시태그 최적화, headline: 제목 변경, mixed: 전체 변경)

- [x] Task 3: 서버 API — 성과 입력 + A/B 결과 비교 (AC: #4, #5, #6)
  - [x]`packages/server/src/routes/workspace/sns.ts` 수정
    - PUT /sns/:id/metrics — 성과 데이터 입력
      - zod: `metricsSchema = { views: z.number().min(0), likes: z.number().min(0), shares: z.number().min(0), clicks: z.number().min(0) }`
      - metadata jsonb에 `{ metrics: { views, likes, shares, clicks, updatedAt } }` 저장
      - 기존 metadata가 있으면 spread 후 metrics만 덮어쓰기
    - GET /sns/:id/ab-results — A/B 테스트 결과 비교
      - 원본(id) + 모든 변형(variantOf = id) 조회
      - 각 콘텐츠의 metadata.metrics 추출
      - engagement score = views + likes*2 + shares*3 + clicks*2
      - winner: engagement 최고 콘텐츠 ID (metrics 없는 콘텐츠 제외)
      - 응답: `{ original, variants: [...], winner: { id, score }, scores: [{ id, title, metrics, score }] }`

- [x] Task 4: 서버 API — 목록 필터 확장 (AC: #8)
  - [x]`packages/server/src/routes/workspace/sns.ts` 수정
    - GET /sns 목록에 variantOf 쿼리 파라미터 추가
      - `?variantOf=root` → `WHERE variant_of IS NULL` (원본만)
      - `?variantOf=<uuid>` → `WHERE variant_of = <uuid>` (특정 원본의 변형만)
    - 목록 응답에 variantOf 필드 포함
    - GET /sns/:id 상세 응답에 variants 서브쿼리 추가 (변형 목록)

- [x] Task 5: 공유 타입 업데이트 (AC: #3)
  - [x]`packages/shared/src/types.ts` 수정
    - SnsContent에 `variantOf?: string | null` 추가
    - SnsMetrics 타입 추가: `{ views: number, likes: number, shares: number, clicks: number, updatedAt?: string }`
    - SnsAbResult 타입 추가: `{ original: SnsContent, variants: SnsContent[], winner: { id: string, score: number } | null, scores: { id: string, title: string, metrics: SnsMetrics | null, score: number }[] }`

- [x] Task 6: 프론트엔드 — A/B 테스트 UI (AC: #7, #8)
  - [x]`packages/app/src/pages/sns.tsx` 수정
    - 콘텐츠 상세 뷰에 "변형 생성" 버튼 추가 (수동)
    - "AI 변형 생성" 버튼 + 모달 (count 슬라이더, strategy 선택)
    - 변형 목록 표시 (variantOf가 현재 ID인 콘텐츠들)
    - 성과 입력 폼 (views/likes/shares/clicks 숫자 입력)
    - A/B 결과 비교 뷰 (테이블 + winner 하이라이트)
    - 목록 뷰에 "원본만 보기" 필터 토글 (variantOf=root)
    - 변형 콘텐츠 카드에 "[변형]" 뱃지 표시

- [x] Task 7: 빌드 검증 (AC: #10)
  - [x]`bunx turbo build type-check` → 8/8 성공

## Dev Notes

### 기존 인프라 활용 (절대 재구현 금지)

1. **snsContents 테이블** (`packages/server/src/db/schema.ts:376-398`)
   - 이미 metadata: jsonb 컬럼 존재 — 성과 데이터(metrics)를 여기에 저장
   - variantOf: uuid 컬럼만 추가하면 됨 (self-referencing FK)

2. **SNS API** (`packages/server/src/routes/workspace/sns.ts`, 692줄)
   - 전체 CRUD + 승인/반려/발행/예약취소 워크플로 이미 구현
   - zod 스키마 패턴, 테넌트 격리 패턴 확립
   - createSnsSchema, generateSnsSchema, updateSnsSchema 이미 존재

3. **AI 콘텐츠 생성 패턴** (`sns.ts:200-250`)
   - generateAgentResponse() 호출 → AI 응답 파싱 → DB INSERT 패턴 확립
   - 이 패턴을 generate-variants에서 재사용 (반복 호출)
   - `packages/server/src/lib/ai.ts`의 generateAgentResponse 함수 사용

4. **SNS 통계 API** (`sns.ts:101-152`)
   - 이미 stats 엔드포인트 존재 (총 건수, 상태별, 플랫폼별, 일별 추이)
   - A/B 결과는 별도 엔드포인트 (/ab-results)로 구현

5. **프론트엔드** (`packages/app/src/pages/sns.tsx`, 712줄)
   - useMutation/useQuery 패턴 확립
   - 모달 패턴, 상세 뷰, 필터 패턴 모두 존재
   - STATUS_LABELS/COLORS 확장 가능

6. **snsAccounts** (`packages/server/src/routes/workspace/sns-accounts.ts`)
   - 계정 관리 CRUD 완료, 콘텐츠에 snsAccountId 연동됨
   - 변형 콘텐츠도 원본의 snsAccountId 상속

### 암호화/보안 관련 — 해당 없음
- 이 스토리에서는 credentials 처리 없음 (성과 데이터는 평문 jsonb)

### metadata 컬럼 활용 패턴

```typescript
// 성과 데이터 저장 (기존 metadata 보존)
const existingMetadata = existing.metadata as Record<string, unknown> || {}
await db.update(snsContents).set({
  metadata: { ...existingMetadata, metrics: { views, likes, shares, clicks, updatedAt: new Date().toISOString() } },
  updatedAt: new Date(),
}).where(eq(snsContents.id, id))
```

### engagement score 공식

```typescript
// engagement = views + likes*2 + shares*3 + clicks*2
function calcEngagement(m: { views: number, likes: number, shares: number, clicks: number }): number {
  return m.views + m.likes * 2 + m.shares * 3 + m.clicks * 2
}
```

### AI 변형 생성 프롬프트 패턴

```typescript
const strategyPrompts: Record<string, string> = {
  tone: '같은 내용을 다른 어조(공식적/친근한/유머러스 등)로 변형',
  length: '같은 메시지를 더 짧게/길게 변형',
  hashtag: '같은 내용에 다른 해시태그 전략 적용',
  headline: '같은 본문에 다른 제목/헤드라인 적용',
  mixed: '어조, 길이, 해시태그, 제목을 모두 다르게 변형',
}
```

### DB 마이그레이션 — 0023

```sql
ALTER TABLE sns_contents ADD COLUMN variant_of UUID REFERENCES sns_contents(id) ON DELETE SET NULL;
CREATE INDEX sns_contents_variant_of_idx ON sns_contents(variant_of);
```

### 주의사항

- **하위 호환**: variantOf는 nullable — 기존 콘텐츠는 null (원본)
- **삭제 정책**: ON DELETE SET NULL — 원본 삭제 시 변형은 orphan 됨 (variantOf = null)
- **성과 데이터**: metadata jsonb 활용 — 별도 테이블 불필요
- **AI 변형 생성**: generateAgentResponse를 반복 호출 (순차, Promise.all 아님 — rate limit 고려)
- **목록 기본 동작**: variantOf 파라미터 없으면 기존 동작 유지 (모든 콘텐츠 표시)
- **파일명 kebab-case**: 신규 파일 없음 (기존 파일 수정만)
- **마이그레이션 번호**: 0023 (0022 다음)

### Project Structure Notes

- 서버: `packages/server/src/db/schema.ts` (수정 — variantOf 컬럼 추가)
- 서버: `packages/server/src/db/migrations/0023_sns-ab-test.sql` (신규)
- 서버: `packages/server/src/routes/workspace/sns.ts` (수정 — 변형 생성/성과/비교 API 추가)
- 공유: `packages/shared/src/types.ts` (수정 — SnsMetrics, SnsAbResult 타입)
- 프론트: `packages/app/src/pages/sns.tsx` (수정 — A/B 테스트 UI)

### References

- [Source: packages/server/src/db/schema.ts#snsContents:376-398] — SNS 테이블 (metadata jsonb 존재)
- [Source: packages/server/src/routes/workspace/sns.ts:1-692] — SNS API 전체
- [Source: packages/server/src/routes/workspace/sns.ts:101-152] — 통계 API
- [Source: packages/server/src/routes/workspace/sns.ts:200-250] — AI 생성 패턴
- [Source: packages/shared/src/types.ts:68-97] — SNS 공유 타입
- [Source: packages/app/src/pages/sns.tsx] — SNS 프론트엔드 (712줄)
- [Source: _bmad-output/implementation-artifacts/14-4-sns-multi-account.md] — 이전 스토리 (멀티 계정)

### Previous Story Intelligence (14-1 ~ 14-4)

- snsStatusEnum: draft/pending/approved/scheduled/rejected/published/failed
- scheduledAt + cancel-schedule (14-1), imageUrl + DALL-E 3 (14-2), stats API (14-3), snsAccountId + 계정 CRUD (14-4)
- AI 생성 패턴: generateAgentResponse() → 응답 파싱 → INSERT
- metadata jsonb 컬럼 이미 존재하지만 사용 중이 아님 — 성과 데이터 저장에 활용
- logActivity() 패턴: `{ companyId, type: 'sns', phase: 'end', actorType, action, detail }`
- 프론트 패턴: useMutation, 모달, STATUS_LABELS/COLORS, 필터 드롭다운

### Git Intelligence

최근 커밋 패턴:
- `da1e683` feat: Story 14-3 + 14-4 — 통계 API + 계정 CRUD + TEA 130건
- `bb2377b` feat: Story 14-2 — DALL-E 3 + 부분 실패 허용 + TEA 65건
- `5068f4c` feat: Story 14-1 — scheduled 상태 + 워커 + 취소 + TEA 60건
- 패턴: feat 접두사, Story 번호 + 핵심 변경 + TEA 건수

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: schema.ts에 variantOf uuid 컬럼 추가 (self-ref FK, ON DELETE SET NULL), snsContentsRelations에 original/variants self-reference 추가, 0023 마이그레이션 생성
- Task 2: sns.ts에 create-variant (수동 복제) + generate-variants (AI 자동 생성, strategy별 프롬프트 5종) 엔드포인트 추가. STRATEGY_PROMPTS 맵 + generateAgentResponse 순차 호출
- Task 3: sns.ts에 PUT /metrics (metadata.metrics에 성과 데이터 저장) + GET /ab-results (engagement score 계산 + winner 자동 판정) 추가. calcEngagement 함수 (views+likes*2+shares*3+clicks*2)
- Task 4: sns.ts GET /sns 목록에 variantOf 쿼리 파라미터 추가 (root→원본만, uuid→특정 원본의 변형만). 목록/상세 응답에 variantOf 필드 포함, 상세에 variants 서브쿼리 추가
- Task 5: shared/types.ts에 SnsContent.variantOf, SnsMetrics, SnsAbResult 타입 추가
- Task 6: sns.tsx에 A/B 테스트 UI 전체 추가 — 변형 복제/AI 생성 모달, 성과 입력 폼, 변형 목록, A/B 결과 비교 뷰(winner 하이라이트), 원본만 보기 필터, 변형 뱃지
- Task 7: turbo build type-check 8/8 성공, 전체 테스트 1021건 통과 (신규 49건 포함)

### File List

- packages/server/src/db/schema.ts (modified — variantOf 컬럼 + self-ref relations)
- packages/server/src/db/migrations/0023_sns-ab-test.sql (new)
- packages/server/src/routes/workspace/sns.ts (modified — A/B 테스트 API 5개 엔드포인트)
- packages/shared/src/types.ts (modified — SnsMetrics, SnsAbResult 타입)
- packages/app/src/pages/sns.tsx (modified — A/B 테스트 UI)
- packages/server/src/__tests__/unit/sns-ab-test.test.ts (new — 49건)
