import { ReactNode } from 'react'
import { Settings, Clock } from 'lucide-react'

export interface TriggerCardProps {
    agentName: string;
    agentIcon: ReactNode;
    triggerName: string;
    scheduleText: string;
    lastRunTime: string;
    lastRunStatus: string;
    nextRunTime: string;
    successRate: string;
    cost: string;
    isActive: boolean;
    onToggle?: (checked: boolean) => void;
}

export function TriggerCard({
    agentName, agentIcon, triggerName, scheduleText, lastRunTime, lastRunStatus, nextRunTime, successRate, cost, isActive, onToggle
}: TriggerCardProps) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="text-cyan-400 text-sm flex items-center justify-center">{agentIcon}</div>
                        <p className="font-mono text-slate-500 dark:text-slate-400 text-xs">Agent: {agentName}</p>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">{triggerName}</h4>
                    <p className="font-mono text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4" />
                        {scheduleText}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-400 hover:text-cyan-400 transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                    <label className="toggle-wrapper cursor-pointer relative w-12 h-6">
                        <input
                            checked={isActive}
                            onChange={(e) => onToggle?.(e.target.checked)}
                            className="sr-only toggle-checkbox"
                            type="checkbox"
                        />
                        <div className={`block w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-cyan-400' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'transform translate-x-6' : ''}`}></div>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">최근 실행</p>
                    <p className="font-mono text-sm">{lastRunTime} ({lastRunStatus})</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">다음 실행</p>
                    <p className="font-mono text-sm">{nextRunTime}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">성공률 (30일)</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: successRate }}></div>
                        </div>
                        <span className="font-mono text-sm text-emerald-500">{successRate}</span>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">누적 비용 (월)</p>
                    <p className="font-mono text-sm">{cost}</p>
                </div>
            </div>
        </div>
    )
}
