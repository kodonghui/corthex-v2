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

        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }

        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        .metric-card {
            background-color: white;
            border-radius: 1.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
            border: 1px solid #f5f3ec;
            transition: all 0.2s ease;
        }

        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
        }

        .gauge-ring {
            stroke-dasharray: 100 100;
            stroke-dashoffset: 0;
            transition: stroke-dashoffset 1s ease-out;
        }
`;

function AppPerformance() {
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

                <div className="pt-4 pb-2 px-4 text-xs font-bold text-base-300 uppercase tracking-wider">시스템 모니터링</div>
                {/* Active menu */}
                <a href="#"
                    className="sidebar-item active flex items-center justify-between px-4 py-3 font-medium text-accent-terracotta bg-base-100 rounded-2xl transition-colors">
                    <div className="flex items-center gap-3">
                        <i className="ph ph-gauge text-xl"></i> 성능 가시성
                    </div>
                </a>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-shield-check text-xl"></i> 보안 기밀 (Classified)
                </a>
                <a href="#"
                    className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-base-100 rounded-2xl transition-colors">
                    <i className="ph ph-eye text-xl"></i> 감시망 (Argos)
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
    <main className="flex-1 overflow-y-auto px-10 py-8 relative bg-[#fcfbf9]/50 hide-scrollbar">

        {/* Header (API: GET /api/workspace/performance/overview) */}
        <header
            className="flex justify-between items-end mb-8 sticky top-0 bg-[#fcfbf9]/80 backdrop-blur-md z-10 pt-2 pb-4">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <span className="relative flex h-3 w-3">
                        <span
                            className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-green"></span>
                    </span>
                    <span className="text-sm font-bold text-text-muted uppercase tracking-wider">시스템 정상 작동 중</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-text-main">성능 및 상태 모니터링</h1>
            </div>

            <div className="flex items-center gap-3">
                <div
                    className="bg-white border border-base-200 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm">
                    <i className="ph ph-calendar text-text-muted"></i>
                    <select className="outline-none text-text-main bg-transparent cursor-pointer">
                        <option>최근 24시간</option>
                        <option>최근 7일</option>
                        <option>최근 30일</option>
                    </select>
                </div>
            </div>
        </header>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

            <div className="metric-card p-6 flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="w-10 h-10 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center text-xl">
                        <i className="ph ph-clock text-accent-blue"></i></div>
                    <span className="text-[10px] font-bold text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded-md">-12%
                        (개선됨)</span>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">평균 응답 지연 (Latency)</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-text-main">412</span>
                        <span className="text-sm font-medium text-text-muted">ms</span>
                    </div>
                </div>
            </div>

            <div className="metric-card p-6 flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="w-10 h-10 rounded-xl bg-accent-terracotta/10 text-accent-terracotta flex items-center justify-center text-xl">
                        <i className="ph ph-lightning text-accent-terracotta"></i></div>
                    <span
                        className="text-[10px] font-bold text-accent-green bg-accent-green/10 px-2 py-0.5 rounded-md">+5.2%</span>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">생성 속도 (Tokens/s)</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-text-main">34.8</span>
                        <span className="text-sm font-medium text-text-muted">t/s</span>
                    </div>
                </div>
            </div>

            <div className="metric-card p-6 flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="w-10 h-10 rounded-xl bg-accent-coral/10 text-accent-coral flex items-center justify-center text-xl">
                        <i className="ph ph-warning-octagon text-accent-coral"></i></div>
                    <span className="text-[10px] font-bold text-accent-coral bg-accent-coral/10 px-2 py-0.5 rounded-md">+2
                        (증가)</span>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">API 오류율</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-text-main">0.4</span>
                        <span className="text-sm font-medium text-text-muted">%</span>
                    </div>
                </div>
            </div>

            <div
                className="metric-card p-6 flex flex-col justify-between bg-gradient-to-br from-[#10a37f]/10 to-transparent border-[#10a37f]/20">
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="w-10 h-10 rounded-xl bg-white/50 text-[#10a37f] flex items-center justify-center text-xl">
                        <i className="ph ph-activity"></i></div>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">시스템 업타임</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-[#10a37f]">99.98</span>
                        <span className="text-sm font-medium text-text-muted">%</span>
                    </div>
                </div>
            </div>

        </div>

        {/* Main Charts Section (API: GET /api/workspace/performance/charts) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Latency Over Time Chart */}
            <div className="lg:col-span-2 metric-card p-8 relative overflow-hidden">
                <div className="flex justify-between items-start mb-8 z-10 relative">
                    <div>
                        <h3 className="font-bold text-text-main text-lg mb-1">LLM 응답 지연 (Latency) 추이</h3>
                        <p className="text-xs text-text-muted">OpenAI 및 Anthropic 모델 응답 시간 비교기</p>
                    </div>
                    {/* Legend */}
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5"><span
                                className="w-3 h-3 rounded-full bg-[#10a37f]"></span><span
                                className="text-xs font-medium text-text-muted">GPT-4o</span></div>
                        <div className="flex items-center gap-1.5"><span
                                className="w-3 h-3 rounded-full bg-[#4A90E2]"></span><span
                                className="text-xs font-medium text-text-muted">Claude 3.5</span></div>
                    </div>
                </div>

                {/* Mock Line Chart CSS/SVG */}
                <div className="h-48 w-full relative">
                    {/* Y Axis Labels */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] text-text-muted font-mono h-full pb-6">
                        <span>800ms</span>
                        <span>400ms</span>
                        <span>0ms</span>
                    </div>

                    {/* Graph Area */}
                    <div className="absolute left-10 right-0 top-0 bottom-6 border-l border-b border-base-200">
                        {/* Grid Lines */}
                        <div className="absolute w-full h-full flex flex-col justify-between">
                            <div className="border-t border-base-100 w-full flex-1"></div>
                            <div className="border-t border-base-100 w-full flex-1"></div>
                        </div>

                        {/* SVG Lines */}
                        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                            {/* GPT Line */}
                            <path
                                d="M 0,50 C 20,40 40,60 60,30 S 80,45 100,20 S 120,50 140,40 S 160,25 180,35 S 200,60 220,50"
                                fill="none" stroke="#10a37f" strokeWidth="2.5" vector-effect="non-scaling-stroke">
                            </path>
                            {/* Claude Line */}
                            <path
                                d="M 0,80 C 20,70 40,90 60,75 S 80,60 100,85 S 120,65 140,80 S 160,70 180,90 S 200,75 220,85"
                                fill="none" stroke="#4A90E2" strokeWidth="2.5" vector-effect="non-scaling-stroke">
                            </path>

                            {/* Tooltip Point */}
                            <circle cx="200" cy="50" r="4" fill="white" stroke="#10a37f" strokeWidth="2"></circle>
                        </svg>

                        <div
                            className="absolute right-[8%] top-[30%] bg-text-main text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm whitespace-nowrap transform -translate-x-1/2 -translate-y-[120%] z-20">
                            GPT-4o: 412ms
                        </div>
                    </div>

                    {/* X Axis Labels */}
                    <div
                        className="absolute left-10 right-0 bottom-0 h-6 flex justify-between items-end text-[10px] text-text-muted font-mono px-2">
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                        <span>Now</span>
                    </div>
                </div>
            </div>

            {/* Health Score Gauge */}
            <div className="metric-card p-8 flex flex-col items-center justify-center relative">
                <h3 className="font-bold text-text-main text-lg mb-6 self-start w-full">종합 헬스 스코어</h3>

                <div className="relative w-40 h-40">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                        {/* Background Circle */}
                        <path stroke-dasharray="100, 100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            stroke="#f5f3ec" strokeWidth="3" fill="none" strokeLinecap="round"></path>
                        {/* Progress Circle */}
                        <path className="gauge-ring" stroke-dasharray="92, 100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            stroke="#e07a5f" strokeWidth="3" fill="none" strokeLinecap="round"></path>
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-text-main">92</span>
                        <span
                            className="text-[10px] font-bold text-accent-terracotta uppercase tracking-wider mt-1">Excellent</span>
                    </div>
                </div>

                <div className="w-full mt-8 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-text-muted font-medium">에이전트 가용성</span>
                        <span className="font-bold text-text-main">100%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-text-muted font-medium">API 레이트 리밋 여유</span>
                        <span className="font-bold text-accent-coral">14% (주의)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-text-muted font-medium">DB 커넥션 풀 캐파</span>
                        <span className="font-bold text-accent-green">89%</span>
                    </div>
                </div>
            </div>

        </div>

    </main>
    </>
  );
}

export default AppPerformance;
