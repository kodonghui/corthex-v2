import { Network } from 'lucide-react'

export function NexusCanvas() {
    return (
        <div className="flex-1 relative bg-[radial-gradient(var(--tw-gradient-stops))] from-slate-400/20 dark:from-slate-700/20 via-transparent to-transparent flex items-center justify-center overflow-hidden" style={{ backgroundSize: '24px 24px', backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.2) 1px, transparent 1px)' }}>
            <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm max-w-md text-center z-0">
                <div className="w-16 h-16 rounded-full bg-cyan-400/10 flex items-center justify-center mb-2">
                    <Network className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">React Flow 캔버스가 여기에 렌더링됩니다</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Interactive network visualization canvas. Use the toolbar above to manage view states.</p>
                <button className="mt-4 h-10 px-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                    Initialize Workspace
                </button>
            </div>
        </div>
    )
}
