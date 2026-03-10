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

function AdminCompanies() {
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
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mb-2">플랫폼 관리</p>
            <a href="/admin/dashboard" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                    </path>
                </svg>
                전체 대시보드
            </a>
            <a href="/admin/agents" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                    </path>
                </svg>
                글로벌 에이전트 목록
            </a>
            <a href="/admin/companies" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                    </path>
                </svg>
                고객사(Workspace) 관리
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
            <a href="/admin/costs" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                    </path>
                </svg>
                비용 및 자원
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
    {/* API: GET /api/admin/workspaces */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end">
            <div>
                <h1 className="text-3xl font-serif text-text-main font-bold mb-2">고객사 (Workspace) 통합 관리</h1>
                <p className="text-text-muted">CORTHEX 플랫폼을 이용 중인 전체 고객사(Tenant) 목록과 기본 메타데이터, 운영 상태를 관리합니다.</p>
            </div>

            <div className="mt-4 lg:mt-0 flex gap-2">
                <button
                    className="bg-surface border border-border text-text-main px-4 py-2 rounded-xl hover:bg-background-alt transition-colors font-medium shadow-sm flex items-center gap-2 text-xs">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                    </svg>
                    CSV 내보내기
                </button>
            </div>
        </header>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
                <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-light" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input type="text" placeholder="고객사명, 도메인, ID로 검색..."
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary-light transition-colors shadow-sm text-text-main" />
            </div>

            <div className="flex gap-2">
                <select
                    className="bg-surface border border-border text-text-main px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-light shadow-sm min-w-[150px]">
                    <option value="">플랜 전체</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="pro">Pro</option>
                    <option value="startup">Startup</option>
                </select>
                <select
                    className="bg-surface border border-border text-text-main px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-light shadow-sm min-w-[130px]">
                    <option value="">상태 전체</option>
                    <option value="active">정상 (Active)</option>
                    <option value="suspended">유예/정지</option>
                </select>
            </div>
        </div>

        {/* Companies Table */}
        <div className="card overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr
                        className="bg-background-alt border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        <th className="p-4 pl-6">ID / 고객사명</th>
                        <th className="p-4">구독 플랜</th>
                        <th className="p-4">인간 사용자</th>
                        <th className="p-4">활성 에이전트</th>
                        <th className="p-4">생성일</th>
                        <th className="p-4 text-center">상태</th>
                        <th className="p-4 pr-6 text-right">관리</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                    {/* Company 1 */}
                    <tr className="hover:bg-background-alt/50 transition-colors">
                        <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center font-bold font-serif text-primary shadow-sm">
                                    A</div>
                                <div>
                                    <h3 className="font-bold text-text-main flex items-center gap-1.5">Acme Corp <a href="#"
                                            className="text-text-light hover:text-primary"><svg className="w-3 h-3" fill="none"
                                                stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14">
                                                </path>
                                            </svg></a></h3>
                                    <p className="text-[10px] font-mono text-text-muted mt-0.5">ws_01H9KCX9T...</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <span
                                className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] font-bold">Enterprise</span>
                        </td>
                        <td className="p-4 font-mono text-text-main">1,245</td>
                        <td className="p-4 font-mono text-text-main">45</td>
                        <td className="p-4 text-xs text-text-muted">2023.01.15</td>
                        <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1.5"><span
                                    className="w-2 h-2 rounded-full bg-green-500"></span><span
                                    className="text-[10px] text-text-main">Active</span></span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                            <button
                                className="text-text-muted hover:text-primary transition-colors text-xs font-medium border border-border px-2 py-1 rounded hover:bg-background-alt">설정
                                (Impersonate)</button>
                        </td>
                    </tr>

                    {/* Company 2 */}
                    <tr className="hover:bg-background-alt/50 transition-colors">
                        <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center font-bold font-serif text-secondary shadow-sm">
                                    G</div>
                                <div>
                                    <h3 className="font-bold text-text-main flex items-center gap-1.5">Global Industries <a
                                            href="#" className="text-text-light hover:text-primary"><svg className="w-3 h-3"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14">
                                                </path>
                                            </svg></a></h3>
                                    <p className="text-[10px] font-mono text-text-muted mt-0.5">ws_02J3MDA5Q...</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <span
                                className="bg-surface-alt border border-border text-text-muted px-2 py-0.5 rounded text-[10px] font-bold">Pro</span>
                        </td>
                        <td className="p-4 font-mono text-text-main">320</td>
                        <td className="p-4 font-mono text-text-main">12</td>
                        <td className="p-4 text-xs text-text-muted">2023.05.22</td>
                        <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1.5"><span
                                    className="w-2 h-2 rounded-full bg-green-500"></span><span
                                    className="text-[10px] text-text-main">Active</span></span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                            <button
                                className="text-text-muted hover:text-primary transition-colors text-xs font-medium border border-border px-2 py-1 rounded hover:bg-background-alt">설정
                                (Impersonate)</button>
                        </td>
                    </tr>

                    {/* Company 3 (Suspended) */}
                    <tr className="hover:bg-background-alt/50 transition-colors opacity-60">
                        <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center font-bold font-serif text-text-muted shadow-sm">
                                    D</div>
                                <div>
                                    <h3 className="font-bold text-text-main flex items-center gap-1.5">Dead Startup <a
                                            href="#" className="text-text-light hover:text-primary"><svg className="w-3 h-3"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14">
                                                </path>
                                            </svg></a></h3>
                                    <p className="text-[10px] font-mono text-text-muted mt-0.5">ws_09A1XYZ3V...</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <span
                                className="bg-surface-alt border border-border text-text-muted px-2 py-0.5 rounded text-[10px] font-bold">Startup</span>
                        </td>
                        <td className="p-4 font-mono text-text-main">15</td>
                        <td className="p-4 font-mono text-text-main">3</td>
                        <td className="p-4 text-xs text-text-muted">2023.08.10</td>
                        <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1.5"><span
                                    className="w-2 h-2 rounded-full bg-red-500"></span><span
                                    className="text-[10px] text-red-600 font-bold">Suspended</span></span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                            <button
                                className="text-text-muted hover:text-primary transition-colors text-xs font-medium border border-border px-2 py-1 rounded hover:bg-background-alt pt-[2px]">활성화</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Pagination */}
            <div
                className="p-4 border-t border-border flex items-center justify-between text-xs text-text-muted bg-surface-alt">
                <span>전체 145개 워크스페이스</span>
                <div className="flex gap-1">
                    <button
                        className="px-2 py-1 border border-border rounded bg-surface hover:bg-background-alt disabled:opacity-50"
                        disabled>이전</button>
                    <button
                        className="px-2 py-1 border border-primary bg-primary/10 text-primary font-bold rounded">1</button>
                    <button className="px-2 py-1 border border-border rounded bg-surface hover:bg-background-alt">2</button>
                    <button className="px-2 py-1 border border-border rounded bg-surface hover:bg-background-alt">3</button>
                    <button
                        className="px-2 py-1 border border-border rounded bg-surface hover:bg-background-alt">다음</button>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default AdminCompanies;
