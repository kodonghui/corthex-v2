"use client";
import React from "react";
import { Activity, BarChart2, Bell, BookOpen, Bot, Briefcase, Building2, CreditCard, Eye, FileLock2, FileText, Folder, FolderOpen, Home, Info, Key, LayoutDashboard, List, Lock, MessageCircle, Rss, Search, Send, Settings, Share2, Shield, ShieldAlert, ShieldX, Terminal, TrendingUp, Unlock, Users } from "lucide-react";

const styles = `
* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #fafaf9; }
    ::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 3px; }
`;

function AppClassified() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* SIDEBAR */}
<aside className="w-60 fixed left-0 top-0 bottom-0 bg-white border-r border-stone-200 flex flex-col z-20">
  <div className="p-4 border-b border-stone-200">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">C</span></div>
      <span className="font-bold text-stone-900" style={{fontFamily: "'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
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
    <a href="/app/classified" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-violet-50 text-violet-700 text-sm font-medium"><Shield className="w-4 h-4" />기밀문서</a>
    <a href="/app/reports" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><FileText className="w-4 h-4" />보고서</a>
    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-2">분석·특수</p>
    <a href="/app/performance" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><BarChart2 className="w-4 h-4" />전력분석</a>
    <a href="/app/costs" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><CreditCard className="w-4 h-4" />비용 관리</a>
    <a href="/app/activity-log" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Activity className="w-4 h-4" />활동 로그</a>
    <a href="/app/argos" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Eye className="w-4 h-4" />아르고스</a>
    <a href="/app/credentials" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><Key className="w-4 h-4" />크리덴셜</a>
    <a href="/app/ops-log" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm"><List className="w-4 h-4" />운영 로그</a>
    <a href="/app/settings" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm mt-2"><Settings className="w-4 h-4" />설정</a>
  </nav>
</aside>

{/* MAIN */}
<main className="ml-60 flex-1 p-6 min-h-screen">
  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-xl font-bold text-stone-900">기밀문서</h1>
      <p className="text-sm text-stone-500 mt-0.5">보안 등급별 에이전트 생성 문서 아카이브 — API: GET /api/workspace/archive</p>
    </div>
    <div className="relative">
      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input type="text" placeholder="문서 검색..." className="rounded-lg border border-stone-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-56" />
    </div>
  </div>

  <div className="flex gap-5">
    {/* LEFT: Folder Tree (180px) */}
    <div className="w-44 flex-shrink-0">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-3 space-y-0.5">
        <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">보안 등급</p>

        <button className="w-full text-left flex items-center justify-between px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm group">
          <div className="flex items-center gap-2">
            <Unlock className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium">PUBLIC</span>
          </div>
          <span className="bg-stone-100 text-stone-500 rounded-full px-1.5 py-0.5 text-[10px] font-medium">12</span>
        </button>

        <button className="w-full text-left flex items-center justify-between px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-medium">INTERNAL</span>
          </div>
          <span className="bg-stone-100 text-stone-500 rounded-full px-1.5 py-0.5 text-[10px] font-medium">18</span>
        </button>

        <button className="w-full text-left flex items-center justify-between px-2.5 py-2 rounded-lg bg-red-50 text-red-700 text-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span className="text-xs font-semibold">CONFIDENTIAL</span>
          </div>
          <span className="bg-red-100 text-red-600 rounded-full px-1.5 py-0.5 text-[10px] font-medium">8</span>
        </button>

        <button className="w-full text-left flex items-center justify-between px-2.5 py-2 rounded-lg text-stone-600 hover:bg-stone-50 text-sm">
          <div className="flex items-center gap-2">
            <ShieldX className="w-3.5 h-3.5 text-stone-800" />
            <span className="text-xs font-medium">SECRET</span>
          </div>
          <span className="bg-stone-800 text-white rounded-full px-1.5 py-0.5 text-[10px] font-medium">3</span>
        </button>

        <div className="mt-4 pt-3 border-t border-stone-100">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">전체</p>
          <div className="px-2.5 py-1.5 text-xs text-stone-500">총 41건</div>
          <div className="px-2.5 py-1.5 text-xs text-stone-500">이번달 +7건</div>
        </div>
      </div>
    </div>

    {/* RIGHT: Document List */}
    <div className="flex-1 min-w-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-400 mb-3">
        <FolderOpen className="w-3.5 h-3.5 text-red-500" />
        <span className="text-red-600 font-semibold">CONFIDENTIAL</span>
        <span>— 8건</span>
      </div>

      {/* Table — API: GET /api/workspace/archive/{id} */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">제목</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500 w-32">보안 등급</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">요약</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500 w-20">에이전트</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500 w-20">품질점수</th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500 w-20">날짜</th>
            </tr>
          </thead>
          <tbody>
            {/* Row 1 */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors cursor-pointer">
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-900">삼성전자 내부 가치 분석</div>
                    <div className="text-xs text-stone-400 mt-0.5">PDF · 14페이지</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <span className="bg-red-50 text-red-700 border border-red-200 rounded-full px-2.5 py-0.5 text-xs font-semibold">CONFIDENTIAL</span>
              </td>
              <td className="px-4 py-4 text-sm text-stone-600 leading-relaxed">삼성전자 실제 내재 가치 DCF 분석. 적정 주가 94,000원 산출.</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center"><span className="text-[9px] font-semibold text-violet-700">김</span></div>
                  <span className="text-xs text-stone-600">김재원</span>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-bold text-emerald-700">95</span>
                  <div className="w-10 bg-stone-100 rounded-full h-1"><div className="bg-emerald-500 h-1 rounded-full" style={{width: "95%"}}></div></div>
                </div>
              </td>
              <td className="px-4 py-4 text-right text-xs text-stone-500">오늘</td>
            </tr>
            {/* Row 2 */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors cursor-pointer">
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-900">경쟁사 약점 분석 보고서</div>
                    <div className="text-xs text-stone-400 mt-0.5">PDF · 22페이지</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <span className="bg-red-50 text-red-700 border border-red-200 rounded-full px-2.5 py-0.5 text-xs font-semibold">CONFIDENTIAL</span>
              </td>
              <td className="px-4 py-4 text-sm text-stone-600 leading-relaxed">국내 상위 5개 경쟁사 전략적 약점 및 진입 가능 시장 분석.</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center"><span className="text-[9px] font-semibold text-emerald-700">이</span></div>
                  <span className="text-xs text-stone-600">이나경</span>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-bold text-emerald-700">88</span>
                  <div className="w-10 bg-stone-100 rounded-full h-1"><div className="bg-emerald-500 h-1 rounded-full" style={{width: "88%"}}></div></div>
                </div>
              </td>
              <td className="px-4 py-4 text-right text-xs text-stone-500">어제</td>
            </tr>
            {/* Row 3 — SECRET */}
            <tr className="border-b border-stone-100 hover:bg-stone-900/5 transition-colors cursor-pointer bg-stone-900/[0.02]">
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileLock2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-900">M&A 타겟 후보 목록</div>
                    <div className="text-xs text-stone-400 mt-0.5">암호화 PDF · 8페이지</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <span className="bg-stone-900 text-white rounded-full px-2.5 py-0.5 text-xs font-semibold">SECRET</span>
              </td>
              <td className="px-4 py-4 text-sm text-stone-600 leading-relaxed">인수 합병 검토 후보 기업 7곳 리스트 및 예비 실사 평가.</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center"><span className="text-[9px] font-semibold text-emerald-700">이</span></div>
                  <span className="text-xs text-stone-600">이나경</span>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-bold text-emerald-700">97</span>
                  <div className="w-10 bg-stone-100 rounded-full h-1"><div className="bg-emerald-500 h-1 rounded-full" style={{width: "97%"}}></div></div>
                </div>
              </td>
              <td className="px-4 py-4 text-right text-xs text-stone-500">3일 전</td>
            </tr>
            {/* Row 4 */}
            <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors cursor-pointer">
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-900">법인세 절감 전략</div>
                    <div className="text-xs text-stone-400 mt-0.5">PDF · 18페이지</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <span className="bg-red-50 text-red-700 border border-red-200 rounded-full px-2.5 py-0.5 text-xs font-semibold">CONFIDENTIAL</span>
              </td>
              <td className="px-4 py-4 text-sm text-stone-600 leading-relaxed">2026 사업연도 법인세 절감 가능 항목 분석 및 절세 시나리오.</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center"><span className="text-[9px] font-semibold text-rose-700">이</span></div>
                  <span className="text-xs text-stone-600">이소연</span>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-bold text-emerald-700">91</span>
                  <div className="w-10 bg-stone-100 rounded-full h-1"><div className="bg-emerald-500 h-1 rounded-full" style={{width: "91%"}}></div></div>
                </div>
              </td>
              <td className="px-4 py-4 text-right text-xs text-stone-500">1주 전</td>
            </tr>
            {/* Row 5 — SECRET */}
            <tr className="hover:bg-stone-900/5 transition-colors cursor-pointer bg-stone-900/[0.02]">
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileLock2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-900">인사 구조조정 시나리오</div>
                    <div className="text-xs text-stone-400 mt-0.5">암호화 PDF · 11페이지</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <span className="bg-stone-900 text-white rounded-full px-2.5 py-0.5 text-xs font-semibold">SECRET</span>
              </td>
              <td className="px-4 py-4 text-sm text-stone-600 leading-relaxed">조직 효율화를 위한 인사 재편 3개 시나리오 및 영향 분석.</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center"><span className="text-[9px] font-semibold text-emerald-700">이</span></div>
                  <span className="text-xs text-stone-600">이나경</span>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-bold text-emerald-700">93</span>
                  <div className="w-10 bg-stone-100 rounded-full h-1"><div className="bg-emerald-500 h-1 rounded-full" style={{width: "93%"}}></div></div>
                </div>
              </td>
              <td className="px-4 py-4 text-right text-xs text-stone-500">2주 전</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Security Level Guide */}
      <div className="mt-5 bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-stone-400" />보안 등급 안내
        </h4>
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">PUBLIC</span>
            </div>
            <p className="text-xs text-stone-600">일반 공개 가능. 마케팅·홍보 자료. 접근 제한 없음.</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-700">INTERNAL</span>
            </div>
            <p className="text-xs text-stone-600">사내 한정. 운영·전략 문서. 임직원만 접근 가능.</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span className="text-xs font-bold text-red-700">CONFIDENTIAL</span>
            </div>
            <p className="text-xs text-stone-600">기밀. 임원 및 권한 에이전트만 접근. 외부 유출 금지.</p>
          </div>
          <div className="p-3 bg-stone-100 rounded-lg border border-stone-200">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ShieldX className="w-3.5 h-3.5 text-stone-800" />
              <span className="text-xs font-bold text-stone-800">SECRET</span>
            </div>
            <p className="text-xs text-stone-600">최고 기밀. 비밀번호 + 2차 인증 필요. CEO 승인 후 접근.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
    </>
  );
}

export default AppClassified;
