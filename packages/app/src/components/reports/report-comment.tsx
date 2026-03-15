export interface ReportCommentProps {
    authorName: string;
    timeAgo: string;
    content: string;
    avatarUrl: string;
}

export function ReportComment({ authorName, timeAgo, content, avatarUrl }: ReportCommentProps) {
    return (
        <div className="flex gap-3 mb-4">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 ring-1 ring-slate-800 flex-none" style={{ backgroundImage: `url('${avatarUrl}')` }}></div>
            <div className="flex flex-col bg-slate-900 p-3 rounded-lg border border-slate-800 flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-200">{authorName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{timeAgo}</span>
                </div>
                <p className="text-sm text-slate-300">{content}</p>
            </div>
        </div>
    )
}
