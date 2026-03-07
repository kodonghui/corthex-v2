# Story 4.3: Common Tools 15 Implementation

Status: done

## Story

As a system administrator,
I want 15 common tools registered and fully functional in the ToolPool,
so that all agents can perform general-purpose tasks like web search, calculations, file management, data parsing, and text processing.

## Acceptance Criteria

1. 15 common tools each have a ToolHandler implementation with real functionality (no stubs/mocks)
2. Each tool is registered in the HandlerRegistry (`packages/server/src/lib/tool-handlers/index.ts`)
3. Each tool has a corresponding seed record in `tool_definitions` table with correct `inputSchema` (JSON Schema for Claude API)
4. Each tool has unit tests verifying core functionality
5. `real_web_search` (existing `search_web`) returns actual web search results via Serper API
6. All tools follow the existing `ToolHandler` signature: `(input, ctx) => Promise<string> | string`
7. Tools that need external APIs use `ctx.getCredentials()` for API key retrieval
8. All tools return JSON-stringified results on success, Korean error messages on failure

## The 15 Common Tools

### Already Implemented (verify & ensure registered)
| # | Tool Name (handler key) | Existing File | Status |
|---|------------------------|---------------|--------|
| 1 | `search_web` (= real_web_search) | `builtins/search-web.ts` | EXISTS - verify |
| 2 | `calculate` (= calculator) | `builtins/calculate.ts` | EXISTS - verify |
| 3 | `translate_text` (= translator) | `builtins/translate-text.ts` | EXISTS - verify |
| 4 | `send_email` (= email_sender) | `builtins/send-email.ts` | EXISTS - verify |
| 5 | `get_current_time` (= date_utils partial) | `builtins/get-current-time.ts` | EXISTS - extend |

### New Implementations Required
| # | Tool Name (handler key) | File to Create | Description |
|---|------------------------|----------------|-------------|
| 6 | `spreadsheet_tool` | `builtins/spreadsheet-tool.ts` | CSV/TSV parse, filter, sort, aggregate, pivot |
| 7 | `chart_generator` | `builtins/chart-generator.ts` | Generate chart data (bar/line/pie) as structured JSON |
| 8 | `file_manager` | `builtins/file-manager.ts` | Generate/read text files, list workspace files |
| 9 | `date_utils` | `builtins/date-utils.ts` | Date arithmetic, timezone conversion, formatting, diff |
| 10 | `json_parser` | `builtins/json-parser.ts` | Parse, query (JSONPath-like), transform, validate JSON |
| 11 | `text_summarizer` | `builtins/text-summarizer.ts` | Extract key sentences, word count, reading time, keyword extraction |
| 12 | `url_fetcher` | `builtins/url-fetcher.ts` | Fetch URL content, extract text from HTML, head requests |
| 13 | `markdown_converter` | `builtins/markdown-converter.ts` | Markdown to plain text, HTML to markdown, table generation |
| 14 | `regex_matcher` | `builtins/regex-matcher.ts` | Test regex, find matches, replace, extract groups |
| 15 | `unit_converter` | `builtins/unit-converter.ts` | Length/weight/temp/currency/data-size conversion |

## Tasks / Subtasks

- [x] Task 1: Verify & update existing 5 tools (AC: #1, #5)
  - [x] 1.1 Verify `search_web` works with Serper API, graceful error on missing key
  - [x] 1.2 Verify `calculate` handles edge cases (division by zero, nested parens)
  - [x] 1.3 Verify `translate_text` works
  - [x] 1.4 Verify `send_email` works with SMTP credentials
  - [x] 1.5 Keep `get_current_time` as-is (date_utils is separate, comprehensive tool)

- [x] Task 2: Implement 11 new tool handlers (AC: #1, #6, #7, #8)
  - [x] 2.1 `spreadsheet_tool` - CSV parsing, filtering, sorting, aggregation (5 actions)
  - [x] 2.2 `chart_generator` - Structured chart data output (bar/line/pie/scatter/doughnut)
  - [x] 2.3 `file_manager` - Generate text content, templates, format listing (3 actions)
  - [x] 2.4 `date_utils` - Date math, timezone, formatting, diff calculations (5 actions)
  - [x] 2.5 `json_parser` - Parse, query paths, keys, flatten, validate (5 actions)
  - [x] 2.6 `text_summarizer` - Stats, keyword extraction, sentences, truncate (4 actions)
  - [x] 2.7 `url_fetcher` - HTTP GET, HEAD, HTML text extraction (3 actions, 10s timeout)
  - [x] 2.8 `markdown_converter` - MD to text/HTML, HTML to MD, array to table (4 actions)
  - [x] 2.9 `regex_matcher` - Test, match, replace, extract, split, validate (6 actions)
  - [x] 2.10 `unit_converter` - 8 categories (length/weight/temp/data/time/area/volume/speed)
  - [x] 2.11 `random_generator` - Number, UUID, string, pick, shuffle, coin, dice (7 actions)

- [x] Task 3: Register all new handlers in index.ts (AC: #2)
  - [x] 3.1 Add imports for all 11 new handlers
  - [x] 3.2 Register each with `registry.register('handler_name', handler)` (total 36 handlers)

- [x] Task 4: Create seed data for tool_definitions (AC: #3)
  - [x] 4.1 Created seed-common-tools.ts with 16 common tool definitions (15 specified + random_generator)
  - [x] 4.2 Each definition includes: name, description, category, inputSchema (JSON Schema), handler, tags
  - [x] 4.3 Scope = 'platform' (available to all companies), auto-assigns to all agents

- [x] Task 5: Write unit tests for all tools (AC: #4)
  - [x] 5.1 Test each tool's core actions (92 tests total)
  - [x] 5.2 Test error handling (missing inputs, invalid data, edge cases)
  - [x] 5.3 Test edge cases per tool (Korean text, boundary conditions, etc.)
  - [x] 5.4 Tests in `packages/server/src/__tests__/unit/tool-handlers/common-tools.test.ts`

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

### Tool Implementation Guidelines

1. **No external npm packages** unless absolutely necessary - use built-in Bun/Node APIs
2. **Sync tools** (calculate, regex, json_parser, etc.): Return string directly, no async needed
3. **Async tools** (url_fetcher, search_web, etc.): Use `fetch()` API, return Promise<string>
4. **Credential-dependent tools**: Use `ctx.getCredentials(provider)` with try/catch, return friendly error if missing
5. **Input validation**: Check required fields, return Korean error message if missing
6. **Result truncation**: The executor handles >4000 char truncation, no need to implement in tool
7. **Timeout**: 30-second hard limit handled by executor, but tools should set their own fetch timeouts (10s recommended)

### v1 Reference Implementations

Reference these v1 files for behavior/logic patterns:
- `/home/ubuntu/CORTHEX_HQ/src/tools/real_web_search.py` - dual search backend pattern
- `/home/ubuntu/CORTHEX_HQ/src/tools/spreadsheet_tool.py` - CSV/Excel parse + analyze
- `/home/ubuntu/CORTHEX_HQ/src/tools/chart_generator.py` - chart data structure
- `/home/ubuntu/CORTHEX_HQ/src/tools/doc_converter.py` - document format conversion
- `/home/ubuntu/CORTHEX_HQ/src/tools/base.py` - BaseTool pattern with action dispatch

### Tool-Specific Implementation Notes

**spreadsheet_tool**: Parse CSV/TSV strings (not file I/O). Actions: `parse` (string→rows), `filter` (by column value), `sort` (by column), `aggregate` (sum/avg/count/min/max), `to_csv` (rows→CSV string). Use built-in string splitting, no pandas equivalent needed.

**chart_generator**: Generate structured JSON chart configs (NOT images). Output: `{ type: 'bar'|'line'|'pie', title, labels: [], datasets: [{ label, data: [] }] }`. Frontend will render with Chart.js. Actions: `bar`, `line`, `pie`, `scatter`.

**file_manager**: Generate text file content. Actions: `generate` (create text content with given format), `list_formats` (supported formats). Does NOT do filesystem I/O - returns content string for the agent to use.

**date_utils**: Pure date calculation. Actions: `now` (current time + timezone), `format` (date string formatting), `diff` (days/hours between dates), `add` (add days/months/years), `parse` (natural language date parsing). Use built-in `Date` + `Intl.DateTimeFormat`.

**json_parser**: Actions: `parse` (string→formatted JSON), `query` (dot-path extraction: "users.0.name"), `keys` (list top-level keys), `flatten` (nested→flat), `validate` (check if valid JSON).

**text_summarizer**: Pure text analysis (no LLM). Actions: `stats` (word count, char count, sentence count, reading time), `keywords` (TF-based keyword extraction), `sentences` (extract first N sentences), `truncate` (smart truncation at sentence boundary).

**url_fetcher**: HTTP client. Actions: `get` (fetch URL, return text), `head` (headers only), `extract_text` (strip HTML tags, return plain text). Set 10s timeout. Use `ctx.getCredentials('proxy')` optionally. Respect robots.txt header.

**markdown_converter**: Text format conversion. Actions: `to_text` (strip MD formatting), `to_table` (array→MD table), `from_html` (basic HTML→MD), `to_html` (basic MD→HTML). Pure string processing.

**regex_matcher**: Actions: `test` (pattern→boolean), `match` (find all matches), `replace` (pattern replace), `extract` (named/numbered groups), `split` (split by pattern). Wrap in try/catch for invalid regex.

**unit_converter**: Built-in conversion tables. Categories: `length` (m/km/ft/mi/in/cm), `weight` (kg/g/lb/oz), `temperature` (C/F/K), `data` (B/KB/MB/GB/TB), `time` (s/min/hr/day), `area` (m²/km²/ft²/acre). No API needed.

### inputSchema Format (for tool_definitions seed)

Each tool needs a JSON Schema compatible with Claude's tool_use format:
```json
{
  "type": "object",
  "properties": {
    "action": { "type": "string", "enum": ["parse", "filter", "sort"], "description": "수행할 작업" },
    "data": { "type": "string", "description": "처리할 데이터" }
  },
  "required": ["action"]
}
```

### Project Structure Notes

- All tool handlers: `packages/server/src/lib/tool-handlers/builtins/`
- Handler registry: `packages/server/src/lib/tool-handlers/index.ts`
- Types: `packages/server/src/lib/tool-handlers/types.ts`
- Registry class: `packages/server/src/lib/tool-handlers/registry.ts`
- Tool executor: `packages/server/src/lib/tool-executor.ts`
- DB schema: `packages/server/src/db/schema.ts` (tool_definitions, agent_tools, tool_calls)
- Seed data: `packages/server/src/db/seed.ts` or `packages/server/src/db/seeds/`
- Tests: `packages/server/src/__tests__/unit/tool-handlers/`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4, E4-S3 lines 996-1001]
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 4 - Tool System]
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md#Tool System]
- [Source: packages/server/src/lib/tool-handlers/types.ts - ToolHandler type]
- [Source: packages/server/src/lib/tool-handlers/registry.ts - HandlerRegistry]
- [Source: packages/server/src/lib/tool-handlers/index.ts - 25 existing registrations]
- [Source: packages/server/src/lib/tool-handlers/builtins/calculate.ts - sync tool pattern]
- [Source: packages/server/src/lib/tool-handlers/builtins/search-web.ts - async tool pattern with credentials]
- [Source: /home/ubuntu/CORTHEX_HQ/src/tools/ - v1 tool implementations for reference]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Implemented 16 common tools total (5 existing verified + 11 new)
- All tools follow ToolHandler signature, return JSON.stringify on success, Korean errors on failure
- No external npm dependencies added - pure Bun/Node built-in APIs only
- 92 unit tests passing, 180 expect() calls, 0 regressions
- Seed script created for DB registration with inputSchema per Claude API spec
- Tool categories: utility (9), search (2), content (3), communication (1)
- Notable features:
  - spreadsheet_tool: CSV/TSV auto-detect, filter/sort/aggregate
  - chart_generator: Chart.js compatible JSON output (bar/line/pie/scatter/doughnut)
  - date_utils: timezone conversion (KST/EST/PST/etc), date arithmetic
  - unit_converter: 8 categories including Korean pyeong
  - url_fetcher: 10s timeout, HTML text extraction, meta tag parsing
  - random_generator: UUID, dice, coin flip, shuffle, string generation

### Change Log

- 2026-03-07: Initial implementation - 16 common tools, 92 tests, 0 regressions

### File List

#### New Files
- packages/server/src/lib/tool-handlers/builtins/spreadsheet-tool.ts
- packages/server/src/lib/tool-handlers/builtins/chart-generator.ts
- packages/server/src/lib/tool-handlers/builtins/file-manager.ts
- packages/server/src/lib/tool-handlers/builtins/date-utils.ts
- packages/server/src/lib/tool-handlers/builtins/json-parser.ts
- packages/server/src/lib/tool-handlers/builtins/text-summarizer.ts
- packages/server/src/lib/tool-handlers/builtins/url-fetcher.ts
- packages/server/src/lib/tool-handlers/builtins/markdown-converter.ts
- packages/server/src/lib/tool-handlers/builtins/regex-matcher.ts
- packages/server/src/lib/tool-handlers/builtins/unit-converter.ts
- packages/server/src/lib/tool-handlers/builtins/random-generator.ts
- packages/server/src/db/seed-common-tools.ts
- packages/server/src/__tests__/unit/tool-handlers/common-tools.test.ts

#### Modified Files
- packages/server/src/lib/tool-handlers/index.ts (added 11 imports + registrations)

#### Story File
- _bmad-output/implementation-artifacts/4-3-common-tools-15-implementation.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
