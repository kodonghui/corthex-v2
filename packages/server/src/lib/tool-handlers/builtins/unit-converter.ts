import type { ToolHandler } from '../types'

// Conversion tables: value in base unit
const CONVERSIONS: Record<string, Record<string, number>> = {
  length: {
    m: 1, km: 1000, cm: 0.01, mm: 0.001,
    in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
  },
  weight: {
    kg: 1, g: 0.001, mg: 0.000001, t: 1000,
    lb: 0.453592, oz: 0.0283495,
  },
  data: {
    B: 1, KB: 1024, MB: 1048576, GB: 1073741824,
    TB: 1099511627776, bit: 0.125,
  },
  time: {
    s: 1, ms: 0.001, min: 60, hr: 3600,
    day: 86400, week: 604800,
  },
  area: {
    'm2': 1, 'km2': 1e6, 'cm2': 1e-4, 'ft2': 0.092903,
    'acre': 4046.86, 'ha': 10000, 'pyeong': 3.30579,
  },
  volume: {
    L: 1, mL: 0.001, 'cm3': 0.001, 'm3': 1000,
    gal: 3.78541, qt: 0.946353, cup: 0.236588,
  },
  speed: {
    'km/h': 1, 'm/s': 3.6, 'mi/h': 1.60934, knot: 1.852,
  },
}

function convertTemperature(value: number, from: string, to: string): number {
  const f = from.toUpperCase()
  const t = to.toUpperCase()
  // Convert to Celsius first
  let celsius: number
  if (f === 'C') celsius = value
  else if (f === 'F') celsius = (value - 32) * 5 / 9
  else if (f === 'K') celsius = value - 273.15
  else return NaN

  // Convert from Celsius to target
  if (t === 'C') return celsius
  if (t === 'F') return celsius * 9 / 5 + 32
  if (t === 'K') return celsius + 273.15
  return NaN
}

export const unitConverter: ToolHandler = (input) => {
  const action = String(input.action || 'convert')

  if (action === 'categories') {
    return JSON.stringify({
      categories: Object.keys(CONVERSIONS).concat(['temperature']),
      units: {
        ...Object.fromEntries(
          Object.entries(CONVERSIONS).map(([cat, units]) => [cat, Object.keys(units)])
        ),
        temperature: ['C', 'F', 'K'],
      },
    })
  }

  if (action === 'convert') {
    const value = Number(input.value)
    const from = String(input.from || '')
    const to = String(input.to || '')
    const category = String(input.category || '')

    if (isNaN(value)) return '변환할 값(value)을 숫자로 입력하세요.'
    if (!from || !to) return '변환 단위(from, to)를 모두 지정하세요.'

    // Temperature special case
    if (category === 'temperature' || ['C', 'F', 'K'].includes(from.toUpperCase())) {
      const result = convertTemperature(value, from, to)
      if (isNaN(result)) return `지원하지 않는 온도 단위입니다: ${from} → ${to} (C, F, K 지원)`
      return JSON.stringify({
        value, from, to,
        result: Math.round(result * 10000) / 10000,
        category: 'temperature',
        formula: `${value}${from} = ${Math.round(result * 10000) / 10000}${to}`,
      })
    }

    // Find category automatically if not specified
    let cat = category
    if (!cat) {
      for (const [c, units] of Object.entries(CONVERSIONS)) {
        if (from in units && to in units) { cat = c; break }
      }
    }

    if (!cat || !CONVERSIONS[cat]) {
      return `카테고리를 찾을 수 없습니다. from(${from})과 to(${to})가 같은 카테고리인지 확인하세요.`
    }

    const units = CONVERSIONS[cat]
    if (!(from in units)) return `지원하지 않는 단위입니다: ${from} (${cat} 카테고리: ${Object.keys(units).join(', ')})`
    if (!(to in units)) return `지원하지 않는 단위입니다: ${to} (${cat} 카테고리: ${Object.keys(units).join(', ')})`

    const baseValue = value * units[from]
    const result = baseValue / units[to]

    return JSON.stringify({
      value, from, to,
      result: Math.round(result * 10000) / 10000,
      category: cat,
      formula: `${value} ${from} = ${Math.round(result * 10000) / 10000} ${to}`,
    })
  }

  return '지원하지 않는 action입니다. (convert, categories)'
}
