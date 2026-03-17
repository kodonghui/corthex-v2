import { ReactNode } from 'react'

export interface ImprovementCardProps {
    title: string;
    description: string;
    icon: ReactNode;
}

export function ImprovementCard({ title, description, icon }: ImprovementCardProps) {
    return (
        <div className="flex flex-col gap-3 rounded-xl p-5 border border-slate-200 bg-white/40 hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-lg bg-[#5a7247]/10 text-[#5a7247]">
                    {icon}
                </div>
                <h3 className="text-slate-900 text-sm font-bold">{title}</h3>
            </div>
            <p className="text-stone-400 text-sm">{description}</p>
        </div>
    )
}
