"use client";
import React from "react";
import { Activity, BarChart2, Bell, BookOpen, Building2, Calendar, CheckCircle2, ChevronsUpDown, Clock, DollarSign, Download, Eye, FileText, Folder, GitBranch, Home, Key, LayoutDashboard, Lock, Megaphone, MessageCircle, MessagesSquare, ScrollText, Settings, Share2, Terminal, TrendingUp, Users, Zap } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1, h2, h3, h4, h5, h6, .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono, code, pre { font-family: 'JetBrains Mono', monospace; }
    @keyframes blink-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }
    .animate-blink { animation: blink-pulse 2s ease-in-out infinite; }
    .bar-chart-bar {
      transition: height 0.4s ease;
    }
    .bar-chart-bar:hover {
      filter: brightness(1.1);
    }
`;

function AppDashboard() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* 사이드바 */}
<aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-10">
  <div className="h-14 flex items-center px-4 border-b border-stone-200">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">C</span>
      </div>
      <span className="font-bold text-stone-900 text-[15px]" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>CORTHEX</span>
    </div>
  </div>
  <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
    <div className="mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 px-3 mb-2">워크스페이스</p>
      <a href="/app/home" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 font-normal transition-colors duration-150 group">
        <Home className="w-4 h-4 flex-shrink-0" /><span>홈</span>
      </a>
      <a href="/app/command-center" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 font-normal transition-colors duration-150 group">
        <Terminal className="w-4 h-4 flex-shrink-0" /><span>사령관실</span>
      </a>
      <a href="/app/chat" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150 group">
        <MessageCircle className="w-4 h-4 flex-shrink-0" /><span>채팅</span>
      </a>
      <a href="/app/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm bg-violet-50 text-violet-700 font-medium group">
        <LayoutDashboard className="w-4 h-4 flex-shrink-0" /><span>대시보드</span>
      </a>
    </div>
    <div className="mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 px-3 mb-2">조직</p>
      <a href="/app/agents" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Users className="w-4 h-4" /><span>에이전트</span>
      </a>
      <a href="/app/departments" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Building2 className="w-4 h-4" /><span>부서</span>
      </a>
      <a href="/app/nexus" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <GitBranch className="w-4 h-4" /><span>조직도 (Nexus)</span>
      </a>
    </div>
    <div className="mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 px-3 mb-2">업무 도구</p>
      <a href="/app/trading" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <TrendingUp className="w-4 h-4" /><span>트레이딩</span>
      </a>
      <a href="/app/agora" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Megaphone className="w-4 h-4" /><span>아고라</span>
      </a>
      <a href="/app/sns" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Share2 className="w-4 h-4" /><span>SNS</span>
      </a>
      <a href="/app/messenger" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <MessagesSquare className="w-4 h-4" /><span>메신저</span>
      </a>
      <a href="/app/knowledge" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <BookOpen className="w-4 h-4" /><span>지식베이스</span>
      </a>
      <a href="/app/files" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Folder className="w-4 h-4" /><span>파일</span>
      </a>
    </div>
    <div className="mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 px-3 mb-2">기록 &amp; 분석</p>
      <a href="/app/reports" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <FileText className="w-4 h-4" /><span>보고서</span>
      </a>
      <a href="/app/ops-log" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <ScrollText className="w-4 h-4" /><span>작전일지</span>
      </a>
      <a href="/app/jobs" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Clock className="w-4 h-4" /><span>예약 작업</span>
      </a>
      <a href="/app/costs" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <DollarSign className="w-4 h-4" /><span>비용</span>
      </a>
      <a href="/app/activity-log" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Activity className="w-4 h-4" /><span>활동 로그</span>
      </a>
      <a href="/app/performance" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <BarChart2 className="w-4 h-4" /><span>전력분석</span>
      </a>
      <a href="/app/argos" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Eye className="w-4 h-4" /><span>아르고스</span>
      </a>
      <a href="/app/classified" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Lock className="w-4 h-4" /><span>기밀문서</span>
      </a>
    </div>
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 px-3 mb-2">설정</p>
      <a href="/app/credentials" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Key className="w-4 h-4" /><span>크리덴셜</span>
      </a>
      <a href="/app/notifications" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Bell className="w-4 h-4" /><span>알림</span>
      </a>
      <a href="/app/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Settings className="w-4 h-4" /><span>설정</span>
      </a>
    </div>
  </nav>
  <div className="p-3 border-t border-stone-200">
    <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-stone-100 cursor-pointer transition-colors">
      <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-violet-700 font-semibold text-xs">김</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-stone-800 truncate">김대표</p>
        <p className="text-[10px] text-stone-400 truncate">kim@acme.co.kr</p>
      </div>
      <ChevronsUpDown className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
    </div>
  </div>
</aside>

{/* 메인 */}
<div className="ml-60 min-h-screen bg-stone-50">

  {/* 헤더 */}
  <header className="h-14 bg-white border-b border-stone-200 flex items-center px-6 sticky top-0 z-10">
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>작전 대시보드</span>
        <span className="text-sm text-stone-400">2026년 3월 10일</span>
      </div>
      <div className="flex items-center gap-2">
        <select className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-600 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
          <option>오늘</option>
          <option>이번 주</option>
          <option>이번 달</option>
        </select>
        <button className="bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 flex items-center gap-2">
          <Download className="w-4 h-4" /> 내보내기
        </button>
      </div>
    </div>
  </header>

  {/* 콘텐츠 */}
  <main className="p-6 space-y-6">

    {/* API: GET /api/workspace/dashboard/summary */}
    {/* KPI 4개 */}
    <div className="grid grid-cols-4 gap-4">

      {/* 오늘 명령 수 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">오늘 명령 수</p>
          <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
            <Terminal className="w-4 h-4 text-violet-600" />
          </div>
        </div>
        <p className="text-[32px] font-bold tracking-tight text-stone-900 leading-none" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>23</p>
        <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> 어제(18)보다 +5
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 rounded-full px-2 py-0.5 text-[10px] font-medium">
            <span className="w-1 h-1 bg-orange-500 rounded-full animate-blink"></span> 실행 중 3
          </span>
        </div>
      </div>

      {/* 완료율 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">완료율</p>
          <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <p className="text-[32px] font-bold tracking-tight text-stone-900 leading-none" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>91.3%</p>
        <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> 주간 평균 88%
        </p>
        <div className="mt-2">
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: "91.3%"}}></div>
          </div>
        </div>
      </div>

      {/* 오늘 비용 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">오늘 비용</p>
          <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
        </div>
        <p className="text-[32px] font-bold tracking-tight text-stone-900 leading-none" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>$1.87</p>
        <p className="text-xs text-stone-500 mt-2 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> 일평균 $1.42
        </p>
        <p className="text-[10px] text-amber-600 mt-1">오늘 +$0.45 (초과)</p>
      </div>

      {/* 활성 에이전트 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">활성 에이전트</p>
          <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-violet-600" />
          </div>
        </div>
        <p className="text-[32px] font-bold tracking-tight text-stone-900 leading-none" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>18<span className="text-base text-stone-400 font-normal"> / 24</span></p>
        <p className="text-xs text-stone-500 mt-2 flex items-center gap-1">
          <Users className="w-3 h-3" /> 오프라인 6 · 오류 1
        </p>
        <div className="mt-2">
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div className="bg-violet-500 h-1.5 rounded-full" style={{width: "75%"}}></div>
          </div>
        </div>
      </div>

    </div>

    {/* 중단 2열 */}
    <div className="grid grid-cols-3 gap-4">

      {/* API: GET /api/workspace/dashboard/usage */}
      {/* 비용 추이 차트 (2/3) */}
      <div className="col-span-2 bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>일별 비용 추이</h2>
            <p className="text-xs text-stone-400 mt-0.5">최근 14일 · CLI 토큰 사용량</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-violet-500 rounded-sm inline-block"></span> Anthropic</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm inline-block"></span> OpenAI</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-400 rounded-sm inline-block"></span> Google</span>
          </div>
        </div>

        {/* 막대 그래프 */}
        <div className="flex items-end gap-1.5 h-48 px-2">
          {/* 날짜별 데이터: [anthropic, openai, google] */}
          <div className="flex flex-col items-center gap-1 flex-1 group cursor-pointer">
            <div className="w-full flex flex-col items-center gap-0.5">
              <div className="w-full bg-violet-500 bar-chart-bar rounded-sm" style={{height: "42px"}}></div>
              <div className="w-full bg-emerald-400 bar-chart-bar rounded-sm" style={{height: "16px"}}></div>
              <div className="w-full bg-amber-400 bar-chart-bar rounded-sm" style={{height: "8px"}}></div>
            </div>
            <span className="text-[9px] text-stone-400 group-hover:text-stone-600 transition-colors">2/26</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 group cursor-pointer">
            <div className="w-full flex flex-col items-center gap-0.5">
              <div className="w-full bg-violet-500 bar-chart-bar rounded-sm" style={{height: "36px"}}></div>
              <div className="w-full bg-emerald-400 bar-chart-bar rounded-sm" style={{height: "20px"}}></div>
              <div className="w-full bg-amber-400 bar-chart-bar rounded-sm" style={{height: "6px"}}></div>
            </div>
            <span className="text-[9px] text-stone-400 group-hover:text-stone-600 transition-colors">2/27</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 group cursor-pointer">
            <div className="w-full flex flex-col items-center gap-0.5">
              <div className="w-full bg-violet-500 bar-chart-bar rounded-sm" style={{height: "54px"}}></div>
              <div className="w-full bg-emerald-400 bar-chart-bar rounded-sm" style={{height: "22px"}}></div>
              <div className="w-full bg-amber-400 bar-chart-bar rounded-sm" style={{height: "10px"}}></div>
            </div>
            <span className="text-[9px] text-stone-400 group-hover:text-stone-600 transition-colors">2/28</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 group cursor-pointer">
            <div className="w-full flex flex-col items-center gap-0.5">
              <div className="w-full bg-violet-500 bar-chart-bar rounded-sm" style={{height: "28px"}}></div>
              <div className="w-full bg-emerald-400 bar-chart-bar rounded-sm" style={{height: "12px"}}></div>
              <div className="w-full bg-amber-400 bar-chart-bar rounded-sm" style={{height: "5px"}}></div>
            </div>
            <span className="text-[9px] text-stone-400 group-hover:text-stone-600 transition-colors">3/1</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 group cursor-pointer">
            <div className="w-full flex flex-col items-center gap-0.5">
              <div className="w-full bg-violet-500 bar-chart-bar rounded-sm" style={{height: "60px"}}></div>
              <div className="w-full bg-emerald-400 bar-chart-bar rounded-sm" style={{height: "26px"}}></div>
              <div className="w-full bg-amber-400 bar-chart-bar rounded-sm" style={{height: "12px"}}></div>
            </div>
            <span className="text-[9px] text-stone-400 group-hover:text-stone-600 transition-colors">3/2</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 group cursor-pointer">
            <div className="w-full flex flex-col items-center gap-0.5">
              <div className="w-full bg-violet-500 bar-chart-bar rounded-sm" style={{height: "48px"}}></div>
              <div className="w-full bg-emerald-400 bar-chart-bar rounded-sm" style={{height: "18px"}}></div>
              <div className="w-full bg-amber-400 bar-chart-bar rounded-sm" style={{height: "8px"}}></div>
            </div>
            <span className="text-[9px] text-stone-400 group-hover:text-stone-600 transition-colors">3/3</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 group cursor-pointer">
            <div className="w-full flex flex-col items-center gap-0.5">
              <div className="w-full bg-violet-500 bar-chart-bar rounded-sm" style={{height: "32px"}}></div>
              <div className="w-full bg-emerald-400 bar-chart-bar rounded-sm" style={{height: "14px"}}></div>
              <div className="w-full bg-amber-400 bar-chart-bar rounded-sm" style={{height: "6px"}}></div>
            </div>
            <span className="text-[9px] text-stone-400 group-hover:text-stone-600 transition-colors">3/4</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 group cursor-pointer">
            <div className="w-full flex flex-col items-center gap-0.5">
              <div className="w-full bg-violet-500 bar-chart-bar rounded-sm" style={{height: "44px"}}></div>
              <div className="w-full bg-emerald-400 bar-chart-bar rounded-sm" style={{height: "20px"}}></div>
              <div className="w-full bg-amber-400 bar-chart-bar rounded-sm" style={{height: "9px"}}></div>
            </div>
            <span className="text-[9px] text-stone-400 group-hover:text-stone-600 transition-colors">3/5</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 group cursor-pointer">
            <div className="w-full flex flex-col items-center gap-0.5">
              <div className="w-full bg-violet-500 bar-chart-bar rounded-sm" style={{height: "70px"}}></div>
              <div className="w-full bg-emerald-400 bar-chart-bar rounded-sm" style={{height: "30px"}}></div>
              <div className="w-full bg-amber-400 bar-chart-bar rounded-sm" style={{height: "14px"}}></div>
            </div>
            <span className="text-[9px] text-stone-400 group-hover:text-stone-600 transition-colors">3/6</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 group cursor-pointer">
            <div className="w-full flex flex-col items-center gap-0.5">
              <div className="w-full bg-violet-500 bar-chart-bar rounded-sm" style={{height: "38px"}}></div>
              <div className="w-full bg-emerald-400 bar-chart-bar rounded-sm" style={{height: "16px"}}></div>
              <div className="w-full bg-amber-400 bar-chart-bar rounded-sm" style={{height: "7px"}}></div>
            </div>
            <span className="text-[9px] text-stone-400 group-hover:text-stone-600 transition-colors">3/7</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 group cursor-pointer">
            <div className="w-full flex flex-col items-center gap-0.5">
              <div className="w-full bg-violet-500 bar-chart-bar rounded-sm" style={{height: "52px"}}></div>
              <div className="w-full bg-emerald-400 bar-chart-bar rounded-sm" style={{height: "24px"}}></div>
              <div className="w-full bg-amber-400 bar-chart-bar rounded-sm" style={{height: "11px"}}></div>
            </div>
            <span className="text-[9px] text-stone-400 group-hover:text-stone-600 transition-colors">3/8</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 group cursor-pointer">
            <div className="w-full flex flex-col items-center gap-0.5">
              <div className="w-full bg-violet-500 bar-chart-bar rounded-sm" style={{height: "46px"}}></div>
              <div className="w-full bg-emerald-400 bar-chart-bar rounded-sm" style={{height: "22px"}}></div>
              <div className="w-full bg-amber-400 bar-chart-bar rounded-sm" style={{height: "10px"}}></div>
            </div>
            <span className="text-[9px] text-stone-400 group-hover:text-stone-600 transition-colors">3/9</span>
          </div>
          {/* 오늘 — 강조 */}
          <div className="flex flex-col items-center gap-1 flex-1 group cursor-pointer relative">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[9px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap">오늘</div>
            <div className="w-full flex flex-col items-center gap-0.5">
              <div className="w-full bg-violet-600 bar-chart-bar rounded-sm" style={{height: "32px"}}></div>
              <div className="w-full bg-emerald-500 bar-chart-bar rounded-sm" style={{height: "14px"}}></div>
              <div className="w-full bg-amber-500 bar-chart-bar rounded-sm" style={{height: "6px"}}></div>
            </div>
            <span className="text-[9px] text-violet-600 font-semibold">3/10</span>
          </div>
        </div>
      </div>

      {/* 우측: 예산 + LLM 상태 */}
      <div className="space-y-4">

        {/* 이번 달 예산 */}
        {/* API: GET /api/workspace/dashboard/budget */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
          <h2 className="text-base font-semibold text-stone-900 mb-4" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>이번 달 예산</h2>

          <div className="space-y-3">
            {/* 전체 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-stone-600 font-medium">전체 예산</span>
                <span className="text-xs font-semibold text-stone-800">$12.40 / $50.00</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{width: "24.8%"}}></div>
              </div>
              <p className="text-[10px] text-stone-400 mt-1">잔여 $37.60 (75.2%)</p>
            </div>

            {/* Anthropic */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-stone-500">Anthropic</span>
                <span className="text-xs text-stone-600">$7.82</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5">
                <div className="bg-violet-500 h-1.5 rounded-full" style={{width: "63%"}}></div>
              </div>
            </div>

            {/* OpenAI */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-stone-500">OpenAI</span>
                <span className="text-xs text-stone-600">$3.12</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{width: "25%"}}></div>
              </div>
            </div>

            {/* Google */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-stone-500">Google</span>
                <span className="text-xs text-stone-600">$1.46</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5">
                <div className="bg-amber-400 h-1.5 rounded-full" style={{width: "12%"}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* LLM 프로바이더 상태 */}
        {/* API: GET /api/workspace/dashboard/providers */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
          <h2 className="text-base font-semibold text-stone-900 mb-3" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>LLM 프로바이더</h2>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-stone-100 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-bold text-stone-600">AN</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-800">Anthropic</p>
                  <p className="text-[10px] text-stone-400">claude-3-5-sonnet-20241022</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[10px] font-medium">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> 정상
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-stone-100 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-bold text-stone-600">OA</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-800">OpenAI</p>
                  <p className="text-[10px] text-stone-400">gpt-4o-2024-11-20</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[10px] font-medium">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> 정상
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-stone-100 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-bold text-stone-600">GG</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-800">Google</p>
                  <p className="text-[10px] text-stone-400">gemini-1.5-pro-002</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[10px] font-medium">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> 정상
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100">
            <p className="text-[10px] text-stone-400">마지막 헬스체크: 1분 전</p>
          </div>
        </div>

      </div>
    </div>

    {/* 하단: 에이전트 성능 테이블 */}
    {/* API: GET /api/workspace/dashboard/agent-performance */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>에이전트별 성능 (오늘)</h2>
        <a href="/app/performance" className="text-stone-600 hover:bg-stone-100 rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 flex items-center gap-1">
          전력분석 →
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-400">에이전트</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-400">역할</th>
              <th className="text-center px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-400">오늘 작업</th>
              <th className="text-center px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-400">성공률</th>
              <th className="text-center px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-400">비용</th>
              <th className="text-center px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-400">상태</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-400">평균 응답</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            <tr className="hover:bg-stone-50 transition-colors cursor-pointer">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-violet-700 font-semibold text-xs">이</span>
                  </div>
                  <span className="text-sm font-medium text-stone-800">이나경</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-xs text-stone-500">비서실장</td>
              <td className="px-5 py-3.5 text-center text-sm font-semibold text-stone-800">12</td>
              <td className="px-5 py-3.5 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-16 bg-stone-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: "92%"}}></div>
                  </div>
                  <span className="text-xs text-stone-700 font-medium">92%</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-center text-xs font-mono text-stone-700">$1.24</td>
              <td className="px-5 py-3.5 text-center">
                <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 rounded-full px-2 py-0.5 text-[10px] font-medium">
                  <span className="w-1 h-1 bg-orange-500 rounded-full animate-blink"></span> 작업 중
                </span>
              </td>
              <td className="px-5 py-3.5 text-right text-xs text-stone-500">8.2초</td>
            </tr>
            <tr className="hover:bg-stone-50 transition-colors cursor-pointer">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-700 font-semibold text-xs">박</span>
                  </div>
                  <span className="text-sm font-medium text-stone-800">박준형</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-xs text-stone-500">마케팅팀장</td>
              <td className="px-5 py-3.5 text-center text-sm font-semibold text-stone-800">8</td>
              <td className="px-5 py-3.5 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-16 bg-stone-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: "100%"}}></div>
                  </div>
                  <span className="text-xs text-stone-700 font-medium">100%</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-center text-xs font-mono text-stone-700">$0.87</td>
              <td className="px-5 py-3.5 text-center">
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[10px] font-medium">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> 대기 중
                </span>
              </td>
              <td className="px-5 py-3.5 text-right text-xs text-stone-500">14.7초</td>
            </tr>
            <tr className="hover:bg-stone-50 transition-colors cursor-pointer">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-semibold text-xs">김</span>
                  </div>
                  <span className="text-sm font-medium text-stone-800">김재원</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-xs text-stone-500">투자분석가</td>
              <td className="px-5 py-3.5 text-center text-sm font-semibold text-stone-800">5</td>
              <td className="px-5 py-3.5 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-16 bg-stone-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: "80%"}}></div>
                  </div>
                  <span className="text-xs text-stone-700 font-medium">80%</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-center text-xs font-mono text-stone-700">$2.10</td>
              <td className="px-5 py-3.5 text-center">
                <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 rounded-full px-2 py-0.5 text-[10px] font-medium">
                  <span className="w-1 h-1 bg-orange-500 rounded-full animate-blink"></span> 작업 중
                </span>
              </td>
              <td className="px-5 py-3.5 text-right text-xs text-stone-500">32.1초</td>
            </tr>
            <tr className="hover:bg-stone-50 transition-colors cursor-pointer">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-700 font-semibold text-xs">이</span>
                  </div>
                  <span className="text-sm font-medium text-stone-800">이소연</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-xs text-stone-500">법무전문가</td>
              <td className="px-5 py-3.5 text-center text-sm font-semibold text-stone-800">3</td>
              <td className="px-5 py-3.5 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-16 bg-stone-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: "100%"}}></div>
                  </div>
                  <span className="text-xs text-stone-700 font-medium">100%</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-center text-xs font-mono text-stone-700">$0.45</td>
              <td className="px-5 py-3.5 text-center">
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[10px] font-medium">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> 대기 중
                </span>
              </td>
              <td className="px-5 py-3.5 text-right text-xs text-stone-500">28.4초</td>
            </tr>
            <tr className="hover:bg-stone-50 transition-colors cursor-pointer">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-700 font-semibold text-xs">최</span>
                  </div>
                  <span className="text-sm font-medium text-stone-800">최민지</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-xs text-stone-500">카피라이터</td>
              <td className="px-5 py-3.5 text-center text-sm font-semibold text-stone-800">15</td>
              <td className="px-5 py-3.5 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-16 bg-stone-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: "93%"}}></div>
                  </div>
                  <span className="text-xs text-stone-700 font-medium">93%</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-center text-xs font-mono text-stone-700">$0.32</td>
              <td className="px-5 py-3.5 text-center">
                <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 rounded-full px-2 py-0.5 text-[10px] font-medium">
                  <span className="w-1 h-1 bg-orange-500 rounded-full animate-blink"></span> 작업 중
                </span>
              </td>
              <td className="px-5 py-3.5 text-right text-xs text-stone-500">6.8초</td>
            </tr>
            <tr className="hover:bg-stone-50 transition-colors cursor-pointer">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-stone-500 font-semibold text-xs">한</span>
                  </div>
                  <span className="text-sm font-medium text-stone-800">한지훈</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-xs text-stone-500">데이터분석가</td>
              <td className="px-5 py-3.5 text-center text-sm font-semibold text-stone-800">4</td>
              <td className="px-5 py-3.5 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-16 bg-stone-100 rounded-full h-1.5">
                    <div className="bg-amber-400 h-1.5 rounded-full" style={{width: "75%"}}></div>
                  </div>
                  <span className="text-xs text-stone-700 font-medium">75%</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-center text-xs font-mono text-stone-700">$0.78</td>
              <td className="px-5 py-3.5 text-center">
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 rounded-full px-2 py-0.5 text-[10px] font-medium">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span> 오류
                </span>
              </td>
              <td className="px-5 py-3.5 text-right text-xs text-stone-500">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </main>
</div>
    </>
  );
}

export default AppDashboard;
