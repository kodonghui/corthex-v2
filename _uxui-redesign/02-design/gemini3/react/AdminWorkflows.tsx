"use client";
import React from "react";
import { Activity, BarChart3, CreditCard, Database, GitMerge, History, KeySquare, LayoutDashboard, Loader, Plus } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-900 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-accent-cyan/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-30%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[150px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px]; }
            
            .glass-panel { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass rounded-2xl overflow-hidden transition-all duration-300; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-white bg-white/[0.08] shadow-[inset_2px_0_0_0_rgba(34,211,238,1)]; }
            
            .btn { @apply inline-flex items-center justify-center px-4 py-2 font-medium text-sm rounded-lg transition-all gap-2 cursor-pointer; }
            .btn-primary { @apply bg-gradient-accent text-white hover:shadow-glow hover:opacity-90; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            
            .workflow-node { @apply p-4 rounded-xl border border-white/10 bg-dark-300/80 shadow-glass flex flex-col relative z-10; }
            .workflow-line { @apply absolute border-dashed border-white/20 z-0; }
        }
`;

function AdminWorkflows() {
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
                <a href="/admin/monitoring" className="nav-item"><Activity className="w-4 h-4" /> System
                    Monitoring</a>
                <a href="/admin/workflows" className="nav-item active"><GitMerge className="w-4 h-4" />
                    System Workflows</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><GitMerge
                        className="w-4 h-4 inline mr-2 text-accent-cyan" />Platform Automation Tasks</span>
            </div>
            <div className="flex items-center gap-3">
                <button className="btn btn-primary text-xs py-1.5"><Plus className="w-3 h-3" /> New Cron
                    Job</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">

            <div className="max-w-6xl mx-auto space-y-6">
                <h2 className="text-xl font-medium text-white mb-2">Global System Hooks</h2>
                <p className="text-sm text-gray-400 mb-8 max-w-2xl">Manage background orchestrations, billing syncs, and
                    platform-wide data pipelines that execute automatically.</p>

                {/* API: GET /api/admin/workflows */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Workflow 1: Billing Sync */}
                    <div
                        className="glass-panel p-6 border-t-2 border-accent-purple group hover:border-white/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex-center text-accent-purple">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-white">Stripe Ledger Sync</h3>
                                    <span className="text-[10px] text-gray-500 font-mono">cron: 0 * * * * (Hourly)</span>
                                </div>
                            </div>
                            <span
                                className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] border border-emerald-500/20 flex items-center gap-1 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> IDLE
                            </span>
                        </div>

                        <p className="text-xs text-gray-400 line-clamp-2 mb-6 h-8">Rolls up LLM token usage across all
                            tenants and pushes metered billing events to Stripe.</p>

                        <div className="bg-dark-900/50 rounded-lg p-3 border border-white/5 font-mono text-[10px] mb-4">
                            <div className="flex justify-between text-gray-500">
                                <span>Last Run:</span>
                                <span className="text-gray-300">Today at 14:00 (Success)</span>
                            </div>
                            <div className="flex justify-between text-gray-500 mt-1">
                                <span>Avg Duration:</span>
                                <span className="text-gray-300">4.2s</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <button
                                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"><History className="w-3 h-3" /> View Logs</button>
                            <button
                                className="text-xs font-medium text-white hover:text-accent-purple transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded">Run
                                Now</button>
                        </div>
                    </div>

                    {/* Workflow 2: Vector DB Cleanup */}
                    <div
                        className="glass-panel p-6 border-t-2 border-emerald-500 group hover:border-white/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-center text-emerald-400">
                                    <Database className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-white">Vector DB Orphan Cleanup</h3>
                                    <span className="text-[10px] text-gray-500 font-mono">cron: 0 0 * * 0 (Weekly)</span>
                                </div>
                            </div>
                            <span
                                className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] border border-blue-500/20 flex items-center gap-1 font-bold">
                                <Loader className="w-3 h-3 animate-spin" /> RUNNING
                            </span>
                        </div>

                        <p className="text-xs text-gray-400 line-clamp-2 mb-6 h-8">Scans Pinecone vector indices for
                            orphaned document chunks related to deleted tenant files.</p>

                        <div className="bg-dark-900/50 rounded-lg p-3 border border-white/5 font-mono text-[10px] mb-4">
                            <div className="flex justify-between text-gray-500">
                                <span>Current Run:</span>
                                <span className="text-blue-400 animate-pulse">45m 12s elapsed</span>
                            </div>
                            <div className="w-full bg-dark-300 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full" style={{width: "78%"}}></div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <button
                                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"><History className="w-3 h-3" /> View Logs</button>
                            <button
                                className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/5 hover:bg-rose-500/10 px-3 py-1.5 rounded">Terminate</button>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    </main>
    </>
  );
}

export default AdminWorkflows;
