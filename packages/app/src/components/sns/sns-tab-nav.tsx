export interface SnsTabNavProps {
    tabs: { id: string; label: string; active?: boolean }[];
    onSelect?: (id: string) => void;
}

export function SnsTabNav({ tabs, onSelect }: SnsTabNavProps) {
    return (
        <div className="mb-6">
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onSelect?.(tab.id)}
                        className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 px-1 whitespace-nowrap transition-colors ${tab.active
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
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
