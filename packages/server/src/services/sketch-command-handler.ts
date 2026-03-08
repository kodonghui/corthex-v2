/**
 * Sketch Command Handler — /스케치 슬래시 명령 처리
 * 사령관실에서 AI 다이어그램 생성을 트리거
 */
import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import { commands } from '../db/schema'
import { interpretCanvasCommand } from './canvas-ai'
import { broadcastToCompany } from '../ws/channels'
import { logActivity } from '../lib/activity-logger'

export type SketchCommandParams = {
  commandId: string
  prompt: string
  companyId: string
  userId: string
}

export async function processSketchCommand(params: SketchCommandParams): Promise<void> {
  const { commandId, prompt, companyId, userId } = params

  // Empty prompt handling
  if (!prompt.trim()) {
    await db.update(commands)
      .set({
        status: 'failed',
        result: '다이어그램 설명을 입력해주세요. 예: /스케치 데이터베이스 아키텍처',
        completedAt: new Date(),
      })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

    broadcastToCompany(companyId, 'command', {
      commandId,
      event: 'FAILED',
      error: '다이어그램 설명을 입력해주세요',
    })
    return
  }

  try {
    // Call canvas-ai service (it broadcasts nexus channel events internally)
    const result = await interpretCanvasCommand({
      command: prompt,
      graphData: { nodes: [], edges: [] }, // New diagram from scratch
      companyId,
      userId,
    })

    // Store result in command record
    await db.update(commands)
      .set({
        status: 'completed',
        result: result.description,
        metadata: {
          slashType: 'sketch',
          slashArgs: prompt,
          timeoutMs: 60_000,
          sketchResult: {
            mermaid: result.mermaid,
            description: result.description,
            canvasCommandId: result.commandId,
          },
        },
        completedAt: new Date(),
      })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

    // Broadcast completion via command channel
    broadcastToCompany(companyId, 'command', {
      commandId,
      event: 'COMPLETED',
      result: result.description,
      sketchResult: {
        mermaid: result.mermaid,
        description: result.description,
      },
    })

    logActivity({
      companyId,
      type: 'system',
      phase: 'end',
      actorType: 'system',
      actorName: 'SketchVibe AI',
      userId,
      action: 'sketch_command',
      detail: `다이어그램 생성: ${prompt.slice(0, 100)}`,
      metadata: { commandId },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)

    await db.update(commands)
      .set({
        status: 'failed',
        result: `다이어그램 생성 실패: ${message}`,
        completedAt: new Date(),
      })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

    broadcastToCompany(companyId, 'command', {
      commandId,
      event: 'FAILED',
      error: message,
    })
  }
}
