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
        }

        .btn-preset {
            transition: all 0.2s ease;
            border: 1px solid #f5f3ec;
            background: white;
        }

        .btn-preset:hover {
            background-color: #f5f3ec;
            border-color: #e8e4d9;
            color: #e07a5f;
        }

        .node-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {

            0%,
            100% {
                opacity: 1;
                transform: scale(1);
            }

            50% {
                opacity: .7;
                transform: scale(1.05);
            }
        }
`;

function AppCommandCenter() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar */}
    <aside
        className="w-64 flex flex-col justify-between py-8 px-4 border-r border-base-200 bg-base-50/50 backdrop-blur-md z-10 shrink-0">
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
                    className="sidebar-item active flex items-center gap-3 px-4 py-3 font-medium text-accent-terracotta bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-terminal-window text-xl"></i> 사령관실
                </a>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-chats text-xl"></i> 채팅
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
    <main className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header
            className="flex justify-between items-center px-10 pt-8 pb-4 shrink-0 bg-[#fcfbf9]/80 backdrop-blur-md z-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">사령관실</h1>
                <p className="text-text-muted mt-1 text-sm">AI 에이전트 조직에게 명령을 내리고 진행 현황을 실시간으로 확인합니다.</p>
            </div>

            {/* Quick Presets Carousel */}
            <div className="flex items-center gap-3">
                <button
                    className="btn-preset px-4 py-2 rounded-full text-sm font-medium text-text-muted flex items-center gap-2">
                    <i className="ph ph-chart-bar"></i> 시황 분석
                </button>
                <button
                    className="btn-preset px-4 py-2 rounded-full text-sm font-medium text-text-muted flex items-center gap-2">
                    <i className="ph ph-briefcase"></i> 경쟁사 조사
                </button>
                <button
                    className="btn-preset px-4 py-2 rounded-full text-sm font-medium text-text-muted flex items-center gap-2">
                    <i className="ph ph-pen-nib"></i> 주간 보고서
                </button>
            </div>
        </header>

        {/* Command History & Active Delegation */}
        {/* APIs: GET /api/workspace/commands, GET /api/workspace/commands/:id/delegation */}
        <div className="flex-1 overflow-y-auto px-10 pb-8 space-y-8 flex flex-col justify-end">
            {/* Previous Command Bubble */}
            <div className="flex justify-end mb-4">
                <div
                    className="bg-white border border-base-200 px-6 py-4 rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-md shadow-soft max-w-2xl text-text-main">
                    <p className="font-medium text-[15px]">삼성전자 3분기 실적 분석하고 기술적 차트 패턴 요약해서 보고서 작성해줘.</p>
                    <span className="text-xs text-text-muted mt-2 block">오늘 오전 09:12</span>
                </div>
            </div>

            {/* Report Response Bubble */}
            <div className="flex gap-4">
                <div
                    className="w-10 h-10 rounded-full bg-accent-terracotta text-white flex items-center justify-center font-bold shrink-0 shadow-soft">
                    <i className="ph ph-star text-lg"></i>
                </div>
                {/* Quality Gate Passed indicator */}
                <div
                    className="bg-base-100/50 border border-base-200 px-6 py-5 rounded-tr-3xl rounded-br-3xl rounded-bl-3xl rounded-tl-md max-w-3xl">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-text-main">비서실장 (Chief of Staff)</span>
                        <span
                            className="px-2.5 py-1 bg-accent-green/10 text-accent-green text-xs font-bold rounded-full flex items-center gap-1">
                            <i className="ph ph-shield-check"></i> 품질 검수 통과 (5/5)
                        </span>
                    </div>
                    <div className="space-y-4 text-[15px] leading-relaxed text-text-main">
                        <p>CEO님, 지시하신 삼성전자 3분기 실적 및 기술적 분석 종합 보고서입니다.</p>
                        <div className="bg-white border border-base-200 rounded-2xl p-5 shadow-soft">
                            <h4 className="font-bold mb-2">핵심 요약</h4>
                            <ul className="list-disc list-inside space-y-1 text-text-muted mt-2">
                                <li>매출 78조원으로 전년 대비 12% 상승</li>
                                <li>메모리 반도체 부문 영업이익 개선 뚜렷</li>
                                <li>기술적으로 20일 이동평균선 상향 돌파, MACD 골든크로스 발생</li>
                            </ul>
                            <div className="mt-4 pt-4 border-t border-base-100 flex gap-2">
                                <button
                                    className="text-xs font-semibold px-3 py-1.5 bg-base-50 rounded-lg text-text-muted hover:text-text-main transition-colors border border-base-200">
                                    <i className="ph ph-download-simple mr-1"></i> PDF 다운로드
                                </button>
                                <button
                                    className="text-xs font-semibold px-3 py-1.5 bg-base-50 rounded-lg text-text-muted hover:text-text-main transition-colors border border-base-200">
                                    <i className="ph ph-thumbs-up mr-1 text-accent-green"></i> 좋음
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Delegation Visualization (WebSocket SSE) */}
            <div className="my-8 flex justify-center w-full">
                {/* Connects different agents working in parallel */}
                <div className="card w-full max-w-4xl p-8 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-text-main flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span
                                    className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-amber opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-coral"></span>
                            </span>
                            실시간 위임 체인
                        </h3>
                        <span className="text-xs font-medium text-text-muted bg-base-100 px-3 py-1 rounded-full">실행 모드:
                            자율</span>
                    </div>

                    <div className="flex items-center justify-between px-10 relative">
                        {/* Horizontal Connecting Line */}
                        <div className="absolute top-1/2 left-20 right-20 h-0.5 bg-base-200 -translate-y-1/2 z-0"></div>

                        {/* Agent 1: Secretary */}
                        <div className="flex flex-col items-center gap-3 z-10 relative">
                            <div
                                className="w-16 h-16 rounded-full bg-white border-2 border-accent-terracotta shadow-soft-lg flex items-center justify-center text-text-main">
                                <i className="ph ph-star text-2xl text-accent-terracotta"></i>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-text-main">비서실장</p>
                                <p className="text-xs text-text-muted bg-base-100 px-2 py-0.5 rounded-md mt-1">종합 및 검수</p>
                            </div>
                        </div>

                        {/* Arrow 1 */}
                        <i className="ph ph-caret-right text-base-300 text-2xl z-10 bg-white"></i>

                        {/* Agent 2: CIO */}
                        <div className="flex flex-col items-center gap-3 z-10 relative">
                            <div
                                className="w-16 h-16 rounded-full bg-white border-2 border-accent-amber shadow-soft-lg flex items-center justify-center text-text-main node-pulse">
                                <i className="ph ph-briefcase text-2xl text-accent-amber"></i>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-text-main">투자전략실장</p>
                                <p
                                    className="text-xs text-accent-coral font-medium bg-accent-coral/10 px-2 py-0.5 rounded-md mt-1">
                                    <i className="ph ph-spinner-gap animate-spin"></i> 분석 종합 중...
                                </p>
                            </div>
                        </div>

                        {/* Parallel Branching */}
                        <div
                            className="w-12 h-32 border-t-2 border-b-2 border-l-2 border-base-200 rounded-l-xl opacity-50 absolute left-[60%] top-[30%] z-0">
                        </div>

                        {/* Experts (Specialist/Worker) */}
                        <div className="flex flex-col gap-6 z-10 relative pl-8">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-full bg-white border border-base-300 shadow-soft flex items-center justify-center text-text-muted relative">
                                    <i className="ph ph-chart-line-up text-xl"></i>
                                    <div
                                        className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-accent-green text-white text-[10px] flex items-center justify-center border-2 border-white">
                                        <i className="ph ph-check"></i></div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-text-main">시황분석가</p>
                                    <p className="text-[10px] text-text-muted">작업 완료</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-full bg-white border border-base-300 shadow-soft flex items-center justify-center text-text-muted relative">
                                    <i className="ph ph-bank text-xl"></i>
                                    <div
                                        className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-accent-green text-white text-[10px] flex items-center justify-center border-2 border-white">
                                        <i className="ph ph-check"></i></div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-text-main">종목분석가</p>
                                    <p className="text-[10px] text-text-muted">작업 완료</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Command Input Area */}
        {/* API: POST /api/workspace/commands */}
        <div className="px-10 pb-10 shrink-0 bg-gradient-to-t from-[#fcfbf9] to-transparent pt-4">
            <div
                className="bg-white border text-text-main border-base-200 rounded-3xl p-3 flex flex-col shadow-soft-lg group focus-within:border-[#d5cfc1] focus-within:shadow-[0_10px_40px_rgba(224,122,95,0.08)] transition-all">
                <textarea placeholder="조직에게 내릴 명령을 입력하세요. (@부서/직원 멘션, /명령어 사용 가능)"
                    className="w-full bg-transparent resize-none outline-none font-medium px-4 py-3 min-h-[50px] max-h-48 overflow-y-auto placeholder:text-base-300"
                    rows="2"></textarea>

                <div className="flex justify-between items-center px-2 mt-2">
                    <div className="flex gap-1">
                        <button
                            className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"
                            title="파일 첨부">
                            <i className="ph ph-paperclip text-xl"></i>
                        </button>
                        {/* Mentions & Slash Triggers */}
                        <button
                            className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"
                            title="부서/직원 멘션">
                            <i className="ph ph-at text-xl"></i>
                        </button>
                        <button
                            className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:bg-base-100 transition-colors"
                            title="특수 명령어">
                            <i className="ph ph-math-operations text-xl text-accent-amber"></i>
                        </button>
                    </div>

                    <button
                        className="bg-accent-terracotta text-white px-6 py-2.5 rounded-full font-bold shadow-soft hover:bg-opacity-90 transition-all flex items-center gap-2">
                        지시하기 <i className="ph ph-paper-plane-right"></i>
                    </button>
                </div>
            </div>
            <div className="text-center mt-4">
                <p className="text-xs font-medium text-text-muted">명령 전송 시 비서실장이 자동으로 적합한 부서에 작업을 위임합니다.</p>
            </div>
        </div>

    </main>
    </>
  );
}

export default AppCommandCenter;
