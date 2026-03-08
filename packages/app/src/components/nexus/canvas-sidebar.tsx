import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'

interface SketchItem {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

interface KnowledgeDocItem {
  id: string
  title: string
  content: string | null
  updatedAt: string
}

interface CanvasSidebarProps {
  currentSketchId: string | null
  onLoad: (id: string) => void
  onNew: () => void
  onLoadFromKnowledge?: (mermaidCode: string, title: string) => void
}

type TabType = 'sketches' | 'knowledge'

export function CanvasSidebar({ currentSketchId, onLoad, onNew, onLoadFromKnowledge }: CanvasSidebarProps) {
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('sketches')

  const { data: sketchesRes, isLoading: sketchesLoading } = useQuery({
    queryKey: ['sketches'],
    queryFn: () => api.get<{ data: SketchItem[] }>('/workspace/sketches'),
  })

  const { data: knowledgeRes, isLoading: knowledgeLoading } = useQuery({
    queryKey: ['knowledge-docs-mermaid'],
    queryFn: () => api.get<{ data: KnowledgeDocItem[] }>('/workspace/knowledge/docs?contentType=mermaid&limit=50'),
    enabled: activeTab === 'knowledge',
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/sketches/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sketches'] })
      setConfirmDelete(null)
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/sketches/${id}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sketches'] })
    },
  })

  const sketches = sketchesRes?.data || []
  const knowledgeDocs = knowledgeRes?.data || []

  const handleKnowledgeImport = (doc: KnowledgeDocItem) => {
    if (!doc.content || !onLoadFromKnowledge) return
    // Extract Mermaid code from ```mermaid ... ``` block
    const match = doc.content.match(/```mermaid\s*\n([\s\S]*?)```/)
    const mermaidCode = match ? match[1].trim() : doc.content
    onLoadFromKnowledge(mermaidCode, doc.title)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab header */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('sketches')}
          className={`flex-1 px-3 py-2 text-[10px] font-medium transition-colors ${
            activeTab === 'sketches'
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          스케치
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex-1 px-3 py-2 text-[10px] font-medium transition-colors ${
            activeTab === 'knowledge'
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          지식 베이스
        </button>
      </div>

      {/* Sketches tab */}
      {activeTab === 'sketches' && (
        <>
          <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">저장된 캔버스</span>
            <button
              onClick={onNew}
              className="text-[10px] px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
            >
              + 새 캔버스
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {sketchesLoading && (
              <div className="px-3 py-4 text-xs text-zinc-500 text-center">불러오는 중...</div>
            )}

            {!sketchesLoading && sketches.length === 0 && (
              <div className="px-3 py-4 text-xs text-zinc-500 text-center">
                저장된 캔버스가 없어요.
                <br />
                캔버스를 그리고 저장해보세요.
              </div>
            )}

            {sketches.map((s) => (
              <div
                key={s.id}
                className={`group px-3 py-2 border-b border-zinc-800/50 cursor-pointer hover:bg-zinc-800/50 transition-colors ${
                  s.id === currentSketchId ? 'bg-indigo-900/30 border-l-2 border-l-indigo-500' : ''
                }`}
                onClick={() => onLoad(s.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-200 truncate flex-1">{s.name}</span>
                  {confirmDelete === s.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteMutation.mutate(s.id)
                        }}
                        className="text-[10px] px-1.5 py-0.5 bg-red-600 text-white rounded"
                      >
                        확인
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDelete(null)
                        }}
                        className="text-[10px] px-1.5 py-0.5 bg-zinc-700 text-zinc-300 rounded"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateMutation.mutate(s.id)
                        }}
                        className="text-zinc-500 hover:text-indigo-400 text-[10px]"
                        title="복제"
                      >
                        복제
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDelete(s.id)
                        }}
                        className="text-zinc-600 hover:text-red-400 text-xs"
                        title="삭제"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  {new Date(s.updatedAt).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Knowledge base tab */}
      {activeTab === 'knowledge' && (
        <div className="flex-1 overflow-y-auto">
          {knowledgeLoading && (
            <div className="px-3 py-4 text-xs text-zinc-500 text-center">불러오는 중...</div>
          )}

          {!knowledgeLoading && knowledgeDocs.length === 0 && (
            <div className="px-3 py-4 text-xs text-zinc-500 text-center">
              Mermaid 다이어그램이 없어요.
              <br />
              캔버스에서 &quot;지식 베이스에 저장&quot;으로 내보내보세요.
            </div>
          )}

          {knowledgeDocs.map((doc) => (
            <div
              key={doc.id}
              className="group px-3 py-2 border-b border-zinc-800/50 cursor-pointer hover:bg-zinc-800/50 transition-colors"
              onClick={() => handleKnowledgeImport(doc)}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-200 truncate flex-1">{doc.title}</span>
                <span className="text-[9px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  가져오기
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                {new Date(doc.updatedAt).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
