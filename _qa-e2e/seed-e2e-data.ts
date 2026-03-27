/**
 * E2E Test Data Seed Script
 * Reduces SKIP rate by creating prerequisite data (online agent, folders, schedules, notifications)
 * Run: bun run _qa-e2e/seed-e2e-data.ts
 */

const BASE = process.env.API_BASE || 'http://localhost:3000/api'

async function api(path: string, token: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options?.headers },
  })
  const body = await res.json()
  if (!res.ok) throw new Error(`${res.status} ${path}: ${JSON.stringify(body)}`)
  return body
}

async function main() {
  console.log('=== E2E Seed Start ===')

  // 1. Admin login
  const adminLogin = await api('/auth/admin/login', '', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'admin1234' }),
  })
  const adminToken = adminLogin.data.token
  const companyId = adminLogin.data.user.companyId
  console.log('  OK admin login, companyId:', companyId)

  // 2. User login (for workspace APIs)
  const userLogin = await api('/auth/login', '', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'admin1234' }),
  })
  const userToken = userLogin.data.token
  console.log('  OK user login')

  // 3. Set first agent to online
  const agentsRes = await api(`/admin/agents?companyId=${companyId}`, adminToken)
  const agents = agentsRes.data || []
  if (agents.length > 0) {
    const agent = agents[0]
    await api(`/admin/agents/${agent.id}`, adminToken, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'online' }),
    })
    console.log(`  OK agent "${agent.name}" set to online`)

    // 4. Create knowledge folder + doc
    try {
      const folder = await api('/workspace/knowledge/folders', userToken, {
        method: 'POST',
        body: JSON.stringify({ name: 'E2E Test Folder', description: 'Auto-created for E2E testing' }),
      })
      console.log('  OK folder:', folder.data?.id)

      await api('/workspace/knowledge/docs', userToken, {
        method: 'POST',
        body: JSON.stringify({
          folderId: folder.data?.id,
          title: 'E2E Test Document',
          content: '# E2E Test\nThis document was auto-created for E2E testing.',
          contentType: 'markdown',
        }),
      })
      console.log('  OK doc created')
    } catch (e) {
      console.log('  SKIP folder/doc:', (e as Error).message)
    }

    // 5. Create scheduled job
    try {
      await api('/workspace/jobs/schedules', userToken, {
        method: 'POST',
        body: JSON.stringify({
          name: 'E2E Test Schedule',
          agentId: agent.id,
          instruction: 'E2E 테스트용 스케줄 작업입니다',
          frequency: 'daily',
          time: '09:00',
        }),
      })
      console.log('  OK schedule created')
    } catch (e) {
      console.log('  SKIP schedule:', (e as Error).message)
    }
  } else {
    console.log('  WARN no agents found')
  }

  console.log('=== E2E Seed Complete ===')
}

main().catch(console.error)
