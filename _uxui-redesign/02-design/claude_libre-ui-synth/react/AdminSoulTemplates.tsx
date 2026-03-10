"use client";
import React from "react";
import { Activity, BarChart2, Bot, Building2, CheckCircle, Clipboard, Code2, Copy, Crown, Database, DollarSign, Edit2, Eye, FileText, GitBranch, GitFork, KeyRound, LayoutDashboard, LineChart, Lock, Megaphone, Microscope, PenTool, Plus, Scale, Settings, Shield, Sparkles, Store, Trash2, User, UserCircle, UserPlus, Users, Workflow, Wrench } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; } h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; } code,pre { font-family: 'JetBrains Mono', monospace; }
`;

function AdminSoulTemplates() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar */}
  <aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-40">
    <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2.5">
      <span className="bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider">ADMIN</span>
      <span className="font-bold text-stone-900 text-base" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
    </div>
    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 text-sm">
      <a href="/admin/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><LayoutDashboard className="w-4 h-4" />대시보드</a>
      <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Building2 className="w-4 h-4" />조직 관리</a>
      <a href="/admin/org-chart" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><GitFork className="w-4 h-4" />조직도</a>
      <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Users className="w-4 h-4" />인간 직원</a>
      <a href="/admin/agents" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Bot className="w-4 h-4" />AI 에이전트</a>
      <a href="/admin/tools" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Wrench className="w-4 h-4" />도구 관리</a>
      <a href="/admin/credentials" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><KeyRound className="w-4 h-4" />크리덴셜</a>
      <a href="/admin/soul-templates" className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-violet-50 text-violet-700 font-medium"><Sparkles className="w-4 h-4" />소울 템플릿</a>
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
          <h1 className="text-xl font-bold text-stone-900">소울 템플릿</h1>
          <p className="text-sm text-stone-500 mt-0.5">에이전트 성격, 전문성, 행동 방식 정의</p>
        </div>
        <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          템플릿 생성
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl px-5 py-3.5 mb-6 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-violet-800">소울 템플릿은 에이전트의 <strong className="font-semibold">성격, 전문성, 행동 방식</strong>을 정의합니다. 에이전트 생성 시 선택하거나 직접 작성할 수 있습니다. 시스템 템플릿(빌트인)은 편집할 수 없으며, 복사 후 수정하여 내 템플릿으로 저장할 수 있습니다.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white rounded-xl border border-stone-200 shadow-sm p-1.5 w-fit">
        <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-violet-600 text-white flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />시스템 템플릿
          <span className="bg-violet-500 text-white text-xs px-1.5 py-0.5 rounded-full">6</span>
        </button>
        <button className="px-4 py-2 text-sm font-medium rounded-lg text-stone-600 hover:bg-stone-100 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />내 템플릿
          <span className="bg-stone-100 text-stone-500 text-xs px-1.5 py-0.5 rounded-full">1</span>
        </button>
      </div>

      {/* System Templates Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">

        {/* Card 1: 비서실장 소울 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 hover:border-violet-200 hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Crown className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-500">시스템</span>
              <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-violet-50 text-violet-600 border border-violet-100">빌트인</span>
            </div>
          </div>
          <h3 className="font-bold text-stone-900 text-sm mb-1">비서실장 소울</h3>
          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-violet-50 text-violet-700 inline-block mb-2.5">시스템</span>
          <p className="text-xs text-stone-500 leading-relaxed mb-4">명령 분류, 위임 조율, 결과 종합 전문. 신중하고 정확한 커뮤니케이션으로 조직 전체의 효율을 극대화합니다.</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400">
              <Bot className="w-3 h-3 inline-block mr-0.5" />1 에이전트 사용
            </span>
            <button className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-3.5 h-3.5" />미리보기
            </button>
          </div>
        </div>

        {/* Card 2: 마케팅 전문가 (selected) */}
        <div className="bg-white rounded-xl border-2 border-violet-400 shadow-md p-5 cursor-pointer ring-4 ring-violet-50">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-rose-600" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-500">시스템</span>
              <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-violet-50 text-violet-600 border border-violet-100">빌트인</span>
            </div>
          </div>
          <h3 className="font-bold text-stone-900 text-sm mb-1">마케팅 전문가</h3>
          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-rose-50 text-rose-700 inline-block mb-2.5">마케팅</span>
          <p className="text-xs text-stone-500 leading-relaxed mb-4">창의적 콘텐츠 기획, 데이터 기반 전략 수립, SNS 채널 운영 전문. ROI 중심 의사결정으로 브랜드 성장을 이끕니다.</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400">
              <Bot className="w-3 h-3 inline-block mr-0.5" />3 에이전트 사용
            </span>
            <span className="text-xs font-semibold text-violet-600 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />선택됨
            </span>
          </div>
        </div>

        {/* Card 3: 투자 분석가 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 hover:border-violet-200 hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
              <LineChart className="w-5 h-5 text-sky-600" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-500">시스템</span>
              <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-violet-50 text-violet-600 border border-violet-100">빌트인</span>
            </div>
          </div>
          <h3 className="font-bold text-stone-900 text-sm mb-1">투자 분석가</h3>
          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-sky-50 text-sky-700 inline-block mb-2.5">금융</span>
          <p className="text-xs text-stone-500 leading-relaxed mb-4">주식/ETF 분석, 포트폴리오 최적화, 리스크 관리 전문. 정량적 분석과 시장 심리 해석을 결합한 투자 판단을 제공합니다.</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400">
              <Bot className="w-3 h-3 inline-block mr-0.5" />2 에이전트 사용
            </span>
            <button className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-3.5 h-3.5" />미리보기
            </button>
          </div>
        </div>

        {/* Card 4: 법무 전문가 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 hover:border-violet-200 hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Scale className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-500">시스템</span>
              <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-violet-50 text-violet-600 border border-violet-100">빌트인</span>
            </div>
          </div>
          <h3 className="font-bold text-stone-900 text-sm mb-1">법무 전문가</h3>
          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 inline-block mb-2.5">법무</span>
          <p className="text-xs text-stone-500 leading-relaxed mb-4">계약서 검토, 법령 해석, 컴플라이언스 자문 전문. 명확하고 리스크 중심적인 법률 언어로 의사결정을 지원합니다.</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400">
              <Bot className="w-3 h-3 inline-block mr-0.5" />1 에이전트 사용
            </span>
            <button className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-3.5 h-3.5" />미리보기
            </button>
          </div>
        </div>

        {/* Card 5: 리서처 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 hover:border-violet-200 hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Microscope className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-500">시스템</span>
              <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-violet-50 text-violet-600 border border-violet-100">빌트인</span>
            </div>
          </div>
          <h3 className="font-bold text-stone-900 text-sm mb-1">리서처</h3>
          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-stone-100 text-stone-600 inline-block mb-2.5">공통</span>
          <p className="text-xs text-stone-500 leading-relaxed mb-4">심층 정보 수집, 팩트체크, 인사이트 도출 전문. 다양한 출처를 교차 검증하여 신뢰할 수 있는 정보를 제공합니다.</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400">
              <Bot className="w-3 h-3 inline-block mr-0.5" />4 에이전트 사용
            </span>
            <button className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-3.5 h-3.5" />미리보기
            </button>
          </div>
        </div>

        {/* Card 6: 카피라이터 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 hover:border-violet-200 hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <PenTool className="w-5 h-5 text-pink-600" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-500">시스템</span>
              <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-violet-50 text-violet-600 border border-violet-100">빌트인</span>
            </div>
          </div>
          <h3 className="font-bold text-stone-900 text-sm mb-1">카피라이터</h3>
          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-rose-50 text-rose-700 inline-block mb-2.5">마케팅</span>
          <p className="text-xs text-stone-500 leading-relaxed mb-4">설득력 있는 카피 작성, 브랜드 보이스 유지 전문. 독자 심리를 파악한 문장으로 전환율을 높이는 콘텐츠를 생성합니다.</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400">
              <Bot className="w-3 h-3 inline-block mr-0.5" />2 에이전트 사용
            </span>
            <button className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-3.5 h-3.5" />미리보기
            </button>
          </div>
        </div>
      </div>

      {/* My Templates Section */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
          <UserCircle className="w-4 h-4 text-stone-500" />내 템플릿
        </h2>
        {/* Custom Template Card */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 hover:border-violet-200 hover:shadow-md transition-all cursor-pointer group relative">
            <div className="absolute top-3 right-3 flex items-center gap-1">
              <button className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors opacity-0 group-hover:opacity-100">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center">
                <LineChart className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">맞춤 투자 분석가</h3>
                <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-sky-50 text-sky-700">금융</span>
              </div>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed mb-4">기존 투자 분석가 템플릿 기반, ACME Corp 투자 철학 및 리스크 허용 범위 추가. 개인화된 포트폴리오 가이드라인 포함.</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400">
                <Bot className="w-3 h-3 inline-block mr-0.5" />1 에이전트 사용
              </span>
              <span className="text-xs text-stone-400">투자 분석가 기반</span>
            </div>
          </div>
          {/* Add New */}
          <button className="bg-white rounded-xl border-2 border-dashed border-stone-200 p-5 flex flex-col items-center justify-center gap-3 hover:border-violet-300 hover:bg-violet-50/30 transition-all text-stone-400 hover:text-violet-600 group">
            <div className="w-10 h-10 rounded-xl border-2 border-dashed border-stone-200 group-hover:border-violet-300 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">새 템플릿 생성</span>
          </button>
        </div>
      </div>

      {/* Soul Editor */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-stone-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-violet-600" />
              소울 편집기
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">현재 선택: <span className="font-semibold text-violet-700">마케팅 전문가</span></p>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-50 transition-colors flex items-center gap-1.5">
              <Copy className="w-4 h-4" />복사해서 수정
            </button>
            <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-50 transition-colors flex items-center gap-1.5">
              <Clipboard className="w-4 h-4" />클립보드 복사
            </button>
          </div>
        </div>
        <div className="bg-stone-50 rounded-xl border border-stone-100 p-4">
          <pre className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap" style={{fontFamily: "'JetBrains Mono',monospace"}}>당신은 CORTHEX의 마케팅 전문 AI 에이전트입니다.

## 역할 및 전문 영역
- 디지털 마케팅 전략 수립 및 실행
- SNS 콘텐츠 기획 및 발행 (Instagram, Naver Blog, YouTube)
- 데이터 기반 성과 분석 및 A/B 테스트 설계
- 브랜드 보이스 관리 및 카피라이팅

## 행동 원칙
1. 모든 결정은 데이터를 기반으로 한다
2. 창의성과 측정 가능성을 동시에 추구한다
3. 마감 기한을 최우선으로 존중한다
4. ROI가 불명확한 작업은 먼저 KPI를 설정한다

## 커뮤니케이션 스타일
- 간결하고 실행 지향적인 언어 사용
- 수치와 목표를 명확히 제시
- 창의적 제안 시 레퍼런스와 근거를 함께 제공

## 제약 사항
- 법적으로 문제가 될 수 있는 과장 광고 금지
- 미확인 정보를 사실인 것처럼 표현 금지
- 경쟁사 비방 콘텐츠 생성 금지</pre>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-stone-400">
          <Lock className="w-3 h-3" />
          시스템 템플릿은 직접 편집할 수 없습니다. "복사해서 수정" 버튼으로 내 템플릿을 생성하세요.
        </div>
      </div>

      {/* API Reference */}
      <div className="mt-6 bg-stone-900 rounded-xl p-5">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">API Reference</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-400 w-14 flex-shrink-0">GET</span>
            <code className="text-xs text-stone-300">/api/admin/soul-templates</code>
            <span className="text-xs text-stone-500">— 소울 템플릿 목록 조회 (system + mine)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-blue-400 w-14 flex-shrink-0">POST</span>
            <code className="text-xs text-stone-300">/api/admin/soul-templates</code>
            <span className="text-xs text-stone-500">— 새 소울 템플릿 생성</span>
          </div>
        </div>
      </div>

    </div>
  </main>
    </>
  );
}

export default AdminSoulTemplates;
