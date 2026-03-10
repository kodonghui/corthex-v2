"use client";
import React from "react";
import { Activity, Bot, Crown, Download, Focus, GitMerge, LayoutDashboard, Network, Presentation, Terminal, Users, Wrench, ZoomIn, ZoomOut } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-900 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-accent-cyan/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-30%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[150px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-cyan/10 blur-[120px]; }
            
            .glass-panel { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass rounded-2xl overflow-hidden transition-all duration-300; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-white bg-white/[0.08] shadow-[inset_2px_0_0_0_rgba(34,211,238,1)]; }
            
            .btn { @apply inline-flex items-center justify-center px-4 py-2 font-medium text-sm rounded-lg transition-all gap-2 cursor-pointer; }
            .btn-secondary { @apply bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1]; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

            /* Org Tree Lines */
            .tree-node { @apply relative flex flex-col items-center; }
            .tree-node::before { content:''; @apply absolute top-[-20px] left-1/2 w-px h-[20px] bg-white/20 -translate-x-1/2; }
            .tree-root::before { display: none; }
            
            .tree-children { @apply relative flex gap-8 pt-5 mt-5 border-t border-white/20; }
            .tree-children::before { content:''; @apply absolute top-0 left-1/2 w-px h-5 bg-white/20 -translate-x-1/2; }
        }
`;

function AdminOrgChart() {
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
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Platform</p>
                <a href="/admin/agents" className="nav-item"><Bot className="w-4 h-4" /> Agent
                    Registry</a>
                <a href="/admin/departments" className="nav-item"><Network className="w-4 h-4" />
                    Departments</a>
                <a href="/admin/employees" className="nav-item"><Users className="w-4 h-4" />
                    Employees</a>
                <a href="/admin/org-chart" className="nav-item active"><GitMerge className="w-4 h-4" />
                    Org Chart View</a>
            </div>

            <div className="space-y-1">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Capabilities</p>
                <a href="/admin/tools" className="nav-item"><Wrench className="w-4 h-4" /> Tool
                    Integrations</a>
            </div>
        </div>
    </aside>

    <main
        className="flex-1 flex flex-col h-full relative z-10 overflow-hidden bg-[radial-gradient(#ffffff11_1px,transparent_1px)] [background-size:24px_24px]">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/80 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><GitMerge
                        className="w-4 h-4 inline mr-2 text-blue-400" />Organization Hierarchy Map</span>
            </div>
            <div className="flex items-center gap-3">
                <select
                    className="bg-dark-200/50 border border-white/10 text-xs px-3 py-1.5 rounded-lg text-white appearance-none pr-8 cursor-pointer focus:outline-none focus:border-accent-cyan/50">
                    <option>Global Tech Inc.</option>
                    <option>Nexus Dynamics</option>
                </select>
                <button className="btn btn-secondary text-xs py-1.5"><Download className="w-3 h-3" /> Export
                    Chart</button>
            </div>
        </header>

        <div className="flex-1 overflow-auto p-12 scrollbar-hide flex items-center justify-center min-w-max min-h-max">

            {/* Root Chart Tree (API: GET /api/admin/org-chart) */}
            <div className="flex flex-col items-center select-none pt-20">

                {/* Root Level */}
                <div className="tree-node tree-root group cursor-pointer">
                    <div className="glass-panel p-4 flex flex-col items-center w-56 hover:border-accent-purple/50">
                        <div
                            className="w-12 h-12 rounded-full bg-gradient-accent flex-center text-white mb-2 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                            <Crown className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-0.5">Alice Doe</h3>
                        <p className="text-[10px] text-accent-cyan uppercase tracking-wider font-mono">Chief Executive
                            Officer</p>
                    </div>
                </div>

                {/* Children Level 1 */}
                <div className="tree-children">

                    {/* Branch 1: Operations */}
                    <div className="tree-node group">
                        <div
                            className="glass-panel p-4 flex flex-col items-center w-56 hover:border-blue-400/50 cursor-pointer">
                            <div
                                className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex-center text-blue-400 mb-2">
                                <Activity className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-300 mb-0.5">David Chen</h3>
                            <p className="text-[10px] text-blue-400 uppercase tracking-wider font-mono">Chief Operating
                                Officer</p>
                            <p className="text-[10px] text-gray-500 mt-2">3 Human Directs • 1 Agent Pod</p>
                        </div>
                    </div>

                    {/* Branch 2: Engineering (with Agents) */}
                    <div className="tree-node">
                        <div
                            className="glass-panel p-4 flex flex-col items-center w-56 hover:border-emerald-400/50 cursor-pointer mb-5">
                            <div
                                className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex-center text-emerald-400 mb-2">
                                <Terminal className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-300 mb-0.5">Bob Smith</h3>
                            <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-mono">Chief Technology
                                Officer</p>
                            <p className="text-[10px] text-gray-500 mt-2">12 Human Directs • 3 Agent Pods</p>
                        </div>

                        {/* Children Level 2 (Engineering Sub-branch) */}
                        <div className="tree-children mt-0 w-full justify-center">

                            {/* Sub Node Human */}
                            <div className="tree-node">
                                <div
                                    className="glass-panel p-3 flex flex-col items-center w-48 opacity-80 hover:opacity-100 cursor-pointer">
                                    <div
                                        className="w-8 h-8 rounded-full bg-dark-300 border border-white/10 flex-center text-gray-400 mb-2">
                                        <span className="text-[10px] font-mono">SJ</span>
                                    </div>
                                    <h3 className="text-xs font-semibold text-gray-300">Sarah Jenkins</h3>
                                    <p className="text-[9px] text-gray-500 font-mono text-center">VP Engineering</p>
                                </div>
                            </div>

                            {/* Sub Node Agent Pod */}
                            <div className="tree-node">
                                <div
                                    className="glass-panel p-3 flex flex-col items-center w-48 border-accent-purple/20 bg-accent-purple/5 opacity-90 cursor-pointer">
                                    <div
                                        className="w-8 h-8 rounded-lg bg-accent-purple/20 border border-accent-purple/30 flex-center text-accent-purple mb-2">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-xs font-semibold text-accent-purple">Nexus Code Reviewer</h3>
                                    <p className="text-[9px] text-gray-400 font-mono text-center mb-1">AI Agent</p>
                                    <span
                                        className="text-[8px] border border-white/10 bg-dark-900 px-1 py-0.5 rounded text-gray-500">Auto-Approval
                                        Hook</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Branch 3: Marketing */}
                    <div className="tree-node group">
                        <div
                            className="glass-panel p-4 flex flex-col items-center w-56 hover:border-rose-400/50 cursor-pointer">
                            <div
                                className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex-center text-rose-400 mb-2">
                                <Presentation className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-300 mb-0.5">Elena Rodriguez</h3>
                            <p className="text-[10px] text-rose-400 uppercase tracking-wider font-mono">Chief Marketing
                                Officer</p>
                            <p className="text-[10px] text-gray-500 mt-2">8 Human Directs • 5 Agent Pods</p>
                        </div>
                    </div>

                </div>

            </div>
        </div>

        <div className="absolute bottom-8 right-8 flex flex-col gap-2">
            <button
                className="w-10 h-10 rounded-full bg-dark-300 border border-white/10 flex-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors shadow-lg"><ZoomIn className="w-5 h-5" /></button>
            <button
                className="w-10 h-10 rounded-full bg-dark-300 border border-white/10 flex-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors shadow-lg"><ZoomOut className="w-5 h-5" /></button>
            <button
                className="w-10 h-10 rounded-full bg-dark-300 border border-white/10 flex-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors shadow-lg mt-2"><Focus className="w-5 h-5" /></button>
        </div>

    </main>
    </>
  );
}

export default AdminOrgChart;
