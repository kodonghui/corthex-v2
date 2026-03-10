"use client";
import React from "react";
import { Activity, BarChart2, Bell, Bot, Building, Building2, Clock, Copy, CreditCard, Database, FileText, GitBranch, Info, Key, LayoutDashboard, MoreHorizontal, Package, Plug, Plus, Settings, ShieldCheck, Store, User, UserCheck, Users } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; } h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; } code,pre { font-family: 'JetBrains Mono', monospace; }
`;

function AdminOrgTemplates() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar */}
<aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-10">
  {/* Logo */}
  <div className="px-5 py-4 border-b border-stone-100">
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] font-bold bg-violet-600 text-white px-1.5 py-0.5 rounded tracking-widest">ADMIN</span>
      <span className="font-bold text-stone-900 text-base" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
    </div>
  </div>

  {/* User */}
  <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-2.5">
    <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
      <User className="w-3.5 h-3.5 text-violet-600" />
    </div>
    <div>
      <div className="text-xs font-semibold text-stone-900">관리자</div>
      <div className="text-[10px] text-stone-400">Super Admin</div>
    </div>
  </div>

  {/* Nav */}
  <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 pb-1.5 pt-1">개요</p>
    <a href="/admin/dashboard" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><LayoutDashboard className="w-4 h-4" />대시보드</a>

    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 pb-1.5 pt-3">조직 관리</p>
    <a href="/admin/onboarding" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Building2 className="w-4 h-4" />회사 온보딩</a>
    <a href="#" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-violet-50 text-violet-700 font-medium text-sm"><Copy className="w-4 h-4" />조직 템플릿</a>
    <a href="/admin/report-lines" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><GitBranch className="w-4 h-4" />보고 라인</a>

    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 pb-1.5 pt-3">에이전트</p>
    <a href="/admin/agents" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Bot className="w-4 h-4" />에이전트 관리</a>
    <a href="/admin/agent-marketplace" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Store className="w-4 h-4" />에이전트 마켓</a>
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
  {/* API 주석: GET /api/admin/org-templates, POST /api/admin/org-templates */}

  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-xl font-bold text-stone-900">조직 템플릿</h1>
      <p className="text-sm text-stone-500 mt-0.5">새 회사를 빠르게 시작하거나, 기존 구조를 저장하세요</p>
    </div>
    <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors">
      <Plus className="w-4 h-4" />
      템플릿 생성
    </button>
  </div>

  {/* Info Banner */}
  <div className="bg-violet-50 border border-violet-100 rounded-xl px-5 py-4 mb-7 flex items-start gap-3">
    <Info className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
    <p className="text-sm text-violet-700">조직 템플릿으로 새 회사를 빠르게 시작하세요. 부서 구조, 에이전트 배치, 소울 설정이 자동으로 구성됩니다.</p>
  </div>

  {/* Built-in Templates */}
  <div className="mb-8">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-stone-900">추천 템플릿</h2>
      <span className="text-xs text-stone-400">6개</span>
    </div>

    <div className="grid grid-cols-3 gap-4">
      {/* Template Card 1: 스타트업 기본 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl">🚀</div>
            <div>
              <div className="font-semibold text-stone-900 text-sm">스타트업 기본</div>
              <span className="inline-block mt-0.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600">빌트인</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-stone-900">3</div>
            <div className="text-[10px] text-stone-500 mt-0.5">부서</div>
          </div>
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-stone-900">6</div>
            <div className="text-[10px] text-stone-500 mt-0.5">에이전트</div>
          </div>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed">1인 사업가, 업무 자동화 시작</p>

        <div className="flex gap-2 mt-auto pt-1">
          <button className="flex-1 bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50 transition-colors">
            미리보기
          </button>
          <button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors">
            이 템플릿으로 시작
          </button>
        </div>
      </div>

      {/* Template Card 2: 투자 전문 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl">💹</div>
            <div>
              <div className="font-semibold text-stone-900 text-sm">투자 전문</div>
              <span className="inline-block mt-0.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600">빌트인</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-stone-900">4</div>
            <div className="text-[10px] text-stone-500 mt-0.5">부서</div>
          </div>
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-stone-900">8</div>
            <div className="text-[10px] text-stone-500 mt-0.5">에이전트</div>
          </div>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed">주식 분석 및 자동매매 중심</p>

        <div className="flex gap-2 mt-auto pt-1">
          <button className="flex-1 bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50 transition-colors">
            미리보기
          </button>
          <button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors">
            이 템플릿으로 시작
          </button>
        </div>
      </div>

      {/* Template Card 3: 마케팅 에이전시 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-xl">📢</div>
            <div>
              <div className="font-semibold text-stone-900 text-sm">마케팅 에이전시</div>
              <span className="inline-block mt-0.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600">빌트인</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-stone-900">3</div>
            <div className="text-[10px] text-stone-500 mt-0.5">부서</div>
          </div>
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-stone-900">7</div>
            <div className="text-[10px] text-stone-500 mt-0.5">에이전트</div>
          </div>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed">SNS, 콘텐츠, 광고 특화</p>

        <div className="flex gap-2 mt-auto pt-1">
          <button className="flex-1 bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50 transition-colors">
            미리보기
          </button>
          <button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors">
            이 템플릿으로 시작
          </button>
        </div>
      </div>

      {/* Template Card 4: 법무·컨설팅 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-xl">⚖️</div>
            <div>
              <div className="font-semibold text-stone-900 text-sm">법무·컨설팅</div>
              <span className="inline-block mt-0.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600">빌트인</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-stone-900">4</div>
            <div className="text-[10px] text-stone-500 mt-0.5">부서</div>
          </div>
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-stone-900">8</div>
            <div className="text-[10px] text-stone-500 mt-0.5">에이전트</div>
          </div>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed">법률 검토, 컨설팅 업무</p>

        <div className="flex gap-2 mt-auto pt-1">
          <button className="flex-1 bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50 transition-colors">
            미리보기
          </button>
          <button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors">
            이 템플릿으로 시작
          </button>
        </div>
      </div>

      {/* Template Card 5: 중소기업 표준 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-xl">🏢</div>
            <div>
              <div className="font-semibold text-stone-900 text-sm">중소기업 표준</div>
              <span className="inline-block mt-0.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600">빌트인</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-stone-900">5</div>
            <div className="text-[10px] text-stone-500 mt-0.5">부서</div>
          </div>
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-stone-900">12</div>
            <div className="text-[10px] text-stone-500 mt-0.5">에이전트</div>
          </div>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed">경영, 마케팅, 법무, 전략 통합</p>

        <div className="flex gap-2 mt-auto pt-1">
          <button className="flex-1 bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50 transition-colors">
            미리보기
          </button>
          <button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors">
            이 템플릿으로 시작
          </button>
        </div>
      </div>

      {/* Template Card 6: 연구소 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-xl">🔬</div>
            <div>
              <div className="font-semibold text-stone-900 text-sm">연구소</div>
              <span className="inline-block mt-0.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600">빌트인</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-stone-900">3</div>
            <div className="text-[10px] text-stone-500 mt-0.5">부서</div>
          </div>
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-stone-900">6</div>
            <div className="text-[10px] text-stone-500 mt-0.5">에이전트</div>
          </div>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed">리서치, 데이터 분석 특화</p>

        <div className="flex gap-2 mt-auto pt-1">
          <button className="flex-1 bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50 transition-colors">
            미리보기
          </button>
          <button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors">
            이 템플릿으로 시작
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Custom Templates */}
  <div>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-stone-900">내 커스텀 템플릿</h2>
      <span className="text-xs text-stone-400">1개</span>
    </div>

    <div className="grid grid-cols-3 gap-4">
      {/* Custom Card: ACME Corp */}
      <div className="bg-white rounded-xl border border-violet-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow relative">
        <div className="absolute top-4 right-4">
          <button className="w-7 h-7 rounded-lg hover:bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Building className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <div className="font-semibold text-stone-900 text-sm">ACME Corp 조직</div>
            <span className="inline-block mt-0.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-violet-50 text-violet-700">커스텀</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-stone-900">5</div>
            <div className="text-[10px] text-stone-500 mt-0.5">부서</div>
          </div>
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-center">
            <div className="text-base font-bold text-stone-900">24</div>
            <div className="text-[10px] text-stone-500 mt-0.5">에이전트</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-stone-400">
          <Clock className="w-3.5 h-3.5" />
          현재 운영 중인 조직 구조
        </div>

        <div className="flex gap-2 mt-auto pt-1">
          <button className="flex-1 bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50 transition-colors">
            미리보기
          </button>
          <button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors">
            이 템플릿으로 시작
          </button>
        </div>
      </div>

      {/* Add Template Placeholder */}
      <div className="bg-white rounded-xl border border-dashed border-stone-200 p-5 flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:border-violet-300 hover:bg-violet-50/30 transition-all min-h-48">
        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
          <Plus className="w-5 h-5 text-stone-400" />
        </div>
        <div>
          <div className="text-sm font-medium text-stone-600">새 템플릿 생성</div>
          <div className="text-xs text-stone-400 mt-0.5">현재 조직 구조를 저장하거나 처음부터 만들기</div>
        </div>
      </div>
    </div>
  </div>
</main>
    </>
  );
}

export default AdminOrgTemplates;
