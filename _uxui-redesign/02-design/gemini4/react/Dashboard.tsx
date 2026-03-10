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
            padding: 1.5rem;
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

function Dashboard() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar */}
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-full z-10 shadow-soft">
        <div className="p-6">
            <h2 className="font-serif text-2xl tracking-tight text-primary font-bold">CORTHEX</h2>
            <p className="text-xs text-text-light mt-1">회사명: 알파 랩스</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            <a href="/app/home" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                    </path>
                </svg>
                홈 대시보드
            </a>
            <a href="/app/command-center" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z">
                    </path>
                </svg>
                사령관실
            </a>
            <a href="/app/dashboard" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                    </path>
                </svg>
                조직 성과/통계
            </a>
            <a href="/app/agents" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                    </path>
                </svg>
                부서 및 직원
            </a>
            <a href="/app/reports" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                    </path>
                </svg>
                보고서
            </a>
        </nav>

        <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
                <div
                    className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold">
                    김</div>
                <div>
                    <p className="font-medium text-text-main">김대표 (CEO)</p>
                </div>
            </div>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-8 py-10">
        <header className="mb-10 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-serif text-text-main mb-2">상세 대시보드 및 성계</h1>
                <p className="text-text-muted">에이전트별 토큰 사용량, 부서별 효율성, 도구 활용 통계 등을 분석합니다.</p>
            </div>

            <div className="flex gap-2">
                {/* API: GET /api/workspace/dashboard/usage */}
                <select
                    className="bg-surface border border-border text-text-main rounded-xl px-4 py-2 focus:outline-none focus:border-primary-light shadow-sm font-medium">
                    <option>최근 7일</option>
                    <option>이번 달</option>
                    <option>지난 달</option>
                </select>
                <button
                    className="bg-surface border border-border text-text-main px-4 py-2 rounded-xl hover:bg-background-alt transition-colors font-medium shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    내보내기
                </button>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Token Usage Chart */}
            <div className="card lg:col-span-2 flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-serif">일별 토큰 사용량 트렌드</h3>
                    <span className="text-sm text-text-muted font-medium bg-background-alt px-3 py-1 rounded-full">총 4.2M
                        토큰</span>
                </div>
                <div
                    className="flex-1 bg-background-alt border border-border rounded-xl flex items-center justify-center text-text-muted font-mono relative overflow-hidden p-6 gap-2 items-end">
                    {/* Fake Bar Chart */}
                    <div className="w-full flex justify-between items-end h-full pt-10">
                        <div className="w-1/12 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors h-[30%]"></div>
                        <div className="w-1/12 bg-primary/30 hover:bg-primary/50 rounded-t transition-colors h-[45%]"></div>
                        <div
                            className="w-1/12 bg-primary/40 hover:bg-primary/60 rounded-t transition-colors h-[60%] relative group">
                            <div
                                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface border border-border rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs whitespace-nowrap shadow-sm">
                                620K 토큰</div>
                        </div>
                        <div className="w-1/12 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors h-[25%]"></div>
                        <div
                            className="w-1/12 bg-primary/60 hover:bg-primary/80 rounded-t transition-colors h-[85%] relative group">
                            <div
                                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface border border-border rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs whitespace-nowrap shadow-sm">
                                890K 토큰</div>
                        </div>
                        <div className="w-1/12 bg-primary/50 hover:bg-primary/70 rounded-t transition-colors h-[70%]"></div>
                        <div className="w-1/12 bg-primary/30 hover:bg-primary/50 rounded-t transition-colors h-[40%]"></div>
                    </div>
                </div>
            </div>

            {/* Model Usage Pie */}
            {/* API: GET /api/workspace/dashboard/costs */}
            <div className="card flex flex-col">
                <h3 className="text-lg font-serif mb-6">제공자별 비용 비율</h3>
                <div className="flex-1 flex flex-col items-center justify-center">
                    {/* Fake Pie Chart */}
                    <div
                        className="w-48 h-48 rounded-full border-[1.5rem] border-t-primary border-r-secondary border-b-accent border-l-border relative">
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-serif text-text-main">₩124k</span>
                            <span className="text-xs text-text-muted">총 비용</span>
                        </div>
                    </div>

                    <div className="w-full mt-8 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2"><span
                                    className="w-3 h-3 rounded-full bg-primary block"></span> <span>Anthropic (Claude
                                    3.5)</span></div>
                            <span className="font-medium">45%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2"><span
                                    className="w-3 h-3 rounded-full bg-secondary block"></span> <span>OpenAI (GPT-4o)</span>
                            </div>
                            <span className="font-medium">30%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2"><span
                                    className="w-3 h-3 rounded-full bg-accent block"></span> <span>Google (Gemini
                                    1.5)</span></div>
                            <span className="font-medium">20%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2"><span
                                    className="w-3 h-3 rounded-full bg-border block"></span> <span>기타 API (도구 호출)</span>
                            </div>
                            <span className="font-medium text-text-light">5%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Agents by Cost */}
            {/* API: GET /api/workspace/dashboard/costs/by-agent */}
            <div className="card p-0 overflow-hidden">
                <div className="p-5 border-b border-border bg-surface-alt">
                    <h3 className="text-lg font-serif">비용 발생 상위 에이전트</h3>
                </div>
                <div className="divide-y divide-border">
                    <div className="p-4 flex items-center justify-between hover:bg-background transition-colors">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                                C</div>
                            <div>
                                <p className="font-medium text-text-main">투자 총괄 (CIO)</p>
                                <p className="text-xs text-text-muted">전략실</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-text-main">₩42,500</p>
                            <p className="text-xs text-secondary">+12% (지난주 대비)</p>
                        </div>
                    </div>
                    <div className="p-4 flex items-center justify-between hover:bg-background transition-colors">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs">
                                시</div>
                            <div>
                                <p className="font-medium text-text-main">시황 분석가</p>
                                <p className="text-xs text-text-muted">전략실</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-text-main">₩28,100</p>
                            <p className="text-xs text-primary">-5% (지난주 대비)</p>
                        </div>
                    </div>
                    <div className="p-4 flex items-center justify-between hover:bg-background transition-colors">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs">
                                콘</div>
                            <div>
                                <p className="font-medium text-text-main">콘텐츠 전문가</p>
                                <p className="text-xs text-text-muted">마케팅부</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-text-main">₩15,300</p>
                            <p className="text-xs text-text-muted">변동 없음</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Used Tools */}
            {/* API: GET /api/workspace/dashboard/stats */}
            <div className="card p-0 overflow-hidden">
                <div className="p-5 border-b border-border bg-surface-alt">
                    <h3 className="text-lg font-serif">가장 많이 사용된 도구</h3>
                </div>
                <div className="divide-y divide-border">
                    <div className="p-4 flex items-center gap-4 hover:bg-background transition-colors">
                        <div className="text-2xl font-serif text-text-light w-6 text-center">1</div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-medium text-text-main">KIS 증권 (시세/주문)</p>
                                <span className="text-sm font-medium">842회</span>
                            </div>
                            <div className="w-full bg-background rounded-full h-1.5">
                                <div className="bg-primary h-1.5 rounded-full" style={{width: "85%"}}></div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 flex items-center gap-4 hover:bg-background transition-colors">
                        <div className="text-2xl font-serif text-text-light w-6 text-center">2</div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-medium text-text-main">웹 브라우징 (Tavily)</p>
                                <span className="text-sm font-medium">520회</span>
                            </div>
                            <div className="w-full bg-background rounded-full h-1.5">
                                <div className="bg-primary/70 h-1.5 rounded-full" style={{width: "55%"}}></div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 flex items-center gap-4 hover:bg-background transition-colors">
                        <div className="text-2xl font-serif text-text-light w-6 text-center">3</div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-medium text-text-main">Notion API (문서 기록)</p>
                                <span className="text-sm font-medium">314회</span>
                            </div>
                            <div className="w-full bg-background rounded-full h-1.5">
                                <div className="bg-primary/40 h-1.5 rounded-full" style={{width: "35%"}}></div>
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

export default Dashboard;
