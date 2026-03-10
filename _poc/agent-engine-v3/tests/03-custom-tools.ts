/**
 * PoC Test 3: 커스텀 도구 등록 (call_agent 시뮬레이션) [MUST-PASS]
 *
 * 검증:
 * - tool() + createSdkMcpServer()로 커스텀 도구 등록
 * - LLM이 커스텀 도구를 호출하는지 확인
 * - 도구 핸들러에서 응답 반환
 *
 * 이것이 CORTHEX call_agent 패턴의 핵심
 */
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { runTest, info } from "./utils.js";

const result = await runTest(3, "커스텀 도구 등록 (call_agent 시뮬레이션)", async () => {
  // call_agent 도구 시뮬레이션
  let callAgentInvoked = false;
  let callAgentArgs: any = null;

  const callAgentTool = tool(
    "call_agent",
    "다른 에이전트에게 업무를 위임합니다. 반드시 이 도구를 사용하여 에이전트에게 작업을 위임하세요.",
    {
      agentId: z.string().describe("위임할 에이전트 ID"),
      message: z.string().describe("업무 지시 내용"),
    },
    async (args) => {
      callAgentInvoked = true;
      callAgentArgs = args;
      info(`call_agent 호출됨! agentId=${args.agentId}, message=${args.message}`);

      // 시뮬레이션 응답
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              success: true,
              agentId: args.agentId,
              result: `에이전트 ${args.agentId}가 "${args.message}" 작업을 완료했습니다.`,
            }),
          },
        ],
      };
    }
  );

  // 조직 정보 조회 도구 (읽기 전용)
  let getOrgInvoked = false;

  const getOrgTool = tool(
    "get_org_structure",
    "조직 구조를 조회합니다 (부서, 직원, AI 에이전트 목록)",
    {
      departmentId: z.string().optional().describe("부서 ID (없으면 전체)"),
    },
    async (args) => {
      getOrgInvoked = true;
      info(`get_org_structure 호출됨! dept=${args.departmentId || "전체"}`);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              departments: [
                { id: "dev", name: "개발팀", agents: ["agent-dev-1", "agent-dev-2"] },
                { id: "marketing", name: "마케팅팀", agents: ["agent-mkt-1"] },
              ],
            }),
          },
        ],
      };
    },
    { annotations: { readOnly: true } }
  );

  // SDK MCP 서버 생성
  const corthexServer = createSdkMcpServer({
    name: "corthex-tools",
    version: "1.0.0",
    tools: [callAgentTool, getOrgTool],
  });

  info("MCP 서버 생성 완료: corthex-tools (call_agent + get_org_structure)");

  // 스트리밍 입력 (SDK MCP 서버 사용 시 필수)
  async function* messages() {
    yield {
      type: "user" as const,
      message: {
        role: "user" as const,
        content:
          "조직 구조를 먼저 확인한 다음, 개발팀의 agent-dev-1에게 '코드 리뷰 해줘'라고 업무를 위임해주세요. 반드시 call_agent 도구와 get_org_structure 도구를 사용하세요.",
      },
      parent_tool_use_id: null,
      session_id: "",
    };
  }

  let messageTypes: string[] = [];
  let toolCalls: string[] = [];
  let resultCost = 0;

  for await (const msg of query({
    prompt: messages(),
    options: {
      mcpServers: { "corthex-tools": corthexServer },
      allowedTools: ["mcp__corthex-tools__*"],
      maxTurns: 5,
      permissionMode: "bypassPermissions",
      env: { CLAUDECODE: "" },
    },
  })) {
    const msgType = `${msg.type}${msg.subtype ? `:${msg.subtype}` : ""}`;
    messageTypes.push(msgType);

    if (msg.type === "assistant") {
      const content = (msg as any).message?.content;
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === "tool_use") {
            toolCalls.push(block.name);
            info(`Tool call: ${block.name}(${JSON.stringify(block.input)})`);
          }
          if (block.type === "text" && block.text) {
            info(`Assistant: ${block.text.slice(0, 200)}`);
          }
        }
      }
    }

    if (msg.type === "result") {
      resultCost = (msg as any).total_cost_usd || 0;
      info(`Result: ${msg.subtype}, cost=$${resultCost}`);
    }
  }

  info(`\nMessage types: [${messageTypes.join(", ")}]`);
  info(`Tool calls: [${toolCalls.join(", ")}]`);
  info(`call_agent invoked: ${callAgentInvoked}`);
  info(`get_org_structure invoked: ${getOrgInvoked}`);

  // Assertions
  if (!callAgentInvoked) throw new Error("call_agent 도구가 호출되지 않았습니다!");
  if (!getOrgInvoked) throw new Error("get_org_structure 도구가 호출되지 않았습니다!");
  if (!callAgentArgs?.agentId) throw new Error("call_agent에 agentId가 없습니다!");

  return `call_agent(${callAgentArgs.agentId}, "${callAgentArgs.message}") 성공, cost=$${resultCost}`;
});

console.log("\n--- Result ---");
console.log(JSON.stringify(result, null, 2));
process.exit(result.passed ? 0 : 1);
