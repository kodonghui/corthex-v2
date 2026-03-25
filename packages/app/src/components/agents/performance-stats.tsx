export interface PerformanceStatsProps {
    totalJobs?: number;
    jobsTrend?: string;
    successRate?: number;
    totalCost?: number;
}

export function PerformanceStats({
    totalJobs = 1248,
    jobsTrend = '+12%',
    successRate = 99.4,
    totalCost = 142.50
}: PerformanceStatsProps) {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-corthex-text-primary font-bold text-lg mb-2">성능 지표</h3>
            <div className="bg-stone-100 rounded-xl p-6 border border-stone-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(34,211,238,0.10)] rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex flex-col gap-6 relative z-10">
                    <div>
                        <p className="text-stone-500 text-sm mb-1">총 처리 작업</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-mono font-bold tracking-tight text-white">{totalJobs.toLocaleString()}</span>
                            <span className="text-corthex-accent text-xs font-mono">{jobsTrend} 이번 주</span>
                        </div>
                    </div>
                    <div className="w-full h-px bg-stone-200/50"></div>
                    <div>
                        <p className="text-stone-500 text-sm mb-1">작업 성공률</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-mono font-bold tracking-tight text-white">{successRate}%</span>
                        </div>
                        <div className="w-full bg-stone-200 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className="bg-corthex-accent h-full rounded-full" style={{ width: `${successRate}%` }}></div>
                        </div>
                    </div>
                    <div className="w-full h-px bg-stone-200/50"></div>
                    <div>
                        <p className="text-stone-500 text-sm mb-1">누적 API 비용</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-stone-600 font-mono text-lg">$</span>
                            <span className="text-2xl font-mono font-bold tracking-tight text-white">{totalCost.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
