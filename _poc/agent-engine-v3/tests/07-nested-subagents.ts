/**
 * PoC Test 7: 중첩 서브에이전트 (한계 확인)
 *
 * 검증:
 * - 서브에이전트가 또 다른 서브에이전트를 호출할 수 있는지
 * - SDK 문서에 따르면 1단계만 가능 — 이를 확인
 * - 실패하면 call_agent MCP 도구 패턴이 더 적합함을 입증
 */
import { query } from "@anthropic-ai/claude-agent-sdk";
import { runTest, info } from "./utils.js";

const result = await runTest(7, "중첩 서브에이전트 (한계 확인)", async () => {
  let depth0Messages: string[] = [];
  let depth1Messages: string[] = [];
  let resultCost = 0;
  let errorOccurred = false;
  let errorMessage = "";

  try {
    for await (const msg of query({
      prompt:
        "manager 에이전트에게 '워커에게 인사해달라'고 위임해주세요. Agent 도구를 사용하세요.",
      options: {
        maxTurns: 5,
        maxBudgetUsd: 0.5,
        allowedTools: ["Agent"],
        permissionMode: "bypassPermissions",
        env: { CLAUDECODE: "" },
        agents: {
          manager: {
            description: "매니저 — 워커에게 재위임하는 에이전트",
            prompt:
              "You are a manager agent. When asked, delegate to the worker agent using the Agent tool.",
            tools: ["Agent"],
            model: "haiku",
            maxTurns: 3,
          },
          worker: {
            description: "워커 — 실제 작업을 수행하는 에이전트",
            prompt: "You are a worker agent. Just say 'Hello from worker!'",
            tools: [],
            model: "haiku",
            maxTurns: 1,
          },
        },
      },
    })) {
      if (msg.type === "assistant") {
        const parentId = (msg as any).parent_tool_use_id;
        const content = (msg as any).message?.content;
        if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === "text") {
              const label = parentId ? "depth1+" : "depth0";
              const arr = parentId ? depth1Messages : depth0Messages;
              arr.push(block.text.slice(0, 200));
            }
          }
        }
      }

      if (msg.type === "result") {
        resultCost = (msg as any).total_cost_usd || 0;
        if (msg.subtype?.startsWith("error")) {
          errorOccurred = true;
          errorMessage = (msg as any).errors?.[0] || msg.subtype;
        }
      }
    }
  } catch (e: any) {
    errorOccurred = true;
    errorMessage = e.message;
  }

  info(`depth0 messages: ${depth0Messages.length}`);
  info(`depth1+ messages: ${depth1Messages.length}`);
  info(`Error: ${errorOccurred ? errorMessage : "none"}`);
  info(`Cost: $${resultCost}`);

  // 중첩이 안 되는 것이 예상 결과
  info("\n=== 분석 ===");
  if (depth1Messages.length > 0) {
    info("중첩 서브에이전트 동작함! (예상 외)");
    info("→ SDK 기본 Agent 도구로도 다단계 위임 가능");
  } else {
    info("중첩 서브에이전트 미동작 (예상대로)");
    info("→ call_agent MCP 도구 패턴이 필요함을 확인");
    info("→ 각 call_agent가 새로운 query() 세션을 만들면 무한 깊이 가능");
  }

  // 이 테스트는 한계를 확인하는 것이므로 실패해도 PoC 성공
  return `depth0=${depth0Messages.length}, depth1=${depth1Messages.length}, nested=${depth1Messages.length > 0 ? "YES" : "NO"}, cost=$${resultCost}`;
});

console.log("\n--- Result ---");
console.log(JSON.stringify(result, null, 2));
process.exit(0); // 이 테스트는 결과에 관계없이 pass (탐색적 테스트)
