import { ReactNode } from 'react'

export interface ReportListItemProps {
    title: string;
    statusText: string;
    statusColorClass: string; // e.g. 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
    agentName: string;
    time: string;
    icon: ReactNode;
    isActive?: boolean;
}

export function ReportListItem({ title, statusText, statusColorClass, agentName, time, icon, isActive }: ReportListItemProps) {
    return (
        <div className={`group flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${isActive
                ? 'bg-slate-900 border border-cyan-400/30 hover:border-cyan-400/50'
                : 'bg-slate-950 border border-transparent hover:bg-slate-900 hover:border-slate-800'
            }`}>
            <div className="flex items-start gap-4">
                <div className={`flex items-center justify-center rounded size-10 shrink-0 mt-0.5 ${isActive
                        ? 'bg-cyan-400/10 text-cyan-400'
                        : 'bg-slate-900 border border-slate-800 text-slate-400'
                    }`}>
                    {icon}
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                        <p className={`text-base font-medium leading-tight ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>
                            {title}
                        </p>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusColorClass}`}>
                            {statusText}
                        </span>
                    </div>
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                        <span>Agent: {agentName}</span>
                        <span>·</span>
                        <span className="font-mono text-xs">{time}</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
