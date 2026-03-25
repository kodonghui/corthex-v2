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
        ? 'bg-corthex-accent/10 border-l-corthex-accent cursor-pointer'
        : 'hover:bg-corthex-accent/5 cursor-pointer border-l-transparent transition-colors';

    const dotClass = active ? 'bg-emerald-500' : 'bg-slate-500';

    return (
        <div className={`flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between border-l-4 ${containerClass}`}>
            <div className="flex items-center gap-3">
                <div className={`flex flex-shrink-0 items-center justify-center rounded size-10 ${iconBgClass}`}>
                    {icon}
                </div>
                <div className="flex flex-col justify-center">
                    <p className={`text-sm font-medium leading-normal line-clamp-1 ${active ? 'text-corthex-text-primary' : 'text-corthex-text-primary'}`}>{title}</p>
                    <p className="text-stone-400 text-xs font-normal leading-normal line-clamp-1">{participants} participants</p>
                </div>
            </div>
            <div className="shrink-0 flex size-5 items-center justify-center">
                <div className={`size-2 rounded-full ${dotClass}`}></div>
            </div>
        </div>
    )
}
