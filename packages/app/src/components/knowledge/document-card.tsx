import { ReactNode } from 'react'

export interface DocumentCardProps {
    title: string;
    description: string;
    timeAgo: string;
    icon: ReactNode;
    statusText: string;
    statusIcon: ReactNode;
    statusColorClass: string; // e.g. 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
    isActive?: boolean;
}

export function DocumentCard({ title, description, timeAgo, icon, statusText, statusIcon, statusColorClass, isActive }: DocumentCardProps) {
    return (
        <div className={`group relative flex flex-col gap-2 p-4 rounded-lg cursor-pointer transition-colors ${isActive
                ? 'bg-white border border-[#5a7247]/30 shadow-[0_0_10px_rgba(32,204,238,0.05)]'
                : 'bg-white/50 border border-stone-200 hover:border-stone-200'
            }`}>
            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5a7247] rounded-l-lg"></div>}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-[#5a7247]/10 text-[#5a7247]' : 'bg-stone-100 text-stone-500 group-hover:text-stone-600'
                        }`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className={`text-sm font-semibold mb-0.5 transition-colors pl-1 ${isActive ? 'text-slate-100 font-bold' : 'text-stone-600 group-hover:text-slate-100'
                            }`}>{title}</h3>
                        <p className="text-xs text-stone-400 line-clamp-1 pl-1">{description}</p>
                    </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                    <span className="text-[11px] font-medium text-stone-400">{timeAgo}</span>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${statusColorClass}`}>
                        {statusIcon}
                        <span className="text-[10px] font-bold tracking-wide">{statusText}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
