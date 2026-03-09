export type SnsAccount = {
  id: string
  platform: string
  accountName: string
  accountId: string
  isActive: boolean
  createdAt: string
}

export type SnsContent = {
  id: string
  platform: string
  title: string
  body?: string
  hashtags?: string
  imageUrl?: string
  status: string
  snsAccountId?: string | null
  accountName?: string | null
  variantOf?: string | null
  variants?: { id: string; title: string; status: string; metadata?: unknown; createdAt: string }[]
  metadata?: Record<string, unknown> | null
  isCardNews?: boolean
  cardSeriesId?: string | null
  cardIndex?: number | null
  priority?: number
  createdBy: string
  creatorName: string
  agentId?: string
  reviewedBy?: string
  reviewedAt?: string
  rejectReason?: string
  publishedUrl?: string
  publishedAt?: string
  publishError?: string
  scheduledAt?: string | null
  createdAt: string
  updatedAt: string
}

export type SnsMetrics = { views: number; likes: number; shares: number; clicks: number; updatedAt?: string }
export type SnsAbScore = { id: string; title: string; metrics: SnsMetrics | null; score: number; status: string }
export type SnsAbResult = {
  original: SnsContent
  variants: SnsContent[]
  winner: { id: string; score: number } | null
  scores: SnsAbScore[]
}

export type SnsStats = {
  total: number
  byStatus: { status: string; count: number }[]
  byPlatform: { platform: string; total: number; published: number }[]
  dailyTrend: { date: string; count: number }[]
  days: number
}

export type Agent = { id: string; name: string }

export type QueueItem = SnsContent & { priority?: number }
export type QueueStats = {
  byStatus: { status: string; count: number }[]
  byPlatform: { platform: string; count: number }[]
  nextScheduled: string | null
  todayCount: number
  failedCount: number
}

export type CardNewsCard = {
  index: number
  imageUrl: string
  caption: string
  layout: 'cover' | 'content' | 'closing'
}

export const STATUS_LABELS: Record<string, string> = {
  draft: '초안',
  pending: '승인 대기',
  approved: '승인됨',
  scheduled: '예약됨',
  rejected: '반려됨',
  published: '발행 완료',
  failed: '발행 실패',
  publishing: '발행 중',
}

export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-700 text-slate-300',
  pending: 'bg-amber-500/20 text-amber-400',
  approved: 'bg-emerald-500/20 text-emerald-400',
  scheduled: 'bg-blue-500/20 text-blue-400',
  rejected: 'bg-red-500/20 text-red-400',
  published: 'bg-cyan-500/20 text-cyan-400',
  failed: 'bg-red-500/20 text-red-400',
  publishing: 'bg-purple-500/20 text-purple-400',
}

export const PLATFORM_LABELS: Record<string, string> = {
  instagram: '인스타그램',
  tistory: '티스토리',
  naver_blog: '네이버 블로그',
  twitter: '트위터',
  facebook: '페이스북',
  youtube: '유튜브',
  daum_cafe: '다음 카페',
}

export const PLATFORM_OPTIONS = [
  { value: 'instagram', label: '인스타그램' },
  { value: 'tistory', label: '티스토리' },
  { value: 'naver_blog', label: '네이버 블로그' },
  { value: 'twitter', label: '트위터' },
  { value: 'facebook', label: '페이스북' },
]
