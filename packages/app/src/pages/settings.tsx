export function SettingsPage() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">설정</h2>

      <div className="max-w-lg space-y-6">
        <section>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">개인 API Key</h3>
          <div className="space-y-3">
            {['KIS 증권', '노션', '이메일', '텔레그램'].map((provider) => (
              <div key={provider} className="flex items-center justify-between p-3 rounded-md border border-zinc-200 dark:border-zinc-800">
                <span className="text-sm">{provider}</span>
                <span className="text-xs text-zinc-400">미연동</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
