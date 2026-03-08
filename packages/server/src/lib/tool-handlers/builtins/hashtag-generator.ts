import type { ToolHandler } from '../types'

// ─── 분야별 해시태그 데이터베이스 (v1 포트 + 확장) ───
const HASHTAG_DB: Record<string, Record<string, string[]>> = {
  교육: {
    대형: ['#공부', '#공부그램', '#공스타그램', '#합격', '#수험생', '#공부자극', '#열공', '#시험', '#자격증', '#대학'],
    중형: ['#법학', '#로스쿨', '#LEET', '#법대', '#변호사시험', '#법학전문대학원', '#LEET준비', '#법학공부', '#로스쿨입시', '#법시', '#법조인', '#리트', '#법학과', '#법대생'],
    소형: ['#리트공부', '#LEET준비', '#로스쿨준비', '#법학적성시험', '#LEET공부법', '#리트기출', '#LEET독학', '#리트언어이해', '#리트추리논증', '#로스쿨면접'],
  },
  금융: {
    대형: ['#주식', '#투자', '#재테크', '#부동산', '#경제', '#주식투자', '#금융', '#돈', '#부업', '#자산관리'],
    중형: ['#주식공부', '#ETF', '#배당주', '#미국주식', '#코인', '#부동산투자', '#아파트', '#경제공부', '#재무설계', '#펀드', '#주식초보', '#가치투자', '#종목추천', '#차트분석', '#금융투자'],
    소형: ['#주린이', '#주식일기', '#매매일지', '#배당금', '#적립식', '#ETF투자', '#해외주식', '#퀀트투자', '#가계부'],
  },
  기술: {
    대형: ['#IT', '#개발자', '#프로그래밍', '#코딩', '#AI', '#개발', '#기술', '#스타트업', '#앱', '#소프트웨어'],
    중형: ['#인공지능', '#머신러닝', '#파이썬', '#ChatGPT', '#딥러닝', '#웹개발', '#앱개발', '#데이터분석', '#클라우드', '#자동화', '#GPT', '#LLM', '#개발일지', '#사이드프로젝트', '#테크'],
    소형: ['#AI에이전트', '#RAG', '#벡터DB', '#프롬프트엔지니어링', '#LangChain', '#FastAPI', '#NextJS', '#리액트', '#타입스크립트', '#MLOps'],
  },
  라이프스타일: {
    대형: ['#일상', '#데일리', '#소통', '#맞팔', '#좋아요', '#인스타그램', '#팔로우', '#일상그램', '#소통해요', '#선팔'],
    중형: ['#자기계발', '#독서', '#운동', '#다이어트', '#건강', '#미라클모닝', '#습관', '#목표', '#동기부여', '#성장', '#자기관리', '#루틴', '#생산성', '#독서그램', '#운동그램'],
    소형: ['#갓생살기', '#갓생', '#하루루틴', '#아침루틴', '#생산성도구', '#노션', '#플래너', '#타임블로킹', '#습관추적', '#감사일기'],
  },
  마케팅: {
    대형: ['#마케팅', '#광고', '#브랜딩', '#SNS마케팅', '#디지털마케팅', '#콘텐츠마케팅', '#온라인마케팅', '#홍보', '#매출', '#사업'],
    중형: ['#인스타마케팅', '#블로그마케팅', '#유튜브마케팅', '#퍼포먼스마케팅', '#SEO', '#검색광고', '#SNS광고', '#바이럴마케팅', '#인플루언서', '#틱톡마케팅', '#콘텐츠기획', '#카피라이팅', '#브랜드스토리', '#그로스해킹'],
    소형: ['#마케팅전략', '#마케팅자동화', '#CRM', '#전환율', '#퍼널', '#리타겟팅', '#A/B테스트', '#고객여정', '#마케팅분석', '#ROI분석'],
  },
  건강: {
    대형: ['#건강', '#운동', '#다이어트', '#헬스', '#피트니스', '#요가', '#홈트', '#바디프로필', '#헬스타그램', '#운동스타그램'],
    중형: ['#식단', '#단백질', '#근력운동', '#유산소', '#크로스핏', '#필라테스', '#러닝', '#체중감량', '#건강식', '#비건', '#영양제', '#건강관리', '#웰니스', '#명상'],
    소형: ['#식단관리', '#운동루틴', '#홈트레이닝', '#간헐적단식', '#마크로', '#프로틴', '#운동일지', '#바디체크', '#체성분', '#건강일기'],
  },
}

// ─── 플랫폼별 해시태그 권장 사항 (v1 포트 + linkedin 추가) ───
const PLATFORM_RULES: Record<string, { max_tags: number; optimal_tags: [number, number]; 대형_ratio: number; 중형_ratio: number; 소형_ratio: number; tip: string }> = {
  instagram: {
    max_tags: 30,
    optimal_tags: [20, 30],
    대형_ratio: 0.1,
    중형_ratio: 0.6,
    소형_ratio: 0.3,
    tip: '인스타그램은 최대 30개 해시태그 사용 가능. 중형 해시태그 위주가 최적.',
  },
  youtube: {
    max_tags: 15,
    optimal_tags: [5, 15],
    대형_ratio: 0.2,
    중형_ratio: 0.5,
    소형_ratio: 0.3,
    tip: '유튜브는 태그보다 제목/설명의 키워드가 더 중요. 핵심 태그만 선별.',
  },
  tiktok: {
    max_tags: 10,
    optimal_tags: [3, 8],
    대형_ratio: 0.3,
    중형_ratio: 0.5,
    소형_ratio: 0.2,
    tip: '틱톡은 3~5개의 핵심 해시태그가 가장 효과적. 트렌딩 태그 포함 권장.',
  },
  linkedin: {
    max_tags: 5,
    optimal_tags: [3, 5],
    대형_ratio: 0.4,
    중형_ratio: 0.4,
    소형_ratio: 0.2,
    tip: '링크드인은 3~5개 전문 해시태그가 적절. 업계 키워드 위주로 선택.',
  },
}

// ─── 카테고리 매칭 키워드 (v1 포트) ───
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  교육: ['LEET', '리트', '로스쿨', '법학', '공부', '시험', '수험', '대학', '학원', '합격', '교육', '강의', '학습', '자격증', '입시'],
  금융: ['주식', '투자', '재테크', '부동산', '코인', '펀드', '보험', '금융', '경제', '은행', '대출', '배당'],
  기술: ['AI', '개발', '코딩', '프로그래밍', 'IT', '앱', '소프트웨어', '인공지능', '스타트업', '기술', '데이터', '클라우드'],
  라이프스타일: ['일상', '운동', '다이어트', '건강', '독서', '여행', '음식', '카페', '취미', '라이프'],
  마케팅: ['마케팅', '광고', 'SNS', '브랜딩', '홍보', '콘텐츠', '인플루언서', 'SEO', '디지털', '바이럴'],
  건강: ['건강', '운동', '피트니스', '헬스', '요가', '다이어트', '영양', '비건', '명상', '웰니스'],
}

function findCategory(topic: string): string {
  const topicLower = topic.toLowerCase()
  let bestMatch = '라이프스타일'
  let bestScore = 0

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((kw) => topicLower.includes(kw.toLowerCase())).length
    if (score > bestScore) {
      bestScore = score
      bestMatch = category
    }
  }

  return bestMatch
}

function generateTopicHashtags(topic: string): string[] {
  const words = topic.split(/[\s,./]+/).filter(Boolean)
  const tags: string[] = []

  for (const word of words) {
    tags.push(`#${word}`)
  }

  if (words.length >= 2) {
    tags.push(`#${words.slice(0, 2).join('')}`)
    tags.push(`#${words[0]}팁`)
    tags.push(`#${words[0]}공부`)
  }

  return tags
}

function recommend(input: Record<string, unknown>) {
  const topic = String(input.topic || '')
  if (!topic) return JSON.stringify({ success: false, message: 'topic 파라미터를 입력하세요. 예: topic="LEET 공부법"' })

  const platform = String(input.platform || 'instagram')
  const count = Number(input.count) || 30

  const rules = PLATFORM_RULES[platform] || PLATFORM_RULES.instagram
  const maxTags = Math.min(count, rules.max_tags)

  const category = findCategory(topic)
  const dbTags = HASHTAG_DB[category] || HASHTAG_DB['라이프스타일']
  const topicTags = generateTopicHashtags(topic)

  const nLarge = Math.max(2, Math.round(maxTags * rules.대형_ratio))
  const nMedium = Math.max(5, Math.round(maxTags * rules.중형_ratio))
  const nSmall = Math.max(3, Math.round(maxTags * rules.소형_ratio))

  const selected: string[] = []

  for (const tag of (dbTags['대형'] || []).slice(0, nLarge)) {
    if (!selected.includes(tag)) selected.push(tag)
  }
  for (const tag of (dbTags['중형'] || []).slice(0, nMedium)) {
    if (!selected.includes(tag)) selected.push(tag)
  }
  for (const tag of (dbTags['소형'] || []).slice(0, nSmall)) {
    if (!selected.includes(tag)) selected.push(tag)
  }
  for (const tag of topicTags) {
    if (!selected.includes(tag) && selected.length < maxTags) selected.push(tag)
  }

  const finalTags = selected.slice(0, maxTags)

  const large = finalTags.filter((t) => (dbTags['대형'] || []).includes(t))
  const medium = finalTags.filter((t) => (dbTags['중형'] || []).includes(t))
  const small = finalTags.filter((t) => (dbTags['소형'] || []).includes(t))
  const custom = finalTags.filter((t) => !large.includes(t) && !medium.includes(t) && !small.includes(t))

  return JSON.stringify({
    success: true,
    topic,
    platform,
    category,
    totalCount: finalTags.length,
    hashtags: finalTags,
    breakdown: {
      large: { count: large.length, tags: large },
      medium: { count: medium.length, tags: medium },
      small: { count: small.length, tags: small },
      custom: { count: custom.length, tags: custom },
    },
    platformTip: rules.tip,
  })
}

function analyze(input: Record<string, unknown>) {
  const hashtagsStr = String(input.hashtags || '')
  if (!hashtagsStr) return JSON.stringify({ success: false, message: 'hashtags 파라미터를 입력하세요. 예: hashtags="#LEET,#로스쿨,#법학"' })

  const hashtags = hashtagsStr.split(',').map((h) => h.trim()).filter(Boolean)

  const results = hashtags.map((tag) => {
    let foundCategory = '기타'
    let foundSize = '분류불가'

    for (const [cat, sizes] of Object.entries(HASHTAG_DB)) {
      for (const [size, tags] of Object.entries(sizes)) {
        if (tags.includes(tag)) {
          foundCategory = cat
          foundSize = size
          break
        }
      }
      if (foundCategory !== '기타') break
    }

    return { tag, category: foundCategory, size: foundSize }
  })

  const sizeCount = { 대형: 0, 중형: 0, 소형: 0, 분류불가: 0 }
  for (const r of results) {
    sizeCount[r.size as keyof typeof sizeCount] = (sizeCount[r.size as keyof typeof sizeCount] || 0) + 1
  }

  return JSON.stringify({
    success: true,
    analyzed: results.length,
    results,
    sizeDistribution: sizeCount,
    recommendation: sizeCount['중형'] >= results.length * 0.5
      ? '중형 해시태그 비율이 적절합니다.'
      : '중형 해시태그 비율을 50% 이상으로 높이는 것을 권장합니다.',
  })
}

function trending(input: Record<string, unknown>) {
  const category = String(input.category || '')

  if (category && HASHTAG_DB[category]) {
    return JSON.stringify({
      success: true,
      category,
      tags: HASHTAG_DB[category],
    })
  }

  const allCategories: Record<string, Record<string, string[]>> = {}
  for (const [cat, sizes] of Object.entries(HASHTAG_DB)) {
    allCategories[cat] = sizes
  }

  return JSON.stringify({
    success: true,
    categories: Object.keys(allCategories),
    data: allCategories,
  })
}

export const hashtagGenerator: ToolHandler = (input) => {
  const action = String(input.action || 'recommend')

  if (action === 'recommend') return recommend(input)
  if (action === 'analyze') return analyze(input)
  if (action === 'trending') return trending(input)

  return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. recommend, analyze, trending을 사용하세요.` })
}
