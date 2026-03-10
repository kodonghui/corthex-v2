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

        /* Table Styles */
        .table-row {
            transition: background-color 0.2s;
        }

        .table-row:hover {
            background-color: inherit /* FIXME: theme value not in map */;
        }
`;

function AdminUsers() {
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
            <a href="/admin/companies" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                    </path>
                </svg>
                고객사(Workspace) 관리
            </a>
            <a href="/admin/users" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z">
                    </path>
                </svg>
                글로벌 유저 목록
            </a>

            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">운영 및 시스템</p>
            <a href="/admin/settings" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                    </path>
                </svg>
                플랫폼 기본 설정
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
    {/* API: GET /api/admin/users */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-8 lg:flex lg:justify-between lg:items-end">
            <div>
                <h1 className="text-3xl font-serif text-text-main font-bold mb-2">글로벌 유저 목록</h1>
                <p className="text-text-muted">플랫폼에 등록된 전체 사용자(인간)를 조회하고 워크스페이스 소속 및 권한을 관리합니다.</p>
            </div>

            <div className="mt-4 lg:mt-0 flex gap-2">
                <div className="relative">
                    <input type="text" placeholder="이름, 이메일, 고객사 검색..."
                        className="w-64 bg-surface border border-border pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-primary-light transition-colors" />
                    <svg className="w-4 h-4 text-text-muted absolute left-3.5 top-2.5" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                <button
                    className="bg-surface border border-border text-text-main px-4 py-2 rounded-xl transition-colors font-medium shadow-sm flex items-center gap-2 hover:bg-background-alt">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z">
                        </path>
                    </svg>
                    필터
                </button>
            </div>
        </header>

        {/* KPI Filters */}
        <div className="flex gap-4 mb-6 border-b border-border pb-4">
            <button className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold shadow-sm">전체 유저
                (1,245)</button>
            <button
                className="px-4 py-1.5 rounded-full bg-surface border border-border text-text-muted hover:text-text-main hover:bg-background-alt transition-colors text-xs font-bold">플랫폼
                관리자 (8)</button>
            <button
                className="px-4 py-1.5 rounded-full bg-surface border border-border text-text-muted hover:text-text-main hover:bg-background-alt transition-colors text-xs font-bold">비활성
                계정 (32)</button>
        </div>

        <div className="card overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-background-alt border-b border-border">
                        <th className="p-4 text-[10px] font-bold text-text-light uppercase tracking-wider font-serif">유저 이름
                            / 이메일</th>
                        <th className="p-4 text-[10px] font-bold text-text-light uppercase tracking-wider font-serif">소속
                            워크스페이스</th>
                        <th className="p-4 text-[10px] font-bold text-text-light uppercase tracking-wider font-serif">플랫폼 권한
                        </th>
                        <th className="p-4 text-[10px] font-bold text-text-light uppercase tracking-wider font-serif">상태
                        </th>
                        <th className="p-4 text-[10px] font-bold text-text-light uppercase tracking-wider font-serif">가입일 /
                            최근 접속</th>
                        <th
                            className="p-4 text-[10px] font-bold text-text-light uppercase tracking-wider font-serif text-right">
                            관리</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {/* User 1 */}
                    <tr className="table-row">
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-1 ring-border">
                                    ED</div>
                                <div>
                                    <div className="font-bold text-text-main">Elddl (Owner)</div>
                                    <div className="text-[10px] text-text-muted">elddl@corthex.ai</div>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <span
                                className="inline-block px-2 py-0.5 rounded-md bg-surface border border-border text-xs font-medium">CORTHEX
                                HQ</span>
                        </td>
                        <td className="p-4">
                            <span
                                className="inline-flex items-center gap-1 text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-md">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
                                    </path>
                                </svg>
                                System Admin
                            </span>
                        </td>
                        <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 text-xs text-green-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Active
                            </span>
                        </td>
                        <td className="p-4">
                            <div className="text-xs text-text-main">2026-01-01</div>
                            <div className="text-[10px] text-text-muted">just now</div>
                        </td>
                        <td className="p-4 text-right">
                            <button className="text-text-muted hover:text-primary transition-colors p-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z">
                                    </path>
                                </svg>
                            </button>
                        </td>
                    </tr>

                    {/* User 2 */}
                    <tr className="table-row">
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <img src="https://i.pravatar.cc/150?img=32" alt="Alice"
                                    className="w-8 h-8 rounded-full object-cover ring-1 ring-border shadow-sm" />
                                <div>
                                    <div className="font-bold text-text-main">Alice Kim</div>
                                    <div className="text-[10px] text-text-muted">alice@acme.corp</div>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <span
                                className="inline-block px-2 py-0.5 rounded-md bg-surface border border-border text-xs font-medium">Acme
                                Corp</span>
                        </td>
                        <td className="p-4 text-xs text-text-main">
                            Tenant User
                        </td>
                        <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 text-xs text-green-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Active
                            </span>
                        </td>
                        <td className="p-4">
                            <div className="text-xs text-text-main">2026-02-15</div>
                            <div className="text-[10px] text-text-muted">2 hours ago</div>
                        </td>
                        <td className="p-4 text-right">
                            <button className="text-text-muted hover:text-primary transition-colors p-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z">
                                    </path>
                                </svg>
                            </button>
                        </td>
                    </tr>

                    {/* User 3 */}
                    <tr className="table-row">
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-full bg-background-alt text-text-muted flex items-center justify-center font-bold text-xs ring-1 ring-border">
                                    BP</div>
                                <div>
                                    <div className="font-bold text-text-muted">Bob Park</div>
                                    <div className="text-[10px] text-text-muted">bob@acme.corp</div>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <span
                                className="inline-block px-2 py-0.5 rounded-md bg-surface border border-border text-xs font-medium text-text-muted">Acme
                                Corp</span>
                        </td>
                        <td className="p-4 text-xs text-text-muted">
                            Tenant User
                        </td>
                        <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                Inactive
                            </span>
                        </td>
                        <td className="p-4">
                            <div className="text-xs text-text-muted">2026-02-16</div>
                            <div className="text-[10px] text-text-muted">14 days ago</div>
                        </td>
                        <td className="p-4 text-right">
                            <button className="text-text-muted hover:text-primary transition-colors p-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z">
                                    </path>
                                </svg>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div
                className="p-4 border-t border-border flex items-center justify-between text-xs text-text-muted bg-background-alt/50">
                <span>Showing 1 to 3 of 1,245 entries</span>
                <div className="flex gap-1">
                    <button
                        className="px-2 py-1 rounded bg-surface border border-border hover:bg-background-alt">&lt;</button>
                    <button className="px-2 py-1 rounded bg-primary text-white border border-primary">1</button>
                    <button className="px-2 py-1 rounded bg-surface border border-border hover:bg-background-alt">2</button>
                    <button className="px-2 py-1 rounded bg-surface border border-border hover:bg-background-alt">3</button>
                    <button
                        className="px-2 py-1 rounded bg-surface border border-border hover:bg-background-alt">&gt;</button>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default AdminUsers;
