/**
 * SketchVibe MCP 도구 핸들러 — tool-registry 브릿지
 *
 * MCP Stdio 서버의 6개 도구를 tool-registry를 통해 에이전트가 호출할 수 있게 연결.
 * callSketchVibeTool()로 실제 MCP 서버에 JSON-RPC 전달.
 * mutation 도구(add_node, update_node, delete_node, add_edge)는 WebSocket으로 실시간 브로드캐스트.
 */
import type { ToolHandler } from '../types'
import { callSketchVibeTool } from '../../../mcp/stdio-client'
import { broadcastToCompany } from '../../../ws/channels'

const MUTATION_TOOLS = new Set(['add_node', 'update_node', 'delete_node', 'add_edge'])

function makeSketchVibeHandler(toolName: string): ToolHandler {
  return async (input, ctx) => {
    const args = { ...input, companyId: ctx.companyId }
    const result = await callSketchVibeTool(toolName, args)

    // Mutation 도구는 결과의 mermaid를 WebSocket nexus 채널로 브로드캐스트
    if (MUTATION_TOOLS.has(toolName) && result) {
      try {
        const parsed = JSON.parse(result)
        if (parsed.mermaid) {
          broadcastToCompany(ctx.companyId, 'nexus', {
            type: 'canvas_mcp_update',
            mermaid: parsed.mermaid,
            toolName,
            description: `MCP ${toolName}: ${parsed.nodeId || parsed.edgeId || parsed.deletedNode || ''}`,
          })
        }
      } catch {
        // MCP 응답이 비정상 JSON일 때 브로드캐스트 건너뜀 (방어 코드)
      }
    }

    return result
  }
}

export const svReadCanvas = makeSketchVibeHandler('read_canvas')
export const svAddNode = makeSketchVibeHandler('add_node')
export const svUpdateNode = makeSketchVibeHandler('update_node')
export const svDeleteNode = makeSketchVibeHandler('delete_node')
export const svAddEdge = makeSketchVibeHandler('add_edge')
export const svSaveDiagram = makeSketchVibeHandler('save_diagram')
