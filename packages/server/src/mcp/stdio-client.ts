/**
 * MCP Stdio Client — SketchVibe MCP 서버와의 프로세스 통신
 *
 * 메인 서버에서 child_process.spawn으로 SketchVibe MCP 서버를 실행하고
 * stdin/stdout JSON-RPC 2.0으로 통신하는 클라이언트 래퍼.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

let cachedClient: Client | null = null
let cachedTransport: StdioClientTransport | null = null

/**
 * SketchVibe MCP 클라이언트 생성 (싱글턴 — 프로세스 1개만 유지)
 */
export async function getSketchVibeMcpClient(): Promise<Client> {
  if (cachedClient) return cachedClient

  const transport = new StdioClientTransport({
    command: 'bun',
    args: ['run', 'src/mcp/sketchvibe-mcp.ts'],
    cwd: new URL('../../', import.meta.url).pathname.replace(/\/$/, ''),
  })

  const client = new Client({ name: 'corthex-server', version: '1.0.0' })
  await client.connect(transport)

  cachedClient = client
  cachedTransport = transport
  return client
}

/**
 * SketchVibe MCP 도구 호출
 */
export async function callSketchVibeTool(
  toolName: string,
  args: Record<string, unknown>,
): Promise<string> {
  const client = await getSketchVibeMcpClient()
  const result = await client.callTool({ name: toolName, arguments: args })

  // Extract text from result content
  const content = result.content as Array<{ type: string; text?: string }> | undefined
  if (!content?.length) return ''
  return content
    .filter((c) => c.type === 'text' && c.text)
    .map((c) => c.text!)
    .join('\n')
}

/**
 * SketchVibe MCP 도구 목록 조회
 */
export async function listSketchVibeTools(): Promise<Array<{ name: string; description?: string }>> {
  const client = await getSketchVibeMcpClient()
  const result = await client.listTools()
  return result.tools.map((t) => ({ name: t.name, description: t.description }))
}

/**
 * MCP 클라이언트 종료 (graceful shutdown)
 */
export async function closeSketchVibeMcpClient(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
  }
  if (cachedTransport) {
    await cachedTransport.close()
    cachedTransport = null
  }
}
