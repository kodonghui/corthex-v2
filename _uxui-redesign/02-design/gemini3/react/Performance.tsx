"use client";
import React from "react";
import { ActivitySquare, Calculator, Database, Eye, Gauge, Home, LayoutDashboard, Server, Terminal } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-400 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-accent-purple/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-purple/10 blur-[120px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-cyan/10 blur-[120px]; }
            
            .glass-panel { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass rounded-2xl overflow-hidden transition-all duration-300; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-white bg-white/[0.08] shadow-[inset_2px_0_0_0_rgba(168,85,247,1)]; }
            
            .btn { @apply inline-flex items-center justify-center px-4 py-2 font-medium text-sm rounded-lg transition-all gap-2 cursor-pointer; }
            .btn-primary { @apply bg-gradient-accent text-white hover:shadow-glow hover:opacity-90; }
            .btn-secondary { @apply bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1]; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            .num-bold { @apply font-semibold tracking-tight; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        }
`;

function Performance() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<div className="bg-ambient"></div>

    <aside className="w-64 border-r border-white/[0.08] bg-dark-300/50 backdrop-blur-xl flex flex-col h-full z-20 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/[0.05]">
            <h1 className="text-xl font-bold tracking-wider text-gradient">CORTHEX</h1>
            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-gray-300">v2</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-4 space-y-8">
            <div className="space-y-1">
                <a href="/app/home" className="nav-item"><Home className="w-4 h-4" /> Home</a>
                <a href="/app/command-center" className="nav-item"><Terminal className="w-4 h-4" /> Command
                    Center</a>
                <a href="/app/dashboard" className="nav-item"><LayoutDashboard className="w-4 h-4" />
                    Dashboard</a>
            </div>

            <div className="space-y-1">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Systems</p>
                <a href="/app/activity-log" className="nav-item"><ActivitySquare className="w-4 h-4" />
                    Activity Log</a>
                <a href="/app/costs" className="nav-item"><Calculator className="w-4 h-4" /> Resource
                    Costs</a>
                <a href="/app/performance" className="nav-item active"><Gauge className="w-4 h-4" />
                    Performance Metrics</a>
                <a href="/app/argos" className="nav-item"><Eye className="w-4 h-4" /> Argos Monitor</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-400/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><Gauge
                        className="w-4 h-4 inline mr-2 text-emerald-400" />System Performance</span>
                <span
                    className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">All
                    Systems Operational</span>
            </div>
            <div className="flex items-center gap-3">
                <select
                    className="bg-dark-300/80 border border-white/10 text-xs px-3 py-1.5 rounded-lg text-white appearance-none pr-8 cursor-pointer focus:outline-none focus:border-accent-purple/50">
                    <option>Last 1 Hour</option>
                    <option>Last 24 Hours</option>
                    <option>Last 7 Days</option>
                </select>
                <div
                    className="text-[10px] text-gray-500 flex items-center gap-2 border border-white/10 px-3 py-1.5 rounded-lg bg-dark-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* KPI Gauges (API: GET /api/workspace/performance/metrics) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="glass-panel p-5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">API Latency
                            (p95)</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl num-bold text-white">124<span
                                    className="text-sm font-normal text-gray-500 ml-1">ms</span></h3>
                        </div>
                        <div className="w-full h-1 bg-dark-200 rounded-full overflow-hidden mt-3">
                            <div className="h-full bg-emerald-400 rounded-full" style={{width: "25%"}}></div>
                        </div>
                    </div>

                    <div className="glass-panel p-5">
                        <p
                            className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-semibold flex justify-between">
                            LLM Response <span className="text-amber-400">Avg</span></p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl num-bold text-white">2.4<span
                                    className="text-sm font-normal text-gray-500 ml-1">s</span></h3>
                        </div>
                        <div className="w-full h-1 bg-dark-200 rounded-full overflow-hidden mt-3">
                            <div className="h-full bg-amber-400 rounded-full" style={{width: "45%"}}></div>
                        </div>
                    </div>

                    <div className="glass-panel p-5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">Worker CPU Load
                        </p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl num-bold text-white">42<span
                                    className="text-sm font-normal text-gray-500 ml-1">%</span></h3>
                        </div>
                        <div className="w-full h-1 bg-dark-200 rounded-full overflow-hidden mt-3">
                            <div className="h-full bg-blue-400 rounded-full" style={{width: "42%"}}></div>
                        </div>
                    </div>

                    <div className="glass-panel p-5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">Memory Usage
                        </p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl num-bold text-white">12.4<span
                                    className="text-sm font-normal text-gray-500 ml-1">GB</span></h3>
                        </div>
                        <div className="w-full h-1 bg-dark-200 rounded-full overflow-hidden mt-3">
                            <div className="h-full bg-accent-purple rounded-full" style={{width: "78%"}}></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Event Loop Latency Chart */}
                    <div className="col-span-2 glass-panel p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-medium text-white">Gateway Requests & Latency</h3>
                            <div className="flex items-center gap-3 text-[10px]">
                                <span className="flex items-center gap-1 text-gray-400"><span
                                        className="w-2 h-2 rounded-full bg-emerald-400"></span> Requests/sec</span>
                                <span className="flex items-center gap-1 text-gray-400"><span
                                        className="w-2 h-2 rounded-full bg-rose-400"></span> Latency (ms)</span>
                            </div>
                        </div>
                        <div className="w-full h-64 relative">
                            <canvas id="latencyChart"></canvas>
                        </div>
                    </div>

                    {/* Local Worker Nodes */}
                    <div className="glass-panel p-6 flex flex-col">
                        <h3 className="text-sm font-medium text-white mb-6">Executor Nodes</h3>

                        <div className="space-y-4">
                            {/* Node 1 */}
                            <div className="p-3 bg-dark-300/50 rounded-lg border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <Server className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs text-white font-medium">Worker-Alpha</span>
                                    </div>
                                    <span className="text-[10px] text-emerald-400">Healthy</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                    <span>CPU: 45%</span>
                                    <span>RAM: 4.2GB</span>
                                </div>
                                <div className="w-full h-1 bg-dark-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400" style={{width: "45%"}}></div>
                                </div>
                            </div>

                            {/* Node 2 */}
                            <div className="p-3 bg-dark-300/50 rounded-lg border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <Server className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs text-white font-medium">Worker-Beta</span>
                                    </div>
                                    <span className="text-[10px] text-amber-400">High Load</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                    <span>CPU: 88%</span>
                                    <span>RAM: 6.8GB</span>
                                </div>
                                <div className="w-full h-1 bg-dark-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400" style={{width: "88%"}}></div>
                                </div>
                            </div>

                            {/* DB Node */}
                            <div className="p-3 bg-dark-300/50 rounded-lg border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <Database className="w-4 h-4 text-accent-purple" />
                                        <span className="text-xs text-white font-medium">VectorDB Primary</span>
                                    </div>
                                    <span className="text-[10px] text-emerald-400">Healthy</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                    <span>IOPS: 420</span>
                                    <span>Storage: 62%</span>
                                </div>
                                <div className="w-full h-1 bg-dark-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-purple" style={{width: "62%"}}></div>
                                </div>
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

export default Performance;
