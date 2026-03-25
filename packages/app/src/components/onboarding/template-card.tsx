import { CheckCircle2, Check } from 'lucide-react'

export interface TemplateFeature {
    text: string;
}

export interface TemplateCardProps {
    title: string;
    recommended?: boolean;
    selected?: boolean;
    features: TemplateFeature[];
    onClick?: () => void;
}

export function TemplateCard({ title, recommended, selected, features, onClick }: TemplateCardProps) {
    const borderClass = selected ? 'border-2 border-corthex-accent' : 'border border-stone-200 hover:border-corthex-border';
    const shadowClass = selected ? 'shadow-[0_0_15px_rgba(34,211,238,0.1)]' : '';
    const bgColor = selected ? 'bg-stone-100' : 'bg-corthex-surface';

    return (
        <div
            className={`flex flex-1 flex-col gap-5 rounded-2xl p-6 relative transition-colors cursor-pointer ${borderClass} ${shadowClass} ${bgColor}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold leading-tight flex items-center gap-2 ${selected ? 'text-white' : 'text-stone-600'}`}>
                    {title}
                    {selected && <CheckCircle2 className="text-corthex-accent w-5 h-5" />}
                </h2>
                {recommended && (
                    <span className="text-[#020617] text-xs font-bold leading-none tracking-wide uppercase rounded-full bg-corthex-accent px-3 py-1.5 text-center">
                        추천
                    </span>
                )}
            </div>
            <div className={`flex flex-col gap-3 mt-2 ${selected ? 'text-white' : 'text-stone-500'}`}>
                {features.map((feature, idx) => (
                    <div key={idx} className="text-sm font-medium leading-normal flex items-start gap-3">
                        <Check className={`${selected ? 'text-corthex-accent' : 'text-stone-500'} w-5 h-5 leading-none shrink-0`} />
                        {feature.text}
                    </div>
                ))}
            </div>
        </div>
    )
}
