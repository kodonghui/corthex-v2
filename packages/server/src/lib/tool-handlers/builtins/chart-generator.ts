import type { ToolHandler } from '../types'

export const chartGenerator: ToolHandler = (input) => {
  const action = String(input.type || input.action || 'bar')
  const title = String(input.title || '차트')
  const labelsRaw = input.labels
  const datasetsRaw = input.datasets
  const dataRaw = input.data

  // Simple mode: labels + data arrays
  if (labelsRaw && dataRaw && !datasetsRaw) {
    const labels = Array.isArray(labelsRaw) ? labelsRaw.map(String) : String(labelsRaw).split(',').map((s) => s.trim())
    const data = Array.isArray(dataRaw) ? dataRaw.map(Number) : String(dataRaw).split(',').map((s) => Number(s.trim()))

    return JSON.stringify({
      type: action,
      title,
      labels,
      datasets: [{ label: title, data }],
    })
  }

  // Advanced mode: labels + datasets array
  if (labelsRaw && datasetsRaw) {
    const labels = Array.isArray(labelsRaw) ? labelsRaw.map(String) : String(labelsRaw).split(',').map((s) => s.trim())
    const datasets = Array.isArray(datasetsRaw) ? datasetsRaw.map((ds: Record<string, unknown>) => ({
      label: String(ds.label || ''),
      data: Array.isArray(ds.data) ? ds.data.map(Number) : [],
    })) : []

    return JSON.stringify({ type: action, title, labels, datasets })
  }

  // CSV mode: parse from data string
  if (typeof dataRaw === 'string' && dataRaw.includes('\n')) {
    const lines = dataRaw.trim().split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length >= 2) {
      const headers = lines[0].split(',').map((h) => h.trim())
      const labels: string[] = []
      const values: number[] = []
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim())
        labels.push(cols[0] || '')
        values.push(Number(cols[1]) || 0)
      }
      return JSON.stringify({
        type: action,
        title,
        labels,
        datasets: [{ label: headers[1] || title, data: values }],
      })
    }
  }

  return JSON.stringify({
    error: true,
    message: '차트 데이터를 지정하세요. labels(라벨 배열)와 data(숫자 배열) 또는 datasets(데이터셋 배열)가 필요합니다.',
    supportedTypes: ['bar', 'line', 'pie', 'scatter', 'doughnut'],
  })
}
