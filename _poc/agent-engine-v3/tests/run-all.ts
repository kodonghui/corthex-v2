/**
 * PoC 전체 테스트 실행기
 * 9개 테스트를 순차 실행하고 종합 결과 출력
 */
import { spawn } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface TestResult {
  test: number;
  title: string;
  passed: boolean;
  exitCode: number;
  duration_ms: number;
  output: string;
}

const tests = [
  { num: 1, file: "01-basic-query.ts",       title: "SDK 기본 query()",           priority: "MUST-PASS" },
  { num: 2, file: "02-cli-token-auth.ts",     title: "CLI 토큰 인증",              priority: "MUST-PASS" },
  { num: 3, file: "03-custom-tools.ts",       title: "커스텀 도구 (call_agent)",    priority: "MUST-PASS" },
  { num: 4, file: "04-hooks.ts",              title: "Hook 시스템",                priority: "IMPORTANT" },
  { num: 6, file: "06-subagents.ts",          title: "서브에이전트",               priority: "BONUS" },
  { num: 7, file: "07-nested-subagents.ts",   title: "중첩 서브에이전트",           priority: "BONUS" },
  { num: 8, file: "08-parallel-agents.ts",    title: "병렬 에이전트",              priority: "BONUS" },
  { num: 9, file: "09-mcp-connection.ts",     title: "MCP 서버 연결",             priority: "BONUS" },
];

async function runOne(test: typeof tests[0]): Promise<TestResult> {
  const start = Date.now();
  const filePath = resolve(__dirname, test.file);

  return new Promise((resolve) => {
    const child = spawn("bun", ["run", filePath], {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 120_000, // 2분 타임아웃
      env: { ...process.env, CLAUDECODE: "" }, // 중첩 세션 방지 해제
    });

    let output = "";
    child.stdout?.on("data", (d) => { output += d.toString(); });
    child.stderr?.on("data", (d) => { output += d.toString(); });

    child.on("close", (code) => {
      resolve({
        test: test.num,
        title: test.title,
        passed: code === 0,
        exitCode: code || 0,
        duration_ms: Date.now() - start,
        output,
      });
    });

    child.on("error", (err) => {
      resolve({
        test: test.num,
        title: test.title,
        passed: false,
        exitCode: -1,
        duration_ms: Date.now() - start,
        output: err.message,
      });
    });
  });
}

// 선택적 실행: 인자로 테스트 번호 지정 가능
const selectedTests = process.argv.slice(2).map(Number).filter(Boolean);
const testsToRun = selectedTests.length > 0
  ? tests.filter((t) => selectedTests.includes(t.num))
  : tests;

console.log("\n" + "=".repeat(60));
console.log("  CORTHEX Agent Engine v3 — PoC 테스트 실행");
console.log("=".repeat(60));
console.log(`\n실행할 테스트: ${testsToRun.map((t) => t.num).join(", ")}\n`);

const results: TestResult[] = [];

for (const test of testsToRun) {
  console.log(`\n--- [${test.priority}] Test ${test.num}: ${test.title} ---`);
  const result = await runOne(test);
  results.push(result);

  // 실시간 출력
  if (result.output) {
    const lines = result.output.split("\n").filter(Boolean);
    for (const line of lines.slice(-10)) { // 마지막 10줄만
      console.log(`  ${line}`);
    }
  }

  const status = result.passed ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
  console.log(`  → ${status} (${result.duration_ms}ms)`);

  // MUST-PASS 실패 시 중단
  if (!result.passed && test.priority === "MUST-PASS") {
    console.log(`\n\x1b[31m[CRITICAL] MUST-PASS 테스트 실패 — 나머지 중단\x1b[0m`);
    break;
  }
}

// 종합 결과
console.log("\n" + "=".repeat(60));
console.log("  종합 결과");
console.log("=".repeat(60) + "\n");

const table = results.map((r) => ({
  "#": r.test,
  테스트: r.title,
  우선순위: tests.find((t) => t.num === r.test)?.priority || "?",
  결과: r.passed ? "PASS" : "FAIL",
  소요시간: `${r.duration_ms}ms`,
}));

console.table(table);

const mustPass = results.filter((r) => r.test <= 3);
const important = results.filter((r) => r.test === 4);
const bonus = results.filter((r) => r.test >= 6);

const mustPassOk = mustPass.every((r) => r.passed);
const importantOk = important.every((r) => r.passed);
const bonusOk = bonus.every((r) => r.passed);

console.log(`\nMUST-PASS (1-3): ${mustPassOk ? "ALL PASS" : "FAILED"}`);
console.log(`IMPORTANT (4): ${importantOk ? "ALL PASS" : "SOME FAILED"}`);
console.log(`BONUS (6-9): ${bonusOk ? "ALL PASS" : "SOME FAILED"}`);

console.log("\n=== PoC 판정 ===");
if (mustPassOk) {
  console.log("\x1b[32m✓ Claude Agent SDK 방향 확정 — Phase 1 진행 가능\x1b[0m");
} else {
  console.log("\x1b[31m✗ SDK 방향 불가 — Track B (패턴 추출) 검토 필요\x1b[0m");
}

const totalCost = results.reduce((s, r) => {
  // output에서 cost 추출 시도
  const match = r.output.match(/cost=\$([0-9.]+)/);
  return s + (match ? parseFloat(match[1]) : 0);
}, 0);
console.log(`\n총 비용: ~$${totalCost.toFixed(4)}`);

process.exit(mustPassOk ? 0 : 1);
