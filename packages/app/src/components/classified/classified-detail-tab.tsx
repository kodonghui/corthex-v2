export interface ClassifiedDetailTabProps {
    tabs: { id: string; label: string; active?: boolean }[];
    onSelect?: (id: string) => void;
}

export function ClassifiedDetailTab({ tabs, onSelect }: ClassifiedDetailTabProps) {
    return (
        <div className="flex border-b border-stone-200 px-6 gap-6 shrink-0">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onSelect?.(tab.id)}
                    className={`flex flex-col items-center justify-center border-b-2 pb-2 pt-3 transition-colors ${tab.active
                            ? 'border-b-red-500 text-slate-100'
                            : 'border-b-transparent text-stone-500 hover:text-slate-100'
                        }`}
                >
                    <span className={`text-sm leading-normal tracking-[0.015em] ${tab.active ? 'font-bold' : 'font-semibold'}`}>
                        {tab.label}
                    </span>
                </button>
            ))}
        </div>
    )
}
