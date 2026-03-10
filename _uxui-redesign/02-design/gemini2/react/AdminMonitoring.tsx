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
            background-color: #00E5FF;
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

        .admin-bg {
            background-image:
                linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
            background-size: 40px 40px;
        }

        .pulse-green {
            animation: pulse-green 2s infinite;
        }

        @keyframes pulse-green {
            0% {
                box-shadow: 0 0 0 0 rgba(0, 204, 102, 0.7);
            }

            70% {
                box-shadow: 0 0 0 10px rgba(0, 204, 102, 0);
            }

            100% {
                box-shadow: 0 0 0 0 rgba(0, 204, 102, 0);
            }
        }
`;

function AdminMonitoring() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<header
        className="h-16 border-b-3 border-neo-black bg-white flex items-center justify-between px-6 z-30 shrink-0 sticky top-0 shadow-[0px_4px_0px_#1E1E1E]">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black tracking-tight uppercase flex items-center gap-2">
                <span className="bg-neo-pink text-white px-2 border-2 border-black rotate-[-2deg] shadow-sm">CORTHEX</span>
                ADMIN
            </h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-xs font-black uppercase flex items-center gap-2 bg-white px-3 py-1 neo-border">
                <div className="w-2 h-2 rounded-full bg-neo-green pulse-green"></div>
                All Systems Operational
            </div>
        </div>
    </header>

    <div className="flex h-[calc(100vh-4rem)]">

        <nav className="w-64 border-r-3 border-neo-black bg-white flex flex-col h-full z-10 shrink-0 overflow-y-auto">
            <div className="p-4 space-y-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-2 mb-1 pl-2">System Config
                </p>
                <a href="/admin/settings"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">⚙️ Platform
                    Settings</a>
                <a href="/admin/monitoring"
                    className="nav-item active flex items-center gap-3 p-2 font-bold transition-colors text-sm">📈 System
                    Monitoring</a>
                <a href="/admin/onboarding"
                    className="nav-item flex items-center gap-3 p-2 font-bold transition-colors text-sm">🚀 Tenant
                    Onboarding</a>
            </div>
        </nav>

        <main className="flex-grow flex flex-col h-full bg-transparent overflow-y-auto w-full p-8 relative z-0">
            <div className="max-w-7xl mx-auto w-full space-y-6">

                <div
                    className="flex justify-between items-center bg-white p-6 border-3 border-neo-black shadow-[8px_8px_0px_#1E1E1E]">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tight text-neo-blue">Telemetry & Traffic
                            Control</h2>
                        <p className="font-bold text-gray-600 mt-1 text-sm">Live views of system health, LLM API latencies,
                            and active agent compute instances.</p>
                    </div>
                </div>

                {/* Live Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="neo-card p-4 bg-white border-l-8 border-neo-lime h-28 flex flex-col justify-center">
                        <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Active DB Connections</div>
                        <div className="text-3xl font-black">2,405</div>
                        <div className="text-xs font-bold text-neo-lime mt-1">14% Utilization</div>
                    </div>
                    <div className="neo-card p-4 bg-white border-l-8 border-neo-blue h-28 flex flex-col justify-center">
                        <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Active Compute Agents</div>
                        <div className="text-3xl font-black">18,992</div>
                        <div className="text-xs font-bold text-gray-500 mt-1">Across 42 Tenants</div>
                    </div>
                    <div className="neo-card p-4 bg-white border-l-8 border-neo-pink h-28 flex flex-col justify-center">
                        <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Queue Backlog (Jobs)</div>
                        <div className="text-3xl font-black text-neo-pink">14</div>
                        <div className="text-xs font-bold text-gray-500 mt-1">Processing normally</div>
                    </div>
                    <div className="neo-card p-4 bg-black text-white h-28 flex flex-col justify-center">
                        <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Anthropic API Latency (Avg)
                        </div>
                        <div className="text-3xl font-black text-neo-lime">450ms</div>
                        <div className="text-xs font-bold text-gray-400 mt-1">Status: Healthy</div>
                    </div>
                </div>

                {/* API: GET /api/admin/monitoring/traffic */}
                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Traffic Chart */}
                    <div className="neo-card bg-white p-4">
                        <h3 className="font-black text-sm uppercase mb-4 border-b-2 border-black pb-1">Incoming Request
                            Traffic (Req/s)</h3>
                        <div className="h-48 w-full bg-neo-bg border-2 border-black p-2 relative">
                            <canvas id="trafficChart"></canvas>
                        </div>
                    </div>

                    {/* Error Rates */}
                    <div className="neo-card bg-white p-4">
                        <h3 className="font-black text-sm uppercase mb-4 border-b-2 border-black pb-1">API Error Rates (5xx
                            / 4xx)</h3>
                        <div className="h-48 w-full bg-neo-bg border-2 border-black p-2 relative">
                            <canvas id="errorChart"></canvas>
                        </div>
                    </div>

                </div>

                {/* Slowest Endpoints / Anomalies */}
                <div className="neo-card bg-white p-0">
                    <div className="p-4 border-b-3 border-neo-black bg-gray-100 flex justify-between items-center">
                        <h3 className="font-black text-lg uppercase">Anomalies & Bottlenecks</h3>
                        <span className="text-xs font-bold px-2 py-1 bg-white border border-black">Last 1 Hour</span>
                    </div>

                    <table className="w-full text-left font-medium border-collapse">
                        <thead
                            className="bg-gray-50 text-[10px] uppercase font-black tracking-widest border-b-3 border-neo-black">
                            <tr>
                                <th className="p-3 border-r-2 border-black">Endpoint / Service</th>
                                <th className="p-3 border-r-2 border-black text-center">Avg Latency</th>
                                <th className="p-3 border-r-2 border-black text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-gray-200">
                            <tr className="hover:bg-neo-blue/10 bg-neo-yellow/20">
                                <td className="p-3 border-r-2 border-black font-mono text-sm max-w-md truncate">POST
                                    /api/v1/agents/reasoning</td>
                                <td className="p-3 border-r-2 border-black text-center text-neo-orange font-black">2.4s</td>
                                <td className="p-3 text-center">
                                    <button
                                        className="bg-white border-2 border-black px-2 py-1 text-[10px] font-black uppercase hover:bg-black hover:text-white">Trace</button>
                                </td>
                            </tr>
                            <tr className="hover:bg-neo-blue/10">
                                <td className="p-3 border-r-2 border-black font-mono text-sm max-w-md truncate">GET
                                    /api/v1/workspaces/sync</td>
                                <td className="p-3 border-r-2 border-black text-center font-bold">1.2s</td>
                                <td className="p-3 text-center">
                                    <button
                                        className="bg-white border-2 border-black px-2 py-1 text-[10px] font-black uppercase hover:bg-black hover:text-white">Trace</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </main>
    </div>
    </>
  );
}

export default AdminMonitoring;
