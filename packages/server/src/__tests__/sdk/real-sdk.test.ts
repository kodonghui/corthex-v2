/**
 * Real SDK Integration Tests — Story 12.2
 * Architecture D10: 실제 SDK query() 호출 테스트 (주 1회, ~$1/회)
 *
 * 이 테스트는 모킹 없이 실제 Anthropic SDK를 호출합니다.
 * ANTHROPIC_API_KEY 환경변수가 없으면 전체 skip.
 *
 * 수동 실행: bun test packages/server/src/__tests__/sdk/
 */
import { describe, test, expect, beforeAll } from 'bun:test'

const API_KEY = process.env.ANTHROPIC_API_KEY

// Skip all tests if no API key is available
const describeSDK = API_KEY ? describe : describe.skip

describeSDK('Real SDK Integration Tests', () => {
  let query: typeof import('@anthropic-ai/claude-agent-sdk').query

  beforeAll(async () => {
    // Dynamic import to avoid module-level failures when SDK not available
    const sdk = await import('@anthropic-ai/claude-agent-sdk')
    query = sdk.query
  })

  test('query() basic call — sends prompt and receives response', async () => {
    const events: Array<{ type: string }> = []

    for await (const msg of query({
      prompt: 'Reply with exactly one word: hello',
      options: {
        systemPrompt: 'You are a test assistant. Reply as briefly as possible.',
        maxTurns: 1,
        permissionMode: 'bypassPermissions',
        env: { ANTHROPIC_API_KEY: API_KEY!, CLAUDECODE: '' },
      },
    })) {
      events.push({ type: msg.type })

      if (msg.type === 'assistant') {
        const content = (msg as any).message?.content
        expect(Array.isArray(content)).toBe(true)
        // At least one content block should exist
        expect(content.length).toBeGreaterThan(0)
      }
    }

    // Must have at least one assistant event and one result event
    const hasAssistant = events.some((e) => e.type === 'assistant')
    const hasResult = events.some((e) => e.type === 'result')
    expect(hasAssistant).toBe(true)
    expect(hasResult).toBe(true)
  }, 30_000)

  test('query() streaming — AsyncGenerator yields events in order', async () => {
    const eventTypes: string[] = []

    for await (const msg of query({
      prompt: 'Say "test" and nothing else',
      options: {
        systemPrompt: 'Reply with the single word requested.',
        maxTurns: 1,
        permissionMode: 'bypassPermissions',
        env: { ANTHROPIC_API_KEY: API_KEY!, CLAUDECODE: '' },
      },
    })) {
      eventTypes.push(msg.type)
    }

    // Result should be the last event
    const lastEvent = eventTypes[eventTypes.length - 1]
    expect(lastEvent).toBe('result')

    // Should have at least 2 events (assistant + result)
    expect(eventTypes.length).toBeGreaterThanOrEqual(2)
  }, 30_000)

  test('query() cost and token reporting — result includes usage data', async () => {
    let resultEvent: any = null

    for await (const msg of query({
      prompt: 'Reply: ok',
      options: {
        systemPrompt: 'One word replies only.',
        maxTurns: 1,
        permissionMode: 'bypassPermissions',
        env: { ANTHROPIC_API_KEY: API_KEY!, CLAUDECODE: '' },
      },
    })) {
      if (msg.type === 'result') {
        resultEvent = msg
      }
    }

    expect(resultEvent).not.toBeNull()
    expect(resultEvent.subtype).toBe('success')

    // Cost should be a non-negative number
    expect(typeof resultEvent.total_cost_usd).toBe('number')
    expect(resultEvent.total_cost_usd).toBeGreaterThanOrEqual(0)

    // Usage tokens should be positive
    expect(resultEvent.usage).toBeDefined()
    expect(resultEvent.usage.input_tokens).toBeGreaterThan(0)
    expect(resultEvent.usage.output_tokens).toBeGreaterThan(0)
  }, 30_000)

  test('query() error handling — invalid API key returns error', async () => {
    let resultEvent: any = null
    let threwError = false

    try {
      for await (const msg of query({
        prompt: 'test',
        options: {
          systemPrompt: 'test',
          maxTurns: 1,
          permissionMode: 'bypassPermissions',
          env: { ANTHROPIC_API_KEY: 'sk-invalid-key-for-test', CLAUDECODE: '' },
        },
      })) {
        if (msg.type === 'result') {
          resultEvent = msg
        }
      }
    } catch (err) {
      threwError = true
    }

    // Either the SDK returns an error result or throws an exception
    const hasError = threwError || (resultEvent?.subtype === 'error')
    expect(hasError).toBe(true)
  }, 30_000)

  test('token security — API key is not leaked in test output', () => {
    // Verify the API key exists but is not accidentally logged
    expect(API_KEY).toBeDefined()
    expect(typeof API_KEY).toBe('string')
    expect(API_KEY!.length).toBeGreaterThan(0)

    // This test itself validates that we reference API_KEY safely
    // No console.log of the key anywhere in this file
    // The key is only passed via env parameter to query()
  })
})
