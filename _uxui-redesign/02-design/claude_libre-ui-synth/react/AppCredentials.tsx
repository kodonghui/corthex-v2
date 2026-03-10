"use client";
import React from "react";
import { Activity, AlertTriangle, BarChart2, Bell, BookOpen, Bot, BrainCircuit, Briefcase, Building2, Calendar, Clock, Cpu, CreditCard, Edit2, Eye, EyeOff, FileText, Folder, Home, Info, Instagram, Key, LayoutDashboard, List, Lock, MessageCircle, PenTool, Plus, RotateCw, Rss, Search, Send, Settings, Share2, Shield, ShieldCheck, Terminal, Trash2, TrendingUp, Users } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #fafaf9; }
    ::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 3px; }`;

function AppCredentials() {
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
    <a href="/app/performance" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><BarChart2 className="w-4 h-4" />전력분석</a>
    <a href="/app/costs" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><CreditCard className="w-4 h-4" />비용 관리</a>
    <a href="/app/activity-log" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Activity className="w-4 h-4" />활동 로그</a>
    <a href="/app/argos" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Eye className="w-4 h-4" />아르고스</a>
    <a href="/app/credentials" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-violet-50 text-violet-700 text-sm font-medium"><Key className="w-4 h-4" />크리덴셜</a>
    <a href="/app/ops-log" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><List className="w-4 h-4" />운영 로그</a>
    <a href="/app/settings" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm mt-2"><Settings className="w-4 h-4" />설정</a>
  </nav>
</aside>

{/* MAIN */}
<main className="ml-60 flex-1 p-6 min-h-screen">
  {/* Header */}
  <div className="flex items-center justify-between mb-5">
    <div>
      <h1 className="text-xl font-bold text-stone-900">크리덴셜</h1>
      <p className="text-sm text-stone-500 mt-0.5">외부 API 키 및 인증 정보 보관 — API: GET /api/workspace/credentials</p>
    </div>
    {/* API: POST /api/workspace/credentials */}
    <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all duration-150">
      <Plus className="w-4 h-4" />새 크리덴셜 추가
    </button>
  </div>

  {/* Security Banner */}
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
      <ShieldCheck className="w-4 h-4 text-blue-600" />
    </div>
    <div>
      <p className="text-sm font-semibold text-blue-900">암호화 보안 적용 중</p>
      <p className="text-xs text-blue-700 mt-0.5">모든 크리덴셜은 <strong>AES-256-GCM</strong>으로 암호화되어 저장됩니다. 키 값은 서버에서도 평문으로 조회되지 않으며, 사용 시에만 복호화됩니다.</p>
    </div>
    <div className="ml-auto text-xs text-blue-500 flex-shrink-0">마지막 보안 감사: 2026-03-01</div>
  </div>

  {/* Status Summary */}
  <div className="grid grid-cols-4 gap-4 mb-6">
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 text-center">
      <div className="text-2xl font-bold text-stone-900 mb-1" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>6</div>
      <div className="text-xs text-stone-500">전체 크리덴셜</div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 text-center">
      <div className="text-2xl font-bold text-emerald-700 mb-1" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>3</div>
      <div className="text-xs text-stone-500">정상 활성</div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 text-center">
      <div className="text-2xl font-bold text-amber-600 mb-1" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>2</div>
      <div className="text-xs text-stone-500">만료 임박</div>
    </div>
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 text-center">
      <div className="text-2xl font-bold text-red-600 mb-1" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>1</div>
      <div className="text-xs text-stone-500">만료됨</div>
    </div>
  </div>

  {/* Credential Cards */}
  <div className="space-y-3">

    {/* Card 1: KIS 증권 API — Active */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex items-center gap-5">
      <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-100">
        <TrendingUp className="w-6 h-6 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-bold text-stone-900">KIS 증권 API</span>
          <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">활성</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Key className="w-3 h-3" />
            <code className="bg-stone-100 px-2 py-0.5 rounded text-stone-700" style={{"fontFamily":"'JetBrains Mono',monospace"}}>****...***8f2a</code>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            <span>만료: 2026-12-31</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>등록: 2025-01-15</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bot className="w-3 h-3" />
            <span>에이전트 2명 사용 중 (김재원, 정도현)</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <div className="text-xs text-stone-400">잔여 유효기간</div>
          <div className="text-sm font-semibold text-emerald-700">298일</div>
        </div>
        <button className="bg-white border border-stone-200 text-stone-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">
          <Edit2 className="w-3 h-3 inline mr-1" />편집
        </button>
        <button className="bg-white border border-stone-200 text-stone-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">
          <RotateCw className="w-3 h-3 inline mr-1" />갱신
        </button>
      </div>
    </div>

    {/* Card 2: Anthropic API — Active */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex items-center gap-5">
      <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-violet-100">
        <Cpu className="w-6 h-6 text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-bold text-stone-900">Anthropic API</span>
          <span className="text-xs text-stone-400">(Claude CLI 토큰)</span>
          <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">활성</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Key className="w-3 h-3" />
            <code className="bg-stone-100 px-2 py-0.5 rounded text-stone-700" style={{"fontFamily":"'JetBrains Mono',monospace"}}>****...***3c9d</code>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            <span>만료: 2025-09-30</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>등록: 2024-09-30</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bot className="w-3 h-3" />
            <span>에이전트 8명 사용 중 (전체)</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <div className="text-xs text-stone-400">잔여 유효기간</div>
          <div className="text-sm font-semibold text-emerald-700">204일</div>
        </div>
        <button className="bg-white border border-stone-200 text-stone-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">
          <Edit2 className="w-3 h-3 inline mr-1" />편집
        </button>
        <button className="bg-white border border-stone-200 text-stone-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">
          <RotateCw className="w-3 h-3 inline mr-1" />갱신
        </button>
      </div>
    </div>

    {/* Card 3: OpenAI API — 만료임박 (90일) */}
    <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-5 flex items-center gap-5">
      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-200">
        <BrainCircuit className="w-6 h-6 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-bold text-stone-900">OpenAI API</span>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 text-xs font-medium">만료임박 ⚠</span>
          <span className="text-xs text-amber-600 font-medium">90일 후 만료</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Key className="w-3 h-3" />
            <code className="bg-stone-100 px-2 py-0.5 rounded text-stone-700" style={{"fontFamily":"'JetBrains Mono',monospace"}}>****...***7b1e</code>
          </div>
          <div className="flex items-center gap-1.5 text-amber-600">
            <Calendar className="w-3 h-3" />
            <span>만료: 2025-06-15</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>등록: 2024-06-15</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bot className="w-3 h-3" />
            <span>에이전트 3명 사용 중</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <div className="text-xs text-stone-400">잔여 유효기간</div>
          <div className="text-sm font-semibold text-amber-600">90일</div>
        </div>
        <button className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150">
          <RotateCw className="w-3 h-3 inline mr-1" />지금 갱신
        </button>
        <button className="bg-white border border-stone-200 text-stone-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">
          <Edit2 className="w-3 h-3 inline mr-1" />편집
        </button>
      </div>
    </div>

    {/* Card 4: Instagram Business — 만료임박 (22일) */}
    <div className="bg-white rounded-xl border border-red-200 shadow-sm p-5 flex items-center gap-5">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-pink-100">
        <Instagram className="w-6 h-6 text-pink-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-bold text-stone-900">Instagram Business</span>
          <span className="bg-red-50 text-red-700 border border-red-200 rounded-full px-2.5 py-0.5 text-xs font-medium">만료임박 ⚠</span>
          <span className="text-xs text-red-600 font-semibold">22일 후 만료 — 즉시 갱신 필요!</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Key className="w-3 h-3" />
            <code className="bg-stone-100 px-2 py-0.5 rounded text-stone-700" style={{"fontFamily":"'JetBrains Mono',monospace"}}>****...***2a4f</code>
          </div>
          <div className="flex items-center gap-1.5 text-red-600">
            <Calendar className="w-3 h-3" />
            <span>만료: 2025-04-01</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>등록: 2024-10-01</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bot className="w-3 h-3" />
            <span>에이전트 1명 사용 중 (최민지)</span>
          </div>
        </div>
        <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
          <p className="text-xs text-red-700"><span className="font-semibold">주의:</span> Instagram API 토큰 만료로 최민지 에이전트의 SNS 발행이 실패하고 있습니다. 즉시 토큰을 갱신해 주세요.</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <div className="text-xs text-stone-400">잔여 유효기간</div>
          <div className="text-sm font-semibold text-red-600">22일</div>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150">
          <AlertTriangle className="w-3 h-3 inline mr-1" />즉시 갱신
        </button>
        <button className="bg-white border border-stone-200 text-stone-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">
          <Edit2 className="w-3 h-3 inline mr-1" />편집
        </button>
      </div>
    </div>

    {/* Card 5: Google Search API — Active */}
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex items-center gap-5">
      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
        <Search className="w-6 h-6 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-bold text-stone-900">Google Search API</span>
          <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">활성</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Key className="w-3 h-3" />
            <code className="bg-stone-100 px-2 py-0.5 rounded text-stone-700" style={{"fontFamily":"'JetBrains Mono',monospace"}}>****...***5c7g</code>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            <span>만료: 2026-03-01</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>등록: 2025-03-01</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bot className="w-3 h-3" />
            <span>에이전트 4명 사용 중</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <div className="text-xs text-stone-400">잔여 유효기간</div>
          <div className="text-sm font-semibold text-emerald-700">356일</div>
        </div>
        <button className="bg-white border border-stone-200 text-stone-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">
          <Edit2 className="w-3 h-3 inline mr-1" />편집
        </button>
        <button className="bg-white border border-stone-200 text-stone-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">
          <RotateCw className="w-3 h-3 inline mr-1" />갱신
        </button>
      </div>
    </div>

    {/* Card 6: Naver Blog API — 만료됨 */}
    <div className="bg-stone-50 rounded-xl border border-stone-200 shadow-sm p-5 flex items-center gap-5 opacity-70">
      <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-stone-200">
        <PenTool className="w-6 h-6 text-stone-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-bold text-stone-600">Naver Blog API</span>
          <span className="bg-red-50 text-red-700 rounded-full px-2.5 py-0.5 text-xs font-medium">만료 ✕</span>
          <span className="text-xs text-stone-400">2024-12-01 만료</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            <Key className="w-3 h-3" />
            <code className="bg-stone-200 px-2 py-0.5 rounded text-stone-500" style={{"fontFamily":"'JetBrains Mono',monospace"}}>****...***9d2h</code>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            <span>만료: 2024-12-01 (100일 경과)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bot className="w-3 h-3" />
            <span>에이전트 0명 사용</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <div className="text-xs text-stone-400">잔여 유효기간</div>
          <div className="text-sm font-semibold text-red-500">만료됨</div>
        </div>
        <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150">
          <Plus className="w-3 h-3 inline mr-1" />재등록
        </button>
        <button className="bg-white border border-stone-200 text-red-500 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-50">
          <Trash2 className="w-3 h-3 inline mr-1" />삭제
        </button>
      </div>
    </div>

  </div>

  {/* Usage Info */}
  <div className="mt-5 bg-white rounded-xl border border-stone-200 shadow-sm p-5">
    <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
      <Info className="w-4 h-4 text-stone-400" />크리덴셜 보안 정책
    </h4>
    <div className="grid grid-cols-3 gap-4 text-xs text-stone-600">
      <div className="flex items-start gap-2">
        <Lock className="w-3.5 h-3.5 text-violet-500 mt-0.5 flex-shrink-0" />
        <div><span className="font-semibold text-stone-700">암호화:</span> AES-256-GCM 방식. 서버 메모리에서도 복호화 최소화.</div>
      </div>
      <div className="flex items-start gap-2">
        <EyeOff className="w-3.5 h-3.5 text-violet-500 mt-0.5 flex-shrink-0" />
        <div><span className="font-semibold text-stone-700">마스킹:</span> UI에서는 마지막 4자리만 표시. 전체 값은 절대 노출 안 됨.</div>
      </div>
      <div className="flex items-start gap-2">
        <Bell className="w-3.5 h-3.5 text-violet-500 mt-0.5 flex-shrink-0" />
        <div><span className="font-semibold text-stone-700">알림:</span> 만료 30일 전, 7일 전 자동 알림 발송.</div>
      </div>
    </div>
  </div>
</main>
    </>
  );
}

export default AppCredentials;
