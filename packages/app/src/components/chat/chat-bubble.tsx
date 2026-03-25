import { User, Bot, Loader2 } from 'lucide-react'

export interface ChatBubbleProps {
    type: 'user' | 'agent';
    sender?: string;
    content: string;
    isProcessing?: boolean;
}

export function ChatBubble({ type, sender, content, isProcessing = false }: ChatBubbleProps) {
    if (type === 'user') {
        return (
            <div className="flex items-end gap-3 justify-end group">
                <div className="flex flex-col gap-1 items-end max-w-[80%]">
                    <p className="text-stone-500 text-xs font-medium px-2">{sender || 'User'}</p>
                    <div className="text-[15px] font-normal leading-relaxed rounded-2xl rounded-br-sm px-5 py-3.5 bg-[rgba(34,211,238,0.10)] text-corthex-accent">
                        {content}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-start gap-3 group">
            <div className="bg-[rgba(34,211,238,0.20)] flex items-center justify-center aspect-square rounded-full w-8 h-8 shrink-0 mt-6 border border-[rgba(34,211,238,0.30)]">
                <Bot className="w-4 h-4 text-corthex-accent" />
            </div>
            <div className="flex flex-col gap-1 items-start max-w-[80%] w-full">
                <p className="text-stone-500 text-xs font-medium px-2">{sender || 'Agent'}</p>

                {isProcessing && (
                    <div className="flex items-center gap-2 mb-1 px-2">
                        <Loader2 className="w-3.5 h-3.5 text-stone-500 animate-spin" />
                        <span className="text-xs font-mono text-stone-500">Searching the web...</span>
                    </div>
                )}

                <div className="text-[15px] font-normal leading-relaxed rounded-2xl rounded-bl-sm px-5 py-3.5 bg-stone-100 text-slate-200 w-full shadow-sm">
                    {content}
                </div>
            </div>
        </div>
    )
}
