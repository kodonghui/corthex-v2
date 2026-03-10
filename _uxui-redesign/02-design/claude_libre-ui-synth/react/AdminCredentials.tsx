"use client";
import React from "react";
import { Activity, BarChart2, BookOpen, Bot, Building2, Cpu, Database, DollarSign, FileText, GitBranch, GitFork, Instagram, KeyRound, LayoutDashboard, Plus, Search, Settings, Shield, ShieldCheck, Sparkles, Store, Trash2, TrendingUp, UserPlus, Users, Workflow, Wrench } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; } h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; } code,pre { font-family: 'JetBrains Mono', monospace; }`;

function AdminCredentials() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      {/* Sidebar */}
  <aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-40">
    {/* Logo */}
    <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2.5">
      <span className="bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider">ADMIN</span>
      <span className="font-bold text-stone-900 text-base" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
    </div>
    {/* Nav */}
    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 text-sm">
      <a href="/admin/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><LayoutDashboard className="w-4 h-4" />대시보드</a>
      <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Building2 className="w-4 h-4" />조직 관리</a>
      <a href="/admin/org-chart" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><GitFork className="w-4 h-4" />조직도</a>
      <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Users className="w-4 h-4" />인간 직원</a>
      <a href="/admin/agents" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Bot className="w-4 h-4" />AI 에이전트</a>
      <a href="/admin/tools" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100"><Wrench className="w-4 h-4" />도구 관리</a>
      <a href="/admin/credentials" className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-violet-50 text-violet-700 font-medium"><KeyRound className="w-4 h-4" />크리덴셜</a>
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
    {/* User */}
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900">크리덴셜 관리</h1>
          <p className="text-sm text-stone-500 mt-0.5">외부 서비스 API 키 및 인증 정보 관리</p>
        </div>
        <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          크리덴셜 추가
        </button>
      </div>

      {/* Security Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3.5 mb-6 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">보안 안내</p>
          <p className="text-sm text-blue-700 mt-0.5">모든 크리덴셜은 <code className="bg-blue-100 px-1 rounded text-xs">AES-256-GCM</code>으로 암호화되어 저장됩니다. 관리자만 크리덴셜을 추가/삭제할 수 있습니다. 에이전트는 키 값에 직접 접근할 수 없습니다.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 mb-5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">서비스 유형</label>
          <select className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-stone-700">
            <option>전체</option>
            <option>LLM</option>
            <option>금융</option>
            <option>SNS</option>
            <option>검색</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">상태</label>
          <select className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-stone-700">
            <option>전체</option>
            <option>활성</option>
            <option>만료임박</option>
            <option>만료</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="서비스명 검색..." className="rounded-lg border border-stone-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-52" />
          </div>
        </div>
      </div>

      {/* Credentials Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-stone-700">전체 7개 크리덴셜</span>
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>활성 4</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>만료임박 2</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>만료 1</span>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">서비스</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">유형</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">키 미리보기</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">사용 에이전트</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">등록일</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">만료일</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">상태</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">액션</th>
            </tr>
          </thead>
          <tbody>
            {/* Row 1: Anthropic */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-sm font-medium text-stone-900">Anthropic API</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-50 text-purple-700">LLM</span></td>
              <td className="px-4 py-3"><code className="text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded">****...***3c9d</code></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-700">8 에이전트</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-500">2025-01-15</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-500">2026-01-15</span></td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">✅ 활성</span></td>
              <td className="px-4 py-3">
                <button className="text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1 rounded-md hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />삭제
                </button>
              </td>
            </tr>
            {/* Row 2: OpenAI */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-stone-900">OpenAI API</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-50 text-purple-700">LLM</span></td>
              <td className="px-4 py-3"><code className="text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded">****...***7b1e</code></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-700">3 에이전트</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-500">2024-09-01</span></td>
              <td className="px-4 py-3"><span className="text-sm text-amber-600 font-medium">2025-06-15</span></td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-700">⚠️ 만료임박</span></td>
              <td className="px-4 py-3">
                <button className="text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1 rounded-md hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />삭제
                </button>
              </td>
            </tr>
            {/* Row 3: Gemini */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-stone-900">Google Gemini</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-50 text-purple-700">LLM</span></td>
              <td className="px-4 py-3"><code className="text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded">****...***4d2f</code></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-400">0 에이전트</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-500">2025-02-01</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-500">2026-02-01</span></td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">✅ 활성</span></td>
              <td className="px-4 py-3">
                <button className="text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1 rounded-md hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />삭제
                </button>
              </td>
            </tr>
            {/* Row 4: KIS */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-sky-600" />
                  </div>
                  <span className="text-sm font-medium text-stone-900">KIS 증권</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-sky-50 text-sky-700">금융</span></td>
              <td className="px-4 py-3"><code className="text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded">****...***8f2a</code></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-700">2 에이전트</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-500">2024-12-01</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-500">2026-12-31</span></td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">✅ 활성</span></td>
              <td className="px-4 py-3">
                <button className="text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1 rounded-md hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />삭제
                </button>
              </td>
            </tr>
            {/* Row 5: Instagram */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center">
                    <Instagram className="w-4 h-4 text-pink-500" />
                  </div>
                  <span className="text-sm font-medium text-stone-900">Instagram Business</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-pink-50 text-pink-700">SNS</span></td>
              <td className="px-4 py-3"><code className="text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded">****...***2a4f</code></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-700">1 에이전트</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-500">2024-10-15</span></td>
              <td className="px-4 py-3"><span className="text-sm text-amber-600 font-medium">2025-04-01</span></td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-700">⚠️ 만료임박</span></td>
              <td className="px-4 py-3">
                <button className="text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1 rounded-md hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />삭제
                </button>
              </td>
            </tr>
            {/* Row 6: Naver Blog (expired) */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50 opacity-60">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-stone-900">Naver Blog</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-pink-50 text-pink-700">SNS</span></td>
              <td className="px-4 py-3"><code className="text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded">****...***9d2h</code></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-400">0 에이전트</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-500">2024-06-01</span></td>
              <td className="px-4 py-3"><span className="text-sm text-red-600 font-medium">2024-12-01</span></td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-50 text-red-700">❌ 만료</span></td>
              <td className="px-4 py-3">
                <button className="text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1 rounded-md hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />삭제
                </button>
              </td>
            </tr>
            {/* Row 7: Google Search */}
            <tr className="hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Search className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-stone-900">Google Search</span>
                </div>
              </td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700">검색</span></td>
              <td className="px-4 py-3"><code className="text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded">****...***5c7g</code></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-700">4 에이전트</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-500">2025-03-01</span></td>
              <td className="px-4 py-3"><span className="text-sm text-stone-500">2026-03-01</span></td>
              <td className="px-4 py-3"><span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">✅ 활성</span></td>
              <td className="px-4 py-3">
                <button className="text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1 rounded-md hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />삭제
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* API Reference */}
      <div className="mt-6 bg-stone-900 rounded-xl p-5">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">API Reference</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-400 w-14 flex-shrink-0">GET</span>
            <code className="text-xs text-stone-300">/api/admin/credentials</code>
            <span className="text-xs text-stone-500">— 전체 크리덴셜 목록 조회</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-blue-400 w-14 flex-shrink-0">POST</span>
            <code className="text-xs text-stone-300">/api/admin/credentials</code>
            <span className="text-xs text-stone-500">— 새 크리덴셜 등록</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-red-400 w-14 flex-shrink-0">DELETE</span>
            <code className="text-xs text-stone-300">/api/admin/credentials/{id}</code>
            <span className="text-xs text-stone-500">— 크리덴셜 삭제</span>
          </div>
        </div>
      </div>

    </div>
  </main>
    </>
  );
}

export default AdminCredentials;
