export interface NotificationFilterProps {
    filters: { id: string; label: string; active?: boolean }[];
    onSelect?: (id: string) => void;
}

export function NotificationFilter({ filters, onSelect }: NotificationFilterProps) {
    return (
        <div className="pb-3">
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 gap-8">
                {filters.map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => onSelect?.(filter.id)}
                        className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${filter.active
                                ? 'border-b-cyan-400 text-slate-900 dark:text-white'
                                : 'border-b-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                            }`}
                    >
                        <p className={`text-sm leading-normal tracking-[0.015em] ${filter.active ? 'font-semibold' : 'font-medium'}`}>
                            {filter.label}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    )
}
