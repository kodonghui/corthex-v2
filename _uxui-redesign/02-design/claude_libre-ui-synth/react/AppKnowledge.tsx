"use client";
import React from "react";
import { ArrowRight, BarChart2, Book, BookOpen, Bot, Brain, Building2, ChevronDown, ChevronRight, ChevronsUpDown, Clock, CreditCard, ExternalLink, FileBarChart, FileText, Folder, FolderPlus, Home, Instagram, Layers, LayoutDashboard, MessageCircle, MoreHorizontal, Network, Scale, ScrollText, Search, Settings, Share2, Target, Terminal, TrendingUp, Upload } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4,h5,h6 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    .sidebar-item { transition: background-color 0.15s ease; }
    .sidebar-item:hover { background-color: #f5f5f4; }
    .sidebar-item.active { background-color: #ede9fe; }
    .sidebar-item.active span, .sidebar-item.active i { color: #7c3aed; }
    .folder-item { transition: all 0.12s ease; border-radius: 6px; }
    .folder-item:hover { background-color: #f5f5f4; }
    .folder-item.selected { background-color: #ede9fe; }
    .folder-item.selected span { color: #7c3aed; }
    .doc-row:hover td { background-color: #fafaf9; }
    .sub-item { padding-left: 28px; }
    .usage-bar { height: 3px; background-color: #e7e5e4; border-radius: 2px; }
    .usage-bar-fill { height: 3px; background-color: #7c3aed; border-radius: 2px; transition: width 0.3s ease; }
`;

function AppKnowledge() {
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
      <a href="/app/jobs" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <Clock className="w-4 h-4 text-stone-400" /><span>예약 작업</span>
      </a>
      <a href="/app/knowledge" className="sidebar-item active flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-violet-700 no-underline">
        <BookOpen className="w-4 h-4" /><span>지식베이스</span>
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
        <h1 className="text-xl font-bold text-stone-900">지식베이스</h1>
        <p className="text-sm text-stone-500 mt-0.5">에이전트가 참조하는 문서 및 가이드 관리</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-50 shadow-sm">
          <FolderPlus className="w-4 h-4 text-stone-400" />폴더 추가
        </button>
        {/* API: POST /api/workspace/knowledge */}
        <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 shadow-sm">
          <Upload className="w-4 h-4" />문서 추가
        </button>
      </div>
    </div>

    {/* Stats Row */}
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">전체 문서</p>
        <p className="text-2xl font-bold text-stone-900">42</p>
        <p className="text-xs text-stone-500 mt-1">5개 폴더</p>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">총 활용 횟수</p>
        <p className="text-2xl font-bold text-stone-900">341</p>
        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />이번 달 +89회</p>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">저장 용량</p>
        <p className="text-2xl font-bold text-stone-900">2.1<span className="text-base font-medium text-stone-500 ml-0.5">MB</span></p>
        <p className="text-xs text-stone-500 mt-1">벡터 인덱스 포함</p>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">최다 활용</p>
        <p className="text-sm font-bold text-stone-900 mt-1 leading-snug">KIS API<br />완전 가이드</p>
        <p className="text-xs text-stone-500 mt-1">128회 참조</p>
      </div>
    </div>

    {/* Two-column Layout */}
    {/* API: GET /api/workspace/knowledge */}
    <div className="flex gap-5">

      {/* Left: Folder Tree */}
      <div className="w-52 flex-shrink-0">
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 mb-2">폴더</p>
          <div className="space-y-0.5">

            {/* 전체 */}
            <div className="folder-item selected flex items-center gap-2 px-2 py-2 cursor-pointer">
              <Layers className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-violet-700 flex-1">전체</span>
              <span className="text-xs text-stone-400 bg-stone-100 rounded-full px-1.5 py-0.5 flex-shrink-0">42</span>
            </div>

            {/* 투자 가이드 */}
            <div>
              <div className="folder-item flex items-center gap-2 px-2 py-2 cursor-pointer" onClick="toggleFolder('invest')">
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 folder-chevron" id="invest-chev" />
                <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-sm text-stone-700 flex-1">투자 가이드</span>
                <span className="text-xs text-stone-400 bg-stone-100 rounded-full px-1.5 py-0.5 flex-shrink-0">12</span>
              </div>
              <div id="invest-children" className="space-y-0.5">
                <div className="folder-item sub-item flex items-center gap-2 py-1.5 pr-2 cursor-pointer">
                  <FileText className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className="text-xs text-stone-500 truncate">KIS API 사용 매뉴얼</span>
                </div>
                <div className="folder-item sub-item flex items-center gap-2 py-1.5 pr-2 cursor-pointer">
                  <FileText className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className="text-xs text-stone-500 truncate">주식 분석 기준</span>
                </div>
                <div className="folder-item sub-item flex items-center gap-2 py-1.5 pr-2 cursor-pointer">
                  <FileText className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className="text-xs text-stone-500 truncate">포트폴리오 관리 원칙</span>
                </div>
              </div>
            </div>

            {/* 마케팅 표준 */}
            <div>
              <div className="folder-item flex items-center gap-2 px-2 py-2 cursor-pointer" onClick="toggleFolder('mkt')">
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 folder-chevron" id="mkt-chev" />
                <Folder className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span className="text-sm text-stone-700 flex-1">마케팅 표준</span>
                <span className="text-xs text-stone-400 bg-stone-100 rounded-full px-1.5 py-0.5 flex-shrink-0">8</span>
              </div>
              <div id="mkt-children" className="space-y-0.5">
                <div className="folder-item sub-item flex items-center gap-2 py-1.5 pr-2 cursor-pointer">
                  <FileText className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className="text-xs text-stone-500 truncate">브랜드 가이드</span>
                </div>
                <div className="folder-item sub-item flex items-center gap-2 py-1.5 pr-2 cursor-pointer">
                  <FileText className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className="text-xs text-stone-500 truncate">SNS 운영 정책</span>
                </div>
              </div>
            </div>

            {/* 법무 자료 */}
            <div className="folder-item flex items-center gap-2 px-2 py-2 cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5 text-stone-300 flex-shrink-0" />
              <Folder className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span className="text-sm text-stone-700 flex-1">법무 자료</span>
              <span className="text-xs text-stone-400 bg-stone-100 rounded-full px-1.5 py-0.5 flex-shrink-0">7</span>
            </div>

            {/* 경영 관리 */}
            <div className="folder-item flex items-center gap-2 px-2 py-2 cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5 text-stone-300 flex-shrink-0" />
              <Folder className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-stone-700 flex-1">경영 관리</span>
              <span className="text-xs text-stone-400 bg-stone-100 rounded-full px-1.5 py-0.5 flex-shrink-0">15</span>
            </div>

          </div>

          {/* Storage Info */}
          <div className="mt-4 pt-3 border-t border-stone-100 px-2">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] text-stone-400 font-medium">벡터 인덱스</p>
              <p className="text-[10px] text-stone-500">42 / 1,000 문서</p>
            </div>
            <div className="usage-bar">
              <div className="usage-bar-fill" style={{width: "4.2%"}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Document List */}
      <div className="flex-1 min-w-0">

        {/* Vector Search Bar */}
        <div className="bg-gradient-to-r from-violet-50 to-white rounded-xl border border-violet-100 p-4 mb-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 text-violet-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-violet-700 mb-1">의미 기반 벡터 검색</p>
            <div className="relative">
              <Search className="w-4 h-4 text-violet-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input type="text" placeholder="에이전트가 검색하는 것처럼 의미 기반 검색 — 예: KIS API 인증 방법" className="w-full rounded-lg border border-violet-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
            </div>
          </div>
          <div className="text-xs text-violet-500 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2 flex-shrink-0 text-center">
            <p className="font-semibold">42</p>
            <p>문서</p>
          </div>
        </div>

        {/* Table Controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <select className="rounded-lg border border-stone-200 px-3 py-2 text-xs text-stone-600 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
              <option>모든 폴더</option>
              <option>투자 가이드</option>
              <option>마케팅 표준</option>
              <option>법무 자료</option>
              <option>경영 관리</option>
            </select>
            <select className="rounded-lg border border-stone-200 px-3 py-2 text-xs text-stone-600 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
              <option>최근 수정순</option>
              <option>이름순</option>
              <option>활용 많은 순</option>
              <option>크기 큰 순</option>
            </select>
          </div>
          <p className="text-xs text-stone-500">5개 문서 표시 중</p>
        </div>

        {/* Document Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">문서 제목</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">폴더</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">크기</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">수정일</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">에이전트 활용</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>

              {/* Doc 1: KIS API */}
              <tr className="doc-row border-b border-stone-100 cursor-pointer">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Book className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">KIS API 완전 가이드</p>
                      <p className="text-xs text-stone-400 mt-0.5">인증, 주문 API, 실시간 시세 구독 방법 전체 정리</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 rounded-full px-2.5 py-1 border border-amber-100">
                    <Folder className="w-3 h-3" />투자 가이드
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm text-stone-600">45 KB</td>
                <td className="px-4 py-3.5 text-sm text-stone-600">오늘</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-stone-100 rounded-full h-1.5">
                      <div className="bg-violet-500 h-1.5 rounded-full" style={{width: "100%"}}></div>
                    </div>
                    <span className="text-xs font-semibold text-violet-600">128회</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Doc 2: 마케팅 전략 */}
              <tr className="doc-row border-b border-stone-100 cursor-pointer">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-sky-50 border border-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-sky-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">2025년 마케팅 전략</p>
                      <p className="text-xs text-stone-400 mt-0.5">연간 채널 전략, 예산 배분, KPI 정의 포함</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1 text-xs text-sky-700 bg-sky-50 rounded-full px-2.5 py-1 border border-sky-100">
                    <Folder className="w-3 h-3" />마케팅 표준
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm text-stone-600">12 KB</td>
                <td className="px-4 py-3.5 text-sm text-stone-600">어제</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-stone-100 rounded-full h-1.5">
                      <div className="bg-violet-500 h-1.5 rounded-full" style={{width: "35%"}}></div>
                    </div>
                    <span className="text-xs font-semibold text-stone-600">45회</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Doc 3: SNS 콘텐츠 가이드라인 */}
              <tr className="doc-row border-b border-stone-100 cursor-pointer">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-sky-50 border border-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Instagram className="w-4 h-4 text-sky-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">SNS 콘텐츠 가이드라인</p>
                      <p className="text-xs text-stone-400 mt-0.5">인스타·유튜브 톤&매너, 금지 표현, 해시태그 규칙</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1 text-xs text-sky-700 bg-sky-50 rounded-full px-2.5 py-1 border border-sky-100">
                    <Folder className="w-3 h-3" />마케팅 표준
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm text-stone-600">8 KB</td>
                <td className="px-4 py-3.5 text-sm text-stone-600">3일 전</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-stone-100 rounded-full h-1.5">
                      <div className="bg-violet-500 h-1.5 rounded-full" style={{width: "52%"}}></div>
                    </div>
                    <span className="text-xs font-semibold text-stone-600">67회</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Doc 4: 파트너십 계약 표준 */}
              <tr className="doc-row border-b border-stone-100 cursor-pointer">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Scale className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">파트너십 계약 표준</p>
                      <p className="text-xs text-stone-400 mt-0.5">표준 계약서 양식, 필수 조항 체크리스트, 검토 기준</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1 text-xs text-rose-700 bg-rose-50 rounded-full px-2.5 py-1 border border-rose-100">
                    <Folder className="w-3 h-3" />법무 자료
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm text-stone-600">23 KB</td>
                <td className="px-4 py-3.5 text-sm text-stone-600">1주 전</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-stone-100 rounded-full h-1.5">
                      <div className="bg-violet-500 h-1.5 rounded-full" style={{width: "9%"}}></div>
                    </div>
                    <span className="text-xs font-semibold text-stone-600">12회</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Doc 5: 월간 성과 지표 정의 */}
              <tr className="doc-row cursor-pointer">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">월간 성과 지표 정의</p>
                      <p className="text-xs text-stone-400 mt-0.5">부서별 KPI 정의, 측정 방법, 목표 기준값 문서</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1 border border-emerald-100">
                    <Folder className="w-3 h-3" />경영 관리
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm text-stone-600">6 KB</td>
                <td className="px-4 py-3.5 text-sm text-stone-600">2주 전</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-stone-100 rounded-full h-1.5">
                      <div className="bg-violet-500 h-1.5 rounded-full" style={{width: "69%"}}></div>
                    </div>
                    <span className="text-xs font-semibold text-stone-600">89회</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>

            </tbody>
          </table>

          {/* Table Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 bg-stone-50/50">
            <p className="text-xs text-stone-500">42개 문서 중 5개 표시</p>
            <button className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1">
              전체 보기<ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </div>

  </main>
    </>
  );
}

export default AppKnowledge;
