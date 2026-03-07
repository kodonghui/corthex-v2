# Story 4.4: Domain Tools 15 Implementation

Status: done

## Story

As a system administrator,
I want 15 domain-specific tools registered and fully functional in the ToolPool,
so that agents in finance, legal, and tech departments can perform specialized tasks like stock analysis, legal research, security scanning, and infrastructure monitoring.

## Acceptance Criteria

1. 15 domain tools each have a ToolHandler implementation with real functionality (no stubs/mocks)
2. Each tool is registered in the HandlerRegistry (`packages/server/src/lib/tool-handlers/index.ts`)
3. Each tool has a corresponding seed record in `tool_definitions` table with correct `inputSchema` (JSON Schema for Claude API)
4. Each tool has unit tests verifying core functionality
5. External API-dependent tools have configurable timeouts (default 10s fetch, 30s hard limit by executor)
6. All tools follow the existing `ToolHandler` signature: `(input, ctx) => Promise<string> | string`
7. Tools that need external APIs use `ctx.getCredentials()` for API key retrieval
8. All tools return JSON-stringified results on success, Korean error messages on failure

## The 15 Domain Tools

### Already Implemented (verify & ensure registered)
| # | Tool Name (handler key) | Existing File | Status |
|---|------------------------|---------------|--------|
| 1 | `get_stock_price` (= stock_price_checker) | `builtins/get-stock-price.ts` | EXISTS - verify |
| 2 | `search_news` (= news_aggregator) | `builtins/search-news.ts` | EXISTS - verify |
| 3 | `get_instagram_insights` (partial sentiment) | `builtins/get-instagram-insights.ts` | EXISTS - verify |

### New Implementations Required
| # | Tool Name (handler key) | File to Create | Category | Description |
|---|------------------------|----------------|----------|-------------|
| 4 | `sentiment_analyzer` | `builtins/sentiment-analyzer.ts` | analysis | Korean text sentiment analysis using keyword dictionary (pos/neg/neutral) |
| 5 | `company_analyzer` | `builtins/company-analyzer.ts` | analysis | Company info lookup via DART API (financials, disclosures) |
| 6 | `market_overview` | `builtins/market-overview.ts` | analysis | Market indices overview (KOSPI, KOSDAQ, major global indices) |
| 7 | `law_search` | `builtins/law-search.ts` | legal | Korean law/precedent search via law.go.kr API |
| 8 | `contract_reviewer` | `builtins/contract-reviewer.ts` | legal | Contract clause analysis - risk detection, missing clause check |
| 9 | `trademark_similarity` | `builtins/trademark-similarity.ts` | legal | Brand name similarity check (Hangul jamo decomposition + phonetic comparison) |
| 10 | `patent_search` | `builtins/patent-search.ts` | legal | Patent search via KIPRIS API |
| 11 | `uptime_monitor` | `builtins/uptime-monitor.ts` | tech | Website availability check with response time measurement |
| 12 | `security_scanner` | `builtins/security-scanner.ts` | tech | Package vulnerability check via OSV API |
| 13 | `code_quality` | `builtins/code-quality-tool.ts` | tech | Code metrics analysis (complexity, duplication, naming conventions) |
| 14 | `dns_lookup` | `builtins/dns-lookup.ts` | tech | DNS record lookup (A, AAAA, MX, NS, TXT, CNAME) |
| 15 | `ssl_checker` | `builtins/ssl-checker.ts` | tech | SSL certificate validity, expiry, issuer check |

**Note:** `port_scanner` from the epic spec is replaced by `ssl_checker` as port scanning has security implications and SSL checking provides more practical value for monitoring.

## Tasks / Subtasks

- [x] Task 1: Verify & confirm existing 3 tools are registered (AC: #1, #2)
  - [x] 1.1 Verify `get_stock_price` works with KIS API, registered in index.ts
  - [x] 1.2 Verify `search_news` works with Serper API, registered in index.ts
  - [x] 1.3 Verify `get_instagram_insights` works, registered in index.ts

- [x] Task 2: Implement 12 new domain tool handlers (AC: #1, #5, #6, #7, #8)
  - [x] 2.1 `sentiment_analyzer` - Korean sentiment dict-based analysis (no LLM, pure keyword matching)
  - [x] 2.2 `company_analyzer` - DART API company info + financial summary
  - [x] 2.3 `market_overview` - Market indices fetch (KRX/global via Serper or direct)
  - [x] 2.4 `law_search` - law.go.kr API for law/precedent search (XML parse)
  - [x] 2.5 `contract_reviewer` - Pure text analysis for contract risk clauses
  - [x] 2.6 `trademark_similarity` - Hangul jamo decomposition + similarity scoring
  - [x] 2.7 `patent_search` - KIPRIS API for patent/trademark search
  - [x] 2.8 `uptime_monitor` - HTTP HEAD/GET with response time measurement
  - [x] 2.9 `security_scanner` - OSV API for package vulnerability lookup
  - [x] 2.10 `code_quality` - Static analysis: complexity estimation, naming check
  - [x] 2.11 `dns_lookup` - DNS resolution using Bun/Node dns module
  - [x] 2.12 `ssl_checker` - TLS connection to check certificate details

- [x] Task 3: Register all new handlers in index.ts (AC: #2)
  - [x] 3.1 Add imports for all 12 new handlers
  - [x] 3.2 Register each with `registry.register('handler_name', handler)`

- [x] Task 4: Create seed data for tool_definitions (AC: #3)
  - [x] 4.1 Create/update seed script with 15 domain tool definitions
  - [x] 4.2 Each definition: name, description, category (analysis/finance/legal/tech), inputSchema, handler name, tags
  - [x] 4.3 Scope = 'platform' (available to all companies)

- [x] Task 5: Write unit tests for all tools (AC: #4)
  - [x] 5.1 Test each new tool's core actions with mock inputs (35 tests)
  - [x] 5.2 Test error handling (missing inputs, missing credentials, API errors) (24 tests)
  - [x] 5.3 Test edge cases per tool
  - [x] 5.4 Tests in `packages/server/src/__tests__/unit/tool-handlers/`

## Dev Notes

### Existing Code Patterns (MUST follow)

**ToolHandler signature** (`packages/server/src/lib/tool-handlers/types.ts`):
```typescript
export type ToolHandler = (
  input: Record<string, unknown>,
  ctx: ToolExecContext,
) => Promise<string> | string
```

**ToolExecContext** provides:
- `companyId`, `agentId`, `sessionId`, `departmentId`, `userId`
- `config?: Record<string, unknown>` - tool-specific config
- `getCredentials(provider: string)` - retrieve API keys from credential vault

**Return format**: Always return `string` - use `JSON.stringify()` for structured data, plain Korean string for errors.

**Registration pattern** (`packages/server/src/lib/tool-handlers/index.ts`):
```typescript
import { myTool } from './builtins/my-tool'
registry.register('my_tool', myTool)
```

**Existing domain tool patterns** (already in codebase):
- `get-stock-price.ts`: KIS API integration with `getKisToken()` helper, typed response, credential error handling
- `search-news.ts`: Serper API with POST, typed response, credential fallback
- Both use `AbortSignal.timeout(30_000)` for fetch timeout

### Tool Implementation Guidelines

1. **No external npm packages** unless absolutely necessary - use built-in Bun/Node APIs
2. **Async tools** (API-dependent): Use `fetch()` API, return `Promise<string>`
3. **Sync tools** (pure computation): Return `string` directly
4. **Credential-dependent tools**: Use `ctx.getCredentials(provider)` with try/catch, return friendly Korean error if missing
5. **Input validation**: Check required fields, return Korean error message if missing
6. **Result truncation**: The executor handles >4000 char truncation, no need in tool
7. **Timeout**: 10s recommended for individual fetch calls via `AbortSignal.timeout(10_000)`
8. **Action dispatch pattern**: Domain tools with multiple actions should use switch/if-else on `input.action`

### v1 Reference Implementations

Reference these v1 files for behavior/logic patterns:
- `/home/ubuntu/CORTHEX_HQ/src/tools/sentiment_analyzer.py` - Korean sentiment dictionary (POSITIVE_WORDS/NEGATIVE_WORDS lists), `analyze_sentiment()` function
- `/home/ubuntu/CORTHEX_HQ/src/tools/law_search.py` - law.go.kr XML API, `action="law"` / `action="precedent"` pattern
- `/home/ubuntu/CORTHEX_HQ/src/tools/contract_reviewer.py` - contract clause risk analysis
- `/home/ubuntu/CORTHEX_HQ/src/tools/trademark_similarity.py` - Hangul jamo decomposition (CHOSUNG/JUNGSUNG/JONGSUNG), `_KO_TO_EN` phonetic map, KIPRIS API
- `/home/ubuntu/CORTHEX_HQ/src/tools/uptime_monitor.py` - URL check with response time, `action="check"` / `action="add"` pattern
- `/home/ubuntu/CORTHEX_HQ/src/tools/security_scanner.py` - OSV API (`https://api.osv.dev/v1/query`), package vulnerability check
- `/home/ubuntu/CORTHEX_HQ/src/tools/code_quality.py` - code analysis actions (security/lint/test/all)
- `/home/ubuntu/CORTHEX_HQ/src/tools/kr_stock.py` - Korean stock price via KIS
- `/home/ubuntu/CORTHEX_HQ/src/tools/global_market_tool.py` - Global market indices

### Tool-Specific Implementation Notes

**sentiment_analyzer**: Korean sentiment analysis using keyword dictionary (NO LLM call). Actions: `analyze` (text -> pos/neg/neutral label + score), `batch` (multiple texts). Port v1's POSITIVE_WORDS/NEGATIVE_WORDS lists directly. Return `{ label: "긍정"|"부정"|"중립", score: 0-1, positiveCount, negativeCount, keywords: [] }`.

**company_analyzer**: DART OpenAPI for Korean company data. Actions: `info` (company basic info by corp_code or name), `financials` (recent financial summary), `disclosures` (recent filings). API: `https://opendart.fss.or.kr/api/`. Credentials: `ctx.getCredentials('dart')` for `api_key`.

**market_overview**: Fetch market index data. Actions: `domestic` (KOSPI, KOSDAQ via KRX or scraping), `global` (S&P500, NASDAQ, etc. via Serper news search as fallback). If no dedicated API, use Serper search `"KOSPI 지수 현재"` and parse.

**law_search**: Korean National Law Information Center API. Actions: `law` (search laws by keyword), `precedent` (search court decisions). API: `https://www.law.go.kr/DRF/lawSearch.do`. XML response parsing. Credentials: `ctx.getCredentials('law')` for `api_key` (OC parameter).

**contract_reviewer**: Pure text analysis (NO LLM, NO API). Actions: `review` (scan contract text for risky clauses), `checklist` (generate missing clause checklist). Check for: 해지조건, 위약금, 분쟁해결, 면책조항, 기밀유지, 지적재산권, 손해배상, 계약기간. Return risk level + found/missing clauses list.

**trademark_similarity**: Hangul jamo decomposition for phonetic similarity. Actions: `check` (compare two brand names), `batch` (compare one name against multiple). Use v1's CHOSUNG/JUNGSUNG/JONGSUNG decomposition. Calculate: visual similarity (jamo overlap), phonetic similarity (romanization comparison). No API needed for basic comparison. KIPRIS API optional via `ctx.getCredentials('kipris')`.

**patent_search**: KIPRIS Plus API for patent/trademark search. Actions: `search` (keyword search), `detail` (by application number). API: `http://plus.kipris.or.kr/kipo-api/kipi`. Credentials: `ctx.getCredentials('kipris')` for `api_key`. XML response parsing.

**uptime_monitor**: Website status check. Actions: `check` (single URL check with response time), `batch` (check multiple URLs). Use `fetch()` with HEAD method first, fallback to GET. Measure response time with `performance.now()`. Return `{ url, status, responseTime, statusCode, headers }`.

**security_scanner**: Package vulnerability lookup via OSV API. Actions: `check_package` (single package + version), `scan` (multiple packages). API: POST `https://api.osv.dev/v1/query` with `{ package: { name, ecosystem }, version }`. No API key needed (free). Return vulnerability list with severity.

**code_quality**: Static code analysis (text-based, no subprocess). Actions: `analyze` (estimate complexity from code string), `naming` (check naming convention compliance), `metrics` (line count, function count, comment ratio). Pure string parsing - count nested blocks for complexity, check camelCase/snake_case patterns.

**dns_lookup**: DNS resolution. Actions: `lookup` (resolve hostname to IPs), `mx` (mail server records), `txt` (TXT records), `all` (all record types). Use `Bun.dns.resolve()` or Node `dns.promises` module. No API key needed.

**ssl_checker**: TLS certificate check. Actions: `check` (connect to host:443, return cert info). Use Node `tls.connect()` to get certificate. Return `{ valid, issuer, subject, validFrom, validTo, daysUntilExpiry, protocol }`. No API key needed.

### inputSchema Format (for tool_definitions seed)

Each tool needs a JSON Schema compatible with Claude's tool_use format:
```json
{
  "type": "object",
  "properties": {
    "action": { "type": "string", "enum": ["analyze", "batch"], "description": "수행할 작업" },
    "text": { "type": "string", "description": "분석할 텍스트" }
  },
  "required": ["action"]
}
```

### Project Structure Notes

- All tool handlers: `packages/server/src/lib/tool-handlers/builtins/`
- Handler registry: `packages/server/src/lib/tool-handlers/index.ts`
- Types: `packages/server/src/lib/tool-handlers/types.ts`
- Registry class: `packages/server/src/lib/tool-handlers/registry.ts`
- DB schema: `packages/server/src/db/schema.ts` (tool_definitions, agent_tools, tool_calls)
- Seed data: `packages/server/src/db/seed-common-tools.ts` (existing common tools seed pattern)
- Tests: `packages/server/src/__tests__/unit/tool-handlers/`
- Existing domain tools to reference: `builtins/get-stock-price.ts`, `builtins/search-news.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4, E4-S4 lines 1003-1008]
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 4 - Tool System]
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md#Tool System]
- [Source: packages/server/src/lib/tool-handlers/types.ts - ToolHandler type]
- [Source: packages/server/src/lib/tool-handlers/registry.ts - HandlerRegistry]
- [Source: packages/server/src/lib/tool-handlers/index.ts - 37 existing registrations]
- [Source: packages/server/src/lib/tool-handlers/builtins/get-stock-price.ts - KIS API domain tool pattern]
- [Source: packages/server/src/lib/tool-handlers/builtins/search-news.ts - Serper API domain tool pattern]
- [Source: /home/ubuntu/CORTHEX_HQ/src/tools/sentiment_analyzer.py - Korean sentiment dict]
- [Source: /home/ubuntu/CORTHEX_HQ/src/tools/law_search.py - law.go.kr API pattern]
- [Source: /home/ubuntu/CORTHEX_HQ/src/tools/trademark_similarity.py - Hangul jamo decomposition]
- [Source: /home/ubuntu/CORTHEX_HQ/src/tools/uptime_monitor.py - URL monitoring pattern]
- [Source: /home/ubuntu/CORTHEX_HQ/src/tools/security_scanner.py - OSV API pattern]
- [Source: /home/ubuntu/CORTHEX_HQ/src/tools/code_quality.py - Code analysis pattern]
- [Source: _bmad-output/implementation-artifacts/4-3-common-tools-15-implementation.md - Previous story]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- All 15 domain tools implemented and tested (3 existing verified + 12 new)
- 59 new tests: 35 core functionality + 24 API validation/credential error handling
- 207 total tool handler tests pass (0 failures, 0 regressions)
- Pure computation tools: sentiment_analyzer, contract_reviewer, trademark_similarity, code_quality
- API tools: company_analyzer (DART), market_overview (Serper), law_search (law.go.kr), patent_search (KIPRIS)
- Infrastructure tools: uptime_monitor (HTTP), security_scanner (OSV), dns_lookup (node:dns), ssl_checker (node:tls)
- No new npm dependencies added
- Hangul jamo decomposition with position-aware romanization (chosung vs jongsung mapping)
- Korean sentiment dictionary ported from v1 (40 positive + 39 negative words)
- Contract reviewer checks 10 risk clause categories and 9 essential clauses

### File List

- packages/server/src/lib/tool-handlers/builtins/sentiment-analyzer.ts (NEW)
- packages/server/src/lib/tool-handlers/builtins/company-analyzer.ts (NEW)
- packages/server/src/lib/tool-handlers/builtins/market-overview.ts (NEW)
- packages/server/src/lib/tool-handlers/builtins/law-search.ts (NEW)
- packages/server/src/lib/tool-handlers/builtins/contract-reviewer.ts (NEW)
- packages/server/src/lib/tool-handlers/builtins/trademark-similarity.ts (NEW)
- packages/server/src/lib/tool-handlers/builtins/patent-search.ts (NEW)
- packages/server/src/lib/tool-handlers/builtins/uptime-monitor.ts (NEW)
- packages/server/src/lib/tool-handlers/builtins/security-scanner.ts (NEW)
- packages/server/src/lib/tool-handlers/builtins/code-quality-tool.ts (NEW)
- packages/server/src/lib/tool-handlers/builtins/dns-lookup.ts (NEW)
- packages/server/src/lib/tool-handlers/builtins/ssl-checker.ts (NEW)
- packages/server/src/lib/tool-handlers/index.ts (MODIFIED)
- packages/server/src/db/seed-domain-tools.ts (NEW)
- packages/server/src/__tests__/unit/tool-handlers/domain-tools.test.ts (NEW)
- packages/server/src/__tests__/unit/tool-handlers/domain-tools-api.test.ts (NEW)
