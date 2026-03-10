"use client";
import React from "react";
import { Activity, Bot, Briefcase, Building2, CheckCircle2, Clock, Code2, DollarSign, GitBranch, GitFork, Info, KeyRound, LayoutDashboard, LayoutTemplate, Mail, Network, Rocket, Search, Send, Settings, ShoppingBag, Sparkles, Store, UserCog, UserPlus, Users, Wrench, XCircle } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 50; display: flex; align-items: center; justify-content: center; }
`;

function AdminEmployees() {
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
        <a href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><LayoutDashboard className="w-4 h-4 flex-shrink-0" /> 대시보드</a>
        <a href="/admin/agents" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><Bot className="w-4 h-4 flex-shrink-0" /> 에이전트 관리</a>
        <a href="/admin/departments" className="flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors text-sm"><Building2 className="w-4 h-4 flex-shrink-0" /> 부서 관리</a>
        <a href="/admin/employees" className="flex items-center gap-3 px-3 py-2 bg-violet-50 text-violet-700 font-medium rounded-lg text-sm"><Users className="w-4 h-4 flex-shrink-0" /> 직원 관리</a>
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
  {/* API: GET /api/admin/employees | POST /api/admin/employees/invite | PATCH /api/admin/employees/{id} */}
  <main className="ml-64 flex-1 p-8">

    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">직원 관리</h1>
        <p className="text-sm text-stone-500 mt-0.5">Human 직원 5명 · ACME Corp</p>
      </div>
      <button onClick="document.getElementById('inviteSection').scrollIntoView({behavior:'smooth'})" className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150">
        <UserPlus className="w-4 h-4" />직원 초대
      </button>
    </div>

    {/* 안내 배너 */}
    <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3.5 mb-6">
      <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-blue-800">
        <span className="font-semibold">Human 직원</span>은 워크스페이스 앱에 접속하여 AI 에이전트에게 업무를 위임할 수 있습니다.
        역할에 따라 접근 가능한 부서와 에이전트가 제한됩니다.
      </p>
    </div>

    {/* 직원 테이블 */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <h2 className="font-bold text-stone-900">직원 목록</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="이름 또는 이메일 검색..." className="rounded-lg border border-stone-200 pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-52" />
          </div>
          <select className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-stone-50">
            <option>상태: 전체</option>
            <option>활성</option>
            <option>비활성</option>
          </select>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-100">
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">이름</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">이메일</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">역할</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">부서 접근</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">마지막 접속</th>
            <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">이번달 명령</th>
            <th className="text-center text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">상태</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">액션</th>
          </tr>
        </thead>
        <tbody>

          {/* 김대표 (CEO) */}
          <tr className="border-b border-stone-100 hover:bg-stone-50/50">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">김</div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">김대표</p>
                  <p className="text-xs text-stone-400">최고 경영자</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <code className="text-xs text-stone-600">kim@acme.co.kr</code>
            </td>
            <td className="px-4 py-3">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-violet-100 text-violet-700">CEO</span>
            </td>
            <td className="px-4 py-3">
              <span className="text-xs text-stone-600 bg-stone-100 rounded-full px-2.5 py-0.5 font-medium">전체 접근</span>
            </td>
            <td className="px-4 py-3 text-sm text-stone-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                오늘 11:30
              </div>
            </td>
            <td className="px-4 py-3 text-sm font-semibold text-stone-800 text-right">47</td>
            <td className="px-4 py-3 text-center">
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-3 h-3" />활성
              </span>
            </td>
            <td className="px-4 py-3">
              <button className="text-xs bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 hover:bg-stone-50 font-medium transition-colors">편집</button>
            </td>
          </tr>

          {/* 이팀장 */}
          <tr className="border-b border-stone-100 hover:bg-stone-50/50">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">이</div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">이팀장</p>
                  <p className="text-xs text-stone-400">팀장</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <code className="text-xs text-stone-600">lee@acme.co.kr</code>
            </td>
            <td className="px-4 py-3">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-600">employee</span>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1 flex-wrap">
                <span className="text-xs text-blue-700 bg-blue-50 rounded-full px-2 py-0.5 font-medium">마케팅</span>
                <span className="text-xs text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5 font-medium">전략</span>
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-stone-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-stone-400 flex-shrink-0"></span>
                어제 16:45
              </div>
            </td>
            <td className="px-4 py-3 text-sm font-semibold text-stone-800 text-right">12</td>
            <td className="px-4 py-3 text-center">
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-3 h-3" />활성
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1.5">
                <button className="text-xs bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 hover:bg-stone-50 font-medium transition-colors">편집</button>
                <button className="text-xs bg-white border border-amber-200 text-amber-700 rounded-lg px-3 py-1.5 hover:bg-amber-50 font-medium transition-colors">비활성화</button>
              </div>
            </td>
          </tr>

          {/* 박과장 */}
          <tr className="border-b border-stone-100 hover:bg-stone-50/50">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">박</div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">박과장</p>
                  <p className="text-xs text-stone-400">과장</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <code className="text-xs text-stone-600">park@acme.co.kr</code>
            </td>
            <td className="px-4 py-3">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-600">employee</span>
            </td>
            <td className="px-4 py-3">
              <span className="text-xs text-amber-700 bg-amber-50 rounded-full px-2 py-0.5 font-medium">법무</span>
            </td>
            <td className="px-4 py-3 text-sm text-stone-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-stone-400 flex-shrink-0"></span>
                3일 전
              </div>
            </td>
            <td className="px-4 py-3 text-sm font-semibold text-stone-800 text-right">5</td>
            <td className="px-4 py-3 text-center">
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-3 h-3" />활성
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1.5">
                <button className="text-xs bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 hover:bg-stone-50 font-medium transition-colors">편집</button>
                <button className="text-xs bg-white border border-amber-200 text-amber-700 rounded-lg px-3 py-1.5 hover:bg-amber-50 font-medium transition-colors">비활성화</button>
              </div>
            </td>
          </tr>

          {/* 최신입 */}
          <tr className="border-b border-stone-100 hover:bg-stone-50/50">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">최</div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">최신입</p>
                  <p className="text-xs text-stone-400">사원</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <code className="text-xs text-stone-600">choi@acme.co.kr</code>
            </td>
            <td className="px-4 py-3">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-600">employee</span>
            </td>
            <td className="px-4 py-3">
              <span className="text-xs text-blue-700 bg-blue-50 rounded-full px-2 py-0.5 font-medium">마케팅</span>
            </td>
            <td className="px-4 py-3 text-sm text-stone-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-stone-300 flex-shrink-0"></span>
                1주 전
              </div>
            </td>
            <td className="px-4 py-3 text-sm font-semibold text-stone-800 text-right">2</td>
            <td className="px-4 py-3 text-center">
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-3 h-3" />활성
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1.5">
                <button className="text-xs bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 hover:bg-stone-50 font-medium transition-colors">편집</button>
                <button className="text-xs bg-white border border-amber-200 text-amber-700 rounded-lg px-3 py-1.5 hover:bg-amber-50 font-medium transition-colors">비활성화</button>
              </div>
            </td>
          </tr>

          {/* 정퇴사 (비활성) */}
          <tr className="hover:bg-stone-50/50 opacity-70">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-sm font-semibold flex-shrink-0">정</div>
                <div>
                  <p className="text-sm font-semibold text-stone-600 line-through">정퇴사</p>
                  <p className="text-xs text-stone-400">퇴사</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <code className="text-xs text-stone-400">jung@acme.co.kr</code>
            </td>
            <td className="px-4 py-3">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-400">employee</span>
            </td>
            <td className="px-4 py-3">
              <span className="text-xs text-stone-400">없음</span>
            </td>
            <td className="px-4 py-3 text-sm text-stone-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-stone-300 flex-shrink-0"></span>
                3개월 전
              </div>
            </td>
            <td className="px-4 py-3 text-sm font-medium text-stone-400 text-right">0</td>
            <td className="px-4 py-3 text-center">
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-500">
                <XCircle className="w-3 h-3" />비활성
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1.5">
                <button className="text-xs bg-white border border-emerald-200 text-emerald-700 rounded-lg px-3 py-1.5 hover:bg-emerald-50 font-medium transition-colors">활성화</button>
                <button className="text-xs bg-white border border-red-200 text-red-600 rounded-lg px-3 py-1.5 hover:bg-red-50 font-medium transition-colors">삭제</button>
              </div>
            </td>
          </tr>

        </tbody>
      </table>
      <div className="px-4 py-3 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
        <p className="text-xs text-stone-500">활성 4명 · 비활성 1명 · 합계 5명</p>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span>이번 달 총 명령 수:</span>
          <span className="font-semibold text-stone-800">66회</span>
        </div>
      </div>
    </div>

    {/* 직원 초대 카드 */}
    <div id="inviteSection" className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
          <Mail className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="font-bold text-stone-900">직원 초대</h2>
          <p className="text-xs text-stone-500">이메일로 초대장을 발송합니다. 초대받은 직원은 링크를 통해 계정을 생성합니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">이메일 주소 *</label>
          <input type="email" placeholder="name@company.com" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">역할 *</label>
          <select className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
            <option>employee</option>
            <option>company_admin</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">부서 배정 (선택)</label>
          <select className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
            <option>배정 안 함</option>
            <option>비서실</option>
            <option>마케팅부서</option>
            <option>전략투자부서</option>
            <option>법무부서</option>
            <option>연구개발부서</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">초대 메시지 (선택)</label>
        <textarea rows="2" placeholder="초대받을 직원에게 전달할 메시지를 입력하세요..." className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"></textarea>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Clock className="w-3.5 h-3.5" />
          초대 링크는 발송 후 48시간 유효합니다
        </div>
        <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-150">
          <Send className="w-4 h-4" />
          초대 이메일 발송
        </button>
      </div>
    </div>

    {/* 보류 중인 초대 */}
    <div className="mt-4 bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-stone-800">보류 중인 초대</h3>
        <span className="text-xs text-stone-500 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-full">2건</span>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between py-2.5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-stone-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-800">shin@acme.co.kr</p>
              <p className="text-xs text-stone-400">마케팅부서 · 발송 2일 전</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2.5 py-0.5 rounded-full">대기 중</span>
            <button className="text-xs text-stone-500 hover:text-red-600 transition-colors">취소</button>
          </div>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-stone-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-800">yoon@acme.co.kr</p>
              <p className="text-xs text-stone-400">법무부서 · 발송 1일 전</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2.5 py-0.5 rounded-full">대기 중</span>
            <button className="text-xs text-stone-500 hover:text-violet-600 transition-colors">재발송</button>
            <button className="text-xs text-stone-500 hover:text-red-600 transition-colors">취소</button>
          </div>
        </div>
      </div>
    </div>

  </main>
    </>
  );
}

export default AdminEmployees;
