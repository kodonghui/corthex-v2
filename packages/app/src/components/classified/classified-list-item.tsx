import { ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export interface ClassifiedListItemProps {
    title: string;
    levelText: string;
    levelColorClass: string; // e.g., 'bg-red-500/20 text-red-500 border-red-500/30'
    dateLabel: string;
    dateValue: string;
    viewCount: string | number;
    icon: ReactNode;
    iconType?: 'visibility' | 'visibility_off';
    isActive?: boolean;
    isRevoked?: boolean;
}

export function ClassifiedListItem({ title, levelText, levelColorClass, dateLabel, dateValue, viewCount, icon, iconType = 'visibility', isActive, isRevoked }: ClassifiedListItemProps) {
    return (
        <div className={`flex gap-4 px-4 py-3 border-b border-slate-800 cursor-pointer transition-colors relative ${isActive ? 'bg-slate-900 hover:bg-slate-800/50' : 'hover:bg-slate-900'
            } ${isRevoked ? 'opacity-50' : ''}`}>
            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
            <div className="flex items-start gap-4 w-full">
                <div className="text-slate-100 flex items-center justify-center rounded-md bg-slate-800 shrink-0 size-10">
                    {icon}
                </div>
                <div className="flex flex-1 flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                        <p className={`text-slate-100 text-sm font-medium leading-normal truncate ${isRevoked ? 'line-through decoration-slate-400' : ''}`}>
                            {title}
                        </p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${levelColorClass}`}>
                            {levelText}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                        <span>{dateLabel}: {dateValue}</span>
                        <span className="flex items-center gap-1">
                            {iconType === 'visibility' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />} {viewCount}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
