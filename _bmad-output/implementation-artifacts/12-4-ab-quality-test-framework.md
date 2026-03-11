# Story 12.4: A/B 품질 테스트 프레임워크

Status: done

## Story

As a QA,
I want v1 엔진과 v2 엔진의 응답 품질을 비교하는 것을,
so that 엔진 교체가 품질 저하 없이 이루어졌음을 확인한다.

## Acceptance Criteria

1. 10개 표준 프롬프트 세트 정의 — 다양한 도메인(번역, 코딩, 분석, 요약, 창작)을 커버하는 프롬프트
2. v1 결과 스냅샷 저장 — JSON 파일로 프롬프트+응답+메타데이터(모델, 토큰, 시간) 기록
3. v2 결과 생성 + 비교 매트릭스 — 동일 프롬프트로 v2 실행 후 v1과 나란히 비교
4. 평가 기준 4개: 응답 길이(chars), 도구 호출 수, 핸드오프 체인 깊이, 완성도 점수(1-10 수동)
5. 릴리스 전 수동 실행 가능 (비용 ~$5/회) — CLI 스크립트로 `bun run scripts/ab-test.ts`

## Tasks / Subtasks

- [x] Task 1: 표준 프롬프트 세트 정의 (AC: #1)
  - [x] 1.1 `packages/server/src/__tests__/fixtures/ab-prompts.ts` 생성
  - [x] 1.2 10개 프롬프트 정의 — 각 프롬프트에 id, category, prompt, expectedBehavior 필드
  - [x] 1.3 카테고리: translation(2), coding(2), analysis(2), summary(2), creative(2)

- [x] Task 2: v1 결과 스냅샷 저장 (AC: #2)
  - [x] 2.1 `packages/server/src/__tests__/fixtures/ab-snapshots/v1-baseline.json` 생성
  - [x] 2.2 스냅샷 타입 정의: `ABSnapshot { promptId, model, response, tokenCount, durationMs, toolCallCount, handoffDepth }`
  - [x] 2.3 v1 결과는 수동 캡처 후 JSON 저장 (실제 v1 실행 필요 없음 — 스냅샷 형식만 정의)

- [x] Task 3: A/B 비교 엔진 구현 (AC: #3, #4)
  - [x] 3.1 `packages/server/scripts/ab-quality-test.ts` 생성 — CLI 진입점
  - [x] 3.2 비교 매트릭스 생성: `ABComparisonResult { promptId, v1, v2, delta, scores }`
  - [x] 3.3 평가 기준 4개 구현:
    - 응답 길이 비교 (v2/v1 비율)
    - 도구 호출 수 비교
    - 핸드오프 체인 깊이 비교
    - 완성도 점수 (수동 입력 또는 기본 0)
  - [x] 3.4 결과 출력: 콘솔 테이블 + JSON 파일 저장 (`ab-results-{date}.json`)

- [x] Task 4: 단위 테스트 (AC: #1~#4)
  - [x] 4.1 `packages/server/src/__tests__/unit/story-12-4-ab-quality-test.test.ts` 생성
  - [x] 4.2 프롬프트 세트 검증: 10개 존재, 필수 필드, 카테고리 분포
  - [x] 4.3 비교 로직 테스트: 동일 입력 시 올바른 delta 계산
  - [x] 4.4 스냅샷 형식 검증: 필수 필드 존재
  - [x] 4.5 모킹 테스트: mockSDK로 v2 응답 시뮬레이션 후 비교 매트릭스 생성

- [x] Task 5: package.json 스크립트 등록 (AC: #5)
  - [x] 5.1 `packages/server/package.json`에 `"ab-test": "bun run scripts/ab-quality-test.ts"` 추가

## Dev Notes

### 핵심 아키텍처 규칙

- **D10 (테스트 전략):** A/B 품질 테스트는 릴리스 전 수동 실행, 비용 ~$5/회
- **E9 (SDK 모킹):** 단위 테스트에서는 mockSDK 사용, 실제 A/B 테스트 시에만 실제 SDK 호출
- **NFR-O2:** 응답 품질 A/B 테스트 — 운영 품질 지표

### 기존 코드 재활용 (반드시 사용)

| 헬퍼 | 경로 | 용도 |
|------|------|------|
| `mockSDK` | `packages/server/src/__tests__/helpers/sdk-mock.ts` | 단위 테스트에서 SDK query() 모킹 |
| `mockSDKSequential` | 같은 파일 | 멀티턴 시뮬레이션 |
| `createMockSessionContext` | 같은 파일 | 테스트용 SessionContext 생성 |
| `mockGetDB` | `packages/server/src/__tests__/helpers/db-mock.ts` | DB 모킹 |
| `selectModel` | `packages/server/src/engine/model-selector.ts` | tier→model 매핑 참조 |

### 파일 구조 (정확한 위치)

```
packages/server/
  scripts/
    ab-quality-test.ts          # CLI 진입점 (새로 생성)
  src/
    __tests__/
      fixtures/
        ab-prompts.ts           # 10개 표준 프롬프트 (새로 생성)
        ab-snapshots/
          v1-baseline.json      # v1 결과 스냅샷 (새로 생성)
      unit/
        story-12-4-ab-quality-test.test.ts  # 단위 테스트 (새로 생성)
```

### 타입 정의 (공유 불필요 — 서버 내부 전용)

```typescript
// ab-prompts.ts 내 정의
interface ABPrompt {
  id: string           // 예: 'translate-01'
  category: 'translation' | 'coding' | 'analysis' | 'summary' | 'creative'
  prompt: string       // 실제 프롬프트 텍스트
  expectedBehavior: string  // 기대 동작 설명
}

// ab-quality-test.ts 내 정의
interface ABSnapshot {
  promptId: string
  model: string
  response: string
  tokenCount: number
  durationMs: number
  toolCallCount: number
  handoffDepth: number
}

interface ABComparisonResult {
  promptId: string
  category: string
  v1: ABSnapshot
  v2: ABSnapshot
  delta: {
    responseLengthRatio: number   // v2.length / v1.length
    toolCallDiff: number          // v2.toolCallCount - v1.toolCallCount
    handoffDepthDiff: number      // v2.handoffDepth - v1.handoffDepth
    completenessScore: number     // 1-10 수동 입력 (기본 0)
  }
}
```

### 코딩 컨벤션

- 파일명: kebab-case (`ab-quality-test.ts`, `ab-prompts.ts`)
- Import: `git ls-files` 기준 대소문자 정확히
- bun:test 사용 (vitest 아님)
- API 응답 패턴: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- console.table 사용하여 비교 결과 출력

### Anti-Patterns (하지 말 것)

- v1 코드를 실제 실행하려 하지 말 것 — 스냅샷 JSON 비교만
- engine/ 외부에서 Hook 직접 import 금지 (E8)
- db 직접 import 금지 — getDB(companyId) 사용 (이 스토리에서는 DB 불필요)
- 실제 SDK 호출 테스트는 이 스토리 범위 밖 (수동 실행 시에만)

### Previous Story Intelligence (12.3)

- Story 12.3에서 확립된 패턴: bun:test + 모킹 헬퍼 조합
- scoped-query.test.ts에서 source-level 분석 접근법 사용 — mock leakage 방지
- 전체 테스트 246ms 내 실행 — 30초 CI 한도 여유
- 서버 엔진 에러 코드 프리픽스: AUTH_, AGENT_, SESSION_, HANDOFF_, TOOL_, HOOK_, ORG_, SERVER_

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#D10] — 테스트 전략
- [Source: _bmad-output/planning-artifacts/architecture.md#E9] — SDK 모킹 표준
- [Source: _bmad-output/planning-artifacts/epics.md#Story 12.4] — 에픽 정의
- [Source: packages/server/src/__tests__/helpers/sdk-mock.ts] — SDK 모킹 헬퍼
- [Source: packages/server/src/__tests__/helpers/index.ts] — 헬퍼 배럴 export
- [Source: packages/server/src/engine/model-selector.ts] — tier→model 매핑 참조

### Project Structure Notes

- scripts/ 폴더: 이미 `packages/server/scripts/` 존재 (git status에 ?? 표시)
- fixtures/ 폴더: `packages/server/src/__tests__/fixtures/` 생성 필요
- ab-snapshots/ 폴더: fixtures/ 하위에 생성

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- All 5 tasks complete, 23 unit tests passing in 59ms
- CLI dry-run mode verified with console.table output + JSON report generation
- TypeScript clean (npx tsc --noEmit passes)
- 10 prompts across 5 categories (translation, coding, analysis, summary, creative)
- v1 baseline snapshots with realistic sample data for all 10 prompts
- Comparison engine: delta calculation (length ratio, tool diff, handoff diff, completeness)
- `import.meta.main` guard prevents main() execution during test imports
- `ab-results/` output directory auto-created on demand, not committed

### Change Log

- 2026-03-11: Implemented A/B quality test framework — prompts, snapshots, comparison engine, CLI, 23 tests
- 2026-03-11: Code Review — fixed 2 MEDIUM issues: (1) added ab-results/ to .gitignore (2) report filename uses full timestamp to prevent overwrites. 3 LOW issues accepted.

### File List

- packages/server/src/__tests__/fixtures/ab-prompts.ts (new — 10 standard prompts)
- packages/server/src/__tests__/fixtures/ab-snapshots/v1-baseline.json (new — v1 baseline data)
- packages/server/scripts/ab-quality-test.ts (new — CLI entry + comparison engine)
- packages/server/src/__tests__/unit/story-12-4-ab-quality-test.test.ts (new — 23 unit tests)
- packages/server/package.json (modified — added ab-test script)
- .gitignore (modified — added ab-results/ exclusion)
- _bmad-output/implementation-artifacts/12-4-ab-quality-test-framework.md (story file)
- _bmad-output/implementation-artifacts/sprint-status.yaml (status update)
- _bmad-output/test-artifacts/12-4-tea-automation-summary.md (TEA summary)
