import type { ToolHandler } from '../types'

export const randomGenerator: ToolHandler = (input) => {
  const action = String(input.action || 'number')

  switch (action) {
    case 'number': {
      const min = Number(input.min ?? 1)
      const max = Number(input.max ?? 100)
      const count = Math.min(Number(input.count || 1), 100)
      if (min > max) return 'min이 max보다 클 수 없습니다.'
      const numbers: number[] = []
      for (let i = 0; i < count; i++) {
        numbers.push(Math.floor(Math.random() * (max - min + 1)) + min)
      }
      return JSON.stringify({ numbers, min, max, count: numbers.length })
    }

    case 'uuid': {
      const count = Math.min(Number(input.count || 1), 20)
      const uuids: string[] = []
      for (let i = 0; i < count; i++) {
        uuids.push(crypto.randomUUID())
      }
      return JSON.stringify({ uuids, count: uuids.length })
    }

    case 'string': {
      const length = Math.min(Number(input.length || 16), 256)
      const charset = String(input.charset || 'alphanumeric')
      const charsets: Record<string, string> = {
        alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        numeric: '0123456789',
        hex: '0123456789abcdef',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
      }
      const chars = charsets[charset] || charsets.alphanumeric
      let result = ''
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)]
      }
      return JSON.stringify({ value: result, length, charset })
    }

    case 'pick': {
      const items = input.items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return '선택할 항목 배열(items)을 제공하세요.'
      }
      const count = Math.min(Number(input.count || 1), items.length)
      const shuffled = [...items].sort(() => Math.random() - 0.5)
      const picked = shuffled.slice(0, count)
      return JSON.stringify({ picked, count: picked.length, totalItems: items.length })
    }

    case 'shuffle': {
      const items = input.items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return '셔플할 항목 배열(items)을 제공하세요.'
      }
      const shuffled = [...items].sort(() => Math.random() - 0.5)
      return JSON.stringify({ shuffled, count: shuffled.length })
    }

    case 'coin': {
      const count = Math.min(Number(input.count || 1), 100)
      const results: string[] = []
      for (let i = 0; i < count; i++) {
        results.push(Math.random() < 0.5 ? '앞면' : '뒷면')
      }
      const heads = results.filter((r) => r === '앞면').length
      return JSON.stringify({ results, heads, tails: count - heads, count })
    }

    case 'dice': {
      const sides = Number(input.sides || 6)
      const count = Math.min(Number(input.count || 1), 100)
      const results: number[] = []
      for (let i = 0; i < count; i++) {
        results.push(Math.floor(Math.random() * sides) + 1)
      }
      const sum = results.reduce((a, b) => a + b, 0)
      return JSON.stringify({ results, sides, count, sum, average: Math.round(sum / count * 100) / 100 })
    }

    default:
      return '지원하지 않는 action입니다. (number, uuid, string, pick, shuffle, coin, dice)'
  }
}
