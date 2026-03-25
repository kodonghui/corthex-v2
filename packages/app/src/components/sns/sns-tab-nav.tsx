export interface SnsTabNavProps {
    tabs: { id: string; label: string; active?: boolean }[];
    onSelect?: (id: string) => void;
}

export function SnsTabNav({ tabs, onSelect }: SnsTabNavProps) {
    return (
        <div className="mb-6">
            <div className="flex border-b border-corthex-border gap-8 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onSelect?.(tab.id)}
                        className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 px-1 whitespace-nowrap transition-colors ${tab.active
                                ? 'border-primary text-primary'
                                : 'border-transparent text-stone-400 hover:text-corthex-text-primary'
                            }`}
                    >
                        <p className={`text-sm leading-normal ${tab.active ? 'font-bold' : 'font-medium'}`}>
                            {tab.label}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    )
}
