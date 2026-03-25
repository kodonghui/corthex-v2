import { ChevronDown, Search } from 'lucide-react'

export function LogFilterBar() {
    const filters = ['에이전트', '작업 유형', '날짜', '상태'];

    return (
        <div className="flex flex-col md:flex-row gap-4 px-4 mb-6 justify-between items-start md:items-center">
            <div className="flex gap-2 flex-wrap">
                {filters.map((filter, index) => (
                    <button key={index} className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-slate-100/50 border border-slate-200 hover:bg-slate-200 pl-4 pr-2 transition-colors">
                        <span className="text-slate-700 text-sm font-medium leading-normal">{filter}</span>
                        <ChevronDown className="w-4 h-4 text-stone-400" />
                    </button>
                ))}
            </div>
            <div className="w-full md:w-72">
                <label className="flex flex-col w-full h-10">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-slate-200 bg-white/50 focus-within:border-corthex-accent transition-colors">
                        <div className="text-stone-500 flex items-center justify-center pl-3">
                            <Search className="w-5 h-5" />
                        </div>
                        <input className="flex w-full min-w-0 flex-1 bg-transparent text-slate-900 focus:outline-none focus:ring-0 border-none h-full placeholder:text-stone-500 px-3 text-sm font-normal leading-normal" placeholder="이벤트 검색..." type="text" />
                    </div>
                </label>
            </div>
        </div>
    )
}
