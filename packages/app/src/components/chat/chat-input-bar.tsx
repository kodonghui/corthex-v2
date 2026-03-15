import { Paperclip, Send } from 'lucide-react'

export interface ChatInputBarProps {
    agentName?: string;
}

export function ChatInputBar({ agentName = 'Agent' }: ChatInputBarProps) {
    return (
        <div className="p-4 bg-[#0B1120] border-t border-slate-800">
            <div className="flex items-end gap-2 bg-slate-900 rounded-2xl p-2 border border-slate-700/50 shadow-inner focus-within:ring-1 focus-within:ring-cyan-400/50 transition-all">
                <button className="flex items-center justify-center p-2.5 text-slate-400 hover:text-slate-300 rounded-xl hover:bg-slate-700 transition-colors shrink-0">
                    <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 max-h-32 min-h-[44px] flex items-center">
                    <textarea
                        className="w-full bg-transparent border-0 focus:ring-0 resize-none text-[15px] text-slate-200 placeholder:text-slate-500 py-3 px-2 h-full block font-display"
                        placeholder={`Message ${agentName}...`}
                        rows={1}
                    />
                </div>
                <button className="flex items-center justify-center bg-cyan-400 text-[#0B1120] rounded-full w-10 h-10 shrink-0 hover:bg-cyan-300 transition-colors shadow-sm">
                    <Send className="w-5 h-5 ml-0.5" />
                </button>
            </div>
            <div className="text-center mt-2">
                <span className="text-[10px] text-slate-500 font-mono">CORTHEX AI can make mistakes. Consider verifying important information.</span>
            </div>
        </div>
    )
}
