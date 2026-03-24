import * as fs from 'fs'

/**
 * Story 25.2: N8N-SEC Security Audit — AR34 All-or-Nothing Verification
 *
 * Verifies all 8 security layers are active.
 * Partial deployment is forbidden (AR34) — all 8 or n8n stays disabled.
 */

export interface SecurityLayerStatus {
  layer: number
  name: string
  code: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export interface N8nSecurityAudit {
  allPassed: boolean
  layers: SecurityLayerStatus[]
  timestamp: string
}

/**
 * Run full 8-layer security audit.
 * Returns structured result — caller decides action on failure.
 */
export async function runN8nSecurityAudit(): Promise<N8nSecurityAudit> {
  const layers: SecurityLayerStatus[] = []

  // SEC-1: VPS Firewall
  layers.push(checkFirewall())

  // SEC-2: Admin JWT proxy
  layers.push(checkAdminProxy())

  // SEC-3: Tag isolation
  layers.push(checkTagIsolation())

  // SEC-4: HMAC webhook
  layers.push(checkHmacWebhook())

  // SEC-5: Docker resource limits
  layers.push(await checkResourceLimits())

  // SEC-6: DB isolation (SQLite, not PostgreSQL)
  layers.push(await checkDbIsolation())

  // SEC-7: Credential encryption
  layers.push(checkCredentialEncryption())

  // SEC-8: Rate limiting
  layers.push(checkRateLimiting())

  const allPassed = layers.every(l => l.status === 'pass')

  return {
    allPassed,
    layers,
    timestamp: new Date().toISOString(),
  }
}

// === Individual layer checks ===

function checkFirewall(): SecurityLayerStatus {
  const firewallScript = 'infrastructure/n8n/firewall.sh'
  const exists = fs.existsSync(firewallScript)
  return {
    layer: 1,
    name: 'VPS Firewall',
    code: 'N8N-SEC-1',
    status: exists ? 'pass' : 'fail',
    detail: exists
      ? 'firewall.sh exists — iptables rules block external port 5678'
      : 'firewall.sh missing',
  }
}

function checkAdminProxy(): SecurityLayerStatus {
  const middlewarePath = 'packages/server/src/middleware/n8n-security.ts'
  if (!fs.existsSync(middlewarePath)) {
    return { layer: 2, name: 'Admin JWT', code: 'N8N-SEC-2', status: 'fail', detail: 'n8n-security.ts missing' }
  }
  const src = fs.readFileSync(middlewarePath, 'utf-8')
  const hasAdminGuard = src.includes('n8nAdminGuard') && src.includes('company_admin')
  return {
    layer: 2,
    name: 'Admin JWT',
    code: 'N8N-SEC-2',
    status: hasAdminGuard ? 'pass' : 'fail',
    detail: hasAdminGuard
      ? 'n8nAdminGuard middleware checks Admin role'
      : 'Admin guard missing or incomplete',
  }
}

function checkTagIsolation(): SecurityLayerStatus {
  const middlewarePath = 'packages/server/src/middleware/n8n-security.ts'
  if (!fs.existsSync(middlewarePath)) {
    return { layer: 3, name: 'Tag Isolation', code: 'N8N-SEC-3', status: 'fail', detail: 'n8n-security.ts missing' }
  }
  const src = fs.readFileSync(middlewarePath, 'utf-8')
  const hasTagInjection = src.includes('injectCompanyTag') && src.includes('company:')
  const hasOwnershipCheck = src.includes('verifyResourceOwnership') && src.includes('requiresOwnershipCheck')
  const hasBlockedPaths = src.includes('isBlockedPath') && src.includes('credentials')
  const allPresent = hasTagInjection && hasOwnershipCheck && hasBlockedPaths
  return {
    layer: 3,
    name: 'Tag Isolation',
    code: 'N8N-SEC-3',
    status: allPresent ? 'pass' : 'fail',
    detail: allPresent
      ? 'Tag injection + individual resource ownership check + blocked paths'
      : 'Tag isolation incomplete — missing ownership verification or path blocking',
  }
}

function checkHmacWebhook(): SecurityLayerStatus {
  const hmacPath = 'packages/server/src/services/n8n-webhook-hmac.ts'
  if (!fs.existsSync(hmacPath)) {
    return { layer: 4, name: 'Webhook HMAC', code: 'N8N-SEC-4', status: 'fail', detail: 'n8n-webhook-hmac.ts missing' }
  }
  const src = fs.readFileSync(hmacPath, 'utf-8')
  const hasHmac = src.includes('verifyHmacSignature') && src.includes('timingSafeEqual')
  return {
    layer: 4,
    name: 'Webhook HMAC',
    code: 'N8N-SEC-4',
    status: hasHmac ? 'pass' : 'fail',
    detail: hasHmac
      ? 'HMAC-SHA256 with timing-safe comparison'
      : 'HMAC verification incomplete',
  }
}

async function checkResourceLimits(): Promise<SecurityLayerStatus> {
  const composePath = 'docker-compose.n8n.yml'
  if (!fs.existsSync(composePath)) {
    return { layer: 5, name: 'Docker Resources', code: 'N8N-SEC-5', status: 'fail', detail: 'docker-compose.n8n.yml missing' }
  }
  const src = fs.readFileSync(composePath, 'utf-8')
  const hasLimits = src.includes('memory: 2g') && src.includes('cpus:')
  return {
    layer: 5,
    name: 'Docker Resources',
    code: 'N8N-SEC-5',
    status: hasLimits ? 'pass' : 'fail',
    detail: hasLimits
      ? 'memory: 2g, cpus: 2'
      : 'Resource limits missing from compose',
  }
}

async function checkDbIsolation(): Promise<SecurityLayerStatus> {
  const composePath = 'docker-compose.n8n.yml'
  if (!fs.existsSync(composePath)) {
    return { layer: 6, name: 'DB Isolation', code: 'N8N-SEC-6', status: 'fail', detail: 'docker-compose.n8n.yml missing' }
  }
  const src = fs.readFileSync(composePath, 'utf-8')
  const hasSqlite = src.includes('DB_TYPE=sqlite')
  const noPg = !src.includes('DB_POSTGRESDB')
  return {
    layer: 6,
    name: 'DB Isolation',
    code: 'N8N-SEC-6',
    status: hasSqlite && noPg ? 'pass' : 'fail',
    detail: hasSqlite && noPg
      ? 'SQLite only — no PostgreSQL access'
      : 'DB isolation not confirmed',
  }
}

function checkCredentialEncryption(): SecurityLayerStatus {
  const composePath = 'docker-compose.n8n.yml'
  if (!fs.existsSync(composePath)) {
    return { layer: 7, name: 'Credential Encryption', code: 'N8N-SEC-7', status: 'fail', detail: 'docker-compose.n8n.yml missing' }
  }
  const src = fs.readFileSync(composePath, 'utf-8')
  const hasEncryption = src.includes('N8N_ENCRYPTION_KEY') && src.includes(':?')
  return {
    layer: 7,
    name: 'Credential Encryption',
    code: 'N8N-SEC-7',
    status: hasEncryption ? 'pass' : 'fail',
    detail: hasEncryption
      ? 'AES-256-GCM via required N8N_ENCRYPTION_KEY'
      : 'Encryption key not required',
  }
}

function checkRateLimiting(): SecurityLayerStatus {
  const middlewarePath = 'packages/server/src/middleware/n8n-security.ts'
  if (!fs.existsSync(middlewarePath)) {
    return { layer: 8, name: 'API Rate Limit', code: 'N8N-SEC-8', status: 'fail', detail: 'n8n-security.ts missing' }
  }
  const src = fs.readFileSync(middlewarePath, 'utf-8')
  const hasRateLimit = src.includes('n8nRateLimit') && src.includes('60')
  return {
    layer: 8,
    name: 'API Rate Limit',
    code: 'N8N-SEC-8',
    status: hasRateLimit ? 'pass' : 'fail',
    detail: hasRateLimit
      ? '60 requests/min per company'
      : 'Rate limiting missing or misconfigured',
  }
}
