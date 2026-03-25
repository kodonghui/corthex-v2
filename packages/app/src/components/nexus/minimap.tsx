import { Maximize2 } from 'lucide-react'

export function Minimap() {
    return (
        <div className="absolute bottom-6 right-6 w-48 h-32 bg-corthex-surface/80/80 backdrop-blur-md border border-corthex-border rounded-xl shadow-lg p-2 flex flex-col z-20">
            <div className="text-[10px] font-medium text-stone-400 mb-1 px-1 flex justify-between items-center">
                <span>Minimap</span>
                <Maximize2 className="w-3.5 h-3.5 cursor-pointer hover:text-corthex-text-primary" />
            </div>
            <div className="flex-1 border border-corthex-border rounded-lg bg-corthex-bg relative overflow-hidden">
                {/* Viewport Indicator */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-10 border border-corthex-accent bg-corthex-accent/10 rounded-sm"></div>
            </div>
        </div>
    )
}
