"use client";
import React from "react";
import { Activity, Bell, Bot, Briefcase, Building2, Check, CheckCircle, CircleDollarSign, Clock, Database, FileBarChart, GitBranch, Globe, Info, Key, LayoutDashboard, Plug, Search, Settings, Shield, ShieldCheck, Store, UserCheck, UserCog, UserPlus, Users, Workflow, X } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
`;

function AdminUsers() {
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
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm bg-violet-50 text-violet-700 font-medium"><Users className="w-4 h-4" /> 사용자 관리</a>
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
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-xl font-bold text-stone-900">사용자 관리</h1>
        <p className="text-sm text-stone-500 mt-0.5">CORTHEX 관리자 콘솔 접근 계정 관리</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-1 rounded">GET /api/admin/users</span>
        <button className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">
          <UserPlus className="w-4 h-4" /> 관리자 초대
        </button>
      </div>
    </div>

    {/* Info Banner */}
    <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3.5 mb-5 flex items-start gap-3">
      <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-blue-900">CORTHEX 관리자 콘솔 접근 계정을 관리합니다.</p>
        <p className="text-xs text-blue-700 mt-0.5">일반 직원(에이전트와 함께 일하는 인간 팀원)은 '직원 관리' 메뉴에서 관리하세요. POST /api/admin/users/invite</p>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-4 gap-4 mb-5">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-violet-600" /></div>
        <div><p className="text-lg font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>1</p><p className="text-xs text-stone-500">Super Admin</p></div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><UserCog className="w-4 h-4 text-blue-600" /></div>
        <div><p className="text-lg font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>3</p><p className="text-xs text-stone-500">Company Admin</p></div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-emerald-600" /></div>
        <div><p className="text-lg font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>4</p><p className="text-xs text-stone-500">활성 계정</p></div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"><Clock className="w-4 h-4 text-amber-600" /></div>
        <div><p className="text-lg font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>0</p><p className="text-xs text-stone-500">초대 대기</p></div>
      </div>
    </div>

    {/* Search */}
    <div className="flex items-center gap-3 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input type="text" placeholder="이름 또는 이메일 검색..." className="w-full rounded-lg border border-stone-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
      </div>
      <select className="rounded-lg border border-stone-200 px-3 py-2 text-sm bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
        <option>전체 역할</option>
        <option>super_admin</option>
        <option>company_admin</option>
      </select>
    </div>

    {/* Users Table */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-5">
      <table className="w-full">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-100">
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">이름</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">이메일</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">역할</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">관리 회사</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">마지막 로그인</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">상태</th>
            <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">액션</th>
          </tr>
        </thead>
        <tbody>
          {/* Super Admin */}
          <tr className="border-b border-stone-100 hover:bg-stone-50/50">
            <td className="px-4 py-3.5 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-xs">SA</div>
                <div>
                  <p className="font-semibold text-stone-800">최고관리자</p>
                  <p className="text-[10px] text-stone-400">플랫폼 소유자</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3.5 text-sm text-stone-600">admin@corthex.io</td>
            <td className="px-4 py-3.5 text-sm">
              <span className="bg-violet-100 text-violet-800 rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono">super_admin</span>
            </td>
            <td className="px-4 py-3.5 text-sm text-stone-600">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-stone-400" /> 전체 (4개 회사)
              </span>
            </td>
            <td className="px-4 py-3.5 text-sm text-stone-600">오늘 09:15</td>
            <td className="px-4 py-3.5 text-sm">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 활성
              </span>
            </td>
            <td className="px-4 py-3.5 text-sm text-right">
              <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">편집</button>
            </td>
          </tr>

          {/* ACME Admin */}
          <tr className="border-b border-stone-100 hover:bg-stone-50/50">
            <td className="px-4 py-3.5 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">AC</div>
                <div>
                  <p className="font-semibold text-stone-800">ACME 관리자</p>
                  <p className="text-[10px] text-stone-400">ACME Corp 담당</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3.5 text-sm text-stone-600">corp_admin@acme.co.kr</td>
            <td className="px-4 py-3.5 text-sm">
              <span className="bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono">company_admin</span>
            </td>
            <td className="px-4 py-3.5 text-sm">
              <span className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-violet-100 flex items-center justify-center text-violet-700 text-[10px] font-bold">AC</div>
                ACME Corp
              </span>
            </td>
            <td className="px-4 py-3.5 text-sm text-stone-600">오늘 11:30</td>
            <td className="px-4 py-3.5 text-sm">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 활성
              </span>
            </td>
            <td className="px-4 py-3.5 text-sm text-right">
              <div className="flex items-center justify-end gap-1.5">
                <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">편집</button>
                <button className="bg-white border border-red-200 text-red-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-50">삭제</button>
              </div>
            </td>
          </tr>

          {/* Tech Admin */}
          <tr className="border-b border-stone-100 hover:bg-stone-50/50">
            <td className="px-4 py-3.5 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">TV</div>
                <div>
                  <p className="font-semibold text-stone-800">Tech 관리자</p>
                  <p className="text-[10px] text-stone-400">TechVentures 담당</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3.5 text-sm text-stone-600">admin@techventures.io</td>
            <td className="px-4 py-3.5 text-sm">
              <span className="bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono">company_admin</span>
            </td>
            <td className="px-4 py-3.5 text-sm">
              <span className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold">TV</div>
                TechVentures
              </span>
            </td>
            <td className="px-4 py-3.5 text-sm text-stone-600">어제</td>
            <td className="px-4 py-3.5 text-sm">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 활성
              </span>
            </td>
            <td className="px-4 py-3.5 text-sm text-right">
              <div className="flex items-center justify-end gap-1.5">
                <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">편집</button>
                <button className="bg-white border border-red-200 text-red-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-50">삭제</button>
              </div>
            </td>
          </tr>

          {/* Legal Admin */}
          <tr className="hover:bg-stone-50/50">
            <td className="px-4 py-3.5 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">LP</div>
                <div>
                  <p className="font-semibold text-stone-800">Legal 관리자</p>
                  <p className="text-[10px] text-stone-400">LegalPlus 담당</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3.5 text-sm text-stone-600">admin@legalplus.kr</td>
            <td className="px-4 py-3.5 text-sm">
              <span className="bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono">company_admin</span>
            </td>
            <td className="px-4 py-3.5 text-sm">
              <span className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-bold">LP</div>
                LegalPlus
              </span>
            </td>
            <td className="px-4 py-3.5 text-sm text-stone-600">3일 전</td>
            <td className="px-4 py-3.5 text-sm">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 활성
              </span>
            </td>
            <td className="px-4 py-3.5 text-sm text-right">
              <div className="flex items-center justify-end gap-1.5">
                <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">편집</button>
                <button className="bg-white border border-red-200 text-red-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-50">삭제</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* Role Description Cards */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <span className="text-xs font-bold font-mono text-violet-700 bg-violet-50 px-2 py-0.5 rounded">super_admin</span>
          </div>
        </div>
        <p className="text-sm font-semibold text-stone-800 mb-1">슈퍼 관리자</p>
        <p className="text-xs text-stone-500 leading-relaxed">모든 회사 데이터에 접근 가능합니다. 회사 생성/삭제, 플랜 변경, 시스템 전역 설정 변경 권한을 갖습니다. 1명만 존재합니다.</p>
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-stone-600"><Check className="w-3 h-3 text-violet-500" /> 모든 회사 관리</div>
          <div className="flex items-center gap-1.5 text-xs text-stone-600"><Check className="w-3 h-3 text-violet-500" /> 시스템 전역 설정 변경</div>
          <div className="flex items-center gap-1.5 text-xs text-stone-600"><Check className="w-3 h-3 text-violet-500" /> 플랜 및 결제 관리</div>
          <div className="flex items-center gap-1.5 text-xs text-stone-600"><Check className="w-3 h-3 text-violet-500" /> 관리자 계정 생성/삭제</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <UserCog className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <span className="text-xs font-bold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">company_admin</span>
          </div>
        </div>
        <p className="text-sm font-semibold text-stone-800 mb-1">회사 관리자</p>
        <p className="text-xs text-stone-500 leading-relaxed">담당 회사 데이터만 접근 가능합니다. 해당 회사의 에이전트, 부서, 직원, 크리덴셜을 자유롭게 생성/편집/삭제할 수 있습니다.</p>
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-stone-600"><Check className="w-3 h-3 text-blue-500" /> 담당 회사만 관리</div>
          <div className="flex items-center gap-1.5 text-xs text-stone-600"><Check className="w-3 h-3 text-blue-500" /> 에이전트/부서/직원 CRUD</div>
          <div className="flex items-center gap-1.5 text-xs text-stone-600"><Check className="w-3 h-3 text-blue-500" /> 크리덴셜 등록/관리</div>
          <div className="flex items-center gap-1.5 text-xs text-stone-600"><X className="w-3 h-3 text-stone-300" /> 타 회사 데이터 접근 불가</div>
        </div>
      </div>
    </div>
  </main>
    </>
  );
}

export default AdminUsers;
