export interface TierBadgeProps {
    level: 'T1' | 'T2' | 'T3';
}

export function TierBadge({ level }: TierBadgeProps) {
    if (level === 'T1') {
        return <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-[rgba(34,211,238,0.10)] text-corthex-accent border border-[rgba(34,211,238,0.20)]">{level}</span>;
    }
    if (level === 'T2') {
        return <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-violet-900/30 text-violet-400 border border-violet-800/50">{level}</span>;
    }
    return <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-stone-100 text-stone-600 border border-stone-200">{level}</span>;
}
