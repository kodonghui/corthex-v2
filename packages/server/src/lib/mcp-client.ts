/**
 * MCP (Model Context Protocol) 클라이언트
 *
 * Streamable HTTP 전송 방식으로 MCP 서버와 JSON-RPC 2.0 통신
 * - tools/list: 서버의 도구 목록 조회
 * - tools/call: 도구 실행
 */

const MCP_TIMEOUT_MS = 5_000

type McpToolDef = {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

type McpJsonRpcResponse = {
  jsonrpc: string
  id: number
  result?: unknown
  error?: { code: number; message: string }
}

// SSRF 방지: 내부 네트워크 IP 차단
export function isPrivateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '[::]') return false // localhost는 개발용 허용
    if (host === '169.254.169.254') return true // AWS metadata
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(host)) return true
    return false
  } catch {
    return false
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
 * MCP 서버의 도구 실행
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

  const result = response.result as { content?: Array<{ type: string; text?: string }> } | undefined
  if (!result?.content?.length) return ''

  // text 타입 콘텐츠를 합쳐서 반환
  return result.content
    .filter((c) => c.type === 'text' && c.text)
    .map((c) => c.text!)
    .join('\n')
}
