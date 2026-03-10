"use client";
import React from "react";
import { Activity, BarChart2, Bell, BookOpen, Bot, Building2, CheckCircle, Clock, Copy, CreditCard, Database, FileText, GitBranch, Info, Key, LayoutDashboard, Link2Off, Package, Plug, Plus, Settings, ShieldCheck, Store, User, UserCheck, Users, Webhook, Zap } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; } h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; } code,pre { font-family: 'JetBrains Mono', monospace; }
`;

function AdminApiKeys() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar */}
<aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-10">
  <div className="px-5 py-4 border-b border-stone-100">
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] font-bold bg-violet-600 text-white px-1.5 py-0.5 rounded tracking-widest">ADMIN</span>
      <span className="font-bold text-stone-900 text-base" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
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
    <a href="/admin/report-lines" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><GitBranch className="w-4 h-4" />보고 라인</a>
    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 pb-1.5 pt-3">에이전트</p>
    <a href="/admin/agents" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Bot className="w-4 h-4" />에이전트 관리</a>
    <a href="/admin/agent-marketplace" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Store className="w-4 h-4" />에이전트 마켓</a>
    <a href="/admin/credentials" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Key className="w-4 h-4" />크리덴셜</a>
    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 pb-1.5 pt-3">마켓플레이스</p>
    <a href="/admin/template-market" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Package className="w-4 h-4" />템플릿 마켓</a>
    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 pb-1.5 pt-3">시스템</p>
    <a href="/admin/monitoring" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Activity className="w-4 h-4" />모니터링</a>
    <a href="#" className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-violet-50 text-violet-700 font-medium text-sm"><ShieldCheck className="w-4 h-4" />API 키</a>
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
  {/* API 주석: GET /api/admin/api-keys, POST /api/admin/api-keys, DELETE /api/admin/api-keys/{id} */}

  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-xl font-bold text-stone-900">API 키 관리</h1>
      <p className="text-sm text-stone-500 mt-0.5">외부 앱과의 연동을 위한 CORTHEX API 키를 관리하세요</p>
    </div>
    <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors">
      <Plus className="w-4 h-4" />
      새 키 생성
    </button>
  </div>

  {/* Info Banner */}
  <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3.5 mb-6 flex items-start gap-3">
    <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
    <p className="text-sm text-blue-700">CORTHEX API를 외부 앱에서 사용하기 위한 키입니다. <strong>생성 시 한 번만 표시됩니다.</strong> 키를 분실하면 재생성이 필요합니다.</p>
  </div>

  {/* Stats */}
  <div className="grid grid-cols-4 gap-4 mb-6">
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
        <Key className="w-4 h-4 text-violet-600" />
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900">3</div>
        <div className="text-xs text-stone-500">전체 키</div>
      </div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-green-600" />
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900">2</div>
        <div className="text-xs text-stone-500">활성 키</div>
      </div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
        <Zap className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900">1,247</div>
        <div className="text-xs text-stone-500">오늘 API 호출</div>
      </div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
        <Clock className="w-4 h-4 text-stone-600" />
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900">38ms</div>
        <div className="text-xs text-stone-500">평균 응답 시간</div>
      </div>
    </div>
  </div>

  {/* API Keys Table */}
  <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-6">
    <div className="px-5 py-4 border-b border-stone-100">
      <h2 className="text-sm font-bold text-stone-900">발급된 API 키</h2>
    </div>
    <table className="w-full">
      <thead>
        <tr className="bg-stone-50">
          <th className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3 text-left">이름</th>
          <th className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3 text-left">키 미리보기</th>
          <th className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3 text-left">권한</th>
          <th className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3 text-left">생성일</th>
          <th className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3 text-left">마지막 사용</th>
          <th className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3 text-left">상태</th>
          <th className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3 text-left">액션</th>
        </tr>
      </thead>
      <tbody>
        {/* Row 1: 활성 - 웹훅 테스트용 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50">
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <Webhook className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <span className="text-sm font-medium text-stone-900">웹훅 테스트용</span>
            </div>
          </td>
          <td className="px-4 py-3.5">
            <code className="text-xs font-mono bg-stone-100 text-stone-700 rounded px-2 py-1">sk-cx-****...****3a2f</code>
          </td>
          <td className="px-4 py-3.5">
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-600">읽기 전용</span>
          </td>
          <td className="px-4 py-3.5 text-sm text-stone-600">2025-02-01</td>
          <td className="px-4 py-3.5 text-sm text-stone-600">오늘 10:24</td>
          <td className="px-4 py-3.5">
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-700 flex items-center gap-1 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
              활성
            </span>
          </td>
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-2">
              <button className="text-xs text-stone-500 hover:text-amber-600 font-medium transition-colors border border-stone-200 rounded-md px-2 py-1 hover:border-amber-200 hover:bg-amber-50">비활성화</button>
              <button className="text-xs text-stone-500 hover:text-red-600 font-medium transition-colors border border-stone-200 rounded-md px-2 py-1 hover:border-red-200 hover:bg-red-50">삭제</button>
            </div>
          </td>
        </tr>

        {/* Row 2: 활성 - 내부 자동화 봇 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50">
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-stone-900">내부 자동화 봇</span>
            </div>
          </td>
          <td className="px-4 py-3.5">
            <code className="text-xs font-mono bg-stone-100 text-stone-700 rounded px-2 py-1">sk-cx-****...****7b9e</code>
          </td>
          <td className="px-4 py-3.5">
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-violet-50 text-violet-700">전체 권한</span>
          </td>
          <td className="px-4 py-3.5 text-sm text-stone-600">2025-01-15</td>
          <td className="px-4 py-3.5 text-sm text-stone-600">어제 14:30</td>
          <td className="px-4 py-3.5">
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-700 flex items-center gap-1 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
              활성
            </span>
          </td>
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-2">
              <button className="text-xs text-stone-500 hover:text-amber-600 font-medium transition-colors border border-stone-200 rounded-md px-2 py-1 hover:border-amber-200 hover:bg-amber-50">비활성화</button>
              <button className="text-xs text-stone-500 hover:text-red-600 font-medium transition-colors border border-stone-200 rounded-md px-2 py-1 hover:border-red-200 hover:bg-red-50">삭제</button>
            </div>
          </td>
        </tr>

        {/* Row 3: 비활성 - 구 연동 */}
        <tr className="hover:bg-stone-50/50 opacity-60">
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
                <Link2Off className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <span className="text-sm font-medium text-stone-700">구 연동 (중단)</span>
            </div>
          </td>
          <td className="px-4 py-3.5">
            <code className="text-xs font-mono bg-stone-100 text-stone-500 rounded px-2 py-1">sk-cx-****...****2c4d</code>
          </td>
          <td className="px-4 py-3.5">
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-500">읽기 전용</span>
          </td>
          <td className="px-4 py-3.5 text-sm text-stone-500">2024-11-01</td>
          <td className="px-4 py-3.5 text-sm text-stone-500">2024-12-31</td>
          <td className="px-4 py-3.5">
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-500 flex items-center gap-1 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block"></span>
              비활성
            </span>
          </td>
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-2">
              <button className="text-xs text-stone-500 hover:text-green-600 font-medium transition-colors border border-stone-200 rounded-md px-2 py-1 hover:border-green-200 hover:bg-green-50 opacity-100">활성화</button>
              <button className="text-xs text-stone-500 hover:text-red-600 font-medium transition-colors border border-stone-200 rounded-md px-2 py-1 hover:border-red-200 hover:bg-red-50 opacity-100">삭제</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  {/* Two Column: Chart + Code */}
  <div className="grid grid-cols-5 gap-6">
    {/* Usage Chart (3/5) */}
    <div className="col-span-3 bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-stone-900">API 사용량 (최근 7일)</h2>
        <span className="text-xs text-stone-400">일별 호출 수</span>
      </div>

      {/* CSS Bar Chart */}
      <div className="flex items-end gap-2 h-36">
        {/* Day 1 */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-stone-400 font-medium">842</span>
          <div className="w-full bg-violet-100 rounded-t-md" style={{height: "67%"}}></div>
          <span className="text-[10px] text-stone-400">3/4</span>
        </div>
        {/* Day 2 */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-stone-400 font-medium">1,023</span>
          <div className="w-full bg-violet-200 rounded-t-md" style={{height: "82%"}}></div>
          <span className="text-[10px] text-stone-400">3/5</span>
        </div>
        {/* Day 3 */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-stone-400 font-medium">756</span>
          <div className="w-full bg-violet-100 rounded-t-md" style={{height: "60%"}}></div>
          <span className="text-[10px] text-stone-400">3/6</span>
        </div>
        {/* Day 4 */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-stone-400 font-medium">1,247</span>
          <div className="w-full bg-violet-500 rounded-t-md" style={{height: "100%"}}></div>
          <span className="text-[10px] text-violet-600 font-semibold">3/7</span>
        </div>
        {/* Day 5 */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-stone-400 font-medium">934</span>
          <div className="w-full bg-violet-200 rounded-t-md" style={{height: "75%"}}></div>
          <span className="text-[10px] text-stone-400">3/8</span>
        </div>
        {/* Day 6 */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-stone-400 font-medium">612</span>
          <div className="w-full bg-violet-100 rounded-t-md" style={{height: "49%"}}></div>
          <span className="text-[10px] text-stone-400">3/9</span>
        </div>
        {/* Day 7 (오늘) */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-stone-400 font-medium">428</span>
          <div className="w-full bg-violet-300 rounded-t-md border-2 border-dashed border-violet-400" style={{height: "34%"}}></div>
          <span className="text-[10px] text-stone-400">오늘</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <span>7일 총 호출: <strong className="text-stone-800">5,842회</strong></span>
        <span>일 평균: <strong className="text-stone-800">834회</strong></span>
        <span>최대: <strong className="text-stone-800">1,247회 (3/7)</strong></span>
      </div>
    </div>

    {/* Quick Start Code (2/5) */}
    <div className="col-span-2 bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-stone-900">빠른 시작</h2>
        <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
          <button className="px-2 py-1 text-xs font-medium rounded-md bg-white shadow-sm text-stone-700">Python</button>
          <button className="px-2 py-1 text-xs font-medium rounded-md text-stone-500 hover:text-stone-700">cURL</button>
        </div>
      </div>

      {/* Code Block */}
      <div className="bg-stone-900 rounded-xl p-4 text-stone-100 overflow-x-auto">
        <pre className="text-xs leading-relaxed"><span className="text-stone-400"># CORTHEX API 호출 예시</span>
<span className="text-blue-400">import</span> requests

<span className="text-stone-300">headers</span> = {
  <span className="text-green-400">"Authorization"</span>: <span className="text-amber-300">"Bearer sk-cx-****...****3a2f"</span>,
  <span className="text-green-400">"Content-Type"</span>: <span className="text-amber-300">"application/json"</span>
}

<span className="text-stone-300">payload</span> = {
  <span className="text-green-400">"command"</span>: <span className="text-amber-300">"오늘 시장 동향 분석해줘"</span>,
  <span className="text-green-400">"agent_id"</span>: <span className="text-amber-300">"agent_abc123"</span>
}

<span className="text-stone-300">response</span> = requests.<span className="text-blue-400">post</span>(
  <span className="text-amber-300">"https://api.corthex.io/v1/commands"</span>,
  <span className="text-stone-300">headers</span>=headers,
  <span className="text-stone-300">json</span>=payload
)

<span className="text-blue-400">print</span>(response.<span className="text-blue-400">json</span>())</pre>
      </div>

      {/* Copy Button */}
      <button className="mt-3 w-full flex items-center justify-center gap-2 bg-white border border-stone-200 text-stone-700 rounded-lg py-2 text-xs font-medium hover:bg-stone-50 transition-colors">
        <Copy className="w-3.5 h-3.5" />
        코드 복사
      </button>

      {/* Docs Link */}
      <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
        <BookOpen className="w-3.5 h-3.5" />
        <a href="#" className="text-violet-600 hover:text-violet-700 font-medium transition-colors">API 전체 문서 보기 →</a>
      </div>
    </div>
  </div>

  {/* Endpoint Reference */}
  <div className="mt-6 bg-white rounded-xl border border-stone-200 shadow-sm p-5">
    <h2 className="text-sm font-bold text-stone-900 mb-4">주요 엔드포인트</h2>
    <div className="space-y-2">
      <div className="flex items-center gap-3 px-3 py-2.5 bg-stone-50 rounded-lg">
        <span className="text-[10px] font-bold bg-green-100 text-green-700 rounded px-1.5 py-0.5 font-mono w-12 text-center">GET</span>
        <code className="text-xs text-stone-700 font-mono flex-1">https://api.corthex.io/v1/agents</code>
        <span className="text-xs text-stone-400">에이전트 목록 조회</span>
      </div>
      <div className="flex items-center gap-3 px-3 py-2.5 bg-stone-50 rounded-lg">
        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 font-mono w-12 text-center">POST</span>
        <code className="text-xs text-stone-700 font-mono flex-1">https://api.corthex.io/v1/commands</code>
        <span className="text-xs text-stone-400">명령 전송</span>
      </div>
      <div className="flex items-center gap-3 px-3 py-2.5 bg-stone-50 rounded-lg">
        <span className="text-[10px] font-bold bg-green-100 text-green-700 rounded px-1.5 py-0.5 font-mono w-12 text-center">GET</span>
        <code className="text-xs text-stone-700 font-mono flex-1">https://api.corthex.io/v1/jobs/{id}</code>
        <span className="text-xs text-stone-400">작업 상태 조회</span>
      </div>
      <div className="flex items-center gap-3 px-3 py-2.5 bg-stone-50 rounded-lg">
        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 rounded px-1.5 py-0.5 font-mono w-12 text-center">WS</span>
        <code className="text-xs text-stone-700 font-mono flex-1">wss://api.corthex.io/v1/stream</code>
        <span className="text-xs text-stone-400">실시간 스트림</span>
      </div>
    </div>
  </div>
</main>
    </>
  );
}

export default AdminApiKeys;
