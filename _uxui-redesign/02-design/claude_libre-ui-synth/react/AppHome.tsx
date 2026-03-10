"use client";
import React from "react";
import { Activity, ArrowRight, BarChart2, Bell, BookOpen, Building2, Calendar, CheckCircle2, ChevronsUpDown, Clock, DollarSign, Eye, FileText, Folder, GitBranch, Home, Image, Key, LayoutDashboard, Lock, Mail, Megaphone, MessageCircle, MessagesSquare, Scale, ScrollText, Search, Send, Settings, Share2, Star, Terminal, TrendingUp, Users } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1, h2, h3, h4, h5, h6, .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono, code, pre { font-family: 'JetBrains Mono', monospace; }
    @keyframes blink-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }
    .animate-blink { animation: blink-pulse 2s ease-in-out infinite; }`;

function AppHome() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      {/* 사이드바 */}
<aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-10">
  <div className="h-14 flex items-center px-4 border-b border-stone-200">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">C</span>
      </div>
      <span className="font-bold text-stone-900 text-[15px]" style={{"fontFamily":"'Plus Jakarta Sans', sans-serif"}}>CORTHEX</span>
    </div>
  </div>
  <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
    <div className="mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 px-3 mb-2">워크스페이스</p>
      <a href="/app/home" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm bg-violet-50 text-violet-700 font-medium group">
        <Home className="w-4 h-4 flex-shrink-0" /><span>홈</span>
      </a>
      <a href="/app/command-center" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 font-normal transition-colors duration-150 group">
        <Terminal className="w-4 h-4 flex-shrink-0" /><span>사령관실</span>
      </a>
      <a href="/app/chat" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150 group">
        <MessageCircle className="w-4 h-4 flex-shrink-0" /><span>채팅</span>
      </a>
      <a href="/app/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150 group">
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
  
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <span>홈</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative text-stone-600 hover:bg-stone-100 rounded-lg px-3 py-1.5 text-sm transition-colors duration-150">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>
        <a href="/app/command-center" className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span>새 명령</span>
        </a>
      </div>
    </div>
  

  {/* 콘텐츠 */}
  <main className="p-6 space-y-6">

    {/* API: GET /api/workspace/home/summary */}
    {/* 웰컴 배너 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 flex items-start justify-between">
      <div>
        <h1 className="text-[32px] font-bold tracking-tight text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans', sans-serif"}}>
          안녕하세요, 김대표님 👋
        </h1>
        <p className="text-sm text-stone-500 mt-1.5">
          2026년 3월 10일 (화) · 오늘도 CORTHEX와 함께 최고의 하루를 만들어보세요.
        </p>
        <div className="flex items-center gap-3 mt-4">
          <a href="/app/command-center" className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 flex items-center gap-2">
            <Terminal className="w-4 h-4" /> 사령관실 열기
          </a>
          <a href="/app/dashboard" className="bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 flex items-center gap-2">
            <BarChart2 className="w-4 h-4" /> 대시보드 보기
          </a>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-blink"></span>
          전체 시스템 정상
        </span>
        <p className="text-xs text-stone-400 mt-1.5">마지막 동기화: 방금 전</p>
        <p className="text-xs text-stone-400 mt-0.5">활성 에이전트: 18 / 24</p>
      </div>
    </div>

    {/* API: GET /api/workspace/home/kpi */}
    {/* KPI 카드 4개 */}
    <div className="grid grid-cols-4 gap-4">
      {/* 총 에이전트 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">총 에이전트</p>
          <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
            <Users className="w-4.5 h-4.5 text-violet-600" />
          </div>
        </div>
        <p className="text-[32px] font-bold tracking-tight text-stone-900 leading-none" style={{"fontFamily":"'Plus Jakarta Sans', sans-serif"}}>24</p>
        <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> 지난달 대비 +3명
        </p>
        <div className="flex gap-1.5 mt-3">
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[10px] font-medium">
            <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> 온라인 18
          </span>
          <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-500 rounded-full px-2 py-0.5 text-[10px] font-medium">
            오프라인 6
          </span>
        </div>
      </div>

      {/* 오늘 완료 작업 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">오늘 완료 작업</p>
          <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-4.5 h-4.5 text-orange-500" />
          </div>
        </div>
        <p className="text-[32px] font-bold tracking-tight text-stone-900 leading-none" style={{"fontFamily":"'Plus Jakarta Sans', sans-serif"}}>47</p>
        <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> 어제 대비 +12건
        </p>
        <div className="mt-3">
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div className="bg-orange-500 h-1.5 rounded-full" style={{"width":"78%"}}></div>
          </div>
          <p className="text-[10px] text-stone-400 mt-1">목표 60개 중 47개 (78%)</p>
        </div>
      </div>

      {/* 이번 달 비용 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">이번 달 비용</p>
          <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4.5 h-4.5 text-emerald-600" />
          </div>
        </div>
        <p className="text-[32px] font-bold tracking-tight text-stone-900 leading-none" style={{"fontFamily":"'Plus Jakarta Sans', sans-serif"}}>$12.40</p>
        <p className="text-xs text-stone-500 mt-2 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> 예산 $50 중 24.8%
        </p>
        <div className="mt-3">
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{"width":"24.8%"}}></div>
          </div>
          <p className="text-[10px] text-stone-400 mt-1">잔여 예산 $37.60</p>
        </div>
      </div>

      {/* 만족도 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">에이전트 만족도</p>
          <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
            <Star className="w-4.5 h-4.5 text-violet-600" />
          </div>
        </div>
        <p className="text-[32px] font-bold tracking-tight text-stone-900 leading-none" style={{"fontFamily":"'Plus Jakarta Sans', sans-serif"}}>89%</p>
        <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> 지난주 대비 +4%p
        </p>
        <div className="mt-3 flex gap-0.5 h-4">
          <div className="bg-violet-600 rounded-l-sm h-full" style={{"width":"89%"}}></div>
          <div className="bg-stone-100 rounded-r-sm h-full" style={{"width":"11%"}}></div>
        </div>
      </div>
    </div>

    {/* API: POST /api/workspace/command-center/commands */}
    {/* 빠른 명령 입력 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
      <h2 className="text-lg font-semibold text-stone-900 mb-3" style={{"fontFamily":"'Plus Jakarta Sans', sans-serif"}}>
        오늘의 첫 명령을 내려보세요
      </h2>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="예: 오늘 마케팅 동향을 분석하고 SNS 게시물 3개를 작성해줘"
          className="flex-1 rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-stone-800 placeholder-stone-400"
        />
        <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-150 flex items-center gap-2 whitespace-nowrap">
          <Send className="w-4 h-4" /> 실행
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-3 items-center">
        <p className="text-xs text-stone-400">빠른 선택:</p>
        <button className="bg-white border border-stone-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 text-stone-600 rounded-full px-3 py-1 text-xs font-medium transition-all duration-150">
          📊 오늘 시장 동향 분석
        </button>
        <button className="bg-white border border-stone-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 text-stone-600 rounded-full px-3 py-1 text-xs font-medium transition-all duration-150">
          📱 SNS 콘텐츠 3개 작성
        </button>
        <button className="bg-white border border-stone-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 text-stone-600 rounded-full px-3 py-1 text-xs font-medium transition-all duration-150">
          💰 투자 포트폴리오 검토
        </button>
        <button className="bg-white border border-stone-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 text-stone-600 rounded-full px-3 py-1 text-xs font-medium transition-all duration-150">
          📋 일일 업무 보고서 생성
        </button>
        <button className="bg-white border border-stone-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 text-stone-600 rounded-full px-3 py-1 text-xs font-medium transition-all duration-150">
          🔍 경쟁사 모니터링
        </button>
      </div>
    </div>

    {/* 하단 2열 */}
    <div className="grid grid-cols-3 gap-4">

      {/* API: GET /api/workspace/agents/status */}
      {/* 에이전트 현황 (2/3) */}
      <div className="col-span-2 bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans', sans-serif"}}>에이전트 현황</h2>
          <a href="/app/agents" className="text-stone-600 hover:bg-stone-100 rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 flex items-center gap-1">
            전체 보기 <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="divide-y divide-stone-100">
          {/* 이나경 */}
          <div className="px-5 py-3.5 flex items-center gap-4 hover:bg-stone-50 transition-colors duration-150 cursor-pointer">
            <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-violet-700 font-semibold text-sm">이</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800">이나경</p>
              <p className="text-xs text-stone-400">비서실장 · claude-3-5-sonnet-20241022</p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5 text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-blink"></span> 작업 중
            </span>
            <div className="text-right min-w-[80px]">
              <p className="text-xs font-medium text-stone-700">12 완료</p>
              <p className="text-[10px] text-stone-400">오늘 $1.24</p>
            </div>
          </div>
          {/* 박준형 */}
          <div className="px-5 py-3.5 flex items-center gap-4 hover:bg-stone-50 transition-colors duration-150 cursor-pointer">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-700 font-semibold text-sm">박</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800">박준형</p>
              <p className="text-xs text-stone-400">마케팅팀장 · claude-3-5-sonnet-20241022</p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> 대기 중
            </span>
            <div className="text-right min-w-[80px]">
              <p className="text-xs font-medium text-stone-700">8 완료</p>
              <p className="text-[10px] text-stone-400">오늘 $0.87</p>
            </div>
          </div>
          {/* 김재원 */}
          <div className="px-5 py-3.5 flex items-center gap-4 hover:bg-stone-50 transition-colors duration-150 cursor-pointer">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-700 font-semibold text-sm">김</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800">김재원</p>
              <p className="text-xs text-stone-400">투자분석가 · gpt-4o-2024-11-20</p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5 text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-blink"></span> 작업 중
            </span>
            <div className="text-right min-w-[80px]">
              <p className="text-xs font-medium text-stone-700">5 완료</p>
              <p className="text-[10px] text-stone-400">오늘 $2.10</p>
            </div>
          </div>
          {/* 이소연 */}
          <div className="px-5 py-3.5 flex items-center gap-4 hover:bg-stone-50 transition-colors duration-150 cursor-pointer">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-red-700 font-semibold text-sm">이</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800">이소연</p>
              <p className="text-xs text-stone-400">법무전문가 · claude-3-opus-20240229</p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> 대기 중
            </span>
            <div className="text-right min-w-[80px]">
              <p className="text-xs font-medium text-stone-700">3 완료</p>
              <p className="text-[10px] text-stone-400">오늘 $0.45</p>
            </div>
          </div>
          {/* 최민지 */}
          <div className="px-5 py-3.5 flex items-center gap-4 hover:bg-stone-50 transition-colors duration-150 cursor-pointer">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-amber-700 font-semibold text-sm">최</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800">최민지</p>
              <p className="text-xs text-stone-400">카피라이터 · claude-3-5-haiku-20241022</p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5 text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-blink"></span> 작업 중
            </span>
            <div className="text-right min-w-[80px]">
              <p className="text-xs font-medium text-stone-700">15 완료</p>
              <p className="text-[10px] text-stone-400">오늘 $0.32</p>
            </div>
          </div>
          {/* 한지훈 */}
          <div className="px-5 py-3.5 flex items-center gap-4 hover:bg-stone-50 transition-colors duration-150 cursor-pointer">
            <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-stone-500 font-semibold text-sm">한</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800">한지훈</p>
              <p className="text-xs text-stone-400">데이터분석가 · gemini-1.5-pro-002</p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> 오류
            </span>
            <div className="text-right min-w-[80px]">
              <p className="text-xs font-medium text-stone-700">4 완료</p>
              <p className="text-[10px] text-stone-400">오늘 $0.78</p>
            </div>
          </div>
        </div>
      </div>

      {/* 우측 패널 */}
      <div className="space-y-4">
        {/* API: GET /api/workspace/reports/recent */}
        {/* 최근 보고서 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans', sans-serif"}}>최근 보고서</h2>
            <a href="/app/reports" className="text-xs text-stone-400 hover:text-stone-600 transition-colors">전체 →</a>
          </div>
          <div className="divide-y divide-stone-100">
            <div className="px-5 py-3 hover:bg-stone-50 transition-colors cursor-pointer">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-stone-800 truncate">3월 마케팅 전략 보고서</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">박준형 · 2시간 전</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 hover:bg-stone-50 transition-colors cursor-pointer">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-stone-800 truncate">KOSPI 200 투자 분석</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">김재원 · 4시간 전</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 hover:bg-stone-50 transition-colors cursor-pointer">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Scale className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-stone-800 truncate">개인정보처리방침 개정안 검토</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">이소연 · 어제 17:30</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 퀵 액션 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-5">
          <h2 className="text-base font-semibold text-stone-900 mb-3" style={{"fontFamily":"'Plus Jakarta Sans', sans-serif"}}>퀵 액션</h2>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex flex-col items-center gap-2 p-3 rounded-lg border border-stone-200 hover:border-violet-200 hover:bg-violet-50 transition-all duration-150 group cursor-pointer">
              <div className="w-8 h-8 bg-violet-50 group-hover:bg-violet-100 rounded-lg flex items-center justify-center transition-colors">
                <Image className="w-4 h-4 text-violet-600" />
              </div>
              <span className="text-[11px] font-medium text-stone-600 group-hover:text-violet-700 transition-colors text-center leading-tight">이미지 생성</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-lg border border-stone-200 hover:border-violet-200 hover:bg-violet-50 transition-all duration-150 group cursor-pointer">
              <div className="w-8 h-8 bg-violet-50 group-hover:bg-violet-100 rounded-lg flex items-center justify-center transition-colors">
                <Share2 className="w-4 h-4 text-violet-600" />
              </div>
              <span className="text-[11px] font-medium text-stone-600 group-hover:text-violet-700 transition-colors text-center leading-tight">SNS 발행</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-lg border border-stone-200 hover:border-violet-200 hover:bg-violet-50 transition-all duration-150 group cursor-pointer">
              <div className="w-8 h-8 bg-violet-50 group-hover:bg-violet-100 rounded-lg flex items-center justify-center transition-colors">
                <TrendingUp className="w-4 h-4 text-violet-600" />
              </div>
              <span className="text-[11px] font-medium text-stone-600 group-hover:text-violet-700 transition-colors text-center leading-tight">투자 분석</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-lg border border-stone-200 hover:border-violet-200 hover:bg-violet-50 transition-all duration-150 group cursor-pointer">
              <div className="w-8 h-8 bg-violet-50 group-hover:bg-violet-100 rounded-lg flex items-center justify-center transition-colors">
                <FileText className="w-4 h-4 text-violet-600" />
              </div>
              <span className="text-[11px] font-medium text-stone-600 group-hover:text-violet-700 transition-colors text-center leading-tight">보고서 작성</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-lg border border-stone-200 hover:border-violet-200 hover:bg-violet-50 transition-all duration-150 group cursor-pointer">
              <div className="w-8 h-8 bg-violet-50 group-hover:bg-violet-100 rounded-lg flex items-center justify-center transition-colors">
                <Search className="w-4 h-4 text-violet-600" />
              </div>
              <span className="text-[11px] font-medium text-stone-600 group-hover:text-violet-700 transition-colors text-center leading-tight">시장 조사</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-lg border border-stone-200 hover:border-violet-200 hover:bg-violet-50 transition-all duration-150 group cursor-pointer">
              <div className="w-8 h-8 bg-violet-50 group-hover:bg-violet-100 rounded-lg flex items-center justify-center transition-colors">
                <Mail className="w-4 h-4 text-violet-600" />
              </div>
              <span className="text-[11px] font-medium text-stone-600 group-hover:text-violet-700 transition-colors text-center leading-tight">이메일 작성</span>
            </button>
          </div>
        </div>
      </div>
    </div>

  </main>
</div>
    </>
  );
}

export default AppHome;
