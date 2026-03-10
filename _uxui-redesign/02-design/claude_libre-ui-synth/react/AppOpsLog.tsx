"use client";
import React from "react";
import { BarChart2, BookOpen, Bot, Building2, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, Clock, CreditCard, Download, FileBarChart, Folder, GitBranch, Home, LayoutDashboard, MessageCircle, Network, ScrollText, Search, Settings, Share2, SlidersHorizontal, Terminal, Timer, TrendingUp, Zap } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4,h5,h6 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    .sidebar-item { transition: background-color 0.15s ease; }
    .sidebar-item:hover { background-color: #f5f5f4; }
    .sidebar-item.active { background-color: #ede9fe; }
    .sidebar-item.active span, .sidebar-item.active i { color: #7c3aed; }
    .log-card { transition: box-shadow 0.15s ease; }
    .log-card:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.07); }
    .detail-panel { display: none; }
    .detail-panel.open { display: block; }
    .chevron-icon { transition: transform 0.2s ease; }
    .chevron-icon.rotated { transform: rotate(180deg); }`;

function AppOpsLog() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      {/* Sidebar */}
  <aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-10 overflow-y-auto">
    <div className="px-4 py-5 flex items-center gap-3 border-b border-stone-100 flex-shrink-0">
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-sm" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>C</span>
      </div>
      <span className="font-bold text-stone-900 text-base" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
    </div>

    <nav className="flex-1 px-3 py-4 space-y-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 mb-2">워크스페이스</p>
      <a href="/app/home" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <Home className="w-4 h-4 text-stone-400" /><span>홈</span>
      </a>
      <a href="/app/command-center" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <Terminal className="w-4 h-4 text-stone-400" /><span>커맨드센터</span>
      </a>
      <a href="/app/dashboard" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <LayoutDashboard className="w-4 h-4 text-stone-400" /><span>대시보드</span>
      </a>
      <a href="/app/departments" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <Building2 className="w-4 h-4 text-stone-400" /><span>부서 관리</span>
      </a>
      <a href="/app/agents" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <Bot className="w-4 h-4 text-stone-400" /><span>에이전트</span>
      </a>
      <a href="/app/chat" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <MessageCircle className="w-4 h-4 text-stone-400" /><span>채팅</span>
      </a>

      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 mb-2 mt-5">도구</p>
      <a href="/app/trading" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <TrendingUp className="w-4 h-4 text-stone-400" /><span>트레이딩</span>
      </a>
      <a href="/app/sns" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <Share2 className="w-4 h-4 text-stone-400" /><span>SNS</span>
      </a>
      <a href="/app/nexus" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <Network className="w-4 h-4 text-stone-400" /><span>넥서스</span>
      </a>

      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 mb-2 mt-5">기록</p>
      <a href="/app/ops-log" className="sidebar-item active flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-violet-700 cursor-pointer no-underline">
        <ScrollText className="w-4 h-4" /><span>작전일지</span>
      </a>
      <a href="/app/reports" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <FileBarChart className="w-4 h-4 text-stone-400" /><span>보고서</span>
      </a>
      <a href="/app/jobs" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <Clock className="w-4 h-4 text-stone-400" /><span>예약 작업</span>
      </a>
      <a href="/app/knowledge" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <BookOpen className="w-4 h-4 text-stone-400" /><span>지식베이스</span>
      </a>
      <a href="/app/files" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <Folder className="w-4 h-4 text-stone-400" /><span>파일</span>
      </a>

      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 mb-2 mt-5">관리</p>
      <a href="/app/costs" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <CreditCard className="w-4 h-4 text-stone-400" /><span>비용</span>
      </a>
      <a href="/app/performance" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <BarChart2 className="w-4 h-4 text-stone-400" /><span>성과</span>
      </a>
      <a href="/app/settings" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <Settings className="w-4 h-4 text-stone-400" /><span>설정</span>
      </a>
    </nav>

    <div className="px-4 py-4 border-t border-stone-100 flex items-center gap-2.5 flex-shrink-0">
      <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-violet-700 text-xs font-bold">김</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-900 truncate">김대표</p>
        <p className="text-xs text-stone-500 truncate">대표이사</p>
      </div>
      <ChevronsUpDown className="w-4 h-4 text-stone-400 flex-shrink-0" />
    </div>
  </aside>

  {/* Main Content */}
  <main className="ml-60 min-h-screen p-6">
    {/* Page Header */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-stone-900">작전일지</h1>
        <p className="text-sm text-stone-500 mt-0.5">에이전트가 수행한 모든 명령의 실행 기록</p>
      </div>
      <div className="flex items-center gap-2">
        {/* Date Filter Segmented Control */}
        <div className="flex bg-white border border-stone-200 rounded-lg overflow-hidden text-sm shadow-sm">
          <button className="px-3.5 py-2 bg-violet-600 text-white font-semibold">오늘</button>
          <button className="px-3.5 py-2 text-stone-600 hover:bg-stone-50 border-l border-stone-200">이번 주</button>
          <button className="px-3.5 py-2 text-stone-600 hover:bg-stone-50 border-l border-stone-200">이번 달</button>
          <button className="px-3.5 py-2 text-stone-600 hover:bg-stone-50 border-l border-stone-200">전체</button>
        </div>
        <button className="flex items-center gap-1.5 bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-50 shadow-sm">
          <Download className="w-4 h-4" />내보내기
        </button>
      </div>
    </div>

    {/* Stats Row */}
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">오늘 실행</p>
        <p className="text-2xl font-bold text-stone-900">24</p>
        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />어제 대비 +8건
        </p>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">완료율</p>
        <p className="text-2xl font-bold text-stone-900">98.3%</p>
        <p className="text-xs text-stone-500 mt-1">실패 0건 · 대기 1건</p>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">총 비용 (오늘)</p>
        <p className="text-2xl font-bold text-stone-900">$4.82</p>
        <p className="text-xs text-stone-500 mt-1">이번 달 누적 $28.40</p>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">평균 실행 시간</p>
        <p className="text-2xl font-bold text-stone-900">2m 14s</p>
        <p className="text-xs text-stone-500 mt-1">중앙값 1m 08s</p>
      </div>
    </div>

    {/* Search & Filter Bar */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 mb-5 flex items-center gap-3">
      <div className="flex-1 relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input type="text" placeholder="명령어, 에이전트, 결과로 검색..." className="w-full rounded-lg border border-stone-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
      </div>
      <select className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
        <option>전체 에이전트</option>
        <option>이나경 (비서)</option>
        <option>박준형 (마케팅)</option>
        <option>김재원 (투자)</option>
        <option>이소연 (법무)</option>
        <option>최민지 (크리에이티브)</option>
      </select>
      <select className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
        <option>전체 상태</option>
        <option>완료</option>
        <option>진행 중</option>
        <option>실패</option>
      </select>
      <button className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 px-2">
        <SlidersHorizontal className="w-4 h-4" />고급 필터
      </button>
    </div>

    {/* Timeline Log List */}
    {/* API: GET /api/workspace/operation-log */}
    <div className="space-y-2 mb-6">

      {/* === 오늘 Section === */}
      <div className="flex items-center gap-3 py-1.5">
        <span className="text-xs font-semibold text-stone-500 bg-stone-100 rounded-full px-3 py-1 whitespace-nowrap">오늘 — 2026년 3월 10일</span>
        <div className="flex-1 h-px bg-stone-100"></div>
        <span className="text-xs text-stone-400 whitespace-nowrap">2건</span>
      </div>

      {/* Log 1: 이나경 */}
      <div className="log-card bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 flex items-start gap-4">
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{"minWidth":"72px"}}>
            <span className="text-xs font-medium text-stone-400">10:32</span>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
              <span className="text-emerald-700 text-xs font-bold">이나</span>
            </div>
            <span className="text-[10px] text-stone-400 text-center leading-tight">이나경<br /><span className="text-stone-300">비서</span></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-stone-900">"내일 마케팅 미팅 준비 자료 작성"</p>
              <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1 border border-emerald-100">
                <CheckCircle className="w-3 h-3" />완료
              </span>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed mb-3">내일 오전 10시 마케팅 팀 주간 미팅용 의제 및 준비 자료 완성. PPT 슬라이드 8장 + 데이터 요약표 포함.<br />구글 드라이브에 자동 저장 후 링크 전달 완료.</p>
            <div className="flex items-center gap-5 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <Timer className="w-3.5 h-3.5 text-stone-400" />
                실행 시간 <span className="font-semibold text-stone-700 ml-0.5">45초</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                비용 <span className="font-semibold text-stone-700 ml-0.5">$0.12</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <GitBranch className="w-3.5 h-3.5 text-violet-400" />
                위임 체인 <span className="font-semibold text-stone-700 ml-0.5">3단계</span>
              </span>
              <span className="text-xs bg-stone-100 text-stone-500 rounded-full px-2.5 py-0.5">문서 작성</span>
            </div>
          </div>
          <button onClick="toggleDetail(this)" className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 mt-0.5">
            <ChevronDown className="w-4 h-4 chevron-icon" />
          </button>
        </div>
        <div className="detail-panel border-t border-stone-100 bg-stone-50/70 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-3">실행 체인 상세</p>
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</span>
              <div><span className="font-medium text-stone-700">이나경</span> → 미팅 의제 구조 설계 · <code className="bg-white border border-stone-200 rounded px-1 py-0.5 text-violet-600">agenda_draft.json</code> 생성</div>
            </div>
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</span>
              <div><span className="font-medium text-stone-700">이나경</span> → Google Slides API 호출 · 슬라이드 8장 내용 자동 작성</div>
            </div>
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded flex items-center justify-center font-bold flex-shrink-0 mt-0.5">3</span>
              <div><span className="font-medium text-stone-700">이나경</span> → Google Drive 저장 완료 · 공유 링크 생성 후 사용자에게 전달</div>
            </div>
          </div>
        </div>
      </div>

      {/* Log 2: 박준형 */}
      <div className="log-card bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 flex items-start gap-4">
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{"minWidth":"72px"}}>
            <span className="text-xs font-medium text-stone-400">09:15</span>
            <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mt-1">
              <span className="text-sky-700 text-xs font-bold">박준</span>
            </div>
            <span className="text-[10px] text-stone-400 text-center leading-tight">박준형<br /><span className="text-stone-300">마케팅</span></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-stone-900">"인스타그램 3월 콘텐츠 캘린더 작성"</p>
              <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1 border border-emerald-100">
                <CheckCircle className="w-3 h-3" />완료
              </span>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed mb-3">3월 전체 인스타그램 콘텐츠 캘린더 완성. 피드 12건 + 스토리 19건 + 릴스 4건 (총 35건).<br />주제·카피·해시태그 포함. Notion 캘린더 DB에 자동 동기화 완료.</p>
            <div className="flex items-center gap-5 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <Timer className="w-3.5 h-3.5 text-stone-400" />
                실행 시간 <span className="font-semibold text-stone-700 ml-0.5">2분 12초</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                비용 <span className="font-semibold text-stone-700 ml-0.5">$0.34</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <GitBranch className="w-3.5 h-3.5 text-violet-400" />
                위임 체인 <span className="font-semibold text-stone-700 ml-0.5">2단계</span>
              </span>
              <span className="text-xs bg-sky-50 text-sky-600 rounded-full px-2.5 py-0.5 border border-sky-100">SNS 마케팅</span>
            </div>
          </div>
          <button onClick="toggleDetail(this)" className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 mt-0.5">
            <ChevronDown className="w-4 h-4 chevron-icon" />
          </button>
        </div>
        <div className="detail-panel border-t border-stone-100 bg-stone-50/70 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-3">실행 체인 상세</p>
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</span>
              <div><span className="font-medium text-stone-700">박준형</span> → 3월 마케팅 전략 문서 참조 후 콘텐츠 주제 35개 생성 (피드·스토리·릴스 분류)</div>
            </div>
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</span>
              <div><span className="font-medium text-stone-700">박준형</span> → Notion API 호출 · 캘린더 DB에 35건 일괄 동기화 완료</div>
            </div>
          </div>
        </div>
      </div>

      {/* === 어제 Section === */}
      <div className="flex items-center gap-3 py-1.5 mt-3">
        <span className="text-xs font-semibold text-stone-500 bg-stone-100 rounded-full px-3 py-1 whitespace-nowrap">어제 — 2026년 3월 9일</span>
        <div className="flex-1 h-px bg-stone-100"></div>
        <span className="text-xs text-stone-400 whitespace-nowrap">3건</span>
      </div>

      {/* Log 3: 김재원 */}
      <div className="log-card bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 flex items-start gap-4">
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{"minWidth":"72px"}}>
            <span className="text-xs font-medium text-stone-400">18:40</span>
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mt-1">
              <span className="text-amber-700 text-xs font-bold">김재</span>
            </div>
            <span className="text-[10px] text-stone-400 text-center leading-tight">김재원<br /><span className="text-stone-300">투자</span></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-stone-900">"NVIDIA 투자 타당성 분석"</p>
              <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1 border border-emerald-100">
                <CheckCircle className="w-3 h-3" />완료
              </span>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed mb-3">NVDA 현재 PER 35.2배, AI 데이터센터 수요 기반 12개월 목표주가 $950 제시. 매수 권고 근거 4항목 + 리스크 3항목 포함.<br />14페이지 PDF 분석 리포트 생성 후 지식베이스에 자동 저장.</p>
            <div className="flex items-center gap-5 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <Timer className="w-3.5 h-3.5 text-stone-400" />
                실행 시간 <span className="font-semibold text-stone-700 ml-0.5">8분 22초</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                비용 <span className="font-semibold text-stone-700 ml-0.5">$1.20</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <GitBranch className="w-3.5 h-3.5 text-violet-400" />
                위임 체인 <span className="font-semibold text-stone-700 ml-0.5">4단계</span>
              </span>
              <span className="text-xs bg-amber-50 text-amber-600 rounded-full px-2.5 py-0.5 border border-amber-100">투자 분석</span>
            </div>
          </div>
          <button onClick="toggleDetail(this)" className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 mt-0.5">
            <ChevronDown className="w-4 h-4 chevron-icon" />
          </button>
        </div>
        <div className="detail-panel border-t border-stone-100 bg-stone-50/70 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-3">실행 체인 상세</p>
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</span>
              <div><span className="font-medium text-stone-700">김재원</span> → KIS API 호출 · NVDA 실시간 주가·재무제표·매출 데이터 수집</div>
            </div>
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</span>
              <div><span className="font-medium text-stone-700">김재원</span> → Web Search로 최신 애널리스트 리포트 12건 수집 및 요약</div>
            </div>
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded flex items-center justify-center font-bold flex-shrink-0 mt-0.5">3</span>
              <div><span className="font-medium text-stone-700">김재원</span> → DCF 모델 계산 + AMD·Intel 경쟁사 비교 분석 수행</div>
            </div>
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded flex items-center justify-center font-bold flex-shrink-0 mt-0.5">4</span>
              <div><span className="font-medium text-stone-700">김재원</span> → 14페이지 PDF 리포트 생성 · 지식베이스 <code className="bg-white border border-stone-200 rounded px-1 py-0.5 text-violet-600">투자 가이드/</code> 폴더에 저장</div>
            </div>
          </div>
        </div>
      </div>

      {/* Log 4: 이소연 */}
      <div className="log-card bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 flex items-start gap-4">
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{"minWidth":"72px"}}>
            <span className="text-xs font-medium text-stone-400">14:15</span>
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mt-1">
              <span className="text-rose-700 text-xs font-bold">이소</span>
            </div>
            <span className="text-[10px] text-stone-400 text-center leading-tight">이소연<br /><span className="text-stone-300">법무</span></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-stone-900">"신규 파트너십 계약서 검토"</p>
              <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1 border border-emerald-100">
                <CheckCircle className="w-3 h-3" />완료
              </span>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed mb-3">총 42개 조항 검토 완료. 독소 조항 3개 발견: 위약금 과다(12조), 지재권 귀속 불명확(18조), 해지 조건 불균형(28조).<br />수정 제안 문구 및 협상 포인트 포함한 법무 검토 리포트 생성 완료.</p>
            <div className="flex items-center gap-5 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <Timer className="w-3.5 h-3.5 text-stone-400" />
                실행 시간 <span className="font-semibold text-stone-700 ml-0.5">3분 5초</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                비용 <span className="font-semibold text-stone-700 ml-0.5">$0.45</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <GitBranch className="w-3.5 h-3.5 text-violet-400" />
                위임 체인 <span className="font-semibold text-stone-700 ml-0.5">2단계</span>
              </span>
              <span className="text-xs bg-rose-50 text-rose-600 rounded-full px-2.5 py-0.5 border border-rose-100">법무 검토</span>
            </div>
          </div>
          <button onClick="toggleDetail(this)" className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 mt-0.5">
            <ChevronDown className="w-4 h-4 chevron-icon" />
          </button>
        </div>
        <div className="detail-panel border-t border-stone-100 bg-stone-50/70 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-3">실행 체인 상세</p>
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</span>
              <div><span className="font-medium text-stone-700">이소연</span> → 계약서 PDF 파싱 · 42개 조항 구조화 후 표준 계약서 DB와 비교</div>
            </div>
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</span>
              <div><span className="font-medium text-stone-700">이소연</span> → 독소 조항 3개 식별 · 수정 권고안 작성 · 법무 검토 리포트 PDF 생성</div>
            </div>
          </div>
        </div>
      </div>

      {/* Log 5: 최민지 */}
      <div className="log-card bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 flex items-start gap-4">
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{"minWidth":"72px"}}>
            <span className="text-xs font-medium text-stone-400">11:30</span>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mt-1">
              <span className="text-purple-700 text-xs font-bold">최민</span>
            </div>
            <span className="text-[10px] text-stone-400 text-center leading-tight">최민지<br /><span className="text-stone-300">크리에이티브</span></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-stone-900">"봄 시즌 광고 카피 5종 작성"</p>
              <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1 border border-emerald-100">
                <CheckCircle className="w-3 h-3" />완료
              </span>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed mb-3">봄 시즌 캠페인용 광고 카피 5종 작성 완료. 각 카피: 메인 슬로건 + 서브 카피 + CTA 문구 구성.<br />타겟 20–35세 여성, 브랜드 가이드라인 준수. 마케팅팀 리뷰 대기 상태로 Notion에 전달 완료.</p>
            <div className="flex items-center gap-5 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <Timer className="w-3.5 h-3.5 text-stone-400" />
                실행 시간 <span className="font-semibold text-stone-700 ml-0.5">4분 50초</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                비용 <span className="font-semibold text-stone-700 ml-0.5">$0.67</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <GitBranch className="w-3.5 h-3.5 text-violet-400" />
                위임 체인 <span className="font-semibold text-stone-700 ml-0.5">3단계</span>
              </span>
              <span className="text-xs bg-purple-50 text-purple-600 rounded-full px-2.5 py-0.5 border border-purple-100">광고 카피</span>
            </div>
          </div>
          <button onClick="toggleDetail(this)" className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 mt-0.5">
            <ChevronDown className="w-4 h-4 chevron-icon" />
          </button>
        </div>
        <div className="detail-panel border-t border-stone-100 bg-stone-50/70 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-3">실행 체인 상세</p>
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</span>
              <div><span className="font-medium text-stone-700">최민지</span> → 브랜드 가이드 + 타겟 페르소나 문서 로드 · 봄 시즌 키워드 추출</div>
            </div>
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</span>
              <div><span className="font-medium text-stone-700">최민지</span> → 광고 카피 5종 초안 작성 · 톤&amp;매너 일관성 자체 검토</div>
            </div>
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded flex items-center justify-center font-bold flex-shrink-0 mt-0.5">3</span>
              <div><span className="font-medium text-stone-700">최민지</span> → 문서 포맷팅 완료 · Notion 마케팅 페이지에 리뷰 요청과 함께 업로드</div>
            </div>
          </div>
        </div>
      </div>

    </div>

    {/* Pagination */}
    <div className="flex items-center justify-between">
      <p className="text-sm text-stone-500">총 <span className="font-semibold text-stone-800">248</span>개 로그 · 페이지 <span className="font-semibold text-stone-800">1</span> / 50</p>
      <div className="flex items-center gap-1">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-300 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-600 text-white text-sm font-semibold">1</button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 text-sm hover:bg-stone-50">2</button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 text-sm hover:bg-stone-50">3</button>
        <span className="w-8 h-8 flex items-center justify-center text-stone-400 text-sm">···</span>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 text-sm hover:bg-stone-50">50</button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>

  </main>
    </>
  );
}

export default AppOpsLog;
