import { Newspaper, FileText, Database, Bot, Clock } from 'lucide-react'
import { StatusBadge } from '../shared/status-badge'

export interface JobCardProps {
    iconType: 'news' | 'report' | 'database';
    name: string;
    agentName: string;
    schedule: string;
    status: 'active' | 'scheduled' | 'completed' | 'failed' | 'idle';
}

export function JobCard({ iconType, name, agentName, schedule, status }: JobCardProps) {
    const getIcon = () => {
        switch (iconType) {
            case 'news': return <Newspaper className="w-6 h-6 text-slate-300" />;
            case 'report': return <FileText className="w-6 h-6 text-slate-300" />;
            case 'database': return <Database className="w-6 h-6 text-slate-300" />;
        }
    }

    return (
        <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-center rounded-lg bg-slate-800 shrink-0 w-12 h-12">
                {getIcon()}
            </div>
            <div className="flex flex-1 flex-col justify-center min-w-0">
                <p className="text-white text-base font-medium truncate mb-1">{name}</p>
                <div className="flex items-center gap-3 text-sm text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                        <Bot className="w-4 h-4" /> Agent: {agentName}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {schedule}
                    </span>
                </div>
            </div>
            <div className="shrink-0 flex items-center">
                <StatusBadge status={status} />
            </div>
        </div>
    )
}
