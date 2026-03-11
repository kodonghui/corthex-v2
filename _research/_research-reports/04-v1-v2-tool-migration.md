# 04. V1 → V2 도구 마이그레이션 & 리팩토링 가이드

> 작성일: 2026-03-11 | BMAD 참조용 기술 보고서

---

## 1. 현황 비교

| 항목 | V1 | V2 |
|------|----|----|
| **언어** | Python (75+ 도구) | TypeScript (44 도구) |
| **프레임워크** | FastMCP (Stdio) | Claude SDK + 커스텀 레지스트리 |
| **도구 시스템** | 파일 기반 (*.py) | DB 기반 (`tool_definitions` 테이블) + 레지스트리 패턴 |
| **권한 관리** | agents.yaml (YAML) | `agents.allowed_tools` (JSONB) |
| **실행** | 직접 import + call | 레지스트리 lookup → 핸들러 실행 |
| **검증** | 없음 | Hook 파이프라인 (permission, scrubber, redactor) |
| **로깅** | 앱 로그 | DB 테이블 (`tool_calls`) + activity logs |
| **N-tier 핸드오프** | 없음 | `call_agent` MCP 도구 + SessionContext 재귀 |

---

## 2. V2 도구 시스템 아키텍처

### 파일 구조

```
packages/server/src/
  lib/
    tool-handlers/
      builtins/              ← 44개 도구 핸들러 (TypeScript)
      registry.ts            ← 등록 시스템
      types.ts               ← ToolHandler 인터페이스
      index.ts               ← exports
    tool-executor.ts         ← 실행 엔진
    mcp-client.ts            ← MCP 프로토콜 클라이언트
    mcp-rate-limit.ts        ← 레이트 리밋
  routes/admin/
    tools.ts                 ← CRUD API
    tool-invocations.ts      ← 로깅
  services/
    tool-pool.ts             ← 에이전트 → 도구 매핑
    tool-permission-guard.ts ← Hook: PreToolUse
    tool-invocation-log.ts   ← 로깅 서비스
    credential-vault.ts      ← 시크릿 저장소
  db/
    schema.ts                ← Drizzle ORM 스키마
    seed-common-tools.ts     ← 15개 공통 도구
    seed-domain-tools.ts     ← 15개 도메인 도구
```

### 도구 실행 흐름

```
1. loadAgentTools(agentId, companyId) → DB에서 toolDefinitions + agentTools 조회
2. toClaudeTools() → DB 레코드 → Claude API tool definitions 변환
3. SDK가 LLM tool_use 블록으로 도구 호출
4. executeTool() → 레지스트리에서 핸들러 lookup → 실행
5. Hooks: PreToolUse(permission) → PostToolUse(scrubber, redactor, tracker)
6. tool_calls 테이블에 로그: id, sessionId, agentId, toolId, toolName, input, output, status, durationMs
```

### ToolHandler 인터페이스

```typescript
export interface ToolHandler {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute(input: Record<string, unknown>, ctx: ToolExecutionContext): Promise<ToolResult>;
}

export interface ToolExecutionContext {
  companyId: string;
  agentId: string;
  sessionId: string;
  credentials: Record<string, string>; // credential_vault에서 복호화된 값
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: { code: string; message: string };
}
```

---

## 3. V2에 이미 있는 도구 (44개)

### Utility (9)
`get_current_time`, `calculate`, `spreadsheet_tool`, `file_manager`, `date_utils`, `json_parser`, `text_summarizer`, `url_fetcher`, `markdown_converter`

### Search (5)
`search_web`, `search_news`, `search_images`, `search_youtube`, `search_places`

### Communication (4)
`send_email`, `list_calendar_events`, `create_calendar_event`, `text_to_speech`

### Integration (5)
`read_notion_page`, `create_notion_page`, `generate_text_file`, `generate_image`, `translate_text`

### Finance (6)
`get_stock_price`, `get_account_balance`, `place_stock_order`, `market_overview`, `dart_api`, `kr_stock`

### Analysis (9)
`sentiment_analyzer`, `company_analyzer`, `backtest_engine`, `chart_generator`, `contract_reviewer`, `engagement_analyzer`, `content_calendar`, `hashtag_generator`, `code_quality_tool`

### Specialized (5)
`law_search`, `patent_search`, `trademark_similarity`, `kis_trading`, `sec_edgar`

### Infrastructure (7)
`uptime_monitor`, `security_scanner`, `dns_lookup`, `ssl_checker`, `regex_matcher`, `unit_converter`, `random_generator`

### Social (2)
`publish_instagram`, `get_instagram_insights`

### Knowledge (1)
`search_department_knowledge`

### Core (1)
`call_agent` — MCP 기반 N-tier 핸드오프 (Phase 1 핵심)

---

## 4. V1에만 있는 도구 (마이그레이션 필요)

### 우선순위 A: 반드시 필요

| V1 도구 (Python) | 용도 | V2 상태 | 마이그레이션 방법 |
|-----------------|------|---------|-----------------|
| `audio_transcriber.py` | 오디오 → 텍스트 변환 | ❌ 없음 | Whisper API 또는 Google STT로 TS 재구현 |
| `competitor_sns_monitor.py` | 경쟁사 SNS 모니터링 | ❌ 없음 | Firecrawl MCP + 커스텀 핸들러 |
| `content_quality_scorer.py` | 콘텐츠 품질 채점 | ❌ 없음 | LLM 기반 평가로 TS 재구현 |
| `customer_ltv_model.py` | 고객 생애가치 모델링 | ❌ 없음 | 통계 라이브러리 + TS 재구현 |

### 우선순위 B: 유용하지만 나중에

| V1 도구 (Python) | 용도 | V2 상태 | 마이그레이션 방법 |
|-----------------|------|---------|-----------------|
| `churn_risk_scorer.py` | 이탈 위험 분석 | ❌ 없음 | TS 재구현 |
| `cohort_retention.py` | 코호트 분석 | ❌ 없음 | TS 재구현 |
| `correlation_analyzer.py` | 상관관계 분석 | ❌ 없음 | simple-statistics 라이브러리 활용 |
| `dcf_valuator.py` | DCF 가치평가 | ❌ 없음 | TS 재구현 |
| `ai_model_evaluator.py` | AI 모델 평가 | ❌ 없음 | TS 재구현 |
| `ai_governance_checker.py` | AI 거버넌스 체크 | ❌ 없음 | 규칙 기반 TS 재구현 |
| `architecture_evaluator.py` | 아키텍처 평가 | ❌ 없음 | TS 재구현 |
| `communication_optimizer.py` | 커뮤니케이션 최적화 | ❌ 없음 | TS 재구현 |

### 우선순위 C: V1 전용 (별도 검토)

| V1 도구 | 용도 | 비고 |
|---------|------|------|
| Opinion Scrapers (5개) | 다음카페, 네이버블로그, Orbi, Tistory, DC인사이드 크롤링 | LeetMaster 마케팅에 필요 |
| `dc_lawschool_crawler.py` | 법학전문대학원 DC 크롤링 | LeetMaster 특화 |
| `app_review_scraper.py` | 앱 리뷰 크롤링 | 마켓 분석용 |

---

## 5. 신규 개발 필요 도구

### 이번 리서치에서 확인된 신규 도구

| 도구 | 카테고리 | 관련 보고서 |
|------|---------|-----------|
| `generate_pdf` | 보고서 | 01-ocr-pdf-report-tools.md |
| `publish_to_notion` | 보고서 배포 | 01-ocr-pdf-report-tools.md |
| `send_report_email` | 보고서 배포 | 01-ocr-pdf-report-tools.md |
| `publish_x` | SNS | 02-marketing-content-pipeline.md |
| `publish_tistory` | SNS | 02-marketing-content-pipeline.md |
| `publish_daum_cafe` | SNS | 02-marketing-content-pipeline.md |
| `publish_youtube` | SNS | 02-marketing-content-pipeline.md |
| `generate_card_news` | 콘텐츠 제작 | 02-marketing-content-pipeline.md |
| `generate_video` | 콘텐츠 제작 | 02-marketing-content-pipeline.md |
| `generate_ai_image` | 콘텐츠 제작 | 02-marketing-content-pipeline.md |

---

## 6. 도구 핸들러 작성 표준

### 파일명 규칙
- `kebab-case.ts` (예: `publish-instagram.ts`, `generate-pdf.ts`)

### 핸들러 구조 템플릿

```typescript
// packages/server/src/lib/tool-handlers/builtins/{name}.ts
import type { ToolHandler, ToolExecutionContext, ToolResult } from '../types';

export const myToolHandler: ToolHandler = {
  name: 'my_tool_name',       // snake_case
  description: '도구 설명 (LLM이 읽음)',
  inputSchema: {
    type: 'object',
    properties: {
      // Zod가 아닌 JSON Schema 형식
      param1: { type: 'string', description: '설명' },
    },
    required: ['param1'],
  },

  async execute(input: Record<string, unknown>, ctx: ToolExecutionContext): Promise<ToolResult> {
    try {
      // 1. 입력 검증
      // 2. 크리덴셜 조회 (ctx.credentials)
      // 3. 비즈니스 로직 실행
      // 4. DB 접근 시 getDB(ctx.companyId)만 사용
      // 5. 결과 반환

      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: { code: 'TOOL_ERROR', message: error.message },
      };
    }
  },
};
```

### 레지스트리 등록

```typescript
// registry.ts에 추가
import { myToolHandler } from './builtins/my-tool-name';
registry.register(myToolHandler);
```

### DB 시드 (tool_definitions)

```typescript
// seed에 추가
{
  name: 'my_tool_name',
  displayName: '도구 표시 이름',
  description: '도구 설명',
  category: 'report' | 'social' | 'finance' | 'analysis' | 'utility' | 'content',
  handler: 'my-tool-name',  // 파일명과 매칭
  inputSchema: { /* JSON Schema */ },
  config: { /* 추가 설정 */ },
  isBuiltin: true,
}
```

---

## 7. 리팩토링 체크리스트

### 기존 V2 도구 확인 필요 항목

- [ ] `publish_instagram` — 캐러셀(카드뉴스), 릴스 지원 확인
- [ ] `get_instagram_insights` — 게시물별 상세 지표 확인
- [ ] `generate_image` — 어떤 API 사용 중인지 확인 (Flux? DALL-E?)
- [ ] `text_to_speech` — 어떤 서비스 사용 중인지 확인
- [ ] `search_web` — 어떤 검색 엔진 사용 중인지 확인
- [ ] `send_email` — 어떤 SMTP/API 사용 중인지 확인
- [ ] `content_calendar` — 기능 범위 확인
- [ ] `chart_generator` — 출력 형식 확인 (이미지? HTML?)

### Opinion Scraper 마이그레이션

V1의 `leet-opinion-scraper/` 디렉토리에 5개 크롤러가 있습니다:
- Daum Cafe 크롤러
- Naver Blog 크롤러
- Orbi 크롤러
- Tistory 크롤러
- DC Inside 크롤러

**마이그레이션 전략:**
1. Python → TypeScript 변환
2. Playwright MCP 서버 활용 (브라우저 자동화 부분)
3. 또는 Firecrawl MCP 활용 (웹 스크래핑 부분)
4. V2 ToolHandler 인터페이스에 맞게 래핑

---

## 8. 전체 도구 로드맵

### Phase 1 (엔진 구축)
- `call_agent` (핵심 — 이미 설계됨)
- Hook 파이프라인 (permission, scrubber, redactor, tracker)
- 기존 44개 도구 핸들러 검증 및 수정

### Phase 2 (보고서 & 배포)
- `generate_pdf` (md-to-pdf)
- `publish_to_notion` (@notionhq/client + martian)
- `send_report_email` (nodemailer)

### Phase 3 (마케팅 도구)
- `publish_x` (twitter-api-v2)
- `publish_youtube` (googleapis)
- `generate_card_news` (satori + resvg)
- `generate_ai_image` (OpenAI + Flux)
- `generate_video` (remotion + ffmpeg)
- `publish_tistory` (playwright 자동화)
- `publish_daum_cafe` (playwright 자동화)

### Phase 4 (고급 도구)
- Opinion Scrapers 마이그레이션
- `audio_transcriber` (Whisper)
- NotebookLM MCP 연동
- SketchVibe MCP 연동

---

## 9. 참고 파일 경로

| 파일 | 위치 |
|------|------|
| V2 도구 핸들러 | `packages/server/src/lib/tool-handlers/builtins/` |
| V2 DB 스키마 | `packages/server/src/db/schema.ts` |
| V2 도구 CRUD API | `packages/server/src/routes/admin/tools.ts` |
| V2 아키텍처 | `_bmad-output/planning-artifacts/architecture.md` |
| V2 PRD | `_bmad-output/planning-artifacts/prd.md` |
| V1 Python 도구 | `../CORTHEX_HQ/CORTHEX_HQ/src/tools/` |
| V1 Opinion Scrapers | `../CORTHEX_HQ/tools/leet-opinion-scraper/` |
| SketchVibe Canvas AI | `../skechvibe/05_v2_소스코드/backend/canvas-ai.ts` |
