import { SwitchCamera, Eye } from 'lucide-react'

export interface DelegationCardProps {
    agentName: string;
    contextCount: number;
    tokens: string;
}

export function DelegationCard({ agentName, contextCount, tokens }: DelegationCardProps) {
    return (
        <div className="mt-3 flex items-stretch justify-between gap-4 rounded-xl bg-stone-100 border border-violet-500/30 p-4 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-violet-500"></div>
            <div className="flex flex-col gap-2 flex-1 pl-2">
                <div className="flex items-center gap-2">
                    <SwitchCamera className="text-violet-500 w-4 h-4" />
                    <p className="text-sm font-bold text-slate-50">Agent Delegation</p>
                </div>
                <p className="text-stone-500 text-xs font-mono">Handing off to <span className="text-violet-500">{agentName}</span></p>
                <div className="mt-2 flex gap-2">
                    <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-stone-500 ring-1 ring-inset ring-slate-700">Context: {contextCount} files</span>
                    <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-stone-500 ring-1 ring-inset ring-slate-700">Tokens: {tokens}</span>
                </div>
            </div>
            <button className="self-start flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-slate-50 bg-white px-3 py-1.5 rounded-lg border border-stone-200 transition-colors">
                <Eye className="w-4 h-4" />
                View Context
            </button>
        </div>
    )
}
