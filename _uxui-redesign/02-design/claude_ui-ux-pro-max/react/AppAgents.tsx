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

function AppAgents() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* API: GET /api/agents, GET /api/departments */}
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
      <div className="px-2 pt-3 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider">워크스페이스</div>
      <a href="/app/home" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>홈</a>
      <a href="/app/command-center" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7"/></svg>사령관실</a>
      <a href="/app/chat" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>채팅</a>
      <a href="/app/messenger" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>메신저</a>
      <div className="px-2 pt-3 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider">분석/대시보드</div>
      <a href="/app/dashboard" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>대시보드</a>
      <a href="/app/ops-log" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>작전일지</a>
      <a href="/app/reports" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>보고서</a>
      <a href="/app/performance" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>성과분석</a>
      <div className="px-2 pt-3 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider">AI 전략</div>
      <a href="/app/trading" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>전략실</a>
      <a href="/app/agora" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1M15 11V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2"/></svg>아고라</a>
      <a href="/app/nexus" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>넥서스</a>
      <a href="/app/argos" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>아르고스</a>
      <div className="px-2 pt-3 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider">조직</div>
      <a href="/app/agents" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md bg-zinc-800 text-zinc-50 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>조직</a>
      <a href="/app/departments" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>부서</a>
      <div className="px-2 pt-3 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider">도구</div>
      <a href="/app/sns" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>SNS</a>
      <a href="/app/knowledge" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>지식창고</a>
      <a href="/app/files" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>파일</a>
      <a href="/app/credentials" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>크리덴셜</a>
      <div className="px-2 pt-3 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider">기록</div>
      <a href="/app/jobs" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>작업</a>
      <a href="/app/activity-log" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>활동로그</a>
      <a href="/app/classified" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>기밀문서</a>
      <div className="px-2 pt-3 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider">관리</div>
      <a href="/app/costs" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>비용</a>
      <a href="/app/notifications" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>알림</a>
      <a href="/app/settings" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>설정</a>
    </nav>
    <div className="h-10 border-t border-zinc-800 flex items-center px-3 gap-2 flex-shrink-0">
      <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-medium text-zinc-300 flex-shrink-0">김</div>
      <div className="flex-1 min-w-0"><div className="text-xs font-medium text-zinc-300 truncate">김대표</div></div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
    </div>
  </aside>
  {/* Main content */}
  <main className="ml-60 flex-1 flex flex-col min-h-screen overflow-y-auto">
    <div className="h-12 border-b border-zinc-800 flex items-center px-6 gap-3 sticky top-0 bg-zinc-950/90 backdrop-blur-sm z-10 flex-shrink-0">
      <span className="text-sm font-medium text-zinc-50">조직</span>
      <span className="text-zinc-700">·</span>
      <span className="text-xs text-zinc-500">AI 에이전트 관리</span>
      <div className="ml-auto flex items-center gap-2">
        <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14"/></svg>에이전트 추가</button>
      </div>
    </div>
    <div className="flex-1 p-6">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5">
        <button className="px-3 py-1.5 text-xs font-medium bg-zinc-800 text-zinc-50 rounded-md cursor-pointer">전체 (15)</button>
        <button className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 rounded-md transition-colors cursor-pointer">Manager (3)</button>
        <button className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 rounded-md transition-colors cursor-pointer">Specialist (7)</button>
        <button className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 rounded-md transition-colors cursor-pointer">Worker (5)</button>
        <div className="ml-auto">
          <input className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded-md placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors w-48" placeholder="에이전트 검색..." />
        </div>
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Agent card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7"/></svg>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
          </div>
          <div className="mb-1">
            <div className="text-sm font-semibold text-zinc-50">비서실장</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400">Manager</span>
              <span className="text-xs text-zinc-600">비서실</span>
            </div>
          </div>
          <div className="text-xs font-mono text-zinc-500 mt-2">claude-sonnet-4-6</div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
            <span className="text-xs text-zinc-600">오늘 명령</span>
            <span className="text-xs font-medium text-zinc-300">47건</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7"/></svg>
            </div>
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          </div>
          <div className="mb-1">
            <div className="text-sm font-semibold text-zinc-50">전략분석가</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-400">Specialist</span>
              <span className="text-xs text-zinc-600">전략기획부</span>
            </div>
          </div>
          <div className="text-xs font-mono text-zinc-500 mt-2">claude-haiku-3-5</div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
            <span className="text-xs text-zinc-600">오늘 명령</span>
            <span className="text-xs font-medium text-blue-400">실행중</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7"/></svg>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
          </div>
          <div className="mb-1">
            <div className="text-sm font-semibold text-zinc-50">마케팅봇</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-400">Specialist</span>
              <span className="text-xs text-zinc-600">마케팅부</span>
            </div>
          </div>
          <div className="text-xs font-mono text-zinc-500 mt-2">claude-haiku-3-5</div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
            <span className="text-xs text-zinc-600">오늘 명령</span>
            <span className="text-xs font-medium text-zinc-300">12건</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-zinc-700/50 border border-zinc-700 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7"/></svg>
            </div>
            <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
          </div>
          <div className="mb-1">
            <div className="text-sm font-semibold text-zinc-50">SNS봇</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-500">Worker</span>
              <span className="text-xs text-zinc-600">마케팅부</span>
            </div>
          </div>
          <div className="text-xs font-mono text-zinc-500 mt-2">claude-haiku-3-5</div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
            <span className="text-xs text-zinc-600">오늘 명령</span>
            <span className="text-xs font-medium text-zinc-500">비활성</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7"/></svg>
            </div>
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
          </div>
          <div className="mb-1">
            <div className="text-sm font-semibold text-zinc-50">CIO봇</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400">Manager</span>
              <span className="text-xs text-zinc-600">전략기획부</span>
            </div>
          </div>
          <div className="text-xs font-mono text-zinc-500 mt-2">claude-sonnet-4-6</div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
            <span className="text-xs text-zinc-600">오늘 명령</span>
            <span className="text-xs font-medium text-orange-400">토론중</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7"/></svg>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
          </div>
          <div className="mb-1">
            <div className="text-sm font-semibold text-zinc-50">리서치봇</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-400">Specialist</span>
              <span className="text-xs text-zinc-600">정보분석부</span>
            </div>
          </div>
          <div className="text-xs font-mono text-zinc-500 mt-2">claude-haiku-3-5</div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
            <span className="text-xs text-zinc-600">오늘 명령</span>
            <span className="text-xs font-medium text-zinc-300">23건</span>
          </div>
        </div>
      </div>

      {/* System agents section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-zinc-50">시스템 에이전트</h3>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          <span className="text-xs text-zinc-600">삭제 불가</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4 opacity-60">
            <div className="flex items-center gap-3 mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <span className="text-sm text-zinc-500">품질 게이트 감사관</span>
            </div>
            <div className="text-xs text-zinc-600">자동 품질 검사 · 수정 불가</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4 opacity-60">
            <div className="flex items-center gap-3 mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <span className="text-sm text-zinc-500">보안 감시자</span>
            </div>
            <div className="text-xs text-zinc-600">보안 정책 집행 · 수정 불가</div>
          </div>
        </div>
      </div>
    </div>
  </main>
    </>
  );
}

export default AppAgents;
