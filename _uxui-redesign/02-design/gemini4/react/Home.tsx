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
            padding: 1.5rem;
            border: 1px solid inherit /* FIXME: theme value not in map */;
            transition: box-shadow 0.3s ease;
        }

        .card:hover {
            box-shadow: inherit /* FIXME: theme value not in map */;
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

function Home() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar */}
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-full z-10 shadow-soft">
        <div className="p-6">
            <h2 className="font-serif text-2xl tracking-tight text-primary font-bold">CORTHEX</h2>
            <p className="text-xs text-text-light mt-1">회사명: 알파 랩스</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            <a href="/app/home" className="nav-item active">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                    </path>
                </svg>
                홈 대시보드
            </a>
            <a href="/app/command-center" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z">
                    </path>
                </svg>
                사령관실
            </a>
            <a href="/app/agents" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                    </path>
                </svg>
                부서 및 직원
            </a>
            <a href="/app/reports" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                    </path>
                </svg>
                보고서
            </a>
            <a href="/app/costs" className="nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                    </path>
                </svg>
                비용 관리
            </a>
            <a href="/app/settings" className="nav-item mt-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                    </path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                설정
            </a>
        </nav>

        <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
                <div
                    className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold">
                    김</div>
                <div>
                    <p className="font-medium text-text-main">김대표 (CEO)</p>
                </div>
            </div>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <header className="mb-10 flex justify-between items-end">
            <div>
                <h1 className="text-4xl font-serif text-text-main mb-2">작전현황 대시보드</h1>
                {/* API: GET /api/workspace/dashboard/summary */}
                {/* API: GET /api/workspace/dashboard/stats */}
                <p className="text-text-muted text-lg">김대표님, 현재 12명의 에이전트가 정상 근무 중입니다.</p>
            </div>
            <button
                className="bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors font-medium shadow-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                새 명령 내리기
            </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Summary Cards */}
            <div className="card flex flex-col justify-center relative overflow-hidden group">
                <div
                    className="absolute top-0 right-0 w-24 h-24 bg-primary-light rounded-bl-full opacity-50 transition-transform group-hover:scale-110">
                </div>
                <p className="text-text-muted mb-1 font-medium z-10">금주 처리한 명령</p>
                <div className="flex items-baseline gap-2 z-10">
                    <h2 className="text-4xl font-serif text-text-main">128<span
                            className="text-lg font-sans text-text-light ml-1">건</span></h2>
                    <span className="text-success text-sm font-medium text-primary flex items-center">
                        <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                        </svg>
                        12%
                    </span>
                </div>
            </div>

            {/* API: GET /api/workspace/dashboard/summary */}
            <div className="card flex flex-col justify-center relative overflow-hidden group">
                <div
                    className="absolute top-0 right-0 w-24 h-24 bg-secondary-light rounded-bl-full opacity-50 transition-transform group-hover:scale-110">
                </div>
                <p className="text-text-muted mb-1 font-medium z-10">이번 달 사용 금액</p>
                <div className="flex items-baseline gap-2 z-10">
                    <h2 className="text-4xl font-serif text-text-main">₩124k</h2>
                </div>
                {/* API: GET /api/workspace/dashboard/budget */}
                <div className="w-full bg-background mt-3 rounded-full h-1.5 z-10">
                    <div className="bg-secondary h-1.5 rounded-full" style={{width: "45%"}}></div>
                </div>
                <p className="text-xs text-text-light mt-1 z-10">예산 ₩300k 중 41% 사용</p>
            </div>

            {/* API: GET /api/workspace/dashboard/satisfaction */}
            <div className="card flex flex-col justify-center relative overflow-hidden group">
                <div
                    className="absolute top-0 right-0 w-24 h-24 bg-accent-light rounded-bl-full opacity-50 transition-transform group-hover:scale-110">
                </div>
                <p className="text-text-muted mb-1 font-medium z-10">보고서 만족도</p>
                <div className="flex items-baseline gap-2 z-10">
                    <h2 className="text-4xl font-serif text-text-main">4.8<span
                            className="text-lg font-sans text-text-light ml-1">/5.0</span></h2>
                </div>
                <div className="flex text-accent mt-2 z-10">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                        </path>
                    </svg>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                        </path>
                    </svg>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                        </path>
                    </svg>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                        </path>
                    </svg>
                    <svg className="w-4 h-4 fill-current text-border-focus" viewBox="0 0 20 20">
                        <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                        </path>
                    </svg>
                </div>
            </div>

            <div className="card flex flex-col justify-center relative overflow-hidden group">
                <div
                    className="absolute top-0 right-0 w-24 h-24 bg-border rounded-bl-full opacity-50 transition-transform group-hover:scale-110">
                </div>
                <p className="text-text-muted mb-1 font-medium z-10">생성된 보고서</p>
                <div className="flex items-baseline gap-2 z-10">
                    <h2 className="text-4xl font-serif text-text-main">42<span
                            className="text-lg font-sans text-text-light ml-1">건</span></h2>
                </div>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Activity & Agents */}
            <div className="lg:col-span-2 space-y-8">

                {/* API: GET /api/workspace/dashboard/quick-actions */}
                <div className="card p-0 overflow-hidden">
                    <div className="p-5 border-b border-border bg-surface-alt flex justify-between items-center">
                        <h3 className="text-lg font-serif">빠른 명령</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-border">
                        <button
                            className="bg-surface p-6 text-center hover:bg-background transition-colors flex flex-col items-center justify-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                                    </path>
                                </svg>
                            </div>
                            <span className="font-medium">시장 분석 요약</span>
                        </button>
                        <button
                            className="bg-surface p-6 text-center hover:bg-background transition-colors flex flex-col items-center justify-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full bg-secondary-light text-secondary flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                                    </path>
                                </svg>
                            </div>
                            <span className="font-medium">주간 SNS 발행</span>
                        </button>
                        <button
                            className="bg-surface p-6 text-center hover:bg-background transition-colors flex flex-col items-center justify-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full bg-accent-light text-accent flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                    </path>
                                </svg>
                            </div>
                            <span className="font-medium">회의록 정리</span>
                        </button>
                        <button
                            className="bg-surface p-6 text-center hover:bg-background transition-colors flex flex-col items-center justify-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full bg-gray-100 text-text-muted flex items-center justify-center border border-dashed border-gray-300">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M12 4v16m8-8H4"></path>
                                </svg>
                            </div>
                            <span className="font-medium text-text-muted">프리셋 추가</span>
                        </button>
                    </div>
                </div>

                {/* API: GET /api/workspace/dashboard/usage */}
                <div className="card h-80 flex flex-col">
                    <h3 className="text-lg font-serif mb-6">주간 토큰 사용량</h3>
                    <div
                        className="flex-1 border border-border rounded-xl flex items-center justify-center bg-background-alt text-text-muted">
                        {/* Chart placeholder */}
                        [ Bar Chart Area ]
                    </div>
                </div>
            </div>

            {/* Right Column: Agents Status */}
            <div className="space-y-8">
                {/* API: GET /api/workspace/dashboard/agents */}
                <div className="card p-0 overflow-hidden h-[calc(100vh-280px)] flex flex-col">
                    <div
                        className="p-5 border-b border-border bg-surface-alt flex justify-between items-center sticky top-0">
                        <h3 className="text-lg font-serif">에이전트 근무 현황</h3>
                        <span className="px-2.5 py-1 bg-primary-light text-primary text-xs rounded-full font-bold">12
                            Active</span>
                    </div>
                    <div className="divide-y divide-border overflow-y-auto p-2">
                        {/* Agent Item */}
                        <div
                            className="p-3 hover:bg-background rounded-xl transition-colors flex items-center gap-3 cursor-pointer">
                            <div
                                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                                비</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-text-main truncate text-base">비서실장</p>
                                <p className="text-xs text-text-light truncate">Manager · 분류 대기중</p>
                            </div>
                            <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-sm shrink-0">
                            </div>
                        </div>

                        {/* Agent Item */}
                        <div
                            className="p-3 hover:bg-background rounded-xl transition-colors flex items-center gap-3 cursor-pointer">
                            <div
                                className="w-10 h-10 rounded-full bg-secondary-light text-secondary flex items-center justify-center border border-secondary/20">
                                분</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-text-main truncate text-base">시황 분석가</p>
                                <p className="text-xs text-primary truncate">작업중 (명령 #142 처리)</p>
                            </div>
                            <div
                                className="w-2.5 h-2.5 rounded-full bg-accent border-2 border-white shadow-sm shrink-0 animate-pulse">
                            </div>
                        </div>

                        {/* Agent Item */}
                        <div
                            className="p-3 hover:bg-background rounded-xl transition-colors flex items-center gap-3 cursor-pointer">
                            <div
                                className="w-10 h-10 rounded-full bg-surface border border-border text-text-muted flex items-center justify-center">
                                S</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-text-main truncate text-base">SEO 전문가</p>
                                <p className="text-xs text-text-light truncate">Specialist · 대기중</p>
                            </div>
                            <div className="w-2.5 h-2.5 rounded-full bg-border border-2 border-white shadow-sm shrink-0">
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

export default Home;
