# CORTHEX v2 Project Memory

## Workflow Rules
- **작업 완료 시 커밋 + 푸시까지 자동으로** (B 옵션 채택, 2026-03-04)
  - main 브랜치 직접 push → GitHub Actions 자동 배포
  - 배포 후 Cloudflare 캐시 자동 퍼지
  - 빌드 번호: `github.run_number` (#1, #2, #3...) — 사이드바에 표시
  - 작업 끝나면 매번 물어보지 말고 바로 커밋+푸시

## Deploy Pipeline
- Push to main → CI (build + type-check + test) → Docker build (ARM64) → GHCR push → Oracle VPS deploy → Cloudflare cache purge
- Deploy workflow: `.github/workflows/deploy.yml`
- Docker image: `ghcr.io/kodonghui/corthex-v2`

## Tech Stack
- Monorepo: Turborepo (packages/admin, app, ui, shared, server)
- Frontend: React 19 + Vite 6 + Tailwind CSS 4
- Backend: Bun + Hono
- DB: PostgreSQL + Drizzle ORM
- State: Zustand + TanStack Query
- Build numbers injected via Vite `define` → `__BUILD_NUMBER__`, `__BUILD_HASH__`

## ⚠️ 에이전트 두뇌: "CLI 토큰" 방식 (용어 주의)
- **핵심 구조**: 인간 직원(유저) 각자가 본인의 Claude CLI Max 구독 토큰을 등록 → AI 에이전트가 응답할 때 그 인간 직원의 토큰으로 실행 → 비용은 해당 인간 직원 구독료에서 차감
  - 예: 회사 A에 인간 직원 3명 → 각자 토큰 등록 → 각자 구독에서 비용 차감
- **구현**: `@anthropic-ai/sdk` 사용 + `cliCredentials` 테이블에서 `userId` 기준 토큰 조회 → API key로 주입 → ✅ 올바른 구현
- **사용자가 싫어하는 표현**: "Claude API로 호출" "API 방식" → 사용자는 이걸 "API 과금 방식"으로 이해함
- **올바른 표현**: "CLI 토큰으로 호출" "인간 직원의 CLI 구독으로 실행"
- **`@anthropic-ai/claude-code` SDK는 사용 안 함** — CLI 서브프로세스 방식 아님
- `cliCredentials` 테이블 = `claude login`으로 얻은 CLI Max 구독 토큰 저장 (AES-256-GCM 암호화), `userId` + `companyId` 기준 조회

## BMAD Workflow
- 설치 경로: `_bmad/bmm/`
- 기획 산출물: `_bmad-output/planning-artifacts/`
- 완료: Product Brief, PRD (rev3), Architecture (28 decisions), UX Design (rev9)
- UX rev6: P1 완전 스펙 — 31개 미결 해소 + Global UI 폴리시 + 컴포넌트 Phase A-D + 화면간 네비게이션
- UX rev7: P2 완전 스펙 — 전략실/야간작업/보고서/파일관리 56개 결정 + WebSocket P2 이벤트 4종 + Phase E 신설(UploadZone/RadioGroup) + 실투자 경고 3곳 + KIS 미연동 정책 + 모바일 Accordion
- UX rev8: P3 완전 스펙 — SNS/메신저/대시보드/작전일지P3/소울편집/PWA 88개 결정 + Phase F 신설(LineChart/StatCard/DateRangePicker/SoulEditor) + WebSocket P3 이벤트 6종 + 다크모드 수동토글 + 이메일 알림 설정
- UX rev9: P4 완전 스펙 — NEXUS 스케치바이브/MCP 연동/메신저 파일첨부 79개 결정 + Phase G 신설(AgentNode/DepartmentNode/NexusCanvas/NexusEditPanel/NexusInfoPanel) + WebSocket P4 이벤트(nexus-updated) + Admin 9.11 조직도 관리
- Epics: `_bmad-output/planning-artifacts/epics.md`
  - **파티모드 승인 + 수정 완료**: E1(9), E2(8), E3(5), E4(7), E5(3), E6(6), E8(5), E9(7), E10(9→분리 후), E11(6), E12(4), E13(3), E14(5→분리 후), E15(5→재순서), E16(6), E17(5→재순서), E18(4)
  - **파티모드 완료 (수정 미적용)**: E7(4) — 12개 이슈 발견, 유저 스킵 선택
  - **다음 할 일**: Step-04 final validation (`C` 입력)
  - **중요 규칙**: 에픽 파티모드 없이 다음 에픽으로 절대 넘어가지 말 것
  - 파티모드 진행 방식: Round1(John/PM+Winston/Architect+Bob/SM+Sally/UX) → [2] → Round2(Quinn/QA+Amelia/Dev) → [C] 수정 적용 or [E] 종료
  - 전략: P1(E3~E6) 상세히, P2~P4 핵심 AC만 간략히 (이미 반영됨)
- `/create-epics-and-stories` **완전 완료** — Step-01~04 모두 통과 (2026-03-04)
- `/sprint-planning` **완료** — `_bmad-output/implementation-artifacts/sprint-status.yaml` 생성 (18 에픽, 111 스토리)
- `/create-story` **Epic 1 전체 완료** — 1.1~1.9 스토리 파일 모두 생성 (2026-03-05)
  - 스토리 파일 위치: `_bmad-output/implementation-artifacts/`
- **Story 1.1 완료** — dev-story + code-review 통과 → done (빌드 #24)
  - 포트 스왑 (admin 5173, app 5174), deploy.yml `||true` 제거, App.tsx git mv
  - code-review: 0 High, 2 Medium(수정완료), 2 Low(참고사항)
  - 다음 할 일: `/bmad-bmm-dev-story` → Story 1.2 (DB Schema P1)

## 구현 워크플로우
- 스토리별: `/bmad-bmm-dev-story` → `/bmad-bmm-code-review` → done
- code-review는 컴팩트 전에 실행 (구현 맥락 유지)
- QA (`/bmad-bmm-qa-generate-e2e-tests`): Epic 단위로 실행 (UI 있는 E3~4 이후 적합)
- Epic 완료 후: `/bmad-bmm-retrospective` (선택)

## 주요 수정 사항 (최근 에픽 참고용)

### E9 주요 수정
- 선행 조건: E8.1 ToolEngine; Mock 테스트 원칙 Epic 레벨 명시
- 9.2: Subject `[CORTHEX] {에이전트명}` 형식; SMTP Mock
- 9.3: take_screenshot ⚠️ P2 분리 (Playwright/Chromium)
- 9.4: Toast → Confirm Modal (실투자 확인)
- 9.5: 재생 버튼(▶) 수동 클릭
- 9.6: Kling 영상 ⚠️ P2; polling 5초/60회/5분/TOOL_003
- 9.7: scheduled_posts + Bull queue; vi.setSystemTime() 테스트

### E10 주요 수정
- 10.1: 소프트 삭제(deleted_at) + onDelete cascade + 삭제 DB 검증
- 10.2: 에이전트 선택 드롭다운 UI; [차트]/[메모] 탭 전환
- 10.3: TradingView Lightweight Charts; vi.useFakeTimers() 30초 폴링 검증
- 10.4: strategy_charts → strategy_notes; html2canvas 스냅샷; split-view 프리뷰
- 10.5~10.9: 단일 묶음 → 5개 독립 스토리 분리

### E11 주요 수정
- 11.1: Bull queue repeat cron 통일 (node-cron 불필요); 재시도 지수 백오프 1s→5s→15s
- 11.2: 에이전트 선택 워크스페이스 드롭다운; 상태 색상 (성공:초록/실패:빨강/실행중:노랑)
- 11.3: Webhook HMAC-SHA256 + secret token + 복사 버튼 UI; KIS 폴링 1분/장시간(09:00~15:30 KST)/최대 10개
- 11.4: reports 테이블 저장 (E12 선행); 보고 라인 → E2 reporting_line
- 11.5: task-completed만 E11 범위; 나머지 이벤트 각 에픽 배치
- 11.6: User Story 형식으로 수정

### E12 주요 수정
- 선행 조건: E1.7(isSecretary 컬럼) + E8.1 ToolEngine; Mock 테스트 원칙 Epic 레벨 명시
- 12.1: "As a 시스템" → "As a 비서 에이전트를 활용하는 유저"; ToolEngine.delegate() 방식; 신규 CLI 세션 생성 금지; 4레벨 시 AGENT_002; activity_log E6 기존 테이블; parent_run_id DB 검증 AC
- 12.2: Promise.allSettled + 개별 5분 타임아웃; AGENT_003(timeout); 실패 인라인 표시; vi.useFakeTimers() 테스트
- 12.3: 작전일지 > [위임 현황] 탭; P1 전용 DelegationTree 컴포넌트 (NexusCanvas 미사용)
- 12.4: cross-company AGENT_004 / 비서 아닌 AGENT_005 에러코드; visited Set 순환 감지

### E13 주요 수정
- Mock 테스트 원칙: vi.mock('./storage-client') S3/MinIO Mock 필수
- 13.1: 개발=로컬 볼륨/운영=MinIO 정책; files 테이블 스키마(7컬럼); 10MB 초과 + 비허용 형식 에러 AC; file-uploaded WS 수신 후 목록 자동갱신
- 13.2: messages.file_id DB 검증; pdf-parse(PDF)/mammoth(DOCX); 50,000자 truncation 경고; 동기 추출; MP4 분석 불가 안내
- 13.3: 소프트 삭제(deleted_at); 타입 아이콘(PDF📄/이미지🖼/엑셀📊); 타인 파일 삭제 403 테스트

### E14 주요 수정
- 선행 조건: E9 Instagram 도구 등록; Mock 원칙(fal.ai/Instagram Graph API Mock 필수)
- 14.1: sns_posts 테이블 스키마(10컬럼) 15.5 마이그레이션 포함; ContentCalendar 컴포넌트 신설(Phase F)
- 14.2: Kling ⚠️ E9.6 구현 후 연동(P3는 이미지만); E9.7 scheduled_posts + E11 Bull queue 재사용; sns_posts.status DB 검증; vi.setSystemTime() 예약 게시 테스트
- 14.3~14.7 단일 묶음 → 14.3(성과분석)/14.4(멀티계정+템플릿)/14.5(A/B테스트) 3개 스토리 분리

### E17 주요 수정
- 스토리 순서 재배치: 17.4(DB 마이그레이션) → 17.1, 17.1(캔버스) → 17.2, 17.2(실행) → 17.3, 17.3(템플릿) → 17.4
- 17.1(구 17.4): nexus_workflows(share_token/expires_at 포함)/nexus_nodes(8컬럼)/nexus_runs/mcp_servers 스키마 명시
- 17.2(구 17.1): React Flow v12+(React 19 호환); 2초 디바운스 자동 저장; 이탈 경고 다이얼로그
- 17.3(구 17.2): DAG 위상 정렬 + 독립 노드 병렬; 실패 시 하위 노드만 스킵; NexusEditPanel 우측상단/NexusInfoPanel 우측하단 좌우 분할; DB 저장 검증
- 17.4(구 17.3): crypto.randomUUID() share_token; 만료 URL → 안내 페이지(404 아님)

### E16 주요 수정
- 16.1: messenger_channels 스키마(6컬럼) + messenger_messages 스키마(parent_message_id 포함); E6 conversations 완전 분리; private 채널 403 테스트
- 16.2: E6 WS 재사용 `messenger::{channel_id}` 네임스페이스; @agent_slug 기반 멘션; 채널 격리 테스트
- 16.4: private 채널 비멤버 검색 차단 단위 테스트
- 16.5: PWA manifest + service worker + Web Push 알림 포함
- 16.6: ⚠️ 선행 E13.1; E13 UploadZone + files 테이블 재사용 명시

### E18 주요 수정
- 선행 조건: E17 완료 후; mcp_servers 테이블 E17.1 재사용 명시
- Mock 테스트 원칙: vi.mock('./mcp-client') 외부 MCP 서버 Mock 필수
- 18.1: HTTP+SSE 연결 방식; @modelcontextprotocol/sdk; MCP_001(연결 실패)/MCP_002(인증 실패); 도구 수+이름 배지 UI
- 18.2: "As a 에이전트" → "As a MCP 도구를 활용하는 유저"; ToolEngine 동적 등록; 🔌 MCP 뱃지; MCP_003(JSON-RPC 오류)
- 18.3: E6 WebSocket mcp-progress 이벤트; 인라인 프로그레스 바; streaming 미지원 시 3초 polling fallback; ⏹ 중단 버튼 + 부분 결과 표시 + activity_log 취소 기록
- 18.4: "As a 시스템" → "As a CORTHEX 운영자(관리자)"; X-Company-Id 헤더; MCP 응답 전체 activity_log 저장

### E15 주요 수정
- 스토리 순서 재배치: 15.5(DB 마이그레이션) → 15.1, 15.3(소울 템플릿) → 15.2, 15.1(소울 편집기) → 15.3, 15.2(모니터링) → 15.4, 15.4(조직도) → 15.5
- 15.1(구 15.5): soul_templates 스키마(6컬럼) 명시; sns_posts "14.1 정의 스키마 그대로"
- 15.3(구 15.1): 저장 후 "다음 세션부터 적용" 토스트; agents.soul DB 검증 테스트; 15.2 완료 후 템플릿 불러오기 활성화
- 15.4(구 15.2): WS dashboard-refresh 수신 즉시갱신 + 5분 폴링 fallback; /api/admin/error-logs 비관리자 403 테스트
- 15.5(구 15.4): OrgTreeViewer 컴포넌트 신설(AgentNode 미사용); 팝오버 필드 확장(부서/CLI/비서여부)

## Epic 1 스토리 파일 핵심 발견 사항

### 코드베이스 현황 (스토리 작성 시 발견)
- ~~**포트 불일치**~~: ✅ 1.1에서 수정 완료 (admin:5173, app:5174)
- **api_keys 스키마**: 현재 `encryptedKey: text` → `credentials: jsonb` + `scope ENUM` 변경 필요 → 1.2 태스크
- **activity_logs**: `phase` ENUM 없음, `event_id` UNIQUE 없음 → 1.2 태스크
- ~~**deploy.yml `||true`**~~: ✅ 1.1에서 제거 완료
- **AES-256-GCM**: `lib/crypto.ts` ✅ (epics 문서엔 `lib/encrypt.ts`로 오기됨)
- **ws/ 디렉토리**: 존재하지만 비어있음 → 1.9에서 구현
- **Bun WS 주의**: `export default`에 `websocket` 필드 필수 (현재 누락)
- **tenant-isolation.test.ts**: 23건 ✅ 이미 있음 (WebSocket/CLI 격리만 추가 필요)
- **PWA**: manifest.json, sw.js 없음 → 1.8에서 생성
- **services/ 비어있음**: credential-vault.ts 신규 생성 필요 (1.6)

### 스토리 선행 조건
- 1.6 (Credential Vault): 1.2 완료 필요 (JSONB 스키마), 1.3 완료 필요 (TOOL_001)
- 1.7 (격리 테스트): WS 격리는 1.9 완료 후 활성화
- 1.9 (WebSocket): EventBus는 Bun EventEmitter (외부 라이브러리 불필요)

## File Conventions
- 파일명: kebab-case (e.g., `report-lines.tsx`, `auth-store.ts`)
- 컴포넌트 export: PascalCase
- 유일한 예외: `App.tsx` (React 관례)
