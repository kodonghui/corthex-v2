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

        .workflow-card {
            transition: all 0.2s ease;
            border: 1px solid inherit /* FIXME: theme value not in map */;
        }

        .workflow-card:hover {
            transform: translateY(-2px);
            box-shadow: inherit /* FIXME: theme value not in map */;
            border-color: inherit /* FIXME: theme value not in map */;
        }
`;

function AdminWorkflows() {
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
            <p className="px-4 text-[10px] font-bold text-text-light uppercase tracking-widest mb-2">마켓플레이스 관리</p>
            <a href="/admin/agents" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                    </path>
                </svg>
                에이전트 목록
            </a>
            <a href="/admin/template-market" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                    </path>
                </svg>
                부서 템플릿 마켓
            </a>
            <a href="/admin/workflows" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                    </path>
                </svg>
                글로벌 워크플로우
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
    {/* API: GET /api/admin/workflows/templates */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end border-b border-border pb-6">
            <div>
                <h1 className="text-3xl font-serif text-text-main font-bold mb-2">프리셋 워크플로우 관리</h1>
                <p className="text-text-muted">모든 고객사에서 기본적으로 사용할 수 있는 자동화 레시피 및 표준 워크플로우 템플릿을 정의합니다.</p>
            </div>

            <div className="mt-4 lg:mt-0 flex gap-2">
                <button
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl transition-colors font-medium shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    새 템플릿 작성
                </button>
            </div>
        </header>

        {/* KPI Filters */}
        <div className="flex gap-4 mb-8">
            <button className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold shadow-sm">전체 보기
                (42)</button>
            <button
                className="px-4 py-1.5 rounded-full bg-surface border border-border text-text-muted hover:text-text-main hover:bg-background-alt transition-colors text-xs font-bold">마케팅
                (12)</button>
            <button
                className="px-4 py-1.5 rounded-full bg-surface border border-border text-text-muted hover:text-text-main hover:bg-background-alt transition-colors text-xs font-bold">개발/IT
                (15)</button>
            <button
                className="px-4 py-1.5 rounded-full bg-surface border border-border text-text-muted hover:text-text-main hover:bg-background-alt transition-colors text-xs font-bold">인사/채용
                (8)</button>
        </div>

        {/* Workflow Grid */}
        <div className="grid lg:grid-cols-3 gap-6">

            {/* Card 1 */}
            <div className="bg-surface rounded-xl p-5 workflow-card flex flex-col cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <span
                            className="bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded text-[10px] font-bold">마케팅</span>
                    </div>
                    <button className="text-text-muted hover:text-primary transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z">
                            </path>
                        </svg>
                    </button>
                </div>

                <h3 className="font-serif font-bold text-lg text-text-main mb-2">표준 주간 퍼포먼스 리뷰 (마케팅팀)</h3>
                <p className="text-xs text-text-muted mb-6 flex-1 line-clamp-2">애널리틱스 데이터를 수집하여 주간 마케팅 성과 대시보드를 갱신하고, 슬랙으로
                    요약본을 자동 발송합니다.</p>

                <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                        <div
                            className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                            <span className="text-[8px] font-bold text-primary">CPA</span>
                        </div>
                        <div
                            className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                            <span className="text-[8px] font-bold text-secondary">AM</span>
                        </div>
                        <div
                            className="w-6 h-6 rounded-full bg-surface border border-border-focus flex items-center justify-center shadow-sm z-10">
                            <svg className="w-3 h-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M5 12h14M12 5l7 7-7 7"></path>
                            </svg>
                        </div>
                        <div
                            className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                            <span className="text-[8px] font-bold text-accent">DIR</span>
                        </div>
                    </div>
                    <span className="text-[10px] text-text-muted">3 에이전트 연계</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                        </svg>
                        2,451회 설치됨
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs text-green-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Active
                    </span>
                </div>
            </div>

            {/* Card 2 */}
            <div className="bg-surface rounded-xl p-5 workflow-card flex flex-col cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <span
                            className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] font-bold">개발/IT</span>
                    </div>
                    <button className="text-text-muted hover:text-primary transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z">
                            </path>
                        </svg>
                    </button>
                </div>

                <h3 className="font-serif font-bold text-lg text-text-main mb-2">신규 PR 코드리뷰 자동화</h3>
                <p className="text-xs text-text-muted mb-6 flex-1 line-clamp-2">Github 병합 요청 발생 시, 시니어 개발 에이전트가 보안성 검사 및 코드
                    컨벤션을 리뷰하여 코멘트를 남깁니다.</p>

                <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                        <div
                            className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                            <span className="text-[8px] font-bold text-primary">S.DEV</span>
                        </div>
                    </div>
                    <span className="text-[10px] text-text-muted">1 에이전트</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                        </svg>
                        1,802회 설치됨
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        Draft
                    </span>
                </div>
            </div>

            {/* Card 3 */}
            <div
                className="bg-surface rounded-xl p-5 workflow-card flex flex-col border-dashed border-2 bg-transparent justify-center items-center text-center hover:bg-surface transition-colors cursor-pointer group">
                <div
                    className="w-12 h-12 rounded-full bg-background-alt text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                </div>
                <h3 className="font-bold text-text-main text-sm mb-1">새 템플릿 작성</h3>
                <p className="text-[10px] text-text-muted">마켓플레이스에 배포할<br />공식 워크플로우를 구성합니다.</p>
            </div>

        </div>
    </main>
    </>
  );
}

export default AdminWorkflows;
