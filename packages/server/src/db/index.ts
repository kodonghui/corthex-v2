import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { resolve } from 'path'
import { existsSync, readFileSync } from 'fs'

// 모노레포 루트의 .env 파일 수동 로드 (Bun이 packages/server에서 못 찾는 경우 대비)
function loadEnvFromRoot() {
  if (process.env.DATABASE_URL) return
  const rootEnv = resolve(import.meta.dir, '../../../../.env')
  if (existsSync(rootEnv)) {
    const content = readFileSync(rootEnv, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  }
}

loadEnvFromRoot()

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/corthex_v2'

const client = postgres(connectionString)
export const db = drizzle(client, { schema })

export { schema }
