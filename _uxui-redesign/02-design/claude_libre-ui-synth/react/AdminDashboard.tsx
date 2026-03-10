"use client";
import React from "react";
import { Activity, AlertCircle, AlertTriangle, Bot, Briefcase, Building2, CheckCircle2, Clock, Code2, Database, DollarSign, ExternalLink, GitBranch, GitFork, KeyRound, LayoutDashboard, LayoutTemplate, Network, RefreshCw, Rocket, Server, Settings, ShoppingBag, Sparkles, Store, TrendingUp, UserCog, UserPlus, Users, Wifi, Wrench } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    .donut-ring {
      width: 128px; height: 128px;
      border-radius: 50%;
      background: conic-gradient(
        #7c3aed 0% 33%,
        #3b82f6 33% 58%,
        #ef4444 58% 62%,
        #d1d5db 62% 100%
      );
      display: flex; align-items: center; justify-content: center;
      position: relative;
      flex-shrink: 0;
    }
    .donut-inner {
      width: 80px; height: 80px;
      background: white; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
`;

function AdminDashboard() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar */}
  <aside className="w-64 min-h-screen bg-white border-r border-stone-200 flex flex-col fixed left-0 top-0 z-10 overflow-y-auto">
    <div className="px-5 py-5 border-b border-stone-100 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded">ADMIN</span>
        <span className="font-bold text-stone-900 text-lg" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
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
        <a href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 bg-violet-50 text-violet-700 font-medium rounded-lg text-sm"><LayoutDashboard className="w-4 h-4 flex-shrink-0" /> 대시보드</a>
        <a href="/admin/agents" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><Bot className="w-4 h-4 flex-shrink-0" /> 에이전트 관리</a>
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
  {/* API: GET /api/admin/dashboard/overview */}
  <main className="ml-64 flex-1 p-8">

    {/* Header */}
    <div className="flex items-center justify-between mb-7">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">관리자 대시보드</h1>
        <p className="text-sm text-stone-500 mt-0.5">2026년 3월 10일 (화) · ACME Corp</p>
      </div>
      <div className="flex items-center gap-3">
        <a href="/app/dashboard" className="flex items-center gap-2 bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-50 transition-all duration-150">
          <ExternalLink className="w-4 h-4" />
          App 보기
        </a>
        <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150">
          <RefreshCw className="w-4 h-4" />
          새로고침
        </button>
      </div>
    </div>

    {/* KPI 카드 4개 */}
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-stone-500 font-medium">총 에이전트</span>
          <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
            <Bot className="w-5 h-5 text-violet-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>24</p>
        <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />+3 이번 달 신규
        </p>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-stone-500 font-medium">이번 달 총 비용</span>
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>$12.40</p>
        <div className="mt-2">
          <div className="flex justify-between text-xs text-stone-500 mb-1"><span>예산 대비</span><span className="font-semibold text-amber-600">62%</span></div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{width: "62%"}}></div></div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-stone-500 font-medium">활성 직원</span>
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>5명</p>
        <p className="text-xs text-stone-500 mt-1.5 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>전원 정상 접속
        </p>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-stone-500 font-medium">완료 작업</span>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>1,247</p>
        <p className="text-xs text-stone-500 mt-1.5">이번 달 누적</p>
      </div>
    </div>

    {/* 하단 2열 레이아웃 */}
    <div className="grid grid-cols-3 gap-5">

      {/* 좌측 2열: 에이전트 현황 + 비용 + 활동 피드 */}
      <div className="col-span-2 space-y-5">

        {/* 에이전트 상태 현황 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-stone-900">에이전트 현황 — ACME Corp</h2>
            <span className="text-xs text-stone-400 bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-full">실시간</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="donut-ring">
              <div className="donut-inner">
                <div className="text-center">
                  <p className="text-lg font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>24</p>
                  <p className="text-[10px] text-stone-400 leading-none">총</p>
                </div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between bg-violet-50 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-600 flex-shrink-0"></span>
                  <span className="text-sm text-stone-700">Online</span>
                </div>
                <span className="font-bold text-stone-900 text-sm">8</span>
              </div>
              <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                  <span className="text-sm text-stone-700">Working</span>
                </div>
                <span className="font-bold text-stone-900 text-sm">6</span>
              </div>
              <div className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0"></span>
                  <span className="text-sm text-stone-700">Error</span>
                </div>
                <span className="font-bold text-stone-900 text-sm">1</span>
              </div>
              <div className="flex items-center justify-between bg-stone-50 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300 flex-shrink-0"></span>
                  <span className="text-sm text-stone-700">Offline</span>
                </div>
                <span className="font-bold text-stone-900 text-sm">9</span>
              </div>
            </div>
          </div>
        </div>

        {/* 부서별 비용 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-stone-900">부서별 이번 달 비용</h2>
            <span className="text-xs text-stone-500">합계 <span className="font-semibold text-stone-800">$16.60</span></span>
          </div>
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-sm mb-1.5"><span className="text-stone-600">전략투자부서</span><span className="font-semibold text-stone-900">$5.20</span></div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width: "83%"}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5"><span className="text-stone-600">마케팅부서</span><span className="font-semibold text-stone-900">$4.80</span></div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{width: "77%"}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5"><span className="text-stone-600">연구개발부서</span><span className="font-semibold text-stone-900">$3.10</span></div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-rose-500 rounded-full" style={{width: "50%"}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5"><span className="text-stone-600">비서실</span><span className="font-semibold text-stone-900">$2.30</span></div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{width: "37%"}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5"><span className="text-stone-600">법무부서</span><span className="font-semibold text-stone-900">$1.20</span></div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{width: "19%"}}></div></div>
            </div>
          </div>
        </div>

        {/* 최근 활동 피드 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-stone-900">최근 활동</h2>
            <button className="text-xs text-violet-600 hover:text-violet-700 font-medium">전체 보기 →</button>
          </div>
          <div className="space-y-0">
            <div className="flex gap-3 py-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <UserPlus className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-800">새 에이전트 <span className="font-semibold">'정도현'</span> 추가됨</p>
                <p className="text-xs text-stone-400 mt-0.5">전략투자부서 · Worker</p>
              </div>
              <span className="text-xs text-stone-400 flex-shrink-0 pt-0.5">1시간 전</span>
            </div>
            <div className="flex gap-3 py-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-800">SNS 자동발행 실패 — <span className="text-red-600 font-medium">Instagram 토큰 만료</span></p>
                <p className="text-xs text-stone-400 mt-0.5">마케팅부서 · 최민지</p>
              </div>
              <span className="text-xs text-stone-400 flex-shrink-0 pt-0.5">2시간 전</span>
            </div>
            <div className="flex gap-3 py-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-800">이번 달 예산 <span className="font-semibold text-amber-700">60% 도달</span></p>
                <p className="text-xs text-stone-400 mt-0.5">예산 $20 중 $12.40 사용</p>
              </div>
              <span className="text-xs text-stone-400 flex-shrink-0 pt-0.5">어제</span>
            </div>
            <div className="flex gap-3 py-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <KeyRound className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-800">신규 크리덴셜 <span className="font-semibold">'OpenAI'</span> 등록</p>
                <p className="text-xs text-stone-400 mt-0.5">등록자: 김대표</p>
              </div>
              <span className="text-xs text-stone-400 flex-shrink-0 pt-0.5">어제</span>
            </div>
            <div className="flex gap-3 py-3">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Building2 className="w-4 h-4 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-800">부서 <span className="font-semibold">'연구개발부서'</span> 생성됨</p>
                <p className="text-xs text-stone-400 mt-0.5">생성자: 관리자</p>
              </div>
              <span className="text-xs text-stone-400 flex-shrink-0 pt-0.5">3일 전</span>
            </div>
          </div>
        </div>
      </div>

      {/* 우측 1열: 시스템 상태 + 빠른 작업 + 이번 달 요약 */}
      {/* API: GET /api/admin/monitoring/health */}
      <div className="col-span-1 space-y-5">

        {/* 시스템 상태 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-stone-900">시스템 상태</h2>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>정상 운영
            </span>
          </div>
          <div className="space-y-0">
            <div className="flex items-center justify-between py-2.5 border-b border-stone-50">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-stone-400" />
                <span className="text-sm text-stone-700">DB 연결</span>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> 정상
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-stone-50">
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-stone-400" />
                <span className="text-sm text-stone-700">API 서버</span>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> 정상
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-stone-50">
              <div className="flex items-center gap-2.5">
                <Wifi className="w-4 h-4 text-stone-400" />
                <span className="text-sm text-stone-700">WebSocket</span>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> 정상
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-stone-50">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-stone-400" />
                <span className="text-sm text-stone-700">배치 처리</span>
              </div>
              <div className="text-right">
                <p className="flex items-center gap-1 text-xs font-semibold text-emerald-600 justify-end">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 정상
                </p>
                <p className="text-[10px] text-stone-400">45건 대기</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-stone-400" />
                <span className="text-sm text-stone-700">KIS API</span>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> 정상
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100">
            <p className="text-[10px] text-stone-400 text-center">마지막 점검 2026-03-10 14:55:32</p>
          </div>
        </div>

        {/* 빠른 작업 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <h2 className="font-bold text-stone-900 mb-3">빠른 작업</h2>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg text-sm font-medium transition-colors text-left">
              <Bot className="w-4 h-4" />에이전트 생성
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-lg text-sm font-medium transition-colors text-left">
              <Building2 className="w-4 h-4" />부서 생성
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-lg text-sm font-medium transition-colors text-left">
              <UserPlus className="w-4 h-4" />직원 초대
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-lg text-sm font-medium transition-colors text-left">
              <KeyRound className="w-4 h-4" />크리덴셜 등록
            </button>
          </div>
        </div>

        {/* 이번 달 요약 */}
        <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-xl p-5 text-white shadow-sm">
          <h2 className="font-bold mb-4" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>이번 달 요약</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-violet-200 text-sm">신규 에이전트</span>
              <span className="font-bold text-sm">+3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-violet-200 text-sm">완료 작업</span>
              <span className="font-bold text-sm">1,247건</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-violet-200 text-sm">CLI 호출</span>
              <span className="font-bold text-sm">1,120회</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-violet-200 text-sm">평균 성공률</span>
              <span className="font-bold text-sm">96.4%</span>
            </div>
            <div className="pt-2 mt-1 border-t border-violet-500">
              <div className="flex justify-between items-center">
                <span className="text-violet-200 text-sm">남은 예산</span>
                <span className="font-bold text-sm">$7.60</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </main>
    </>
  );
}

export default AdminDashboard;
