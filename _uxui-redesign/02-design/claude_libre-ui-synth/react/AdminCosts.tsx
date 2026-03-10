"use client";
import React from "react";
import { Activity, Bell, Bot, Briefcase, Building2, CircleDollarSign, Database, Download, FileBarChart, GitBranch, Key, LayoutDashboard, Plug, Settings, Shield, Store, TrendingDown, UserCheck, UserPlus, Users, Workflow } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
`;

function AdminCosts() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar */}
  <aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-10">
    <div className="px-5 py-4 border-b border-stone-100">
      <div className="flex items-center gap-2 mb-1">
        <span className="bg-violet-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest">ADMIN</span>
      </div>
      <span className="text-lg font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
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
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm bg-violet-50 text-violet-700 font-medium"><CircleDollarSign className="w-4 h-4" /> 비용 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Activity className="w-4 h-4" /> 모니터링</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Workflow className="w-4 h-4" /> 워크플로우</a>
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
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-stone-900">비용 관리</h1>
        <p className="text-sm text-stone-500 mt-0.5">CLI 토큰 사용량 및 비용 분석 — 2026년 3월</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-50">
          <Download className="w-4 h-4" /> 내보내기
        </button>
        <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-1 rounded">GET /api/admin/costs/summary</span>
      </div>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">이번 달 총 비용</p>
        <p className="text-2xl font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>$12.40</p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
            <TrendingDown className="w-3 h-3" /> -8.2%
          </span>
          <span className="text-xs text-stone-400">전월 대비</span>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">예산 사용률</p>
        <p className="text-2xl font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>62%</p>
        <div className="mt-2">
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full" style={{width: "62%"}}></div>
          </div>
          <p className="text-xs text-stone-400 mt-1">$12.40 / $20.00</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">예상 월말 비용</p>
        <p className="text-2xl font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>$20.10</p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-xs font-medium text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">예산 초과 위험</span>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">전월 총 비용</p>
        <p className="text-2xl font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>$13.51</p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-xs text-stone-400">2026년 2월 확정</span>
        </div>
      </div>
    </div>

    {/* Tabs + Table */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm mb-6">
      <div className="border-b border-stone-100 px-5">
        <div className="flex gap-1">
          <button onClick="switchTab(0)" id="tab-0" className="tab-btn px-4 py-3 text-sm font-medium border-b-2 border-violet-600 text-violet-700">에이전트별</button>
          <button onClick="switchTab(1)" id="tab-1" className="tab-btn px-4 py-3 text-sm font-medium border-b-2 border-transparent text-stone-500 hover:text-stone-700">모델별</button>
          <button onClick="switchTab(2)" id="tab-2" className="tab-btn px-4 py-3 text-sm font-medium border-b-2 border-transparent text-stone-500 hover:text-stone-700">부서별</button>
          <button onClick="switchTab(3)" id="tab-3" className="tab-btn px-4 py-3 text-sm font-medium border-b-2 border-transparent text-stone-500 hover:text-stone-700">일별 추이</button>
        </div>
      </div>

      {/* Tab 0: 에이전트별 */}
      <div id="panel-0" className="panel">
        <div className="px-5 py-3 flex items-center justify-between">
          <span className="text-xs text-stone-500">총 12개 에이전트 <span className="font-mono text-stone-400">GET /api/admin/costs/by-agent</span></span>
          <input type="text" placeholder="에이전트 검색..." className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-48" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">에이전트</th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">호출 수</th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">입력 토큰</th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">출력 토큰</th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">비용</th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">비중</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold">최</div>
                  <div>
                    <p className="font-medium text-stone-800">최민지</p>
                    <p className="text-xs text-stone-400">SNS 마케터</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-right text-stone-700">284</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-stone-600">1.2M</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-stone-600">340K</td>
              <td className="px-4 py-3 text-sm text-right font-semibold text-stone-800">$3.20</td>
              <td className="px-4 py-3 text-sm text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{width: "25.8%"}}></div>
                  </div>
                  <span className="text-stone-500 w-10 text-right">25.8%</span>
                </div>
              </td>
            </tr>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">박</div>
                  <div>
                    <p className="font-medium text-stone-800">박준형</p>
                    <p className="text-xs text-stone-400">리서치 애널리스트</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-right text-stone-700">412</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-stone-600">2.1M</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-stone-600">580K</td>
              <td className="px-4 py-3 text-sm text-right font-semibold text-stone-800">$4.85</td>
              <td className="px-4 py-3 text-sm text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{width: "39.1%"}}></div>
                  </div>
                  <span className="text-stone-500 w-10 text-right">39.1%</span>
                </div>
              </td>
            </tr>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">이</div>
                  <div>
                    <p className="font-medium text-stone-800">이나경</p>
                    <p className="text-xs text-stone-400">법무 검토</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-right text-stone-700">98</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-stone-600">520K</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-stone-600">145K</td>
              <td className="px-4 py-3 text-sm text-right font-semibold text-stone-800">$2.10</td>
              <td className="px-4 py-3 text-sm text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{width: "16.9%"}}></div>
                  </div>
                  <span className="text-stone-500 w-10 text-right">16.9%</span>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-stone-50/50">
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold">김</div>
                  <div>
                    <p className="font-medium text-stone-800">김도현</p>
                    <p className="text-xs text-stone-400">재무 분석</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-right text-stone-700">156</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-stone-600">680K</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-stone-600">190K</td>
              <td className="px-4 py-3 text-sm text-right font-semibold text-stone-800">$2.25</td>
              <td className="px-4 py-3 text-sm text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{width: "18.1%"}}></div>
                  </div>
                  <span className="text-stone-500 w-10 text-right">18.1%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tab 1: 모델별 */}
      <div id="panel-1" className="panel hidden">
        <div className="px-5 py-3">
          <span className="text-xs text-stone-400 font-mono">GET /api/admin/costs/by-model</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">모델</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">제공사</th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">호출 수</th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">비용</th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">비중</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3 text-sm font-mono font-medium text-stone-800">claude-sonnet-4-6</td>
              <td className="px-4 py-3 text-sm"><span className="bg-violet-50 text-violet-700 rounded-full px-2.5 py-0.5 text-xs font-medium">Anthropic</span></td>
              <td className="px-4 py-3 text-sm text-right text-stone-700">680</td>
              <td className="px-4 py-3 text-sm text-right font-semibold text-stone-800">$8.90</td>
              <td className="px-4 py-3 text-sm text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 h-1.5 bg-stone-100 rounded-full"><div className="h-full bg-violet-500 rounded-full" style={{width: "71.8%"}}></div></div>
                  <span className="text-stone-500 w-10 text-right">71.8%</span>
                </div>
              </td>
            </tr>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3 text-sm font-mono font-medium text-stone-800">gpt-4o</td>
              <td className="px-4 py-3 text-sm"><span className="bg-green-50 text-green-700 rounded-full px-2.5 py-0.5 text-xs font-medium">OpenAI</span></td>
              <td className="px-4 py-3 text-sm text-right text-stone-700">215</td>
              <td className="px-4 py-3 text-sm text-right font-semibold text-stone-800">$2.80</td>
              <td className="px-4 py-3 text-sm text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 h-1.5 bg-stone-100 rounded-full"><div className="h-full bg-green-500 rounded-full" style={{width: "22.6%"}}></div></div>
                  <span className="text-stone-500 w-10 text-right">22.6%</span>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-stone-50/50">
              <td className="px-4 py-3 text-sm font-mono font-medium text-stone-800">gemini-2.0-flash</td>
              <td className="px-4 py-3 text-sm"><span className="bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-medium">Google</span></td>
              <td className="px-4 py-3 text-sm text-right text-stone-700">55</td>
              <td className="px-4 py-3 text-sm text-right font-semibold text-stone-800">$0.70</td>
              <td className="px-4 py-3 text-sm text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 h-1.5 bg-stone-100 rounded-full"><div className="h-full bg-blue-400 rounded-full" style={{width: "5.6%"}}></div></div>
                  <span className="text-stone-500 w-10 text-right">5.6%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tab 2: 부서별 */}
      <div id="panel-2" className="panel hidden">
        <div className="px-5 py-3">
          <span className="text-xs text-stone-400 font-mono">GET /api/admin/costs/by-dept</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">부서</th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">에이전트 수</th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">총 비용</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">비중</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3 text-sm font-medium text-stone-800">마케팅팀</td>
              <td className="px-4 py-3 text-sm text-right text-stone-600">4</td>
              <td className="px-4 py-3 text-sm text-right font-semibold text-stone-800">$5.20</td>
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{width: "41.9%"}}></div>
                  </div>
                  <span className="text-stone-500 text-xs w-10">41.9%</span>
                </div>
              </td>
            </tr>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3 text-sm font-medium text-stone-800">리서치팀</td>
              <td className="px-4 py-3 text-sm text-right text-stone-600">5</td>
              <td className="px-4 py-3 text-sm text-right font-semibold text-stone-800">$4.85</td>
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{width: "39.1%"}}></div>
                  </div>
                  <span className="text-stone-500 text-xs w-10">39.1%</span>
                </div>
              </td>
            </tr>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3 text-sm font-medium text-stone-800">법무팀</td>
              <td className="px-4 py-3 text-sm text-right text-stone-600">2</td>
              <td className="px-4 py-3 text-sm text-right font-semibold text-stone-800">$2.10</td>
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{width: "16.9%"}}></div>
                  </div>
                  <span className="text-stone-500 text-xs w-10">16.9%</span>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-stone-50/50">
              <td className="px-4 py-3 text-sm font-medium text-stone-800">재무팀</td>
              <td className="px-4 py-3 text-sm text-right text-stone-600">1</td>
              <td className="px-4 py-3 text-sm text-right font-semibold text-stone-800">$0.25</td>
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{width: "2%"}}></div>
                  </div>
                  <span className="text-stone-500 text-xs w-10">2.0%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tab 3: 일별 추이 */}
      <div id="panel-3" className="panel hidden px-5 py-5">
        <p className="text-sm font-semibold text-stone-700 mb-4">최근 7일 일별 비용 추이</p>
        <div className="flex items-end gap-3 h-40">
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-stone-500 font-mono">$1.20</span>
            <div className="w-full bg-violet-200 rounded-t" style={{height: "48%"}}></div>
            <span className="text-[10px] text-stone-400">3/4</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-stone-500 font-mono">$1.85</span>
            <div className="w-full bg-violet-300 rounded-t" style={{height: "74%"}}></div>
            <span className="text-[10px] text-stone-400">3/5</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-stone-500 font-mono">$1.40</span>
            <div className="w-full bg-violet-200 rounded-t" style={{height: "56%"}}></div>
            <span className="text-[10px] text-stone-400">3/6</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-stone-500 font-mono">$2.50</span>
            <div className="w-full bg-violet-500 rounded-t" style={{height: "100%"}}></div>
            <span className="text-[10px] text-stone-400">3/7</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-stone-500 font-mono">$1.10</span>
            <div className="w-full bg-violet-200 rounded-t" style={{height: "44%"}}></div>
            <span className="text-[10px] text-stone-400">3/8</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-stone-500 font-mono">$2.05</span>
            <div className="w-full bg-violet-400 rounded-t" style={{height: "82%"}}></div>
            <span className="text-[10px] text-stone-400">3/9</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-stone-500 font-mono">$2.30</span>
            <div className="w-full bg-violet-600 rounded-t" style={{height: "92%"}}></div>
            <span className="text-[10px] text-stone-400 font-semibold text-violet-700">오늘</span>
          </div>
        </div>
      </div>
    </div>

    {/* Budget Settings */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <h3 className="font-bold text-stone-900 mb-4 text-sm">예산 설정</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">월 예산 한도</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
            <input type="number" value="20.00" className="w-full rounded-lg border border-stone-200 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">경고 기준</label>
          <div className="relative">
            <input type="number" value="80" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">%</span>
          </div>
        </div>
        <div className="flex items-end">
          <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">저장</button>
        </div>
      </div>
    </div>
  </main>
    </>
  );
}

export default AdminCosts;
