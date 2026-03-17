export interface EventTimelineItemProps {
    time: string;
    message: string;
    duration: string;
    status: 'info' | 'error' | 'success';
}

export function EventTimelineItem({ time, message, duration, status }: EventTimelineItemProps) {
    const getStatusConfig = () => {
        switch (status) {
            case 'error':
                return {
                    bg: 'bg-rose-500',
                    text: 'text-rose-600'
                }
            case 'success':
            case 'info':
            default:
                return {
                    bg: 'bg-emerald-500',
                    text: 'text-slate-900'
                }
        }
    }

    const { bg, text } = getStatusConfig();

    return (
        <div className="relative">
            <div className={`absolute -left-[31px] w-3 h-3 rounded-full border-[3px] border-white mt-1.5 ${bg}`}></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <p className="font-mono text-sm text-stone-400">{time}</p>
                    <p className={`font-medium ${text}`}>{message}</p>
                </div>
                <div className="font-mono text-sm text-stone-400">
                    소요시간: {duration}
                </div>
            </div>
        </div>
    )
}
