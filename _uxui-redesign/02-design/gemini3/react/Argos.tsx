"use client";
import React from "react";
import { Activity, ActivitySquare, ArrowLeft, Calculator, Eye, Gauge, Lock, Radio, RefreshCcw, Search, ShieldAlert, ShieldBan, Siren } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-400 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-rose-500/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-rose-500/5 blur-[120px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-500/5 blur-[120px]; }
            
            .glass-panel { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass rounded-2xl overflow-hidden transition-all duration-300; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-white bg-white/[0.08] shadow-[inset_2px_0_0_0_rgba(168,85,247,1)]; }
            
            .btn { @apply inline-flex items-center justify-center px-4 py-2 font-medium text-sm rounded-lg transition-all gap-2 cursor-pointer; }
            .btn-secondary { @apply bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1]; }
            .btn-icon { @apply p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.1]; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            
            .alert-critical { @apply border-rose-500/50 bg-rose-500/10; }
            .alert-warning { @apply border-amber-500/30 bg-amber-500/5; }
            .alert-info { @apply border-blue-500/30 bg-blue-500/5; }
        }
`;

function Argos() {
  return (
    <>{"
"}
      <style dangerouslySetInnerHTML={{__html: styles}} />
<div className="bg-ambient"></div>

    <aside className="w-64 border-r border-white/[0.08] bg-dark-300/50 backdrop-blur-xl flex flex-col h-full z-20 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/[0.05]">
            <h1 className="text-xl font-bold tracking-wider text-rose-400">ARGOS</h1>
            <span
                className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/20 text-rose-300">PANOPTES</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-4 space-y-8">
            <div className="space-y-1">
                <a href="/app/home" className="nav-item"><ArrowLeft className="w-4 h-4" /> Back to Home</a>
            </div>

            <div className="space-y-1">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Systems</p>
                <a href="/app/activity-log" className="nav-item"><ActivitySquare className="w-4 h-4" />
                    Activity Log</a>
                <a href="/app/costs" className="nav-item"><Calculator className="w-4 h-4" /> Resource
                    Costs</a>
                <a href="/app/performance" className="nav-item"><Gauge className="w-4 h-4" /> Performance
                    Metrics</a>
                <a href="/app/argos"
                    className="nav-item active text-rose-400 bg-rose-500/10 shadow-none hover:bg-rose-500/20 hover:text-rose-300"><Eye className="w-4 h-4" /> Argos Monitor</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-400/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><ShieldAlert
                        className="w-4 h-4 inline mr-2 text-rose-500" />Security & Anomaly Detection</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <span className="text-xs text-rose-400 font-medium tracking-wide">DEFCON 4</span>
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide flex gap-8">

            {/* Events Feed (API: GET /api/workspace/argos/alerts) */}
            <div className="flex-1 glass-panel flex flex-col">
                <div className="p-4 border-b border-white/5 flex gap-2 justify-between items-center bg-dark-300/30">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2"><Radio
                            className="w-4 h-4 text-rose-400" /> Real-time Intercepts</h3>
                    <div className="flex gap-2">
                        <button
                            className="btn btn-secondary text-[10px] py-1 px-2 border-rose-500/30 hover:bg-rose-500/10 text-rose-300">Clear
                            Resolved</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">

                    {/* Critical Alert */}
                    <div
                        className="p-4 rounded-xl border alert-critical shadow-[0_0_15px_rgba(244,63,94,0.1)] relative overflow-hidden group">
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <Siren className="w-5 h-5 text-rose-500" />
                                <h4 className="text-sm font-bold text-white tracking-wide">API Key Exposure Risk detected
                                </h4>
                            </div>
                            <span className="text-[10px] font-mono text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">Just
                                Now</span>
                        </div>
                        <p className="text-xs text-rose-200/80 font-mono mb-3">Target: <span
                                className="bg-dark-900 border border-white/10 px-1 rounded">Agent
                                DataScraper</span><br />Issue: Detected raw string matching AWS Access Key format in
                            prompt completion output.</p>
                        <div className="flex gap-2">
                            <button
                                className="btn border border-rose-500 bg-rose-500 text-white hover:bg-rose-600 text-xs py-1.5"><Lock className="w-3 h-3" /> Revoke Token</button>
                            <button className="btn btn-secondary text-xs py-1.5"><Search
                                    className="w-3 h-3" /> Audit Logs</button>
                            <span className="ml-auto text-[10px] text-gray-500 self-end">ID: ARG-9912X</span>
                        </div>
                    </div>

                    {/* Warning Alert */}
                    <div className="p-4 rounded-xl border alert-warning">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-amber-500" />
                                <h4 className="text-sm font-bold text-white tracking-wide">Anomalous API Traffic Spike</h4>
                            </div>
                            <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">12m
                                ago</span>
                        </div>
                        <p className="text-xs text-gray-300 font-mono mb-3">Source IP: <span
                                className="text-amber-400 opacity-80">192.168.1.104</span><br />Details: 500% increase in
                            requests to /api/workspace/knowledge/search over 5m window.</p>
                        <div className="flex gap-2">
                            <button
                                className="btn border border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs py-1.5 border-dashed"><ShieldBan className="w-3 h-3" /> Block IP</button>
                            <span className="ml-auto text-[10px] text-gray-500 self-end">ID: ARG-9911X</span>
                        </div>
                    </div>

                    {/* Info Event */}
                    <div className="p-4 rounded-xl border alert-info opacity-70 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <RefreshCcw className="w-4 h-4 text-blue-400" />
                                <h4 className="text-xs font-semibold text-gray-300 tracking-wide">Automated Rotation
                                    Complete</h4>
                            </div>
                            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">1h
                                ago</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono">System rotated 3 external OAuth refresh tokens
                            successfully.</p>
                    </div>

                </div>
            </div>

            {/* Threat Intelligence Sidebar */}
            <div className="w-80 shrink-0 flex flex-col gap-6">

                <div className="glass-panel p-5 border-rose-500/20">
                    <h3
                        className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-4 border-b border-rose-500/20 pb-2">
                        Threat Intelligence Matrix</h3>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Prompt Injection Attempts</span>
                                <span className="text-white">12</span>
                            </div>
                            <div className="w-full h-1 bg-dark-200 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{width: "15%"}}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Data Exfiltration Risk</span>
                                <span className="text-rose-400">High</span>
                            </div>
                            <div className="w-full h-1 bg-dark-200 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500" style={{width: "85%"}}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Unauthorized Tool Calls</span>
                                <span className="text-emerald-400">0</span>
                            </div>
                            <div className="w-full h-1 bg-dark-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{width: "5%"}}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-5 bg-dark-900 border-white/5">
                    <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-3">>_ WATCHDOG PROCESSES
                    </h3>
                    <div className="font-mono text-[10px] space-y-2">
                        <div className="flex justify-between text-emerald-400"><span>[OK] payload_analyzer</span><span>pid:
                                4012</span></div>
                        <div className="flex justify-between text-emerald-400"><span>[OK] token_masker</span><span>pid:
                                4015</span></div>
                        <div className="flex justify-between text-amber-500"><span>[WARN]
                                rbac_validator</span><span>latency_spike</span></div>
                        <div className="flex justify-between text-emerald-400"><span>[OK] fw_ingress</span><span>pid:
                                4022</span></div>
                    </div>
                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default Argos;
