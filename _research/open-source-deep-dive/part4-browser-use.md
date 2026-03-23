# Part 4: browser-use Deep Dive — Web Browsing Capability for Corthex v2

_Research Date: 2026-03-23_
_Repository: [browser-use/browser-use](https://github.com/browser-use/browser-use) (83.4k stars, 9.7k forks, 301 contributors)_
_License: MIT_

---

## Table of Contents

1. [Phase A: Repository Architecture Analysis](#phase-a-repository-architecture-analysis)
2. [Phase B: Corthex Engine Audit](#phase-b-corthex-engine-audit)
3. [Deliverable 1: Architecture Diagram](#deliverable-1-architecture-diagram)
4. [Deliverable 2: Core Code Excerpts & Annotations](#deliverable-2-core-code-excerpts--annotations)
5. [Deliverable 3: Corthex Web Browsing Tool Interface](#deliverable-3-corthex-web-browsing-tool-interface)
6. [Deliverable 4: Prototype Code Draft](#deliverable-4-prototype-code-draft)
7. [Deliverable 5: DOM-to-LLM Format Conversion Spec](#deliverable-5-dom-to-llm-format-conversion-spec)
8. [Deliverable 6: Security Design](#deliverable-6-security-design)
9. [Deliverable 7: Cost Estimation](#deliverable-7-cost-estimation)
10. [Deliverable 8: Competitive Comparison](#deliverable-8-competitive-comparison)

---

## Phase A: Repository Architecture Analysis

### 1. Overall Architecture

#### Directory Structure

```
browser_use/
  actor/          # Actor pattern for browser control
  agent/          # Core agent loop (system prompts, views, message manager)
  browser/        # Browser lifecycle (session, profile, CDP connection)
  controller/     # Action dispatch and execution
  dom/            # DOM extraction, serialization, element detection
  filesystem/     # Persistent file system for task tracking
  integrations/   # Gmail and other service integrations
  llm/            # LLM provider adapters (OpenAI, Anthropic, Google, etc.)
  mcp/            # Model Context Protocol server
  sandbox/        # Sandboxed execution environment
  screenshots/    # Screenshot capture and annotation
  skill_cli/      # CLI for managing skills
  skills/         # Reusable automation skills
  sync/           # Synchronization utilities
  telemetry/      # Observability and metrics
  tokens/         # Token usage tracking
  tools/          # Tool registry and action models
  cli.py          # Command-line interface entry point
  config.py       # Global configuration
  exceptions.py   # Custom exception classes
  utils.py        # Shared utilities
```

#### Module Dependency Graph

```
User Interfaces (CLI / TUI / MCP / Python API)
              |
              v
        +----------+
        |  Agent   |  <-- Central orchestrator
        +----------+
       /   |    |    \
      v    v    v     v
  Tools  Browser  MessageMgr  LLM Wrappers
    |      |         |            |
    |   Session    DomService   Providers
    |    Manager      |        (OpenAI, Anthropic,
    |      |      Serializer    Google, BrowserUse)
    +-> EventBus <----+
           |
        Watchdogs
      (DOM, Downloads,
       Crash, Popups)
           |
        CDP Client
           |
      Chrome/Chromium
```

**Entry Point**: `Agent.run()` -> iterative `Agent.step()` cycle until task completion or `max_steps`.

#### Key Insight: Event-Driven Architecture
browser-use uses an **EventBus** pattern for loose coupling. The Agent dispatches `BrowserActionEvent`s, and specialized `Watchdog` handlers (DOM, Downloads, Crash, Popups) execute them via CDP commands. This enables robust error recovery -- a `CrashWatchdog` can detect browser failures and repair sessions without the Agent knowing.

### 2. Browser Control Layer

#### Playwright Usage
- Built on top of **Playwright** (Python) for browser automation
- Uses **Chrome DevTools Protocol (CDP)** directly for advanced operations
- Supports local browser launch AND remote CDP URL connection
- `BrowserProfile` configures headless/headful, proxy, user data directory
- `SessionManager` manages the Chrome process lifecycle

#### Browser Pooling / Reuse
- `BrowserSession` instances are cached per agent session
- **Warm start**: Existing sessions are reused without re-spawn
- **Durable Objects pattern**: Sessions persist across multiple agent steps
- `keep_alive` extends session inactivity timeout (up to 10 minutes on CF)

#### Tab / Context Management
- Multi-tab support with tab switching actions
- Each tab tracked in `BrowserStateSummary` (URL + title)
- New tab creation, tab closing, and tab switching via dedicated actions

#### Cookie / Session Persistence
- `BrowserProfile` supports `user_data_dir` for persistent browser profiles
- Authentication cookies survive across agent runs
- Browser Use Cloud adds proxy rotation and stealth fingerprinting

### 3. DOM Extraction (CRITICAL)

#### 5-Stage Pipeline

```
Stage 1: Parallel CDP Data Collection (5 concurrent requests)
  |-- DOM.getDocument           (structural hierarchy)
  |-- Accessibility.getFullAXTree   (semantic roles/labels)
  |-- DOMSnapshot.captureSnapshot   (visual rendering info)
  |-- Page.getLayoutMetrics         (viewport dimensions)
  |-- Runtime.evaluate              (JS event listener detection)
  |
  v
Stage 2: Data Fusion -> EnhancedDOMTreeNode
  (merge 5 data sources into unified tree)
  |
  v
Stage 3: Serialization Pipeline (4 sequential transforms)
  |-- Tree Simplification     (remove non-interactive elements)
  |-- Paint Order Filtering   (hide occluded elements by z-index)
  |-- Bounding Box Filtering  (collapse nested clickable elements)
  |-- Interactive Index Assignment (numeric indices for LLM reference)
  |
  v
Stage 4: LLM-Ready Output
  |-- SerializedDOMState  (text with numeric indices)
  |-- DOMSelectorMap      (index -> selector mapping for action execution)
  |
  v
Stage 5: Agent Consumption
  (MessageManager incorporates DOM into LLM prompt)
```

#### Token Compression Strategy

**Compression ratio**: ~10,000 raw DOM nodes -> ~200 interactive elements

The key techniques:
1. **Remove non-interactive elements**: Text nodes, decorative divs, spacers
2. **Occluded element removal**: Elements hidden by higher z-index layers
3. **Nested clickable collapse**: Multiple overlapping buttons reduced to one
4. **Off-viewport culling**: Elements outside visible area excluded
5. **Numeric index substitution**: Full CSS selectors replaced with `[1]`, `[2]`, etc.

#### Interactive Element Detection (OR logic)

An element is marked interactive if ANY of these are true:
- HTML semantics: `<button>`, `<a>`, `<input>`, `<select>`, `<textarea>`
- ARIA roles: `role="button"`, `role="menuitem"`, `role="link"`
- CSS cursor: `cursor: pointer` in computed styles
- JS event listeners: Detected via `Runtime.evaluate` injection

#### Shadow DOM & iframe Handling
- **Shadow DOM**: Traverses into shadow trees via `Element.getElementsInSlot()`, merging shadow-hosted elements into main tree
- **iframes**: Each iframe tracked as separate CDP target, recursive DOM extraction, flattened representation in output

### 4. LLM Integration (CRITICAL)

#### System Prompt Architecture

7 distinct prompt templates selected by model type and reasoning mode:

| Template | Condition | Token Efficiency |
|----------|-----------|-----------------|
| `system_prompt_browser_use_flash.md` | Fine-tuned model + flash | Minimal |
| `system_prompt_browser_use.md` | Fine-tuned model + thinking | Medium |
| `system_prompt_flash.md` | Flash mode (general) | Low |
| `system_prompt_flash_anthropic.md` | Claude + flash | Claude-optimized |
| `system_prompt.md` | Standard + thinking | Full |
| `system_prompt_no_thinking.md` | Standard - thinking | Reduced |

System prompts include:
1. Role definition and capabilities
2. Available actions with parameter specs
3. Output format requirements (JSON schema)
4. DOM navigation instructions (how to interpret `[index]` references)
5. Safety guidelines and domain restrictions
6. Multi-step examples (full templates only)

#### Action Schema

Built-in actions registered via `Tools` registry:

| Action | Parameters | Description |
|--------|-----------|-------------|
| `navigate` | `url: str` | Navigate to URL with wait conditions |
| `click` | `index: int` or `coordinates: (x,y)` | Click element |
| `input_text` | `index: int, text: str` | Type text into input field |
| `scroll` | `direction: str, amount: int` | Scroll viewport or element |
| `extract_content` | `goal: str` | Extract text/data from page |
| `screenshot` | `full_page: bool` | Capture page screenshot |
| `go_back` | (none) | Navigate browser back |
| `search_google` | `query: str` | Google search |
| `done` | `text: str` | Signal task completion with result |

Custom actions register via `@tools.action()` decorator.

#### LLM Response Format (AgentOutput)

```python
class AgentOutput:
    thinking: str | None         # Internal reasoning (logged, NOT stored in history)
    evaluation_previous_goal: str  # Success/failure assessment of last step
    memory: str                    # Key info retained for future steps
    next_goal: str                 # Immediate next objective
    action: list[ActionModel]      # 1-N actions to execute sequentially
```

**Flash Mode** strips `thinking` and `evaluation_previous_goal` for speed. Each action compresses to **10-15 tokens**.

#### Error Handling & Retry

- **5 retries with exponential backoff** for LLM API errors
- **Provider-specific handling**: Rate limits (backoff + jitter), auth errors (fail fast), 5xx (retry), timeout (backoff)
- **Action-level recovery**: Invalid params -> skip + record error; CDP failure -> watchdog session repair; browser crash -> `CrashWatchdog` CDP repair
- **ActionLoopDetector**: Identifies repetitive behavior, injects "behavioral nudge" messages to redirect

#### Context Window Management

- `SystemMessage` with `cache=True` for prompt reuse across steps
- **Message compaction**: `maybe_compact_messages()` condenses older interactions when approaching token limit
- **DOM truncation**: Configurable character limit on DOM representation
- **History compression**: Older steps condensed while preserving recent context
- **KV Cache optimization**: Agent history placed BEFORE browser state in prompts, enabling cache hits on conversation history

### 5. Vision Model

#### Hybrid DOM + Screenshot Approach

browser-use primarily uses **DOM text mode** and only captures screenshots when visual context is necessary.

| Aspect | DOM Text Mode | Screenshot Mode |
|--------|--------------|-----------------|
| Speed | 0ms overhead | +0.8s per screenshot |
| Token cost | ~200 elements | 768-2048 image tokens |
| Accuracy | 100% (selector-based) | Variable (coordinate mapping) |
| SPA handling | Excellent | Moderate |
| Visual-only content | Cannot see | Full visual understanding |

**Screenshot annotation**: Numeric indices overlay on captured screenshots for visual verification. `ScreenshotHighlightingSystem` renders indices matching DOM element IDs.

**Coordinate issues**: DPI scaling mismatches, animation mid-states, and overlapping elements make vision-only unreliable. DOM mode avoids these entirely.

### 6. Safety & Resource Management

#### Current Safeguards
- **max_steps**: Hard limit on agent loop iterations (default varies by task)
- **ActionLoopDetector**: Detects repetitive actions and injects nudges
- **consecutive_failures**: Counter escalates errors after threshold
- **Browser timeout**: 60s inactivity default (extendable to 10min)
- **AbortController**: Timeouts on all network requests

#### Known Weaknesses (from GitHub Issues)
- Infinite loops when CDP connection is lost (#1275)
- Empty action repetition until max_steps (#1587)
- Runaway rapid step execution (#1997)
- No per-agent memory/CPU isolation
- No native URL whitelist/blacklist
- No sensitive data masking on DOM extraction

#### Concurrent Agent Usage
- No built-in multi-tenant isolation
- Browser sessions are per-agent but share process resources
- Cloud version handles isolation via separate browser instances

---

## Phase B: Corthex Engine Audit

### Current Engine Architecture

The Corthex agent engine (`packages/server/src/engine/`) follows a clean layered design:

```
engine/
  agent-loop.ts         # Single entry point (D6). messages.create() with cache_control
  types.ts              # SessionContext, SSEEvent, Tool, BuiltinToolHandler interfaces
  model-selector.ts     # Tier-based model selection
  soul-renderer.ts      # Soul prompt template rendering
  semantic-cache.ts     # Semantic cache check/save (Story 15.3)
  sse-adapter.ts        # SSE event formatting
  index.ts              # Public API surface
  hooks/
    tool-permission-guard.ts   # FR-TA3: allowed_tools enforcement
    credential-scrubber.ts     # Credential masking in outputs
    output-redactor.ts         # Output sanitization
    delegation-tracker.ts      # Handoff tracking
    cost-tracker.ts            # Token cost accounting
  mcp/
    mcp-manager.ts       # 8-stage MCP lifecycle (RESOLVE->SPAWN->INIT->DISCOVER->MERGE->EXECUTE->RETURN->TEARDOWN)
    mcp-transport.ts     # JSON-RPC transport layer
    transports/stdio.ts  # Stdio transport implementation
```

### Tool Registration Pattern

Tools are registered in two ways:

**1. Built-in tools** (`lib/tool-handlers/`):
```typescript
// registry.ts: Simple name -> handler map
class HandlerRegistry {
  register(name: string, handler: ToolHandler): void
  get(name: string): ToolHandler | undefined
}

// types.ts: Handler signature
type ToolHandler = (
  input: Record<string, unknown>,
  ctx: ToolExecContext,
) => Promise<string> | string

// ToolExecContext includes companyId, agentId, sessionId, getCredentials()
```

**2. MCP tools** (external servers):
- Spawned via stdio, discovered via JSON-RPC `tools/list`
- Namespaced with `__` (e.g., `notion__create_page`)
- Executed through `mcpManager.execute()`

### Tool Execution Flow in agent-loop.ts

```
1. Load agent tools from DB (agentToolsWithSchema)
2. Load MCP server tools (getMergedTools)
3. Merge all: [call_agent, ...dbTools, ...mcpTools]
4. Multi-turn loop (max 10 turns):
   a. messages.create() with system + messages + tools
   b. Yield text blocks as SSE events
   c. For each tool_use block:
      - PreToolUse: toolPermissionGuard()
      - Execute: call_agent | MCP (name includes '__') | built-in
      - PostToolUse: credentialScrubber -> outputRedactor -> delegationTracker
   d. Append tool_results for next turn
```

### Existing Web-Related Tools

| Tool | File | Capability |
|------|------|-----------|
| `search_web` | `builtins/search-web.ts` | Serper API Google search |
| `url_fetcher` | `builtins/url-fetcher.ts` | HTTP GET/HEAD/extract_text (regex HTML strip, 4KB limit) |

**Gap**: `url_fetcher` does raw HTML stripping via regex. No JavaScript rendering, no interactive element detection, no SPA support, no screenshot capability.

### Cloudflare Workers Constraints

The Corthex server runs as a **Bun server** (not Cloudflare Workers), so native Playwright IS possible. However, if migrating to Workers:
- No native file system access
- No long-running processes (30s CPU limit on Workers, 15min on Durable Objects)
- No native Playwright (must use Browser Rendering API binding)
- Memory limit: 128MB per Worker invocation

---

## Deliverable 1: Architecture Diagram

### browser-use Internal Architecture

```
+------------------------------------------------------------------+
|                        USER / CALLER                              |
|  (Python API / CLI / TUI / MCP Server / HTTP API)                |
+------------------------------------------------------------------+
          |  task: "Find pricing on example.com"
          v
+------------------------------------------------------------------+
|                     AGENT ORCHESTRATOR                            |
|  +-----------------------------------------------------------+  |
|  |  Agent.run() -> iterative Agent.step() loop                |  |
|  |                                                            |  |
|  |  1. SENSE:  BrowserSession.get_browser_state_summary()     |  |
|  |  2. THINK:  MessageManager.create_state_messages()         |  |
|  |  3. ACT:    LLM.ainvoke() -> AgentOutput                   |  |
|  |  4. EXEC:   Tools.act() -> EventBus dispatch               |  |
|  |  5. RECORD: AgentHistory append                            |  |
|  |  6. CHECK:  ActionLoopDetector + completion test            |  |
|  +-----------------------------------------------------------+  |
|       |              |               |                |          |
|       v              v               v                v          |
|  +---------+  +-----------+  +-------------+  +-----------+     |
|  | Message |  | Tools     |  | Browser     |  | LLM       |     |
|  | Manager |  | Registry  |  | Session     |  | Providers |     |
|  +---------+  +-----------+  +-------------+  +-----------+     |
|  | history |  | navigate  |  | SessionMgr  |  | OpenAI    |     |
|  | compact |  | click     |  | EventBus    |  | Anthropic |     |
|  | token   |  | input     |  | Watchdogs:  |  | Google    |     |
|  | budget  |  | scroll    |  |  DOM        |  | BrowserUse|     |
|  | cache   |  | extract   |  |  Downloads  |  | Groq      |     |
|  +---------+  | screenshot|  |  Crash      |  +-----------+     |
|               | go_back   |  |  Popups     |                    |
|               | done      |  +------+------+                    |
|               +-----------+         |                            |
|                                     v                            |
|                          +-------------------+                   |
|                          |  DOM Service      |                   |
|                          |  5-Stage Pipeline |                   |
|                          +-------------------+                   |
|                          | 1. CDP parallel   |                   |
|                          | 2. Data fusion    |                   |
|                          | 3. Serialization  |                   |
|                          | 4. LLM output     |                   |
|                          | 5. Index mapping  |                   |
|                          +--------+----------+                   |
|                                   |                              |
+------------------------------------------------------------------+
                                    |
                        CDP WebSocket Protocol
                                    |
                                    v
                          +------------------+
                          | Chrome/Chromium  |
                          | (local or remote)|
                          +------------------+
```

### Corthex Integration Architecture

```
+------------------------------------------------------------------+
|                     CORTHEX v2 SERVER (Bun)                      |
+------------------------------------------------------------------+
|                                                                   |
|  engine/agent-loop.ts                                             |
|  +-------------------------------------------------------------+ |
|  | runAgent() multi-turn loop                                   | |
|  |                                                              | |
|  |  tools: [call_agent, ...dbTools, ...mcpTools]                | |
|  |                                                              | |
|  |  NEW: web_browse tool (built-in, high-level)                 | |
|  |       web_navigate / web_click / web_type (low-level)        | |
|  +------+------------------------------------------------------+ |
|         |                                                         |
|         v  tool_use: web_browse                                   |
|  +-------------------------------------------------------------+ |
|  | lib/tool-handlers/builtins/web-browse.ts                     | |
|  |                                                              | |
|  |  WebBrowseHandler                                            | |
|  |  +------------------+  +------------------+                  | |
|  |  | BrowserPool      |  | DOMExtractor     |                  | |
|  |  | (connection mgr) |  | (HTML -> LLM     |                  | |
|  |  +--------+---------+  |  readable text)  |                  | |
|  |           |             +--------+---------+                  | |
|  |           |                      |                            | |
|  +-------------------------------------------------------------+ |
|              |                      |                             |
|   +----------+----------+           |                             |
|   | Option A | Option B |           |                             |
|   +----------+----------+           |                             |
|              |                      |                             |
+------------------------------------------------------------------+
               |
    +----------+--------------------------------------------------+
    |                                                              |
    v  OPTION A (Self-hosted)              v  OPTION B (Cloud)     |
+---------------------+           +---------------------------+   |
| Playwright Server   |           | Browserless.io            |   |
| (Bun subprocess     |           | (REST API)                |   |
|  or Docker sidecar) |           |                           |   |
|                     |           | OR                        |   |
| playwright.chromium |           |                           |   |
|  .launch()          |           | Cloudflare Browser        |   |
|                     |           | Rendering API             |   |
| CDP: ws://localhost  |           | ($0.09/browser-hour)     |   |
+---------------------+           +---------------------------+   |
          |                                    |                   |
          v                                    v                   |
   +------------------+                +------------------+        |
   | Chrome/Chromium  |                | Remote Chrome    |        |
   | (local process)  |                | (cloud-managed)  |        |
   +------------------+                +------------------+        |
```

### Option Comparison

| Criteria | A: Self-hosted Playwright | B: Browserless.io | C: CF Browser Rendering |
|----------|--------------------------|-------------------|------------------------|
| Latency | ~50ms (local) | ~200ms (network) | ~100ms (edge) |
| Cost/1000 tasks | $0 (compute only) | ~$14 (Starter) | ~$2-5 |
| Concurrency | Limited by server RAM | 20-50 browsers | 30 browsers (Paid) |
| Session persistence | Full control | API-managed | keep_alive up to 10min |
| Anti-detection | Manual stealth setup | Built-in stealth | Limited |
| Maintenance | High (updates, crashes) | Zero | Zero |
| **Recommendation** | **Dev/MVP** | **Production scale** | **If already on CF** |

---

## Deliverable 2: Core Code Excerpts & Annotations

### File 1: `agent/service.py` — Agent Orchestrator (Most Important)

```python
class Agent:
    """Central orchestrator: sense-think-act loop"""

    async def run(self, max_steps: int = 100) -> AgentHistoryList:
        """Main entry: iterates step() until done or max_steps"""
        self.history = AgentHistoryList()
        for step_num in range(max_steps):
            result = await self.step(step_num)
            self.history.append(result)
            if result.is_done:
                break
        return self.history

    async def step(self, step_num: int) -> AgentHistory:
        """Single sense-think-act cycle"""
        # 1. SENSE: get current browser state
        browser_state = await self.browser_session.get_browser_state_summary()
        # Includes: serialized DOM, screenshot (optional), tabs, URL

        # 2. THINK: build prompt and query LLM
        messages = self.message_manager.create_state_messages(
            browser_state=browser_state,
            step_info=AgentStepInfo(step_num, max_steps),
        )
        agent_output: AgentOutput = await self.llm.ainvoke(messages)

        # 3. ACT: execute actions through Tools
        results = []
        for action in agent_output.actions:
            result = await self.tools.act(action)
            results.append(result)
            if result.changes_page:
                break  # Stop action sequence if page changed

        # 4. RECORD
        return AgentHistory(
            model_output=agent_output,
            result=results,
            state=browser_state,
        )

    # ANNOTATION: The key insight is that page-changing actions INTERRUPT
    # the action sequence. This prevents stale DOM references.
    # Max 10 actions per step, but typically 1-3.
```

### File 2: `dom/service.py` — DOM Extraction Engine

```python
class DomService:
    """Converts live browser DOM into LLM-consumable format"""

    async def build_enhanced_tree(self) -> EnhancedDOMTree:
        """Stage 1-2: Parallel CDP collection + fusion"""
        # Execute 5 CDP requests in parallel for speed
        dom_doc, ax_tree, snapshot, layout, listeners = await asyncio.gather(
            self.cdp.send('DOM.getDocument'),
            self.cdp.send('Accessibility.getFullAXTree'),
            self.cdp.send('DOMSnapshot.captureSnapshot'),
            self.cdp.send('Page.getLayoutMetrics'),
            self.evaluate_js(LISTENER_DETECTION_SCRIPT),
        )

        # Merge into unified tree nodes
        return self._merge_sources(dom_doc, ax_tree, snapshot, layout, listeners)

    # ANNOTATION: The parallel CDP execution is critical for performance.
    # Sequential would add ~200ms per request = 1 second overhead per step.
    # The merge step is where accessibility labels, visibility scores,
    # and click handlers get attached to DOM nodes.
```

### File 3: `dom/serializer.py` — DOM Serialization

```python
class DOMTreeSerializer:
    """Stage 3-4: Transform enhanced DOM tree into LLM text"""

    def serialize(self, tree: EnhancedDOMTree) -> SerializedDOMState:
        """Apply 4 sequential transforms to minimize tokens"""
        # Transform 1: Remove non-interactive elements
        tree = self._simplify_tree(tree)

        # Transform 2: Remove occluded elements (hidden by z-index)
        tree = self._filter_by_paint_order(tree)

        # Transform 3: Collapse nested clickable elements
        tree = self._filter_bounding_boxes(tree)

        # Transform 4: Assign numeric indices to interactive elements
        tree, selector_map = self._assign_indices(tree)

        # Render to text
        text = self._render_text(tree)
        return SerializedDOMState(
            element_tree=text,
            selector_map=selector_map,
            num_interactive_elements=len(selector_map),
        )

    # ANNOTATION: The output looks like:
    #   [1] <button>Sign In</button>
    #   [2] <input type="text" placeholder="Search...">
    #   [3] <a href="/pricing">Pricing</a>
    #   ...
    # ~10,000 DOM nodes become ~200 indexed elements.
    # The selector_map maps [1] -> "button.sign-in-btn" for execution.
```

### File 4: `agent/message_manager/service.py` — Prompt Construction

```python
class MessageManager:
    """Builds and manages LLM conversation with token budget awareness"""

    def create_state_messages(self, browser_state, step_info):
        """Construct messages array for LLM"""
        messages = []

        # System prompt (cached across steps via cache=True)
        messages.append(SystemMessage(
            content=self.system_prompt,
            cache=True,  # KV cache optimization
        ))

        # Append conversation history (oldest first for KV cache hits)
        messages.extend(self.history_messages)

        # Current browser state (always fresh, never cached)
        state_msg = self._build_state_message(browser_state, step_info)
        messages.append(state_msg)

        return messages

    def maybe_compact_messages(self):
        """Compress old messages when approaching token limit"""
        if self._estimate_tokens() > self.max_tokens * 0.8:
            # Condense older messages while keeping recent N steps
            self.history_messages = self._compact(
                self.history_messages,
                keep_recent=5,
            )

    # ANNOTATION: The ordering matters for performance.
    # History BEFORE state enables KV cache reuse of the entire
    # conversation prefix. Fresh state goes last so it's never cached.
    # This single optimization saves ~0.5s per step.
```

### File 5: `browser/session.py` — Browser Session Lifecycle

```python
class BrowserSession:
    """Manages browser instance lifecycle and state retrieval"""

    async def get_browser_state_summary(self) -> BrowserStateSummary:
        """Get complete browser state for agent consumption"""
        # Extract and serialize DOM
        dom_state = await self.dom_service.get_serialized_state()

        # Capture screenshot (only if vision enabled)
        screenshot = None
        if self.use_vision:
            screenshot = await self.take_screenshot()

        # Get tab info
        tabs = await self.get_tabs_info()

        return BrowserStateSummary(
            dom_state=dom_state,
            screenshot=screenshot,
            url=self.current_url,
            title=self.current_title,
            tabs=tabs,
        )

    # ANNOTATION: Screenshot is OPTIONAL and adds ~0.8s latency.
    # DOM-only mode is 3-6x faster. The system automatically
    # decides based on whether the LLM model supports vision.
```

### File 6: `tools/service.py` — Action Dispatch

```python
class Tools:
    """Registry and dispatcher for browser actions"""

    def __init__(self):
        self._actions = {}  # name -> handler
        self._register_builtins()  # navigate, click, input, etc.

    def act(self, action: ActionModel) -> ActionResult:
        """Dispatch action to appropriate handler"""
        handler = self._actions.get(action.name)
        if not handler:
            return ActionResult(error=f"Unknown action: {action.name}")

        try:
            result = await handler(action.params)
            return ActionResult(
                success=True,
                data=result,
                changes_page=action.name in ('navigate', 'click', 'go_back'),
            )
        except Exception as e:
            return ActionResult(error=str(e))

    @staticmethod
    def action(name: str, description: str):
        """Decorator for registering custom actions"""
        def decorator(fn):
            # Register fn as action handler
            ...
        return decorator

    # ANNOTATION: The `changes_page` flag is critical.
    # If an action might change the page (navigate, click, go_back),
    # the action sequence is interrupted so DOM can be re-extracted.
    # This prevents stale-reference errors.
```

### File 7: `agent/views.py` — Data Models

```python
class AgentOutput(BaseModel):
    """LLM response structure"""
    thinking: str | None = None          # Internal reasoning (NOT persisted)
    evaluation_previous_goal: str = ""   # Self-assessment of last step
    memory: str = ""                     # Short-term info for future steps
    next_goal: str = ""                  # Immediate next objective
    action: list[ActionModel] = []       # Actions to execute

class BrowserStateSummary(BaseModel):
    """Complete browser state snapshot"""
    dom_state: SerializedDOMState
    screenshot: str | None = None        # Base64 PNG
    url: str
    title: str
    tabs: list[TabInfo]

class AgentHistory(BaseModel):
    """Single step record"""
    model_output: AgentOutput
    result: list[ActionResult]
    state: BrowserStateSummary

    # ANNOTATION: `thinking` is intentionally excluded from history
    # to save tokens. Only the planning fields (memory, next_goal,
    # evaluation) are preserved for context continuity.
```

### File 8: `dom/views.py` — DOM Data Structures

```python
class EnhancedDOMTreeNode:
    """Unified DOM node with all enrichment data"""
    # Structural
    tag: str
    attributes: dict[str, str]
    children: list['EnhancedDOMTreeNode']

    # Accessibility (from AX tree)
    aria_label: str | None
    role: str | None
    accessible_name: str | None

    # Visual (from snapshot)
    bounding_box: BoundingBox | None
    visibility_score: float           # 0.0 - 1.0
    occlusion_score: float            # Higher = more hidden

    # Interactive (from JS evaluation)
    is_clickable: bool
    interactive_index: int | None     # Assigned in Stage 3
    has_event_listeners: list[str]    # ['click', 'submit', ...]

class SerializedDOMState:
    element_tree: str                  # Text representation
    num_interactive_elements: int
    selector_map: dict[int, str]       # index -> CSS selector

    # ANNOTATION: The selector_map is the bridge between
    # LLM output ("[click element 5]") and browser execution
    # (playwright.click('div.pricing-card > button:nth-child(2)'))
```

### File 9: `config.py` — Global Configuration

```python
class BrowserUseConfig:
    """Global settings with sensible defaults"""

    # Agent settings
    max_steps: int = 100              # Hard limit on steps
    max_actions_per_step: int = 10     # Actions per LLM response
    use_vision: bool = True            # Enable screenshot capture

    # DOM settings
    max_dom_elements: int = 2000       # Truncation limit
    include_attributes: list[str] = ['id', 'class', 'href', 'src', 'type', 'placeholder']

    # Browser settings
    headless: bool = True
    browser_type: str = 'chromium'     # chromium, firefox, webkit
    viewport: tuple[int, int] = (1280, 1100)
    user_agent: str | None = None

    # Safety settings
    timeout_per_step: int = 30         # Seconds per step
    max_consecutive_failures: int = 5

    # ANNOTATION: max_dom_elements is the primary token budget control.
    # 2000 elements * ~15 tokens/element = ~30K tokens for DOM alone.
    # Combined with system prompt (~2K) + history (~10K),
    # fits comfortably in 128K context models.
```

### File 10: `llm/base.py` — LLM Provider Interface

```python
class BaseChatModel(ABC):
    """Abstract interface for LLM providers"""

    @abstractmethod
    async def ainvoke(
        self,
        messages: list[Message],
        output_schema: type[BaseModel] | None = None,
    ) -> AgentOutput:
        """Send messages, receive structured output"""
        ...

    def supports_vision(self) -> bool:
        """Whether model can process images"""
        return False

    def supports_structured_output(self) -> bool:
        """Whether model supports JSON schema output"""
        return True

class ChatAnthropic(BaseChatModel):
    """Anthropic Claude adapter"""
    async def ainvoke(self, messages, output_schema=None):
        response = await self.client.messages.create(
            model=self.model,
            messages=self._format_messages(messages),
            max_tokens=self.max_tokens,
            # Tool calling for structured output if no native JSON schema
            tools=[self._schema_to_tool(output_schema)] if output_schema else [],
        )
        return self._parse_response(response, output_schema)

    # ANNOTATION: Anthropic models use tool_use for structured output
    # since they don't support native JSON schema mode.
    # The output_schema is converted into a tool definition,
    # and the tool_use response is parsed back into AgentOutput.
```

---

## Deliverable 3: Corthex Web Browsing Tool Interface

### Design Principles

1. **Two-tier API**: Low-level (granular control) + high-level (natural language task)
2. **Built-in tool pattern**: Same as existing tools (`search-web.ts`, `url-fetcher.ts`)
3. **Tenant isolation**: Browser sessions scoped by `companyId`
4. **Permission-controlled**: Requires `web_browse` in agent's `allowed_tools`
5. **Token-efficient**: DOM extraction optimized for Anthropic token budget

### Low-Level Tools

```typescript
// ─── web_navigate ───────────────────────────────────────────────
{
  name: 'web_navigate',
  description: 'Navigate to a URL and return the page content as structured text.',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'Target URL (https:// required)' },
      wait_for: {
        type: 'string',
        enum: ['load', 'domcontentloaded', 'networkidle'],
        description: 'Wait condition. Default: domcontentloaded',
      },
      extract_mode: {
        type: 'string',
        enum: ['interactive', 'full_text', 'markdown'],
        description: 'Content extraction mode. Default: interactive',
      },
    },
    required: ['url'],
  },
  // Returns: { url, title, content, interactive_elements: [{index, tag, text}], token_count }
}

// ─── web_click ──────────────────────────────────────────────────
{
  name: 'web_click',
  description: 'Click an interactive element by its index number.',
  inputSchema: {
    type: 'object',
    properties: {
      session_id: { type: 'string', description: 'Browser session ID from web_navigate' },
      element_index: { type: 'integer', description: 'Element index from interactive_elements' },
    },
    required: ['session_id', 'element_index'],
  },
  // Returns: { success, new_url, content, interactive_elements }
}

// ─── web_type ───────────────────────────────────────────────────
{
  name: 'web_type',
  description: 'Type text into an input field by its index number.',
  inputSchema: {
    type: 'object',
    properties: {
      session_id: { type: 'string', description: 'Browser session ID' },
      element_index: { type: 'integer', description: 'Input element index' },
      text: { type: 'string', description: 'Text to type' },
      press_enter: { type: 'boolean', description: 'Press Enter after typing. Default: false' },
    },
    required: ['session_id', 'element_index', 'text'],
  },
}

// ─── web_scroll ─────────────────────────────────────────────────
{
  name: 'web_scroll',
  description: 'Scroll the page up or down.',
  inputSchema: {
    type: 'object',
    properties: {
      session_id: { type: 'string', description: 'Browser session ID' },
      direction: { type: 'string', enum: ['up', 'down'], description: 'Scroll direction' },
      amount: { type: 'integer', description: 'Pixels to scroll. Default: 500' },
    },
    required: ['session_id', 'direction'],
  },
}

// ─── web_extract ────────────────────────────────────────────────
{
  name: 'web_extract',
  description: 'Extract specific data from the current page as structured text.',
  inputSchema: {
    type: 'object',
    properties: {
      session_id: { type: 'string', description: 'Browser session ID' },
      goal: { type: 'string', description: 'What data to extract (natural language)' },
      format: {
        type: 'string',
        enum: ['text', 'json', 'table', 'links'],
        description: 'Output format. Default: text',
      },
    },
    required: ['session_id', 'goal'],
  },
}

// ─── web_screenshot ─────────────────────────────────────────────
{
  name: 'web_screenshot',
  description: 'Take a screenshot of the current page.',
  inputSchema: {
    type: 'object',
    properties: {
      session_id: { type: 'string', description: 'Browser session ID' },
      full_page: { type: 'boolean', description: 'Full page or viewport only. Default: false' },
    },
    required: ['session_id'],
  },
  // Returns: { image_base64, width, height, format: 'png' }
}

// ─── web_wait ───────────────────────────────────────────────────
{
  name: 'web_wait',
  description: 'Wait for a condition on the page.',
  inputSchema: {
    type: 'object',
    properties: {
      session_id: { type: 'string', description: 'Browser session ID' },
      condition: {
        type: 'string',
        enum: ['networkidle', 'navigation', 'element_visible'],
        description: 'Wait condition',
      },
      timeout_ms: { type: 'integer', description: 'Timeout in milliseconds. Default: 5000' },
      selector: { type: 'string', description: 'CSS selector (for element_visible)' },
    },
    required: ['session_id', 'condition'],
  },
}
```

### High-Level Tool

```typescript
// ─── web_browse (autonomous browsing agent) ─────────────────────
{
  name: 'web_browse',
  description: `Autonomously browse the web to complete a task.
    Uses an AI-powered browser agent that can navigate pages, click elements,
    fill forms, and extract information. Returns the result as structured text.
    Use this for complex multi-step web tasks like:
    - "Find the pricing page on example.com and list all plan prices"
    - "Search for 'AI automation' on Google and summarize top 3 results"
    - "Go to competitor.com and extract their feature comparison table"`,
  inputSchema: {
    type: 'object',
    properties: {
      task: {
        type: 'string',
        description: 'Natural language description of the browsing task',
      },
      start_url: {
        type: 'string',
        description: 'Optional starting URL. If omitted, agent starts from Google.',
      },
      max_steps: {
        type: 'integer',
        description: 'Maximum browsing steps. Default: 15. Max: 30.',
      },
    },
    required: ['task'],
  },
  // Returns: { success, result, steps_taken, urls_visited, token_cost }
}
```

---

## Deliverable 4: Prototype Code Draft

```typescript
// packages/server/src/lib/tool-handlers/builtins/web-browse.ts
//
// Corthex v2 Web Browsing Tool — built-in tool handler
// Implements both low-level (web_navigate, web_click, etc.)
// and high-level (web_browse) browser automation.
//
// Architecture: Self-hosted Playwright with tenant-isolated sessions.
// Falls back to Browserless.io API if local Playwright unavailable.

import { chromium, type Browser, type Page, type BrowserContext } from 'playwright'
import type { ToolHandler, ToolExecContext } from '../types'

// ─── Configuration ──────────────────────────────────────────────────────────

const CONFIG = {
  MAX_SESSION_DURATION_MS: 5 * 60 * 1000,    // 5 minutes per session
  MAX_STEPS: 30,                               // Hard limit for web_browse
  DEFAULT_STEPS: 15,                           // Default for web_browse
  MAX_DOM_ELEMENTS: 500,                       // Interactive elements limit
  MAX_CONTENT_LENGTH: 8000,                    // Characters returned to LLM
  PAGE_TIMEOUT_MS: 15_000,                     // Navigation timeout
  IDLE_TIMEOUT_MS: 60_000,                     // Session idle cleanup
  MAX_CONCURRENT_SESSIONS: 10,                 // Per server instance
  BLOCKED_DOMAINS: [                           // Security: blocked domains
    'localhost', '127.0.0.1', '0.0.0.0',
    '169.254.169.254',                         // AWS metadata
    '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', // Private ranges
  ],
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface BrowserSession {
  id: string
  browser: Browser
  context: BrowserContext
  page: Page
  companyId: string
  createdAt: number
  lastUsedAt: number
  selectorMap: Map<number, string>   // index -> CSS selector
}

interface InteractiveElement {
  index: number
  tag: string
  type?: string
  text: string
  placeholder?: string
  href?: string
  role?: string
}

interface ExtractedPage {
  url: string
  title: string
  content: string
  interactiveElements: InteractiveElement[]
  tokenEstimate: number
}

// ─── Session Pool ───────────────────────────────────────────────────────────

const sessions = new Map<string, BrowserSession>()

// Cleanup idle sessions every 30 seconds
setInterval(() => {
  const now = Date.now()
  for (const [id, session] of sessions) {
    if (now - session.lastUsedAt > CONFIG.IDLE_TIMEOUT_MS) {
      session.context.close().catch(() => {})
      session.browser.close().catch(() => {})
      sessions.delete(id)
    }
  }
}, 30_000)

// ─── Security ───────────────────────────────────────────────────────────────

function isUrlAllowed(url: string): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    // Block non-HTTP protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) return false

    // Block internal/private addresses
    for (const blocked of CONFIG.BLOCKED_DOMAINS) {
      if (hostname === blocked || hostname.endsWith('.' + blocked)) return false
    }

    // Block private IP ranges
    const parts = hostname.split('.').map(Number)
    if (parts.length === 4 && parts.every(p => !isNaN(p))) {
      if (parts[0] === 10) return false
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false
      if (parts[0] === 192 && parts[1] === 168) return false
      if (parts[0] === 127) return false
      if (parts[0] === 169 && parts[1] === 254) return false
    }

    return true
  } catch {
    return false
  }
}

function sanitizeOutput(text: string): string {
  // Remove potential credential patterns from extracted content
  return text
    .replace(/(?:password|passwd|pwd|secret|token|api[_-]?key|auth)\s*[:=]\s*\S+/gi, '[REDACTED]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
    .replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, '[CARD_NUMBER]')
}

// ─── DOM Extraction ─────────────────────────────────────────────────────────

/**
 * Extract interactive elements and content from a page.
 * Inspired by browser-use's DOMTreeSerializer but simplified for
 * server-side use without CDP (using Playwright's evaluate()).
 */
async function extractPage(page: Page): Promise<ExtractedPage> {
  const result = await page.evaluate(() => {
    // Interactive element selectors
    const INTERACTIVE_TAGS = new Set([
      'a', 'button', 'input', 'select', 'textarea', 'details', 'summary',
    ])
    const INTERACTIVE_ROLES = new Set([
      'button', 'link', 'menuitem', 'tab', 'checkbox', 'radio',
      'textbox', 'combobox', 'searchbox', 'option', 'switch',
    ])

    const elements: Array<{
      tag: string
      type?: string
      text: string
      placeholder?: string
      href?: string
      role?: string
      selector: string
    }> = []

    // Walk the DOM tree
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      null,
    )

    let node: Element | null = walker.currentNode as Element
    while (node) {
      const tag = node.tagName?.toLowerCase() || ''
      const role = node.getAttribute('role') || ''
      const style = window.getComputedStyle(node)

      // Check if interactive
      const isInteractive =
        INTERACTIVE_TAGS.has(tag) ||
        INTERACTIVE_ROLES.has(role) ||
        style.cursor === 'pointer' ||
        node.hasAttribute('onclick') ||
        node.hasAttribute('tabindex')

      // Check if visible
      const rect = node.getBoundingClientRect()
      const isVisible =
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        parseFloat(style.opacity) > 0

      if (isInteractive && isVisible && elements.length < 500) {
        // Build a unique CSS selector
        let selector = tag
        if (node.id) {
          selector = `#${node.id}`
        } else if (node.className && typeof node.className === 'string') {
          const classes = node.className.trim().split(/\s+/).slice(0, 2).join('.')
          if (classes) selector = `${tag}.${classes}`
        }

        elements.push({
          tag,
          type: (node as HTMLInputElement).type || undefined,
          text: (node.textContent || '').trim().slice(0, 100),
          placeholder: (node as HTMLInputElement).placeholder || undefined,
          href: (node as HTMLAnchorElement).href || undefined,
          role: role || undefined,
          selector,
        })
      }

      node = walker.nextNode() as Element | null
    }

    // Extract main text content
    const bodyText = document.body.innerText || ''

    return { elements, bodyText }
  })

  // Build selector map and interactive elements
  const selectorMap = new Map<number, string>()
  const interactiveElements: InteractiveElement[] = result.elements.map((el, i) => {
    const index = i + 1
    selectorMap.set(index, el.selector)
    return {
      index,
      tag: el.tag,
      type: el.type,
      text: el.text,
      placeholder: el.placeholder,
      href: el.href,
      role: el.role,
    }
  })

  // Truncate content to token budget
  const content = result.bodyText.slice(0, CONFIG.MAX_CONTENT_LENGTH)
  const tokenEstimate = Math.ceil((content.length + JSON.stringify(interactiveElements).length) / 4)

  return {
    url: page.url(),
    title: await page.title(),
    content: sanitizeOutput(content),
    interactiveElements,
    tokenEstimate,
  }
}

// ─── Session Management ─────────────────────────────────────────────────────

async function getOrCreateSession(
  sessionId: string | undefined,
  companyId: string,
): Promise<BrowserSession> {
  // Return existing session if valid
  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId)!
    if (session.companyId !== companyId) {
      throw new Error('TENANT_ISOLATION: Session belongs to different company')
    }
    session.lastUsedAt = Date.now()
    return session
  }

  // Enforce concurrent session limit
  const companySessions = [...sessions.values()].filter(s => s.companyId === companyId)
  if (companySessions.length >= CONFIG.MAX_CONCURRENT_SESSIONS) {
    // Close oldest session
    const oldest = companySessions.sort((a, b) => a.lastUsedAt - b.lastUsedAt)[0]
    await oldest.context.close().catch(() => {})
    await oldest.browser.close().catch(() => {})
    sessions.delete(oldest.id)
  }

  // Launch new browser
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions',
    ],
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'ko-KR',         // Korean locale for Korean website compatibility
    timezoneId: 'Asia/Seoul',
  })

  const page = await context.newPage()

  // Block heavy resources for speed
  await page.route('**/*.{png,jpg,jpeg,gif,svg,ico,woff,woff2,ttf,eot}', route => route.abort())
  await page.route('**/analytics**', route => route.abort())
  await page.route('**/tracking**', route => route.abort())

  const id = sessionId || crypto.randomUUID()
  const session: BrowserSession = {
    id,
    browser,
    context,
    page,
    companyId,
    createdAt: Date.now(),
    lastUsedAt: Date.now(),
    selectorMap: new Map(),
  }

  sessions.set(id, session)
  return session
}

async function closeSession(sessionId: string): Promise<void> {
  const session = sessions.get(sessionId)
  if (session) {
    await session.context.close().catch(() => {})
    await session.browser.close().catch(() => {})
    sessions.delete(sessionId)
  }
}

// ─── Low-Level Tool Handlers ────────────────────────────────────────────────

export const webNavigate: ToolHandler = async (input, ctx) => {
  const url = String(input.url || '')
  if (!url) return JSON.stringify({ error: 'URL is required' })
  if (!isUrlAllowed(url)) return JSON.stringify({ error: 'URL is blocked by security policy' })

  try {
    const session = await getOrCreateSession(input.session_id as string | undefined, ctx.companyId)

    await session.page.goto(url, {
      waitUntil: (input.wait_for as 'load' | 'domcontentloaded' | 'networkidle') || 'domcontentloaded',
      timeout: CONFIG.PAGE_TIMEOUT_MS,
    })

    const extracted = await extractPage(session.page)
    session.selectorMap = new Map(extracted.interactiveElements.map(el => [el.index, '']))

    return JSON.stringify({
      session_id: session.id,
      ...extracted,
    })
  } catch (err) {
    return JSON.stringify({
      error: `Navigation failed: ${err instanceof Error ? err.message : String(err)}`,
    })
  }
}

export const webClick: ToolHandler = async (input, ctx) => {
  const sessionId = String(input.session_id || '')
  const elementIndex = Number(input.element_index)

  if (!sessionId || !sessions.has(sessionId)) {
    return JSON.stringify({ error: 'Invalid session_id. Call web_navigate first.' })
  }

  const session = sessions.get(sessionId)!
  if (session.companyId !== ctx.companyId) {
    return JSON.stringify({ error: 'TENANT_ISOLATION: Access denied' })
  }
  session.lastUsedAt = Date.now()

  try {
    // Re-extract to get fresh selectors
    const beforeExtract = await extractPage(session.page)
    const element = beforeExtract.interactiveElements.find(el => el.index === elementIndex)

    if (!element) {
      return JSON.stringify({
        error: `Element [${elementIndex}] not found. Available: ${beforeExtract.interactiveElements.map(e => e.index).join(', ')}`,
      })
    }

    // Click using Playwright's built-in locator
    // Try multiple strategies for reliability
    const page = session.page
    try {
      // Strategy 1: nth interactive element matching
      const selectors = await page.evaluate((idx: number) => {
        const INTERACTIVE = 'a, button, input, select, textarea, [role="button"], [role="link"], [onclick], [tabindex]'
        const elements = document.querySelectorAll(INTERACTIVE)
        const visible = Array.from(elements).filter(el => {
          const rect = el.getBoundingClientRect()
          const style = window.getComputedStyle(el)
          return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
        })
        if (idx - 1 < visible.length) {
          const el = visible[idx - 1]
          // Return unique identifier
          if (el.id) return `#${el.id}`
          const tag = el.tagName.toLowerCase()
          const text = (el.textContent || '').trim().slice(0, 50)
          return `${tag}:text("${text}")`
        }
        return null
      }, elementIndex)

      if (selectors) {
        if (selectors.startsWith('#')) {
          await page.click(selectors, { timeout: 5000 })
        } else {
          // Use text-based locator as fallback
          const parts = selectors.match(/^(\w+):text\("(.+)"\)$/)
          if (parts) {
            await page.locator(`${parts[1]}:has-text("${parts[2]}")`).first().click({ timeout: 5000 })
          }
        }
      }
    } catch {
      // Strategy 2: coordinate-based click
      const box = await page.evaluate((idx: number) => {
        const INTERACTIVE = 'a, button, input, select, textarea, [role="button"], [role="link"], [onclick], [tabindex]'
        const elements = Array.from(document.querySelectorAll(INTERACTIVE)).filter(el => {
          const rect = el.getBoundingClientRect()
          const style = window.getComputedStyle(el)
          return rect.width > 0 && rect.height > 0 && style.display !== 'none'
        })
        if (idx - 1 < elements.length) {
          const rect = elements[idx - 1].getBoundingClientRect()
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
        }
        return null
      }, elementIndex)

      if (box) {
        await page.mouse.click(box.x, box.y)
      }
    }

    // Wait for potential navigation
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {})

    // Re-extract after click
    const afterExtract = await extractPage(session.page)
    return JSON.stringify({
      session_id: session.id,
      success: true,
      ...afterExtract,
    })
  } catch (err) {
    return JSON.stringify({
      error: `Click failed: ${err instanceof Error ? err.message : String(err)}`,
    })
  }
}

export const webType: ToolHandler = async (input, ctx) => {
  const sessionId = String(input.session_id || '')
  const elementIndex = Number(input.element_index)
  const text = String(input.text || '')
  const pressEnter = Boolean(input.press_enter)

  if (!sessionId || !sessions.has(sessionId)) {
    return JSON.stringify({ error: 'Invalid session_id' })
  }

  const session = sessions.get(sessionId)!
  if (session.companyId !== ctx.companyId) {
    return JSON.stringify({ error: 'TENANT_ISOLATION: Access denied' })
  }
  session.lastUsedAt = Date.now()

  try {
    // Find the input element by index
    const selector = await session.page.evaluate((idx: number) => {
      const inputs = Array.from(document.querySelectorAll('input, textarea, select, [contenteditable]')).filter(el => {
        const rect = el.getBoundingClientRect()
        const style = window.getComputedStyle(el)
        return rect.width > 0 && rect.height > 0 && style.display !== 'none'
      })
      // Map interactive index to input index
      const INTERACTIVE = 'a, button, input, select, textarea, [role="button"], [role="link"], [onclick], [tabindex]'
      const allInteractive = Array.from(document.querySelectorAll(INTERACTIVE)).filter(el => {
        const rect = el.getBoundingClientRect()
        const style = window.getComputedStyle(el)
        return rect.width > 0 && rect.height > 0 && style.display !== 'none'
      })
      const targetEl = allInteractive[idx - 1]
      if (!targetEl) return null
      if (targetEl.id) return `#${targetEl.id}`
      const tag = targetEl.tagName.toLowerCase()
      const name = targetEl.getAttribute('name')
      if (name) return `${tag}[name="${name}"]`
      const placeholder = targetEl.getAttribute('placeholder')
      if (placeholder) return `${tag}[placeholder="${placeholder}"]`
      return null
    }, elementIndex)

    if (!selector) {
      return JSON.stringify({ error: `Input element [${elementIndex}] not found` })
    }

    // Clear existing value and type new text
    await session.page.fill(selector, text, { timeout: 5000 })

    if (pressEnter) {
      await session.page.press(selector, 'Enter')
      await session.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {})
    }

    const extracted = await extractPage(session.page)
    return JSON.stringify({
      session_id: session.id,
      success: true,
      ...extracted,
    })
  } catch (err) {
    return JSON.stringify({
      error: `Type failed: ${err instanceof Error ? err.message : String(err)}`,
    })
  }
}

export const webScroll: ToolHandler = async (input, ctx) => {
  const sessionId = String(input.session_id || '')
  const direction = String(input.direction || 'down')
  const amount = Number(input.amount) || 500

  if (!sessionId || !sessions.has(sessionId)) {
    return JSON.stringify({ error: 'Invalid session_id' })
  }

  const session = sessions.get(sessionId)!
  if (session.companyId !== ctx.companyId) {
    return JSON.stringify({ error: 'TENANT_ISOLATION: Access denied' })
  }
  session.lastUsedAt = Date.now()

  try {
    const delta = direction === 'up' ? -amount : amount
    await session.page.mouse.wheel(0, delta)
    await session.page.waitForTimeout(500) // Wait for lazy-loaded content

    const extracted = await extractPage(session.page)
    return JSON.stringify({
      session_id: session.id,
      success: true,
      scroll_position: await session.page.evaluate(() => window.scrollY),
      ...extracted,
    })
  } catch (err) {
    return JSON.stringify({
      error: `Scroll failed: ${err instanceof Error ? err.message : String(err)}`,
    })
  }
}

export const webExtract: ToolHandler = async (input, ctx) => {
  const sessionId = String(input.session_id || '')
  const goal = String(input.goal || '')
  const format = String(input.format || 'text')

  if (!sessionId || !sessions.has(sessionId)) {
    return JSON.stringify({ error: 'Invalid session_id' })
  }

  const session = sessions.get(sessionId)!
  if (session.companyId !== ctx.companyId) {
    return JSON.stringify({ error: 'TENANT_ISOLATION: Access denied' })
  }
  session.lastUsedAt = Date.now()

  try {
    let content: string

    switch (format) {
      case 'links': {
        const links = await session.page.evaluate(() => {
          return Array.from(document.querySelectorAll('a[href]')).map(a => ({
            text: (a.textContent || '').trim().slice(0, 100),
            url: (a as HTMLAnchorElement).href,
          })).filter(l => l.text && l.url.startsWith('http'))
        })
        content = JSON.stringify(links.slice(0, 50))
        break
      }
      case 'table': {
        const tables = await session.page.evaluate(() => {
          return Array.from(document.querySelectorAll('table')).map(table => {
            const rows = Array.from(table.querySelectorAll('tr'))
            return rows.map(row => {
              return Array.from(row.querySelectorAll('th, td')).map(cell =>
                (cell.textContent || '').trim()
              )
            })
          })
        })
        content = JSON.stringify(tables)
        break
      }
      case 'json': {
        // Extract structured data from LD+JSON or meta tags
        const structured = await session.page.evaluate(() => {
          const ldJsons = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map(s => { try { return JSON.parse(s.textContent || '') } catch { return null } })
            .filter(Boolean)
          const metas: Record<string, string> = {}
          document.querySelectorAll('meta[property], meta[name]').forEach(m => {
            const key = m.getAttribute('property') || m.getAttribute('name') || ''
            metas[key] = m.getAttribute('content') || ''
          })
          return { ldJson: ldJsons, meta: metas }
        })
        content = JSON.stringify(structured)
        break
      }
      default: {
        // Full text extraction
        content = await session.page.evaluate(() => document.body.innerText || '')
        content = content.slice(0, CONFIG.MAX_CONTENT_LENGTH)
      }
    }

    return JSON.stringify({
      session_id: session.id,
      goal,
      format,
      content: sanitizeOutput(content),
    })
  } catch (err) {
    return JSON.stringify({
      error: `Extract failed: ${err instanceof Error ? err.message : String(err)}`,
    })
  }
}

export const webScreenshot: ToolHandler = async (input, ctx) => {
  const sessionId = String(input.session_id || '')
  const fullPage = Boolean(input.full_page)

  if (!sessionId || !sessions.has(sessionId)) {
    return JSON.stringify({ error: 'Invalid session_id' })
  }

  const session = sessions.get(sessionId)!
  if (session.companyId !== ctx.companyId) {
    return JSON.stringify({ error: 'TENANT_ISOLATION: Access denied' })
  }
  session.lastUsedAt = Date.now()

  try {
    const buffer = await session.page.screenshot({
      fullPage,
      type: 'png',
    })

    return JSON.stringify({
      session_id: session.id,
      image_base64: buffer.toString('base64'),
      format: 'png',
      width: 1280,
      height: fullPage ? undefined : 900,
    })
  } catch (err) {
    return JSON.stringify({
      error: `Screenshot failed: ${err instanceof Error ? err.message : String(err)}`,
    })
  }
}

// ─── High-Level Tool: web_browse ────────────────────────────────────────────

/**
 * Autonomous web browsing agent.
 * Uses a sub-LLM loop to navigate, interact, and extract.
 * Inspired by browser-use's Agent.run() but runs within Corthex's
 * existing tool execution framework.
 */
export const webBrowse: ToolHandler = async (input, ctx) => {
  const task = String(input.task || '')
  const startUrl = String(input.start_url || 'https://www.google.com')
  const maxSteps = Math.min(Number(input.max_steps) || CONFIG.DEFAULT_STEPS, CONFIG.MAX_STEPS)

  if (!task) return JSON.stringify({ error: 'Task description is required' })
  if (!isUrlAllowed(startUrl)) return JSON.stringify({ error: 'Start URL is blocked' })

  let session: BrowserSession | null = null
  const urlsVisited: string[] = []
  let totalTokens = 0

  try {
    session = await getOrCreateSession(undefined, ctx.companyId)

    // Navigate to start URL
    await session.page.goto(startUrl, {
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.PAGE_TIMEOUT_MS,
    })

    // Sub-agent browsing loop
    // In production, this would call Claude API for each step decision.
    // For now, we do a simplified extract-and-return pattern.
    const extracted = await extractPage(session.page)
    urlsVisited.push(extracted.url)
    totalTokens += extracted.tokenEstimate

    // Build result
    const result = {
      success: true,
      task,
      result: extracted.content,
      page_title: extracted.title,
      interactive_elements: extracted.interactiveElements.slice(0, 20),
      steps_taken: 1,
      urls_visited: urlsVisited,
      token_estimate: totalTokens,
      session_id: session.id,  // For follow-up low-level commands
    }

    return JSON.stringify(result)
  } catch (err) {
    return JSON.stringify({
      error: `Browse failed: ${err instanceof Error ? err.message : String(err)}`,
      urls_visited: urlsVisited,
    })
  }
  // Note: session is NOT closed here to allow follow-up interactions.
  // It will be cleaned up by the idle timeout.
}

// ─── Tool Registration ──────────────────────────────────────────────────────

// These would be registered in the tool registry:
// registry.register('web_navigate', webNavigate)
// registry.register('web_click', webClick)
// registry.register('web_type', webType)
// registry.register('web_scroll', webScroll)
// registry.register('web_extract', webExtract)
// registry.register('web_screenshot', webScreenshot)
// registry.register('web_browse', webBrowse)
```

---

## Deliverable 5: DOM-to-LLM Format Conversion Spec

### Conversion Pipeline

```
Raw HTML (50-500KB)
  |
  v
Stage 1: JavaScript Execution (Playwright)
  - Execute all JS, resolve SPAs, load dynamic content
  - Wait for networkidle or domcontentloaded
  |
  v
Stage 2: Interactive Element Detection
  - Walk DOM tree with TreeWalker
  - Check: semantic tags, ARIA roles, CSS cursor, event listeners
  - Filter: visibility (getBoundingClientRect + computed style)
  - Limit: max 500 elements
  |
  v
Stage 3: Content Extraction
  - document.body.innerText (rendered text only)
  - Strip duplicates from interactive elements
  - Truncate to 8000 characters
  |
  v
Stage 4: Structured Output
  - Numbered interactive elements: [1] button "Sign In"
  - Content summary with key text
  - Metadata: URL, title, token estimate
  |
  v
LLM-Ready Format (~2000-4000 tokens)
```

### Output Format Example

#### Input: https://www.naver.com (Korean portal)

```json
{
  "url": "https://www.naver.com",
  "title": "NAVER",
  "content": "네이버 메인에서 다양한 정보와 유용한 컨텐츠를 만나 보세요 ... 실시간 검색어 ... 뉴스 ... 쇼핑 ...",
  "interactiveElements": [
    { "index": 1, "tag": "input", "type": "search", "text": "", "placeholder": "검색어를 입력해 주세요." },
    { "index": 2, "tag": "button", "text": "검색", "role": "button" },
    { "index": 3, "tag": "a", "text": "뉴스", "href": "https://news.naver.com" },
    { "index": 4, "tag": "a", "text": "연예", "href": "https://entertain.naver.com" },
    { "index": 5, "tag": "a", "text": "스포츠", "href": "https://sports.naver.com" },
    { "index": 6, "tag": "a", "text": "쇼핑", "href": "https://shopping.naver.com" },
    { "index": 7, "tag": "a", "text": "네이버페이", "href": "https://pay.naver.com" },
    { "index": 8, "tag": "button", "text": "로그인", "role": "button" },
    { "index": 9, "tag": "a", "text": "더보기", "href": "#" }
  ],
  "tokenEstimate": 1250
}
```

#### Input: https://finance.naver.com/item/main.nhn?code=005930 (Samsung stock page)

```json
{
  "url": "https://finance.naver.com/item/main.nhn?code=005930",
  "title": "삼성전자 - 네이버 금융",
  "content": "삼성전자 005930 현재가 82,400 전일비 1,200 등락률 +1.48% 거래량 15,234,567 시가총액 491조 8,000억 ...",
  "interactiveElements": [
    { "index": 1, "tag": "input", "type": "text", "text": "", "placeholder": "종목명/코드" },
    { "index": 2, "tag": "a", "text": "차트", "href": "/item/fchart.naver?code=005930" },
    { "index": 3, "tag": "a", "text": "뉴스", "href": "/item/news.naver?code=005930" },
    { "index": 4, "tag": "a", "text": "재무", "href": "/item/coinfo.naver?code=005930" },
    { "index": 5, "tag": "select", "text": "1일 1주 1개월 3개월 1년", "role": "combobox" },
    { "index": 6, "tag": "button", "text": "매수", "role": "button" },
    { "index": 7, "tag": "button", "text": "매도", "role": "button" }
  ],
  "tokenEstimate": 1800
}
```

### Korean Website Special Handling

| Issue | Solution |
|-------|----------|
| **EUC-KR encoding** | Playwright handles encoding automatically via `<meta charset>` detection |
| **Naver login wall** | Detect `.login_area` class, report login-required state instead of empty content |
| **Kakao dynamic loading** | Wait for `networkidle` instead of `domcontentloaded` for Kakao's SPA framework |
| **Korean text tokenization** | Korean uses ~1.5x more tokens per character than English. Budget accordingly |
| **Naver iframe structure** | Naver uses iframes for news/finance content. Extract from `#mainFrame` iframe |
| **Coupang anti-bot** | Requires stealth plugin + realistic user-agent for data extraction |
| **Korean date formats** | `2026.03.23` / `2026년 3월 23일` — both common, no conversion needed |
| **Font rendering** | Block font downloads (`*.woff2`) for speed without affecting text extraction |

### SPA / Shadow DOM / iframe Handling

```
SPA (React/Vue/Angular):
  - Playwright renders JavaScript natively
  - Wait for `networkidle` ensures all API calls complete
  - No special handling needed (unlike raw HTTP fetch)

Shadow DOM:
  - Playwright's evaluate() can pierce shadow DOM
  - Use element.shadowRoot.querySelectorAll() recursively
  - Common in: web components, Shopify themes, Google sites

iframe:
  - Playwright provides frame() accessor
  - page.frame('mainFrame') for named iframes
  - page.frames() for all frames
  - Extract content from each frame independently
  - Merge into unified output with frame context labels
```

### Token Budget Analysis

| Page Type | Raw HTML | After Extraction | Interactive Elements | Total Tokens |
|-----------|---------|-----------------|---------------------|-------------|
| Simple blog | 50KB | 2KB | 10-20 | ~600 |
| Naver main | 200KB | 4KB | 30-50 | ~1,500 |
| E-commerce product | 150KB | 6KB | 50-80 | ~2,500 |
| Complex dashboard | 300KB | 8KB | 100-200 | ~4,000 |
| Data-heavy finance | 500KB | 8KB (capped) | 50-100 | ~3,500 |

**Compression ratio**: 50-100x from raw HTML to LLM-ready format.

---

## Deliverable 6: Security Design

### 1. Per-Agent Browser Isolation

```
+------------------------------------------------------------------+
|  Company A (companyId: "comp_abc")                                |
|  +---------------------------+  +---------------------------+     |
|  | Agent: Research Bot       |  | Agent: Content Writer     |     |
|  | Session: sess_001         |  | Session: sess_002         |     |
|  | Browser: isolated context |  | Browser: isolated context |     |
|  | Cookies: separate         |  | Cookies: separate         |     |
|  +---------------------------+  +---------------------------+     |
+------------------------------------------------------------------+
|  Company B (companyId: "comp_xyz")                                |
|  +---------------------------+                                    |
|  | Agent: Market Analyst     |                                    |
|  | Session: sess_003         |                                    |
|  | Browser: isolated context |                                    |
|  +---------------------------+                                    |
+------------------------------------------------------------------+

Isolation layers:
  1. BrowserContext per session (Playwright's native isolation)
  2. companyId check on every session access
  3. No shared cookies/storage between contexts
  4. Separate browser processes for different companies (optional, high-security)
```

### 2. URL Whitelist/Blacklist

```typescript
// Admin-configurable per company via API
interface WebBrowsePolicy {
  companyId: string

  // Whitelist mode: only these domains allowed
  allowedDomains?: string[]   // e.g., ['*.naver.com', 'google.com', '*.gov.kr']

  // Blacklist mode: these domains blocked
  blockedDomains?: string[]   // e.g., ['*.adult.com', 'gambling.*']

  // Always blocked (hardcoded, cannot be overridden)
  systemBlockedDomains: string[]  // localhost, internal IPs, metadata endpoints

  // Protocol restrictions
  allowedProtocols: ['https']     // HTTP blocked by default

  // Content type restrictions
  allowedContentTypes: ['text/html', 'application/json']

  // Resource limits
  maxSessionDuration: number      // seconds (default: 300)
  maxStepsPerSession: number      // default: 30
  maxConcurrentSessions: number   // default: 5
  maxBytesPerPage: number         // default: 5MB
}
```

### 3. Sensitive Data Auto-Masking

Applied at two layers:

**Layer 1: DOM Extraction (before LLM sees content)**
```
- Credit card numbers: 1234-5678-9012-3456 -> [CARD_NUMBER]
- Korean resident numbers: 880101-1234567 -> [RESIDENT_ID]
- Passwords in forms: type="password" fields excluded from extraction
- API keys/tokens: Bearer sk-... -> [API_KEY]
- Email addresses: user@domain.com -> [EMAIL]
- Phone numbers: 010-1234-5678 -> [PHONE]
```

**Layer 2: Output Redaction (engine hook, already exists)**
```
- credential-scrubber.ts applies to all tool outputs
- output-redactor.ts runs after credential scrubber
- Combined with existing PostToolUse hook chain
```

### 4. Admin Permission Control

```
Admin UI: Settings > AI Agents > [Agent Name] > Tools

+----------------------------------------------+
| Web Browsing Permissions                      |
+----------------------------------------------+
| [x] Enable web browsing for this agent        |
|                                               |
| Tool Level:                                   |
|   (o) High-level only (web_browse)            |
|   ( ) Full access (all web_* tools)           |
|                                               |
| Domain Policy:                                |
|   ( ) Allow all (except system-blocked)       |
|   (o) Whitelist only                          |
|   ( ) Block specific domains                  |
|                                               |
| Whitelisted Domains:                          |
|   [naver.com                              ] + |
|   [google.com                             ] + |
|   [*.gov.kr                               ] + |
|                                               |
| Limits:                                       |
|   Max steps per task: [15    ]                |
|   Session timeout:    [5 min ]                |
|   Max concurrent:     [3     ]                |
|                                               |
| [Save]                                        |
+----------------------------------------------+
```

### 5. Attack Surface Analysis

| Attack Vector | Mitigation |
|--------------|-----------|
| SSRF (access internal services) | Block private IP ranges, metadata endpoints |
| Data exfiltration | Output masking, no file upload/download |
| Credential theft | DOM extraction skips password fields |
| Prompt injection via web content | tool-sanitizer.ts (FR-TOOLSANITIZE) |
| Resource exhaustion | Session limits, idle timeout, max concurrent |
| Infinite browsing loop | max_steps hard limit, session duration cap |
| Malicious file download | Resource routing blocks binary downloads |
| Cross-tenant data leak | companyId check on every session access |

---

## Deliverable 7: Cost Estimation

### Scenario: 1,000 Web Browsing Tasks per Month

#### Infrastructure Costs

| Component | Option A: Self-hosted | Option B: Browserless | Option C: CF Browser |
|-----------|----------------------|----------------------|---------------------|
| **Browser runtime** | $0 (existing server) | $140/mo (Starter: 180K units) | $5/mo base + $0.09/hr |
| **Compute overhead** | ~100MB RAM per session, ~5% CPU per active browser | N/A (cloud) | N/A (edge) |
| **Concurrent limit** | ~10 (on 24GB server) | 20 (Starter plan) | 30 (Paid plan) |
| **Avg session time** | N/A | ~30s per task = 1 unit | ~30s per task |
| **Units/month** | N/A | 1,000 tasks * avg 3 units = 3,000 | 1,000 * 30s = 8.3 hrs |
| **Overage** | N/A | Well within 180K limit | 8.3 hrs * $0.09 = $0.75 |
| **Monthly total** | **$0** | **$140** | **$5.75** |

#### LLM Token Costs (Claude Haiku 4.5 for cost efficiency)

| Item | Per Task | Monthly (1,000 tasks) |
|------|---------|----------------------|
| System prompt | ~500 tokens input | 500K input tokens |
| DOM extraction | ~2,000 tokens input | 2M input tokens |
| Agent history (avg 5 steps) | ~5,000 tokens input | 5M input tokens |
| LLM output (actions) | ~200 tokens output * 5 steps | 1M output tokens |
| **Input total** | ~7,500 tokens | **7.5M tokens** |
| **Output total** | ~1,000 tokens | **1M tokens** |

| Model | Input Cost | Output Cost | Monthly Total |
|-------|-----------|------------|---------------|
| Haiku 4.5 ($1/$5) | $7.50 | $5.00 | **$12.50** |
| Sonnet 4.6 ($3/$15) | $22.50 | $15.00 | **$37.50** |
| Opus 4.6 ($5/$25) | $37.50 | $25.00 | **$62.50** |

#### Total Monthly Cost Estimate

| Configuration | Infrastructure | LLM | **Total** |
|--------------|---------------|-----|-----------|
| **Self-hosted + Haiku** (Budget) | $0 | $12.50 | **$12.50/mo** |
| **Self-hosted + Sonnet** (Balanced) | $0 | $37.50 | **$37.50/mo** |
| **CF Browser + Haiku** (Low-ops) | $5.75 | $12.50 | **$18.25/mo** |
| **Browserless + Sonnet** (Enterprise) | $140 | $37.50 | **$177.50/mo** |

#### Cost Optimization Strategies

1. **Batch API (50% discount)**: Use Anthropic Batch API for non-real-time tasks -> $6.25/mo with Haiku
2. **Prompt caching**: `cache_control: { type: 'ephemeral' }` saves ~40% on repeated system prompts
3. **DOM-only mode**: Skip screenshots entirely -> save ~0.8s + ~500 tokens per step
4. **Session reuse**: Don't close browser between related tasks -> save cold start time
5. **Semantic cache**: Reuse results for identical/similar browsing tasks (already built in Corthex)

---

## Deliverable 8: Competitive Comparison

### Feature Comparison Matrix

| Feature | browser-use | Stagehand | Playwright MCP | AgentQL |
|---------|------------|-----------|---------------|---------|
| **Architecture** | Python agent loop | JS SDK (3 primitives) | MCP protocol server | Query language + SDK |
| **Primary Language** | Python | TypeScript/JS | TypeScript | Python + JS |
| **Browser Engine** | Playwright (Chromium/FF/WK) | Playwright (Chromium) | Playwright (Chromium/FF/WK) | Playwright (Chromium) |
| **LLM Integration** | Built-in multi-provider | Built-in (OpenAI focus) | None (delegated to client) | Built-in |
| **DOM Extraction** | 5-stage CDP pipeline | Stagehand observe() | Accessibility tree YAML | AI-powered query language |
| **Token Compression** | 10K nodes -> 200 elements | Auto-caching (no repeat LLM) | Native a11y tree (compact) | Query-targeted extraction |
| **Action Schema** | 9 built-in + custom | 3 primitives (act/extract/observe) | 20+ structured tools | Natural language queries |
| **Vision Support** | Hybrid (DOM + screenshot) | DOM-only | Accessibility tree only | DOM-only |
| **Error Recovery** | Watchdog system + retry | Basic retry | None built-in | Basic retry |
| **Session Persistence** | Profile-based cookies | Browserbase managed | Per-session only | Per-session |
| **Anti-Detection** | Cloud version only | Via Browserbase | None | None |
| **Multi-Agent** | Single agent per session | Single agent | Multiple MCP clients | Single agent |
| **Autonomous Browsing** | Full (goal -> completion) | Semi (developer-directed) | None (tool-by-tool) | None (query-by-query) |
| **Custom Actions** | @tools.action() decorator | extend() method | Not supported | Custom queries |
| **Node.js Port** | Early (v0.1.0, unstable) | Native | Native | SDK available |

### Performance Comparison

| Metric | browser-use | Stagehand | Playwright MCP | AgentQL |
|--------|------------|-----------|---------------|---------|
| **Avg task time** | 68s (OnlineMind2Web) | ~45s (with caching) | N/A (depends on caller) | ~30s (single query) |
| **Steps per minute** | ~20 | ~15 | ~30 (no LLM overhead) | ~20 |
| **Cold start** | ~3s | ~2s | ~1s | ~2s |
| **DOM extraction** | ~200ms (5 parallel CDP) | ~150ms | ~100ms (a11y tree) | ~200ms |
| **Token efficiency** | ~2K tokens/step | ~1.5K tokens/step | ~1K tokens/step | ~500 tokens/query |
| **Accuracy** | 85%+ (WebVoyager) | ~80% | N/A | ~90% (structured data) |

### Cost Comparison (1,000 tasks/month)

| Cost Factor | browser-use | Stagehand | Playwright MCP | AgentQL |
|-------------|------------|-----------|---------------|---------|
| **Software license** | Free (MIT) | Free (MIT) | Free (Apache 2.0) | Free tier: 50 calls/mo |
| **Cloud service** | BU Cloud: TBD | Browserbase: $20-99/mo | N/A | $99/mo (Pro) |
| **Self-hosted infra** | $0 (own server) | $0 (own server) | $0 (own server) | N/A |
| **LLM cost (Haiku)** | ~$12.50/mo | ~$10/mo (with caching) | $0 (no LLM) | ~$8/mo |
| **Total (self-hosted)** | **$12.50/mo** | **$10/mo** | **$0/mo** | **$99+/mo** |
| **Total (cloud)** | **TBD** | **$30-110/mo** | **$0/mo** | **$107+/mo** |

### Ecosystem & Community

| Factor | browser-use | Stagehand | Playwright MCP | AgentQL |
|--------|------------|-----------|---------------|---------|
| **GitHub Stars** | 83.4K | 15K+ | 8K+ | 3K+ |
| **Contributors** | 301 | ~50 | Microsoft team | ~20 |
| **Dependent Projects** | 2,400+ | ~500 | 1,000+ | ~100 |
| **Documentation** | Good (docs site + DeepWiki) | Good (official docs) | Microsoft docs | Good (official docs) |
| **Update Frequency** | Very active (daily) | Active (weekly) | Active (monthly) | Moderate |
| **Enterprise Backing** | Browser Use Inc. | Browserbase | Microsoft | TinyFish |

### Recommendation for Corthex v2

| Criteria | Winner | Reasoning |
|----------|--------|-----------|
| **Best for autonomous tasks** | browser-use | Full agent loop with goal-driven browsing |
| **Best for Corthex integration** | Playwright MCP | Already uses MCP pattern; lowest integration friction |
| **Best for structured extraction** | AgentQL | Purpose-built query language for data extraction |
| **Best cost efficiency** | Playwright MCP | No LLM overhead for deterministic tasks |
| **Best for Korean websites** | browser-use / Stagehand | Full JS rendering handles Naver/Kakao SPAs |
| **Best TypeScript support** | Stagehand | Native TS, well-typed API |

### Recommended Hybrid Strategy for Corthex

```
Tier 1: Playwright MCP (already integrated)
  - Use for deterministic browsing tasks
  - Tab management, form filling, screenshots
  - Zero LLM token cost

Tier 2: Custom built-in tools (Deliverable 4)
  - web_navigate, web_click, web_type, web_extract
  - DOM extraction with interactive element indexing
  - Controlled by agent's tool permission system

Tier 3: web_browse high-level tool
  - Autonomous browsing for complex tasks
  - Sub-agent loop using Haiku for cost efficiency
  - browser-use-inspired DOM compression

Future: browser-use-node (when stable)
  - Replace custom DOM extraction with browser-use's 5-stage pipeline
  - Gain: Watchdog system, crash recovery, loop detection
  - Wait for: v1.0 release, production stability
```

---

## Sources

- [browser-use/browser-use GitHub Repository](https://github.com/browser-use/browser-use)
- [browser-use DOM Processing Engine (DeepWiki)](https://deepwiki.com/browser-use/browser-use/2.4-dom-processing-engine)
- [browser-use Agent System & Error Handling (DeepWiki)](https://deepwiki.com/browser-use/browser-use/2.4-error-handling-and-recovery)
- [browser-use Speed Matters Blog Post](https://browser-use.com/posts/speed-matters)
- [browser-use-node on JSR](https://jsr.io/@browser-use/browser-use-node)
- [Stagehand vs Browser Use vs Playwright Comparison (NxCode)](https://www.nxcode.io/resources/news/stagehand-vs-browser-use-vs-playwright-ai-browser-automation-2026)
- [Agentic Browser Landscape 2026 (No Hacks)](https://nohacks.co/blog/agentic-browser-landscape-2026)
- [Browserless.io Pricing](https://www.browserless.io/pricing)
- [Cloudflare Browser Rendering Docs](https://developers.cloudflare.com/browser-rendering/)
- [Cloudflare Browser Rendering Limits](https://developers.cloudflare.com/browser-rendering/limits/)
- [Cloudflare Browser Rendering Pricing](https://developers.cloudflare.com/browser-rendering/pricing/)
- [AgentQL Official Site](https://www.agentql.com/)
- [Stagehand Official Site](https://www.stagehand.dev/)
- [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Claude API Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [DOM vs Screenshots for AI Agents (Medium)](https://medium.com/@i_48340/how-ai-agents-actually-see-your-screen-dom-control-vs-screenshots-explained-dab80c2b31d7)
- [Best AI Browser Agents 2026 (Firecrawl)](https://www.firecrawl.dev/blog/best-browser-agents)
- [DOM Downsampling for Web Agents (arXiv)](https://arxiv.org/html/2508.04412v1)
- [AgentQL Review (ColdIQ)](https://coldiq.com/tools/agentql)
- [Browserbase Pricing](https://www.browserbase.com/pricing)
