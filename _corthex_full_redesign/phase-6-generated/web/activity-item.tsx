import { ReactNode } from 'react'

export interface ActivityItemProps {
    indicatorColor?: 'success' | 'primary' | 'danger' | 'slate';
    indicatorPulse?: boolean;
    content: ReactNode;
    subContent: string;
    timeAgo: string;
}

export function ActivityItem({
    indicatorColor = 'success',
    indicatorPulse = false,
    content,
    subContent,
    timeAgo
}: ActivityItemProps) {
    const getIndicatorColorClass = () => {
        switch (indicatorColor) {
            case 'success': return 'bg-emerald-500';
            case 'primary': return 'bg-cyan-400';
            case 'danger': return 'bg-red-500';
            case 'slate': return 'bg-slate-600';
            default: return 'bg-emerald-500';
        }
    }

    return (
        <li className="flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors">
            <div className={`w-2 h-2 rounded-full ${getIndicatorColorClass()} shrink-0 mt-1 self-start ${indicatorPulse ? 'animate-pulse' : ''}`}></div>
            <div className="flex-1 min-w-0">
                <div className="text-slate-100 text-sm font-medium truncate">
                    {content}
                </div>
                <p className="text-slate-400 text-xs mt-1 truncate">{subContent}</p>
            </div>
            <div className="text-slate-500 text-xs font-mono whitespace-nowrap shrink-0">
                {timeAgo}
            </div>
        </li>
    )
}
