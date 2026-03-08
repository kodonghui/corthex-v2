import type { ToolHandler } from '../types'

const SEC_HEADERS = {
  'User-Agent': 'CORTHEX/2.0 (admin@corthex.io)',
  'Accept': 'application/json',
}

type EdgarSearchResponse = {
  hits?: {
    hits?: Array<{
      _source?: {
        file_date?: string
        display_date_filed?: string
        form_type?: string
        entity_name?: string
        file_num?: string
        period_of_report?: string
        file_description?: string
      }
      _id?: string
    }>
    total?: { value?: number }
  }
}

type EdgarFilingsResponse = {
  recent?: {
    accessionNumber?: string[]
    filingDate?: string[]
    reportDate?: string[]
    form?: string[]
    primaryDocument?: string[]
    primaryDocDescription?: string[]
  }
  filings?: {
    recent?: {
      accessionNumber?: string[]
      filingDate?: string[]
      reportDate?: string[]
      form?: string[]
      primaryDocument?: string[]
      primaryDocDescription?: string[]
    }
  }
}

type CompanyTicker = {
  cik_str: number
  ticker: string
  title: string
}

export const secEdgar: ToolHandler = async (input) => {
  const action = String(input.action || 'filings')

  try {
    if (action === 'filings') {
      const ticker = String(input.ticker || '').toUpperCase()
      if (!ticker) return JSON.stringify({ success: false, message: '티커(ticker)가 필요합니다. (예: AAPL)' })

      const formType = String(input.formType || '')
      const count = Number(input.count || 10)

      // Get CIK from ticker
      const cik = await getCikFromTicker(ticker)
      if (!cik) return JSON.stringify({ success: false, message: `${ticker} 종목의 CIK를 찾을 수 없습니다.` })

      // Fetch filings from EDGAR
      const cikPadded = String(cik).padStart(10, '0')
      const res = await fetch(`https://data.sec.gov/submissions/CIK${cikPadded}.json`, {
        headers: SEC_HEADERS,
        signal: AbortSignal.timeout(15_000),
      })

      if (!res.ok) return JSON.stringify({ success: false, message: `SEC EDGAR API 오류: ${res.status}` })

      const data = (await res.json()) as EdgarFilingsResponse
      const recent = data.recent || data.filings?.recent || {}

      const forms = recent.form || []
      const dates = recent.filingDate || []
      const reportDates = recent.reportDate || []
      const accessions = recent.accessionNumber || []
      const docs = recent.primaryDocument || []
      const descs = recent.primaryDocDescription || []

      let filings: Array<{
        formType: string
        filingDate: string
        reportDate: string
        accessionNumber: string
        document: string
        description: string
        url: string
      }> = []

      for (let i = 0; i < forms.length && filings.length < count; i++) {
        if (formType && forms[i] !== formType) continue
        const accNo = (accessions[i] || '').replace(/-/g, '')
        filings.push({
          formType: forms[i] || '',
          filingDate: dates[i] || '',
          reportDate: reportDates[i] || '',
          accessionNumber: accessions[i] || '',
          document: docs[i] || '',
          description: descs[i] || '',
          url: accNo && docs[i]
            ? `https://www.sec.gov/Archives/edgar/data/${cik}/${accNo}/${docs[i]}`
            : '',
        })
      }

      return JSON.stringify({
        success: true,
        action: 'filings',
        ticker,
        cik,
        count: filings.length,
        filings,
      })
    }

    if (action === 'insider') {
      const ticker = String(input.ticker || '').toUpperCase()
      if (!ticker) return JSON.stringify({ success: false, message: '티커(ticker)가 필요합니다.' })

      const count = Number(input.count || 10)

      const cik = await getCikFromTicker(ticker)
      if (!cik) return JSON.stringify({ success: false, message: `${ticker} 종목의 CIK를 찾을 수 없습니다.` })

      // Get insider filings (Form 4) from submissions
      const cikPadded = String(cik).padStart(10, '0')
      const res = await fetch(`https://data.sec.gov/submissions/CIK${cikPadded}.json`, {
        headers: SEC_HEADERS,
        signal: AbortSignal.timeout(15_000),
      })

      if (!res.ok) return JSON.stringify({ success: false, message: `SEC EDGAR API 오류: ${res.status}` })

      const data = (await res.json()) as EdgarFilingsResponse
      const recent = data.recent || data.filings?.recent || {}

      const forms = recent.form || []
      const dates = recent.filingDate || []
      const accessions = recent.accessionNumber || []
      const docs = recent.primaryDocument || []
      const descs = recent.primaryDocDescription || []

      let insiderFilings: Array<{
        formType: string
        filingDate: string
        accessionNumber: string
        description: string
        url: string
      }> = []

      for (let i = 0; i < forms.length && insiderFilings.length < count; i++) {
        if (forms[i] !== '4' && forms[i] !== '4/A') continue
        const accNo = (accessions[i] || '').replace(/-/g, '')
        insiderFilings.push({
          formType: forms[i],
          filingDate: dates[i] || '',
          accessionNumber: accessions[i] || '',
          description: descs[i] || '',
          url: accNo && docs[i]
            ? `https://www.sec.gov/Archives/edgar/data/${cik}/${accNo}/${docs[i]}`
            : '',
        })
      }

      return JSON.stringify({
        success: true,
        action: 'insider',
        ticker,
        cik,
        count: insiderFilings.length,
        insiderFilings,
      })
    }

    if (action === 'company') {
      const ticker = String(input.ticker || '').toUpperCase()
      if (!ticker) return JSON.stringify({ success: false, message: '티커(ticker)가 필요합니다.' })

      const cik = await getCikFromTicker(ticker)
      if (!cik) return JSON.stringify({ success: false, message: `${ticker} 종목의 CIK를 찾을 수 없습니다.` })

      // Get company info
      const cikPadded = String(cik).padStart(10, '0')
      const res = await fetch(`https://data.sec.gov/submissions/CIK${cikPadded}.json`, {
        headers: SEC_HEADERS,
        signal: AbortSignal.timeout(15_000),
      })

      if (!res.ok) return JSON.stringify({ success: false, message: `SEC EDGAR API 오류: ${res.status}` })

      const data = (await res.json()) as Record<string, unknown>

      return JSON.stringify({
        success: true,
        action: 'company',
        ticker,
        cik,
        name: String(data.name || ''),
        entityType: String(data.entityType || ''),
        sic: String(data.sic || ''),
        sicDescription: String(data.sicDescription || ''),
        stateOfIncorporation: String(data.stateOfIncorporation || ''),
        fiscalYearEnd: String(data.fiscalYearEnd || ''),
        exchanges: data.exchanges || [],
        tickers: data.tickers || [],
        ein: String(data.ein || ''),
        category: String(data.category || ''),
        phone: String((data.addresses as Record<string, Record<string, string>>)?.mailing?.phone || ''),
      })
    }

    return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. filings, insider, company를 사용하세요.` })
  } catch (err) {
    return JSON.stringify({ success: false, message: `SEC EDGAR 조회 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}` })
  }
}

// Cache for company tickers (loaded once)
let tickerCache: Map<string, number> | null = null

/** Reset ticker cache (for testing) */
export function resetTickerCache() {
  tickerCache = null
}

async function getCikFromTicker(ticker: string): Promise<number | null> {
  if (!tickerCache) {
    try {
      const res = await fetch('https://www.sec.gov/files/company_tickers.json', {
        headers: SEC_HEADERS,
        signal: AbortSignal.timeout(15_000),
      })
      if (!res.ok) return null

      const data = (await res.json()) as Record<string, CompanyTicker>
      tickerCache = new Map()
      for (const entry of Object.values(data)) {
        tickerCache.set(entry.ticker.toUpperCase(), entry.cik_str)
      }
    } catch {
      return null
    }
  }

  return tickerCache.get(ticker) || null
}
