import { Edit2, Trash2, FileText, CheckCircle } from 'lucide-react'

export interface KnowledgeDetailHeaderProps {
    title: string;
    version: string;
    author: string;
    lastModified: string;
    tags: string[];
}

export function KnowledgeDetailHeader({ title, version, author, lastModified, tags }: KnowledgeDetailHeaderProps) {
    return (
        <div className="p-5 border-b border-stone-200 flex flex-col gap-4 bg-corthex-bg/30">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-corthex-accent/10 flex items-center justify-center text-corthex-accent border border-corthex-accent/20">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-100 leading-tight">{title}</h2>
                        <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                            <span>버전 {version}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                            <span>작성자: {author}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                            <span>마지막 수정: {lastModified}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded border border-stone-200 text-stone-600 hover:text-slate-100 hover:bg-stone-100 transition-colors" title="편집">
                        <Edit2 className="w-[18px] h-[18px]" />
                    </button>
                    <button className="p-2 rounded border border-red-900/50 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors" title="삭제">
                        <Trash2 className="w-[18px] h-[18px]" />
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 rounded text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                        {tag}
                    </span>
                ))}
                <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">벡터 DB 동기화됨</span>
                </div>
            </div>
        </div>
    )
}
