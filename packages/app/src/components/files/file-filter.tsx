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
                            ? 'bg-corthex-accent text-corthex-text-primary font-medium'
                            : 'bg-corthex-surface border border-corthex-border font-medium hover:border-corthex-accent/50'
                        }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    )
}
