import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const pkgPath = resolve(__dirname, '../../package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

describe('packages/office workspace setup', () => {
  test('package.json has correct name', () => {
    expect(pkg.name).toBe('@corthex/office')
  })

  test('package.json is private', () => {
    expect(pkg.private).toBe(true)
  })

  test('pixi.js is pinned in dependencies (no ^)', () => {
    const pixiVersion = pkg.dependencies['pixi.js']
    expect(pixiVersion).toBeDefined()
    expect(pixiVersion.startsWith('^')).toBe(false)
    expect(pixiVersion.startsWith('~')).toBe(false)
  })

  test('react and react-dom are in dependencies', () => {
    expect(pkg.dependencies['react']).toBeDefined()
    expect(pkg.dependencies['react-dom']).toBeDefined()
  })

  test('typescript and vite are in devDependencies', () => {
    expect(pkg.devDependencies['typescript']).toBeDefined()
    expect(pkg.devDependencies['vite']).toBeDefined()
    expect(pkg.devDependencies['@vitejs/plugin-react']).toBeDefined()
  })

  test('build script includes tsc', () => {
    expect(pkg.scripts.build).toContain('tsc')
  })

  test('OfficeCanvas component exports correctly', async () => {
    const mod = await import('../components/OfficeCanvas')
    expect(mod.OfficeCanvas).toBeDefined()
    expect(typeof mod.OfficeCanvas).toBe('function')
  })

  test('App component exports correctly', async () => {
    const mod = await import('../App')
    expect(mod.App).toBeDefined()
    expect(typeof mod.App).toBe('function')
  })
})
