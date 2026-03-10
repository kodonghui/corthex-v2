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

function AdminOnboarding() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* GET /api/admin/onboarding — returns onboarding list with progress, steps completed */}
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
      <a href="/admin/users" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>사용자</a>
      <a href="/admin/workflows" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-150 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>워크플로우</a>
      <a href="/admin/onboarding" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md bg-zinc-800 text-zinc-50 cursor-pointer text-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>온보딩</a>
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
      <span className="text-sm font-medium text-zinc-50">온보딩 관리</span>
      <span className="text-zinc-700">·</span>
      <span className="text-xs text-zinc-500">신규 직원 온보딩</span>
      <div className="ml-auto flex items-center gap-2">
        <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md">+ 온보딩 시작</button>
      </div>
    </div>
    <div className="flex-1 p-6">

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-xs text-zinc-500 mb-1">진행중 온보딩</div>
          <div className="text-2xl font-semibold font-mono">3</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-xs text-zinc-500 mb-1">이번 달 완료</div>
          <div className="text-2xl font-semibold font-mono text-green-400">7</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-xs text-zinc-500 mb-1">평균 완료 기간</div>
          <div className="text-2xl font-semibold font-mono">2.3일</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-sm font-medium">진행중 온보딩</span>
            <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded-md">+ 온보딩 시작</button>
          </div>
          <div className="divide-y divide-zinc-800">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium">이</div>
                  <span className="text-sm font-medium text-zinc-200">이수현</span>
                  <span className="text-xs text-zinc-500">리서치팀</span>
                </div>
                <span className="text-xs text-zinc-500 font-mono">D+1</span>
              </div>
              <div className="space-y-1.5 ml-9">
                <div className="flex items-center gap-2 text-xs">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  <span className="text-zinc-400">계정 생성 · 이메일 인증</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  <span className="text-zinc-400">부서 배치 완료</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full border border-blue-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  </div>
                  <span className="text-blue-400 font-medium">Claude CLI 토큰 등록</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full border border-zinc-700 flex-shrink-0"></div>
                  <span className="text-zinc-600">첫 에이전트 생성</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full border border-zinc-700 flex-shrink-0"></div>
                  <span className="text-zinc-600">온보딩 완료 확인</span>
                </div>
              </div>
              <div className="mt-3 h-1.5 bg-zinc-800 rounded-full ml-9">
                <div className="h-1.5 bg-blue-500 rounded-full" style={{width: "50%"}}></div>
              </div>
            </div>

            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-xs text-white font-medium">한</div>
                  <span className="text-sm font-medium text-zinc-200">한지원</span>
                  <span className="text-xs text-zinc-500">개발팀</span>
                </div>
                <span className="text-xs text-zinc-500 font-mono">D+0</span>
              </div>
              <div className="mt-2 ml-9 h-1.5 bg-zinc-800 rounded-full">
                <div className="h-1.5 bg-orange-500 rounded-full" style={{width: "20%"}}></div>
              </div>
              <div className="text-xs text-zinc-600 mt-1 ml-9">1/5 단계 완료</div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-sm font-medium mb-4">온보딩 체크리스트 설정</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-md">
              <div>
                <div className="text-sm text-zinc-300">계정 생성 · 이메일 인증</div>
                <div className="text-xs text-zinc-600">자동 발송</div>
              </div>
              <div className="w-8 h-4 bg-blue-600 rounded-full flex items-center relative">
                <div className="w-3 h-3 bg-white rounded-full absolute right-0.5"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-md">
              <div>
                <div className="text-sm text-zinc-300">부서 배치 확인</div>
                <div className="text-xs text-zinc-600">관리자 수동 확인</div>
              </div>
              <div className="w-8 h-4 bg-blue-600 rounded-full flex items-center relative">
                <div className="w-3 h-3 bg-white rounded-full absolute right-0.5"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-md">
              <div>
                <div className="text-sm text-zinc-300">Claude CLI 토큰 등록</div>
                <div className="text-xs text-zinc-600">직원 직접 등록 후 관리자 승인</div>
              </div>
              <div className="w-8 h-4 bg-blue-600 rounded-full flex items-center relative">
                <div className="w-3 h-3 bg-white rounded-full absolute right-0.5"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-md">
              <div>
                <div className="text-sm text-zinc-300">첫 에이전트 생성</div>
                <div className="text-xs text-zinc-600">Soul 템플릿 기반</div>
              </div>
              <div className="w-8 h-4 bg-zinc-700 rounded-full flex items-center relative">
                <div className="w-3 h-3 bg-zinc-400 rounded-full absolute left-0.5"></div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <div className="text-xs text-zinc-500 mb-2">환영 이메일 템플릿</div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-md p-3 font-mono text-xs text-zinc-500">
              제목: CORTHEX AI에 오신 것을 환영합니다<br/>
              <br/>
              안녕하세요 {"{name}"}님,<br/>
              {"{department}"}에 배치되셨습니다.<br/>
              아래 링크로 온보딩을 시작하세요.
            </div>
          </div>
        </div>
      </div>

    </div>
  </main>
    </>
  );
}

export default AdminOnboarding;
