/**
 * PoC Test 8: 병렬 에이전트 실행
 *
 * 검증:
 * - 여러 query()를 Promise.all로 동시 실행
 * - 각각 다른 에이전트 설정으로 독립 실행
 * - CORTHEX 패턴: 여러 부서에 동시 업무 배포
 */
import { query } from "@anthropic-ai/claude-agent-sdk";
import { runTest, info } from "./utils.js";

const result = await runTest(8, "병렬 에이전트 실행", async () => {
  const tasks = [
    { name: "agent-A", prompt: "What is the capital of France? One word answer." },
    { name: "agent-B", prompt: "What is the capital of Japan? One word answer." },
    { name: "agent-C", prompt: "What is the capital of Brazil? One word answer." },
  ];

  info(`${tasks.length}개 에이전트 병렬 실행 시작...`);
  const startAll = Date.now();

  const results = await Promise.all(
    tasks.map(async (task) => {
      const start = Date.now();
      let response = "";
      let cost = 0;

      for await (const msg of query({
        prompt: task.prompt,
        options: {
          maxTurns: 1,
          allowedTools: [],
          permissionMode: "bypassPermissions",
          env: { CLAUDECODE: "" },
          maxBudgetUsd: 0.1,
        },
      })) {
        if (msg.type === "assistant") {
          const content = (msg as any).message?.content;
          if (Array.isArray(content)) {
            for (const block of content) {
              if (block.type === "text") response += block.text;
            }
          }
        }
        if (msg.type === "result") {
          cost = (msg as any).total_cost_usd || 0;
        }
      }

      const duration = Date.now() - start;
      return { name: task.name, response: response.trim(), cost, duration };
    })
  );

  const totalDuration = Date.now() - startAll;

  for (const r of results) {
    info(`${r.name}: "${r.response}" ($${r.cost}, ${r.duration}ms)`);
  }
  info(`총 소요시간: ${totalDuration}ms`);
  info(`개별 합산: ${results.reduce((s, r) => s + r.duration, 0)}ms`);
  info(`병렬 이득: ${results.reduce((s, r) => s + r.duration, 0) - totalDuration}ms 절약`);

  // Assertions
  if (results.length !== 3) throw new Error("3개 결과를 받지 못했습니다");
  const allHaveResponse = results.every((r) => r.response.length > 0);
  if (!allHaveResponse) throw new Error("일부 에이전트가 응답하지 않았습니다");

  return `${results.length}개 병렬 완료, ${totalDuration}ms`;
});

console.log("\n--- Result ---");
console.log(JSON.stringify(result, null, 2));
process.exit(result.passed ? 0 : 1);
