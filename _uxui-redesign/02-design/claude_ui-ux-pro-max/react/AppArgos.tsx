"use client";
import React from "react";

const styles = `body { font-family: "Inter", system-ui, sans-serif; background: #09090b; color: #fafafa; }
    .font-mono { font-family: "JetBrains Mono", monospace; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 2px; }
    @media (prefers-reduced-motion: reduce) { * { transition-duration: 1ms !important; animation-duration: 1ms !important; } }`;

function AppArgos() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      {/* API: GET /api/argos/monitors, GET /api/argos/alerts, POST /api/argos/rules */}
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
      <a href="/app/argos" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md bg-zinc-800 text-zinc-50 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>아르고스</a>
      <div className="px-2 pt-3 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider">조직</div>
      <a href="/app/agents" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>조직</a>
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
      <span className="text-sm font-medium text-zinc-50">아르고스</span>
      <span className="text-zinc-700">·</span>
      <span className="text-xs text-zinc-500">실시간 시장 & 경쟁 모니터링</span>
      <div className="ml-auto flex items-center gap-2">
        <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer">+ 새 감시 항목</button>
      </div>
    </div>
    <div className="flex-1 p-6">
      {/* Grid of 4 monitoring panels */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 뉴스 모니터 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
              <h3 className="text-sm font-semibold text-zinc-50">뉴스 모니터</h3>
            </div>
            <span className="text-xs text-zinc-600 font-mono">실시간</span>
          </div>
          <div className="divide-y divide-zinc-800/50">
            <div className="px-4 py-2.5 hover:bg-zinc-800/20 cursor-pointer transition-colors">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></span>
                <div>
                  <p className="text-xs text-zinc-300">삼성전자, HBM4 양산 일정 3개월 앞당겨</p>
                  <span className="text-xs text-zinc-600">뉴스1 · 3분 전</span>
                </div>
              </div>
            </div>
            <div className="px-4 py-2.5 hover:bg-zinc-800/20 cursor-pointer transition-colors">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0"></span>
                <div>
                  <p className="text-xs text-zinc-300">미 연준, 금리 동결 결정 — 시장 반응 주시</p>
                  <span className="text-xs text-zinc-600">Bloomberg · 12분 전</span>
                </div>
              </div>
            </div>
            <div className="px-4 py-2.5 hover:bg-zinc-800/20 cursor-pointer transition-colors">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-1.5 flex-shrink-0"></span>
                <div>
                  <p className="text-xs text-zinc-300">코스피 2,750선 회복 — 반도체 강세</p>
                  <span className="text-xs text-zinc-600">한국경제 · 25분 전</span>
                </div>
              </div>
            </div>
            <div className="px-4 py-2.5 hover:bg-zinc-800/20 cursor-pointer transition-colors">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-1.5 flex-shrink-0"></span>
                <div>
                  <p className="text-xs text-zinc-300">AI 스타트업 투자, 작년 대비 +340% 급증</p>
                  <span className="text-xs text-zinc-600">Tech Crunch · 1시간 전</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 소셜 트렌드 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
              <h3 className="text-sm font-semibold text-zinc-50">소셜 트렌드</h3>
            </div>
            <span className="text-xs text-zinc-600 font-mono">실시간</span>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-500 w-4">1</span>
              <div className="flex-1">
                <span className="text-xs font-medium text-zinc-300">#삼성전자</span>
                <div className="h-1 bg-zinc-800 rounded-full mt-1"><div className="h-1 bg-blue-500 rounded-full" style={{"width":"90%"}}></div></div>
              </div>
              <span className="text-xs text-green-400 font-mono">+1,240</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-500 w-4">2</span>
              <div className="flex-1">
                <span className="text-xs font-medium text-zinc-300">#AI투자</span>
                <div className="h-1 bg-zinc-800 rounded-full mt-1"><div className="h-1 bg-purple-500 rounded-full" style={{"width":"75%"}}></div></div>
              </div>
              <span className="text-xs text-green-400 font-mono">+892</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-500 w-4">3</span>
              <div className="flex-1">
                <span className="text-xs font-medium text-zinc-300">#반도체</span>
                <div className="h-1 bg-zinc-800 rounded-full mt-1"><div className="h-1 bg-orange-500 rounded-full" style={{"width":"68%"}}></div></div>
              </div>
              <span className="text-xs text-green-400 font-mono">+734</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-500 w-4">4</span>
              <div className="flex-1">
                <span className="text-xs font-medium text-zinc-300">#연준금리</span>
                <div className="h-1 bg-zinc-800 rounded-full mt-1"><div className="h-1 bg-yellow-500 rounded-full" style={{"width":"55%"}}></div></div>
              </div>
              <span className="text-xs text-green-400 font-mono">+521</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-500 w-4">5</span>
              <div className="flex-1">
                <span className="text-xs font-medium text-zinc-300">#HBM</span>
                <div className="h-1 bg-zinc-800 rounded-full mt-1"><div className="h-1 bg-green-500 rounded-full" style={{"width":"40%"}}></div></div>
              </div>
              <span className="text-xs text-green-400 font-mono">+380</span>
            </div>
          </div>
        </div>

        {/* 경쟁사 동향 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
              <h3 className="text-sm font-semibold text-zinc-50">경쟁사 동향</h3>
            </div>
            <span className="text-xs text-zinc-600">3개사 모니터링</span>
          </div>
          <div className="divide-y divide-zinc-800/50">
            <div className="px-4 py-2.5 hover:bg-zinc-800/20 cursor-pointer transition-colors">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-red-400">⚡ A사</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/10 text-red-400">가격 변동</span>
              </div>
              <p className="text-xs text-zinc-400">프리미엄 플랜 가격 15% 인상 감지 — 1시간 전</p>
            </div>
            <div className="px-4 py-2.5 hover:bg-zinc-800/20 cursor-pointer transition-colors">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-yellow-400">B사</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/10 text-yellow-400">신기능</span>
              </div>
              <p className="text-xs text-zinc-400">AI 에이전트 협업 기능 베타 출시 — 3시간 전</p>
            </div>
            <div className="px-4 py-2.5 hover:bg-zinc-800/20 cursor-pointer transition-colors">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-zinc-400">C사</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-500">일반</span>
              </div>
              <p className="text-xs text-zinc-400">CEO 인터뷰: "2026년 B2B AI 공략 선언" — 어제</p>
            </div>
          </div>
        </div>

        {/* 시장 지표 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
              <h3 className="text-sm font-semibold text-zinc-50">시장 지표</h3>
            </div>
            <span className="text-xs text-zinc-600 font-mono">14:32 기준</span>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <div className="bg-zinc-800 rounded-lg p-3">
              <div className="text-xs text-zinc-500 mb-1">코스피</div>
              <div className="text-sm font-semibold font-mono text-green-400">2,751.82</div>
              <div className="text-xs text-green-400">+1.24%</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-3">
              <div className="text-xs text-zinc-500 mb-1">코스닥</div>
              <div className="text-sm font-semibold font-mono text-green-400">832.15</div>
              <div className="text-xs text-green-400">+0.87%</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-3">
              <div className="text-xs text-zinc-500 mb-1">달러/원</div>
              <div className="text-sm font-semibold font-mono text-zinc-300">1,338.40</div>
              <div className="text-xs text-red-400">-0.32%</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-3">
              <div className="text-xs text-zinc-500 mb-1">삼성전자</div>
              <div className="text-sm font-semibold font-mono text-green-400">79,400원</div>
              <div className="text-xs text-green-400">+2.1%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert rules */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-50">알림 규칙</h3>
          <button className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">+ 규칙 추가</button>
        </div>
        <div className="divide-y divide-zinc-800/50">
          <div className="flex items-center gap-4 px-4 py-2.5">
            <div className="w-6 h-3 bg-green-500 rounded-full flex items-center justify-end px-0.5 cursor-pointer"><div className="w-2.5 h-2.5 bg-white rounded-full"></div></div>
            <span className="text-xs text-zinc-300">삼성전자 주가 5% 이상 변동 시 CIO봇에게 즉시 보고</span>
          </div>
          <div className="flex items-center gap-4 px-4 py-2.5">
            <div className="w-6 h-3 bg-green-500 rounded-full flex items-center justify-end px-0.5 cursor-pointer"><div className="w-2.5 h-2.5 bg-white rounded-full"></div></div>
            <span className="text-xs text-zinc-300">경쟁사 가격 변동 감지 시 알림</span>
          </div>
          <div className="flex items-center gap-4 px-4 py-2.5">
            <div className="w-6 h-3 bg-zinc-600 rounded-full flex items-center px-0.5 cursor-pointer"><div className="w-2.5 h-2.5 bg-white rounded-full"></div></div>
            <span className="text-xs text-zinc-500">RSS 키워드: "AI 에이전트", "B2B SaaS" 포함 기사 수집</span>
          </div>
        </div>
      </div>
    </div>
  </main>
    </>
  );
}

export default AppArgos;
