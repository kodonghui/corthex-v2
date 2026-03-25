/**
 * Story 24.5: BigFiveSliderGroup — 5 OCEAN personality sliders (UXR98)
 *
 * Features:
 * - 5 sliders (0-100 integer) with Korean + English labels
 * - aria-valuenow + aria-valuetext (NFR-A5)
 * - Keyboard: left/right arrows, Shift+Arrow for ±10 (UXR47)
 * - Behavioral example tooltips per dimension (FR-PERS8, PER-6)
 * - Preset selector with instant fill (FR-PERS6)
 * - Mobile: vertical stacked full-width (UXR11)
 * - Personality changes = next session (FR-PERS4), zero code branching (FR-PERS5)
 */

import { useState, useCallback } from 'react'
import type { PersonalityTraits, PersonalityPreset } from '@corthex/shared'
import { PERSONALITY_PRESETS } from '@corthex/shared'

// === Trait Configuration ===

type TraitKey = keyof PersonalityTraits

type TraitConfig = {
  key: TraitKey
  label: string
  labelKo: string
  lowDesc: string
  highDesc: string
  tooltip: (value: number) => string
  color: string
}

const TRAIT_CONFIGS: TraitConfig[] = [
  {
    key: 'openness',
    label: 'Openness',
    labelKo: '개방성',
    lowDesc: '보수적 · 현실적',
    highDesc: '창의적 · 탐구적',
    tooltip: (v) => v < 30 ? '기존 방식을 선호하고, 입증된 해결책을 제시합니다' :
                     v < 70 ? '새로운 아이디어에 열려 있되, 현실적 판단을 병행합니다' :
                              '창의적이고 비유적인 표현으로 다양한 관점을 탐색합니다',
    color: '#4d7c0f',
  },
  {
    key: 'conscientiousness',
    label: 'Conscientiousness',
    labelKo: '성실성',
    lowDesc: '유연한 · 즉흥적',
    highDesc: '체계적 · 꼼꼼한',
    tooltip: (v) => v < 30 ? '자유롭고 유연하게 대응하며, 세부사항보다 큰 그림을 봅니다' :
                     v < 70 ? '적절히 체계적이면서도 상황에 따라 유연하게 대처합니다' :
                              '체계적이고 구조화된 보고서를 작성하며, 빠짐없이 점검합니다',
    color: '#2563eb',
  },
  {
    key: 'extraversion',
    label: 'Extraversion',
    labelKo: '외향성',
    lowDesc: '조용한 · 신중한',
    highDesc: '적극적 · 열정적',
    tooltip: (v) => v < 30 ? '조용하고 신중하게 핵심만 간결히 전달합니다' :
                     v < 70 ? '상황에 맞게 적극적이거나 차분한 소통을 합니다' :
                              '적극적으로 소통하고 감정을 표현하며 열정적으로 설명합니다',
    color: '#d97706',
  },
  {
    key: 'agreeableness',
    label: 'Agreeableness',
    labelKo: '친화성',
    lowDesc: '직설적 · 도전적',
    highDesc: '공감적 · 협조적',
    tooltip: (v) => v < 30 ? '직설적으로 문제를 지적하고, 날카로운 분석을 제공합니다' :
                     v < 70 ? '공감하면서도 필요할 때 솔직한 피드백을 제공합니다' :
                              '공감적이고 협조적인 톤으로 소통하며, 상대방을 배려합니다',
    color: '#7c3aed',
  },
  {
    key: 'neuroticism',
    label: 'Neuroticism',
    labelKo: '신경성',
    lowDesc: '낙관적 · 안정적',
    highDesc: '신중한 · 리스크 경계',
    tooltip: (v) => v < 30 ? '낙관적이고 안정적으로, 기회에 초점을 맞춥니다' :
                     v < 70 ? '기회와 리스크를 균형 있게 분석합니다' :
                              '리스크와 주의사항을 꼼꼼히 강조하며 신중하게 판단합니다',
    color: '#dc2626',
  },
]

// === Component ===

type BigFiveSliderGroupProps = {
  value: PersonalityTraits | null
  onChange: (traits: PersonalityTraits | null) => void
  disabled?: boolean
}

export function BigFiveSliderGroup({ value, onChange, disabled = false }: BigFiveSliderGroupProps) {
  const [activePreset, setActivePreset] = useState<string | null>(
    findMatchingPreset(value),
  )

  const traits: PersonalityTraits = value ?? {
    openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50,
  }

  const handleTraitChange = useCallback((key: TraitKey, newVal: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newVal)))
    const updated = { ...traits, [key]: clamped }
    onChange(updated)
    setActivePreset(findMatchingPreset(updated))
  }, [traits, onChange])

  const handlePresetSelect = useCallback((preset: PersonalityPreset) => {
    onChange({ ...preset.traits })
    setActivePreset(preset.id)
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange(null)
    setActivePreset(null)
  }, [onChange])

  const isEnabled = value !== null

  return (
    <div className="space-y-4">
      {/* Header + Enable toggle */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-corthex-text-primary flex items-center gap-2">
          성격 특성 <span className="text-corthex-text-secondary font-normal text-xs">Big Five (OCEAN)</span>
        </h4>
        <button
          type="button"
          onClick={() => isEnabled ? handleClear() : handlePresetSelect(PERSONALITY_PRESETS[0])}
          disabled={disabled}
          className="text-xs font-medium px-3 py-1 rounded-lg border border-corthex-border hover:bg-corthex-elevated transition-colors text-corthex-text-secondary disabled:opacity-40"
        >
          {isEnabled ? '성격 해제' : '성격 설정'}
        </button>
      </div>

      {isEnabled && (
        <>
          {/* Preset Selector */}
          <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="성격 프리셋 선택">
            {PERSONALITY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={activePreset === preset.id}
                onClick={() => handlePresetSelect(preset)}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                  ${activePreset === preset.id
                    ? 'bg-corthex-accent-deep text-white border-corthex-accent-deep shadow-sm'
                    : 'bg-white text-corthex-text-secondary border-corthex-border hover:bg-corthex-elevated hover:border-corthex-accent'
                  } disabled:opacity-40`}
              >
                {preset.nameKo} <span className="opacity-70">{preset.name}</span>
              </button>
            ))}
          </div>

          {/* Sliders */}
          <div className="space-y-3">
            {TRAIT_CONFIGS.map((config) => (
              <TraitSlider
                key={config.key}
                config={config}
                value={traits[config.key]}
                onChange={(v) => handleTraitChange(config.key, v)}
                disabled={disabled}
              />
            ))}
          </div>

          {/* Info */}
          <p className="text-[10px] text-corthex-text-secondary">
            성격 변경은 다음 대화부터 적용됩니다. 프롬프트 주입 방식으로 작동하며, 코드 수정은 필요 없습니다.
          </p>
        </>
      )}
    </div>
  )
}

// === Individual Slider ===

function TraitSlider({
  config,
  value,
  onChange,
  disabled,
}: {
  config: TraitConfig
  value: number
  onChange: (val: number) => void
  disabled: boolean
}) {
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipText = config.tooltip(value)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const step = e.shiftKey ? 10 : 1
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(Math.min(100, value + step))
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(Math.max(0, value - step))
    }
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-corthex-text-primary">{config.labelKo}</span>
          <span className="text-[10px] text-corthex-text-secondary">{config.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold tabular-nums" style={{ color: config.color, minWidth: '2ch', textAlign: 'right' }}>
            {value}
          </span>
          <button
            type="button"
            onClick={() => setShowTooltip(!showTooltip)}
            className="w-4 h-4 rounded-full bg-corthex-border text-corthex-text-secondary text-[10px] font-bold flex items-center justify-center hover:bg-corthex-border-strong transition-colors"
            aria-label={`${config.labelKo} 설명`}
          >
            ?
          </button>
        </div>
      </div>

      {/* Low/High labels */}
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] text-corthex-text-secondary">{config.lowDesc}</span>
        <span className="text-[9px] text-corthex-text-secondary">{config.highDesc}</span>
      </div>

      {/* Range input */}
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${config.labelKo} ${value}점: ${tooltipText}`}
        aria-label={`${config.labelKo} (${config.label})`}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-40
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-sm"
        style={{
          background: `linear-gradient(to right, ${config.color} 0%, ${config.color} ${value}%, #e5e1d3 ${value}%, #e5e1d3 100%)`,
          // Thumb color via CSS custom property
          ['--tw-slider-color' as string]: config.color,
        }}
      />
      <style>{`
        input[type="range"][aria-label="${config.labelKo} (${config.label})"]::-webkit-slider-thumb {
          background-color: ${config.color};
        }
        input[type="range"][aria-label="${config.labelKo} (${config.label})"]::-moz-range-thumb {
          background-color: ${config.color};
        }
      `}</style>

      {/* Tooltip */}
      {showTooltip && (
        <div className="mt-1 px-3 py-2 bg-corthex-accent-deep text-white text-[11px] rounded-lg leading-relaxed">
          {tooltipText}
        </div>
      )}
    </div>
  )
}

// === Helpers ===

function findMatchingPreset(traits: PersonalityTraits | null): string | null {
  if (!traits) return null
  for (const preset of PERSONALITY_PRESETS) {
    if (
      preset.traits.openness === traits.openness &&
      preset.traits.conscientiousness === traits.conscientiousness &&
      preset.traits.extraversion === traits.extraversion &&
      preset.traits.agreeableness === traits.agreeableness &&
      preset.traits.neuroticism === traits.neuroticism
    ) {
      return preset.id
    }
  }
  return null
}
