import { Headset, Edit2, Trash2, CheckCircle2, MessageSquare } from 'lucide-react'
import { TierBadge } from './tier-badge'
import { PerformanceStats } from './performance-stats'

export interface AgentActivityProps {
    id: string;
    type: 'success' | 'message';
    title: string;
    detail: string;
    timeAgo: string;
}

export interface AgentDetailProps {
    tier?: 'T1' | 'T2' | 'T3';
    name?: string;
    department?: string;
    agentId?: string;
    description?: string;
    activities?: AgentActivityProps[];
}

export function AgentDetail({
    tier = 'T1',
    name = '비서 에이전트',
    department = '인사부',
    agentId = 'AGT-089A',
    description = '사내 규정 안내, 일정 조율, 그리고 기본적인 인사 관련 문의를 처리하는 지능형 비서입니다.',
    activities = [
        { id: '1', type: 'success', title: '신규 입사자 온보딩 메일 발송', detail: '대상: 3명 · 소요시간: 1.2초', timeAgo: '방금 전' },
        { id: '2', type: 'message', title: '연차 규정 문의 응답', detail: '사용자: user_492', timeAgo: '15분 전' },
        { id: '3', type: 'success', title: '주간 인사팀 회의 일정 조율 완료', detail: '참석자: 8명', timeAgo: '1시간 전' },
    ]
}: AgentDetailProps) {
    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#5a7247] to-cyan-600 flex items-center justify-center shadow-lg relative">
                        <Headset className="text-white w-10 h-10" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#102022] rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <h2 className="text-slate-100 text-3xl font-bold tracking-tight">{name}</h2>
                            <TierBadge level={tier} />
                        </div>
                        <p className="text-stone-500 text-base font-mono">{department} · ID: {agentId}</p>
                        <p className="text-stone-600 text-sm max-w-lg mt-1">{description}</p>
                    </div>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                    <button className="flex items-center justify-center rounded-lg h-10 px-6 bg-stone-100 text-stone-600 text-sm font-bold border border-stone-200 hover:bg-stone-200 transition-colors">
                        <Edit2 className="w-4 h-4 mr-2" />
                        편집
                    </button>
                    <button className="flex items-center justify-center rounded-lg h-10 px-6 bg-red-500/10 text-red-400 text-sm font-bold border border-red-500/20 hover:bg-red-500/20 transition-colors">
                        <Trash2 className="w-4 h-4 mr-2" />
                        삭제
                    </button>
                </div>
            </div>

            <div className="border-b border-stone-200 mt-6">
                <div className="flex gap-8">
                    <button className="pb-4 border-b-2 border-[#5a7247] text-[#5a7247] font-bold text-sm">개요</button>
                    <button className="pb-4 border-b-2 border-transparent text-stone-500 hover:text-stone-600 font-medium text-sm transition-colors">Soul</button>
                    <button className="pb-4 border-b-2 border-transparent text-stone-500 hover:text-stone-600 font-medium text-sm transition-colors">작업 이력</button>
                    <button className="pb-4 border-b-2 border-transparent text-stone-500 hover:text-stone-600 font-medium text-sm transition-colors">설정</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <h3 className="text-slate-100 font-bold text-lg mb-2">최근 활동</h3>
                    <div className="bg-white/50 rounded-xl border border-stone-200 divide-y divide-slate-800">
                        {activities.map(act => (
                            <div key={act.id} className="p-4 flex items-center justify-between hover:bg-stone-100/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    {act.type === 'success' ? (
                                        <div className="w-10 h-10 rounded-lg bg-green-900/30 text-green-400 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-blue-900/30 text-blue-400 flex items-center justify-center">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-slate-100 font-medium text-sm">{act.title}</p>
                                        <p className="text-stone-500 text-xs font-mono mt-1">{act.detail}</p>
                                    </div>
                                </div>
                                <span className="text-stone-400 text-xs font-mono">{act.timeAgo}</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-3 rounded-lg border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-100 transition-colors mt-2">
                        전체 활동 보기
                    </button>
                </div>
                <div className="lg:col-span-1">
                    <PerformanceStats />
                </div>
            </div>
        </div>
    )
}
