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

function AdminEmployees() {
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
            <a href="/admin/companies" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                    </path>
                </svg>
                고객사(Workspace) 관리
            </a>
            <a href="/admin/users" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z">
                    </path>
                </svg>
                전체 회원 명부
            </a>

            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">조직도/권한 템플릿</p>
            <a href="/admin/departments" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z">
                    </path>
                </svg>
                기본 부서 템플릿
            </a>
            <a href="/admin/employees"
                className="nav-item active pl-10 text-xs text-primary font-bold bg-primary-light/50 border-none">
                직무(Role) 템플릿
            </a>
            <a href="/admin/org-chart" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                    </path>
                </svg>
                표준 조직도 관리
            </a>

            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mt-6 mb-2">프롬프트 & 영혼(Soul)
            </p>
            <a href="/admin/soul-templates" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z">
                    </path>
                </svg>
                에이전트 인격체(Soul)
            </a>
            <a href="/admin/tools" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                    </path>
                </svg>
                연동 도구(Tools) 관리
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
        </nav>

        <div className="p-4 border-t border-border">
            <a href="/app/home"
                className="flex items-center justify-center gap-2 p-2 rounded-lg bg-surface border border-border text-text-muted hover:bg-background-alt transition-colors w-full text-xs font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                    </path>
                </svg>
                워크스페이스로 돌아가기
            </a>
        </div>
    </aside>

    {/* Main Content */}
    {/* API: GET /api/admin/templates/roles */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end">
            <div>
                <h1 className="text-3xl font-serif text-text-main font-bold mb-2">직무별 직원 (Role) 템플릿</h1>
                <p className="text-text-muted">에이전트를 생성하는 데 필요한 '직무 단위'의 메타데이터와 권한 세트를 정의합니다.</p>
            </div>

            <div className="mt-4 lg:mt-0 flex gap-2">
                <button
                    className="bg-surface border border-border text-text-main px-4 py-2 rounded-xl hover:bg-background-alt transition-colors font-medium shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                        </path>
                    </svg>
                    복제하여 생성
                </button>
                <button
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    새 직무 템플릿
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
                <input type="text" placeholder="직무명, 역할로 검색..."
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary-light transition-colors shadow-sm text-text-main" />
            </div>

            <div className="flex gap-2">
                <select
                    className="bg-surface border border-border text-text-main px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-light shadow-sm min-w-[140px]">
                    <option value="">카테고리 (Category)</option>
                    <option value="marketing">마케팅</option>
                    <option value="hr">인사/총무</option>
                    <option value="dev">엔지니어링</option>
                </select>
            </div>
        </div>

        {/* Role Template List */}
        <div className="grid lg:grid-cols-3 gap-6">

            {/* Role Card 1 */}
            <div className="card p-0 flex flex-col h-full overflow-hidden hover:border-text-light transition-colors group">
                <div className="p-5 border-b border-border bg-surface-alt flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl bg-surface border border-border text-text-main flex items-center justify-center font-bold text-lg shadow-sm">
                            마</div>
                        <div>
                            <h3 className="font-bold text-text-main text-base group-hover:text-primary transition-colors">
                                퍼포먼스 마케터</h3>
                            <p className="text-[10px] font-mono text-text-light mt-0.5">role_tmpl_perf_mkt</p>
                        </div>
                    </div>
                </div>
                <div className="p-5 flex-1 bg-surface space-y-4">
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">기본 권한
                            (Permissions)</p>
                        <div className="flex flex-wrap gap-1">
                            <span
                                className="bg-background-alt border border-border text-text-muted px-2 py-0.5 rounded text-[10px]">광고
                                매체 API 접근</span>
                            <span
                                className="bg-background-alt border border-border text-text-muted px-2 py-0.5 rounded text-[10px]">보고서
                                무제한 생성</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">연결된 기본 Tools</p>
                        <p className="text-xs text-text-main font-mono">Google Analytics, Meta Ads API</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">연결된 영혼(Soul) 템플릿
                        </p>
                        <a href="/admin/soul-templates"
                            className="text-xs text-primary font-bold hover:underline font-mono">soul_mkt_analytical</a>
                    </div>
                </div>
                <div className="p-3 border-t border-border bg-background-alt flex justify-end">
                    <button
                        className="text-text-muted hover:text-primary text-xs font-medium px-2 py-1 transition-colors">편집</button>
                </div>
            </div>

            {/* Role Card 2 */}
            <div className="card p-0 flex flex-col h-full overflow-hidden hover:border-text-light transition-colors group">
                <div className="p-5 border-b border-border bg-surface-alt flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl bg-surface border border-border text-text-main flex items-center justify-center font-bold text-lg shadow-sm">
                            인</div>
                        <div>
                            <h3 className="font-bold text-text-main text-base group-hover:text-primary transition-colors">인사
                                관리자 (HR)</h3>
                            <p className="text-[10px] font-mono text-text-light mt-0.5">role_tmpl_hr_lead</p>
                        </div>
                    </div>
                </div>
                <div className="p-5 flex-1 bg-surface space-y-4">
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">기본 권한
                            (Permissions)</p>
                        <div className="flex flex-wrap gap-1">
                            <span
                                className="bg-secondary/10 border border-secondary/20 text-secondary px-2 py-0.5 rounded text-[10px] font-bold">임직원
                                Data Read (민감)</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">연결된 기본 Tools</p>
                        <p className="text-xs text-text-main font-mono">Workday API, 이메일 스케줄러</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">연결된 영혼(Soul) 템플릿
                        </p>
                        <a href="/admin/soul-templates"
                            className="text-xs text-primary font-bold hover:underline font-mono">soul_hr_empathetic</a>
                    </div>
                </div>
                <div className="p-3 border-t border-border bg-background-alt flex justify-end">
                    <button
                        className="text-text-muted hover:text-primary text-xs font-medium px-2 py-1 transition-colors">편집</button>
                </div>
            </div>

            {/* Role Card 3 */}
            <div className="card p-0 flex flex-col h-full overflow-hidden hover:border-text-light transition-colors group">
                <div className="p-5 border-b border-border bg-surface-alt flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl bg-surface border border-border text-text-main flex items-center justify-center font-bold text-lg shadow-sm">
                            데</div>
                        <div>
                            <h3 className="font-bold text-text-main text-base group-hover:text-primary transition-colors">
                                데이터 스페셜리스트</h3>
                            <p className="text-[10px] font-mono text-text-light mt-0.5">role_tmpl_data_spec</p>
                        </div>
                    </div>
                </div>
                <div className="p-5 flex-1 bg-surface space-y-4">
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">기본 권한
                            (Permissions)</p>
                        <div className="flex flex-wrap gap-1">
                            <span
                                className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold">Database
                                Query (R)</span>
                            <span
                                className="bg-background-alt border border-border text-text-muted px-2 py-0.5 rounded text-[10px]">Python
                                REPL 실행</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">연결된 기본 Tools</p>
                        <p className="text-xs text-text-main font-mono">Jupyter Env, Postgres Connect</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">연결된 영혼(Soul) 템플릿
                        </p>
                        <a href="/admin/soul-templates"
                            className="text-xs text-primary font-bold hover:underline font-mono">soul_data_logical</a>
                    </div>
                </div>
                <div className="p-3 border-t border-border bg-background-alt flex justify-end">
                    <button
                        className="text-text-muted hover:text-primary text-xs font-medium px-2 py-1 transition-colors">편집</button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default AdminEmployees;
