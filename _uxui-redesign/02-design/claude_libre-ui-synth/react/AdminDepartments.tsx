"use client";
import React from "react";
import { Activity, AlertCircle, AlertTriangle, Bot, Briefcase, Building2, Code2, DollarSign, FlaskConical, GitBranch, GitFork, Info, KeyRound, LayoutDashboard, LayoutTemplate, Megaphone, Network, Plus, Rocket, Scale, Settings, ShoppingBag, Sparkles, Store, Trash2, TrendingUp, TriangleAlert, UserCog, UserPlus, UserX, Users, Wrench, X } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 50; display: flex; align-items: center; justify-content: center; }
    .avatar-stack { display: flex; }
    .avatar-stack .av { width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; margin-left: -6px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; }
    .avatar-stack .av:first-child { margin-left: 0; }`;

function AdminDepartments() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      {/* Sidebar */}
  <aside className="w-64 min-h-screen bg-white border-r border-stone-200 flex flex-col fixed left-0 top-0 z-10 overflow-y-auto">
    <div className="px-5 py-5 border-b border-stone-100 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded">ADMIN</span>
        <span className="font-bold text-stone-900 text-lg" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
      </div>
    </div>
    <div className="px-4 py-3 border-b border-stone-100 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">관</div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-stone-800 truncate">관리자</p>
          <p className="text-xs text-stone-500 truncate">admin@corthex.io</p>
        </div>
      </div>
    </div>
    <nav className="flex-1 px-3 py-3">
      <div className="space-y-0.5">
        <a href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><LayoutDashboard className="w-4 h-4 flex-shrink-0" /> 대시보드</a>
        <a href="/admin/agents" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><Bot className="w-4 h-4 flex-shrink-0" /> 에이전트 관리</a>
        <a href="/admin/departments" className="flex items-center gap-3 px-3 py-2 bg-violet-50 text-violet-700 font-medium rounded-lg text-sm"><Building2 className="w-4 h-4 flex-shrink-0" /> 부서 관리</a>
        <a href="/admin/employees" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><Users className="w-4 h-4 flex-shrink-0" /> 직원 관리</a>
        <a href="/admin/credentials" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><KeyRound className="w-4 h-4 flex-shrink-0" /> 크리덴셜</a>
        <a href="/admin/tools" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><Wrench className="w-4 h-4 flex-shrink-0" /> 도구 관리</a>
        <a href="/admin/soul-templates" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><Sparkles className="w-4 h-4 flex-shrink-0" /> 소울 템플릿</a>
        <a href="/admin/org-chart" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><Network className="w-4 h-4 flex-shrink-0" /> 조직도</a>
        <a href="/admin/org-templates" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><LayoutTemplate className="w-4 h-4 flex-shrink-0" /> 조직 템플릿</a>
        <a href="/admin/report-lines" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><GitFork className="w-4 h-4 flex-shrink-0" /> 보고 라인</a>
        <a href="/admin/template-market" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><Store className="w-4 h-4 flex-shrink-0" /> 템플릿 마켓</a>
        <a href="/admin/agent-marketplace" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><ShoppingBag className="w-4 h-4 flex-shrink-0" /> 에이전트 마켓</a>
        <a href="/admin/api-keys" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><Code2 className="w-4 h-4 flex-shrink-0" /> API 키</a>
        <a href="/admin/costs" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><DollarSign className="w-4 h-4 flex-shrink-0" /> 비용 관리</a>
        <a href="/admin/companies" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><Briefcase className="w-4 h-4 flex-shrink-0" /> 회사 관리</a>
        <a href="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><Settings className="w-4 h-4 flex-shrink-0" /> 설정</a>
        <a href="/admin/monitoring" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><Activity className="w-4 h-4 flex-shrink-0" /> 모니터링</a>
        <a href="/admin/onboarding" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><Rocket className="w-4 h-4 flex-shrink-0" /> 온보딩</a>
        <a href="/admin/users" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><UserCog className="w-4 h-4 flex-shrink-0" /> 사용자 관리</a>
        <a href="/admin/workflows" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><GitBranch className="w-4 h-4 flex-shrink-0" /> 워크플로우</a>
      </div>
    </nav>
  </aside>

  {/* Main Content */}
  {/* API: GET /api/admin/departments | POST /api/admin/departments | DELETE /api/admin/departments/{id} */}
  <main className="ml-64 flex-1 p-8">

    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">부서 관리</h1>
        <p className="text-sm text-stone-500 mt-0.5">5개 부서 · ACME Corp</p>
      </div>
      <button onClick="document.getElementById('createDeptModal').classList.remove('hidden')" className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150">
        <Plus className="w-4 h-4" />부서 생성
      </button>
    </div>

    {/* 부서 카드 그리드 */}
    <div className="grid grid-cols-2 gap-4">

      {/* 비서실 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900">비서실</h3>
              <p className="text-xs text-stone-500 mt-0.5">경영진 지원 · 조율</p>
            </div>
          </div>
          <span className="text-xs bg-violet-100 text-violet-700 font-medium px-2.5 py-0.5 rounded-full">활성</span>
        </div>

        {/* 팀장 */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-stone-100">
          <div className="w-7 h-7 rounded-full bg-violet-200 flex items-center justify-center text-violet-800 text-xs font-semibold flex-shrink-0">이</div>
          <div>
            <p className="text-xs text-stone-500">팀장 에이전트</p>
            <p className="text-sm font-semibold text-stone-800">이나경</p>
          </div>
          <div className="ml-auto">
            <div className="avatar-stack">
              <div className="av bg-violet-200 text-violet-800">이</div>
              <div className="av bg-stone-200 text-stone-600">+1</div>
            </div>
          </div>
        </div>

        {/* 이번 달 통계 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-stone-900">145</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wide">작업</p>
          </div>
          <div className="text-center border-x border-stone-100">
            <p className="text-lg font-bold text-stone-900">$2.30</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wide">비용</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600">98%</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wide">성공률</p>
          </div>
        </div>

        {/* 삭제 규칙 안내 */}
        <div className="text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2 mb-3 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
          소속 에이전트 2명이 미배속 상태로 전환됩니다.
        </div>

        <div className="flex gap-2">
          <button className="flex-1 bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-50 transition-all duration-150 flex items-center justify-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />관리
          </button>
          <button onClick="document.getElementById('deleteModal').classList.remove('hidden')" className="bg-white border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-50 transition-all duration-150 flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />삭제
          </button>
        </div>
      </div>

      {/* 마케팅부서 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Megaphone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900">마케팅부서</h3>
              <p className="text-xs text-stone-500 mt-0.5">브랜드 · 콘텐츠 · SNS</p>
            </div>
          </div>
          <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2.5 py-0.5 rounded-full">활성</span>
        </div>

        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-stone-100">
          <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 text-xs font-semibold flex-shrink-0">박</div>
          <div>
            <p className="text-xs text-stone-500">팀장 에이전트</p>
            <p className="text-sm font-semibold text-stone-800">박준형</p>
          </div>
          <div className="ml-auto">
            <div className="avatar-stack">
              <div className="av bg-blue-200 text-blue-800">박</div>
              <div className="av bg-rose-200 text-rose-800">최</div>
              <div className="av bg-stone-200 text-stone-600">+3</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-stone-900">320</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wide">작업</p>
          </div>
          <div className="text-center border-x border-stone-100">
            <p className="text-lg font-bold text-stone-900">$4.80</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wide">비용</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600">92%</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wide">성공률</p>
          </div>
        </div>

        <div className="text-xs text-stone-500 bg-amber-50 rounded-lg px-3 py-2 mb-3 flex items-start gap-2 border border-amber-100">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
          진행 중 작업 3건 있음 — 삭제 시 cascade 처리됩니다.
        </div>

        <div className="flex gap-2">
          <button className="flex-1 bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-50 transition-all duration-150 flex items-center justify-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />관리
          </button>
          <button onClick="document.getElementById('deleteModal').classList.remove('hidden')" className="bg-white border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-50 transition-all duration-150 flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />삭제
          </button>
        </div>
      </div>

      {/* 전략투자부서 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900">전략투자부서</h3>
              <p className="text-xs text-stone-500 mt-0.5">투자 분석 · 리서치</p>
            </div>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-700 font-medium px-2.5 py-0.5 rounded-full">활성</span>
        </div>

        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-stone-100">
          <div className="w-7 h-7 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-800 text-xs font-semibold flex-shrink-0">김</div>
          <div>
            <p className="text-xs text-stone-500">팀장 에이전트</p>
            <p className="text-sm font-semibold text-stone-800">김재원</p>
          </div>
          <div className="ml-auto">
            <div className="avatar-stack">
              <div className="av bg-emerald-200 text-emerald-800">김</div>
              <div className="av bg-stone-200 text-stone-600">정</div>
              <div className="av bg-stone-200 text-stone-600">+2</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-stone-900">280</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wide">작업</p>
          </div>
          <div className="text-center border-x border-stone-100">
            <p className="text-lg font-bold text-stone-900">$5.20</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wide">비용</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600">97%</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wide">성공률</p>
          </div>
        </div>

        <div className="text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2 mb-3 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
          소속 에이전트 4명이 미배속 상태로 전환됩니다.
        </div>

        <div className="flex gap-2">
          <button className="flex-1 bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-50 transition-all duration-150 flex items-center justify-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />관리
          </button>
          <button onClick="document.getElementById('deleteModal').classList.remove('hidden')" className="bg-white border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-50 transition-all duration-150 flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />삭제
          </button>
        </div>
      </div>

      {/* 법무부서 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900">법무부서</h3>
              <p className="text-xs text-stone-500 mt-0.5">법률 검토 · 컴플라이언스</p>
            </div>
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2.5 py-0.5 rounded-full">활성</span>
        </div>

        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-stone-100">
          <div className="w-7 h-7 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 text-xs font-semibold flex-shrink-0">이</div>
          <div>
            <p className="text-xs text-stone-500">팀장 에이전트</p>
            <p className="text-sm font-semibold text-stone-800">이소연</p>
          </div>
          <div className="ml-auto">
            <div className="avatar-stack">
              <div className="av bg-amber-200 text-amber-800">이</div>
              <div className="av bg-stone-200 text-stone-600">+2</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-stone-900">85</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wide">작업</p>
          </div>
          <div className="text-center border-x border-stone-100">
            <p className="text-lg font-bold text-stone-900">$1.20</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wide">비용</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600">100%</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wide">성공률</p>
          </div>
        </div>

        <div className="text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2 mb-3 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
          소속 에이전트 3명이 미배속 상태로 전환됩니다.
        </div>

        <div className="flex gap-2">
          <button className="flex-1 bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-50 transition-all duration-150 flex items-center justify-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />관리
          </button>
          <button onClick="document.getElementById('deleteModal').classList.remove('hidden')" className="bg-white border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-50 transition-all duration-150 flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />삭제
          </button>
        </div>
      </div>

      {/* 연구개발부서 (팀장 없음) */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 hover:shadow-md transition-shadow col-span-2">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
              <FlaskConical className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900">연구개발부서</h3>
              <p className="text-xs text-stone-500 mt-0.5">기술 연구 · 프로토타입 개발</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />팀장 미배정
            </span>
            <span className="text-xs bg-rose-100 text-rose-700 font-medium px-2.5 py-0.5 rounded-full">활성</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-stone-100">
          <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-xs flex-shrink-0">
            <UserX className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs text-stone-500">팀장 에이전트</p>
            <p className="text-sm font-medium text-amber-600">미배정 — 팀장을 지정해 주세요</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="avatar-stack">
              <div className="av bg-rose-200 text-rose-800">A</div>
              <div className="av bg-stone-200 text-stone-600">B</div>
              <div className="av bg-stone-200 text-stone-600">+1</div>
            </div>
            <span className="text-xs text-stone-500">3명 소속</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="grid grid-cols-3 gap-6 flex-1">
            <div>
              <p className="text-sm text-stone-500 mb-0.5">이번 달 작업</p>
              <p className="text-xl font-bold text-stone-900">210건</p>
            </div>
            <div>
              <p className="text-sm text-stone-500 mb-0.5">이번 달 비용</p>
              <p className="text-xl font-bold text-stone-900">$3.10</p>
            </div>
            <div>
              <p className="text-sm text-stone-500 mb-0.5">성공률</p>
              <p className="text-xl font-bold text-emerald-600">95%</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />팀장 지정
            </button>
            <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-50 transition-all duration-150 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />관리
            </button>
            <button onClick="document.getElementById('deleteModal').classList.remove('hidden')" className="bg-white border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-50 transition-all duration-150 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />삭제
            </button>
          </div>
        </div>
      </div>

    </div>
  </main>

  {/* 부서 생성 모달 */}
  <div id="createDeptModal" className="modal-overlay hidden">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
        <div>
          <h2 className="font-bold text-stone-900">부서 생성</h2>
          <p className="text-xs text-stone-500 mt-0.5">새 부서를 조직에 추가합니다</p>
        </div>
        <button onClick="document.getElementById('createDeptModal').classList.add('hidden')" className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-stone-500" />
        </button>
      </div>
      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">부서명 *</label>
          <input type="text" placeholder="예: 영업부서" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">설명</label>
          <textarea rows="3" placeholder="부서의 역할과 담당 업무를 간략히 입력하세요" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"></textarea>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">아이콘 색상</label>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-lg bg-violet-500 ring-2 ring-violet-500 ring-offset-2"></button>
            <button className="w-8 h-8 rounded-lg bg-blue-500 hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all"></button>
            <button className="w-8 h-8 rounded-lg bg-emerald-500 hover:ring-2 hover:ring-emerald-500 hover:ring-offset-2 transition-all"></button>
            <button className="w-8 h-8 rounded-lg bg-amber-500 hover:ring-2 hover:ring-amber-500 hover:ring-offset-2 transition-all"></button>
            <button className="w-8 h-8 rounded-lg bg-rose-500 hover:ring-2 hover:ring-rose-500 hover:ring-offset-2 transition-all"></button>
            <button className="w-8 h-8 rounded-lg bg-stone-500 hover:ring-2 hover:ring-stone-500 hover:ring-offset-2 transition-all"></button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">팀장 에이전트 (선택)</label>
          <select className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
            <option>나중에 지정</option>
            <option>이나경 (비서실 · Manager)</option>
            <option>박준형 (마케팅 · Manager)</option>
            <option>김재원 (전략투자 · Specialist)</option>
          </select>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-100 bg-stone-50">
        <button onClick="document.getElementById('createDeptModal').classList.add('hidden')" className="bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-50 transition-all duration-150">취소</button>
        <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 flex items-center gap-2">
          <Plus className="w-4 h-4" />부서 생성
        </button>
      </div>
    </div>
  </div>

  {/* 삭제 확인 모달 (위험 경고) */}
  <div id="deleteModal" className="modal-overlay hidden">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
      <div className="px-6 py-5 border-b border-red-100 bg-red-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <TriangleAlert className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="font-bold text-red-900">부서 삭제 — 위험 작업</h2>
            <p className="text-xs text-red-600 mt-0.5">이 작업은 되돌릴 수 없습니다</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-5">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
          <p className="text-sm text-red-800">이 부서를 삭제하면 소속 에이전트들이 <span className="font-semibold">미배속 상태로 전환</span>됩니다. 진행 중인 작업은 <span className="font-semibold">즉시 중단(cascade)</span>됩니다.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            계속하려면 부서명 <code className="bg-stone-100 px-1 rounded text-red-700">마케팅부서</code>를 입력하세요
          </label>
          <input type="text" placeholder="마케팅부서" className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-100 bg-stone-50">
        <button onClick="document.getElementById('deleteModal').classList.add('hidden')" className="bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-50 transition-all duration-150">취소</button>
        <button className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />영구 삭제
        </button>
      </div>
    </div>
  </div>
    </>
  );
}

export default AdminDepartments;
