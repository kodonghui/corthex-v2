"use client";
import React from "react";
import { Activity, BarChart2, Bell, BookOpen, Bot, Building2, Camera, ChevronRight, ChevronsUpDown, CreditCard, Eye, Folder, Gauge, GitBranch, Home, Key, LayoutDashboard, ListChecks, Lock, MessageSquare, Monitor, Plug, Save, ScrollText, Send, Settings, Share2, Shield, ShieldCheck, Smartphone, Terminal, TrendingUp, UserCircle, Users, Zap } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4,h5,h6,.font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre,.font-mono { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #f5f5f4; }
    ::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 3px; }
    /* Toggle Switch */
    .toggle-bg { transition: background-color 0.2s; }
    .toggle-dot { transition: transform 0.2s; }
`;

function AppSettings() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* ===== SIDEBAR ===== */}
<aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-10">

  {/* Logo */}
  <div className="px-5 py-4 border-b border-stone-200 flex-shrink-0">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
        <Zap className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
      <span className="text-[10px] text-stone-400 ml-0.5" style={{fontFamily: "'JetBrains Mono',monospace"}}>v2</span>
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
        <li><a href="/app/notifications" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors duration-150"><Bell className="w-4 h-4 flex-shrink-0" />알림</a></li>
        <li><a href="/app/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm bg-violet-50 text-violet-700 font-medium"><Settings className="w-4 h-4 flex-shrink-0" />설정</a></li>
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
  <header className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-6 sticky top-0 z-10">
    <h1 className="text-base font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>설정</h1>
  </header>

  <div className="p-6 flex gap-6">

    {/* ── Left: Settings Tab Navigation (200px) ── */}
    <div className="w-48 flex-shrink-0">
      <nav className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <ul>
          <li>
            <button className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium bg-violet-50 text-violet-700 border-l-2 border-violet-600 text-left" onClick="showTab('profile')">
              <UserCircle className="w-4 h-4 flex-shrink-0" />
              프로필
            </button>
          </li>
          <li className="border-t border-stone-100">
            <button className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-stone-600 hover:bg-stone-50 transition-colors border-l-2 border-transparent text-left" onClick="showTab('notifications')">
              <Bell className="w-4 h-4 flex-shrink-0" />
              알림 설정
            </button>
          </li>
          <li className="border-t border-stone-100">
            <button className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-stone-600 hover:bg-stone-50 transition-colors border-l-2 border-transparent text-left" onClick="showTab('security')">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              보안
            </button>
          </li>
          <li className="border-t border-stone-100">
            <button className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-stone-600 hover:bg-stone-50 transition-colors border-l-2 border-transparent text-left" onClick="showTab('workspace')">
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              워크스페이스
            </button>
          </li>
          <li className="border-t border-stone-100">
            <button className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-stone-600 hover:bg-stone-50 transition-colors border-l-2 border-transparent text-left" onClick="showTab('integrations')">
              <Plug className="w-4 h-4 flex-shrink-0" />
              연동 서비스
            </button>
          </li>
          <li className="border-t border-stone-100">
            <button className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-stone-600 hover:bg-stone-50 transition-colors border-l-2 border-transparent text-left" onClick="showTab('billing')">
              <CreditCard className="w-4 h-4 flex-shrink-0" />
              결제/구독
            </button>
          </li>
        </ul>
      </nav>
    </div>

    {/* ── Right: Content Area ── */}
    <div className="flex-1 max-w-2xl space-y-5">

      {/* ════ PROFILE SECTION (Active) ════ */}
      <div id="tab-profile">

        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-stone-900 mb-5" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>프로필 정보</h2>

          {/* Avatar Upload */}
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-stone-100">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-2xl font-bold">김</div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-stone-200 hover:border-violet-300 rounded-full flex items-center justify-center shadow-sm transition-colors">
                <Camera className="w-3.5 h-3.5 text-stone-600" />
              </button>
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>프로필 사진</p>
              <p className="text-xs text-stone-500 mt-0.5">JPG, PNG 최대 2MB</p>
              <div className="flex gap-2 mt-2">
                <button className="text-xs text-violet-600 hover:text-violet-700 font-medium">사진 업로드</button>
                <span className="text-stone-300">|</span>
                <button className="text-xs text-stone-500 hover:text-stone-600">제거</button>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">

            {/* 이름 */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">이름</label>
              <input type="text" value="김대표" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-stone-900" />
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">이메일</label>
              <div className="flex gap-2">
                <input type="email" value="kim@acme.co.kr" className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-stone-900" />
                <button className="flex-shrink-0 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-3 py-2 text-sm font-medium transition-colors">
                  변경
                </button>
              </div>
              <p className="text-xs text-stone-400 mt-1">이메일 변경 시 인증 메일이 발송됩니다.</p>
            </div>

            {/* 회사명 */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">회사명</label>
              <input type="text" value="ACME Corp" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-stone-900" />
            </div>

            {/* 역할 (읽기전용) */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">역할</label>
              <div className="flex items-center gap-2">
                <input type="text" value="CEO" disabled className="flex-1 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2 text-sm text-stone-500 cursor-not-allowed" />
                <span className="text-xs text-stone-400">변경 불가</span>
              </div>
              <p className="text-xs text-stone-400 mt-1">역할은 워크스페이스 소유자에 의해 부여됩니다.</p>
            </div>

            {/* 언어 */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">언어</label>
              <select className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-stone-900">
                <option selected>한국어</option>
                <option>English</option>
                <option>日本語</option>
                <option>中文 (简体)</option>
              </select>
            </div>

            {/* 타임존 */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">타임존</label>
              <select className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-stone-900">
                <option selected>Asia/Seoul (UTC+9)</option>
                <option>America/New_York (UTC-5)</option>
                <option>Europe/London (UTC+0)</option>
              </select>
            </div>

          </div>

          {/* Save Button */}
          <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
            <button className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-150">
              <Save className="w-4 h-4" />
              변경사항 저장
            </button>
          </div>
        </div>

      </div>{/* /profile tab */}

      {/* ════ NOTIFICATION SETTINGS (Collapsed Preview) ════ */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors" onClick="showTab('notifications')">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-stone-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>알림 설정</p>
              <p className="text-xs text-stone-500 mt-0.5">작업완료, 에러, 비용경고 알림을 개별 설정</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
        {/* Collapsed preview of toggle items */}
        <div className="border-t border-stone-100 px-6 py-4 space-y-3 bg-stone-50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-600">작업완료 알림</span>
            {/* Toggle ON */}
            <div className="relative w-9 h-5 cursor-pointer">
              <div className="toggle-bg w-9 h-5 rounded-full bg-violet-600"></div>
              <div className="toggle-dot absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow translate-x-4"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-600">에러 알림</span>
            <div className="relative w-9 h-5 cursor-pointer">
              <div className="toggle-bg w-9 h-5 rounded-full bg-violet-600"></div>
              <div className="toggle-dot absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow translate-x-4"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-600">비용경고 알림</span>
            <div className="relative w-9 h-5 cursor-pointer">
              <div className="toggle-bg w-9 h-5 rounded-full bg-violet-600"></div>
              <div className="toggle-dot absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow translate-x-4"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-600">시스템 알림</span>
            <div className="relative w-9 h-5 cursor-pointer">
              <div className="toggle-bg w-9 h-5 rounded-full bg-stone-300"></div>
              <div className="toggle-dot absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-600">이메일 주간 요약</span>
            <div className="relative w-9 h-5 cursor-pointer">
              <div className="toggle-bg w-9 h-5 rounded-full bg-violet-600"></div>
              <div className="toggle-dot absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow translate-x-4"></div>
            </div>
          </div>
        </div>
      </div>

      {/* ════ SECURITY (Collapsed Preview) ════ */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors" onClick="showTab('security')">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-stone-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>보안</p>
              <p className="text-xs text-stone-500 mt-0.5">비밀번호 변경 및 2단계 인증 설정</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
        <div className="border-t border-stone-100 px-6 py-4 space-y-3 bg-stone-50">
          {/* Password Change */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-stone-200">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-stone-500" />
              <div>
                <p className="text-xs font-medium text-stone-900">비밀번호 변경</p>
                <p className="text-[11px] text-stone-500">최근 변경: 30일 전</p>
              </div>
            </div>
            <button className="text-xs text-violet-600 hover:text-violet-700 font-medium border border-violet-200 hover:border-violet-300 rounded-lg px-3 py-1.5 transition-colors">
              변경하기
            </button>
          </div>
          {/* 2FA */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-stone-200">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-stone-500" />
              <div>
                <p className="text-xs font-medium text-stone-900">2단계 인증 (2FA)</p>
                <p className="text-[11px] text-stone-500">현재 <span className="text-amber-600 font-medium">비활성</span> 상태</p>
              </div>
            </div>
            <button className="text-xs text-white font-medium bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-1.5 transition-colors">
              활성화
            </button>
          </div>
          {/* Active Sessions */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-stone-200">
            <div className="flex items-center gap-2.5">
              <Monitor className="w-4 h-4 text-stone-500" />
              <div>
                <p className="text-xs font-medium text-stone-900">활성 세션</p>
                <p className="text-[11px] text-stone-500">현재 <span className="font-medium text-stone-700">2개</span> 기기에서 로그인 중</p>
              </div>
            </div>
            <button className="text-xs text-red-600 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 rounded-lg px-3 py-1.5 transition-colors">
              모두 종료
            </button>
          </div>
        </div>
      </div>

      {/* ════ WORKSPACE (Collapsed Preview) ════ */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-stone-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>워크스페이스</p>
              <p className="text-xs text-stone-500 mt-0.5">워크스페이스 이름, 로고, 기본 설정</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
      </div>

      {/* ════ INTEGRATIONS (Collapsed Preview) ════ */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
              <Plug className="w-4 h-4 text-stone-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>연동 서비스</p>
              <p className="text-xs text-stone-500 mt-0.5">Slack, Google Drive, Notion 등 외부 서비스 연결</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
      </div>

      {/* ════ BILLING (Collapsed Preview) ════ */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-stone-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>결제/구독</p>
              <p className="text-xs text-stone-500 mt-0.5">현재 플랜: <span className="font-medium text-violet-700">Pro</span> · 다음 청구일 2026-04-01</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-red-700 mb-3" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>위험 구역</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-900">워크스페이스 데이터 초기화</p>
              <p className="text-xs text-stone-500 mt-0.5">모든 에이전트, 부서, 작업 기록이 삭제됩니다.</p>
            </div>
            <button className="flex-shrink-0 text-xs text-red-600 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 rounded-lg px-3 py-2 transition-colors">
              초기화
            </button>
          </div>
          <div className="h-px bg-red-50"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-900">계정 삭제</p>
              <p className="text-xs text-stone-500 mt-0.5">계정과 모든 데이터가 영구 삭제됩니다.</p>
            </div>
            <button className="flex-shrink-0 text-xs text-white font-medium bg-red-600 hover:bg-red-700 rounded-lg px-3 py-2 transition-colors">
              계정 삭제
            </button>
          </div>
        </div>
      </div>

    </div>{/* /content area */}

  </div>{/* /flex */}
</main>
    </>
  );
}

export default AppSettings;
