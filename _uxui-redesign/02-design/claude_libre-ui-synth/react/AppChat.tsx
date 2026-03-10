"use client";
import React from "react";
import { Activity, BarChart2, Bell, BookOpen, Building2, ChevronsUpDown, Clock, DollarSign, Download, Eye, FileText, Folder, GitBranch, Home, Image, Key, LayoutDashboard, Lock, Megaphone, MessageCircle, MessagesSquare, MoreHorizontal, Paperclip, Plus, ScrollText, Search, Send, Settings, Share2, Terminal, TrendingUp, Users, X } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1, h2, h3, h4, h5, h6, .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono, code, pre { font-family: 'JetBrains Mono', monospace; }
    @keyframes blink-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }
    .animate-blink { animation: blink-pulse 2s ease-in-out infinite; }
    @keyframes typing-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-5px); opacity: 1; }
    }
    .typing-dot:nth-child(1) { animation: typing-bounce 1.2s infinite 0s; }
    .typing-dot:nth-child(2) { animation: typing-bounce 1.2s infinite 0.2s; }
    .typing-dot:nth-child(3) { animation: typing-bounce 1.2s infinite 0.4s; }
    /* 채팅 스크롤바 */
    .chat-scroll::-webkit-scrollbar { width: 4px; }
    .chat-scroll::-webkit-scrollbar-track { background: transparent; }
    .chat-scroll::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 2px; }
    .chat-scroll::-webkit-scrollbar-thumb:hover { background: #d6d3d1; }
    /* 에이전트 목록 스크롤바 */
    .list-scroll::-webkit-scrollbar { width: 3px; }
    .list-scroll::-webkit-scrollbar-track { background: transparent; }
    .list-scroll::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 2px; }
`;

function AppChat() {
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
      <a href="/app/command-center" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 font-normal transition-colors duration-150 group">
        <Terminal className="w-4 h-4 flex-shrink-0" /><span>사령관실</span>
      </a>
      <a href="/app/chat" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm bg-violet-50 text-violet-700 font-medium group">
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

{/* 메인: 3분할 레이아웃 */}
<div className="ml-60 flex" style={{height: "100vh"}}>

  {/* API: GET /api/workspace/chat/sessions */}
  {/* 좌측: 에이전트 목록 (200px) */}
  <div className="w-[200px] flex-shrink-0 bg-white border-r border-stone-200 flex flex-col">
    {/* 헤더 */}
    <div className="h-14 flex items-center px-3 border-b border-stone-200">
      <p className="text-sm font-semibold text-stone-900 flex-1" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>채팅</p>
      <button className="w-7 h-7 bg-violet-600 hover:bg-violet-700 rounded-lg flex items-center justify-center transition-colors">
        <Plus className="w-3.5 h-3.5 text-white" />
      </button>
    </div>

    {/* 검색 */}
    <div className="p-2 border-b border-stone-100">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
        <input
          type="text"
          placeholder="에이전트 검색"
          className="w-full rounded-lg border border-stone-200 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-transparent text-stone-800 placeholder-stone-400 bg-stone-50"
        />
      </div>
    </div>

    {/* 에이전트 카드 목록 */}
    <div className="flex-1 overflow-y-auto list-scroll">

      {/* 이나경 — 현재 선택 */}
      <div className="px-3 py-3 bg-violet-50 border-l-2 border-violet-600 cursor-pointer hover:bg-violet-100 transition-colors">
        <div className="flex items-start gap-2.5">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 bg-violet-200 rounded-full flex items-center justify-center">
              <span className="text-violet-800 font-semibold text-sm">이</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white animate-blink"></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-violet-800 truncate">이나경</p>
              <span className="text-[9px] text-stone-400">방금</span>
            </div>
            <p className="text-[10px] text-stone-500 truncate">비서실장</p>
            <p className="text-[10px] text-stone-500 truncate mt-0.5">분석 중이에요. 잠시만...</p>
          </div>
        </div>
      </div>

      {/* 박준형 */}
      <div className="px-3 py-3 cursor-pointer hover:bg-stone-50 transition-colors border-l-2 border-transparent hover:border-stone-200">
        <div className="flex items-start gap-2.5">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-700 font-semibold text-sm">박</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-stone-800 truncate">박준형</p>
              <span className="text-[9px] text-stone-400">2시간</span>
            </div>
            <p className="text-[10px] text-stone-400 truncate">마케팅팀장</p>
            <p className="text-[10px] text-stone-400 truncate mt-0.5">네, 보고서 완성했습니다</p>
          </div>
        </div>
      </div>

      {/* 김재원 */}
      <div className="px-3 py-3 cursor-pointer hover:bg-stone-50 transition-colors border-l-2 border-transparent hover:border-stone-200">
        <div className="flex items-start gap-2.5">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-semibold text-sm">김</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white animate-blink"></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-stone-800 truncate">김재원</p>
              <div className="flex items-center gap-0.5">
                <span className="w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center text-[8px] text-white font-bold">2</span>
              </div>
            </div>
            <p className="text-[10px] text-stone-400 truncate">투자분석가</p>
            <p className="text-[10px] text-violet-600 truncate mt-0.5 font-medium">KOSPI 분석 결과 도착</p>
          </div>
        </div>
      </div>

      {/* 이소연 */}
      <div className="px-3 py-3 cursor-pointer hover:bg-stone-50 transition-colors border-l-2 border-transparent hover:border-stone-200">
        <div className="flex items-start gap-2.5">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-700 font-semibold text-sm">이</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-stone-800 truncate">이소연</p>
              <span className="text-[9px] text-stone-400">어제</span>
            </div>
            <p className="text-[10px] text-stone-400 truncate">법무전문가</p>
            <p className="text-[10px] text-stone-400 truncate mt-0.5">계약서 검토 완료했습니다</p>
          </div>
        </div>
      </div>

      {/* 최민지 */}
      <div className="px-3 py-3 cursor-pointer hover:bg-stone-50 transition-colors border-l-2 border-transparent hover:border-stone-200">
        <div className="flex items-start gap-2.5">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-amber-700 font-semibold text-sm">최</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white animate-blink"></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-stone-800 truncate">최민지</p>
              <span className="text-[9px] text-stone-400">4분</span>
            </div>
            <p className="text-[10px] text-stone-400 truncate">카피라이터</p>
            <p className="text-[10px] text-stone-400 truncate mt-0.5">SNS 초안 작성 완료!</p>
          </div>
        </div>
      </div>

      {/* 한지훈 */}
      <div className="px-3 py-3 cursor-pointer hover:bg-stone-50 transition-colors border-l-2 border-transparent hover:border-stone-200">
        <div className="flex items-start gap-2.5">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
              <span className="text-stone-500 font-semibold text-sm">한</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-stone-800 truncate">한지훈</p>
              <span className="text-[9px] text-stone-400">2일 전</span>
            </div>
            <p className="text-[10px] text-stone-400 truncate">데이터분석가</p>
            <p className="text-[10px] text-red-400 truncate mt-0.5">오류 발생 — 확인 필요</p>
          </div>
        </div>
      </div>

      {/* 정현우 */}
      <div className="px-3 py-3 cursor-pointer hover:bg-stone-50 transition-colors border-l-2 border-transparent hover:border-stone-200">
        <div className="flex items-start gap-2.5">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-700 font-semibold text-sm">정</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-stone-400 rounded-full border-2 border-white"></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-stone-800 truncate">정현우</p>
              <span className="text-[9px] text-stone-400">3일 전</span>
            </div>
            <p className="text-[10px] text-stone-400 truncate">콘텐츠 기획자</p>
            <p className="text-[10px] text-stone-400 truncate mt-0.5">월간 콘텐츠 캘린더 제출</p>
          </div>
        </div>
      </div>

    </div>
  </div>

  {/* 중앙: 채팅창 */}
  {/* API: POST /api/workspace/chat/{agentId}/messages */}
  <div className="flex-1 flex flex-col bg-stone-50 min-w-0">

    {/* 채팅 헤더 */}
    <div className="h-14 bg-white border-b border-stone-200 flex items-center px-5 flex-shrink-0">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative">
          <div className="w-8 h-8 bg-violet-200 rounded-full flex items-center justify-center">
            <span className="text-violet-800 font-semibold text-sm">이</span>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white animate-blink"></span>
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>이나경 · 비서실장</p>
          <p className="text-[10px] text-stone-400">작업 중 · claude-3-5-sonnet-20241022</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button className="text-stone-600 hover:bg-stone-100 rounded-lg px-3 py-1.5 text-sm transition-colors duration-150">
          <Search className="w-4 h-4" />
        </button>
        <button className="text-stone-600 hover:bg-stone-100 rounded-lg px-3 py-1.5 text-sm transition-colors duration-150">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>

    {/* 메시지 영역 */}
    <div className="flex-1 overflow-y-auto chat-scroll p-5 space-y-5">

      {/* 날짜 구분선 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-stone-200"></div>
        <span className="text-[10px] text-stone-400 font-medium">오늘 — 2026년 3월 10일</span>
        <div className="flex-1 h-px bg-stone-200"></div>
      </div>

      {/* 에이전트 메시지 1 */}
      <div className="flex items-end gap-2.5">
        <div className="w-7 h-7 bg-violet-200 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5">
          <span className="text-violet-800 font-semibold text-xs">이</span>
        </div>
        <div className="max-w-[70%]">
          <div className="bg-white rounded-xl rounded-bl-sm border border-stone-200 px-4 py-3 shadow-sm">
            <p className="text-sm text-stone-800 leading-relaxed">안녕하세요, 김대표님. 오늘 마케팅 트렌드 분석 명령을 받았습니다. 박준형 팀장에게 위임하여 3월 주요 키워드와 콘텐츠 전략을 정리하도록 하겠습니다.</p>
          </div>
          <p className="text-[10px] text-stone-400 mt-1 ml-1">14:23</p>
        </div>
      </div>

      {/* 유저 메시지 1 */}
      <div className="flex items-end gap-2.5 justify-end">
        <div className="max-w-[70%]">
          <div className="bg-violet-600 rounded-xl rounded-br-sm px-4 py-3 shadow-sm">
            <p className="text-sm text-white leading-relaxed">알겠어요. 인스타그램 게시물은 비주얼 컨셉도 같이 제안해줄 수 있나요?</p>
          </div>
          <p className="text-[10px] text-stone-400 mt-1 mr-1 text-right">14:24</p>
        </div>
        <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5">
          <span className="text-violet-700 font-semibold text-xs">김</span>
        </div>
      </div>

      {/* 에이전트 메시지 2 */}
      <div className="flex items-end gap-2.5">
        <div className="w-7 h-7 bg-violet-200 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5">
          <span className="text-violet-800 font-semibold text-xs">이</span>
        </div>
        <div className="max-w-[75%]">
          <div className="bg-white rounded-xl rounded-bl-sm border border-stone-200 px-4 py-3 shadow-sm">
            <p className="text-sm text-stone-800 leading-relaxed mb-2">물론입니다. 최민지 카피라이터에게 비주얼 컨셉까지 포함하도록 지시하겠습니다. 박준형 팀장이 방금 분석 결과를 전달했습니다:</p>
            {/* 인용 박스 */}
            <div className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 mt-2">
              <p className="text-[10px] font-medium text-stone-500 mb-1">박준형 마케팅팀장 전달 내용</p>
              <p className="text-xs text-stone-700 leading-relaxed">3월 핵심 키워드: <span className="font-medium text-violet-700">#AI마케팅</span>, <span className="font-medium text-violet-700">#퍼소나기반타겟팅</span>, <span className="font-medium text-violet-700">#숏폼트렌드</span>. 인스타는 파스텔 컬러 + 인포그래픽 혼합, 트위터는 데이터 중심 정보성 톤 권장.</p>
            </div>
          </div>
          <p className="text-[10px] text-stone-400 mt-1 ml-1">14:26</p>
        </div>
      </div>

      {/* 유저 메시지 2 */}
      <div className="flex items-end gap-2.5 justify-end">
        <div className="max-w-[70%]">
          <div className="bg-violet-600 rounded-xl rounded-br-sm px-4 py-3 shadow-sm">
            <p className="text-sm text-white leading-relaxed">좋아요! 인스타 2개, 트위터 2개 작성하면서 각 게시물에 예상 도달률도 같이 넣어줘요.</p>
          </div>
          <p className="text-[10px] text-stone-400 mt-1 mr-1 text-right">14:27</p>
        </div>
        <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5">
          <span className="text-violet-700 font-semibold text-xs">김</span>
        </div>
      </div>

      {/* 에이전트 메시지 3 */}
      <div className="flex items-end gap-2.5">
        <div className="w-7 h-7 bg-violet-200 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5">
          <span className="text-violet-800 font-semibold text-xs">이</span>
        </div>
        <div className="max-w-[75%]">
          <div className="bg-white rounded-xl rounded-bl-sm border border-stone-200 px-4 py-3 shadow-sm">
            <p className="text-sm text-stone-800 leading-relaxed">알겠습니다. 최민지에게 예상 도달률 분석까지 포함하도록 추가 지시했습니다. 현재 claude-3-5-haiku로 작성 중입니다. 약 1~2분 내로 결과물이 나올 예정입니다.</p>
            {/* 파일 첨부 카드 스타일 */}
            <div className="bg-violet-50 border border-violet-100 rounded-lg px-3 py-2 mt-2 flex items-center gap-2.5">
              <div className="w-6 h-6 bg-violet-100 rounded flex items-center justify-center flex-shrink-0">
                <FileText className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-violet-800 truncate">3월_마케팅_트렌드_분석.pdf</p>
                <p className="text-[10px] text-violet-500">박준형 보고서 · 128KB</p>
              </div>
              <button className="text-violet-600 hover:text-violet-800 transition-colors">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-stone-400 mt-1 ml-1">14:27</p>
        </div>
      </div>

      {/* 스트리밍 중 — 타이핑 애니메이션 */}
      <div className="flex items-end gap-2.5">
        <div className="w-7 h-7 bg-violet-200 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5">
          <span className="text-violet-800 font-semibold text-xs">이</span>
        </div>
        <div>
          <div className="bg-white rounded-xl rounded-bl-sm border border-stone-200 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-stone-400 rounded-full typing-dot"></span>
              <span className="w-2 h-2 bg-stone-400 rounded-full typing-dot"></span>
              <span className="w-2 h-2 bg-stone-400 rounded-full typing-dot"></span>
            </div>
          </div>
          <p className="text-[10px] text-stone-400 mt-1 ml-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-blink inline-block"></span>
            최민지 게시물 작성 중...
          </p>
        </div>
      </div>

    </div>

    {/* 입력창 — 하단 고정 */}
    <div className="bg-white border-t border-stone-200 p-4 flex-shrink-0">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            rows="2"
            placeholder="이나경에게 메시지를 보내세요..."
            className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-stone-800 placeholder-stone-400 resize-none leading-relaxed"
          ></textarea>
          <div className="flex items-center gap-2 mt-2">
            <button className="text-stone-400 hover:text-stone-600 transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="text-stone-400 hover:text-stone-600 transition-colors">
              <Image className="w-4 h-4" />
            </button>
            <span className="text-stone-200">|</span>
            <span className="text-[10px] text-stone-400">Enter로 전송 · Shift+Enter 줄바꿈</span>
          </div>
        </div>
        <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg p-2.5 transition-all duration-150 flex-shrink-0 mb-7">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>

  </div>

  {/* 우측: 에이전트 정보 패널 (260px) */}
  <div className="w-[260px] flex-shrink-0 bg-white border-l border-stone-200 flex flex-col overflow-y-auto list-scroll">

    {/* 헤더 */}
    <div className="h-14 flex items-center px-4 border-b border-stone-200">
      <p className="text-sm font-semibold text-stone-900 flex-1" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>에이전트 정보</p>
      <button className="text-stone-400 hover:text-stone-600 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>

    {/* 프로필 */}
    <div className="p-5 border-b border-stone-100 text-center">
      <div className="relative inline-block mb-3">
        <div className="w-16 h-16 bg-violet-200 rounded-full flex items-center justify-center mx-auto">
          <span className="text-violet-800 font-bold text-2xl">이</span>
        </div>
        <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-orange-500 rounded-full border-2 border-white animate-blink"></span>
      </div>
      <p className="text-base font-bold text-stone-900 mb-0.5" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>이나경</p>
      <p className="text-xs text-stone-500">비서실장</p>
      <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5 text-xs font-medium mt-2">
        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-blink"></span>
        작업 중
      </span>
    </div>

    {/* 상세 정보 */}
    <div className="p-4 space-y-4">

      {/* 역할 설명 */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-2">역할</p>
        <p className="text-xs text-stone-600 leading-relaxed">김대표의 모든 명령을 수신하고 적절한 에이전트에게 위임합니다. 업무 우선순위 판단 및 진행 현황을 실시간으로 보고합니다.</p>
      </div>

      {/* 사용 모델 */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-2">사용 모델</p>
        <div className="bg-stone-50 rounded-lg px-3 py-2 border border-stone-100">
          <p className="text-xs font-mono font-medium text-stone-700">claude-3-5-sonnet-20241022</p>
          <p className="text-[10px] text-stone-400 mt-0.5">Anthropic · Max 8,192 tokens output</p>
        </div>
      </div>

      {/* 오늘 통계 */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-2">오늘 활동</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-stone-50 rounded-lg px-3 py-2.5 border border-stone-100 text-center">
            <p className="text-lg font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>12</p>
            <p className="text-[10px] text-stone-400">완료 작업</p>
          </div>
          <div className="bg-stone-50 rounded-lg px-3 py-2.5 border border-stone-100 text-center">
            <p className="text-lg font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>3</p>
            <p className="text-[10px] text-stone-400">진행 중</p>
          </div>
          <div className="bg-stone-50 rounded-lg px-3 py-2.5 border border-stone-100 text-center">
            <p className="text-sm font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>$1.24</p>
            <p className="text-[10px] text-stone-400">오늘 비용</p>
          </div>
          <div className="bg-stone-50 rounded-lg px-3 py-2.5 border border-stone-100 text-center">
            <p className="text-lg font-bold text-emerald-600" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>92%</p>
            <p className="text-[10px] text-stone-400">성공률</p>
          </div>
        </div>
      </div>

      {/* 오늘 대화 수 */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-2">오늘 대화</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-stone-100 rounded-full h-1.5">
            <div className="bg-violet-500 h-1.5 rounded-full" style={{width: "68%"}}></div>
          </div>
          <span className="text-xs font-medium text-stone-700">17회</span>
        </div>
        <p className="text-[10px] text-stone-400 mt-1">이번 주 평균 12회/일 대비 +42%</p>
      </div>

      {/* 최근 위임 이력 */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-2">최근 위임 이력</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0"></span>
            <span className="text-stone-600 flex-1 truncate">박준형 → 마케팅 분석</span>
            <span className="text-stone-400 text-[10px] flex-shrink-0">14:24</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0"></span>
            <span className="text-stone-600 flex-1 truncate">이소연 → 법무 검토</span>
            <span className="text-stone-400 text-[10px] flex-shrink-0">11:02</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-blink flex-shrink-0"></span>
            <span className="text-stone-600 flex-1 truncate">최민지 → SNS 게시물</span>
            <span className="text-orange-500 text-[10px] flex-shrink-0">진행 중</span>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="space-y-2 pt-1">
        <a href="/app/command-center" className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2">
          <Terminal className="w-4 h-4" /> 명령 내리기
        </a>
        <button className="w-full bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2">
          <Settings className="w-4 h-4" /> 에이전트 설정
        </button>
      </div>

    </div>
  </div>

</div>
    </>
  );
}

export default AppChat;
