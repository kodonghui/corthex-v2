"use client";
import React from "react";
import { Activity, BarChart2, Bell, BookOpen, Bot, Building2, ChevronsUpDown, CreditCard, DollarSign, Eye, Folder, Gauge, GitBranch, Home, Key, LayoutDashboard, ListChecks, MessageSquare, MoreHorizontal, Plus, ScrollText, Send, Settings, Settings2, Share2, Shield, Terminal, TrendingUp, Users, Zap } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4,h5,h6,.font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre,.font-mono { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #f5f5f4; }
    ::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 3px; }`;

function AppDepartments() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      {/* API: GET /api/workspace/departments */}
  {/* API: POST /api/workspace/departments */}
  {/* API: GET /api/workspace/departments/{id} */}
  {/* API: PATCH /api/workspace/departments/{id} */}
  {/* API: DELETE /api/workspace/departments/{id} */}
  
  
  
  



{/* ===== SIDEBAR ===== */}
<aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-10">

  {/* Logo */}
  <div className="px-5 py-4 border-b border-stone-200 flex-shrink-0">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
        <Zap className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
      <span className="text-[10px] text-stone-400 ml-0.5" style={{"fontFamily":"'JetBrains Mono',monospace"}}>v2</span>
    </div>
  </div>

  {/* Navigation */}
  <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">

    <div>
      <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-stone-500">워크스페이스</p>
      <ul className="space-y-0.5">
        <li><a href="/app/home" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Home className="w-4 h-4 flex-shrink-0" />홈</a></li>
        <li><a href="/app/command-center" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Terminal className="w-4 h-4 flex-shrink-0" />커맨드 센터</a></li>
        <li><a href="/app/chat" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><MessageSquare className="w-4 h-4 flex-shrink-0" />AI 채팅</a></li>
        <li><a href="/app/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><LayoutDashboard className="w-4 h-4 flex-shrink-0" />대시보드</a></li>
      </ul>
    </div>

    <div>
      <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-stone-500">조직</p>
      <ul className="space-y-0.5">
        <li><a href="/app/agents" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Bot className="w-4 h-4 flex-shrink-0" />에이전트</a></li>
        <li><a href="/app/departments" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm bg-violet-50 text-violet-700 font-medium"><Building2 className="w-4 h-4 flex-shrink-0" />부서</a></li>
        <li><a href="/app/nexus" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><GitBranch className="w-4 h-4 flex-shrink-0" />조직도 (Nexus)</a></li>
      </ul>
    </div>

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
  
    <h1 className="text-base font-semibold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>부서</h1>
    <div className="flex items-center gap-2">
      <a href="/app/nexus" className="flex items-center gap-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
        <GitBranch className="w-3.5 h-3.5" />
        조직도 보기
      </a>
      <button className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150">
        <Plus className="w-4 h-4" />
        부서 추가
      </button>
    </div>
  

  <div className="p-6">

    {/* Summary Stats Bar */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 mb-6">
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-4.5 h-4.5 text-violet-700" />
          </div>
          <div>
            <p className="text-xs text-stone-500">총 부서</p>
            <p className="text-lg font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>5</p>
          </div>
        </div>
        <div className="w-px h-10 bg-stone-100"></div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Bot className="w-4.5 h-4.5 text-emerald-700" />
          </div>
          <div>
            <p className="text-xs text-stone-500">총 에이전트</p>
            <p className="text-lg font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>24</p>
          </div>
        </div>
        <div className="w-px h-10 bg-stone-100"></div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
            <ListChecks className="w-4.5 h-4.5 text-blue-700" />
          </div>
          <div>
            <p className="text-xs text-stone-500">이번 달 작업</p>
            <p className="text-lg font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>1,040</p>
          </div>
        </div>
        <div className="w-px h-10 bg-stone-100"></div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4.5 h-4.5 text-amber-700" />
          </div>
          <div>
            <p className="text-xs text-stone-500">이번 달 비용</p>
            <p className="text-lg font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>$16.80</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          전월 대비 +12%
        </div>
      </div>
    </div>

    {/* Department Cards Grid */}
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">

      {/* ── 비서실 ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🏢</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-stone-900 truncate" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>비서실</h3>
            <p className="text-xs text-stone-500 mt-0.5">CEO 직속 지원 조직</p>
          </div>
          <button className="text-stone-400 hover:text-stone-600 transition-colors flex-shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Agent Avatars Stack */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-violet-200 border-2 border-white flex items-center justify-center text-violet-800 text-[10px] font-bold z-30">이나</div>
            <div className="w-7 h-7 rounded-full bg-purple-200 border-2 border-white flex items-center justify-center text-purple-800 text-[10px] font-bold z-20">정비</div>
            <div className="w-7 h-7 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-700 text-[10px] font-bold z-10">+0</div>
          </div>
          <span className="text-xs text-stone-500">에이전트 2명</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-stone-50 rounded-lg p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-0.5">이번 달 작업</p>
            <p className="text-sm font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>145건</p>
          </div>
          <div className="bg-stone-50 rounded-lg p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-0.5">이번 달 비용</p>
            <p className="text-sm font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>$2.30</p>
          </div>
        </div>

        {/* Progress bar (usage vs budget) */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-stone-500">월 예산 사용률</span>
            <span className="text-[11px] font-medium text-stone-700">23%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div className="bg-violet-400 h-1.5 rounded-full" style={{"width":"23%"}}></div>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-1.5 bg-white border border-stone-200 hover:border-violet-200 hover:text-violet-700 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150">
          <Settings2 className="w-3.5 h-3.5" />
          관리하기
        </button>
      </div>

      {/* ── 마케팅부서 ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📢</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-stone-900 truncate" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>마케팅부서</h3>
            <p className="text-xs text-stone-500 mt-0.5">브랜드 마케팅 · SNS · 카피</p>
          </div>
          <button className="text-stone-400 hover:text-stone-600 transition-colors flex-shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center text-blue-800 text-[10px] font-bold z-30">박준</div>
            <div className="w-7 h-7 rounded-full bg-sky-200 border-2 border-white flex items-center justify-center text-sky-800 text-[10px] font-bold z-20">최민</div>
            <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-700 text-[10px] font-bold z-10">+3</div>
          </div>
          <span className="text-xs text-stone-500">에이전트 5명</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-stone-50 rounded-lg p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-0.5">이번 달 작업</p>
            <p className="text-sm font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>320건</p>
          </div>
          <div className="bg-stone-50 rounded-lg p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-0.5">이번 달 비용</p>
            <p className="text-sm font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>$4.80</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-stone-500">월 예산 사용률</span>
            <span className="text-[11px] font-medium text-stone-700">48%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div className="bg-blue-400 h-1.5 rounded-full" style={{"width":"48%"}}></div>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-1.5 bg-white border border-stone-200 hover:border-violet-200 hover:text-violet-700 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150">
          <Settings2 className="w-3.5 h-3.5" />
          관리하기
        </button>
      </div>

      {/* ── 전략투자부서 ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">💹</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-stone-900 truncate" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>전략투자부서</h3>
            <p className="text-xs text-stone-500 mt-0.5">투자 분석 · 포트폴리오</p>
          </div>
          <button className="text-stone-400 hover:text-stone-600 transition-colors flex-shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-emerald-800 text-[10px] font-bold z-30">김재</div>
            <div className="w-7 h-7 rounded-full bg-teal-200 border-2 border-white flex items-center justify-center text-teal-800 text-[10px] font-bold z-20">정도</div>
            <div className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-emerald-700 text-[10px] font-bold z-10">+2</div>
          </div>
          <span className="text-xs text-stone-500">에이전트 4명</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-stone-50 rounded-lg p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-0.5">이번 달 작업</p>
            <p className="text-sm font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>280건</p>
          </div>
          <div className="bg-stone-50 rounded-lg p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-0.5">이번 달 비용</p>
            <p className="text-sm font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>$5.20</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-stone-500">월 예산 사용률</span>
            <span className="text-[11px] font-medium text-amber-600">87%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div className="bg-amber-400 h-1.5 rounded-full" style={{"width":"87%"}}></div>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-1.5 bg-white border border-stone-200 hover:border-violet-200 hover:text-violet-700 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150">
          <Settings2 className="w-3.5 h-3.5" />
          관리하기
        </button>
      </div>

      {/* ── 법무부서 ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">⚖️</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-stone-900 truncate" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>법무부서</h3>
            <p className="text-xs text-stone-500 mt-0.5">계약 검토 · 법률 자문</p>
          </div>
          <button className="text-stone-400 hover:text-stone-600 transition-colors flex-shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center text-amber-800 text-[10px] font-bold z-30">이소</div>
            <div className="w-7 h-7 rounded-full bg-yellow-200 border-2 border-white flex items-center justify-center text-yellow-800 text-[10px] font-bold z-20">한법</div>
            <div className="w-7 h-7 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-amber-700 text-[10px] font-bold z-10">+1</div>
          </div>
          <span className="text-xs text-stone-500">에이전트 3명</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-stone-50 rounded-lg p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-0.5">이번 달 작업</p>
            <p className="text-sm font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>85건</p>
          </div>
          <div className="bg-stone-50 rounded-lg p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-0.5">이번 달 비용</p>
            <p className="text-sm font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>$1.40</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-stone-500">월 예산 사용률</span>
            <span className="text-[11px] font-medium text-stone-700">14%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div className="bg-amber-400 h-1.5 rounded-full" style={{"width":"14%"}}></div>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-1.5 bg-white border border-stone-200 hover:border-violet-200 hover:text-violet-700 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150">
          <Settings2 className="w-3.5 h-3.5" />
          관리하기
        </button>
      </div>

      {/* ── 연구개발부서 ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 bg-rose-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🔬</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-stone-900 truncate" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>연구개발부서</h3>
            <p className="text-xs text-stone-500 mt-0.5">신사업 리서치 · R&amp;D</p>
          </div>
          <button className="text-stone-400 hover:text-stone-600 transition-colors flex-shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-rose-200 border-2 border-white flex items-center justify-center text-rose-800 text-[10px] font-bold z-30">강연</div>
            <div className="w-7 h-7 rounded-full bg-pink-200 border-2 border-white flex items-center justify-center text-pink-800 text-[10px] font-bold z-20">오리</div>
            <div className="w-7 h-7 rounded-full bg-rose-100 border-2 border-white flex items-center justify-center text-rose-700 text-[10px] font-bold z-10">+2</div>
          </div>
          <span className="text-xs text-stone-500">에이전트 4명</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-stone-50 rounded-lg p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-0.5">이번 달 작업</p>
            <p className="text-sm font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>210건</p>
          </div>
          <div className="bg-stone-50 rounded-lg p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-0.5">이번 달 비용</p>
            <p className="text-sm font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>$3.10</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-stone-500">월 예산 사용률</span>
            <span className="text-[11px] font-medium text-stone-700">62%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div className="bg-rose-400 h-1.5 rounded-full" style={{"width":"62%"}}></div>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-1.5 bg-white border border-stone-200 hover:border-violet-200 hover:text-violet-700 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150">
          <Settings2 className="w-3.5 h-3.5" />
          관리하기
        </button>
      </div>

      {/* ── Add New Department Card ── */}
      <div className="bg-stone-50 rounded-xl border-2 border-dashed border-stone-200 hover:border-violet-300 hover:bg-violet-50 transition-all duration-150 p-5 flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[280px]">
        <div className="w-12 h-12 bg-white rounded-xl border border-stone-200 flex items-center justify-center shadow-sm">
          <Plus className="w-6 h-6 text-stone-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-stone-600" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>새 부서 추가</p>
          <p className="text-xs text-stone-400 mt-0.5">에이전트를 부서로 묶어 관리하세요</p>
        </div>
      </div>

    </div>{/* /grid */}

  </div>{/* /p-6 */}
</main>
    </>
  );
}

export default AppDepartments;
