/**
 * Commands List Handler — /명령어 슬래시 명령 처리
 * 전체 빌트인 명령어 + 사용자 프리셋 목록 반환
 */
import { eq, and, or } from 'drizzle-orm'
import { db } from '../db'
import { commands, presets } from '../db/schema'
import { delegationTracker } from './delegation-tracker'

// === Types ===

export type CommandsListOptions = {
  commandId: string
  companyId: string
  userId: string
}

// === Built-in Command Definitions ===

type BuiltinCommand = {
  command: string
  description: string
  usage: string
  category: string
}

const BUILTIN_COMMANDS: BuiltinCommand[] = [
  { command: '/전체', description: '모든 부서에 동시 지시', usage: '/전체 [명령]', category: '지시' },
  { command: '/순차', description: '부서 순차 협업 (릴레이)', usage: '/순차 [명령]', category: '지시' },
  { command: '/토론', description: 'AGORA 토론 (2라운드)', usage: '/토론 [주제]', category: '토론' },
  { command: '/심층토론', description: 'AGORA 심층 토론 (3라운드)', usage: '/심층토론 [주제]', category: '토론' },
  { command: '/도구점검', description: '도구 등록 현황 + 에이전트별 배정 확인', usage: '/도구점검', category: '관리' },
  { command: '/배치실행', description: '대기 중인 명령 일괄 실행', usage: '/배치실행', category: '관리' },
  { command: '/배치상태', description: '배치 작업 진행 상황 조회', usage: '/배치상태', category: '관리' },
  { command: '/스케치', description: 'AI 다이어그램 생성', usage: '/스케치 [설명]', category: '도구' },
  { command: '/명령어', description: '이 명령어 목록 표시', usage: '/명령어', category: '도움' },
]

// === Main Processing ===

export async function processCommandsList(options: CommandsListOptions): Promise<void> {
  const { commandId, companyId, userId } = options

  await db.update(commands)
    .set({ status: 'processing' })
    .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

  delegationTracker.startCommand(companyId, commandId)

  try {
    // Load user's presets + global presets
    const userPresets = await db
      .select({
        name: presets.name,
        command: presets.command,
        description: presets.description,
        category: presets.category,
      })
      .from(presets)
      .where(and(
        eq(presets.companyId, companyId),
        eq(presets.isActive, true),
        or(
          eq(presets.userId, userId),
          eq(presets.isGlobal, true),
        ),
      ))

    const report = formatCommandsListReport(BUILTIN_COMMANDS, userPresets)

    delegationTracker.completed(companyId, commandId)
    await db.update(commands)
      .set({
        status: 'completed',
        result: report,
        completedAt: new Date(),
      })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    delegationTracker.failed(companyId, commandId, errorMsg)
    await db.update(commands)
      .set({
        status: 'failed',
        result: `명령어 목록 조회 실패: ${errorMsg}`,
        completedAt: new Date(),
      })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
  }
}

// === Report Formatting ===

type PresetRow = {
  name: string
  command: string
  description: string | null
  category: string | null
}

export function formatCommandsListReport(
  builtins: BuiltinCommand[],
  userPresets: PresetRow[],
): string {
  const lines: string[] = []

  lines.push('## 📋 사용 가능한 명령어')
  lines.push('')

  // Group builtins by category
  const categories = new Map<string, BuiltinCommand[]>()
  for (const cmd of builtins) {
    if (!categories.has(cmd.category)) categories.set(cmd.category, [])
    categories.get(cmd.category)!.push(cmd)
  }

  lines.push('### 기본 명령어')
  lines.push('')
  lines.push('| 명령어 | 설명 | 사용법 |')
  lines.push('|--------|------|--------|')
  for (const cmd of builtins) {
    lines.push(`| ${cmd.command} | ${cmd.description} | \`${cmd.usage}\` |`)
  }
  lines.push('')

  // @mention section
  lines.push('### @멘션')
  lines.push('')
  lines.push('`@에이전트이름 [명령]` — 특정 에이전트에게 직접 명령')
  lines.push('')

  // User presets
  if (userPresets.length > 0) {
    lines.push(`### 내 프리셋 (${userPresets.length}개)`)
    lines.push('')
    lines.push('| 이름 | 카테고리 | 명령어 |')
    lines.push('|------|---------|--------|')
    for (const preset of userPresets) {
      const cat = preset.category || '일반'
      const cmdText = preset.command.length > 50
        ? preset.command.slice(0, 50) + '...'
        : preset.command
      lines.push(`| ${preset.name} | ${cat} | ${cmdText} |`)
    }
  } else {
    lines.push('### 내 프리셋')
    lines.push('')
    lines.push('등록된 프리셋이 없습니다. 사령관실에서 프리셋을 추가하세요.')
  }

  lines.push('')
  lines.push('---')
  lines.push('일반 텍스트 입력 시 비서실장이 자동으로 적합한 부서에 라우팅합니다.')

  return lines.join('\n')
}
