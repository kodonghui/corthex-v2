"use client";
import React from "react";
import { Activity, AlertTriangle, BarChart2, Bell, BookOpen, Bookmark, Building2, Check, ChevronsUpDown, Clock, Copy, DollarSign, Download, Eye, FileText, Folder, GitBranch, History, Home, Info, Key, LayoutDashboard, Lock, Megaphone, MessageCircle, MessagesSquare, Pencil, ScrollText, Send, Settings, Share2, Square, Terminal, TrendingUp, Users } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1, h2, h3, h4, h5, h6, .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono, code, pre { font-family: 'JetBrains Mono', monospace; }
    @keyframes blink-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }
    .animate-blink { animation: blink-pulse 1.6s ease-in-out infinite; }
    @keyframes typing-dot {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-4px); opacity: 1; }
    }
    .typing-dot:nth-child(1) { animation: typing-dot 1.2s infinite 0s; }
    .typing-dot:nth-child(2) { animation: typing-dot 1.2s infinite 0.2s; }
    .typing-dot:nth-child(3) { animation: typing-dot 1.2s infinite 0.4s; }
`;

function AppCommandCenter() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* 사이드바 */}
<aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-10">
  <div className="h-14 flex items-center px-4 border-b border-stone-200">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">C</span>
      </div>
      <span className="font-bold text-stone-900 text-[15px]" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>CORTHEX</span>
    </div>
  </div>
  <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
    <div className="mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 px-3 mb-2">워크스페이스</p>
      <a href="/app/home" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 font-normal transition-colors duration-150 group">
        <Home className="w-4 h-4 flex-shrink-0" /><span>홈</span>
      </a>
      <a href="/app/command-center" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm bg-violet-50 text-violet-700 font-medium group">
        <Terminal className="w-4 h-4 flex-shrink-0" /><span>사령관실</span>
      </a>
      <a href="/app/chat" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150 group">
        <MessageCircle className="w-4 h-4 flex-shrink-0" /><span>채팅</span>
      </a>
      <a href="/app/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150 group">
        <LayoutDashboard className="w-4 h-4 flex-shrink-0" /><span>대시보드</span>
      </a>
    </div>
    <div className="mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 px-3 mb-2">조직</p>
      <a href="/app/agents" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Users className="w-4 h-4" /><span>에이전트</span>
      </a>
      <a href="/app/departments" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Building2 className="w-4 h-4" /><span>부서</span>
      </a>
      <a href="/app/nexus" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <GitBranch className="w-4 h-4" /><span>조직도 (Nexus)</span>
      </a>
    </div>
    <div className="mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 px-3 mb-2">업무 도구</p>
      <a href="/app/trading" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <TrendingUp className="w-4 h-4" /><span>트레이딩</span>
      </a>
      <a href="/app/agora" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Megaphone className="w-4 h-4" /><span>아고라</span>
      </a>
      <a href="/app/sns" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Share2 className="w-4 h-4" /><span>SNS</span>
      </a>
      <a href="/app/messenger" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <MessagesSquare className="w-4 h-4" /><span>메신저</span>
      </a>
      <a href="/app/knowledge" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <BookOpen className="w-4 h-4" /><span>지식베이스</span>
      </a>
      <a href="/app/files" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Folder className="w-4 h-4" /><span>파일</span>
      </a>
    </div>
    <div className="mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 px-3 mb-2">기록 &amp; 분석</p>
      <a href="/app/reports" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <FileText className="w-4 h-4" /><span>보고서</span>
      </a>
      <a href="/app/ops-log" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <ScrollText className="w-4 h-4" /><span>작전일지</span>
      </a>
      <a href="/app/jobs" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Clock className="w-4 h-4" /><span>예약 작업</span>
      </a>
      <a href="/app/costs" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <DollarSign className="w-4 h-4" /><span>비용</span>
      </a>
      <a href="/app/activity-log" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Activity className="w-4 h-4" /><span>활동 로그</span>
      </a>
      <a href="/app/performance" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <BarChart2 className="w-4 h-4" /><span>전력분석</span>
      </a>
      <a href="/app/argos" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Eye className="w-4 h-4" /><span>아르고스</span>
      </a>
      <a href="/app/classified" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Lock className="w-4 h-4" /><span>기밀문서</span>
      </a>
    </div>
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 px-3 mb-2">설정</p>
      <a href="/app/credentials" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Key className="w-4 h-4" /><span>크리덴셜</span>
      </a>
      <a href="/app/notifications" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Bell className="w-4 h-4" /><span>알림</span>
      </a>
      <a href="/app/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors">
        <Settings className="w-4 h-4" /><span>설정</span>
      </a>
    </div>
  </nav>
  <div className="p-3 border-t border-stone-200">
    <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-stone-100 cursor-pointer transition-colors">
      <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-violet-700 font-semibold text-xs">김</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-stone-800 truncate">김대표</p>
        <p className="text-[10px] text-stone-400 truncate">kim@acme.co.kr</p>
      </div>
      <ChevronsUpDown className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
    </div>
  </div>
</aside>

{/* 메인 */}
<div className="ml-60 min-h-screen bg-stone-50 flex flex-col">

  {/* 헤더 */}
  {/* API: GET /api/workspace/command-center/summary */}
  <header className="h-14 bg-white border-b border-stone-200 flex items-center px-6 sticky top-0 z-10 flex-shrink-0">
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>사령관실</span>
        <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5 text-xs font-medium">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-blink"></span>
          실행 중 3개
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button className="bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 flex items-center gap-2">
          <History className="w-4 h-4" /> 히스토리
        </button>
        <button className="bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 flex items-center gap-2">
          <Bookmark className="w-4 h-4" /> 프리셋 저장
        </button>
      </div>
    </div>
  </header>

  {/* 2분할 본문 */}
  <div className="flex flex-1 overflow-hidden" style={{height: "calc(100vh - 56px)"}}>

    {/* 좌측 패널 40% — 명령 입력 + 히스토리 */}
    <div className="w-[40%] flex flex-col border-r border-stone-200 bg-white overflow-hidden">

      {/* 명령 입력 영역 */}
      {/* API: POST /api/workspace/command-center/commands */}
      <div className="p-5 border-b border-stone-100">
        <label className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-2 block">명령 입력</label>
        <textarea
          rows="4"
          placeholder="김대표님, 어떤 명령을 내리시겠습니까?&#10;&#10;예: 오늘의 주요 마케팅 키워드를 분석하고, 인스타그램과 트위터에 올릴 게시물 각 2개씩 작성해줘."
          className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-stone-800 placeholder-stone-400 resize-none leading-relaxed"
        ></textarea>

        {/* 퀵 프리셋 */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <p className="text-[10px] text-stone-400 self-center w-full mb-0.5">빠른 프리셋</p>
          <button className="bg-stone-50 hover:bg-violet-50 hover:border-violet-200 border border-stone-200 text-stone-600 hover:text-violet-700 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-150">
            📊 마케팅 분석
          </button>
          <button className="bg-stone-50 hover:bg-violet-50 hover:border-violet-200 border border-stone-200 text-stone-600 hover:text-violet-700 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-150">
            💰 투자 검토
          </button>
          <button className="bg-stone-50 hover:bg-violet-50 hover:border-violet-200 border border-stone-200 text-stone-600 hover:text-violet-700 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-150">
            📱 SNS 작성
          </button>
          <button className="bg-stone-50 hover:bg-violet-50 hover:border-violet-200 border border-stone-200 text-stone-600 hover:text-violet-700 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-150">
            🔍 경쟁사 분석
          </button>
          <button className="bg-stone-50 hover:bg-violet-50 hover:border-violet-200 border border-stone-200 text-stone-600 hover:text-violet-700 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-150">
            📋 보고서 생성
          </button>
          <button className="bg-stone-50 hover:bg-violet-50 hover:border-violet-200 border border-stone-200 text-stone-600 hover:text-violet-700 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-150">
            ⚖️ 법무 검토
          </button>
        </div>

        {/* 에이전트 선택 + 실행 버튼 */}
        <div className="flex gap-2 mt-4">
          <select className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-stone-700 bg-white">
            <option value="">자동 선택 (비서실장이 위임)</option>
            <option value="nak">이나경 (비서실장)</option>
            <option value="junhyung">박준형 (마케팅팀장)</option>
            <option value="jaewon">김재원 (투자분석가)</option>
            <option value="soyeon">이소연 (법무전문가)</option>
            <option value="minji">최민지 (카피라이터)</option>
          </select>
          <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 flex items-center gap-2 whitespace-nowrap">
            <Send className="w-4 h-4" /> 명령 실행
          </button>
        </div>
      </div>

      {/* API: GET /api/workspace/command-center/summary */}
      {/* 최근 명령 히스토리 */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">최근 명령</p>
          <button className="text-xs text-stone-400 hover:text-stone-600 transition-colors">전체 보기</button>
        </div>

        {/* 명령 항목들 — 클릭 시 우측에 결과 표시 */}
        <div className="divide-y divide-stone-100">

          {/* 명령 1 — 현재 선택됨 */}
          <div className="px-5 py-3.5 bg-violet-50 border-l-2 border-violet-600 cursor-pointer hover:bg-violet-100 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-xs font-medium text-violet-800 leading-snug line-clamp-2">3월 마케팅 트렌드 분석 후 인스타·트위터 각 2개씩 게시물 작성</p>
              <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 rounded-full px-2 py-0.5 text-[10px] font-medium flex-shrink-0">
                <span className="w-1 h-1 bg-orange-500 rounded-full animate-blink"></span> 진행 중
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-stone-400">
              <span>이나경 → 박준형 → 최민지</span>
              <span>·</span>
              <span>14:23</span>
            </div>
          </div>

          {/* 명령 2 */}
          <div className="px-5 py-3.5 cursor-pointer hover:bg-stone-50 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-xs font-medium text-stone-700 leading-snug line-clamp-2">KOSPI 200 포트폴리오 리밸런싱 분석 — 기술주 비중 조정 검토</p>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[10px] font-medium flex-shrink-0">
                완료
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-stone-400">
              <span>이나경 → 김재원</span>
              <span>·</span>
              <span>11:47 · $1.82</span>
            </div>
          </div>

          {/* 명령 3 */}
          <div className="px-5 py-3.5 cursor-pointer hover:bg-stone-50 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-xs font-medium text-stone-700 leading-snug line-clamp-2">신규 SaaS 계약서 법무 검토 및 리스크 항목 3가지 정리</p>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[10px] font-medium flex-shrink-0">
                완료
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-stone-400">
              <span>이나경 → 이소연</span>
              <span>·</span>
              <span>어제 16:30 · $0.95</span>
            </div>
          </div>

          {/* 명령 4 */}
          <div className="px-5 py-3.5 cursor-pointer hover:bg-stone-50 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-xs font-medium text-stone-700 leading-snug line-clamp-2">경쟁사 A사, B사 최신 마케팅 캠페인 비교 분석 보고서</p>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[10px] font-medium flex-shrink-0">
                완료
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-stone-400">
              <span>이나경 → 박준형</span>
              <span>·</span>
              <span>어제 10:15 · $0.68</span>
            </div>
          </div>

          {/* 명령 5 */}
          <div className="px-5 py-3.5 cursor-pointer hover:bg-stone-50 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-xs font-medium text-stone-700 leading-snug line-clamp-2">2026년 2월 전체 업무 보고서 자동 생성</p>
              <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 rounded-full px-2 py-0.5 text-[10px] font-medium flex-shrink-0">
                오류
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-stone-400">
              <span>이나경 → 한지훈</span>
              <span>·</span>
              <span>2일 전 · 토큰 한도 초과</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    {/* 우측 패널 60% — 실행 결과 + 위임 체인 */}
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">

      {/* 우측 헤더 */}
      <div className="px-6 py-3.5 bg-white border-b border-stone-200 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-sm font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
            3월 마케팅 트렌드 분석 + SNS 게시물 작성
          </p>
          <p className="text-xs text-stone-400 mt-0.5">실행 시작: 2026-03-10 14:23:07 · 경과 4분 12초</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-blink"></span>
            위임체인 실행 중
          </span>
          <button className="bg-white border border-stone-200 hover:border-red-200 hover:bg-red-50 text-stone-600 hover:text-red-600 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 flex items-center gap-1.5">
            <Square className="w-3.5 h-3.5" /> 중단
          </button>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* 위임 체인 시각화 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-stone-900 mb-4" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>위임 체인</h3>

          <div className="relative">
            {/* 연결선 */}
            <div className="absolute left-[19px] top-10 bottom-10 w-0.5 bg-stone-100"></div>

            {/* 단계 1: 비서실장 — 완료 */}
            <div className="relative flex items-start gap-4 mb-5">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-emerald-300 z-10">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-stone-900">이나경 · 비서실장</p>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[10px] font-medium">완료</span>
                  <span className="text-[10px] text-stone-400 ml-auto">14:23 — 14:24 (52초)</span>
                </div>
                <div className="bg-stone-50 rounded-lg px-3 py-2 border border-stone-100">
                  <p className="text-xs text-stone-600 leading-relaxed">명령을 분석하였습니다. 마케팅 트렌드 분석은 박준형 팀장에게, SNS 게시물 최종 작성은 최민지 카피라이터에게 순차 위임합니다.</p>
                </div>
              </div>
            </div>

            {/* 단계 2: 마케팅팀장 — 완료 */}
            <div className="relative flex items-start gap-4 mb-5">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-emerald-300 z-10">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-stone-900">박준형 · 마케팅팀장</p>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[10px] font-medium">완료</span>
                  <span className="text-[10px] text-stone-400 ml-auto">14:24 — 14:26 (2분 3초)</span>
                </div>
                <div className="bg-stone-50 rounded-lg px-3 py-2 border border-stone-100">
                  <p className="text-xs text-stone-600 leading-relaxed">3월 주요 키워드: <span className="font-mono text-violet-700">#AI마케팅</span>, <span className="font-mono text-violet-700">#퍼소나기반타겟팅</span>, <span className="font-mono text-violet-700">#숏폼콘텐츠</span>. 인스타는 비주얼 중심, 트위터는 정보성 톤 권장. 최민지 카피라이터에게 전달합니다.</p>
                </div>
              </div>
            </div>

            {/* 단계 3: 카피라이터 — 진행 중 */}
            <div className="relative flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-orange-300 z-10 animate-blink">
                <Pencil className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-stone-900">최민지 · 카피라이터</p>
                  <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 rounded-full px-2 py-0.5 text-[10px] font-medium">
                    <span className="w-1 h-1 bg-orange-500 rounded-full animate-blink"></span> 작성 중
                  </span>
                  <span className="text-[10px] text-stone-400 ml-auto">14:27 시작 —</span>
                </div>
                <div className="bg-orange-50 rounded-lg px-3 py-2.5 border border-orange-100">
                  <p className="text-xs text-orange-700 mb-1.5 font-medium">claude-3-5-haiku-20241022로 게시물 생성 중...</p>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-orange-400 rounded-full typing-dot"></span>
                    <span className="w-2 h-2 bg-orange-400 rounded-full typing-dot"></span>
                    <span className="w-2 h-2 bg-orange-400 rounded-full typing-dot"></span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* AI 응답 결과 — 완료된 보고서 형태 (이전 실행 결과 미리보기) */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>이전 결과 — KOSPI 200 투자 분석 (완료)</h3>
            <div className="flex items-center gap-2">
              <button className="bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> PDF 저장
              </button>
              <button className="bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5" /> 복사
              </button>
            </div>
          </div>

          {/* 보고서 내용 */}
          <div className="space-y-4">
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-4">
              <p className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1">종합 의견</p>
              <p className="text-sm text-violet-900 leading-relaxed">현재 포트폴리오의 기술주 비중(34%)은 시장 평균 대비 4%p 높습니다. 단기 변동성 완충을 위해 <strong>기술주 → 배당주 비중을 28% : 22%로 조정</strong>을 권장합니다.</p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-2">섹터별 현황</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-600 w-20 flex-shrink-0">반도체</span>
                  <div className="flex-1 bg-stone-100 rounded-full h-2">
                    <div className="bg-violet-500 h-2 rounded-full" style={{width: "34%"}}></div>
                  </div>
                  <span className="text-xs font-medium text-stone-700 w-8 text-right">34%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-600 w-20 flex-shrink-0">소비재</span>
                  <div className="flex-1 bg-stone-100 rounded-full h-2">
                    <div className="bg-violet-400 h-2 rounded-full" style={{width: "22%"}}></div>
                  </div>
                  <span className="text-xs font-medium text-stone-700 w-8 text-right">22%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-600 w-20 flex-shrink-0">바이오</span>
                  <div className="flex-1 bg-stone-100 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full" style={{width: "18%"}}></div>
                  </div>
                  <span className="text-xs font-medium text-stone-700 w-8 text-right">18%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-600 w-20 flex-shrink-0">금융</span>
                  <div className="flex-1 bg-stone-100 rounded-full h-2">
                    <div className="bg-amber-400 h-2 rounded-full" style={{width: "16%"}}></div>
                  </div>
                  <span className="text-xs font-medium text-stone-700 w-8 text-right">16%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-600 w-20 flex-shrink-0">기타</span>
                  <div className="flex-1 bg-stone-100 rounded-full h-2">
                    <div className="bg-stone-400 h-2 rounded-full" style={{width: "10%"}}></div>
                  </div>
                  <span className="text-xs font-medium text-stone-700 w-8 text-right">10%</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-2">리스크 요인 3가지</p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2.5 p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">미국 금리 동결 장기화 시 고PER 기술주 밸류에이션 압박 가능</p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">중국 수출 규제 확대 시 반도체 섹터 단기 충격 예상 (최대 -8%)</p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-stone-50 border border-stone-100 rounded-lg">
                  <Info className="w-3.5 h-3.5 text-stone-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-stone-600 leading-relaxed">원/달러 환율 1,450원 돌파 시 수입 원가 상승으로 소비재 마진 축소 우려</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <p className="text-xs text-stone-400">김재원 · claude-3-opus-20240229 · 토큰 12,847개 · $1.82</p>
              <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> 보고서 저장
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</div>
    </>
  );
}

export default AppCommandCenter;
