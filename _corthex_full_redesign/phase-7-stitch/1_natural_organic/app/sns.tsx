/**
 * SNS Page - Natural Organic Theme
 *
 * API Endpoints:
 *   GET  /workspace/sns-accounts       - Fetch linked SNS accounts
 *   GET  /workspace/agents             - Fetch AI agents list
 *   GET  /workspace/sns/stats?days=N   - Fetch SNS statistics
 *   (Tab components use additional endpoints)
 */
import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Plus, Filter, Camera, Briefcase, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import { api } from '../lib/api'
import { ContentTab } from '../components/sns/content-tab'
import { QueueTab } from '../components/sns/queue-tab'
import { CardNewsTab } from '../components/sns/card-news-tab'
import { StatsTab } from '../components/sns/stats-tab'
import { AccountsTab } from '../components/sns/accounts-tab'
import type { SnsAccount, Agent } from '../components/sns/sns-types'

const TAB_ITEMS = [
  { value: 'content', label: 'Content Library' },
  { value: 'queue', label: 'Publication Queue' },
  { value: 'cardnews', label: 'Card News' },
  { value: 'stats', label: 'Performance Stats' },
  { value: 'accounts', label: 'Linked Accounts' },
]

// Stats summary for mobile bottom card
function MobileStatsSummary() {
  const { data: statsData } = useQuery({
    queryKey: ['sns-stats', 7],
    queryFn: () => api.get<{ data: { total: number; byStatus: Array<{ status: string; count: number }>; byPlatform: Array<{ platform: string; total: number; published: number }> } }>('/workspace/sns/stats?days=7'),
  })

  const stats = statsData?.data
  if (!stats || stats.total === 0) return null

  const publishedCount = stats.byStatus.find((s) => s.status === 'published')?.count ?? 0

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-stone-100 via-stone-100 to-transparent pt-12 z-10 pointer-events-none">
      <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-4 pointer-events-auto">
        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">This Week</h3>
        <div className="flex justify-between items-center divide-x divide-stone-200">
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-semibold text-stone-800 font-mono tabular-nums">{publishedCount}</span>
            <span className="text-[10px] text-stone-400 mt-1">Published</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-semibold font-mono tabular-nums" style={{ color: '#5a7247' }}>{stats.total}</span>
            <span className="text-[10px] text-stone-400 mt-1">Total Content</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-semibold text-stone-800 font-mono tabular-nums">{stats.byPlatform.length}</span>
            <span className="text-[10px] text-stone-400 mt-1">Platforms</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SnsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'content'

  const setTab = useCallback((t: string) => {
    setSearchParams({ tab: t }, { replace: true })
  }, [setSearchParams])

  const { data: accountsData } = useQuery({
    queryKey: ['sns-accounts'],
    queryFn: () => api.get<{ data: SnsAccount[] }>('/workspace/sns-accounts'),
  })

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  const accounts = accountsData?.data || []
  const agents = agentsData?.data || []

  return (
    <div data-testid="sns-page" className="min-h-screen flex" style={{ backgroundColor: '#faf8f5' }}>
      {/* Fixed Sidebar */}
      <aside className="w-64 fixed inset-y-0 left-0 bg-white border-r border-stone-200 flex flex-col z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#6b705c' }}>
              <span className="material-symbols-outlined">eco</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-none tracking-tight">CORTHEX v2</h1>
              <p className="text-xs font-medium" style={{ color: '#6b705c' }}>Natural Organic Edition</p>
            </div>
          </div>
          <nav className="space-y-1">
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-100 transition-colors" href="#">
              <span className="material-symbols-outlined text-stone-500">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors" style={{ backgroundColor: 'rgba(107,112,92,0.1)', color: '#6b705c' }} href="#">
              <span className="material-symbols-outlined">share_reviews</span>
              <span className="text-sm font-bold">SNS Management</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-100 transition-colors" href="#">
              <span className="material-symbols-outlined text-stone-500">analytics</span>
              <span className="text-sm font-medium">Analytics</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-100 transition-colors" href="#">
              <span className="material-symbols-outlined text-stone-500">workspaces</span>
              <span className="text-sm font-medium">Workspaces</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-100 transition-colors" href="#">
              <span className="material-symbols-outlined text-stone-500">settings</span>
              <span className="text-sm font-medium">Settings</span>
            </a>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <button className="w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 p-3 rounded-xl transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            <span className="text-sm font-bold">New Project</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-stone-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ color: '#6b705c' }}>hub</span>
            <h2 className="text-xl font-bold tracking-tight">Social Content Hub</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors">search</span>
              <input className="pl-10 pr-4 py-2 bg-stone-100 border-none rounded-xl text-sm focus:ring-2 w-64 transition-all" style={{ '--tw-ring-color': 'rgba(107,112,92,0.2)' } as React.CSSProperties} placeholder="Search content..." type="text" />
            </div>
            <button className="flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition-all" style={{ backgroundColor: '#ec5b13' }}>
              <span className="material-symbols-outlined text-sm">edit_square</span>
              Create Post
            </button>
            <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden border-2 border-white shadow-sm">
              <img className="w-full h-full object-cover" alt="User profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCUfDRJiMmohK7YkDBlIgDjkUJEYWlpUlXHwwPmrITgzLs4cg8wXHz6p3TXpqupbX8RPi-UPl0wv-5qJY-8FypkXTtrZCYUvhlWuII-m5kfLJE66z5STNGVoMMwS8q7SyNLeqrtSXdUOYm0TibFqIZl6pRNhrIAsRC0fo84ZoKjqNZ717EMhAedkqnbCb6xJNH_EhYslyoaf00J_pwbPQ-pPh7rX_FBHDIOanLkpMqMi1v_QlU1RuUZXhnnIMmXIWMDHY87s5gmIQl" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* Page Header & Action */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-stone-800 mb-2">Organic Content Pipeline</h1>
              <p className="text-stone-500 max-w-lg">Orchestrate your social presence with AI-assisted generation and automated scheduling for natural brand growth.</p>
            </div>
            <button className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-md" style={{ backgroundColor: '#6b705c' }}>
              <span className="material-symbols-outlined">auto_awesome</span>
              Generate New Content
            </button>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-stone-200 mb-8 overflow-x-auto">
            <div className="flex gap-8">
              {TAB_ITEMS.map((item) => (
                <button
                  key={item.value}
                  data-testid={`sns-tab-${item.value}`}
                  onClick={() => setTab(item.value)}
                  className={`pb-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    tab === item.value
                      ? 'font-bold'
                      : 'border-transparent text-stone-400 hover:text-stone-600'
                  }`}
                  style={tab === item.value ? { borderColor: '#6b705c', color: '#6b705c' } : {}}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          {tab === 'content' && (
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-stone-200 text-sm font-medium">
                <span className="text-stone-400">Platform:</span>
                <select className="bg-transparent border-none p-0 focus:ring-0 text-sm font-bold cursor-pointer">
                  <option>All Platforms</option>
                  <option>Instagram</option>
                  <option>Tistory</option>
                  <option>X / Twitter</option>
                </select>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-stone-200 text-sm font-medium">
                <span className="text-stone-400">Status:</span>
                <select className="bg-transparent border-none p-0 focus:ring-0 text-sm font-bold cursor-pointer">
                  <option>Any Status</option>
                  <option>Draft</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Scheduled</option>
                  <option>Published</option>
                </select>
              </div>
              <button className="ml-auto text-sm font-bold flex items-center gap-1 hover:underline" style={{ color: '#6b705c' }}>
                <span className="material-symbols-outlined text-sm">view_kanban</span>
                Switch to Board
              </button>
            </div>
          )}

          {/* Content Grid (Kanban Style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Card 1: Pending */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="relative aspect-video">
                <img className="w-full h-full object-cover" alt="Natural skincare lifestyle photography" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4dP1_eyfMG1GHe7vkf1KnXuUHG3R-8yRTLceZO6q2ynxamu7GBjTMr9zbs1jTFOs0NT7h6qGD39X8InkeeVYeSkT9ivtkuTwaBPNCdb1w9r6Gn3hknxto4bwtjuy3dgb4q3XJ-XlTJNCYE1iuwfsTzEJiSdFfAJECPD3oZ2vAQ0lwxVrikvzzUQV-fhVLAsvRrcmc-ICbUIUmUnDsLgbaug3_qghyJ8ORvZ1V1JV5xMtyXZrYTicXulJxSxYoLW-PrL_Zs5XQTwww" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-amber-600 border border-amber-200">Pending</span>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-stone-800 shadow-sm">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-xs" style={{ color: '#6b705c' }}>calendar_today</span>
                  <span className="text-xs text-stone-400">Created Oct 24, 2023</span>
                </div>
                <h3 className="font-bold text-lg mb-2 leading-tight group-hover:transition-colors" style={{ ['--tw-text-opacity' as string]: 1 }}>10 Tips for Morning Meditation</h3>
                <p className="text-sm text-stone-500 line-clamp-2 mb-4">Discover how to start your day with mindfulness and natural energy boosters...</p>
                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-pink-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[10px]">photo_camera</span>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[10px]">article</span>
                    </div>
                  </div>
                  <button className="text-xs font-bold uppercase tracking-widest transition-colors" style={{ color: '#6b705c' }}>Approve</button>
                </div>
              </div>
            </div>

            {/* Card 2: Approved */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="relative aspect-video">
                <img className="w-full h-full object-cover" alt="Minimalist wooden workspace background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhSmNPLfVyHa7QkbHgk9SaGchPYyLjMjWucz8LaRS8jFp2RdOdhuxPmD4bAjBgsBuZ_GcVEeTsVeHvIukSv5dPTFHB5HeNIrLrsfgUiUj9EWKqoaGIGIUyoba8K-hfnrHpdgow1uH5dfRw-ymZca5iFZwmlqOOYmBI642v2YmM9VTo3RYoZ3cQHqsIftjM5aQ-mjhuwi4Ru54DpFG9Qsg93GlXUkcwNPzF4Nd5NkMt5uwJOauqFTRi3hECKuYBDQn3knnwEM6NpHJd" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-green-600 border border-green-200">Approved</span>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-stone-800 shadow-sm">
                    <span className="material-symbols-outlined text-sm">alternate_email</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-xs" style={{ color: '#6b705c' }}>schedule</span>
                  <span className="text-xs text-stone-400">Ready to Queue</span>
                </div>
                <h3 className="font-bold text-lg mb-2 leading-tight">Sustainable Living Trends 2024</h3>
                <p className="text-sm text-stone-500 line-clamp-2 mb-4">Analyzing the shift towards zero-waste lifestyles and organic home decor...</p>
                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[10px]">link</span>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-stone-400 hover:text-stone-600 transition-colors uppercase tracking-widest">Edit Draft</button>
                </div>
              </div>
            </div>

            {/* Card 3: Scheduled */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="relative aspect-video">
                <img className="w-full h-full object-cover" alt="Close up of organic green tea leaves" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1TMmzLL5qzQqCjilktJwJvcf3kYlPdMaY9OFISDVTDajtqg26YLhOWsJeYSoeMCCovhu6cNRRlr1FsOy2SKM6RFTNBoJdLrP5CC5Iecdjjy7VtsI9e0cgqWgqJzC5Spu2Q-cw5ilDTUoXAxinJULd-woeuZYysU1EIVo_E6RFcXoylq8MCdZ3Wyo15FBQYIJixC8JY8isxLDbke3kYA2CAb6CmBdURKPTfSsrT886_pCvHFXMyq-r32dfk0MhTUPlpisk-cW91hru" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-blue-600 border border-blue-200">Scheduled</span>
                </div>
                <div className="absolute top-3 right-3 flex flex-col gap-1">
                  <div className="w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-stone-800 shadow-sm">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-stone-800 shadow-sm">
                    <span className="material-symbols-outlined text-sm">movie</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-xs" style={{ color: '#6b705c' }}>event_available</span>
                  <span className="text-xs text-stone-400">Posting Tomorrow at 9:00 AM</span>
                </div>
                <h3 className="font-bold text-lg mb-2 leading-tight">The Ritual of Tea Making</h3>
                <p className="text-sm text-stone-500 line-clamp-2 mb-4">Explore the meditative process of brewing the perfect cup of organic green tea...</p>
                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-pink-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[10px]">photo_camera</span>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-stone-400 hover:text-stone-600 transition-colors uppercase tracking-widest">Reschedule</button>
                </div>
              </div>
            </div>

            {/* Card 4: Published */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group opacity-75 grayscale hover:grayscale-0 transition-all">
              <div className="relative aspect-video">
                <img className="w-full h-full object-cover" alt="Sunlight hitting a stack of linen towels" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkp3tf9lIxAUfqxNGotsqDsOHLZkgPoKhld-fRh5bxylwd9mHIuSsFAzTWoybswxfokmmU2Xc-es5KdYRtUoecvXlz609m_IsO3XkAei4G2sYxGa4z9kvpSsiGr2agojAaID2n9VL7rpCQqNaRc3RlDi2tcTpzl8OYin-DLytdPJ4aOKTqFuwpb1kFjdyA0QI_DF7UabB1oS2S1t6y9OLAh09LcJzCfEy6tHzwqeaPe6O8pt_B8gkG93AsYM3qBwQv5f8BRDAN-h_B" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-stone-100/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-stone-600 border border-stone-200">Published</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-xs" style={{ color: '#6b705c' }}>check_circle</span>
                  <span className="text-xs text-stone-400">Live for 2 days &bull; 1.2k reach</span>
                </div>
                <h3 className="font-bold text-lg mb-2 leading-tight">Natural Fabrics for Better Sleep</h3>
                <p className="text-sm text-stone-500 line-clamp-2 mb-4">Why organic linen and cotton are the keys to a restful night's sleep...</p>
                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-stone-400">favorite</span>
                      <span className="text-xs text-stone-400 font-bold">124</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-stone-400">chat_bubble</span>
                      <span className="text-xs text-stone-400 font-bold">18</span>
                    </div>
                  </div>
                  <button className="text-xs font-bold uppercase tracking-widest transition-colors" style={{ color: '#6b705c' }}>View Stats</button>
                </div>
              </div>
            </div>

            {/* Create New Empty Card */}
            <button className="border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center p-8 hover:bg-white transition-all group min-h-[320px]" style={{ ['--hover-border' as string]: 'rgba(107,112,92,0.4)' }}>
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-4 transition-colors" style={{ ['--group-hover-bg' as string]: 'rgba(107,112,92,0.1)' }}>
                <span className="material-symbols-outlined text-stone-400 transition-colors">add_circle</span>
              </div>
              <span className="font-bold text-stone-500 group-hover:text-stone-800 transition-colors">New Manual Post</span>
              <span className="text-xs text-stone-400 mt-1">Or use AI Generator above</span>
            </button>
          </div>
        </div>
      </main>

      {/* Mobile Stats Summary -- bottom card */}
      {tab === 'content' && <MobileStatsSummary />}
    </div>
  )
}
