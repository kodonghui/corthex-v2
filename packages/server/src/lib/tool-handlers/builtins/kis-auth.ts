// KIS (Korea Investment & Securities) API Authentication
// Real trading: openapi.koreainvestment.com:9443
// Paper trading: openapivts.koreainvestment.com:29443

export const KIS_BASE_REAL = 'https://openapi.koreainvestment.com:9443'
export const KIS_BASE_PAPER = 'https://openapivts.koreainvestment.com:29443'

// Backward compat — default to real
export const KIS_BASE_URL = KIS_BASE_REAL

export function getKisBaseUrl(tradingMode: 'real' | 'paper'): string {
  return tradingMode === 'paper' ? KIS_BASE_PAPER : KIS_BASE_REAL
}

// ⚠️ 2025년 신 TR_ID — 구 TR_ID(0801U/0802U)는 차단됨
export const KIS_TR_IDS = {
  domestic: {
    real: { buy: 'TTTC0012U', sell: 'TTTC0011U', balance: 'TTTC8434R' },
    paper: { buy: 'VTTC0012U', sell: 'VTTC0011U', balance: 'VTTC8434R' },
  },
  overseas: {
    real: { buy: 'TTTT1002U', sell: 'TTTT1006U', balance: 'TTTS3012R', price: 'HHDFS00000300' },
    paper: { buy: 'VTTT1002U', sell: 'VTTT1006U', balance: 'VTTS3012R', price: 'HHDFS00000300' },
  },
  // 시세 조회는 실거래/모의 동일
  price: {
    domestic: 'FHKST01010100',
    domesticDaily: 'FHKST03010100',
    overseas: 'HHDFS00000300',
  },
} as const

// 거래소 코드 매핑 — 주문용과 시세용이 다름!
export const EXCHANGE_CODES = {
  // 주문용 (OVRS_EXCG_CD)
  order: { NASDAQ: 'NASD', NYSE: 'NYSE', AMEX: 'AMEX', NASD: 'NASD' } as Record<string, string>,
  // 시세용 (EXCD) — 주문용과 다름
  price: { NASD: 'NAS', NYSE: 'NYS', AMEX: 'AMS', NASDAQ: 'NAS', NAS: 'NAS', NYS: 'NYS', AMS: 'AMS' } as Record<string, string>,
}

type TokenCache = {
  token: string
  expiresAt: number
}

// 실거래/모의거래 별도 토큰 캐시
const tokenCache = new Map<string, TokenCache>()

// 토큰 발급 쿨다운 — 1분당 1회 제한 (EGW00133)
const lastTokenRequest = new Map<string, number>()
const TOKEN_COOLDOWN_MS = 65_000 // 65초

export async function getKisToken(
  appKey: string,
  appSecret: string,
  tradingMode: 'real' | 'paper' = 'real',
): Promise<string> {
  const baseUrl = getKisBaseUrl(tradingMode)
  const cacheKey = `${tradingMode}:${appKey}:${appSecret}`

  // 1순위: 메모리 캐시
  const cached = tokenCache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.token
  }

  // 쿨다운 체크
  const lastReq = lastTokenRequest.get(cacheKey)
  if (lastReq && Date.now() - lastReq < TOKEN_COOLDOWN_MS) {
    const wait = Math.ceil((TOKEN_COOLDOWN_MS - (Date.now() - lastReq)) / 1000)
    throw new Error(`KIS 토큰 발급 대기 중 (${wait}초 후 재시도, 1분당 1회 제한)`)
  }

  lastTokenRequest.set(cacheKey, Date.now())

  const res = await fetch(`${baseUrl}/oauth2/tokenP`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      grant_type: 'client_credentials',
      appkey: appKey,
      appsecret: appSecret,
    }),
  })

  if (!res.ok) {
    throw new Error(`KIS 토큰 발급 실패: ${res.status}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  const token = data.access_token
  const expiresAt = Date.now() + (data.expires_in - 300) * 1000 // 5분 여유

  tokenCache.set(cacheKey, { token, expiresAt })
  return token
}

// 토큰 캐시 무효화 (만료 감지 시 사용)
export function invalidateKisToken(appKey: string, appSecret: string, tradingMode: 'real' | 'paper' = 'real') {
  const cacheKey = `${tradingMode}:${appKey}:${appSecret}`
  tokenCache.delete(cacheKey)
}

export function kisHeaders(token: string, appKey: string, appSecret: string, trId: string) {
  return {
    'authorization': `Bearer ${token}`,
    'appkey': appKey,
    'appsecret': appSecret,
    'tr_id': trId,
    'Content-Type': 'application/json; charset=utf-8',
  }
}
