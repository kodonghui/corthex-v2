import { ReactNode } from 'react'

export interface DebateCardProps {
    title: string;
    participants: number;
    icon: ReactNode;
    iconBgClass: string;
    active?: boolean;
}

export function DebateCard({ title, participants, icon, iconBgClass, active }: DebateCardProps) {
    const containerClass = active
        ? 'bg-cyan-400/10 border-l-cyan-400 cursor-pointer'
        : 'hover:bg-cyan-400/5 cursor-pointer border-l-transparent transition-colors';

    const dotClass = active ? 'bg-emerald-500' : 'bg-slate-500';

    return (
        <div className={`flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between border-l-4 ${containerClass}`}>
            <div className="flex items-center gap-3">
                <div className={`flex flex-shrink-0 items-center justify-center rounded size-10 ${iconBgClass}`}>
                    {icon}
                </div>
                <div className="flex flex-col justify-center">
                    <p className={`text-sm font-medium leading-normal line-clamp-1 ${active ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>{title}</p>
                    <p className="text-slate-500 text-xs font-normal leading-normal line-clamp-1">{participants} participants</p>
                </div>
            </div>
            <div className="shrink-0 flex size-5 items-center justify-center">
                <div className={`size-2 rounded-full ${dotClass}`}></div>
            </div>
        </div>
    )
}
