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

function AdminTemplateMarket() {
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
            <a href="/admin/template-market" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                    </path>
                </svg>
                부서 템플릿 마켓
            </a>
            <a href="/admin/agent-marketplace" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                에이전트 채용(마켓)
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
    {/* API: GET /api/admin/market/templates */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end">
            <div>
                <h1 className="text-3xl font-serif text-text-main font-bold mb-2">부서 템플릿 마켓 관리</h1>
                <p className="text-text-muted">고객사가 자신의 워크스페이스에 즉시 배포할 수 있는 사전 구성된 부서 템플릿(Department Templates) 패키지를 관리합니다.
                </p>
            </div>

            <div className="mt-4 lg:mt-0 flex gap-2">
                <button
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    새 패키지 등록
                </button>
            </div>
        </header>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
                className="bg-surface text-text-main border border-border px-4 py-2 rounded-xl text-sm font-bold shadow-sm whitespace-nowrap hover:bg-background-alt active">전체
                패키지</button>
            <button
                className="bg-transparent text-text-muted border border-transparent px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap hover:bg-surface hover:border-border transition-colors">IT/Tech
                (스타트업)</button>
            <button
                className="bg-transparent text-text-muted border border-transparent px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap hover:bg-surface hover:border-border transition-colors">이커머스/리테일</button>
            <button
                className="bg-transparent text-text-muted border border-transparent px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap hover:bg-surface hover:border-border transition-colors">전문
                서비스 (법무/회계)</button>
            <button
                className="bg-transparent text-text-muted border border-transparent px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap hover:bg-surface hover:border-border transition-colors">콘텐츠/미디어</button>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">

            {/* Market Template 1 */}
            <div
                className="card p-0 flex flex-col group overflow-hidden border border-border hover:border-primary transition-colors">
                <div
                    className="relative h-40 bg-gradient-to-br from-primary/20 to-surface border-b border-border flex items-center justify-center p-6 text-center">
                    <div
                        className="absolute top-3 right-3 bg-surface border border-border px-2 py-0.5 rounded text-[10px] font-bold text-text-muted flex items-center gap-1 shadow-sm">
                        <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                            </path>
                        </svg>
                        Editor's Pick
                    </div>
                    <div>
                        <h3 className="font-serif text-2xl font-bold text-text-main mb-1">Lean Startup Dev</h3>
                        <p className="text-xs text-text-muted">빠른 실행을 위한 초기 스타트업 표준 조직</p>
                    </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    <p className="text-xs text-text-muted leading-relaxed mb-4 flex-1">프런트엔드, 백엔드, PM 에이전트로 구성된 컴팩트한 제품 개발
                        스쿼드입니다. GitHub 연동 및 애자일 스크럼 프로세스가 내장되어 즉시 실무에 투입 가능합니다.</p>

                    <div className="space-y-3 mb-6">
                        <h4 className="text-[10px] uppercase font-bold text-text-light tracking-wider">포함된 부서 및 직무</h4>
                        <div className="flex items-center gap-2 text-xs text-text-main">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            제품 개발팀 <span className="text-text-muted ml-auto">(개발자 2, PM 1)</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-main">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                            QA/테스트팀 <span className="text-text-muted ml-auto">(QA 1)</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                        <div className="text-lg font-bold font-mono text-text-main">Free</div>
                        <button
                            className="bg-surface border border-border hover:bg-background-alt text-text-main px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-sm">마켓
                            상세 정보</button>
                    </div>
                </div>
            </div>

            {/* Market Template 2 */}
            <div
                className="card p-0 flex flex-col group overflow-hidden border border-border hover:border-primary transition-colors">
                <div
                    className="relative h-40 bg-gradient-to-br from-accent/20 to-surface border-b border-border flex items-center justify-center p-6 text-center">
                    <div>
                        <h3 className="font-serif text-2xl font-bold text-text-main mb-1">Growth Marketing Pro</h3>
                        <p className="text-xs text-text-muted">데이터 기반 퍼포먼스 마케팅 최적화 팀</p>
                    </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    <p className="text-xs text-text-muted leading-relaxed mb-4 flex-1">광고 매체 데이터(Meta, Google)를 자동으로 수집/분석하고
                        A/B 테스트 소재를 무한 생성하는 퍼포먼스 마케터 및 카피라이터 에이전트 그룹입니다.</p>

                    <div className="space-y-3 mb-6">
                        <h4 className="text-[10px] uppercase font-bold text-text-light tracking-wider">포함된 부서 및 직무</h4>
                        <div className="flex items-center gap-2 text-xs text-text-main">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                            퍼포먼스 마케팅셀 <span className="text-text-muted ml-auto">(마케터 1, 분석가 1)</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-main">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E58A8A]"></span>
                            콘텐츠 크리에이티브셀 <span className="text-text-muted ml-auto">(카피라이터 2)</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                        <div className="text-lg font-bold font-mono text-text-main">$199<span
                                className="text-[10px] text-text-muted font-sans ml-1">/ workspace</span></div>
                        <button
                            className="bg-surface border border-border hover:bg-background-alt text-text-main px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-sm">마켓
                            상세 정보</button>
                    </div>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default AdminTemplateMarket;
