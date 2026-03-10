"use client";
import React from "react";

const styles = `
body {
            background-color: #fcfbf9;
            color: #2c2c2c;
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        body::-webkit-scrollbar {
            display: none;
        }

        .card {
            background-color: white;
            border-radius: 1.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
            border: 1px solid #f5f3ec;
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
        }

        .card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
        }

        .progress-bar-running {
            background-size: 200% 100%;
            animation: gradient Move 2s linear infinite;
            background-image: linear-gradient(90deg, #81b29a 0%, #a8d5c2 50%, #81b29a 100%);
        }

        @keyframes gradientMove {
            0% {
                background-position: 100% 0;
            }

            100% {
                background-position: -100% 0;
            }
        }
`;

function AppJobs() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Primary Sidebar */}
    <aside
        className="w-64 flex flex-col justify-between py-8 px-4 border-r border-base-200 bg-white/80 backdrop-blur-md z-20 shrink-0">
        <div>
            <div className="flex items-center gap-3 px-4 mb-10">
                <div
                    className="w-8 h-8 rounded-full bg-accent-terracotta flex items-center justify-center text-white font-bold text-lg">
                    C</div>
                <span className="text-xl font-bold tracking-tight text-text-main">CORTHEX</span>
            </div>
            <nav className="space-y-2">
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-squares-four text-xl"></i> 홈
                </a>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-terminal-window text-xl"></i> 사령관실
                </a>

                <div className="pt-4 pb-2 px-4 text-xs font-bold text-base-300 uppercase tracking-wider">시스템 구동</div>
                {/* Active menu */}
                <a href="#"
                    className="sidebar-item active flex items-center justify-between px-4 py-3 font-medium text-accent-terracotta bg-base-100 rounded-2xl transition-colors">
                    <div className="flex items-center gap-3">
                        <i className="ph ph-activity text-xl"></i> 작업 스케줄러
                    </div>
                </a>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-clock-counter-clockwise text-xl"></i> 작전 일지
                </a>
            </nav>
        </div>
        <div>
            <nav className="space-y-2">
                <div className="mt-4 px-4 py-3 flex items-center gap-3 border-t border-base-200">
                    <img src="https://i.pravatar.cc/100?img=11" alt="Profile"
                        className="w-10 h-10 rounded-full border border-base-300" />
                    <div>
                        <p className="text-sm font-semibold text-text-main">김대표</p>
                        <p className="text-xs text-text-muted">CEO</p>
                    </div>
                </div>
            </nav>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto px-10 py-8 relative bg-[#fcfbf9]/50">

        {/* Header (API: GET /api/workspace/jobs) */}
        <header
            className="flex justify-between items-center mb-8 sticky top-0 bg-[#fcfbf9]/80 backdrop-blur-md z-10 pt-2 pb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">백그라운드 작업 및 스케줄러</h1>
                <p className="text-text-muted mt-1 text-sm">에이전트들이 비동기적으로 수행 중인 데이터 수집, 분석 및 예약된 작업 상태입니다.</p>
            </div>

            <div className="flex items-center gap-4">
                {/* API: POST /api/workspace/jobs */}
                <button
                    className="bg-text-main text-white px-5 py-2.5 rounded-full font-bold shadow-soft hover:bg-opacity-90 transition-all flex items-center gap-2">
                    <i className="ph ph-plus-circle text-lg"></i> 새 스케줄 등록
                </button>
            </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-6 mb-10 z-10 relative">
            <div
                className="bg-white border text-text-main border-base-200 rounded-3xl p-6 shadow-soft flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">실행 중</p>
                    <p className="text-3xl font-bold text-text-main">3</p>
                </div>
                <div
                    className="w-12 h-12 rounded-full bg-accent-green/10 text-accent-green flex items-center justify-center text-2xl animate-pulse">
                    <i className="ph ph-spinner-gap"></i>
                </div>
            </div>
            <div
                className="bg-white border text-text-main border-base-200 rounded-3xl p-6 shadow-soft flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">대기 중 (큐)</p>
                    <p className="text-3xl font-bold text-text-main">12</p>
                </div>
                <div
                    className="w-12 h-12 rounded-full bg-text-main/5 text-text-main flex items-center justify-center text-2xl">
                    <i className="ph ph-queue"></i>
                </div>
            </div>
            <div
                className="bg-white border text-text-main border-base-200 rounded-3xl p-6 shadow-soft flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">예약됨</p>
                    <p className="text-3xl font-bold text-text-main">4</p>
                </div>
                <div
                    className="w-12 h-12 rounded-full bg-accent-amber/10 text-accent-amber flex items-center justify-center text-2xl">
                    <i className="ph ph-clock"></i>
                </div>
            </div>
            <div
                className="bg-white border text-text-main border-base-200 rounded-3xl p-6 shadow-soft flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">실패 (최근 24h)</p>
                    <p className="text-3xl font-bold text-text-main">0</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-base-50 text-base-300 flex items-center justify-center text-2xl">
                    <i className="ph ph-warning-circle"></i>
                </div>
            </div>
        </div>

        <div className="flex gap-2 mb-6">
            <button
                className="px-5 py-2 rounded-full text-sm font-bold bg-white border border-base-200 text-text-main shadow-sm">진행
                중</button>
            <button
                className="px-5 py-2 rounded-full text-sm font-medium text-text-muted hover:text-text-main hover:bg-white transition-colors border border-transparent">대기/예약</button>
            <button
                className="px-5 py-2 rounded-full text-sm font-medium text-text-muted hover:text-text-main hover:bg-white transition-colors border border-transparent">완료된
                기록</button>
        </div>

        {/* Job Grid */}
        <div className="grid grid-cols-2 gap-8 pb-20">

            {/* Job Card: Running */}
            <div className="card p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center text-xl">
                            <i className="ph ph-magnifying-glass"></i>
                        </div>
                        <div>
                            <span
                                className="flex items-center gap-1 text-[10px] font-bold text-accent-green uppercase tracking-wider mb-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></span> Running
                            </span>
                            <h3 className="font-bold text-text-main text-base">경쟁사 웹사이트 딥 스크래핑 및 동향 변화 분석</h3>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4 mt-2">
                    <div className="flex gap-4 text-xs font-medium text-text-muted">
                        <span><i className="ph ph-clock"></i> 경과: 12m 45s</span>
                        <span><i className="ph ph-hourglass-high"></i> 남은 예상시간: ~3m</span>
                    </div>
                    <div className="flex -space-x-1">
                        <div
                            className="w-6 h-6 rounded-full bg-[#fdece6] border-2 border-white flex items-center justify-center text-accent-terracotta text-[10px] font-bold z-10">
                            M</div>
                        <div
                            className="w-6 h-6 rounded-full bg-[#fef5ec] border-2 border-white flex items-center justify-center text-accent-amber text-[10px] font-bold">
                            S</div>
                    </div>
                </div>

                <div className="w-full bg-base-100 rounded-full h-3 mb-2 overflow-hidden">
                    <div className="progress-bar-running h-full rounded-full" style={{width: "78%"}}></div>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-text-muted mb-6">
                    <span>처리된 페이지: 1,402 / 1,800</span>
                    <span className="text-accent-green">78%</span>
                </div>

                <div className="flex gap-2 mt-auto">
                    <button
                        className="flex-1 py-2 rounded-xl bg-white border border-base-200 text-text-main text-sm font-bold shadow-sm hover:bg-base-50 transition-colors">일시
                        정지</button>
                    {/* API: DELETE /api/workspace/jobs/:id */}
                    <button
                        className="flex-1 py-2 rounded-xl bg-[#fef5ec] text-accent-amber border border-transparent hover:border-accent-amber/30 text-sm font-bold shadow-sm transition-colors">작업
                        취소</button>
                </div>
            </div>

            {/* Job Card: Running (Data Sync) */}
            <div className="card p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl bg-accent-terracotta/10 text-accent-terracotta flex items-center justify-center text-xl">
                            <i className="ph ph-arrows-left-right"></i>
                        </div>
                        <div>
                            <span
                                className="flex items-center gap-1 text-[10px] font-bold text-accent-green uppercase tracking-wider mb-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></span> Running
                            </span>
                            <h3 className="font-bold text-text-main text-base">KIS 투자증권 계좌 내역 및 잔고 실시간 동기화</h3>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4 mt-2">
                    <div className="flex gap-4 text-xs font-medium text-text-muted">
                        <span><i className="ph ph-clock"></i> 연속 실행 모드</span>
                        <span><i className="ph ph-arrows-clockwise"></i> 1분 주기 갱신</span>
                    </div>
                    <div className="flex -space-x-1">
                        <div
                            className="w-6 h-6 rounded-full bg-[#fdece6] border-2 border-white flex items-center justify-center text-text-main text-[10px] font-bold z-10">
                            <i className="ph ph-robot"></i></div>
                    </div>
                </div>

                <div className="w-full bg-base-100 rounded-full h-3 mb-2 overflow-hidden relative">
                    <div className="absolute inset-0 bg-base-100"></div>
                    {/* Indeterminate loader style */}
                    <div className="absolute h-full bg-accent-terracotta/40 rounded-full w-1/3 progress-bar-running"
                        style={{animation: "slide 1.5s ease-in-out infinite"}}></div>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-text-muted mb-6">
                    <style>
                        @keyframes slide {
                            0% {
                                transform: translateX(-100%);
                            }

                            100% {
                                transform: translateX(300%);
                            }
                        }
                    </style>
                    <span>최근 동기화: 4초 전</span>
                    <span className="text-accent-terracotta">대용량 스트리밍 중</span>
                </div>

                <div className="flex gap-2 mt-auto">
                    <button
                        className="flex-1 py-2 rounded-xl bg-white border border-base-200 text-text-main text-sm font-bold shadow-sm hover:bg-base-50 transition-colors">로그
                        보기</button>
                    <button
                        className="flex-1 py-2 rounded-xl bg-white border border-base-200 text-text-muted hover:text-accent-coral hover:bg-[#fdece6]/20 transition-colors text-sm font-bold shadow-sm">연결
                        종료</button>
                </div>
            </div>

            {/* Job Card: Scheduled */}
            <div className="card p-6 flex flex-col bg-white/60">
                <div
                    className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-base-100 to-transparent rounded-bl-[100px] z-0">
                </div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl bg-base-100 text-text-muted flex items-center justify-center text-xl">
                            <i className="ph ph-file-text"></i>
                        </div>
                        <div>
                            <span
                                className="flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                                <i className="ph ph-clock"></i> Scheduled
                            </span>
                            <h3 className="font-bold text-text-main text-base line-clamp-1">전사 일일 작전 요약 보고서 (C-Level 브리핑) 생성
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4 mt-2 relative z-10">
                    <div className="flex gap-4 text-xs font-bold text-accent-amber">
                        <span>예약 시간: 매일 오후 6:00 (KST)</span>
                    </div>
                    <div className="flex -space-x-1">
                        <div
                            className="w-6 h-6 rounded-full bg-[#fdece6] border-2 border-white flex items-center justify-center text-accent-terracotta text-[10px] font-bold z-10">
                            M</div>
                    </div>
                </div>

                <div
                    className="bg-base-50 p-3 rounded-xl border border-base-100 text-xs text-text-muted leading-relaxed mb-6 font-medium relative z-10">
                    "오늘 수행된 모든 에이전트의 작전 일지와 재무 성과, 마케팅 결과물을 취합해 1페이지 분량의 마크다운 보고서로 작성할 것."
                </div>

                <div className="flex gap-2 mt-auto relative z-10">
                    <button
                        className="flex-1 py-2 rounded-xl bg-white border border-base-200 text-text-main text-sm font-bold shadow-sm hover:bg-base-50 transition-colors">스케줄
                        편집</button>
                    <button
                        className="w-12 flex-none py-2 rounded-xl bg-white border border-base-200 text-text-muted hover:text-accent-coral transition-colors flex items-center justify-center font-bold shadow-sm"><i
                            className="ph ph-trash"></i></button>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default AppJobs;
