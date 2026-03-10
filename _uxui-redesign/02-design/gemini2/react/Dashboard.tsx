"use client";
import React from "react";

const styles = `
body {
            background-color: #F4F4F0;
            color: #1E1E1E;
        }

        .neo-border {
            border: 3px solid #1E1E1E;
        }

        .neo-shadow {
            box-shadow: 4px 4px 0px 0px rgba(30, 30, 30, 1);
        }

        .neo-shadow-sm {
            box-shadow: 2px 2px 0px 0px rgba(30, 30, 30, 1);
        }

        .neo-card {
            border: 3px solid #1E1E1E;
            box-shadow: 8px 8px 0px 0px rgba(30, 30, 30, 1);
            background-color: white;
        }

        .neo-card-hover {
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;
        }

        .neo-card-hover:hover {
            transform: translate(-4px, -4px);
            box-shadow: 12px 12px 0px 0px rgba(30, 30, 30, 1);
        }

        .neo-btn {
            border: 3px solid #1E1E1E;
            box-shadow: 4px 4px 0px 0px rgba(30, 30, 30, 1);
            transition: all 0.1s ease-in-out;
            font-weight: 700;
            cursor: pointer;
        }

        .neo-btn:hover {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0px 0px rgba(30, 30, 30, 1);
        }

        .neo-btn:active {
            transform: translate(4px, 4px);
            box-shadow: 0px 0px 0px 0px rgba(30, 30, 30, 1);
        }

        .nav-item.active {
            background-color: #BFFF00;
            border: 3px solid #1E1E1E;
            box-shadow: 2px 2px 0px 0px rgba(30, 30, 30, 1);
        }

        .nav-item:hover:not(.active) {
            background-color: #E5E5E5;
        }

        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
            border-left: 3px solid #1E1E1E;
            border-top: 3px solid #1E1E1E;
        }

        ::-webkit-scrollbar-track {
            background: #F4F4F0;
        }

        ::-webkit-scrollbar-thumb {
            background: #1E1E1E;
            border: 2px solid #F4F4F0;
        }
`;

function Dashboard() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
{/* Sidebar Navigation */}
    <nav className="w-64 border-r-3 border-neo-black bg-white flex flex-col h-full z-10 shrink-0">
        <div className="p-6 border-b-3 border-neo-black bg-neo-yellow">
            <h1 className="text-3xl font-black tracking-tight uppercase">CORTHEX</h1>
            <p className="font-bold text-xs mt-1 bg-white inline-block px-1 neo-border">WORKSPACE</p>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
            <a href="/app/home" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">H</span> Home
            </a>
            <a href="/app/command-center" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">C</span> Command
                Center
            </a>
            <a href="/app/dashboard" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-lime flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#000]">D</span>
                Dashboard
            </a>
            <div className="pt-4 border-t-3 border-neo-black mt-4 mb-2"></div>
            <a href="/app/agents" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">A</span> Agents
            </a>
            <a href="/app/costs" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">₩</span> Costs &
                Budget
            </a>
            <a href="/app/performance" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">P</span> Performance
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-y-auto">

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase">Live Dashboard</h2>
            </div>
            <div className="flex items-center gap-4">
                <button className="font-bold border-b-2 border-neo-black py-1 text-sm hover:text-neo-pink">Global
                    Reset</button>
                <div className="h-6 w-0.5 bg-neo-black"></div>
                <div className="flex bg-white neo-border p-1">
                    <button
                        className="bg-neo-black text-white px-3 py-1 text-xs font-bold uppercase cursor-default">Today</button>
                    <button
                        className="hover:bg-gray-200 px-3 py-1 text-xs font-bold uppercase transition-colors">7d</button>
                    <button
                        className="hover:bg-gray-200 px-3 py-1 text-xs font-bold uppercase transition-colors">30d</button>
                </div>
            </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-10 w-full">

            {/* Summary KPI Cards */}
            {/* API: GET /api/workspace/dashboard/summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1 */}
                <div className="neo-card bg-neo-pink text-white p-6 neo-card-hover flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <span
                            className="font-bold text-sm uppercase tracking-widest border-2 border-white px-2 py-0.5">Total
                            Commands</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="3">
                            <path d="M4 19l16-14M20 5h-8M20 5v8" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-5xl font-black">142</div>
                        <div className="text-sm font-bold mt-2 text-white/80">+12% from last week</div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="neo-card bg-neo-lime p-6 neo-card-hover flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <span
                            className="font-bold text-sm uppercase tracking-widest bg-white border-2 border-neo-black px-2 py-0.5 text-neo-black shadow-[2px_2px_0px_#000]">Active
                            Agents</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="3" className="text-neo-black">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4" />
                            <path d="M12 16h.01" />
                        </svg>
                    </div>
                    <div className="text-neo-black">
                        <div className="text-5xl font-black">24<span className="text-2xl ml-2">/30</span></div>
                        <div className="text-sm font-bold mt-2">6 Agents currently idle</div>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="neo-card bg-white p-6 neo-card-hover flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <span
                            className="font-bold text-sm uppercase tracking-widest bg-neo-blue border-2 border-neo-black px-2 py-0.5 shadow-[2px_2px_0px_#000]">Tokens
                            Used</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="3">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-5xl font-black">2.4M</div>
                        <div className="text-sm font-bold mt-2 text-gray-500">Claude 3.5 Sonnet: 80%</div>
                    </div>
                </div>

                {/* Card 4 */}
                <div
                    className="neo-card bg-neo-yellow p-6 neo-card-hover flex flex-col justify-between h-40 relative overflow-hidden">
                    <div
                        className="absolute -right-4 -top-4 w-24 h-24 bg-white rounded-full neo-border shadow-sm flex items-center justify-center opacity-70">
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                        <span
                            className="font-bold text-sm uppercase tracking-widest bg-white border-2 border-neo-black px-2 py-0.5 shadow-[2px_2px_0px_#000]">Cost
                            Est.</span>
                    </div>
                    <div className="relative z-10">
                        <div className="text-5xl font-black">$42.50</div>
                        <div className="text-sm font-bold mt-2 text-neo-black flex items-center gap-2">
                            <div className="w-full bg-white h-2 neo-border">
                                <div className="bg-neo-pink h-full w-[85%] border-r-3 border-neo-black"></div>
                            </div>
                            <span>85%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Usage Trend (Large Chart) */}
                {/* API: GET /api/workspace/dashboard/usage */}
                <div className="neo-card bg-white lg:col-span-2 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black uppercase">Command Usage & Performance</h3>
                        <div className="flex gap-2 text-xs font-bold uppercase">
                            <span className="flex items-center gap-1"><span
                                    className="w-3 h-3 bg-neo-lime border border-black inline-block"></span> Success</span>
                            <span className="flex items-center gap-1"><span
                                    className="w-3 h-3 bg-neo-pink border border-black inline-block"></span> Failures</span>
                        </div>
                    </div>
                    <div
                        className="flex-grow w-full min-h-[300px] border-3 border-neo-black bg-gray-50 p-4 shadow-[4px_4px_0px_#000] relative">
                        {/* Chart Container */}
                        <canvas id="usageChart"></canvas>

                        {/* Fallback / Static view if JS fails */}
                        <div className="absolute inset-0 flex items-end justify-between px-8 py-4 opacity-0"
                            aria-hidden="true">
                            {/* Bar chart mock */}
                        </div>
                    </div>
                </div>

                {/* QA Score / Quality Gate Stats */}
                {/* API: GET /api/workspace/dashboard/satisfaction */}
                <div className="neo-card bg-neo-blue p-6 flex flex-col">
                    <h3
                        className="text-xl font-black uppercase mb-6 bg-white px-3 py-1 neo-border shadow-[2px_2px_0px_#000] inline-block">
                        Quality Gate Pass Rate</h3>

                    <div className="flex-grow flex flex-col items-center justify-center">
                        <div
                            className="relative w-48 h-48 rounded-full bg-white neo-border flex items-center justify-center shadow-[8px_8px_0px_#000]">
                            {/* Mock Circular Progress */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle cx="96" cy="96" r="80" fill="none" className="stroke-gray-200" strokeWidth="16">
                                </circle>
                                <circle cx="96" cy="96" r="80" fill="none" className="stroke-neo-lime" strokeWidth="16"
                                    stroke-dasharray="502" stroke-dashoffset="40" strokeLinecap="butt"></circle>
                            </svg>
                            <div className="text-center relative z-10 flex flex-col items-center">
                                <span className="text-5xl font-black">92<span className="text-2xl">%</span></span>
                                <span
                                    className="font-bold text-sm uppercase mt-1 px-2 border border-black bg-neo-yellow">High</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3 bg-white p-4 neo-border shadow-[4px_4px_0px_#000]">
                        <div className="flex justify-between font-bold text-sm">
                            <span>Hallucination Detection</span>
                            <span className="text-neo-pink">3 caught</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 border border-black">
                            <div className="bg-neo-pink h-full w-[10%] border-r border-black"></div>
                        </div>
                        <div className="flex justify-between font-bold text-sm pt-2">
                            <span>Auto-Rework Triggers</span>
                            <span className="text-neo-orange">12 times</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 border border-black">
                            <div className="bg-neo-orange h-full w-[25%] border-r border-black"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Third Row: Department Breakdown & Active Jobs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">

                {/* Department Spend / Activity */}
                {/* API: GET /api/workspace/dashboard/costs/by-agent */}
                <div className="neo-card bg-white overflow-hidden flex flex-col">
                    <div className="p-6 border-b-3 border-neo-black bg-neo-yellow flex justify-between items-center">
                        <h3 className="text-xl font-black uppercase">Department Activity</h3>
                        <a href="/app/departments" className="neo-btn bg-white px-3 py-1 text-xs">View Depts</a>
                    </div>
                    <div className="flex-grow p-0">
                        <table className="w-full text-left font-medium">
                            <thead
                                className="bg-gray-100 border-b-3 border-neo-black text-xs uppercase font-black tracking-wider">
                                <tr>
                                    <th className="p-4 border-r-3 border-neo-black">Dept</th>
                                    <th className="p-4 border-r-3 border-neo-black text-center">Agents</th>
                                    <th className="p-4 border-r-3 border-neo-black text-center">Tasks</th>
                                    <th className="p-4 text-right">Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-3 divide-neo-black">
                                <tr className="hover:bg-neo-blue/20">
                                    <td className="p-4 border-r-3 border-neo-black font-bold">Marketing & Comms</td>
                                    <td className="p-4 border-r-3 border-neo-black text-center text-lg font-black">8</td>
                                    <td className="p-4 border-r-3 border-neo-black text-center">45</td>
                                    <td className="p-4 text-right font-black text-neo-pink">$18.50</td>
                                </tr>
                                <tr className="hover:bg-neo-blue/20">
                                    <td className="p-4 border-r-3 border-neo-black font-bold">Strategy & Trading</td>
                                    <td className="p-4 border-r-3 border-neo-black text-center text-lg font-black">4</td>
                                    <td className="p-4 border-r-3 border-neo-black text-center">12</td>
                                    <td className="p-4 text-right font-black">$12.00</td>
                                </tr>
                                <tr className="hover:bg-neo-blue/20">
                                    <td className="p-4 border-r-3 border-neo-black font-bold">Engineering / DevOps</td>
                                    <td className="p-4 border-r-3 border-neo-black text-center text-lg font-black">3</td>
                                    <td className="p-4 border-r-3 border-neo-black text-center">85</td>
                                    <td className="p-4 text-right font-black">$8.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Active Background Jobs */}
                {/* API: GET /api/workspace/jobs */}
                <div className="neo-card bg-white overflow-hidden flex flex-col">
                    <div className="p-6 border-b-3 border-neo-black flex justify-between items-center">
                        <h3 className="text-xl font-black uppercase">Active Jobs / Tasks</h3>
                        <span
                            className="bg-neo-lime px-2 py-0.5 border-2 border-neo-black font-bold shadow-[2px_2px_0px_#000] text-sm">3
                            Running</span>
                    </div>
                    <div className="p-6 space-y-4 bg-neo-bg flex-grow">
                        {/* Job 1 */}
                        <div className="bg-white p-4 neo-border shadow-[4px_4px_0px_#000] relative">
                            <div
                                className="absolute top-0 right-0 w-8 h-8 border-l-3 border-b-3 border-neo-black bg-neo-yellow flex items-center justify-center font-bold text-xs">
                                1</div>
                            <h4 className="font-black mb-1 pr-6 flex items-center gap-2">
                                <svg className="animate-spin text-neo-blue" width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="4">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                </svg>
                                Daily News Scraping
                            </h4>
                            <p className="text-sm font-medium text-gray-600 mb-3">Agent: Data Collector #2</p>
                            <div className="w-full bg-gray-200 h-2 border border-black">
                                <div className="bg-neo-blue h-full w-[45%] border-r border-black"></div>
                            </div>
                        </div>

                        {/* Job 2 */}
                        <div className="bg-white p-4 neo-border shadow-[4px_4px_0px_#000] relative">
                            <div
                                className="absolute top-0 right-0 w-8 h-8 border-l-3 border-b-3 border-neo-black bg-neo-pink text-white flex items-center justify-center font-bold text-xs">
                                2</div>
                            <h4 className="font-black mb-1 pr-6 flex items-center gap-2">
                                <svg className="animate-spin text-neo-pink" width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="4">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                </svg>
                                KIS API Order Execution
                            </h4>
                            <p className="text-sm font-medium text-gray-600 mb-3">Agent: Vector (Trdn)</p>
                            <div className="w-full bg-gray-200 h-2 border border-black animate-pulse">
                                <div className="bg-neo-pink h-full w-full"></div>
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

export default Dashboard;
