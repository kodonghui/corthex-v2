import { ReactNode } from 'react'

export interface ParticipantInfo {
    name: string;
    icon: ReactNode;
    iconBgClass: string;
}

export interface DebateInfoProps {
    duration: string;
    participants: ParticipantInfo[];
    objective: string;
}

export function DebateInfo({ duration, participants, objective }: DebateInfoProps) {
    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Duration */}
            <div className="flex flex-col gap-2">
                <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Duration</span>
                <div className="font-mono text-2xl text-[#5a7247] font-medium">{duration}</div>
            </div>

            {/* Participants */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Participants ({participants.length})</span>
                </div>
                <div className="flex flex-col gap-3">
                    {participants.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className={`rounded-full size-8 flex flex-shrink-0 items-center justify-center ${p.iconBgClass}`}>
                                {p.icon}
                            </div>
                            <span className="text-sm text-slate-700">{p.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Topic Details */}
            <div className="flex flex-col gap-2">
                <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Objective</span>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-100/50 p-3 rounded-lg border border-slate-200/50">
                    {objective}
                </p>
            </div>
        </div>
    )
}
