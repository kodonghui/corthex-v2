"use client";
import React from "react";
import { Activity, AlertCircle, AlertTriangle, Bell, Bot, Box, Check, CheckCircle, ChevronDown, ChevronRight, Clock, Cpu, Database, Download, Eye, FileBarChart, FileText, Inbox, Info, Layers, LayoutDashboard, Lock, MessageSquare, MoreHorizontal, MousePointerClick, Move, Palette, Plus, RefreshCw, Rocket, Search, Sidebar, Sparkles, Square, Tag, TextCursorInput, Trash2, TrendingUp, Type, User, UserCircle, Users, WifiOff, X, XCircle, Zap } from "lucide-react";

const styles = `
body { font-family: 'Inter', sans-serif; }
  h1, h2, h3, h4, h5, h6, .font-heading { font-family: 'Plus Jakarta Sans', sans-serif; }
  code, pre, .font-mono { font-family: 'JetBrains Mono', monospace; }

  /* Sidebar nav active */
  .nav-item { transition: all 150ms ease; }
  .nav-item:hover { background: #F5F3FF; color: #7C3AED; }
  .nav-item.active { background: #F5F3FF; color: #7C3AED; font-weight: 600; }

  /* Smooth scroll */
  html { scroll-behavior: smooth; }

  /* Section anchor offset */
  .section-anchor { scroll-margin-top: 24px; }

  /* Button transitions */
  .btn { transition: all 150ms ease; }

  /* Loading spinner */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { animation: spin 0.8s linear infinite; }

  /* Color chip hover */
  .color-chip { transition: transform 150ms ease, box-shadow 150ms ease; }
  .color-chip:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }

  /* Sidebar scroll */
  .sidebar { scrollbar-width: thin; scrollbar-color: #E7E5E4 transparent; }
`;

function DesignSystem() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Layout */}
<div className="flex min-h-screen">

  {/* ══════════════════════════════════════════
       SIDEBAR NAV (fixed)
  ══════════════════════════════════════════ */}
  <aside className="sidebar w-64 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col overflow-y-auto z-50">
    {/* Logo */}
    <div className="px-6 py-5 border-b border-stone-200">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-heading font-800 text-sm">C</span>
        </div>
        <div>
          <div className="font-heading font-700 text-stone-900 text-sm leading-tight">CORTHEX v2</div>
          <div className="text-xs text-stone-400">Design System</div>
        </div>
      </div>
    </div>

    {/* Nav Links */}
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      <div className="px-3 py-1.5 text-xs font-600 text-stone-400 uppercase tracking-wider">기초</div>
      <a href="/app/#colors" className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-700 cursor-pointer">
        <Palette className="w-4 h-4" /> 색상 Colors
      </a>
      <a href="/app/#typography" className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-700 cursor-pointer">
        <Type className="w-4 h-4" /> 타이포그래피
      </a>
      <a href="/app/#spacing" className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-700 cursor-pointer">
        <Move className="w-4 h-4" /> 간격 Spacing
      </a>
      <a href="/app/#radius" className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-700 cursor-pointer">
        <Square className="w-4 h-4" /> Border Radius
      </a>
      <a href="/app/#shadows" className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-700 cursor-pointer">
        <Layers className="w-4 h-4" /> 그림자 Shadows
      </a>

      <div className="px-3 py-1.5 mt-3 text-xs font-600 text-stone-400 uppercase tracking-wider">컴포넌트</div>
      <a href="/app/#buttons" className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-700 cursor-pointer">
        <MousePointerClick className="w-4 h-4" /> 버튼 Buttons
      </a>
      <a href="/app/#inputs" className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-700 cursor-pointer">
        <TextCursorInput className="w-4 h-4" /> 입력 Inputs
      </a>
      <a href="/app/#cards" className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-700 cursor-pointer">
        <LayoutDashboard className="w-4 h-4" /> 카드 Cards
      </a>
      <a href="/app/#badges" className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-700 cursor-pointer">
        <Tag className="w-4 h-4" /> 배지 Badges
      </a>
      <a href="/app/#alerts" className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-700 cursor-pointer">
        <Bell className="w-4 h-4" /> 알림 Alerts
      </a>
      <a href="/app/#avatars" className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-700 cursor-pointer">
        <UserCircle className="w-4 h-4" /> 아바타 Avatar
      </a>
      <a href="/app/#navigation" className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-700 cursor-pointer">
        <Sidebar className="w-4 h-4" /> 내비게이션
      </a>
      <a href="/app/#empty-states" className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-700 cursor-pointer">
        <Inbox className="w-4 h-4" /> 빈 상태
      </a>
    </nav>

    {/* Footer */}
    <div className="px-4 py-3 border-t border-stone-200">
      <div className="text-xs text-stone-400">CORTHEX v2 · 2026</div>
    </div>
  </aside>

  {/* ══════════════════════════════════════════
       MAIN CONTENT
  ══════════════════════════════════════════ */}
  <main className="ml-64 flex-1 px-10 py-10 max-w-5xl">

    {/* Page Header */}
    <div className="mb-12">
      <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-600 px-3 py-1 rounded-full text-xs font-600 mb-4">
        <Sparkles className="w-3.5 h-3.5" /> Design System v2.0
      </div>
      <h1 className="font-heading text-4xl font-800 text-stone-900 mb-3">CORTHEX Design System</h1>
      <p className="text-stone-500 text-lg max-w-2xl">브랜드 가이드를 기반으로 한 공식 컴포넌트 라이브러리입니다. 모든 UI는 이 시스템을 기준으로 구현됩니다.</p>
    </div>


    {/* ══════════════════════════
         1. COLORS
    ══════════════════════════ */}
    <section id="colors" className="section-anchor mb-16">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-700 text-stone-900 mb-1">색상 시스템</h2>
        <p className="text-stone-500 text-sm">모든 색상은 Tailwind CSS 기본 팔레트에서 선택되었습니다.</p>
      </div>

      {/* Primary */}
      <div className="mb-8">
        <h3 className="font-heading text-sm font-600 text-stone-500 uppercase tracking-wider mb-3">Primary — Violet</h3>
        <div className="flex gap-3 flex-wrap">
          <div className="color-chip w-36 rounded-xl overflow-hidden shadow border border-stone-200">
            <div className="h-20 bg-violet-600"></div>
            <div className="bg-white px-3 py-2.5">
              <div className="font-600 text-stone-900 text-sm">violet-600</div>
              <div className="font-mono text-xs text-stone-400">#7C3AED</div>
              <div className="text-xs text-stone-500 mt-0.5">CTA 버튼, 활성 상태</div>
            </div>
          </div>
          <div className="color-chip w-36 rounded-xl overflow-hidden shadow border border-stone-200">
            <div className="h-20 bg-violet-500"></div>
            <div className="bg-white px-3 py-2.5">
              <div className="font-600 text-stone-900 text-sm">violet-500</div>
              <div className="font-mono text-xs text-stone-400">#8B5CF6</div>
              <div className="text-xs text-stone-500 mt-0.5">아이콘, 링크</div>
            </div>
          </div>
          <div className="color-chip w-36 rounded-xl overflow-hidden shadow border border-stone-200">
            <div className="h-20 bg-violet-50 border-b border-stone-100"></div>
            <div className="bg-white px-3 py-2.5">
              <div className="font-600 text-stone-900 text-sm">violet-50</div>
              <div className="font-mono text-xs text-stone-400">#F5F3FF</div>
              <div className="text-xs text-stone-500 mt-0.5">선택 배경</div>
            </div>
          </div>
        </div>
      </div>

      {/* Accent */}
      <div className="mb-8">
        <h3 className="font-heading text-sm font-600 text-stone-500 uppercase tracking-wider mb-3">Accent — Orange</h3>
        <div className="flex gap-3 flex-wrap">
          <div className="color-chip w-36 rounded-xl overflow-hidden shadow border border-stone-200">
            <div className="h-20 bg-orange-500"></div>
            <div className="bg-white px-3 py-2.5">
              <div className="font-600 text-stone-900 text-sm">orange-500</div>
              <div className="font-mono text-xs text-stone-400">#F97316</div>
              <div className="text-xs text-stone-500 mt-0.5">AI Working, 퀵 액션</div>
            </div>
          </div>
          <div className="color-chip w-36 rounded-xl overflow-hidden shadow border border-stone-200">
            <div className="h-20 bg-orange-50 border-b border-stone-100"></div>
            <div className="bg-white px-3 py-2.5">
              <div className="font-600 text-stone-900 text-sm">orange-50</div>
              <div className="font-mono text-xs text-stone-400">#FFF7ED</div>
              <div className="text-xs text-stone-500 mt-0.5">Accent 배경</div>
            </div>
          </div>
        </div>
      </div>

      {/* Neutral */}
      <div className="mb-8">
        <h3 className="font-heading text-sm font-600 text-stone-500 uppercase tracking-wider mb-3">Neutral — Stone</h3>
        <div className="flex gap-3 flex-wrap">
          <div className="color-chip w-36 rounded-xl overflow-hidden shadow border border-stone-200">
            <div className="h-20 bg-stone-50 border-b border-stone-100"></div>
            <div className="bg-white px-3 py-2.5">
              <div className="font-600 text-stone-900 text-sm">stone-50</div>
              <div className="font-mono text-xs text-stone-400">#FAFAF9</div>
              <div className="text-xs text-stone-500 mt-0.5">페이지 배경</div>
            </div>
          </div>
          <div className="color-chip w-36 rounded-xl overflow-hidden shadow border border-stone-200">
            <div className="h-20 bg-stone-200 border-b border-stone-100"></div>
            <div className="bg-white px-3 py-2.5">
              <div className="font-600 text-stone-900 text-sm">stone-200</div>
              <div className="font-mono text-xs text-stone-400">#E7E5E4</div>
              <div className="text-xs text-stone-500 mt-0.5">테두리</div>
            </div>
          </div>
          <div className="color-chip w-36 rounded-xl overflow-hidden shadow border border-stone-200">
            <div className="h-20 bg-stone-800"></div>
            <div className="bg-white px-3 py-2.5">
              <div className="font-600 text-stone-900 text-sm">stone-800</div>
              <div className="font-mono text-xs text-stone-400">#292524</div>
              <div className="text-xs text-stone-500 mt-0.5">본문 텍스트</div>
            </div>
          </div>
          <div className="color-chip w-36 rounded-xl overflow-hidden shadow border border-stone-200">
            <div className="h-20 bg-stone-900"></div>
            <div className="bg-white px-3 py-2.5">
              <div className="font-600 text-stone-900 text-sm">stone-900</div>
              <div className="font-mono text-xs text-stone-400">#1C1917</div>
              <div className="text-xs text-stone-500 mt-0.5">제목 텍스트</div>
            </div>
          </div>
        </div>
      </div>

      {/* Semantic */}
      <div className="mb-8">
        <h3 className="font-heading text-sm font-600 text-stone-500 uppercase tracking-wider mb-3">시맨틱 색상 — Semantic</h3>
        <div className="flex gap-3 flex-wrap">
          <div className="color-chip w-36 rounded-xl overflow-hidden shadow border border-stone-200">
            <div className="h-20 bg-emerald-500"></div>
            <div className="bg-white px-3 py-2.5">
              <div className="font-600 text-stone-900 text-sm">emerald-500</div>
              <div className="font-mono text-xs text-stone-400">#10B981</div>
              <div className="text-xs text-stone-500 mt-0.5">Success</div>
            </div>
          </div>
          <div className="color-chip w-36 rounded-xl overflow-hidden shadow border border-stone-200">
            <div className="h-20 bg-amber-500"></div>
            <div className="bg-white px-3 py-2.5">
              <div className="font-600 text-stone-900 text-sm">amber-500</div>
              <div className="font-mono text-xs text-stone-400">#F59E0B</div>
              <div className="text-xs text-stone-500 mt-0.5">Warning</div>
            </div>
          </div>
          <div className="color-chip w-36 rounded-xl overflow-hidden shadow border border-stone-200">
            <div className="h-20 bg-red-500"></div>
            <div className="bg-white px-3 py-2.5">
              <div className="font-600 text-stone-900 text-sm">red-500</div>
              <div className="font-mono text-xs text-stone-400">#EF4444</div>
              <div className="text-xs text-stone-500 mt-0.5">Error / Danger</div>
            </div>
          </div>
          <div className="color-chip w-36 rounded-xl overflow-hidden shadow border border-stone-200">
            <div className="h-20 bg-blue-500"></div>
            <div className="bg-white px-3 py-2.5">
              <div className="font-600 text-stone-900 text-sm">blue-500</div>
              <div className="font-mono text-xs text-stone-400">#3B82F6</div>
              <div className="text-xs text-stone-500 mt-0.5">Info</div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Status Colors */}
      <div>
        <h3 className="font-heading text-sm font-600 text-stone-500 uppercase tracking-wider mb-3">에이전트 상태 색상 — Agent Status</h3>
        <div className="bg-white rounded-xl border border-stone-200 shadow p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <div>
                <div className="font-600 text-stone-900 text-sm">Online</div>
                <div className="font-mono text-xs text-stone-400">emerald-500 · 대기 중</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <div>
                <div className="font-600 text-stone-900 text-sm">Working</div>
                <div className="font-mono text-xs text-stone-400">orange-500 · 작업 중 (pulse)</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <div className="font-600 text-stone-900 text-sm">Error</div>
                <div className="font-mono text-xs text-stone-400">red-500 · 오류</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-stone-100 rounded-lg">
              <div className="w-3 h-3 bg-stone-400 rounded-full"></div>
              <div>
                <div className="font-600 text-stone-900 text-sm">Offline</div>
                <div className="font-mono text-xs text-stone-400">stone-400 · 오프라인</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


    {/* ══════════════════════════
         2. TYPOGRAPHY
    ══════════════════════════ */}
    <section id="typography" className="section-anchor mb-16">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-700 text-stone-900 mb-1">타이포그래피</h2>
        <p className="text-stone-500 text-sm">Plus Jakarta Sans (제목) · Inter (본문) · JetBrains Mono (코드)</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow p-8 space-y-6">
        {/* Display */}
        <div className="pb-6 border-b border-stone-100">
          <div className="text-xs font-mono text-stone-400 mb-2">Display · Plus Jakarta Sans 800 · 48px</div>
          <div className="font-heading text-5xl font-800 text-stone-900 leading-tight">AI가 일하는 조직</div>
        </div>
        {/* H1 */}
        <div className="pb-6 border-b border-stone-100">
          <div className="text-xs font-mono text-stone-400 mb-2">H1 · Plus Jakarta Sans 700 · 36px</div>
          <h1 className="font-heading text-4xl font-700 text-stone-900">대시보드 개요</h1>
        </div>
        {/* H2 */}
        <div className="pb-6 border-b border-stone-100">
          <div className="text-xs font-mono text-stone-400 mb-2">H2 · Plus Jakarta Sans 700 · 28px</div>
          <h2 className="font-heading text-3xl font-700 text-stone-900">에이전트 현황</h2>
        </div>
        {/* H3 */}
        <div className="pb-6 border-b border-stone-100">
          <div className="text-xs font-mono text-stone-400 mb-2">H3 · Plus Jakarta Sans 600 · 22px</div>
          <h3 className="font-heading text-2xl font-600 text-stone-900">마케팅 부서</h3>
        </div>
        {/* H4 */}
        <div className="pb-6 border-b border-stone-100">
          <div className="text-xs font-mono text-stone-400 mb-2">H4 · Plus Jakarta Sans 600 · 18px</div>
          <h4 className="font-heading text-lg font-600 text-stone-900">작업 완료율 98.3%</h4>
        </div>
        {/* Body LG */}
        <div className="pb-6 border-b border-stone-100">
          <div className="text-xs font-mono text-stone-400 mb-2">Body LG · Inter 400 · 18px</div>
          <p className="text-lg text-stone-800 leading-relaxed">CORTHEX는 AI 에이전트와 인간 직원이 함께 협업하는 동적 조직 관리 플랫폼입니다. 각 에이전트는 독립적으로 작업을 수행하며 실시간으로 결과를 보고합니다.</p>
        </div>
        {/* Body MD */}
        <div className="pb-6 border-b border-stone-100">
          <div className="text-xs font-mono text-stone-400 mb-2">Body MD · Inter 400 · 16px</div>
          <p className="text-base text-stone-700 leading-relaxed">에이전트의 CLI 토큰을 등록하면 해당 에이전트가 즉시 활성화됩니다. 토큰은 AES-256-GCM으로 암호화되어 안전하게 보관됩니다.</p>
        </div>
        {/* Body SM */}
        <div className="pb-6 border-b border-stone-100">
          <div className="text-xs font-mono text-stone-400 mb-2">Body SM · Inter 400 · 14px</div>
          <p className="text-sm text-stone-600 leading-relaxed">마지막 활동: 2분 전 · 작업 완료: 47건 · 오류율: 0.2%</p>
        </div>
        {/* Caption */}
        <div className="pb-6 border-b border-stone-100">
          <div className="text-xs font-mono text-stone-400 mb-2">Caption · Inter 400 · 12px</div>
          <p className="text-xs text-stone-500">에이전트 ID: AGT-20240315-001 · 생성일: 2024.03.15</p>
        </div>
        {/* Code */}
        <div>
          <div className="text-xs font-mono text-stone-400 mb-2">Code · JetBrains Mono 400 · 14px</div>
          <code className="block bg-stone-900 text-emerald-400 font-mono text-sm rounded-lg px-4 py-3">
            POST /api/agents/execute · { "agentId": "AGT-001", "task": "market-analysis" }
          </code>
        </div>
      </div>
    </section>


    {/* ══════════════════════════
         3. SPACING
    ══════════════════════════ */}
    <section id="spacing" className="section-anchor mb-16">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-700 text-stone-900 mb-1">간격 시스템</h2>
        <p className="text-stone-500 text-sm">4px 기반 8단계 스케일 (Tailwind 기본)</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow p-6 space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-24 text-right font-mono text-xs text-stone-400">4px · p-1</div>
          <div className="h-5 bg-violet-100 rounded" style={{width: "4px"}}></div>
          <div className="text-xs text-stone-500">아이콘 내부 여백</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-24 text-right font-mono text-xs text-stone-400">8px · p-2</div>
          <div className="h-5 bg-violet-200 rounded" style={{width: "8px"}}></div>
          <div className="text-xs text-stone-500">배지, 칩 내부 여백</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-24 text-right font-mono text-xs text-stone-400">12px · p-3</div>
          <div className="h-5 bg-violet-300 rounded" style={{width: "12px"}}></div>
          <div className="text-xs text-stone-500">버튼 내부 여백 (sm)</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-24 text-right font-mono text-xs text-stone-400">16px · p-4</div>
          <div className="h-5 bg-violet-400 rounded" style={{width: "16px"}}></div>
          <div className="text-xs text-stone-500">버튼 내부 여백 (md), 카드 내부</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-24 text-right font-mono text-xs text-stone-400">20px · p-5</div>
          <div className="h-5 bg-violet-500 rounded" style={{width: "20px"}}></div>
          <div className="text-xs text-stone-500">카드 내부 여백 (md)</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-24 text-right font-mono text-xs text-stone-400">24px · p-6</div>
          <div className="h-5 bg-violet-600 rounded" style={{width: "24px"}}></div>
          <div className="text-xs text-stone-500">섹션 내부 여백, 사이드바</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-24 text-right font-mono text-xs text-stone-400">32px · p-8</div>
          <div className="h-5 bg-violet-700 rounded" style={{width: "32px"}}></div>
          <div className="text-xs text-stone-500">페이지 패딩, 모달 내부</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-24 text-right font-mono text-xs text-stone-400">48px · p-12</div>
          <div className="h-5 bg-violet-800 rounded" style={{width: "48px"}}></div>
          <div className="text-xs text-stone-500">섹션 간격, 빈 상태 여백</div>
        </div>
      </div>
    </section>


    {/* ══════════════════════════
         4. BORDER RADIUS
    ══════════════════════════ */}
    <section id="radius" className="section-anchor mb-16">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-700 text-stone-900 mb-1">Border Radius</h2>
        <p className="text-stone-500 text-sm">컴포넌트 유형에 따른 곡률 기준</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow p-6">
        <div className="flex gap-6 flex-wrap items-end">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-violet-100 border-2 border-violet-300 rounded-sm flex items-center justify-center">
              <span className="text-violet-600 text-xs font-600">sm</span>
            </div>
            <div className="text-center">
              <div className="font-600 text-stone-800 text-sm">rounded-sm</div>
              <div className="font-mono text-xs text-stone-400">4px</div>
              <div className="text-xs text-stone-500">체크박스, 태그</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-violet-100 border-2 border-violet-300 rounded flex items-center justify-center">
              <span className="text-violet-600 text-xs font-600">base</span>
            </div>
            <div className="text-center">
              <div className="font-600 text-stone-800 text-sm">rounded</div>
              <div className="font-mono text-xs text-stone-400">6px</div>
              <div className="text-xs text-stone-500">인풋, 드롭다운</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-violet-100 border-2 border-violet-300 rounded-lg flex items-center justify-center">
              <span className="text-violet-600 text-xs font-600">lg</span>
            </div>
            <div className="text-center">
              <div className="font-600 text-stone-800 text-sm">rounded-lg</div>
              <div className="font-mono text-xs text-stone-400">8px</div>
              <div className="text-xs text-stone-500 font-600 text-violet-600">버튼 (기본)</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-violet-100 border-2 border-violet-300 rounded-xl flex items-center justify-center">
              <span className="text-violet-600 text-xs font-600">xl</span>
            </div>
            <div className="text-center">
              <div className="font-600 text-stone-800 text-sm">rounded-xl</div>
              <div className="font-mono text-xs text-stone-400">12px</div>
              <div className="text-xs text-stone-500 font-600 text-violet-600">카드 (기본)</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-violet-100 border-2 border-violet-300 rounded-2xl flex items-center justify-center">
              <span className="text-violet-600 text-xs font-600">2xl</span>
            </div>
            <div className="text-center">
              <div className="font-600 text-stone-800 text-sm">rounded-2xl</div>
              <div className="font-mono text-xs text-stone-400">16px</div>
              <div className="text-xs text-stone-500 font-600 text-violet-600">모달 (기본)</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-violet-100 border-2 border-violet-300 rounded-full flex items-center justify-center">
              <span className="text-violet-600 text-xs font-600">full</span>
            </div>
            <div className="text-center">
              <div className="font-600 text-stone-800 text-sm">rounded-full</div>
              <div className="font-mono text-xs text-stone-400">9999px</div>
              <div className="text-xs text-stone-500">배지, 아바타, 토글</div>
            </div>
          </div>
        </div>
      </div>
    </section>


    {/* ══════════════════════════
         5. SHADOWS
    ══════════════════════════ */}
    <section id="shadows" className="section-anchor mb-16">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-700 text-stone-900 mb-1">그림자 시스템</h2>
        <p className="text-stone-500 text-sm">깊이감과 계층을 표현하는 그림자 단계</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-stone-100 rounded-xl p-6 flex flex-col items-center gap-4">
          <div className="w-full bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="font-600 text-stone-800 text-sm mb-1">shadow-sm</div>
            <div className="font-mono text-xs text-stone-400">0 1px 2px rgba(0,0,0,0.05)</div>
            <div className="text-xs text-stone-500 mt-1">구분선 대용, 서브 카드</div>
          </div>
        </div>
        <div className="bg-stone-100 rounded-xl p-6 flex flex-col items-center gap-4">
          <div className="w-full bg-white rounded-xl shadow p-4 text-center">
            <div className="font-600 text-stone-800 text-sm mb-1">shadow</div>
            <div className="font-mono text-xs text-stone-400">0 1px 3px rgba(0,0,0,0.1)</div>
            <div className="text-xs text-stone-500 mt-1">기본 카드, 사이드바</div>
          </div>
        </div>
        <div className="bg-stone-100 rounded-xl p-6 flex flex-col items-center gap-4">
          <div className="w-full bg-white rounded-xl shadow-md p-4 text-center">
            <div className="font-600 text-stone-800 text-sm mb-1">shadow-md</div>
            <div className="font-mono text-xs text-stone-400">0 4px 6px rgba(0,0,0,0.07)</div>
            <div className="text-xs text-stone-500 mt-1">드롭다운, 팝오버</div>
          </div>
        </div>
        <div className="bg-stone-100 rounded-xl p-6 flex flex-col items-center gap-4">
          <div className="w-full bg-white rounded-xl shadow-xl p-4 text-center">
            <div className="font-600 text-stone-800 text-sm mb-1">shadow-xl</div>
            <div className="font-mono text-xs text-stone-400">0 20px 25px rgba(0,0,0,0.1)</div>
            <div className="text-xs text-stone-500 mt-1">모달, 토스트</div>
          </div>
        </div>
      </div>
    </section>


    {/* ══════════════════════════
         6. BUTTONS
    ══════════════════════════ */}
    <section id="buttons" className="section-anchor mb-16">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-700 text-stone-900 mb-1">버튼</h2>
        <p className="text-stone-500 text-sm">4가지 변형 × 3가지 크기 + 상태 변형</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow p-6 space-y-8">

        {/* Primary */}
        <div>
          <div className="text-xs font-mono text-stone-400 mb-3">Primary — bg-violet-600, hover:bg-violet-700, text-white</div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="btn bg-violet-600 hover:bg-violet-700 text-white text-xs font-600 px-3 py-1.5 rounded-lg">소형 SM</button>
            <button className="btn bg-violet-600 hover:bg-violet-700 text-white text-sm font-600 px-4 py-2 rounded-lg">중형 MD</button>
            <button className="btn bg-violet-600 hover:bg-violet-700 text-white text-base font-600 px-5 py-2.5 rounded-lg">대형 LG</button>
            <button className="btn bg-violet-600 hover:bg-violet-700 text-white text-sm font-600 px-4 py-2 rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" /> 에이전트 추가
            </button>
            <button className="btn bg-violet-400 text-white text-sm font-600 px-4 py-2 rounded-lg cursor-not-allowed opacity-60">비활성화</button>
            <button className="btn bg-violet-600 text-white text-sm font-600 px-4 py-2 rounded-lg flex items-center gap-2">
              <svg className="spinner w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              로딩 중...
            </button>
          </div>
        </div>

        {/* Secondary */}
        <div>
          <div className="text-xs font-mono text-stone-400 mb-3">Secondary — bg-white, border-stone-200, hover:bg-stone-50, text-stone-700</div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="btn bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-600 px-3 py-1.5 rounded-lg">소형 SM</button>
            <button className="btn bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-sm font-600 px-4 py-2 rounded-lg">중형 MD</button>
            <button className="btn bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-base font-600 px-5 py-2.5 rounded-lg">대형 LG</button>
            <button className="btn bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-sm font-600 px-4 py-2 rounded-lg flex items-center gap-2">
              <Download className="w-4 h-4" /> 내보내기
            </button>
            <button className="btn bg-white border border-stone-200 text-stone-400 text-sm font-600 px-4 py-2 rounded-lg cursor-not-allowed opacity-60">비활성화</button>
          </div>
        </div>

        {/* Ghost */}
        <div>
          <div className="text-xs font-mono text-stone-400 mb-3">Ghost — bg-transparent, hover:bg-violet-50, text-violet-600</div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="btn hover:bg-violet-50 text-violet-600 text-xs font-600 px-3 py-1.5 rounded-lg">소형 SM</button>
            <button className="btn hover:bg-violet-50 text-violet-600 text-sm font-600 px-4 py-2 rounded-lg">중형 MD</button>
            <button className="btn hover:bg-violet-50 text-violet-600 text-base font-600 px-5 py-2.5 rounded-lg">대형 LG</button>
            <button className="btn hover:bg-violet-50 text-violet-600 text-sm font-600 px-4 py-2 rounded-lg flex items-center gap-2">
              <Eye className="w-4 h-4" /> 상세 보기
            </button>
          </div>
        </div>

        {/* Danger */}
        <div>
          <div className="text-xs font-mono text-stone-400 mb-3">Danger — bg-red-600, hover:bg-red-700, text-white</div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="btn bg-red-600 hover:bg-red-700 text-white text-xs font-600 px-3 py-1.5 rounded-lg">소형 SM</button>
            <button className="btn bg-red-600 hover:bg-red-700 text-white text-sm font-600 px-4 py-2 rounded-lg">중형 MD</button>
            <button className="btn bg-red-600 hover:bg-red-700 text-white text-base font-600 px-5 py-2.5 rounded-lg">대형 LG</button>
            <button className="btn bg-red-600 hover:bg-red-700 text-white text-sm font-600 px-4 py-2 rounded-lg flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> 삭제
            </button>
          </div>
        </div>

        {/* Accent (AI/Quick) */}
        <div>
          <div className="text-xs font-mono text-stone-400 mb-3">Accent — bg-orange-500, hover:bg-orange-600, text-white (AI 퀵 액션)</div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="btn bg-orange-500 hover:bg-orange-600 text-white text-sm font-600 px-4 py-2 rounded-lg flex items-center gap-2">
              <Zap className="w-4 h-4" /> 퀵 액션
            </button>
            <button className="btn bg-orange-500 hover:bg-orange-600 text-white text-sm font-600 px-4 py-2 rounded-lg flex items-center gap-2">
              <svg className="spinner w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              AI 실행 중
            </button>
          </div>
        </div>
      </div>
    </section>


    {/* ══════════════════════════
         7. INPUTS
    ══════════════════════════ */}
    <section id="inputs" className="section-anchor mb-16">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-700 text-stone-900 mb-1">입력 컴포넌트</h2>
        <p className="text-stone-500 text-sm">Text · Textarea · Select + 4가지 상태</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow p-6 space-y-6">

        {/* Text Inputs */}
        <div>
          <div className="text-xs font-mono text-stone-400 mb-3">Text Input — 상태별</div>
          <div className="grid grid-cols-2 gap-4">
            {/* Default */}
            <div>
              <label className="block text-sm font-600 text-stone-700 mb-1.5">에이전트 이름 <span className="text-xs font-400 text-stone-400">(기본)</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input type="text" placeholder="예: 마케팅 분석 에이전트" value=""
                  className="w-full pl-9 pr-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 bg-white placeholder-stone-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all duration-150" />
              </div>
            </div>
            {/* Focus */}
            <div>
              <label className="block text-sm font-600 text-stone-700 mb-1.5">에이전트 이름 <span className="text-xs font-400 text-violet-500">(포커스)</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" />
                <input type="text" value="마케팅 분석 에이전트"
                  className="w-full pl-9 pr-3 py-2.5 border border-violet-500 rounded-lg text-sm text-stone-800 bg-white ring-2 ring-violet-100 outline-none" />
              </div>
            </div>
            {/* Error */}
            <div>
              <label className="block text-sm font-600 text-stone-700 mb-1.5">에이전트 이름 <span className="text-xs font-400 text-red-500">(오류)</span></label>
              <div className="relative">
                <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                <input type="text" value="중복된 이름"
                  className="w-full pl-9 pr-3 py-2.5 border border-red-500 rounded-lg text-sm text-stone-800 bg-red-50 ring-2 ring-red-100 outline-none" />
              </div>
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> 이미 사용 중인 이름입니다.
              </p>
            </div>
            {/* Disabled */}
            <div>
              <label className="block text-sm font-600 text-stone-400 mb-1.5">에이전트 이름 <span className="text-xs font-400">(비활성)</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                <input type="text" value="시스템 에이전트" disabled
                  className="w-full pl-9 pr-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-400 bg-stone-50 cursor-not-allowed" />
              </div>
            </div>
          </div>
        </div>

        {/* Textarea */}
        <div>
          <div className="text-xs font-mono text-stone-400 mb-3">Textarea</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-600 text-stone-700 mb-1.5">작업 설명 <span className="text-xs font-400 text-stone-400">(기본)</span></label>
              <textarea rows="4" placeholder="에이전트가 수행할 작업을 상세히 설명하세요..."
                className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 bg-white placeholder-stone-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 resize-none transition-all duration-150"></textarea>
            </div>
            <div>
              <label className="block text-sm font-600 text-stone-700 mb-1.5">작업 설명 <span className="text-xs font-400 text-violet-500">(포커스)</span></label>
              <textarea rows="4" className="w-full px-3 py-2.5 border border-violet-500 rounded-lg text-sm text-stone-800 bg-white ring-2 ring-violet-100 outline-none resize-none">경쟁사 SNS 채널 분석 후 월간 리포트를 작성합니다. 주요 지표: 팔로워 수, 참여율, 게시물 빈도.</textarea>
            </div>
          </div>
        </div>

        {/* Select */}
        <div>
          <div className="text-xs font-mono text-stone-400 mb-3">Select</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-600 text-stone-700 mb-1.5">부서 선택</label>
              <div className="relative">
                <select className="w-full appearance-none px-3 pr-8 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all duration-150">
                  <option value="">부서를 선택하세요</option>
                  <option>마케팅 부서</option>
                  <option>영업 부서</option>
                  <option>기술 부서</option>
                  <option>경영 지원 부서</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-600 text-stone-700 mb-1.5">우선순위</label>
              <div className="relative">
                <select className="w-full appearance-none px-3 pr-8 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all duration-150">
                  <option>높음 (High)</option>
                  <option selected>중간 (Medium)</option>
                  <option>낮음 (Low)</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>


    {/* ══════════════════════════
         8. CARDS
    ══════════════════════════ */}
    <section id="cards" className="section-anchor mb-16">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-700 text-stone-900 mb-1">카드 컴포넌트</h2>
        <p className="text-stone-500 text-sm">default · hover · selected · compact · featured</p>
      </div>

      <div className="grid grid-cols-2 gap-4">

        {/* Default Card */}
        <div className="bg-white rounded-xl border border-stone-200 shadow p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <div className="font-heading font-700 text-stone-900 text-sm">마케팅 분석 에이전트</div>
                <div className="text-xs text-stone-500">AGT-001 · 마케팅 부서</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-xs font-600 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online
            </span>
          </div>
          <p className="text-sm text-stone-600 mb-4">경쟁사 분석 및 시장 트렌드 리포트 자동 생성</p>
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 완료: 47건</span>
            <span>2분 전 활동</span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-400">Default Card · rounded-xl shadow</div>
        </div>

        {/* Hover Card */}
        <div className="bg-white rounded-xl border border-violet-200 shadow-md p-5 cursor-pointer" style={{boxShadow: "0 4px 12px rgba(124,58,237,0.08)"}}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <div className="font-heading font-700 text-stone-900 text-sm">영업 지원 에이전트</div>
                <div className="text-xs text-stone-500">AGT-002 · 영업 부서</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-600 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span> Working
            </span>
          </div>
          <p className="text-sm text-stone-600 mb-4">잠재 고객 분석 및 영업 제안서 초안 작성</p>
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-orange-500" /> 작업 중: 3건</span>
            <span>방금 활동</span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-violet-400">Hover State · border-violet-200 shadow-md</div>
        </div>

        {/* Selected Card */}
        <div className="bg-violet-50 rounded-xl border-2 border-violet-500 shadow p-5 cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-200 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-violet-700" />
              </div>
              <div>
                <div className="font-heading font-700 text-violet-900 text-sm">콘텐츠 작성 에이전트</div>
                <div className="text-xs text-violet-500">AGT-003 · 마케팅 부서</div>
              </div>
            </div>
            <div className="w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          </div>
          <p className="text-sm text-violet-700 mb-4">SNS 콘텐츠 및 블로그 포스트 자동 생성</p>
          <div className="flex items-center justify-between text-xs text-violet-400">
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> 완료: 128건</span>
            <span>5분 전 활동</span>
          </div>
          <div className="mt-3 pt-3 border-t border-violet-200 text-xs text-violet-400">Selected State · bg-violet-50 border-2 border-violet-500</div>
        </div>

        {/* Compact Card */}
        <div className="bg-white rounded-xl border border-stone-200 shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <div className="font-600 text-stone-800 text-sm">데이터 수집 에이전트</div>
                <div className="text-xs text-stone-400">AGT-004 · 5분 전</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-500 text-xs font-600 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span> Offline
              </span>
              <button className="btn hover:bg-stone-100 text-stone-400 p-1.5 rounded-lg">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-400">Compact Card · p-4 (간결한 목록용)</div>
        </div>

        {/* Featured Card (full width) */}
        <div className="col-span-2 bg-gradient-to-r from-violet-600 to-violet-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Cpu className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-xs font-600 text-violet-200 uppercase tracking-wider mb-1">Featured · 핵심 에이전트</div>
                <div className="font-heading text-xl font-700">전략 기획 총괄 에이전트</div>
                <div className="text-violet-200 text-sm mt-0.5">경영진 직속 · 전사 전략 수립 지원</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-600 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span> Online
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg px-4 py-3 text-center">
              <div className="font-heading text-2xl font-700">342</div>
              <div className="text-violet-200 text-xs mt-0.5">완료 작업</div>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-3 text-center">
              <div className="font-heading text-2xl font-700">99.1%</div>
              <div className="text-violet-200 text-xs mt-0.5">성공률</div>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-3 text-center">
              <div className="font-heading text-2xl font-700">2.3s</div>
              <div className="text-violet-200 text-xs mt-0.5">평균 응답</div>
            </div>
          </div>
        </div>

      </div>
    </section>


    {/* ══════════════════════════
         9. BADGES
    ══════════════════════════ */}
    <section id="badges" className="section-anchor mb-16">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-700 text-stone-900 mb-1">배지</h2>
        <p className="text-stone-500 text-sm">에이전트 상태 배지 + 일반 레이블 배지</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow p-6 space-y-6">

        {/* Agent Status Badges */}
        <div>
          <div className="text-xs font-mono text-stone-400 mb-3">에이전트 상태 배지</div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-600 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online
            </span>
            <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 text-xs font-600 px-2.5 py-1 rounded-full border border-orange-200">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span> Working
            </span>
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-600 px-2.5 py-1 rounded-full border border-red-200">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Error
            </span>
            <span className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-600 text-xs font-600 px-2.5 py-1 rounded-full border border-stone-200">
              <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span> Offline
            </span>
          </div>
        </div>

        {/* General Badges */}
        <div>
          <div className="text-xs font-mono text-stone-400 mb-3">일반 배지 — 타입별</div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-violet-100 text-violet-700 text-xs font-600 px-2.5 py-1 rounded-full">Primary</span>
            <span className="bg-stone-100 text-stone-700 text-xs font-600 px-2.5 py-1 rounded-full">Secondary</span>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-600 px-2.5 py-1 rounded-full">Success</span>
            <span className="bg-amber-100 text-amber-700 text-xs font-600 px-2.5 py-1 rounded-full">Warning</span>
            <span className="bg-red-100 text-red-700 text-xs font-600 px-2.5 py-1 rounded-full">Error</span>
            <span className="bg-blue-100 text-blue-700 text-xs font-600 px-2.5 py-1 rounded-full">Info</span>
            <span className="bg-orange-100 text-orange-700 text-xs font-600 px-2.5 py-1 rounded-full">AI Accent</span>
          </div>
        </div>

        {/* Outlined Badges */}
        <div>
          <div className="text-xs font-mono text-stone-400 mb-3">외곽선 배지 — Outlined</div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="border border-violet-300 text-violet-700 text-xs font-600 px-2.5 py-1 rounded-full">Primary</span>
            <span className="border border-stone-300 text-stone-600 text-xs font-600 px-2.5 py-1 rounded-full">Secondary</span>
            <span className="border border-emerald-300 text-emerald-700 text-xs font-600 px-2.5 py-1 rounded-full">Success</span>
            <span className="border border-amber-300 text-amber-700 text-xs font-600 px-2.5 py-1 rounded-full">Warning</span>
            <span className="border border-red-300 text-red-700 text-xs font-600 px-2.5 py-1 rounded-full">Error</span>
          </div>
        </div>

        {/* Numbered Badges */}
        <div>
          <div className="text-xs font-mono text-stone-400 mb-3">숫자 배지 — Count Badges</div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative inline-flex">
              <Bell className="w-6 h-6 text-stone-600" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs font-700 rounded-full flex items-center justify-center leading-none">3</span>
            </div>
            <div className="relative inline-flex">
              <MessageSquare className="w-6 h-6 text-stone-600" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-violet-600 text-white text-xs font-700 rounded-full flex items-center justify-center leading-none">7</span>
            </div>
            <div className="relative inline-flex">
              <Inbox className="w-6 h-6 text-stone-600" />
              <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-xs font-700 px-1.5 py-0.5 rounded-full leading-none">99+</span>
            </div>
          </div>
        </div>

      </div>
    </section>


    {/* ══════════════════════════
         10. ALERTS
    ══════════════════════════ */}
    <section id="alerts" className="section-anchor mb-16">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-700 text-stone-900 mb-1">알림 · 얼럿</h2>
        <p className="text-stone-500 text-sm">success · warning · error · info</p>
      </div>

      <div className="space-y-3">

        {/* Success */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-heading font-700 text-emerald-900 text-sm mb-0.5">작업 완료</div>
            <p className="text-emerald-700 text-sm">마케팅 분석 에이전트가 월간 리포트 47건을 성공적으로 완료했습니다.</p>
          </div>
          <button className="text-emerald-400 hover:text-emerald-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-heading font-700 text-amber-900 text-sm mb-0.5">토큰 만료 임박</div>
            <p className="text-amber-700 text-sm">영업 지원 에이전트의 CLI 토큰이 3일 후 만료됩니다. 미리 갱신하세요.</p>
          </div>
          <button className="text-amber-400 hover:text-amber-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <XCircle className="w-4.5 h-4.5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-heading font-700 text-red-900 text-sm mb-0.5">연결 오류</div>
            <p className="text-red-700 text-sm">데이터 수집 에이전트가 외부 API 연결에 실패했습니다. 자격 증명을 확인하세요.</p>
            <button className="mt-2 text-xs font-600 text-red-600 hover:text-red-800 underline">오류 로그 보기</button>
          </div>
          <button className="text-red-400 hover:text-red-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-heading font-700 text-blue-900 text-sm mb-0.5">시스템 공지</div>
            <p className="text-blue-700 text-sm">오늘 오전 2시~4시 사이 정기 점검이 예정되어 있습니다. 에이전트 작업이 일시 중단될 수 있습니다.</p>
          </div>
          <button className="text-blue-400 hover:text-blue-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Style */}
        <div className="mt-4">
          <div className="text-xs font-mono text-stone-400 mb-3">Toast / Snackbar 스타일</div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-stone-900 text-white text-sm rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>에이전트가 성공적으로 생성되었습니다.</span>
              <button className="text-stone-400 hover:text-white ml-2"><X className="w-4 h-4" /></button>
            </div>
            <div className="bg-stone-900 text-white text-sm rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>저장에 실패했습니다. 다시 시도하세요.</span>
              <button className="text-stone-400 hover:text-white ml-2"><X className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

      </div>
    </section>


    {/* ══════════════════════════
         11. AVATARS
    ══════════════════════════ */}
    <section id="avatars" className="section-anchor mb-16">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-700 text-stone-900 mb-1">아바타</h2>
        <p className="text-stone-500 text-sm">이니셜 아바타 + 상태 점 + 크기 변형</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow p-6 space-y-6">

        {/* Size variants */}
        <div>
          <div className="text-xs font-mono text-stone-400 mb-3">크기 변형 — 인간 직원</div>
          <div className="flex items-end gap-4 flex-wrap">
            {/* XS */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center">
                <span className="text-violet-700 font-700 text-xs">김</span>
              </div>
              <span className="text-xs text-stone-400">xs (24px)</span>
            </div>
            {/* SM */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                <span className="text-violet-700 font-700 text-sm">김</span>
              </div>
              <span className="text-xs text-stone-400">sm (32px)</span>
            </div>
            {/* MD */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <span className="text-violet-700 font-700 text-base">김</span>
              </div>
              <span className="text-xs text-stone-400">md (40px)</span>
            </div>
            {/* LG */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center">
                <span className="text-violet-700 font-700 text-xl">김</span>
              </div>
              <span className="text-xs text-stone-400">lg (56px)</span>
            </div>
            {/* XL */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center">
                <span className="text-violet-700 font-700 text-3xl">김</span>
              </div>
              <span className="text-xs text-stone-400">xl (80px)</span>
            </div>
          </div>
        </div>

        {/* Status dots */}
        <div>
          <div className="text-xs font-mono text-stone-400 mb-3">상태 점 — Status Dots</div>
          <div className="flex items-center gap-6 flex-wrap">
            {/* Online */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-700 font-700 text-base">이</span>
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>
              </div>
              <span className="text-xs text-stone-500">Online</span>
            </div>
            {/* Working */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-700 font-700 text-base">박</span>
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white animate-pulse"></span>
              </div>
              <span className="text-xs text-stone-500">Working</span>
            </div>
            {/* Error */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-700 font-700 text-base">최</span>
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></span>
              </div>
              <span className="text-xs text-stone-500">Error</span>
            </div>
            {/* Offline */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
                  <span className="text-stone-500 font-700 text-base">정</span>
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-stone-400 rounded-full border-2 border-white"></span>
              </div>
              <span className="text-xs text-stone-500">Offline</span>
            </div>
          </div>
        </div>

        {/* AI Agent Avatars */}
        <div>
          <div className="text-xs font-mono text-stone-400 mb-3">AI 에이전트 아바타 — 아이콘형</div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></span>
              </div>
              <span className="text-xs text-stone-500">AI · Online</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-400 rounded-full border-2 border-white animate-pulse"></span>
              </div>
              <span className="text-xs text-stone-500">AI · Working</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-12 h-12 bg-stone-300 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-stone-600" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-stone-400 rounded-full border-2 border-white"></span>
              </div>
              <span className="text-xs text-stone-500">AI · Offline</span>
            </div>

            {/* Avatar Group */}
            <div className="ml-4">
              <div className="text-xs font-mono text-stone-400 mb-2">Avatar Group</div>
              <div className="flex -space-x-2">
                <div className="w-9 h-9 bg-violet-100 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-violet-700 font-700 text-sm">김</span>
                </div>
                <div className="w-9 h-9 bg-emerald-100 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-emerald-700 font-700 text-sm">이</span>
                </div>
                <div className="w-9 h-9 bg-orange-100 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-orange-700 font-700 text-sm">박</span>
                </div>
                <div className="w-9 h-9 bg-violet-600 rounded-full border-2 border-white flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="w-9 h-9 bg-stone-100 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-stone-600 font-700 text-xs">+5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>


    {/* ══════════════════════════
         12. NAVIGATION
    ══════════════════════════ */}
    <section id="navigation" className="section-anchor mb-16">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-700 text-stone-900 mb-1">내비게이션</h2>
        <p className="text-stone-500 text-sm">사이드바 메뉴 패턴 — 기본/활성/비활성/섹션 헤더</p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Sidebar Pattern */}
        <div className="bg-white rounded-xl border border-stone-200 shadow overflow-hidden">
          <div className="px-4 py-4 border-b border-stone-100 bg-stone-50">
            <div className="text-xs font-600 text-stone-500 uppercase tracking-wider">사이드바 패턴</div>
          </div>
          <div className="px-3 py-3 space-y-0.5">
            {/* Section header */}
            <div className="px-3 py-1.5 text-xs font-600 text-stone-400 uppercase tracking-wider">메인</div>
            {/* Active item */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-violet-50 text-violet-700 cursor-pointer">
              <LayoutDashboard className="w-4 h-4 text-violet-600 flex-shrink-0" />
              <span className="text-sm font-600">대시보드</span>
            </div>
            {/* Default item */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-50 cursor-pointer transition-all duration-150">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">부서 관리</span>
            </div>
            {/* Item with badge */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-50 cursor-pointer transition-all duration-150">
              <Bot className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm flex-1">에이전트</span>
              <span className="bg-orange-100 text-orange-700 text-xs font-600 px-1.5 py-0.5 rounded-full">3</span>
            </div>
            {/* Default item */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-50 cursor-pointer transition-all duration-150">
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">메시지</span>
            </div>
            {/* Section header 2 */}
            <div className="px-3 py-1.5 mt-1 text-xs font-600 text-stone-400 uppercase tracking-wider">운영</div>
            {/* Default items */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-50 cursor-pointer transition-all duration-150">
              <Activity className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">모니터링</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-50 cursor-pointer transition-all duration-150">
              <FileBarChart className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">리포트</span>
            </div>
            {/* Disabled item */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-300 cursor-not-allowed">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">잠긴 기능</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pattern */}
        <div className="space-y-4">
          {/* Horizontal Tabs */}
          <div className="bg-white rounded-xl border border-stone-200 shadow overflow-hidden">
            <div className="px-4 py-4 border-b border-stone-100 bg-stone-50">
              <div className="text-xs font-600 text-stone-500 uppercase tracking-wider">가로 탭 패턴</div>
            </div>
            <div className="px-4 py-4">
              <div className="flex gap-1 bg-stone-100 p-1 rounded-lg">
                <button className="flex-1 text-sm font-600 px-3 py-1.5 rounded-md bg-white text-stone-900 shadow-sm transition-all duration-150">전체</button>
                <button className="flex-1 text-sm font-400 px-3 py-1.5 rounded-md text-stone-500 hover:text-stone-700 transition-all duration-150">온라인</button>
                <button className="flex-1 text-sm font-400 px-3 py-1.5 rounded-md text-stone-500 hover:text-stone-700 transition-all duration-150">작업 중</button>
                <button className="flex-1 text-sm font-400 px-3 py-1.5 rounded-md text-stone-500 hover:text-stone-700 transition-all duration-150">오류</button>
              </div>
            </div>
          </div>

          {/* Underline Tabs */}
          <div className="bg-white rounded-xl border border-stone-200 shadow overflow-hidden">
            <div className="px-4 py-4 border-b border-stone-100 bg-stone-50">
              <div className="text-xs font-600 text-stone-500 uppercase tracking-wider">밑줄 탭 패턴</div>
            </div>
            <div className="px-4 pt-4">
              <div className="flex gap-0 border-b border-stone-200">
                <button className="px-4 py-2 text-sm font-600 text-violet-600 border-b-2 border-violet-600 -mb-px">개요</button>
                <button className="px-4 py-2 text-sm font-400 text-stone-500 hover:text-stone-700 border-b-2 border-transparent -mb-px transition-all duration-150">활동 로그</button>
                <button className="px-4 py-2 text-sm font-400 text-stone-500 hover:text-stone-700 border-b-2 border-transparent -mb-px transition-all duration-150">설정</button>
                <button className="px-4 py-2 text-sm font-400 text-stone-500 hover:text-stone-700 border-b-2 border-transparent -mb-px transition-all duration-150">권한</button>
              </div>
              <div className="py-3 text-sm text-stone-500">탭 콘텐츠 영역</div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="bg-white rounded-xl border border-stone-200 shadow overflow-hidden">
            <div className="px-4 py-4 border-b border-stone-100 bg-stone-50">
              <div className="text-xs font-600 text-stone-500 uppercase tracking-wider">브레드크럼</div>
            </div>
            <div className="px-4 py-4">
              <nav className="flex items-center gap-1.5 text-sm">
                <a className="text-violet-600 hover:text-violet-700 font-500 cursor-pointer">홈</a>
                <ChevronRight className="w-4 h-4 text-stone-300" />
                <a className="text-violet-600 hover:text-violet-700 font-500 cursor-pointer">에이전트</a>
                <ChevronRight className="w-4 h-4 text-stone-300" />
                <a className="text-violet-600 hover:text-violet-700 font-500 cursor-pointer">마케팅 부서</a>
                <ChevronRight className="w-4 h-4 text-stone-300" />
                <span className="text-stone-500">마케팅 분석 에이전트</span>
              </nav>
            </div>
          </div>
        </div>

      </div>
    </section>


    {/* ══════════════════════════
         13. EMPTY STATES
    ══════════════════════════ */}
    <section id="empty-states" className="section-anchor mb-16">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-700 text-stone-900 mb-1">빈 상태</h2>
        <p className="text-stone-500 text-sm">데이터 없음 · 검색 결과 없음 · 오류 상태</p>
      </div>

      <div className="grid grid-cols-3 gap-4">

        {/* No Data */}
        <div className="bg-white rounded-xl border border-stone-200 shadow p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
            <Bot className="w-8 h-8 text-stone-400" />
          </div>
          <div className="font-heading font-700 text-stone-800 text-base mb-2">에이전트 없음</div>
          <p className="text-stone-500 text-sm mb-5 leading-relaxed">아직 등록된 에이전트가 없습니다. 첫 번째 에이전트를 추가해 보세요.</p>
          <button className="btn bg-violet-600 hover:bg-violet-700 text-white text-sm font-600 px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> 에이전트 추가
          </button>
        </div>

        {/* No Search Results */}
        <div className="bg-white rounded-xl border border-stone-200 shadow p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-stone-400" />
          </div>
          <div className="font-heading font-700 text-stone-800 text-base mb-2">결과 없음</div>
          <p className="text-stone-500 text-sm mb-5 leading-relaxed">"영업 분석"에 대한 검색 결과를 찾을 수 없습니다. 다른 키워드로 검색해 보세요.</p>
          <button className="btn bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-sm font-600 px-4 py-2 rounded-lg">
            검색 초기화
          </button>
        </div>

        {/* Error State */}
        <div className="bg-white rounded-xl border border-red-100 shadow p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
            <WifiOff className="w-8 h-8 text-red-400" />
          </div>
          <div className="font-heading font-700 text-stone-800 text-base mb-2">연결 실패</div>
          <p className="text-stone-500 text-sm mb-5 leading-relaxed">데이터를 불러오는 중 오류가 발생했습니다. 네트워크 연결을 확인하세요.</p>
          <button className="btn bg-red-600 hover:bg-red-700 text-white text-sm font-600 px-4 py-2 rounded-lg flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> 다시 시도
          </button>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-xl border border-stone-200 shadow p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-violet-400" />
          </div>
          <div className="font-heading font-700 text-stone-800 text-base mb-2">준비 중</div>
          <p className="text-stone-500 text-sm mb-5 leading-relaxed">이 기능은 현재 개발 중입니다. 곧 제공될 예정입니다.</p>
          <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-600 text-xs font-600 px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" /> 출시 예정
          </span>
        </div>

        {/* First Time Use */}
        <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl border border-violet-200 shadow p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mb-4">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <div className="font-heading font-700 text-stone-800 text-base mb-2">시작하기</div>
          <p className="text-stone-600 text-sm mb-5 leading-relaxed">CORTHEX에 오신 것을 환영합니다. 첫 번째 부서와 에이전트를 설정해 보세요.</p>
          <button className="btn bg-violet-600 hover:bg-violet-700 text-white text-sm font-600 px-4 py-2 rounded-lg">
            온보딩 시작
          </button>
        </div>

        {/* Loading State */}
        <div className="bg-white rounded-xl border border-stone-200 shadow p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mb-4">
            <svg className="spinner w-8 h-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
          <div className="font-heading font-700 text-stone-800 text-base mb-2">로딩 중...</div>
          <p className="text-stone-500 text-sm leading-relaxed">에이전트 데이터를 불러오는 중입니다. 잠시만 기다려 주세요.</p>
          <div className="mt-4 w-full bg-stone-100 rounded-full h-1.5">
            <div className="bg-violet-500 h-1.5 rounded-full w-2/3"></div>
          </div>
        </div>

      </div>
    </section>


    {/* Footer */}
    <footer className="border-t border-stone-200 pt-8 pb-12 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-6 h-6 bg-violet-600 rounded-md flex items-center justify-center">
          <span className="text-white font-heading font-700 text-xs">C</span>
        </div>
        <span className="font-heading font-700 text-stone-700">CORTHEX v2</span>
      </div>
      <p className="text-stone-400 text-sm">Design System v2.0 · Plus Jakarta Sans + Inter + JetBrains Mono</p>
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-stone-400">
        <span className="flex items-center gap-1"><Palette className="w-3.5 h-3.5" /> Tailwind CSS v3</span>
        <span className="flex items-center gap-1"><Box className="w-3.5 h-3.5" /> Lucide Icons</span>
        <span className="flex items-center gap-1"><Type className="w-3.5 h-3.5" /> Google Fonts</span>
      </div>
    </footer>

  </main>
</div>
    </>
  );
}

export default DesignSystem;
