"use client";
import React from "react";

const styles = `
body {
            background-color: #0a0a0f;
            color: #f3f4f6;
            background-image: radial-gradient(circle at 15% 50%, rgba(168, 85, 247, 0.08), transparent 25%),
                radial-gradient(circle at 85% 30%, rgba(34, 211, 238, 0.08), transparent 25%);
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

        .btn-glass.active {
            background-color: rgba(34, 211, 238, 0.15);
            border-color: rgba(34, 211, 238, 0.4);
            color: #22d3ee;
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

        /* Fake CSS Charts */
        .chart-bar {
            background: linear-gradient(to top, rgba(34, 211, 238, 0.1), rgba(34, 211, 238, 0.8));
            border-radius: 4px 4px 0 0;
            width: 100%;
            transition: height 1s ease;
        }

        .chart-bar-purple {
            background: linear-gradient(to top, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.8));
            border-radius: 4px 4px 0 0;
            width: 100%;
            transition: height 1s ease;
        }
`;

function Dashboard() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar Navigation */}
    <aside className="w-64 flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl h-full shrink-0">
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
                        <i className="fas fa-home w-4"></i> <span>홈 (작전현황)</span>
                    </a>
                    <a href="/app/command-center"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-terminal w-4"></i> <span>사령관실</span>
                    </a>
                </nav>
            </div>

            <div className="mb-4">
                <div className="text-xs text-white/30 font-semibold mb-2 px-2 uppercase tracking-wider">Analytics</div>
                <nav className="space-y-1">
                    <a href="#"
                        className="flex items-center gap-3 px-3 py-2 text-white bg-white/10 rounded-lg border border-white/10 transition-colors">
                        <i className="fas fa-chart-pie w-4 text-accent-purple"></i> <span>대시보드 (비용/통계)</span>
                    </a>
                    <a href="#"
                        className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <i className="fas fa-file-invoice-dollar w-4"></i> <span>예산 관리</span>
                    </a>
                </nav>
            </div>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto p-8 lg:p-10 relative">
        <header className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-3xl font-semibold mb-1">통계/비용 대시보드</h2>
                <p className="text-white/40 text-sm">LLM 모델별 사용량, 에이전트별 비용 및 API 활용 현황을 분석합니다.</p>
            </div>
            <div className="flex gap-2">
                <div className="glass-panel p-1 flex">
                    <button className="btn-glass active truncate border-none mr-1">7일</button>
                    <button
                        className="btn-glass border-none mr-1 !bg-transparent !text-white/50 hover:!text-white">30일</button>
                    <button className="btn-glass border-none !bg-transparent !text-white/50 hover:!text-white">이번 달</button>
                </div>
                <button className="btn-glass px-4"><i className="fas fa-download mr-2 text-white/40"></i>리포트 다운로드</button>
            </div>
        </header>

        {/* Top KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* API: GET /api/workspace/dashboard/budget */}
            <div className="glass-panel p-6">
                <div className="flex items-center gap-3 text-white/60 text-sm mb-4">
                    <i className="fas fa-coins text-yellow-400"></i> 총 사용 금액
                </div>
                <div className="flex items-end gap-3">
                    <div className="text-4xl num-bold text-white">$ 124.50</div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/40">
                    전주 대비 <span className="text-red-400 font-medium">+15.2%</span> 증가
                </div>
            </div>

            {/* API: GET /api/workspace/dashboard/usage */}
            <div className="glass-panel p-6">
                <div className="flex items-center gap-3 text-white/60 text-sm mb-4">
                    <i className="fas fa-bolt text-accent-cyan"></i> API 호출 횟수
                </div>
                <div className="flex items-end gap-3">
                    <div className="text-4xl num-bold text-white">4,281</div>
                    <div className="text-sm font-medium text-white/60 mb-1">건</div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/40">
                    Batch API 활용률: <span className="text-accent-cyan font-medium">42%</span> (절감 $12.3)
                </div>
            </div>

            <div className="glass-panel p-6">
                <div className="flex items-center gap-3 text-white/60 text-sm mb-4">
                    <i className="fas fa-layer-group text-accent-purple"></i> 처리된 토큰 수
                </div>
                <div className="flex items-end gap-3">
                    <div className="text-4xl num-bold text-white">1.2<span className="text-2xl text-white/50 ml-1">M</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/40 flex gap-4">
                    <span>In: 850K</span>
                    <span>Out: 350K</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Cost per Agent (GET /api/workspace/dashboard/costs/by-agent) */}
            <div className="xl:col-span-1 glass-panel p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white/90 font-medium text-lg">에이전트별 비용</h3>
                    <button className="btn-icon !p-1"><i className="fas fa-ellipsis-h text-sm"></i></button>
                </div>

                <div className="space-y-4 flex-1">
                    {/* Agent 1 */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/80">김전략 (CIO) <span
                                    className="text-xs text-white/30 ml-1">Manager</span></span>
                            <span className="num-bold text-accent-cyan">$ 45.20</span>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                            <div className="bg-accent-cyan h-2 rounded-full" style={{width: "36%"}}></div>
                        </div>
                    </div>
                    {/* Agent 2 */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/80">데이터분석가 <span
                                    className="text-xs text-white/30 ml-1">Specialist</span></span>
                            <span className="num-bold text-white/80">$ 32.10</span>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                            <div className="bg-white/40 h-2 rounded-full" style={{width: "25%"}}></div>
                        </div>
                    </div>
                    {/* Agent 3 */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/80">정작가 <span
                                    className="text-xs text-white/30 ml-1">Worker</span></span>
                            <span className="num-bold text-white/80">$ 21.05</span>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                            <div className="bg-white/20 h-2 rounded-full" style={{width: "17%"}}></div>
                        </div>
                    </div>
                    {/* Agent 4 */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/80">비서실장 <span
                                    className="text-xs text-white/30 ml-1">System</span></span>
                            <span className="num-bold text-white/80">$ 15.30</span>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                            <div className="bg-white/10 h-2 rounded-full" style={{width: "12%"}}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Usage Chart (GET /api/workspace/dashboard/usage) */}
            <div className="xl:col-span-2 glass-panel p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-white/90 font-medium text-lg">일일 API 사용량 추이</h3>
                        <p className="text-xs text-white/40 mt-1">최근 7일 프롬프트/완료 토큰 사용량 (Provider 별)</p>
                    </div>
                    <div className="flex gap-4 text-xs font-medium text-white/60">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-accent-cyan"></div> Claude
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-accent-purple"></div> OpenAI
                        </div>
                    </div>
                </div>

                {/* Fake Chart Area */}
                <div
                    className="flex-1 min-h-[200px] flex items-end justify-between gap-4 pt-10 border-b border-white/5 pb-2">
                    <div className="w-full flex justify-between items-end gap-2 h-full">
                        {/* Bar groups */}
                        <div className="w-full h-full flex items-end gap-1 group">
                            <div className="chart-bar h-[40%] group-hover:opacity-80"></div>
                            <div className="chart-bar-purple h-[20%] group-hover:opacity-80"></div>
                        </div>
                        <div className="w-full h-full flex items-end gap-1 group">
                            <div className="chart-bar h-[55%] group-hover:opacity-80"></div>
                            <div className="chart-bar-purple h-[15%] group-hover:opacity-80"></div>
                        </div>
                        <div className="w-full h-full flex items-end gap-1 group">
                            <div className="chart-bar h-[30%] group-hover:opacity-80"></div>
                            <div className="chart-bar-purple h-[40%] group-hover:opacity-80"></div>
                        </div>
                        <div className="w-full h-full flex items-end gap-1 group">
                            <div className="chart-bar h-[70%] group-hover:opacity-80"></div>
                            <div className="chart-bar-purple h-[10%] group-hover:opacity-80"></div>
                        </div>
                        <div className="w-full h-full flex items-end gap-1 group">
                            <div className="chart-bar h-[85%] group-hover:opacity-80"></div>
                            <div className="chart-bar-purple h-[35%] group-hover:opacity-80"></div>
                        </div>
                        <div className="w-full h-full flex items-end gap-1 group">
                            <div className="chart-bar h-[60%] group-hover:opacity-80"></div>
                            <div className="chart-bar-purple h-[50%] group-hover:opacity-80"></div>
                        </div>
                        <div className="w-full h-full flex items-end gap-1 group relative">
                            {/* Tooltip mock */}
                            <div
                                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <div className="num-bold text-white mb-1">10/24 (오늘)</div>
                                <div className="text-accent-cyan">Claude: 185k</div>
                                <div className="text-accent-purple">OpenAI: 45k</div>
                            </div>
                            <div className="chart-bar h-[90%] group-hover:opacity-80"></div>
                            <div className="chart-bar-purple h-[25%] group-hover:opacity-80"></div>
                        </div>
                    </div>
                </div>
                {/* X Axis labels */}
                <div className="flex justify-between text-[10px] text-white/30 pt-3 num-bold">
                    <span>10/18</span>
                    <span>10/19</span>
                    <span>10/20</span>
                    <span>10/21</span>
                    <span>10/22</span>
                    <span>10/23</span>
                    <span className="text-white/80">오늘</span>
                </div>
            </div>
        </div>

    </main>
    </>
  );
}

export default Dashboard;
