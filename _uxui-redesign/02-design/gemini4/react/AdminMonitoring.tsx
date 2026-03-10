"use client";
import React from "react";

const styles = `
body {
            background-color: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
        }

        .card {
            background-color: inherit /* FIXME: theme value not in map */;
            border-radius: 1rem;
            box-shadow: inherit /* FIXME: theme value not in map */;
            border: 1px solid inherit /* FIXME: theme value not in map */;
        }

        .nav-item {
            display: flex;
            items-center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: 0.75rem;
            color: inherit /* FIXME: theme value not in map */;
            font-weight: 500;
            transition: all 0.2s;
        }

        .nav-item:hover {
            background-color: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
        }

        .nav-item.active {
            background-color: inherit /* FIXME: theme value not in map */;
            color: inherit /* FIXME: theme value not in map */;
            font-weight: 600;
        }

        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        ::-webkit-scrollbar-thumb {
            background: inherit /* FIXME: theme value not in map */;
            border-radius: 3px;
        }
`;

function AdminMonitoring() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Admin Sidebar */}
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-full z-10 shadow-soft shrink-0">
        <div className="p-6 border-b border-border">
            <h2 className="font-serif text-2xl tracking-tight text-primary font-bold">CORTHEX</h2>
            <div className="flex items-center gap-1 mt-1">
                <span
                    className="bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded text-[10px] font-bold">ADMIN
                    PANEL</span>
            </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mb-2">운영 및 시스템</p>
            <a href="/admin/monitoring" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                    </path>
                </svg>
                이용량 모니터링
            </a>
            <a href="/admin/costs" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                    </path>
                </svg>
                글로벌 비용 및 자원
            </a>
            <a href="/admin/companies" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                    </path>
                </svg>
                고객사(Workspace) 관리
            </a>

            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">플랫폼 관리로 돌아가기</p>
            <a href="/admin/dashboard" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                    </path>
                </svg>
                전체 대시보드
            </a>
        </nav>

        <div className="p-4 border-t border-border">
            <a href="/app/home"
                className="flex items-center justify-center gap-2 p-2 rounded-lg bg-surface border border-border text-text-muted hover:bg-background-alt transition-colors w-full text-xs font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                    </path>
                </svg>
                워크스페이스 복귀
            </a>
        </div>
    </aside>

    {/* Main Content */}
    {/* API: GET /api/admin/system/metrics */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end border-b border-border pb-6">
            <div>
                <h1 className="text-3xl font-serif text-text-main font-bold mb-2">실시간 시스템 모니터링</h1>
                <p className="text-text-muted">전체 인프라의 트래픽, 에러율, LLM API 레이턴시 등 글로벌 시스템 건전성을 실시간으로 확인합니다.</p>
            </div>

            <div className="mt-4 lg:mt-0 flex gap-2">
                <div
                    className="bg-surface border border-border text-text-main px-4 py-2 rounded-xl text-xs font-medium shadow-sm flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span
                            className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live Updates ON
                </div>
            </div>
        </header>

        {/* KPI Summary */}
        <div className="grid lg:grid-cols-4 gap-4 mb-8">
            <div className="card p-5">
                <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-2">활성 트래픽 (RPS)</p>
                <div className="flex items-end gap-2 mb-1">
                    <span className="text-2xl font-mono font-bold text-text-main">342</span>
                    <span className="text-xs font-bold text-primary mb-1">req/s</span>
                </div>
            </div>
            <div className="card p-5 border-yellow-500/30">
                <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-2">LLM API 평균 레이턴시</p>
                <div className="flex items-end gap-2 mb-1">
                    <span className="text-2xl font-mono font-bold text-yellow-600">850</span>
                    <span className="text-xs font-bold text-yellow-600 mb-1">ms</span>
                </div>
                <p className="text-[10px] text-text-muted">권장 한도 초과 근접</p>
            </div>
            <div className="card p-5">
                <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-2">오류율 (Error Rate 5xx)</p>
                <div className="flex items-end gap-2 mb-1">
                    <span className="text-2xl font-mono font-bold text-text-main">0.02</span>
                    <span className="text-xs font-bold text-text-muted mb-1">%</span>
                </div>
            </div>
            <div className="card p-5">
                <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-2">큐 백로그 (Queue)</p>
                <div className="flex items-end gap-2 mb-1">
                    <span className="text-2xl font-mono font-bold text-text-main">14</span>
                    <span className="text-xs font-bold text-text-muted mb-1">tasks</span>
                </div>
            </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
            {/* Simulated Graph Area 1 */}
            <div className="card p-6 min-h-[300px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-base text-text-main font-serif">트래픽 추이 (24H)</h3>
                    <span className="text-[10px] text-text-muted">Total Requests</span>
                </div>
                <div
                    className="flex-1 bg-background-alt border border-border rounded-xl flex items-center justify-center p-4">
                    {/* HTML fallback for graph representation */}
                    <div className="w-full h-full flex items-end gap-1 px-2 opacity-70">
                        <div className="w-1/12 bg-primary/20 h-1/4 rounded-t-sm"></div>
                        <div className="w-1/12 bg-primary/40 h-2/4 rounded-t-sm"></div>
                        <div className="w-1/12 bg-primary/60 h-3/4 rounded-t-sm"></div>
                        <div className="w-1/12 bg-primary h-full rounded-t-sm"></div>
                        <div className="w-1/12 bg-primary/80 h-5/6 rounded-t-sm"></div>
                        <div className="w-1/12 bg-primary/40 h-1/3 rounded-t-sm"></div>
                        <div className="w-1/12 bg-primary/20 h-1/5 rounded-t-sm"></div>
                        <div className="w-1/12 bg-primary/30 h-1/4 rounded-t-sm"></div>
                        <div className="w-1/12 bg-primary/50 h-2/3 rounded-t-sm"></div>
                        <div className="w-1/12 bg-primary/90 h-[90%] rounded-t-sm"></div>
                        <div className="w-1/12 bg-primary/70 h-4/5 rounded-t-sm"></div>
                        <div className="w-1/12 bg-primary/50 h-1/2 rounded-t-sm"></div>
                    </div>
                </div>
            </div>

            {/* Error Logs */}
            <div className="card p-0 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h3 className="font-bold text-base text-text-main font-serif">최근 치명적 에러 (5xx)</h3>
                    <button className="text-xs font-bold text-text-muted hover:text-primary transition-colors">모두
                        보기</button>
                </div>

                <div className="divide-y divide-border overflow-y-auto max-h-[300px]">
                    <div className="p-4 bg-red-50 hover:bg-red-100/50 transition-colors border-l-4 border-red-500 text-sm">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-mono font-bold text-red-600 text-xs">ERR_LLM_TIMEOUT</span>
                            <span className="text-[10px] text-text-muted">2분 전</span>
                        </div>
                        <p className="text-xs text-text-main break-all font-mono">OpenAI API downstream timeout after
                            60000ms</p>
                    </div>

                    <div className="p-4 hover:bg-background-alt/50 transition-colors border-l-4 border-secondary text-sm">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-mono font-bold text-secondary text-xs">ERR_DB_CON</span>
                            <span className="text-[10px] text-text-muted">14분 전</span>
                        </div>
                        <p className="text-xs text-text-main break-all font-mono">VectorDB connection pool exhausted on
                            read-replica-2</p>
                    </div>

                    <div className="p-4 hover:bg-background-alt/50 transition-colors border-l-4 border-text-muted text-sm">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-mono font-bold text-text-muted text-xs">ERR_RATE_LIMIT</span>
                            <span className="text-[10px] text-text-muted">1시간 전</span>
                        </div>
                        <p className="text-xs text-text-main break-all font-mono">Workspace ws_09A1XYZ exceeded TPM limit
                            429</p>
                    </div>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default AdminMonitoring;
