"use client";
import React from "react";
import { Activity, BarChart2, Bell, BookOpen, Bot, Briefcase, Building2, Check, CheckCircle, Clock, Eye, FileBarChart, Folder, Home, Instagram, Key, LayoutDashboard, MessageCircle, MessageSquare, Network, Receipt, Scroll, Settings, Share2, Shield, Sparkles, Terminal, TrendingUp, Users, X } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4,h5,h6,.font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
`;

function AppSns() {
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
      <a href="/app/agora" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm transition-all duration-150"><Users className="w-4 h-4 shrink-0" /><span>아고라</span></a>
      <a href="/app/sns" className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-violet-50 text-violet-700 font-medium text-sm"><Share2 className="w-4 h-4 shrink-0" /><span>SNS</span></a>
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
    <div className="border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
          <Share2 className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <h1 className="font-display font-bold text-stone-900 text-lg leading-tight">SNS 관리</h1>
          <p className="text-stone-500 text-xs">AI 콘텐츠 생성 · 멀티채널 발행 자동화</p>
        </div>
      </div>
      {/* API: POST /api/workspace/sns/contents */}
      <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 shadow-sm">
        <Sparkles className="w-4 h-4" />
        AI 콘텐츠 생성
      </button>
    </div>

    <div className="p-6">

      {/* 3-Tab Layout */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-stone-200 p-1 mb-5 shadow-sm">
        <button className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold">콘텐츠 목록</button>
        <button className="flex-1 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm font-medium transition-all duration-150">예약 큐 <span className="ml-1 px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold">3</span></button>
        <button className="flex-1 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm font-medium transition-all duration-150">계정 관리</button>
      </div>

      {/* Filter Bar */}
      {/* API: GET /api/workspace/sns/contents */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mr-1">필터</p>
        <button className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold">전체</button>
        <button className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-stone-300 text-stone-600 text-xs font-medium transition-all duration-150">초안</button>
        <button className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-stone-300 text-stone-600 text-xs font-medium transition-all duration-150 flex items-center gap-1">
          승인대기 <span className="px-1 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold">1</span>
        </button>
        <button className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-stone-300 text-stone-600 text-xs font-medium transition-all duration-150">예약됨</button>
        <button className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-stone-300 text-stone-600 text-xs font-medium transition-all duration-150">발행됨</button>
        <button className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-stone-300 text-stone-600 text-xs font-medium transition-all duration-150 flex items-center gap-1">
          실패 <span className="px-1 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-bold">1</span>
        </button>
      </div>

      {/* Content Cards */}
      <div className="space-y-3">

        {/* Card 1: Instagram — 승인대기 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 hover:border-violet-200 hover:shadow-md transition-all duration-150">
          <div className="flex items-start gap-3">
            {/* Platform Icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-400 rounded-xl flex items-center justify-center shrink-0">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-stone-500">Instagram</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200">승인대기</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  {/* API: PATCH /api/workspace/sns/contents/{id}/approve */}
                  <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 flex items-center gap-1">
                    <Check className="w-3 h-3" />승인
                  </button>
                  <button className="bg-white border border-stone-200 hover:border-red-300 text-stone-600 hover:text-red-600 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 flex items-center gap-1">
                    <X className="w-3 h-3" />거절
                  </button>
                </div>
              </div>
              <p className="text-sm font-semibold text-stone-800 mb-1">봄 신상 컬렉션 소개</p>
              <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">올 봄을 맞아 새롭게 출시된 컬렉션을 소개합니다. 트렌디한 디자인과 편안한 착용감을 동시에 느껴보세요. 지금 바로 온라인 스토어에서 확인하세요!</p>
              <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 text-[11px] font-medium">#패션</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 text-[11px] font-medium">#봄</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 text-[11px] font-medium">#신상</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 text-[11px] font-medium">#스타일</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-stone-400">
                <span className="flex items-center gap-1"><Bot className="w-3 h-3" />마케팅AI 생성</span>
                <span>·</span>
                <span>방금 전 생성</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Tistory — 예약됨 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 hover:border-violet-200 hover:shadow-md transition-all duration-150">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-stone-500">티스토리</span>
                  <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[11px] font-semibold border border-violet-200">예약됨</span>
                </div>
                <button className="bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150">상세보기</button>
              </div>
              <p className="text-sm font-semibold text-stone-800 mb-1">2025 마케팅 트렌드 분석</p>
              <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">2025년 디지털 마케팅 트렌드 5가지를 심층 분석합니다. AI 퍼스널라이제이션부터 숏폼 비디오 전략까지, 올해 놓쳐서는 안 될 핵심 트렌드를 정리했습니다.</p>
              <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[11px] font-medium">#마케팅</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[11px] font-medium">#트렌드</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[11px] font-medium">#2025</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-stone-400">
                <span className="flex items-center gap-1"><Bot className="w-3 h-3" />콘텐츠AI 생성</span>
                <span>·</span>
                <span className="flex items-center gap-1 text-violet-600 font-medium">
                  <Clock className="w-3 h-3" />내일 오전 9:00 발행 예약
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Twitter — 발행됨 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 hover:border-violet-200 hover:shadow-md transition-all duration-150">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">X</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-stone-500">Twitter / X</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">발행됨</span>
                </div>
                <button className="bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150">상세보기</button>
              </div>
              <p className="text-sm font-semibold text-stone-800 mb-1">AI 조직 운영의 미래</p>
              <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">AI 에이전트가 실제 업무를 수행하는 시대가 왔습니다. CORTHEX에서 우리가 경험하고 있는 변화를 공유합니다. #AIOrganization #FutureOfWork</p>
              <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-medium">#AIOrganization</span>
                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-medium">#FutureOfWork</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-stone-400">
                <span className="flex items-center gap-1"><Bot className="w-3 h-3" />전략AI 생성</span>
                <span>·</span>
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle className="w-3 h-3" />2시간 전 발행 완료
                </span>
                <span>·</span>
                <span>조회 143 · 좋아요 28</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Naver Blog — 초안 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 hover:border-violet-200 hover:shadow-md transition-all duration-150">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-stone-500">네이버 블로그</span>
                  <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-semibold border border-stone-200">초안</span>
                </div>
                <button className="bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150">상세보기</button>
              </div>
              <p className="text-sm font-semibold text-stone-800 mb-1">투자 성공을 위한 5가지 전략</p>
              <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">장기 투자 성공을 위한 핵심 전략 5가지를 정리했습니다. 분산 투자의 중요성부터 감정 컨트롤까지, 실전에서 바로 적용 가능한 노하우를 공유합니다.</p>
              <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[11px] font-medium">#투자</span>
                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[11px] font-medium">#재테크</span>
                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[11px] font-medium">#금융</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-stone-400">
                <span className="flex items-center gap-1"><Bot className="w-3 h-3" />CIO AI 생성</span>
                <span>·</span>
                <span>어제 작성</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Instagram — 발행됨 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 hover:border-violet-200 hover:shadow-md transition-all duration-150">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-400 rounded-xl flex items-center justify-center shrink-0">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-stone-500">Instagram</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">발행됨</span>
                </div>
                <button className="bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150">상세보기</button>
              </div>
              <p className="text-sm font-semibold text-stone-800 mb-1">고객 후기 카드뉴스 시리즈 1/5</p>
              <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">실제 고객의 생생한 후기를 카드뉴스 형태로 제작했습니다. "CORTHEX 도입 후 업무 효율이 3배 올랐어요" — 스타트업 CEO 김○○ 님의 이야기입니다.</p>
              <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 text-[11px] font-medium">#고객후기</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 text-[11px] font-medium">#카드뉴스</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 text-[11px] font-medium">#CORTHEX</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-stone-400">
                <span className="flex items-center gap-1"><Bot className="w-3 h-3" />마케팅AI 생성</span>
                <span>·</span>
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle className="w-3 h-3" />3일 전 발행 완료
                </span>
                <span>·</span>
                <span>조회 892 · 좋아요 214</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Status Summary */}
      <div className="mt-5 bg-white rounded-xl border border-stone-200 shadow-sm p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-3">발행 큐 현황</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-violet-50 rounded-lg p-3 text-center border border-violet-100">
            <p className="text-xl font-display font-bold text-violet-700">3</p>
            <p className="text-xs text-violet-600 font-medium mt-0.5">예약 대기</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
            <p className="text-xl font-display font-bold text-emerald-700">12</p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">발행 완료</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
            <p className="text-xl font-display font-bold text-red-600">1</p>
            <p className="text-xs text-red-600 font-medium mt-0.5">실패</p>
          </div>
        </div>
      </div>
    </div>
  </main>
    </>
  );
}

export default AppSns;
