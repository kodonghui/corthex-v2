"use client";
import React from "react";
import { Activity, AlertCircle, AlertTriangle, BarChart2, Bell, BookOpen, Bot, Briefcase, Building2, Calendar, CreditCard, Download, Eye, FileText, Folder, Home, Key, LayoutDashboard, List, MessageCircle, PieChart, Rss, Send, Settings, Settings2, Share2, Shield, Terminal, TrendingUp, Users, Zap } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #fafaf9; }
    ::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 3px; }`;

function AppCosts() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      {/* SIDEBAR */}
<aside className="w-60 fixed left-0 top-0 bottom-0 bg-white border-r border-stone-200 flex flex-col z-20">
  <div className="p-4 border-b border-stone-200">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">C</span>
      </div>
      <span className="font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
    </div>
  </div>
  <div className="px-4 py-3 border-b border-stone-200">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center">
        <span className="text-violet-700 text-xs font-semibold">김</span>
      </div>
      <div>
        <div className="text-xs font-semibold text-stone-900">김대표</div>
        <div className="text-[10px] text-stone-400">Owner</div>
      </div>
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
    <a href="/app/costs" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-violet-50 text-violet-700 text-sm font-medium"><CreditCard className="w-4 h-4" />비용 관리</a>
    <a href="/app/activity-log" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Activity className="w-4 h-4" />활동 로그</a>
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
      <h1 className="text-xl font-bold text-stone-900">비용 관리</h1>
      <p className="text-sm text-stone-500 mt-0.5">CLI 토큰 사용 비용 추적 및 예산 관리</p>
    </div>
    <div className="flex items-center gap-2">
      {/* API: GET /api/workspace/dashboard/budget */}
      <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-stone-50 transition-all duration-150">
        <Download className="w-4 h-4" />내보내기
      </button>
      <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all duration-150">
        <Settings2 className="w-4 h-4" />예산 설정
      </button>
    </div>
  </div>

  {/* KPI Cards — API: GET /api/workspace/dashboard/usage */}
  <div className="grid grid-cols-4 gap-4 mb-6">
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-stone-500">오늘 비용</span>
        <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-violet-600" />
        </div>
      </div>
      <div className="text-2xl font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>$2.34</div>
      <div className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />어제 대비 +$0.12
      </div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-stone-500">이번달 누계</span>
        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
          <Calendar className="w-4 h-4 text-emerald-600" />
        </div>
      </div>
      <div className="text-2xl font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>$12.40</div>
      <div className="text-xs text-stone-500 mt-1.5">₩16,120 (환율 1,300원)</div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-stone-500">예산 대비</span>
        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
          <PieChart className="w-4 h-4 text-amber-600" />
        </div>
      </div>
      <div className="text-2xl font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>62%</div>
      <div className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />예산 소진 주의
      </div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-stone-500">예상 월말</span>
        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-red-500" />
        </div>
      </div>
      <div className="text-2xl font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>$20.10</div>
      <div className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />예산 $0.10 초과 예상
      </div>
    </div>
  </div>

  {/* Budget Progress */}
  <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 mb-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-bold text-stone-900 text-sm">월 예산 진행률</h3>
        <p className="text-xs text-stone-500 mt-0.5">2026년 3월 — 이번달 10일째 / 31일</p>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-stone-900">₩12,400 <span className="text-stone-400 font-normal text-sm">/ ₩20,000</span></div>
        <div className="text-xs text-amber-600 font-medium mt-0.5">62% 소진 · 잔여 ₩7,600</div>
      </div>
    </div>
    <div className="w-full bg-stone-100 rounded-full h-3 mb-2 relative">
      <div className="bg-amber-400 h-3 rounded-full transition-all duration-500" style={{"width":"62%"}}></div>
    </div>
    <div className="flex justify-between text-xs text-stone-400 mt-1 mb-3">
      <span>₩0</span>
      <span className="text-amber-600 font-medium">현재 ₩12,400 (62%)</span>
      <span>예산 ₩20,000</span>
    </div>
    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
      <p className="text-xs text-amber-700">
        <span className="font-semibold">⚠ 주의:</span> 현재 소비 속도(일 $1.24)가 계속되면 월말 예산을 <strong>$0.10</strong> 초과할 것으로 예상됩니다. 비용이 높은 에이전트(김재원 $0.029/회)의 호출 빈도 조절을 권장합니다.
      </p>
    </div>
  </div>

  {/* 7-Day Chart */}
  <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 mb-6">
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-bold text-stone-900 text-sm">비용 추이 — 최근 7일</h3>
      <span className="bg-violet-50 text-violet-700 rounded-full px-2.5 py-0.5 text-xs font-medium">일별 집계</span>
    </div>
    <div className="flex items-end gap-3" style={{"height":"120px"}}>
      <div className="flex-1 flex flex-col items-center gap-1">
        <span className="text-[10px] text-stone-500" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$1.42</span>
        <div className="w-full bg-violet-200 rounded-t-md" style={{"height":"48px"}}></div>
        <span className="text-[10px] text-stone-400">3/4</span>
      </div>
      <div className="flex-1 flex flex-col items-center gap-1">
        <span className="text-[10px] text-stone-500" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$1.85</span>
        <div className="w-full bg-violet-200 rounded-t-md" style={{"height":"62px"}}></div>
        <span className="text-[10px] text-stone-400">3/5</span>
      </div>
      <div className="flex-1 flex flex-col items-center gap-1">
        <span className="text-[10px] text-stone-500" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$1.21</span>
        <div className="w-full bg-violet-200 rounded-t-md" style={{"height":"40px"}}></div>
        <span className="text-[10px] text-stone-400">3/6</span>
      </div>
      <div className="flex-1 flex flex-col items-center gap-1">
        <span className="text-[10px] text-stone-500" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$2.10</span>
        <div className="w-full bg-violet-300 rounded-t-md" style={{"height":"70px"}}></div>
        <span className="text-[10px] text-stone-400">3/7</span>
      </div>
      <div className="flex-1 flex flex-col items-center gap-1">
        <span className="text-[10px] text-stone-500" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$1.68</span>
        <div className="w-full bg-violet-200 rounded-t-md" style={{"height":"56px"}}></div>
        <span className="text-[10px] text-stone-400">3/8</span>
      </div>
      <div className="flex-1 flex flex-col items-center gap-1">
        <span className="text-[10px] text-stone-500" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$2.22</span>
        <div className="w-full bg-violet-300 rounded-t-md" style={{"height":"74px"}}></div>
        <span className="text-[10px] text-stone-400">3/9</span>
      </div>
      <div className="flex-1 flex flex-col items-center gap-1">
        <span className="text-[10px] text-violet-700 font-semibold" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$2.34</span>
        <div className="w-full bg-violet-600 rounded-t-md" style={{"height":"78px"}}></div>
        <span className="text-[10px] text-violet-600 font-semibold">오늘</span>
      </div>
    </div>
  </div>

  {/* Tabs + Table */}
  <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
    <div className="flex gap-0 border-b border-stone-200 px-5 pt-4">
      <button id="tab-agent" onClick="showTab('agent')" className="px-4 py-2 text-sm font-semibold text-violet-700 border-b-2 border-violet-600 -mb-px mr-1">에이전트별</button>
      <button id="tab-model" onClick="showTab('model')" className="px-4 py-2 text-sm font-medium text-stone-500 border-b-2 border-transparent -mb-px mr-1 hover:text-stone-700">모델별</button>
      <button id="tab-dept" onClick="showTab('dept')" className="px-4 py-2 text-sm font-medium text-stone-500 border-b-2 border-transparent -mb-px hover:text-stone-700">부서별</button>
    </div>

    {/* Agent Table — API: GET /api/workspace/dashboard/usage */}
    <div id="content-agent">
      <table className="w-full">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-100">
            <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">에이전트</th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">이번달 비용</th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">호출 수</th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">평균 비용</th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">비중</th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500 w-28">비중 그래프</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-xs font-semibold text-violet-700">김</span></div>
                <div><div className="text-sm font-medium text-stone-900">김재원</div><div className="text-xs text-stone-400">전략부서 · Specialist</div></div>
              </div>
            </td>
            <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold text-stone-900" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$4.20</span></td>
            <td className="px-4 py-3.5 text-right"><span className="text-sm text-stone-600">145회</span></td>
            <td className="px-4 py-3.5 text-right"><span className="text-sm text-stone-600" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$0.029</span></td>
            <td className="px-4 py-3.5 text-right"><span className="bg-violet-50 text-violet-700 rounded-full px-2.5 py-0.5 text-xs font-medium">34%</span></td>
            <td className="px-4 py-3.5"><div className="w-full bg-stone-100 rounded-full h-1.5"><div className="bg-violet-500 h-1.5 rounded-full" style={{"width":"34%"}}></div></div></td>
          </tr>
          <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-xs font-semibold text-blue-700">박</span></div>
                <div><div className="text-sm font-medium text-stone-900">박준형</div><div className="text-xs text-stone-400">마케팅부서 · Manager</div></div>
              </div>
            </td>
            <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold text-stone-900" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$2.80</span></td>
            <td className="px-4 py-3.5 text-right"><span className="text-sm text-stone-600">220회</span></td>
            <td className="px-4 py-3.5 text-right"><span className="text-sm text-stone-600" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$0.013</span></td>
            <td className="px-4 py-3.5 text-right"><span className="bg-violet-50 text-violet-700 rounded-full px-2.5 py-0.5 text-xs font-medium">23%</span></td>
            <td className="px-4 py-3.5"><div className="w-full bg-stone-100 rounded-full h-1.5"><div className="bg-violet-400 h-1.5 rounded-full" style={{"width":"23%"}}></div></div></td>
          </tr>
          <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-xs font-semibold text-emerald-700">이</span></div>
                <div><div className="text-sm font-medium text-stone-900">이나경</div><div className="text-xs text-stone-400">비서실 · Manager</div></div>
              </div>
            </td>
            <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold text-stone-900" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$2.30</span></td>
            <td className="px-4 py-3.5 text-right"><span className="text-sm text-stone-600">380회</span></td>
            <td className="px-4 py-3.5 text-right"><span className="text-sm text-stone-600" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$0.006</span></td>
            <td className="px-4 py-3.5 text-right"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">19%</span></td>
            <td className="px-4 py-3.5"><div className="w-full bg-stone-100 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{"width":"19%"}}></div></div></td>
          </tr>
          <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-xs font-semibold text-amber-700">최</span></div>
                <div><div className="text-sm font-medium text-stone-900">최민지</div><div className="text-xs text-stone-400">마케팅부서 · Worker</div></div>
              </div>
            </td>
            <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold text-stone-900" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$1.90</span></td>
            <td className="px-4 py-3.5 text-right"><span className="text-sm text-stone-600">290회</span></td>
            <td className="px-4 py-3.5 text-right"><span className="text-sm text-stone-600" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$0.007</span></td>
            <td className="px-4 py-3.5 text-right"><span className="bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5 text-xs font-medium">15%</span></td>
            <td className="px-4 py-3.5"><div className="w-full bg-stone-100 rounded-full h-1.5"><div className="bg-amber-400 h-1.5 rounded-full" style={{"width":"15%"}}></div></div></td>
          </tr>
          <tr className="hover:bg-stone-50/50 transition-colors">
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-xs font-semibold text-rose-700">이</span></div>
                <div><div className="text-sm font-medium text-stone-900">이소연</div><div className="text-xs text-stone-400">법무팀 · Specialist</div></div>
              </div>
            </td>
            <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold text-stone-900" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$1.20</span></td>
            <td className="px-4 py-3.5 text-right"><span className="text-sm text-stone-600">85회</span></td>
            <td className="px-4 py-3.5 text-right"><span className="text-sm text-stone-600" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$0.014</span></td>
            <td className="px-4 py-3.5 text-right"><span className="bg-stone-100 text-stone-600 rounded-full px-2.5 py-0.5 text-xs font-medium">10%</span></td>
            <td className="px-4 py-3.5"><div className="w-full bg-stone-100 rounded-full h-1.5"><div className="bg-stone-400 h-1.5 rounded-full" style={{"width":"10%"}}></div></div></td>
          </tr>
        </tbody>
      </table>
      <div className="px-5 py-3.5 border-t border-stone-100 flex justify-between items-center bg-stone-50/50 rounded-b-xl">
        <span className="text-xs text-stone-400">총 5명 에이전트 · 1,120회 호출</span>
        <span className="text-sm font-bold text-stone-700" style={{"fontFamily":"'JetBrains Mono',monospace"}}>합계: $12.40</span>
      </div>
    </div>

    {/* Model Tab */}
    <div id="content-model" className="hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-100">
            <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">모델</th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">이번달 비용</th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">호출 수</th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">비중</th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500 w-28">비중 그래프</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-stone-100 hover:bg-stone-50/50"><td className="px-5 py-3.5"><div className="text-sm font-medium text-stone-900">claude-sonnet-4</div><div className="text-xs text-stone-400">Anthropic</div></td><td className="px-4 py-3.5 text-right text-sm font-semibold text-stone-900" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$8.20</td><td className="px-4 py-3.5 text-right text-sm text-stone-600">830회</td><td className="px-4 py-3.5 text-right"><span className="bg-violet-50 text-violet-700 rounded-full px-2.5 py-0.5 text-xs font-medium">66%</span></td><td className="px-4 py-3.5"><div className="w-full bg-stone-100 rounded-full h-1.5"><div className="bg-violet-500 h-1.5 rounded-full" style={{"width":"66%"}}></div></div></td></tr>
          <tr className="border-b border-stone-100 hover:bg-stone-50/50"><td className="px-5 py-3.5"><div className="text-sm font-medium text-stone-900">claude-haiku-3.5</div><div className="text-xs text-stone-400">Anthropic</div></td><td className="px-4 py-3.5 text-right text-sm font-semibold text-stone-900" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$2.80</td><td className="px-4 py-3.5 text-right text-sm text-stone-600">210회</td><td className="px-4 py-3.5 text-right"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">23%</span></td><td className="px-4 py-3.5"><div className="w-full bg-stone-100 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{"width":"23%"}}></div></div></td></tr>
          <tr className="hover:bg-stone-50/50"><td className="px-5 py-3.5"><div className="text-sm font-medium text-stone-900">gpt-4o</div><div className="text-xs text-stone-400">OpenAI</div></td><td className="px-4 py-3.5 text-right text-sm font-semibold text-stone-900" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$1.40</td><td className="px-4 py-3.5 text-right text-sm text-stone-600">80회</td><td className="px-4 py-3.5 text-right"><span className="bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5 text-xs font-medium">11%</span></td><td className="px-4 py-3.5"><div className="w-full bg-stone-100 rounded-full h-1.5"><div className="bg-amber-400 h-1.5 rounded-full" style={{"width":"11%"}}></div></div></td></tr>
        </tbody>
      </table>
      <div className="px-5 py-3.5 border-t border-stone-100 bg-stone-50/50 rounded-b-xl flex justify-between"><span className="text-xs text-stone-400">3가지 모델 사용 중</span><span className="text-sm font-bold text-stone-700" style={{"fontFamily":"'JetBrains Mono',monospace"}}>합계: $12.40</span></div>
    </div>

    {/* Dept Tab */}
    <div id="content-dept" className="hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-100">
            <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">부서</th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">이번달 비용</th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">에이전트 수</th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">비중</th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500 w-28">비중 그래프</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-stone-100 hover:bg-stone-50/50"><td className="px-5 py-3.5 text-sm font-medium text-stone-900">마케팅부서</td><td className="px-4 py-3.5 text-right text-sm font-semibold text-stone-900" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$4.70</td><td className="px-4 py-3.5 text-right text-sm text-stone-600">2명</td><td className="px-4 py-3.5 text-right"><span className="bg-violet-50 text-violet-700 rounded-full px-2.5 py-0.5 text-xs font-medium">38%</span></td><td className="px-4 py-3.5"><div className="w-full bg-stone-100 rounded-full h-1.5"><div className="bg-violet-500 h-1.5 rounded-full" style={{"width":"38%"}}></div></div></td></tr>
          <tr className="border-b border-stone-100 hover:bg-stone-50/50"><td className="px-5 py-3.5 text-sm font-medium text-stone-900">전략부서</td><td className="px-4 py-3.5 text-right text-sm font-semibold text-stone-900" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$4.20</td><td className="px-4 py-3.5 text-right text-sm text-stone-600">1명</td><td className="px-4 py-3.5 text-right"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">34%</span></td><td className="px-4 py-3.5"><div className="w-full bg-stone-100 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{"width":"34%"}}></div></div></td></tr>
          <tr className="border-b border-stone-100 hover:bg-stone-50/50"><td className="px-5 py-3.5 text-sm font-medium text-stone-900">비서실</td><td className="px-4 py-3.5 text-right text-sm font-semibold text-stone-900" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$2.30</td><td className="px-4 py-3.5 text-right text-sm text-stone-600">1명</td><td className="px-4 py-3.5 text-right"><span className="bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5 text-xs font-medium">19%</span></td><td className="px-4 py-3.5"><div className="w-full bg-stone-100 rounded-full h-1.5"><div className="bg-amber-400 h-1.5 rounded-full" style={{"width":"19%"}}></div></div></td></tr>
          <tr className="hover:bg-stone-50/50"><td className="px-5 py-3.5 text-sm font-medium text-stone-900">법무팀</td><td className="px-4 py-3.5 text-right text-sm font-semibold text-stone-900" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$1.20</td><td className="px-4 py-3.5 text-right text-sm text-stone-600">1명</td><td className="px-4 py-3.5 text-right"><span className="bg-stone-100 text-stone-600 rounded-full px-2.5 py-0.5 text-xs font-medium">10%</span></td><td className="px-4 py-3.5"><div className="w-full bg-stone-100 rounded-full h-1.5"><div className="bg-stone-400 h-1.5 rounded-full" style={{"width":"10%"}}></div></div></td></tr>
        </tbody>
      </table>
      <div className="px-5 py-3.5 border-t border-stone-100 bg-stone-50/50 rounded-b-xl flex justify-between"><span className="text-xs text-stone-400">4개 부서</span><span className="text-sm font-bold text-stone-700" style={{"fontFamily":"'JetBrains Mono',monospace"}}>합계: $12.40</span></div>
    </div>
  </div>
</main>
    </>
  );
}

export default AppCosts;
