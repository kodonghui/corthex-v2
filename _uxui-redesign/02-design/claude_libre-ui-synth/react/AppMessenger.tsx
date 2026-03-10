"use client";
import React from "react";
import { Activity, ArrowRight, BarChart2, Bell, BookOpen, Bot, Briefcase, Building2, Calendar, Download, Eye, FileBarChart, FileSpreadsheet, FileText, Folder, Home, Key, LayoutDashboard, MessageCircle, MessageSquare, MoreHorizontal, Network, Paperclip, Phone, Plus, Receipt, Scroll, Search, Send, Settings, Share2, Shield, Smile, Terminal, TrendingUp, Users, Video, Zap } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4,h5,h6,.font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }`;

function AppMessenger() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      {/* Sidebar Nav */}
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
      <a href="/app/agora" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Users className="w-4 h-4 shrink-0" /><span>아고라</span></a>
      <a href="/app/sns" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Share2 className="w-4 h-4 shrink-0" /><span>SNS</span></a>
      <a href="/app/messenger" className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-violet-50 text-violet-700 font-medium text-sm"><MessageCircle className="w-4 h-4 shrink-0" /><span>메신저</span></a>
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

  {/* Main: 3-Column Chat Layout */}
  <main className="ml-60 h-screen flex overflow-hidden">

    {/* Left: Conversation List (240px) */}
    {/* API: GET /api/workspace/conversations */}
    <div className="w-[240px] shrink-0 bg-white border-r border-stone-200 flex flex-col">
      {/* Search */}
      <div className="p-3 border-b border-stone-100">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="대화 검색..." className="w-full rounded-lg border border-stone-200 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-stone-50" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* DMs Section */}
        <div className="px-3 pt-3 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">다이렉트 메시지</p>
        </div>

        {/* DM 1: 이나경 — active, unread */}
        <div className="mx-2 px-3 py-2.5 rounded-xl bg-violet-50 border border-violet-100 cursor-pointer mb-1">
          <div className="flex items-start gap-2.5">
            <div className="relative shrink-0">
              <div className="w-8 h-8 bg-violet-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-violet-700">이</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-semibold text-violet-700">이나경</span>
                <span className="text-[10px] text-stone-400">5분 전</span>
              </div>
              <p className="text-[11px] text-stone-600 truncate">알겠습니다. 바로 처리하겠습니다.</p>
            </div>
            <div className="w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[9px] font-bold text-white">2</span>
            </div>
          </div>
        </div>

        {/* DM 2: 박준형 */}
        <div className="mx-2 px-3 py-2.5 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors mb-1">
          <div className="flex items-start gap-2.5">
            <div className="relative shrink-0">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-emerald-700">박</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-stone-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-semibold text-stone-800">박준형</span>
                <span className="text-[10px] text-stone-400">30분 전</span>
              </div>
              <p className="text-[11px] text-stone-500 truncate">마케팅 기획서 초안 완성했어요</p>
            </div>
          </div>
        </div>

        {/* Channels Section */}
        <div className="px-3 pt-3 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">팀 채널</p>
        </div>

        {/* Channel 1 */}
        <div className="mx-2 px-3 py-2.5 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors mb-1">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-stone-600">#</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-semibold text-stone-700">전체공지</span>
                <span className="text-[10px] text-stone-400">어제</span>
              </div>
              <p className="text-[11px] text-stone-500 truncate">3월 예산 정산 완료됐습니다</p>
            </div>
          </div>
        </div>

        {/* Channel 2 */}
        <div className="mx-2 px-3 py-2.5 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors mb-1">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-stone-600">#</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-semibold text-stone-700">마케팅팀</span>
                <span className="text-[10px] text-stone-400">어제</span>
              </div>
              <p className="text-[11px] text-stone-500 truncate">이번주 SNS 일정 공유해요</p>
            </div>
          </div>
        </div>

        {/* Channel 3 */}
        <div className="mx-2 px-3 py-2.5 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors mb-1">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-stone-600">#</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-semibold text-stone-700">전략팀</span>
                <span className="text-[10px] text-stone-400">오전 10:00</span>
              </div>
              <p className="text-[11px] text-stone-500 truncate">1분기 OKR 리뷰 자료 준비 중</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3 border-t border-stone-100">
        <button className="w-full flex items-center justify-center gap-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150">
          <Plus className="w-3.5 h-3.5" />
          새 대화 시작
        </button>
      </div>
    </div>

    {/* Center: Chat Window (flex-1) */}
    <div className="flex-1 flex flex-col bg-stone-50 min-w-0">
      {/* Chat Header */}
      <div className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 bg-violet-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-violet-700">이</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display font-semibold text-stone-900 text-sm">이나경</p>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">Online</span>
            </div>
            <p className="text-[11px] text-stone-500">비서실장 · 방금 활동</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500 transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500 transition-colors">
            <Video className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {/* API: POST /api/workspace/conversations/{id}/messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {/* Date divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-stone-200"></div>
          <span className="text-[10px] text-stone-400 font-medium px-2">오늘 오후 2:00</span>
          <div className="flex-1 border-t border-stone-200"></div>
        </div>

        {/* [나] Message 1 — violet right */}
        <div className="flex items-end justify-end gap-2">
          <div className="max-w-[70%]">
            <div className="bg-violet-600 text-white rounded-2xl rounded-br-md px-4 py-2.5">
              <p className="text-sm leading-relaxed">이번 주 마케팅 보고서 요약해줘</p>
            </div>
            <p className="text-[10px] text-stone-400 text-right mt-1">오후 2:01 · 읽음</p>
          </div>
        </div>

        {/* [이나경] Message 1 — stone left */}
        <div className="flex items-end gap-2">
          <div className="w-7 h-7 bg-violet-200 rounded-full flex items-center justify-center shrink-0 mb-4">
            <span className="text-[10px] font-bold text-violet-700">이</span>
          </div>
          <div className="max-w-[70%]">
            <div className="bg-white text-stone-800 rounded-2xl rounded-bl-md px-4 py-2.5 border border-stone-200 shadow-sm">
              <p className="text-sm leading-relaxed mb-2">네, 주요 내용을 정리했습니다.</p>
              {/* Attachment */}
              <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-2.5 border border-stone-200">
                <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-stone-700 truncate">마케팅_보고서_2026Q1.pdf</p>
                  <p className="text-[10px] text-stone-400">2.4 MB</p>
                </div>
                <button className="w-6 h-6 rounded-md hover:bg-stone-200 flex items-center justify-center transition-colors">
                  <Download className="w-3.5 h-3.5 text-stone-500" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-stone-400 mt-1">오후 2:02</p>
          </div>
        </div>

        {/* [나] Message 2 */}
        <div className="flex items-end justify-end gap-2">
          <div className="max-w-[70%]">
            <div className="bg-violet-600 text-white rounded-2xl rounded-br-md px-4 py-2.5">
              <p className="text-sm leading-relaxed">고마워요. SNS 팀에도 공유해줘</p>
            </div>
            <p className="text-[10px] text-stone-400 text-right mt-1">오후 2:04 · 읽음</p>
          </div>
        </div>

        {/* [이나경] Message 2 */}
        <div className="flex items-end gap-2">
          <div className="w-7 h-7 bg-violet-200 rounded-full flex items-center justify-center shrink-0 mb-4">
            <span className="text-[10px] font-bold text-violet-700">이</span>
          </div>
          <div className="max-w-[70%]">
            <div className="bg-white text-stone-800 rounded-2xl rounded-bl-md px-4 py-2.5 border border-stone-200 shadow-sm">
              <p className="text-sm leading-relaxed">바로 진행하겠습니다.</p>
            </div>
            <p className="text-[10px] text-stone-400 mt-1">오후 2:04</p>
          </div>
        </div>

        {/* System Message */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 border-t border-stone-200"></div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100">
            <ArrowRight className="w-3 h-3 text-stone-400" />
            <span className="text-[11px] text-stone-500">이나경이 박준형에게 문서를 전달했습니다</span>
          </div>
          <div className="flex-1 border-t border-stone-200"></div>
        </div>

        {/* [이나경] Final */}
        <div className="flex items-end gap-2">
          <div className="w-7 h-7 bg-violet-200 rounded-full flex items-center justify-center shrink-0 mb-4">
            <span className="text-[10px] font-bold text-violet-700">이</span>
          </div>
          <div className="max-w-[70%]">
            <div className="bg-white text-stone-800 rounded-2xl rounded-bl-md px-4 py-2.5 border border-stone-200 shadow-sm">
              <p className="text-sm leading-relaxed">박준형 팀장님께 공유 완료했습니다. 다른 사항 있으시면 말씀해 주세요.</p>
            </div>
            <p className="text-[10px] text-stone-400 mt-1">오후 2:05 · 방금</p>
          </div>
        </div>
      </div>

      {/* Input Bar */}
      <div className="bg-white border-t border-stone-200 p-3 shrink-0">
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500 shrink-0 transition-colors">
            <Paperclip className="w-4 h-4" />
          </button>
          <div className="flex-1 relative">
            <input type="text" placeholder="메시지 입력..." className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-stone-50 pr-10" />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg hover:bg-stone-200 flex items-center justify-center transition-colors">
              <Smile className="w-3.5 h-3.5 text-stone-400" />
            </button>
          </div>
          <button className="w-9 h-9 bg-violet-600 hover:bg-violet-700 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-sm">
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>

    {/* Right: Info Panel (220px) */}
    <div className="w-[220px] shrink-0 bg-white border-l border-stone-200 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-stone-100">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-3">대화 정보</p>
        {/* Profile */}
        <div className="text-center">
          <div className="w-14 h-14 bg-violet-200 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-xl font-bold text-violet-700">이</span>
          </div>
          <p className="font-display font-bold text-stone-900 text-sm">이나경</p>
          <p className="text-xs text-stone-500 mt-0.5">비서실장</p>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-emerald-600 font-medium">Online</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Stats */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">이번 달 대화</span>
            <span className="text-xs font-semibold text-stone-800 font-mono">47회</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">평균 응답 시간</span>
            <span className="text-xs font-semibold text-stone-800">1분 12초</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">완료 작업</span>
            <span className="text-xs font-semibold text-stone-800 font-mono">128건</span>
          </div>
        </div>

        <div className="border-t border-stone-100 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">공유 파일</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="text-[11px] text-stone-700 truncate">마케팅_보고서_Q1.pdf</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <FileSpreadsheet className="w-3.5 h-3.5 text-green-500 shrink-0" />
              <span className="text-[11px] text-stone-700 truncate">예산안_2026.xlsx</span>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-100 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">빠른 액션</p>
          <div className="space-y-1.5">
            <a href="/app/chat" className="flex items-center gap-2 w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150">
              <Zap className="w-3.5 h-3.5" />
              채팅으로 명령
            </a>
            <button className="flex items-center gap-2 w-full bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150">
              <Calendar className="w-3.5 h-3.5" />
              일정 예약
            </button>
            <button className="flex items-center gap-2 w-full bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150">
              <BarChart2 className="w-3.5 h-3.5" />
              성과 확인
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
    </>
  );
}

export default AppMessenger;
