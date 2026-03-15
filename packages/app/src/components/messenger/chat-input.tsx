import { Paperclip, ArrowUp } from 'lucide-react'

export function ChatInput() {
    return (
        <div className="p-4 bg-background-light dark:bg-slate-900 shrink-0">
            <div className="max-w-4xl mx-auto relative flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm pr-2 pl-4 py-2 focus-within:ring-1 focus-within:ring-cyan-400 focus-within:border-cyan-400 transition-all">
                <button className="text-slate-400 hover:text-cyan-400 transition-colors p-1">
                    <Paperclip className="w-5 h-5" />
                </button>
                <input
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 dark:text-slate-200 placeholder:text-slate-400 h-9 outline-none"
                    placeholder="메시지를 입력하세요..."
                    type="text"
                />
                <button className="bg-cyan-400 hover:bg-cyan-400/90 text-slate-900 h-8 w-8 rounded-full flex items-center justify-center transition-colors ml-2 shrink-0">
                    <ArrowUp className="w-4 h-4 font-bold" />
                </button>
            </div>
            <div className="text-center mt-2">
                <span className="text-[11px] text-slate-500">AI 에이전트가 생성한 정보는 부정확할 수 있습니다.</span>
            </div>
        </div>
    )
}
