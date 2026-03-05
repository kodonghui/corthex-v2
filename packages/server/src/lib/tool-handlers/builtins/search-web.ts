import type { ToolHandler } from '../types'

export const searchWeb: ToolHandler = (input) => {
  const query = String(input.query || '')
  return JSON.stringify({
    query,
    results: [],
    message: '웹 검색은 현재 개발 중입니다. 추후 외부 API 연동 예정.',
  })
}
