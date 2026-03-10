"use client";
import React from "react";
import { ArrowUpRight, Bot, Building2, Globe, LayoutDashboard, Users } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-900 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-accent-cyan/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-30%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[150px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-purple/5 blur-[120px]; }
            
            .glass-panel { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass rounded-2xl overflow-hidden transition-all duration-300; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-white bg-white/[0.08] shadow-[inset_2px_0_0_0_rgba(34,211,238,1)]; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            .num-bold { @apply font-semibold tracking-tight; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        }
`;

function AdminDashboard() {
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
                <a href="/admin/dashboard" className="nav-item active"><LayoutDashboard
                        className="w-4 h-4" /> Global Dashboard</a>
            </div>

            <div className="space-y-1">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Platform</p>
                <a href="/admin/agents" className="nav-item"><Bot className="w-4 h-4" /> Agent
                    Registry</a>
                <a href="/admin/companies" className="nav-item"><Building2 className="w-4 h-4" />
                    Workspaces/Tenants</a>
                <a href="/admin/users" className="nav-item"><Users className="w-4 h-4" /> Global Users</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><Globe
                        className="w-4 h-4 inline mr-2 text-blue-400" />Platform Operations Overview</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-mono">Status: <span
                        className="text-emerald-400">NOMINAL</span></span>
                <div className="w-8 h-8 rounded-full bg-gradient-accent flex-center text-white border border-white/20 ml-2">
                    S</div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* KPI Banner (API: GET /api/admin/dashboard) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="glass-panel p-6">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">Active
                            Workspaces</p>
                        <div className="flex items-end gap-3 mt-2">
                            <h3 className="text-3xl num-bold text-white">142</h3>
                            <span className="text-sm text-emerald-400 mb-1 flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" /> 12</span>
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">Total Users</p>
                        <div className="flex items-end gap-3 mt-2">
                            <h3 className="text-3xl num-bold text-white">4,892</h3>
                            <span className="text-sm text-emerald-400 mb-1 flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" /> 340</span>
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">Monthly MRR</p>
                        <div className="flex items-end gap-3 mt-2">
                            <h3 className="text-3xl num-bold text-white">$42.5k</h3>
                            <span className="text-sm text-emerald-400 mb-1 flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" /> 8%</span>
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">LLM Cost (MTD)
                        </p>
                        <div className="flex items-end gap-3 mt-2">
                            <h3 className="text-3xl num-bold text-white">$8.2k</h3>
                            <span className="text-sm text-rose-400 mb-1 flex items-center"><ArrowUpRight
                                    className="w-3 h-3 mr-0.5" /> 15%</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 glass-panel p-6">
                        <h3 className="text-sm font-medium text-white mb-6">Recent Workspace Signups</h3>
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-gray-500 border-b border-white/5 uppercase text-[10px] tracking-wider">
                                    <th className="pb-3 font-medium">Company</th>
                                    <th className="pb-3 font-medium">Plan</th>
                                    <th className="pb-3 font-medium">Users</th>
                                    <th className="pb-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-300">
                                <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="py-3 font-medium text-white flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex-center text-xs">N
                                        </div> Nexus Dynamics
                                    </td>
                                    <td className="py-3"><span
                                            className="bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded text-[10px]">Enterprise</span>
                                    </td>
                                    <td className="py-3 font-mono">45</td>
                                    <td className="py-3"><span
                                            className="text-emerald-400 flex items-center gap-1.5 text-xs"><span
                                                className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active</span>
                                    </td>
                                </tr>
                                <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="py-3 font-medium text-white flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex-center text-xs">
                                            S</div> Solaris Startups
                                    </td>
                                    <td className="py-3"><span
                                            className="bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded text-[10px]">Pro</span>
                                    </td>
                                    <td className="py-3 font-mono">12</td>
                                    <td className="py-3"><span
                                            className="text-amber-400 flex items-center gap-1.5 text-xs"><span
                                                className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Onboarding</span>
                                    </td>
                                </tr>
                                <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="py-3 font-medium text-white flex items-center gap-2">
                                        <div
                                            className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex-center text-xs">
                                            O</div> Orion Corp
                                    </td>
                                    <td className="py-3"><span
                                            className="bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded text-[10px]">Enterprise</span>
                                    </td>
                                    <td className="py-3 font-mono">120</td>
                                    <td className="py-3"><span
                                            className="text-emerald-400 flex items-center gap-1.5 text-xs"><span
                                                className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="glass-panel p-6">
                        <h3 className="text-sm font-medium text-white mb-6">System Health</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-300">Global API Success Rate</span>
                                    <span className="text-white font-mono">99.98%</span>
                                </div>
                                <div className="w-full h-1.5 bg-dark-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400" style={{width: "99%"}}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-300">Agent Task Completion</span>
                                    <span className="text-white font-mono">94.2%</span>
                                </div>
                                <div className="w-full h-1.5 bg-dark-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-cyan" style={{width: "94%"}}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-300">Database Storage</span>
                                    <span className="text-white font-mono">68%</span>
                                </div>
                                <div className="w-full h-1.5 bg-dark-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400" style={{width: "68%"}}></div>
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

export default AdminDashboard;
