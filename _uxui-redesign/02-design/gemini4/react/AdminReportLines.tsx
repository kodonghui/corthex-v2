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

function AdminReportLines() {
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
            <a href="/admin/org-chart" className="nav-item">
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
            <a href="/admin/report-lines" className="nav-item active">
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
    {/* API: GET /api/admin/org/report-lines */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end border-b border-border pb-6">
            <div>
                <h1 className="text-3xl font-serif text-text-main font-bold mb-2">결재선 및 보고 체계 규칙</h1>
                <p className="text-text-muted">에이전트가 단독으로 처리할 수 있는 권한 범위와, 인간 매니저(Human-in-the-loop)의 최종 승인이 필요한 작업 규칙을
                    정의합니다.</p>
            </div>

            <div className="mt-4 lg:mt-0">
                <button
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    새 승인 규칙 생성
                </button>
            </div>
        </header>

        <div className="space-y-6">

            {/* Rule 1 */}
            <div className="card p-0 overflow-hidden flex flex-col lg:flex-row">
                <div
                    className="bg-background-alt p-6 border-b lg:border-b-0 lg:border-r border-border min-w-[250px] flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                            </path>
                        </svg>
                        <h3 className="font-bold text-base text-text-main">재무 지출 결의</h3>
                    </div>
                    <p className="text-xs text-text-muted mb-4">재무/회계 부서 에이전트가 예산을 집행하거나 비용을 승인할 때 적용되는 규칙입니다.</p>
                    <span
                        className="inline-flex items-center gap-1.5 bg-surface border border-border px-2 py-1 rounded text-[10px] text-text-main w-max">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 활성 상태
                    </span>
                </div>

                <div className="p-6 flex-1 bg-surface">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div
                                className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center text-text-muted font-bold text-xs shrink-0 mt-1">
                                If</div>
                            <div className="flex-1 bg-background-alt border border-border rounded-lg p-3 text-sm">
                                <span
                                    className="bg-surface px-2 py-0.5 rounded border border-border font-mono text-xs mr-2">조건
                                    1</span>
                                지출 금액이 <strong className="text-secondary">$1,000 USD</strong> 이상일 경우
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div
                                className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0 mt-1">
                                Then</div>
                            <div className="flex-1 border border-border rounded-lg p-3 text-sm shadow-sm">
                                <span className="text-text-muted text-xs block mb-2">다음 순서로 결재/보고 진행:</span>
                                <ol className="relative border-l border-border-focus ml-3 space-y-4">
                                    <li className="pl-6 relative">
                                        <div
                                            className="absolute w-3 h-3 bg-surface border-2 border-primary rounded-full -left-[6.5px] top-1.5">
                                        </div>
                                        <div className="font-bold text-text-main text-sm">인간 재무 책임자 (Human CFO) 승인 <span
                                                className="text-red-500">*필수</span></div>
                                        <p className="text-xs text-text-muted mt-1">슬랙(Slack) 승인 알림 발송 및 즉각 대기</p>
                                    </li>
                                    <li className="pl-6 relative">
                                        <div
                                            className="absolute w-3 h-3 bg-surface border-2 border-border-focus rounded-full -left-[6.5px] top-1.5">
                                        </div>
                                        <div className="font-bold text-text-main text-sm">CEO 에이전트 (Nexus) 사후 참조</div>
                                        <p className="text-xs text-text-muted mt-1">지출 내역 요약 보고 (일간 회의)</p>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rule 2 */}
            <div className="card p-0 overflow-hidden flex flex-col lg:flex-row">
                <div
                    className="bg-background-alt p-6 border-b lg:border-b-0 lg:border-r border-border min-w-[250px] flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z">
                            </path>
                        </svg>
                        <h3 className="font-bold text-base text-text-main">소셜 미디어 퍼블리싱 (블라인드)</h3>
                    </div>
                    <p className="text-xs text-text-muted mb-4">마케팅 에이전트가 외부 채널(트위터/링크드인)에 콘텐츠를 자동 포스팅할 때 적용됩니다.</p>
                    <span
                        className="inline-flex items-center gap-1.5 bg-surface border border-border px-2 py-1 rounded text-[10px] text-text-main w-max">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 활성 상태
                    </span>
                </div>

                <div className="p-6 flex-1 bg-surface opacity-70">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div
                                className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center text-text-muted font-bold text-xs shrink-0 mt-1">
                                If</div>
                            <div className="flex-1 bg-background-alt border border-border rounded-lg p-3 text-sm">
                                <span
                                    className="bg-surface px-2 py-0.5 rounded border border-border font-mono text-xs mr-2">조건
                                    1</span>
                                게시판 분류가 <strong className="text-primary">'일반 홍보 (General PR)'</strong> 인 경우
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div
                                className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0 mt-1">
                                Then</div>
                            <div className="flex-1 border border-border rounded-lg p-3 text-sm flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <div>
                                    <div className="font-bold text-text-main text-sm">인간 승인 없이 자동 퍼블리싱 허용 (Auto-publish)
                                    </div>
                                    <p className="text-xs text-text-muted mt-1">마케팅 리드 에이전트 단계에서 자체 리뷰 후 즉시 배포</p>
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

export default AdminReportLines;
