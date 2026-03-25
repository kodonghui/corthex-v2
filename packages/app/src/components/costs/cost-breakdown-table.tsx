import { ReactNode } from 'react'

export interface CostBreakdownItem {
    name: string;
    metric: string;
    cost: string;
    icon?: ReactNode;
}

export interface CostBreakdownTableProps {
    title: string;
    columns: string[];
    items: CostBreakdownItem[];
}

export function CostBreakdownTable({ title, columns, items }: CostBreakdownTableProps) {
    return (
        <div className="flex-1 min-w-[300px] flex flex-col gap-4">
            <h3 className="text-corthex-text-primary text-base font-semibold px-1">{title}</h3>
            <div className="rounded-lg border border-corthex-border bg-corthex-surface/50 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-corthex-border bg-corthex-bg/50">
                            {columns.map((col, idx) => (
                                <th key={idx} className={`py-3 px-4 text-xs font-semibold text-stone-400 uppercase tracking-wider ${idx > 0 ? 'text-right' : ''}`}>
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-corthex-border">
                        {items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-3 px-4 text-sm text-corthex-text-primary font-medium flex items-center gap-2">
                                    {item.icon}
                                    {item.name}
                                </td>
                                <td className="py-3 px-4 text-sm text-corthex-text-secondary font-mono text-right">{item.metric}</td>
                                <td className="py-3 px-4 text-sm text-corthex-text-primary font-mono text-right">{item.cost}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
