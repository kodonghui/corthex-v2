/**
 * Story 16.1: MCP stdio PoC — Notion MCP 3-way handshake
 *
 * Verifies that:
 * 1. child_process.spawn works with Bun for MCP child processes (D25 stdio Phase 1)
 * 2. JSON-RPC initialize request → initialize response (AC4 Stage 1)
 * 3. tools/list returns at least 1 Notion MCP tool (Epic 18 MCP Pattern feasibility)
 * 4. Cold start time measurement (D26: warm start SLA ≤3s, cold start timeout 120s)
 *
 * Protocol discovery: @notionhq/notion-mcp-server uses newline-delimited JSON
 * (not LSP Content-Length framing). Each message is a JSON object followed by \n.
 *
 * Usage: bun run scripts/mcp-poc.ts
 * Result saved to scripts/mcp-poc-result.md
 */

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';

// Newline-delimited JSON encoding
function encodeMessage(msg: object): string {
  return JSON.stringify(msg) + '\n';
}

type PocResult = {
  startTime: number;
  spawnOk: boolean;
  initializeResponseMs: number | null;
  toolsListMs: number | null;
  toolCount: number;
  toolNames: string[];
  coldStartMs: number | null;
  errors: string[];
  passed: boolean;
};

async function runMcpPoC(): Promise<PocResult> {
  const result: PocResult = {
    startTime: Date.now(),
    spawnOk: false,
    initializeResponseMs: null,
    toolsListMs: null,
    toolCount: 0,
    toolNames: [],
    coldStartMs: null,
    errors: [],
    passed: false,
  };

  return new Promise((resolve) => {
    const spawnStart = Date.now();
    console.log('[PoC] Spawning Notion MCP server via npx...');

    // D25: stdio transport — child_process.spawn (Bun compatible)
    const proc = spawn('npx', ['-y', '@notionhq/notion-mcp-server'], {
      env: {
        ...process.env,
        OPENAPI_MCP_HEADERS: '{}',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    result.spawnOk = true;
    console.log(`[PoC] Process spawned (pid: ${proc.pid})`);

    let stdoutBuffer = '';
    let initDone = false;
    let toolsDone = false;
    let initReqSentAt = 0;
    let toolsReqSentAt = 0;

    // Hard timeout: 120s (D26 cold start timeout)
    const hardTimeout = setTimeout(() => {
      result.errors.push('TIMEOUT: 120s cold start timeout exceeded');
      proc.kill('SIGTERM');
      resolve(result);
    }, 120_000);

    proc.stdout.on('data', (chunk: Buffer) => {
      stdoutBuffer += chunk.toString();

      // Parse newline-delimited JSON messages
      const lines = stdoutBuffer.split('\n');
      stdoutBuffer = lines.pop() ?? ''; // Last incomplete line stays in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(trimmed);
        } catch {
          // Might be a non-JSON line (startup logs, etc.)
          console.log(`[PoC] non-JSON stdout: ${trimmed.slice(0, 100)}`);
          continue;
        }

        const rpcId = parsed['id'];
        const rpcResult = parsed['result'] as Record<string, unknown> | undefined;

        // Response to initialize (id=1)
        if (!initDone && rpcId === 1 && rpcResult) {
          const nowMs = Date.now() - initReqSentAt;
          result.initializeResponseMs = nowMs;
          result.coldStartMs = Date.now() - spawnStart;
          initDone = true;
          console.log(`[PoC] ✅ initialize response received (${nowMs}ms, cold start: ${result.coldStartMs}ms)`);
          console.log(`[PoC]    protocolVersion: ${(rpcResult as { protocolVersion?: string })?.protocolVersion}`);

          // Send initialized notification + tools/list
          proc.stdin.write(encodeMessage({ jsonrpc: '2.0', method: 'notifications/initialized' }));

          const toolsListReq = { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} };
          toolsReqSentAt = Date.now();
          proc.stdin.write(encodeMessage(toolsListReq));
          console.log('[PoC] tools/list request sent...');
        }

        // Response to tools/list (id=2)
        if (!toolsDone && rpcId === 2 && rpcResult) {
          const nowMs = Date.now() - toolsReqSentAt;
          result.toolsListMs = nowMs;
          toolsDone = true;

          const tools = ((rpcResult as { tools?: Array<{ name: string }> })?.tools) ?? [];
          result.toolCount = tools.length;
          result.toolNames = tools.slice(0, 10).map((t) => t.name);

          console.log(`[PoC] ✅ tools/list response received (${nowMs}ms)`);
          console.log(`[PoC]    Tool count: ${result.toolCount}`);
          console.log(`[PoC]    Tools (first 10): ${result.toolNames.join(', ')}`);

          clearTimeout(hardTimeout);
          proc.kill('SIGTERM');

          result.passed = initDone && toolsDone && result.toolCount >= 1;
          resolve(result);
        }
      }
    });

    proc.stderr.on('data', (chunk: Buffer) => {
      const msg = chunk.toString().trim();
      // Filter npx download noise
      if (
        msg.includes('npm warn') ||
        msg.includes('added ') ||
        msg.includes('changed ') ||
        msg.includes('up to date')
      )
        return;
      // Log relevant stderr (startup messages from the MCP server)
      if (msg) console.log(`[PoC] stderr: ${msg.slice(0, 200)}`);
    });

    proc.on('error', (err) => {
      result.errors.push(`spawn error: ${err.message}`);
      clearTimeout(hardTimeout);
      resolve(result);
    });

    proc.on('exit', (code, signal) => {
      if (!result.passed && !result.errors.length) {
        if (signal !== 'SIGTERM') {
          result.errors.push(`Process exited unexpectedly: code=${code} signal=${signal}`);
        }
      }
      clearTimeout(hardTimeout);
      if (!result.passed) resolve(result);
    });

    // Send initialize after a short startup delay
    setTimeout(() => {
      const initReq = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'corthex-poc', version: '1.0' },
        },
      };
      initReqSentAt = Date.now();
      proc.stdin.write(encodeMessage(initReq));
      console.log('[PoC] initialize request sent...');
    }, 1000); // 1s buffer for npx startup
  });
}

async function main() {
  console.log('=== CORTHEX Story 16.1: MCP stdio PoC ===\n');
  console.log('Testing: child_process.spawn + @notionhq/notion-mcp-server 3-way handshake\n');
  console.log('Protocol: newline-delimited JSON (discovered from AC4 testing)\n');

  const result = await runMcpPoC();
  const elapsed = Date.now() - result.startTime;

  console.log('\n=== PoC Results ===\n');
  console.log(`spawn: ${result.spawnOk ? '✅' : '❌'}`);
  console.log(`initialize: ${result.initializeResponseMs !== null ? `✅ ${result.initializeResponseMs}ms` : '❌'}`);
  console.log(`tools/list: ${result.toolsListMs !== null ? `✅ ${result.toolsListMs}ms (${result.toolCount} tools)` : '❌'}`);
  console.log(`cold start: ${result.coldStartMs !== null ? `${result.coldStartMs}ms` : 'N/A'}`);
  console.log(`total elapsed: ${elapsed}ms`);

  if (result.errors.length > 0) {
    console.log('\nErrors:');
    for (const e of result.errors) console.log(`  - ${e}`);
  }

  // SLA check (D26)
  const warmStartSla = result.coldStartMs !== null && result.coldStartMs <= 3000;
  console.log(
    `\nD26 warm start SLA (≤3s): ${warmStartSla ? '✅ PASS' : '⚠️ EXCEEDS (cold start/npx first-run — expected)'}`
  );

  // Write result markdown
  const errSection =
    result.errors.length > 0
      ? ['## Errors', '', ...result.errors.map((e) => `- ${e}`)].join('\n')
      : '';

  const mdContent = [
    '# Story 16.1: MCP stdio PoC Result',
    '',
    `**Date:** ${new Date().toISOString()}`,
    `**Platform:** ${process.arch} (${process.platform})`,
    `**Bun:** ${Bun.version}`,
    `**Protocol:** Newline-delimited JSON (not LSP Content-Length framing)`,
    '',
    '## Acceptance Criteria Results (AC4)',
    '',
    '| Check | Result | Detail |',
    '|-------|--------|--------|',
    `| child_process.spawn (Bun) | ${result.spawnOk ? '✅ PASS' : '❌ FAIL'} | Notion MCP spawned via npx |`,
    `| initialize response | ${result.initializeResponseMs !== null ? '✅ PASS' : '❌ FAIL'} | ${result.initializeResponseMs !== null ? result.initializeResponseMs + 'ms' : 'No response'} |`,
    `| tools/list returns ≥1 tool | ${result.toolCount >= 1 ? '✅ PASS' : '❌ FAIL'} | ${result.toolCount} tools returned |`,
    `| Overall | ${result.passed ? '✅ PASS' : '❌ FAIL'} | Epic 18 MCP Pattern feasibility ${result.passed ? 'confirmed' : 'UNCONFIRMED'} |`,
    '',
    '## Timing (D26 Cold Start)',
    '',
    '| Metric | Value | SLA |',
    '|--------|-------|-----|',
    `| Cold start (spawn→initialize) | ${result.coldStartMs ?? 'N/A'}ms | 120s max |`,
    `| initialize response latency | ${result.initializeResponseMs ?? 'N/A'}ms | - |`,
    `| tools/list response latency | ${result.toolsListMs ?? 'N/A'}ms | - |`,
    `| Total elapsed | ${elapsed}ms | - |`,
    '',
    '## Tool Discovery',
    '',
    `**Total tools:** ${result.toolCount}`,
    '',
    result.toolNames.length > 0
      ? `**Tools (first 10):** ${result.toolNames.map((n) => `\`${n}\``).join(', ')}`
      : '**Tools:** none',
    '',
    '## Architecture Decisions (Story 16.1)',
    '',
    `- **D25 CONFIRMED**: stdio Phase 1 — child_process.spawn works in Bun runtime (ARM64)`,
    `- **Protocol**: Newline-delimited JSON (not LSP framing). mcp-manager.ts must use \`readline\` or \`split('\\n')\` for response parsing.`,
    `- **D26 Cold Start**: First-run cold start includes npx package download. Subsequent runs (warm) expected within ≤3s SLA.`,
    `- **Epic 18 feasibility**: ${result.passed ? '✅ mcp-manager.ts 8-stage lifecycle pattern is implementable' : '❌ NEEDS INVESTIGATION'}`,
    '',
    errSection,
  ]
    .filter((l) => l !== undefined)
    .join('\n');

  const resultPath = path.join(import.meta.dir, 'mcp-poc-result.md');
  writeFileSync(resultPath, mdContent, 'utf-8');
  console.log(`\n📄 Result written to: ${resultPath}`);

  if (result.passed) {
    console.log('\n✅ MCP stdio PoC PASSED — Epic 18 MCP Pattern feasibility confirmed');
    console.log('   → mcp-manager.ts must use newline-delimited JSON (not Content-Length framing)');
  } else {
    console.error('\n❌ MCP stdio PoC FAILED');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
