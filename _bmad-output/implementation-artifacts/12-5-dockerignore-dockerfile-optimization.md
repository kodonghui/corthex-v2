# Story 12.5: .dockerignore + Dockerfile 최적화

Status: done

## Story

As a DevOps,
I want .dockerignore와 Dockerfile을 최적화하여,
so that 이미지 크기와 빌드 시간이 최적화된다.

## Acceptance Criteria

1. `.dockerignore` 업데이트: `.github/`, `_bmad*`, `_poc/`, `_uxui*`, 테스트 파일, dev configs, docs, `node_modules`, `.git` 등 불필요 파일 제외
2. Dockerfile COPY 목록: 새 의존성 반영 (현재 패키지 구조와 일치)
3. ARM64 Docker 빌드 확인 (Oracle VPS ARM64 네이티브)
4. 이미지 크기 < 500MB
5. 기존 `STOPSIGNAL SIGTERM` 보존 (Story 4.4에서 추가됨)
6. 멀티스테이지 빌드 최적화 (레이어 캐싱 개선)

## Tasks / Subtasks

- [x] Task 1: `.dockerignore` 최적화 (AC: #1)
  - [x] 1.1 현재 `.dockerignore` 분석
  - [x] 1.2 추가 제외 항목 적용: `_enhancement-plans/`, `_tools-idea/`, `kodonghui_full_pipeline/`, `memory/`, `nanobanana-output/`, `uploads/`, `docs/`, `README.md`, `DEPLOYMENT.md`, `CLAUDE.md`, `docker-compose.yml`, `test_auto_accept_real.txt`, `**/__tests__/`, `**/*.test.ts`, `**/*.spec.ts`, `.env.example`
  - [x] 1.3 빌드 컨텍스트 감소 확인: 60MB+ → 33.6MB (46% 감소)

- [x] Task 2: Dockerfile 멀티스테이지 최적화 (AC: #2, #3, #6)
  - [x] 2.1 Stage 1 (deps) 유지: package.json + bun.lock 레이어 캐싱 ✓
  - [x] 2.2 Stage 2 (builder) 최적화: `COPY --from=deps node_modules` 재활용, `bun install` 중복 제거, turbo.json/tsconfig.json 별도 COPY
  - [x] 2.3 Stage 3 (production) 검증: `--production` 플래그는 Bun 워크스페이스 호환 불가 확인, deps stage 전체 node_modules 유지 (안정성 우선), 중복 migrations COPY 제거
  - [x] 2.4 `STOPSIGNAL SIGTERM` 보존 확인 ✓

- [x] Task 3: 이미지 크기 검증 (AC: #4)
  - [x] 3.1 최적화 전: 499MB
  - [x] 3.2 최적화 후: 495MB
  - [x] 3.3 500MB 미만 확인 ✓ (495MB < 500MB)

- [x] Task 4: ARM64 빌드 확인 (AC: #3)
  - [x] 4.1 `docker build` 성공 ✓ (Oracle VPS ARM64 네이티브)
  - [x] 4.2 컨테이너 시작 + healthcheck 통과 ✓ (curl /api/health → {"status":"ok"})

## Dev Notes

### 현재 상태 분석

**현재 `.dockerignore` (20줄):**
이미 주요 항목 대부분 포함. 추가 필요 항목은 `_enhancement-plans/`, `_tools-idea/`, `kodonghui_full_pipeline/`, `memory/`, `nanobanana-output/`, `uploads/`, `docs/`, 테스트 파일, dev 전용 문서.

**현재 Dockerfile 문제점:**
1. **Stage 2 (builder)에서 `bun install` 중복**: Stage 1 (deps)에서 이미 install했는데 Stage 2에서 `COPY . .` 후 다시 `bun install --frozen-lockfile` 실행 → 빌드 시간 낭비
2. **`COPY . .`로 불필요 파일 포함**: `.dockerignore`로 일부 제외하지만, 테스트 파일 등 빌드에 불필요한 파일이 여전히 포함
3. **Production stage에 devDependencies 포함**: `COPY --from=deps /app/node_modules` 는 전체 의존성 복사
4. **migrations COPY 중복**: `packages/server` 전체 복사 후 migrations 별도 복사 (이미 포함됨)

### 아키텍처 컴플라이언스
- [Source: architecture.md] D10: Docker 빌드는 ARM64 네이티브 (Oracle VPS)
- [Source: architecture.md] CI/CD: GitHub Actions self-hosted runner, 동일 서버
- [Source: deploy.yml] 빌드 args: `BUILD_NUMBER`, `GITHUB_SHA`
- [Source: Dockerfile:56] `STOPSIGNAL SIGTERM` — Story 4.4에서 추가, 절대 제거 금지

### 패키지 구조 (현재)
```
packages/
  shared/    → package.json (빌드 필요, 프로덕션 필요)
  ui/        → package.json (빌드 필요, 프로덕션 불필요 — 앱에 번들링)
  app/       → package.json (빌드 필요, dist만 프로덕션 필요)
  admin/     → package.json (빌드 필요, dist만 프로덕션 필요)
  server/    → package.json (빌드 불필요 — Bun 직접 실행, 프로덕션 필요)
  e2e/       → package.json (테스트 전용, 프로덕션 불필요)
```

### Project Structure Notes

- Monorepo: Turborepo, 6 패키지
- Root `package.json` + `bun.lock` + `turbo.json` + `tsconfig.json` 빌드에 필요
- `packages/e2e/` package.json은 lockfile 호환성을 위해 deps stage에 포함 필요
- `.github/` 이미 제외됨 ✓

### References

- [Source: Dockerfile] 현재 멀티스테이지 3단계 구성
- [Source: .dockerignore] 현재 20줄 제외 규칙
- [Source: .github/workflows/deploy.yml] CI/CD 파이프라인, docker build 명령
- [Source: docker-compose.yml] 로컬 개발 docker-compose
- [Source: _bmad-output/planning-artifacts/epics.md#Story-12.5] AC 정의
- [Source: _bmad-output/planning-artifacts/architecture.md] ARM64, CI/CD 제약사항
- [Source: package.json] 루트 워크스페이스 설정

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- `--production` flag로 prod-deps stage 시도 → `zod-to-json-schema` ENOENT 에러 → Bun 워크스페이스 호환 불가 확인 → deps stage 전체 node_modules로 복귀

### Completion Notes List
- ✅ .dockerignore: 20줄 → 51줄, 빌드 컨텍스트 46% 감소 (60MB+ → 33.6MB)
- ✅ Dockerfile: 3-stage → 3-stage (prod-deps stage 시도 후 호환성 문제로 철회)
- ✅ Builder stage: `bun install` 중복 제거, `COPY --from=deps` 재활용
- ✅ Builder stage: turbo.json/tsconfig.json 별도 COPY로 레이어 캐싱 개선
- ✅ Production stage: 중복 migrations COPY 제거
- ✅ 이미지 크기: 499MB → 495MB (< 500MB ✓)
- ✅ STOPSIGNAL SIGTERM 보존
- ✅ ARM64 빌드 성공 + healthcheck 통과

### File List
- `.dockerignore` — 20줄→51줄 확장 (제외 항목 31개 추가)
- `Dockerfile` — 3-stage 최적화 (builder stage 캐싱 개선, 중복 install/copy 제거)
- `packages/server/src/__tests__/unit/docker-config.test.ts` — 신규 (TEA: 13개 검증 테스트)

### Change Log
- 2026-03-11: .dockerignore 확장 + Dockerfile 멀티스테이지 최적화
