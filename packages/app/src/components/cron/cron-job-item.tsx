import { ReactNode } from 'react'

export interface CronJobItemProps {
    name: string;
    agentName: string;
    cronExpression: string;
    nextRun: string;
    icon: ReactNode;
    isActive?: boolean;
    statusColorClass: string; // e.g., 'bg-green-500', 'bg-yellow-500'
}

export function CronJobItem({ name, agentName, cronExpression, nextRun, icon, isActive, statusColorClass }: CronJobItemProps) {
    return (
        <div className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isActive
                ? 'bg-[#faf8f5] border-[#5a7247]/30'
                : 'hover:bg-stone-100/50 border-transparent'
            }`}>
            <div className={`flex items-center justify-center rounded shrink-0 size-10 ${isActive ? 'text-[#5a7247] bg-[#5a7247]/10' : 'text-stone-500 bg-stone-100'
                }`}>
                {icon}
            </div>
            <div className="flex flex-1 flex-col justify-center min-w-0">
                <p className="text-sm font-medium truncate text-slate-100">{name}</p>
                <p className="text-stone-500 text-xs truncate mt-0.5">Agent: {agentName}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
                        {cronExpression}
                    </span>
                    <span className="text-[10px] text-stone-500 truncate">Next: {nextRun}</span>
                </div>
            </div>
            <div className="shrink-0 pt-1">
                <div className={`size-2.5 rounded-full ${statusColorClass}`}></div>
            </div>
        </div>
    )
}
