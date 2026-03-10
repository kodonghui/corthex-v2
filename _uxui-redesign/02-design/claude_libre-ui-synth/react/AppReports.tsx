"use client";
import React from "react";
import { ArrowRight, ArrowUpDown, BarChart2, BookOpen, Bot, Briefcase, Building2, ChevronsUpDown, Clock, CreditCard, Eye, FileBarChart, Folder, Home, LayoutDashboard, Loader, MessageCircle, Network, Plus, ScrollText, Search, Settings, Share2, ShieldCheck, Terminal, TrendingUp } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4,h5,h6 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    .sidebar-item { transition: background-color 0.15s ease; }
    .sidebar-item:hover { background-color: #f5f5f4; }
    .sidebar-item.active { background-color: #ede9fe; }
    .sidebar-item.active span, .sidebar-item.active i { color: #7c3aed; }
    .report-card { transition: box-shadow 0.15s ease, transform 0.15s ease; }
    .report-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08); transform: translateY(-1px); }
`;

function AppReports() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar */}
  <aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-10 overflow-y-auto">
    <div className="px-4 py-5 flex items-center gap-3 border-b border-stone-100 flex-shrink-0">
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-sm" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>C</span>
      </div>
      <span className="font-bold text-stone-900 text-base" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
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
      <a href="/app/ops-log" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 cursor-pointer no-underline">
        <ScrollText className="w-4 h-4 text-stone-400" /><span>작전일지</span>
      </a>
      <a href="/app/reports" className="sidebar-item active flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-violet-700 cursor-pointer no-underline">
        <FileBarChart className="w-4 h-4" /><span>보고서</span>
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
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-stone-900">보고서</h1>
        <p className="text-sm text-stone-500 mt-0.5">에이전트가 생성한 모든 분석 보고서</p>
      </div>
      <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 shadow-sm">
        <Plus className="w-4 h-4" />새 보고서 요청
      </button>
    </div>

    {/* Summary Stats */}
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">전체 보고서</p>
        <p className="text-2xl font-bold text-stone-900">38</p>
        <p className="text-xs text-stone-500 mt-1">이번 달 12건 신규</p>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">평균 품질 점수</p>
        <p className="text-2xl font-bold text-stone-900">91.2</p>
        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />지난 달 대비 +2.4</p>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">미열람</p>
        <p className="text-2xl font-bold text-violet-600">3</p>
        <p className="text-xs text-stone-500 mt-1">새 보고서 대기 중</p>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">최다 생성</p>
        <p className="text-lg font-bold text-stone-900">김재원</p>
        <p className="text-xs text-stone-500 mt-1">투자 분석 · 이번 달 5건</p>
      </div>
    </div>

    {/* Filters */}
    {/* API: GET /api/workspace/reports */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 mb-5 flex items-center gap-3 flex-wrap">
      {/* Category Filter */}
      <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-lg p-1">
        <button className="px-3 py-1.5 rounded-md bg-violet-600 text-white text-xs font-semibold">전체</button>
        <button className="px-3 py-1.5 rounded-md text-stone-600 text-xs hover:bg-white hover:shadow-sm">투자</button>
        <button className="px-3 py-1.5 rounded-md text-stone-600 text-xs hover:bg-white hover:shadow-sm">마케팅</button>
        <button className="px-3 py-1.5 rounded-md text-stone-600 text-xs hover:bg-white hover:shadow-sm">법무</button>
        <button className="px-3 py-1.5 rounded-md text-stone-600 text-xs hover:bg-white hover:shadow-sm">경영</button>
      </div>
      <select className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
        <option>전체 기간</option>
        <option>오늘</option>
        <option>이번 주</option>
        <option>이번 달</option>
        <option>지난 3개월</option>
      </select>
      <select className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
        <option>전체 에이전트</option>
        <option>김재원 (투자)</option>
        <option>박준형 (마케팅)</option>
        <option>이소연 (법무)</option>
        <option>이나경 (비서)</option>
        <option>최민지 (크리에이티브)</option>
      </select>
      <div className="flex-1 relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input type="text" placeholder="보고서 제목 검색..." className="w-full rounded-lg border border-stone-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
      </div>
      <button className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700">
        <ArrowUpDown className="w-4 h-4" />정렬
      </button>
    </div>

    {/* Report Cards Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

      {/* Card 1: 투자 — 포트폴리오 분석 */}
      <div className="report-card bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-full px-2.5 py-1 border border-amber-100">
            <TrendingUp className="w-3 h-3" />투자
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 bg-violet-50 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>신규
          </span>
        </div>
        <h3 className="text-sm font-bold text-stone-900 mb-2 leading-snug">2025년 3월 포트폴리오 분석 보고서</h3>
        <p className="text-xs text-stone-500 leading-relaxed mb-4 flex-1">보유 종목 전체 수익률 분석 및 리밸런싱 제안. NVDA +28%, TSLA -4% 기준 총 포트폴리오 수익률 +14.2% 달성. 2분기 전략 방향 포함.</p>
        {/* Quality Score */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-stone-100 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: "95%"}}></div>
          </div>
          <span className="text-xs font-bold text-emerald-600">95/100</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-amber-700 text-[10px] font-bold">김</span>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-700">김재원</p>
              <p className="text-[10px] text-stone-400">오늘 09:30</p>
            </div>
          </div>
          <button className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1">
            자세히 보기<ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Card 2: 마케팅 — SNS 성과 */}
      <div className="report-card bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 rounded-full px-2.5 py-1 border border-sky-100">
            <BarChart2 className="w-3 h-3" />마케팅
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-500">
            <Eye className="w-3 h-3" />열람됨
          </span>
        </div>
        <h3 className="text-sm font-bold text-stone-900 mb-2 leading-snug">SNS 채널 3월 성과 분석</h3>
        <p className="text-xs text-stone-500 leading-relaxed mb-4 flex-1">인스타그램 팔로워 +1,240명(+8.3%), 평균 도달률 12.4%. 릴스 조회수 45만 돌파. 전월 대비 인게이지먼트율 2.1%p 상승. 4월 개선 방향 제안 포함.</p>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-stone-100 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: "88%"}}></div>
          </div>
          <span className="text-xs font-bold text-emerald-600">88/100</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center">
              <span className="text-sky-700 text-[10px] font-bold">박</span>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-700">박준형</p>
              <p className="text-[10px] text-stone-400">어제 15:22</p>
            </div>
          </div>
          <button className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1">
            자세히 보기<ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Card 3: 법무 — 계약 리스크 */}
      <div className="report-card bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 rounded-full px-2.5 py-1 border border-rose-100">
            <ShieldCheck className="w-3 h-3" />법무
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 bg-violet-50 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>신규
          </span>
        </div>
        <h3 className="text-sm font-bold text-stone-900 mb-2 leading-snug">신규 파트너십 계약 리스크 검토</h3>
        <p className="text-xs text-stone-500 leading-relaxed mb-4 flex-1">42개 조항 분석 완료. 위험 조항 3개 식별(12조·18조·28조) 및 수정 제안 포함. 계약 체결 전 반드시 검토해야 할 핵심 수정 사항 정리.</p>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-stone-100 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: "92%"}}></div>
          </div>
          <span className="text-xs font-bold text-emerald-600">92/100</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center">
              <span className="text-rose-700 text-[10px] font-bold">이</span>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-700">이소연</p>
              <p className="text-[10px] text-stone-400">2일 전 14:15</p>
            </div>
          </div>
          <button className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1">
            자세히 보기<ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Card 4: 경영 — 주간 업무 요약 */}
      <div className="report-card bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1 border border-emerald-100">
            <Briefcase className="w-3 h-3" />경영
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-500">
            <Eye className="w-3 h-3" />열람됨
          </span>
        </div>
        <h3 className="text-sm font-bold text-stone-900 mb-2 leading-snug">3월 1주차 주간 업무 요약</h3>
        <p className="text-xs text-stone-500 leading-relaxed mb-4 flex-1">3월 첫째 주 전사 업무 현황 요약. 완료 업무 18건, 진행 중 7건, 보류 2건. 주요 리스크 2개 항목 및 다음 주 우선순위 과제 5개 도출.</p>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-stone-100 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: "90%"}}></div>
          </div>
          <span className="text-xs font-bold text-emerald-600">90/100</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-700 text-[10px] font-bold">이</span>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-700">이나경</p>
              <p className="text-[10px] text-stone-400">3일 전 09:00</p>
            </div>
          </div>
          <button className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1">
            자세히 보기<ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Card 5: 투자 — NVIDIA */}
      <div className="report-card bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-full px-2.5 py-1 border border-amber-100">
            <TrendingUp className="w-3 h-3" />투자
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 bg-violet-50 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>신규
          </span>
        </div>
        <h3 className="text-sm font-bold text-stone-900 mb-2 leading-snug">NVIDIA 추가 매수 타당성 분석</h3>
        <p className="text-xs text-stone-500 leading-relaxed mb-4 flex-1">현재 주가 $842 기준 12개월 목표가 $950 설정. AI 데이터센터 수요 지속 성장, Blackwell GPU 출하 증가 근거. 매수 비중 5%→8% 상향 권고.</p>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-stone-100 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: "97%"}}></div>
          </div>
          <span className="text-xs font-bold text-emerald-600">97/100</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-amber-700 text-[10px] font-bold">김</span>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-700">김재원</p>
              <p className="text-[10px] text-stone-400">5일 전 18:40</p>
            </div>
          </div>
          <button className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1">
            자세히 보기<ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Card 6: 마케팅 — 봄 캠페인 */}
      <div className="report-card bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 rounded-full px-2.5 py-1 border border-sky-100">
            <BarChart2 className="w-3 h-3" />마케팅
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-500">
            <Eye className="w-3 h-3" />열람됨
          </span>
        </div>
        <h3 className="text-sm font-bold text-stone-900 mb-2 leading-snug">봄 시즌 광고 캠페인 기획서</h3>
        <p className="text-xs text-stone-500 leading-relaxed mb-4 flex-1">3~4월 봄 시즌 캠페인 전략 기획. 인스타그램·카카오 광고 예산 500만원 배분 방안 및 기대 ROAS 3.2x 목표. 크리에이티브 소재 방향성 5종 제안.</p>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-stone-100 rounded-full h-1.5">
            <div className="bg-yellow-400 h-1.5 rounded-full" style={{width: "85%"}}></div>
          </div>
          <span className="text-xs font-bold text-yellow-600">85/100</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-700 text-[10px] font-bold">최</span>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-700">최민지</p>
              <p className="text-[10px] text-stone-400">1주 전 11:00</p>
            </div>
          </div>
          <button className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1">
            자세히 보기<ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>

    {/* Load More */}
    <div className="flex items-center justify-center py-4">
      <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-stone-50 shadow-sm flex items-center gap-2">
        <Loader className="w-4 h-4 text-stone-400" />보고서 더 보기 (32개 남음)
      </button>
    </div>

  </main>
    </>
  );
}

export default AppReports;
