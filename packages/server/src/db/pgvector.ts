import { customType } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import type { AnyColumn } from 'drizzle-orm'
import { toSql as pgvectorToSql, fromSql as pgvectorFromSql } from 'pgvector'

/**
 * Drizzle ORM customType for pgvector vector(N) columns.
 * Uses pgvector npm package for serialization/deserialization.
 *
 * Usage in schema:
 *   embedding: vector('embedding', { dimensions: 768 })
 */
export const vector = customType<{
  data: number[]
  driverData: string
  config: { dimensions: number }
}>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 768})`
  },
  toDriver(value: number[]): string {
    return pgvectorToSql(value)
  },
  fromDriver(value: string): number[] {
    return pgvectorFromSql(value) as number[]
  },
})

/**
 * SQL helper: cosine distance operator (<=>).
 * Lower distance = more similar. Range: [0, 2].
 */
export function cosineDistance(column: AnyColumn, queryVector: number[]) {
  const vectorStr = pgvectorToSql(queryVector)
  return sql`${column} <=> ${vectorStr}::vector`
}

/**
 * SQL helper: L2 (Euclidean) distance operator (<->).
 */
export function l2Distance(column: AnyColumn, queryVector: number[]) {
  const vectorStr = pgvectorToSql(queryVector)
  return sql`${column} <-> ${vectorStr}::vector`
}

/**
 * SQL helper: inner product operator (<#>).
 * Note: pgvector returns negative inner product for ordering.
 */
export function innerProduct(column: AnyColumn, queryVector: number[]) {
  const vectorStr = pgvectorToSql(queryVector)
  return sql`${column} <#> ${vectorStr}::vector`
}
