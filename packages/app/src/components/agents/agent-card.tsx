import { Headset, BarChart2, Shield } from 'lucide-react'
import { TierBadge } from './tier-badge'

export interface AgentCardProps {
    tier: 'T1' | 'T2' | 'T3';
    name: string;
    department: string;
    status: 'online' | 'standby' | 'running';
    jobCount: number;
}

export function AgentCard({ tier, name, department, status, jobCount }: AgentCardProps) {
    const getIconAndBg = () => {
        switch (tier) {
            case 'T1': return { Icon: Headset, bg: 'bg-gradient-to-br from-cyan-400 to-cyan-600' }
            case 'T2': return { Icon: BarChart2, bg: 'bg-gradient-to-br from-violet-400 to-violet-600' }
            case 'T3': return { Icon: Shield, bg: 'bg-gradient-to-br from-slate-400 to-slate-600' }
        }
    }
    const { Icon, bg } = getIconAndBg();

    const getStatusIndicator = () => {
        switch (status) {
            case 'online': return <><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-slate-300 text-xs font-mono">온라인</span></>;
            case 'standby': return <><div className="w-2 h-2 rounded-full bg-slate-600"></div><span className="text-slate-300 text-xs font-mono">대기중</span></>;
            case 'running': return <><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><span className="text-slate-300 text-xs font-mono">실행중</span></>;
        }
    }

    return (
        <div className="flex flex-col gap-4 p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-400/50 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${bg}`}>
                    <Icon className="text-white w-6 h-6" />
                </div>
                <TierBadge level={tier} />
            </div>
            <div>
                <h3 className="text-slate-100 text-lg font-bold leading-tight group-hover:text-cyan-400 transition-colors">{name}</h3>
                <p className="text-slate-400 text-sm font-medium mt-1">{department}</p>
            </div>
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                    {getStatusIndicator()}
                </div>
                <span className="text-slate-400 text-xs font-mono">작업 {jobCount}건</span>
            </div>
        </div>
    )
}
