"use client";
import React from "react";
import { Activity, BarChart2, Bell, Bot, Building2, CheckCircle, Copy, CreditCard, Database, FileText, GitBranch, Key, LayoutDashboard, Package, Plug, RefreshCw, Search, Settings, ShieldCheck, Star, Store, User, UserCheck, UserPlus, Users, Zap } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; } h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; } code,pre { font-family: 'JetBrains Mono', monospace; }
`;

function AdminAgentMarketplace() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar */}
<aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-10">
  <div className="px-5 py-4 border-b border-stone-100">
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] font-bold bg-violet-600 text-white px-1.5 py-0.5 rounded tracking-widest">ADMIN</span>
      <span className="font-bold text-stone-900 text-base" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
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
    <a href="#" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-violet-50 text-violet-700 font-medium text-sm"><Store className="w-4 h-4" />에이전트 마켓</a>
    <a href="/admin/credentials" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Key className="w-4 h-4" />크리덴셜</a>
    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 pb-1.5 pt-3">마켓플레이스</p>
    <a href="/admin/template-market" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Package className="w-4 h-4" />템플릿 마켓</a>
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
  {/* API 주석: GET /api/admin/agent-marketplace */}

  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-xl font-bold text-stone-900">에이전트 마켓</h1>
      <p className="text-sm text-stone-500 mt-0.5">검증된 AI 에이전트 소울을 가져와 팀에 추가하세요</p>
    </div>
    {/* Search */}
    <div className="relative">
      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input type="text" placeholder="에이전트 검색..." className="rounded-lg border border-stone-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-64 bg-white" />
    </div>
  </div>

  {/* Tabs (카테고리 포함) */}
  <div className="flex items-center gap-1 mb-6 bg-white border border-stone-200 rounded-xl p-1 w-fit">
    <button className="px-4 py-1.5 text-sm font-medium rounded-lg bg-violet-600 text-white transition-colors">추천</button>
    <button className="px-4 py-1.5 text-sm font-medium rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">최신</button>
    <div className="w-px h-5 bg-stone-200 mx-1"></div>
    <button className="px-3 py-1.5 text-sm font-medium rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">금융</button>
    <button className="px-3 py-1.5 text-sm font-medium rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">마케팅</button>
    <button className="px-3 py-1.5 text-sm font-medium rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">법무</button>
    <button className="px-3 py-1.5 text-sm font-medium rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">기술</button>
    <button className="px-3 py-1.5 text-sm font-medium rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">공통</button>
  </div>

  {/* Stats Row */}
  <div className="grid grid-cols-4 gap-4 mb-6">
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
        <Bot className="w-4 h-4 text-violet-600" />
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900">3,847</div>
        <div className="text-xs text-stone-500">전체 에이전트</div>
      </div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-green-600" />
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900">1,203</div>
        <div className="text-xs text-stone-500">검증 완료</div>
      </div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
        <Zap className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900">24.5K</div>
        <div className="text-xs text-stone-500">총 팀 추가</div>
      </div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
        <Star className="w-4 h-4 text-amber-500" />
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900">4.7</div>
        <div className="text-xs text-stone-500">평균 평점</div>
      </div>
    </div>
  </div>

  {/* Agent Cards Grid */}
  <div className="grid grid-cols-3 gap-4">

    {/* Card 1: 주식 애널리스트 Pro */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0 text-2xl">📊</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-stone-900 text-sm leading-tight">주식 애널리스트 Pro</div>
            <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-green-50 text-green-700">금융</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-stone-100 text-stone-600">Specialist</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-stone-600 leading-relaxed">실시간 주가 분석 및 투자 인사이트를 제공합니다. KIS API 연동으로 자동 매수/매도 신호를 생성하고 포트폴리오를 최적화합니다.</p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-bold text-stone-800">4.9</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-stone-400">
          <Users className="w-3 h-3" />
          <span>3,412 팀에서 사용</span>
        </div>
      </div>

      {/* Required Credentials */}
      <div>
        <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mb-1.5">필요 크리덴셜</div>
        <div className="flex flex-wrap gap-1">
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">KIS API</span>
        </div>
      </div>

      <button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-auto">
        <UserPlus className="w-3.5 h-3.5" />
        팀에 추가
      </button>
    </div>

    {/* Card 2: SNS 바이럴 마스터 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center shrink-0 text-2xl">📱</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-stone-900 text-sm leading-tight">SNS 바이럴 마스터</div>
            <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-pink-50 text-pink-700">마케팅</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-stone-100 text-stone-600">Worker</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-stone-600 leading-relaxed">인스타그램·트위터·틱톡 콘텐츠를 자동 생성하고 최적 시간에 예약 게시합니다. 트렌드 분석으로 바이럴 가능성이 높은 콘텐츠를 추천합니다.</p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-bold text-stone-800">4.7</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-stone-400">
          <Users className="w-3 h-3" />
          <span>5,231 팀에서 사용</span>
        </div>
      </div>

      <div>
        <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mb-1.5">필요 크리덴셜</div>
        <div className="flex flex-wrap gap-1">
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">Instagram</span>
        </div>
      </div>

      <button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-auto">
        <UserPlus className="w-3.5 h-3.5" />
        팀에 추가
      </button>
    </div>

    {/* Card 3: 계약서 검토 전문가 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0 text-2xl">📜</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-stone-900 text-sm leading-tight">계약서 검토 전문가</div>
            <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-yellow-50 text-yellow-700">법무</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-stone-100 text-stone-600">Specialist</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-stone-600 leading-relaxed">계약서의 독소 조항, 누락 조항을 자동 감지합니다. 국내 법률 기준에 맞게 리스크를 분류하고 수정안을 제안합니다.</p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-bold text-stone-800">4.8</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-stone-400">
          <Users className="w-3 h-3" />
          <span>1,892 팀에서 사용</span>
        </div>
      </div>

      <div>
        <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mb-1.5">필요 크리덴셜</div>
        <div className="flex flex-wrap gap-1">
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-500">없음</span>
        </div>
      </div>

      <button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-auto">
        <UserPlus className="w-3.5 h-3.5" />
        팀에 추가
      </button>
    </div>

    {/* Card 4: 데이터 시각화 AI */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-2xl">📉</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-stone-900 text-sm leading-tight">데이터 시각화 AI</div>
            <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700">기술</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-stone-100 text-stone-600">Worker</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-stone-600 leading-relaxed">CSV, JSON, DB 데이터를 받아 인사이트를 추출하고 대화형 차트 및 대시보드를 자동 생성합니다. Python 없이 데이터 분석을 수행합니다.</p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-bold text-stone-800">4.6</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-stone-400">
          <Users className="w-3 h-3" />
          <span>2,341 팀에서 사용</span>
        </div>
      </div>

      <div>
        <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mb-1.5">필요 크리덴셜</div>
        <div className="flex flex-wrap gap-1">
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-500">없음</span>
        </div>
      </div>

      <button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-auto">
        <UserPlus className="w-3.5 h-3.5" />
        팀에 추가
      </button>
    </div>

    {/* Card 5: 뉴스 모니터링 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 text-2xl">📰</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-stone-900 text-sm leading-tight">뉴스 모니터링</div>
            <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-stone-100 text-stone-600">공통</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-stone-100 text-stone-600">Worker</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-stone-600 leading-relaxed">지정한 키워드와 관련된 국내외 뉴스를 24시간 수집하고 요약합니다. 중요도별 분류 후 슬랙·이메일로 정기 브리핑을 전송합니다.</p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-bold text-stone-800">4.5</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-stone-400">
          <Users className="w-3 h-3" />
          <span>6,782 팀에서 사용</span>
        </div>
      </div>

      <div>
        <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mb-1.5">필요 크리덴셜</div>
        <div className="flex flex-wrap gap-1">
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-500">없음</span>
        </div>
      </div>

      <button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-auto">
        <UserPlus className="w-3.5 h-3.5" />
        팀에 추가
      </button>
    </div>

    {/* Card 6: 유튜브 스크립터 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-2xl">🎙️</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-stone-900 text-sm leading-tight">유튜브 스크립터</div>
            <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-red-50 text-red-600">마케팅</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-stone-100 text-stone-600">Worker</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-stone-600 leading-relaxed">주제와 타깃 시청자를 입력하면 SEO 최적화된 유튜브 스크립트, 제목, 태그, 썸네일 텍스트를 완성본으로 제작합니다.</p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-bold text-stone-800">4.4</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-stone-400">
          <Users className="w-3 h-3" />
          <span>4,123 팀에서 사용</span>
        </div>
      </div>

      <div>
        <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mb-1.5">필요 크리덴셜</div>
        <div className="flex flex-wrap gap-1">
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-500">없음</span>
        </div>
      </div>

      <button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-auto">
        <UserPlus className="w-3.5 h-3.5" />
        팀에 추가
      </button>
    </div>
  </div>

  {/* Load More */}
  <div className="flex items-center justify-center mt-8">
    <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-stone-50 transition-colors flex items-center gap-2">
      <RefreshCw className="w-3.5 h-3.5" />
      더 보기 (3,841개 남음)
    </button>
  </div>
</main>
    </>
  );
}

export default AdminAgentMarketplace;
