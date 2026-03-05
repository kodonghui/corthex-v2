# Story 1.8: Docker 배포 파이프라인 + PWA 인프라

Status: done

## Story

As a 관리자,
I want GitHub push 시 자동 배포되고 앱이 PWA로 설치 가능하기를,
so that 코드 변경이 즉시 v2.corthex-hq.com에 반영되고 모바일에서 앱처럼 사용할 수 있다.

## Acceptance Criteria

1. **Given** main 브랜치에 push / **When** GitHub Actions 실행 / **Then** 타입체크 + 빌드 + 격리 테스트 전부 통과 후 Docker ARM64 이미지 빌드
2. **Given** Docker 빌드 성공 / **When** 배포 완료 / **Then** GHCR push → Oracle Cloud VPS 자동 배포 → Cloudflare 캐시 퍼지
3. **Given** 빌드 실행 / **When** 앱 사이드바 확인 / **Then** `#N` 형태 빌드 번호 표시 (`__BUILD_NUMBER__` Vite define — `github.run_number` 기반)
4. **Given** 브라우저에서 앱 접속 / **When** 설치 프롬프트 / **Then** `packages/app/public/manifest.json` 존재 (name="CORTHEX", display="standalone", icons 포함) + `index.html`에 `<link rel="manifest">` 연결
5. **Given** 앱 첫 방문 / **When** Service Worker 등록 / **Then** `sw.js` 기본 설치 완료 (P2에서 Web Push 알림 확장 예정 — 현재는 fetch 이벤트 패스스루만)

## Tasks / Subtasks

- [x] Task 1: 기존 Docker + 배포 파이프라인 동작 확인 (AC: #1~#3)
  - [x] `Dockerfile` 3단계 멀티스테이지 빌드 검증 — ARG BUILD_NUMBER, 정적파일 경로 확인
  - [x] `deploy.yml` 파이프라인 단계 확인 — `|| true` 제거 완료 (Story 1.1)
  - [x] 사이드바 빌드 번호 표시 확인 — `__BUILD_NUMBER__` 사용 중

- [x] Task 2: PWA Web App Manifest 생성 (AC: #4)
  - [x] `packages/app/public/manifest.json` 신규 생성:
    ```json
    {
      "name": "CORTHEX HQ",
      "short_name": "CORTHEX",
      "description": "AI 에이전트 비서 시스템",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#09090b",
      "theme_color": "#6366f1",
      "icons": [
        { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
        { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
      ]
    }
    ```
  - [x] `packages/app/public/icons/` 디렉토리 생성 + placeholder 아이콘 파일 추가
  - [x] `packages/app/index.html` 수정 — `<head>` 내 PWA 태그 추가:
    ```html
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#6366f1" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    ```

- [x] Task 3: Service Worker 기본 설치 (AC: #5)
  - [x] `packages/app/public/sw.js` 신규 생성 (패스스루 방식 — P2 Web Push 확장 예정):
    ```javascript
    // Service Worker — P2에서 Web Push 알림 확장 예정
    // 현재: 설치/활성화만, fetch 이벤트는 그대로 통과
    const CACHE_NAME = 'corthex-v1'

    self.addEventListener('install', (event) => {
      self.skipWaiting()
    })

    self.addEventListener('activate', (event) => {
      event.waitUntil(clients.claim())
    })

    // P2에서 push 이벤트 추가 예정
    // self.addEventListener('push', (event) => { ... })
    ```
  - [x] `packages/app/src/main.tsx` 수정 — Service Worker 등록 코드 추가:
    ```typescript
    // Service Worker 등록 (PWA)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          // SW 등록 실패는 앱 동작에 영향 없음
        })
      })
    }
    ```

## Dev Notes

### ⚠️ 현재 코드베이스 상태

**이미 완성된 항목 (검증만 필요):**

| 항목 | 파일 | 상태 | 비고 |
|------|------|------|------|
| Docker 멀티스테이지 빌드 | `Dockerfile` | ✅ 완성 | 3단계, Bun 1.3.10-alpine, ARM64 |
| CI/CD 파이프라인 | `.github/workflows/deploy.yml` | ✅ 완성 | 변경감지→빌드→배포→Cloudflare |
| docker-compose.yml | `docker-compose.yml` | ✅ 완성 | 로컬 개발용 |
| .dockerignore | `.dockerignore` | ✅ 완성 | 의존성/빌드산출물 제외 |
| `__BUILD_NUMBER__` Vite define | `app/vite.config.ts` | ✅ 완성 | `process.env.BUILD_NUMBER` |
| `__BUILD_NUMBER__` Vite define | `admin/vite.config.ts` | ✅ 완성 | 동일 |
| 빌드 번호 사이드바 표시 | `app/src/components/sidebar.tsx` | ✅ 완성 | `#{__BUILD_NUMBER__}` 형식 |
| 정적 파일 서빙 + SPA 폴백 | `server/src/index.ts` | ✅ 완성 | HTML no-cache, 에셋 1년 캐시 |

**신규 생성 필요:**

| 파일 | 용도 |
|------|------|
| `packages/app/public/manifest.json` | PWA Web App Manifest |
| `packages/app/public/icons/icon-192.png` | PWA 아이콘 (192px) |
| `packages/app/public/icons/icon-512.png` | PWA 아이콘 (512px) |
| `packages/app/public/sw.js` | Service Worker (기본 패스스루) |

**소폭 수정 필요:**

| 파일 | 현재 상태 | 수정 내용 |
|------|----------|----------|
| `packages/app/index.html` | `<link rel="manifest">` 없음 | manifest 링크 + theme-color 추가 |
| `packages/app/src/main.tsx` | SW 등록 없음 | SW 등록 코드 추가 |

### deploy.yml 현재 상태 주의

현재 `deploy.yml`의 unit tests 스텝에 `|| true`가 여전히 존재:
```yaml
run: |
  bun test packages/shared/src/__tests__/ || true
  bun test packages/server/src/__tests__/unit/ || true
  bun test packages/app/src/__tests__/ || true
```
→ **Story 1.1에서 제거 예정**. Story 1.1 완료 후 자동으로 테스트 실패 시 CI 차단 동작.

### Dockerfile 핵심 흐름

```
Stage 1 (deps): bun install → node_modules
Stage 2 (builder): ARG BUILD_NUMBER → ENV BUILD_NUMBER → turbo build
  → packages/app/dist/ (USER앱 빌드 결과)
  → packages/admin/dist/ (관리자앱 빌드 결과)
Stage 3 (production):
  → /app/public/app/  (User app 정적 파일)
  → /app/public/admin/ (Admin app 정적 파일)
  → packages/server/ (서버 소스)
  → CMD: bun run packages/server/src/index.ts
```

`server/src/index.ts`의 정적 서빙:
- `/admin/*` → `/app/public/admin/` + SPA 폴백
- `/*` → `/app/public/app/` + SPA 폴백
- `manifest.json`, `sw.js`는 `public/` 폴더에 있어서 자동으로 포함됨

### PWA 아이콘 임시 생성 방법

```bash
# Bash에서 SVG로 임시 아이콘 생성 (Node/Bun 없이도 가능)
# packages/app/public/icons/ 디렉토리에 placeholder 배치
# 운영에서는 실제 CORTHEX 로고 PNG로 교체 예정
```

### Project Structure Notes

```
packages/app/
├── index.html                  ← <link rel="manifest"> 추가 필요
├── src/
│   └── main.tsx                ← SW 등록 코드 추가 필요
└── public/
    ├── manifest.json           ← 신규 생성 (PWA Manifest)
    ├── sw.js                   ← 신규 생성 (Service Worker)
    └── icons/
        ├── icon-192.png        ← 신규 생성 (임시 placeholder)
        └── icon-512.png        ← 신규 생성 (임시 placeholder)
```

### References

- [Source: epics.md#Story 1.8] — AC 및 story
- [Source: Dockerfile] — 3단계 멀티스테이지, BUILD_NUMBER ARG, 정적파일 경로 `/app/public/`
- [Source: .github/workflows/deploy.yml] — CI/CD 전체 파이프라인 (변경감지→빌드→VPS→Cloudflare)
- [Source: packages/app/vite.config.ts] — `__BUILD_NUMBER__` define, `process.env.BUILD_NUMBER`
- [Source: packages/app/index.html] — 현재 기본 HTML (manifest 링크 없음)
- [Source: packages/server/src/index.ts] — 정적 파일 서빙 + SPA 폴백 + 캐시 헤더 정책

## Dev Agent Record

### Agent Model Used

claude-opus-4-6

### Debug Log References

### Completion Notes List

- ✅ Task 1: Docker + 배포 파이프라인 검증 완료 (Dockerfile 3단계, deploy.yml `|| true` 제거 확인, 빌드 번호 사이드바)
- ✅ Task 2: PWA manifest.json + icons + index.html PWA 태그 추가
- ✅ Task 3: sw.js (패스스루) + main.tsx SW 등록 코드 추가
- ✅ 빌드 성공, 74 tests pass, 0 fail

### Change Log

- 2026-03-05: Story 1.8 구현 완료 — PWA 인프라 (manifest + icons + SW + HTML 메타)

### File List

- packages/app/public/manifest.json (신규 — PWA Web App Manifest)
- packages/app/public/sw.js (신규 — Service Worker 패스스루)
- packages/app/public/icons/icon-192.png (신규 — placeholder)
- packages/app/public/icons/icon-512.png (신규 — placeholder)
- packages/app/index.html (수정 — PWA 메타태그 추가)
- packages/app/src/main.tsx (수정 — SW 등록 코드)
