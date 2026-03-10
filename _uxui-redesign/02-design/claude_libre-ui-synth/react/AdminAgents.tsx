"use client";
import React from "react";
import { Activity, Bot, Briefcase, Building2, ChevronLeft, ChevronRight, Code2, DollarSign, Filter, GitBranch, GitFork, KeyRound, LayoutDashboard, LayoutTemplate, Network, Plus, Rocket, Search, Settings, Shield, ShoppingBag, Sparkles, Store, UserCog, Users, Wrench, X } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 50; display: flex; align-items: center; justify-content: center; }`;

function AdminAgents() {
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
        <a href="/admin/agents" className="flex items-center gap-3 px-3 py-2 bg-violet-50 text-violet-700 font-medium rounded-lg text-sm"><Bot className="w-4 h-4 flex-shrink-0" /> 에이전트 관리</a>
        <a href="/admin/departments" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><Building2 className="w-4 h-4 flex-shrink-0" /> 부서 관리</a>
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
  {/* API: GET /api/admin/agents | POST /api/admin/agents | PUT /api/admin/agents/{id} | DELETE /api/admin/agents/{id} */}
  <main className="ml-64 flex-1 p-8">

    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">에이전트 관리</h1>
        <p className="text-sm text-stone-500 mt-0.5">총 6명 · ACME Corp</p>
      </div>
      <button onClick="document.getElementById('createModal').classList.remove('hidden')" className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150">
        <Plus className="w-4 h-4" />에이전트 생성
      </button>
    </div>

    {/* 필터 바 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-stone-400" />
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">필터</span>
      </div>
      <select className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-stone-50">
        <option>회사: 전체</option>
        <option selected>ACME Corp</option>
      </select>
      <select className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-stone-50">
        <option>부서: 전체</option>
        <option>비서실</option>
        <option>마케팅부서</option>
        <option>전략투자부서</option>
        <option>법무부서</option>
      </select>
      <select className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-stone-50">
        <option>계급: 전체</option>
        <option>Manager</option>
        <option>Specialist</option>
        <option>Worker</option>
      </select>
      <select className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-stone-50">
        <option>상태: 전체</option>
        <option>online</option>
        <option>working</option>
        <option>offline</option>
        <option>error</option>
      </select>
      <div className="ml-auto relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input type="text" placeholder="에이전트 검색..." className="rounded-lg border border-stone-200 pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-52" />
      </div>
    </div>

    {/* 에이전트 테이블 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-100">
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">에이전트</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">회사</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">부서</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">계급</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">모델</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">상태</th>
            <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">오늘 호출</th>
            <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">이번달 비용</th>
            <th className="text-center text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">시스템</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">액션</th>
          </tr>
        </thead>
        <tbody>

          {/* 이나경 - 시스템 에이전트 (회색 배경) */}
          <tr className="border-b border-stone-100 bg-stone-50/70">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-sm font-semibold flex-shrink-0">이</div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">이나경</p>
                  <p className="text-xs text-stone-400">비서·조율가</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-stone-600">ACME Corp</td>
            <td className="px-4 py-3 text-sm text-stone-600">비서실</td>
            <td className="px-4 py-3">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-violet-100 text-violet-700">Manager</span>
            </td>
            <td className="px-4 py-3">
              <code className="text-xs text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">claude-sonnet-4-6</code>
            </td>
            <td className="px-4 py-3">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>online
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-stone-800 text-right font-medium">380</td>
            <td className="px-4 py-3 text-sm font-semibold text-stone-800 text-right">$2.30</td>
            <td className="px-4 py-3 text-center">
              <span title="시스템 보호 — 삭제 불가" className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-200 text-stone-600 cursor-help">
                시스템 🔒
              </span>
            </td>
            <td className="px-4 py-3">
              <button className="text-xs bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 hover:bg-stone-50 font-medium transition-colors">소울 편집</button>
            </td>
          </tr>

          {/* 박준형 */}
          <tr className="border-b border-stone-100 hover:bg-stone-50/50">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-semibold flex-shrink-0">박</div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">박준형</p>
                  <p className="text-xs text-stone-400">마케팅 전략가</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-stone-600">ACME Corp</td>
            <td className="px-4 py-3 text-sm text-stone-600">마케팅부서</td>
            <td className="px-4 py-3">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-violet-100 text-violet-700">Manager</span>
            </td>
            <td className="px-4 py-3">
              <code className="text-xs text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">claude-sonnet-4-6</code>
            </td>
            <td className="px-4 py-3">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>working
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-stone-800 text-right font-medium">220</td>
            <td className="px-4 py-3 text-sm font-semibold text-stone-800 text-right">$1.80</td>
            <td className="px-4 py-3 text-center">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">사용자</span>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                <button className="text-xs bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 hover:bg-stone-50 font-medium transition-colors">편집</button>
                <button className="text-xs bg-white border border-red-200 text-red-600 rounded-lg px-3 py-1.5 hover:bg-red-50 font-medium transition-colors">삭제</button>
              </div>
            </td>
          </tr>

          {/* 김재원 */}
          <tr className="border-b border-stone-100 hover:bg-stone-50/50">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-semibold flex-shrink-0">김</div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">김재원</p>
                  <p className="text-xs text-stone-400">투자 분석가</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-stone-600">ACME Corp</td>
            <td className="px-4 py-3 text-sm text-stone-600">전략투자부서</td>
            <td className="px-4 py-3">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">Specialist</span>
            </td>
            <td className="px-4 py-3">
              <code className="text-xs text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">claude-haiku-4-5</code>
            </td>
            <td className="px-4 py-3">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>online
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-stone-800 text-right font-medium">145</td>
            <td className="px-4 py-3 text-sm font-semibold text-stone-800 text-right">$4.20</td>
            <td className="px-4 py-3 text-center">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">사용자</span>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                <button className="text-xs bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 hover:bg-stone-50 font-medium transition-colors">편집</button>
                <button className="text-xs bg-white border border-red-200 text-red-600 rounded-lg px-3 py-1.5 hover:bg-red-50 font-medium transition-colors">삭제</button>
              </div>
            </td>
          </tr>

          {/* 이소연 */}
          <tr className="border-b border-stone-100 hover:bg-stone-50/50">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-sm font-semibold flex-shrink-0">이</div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">이소연</p>
                  <p className="text-xs text-stone-400">법률 전문가</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-stone-600">ACME Corp</td>
            <td className="px-4 py-3 text-sm text-stone-600">법무부서</td>
            <td className="px-4 py-3">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">Specialist</span>
            </td>
            <td className="px-4 py-3">
              <code className="text-xs text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">claude-haiku-4-5</code>
            </td>
            <td className="px-4 py-3">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>online
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-stone-800 text-right font-medium">85</td>
            <td className="px-4 py-3 text-sm font-semibold text-stone-800 text-right">$1.20</td>
            <td className="px-4 py-3 text-center">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">사용자</span>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                <button className="text-xs bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 hover:bg-stone-50 font-medium transition-colors">편집</button>
                <button className="text-xs bg-white border border-red-200 text-red-600 rounded-lg px-3 py-1.5 hover:bg-red-50 font-medium transition-colors">삭제</button>
              </div>
            </td>
          </tr>

          {/* 최민지 */}
          <tr className="border-b border-stone-100 hover:bg-stone-50/50">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-sm font-semibold flex-shrink-0">최</div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">최민지</p>
                  <p className="text-xs text-stone-400">콘텐츠 제작자</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-stone-600">ACME Corp</td>
            <td className="px-4 py-3 text-sm text-stone-600">마케팅부서</td>
            <td className="px-4 py-3">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-600">Worker</span>
            </td>
            <td className="px-4 py-3">
              <code className="text-xs text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">claude-haiku-4-5</code>
            </td>
            <td className="px-4 py-3">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>working
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-stone-800 text-right font-medium">290</td>
            <td className="px-4 py-3 text-sm font-semibold text-stone-800 text-right">$1.90</td>
            <td className="px-4 py-3 text-center">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">사용자</span>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                <button className="text-xs bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 hover:bg-stone-50 font-medium transition-colors">편집</button>
                <button className="text-xs bg-white border border-red-200 text-red-600 rounded-lg px-3 py-1.5 hover:bg-red-50 font-medium transition-colors">삭제</button>
              </div>
            </td>
          </tr>

          {/* 정도현 */}
          <tr className="hover:bg-stone-50/50">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 text-sm font-semibold flex-shrink-0">정</div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">정도현</p>
                  <p className="text-xs text-stone-400">리서치 보조</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-stone-600">ACME Corp</td>
            <td className="px-4 py-3 text-sm text-stone-600">전략투자부서</td>
            <td className="px-4 py-3">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-600">Worker</span>
            </td>
            <td className="px-4 py-3">
              <code className="text-xs text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">claude-haiku-4-5</code>
            </td>
            <td className="px-4 py-3">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-500">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>offline
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-stone-400 text-right font-medium">0</td>
            <td className="px-4 py-3 text-sm font-semibold text-stone-400 text-right">$0</td>
            <td className="px-4 py-3 text-center">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">사용자</span>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                <button className="text-xs bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 hover:bg-stone-50 font-medium transition-colors">편집</button>
                <button className="text-xs bg-white border border-red-200 text-red-600 rounded-lg px-3 py-1.5 hover:bg-red-50 font-medium transition-colors">삭제</button>
              </div>
            </td>
          </tr>

        </tbody>
      </table>
      {/* 테이블 하단 */}
      <div className="px-4 py-3 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
        <p className="text-xs text-stone-500">총 6개 에이전트 · 1페이지</p>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-white transition-colors disabled:opacity-40" disabled>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="w-7 h-7 rounded-lg bg-violet-600 text-white text-xs font-semibold flex items-center justify-center">1</span>
          <button className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-white transition-colors disabled:opacity-40" disabled>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    {/* 시스템 에이전트 안내 */}
    <div className="mt-4 flex items-start gap-3 bg-stone-100 border border-stone-200 rounded-xl px-4 py-3">
      <Shield className="w-4 h-4 text-stone-500 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-stone-600"><span className="font-semibold text-stone-700">시스템 에이전트</span>는 조직 핵심 기능을 담당하며 삭제가 불가합니다. 소울(인격) 편집만 허용됩니다.</p>
    </div>

  </main>

  {/* 에이전트 생성 모달 */}
  <div id="createModal" className="modal-overlay hidden">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
      {/* 모달 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
        <div>
          <h2 className="font-bold text-stone-900">에이전트 생성</h2>
          <p className="text-xs text-stone-500 mt-0.5">새로운 AI 에이전트를 조직에 추가합니다</p>
        </div>
        <button onClick="document.getElementById('createModal').classList.add('hidden')" className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-stone-500" />
        </button>
      </div>
      {/* 모달 바디 */}
      <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">에이전트 이름 *</label>
            <input type="text" placeholder="예: 홍길동" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">역할 / 직함 *</label>
            <input type="text" placeholder="예: 데이터 분석가" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">계급 *</label>
            <select className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
              <option>선택...</option>
              <option>Manager</option>
              <option>Specialist</option>
              <option>Worker</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">부서 배정</label>
            <select className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
              <option>미배속</option>
              <option>비서실</option>
              <option>마케팅부서</option>
              <option>전략투자부서</option>
              <option>법무부서</option>
              <option>연구개발부서</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">소울 템플릿</label>
          <select className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
            <option>선택 안 함 (직접 작성)</option>
            <option>전략형 매니저</option>
            <option>데이터 분석 전문가</option>
            <option>창의적 콘텐츠 제작자</option>
            <option>꼼꼼한 법무 검토자</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">AI 모델 *</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2.5 border border-stone-200 rounded-lg px-3 py-2.5 cursor-pointer hover:border-violet-400 has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50">
              <input type="radio" name="model" value="sonnet" className="accent-violet-600" />
              <div>
                <p className="text-sm font-medium text-stone-800">claude-sonnet-4-6</p>
                <p className="text-[10px] text-stone-400">고성능 · 복잡한 업무</p>
              </div>
            </label>
            <label className="flex items-center gap-2.5 border border-stone-200 rounded-lg px-3 py-2.5 cursor-pointer hover:border-violet-400 has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50">
              <input type="radio" name="model" value="haiku" className="accent-violet-600" checked />
              <div>
                <p className="text-sm font-medium text-stone-800">claude-haiku-4-5</p>
                <p className="text-[10px] text-stone-400">경량 · 반복 업무</p>
              </div>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-2">도구 권한</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-violet-600 rounded" checked />
              <span className="text-sm text-stone-700">웹 검색</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-violet-600 rounded" checked />
              <span className="text-sm text-stone-700">파일 읽기/쓰기</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-violet-600 rounded" />
              <span className="text-sm text-stone-700">이메일 발송</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-violet-600 rounded" />
              <span className="text-sm text-stone-700">SNS 게시</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-violet-600 rounded" />
              <span className="text-sm text-stone-700">주식 거래</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-violet-600 rounded" />
              <span className="text-sm text-stone-700">Slack 메시지</span>
            </label>
          </div>
        </div>
      </div>
      {/* 모달 푸터 */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-100 bg-stone-50">
        <button onClick="document.getElementById('createModal').classList.add('hidden')" className="bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-50 transition-all duration-150">취소</button>
        <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 flex items-center gap-2">
          <Plus className="w-4 h-4" />에이전트 생성
        </button>
      </div>
    </div>
  </div>
    </>
  );
}

export default AdminAgents;
