"use client";
import React from "react";
import { Activity, BarChart2, Bell, BookOpen, Bot, Brain, Briefcase, Building2, CheckCircle, CreditCard, Download, Eye, FileText, Folder, Home, Key, LayoutDashboard, List, MessageCircle, Rss, Send, Settings, Share2, Shield, Terminal, Timer, TrendingDown, TrendingUp, Users } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #fafaf9; }
    ::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 3px; }`;

function AppPerformance() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      {/* SIDEBAR */}
<aside className="w-60 fixed left-0 top-0 bottom-0 bg-white border-r border-stone-200 flex flex-col z-20">
  <div className="p-4 border-b border-stone-200">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">C</span></div>
      <span className="font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
    </div>
  </div>
  <div className="px-4 py-3 border-b border-stone-200">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center"><span className="text-violet-700 text-xs font-semibold">김</span></div>
      <div><div className="text-xs font-semibold text-stone-900">김대표</div><div className="text-[10px] text-stone-400">Owner</div></div>
    </div>
  </div>
  <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400">메인</p>
    <a href="/app/home" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Home className="w-4 h-4" />홈</a>
    <a href="/app/dashboard" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><LayoutDashboard className="w-4 h-4" />대시보드</a>
    <a href="/app/command-center" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Terminal className="w-4 h-4" />커맨드 센터</a>
    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-2">조직</p>
    <a href="/app/agents" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Bot className="w-4 h-4" />AI 에이전트</a>
    <a href="/app/departments" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Building2 className="w-4 h-4" />부서</a>
    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-2">커뮤니케이션</p>
    <a href="/app/chat" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><MessageCircle className="w-4 h-4" />채팅</a>
    <a href="/app/agora" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Users className="w-4 h-4" />아고라</a>
    <a href="/app/messenger" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Send className="w-4 h-4" />메신저</a>
    <a href="/app/notifications" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Bell className="w-4 h-4" />알림</a>
    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-2">업무</p>
    <a href="/app/jobs" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Briefcase className="w-4 h-4" />잡(Jobs)</a>
    <a href="/app/nexus" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Share2 className="w-4 h-4" />넥서스</a>
    <a href="/app/sns" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Rss className="w-4 h-4" />SNS 관리</a>
    <a href="/app/trading" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><TrendingUp className="w-4 h-4" />트레이딩</a>
    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-2">지식·파일</p>
    <a href="/app/knowledge" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><BookOpen className="w-4 h-4" />지식베이스</a>
    <a href="/app/files" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Folder className="w-4 h-4" />파일</a>
    <a href="/app/classified" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Shield className="w-4 h-4" />기밀문서</a>
    <a href="/app/reports" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><FileText className="w-4 h-4" />보고서</a>
    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-2">분석·특수</p>
    <a href="/app/performance" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-violet-50 text-violet-700 text-sm font-medium"><BarChart2 className="w-4 h-4" />전력분석</a>
    <a href="/app/costs" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><CreditCard className="w-4 h-4" />비용 관리</a>
    <a href="/app/activity-log" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Activity className="w-4 h-4" />활동 로그</a>
    <a href="/app/argos" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Eye className="w-4 h-4" />아르고스</a>
    <a href="/app/credentials" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Key className="w-4 h-4" />크리덴셜</a>
    <a href="/app/ops-log" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><List className="w-4 h-4" />운영 로그</a>
    <a href="/app/settings" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm mt-2"><Settings className="w-4 h-4" />설정</a>
  </nav>
</aside>

{/* MAIN */}
<main className="ml-60 flex-1 p-6 min-h-screen">
  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-xl font-bold text-stone-900">전력분석</h1>
      <p className="text-sm text-stone-500 mt-0.5">에이전트 성능 지표 및 Soul Gym 개선 권고 — API: GET /api/workspace/performance/summary</p>
    </div>
    <div className="flex items-center gap-2">
      <select className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-stone-700 bg-white">
        <option>이번달 (3월)</option>
        <option>지난달 (2월)</option>
        <option>최근 7일</option>
      </select>
      <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all duration-150">
        <Download className="w-4 h-4" />리포트 다운로드
      </button>
    </div>
  </div>

  {/* KPI Cards — API: GET /api/workspace/performance/summary */}
  <div className="grid grid-cols-4 gap-4 mb-6">
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-stone-500">총 에이전트</span>
        <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center"><Bot className="w-4 h-4 text-violet-600" /></div>
      </div>
      <div className="text-2xl font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>24</div>
      <div className="text-xs text-stone-500 mt-1.5">활성 5 · 대기 19</div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-stone-500">평균 성공률</span>
        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center"><CheckCircle className="w-4 h-4 text-emerald-600" /></div>
      </div>
      <div className="text-2xl font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>94.2%</div>
      <div className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1"><TrendingUp className="w-3 h-3" />지난달 대비 +1.3%</div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-stone-500">이번달 총 비용</span>
        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center"><CreditCard className="w-4 h-4 text-amber-600" /></div>
      </div>
      <div className="text-2xl font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>$12.40</div>
      <div className="text-xs text-stone-500 mt-1.5">예산 62% 소진</div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-stone-500">평균 응답 시간</span>
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><Timer className="w-4 h-4 text-blue-600" /></div>
      </div>
      <div className="text-2xl font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>3.2초</div>
      <div className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1"><TrendingDown className="w-3 h-3" />지난달 대비 -0.4초</div>
    </div>
  </div>

  {/* Performance Table — API: GET /api/workspace/performance/agents */}
  <div className="bg-white rounded-xl border border-stone-200 shadow-sm mb-6">
    <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
      <h3 className="font-bold text-stone-900 text-sm">에이전트 성능 현황</h3>
      <span className="text-xs text-stone-400">이번달 기준 · 활동 에이전트만 표시</span>
    </div>
    <table className="w-full">
      <thead>
        <tr className="bg-stone-50 border-b border-stone-100">
          <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">에이전트</th>
          <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">부서</th>
          <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">역할</th>
          <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">호출수</th>
          <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">성공률</th>
          <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">평균비용</th>
          <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">평균응답</th>
          <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">Soul Gym 상태</th>
        </tr>
      </thead>
      <tbody>
        {/* 이나경 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-xs font-semibold text-emerald-700">이</span></div>
              <span className="text-sm font-medium text-stone-900">이나경</span>
            </div>
          </td>
          <td className="px-4 py-3.5 text-sm text-stone-600">비서실</td>
          <td className="px-4 py-3.5"><span className="bg-violet-50 text-violet-700 rounded-full px-2 py-0.5 text-xs font-medium">Manager</span></td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-700 font-medium">380</td>
          <td className="px-4 py-3.5 text-right">
            <div className="flex items-center justify-end gap-2">
              <div className="w-16 bg-stone-100 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{"width":"98.2%"}}></div></div>
              <span className="text-sm font-semibold text-emerald-700">98.2%</span>
            </div>
          </td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-600" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$0.006</td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-600">1.2초</td>
          <td className="px-4 py-3.5 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">최적 ✓</span></td>
        </tr>
        {/* 김재원 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-xs font-semibold text-violet-700">김</span></div>
              <span className="text-sm font-medium text-stone-900">김재원</span>
            </div>
          </td>
          <td className="px-4 py-3.5 text-sm text-stone-600">전략부서</td>
          <td className="px-4 py-3.5"><span className="bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-xs font-medium">Specialist</span></td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-700 font-medium">145</td>
          <td className="px-4 py-3.5 text-right">
            <div className="flex items-center justify-end gap-2">
              <div className="w-16 bg-stone-100 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{"width":"97.8%"}}></div></div>
              <span className="text-sm font-semibold text-emerald-700">97.8%</span>
            </div>
          </td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-600" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$0.029</td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-600">5.4초</td>
          <td className="px-4 py-3.5 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">최적 ✓</span></td>
        </tr>
        {/* 이소연 */}
        <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-xs font-semibold text-rose-700">이</span></div>
              <span className="text-sm font-medium text-stone-900">이소연</span>
            </div>
          </td>
          <td className="px-4 py-3.5 text-sm text-stone-600">법무팀</td>
          <td className="px-4 py-3.5"><span className="bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-xs font-medium">Specialist</span></td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-700 font-medium">85</td>
          <td className="px-4 py-3.5 text-right">
            <div className="flex items-center justify-end gap-2">
              <div className="w-16 bg-stone-100 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{"width":"100%"}}></div></div>
              <span className="text-sm font-semibold text-emerald-700">100%</span>
            </div>
          </td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-600" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$0.014</td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-600">3.1초</td>
          <td className="px-4 py-3.5 text-center"><span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">최적 ✓</span></td>
        </tr>
        {/* 박준형 */}
        <tr className="border-b border-stone-100 hover:bg-amber-50/30 transition-colors">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-xs font-semibold text-blue-700">박</span></div>
              <span className="text-sm font-medium text-stone-900">박준형</span>
            </div>
          </td>
          <td className="px-4 py-3.5 text-sm text-stone-600">마케팅부서</td>
          <td className="px-4 py-3.5"><span className="bg-violet-50 text-violet-700 rounded-full px-2 py-0.5 text-xs font-medium">Manager</span></td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-700 font-medium">220</td>
          <td className="px-4 py-3.5 text-right">
            <div className="flex items-center justify-end gap-2">
              <div className="w-16 bg-stone-100 rounded-full h-1.5"><div className="bg-amber-400 h-1.5 rounded-full" style={{"width":"94.1%"}}></div></div>
              <span className="text-sm font-semibold text-amber-700">94.1%</span>
            </div>
          </td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-600" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$0.013</td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-600">2.8초</td>
          <td className="px-4 py-3.5 text-center"><span className="bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5 text-xs font-medium">개선 권고 ⚠</span></td>
        </tr>
        {/* 최민지 */}
        <tr className="border-b border-stone-100 hover:bg-red-50/30 transition-colors bg-red-50/10">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-xs font-semibold text-amber-700">최</span></div>
              <span className="text-sm font-medium text-stone-900">최민지</span>
            </div>
          </td>
          <td className="px-4 py-3.5 text-sm text-stone-600">마케팅부서</td>
          <td className="px-4 py-3.5"><span className="bg-stone-100 text-stone-600 rounded-full px-2 py-0.5 text-xs font-medium">Worker</span></td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-700 font-medium">290</td>
          <td className="px-4 py-3.5 text-right">
            <div className="flex items-center justify-end gap-2">
              <div className="w-16 bg-stone-100 rounded-full h-1.5"><div className="bg-red-400 h-1.5 rounded-full" style={{"width":"89.3%"}}></div></div>
              <span className="text-sm font-semibold text-red-600">89.3%</span>
            </div>
          </td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-600" style={{"fontFamily":"'JetBrains Mono',monospace"}}>$0.007</td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-600">2.1초</td>
          <td className="px-4 py-3.5 text-center"><span className="bg-red-50 text-red-700 rounded-full px-2.5 py-0.5 text-xs font-medium">주의 필요 ●</span></td>
        </tr>
        {/* 정도현 */}
        <tr className="hover:bg-stone-50/50 transition-colors opacity-60">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-xs font-semibold text-stone-500">정</span></div>
              <span className="text-sm font-medium text-stone-500">정도현</span>
            </div>
          </td>
          <td className="px-4 py-3.5 text-sm text-stone-400">전략부서</td>
          <td className="px-4 py-3.5"><span className="bg-stone-100 text-stone-400 rounded-full px-2 py-0.5 text-xs font-medium">Worker</span></td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-400">0</td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-400">—</td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-400">—</td>
          <td className="px-4 py-3.5 text-right text-sm text-stone-400">—</td>
          <td className="px-4 py-3.5 text-center"><span className="bg-stone-100 text-stone-400 rounded-full px-2.5 py-0.5 text-xs font-medium">데이터 없음</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  {/* Soul Gym Recommendation Card */}
  <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <Brain className="w-5 h-5 text-amber-600" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-stone-900 text-sm">Soul Gym 개선 권고 — 최민지</h3>
          <span className="bg-red-50 text-red-700 rounded-full px-2 py-0.5 text-xs font-medium">주의 필요</span>
        </div>
        <p className="text-sm text-stone-600 mb-4">현재 성공률 <strong>89.3%</strong>. 목표 성공률 <strong>95%</strong> 달성을 위해 다음 조치를 권고합니다:</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <div className="text-xs font-semibold text-stone-700 mb-1">주요 실패 원인</div>
            <div className="text-xs text-stone-600">Instagram API 토큰 만료<br />— 전체 실패의 73% 차지</div>
          </div>
          <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
            <div className="text-xs font-semibold text-violet-700 mb-1">권고 조치</div>
            <div className="text-xs text-stone-600">프롬프트 오류 처리 개선<br />+ 토큰 자동 갱신 로직</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="text-xs font-semibold text-emerald-700 mb-1">예상 효과</div>
            <div className="text-xs text-stone-600">성공률 +5.7%<br />89.3% → 95.0% 달성</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150">
            개선 적용하기
          </button>
          <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-50 transition-all duration-150">
            상세 분석 보기
          </button>
          <span className="text-xs text-stone-400 ml-2">적용 시 즉시 프롬프트 업데이트 · 되돌리기 가능</span>
        </div>
      </div>
    </div>
  </div>
</main>
    </>
  );
}

export default AppPerformance;
