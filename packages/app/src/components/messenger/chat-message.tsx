import { ReactNode } from 'react'

export interface ChatMessageProps {
    isUser: boolean;
    message: ReactNode;
    time: string;
    avatarUrl?: string;
    senderName?: string;
}

export function ChatMessage({ isUser, message, time, avatarUrl, senderName }: ChatMessageProps) {
    if (isUser) {
        return (
            <div className="flex justify-end gap-3 max-w-[80%] ml-auto">
                <div className="flex flex-col items-end gap-1">
                    <div className="bg-cyan-400/10 text-slate-900 dark:text-slate-100 p-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed border border-cyan-400/20">
                        {message}
                    </div>
                    <span className="text-xs text-slate-500">{time}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex justify-start gap-3 max-w-[80%]">
            {avatarUrl && (
                <div className="h-8 w-8 rounded-full bg-slate-300 dark:bg-slate-700 bg-cover bg-center shrink-0 mt-1" style={{ backgroundImage: `url('${avatarUrl}')` }}></div>
            )}
            <div className="flex flex-col items-start gap-1">
                <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-4 rounded-2xl rounded-tl-sm text-sm leading-relaxed border border-slate-200 dark:border-slate-700/50 shadow-sm">
                    {message}
                </div>
                <span className="text-xs text-slate-500">{time}</span>
            </div>
        </div>
    )
}
