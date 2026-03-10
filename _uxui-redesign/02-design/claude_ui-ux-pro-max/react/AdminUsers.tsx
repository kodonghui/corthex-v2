"use client";
import React from "react";

const styles = `
body { font-family: "Inter", system-ui, sans-serif; background: #09090b; color: #fafafa; }
    .font-mono { font-family: "JetBrains Mono", monospace; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 2px; }
    @media (prefers-reduced-motion: reduce) { * { transition-duration: 1ms !important; animation-duration: 1ms !important; } }
`;

function AdminUsers() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* GET /api/admin/users — returns user list with system_role, department_role, last_login, 2fa_enabled */}
  {/* Sidebar */}
  <aside className="w-60 min-w-[240px] bg-zinc-900 border-r border-zinc-800 flex flex-col fixed h-full z-20">
    <div className="h-12 border-b border-zinc-800 flex items-center px-4 gap-3 flex-shrink-0">
      <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      </div>
      <span className="text-sm font-semibold tracking-tight">CORTHEX</span>
      <span className="ml-auto text-xs text-zinc-600 font-mono">v2</span>
    </div>
    <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
      <div className="px-2 pt-3 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider">현황</div>
      <a href="/admin/dashboard" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>대시보드</a>
      <a href="/admin/monitoring" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"/></svg>모니터링</a>
      <div className="px-2 pt-3 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider">조직관리</div>
      <a href="/admin/agents" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>에이전트</a>
      <a href="/admin/departments" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>부서</a>
      <a href="/admin/employees" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>직원</a>
      <a href="/admin/org-chart" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>조직도</a>
      <a href="/admin/report-lines" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>보고체계</a>
      <div className="px-2 pt-3 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider">템플릿</div>
      <a href="/admin/soul-templates" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>Soul템플릿</a>
      <a href="/admin/org-templates" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>조직템플릿</a>
      <a href="/admin/template-market" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>템플릿마켓</a>
      <a href="/admin/agent-marketplace" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>에이전트마켓</a>
      <div className="px-2 pt-3 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider">시스템</div>
      <a href="/admin/credentials" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>크리덴셜</a>
      <a href="/admin/tools" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>도구</a>
      <a href="/admin/api-keys" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>API키</a>
      <a href="/admin/costs" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>비용</a>
      <div className="px-2 pt-3 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider">관리</div>
      <a href="/admin/companies" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>회사</a>
      <a href="/admin/users" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md bg-zinc-800 text-zinc-50 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>사용자</a>
      <a href="/admin/workflows" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>워크플로우</a>
      <a href="/admin/onboarding" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>온보딩</a>
      <a href="/admin/settings" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>설정</a>
    </nav>
    <div className="h-10 border-t border-zinc-800 flex items-center px-3 gap-2 flex-shrink-0">
      <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-medium text-zinc-300 flex-shrink-0">관</div>
      <div className="flex-1 min-w-0"><div className="text-xs font-medium text-zinc-300 truncate">관리자</div></div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
    </div>
  </aside>
  {/* Main content */}
  <main className="ml-60 flex-1 flex flex-col min-h-screen overflow-y-auto">
    <div className="h-12 border-b border-zinc-800 flex items-center px-6 gap-3 sticky top-0 bg-zinc-950/90 backdrop-blur-sm z-10 flex-shrink-0">
      <span className="text-sm font-medium text-zinc-50">사용자 관리</span>
      <span className="text-zinc-700">·</span>
      <span className="text-xs text-zinc-500">19명 시스템 사용자</span>
      <div className="ml-auto flex items-center gap-2">
        <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md">+ 사용자 초대</button>
      </div>
    </div>
    <div className="flex-1 p-6">

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="사용자 검색..." className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-9 pr-4 py-1.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600" />
        </div>
        <select className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-zinc-400 focus:outline-none">
          <option>전체 역할</option>
          <option>슈퍼관리자</option>
          <option>관리자</option>
          <option>팀장</option>
          <option>팀원</option>
        </select>
        <select className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-zinc-400 focus:outline-none">
          <option>전체 상태</option>
          <option>활성</option>
          <option>비활성</option>
        </select>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">사용자</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">이메일</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">시스템 역할</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">부서 역할</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">마지막 로그인</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">2FA</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">상태</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            <tr className="hover:bg-zinc-800/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-zinc-400 rounded-full flex items-center justify-center text-xs text-black font-bold">관</div>
                  <span className="text-zinc-200">관리자</span>
                </div>
              </td>
              <td className="px-4 py-3 text-xs font-mono text-zinc-500">admin@corthex.ai</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400">슈퍼관리자</span></td>
              <td className="px-4 py-3 text-xs text-zinc-500">—</td>
              <td className="px-4 py-3 text-xs font-mono text-zinc-500">방금 전</td>
              <td className="px-4 py-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              </td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">활성</span></td>
              <td className="px-4 py-3 text-xs text-zinc-600">—</td>
            </tr>
            <tr className="hover:bg-zinc-800/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium">김</div>
                  <span className="text-zinc-200">김대표</span>
                </div>
              </td>
              <td className="px-4 py-3 text-xs font-mono text-zinc-500">ceo@corthex.ai</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400">관리자</span></td>
              <td className="px-4 py-3 text-xs text-zinc-400">CEO</td>
              <td className="px-4 py-3 text-xs font-mono text-zinc-500">1시간 전</td>
              <td className="px-4 py-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              </td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">활성</span></td>
              <td className="px-4 py-3"><button className="text-xs text-blue-400 hover:text-blue-300">편집</button></td>
            </tr>
            <tr className="hover:bg-zinc-800/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium">김</div>
                  <span className="text-zinc-200">김민준</span>
                </div>
              </td>
              <td className="px-4 py-3 text-xs font-mono text-zinc-500">minjun@corthex.ai</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-400">팀장</span></td>
              <td className="px-4 py-3 text-xs text-zinc-400">AI 전략실 팀장</td>
              <td className="px-4 py-3 text-xs font-mono text-zinc-500">3시간 전</td>
              <td className="px-4 py-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              </td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">활성</span></td>
              <td className="px-4 py-3"><button className="text-xs text-blue-400 hover:text-blue-300">편집</button></td>
            </tr>
            <tr className="hover:bg-zinc-800/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center text-xs text-white font-medium">이</div>
                  <span className="text-zinc-200">이수현</span>
                </div>
              </td>
              <td className="px-4 py-3 text-xs font-mono text-zinc-500">suhyeon@corthex.ai</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs bg-zinc-700 text-zinc-400">팀원</span></td>
              <td className="px-4 py-3 text-xs text-zinc-400">리서치팀 팀원</td>
              <td className="px-4 py-3 text-xs font-mono text-zinc-500">방금 전</td>
              <td className="px-4 py-3 text-zinc-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400">신규</span></td>
              <td className="px-4 py-3"><button className="text-xs text-blue-400 hover:text-blue-300">편집</button></td>
            </tr>
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">19명 사용자 중 1-4 표시</span>
          <button className="text-xs text-blue-400 hover:text-blue-300">전체 보기</button>
        </div>
      </div>

    </div>
  </main>
    </>
  );
}

export default AdminUsers;
