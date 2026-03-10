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

        /* Org Chart Specific Styles */
        .org-node {
            background-color: inherit /* FIXME: theme value not in map */;
            border: 1px solid inherit /* FIXME: theme value not in map */;
            border-radius: 0.75rem;
            padding: 1rem;
            min-width: 200px;
            box-shadow: inherit /* FIXME: theme value not in map */;
            position: relative;
        }

        .org-node::before {
            content: '';
            position: absolute;
            top: -1rem;
            left: 50%;
            width: 1px;
            height: 1rem;
            background-color: inherit /* FIXME: theme value not in map */;
            transform: translateX(-50%);
        }

        .org-node.root::before {
            display: none;
        }

        .org-children {
            display: flex;
            gap: 2rem;
            padding-top: 1rem;
            position: relative;
        }

        .org-children::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            width: 1px;
            height: 1rem;
            background-color: inherit /* FIXME: theme value not in map */;
            transform: translateX(-50%);
        }

        .org-children::after {
            content: '';
            position: absolute;
            top: 1rem;
            left: calc(50% / var(--child-count, 1) * 0.5);
            right: calc(50% / var(--child-count, 1) * 0.5);
            height: 1px;
            background-color: inherit /* FIXME: theme value not in map */;
        }

        /* Simple fallback structure if exact CSS drawing fails */
`;

function AdminOrgChart() {
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
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mb-2">조직 및 권한</p>
            <a href="/admin/org-chart" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                    </path>
                </svg>
                전체 조직도
            </a>
            <a href="/admin/org-templates" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z">
                    </path>
                </svg>
                조직 템플릿
            </a>
            <a href="/admin/report-lines" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                    </path>
                </svg>
                결재선/보고체계
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
    {/* API: GET /api/admin/org-chart */}
    <main className="flex-1 overflow-y-auto bg-background-alt relative">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none"
            style={{backgroundImage: "radial-gradient(#2d2c2a 1px, transparent 1px)", backgroundSize: "20px 20px"}}></div>

        <div className="relative z-10 px-8 py-10">
            <header
                className="mb-10 lg:flex lg:justify-between lg:items-end bg-surface p-6 rounded-2xl shadow-sm border border-border">
                <div>
                    <h1 className="text-3xl font-serif text-text-main font-bold mb-2">글로벌 에이전트 조직도 (Org Chart)</h1>
                    <p className="text-text-muted">전체 워크스페이스에 배포된 부서 및 소속 에이전트들의 계층 구조를 시각화합니다.</p>
                </div>

                <div className="mt-4 lg:mt-0 flex gap-2">
                    <select
                        className="bg-background border border-border text-text-main px-4 py-2 rounded-xl text-sm focus:outline-none focus:border-primary-light transition-colors shadow-sm">
                        <option>Acme Corp (Demo)</option>
                        <option>Global Industries</option>
                    </select>
                    <button
                        className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4">
                            </path>
                        </svg>
                        내보내기 (PDF)
                    </button>
                </div>
            </header>

            {/* Org Chart Visualization Area (Simplified for HTML Demo) */}
            <div className="flexustify-center min-h-[600px] overflow-x-auto pb-20 pt-10">
                <div className="flex flex-col items-center">

                    {/* Root Node */}
                    <div className="org-node root text-center mb-8 border-primary/30 shadow-md">
                        <div
                            className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                                </path>
                            </svg>
                        </div>
                        <h3 className="font-bold text-lg text-text-main font-serif">A.I. Center of Excellence</h3>
                        <p className="text-xs text-text-muted mt-1">총괄 에이전트: <span className="font-bold text-text-main">Nexus
                                (CEO)</span></p>
                    </div>

                    {/* Department Level */}
                    <div className="flex gap-16 relative w-full justify-center">
                        {/* Pseudo-lines connecting to root via CSS */}
                        <div
                            className="absolute top-[-2rem] w-3/4 h-8 border-t-2 border-border-focus rounded-t-xl z-0 pointer-events-none">
                        </div>
                        <div
                            className="absolute top-[-2rem] w-0.5 h-8 bg-border-focus left-1/2 -translate-x-1/2 z-0 pointer-events-none">
                        </div>

                        {/* Dept 1 */}
                        <div className="flex flex-col items-center relative z-10 w-64 pt-8">
                            <div className="absolute top-0 w-0.5 h-8 bg-border-focus pointer-events-none"></div>

                            <div
                                className="org-node w-full border-t-4 border-t-secondary text-center mb-6 hover:shadow-lg transition-shadow bg-surface cursor-pointer">
                                <h4 className="font-bold text-text-main text-base mb-1">인사/채용 부서</h4>
                                <p
                                    className="text-[10px] text-text-muted bg-background-alt inline-block px-2 py-0.5 rounded border border-border">
                                    에이전트 3기</p>
                            </div>

                            {/* Agents in Dept 1 */}
                            <div className="flex flex-col gap-3 w-full pl-6 border-l w-2 border-border-focus relative">
                                <div
                                    className="bg-surface p-3 rounded-xl border border-border flex items-center gap-3 relative before:content-[''] before:absolute before:w-4 before:h-0.5 before:bg-border-focus before:-left-4 before:top-1/2 shadow-sm hover:border-primary transition-colors cursor-pointer group">
                                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=HR1&backgroundColor=f5f0eb"
                                        alt="Agent"
                                        className="w-8 h-8 rounded-full border border-border-focus bg-background" />
                                    <div className="flex-1 text-left">
                                        <p
                                            className="font-bold text-sm text-text-main group-hover:text-primary transition-colors">
                                            Emma (HR Lead)</p>
                                        <p className="text-[10px] text-text-light">인사 총괄</p>
                                    </div>
                                </div>
                                <div
                                    className="bg-surface p-3 rounded-xl border border-border flex items-center gap-3 relative before:content-[''] before:absolute before:w-4 before:h-0.5 before:bg-border-focus before:-left-4 before:top-1/2 shadow-sm hover:border-primary transition-colors cursor-pointer group">
                                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Recruit1&backgroundColor=f5f0eb"
                                        alt="Agent"
                                        className="w-8 h-8 rounded-full border border-border-focus bg-background" />
                                    <div className="flex-1 text-left">
                                        <p
                                            className="font-bold text-sm text-text-main group-hover:text-primary transition-colors">
                                            Alex (Recruiter)</p>
                                        <p className="text-[10px] text-text-light">채용/스크리닝</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dept 2 */}
                        <div className="flex flex-col items-center relative z-10 w-64 pt-8">
                            <div className="absolute top-0 w-0.5 h-8 bg-border-focus pointer-events-none"></div>

                            <div
                                className="org-node w-full border-t-4 border-t-accent text-center mb-6 hover:shadow-lg transition-shadow bg-surface cursor-pointer">
                                <h4 className="font-bold text-text-main text-base mb-1">재무/회계 부서</h4>
                                <p
                                    className="text-[10px] text-text-muted bg-background-alt inline-block px-2 py-0.5 rounded border border-border">
                                    에이전트 2기</p>
                            </div>

                            {/* Agents in Dept 2 */}
                            <div className="flex flex-col gap-3 w-full pl-6 border-l w-2 border-border-focus relative">
                                <div
                                    className="bg-surface p-3 rounded-xl border border-border flex items-center gap-3 relative before:content-[''] before:absolute before:w-4 before:h-0.5 before:bg-border-focus before:-left-4 before:top-1/2 shadow-sm hover:border-primary transition-colors cursor-pointer group">
                                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=CFO&backgroundColor=f5f0eb"
                                        alt="Agent"
                                        className="w-8 h-8 rounded-full border border-border-focus bg-background" />
                                    <div className="flex-1 text-left">
                                        <p
                                            className="font-bold text-sm text-text-main group-hover:text-primary transition-colors">
                                            Marcus (CFO)</p>
                                        <p className="text-[10px] text-text-light">재무 총괄</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dept 3 */}
                        <div className="flex flex-col items-center relative z-10 w-64 pt-8">
                            <div className="absolute top-0 w-0.5 h-8 bg-border-focus pointer-events-none"></div>

                            <div
                                className="org-node w-full border-t-4 border-t-primary text-center mb-6 hover:shadow-lg transition-shadow bg-surface cursor-pointer">
                                <h4 className="font-bold text-text-main text-base mb-1">마케팅/운영 기획</h4>
                                <p
                                    className="text-[10px] text-text-muted bg-background-alt inline-block px-2 py-0.5 rounded border border-border">
                                    에이전트 5기</p>
                            </div>

                            {/* Agents in Dept 3 */}
                            <div className="flex flex-col gap-3 w-full pl-6 border-l w-2 border-border-focus relative">
                                <div
                                    className="bg-surface p-3 rounded-xl border border-border flex items-center gap-3 relative before:content-[''] before:absolute before:w-4 before:h-0.5 before:bg-border-focus before:-left-4 before:top-1/2 shadow-sm hover:border-primary transition-colors cursor-pointer group">
                                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Mkt1&backgroundColor=f5f0eb"
                                        alt="Agent"
                                        className="w-8 h-8 rounded-full border border-border-focus bg-background" />
                                    <div className="flex-1 text-left">
                                        <p
                                            className="font-bold text-sm text-text-main group-hover:text-primary transition-colors">
                                            Sarah (CMO)</p>
                                        <p className="text-[10px] text-text-light">퍼포먼스 마케팅</p>
                                    </div>
                                </div>
                                <div
                                    className="bg-surface p-3 rounded-xl border border-border flex items-center gap-3 relative before:content-[''] before:absolute before:w-4 before:h-0.5 before:bg-border-focus before:-left-4 before:top-1/2 shadow-sm border-dashed text-center justify-center cursor-pointer hover:bg-background-alt">
                                    <p className="text-xs font-bold text-text-muted">+ 에이전트 채용 신청</p>
                                </div>
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

export default AdminOrgChart;
