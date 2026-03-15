import { ReactNode } from 'react'

export interface ConversationItemProps {
    name: string;
    time: string;
    previewMessage: string;
    icon?: ReactNode;
    imageUrl?: string;
    active?: boolean;
    unreadCount?: number;
    status?: 'online' | 'offline';
}

export function ConversationItem({ name, time, previewMessage, icon, imageUrl, active, unreadCount, status }: ConversationItemProps) {
    const containerClass = active
        ? 'bg-cyan-400/10 border-l-cyan-400'
        : 'hover:bg-slate-100 dark:hover:bg-slate-800/30 border-l-transparent';

    return (
        <div className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-l-2 ${containerClass}`}>
            <div className="relative shrink-0">
                {imageUrl ? (
                    <div className="h-10 w-10 rounded-full bg-slate-300 dark:bg-slate-700 bg-cover bg-center" style={{ backgroundImage: `url('${imageUrl}')` }}></div>
                ) : (
                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        {icon}
                    </div>
                )}
                {status === 'online' && (
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-[#0b1416]"></div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`text-sm truncate ${active ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>{name}</h3>
                    <span className="text-xs text-slate-500">{time}</span>
                </div>
                <p className={`text-sm truncate ${active ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500'}`}>{previewMessage}</p>
            </div>
            {unreadCount !== undefined && unreadCount > 0 && (
                <div className="h-2 w-2 rounded-full bg-cyan-400 shrink-0"></div>
            )}
        </div>
    )
}
