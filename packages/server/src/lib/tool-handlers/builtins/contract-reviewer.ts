import type { ToolHandler } from '../types'

// Contract risk clause keywords (Korean)
const RISK_CLAUSES: { category: string; keywords: string[]; risk: 'high' | 'medium' | 'low' }[] = [
  { category: '해지/해제 조건', keywords: ['해지', '해제', '취소', '철회', '종료'], risk: 'high' },
  { category: '위약금/손해배상', keywords: ['위약금', '손해배상', '배상', '벌칙', '과태료', '지체상금'], risk: 'high' },
  { category: '분쟁해결', keywords: ['분쟁', '소송', '중재', '조정', '관할'], risk: 'high' },
  { category: '면책/책임제한', keywords: ['면책', '책임제한', '불가항력', '천재지변', '책임을 지지'], risk: 'high' },
  { category: '기밀유지/비밀보장', keywords: ['기밀', '비밀', '비밀유지', '기밀유지', '비공개', '보안'], risk: 'medium' },
  { category: '지적재산권', keywords: ['지적재산', '저작권', '특허', '상표', '지식재산', '소유권'], risk: 'medium' },
  { category: '계약기간/갱신', keywords: ['계약기간', '유효기간', '갱신', '연장', '자동갱신', '만료'], risk: 'medium' },
  { category: '대금/지급조건', keywords: ['대금', '지급', '납입', '결제', '수수료', '청구', '인보이스'], risk: 'medium' },
  { category: '양도/이전', keywords: ['양도', '이전', '승계', '제3자'], risk: 'low' },
  { category: '통지/고지', keywords: ['통지', '고지', '통보', '서면'], risk: 'low' },
]

const ESSENTIAL_CLAUSES = [
  '계약 당사자',
  '계약 목적',
  '계약기간',
  '대금/지급조건',
  '해지/해제 조건',
  '분쟁해결',
  '기밀유지',
  '손해배상',
  '지적재산권',
]

function reviewContract(text: string) {
  const foundClauses: { category: string; risk: string; excerpt: string }[] = []
  const missingClauses: string[] = []

  for (const clause of RISK_CLAUSES) {
    const found = clause.keywords.some((kw) => text.includes(kw))
    if (found) {
      // Extract a snippet around the first found keyword
      const keyword = clause.keywords.find((kw) => text.includes(kw))!
      const idx = text.indexOf(keyword)
      const start = Math.max(0, idx - 30)
      const end = Math.min(text.length, idx + keyword.length + 50)
      const excerpt = text.slice(start, end).replace(/\n/g, ' ').trim()
      foundClauses.push({ category: clause.category, risk: clause.risk, excerpt: `...${excerpt}...` })
    }
  }

  for (const essential of ESSENTIAL_CLAUSES) {
    const matchClause = RISK_CLAUSES.find((c) => c.category.includes(essential) || essential.includes(c.category.split('/')[0]))
    if (matchClause) {
      const found = matchClause.keywords.some((kw) => text.includes(kw))
      if (!found) missingClauses.push(essential)
    } else {
      // Check by essential clause name directly
      const simpleName = essential.split('/')[0]
      if (!text.includes(simpleName)) missingClauses.push(essential)
    }
  }

  const highRiskCount = foundClauses.filter((c) => c.risk === 'high').length
  const riskLevel = highRiskCount === 0 ? '주의 필요' : highRiskCount <= 2 ? '보통' : '양호'

  return { foundClauses, missingClauses, riskLevel, clauseCount: foundClauses.length }
}

export const contractReviewer: ToolHandler = (input) => {
  const action = String(input.action || 'review')

  if (action === 'review') {
    const text = String(input.text || '')
    if (!text) return JSON.stringify({ success: false, message: '계약서 텍스트(text)를 입력하세요.' })

    const result = reviewContract(text)
    return JSON.stringify({
      success: true,
      ...result,
      disclaimer: '이 분석은 참고용이며, 법률 자문을 대체하지 않습니다. 중요한 계약은 반드시 법률 전문가와 상담하세요.',
    })
  }

  if (action === 'checklist') {
    return JSON.stringify({
      success: true,
      essentialClauses: ESSENTIAL_CLAUSES,
      riskCategories: RISK_CLAUSES.map((c) => ({ category: c.category, risk: c.risk })),
      message: '계약서에 포함되어야 할 필수 조항 목록입니다.',
    })
  }

  return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. review 또는 checklist를 사용하세요.` })
}
