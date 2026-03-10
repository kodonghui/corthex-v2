"use client";
import React from "react";
import { Activity, BarChart2, Bot, Briefcase, Building2, ChevronDown, Database, DollarSign, Download, FileText, GitBranch, GitFork, KeyRound, LayoutDashboard, Move, Plus, Save, Settings, Shield, Sparkles, Store, UserPlus, Users, Workflow, Wrench } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }

    /* Org chart connector lines */
    .org-connector-v {
      width: 2px;
      background: #e7e5e4;
      margin: 0 auto;
    }
    .org-connector-h {
      height: 2px;
      background: #e7e5e4;
    }
    .org-branch {
      position: relative;
    }
    .org-branch::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 24px;
      background: #e7e5e4;
    }
    .dept-group {
      position: relative;
    }
    .dept-group::before {
      content: '';
      position: absolute;
      top: -24px;
      left: 0;
      right: 0;
      height: 2px;
      background: #e7e5e4;
    }
    .dept-group::after {
      content: '';
      position: absolute;
      top: -24px;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 24px;
      background: #e7e5e4;
    }

    .agent-node {
      transition: all 0.15s ease;
    }
    .agent-node:hover {
      border-color: #7c3aed;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.12);
      transform: translateY(-1px);
    }
    .agent-node.selected {
      border-color: #7c3aed;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
    }
    .status-dot-online { background: #10b981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2); }
    .status-dot-working { background: #f59e0b; box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2); }
    .status-dot-offline { background: #9ca3af; }`;

function AdminOrgChart() {
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
      <a href="/admin/org-chart" className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-violet-50 text-violet-700 font-medium"><GitFork className="w-4 h-4" />조직도</a>
      <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Users className="w-4 h-4" />인간 직원</a>
      <a href="/admin/agents" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Bot className="w-4 h-4" />AI 에이전트</a>
      <a href="/admin/tools" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Wrench className="w-4 h-4" />도구 관리</a>
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
  <main className="ml-60 min-h-screen flex flex-col">

    {/* Top Bar */}
    <div className="bg-white border-b border-stone-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-bold text-stone-900">조직도</h1>
          <p className="text-xs text-stone-500">노드를 클릭하여 상세 정보를 확인하세요</p>
        </div>
        <div className="h-6 w-px bg-stone-200"></div>
        {/* Company Selector */}
        <div className="relative">
          <select className="rounded-lg border border-stone-200 pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-stone-800 font-medium appearance-none cursor-pointer">
            <option>ACME Corp</option>
            <option>Beta Inc.</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-xs text-stone-400 mr-2 flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5" />노드를 드래그하여 레이아웃을 조정할 수 있습니다.
        </p>
        <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-3.5 py-2 text-sm font-medium hover:bg-stone-50 transition-colors flex items-center gap-1.5">
          <Download className="w-4 h-4" />내보내기
        </button>
        <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3.5 py-2 text-sm font-semibold flex items-center gap-1.5 transition-colors">
          <Save className="w-4 h-4" />레이아웃 저장
        </button>
      </div>
    </div>

    {/* Chart + Detail Panel */}
    <div className="flex flex-1 overflow-hidden">

      {/* Org Chart Canvas */}
      <div className="flex-1 overflow-auto p-8 pb-32">

        {/* Company Root Node */}
        <div className="flex flex-col items-center">
          <div className="bg-white border-2 border-violet-400 rounded-xl px-6 py-3 shadow-md flex items-center gap-3 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-stone-900 text-sm">ACME Corp</p>
              <p className="text-xs text-stone-500">12명 · 4개 부서</p>
            </div>
          </div>

          {/* Vertical connector down */}
          <div className="org-connector-v h-8"></div>

          {/* 비서실 */}
          <div className="flex flex-col items-center mb-4">
            <div className="bg-violet-50 border border-violet-200 rounded-xl px-5 py-2.5 flex items-center gap-2 mb-0">
              <Briefcase className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-semibold text-violet-800">비서실</span>
              <span className="text-xs text-violet-500 ml-1">직속</span>
            </div>
            <div className="org-connector-v h-6"></div>

            {/* 비서실 Agents */}
            <div className="flex items-start gap-3">
              {/* 이나경 (selected) */}
              <div onClick="selectNode('이나경')" className="agent-node selected bg-white border-2 border-violet-400 rounded-xl p-3 w-36 cursor-pointer shadow-sm" style={{"boxShadow":"0 0 0 3px rgba(124,58,237,0.15)"}}>
                <div className="relative mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-sm font-bold mx-auto">이</div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full status-dot-online border-2 border-white"></span>
                </div>
                <p className="text-xs font-semibold text-stone-900 text-center truncate">이나경</p>
                <p className="text-[10px] text-stone-400 text-center truncate">비서실장</p>
              </div>

              {/* Add more button */}
              <div className="w-28 h-24 rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-violet-300 hover:bg-violet-50/30 transition-colors group">
                <Plus className="w-4 h-4 text-stone-300 group-hover:text-violet-500" />
                <span className="text-[10px] text-stone-300 group-hover:text-violet-500 font-medium text-center leading-tight">에이전트<br />추가</span>
              </div>
            </div>
          </div>

          {/* Vertical to departments */}
          <div className="org-connector-v h-8"></div>

          {/* Horizontal branch bar spanning all 4 departments */}
          <div className="relative w-full max-w-4xl">
            <div className="org-connector-h w-full"></div>
          </div>

          {/* 4 Departments */}
          <div className="grid grid-cols-4 gap-5 w-full max-w-4xl mt-0 pt-0">

            {/* 마케팅부서 */}
            <div className="flex flex-col items-center dept-group">
              {/* Dept Header */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 text-center mb-4 w-full">
                <p className="text-xs font-bold text-rose-700">마케팅부서</p>
                <p className="text-[10px] text-rose-400">3명</p>
              </div>
              {/* 부서장 */}
              <div onClick="selectNode('박준형')" className="agent-node bg-white border border-stone-200 rounded-xl p-3 w-full cursor-pointer shadow-sm mb-3 hover:border-violet-300">
                <div className="relative mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-xs font-bold mx-auto">박</div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full status-dot-working border-2 border-white"></span>
                </div>
                <p className="text-xs font-semibold text-stone-900 text-center">박준형</p>
                <p className="text-[10px] text-stone-400 text-center">마케팅 리더</p>
              </div>
              {/* Member */}
              <div onClick="selectNode('최민지')" className="agent-node bg-white border border-stone-200 rounded-xl p-3 w-full cursor-pointer shadow-sm mb-2 hover:border-violet-300">
                <div className="relative mb-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 text-xs font-bold mx-auto">최</div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full status-dot-online border-2 border-white"></span>
                </div>
                <p className="text-xs font-semibold text-stone-900 text-center">최민지</p>
                <p className="text-[10px] text-stone-400 text-center">SNS 운영</p>
              </div>
              <button className="text-[10px] text-stone-400 hover:text-violet-600 py-1.5 w-full text-center border border-dashed border-stone-200 rounded-lg hover:border-violet-300 transition-colors">+2명 더 보기</button>
            </div>

            {/* 전략투자부서 */}
            <div className="flex flex-col items-center dept-group">
              <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 text-center mb-4 w-full">
                <p className="text-xs font-bold text-sky-700">전략투자부서</p>
                <p className="text-[10px] text-sky-400">2명</p>
              </div>
              <div onClick="selectNode('김재원')" className="agent-node bg-white border border-stone-200 rounded-xl p-3 w-full cursor-pointer shadow-sm mb-3 hover:border-violet-300">
                <div className="relative mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xs font-bold mx-auto">김</div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full status-dot-online border-2 border-white"></span>
                </div>
                <p className="text-xs font-semibold text-stone-900 text-center">김재원</p>
                <p className="text-[10px] text-stone-400 text-center">투자 분석가</p>
              </div>
              <div onClick="selectNode('정도현')" className="agent-node bg-white border border-stone-200 rounded-xl p-3 w-full cursor-pointer shadow-sm mb-2 hover:border-violet-300">
                <div className="relative mb-2">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 text-xs font-bold mx-auto">정</div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full status-dot-working border-2 border-white"></span>
                </div>
                <p className="text-xs font-semibold text-stone-900 text-center">정도현</p>
                <p className="text-[10px] text-stone-400 text-center">리서처</p>
              </div>
              <button className="text-[10px] text-stone-400 hover:text-violet-600 py-1.5 w-full text-center border border-dashed border-stone-200 rounded-lg hover:border-violet-300 transition-colors">+ 추가</button>
            </div>

            {/* 법무부서 */}
            <div className="flex flex-col items-center dept-group">
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center mb-4 w-full">
                <p className="text-xs font-bold text-amber-700">법무부서</p>
                <p className="text-[10px] text-amber-400">1명</p>
              </div>
              <div onClick="selectNode('이소연')" className="agent-node bg-white border border-stone-200 rounded-xl p-3 w-full cursor-pointer shadow-sm mb-3 hover:border-violet-300">
                <div className="relative mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold mx-auto">이</div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full status-dot-online border-2 border-white"></span>
                </div>
                <p className="text-xs font-semibold text-stone-900 text-center">이소연</p>
                <p className="text-[10px] text-stone-400 text-center">법무 전문가</p>
              </div>
              <button className="text-[10px] text-stone-400 hover:text-violet-600 py-1.5 w-full text-center border border-dashed border-stone-200 rounded-lg hover:border-violet-300 transition-colors">+ 추가</button>
            </div>

            {/* 연구개발부서 */}
            <div className="flex flex-col items-center dept-group">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-center mb-4 w-full">
                <p className="text-xs font-bold text-emerald-700">연구개발부서</p>
                <p className="text-[10px] text-emerald-400">0명</p>
              </div>
              {/* Empty state */}
              <div className="border-2 border-dashed border-stone-200 rounded-xl p-4 w-full flex flex-col items-center gap-2 text-stone-300 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer transition-colors group">
                <UserPlus className="w-6 h-6 group-hover:text-emerald-500" />
                <p className="text-[10px] font-medium text-center group-hover:text-emerald-600">팀원 없음<br />에이전트 배정</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Right Detail Panel (fixed 240px) */}
      <div className="w-60 border-l border-stone-200 bg-white flex flex-col flex-shrink-0 overflow-y-auto">
        {/* Panel Header */}
        <div className="px-4 py-3.5 border-b border-stone-100">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">선택된 노드</p>
        </div>

        {/* Selected: 이나경 */}
        <div className="p-4 border-b border-stone-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold text-base">이</div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full status-dot-online border-2 border-white"></span>
            </div>
            <div>
              <p className="font-bold text-stone-900 text-sm">이나경</p>
              <p className="text-xs text-stone-500">비서실장</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">부서</span>
              <span className="font-medium text-stone-800">비서실 (직속)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">계급</span>
              <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-violet-50 text-violet-700">L5 — 리더</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">모델</span>
              <span className="font-medium text-stone-800">claude-3-7-sonnet</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">상태</span>
              <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>온라인
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">오늘 호출</span>
              <span className="font-semibold text-violet-700">247회</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">평균 응답</span>
              <span className="font-medium text-stone-800">1.2초</span>
            </div>
          </div>
        </div>

        {/* Soul Preview */}
        <div className="p-4 border-b border-stone-100">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">소울 미리보기</p>
          <div className="bg-stone-50 rounded-lg p-3 text-[10px] text-stone-600 leading-relaxed" style={{"fontFamily":"'JetBrains Mono',monospace"}}>
            당신은 CORTHEX의 비서실장 AI 에이전트입니다. 명령을 분류하고 적절한 부서로 위임하며, 결과를 종합하여 보고합니다. 신중하고 정확한 커뮤니케이션...
          </div>
          <p className="text-[10px] text-stone-400 mt-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />비서실장 소울 (빌트인)
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2">
          <button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
            <Sparkles className="w-3.5 h-3.5" />소울 편집
          </button>
          <button className="w-full bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-2 text-xs font-medium hover:bg-stone-50 flex items-center justify-center gap-1.5 transition-colors">
            <Settings className="w-3.5 h-3.5" />설정 변경
          </button>
          <button className="w-full bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-2 text-xs font-medium hover:bg-stone-50 flex items-center justify-center gap-1.5 transition-colors">
            <Activity className="w-3.5 h-3.5" />활동 로그
          </button>
        </div>

        {/* Tasks Today */}
        <div className="px-4 pb-4">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">오늘의 작업</p>
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
              <p className="text-[10px] text-stone-600 leading-relaxed">주간 보고서 취합 완료</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
              <p className="text-[10px] text-stone-600 leading-relaxed">마케팅 캠페인 위임 처리 중...</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 flex-shrink-0"></div>
              <p className="text-[10px] text-stone-400 leading-relaxed">투자 분석 결과 대기</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Legend Bar */}
    <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-stone-200 px-8 py-2.5 flex items-center gap-6 z-20">
      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">범례</span>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full status-dot-online"></span>
        <span className="text-xs text-stone-600">온라인 — 작업 대기 중</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full status-dot-working"></span>
        <span className="text-xs text-stone-600">워킹 — 현재 작업 실행 중</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full status-dot-offline"></span>
        <span className="text-xs text-stone-600">오프라인 — 비활성</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-0.5 bg-violet-400 rounded"></span>
        <span className="text-xs text-stone-600">직속 보고선</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-0.5 bg-stone-300 rounded"></span>
        <span className="text-xs text-stone-600">일반 보고선</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-stone-400">API:</span>
        <code className="text-xs text-stone-500">GET /api/admin/org-chart</code>
        <code className="text-xs text-stone-500">GET /api/workspace/nexus/org</code>
      </div>
    </div>

  </main>
    </>
  );
}

export default AdminOrgChart;
