"use client";
import React from "react";
import { Activity, BarChart3, Building2, Cpu, Database, KeySquare, LayoutDashboard, Network, Shield, Terminal, Zap } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-900 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-emerald-500/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-30%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[150px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px]; }
            
            .glass-panel { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass rounded-2xl overflow-hidden transition-all duration-300; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-white bg-white/[0.08] shadow-[inset_2px_0_0_0_rgba(52,211,153,0.5)]; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            .num-bold { @apply font-semibold tracking-tight; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            
            /* Pulse animation for live indicators */
            @keyframes pulse-ring {
                0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
                70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(52, 211, 153, 0); }
                100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
            }
            .live-dot { animation: pulse-ring 2s infinite; }
        }
`;

function AdminMonitoring() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<div className="bg-ambient"></div>

    <aside className="w-64 border-r border-white/[0.08] bg-dark-400/80 backdrop-blur-xl flex flex-col h-full z-20 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/[0.05]">
            <h1 className="text-xl font-bold tracking-wider text-gradient">CORTHEX</h1>
            <span
                className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">ADMIN</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-4 space-y-8">
            <div className="space-y-1">
                <a href="/admin/dashboard" className="nav-item"><LayoutDashboard className="w-4 h-4" />
                    Global Dashboard</a>
            </div>

            <div className="space-y-1">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Platform
                    Administration</p>
                <a href="/admin/api-keys" className="nav-item"><KeySquare className="w-4 h-4" /> Platform
                    API Keys</a>
                <a href="/admin/costs" className="nav-item"><BarChart3 className="w-4 h-4" /> Global
                    Costs</a>
                <a href="/admin/monitoring" className="nav-item active"><Activity className="w-4 h-4" />
                    System Monitoring</a>
                <a href="/admin/companies" className="nav-item"><Building2 className="w-4 h-4" /> Tenancy
                    / Companies</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><Activity
                        className="w-4 h-4 inline mr-2 text-emerald-400" />Platform Observability</span>
            </div>
            <div className="flex items-center gap-3">
                <div
                    className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 live-dot"></div>
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Live
                        Telemetry</span>
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Real-time Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div
                        className="glass-panel p-6 border-b-2 border-emerald-500 bg-gradient-to-t from-emerald-500/5 to-transparent">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">Active Agent
                            Pods</p>
                        <div className="flex items-end gap-3 mt-2">
                            <h3 className="text-4xl num-bold text-white font-mono">1,482</h3>
                        </div>
                    </div>

                    <div
                        className="glass-panel p-6 border-b-2 border-blue-500 bg-gradient-to-t from-blue-500/5 to-transparent">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">Queued Tasks
                        </p>
                        <div className="flex items-end gap-3 mt-2">
                            <h3 className="text-4xl num-bold text-white font-mono">14</h3>
                            <span className="text-sm text-gray-500 mb-1 font-mono">Max Wait: 1.2s</span>
                        </div>
                    </div>

                    <div
                        className="glass-panel p-6 border-b-2 border-emerald-500 bg-gradient-to-t from-emerald-500/5 to-transparent">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">API Latency
                            (p95)</p>
                        <div className="flex items-end gap-3 mt-2">
                            <h3 className="text-4xl num-bold text-white font-mono">142<span
                                    className="text-xl text-gray-500 ml-1">ms</span></h3>
                        </div>
                    </div>

                    <div
                        className="glass-panel p-6 border-b-2 border-emerald-500 bg-gradient-to-t from-emerald-500/5 to-transparent">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">Database Load
                        </p>
                        <div className="flex items-end gap-3 mt-2">
                            <h3 className="text-4xl num-bold text-white font-mono">34<span
                                    className="text-xl text-gray-500 ml-1">%</span></h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* System Health Log */}
                    <div className="lg:col-span-2 glass-panel flex flex-col h-[500px]">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-dark-300/30">
                            <h3 className="text-sm font-medium text-white">Live System Event Stream</h3>
                            <Terminal className="w-4 h-4 text-gray-500" />
                        </div>
                        <div
                            className="flex-1 overflow-y-auto p-4 scrollbar-hide font-mono text-xs space-y-2 bg-dark-900/80">
                            <div className="flex gap-4">
                                <span className="text-gray-500">14:52:01.442</span>
                                <span className="text-blue-400">[INFO]</span>
                                <span className="text-gray-300">Tenant tn_globaltech_001 scaling up worker node (Region:
                                    us-east-1)</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-gray-500">14:51:58.109</span>
                                <span className="text-emerald-400">[OK]</span>
                                <span className="text-gray-300">LLM Provider Anthropic API rate limit check passed
                                    (Utilization: 42%)</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-gray-500">14:51:45.992</span>
                                <span className="text-amber-400">[WARN]</span>
                                <span className="text-gray-300">High memory pressure on Agent Pod [dept_eng_02_bot_1] (Mem:
                                    88%)</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-gray-500">14:51:30.221</span>
                                <span className="text-emerald-400">[OK]</span>
                                <span className="text-gray-300">Postgres DB Replica-2 synced successfully. Lag: 0.04s</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-gray-500">14:51:10.005</span>
                                <span className="text-blue-400">[INFO]</span>
                                <span className="text-gray-300">Webhook received from Stripe: payment.succeeded
                                    (tn_solaris_891)</span>
                            </div>
                            <div className="flex gap-4 opacity-50">
                                <span className="text-gray-500">14:50:00.000</span>
                                <span className="text-gray-400">[SYS]</span>
                                <span className="text-gray-300">Hourly cron runner initialized. Sweeping orphaned DB
                                    sessions.</span>
                            </div>
                        </div>
                        <div
                            className="p-2 border-t border-white/5 text-center text-gray-500 text-[10px] font-mono hover:text-white cursor-pointer transition-colors bg-dark-800">
                            Pause Stream
                        </div>
                    </div>

                    {/* Microservices Status */}
                    <div className="glass-panel p-6">
                        <h3 className="text-sm font-medium text-white mb-6">Service Health</h3>
                        <div className="space-y-4">

                            <div
                                className="flex justify-between items-center p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                                <div className="flex items-center gap-3">
                                    <Cpu className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm text-gray-200">Core Inference Router</span>
                                </div>
                                <span className="text-[10px] text-emerald-400 font-mono">UP</span>
                            </div>

                            <div
                                className="flex justify-between items-center p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                                <div className="flex items-center gap-3">
                                    <Database className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm text-gray-200">Vector Search Engine</span>
                                </div>
                                <span className="text-[10px] text-emerald-400 font-mono">UP (12ms)</span>
                            </div>

                            <div
                                className="flex justify-between items-center p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                                <div className="flex items-center gap-3">
                                    <Network className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm text-gray-200">WebSocket Dispatcher</span>
                                </div>
                                <span className="text-[10px] text-emerald-400 font-mono">UP (22k conn)</span>
                            </div>

                            <div
                                className="flex justify-between items-center p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm text-gray-200">Background Worker Queue</span>
                                </div>
                                <span className="text-[10px] text-amber-500 font-mono">DEGRADED</span>
                            </div>

                            <div
                                className="flex justify-between items-center p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm text-gray-200">Auth & Identity Auth0</span>
                                </div>
                                <span className="text-[10px] text-emerald-400 font-mono">UP</span>
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

export default AdminMonitoring;
