import { ReactNode } from 'react'
import { MoreVertical } from 'lucide-react'

export interface FileCardProps {
    filename: string;
    size: string;
    uploaderName: string;
    uploaderIcon: ReactNode;
    fileIcon: ReactNode;
    iconBgClass: string; // e.g., 'bg-red-500/10 text-red-500'
}

export function FileCard({ filename, size, uploaderName, uploaderIcon, fileIcon, iconBgClass }: FileCardProps) {
    return (
        <div className="flex flex-col rounded-lg border border-corthex-border bg-corthex-surface p-4 hover:border-corthex-accent/50 transition-colors group cursor-pointer relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
                <div className={`size-10 rounded flex items-center justify-center ${iconBgClass}`}>
                    {fileIcon}
                </div>
                <button className="text-stone-500 hover:text-corthex-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>
            <h3 className="font-medium text-sm truncate mb-1" title={filename}>{filename}</h3>
            <div className="flex items-center justify-between text-xs text-stone-400 mt-auto pt-2">
                <span className="font-mono">{size}</span>
                <div className="flex items-center gap-1.5">
                    {uploaderIcon}
                    <span>{uploaderName}</span>
                </div>
            </div>
        </div>
    )
}
