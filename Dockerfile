# === Stage 1: 의존성 설치 ===
FROM oven/bun:1.3.10-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY packages/app/package.json ./packages/app/
COPY packages/admin/package.json ./packages/admin/
COPY packages/server/package.json ./packages/server/

RUN bun install --frozen-lockfile

# === Stage 2: 전체 빌드 ===
FROM oven/bun:1.3.10-alpine AS builder
WORKDIR /app

# 소스 전체 복사 후 의존성 설치 + 빌드
COPY . .
RUN bun install --frozen-lockfile
RUN bunx turbo build

# === Stage 3: 프로덕션 ===
FROM oven/bun:1.3.10-alpine AS production
WORKDIR /app

# 서버 소스 + 의존 패키지 (소스 직접 실행 — 번들링 이슈 회피)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/packages/server ./packages/server
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/package.json ./

# 프론트엔드 빌드 결과물
COPY --from=builder /app/packages/app/dist ./public/app
COPY --from=builder /app/packages/admin/dist ./public/admin

# Drizzle 마이그레이션
COPY --from=builder /app/packages/server/src/db/migrations ./packages/server/src/db/migrations

ENV NODE_ENV=production
ENV PORT=3000
ENV STATIC_ROOT=./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["bun", "run", "packages/server/src/index.ts"]
