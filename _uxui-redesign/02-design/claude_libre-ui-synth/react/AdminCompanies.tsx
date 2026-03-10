"use client";
import React from "react";
import { Activity, Bell, Bot, Briefcase, Building2, CircleDollarSign, Database, FileBarChart, GitBranch, Key, LayoutDashboard, Plug, Plus, Search, Settings, Shield, ShieldAlert, Store, UserCheck, UserPlus, Users, Workflow } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
`;

function AdminCompanies() {
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
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm bg-violet-50 text-violet-700 font-medium"><Building2 className="w-4 h-4" /> 회사 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Users className="w-4 h-4" /> 사용자 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><GitBranch className="w-4 h-4" /> 부서 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Bot className="w-4 h-4" /> 에이전트 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><UserCheck className="w-4 h-4" /> 직원 관리</a>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 py-1.5 mt-2">운영</p>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><CircleDollarSign className="w-4 h-4" /> 비용 관리</a>
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
    <div className="flex items-center justify-between mb-5">
      <div>
        <h1 className="text-xl font-bold text-stone-900">회사 관리</h1>
        <p className="text-sm text-stone-500 mt-0.5">멀티테넌트 조직 관리 — Super Admin 전용</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-1 rounded">GET /api/admin/companies</span>
        <button className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">
          <Plus className="w-4 h-4" /> 새 회사 추가
        </button>
      </div>
    </div>

    {/* Super Admin Banner */}
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-5 flex items-start gap-3">
      <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-amber-800">Super Admin 전용 기능입니다.</p>
        <p className="text-xs text-amber-700 mt-0.5">각 회사는 독립된 데이터 공간을 가집니다. 회사 데이터는 다른 회사 관리자에게 공개되지 않습니다. POST /api/admin/companies (super_admin only)</p>
      </div>
    </div>

    {/* Summary Stats */}
    <div className="grid grid-cols-4 gap-4 mb-5">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>4</p>
          <p className="text-xs text-stone-500">총 회사</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
          <Bot className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>48</p>
          <p className="text-xs text-stone-500">총 에이전트</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
          <Users className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>11</p>
          <p className="text-xs text-stone-500">총 직원</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
          <CircleDollarSign className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>$22.40</p>
          <p className="text-xs text-stone-500">이번 달 합계</p>
        </div>
      </div>
    </div>

    {/* Search + Filter */}
    <div className="flex items-center gap-3 mb-4">
      <div className="relative flex-1 max-w-xs">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input type="text" placeholder="회사명 또는 슬러그 검색..." className="w-full rounded-lg border border-stone-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
      </div>
      <select className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-stone-700">
        <option>전체 플랜</option>
        <option>Starter</option>
        <option>Pro</option>
        <option>Enterprise</option>
      </select>
      <select className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-stone-700">
        <option>전체 상태</option>
        <option>활성</option>
        <option>체험중</option>
        <option>정지</option>
      </select>
    </div>

    {/* Companies Table */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-100">
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">회사명</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">슬러그</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">플랜</th>
            <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">에이전트</th>
            <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">직원</th>
            <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">이번달 비용</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">가입일</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">상태</th>
            <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">액션</th>
          </tr>
        </thead>
        <tbody>
          {/* ACME Corp */}
          <tr className="border-b border-stone-100 hover:bg-stone-50/50">
            <td className="px-4 py-3.5 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs">AC</div>
                <span className="font-semibold text-stone-800">ACME Corp</span>
              </div>
            </td>
            <td className="px-4 py-3.5 text-sm"><code className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded text-xs">acme</code></td>
            <td className="px-4 py-3.5 text-sm"><span className="bg-violet-50 text-violet-700 rounded-full px-2.5 py-0.5 text-xs font-medium">Pro</span></td>
            <td className="px-4 py-3.5 text-sm text-right text-stone-700 font-medium">24</td>
            <td className="px-4 py-3.5 text-sm text-right text-stone-700">5</td>
            <td className="px-4 py-3.5 text-sm text-right font-semibold text-stone-800">$12.40</td>
            <td className="px-4 py-3.5 text-sm text-stone-500">2025-01-15</td>
            <td className="px-4 py-3.5 text-sm">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 활성
              </span>
            </td>
            <td className="px-4 py-3.5 text-sm text-right">
              <div className="flex items-center justify-end gap-1.5">
                <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">관리</button>
                <button className="bg-white border border-red-200 text-red-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-50">정지</button>
              </div>
            </td>
          </tr>
          {/* TechVentures */}
          <tr className="border-b border-stone-100 hover:bg-stone-50/50">
            <td className="px-4 py-3.5 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">TV</div>
                <span className="font-semibold text-stone-800">TechVentures</span>
              </div>
            </td>
            <td className="px-4 py-3.5 text-sm"><code className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded text-xs">tech</code></td>
            <td className="px-4 py-3.5 text-sm"><span className="bg-stone-100 text-stone-600 rounded-full px-2.5 py-0.5 text-xs font-medium">Starter</span></td>
            <td className="px-4 py-3.5 text-sm text-right text-stone-700 font-medium">8</td>
            <td className="px-4 py-3.5 text-sm text-right text-stone-700">2</td>
            <td className="px-4 py-3.5 text-sm text-right font-semibold text-stone-800">$3.20</td>
            <td className="px-4 py-3.5 text-sm text-stone-500">2025-02-01</td>
            <td className="px-4 py-3.5 text-sm">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 활성
              </span>
            </td>
            <td className="px-4 py-3.5 text-sm text-right">
              <div className="flex items-center justify-end gap-1.5">
                <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">관리</button>
                <button className="bg-white border border-red-200 text-red-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-50">정지</button>
              </div>
            </td>
          </tr>
          {/* LegalPlus */}
          <tr className="border-b border-stone-100 hover:bg-stone-50/50">
            <td className="px-4 py-3.5 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">LP</div>
                <span className="font-semibold text-stone-800">LegalPlus</span>
              </div>
            </td>
            <td className="px-4 py-3.5 text-sm"><code className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded text-xs">legal</code></td>
            <td className="px-4 py-3.5 text-sm"><span className="bg-violet-50 text-violet-700 rounded-full px-2.5 py-0.5 text-xs font-medium">Pro</span></td>
            <td className="px-4 py-3.5 text-sm text-right text-stone-700 font-medium">12</td>
            <td className="px-4 py-3.5 text-sm text-right text-stone-700">3</td>
            <td className="px-4 py-3.5 text-sm text-right font-semibold text-stone-800">$5.60</td>
            <td className="px-4 py-3.5 text-sm text-stone-500">2025-02-15</td>
            <td className="px-4 py-3.5 text-sm">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 활성
              </span>
            </td>
            <td className="px-4 py-3.5 text-sm text-right">
              <div className="flex items-center justify-end gap-1.5">
                <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">관리</button>
                <button className="bg-white border border-red-200 text-red-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-50">정지</button>
              </div>
            </td>
          </tr>
          {/* StartupXYZ */}
          <tr className="hover:bg-stone-50/50">
            <td className="px-4 py-3.5 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">SX</div>
                <span className="font-semibold text-stone-800">StartupXYZ</span>
              </div>
            </td>
            <td className="px-4 py-3.5 text-sm"><code className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded text-xs">startup</code></td>
            <td className="px-4 py-3.5 text-sm"><span className="bg-stone-100 text-stone-600 rounded-full px-2.5 py-0.5 text-xs font-medium">Starter</span></td>
            <td className="px-4 py-3.5 text-sm text-right text-stone-700 font-medium">4</td>
            <td className="px-4 py-3.5 text-sm text-right text-stone-700">1</td>
            <td className="px-4 py-3.5 text-sm text-right font-semibold text-stone-800">$1.20</td>
            <td className="px-4 py-3.5 text-sm text-stone-500">2025-03-01</td>
            <td className="px-4 py-3.5 text-sm">
              <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> 체험중
              </span>
            </td>
            <td className="px-4 py-3.5 text-sm text-right">
              <div className="flex items-center justify-end gap-1.5">
                <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">관리</button>
                <button className="bg-white border border-red-200 text-red-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-50">정지</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      {/* Table footer */}
      <div className="px-5 py-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
        <span className="text-xs text-stone-500">총 4개 회사</span>
        <div className="flex items-center gap-1">
          <button className="px-2.5 py-1 text-xs text-stone-500 border border-stone-200 rounded hover:bg-white">이전</button>
          <button className="px-2.5 py-1 text-xs bg-violet-600 text-white rounded">1</button>
          <button className="px-2.5 py-1 text-xs text-stone-500 border border-stone-200 rounded hover:bg-white">다음</button>
        </div>
      </div>
    </div>

    {/* Plan Info */}
    <div className="grid grid-cols-2 gap-4 mt-5">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <h3 className="font-bold text-stone-900 text-sm mb-3">플랜 비교</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <span className="text-sm font-medium text-stone-700">Starter</span>
            <div className="flex items-center gap-4 text-xs text-stone-500">
              <span>최대 10 에이전트</span>
              <span>5 직원</span>
              <span>$10/월</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <span className="text-sm font-medium text-violet-700">Pro</span>
            <div className="flex items-center gap-4 text-xs text-stone-500">
              <span>최대 50 에이전트</span>
              <span>무제한 직원</span>
              <span>$49/월</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-stone-700">Enterprise</span>
            <div className="flex items-center gap-4 text-xs text-stone-500">
              <span>무제한 에이전트</span>
              <span>SSO 지원</span>
              <span>별도 협의</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <h3 className="font-bold text-stone-900 text-sm mb-3">이번 달 플랜별 수익</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500 w-16">Starter</span>
            <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-stone-400 rounded-full" style={{width: "20%"}}></div>
            </div>
            <span className="text-xs font-semibold text-stone-700">$20</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500 w-16">Pro</span>
            <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full" style={{width: "80%"}}></div>
            </div>
            <span className="text-xs font-semibold text-stone-700">$98</span>
          </div>
        </div>
      </div>
    </div>
  </main>
    </>
  );
}

export default AdminCompanies;
