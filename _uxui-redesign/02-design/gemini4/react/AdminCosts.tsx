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

function AdminCosts() {
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
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mb-2">과금 및 수익</p>
            <a href="/admin/costs" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                    </path>
                </svg>
                글로벌 비용 및 자원
            </a>

            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">운영 및 시스템</p>
            <a href="/admin/monitoring" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                    </path>
                </svg>
                이용량 모니터링
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
    {/* API: GET /api/admin/costs/summary */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end border-b border-border pb-6">
            <div>
                <h1 className="text-3xl font-serif text-text-main font-bold mb-2">글로벌 비용 및 자원 (Costs & Margin)</h1>
                <p className="text-text-muted">전체 워크스페이스에서 발생한 플랫폼 인프라 원가(LLM API, 클라우드 자원)와 청구 내역 간의 마진을 분석합니다.</p>
            </div>

            <div className="mt-4 lg:mt-0 flex gap-2">
                <select
                    className="bg-surface border border-border text-text-main px-4 py-2 rounded-xl text-sm focus:outline-none focus:border-primary-light transition-colors shadow-sm">
                    <option>2023년 10월</option>
                    <option>2023년 9월</option>
                    <option>2023년 8월</option>
                </select>
                <button
                    className="bg-surface border border-border text-text-main px-4 py-2 rounded-xl hover:bg-background-alt transition-colors font-medium shadow-sm flex items-center gap-2 text-xs">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    재무 리포트 추출
                </button>
            </div>
        </header>

        {/* KPI Summary */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
                <p className="text-xs font-bold text-text-light uppercase tracking-wider mb-2">총 예상 청구액 (Total Revenue)</p>
                <div className="flex items-end gap-3 mb-1">
                    <span className="text-3xl font-mono font-bold text-text-main">$142,500</span>
                    <span className="text-sm font-bold text-primary mb-1">+18.5%</span>
                </div>
                <p className="text-[10px] text-text-muted">모든 활성 워크스페이스 합산 기준</p>
            </div>
            <div className="card p-6 border border-secondary/30">
                <p className="text-xs font-bold text-text-light uppercase tracking-wider mb-2">총 발생 원가 (Total COGS)</p>
                <div className="flex items-end gap-3 mb-1">
                    <span className="text-3xl font-mono font-bold text-secondary">$38,240</span>
                    <span className="text-sm font-bold text-secondary mb-1">+22.1%</span>
                </div>
                <p className="text-[10px] text-text-muted">LLM API 및 클라우드 인프라 발생 비용</p>
            </div>
            <div className="card p-6 bg-primary/5 border border-primary/20">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">예상 총 이익률 (Gross Margin)</p>
                <div className="flex items-end gap-3 mb-1">
                    <span className="text-3xl font-mono font-bold text-primary">73.1%</span>
                    <span className="text-sm font-bold text-secondary mb-1">-1.2%p</span>
                </div>
                <p className="text-[10px] text-text-muted">목표 마진율 75% 하회 (API 단가 상승 원인)</p>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Cost Breakdown (COGS) */}
            <div className="lg:col-span-1 border border-border p-6 rounded-2xl bg-surface shadow-sm">
                <h3 className="font-bold text-lg text-text-main font-serif mb-6 border-b border-border pb-3">원가(COGS) 상세 구성
                </h3>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-sm font-bold text-text-main">OpenAI API (GPT-4)</span>
                            <span className="text-sm font-mono text-text-main">$22,400</span>
                        </div>
                        <div className="w-full bg-background-alt rounded-full h-1.5 border border-border">
                            <div className="bg-secondary h-1.5 rounded-full w-[58%]"></div>
                        </div>
                        <p className="text-[10px] text-text-muted text-right mt-1">58.5%</p>
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-sm font-bold text-text-main">Anthropic API (Claude)</span>
                            <span className="text-sm font-mono text-text-main">$8,200</span>
                        </div>
                        <div className="w-full bg-background-alt rounded-full h-1.5 border border-border">
                            <div className="bg-accent h-1.5 rounded-full w-[21%]"></div>
                        </div>
                        <p className="text-[10px] text-text-muted text-right mt-1">21.4%</p>
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-sm font-bold text-text-main">AWS/GCP 인프라</span>
                            <span className="text-sm font-mono text-text-main">$5,140</span>
                        </div>
                        <div className="w-full bg-background-alt rounded-full h-1.5 border border-border">
                            <div className="bg-primary h-1.5 rounded-full w-[13%]"></div>
                        </div>
                        <p className="text-[10px] text-text-muted text-right mt-1">13.4%</p>
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-sm font-bold text-text-main">검색/도구 API (Tavily 등)</span>
                            <span className="text-sm font-mono text-text-main">$2,500</span>
                        </div>
                        <div className="w-full bg-background-alt rounded-full h-1.5 border border-border">
                            <div className="bg-text-light h-1.5 rounded-full w-[6%]"></div>
                        </div>
                        <p className="text-[10px] text-text-muted text-right mt-1">6.5%</p>
                    </div>
                </div>
            </div>

            {/* Top Spending Workspaces */}
            <div className="lg:col-span-2 border border-border rounded-2xl bg-surface shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-end">
                    <h3 className="font-bold text-lg text-text-main font-serif">워크스페이스별 원가 발생 상위 5곳</h3>
                    <button className="text-xs text-text-muted hover:text-primary transition-colors font-medium">전체 목록
                        보기</button>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr
                            className="bg-background-alt border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            <th className="p-4 pl-6">워크스페이스 (고객사)</th>
                            <th className="p-4">유료 에이전트 수</th>
                            <th className="p-4">발생 원가 (Cost)</th>
                            <th className="p-4">예상 청구액 (Rev)</th>
                            <th className="p-4 text-right pr-6">마진율</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                        <tr className="hover:bg-background-alt/50 transition-colors">
                            <td className="p-4 pl-6 font-bold text-text-main">Acme Corp</td>
                            <td className="p-4">45명</td>
                            <td className="p-4 font-mono">$4,250</td>
                            <td className="p-4 font-mono">$18,500</td>
                            <td className="p-4 pr-6 text-right font-bold text-primary">77.0%</td>
                        </tr>
                        <tr className="hover:bg-background-alt/50 transition-colors">
                            <td className="p-4 pl-6 font-bold text-text-main">Global Industries</td>
                            <td className="p-4">32명</td>
                            <td className="p-4 font-mono">$3,820</td>
                            <td className="p-4 font-mono">$12,400</td>
                            <td className="p-4 pr-6 text-right font-bold text-secondary">69.1% <span
                                    className="text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded ml-1">주의</span></td>
                        </tr>
                        <tr className="hover:bg-background-alt/50 transition-colors">
                            <td className="p-4 pl-6 font-bold text-text-main">Tech Innovators</td>
                            <td className="p-4">28명</td>
                            <td className="p-4 font-mono">$2,900</td>
                            <td className="p-4 font-mono">$11,200</td>
                            <td className="p-4 pr-6 text-right font-bold text-primary">74.1%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </main>
    </>
  );
}

export default AdminCosts;
