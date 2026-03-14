---
stepsCompleted: [step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
inputDocuments:
  - _bmad-output/planning-artifacts/tools-integration/product-brief.md
  - _research/tool-reports/01-document-processing.md
  - _research/tool-reports/02-report-knowledge.md
  - _research/tool-reports/03-marketing-content.md
  - _research/tool-reports/04-mcp-server-infra.md
  - _research/tool-reports/07-web-data-acquisition.md
workflowType: 'prd'
documentCounts:
  briefCount: 1
  researchCount: 5
  brainstormingCount: 0
  projectDocsCount: 7
classification:
  projectType: saas_b2b_feature_expansion
  typeComposition:
    developer_tool: 30%
    web_app: 30%
    saas_b2b: 40%
  domain:
    primary: ai-agent-orchestration
    secondary: marketing-automation
    tertiary: business-intelligence
    differentiator: full-pipeline-autonomy
  complexity: high
  complexityScore: 31/40
  complexityBreakdown:
    architecture_change: 5        # MCP manual integration pattern, engine-level changes
    external_dependency: 5        # 6+ platform APIs (Tistory, X, Instagram, YouTube, Replicate, Firecrawl, Jina, R2)
    db_schema_change: 4           # 4 new tables (reports, mcp_server_configs, agent_mcp_access, content_calendar)
    realtime_impact: 4            # MCP child process lifecycle + credential-scrubber hook per tool call
    auth_security: 5              # {{credential:key}} injection, scrubber hook, typed error protocol
    regression_scope: 4           # All 56 existing tools must remain intact; engine path unchanged
    ux_change: 2                  # 5 new admin routes + 1 human route
    team_capability: 2            # Brownfield — team knows the codebase
  projectContext: brownfield
  changeType: feature-expansion
  requirementTypes:
    phase1: product+engineering   # 7 new tools + MCP infra + 5 UI routes
    phase2: product               # 7 more tools + 3 priority MCP servers
    phase3: product               # 2 tools + async job queue + video pipeline
    phase4: product               # Korean platform expansion + Redis
  phaseDependencies:
    phase2: [phase1]
    phase3: [phase1, phase2]
    phase4: [phase1]
  criticalPath: "phase1 → phase2 → phase3"
  parallelizable: "phase4 alongside phase3"
  topRisks:
    - "R1: MCP child process lifecycle — zombie processes if TEARDOWN fails"
    - "R2: Puppeteer concurrency — ARM64 24GB VPS ceiling with md_to_pdf + generate_card_news"
    - "R3: CLI-Anything TypeScript/Node.js validation gap for crawl_site"
    - "R4: publish_x DOWNGRADED Phase 1→Phase 2 — X API Basic $200/月 cost gate blocks pilot adoption (Gate 4: ≥3 pilots <30분 setup). Phase 1 MVP = 7 new built-in tools (publish_x excluded). Notify: publish_tistory covers all Phase 1 publishing Aha! Moments without $200/月 barrier."
  totalEstimate: "Phase 1: 3–4 weeks | Phase 2: 3–4 weeks | Phase 3: 3–4 weeks"
partyModeRounds: 3
decisions: 4
terminology:
  허브(Hub): "메인 채팅 UI — Human과 AI 에이전트가 대화하는 공간"
  MCP서버: "외부 서비스를 에이전트 도구로 노출하는 Model Context Protocol 서버"
  credential: "API 키/OAuth 토큰 — company_id 격리 DB 저장, {{credential:key}} 런타임 주입"
  credential-scrubber: "@zapier/secret-scrubber PostToolUse Hook — 도구 출력에서 실제 API 키 값 제거"
  RESOLVE→SPAWN→INIT→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN: "Manual MCP Integration Pattern (messages.create() 엔진용) — 8단계"
  allowed_tools: "agents.allowed_tools JSONB — 에이전트별 허용 빌트인 도구 목록"
  save_report: "에이전트가 마크다운 보고서를 저장 + 배포하는 도구 (web_dashboard/pdf_email: Phase 1; notion/notebooklm: Phase 2; google_drive: Phase 4)"
  content_calendar: "마케팅 콘텐츠 캘린더 CRUD 도구 (idea→scripted→produced→scheduled→published 상태 워크플로)"
  ARGOS: "크론잡 스케줄러 — 주기적 보고서/콘텐츠 자동화"
  call_agent: "에이전트 간 핸드오프 MCP 도구"
---

# Product Requirements Document — CORTHEX Tool Integration

**Author:** CORTHEX Team
**Date:** 2026-03-14
**Version:** 1.0 (PRD Complete — Steps 02–12 complete)

---

## Project Discovery

### Project Classification

- **Project Type:** SaaS B2B Feature Expansion (가중치: saas_b2b 40% / web_app 30% / developer_tool 30%)
- **Domain:** AI Agent Orchestration (1차) + Marketing Automation (2차) + Business Intelligence (3차)
- **Differentiator:** Full Pipeline Autonomy — 에이전트가 웹 리서치 → 콘텐츠 생성 → 멀티플랫폼 게시 → 구조화 보고서를 사람 개입 없이 단일 대화에서 완료
- **Complexity:** High (31/40점 — 8축 정량 평가)
- **Project Context:** Brownfield (CORTHEX v2 Epic 1–15 완료 시스템 위에 기능 확장)

### Detection Signals

**SaaS B2B Feature Expansion 분류 근거:**
- 기존 multi-tenant 구조 (companyId 격리) 위에 신규 credential/MCP 레이어 추가
- Admin UI 5개 신규 라우트 (credential, MCP servers, agent tools, reports, human-accessible reports)
- Per-company tool assignment: `agents.allowed_tools JSONB` 확장
- Enterprise security: `{{credential:key}}` 런타임 주입 + credential-scrubber PostToolUse Hook

**AI Agent Orchestration 도메인 근거:**
- `call_agent` 핸드오프 체인에서 신규 도구(publish_tistory, save_report, read_web_page)가 종단 노드로 동작
- MCP Manual Integration Pattern: messages.create() 기반 엔진(Epic 15/D17)에 외부 MCP 서버를 SPAWN→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN 패턴으로 통합
- 에이전트 티어별 MCP 접근 제어: Workers(MCP 없음) / Specialists(부서 관련 MCP) / Managers(전체 부서 MCP)

**Marketing Automation 도메인 근거 (2차):**
- 마케팅 파이프라인 전용 도구 8개: `publish_tistory`, `publish_x`(Phase 2), `publish_youtube`(Phase 2), `publish_instagram`(리팩토링, Phase 2), `generate_video`(Phase 2), `generate_card_news`(Phase 2), `upload_media`, `content_calendar`(Phase 2)
- `content_calendar` 테이블: idea → scripted → produced → scheduled → published 상태 워크플로 — 에이전트가 콘텐츠 캘린더를 능동적으로 관리
- `call_agent` 체인에서 마케팅 부서(marketing director → copywriter → designer → publisher → reporter) 전체가 Zero-touch 콘텐츠 캠페인을 독립 실행

**Business Intelligence 도메인 근거 (3차):**
- `read_web_page`(Jina Reader) + `web_crawl`(Firecrawl, Phase 2) → 실시간 경쟁사 인텔리전스 수집 (사람이 제공한 정보 의존 탈피)
- `save_report(distribute_to: ['pdf_email', 'notion'])` → 에이전트가 A4 포맷 PDF + Notion 자동 동기화로 이해관계자 배포까지 완료
- `ocr_document`(Phase 2, Claude Vision) → 스캔 문서/계약서 한국어/영어/일본어 OCR → 에이전트 분석 파이프라인 진입
- ARGOS 스케줄 + `save_report` 조합: CEO 김대표가 매주 금요일 아침 경쟁사 보고서 PDF를 받는 "수면 중 자동화" 실현

**High Complexity 근거 (31/40 — Phase 1 PRD 29/40 대비 +2점):**
- Phase 1 PRD(engine refactor) 대비 증가 축: `external_dependency` 3→5/5 (6+ 플랫폼 API 신규), `auth_security` 2→5/5 (credential 격리 모델 + scrubber Hook 신규). 나머지 6개 축은 동일하거나 낮음.
- 6+ 외부 플랫폼 API (Tistory Open API, X API v2 Basic $200/mo, Instagram Graph API, YouTube Data API v3, Replicate, Firecrawl, Jina Reader, Cloudflare R2)
- 4개 신규 DB 테이블 (reports, mcp_server_configs, agent_mcp_access, content_calendar)
- ARM64 24GB VPS에서 Puppeteer/Chromium 동시성 제약 (md_to_pdf + generate_card_news 각 ~200MB)
- 100% credential-scrubber 커버리지 요구 (P0 보안 기준)

---

## Executive Summary

CORTHEX v2 AI 에이전트는 분석과 대화에서 탁월하지만 실세계 비즈니스 액션을 수행할 수 없다 — Tistory에 블로그를 게시하거나, 경쟁사 웹사이트를 크롤링하거나, 포맷된 PDF 보고서를 생성하거나, YouTube에 영상을 업로드하는 것이 불가능하다. 이 "실행 한계선(capability ceiling at the point of action)"은 조직이 CORTHEX와 병렬로 파편화된 SaaS 스택(Predis.ai $59/월, Opus Clip $15/월, Perplexity Pro $20/월, Gamma $8/월, Buffer $30/월 — 합계 $127–150/팀/월)을 유지하도록 강제한다.

**CORTHEX Tool Integration** 은 이 한계를 닫는다. **18개 신규 빌트인 도구** + **~5개 리팩토링 도구** + **동적 MCP 서버 인프라**를 추가하여, CORTHEX AI 에이전트를 정교한 분석가에서 자율적 비즈니스 운영자로 전환한다. 단일 에이전트 대화 안에서 웹 리서치 → 콘텐츠 생성 → 멀티플랫폼 게시 → 구조화 보고서 배포까지 전체 워크플로를 완료한다.

### What Makes This Special

**1. 파이프라인 완전 자율화 (Full Pipeline Autonomy)**

**Phase 1 (MVP):**
기존 CORTHEX: "콘텐츠 초안 완성됨 — 직접 게시해주세요" → Tool Integration Phase 1 이후: "Tistory 5개 발행 완료, 경쟁사 분석 PDF 이메일 발송됨, 보고서 Notion 자동 저장됨"

**Phase 2 (전체 파이프라인):**
"Tistory 5개 + Instagram 카루셀 5개 발행 완료, 콘텐츠 캘린더 업데이트됨 *(Phase 2: publish_instagram, content_calendar)*"

이것이 핵심 가치 전환이다. `call_agent` 핸드오프 체인(marketing director → copywriter → designer → publisher → reporter)이 사람 완료 단계 없이 종결된다. 이 자율 완료는 점별 SaaS 도구로는 달성 불가능하다 — Predis.ai, Buffer, Perplexity가 서로 대화하지 않기 때문이다.

- **(n8n/Make.com/Zapier와의 차이)** 워크플로 자동화 플랫폼은 사전 정의된 노드 연결(플로우차트)을 실행한다. CORTHEX 에이전트는 자연어 명령 하나로 스스로 도구를 선택하고, 콘텐츠를 생성하고, 판단해서 다음 도구를 호출한다 — 사전 설계된 플로우 없음, 콘텐츠 생성 포함.
- **(컨텍스트 연속성)** `call_agent` 핸드오프에서 상위 에이전트의 전체 대화 컨텍스트가 하위 에이전트로 전달된다. 마케팅 디렉터가 "이번 주 캠페인 테마"를 결정하면, 카피라이터 → 디자이너 → 퍼블리셔 모두 동일한 컨텍스트를 공유한 채 실행된다.

**2. 단일 플랫폼 도구 통합 (SaaS Consolidation)**

| 기존 SaaS | 비용 | CORTHEX 대체 도구 |
|---------|-----|----------------|
| Predis.ai (Instagram 자동 게시) | $59/월 | `publish_instagram` 리팩토링 *(Phase 2)* |
| Opus Clip (동영상 클리핑) | $15/월 | `generate_video` + `compose_video` *(Phase 2/3)* |
| Perplexity Pro (웹 리서치) | $20/월 | `read_web_page` *(Phase 1)* + `web_crawl` *(Phase 2)* |
| Gamma (프레젠테이션 생성) | $8/월 | `save_report` + `md_to_pdf` *(Phase 1)* |
| Buffer (멀티플랫폼 스케줄링) | $30/월 | `content_calendar` + publish tools *(Phase 2)* |
| **합계** | **$127–150/월/팀** | **$67/월/전사** (X API 제외) / **$267/월/전사** (X API 포함) |
| **팀당 비용 (5팀 공유 기준)** | **$127–150/팀** | **$13.40/팀** (X 제외) / **$53.40/팀** (X 포함) |

**3. 엔터프라이즈급 자격증명 보안 (Enterprise Credential Security)**

`{{credential:key}}` 런타임 주입 + `@zapier/secret-scrubber` PostToolUse Hook + `AGENT_MCP_CREDENTIAL_MISSING` 타입 에러 — raw API 키가 에이전트 출력에 절대 노출되지 않는 3-레이어 보안 모델. 모든 MCP 서버 설정은 코드 변경 없이 Admin UI에서 관리.

**4. 한국 플랫폼 네이티브 지원**

Tistory Open API 전용 `publish_tistory`, Korean OCR via Claude Vision `ocr_document`, PDF 생성의 `fonts-noto-cjk` CJK 폰트 지원, Bright Data MCP(Naver 호환 프록시 로테이션) — 한국 SME 비즈니스 인프라에 최적화.

**5. 확장 가능한 MCP 아키텍처 (Extensible MCP Architecture)**

`mcp_server_configs` 테이블 + `/admin/mcp-servers` UI로 어떤 MCP 서버도 코드 변경 없이 추가 가능. MCP 서버는 Epic 15/D17에서 `query()→messages.create()` 전환으로 재설계된 Manual Integration Pattern(SPAWN→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN)을 통해 엔진에 동적 통합된다 — 코드 재배포 없음. 예: Notion(22개 도구, Phase 2), Playwright(브라우저 자동화, Phase 2), GitHub(레포/이슈, Phase 2), Google Workspace(50+개 도구, Phase 3) — Admin이 checkbox 클릭만으로 에이전트에 즉시 연결. Phase 1은 MCP 인프라(DB 스키마 + Admin UI + 엔진 통합)를 구축하고, Phase 2에서 우선순위 MCP 서버 템플릿을 배포한다.

---

## Project Classification (Detailed)

- **Project Type:** SaaS B2B Platform — Feature Expansion (typeComposition: saas_b2b 40% / web_app 30% / developer_tool 30%)
- **Domain:** AI Agent Orchestration (primary) → Marketing Automation (secondary) → Business Intelligence (tertiary)
- **Complexity:** High — 31/40 (8축 정량 평가: 외부 의존성 5/5, 보안 5/5, 아키텍처 5/5 — 최고점 3개 축)
- **Project Context:** Brownfield (CORTHEX v2 Epic 1–15 완료된 운영 시스템에 추가)
- **Change Type:** Feature Expansion — 기존 56개 빌트인 도구 유지 + 18개 신규 + ~5개 리팩토링 + MCP 레이어 신규

---

## Success Criteria

### User Success

**Primary persona (김지은 — AI Org Operator):**
- 최초 설정 완료 기준: 자격증명 1개 등록 + 에이전트 도구 1개 토글 ON + 첫 Hub 명령 → 첫 성공 도구 호출까지 <30분 (CORTHEX 내 설정 시간만 측정; 외부 플랫폼 토큰 발급 시간 제외)
- 주간 루틴 달성: 매주 "이번 주 콘텐츠 만들어줘" 1개 명령 → 에이전트 팀이 게시까지 완료. 사람 완료 단계 = 0
- Aha! Moment: 첫 금요일에 Tistory 5개가 이미 게시된 상태 확인 — 에이전트가 끝까지 완료

**Secondary persona (최민준 — Intelligence Consumer):**
- "경쟁사 3곳 가격 분석하고 PDF 이메일해줘" → CORTHEX 시스템 경계 내 ≤5분 (read_web_page × 3 + save_report + md_to_pdf + send_email)
- 보고서가 Notion에 자동 저장 확인: 에이전트 실행 후 "AI Reports" DB에 날짜/작성자(에이전트명)/태그와 함께 자동 생성

**Tertiary persona (CEO 김대표 — Solo Operator):**
- ARGOS 스케줄 설정 후 첫 번째 자동 발송 확인: 에이전트가 설정 시간에 PDF 보고서를 이메일로 자동 발송 (사람 개입 0)
- 매주 보고서 자동화율 ≥80%: 주간 보고서의 80% 이상이 사람 개입 없이 ARGOS + save_report + pdf_email 체인으로 배포
  - *측정: ARGOS run completion log + 동일 run_id 내 `save_report(distribute_to includes 'pdf_email')` success 이벤트 둘 다 충족 시에만 자동화 1건 집계 — ARGOS completion 단독은 email 배포 확인 안 됨*

### Business Success

| 지표 | 정의 | Phase 1 목표 (출시 후 30일) | Phase 2 목표 (출시 후 60일) |
|------|------|---------------------------|---------------------------|
| **Tool activation rate** | 활성 company 중 ≥1 도구 ON 비율 | ≥60% | ≥80% |
| **Credential registration** | company당 등록 credential 수 (평균) | ≥3개/company | ≥5개/company |
| **MCP registration rate** | company당 MCP 서버 등록 수 (평균) | ≥0 (인프라 검증) | ≥1개/company |
| **Pipeline completion** | 활성 company당 주 1회 이상 성공 E2E 파이프라인 | ≥1/company/주 | ≥3/company/주 |
| **Publishing adoption** | 7일 윈도우 내 publish_* 호출 ≥1회인 company 비율 | N/A (Phase 1: publish_tistory만 존재, 60일 기준 적용) | ≥30% (출시 후 60일) |
| **Tool diversity index** | company당 주간 호출된 서로 다른 도구 수 | Week 1: ≥3개/company, Week 4: ≥6개/company | Week 8: ≥8개/company |
| **SaaS substitution proxy** | instagram/tistory_access_token 등록 + 30일 내 ≥10회 성공 publish 호출 company 비율 | - | ≥40% |

**비즈니스 성공의 핵심 지표:**
Phase 1 30일 기준: Activation(≥60%) + Reliability(≥95%) + Security(100% scrubber) 3개 Gate 동시 달성 → Phase 2 투자 승인.

### Technical Success

| 메트릭 | 목표 | 알림 임계치 |
|--------|------|------------|
| **Tool call success rate** | ≥95% (7일 롤링, 도구별) | <90% → PagerDuty |
| **`md_to_pdf` p95 latency** | <10초(1페이지) / <20초(10페이지) | >30초 → Puppeteer 동시성 검토 |
| **`read_web_page` p95 latency** | <8초 (Jina Reader 포함) | >15초 → Jina 장애 알림 |
| **MCP tool discovery latency** | <3초 (Notion warm) / <5초 (Playwright warm) | >10초 warm → spawn timeout |
| **`call_agent` handoff E2E** | <60초 (call_agent 체인만 해당; 단일 에이전트 다중 도구 순차 실행 미포함; 외부 API 응답 시간 제외) | >90초 → 엔진 병목 검토 |
| **Credential-scrubber coverage** | 100% — raw API 키 에이전트 출력 0건 | 1건이라도 → P0 보안 인시던트 즉시 대응 |
| **AGENT_MCP_CREDENTIAL_MISSING rate** | <2%/주 (초기 설정 기간 이후) | >10% → Admin 알림: 자격증명 만료 의심 |
| **MCP zombie process rate** | 0건 (세션 종료 후 30초 이내 전부 종료) | 1건이라도 → 프로세스 모니터 알림 |

**telemetry 인프라 (Phase 1 필수 구현):**
1. `{ company_id, agent_id, run_id, tool_name, started_at, completed_at, success: bool, error_code?: string }` — 도구 호출 이벤트 로그 (engine hook에서 매 tool_use/tool_result 사이클마다 기록; `run_id`로 파이프라인 E2E 측정)
2. `{ company_id, mcp_server_id, event: 'spawn'|'discover'|'teardown'|'error', timestamp, latency_ms }` — MCP 라이프사이클 로그
3. 파이프라인 E2E 타이머: 첫 tool 호출 → 마지막 tool_result 타임스탬프 (run_id로 그룹)
4. credential-scrubber 감사 로그: 매칭 패턴 + 도구명 + 타임스탬프 (실제 credential 값 비기록)

### Measurable Outcomes

**Phase 1 Go/No-Go Gates (6개 — 모두 충족 필요):**

| Gate | 조건 | 측정 방법 |
|------|------|---------|
| **Activation** | 출시 30일 내 활성 company ≥60%가 ≥1 도구 ON | `SELECT COUNT(DISTINCT company_id) FROM agents WHERE jsonb_array_length(allowed_tools) > 0` |
| **Pipeline completion** | 활성 company당 주 1회 이상 E2E 파이프라인 성공 | tool call 이벤트 로그: 동일 run_id 내 ≥2행, 최종행 success=true |
| **Reliability** | Phase 1 전 도구 7일 롤링 성공률 ≥95% | 도구별 이벤트 로그 error_code 집계 |
| **Time-to-value** | ≥3 파일럿 company가 김지은 셋업(credential + tool toggle + Hub 첫 명령)을 <30분 완료 | credentials.created_at → 첫 success=true 도구 호출 타임스탬프 델타 |
| **Persona value delivery** | ≥1 company: Hub 명령 → read_web_page × N → save_report(pdf_email) → send_email 성공, CORTHEX 경계 내 ≤5분 | 파이프라인 E2E 타이머 로그 |
| **Security** | 에이전트 도구 출력에 raw API 키 값 0건 | credential-scrubber 감사 로그 |

**Security Gate 특별 규정:** Security Gate 실패 시(raw API 키 1건이라도 도구 출력 감지) → 즉시 전체 에이전트 도구 실행 중단, Phase 1 도구 배포 롤백, scrubber 100% 커버리지 검증 완료 전 Phase 2 진행 불가.

## Product Scope

### MVP — Phase 1 (7 New Built-in Tools + MCP Infrastructure)

**Phase 1 목표:** "에이전트가 콘텐츠를 게시하고, 보고서를 저장하고, 웹 데이터를 가져올 수 있다" — 사람 완료 단계 없이.

| 도구 | Pillar | 페르소나 가치 | 핵심 의존성 |
|------|--------|------------|-----------|
| `md_to_pdf` | Document Processing | 최민준이 이메일로 A4 PDF 브랜드 보고서를 받음 | Puppeteer/Chromium (Dockerfile) |
| `save_report` | Report Management | CEO 김대표가 ARGOS 스케줄 + Notion + 이메일로 자동 보고서 수신 | `md_to_pdf` + `send_email`(첨부파일 지원 검증 필요) |
| `list_reports` | Report Management | 에이전트가 이전 보고서 이력 조회 | `reports` DB 테이블 |
| `get_report` | Report Management | 에이전트가 연속성을 위해 이전 보고서 내용 조회 | `reports` DB 테이블 |
| `publish_tistory` | Marketing Pipeline | 김지은의 에이전트가 사람 개입 없이 블로그 게시 | Tistory OAuth 토큰 |
| `upload_media` | Marketing Pipeline | Tistory 이미지 첨부(Phase 1) + Phase 2 Instagram/YouTube 게시 인프라 | Cloudflare R2 자격증명 |
| `read_web_page` | Web Data Acquisition | 리서치 에이전트가 실시간 경쟁사 데이터 직접 수집 | Jina Reader (API 키 불필요) |

**Phase 1 MCP 인프라 (코드 없이 추가 가능한 아키텍처 구축):**
- `credentials` DB 테이블 + `/admin/credentials` UI
- `mcp_server_configs` DB 테이블 + `/admin/mcp-servers` UI
- `agent_mcp_access` join 테이블 + 에이전트별 MCP 접근 매트릭스
- `agents.allowed_tools JSONB` 확장 + `/admin/agents/{id}/tools` 토글 UI
- Manual MCP Integration Pattern 엔진 통합 (SPAWN→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN)

### Growth Features — Phase 2 (7 Tools + Priority MCP Servers)

| 도구/MCP | Pillar | 주요 페르소나 |
|---------|--------|------------|
| `ocr_document` | Document Processing | 최민준 — 스캔 계약서 한국어 OCR |
| `pdf_to_md` | Document Processing | 모든 문서 형식 → 에이전트 분석 입력 |
| `publish_youtube` | Marketing Pipeline | 이수진 — YouTube Shorts 에이전트 게시 |
| `generate_video` | Marketing Pipeline | 이수진 — Replicate Kling v2.6 AI 영상 |
| `generate_card_news` | Marketing Pipeline | 김지은 — 1080×1080 카드뉴스 자동 생성 |
| `content_calendar` | Marketing Pipeline | 이수진 — idea→published 상태 워크플로 |
| `web_crawl` (Firecrawl) | Web Data Acquisition | 최민준 — 경쟁사 사이트 심층 크롤링 |
| `publish_instagram` refactor | Marketing Pipeline | 김지은 — 카루셀(10장) + Reels 지원 |
| Notion MCP (22 tools) | MCP | CEO 김대표 — 보고서 Notion 자동 저장 |
| Playwright MCP | MCP | 박현우 — 브라우저 자동화 |
| GitHub MCP | MCP | 박현우 — 레포/이슈 관리 |
| Firecrawl MCP (12 tools) | MCP | 최민준 — deep_research, extract, batch_scrape |

**publish_x (X API Basic $200/월) Phase 2 포함** — Phase 1에서 제외됨(파일럿 비용 게이트). Phase 2 배포 시 팀장 박과장 페르소나의 관리자 승인 워크플로 함께 구현.

### Vision — Phase 3–4+ (Full Automation Platform)

**Phase 3 (2 tools + async job queue):**
- `compose_video` — Remotion 2–5분 비동기 렌더링, job_id 반환 + 폴링 패턴 (60초 NFR과 호환 안 됨 → 비동기 필수)
- `crawl_site` — CLI-Anything + Crawlee 사이트 전체 크롤링 (TypeScript/Node.js 검증 후 확정)
- Google Workspace MCP (50+개 도구: Gmail, Drive, Calendar, Docs)
- Remotion video rendering pipeline

**Phase 4+ (Korean Platform Expansion):**
- `publish_daum_cafe` — Playwright 브라우저 자동화 (공식 API 없음 — P3, 불안정)
- Naver Blog MCP, Kakao Business MCP
- Redis cache 전환 (D21 deferred)

**2–3년 비전 — AI Business OS:**
- Activepieces(280+ 서비스) + Pipedream(2,500 APIs) MCP 브리지 → 사실상 모든 비즈니스 서비스 연동
- 팀장 박과장 비전 실현: 부서별 도구 예산 + 관리자 승인 워크플로 + 비용 가시성
- 도구 마켓플레이스: 기술 Admin이 MCP 템플릿 공개 → 비기술 Admin이 1클릭 설치
- Voice-directed pipelines: CEO 김대표가 음성 1개 명령 → 10+ 도구 전체 비즈니스 워크플로 실행

---

## User Journeys

### Journey 1: 김지은 (AI Org Operator) — "첫 금요일 제로 터치" (Primary Setup → Aha! Moment)

**Opening Scene:** 2026년 3월의 금요일 오전 10시. 김지은은 매주 이 시간에 마케팅 에이전트가 작성해놓은 Tistory 초안 5개를 하나씩 복사해서 Tistory 편집기에 붙여넣는다. 지난주에 이 작업이 2시간 37분 걸렸다. Predis.ai 청구서($59)가 어제 왔다. 그녀는 에이전트가 글은 완벽하게 쓰는데 왜 게시는 못하는지 이해할 수 없다.

**Rising Action:** `/admin/credentials` 페이지를 연다. "Tistory 액세스 토큰" 행에 Developer Console에서 복사한 OAuth 토큰을 붙여넣는다. 5분. `/admin/agents/marketing-publisher/tools` 에서 `publish_tistory` 토글을 ON으로 전환한다. 2분. Hub에서 마케팅 퍼블리셔 에이전트에게: "지난주 콘텐츠 캘린더에서 미게시 글 5개를 Tistory에 발행해줘."

**Climax:** 에이전트가 응답한다: "Tistory 발행 완료:\n- [AI 트렌드 2026] https://tistory.com/... ✓\n- [마케팅 자동화] https://tistory.com/... ✓\n- [경쟁사 분석] https://tistory.com/... ✓\n- [콘텐츠 전략] https://tistory.com/... ✓\n- [고객 여정] https://tistory.com/... ✓" — 7분 후.

**Resolution:** 김지은은 링크 5개를 클릭해서 확인한다. 모두 정상 게시. 2시간 37분이 7분으로 줄었다. 그녀는 Predis.ai 구독을 취소하기 위해 다른 탭을 연다. *"내 AI 팀이 드디어 끝까지 해낸다."*

**Journey Requirements Revealed:** `/admin/credentials` CRUD UI, `publish_tistory` 도구 구현, 에이전트 도구 토글 UI, Tistory Open API `POST /apis/post/write` 통합, marked npm (markdown→HTML), 도구 결과에서 게시 URL 반환.

---

### Journey 2: CEO 김대표 (Solo Operator) — "수면 중 자동화" (ARGOS + PDF Report)

**Opening Scene:** CEO 김대표는 매주 목요일 밤 11시에 경쟁사 분석 보고서를 직접 작성한다. Word에서 6페이지, 표 3개, 첨부 이미지 4장. 금요일 아침에 투자자에게 PDF로 이메일을 보낸다. 매주 3–4시간. 그는 CORTHEX 리서치 에이전트가 분석은 잘하지만 "보고서를 만들어줘"라고 하면 채팅창에 텍스트만 뱉는다는 걸 안다.

**Rising Action:** Tool Integration Phase 1 이후, 그는 Hub에서 리서치 에이전트에게 말한다: "삼성·LG·애플 3사 AI 제품 비교 보고서 만들어서 PDF로 이메일해줘." 에이전트가 `read_web_page`로 3개 사이트를 크롤링하고, 분석을 작성하고, `save_report(distribute_to: ['pdf_email'])`를 호출한다. `pdf_email` 채널이 내부적으로 `md_to_pdf(style: 'corporate')`를 실행하여 12페이지 A4 PDF(Pretendard 폰트, `#0f172a` 헤더, 표 정렬)를 생성하고, `send_email`이 첨부파일로 발송한다. 4분.

**Climax:** ARGOS에 "매주 금요일 오전 7시"로 이 명령을 등록한다. 다음 금요일 아침 7시 5분, 그의 이메일 수신함에 제목 "AI 제품 경쟁사 분석 2026-03-21" PDF가 도착해 있다. 그는 깨어 있지 않았다.

**Resolution:** 그는 PDF를 검토하고 수정 없이 투자자에게 포워딩한다. 3–4시간이 0시간으로 줄었다. *"에이전트가 나 대신 보고서를 보냈다."*

**Journey Requirements Revealed:** `save_report` multi-channel 배포 (pdf_email 채널), `md_to_pdf` corporate CSS 프리셋 (Pretendard 폰트, A4 페이지네이션), `send_email` 첨부파일 MIME 지원 검증, ARGOS + `save_report` 연동, 보고서 DB 저장 후 배포(부분 실패 계약 — DB 저장 우선, 배포 실패 시 에이전트에게 부분 성공 응답).

---

### Journey 3: 박현우 (Technical Admin) — "코드 없는 MCP 연결" (Admin Power User)

**Opening Scene:** 김지은이 박현우에게 메시지를 보낸다: "에이전트가 Notion에 보고서를 자동 저장했으면 해요. 가능해요?" 박현우는 n8n 워크플로를 머릿속으로 설계하기 시작하다가 멈춘다 — CORTHEX에 MCP 서버 관리 UI가 생겼다는 걸 기억한다.

**Rising Action:** `/admin/mcp-servers` → "MCP 서버 추가" → Name: "notion", Command: `npx`, Args: `[-y, @notionhq/notion-mcp-server]`, Env: `NOTION_TOKEN → {{credential:notion_integration_token}}`. "연결 테스트" 클릭 → 초록색 체크. `/admin/agents/reporter/mcp-access` → Notion MCP 체크박스 ON.

**Climax:** 4분 후 김지은의 Hub에서: "이번 주 콘텐츠 보고서를 Notion에 저장해줘." 에이전트가 `save_report(distribute_to: ['notion'])`를 호출하고 Notion MCP `create_page`가 실행된다. 김지은의 Notion "AI Reports" 데이터베이스에 항목이 생긴다.

**Resolution:** 박현우는 코드 한 줄 없이, Dockerfile 변경 없이, 서버 재배포 없이 Notion을 에이전트에 연결했다. *"MCP 붙이는 게 설정이지 개발이 아니다."* 다음 주에 Google Workspace MCP를 3분에 추가한다.

**Journey Requirements Revealed:** `/admin/mcp-servers` CRUD UI (transport/command/args/env 설정), `{{credential:key}}` env 치환, 연결 상태 표시기 (green/red), 에이전트-MCP 접근 매트릭스 UI, MCP Manual Integration Pattern 엔진 통합, `AGENT_MCP_CREDENTIAL_MISSING` 타입 에러 + Admin 로그 노출.

---

> **Phase 1 Journeys: 1 (김지은), 2 (CEO 김대표), 3 (박현우), 6 (최민준 error recovery)**
> **Phase 2 Journeys: 4 (이수진), 5 (팀장 박과장)** — Phase 2 도구(content_calendar, web_crawl, publish_x, audit log UI) 의존

---

### Journey 4: 이수진 (Marketing Team Lead) — "콘텐츠 디렉터로의 전환" (**Phase 2 시나리오** — Phase 2 이후 구현)

**Opening Scene (Phase 2 시나리오 — Phase 2 이후 구현):** 이수진은 CORTHEX 마케팅 에이전트 팀의 "게시 버튼"이다. 에이전트들이 콘텐츠를 만들면, 그녀가 Tistory에 복사, Instagram에 업로드, X에 스레드 게시. 매 금요일 오후의 40%.

**Rising Action:** Hub에서 마케팅 디렉터 에이전트에게: "이번 주 LeetMaster 프로모션 캠페인 실행해줘." `call_agent` 체인이 시작된다: copywriter → `read_web_page`(LeetMaster 경쟁사 리서치) → 블로그 글 3개 작성 → publisher → `publish_tistory` × 3.

**Climax:** 35분 후 에이전트가 Hub에 보고한다: "LeetMaster 캠페인 완료: 블로그 3개 발행(링크 첨부), 콘텐츠 캘린더 updated(idea→published)." 이수진은 링크를 확인한다. 수정 없이 통과.

**Resolution:** 그녀의 금요일 오후가 돌아왔다. 40% → 10%(콘텐츠 검토만). call_agent 핸드오프 체인에서 각 에이전트가 이전 대화 컨텍스트를 공유하기 때문에 "LeetMaster 프로모션"이라는 캠페인 컨텍스트가 copywriter→publisher→reporter까지 일관되게 유지된다.

**Journey Requirements Revealed:** `call_agent` 핸드오프에서 상위 컨텍스트 하위 에이전트 전달, `content_calendar` 상태 워크플로(Phase 2), 에이전트가 tool 결과 URL을 Hub 메시지에 포함하여 보고, 부서별 에이전트 체인 실행 (marketing director → copywriter → publisher → reporter).

---

### Journey 5: 팀장 박과장 (Team Manager) — "감사와 거버넌스" (Admin Oversight)

**Opening Scene (Phase 2):** 10명의 팀원이 CORTHEX 에이전트를 사용한다. 이달 말 청구서를 보니 Firecrawl 크레딧이 거의 소진됐다. 어느 에이전트가 얼마나 썼는지 알 수 없다. 마케팅 팀이 `publish_x` 활성화를 요청했다 — $200/월.

**Rising Action:** `/admin/tool-audit-log` (Phase 2 UI): company_id 필터 + 2026-03 → Firecrawl `web_crawl` 호출 목록. 리서치 에이전트가 89,000 페이지를 크롤링했다. 마케팅 에이전트는 1,200 페이지. 원인 파악: 리서치 에이전트 Soul에 "매일 전체 경쟁사 사이트 재크롤링" 지시가 있었다.

**Climax:** Soul 수정 + `web_crawl` 크레딧 사용량 제한 설정. 마케팅 팀 `publish_x` 요청: 30일 트라이얼 승인, 다음 달 사용 보고서 검토 후 갱신 여부 결정.

**Resolution:** *"내가 어떤 AI가 어디에 뭘 올렸는지 다 보인다."* 도구 비용이 투명하게 관리되고, 승인 없이는 고비용 도구가 활성화되지 않는다.

**Journey Requirements Revealed:** 도구 호출 감사 로그 Admin UI (Phase 2), `web_crawl` Firecrawl 크레딧 소진 알림(80%/100%), 부서별 도구 접근 제어 매트릭스(Phase 2), `publish_x` 관리자 승인 워크플로(Phase 2, `publish_x`와 함께).

---

### Journey 6: 최민준 (Intelligence Consumer) — "PDF 자동 발송" (Error Recovery)

**Opening Scene (Edge Case):** 최민준이 "삼성·LG·애플 AI 제품 분석 PDF 이메일해줘"를 실행했는데 이번 주에는 에이전트가 이상한 응답을 돌려보냈다: "send_email 실패 (SMTP 오류). 보고서는 DB에 저장됨 (ID: RPT-2026-0314-042). Notion 저장 성공. PDF 재발송을 요청하시려면: get_report(id: 'RPT-2026-0314-042') 후 다시 send_email을 실행해주세요."

**Rising Action:** 에이전트가 부분 실패 시 DB 저장을 롤백하지 않고 실패 채널만 보고했다. 최민준은 "아까 그 보고서 다시 이메일해줘"라고 입력한다. 에이전트가 `get_report`로 기존 보고서를 조회하고 `send_email`을 재시도한다.

**Resolution:** 2분 후 이메일 수신. 보고서 재생성 없음. Notion에도 이미 저장되어 있다. 부분 실패가 전체 재실행을 요구하지 않는다.

**Journey Requirements Revealed:** `save_report` 부분 실패 계약 (DB 저장 우선 → 배포 실패 시 채널별 결과 보고, 롤백 없음), `get_report` 기존 보고서 재조회, 에이전트 응답에서 실패한 채널과 성공한 채널 명확히 분리, run_id 기반 E2E 추적.

---

### Journey Requirements Summary

| 기능 카테고리 | Journey에서 드러난 요구사항 | 구현 Phase |
|------------|------------------------|----------|
| **Credential Management** | `/admin/credentials` CRUD + 마스킹 표시 + `{{credential:key}}` 런타임 치환 | Phase 1 |
| **Tool Toggle UI** | `/admin/agents/{id}/tools` 체크박스 + `agents.allowed_tools JSONB` | Phase 1 |
| **publish_tistory** | Tistory Open API + markdown→HTML(marked) + URL 반환 | Phase 1 |
| **read_web_page** | Jina Reader(`r.jina.ai/{url}`) 래퍼, API 키 불필요 | Phase 1 |
| **save_report** | `reports` DB + 다중 채널 배포(web/pdf_email/notion/drive) + 부분 실패 계약 | Phase 1 |
| **md_to_pdf** | Puppeteer/Chromium + corporate CSS preset + Pretendard + A4 | Phase 1 |
| **send_email** | 첨부파일 MIME multipart 지원 검증 및 필요시 업그레이드 | Phase 1 |
| **MCP Server Config UI** | `/admin/mcp-servers` CRUD + 연결 상태 표시기 + 에이전트-MCP 매트릭스 | Phase 1 |
| **MCP Engine Integration** | SPAWN→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN + zombie process 방지 | Phase 1 |
| **AGENT_MCP_CREDENTIAL_MISSING** | 타입 에러 + Admin 로그 노출 + 자격증명 등록 유도 | Phase 1 |
| **Reports UI** | `/admin/reports` (Admin) + `/reports` (Human read-only) | Phase 1 |
| **Tool Audit Log UI** | 에이전트별 도구 호출 이력 + 크레딧 소진 알림 | Phase 2 |
| **content_calendar** | idea→scripted→produced→scheduled→published 상태 CRUD | Phase 2 |
| **publish_x + 승인 워크플로** | X API v2 Basic + 관리자 승인 알림 | Phase 2 |
| **Async job queue** | compose_video job_id 반환 + 폴링/웹훅 | Phase 3 |

---

## Domain-Specific Requirements

> Domain complexity: **High (31/40)** — AI Agent Orchestration (primary) + Marketing Automation + Business Intelligence. Full domain analysis required.

### Compliance & Regulatory

**한국 개인정보보호법(PIPA) 적용 영역:**
- `read_web_page` + `web_crawl`으로 수집한 웹 콘텐츠에 개인정보(이름, 이메일, 연락처 등)가 포함될 수 있음 → 에이전트 출력에 포함 시 company_id 격리 저장 필수, 제3자 배포(pdf_email) 시 개인정보 포함 여부 에이전트가 경고해야 함
- `save_report` 배포 채널 중 `pdf_email`로 전송되는 보고서가 개인정보 포함 시 수신자 동의 확인은 Human 책임 (CORTHEX 시스템 경계 외부)
- OCR(`ocr_document`)로 처리하는 스캔 문서에 주민등록번호/계좌번호 포함 가능 → 에이전트 출력에서 민감정보 마스킹 권고 (Phase 2 구현 가이드)

**플랫폼 이용약관 준수:**
- **Tistory:** Tistory Open API 이용약관 — 자동화 게시 허용, 단 스팸성 대량 게시 금지. `publish_tistory` 호출 간격 최소 1초 권고 (rate limit 미문서화, 에러 발생 시 재시도 간격 exponential backoff)
- **X API Basic ($200/월):** 3,000 tweets/month 한도. 광고성 트윗 자동 게시 X Platform 이용약관 위반 위험 — Soul에 명시적 가이드라인 필요. 초과 시 `TOOL_QUOTA_EXHAUSTED: x_api` 에러 반환
- **Instagram Graph API:** 비즈니스 계정 + Facebook App 필수. 25 API calls/hour rate limit. 카루셀(Phase 2): `upload_media`로 public URL 생성 후 Instagram API에 전달 — Meta 콘텐츠 정책 준수 (허위 광고/저작권 침해 콘텐츠 자동화 생성 금지)
- **YouTube Data API v3:** Google 이용약관 + YouTube 커뮤니티 가이드라인. API 할당량: 기본 10,000 유닛/일. `videos.insert` = 1,600 유닛. **API 할당량 증가 신청 필요** (기본 할당량으로 하루 최대 ~6회 업로드). Shorts 요건: 9:16 비율 + 60초 이하 + #Shorts 해시태그

**저작권 고려사항:**
- `read_web_page` + `web_crawl`로 수집한 타사 콘텐츠를 그대로 보고서에 인용 시 저작권 이슈 → 에이전트 Soul에 "인용 출처 명시, 직접 복사 금지" 가이드라인 포함 권고
- `generate_video`(Replicate Kling) 생성 영상: Replicate ToS에 따라 상업적 사용 가능, 단 학습 데이터 관련 분쟁 가능성 존재 — 고지 문구 권고

### Technical Constraints

**멀티테넌트 격리 (최우선 제약):**
- 모든 도구 호출, MCP 프로세스, credential 접근은 `company_id` 기반으로 완전 격리
- `credentials` 테이블: `(company_id, key_name)` 복합 유니크 인덱스 — A 회사 credential이 B 회사 에이전트에게 절대 노출 금지
- `mcp_server_configs` + `agent_mcp_access`: company_id FK 체인 — 타 회사 MCP 서버 접근 불가
- 도구 호출 이벤트 로그: company_id 기반 쿼리 인덱스 필수 (성능 + 격리 보장)

**프로세스 보안 (MCP child processes):**
- MCP 서버를 `child_process.spawn()`으로 실행 시 env 변수에 실제 API 키가 포함됨 → `/proc/{pid}/environ` 노출 위험
- 완화: spawn 시 최소 권한 env 세트 (필요한 credential만 포함), MCP 프로세스 PID 추적 + 세션 종료 시 `SIGTERM` 강제 종료 (zombie 방지)
- stdio transport: MCP 서버 stdout/stderr에서 credential 값 노출 여부 `@zapier/secret-scrubber` 동일 패턴으로 스캔

**ARM64 VPS 리소스 제약 (24GB RAM, 단일 서버):**
- Puppeteer/Chromium 인스턴스당 ~200MB RAM. `md_to_pdf` + `generate_card_news`(Phase 2) 동시 실행 시 N×200MB
- 최대 동시 Chromium 인스턴스 수: `Math.floor(24GB × 0.3 / 200MB)` ≈ 36개. 단, 다른 서비스(DB, API 서버, MCP processes)를 감안하면 실질 한도 **≤10개 동시** 권장
- Architecture phase 필수 결정: Puppeteer 인스턴스 풀(pool) 크기 + 큐잉 메커니즘 설계
- `compose_video`(Phase 3, Remotion): 렌더링 중 peak RAM 500MB–2GB. 동시 렌더 최대 2–3개

**외부 API 의존성 장애 대응:**
- Jina Reader(`read_web_page`) 장애 시: 에이전트에게 `TOOL_EXTERNAL_SERVICE_ERROR` 반환 + 재시도 제안 (Jina SLA 미공개 → fallback 없음, 에이전트가 사용자에게 안내)
- Firecrawl(`web_crawl`, Phase 2) Growth plan: 100,000 pages/month 한도. 80% 소진 시 Admin 알림, 100% 시 도구 자동 비활성화
- Replicate(`generate_video`, Phase 2): ~$0.029/sec. 예산 초과 방지용 월간 지출 한도 설정 권고 (Architecture phase — 예산 게이팅 메커니즘 설계)

### Integration Requirements

**필수 외부 서비스 인증 플로우 (Admin 설정 시 1회):**

| 플랫폼 | 인증 방식 | CORTHEX credential key | Admin 설정 난이도 |
|--------|--------|---------------------|----------------|
| Tistory | OAuth 2.0 Bearer Token | `tistory_access_token` | 낮음 (Developer Console → 토큰 복사) |
| X (Twitter) | OAuth 1.0a (4개 키) | `x_api_key`, `x_api_secret`, `x_access_token`, `x_access_secret` | 중간 (X Developer Portal + Basic plan 신청) |
| Instagram | Facebook Graph API Token | `instagram_access_token`, `facebook_app_id`, `facebook_app_secret` | 높음 (Facebook Business Manager + Instagram Business Account) |
| YouTube | OAuth 2.0 Refresh Token | `google_oauth_refresh_token` | 높음 (Google Cloud Console + OAuth consent screen) |
| Replicate | API Token | `replicate_api_token` | 낮음 |
| Cloudflare R2 | S3-compatible API keys | `r2_account_id`, `r2_access_key_id`, `r2_secret_access_key` | 낮음 |
| Firecrawl | API Key | `firecrawl_api_key` | 낮음 |
| Notion MCP | Internal Integration Token | `notion_integration_token` | 중간 (Notion Internal Integration 생성 + 페이지 권한 부여) |

**MCP 서버 통합 기술 요구사항:**
- transport 유형별 처리: `stdio` (child_process.spawn) vs `sse` (HTTP EventSource) vs `http` (stateless) — Architecture phase 결정
- JSON-RPC 2.0 준수: `tools/list` (discovery) + `tools/call` (execution) 메시지 형식
- MCP 서버 cold start 시간: Notion MCP(`npx -y @notionhq/notion-mcp-server`) 첫 실행 시 10–30초(npm 패키지 다운로드). warm start SLA만 보장 (Phase 1). 사전 warming 전략은 Architecture phase 설계

**Cloudflare R2 공개 URL 요구사항:**
- `upload_media` 반환 URL이 Instagram + YouTube에서 접근 가능해야 함 → R2 버킷 **공개 접근 활성화** 또는 CDN(Cloudflare Cache) 설정 필요
- 민감 미디어(계정 내부용 이미지)를 R2 공개 버킷에 저장하는 것의 보안 trade-off → 에이전트가 업로드하는 파일은 공개 마케팅 미디어만으로 제한 권고

### Risk Mitigations

**R1: credential 탈취 (P0 리스크)**
- 위협: DB 침해 시 `credentials` 테이블에서 API 키 일괄 탈취
- 완화: credentials 테이블 값 AES-256 암호화 저장 + 복호화는 런타임 CORTHEX 서버 메모리에서만 (DB 평문 저장 금지) — Architecture phase 설계 필수
- 탐지: `@zapier/secret-scrubber` 도구 출력 스캔 (runtime 방어선)

**R2: Puppeteer 동시성 폭발 (HIGH 리스크)**
- 위협: 다수 에이전트 동시에 `md_to_pdf` 또는 `generate_card_news` 호출 → Chromium OOM → 서버 불안정
- 완화: 인스턴스 풀 크기 상한(≤10) + 대기 큐 + 큐 대기 시간 초과 시 `TOOL_RESOURCE_UNAVAILABLE: puppeteer` 에러 반환

**R3: MCP zombie process (MEDIUM 리스크)**
- 위협: TEARDOWN 단계 실패 시 MCP child process가 계속 실행 → 메모리 누수 + 포트 점유
- 완화: 세션 종료 시 SIGTERM → 5초 후 SIGKILL 강제 종료. 프로세스 모니터: 세션 종료 후 30초 초과 생존 프로세스 알림

**R4: 외부 플랫폼 API 정책 변경 (LOW-MEDIUM 리스크)**
- 위협: Tistory/Instagram/YouTube API 정책 변경 또는 접근 제한 → 해당 도구 즉시 사용 불가
- 완화: 도구 구현체를 어댑터 패턴으로 분리 (플랫폼별 `adapters/tistory.ts` 등) — 정책 변경 시 어댑터만 교체. Admin에게 `TOOL_API_POLICY_CHANGE` 알림 표준화

**R5: CLI-Anything TypeScript/Node.js 검증 미완 (crawl_site, Phase 2–3)**
- 위협: CLI-Anything이 C/C++/Python 위주로 검증됨. Crawlee(TypeScript) 생성 코드 품질 불확실
- 완화: Phase 2 시작 전 Crawlee CLI 생성 PoC 실행 → 품질 기준 미달 시 Phase 3로 연기 + 수동 얇은 래퍼(thin TypeScript wrapper) fallback 사용

**R6: Jina Reader 서비스 장애 (`read_web_page`, Phase 1 — HIGH 리스크)**
- 위협: Jina Reader(`r.jina.ai`) 외부 서비스 장애 → `read_web_page` 100% 실패 → Phase 1 Persona Value Delivery Gate 직접 위협 (Hub → `read_web_page` × N → `save_report` → `send_email` ≤5분 파이프라인 즉시 불가)
- 완화: 장애 감지 시 `TOOL_EXTERNAL_SERVICE_ERROR: jina_reader` 반환 + 에이전트에게 재시도 제안. **Phase 1: fallback 없음** (API 키 없이 동작하는 동등 서비스 없음). Phase 2에서 Firecrawl `web_crawl` 또는 Bright Data MCP를 `read_web_page` 대체 fallback으로 평가
- 모니터링: p95 latency >15초 → Jina 장애 알림 (Technical Success 임계치 활용)

**R7: YouTube Data API 일일 할당량 소진 (`publish_youtube`, Phase 2 — MEDIUM 리스크)**
- 위협: 기본 10,000 유닛/일, `videos.insert`=1,600 유닛 → 하루 6–7회 업로드 시 할당량 초과 → 403 `quotaExceeded` 에러
- 완화: 일일 유닛 소비량 추적; 80% 소진(8,000 유닛) 시 Admin 알림 "YouTube 할당량 80% 소진 — Google Cloud Console에서 증가 신청 필요"; 100% 소진 시 당일 `publish_youtube` 자동 비활성화 + `TOOL_QUOTA_EXHAUSTED: youtube_api` 반환 (Firecrawl quota 모니터링 패턴과 동일)

---

## Innovation & Novel Patterns

> **Innovation signal detected:** "AI agents completing entire business workflows autonomously" (saas_b2b + workflow_automation signal). "MCP integration without native SDK support" (novel architectural pattern). Full innovation analysis applies.

### Detected Innovation Areas

**Innovation 1: Natural Language → Full Pipeline Execution (Highest Signal)**

기존 워크플로 자동화 플랫폼(n8n, Make.com, Zapier)은 사람이 사전에 노드를 연결한 결정론적 플로우를 실행한다. CORTHEX의 접근은 근본적으로 다르다:

| 차원 | n8n / Make.com / Zapier | CORTHEX Tool Integration |
|------|------------------------|--------------------------|
| 플로우 설계 | 사람이 GUI에서 노드 연결 (사전 설계) | 에이전트가 자연어 명령에서 도구 순서 스스로 결정 |
| 콘텐츠 생성 | 별도 AI 서비스 연동 필요 | 에이전트가 분석 + 생성 + 실행을 단일 세션에서 통합 |
| 컨텍스트 유지 | 노드 간 데이터 매핑으로만 전달 | `call_agent` 핸드오프에서 전체 대화 컨텍스트 하위 에이전트로 전달 |
| 실패 처리 | 사전 정의 에러 핸들러 | 에이전트가 에러를 읽고 자율적 fallback 판단 |
| 도구 추가 | UI에서 새 노드 연결 | Admin이 `/admin/mcp-servers`에서 MCP 서버 추가 → 즉시 모든 에이전트 사용 가능 |

**결과:** CORTHEX 에이전트는 "마케팅 캠페인 실행해줘"라는 명령 하나로 어떤 도구를 몇 번 호출할지, 실패 시 어떻게 재시도할지를 스스로 결정한다. 이 능력은 사전 플로우 설계 없이 달성된다.

**Innovation 2: Manual MCP Integration Pattern for messages.create() (Architecture Innovation)**

Epic 15(D17)에서 `agent-loop.ts`가 Claude Agent SDK의 `query()`에서 `messages.create()`(Anthropic Raw API)로 전환되었다. `messages.create()`는 네이티브 `mcpServers` 파라미터를 지원하지 않기 때문에, MCP 서버 통합을 위한 완전히 새로운 패턴이 필요했다:

```
RESOLVE → SPAWN → INIT → DISCOVER → MERGE → EXECUTE → RETURN → TEARDOWN

0. RESOLVE: env JSONB 내 {{credential:*}} 패턴 → credentials 테이블 실제 값 치환
            (미해석 패턴 감지 시 → CREDENTIAL_TEMPLATE_UNRESOLVED 에러 + SPAWN 중단)
1. SPAWN: child_process.spawn(command, args, { env: resolvedCredentials })
1.5. INIT: JSON-RPC initialize 요청 → server initialize 응답 → client initialized 알림
           (protocol_version: "2024-11-05"; 3-way handshake 완료 후에만 DISCOVER 진행)
2. DISCOVER: JSON-RPC tools/list → MCP 도구 스키마 수집
3. MERGE: MCP 도구를 Anthropic 도구 형식으로 변환 → messages.create() tools[] 파라미터에 병합
         (네임스페이싱: "notion__create_page", "playwright__click" — 충돌 방지)
4. EXECUTE: messages.create() 응답에서 MCP 네임스페이스 tool_use 블록 감지
           → 해당 MCP 서버에 JSON-RPC tools/call 라우팅
5. RETURN: MCP tool_result를 다음 messages.create() 호출의 tool_result 블록으로 주입
6. TEARDOWN: 세션 종료 시 SIGTERM → 5초 후 SIGKILL MCP child 프로세스
```

이 패턴은 `cache_control`(`messages.create()` 전용 기능)을 MCP와 동시에 사용할 수 있는 유일한 방법이다. Claude Agent SDK `query()` 경로로는 달성 불가능하다.

**Innovation 3: Compounding Tool Value through Agent Handoffs (Business Model Innovation)**

개별 도구의 가치보다 도구 체인(chain)의 가치가 지수적으로 크다:

```
read_web_page → [분석] → save_report → md_to_pdf → send_email → Notion MCP
```

각 도구가 추가될 때마다, 그 도구는 기존 모든 도구와 조합 가능한 체인 노드가 된다. 7개 Phase 1 도구 = 7! / (7-2)! = 42가지 2-도구 체인 + 더 복잡한 N-도구 체인. 이 compounding 효과는 점별 SaaS 도구(Predis.ai, Buffer 등)가 재현 불가능한 플랫폼 moat를 형성한다.

### Market Context & Competitive Landscape

**직접 경쟁자 (MCP + AI 에이전트 플랫폼):**
- **Dify, Coze, Flowise**: MCP 지원 에이전트 플랫폼이지만 한국 SME 특화 도구(Tistory, 한국어 OCR) 없음. 동적 조직 관리(NEXUS) 없음
- **LangChain + LangGraph**: 코드 기반 — 비개발자 Admin 사용 불가. CORTHEX는 no-code Admin UI로 동일 기능 제공
- **Claude.ai Pro + Projects**: 단일 사용자. 멀티테넌트 불가, 조직 관리 없음

**간접 경쟁자 (워크플로 자동화):**
- **n8n / Make.com / Zapier**: 사전 정의 플로우. AI 에이전트 통합 가능하지만 조직 관리 없음, 자연어 → 도구 선택 자율성 없음

**CORTHEX 포지션:** "조직 관리 가능한 자율 비즈니스 운영 AI" — 경쟁자 중 어느 것도 동적 AI 조직(NEXUS) + 자연어 도구 실행 + 한국 플랫폼 네이티브를 동시에 제공하지 않음.

**시장 타이밍:**
- MCP(Model Context Protocol)가 2024년 Anthropic 발표 → 2025-2026년 생태계 폭발적 성장 (28,600+★ Playwright MCP, 27,800+★ GitHub MCP)
- 한국 SME의 AI 자동화 수요 폭발 (2026년 기준) — CORTHEX가 한국 특화 최초 포지션 선점 기회

### Validation Approach

**Innovation 1 (Natural Language → Pipeline) 검증:**
- Gate: Journey 2 파이프라인 테스트 — "삼성·LG·애플 경쟁사 분석 PDF 이메일해줘" → 사람 개입 0 + ≤5분 CORTHEX 경계 내
- Gate: Journey 1 테스트 — 첫 Tistory 게시까지 <30분 (credentials 설정 포함)
- Qualitative: 파일럿 3개사에서 "우리가 수동으로 하던 게 이렇게 되네"라는 반응 확인

**Innovation 2 (Manual MCP Pattern) 검증:**
- PoC 필수: Notion MCP stdio 통합 → `tools/list` → `tools/call` → `messages.create()` tool_result 주입 전체 사이클 동작 확인
- 검증 지표: MCP tool discovery latency <3초 (warm), credential scrubber가 MCP 출력에도 100% 적용 확인

**Innovation 3 (Compounding tool value) 검증:**
- 지표: Tool diversity index (Week 4: company당 ≥6개 도구 — 단일 도구 lock-in이 아닌 체인 사용 증거)
- 지표: Pipeline completion rate (활성 company당 주 ≥1회 E2E 파이프라인 성공)

### Risk Mitigation

**Innovation 1 위험 — 에이전트가 잘못된 도구 순서 선택:**
- 위험: 에이전트가 `save_report` 없이 `md_to_pdf`를 직접 호출하거나 `upload_media` 없이 `publish_instagram` 호출 시도
- 완화: 각 도구 설명(`description`)에 "선행 도구" 명시 (e.g., `publish_instagram` description: "반드시 upload_media로 public URL 생성 후 호출"). 도구 설명이 에이전트 라우팅을 가이드

**Innovation 2 위험 — MCP 프로토콜 버전 비호환:**
- 위험: MCP 서버별 프로토콜 버전 차이 → `tools/list` 응답 파싱 실패
- 완화: JSON-RPC 응답 스키마 유연 파싱 + 알 수 없는 필드 무시. MCP 서버 추가 시 연결 테스트(Admin UI)에서 `tools/list` 성공 여부 검증

**Innovation 2 위험 — credential 주입 전 MCP spawn 시도:**
- 위험: `{{credential:key}}` 미해석 상태로 env 전달 시 MCP 서버 인증 실패 → literal template string이 로그에 노출
- 완화: RESOLVE 단계(step 0)에서 spawn 직전 env 내 모든 `{{credential:*}}` 패턴 해석 완료 여부 검증. 미해석 패턴 존재 시 `CREDENTIAL_TEMPLATE_UNRESOLVED` 에러 + spawn 중단

**Innovation 1 위험 추가 — `call_agent` 다단계 체인 컨텍스트 오버플로 (Phase 2 Watch):**
- 위험: 4단계 이상 핸드오프(marketing director→copywriter→designer→publisher→reporter) 시 누적 컨텍스트가 Claude context window 한도 초과 가능 — 에이전트 응답 절단 또는 세션 오류
- Phase 1 안전 범위: 2단계 핸드오프 (director→publisher) — context 누적 최소
- 완화 (Phase 2 전): 3–4단계 체인 컨텍스트 누적량 측정 PoC → 필요 시 핸드오프 시점에 "지금까지의 결과 요약" 컨텍스트 압축 삽입 전략 설계 (Architecture phase)

---

## SaaS B2B Feature Expansion — Project-Type Specific Requirements

> **CSV Match:** `saas_b2b` (40% 가중치 최다) — 기존 multi-tenant 플랫폼 위에 도구 실행 계층 추가하는 Brownfield Feature Expansion. required_sections: tenant_model; rbac_matrix; subscription_tiers; integration_list; compliance_reqs. skip_sections: cli_interface; mobile_first.

### Project-Type Overview

CORTHEX Tool Integration은 기존 SaaS B2B 멀티테넌트 플랫폼(CORTHEX v2 Epic 1–15)에 도구 실행 계층을 추가하는 **Brownfield Feature Expansion**이다. 신규 코드는 기존 multi-tenant 격리 구조, RBAC 패턴, 외부 서비스 추상화 패턴을 확장하고 따른다 — 교체하지 않는다.

**SaaS B2B 분류 근거 요약:**
- 기존 `company_id` 격리 데이터 모델이 신규 `credentials`, `mcp_server_configs`, `agent_mcp_access`, `reports`, `content_calendar` 테이블 모두에 적용됨
- Admin UI 중심 설정 흐름 (credential 등록 → tool toggle → MCP 서버 배포) — 최종 사용자(Human)는 설정 불필요
- B2B SaaS 도구 통합: 고객사(company) 단위 API 키 관리 + 에이전트별 도구 권한 매트릭스

### Multi-Tenant Architecture (Tenant Model)

**격리 원칙 — "company_id 방화벽":**

모든 신규 도구 인프라는 `company_id`를 유일한 테넌트 경계로 사용한다:

| 신규 테이블 | company_id 격리 방식 | 격리 보장 메커니즘 |
|------------|-------------------|-----------------|
| `credentials` | `(company_id, key_name)` 복합 유니크 인덱스 | `getDB(ctx.companyId)`로만 접근 — direct `db` import 금지 |
| `mcp_server_configs` | `company_id` FK + Admin만 CRUD | 서버 레이어 필터 — 타 company 서버 조회 불가 |
| `agent_mcp_access` | agent → mcp_server_configs → company_id 체인 | Cross-company agent-MCP 연결 구조적 불가 |
| `reports` | `company_id` FK + 조회 시 필터 필수 | `/admin/reports` + `/reports` 모두 company 스코프 |
| `content_calendar` | `company_id` FK | 에이전트가 타 company 캘린더 접근 불가 |

**런타임 credential 격리:**
- MCP child process 실행 시 env에 주입되는 API 키는 `ctx.companyId`로 격리 조회된 값만 사용
- `{{credential:key}}` 패턴은 RESOLVE 단계에서 해당 company_id 컨텍스트 내에서만 해석 — 타 company credential 치환 구조적 불가

**도구 호출 이벤트 로그 (Audit Log 기반):**
- 모든 도구 호출: `company_id` + `agent_id` + `tool_name` + `timestamp` + `status` + `duration_ms` 저장
- 쿼리 인덱스: `(company_id, timestamp DESC)` — Audit Log UI (Phase 2) 페이지 성능 보장

### Permission & Access Control Model (RBAC Matrix)

**3계층 도구 접근 제어:**

| 대상 | 제어 방법 | 수정 주체 |
|------|----------|---------|
| Company 수준 | `/admin/credentials` (API 키 등록) + `/admin/mcp-servers` (서버 배포) | Admin 사용자 |
| 에이전트 수준 | `agents.allowed_tools JSONB` — 허용된 빌트인 도구만 실행 가능 | Admin UI (`/admin/agents/{id}/tools`) |
| MCP 접근 수준 | `agent_mcp_access` join table — 에이전트별 MCP 서버 매트릭스 | Admin UI (MCP 서버-에이전트 할당) |

**에이전트 Tier별 MCP 접근 원칙:**

| 에이전트 Tier | 빌트인 도구 | MCP 서버 접근 |
|-------------|------------|-------------|
| Workers (실무자) | Admin이 `allowed_tools`에 허용한 도구만 | MCP 없음 *(기본값 — Architecture phase에서 engine hard block vs. configurable default 결정 필요. `agent_mcp_access` 스키마 처리 방식이 두 경우에 상이함)* |
| Specialists (전문가) | Admin이 허용한 도구만 | 소속 부서 관련 MCP만 (`agent_mcp_access`) |
| Managers (관리자) | Admin이 허용한 도구만 | 전체 부서 MCP + `call_agent` 핸드오프 체인 가능 |

**도구 활성화 흐름 (Admin 제어 체계 — Journey 1, Journey 3):**
1. Admin: `/admin/credentials` → API 키 등록 (AES-256 암호화 저장, 마스킹 표시)
2. Admin: `/admin/mcp-servers` → MCP 서버 설정 (command/args/env template) + 연결 테스트
3. Admin: `/admin/agents/{id}/tools` → 빌트인 도구 활성화 (`allowed_tools JSONB` 업데이트)
4. Admin: MCP 서버-에이전트 매트릭스에서 특정 에이전트에 MCP 서버 부여
5. 에이전트: 허용된 도구만 실행 가능 (`agent-loop.ts`에서 engine-level 강제 — Soul 레이어 우회 구조적 불가)

**보안 경계 (Engine-level enforcement):**
- `allowed_tools` 체크는 `agent-loop.ts`에서 도구 실행 직전 수행 — 에이전트가 Soul에서 직접 허용되지 않은 도구 호출 시 `TOOL_NOT_ALLOWED` 에러 반환
- Credential-scrubber PostToolUse Hook: 빌트인 도구 + MCP 도구 출력 100% 스캔 — raw API 키 값 감지 즉시 P0 보안 인시던트 처리

### Subscription & Pricing Implications

**Phase 1: 기존 SaaS 구독에 기능으로 통합 (신규 요금 Tier 불필요)**
- Tool Integration Phase 1은 기존 CORTHEX v2 구독에 기능으로 추가됨 — 별도 "Pro 도구 플랜" 없음
- **BYOK(Bring Your Own Key) 모델:** Admin이 자체 API 키를 등록 — CORTHEX가 외부 API 비용 부담 없음
- Phase 1 추가 인프라 비용: Puppeteer (로컬, 추가 비용 없음) + Jina Reader (무료) + Cloudflare R2 (~$0.015/GB/월 — 파일럿 3개사 기준 월 수 달러)

**Phase 2 이후 잠재적 과금 모델 검토 필요 (PRD 범위 외, 비즈니스 결정):**
- Firecrawl Growth plan ($99/월): company별 BYOK vs CORTHEX 공용 계정 + 사용량 제한 모델 선택 필요 — Architecture phase 결정
- Replicate(`generate_video`): 실행당 ~$0.029/초 — company별 월간 지출 한도 설정 메커니즘 필요 (Architecture phase 설계)
- **미결 결정:** Phase 2 시점에 "고비용 도구 티어" 분리 또는 사용량 기반 과금(usage-based billing) 전환 검토 권고

### External Integration Registry (Integration List)

**Phase 1 (MVP) 필수 통합:**

| 서비스 | 도구 | 인증 방식 | BYOK 여부 | 설정 난이도 |
|--------|------|---------|---------|---------|
| Tistory Open API | `publish_tistory` | OAuth 2.0 Bearer Token | BYOK | 낮음 |
| Jina Reader (`r.jina.ai`) | `read_web_page` | 없음 (무료) | 내장 | 없음 |
| Cloudflare R2 | `upload_media` | S3 호환 API Keys | BYOK | 낮음 |
| Puppeteer/Chromium | `md_to_pdf` | 없음 (로컬 실행) | 내장 | 없음 |

**Phase 2 추가 통합:**

| 서비스 | 도구 | 인증 방식 | BYOK 여부 | 설정 난이도 |
|--------|------|---------|---------|---------|
| X API v2 Basic ($200/월) | `publish_x` | OAuth 1.0a (4 keys) | BYOK | 중간 |
| Instagram Graph API | `publish_instagram` (리팩토링) | Facebook Graph API Token | BYOK | 높음 |
| YouTube Data API v3 | `publish_youtube` | Google OAuth 2.0 Refresh Token | BYOK | 높음 |
| Replicate (Kling) | `generate_video` | API Token | BYOK | 낮음 |
| Firecrawl Growth | `web_crawl` | API Key | BYOK | 낮음 |

**MCP 서버 통합 우선순위 (Admin UI에서 동적 추가):**

| MCP 서버 | 배포 Phase | 인증 | 주요 기능 |
|---------|----------|------|---------|
| Notion MCP | Phase 2 (Phase 1 엔지니어링 PoC — 사용자 미배포) | Internal Integration Token | 페이지 생성/검색 |
| Playwright MCP | Phase 2 (Phase 1 엔지니어링 PoC — 사용자 미배포) | 없음 | 브라우저 자동화 |
| GitHub MCP | Phase 2 | GitHub PAT | 코드 리뷰/PR |
| Google Workspace MCP | Phase 3 | Google OAuth | Docs/Sheets/Calendar |

*\* MCP 통합 엔진(8단계 RESOLVE→TEARDOWN 패턴) + Admin UI는 Phase 1에 구축됨. 개별 MCP 서버 설정 템플릿(Notion, Playwright)은 Phase 2에서 파일럿사와 함께 검증 후 배포. "엔지니어링 PoC"는 개발팀 내부 동작 확인용 — Admin UI 사용자에게 노출되지 않음.*

*전체 외부 서비스 인증 상세 명세: [Domain-Specific Requirements → Integration Requirements] 참조*

### Compliance Requirements Summary

> *전체 컴플라이언스 상세: [Domain-Specific Requirements → Compliance & Regulatory] 참조*

**SaaS B2B 도구 계층 신규 컴플라이언스 포인트 4가지:**
1. **PIPA(한국 개인정보보호법):** `read_web_page` + `web_crawl` 수집 데이터 → company_id 격리 저장 의무; pdf_email 배포 보고서에 개인정보 포함 시 수신자 동의는 Human 책임 (시스템 경계 외)
2. **플랫폼 ToS:** X API(광고 자동화 금지 → Soul 가이드라인 명시 필요), Instagram(Facebook Business 계정 필수), YouTube(일일 할당량 10,000 유닛 — API 할당량 증가 신청 필요)
3. **Credential 보안 컴플라이언스:** AES-256 암호화 + credential-scrubber 100% 커버리지 → SOC2 Type II 준비 기반 (Architecture phase에서 암호화 키 관리 방식 설계 필수)
4. **저작권:** `read_web_page` 수집 타사 콘텐츠 인용 시 출처 명시 + 직접 복사 금지 → 에이전트 Soul 가이드라인에 명시

### Technical Architecture Considerations

**신규 인프라 의존성 (Architecture Phase 설계 필수):**
- Puppeteer 인스턴스 풀 + 큐잉 메커니즘 설계 (≤10 동시 인스턴스 상한; 초과 시 `TOOL_RESOURCE_UNAVAILABLE: puppeteer`)
- credentials 테이블 AES-256 암호화 키 관리 방식 (환경 변수 vs. KMS — Phase 1 최소 env var 방식으로 시작 가능)
- MCP cold start warm-up 전략 (Notion MCP 첫 실행 10–30초 → lazy spawn + timeout SLA 정의 또는 pre-warm)
- MCP transport 타입별 처리 (`stdio` / `sse` / `http`) 통합 어댑터 설계 — Phase 1은 `stdio`만 필요

**기존 시스템과의 통합 경계:**
- `agent-loop.ts`: 단일 진입점 유지 — MCP 통합 코드는 engine/ 내부에서만 동작 (E8 경계 준수)
- `getDB(ctx.companyId)`: 모든 신규 테이블(`credentials`, `reports`, `mcp_server_configs`, `content_calendar`) 접근은 이 패턴 필수
- PostToolUse Hook chain: credential-scrubber가 기존 Hook 체인에서 신규 도구 출력 모두에 적용되는지 Architecture phase에서 Hook chain 순서 검증 필요

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP 유형: Platform MVP**

CORTHEX Tool Integration의 MVP는 "문제 해결형 MVP"(단일 기능 검증)나 "수익형 MVP"(빠른 과금 전환)가 아닌, **플랫폼 기반 MVP**다:

- **핵심 원칙:** Phase 1에서 credential 관리 + 도구 토글 + MCP 인프라를 한 번 구축하면, Phase 2+ 도구는 그 위에 적층(additive)된다 — 인프라 재작업 없음
- **최소 유용 정의:** "Admin이 Tistory 토큰을 등록하고, 에이전트가 경쟁사 분석 PDF를 이메일로 자동 전송할 수 있는 상태" = Phase 1 완료 기준 (Journey 1 + Journey 2 성공)
- **검증 학습 목표:** 파일럿 3개사에서 Tool Diversity Index Week 4 ≥6개 도구 사용 확인 = 플랫폼 가치(단일 도구 아닌 체인 효과) 검증

**Phase 1 scope 결정 근거:**
- `publish_x` Phase 2 하향 (R4): X API Basic $200/월 비용 게이트가 파일럿 <30분 셋업 목표와 상충 — 비용 부담 없이 파이프라인 검증 불가
- Phase 1 7개 도구: 모두 BYOK 비용 $0(Jina Reader 무료, Puppeteer 로컬) 또는 단순 1회 토큰 등록으로 즉시 시작 가능
- **MVP 자원 요구:** 단독 개발자 1명, 3–4주 (병렬 없을 경우 5–6주 버퍼 권고)

### MVP Feature Set (Phase 1)

**지원되는 핵심 User Journeys:**

| Journey | Persona | 핵심 도구 |
|---------|---------|---------|
| Journey 1 | 김지은 (AI Org Operator) | credential UI + tool toggle + `publish_tistory` |
| Journey 2 | CEO 김대표 (Solo Operator) | `save_report(pdf_email)` + `md_to_pdf` + ARGOS |
| Journey 3 | 박현우 (Technical Admin) | MCP 서버 Config UI + SPAWN→TEARDOWN |
| Journey 6 | 최민준 (Intelligence Consumer) | `save_report` 부분 실패 계약 + `get_report` |

**Phase 1 Must-Have 빌트인 도구 (7개 신규):**

| 도구 | 외부 의존성 | Go/No-Go Gate 기여 |
|------|-----------|------------------|
| `md_to_pdf` | Puppeteer/Chromium (로컬) | Pipeline Gate |
| `save_report` | `reports` DB 테이블 | Persona Value Delivery Gate |
| `list_reports` | `reports` DB 테이블 | Pipeline Gate |
| `get_report` | `reports` DB 테이블 | Reliability Gate |
| `publish_tistory` | Tistory OAuth token (BYOK) | Persona Value Delivery Gate |
| `upload_media` | Cloudflare R2 (BYOK) | `publish_tistory` 선행 필수 도구 |
| `read_web_page` | Jina Reader `r.jina.ai` (무료) | Persona Value Delivery Gate (R6 HIGH 리스크) |

**Phase 1 Must-Have 인프라:**

| 컴포넌트 | 설명 | 의존 도구 |
|---------|------|---------|
| `credentials` 테이블 + AES-256 암호화 | API 키 company_id 격리 저장 | 모든 BYOK 도구 |
| `{{credential:key}}` 런타임 치환 | agent-loop.ts RESOLVE 단계 | MCP spawn + 외부 API 도구 |
| Credential-scrubber PostToolUse Hook | API 키 출력 노출 방지 (P0) | 모든 도구 출력 |
| `agents.allowed_tools JSONB` 확장 | 에이전트별 도구 활성화 토글 | 모든 빌트인 도구 |
| MCP RESOLVE→SPAWN→INIT→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN | messages.create() 기반 MCP 통합 패턴 | MCP 서버 도구 전체 |
| `mcp_server_configs` + `agent_mcp_access` 테이블 | MCP 서버 Admin 관리 + 에이전트별 접근 제어 | MCP 도구 |

**Phase 1 Must-Have Admin UI (5개 신규 라우트):**

| 라우트 | 목적 | 담당 Persona |
|-------|------|------------|
| `/admin/credentials` | API 키 CRUD + 마스킹 표시 | 박현우 (Technical Admin) |
| `/admin/mcp-servers` | MCP 서버 설정 + 연결 상태 표시기 | 박현우 |
| `/admin/agents/{id}/tools` | 에이전트별 빌트인 도구 체크박스 토글 | 박현우 / 김지은 |
| `/admin/reports` | 보고서 조회 (Admin 전용) | Admin |
| `/reports` | 보고서 조회 (Human read-only) | 최민준 |

**Phase 1 명시적 Out-of-Scope (Phase 2 이후):**

| 항목 | 제외 이유 |
|-----|---------|
| `publish_x` | X API Basic $200/월 비용 게이트 (R4 결정) |
| Audit Log UI | Go/No-Go Gate 통과 후 Phase 2 추가 |
| `content_calendar` | 마케팅팀 규모 확대 후 Phase 2 |
| Firecrawl `web_crawl` | Jina Reader로 Phase 1 커버 — Phase 2에서 fallback 겸 확장 |
| 3–4단계 `call_agent` 체인 PoC | 컨텍스트 누적량 측정 선행 필요 (Phase 2 전) |
| Replicate `generate_video` | 영상 생성은 Phase 2 |
| `generate_card_news` | Puppeteer 고급 기능 Phase 2 |

### Post-MVP Features

**Phase 2 — Growth (Phase 1 출시 후 3–4주)**

*목표: 마케팅 자동화 완전체 + 인텔리전스 파이프라인 강화 + 조직 투명성*

| 카테고리 | 도구/기능 | 전제 조건 |
|---------|---------|---------|
| 소셜 게시 확장 | `publish_x` (X API v2 Basic) | 파일럿사 $200/월 수용 확인 |
| 소셜 게시 확장 | `publish_instagram` (리팩토링) | Facebook Business 계정 설정 |
| 소셜 게시 확장 | `publish_youtube` | Google OAuth + 할당량 증가 신청 |
| 미디어 생성 | `generate_card_news` (Puppeteer + Sharp) | Phase 1 Puppeteer 풀 검증 후 |
| AI 영상 생성 | `generate_video` (Replicate Kling) | Replicate 비용 제어 메커니즘 설계 후 |
| 웹 크롤링 | `web_crawl` (Firecrawl Growth) | Jina Reader fallback + Firecrawl BYOK |
| MCP 서버 3종 | Notion MCP, Playwright MCP, GitHub MCP | Phase 1 MCP 인프라 검증 후 |
| 조직 투명성 | Audit Log UI + 도구 호출 이력 + 크레딧 알림 | Phase 1 이벤트 로그 스키마 |
| 콘텐츠 관리 | `content_calendar` CRUD (idea→published) | Agent 안정성 검증 후 |
| 에이전트 체인 | 3–4단계 `call_agent` PoC (컨텍스트 측정) | Phase 1 2단계 체인 안정 확인 후 |
| 퍼블리싱 승인 | `publish_x` 관리자 승인 워크플로 (Journey 5) | `publish_x` 구현 후 |

**Phase 3 — Expansion (Phase 2 출시 후 3–4주)**

*목표: 비디오 파이프라인 완성 + 문서 인텔리전스*

| 카테고리 | 도구/기능 | 전제 조건 |
|---------|---------|---------|
| 비디오 편집 | `compose_video` (Remotion — 자막/BGM/클립 합성) | Phase 2 `generate_video` 안정 후 |
| 비동기 잡 큐 | `compose_video` job_id 반환 + 폴링/웹훅 인프라 | Architecture phase 설계 필수 |
| 웹 크롤링 확장 | `crawl_site` (CLI-Anything + Crawlee) | Phase 2 PoC 통과 조건부 (R3) |
| 문서 인텔리전스 | `ocr_document` (Claude Vision — 한/영/일 OCR) | Phase 3 독립 스코프 |

**Phase 4 — Platform (Phase 3 완료 후 순차, 일부 Phase 2/3와 병행 가능)**

*목표: 한국 플랫폼 확장 + 성능 인프라 고도화 — Phase 1 MCP 인프라 및 Phase 2 에코시스템 완료 후 착수*

**[A] Redis 전환 — Phase 2/3와 병행 시작 가능:**

| 카테고리 | 도구/기능 | 의존성 |
|---------|---------|------|
| 성능 인프라 | Redis 캐싱 레이어 전환 (D21 deferred 해제) | Phase 1 안정 후 (Phase 2/3와 병행 가능) |

**[B] 플랫폼 MCP 확장 — Phase 2 에코시스템 검증 후:**

| 카테고리 | 도구/기능 | 의존성 |
|---------|---------|------|
| 한국 플랫폼 | Naver Blog MCP, KakaoTalk MCP | Phase 1 MCP 인프라 + Phase 2 에코시스템 검증 후 |
| 글로벌 플랫폼 | Google Workspace MCP, Figma MCP | Phase 2 MCP 에코시스템 확장 후 |

### Risk Mitigation Strategy

**기술적 리스크 완화:**

| 리스크 | 완화 전략 | 타이밍 |
|------|---------|------|
| MCP 인프라 불확실성 (R3 변종) | Phase 1 시작 전 Notion MCP stdio PoC 필수 — 전체 8단계 사이클 동작 확인. 실패 시 Phase 1 MCP 범위 재조정 | Phase 1 착수 전 |
| Puppeteer 동시성 (R2) | 로컬 환경 10개 동시 `md_to_pdf` 실행 부하 테스트 → 풀 크기 상한 값 결정 | Architecture phase |
| Jina Reader 장애 (R6 — Phase 1 HIGH) | `read_web_page` p95 latency >15초 Admin 알림 + Phase 2에서 Firecrawl fallback 평가 | Phase 1 출시 전 모니터링 설정 |
| credential 탈취 (R1 — P0) | AES-256 암호화 구현 + 키 관리 방식 결정 (Architecture phase 필수) | Architecture phase |

**시장 리스크 완화:**

| 리스크 | 완화 전략 | 측정 방법 |
|------|---------|---------|
| 파일럿 도구 설정 장벽 | Admin UX: credential 등록 → 도구 활성화 <30분 (Activation Gate) | Journey 1 시연 시간 측정 |
| 핵심 가치 제안 미검증 | CEO 자동화 파이프라인 ≤5분 (Persona Value Delivery Gate) | Journey 2 E2E 시간 측정 |
| `publish_x` 비용 게이트 | Phase 2 타이밍: 파일럿사 중 $200/월 수용 의사 있는 곳 확인 후 결정 | 파일럿 인터뷰 |

**자원 리스크 완화:**

| 시나리오 | 비상 대응 |
|-------|---------|
| Phase 1 일정 초과 | 최소 안전 범위: Admin UI 3개 (credentials + tool toggle + MCP servers) + 도구 4개 (md_to_pdf + save_report + get_report + read_web_page) — Journey 2 성립 + Journey 6 에러 복구 경로(`get_report` 필수) 가능 |
| MCP 인프라 지연 | Phase 1을 빌트인 도구 7개만 출시 → MCP 인프라는 Phase 1.5로 분리 가능 (Phase 1 7개 도구는 모두 빌트인 — MCP 의존성 없음) |
| 단독 개발 시간 초과 | Phase 1 추정 3–4주 (단독 개발자 기준) → 병렬 작업 없을 경우 5–6주 버퍼 확보 권고 |


---

## Functional Requirements

> **Capability Contract:** 이 섹션에 열거된 기능만 UX 설계, Architecture, Epic 구현 대상이 됩니다. 여기에 없는 기능은 최종 제품에 존재하지 않습니다.

### FR 영역 1: Credential Management (자격증명 관리)

- **FR-CM1:** Admin이 플랫폼 API 키를 key 이름과 값 쌍으로 등록할 수 있다 (company_id 격리 저장)
- **FR-CM2:** Admin이 등록된 credential 목록을 key 이름만 표시하고 값은 마스킹된 형태로 조회할 수 있다
- **FR-CM3:** Admin이 등록된 credential의 값을 수정하거나 해당 credential을 삭제할 수 있다
- **FR-CM4:** 에이전트 세션 시작 시 MCP server env JSONB 내 `{{credential:key_name}}` 패턴이 credentials 테이블에서 실제 값으로 치환될 수 있다 (RESOLVE 단계 — spawn 이전)
- **FR-CM5:** `{{credential:key_name}}` 패턴이 credentials 테이블에 존재하지 않을 경우 `CREDENTIAL_TEMPLATE_UNRESOLVED: key_name` 에러와 함께 MCP spawn이 중단될 수 있다
- **FR-CM6:** Credential 등록/수정/삭제 이벤트가 company_id 스코프 감사 로그에 기록될 수 있다

### FR 영역 2: Agent Tool Assignment (에이전트 도구 할당)

- **FR-TA1:** Admin이 특정 에이전트에 빌트인 도구를 개별 활성화/비활성화할 수 있다 (`agents.allowed_tools JSONB` 업데이트)
- **FR-TA2:** Admin이 에이전트별 활성화된 빌트인 도구 목록을 체크박스 형태로 조회하고 일괄 관리할 수 있다 (`/admin/agents/{id}/tools`)
- **FR-TA3:** 에이전트가 `allowed_tools`에 포함되지 않은 빌트인 도구를 호출 시도할 경우 `TOOL_NOT_ALLOWED: tool_name` 에러가 반환될 수 있다 (engine-level 강제)
- **FR-TA4:** Admin이 에이전트 Tier(Specialists/Managers)에 따라 MCP 접근 기본값을 구성할 수 있다 *(Workers MCP 접근 정책: Architecture phase 결정 사항 — engine hard block vs. configurable default 미확정)*

### FR 영역 3: MCP Server Management (MCP 서버 관리)

- **FR-MCP1:** Admin이 MCP 서버 설정(display_name, transport: stdio|sse|http, command, args, env)을 등록/수정/삭제할 수 있다 (`/admin/mcp-servers`)
- **FR-MCP2:** Admin이 특정 에이전트에 특정 MCP 서버 접근 권한을 부여하거나 취소할 수 있다 (에이전트-MCP 체크박스 매트릭스)
- **FR-MCP3:** Admin이 등록된 MCP 서버에 대해 연결 테스트를 실행하고 성공/실패 상태를 즉시 확인할 수 있다
- **FR-MCP4:** Agent-loop이 에이전트 세션에서 허용된 MCP 서버를 8단계 패턴으로 통합할 수 있다: RESOLVE → SPAWN → INIT → DISCOVER → MERGE → EXECUTE → RETURN → TEARDOWN
  - INIT: JSON-RPC initialize 요청 → server initialize 응답 → client initialized 알림 (protocol_version: "2024-11-05")
  - DISCOVER: JSON-RPC `tools/list` 요청 → MCP 도구 스키마 수집 (INIT 완료 후에만 실행)
  - MERGE: MCP 도구를 Anthropic 도구 형식으로 변환 → `messages.create()` tools[] 병합 (네임스페이스: `server__tool_name`)
  - EXECUTE: MCP 네임스페이스 tool_use 블록 감지 → 해당 MCP 서버에 `tools/call` 라우팅
  - RETURN: MCP tool_result를 다음 `messages.create()` 호출의 tool_result 블록으로 주입
- **FR-MCP5:** 세션 종료 시 MCP child process가 SIGTERM→SIGKILL 순서로 종료될 수 있다
- **FR-MCP6:** MCP credential 누락 감지 시 `AGENT_MCP_CREDENTIAL_MISSING: key_name` 에러가 반환되고 Admin 에러 로그에 노출될 수 있다 (silent passthrough 금지)

### FR 영역 4: Document Processing (문서 처리 도구)

- **FR-DP1:** 에이전트가 마크다운 콘텐츠를 스타일 프리셋(corporate/minimal/default) 기반 PDF로 변환할 수 있다 (`md_to_pdf`, Phase 1)
  - `corporate` 프리셋: Pretendard 폰트, `#0f172a` 헤더, `#3b82f6` 강조, A4 포맷, 페이지 번호
- **FR-DP2:** `md_to_pdf` PDF가 한국어 텍스트, 테이블, 코드 블록, 이미지를 올바르게 렌더링할 수 있다 (fonts-noto-cjk 지원)
- **FR-DP3:** 에이전트가 이미지 또는 스캔 PDF를 OCR 처리하여 텍스트/마크다운/JSON(Zod 스키마) 형식으로 변환할 수 있다 (`ocr_document`, Claude Vision, Phase 2)
  - 한국어/영어/일본어 지원
- **FR-DP4:** 에이전트가 PDF/Word/PPT/Excel 등 20개 이상 문서 포맷을 마크다운으로 변환할 수 있다 (`pdf_to_md`, markitdown-mcp, Phase 2)

### FR 영역 5: Report Management (보고서 관리)

- **FR-RM1:** 에이전트가 마크다운 보고서를 `reports` DB에 저장하고 하나 이상의 배포 채널로 전송할 수 있다 (`save_report`, Phase 1)
  - 파라미터: `title`, `content`, `type`, `tags[]`, `distribute_to: ['web_dashboard'|'pdf_email'|'notion'|'google_drive'|'notebooklm']`
    - `web_dashboard`: Phase 1
    - `pdf_email`: Phase 1
    - `notion`: Phase 2 (Notion MCP 구성 후 활성화)
    - `google_drive`: Phase 4 (Google Workspace MCP — Phase 4 Roadmap 기준)
    - `notebooklm`: Phase 2 (Google NotebookLM API 통합 — Phase 1 out of scope)
  - `pdf_email` 채널: 내부적으로 `md_to_pdf(style: 'corporate')` → `send_email(attachment: PDF)` 체인 실행
- **FR-RM2:** `save_report`가 배포 채널 일부 실패 시 성공한 채널 결과를 유지하고 실패한 채널 목록만 포함한 부분 성공 응답을 반환할 수 있다 (DB 저장은 배포 실패 시에도 롤백하지 않음)
- **FR-RM3:** 에이전트가 company_id 스코프 내 저장된 보고서 목록을 날짜/에이전트/type/tags로 필터링하여 조회할 수 있다 (`list_reports`, Phase 1)
- **FR-RM4:** 에이전트가 보고서 ID로 특정 보고서의 전체 내용을 조회할 수 있다 (`get_report`, Phase 1)
- **FR-RM5:** Admin이 `/admin/reports`에서 company 스코프 보고서 목록을 마크다운 렌더링으로 조회하고 PDF로 다운로드할 수 있다 (Phase 1)
- **FR-RM6:** Human 역할 사용자가 `/reports`에서 published 보고서를 읽기 전용으로 조회할 수 있다 (Admin 전용 라우트와 별도, Phase 1)

### FR 영역 6: Content Publishing & Media (콘텐츠 게시 및 미디어)

- **FR-CP1:** 에이전트가 마크다운 콘텐츠를 HTML로 변환하여 Tistory 블로그 포스트로 게시하고 게시된 포스트 URL을 반환할 수 있다 (`publish_tistory`, Phase 1)
  - 지원 파라미터: `title`, `visibility`(0=비공개/3=공개), `category`, `tags[]`, `scheduled_at`
- **FR-CP2:** 에이전트가 파일(이미지/영상)을 Cloudflare R2에 업로드하고 공개 접근 가능한 URL을 반환할 수 있다 (`upload_media`, Phase 1)
- **FR-CP3:** 에이전트가 텍스트 트윗 또는 이미지 첨부 트윗/스레드를 X에 게시할 수 있다 (`publish_x`, Phase 2)
  - X API Basic($200/월) 필요; 3,000 tweets/월 한도
- **FR-CP4:** 에이전트가 단일 이미지/카루셀(최대 10장)/Reels를 Instagram에 게시할 수 있다 (`publish_instagram` 리팩토링, Phase 2)
  - 카루셀: `upload_media`로 생성한 public URL 배열 필요
- **FR-CP5:** 에이전트가 영상 파일을 YouTube에 업로드하고 Shorts 포맷(9:16 비율, ≤60초, #Shorts 해시태그)을 지원할 수 있다 (`publish_youtube`, Phase 2)
- **FR-CP6:** 에이전트가 HTML 템플릿 기반 카드 뉴스 이미지 세트(1080×1080px, 5–8장)를 생성할 수 있다 (`generate_card_news`, Phase 2)
- **FR-CP7:** 에이전트가 텍스트→영상 또는 이미지→영상 AI 생성을 Replicate Kling에 요청하고 결과 영상 URL을 받을 수 있다 (`generate_video`, 9:16 비율, Phase 2)
- **FR-CP8:** 에이전트가 React 기반 영상 합성(자막/BGM/클립 합성)을 비동기 job으로 제출하고 `job_id`를 즉시 받아 상태를 폴링할 수 있다 (`compose_video`, Remotion, Phase 3)
- **FR-CP9:** 에이전트가 콘텐츠 캘린더 항목을 CRUD할 수 있다 (`content_calendar`, Phase 2)
  - 상태 워크플로: `idea → scripted → produced → scheduled → published`
  - 파라미터: `platform`, `content_type`, `topic`, `status`, `assigned_agent_id`, `scheduled_at`

### FR 영역 7: Web Data Acquisition (웹 데이터 수집)

- **FR-WD1:** 에이전트가 단일 URL의 웹 페이지 내용을 클린 마크다운으로 읽어올 수 있다 (`read_web_page`, Jina Reader `r.jina.ai/{url}`, Phase 1)
  - 에이전트는 원본 URL만 전달; Jina Reader 프리픽스는 도구 내부에서 자동 추가
  - 29개 언어 지원; API 키 불필요
- **FR-WD2:** 에이전트가 웹 데이터를 3가지 모드로 수집할 수 있다 (`web_crawl`, Firecrawl, Phase 2)
  - `scrape`: 단일 URL 콘텐츠 추출
  - `crawl`: 사이트 전체 크롤 (최대 100,000 pages/월 on Growth $99/월)
  - `map`: 사이트맵 URL 추출
- **FR-WD3:** 에이전트가 CSS 셀렉터 기반 사이트 전체 크롤 및 변경 감지 모니터링을 수행할 수 있다 (`crawl_site`, CLI-Anything+Crawlee, Phase 3 — PoC 통과 조건부)

### FR 영역 8: Security & Observability (보안 및 관찰가능성)

- **FR-SO1:** PostToolUse Hook이 모든 도구 출력(빌트인 + MCP)에서 등록된 credential 값 패턴을 스캔하고 자동 제거할 수 있다 (credential-scrubber, 100% 커버리지)
- **FR-SO2:** 모든 도구 호출 이벤트가 로그에 기록될 수 있다: `{ company_id, agent_id, run_id, tool_name, started_at, completed_at, success: bool, error_code?: string }`
  - `run_id`: 에이전트 세션 시작 시 생성되는 파이프라인 그룹 식별자 — NFR-P4 E2E 측정(`동일 run_id 내 첫/마지막 이벤트`) 및 Pipeline Go/No-Go Gate SQL(`동일 run_id 내 ≥2행` 집계)에 필수
- **FR-SO3:** MCP 서버 생명주기 이벤트가 로그에 기록될 수 있다: `{ company_id, mcp_server_id, event: 'spawn'|'discover'|'teardown'|'error', timestamp, latency_ms }`
- **FR-SO4:** Admin이 에이전트별/도구별/날짜별 도구 호출 이력을 Audit Log UI에서 조회할 수 있다 (Phase 2)
- **FR-SO5:** 외부 API 할당량(Firecrawl 100,000 pages/월, YouTube 10,000 유닛/일, X 3,000 tweets/월) 80% 소진 시 Admin에게 알림이 전송될 수 있다
- **FR-SO6:** 외부 API 할당량 100% 소진 시 해당 도구가 자동 비활성화되고 `TOOL_QUOTA_EXHAUSTED: {service_name}` 에러가 에이전트에 반환될 수 있다
- **FR-SO7:** 모든 도구 실패가 `TOOL_` 또는 `AGENT_` 접두사를 가진 typed error 코드로 반환될 수 있다 (블랙박스 에러 0건)

---

## Non-Functional Requirements

> 이 제품에 실제로 적용되는 품질 속성만 문서화합니다. 관련 없는 카테고리는 제외했습니다.

### NFR 영역 1: Performance (성능)

**NFR-P1: 도구별 p95 응답 시간 SLA**

| 도구 | SLA | 측정 방법 | Alert 임계치 |
|------|-----|---------|------------|
| `md_to_pdf` (단일 페이지) | p95 < 10초 | Tool call event log (duration_ms) | >30초 → Puppeteer 동시성 검토 |
| `md_to_pdf` (10페이지) | p95 < 20초 | Tool call event log (duration_ms) | >30초 → 동시성 검토 |
| `read_web_page` | p95 < 8초 | Tool call event log (duration_ms) | >15초 → Jina Reader 장애 알림 |
| `web_crawl` (scrape mode) | p95 < 12초 | Tool call event log (duration_ms) | >25초 → Firecrawl quota 확인 |
| `ocr_document` (1페이지) | p95 < 8초 | Tool call event log (duration_ms) | >30초 → 청킹 검토 |
| `ocr_document` (10페이지) | p95 < 20초 | Tool call event log (duration_ms) | >30초 → 청킹 검토 |
| `publish_tistory` | p95 < 5초 | Tool call event log (duration_ms) | >15초 → Tistory API 상태 확인 |
| `upload_media` | p95 < 8초 | Tool call event log (duration_ms) | >20초 → R2 연결 확인 |
| `publish_x` | p95 < 5초 | Tool call event log (duration_ms) | >15초 → X API 상태 확인 |
| `publish_youtube` | p95 < 30초 (영상 업로드 제외) | Tool call event log (duration_ms) | >60초 → Google API 상태 확인 |

**NFR-P2: MCP 도구 탐지 지연 (warm start)**

| MCP 서버 | Warm start SLA | Cold start 비고 |
|---------|---------------|----------------|
| Notion MCP | `tools/list` 응답 < 3초 | Cold start (첫 `npx -y` 실행): 10–30초 — pre-warming 전략은 Architecture phase 설계 |
| Playwright MCP | `tools/list` 응답 < 5초 | Cold start: 5–15초 |
| 임의 MCP 서버 | `tools/list` 응답 < 10초 | >10초 warm → subprocess spawn timeout alert |

**NFR-P3: `call_agent` 핸드오프 체인 E2E**
- `call_agent` 체인 전체 소요 시간 < 60초
- 적용 범위: 에이전트 간 핸드오프 체인만. 단일 에이전트 다중 도구 순차 실행 미포함. 외부 API 응답 시간 제외
- Alert: >90초 → engine bottleneck 검토

**NFR-P4: 비즈니스 파이프라인 E2E 타겟** *(60초 NFR 미적용 — 단일 에이전트 파이프라인)*
- 단순 파이프라인 (`read_web_page` × 1 + `save_report(pdf_email)`): ≤4분
- 경쟁사 분석 파이프라인 (`read_web_page` × 3 + `web_crawl` × 1 + `md_to_pdf` + `send_email`): ≤5분 *(Phase 2 측정 가능 — `web_crawl` Phase 2 도구)*
- 측정: 첫 tool call `started_at` → 마지막 tool_result `completed_at` (동일 run_id 내)

**NFR-P5: 전체 도구 성공률**
- 각 빌트인 도구: 7일 롤링 윈도우 기준 성공률 ≥95%
- Alert: 단일 도구 성공률 <90% → PagerDuty alert

### NFR 영역 2: Security (보안)

**NFR-S1: Credential 저장 암호화**
- credentials 테이블 값은 AES-256으로 암호화 저장 — DB 평문 저장 금지
- 복호화는 런타임 서버 메모리에서만 수행; 복호화된 값은 로그/DB에 기록 금지
- 암호화 키 관리 방식(env var vs. KMS)은 Architecture phase 결정

**NFR-S2: API 키 노출 방지 (P0 보안 요구)**
- 모든 도구 출력(빌트인 + MCP)에서 등록된 credential 값 패턴 스캔: **credential 값 노출율 = 0%**
- 위반 감지 즉시 P0 보안 인시던트 처리
- `{{credential:key}}` 리터럴 템플릿이 출력에 나타나는 것은 설정 오류(HIGH 버그) — 실제 credential 값 미노출이므로 P0 인시던트가 아님 (`CREDENTIAL_TEMPLATE_UNRESOLVED` 로그)

**NFR-S3: MCP 프로세스 최소 권한 env**
- MCP child process spawn 시 env에는 해당 MCP 서버가 필요한 credential 값만 포함 (최소 권한 env 세트)
- MCP process stdout/stderr: credential-scrubber와 동일한 패턴으로 스캔

**NFR-S4: Multi-tenant 데이터 격리**
- 모든 신규 테이블(`credentials`, `reports`, `mcp_server_configs`, `agent_mcp_access`, `content_calendar`): company_id 없는 데이터 접근 불가 (쿼리 레벨 강제)
- company_id 간 데이터 교차 접근: 구조적으로 불가 (`getDB(ctx.companyId)` 전용 접근)
- `credentials` 테이블: `(company_id, key_name)` 복합 유니크 인덱스 — 동일 company 내 중복 key 이름 금지

**NFR-S5: 도구 실행 권한 강제**
- 에이전트별 `allowed_tools` 체크는 `agent-loop.ts` engine-level에서 도구 실행 직전 수행
- Soul 레이어에서 도구 호출 우회 구조적 불가

### NFR 영역 3: Reliability (신뢰성)

**NFR-R1: Typed Error 전용 (블랙박스 에러 0건)**

모든 도구/MCP 실패는 `TOOL_` 또는 `AGENT_` 접두사를 가진 typed error 코드로 반환:

| Error Code | 트리거 상황 |
|-----------|-----------|
| `TOOL_NOT_ALLOWED: tool_name` | allowed_tools에 없는 도구 호출 시도 |
| `TOOL_EXTERNAL_SERVICE_ERROR: service_name` | 외부 API(Jina, Firecrawl, Tistory, X, YouTube 등) 장애 |
| `TOOL_QUOTA_EXHAUSTED: service_name` | API 할당량 100% 소진 |
| `TOOL_RATE_LIMITED: service_name` | API rate limit 초과 |
| `TOOL_RESOURCE_UNAVAILABLE: puppeteer` | Puppeteer 인스턴스 풀 상한 초과 |
| `TOOL_TIMEOUT: compose_video` | Remotion 렌더 job 15분 초과 |
| `AGENT_MCP_CREDENTIAL_MISSING: key_name` | MCP spawn 시 credential 미등록 |
| `CREDENTIAL_TEMPLATE_UNRESOLVED: key_name` | `{{credential:*}}` 패턴 미해석 감지 (설정 오류) |

**NFR-R2: save_report 부분 실패 계약**
- `save_report` DB 저장은 배포 실패 시에도 롤백하지 않음 (DB 저장 → 배포 순서 보장)
- 배포 채널 일부 실패 시: 성공한 채널 목록 + 실패한 채널 목록 포함 부분 성공 응답 반환
- 에이전트는 부분 실패 응답을 수신하고 실패 채널 재시도 여부를 자율 결정

**NFR-R3: MCP 프로세스 생명주기 보장**
- 세션 종료 시 MCP child process: SIGTERM → 5초 대기 → SIGKILL 강제 종료
- 세션 종료 후 30초 초과 생존 MCP child process 감지 시 Admin 알림 (zombie process 방지)
- MCP spawn 실패(credential 누락, command 오류): 에이전트는 typed error를 수신하고 세션 지속 (다른 도구 사용 가능)

**NFR-R4: `AGENT_MCP_CREDENTIAL_MISSING` 비율**
- 전체 MCP 도구 호출 중 credential 누락 비율 < 2% (초기 설정 기간 이후)
- Alert: >10% → Admin 알림 "Credential이 만료되었을 수 있습니다"

### NFR 영역 4: Scalability (확장성 — ARM64 VPS 제약)

**NFR-SC1: Puppeteer/Chromium 동시 인스턴스 한도**
- 최대 동시 Puppeteer/Chromium 인스턴스 수: ≤10개 (ARM64 24GB VPS, 각 ~200MB RAM)
- 한도 초과 요청: `TOOL_RESOURCE_UNAVAILABLE: puppeteer` 에러 즉시 반환 (대기 큐 또는 거부 — Architecture phase 결정)
- 인스턴스 풀 크기 최종값: 로컬 10개 동시 실행 부하 테스트 결과로 Architecture phase 확정

**NFR-SC2: `compose_video` 비동기 Job Queue**
- `compose_video`는 동기 블로킹 금지 — `job_id` 즉시 반환 후 폴링/웹훅 상태 조회
- 단일 Remotion 렌더 job 최대 허용 시간: 15분. 초과 시 `TOOL_TIMEOUT: compose_video` + `job_id` 에러 반환
- Job queue 최대 동시 렌더 수: ≤2–3개 (ARM64 VPS peak RAM 500MB–2GB/렌더). Architecture phase 확정

**NFR-SC3: 텔레메트리 로그 인덱스**
- `tool_call_events` 테이블: `(company_id, started_at DESC)` 인덱스 필수 — Phase 2 Audit Log UI 페이지 성능 보장
- 추가 권장 인덱스 (Architecture phase 검토): `(company_id, agent_id, started_at DESC)`, `(company_id, tool_name, started_at DESC)`

**NFR-SC4: 외부 API 할당량 자동 제어**

| 서비스 | 할당량 한도 | 80% 알림 | 100% 자동 처리 |
|--------|-----------|---------|--------------|
| Firecrawl (`web_crawl`) | 100,000 pages/월 | Admin 알림 | `web_crawl` 당일 자동 비활성화 |
| YouTube Data API v3 (`publish_youtube`) | 10,000 유닛/일 (videos.insert = 1,600 유닛) | Admin 알림 "할당량 증가 신청 필요" | 당일 `publish_youtube` 자동 비활성화 |
| X API Basic (`publish_x`) | 3,000 tweets/월 | Admin 알림 | `publish_x` 자동 비활성화 |

### NFR 영역 5: Integration (외부 서비스 통합)

**NFR-I1: 외부 서비스 장애 처리**
- 외부 API(Tistory, X, Instagram, YouTube, Replicate, Firecrawl, Jina) 모든 장애: typed error 반환 (`TOOL_EXTERNAL_SERVICE_ERROR: {service_name}`) — silent failure 금지
- 에이전트는 typed error를 수신하고 재시도 여부를 자율 결정

**NFR-I2: MCP 프로토콜 호환성**
- MCP 서버별 프로토콜 버전 차이에 대해 유연한 JSON-RPC 응답 파싱 (알 수 없는 필드 무시)
- Admin UI 연결 테스트 기준: (1) JSON-RPC `initialize` 요청 → server `initialize` 응답; (2) client `initialized` 알림 전송; (3) `tools/list` 요청 → 도구 스키마 수신 — 세 단계 모두 성공 시 '연결 성공' — 프로토콜 비호환 MCP 서버를 사전 감지

**NFR-I3: MCP 서버 즉시 가용성**
- Admin이 신규 MCP 서버 설정 저장 후 에이전트 세션 재시작 시 즉시 사용 가능
- MCP 서버 설정 변경이 현재 실행 중인 에이전트 세션에 영향을 주지 않음 (세션 격리)

**NFR-I4: `send_email` 첨부파일 지원 전제 조건**
- `save_report(distribute_to: ['pdf_email'])` 구현 전 `send_email` 도구가 바이너리 첨부파일을 지원하는지 검증 필수 (`attachments: [{filename, content, encoding: 'base64'}]` MIME multipart)
- 미지원 시 `send_email` 도구 업그레이드가 `save_report` 구현의 선행 조건 (Phase 1 Go/No-Go Gate 5 직접 영향)

---

## Glossary (용어 정의)

| 용어 | 정의 |
|------|------|
| **allowed_tools** | `agents.allowed_tools JSONB` — 에이전트별 허용 빌트인 도구 목록. engine-level에서 강제 |
| **ARGOS** | CORTHEX 크론잡 스케줄러 — 주기적 보고서/콘텐츠 자동화 |
| **BYOK** | Bring Your Own Key — Admin이 외부 플랫폼 API 키를 직접 등록; CORTHEX가 비용 부담하지 않음 |
| **call_agent** | 에이전트 간 핸드오프 MCP 도구 — 상위 에이전트가 하위 에이전트를 호출하며 전체 컨텍스트 전달 |
| **content_calendar** | 마케팅 콘텐츠 캘린더 CRUD 도구 (idea→scripted→produced→scheduled→published 상태 워크플로) |
| **credential** | API 키/OAuth 토큰 — `credentials` 테이블에 company_id 격리 + AES-256 암호화 저장; `{{credential:key}}` 런타임 주입 |
| **credential-scrubber** | `@zapier/secret-scrubber` PostToolUse Hook — 모든 도구 출력(빌트인+MCP)에서 실제 API 키 값 제거 (P0 보안) |
| **CREDENTIAL_TEMPLATE_UNRESOLVED** | `{{credential:key}}` 패턴 미해석 감지 시 에러 코드 — 설정 오류(HIGH 버그), P0 인시던트 아님 |
| **Handoff (핸드오프)** | `call_agent`를 통한 에이전트 간 작업 위임 — 컨텍스트 포함 전달 |
| **Hub (허브)** | 메인 채팅 UI — Human과 AI 에이전트가 대화하는 공간 |
| **MCP 서버** | Model Context Protocol 서버 — 외부 서비스를 에이전트 도구로 노출 |
| **Manual MCP Integration Pattern** | RESOLVE→SPAWN→INIT→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN 8단계 — `messages.create()` 기반 엔진에서 MCP 서버를 통합하는 아키텍처 패턴 |
| **run_id** | 에이전트 세션 시작 시 생성되는 파이프라인 그룹 식별자 — `tool_call_events` 로그에서 E2E 측정 및 Pipeline Gate SQL 집계에 사용 |
| **save_report** | 에이전트가 마크다운 보고서를 DB 저장 + 배포 채널로 전송하는 도구 |
| **Tier (티어)** | 에이전트 계급 — Workers(실무자) / Specialists(전문가) / Managers(관리자) |
| **tool_call_events** | 도구 호출 이벤트 로그 테이블: `{ company_id, agent_id, run_id, tool_name, started_at, completed_at, success, error_code? }` |
| **TOOL_NOT_ALLOWED** | `allowed_tools`에 없는 도구 호출 시도 시 에러 코드 (engine-level 강제) |
| **Tracker (트래커)** | 핸드오프 추적 UI |

---

## Deferred Decisions Register (Architecture Phase 결정 필요 항목)

다음 항목들은 PRD 단계에서 의도적으로 미결 상태로 남긴 Architecture phase 결정 사항이다.

| # | 결정 항목 | PRD 내 참조 | 결정 필요 시점 |
|---|---------|------------|-------------|
| D1 | Workers MCP 접근 — engine hard block vs. configurable default | FR-TA4, RBAC Matrix | Architecture phase 초기 |
| D2 | credentials 테이블 AES-256 암호화 키 관리 — env var vs. KMS | NFR-S1, Domain Requirements R1 | Architecture phase 초기 |
| D3 | Puppeteer 인스턴스 풀 크기 최종값 (부하 테스트 후) | NFR-SC1 | Architecture phase (부하 테스트) |
| D4 | Puppeteer 풀 초과 요청 처리 — 대기 큐 vs. 즉시 거부 | NFR-SC1 | Architecture phase |
| D5 | `compose_video` Job Queue 최대 동시 렌더 수 (2–3개 — RAM 실측 후) | NFR-SC2 | Phase 3 Architecture |
| D6 | MCP transport 타입별 통합 어댑터 — Phase 1: stdio만 필요, sse/http Phase 2+ | Domain Requirements | Architecture phase |
| D7 | Notion MCP cold start warm-up 전략 (lazy spawn vs. pre-warm) | NFR-P2, Integration Requirements | Architecture phase |
| D8 | MCP 텔레메트리 추가 인덱스: `(company_id, agent_id, started_at DESC)`, `(company_id, tool_name, started_at DESC)` | NFR-SC3 | Architecture phase |
| D9 | PostToolUse Hook chain 순서 검증 — credential-scrubber가 신규 도구 출력 모두 적용되는지 | Domain Requirements (Technical Constraints) | Architecture phase |
| D10 | Replicate `generate_video` 월간 지출 한도 게이팅 메커니즘 | Domain Requirements (Integration Requirements) | Phase 2 Architecture |
| D11 | Phase 2+ 고비용 도구 티어 분리 or 사용량 기반 과금 전환 여부 | Subscription & Pricing Implications | Phase 2 출시 전 |
| D12 | google_drive 채널 Phase 불일치 해소 — Integration Registry(Phase 3) vs. Roadmap(Phase 4) | FR-RM1 Note | Architecture phase |

---

## Change Log

| 버전 | 날짜 | 변경 내용 |
|------|------|---------|
| 0.1 | 2026-03-14 | Step-02 Discovery + Vision + Executive Summary 초안 |
| 0.2 | 2026-03-14 | Step-03 Success Criteria + Step-04 User Journeys (6개 페르소나) |
| 0.3 | 2026-03-14 | Step-05 Domain Requirements (컴플라이언스/기술 제약/리스크) + Step-06 Innovation (3개 혁신 영역) |
| 0.4 | 2026-03-14 | Step-07 SaaS B2B Project-Type Requirements + Step-08 Project Scoping (Phase 1–4 로드맵) |
| 0.4.1 | 2026-03-14 | Fix: Notion/Playwright MCP Phase 레이블(Phase 2), Phase 4 헤더 교정, Workers MCP "기본값" 명시, get_report 리소스 폴백 추가 |
| 0.5 | 2026-03-14 | Step-09 Functional Requirements (41개 FR, 8개 영역) + Step-10 Non-Functional Requirements (5개 NFR 영역) |
| 0.5.1 | 2026-03-14 | Fix: FR-SO2 run_id 추가, FR-RM1 채널 Phase 레이블+notebooklm, NFR-I2 INIT 3단계, FR-TA4 Workers 범위 축소, NFR-P4 Phase 2 레이블 |
| 1.0 | 2026-03-14 | Step-11 Polish (용어 통일, 스키마 순서 교정) + Step-12 Complete (Glossary, Deferred Decisions Register, Change Log 추가) |

