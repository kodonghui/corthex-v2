export interface FileFilterProps {
    filters: { id: string; label: string; active?: boolean }[];
    onSelect?: (id: string) => void;
}

export function FileFilter({ filters, onSelect }: FileFilterProps) {
    return (
        <div className="flex items-center gap-2">
            {filters.map(filter => (
                <button
                    key={filter.id}
                    onClick={() => onSelect?.(filter.id)}
                    className={`flex h-8 items-center justify-center rounded px-4 text-sm transition-colors ${filter.active
                            ? 'bg-cyan-400 text-slate-900 font-medium'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium hover:border-cyan-400/50'
                        }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    )
}
