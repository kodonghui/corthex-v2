export function ChatPage() {
  return (
    <div className="flex h-full">
      {/* 에이전트 목록 (채팅 세부 사이드바) */}
      <div className="w-56 border-r border-zinc-200 dark:border-zinc-800 p-4">
        <h3 className="text-sm font-medium text-zinc-500 mb-3">에이전트</h3>
        <p className="text-xs text-zinc-400">에이전트가 없습니다. 관리자에게 문의하세요.</p>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-zinc-400">
            <p className="text-lg mb-1">에이전트를 선택하세요</p>
            <p className="text-sm">좌측에서 에이전트를 선택하면 채팅이 시작됩니다</p>
          </div>
        </div>
      </div>
    </div>
  )
}
