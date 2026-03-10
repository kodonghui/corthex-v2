"use client";
import React from "react";
import { Activity, BarChart2, Bell, Bot, Building2, ChevronLeft, ChevronRight, Copy, CreditCard, Database, Download, FileText, GitBranch, Globe, Key, LayoutDashboard, Package, Plug, Search, Settings, ShieldCheck, ShoppingCart, Star, Store, User, UserCheck, Users } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; } h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; } code,pre { font-family: 'JetBrains Mono', monospace; }`;

function AdminTemplateMarket() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      {/* Sidebar */}
<aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-10">
  <div className="px-5 py-4 border-b border-stone-100">
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] font-bold bg-violet-600 text-white px-1.5 py-0.5 rounded tracking-widest">ADMIN</span>
      <span className="font-bold text-stone-900 text-base" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
    </div>
  </div>
  <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-2.5">
    <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
      <User className="w-3.5 h-3.5 text-violet-600" />
    </div>
    <div>
      <div className="text-xs font-semibold text-stone-900">관리자</div>
      <div className="text-[10px] text-stone-400">Super Admin</div>
    </div>
  </div>
  <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 pb-1.5 pt-1">개요</p>
    <a href="/admin/dashboard" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><LayoutDashboard className="w-4 h-4" />대시보드</a>
    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 pb-1.5 pt-3">조직 관리</p>
    <a href="/admin/onboarding" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Building2 className="w-4 h-4" />회사 온보딩</a>
    <a href="/admin/org-templates" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Copy className="w-4 h-4" />조직 템플릿</a>
    <a href="/admin/report-lines" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><GitBranch className="w-4 h-4" />보고 라인</a>
    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 pb-1.5 pt-3">에이전트</p>
    <a href="/admin/agents" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Bot className="w-4 h-4" />에이전트 관리</a>
    <a href="/admin/agent-marketplace" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Store className="w-4 h-4" />에이전트 마켓</a>
    <a href="/admin/credentials" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Key className="w-4 h-4" />크리덴셜</a>
    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 pb-1.5 pt-3">마켓플레이스</p>
    <a href="#" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-violet-50 text-violet-700 font-medium text-sm"><Package className="w-4 h-4" />템플릿 마켓</a>
    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 pb-1.5 pt-3">시스템</p>
    <a href="/admin/monitoring" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Activity className="w-4 h-4" />모니터링</a>
    <a href="/admin/api-keys" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><ShieldCheck className="w-4 h-4" />API 키</a>
    <a href="/admin/settings" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Settings className="w-4 h-4" />시스템 설정</a>
    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 pb-1.5 pt-3">사용자</p>
    <a href="#" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Users className="w-4 h-4" />사용자 관리</a>
    <a href="#" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><UserCheck className="w-4 h-4" />역할·권한</a>
    <a href="#" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><BarChart2 className="w-4 h-4" />사용 통계</a>
    <a href="#" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><CreditCard className="w-4 h-4" />청구·결제</a>
    <a href="#" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Bell className="w-4 h-4" />알림 설정</a>
    <a href="#" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><FileText className="w-4 h-4" />감사 로그</a>
    <a href="#" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Database className="w-4 h-4" />데이터 관리</a>
    <a href="#" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Plug className="w-4 h-4" />인테그레이션</a>
  </nav>
</aside>

{/* Main */}
<main className="ml-60 min-h-screen p-8">
  {/* API 주석: GET /api/admin/template-market */}

  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-xl font-bold text-stone-900">템플릿 마켓</h1>
      <p className="text-sm text-stone-500 mt-0.5">검증된 조직 구조 템플릿을 가져와 즉시 사용하세요</p>
    </div>
    {/* Search Bar */}
    <div className="relative">
      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input type="text" placeholder="템플릿 검색..." className="rounded-lg border border-stone-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-64 bg-white" />
    </div>
  </div>

  {/* Info Banner */}
  <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3.5 mb-6 flex items-center gap-3">
    <Globe className="w-4 h-4 text-blue-500 shrink-0" />
    <p className="text-sm text-blue-700">다른 CORTHEX 사용자가 공유한 조직 템플릿을 가져올 수 있습니다. 가져온 템플릿은 내 조직에 맞게 커스터마이징 가능합니다.</p>
  </div>

  {/* Tabs */}
  <div className="flex items-center gap-1 mb-6 bg-white border border-stone-200 rounded-xl p-1 w-fit">
    <button className="px-4 py-1.5 text-sm font-medium rounded-lg bg-violet-600 text-white transition-colors">인기</button>
    <button className="px-4 py-1.5 text-sm font-medium rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">최신</button>
    <button className="px-4 py-1.5 text-sm font-medium rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">카테고리별</button>
  </div>

  {/* Stats Row */}
  <div className="grid grid-cols-4 gap-4 mb-6">
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
        <Package className="w-4 h-4 text-violet-600" />
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900">1,284</div>
        <div className="text-xs text-stone-500">전체 템플릿</div>
      </div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
        <Download className="w-4 h-4 text-green-600" />
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900">48.2K</div>
        <div className="text-xs text-stone-500">총 다운로드</div>
      </div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
        <Users className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900">892</div>
        <div className="text-xs text-stone-500">기여 유저</div>
      </div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
        <Star className="w-4 h-4 text-amber-500" />
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900">4.6</div>
        <div className="text-xs text-stone-500">평균 평점</div>
      </div>
    </div>
  </div>

  {/* Market Grid */}
  <div className="grid grid-cols-3 gap-4">

    {/* Card 1: B2B SaaS 영업팀 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">💼</div>
          <div>
            <div className="font-semibold text-stone-900 text-sm">B2B SaaS 영업팀</div>
            <div className="text-xs text-stone-400 mt-0.5">by <span className="text-violet-600 font-medium">@sales_master</span></div>
          </div>
        </div>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-600">무료</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600">영업</span>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600">SaaS</span>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600">B2B</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">3</div>
          <div className="text-[10px] text-stone-400">부서</div>
        </div>
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">9</div>
          <div className="text-[10px] text-stone-400">에이전트</div>
        </div>
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">2.3K</div>
          <div className="text-[10px] text-stone-400">다운로드</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-semibold text-stone-800">4.8</span>
          <span className="text-xs text-stone-400">(124)</span>
        </div>
      </div>

      <button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
        <Download className="w-3.5 h-3.5" />
        가져오기
      </button>
    </div>

    {/* Card 2: AI 콘텐츠 팩토리 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-xl">✍️</div>
          <div>
            <div className="font-semibold text-stone-900 text-sm">AI 콘텐츠 팩토리</div>
            <div className="text-xs text-stone-400 mt-0.5">by <span className="text-violet-600 font-medium">@content_ai</span></div>
          </div>
        </div>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-600">무료</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-pink-50 text-pink-600">콘텐츠</span>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-pink-50 text-pink-600">마케팅</span>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-pink-50 text-pink-600">SNS</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">2</div>
          <div className="text-[10px] text-stone-400">부서</div>
        </div>
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">7</div>
          <div className="text-[10px] text-stone-400">에이전트</div>
        </div>
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">1.9K</div>
          <div className="text-[10px] text-stone-400">다운로드</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-semibold text-stone-800">4.6</span>
          <span className="text-xs text-stone-400">(87)</span>
        </div>
      </div>

      <button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
        <Download className="w-3.5 h-3.5" />
        가져오기
      </button>
    </div>

    {/* Card 3: 퀀트 트레이딩팀 (유료) */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow relative">
      <div className="absolute top-3 right-3">
        <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-violet-100 text-violet-700">$9.99</span>
      </div>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl">📈</div>
          <div>
            <div className="font-semibold text-stone-900 text-sm">퀀트 트레이딩팀</div>
            <div className="text-xs text-stone-400 mt-0.5">by <span className="text-violet-600 font-medium">@quant_pro</span></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-600">투자</span>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-600">퀀트</span>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-600">자동매매</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">4</div>
          <div className="text-[10px] text-stone-400">부서</div>
        </div>
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">11</div>
          <div className="text-[10px] text-stone-400">에이전트</div>
        </div>
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">892</div>
          <div className="text-[10px] text-stone-400">다운로드</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-semibold text-stone-800">4.9</span>
          <span className="text-xs text-stone-400">(45)</span>
        </div>
        <span className="text-xs text-stone-400 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-green-500" />검증됨
        </span>
      </div>

      <button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
        <ShoppingCart className="w-3.5 h-3.5" />
        구매 후 가져오기
      </button>
    </div>

    {/* Card 4: 법무법인 기본 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-xl">⚖️</div>
          <div>
            <div className="font-semibold text-stone-900 text-sm">법무법인 기본</div>
            <div className="text-xs text-stone-400 mt-0.5">by <span className="text-violet-600 font-medium">@legal_ai</span></div>
          </div>
        </div>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-600">무료</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-700">법무</span>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-700">계약</span>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-700">컴플라이언스</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">3</div>
          <div className="text-[10px] text-stone-400">부서</div>
        </div>
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">8</div>
          <div className="text-[10px] text-stone-400">에이전트</div>
        </div>
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">743</div>
          <div className="text-[10px] text-stone-400">다운로드</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-semibold text-stone-800">4.5</span>
          <span className="text-xs text-stone-400">(62)</span>
        </div>
      </div>

      <button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
        <Download className="w-3.5 h-3.5" />
        가져오기
      </button>
    </div>

    {/* Card 5: 유튜브 채널 운영 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-xl">🎬</div>
          <div>
            <div className="font-semibold text-stone-900 text-sm">유튜브 채널 운영</div>
            <div className="text-xs text-stone-400 mt-0.5">by <span className="text-violet-600 font-medium">@youtube_bot</span></div>
          </div>
        </div>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-600">무료</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-50 text-red-600">유튜브</span>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-50 text-red-600">영상</span>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-50 text-red-600">콘텐츠</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">2</div>
          <div className="text-[10px] text-stone-400">부서</div>
        </div>
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">6</div>
          <div className="text-[10px] text-stone-400">에이전트</div>
        </div>
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">621</div>
          <div className="text-[10px] text-stone-400">다운로드</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-semibold text-stone-800">4.3</span>
          <span className="text-xs text-stone-400">(31)</span>
        </div>
      </div>

      <button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
        <Download className="w-3.5 h-3.5" />
        가져오기
      </button>
    </div>

    {/* Card 6: 리서치 에이전시 (유료) */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow relative">
      <div className="absolute top-3 right-3">
        <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-violet-100 text-violet-700">$4.99</span>
      </div>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-xl">🔍</div>
          <div>
            <div className="font-semibold text-stone-900 text-sm">리서치 에이전시</div>
            <div className="text-xs text-stone-400 mt-0.5">by <span className="text-violet-600 font-medium">@research_ai</span></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-cyan-50 text-cyan-700">리서치</span>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-cyan-50 text-cyan-700">데이터</span>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-cyan-50 text-cyan-700">분석</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">3</div>
          <div className="text-[10px] text-stone-400">부서</div>
        </div>
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">8</div>
          <div className="text-[10px] text-stone-400">에이전트</div>
        </div>
        <div className="bg-stone-50 rounded-lg py-1.5">
          <div className="font-bold text-stone-900 text-sm">456</div>
          <div className="text-[10px] text-stone-400">다운로드</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-semibold text-stone-800">4.7</span>
          <span className="text-xs text-stone-400">(28)</span>
        </div>
        <span className="text-xs text-stone-400 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-green-500" />검증됨
        </span>
      </div>

      <button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
        <ShoppingCart className="w-3.5 h-3.5" />
        구매 후 가져오기
      </button>
    </div>
  </div>

  {/* Pagination */}
  <div className="flex items-center justify-center gap-2 mt-8">
    <button className="w-8 h-8 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 flex items-center justify-center transition-colors">
      <ChevronLeft className="w-4 h-4" />
    </button>
    <button className="w-8 h-8 rounded-lg bg-violet-600 text-white text-sm font-semibold flex items-center justify-center">1</button>
    <button className="w-8 h-8 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 text-sm flex items-center justify-center transition-colors">2</button>
    <button className="w-8 h-8 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 text-sm flex items-center justify-center transition-colors">3</button>
    <span className="text-stone-400 text-sm">...</span>
    <button className="w-8 h-8 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 text-sm flex items-center justify-center transition-colors">21</button>
    <button className="w-8 h-8 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 flex items-center justify-center transition-colors">
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
</main>
    </>
  );
}

export default AdminTemplateMarket;
