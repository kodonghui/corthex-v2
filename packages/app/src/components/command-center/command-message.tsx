import { ReactNode } from 'react'

export interface CommandMessageProps {
    sender: string;
    time: string;
    icon: ReactNode;
    iconBgClass: string;
    children: ReactNode;
}

export function CommandMessage({ sender, time, icon, iconBgClass, children }: CommandMessageProps) {
    return (
        <div className="flex items-start gap-4 mx-auto max-w-3xl w-full">
            <div className={`mt-1 flex-shrink-0 size-8 rounded ${iconBgClass} flex items-center justify-center`}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="text-xs text-stone-500 mb-1 flex items-center gap-2">
                    <span className="font-semibold text-corthex-text-secondary">{sender}</span>
                    <span>{time}</span>
                </div>
                {children}
            </div>
        </div>
    )
}
