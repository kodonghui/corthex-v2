"use client";
import React from "react";

const styles = `
@layer base {
            body { @apply bg-background text-text-main font-sans antialiased; }
            h1, h2, h3, h4 { @apply font-serif text-text-main; }
        }
        @layer components {
            .card { @apply bg-surface rounded-2xl shadow-soft border border-border p-6; }
            .btn { @apply inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors; }
            .btn-primary { @apply bg-primary-600 text-white hover:bg-primary-700 shadow-sm; }
            .btn-secondary { @apply bg-surface-alt text-text-main border border-border hover:bg-white; }
            .nav-item { @apply flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-text-main hover:bg-surface-alt transition-colors; }
            .nav-item.active { @apply bg-surface-alt font-semibold text-primary-700; }
        }
`;

function AppHome() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<aside className="w-64 fixed inset-y-0 left-0 bg-surface border-r border-border flex flex-col z-10">
        <div className="h-16 flex items-center px-6 border-b border-border mr-4">
            <div
                className="w-6 h-6 rounded bg-primary-600 mr-2 flex items-center justify-center text-white text-xs font-bold">
                C</div>
            <span className="font-serif font-bold text-lg tracking-wide">CORTHEX</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
            <div className="text-xs font-semibold tracking-wider text-text-light mb-2 px-3 mt-2 uppercase">Workspace</div>
            <a href="/app/home" className="nav-item active"><svg className="w-4 h-4 text-primary-600" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                    </path>
                </svg>홈</a>
            <a href="/app/command-center" className="nav-item"><svg className="w-4 h-4 text-text-muted" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>사령관실</a>
            <a href="/app/chat" className="nav-item"><svg className="w-4 h-4 text-text-muted" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
                    </path>
                </svg>에이전트 챗</a>
            <a href="/app/dashboard" className="nav-item"><svg className="w-4 h-4 text-text-muted" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                </svg>작전현황</a>
            <a href="/app/trading" className="nav-item"><svg className="w-4 h-4 text-text-muted" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>전략실</a>
            <a href="/app/agora" className="nav-item"><svg className="w-4 h-4 text-text-muted" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z">
                    </path>
                </svg>아고라</a>
        </div>
        <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User"
                    className="w-9 h-9 rounded-full object-cover" />
                <div>
                    <p className="text-sm font-medium">김대표</p>
                    <p className="text-xs text-text-muted">CEO</p>
                </div>
            </div>
        </div>
    </aside>

    <main className="ml-64 flex-1 p-8 md:p-12 relative overflow-y-auto">
        <header className="mb-10">
            <h1 className="text-3xl font-bold font-serif mb-2">안녕하세요, 김대표님.</h1>
            <p className="text-text-muted">코어텍스 AI 조직이 가동 중입니다. 오늘 어떤 작업을 지시하시겠습니까?</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div
                className="card bg-white hover:-translate-y-1 transition-transform cursor-pointer group border-primary-100 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                </div>
                <div className="relative z-10">
                    <div
                        className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                    </div>
                    <h3 className="font-serif font-semibold text-lg mb-1 group-hover:text-primary-700">새 명령 내리기</h3>
                    <p className="text-sm text-text-muted">사령관실로 이동하여 AI 비서실장에게 실시간 작업을 위임합니다.</p>
                </div>
            </div>

            <div
                className="card bg-white hover:-translate-y-1 transition-transform cursor-pointer group border-secondary-100 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-secondary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                </div>
                <div className="relative z-10">
                    <div
                        className="w-12 h-12 rounded-2xl bg-secondary-100 flex items-center justify-center text-secondary-600 mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                            </path>
                        </svg>
                    </div>
                    <h3 className="font-serif font-semibold text-lg mb-1 group-hover:text-secondary-700">보고서 확인</h3>
                    <p className="text-sm text-text-muted">각 부서의 에이전트가 완성하여 제출한 결과물 3건이 대기 중입니다.</p>
                </div>
            </div>

            <div
                className="card bg-white hover:-translate-y-1 transition-transform cursor-pointer group border-accent-100 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-accent-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                </div>
                <div className="relative z-10">
                    <div
                        className="w-12 h-12 rounded-2xl bg-accent-100 flex items-center justify-center text-accent-600 mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                            </path>
                        </svg>
                    </div>
                    <h3 className="font-serif font-semibold text-lg mb-1 group-hover:text-accent-700">작전현황 요약</h3>
                    <p className="text-sm text-text-muted">부서별 활동량 및 비용 추적 시스템으로 이동합니다.</p>
                </div>
            </div>
        </section>

        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-semibold">진행 중인 작전</h2>
                <button className="btn btn-ghost text-sm text-primary-600">모두 보기</button>
            </div>
            <div className="card flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-alt transition-colors">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                </path>
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium">경쟁사 B 신규 백서 분석 및 주요 마케팅 소구점 추출</p>
                            <p className="text-sm text-text-light mt-0.5">비서실장 ➔ 브랜드 마케팅 부서 위임 완료 <span
                                    className="mx-2">•</span> 10분 전</p>
                        </div>
                    </div>
                    <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-50 text-secondary-700 border border-secondary-200">
                        작업 중
                    </span>
                </div>
                <hr className="border-border" />
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-alt transition-colors">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4">
                                </path>
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium">미국 주식 포트폴리오(Tech 비중 40%) 리스크 시뮬레이션</p>
                            <p className="text-sm text-text-light mt-0.5">전략실 ➔ 리스크관리자 진행 중 <span className="mx-2">•</span> 45분
                                전</p>
                        </div>
                    </div>
                    <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                        완료 대기
                    </span>
                </div>
            </div>
        </section>
    </main>
    </>
  );
}

export default AppHome;
