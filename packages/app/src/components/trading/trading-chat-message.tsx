import { ReactNode } from 'react'
import { Bot, User } from 'lucide-react'

export interface TradingChatMessageProps {
    isUser?: boolean;
    message: ReactNode;
    time: string;
}

export function TradingChatMessage({ isUser, message, time }: TradingChatMessageProps) {
    if (isUser) {
        return (
            <div className="flex gap-3 flex-row-reverse">
                <div className="w-8 h-8 rounded bg-slate-700 flex-none flex items-center justify-center text-slate-300">
                    <User className="w-[18px] h-[18px]" />
                </div>
                <div className="flex-1 flex flex-col items-end">
                    <div className="bg-cyan-400/20 border border-cyan-400/30 rounded-lg p-3 text-slate-100">
                        {message}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 mr-1">{time}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded bg-cyan-400/20 flex-none flex items-center justify-center text-cyan-400">
                <Bot className="w-[18px] h-[18px]" />
            </div>
            <div className="flex-1">
                <div className="bg-slate-700/30 rounded-lg p-3 text-slate-300 flex flex-col gap-2">
                    {message}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 ml-1">{time}</span>
            </div>
        </div>
    )
}
