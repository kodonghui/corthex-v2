import { describe, test, expect } from 'bun:test'
import { execSync } from 'child_process'
import { existsSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

const projectRoot = join(import.meta.dir, '../../../../..')

describe('Engine 경계 검증 (E8, E10)', () => {
  test('engine-boundary-check.sh 스크립트 존재', () => {
    const scriptPath = join(projectRoot, '.github/scripts/engine-boundary-check.sh')
    expect(existsSync(scriptPath)).toBe(true)
  })

  test('경계 검증 스크립트 실행 성공 (exit 0)', () => {
    const result = execSync('bash .github/scripts/engine-boundary-check.sh', {
      cwd: projectRoot,
      encoding: 'utf8',
    })
    expect(result).toContain('No engine boundary violations')
  })

  test('routes/에서 engine/hooks/ import 없음', () => {
    const output = execSync(
      'grep -rn "from.*engine/hooks/" packages/server/src/routes/ 2>/dev/null || true',
      { cwd: projectRoot, encoding: 'utf8' }
    )
    expect(output.trim()).toBe('')
  })

  test('lib/에서 engine 내부 모듈 import 없음', () => {
    const output = execSync(
      'grep -rn "from.*engine/\\(hooks\\|soul-renderer\\|model-selector\\|sse-adapter\\)" packages/server/src/lib/ 2>/dev/null || true',
      { cwd: projectRoot, encoding: 'utf8' }
    )
    expect(output.trim()).toBe('')
  })
})

describe('TEA P0: deploy.yml에 경계 검증 step 포함', () => {
  test('deploy.yml에 engine-boundary-check 실행 step 존재', () => {
    const yml = readFileSync(join(projectRoot, '.github/workflows/deploy.yml'), 'utf8')
    expect(yml).toContain('engine-boundary-check.sh')
    expect(yml).toContain('Engine boundary check')
  })
})

describe('TEA P1: 스크립트 실행 권한', () => {
  test('engine-boundary-check.sh에 실행 권한 있음', () => {
    const scriptPath = join(projectRoot, '.github/scripts/engine-boundary-check.sh')
    const stat = statSync(scriptPath)
    const isExecutable = (stat.mode & 0o111) !== 0
    expect(isExecutable).toBe(true)
  })
})

describe('TEA P1: middleware/ 디렉토리도 검색 대상', () => {
  test('스크립트에 middleware/ 경로 포함', () => {
    const source = readFileSync(
      join(projectRoot, '.github/scripts/engine-boundary-check.sh'), 'utf8'
    )
    expect(source).toContain('middleware/')
  })
})
