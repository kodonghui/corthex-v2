"use client";
import React from "react";
import { Activity, ArrowDown, ArrowUp, BarChart2, Bell, BookOpen, Bot, Brain, Briefcase, Building2, Check, ChevronRight, Clock, Eye, FileBarChart, Folder, Home, Key, LayoutDashboard, MessageCircle, MessageSquare, Network, Receipt, Scroll, Settings, Share2, Shield, Terminal, TrendingUp, Users, X, Zap } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4,h5,h6,.font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    @keyframes pulse-glow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .pulse-dot { animation: pulse-glow 1.4s ease-in-out infinite; }`;

function AppTrading() {
  return (
    <>      
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
      <a href="/app/trading" className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-violet-50 text-violet-700 font-medium text-sm"><TrendingUp className="w-4 h-4 shrink-0" /><span>트레이딩</span></a>
      <a href="/app/agora" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Users className="w-4 h-4 shrink-0" /><span>아고라</span></a>
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
  <main className="ml-60 min-h-screen flex flex-col">

    {/* Page Header */}
    <div className="border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <h1 className="font-display font-bold text-stone-900 text-lg leading-tight">트레이딩</h1>
          <p className="text-stone-500 text-xs">KIS 자동매매 · AI 포트폴리오 관리</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* API: GET /api/workspace/strategy/cio/status */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 pulse-dot"></span>
          모의거래
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold border border-violet-200">
          <Zap className="w-3 h-3" />
          자율 실행
        </span>
        <button className="flex items-center gap-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150">
          <Settings className="w-3.5 h-3.5" />
          설정
        </button>
      </div>
    </div>

    {/* 2-Column Layout */}
    <div className="flex flex-1 overflow-hidden">

      {/* Left Panel: Portfolio 40% */}
      <div className="w-[40%] border-r border-stone-200 bg-white overflow-y-auto">
        <div className="p-5 space-y-4">

          {/* Portfolio Summary */}
          {/* API: GET /api/workspace/strategy/portfolio */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 hover:border-violet-200 hover:shadow-md transition-all duration-150">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-3">포트폴리오 요약</p>
            <p className="text-2xl font-display font-bold text-stone-900 mb-0.5">₩142,500,000</p>
            <p className="text-xs text-stone-500 mb-3">총 평가금액</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wide mb-1">총 손익</p>
                <p className="text-base font-display font-bold text-emerald-700">+₩8,320,000</p>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">+6.2%</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wide mb-1">오늘 손익</p>
                <p className="text-base font-display font-bold text-emerald-700">+₩1,240,000</p>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">오늘 기준</p>
              </div>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden hover:border-violet-200 hover:shadow-md transition-all duration-150">
            <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">보유 종목</p>
              <span className="text-xs text-stone-400">5종목</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="text-left px-4 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">종목</th>
                  <th className="text-right px-3 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">수량</th>
                  <th className="text-right px-3 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">현재가</th>
                  <th className="text-right px-3 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">등락</th>
                  <th className="text-right px-4 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">평가금</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-blue-600">삼</span>
                      </div>
                      <span className="text-xs font-medium text-stone-800">삼성전자</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-stone-600">100주</td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-stone-700">₩75,800</td>
                  <td className="px-3 py-2.5 text-right"><span className="text-emerald-600 text-xs font-semibold">+2.4%</span></td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs font-medium text-stone-800">₩7,580,000</td>
                </tr>
                <tr className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-50 rounded-md flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-green-600">N</span>
                      </div>
                      <span className="text-xs font-medium text-stone-800">NVIDIA</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-stone-600">15주</td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-stone-700">$875.20</td>
                  <td className="px-3 py-2.5 text-right"><span className="text-red-500 text-xs font-semibold">-1.1%</span></td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs font-medium text-stone-800">$13,128</td>
                </tr>
                <tr className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-50 rounded-md flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-yellow-600">카</span>
                      </div>
                      <span className="text-xs font-medium text-stone-800">카카오</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-stone-600">200주</td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-stone-700">₩52,300</td>
                  <td className="px-3 py-2.5 text-right"><span className="text-emerald-600 text-xs font-semibold">+0.8%</span></td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs font-medium text-stone-800">₩10,460,000</td>
                </tr>
                <tr className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-50 rounded-md flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-orange-600">SK</span>
                      </div>
                      <span className="text-xs font-medium text-stone-800">SK하이닉스</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-stone-600">50주</td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-stone-700">₩168,400</td>
                  <td className="px-3 py-2.5 text-right"><span className="text-emerald-600 text-xs font-semibold">+3.2%</span></td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs font-medium text-stone-800">₩8,420,000</td>
                </tr>
                <tr className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-50 rounded-md flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-purple-600">T</span>
                      </div>
                      <span className="text-xs font-medium text-stone-800">TSMC</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-stone-600">20주</td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-stone-700">$165.40</td>
                  <td className="px-3 py-2.5 text-right"><span className="text-emerald-600 text-xs font-semibold">+1.5%</span></td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs font-medium text-stone-800">$3,308</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-3 text-center hover:border-violet-200 transition-all duration-150">
              <p className="text-xs text-stone-500 mb-1">오늘 거래</p>
              <p className="font-display font-bold text-stone-900 text-sm">3건</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-3 text-center hover:border-violet-200 transition-all duration-150">
              <p className="text-xs text-stone-500 mb-1">대기 주문</p>
              <p className="font-display font-bold text-amber-600 text-sm">2건</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-3 text-center hover:border-violet-200 transition-all duration-150">
              <p className="text-xs text-stone-500 mb-1">AI 전략</p>
              <p className="font-display font-bold text-violet-600 text-sm">활성</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: AI Analysis 60% */}
      <div className="flex-1 overflow-y-auto bg-stone-50">
        <div className="p-5">

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white rounded-xl border border-stone-200 p-1 mb-5 shadow-sm">
            <button className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold">AI 분석</button>
            <button className="flex-1 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm font-medium transition-all duration-150">
              대기 주문 <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">2</span>
            </button>
            <button className="flex-1 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm font-medium transition-all duration-150">거래 이력</button>
          </div>

          <div className="space-y-4">

            {/* CIO Pipeline */}
            {/* API: GET /api/workspace/strategy/cio/status */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">CIO 에이전트 분석 파이프라인</p>
                <span className="text-xs text-stone-400">14분 전 실행</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                  <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-semibold text-emerald-700">시장 분석</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">완료</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 shrink-0" />
                <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 pulse-dot"></div>
                  </div>
                  <p className="text-xs font-semibold text-amber-700">종목 선정</p>
                  <p className="text-[10px] text-amber-600 mt-0.5">진행중</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 shrink-0" />
                <div className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
                  <div className="w-7 h-7 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                  </div>
                  <p className="text-xs font-semibold text-stone-500">주문 실행</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">대기</p>
                </div>
              </div>
            </div>

            {/* Analysis Report */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 hover:border-violet-200 hover:shadow-md transition-all duration-150">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800 font-display">CIO 분석 보고서</p>
                  <p className="text-xs text-stone-500">2026.03.10 오후 2:31 생성</p>
                </div>
              </div>
              <div className="bg-stone-50 rounded-lg p-3 border border-stone-100 mb-3">
                <p className="text-sm text-stone-700 leading-relaxed">현재 시장 변동성 확대 구간으로, VIX 지수가 전일 대비 8.3% 상승했습니다. 기술주 섹터 내 NVIDIA는 AI 칩 수요 증가로 저점 매수 기회가 포착되었으며, 삼성전자는 HBM 공급 계약 이슈로 단기 조정 가능성이 있습니다. <strong className="text-stone-900">NVIDIA 추가 매수 제안</strong> — 목표가 $920 (현재 대비 +5.1%).</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-medium border border-blue-100">시장 변동성↑</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-medium border border-emerald-100">AI 섹터 강세</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-medium border border-amber-100">반도체 주의</span>
              </div>
            </div>

            {/* Proposed Orders */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">AI 제안 주문</p>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200">승인 대기 2건</span>
              </div>
              <div className="divide-y divide-stone-100">

                {/* Order 1: NVIDIA Buy */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center">
                        <ArrowUp className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-display font-bold text-stone-900 text-sm">NVIDIA</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">매수</span>
                        </div>
                        <p className="text-xs text-stone-500">10주 · 시장가 $875 · 예상 $8,750</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-stone-500 mb-0.5">신뢰도</p>
                      <p className="text-sm font-display font-bold text-emerald-600">84%</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />승인
                    </button>
                    <button className="flex-1 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 flex items-center justify-center gap-1.5">
                      <X className="w-3.5 h-3.5" />거절
                    </button>
                  </div>
                </div>

                {/* Order 2: Samsung Sell */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                        <ArrowDown className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-display font-bold text-stone-900 text-sm">삼성전자</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-semibold border border-red-200">매도</span>
                        </div>
                        <p className="text-xs text-stone-500">50주 · ₩75,800 · 예상 ₩3,790,000</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-stone-500 mb-0.5">신뢰도</p>
                      <p className="text-sm font-display font-bold text-amber-600">67%</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />승인
                    </button>
                    <button className="flex-1 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 flex items-center justify-center gap-1.5">
                      <X className="w-3.5 h-3.5" />거절
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Run AI Button */}
            {/* API: POST /api/workspace/strategy/cio/run */}
            <button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 shadow-sm">
              <Brain className="w-4 h-4" />
              AI 분석 실행
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
    </>
  );
}

export default AppTrading;
