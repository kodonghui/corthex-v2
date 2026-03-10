"use client";
import React from "react";
import { Activity, AlertTriangle, BarChart2, Bell, BookOpen, Bot, Building2, CheckCheck, CheckCircle2, ChevronsUpDown, Clock, CreditCard, Eye, Folder, Gauge, GitBranch, Home, Key, LayoutDashboard, ListChecks, LoaderCircle, MessageSquare, ScrollText, Send, Settings, Settings2, Share2, Shield, Terminal, TrendingUp, UserPlus, Users, XCircle, Zap } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4,h5,h6,.font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre,.font-mono { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #f5f5f4; }
    ::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 3px; }`;

function AppNotifications() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      {/* API: GET /api/workspace/notifications */}
  {/* API: PATCH /api/workspace/notifications/{id}/read */}
  {/* API: POST /api/workspace/notifications/read-all */}
  {/* API: DELETE /api/workspace/notifications/{id} */}
  
  
  
  



{/* ===== SIDEBAR ===== */}
<aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-10">

  {/* Logo */}
  <div className="px-5 py-4 border-b border-stone-200 flex-shrink-0">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
        <Zap className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
      <span className="text-[10px] text-stone-400 ml-0.5" style={{"fontFamily":"'JetBrains Mono',monospace"}}>v2</span>
    </div>
  </div>

  {/* Navigation */}
  <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">

    <div>
      <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-stone-500">워크스페이스</p>
      <ul className="space-y-0.5">
        <li><a href="/app/home" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Home className="w-4 h-4 flex-shrink-0" />홈</a></li>
        <li><a href="/app/command-center" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Terminal className="w-4 h-4 flex-shrink-0" />커맨드 센터</a></li>
        <li><a href="/app/chat" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><MessageSquare className="w-4 h-4 flex-shrink-0" />AI 채팅</a></li>
        <li><a href="/app/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><LayoutDashboard className="w-4 h-4 flex-shrink-0" />대시보드</a></li>
      </ul>
    </div>

    <div>
      <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-stone-500">조직</p>
      <ul className="space-y-0.5">
        <li><a href="/app/agents" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Bot className="w-4 h-4 flex-shrink-0" />에이전트</a></li>
        <li><a href="/app/departments" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Building2 className="w-4 h-4 flex-shrink-0" />부서</a></li>
        <li><a href="/app/nexus" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><GitBranch className="w-4 h-4 flex-shrink-0" />조직도 (Nexus)</a></li>
      </ul>
    </div>

    <div>
      <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-stone-500">업무도구</p>
      <ul className="space-y-0.5">
        <li><a href="/app/trading" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><TrendingUp className="w-4 h-4 flex-shrink-0" />트레이딩</a></li>
        <li><a href="/app/agora" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Users className="w-4 h-4 flex-shrink-0" />Agora</a></li>
        <li><a href="/app/sns" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Share2 className="w-4 h-4 flex-shrink-0" />SNS</a></li>
        <li><a href="/app/messenger" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Send className="w-4 h-4 flex-shrink-0" />메신저</a></li>
        <li><a href="/app/knowledge" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><BookOpen className="w-4 h-4 flex-shrink-0" />지식베이스</a></li>
        <li><a href="/app/files" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Folder className="w-4 h-4 flex-shrink-0" />파일</a></li>
      </ul>
    </div>

    <div>
      <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-stone-500">기록 &amp; 분석</p>
      <ul className="space-y-0.5">
        <li><a href="/app/reports" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><BarChart2 className="w-4 h-4 flex-shrink-0" />리포트</a></li>
        <li><a href="/app/ops-log" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><ScrollText className="w-4 h-4 flex-shrink-0" />운영 로그</a></li>
        <li><a href="/app/jobs" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><ListChecks className="w-4 h-4 flex-shrink-0" />작업 현황</a></li>
        <li><a href="/app/costs" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><CreditCard className="w-4 h-4 flex-shrink-0" />비용</a></li>
        <li><a href="/app/activity-log" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Activity className="w-4 h-4 flex-shrink-0" />활동 로그</a></li>
        <li><a href="/app/performance" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Gauge className="w-4 h-4 flex-shrink-0" />성과 분석</a></li>
      </ul>
    </div>

    <div>
      <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-stone-500">설정</p>
      <ul className="space-y-0.5">
        <li><a href="/app/argos" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Eye className="w-4 h-4 flex-shrink-0" />Argos 모니터링</a></li>
        <li><a href="/app/classified" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Shield className="w-4 h-4 flex-shrink-0" />기밀</a></li>
        <li><a href="/app/credentials" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Key className="w-4 h-4 flex-shrink-0" />크리덴셜</a></li>
        <li>
          <a href="/app/notifications" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm bg-violet-50 text-violet-700 font-medium">
            <Bell className="w-4 h-4 flex-shrink-0" />
            알림
            <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-violet-600 text-white text-[10px] font-bold">4</span>
          </a>
        </li>
        <li><a href="/app/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Settings className="w-4 h-4 flex-shrink-0" />설정</a></li>
      </ul>
    </div>

  </nav>

  {/* User Profile */}
  <div className="px-4 py-4 border-t border-stone-200 flex-shrink-0">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0">김</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-900 truncate">김대표</p>
        <p className="text-xs text-stone-500 truncate">CEO · ACME Corp</p>
      </div>
      <button className="text-stone-400 hover:text-stone-600 transition-colors">
        <ChevronsUpDown className="w-4 h-4" />
      </button>
    </div>
  </div>
</aside>

{/* ===== MAIN CONTENT ===== */}
<main className="ml-60 min-h-screen">

  {/* Header */}
  
    <div className="flex items-center gap-2.5">
      <h1 className="text-base font-semibold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>알림</h1>
      <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-violet-600 text-white text-[11px] font-bold px-1.5">4</span>
    </div>
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-1.5 text-stone-600 hover:bg-stone-100 rounded-lg px-3 py-1.5 text-sm transition-colors">
        <Settings2 className="w-3.5 h-3.5" />
        알림 설정
      </button>
      <button className="flex items-center gap-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
        <CheckCheck className="w-3.5 h-3.5" />
        모두 읽음 처리
      </button>
    </div>
  

  <div className="p-6 max-w-3xl">

    {/* Filter Tabs */}
    <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1 mb-5 w-fit">
      <button className="px-3.5 py-1.5 rounded-md text-sm font-medium bg-white text-stone-900 shadow-sm">
        전체 <span className="ml-1 text-xs text-stone-500 font-normal">10</span>
      </button>
      <button className="px-3.5 py-1.5 rounded-md text-sm text-stone-600 hover:bg-white hover:text-stone-900 transition-all flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        작업완료
      </button>
      <button className="px-3.5 py-1.5 rounded-md text-sm text-stone-600 hover:bg-white hover:text-stone-900 transition-all flex items-center gap-1">
        <XCircle className="w-3.5 h-3.5 text-red-500" />
        에러
      </button>
      <button className="px-3.5 py-1.5 rounded-md text-sm text-stone-600 hover:bg-white hover:text-stone-900 transition-all flex items-center gap-1">
        <Bell className="w-3.5 h-3.5 text-violet-500" />
        시스템
      </button>
      <button className="px-3.5 py-1.5 rounded-md text-sm text-stone-600 hover:bg-white hover:text-stone-900 transition-all flex items-center gap-1">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
        비용경고
      </button>
    </div>

    {/* Notification List */}
    <div className="space-y-2">

      {/* 1: 작업완료 — 읽지 않음 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-4 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-stone-900">마케팅 콘텐츠 기획서 작성 완료</p>
              <p className="text-xs text-stone-500 mt-0.5">박준형이 요청하신 Q2 SNS 캠페인 기획서를 완성했어요. 총 12페이지, PDF 형식으로 저장됐습니다.</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="text-[11px] text-stone-400 whitespace-nowrap">방금 전</span>
              <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0"></span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">작업완료</span>
            <span className="text-[11px] text-stone-400">마케팅부서 · 박준형</span>
          </div>
        </div>
      </div>

      {/* 2: 작업중 — 읽지 않음 */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150 p-4 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <LoaderCircle className="w-4.5 h-4.5 text-orange-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-stone-900">투자 분석 보고서 작성 중 (3/5단계)</p>
              <p className="text-xs text-stone-500 mt-0.5">김재원이 POSCO홀딩스 종목 분석 중입니다. 재무제표 검토 단계를 완료하고 밸류에이션 분석에 진입했어요.</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="text-[11px] text-stone-400 whitespace-nowrap">2분 전</span>
              <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0"></span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">작업중</span>
            <span className="text-[11px] text-stone-400">전략투자부서 · 김재원</span>
          </div>
        </div>
      </div>

      {/* 3: 에러 — 읽지 않음 */}
      <div className="bg-red-50 rounded-xl border border-red-100 shadow-sm hover:border-red-200 hover:shadow-md transition-all duration-150 p-4 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <XCircle className="w-4.5 h-4.5 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-red-900">SNS 자동 발행 실패 — 인스타그램 토큰 만료</p>
              <p className="text-xs text-red-700 mt-0.5">인스타그램 API 토큰이 만료되어 자동 발행이 중단됐습니다. 크리덴셜 페이지에서 토큰을 갱신해 주세요.</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="text-[11px] text-red-400 whitespace-nowrap">15분 전</span>
              <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0"></span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">에러</span>
            <a href="/app/credentials" className="text-[11px] text-red-600 font-medium hover:underline">크리덴셜 갱신하기 →</a>
          </div>
        </div>
      </div>

      {/* 4: 비용경고 — 읽지 않음 */}
      <div className="bg-amber-50 rounded-xl border border-amber-100 shadow-sm hover:border-amber-200 hover:shadow-md transition-all duration-150 p-4 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-amber-900">이번 달 예산의 85%를 사용했어요</p>
              <p className="text-xs text-amber-700 mt-0.5">현재 $14.28 / $16.80 사용. 남은 예산 $2.52로 월말까지 약 5일이 남았습니다. 비용 현황을 확인하세요.</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="text-[11px] text-amber-500 whitespace-nowrap">1시간 전</span>
              <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0"></span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">비용경고</span>
            <a href="/app/costs" className="text-[11px] text-amber-700 font-medium hover:underline">비용 현황 보기 →</a>
          </div>
        </div>
      </div>

      {/* 5: 작업완료 — 읽음 */}
      <div className="bg-white rounded-xl border border-stone-100 p-4 flex items-start gap-3.5 opacity-75">
        <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-stone-700">법률 검토 보고서 완성</p>
              <p className="text-xs text-stone-400 mt-0.5">이소연이 투자계약서 법률 검토를 완료했습니다. 총 3건의 검토 의견이 포함됐어요.</p>
            </div>
            <span className="text-[11px] text-stone-400 whitespace-nowrap flex-shrink-0">2시간 전</span>
          </div>
          <div className="mt-2">
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">작업완료</span>
          </div>
        </div>
      </div>

      {/* 6: 시스템 — 읽음 */}
      <div className="bg-white rounded-xl border border-stone-100 p-4 flex items-start gap-3.5 opacity-75">
        <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0">
          <UserPlus className="w-4.5 h-4.5 text-violet-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-stone-700">새 에이전트 '정도현'이 팀에 합류했어요</p>
              <p className="text-xs text-stone-400 mt-0.5">전략투자부서에 데이터분석가 정도현이 추가됐습니다. 에이전트 페이지에서 설정을 완료해 주세요.</p>
            </div>
            <span className="text-[11px] text-stone-400 whitespace-nowrap flex-shrink-0">3시간 전</span>
          </div>
          <div className="mt-2">
            <span className="text-[11px] font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">시스템</span>
          </div>
        </div>
      </div>

      {/* 7: 작업완료 — 읽음 */}
      <div className="bg-white rounded-xl border border-stone-100 p-4 flex items-start gap-3.5 opacity-75">
        <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-stone-700">주간 투자 현황 리포트 완성</p>
              <p className="text-xs text-stone-400 mt-0.5">김재원이 3월 2주차 포트폴리오 수익률 및 리밸런싱 제안서를 완료했습니다.</p>
            </div>
            <span className="text-[11px] text-stone-400 whitespace-nowrap flex-shrink-0">어제</span>
          </div>
          <div className="mt-2">
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">작업완료</span>
          </div>
        </div>
      </div>

      {/* 8: 비용경고 — 읽음 */}
      <div className="bg-white rounded-xl border border-stone-100 p-4 flex items-start gap-3.5 opacity-75">
        <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-stone-700">전략투자부서 일일 한도 90% 도달</p>
              <p className="text-xs text-stone-400 mt-0.5">오늘 전략투자부서 일일 토큰 사용량이 $4.50 / $5.00에 달했습니다.</p>
            </div>
            <span className="text-[11px] text-stone-400 whitespace-nowrap flex-shrink-0">어제</span>
          </div>
          <div className="mt-2">
            <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">비용경고</span>
          </div>
        </div>
      </div>

      {/* 9: 시스템 — 읽음 */}
      <div className="bg-white rounded-xl border border-stone-100 p-4 flex items-start gap-3.5 opacity-75">
        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Clock className="w-4.5 h-4.5 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-stone-700">크리덴셜 'KIS API'가 90일 후 만료 예정</p>
              <p className="text-xs text-stone-400 mt-0.5">한국투자증권 API 키가 2026-06-08에 만료됩니다. 미리 갱신을 준비해 주세요.</p>
            </div>
            <span className="text-[11px] text-stone-400 whitespace-nowrap flex-shrink-0">2일 전</span>
          </div>
          <div className="mt-2">
            <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">시스템</span>
          </div>
        </div>
      </div>

      {/* 10: 작업완료 — 읽음 */}
      <div className="bg-white rounded-xl border border-stone-100 p-4 flex items-start gap-3.5 opacity-75">
        <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-stone-700">SNS 주간 콘텐츠 일괄 생성 완료</p>
              <p className="text-xs text-stone-400 mt-0.5">최민지가 인스타그램 7건, 링크드인 3건, X 5건 총 15개 포스트를 생성하고 예약 완료했습니다.</p>
            </div>
            <span className="text-[11px] text-stone-400 whitespace-nowrap flex-shrink-0">2일 전</span>
          </div>
          <div className="mt-2">
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">작업완료</span>
          </div>
        </div>
      </div>

    </div>{/* /notification list */}

    {/* Footer info */}
    <div className="mt-6 flex items-center justify-between text-xs text-stone-400">
      <p>읽지 않은 알림 <span className="font-semibold text-stone-600">4</span>개</p>
      <p>전체 <span className="font-semibold text-stone-600">10</span>개 표시 중</p>
    </div>

  </div>{/* /p-6 */}
</main>
    </>
  );
}

export default AppNotifications;
