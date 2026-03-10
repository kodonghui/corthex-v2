"use client";
import React from "react";
import { Activity, Bell, Bot, Briefcase, Building2, CircleDollarSign, Cpu, Database, FileBarChart, GitBranch, Key, LayoutDashboard, Plug, Settings, Shield, SlidersHorizontal, Store, UserCheck, UserPlus, Users, Wallet, Workflow } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }`;

function AdminSettings() {
  return (
    <>      
      <style dangerouslySetInnerHTML={{__html: styles}} />
      {/* Sidebar */}
  <aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col z-10">
    <div className="px-5 py-4 border-b border-stone-100">
      <div className="flex items-center gap-2 mb-1">
        <span className="bg-violet-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest">ADMIN</span>
      </div>
      <span className="text-lg font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>CORTHEX</span>
    </div>
    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 py-1.5 mt-1">개요</p>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><LayoutDashboard className="w-4 h-4" /> 대시보드</a>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 py-1.5 mt-2">조직 관리</p>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Building2 className="w-4 h-4" /> 회사 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Users className="w-4 h-4" /> 사용자 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><GitBranch className="w-4 h-4" /> 부서 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Bot className="w-4 h-4" /> 에이전트 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><UserCheck className="w-4 h-4" /> 직원 관리</a>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 py-1.5 mt-2">운영</p>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><CircleDollarSign className="w-4 h-4" /> 비용 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Activity className="w-4 h-4" /> 모니터링</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Workflow className="w-4 h-4" /> 워크플로우</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Key className="w-4 h-4" /> 크리덴셜</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><FileBarChart className="w-4 h-4" /> 보고서</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Briefcase className="w-4 h-4" /> 작업 현황</a>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 py-1.5 mt-2">설정</p>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm bg-violet-50 text-violet-700 font-medium"><Settings className="w-4 h-4" /> 시스템 설정</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Store className="w-4 h-4" /> 템플릿 마켓</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><UserPlus className="w-4 h-4" /> 온보딩</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Shield className="w-4 h-4" /> 보안 로그</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Bell className="w-4 h-4" /> 알림 설정</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Database className="w-4 h-4" /> 데이터 관리</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Plug className="w-4 h-4" /> API 연동</a>
    </nav>
    <div className="px-3 py-3 border-t border-stone-100">
      <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-stone-50 cursor-pointer">
        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-xs">A</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-stone-800 truncate">관리자</p>
          <p className="text-[10px] text-stone-500 truncate">admin@corthex.io</p>
        </div>
      </div>
    </div>
  </aside>

  {/* Main content */}
  <main className="ml-60 p-8">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-stone-900">시스템 설정</h1>
        <p className="text-sm text-stone-500 mt-0.5">ACME Corp 시스템 환경 설정</p>
      </div>
      <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-1 rounded">GET /api/admin/settings · PUT /api/admin/settings</span>
    </div>

    {/* Two-column layout */}
    <div className="flex gap-6">
      {/* Settings Tab Nav (180px) */}
      <div className="w-44 flex-shrink-0">
        <nav className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <button onClick="switchSettings(0)" id="stab-0" className="stab w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-left bg-violet-50 text-violet-700 border-l-2 border-violet-600">
            <SlidersHorizontal className="w-4 h-4 flex-shrink-0" /> 일반
          </button>
          <button onClick="switchSettings(1)" id="stab-1" className="stab w-full flex items-center gap-2.5 px-4 py-3 text-sm text-stone-600 text-left hover:bg-stone-50 border-l-2 border-transparent">
            <Cpu className="w-4 h-4 flex-shrink-0" /> LLM 프로바이더
          </button>
          <button onClick="switchSettings(2)" id="stab-2" className="stab w-full flex items-center gap-2.5 px-4 py-3 text-sm text-stone-600 text-left hover:bg-stone-50 border-l-2 border-transparent">
            <Wallet className="w-4 h-4 flex-shrink-0" /> 예산 한도
          </button>
          <button onClick="switchSettings(3)" id="stab-3" className="stab w-full flex items-center gap-2.5 px-4 py-3 text-sm text-stone-600 text-left hover:bg-stone-50 border-l-2 border-transparent">
            <Bell className="w-4 h-4 flex-shrink-0" /> 알림 설정
          </button>
          <button onClick="switchSettings(4)" id="stab-4" className="stab w-full flex items-center gap-2.5 px-4 py-3 text-sm text-stone-600 text-left hover:bg-stone-50 border-l-2 border-transparent">
            <Shield className="w-4 h-4 flex-shrink-0" /> 보안
          </button>
          <button onClick="switchSettings(5)" id="stab-5" className="stab w-full flex items-center gap-2.5 px-4 py-3 text-sm text-stone-600 text-left hover:bg-stone-50 border-l-2 border-transparent">
            <Database className="w-4 h-4 flex-shrink-0" /> 데이터 관리
          </button>
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1">

        {/* Panel 0: 일반 */}
        <div id="spanel-0" className="spanel space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
            <h3 className="font-bold text-stone-900 text-sm mb-4">일반 설정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">회사명</label>
                <input type="text" value="ACME Corp" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">슬러그 <span className="text-stone-400 font-normal">(읽기 전용)</span></label>
                <input type="text" value="acme" readOnly className="w-full rounded-lg border border-stone-100 bg-stone-50 px-3 py-2 text-sm text-stone-400 cursor-not-allowed" />
                <p className="text-xs text-stone-400 mt-1">슬러그는 생성 후 변경할 수 없습니다.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">기본 언어</label>
                  <select className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-stone-700">
                    <option selected>한국어</option>
                    <option>English</option>
                    <option>日本語</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">시간대</label>
                  <select className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-stone-700">
                    <option selected>Asia/Seoul (KST, UTC+9)</option>
                    <option>UTC</option>
                    <option>America/New_York (EST)</option>
                    <option>Europe/London (GMT)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">날짜 형식</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="dateformat" checked className="accent-violet-600" /> <span className="text-sm text-stone-700">YYYY-MM-DD</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="dateformat" className="accent-violet-600" /> <span className="text-sm text-stone-700">MM/DD/YYYY</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="dateformat" className="accent-violet-600" /> <span className="text-sm text-stone-700">DD.MM.YYYY</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-stone-100 flex justify-end">
              <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">저장</button>
            </div>
          </div>

          {/* LLM Providers preview */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900 text-sm">LLM 프로바이더 현황</h3>
              <button onClick="switchSettings(1)" className="text-xs text-violet-600 hover:text-violet-700 font-medium">전체 설정 →</button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2.5 px-3 bg-stone-50 rounded-lg">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-sm font-medium text-stone-800">Anthropic</span>
                  <code className="text-xs bg-white border border-stone-200 px-1.5 py-0.5 rounded text-stone-500">claude-sonnet-4-6</code>
                </div>
                <span className="text-xs text-emerald-600 font-medium">활성</span>
              </div>
              <div className="flex items-center justify-between py-2.5 px-3 bg-stone-50 rounded-lg">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-sm font-medium text-stone-800">OpenAI</span>
                  <code className="text-xs bg-white border border-stone-200 px-1.5 py-0.5 rounded text-stone-500">gpt-4o</code>
                </div>
                <span className="text-xs text-emerald-600 font-medium">활성</span>
              </div>
              <div className="flex items-center justify-between py-2.5 px-3 bg-stone-50 rounded-lg">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-sm font-medium text-stone-800">Google</span>
                  <code className="text-xs bg-white border border-stone-200 px-1.5 py-0.5 rounded text-stone-500">gemini-2.0-flash</code>
                </div>
                <span className="text-xs text-emerald-600 font-medium">활성</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-6">
            <h3 className="font-bold text-red-800 text-sm mb-1">위험 구역</h3>
            <p className="text-xs text-red-600 mb-4">아래 작업은 되돌릴 수 없습니다. 신중히 진행하세요.</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-red-100">
                <div>
                  <p className="text-sm font-semibold text-stone-800">회사 데이터 초기화</p>
                  <p className="text-xs text-stone-500 mt-0.5">모든 에이전트, 직원, 보고서 데이터가 삭제됩니다.</p>
                </div>
                <button className="border border-red-300 text-red-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-50">초기화</button>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-red-100">
                <div>
                  <p className="text-sm font-semibold text-stone-800">계정 삭제</p>
                  <p className="text-xs text-stone-500 mt-0.5">CORTHEX 계정과 모든 데이터가 영구 삭제됩니다.</p>
                </div>
                <button className="border border-red-300 text-red-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-50">계정 삭제</button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 1: LLM 프로바이더 */}
        <div id="spanel-1" className="spanel hidden space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
            <h3 className="font-bold text-stone-900 text-sm mb-4">LLM 프로바이더 설정</h3>
            <div className="space-y-4">
              <div className="border border-stone-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs">AN</div>
                    <div><p className="text-sm font-semibold text-stone-800">Anthropic</p><p className="text-xs text-stone-500">Claude 모델 시리즈</p></div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">활성</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-stone-600 mb-1">기본 모델</label>
                  <select className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"><option>claude-sonnet-4-6</option><option>claude-opus-4</option><option>claude-haiku-3-5</option></select></div>
                  <div><label className="block text-xs font-semibold text-stone-600 mb-1">최대 토큰</label>
                  <input type="number" value="8192" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
                </div>
              </div>
              <div className="border border-stone-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">OA</div>
                    <div><p className="text-sm font-semibold text-stone-800">OpenAI</p><p className="text-xs text-stone-500">GPT 모델 시리즈</p></div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">활성</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-stone-600 mb-1">기본 모델</label>
                  <select className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"><option>gpt-4o</option><option>gpt-4o-mini</option><option>o3</option></select></div>
                  <div><label className="block text-xs font-semibold text-stone-600 mb-1">최대 토큰</label>
                  <input type="number" value="16384" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
                </div>
              </div>
              <div className="border border-stone-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">GG</div>
                    <div><p className="text-sm font-semibold text-stone-800">Google</p><p className="text-xs text-stone-500">Gemini 모델 시리즈</p></div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">활성</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-stone-600 mb-1">기본 모델</label>
                  <select className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"><option>gemini-2.0-flash</option><option>gemini-2.0-pro</option></select></div>
                  <div><label className="block text-xs font-semibold text-stone-600 mb-1">최대 토큰</label>
                  <input type="number" value="32768" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-100 flex justify-end">
              <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">저장</button>
            </div>
          </div>
        </div>

        {/* Panel 2: 예산 한도 */}
        <div id="spanel-2" className="spanel hidden">
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
            <h3 className="font-bold text-stone-900 text-sm mb-4">예산 한도 설정</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">월 예산 한도</label>
                  <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                  <input type="number" value="20.00" className="w-full rounded-lg border border-stone-200 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">경고 임계값</label>
                  <div className="relative">
                  <input type="number" value="80" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">%</span></div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">예산의 80% ($16.00) 초과 시 이메일 알림이 발송됩니다.</div>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-100 flex justify-end">
              <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">저장</button>
            </div>
          </div>
        </div>

        {/* Panel 3: 알림 설정 */}
        <div id="spanel-3" className="spanel hidden">
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
            <h3 className="font-bold text-stone-900 text-sm mb-4">알림 설정</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-stone-100">
                <div>
                  <p className="text-sm font-medium text-stone-800">예산 경고 알림</p>
                  <p className="text-xs text-stone-500">월 예산 임계값 초과 시</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked className="sr-only peer" />
                  <div className="w-9 h-5 bg-stone-200 peer-checked:bg-violet-600 rounded-full peer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-stone-100">
                <div>
                  <p className="text-sm font-medium text-stone-800">에러 로그 알림</p>
                  <p className="text-xs text-stone-500">심각 오류 발생 시</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked className="sr-only peer" />
                  <div className="w-9 h-5 bg-stone-200 peer-checked:bg-violet-600 rounded-full peer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-stone-800">주간 요약 리포트</p>
                  <p className="text-xs text-stone-500">매주 월요일 오전 9시</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-9 h-5 bg-stone-200 peer-checked:bg-violet-600 rounded-full peer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                </label>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-100 flex justify-end">
              <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">저장</button>
            </div>
          </div>
        </div>

        {/* Panel 4: 보안 */}
        <div id="spanel-4" className="spanel hidden">
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
            <h3 className="font-bold text-stone-900 text-sm mb-4">보안 설정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">세션 만료 시간</label>
                <select className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                  <option>8시간</option><option selected>24시간</option><option>7일</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-stone-100">
                <div><p className="text-sm font-medium text-stone-800">2단계 인증 강제</p><p className="text-xs text-stone-500">모든 관리자 계정에 2FA 필수 적용</p></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked className="sr-only peer" />
                  <div className="w-9 h-5 bg-stone-200 peer-checked:bg-violet-600 rounded-full peer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-stone-100">
                <div><p className="text-sm font-medium text-stone-800">IP 화이트리스트</p><p className="text-xs text-stone-500">등록된 IP에서만 로그인 허용</p></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-9 h-5 bg-stone-200 peer-checked:bg-violet-600 rounded-full peer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                </label>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-100 flex justify-end">
              <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">저장</button>
            </div>
          </div>
        </div>

        {/* Panel 5: 데이터 관리 */}
        <div id="spanel-5" className="spanel hidden">
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
            <h3 className="font-bold text-stone-900 text-sm mb-4">데이터 관리</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 px-4 bg-stone-50 rounded-lg">
                <div><p className="text-sm font-medium text-stone-800">데이터 백업</p><p className="text-xs text-stone-500">마지막 백업: 오늘 03:00 (자동)</p></div>
                <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">지금 백업</button>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-stone-50 rounded-lg">
                <div><p className="text-sm font-medium text-stone-800">로그 보관 기간</p><p className="text-xs text-stone-500">현재: 90일</p></div>
                <select className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs bg-white focus:outline-none"><option>30일</option><option>60일</option><option selected>90일</option><option>180일</option></select>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-stone-50 rounded-lg">
                <div><p className="text-sm font-medium text-stone-800">데이터 내보내기</p><p className="text-xs text-stone-500">JSON / CSV 형식으로 전체 데이터 다운로드</p></div>
                <button className="bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-stone-50">내보내기</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
    </>
  );
}

export default AdminSettings;
