---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests']
lastStep: 'step-03-generate-tests'
lastSaved: '2026-03-11'
story: '12.5'
---

# TEA: Story 12.5 — .dockerignore + Dockerfile 최적화

## Risk Assessment
- **Risk Level**: Low (infrastructure config, no runtime logic)
- **Coverage Target**: critical-paths

## Test File
- `packages/server/src/__tests__/unit/docker-config.test.ts`

## Test Coverage (13 tests)

### .dockerignore (3 tests)
| Test | Risk | Status |
|------|------|--------|
| 필수 제외 항목 포함 | High — 빌드 컨텍스트 크기 | ✅ PASS |
| 환경 파일 제외 | High — 시크릿 유출 방지 | ✅ PASS |
| 개발 전용 문서 제외 | Medium — 빌드 효율 | ✅ PASS |

### Dockerfile (10 tests)
| Test | Risk | Status |
|------|------|--------|
| 파일 존재 | High — 배포 불가 | ✅ PASS |
| 멀티스테이지 빌드 사용 | Medium — 이미지 크기 | ✅ PASS |
| STOPSIGNAL SIGTERM 보존 | High — Graceful shutdown | ✅ PASS |
| HEALTHCHECK 설정 포함 | High — 컨테이너 모니터링 | ✅ PASS |
| 빌드 인수 포함 | Medium — 배포 추적 | ✅ PASS |
| 프로덕션 환경 설정 | High — 런타임 설정 | ✅ PASS |
| deps 스테이지 node_modules 재활용 | Medium — 빌드 캐싱 | ✅ PASS |
| 프론트엔드 빌드 결과물 복사 | High — UI 서빙 | ✅ PASS |
| 워크스페이스 package.json 복사 | High — lockfile 호환 | ✅ PASS |
| builder에서 bun install 중복 없음 | Medium — 빌드 시간 | ✅ PASS |

## Results
- **13/13 PASS** (0 failures)
- **38 expect() calls**
- **Execution time**: 87ms
