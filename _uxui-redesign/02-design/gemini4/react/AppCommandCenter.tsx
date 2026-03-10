"use client";
import React from "react";

const styles = `
@layer base {
            body { @apply bg-background text-text-main font-sans antialiased; }
            h1, h2, h3 { @apply font-serif text-text-main; }
        }
        @layer components {
            .card { @apply bg-surface rounded-2xl shadow-soft border border-border p-6; }
            .btn-primary { @apply inline-flex items-center justify-center bg-primary-600 text-white hover:bg-primary-700 rounded-xl px-4 py-2 font-medium transition-colors shadow-sm; }
            .nav-item { @apply flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-text-main hover:bg-surface-alt transition-colors; }
            .nav-item.active { @apply bg-surface-alt font-semibold text-primary-700; }
            .input-bare { @apply w-full bg-transparent border-none text-text-main placeholder-text-light focus:outline-none focus:ring-0; }
        }
        /* Custom scrollbar for chat area */
        .chat-scroll::-webkit-scrollbar { width: 6px; }
        .chat-scroll::-webkit-scrollbar-thumb { @apply bg-border rounded-full; }
`;

function AppCommandCenter() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<aside className="w-64 flex-shrink-0 inset-y-0 left-0 bg-surface border-r border-border flex flex-col z-10">
        <div className="h-16 flex items-center px-6 border-b border-border mr-4">
            <div
                className="w-6 h-6 rounded bg-primary-600 mr-2 flex items-center justify-center text-white text-xs font-bold">
                C</div>
            <span className="font-serif font-bold text-lg">CORTHEX</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
            <div className="text-xs font-semibold tracking-wider text-text-light mb-2 px-3 mt-2 uppercase">Workspace</div>
            <a href="/app/home" className="nav-item"><svg className="w-4 h-4 text-text-muted" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                    </path>
                </svg>홈</a>
            <a href="/app/command-center" className="nav-item active"><svg className="w-4 h-4 text-primary-600" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>사령관실</a>
            <a href="/app/chat" className="nav-item"><svg className="w-4 h-4 text-text-muted" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
                    </path>
                </svg>에이전트 챗</a>
            <a href="/app/dashboard" className="nav-item"><svg className="w-4 h-4 text-text-muted" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                </svg>작전현황</a>
        </div>
    </aside>

    <main className="flex-1 flex flex-col items-center bg-background relative h-screen">
        {/* Main Chat Area */}
        <div className="flex-1 w-full max-w-4xl flex flex-col">
            <header className="py-6 flex flex-col items-center border-b border-border/50 select-none">
                <div
                    className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3 shadow-sm border border-primary-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9">
                        </path>
                    </svg>
                </div>
                <h1 className="text-2xl font-serif font-bold text-text-main">사령관실</h1>
                <p className="text-text-muted text-sm mt-1">자연어로 명령을 입력하면 AI 비서실장이 알아서 부서에 위임합니다.</p>
            </header>

            <div className="flex-1 overflow-y-auto chat-scroll p-6 pb-32 flex flex-col gap-8">
                {/* User Message */}
                <div className="flex justify-end">
                    <div className="bg-surface border border-border rounded-2xl rounded-tr-sm p-4 max-w-2xl shadow-sm">
                        <span className="text-xs font-medium text-text-muted mb-1 block">김대표</span>
                        <p className="text-text-main">삼성전자 최근 실적 기반으로 분석하고, 이번 유증 이슈가 미치는 영향을 리포트로 정리해줘.</p>
                    </div>
                </div>

                {/* System Delegation Chain */}
                <div className="flex justify-start">
                    <div className="flex flex-col gap-2 max-w-2xl w-full">
                        <div className="flex items-center gap-2 mb-1">
                            <div
                                className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs shadow-sm">
                                비서</div>
                            <span className="text-xs font-semibold text-text-muted">AI 비서실장 오케스트레이션</span>
                        </div>

                        <div className="bg-surface border border-border rounded-2xl p-5 shadow-soft">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1"><svg className="w-5 h-5 text-primary-500" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M5 13l4 4L19 7"></path>
                                        </svg></div>
                                    <div>
                                        <p className="font-medium text-sm">작업 분류 완료</p>
                                        <p className="text-xs text-text-muted mt-0.5">이 작업은 [전략실 > 종목분석 파트]로 할당됩니다.</p>
                                    </div>
                                </div>
                                <div className="w-px h-4 bg-border ml-2.5 -my-2"></div>
                                <div className="flex items-start gap-4 bg-surface-alt p-3 rounded-xl border border-border">
                                    <div className="mt-0.5">
                                        <div
                                            className="w-4 h-4 border-2 border-secondary-400 border-t-transparent rounded-full animate-spin">
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">정보 수집 및 분석 중 (Specialist)</p>
                                        <p className="text-xs text-text-muted mt-0.5">KIS API 연동, Dart 공시 데이터 조회 중...</p>
                                    </div>
                                </div>
                                <div className="w-px h-4 bg-border ml-2.5 -my-2"></div>
                                <div className="flex items-start gap-4 opacity-50">
                                    <div className="mt-1 w-5 h-5 rounded-full border border-border"></div>
                                    <div>
                                        <p className="font-medium text-sm">최종 편집 및 검수 (Manager)</p>
                                        <p className="text-xs text-text-muted mt-0.5">품질 게이트 P0 대기 중</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Sticky Input Area */}
        <div
            className="absolute bottom-0 w-full bg-background/80 backdrop-blur-md pb-8 pt-4 px-6 border-t border-border flex justify-center z-20 shadow-upper-soft">
            <div className="w-full max-w-4xl relative">
                <div className="absolute -top-10 left-0 flex gap-2">
                    <button
                        className="px-3 py-1 bg-surface border border-border rounded-full text-xs font-medium text-text-muted hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm">/전체</button>
                    <button
                        className="px-3 py-1 bg-surface border border-border rounded-full text-xs font-medium text-text-muted hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm">@마케팅팀</button>
                    <button
                        className="px-3 py-1 bg-surface border border-border rounded-full text-xs font-medium text-text-muted hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm">/프리셋</button>
                </div>
                <div
                    className="bg-surface border border-border rounded-2xl shadow-soft p-1.5 flex items-end focus-within:ring-2 ring-primary-200 focus-within:border-primary-400 transition-all">
                    <button className="p-3 text-text-light hover:text-text-main transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13">
                            </path>
                        </svg>
                    </button>
                    <textarea className="input-bare resize-none p-3 h-12 max-h-32 text-base leading-relaxed"
                        placeholder="무엇을 지시하시겠습니까? (Enter로 전송)"></textarea>
                    <button
                        className="p-3 m-0.5 mb-0.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50">
                        <svg className="w-4 h-4 translate-x-0.5 -translate-y-0.5" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                    </button>
                </div>
                <p className="text-center text-xs text-text-light mt-3">Shift + Enter로 줄바꿈. AI는 실수를 할 수 있습니다.</p>
            </div>
        </div>
    </main>

    {/* Right Sidebar: Active Agents Context */}
    <aside className="w-72 bg-surface-alt border-l border-border flex flex-col p-5 overflow-y-auto">
        <h3 className="font-serif font-semibold text-lg mb-4">참여 중인 에이전트</h3>
        <div className="flex flex-col gap-3">
            <div className="card p-3 shadow-sm flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                    비서</div>
                <div className="flex-1">
                    <p className="text-sm font-medium">비서실장</p>
                    <p className="text-xs text-text-muted mt-0.5">Manager · Claude 3.5</p>
                </div>
            </div>

            <div
                className="card p-3 shadow-none border-dashed flex items-center justify-center text-text-light cursor-pointer hover:border-primary-300 hover:text-primary-600 py-4 transition-colors">
                <span className="text-sm font-medium">+ 부서 / 전문가 호출</span>
            </div>
        </div>
    </aside>
    </>
  );
}

export default AppCommandCenter;
