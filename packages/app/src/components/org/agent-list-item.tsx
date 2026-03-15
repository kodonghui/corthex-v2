import { ChevronRight } from 'lucide-react'

export interface AgentListItemProps {
    id: string;
    name: string;
    role: string;
    colorClass: string;
    status: 'online' | 'standby' | 'offline';
}

export function AgentListItem({ id, name, role, colorClass, status }: AgentListItemProps) {
    const getStatusColor = () => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'standby': return 'bg-amber-500';
            case 'offline': return 'bg-slate-500';
        }
    }

    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-400/50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-xs`}>
                        {id}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${getStatusColor()} border-2 border-white dark:border-slate-800`}></div>
                </div>
                <div>
                    <p className="text-sm font-semibold group-hover:text-cyan-400 transition-colors text-slate-900 dark:text-slate-100">{name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{role}</p>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    )
}
