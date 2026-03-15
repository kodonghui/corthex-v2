import { Check } from 'lucide-react'
import { useThemeStore, THEMES, type ThemeName } from '../../stores/theme-store'

export function ThemeSelector() {
    const { theme, setTheme } = useThemeStore()

    return (
        <div className="flex flex-col gap-4">
            <p className="text-base font-medium leading-normal text-corthex-text-primary">
                테마
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {THEMES.map((t) => (
                    <ThemeCard
                        key={t.name}
                        themeName={t.name}
                        label={t.label}
                        description={t.description}
                        accent={t.accent}
                        surface={t.surface}
                        selected={theme === t.name}
                        onSelect={setTheme}
                    />
                ))}
            </div>
        </div>
    )
}

interface ThemeCardProps {
    themeName: ThemeName
    label: string
    description: string
    accent: string
    surface: string
    selected: boolean
    onSelect: (theme: ThemeName) => void
}

function ThemeCard({
    themeName,
    label,
    description,
    accent,
    surface,
    selected,
    onSelect,
}: ThemeCardProps) {
    return (
        <button
            onClick={() => onSelect(themeName)}
            className={`
                relative flex flex-col gap-2 p-4 rounded-lg border transition-all cursor-pointer text-left
                ${selected
                    ? 'border-corthex-accent ring-2 ring-corthex-accent/30 bg-corthex-elevated'
                    : 'border-corthex-border hover:border-corthex-border-strong bg-corthex-surface hover:bg-corthex-elevated'
                }
            `}
        >
            {/* Color preview */}
            <div className="flex items-center gap-2">
                <div
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center"
                    style={{ backgroundColor: accent }}
                >
                    {selected && <Check className="w-4 h-4" style={{ color: surface }} />}
                </div>
                <div
                    className="w-8 h-8 rounded-full border border-white/10"
                    style={{ backgroundColor: surface }}
                />
            </div>

            {/* Label */}
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-corthex-text-primary">{label}</span>
                <span className="text-xs text-corthex-text-secondary">{description}</span>
            </div>

            {/* Selected indicator */}
            {selected && (
                <span className="absolute top-2 right-2 text-[10px] font-medium text-corthex-accent uppercase tracking-wider">
                    active
                </span>
            )}
        </button>
    )
}
