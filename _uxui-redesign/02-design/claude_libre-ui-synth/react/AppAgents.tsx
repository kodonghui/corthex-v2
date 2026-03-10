"use client";
import React from "react";
import { Activity, BarChart2, Bell, BookOpen, Bot, Building2, ChevronLeft, ChevronRight, ChevronsUpDown, Cpu, CreditCard, Eye, Filter, Folder, Gauge, GitBranch, Home, Key, LayoutDashboard, ListChecks, MessageCircle, MessageSquare, Pencil, Plus, ScrollText, Search, Send, Settings, Share2, Shield, Terminal, TrendingUp, User, Users, Zap } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4,h5,h6,.font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre,.font-mono { font-family: 'JetBrains Mono', monospace; }
    @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.35} }
    .animate-pulse-dot { animation: pulse-dot 1.8s ease-in-out infinite; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #f5f5f4; }
    ::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 3px; }
`;

function AppAgents() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* ===== SIDEBAR ===== */}
<aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-10">

  {/* Logo */}
  <div className="px-5 py-4 border-b border-stone-200 flex-shrink-0">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
        <Zap className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
      <span className="text-[10px] text-stone-400 ml-0.5" style={{fontFamily: "'JetBrains Mono',monospace"}}>v2</span>
    </div>
  </div>

  {/* Navigation */}
  <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">

    {/* 워크스페이스 */}
    <div>
      <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-stone-500">워크스페이스</p>
      <ul className="space-y-0.5">
        <li><a href="/app/home" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Home className="w-4 h-4 flex-shrink-0" />홈</a></li>
        <li><a href="/app/command-center" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Terminal className="w-4 h-4 flex-shrink-0" />커맨드 센터</a></li>
        <li><a href="/app/chat" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><MessageSquare className="w-4 h-4 flex-shrink-0" />AI 채팅</a></li>
        <li><a href="/app/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><LayoutDashboard className="w-4 h-4 flex-shrink-0" />대시보드</a></li>
      </ul>
    </div>

    {/* 조직 */}
    <div>
      <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-stone-500">조직</p>
      <ul className="space-y-0.5">
        <li><a href="/app/agents" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm bg-violet-50 text-violet-700 font-medium"><Bot className="w-4 h-4 flex-shrink-0" />에이전트</a></li>
        <li><a href="/app/departments" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Building2 className="w-4 h-4 flex-shrink-0" />부서</a></li>
        <li><a href="/app/nexus" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><GitBranch className="w-4 h-4 flex-shrink-0" />조직도 (Nexus)</a></li>
      </ul>
    </div>

    {/* 업무도구 */}
    <div>
      <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-stone-500">업무도구</p>
      <ul className="space-y-0.5">
        <li><a href="/app/trading" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><TrendingUp className="w-4 h-4 flex-shrink-0" />트레이딩</a></li>
        <li><a href="/app/agora" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Users className="w-4 h-4 flex-shrink-0" />Agora</a></li>
        <li><a href="/app/sns" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Share2 className="w-4 h-4 flex-shrink-0" />SNS</a></li>
        <li><a href="/app/messenger" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Send className="w-4 h-4 flex-shrink-0" />메신저</a></li>
        <li><a href="/app/knowledge" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><BookOpen className="w-4 h-4 flex-shrink-0" />지식베이스</a></li>
        <li><a href="/app/files" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Folder className="w-4 h-4 flex-shrink-0" />파일</a></li>
      </ul>
    </div>

    {/* 기록&분석 */}
    <div>
      <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-stone-500">기록 &amp; 분석</p>
      <ul className="space-y-0.5">
        <li><a href="/app/reports" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><BarChart2 className="w-4 h-4 flex-shrink-0" />리포트</a></li>
        <li><a href="/app/ops-log" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><ScrollText className="w-4 h-4 flex-shrink-0" />운영 로그</a></li>
        <li><a href="/app/jobs" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><ListChecks className="w-4 h-4 flex-shrink-0" />작업 현황</a></li>
        <li><a href="/app/costs" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><CreditCard className="w-4 h-4 flex-shrink-0" />비용</a></li>
        <li><a href="/app/activity-log" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Activity className="w-4 h-4 flex-shrink-0" />활동 로그</a></li>
        <li><a href="/app/performance" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Gauge className="w-4 h-4 flex-shrink-0" />성과 분석</a></li>
      </ul>
    </div>

    {/* 설정 */}
    <div>
      <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-stone-500">설정</p>
      <ul className="space-y-0.5">
        <li><a href="/app/argos" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Eye className="w-4 h-4 flex-shrink-0" />Argos 모니터링</a></li>
        <li><a href="/app/classified" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Shield className="w-4 h-4 flex-shrink-0" />기밀</a></li>
        <li><a href="/app/credentials" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Key className="w-4 h-4 flex-shrink-0" />크리덴셜</a></li>
        <li><a href="/app/notifications" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Bell className="w-4 h-4 flex-shrink-0" />알림</a></li>
        <li><a href="/app/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Settings className="w-4 h-4 flex-shrink-0" />설정</a></li>
      </ul>
    </div>

  </nav>

  {/* User Profile */}
  <div className="px-4 py-4 border-t border-stone-200 flex-shrink-0">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0">김</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-900 truncate">김대표</p>
        <p className="text-xs text-stone-500 truncate">CEO · ACME Corp</p>
      </div>
      <button className="text-stone-400 hover:text-stone-600 transition-colors">
        <ChevronsUpDown className="w-4 h-4" />
      </button>
    </div>
  </div>
</aside>

{/* ===== MAIN CONTENT ===== */}
<main className="ml-60 min-h-screen">

  {/* Header */}
  <header className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-6 sticky top-0 z-10">
    <h1 className="text-base font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>에이전트</h1>
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
        <Filter className="w-3.5 h-3.5" />
        필터
      </button>
      <button className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150">
        <Plus className="w-4 h-4" />
        에이전트 추가
      </button>
    </div>
  </header>

  <div className="p-6">

    {/* Filter Tabs + Search Row */}
    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">

      {/* Status Tabs */}
      <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
        <button className="px-3.5 py-1.5 rounded-md text-sm font-medium bg-white text-stone-900 shadow-sm">
          전체 <span className="ml-1 text-xs text-stone-500 font-normal">24</span>
        </button>
        <button className="px-3.5 py-1.5 rounded-md text-sm text-stone-600 hover:bg-white hover:text-stone-900 transition-all">
          온라인
          <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold px-1">8</span>
        </button>
        <button className="px-3.5 py-1.5 rounded-md text-sm text-stone-600 hover:bg-white hover:text-stone-900 transition-all">
          작업중
          <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-orange-100 text-orange-600 text-[11px] font-semibold px-1">5</span>
        </button>
        <button className="px-3.5 py-1.5 rounded-md text-sm text-stone-600 hover:bg-white hover:text-stone-900 transition-all">
          오프라인
          <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-stone-200 text-stone-500 text-[11px] font-semibold px-1">11</span>
        </button>
      </div>

      {/* Search + Department Filter */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          <input type="text" placeholder="에이전트 검색..." className="pl-9 pr-4 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-52 bg-white" />
        </div>
        <select className="text-sm rounded-lg border border-stone-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-stone-700">
          <option value="">전체 부서</option>
          <option>비서실</option>
          <option>마케팅부서</option>
          <option>전략투자부서</option>
          <option>법무부서</option>
          <option>연구개발부서</option>
        </select>
      </div>
    </div>

    {/* Agent Cards Grid */}
    <div className="grid grid-cols-3 gap-4">

      {/* ── 이나경 ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-sm font-bold flex-shrink-0">이나</div>
            <div>
              <p className="text-sm font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>이나경</p>
              <p className="text-xs text-stone-500">비서실장</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            온라인
          </span>
        </div>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">부서</span>
            <span className="text-xs text-stone-700">비서실</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">계급</span>
            <span className="text-xs font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">Manager</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">모델</span>
            <span className="text-xs text-stone-600" style={{fontFamily: "'JetBrains Mono',monospace"}}>claude-3-5-sonnet</span>
          </div>
        </div>
        <div className="flex items-center justify-between py-3 border-t border-stone-100 mb-3">
          <div className="text-center">
            <p className="text-base font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>12</p>
            <p className="text-[11px] text-stone-500">오늘 작업</p>
          </div>
          <div className="w-px h-8 bg-stone-100"></div>
          <div className="text-center">
            <p className="text-base font-bold text-emerald-600" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>97%</p>
            <p className="text-[11px] text-stone-500">성공률</p>
          </div>
          <div className="w-px h-8 bg-stone-100"></div>
          <div className="text-center">
            <p className="text-base font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>3.2s</p>
            <p className="text-[11px] text-stone-500">평균 응답</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
            <MessageCircle className="w-3.5 h-3.5" /> 채팅
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 text-stone-600 hover:bg-stone-100 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> 편집
          </button>
        </div>
      </div>

      {/* ── 박준형 ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold flex-shrink-0">박준</div>
            <div>
              <p className="text-sm font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>박준형</p>
              <p className="text-xs text-stone-500">마케팅팀장</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block animate-pulse-dot"></span>
            작업중
          </span>
        </div>
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">부서</span>
            <span className="text-xs text-stone-700">마케팅부서</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">계급</span>
            <span className="text-xs font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">Manager</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">모델</span>
            <span className="text-xs text-stone-600" style={{fontFamily: "'JetBrains Mono',monospace"}}>claude-3-5-sonnet</span>
          </div>
        </div>
        {/* Working progress indicator */}
        <div className="mb-3 p-2.5 bg-orange-50 rounded-lg border border-orange-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-orange-700 font-medium">SNS 캠페인 기획서 작성</span>
            <span className="text-[11px] text-orange-600">62%</span>
          </div>
          <div className="w-full bg-orange-100 rounded-full h-1.5">
            <div className="bg-orange-400 h-1.5 rounded-full transition-all" style={{width: "62%"}}></div>
          </div>
        </div>
        <div className="flex items-center justify-between py-3 border-t border-stone-100 mb-3">
          <div className="text-center">
            <p className="text-base font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>8</p>
            <p className="text-[11px] text-stone-500">오늘 작업</p>
          </div>
          <div className="w-px h-8 bg-stone-100"></div>
          <div className="text-center">
            <p className="text-base font-bold text-emerald-600" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>94%</p>
            <p className="text-[11px] text-stone-500">성공률</p>
          </div>
          <div className="w-px h-8 bg-stone-100"></div>
          <div className="text-center">
            <p className="text-base font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>4.1s</p>
            <p className="text-[11px] text-stone-500">평균 응답</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
            <MessageCircle className="w-3.5 h-3.5" /> 채팅
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 text-stone-600 hover:bg-stone-100 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> 편집
          </button>
        </div>
      </div>

      {/* ── 김재원 ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold flex-shrink-0">김재</div>
            <div>
              <p className="text-sm font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>김재원</p>
              <p className="text-xs text-stone-500">투자분석가</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            온라인
          </span>
        </div>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">부서</span>
            <span className="text-xs text-stone-700">전략투자부서</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">계급</span>
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">Specialist</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">모델</span>
            <span className="text-xs text-stone-600" style={{fontFamily: "'JetBrains Mono',monospace"}}>claude-3-opus</span>
          </div>
        </div>
        <div className="flex items-center justify-between py-3 border-t border-stone-100 mb-3">
          <div className="text-center">
            <p className="text-base font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>15</p>
            <p className="text-[11px] text-stone-500">오늘 작업</p>
          </div>
          <div className="w-px h-8 bg-stone-100"></div>
          <div className="text-center">
            <p className="text-base font-bold text-emerald-600" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>98%</p>
            <p className="text-[11px] text-stone-500">성공률</p>
          </div>
          <div className="w-px h-8 bg-stone-100"></div>
          <div className="text-center">
            <p className="text-base font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>5.8s</p>
            <p className="text-[11px] text-stone-500">평균 응답</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
            <MessageCircle className="w-3.5 h-3.5" /> 채팅
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 text-stone-600 hover:bg-stone-100 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> 편집
          </button>
        </div>
      </div>

      {/* ── 이소연 ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-sm font-bold flex-shrink-0">이소</div>
            <div>
              <p className="text-sm font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>이소연</p>
              <p className="text-xs text-stone-500">법무전문가</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            온라인
          </span>
        </div>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">부서</span>
            <span className="text-xs text-stone-700">법무부서</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">계급</span>
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">Specialist</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">모델</span>
            <span className="text-xs text-stone-600" style={{fontFamily: "'JetBrains Mono',monospace"}}>claude-3-5-sonnet</span>
          </div>
        </div>
        <div className="flex items-center justify-between py-3 border-t border-stone-100 mb-3">
          <div className="text-center">
            <p className="text-base font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>5</p>
            <p className="text-[11px] text-stone-500">오늘 작업</p>
          </div>
          <div className="w-px h-8 bg-stone-100"></div>
          <div className="text-center">
            <p className="text-base font-bold text-emerald-600" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>100%</p>
            <p className="text-[11px] text-stone-500">성공률</p>
          </div>
          <div className="w-px h-8 bg-stone-100"></div>
          <div className="text-center">
            <p className="text-base font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>8.2s</p>
            <p className="text-[11px] text-stone-500">평균 응답</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
            <MessageCircle className="w-3.5 h-3.5" /> 채팅
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 text-stone-600 hover:bg-stone-100 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> 편집
          </button>
        </div>
      </div>

      {/* ── 최민지 ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-sm font-bold flex-shrink-0">최민</div>
            <div>
              <p className="text-sm font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>최민지</p>
              <p className="text-xs text-stone-500">카피라이터</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block animate-pulse-dot"></span>
            작업중
          </span>
        </div>
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">부서</span>
            <span className="text-xs text-stone-700">마케팅부서</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">계급</span>
            <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">Worker</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">모델</span>
            <span className="text-xs text-stone-600" style={{fontFamily: "'JetBrains Mono',monospace"}}>claude-3-5-haiku</span>
          </div>
        </div>
        <div className="mb-3 p-2.5 bg-orange-50 rounded-lg border border-orange-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-orange-700 font-medium">제품 상세페이지 카피 작성</span>
            <span className="text-[11px] text-orange-600">80%</span>
          </div>
          <div className="w-full bg-orange-100 rounded-full h-1.5">
            <div className="bg-orange-400 h-1.5 rounded-full transition-all" style={{width: "80%"}}></div>
          </div>
        </div>
        <div className="flex items-center justify-between py-3 border-t border-stone-100 mb-3">
          <div className="text-center">
            <p className="text-base font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>20</p>
            <p className="text-[11px] text-stone-500">오늘 작업</p>
          </div>
          <div className="w-px h-8 bg-stone-100"></div>
          <div className="text-center">
            <p className="text-base font-bold text-emerald-600" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>92%</p>
            <p className="text-[11px] text-stone-500">성공률</p>
          </div>
          <div className="w-px h-8 bg-stone-100"></div>
          <div className="text-center">
            <p className="text-base font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>2.1s</p>
            <p className="text-[11px] text-stone-500">평균 응답</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
            <MessageCircle className="w-3.5 h-3.5" /> 채팅
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 text-stone-600 hover:bg-stone-100 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> 편집
          </button>
        </div>
      </div>

      {/* ── 정도현 (offline) ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 text-sm font-bold flex-shrink-0">정도</div>
            <div>
              <p className="text-sm font-semibold text-stone-700" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>정도현</p>
              <p className="text-xs text-stone-500">데이터분석가</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-500 rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block"></span>
            오프라인
          </span>
        </div>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">부서</span>
            <span className="text-xs text-stone-700">전략투자부서</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">계급</span>
            <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">Worker</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">모델</span>
            <span className="text-xs text-stone-500" style={{fontFamily: "'JetBrains Mono',monospace"}}>claude-3-5-haiku</span>
          </div>
        </div>
        <div className="flex items-center justify-between py-3 border-t border-stone-100 mb-3">
          <div className="text-center">
            <p className="text-base font-bold text-stone-400" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>0</p>
            <p className="text-[11px] text-stone-400">오늘 작업</p>
          </div>
          <div className="w-px h-8 bg-stone-100"></div>
          <div className="text-center">
            <p className="text-base font-bold text-stone-400" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>—</p>
            <p className="text-[11px] text-stone-400">성공률</p>
          </div>
          <div className="w-px h-8 bg-stone-100"></div>
          <div className="text-center">
            <p className="text-base font-bold text-stone-400" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>—</p>
            <p className="text-[11px] text-stone-400">평균 응답</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 bg-stone-50 border border-stone-200 text-stone-400 rounded-lg px-3 py-1.5 text-xs font-medium cursor-not-allowed" disabled>
            <MessageCircle className="w-3.5 h-3.5" /> 채팅
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 text-stone-600 hover:bg-stone-100 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> 편집
          </button>
        </div>
      </div>

    </div>{/* /grid */}

    {/* Summary Footer */}
    <div className="mt-8 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-sm text-stone-500">
          총 <span className="font-semibold text-stone-800">24</span>개 에이전트 표시 중
        </p>
        <span className="w-1 h-1 rounded-full bg-stone-300"></span>
        <span className="inline-flex items-center gap-1.5 text-xs text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full font-medium">
          <Cpu className="w-3 h-3" /> 시스템 에이전트 4개
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full font-medium">
          <User className="w-3 h-3" /> 사용자 정의 20개
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-400 text-sm" disabled>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-600 text-white text-sm font-semibold">1</button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm transition-colors">2</button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm transition-colors">3</button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>

  </div>{/* /p-6 */}
</main>
    </>
  );
}

export default AppAgents;
