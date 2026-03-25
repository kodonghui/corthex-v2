import { Clock, RefreshCw } from 'lucide-react'

export interface JobItem {
    id: string;
    name: string;
    type: 'scheduled' | 'running';
    detail: string;
}

export interface TrackerActiveJobsProps {
    jobs?: JobItem[];
}

export function TrackerActiveJobs({ jobs = [
    { id: '1', name: 'Daily Market Sync', type: 'scheduled', detail: 'Scheduled: 18:00 KST' },
    { id: '2', name: 'CRM Data Ingestion', type: 'running', detail: 'Running for 4m 12s' },
] }: TrackerActiveJobsProps) {
    return (
        <div className="bg-corthex-surface rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200">
                <h3 className="text-sm font-bold text-corthex-text-primary uppercase tracking-wider font-display">Active Jobs</h3>
            </div>

            <div className="divide-y divide-corthex-border">
                {jobs.map(job => (
                    <div key={job.id} className="p-4 hover:bg-stone-100/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                {job.type === 'scheduled' ? (
                                    <Clock className="w-[18px] h-[18px] text-stone-500 mt-0.5" />
                                ) : (
                                    <RefreshCw className="w-[18px] h-[18px] text-corthex-accent mt-0.5 translate-y-[1px] animate-spin-slow" />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-corthex-text-primary">{job.name}</p>
                                    <p className="text-xs text-stone-500 mt-1 tabular-nums">{job.detail}</p>
                                </div>
                            </div>

                            {job.type === 'scheduled' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-stone-100 text-stone-500 border border-stone-200 font-bold tracking-wider">
                                    IDLE
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-[rgba(34,211,238,0.10)] text-corthex-accent border border-[rgba(34,211,238,0.20)] font-bold tracking-wider animate-pulse">
                                    SYNC
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
