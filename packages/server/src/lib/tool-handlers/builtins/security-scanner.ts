import type { ToolHandler } from '../types'

const OSV_API = 'https://api.osv.dev/v1/query'

type OsvVulnerability = {
  id?: string
  summary?: string
  details?: string
  severity?: { type: string; score: string }[]
  references?: { type: string; url: string }[]
  affected?: { package?: { name: string; ecosystem: string }; ranges?: { events: { introduced?: string; fixed?: string }[] }[] }[]
}

type OsvResponse = {
  vulns?: OsvVulnerability[]
}

async function queryOsv(packageName: string, version: string, ecosystem: string): Promise<OsvResponse> {
  const res = await fetch(OSV_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      package: { name: packageName, ecosystem },
      version,
    }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`OSV API 오류: ${res.status}`)
  return (await res.json()) as OsvResponse
}

export const securityScanner: ToolHandler = async (input) => {
  const action = String(input.action || 'check_package')

  if (action === 'check_package') {
    const pkg = String(input.package || '')
    const version = String(input.version || '')
    const ecosystem = String(input.ecosystem || 'npm')

    if (!pkg) return JSON.stringify({ success: false, message: '패키지명(package)을 입력하세요.' })
    if (!version) return JSON.stringify({ success: false, message: '버전(version)을 입력하세요.' })

    try {
      const data = await queryOsv(pkg, version, ecosystem)
      const vulns = (data.vulns || []).map((v) => ({
        id: v.id || '',
        summary: v.summary || '',
        severity: v.severity?.[0]?.score || 'UNKNOWN',
        fixedIn: v.affected?.[0]?.ranges?.[0]?.events?.find((e) => e.fixed)?.fixed || '미확인',
        reference: v.references?.[0]?.url || '',
      }))

      return JSON.stringify({
        success: true,
        package: pkg,
        version,
        ecosystem,
        vulnerabilities: vulns,
        vulnerabilityCount: vulns.length,
        status: vulns.length === 0 ? '안전' : `${vulns.length}개 취약점 발견`,
      })
    } catch (err) {
      return JSON.stringify({ success: false, message: `취약점 검사 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}` })
    }
  }

  if (action === 'scan') {
    const packages = input.packages
    if (!Array.isArray(packages) || packages.length === 0) {
      return JSON.stringify({ success: false, message: '패키지 배열(packages)을 입력하세요. 형식: [{ name, version, ecosystem? }]' })
    }

    const results = await Promise.allSettled(
      packages.slice(0, 20).map(async (pkg: unknown) => {
        const p = pkg as Record<string, string>
        const name = String(p?.name || '')
        const version = String(p?.version || '')
        const ecosystem = String(p?.ecosystem || 'npm')

        if (!name || !version) return { package: name, version, error: '이름과 버전 필수' }

        try {
          const data = await queryOsv(name, version, ecosystem)
          return {
            package: name,
            version,
            vulnerabilityCount: (data.vulns || []).length,
            status: (data.vulns || []).length === 0 ? '안전' : '취약점 발견',
          }
        } catch {
          return { package: name, version, error: 'API 호출 실패' }
        }
      }),
    )

    const items = results.map((r) => (r.status === 'fulfilled' ? r.value : { package: '?', version: '?', error: '처리 실패' }))
    const vulnerableCount = items.filter((i) => 'vulnerabilityCount' in i && (i as { vulnerabilityCount: number }).vulnerabilityCount > 0).length

    return JSON.stringify({
      success: true,
      results: items,
      summary: { total: items.length, vulnerable: vulnerableCount, safe: items.length - vulnerableCount },
    })
  }

  return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. check_package 또는 scan을 사용하세요.` })
}
