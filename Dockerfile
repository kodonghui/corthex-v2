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

# === Stage 2: 프로덕션 ===
# builder 스테이지 제거 — deploy workflow에서 pre-build 후 결과물만 복사
FROM oven/bun:1.3.10-alpine AS production
WORKDIR /app

# Story 16.1 (D24): Puppeteer ARM64 — Alpine용 시스템 Chromium + 한국어 폰트
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

# 의존성 (deps 스테이지에서 캐싱됨)
COPY --from=deps /app/node_modules ./node_modules

# 서버 소스 + 공유 패키지 (bun이 TypeScript 직접 실행)
COPY packages/server ./packages/server
COPY packages/shared ./packages/shared
COPY package.json ./

# 프론트엔드 빌드 결과물 (deploy workflow에서 pre-build됨)
COPY packages/app/dist ./public/app
COPY packages/admin/dist ./public/admin

ENV NODE_ENV=production
ENV PORT=3000
ENV STATIC_ROOT=./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

STOPSIGNAL SIGTERM
CMD ["bun", "run", "packages/server/src/index.ts"]
