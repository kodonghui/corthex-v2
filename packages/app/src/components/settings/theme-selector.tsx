import { Check } from 'lucide-react'

export interface ThemeColorProps {
    colorClass: string;
    selected?: boolean;
}

export function ThemeColor({ colorClass, selected }: ThemeColorProps) {
    if (selected) {
        return (
            <button
                className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center ring-2 ring-offset-2 ring-offset-[#101f22] transition-all cursor-pointer`}
                style={{ '--tw-ring-color': 'var(--tw-bg-opacity)' } as React.CSSProperties}
            >
                <Check className="text-white w-5 h-5" />
            </button>
        )
    }

    return (
        <button className={`w-12 h-12 rounded-full ${colorClass} hover:scale-110 transition-transform cursor-pointer`}></button>
    )
}

export function ThemeSelector() {
    return (
        <div className="flex flex-col gap-4">
            <p className="text-base font-medium leading-normal text-slate-300">액센트 컬러</p>
            <div className="flex items-center gap-4 flex-wrap">
                <ThemeColor colorClass="bg-cyan-400" selected />
                <ThemeColor colorClass="bg-amber-400" />
                <ThemeColor colorClass="bg-emerald-400" />
                <ThemeColor colorClass="bg-violet-400" />
                <ThemeColor colorClass="bg-slate-400" />
                <span className="ml-2 text-sm font-medium text-slate-400">Cyan (기본값)</span>
            </div>
        </div>
    )
}
