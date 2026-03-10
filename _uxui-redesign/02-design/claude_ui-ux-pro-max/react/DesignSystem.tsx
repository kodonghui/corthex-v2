"use client";
import React from "react";

const styles = `body { font-family: "Inter", system-ui, sans-serif; background: #09090b; color: #fafafa; }
    .font-mono { font-family: "JetBrains Mono", monospace; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 2px; }`;

function DesignSystem() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      <div className="mb-8 pb-6 border-b border-zinc-800">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      </div>
      <h1 className="text-xl font-semibold tracking-tight">CORTHEX Design System</h1>
      <span className="text-xs text-zinc-600 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">v2.0</span>
    </div>
    <p className="text-sm text-zinc-400">Linear + Vercel + Raycast inspired. Ultra dark, content-first, zero decoration.</p>
  </div>

  {/* Color Tokens */}
  <section className="mb-10">
    <h2 className="text-sm font-semibold text-zinc-50 mb-4">Color Tokens</h2>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="w-8 h-8 rounded" style={{"background":"#09090b","border":"1px solid #3f3f46"}}></div>
          <div><div className="text-xs font-medium text-zinc-300">bg</div><div className="text-xs text-zinc-600 font-mono">#09090b · zinc-950</div></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="w-8 h-8 rounded" style={{"background":"#18181b"}}></div>
          <div><div className="text-xs font-medium text-zinc-300">surface</div><div className="text-xs text-zinc-600 font-mono">#18181b · zinc-900</div></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="w-8 h-8 rounded" style={{"background":"#27272a"}}></div>
          <div><div className="text-xs font-medium text-zinc-300">surface-2</div><div className="text-xs text-zinc-600 font-mono">#27272a · zinc-800</div></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="w-8 h-8 rounded" style={{"background":"#3f3f46"}}></div>
          <div><div className="text-xs font-medium text-zinc-300">border</div><div className="text-xs text-zinc-600 font-mono">#3f3f46 · zinc-700</div></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="w-8 h-8 rounded" style={{"background":"#fafafa"}}></div>
          <div><div className="text-xs font-medium text-zinc-300">text-primary</div><div className="text-xs text-zinc-600 font-mono">#fafafa · zinc-50</div></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="w-8 h-8 rounded" style={{"background":"#a1a1aa"}}></div>
          <div><div className="text-xs font-medium text-zinc-300">text-secondary</div><div className="text-xs text-zinc-600 font-mono">#a1a1aa · zinc-400</div></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="w-8 h-8 rounded" style={{"background":"#71717a"}}></div>
          <div><div className="text-xs font-medium text-zinc-300">text-muted</div><div className="text-xs text-zinc-600 font-mono">#71717a · zinc-500</div></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="w-8 h-8 rounded" style={{"background":"#3b82f6"}}></div>
          <div><div className="text-xs font-medium text-zinc-300">blue — primary actions</div><div className="text-xs text-zinc-600 font-mono">#3b82f6 · blue-500</div></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="w-8 h-8 rounded" style={{"background":"#22c55e"}}></div>
          <div><div className="text-xs font-medium text-zinc-300">green — success / positive</div><div className="text-xs text-zinc-600 font-mono">#22c55e · green-500</div></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="w-8 h-8 rounded" style={{"background":"#ef4444"}}></div>
          <div><div className="text-xs font-medium text-zinc-300">red — error / negative</div><div className="text-xs text-zinc-600 font-mono">#ef4444 · red-500</div></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="w-8 h-8 rounded" style={{"background":"#eab308"}}></div>
          <div><div className="text-xs font-medium text-zinc-300">yellow — warning</div><div className="text-xs text-zinc-600 font-mono">#eab308 · yellow-500</div></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="w-8 h-8 rounded" style={{"background":"#a855f7"}}></div>
          <div><div className="text-xs font-medium text-zinc-300">purple — AI-related</div><div className="text-xs text-zinc-600 font-mono">#a855f7 · purple-500</div></div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="w-8 h-8 rounded" style={{"background":"#f97316"}}></div>
          <div><div className="text-xs font-medium text-zinc-300">orange — live / active</div><div className="text-xs text-zinc-600 font-mono">#f97316 · orange-500</div></div>
        </div>
      </div>
    </div>
  </section>

  {/* Typography */}
  <section className="mb-10">
    <h2 className="text-sm font-semibold text-zinc-50 mb-4">Typography</h2>
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
      <div><p className="text-xl font-semibold tracking-tight text-zinc-50">Heading — text-xl font-semibold tracking-tight</p><p className="text-xs text-zinc-600 font-mono mt-1">Inter 20px / 700 / tracking-tight</p></div>
      <div><p className="text-sm font-semibold text-zinc-50">Section header — text-sm font-semibold</p><p className="text-xs text-zinc-600 font-mono mt-1">Inter 14px / 600</p></div>
      <div><p className="text-sm text-zinc-400">Body — text-sm text-zinc-400. 에이전트가 작업을 수행 중입니다.</p><p className="text-xs text-zinc-600 font-mono mt-1">Inter 14px / 400</p></div>
      <div><p className="text-xs text-zinc-500">Caption — text-xs text-zinc-500. 2026-03-10 14:32</p><p className="text-xs text-zinc-600 font-mono mt-1">Inter 12px / 400</p></div>
      <div><p className="text-xs font-medium text-zinc-400">Label — text-xs font-medium text-zinc-400</p><p className="text-xs text-zinc-600 font-mono mt-1">Inter 12px / 500</p></div>
      <div><p className="font-mono text-sm text-zinc-300">Mono — JetBrains Mono. AGT-20241203-001 · $23.40</p><p className="text-xs text-zinc-600 font-mono mt-1">JetBrains Mono 14px / 400 — IDs, costs, code</p></div>
    </div>
  </section>

  {/* Buttons */}
  <section className="mb-10">
    <h2 className="text-sm font-semibold text-zinc-50 mb-4">Buttons</h2>
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex flex-wrap gap-3 mb-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors duration-150 cursor-pointer">Primary</button>
        <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-50 text-sm font-medium px-4 py-2 rounded-md border border-zinc-700 transition-colors duration-150 cursor-pointer">Secondary</button>
        <button className="hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-300 text-sm font-medium px-4 py-2 rounded-md transition-colors duration-150 cursor-pointer">Ghost</button>
        <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium px-4 py-2 rounded-md border border-red-500/20 transition-colors duration-150 cursor-pointer">Danger</button>
        <button className="bg-zinc-800/50 text-zinc-600 text-sm font-medium px-4 py-2 rounded-md cursor-not-allowed" disabled>Disabled</button>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer">Small</button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors cursor-pointer">Medium</button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white text-base font-medium px-5 py-2.5 rounded-md transition-colors cursor-pointer">Large</button>
      </div>
    </div>
  </section>

  {/* Badges */}
  <section className="mb-10">
    <h2 className="text-sm font-semibold text-zinc-50 mb-4">Status Badges</h2>
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-wrap gap-3">
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>활성</span>
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>실행중</span>
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>오류</span>
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>대기</span>
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>AI</span>
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400"><span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>라이브</span>
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-500">비활성</span>
    </div>
  </section>

  {/* Inputs */}
  <section className="mb-10">
    <h2 className="text-sm font-semibold text-zinc-50 mb-4">Inputs</h2>
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-3">
      <input className="w-full bg-zinc-900 border border-zinc-700 text-zinc-50 text-sm px-3 py-2 rounded-md placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="Default input" />
      <input className="w-full bg-zinc-900 border border-red-500/50 text-zinc-50 text-sm px-3 py-2 rounded-md focus:outline-none focus:border-red-500 transition-colors" placeholder="Error state" value="잘못된 값" />
      <input className="w-full bg-zinc-800/50 border border-zinc-800 text-zinc-600 text-sm px-3 py-2 rounded-md cursor-not-allowed" placeholder="Disabled" disabled />
    </div>
  </section>

  {/* Cards */}
  <section className="mb-10">
    <h2 className="text-sm font-semibold text-zinc-50 mb-4">Cards</h2>
    <div className="grid grid-cols-3 gap-4">
      {/* KPI Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-zinc-500">활성 에이전트</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </div>
        <div className="text-2xl font-semibold text-zinc-50">12</div>
        <div className="text-xs text-green-400 mt-1">+2 오늘</div>
      </div>
      {/* Status Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400">비서실장</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">활성</span>
        </div>
        <div className="text-sm text-zinc-300">claude-sonnet-4-6</div>
        <div className="text-xs text-zinc-600 mt-1">오늘 47개 명령 처리</div>
      </div>
      {/* Alert Card */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <span className="text-xs font-medium text-yellow-400">예산 경고</span>
        </div>
        <div className="text-sm text-zinc-300">이번 달 비용 78% 소진</div>
        <div className="text-xs text-zinc-500 mt-1">₩18,240 / ₩23,400</div>
      </div>
    </div>
  </section>

  {/* Table */}
  <section className="mb-10">
    <h2 className="text-sm font-semibold text-zinc-50 mb-4">Table</h2>
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead><tr className="border-b border-zinc-800">
          <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500">에이전트</th>
          <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500">계급</th>
          <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500">모델</th>
          <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500">상태</th>
          <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500">오늘 비용</th>
        </tr></thead>
        <tbody>
          <tr className="hover:bg-zinc-800/30 transition-colors cursor-pointer border-b border-zinc-800/50">
            <td className="py-3 px-4 text-sm text-zinc-50">비서실장</td>
            <td className="py-3 px-4 text-xs text-zinc-500">Manager</td>
            <td className="py-3 px-4 text-xs font-mono text-zinc-400">claude-sonnet-4-6</td>
            <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">활성</span></td>
            <td className="py-3 px-4 text-right text-xs font-mono text-zinc-300">$2.34</td>
          </tr>
          <tr className="hover:bg-zinc-800/30 transition-colors cursor-pointer border-b border-zinc-800/50">
            <td className="py-3 px-4 text-sm text-zinc-50">전략분석가</td>
            <td className="py-3 px-4 text-xs text-zinc-500">Specialist</td>
            <td className="py-3 px-4 text-xs font-mono text-zinc-400">claude-haiku-3-5</td>
            <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400">실행중</span></td>
            <td className="py-3 px-4 text-right text-xs font-mono text-zinc-300">$0.87</td>
          </tr>
          <tr className="hover:bg-zinc-800/30 transition-colors cursor-pointer">
            <td className="py-3 px-4 text-sm text-zinc-50">SNS봇</td>
            <td className="py-3 px-4 text-xs text-zinc-500">Worker</td>
            <td className="py-3 px-4 text-xs font-mono text-zinc-400">claude-haiku-3-5</td>
            <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-500">비활성</span></td>
            <td className="py-3 px-4 text-right text-xs font-mono text-zinc-300">$0.12</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  {/* Motion Guidelines */}
  <section className="mb-10">
    <h2 className="text-sm font-semibold text-zinc-50 mb-4">Motion Guidelines</h2>
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-3">
      <div className="flex items-center gap-4"><span className="font-mono text-xs text-zinc-400 w-24">150ms</span><span className="text-sm text-zinc-400">hover states, color transitions — transition-colors duration-150</span></div>
      <div className="flex items-center gap-4"><span className="font-mono text-xs text-zinc-400 w-24">200ms</span><span className="text-sm text-zinc-400">micro-interactions, button press — transition-all duration-200</span></div>
      <div className="flex items-center gap-4"><span className="font-mono text-xs text-zinc-400 w-24">300ms</span><span className="text-sm text-zinc-400">panel open/close, modal — transition-all duration-300</span></div>
    </div>
  </section>

  {/* Page Index */}
  <section className="mb-10">
    <h2 className="text-sm font-semibold text-zinc-50 mb-4">Page Index — 44 Pages</h2>
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="text-xs font-medium text-zinc-500 mb-2">App Pages (23)</div>
        <div className="space-y-1">
          <a href="/app/home" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-home.html — 홈</a>
          <a href="/app/command-center" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-command-center.html — 사령관실</a>
          <a href="/app/chat" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-chat.html — 채팅</a>
          <a href="/app/dashboard" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-dashboard.html — 대시보드</a>
          <a href="/app/trading" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-trading.html — 전략실</a>
          <a href="/app/agora" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-agora.html — 아고라</a>
          <a href="/app/nexus" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-nexus.html — 넥서스</a>
          <a href="/app/agents" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-agents.html — 조직</a>
          <a href="/app/departments" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-departments.html — 부서</a>
          <a href="/app/credentials" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-credentials.html — 크리덴셜</a>
          <a href="/app/sns" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-sns.html — SNS</a>
          <a href="/app/messenger" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-messenger.html — 메신저</a>
          <a href="/app/ops-log" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-ops-log.html — 작전일지</a>
          <a href="/app/reports" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-reports.html — 보고서</a>
          <a href="/app/jobs" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-jobs.html — 작업</a>
          <a href="/app/knowledge" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-knowledge.html — 지식창고</a>
          <a href="/app/files" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-files.html — 파일</a>
          <a href="/app/costs" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-costs.html — 비용</a>
          <a href="/app/activity-log" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-activity-log.html — 활동로그</a>
          <a href="/app/notifications" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-notifications.html — 알림</a>
          <a href="/app/settings" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-settings.html — 설정</a>
          <a href="/app/performance" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-performance.html — 성과분석</a>
          <a href="/app/argos" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-argos.html — 아르고스</a>
          <a href="/app/classified" className="block text-sm text-blue-400 hover:text-blue-300 transition-colors">app-classified.html — 기밀문서</a>
        </div>
      </div>
      <div>
        <div className="text-xs font-medium text-zinc-500 mb-2">Admin Pages (20)</div>
        <div className="space-y-1">
          <a href="/admin/dashboard" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-dashboard.html — 대시보드</a>
          <a href="/admin/agents" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-agents.html — 에이전트</a>
          <a href="/admin/departments" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-departments.html — 부서</a>
          <a href="/admin/employees" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-employees.html — 직원</a>
          <a href="/admin/credentials" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-credentials.html — 크리덴셜</a>
          <a href="/admin/tools" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-tools.html — 도구</a>
          <a href="/admin/soul-templates" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-soul-templates.html — Soul템플릿</a>
          <a href="/admin/org-chart" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-org-chart.html — 조직도</a>
          <a href="/admin/org-templates" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-org-templates.html — 조직템플릿</a>
          <a href="/admin/report-lines" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-report-lines.html — 보고체계</a>
          <a href="/admin/template-market" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-template-market.html — 템플릿마켓</a>
          <a href="/admin/agent-marketplace" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-agent-marketplace.html — 에이전트마켓</a>
          <a href="/admin/api-keys" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-api-keys.html — API키</a>
          <a href="/admin/costs" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-costs.html — 비용</a>
          <a href="/admin/companies" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-companies.html — 회사</a>
          <a href="/admin/settings" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-settings.html — 설정</a>
          <a href="/admin/monitoring" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-monitoring.html — 모니터링</a>
          <a href="/admin/onboarding" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-onboarding.html — 온보딩</a>
          <a href="/admin/users" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-users.html — 사용자</a>
          <a href="/admin/workflows" className="block text-sm text-purple-400 hover:text-purple-300 transition-colors">admin-workflows.html — 워크플로우</a>
        </div>
      </div>
    </div>
  </section>
    </>
  );
}

export default DesignSystem;
