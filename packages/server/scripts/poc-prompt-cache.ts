/**
 * Story 15-1: SDK PoC — Prompt Caching Path A vs Path B
 *
 * DECISION: Path A FAILS — claude-agent-sdk@0.2.72 only accepts `string` for
 * systemPrompt. At runtime, if an array is passed:
 *   const H = options.systemPrompt
 *   if (typeof H === 'string') systemPrompt = H   // ← array fails this check
 *   else if (H.type === 'preset') ...             // ← array has no .type
 *   → systemPrompt becomes "" (empty string)
 * Source: sdk.mjs line inspection, SDKControlInitializeRequest type shows string.
 *
 * SELECTED PATH: B — anthropic.messages.create() directly with
 *   system: [{ type:'text', text: soul, cache_control: { type:'ephemeral' } }]
 *
 * Run: bun run scripts/poc-prompt-cache.ts
 * Requires: ANTHROPIC_API_KEY env var
 */
import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) {
  console.error('ANTHROPIC_API_KEY is required')
  process.exit(1)
}

const client = new Anthropic({ apiKey })

const SOUL = `You are a helpful organizational AI assistant for CORTHEX.
You help route tasks, answer questions, and manage organizational workflows.
You are concise and professional.`

async function testPathA(): Promise<void> {
  // Path A: Try passing ContentBlock[] as systemPrompt to query()
  // Result: SDK converts non-string to empty string → NOT feasible
  console.log('--- Path A Test ---')
  console.log('Importing claude-agent-sdk query...')
  try {
    const { query } = await import('@anthropic-ai/claude-agent-sdk')
    // TypeScript would block this, but we test at runtime via any-cast
    const systemPromptAsArray = [{ type: 'text', text: SOUL, cache_control: { type: 'ephemeral' } }] as unknown as string
    console.log('Calling query() with ContentBlock[] as systemPrompt...')
    let firstMsg = true
    for await (const msg of query({
      prompt: 'Say "Path A test OK" and nothing else.',
      options: {
        systemPrompt: systemPromptAsArray,
        maxTurns: 1,
        permissionMode: 'bypassPermissions',
        env: { ANTHROPIC_API_KEY: apiKey, CLAUDECODE: '' },
      },
    })) {
      if (firstMsg) {
        console.log('First message type:', (msg as any).type)
        firstMsg = false
      }
      if ((msg as any).type === 'result') {
        const usage = (msg as any).modelUsage
        console.log('Path A modelUsage:', JSON.stringify(usage))
        const cacheRead = Object.values(usage ?? {}).reduce((acc: number, v: any) => acc + (v?.cacheReadInputTokens ?? 0), 0)
        console.log('Path A cacheReadInputTokens:', cacheRead)
        console.log('Path A verdict: SDK accepts ContentBlock[]?', cacheRead > 0 ? 'YES (Path A feasible)' : 'NO (system prompt was empty)')
        break
      }
    }
  } catch (e) {
    console.log('Path A error:', e instanceof Error ? e.message : String(e))
  }
}

async function testPathB(): Promise<void> {
  // Path B: messages.create() with cache_control on system
  console.log('\n--- Path B Test ---')
  const systemBlocks: Anthropic.Messages.TextBlockParam[] = [{
    type: 'text',
    text: SOUL,
    cache_control: { type: 'ephemeral' },
  }]

  console.log('Call 1 (cache WRITE expected)...')
  const r1 = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 64,
    system: systemBlocks,
    messages: [{ role: 'user', content: 'Say "OK 1" and nothing else.' }],
  })
  console.log('Call 1 usage:', JSON.stringify(r1.usage))
  console.log('Call 1 cache_creation_input_tokens:', r1.usage.cache_creation_input_tokens)
  console.log('Call 1 cache_read_input_tokens:', r1.usage.cache_read_input_tokens)

  console.log('\nCall 2 (cache READ expected within 5min TTL)...')
  const r2 = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 64,
    system: systemBlocks,
    messages: [{ role: 'user', content: 'Say "OK 2" and nothing else.' }],
  })
  console.log('Call 2 usage:', JSON.stringify(r2.usage))
  console.log('Call 2 cache_creation_input_tokens:', r2.usage.cache_creation_input_tokens)
  console.log('Call 2 cache_read_input_tokens:', r2.usage.cache_read_input_tokens)

  const cacheHit = (r2.usage.cache_read_input_tokens ?? 0) > 0
  console.log('\nPath B verdict: cache_read_input_tokens > 0?', cacheHit ? 'YES ✓ Path B works!' : 'NO (check if soul is > 1024 tokens)')
  console.log('\nSelected Path: B — agent-loop.ts uses messages.create() with cache_control')
}

async function main() {
  console.log('=== Story 15-1: Prompt Cache PoC ===\n')
  await testPathA()
  await testPathB()
  console.log('\n=== PoC Complete ===')
}

main().catch(console.error)
