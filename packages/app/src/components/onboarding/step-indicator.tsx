export interface StepIndicatorProps {
    title: string;
    currentStep: number;
    totalSteps: number;
}

export function StepIndicator({ title, currentStep, totalSteps }: StepIndicatorProps) {
    const progressPercentage = Math.round((currentStep / totalSteps) * 100);

    return (
        <div className="flex flex-col gap-3 p-4 mb-4">
            <div className="flex gap-6 justify-between items-end">
                <p className="text-cyan-400 text-base font-semibold leading-normal">{title}</p>
                <p className="text-slate-400 text-sm font-medium leading-normal">Step {currentStep} of {totalSteps}</p>
            </div>
            <div className="rounded-full bg-slate-800 overflow-hidden h-2">
                <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
    )
}
