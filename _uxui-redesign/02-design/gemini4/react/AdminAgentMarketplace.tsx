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

function AdminAgentMarketplace() {
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
            <a href="/admin/template-market" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                    </path>
                </svg>
                부서 템플릿 마켓
            </a>
            <a href="/admin/agent-marketplace" className="nav-item active">
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
    {/* API: GET /api/admin/market/agents */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end">
            <div>
                <h1 className="text-3xl font-serif text-text-main font-bold mb-2">개별 에이전트 채용(마켓) 관리</h1>
                <p className="text-text-muted">특정 직무에 특화된 싱글 에이전트들의 마켓 플레이스 상품 정보를 관리합니다.</p>
            </div>

            <div className="mt-4 lg:mt-0">
                <button
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    신규 에이전트(직무) 등록
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
                <input type="text" placeholder="직무명, 역할, 핵심 도구로 검색..."
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary-light transition-colors shadow-sm text-text-main" />
            </div>

            <div className="flex gap-2">
                <select
                    className="bg-surface border border-border text-text-main px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-light shadow-sm min-w-[130px]">
                    <option value="">직무 카테고리</option>
                    <option value="dev">엔지니어링(Dev)</option>
                    <option value="design">디자인(Design)</option>
                    <option value="sales">영업(Sales)</option>
                </select>
                <select
                    className="bg-surface border border-border text-text-main px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-light shadow-sm min-w-[130px]">
                    <option value="">과금 형태</option>
                    <option value="free">무료 (Basic)</option>
                    <option value="paid">유료 (Premium)</option>
                </select>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

            {/* Agent Listing 1 */}
            <div className="card p-5 group hover:border-text-light transition-colors relative flex flex-col">
                <div
                    className="absolute top-4 right-4 bg-surface border border-border px-2 py-0.5 rounded text-[10px] font-bold text-text-main shadow-sm flex items-center gap-1">
                    <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                        </path>
                    </svg>
                    4.9
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Legal1&backgroundColor=f5f0eb"
                        alt="Avatar" className="w-14 h-14 rounded-xl border border-border bg-background shadow-sm" />
                    <div>
                        <h3 className="font-bold text-text-main text-base group-hover:text-primary transition-colors">계약 전문
                            변호사</h3>
                        <p className="text-[10px] text-text-muted mt-0.5">Legal / Compliance</p>
                    </div>
                </div>

                <p className="text-xs text-text-muted leading-relaxed line-clamp-3 mb-4">영문 NDA, 라이선스 계약, 근로 계약서 등 각종 법률 문서의
                    조항을 검토하고 불리한 독소 조항을 찾아냅니다. 한국/미국 기본 법률 지식이 탑재되어 있습니다.</p>

                <div className="mb-4">
                    <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-2">프리탑재 Tools</p>
                    <div className="flex flex-wrap gap-1">
                        <span
                            className="bg-background-alt text-text-muted border border-border px-1.5 py-0.5 rounded text-[10px]">Doc
                            Parser</span>
                        <span
                            className="bg-background-alt text-text-muted border border-border px-1.5 py-0.5 rounded text-[10px]">Legal
                            DB Search</span>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                    <div className="font-mono font-bold text-text-main text-sm">$49<span
                            className="text-[10px] text-text-muted font-sans font-normal">/mo</span></div>
                    <button
                        className="text-text-muted hover:text-primary text-xs font-medium border border-border bg-surface px-3 py-1.5 rounded-lg hover:bg-background-alt transition-colors">상품
                        수정</button>
                </div>
            </div>

            {/* Agent Listing 2 */}
            <div className="card p-5 group hover:border-text-light transition-colors relative flex flex-col">
                <div
                    className="absolute top-4 right-4 bg-surface border border-border px-2 py-0.5 rounded text-[10px] font-bold text-text-main shadow-sm flex items-center gap-1">
                    <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                        </path>
                    </svg>
                    4.8
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=UX1&backgroundColor=f5f0eb" alt="Avatar"
                        className="w-14 h-14 rounded-xl border border-border bg-background shadow-sm" />
                    <div>
                        <h3 className="font-bold text-text-main text-base group-hover:text-primary transition-colors">시니어 UX
                            리서처</h3>
                        <p className="text-[10px] text-text-muted mt-0.5">Design / Research</p>
                    </div>
                </div>

                <p className="text-xs text-text-muted leading-relaxed line-clamp-3 mb-4">사용자 인터뷰 스크립트를 작성하고, 서베이 결과를 정량/정성
                    분석하여 인사이트 리포트를 도출합니다. Jakob Nielsen의 10가지 휴리스틱 기반 UI 평가가 가능합니다.</p>

                <div className="mb-4">
                    <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-2">프리탑재 Tools</p>
                    <div className="flex flex-wrap gap-1">
                        <span
                            className="bg-background-alt text-text-muted border border-border px-1.5 py-0.5 rounded text-[10px]">Survey
                            Form Maker</span>
                        <span
                            className="bg-background-alt text-text-muted border border-border px-1.5 py-0.5 rounded text-[10px]">Sentiment
                            Analysis</span>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                    <div
                        className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold text-[10px]">
                        Free Tier</div>
                    <button
                        className="text-text-muted hover:text-primary text-xs font-medium border border-border bg-surface px-3 py-1.5 rounded-lg hover:bg-background-alt transition-colors">상품
                        수정</button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default AdminAgentMarketplace;
