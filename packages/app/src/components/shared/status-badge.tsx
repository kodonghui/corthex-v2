export interface StatusBadgeProps {
    status: 'active' | 'scheduled' | 'completed' | 'failed' | 'idle';
}

export function StatusBadge({ status }: StatusBadgeProps) {
    switch (status) {
        case 'active':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgba(34,211,238,0.10)] text-corthex-accent border border-[rgba(34,211,238,0.20)] uppercase tracking-wider">ACTIVE</span>;
        case 'scheduled':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-800/50 uppercase tracking-wider">SCHEDULED</span>;
        case 'completed':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 uppercase tracking-wider">COMPLETED</span>;
        case 'failed':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-800/50 uppercase tracking-wider">FAILED</span>;
        case 'idle':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-500 border border-stone-200 uppercase tracking-wider">IDLE</span>;
        default:
            return null;
    }
}
