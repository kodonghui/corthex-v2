export interface CostChartProps {
    title: string;
    amount: string;
    subtitle: string;
    percentageChange: string;
    isPositiveChange: boolean;
}

export function CostChart({ title, amount, subtitle, percentageChange, isPositiveChange }: CostChartProps) {
    return (
        <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-slate-900 dark:text-slate-100 text-base font-semibold leading-normal">{title}</h3>
                    <div className="flex items-baseline gap-3 mt-1">
                        <p className="text-slate-900 dark:text-slate-100 font-mono text-[32px] font-bold leading-tight">{amount}</p>
                        <div className="flex gap-1 items-center">
                            <span className="text-slate-500 dark:text-slate-400 text-sm">{subtitle}</span>
                            <span className={`text-sm font-medium ml-2 ${isPositiveChange ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                                {isPositiveChange ? '+' : ''}{percentageChange}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs font-medium rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">1W</button>
                    <button className="px-3 py-1 text-xs font-medium rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">1M</button>
                    <button className="px-3 py-1 text-xs font-medium rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">3M</button>
                </div>
            </div>
            <div className="flex min-h-[220px] flex-1 flex-col gap-4 py-6 w-full relative mt-4">
                <svg className="absolute inset-0 h-full w-full" fill="none" height="180" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
                    <path d="M0,80 Q10,70 20,75 T40,60 T60,50 T80,45 T100,20 L100,100 L0,100 Z" fill="url(#chart-gradient)" opacity="0.2"></path>
                    <path className="text-cyan-400" d="M0,80 Q10,70 20,75 T40,60 T60,50 T80,45 T100,20" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                    <defs>
                        <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                            <stop className="text-cyan-400" offset="0%" stopColor="currentColor" stopOpacity="1"></stop>
                            <stop className="text-cyan-400" offset="100%" stopColor="currentColor" stopOpacity="0"></stop>
                        </linearGradient>
                    </defs>
                </svg>
                <div className="flex justify-between w-full absolute bottom-0 px-2">
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">1st</span>
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">8th</span>
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">15th</span>
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">22nd</span>
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">29th</span>
                </div>
            </div>
        </div>
    )
}
