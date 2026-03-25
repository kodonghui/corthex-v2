import { ReactNode } from 'react'

export interface SettingsSectionProps {
    title: string;
    children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
    return (
        <section>
            <h2 className="text-[22px] font-bold leading-tight tracking-tight pb-6 text-corthex-text-primary">{title}</h2>
            <div className="flex flex-col gap-6">
                {children}
            </div>
        </section>
    )
}
