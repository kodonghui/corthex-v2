"use client";
import React from "react";
import { Activity, BarChart2, Bell, BookOpen, Bot, Building, Building2, ChevronsUpDown, CreditCard, Eye, Folder, Gauge, GitBranch, Home, Info, Key, LayoutDashboard, LayoutTemplate, ListChecks, MessageCircle, MessageSquare, Pencil, Save, ScrollText, Send, Settings, Share2, Shield, Terminal, TrendingUp, Users, Zap, ZoomIn, ZoomOut } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4,h5,h6,.font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre,.font-mono { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #f5f5f4; }
    ::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 3px; }
`;

function AppNexus() {
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
        <li><a href="/app/departments" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Building2 className="w-4 h-4 flex-shrink-0" />부서</a></li>
        <li><a href="/app/nexus" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm bg-violet-50 text-violet-700 font-medium"><GitBranch className="w-4 h-4 flex-shrink-0" />조직도 (Nexus)</a></li>
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
<main className="ml-60 min-h-screen flex flex-col">

  {/* Header */}
  <header className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-6 sticky top-0 z-10 flex-shrink-0">
    <h1 className="text-base font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>조직도 (Nexus)</h1>
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-1.5 text-stone-600 hover:bg-stone-100 rounded-lg px-3 py-1.5 text-sm transition-colors">
        <ZoomOut className="w-3.5 h-3.5" />
      </button>
      <span className="text-xs text-stone-400 font-mono">100%</span>
      <button className="flex items-center gap-1.5 text-stone-600 hover:bg-stone-100 rounded-lg px-3 py-1.5 text-sm transition-colors">
        <ZoomIn className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-5 bg-stone-200 mx-1"></div>
      <button className="flex items-center gap-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
        <LayoutTemplate className="w-3.5 h-3.5" />
        레이아웃 자동 정렬
      </button>
      <button className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150">
        <Save className="w-4 h-4" />
        저장
      </button>
    </div>
  </header>

  {/* Guide Banner */}
  <div className="mx-6 mt-4 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 flex-shrink-0">
    <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
    <p className="text-xs text-blue-700">조직도를 드래그하여 재배치할 수 있어요. 실제 구현에서는 인터랙티브 캔버스로 동작합니다.</p>
  </div>

  {/* Main canvas + right panel */}
  <div className="flex flex-1 gap-0 p-6 pt-4">

    {/* ── ORG CHART CANVAS ── */}
    <div className="flex-1 bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden relative" style={{minHeight: "600px"}}>

      {/* Grid background pattern */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#f0efee" strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* ─── SVG Connection Lines ─── */}
        {/* ACME Corp → 비서실 */}
        <line x1="430" y1="100" x2="430" y2="148" stroke="#e2e0de" strokeWidth="1.5" stroke-dasharray="4,3"/>
        {/* 비서실 → Departments (horizontal bus) */}
        <line x1="160" y1="250" x2="700" y2="250" stroke="#e2e0de" strokeWidth="1.5" stroke-dasharray="4,3"/>
        {/* verticals from bus to each dept */}
        <line x1="160" y1="250" x2="160" y2="310" stroke="#e2e0de" strokeWidth="1.5" stroke-dasharray="4,3"/>
        <line x1="310" y1="250" x2="310" y2="310" stroke="#e2e0de" strokeWidth="1.5" stroke-dasharray="4,3"/>
        <line x1="460" y1="250" x2="460" y2="310" stroke="#e2e0de" strokeWidth="1.5" stroke-dasharray="4,3"/>
        <line x1="610" y1="250" x2="610" y2="310" stroke="#e2e0de" strokeWidth="1.5" stroke-dasharray="4,3"/>
        <line x1="760" y1="250" x2="760" y2="310" stroke="#e2e0de" strokeWidth="1.5" stroke-dasharray="4,3"/>
        {/* bus → 비서실 bottom */}
        <line x1="430" y1="200" x2="430" y2="250" stroke="#e2e0de" strokeWidth="1.5" stroke-dasharray="4,3"/>

        {/* agent connectors from 마케팅 */}
        <line x1="285" y1="390" x2="285" y2="430" stroke="#e2e0de" strokeWidth="1" stroke-dasharray="3,3"/>
        <line x1="335" y1="390" x2="335" y2="430" stroke="#e2e0de" strokeWidth="1" stroke-dasharray="3,3"/>
        {/* agent connectors from 전략투자 */}
        <line x1="435" y1="390" x2="435" y2="430" stroke="#e2e0de" strokeWidth="1" stroke-dasharray="3,3"/>
        <line x1="485" y1="390" x2="485" y2="430" stroke="#e2e0de" strokeWidth="1" stroke-dasharray="3,3"/>
      </svg>

      {/* ── Level 0: ACME Corp ── */}
      <div className="absolute" style={{left: "340px", top: "48px", width: "180px"}}>
        <div className="bg-white border-2 border-violet-400 rounded-xl px-4 py-3 shadow-md text-center">
          <div className="w-8 h-8 bg-violet-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
            <Building className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>ACME Corp</p>
          <p className="text-[11px] text-stone-500 mt-0.5">김대표 · CEO</p>
        </div>
      </div>

      {/* ── Level 1: 비서실 ── */}
      <div className="absolute" style={{left: "350px", top: "150px", width: "160px"}}>
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-3 py-2.5 shadow-sm text-center hover:border-violet-400 transition-colors cursor-pointer">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-base">🏢</span>
            <p className="text-xs font-bold text-violet-800" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>비서실</p>
          </div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <div className="w-4 h-4 rounded-full bg-violet-200 border border-white flex items-center justify-center text-[8px] font-bold text-violet-800">이나</div>
            <p className="text-[10px] text-violet-600">에이전트 2명</p>
          </div>
        </div>
      </div>

      {/* ── Level 2: Department boxes ── */}

      {/* 마케팅부서 */}
      <div className="absolute" style={{left: "100px", top: "312px", width: "130px"}}>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 shadow-sm text-center hover:border-blue-400 transition-colors cursor-pointer">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-sm">📢</span>
            <p className="text-[11px] font-bold text-blue-800" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>마케팅</p>
          </div>
          <p className="text-[10px] text-blue-600">5명</p>
        </div>
      </div>

      {/* 전략투자부서 */}
      <div className="absolute" style={{left: "250px", top: "312px", width: "130px"}}>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 shadow-sm text-center hover:border-emerald-400 transition-colors cursor-pointer">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-sm">💹</span>
            <p className="text-[11px] font-bold text-emerald-800" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>전략투자</p>
          </div>
          <p className="text-[10px] text-emerald-600">4명</p>
        </div>
      </div>

      {/* 법무부서 */}
      <div className="absolute" style={{left: "400px", top: "312px", width: "130px"}}>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 shadow-sm text-center hover:border-amber-400 transition-colors cursor-pointer">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-sm">⚖️</span>
            <p className="text-[11px] font-bold text-amber-800" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>법무</p>
          </div>
          <p className="text-[10px] text-amber-600">3명</p>
        </div>
      </div>

      {/* 연구개발부서 */}
      <div className="absolute" style={{left: "550px", top: "312px", width: "130px"}}>
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5 shadow-sm text-center hover:border-rose-400 transition-colors cursor-pointer">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-sm">🔬</span>
            <p className="text-[11px] font-bold text-rose-800" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>연구개발</p>
          </div>
          <p className="text-[10px] text-rose-600">4명</p>
        </div>
      </div>

      {/* 비서실 직속 에이전트 */}
      <div className="absolute" style={{left: "700px", top: "312px", width: "130px"}}>
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-3 py-2.5 shadow-sm text-center hover:border-violet-400 transition-colors cursor-pointer">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-sm">🏢</span>
            <p className="text-[11px] font-bold text-violet-800" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>비서실 직속</p>
          </div>
          <p className="text-[10px] text-violet-600">2명</p>
        </div>
      </div>

      {/* ── Level 3: Agent Cards (마케팅 소속) ── */}
      <div className="absolute" style={{left: "100px", top: "430px", width: "118px"}}>
        <div className="bg-white border border-stone-200 rounded-lg px-2.5 py-2 shadow-sm hover:border-violet-300 hover:shadow-md transition-all cursor-pointer" onClick="selectAgent('박준형')">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[8px] font-bold flex-shrink-0">박준</div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-stone-900 truncate">박준형</p>
              <p className="text-[10px] text-stone-500 truncate">마케팅팀장</p>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block"></span>
            <span className="text-[10px] text-stone-500">작업중</span>
          </div>
        </div>
      </div>

      <div className="absolute" style={{left: "228px", top: "430px", width: "118px"}}>
        <div className="bg-white border border-stone-200 rounded-lg px-2.5 py-2 shadow-sm hover:border-violet-300 hover:shadow-md transition-all cursor-pointer" onClick="selectAgent('최민지')">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-[8px] font-bold flex-shrink-0">최민</div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-stone-900 truncate">최민지</p>
              <p className="text-[10px] text-stone-500 truncate">카피라이터</p>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block"></span>
            <span className="text-[10px] text-stone-500">작업중</span>
          </div>
        </div>
      </div>

      {/* Agent Cards (전략투자 소속) */}
      <div className="absolute" style={{left: "356px", top: "430px", width: "118px"}}>
        <div className="bg-white border border-stone-200 rounded-lg px-2.5 py-2 shadow-sm hover:border-violet-300 hover:shadow-md transition-all cursor-pointer" onClick="selectAgent('김재원')">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-[8px] font-bold flex-shrink-0">김재</div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-stone-900 truncate">김재원</p>
              <p className="text-[10px] text-stone-500 truncate">투자분석가</p>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-[10px] text-stone-500">온라인</span>
          </div>
        </div>
      </div>

      <div className="absolute" style={{left: "484px", top: "430px", width: "118px"}}>
        <div className="bg-white border border-stone-200 rounded-lg px-2.5 py-2 shadow-sm hover:border-violet-300 hover:shadow-md transition-all cursor-pointer" onClick="selectAgent('정도현')">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 text-[8px] font-bold flex-shrink-0">정도</div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-stone-700 truncate">정도현</p>
              <p className="text-[10px] text-stone-400 truncate">데이터분석가</p>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block"></span>
            <span className="text-[10px] text-stone-400">오프라인</span>
          </div>
        </div>
      </div>

      {/* Agent (비서실 직속 이나경) */}
      <div className="absolute" style={{left: "700px", top: "430px", width: "118px"}}>
        <div className="bg-white border-2 border-violet-200 rounded-lg px-2.5 py-2 shadow-sm hover:border-violet-400 hover:shadow-md transition-all cursor-pointer" onClick="selectAgent('이나경')">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-[8px] font-bold flex-shrink-0">이나</div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-stone-900 truncate">이나경</p>
              <p className="text-[10px] text-stone-500 truncate">비서실장</p>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-[10px] text-stone-500">온라인</span>
          </div>
        </div>
      </div>

      {/* Legend (bottom left) */}
      <div className="absolute bottom-4 left-4 bg-white border border-stone-200 rounded-lg px-3 py-2.5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-2">범례</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-[11px] text-stone-600">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block"></span>
            <span className="text-[11px] text-stone-600">Working</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            <span className="text-[11px] text-stone-600">Error</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-400 inline-block"></span>
            <span className="text-[11px] text-stone-600">Offline</span>
          </div>
        </div>
      </div>

    </div>{/* /canvas */}

    {/* ── RIGHT PANEL: Selected Node Info ── */}
    <div className="w-60 flex-shrink-0 ml-4 flex flex-col gap-3" id="rightPanel">

      {/* Selected Agent Info Card */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4" id="agentPanel">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-3">선택된 노드</p>

        {/* Agent Avatar + Name */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-lg font-bold mb-2">이나</div>
          <h3 className="text-sm font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>이나경</h3>
          <p className="text-xs text-stone-500">비서실장</p>
          <span className="mt-2 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            온라인
          </span>
        </div>

        {/* Info rows */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-stone-500">계급</span>
            <span className="text-xs font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">Manager</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-stone-500">소속</span>
            <span className="text-xs text-stone-700">비서실</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-stone-500">오늘 작업</span>
            <span className="text-xs font-semibold text-stone-900">12건</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-stone-500">성공률</span>
            <span className="text-xs font-semibold text-emerald-600">97%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-stone-500">모델</span>
            <span className="text-[10px] text-stone-600" style={{fontFamily: "'JetBrains Mono',monospace"}}>claude-3-5-sonnet</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button className="w-full flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150">
            <MessageCircle className="w-3.5 h-3.5" /> 채팅하기
          </button>
          <button className="w-full flex items-center justify-center gap-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-2 text-xs font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> 편집
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-3">조직 요약</p>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-600">전체 에이전트</span>
            <span className="text-xs font-bold text-stone-900">24</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-600">온라인</span>
            <span className="text-xs font-semibold text-emerald-600">8</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-600">작업중</span>
            <span className="text-xs font-semibold text-orange-600">5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-600">오프라인</span>
            <span className="text-xs font-semibold text-stone-500">11</span>
          </div>
          <div className="h-px bg-stone-100"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-600">부서 수</span>
            <span className="text-xs font-bold text-stone-900">5</span>
          </div>
        </div>
      </div>

    </div>{/* /right panel */}

  </div>{/* /flex main area */}

</main>
    </>
  );
}

export default AppNexus;
