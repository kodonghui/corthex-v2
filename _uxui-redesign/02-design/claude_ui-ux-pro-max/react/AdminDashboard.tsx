"use client";
import React from "react";

const styles = `body { font-family: "Inter", system-ui, sans-serif; background: #09090b; color: #fafafa; }
    .font-mono { font-family: "JetBrains Mono", monospace; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 2px; }
    @media (prefers-reduced-motion: reduce) { * { transition-duration: 1ms !important; animation-duration: 1ms !important; } }`;

function AdminDashboard() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      {/* GET /api/admin/dashboard — returns kpi, events, department_distribution */}
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
      <a href="/admin/dashboard" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md bg-zinc-800 text-zinc-50 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>대시보드</a>
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
      <a href="/admin/users" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>사용자</a>
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
      <span className="text-sm font-medium text-zinc-50">관리자 대시보드</span>
      <span className="text-zinc-700">·</span>
      <span className="text-xs text-zinc-500">시스템 전체 현황</span>
      <div className="ml-auto flex items-center gap-2">
        <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md">보고서 내보내기</button>
      </div>
    </div>
    <div className="flex-1 p-6">

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-xs text-zinc-500 mb-1">활성 에이전트</div>
          <div className="text-2xl font-semibold font-mono">42</div>
          <div className="text-xs text-green-400 mt-1">▲ 3 (이번 주)</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-xs text-zinc-500 mb-1">활성 부서</div>
          <div className="text-2xl font-semibold font-mono">12</div>
          <div className="text-xs text-zinc-500 mt-1">전략실 포함</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-xs text-zinc-500 mb-1">오늘 CLI 토큰 사용</div>
          <div className="text-2xl font-semibold font-mono">₩847K</div>
          <div className="text-xs text-yellow-400 mt-1">월 한도 67% 소진</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-xs text-zinc-500 mb-1">시스템 가동률</div>
          <div className="text-2xl font-semibold font-mono">99.7%</div>
          <div className="text-xs text-green-400 mt-1">SLA 정상</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-sm font-medium mb-4">일별 CLI 토큰 사용량 (최근 14일)</div>
          <div className="h-40 flex items-end gap-1.5">
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-blue-500/30 rounded-sm" style={{"height":"55%"}}></div>
              <span className="text-xs text-zinc-600">2/25</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-blue-500/30 rounded-sm" style={{"height":"72%"}}></div>
              <span className="text-xs text-zinc-600">2/26</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-blue-500/30 rounded-sm" style={{"height":"48%"}}></div>
              <span className="text-xs text-zinc-600">2/27</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-blue-500/30 rounded-sm" style={{"height":"88%"}}></div>
              <span className="text-xs text-zinc-600">2/28</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-blue-500/30 rounded-sm" style={{"height":"63%"}}></div>
              <span className="text-xs text-zinc-600">3/1</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-blue-500/30 rounded-sm" style={{"height":"45%"}}></div>
              <span className="text-xs text-zinc-600">3/2</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-blue-500/30 rounded-sm" style={{"height":"39%"}}></div>
              <span className="text-xs text-zinc-600">3/3</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-blue-500/50 rounded-sm" style={{"height":"75%"}}></div>
              <span className="text-xs text-zinc-600">3/4</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-blue-500/50 rounded-sm" style={{"height":"82%"}}></div>
              <span className="text-xs text-zinc-600">3/5</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-blue-500/50 rounded-sm" style={{"height":"91%"}}></div>
              <span className="text-xs text-zinc-600">3/6</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-blue-500/50 rounded-sm" style={{"height":"67%"}}></div>
              <span className="text-xs text-zinc-600">3/7</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-blue-500/50 rounded-sm" style={{"height":"58%"}}></div>
              <span className="text-xs text-zinc-600">3/8</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-blue-500/50 rounded-sm" style={{"height":"74%"}}></div>
              <span className="text-xs text-zinc-600">3/9</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-blue-500 rounded-sm" style={{"height":"84%"}}></div>
              <span className="text-xs text-zinc-500 font-semibold">3/10</span>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-sm font-medium mb-4">부서별 에이전트 분포</div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-0.5"><span className="text-zinc-400">AI 전략실</span><span className="text-zinc-500">14</span></div>
              <div className="h-1.5 bg-zinc-800 rounded-full"><div className="h-1.5 bg-blue-500 rounded-full" style={{"width":"33%"}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-0.5"><span className="text-zinc-400">리서치팀</span><span className="text-zinc-500">8</span></div>
              <div className="h-1.5 bg-zinc-800 rounded-full"><div className="h-1.5 bg-purple-500 rounded-full" style={{"width":"19%"}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-0.5"><span className="text-zinc-400">운영팀</span><span className="text-zinc-500">7</span></div>
              <div className="h-1.5 bg-zinc-800 rounded-full"><div className="h-1.5 bg-green-500 rounded-full" style={{"width":"17%"}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-0.5"><span className="text-zinc-400">보안팀</span><span className="text-zinc-500">6</span></div>
              <div className="h-1.5 bg-zinc-800 rounded-full"><div className="h-1.5 bg-yellow-500 rounded-full" style={{"width":"14%"}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-0.5"><span className="text-zinc-400">기타</span><span className="text-zinc-500">7</span></div>
              <div className="h-1.5 bg-zinc-800 rounded-full"><div className="h-1.5 bg-zinc-600 rounded-full" style={{"width":"17%"}}></div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent events */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-sm font-medium">최근 이벤트</span>
          <button className="text-xs text-blue-400 hover:text-blue-300">전체 보기</button>
        </div>
        <div className="divide-y divide-zinc-800">
          <div className="px-4 py-3 flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
            <div className="flex-1"><span className="text-sm text-zinc-300">에이전트 <span className="font-mono text-blue-400">AGT-047</span> 생성 완료</span></div>
            <span className="text-xs text-zinc-600 font-mono">14:22</span>
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0"></span>
            <div className="flex-1"><span className="text-sm text-zinc-300">부서 <span className="text-zinc-100">보안팀</span> CLI 토큰 한도 80% 초과</span></div>
            <span className="text-xs text-zinc-600 font-mono">13:47</span>
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
            <div className="flex-1"><span className="text-sm text-zinc-300">온보딩 완료: <span className="text-zinc-100">이수현</span> (리서치팀)</span></div>
            <span className="text-xs text-zinc-600 font-mono">12:05</span>
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
            <div className="flex-1"><span className="text-sm text-zinc-300">크리덴셜 <span className="font-mono text-red-400">CRED-KIS-003</span> 만료 임박 (D-3)</span></div>
            <span className="text-xs text-zinc-600 font-mono">11:30</span>
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
            <div className="flex-1"><span className="text-sm text-zinc-300">Soul 템플릿 <span className="text-zinc-100">퀀트 전략가 v3</span> 승인 완료</span></div>
            <span className="text-xs text-zinc-600 font-mono">10:14</span>
          </div>
        </div>
      </div>

    </div>
  </main>
    </>
  );
}

export default AdminDashboard;
