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
  draft: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  published: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  publishing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
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
