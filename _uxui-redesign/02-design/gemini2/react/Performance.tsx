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

        /* Bar Graph Animation */
        @keyframes fillUp {
            from {
                height: 0;
            }

            to {
                height: var(--target-h);
            }
        }

        .bar-animate {
            animation: fillUp 1s ease-out forwards;
        }
`;

function Performance() {
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
            <div className="pt-4 border-t-3 border-neo-black mt-4 mb-2"></div>
            <a href="/app/dashboard" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">D</span> Dashboard
            </a>
            <a href="/app/performance" className="nav-item active flex items-center gap-3 p-3 font-bold transition-colors">
                <span
                    className="w-6 h-6 bg-neo-lime flex items-center justify-center neo-border text-xs shadow-[2px_2px_0px_#000]">P</span>
                Performance
            </a>
            <a href="/app/reports" className="nav-item flex items-center gap-3 p-3 font-bold transition-colors">
                <span className="w-6 h-6 bg-white flex items-center justify-center neo-border text-xs">R</span> Reports
            </a>
        </div>
    </nav>

    {/* Main Content */}
    <main className="flex-grow flex flex-col h-full bg-neo-bg overflow-y-auto w-full">

        {/* Topbar */}
        <header
            className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black uppercase">Agent Performance Metrics</h2>
            </div>
            <div className="flex items-center gap-4">
                <select
                    className="bg-white border-2 border-neo-black px-3 py-1 text-xs font-bold uppercase shadow-sm cursor-pointer outline-none">
                    <option>Last 30 Days</option>
                    <option>Last 7 Days</option>
                    <option>Year to Date</option>
                </select>
            </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8 w-full flex-grow">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* KPI 1 */}
                <div className="neo-card bg-neo-yellow p-6 flex flex-col">
                    <span
                        className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 mb-2 inline-block">Total
                        Tasks Concluded</span>
                    <div className="text-5xl font-black mt-auto">1,482</div>
                    <div className="text-sm font-bold mt-2"><span
                            className="text-green-700 bg-green-200 px-1 border border-green-800">↗ 12%</span> vs last month
                    </div>
                </div>
                {/* KPI 2 */}
                <div className="neo-card bg-neo-pink text-white p-6 flex flex-col">
                    <span
                        className="text-xs font-black uppercase tracking-widest border-b-2 border-white pb-1 mb-2 inline-block">Avg
                        Time to Resolution</span>
                    <div className="text-5xl font-black mt-auto">2m 4s</div>
                    <div className="text-sm font-bold mt-2"><span className="bg-white text-neo-pink px-1 border border-white">↘
                            8s</span> faster avg</div>
                </div>
                {/* KPI 3 */}
                <div className="neo-card bg-neo-blue p-6 flex flex-col">
                    <span
                        className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 mb-2 inline-block">Tasks
                        Escalated</span>
                    <div className="text-5xl font-black mt-auto">45</div>
                    <div className="text-sm font-bold mt-2 text-gray-800">Requires human intervention</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Chart: Activity Over Time */}
                <div className="neo-card bg-white p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-xl uppercase">Workload Distribution</h3>
                        <span className="bg-neo-bg px-2 py-1 text-xs font-bold border border-black shadow-sm">By
                            Agent</span>
                    </div>

                    {/* CSS Bar Chart (Brutalist style) */}
                    <div
                        className="flex-grow flex items-end justify-between gap-2 h-64 border-b-4 border-l-4 border-neo-black pb-0 pl-2 pr-2 overflow-hidden relative">
                        {/* Y-axis lines */}
                        <div className="absolute w-full h-px bg-gray-200 bottom-[25%] -z-10"></div>
                        <div className="absolute w-full h-px bg-gray-200 bottom-[50%] -z-10"></div>
                        <div className="absolute w-full h-px bg-gray-200 bottom-[75%] -z-10"></div>

                        {/* Bars */}
                        <div className="w-12 bg-neo-lime border-3 border-neo-black shadow-[4px_0px_0px_#000] relative group bar-animate"
                            style={{-TargetH: "80%"}}>
                            <div
                                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 text-xs font-bold opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none">
                                Vector: 320</div>
                        </div>
                        <div className="w-12 bg-neo-yellow border-3 border-neo-black shadow-[4px_0px_0px_#000] relative group bar-animate"
                            style={{-TargetH: "65%"}}>
                            <div
                                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 text-xs font-bold opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none">
                                Researcher: 245</div>
                        </div>
                        <div className="w-12 bg-gray-300 border-3 border-neo-black shadow-[4px_0px_0px_#000] relative group bar-animate"
                            style={{-TargetH: "30%"}}>
                            <div
                                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 text-xs font-bold opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none">
                                CMO: 110</div>
                        </div>
                        <div className="w-12 bg-neo-pink border-3 border-neo-black shadow-[4px_0px_0px_#000] relative group bar-animate"
                            style={{-TargetH: "95%"}}>
                            <div
                                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 text-xs font-bold opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none">
                                Social: 450</div>
                        </div>
                        <div className="w-12 bg-neo-blue border-3 border-neo-black shadow-[4px_0px_0px_#000] relative group bar-animate"
                            style={{-TargetH: "40%"}}>
                            <div
                                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 text-xs font-bold opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none">
                                DevOps: 156</div>
                        </div>
                    </div>

                    {/* X-axis labels */}
                    <div className="flex justify-between mt-4 text-xs font-bold uppercase tracking-wider pl-4 pr-1">
                        <span className="w-12 text-center">VEC</span>
                        <span className="w-12 text-center">RES</span>
                        <span className="w-12 text-center">CMO</span>
                        <span className="w-12 text-center">SOC</span>
                        <span className="w-12 text-center">DEV</span>
                    </div>
                </div>

                {/* Leaderboard / Details */}
                <div className="neo-card bg-white flex flex-col">
                    <div
                        className="p-6 border-b-3 border-neo-black bg-neo-black text-white flex justify-between items-center">
                        <h3 className="font-black text-xl uppercase text-neo-lime">Efficiency Leaderboard</h3>
                    </div>
                    <div className="p-0 overflow-y-auto max-h-80">
                        <table className="w-full text-left font-medium">
                            <thead
                                className="bg-gray-100 text-xs uppercase font-black tracking-wider border-b-3 border-neo-black">
                                <tr>
                                    <th className="p-4 border-r-2 border-black">Agent Name</th>
                                    <th className="p-4 border-r-2 border-black text-center">Tasks</th>
                                    <th className="p-4 text-center">Success Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-gray-300">
                                <tr className="hover:bg-neo-lime/20 cursor-default">
                                    <td className="p-4 border-r-2 border-black font-black">Social Poster Droid</td>
                                    <td className="p-4 border-r-2 border-black text-center font-bold">450</td>
                                    <td className="p-4 text-center">
                                        <div className="inline-block bg-neo-lime px-2 py-1 neo-border font-bold text-xs">
                                            99.2%</div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-neo-lime/20 cursor-default">
                                    <td className="p-4 border-r-2 border-black font-black">Vector (Trading)</td>
                                    <td className="p-4 border-r-2 border-black text-center font-bold">320</td>
                                    <td className="p-4 text-center">
                                        <div className="inline-block bg-white px-2 py-1 neo-border font-bold text-xs">94.5%
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-neo-lime/20 cursor-default">
                                    <td className="p-4 border-r-2 border-black font-black">Researcher Bot</td>
                                    <td className="p-4 border-r-2 border-black text-center font-bold">245</td>
                                    <td className="p-4 text-center">
                                        <div className="inline-block bg-white px-2 py-1 neo-border font-bold text-xs">91.0%
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-neo-lime/20 cursor-default">
                                    <td className="p-4 border-r-2 border-black font-black">CMO Agent</td>
                                    <td className="p-4 border-r-2 border-black text-center font-bold">110</td>
                                    <td className="p-4 text-center">
                                        <div
                                            className="inline-block bg-neo-pink text-white px-2 py-1 neo-border font-bold text-xs">
                                            82.4%</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default Performance;
