import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

const serverSrc = join(import.meta.dir, '../../../src')
const engineIndexPath = join(serverSrc, 'engine/index.ts')

describe('engine/index.ts barrel (E8 public API)', () => {
  test('engine/index.ts 파일 존재', () => {
    const content = readFileSync(engineIndexPath, 'utf8')
    expect(content.length).toBeGreaterThan(0)
  })

  test('runAgent, collectAgentResponse, getActiveSessions 공개 export', () => {
    const content = readFileSync(engineIndexPath, 'utf8')
    expect(content).toContain('runAgent')
    expect(content).toContain('collectAgentResponse')
    expect(content).toContain('getActiveSessions')
  })

  test('renderSoul 공개 export', () => {
    const content = readFileSync(engineIndexPath, 'utf8')
    expect(content).toContain('renderSoul')
  })

  test('selectModel, selectModelFromDB 공개 export', () => {
    const content = readFileSync(engineIndexPath, 'utf8')
    expect(content).toContain('selectModel')
    expect(content).toContain('selectModelFromDB')
  })

  test('sseStream 공개 export', () => {
    const content = readFileSync(engineIndexPath, 'utf8')
    expect(content).toContain('sseStream')
  })

  test('SessionContext, SSEEvent, RunAgentOptions 타입 export', () => {
    const content = readFileSync(engineIndexPath, 'utf8')
    expect(content).toContain('SessionContext')
    expect(content).toContain('SSEEvent')
    expect(content).toContain('RunAgentOptions')
  })

  test('내부 구현만 re-export — 비즈니스 로직 없음', () => {
    const content = readFileSync(engineIndexPath, 'utf8')
    // barrel should only have export lines, no function bodies
    const lines = content.split('\n').filter(l => l.trim() && !l.trim().startsWith('*') && !l.trim().startsWith('/') && !l.trim().startsWith('/*'))
    for (const line of lines) {
      expect(line.trim()).toMatch(/^export/)
    }
  })
})

describe('E8 경계 위반 없음 — services/ tool-handlers/ 포함', () => {
  const projectRoot = join(import.meta.dir, '../../../../..')

  test('services/에 soul-renderer 직접 import 없음', () => {
    const out = execSync(
      'grep -rn "from.*engine/soul-renderer" packages/server/src/services/ 2>/dev/null || true',
      { cwd: projectRoot, encoding: 'utf8' }
    )
    expect(out.trim()).toBe('')
  })

  test('services/에 model-selector 직접 import 없음', () => {
    const out = execSync(
      'grep -rn "from.*engine/model-selector" packages/server/src/services/ 2>/dev/null || true',
      { cwd: projectRoot, encoding: 'utf8' }
    )
    expect(out.trim()).toBe('')
  })

  test('tool-handlers/에 soul-renderer 직접 import 없음', () => {
    const out = execSync(
      'grep -rn "from.*engine/soul-renderer" packages/server/src/tool-handlers/ 2>/dev/null || true',
      { cwd: projectRoot, encoding: 'utf8' }
    )
    expect(out.trim()).toBe('')
  })

  test('routes/에 soul-renderer 직접 import 없음', () => {
    const out = execSync(
      'grep -rn "from.*engine/soul-renderer" packages/server/src/routes/ 2>/dev/null || true',
      { cwd: projectRoot, encoding: 'utf8' }
    )
    expect(out.trim()).toBe('')
  })

  test('engine-boundary-check.sh에 services/, tool-handlers/ 포함', () => {
    const script = readFileSync(
      join(projectRoot, '.github/scripts/engine-boundary-check.sh'), 'utf8'
    )
    expect(script).toContain('services/')
    expect(script).toContain('tool-handlers/')
  })

  test('engine-boundary-check.sh 실행 성공', () => {
    const result = execSync('bash .github/scripts/engine-boundary-check.sh', {
      cwd: projectRoot,
      encoding: 'utf8',
    })
    expect(result).toContain('No engine boundary violations')
  })
})
