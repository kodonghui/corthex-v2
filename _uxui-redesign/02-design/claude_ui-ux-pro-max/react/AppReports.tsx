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

function AppReports() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* API: GET /api/reports, POST /api/reports, GET /api/reports/:id */}
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
      <a href="/app/reports" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md bg-zinc-800 text-zinc-50 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>보고서</a>
      <a href="/app/performance" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>성과분석</a>
      <div className="px-2 pt-3 pb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider">AI 전략</div>
      <a href="/app/trading" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>전략실</a>
      <a href="/app/agora" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1M15 11V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2"/></svg>아고라</a>
      <a href="/app/nexus" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>넥서스</a>
      <a href="/app/argos" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>아르고스</a>
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
      <span className="text-sm font-medium text-zinc-50">보고서</span>
      <span className="text-zinc-700">·</span>
      <span className="text-xs text-zinc-500">AI 생성 리포트 라이브러리</span>
      <div className="ml-auto flex items-center gap-2">
        <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer">보고서 요청</button>
      </div>
    </div>
    <div className="flex-1 p-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-zinc-800">
        <button className="px-4 py-2 text-sm font-medium text-zinc-50 border-b-2 border-blue-500 -mb-px cursor-pointer">전체 (34)</button>
        <button className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 -mb-px cursor-pointer transition-colors">즐겨찾기 (5)</button>
        <button className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 -mb-px cursor-pointer transition-colors">내 보고서 (8)</button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Report grid */}
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Report card (selected) */}
            <div className="bg-blue-500/5 border border-blue-500/30 rounded-lg p-4 cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-400">전략기획부</span>
                <span className="text-xs text-zinc-600">14분 전</span>
              </div>
              <h4 className="text-sm font-semibold text-zinc-50 mb-1">삼성전자 Q1 2026 실적 분석</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">반도체 업사이클 전환 신호. HBM3E 양산 본격화 및 AI 수요 급증에 따른 수익성 개선 전망...</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-500/20">
                <span className="text-xs text-zinc-600">전략분석가 · 12페이지</span>
                <div className="flex items-center gap-2">
                  <button className="text-zinc-500 hover:text-green-400 transition-colors cursor-pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/></svg></button>
                  <button className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v-3a3 3 0 00-3-3H5.28a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H9m5-9v5a3 3 0 003 3l4-9V3H9.72a2 2 0 00-2 1.7L7 9"/></svg></button>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-400">마케팅부</span>
                <span className="text-xs text-zinc-600">32분 전</span>
              </div>
              <h4 className="text-sm font-semibold text-zinc-50 mb-1">주간 마케팅 성과 보고서</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">SNS 3개 채널 합산 도달 +23%. 트위터 인게이지먼트율 4.2% 달성...</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
                <span className="text-xs text-zinc-600">마케팅봇 · 8페이지</span>
                <div className="flex items-center gap-2">
                  <button className="text-zinc-500 hover:text-green-400 transition-colors cursor-pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/></svg></button>
                  <button className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v-3a3 3 0 00-3-3H5.28a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H9m5-9v5a3 3 0 003 3l4-9V3H9.72a2 2 0 00-2 1.7L7 9"/></svg></button>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-400">정보분석부</span>
                <span className="text-xs text-zinc-600">2시간 전</span>
              </div>
              <h4 className="text-sm font-semibold text-zinc-50 mb-1">경쟁사 동향 모니터링 리포트</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">A사 가격 정책 변경 감지. 네이버 쇼핑 점유율 -2.3%p. 대응 전략 시급...</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
                <span className="text-xs text-zinc-600">리서치봇 · 6페이지</span>
                <div className="flex items-center gap-2">
                  <button className="text-zinc-500 hover:text-green-400 transition-colors cursor-pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/></svg></button>
                  <button className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v-3a3 3 0 00-3-3H5.28a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H9m5-9v5a3 3 0 003 3l4-9V3H9.72a2 2 0 00-2 1.7L7 9"/></svg></button>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-400">비서실</span>
                <span className="text-xs text-zinc-600">어제</span>
              </div>
              <h4 className="text-sm font-semibold text-zinc-50 mb-1">일일 시장 브리핑 2026-03-09</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">코스피 +1.2% 상승. 반도체 섹터 강세. 주요 외신 요약 및 오늘의 투자 포인트...</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
                <span className="text-xs text-zinc-600">비서실장 · 4페이지</span>
                <div className="flex items-center gap-2">
                  <button className="text-zinc-500 hover:text-green-400 transition-colors cursor-pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/></svg></button>
                  <button className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v-3a3 3 0 00-3-3H5.28a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H9m5-9v5a3 3 0 003 3l4-9V3H9.72a2 2 0 00-2 1.7L7 9"/></svg></button>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-400">전략기획부</span>
                <span className="text-xs text-zinc-600">3일 전</span>
              </div>
              <h4 className="text-sm font-semibold text-zinc-50 mb-1">포트폴리오 월간 성과 분석</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">모의 포트폴리오 2월 수익률 +5.2%. 삼성전자 기여도 +2.1%p로 최대...</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
                <span className="text-xs text-zinc-600">CIO봇 · 15페이지</span>
                <div className="flex items-center gap-2">
                  <button className="text-zinc-500 hover:text-green-400 transition-colors cursor-pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/></svg></button>
                  <button className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v-3a3 3 0 00-3-3H5.28a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H9m5-9v5a3 3 0 003 3l4-9V3H9.72a2 2 0 00-2 1.7L7 9"/></svg></button>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-400">정보분석부</span>
                <span className="text-xs text-zinc-600">1주일 전</span>
              </div>
              <h4 className="text-sm font-semibold text-zinc-50 mb-1">AI 반도체 시장 심층 분석 2026</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">글로벌 AI 반도체 시장 규모 $847B (2027년 전망). 한국 기업 기회 분석...</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
                <span className="text-xs text-zinc-600">리서치봇 · 28페이지</span>
                <div className="flex items-center gap-2">
                  <button className="text-zinc-500 hover:text-green-400 transition-colors cursor-pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/></svg></button>
                  <button className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v-3a3 3 0 00-3-3H5.28a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H9m5-9v5a3 3 0 003 3l4-9V3H9.72a2 2 0 00-2 1.7L7 9"/></svg></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report preview panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-400">리포트 미리보기</span>
              <button className="ml-auto text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">다운로드</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-zinc-50 mb-1">삼성전자 Q1 2026 실적 분석</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-zinc-600">전략분석가 · 2026-03-10 14:14</span>
            </div>
            <div className="space-y-3 text-xs text-zinc-400 leading-relaxed">
              <p><strong className="text-zinc-300">핵심 요약</strong></p>
              <p>삼성전자 Q1 2026 영업이익 4.6조원으로 전분기 대비 +34% 증가. 시장 컨센서스(4.1조원)를 12% 상회하는 어닝 서프라이즈.</p>
              <p><strong className="text-zinc-300">사업부별 성과</strong></p>
              <p>· 반도체(DS): 3.2조원 (+47% QoQ) — HBM3E 수주 급증<br/>· 모바일(MX): 1.1조원 (+8% QoQ) — Galaxy S26 효과<br/>· 디스플레이(SDC): 0.5조원 (+2% QoQ)</p>
              <p><strong className="text-zinc-300">투자 의견</strong></p>
              <p>목표주가 87,000원 (현재가 대비 +10% 업사이드). 매수 권고. 리스크: 미중 반도체 규제 강화, 환율 변동.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
    </>
  );
}

export default AppReports;
