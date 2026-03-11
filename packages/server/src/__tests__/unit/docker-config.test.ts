import { describe, expect, test } from 'bun:test'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(import.meta.dir, '../../../../..')

describe('.dockerignore', () => {
  const content = readFileSync(resolve(ROOT, '.dockerignore'), 'utf-8')
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))

  test('필수 제외 항목 포함', () => {
    const required = [
      'node_modules',
      '.git',
      '.github',
      '.turbo',
      '_bmad*',
      '_poc/',
      '_uxui*',
      '.claude/',
      '**/__tests__/',
      '**/*.test.ts',
      '**/*.spec.ts',
    ]
    for (const pattern of required) {
      expect(lines).toContain(pattern)
    }
  })

  test('환경 파일 제외', () => {
    expect(lines).toContain('.env')
    expect(lines).toContain('.env.production')
  })

  test('개발 전용 문서 제외', () => {
    const devDocs = [
      '_enhancement-plans/',
      '_tools-idea/',
      'kodonghui_full_pipeline/',
      'README.md',
      'CLAUDE.md',
    ]
    for (const doc of devDocs) {
      expect(lines).toContain(doc)
    }
  })
})

describe('Dockerfile', () => {
  const content = readFileSync(resolve(ROOT, 'Dockerfile'), 'utf-8')

  test('파일 존재', () => {
    expect(existsSync(resolve(ROOT, 'Dockerfile'))).toBe(true)
  })

  test('멀티스테이지 빌드 사용', () => {
    const fromCount = (content.match(/^FROM /gm) || []).length
    expect(fromCount).toBeGreaterThanOrEqual(3)
  })

  test('STOPSIGNAL SIGTERM 보존', () => {
    expect(content).toContain('STOPSIGNAL SIGTERM')
  })

  test('HEALTHCHECK 설정 포함', () => {
    expect(content).toContain('HEALTHCHECK')
    expect(content).toContain('/api/health')
  })

  test('빌드 인수 (BUILD_NUMBER, GITHUB_SHA) 포함', () => {
    expect(content).toContain('ARG BUILD_NUMBER')
    expect(content).toContain('ARG GITHUB_SHA')
  })

  test('프로덕션 환경 설정', () => {
    expect(content).toContain('ENV NODE_ENV=production')
    expect(content).toContain('ENV PORT=3000')
    expect(content).toContain('EXPOSE 3000')
  })

  test('deps 스테이지에서 node_modules 재활용', () => {
    expect(content).toContain('COPY --from=deps /app/node_modules')
  })

  test('프론트엔드 빌드 결과물 복사', () => {
    expect(content).toContain('packages/app/dist ./public/app')
    expect(content).toContain('packages/admin/dist ./public/admin')
  })

  test('모든 워크스페이스 package.json 복사 (lockfile 호환성)', () => {
    const packages = ['shared', 'ui', 'app', 'admin', 'server', 'e2e']
    for (const pkg of packages) {
      expect(content).toContain(`packages/${pkg}/package.json`)
    }
  })

  test('빌드에 bun install 중복 없음 (builder에서 deps 재활용)', () => {
    // builder stage에서 bun install이 없어야 함
    const builderSection = content.split('AS builder')[1]?.split('AS production')[0] || ''
    expect(builderSection).not.toContain('bun install')
  })
})
