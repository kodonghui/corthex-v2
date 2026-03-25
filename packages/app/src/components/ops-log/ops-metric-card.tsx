import { ArrowUp } from 'lucide-react'

export interface OpsMetricCardProps {
    title: string;
    value: string;
    unit?: string;
    trendValue: string;
    isPositive: boolean;
    valueColorClass?: string;
}

export function OpsMetricCard({ title, value, unit, trendValue, isPositive, valueColorClass }: OpsMetricCardProps) {
    const trendColorClass = isPositive ? 'text-emerald-500' : 'text-rose-500';

    return (
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-corthex-surface border border-stone-200 shadow-sm">
            <p className="text-stone-500 text-sm font-medium uppercase tracking-wider">{title}</p>
            <div className="flex items-baseline gap-3">
                <p className={`text-3xl font-bold font-mono ${valueColorClass || ''}`}>
                    {value}
                    {unit && <span className="text-stone-400 text-xl">{unit}</span>}
                </p>
                <span className={`${trendColorClass} text-sm font-medium flex items-center`}>
                    <ArrowUp className="w-4 h-4" />
                    {trendValue}
                </span>
            </div>
        </div>
    )
}
