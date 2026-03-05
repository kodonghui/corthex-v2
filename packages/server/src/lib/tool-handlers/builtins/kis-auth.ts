const KIS_BASE_URL = 'https://openapi.koreainvestment.com:9443'

type TokenCache = {
  token: string
  expiresAt: number
}

const tokenCache = new Map<string, TokenCache>()

export async function getKisToken(appKey: string, appSecret: string): Promise<string> {
  const cacheKey = `${appKey}:${appSecret}`
  const cached = tokenCache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.token
  }

  const res = await fetch(`${KIS_BASE_URL}/oauth2/tokenP`, {
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
  const expiresAt = Date.now() + (data.expires_in - 60) * 1000

  tokenCache.set(cacheKey, { token, expiresAt })
  return token
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

export { KIS_BASE_URL }
