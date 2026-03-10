"use client";
import React from "react";
import { Activity, BarChart2, Bell, Bot, Building2, Copy, CreditCard, Crown, Database, FileText, GitBranch, Key, LayoutDashboard, Megaphone, Package, PenLine, Pencil, Plug, Plus, Scale, Search, Settings, ShieldCheck, Store, TrendingUp, TriangleAlert, User, UserCheck, Users } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; } h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; } code,pre { font-family: 'JetBrains Mono', monospace; }`;

function AdminReportLines() {
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
    <a href="#" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-violet-50 text-violet-700 font-medium text-sm"><GitBranch className="w-4 h-4" />보고 라인</a>
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
  {/* API 주석: GET /api/admin/agents (reportTo 필드), PUT /api/admin/agents/{id} */}

  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-xl font-bold text-stone-900">보고 라인 설정</h1>
      <p className="text-sm text-stone-500 mt-0.5">에이전트 간 지휘 체계와 자동 위임 규칙을 정의하세요</p>
    </div>
    <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors">
      <Plus className="w-4 h-4" />
      보고 라인 추가
    </button>
  </div>

  {/* Info Banner */}
  <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 mb-7 flex items-start gap-3">
    <TriangleAlert className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
    <p className="text-sm text-amber-700">에이전트 간 보고/위임 관계를 설정합니다. 비서실장은 항상 최상위 보고 대상입니다.</p>
  </div>

  <div className="grid grid-cols-5 gap-6">
    {/* Tree View (left 2/5) */}
    <div className="col-span-2">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-stone-900">조직 트리</h2>
          <span className="text-[10px] text-stone-400 bg-stone-50 rounded-full px-2 py-0.5 font-medium border border-stone-100">라이브 뷰</span>
        </div>

        <div className="space-y-1 text-sm">
          {/* CEO */}
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-stone-100 border border-stone-200">
            <div className="w-7 h-7 rounded-full bg-stone-700 flex items-center justify-center shrink-0">
              <Crown className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="font-bold text-stone-900 text-xs">CEO</span>
              <span className="text-stone-500 text-xs ml-1.5">김대표</span>
            </div>
            <span className="ml-auto text-[10px] text-stone-400 font-medium">인간</span>
          </div>

          {/* Secretary - Level 1 */}
          <div className="ml-4 flex items-start">
            <div className="flex flex-col items-center mr-1.5 mt-1">
              <div className="w-px h-4 bg-stone-200"></div>
              <div className="w-3 h-px bg-stone-200"></div>
            </div>
            <div className="flex-1 py-2 px-3 rounded-lg bg-violet-50 border border-violet-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-violet-800 text-xs">이나경</span>
                  <span className="text-violet-500 text-xs ml-1">비서실장</span>
                </div>
                <span className="ml-auto text-[10px] bg-violet-100 text-violet-600 rounded-full px-2 py-0.5 font-medium">자동 라우팅</span>
              </div>
            </div>
          </div>

          {/* Marketing Manager - Level 2 */}
          <div className="ml-8 flex items-start">
            <div className="flex flex-col items-center mr-1.5 mt-1">
              <div className="w-px h-4 bg-stone-200"></div>
              <div className="w-3 h-px bg-stone-200"></div>
            </div>
            <div className="flex-1 py-1.5 px-3 rounded-lg hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                  <Megaphone className="w-2.5 h-2.5 text-pink-600" />
                </div>
                <span className="font-medium text-stone-800 text-xs">박준형</span>
                <span className="text-stone-400 text-xs">마케팅팀장</span>
                <span className="ml-auto text-[10px] text-stone-400">← 마케팅</span>
              </div>
            </div>
          </div>

          {/* Copywriter - Level 3 */}
          <div className="ml-12 flex items-start">
            <div className="flex flex-col items-center mr-1.5 mt-1">
              <div className="w-px h-4 bg-stone-150"></div>
              <div className="w-3 h-px bg-stone-150"></div>
            </div>
            <div className="flex-1 py-1 px-3 rounded-lg hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                  <PenLine className="w-2 h-2 text-stone-500" />
                </div>
                <span className="text-stone-600 text-xs">최민지</span>
                <span className="text-stone-400 text-xs">카피라이터</span>
              </div>
            </div>
          </div>

          {/* Investment Manager - Level 2 */}
          <div className="ml-8 flex items-start mt-0.5">
            <div className="flex flex-col items-center mr-1.5 mt-1">
              <div className="w-px h-4 bg-stone-200"></div>
              <div className="w-3 h-px bg-stone-200"></div>
            </div>
            <div className="flex-1 py-1.5 px-3 rounded-lg hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-2.5 h-2.5 text-green-600" />
                </div>
                <span className="font-medium text-stone-800 text-xs">김재원</span>
                <span className="text-stone-400 text-xs">투자분석팀장</span>
                <span className="ml-auto text-[10px] text-stone-400">← 투자</span>
              </div>
            </div>
          </div>

          {/* Data Analyst - Level 3 */}
          <div className="ml-12 flex items-start">
            <div className="flex flex-col items-center mr-1.5 mt-1">
              <div className="w-px h-4 bg-stone-150"></div>
              <div className="w-3 h-px bg-stone-150"></div>
            </div>
            <div className="flex-1 py-1 px-3 rounded-lg hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                  <BarChart2 className="w-2 h-2 text-stone-500" />
                </div>
                <span className="text-stone-600 text-xs">정도현</span>
                <span className="text-stone-400 text-xs">데이터분석가</span>
              </div>
            </div>
          </div>

          {/* Legal Manager - Level 2 */}
          <div className="ml-8 flex items-start mt-0.5">
            <div className="flex flex-col items-center mr-1.5 mt-1">
              <div className="w-px h-4 bg-stone-200"></div>
              <div className="w-3 h-px bg-stone-200"></div>
            </div>
            <div className="flex-1 py-1.5 px-3 rounded-lg hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                  <Scale className="w-2.5 h-2.5 text-yellow-600" />
                </div>
                <span className="font-medium text-stone-800 text-xs">이소연</span>
                <span className="text-stone-400 text-xs">법무팀장</span>
                <span className="ml-auto text-[10px] text-stone-400">← 법무</span>
              </div>
            </div>
          </div>

          {/* Unassigned */}
          <div className="ml-8 flex items-start mt-0.5">
            <div className="flex flex-col items-center mr-1.5 mt-1">
              <div className="w-px h-4 bg-stone-100"></div>
              <div className="w-3 h-px bg-stone-100"></div>
            </div>
            <div className="flex-1 py-1.5 px-3 rounded-lg border border-dashed border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-stone-50 border border-dashed border-stone-200 flex items-center justify-center shrink-0">
                  <Plus className="w-2 h-2 text-stone-300" />
                </div>
                <span className="text-stone-400 text-xs italic">미배속 에이전트들</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Table (right 3/5) */}
    <div className="col-span-3 space-y-4">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900">보고 라인 상세</h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="에이전트 검색..." className="rounded-lg border border-stone-200 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-44" />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-stone-50">
              <th className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3 text-left">에이전트</th>
              <th className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3 text-left">상급자</th>
              <th className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3 text-left">위임 트리거 키워드</th>
              <th className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3 text-left">액션</th>
            </tr>
          </thead>
          <tbody>
            {/* Row 1: 박준형 */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                    <Megaphone className="w-3.5 h-3.5 text-pink-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-stone-900">박준형</div>
                    <div className="text-xs text-stone-400">마케팅팀장</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center">
                    <Bot className="w-2.5 h-2.5 text-violet-600" />
                  </div>
                  <span className="text-sm text-stone-700 font-medium">이나경</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  <span className="bg-pink-50 text-pink-600 rounded-full px-2 py-0.5 text-[10px] font-medium">마케팅</span>
                  <span className="bg-pink-50 text-pink-600 rounded-full px-2 py-0.5 text-[10px] font-medium">SNS</span>
                  <span className="bg-pink-50 text-pink-600 rounded-full px-2 py-0.5 text-[10px] font-medium">콘텐츠</span>
                  <span className="bg-pink-50 text-pink-600 rounded-full px-2 py-0.5 text-[10px] font-medium">광고</span>
                  <span className="bg-pink-50 text-pink-600 rounded-full px-2 py-0.5 text-[10px] font-medium">브랜드</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <button className="flex items-center gap-1 text-xs text-stone-500 hover:text-violet-600 font-medium transition-colors">
                  <Pencil className="w-3 h-3" />편집
                </button>
              </td>
            </tr>

            {/* Row 2: 최민지 */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                    <PenLine className="w-3.5 h-3.5 text-stone-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-stone-900">최민지</div>
                    <div className="text-xs text-stone-400">카피라이터</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center">
                    <Megaphone className="w-2.5 h-2.5 text-pink-600" />
                  </div>
                  <span className="text-sm text-stone-700 font-medium">박준형</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  <span className="bg-stone-100 text-stone-600 rounded-full px-2 py-0.5 text-[10px] font-medium">카피</span>
                  <span className="bg-stone-100 text-stone-600 rounded-full px-2 py-0.5 text-[10px] font-medium">글쓰기</span>
                  <span className="bg-stone-100 text-stone-600 rounded-full px-2 py-0.5 text-[10px] font-medium">문구</span>
                  <span className="bg-stone-100 text-stone-600 rounded-full px-2 py-0.5 text-[10px] font-medium">제목</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <button className="flex items-center gap-1 text-xs text-stone-500 hover:text-violet-600 font-medium transition-colors">
                  <Pencil className="w-3 h-3" />편집
                </button>
              </td>
            </tr>

            {/* Row 3: 김재원 */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-stone-900">김재원</div>
                    <div className="text-xs text-stone-400">투자분석팀장</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center">
                    <Bot className="w-2.5 h-2.5 text-violet-600" />
                  </div>
                  <span className="text-sm text-stone-700 font-medium">이나경</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  <span className="bg-green-50 text-green-700 rounded-full px-2 py-0.5 text-[10px] font-medium">투자</span>
                  <span className="bg-green-50 text-green-700 rounded-full px-2 py-0.5 text-[10px] font-medium">주식</span>
                  <span className="bg-green-50 text-green-700 rounded-full px-2 py-0.5 text-[10px] font-medium">포트폴리오</span>
                  <span className="bg-green-50 text-green-700 rounded-full px-2 py-0.5 text-[10px] font-medium">매매</span>
                  <span className="bg-green-50 text-green-700 rounded-full px-2 py-0.5 text-[10px] font-medium">분석</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <button className="flex items-center gap-1 text-xs text-stone-500 hover:text-violet-600 font-medium transition-colors">
                  <Pencil className="w-3 h-3" />편집
                </button>
              </td>
            </tr>

            {/* Row 4: 정도현 */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-stone-900">정도현</div>
                    <div className="text-xs text-stone-400">데이터분석가</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <span className="text-sm text-stone-700 font-medium">김재원</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  <span className="bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-[10px] font-medium">데이터</span>
                  <span className="bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-[10px] font-medium">통계</span>
                  <span className="bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-[10px] font-medium">수치</span>
                  <span className="bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-[10px] font-medium">차트</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <button className="flex items-center gap-1 text-xs text-stone-500 hover:text-violet-600 font-medium transition-colors">
                  <Pencil className="w-3 h-3" />편집
                </button>
              </td>
            </tr>

            {/* Row 5: 이소연 */}
            <tr className="hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                    <Scale className="w-3.5 h-3.5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-stone-900">이소연</div>
                    <div className="text-xs text-stone-400">법무팀장</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center">
                    <Bot className="w-2.5 h-2.5 text-violet-600" />
                  </div>
                  <span className="text-sm text-stone-700 font-medium">이나경</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  <span className="bg-yellow-50 text-yellow-700 rounded-full px-2 py-0.5 text-[10px] font-medium">법무</span>
                  <span className="bg-yellow-50 text-yellow-700 rounded-full px-2 py-0.5 text-[10px] font-medium">계약</span>
                  <span className="bg-yellow-50 text-yellow-700 rounded-full px-2 py-0.5 text-[10px] font-medium">법률</span>
                  <span className="bg-yellow-50 text-yellow-700 rounded-full px-2 py-0.5 text-[10px] font-medium">규정</span>
                  <span className="bg-yellow-50 text-yellow-700 rounded-full px-2 py-0.5 text-[10px] font-medium">컴플라이언스</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <button className="flex items-center gap-1 text-xs text-stone-500 hover:text-violet-600 font-medium transition-colors">
                  <Pencil className="w-3 h-3" />편집
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-5 py-3">
        <div className="flex items-center gap-6 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-violet-200 border border-violet-400"></div>
            <span>비서실장 (자동 라우팅 허브)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-stone-200"></div>
            <span>팀장급 에이전트</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-stone-100 border border-dashed border-stone-300"></div>
            <span>워커급 에이전트</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
    </>
  );
}

export default AdminReportLines;
