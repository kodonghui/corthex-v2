import { ReactNode } from 'react'

export interface NotificationItemProps {
    title: string;
    time: string;
    category: string;
    message: string;
    icon: ReactNode;
    iconBgClass: string;
    iconColorClass: string;
    unread?: boolean;
}

export function NotificationItem({ title, time, category, message, icon, iconBgClass, iconColorClass, unread }: NotificationItemProps) {
    const containerClass = unread
        ? 'bg-corthex-accent/[0.02] border-corthex-accent/20'
        : 'bg-corthex-surface border-corthex-border';

    return (
        <div className={`relative flex gap-4 border rounded-xl p-4 transition-colors hover:bg-corthex-bg group ${containerClass}`}>
            {unread && <div className="absolute top-4 left-2 w-1.5 h-1.5 rounded-full bg-corthex-accent"></div>}
            <div className="flex items-start gap-4 w-full ml-2">
                <div className={`flex items-center justify-center rounded-full shrink-0 size-10 ${iconBgClass} ${iconColorClass}`}>
                    {icon}
                </div>
                <div className="flex flex-1 flex-col justify-center">
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-corthex-text-primary text-base font-semibold leading-normal">{title}</p>
                        <p className="text-stone-400 text-xs font-mono font-medium leading-normal shrink-0 ml-4 mt-1">{time}</p>
                    </div>
                    <p className={`${iconColorClass} text-xs font-medium uppercase tracking-wider mb-1`}>{category}</p>
                    <p className="text-corthex-text-secondary text-sm font-normal leading-relaxed">{message}</p>
                </div>
            </div>
        </div>
    )
}
