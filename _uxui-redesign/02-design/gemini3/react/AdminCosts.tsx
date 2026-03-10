"use client";
import React from "react";
import { BarChart3, Building2, KeySquare, LayoutDashboard } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-900 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-rose-500/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-30%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[150px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-rose-500/5 blur-[120px]; }
            
            .glass-panel { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass rounded-2xl overflow-hidden transition-all duration-300; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-white bg-white/[0.08] shadow-[inset_2px_0_0_0_rgba(244,63,94,0.5)]; }
            
            .btn { @apply inline-flex items-center justify-center px-4 py-2 font-medium text-sm rounded-lg transition-all gap-2 cursor-pointer; }
            .btn-primary { @apply bg-gradient-accent text-white hover:shadow-glow hover:opacity-90; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            .num-bold { @apply font-semibold tracking-tight; }
        }
`;

function AdminCosts() {
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
                <a href="/admin/costs" className="nav-item active"><BarChart3 className="w-4 h-4" />
                    Global Costs</a>
                <a href="/admin/companies" className="nav-item"><Building2 className="w-4 h-4" /> Tenancy
                    / Companies</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><BarChart3
                        className="w-4 h-4 inline mr-2 text-rose-400" />LLM Inference & Infrastructure Costs</span>
            </div>
            <div className="flex gap-2 bg-dark-900 border border-white/10 rounded-lg p-1">
                <button className="px-3 py-1 rounded text-xs text-white bg-white/10 font-medium">MTD</button>
                <button className="px-3 py-1 rounded text-xs text-gray-500 hover:text-white transition-colors">Last
                    Month</button>
                <button className="px-3 py-1 rounded text-xs text-gray-500 hover:text-white transition-colors">YTD</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div
                        className="glass-panel p-6 border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-500/5 to-transparent">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">Total Inference
                            Cost</p>
                        <div className="flex items-end gap-3 mt-2">
                            <h3 className="text-3xl num-bold text-white">$14,204.50</h3>
                            <span className="text-sm text-rose-400 mb-1 flex items-center">+18%</span>
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">Total Tokens
                            (Billions)</p>
                        <div className="flex items-end gap-3 mt-2">
                            <h3 className="text-3xl num-bold text-white">4.2</h3>
                            <span className="text-sm text-gray-500 mb-1">M: 2.1 / C: 2.1</span>
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">Cost Per 1M
                            Tokens (Avg)</p>
                        <div className="flex items-end gap-3 mt-2">
                            <h3 className="text-3xl num-bold text-white">$3.38</h3>
                            <span className="text-sm text-emerald-400 mb-1">-2%</span>
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">Expected MRR
                            Margin</p>
                        <div className="flex items-end gap-3 mt-2">
                            <h3 className="text-3xl num-bold text-emerald-400">76%</h3>
                            <span className="text-sm text-gray-500 mb-1">Target: >70%</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Chart */}
                    <div className="lg:col-span-2 glass-panel p-6 flex flex-col">
                        <h3 className="text-sm font-medium text-white mb-6">Daily Spend by Model Provider</h3>
                        <div className="flex-1 relative min-h-[300px]">
                            <canvas id="costChart"></canvas>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="glass-panel p-6">
                        <h3 className="text-sm font-medium text-white mb-6">Cost by Top Tenants</h3>
                        <div className="space-y-4">

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-white font-medium">Enterprise Corp</span>
                                    <span className="text-sm text-rose-400 font-mono">$4,250</span>
                                </div>
                                <div className="w-full h-1.5 bg-dark-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500" style={{width: "100%"}}></div>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">Plan: Unlimited (Uncapped AI) - Review pricing
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-300">Nexus Dynamics</span>
                                    <span className="text-sm text-white font-mono">$1,820</span>
                                </div>
                                <div className="w-full h-1.5 bg-dark-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-purple" style={{width: "45%"}}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-300">Global Tech Inc.</span>
                                    <span className="text-sm text-white font-mono">$1,104</span>
                                </div>
                                <div className="w-full h-1.5 bg-dark-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-cyan" style={{width: "28%"}}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-400">Solaris Startups</span>
                                    <span className="text-sm text-gray-400 font-mono">$420</span>
                                </div>
                                <div className="w-full h-1.5 bg-dark-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-gray-500" style={{width: "10%"}}></div>
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

export default AdminCosts;
