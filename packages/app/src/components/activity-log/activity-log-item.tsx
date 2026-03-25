import { ReactNode } from 'react'

export interface ActivityLogItemProps {
    title: string;
    statusText: string;
    statusBadgeClass: string;
    agentName: string;
    description: string;
    time: string;
    timeAgo: string;
    icon: ReactNode;
    themeColorClass: string; // e.g., 'bg-emerald-500', 'bg-violet-500'
}

export function ActivityLogItem({ title, statusText, statusBadgeClass, agentName, description, time, timeAgo, icon, themeColorClass }: ActivityLogItemProps) {
    return (
        <div className="flex gap-4 bg-corthex-surface/80 border border-corthex-border/60 rounded-xl p-4 hover:border-corthex-border transition-colors relative overflow-hidden group">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${themeColorClass}`}></div>
            <div className="flex items-start gap-4 w-full">
                <div className="relative">
                    <div className="bg-slate-200 aspect-square bg-cover rounded-full h-12 w-12 border-2 border-white shadow-sm flex items-center justify-center text-stone-400">
                        {icon}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${themeColorClass}`}></div>
                </div>
                <div className="flex flex-1 flex-col justify-center gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-corthex-text-primary text-base font-semibold leading-tight">{title}</p>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClass}`}>
                            {statusText}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-corthex-elevated px-2 py-0.5 text-xs font-medium text-corthex-text-secondary ring-1 ring-inset ring-slate-500/20">
                            {agentName}
                        </span>
                    </div>
                    <p className="text-corthex-text-secondary text-sm font-normal leading-relaxed">{description}</p>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-1 text-right">
                    <p className="font-mono text-stone-400 text-sm font-medium tracking-tight">{time}</p>
                    <p className="text-stone-500 text-xs font-normal">{timeAgo}</p>
                </div>
            </div>
        </div>
    )
}
