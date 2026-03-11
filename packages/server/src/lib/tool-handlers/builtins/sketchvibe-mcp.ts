/**
 * SketchVibe MCP 도구 핸들러 — tool-registry 브릿지
 *
 * MCP Stdio 서버의 6개 도구를 tool-registry를 통해 에이전트가 호출할 수 있게 연결.
 * callSketchVibeTool()로 실제 MCP 서버에 JSON-RPC 전달.
 */
import type { ToolHandler } from '../types'
import { callSketchVibeTool } from '../../../mcp/stdio-client'

function makeSketchVibeHandler(toolName: string): ToolHandler {
  return async (input, ctx) => {
    const args = { ...input, companyId: ctx.companyId }
    return callSketchVibeTool(toolName, args)
  }
}

export const svReadCanvas = makeSketchVibeHandler('read_canvas')
export const svAddNode = makeSketchVibeHandler('add_node')
export const svUpdateNode = makeSketchVibeHandler('update_node')
export const svDeleteNode = makeSketchVibeHandler('delete_node')
export const svAddEdge = makeSketchVibeHandler('add_edge')
export const svSaveDiagram = makeSketchVibeHandler('save_diagram')
