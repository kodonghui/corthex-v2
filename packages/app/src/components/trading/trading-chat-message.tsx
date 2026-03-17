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
                <div className="w-8 h-8 rounded bg-stone-200 flex-none flex items-center justify-center text-stone-600">
                    <User className="w-[18px] h-[18px]" />
                </div>
                <div className="flex-1 flex flex-col items-end">
                    <div className="bg-[#5a7247]/20 border border-[#5a7247]/30 rounded-lg p-3 text-slate-100">
                        {message}
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1 mr-1">{time}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded bg-[#5a7247]/20 flex-none flex items-center justify-center text-[#5a7247]">
                <Bot className="w-[18px] h-[18px]" />
            </div>
            <div className="flex-1">
                <div className="bg-stone-200/30 rounded-lg p-3 text-stone-600 flex flex-col gap-2">
                    {message}
                </div>
                <span className="text-[10px] text-stone-500 mt-1 ml-1">{time}</span>
            </div>
        </div>
    )
}
