"use client";
import React from "react";

const styles = `
body {
            background-color: #0a0a0f;
            color: #f3f4f6;
            background-image: radial-gradient(circle at 15% 50%, rgba(168, 85, 247, 0.05), transparent 25%),
                radial-gradient(circle at 85% 30%, rgba(34, 211, 238, 0.05), transparent 25%);
            background-attachment: fixed;
            font-weight: 300;
            line-height: 1.5;
        }

        .num-bold {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
            letter-spacing: -0.05em;
        }

        .glass-panel {
            background-color: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
        }

        .btn-primary {
            background: linear-gradient(135deg, #a855f7 0%, #22d3ee 100%);
            color: white;
            border: none;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
            cursor: pointer;
            text-sm;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .btn-glass {
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            border-radius: 0.5rem;
            padding: 0.4rem 0.8rem;
            transition: all 0.3s ease;
            backdrop-filter: blur(8px);
            cursor: pointer;
            font-weight: 400;
            text-sm;
        }

        .btn-glass:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        .btn-icon {
            background: transparent;
            border: 1px solid transparent;
            color: #9ca3af;
            border-radius: 0.5rem;
            padding: 0.5rem;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .btn-icon:hover {
            color: white;
            background-color: rgba(255, 255, 255, 0.05);
        }

        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        ::-webkit-scrollbar-track {
            background: transparent;
        }

        ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }

        /* Fake Chart Grid */
        .chart-grid {
            background-image:
                linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            background-size: 20px 20px;
        }
`;

function Costs() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar Navigation */}
    <aside
        className="w-64 flex flex-col border-r border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl h-full shrink-0 relative z-20">
        <div className="p-6">
            <h1 className="text-xl font-bold tracking-tight text-white mb-2">CORTHEX <span
                    className="text-xs font-normal text-white/40 ml-1">v2</span></h1>
        </div>

        <div className="p-4 flex-1 overflow-y-auto w-full">
            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Workspace</div>
                <nav className="space-y-1">
                    <a href="/app/home"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-home w-4"></i> <span>홈</span>
                    </a>
                </nav>
            </div>

            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Administration</div>
                <nav className="space-y-1">
                    <a href="/app/costs"
                        className="flex items-center gap-3 px-3 py-2 text-white bg-white/10 rounded-lg border border-white/10 transition-colors">
                        <i className="fas fa-chart-pie w-4 text-accent-cyan"></i> <span>비용 및 사용량 (Costs)</span>
                    </a>
                    <a href="#"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-cog w-4"></i> <span>워크스페이스 설정</span>
                    </a>
                </nav>
            </div>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto bg-[#0a0a0f] relative">
        <header className="p-8 pb-6 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-semibold mb-2">비용 및 토큰 사용량</h2>
                    {/* API: GET /api/workspace/costs */}
                    <p className="text-white/40 text-sm">LLM API 및 클라우드 인프라 자원의 실시간 비용 발생 현황을 모니터링합니다.</p>
                </div>
                <div className="flex gap-2">
                    <select className="btn-glass appearance-none pr-8 !py-1.5 focus:outline-none">
                        <option>이번 달 (현재까지)</option>
                        <option>지난 달</option>
                        <option>최근 7일</option>
                    </select>
                    <button className="btn-icon"><i className="fas fa-download"></i></button>
                </div>
            </div>
        </header>

        <div className="p-8 space-y-6">

            {/* Cost Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Cost */}
                <div className="glass-panel p-6 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-7xl text-white/5 opacity-50"><i
                            className="fas fa-dollar-sign"></i></div>
                    <div className="text-white/40 text-sm font-medium mb-2">누적 청구 금액 (이번 달)</div>
                    <div className="text-4xl num-bold text-white mb-2">$ 1,248.<span className="text-xl text-white/50">40</span>
                    </div>
                    <div className="text-xs text-green-400 flex items-center gap-1">
                        <i className="fas fa-arrow-down"></i> 12% (지난달 동기간 대비)
                    </div>
                </div>

                {/* Budget Limit */}
                <div className="glass-panel p-6">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-white/40 text-sm font-medium">예산 한도 도달률</div>
                        <button className="text-accent-cyan text-[10px] hover:underline">한도 설정</button>
                    </div>
                    <div className="text-2xl num-bold text-white mb-3">62.4% <span
                            className="text-sm text-white/40 font-normal">/ $2,000</span></div>
                    <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-accent-cyan to-blue-500 w-[62.4%] shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                        </div>
                    </div>
                </div>

                {/* Total Tokens */}
                <div className="glass-panel p-6">
                    <div className="text-white/40 text-sm font-medium mb-2">총 API 토큰 사용량</div>
                    <div className="text-2xl num-bold text-white mb-1 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">42.5M
                        <span className="text-sm font-normal text-white/40">tokens</span></div>
                    <div className="flex justify-between text-[10px] text-white/40 mt-3 pt-3 border-t border-white/5">
                        <span className="text-white/60">Input: <span className="font-mono">38M</span></span>
                        <span className="text-white/60">Output: <span className="font-mono">4.5M</span></span>
                    </div>
                </div>

                {/* Most Expensive Agent */}
                <div className="glass-panel p-6 border border-accent-purple/20 bg-[#151525]/80">
                    <div className="text-accent-purple/80 text-sm font-medium mb-3 flex items-center gap-2">
                        <i className="fas fa-fire text-accent-purple"></i> 비용 발생 1위 에이전트
                    </div>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full bg-base-200 border border-accent-purple/30 flex items-center justify-center">
                            <i className="fas fa-code-branch text-accent-purple text-sm"></i>
                        </div>
                        <div>
                            <div className="font-bold text-white text-lg">최데옵 (DevOps)</div>
                            <div className="text-xs text-white/50 font-mono mt-0.5">$ 482.10 (38%)</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Center/Left: Main Line Chart */}
                <div className="lg:col-span-2 glass-panel p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">일자별 비용 추이</h3>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-accent-purple shadow-[0_0_5px_#a855f7]"></div>
                                OpenAI
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_5px_#fb923c]"></div>
                                Anthropic
                            </div>
                        </div>
                    </div>

                    {/* Fake Chart Area */}
                    <div
                        className="flex-1 chart-grid relative min-h-[300px] border-b border-l border-white/10 mt-4 ml-6 mb-6">
                        {/* Y-axis labels */}
                        <div className="absolute -left-10 top-0 text-[10px] text-white/30 num-bold">$100</div>
                        <div className="absolute -left-10 top-1/2 -translate-y-1/2 text-[10px] text-white/30 num-bold">$50
                        </div>
                        <div className="absolute -left-10 bottom-0 text-[10px] text-white/30 num-bold">$0</div>

                        {/* X-axis labels */}
                        <div className="absolute -bottom-6 left-0 text-[10px] text-white/30 font-mono">10/01</div>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/30 font-mono">
                            10/15</div>
                        <div className="absolute -bottom-6 right-0 text-[10px] text-white/30 font-mono">10/31</div>

                        {/* Data Lines (SVG Mock) */}
                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                            {/* Anthropic Line (Lower, orange) */}
                            <path d="M0,80 Q10,75 20,82 T40,60 T60,55 T80,45 T100,50" fill="none" stroke="#fb923c"
                                strokeWidth="2" vector-effect="non-scaling-stroke"
                                style={{filter: "drop-shadow(0 0 4px rgba(251, 146, 60, 0.5))"}} />

                            {/* OpenAI Line (Higher, purple) */}
                            <path d="M0,60 Q10,40 20,50 T40,30 T60,20 T80,25 T100,10" fill="none" stroke="#a855f7"
                                strokeWidth="3" vector-effect="non-scaling-stroke"
                                style={{filter: "drop-shadow(0 0 6px rgba(168, 85, 247, 0.6))"}} />

                            {/* Area under purple line */}
                            <path d="M0,100 L0,60 Q10,40 20,50 T40,30 T60,20 T80,25 T100,10 L100,100 Z"
                                fill="url(#purpleGrad)" opacity="0.2" vector-effect="non-scaling-stroke" />

                            <defs>
                                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#a855f7" />
                                    <stop offset="100%" stop-color="transparent" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Tooltip Mock */}
                        <div
                            className="absolute left-[60%] top-[20%] transform -translate-x-1/2 -translate-y-full bg-[#151525] border border-white/10 rounded-lg p-2 shadow-xl z-10 pointer-events-none">
                            <div className="text-[10px] text-white/40 font-mono mb-1">Oct 18, 2026</div>
                            <div className="text-sm text-white font-bold">$ 84.50 <span
                                    className="text-[10px] font-normal text-white/40">(OpenAI)</span></div>
                        </div>
                        <div
                            className="absolute left-[60%] top-[20%] w-3 h-3 bg-[#a855f7] rounded-full border-2 border-[#151525] transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-[0_0_10px_#a855f7]">
                        </div>
                        <div
                            className="absolute left-[60%] top-[20%] bottom-0 w-px bg-white/10 border-dashed border-l border-white/20">
                        </div>
                    </div>
                </div>

                {/* Right: Pie Chart / Breakdown */}
                <div className="space-y-6">
                    <div className="glass-panel p-6">
                        <h3 className="text-sm font-bold text-white mb-6">모델별 비용 비중</h3>

                        {/* Fake Donut Chart */}
                        <div className="relative w-40 h-40 mx-auto mb-6">
                            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                {/* Background circle */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)"
                                    strokeWidth="20" />
                                {/* Segment 1: GPT-4o */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#a855f7" strokeWidth="20"
                                    stroke-dasharray="251.2" stroke-dashoffset="100.48"
                                    className="drop-shadow-[0_0_3px_rgba(168,85,247,0.5)]" />
                                {/* Segment 2: Claude 3.5 Sonnet */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fb923c" strokeWidth="20"
                                    stroke-dasharray="251.2" stroke-dashoffset="200.96" stroke-dashoffset-base="150.72"
                                    transform="rotate(216, 50, 50)" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-white">4</span>
                                <span className="text-[10px] text-white/40">Models Used</span>
                            </div>
                        </div>

                        {/* Legend Details */}
                        <div className="space-y-3 mt-4">
                            <div className="flex justify-between items-center group cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded bg-accent-purple shadow-[0_0_5px_#a855f7]"></div>
                                    <span className="text-xs text-white/80 group-hover:text-white">GPT-4o</span>
                                </div>
                                <div className="text-xs font-mono text-white">$ 748.10 <span
                                        className="text-white/30 ml-2">60%</span></div>
                            </div>
                            <div className="flex justify-between items-center group cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded bg-orange-400 shadow-[0_0_5px_#fb923c]"></div>
                                    <span className="text-xs text-white/80 group-hover:text-white">Claude 3.5 Sonnet</span>
                                </div>
                                <div className="text-xs font-mono text-white">$ 374.05 <span
                                        className="text-white/30 ml-2">30%</span></div>
                            </div>
                            <div className="flex justify-between items-center group cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded bg-blue-400"></div>
                                    <span className="text-xs text-white/80 group-hover:text-white">text-embedding-3</span>
                                </div>
                                <div className="text-xs font-mono text-white">$ 99.70 <span
                                        className="text-white/30 ml-2">8%</span></div>
                            </div>
                            <div className="flex justify-between items-center group cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded bg-white/20"></div>
                                    <span className="text-xs text-white/80 group-hover:text-white">Others (Whisper,
                                        etc)</span>
                                </div>
                                <div className="text-xs font-mono text-white">$ 26.55 <span
                                        className="text-white/30 ml-2">2%</span></div>
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

export default Costs;
