# CORTHEX v2

> **AI 직원 운영 플랫폼** — 회사 안에 AI 에이전트를 팀원으로 배치하고, 실제 업무를 위임·자동화하는 멀티테넌트 SaaS

[![Deploy](https://github.com/kodonghui/corthex-v2/actions/workflows/deploy.yml/badge.svg)](https://github.com/kodonghui/corthex-v2/actions/workflows/deploy.yml)
[![CI](https://github.com/kodonghui/corthex-v2/actions/workflows/ci.yml/badge.svg)](https://github.com/kodonghui/corthex-v2/actions/workflows/ci.yml)

---

## 목차

- [개요](#개요)
- [핵심 기능](#핵심-기능)
- [아키텍처](#아키텍처)
- [기술 스택](#기술-스택)
- [디렉터리 구조](#디렉터리-구조)
- [로컬 개발 환경](#로컬-개발-환경)
- [환경변수](#환경변수)
- [배포](#배포)
- [API 구조](#api-구조)
- [데이터베이스 스키마](#데이터베이스-스키마)

---

## 개요

CORTHEX는 기업이 AI 에이전트를 **진짜 직원처럼** 조직에 배치할 수 있게 해주는 플랫폼입니다.

- 관리자가 부서·인간 직원·AI 직원을 자유롭게 생성·수정·삭제
- AI 에이전트가 인간 직원의 **Claude CLI 토큰**으로 실제 작업 수행
- 채팅, 업무 위임, SNS 발행, 주식 매매, 크론 스케줄링 등 실무 기능 내장
- 멀티테넌트 — 하나의 서버에서 여러 회사가 독립적으로 운영

---

## 핵심 기능

### 직원 앱 (Employee App)

| 기능 | 설명 |
|------|------|
| **커맨드 센터** | 모든 AI 에이전트에게 한 번에 명령, 순차 실행, 배치 처리 |
| **1:1 채팅** | 에이전트와 실시간 대화 (WebSocket, 스트리밍 응답) |
| **아고라 (Agora)** | 에이전트들이 특정 주제를 토론하고 합의 도출 |
| **아르고스 (Argos)** | 외부 이벤트 감지 → 에이전트 자동 트리거 |
| **넥서스 (Nexus)** | 조직도를 그래프로 시각화, 보고 라인 탐색 |
| **업무 위임** | 에이전트에게 작업 위임 → 진행 상황 추적 |
| **SNS 관리** | Instagram·티스토리·네이버 블로그 등 콘텐츠 자동 발행 |
| **주식 트레이딩** | 에이전트가 매수·매도 주문 (실거래 / 페이퍼 모드) |
| **지식 베이스** | 회사 자료를 업로드하여 에이전트가 참조 |
| **크론 스케줄** | 반복 작업 자동화 (분·시·일 단위) |
| **성과 리포트** | 에이전트별 활동 로그, 비용 집계, 성과 대시보드 |
| **메신저** | 직원 간 + 에이전트 포함 단체 채팅 |

### 관리자 패널 (Admin Panel)

| 기능 | 설명 |
|------|------|
| **조직 관리** | 부서·직원·에이전트 CRUD, 조직도 편집 |
| **에이전트 마켓** | 사전 제작된 에이전트 템플릿 구독·배치 |
| **소울 템플릿** | 에이전트 성격·지시문(System Prompt) 템플릿 관리 |
| **CLI 자격증명** | 인간 직원의 Claude CLI 토큰 등록 (AES-256 암호화) |
| **모니터링** | 전체 에이전트 상태, 비용 현황, 에러 로그 |
| **워크플로우** | 에이전트 간 자동화 파이프라인 설계 |
| **온보딩** | 신규 회사 세팅 마법사 |

---

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        클라이언트                           │
│  ┌─────────────────────┐    ┌─────────────────────────┐    │
│  │  Employee App        │    │      Admin Panel         │    │
│  │  (React 19 + Vite)  │    │  (React 19 + Vite)      │    │
│  │  port 5174 (dev)    │    │  port 5173 (dev)         │    │
│  └──────────┬──────────┘    └───────────┬─────────────┘    │
└─────────────┼─────────────────────────────┼─────────────────┘
              │ REST API + WebSocket         │
              ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     API 서버 (Bun + Hono)                   │
│                        port 3000                            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  REST Routes │  │  WebSocket   │  │  Background Jobs │  │
│  │  /api/*      │  │  실시간 채팅  │  │  크론, 트리거     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              AI 에이전트 실행 엔진                     │   │
│  │  AgentRunner → Anthropic SDK (CLI 토큰으로 호출)      │   │
│  │  지원 모델: Claude 3.5/3 Sonnet, GPT-4o, Gemini      │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │  PostgreSQL (Neon)      │
              │  Drizzle ORM            │
              │  ap-southeast-1 (싱가폴) │
              └─────────────────────────┘
```

### 멀티테넌트 구조

```
Platform (슈퍼어드민)
  └── Company A (회사 테넌트)
        ├── Department 1
        │     ├── Human Employee (CEO, 직원)
        │     └── AI Agent (에이전트 - 부서 배치)
        └── Department 2
              └── AI Agent
```

모든 API 요청에 JWT 기반 `TenantContext` 자동 주입 — `companyId` 기준으로 데이터 완전 격리.

### RBAC 권한 체계

| 역할 | 범위 | 권한 |
|------|------|------|
| `super_admin` | 플랫폼 전체 | 모든 회사 관리 |
| `company_admin` | 회사 단위 | 조직 구성, 에이전트 배치 |
| `ceo` | 회사 내 | 전체 에이전트 지휘 |
| `employee` | 부서 내 | 담당 에이전트와 협업 |

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| **런타임** | [Bun](https://bun.sh/) 1.3 |
| **모노레포** | [Turborepo](https://turbo.build/) 2 |
| **프론트엔드** | React 19, Vite 6, Tailwind CSS 4 |
| **상태 관리** | Zustand 5, TanStack Query 5 |
| **백엔드** | [Hono](https://hono.dev/) 4 (Bun 위에서 실행) |
| **데이터베이스** | PostgreSQL (Neon Serverless), Drizzle ORM |
| **AI SDK** | `@anthropic-ai/sdk`, OpenAI SDK, Google Generative AI |
| **실시간** | WebSocket (Hono WS) |
| **컨테이너** | Docker (멀티스테이지 빌드), `oven/bun:alpine` 베이스 |
| **CI/CD** | GitHub Actions → Self-hosted Runner (Oracle VPS ARM64) |
| **CDN** | Cloudflare (자동 캐시 퍼지) |
| **E2E 테스트** | Playwright |

---

## 디렉터리 구조

```
corthex-v2/
├── packages/
│   ├── app/          # 직원용 React 앱 (23개 페이지)
│   ├── admin/        # 관리자 패널 React 앱 (19개 페이지)
│   ├── server/       # Bun + Hono API 서버
│   │   └── src/
│   │       ├── routes/       # REST API 라우트
│   │       │   ├── workspace/  # 직원 앱 API
│   │       │   ├── admin/      # 관리자 API
│   │       │   └── auth.ts     # 인증
│   │       ├── services/     # 비즈니스 로직
│   │       │   ├── agent-runner.ts       # AI 에이전트 실행
│   │       │   ├── command-router.ts     # 커맨드 라우팅
│   │       │   ├── agora-engine.ts       # 토론 엔진
│   │       │   ├── argos-service.ts      # 이벤트 트리거
│   │       │   ├── credential-vault.ts   # 암호화 자격증명
│   │       │   └── chief-of-staff.ts     # 오케스트레이션
│   │       ├── db/           # Drizzle 스키마 + 마이그레이션
│   │       ├── middleware/   # 인증, RBAC, 로깅
│   │       └── ws/           # WebSocket 핸들러
│   ├── shared/       # 공유 타입, 유틸리티
│   ├── ui/           # 공유 UI 컴포넌트
│   └── e2e/          # Playwright E2E 테스트
├── .github/
│   └── workflows/
│       ├── ci.yml      # 빌드 + 타입체크 + 테스트
│       └── deploy.yml  # 자동 배포 (Docker)
├── Dockerfile          # 멀티스테이지 빌드
└── turbo.json          # Turborepo 파이프라인
```

---

## 로컬 개발 환경

### 요구사항

- [Bun](https://bun.sh/) 1.3+
- PostgreSQL (또는 [Neon](https://neon.tech/) 무료 티어)

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/kodonghui/corthex-v2.git
cd corthex-v2

# 2. 의존성 설치
bun install

# 3. 환경변수 설정
cp .env.example .env
# .env 파일을 열어 실제 값으로 수정

# 4. DB 마이그레이션
bun run db:migrate

# 5. 전체 개발 서버 시작 (API + App + Admin 동시)
bun run dev
```

각 앱 개별 실행:

```bash
bun run dev:server   # API 서버 → http://localhost:3000
bun run dev:app      # 직원 앱  → http://localhost:5174
bun run dev:admin    # 관리자   → http://localhost:5173
```

### 타입 체크 및 테스트

```bash
# TypeScript 타입 검사
npx tsc --noEmit -p packages/server/tsconfig.json

# 단위 테스트
bun run test

# 전체 빌드 검증
bun run build
```

---

## 환경변수

`.env.example`을 복사해서 `.env`로 사용하세요.

| 변수 | 설명 | 필수 |
|------|------|------|
| `PORT` | 서버 포트 (기본: 3000) | ✅ |
| `DATABASE_URL` | PostgreSQL 연결 문자열 | ✅ |
| `JWT_SECRET` | JWT 서명 키 (32자 이상 권장) | ✅ |
| `ENCRYPTION_KEY` | CLI 토큰 암호화 키 (정확히 32바이트) | ✅ |
| `NOTION_V2_PAGE_ID` | Notion 연동 페이지 ID | 선택 |
| `NOTION_DEV_LOG_DB_ID` | Notion 개발 로그 DB ID | 선택 |

> **보안 주의**: `.env` 파일은 절대 git에 올리지 마세요. `.gitignore`에 이미 포함되어 있습니다.

---

## 배포

`main` 브랜치에 push하면 **자동 배포**됩니다.

```
git push origin main
  ↓
GitHub Actions (self-hosted runner, Oracle VPS ARM64)
  ↓
Docker 멀티스테이지 빌드 (deps → builder → production)
  ↓
컨테이너 교체 (zero-downtime: 새 컨테이너 시작 후 헬스체크)
  ↓
Cloudflare 캐시 자동 퍼지
```

| 워크플로우 | 역할 |
|------|------|
| `ci.yml` | 빌드 + 타입체크 + 테스트 (검증용) |
| `deploy.yml` | 실제 서버 배포 (이게 실패하면 배포 안 됨) |

> 커밋 전 `npx tsc --noEmit -p packages/server/tsconfig.json`으로 타입 에러 반드시 확인.

---

## API 구조

```
/api/
├── health                    # 헬스체크
├── auth/
│   ├── login                 # 직원 로그인 (JWT)
│   └── admin/login           # 관리자 로그인
├── workspace/                # 직원 앱 API (JWT 인증 필요)
│   ├── agents/               # 에이전트 목록·채팅·위임
│   ├── commands/             # 커맨드 센터 (전체 명령)
│   ├── jobs/                 # 작업 큐
│   ├── sns/                  # SNS 발행
│   ├── knowledge/            # 지식 베이스
│   ├── trading/              # 주식 트레이딩
│   ├── debates/              # 아고라 토론
│   ├── argos/                # 이벤트 트리거
│   ├── schedules/            # 크론 스케줄
│   ├── reports/              # 성과 리포트
│   └── ...
└── admin/                    # 관리자 API
    ├── employees/            # 직원 관리
    ├── agents/               # 에이전트 배치
    ├── departments/          # 부서 관리
    ├── credentials/          # CLI 토큰 관리
    ├── org-chart/            # 조직도
    └── ...
```

응답 형식:

```json
// 성공
{ "data": { ... } }

// 실패
{ "error": { "code": "UNAUTHORIZED", "message": "인증이 필요합니다" } }
```

---

## 데이터베이스 스키마

주요 테이블:

| 테이블 | 설명 |
|--------|------|
| `companies` | 테넌트 (회사) |
| `users` | 인간 직원 (CEO, 직원) |
| `admin_users` | 관리자 계정 |
| `agents` | AI 에이전트 (tier: manager / specialist / worker) |
| `departments` | 부서 |
| `cli_credentials` | CLI 토큰 (AES-256-GCM 암호화 저장) |
| `conversations` | 채팅 대화 |
| `messages` | 채팅 메시지 (스트리밍) |
| `delegations` | 에이전트 업무 위임 |
| `jobs` | 작업 큐 (queued → processing → completed) |
| `sns_posts` | SNS 발행 대기 / 완료 |
| `trading_orders` | 주식 주문 (실거래 / 페이퍼) |
| `debates` | 아고라 토론 세션 |
| `argos_events` | 외부 이벤트 트리거 |
| `knowledge_items` | 지식 베이스 문서 |
| `cron_jobs` | 반복 스케줄 |
| `activity_logs` | 전체 활동 로그 |
| `cost_logs` | AI 호출 비용 집계 |

---

## 라이선스

Private — 무단 사용·배포 금지
