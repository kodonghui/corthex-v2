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
                            ? 'bg-[#5a7247] text-slate-900 font-medium'
                            : 'bg-white border border-slate-200 font-medium hover:border-[#5a7247]/50'
                        }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    )
}
