"use client";
import React from "react";
import { Activity, Bell, Bot, Briefcase, Building2, Check, CheckCircle2, CircleDollarSign, Database, Download, Edit3, FileBarChart, GitBranch, Key, LayoutDashboard, Lightbulb, Plug, Send, Settings, Shield, Store, Target, Timer, UserCheck, UserPlus, Users, Workflow } from "lucide-react";

const styles = `* { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    code,pre { font-family: 'JetBrains Mono', monospace; }`;

function AdminOnboarding() {
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
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Settings className="w-4 h-4" /> 시스템 설정</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"><Store className="w-4 h-4" /> 템플릿 마켓</a>
      <a href="#" className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm bg-violet-50 text-violet-700 font-medium"><UserPlus className="w-4 h-4" /> 온보딩</a>
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
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-xl font-bold text-stone-900">온보딩 설정</h1>
        <p className="text-sm text-stone-500 mt-0.5">신규 회사 온보딩 프로세스 관리 — 목표: 회원가입 후 10분 이내 첫 보고서 수신</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-1 rounded">GET /api/admin/onboarding/{companyId}</span>
        <select className="rounded-lg border border-stone-200 px-3 py-2 text-sm bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option>ACME Corp</option>
          <option>TechVentures</option>
          <option>LegalPlus</option>
          <option>StartupXYZ</option>
        </select>
      </div>
    </div>

    {/* Stats Banner */}
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
          <Timer className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-base font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>8분 12초</p>
          <p className="text-xs text-stone-500">평균 완료 시간</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <p className="text-base font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>78%</p>
          <p className="text-xs text-stone-500">4단계까지 완료율</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
          <Target className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-base font-bold text-stone-900" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>82%</p>
          <p className="text-xs text-stone-500">10분 목표 달성률</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-5">
      {/* Checklist Steps (2/3) */}
      <div className="col-span-2 space-y-4">
        {/* Step Progress Card */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">ACME Corp 온보딩 진행 현황</h3>
              <p className="text-xs text-stone-500 mt-0.5">가입일: 2025-01-15 · 완료: 5/6단계</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-500">전체 진행률</p>
              <p className="text-lg font-bold text-violet-700" style={{"fontFamily":"'Plus Jakarta Sans',sans-serif"}}>83%</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-violet-500 rounded-full" style={{"width":"83%"}}></div>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-5 top-6 bottom-6 w-px bg-stone-200"></div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4 relative">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center flex-shrink-0 z-10">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 pt-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-800">1단계: 회사 정보 입력</p>
                    <span className="text-xs text-emerald-600 font-medium">완료 (2025-01-15)</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">회사명, 슬러그, 기본 언어 및 시간대 설정</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 relative">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center flex-shrink-0 z-10">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 pt-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-800">2단계: 크리덴셜 등록 (LLM CLI 토큰)</p>
                    <span className="text-xs text-emerald-600 font-medium">완료</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">Anthropic CLI 토큰 AES-256-GCM 암호화 저장</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 relative">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center flex-shrink-0 z-10">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 pt-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-800">3단계: 조직 템플릿 선택</p>
                    <span className="text-xs text-emerald-600 font-medium">완료</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">"중소기업 표준" 선택 — 마케팅/리서치/법무/재무 4개 부서 자동 생성</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 relative">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center flex-shrink-0 z-10">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 pt-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-800">4단계: 첫 명령 실행</p>
                    <span className="text-xs text-emerald-600 font-medium">완료 — 7분 23초 만에 달성!</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">Command Center에서 첫 번째 에이전트 명령 성공적으로 실행</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4 relative">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center flex-shrink-0 z-10">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 pt-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-800">5단계: 첫 보고서 수신</p>
                    <span className="text-xs text-emerald-600 font-medium">완료</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">AI 에이전트가 생성한 첫 번째 보고서를 수신 및 확인</p>
                </div>
              </div>

              {/* Step 6 — incomplete */}
              <div className="flex gap-4 relative">
                <div className="w-10 h-10 rounded-full bg-stone-100 border-2 border-stone-300 flex items-center justify-center flex-shrink-0 z-10">
                  <span className="text-xs font-bold text-stone-400">6</span>
                </div>
                <div className="flex-1 pt-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-500">6단계: 크론 설정</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400">미완료</span>
                      <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold">안내 보내기</button>
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">정기 자동 실행 스케줄(크론) 설정으로 완전 자동화 달성</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guide Editor */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-stone-900 text-sm">온보딩 가이드 편집</h3>
            <span className="text-[10px] font-mono text-stone-400">PUT /api/admin/onboarding/{companyId}/steps</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">2단계 안내 문구 (크리덴셜 등록)</label>
              <textarea className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none" rows="2">Anthropic Claude CLI 구독 토큰을 등록하세요. 토큰은 AES-256-GCM으로 안전하게 암호화됩니다.</textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">6단계 안내 문구 (크론 설정)</label>
              <textarea className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none" rows="2">크론 표현식으로 에이전트를 정기 자동 실행하세요. 예: "0 9 * * 1-5" = 평일 오전 9시 자동 실행</textarea>
            </div>
            <div className="flex justify-end">
              <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">가이드 저장</button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        {/* All companies progress */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-900 text-sm mb-4">전체 회사 온보딩 현황</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="font-medium text-stone-700">ACME Corp</span><span className="text-emerald-600 font-medium">5/6단계</span></div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{"width":"83%"}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="font-medium text-stone-700">TechVentures</span><span className="text-emerald-600 font-medium">6/6단계</span></div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{"width":"100%"}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="font-medium text-stone-700">LegalPlus</span><span className="text-emerald-600 font-medium">6/6단계</span></div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{"width":"100%"}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="font-medium text-stone-700">StartupXYZ</span><span className="text-amber-600 font-medium">3/6단계</span></div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{"width":"50%"}}></div></div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-5">
          <h3 className="font-bold text-violet-900 text-sm mb-3">온보딩 최적화 팁</h3>
          <div className="space-y-2.5">
            <div className="flex gap-2 text-xs text-violet-800">
              <Lightbulb className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
              <span>4단계(첫 명령 실행)에서 68%의 이탈이 발생합니다. 명확한 예시 명령어 제공 권장.</span>
            </div>
            <div className="flex gap-2 text-xs text-violet-800">
              <Lightbulb className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
              <span>크리덴셜 입력 UI에 CLI 토큰 발급 바로가기 링크를 추가하면 완료 시간이 2분 단축됩니다.</span>
            </div>
            <div className="flex gap-2 text-xs text-violet-800">
              <Lightbulb className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
              <span>6단계 미완료 회사에 D+3 자동 이메일 발송 설정 권장.</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-900 text-sm mb-3">빠른 액션</h3>
          <div className="space-y-2">
            <button className="w-full text-left flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-stone-50 text-sm text-stone-700">
              <Send className="w-4 h-4 text-stone-400" /> 미완료 회사 일괄 안내
            </button>
            <button className="w-full text-left flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-stone-50 text-sm text-stone-700">
              <Download className="w-4 h-4 text-stone-400" /> 온보딩 현황 CSV 내보내기
            </button>
            <button className="w-full text-left flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-stone-50 text-sm text-stone-700">
              <Edit3 className="w-4 h-4 text-stone-400" /> 전체 가이드 일괄 편집
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
    </>
  );
}

export default AdminOnboarding;
