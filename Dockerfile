# === Stage 1: 의존성 설치 ===
FROM oven/bun:1.3.10-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY packages/app/package.json ./packages/app/
COPY packages/admin/package.json ./packages/admin/
COPY packages/server/package.json ./packages/server/
COPY packages/e2e/package.json ./packages/e2e/
COPY packages/landing/package.json ./packages/landing/

RUN bun install --frozen-lockfile

# === Stage 2: 전체 빌드 ===
FROM oven/bun:1.3.10-alpine AS builder
WORKDIR /app

ARG BUILD_NUMBER=dev
ARG GITHUB_SHA=

ENV BUILD_NUMBER=$BUILD_NUMBER
ENV GITHUB_SHA=$GITHUB_SHA

# 빌드 설정 먼저 복사 (레이어 캐싱 — 설정 변경 시에만 재빌드)
COPY turbo.json tsconfig.json package.json bun.lock ./

# deps 스테이지에서 node_modules 재활용 (중복 install 제거)
COPY --from=deps /app/node_modules ./node_modules

# 소스 복사 + 빌드
COPY packages/ ./packages/
RUN bunx turbo build

# === Stage 3: 프로덕션 ===
FROM oven/bun:1.3.10-alpine AS production
WORKDIR /app

# Story 16.1 (D24): Puppeteer ARM64 — Alpine용 시스템 Chromium + 한국어 폰트
# 이유: puppeteer 번들 Chromium은 x64 전용이라 ARM64에서 ENOEXEC 발생
# 해결: apk로 Chromium 설치 + PUPPETEER_EXECUTABLE_PATH로 경로 명시
# 한국어 폰트 (FR-DP2: md_to_pdf 한국어 렌더링 — 두부 문자 방지)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    font-noto \
    font-noto-cjk

# Puppeteer: 번들 Chromium 다운로드 건너뜀 (시스템 Chromium 사용)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 서버 소스 + 의존 패키지 (소스 직접 실행 — 번들링 이슈 회피)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/packages/server ./packages/server
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/package.json ./

# 프론트엔드 빌드 결과물
COPY --from=builder /app/packages/app/dist ./public/app
COPY --from=builder /app/packages/admin/dist ./public/admin

ENV NODE_ENV=production
ENV PORT=3000
ENV STATIC_ROOT=./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

STOPSIGNAL SIGTERM
CMD ["bun", "run", "packages/server/src/index.ts"]
