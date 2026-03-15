/**
 * Story 16.1: ARM64 Dependency Verification Script
 *
 * Verifies all Phase 1 dependencies work correctly on ARM64:
 * - puppeteer@22.15.0 (via system Chromium)
 * - p-queue@8.0.1 (ESM import)
 * - @aws-sdk/client-s3@3.717.0
 * - marked@12.0.0
 *
 * Decision (D24): ARM64 requires PUPPETEER_EXECUTABLE_PATH pointing to system Chromium.
 * Bundled puppeteer Chromium is x64-only and fails with ENOEXEC on aarch64.
 *
 * Usage: bun run scripts/verify-deps.ts
 * Required env: PUPPETEER_EXECUTABLE_PATH=/snap/bin/chromium (or Docker system chromium path)
 */

import puppeteer from 'puppeteer';
import PQueue from 'p-queue';
import { marked } from 'marked';
import { S3Client } from '@aws-sdk/client-s3';

const CHROMIUM_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || '/snap/bin/chromium';

type VerifyResult = {
  name: string;
  version: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  detail: string;
};

const results: VerifyResult[] = [];

// 1. p-queue ESM import + concurrency test
function verifyPQueue(): VerifyResult {
  try {
    const queue = new PQueue({ concurrency: 5 });
    if (queue.concurrency !== 5) throw new Error(`concurrency mismatch: ${queue.concurrency}`);
    queue.clear();
    return { name: 'p-queue', version: '8.0.1', status: 'PASS', detail: 'ESM import OK, concurrency: 5' };
  } catch (err: unknown) {
    return { name: 'p-queue', version: '8.0.1', status: 'FAIL', detail: String(err) };
  }
}

// 2. marked markdown→HTML
function verifyMarked(): VerifyResult {
  try {
    const mdHeading = '# Korean Test 한국어 테스트';
    const mdTable = '| col1 | col2 |\n|------|------|\n| a    | b    |';
    const mdCode = '```js\nconsole.log("code");\n```';
    const fullMd = [mdHeading, '', mdTable, '', mdCode].join('\n');
    const html = String(marked(fullMd));
    if (!html.includes('<h1>')) throw new Error('Missing <h1> element');
    if (!html.includes('<table>')) throw new Error('Missing <table> element');
    if (!html.includes('<code')) throw new Error('Missing <code> element');
    return { name: 'marked', version: '12.0.0', status: 'PASS', detail: 'markdown→HTML OK (headings, tables, code blocks)' };
  } catch (err: unknown) {
    return { name: 'marked', version: '12.0.0', status: 'FAIL', detail: String(err) };
  }
}

// 3. @aws-sdk/client-s3 instantiation
function verifyS3Client(): VerifyResult {
  try {
    const client = new S3Client({
      region: 'auto',
      endpoint: 'https://test.r2.cloudflarestorage.com',
      credentials: { accessKeyId: 'test-key', secretAccessKey: 'test-secret' },
    });
    if (typeof client.send !== 'function') throw new Error('S3Client.send not a function');
    return { name: '@aws-sdk/client-s3', version: '3.717.0', status: 'PASS', detail: 'S3Client instantiation OK (Cloudflare R2 config)' };
  } catch (err: unknown) {
    return { name: '@aws-sdk/client-s3', version: '3.717.0', status: 'FAIL', detail: String(err) };
  }
}

// 4. Puppeteer ARM64 launch test
async function verifyPuppeteer(): Promise<VerifyResult> {
  const execPath = CHROMIUM_PATH;
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  try {
    browser = await puppeteer.launch({
      headless: 'new' as unknown as boolean, // 'new' mode; headless:true deprecated in puppeteer@22
      executablePath: execPath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const version = await browser.version();
    return {
      name: 'puppeteer',
      version: '22.15.0',
      status: 'PASS',
      detail: `Launch OK via ${execPath} | Chromium: ${version}`,
    };
  } catch (err: unknown) {
    // Check if it's the ARM64 x64-binary error
    const msg = String(err);
    if (msg.includes('ENOEXEC') || msg.includes('posix_spawn')) {
      return {
        name: 'puppeteer',
        version: '22.15.0',
        status: 'FAIL',
        detail: `ARM64 incompatibility — bundled Chromium is x64-only. Set PUPPETEER_EXECUTABLE_PATH to system Chromium. Error: ${msg}`,
      };
    }
    return { name: 'puppeteer', version: '22.15.0', status: 'FAIL', detail: msg };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

async function main() {
  console.log('=== CORTHEX Story 16.1: ARM64 Dependency Verification ===\n');
  console.log(`Platform: ${process.arch} (${process.platform})`);
  console.log(`Bun: ${Bun.version}`);
  console.log(`PUPPETEER_EXECUTABLE_PATH: ${CHROMIUM_PATH}\n`);

  // Sync verifications
  results.push(verifyPQueue());
  results.push(verifyMarked());
  results.push(verifyS3Client());

  // Async Puppeteer verification
  results.push(await verifyPuppeteer());

  // Report
  console.log('=== Results ===\n');
  let allPassed = true;
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${icon} ${r.name}@${r.version}`);
    console.log(`   ${r.detail}\n`);
    if (r.status === 'FAIL') allPassed = false;
  }

  if (allPassed) {
    console.log('✅ ALL DEPENDENCIES VERIFIED — ARM64 compatible\n');
    console.log('Decision: Use PUPPETEER_EXECUTABLE_PATH for ARM64 + Docker');
    console.log('Dockerfile: Add system chromium + PUPPETEER_EXECUTABLE_PATH env var');
  } else {
    console.error('❌ SOME DEPENDENCIES FAILED — see details above');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
