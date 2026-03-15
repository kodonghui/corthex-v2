import { useState } from 'react'

export interface ToggleSwitchProps {
    id?: string;
    title: string;
    description: string;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
}

export function ToggleSwitch({ id, title, description, defaultChecked = false, onChange }: ToggleSwitchProps) {
    const [checked, setChecked] = useState(defaultChecked);

    const handleChange = () => {
        const newChecked = !checked;
        setChecked(newChecked);
        onChange?.(newChecked);
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-col">
                <p className="text-base font-medium text-slate-100">{title}</p>
                <p className="text-sm text-slate-400 mt-1">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    id={id}
                    className="sr-only peer"
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                />
                <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-cyan-400"></div>
            </label>
        </div>
    )
}
