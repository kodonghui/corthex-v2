# Claude Agent SDK (TypeScript) -- Comprehensive API Reference

**Package:** `@anthropic-ai/claude-agent-sdk@0.2.72`
**Peer deps:** `zod@^4.0.0`
**Entry:** `sdk.mjs` (types: `sdk.d.ts`)
**Embed entry:** `embed.js` (for Bun compile: embeds cli.js into binary)
**claudeCodeVersion:** `2.1.72`

---

## 1. Main API Surface

### 1.1 `query()` -- Primary Function

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

function query(params: {
  prompt: string | AsyncIterable<SDKUserMessage>;
  options?: Options;
}): Query;
```

Returns a `Query` object that extends `AsyncGenerator<SDKMessage, void>` with control methods.

**Basic usage:**
```typescript
for await (const message of query({
  prompt: "Find and fix the bug in auth.py",
  options: { allowedTools: ["Read", "Edit", "Bash"] }
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
    console.log(`Cost: $${message.total_cost_usd}`);
  }
}
```

**Streaming input (multi-turn, required for SDK MCP servers):**
```typescript
async function* generateMessages() {
  yield {
    type: "user" as const,
    message: { role: "user" as const, content: "What files are here?" },
    parent_tool_use_id: null,
    session_id: ""  // filled automatically
  };
}

const q = query({ prompt: generateMessages(), options: { ... } });
for await (const msg of q) { /* ... */ }
```

### 1.2 Query Object Methods

```typescript
interface Query extends AsyncGenerator<SDKMessage, void> {
  // Control
  interrupt(): Promise<void>;
  close(): void;

  // Runtime configuration changes
  setPermissionMode(mode: PermissionMode): Promise<void>;
  setModel(model?: string): Promise<void>;
  setMaxThinkingTokens(maxThinkingTokens: number | null): Promise<void>;

  // Introspection
  initializationResult(): Promise<SDKControlInitializeResponse>;
  supportedCommands(): Promise<SlashCommand[]>;
  supportedModels(): Promise<ModelInfo[]>;
  supportedAgents(): Promise<AgentInfo[]>;
  accountInfo(): Promise<AccountInfo>;

  // MCP management
  mcpServerStatus(): Promise<McpServerStatus[]>;
  setMcpServers(servers: Record<string, McpServerConfig>): Promise<McpSetServersResult>;
  reconnectMcpServer(serverName: string): Promise<void>;
  toggleMcpServer(serverName: string, enabled: boolean): Promise<void>;

  // File checkpointing
  rewindFiles(userMessageId: string, options?: { dryRun?: boolean }): Promise<RewindFilesResult>;

  // Streaming input
  streamInput(stream: AsyncIterable<SDKUserMessage>): Promise<void>;

  // Background tasks
  stopTask(taskId: string): Promise<void>;
}
```

### 1.3 V2 API (unstable/alpha)

```typescript
// Multi-turn session
const session: SDKSession = unstable_v2_createSession({
  model: "claude-sonnet-4-6",
  allowedTools: ["Read", "Edit", "Bash"]
});

await session.send("Read auth.py");
for await (const msg of session.stream()) {
  console.log(msg);
}

await session.send("Now fix the bug");
for await (const msg of session.stream()) {
  console.log(msg);
}

session.close();

// One-shot convenience
const result = await unstable_v2_prompt("What files are here?", {
  model: "claude-sonnet-4-6"
});

// Resume existing session
const resumed = unstable_v2_resumeSession(sessionId, { model: "claude-sonnet-4-6" });
```

### 1.4 Session Management

```typescript
// List sessions
const sessions: SDKSessionInfo[] = await listSessions({ dir: "/path/to/project", limit: 10 });

// Read session messages
const messages: SessionMessage[] = await getSessionMessages(sessionId, {
  dir: "/path/to/project",
  limit: 50,
  offset: 0
});
```

**Resume a session:**
```typescript
let sessionId: string;
for await (const msg of query({ prompt: "Analyze auth module", options: {} })) {
  if (msg.type === "system" && msg.subtype === "init") sessionId = msg.session_id;
}

// Resume
for await (const msg of query({
  prompt: "Now find callers",
  options: { resume: sessionId }
})) { /* ... */ }

// Fork session (new session ID, same history)
for await (const msg of query({
  prompt: "Try a different approach",
  options: { resume: sessionId, forkSession: true }
})) { /* ... */ }
```

---

## 2. Authentication / Custom Anthropic Client

The SDK does NOT accept a custom Anthropic client object directly. Authentication is via environment variables passed to the child process:

### 2.1 API Key (Direct Anthropic)
```typescript
for await (const msg of query({
  prompt: "...",
  options: {
    env: {
      ANTHROPIC_API_KEY: "sk-ant-...",
      // Optional: identify your app in User-Agent
      CLAUDE_AGENT_SDK_CLIENT_APP: "my-app/1.0.0"
    }
  }
})) { /* ... */ }
```

### 2.2 Amazon Bedrock
```typescript
options: {
  env: {
    CLAUDE_CODE_USE_BEDROCK: "1",
    AWS_ACCESS_KEY_ID: "...",
    AWS_SECRET_ACCESS_KEY: "...",
    AWS_REGION: "us-east-1"
  }
}
```

### 2.3 Google Vertex AI
```typescript
options: {
  env: {
    CLAUDE_CODE_USE_VERTEX: "1",
    GOOGLE_APPLICATION_CREDENTIALS: "/path/to/creds.json"
  }
}
```

### 2.4 Microsoft Azure AI Foundry
```typescript
options: {
  env: {
    CLAUDE_CODE_USE_FOUNDRY: "1"
    // + Azure credential env vars
  }
}
```

### 2.5 API Key Helper Script (for dynamic/rotating keys)
```typescript
options: {
  settings: {
    apiKeyHelper: "/path/to/script.sh"  // script stdout = credentials
  }
}
```

### 2.6 Claude.ai Subscription (CLI token -- CORTHEX use case)

The SDK spawns a CLI subprocess that uses its own auth. For Claude Max subscription:
- The user must be logged in via `claude login`
- The session inherits the logged-in user's subscription token
- AccountInfo shows `tokenSource` and `apiKeySource`

```typescript
const q = query({ prompt: "...", options: {} });
const initResult = await q.initializationResult();
console.log(initResult.account);
// { email: "user@example.com", subscriptionType: "max", tokenSource: "claudeai" }
```

**Important CORTHEX note:** There is no way to inject a raw Anthropic SDK client. The Agent SDK always spawns a CLI subprocess. Authentication flows through env vars or the CLI's own login state.

### 2.7 Custom Process Spawning (VMs, containers, remote)
```typescript
options: {
  spawnClaudeCodeProcess: (opts: SpawnOptions) => {
    // opts: { command, args, cwd, env, signal }
    // Return object satisfying SpawnedProcess interface
    return myCustomProcess;
  }
}
```

---

## 3. Custom Tools (SDK MCP Servers)

### 3.1 `tool()` Helper

```typescript
import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

function tool<Schema extends AnyZodRawShape>(
  name: string,
  description: string,
  inputSchema: Schema,            // Zod v3 or v4 shape
  handler: (args: InferShape<Schema>, extra: unknown) => Promise<CallToolResult>,
  extras?: { annotations?: ToolAnnotations }
): SdkMcpToolDefinition<Schema>;
```

### 3.2 `createSdkMcpServer()`

```typescript
function createSdkMcpServer(options: {
  name: string;
  version?: string;
  tools?: Array<SdkMcpToolDefinition<any>>;
}): McpSdkServerConfigWithInstance;
// Returns { type: "sdk", name: string, instance: McpServer }
```

### 3.3 Complete Custom Tool Example

```typescript
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const server = createSdkMcpServer({
  name: "corthex-tools",
  version: "1.0.0",
  tools: [
    tool(
      "get_org_structure",
      "Get current organization structure (departments, staff, agents)",
      {
        departmentId: z.string().optional().describe("Filter by department ID"),
        includeAgents: z.boolean().default(true).describe("Include AI agents")
      },
      async (args) => {
        const data = await db.query("SELECT ...", [args.departmentId]);
        return {
          content: [{ type: "text", text: JSON.stringify(data) }]
        };
      },
      { annotations: { readOnly: true } }
    ),

    tool(
      "execute_agent_task",
      "Delegate a task to an AI agent in the organization",
      {
        agentId: z.string().describe("Target agent ID"),
        task: z.string().describe("Task description"),
        priority: z.enum(["low", "normal", "high"]).default("normal")
      },
      async (args) => {
        const result = await agentEngine.dispatch(args);
        return {
          content: [{ type: "text", text: `Task dispatched: ${result.taskId}` }]
        };
      },
      { annotations: { destructive: false, openWorld: true } }
    )
  ]
});

// Use with streaming input (REQUIRED for SDK MCP servers)
async function* messages() {
  yield {
    type: "user" as const,
    message: { role: "user" as const, content: "Show me the org structure" },
    parent_tool_use_id: null,
    session_id: ""
  };
}

for await (const msg of query({
  prompt: messages(),
  options: {
    mcpServers: { "corthex-tools": server },
    allowedTools: ["mcp__corthex-tools__*"],
    maxTurns: 5
  }
})) {
  if (msg.type === "result" && msg.subtype === "success") {
    console.log(msg.result);
  }
}
```

**Tool naming convention:** `mcp__{server-name}__{tool-name}`

---

## 4. Hook System

### 4.1 All Hook Events (21 total)

| Hook Event | Description |
|---|---|
| `PreToolUse` | Before tool executes (can block/modify/allow) |
| `PostToolUse` | After tool executes (can add context) |
| `PostToolUseFailure` | After tool fails |
| `Stop` | Agent execution stopping |
| `SessionStart` | Session initialization |
| `SessionEnd` | Session termination |
| `UserPromptSubmit` | User prompt submitted |
| `SubagentStart` | Subagent initialized |
| `SubagentStop` | Subagent completed |
| `PreCompact` | Before conversation compaction |
| `PermissionRequest` | Permission dialog would show |
| `Notification` | Agent status message |
| `Setup` | Session setup/maintenance |
| `TeammateIdle` | Teammate becomes idle |
| `TaskCompleted` | Background task completes |
| `Elicitation` | MCP server requests user input |
| `ElicitationResult` | Elicitation result |
| `ConfigChange` | Config file changed |
| `WorktreeCreate` | Git worktree created |
| `WorktreeRemove` | Git worktree removed |
| `InstructionsLoaded` | CLAUDE.md or memory file loaded |

### 4.2 Hook Configuration

```typescript
type HookCallback = (
  input: HookInput,
  toolUseID: string | undefined,
  options: { signal: AbortSignal }
) => Promise<HookJSONOutput>;

interface HookCallbackMatcher {
  matcher?: string;       // regex pattern (matches tool name for tool hooks)
  hooks: HookCallback[];
  timeout?: number;       // seconds, default 60
}

// In options:
options: {
  hooks: {
    PreToolUse: [
      { matcher: "Bash|Edit|Write", hooks: [myPreHook], timeout: 30 },
      { hooks: [globalLogger] }  // no matcher = matches all
    ],
    PostToolUse: [
      { matcher: "^mcp__", hooks: [mcpAuditHook] }
    ],
    Stop: [{ hooks: [saveState] }]
  }
}
```

### 4.3 PreToolUse Hook (block/allow/modify)

```typescript
import { HookCallback, PreToolUseHookInput } from "@anthropic-ai/claude-agent-sdk";

const guardHook: HookCallback = async (input, toolUseID, { signal }) => {
  const pre = input as PreToolUseHookInput;
  // pre.tool_name, pre.tool_input, pre.tool_use_id, pre.session_id, pre.cwd

  const toolInput = pre.tool_input as Record<string, unknown>;

  // DENY
  if (toolInput?.command?.toString().includes("rm -rf")) {
    return {
      systemMessage: "Destructive commands are blocked.",
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Destructive command blocked"
      }
    };
  }

  // ALLOW with modified input
  if (pre.tool_name === "Write") {
    return {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "allow",
        updatedInput: { ...toolInput, file_path: `/sandbox${toolInput.file_path}` }
      }
    };
  }

  // ALLOW as-is (auto-approve)
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      permissionDecisionReason: "Auto-approved"
    }
  };

  // Or return {} to not interfere (default behavior)
};
```

### 4.4 PostToolUse Hook (add context)

```typescript
const postHook: HookCallback = async (input, toolUseID, { signal }) => {
  const post = input as PostToolUseHookInput;
  // post.tool_name, post.tool_input, post.tool_response, post.tool_use_id

  await appendFile("audit.log", `${post.tool_name}: ${JSON.stringify(post.tool_input)}\n`);

  return {
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: "Logged to audit trail."
    }
  };
};
```

### 4.5 Stop Hook

```typescript
const stopHook: HookCallback = async (input, toolUseID, { signal }) => {
  const stop = input as StopHookInput;
  // stop.stop_hook_active, stop.last_assistant_message

  // Optionally continue execution
  return { continue: true, systemMessage: "Please also run the tests." };

  // Or let it stop
  return {};
};
```

### 4.6 PermissionRequest Hook

```typescript
const permHook: HookCallback = async (input, toolUseID, { signal }) => {
  const req = input as PermissionRequestHookInput;
  // req.tool_name, req.tool_input, req.permission_suggestions

  return {
    hookSpecificOutput: {
      hookEventName: "PermissionRequest",
      decision: { behavior: "allow" }
      // or: { behavior: "deny", message: "Not allowed", interrupt: true }
    }
  };
};
```

### 4.7 Async Hook (fire-and-forget)

```typescript
const asyncHook: HookCallback = async (input, toolUseID, { signal }) => {
  sendToLoggingService(input).catch(console.error);
  return { async: true, asyncTimeout: 30000 };
};
```

---

## 5. Cost/Token Tracking

### 5.1 Result Message (per-query totals)

```typescript
for await (const msg of query({ prompt: "...", options })) {
  if (msg.type === "result") {
    // Available on both success and error results:
    console.log(msg.total_cost_usd);    // Total cost in USD
    console.log(msg.duration_ms);       // Wall clock time
    console.log(msg.duration_api_ms);   // API time only
    console.log(msg.num_turns);         // Number of turns
    console.log(msg.usage);             // Aggregate token usage
    // usage: { input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens }

    console.log(msg.modelUsage);        // Per-model breakdown
    // Record<string, ModelUsage>
    // ModelUsage: { inputTokens, outputTokens, cacheReadInputTokens, cacheCreationInputTokens,
    //              webSearchRequests, costUSD, contextWindow, maxOutputTokens }
  }
}
```

### 5.2 Rate Limit Events

```typescript
if (msg.type === "rate_limit_event") {
  const info = msg.rate_limit_info;
  // info.status: "allowed" | "allowed_warning" | "rejected"
  // info.resetsAt: timestamp
  // info.utilization: 0-1
  // info.isUsingOverage: boolean
  // info.surpassedThreshold: number
}
```

### 5.3 Task/Subagent Usage

```typescript
if (msg.type === "system" && msg.subtype === "task_notification") {
  // msg.usage: { total_tokens, tool_uses, duration_ms }
}
if (msg.type === "system" && msg.subtype === "task_progress") {
  // msg.usage: { total_tokens, tool_uses, duration_ms }
}
```

### 5.4 Budget Limit

```typescript
options: {
  maxBudgetUsd: 5.00  // Stop if exceeded, returns error_max_budget_usd result
}
```

---

## 6. Subagent Support

### 6.1 Define Custom Subagents

```typescript
type AgentDefinition = {
  description: string;                           // When to use this agent
  prompt: string;                                // System prompt
  tools?: string[];                              // Allowed tools (omit = inherit all)
  disallowedTools?: string[];                    // Explicitly blocked tools
  model?: "sonnet" | "opus" | "haiku" | "inherit";  // Model override
  mcpServers?: AgentMcpServerSpec[];             // Agent-specific MCP servers
  skills?: string[];                             // Preloaded skills
  maxTurns?: number;                             // Max agentic turns
  criticalSystemReminder_EXPERIMENTAL?: string;  // Critical reminder in system prompt
};
```

```typescript
for await (const msg of query({
  prompt: "Review the auth module for security",
  options: {
    allowedTools: ["Read", "Grep", "Glob", "Agent"],  // Agent tool REQUIRED
    agents: {
      "security-reviewer": {
        description: "Security specialist for code review",
        prompt: "You are a security code reviewer. Find vulnerabilities...",
        tools: ["Read", "Grep", "Glob"],  // Read-only
        model: "opus"
      },
      "test-runner": {
        description: "Runs and analyzes test suites",
        prompt: "Run tests and analyze results...",
        tools: ["Bash", "Read", "Grep"]
      }
    }
  }
})) { /* ... */ }
```

### 6.2 Use Main Thread as Named Agent

```typescript
options: {
  agent: "code-reviewer",  // Main thread uses this agent's prompt/tools/model
  agents: {
    "code-reviewer": {
      description: "...",
      prompt: "...",
      tools: ["Read", "Grep"]
    }
  }
}
```

### 6.3 Detect Subagent Messages

```typescript
// Messages from within subagent have parent_tool_use_id set
if (msg.type === "assistant" && msg.parent_tool_use_id) {
  console.log("Inside subagent");
}

// Detect Agent tool invocation
for (const block of msg.message?.content ?? []) {
  if (block.type === "tool_use" && block.name === "Agent") {
    console.log("Subagent invoked:", block.input.subagent_type);
  }
}
```

### 6.4 Background Tasks & Progress

```typescript
// Task started (async subagent)
if (msg.type === "system" && msg.subtype === "task_started") {
  console.log(`Task ${msg.task_id}: ${msg.description}`);
}

// Progress updates (periodic)
if (msg.type === "system" && msg.subtype === "task_progress") {
  console.log(`Task ${msg.task_id}: ${msg.summary} (${msg.usage.total_tokens} tokens)`);
}

// Task completed
if (msg.type === "system" && msg.subtype === "task_notification") {
  console.log(`Task ${msg.task_id} ${msg.status}: ${msg.summary}`);
}

// Enable AI-generated progress summaries
options: { agentProgressSummaries: true }
```

---

## 7. MCP Server Connection

### 7.1 Stdio (local process)

```typescript
mcpServers: {
  github: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: { GITHUB_TOKEN: process.env.GITHUB_TOKEN }
  }
}
```

### 7.2 HTTP/SSE (remote)

```typescript
mcpServers: {
  "remote-api": {
    type: "http",     // or "sse" for streaming
    url: "https://api.example.com/mcp",
    headers: { Authorization: `Bearer ${token}` }
  }
}
```

### 7.3 SDK (in-process, see Section 3)

```typescript
mcpServers: {
  "my-tools": createSdkMcpServer({ name: "my-tools", tools: [...] })
}
```

### 7.4 Dynamic MCP Server Management

```typescript
const q = query({ prompt: messages(), options: { ... } });

// Add/replace servers at runtime
const result = await q.setMcpServers({
  newServer: { command: "node", args: ["server.js"] }
});
// result: { added: ["newServer"], removed: ["oldServer"], errors: {} }

// Check status
const statuses = await q.mcpServerStatus();
// statuses[0]: { name, status: "connected"|"failed"|"needs-auth"|"pending", tools: [...] }

// Reconnect failed server
await q.reconnectMcpServer("myServer");

// Enable/disable
await q.toggleMcpServer("myServer", false);
```

---

## 8. Options Reference (Complete)

```typescript
type Options = {
  // Identity
  cwd?: string;
  env?: Record<string, string | undefined>;
  executable?: "bun" | "deno" | "node";
  executableArgs?: string[];
  pathToClaudeCodeExecutable?: string;

  // Model
  model?: string;                          // e.g. "claude-sonnet-4-6"
  fallbackModel?: string;
  thinking?: ThinkingConfig;               // { type: "adaptive" } | { type: "enabled", budgetTokens } | { type: "disabled" }
  effort?: "low" | "medium" | "high" | "max";
  betas?: SdkBeta[];                       // ["context-1m-2025-08-07"]

  // Tools & Permissions
  tools?: string[] | { type: "preset"; preset: "claude_code" };
  allowedTools?: string[];
  disallowedTools?: string[];
  permissionMode?: "default" | "acceptEdits" | "bypassPermissions" | "plan" | "dontAsk";
  allowDangerouslySkipPermissions?: boolean;
  canUseTool?: CanUseTool;
  permissionPromptToolName?: string;

  // Agents
  agent?: string;                          // Main thread agent name
  agents?: Record<string, AgentDefinition>;
  agentProgressSummaries?: boolean;

  // MCP
  mcpServers?: Record<string, McpServerConfig>;
  strictMcpConfig?: boolean;

  // Hooks
  hooks?: Partial<Record<HookEvent, HookCallbackMatcher[]>>;
  onElicitation?: OnElicitation;

  // Session
  resume?: string;                         // Session ID to resume
  continue?: boolean;                      // Continue most recent session
  sessionId?: string;                      // Custom session ID (UUID)
  resumeSessionAt?: string;                // Resume to specific message UUID
  forkSession?: boolean;
  persistSession?: boolean;                // Default true

  // Output
  systemPrompt?: string | { type: "preset"; preset: "claude_code"; append?: string };
  outputFormat?: { type: "json_schema"; schema: Record<string, unknown> };
  includePartialMessages?: boolean;
  promptSuggestions?: boolean;

  // Limits
  maxTurns?: number;
  maxBudgetUsd?: number;

  // Settings
  settings?: string | Settings;
  settingSources?: SettingSource[];        // ["user", "project", "local"]
  additionalDirectories?: string[];

  // File tracking
  enableFileCheckpointing?: boolean;

  // Sandbox
  sandbox?: SandboxSettings;

  // Debug
  debug?: boolean;
  debugFile?: string;
  stderr?: (data: string) => void;

  // Advanced
  spawnClaudeCodeProcess?: (opts: SpawnOptions) => SpawnedProcess;
  plugins?: SdkPluginConfig[];
  toolConfig?: ToolConfig;
  extraArgs?: Record<string, string | null>;
};
```

---

## 9. Message Types (SDKMessage union)

| Type | Subtype | Key Fields |
|---|---|---|
| `system` | `init` | `tools`, `mcp_servers`, `model`, `permissionMode`, `claude_code_version` |
| `system` | `status` | `status: "compacting" \| null` |
| `system` | `compact_boundary` | `compact_metadata` |
| `system` | `task_started` | `task_id`, `description` |
| `system` | `task_progress` | `task_id`, `usage`, `summary` |
| `system` | `task_notification` | `task_id`, `status`, `summary`, `usage` |
| `system` | `hook_started/progress/response` | `hook_id`, `hook_event` |
| `system` | `files_persisted` | `files[]`, `failed[]` |
| `system` | `local_command_output` | `content` |
| `system` | `elicitation_complete` | `mcp_server_name`, `elicitation_id` |
| `assistant` | - | `message: BetaMessage`, `parent_tool_use_id`, `uuid` |
| `stream_event` | - | `event: BetaRawMessageStreamEvent` (when `includePartialMessages`) |
| `user` | - | `message: MessageParam`, `parent_tool_use_id` |
| `result` | `success` | `result`, `total_cost_usd`, `usage`, `modelUsage`, `structured_output` |
| `result` | `error_*` | `errors[]`, `total_cost_usd`, `usage` |
| `tool_progress` | - | `tool_use_id`, `tool_name`, `elapsed_time_seconds` |
| `tool_use_summary` | - | `summary`, `preceding_tool_use_ids[]` |
| `rate_limit_event` | - | `rate_limit_info` |
| `prompt_suggestion` | - | `suggestion` |
| `auth_status` | - | `isAuthenticating`, `output[]`, `error` |

---

## 10. Built-in Tool Names

From `sdk-tools.d.ts`:
- `Agent` (subagent invocation)
- `Bash`
- `TaskOutput` (read background task output)
- `ExitPlanMode`
- `Edit` (FileEdit)
- `Read` (FileRead)
- `Write` (FileWrite)
- `Glob`
- `Grep`
- `TaskStop`
- `ListMcpResources`, `ReadMcpResource`, `SubscribeMcpResource`, `UnsubscribeMcpResource`
- `SubscribePolling`, `UnsubscribePolling`
- `NotebookEdit`
- `TodoWrite`
- `WebFetch`
- `WebSearch`
- `AskUserQuestion`
- `Config`
- `EnterWorktree`, `ExitWorktree`
- MCP tools: `mcp__{server}__{tool}`

---

## 11. CORTHEX-Specific Notes

### CLI Token Pattern
The SDK spawns a subprocess that inherits auth from the environment. For CORTHEX's "CLI token" pattern:
1. Human staff logs in with `claude login` on the machine
2. The logged-in session token is available to the subprocess automatically
3. For programmatic use, set `ANTHROPIC_API_KEY` in the `env` option
4. There is NO `new Anthropic({ apiKey })` client injection -- it always goes through the CLI subprocess

### call_agent Pattern (from Product Brief)
The SDK's `agents` option is exactly the "call_agent tool" pattern from the brief:
- Define department-specific agents with `AgentDefinition`
- Each agent has its own tools, prompt, model
- Parent dispatches via the `Agent` tool
- No need to build custom orchestration -- the SDK handles it

### Token Propagation in Delegation Chain
When a parent agent invokes a subagent via the `Agent` tool:
- The subagent runs in the SAME CLI subprocess
- It inherits the same authentication (CLI token)
- No separate token management needed for the delegation chain

### Recommended Architecture
```
CORTHEX Server (Hono)
  |
  +-- query({ prompt: "...", options: {
  |     env: { ANTHROPIC_API_KEY: humanStaff.cliToken },
  |     agents: {
  |       "dept-manager": { prompt: managerSoul, tools: [...], model: "sonnet" },
  |       "worker-agent": { prompt: workerSoul, tools: [...], model: "haiku" }
  |     },
  |     mcpServers: {
  |       "corthex-api": createSdkMcpServer({ tools: [orgTools, taskTools] }),
  |       "nexus": { type: "http", url: "..." }
  |     }
  |   }
  |  })
```
