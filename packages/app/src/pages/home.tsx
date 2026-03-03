import { useAuthStore } from '../stores/auth-store'

export function HomePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2">
        안녕하세요 {user?.name}님
      </h2>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">
        오늘도 좋은 하루 되세요.
      </p>

      {/* 에이전트 카드 — P1 채팅 구현 후 동적으로 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">아직 업무 기록이 없습니다</p>
          <p className="text-xs text-zinc-400 mt-1">채팅에서 에이전트와 대화를 시작하세요</p>
        </div>
      </div>
    </div>
  )
}
