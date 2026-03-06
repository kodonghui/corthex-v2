/**
 * MCP (Model Context Protocol) 클라이언트
 *
 * Streamable HTTP 전송 방식으로 MCP 서버와 JSON-RPC 2.0 통신
 * - tools/list: 서버의 도구 목록 조회
 * - tools/call: 도구 실행 (JSON 또는 SSE 스트리밍)
 */

const MCP_TIMEOUT_MS = 5_000
const MCP_STREAM_TIMEOUT_MS = 60_000

type McpToolDef = {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

type McpJsonRpcResponse = {
  jsonrpc: string
  id: string | number | null
  result?: unknown
  error?: { code: number; message: string }
}

// SSRF 방지: 내부 네트워크 IP 차단
export function isPrivateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname

    // 프로토콜 검증: http/https만 허용
    if (!['http:', 'https:'].includes(parsed.protocol)) return true

    // IPv6 bracket 제거 (URL 파서가 [::1] 형태로 반환)
    const bareHost = host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host

    // 빈 호스트 차단
    if (!bareHost || bareHost.length === 0) return true

    // 개발/테스트 환경에서만 localhost 허용
    const isDev = process.env.NODE_ENV !== 'production'
    const localhostPatterns = ['localhost', '127.0.0.1', '0.0.0.0', '::1']
    if (localhostPatterns.includes(bareHost)) return !isDev

    // 클라우드 메타데이터 엔드포인트
    if (bareHost === '169.254.169.254') return true
    if (bareHost === 'metadata.google.internal') return true

    // RFC1918 사설 IP
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(bareHost)) return true

    // IPv4-mapped IPv6 (::ffff:10.0.0.1 → ::ffff:a00:1 등)
    if (/^::ffff:/i.test(bareHost)) {
      const mappedPart = bareHost.slice(7) // ::ffff: 제거
      // dotted decimal 형태
      if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.)/.test(mappedPart)) return true
      if (mappedPart === '169.254.169.254') return true
      // hex 형태 (7f00:1 = 127.0.0.1, a00:1 = 10.0.0.1 등)
      // 127.x.x.x → 7f00:0 ~ 7fff:ffff
      if (/^7f/i.test(mappedPart)) return true
      // 10.x.x.x → a00:0 ~ aff:ffff
      if (/^a[0-9a-f]{1,2}:/i.test(mappedPart)) return true
      // 192.168.x.x → c0a8:0 ~ c0a8:ffff
      if (/^c0a8:/i.test(mappedPart)) return true
      // 172.16-31.x.x → ac1[0-f]:0 ~ ac1f:ffff
      if (/^ac1[0-9a-f]:/i.test(mappedPart)) return true
      // 169.254.169.254 → a9fe:a9fe
      if (mappedPart === 'a9fe:a9fe') return true
    }

    // IPv6 내부 주소 (fd00::/8 ULA, fe80::/10 link-local)
    if (/^(fd|fe80)/i.test(bareHost) || bareHost === '::') return true

    return false
  } catch {
    return true // 파싱 실패 시 안전하게 차단
  }
}

async function mcpRequest(url: string, method: string, params: Record<string, unknown> = {}): Promise<McpJsonRpcResponse> {
  if (isPrivateUrl(url)) {
    throw new Error('내부 네트워크 주소는 사용할 수 없습니다')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), MCP_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`MCP 서버 응답 오류: ${res.status} ${res.statusText}`)
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      throw new Error('MCP 서버가 JSON 응답을 반환하지 않았습니다')
    }

    const data = (await res.json()) as McpJsonRpcResponse

    if (data.error) {
      throw new Error(`MCP 오류: ${data.error.message} (code: ${data.error.code})`)
    }

    return data
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('MCP 서버 응답 시간이 초과되었습니다 (5초)')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * MCP 서버에서 도구 목록 조회
 */
export async function mcpListTools(url: string): Promise<McpToolDef[]> {
  const response = await mcpRequest(url, 'tools/list')
  const result = response.result as { tools?: McpToolDef[] } | undefined
  return result?.tools || []
}

/**
 * MCP 서버의 도구 실행 (JSON 응답 전용 — REST API, sync 채팅용)
 */
export async function mcpCallTool(
  url: string,
  toolName: string,
  args: Record<string, unknown>,
): Promise<string> {
  const response = await mcpRequest(url, 'tools/call', {
    name: toolName,
    arguments: args,
  })

  return extractTextFromResult(response.result)
}

const MCP_MAX_RESULT_SIZE = 102_400 // 100KB

function extractTextFromResult(result: unknown): string {
  const r = result as { content?: Array<{ type: string; text?: string }> } | undefined
  if (!r?.content?.length) return ''
  let text = r.content
    .filter((c) => c.type === 'text' && c.text)
    .map((c) => c.text!)
    .join('\n')
  if (text.length > MCP_MAX_RESULT_SIZE) {
    text = text.slice(0, MCP_MAX_RESULT_SIZE) + '\n\n(결과가 100KB를 초과하여 잘렸습니다)'
  }
  return text
}

/**
 * MCP 서버의 도구 실행 — SSE 스트리밍 지원
 * Content-Type에 따라 자동 분기: text/event-stream → SSE, application/json → 기존 방식
 * onProgress 콜백으로 중간 결과를 실시간 전달
 */
export async function mcpCallToolStream(
  url: string,
  toolName: string,
  args: Record<string, unknown>,
  onProgress?: (text: string) => void,
): Promise<string> {
  if (isPrivateUrl(url)) {
    throw new Error('내부 네트워크 주소는 사용할 수 없습니다')
  }

  const controller = new AbortController()
  let timeoutId = setTimeout(() => controller.abort(), MCP_STREAM_TIMEOUT_MS)

  const resetTimeout = () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => controller.abort(), MCP_STREAM_TIMEOUT_MS)
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream, application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: toolName, arguments: args },
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`MCP 서버 응답 오류: ${res.status} ${res.statusText}`)
    }

    const contentType = res.headers.get('content-type') || ''

    // JSON 응답 — 기존 방식 그대로
    if (contentType.includes('application/json')) {
      const data = (await res.json()) as McpJsonRpcResponse
      if (data.error) {
        throw new Error(`MCP 오류: ${data.error.message} (code: ${data.error.code})`)
      }
      return extractTextFromResult(data.result)
    }

    // SSE 스트리밍 응답
    if (contentType.includes('text/event-stream')) {
      return await parseSseStream(res, resetTimeout, onProgress)
    }

    throw new Error('MCP 서버가 지원되지 않는 응답 형식을 반환했습니다')
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('MCP 서버 응답 시간이 초과되었습니다 (60초)')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

async function parseSseStream(
  res: Response,
  resetTimeout: () => void,
  onProgress?: (text: string) => void,
): Promise<string> {
  if (!res.body) throw new Error('MCP 서버가 빈 응답을 반환했습니다')
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let partialText = ''
  let finalResult: string | null = null

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      resetTimeout()
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith(':') || line.trim() === '') continue // keep-alive 또는 빈 줄

        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6)
          try {
            const msg = JSON.parse(jsonStr) as McpJsonRpcResponse & { method?: string; params?: Record<string, unknown> }

            // 진행 상황 알림 (notifications/progress)
            if (msg.method === 'notifications/progress') {
              const progressData = msg.params as { progress?: number; total?: number; message?: string } | undefined
              if (progressData?.message) {
                partialText += (partialText ? '\n' : '') + progressData.message
                onProgress?.(partialText)
              }
              continue
            }

            // 최종 결과 (id가 있는 JSON-RPC 응답)
            if ('id' in msg && msg.id != null) {
              if (msg.error) {
                throw new Error(`MCP 오류: ${msg.error.message} (code: ${msg.error.code})`)
              }
              finalResult = extractTextFromResult(msg.result)
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message.startsWith('MCP 오류:')) {
              throw parseErr
            }
            // JSON 파싱 실패는 무시 (비표준 SSE 데이터)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  if (finalResult !== null) return finalResult
  if (partialText) return partialText
  return ''
}
