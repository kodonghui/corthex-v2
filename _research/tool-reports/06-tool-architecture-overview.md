# 도구 보고서 #6: 종합 — 도구 통합 아키텍처
> CORTHEX v2 도구 시스템 전체 설계 + 모든 보고서 요약
> 작성일: 2026-03-11 | BMAD 참고용

---

## 1. 보고서 색인

| # | 문서 | 핵심 내용 |
|---|------|----------|
| 01 | [OCR + PDF 도구](./01-ocr-pdf-tools.md) | Claude Vision OCR, md-to-pdf, MarkItDown |
| 02 | [MD 보고서 산출 시스템](./02-md-report-system.md) | save_report, 배포 채널 (Notion/이메일/Drive/NotebookLM) |
| 03 | [마케팅 콘텐츠 파이프라인](./03-marketing-content-pipeline.md) | 5개 플랫폼 도구 + 영상/이미지 제작 도구 |
| 04 | [MCP 서버 통합 가이드](./04-mcp-integration-guide.md) | 50+ MCP 서버 조사, 동적 연결 패턴 |
| 05 | [캐싱 기술 활용](./05-caching-strategy.md) | Prompt/Semantic/Tool 3레이어 캐싱 |
| 07 | [웹 크롤링/스크래핑 도구](./07-web-crawling-scraping.md) | Firecrawl, Jina Reader, Bright Data, Crawlee, Playwright |
| 별도 | [MCP 서버 상세 조사](../mcp-servers-research-2025-2026.md) | 13개 카테고리, 50+ MCP 서버 상세 정보 |

---

## 2. 현재 도구 현황 vs 신규 도구

### 2.1 기존 도구 (v1→v2 이관 대상, 56개)

| 카테고리 | 도구 | 리팩토링 필요 여부 |
|---------|------|-----------------|
| 일반 | get_current_time, calculate, file_manager | 그대로 유지 |
| 검색 | search_web, search_news, search_images, search_youtube | 그대로 유지 |
| 금융 | kr_stock, dart_api, sec_edgar, backtest_engine, kis_trading, get_stock_price | Tool Cache 추가 |
| 법률 | law_search, contract_reviewer, trademark_similarity, patent_search | 그대로 유지 |
| 콘텐츠 | publish_instagram, hashtag_generator, content_calendar, engagement_analyzer | **리팩토링** (03번 참조) |
| 기술 | uptime_monitor, security_scanner, code_quality, dns_lookup, ssl_checker | 그대로 유지 |
| 통신 | send_email, telegram | send_email: PDF 첨부 추가 |
| 연동 | calendar, notion, text_to_speech, image_generation, translation | **MCP로 전환 가능** |
| 차트 | chart_generator, spreadsheet_tool | 그대로 유지 |

### 2.2 신규 도구 (전체 목록)

| 도구 | 보고서 | 우선순위 | 복잡도 |
|------|--------|---------|--------|
| `ocr_document` | 01 | P1 | 낮음 |
| `md_to_pdf` | 01 | P0 | 낮음 |
| `pdf_to_md` | 01 | P1 | 낮음 (MCP) |
| `save_report` | 02 | P0 | 중간 |
| `list_reports` | 02 | P0 | 낮음 |
| `get_report` | 02 | P0 | 낮음 |
| `publish_tistory` | 03 | P0 | 낮음 |
| `publish_x` | 03 | P0 | 낮음 |
| `publish_youtube` | 03 | P1 | 중간 |
| `generate_video` | 03 | P1 | 중간 |
| `generate_card_news` | 03 | P1 | 중간 |
| `compose_video` | 03 | P2 | 높음 |
| `upload_media` | 03 | P0 | 낮음 |
| `content_calendar` (리팩) | 03 | P1 | 낮음 |
| `publish_daum_cafe` | 03 | P3 | 높음 |
| `read_web_page` | 07 | P0 | 매우 낮음 (fetch 1줄) |
| `web_crawl` | 07 | P1 | 낮음 (Firecrawl API) |
| `crawl_site` | 07 | P2 | 중간 (Crawlee) |

**합계: 신규 18개 + 리팩토링 ~5개**

---

## 3. 도구 등록 패턴 (모든 도구 공통)

### 3.1 파일 구조

```
packages/server/src/lib/tool-handlers/
  ├── types.ts                    # ToolRegistration, ToolExecContext 타입
  ├── registry.ts                 # Map<string, ToolHandler> 레지스트리
  ├── index.ts                    # 모든 도구 import + 등록
  └── builtins/
      ├── get-current-time.ts     # 기존 56개...
      ├── ocr-document.ts         # 신규
      ├── md-to-pdf.ts            # 신규
      ├── save-report.ts          # 신규
      ├── publish-tistory.ts      # 신규
      ├── publish-x.ts            # 신규
      ├── publish-youtube.ts      # 신규
      ├── generate-video.ts       # 신규
      ├── generate-card-news.ts   # 신규
      ├── compose-video.ts        # 신규
      ├── upload-media.ts         # 신규
      └── ...
```

### 3.2 표준 도구 핸들러 템플릿

```typescript
// 모든 신규 도구는 이 패턴을 따라야 함
import { z } from 'zod'
import type { ToolRegistration, ToolExecContext } from '../types'

// 1. Zod 스키마 정의 (필수)
const myToolSchema = z.object({
  param1: z.string().describe('LLM이 이해할 수 있는 파라미터 설명'),
  param2: z.number().optional(),
})

// 2. 도구 등록 (필수)
export const myTool: ToolRegistration = {
  name: 'my_tool',           // snake_case
  description: '도구 설명',   // LLM에게 보여줄 설명
  category: 'productivity',   // 카테고리
  parameters: myToolSchema,

  // 3. 실행 함수 (필수)
  execute: async (params: unknown, ctx: ToolExecContext) => {
    const parsed = myToolSchema.parse(params) // Zod 검증

    // 4. 크리덴셜은 반드시 ctx.getCredentials() 사용
    const creds = await ctx.getCredentials('service_name')

    // 5. DB 접근은 반드시 getDB(ctx.companyId)
    const db = getDB(ctx.companyId)

    // 6. 비즈니스 로직
    const result = await doSomething(parsed, creds)

    // 7. 반환: JSON 문자열, 최대 4,000자
    return JSON.stringify({ success: true, data: result })
  }
}
```

### 3.3 금지 패턴 (Anti-Patterns)

```typescript
// ❌ 하드코딩된 API 키
const API_KEY = 'sk-...'

// ❌ 직접 DB import
import { db } from '../../db'

// ❌ engine 내부 import
import { hookPipeline } from '../../engine/hooks/pipeline'

// ❌ 4,000자 초과 반환
return JSON.stringify(hugeObject)

// ❌ 동기 실행
const result = syncFunction()
```

---

## 4. 필요 패키지 총정리

### 신규 설치

```bash
cd packages/server

# 문서 처리
bun add md-to-pdf              # MD → PDF 변환

# 웹 크롤링
bun add @mendable/firecrawl-js # Firecrawl API
# Jina Reader는 fetch만 사용, 패키지 불필요
# Crawlee (Phase 2+):
# bun add crawlee playwright

# 마케팅 플랫폼
bun add twitter-api-v2          # X/Twitter API
bun add replicate               # AI 이미지/영상 (Flux, Kling)
bun add marked                  # MD → HTML (Tistory용)

# 미디어 처리
bun add sharp                   # 이미지 처리/리사이즈
bun add @napi-rs/canvas         # Canvas API (텍스트 렌더링)

# 영상 제작 (Phase 2)
bun add remotion @remotion/cli @remotion/renderer

# 파일 호스팅
bun add @aws-sdk/client-s3      # Cloudflare R2 (S3 호환)

# 프론트엔드 (packages/admin)
cd ../admin
bun add react-markdown remark-gfm rehype-highlight
```

### 선택적 (필요 시)

```bash
bun add @runwayml/sdk           # Runway Gen-4 (Kling 대안)
bun add googleapis              # YouTube API (이미 있을 수 있음)
```

### Dockerfile 업데이트

```dockerfile
# Puppeteer/Chromium (md-to-pdf용)
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-noto-cjk \          # 한국어/일본어/중국어 폰트
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Sharp (이미지 처리, ARM64 호환)
# → bun add sharp 시 자동으로 플랫폼별 바이너리 설치
```

---

## 5. DB 마이그레이션 총정리

### 신규 테이블

```sql
-- 보고서 (02번 문서)
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  company_id UUID NOT NULL,
  agent_id UUID REFERENCES agents(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  tags JSONB DEFAULT '[]',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MCP 서버 설정 (04번 문서)
CREATE TABLE mcp_server_configs (
  id SERIAL PRIMARY KEY,
  company_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  transport VARCHAR(10) NOT NULL,
  command VARCHAR(500),
  args JSONB DEFAULT '[]',
  env JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 에이전트-MCP 접근 권한 (04번 문서)
CREATE TABLE agent_mcp_access (
  agent_id UUID REFERENCES agents(id),
  mcp_config_id INT REFERENCES mcp_server_configs(id),
  PRIMARY KEY (agent_id, mcp_config_id)
);

-- 시맨틱 캐시 (05번 문서, Phase 3)
CREATE TABLE semantic_cache (
  id SERIAL PRIMARY KEY,
  company_id UUID NOT NULL,
  query_text TEXT NOT NULL,
  query_embedding VECTOR(1536),
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 콘텐츠 캘린더 (03번 문서)
CREATE TABLE content_calendar (
  id SERIAL PRIMARY KEY,
  company_id UUID NOT NULL,
  platform VARCHAR(20) NOT NULL,
  content_type VARCHAR(20) NOT NULL,
  topic TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'idea',
  assigned_agent_id UUID REFERENCES agents(id),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  external_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 인덱스

```sql
CREATE INDEX idx_reports_company ON reports(company_id, created_at DESC);
CREATE INDEX idx_mcp_configs_company ON mcp_server_configs(company_id);
CREATE INDEX idx_content_calendar_company ON content_calendar(company_id, scheduled_at);
CREATE INDEX idx_semantic_cache_company ON semantic_cache(company_id, expires_at);
```

---

## 6. 크리덴셜 총정리

| 서비스 | 크리덴셜 키 | 등록 방법 |
|--------|------------|----------|
| Instagram | `instagram_access_token`, `instagram_business_id` | Facebook App → Graph API |
| Tistory | `tistory_access_token` | OAuth 2.0 앱 등록 |
| X (Twitter) | `x_api_key`, `x_api_secret`, `x_access_token`, `x_access_secret` | X Developer Portal |
| YouTube | `google_oauth_refresh_token` | Google Cloud Console |
| Replicate | `replicate_api_token` | replicate.com 가입 |
| Runway | `runway_api_token` | runwayml.com 가입 |
| ElevenLabs | `elevenlabs_api_key` | elevenlabs.io 가입 |
| Notion | `notion_integration_token` | Notion Integration |
| Google Workspace | `google_client_id`, `google_client_secret`, `google_refresh_token` | Google Cloud Console |
| Cloudflare R2 | `r2_account_id`, `r2_access_key_id`, `r2_secret_access_key` | Cloudflare Dashboard |

---

## 7. Phase별 구현 로드맵

### Phase 1: 엔진 + 핵심 도구 (현재)
- [ ] `engine/agent-loop.ts` + Prompt Caching (cache_control)
- [ ] `save_report` + `list_reports` + `get_report`
- [ ] `md_to_pdf` (보고서 PDF 변환)
- [ ] `upload_media` (R2 파일 호스팅)
- [ ] reports 테이블 마이그레이션
- [ ] 웹 대시보드 보고서 뷰어

### Phase 2: 마케팅 + MCP + Tool Cache
- [ ] `publish_tistory`, `publish_x`
- [ ] `publish_instagram` 리팩토링 (카루셀/릴스)
- [ ] `generate_image` 리팩토링 (Replicate Flux)
- [ ] `generate_card_news`
- [ ] MCP 동적 연결 인프라
- [ ] Notion MCP, Playwright MCP, GitHub MCP
- [ ] Tool Result Caching (인메모리)
- [ ] mcp_server_configs 테이블
- [ ] content_calendar 테이블

### Phase 3: 영상 + 시맨틱 캐시
- [ ] `generate_video` (Replicate Kling)
- [ ] `compose_video` (Remotion)
- [ ] `publish_youtube`
- [ ] `text_to_speech` 리팩토링 (영상 나레이션)
- [ ] Semantic Caching (pgvector)
- [ ] Google Workspace MCP
- [ ] 이메일 보고서 발송

### Phase 4+: 확장
- [ ] `publish_daum_cafe` (Playwright 자동화)
- [ ] 한국 플랫폼 MCP (Naver 등)
- [ ] Redis 전환 (다중 서버)
- [ ] NotebookLM 연동
- [ ] 마케팅팀 자동 파이프라인 (콘텐츠 캘린더 → 자동 제작 → 자동 배포)

---

## 8. 비용 영향 분석

### 월간 예상 비용 (사용량 가정: 에이전트 10명, 일 500회 호출)

| 항목 | 캐싱 없이 | 캐싱 적용 | 비고 |
|------|----------|----------|------|
| Claude API (토큰) | $150 | $30 | Prompt Caching 80% 절감 |
| Replicate (이미지) | $20 | $20 | 캐시 불가 |
| Replicate (영상) | $15 | $15 | 캐시 불가 |
| X API (Basic) | $200 | $200 | 고정 비용 |
| Cloudflare R2 | $2 | $2 | 소량 |
| **합계** | **$387/월** | **$267/월** | **31% 절감** |

---

## 9. 마케팅팀 에이전트 Soul 예시

```markdown
# 마케팅 부서장 Soul

## 역할
당신은 LeetMaster 마케팅팀 부서장입니다. 콘텐츠 기획, 제작, 배포를 총괄합니다.

## 사용 가능한 도구
{{tool_list}}

## 팀원
{{agent_list}}

## 업무 원칙
1. 모든 콘텐츠는 LeetMaster 브랜드 가이드라인을 준수합니다
2. 카드뉴스는 5~8장으로 구성하며, 각 장에 핵심 메시지 1개씩
3. 블로그 글은 2,000~4,000자, SEO 키워드 3~5개 포함
4. 릴스/쇼츠는 15~30초, 세로형(9:16), 자막 필수
5. 콘텐츠 캘린더를 항상 확인하고 일정에 맞춰 제작합니다

## 배포 규칙
- 블로그 글: Tistory 발행 → X에 링크 공유
- 카드뉴스: Instagram 카루셀 → X에 1장 발췌 공유
- 릴스: Instagram + YouTube Shorts 동시 업로드
- 모든 배포 후 content_calendar 상태 업데이트

## 보고서 작성
- 주간 마케팅 보고서: 매주 금요일 save_report로 저장
- 배포 채널: web_dashboard + notion
```

---

## Sources
- 각 문서 내 Sources 섹션 참조
- [CORTHEX v2 Architecture](../../_bmad-output/planning-artifacts/architecture.md)
- [CORTHEX v2 PRD](../../_bmad-output/planning-artifacts/prd.md)
- [PoC 결과](../../_poc/agent-engine-v3/POC-RESULT.md)
