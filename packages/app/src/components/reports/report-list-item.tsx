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
                ? 'bg-white border border-[#5a7247]/30 hover:border-[#5a7247]/50'
                : 'bg-[#faf8f5] border border-transparent hover:bg-white hover:border-stone-200'
            }`}>
            <div className="flex items-start gap-4">
                <div className={`flex items-center justify-center rounded size-10 shrink-0 mt-0.5 ${isActive
                        ? 'bg-[#5a7247]/10 text-[#5a7247]'
                        : 'bg-white border border-stone-200 text-stone-500'
                    }`}>
                    {icon}
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                        <p className={`text-base font-medium leading-tight ${isActive ? 'text-slate-100' : 'text-stone-600'}`}>
                            {title}
                        </p>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusColorClass}`}>
                            {statusText}
                        </span>
                    </div>
                    <p className="text-stone-500 text-sm flex items-center gap-2">
                        <span>Agent: {agentName}</span>
                        <span>·</span>
                        <span className="font-mono text-xs">{time}</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
