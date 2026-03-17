import { ReactNode } from 'react'

export interface OrgTreeNodeProps {
    type: 'root' | 'department';
    title: string;
    subtitle: string;
    icon: ReactNode;
    agentCount?: number;
    selected?: boolean;
}

export function OrgTreeNode({ type, title, subtitle, icon, agentCount, selected }: OrgTreeNodeProps) {
    if (type === 'root') {
        return (
            <div className="relative group cursor-pointer inline-flex">
                <div className="absolute inset-0 bg-[#5a7247]/20 blur-xl rounded-2xl group-hover:bg-[#5a7247]/30 transition-all duration-300"></div>
                <div className="relative w-64 bg-white border-2 border-[#5a7247] rounded-2xl p-4 shadow-xl flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#5a7247]/20 flex items-center justify-center text-[#5a7247] mb-3">
                        {icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                    <p className="text-[#5a7247] text-xs font-medium uppercase tracking-wider">{subtitle}</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`w-56 bg-white border-2 ${selected ? 'border-[#5a7247] ring-4 ring-[#5a7247]/20' : 'border-slate-200'} rounded-2xl p-4 shadow-lg cursor-pointer transition-transform hover:-translate-y-1 relative z-10`}>
            <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    {icon}
                </div>
                {selected && <span className="px-2 py-1 rounded text-[10px] font-bold bg-[#5a7247]/20 text-[#5a7247]">SELECTED</span>}
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
            <p className="text-stone-400 text-xs mb-3">{subtitle}</p>
            {agentCount !== undefined && (
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs font-medium text-slate-600">{agentCount} Agents</span>
                </div>
            )}
        </div>
    )
}
