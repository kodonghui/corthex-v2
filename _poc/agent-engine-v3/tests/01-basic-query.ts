/**
 * PoC Test 1: SDK 설치 + 기본 query() 실행 [MUST-PASS]
 *
 * 검증:
 * - @anthropic-ai/claude-agent-sdk import 성공
 * - query() 호출 → SDKMessage 스트림 수신
 * - result 메시지에서 성공 확인
 *
 * FAIL이면: SDK 자체가 동작 안 하므로 전체 방향 변경 필요
 */
import { query } from "@anthropic-ai/claude-agent-sdk";
import { runTest, info } from "./utils.js";

const result = await runTest(1, "SDK 설치 + 기본 query() 실행", async () => {
  info("query() 호출 시작 — 'What is 2+2?' (최소 비용 테스트)");

  let gotInit = false;
  let gotAssistant = false;
  let gotResult = false;
  let resultText = "";
  let sessionId = "";
  let costUsd = 0;
  let messageTypes: string[] = [];

  for await (const msg of query({
    prompt: "What is 2+2? Answer with just the number.",
    options: {
      maxTurns: 1,
      allowedTools: [],  // no tools needed
      permissionMode: "bypassPermissions",
      env: { CLAUDECODE: "" },  // 중첩 세션 방지 해제
    },
  })) {
    const msgType = `${msg.type}${msg.subtype ? `:${msg.subtype}` : ""}`;
    messageTypes.push(msgType);

    if (msg.type === "system" && msg.subtype === "init") {
      gotInit = true;
      sessionId = (msg as any).session_id || "unknown";
      info(`Init received — session: ${sessionId}`);
      info(`Model: ${(msg as any).model || "unknown"}`);
      info(`Tools: ${JSON.stringify((msg as any).tools?.length || 0)}`);
    }

    if (msg.type === "assistant") {
      gotAssistant = true;
      const content = (msg as any).message?.content;
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === "text") {
            resultText += block.text;
          }
        }
      }
    }

    if (msg.type === "result") {
      gotResult = true;
      costUsd = (msg as any).total_cost_usd || 0;
      info(`Result subtype: ${msg.subtype}`);
      info(`Cost: $${costUsd}`);
      info(`Turns: ${(msg as any).num_turns || "?"}`);
      if ((msg as any).usage) {
        const u = (msg as any).usage;
        info(`Tokens — in: ${u.input_tokens}, out: ${u.output_tokens}`);
      }
    }
  }

  info(`Message types received: [${messageTypes.join(", ")}]`);
  info(`Assistant response: "${resultText.trim()}"`);

  // Assertions
  if (!gotInit) throw new Error("init 메시지를 받지 못했습니다");
  if (!gotAssistant) throw new Error("assistant 메시지를 받지 못했습니다");
  if (!gotResult) throw new Error("result 메시지를 받지 못했습니다");
  if (!resultText.includes("4")) throw new Error(`2+2=4 응답 기대했으나: "${resultText}"`);

  return `session=${sessionId}, cost=$${costUsd}, response="${resultText.trim()}"`;
});

console.log("\n--- Result ---");
console.log(JSON.stringify(result, null, 2));
process.exit(result.passed ? 0 : 1);
