# 도구 보고서 #7: 웹 크롤링/스크래핑 도구
> CORTHEX v2 직원(AI Agent)용 웹 데이터 수집 도구
> 작성일: 2026-03-11 | BMAD 참고용

---

## 1. 개요

CORTHEX v2 AI 직원이 웹에서 데이터를 수집해야 하는 경우:
- **시장 조사**: 경쟁사 웹사이트, 제품 정보 수집
- **뉴스/트렌드**: 특정 키워드의 최신 기사 수집
- **콘텐츠 소싱**: 마케팅 참고 자료 수집
- **가격 모니터링**: 경쟁 제품 가격 추적
- **법률/규제**: 법령 변경사항 모니터링
- **다음카페 자동화**: 공식 API 없는 플랫폼 접근 (03번 문서 연계)

---

## 2. 도구 분류 체계

| 레이어 | 도구 유형 | 용도 | 예시 |
|--------|----------|------|------|
| **L1: API** | SaaS 크롤링 API | 가장 편리, 관리 비용 0 | Firecrawl, Jina Reader |
| **L2: MCP** | MCP 서버 | AI 에이전트에 직접 연결 | Firecrawl MCP, Bright Data MCP, Playwright MCP |
| **L3: 프레임워크** | 크롤링 프레임워크 | 커스텀 크롤러 구축 | Crawlee, Scrapy |
| **L4: 라이브러리** | 저수준 라이브러리 | 세밀한 제어 | Playwright, Puppeteer, Cheerio |

**CORTHEX v2 추천 접근법**: L1(API) + L2(MCP)를 기본으로, 특수 케이스만 L3~L4 사용

---

## 3. L1: SaaS 크롤링 API

### 3.1 Firecrawl (추천 1순위)

| 항목 | 상세 |
|------|------|
| **GitHub** | [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) |
| **Stars** | 85,000+ |
| **npm** | `@mendable/firecrawl-js` |
| **MCP** | `firecrawl-mcp` (npm, 공식) |
| **기능** | URL → LLM-ready 마크다운, 사이트맵 크롤링, 배치 스크래핑, 구조화 데이터 추출 |
| **특징** | 광고/네비게이션 자동 제거, JavaScript 렌더링, AI 기반 콘텐츠 분석 |
| **가격** | 무료 500크레딧/월, Starter $19/월 (3,000), Growth $99/월 (100,000) |
| **MCP 도구** | 12개 (scrape, crawl, map, batch, search, extract, deep_research 등) |
| **설치** | `bun add @mendable/firecrawl-js` |
| **펀딩** | Series A $14.5M (2025.08) |

```typescript
// 내장 도구로 구현
import FirecrawlApp from '@mendable/firecrawl-js'

const firecrawlSchema = z.object({
  url: z.string().url().describe('크롤링할 URL'),
  mode: z.enum(['scrape', 'crawl', 'map']).default('scrape'),
  formats: z.array(z.enum(['markdown', 'html', 'links', 'screenshot'])).default(['markdown']),
  max_pages: z.number().default(10).describe('crawl 모드 시 최대 페이지 수'),
})

export const webCrawl: ToolRegistration = {
  name: 'web_crawl',
  description: '웹 페이지를 크롤링하여 깨끗한 마크다운으로 변환합니다.',
  category: 'research',
  parameters: firecrawlSchema,
  execute: async (params, ctx) => {
    const parsed = firecrawlSchema.parse(params)
    const creds = await ctx.getCredentials('firecrawl_api_key')
    const app = new FirecrawlApp({ apiKey: creds })

    if (parsed.mode === 'scrape') {
      const result = await app.scrapeUrl(parsed.url, {
        formats: parsed.formats,
      })
      return JSON.stringify({ success: true, data: {
        title: result.metadata?.title,
        content: result.markdown?.slice(0, 3800), // 4000자 제한
        url: parsed.url,
      }})
    }

    if (parsed.mode === 'crawl') {
      const result = await app.crawlUrl(parsed.url, {
        limit: parsed.max_pages,
        scrapeOptions: { formats: ['markdown'] },
      })
      return JSON.stringify({ success: true, data: {
        pages: result.data?.length,
        urls: result.data?.map(p => p.metadata?.sourceURL),
      }})
    }

    // map: 사이트맵 추출
    const result = await app.mapUrl(parsed.url)
    return JSON.stringify({ success: true, data: result })
  }
}
```

### 3.2 Jina Reader (추천 2순위, 무료/간편)

| 항목 | 상세 |
|------|------|
| **GitHub** | [jina-ai/reader](https://github.com/jina-ai/reader) |
| **Stars** | 10,000+ |
| **원리** | URL 앞에 `https://r.jina.ai/` 접두사 → 마크다운 반환 |
| **가격** | 무료 (기본), API 키 사용 시 더 높은 rate limit |
| **MCP** | Jina Reader MCP 있음 (augmentcode.com에 등록) |
| **특징** | 29개 언어 지원, HTML→마크다운 변환 특화, 512K 토큰 문서 지원 |
| **ReaderLM-v2** | 1.5B 파라미터 로컬 모델도 제공 (self-hosted 가능) |

```typescript
// 가장 간단한 구현
const jinaReaderSchema = z.object({
  url: z.string().url().describe('읽을 웹 페이지 URL'),
})

export const readWebPage: ToolRegistration = {
  name: 'read_web_page',
  description: '웹 페이지를 깨끗한 마크다운 텍스트로 읽어옵니다. 광고/메뉴 자동 제거.',
  category: 'research',
  parameters: jinaReaderSchema,
  execute: async (params, ctx) => {
    const parsed = jinaReaderSchema.parse(params)
    const response = await fetch(`https://r.jina.ai/${parsed.url}`, {
      headers: {
        'Accept': 'text/markdown',
        // API 키 있으면: 'Authorization': `Bearer ${apiKey}`
      }
    })
    const markdown = await response.text()
    return JSON.stringify({ success: true, data: {
      content: markdown.slice(0, 3800),
      url: parsed.url,
    }})
  }
}
```

**Jina vs Firecrawl 비교:**
| 기준 | Jina Reader | Firecrawl |
|------|------------|-----------|
| 가격 | 무료(기본) | 무료 500크레딧/월 |
| 설치 | fetch 한 줄 | npm 패키지 |
| 사이트맵 크롤링 | ❌ | ✅ (crawl, map) |
| 배치 처리 | ❌ | ✅ |
| 구조화 추출 | ❌ | ✅ (JSON 스키마) |
| 속도 | 빠름 (7초 평균) | 빠름 |
| **추천** | 단일 페이지 읽기 | 사이트 전체 크롤링 |

---

## 4. L2: MCP 서버

### 4.1 Firecrawl MCP (추천)

| 항목 | 상세 |
|------|------|
| **npm** | `firecrawl-mcp` |
| **도구 수** | 12개 |
| **설치** | `npx firecrawl-mcp` |
| **특징** | 클라우드 + 셀프호스팅 모두 지원, SSE 스트리밍 |

**MCP 설정:**
```json
{
  "name": "firecrawl",
  "display_name": "웹 크롤링 (Firecrawl)",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "firecrawl-mcp"],
  "env": {
    "FIRECRAWL_API_KEY": "{{credential:firecrawl_api_key}}"
  }
}
```

**제공 도구 (12개):**
| 도구 | 설명 |
|------|------|
| `firecrawl_scrape` | 단일 URL → 마크다운 |
| `firecrawl_crawl` | 사이트 전체 크롤링 |
| `firecrawl_map` | 사이트맵 추출 |
| `firecrawl_batch_scrape` | 다중 URL 배치 처리 |
| `firecrawl_search` | 웹 검색 + 콘텐츠 추출 |
| `firecrawl_extract` | 구조화 데이터 추출 (JSON 스키마) |
| `firecrawl_deep_research` | AI 딥 리서치 |
| `firecrawl_generate_llmstxt` | llms.txt 생성 |
| 등 | 비동기 작업 관리 도구들 |

### 4.2 Bright Data MCP

| 항목 | 상세 |
|------|------|
| **npm** | `@brightdata/mcp` |
| **GitHub** | [brightdata/brightdata-mcp](https://github.com/brightdata/brightdata-mcp) |
| **가격** | 무료 5,000요청/월, 유료 가변 |
| **특징** | 프록시 자동 로테이션, CAPTCHA 자동 해결, 차단 우회 |
| **벤치마크** | 웹 추출 성공률 100%, 브라우저 자동화 성공률 90% (2026 벤치마크 1위) |

**MCP 설정:**
```json
{
  "name": "brightdata",
  "display_name": "웹 크롤링 (Bright Data)",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@brightdata/mcp"],
  "env": {
    "API_TOKEN": "{{credential:brightdata_api_token}}"
  }
}
```

**제공 도구:**
| 도구 | 설명 |
|------|------|
| `search_engine` | 검색 엔진 결과 (Google, Bing, Naver 등) |
| `scrape_as_markdown` | URL → 마크다운 |
| `scrape_as_html` | URL → HTML |
| `session_stats` | 세션 통계 |

**Firecrawl vs Bright Data:**
| 기준 | Firecrawl | Bright Data |
|------|-----------|-------------|
| 무료 | 500크레딧/월 | 5,000요청/월 |
| 차단 우회 | 기본 | **최고** (프록시 네트워크) |
| 속도 | 7초 평균 | 30~48초 평균 |
| 한국 사이트 | 보통 | **우수** (네이버 등 프록시) |
| MCP 도구 수 | 12개 | 4개 |
| **추천** | 일반 크롤링 | 차단이 심한 사이트 |

### 4.3 Playwright MCP (Microsoft, 브라우저 자동화)

| 항목 | 상세 |
|------|------|
| **npm** | `@anthropic-ai/mcp-playwright` |
| **Stars** | 28,600 |
| **제공** | Microsoft 공식 |
| **특징** | 브라우저 제어 (클릭, 입력, 스크롤, 스크린샷) |
| **용도** | 다음카페/네이버카페 자동화, 로그인 필요 사이트 |

**04번 문서에 이미 포함됨.** 크롤링 전용이 아닌 **브라우저 자동화** 도구이므로, 로그인/폼 입력 등이 필요한 경우에 사용.

### 4.4 Context7 MCP (기술 문서 전용)

| 항목 | 상세 |
|------|------|
| **GitHub** | Upstash 제공 |
| **Stars** | 48,500 |
| **용도** | 라이브러리/프레임워크 공식 문서 검색 |
| **특징** | 버전별 최신 문서 제공, 개발팀 전용 |

---

## 5. L3: 크롤링 프레임워크 (커스텀 크롤러 구축 시)

### 5.1 Crawlee (추천)

| 항목 | 상세 |
|------|------|
| **GitHub** | [apify/crawlee](https://github.com/apify/crawlee) |
| **Stars** | 16,000+ |
| **npm** | `crawlee` |
| **언어** | TypeScript/JavaScript |
| **제공사** | Apify |
| **특징** | Puppeteer/Playwright/Cheerio 통합, 프록시 로테이션, 세션 관리, 큐잉, 자동 재시도 |
| **설치** | `bun add crawlee playwright` |

```typescript
// Crawlee를 활용한 커스텀 크롤러 예시
import { PlaywrightCrawler } from 'crawlee'

const crawlSiteSchema = z.object({
  start_url: z.string().url(),
  max_pages: z.number().default(20),
  selector: z.string().optional().describe('CSS 선택자 (특정 요소만 추출)'),
})

export const crawlSite: ToolRegistration = {
  name: 'crawl_site',
  description: '웹사이트를 심층 크롤링하여 데이터를 수집합니다. 대규모 수집 작업용.',
  category: 'research',
  parameters: crawlSiteSchema,
  execute: async (params, ctx) => {
    const parsed = crawlSiteSchema.parse(params)
    const results: { url: string; title: string; text: string }[] = []

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: parsed.max_pages,
      async requestHandler({ page, request, enqueueLinks }) {
        const title = await page.title()
        const text = parsed.selector
          ? await page.locator(parsed.selector).innerText()
          : await page.locator('body').innerText()

        results.push({
          url: request.url,
          title,
          text: text.slice(0, 500), // 요약
        })

        await enqueueLinks() // 링크 자동 탐색
      },
    })

    await crawler.run([parsed.start_url])
    return JSON.stringify({ success: true, data: {
      pages_crawled: results.length,
      results: results.slice(0, 10), // 상위 10개
    }})
  }
}
```

**Crawlee 활용 시나리오:**
- 경쟁사 제품 페이지 전체 크롤링
- 네이버 블로그 검색 결과 대량 수집
- 법률 데이터 정기 수집 (장기 자동화)

### 5.2 Scrapy (Python, 참고)
- Python 최대 크롤링 프레임워크
- CORTHEX v2는 TypeScript 기반이므로 **Crawlee 추천**
- Python 도구로 별도 운영 가능하나 유지보수 복잡

---

## 6. L4: 저수준 라이브러리 (직접 구현 시)

### 6.1 비교표

| 라이브러리 | npm | Stars | JS 렌더링 | 속도 | 메모리 | 용도 |
|-----------|-----|-------|----------|------|--------|------|
| **Cheerio** | `cheerio` | 28,000+ | ❌ | 최고 | 최소 | 정적 HTML 파싱 |
| **Puppeteer** | `puppeteer` | 89,000+ | ✅ (Chrome) | 보통 | ~200MB | Chrome 자동화 |
| **Playwright** | `playwright` | 70,000+ | ✅ (멀티) | 보통 | ~200MB | 멀티 브라우저 |
| **JSDOM** | `jsdom` | 20,000+ | 부분 | 빠름 | 중간 | DOM 시뮬레이션 |

### 6.2 판단 기준

```
정적 HTML (서버 렌더링, 블로그, 뉴스) → Cheerio (빠르고 가벼움)
동적 SPA (React, Angular) → Playwright (JS 실행 필요)
로그인 필요 → Playwright (쿠키/세션 관리)
대량 수집 (1,000+ 페이지) → Crawlee + Cheerio (효율성)
단일 페이지 읽기 → Jina Reader (가장 간편)
사이트맵 크롤링 → Firecrawl (전문 API)
차단 우회 필요 → Bright Data (프록시 네트워크)
```

---

## 7. CORTHEX v2 아키텍처 통합

### 7.1 추천 도구 조합

```
┌─ 기본 (모든 에이전트) ─────────────────────────────┐
│  read_web_page (Jina Reader) — 단일 페이지, 무료    │
│  search_web (기존 도구) — 검색 결과 수집             │
└───────────────────────────────────────────────────┘

┌─ 리서치팀/마케팅팀 ────────────────────────────────┐
│  web_crawl (Firecrawl) — 사이트 크롤링, 배치 처리    │
│  Firecrawl MCP — 12개 도구 전체                     │
└───────────────────────────────────────────────────┘

┌─ 특수 용도 ────────────────────────────────────────┐
│  Bright Data MCP — 차단 우회, 한국 사이트            │
│  Playwright MCP — 다음카페, 로그인 사이트            │
│  crawl_site (Crawlee) — 대규모 커스텀 크롤링         │
└───────────────────────────────────────────────────┘
```

### 7.2 도구 등록 위치

```
packages/server/src/lib/tool-handlers/builtins/
  ├── read-web-page.ts        # Jina Reader (신규, P0)
  ├── web-crawl.ts            # Firecrawl (신규, P1)
  └── crawl-site.ts           # Crawlee (신규, P2)
```

### 7.3 MCP 연동 (04번 문서 참조)

```
mcp_server_configs 테이블:
  - firecrawl (12개 도구)
  - brightdata (4개 도구)
  - playwright (브라우저 자동화)
```

### 7.4 기존 도구와의 관계

| 기존 도구 | 변경사항 |
|----------|---------|
| `search_web` | 유지 (검색 결과 목록만 반환, 페이지 내용 X) |
| `search_news` | 유지 (뉴스 검색 특화) |
| `search_images` | 유지 |

**search_web vs read_web_page vs web_crawl:**
| 도구 | 용도 |
|------|------|
| `search_web` | "삼성전자 최신 뉴스" → 검색 결과 링크 목록 |
| `read_web_page` | "이 URL의 내용을 읽어줘" → 단일 페이지 마크다운 |
| `web_crawl` | "이 사이트 전체를 크롤링해서 분석해줘" → 다중 페이지 |

---

## 8. 비용 분석

### 월간 예상 (에이전트 10명, 일 100건 크롤링)

| 서비스 | 무료 한도 | 초과 비용 | 월 예상 |
|--------|----------|----------|--------|
| Jina Reader | 무제한 (기본) | API 키 시 토큰 기반 | $0 |
| Firecrawl | 500크레딧/월 | Starter $19/월 (3,000) | $19~$99 |
| Bright Data | 5,000요청/월 | 가변 | $0 (무료 내) |
| Crawlee | 오픈소스 | 서버 리소스만 | $0 |
| **합계** | | | **$19~$99/월** |

---

## 9. 크리덴셜 관리

| 서비스 | 키 이름 | 등록 방법 |
|--------|--------|----------|
| Firecrawl | `firecrawl_api_key` | firecrawl.dev 가입 → API Key |
| Bright Data | `brightdata_api_token` | brightdata.com → Dashboard → API Token |
| Jina Reader | `jina_api_key` (선택) | jina.ai → Reader API → API Key |

---

## 10. 구현 우선순위

| 우선순위 | 도구 | Phase | 이유 |
|---------|------|-------|------|
| **P0** | `read_web_page` (Jina) | Phase 1 | 무료, 5줄 구현, 즉시 사용 |
| **P1** | Firecrawl MCP 연동 | Phase 2 | 12개 도구 한번에 |
| **P1** | `web_crawl` (Firecrawl 내장) | Phase 2 | MCP 못 쓰는 경우 대비 |
| **P2** | Bright Data MCP | Phase 2 | 차단 우회 필요 시 |
| **P2** | Playwright MCP | Phase 2 | 다음카페 등 자동화 |
| **P3** | `crawl_site` (Crawlee) | Phase 3 | 대규모 커스텀 크롤링 |

---

## 11. BMAD 개발자 참고사항

### Phase 1 즉시 구현
- `read_web_page` (Jina Reader): fetch 한 줄로 구현 가능. 패키지 설치 불필요.
- 기존 `search_web`과 조합하면 "검색 → 링크 수집 → 페이지 읽기" 워크플로우 완성.

### Phase 2 구현
- Firecrawl MCP 연동 (04번 문서 MCP 인프라 구축 후)
- `web_crawl` 내장 도구 (MCP 없이도 동작하도록 백업)
- Bright Data MCP (한국 사이트 차단 우회용)

### 주의사항
- **robots.txt 준수**: 크롤링 전 robots.txt 확인 로직 포함
- **Rate Limiting**: 대상 사이트에 과도한 요청 방지 (1~2초 간격)
- **캐싱**: 동일 URL 반복 크롤링 방지 (05번 Tool Cache 적용)
- **결과 크기**: 4,000자 제한 → 긴 페이지는 요약 또는 분할

### 테스트 케이스
- [ ] Jina Reader: 한국어 뉴스 사이트 마크다운 변환 품질
- [ ] Jina Reader: JavaScript 렌더링 필요 사이트 (Jina 실패 → Firecrawl 폴백)
- [ ] Firecrawl: 사이트맵 크롤링 (10+ 페이지)
- [ ] Firecrawl: 구조화 데이터 추출 (제품 가격, 이름)
- [ ] Bright Data: 네이버 블로그 크롤링 (차단 우회)
- [ ] Playwright MCP: 다음카페 로그인 + 글 작성
- [ ] Crawlee: 대량 크롤링 (100+ 페이지) 안정성
- [ ] robots.txt 준수 확인
- [ ] Tool Cache 적용 (동일 URL 5분 내 캐시)

---

---

## 12. CLI-Anything 통합 계획 (Crawlee)

> **CLI-Anything**: [HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything) (13,242 stars)
> Claude Code 플러그인. 소프트웨어 소스코드를 분석해서 Python CLI + JSON 인터페이스를 자동 생성.
> AI 에이전트가 subprocess로 진짜 소프트웨어를 직접 제어할 수 있게 해줌.

### 12.1 왜 Crawlee × CLI-Anything인가?

현재 문제:
```
CORTHEX 에이전트 → Crawlee API (TypeScript 코드 직접 작성 필요)
  → PlaywrightCrawler 인스턴스 생성
  → requestHandler 콜백 정의
  → enqueueLinks 전략 설정
  → 결과 수집 로직 작성
  = 에이전트가 복잡한 코드를 매번 생성해야 함
```

CLI-Anything 적용 후:
```
CORTHEX 에이전트 → cli-anything crawlee (명령 한 줄)
  → "이 사이트 전체 크롤링해서 제품 가격 추출"
  → "네이버 블로그 검색 결과 100개 수집"
  → "경쟁사 사이트 변경사항 모니터링"
  = 복잡한 크롤러 코드 없이 CLI 명령으로 제어
```

### 12.2 Crawlee CLI-Anything 생성

**생성 명령:**
```bash
# Claude Code에서 실행
/plugin install cli-anything
/cli-anything https://github.com/apify/crawlee
```

**예상 생성 CLI 구조:**
```
agent-harness/cli_anything/crawlee/
├── cli.py                  # Click CLI 진입점
├── crawler.py              # 크롤러 관리 (create, run, status)
├── request_queue.py        # 요청 큐 (add, list, clear)
├── dataset.py              # 데이터셋 (list, export, query)
├── proxy.py                # 프록시 설정
├── session_pool.py         # 세션 풀 관리
└── tests/
    ├── test_crawler.py
    └── test_dataset.py
```

### 12.3 핵심 CLI 명령 (예상)

```bash
# 사이트 크롤링 (기본)
cli-anything crawlee crawl \
  --url "https://competitor.com/products" \
  --max-pages 50 \
  --crawler-type playwright \
  --output-format json \
  --json

# CSS 선택자로 구조화 데이터 추출
cli-anything crawlee extract \
  --url "https://shop.example.com/products" \
  --selectors '{"name": "h2.product-name", "price": "span.price", "image": "img.product-image@src"}' \
  --max-pages 100 \
  --output "/tmp/products.json" \
  --json

# 링크 탐색 전략 지정
cli-anything crawlee crawl \
  --url "https://blog.naver.com/search?query=LeetMaster" \
  --link-selector "a.post-title" \
  --max-depth 2 \
  --max-pages 50 \
  --wait-for "div.post-content" \
  --json

# 데이터셋 내보내기
cli-anything crawlee dataset export \
  --dataset-id "latest" \
  --format csv \
  --output "/tmp/crawl-results.csv" \
  --json

# 프록시 설정 (차단 우회)
cli-anything crawlee proxy set \
  --urls "http://proxy1:8080,http://proxy2:8080" \
  --rotation round-robin \
  --json

# 세션 관리 (로그인 유지)
cli-anything crawlee session create \
  --name "naver-login" \
  --cookies-file "/tmp/naver-cookies.json" \
  --json

# 크롤링 상태 확인
cli-anything crawlee status \
  --run-id "abc123" \
  --json
```

### 12.4 CORTHEX 도구 핸들러 통합

```typescript
// packages/server/src/lib/tool-handlers/builtins/crawl-site.ts
import { execSync } from 'child_process'

const crawlSiteSchema = z.object({
  action: z.enum(['crawl', 'extract', 'monitor', 'export']),

  // crawl
  url: z.string().url().describe('크롤링 시작 URL'),
  max_pages: z.number().default(20).describe('최대 페이지 수'),
  crawler_type: z.enum(['cheerio', 'playwright']).default('cheerio')
    .describe('cheerio=빠름(정적), playwright=느림(JS렌더링)'),
  max_depth: z.number().default(3).describe('링크 탐색 깊이'),
  link_selector: z.string().optional().describe('탐색할 링크 CSS 선택자'),
  wait_for: z.string().optional().describe('JS 렌더링 대기 CSS 선택자'),

  // extract
  selectors: z.record(z.string()).optional()
    .describe('구조화 추출: {"필드명": "CSS선택자"} 형식'),

  // monitor
  check_interval: z.number().optional().describe('모니터링 간격 (분)'),
  notify_on_change: z.boolean().default(true),

  // export
  format: z.enum(['json', 'csv', 'markdown']).default('json'),
  output_path: z.string().optional(),
})

async function executeCrawlee(action: string, args: Record<string, unknown>) {
  const flagArgs = Object.entries(args)
    .filter(([_, v]) => v !== undefined)
    .map(([k, v]) => {
      const flag = `--${k.replace(/_/g, '-')}`
      if (typeof v === 'boolean') return v ? flag : ''
      return `${flag} ${typeof v === 'object' ? JSON.stringify(JSON.stringify(v)) : JSON.stringify(String(v))}`
    })
    .filter(Boolean)
    .join(' ')

  const cmd = `cli-anything crawlee ${action} ${flagArgs} --json`
  const result = execSync(cmd, {
    encoding: 'utf-8',
    timeout: 600_000, // 10분 (대규모 크롤링)
    maxBuffer: 50 * 1024 * 1024, // 50MB
  })
  return JSON.parse(result)
}
```

### 12.5 에이전트 사용 시나리오

**시나리오 1: 경쟁사 가격 모니터링 (마케팅팀)**
```
마케팅 부서장: "경쟁사 3곳의 코딩 교육 가격 수집해줘"

리서치 에이전트:
1. crawl_site(action: 'extract',
     url: 'https://competitor1.com/pricing',
     selectors: {"plan": "h3.plan-name", "price": "span.price", "features": "ul.features"},
     max_pages: 5)
2. 같은 방식으로 competitor2, competitor3 크롤링
3. 결과 비교표 생성 → 부서장에게 보고
```

**시나리오 2: 블로그 콘텐츠 소싱 (카피라이터)**
```
카피라이터: "LeetMaster 관련 네이버 블로그 글 30개 수집"

1. crawl_site(action: 'crawl',
     url: 'https://search.naver.com/search.naver?query=LeetMaster',
     link_selector: 'a.title_link',
     max_pages: 30,
     crawler_type: 'playwright',
     wait_for: 'div.search_result')
2. 수집된 글에서 트렌드/키워드 분석
3. 콘텐츠 기획에 반영
```

**시나리오 3: 법률/규제 모니터링 (관리팀)**
```
관리 에이전트: "개인정보보호법 개정안 모니터링"

1. crawl_site(action: 'monitor',
     url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=...',
     check_interval: 60,  // 1시간마다
     notify_on_change: true)
2. 변경 감지 시 → 관리자에게 알림 + 변경 내용 요약
```

### 12.6 기존 도구와의 관계 (업데이트)

```
┌─ L0: 즉시 사용 (API 호출만) ────────────────────────┐
│  read_web_page (Jina Reader) — 단일 페이지, 무료      │
│  search_web (기존) — 검색 결과 링크 목록               │
└──────────────────────────────────────────────────────┘

┌─ L1: MCP 연동 (설정만) ─────────────────────────────┐
│  Firecrawl MCP — 12개 도구, 사이트맵 크롤링           │
│  Bright Data MCP — 차단 우회, 한국 사이트             │
│  Playwright MCP — 로그인 필요 사이트                  │
└──────────────────────────────────────────────────────┘

┌─ L2: CLI-Anything (NEW) ────────────────────────────┐
│  crawl_site (Crawlee via CLI-Anything)               │
│  → 대규모 커스텀 크롤링, 구조화 추출, 모니터링         │
│  → Firecrawl보다 세밀한 제어, 무료, 로컬 실행          │
│  → CLI-Anything가 Crawlee API를 CLI로 래핑            │
└──────────────────────────────────────────────────────┘
```

**언제 뭘 쓸까:**
| 상황 | 도구 | 이유 |
|------|------|------|
| 페이지 하나 읽기 | Jina Reader | 무료, 1줄 |
| 사이트 10페이지 크롤링 | Firecrawl | API 간편 |
| 구조화 데이터 추출 (가격, 상품명) | Crawlee CLI-Anything | 선택자 기반 정밀 추출 |
| 100+ 페이지 대규모 크롤링 | Crawlee CLI-Anything | 큐잉, 재시도, 세션 관리 |
| 차단 심한 한국 사이트 | Bright Data | 프록시 네트워크 |
| 로그인 필요 (다음카페) | Playwright MCP | 브라우저 자동화 |
| 정기 모니터링 | Crawlee CLI-Anything | cron + 변경 감지 |

### 12.7 주의사항

1. **CLI-Anything + TypeScript 프로젝트**: Crawlee는 TypeScript/Node.js 프로젝트. CLI-Anything는 주로 C/C++/Python 소프트웨어에서 검증됨. Crawlee CLI 생성 품질 사전 테스트 필수
2. **대안**: CLI-Anything가 Crawlee를 제대로 래핑 못하면 → Crawlee TypeScript API를 직접 래핑하는 thin wrapper 도구를 수동 작성 (현재 섹션 5.1의 코드 참고)
3. **robots.txt**: CLI-Anything 생성 CLI가 robots.txt 자동 체크하는지 확인. 없으면 래퍼에서 추가
4. **메모리**: Playwright 크롤러 ~200MB. 동시 크롤링 작업 수 제한 필요 (서버 24GB 기준 max 5-10 동시)
5. **라이선스**: Crawlee는 Apache 2.0 (상업 사용 OK). CLI-Anything은 LICENSE 없음 — 확인 필요

### 12.8 BMAD Epic 스토리 제안

```
Epic: 웹 크롤링 고급 도구 (CLI-Anything 통합)

Story 1: Crawlee CLI-Anything 래퍼 생성 + crawl_site 도구 등록
  - /cli-anything crawlee → CLI 생성
  - crawl + extract 기본 명령 검증
  - CORTHEX 도구 핸들러 등록 (tool-handlers/builtins/crawl-site.ts)
  - 테스트: 정적 사이트 10페이지 크롤링

Story 2: 구조화 데이터 추출 + 모니터링
  - CSS 선택자 기반 extract 명령 구현
  - 정기 모니터링 (cron + 변경 감지 + 알림)
  - 테스트: 쇼핑몰 상품 가격 50개 추출

Story 3: Firecrawl/Jina 폴백 체인 구현
  - 도구 체인: Jina(빠름) → Firecrawl(중간) → Crawlee(세밀)
  - 자동 폴백: Jina 실패 시 Firecrawl, Firecrawl 실패 시 Crawlee
  - Tool Cache 적용 (동일 URL 5분 캐시)
  - 테스트: JS 렌더링 사이트에서 자동 폴백 확인
```

---

## Sources
- [Firecrawl GitHub](https://github.com/firecrawl/firecrawl) — 85,000+ stars
- [Firecrawl MCP](https://github.com/firecrawl/firecrawl-mcp-server)
- [Firecrawl npm](https://www.npmjs.com/package/firecrawl-mcp)
- [Jina Reader](https://github.com/jina-ai/reader) — 10,000+ stars
- [Jina Reader API](https://jina.ai/reader/)
- [Bright Data MCP](https://github.com/brightdata/brightdata-mcp) — npm: `@brightdata/mcp`
- [MCP Benchmark 2026](https://aimultiple.com/browser-mcp)
- [Crawlee GitHub](https://github.com/apify/crawlee) — 16,000+ stars
- [Playwright MCP](https://github.com/anthropics/mcp-playwright) — 28,600 stars
- [ScrapingBee: Best JS Libraries](https://www.scrapingbee.com/blog/best-javascript-web-scraping-libraries/)
- [ZenRows: JS Scraping Libraries 2026](https://www.zenrows.com/blog/javascript-nodejs-web-scraping-libraries)
- [Cheerio vs Puppeteer 2026](https://proxyway.com/guides/cheerio-vs-puppeteer-for-web-scraping)
