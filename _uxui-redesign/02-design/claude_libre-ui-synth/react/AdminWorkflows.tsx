"use client";
import React from "react";
import { Activity, BarChart2, Bell, BellRing, Bot, Brain, Briefcase, Building2, CircleDollarSign, Clock, Copy, Database, Edit3, FileBarChart, FileText, GitBranch, Key, LayoutDashboard, Newspaper, Play, Plug, Plus, Rss, Settings, Shield, Store, TrendingUp, UserCheck, UserPlus, Users, Workflow, Zap } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    .flow-arrow {
      display: flex;
      align-items: center;
      gap: 0;
    }
    .flow-arrow::after {
      content: '';
      display: block;
      width: 24px;
      height: 2px;
      background: #d6d3d1;
      flex-shrink: 0;
    }
    .flow-arrow:last-child::after { display: none; }`;

function AdminWorkflows() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      {/* Sidebar */}
  <aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-10">
    <div className="px-5 py-4 border-b border-stone-100">
      <div className="flex items-center gap-2 mb-1">
        <span className="bg-violet-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest">ADMIN</span>
      </div>
      <span className="text-lg font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
    </div>
    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 py-1.5 mt-1">개요</p>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><LayoutDashboard className="w-4 h-4" /> 대시보드</a>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 py-1.5 mt-2">조직 관리</p>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Building2 className="w-4 h-4" /> 회사 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Users className="w-4 h-4" /> 사용자 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><GitBranch className="w-4 h-4" /> 부서 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Bot className="w-4 h-4" /> 에이전트 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><UserCheck className="w-4 h-4" /> 직원 관리</a>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 py-1.5 mt-2">운영</p>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><CircleDollarSign className="w-4 h-4" /> 비용 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Activity className="w-4 h-4" /> 모니터링</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm bg-violet-50 text-violet-700 font-medium"><Workflow className="w-4 h-4" /> 워크플로우</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Key className="w-4 h-4" /> 크리덴셜</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><FileBarChart className="w-4 h-4" /> 보고서</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Briefcase className="w-4 h-4" /> 작업 현황</a>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 py-1.5 mt-2">설정</p>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Settings className="w-4 h-4" /> 시스템 설정</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Store className="w-4 h-4" /> 템플릿 마켓</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><UserPlus className="w-4 h-4" /> 온보딩</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Shield className="w-4 h-4" /> 보안 로그</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Bell className="w-4 h-4" /> 알림 설정</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Database className="w-4 h-4" /> 데이터 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Plug className="w-4 h-4" /> API 연동</a>
    </nav>
    <div className="px-3 py-3 border-t border-stone-100">
      <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-stone-50 cursor-pointer">
        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-xs">A</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-stone-800 truncate">관리자</p>
          <p className="text-[10px] text-stone-500 truncate">admin@corthex.io</p>
        </div>
      </div>
    </div>
  </aside>

  {/* Main content */}
  <main className="ml-60 p-8">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-xl font-bold text-stone-900">워크플로우</h1>
        <p className="text-sm text-stone-500 mt-0.5">에이전트 간 자동화 흐름을 시각적으로 설계합니다.</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-1 rounded">GET /api/admin/workflows · POST /api/admin/workflows</span>
        <button className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">
          <Plus className="w-4 h-4" /> 새 워크플로우
        </button>
      </div>
    </div>

    {/* Summary Stats */}
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center"><Workflow className="w-4 h-4 text-violet-600" /></div>
        <div><p className="text-lg font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>4</p><p className="text-xs text-stone-500">전체 워크플로우</p></div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><Play className="w-4 h-4 text-emerald-600" /></div>
        <div><p className="text-lg font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>3</p><p className="text-xs text-stone-500">활성</p></div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><Zap className="w-4 h-4 text-blue-600" /></div>
        <div><p className="text-lg font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>185</p><p className="text-xs text-stone-500">총 실행 횟수</p></div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"><Clock className="w-4 h-4 text-amber-600" /></div>
        <div><p className="text-lg font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>4.2분</p><p className="text-xs text-stone-500">평균 실행 시간</p></div>
      </div>
    </div>

    {/* Workflow Cards Grid */}
    <div className="grid grid-cols-2 gap-4 mb-6">

      {/* Workflow 1: 활성 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 cursor-pointer hover:border-violet-300 hover:shadow-md transition-all" onClick="selectWorkflow(0)">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 활성
              </span>
              <span className="text-xs text-stone-400 bg-stone-100 rounded px-1.5 py-0.5">3단계</span>
            </div>
            <h3 className="font-bold text-stone-900 text-sm">일일 시황 분석 → SNS 발행</h3>
            <p className="text-xs text-stone-500 mt-1">매일 오전 7시 시황 수집 → 투자 분석 → 인스타그램/트위터 자동 발행</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 ml-3">
            <TrendingUp className="w-5 h-5 text-violet-600" />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
          <span>마지막 실행: 오늘 07:30</span>
          <span className="font-medium text-stone-700">총 45회</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex-1 bg-white border border-stone-200 text-stone-700 rounded-lg py-1.5 text-xs font-medium hover:bg-stone-50 flex items-center justify-center gap-1">
            <Edit3 className="w-3 h-3" /> 편집
          </button>
          <button className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg py-1.5 text-xs font-medium hover:bg-emerald-100 flex items-center justify-center gap-1">
            <Play className="w-3 h-3" /> 실행
          </button>
          <button className="flex-1 bg-white border border-stone-200 text-stone-600 rounded-lg py-1.5 text-xs font-medium hover:bg-stone-50 flex items-center justify-center gap-1">
            <Copy className="w-3 h-3" /> 복제
          </button>
        </div>
      </div>

      {/* Workflow 2: 활성 */}
      <div className="bg-white rounded-xl border-2 border-violet-500 shadow-md p-5 cursor-pointer" onClick="selectWorkflow(1)">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 활성
              </span>
              <span className="text-xs text-stone-400 bg-stone-100 rounded px-1.5 py-0.5">4단계</span>
              <span className="text-xs text-violet-600 bg-violet-50 rounded px-1.5 py-0.5 font-medium">선택됨</span>
            </div>
            <h3 className="font-bold text-stone-900 text-sm">신규 뉴스 → 투자 분석 → 알림</h3>
            <p className="text-xs text-stone-500 mt-1">뉴스 수집 → 투자 유의미성 판별 → 조건 충족 시 Slack 알림 발송</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 ml-3">
            <Newspaper className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
          <span>마지막 실행: 오늘 10:00</span>
          <span className="font-medium text-stone-700">총 120회</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex-1 bg-violet-600 text-white rounded-lg py-1.5 text-xs font-medium hover:bg-violet-700 flex items-center justify-center gap-1">
            <Edit3 className="w-3 h-3" /> 편집
          </button>
          <button className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg py-1.5 text-xs font-medium hover:bg-emerald-100 flex items-center justify-center gap-1">
            <Play className="w-3 h-3" /> 실행
          </button>
          <button className="flex-1 bg-white border border-stone-200 text-stone-600 rounded-lg py-1.5 text-xs font-medium hover:bg-stone-50 flex items-center justify-center gap-1">
            <Copy className="w-3 h-3" /> 복제
          </button>
        </div>
      </div>

      {/* Workflow 3: 비활성 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 cursor-pointer hover:border-violet-300 hover:shadow-md transition-all opacity-70" onClick="selectWorkflow(2)">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-stone-100 text-stone-500 rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span> 비활성
              </span>
              <span className="text-xs text-stone-400 bg-stone-100 rounded px-1.5 py-0.5">3단계</span>
            </div>
            <h3 className="font-bold text-stone-900 text-sm">계약서 입력 → 법무 검토 → 보고</h3>
            <p className="text-xs text-stone-500 mt-1">계약서 PDF 업로드 → 법무 AI 검토 → 리스크 보고서 생성</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0 ml-3">
            <FileText className="w-5 h-5 text-stone-400" />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
          <span>마지막 실행: 1주 전</span>
          <span className="font-medium text-stone-700">총 8회</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex-1 bg-white border border-stone-200 text-stone-700 rounded-lg py-1.5 text-xs font-medium hover:bg-stone-50 flex items-center justify-center gap-1">
            <Edit3 className="w-3 h-3" /> 편집
          </button>
          <button className="flex-1 bg-stone-50 border border-stone-200 text-stone-500 rounded-lg py-1.5 text-xs font-medium flex items-center justify-center gap-1 cursor-not-allowed" disabled>
            <Play className="w-3 h-3" /> 실행
          </button>
          <button className="flex-1 bg-white border border-stone-200 text-stone-600 rounded-lg py-1.5 text-xs font-medium hover:bg-stone-50 flex items-center justify-center gap-1">
            <Copy className="w-3 h-3" /> 복제
          </button>
        </div>
      </div>

      {/* Workflow 4: 활성 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 cursor-pointer hover:border-violet-300 hover:shadow-md transition-all" onClick="selectWorkflow(3)">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 활성
              </span>
              <span className="text-xs text-stone-400 bg-stone-100 rounded px-1.5 py-0.5">4단계</span>
            </div>
            <h3 className="font-bold text-stone-900 text-sm">주간 성과 → 보고서 → 이메일 발송</h3>
            <p className="text-xs text-stone-500 mt-1">매주 금요일 KPI 집계 → 보고서 생성 → 전체 팀 이메일 발송</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 ml-3">
            <BarChart2 className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
          <span>마지막 실행: 어제</span>
          <span className="font-medium text-stone-700">총 12회</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex-1 bg-white border border-stone-200 text-stone-700 rounded-lg py-1.5 text-xs font-medium hover:bg-stone-50 flex items-center justify-center gap-1">
            <Edit3 className="w-3 h-3" /> 편집
          </button>
          <button className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg py-1.5 text-xs font-medium hover:bg-emerald-100 flex items-center justify-center gap-1">
            <Play className="w-3 h-3" /> 실행
          </button>
          <button className="flex-1 bg-white border border-stone-200 text-stone-600 rounded-lg py-1.5 text-xs font-medium hover:bg-stone-50 flex items-center justify-center gap-1">
            <Copy className="w-3 h-3" /> 복제
          </button>
        </div>
      </div>
    </div>

    {/* Workflow Visualization: "신규 뉴스 → 투자 분석 → 알림" */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-stone-900 text-sm">워크플로우 시각화 미리보기</h3>
          <p className="text-xs text-stone-500 mt-0.5">신규 뉴스 → 투자 분석 → 알림 (선택됨)</p>
        </div>
        <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-1 rounded">PUT /api/admin/workflows/{id}</span>
      </div>

      {/* Flow Diagram */}
      <div className="flex items-center gap-0 overflow-x-auto pb-2">

        {/* Node 1: Trigger */}
        <div className="flow-arrow">
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Rss className="w-5 h-5 text-blue-600" />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 text-center w-32">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-500 mb-0.5">트리거</p>
              <p className="text-xs font-bold text-stone-800">뉴스 수집</p>
              <p className="text-[10px] text-stone-500 mt-0.5">15분마다</p>
            </div>
          </div>
        </div>

        {/* Arrow 1 */}
        <div className="flex items-center gap-0 flex-shrink-0 mx-1">
          <div className="w-8 h-px bg-stone-300"></div>
          <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-stone-300" style={{"borderLeftWidth":"6px"}}></div>
        </div>

        {/* Node 2: Analysis */}
        <div className="flow-arrow">
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
              <Brain className="w-5 h-5 text-violet-600" />
            </div>
            <div className="bg-violet-50 border border-violet-200 rounded-lg px-3 py-2.5 text-center w-32">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-500 mb-0.5">에이전트</p>
              <p className="text-xs font-bold text-stone-800">투자 분석</p>
              <p className="text-[10px] text-stone-500 mt-0.5">박준형 (AI)</p>
            </div>
          </div>
        </div>

        {/* Arrow 2 */}
        <div className="flex items-center gap-0 flex-shrink-0 mx-1">
          <div className="w-8 h-px bg-stone-300"></div>
          <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-stone-300" style={{"borderLeftWidth":"6px"}}></div>
        </div>

        {/* Node 3: Condition */}
        <div className="flow-arrow">
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-amber-600" />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-center w-32">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500 mb-0.5">조건</p>
              <p className="text-xs font-bold text-stone-800">유의미한가?</p>
              <p className="text-[10px] text-stone-500 mt-0.5">신뢰도 ≥ 0.7</p>
            </div>
          </div>
        </div>

        {/* Arrow 3 */}
        <div className="flex items-center gap-0 flex-shrink-0 mx-1">
          <div className="w-8 h-px bg-stone-300"></div>
          <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-stone-300" style={{"borderLeftWidth":"6px"}}></div>
        </div>

        {/* Node 4: Action */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <BellRing className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 text-center w-32">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500 mb-0.5">액션</p>
            <p className="text-xs font-bold text-stone-800">알림 발송</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Slack + 이메일</p>
          </div>
        </div>
      </div>

      {/* Execution History mini */}
      <div className="mt-5 pt-4 border-t border-stone-100">
        <p className="text-xs font-semibold text-stone-600 mb-2">최근 실행 이력</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-emerald-50 rounded-lg">
            <span className="text-stone-600 font-mono">오늘 10:00:15</span>
            <span className="text-emerald-600 font-medium">성공 — 알림 발송됨 (신뢰도 0.88)</span>
            <span className="text-stone-400">2분 12초</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-stone-50 rounded-lg">
            <span className="text-stone-600 font-mono">오늘 09:45:03</span>
            <span className="text-stone-500">스킵 — 유의미하지 않음 (신뢰도 0.42)</span>
            <span className="text-stone-400">58초</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-emerald-50 rounded-lg">
            <span className="text-stone-600 font-mono">오늘 09:30:07</span>
            <span className="text-emerald-600 font-medium">성공 — 알림 발송됨 (신뢰도 0.93)</span>
            <span className="text-stone-400">1분 45초</span>
          </div>
        </div>
      </div>
    </div>
  </main>
    </>
  );
}

export default AdminWorkflows;
