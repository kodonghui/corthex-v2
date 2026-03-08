/**
 * Hallucination Detector: 에이전트 결과물에서 환각(사실과 다른 내용)을 탐지
 *
 * 3단계 파이프라인:
 * 1. ClaimExtractor: 사실적 주장(숫자, 날짜, 이름, URL, 통계) 정규식 추출
 * 2. ToolDataMatcher: 추출된 주장을 도구 실행 데이터와 비교
 * 3. Verdict 판정: clean/warning/critical
 *
 * LLM 기반 환각 탐지(acc-fact-check, acc-hallucination-detect)는
 * InspectionEngine의 기존 LLM 규칙이 담당. 이 서비스는 규칙 기반 사전 탐지.
 */

// === Types ===

export type ClaimType = 'number' | 'date' | 'name' | 'url' | 'statistic'

export type ContentType = 'financial' | 'code' | 'general'

export type FactualClaim = {
  type: ClaimType
  value: string
  context: string  // 주장이 포함된 문장/구절
  position: number // 텍스트 내 위치 (character offset)
  unit?: string    // 숫자의 단위 (원, %, 달러 등)
}

export type ToolDataEntry = {
  toolName: string
  input: unknown
  output: string
  timestamp?: string
}

export type ClaimVerification = {
  claim: FactualClaim
  matched: boolean       // 도구 데이터에서 관련 항목을 찾았는지
  verified: boolean      // 도구 데이터와 일치하는지
  toolSource?: string    // 매칭된 도구 이름
  discrepancy?: string   // 불일치 설명
  confidence: number     // 0-1, 탐지 확신도
  severity: 'critical' | 'minor' | 'none'
}

export type HallucinationReport = {
  claims: ClaimVerification[]
  unsourcedClaims: FactualClaim[]
  verdict: 'clean' | 'warning' | 'critical'
  score: number          // 0-1, 1이 가장 깨끗함
  details: string
  totalClaims: number
  verifiedClaims: number
  mismatchedClaims: number
  unsourcedCount: number
}

// === ClaimExtractor ===

/**
 * 숫자 + 단위 추출 (주가, 금액, 백분율, 건수 등)
 */
export function extractNumberClaims(content: string): FactualClaim[] {
  const claims: FactualClaim[] = []

  // 한국어 금액/수량 패턴: 72,000원, 1,234.56달러, 15.3%, 100억, 3.2조 등
  const numberPatterns = [
    // 금액: 콤마 포함 숫자 + 원/달러/엔/위안
    /[\d,]+(?:\.\d+)?\s*(?:원|달러|엔|위안|유로|파운드|USD|KRW|JPY|EUR)/g,
    // 백분율
    /[\d,]+(?:\.\d+)?\s*%/g,
    // 한국어 큰 단위: 억, 조, 만
    /[\d,]+(?:\.\d+)?\s*(?:억|조|만)\s*(?:원|달러)?/g,
    // 배수/비율: PER, PBR, ROE 등과 함께
    /(?:PER|PBR|ROE|EPS|BPS)\s*[\d,]+(?:\.\d+)?(?:\s*(?:배|%|원))?/gi,
    // 거래량/건수
    /[\d,]+(?:\.\d+)?\s*(?:주|건|명|개|회|번|차|개월|년|일)/g,
  ]

  for (const pattern of numberPatterns) {
    let match: RegExpExecArray | null
    const regex = new RegExp(pattern.source, pattern.flags)
    while ((match = regex.exec(content)) !== null) {
      const pos = match.index
      const contextStart = Math.max(0, pos - 50)
      const contextEnd = Math.min(content.length, pos + match[0].length + 50)
      const context = content.slice(contextStart, contextEnd)

      // 단위 추출
      const unitMatch = match[0].match(/(?:원|달러|엔|위안|유로|파운드|USD|KRW|JPY|EUR|%|억|조|만|주|건|명|개|회|배)/)
      const unit = unitMatch?.[0]

      claims.push({
        type: 'number',
        value: match[0].trim(),
        context,
        position: pos,
        unit,
      })
    }
  }

  return deduplicateClaims(claims)
}

/**
 * 날짜/시간 추출
 */
export function extractDateClaims(content: string): FactualClaim[] {
  const claims: FactualClaim[] = []

  const datePatterns = [
    // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
    /\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/g,
    // MM/DD/YYYY
    /\d{1,2}\/\d{1,2}\/\d{4}/g,
    // 한국어 날짜: 2024년 3월 15일
    /\d{4}년\s*\d{1,2}월\s*\d{1,2}일/g,
    // 상대 날짜는 claim에서 제외 (검증 불가)
  ]

  for (const pattern of datePatterns) {
    let match: RegExpExecArray | null
    const regex = new RegExp(pattern.source, pattern.flags)
    while ((match = regex.exec(content)) !== null) {
      const pos = match.index
      const contextStart = Math.max(0, pos - 50)
      const contextEnd = Math.min(content.length, pos + match[0].length + 50)

      claims.push({
        type: 'date',
        value: match[0].trim(),
        context: content.slice(contextStart, contextEnd),
        position: pos,
      })
    }
  }

  return deduplicateClaims(claims)
}

/**
 * URL 패턴 추출
 */
export function extractUrlClaims(content: string): FactualClaim[] {
  const claims: FactualClaim[] = []

  const urlPattern = /https?:\/\/[^\s)>\]"']+/g
  let match: RegExpExecArray | null
  while ((match = urlPattern.exec(content)) !== null) {
    const pos = match.index
    const contextStart = Math.max(0, pos - 30)
    const contextEnd = Math.min(content.length, pos + match[0].length + 30)

    claims.push({
      type: 'url',
      value: match[0].trim(),
      context: content.slice(contextStart, contextEnd),
      position: pos,
    })
  }

  return claims
}

/**
 * 이름/기관명 추출 (한글 고유명사 패턴)
 */
export function extractNameClaims(content: string): FactualClaim[] {
  const claims: FactualClaim[] = []

  const namePatterns = [
    // 회사명: XX전자, XX그룹, XX증권 등
    /[가-힣]{2,10}(?:전자|그룹|증권|은행|보험|건설|화학|제약|통신|에너지|바이오|엔터|테크)/g,
    // 기관명 (longer suffixes first to avoid partial matching)
    /[가-힣]{2,8}(?:위원회|연구소|연구원|감독원)/g,
    /[가-힣]{2,10}(?:부|원|처|청|협회|재단)/g,
    // 영문 회사명/티커 (대문자 2-5글자)
    /\b[A-Z]{2,5}\b(?=\s|,|\.|\))/g,
  ]

  for (const pattern of namePatterns) {
    let match: RegExpExecArray | null
    const regex = new RegExp(pattern.source, pattern.flags)
    while ((match = regex.exec(content)) !== null) {
      const pos = match.index
      const contextStart = Math.max(0, pos - 40)
      const contextEnd = Math.min(content.length, pos + match[0].length + 40)

      claims.push({
        type: 'name',
        value: match[0].trim(),
        context: content.slice(contextStart, contextEnd),
        position: pos,
      })
    }
  }

  return deduplicateClaims(claims)
}

/**
 * 통합 claim 추출
 */
export function extractAllClaims(content: string): FactualClaim[] {
  return [
    ...extractNumberClaims(content),
    ...extractDateClaims(content),
    ...extractUrlClaims(content),
    ...extractNameClaims(content),
  ]
}

// === ToolDataMatcher ===

/**
 * toolData (Record<string, unknown>) -> ToolDataEntry[] 변환
 */
export function parseToolData(toolData: Record<string, unknown>): ToolDataEntry[] {
  const entries: ToolDataEntry[] = []

  for (const [key, value] of Object.entries(toolData)) {
    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>
      entries.push({
        toolName: key,
        input: obj.input ?? null,
        output: typeof obj.output === 'string' ? obj.output : JSON.stringify(obj.output ?? obj),
        timestamp: typeof obj.timestamp === 'string' ? obj.timestamp : undefined,
      })
    } else if (typeof value === 'string') {
      entries.push({
        toolName: key,
        input: null,
        output: value,
      })
    }
  }

  return entries
}

/**
 * 도구 데이터에서 claim과 관련된 텍스트 찾기.
 * "found" means we found a related value in tool data to compare against,
 * not necessarily an exact match.
 */
export function matchClaimToToolData(claim: FactualClaim, toolEntries: ToolDataEntry[]): {
  found: boolean
  toolName?: string
  matchedText?: string
} {
  for (const entry of toolEntries) {
    const outputText = entry.output
    if (!outputText) continue

    // Exact string match: claim value literally in tool output
    const normalizedClaim = normalizeValue(claim.value)
    const normalizedOutput = normalizeValue(outputText)

    if (normalizedOutput.includes(normalizedClaim)) {
      return { found: true, toolName: entry.toolName, matchedText: claim.value }
    }

    // Numeric match: find any number in tool output that's close to claim number
    if (claim.type === 'number' || claim.type === 'statistic') {
      const claimNum = extractNumericValue(claim.value)
      if (claimNum !== null && claimNum > 0) {
        const outputNums = extractAllNumbers(outputText)
        // Find the closest number in tool output
        let closestNum: number | null = null
        let closestDiff = Infinity
        for (const outputNum of outputNums) {
          if (outputNum === 0) continue
          const diff = Math.abs(claimNum - outputNum) / Math.max(Math.abs(claimNum), Math.abs(outputNum))
          if (diff < closestDiff) {
            closestDiff = diff
            closestNum = outputNum
          }
        }
        // If we found a number within 40% range, consider it a related value
        // (the actual accuracy check happens in compareNumericClaim)
        if (closestNum !== null && closestDiff < 0.40) {
          return { found: true, toolName: entry.toolName, matchedText: String(closestNum) }
        }
      }
    }

    // Context-based match for names: if claim's surrounding context mentions something in tool data
    if (claim.type === 'name') {
      const normalizedClaimVal = claim.value.toLowerCase()
      if (outputText.toLowerCase().includes(normalizedClaimVal)) {
        return { found: true, toolName: entry.toolName, matchedText: claim.value }
      }
    }
  }

  return { found: false }
}

/**
 * 숫자 claim 비교 (콘텐츠 유형별 허용 오차)
 */
export function compareNumericClaim(
  claimValue: string,
  toolValue: string,
  contentType: ContentType,
): { match: boolean; discrepancy?: string; confidence: number } {
  const claimNum = extractNumericValue(claimValue)
  const toolNum = extractNumericValue(toolValue)

  if (claimNum === null || toolNum === null) {
    return { match: false, discrepancy: '숫자 파싱 불가', confidence: 0.3 }
  }

  if (claimNum === toolNum) {
    return { match: true, confidence: 0.95 }
  }

  // 허용 오차 계산
  const tolerance = getNumericTolerance(contentType, claimValue)
  const diff = Math.abs(claimNum - toolNum)
  const percentDiff = toolNum !== 0 ? (diff / Math.abs(toolNum)) * 100 : diff > 0 ? 100 : 0

  if (percentDiff <= tolerance) {
    return { match: true, confidence: 0.80 }
  }

  return {
    match: false,
    discrepancy: `주장: ${claimValue}, 도구 데이터: ${toolValue} (차이: ${percentDiff.toFixed(1)}%)`,
    confidence: 0.90,
  }
}

/**
 * 날짜 claim 비교
 */
export function compareDateClaim(
  claimValue: string,
  toolValue: string,
): { match: boolean; discrepancy?: string; confidence: number } {
  const claimDate = parseDate(claimValue)
  const toolDate = parseDate(toolValue)

  if (!claimDate || !toolDate) {
    return { match: false, discrepancy: '날짜 파싱 불가', confidence: 0.3 }
  }

  const diffDays = Math.abs(claimDate.getTime() - toolDate.getTime()) / (1000 * 60 * 60 * 24)

  if (diffDays === 0) {
    return { match: true, confidence: 0.95 }
  }

  if (diffDays <= 1) {
    return { match: true, confidence: 0.80 }
  }

  return {
    match: false,
    discrepancy: `주장: ${claimValue}, 도구 데이터: ${toolValue} (${Math.round(diffDays)}일 차이)`,
    confidence: 0.85,
  }
}

/**
 * 이름/기관명 비교 (fuzzy match)
 */
export function compareNameClaim(
  claimValue: string,
  toolValue: string,
): { match: boolean; discrepancy?: string; confidence: number } {
  const normalized1 = claimValue.trim().toLowerCase()
  const normalized2 = toolValue.trim().toLowerCase()

  if (normalized1 === normalized2) {
    return { match: true, confidence: 0.95 }
  }

  // 부분 포함 체크 (최소 3글자 이상이어야 의미 있는 포함 관계)
  if (normalized1.length >= 3 && normalized2.includes(normalized1)) {
    return { match: true, confidence: 0.85 }
  }
  if (normalized2.length >= 3 && normalized1.includes(normalized2)) {
    return { match: true, confidence: 0.85 }
  }

  // 간단한 편집 거리 — 짧은 문자열은 더 엄격하게 (비율 기반)
  const maxLen = Math.max(normalized1.length, normalized2.length)
  const dist = levenshteinDistance(normalized1, normalized2)
  // 전체 길이의 20% 이하 편집 거리면 유사 (최소 1 허용)
  const threshold = Math.max(1, Math.floor(maxLen * 0.2))
  if (dist <= threshold) {
    return { match: true, confidence: 0.75 }
  }

  return {
    match: false,
    discrepancy: `주장: "${claimValue}", 도구 데이터: "${toolValue}"`,
    confidence: 0.70,
  }
}

// === HallucinationDetector main ===

/**
 * 콘텐츠 유형 판별
 */
export function detectContentType(content: string, commandText: string): ContentType {
  const combined = `${commandText} ${content}`.toLowerCase()

  const financialKeywords = ['주가', '환율', '매출', '영업이익', 'per', 'pbr', 'roe', '포트폴리오',
    '매수', '매도', '종목', '시가총액', '거래량', '재무제표', '배당', '수익률']
  const codeKeywords = ['function', 'class', 'import', 'const ', 'let ', 'var ', 'def ', 'return ',
    '```', 'api', 'endpoint', 'npm', 'pip', 'package']

  const financialCount = financialKeywords.filter(kw => combined.includes(kw)).length
  const codeCount = codeKeywords.filter(kw => combined.includes(kw)).length

  if (financialCount >= 3) return 'financial'
  if (codeCount >= 3) return 'code'
  return 'general'
}

/**
 * 메인 환각 탐지 함수
 */
export function detect(
  content: string,
  toolData: Record<string, unknown> | undefined,
  commandText: string,
): HallucinationReport {
  // Extract all factual claims from content
  const allClaims = extractAllClaims(content)
  const contentType = detectContentType(content, commandText)

  // If no claims found, content is clean
  if (allClaims.length === 0) {
    return {
      claims: [],
      unsourcedClaims: [],
      verdict: 'clean',
      score: 1.0,
      details: '사실적 주장이 발견되지 않았습니다',
      totalClaims: 0,
      verifiedClaims: 0,
      mismatchedClaims: 0,
      unsourcedCount: 0,
    }
  }

  // If no tool data, all number claims with specific values are unsourced
  if (!toolData || Object.keys(toolData).length === 0) {
    const unsourcedClaims = allClaims.filter(c => c.type === 'number' || c.type === 'statistic')
    const unsourcedCount = unsourcedClaims.length

    const verdict: 'clean' | 'warning' | 'critical' = unsourcedCount >= 5 ? 'warning' : 'clean'
    const score = unsourcedCount === 0 ? 1.0 : Math.max(0.3, 1 - unsourcedCount * 0.1)

    return {
      claims: [],
      unsourcedClaims,
      verdict,
      score,
      details: unsourcedCount > 0
        ? `도구 데이터 없이 ${unsourcedCount}개의 수치가 사용되었습니다 (출처 확인 불가)`
        : '도구 데이터가 없지만 수치 주장도 없습니다',
      totalClaims: allClaims.length,
      verifiedClaims: 0,
      mismatchedClaims: 0,
      unsourcedCount,
    }
  }

  // Parse tool data
  const toolEntries = parseToolData(toolData)
  const verifications: ClaimVerification[] = []
  const unsourcedClaims: FactualClaim[] = []

  for (const claim of allClaims) {
    const matchResult = matchClaimToToolData(claim, toolEntries)

    if (!matchResult.found) {
      // 숫자 claim은 출처 없음으로 분류
      if (claim.type === 'number' || claim.type === 'statistic') {
        unsourcedClaims.push(claim)
      }
      // 이름/날짜/URL은 도구 데이터에 없을 수 있으므로 무시
      continue
    }

    // 도구 데이터에서 찾았으면 비교
    let comparison: { match: boolean; discrepancy?: string; confidence: number }

    switch (claim.type) {
      case 'number':
      case 'statistic':
        comparison = compareNumericClaim(claim.value, matchResult.matchedText!, contentType)
        break
      case 'date':
        comparison = compareDateClaim(claim.value, matchResult.matchedText!)
        break
      case 'name':
        comparison = compareNameClaim(claim.value, matchResult.matchedText!)
        break
      default:
        comparison = { match: true, confidence: 0.5 }
    }

    verifications.push({
      claim,
      matched: true,
      verified: comparison.match,
      toolSource: matchResult.toolName,
      discrepancy: comparison.discrepancy,
      confidence: comparison.confidence,
      severity: !comparison.match
        ? (claim.type === 'number' && contentType === 'financial' ? 'critical' : 'minor')
        : 'none',
    })
  }

  // Calculate verdict
  const criticalMismatches = verifications.filter(v => v.severity === 'critical').length
  const minorMismatches = verifications.filter(v => v.severity === 'minor').length
  const mismatchedClaims = criticalMismatches + minorMismatches
  const verifiedClaims = verifications.filter(v => v.verified).length

  let verdict: 'clean' | 'warning' | 'critical'
  if (criticalMismatches >= 1) {
    verdict = 'critical'
  } else if (minorMismatches >= 3 || unsourcedClaims.length >= 5) {
    verdict = 'warning'
  } else {
    verdict = 'clean'
  }

  // Calculate score (1.0 = perfectly clean)
  const penaltyPerCritical = 0.3
  const penaltyPerMinor = 0.1
  const penaltyPerUnsourced = 0.05
  const totalPenalty = criticalMismatches * penaltyPerCritical +
    minorMismatches * penaltyPerMinor +
    unsourcedClaims.length * penaltyPerUnsourced
  const score = Math.max(0, Math.min(1, 1 - totalPenalty))

  // Build details
  const detailParts: string[] = []
  if (criticalMismatches > 0) {
    detailParts.push(`❌ 심각한 불일치 ${criticalMismatches}건`)
  }
  if (minorMismatches > 0) {
    detailParts.push(`⚠️ 경미한 불일치 ${minorMismatches}건`)
  }
  if (unsourcedClaims.length > 0) {
    detailParts.push(`📌 출처 없는 수치 ${unsourcedClaims.length}건`)
  }
  if (verifiedClaims > 0) {
    detailParts.push(`✅ 검증 완료 ${verifiedClaims}건`)
  }
  const details = detailParts.length > 0
    ? detailParts.join(', ')
    : '모든 주장이 검증되었습니다'

  return {
    claims: verifications,
    unsourcedClaims,
    verdict,
    score: Math.round(score * 100) / 100,
    details,
    totalClaims: allClaims.length,
    verifiedClaims,
    mismatchedClaims,
    unsourcedCount: unsourcedClaims.length,
  }
}

// === Utility functions ===

function deduplicateClaims(claims: FactualClaim[]): FactualClaim[] {
  const seen = new Set<string>()
  return claims.filter(c => {
    const key = `${c.type}:${c.value}:${c.position}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function normalizeValue(text: string): string {
  return text.replace(/[\s,]/g, '').toLowerCase()
}

function extractNumericValue(text: string): number | null {
  // 콤마 제거, 한국어 단위 변환
  let cleaned = text.replace(/,/g, '')

  // 한국어 큰 단위 변환
  const joMatch = cleaned.match(/([\d.]+)\s*조/)
  if (joMatch) return parseFloat(joMatch[1]) * 1_000_000_000_000

  const eokMatch = cleaned.match(/([\d.]+)\s*억/)
  if (eokMatch) return parseFloat(eokMatch[1]) * 100_000_000

  const manMatch = cleaned.match(/([\d.]+)\s*만/)
  if (manMatch) return parseFloat(manMatch[1]) * 10_000

  // 일반 숫자 추출
  const numMatch = cleaned.match(/([\d.]+)/)
  if (numMatch) return parseFloat(numMatch[1])

  return null
}

function extractAllNumbers(text: string): number[] {
  const numbers: number[] = []
  // 한국어 큰 단위 패턴 먼저 (3.2조, 100억, 5만 등)
  const koreanUnitPattern = /([\d,]+(?:\.\d+)?)\s*(?:조|억|만)/g
  const koreanPositions = new Set<number>()
  let km: RegExpExecArray | null
  while ((km = koreanUnitPattern.exec(text)) !== null) {
    const parsed = extractNumericValue(km[0])
    if (parsed !== null) {
      numbers.push(parsed)
      // Mark positions so plain number pass skips these
      for (let i = km.index; i < km.index + km[0].length; i++) koreanPositions.add(i)
    }
  }
  // 콤마 포함 일반 숫자 패턴
  const pattern = /[\d,]+(?:\.\d+)?/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    if (koreanPositions.has(match.index)) continue
    const num = parseFloat(match[0].replace(/,/g, ''))
    if (!isNaN(num)) numbers.push(num)
  }
  return numbers
}

function getNumericTolerance(contentType: ContentType, claimValue: string): number {
  if (contentType === 'financial') {
    // 거래량은 ±5%, 나머지 ±1%
    if (/주|건|거래량/.test(claimValue)) return 5
    return 1
  }
  // 일반: 정확 일치 (0% 오차)
  return 0
}

function parseDate(text: string): Date | null {
  // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
  const isoMatch = text.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]))
  }

  // 한국어: 2024년 3월 15일
  const korMatch = text.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/)
  if (korMatch) {
    return new Date(parseInt(korMatch[1]), parseInt(korMatch[2]) - 1, parseInt(korMatch[3]))
  }

  return null
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }

  return matrix[b.length][a.length]
}
