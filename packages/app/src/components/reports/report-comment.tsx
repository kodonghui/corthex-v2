export interface ReportCommentProps {
    authorName: string;
    timeAgo: string;
    content: string;
    avatarUrl: string;
}

export function ReportComment({ authorName, timeAgo, content, avatarUrl }: ReportCommentProps) {
    return (
        <div className="flex gap-3 mb-4">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 ring-1 ring-corthex-border flex-none" style={{ backgroundImage: `url('${avatarUrl}')` }}></div>
            <div className="flex flex-col bg-corthex-surface p-3 rounded-lg border border-stone-200 flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-corthex-text-disabled">{authorName}</span>
                    <span className="text-[10px] text-stone-500 font-mono">{timeAgo}</span>
                </div>
                <p className="text-sm text-stone-600">{content}</p>
            </div>
        </div>
    )
}
