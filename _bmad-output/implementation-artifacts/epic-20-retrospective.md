# Epic 20 Retrospective: Platform Extensions

## Overview

| Metric | Value |
|--------|-------|
| Epic | 20 — Platform Extensions |
| Stories | 5/5 completed |
| Total SP | 16 |
| Total Tests | 151 (29 + 25 + 35 + 34 + 28) |
| Phase | Phase 3 — Extensions |
| PRD | Vision (Phase 3) |

## Story Summary

| Story | Title | SP | Tests | Key Deliverables |
|-------|-------|-----|-------|-----------------|
| 20-1 | 조직 템플릿 마켓 API + UI | 3 | 29 | orgTemplates 스키마 확장, workspace 마켓 API, admin 마켓 UI, 발행/클론 |
| 20-2 | 에이전트 마켓플레이스 | 3 | 25 | soulTemplates 스키마 확장, 에이전트 마켓 API, admin UI, Soul+도구 임포트 |
| 20-3 | 공개 API + API 키 발급 | 5 | 35 | companyApiKeys 스키마, API 키 생성/인증/로테이션, Rate Limiting, 스코프 제어 |
| 20-4 | 워크플로우 빌더 노코드 비주얼 | 3 | 34 | SVG 기반 WorkflowCanvas, 노드 드래그&드롭, 엣지 연결, 순환 참조 감지, 자동 레이아웃 |
| 20-5 | 플랫폼 통합 테스트 | 2 | 28 | 크로스 스토리 통합 테스트, 멀티 테넌트 격리, API 키 인증 체인, DAG 복합 검증 |

## What Went Well

1. **20-1 → 20-2 패턴 복제 성공**: 템플릿 마켓(20-1)에서 확립한 스키마 확장 + 마켓 API + UI 패턴을 에이전트 마켓플레이스(20-2)에 그대로 적용하여 속도 향상
2. **외부 라이브러리 없이 SVG 캔버스 구현**: 20-4에서 React + SVG만으로 비주얼 워크플로우 빌더를 구현 — 번들 사이즈 최소화 + 완전한 제어권 확보
3. **순수 로직 테스트 전략**: bun:test 환경 한계를 인정하고 React/DOM 테스트 대신 비즈니스 로직(DAG, 필터, 인증, Rate Limit) 중심 테스트로 151개 달성
4. **기존 인프라 재활용**: jsonb 컬럼의 유연성으로 서버 스키마 변경 최소화 (metadata.position 등), 기존 라우트 패턴(workspace/, admin/) 일관 유지
5. **코드 리뷰 품질**: 20-4에서 `alert()` → `setCycleWarning()` 전환, 인라인 객체 → 모듈 레벨 상수(`MARKER_MAP`) 등 실질적 개선 발견

## What Could Be Improved

1. **함수 복제 패턴**: 5개 테스트 파일에서 동일 헬퍼 함수가 반복 복제됨 (filterMarketTemplates, buildDagLayers 등). 공통 테스트 유틸 모듈로 추출하면 유지보수 개선
2. **20-3 API 키의 실제 미들웨어 통합 부재**: API 키 생성/인증 로직은 구현했으나 Hono 미들웨어로의 실제 통합(routes에서 API 키 인증 체크)은 미완성 — 실제 사용 시 추가 작업 필요
3. **SVG 캔버스 접근성**: 20-4 WorkflowCanvas가 키보드 네비게이션, 스크린리더 지원 미구현 — 접근성 요구사항 발생 시 개선 필요
4. **Math.random() ID 생성**: 테스트에서 UUID 생성 시 Math.random() 사용 — 테스트 재현성(reproducibility) 약화. 시퀀셜 카운터 패턴이 더 나음

## Technical Debt

1. **테스트 헬퍼 중복**: 5개 파일에 걸쳐 ~300줄의 중복 헬퍼 함수 — 공통 모듈 추출 필요
2. **API 키 미들웨어**: 키 인증 로직은 있으나 실제 라우트 미들웨어로 통합되지 않음
3. **SVG 캔버스 성능**: 노드 50개 이상에서의 성능 미검증 — 대규모 워크플로우 시 가상화 필요 가능
4. **마켓 정렬/페이지네이션**: 템플릿/에이전트 마켓에서 서버사이드 정렬(인기순, 최신순) 및 페이지네이션 미구현

## Architecture Decisions

1. **마켓 패턴 통일**: orgTemplates와 soulTemplates에 동일한 isPublished/downloadCount/tags 패턴 적용 — 일관된 마켓 UX 제공
2. **SVG over Canvas API**: HTML5 Canvas 대신 React+SVG 선택 — React 상태 관리와 자연스러운 통합, 이벤트 핸들링 단순화
3. **buildDagLayers 이중 구현**: workflows.tsx(배열 반환)와 workflow-canvas.tsx(null 반환=순환 감지) 두 버전 공존 — 역할 분리(실행 vs UI)
4. **API 키 SHA-256 해시**: 원문 키는 생성 시 1회만 반환, 서버에는 해시만 저장 — 업계 표준 보안 패턴

## Epic 19 회고 액션 아이템 추적

| 액션 아이템 | 상태 | 비고 |
|------------|------|------|
| N+1 쿼리 최적화 | ⏳ | 마켓 API에서는 의식적으로 배치 쿼리 사용, 하지만 근본적 해결 미완 |
| DOM 테스트 추가 | ❌ | 여전히 bun:test 환경 한계로 미구현 |
| 스키마 설계 시 보안 선반영 | ✅ | 20-3에서 API 키 스코프/만료/비활성화를 설계 단계부터 반영 |

## Metrics

- **총 신규 파일**: ~15개 (서버 라우트 3, 스키마 확장 2, 테스트 5, admin UI 4, 컴포넌트 1)
- **총 수정 파일**: ~10개 (schema.ts, index.ts, sidebar.tsx, App.tsx, workflows.tsx 등)
- **테스트 커버리지**: 151 tests / 293 expect() / 0 failures
- **빌드**: server + admin 모두 clean

## Lessons Learned

1. **패턴 복제는 강력한 속도 부스터**: 20-1의 마켓 패턴을 20-2에 그대로 적용하면서 설계 시간을 크게 절약. 잘 만든 첫 번째 스토리가 이후 스토리의 템플릿이 됨
2. **외부 라이브러리 없는 SVG는 가능하지만 노력 필요**: workflow-canvas.tsx가 ~830줄로 커짐. 프로덕션 수준에서는 React Flow 같은 라이브러리 고려 가치 있음
3. **통합 테스트는 마지막에 한 번 모아서**: 개별 스토리 단위 테스트 후 마지막 스토리에서 크로스 스토리 통합 테스트를 모아서 작성하는 패턴이 효과적
4. **API 키 보안은 설계부터**: SHA-256 해시, 스코프 제어, Rate Limiting, 키 로테이션 — 보안 기능을 나중에 추가하면 비용이 기하급수적으로 증가

## Recommendations for Future Work

1. **테스트 헬퍼 모듈 추출**: `packages/server/src/__tests__/helpers/` 디렉토리에 공통 함수 모듈화
2. **API 키 미들웨어 통합**: 실제 라우트에 apiKeyAuth 미들웨어 적용하여 외부 API 엔드포인트 오픈
3. **마켓 검색 고도화**: 서버사이드 페이지네이션, 정렬(인기순/최신순), 카테고리 트리
4. **워크플로우 캔버스 성능 테스트**: 대규모 그래프(50+ 노드)에서의 렌더링 성능 벤치마크
