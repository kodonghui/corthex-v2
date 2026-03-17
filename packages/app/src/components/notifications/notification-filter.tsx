export interface NotificationFilterProps {
    filters: { id: string; label: string; active?: boolean }[];
    onSelect?: (id: string) => void;
}

export function NotificationFilter({ filters, onSelect }: NotificationFilterProps) {
    return (
        <div className="pb-3">
            <div className="flex border-b border-slate-200 px-4 gap-8">
                {filters.map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => onSelect?.(filter.id)}
                        className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${filter.active
                                ? 'border-b-[#5a7247] text-slate-900'
                                : 'border-b-transparent text-stone-400 hover:text-slate-900'
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
