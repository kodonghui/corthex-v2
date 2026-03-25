export interface OpsLogItemProps {
    time: string;
    agentId: string;
    operation: string;
    target: string;
    quality: string;
    cost: string;
    status: '성공' | '진행 중' | '실패';
}

export function OpsLogItem({ time, agentId, operation, target, quality, cost, status }: OpsLogItemProps) {
    const statusConfig = {
        '성공': {
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-500',
            border: 'border-emerald-500/20'
        },
        '진행 중': {
            bg: 'bg-blue-500/10',
            text: 'text-blue-500',
            border: 'border-blue-500/20'
        },
        '실패': {
            bg: 'bg-red-500/10',
            text: 'text-red-500',
            border: 'border-red-500/20'
        }
    };

    const config = statusConfig[status];
    const qualityColorClass = quality.includes('-') ? 'text-stone-400' : parseFloat(quality) < 5 ? 'text-red-500' : parseFloat(quality) >= 9 ? 'text-emerald-500' : 'text-stone-600';

    return (
        <tr className="hover:bg-stone-100/30 transition-colors group">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-stone-600">{time}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-8 w-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-corthex-accent">{agentId}</div>
            </td>
            <td className="px-6 py-4 text-sm font-medium text-corthex-text-disabled">{operation}</td>
            <td className="px-6 py-4 text-sm text-stone-500 font-mono">{target}</td>
            <td className={`px-6 py-4 text-sm font-mono ${qualityColorClass}`}>{quality}</td>
            <td className="px-6 py-4 text-sm font-mono text-stone-600">{cost}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
                    {status}
                </span>
            </td>
        </tr>
    )
}
