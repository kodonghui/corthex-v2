/**
 * PoC Test 6: 서브에이전트 정의 + Agent 도구
 *
 * 검증:
 * - agents 옵션으로 서브에이전트 정의
 * - LLM이 Agent 도구를 사용해 서브에이전트 호출
 * - 서브에이전트 결과 수신
 *
 * CORTHEX 패턴: 부서 매니저 → 팀원 에이전트 위임
 */
import { query } from "@anthropic-ai/claude-agent-sdk";
import { runTest, info } from "./utils.js";

const result = await runTest(6, "서브에이전트 정의 + Agent 도구", async () => {
  let agentToolUsed = false;
  let subagentMessages: string[] = [];
  let resultCost = 0;

  for await (const msg of query({
    prompt:
      "researcher 에이전트에게 '한국의 수도는?' 이라는 질문을 위임해주세요. Agent 도구를 사용하세요.",
    options: {
      maxTurns: 5,
      allowedTools: ["Agent"],
      permissionMode: "bypassPermissions",
      env: { CLAUDECODE: "" },
      agents: {
        researcher: {
          description: "질문에 답변하는 리서처 에이전트",
          prompt:
            "You are a research agent. Answer questions concisely. Always answer in one short sentence.",
          tools: [], // 도구 없이 지식만으로 답변
          model: "haiku",
          maxTurns: 1,
        },
      },
    },
  })) {
    if (msg.type === "assistant") {
      const content = (msg as any).message?.content;
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === "tool_use" && block.name === "Agent") {
            agentToolUsed = true;
            info(`Agent tool invoked: ${JSON.stringify(block.input).slice(0, 200)}`);
          }
          if (block.type === "text" && block.text) {
            const prefix = (msg as any).parent_tool_use_id ? "[Sub]" : "[Main]";
            subagentMessages.push(`${prefix} ${block.text.slice(0, 200)}`);
          }
        }
      }
    }

    if (msg.type === "system" && msg.subtype === "task_notification") {
      info(`Task: ${(msg as any).task_id} — ${(msg as any).status}: ${(msg as any).summary?.slice(0, 100)}`);
    }

    if (msg.type === "result") {
      resultCost = (msg as any).total_cost_usd || 0;
      info(`Result: ${msg.subtype}, cost=$${resultCost}`);
    }
  }

  info(`\nAgent tool used: ${agentToolUsed}`);
  info(`Messages: ${subagentMessages.length}`);
  for (const m of subagentMessages) info(`  ${m}`);

  if (!agentToolUsed) throw new Error("Agent 도구가 호출되지 않았습니다");

  return `Agent도구 호출 성공, messages=${subagentMessages.length}, cost=$${resultCost}`;
});

console.log("\n--- Result ---");
console.log(JSON.stringify(result, null, 2));
process.exit(result.passed ? 0 : 1);
