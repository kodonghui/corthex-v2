# Story 20.5: 플랫폼 통합 테스트

Status: done

## Story

As a Developer/QA,
I want comprehensive integration tests that verify all Epic 20 platform extension features work together correctly,
so that I can ensure cross-feature interactions (template market + agent marketplace + public API + workflow canvas) are stable and regressions are caught early.

## Acceptance Criteria

1. **크로스 스토리 통합 테스트**: Epic 20의 4개 스토리(20-1~20-4)의 핵심 로직이 상호 연동되는 시나리오 테스트 — 최소 20개 테스트 케이스
2. **테넌트 격리 검증**: 템플릿 마켓과 에이전트 마켓에서 companyId 기반 격리가 정상 동작하는지 검증 (자기 회사 제외, 다른 회사 공개 항목만 조회)
3. **API 키 인증 흐름**: 공개 API 키 생성 → 인증 → 스코프 검증 → Rate Limiting 전체 흐름 통합 테스트
4. **워크플로우 캔버스 로직 통합**: buildDagLayers ↔ autoLayout ↔ cycle detection이 복합 그래프에서도 정상 동작 검증
5. **마켓 발행/클론 전체 흐름**: 템플릿 발행 → 마켓 조회 → 클론 → 다운로드 카운트 증가 전체 플로우
6. **기존 테스트 회귀 없음**: 기존 123개 Epic 20 단위 테스트가 모두 통과 유지
7. **테스트 합계**: Epic 20 전체 테스트 합계 150개 이상

## Tasks / Subtasks

- [x] Task 1: 크로스 스토리 통합 테스트 작성 (AC: #1, #2, #5)
  - [x] 1.1 템플릿 마켓 발행→조회→클론→카운트 전체 플로우 테스트
  - [x] 1.2 에이전트 마켓 발행→조회→임포트→카운트 전체 플로우 테스트
  - [x] 1.3 멀티 테넌트 격리 테스트: 회사A 발행 → 회사B만 조회 가능 → 회사A는 자기 것 안 보임
  - [x] 1.4 마켓 검색/필터 통합 테스트 (키워드, 태그, 카테고리, 티어)

- [x] Task 2: API 키 인증 통합 테스트 (AC: #3)
  - [x] 2.1 키 생성 → SHA-256 해시 → 인증 → 스코프 검증 전체 흐름
  - [x] 2.2 Rate Limiting 통합: 한도 내/초과/윈도우 리셋 시나리오
  - [x] 2.3 키 로테이션: 구 키 비활성화 → 신 키 발급 → 구 키로 인증 실패 → 신 키로 인증 성공
  - [x] 2.4 만료 키 통합: 만료 전 인증 성공 → 만료 후 인증 실패

- [x] Task 3: 워크플로우 캔버스 로직 통합 (AC: #4)
  - [x] 3.1 복합 DAG: 10+ 노드 그래프에서 buildDagLayers + autoLayout 정합성
  - [x] 3.2 엣지 추가/제거 후 DAG 재계산 정합성
  - [x] 3.3 Condition 분기(trueBranch/falseBranch) + dependsOn 혼합 그래프 테스트
  - [x] 3.4 순환 참조 감지: wouldCreateCycle과 buildDagLayers 일관성 검증

- [x] Task 4: 회귀 테스트 + 합계 검증 (AC: #6, #7)
  - [x] 4.1 기존 4개 테스트 파일 전부 실행하여 회귀 없음 확인
  - [x] 4.2 통합 테스트 포함 전체 Epic 20 테스트 합계 150개 이상 확인

## Dev Notes

### 기존 코드 현황 분석

**기존 Epic 20 테스트 (123개):**
- `template-market.test.ts` — 29 tests, 51 expects (Zod 스키마, 발행/클론/검색/필터 로직)
- `agent-marketplace.test.ts` — 25 tests, 34 expects (Zod 스키마, 발행/임포트/검색/필터 로직)
- `public-api-keys.test.ts` — 35 tests, 46 expects (키 생성, 인증, Rate Limiting, 스코프, 로테이션)
- `workflow-canvas-tea.test.ts` — 34 tests, 60 expects (buildDagLayers, autoLayout, buildEdges, wouldCreateCycle)

**통합 테스트 패턴 (기존 프로젝트):**
- `tenant-integration.test.ts` — Hono 앱 + 미들웨어 체인으로 통합 테스트
- bun:test 사용, 외부 DB 없이 순수 로직 테스트
- 2개 회사(COMPANY_A, COMPANY_B) 상수로 멀티 테넌트 시나리오

### 핵심 패턴

**통합 테스트 전략:**
- DB 없이 순수 로직 함수의 상호작용 테스트
- Zod 스키마 검증 → 비즈니스 로직 → 결과 검증 체이닝
- 실제 DB 연결 필요한 테스트는 제외 (bun:test 환경 제한)

**테스트 범위:**
- 크로스 스토리: 각 스토리의 핵심 함수들이 함께 사용될 때의 정합성
- 테넌트 격리: companyId 필터링 로직의 다양한 시나리오
- 인증 흐름: 키 생성→해시→검증→스코프→Rate Limit 체인
- DAG 복합: 대규모 그래프에서의 알고리즘 정확성

### 서버 변경 없음

- 순수 테스트 파일 추가만 (소스 코드 변경 없음)
- 기존 테스트에 영향 없음

### Project Structure Notes

- 테스트: `packages/server/src/__tests__/unit/platform-integration.test.ts` (NEW)

## Dev Agent Record

### Implementation Plan
- 순수 테스트 파일 1개 추가 (소스 코드 변경 없음)
- 기존 4개 단위 테스트의 핵심 함수를 재사용하여 크로스 스토리 통합 시나리오 테스트
- 3개 회사 상수(COMPANY_A, B, C)로 멀티 테넌트 격리 검증

### Debug Log
- 초기 작성 시 condition 분기 + dependsOn 혼합 그래프의 dependsOn 엣지 수 오류 (4→5 수정)
- 수정 후 28개 테스트 전부 통과

### Completion Notes
- platform-integration.test.ts: 28 tests, 102 expect() calls
- Task 1 (크로스 스토리): 13 tests — 마켓 발행/클론/임포트 플로우 + 멀티 테넌트 격리 + 검색/필터
- Task 2 (API 키 인증): 7 tests — 생성→해시→인증→스코프→Rate Limit 체인 + 로테이션 + 만료
- Task 3 (워크플로우 캔버스): 6 tests — 10노드 복합 DAG + 엣지 추가/제거 + 조건 분기 + 순환 참조
- Task 4 (회귀 + 합계): 3 tests — 격리 일관성 + Zod 스키마 + 노드 타입 호환성
- Epic 20 전체: 151 tests, 293 expect(), 0 failures (기존 123 + 신규 28)

## File List

- `packages/server/src/__tests__/unit/platform-integration.test.ts` (NEW) — 크로스 스토리 통합 테스트
- `_bmad-output/implementation-artifacts/20-5-platform-integration-test.md` (MODIFIED) — 스토리 파일 업데이트
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (MODIFIED) — 상태 업데이트

## Change Log

- 2026-03-09: Story 20-5 구현 완료 — 28개 통합 테스트 작성, Epic 20 총 151개 테스트

### References

- [Source: packages/server/src/__tests__/unit/template-market.test.ts] — 20-1 테스트 (29)
- [Source: packages/server/src/__tests__/unit/agent-marketplace.test.ts] — 20-2 테스트 (25)
- [Source: packages/server/src/__tests__/unit/public-api-keys.test.ts] — 20-3 테스트 (35)
- [Source: packages/server/src/__tests__/unit/workflow-canvas-tea.test.ts] — 20-4 테스트 (34)
- [Source: packages/server/src/__tests__/unit/tenant-integration.test.ts] — 통합 테스트 패턴 참조
