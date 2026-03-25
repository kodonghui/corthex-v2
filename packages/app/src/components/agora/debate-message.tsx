import { ReactNode } from 'react'

export interface DebateMessageProps {
    sender: string;
    time: string;
    message: string;
    icon?: ReactNode;
    iconBgClass?: string;
    avatarUrl?: string;
    theme?: 'cyan' | 'violet' | 'amber' | 'slate';
    isReversed?: boolean; // For alternating sides
}

export function DebateMessage({ sender, time, message, icon, iconBgClass, avatarUrl, theme = 'cyan', isReversed = false }: DebateMessageProps) {
    const getThemeClasses = () => {
        switch (theme) {
            case 'cyan': return {
                bgClass: 'bg-corthex-accent/10 text-corthex-text-primary border border-corthex-accent/20',
                iconClass: iconBgClass || 'bg-corthex-accent/20 text-corthex-accent border border-corthex-accent/30'
            };
            case 'violet': return {
                bgClass: 'bg-violet-500/10 text-corthex-text-primary border border-violet-500/20',
                iconClass: iconBgClass || 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
            };
            case 'amber': return {
                bgClass: 'bg-amber-500/10 text-corthex-text-primary border border-amber-500/20',
                iconClass: iconBgClass || 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            };
            case 'slate': return {
                bgClass: 'bg-corthex-surface text-corthex-text-primary border border-corthex-border',
                iconClass: iconBgClass || 'bg-corthex-surface border border-corthex-border'
            };
        }
    }

    const classes = getThemeClasses();
    const flexRowClass = isReversed ? 'ml-auto flex-row-reverse' : '';
    const itemAlignClass = isReversed ? 'items-end' : 'items-start';
    const flexRowReverseClass = isReversed ? 'flex-row-reverse' : '';
    const borderRadiusClass = isReversed ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm';

    return (
        <div className={`flex items-start gap-4 max-w-[80%] ${flexRowClass}`}>
            {avatarUrl ? (
                <div className={`rounded-full size-10 shrink-0 flex items-center justify-center overflow-hidden bg-cover bg-center ${classes.iconClass}`} style={{ backgroundImage: `url('${avatarUrl}')` }}></div>
            ) : (
                <div className={`rounded-full size-10 shrink-0 flex items-center justify-center ${classes.iconClass}`}>
                    {icon}
                </div>
            )}
            <div className={`flex flex-col gap-1 ${itemAlignClass}`}>
                <div className={`flex items-center gap-2 ${flexRowReverseClass}`}>
                    <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">{sender}</p>
                    <span className="text-corthex-text-secondary text-[10px] font-mono">{time}</span>
                </div>
                <div className={`text-sm font-normal leading-relaxed px-5 py-3 ${borderRadiusClass} ${classes.bgClass}`}>
                    {message}
                </div>
            </div>
        </div>
    )
}
