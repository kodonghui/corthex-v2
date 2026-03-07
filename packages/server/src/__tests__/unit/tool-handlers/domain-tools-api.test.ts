import { describe, it, expect } from 'bun:test'
import type { ToolExecContext } from '../../../lib/tool-handlers/types'
import { companyAnalyzer } from '../../../lib/tool-handlers/builtins/company-analyzer'
import { marketOverview } from '../../../lib/tool-handlers/builtins/market-overview'
import { lawSearch } from '../../../lib/tool-handlers/builtins/law-search'
import { patentSearch } from '../../../lib/tool-handlers/builtins/patent-search'
import { securityScanner } from '../../../lib/tool-handlers/builtins/security-scanner'
import { dnsLookup } from '../../../lib/tool-handlers/builtins/dns-lookup'
import { sslChecker } from '../../../lib/tool-handlers/builtins/ssl-checker'

const mockCtxNoCredentials: ToolExecContext = {
  companyId: 'test-company',
  agentId: 'test-agent',
  sessionId: 'test-session',
  departmentId: null,
  userId: 'test-user',
  getCredentials: async () => { throw new Error('No credentials') },
}

const mockCtx: ToolExecContext = {
  ...mockCtxNoCredentials,
  getCredentials: async () => ({ api_key: 'test-key' }),
}

// ===== companyAnalyzer: credential + input validation =====
describe('companyAnalyzer', () => {
  it('returns error when credentials missing', async () => {
    const result = JSON.parse(await companyAnalyzer({ action: 'info', company: '삼성전자' }, mockCtxNoCredentials) as string)
    expect(result.success).toBe(false)
    expect(result.message).toContain('DART')
  })

  it('returns error for empty company name', async () => {
    const result = JSON.parse(await companyAnalyzer({ action: 'info', company: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for disclosures without corp_code', async () => {
    const result = JSON.parse(await companyAnalyzer({ action: 'disclosures', corp_code: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for unknown action', async () => {
    const result = JSON.parse(await companyAnalyzer({ action: 'unknown' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })
})

// ===== marketOverview: credential + input validation =====
describe('marketOverview', () => {
  it('returns error when credentials missing', async () => {
    const result = JSON.parse(await marketOverview({ action: 'domestic' }, mockCtxNoCredentials) as string)
    expect(result.success).toBe(false)
    expect(result.message).toContain('API 키')
  })

  it('returns error for search without query', async () => {
    const result = JSON.parse(await marketOverview({ action: 'search', query: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for unknown action', async () => {
    const result = JSON.parse(await marketOverview({ action: 'unknown' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })
})

// ===== lawSearch: credential + input validation =====
describe('lawSearch', () => {
  it('returns error when credentials missing', async () => {
    const result = JSON.parse(await lawSearch({ action: 'law', query: '저작권법' }, mockCtxNoCredentials) as string)
    expect(result.success).toBe(false)
    expect(result.message).toContain('법제처')
  })

  it('returns error for empty query', async () => {
    const result = JSON.parse(await lawSearch({ action: 'law', query: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for empty precedent query', async () => {
    const result = JSON.parse(await lawSearch({ action: 'precedent', query: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for unknown action', async () => {
    const result = JSON.parse(await lawSearch({ action: 'unknown' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })
})

// ===== patentSearch: credential + input validation =====
describe('patentSearch', () => {
  it('returns error when credentials missing', async () => {
    const result = JSON.parse(await patentSearch({ action: 'search', query: 'AI' }, mockCtxNoCredentials) as string)
    expect(result.success).toBe(false)
    expect(result.message).toContain('KIPRIS')
  })

  it('returns error for empty query', async () => {
    const result = JSON.parse(await patentSearch({ action: 'search', query: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for empty trademark query', async () => {
    const result = JSON.parse(await patentSearch({ action: 'trademark', query: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for unknown action', async () => {
    const result = JSON.parse(await patentSearch({ action: 'unknown' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })
})

// ===== securityScanner: input validation =====
describe('securityScanner', () => {
  it('returns error for empty package name', async () => {
    const result = JSON.parse(await securityScanner({ action: 'check_package', package: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for missing version', async () => {
    const result = JSON.parse(await securityScanner({ action: 'check_package', package: 'lodash', version: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for empty packages array', async () => {
    const result = JSON.parse(await securityScanner({ action: 'scan', packages: [] }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for unknown action', async () => {
    const result = JSON.parse(await securityScanner({ action: 'unknown' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })
})

// ===== dnsLookup: input validation =====
describe('dnsLookup', () => {
  it('returns error for empty hostname', async () => {
    const result = JSON.parse(await dnsLookup({ action: 'lookup', hostname: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for invalid hostname format', async () => {
    const result = JSON.parse(await dnsLookup({ action: 'lookup', hostname: 'not a domain' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for unknown action', async () => {
    const result = JSON.parse(await dnsLookup({ action: 'unknown', hostname: 'example.com' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })
})

// ===== sslChecker: input validation =====
describe('sslChecker', () => {
  it('returns error for empty hostname', async () => {
    const result = JSON.parse(await sslChecker({ action: 'check', hostname: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for unknown action', async () => {
    const result = JSON.parse(await sslChecker({ action: 'unknown', hostname: 'google.com' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })
})
