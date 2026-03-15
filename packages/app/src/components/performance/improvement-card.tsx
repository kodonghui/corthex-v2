import { ReactNode } from 'react'

export interface ImprovementCardProps {
    title: string;
    description: string;
    icon: ReactNode;
}

export function ImprovementCard({ title, description, icon }: ImprovementCardProps) {
    return (
        <div className="flex flex-col gap-3 rounded-xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-lg bg-cyan-400/10 text-cyan-400">
                    {icon}
                </div>
                <h3 className="text-slate-900 dark:text-white text-sm font-bold">{title}</h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{description}</p>
        </div>
    )
}
