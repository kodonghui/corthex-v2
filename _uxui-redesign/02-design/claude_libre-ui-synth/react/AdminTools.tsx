"use client";
import React from "react";
import { Activity, AlertTriangle, BarChart2, Bot, Building2, Database, DollarSign, FileEdit, FileSearch, FileText, GitBranch, GitFork, Globe, Image, Info, Instagram, KeyRound, LayoutDashboard, Mail, Monitor, Scale, Search, Settings, Shield, ShoppingCart, Sparkles, Store, TrendingUp, UserPlus, Users, Workflow, Wrench } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; } h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; } code,pre { font-family: 'JetBrains Mono', monospace; }`;

function AdminTools() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      {/* Sidebar */}
  <aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-40">
    <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2.5">
      <span className="bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider">ADMIN</span>
      <span className="font-bold text-stone-900 text-base" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
    </div>
    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 text-sm">
      <a href="/admin/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><LayoutDashboard className="w-4 h-4" />대시보드</a>
      <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Building2 className="w-4 h-4" />조직 관리</a>
      <a href="/admin/org-chart" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><GitFork className="w-4 h-4" />조직도</a>
      <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Users className="w-4 h-4" />인간 직원</a>
      <a href="/admin/agents" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Bot className="w-4 h-4" />AI 에이전트</a>
      <a href="/admin/tools" className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-violet-50 text-violet-700 font-medium"><Wrench className="w-4 h-4" />도구 관리</a>
      <a href="/admin/credentials" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><KeyRound className="w-4 h-4" />크리덴셜</a>
      <a href="/admin/soul-templates" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Sparkles className="w-4 h-4" />소울 템플릿</a>
      <a href="/admin/template-market" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Store className="w-4 h-4" />템플릿 마켓</a>
      <a href="/admin/monitoring" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Activity className="w-4 h-4" />모니터링</a>
      <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><BarChart2 className="w-4 h-4" />성과 분석</a>
      <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><FileText className="w-4 h-4" />보고서</a>
      <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Workflow className="w-4 h-4" />워크플로우</a>
      <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Database className="w-4 h-4" />지식 베이스</a>
      <a href="/admin/onboarding" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><UserPlus className="w-4 h-4" />온보딩</a>
      <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Shield className="w-4 h-4" />보안/감사</a>
      <a href="/admin/report-lines" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><GitBranch className="w-4 h-4" />보고 체계</a>
      <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><DollarSign className="w-4 h-4" />비용 관리</a>
      <a href="/admin/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Settings className="w-4 h-4" />설정</a>
    </nav>
    <div className="px-4 py-3 border-t border-stone-100 flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">관</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-900 truncate">관리자</p>
        <p className="text-xs text-stone-500 truncate">admin@corthex.io</p>
      </div>
    </div>
  </aside>

  {/* Main Content */}
  <main className="ml-60 min-h-screen">
    <div className="max-w-6xl mx-auto px-8 py-8">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold text-stone-900">도구 관리</h1>
          <p className="text-sm text-stone-500 mt-0.5">에이전트가 사용할 수 있는 125+ 도구를 관리합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="도구명 검색..." className="rounded-lg border border-stone-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-52" />
          </div>
          <select className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-stone-700">
            <option>상태 전체</option>
            <option>활성</option>
            <option>비활성</option>
          </select>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-stone-100 border border-stone-200 rounded-xl px-5 py-3 mb-5 flex items-center gap-3">
        <Info className="w-4 h-4 text-stone-500 flex-shrink-0" />
        <p className="text-sm text-stone-600">에이전트가 사용할 수 있는 <strong className="font-semibold text-stone-800">125+</strong> 도구를 관리합니다. 각 에이전트의 도구 권한은 <a href="/admin/agents" className="text-violet-600 hover:underline font-medium">에이전트 설정</a>에서 변경하세요.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">전체 도구</p>
          <p className="text-2xl font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>125</p>
          <p className="text-xs text-stone-400 mt-0.5">6개 카테고리</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">활성 도구</p>
          <p className="text-2xl font-bold text-emerald-600" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>118</p>
          <p className="text-xs text-stone-400 mt-0.5">94.4% 가동 중</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">오늘 총 호출</p>
          <p className="text-2xl font-bold text-violet-600" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>1,416</p>
          <p className="text-xs text-stone-400 mt-0.5">전일 대비 +12%</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">비활성 (크리덴셜 만료)</p>
          <p className="text-2xl font-bold text-amber-600" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>7</p>
          <p className="text-xs text-stone-400 mt-0.5">갱신 필요</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 mb-5 bg-white rounded-xl border border-stone-200 shadow-sm p-1.5">
        <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-violet-600 text-white">전체 <span className="ml-1 bg-violet-500 text-white text-xs px-1.5 py-0.5 rounded-full">125</span></button>
        <button className="px-4 py-2 text-sm font-medium rounded-lg text-stone-600 hover:bg-stone-100">금융 <span className="ml-1 bg-stone-100 text-stone-500 text-xs px-1.5 py-0.5 rounded-full">28</span></button>
        <button className="px-4 py-2 text-sm font-medium rounded-lg text-stone-600 hover:bg-stone-100">마케팅 <span className="ml-1 bg-stone-100 text-stone-500 text-xs px-1.5 py-0.5 rounded-full">22</span></button>
        <button className="px-4 py-2 text-sm font-medium rounded-lg text-stone-600 hover:bg-stone-100">법무 <span className="ml-1 bg-stone-100 text-stone-500 text-xs px-1.5 py-0.5 rounded-full">15</span></button>
        <button className="px-4 py-2 text-sm font-medium rounded-lg text-stone-600 hover:bg-stone-100">기술 <span className="ml-1 bg-stone-100 text-stone-500 text-xs px-1.5 py-0.5 rounded-full">35</span></button>
        <button className="px-4 py-2 text-sm font-medium rounded-lg text-stone-600 hover:bg-stone-100">공통 <span className="ml-1 bg-stone-100 text-stone-500 text-xs px-1.5 py-0.5 rounded-full">25</span></button>
      </div>

      {/* Tools Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">도구명</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">카테고리</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">설명</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">활성 에이전트</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">오늘 호출</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">상태</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">필요 크리덴셜</th>
            </tr>
          </thead>
          <tbody>
            {/* web_search */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <code className="text-xs font-medium text-stone-800">web_search</code>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-600">공통</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-600">웹 검색 수행</span></td>
              <td className="px-4 py-3"><span className="text-sm font-semibold text-stone-800">12 에이전트</span></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full w-16"><div className="h-1.5 bg-violet-500 rounded-full" style={{"width":"57%"}}></div></div>
                  <span className="text-sm text-stone-700 font-medium">324회</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">활성</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-400">—</span></td>
            </tr>
            {/* get_stock_price */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                  </div>
                  <code className="text-xs font-medium text-stone-800">get_stock_price</code>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-sky-50 text-sky-700">금융</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-600">실시간 주가 조회</span></td>
              <td className="px-4 py-3"><span className="text-sm font-semibold text-stone-800">2 에이전트</span></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full w-16"><div className="h-1.5 bg-sky-500 rounded-full" style={{"width":"25%"}}></div></div>
                  <span className="text-sm text-stone-700 font-medium">145회</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">활성</span></td>
              <td className="px-4 py-3">
                <span className="text-xs text-sky-700 bg-sky-50 border border-sky-100 rounded-full px-2 py-0.5">KIS API</span>
              </td>
            </tr>
            {/* place_order */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
                    <ShoppingCart className="w-3.5 h-3.5 text-sky-700" />
                  </div>
                  <code className="text-xs font-medium text-stone-800">place_order</code>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-sky-50 text-sky-700">금융</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-600">주식 주문 실행</span></td>
              <td className="px-4 py-3"><span className="text-sm font-semibold text-stone-800">1 에이전트</span></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full w-16"><div className="h-1.5 bg-sky-500 rounded-full" style={{"width":"2%"}}></div></div>
                  <span className="text-sm text-stone-700 font-medium">12회</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">활성</span></td>
              <td className="px-4 py-3">
                <span className="text-xs text-sky-700 bg-sky-50 border border-sky-100 rounded-full px-2 py-0.5">KIS API</span>
              </td>
            </tr>
            {/* generate_image */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                    <Image className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <code className="text-xs font-medium text-stone-800">generate_image</code>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-rose-50 text-rose-700">마케팅</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-600">이미지 생성</span></td>
              <td className="px-4 py-3"><span className="text-sm font-semibold text-stone-800">3 에이전트</span></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full w-16"><div className="h-1.5 bg-rose-400 rounded-full" style={{"width":"8%"}}></div></div>
                  <span className="text-sm text-stone-700 font-medium">45회</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">활성</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-400">—</span></td>
            </tr>
            {/* instagram_post (inactive) */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50 opacity-70">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-pink-50 flex items-center justify-center">
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  </div>
                  <code className="text-xs font-medium text-stone-800">instagram_post</code>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-rose-50 text-rose-700">마케팅</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-600">인스타그램 발행</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-500">1 에이전트</span></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full w-16"><div className="h-1.5 bg-stone-300 rounded-full" style={{"width":"1%"}}></div></div>
                  <span className="text-sm text-stone-400 font-medium">8회</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-50 text-red-700">비활성</span></td>
              <td className="px-4 py-3">
                <span className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5 flex items-center gap-1 w-fit">
                  <AlertTriangle className="w-2.5 h-2.5" />Instagram API (만료)
                </span>
              </td>
            </tr>
            {/* read_document */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
                    <FileSearch className="w-3.5 h-3.5 text-stone-600" />
                  </div>
                  <code className="text-xs font-medium text-stone-800">read_document</code>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-600">공통</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-600">문서 읽기</span></td>
              <td className="px-4 py-3"><span className="text-sm font-semibold text-stone-800">8 에이전트</span></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full w-16"><div className="h-1.5 bg-violet-500 rounded-full" style={{"width":"100%"}}></div></div>
                  <span className="text-sm text-stone-700 font-medium">567회</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">활성</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-400">—</span></td>
            </tr>
            {/* write_file */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
                    <FileEdit className="w-3.5 h-3.5 text-stone-600" />
                  </div>
                  <code className="text-xs font-medium text-stone-800">write_file</code>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-600">공통</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-600">파일 저장</span></td>
              <td className="px-4 py-3"><span className="text-sm font-semibold text-stone-800">6 에이전트</span></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full w-16"><div className="h-1.5 bg-violet-400 rounded-full" style={{"width":"41%"}}></div></div>
                  <span className="text-sm text-stone-700 font-medium">234회</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">활성</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-400">—</span></td>
            </tr>
            {/* legal_search */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Scale className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <code className="text-xs font-medium text-stone-800">legal_search</code>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-700">법무</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-600">법령 데이터베이스 검색</span></td>
              <td className="px-4 py-3"><span className="text-sm font-semibold text-stone-800">1 에이전트</span></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full w-16"><div className="h-1.5 bg-amber-400 rounded-full" style={{"width":"8%"}}></div></div>
                  <span className="text-sm text-stone-700 font-medium">45회</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">활성</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-400">—</span></td>
            </tr>
            {/* selenium_browser */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Monitor className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <code className="text-xs font-medium text-stone-800">selenium_browser</code>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">기술</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-600">웹 자동화</span></td>
              <td className="px-4 py-3"><span className="text-sm font-semibold text-stone-800">2 에이전트</span></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full w-16"><div className="h-1.5 bg-emerald-400 rounded-full" style={{"width":"4%"}}></div></div>
                  <span className="text-sm text-stone-700 font-medium">23회</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">활성</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-400">—</span></td>
            </tr>
            {/* send_email */}
            <tr className="hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <code className="text-xs font-medium text-stone-800">send_email</code>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-600">공통</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-600">이메일 발송</span></td>
              <td className="px-4 py-3"><span className="text-sm font-semibold text-stone-800">4 에이전트</span></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full w-16"><div className="h-1.5 bg-blue-400 rounded-full" style={{"width":"2%"}}></div></div>
                  <span className="text-sm text-stone-700 font-medium">12회</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">활성</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-400">—</span></td>
            </tr>
          </tbody>
        </table>
        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-stone-100 flex items-center justify-between">
          <span className="text-sm text-stone-500">10개 표시 중 / 전체 125개</span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-lg text-sm text-stone-500 hover:bg-stone-100 border border-stone-200">이전</button>
            <button className="px-3 py-1.5 rounded-lg text-sm bg-violet-600 text-white font-semibold">1</button>
            <button className="px-3 py-1.5 rounded-lg text-sm text-stone-600 hover:bg-stone-100 border border-stone-200">2</button>
            <button className="px-3 py-1.5 rounded-lg text-sm text-stone-600 hover:bg-stone-100 border border-stone-200">3</button>
            <span className="px-2 text-stone-400">...</span>
            <button className="px-3 py-1.5 rounded-lg text-sm text-stone-600 hover:bg-stone-100 border border-stone-200">13</button>
            <button className="px-3 py-1.5 rounded-lg text-sm text-stone-600 hover:bg-stone-100 border border-stone-200">다음</button>
          </div>
        </div>
      </div>

      {/* API Reference */}
      <div className="mt-6 bg-stone-900 rounded-xl p-5">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">API Reference</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-400 w-14 flex-shrink-0">GET</span>
            <code className="text-xs text-stone-300">/api/admin/tools</code>
            <span className="text-xs text-stone-500">— 전체 도구 목록 조회 (카테고리, 상태 필터 지원)</span>
          </div>
        </div>
      </div>

    </div>
  </main>
    </>
  );
}

export default AdminTools;
