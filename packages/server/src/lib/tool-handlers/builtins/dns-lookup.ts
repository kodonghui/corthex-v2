import type { ToolHandler } from '../types'
import { resolve4, resolve6, resolveMx, resolveNs, resolveTxt, resolveCname } from 'node:dns/promises'

export const dnsLookup: ToolHandler = async (input) => {
  const action = String(input.action || 'lookup')
  const hostname = String(input.hostname || '')

  if (!hostname) return JSON.stringify({ success: false, message: '호스트명(hostname)을 입력하세요.' })

  // Basic hostname validation (allow subdomains, hyphens, international TLDs)
  if (!/^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$/.test(hostname) || !hostname.includes('.')) {
    return JSON.stringify({ success: false, message: '올바른 도메인 형식이 아닙니다. 예: example.com' })
  }

  const resolveRecord = async (type: string) => {
    try {
      switch (type) {
        case 'A': return await resolve4(hostname)
        case 'AAAA': return await resolve6(hostname)
        case 'MX': return await resolveMx(hostname)
        case 'NS': return await resolveNs(hostname)
        case 'TXT': return await resolveTxt(hostname)
        case 'CNAME': return await resolveCname(hostname)
        default: return []
      }
    } catch {
      return []
    }
  }

  try {
    if (action === 'lookup') {
      const ipv4 = await resolveRecord('A')
      const ipv6 = await resolveRecord('AAAA')

      return JSON.stringify({
        success: true,
        hostname,
        ipv4: ipv4 || [],
        ipv6: ipv6 || [],
      })
    }

    if (action === 'mx') {
      const records = await resolveRecord('MX')
      return JSON.stringify({ success: true, hostname, mx: records })
    }

    if (action === 'txt') {
      const records = await resolveRecord('TXT')
      return JSON.stringify({ success: true, hostname, txt: records })
    }

    if (action === 'ns') {
      const records = await resolveRecord('NS')
      return JSON.stringify({ success: true, hostname, ns: records })
    }

    if (action === 'all') {
      const [ipv4, ipv6, mx, ns, txt, cname] = await Promise.all([
        resolveRecord('A'),
        resolveRecord('AAAA'),
        resolveRecord('MX'),
        resolveRecord('NS'),
        resolveRecord('TXT'),
        resolveRecord('CNAME'),
      ])

      return JSON.stringify({
        success: true,
        hostname,
        records: { A: ipv4, AAAA: ipv6, MX: mx, NS: ns, TXT: txt, CNAME: cname },
      })
    }

    return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. lookup, mx, txt, ns, all을 사용하세요.` })
  } catch (err) {
    return JSON.stringify({ success: false, message: `DNS 조회 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}` })
  }
}
