"use client";
import React from "react";
import { BarChart2, BookOpen, Bot, Building2, ChevronsUpDown, Clock, CreditCard, File, FileBarChart, FileEdit, FileText, Folder, FolderOpen, FolderPlus, HardDrive, Home, Image, LayoutDashboard, LayoutGrid, List, MessageCircle, MoreHorizontal, Network, ScrollText, Search, Settings, Share2, Table2, Terminal, TrendingUp, Upload, UploadCloud } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4,h5,h6 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    .sidebar-item { transition: background-color 0.15s ease; }
    .sidebar-item:hover { background-color: #f5f5f4; }
    .sidebar-item.active { background-color: #ede9fe; }
    .sidebar-item.active span, .sidebar-item.active i { color: #7c3aed; }
    .file-card { transition: box-shadow 0.15s ease, border-color 0.15s ease; cursor: pointer; }
    .file-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: #d6d3d1; }
    .folder-card { transition: box-shadow 0.15s ease, border-color 0.15s ease; cursor: pointer; }
    .folder-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: #fbbf24; }
    .file-card.selected { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124,58,237,0.1); }
    .view-btn.active { background-color: #7c3aed; color: white; }
    .breadcrumb-sep::before { content: '/'; color: #a8a29e; margin: 0 4px; }
    .drop-zone-active { border-color: #7c3aed; background-color: #f5f3ff; }
`;

function AppFiles() {
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
      <a href="/app/knowledge" className="sidebar-item flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 no-underline">
        <BookOpen className="w-4 h-4 text-stone-400" /><span>지식베이스</span>
      </a>
      <a href="/app/files" className="sidebar-item active flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-violet-700 no-underline">
        <Folder className="w-4 h-4" /><span>파일</span>
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
  <main className="ml-60 min-h-screen p-6 flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between mb-5">
      <div>
        <h1 className="text-xl font-bold text-stone-900">파일</h1>
        <p className="text-sm text-stone-500 mt-0.5">워크스페이스 파일 저장소</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-50 shadow-sm">
          <FolderPlus className="w-4 h-4 text-stone-400" />폴더 만들기
        </button>
        {/* API: POST /api/workspace/files/upload */}
        <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 shadow-sm">
          <Upload className="w-4 h-4" />업로드
        </button>
      </div>
    </div>

    {/* Toolbar: Breadcrumb + Search + View Toggle */}
    <div className="flex items-center justify-between mb-4 gap-3">
      {/* Breadcrumb */}
      <div className="flex items-center gap-0 bg-white border border-stone-200 rounded-lg px-3 py-2 shadow-sm flex-1 max-w-md">
        <Home className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
        <button className="text-sm text-stone-500 hover:text-violet-600 ml-2">ACME Corp</button>
        <span className="breadcrumb-sep"></span>
        <button className="text-sm text-stone-500 hover:text-violet-600">마케팅</button>
        <span className="breadcrumb-sep"></span>
        <span className="text-sm font-semibold text-stone-800">2025년 3월</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input type="text" placeholder="파일 검색..." className="rounded-lg border border-stone-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-44" />
        </div>
        {/* Sort */}
        <select className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-600 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option>이름순</option>
          <option>최근 수정</option>
          <option>크기순</option>
        </select>
        {/* View Toggle */}
        <div className="flex bg-stone-100 border border-stone-200 rounded-lg p-0.5 gap-0.5">
          <button className="view-btn active w-8 h-8 flex items-center justify-center rounded-md text-white" id="gridBtn" onClick="setView('grid')">
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button className="view-btn w-8 h-8 flex items-center justify-center rounded-md text-stone-500 hover:text-stone-700" id="listBtn" onClick="setView('list')">
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    {/* Drop Zone hint */}
    <div id="dropZone" className="border-2 border-dashed border-stone-200 rounded-xl p-3 mb-4 flex items-center gap-3 text-stone-400 text-xs bg-white/50 hover:border-violet-300 hover:text-violet-400 transition-all cursor-pointer" onClick="document.getElementById('fileInput').click()">
      <UploadCloud className="w-5 h-5 flex-shrink-0" />
      <span>파일을 여기에 드래그하거나 클릭하여 업로드 — PDF, Excel, Word, 이미지 지원</span>
      <input type="file" id="fileInput" className="hidden" multiple />
    </div>

    {/* Grid View */}
    {/* API: GET /api/workspace/files */}
    <div id="gridView" className="flex-1">

      {/* Folders Section */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Folder className="w-4 h-4 text-stone-400" />
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">폴더 (3)</p>
        </div>
        <div className="grid grid-cols-4 gap-3">

          {/* Folder 1 */}
          <div className="folder-card bg-amber-50 border border-amber-200 rounded-xl p-4 group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-amber-500" />
              </div>
              <button className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-amber-100 text-amber-400">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-stone-800 mb-0.5 leading-snug">2025년 3월 보고서</p>
            <p className="text-xs text-amber-600">12개 파일</p>
          </div>

          {/* Folder 2 */}
          <div className="folder-card bg-amber-50 border border-amber-200 rounded-xl p-4 group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-amber-500" />
              </div>
              <button className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-amber-100 text-amber-400">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-stone-800 mb-0.5 leading-snug">마케팅 자료</p>
            <p className="text-xs text-amber-600">25개 파일</p>
          </div>

          {/* Folder 3 */}
          <div className="folder-card bg-amber-50 border border-amber-200 rounded-xl p-4 group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-amber-500" />
              </div>
              <button className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-amber-100 text-amber-400">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-stone-800 mb-0.5 leading-snug">투자 분석</p>
            <p className="text-xs text-amber-600">18개 파일</p>
          </div>

        </div>
      </div>

      {/* Files Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <File className="w-4 h-4 text-stone-400" />
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">파일 (5)</p>
        </div>
        <div className="grid grid-cols-4 gap-3">

          {/* File 1: Excel */}
          <div className="file-card bg-white border border-stone-200 rounded-xl p-4 group" onClick="selectFile(this)">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                <Table2 className="w-5 h-5 text-emerald-600" />
              </div>
              <button className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-stone-800 mb-0.5 leading-snug truncate" title="포트폴리오_분석_2025.xlsx">포트폴리오_분석_2025.xlsx</p>
            <p className="text-xs text-stone-400">2.4 MB · 오늘</p>
            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-1.5">
              <span className="text-[10px] bg-emerald-50 text-emerald-600 rounded px-1.5 py-0.5 border border-emerald-100">Excel</span>
            </div>
          </div>

          {/* File 2: PDF (계약서) */}
          <div className="file-card bg-white border border-stone-200 rounded-xl p-4 group" onClick="selectFile(this)">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-500" />
              </div>
              <button className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-stone-800 mb-0.5 leading-snug truncate" title="파트너십_계약서.pdf">파트너십_계약서.pdf</p>
            <p className="text-xs text-stone-400">856 KB · 어제</p>
            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-1.5">
              <span className="text-[10px] bg-red-50 text-red-600 rounded px-1.5 py-0.5 border border-red-100">PDF</span>
            </div>
          </div>

          {/* File 3: Image */}
          <div className="file-card bg-white border border-stone-200 rounded-xl p-4 group" onClick="selectFile(this)">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center">
                <Image className="w-5 h-5 text-violet-500" />
              </div>
              <button className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-stone-800 mb-0.5 leading-snug truncate" title="봄_캠페인_이미지.png">봄_캠페인_이미지.png</p>
            <p className="text-xs text-stone-400">3.2 MB · 2일 전</p>
            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-1.5">
              <span className="text-[10px] bg-violet-50 text-violet-600 rounded px-1.5 py-0.5 border border-violet-100">PNG</span>
            </div>
          </div>

          {/* File 4: Word */}
          <div className="file-card bg-white border border-stone-200 rounded-xl p-4 group" onClick="selectFile(this)">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-center">
                <FileEdit className="w-5 h-5 text-sky-500" />
              </div>
              <button className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-stone-800 mb-0.5 leading-snug truncate" title="주간_업무_보고.docx">주간_업무_보고.docx</p>
            <p className="text-xs text-stone-400">124 KB · 3일 전</p>
            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-1.5">
              <span className="text-[10px] bg-sky-50 text-sky-600 rounded px-1.5 py-0.5 border border-sky-100">Word</span>
            </div>
          </div>

          {/* File 5: PDF (법인세) */}
          <div className="file-card bg-white border border-stone-200 rounded-xl p-4 group" onClick="selectFile(this)">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-500" />
              </div>
              <button className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-stone-800 mb-0.5 leading-snug truncate" title="법인세_검토.pdf">법인세_검토.pdf</p>
            <p className="text-xs text-stone-400">421 KB · 1주 전</p>
            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-1.5">
              <span className="text-[10px] bg-red-50 text-red-600 rounded px-1.5 py-0.5 border border-red-100">PDF</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    {/* List View (hidden by default) */}
    <div id="listView" className="flex-1 hidden">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3 w-8"><input type="checkbox" className="rounded border-stone-300" /></th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">이름</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">크기</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">수정일</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">형식</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3"><input type="checkbox" className="rounded border-stone-300" /></td>
              <td className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center flex-shrink-0"><FolderOpen className="w-4 h-4 text-amber-500" /></div>
                <span className="text-sm font-semibold text-stone-800">2025년 3월 보고서</span>
              </td>
              <td className="px-4 py-3 text-sm text-stone-500">—</td>
              <td className="px-4 py-3 text-sm text-stone-500">—</td>
              <td className="px-4 py-3"><span className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-0.5">폴더</span></td>
              <td className="px-4 py-3"><button className="text-stone-400 hover:text-stone-600"><MoreHorizontal className="w-4 h-4" /></button></td>
            </tr>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3"><input type="checkbox" className="rounded border-stone-300" /></td>
              <td className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0"><Table2 className="w-4 h-4 text-emerald-600" /></div>
                <span className="text-sm text-stone-700">포트폴리오_분석_2025.xlsx</span>
              </td>
              <td className="px-4 py-3 text-sm text-stone-500">2.4 MB</td>
              <td className="px-4 py-3 text-sm text-stone-500">오늘</td>
              <td className="px-4 py-3"><span className="text-xs text-emerald-600 bg-emerald-50 rounded px-2 py-0.5">Excel</span></td>
              <td className="px-4 py-3"><button className="text-stone-400 hover:text-stone-600"><MoreHorizontal className="w-4 h-4" /></button></td>
            </tr>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3"><input type="checkbox" className="rounded border-stone-300" /></td>
              <td className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4 text-red-500" /></div>
                <span className="text-sm text-stone-700">파트너십_계약서.pdf</span>
              </td>
              <td className="px-4 py-3 text-sm text-stone-500">856 KB</td>
              <td className="px-4 py-3 text-sm text-stone-500">어제</td>
              <td className="px-4 py-3"><span className="text-xs text-red-600 bg-red-50 rounded px-2 py-0.5">PDF</span></td>
              <td className="px-4 py-3"><button className="text-stone-400 hover:text-stone-600"><MoreHorizontal className="w-4 h-4" /></button></td>
            </tr>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3"><input type="checkbox" className="rounded border-stone-300" /></td>
              <td className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-50 border border-violet-100 rounded-lg flex items-center justify-center flex-shrink-0"><Image className="w-4 h-4 text-violet-500" /></div>
                <span className="text-sm text-stone-700">봄_캠페인_이미지.png</span>
              </td>
              <td className="px-4 py-3 text-sm text-stone-500">3.2 MB</td>
              <td className="px-4 py-3 text-sm text-stone-500">2일 전</td>
              <td className="px-4 py-3"><span className="text-xs text-violet-600 bg-violet-50 rounded px-2 py-0.5">PNG</span></td>
              <td className="px-4 py-3"><button className="text-stone-400 hover:text-stone-600"><MoreHorizontal className="w-4 h-4" /></button></td>
            </tr>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3"><input type="checkbox" className="rounded border-stone-300" /></td>
              <td className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-sky-50 border border-sky-100 rounded-lg flex items-center justify-center flex-shrink-0"><FileEdit className="w-4 h-4 text-sky-500" /></div>
                <span className="text-sm text-stone-700">주간_업무_보고.docx</span>
              </td>
              <td className="px-4 py-3 text-sm text-stone-500">124 KB</td>
              <td className="px-4 py-3 text-sm text-stone-500">3일 전</td>
              <td className="px-4 py-3"><span className="text-xs text-sky-600 bg-sky-50 rounded px-2 py-0.5">Word</span></td>
              <td className="px-4 py-3"><button className="text-stone-400 hover:text-stone-600"><MoreHorizontal className="w-4 h-4" /></button></td>
            </tr>
            <tr className="hover:bg-stone-50/50">
              <td className="px-4 py-3"><input type="checkbox" className="rounded border-stone-300" /></td>
              <td className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4 text-red-500" /></div>
                <span className="text-sm text-stone-700">법인세_검토.pdf</span>
              </td>
              <td className="px-4 py-3 text-sm text-stone-500">421 KB</td>
              <td className="px-4 py-3 text-sm text-stone-500">1주 전</td>
              <td className="px-4 py-3"><span className="text-xs text-red-600 bg-red-50 rounded px-2 py-0.5">PDF</span></td>
              <td className="px-4 py-3"><button className="text-stone-400 hover:text-stone-600"><MoreHorizontal className="w-4 h-4" /></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {/* Storage Status Bar */}
    <div className="mt-6 bg-white rounded-xl border border-stone-200 shadow-sm px-5 py-3.5 flex items-center gap-5">
      <div className="flex items-center gap-2 flex-shrink-0">
        <HardDrive className="w-4 h-4 text-stone-400" />
        <span className="text-sm text-stone-600 font-medium">스토리지 사용량</span>
      </div>
      {/* Usage Bar */}
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 bg-stone-100 rounded-full h-2">
          <div className="bg-gradient-to-r from-violet-500 to-violet-400 h-2 rounded-full" style={{width: "28%"}}></div>
        </div>
        <span className="text-sm font-semibold text-stone-700 flex-shrink-0">2.8 GB</span>
        <span className="text-sm text-stone-400 flex-shrink-0">/ 10 GB</span>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0 text-xs text-stone-500 border-l border-stone-100 pl-5">
        <span>총 <span className="font-semibold text-stone-700">42</span>개 파일</span>
        <span>폴더 <span className="font-semibold text-stone-700">3</span>개</span>
        <span>여유 <span className="font-semibold text-emerald-600">7.2 GB</span></span>
      </div>
    </div>

  </main>
    </>
  );
}

export default AppFiles;
