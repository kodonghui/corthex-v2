"use client";
import React from "react";
import { Activity, BarChart2, Bell, BookOpen, Bot, Briefcase, Building2, Eye, FileBarChart, Folder, Home, Key, LayoutDashboard, MessageCircle, MessageSquare, Network, Play, Plus, Receipt, Scroll, Settings, Share2, Shield, Terminal, TrendingUp, Users, X } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4,h5,h6,.font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    @keyframes pulse-glow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .pulse-dot { animation: pulse-glow 1.4s ease-in-out infinite; }
    @keyframes live-ring {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .live-ring { animation: live-ring 1.2s ease-out infinite; }
`;

function AppAgora() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar */}
  <aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-40">
    <div className="px-4 py-4 border-b border-stone-100 flex items-center gap-3">
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm font-display">C</span>
      </div>
      <span className="font-display font-bold text-stone-900 text-base">CORTHEX</span>
    </div>
    <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
      <a href="/app/home" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Home className="w-4 h-4 shrink-0" /><span>홈</span></a>
      <a href="/app/command-center" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Terminal className="w-4 h-4 shrink-0" /><span>커맨드센터</span></a>
      <a href="/app/chat" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><MessageSquare className="w-4 h-4 shrink-0" /><span>AI 채팅</span></a>
      <a href="/app/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><LayoutDashboard className="w-4 h-4 shrink-0" /><span>대시보드</span></a>
      <a href="/app/agents" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Bot className="w-4 h-4 shrink-0" /><span>에이전트</span></a>
      <a href="/app/departments" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Building2 className="w-4 h-4 shrink-0" /><span>부서</span></a>
      <a href="/app/nexus" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Network className="w-4 h-4 shrink-0" /><span>넥서스</span></a>
      <div className="pt-2 pb-1"><p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-3">업무 도구</p></div>
      <a href="/app/trading" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><TrendingUp className="w-4 h-4 shrink-0" /><span>트레이딩</span></a>
      <a href="/app/agora" className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-violet-50 text-violet-700 font-medium text-sm"><Users className="w-4 h-4 shrink-0" /><span>아고라</span></a>
      <a href="/app/sns" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Share2 className="w-4 h-4 shrink-0" /><span>SNS</span></a>
      <a href="/app/messenger" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><MessageCircle className="w-4 h-4 shrink-0" /><span>메신저</span></a>
      <div className="pt-2 pb-1"><p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-3">자산 관리</p></div>
      <a href="/app/knowledge" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><BookOpen className="w-4 h-4 shrink-0" /><span>지식베이스</span></a>
      <a href="/app/files" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Folder className="w-4 h-4 shrink-0" /><span>파일</span></a>
      <div className="pt-2 pb-1"><p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-3">운영</p></div>
      <a href="/app/reports" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><FileBarChart className="w-4 h-4 shrink-0" /><span>보고서</span></a>
      <a href="/app/ops-log" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Scroll className="w-4 h-4 shrink-0" /><span>운영 로그</span></a>
      <a href="/app/jobs" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Briefcase className="w-4 h-4 shrink-0" /><span>채용</span></a>
      <a href="/app/costs" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Receipt className="w-4 h-4 shrink-0" /><span>비용</span></a>
      <a href="/app/activity-log" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Activity className="w-4 h-4 shrink-0" /><span>활동 로그</span></a>
      <a href="/app/performance" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><BarChart2 className="w-4 h-4 shrink-0" /><span>성과 관리</span></a>
      <div className="pt-2 pb-1"><p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-3">보안</p></div>
      <a href="/app/argos" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Eye className="w-4 h-4 shrink-0" /><span>아르고스</span></a>
      <a href="/app/classified" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Shield className="w-4 h-4 shrink-0" /><span>기밀</span></a>
      <a href="/app/credentials" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Key className="w-4 h-4 shrink-0" /><span>자격증명</span></a>
      <a href="/app/notifications" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Bell className="w-4 h-4 shrink-0" /><span>알림</span></a>
      <a href="/app/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Settings className="w-4 h-4 shrink-0" /><span>설정</span></a>
    </nav>
    <div className="px-4 py-3 border-t border-stone-100">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center shrink-0">
          <span className="text-violet-700 font-semibold text-xs font-display">김</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-800 font-display truncate">김대표</p>
          <p className="text-[11px] text-stone-500 truncate">kim@acme.co.kr</p>
        </div>
      </div>
    </div>
  </aside>

  {/* Main Content */}
  <main className="ml-60 min-h-screen">

    {/* Page Header */}
    {/* API: GET /api/workspace/debates */}
    <div className="border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
          <Users className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <h1 className="font-display font-bold text-stone-900 text-lg leading-tight">아고라</h1>
          <p className="text-stone-500 text-xs">AI 에이전트 다자 토론 플랫폼</p>
        </div>
      </div>
      {/* API: POST /api/workspace/debates */}
      <button onClick="document.getElementById('debate-modal').classList.remove('hidden')" className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 shadow-sm">
        <Plus className="w-4 h-4" />
        새 토론 시작
      </button>
    </div>

    <div className="p-6 space-y-5">

      {/* Active Debate Banner */}
      {/* API: GET /api/workspace/debates/{id} */}
      <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
        <div className="bg-orange-50 px-4 py-2.5 flex items-center justify-between border-b border-orange-200">
          <div className="flex items-center gap-2">
            <div className="relative w-3 h-3">
              <div className="w-3 h-3 rounded-full bg-orange-500 absolute inset-0"></div>
              <div className="w-3 h-3 rounded-full bg-orange-400 live-ring absolute inset-0"></div>
            </div>
            <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">LIVE — 토론 진행중</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-orange-600 font-medium">3라운드 중 2라운드</span>
            <div className="flex gap-1">
              <div className="w-5 h-1.5 rounded-full bg-orange-400"></div>
              <div className="w-5 h-1.5 rounded-full bg-orange-400"></div>
              <div className="w-5 h-1.5 rounded-full bg-orange-200"></div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="font-display font-bold text-stone-900 text-base mb-1">내년 1분기 마케팅 예산 배분 전략</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-500">참여 에이전트</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[11px] font-semibold text-emerald-700">박준형 찬성</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    <span className="text-[11px] font-semibold text-red-600">이소연 반대</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-50 border border-stone-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-500"></div>
                    <span className="text-[11px] font-semibold text-stone-600">김재원 중립</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 shrink-0 ml-4">
              상세 보기
            </button>
          </div>

          {/* Live Speech Feed */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-red-600">이</span>
              </div>
              <div className="flex-1 bg-stone-50 rounded-xl rounded-tl-none p-3 border border-stone-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-stone-800">이소연</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 font-medium border border-red-100">반대 입장</span>
                  <span className="text-[10px] text-stone-400 ml-auto">2라운드</span>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed">"디지털 광고 예산 40% 증가 제안은 현재 시장 포화 상태를 고려할 때 ROI 대비 비효율적입니다. 오프라인 브랜딩 투자 비중을 최소 25%로 유지해야 장기 브랜드 자산을 보호할 수 있습니다."</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-emerald-700">박</span>
              </div>
              <div className="flex-1 bg-violet-50 rounded-xl rounded-tl-none p-3 border border-violet-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-stone-800">박준형</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">찬성 입장</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 pulse-dot"></div>
                    <span className="text-[10px] text-orange-600">발언 중</span>
                  </div>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed">"지난 분기 디지털 채널 전환율 데이터를 보면 ROI가 오프라인 대비 2.3배 높습니다. 타겟팅 정밀도 향상으로 예산 효율화가 가능하며..."</p>
                <div className="mt-2 flex gap-1">
                  <div className="h-1 w-2 bg-violet-400 rounded-full pulse-dot" style={{animationDelay: "0s"}}></div>
                  <div className="h-1.5 w-2 bg-violet-400 rounded-full pulse-dot" style={{animationDelay: "0.2s"}}></div>
                  <div className="h-2 w-2 bg-violet-400 rounded-full pulse-dot" style={{animationDelay: "0.4s"}}></div>
                  <div className="h-1.5 w-2 bg-violet-400 rounded-full pulse-dot" style={{animationDelay: "0.6s"}}></div>
                  <div className="h-1 w-2 bg-violet-400 rounded-full pulse-dot" style={{animationDelay: "0.8s"}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debate List Tabs & Cards */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="border-b border-stone-100 px-4 flex items-center gap-1 pt-3">
          <button className="px-3 pb-3 text-sm font-semibold text-stone-500 hover:text-stone-700 border-b-2 border-transparent hover:border-stone-300 transition-all duration-150">
            진행중 <span className="ml-1 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">1</span>
          </button>
          <button className="px-3 pb-3 text-sm font-semibold text-violet-600 border-b-2 border-violet-600 transition-all duration-150">
            완료 <span className="ml-1 px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">8</span>
          </button>
          <button className="px-3 pb-3 text-sm font-semibold text-stone-500 hover:text-stone-700 border-b-2 border-transparent hover:border-stone-300 transition-all duration-150">
            예약 <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">2</span>
          </button>
        </div>

        {/* Completed Debates */}
        {/* API: GET /api/workspace/debates */}
        <div className="divide-y divide-stone-100">

          {/* Debate Card 1 */}
          <div className="p-4 hover:bg-stone-50 transition-colors duration-150 cursor-pointer group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">합의 도달</span>
                  <span className="text-[11px] text-stone-400">3라운드</span>
                  <span className="text-[11px] text-stone-400">·</span>
                  <span className="text-[11px] text-stone-400">2일 전</span>
                </div>
                <h3 className="font-display font-semibold text-stone-800 text-sm group-hover:text-violet-700 transition-colors">2025년 SNS 콘텐츠 전략</h3>
                <p className="text-xs text-stone-500 mt-1">참여: 박준형, 이소연, 김재원, 최민지</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-[11px] text-stone-500">합의율</p>
                  <p className="text-sm font-display font-bold text-emerald-600">92%</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150">
                  보고서
                </button>
              </div>
            </div>
          </div>

          {/* Debate Card 2 */}
          <div className="p-4 hover:bg-stone-50 transition-colors duration-150 cursor-pointer group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200">의견 분분</span>
                  <span className="text-[11px] text-stone-400">5라운드</span>
                  <span className="text-[11px] text-stone-400">·</span>
                  <span className="text-[11px] text-stone-400">5일 전</span>
                </div>
                <h3 className="font-display font-semibold text-stone-800 text-sm group-hover:text-violet-700 transition-colors">신규 시장 진입 가능성 분석</h3>
                <p className="text-xs text-stone-500 mt-1">참여: 박준형, 이소연, 정우성</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-[11px] text-stone-500">합의율</p>
                  <p className="text-sm font-display font-bold text-amber-600">54%</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150">
                  보고서
                </button>
              </div>
            </div>
          </div>

          {/* Debate Card 3 */}
          <div className="p-4 hover:bg-stone-50 transition-colors duration-150 cursor-pointer group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">합의 도달</span>
                  <span className="text-[11px] text-stone-400">2라운드</span>
                  <span className="text-[11px] text-stone-400">·</span>
                  <span className="text-[11px] text-stone-400">1주 전</span>
                </div>
                <h3 className="font-display font-semibold text-stone-800 text-sm group-hover:text-violet-700 transition-colors">법인세 절감 방안</h3>
                <p className="text-xs text-stone-500 mt-1">참여: 김재원, 이소연, 나경아</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-[11px] text-stone-500">합의율</p>
                  <p className="text-sm font-display font-bold text-emerald-600">88%</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150">
                  보고서
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs text-stone-500">8개 중 3개 표시</span>
          <button className="text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors">전체 보기</button>
        </div>
      </div>
    </div>
  </main>

  {/* New Debate Modal */}
  {/* API: POST /api/workspace/debates */}
  <div id="debate-modal" className="hidden fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xl w-full max-w-lg">
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
        <h3 className="font-display font-bold text-stone-900 text-base">새 토론 시작</h3>
        <button onClick="document.getElementById('debate-modal').classList.add('hidden')" className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-stone-500" />
        </button>
      </div>
      <div className="p-5 space-y-4">
        {/* Topic */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5 block">토론 주제</label>
          <textarea rows="2" placeholder="토론할 주제를 입력하세요..." className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"></textarea>
        </div>
        {/* Agents */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-2 block">참여 에이전트 선택</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-stone-200 hover:border-violet-300 cursor-pointer transition-colors">
              <input type="checkbox" checked className="w-3.5 h-3.5 accent-violet-600" />
              <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-emerald-700">박</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-stone-800 truncate">박준형</p>
                <p className="text-[10px] text-stone-400">마케팅팀장</p>
              </div>
            </label>
            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-stone-200 hover:border-violet-300 cursor-pointer transition-colors">
              <input type="checkbox" checked className="w-3.5 h-3.5 accent-violet-600" />
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-red-600">이</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-stone-800 truncate">이소연</p>
                <p className="text-[10px] text-stone-400">재무분석가</p>
              </div>
            </label>
            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-stone-200 hover:border-violet-300 cursor-pointer transition-colors">
              <input type="checkbox" checked className="w-3.5 h-3.5 accent-violet-600" />
              <div className="w-5 h-5 bg-stone-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-stone-600">김</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-stone-800 truncate">김재원</p>
                <p className="text-[10px] text-stone-400">전략기획자</p>
              </div>
            </label>
            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-stone-200 hover:border-violet-300 cursor-pointer transition-colors">
              <input type="checkbox" className="w-3.5 h-3.5 accent-violet-600" />
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-blue-600">최</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-stone-800 truncate">최민지</p>
                <p className="text-[10px] text-stone-400">법무팀장</p>
              </div>
            </label>
          </div>
        </div>
        {/* Rounds */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5 block">라운드 수</label>
          <div className="flex gap-2">
            <button className="flex-1 py-2 rounded-lg border border-stone-200 hover:border-violet-300 text-sm text-stone-700 hover:text-violet-700 transition-all duration-150">2</button>
            <button className="flex-1 py-2 rounded-lg border border-violet-400 bg-violet-50 text-violet-700 font-semibold text-sm">3</button>
            <button className="flex-1 py-2 rounded-lg border border-stone-200 hover:border-violet-300 text-sm text-stone-700 hover:text-violet-700 transition-all duration-150">5</button>
            <button className="flex-1 py-2 rounded-lg border border-stone-200 hover:border-violet-300 text-sm text-stone-700 hover:text-violet-700 transition-all duration-150">7</button>
          </div>
        </div>
      </div>
      <div className="flex gap-2 px-5 py-4 border-t border-stone-100">
        <button onClick="document.getElementById('debate-modal').classList.add('hidden')" className="flex-1 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150">취소</button>
        <button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-1.5">
          <Play className="w-3.5 h-3.5" />
          토론 시작
        </button>
      </div>
    </div>
  </div>
    </>
  );
}

export default AppAgora;
