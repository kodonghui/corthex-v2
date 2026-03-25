import { Wrench, Code } from 'lucide-react'

export interface ToolCallCCProps {
    toolName: string;
    status: 'Complete' | 'Running' | 'Failed';
    duration: string;
}

export function ToolCallCC({ toolName, status, duration }: ToolCallCCProps) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-corthex-surface border border-stone-200 p-3 mt-3">
            <div className="flex items-center gap-3">
                <div className="size-8 rounded bg-stone-100 flex items-center justify-center border border-stone-200">
                    <Wrench className="text-stone-500 w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <p className="text-sm font-bold text-corthex-text-secondary font-mono">Tool Call: {toolName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={`flex size-2 rounded-full ${status === 'Complete' ? 'bg-emerald-500' : status === 'Failed' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                        <p className="text-stone-500 text-xs">{status}</p>
                        <span className="text-corthex-text-primary">•</span>
                        <p className="text-stone-500 text-xs font-mono">{duration}</p>
                    </div>
                </div>
            </div>
            <button className="text-stone-500 hover:text-corthex-text-secondary transition-colors">
                <Code className="w-4 h-4" />
            </button>
        </div>
    )
}
