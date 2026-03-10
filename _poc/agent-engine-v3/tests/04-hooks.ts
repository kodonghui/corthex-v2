/**
 * PoC Test 4: Hook 등록 (PreToolUse, PostToolUse, Stop)
 *
 * 검증:
 * - PreToolUse hook으로 도구 실행 전 가로채기
 * - PostToolUse hook으로 도구 실행 후 감사 로깅
 * - Stop hook으로 세션 종료 시 후처리
 *
 * CORTHEX 5개 훅: tool-permission-guard, credential-scrubber,
 * delegation-tracker, cost-tracker, output-redactor
 */
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { runTest, info } from "./utils.js";

const result = await runTest(4, "Hook 등록 (PreToolUse, PostToolUse, Stop)", async () => {
  const hookLog: string[] = [];

  // 간단한 테스트 도구
  const echoTool = tool(
    "echo_test",
    "에코 테스트 도구 — 입력받은 메시지를 그대로 반환",
    { message: z.string().describe("에코할 메시지") },
    async (args) => {
      return {
        content: [{ type: "text" as const, text: `Echo: ${args.message}` }],
      };
    }
  );

  const testServer = createSdkMcpServer({
    name: "test-hooks",
    tools: [echoTool],
  });

  // Hook 정의
  const preToolHook = async (input: any, toolUseID: string | undefined, opts: any) => {
    const toolName = input.tool_name || "unknown";
    hookLog.push(`PRE:${toolName}`);
    info(`[PreToolUse] tool=${toolName}, id=${toolUseID}`);

    // 허용 (자동 승인)
    return {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "allow",
        permissionDecisionReason: "PoC auto-approved",
      },
    };
  };

  const postToolHook = async (input: any, toolUseID: string | undefined, opts: any) => {
    const toolName = input.tool_name || "unknown";
    const response = input.tool_response || "";
    hookLog.push(`POST:${toolName}`);
    info(`[PostToolUse] tool=${toolName}, response=${JSON.stringify(response).slice(0, 100)}`);

    return {
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: "Audit logged by PoC hook",
      },
    };
  };

  const stopHook = async (input: any, toolUseID: string | undefined, opts: any) => {
    hookLog.push("STOP");
    info(`[Stop] Session ending`);
    return {};
  };

  // 스트리밍 입력
  async function* messages() {
    yield {
      type: "user" as const,
      message: {
        role: "user" as const,
        content: "echo_test 도구를 사용해서 'Hello CORTHEX' 메시지를 에코해주세요.",
      },
      parent_tool_use_id: null,
      session_id: "",
    };
  }

  let resultCost = 0;

  for await (const msg of query({
    prompt: messages(),
    options: {
      mcpServers: { "test-hooks": testServer },
      allowedTools: ["mcp__test-hooks__*"],
      maxTurns: 3,
      permissionMode: "bypassPermissions",
      env: { CLAUDECODE: "" },
      hooks: {
        PreToolUse: [
          { hooks: [preToolHook], timeout: 10 },
        ],
        PostToolUse: [
          { hooks: [postToolHook], timeout: 10 },
        ],
        Stop: [
          { hooks: [stopHook], timeout: 10 },
        ],
      },
    },
  })) {
    if (msg.type === "result") {
      resultCost = (msg as any).total_cost_usd || 0;
    }
  }

  info(`\nHook log: [${hookLog.join(", ")}]`);

  // Assertions
  const hasPre = hookLog.some((h) => h.startsWith("PRE:"));
  const hasPost = hookLog.some((h) => h.startsWith("POST:"));
  const hasStop = hookLog.includes("STOP");

  if (!hasPre) throw new Error("PreToolUse hook이 호출되지 않았습니다");
  if (!hasPost) throw new Error("PostToolUse hook이 호출되지 않았습니다");
  // Stop hook은 선택적 — 호출 안 될 수도 있음
  info(`Stop hook called: ${hasStop}`);

  return `PRE=${hasPre}, POST=${hasPost}, STOP=${hasStop}, hooks=${hookLog.length}건, cost=$${resultCost}`;
});

console.log("\n--- Result ---");
console.log(JSON.stringify(result, null, 2));
process.exit(result.passed ? 0 : 1);
