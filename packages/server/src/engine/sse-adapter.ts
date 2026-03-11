import type { SSEEvent } from './types'

/**
 * D4: SSE 어댑터 — AsyncGenerator<SSEEvent> → text/event-stream
 *
 * engine 내부 전용 (E8). hub.ts(Story 4.1)에서 사용.
 * 프론트엔드 SSE 파싱 호환: event: {type}\ndata: {JSON}\n\n
 */

/** E8: 단일 export — AsyncGenerator<SSEEvent> → AsyncGenerator<string> */
export async function* sseStream(
  events: AsyncGenerator<SSEEvent>
): AsyncGenerator<string> {
  for await (const event of events) {
    yield formatSSE(event)
  }
}

function formatSSE(event: SSEEvent): string {
  const { type, ...data } = event
  return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`
}
