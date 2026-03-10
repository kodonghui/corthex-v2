// PoC Test Utilities
const PASS = "\x1b[32m[PASS]\x1b[0m";
const FAIL = "\x1b[31m[FAIL]\x1b[0m";
const SKIP = "\x1b[33m[SKIP]\x1b[0m";
const INFO = "\x1b[36m[INFO]\x1b[0m";

export function log(tag: string, msg: string) {
  console.log(`${tag} ${msg}`);
}

export function pass(msg: string) { log(PASS, msg); }
export function fail(msg: string) { log(FAIL, msg); }
export function skip(msg: string) { log(SKIP, msg); }
export function info(msg: string) { log(INFO, msg); }

export function header(testNum: number, title: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Test ${testNum}: ${title}`);
  console.log(`${"=".repeat(60)}\n`);
}

export interface TestResult {
  test: number;
  title: string;
  passed: boolean;
  details: string;
  duration_ms: number;
}

export async function runTest(
  testNum: number,
  title: string,
  fn: () => Promise<string>
): Promise<TestResult> {
  header(testNum, title);
  const start = Date.now();
  try {
    const details = await fn();
    const duration = Date.now() - start;
    pass(`${title} (${duration}ms)`);
    return { test: testNum, title, passed: true, details, duration_ms: duration };
  } catch (err: any) {
    const duration = Date.now() - start;
    fail(`${title}: ${err.message}`);
    if (err.stack) info(err.stack.split("\n").slice(1, 3).join("\n"));
    return { test: testNum, title, passed: false, details: err.message, duration_ms: duration };
  }
}
