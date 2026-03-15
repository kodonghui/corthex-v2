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
            <h3 className="text-slate-900 dark:text-slate-100 text-base font-semibold px-1">{title}</h3>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            {columns.map((col, idx) => (
                                <th key={idx} className={`py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${idx > 0 ? 'text-right' : ''}`}>
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-100 font-medium flex items-center gap-2">
                                    {item.icon}
                                    {item.name}
                                </td>
                                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 font-mono text-right">{item.metric}</td>
                                <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-100 font-mono text-right">{item.cost}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
