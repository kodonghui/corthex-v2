import { Wrench, Code } from 'lucide-react'

export interface ToolCallCCProps {
    toolName: string;
    status: 'Complete' | 'Running' | 'Failed';
    duration: string;
}

export function ToolCallCC({ toolName, status, duration }: ToolCallCCProps) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-900 border border-slate-700 p-3 mt-3">
            <div className="flex items-center gap-3">
                <div className="size-8 rounded bg-slate-800 flex items-center justify-center border border-slate-700">
                    <Wrench className="text-slate-400 w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <p className="text-sm font-bold text-slate-50 font-mono">Tool Call: {toolName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={`flex size-2 rounded-full ${status === 'Complete' ? 'bg-emerald-500' : status === 'Failed' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                        <p className="text-slate-400 text-xs">{status}</p>
                        <span className="text-slate-700">•</span>
                        <p className="text-slate-400 text-xs font-mono">{duration}</p>
                    </div>
                </div>
            </div>
            <button className="text-slate-400 hover:text-slate-50 transition-colors">
                <Code className="w-4 h-4" />
            </button>
        </div>
    )
}
