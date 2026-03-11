import { describe, test, expect } from 'bun:test'
import { sseStream } from '../../engine/sse-adapter'
import type { SSEEvent } from '../../engine/types'

/** Helper: collect all values from AsyncGenerator */
async function collect(gen: AsyncGenerator<string>): Promise<string[]> {
  const results: string[] = []
  for await (const val of gen) {
    results.push(val)
  }
  return results
}

/** Helper: single-event generator */
async function* single(event: SSEEvent): AsyncGenerator<SSEEvent> {
  yield event
}

describe('sse-adapter (D4)', () => {
  describe('formatSSE via sseStream — 6 event types', () => {
    test('accepted event', async () => {
      const [result] = await collect(sseStream(single({ type: 'accepted', sessionId: 'sess-123' })))
      expect(result).toBe('event: accepted\ndata: {"sessionId":"sess-123"}\n\n')
    })

    test('processing event', async () => {
      const [result] = await collect(sseStream(single({ type: 'processing', agentName: 'Alice' })))
      expect(result).toBe('event: processing\ndata: {"agentName":"Alice"}\n\n')
    })

    test('handoff event', async () => {
      const [result] = await collect(sseStream(single({ type: 'handoff', from: 'Alice', to: 'Bob', depth: 2 })))
      expect(result).toBe('event: handoff\ndata: {"from":"Alice","to":"Bob","depth":2}\n\n')
    })

    test('message event', async () => {
      const [result] = await collect(sseStream(single({ type: 'message', content: 'Hello world' })))
      expect(result).toBe('event: message\ndata: {"content":"Hello world"}\n\n')
    })

    test('error event', async () => {
      const [result] = await collect(sseStream(single({ type: 'error', code: 'AGENT_SPAWN_FAILED', message: 'Timeout' })))
      expect(result).toBe('event: error\ndata: {"code":"AGENT_SPAWN_FAILED","message":"Timeout"}\n\n')
    })

    test('done event', async () => {
      const [result] = await collect(sseStream(single({ type: 'done', costUsd: 0.01, tokensUsed: 150 })))
      expect(result).toBe('event: done\ndata: {"costUsd":0.01,"tokensUsed":150}\n\n')
    })
  })

  describe('sseStream — multi-event stream', () => {
    test('converts multiple events in order', async () => {
      async function* generate(): AsyncGenerator<SSEEvent> {
        yield { type: 'accepted', sessionId: 'sess-1' }
        yield { type: 'message', content: 'Hi' }
        yield { type: 'done', costUsd: 0.02, tokensUsed: 200 }
      }

      const chunks = await collect(sseStream(generate()))
      expect(chunks).toHaveLength(3)
      expect(chunks[0]).toBe('event: accepted\ndata: {"sessionId":"sess-1"}\n\n')
      expect(chunks[1]).toBe('event: message\ndata: {"content":"Hi"}\n\n')
      expect(chunks[2]).toBe('event: done\ndata: {"costUsd":0.02,"tokensUsed":200}\n\n')
    })

    test('empty generator yields nothing', async () => {
      async function* empty(): AsyncGenerator<SSEEvent> {
        // yields nothing
      }

      const chunks = await collect(sseStream(empty()))
      expect(chunks).toHaveLength(0)
    })
  })

  describe('TEA risk-based tests', () => {
    test('P1: error event with optional agentName field included in data', async () => {
      const event: SSEEvent = { type: 'error', code: 'AGENT_SPAWN_FAILED', message: 'Timeout', agentName: 'secretary' }
      const [result] = await collect(sseStream(single(event)))
      expect(result).toBe('event: error\ndata: {"code":"AGENT_SPAWN_FAILED","message":"Timeout","agentName":"secretary"}\n\n')
    })

    test('P1: type field excluded from data JSON (only in event line)', async () => {
      const [result] = await collect(sseStream(single({ type: 'message', content: 'test' })))
      const dataLine = result.split('\n')[1]
      const data = JSON.parse(dataLine.replace('data: ', ''))
      expect(data).not.toHaveProperty('type')
      expect(result.startsWith('event: message\n')).toBe(true)
    })

    test('P2: content with special chars (newlines, quotes, unicode) safely JSON-encoded', async () => {
      const [result] = await collect(sseStream(single({ type: 'message', content: '줄바꿈\n"따옴표"\t탭' })))
      expect(result).toContain('event: message\n')
      const dataLine = result.split('\n').find(l => l.startsWith('data: '))!
      const parsed = JSON.parse(dataLine.replace('data: ', ''))
      expect(parsed.content).toBe('줄바꿈\n"따옴표"\t탭')
    })
  })
})
