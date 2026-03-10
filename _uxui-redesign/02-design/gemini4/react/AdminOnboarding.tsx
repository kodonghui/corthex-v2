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

function AdminOnboarding() {
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
            <a href="/admin/onboarding" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                온보딩 플로우(웰컴)
            </a>
            <a href="/admin/template-market" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                    </path>
                </svg>
                부서 템플릿 마켓
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
    {/* API: GET /api/admin/onboarding */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 lg:flex lg:justify-between lg:items-end border-b border-border pb-6">
            <div>
                <h1 className="text-3xl font-serif text-text-main font-bold mb-2">신규 고객 온보딩 플로우 구성</h1>
                <p className="text-text-muted">사용자가 처음 워크스페이스를 생성할 때 마주하는 웰컴 화면, 초기 질문(Setup Survey), 가이드 컨텐츠를 구성합니다.</p>
            </div>

            <div className="mt-4 lg:mt-0 flex gap-2">
                <button
                    className="bg-surface border border-border text-text-main px-6 py-2 rounded-xl transition-colors font-medium shadow-sm flex items-center gap-2 hover:bg-background-alt">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                        </path>
                    </svg>
                    미리보기
                </button>
            </div>
        </header>

        <div className="max-w-4xl">
            {/* Flow Steps (Visual Representation) */}
            <div className="flex items-center justify-between mb-10 relative">
                <div className="absolute h-1 bg-border-focus left-6 right-6 top-1/2 -translate-y-1/2 z-0"></div>

                <div className="relative z-10 flex flex-col items-center gap-2 cursor-pointer group">
                    <div
                        className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-md ring-4 ring-primary/20">
                        1</div>
                    <span className="text-xs font-bold text-text-main">웰컴 스크린</span>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-2 cursor-pointer group">
                    <div
                        className="w-12 h-12 rounded-full bg-surface border-2 border-primary text-primary flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-primary/5 transition-colors">
                        2</div>
                    <span className="text-xs font-bold text-text-muted">도메인 설정</span>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-2 cursor-pointer group">
                    <div
                        className="w-12 h-12 rounded-full bg-surface border-2 border-border-focus text-text-muted flex items-center justify-center font-bold text-lg shadow-sm group-hover:border-primary transition-colors">
                        3</div>
                    <span className="text-xs font-bold text-text-muted">초기 팀 셋업</span>
                </div>
            </div>

            {/* Editor Area */}
            <div className="card p-8 bg-surface">
                <h2 className="text-lg font-serif font-bold text-text-main mb-6 flex items-center gap-2">
                    <span
                        className="w-6 h-6 rounded bg-background-alt text-primary flex items-center justify-center text-xs font-bold border border-border">1</span>
                    웰컴 스크린 메세지 편집
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-text-main mb-2">환영 헤드라인 (Headline)</label>
                        <input type="text" value="Welcome to CORTHEX. 당신의 새로운 AI 팀을 만나보세요."
                            className="w-full bg-background-alt border border-border px-4 py-3 rounded-xl text-lg font-serif focus:outline-none focus:border-primary-light transition-colors text-text-main" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-main mb-2">서브 카피 (Sub-copy)</label>
                        <textarea rows="3"
                            className="w-full bg-background-alt border border-border px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-primary-light transition-colors text-text-main resize-none">복잡한 업무는 에이전트에게 맡기고, 당신은 더 중요한 의사결정에 집중하세요. 몇 가지 설정만 거치면 즉시 업무를 시작할 수 있습니다.</textarea>
                    </div>

                    <div className="p-4 bg-background-alt border border-border rounded-xl">
                        <label className="flex justify-between items-center cursor-pointer group">
                            <div>
                                <span className="block text-xs font-bold text-text-main">소개 비디오 삽입 (유튜브/Vimeo)</span>
                                <span className="block text-[10px] text-text-muted mt-1">웰컴 화면 중앙에 플랫폼 소개 영상을 오토플레이로
                                    띄웁니다.</span>
                            </div>
                            <div
                                className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle1"
                                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-surface border border-border appearance-none cursor-pointer z-10 transition-transform duration-200"
                                    style={{left: "0", transform: "translateX(0%)"}} />
                                <label htmlFor="toggle1"
                                    className="toggle-label block overflow-hidden h-5 rounded-full bg-border-focus border border-border cursor-pointer transition-colors duration-200"></label>
                            </div>
                        </label>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border">
                        <button
                            className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl transition-colors font-medium shadow-sm">저장
                            후 다음 단계로</button>
                    </div>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default AdminOnboarding;
