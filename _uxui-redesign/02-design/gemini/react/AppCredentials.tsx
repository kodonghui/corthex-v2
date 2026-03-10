"use client";
import React from "react";

const styles = `
body {
            background-color: #fcfbf9;
            color: #2c2c2c;
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        body::-webkit-scrollbar {
            display: none;
        }

        .card {
            background-color: white;
            border-radius: 1.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
            border: 1px solid #f5f3ec;
            transition: all 0.2s ease;
        }

        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
        }
`;

function AppCredentials() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Primary Sidebar */}
    <aside
        className="w-64 flex flex-col justify-between py-8 px-4 border-r border-base-200 bg-white/80 backdrop-blur-md z-20 shrink-0">
        <div>
            <div className="flex items-center gap-3 px-4 mb-10">
                <div
                    className="w-8 h-8 rounded-full bg-accent-terracotta flex items-center justify-center text-white font-bold text-lg">
                    C</div>
                <span className="text-xl font-bold tracking-tight text-text-main">CORTHEX</span>
            </div>
            <nav className="space-y-2">
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-squares-four text-xl"></i> 홈
                </a>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-terminal-window text-xl"></i> 사령관실
                </a>

                <div className="pt-4 pb-2 px-4 text-xs font-bold text-base-300 uppercase tracking-wider">조직 관리</div>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-robot text-xl"></i> 에이전트
                </a>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-buildings text-xl"></i> 부서
                </a>

                <div className="pt-4 pb-2 px-4 text-xs font-bold text-base-300 uppercase tracking-wider">시스템</div>
                <a href="#"
                    className="sidebar-item active flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-key text-xl"></i> 연동 및 키 관리
                </a>
            </nav>
        </div>
        <div>
            <nav className="space-y-2">
                <div className="mt-4 px-4 py-3 flex items-center gap-3 border-t border-base-200">
                    <img src="https://i.pravatar.cc/100?img=11" alt="Profile"
                        className="w-10 h-10 rounded-full border border-base-300" />
                    <div>
                        <p className="text-sm font-semibold text-text-main">김대표</p>
                        <p className="text-xs text-text-muted">CEO</p>
                    </div>
                </div>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-10 py-8 relative bg-[#fcfbf9]/50">

        {/* Header (API: GET /api/workspace/credentials) */}
        <header
            className="flex justify-between items-center mb-10 sticky top-0 bg-[#fcfbf9]/80 backdrop-blur-md z-10 pt-2 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">연동 및 키 관리</h1>
                <p className="text-text-muted mt-1 text-sm">LLM API 및 외부 서비스 연동 상태를 중앙에서 관리합니다.</p>
            </div>

            <div className="flex items-center gap-4">
                {/* API: POST /api/workspace/credentials */}
                <button
                    className="bg-text-main text-white px-5 py-2.5 rounded-full font-bold shadow-soft hover:bg-opacity-90 transition-all flex items-center gap-2">
                    <i className="ph ph-plus-circle text-lg"></i> 새 키 연동하기
                </button>
            </div>
        </header>

        <div className="max-w-4xl space-y-8 pb-20">

            {/* Category: AI Models */}
            <div>
                <h2 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                    <i className="ph ph-cpu text-accent-amber"></i> AI 모델 연동
                </h2>
                <div className="space-y-4">

                    {/* Credential Item */}
                    <div className="card p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-2xl bg-[#f5f3ec] border border-base-200 flex items-center justify-center text-text-main text-xl">
                                <i className="ph ph-robot"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-text-main">Anthropic (Claude)</h3>
                                <p
                                    className="text-xs font-mono text-text-muted mt-1 bg-base-100 px-2 py-0.5 rounded inline-block">
                                    sk-ant-api03-••••••••••••-abcd</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">상태</p>
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-accent-green">
                                    <span className="w-2 h-2 rounded-full bg-accent-green"></span> 정상 연결됨
                                </span>
                            </div>
                            <div className="w-px h-8 bg-base-200"></div>
                            <button
                                className="px-4 py-2 rounded-xl border border-base-200 text-sm font-bold text-text-muted hover:bg-base-50 transition-colors">설정
                                관리</button>
                        </div>
                    </div>

                    {/* Credential Item */}
                    <div className="card p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-2xl bg-[#f5f3ec] border border-base-200 flex items-center justify-center text-text-main text-xl">
                                <i className="ph ph-robot"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-text-main">OpenAI</h3>
                                <p
                                    className="text-xs font-mono text-text-muted mt-1 bg-base-100 px-2 py-0.5 rounded inline-block">
                                    sk-proj-••••••••••••••••-efgh</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">상태</p>
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-accent-green">
                                    <span className="w-2 h-2 rounded-full bg-accent-green"></span> 정상 연결됨
                                </span>
                            </div>
                            <div className="w-px h-8 bg-base-200"></div>
                            <button
                                className="px-4 py-2 rounded-xl border border-base-200 text-sm font-bold text-text-muted hover:bg-base-50 transition-colors">설정
                                관리</button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Category: Financial & Integration */}
            <div>
                <h2 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                    <i className="ph ph-plugs text-accent-terracotta"></i> 금융 및 업무 도구
                </h2>
                <div className="space-y-4">

                    {/* Credential Item */}
                    <div
                        className="card p-5 flex items-center justify-between border-accent-terracotta/30 shadow-[0_4px_20px_rgba(224,122,95,0.05)] bg-[#fcfbf9]">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-2xl bg-white border border-base-200 flex items-center justify-center text-text-main text-xl shadow-sm">
                                <i className="ph ph-chart-line-up"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-text-main">KIS 투자증권 자동매매 API</h3>
                                <div className="flex gap-2 mt-1">
                                    <p
                                        className="text-[10px] font-bold text-accent-terracotta uppercase bg-accent-terracotta/10 px-2 py-0.5 rounded">
                                        APP KEY</p>
                                    <p
                                        className="text-[10px] font-bold text-accent-amber uppercase bg-accent-amber/10 px-2 py-0.5 rounded">
                                        APP SECRET</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">상태</p>
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-text-main">
                                    <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span> 실시간 동기화 중
                                </span>
                            </div>
                            <div className="w-px h-8 bg-base-200"></div>
                            <button
                                className="px-4 py-2 rounded-xl border border-base-200 text-sm font-bold text-text-muted hover:bg-base-50 transition-colors">설정
                                관리</button>
                        </div>
                    </div>

                    {/* Credential Item (Error) */}
                    <div className="card p-5 flex items-center justify-between border-accent-coral/30">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-2xl bg-white border border-base-200 flex items-center justify-center text-text-main text-xl shadow-sm">
                                <i className="ph ph-slack-logo"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-text-main">Slack 워크스페이스</h3>
                                <p className="text-xs text-text-muted mt-1">사내 메신저 알림 전송용</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">상태</p>
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-accent-coral">
                                    <i className="ph ph-warning-circle"></i> 토큰 만료됨
                                </span>
                            </div>
                            <div className="w-px h-8 bg-base-200"></div>
                            <button
                                className="px-4 py-2 rounded-xl bg-accent-coral text-white text-sm font-bold shadow-sm hover:bg-opacity-90 transition-colors">재인증</button>
                        </div>
                    </div>

                    {/* Credential Item */}
                    <div className="card p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-2xl bg-white border border-base-200 flex items-center justify-center text-text-main text-xl shadow-sm">
                                <i className="ph ph-google-logo"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-text-main">Google Workspace (Docs/Drive)</h3>
                                <p className="text-xs text-text-muted mt-1">파일 읽기 및 쓰기 권한</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">상태</p>
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-accent-green">
                                    <span className="w-2 h-2 rounded-full bg-accent-green"></span> 연동 완료
                                </span>
                            </div>
                            <div className="w-px h-8 bg-base-200"></div>
                            {/* API: DELETE /api/workspace/credentials/:id */}
                            <button
                                className="px-4 py-2 rounded-xl border border-base-200 text-sm font-bold text-text-muted hover:text-accent-coral hover:border-accent-coral/30 hover:bg-accent-coral/5 transition-colors">연동
                                해제</button>
                        </div>
                    </div>

                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default AppCredentials;
