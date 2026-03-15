import { ReactNode } from 'react'

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
                    ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                    : 'hover:bg-slate-800/50 text-slate-300'
                }`}>
                <span className={`material-symbols-outlined text-[16px] ${isActive ? '' : 'text-slate-500'}`}>
                    {isExpanded ? 'expand_more' : 'chevron_right'}
                </span>
                <div className={`flex items-center ${isActive ? '' : 'text-slate-400'}`}>
                    {icon}
                </div>
                <span className={`text-sm select-none truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
            </div>
            {isExpanded && children && (
                <div className="pl-8 flex flex-col mt-1 space-y-0.5 border-l border-slate-800 ml-4 pb-2">
                    {children}
                </div>
            )}
        </div>
    )
}

export function LibraryTreeSubItem({ label, icon, isActive }: { label: string, icon: ReactNode, isActive?: boolean }) {
    return (
        <div className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${isActive
                ? 'bg-slate-800/80 text-slate-100'
                : 'hover:bg-slate-800/50 text-slate-400'
            }`}>
            <div className={`${isActive ? 'text-cyan-400' : ''}`}>
                {icon}
            </div>
            <span className="text-sm font-medium select-none truncate">{label}</span>
        </div>
    )
}
