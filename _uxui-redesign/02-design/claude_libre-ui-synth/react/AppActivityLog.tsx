"use client";
import React from "react";
import { Activity, BarChart2, Bell, BookOpen, Bot, Briefcase, Building2, Cpu, CreditCard, Download, Eye, FileText, Filter, Folder, Home, Key, LayoutDashboard, List, MessageCircle, RefreshCw, Rss, Search, Send, Settings, Share2, Shield, Terminal, TrendingUp, Users } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #fafaf9; }
    ::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 3px; }
`;

function AppActivityLog() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* SIDEBAR */}
<aside className="w-60 fixed left-0 top-0 bottom-0 bg-white border-r border-stone-200 flex flex-col z-20">
  <div className="p-4 border-b border-stone-200">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">C</span></div>
      <span className="font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
    </div>
  </div>
  <div className="px-4 py-3 border-b border-stone-200">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center"><span className="text-violet-700 text-xs font-semibold">김</span></div>
      <div><div className="text-xs font-semibold text-stone-900">김대표</div><div className="text-[10px] text-stone-400">Owner</div></div>
    </div>
  </div>
  <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400">메인</p>
    <a href="/app/home" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Home className="w-4 h-4" />홈</a>
    <a href="/app/dashboard" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><LayoutDashboard className="w-4 h-4" />대시보드</a>
    <a href="/app/command-center" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Terminal className="w-4 h-4" />커맨드 센터</a>
    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-2">조직</p>
    <a href="/app/agents" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Bot className="w-4 h-4" />AI 에이전트</a>
    <a href="/app/departments" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Building2 className="w-4 h-4" />부서</a>
    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-2">커뮤니케이션</p>
    <a href="/app/chat" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><MessageCircle className="w-4 h-4" />채팅</a>
    <a href="/app/agora" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Users className="w-4 h-4" />아고라</a>
    <a href="/app/messenger" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Send className="w-4 h-4" />메신저</a>
    <a href="/app/notifications" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Bell className="w-4 h-4" />알림</a>
    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-2">업무</p>
    <a href="/app/jobs" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Briefcase className="w-4 h-4" />잡(Jobs)</a>
    <a href="/app/nexus" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Share2 className="w-4 h-4" />넥서스</a>
    <a href="/app/sns" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Rss className="w-4 h-4" />SNS 관리</a>
    <a href="/app/trading" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><TrendingUp className="w-4 h-4" />트레이딩</a>
    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-2">지식·파일</p>
    <a href="/app/knowledge" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><BookOpen className="w-4 h-4" />지식베이스</a>
    <a href="/app/files" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Folder className="w-4 h-4" />파일</a>
    <a href="/app/classified" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Shield className="w-4 h-4" />기밀문서</a>
    <a href="/app/reports" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><FileText className="w-4 h-4" />보고서</a>
    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-2">분석·특수</p>
    <a href="/app/performance" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><BarChart2 className="w-4 h-4" />전력분석</a>
    <a href="/app/costs" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><CreditCard className="w-4 h-4" />비용 관리</a>
    <a href="/app/activity-log" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-violet-50 text-violet-700 text-sm font-medium"><Activity className="w-4 h-4" />활동 로그</a>
    <a href="/app/argos" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Eye className="w-4 h-4" />아르고스</a>
    <a href="/app/credentials" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Key className="w-4 h-4" />크리덴셜</a>
    <a href="/app/ops-log" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><List className="w-4 h-4" />운영 로그</a>
    <a href="/app/settings" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm mt-2"><Settings className="w-4 h-4" />설정</a>
  </nav>
</aside>

{/* MAIN */}
<main className="ml-60 flex-1 p-6 min-h-screen">
  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-xl font-bold text-stone-900">활동 로그</h1>
      <p className="text-sm text-stone-500 mt-0.5">에이전트 전체 활동 실시간 기록 — API: GET /api/workspace/activity-log</p>
    </div>
    <div className="flex items-center gap-2">
      <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-stone-50 transition-all duration-150">
        <Download className="w-4 h-4" />내보내기
      </button>
      <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-stone-50 transition-all duration-150">
        <RefreshCw className="w-4 h-4" />새로고침
      </button>
    </div>
  </div>

  {/* Filters */}
  <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 mb-5">
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5">
        <Filter className="w-4 h-4 text-stone-400" />
        <span className="text-sm font-medium text-stone-700">필터</span>
      </div>
      <select className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-stone-700 bg-white">
        <option>유형: 전체</option>
        <option>채팅 (chat)</option>
        <option>위임 (delegation)</option>
        <option>도구 호출 (tool_call)</option>
        <option>SNS (sns)</option>
        <option>잡 (job)</option>
        <option>에러 (error)</option>
        <option>시스템 (system)</option>
      </select>
      <input type="date" value="2026-03-10" className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-stone-700" />
      <select className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-stone-700 bg-white">
        <option>에이전트: 전체</option>
        <option>이나경</option>
        <option>김재원</option>
        <option>박준형</option>
        <option>최민지</option>
        <option>이소연</option>
      </select>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="내용 검색..." className="rounded-lg border border-stone-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-48" />
        </div>
      </div>
    </div>
  </div>

  {/* Log Table */}
  <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
    <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-stone-900">오늘 로그</span>
        <span className="bg-violet-50 text-violet-700 rounded-full px-2.5 py-0.5 text-xs font-medium">15건</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-stone-400">
        <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
        실시간 스트리밍 중
      </div>
    </div>
    <table className="w-full">
      <thead>
        <tr className="bg-stone-50 border-b border-stone-100">
          <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500 w-20">시간</th>
          <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500 w-28">유형</th>
          <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500 w-28">에이전트</th>
          <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">내용</th>
          <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500 w-20">결과</th>
        </tr>
      </thead>
      <tbody>
        {/* Row 1 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-4 py-3 text-sm text-stone-500" style={{fontFamily: "'JetBrains Mono',monospace"}}>11:34</td>
          <td className="px-4 py-3"><span className="bg-violet-50 text-violet-700 rounded-full px-2.5 py-0.5 text-xs font-medium">chat</span></td>
          <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[9px] font-semibold text-emerald-700">이</span></div><span className="text-sm text-stone-700">이나경</span></div></td>
          <td className="px-4 py-3 text-sm text-stone-800">CEO와 마케팅 미팅 준비 대화 (Q1 전략 리뷰)</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">완료</span></td>
        </tr>
        {/* Row 2 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-4 py-3 text-sm text-stone-500" style={{fontFamily: "'JetBrains Mono',monospace"}}>11:32</td>
          <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-medium">delegation</span></td>
          <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[9px] font-semibold text-emerald-700">이</span></div><span className="text-sm text-stone-700">이나경 → 박준형</span></div></td>
          <td className="px-4 py-3 text-sm text-stone-800">Q2 콘텐츠 기획 업무 위임 (마케팅부서)</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">완료</span></td>
        </tr>
        {/* Row 3 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-4 py-3 text-sm text-stone-500" style={{fontFamily: "'JetBrains Mono',monospace"}}>11:28</td>
          <td className="px-4 py-3"><span className="bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5 text-xs font-medium">tool_call</span></td>
          <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[9px] font-semibold text-blue-700">박</span></div><span className="text-sm text-stone-700">박준형</span></div></td>
          <td className="px-4 py-3 text-sm text-stone-800"><code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">web_search("2025 마케팅 트렌드")</code> — 상위 12개 결과 수집</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">성공</span></td>
        </tr>
        {/* Row 4 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-4 py-3 text-sm text-stone-500" style={{fontFamily: "'JetBrains Mono',monospace"}}>11:25</td>
          <td className="px-4 py-3"><span className="bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5 text-xs font-medium">tool_call</span></td>
          <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[9px] font-semibold text-blue-700">박</span></div><span className="text-sm text-stone-700">박준형</span></div></td>
          <td className="px-4 py-3 text-sm text-stone-800"><code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">generate_image("봄 캠페인 비주얼")</code> — 4장 생성</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">성공</span></td>
        </tr>
        {/* Row 5 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors bg-red-50/30">
          <td className="px-4 py-3 text-sm text-stone-500" style={{fontFamily: "'JetBrains Mono',monospace"}}>11:20</td>
          <td className="px-4 py-3"><span className="bg-purple-50 text-purple-700 rounded-full px-2.5 py-0.5 text-xs font-medium">sns</span></td>
          <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[9px] font-semibold text-amber-700">최</span></div><span className="text-sm text-stone-700">최민지</span></div></td>
          <td className="px-4 py-3 text-sm text-stone-800">인스타그램 포스트 발행 시도 (봄 시즌 캠페인)</td>
          <td className="px-4 py-3 text-center"><span className="bg-red-50 text-red-700 rounded-full px-2 py-0.5 text-xs font-medium">실패</span></td>
        </tr>
        {/* Row 6 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors bg-red-50/30">
          <td className="px-4 py-3 text-sm text-stone-500" style={{fontFamily: "'JetBrains Mono',monospace"}}>11:15</td>
          <td className="px-4 py-3"><span className="bg-red-50 text-red-700 rounded-full px-2.5 py-0.5 text-xs font-medium">error</span></td>
          <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[9px] font-semibold text-amber-700">최</span></div><span className="text-sm text-stone-700">최민지</span></div></td>
          <td className="px-4 py-3 text-sm text-stone-800">
            <span className="text-red-700">Instagram API 토큰 만료</span>
            <code className="text-xs bg-red-50 border border-red-100 px-1.5 py-0.5 rounded text-red-600 ml-1">OAuthException 401</code>
          </td>
          <td className="px-4 py-3 text-center"><span className="bg-red-50 text-red-700 rounded-full px-2 py-0.5 text-xs font-medium">에러</span></td>
        </tr>
        {/* Row 7 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-4 py-3 text-sm text-stone-500" style={{fontFamily: "'JetBrains Mono',monospace"}}>11:10</td>
          <td className="px-4 py-3"><span className="bg-stone-100 text-stone-600 rounded-full px-2.5 py-0.5 text-xs font-medium">job</span></td>
          <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[9px] font-semibold text-violet-700">김</span></div><span className="text-sm text-stone-700">김재원</span></div></td>
          <td className="px-4 py-3 text-sm text-stone-800">매시간 뉴스 모니터링 크론 실행 — 삼성전자 관련 43건 수집</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">완료</span></td>
        </tr>
        {/* Row 8 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-4 py-3 text-sm text-stone-500" style={{fontFamily: "'JetBrains Mono',monospace"}}>11:05</td>
          <td className="px-4 py-3"><span className="bg-stone-100 text-stone-600 rounded-full px-2.5 py-0.5 text-xs font-medium">system</span></td>
          <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-stone-200 rounded-full flex items-center justify-center flex-shrink-0"><Cpu className="w-2.5 h-2.5 text-stone-500" /></div><span className="text-sm text-stone-700">시스템</span></div></td>
          <td className="px-4 py-3 text-sm text-stone-800">배치 API 처리 완료 — 총 45건 처리 (소요: 2.3초)</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">완료</span></td>
        </tr>
        {/* Row 9 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-4 py-3 text-sm text-stone-500" style={{fontFamily: "'JetBrains Mono',monospace"}}>10:58</td>
          <td className="px-4 py-3"><span className="bg-violet-50 text-violet-700 rounded-full px-2.5 py-0.5 text-xs font-medium">chat</span></td>
          <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[9px] font-semibold text-violet-700">김</span></div><span className="text-sm text-stone-700">김재원</span></div></td>
          <td className="px-4 py-3 text-sm text-stone-800">삼성전자 5% 급등 알림 보고서 작성 — 3페이지 리포트</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">완료</span></td>
        </tr>
        {/* Row 10 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-4 py-3 text-sm text-stone-500" style={{fontFamily: "'JetBrains Mono',monospace"}}>10:45</td>
          <td className="px-4 py-3"><span className="bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5 text-xs font-medium">tool_call</span></td>
          <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[9px] font-semibold text-rose-700">이</span></div><span className="text-sm text-stone-700">이소연</span></div></td>
          <td className="px-4 py-3 text-sm text-stone-800"><code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">search_law_db("자본시장법 개정안 2026")</code></td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">성공</span></td>
        </tr>
        {/* Row 11 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-4 py-3 text-sm text-stone-500" style={{fontFamily: "'JetBrains Mono',monospace"}}>10:30</td>
          <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-medium">delegation</span></td>
          <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[9px] font-semibold text-emerald-700">이</span></div><span className="text-sm text-stone-700">이나경 → 이소연</span></div></td>
          <td className="px-4 py-3 text-sm text-stone-800">신규 계약서 법무 검토 요청 위임</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">완료</span></td>
        </tr>
        {/* Row 12 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-4 py-3 text-sm text-stone-500" style={{fontFamily: "'JetBrains Mono',monospace"}}>10:15</td>
          <td className="px-4 py-3"><span className="bg-stone-100 text-stone-600 rounded-full px-2.5 py-0.5 text-xs font-medium">job</span></td>
          <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[9px] font-semibold text-emerald-700">이</span></div><span className="text-sm text-stone-700">이나경</span></div></td>
          <td className="px-4 py-3 text-sm text-stone-800">실시간 뉴스 분석 트리거 발동 — "AI" 키워드 22건 감지</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">완료</span></td>
        </tr>
        {/* Row 13 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-4 py-3 text-sm text-stone-500" style={{fontFamily: "'JetBrains Mono',monospace"}}>10:00</td>
          <td className="px-4 py-3"><span className="bg-stone-100 text-stone-600 rounded-full px-2.5 py-0.5 text-xs font-medium">job</span></td>
          <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[9px] font-semibold text-violet-700">김</span></div><span className="text-sm text-stone-700">김재원</span></div></td>
          <td className="px-4 py-3 text-sm text-stone-800">매시간 시황 체크 크론 실행 — KOSPI +0.8% 기록</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">완료</span></td>
        </tr>
        {/* Row 14 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-4 py-3 text-sm text-stone-500" style={{fontFamily: "'JetBrains Mono',monospace"}}>09:45</td>
          <td className="px-4 py-3"><span className="bg-purple-50 text-purple-700 rounded-full px-2.5 py-0.5 text-xs font-medium">sns</span></td>
          <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[9px] font-semibold text-amber-700">최</span></div><span className="text-sm text-stone-700">최민지</span></div></td>
          <td className="px-4 py-3 text-sm text-stone-800">네이버 블로그 포스트 발행 성공 — 조회수 128</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">완료</span></td>
        </tr>
        {/* Row 15 */}
        <tr className="hover:bg-stone-50/50 transition-colors">
          <td className="px-4 py-3 text-sm text-stone-500" style={{fontFamily: "'JetBrains Mono',monospace"}}>09:23</td>
          <td className="px-4 py-3"><span className="bg-stone-100 text-stone-600 rounded-full px-2.5 py-0.5 text-xs font-medium">system</span></td>
          <td className="px-4 py-3"><div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-stone-200 rounded-full flex items-center justify-center flex-shrink-0"><Cpu className="w-2.5 h-2.5 text-stone-500" /></div><span className="text-sm text-stone-700">시스템</span></div></td>
          <td className="px-4 py-3 text-sm text-stone-800">삼성전자 +5.2% 가격 트리거 발동 → 김재원 에이전트 알림 전송</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">완료</span></td>
        </tr>
      </tbody>
    </table>
    {/* Pagination */}
    <div className="px-5 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/50 rounded-b-xl">
      <span className="text-xs text-stone-400">총 248건 · 오늘 15건 표시</span>
      <div className="flex items-center gap-1">
        <button className="px-3 py-1.5 text-xs border border-stone-200 rounded-md text-stone-500 hover:bg-stone-50">이전</button>
        <button className="px-3 py-1.5 text-xs bg-violet-600 text-white rounded-md font-medium">1</button>
        <button className="px-3 py-1.5 text-xs border border-stone-200 rounded-md text-stone-500 hover:bg-stone-50">2</button>
        <button className="px-3 py-1.5 text-xs border border-stone-200 rounded-md text-stone-500 hover:bg-stone-50">3</button>
        <button className="px-3 py-1.5 text-xs border border-stone-200 rounded-md text-stone-500 hover:bg-stone-50">다음</button>
      </div>
    </div>
  </div>
</main>
    </>
  );
}

export default AppActivityLog;
