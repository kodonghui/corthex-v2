import { Network, Plus, Minus, Download } from 'lucide-react'

export interface ToolbarProps {
    title?: string;
    subtitle?: string;
    zoomLevel?: number;
}

export function Toolbar({ title = "NEXUS", subtitle = "Global Operations Network", zoomLevel = 100 }: ToolbarProps) {
    return (
        <header className="h-12 border-b border-slate-200 bg-white/50/50 backdrop-blur-md flex items-center justify-between px-4 z-10 flex-shrink-0">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <Network className="text-[#5a7247] w-5 h-5" />
                    <h1 className="text-sm font-bold tracking-wide text-slate-900">{title}</h1>
                </div>
                <div className="w-px h-4 bg-slate-300 mx-2"></div>
                <span className="text-xs text-stone-400 font-medium">{subtitle}</span>
            </div>

            <div className="flex items-center gap-4">
                {/* Zoom Controls */}
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                    <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-600 transition-colors" title="Zoom Out">
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-medium w-10 text-center text-slate-600">{zoomLevel}%</span>
                    <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-600 transition-colors" title="Zoom In">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Edit Mode Toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-stone-400">편집 모드</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input className="sr-only peer" type="checkbox" />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5a7247]"></div>
                    </label>
                </div>

                {/* Export Button */}
                <button className="h-8 px-4 bg-[#5a7247]/10 hover:bg-[#5a7247]/20 text-[#5a7247] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5">
                    <Download className="w-4 h-4" />
                    내보내기
                </button>
            </div>
        </header>
    )
}
