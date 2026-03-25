import { ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

export interface LibraryTreeItemProps {
    label: string;
    icon: ReactNode;
    isExpanded?: boolean;
    isActive?: boolean;
    children?: ReactNode;
}

export function LibraryTreeItem({ label, icon, isExpanded, isActive, children }: LibraryTreeItemProps) {
    return (
        <div className="group flex flex-col py-1">
            <div className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${isActive
                    ? 'bg-corthex-accent/10 text-corthex-accent border border-corthex-accent/20'
                    : 'hover:bg-stone-100/50 text-stone-600'
                }`}>
                {isExpanded ? <ChevronDown className={`w-4 h-4 ${isActive ? '' : 'text-stone-400'}`} /> : <ChevronRight className={`w-4 h-4 ${isActive ? '' : 'text-stone-400'}`} />}
                <div className={`flex items-center ${isActive ? '' : 'text-stone-500'}`}>
                    {icon}
                </div>
                <span className={`text-sm select-none truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
            </div>
            {isExpanded && children && (
                <div className="pl-8 flex flex-col mt-1 space-y-0.5 border-l border-stone-200 ml-4 pb-2">
                    {children}
                </div>
            )}
        </div>
    )
}

export function LibraryTreeSubItem({ label, icon, isActive }: { label: string, icon: ReactNode, isActive?: boolean }) {
    return (
        <div className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${isActive
                ? 'bg-stone-100/80 text-slate-100'
                : 'hover:bg-stone-100/50 text-stone-500'
            }`}>
            <div className={`${isActive ? 'text-corthex-accent' : ''}`}>
                {icon}
            </div>
            <span className="text-sm font-medium select-none truncate">{label}</span>
        </div>
    )
}
