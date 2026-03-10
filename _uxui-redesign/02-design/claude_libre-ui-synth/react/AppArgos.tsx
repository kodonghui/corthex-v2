"use client";
import React from "react";
import { Activity, BarChart2, Bell, BookOpen, Bot, Briefcase, Building2, Check, Clock, CreditCard, DollarSign, Edit2, Eye, FileText, Folder, GitBranch, Home, Key, LayoutDashboard, List, MessageCircle, MinusCircle, Newspaper, Plus, Rss, Scale, Send, Settings, Share2, Shield, Terminal, TrendingDown, TrendingUp, Users, Zap } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #fafaf9; }
    ::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 3px; }`;

function AppArgos() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      {/* SIDEBAR */}
<aside className="w-60 fixed left-0 top-0 bottom-0 bg-white border-r border-stone-200 flex flex-col z-20">
  <div className="p-4 border-b border-stone-200">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">C</span></div>
      <span className="font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
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
    <a href="/app/activity-log" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Activity className="w-4 h-4" />활동 로그</a>
    <a href="/app/argos" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-violet-50 text-violet-700 text-sm font-medium"><Eye className="w-4 h-4" />아르고스</a>
    <a href="/app/credentials" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Key className="w-4 h-4" />크리덴셜</a>
    <a href="/app/ops-log" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><List className="w-4 h-4" />운영 로그</a>
    <a href="/app/settings" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm mt-2"><Settings className="w-4 h-4" />설정</a>
  </nav>
</aside>

{/* MAIN */}
<main className="ml-60 flex-1 p-6 min-h-screen">
  {/* Header */}
  <div className="flex items-center justify-between mb-5">
    <div>
      <h1 className="text-xl font-bold text-stone-900">아르고스</h1>
      <p className="text-sm text-stone-500 mt-0.5">실시간 모니터링 트리거 관리 — API: GET /api/workspace/argos/triggers</p>
    </div>
    {/* API: POST /api/workspace/argos/triggers */}
    <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all duration-150">
      <Plus className="w-4 h-4" />트리거 추가
    </button>
  </div>

  {/* System Status Banner */}
  <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 mb-5">
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse inline-block"></span>
        <span className="text-xs font-medium text-stone-700">데이터 파이프라인</span>
        <span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">정상</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse inline-block"></span>
        <span className="text-xs font-medium text-stone-700">AI 처리 엔진</span>
        <span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">정상</span>
      </div>
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-violet-500" />
        <span className="text-xs font-medium text-stone-700">활성 트리거</span>
        <span className="bg-violet-50 text-violet-700 rounded-full px-2.5 py-0.5 text-xs font-medium">12개</span>
      </div>
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-stone-400" />
        <span className="text-xs font-medium text-stone-700">오늘 비용</span>
        <span className="text-xs font-semibold text-stone-900" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$0.45</span>
      </div>
      <div className="ml-auto text-xs text-stone-400">마지막 갱신: 오늘 11:34:12</div>
    </div>
  </div>

  {/* Trigger Cards */}
  <div className="space-y-3 mb-6">
    <h3 className="text-sm font-semibold text-stone-900 mb-3">활성 트리거 목록</h3>

    {/* Trigger 1 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-4">
      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <TrendingUp className="w-5 h-5 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-stone-900">삼성전자 급등 알림</span>
          <span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">가격 트리거</span>
          <span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">활성</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <span className="flex items-center gap-1"><Bot className="w-3 h-3" />김재원</span>
          <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />삼성전자 +5% 이상 상승 시 즉시 보고서 생성</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium"><Zap className="w-3 h-3" />오늘 09:23 발동</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />쿨다운: 1시간</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="bg-white border border-stone-200 text-stone-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50"><Edit2 className="w-3 h-3 inline mr-1" />편집</button>
        {/* 토글 ON */}
        <div className="relative">
          <div className="w-10 h-5 bg-violet-600 rounded-full cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Trigger 2 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-4">
      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <Newspaper className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-stone-900">실시간 뉴스 분석</span>
          <span className="bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-xs font-medium">뉴스 트리거</span>
          <span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">활성</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <span className="flex items-center gap-1"><Bot className="w-3 h-3" />이나경</span>
          <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />키워드 "AI" OR "반도체" 감지 시 요약 생성</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium"><Zap className="w-3 h-3" />오늘 10:15 발동</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />쿨다운: 30분</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="bg-white border border-stone-200 text-stone-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50"><Edit2 className="w-3 h-3 inline mr-1" />편집</button>
        <div className="relative">
          <div className="w-10 h-5 bg-violet-600 rounded-full cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Trigger 3 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-4">
      <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <Clock className="w-5 h-5 text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-stone-900">매시간 시황 체크</span>
          <span className="bg-violet-50 text-violet-700 rounded-full px-2 py-0.5 text-xs font-medium">스케줄</span>
          <span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">활성</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <span className="flex items-center gap-1"><Bot className="w-3 h-3" />김재원</span>
          <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />매시간 정각 — KOSPI·KOSDAQ 시황 리포트</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium"><Zap className="w-3 h-3" />오늘 11:00 발동</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />다음: 12:00</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="bg-white border border-stone-200 text-stone-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50"><Edit2 className="w-3 h-3 inline mr-1" />편집</button>
        <div className="relative">
          <div className="w-10 h-5 bg-violet-600 rounded-full cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Trigger 4 — inactive */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-4 opacity-70">
      <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <TrendingDown className="w-5 h-5 text-stone-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-stone-700">NVIDIA 하락 경보</span>
          <span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">가격 트리거</span>
          <span className="bg-stone-100 text-stone-500 rounded-full px-2 py-0.5 text-xs font-medium">비활성</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-stone-400">
          <span className="flex items-center gap-1"><Bot className="w-3 h-3" />김재원</span>
          <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />NVIDIA -3% 이상 하락 시 즉시 알림</span>
          <span className="flex items-center gap-1"><MinusCircle className="w-3 h-3" />미발동</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />쿨다운: 2시간</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="bg-white border border-stone-200 text-stone-500 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50"><Edit2 className="w-3 h-3 inline mr-1" />편집</button>
        {/* 토글 OFF */}
        <div className="relative">
          <div className="w-10 h-5 bg-stone-200 rounded-full cursor-pointer">
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Trigger 5 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-4">
      <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <Scale className="w-5 h-5 text-rose-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-stone-900">주간 법령 모니터링</span>
          <span className="bg-violet-50 text-violet-700 rounded-full px-2 py-0.5 text-xs font-medium">스케줄</span>
          <span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">활성</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <span className="flex items-center gap-1"><Bot className="w-3 h-3" />이소연</span>
          <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />매주 월요일 09:00 — 금융·자본시장 법령 변경 사항 수집</span>
          <span className="flex items-center gap-1 text-stone-500 font-medium"><Check className="w-3 h-3" />어제 09:00 발동</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />다음: 3/17 09:00</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="bg-white border border-stone-200 text-stone-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50"><Edit2 className="w-3 h-3 inline mr-1" />편집</button>
        <div className="relative">
          <div className="w-10 h-5 bg-violet-600 rounded-full cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Recent Events Log — API: GET /api/workspace/argos/events */}
  <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
    <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
      <h3 className="font-bold text-stone-900 text-sm">최근 발동 이벤트 로그</h3>
      <a href="/app/activity-log" className="text-xs text-violet-600 hover:underline">전체 로그 보기 →</a>
    </div>
    <table className="w-full">
      <thead>
        <tr className="bg-stone-50 border-b border-stone-100">
          <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500 w-24">시각</th>
          <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">트리거</th>
          <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">에이전트</th>
          <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">처리 결과</th>
          <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500 w-16">상태</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-5 py-3 text-sm text-stone-500" style={{"fontFamily":"'JetBrains Mono',monospace"}}>11:00</td>
          <td className="px-4 py-3 text-sm text-stone-800">매시간 시황 체크</td>
          <td className="px-4 py-3 text-sm text-stone-600">김재원</td>
          <td className="px-4 py-3 text-sm text-stone-700">KOSPI +0.8% · 삼성전자 +5.2% 급등 — 리포트 2페이지 생성</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">완료</span></td>
        </tr>
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-5 py-3 text-sm text-stone-500" style={{"fontFamily":"'JetBrains Mono',monospace"}}>10:15</td>
          <td className="px-4 py-3 text-sm text-stone-800">실시간 뉴스 분석</td>
          <td className="px-4 py-3 text-sm text-stone-600">이나경</td>
          <td className="px-4 py-3 text-sm text-stone-700">"AI" 키워드 22건 감지 — 헤드라인 요약 생성 완료</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">완료</span></td>
        </tr>
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-5 py-3 text-sm text-stone-500" style={{"fontFamily":"'JetBrains Mono',monospace"}}>09:23</td>
          <td className="px-4 py-3 text-sm text-stone-800">삼성전자 급등 알림</td>
          <td className="px-4 py-3 text-sm text-stone-600">김재원</td>
          <td className="px-4 py-3 text-sm text-stone-700">삼성전자 +5.2% 감지 → 즉시 알림 + 분석 보고서 생성</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">완료</span></td>
        </tr>
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-5 py-3 text-sm text-stone-500" style={{"fontFamily":"'JetBrains Mono',monospace"}}>어제 09:00</td>
          <td className="px-4 py-3 text-sm text-stone-800">주간 법령 모니터링</td>
          <td className="px-4 py-3 text-sm text-stone-600">이소연</td>
          <td className="px-4 py-3 text-sm text-stone-700">자본시장법 개정안 2건 감지 — 법무 검토 의견서 작성</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">완료</span></td>
        </tr>
        <tr className="hover:bg-stone-50/50 transition-colors">
          <td className="px-5 py-3 text-sm text-stone-500" style={{"fontFamily":"'JetBrains Mono',monospace"}}>어제 15:30</td>
          <td className="px-4 py-3 text-sm text-stone-800">실시간 뉴스 분석</td>
          <td className="px-4 py-3 text-sm text-stone-600">이나경</td>
          <td className="px-4 py-3 text-sm text-stone-700">"반도체" 키워드 15건 감지 — 요약 완료</td>
          <td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">완료</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</main>
    </>
  );
}

export default AppArgos;
