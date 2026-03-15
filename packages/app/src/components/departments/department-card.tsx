import { Bot } from 'lucide-react'
import { AvatarGroup } from './avatar-group'

export interface DepartmentCardProps {
    name: string;
    agentCount: number;
    description: string;
    avatars: string[];
    monthlyCost: number;
    featured?: boolean;
}

export function DepartmentCard({
    name,
    agentCount,
    description,
    avatars,
    monthlyCost,
    featured = false
}: DepartmentCardProps) {
    const borderClass = featured ? 'border-2 border-cyan-400' : 'border border-slate-800 hover:border-cyan-400/50';
    const headerClass = featured ? 'text-slate-100' : 'text-slate-100 group-hover:text-cyan-400';
    const badgeClass = featured ? 'bg-[rgba(34,211,238,0.10)] text-cyan-400' : 'bg-slate-800 text-slate-300';

    return (
        <div className={`group flex flex-col bg-[#1e293b] rounded-xl overflow-hidden hover:shadow-lg dark:hover:shadow-cyan-400/10 transition-all cursor-pointer ${borderClass}`}>
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-xl font-bold transition-colors ${headerClass}`}>{name}</h3>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${badgeClass}`}>
                        <Bot className="w-4 h-4" />
                        <span className="text-sm font-bold">{agentCount}</span>
                    </div>
                </div>
                <p className="text-sm text-slate-400 mb-6 flex-1 line-clamp-3">{description}</p>

                <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-700">
                    <AvatarGroup avatars={avatars} />
                    <div className="text-right">
                        <span className="text-xs text-slate-400 block mb-0.5">월 예상 비용</span>
                        <span className="font-mono text-sm font-semibold text-white">
                            ${monthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
