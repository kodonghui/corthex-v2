/**
 * DB Reset & Seed — Safe database reset for development/testing
 * 
 * Usage: bun packages/server/src/db/reset-and-seed.ts [--keep-admin]
 * 
 * What it does:
 * 1. Saves admin_users (superadmin)
 * 2. Enables pgvector extension
 * 3. Truncates ALL tables (CASCADE)
 * 4. Restores admin_users
 * 5. Adds any missing columns (schema drift fix)
 * 6. Runs seed data (company, CEO, departments, agents, tools)
 * 
 * This prevents the "TRUNCATE kills migrations" problem.
 */

import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(import.meta.dir, '../../../../.env') })

const DB_URL = process.env.DATABASE_URL
if (!DB_URL) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

const sql = neon(DB_URL)
const keepAdmin = process.argv.includes('--keep-admin')

async function main() {
  console.log('=== DB Reset & Seed ===\n')

  // 1. Save admin users
  const savedAdmins = await sql`SELECT * FROM admin_users WHERE role = 'superadmin'`
  console.log(`1. Saved ${savedAdmins.length} superadmin(s)`)

  // 2. Enable pgvector
  try {
    await sql.query(`CREATE EXTENSION IF NOT EXISTS vector`)
    console.log('2. pgvector extension enabled')
  } catch (e: any) {
    console.log(`2. pgvector: ${e.message}`)
  }

  // 3. Get all tables and truncate
  const tables = await sql`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT IN ('drizzle_migrations', '__drizzle_migrations')
    ORDER BY tablename
  `
  const tableList = tables.map((t: any) => `"${t.tablename}"`).join(', ')
  console.log(`3. Truncating ${tables.length} tables...`)
  await sql.query(`TRUNCATE ${tableList} CASCADE`)
  console.log('   All tables truncated')

  // 4. Restore admin users
  for (const admin of savedAdmins) {
    await sql`
      INSERT INTO admin_users (id, company_id, username, password_hash, name, email, role, is_active, created_at)
      VALUES (${admin.id}, ${admin.company_id}, ${admin.username}, ${admin.password_hash}, 
              ${admin.name}, ${admin.email}, ${admin.role}, ${admin.is_active}, ${admin.created_at})
    `
  }
  console.log(`4. Restored ${savedAdmins.length} superadmin(s)`)

  // 5. Fix schema drift — add missing columns that drizzle-kit push can't handle after truncate
  const schemaFixes = [
    // agents table
    ['agents', 'personality_traits', 'ALTER TABLE agents ADD COLUMN IF NOT EXISTS personality_traits jsonb'],
    ['agents', 'observations_count', 'ALTER TABLE agents ADD COLUMN IF NOT EXISTS observations_count integer NOT NULL DEFAULT 0'],
    ['agents', 'capabilities_score', 'ALTER TABLE agents ADD COLUMN IF NOT EXISTS capabilities_score real'],
    ['agents', 'last_reflection_at', 'ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_reflection_at timestamp'],
    // knowledge_docs
    ['knowledge_docs', 'embedding', 'ALTER TABLE knowledge_docs ADD COLUMN IF NOT EXISTS embedding vector(1024)'],
    ['knowledge_docs', 'embedding_model', 'ALTER TABLE knowledge_docs ADD COLUMN IF NOT EXISTS embedding_model text'],
    ['knowledge_docs', 'embedded_at', 'ALTER TABLE knowledge_docs ADD COLUMN IF NOT EXISTS embedded_at timestamp'],
    ['knowledge_docs', 'linked_sketch_id', 'ALTER TABLE knowledge_docs ADD COLUMN IF NOT EXISTS linked_sketch_id uuid'],
    // agent_memories
    ['agent_memories', 'embedding', 'ALTER TABLE agent_memories ADD COLUMN IF NOT EXISTS embedding vector(1024)'],
    ['agent_memories', 'category', 'ALTER TABLE agent_memories ADD COLUMN IF NOT EXISTS category text'],
    ['agent_memories', 'observation_ids', 'ALTER TABLE agent_memories ADD COLUMN IF NOT EXISTS observation_ids jsonb'],
  ]

  // Create missing tables
  const missingTables = [
    `CREATE TABLE IF NOT EXISTS observations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      session_id uuid, task_execution_id text, content text NOT NULL,
      domain text, outcome text, tool_used text, importance integer, confidence integer,
      embedding vector(1024), reflected boolean DEFAULT false, reflected_at timestamp,
      flagged boolean DEFAULT false, observed_at timestamp DEFAULT now(),
      created_at timestamp DEFAULT now(), updated_at timestamp DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS capability_evaluations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      overall_score real, dimensions jsonb, observation_count integer DEFAULT 0,
      memory_count integer DEFAULT 0, evaluated_at timestamp DEFAULT now(), created_at timestamp DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS tool_call_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id uuid NOT NULL REFERENCES companies(id),
      agent_id uuid REFERENCES agents(id),
      run_id text NOT NULL, tool_name text NOT NULL,
      started_at timestamp NOT NULL, completed_at timestamp,
      success boolean, error_code text, duration_ms integer
    )`,
    `CREATE TABLE IF NOT EXISTS semantic_cache (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id uuid NOT NULL, query_text text NOT NULL,
      query_embedding vector(1024), response text NOT NULL,
      ttl_hours integer DEFAULT 24, created_at timestamp DEFAULT now()
    )`,
  ]

  let fixed = 0
  for (const [table, col, stmt] of schemaFixes) {
    try {
      const existing = await sql`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = ${table} AND column_name = ${col}
      `
      if (existing.length === 0) {
        await sql.query(stmt)
        fixed++
        console.log(`   + Added ${table}.${col}`)
      }
    } catch (e: any) {
      console.log(`   ! ${table}.${col}: ${e.message}`)
    }
  }

  for (const ddl of missingTables) {
    try {
      await sql.query(ddl)
      const name = ddl.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1]
      console.log(`   + Ensured table: ${name}`)
    } catch (e: any) {
      console.log(`   ! Table: ${e.message}`)
    }
  }
  console.log(`5. Schema drift fixes: ${fixed} columns added`)

  // 6. Verify
  const checkAdmins = await sql`SELECT username, role FROM admin_users`
  const checkCompanies = await sql`SELECT COUNT(*) as cnt FROM companies`
  console.log(`\n=== Verification ===`)
  console.log(`admin_users: ${checkAdmins.length} (${checkAdmins.map((a: any) => a.username).join(', ')})`)
  console.log(`companies: ${checkCompanies[0].cnt}`)
  console.log(`\nDB reset complete. Run 'bun packages/server/src/db/seed.ts' to seed data.`)
  console.log(`Or use admin panel onboarding to set up fresh.`)
}

main().catch((err) => {
  console.error('Reset failed:', err)
  process.exit(1)
})
