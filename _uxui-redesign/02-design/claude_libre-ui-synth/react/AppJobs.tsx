"use client";
import React from "react";
import { Activity, BarChart2, BookOpen, Bot, Building2, CalendarClock, CheckCircle, ChevronsUpDown, Clock, CreditCard, FileBarChart, FileSearch, Folder, Home, Instagram, LayoutDashboard, Megaphone, MessageCircle, Network, Pause, PauseCircle, Pencil, PlayCircle, Plus, Presentation, Receipt, Rss, Scale, ScrollText, Settings, Share2, Sun, Terminal, Trash2, TrendingUp } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4,h5,h6 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    .sidebar-item { transition: background-color 0.15s ease; }
    .sidebar-item:hover { background-color: #f5f5f4; }
    .sidebar-item.active { background-color: #ede9fe; }
    .sidebar-item.active span, .sidebar-item.active i { color: #7c3aed; }
    .tab-btn { transition: all 0.15s ease; }
    .tab-btn.active { background-color: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); color: #1c1917; font-weight: 600; }
    .toggle-switch { position: relative; display: inline-flex; align-items: center; cursor: pointer; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-track { width: 36px; height: 20px; background-color: #d6d3d1; border-radius: 10px; transition: background-color 0.2s; position: relative; }
    .toggle-track.on { background-color: #7c3aed; }
    .toggle-thumb { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background-color: white; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    .toggle-track.on .toggle-thumb { transform: translateX(16px); }
    tr:hover td { background-color: #fafaf9; }`;

function AppJobs() {
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
      <a href="/app/home" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <Home className="w-4 h-4 text-stone-400" /><span>홈</span>
      </a>
      <a href="/app/command-center" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <Terminal className="w-4 h-4 text-stone-400" /><span>커맨드센터</span>
      </a>
      <a href="/app/dashboard" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <LayoutDashboard className="w-4 h-4 text-stone-400" /><span>대시보드</span>
      </a>
      <a href="/app/departments" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <Building2 className="w-4 h-4 text-stone-400" /><span>부서 관리</span>
      </a>
      <a href="/app/agents" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <Bot className="w-4 h-4 text-stone-400" /><span>에이전트</span>
      </a>
      <a href="/app/chat" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <MessageCircle className="w-4 h-4 text-stone-400" /><span>채팅</span>
      </a>

      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 mb-2 mt-5">도구</p>
      <a href="/app/trading" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <TrendingUp className="w-4 h-4 text-stone-400" /><span>트레이딩</span>
      </a>
      <a href="/app/sns" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <Share2 className="w-4 h-4 text-stone-400" /><span>SNS</span>
      </a>
      <a href="/app/nexus" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <Network className="w-4 h-4 text-stone-400" /><span>넥서스</span>
      </a>

      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 mb-2 mt-5">기록</p>
      <a href="/app/ops-log" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <ScrollText className="w-4 h-4 text-stone-400" /><span>작전일지</span>
      </a>
      <a href="/app/reports" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <FileBarChart className="w-4 h-4 text-stone-400" /><span>보고서</span>
      </a>
      <a href="/app/jobs" className="sidebar-item active flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-violet-700 no-underline">
        <Clock className="w-4 h-4" /><span>예약 작업</span>
      </a>
      <a href="/app/knowledge" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <BookOpen className="w-4 h-4 text-stone-400" /><span>지식베이스</span>
      </a>
      <a href="/app/files" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <Folder className="w-4 h-4 text-stone-400" /><span>파일</span>
      </a>

      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 mb-2 mt-5">관리</p>
      <a href="/app/costs" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <CreditCard className="w-4 h-4 text-stone-400" /><span>비용</span>
      </a>
      <a href="/app/performance" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <BarChart2 className="w-4 h-4 text-stone-400" /><span>성과</span>
      </a>
      <a href="/app/settings" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
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
        <h1 className="text-xl font-bold text-stone-900">예약 작업</h1>
        <p className="text-sm text-stone-500 mt-0.5">크론 작업 및 일회성 예약 실행 관리</p>
      </div>
      <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 shadow-sm">
        <Plus className="w-4 h-4" />새 예약 추가
      </button>
    </div>

    {/* Status Summary Cards */}
    {/* API: GET /api/workspace/schedules */}
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <PlayCircle className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">활성 크론</p>
          <p className="text-2xl font-bold text-stone-900 mt-0.5">8</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <PauseCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">일시정지</p>
          <p className="text-2xl font-bold text-stone-900 mt-0.5">2</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Activity className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">24시간 실행</p>
          <p className="text-2xl font-bold text-stone-900 mt-0.5">15<span className="text-sm font-normal text-stone-500 ml-1">회</span></p>
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div className="bg-stone-100 rounded-lg p-1 flex gap-1 mb-5 w-fit">
      <button className="tab-btn active px-4 py-2 rounded-md text-sm text-stone-700">
        활성 크론 <span className="ml-1.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full px-1.5 py-0.5">8</span>
      </button>
      <button className="tab-btn px-4 py-2 rounded-md text-sm text-stone-500 hover:text-stone-700">
        일회성 예약 <span className="ml-1.5 bg-stone-200 text-stone-600 text-xs font-semibold rounded-full px-1.5 py-0.5">3</span>
      </button>
      <button className="tab-btn px-4 py-2 rounded-md text-sm text-stone-500 hover:text-stone-700">
        완료된 작업
      </button>
    </div>

    {/* Cron Table */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-6">
      <table className="w-full">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-100">
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">작업명</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">에이전트</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">주기</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">다음 실행</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">마지막 실행</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">상태</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">액션</th>
          </tr>
        </thead>
        <tbody>

          {/* Row 1: 시황 분석 */}
          <tr className="border-b border-stone-100">
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">매일 오전 7시 시황 분석</p>
                  <p className="text-xs text-stone-400 mt-0.5">국내외 시장 동향 + 포트폴리오 영향 분석</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 text-[10px] font-bold">김</span>
                </div>
                <span className="text-sm text-stone-700">김재원</span>
              </div>
            </td>
            <td className="px-4 py-3.5">
              <code className="text-xs bg-stone-50 border border-stone-200 rounded px-2 py-1 text-stone-600">매일 07:00</code>
            </td>
            <td className="px-4 py-3.5">
              <p className="text-sm text-stone-700">내일 07:00</p>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-stone-700">오늘 07:00</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </td>
            <td className="px-4 py-3.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1 border border-emerald-100">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>활성
              </span>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-1">
                {/* API: PATCH /api/workspace/schedules/{id}/toggle */}
                <label className="toggle-switch" title="일시정지">
                  <input type="checkbox" checked />
                  <div className="toggle-track on"><div className="toggle-thumb"></div></div>
                </label>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 ml-1">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>

          {/* Row 2: 주간 마케팅 */}
          <tr className="border-b border-stone-100">
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-sky-50 border border-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart2 className="w-3.5 h-3.5 text-sky-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">주간 마케팅 성과 요약</p>
                  <p className="text-xs text-stone-400 mt-0.5">SNS 채널별 주간 지표 + 인사이트 리포트</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sky-700 text-[10px] font-bold">박</span>
                </div>
                <span className="text-sm text-stone-700">박준형</span>
              </div>
            </td>
            <td className="px-4 py-3.5">
              <code className="text-xs bg-stone-50 border border-stone-200 rounded px-2 py-1 text-stone-600">매주 월 09:00</code>
            </td>
            <td className="px-4 py-3.5">
              <p className="text-sm text-stone-700">다음주 월요일</p>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-stone-700">지난주 월요일</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </td>
            <td className="px-4 py-3.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1 border border-emerald-100">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>활성
              </span>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-1">
                <label className="toggle-switch">
                  <input type="checkbox" checked />
                  <div className="toggle-track on"><div className="toggle-thumb"></div></div>
                </label>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 ml-1">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>

          {/* Row 3: 월간 비용 보고서 */}
          <tr className="border-b border-stone-100">
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">월간 비용 보고서 자동 생성</p>
                  <p className="text-xs text-stone-400 mt-0.5">전월 AI 에이전트 실행 비용 + 부서별 집계</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-700 text-[10px] font-bold">이</span>
                </div>
                <span className="text-sm text-stone-700">이나경</span>
              </div>
            </td>
            <td className="px-4 py-3.5">
              <code className="text-xs bg-stone-50 border border-stone-200 rounded px-2 py-1 text-stone-600">매월 1일</code>
            </td>
            <td className="px-4 py-3.5">
              <p className="text-sm text-stone-700">4월 1일 00:00</p>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-stone-700">3월 1일 00:00</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </td>
            <td className="px-4 py-3.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1 border border-emerald-100">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>활성
              </span>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-1">
                <label className="toggle-switch">
                  <input type="checkbox" checked />
                  <div className="toggle-track on"><div className="toggle-thumb"></div></div>
                </label>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 ml-1">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>

          {/* Row 4: 실시간 뉴스 모니터링 */}
          <tr className="border-b border-stone-100">
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-violet-50 border border-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Rss className="w-3.5 h-3.5 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">실시간 뉴스 모니터링</p>
                  <p className="text-xs text-stone-400 mt-0.5">주식·경제 뉴스 + 포트폴리오 연관 종목 알림</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 text-[10px] font-bold">김</span>
                </div>
                <span className="text-sm text-stone-700">김재원</span>
              </div>
            </td>
            <td className="px-4 py-3.5">
              <code className="text-xs bg-stone-50 border border-stone-200 rounded px-2 py-1 text-stone-600">매시간</code>
            </td>
            <td className="px-4 py-3.5">
              <p className="text-sm text-stone-700">오늘 11:00</p>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-stone-700">오늘 10:00</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </td>
            <td className="px-4 py-3.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1 border border-emerald-100">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>활성
              </span>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-1">
                <label className="toggle-switch">
                  <input type="checkbox" checked />
                  <div className="toggle-track on"><div className="toggle-thumb"></div></div>
                </label>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 ml-1">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>

          {/* Row 5: SNS 자동 발행 */}
          <tr className="border-b border-stone-100">
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-purple-50 border border-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Instagram className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">SNS 인스타그램 자동 발행</p>
                  <p className="text-xs text-stone-400 mt-0.5">예약된 피드·스토리 자동 게시 (하루 2회)</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-700 text-[10px] font-bold">최</span>
                </div>
                <span className="text-sm text-stone-700">최민지</span>
              </div>
            </td>
            <td className="px-4 py-3.5">
              <code className="text-xs bg-stone-50 border border-stone-200 rounded px-2 py-1 text-stone-600">매일 11:00, 18:00</code>
            </td>
            <td className="px-4 py-3.5">
              <p className="text-sm text-stone-700">오늘 18:00</p>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-stone-700">오늘 11:00</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </td>
            <td className="px-4 py-3.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1 border border-emerald-100">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>활성
              </span>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-1">
                <label className="toggle-switch">
                  <input type="checkbox" checked />
                  <div className="toggle-track on"><div className="toggle-thumb"></div></div>
                </label>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 ml-1">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>

          {/* Row 6: 법령 변경 모니터링 (일시정지) */}
          <tr className="border-b border-stone-100 opacity-60">
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Scale className="w-3.5 h-3.5 text-stone-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-700">법령 변경 모니터링</p>
                  <p className="text-xs text-stone-400 mt-0.5">사업 관련 법령 신규 개정사항 자동 수집</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-rose-700 text-[10px] font-bold">이</span>
                </div>
                <span className="text-sm text-stone-600">이소연</span>
              </div>
            </td>
            <td className="px-4 py-3.5">
              <code className="text-xs bg-stone-50 border border-stone-200 rounded px-2 py-1 text-stone-500">매주 수 14:00</code>
            </td>
            <td className="px-4 py-3.5">
              <p className="text-sm text-stone-500">일시정지 중</p>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-stone-500">지난주 수요일</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </td>
            <td className="px-4 py-3.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 bg-stone-100 rounded-full px-2.5 py-1 border border-stone-200">
                <Pause className="w-3 h-3" />일시정지
              </span>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-1">
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <div className="toggle-track"><div className="toggle-thumb"></div></div>
                </label>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 ml-1">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>

        </tbody>
      </table>
    </div>

    {/* One-time Scheduled Jobs Section */}
    <div className="mb-6">
      <h2 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
        <CalendarClock className="w-4 h-4 text-stone-500" />
        일회성 예약 작업 (3건)
        {/* API: POST /api/workspace/schedules */}
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 bg-violet-50 border border-violet-100 rounded-lg flex items-center justify-center">
              <Presentation className="w-4 h-4 text-violet-500" />
            </div>
            <span className="text-xs text-stone-500 bg-stone-50 border border-stone-200 rounded px-2 py-0.5">내일 10:00</span>
          </div>
          <p className="text-sm font-semibold text-stone-800 mb-1">분기 전략 보고서 자동 생성</p>
          <p className="text-xs text-stone-400 mb-3">2분기 전략 수립을 위한 1분기 성과 분석 및 방향성 도출</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 flex items-center gap-1"><Bot className="w-3.5 h-3.5" />이나경</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 bg-violet-50 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full"></span>대기 중
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 bg-sky-50 border border-sky-100 rounded-lg flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-sky-500" />
            </div>
            <span className="text-xs text-stone-500 bg-stone-50 border border-stone-200 rounded px-2 py-0.5">3월 15일 09:00</span>
          </div>
          <p className="text-sm font-semibold text-stone-800 mb-1">봄 캠페인 론칭 SNS 일괄 발행</p>
          <p className="text-xs text-stone-400 mb-3">준비된 봄 시즌 캠페인 소재 인스타·페이스북 동시 발행</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 flex items-center gap-1"><Bot className="w-3.5 h-3.5" />최민지</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 bg-violet-50 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full"></span>대기 중
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center">
              <FileSearch className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-xs text-stone-500 bg-stone-50 border border-stone-200 rounded px-2 py-0.5">3월 20일 18:00</span>
          </div>
          <p className="text-sm font-semibold text-stone-800 mb-1">반기 포트폴리오 리밸런싱 분석</p>
          <p className="text-xs text-stone-400 mb-3">상반기 종료 전 포트폴리오 전면 재검토 및 2분기 배분 전략</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 flex items-center gap-1"><Bot className="w-3.5 h-3.5" />김재원</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 bg-violet-50 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full"></span>대기 중
            </span>
          </div>
        </div>
      </div>
    </div>

  </main>
    </>
  );
}

export default AppJobs;
