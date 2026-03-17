import { Filter } from 'lucide-react'

export interface SnsPlatformFilterProps {
    platforms: { id: string; label: string; active?: boolean }[];
    onSelect?: (id: string) => void;
}

export function SnsPlatformFilter({ platforms, onSelect }: SnsPlatformFilterProps) {
    return (
        <div className="flex gap-3 mb-6 flex-wrap">
            {platforms.map(platform => (
                <button
                    key={platform.id}
                    onClick={() => onSelect?.(platform.id)}
                    className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 text-sm leading-normal transition-colors border ${platform.active
                            ? 'bg-slate-200 text-slate-900 font-bold border-slate-300'
                            : 'bg-transparent text-slate-600 hover:bg-slate-100 font-medium border-slate-200'
                        }`}
                >
                    {platform.label}
                </button>
            ))}
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-transparent px-4 text-slate-600 hover:bg-slate-100 text-sm font-medium leading-normal border border-slate-200 transition-colors ml-auto">
                <Filter className="w-[18px] h-[18px]" />
                필터
            </button>
        </div>
    )
}
