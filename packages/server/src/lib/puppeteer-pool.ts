import PQueue from 'p-queue'
import puppeteer from 'puppeteer'
import type { Browser } from 'puppeteer'

// Story 17.2: Puppeteer Pool (D24, E14)
// maxConcurrency:5 — ~1GB on 24GB VPS. 30s timeout → TOOL_RESOURCE_UNAVAILABLE.
// E14: ONLY `withPuppeteer()` may launch Chromium. Direct puppeteer.launch() elsewhere is forbidden.

const POOL_TIMEOUT_MS = 30_000

let queue: PQueue | null = null

export function initPuppeteerPool(concurrency = 5): void {
  queue = new PQueue({ concurrency })
}

/**
 * withPuppeteer — acquires a Chromium browser from the pool, runs `fn`, then closes the browser.
 * The finally block guarantees browser.close() even if `fn` throws.
 * If pool is at capacity and 30s elapses, throws ToolResourceUnavailableError.
 */
export async function withPuppeteer<T>(fn: (browser: Browser) => Promise<T>): Promise<T> {
  if (!queue) {
    throw new ToolResourceUnavailableError('Puppeteer pool not initialized. Call initPuppeteerPool() at server startup.')
  }

  let timedOut = false
  const timeoutHandle = setTimeout(() => { timedOut = true }, POOL_TIMEOUT_MS)

  try {
    const result = await Promise.race([
      queue.add(async () => {
        if (timedOut) throw new ToolResourceUnavailableError('puppeteer_pool_timeout')
        const browser = await puppeteer.launch({
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        })
        try {
          return await fn(browser)
        } finally {
          await browser.close().catch(() => {})
        }
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new ToolResourceUnavailableError('puppeteer_pool_timeout')), POOL_TIMEOUT_MS)
      }),
    ])
    return result as T
  } finally {
    clearTimeout(timeoutHandle)
  }
}

export class ToolResourceUnavailableError extends Error {
  readonly code = 'TOOL_RESOURCE_UNAVAILABLE'
  constructor(message: string) {
    super(message)
    this.name = 'ToolResourceUnavailableError'
  }
}
