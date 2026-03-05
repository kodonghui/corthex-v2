import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useBlocker } from 'react-router-dom'
import Markdown from 'react-markdown'
import { ConfirmDialog } from '@corthex/ui'
import { api } from '../../lib/api'
import { toast } from '@corthex/ui'

type AgentDetail = {
  id: string
  name: string
  role: string
  soul: string | null
  adminSoul: string | null
  status: string
}

const MAX_CHARS = 2000

export function SoulEditor({ onDirtyChange }: { onDirtyChange?: (dirty: boolean) => void }) {
  const queryClient = useQueryClient()
  const [selectedAgent, setSelectedAgent] = useState('')
  const [soulText, setSoulText] = useState('')
  const [originalSoul, setOriginalSoul] = useState('')
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')

  const isDirty = soulText !== originalSoul

  // 부모에게 dirty 상태 알림
  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  // 에이전트 목록
  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: { id: string; name: string }[] }>('/workspace/agents'),
  })

  // 에이전트 상세 (소울 포함)
  const { data: agentDetail } = useQuery({
    queryKey: ['agent-detail', selectedAgent],
    queryFn: () => api.get<{ data: AgentDetail }>(`/workspace/agents/${selectedAgent}`),
    enabled: !!selectedAgent,
  })

  // 소울 저장
  const updateSoul = useMutation({
    mutationFn: () => api.patch(`/workspace/agents/${selectedAgent}/soul`, { soul: soulText }),
    onSuccess: () => {
      setOriginalSoul(soulText)
      queryClient.invalidateQueries({ queryKey: ['agent-detail', selectedAgent] })
      toast.success('소울이 업데이트되었습니다. 다음 대화부터 반영됩니다.')
    },
    onError: () => toast.error('소울 저장에 실패했습니다'),
  })

  // 소울 초기화
  const resetSoul = useMutation({
    mutationFn: () => api.post(`/workspace/agents/${selectedAgent}/soul/reset`, {}),
    onSuccess: (res) => {
      const data = res as { data: { soul: string } }
      setSoulText(data.data.soul || '')
      setOriginalSoul(data.data.soul || '')
      queryClient.invalidateQueries({ queryKey: ['agent-detail', selectedAgent] })
      toast.success('소울이 초기화되었습니다.')
    },
    onError: (err: Error) => toast.error(err.message || '초기화에 실패했습니다'),
  })

  // 에이전트 선택 시 소울 로드
  const detailId = agentDetail?.data?.id
  const detailSoul = agentDetail?.data?.soul
  useEffect(() => {
    if (detailId) {
      const soul = detailSoul || ''
      setSoulText(soul)
      setOriginalSoul(soul)
    }
  }, [detailId, detailSoul])

  // 이탈 방지
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  )

  const handleAgentChange = useCallback((agentId: string) => {
    if (isDirty && !confirm('저장하지 않은 변경사항이 있습니다. 다른 에이전트로 변경하시겠어요?')) {
      return
    }
    setSelectedAgent(agentId)
    setSoulText('')
    setOriginalSoul('')
  }, [isDirty])

  const handleReset = useCallback(() => {
    if (!confirm('관리자가 설정한 원래 소울로 되돌립니다. 현재 내용이 사라집니다.')) return
    resetSoul.mutate()
  }, [resetSoul])

  const agents = agentsData?.data || []
  const detail = agentDetail?.data
  const charCount = soulText.length
  const isOverLimit = charCount > MAX_CHARS

  return (
    <section className="space-y-4">
      {/* 상단: 에이전트 선택 + 초기화 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">소울 편집</h3>
        {selectedAgent && detail?.adminSoul && (
          <button
            onClick={handleReset}
            disabled={resetSoul.isPending}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            {resetSoul.isPending ? '초기화 중...' : '초기화 ↺'}
          </button>
        )}
      </div>

      {/* 에이전트 드롭다운 */}
      <select
        value={selectedAgent}
        onChange={(e) => handleAgentChange(e.target.value)}
        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm"
      >
        <option value="">에이전트 선택 (내 에이전트 {agents.length}개)</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>

      {selectedAgent && detail && (
        <>
          {/* 미저장 변경사항 배너 */}
          {isDirty && (
            <div className="flex items-center justify-between px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md text-xs text-amber-700 dark:text-amber-300">
              <span>저장하지 않은 변경사항이 있습니다.</span>
              <button
                onClick={() => updateSoul.mutate()}
                disabled={updateSoul.isPending}
                className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
              >
                {updateSoul.isPending ? '저장 중...' : '저장'}
              </button>
            </div>
          )}

          {/* 모바일 탭 전환 */}
          <div className="flex md:hidden border-b border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setMobileTab('edit')}
              className={`flex-1 py-2 text-sm font-medium text-center ${
                mobileTab === 'edit'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'text-zinc-500'
              }`}
            >
              편집
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`flex-1 py-2 text-sm font-medium text-center ${
                mobileTab === 'preview'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'text-zinc-500'
              }`}
            >
              미리보기
            </button>
          </div>

          {/* 편집기 + 미리보기 (데스크톱: 50/50, 모바일: 탭 전환) */}
          <div className="flex gap-4">
            {/* 편집기 */}
            <div className={`flex-1 ${mobileTab !== 'edit' ? 'hidden md:block' : ''}`}>
              <div className="relative">
                <textarea
                  value={soulText}
                  onChange={(e) => setSoulText(e.target.value)}
                  rows={12}
                  placeholder="에이전트의 성격, 역할, 말투를 마크다운으로 정의..."
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm resize-none font-mono leading-relaxed"
                />
                {/* 글자 수 카운터 */}
                <span
                  className={`absolute bottom-2 right-3 text-[10px] ${
                    isOverLimit
                      ? 'text-amber-500 font-medium'
                      : 'text-zinc-400'
                  }`}
                >
                  {charCount} / {MAX_CHARS}자
                </span>
              </div>
            </div>

            {/* 미리보기 */}
            <div className={`flex-1 ${mobileTab !== 'preview' ? 'hidden md:block' : ''}`}>
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-md p-3 min-h-[288px] max-h-[288px] overflow-y-auto">
                {soulText ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                    <Markdown>{soulText}</Markdown>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 italic">미리보기가 여기에 표시됩니다</p>
                )}
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={() => updateSoul.mutate()}
              disabled={!soulText.trim() || updateSoul.isPending || !isDirty || isOverLimit}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {updateSoul.isPending ? '저장 중...' : '소울 저장'}
            </button>
          </div>
        </>
      )}

      {/* 이탈 방지 다이얼로그 */}
      <ConfirmDialog
        isOpen={blocker.state === 'blocked'}
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
        title="저장하지 않은 변경사항"
        description="저장하지 않은 변경사항이 있습니다. 나가시겠어요?"
        confirmText="나가기"
        cancelText="계속 편집"
        variant="danger"
      />
    </section>
  )
}
