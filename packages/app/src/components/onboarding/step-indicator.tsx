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
                <p className="text-corthex-accent text-base font-semibold leading-normal">{title}</p>
                <p className="text-stone-500 text-sm font-medium leading-normal">Step {currentStep} of {totalSteps}</p>
            </div>
            <div className="rounded-full bg-stone-100 overflow-hidden h-2">
                <div
                    className="h-full rounded-full bg-corthex-accent transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
    )
}
