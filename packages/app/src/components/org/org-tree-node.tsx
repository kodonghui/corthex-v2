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
                <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-2xl group-hover:bg-cyan-400/30 transition-all duration-300"></div>
                <div className="relative w-64 bg-slate-900 border-2 border-cyan-400 rounded-2xl p-4 shadow-xl flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-cyan-400/20 flex items-center justify-center text-cyan-400 mb-3">
                        {icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                    <p className="text-cyan-400 text-xs font-medium uppercase tracking-wider">{subtitle}</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`w-56 bg-white dark:bg-slate-800 border-2 ${selected ? 'border-cyan-400 ring-4 ring-cyan-400/20' : 'border-slate-200 dark:border-slate-700'} rounded-2xl p-4 shadow-lg cursor-pointer transition-transform hover:-translate-y-1 relative z-10`}>
            <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    {icon}
                </div>
                {selected && <span className="px-2 py-1 rounded text-[10px] font-bold bg-cyan-400/20 text-cyan-400">SELECTED</span>}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">{subtitle}</p>
            {agentCount !== undefined && (
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{agentCount} Agents</span>
                </div>
            )}
        </div>
    )
}
