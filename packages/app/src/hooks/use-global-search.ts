import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

// ── Types ──

export type SearchResultCategory = 'agents' | 'departments' | 'documents'

export type SearchResult = {
  id: string
  title: string
  subtitle?: string
  category: SearchResultCategory
  path: string
}

export type GroupedResults = Record<SearchResultCategory, SearchResult[]>

type SearchApiResponse = {
  success: boolean
  data: {
    agents: Array<{ id: string; name: string; role: string | null }>
    departments: Array<{ id: string; name: string; description: string | null }>
    documents: Array<{ id: string; title: string; type: string }>
  }
}

// ── Debounce helper ──

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

// ── Main hook ──

export function useGlobalSearch() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)

  const { data, isLoading, error } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: () =>
      api.get<SearchApiResponse>(`/workspace/search?q=${encodeURIComponent(debouncedQuery)}`),
    enabled: debouncedQuery.length >= 2,
    staleTime: 10_000,
  })

  const results: SearchResult[] = useMemo(() => {
    if (!data?.data) return []

    const items: SearchResult[] = []

    for (const agent of data.data.agents || []) {
      items.push({
        id: agent.id,
        title: agent.name,
        subtitle: agent.role || undefined,
        category: 'agents',
        path: `/chat?agentId=${agent.id}`,
      })
    }

    for (const dept of data.data.departments || []) {
      items.push({
        id: dept.id,
        title: dept.name,
        subtitle: dept.description || undefined,
        category: 'departments',
        path: `/departments?id=${dept.id}`,
      })
    }

    for (const doc of data.data.documents || []) {
      items.push({
        id: doc.id,
        title: doc.title,
        subtitle: doc.type,
        category: 'documents',
        path: `/knowledge?id=${doc.id}`,
      })
    }

    return items
  }, [data])

  const grouped: GroupedResults = useMemo(() => {
    return {
      agents: results.filter((r) => r.category === 'agents'),
      departments: results.filter((r) => r.category === 'departments'),
      documents: results.filter((r) => r.category === 'documents'),
    }
  }, [results])

  return {
    query,
    setQuery,
    results,
    grouped,
    isLoading: debouncedQuery.length >= 2 && isLoading,
    error: error ? (error as Error).message : null,
    isEmpty: debouncedQuery.length >= 2 && !isLoading && results.length === 0,
  }
}
