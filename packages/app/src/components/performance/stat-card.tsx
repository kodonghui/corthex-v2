import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export interface StatCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    iconColorClass: string;
    trendValue: string;
    trendText: string;
    isPositive: boolean;
}

export function StatCard({ title, value, icon, iconColorClass, trendValue, trendText, isPositive }: StatCardProps) {
    const trendColorClass = isPositive ? 'text-emerald-500' : 'text-rose-500';

    return (
        <div className="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 bg-white/40 shadow-sm">
            <div className="flex justify-between items-center">
                <p className="text-stone-400 text-sm font-medium leading-normal">{title}</p>
                <div className={iconColorClass}>{icon}</div>
            </div>
            <p className={`text-slate-900 text-3xl font-mono font-bold leading-tight mt-2 ${iconColorClass === 'text-emerald-500' && value.includes('%') ? 'text-emerald-500' : ''}`}>{value}</p>
            <div className="flex items-center gap-1 mt-1">
                {isPositive ? <TrendingUp className={`w-4 h-4 ${trendColorClass}`} /> : <TrendingDown className={`w-4 h-4 ${trendColorClass}`} />}
                <p className={`${trendColorClass} text-xs font-bold leading-normal`}>{trendValue} {trendText}</p>
            </div>
        </div>
    )
}
