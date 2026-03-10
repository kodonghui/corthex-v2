"use client";
import React from "react";
import { Activity, Bell, Bot, Briefcase, Building2, CircleDollarSign, Database, FileBarChart, GitBranch, Key, Layers, LayoutDashboard, Plug, Radio, Server, Settings, Shield, Store, UserCheck, UserPlus, Users, Workflow } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    .pulse-dot { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`;

function AdminMonitoring() {
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
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm bg-violet-50 text-violet-700 font-medium"><Activity className="w-4 h-4" /> 모니터링</a>
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
        <h1 className="text-xl font-bold text-stone-900">시스템 모니터링</h1>
        <p className="text-sm text-stone-500 mt-0.5">실시간 시스템 상태 및 에러 로그</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-1 rounded">GET /api/admin/monitoring/health</span>
        {/* Auto-refresh toggle */}
        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2">
          <span className="text-xs text-stone-600 font-medium">자동 새로고침</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="autoRefresh" checked className="sr-only peer" onChange="toggleRefresh(this)" />
            <div className="w-9 h-5 bg-stone-200 peer-checked:bg-violet-600 rounded-full peer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
          </label>
          <span id="refreshLabel" className="text-xs text-violet-600 font-medium">30초</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot inline-block"></span>
          마지막 갱신: 10:42:15
        </div>
      </div>
    </div>

    {/* System Status Cards */}
    <div className="grid grid-cols-4 gap-4 mb-6">
      {/* API Server */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Server className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></span> 정상
          </span>
        </div>
        <p className="text-sm font-bold text-stone-800 mb-2">API 서버</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs"><span className="text-stone-500">응답시간</span><span className="font-mono font-medium text-stone-700">45ms</span></div>
          <div className="flex justify-between text-xs"><span className="text-stone-500">업타임</span><span className="font-mono font-medium text-emerald-700">99.9%</span></div>
          <div className="flex justify-between text-xs"><span className="text-stone-500">요청/분</span><span className="font-mono font-medium text-stone-700">284</span></div>
        </div>
      </div>

      {/* Database */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Database className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></span> 정상
          </span>
        </div>
        <p className="text-sm font-bold text-stone-800 mb-2">데이터베이스</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs"><span className="text-stone-500">연결 수</span><span className="font-mono font-medium text-stone-700">8 / 20</span></div>
          <div className="flex justify-between text-xs"><span className="text-stone-500">쿼리 시간</span><span className="font-mono font-medium text-stone-700">12ms</span></div>
          <div className="flex justify-between text-xs"><span className="text-stone-500">슬로우 쿼리</span><span className="font-mono font-medium text-stone-700">0</span></div>
        </div>
      </div>

      {/* WebSocket */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Radio className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></span> 정상
          </span>
        </div>
        <p className="text-sm font-bold text-stone-800 mb-2">WebSocket</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs"><span className="text-stone-500">활성 연결</span><span className="font-mono font-medium text-stone-700">3개</span></div>
          <div className="flex justify-between text-xs"><span className="text-stone-500">메시지/분</span><span className="font-mono font-medium text-stone-700">145</span></div>
          <div className="flex justify-between text-xs"><span className="text-stone-500">오류율</span><span className="font-mono font-medium text-emerald-700">0%</span></div>
        </div>
      </div>

      {/* Batch */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Layers className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></span> 정상
          </span>
        </div>
        <p className="text-sm font-bold text-stone-800 mb-2">배치 처리</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs"><span className="text-stone-500">대기 중</span><span className="font-mono font-medium text-stone-700">45건</span></div>
          <div className="flex justify-between text-xs"><span className="text-stone-500">처리 중</span><span className="font-mono font-medium text-violet-700">2건</span></div>
          <div className="flex justify-between text-xs"><span className="text-stone-500">완료 (오늘)</span><span className="font-mono font-medium text-stone-700">1,204건</span></div>
        </div>
      </div>
    </div>

    {/* Two-column: Error Log + Realtime Metrics */}
    <div className="grid grid-cols-3 gap-5">
      {/* Error Log (2/3) */}
      <div className="col-span-2 bg-white rounded-xl border border-stone-200 shadow-sm">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 text-sm">최근 에러 로그</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-stone-400">GET /api/admin/monitoring/errors</span>
            <button className="text-xs text-stone-500 hover:text-stone-700 border border-stone-200 rounded px-2 py-1">전체 보기</button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">시간</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">유형</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">메시지</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">에이전트</th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-4 py-3">스택</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3 text-xs text-stone-400 font-mono whitespace-nowrap">10:20</td>
              <td className="px-4 py-3"><span className="bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 text-[10px] font-semibold font-mono">SNS_ERROR</span></td>
              <td className="px-4 py-3 text-xs text-stone-700">Instagram API 토큰 만료</td>
              <td className="px-4 py-3 text-xs text-stone-600">최민지</td>
              <td className="px-4 py-3 text-right"><button className="text-xs text-violet-600 hover:text-violet-700 font-medium">상세보기</button></td>
            </tr>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3 text-xs text-stone-400 font-mono">09:45</td>
              <td className="px-4 py-3"><span className="bg-orange-50 text-orange-700 rounded-full px-2 py-0.5 text-[10px] font-semibold font-mono">TOOL_ERROR</span></td>
              <td className="px-4 py-3 text-xs text-stone-700">web_search timeout (30초)</td>
              <td className="px-4 py-3 text-xs text-stone-600">박준형</td>
              <td className="px-4 py-3 text-right"><button className="text-xs text-violet-600 hover:text-violet-700 font-medium">상세보기</button></td>
            </tr>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3 text-xs text-stone-400 font-mono">어제 18:30</td>
              <td className="px-4 py-3"><span className="bg-red-50 text-red-700 rounded-full px-2 py-0.5 text-[10px] font-semibold font-mono">LLM_ERROR</span></td>
              <td className="px-4 py-3 text-xs text-stone-700">rate_limit (Anthropic)</td>
              <td className="px-4 py-3 text-xs text-stone-600">이나경</td>
              <td className="px-4 py-3 text-right"><button className="text-xs text-violet-600 hover:text-violet-700 font-medium">상세보기</button></td>
            </tr>
            <tr className="border-b border-stone-100 hover:bg-stone-50/50">
              <td className="px-4 py-3 text-xs text-stone-400 font-mono">어제 14:10</td>
              <td className="px-4 py-3"><span className="bg-stone-100 text-stone-600 rounded-full px-2 py-0.5 text-[10px] font-semibold font-mono">AUTH_ERROR</span></td>
              <td className="px-4 py-3 text-xs text-stone-700">잘못된 JWT 토큰</td>
              <td className="px-4 py-3 text-xs text-stone-400">—</td>
              <td className="px-4 py-3 text-right"><button className="text-xs text-violet-600 hover:text-violet-700 font-medium">상세보기</button></td>
            </tr>
            <tr className="hover:bg-stone-50/50">
              <td className="px-4 py-3 text-xs text-stone-400 font-mono">3일 전</td>
              <td className="px-4 py-3"><span className="bg-red-50 text-red-700 rounded-full px-2 py-0.5 text-[10px] font-semibold font-mono">DB_ERROR</span></td>
              <td className="px-4 py-3 text-xs text-stone-700">connection pool exhausted</td>
              <td className="px-4 py-3 text-xs text-stone-400">—</td>
              <td className="px-4 py-3 text-right"><button className="text-xs text-violet-600 hover:text-violet-700 font-medium">상세보기</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Realtime Metrics (1/3) */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-900 text-sm mb-4">실시간 지표</h3>
          <div className="space-y-4">
            {/* LLM Calls/min */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-stone-600">LLM 호출/분</span>
                <span className="text-sm font-bold text-stone-800 font-mono">12</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{"width":"48%"}}></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-stone-400">0</span>
                <span className="text-[10px] text-stone-400">최대 25</span>
              </div>
            </div>

            {/* WebSocket connections */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-stone-600">활성 WebSocket</span>
                <span className="text-sm font-bold text-stone-800 font-mono">3</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{"width":"30%"}}></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-stone-400">0</span>
                <span className="text-[10px] text-stone-400">최대 10</span>
              </div>
            </div>

            {/* CPU */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-stone-600">CPU 사용률</span>
                <span className="text-sm font-bold text-stone-800 font-mono">28%</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{"width":"28%"}}></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-stone-400">0%</span>
                <span className="text-[10px] text-stone-400">100%</span>
              </div>
            </div>

            {/* Memory */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-stone-600">메모리</span>
                <span className="text-sm font-bold text-stone-800 font-mono">2.4 / 8GB</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{"width":"30%"}}></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-stone-400">0GB</span>
                <span className="text-[10px] text-stone-400">8GB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Today Summary */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-900 text-sm mb-3">오늘 요약</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">총 LLM 호출</span>
              <span className="font-mono font-semibold text-stone-700">950건</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">에러 발생</span>
              <span className="font-mono font-semibold text-amber-600">2건</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">평균 응답시간</span>
              <span className="font-mono font-semibold text-stone-700">1.2초</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">성공률</span>
              <span className="font-mono font-semibold text-emerald-600">99.8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
    </>
  );
}

export default AdminMonitoring;
