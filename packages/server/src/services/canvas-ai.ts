/**
 * Canvas AI Service — 자연어 명령 → Mermaid 캔버스 조작
 * v1의 MCP SSE 패턴을 v2 WebSocket + LLM Router 기반으로 재구현
 */
import { llmRouter, type LLMRouterContext } from './llm-router'
import { canvasToMermaidCode, type CanvasNode, type CanvasEdge } from '@corthex/shared'
import { broadcastToCompany } from '../ws/channels'
import type { LLMRequest } from '@corthex/shared'

// === Types ===

export type CanvasAiCommandParams = {
  command: string
  graphData: { nodes: CanvasNode[]; edges: CanvasEdge[] }
  companyId: string
  userId: string
  sketchId?: string
}

export type CanvasAiResult = {
  commandId: string
  mermaid: string
  description: string
}

// === System Prompt ===

const CANVAS_AI_SYSTEM_PROMPT = `당신은 SketchVibe 캔버스 AI 어시스턴트입니다.
사용자의 현재 캔버스 상태(Mermaid 형식)와 명령을 받으면, 수정된 전체 Mermaid 코드를 반환하세요.

지원 노드 타입과 Mermaid 형태:
- start: ([라벨])
- end: ((라벨))
- agent: [라벨]
- system: [[라벨]]
- api: {{라벨}}
- decide: {라벨}
- db: [(라벨)]
- note: >라벨]

엣지 형식: A -->|라벨| B 또는 A --> B (라벨 없음)

규칙:
1. 기존 노드 ID와 라벨을 최대한 유지하고, 명령에 따라 추가/수정/삭제만 수행
2. 응답은 반드시 \`\`\`mermaid ... \`\`\` 블록 하나만 포함
3. 한국어 라벨 사용
4. flowchart TD 헤더 포함
5. 노드 ID는 영문 소문자+숫자+하이픈 (예: node1, api-server)
6. 수정 내용을 한 줄로 요약하여 마지막에 <!-- 설명: ... --> 주석으로 추가`

// === Mermaid Extraction ===

export function extractMermaidFromResponse(llmResponse: string): { mermaid: string; description: string } {
  // Extract mermaid code block
  const mermaidMatch = llmResponse.match(/```mermaid\s*\n([\s\S]*?)```/)
  const mermaid = mermaidMatch?.[1]?.trim() || ''

  // Extract description from comment
  const descMatch = llmResponse.match(/<!--\s*설명:\s*(.*?)\s*-->/)
  const description = descMatch?.[1]?.trim() || '캔버스가 수정되었습니다'

  return { mermaid, description }
}

// === Canvas AI Service ===

let commandCounter = 0

export async function interpretCanvasCommand(params: CanvasAiCommandParams): Promise<CanvasAiResult> {
  const { command, graphData, companyId, userId } = params
  const commandId = `canvas-ai-${Date.now()}-${++commandCounter}`

  // Broadcast AI start event
  broadcastToCompany(companyId, 'nexus', {
    type: 'canvas_ai_start',
    commandId,
    command,
  })

  try {
    // Convert current canvas to Mermaid
    const currentMermaid = canvasToMermaidCode(graphData.nodes, graphData.edges)

    // Build LLM request
    const request: LLMRequest = {
      model: 'claude-haiku-4-5',
      systemPrompt: CANVAS_AI_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `현재 캔버스:\n\`\`\`mermaid\n${currentMermaid}\n\`\`\`\n\n명령: ${command}`,
        },
      ],
      maxTokens: 2000,
      temperature: 0.3,
    }

    const context: LLMRouterContext = {
      companyId,
      agentId: undefined,
      agentName: 'SketchVibe AI',
      source: 'chat',
    }

    const response = await llmRouter.call(request, context)
    const { mermaid, description } = extractMermaidFromResponse(response.content)

    if (!mermaid) {
      throw new Error('LLM 응답에서 Mermaid 코드를 추출할 수 없습니다')
    }

    // Broadcast canvas update event
    broadcastToCompany(companyId, 'nexus', {
      type: 'canvas_update',
      commandId,
      mermaid,
      description,
    })

    return { commandId, mermaid, description }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)

    // Broadcast error event
    broadcastToCompany(companyId, 'nexus', {
      type: 'canvas_ai_error',
      commandId,
      error: message,
    })

    throw err
  }
}
