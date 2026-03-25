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
                            ? 'bg-corthex-surface text-corthex-text-primary font-bold border-corthex-border'
                            : 'bg-transparent text-corthex-text-secondary hover:bg-corthex-elevated font-medium border-corthex-border'
                        }`}
                >
                    {platform.label}
                </button>
            ))}
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-transparent px-4 text-corthex-text-secondary hover:bg-corthex-elevated text-sm font-medium leading-normal border border-corthex-border transition-colors ml-auto">
                <Filter className="w-[18px] h-[18px]" />
                필터
            </button>
        </div>
    )
}
