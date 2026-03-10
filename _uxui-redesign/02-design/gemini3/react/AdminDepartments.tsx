"use client";
import React from "react";
import { Bot, Briefcase, FolderPlus, LayoutDashboard, LayoutTemplate, MoreHorizontal, Network, Plus, Search, Terminal, Users } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-900 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-accent-cyan/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-30%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[150px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-purple/5 blur-[120px]; }
            
            .glass-panel { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass rounded-2xl overflow-hidden transition-all duration-300; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-white bg-white/[0.08] shadow-[inset_2px_0_0_0_rgba(34,211,238,1)]; }
            
            .btn { @apply inline-flex items-center justify-center px-4 py-2 font-medium text-sm rounded-lg transition-all gap-2 cursor-pointer; }
            .btn-primary { @apply bg-gradient-accent text-white hover:shadow-glow hover:opacity-90; }
            .btn-secondary { @apply bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1]; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            
            .dept-card { @apply p-5 rounded-xl border border-white/5 bg-dark-300/30 hover:bg-white/[0.02] hover:border-white/10 transition-all cursor-pointer group; }
        }
`;

function AdminDepartments() {
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
                <a href="/admin/departments" className="nav-item active"><Network className="w-4 h-4" />
                    Departments</a>
                <a href="/admin/employees" className="nav-item"><Users className="w-4 h-4" />
                    Employees</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><Network
                        className="w-4 h-4 inline mr-2 text-emerald-400" />Department Structures</span>
            </div>
            <div className="flex items-center gap-3">
                <button className="btn btn-primary text-xs py-1.5"><Plus className="w-3 h-3" /> Sync from
                    HRIS</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide flex gap-8">

            <div className="w-72 shrink-0">
                <div className="glass-panel p-4 flex flex-col gap-2 h-[calc(100vh-8rem)]">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Workspaces</h3>

                    <div className="relative mb-2">
                        <Search
                            className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="text" placeholder="Filter tenants..."
                            className="w-full bg-dark-200/50 border border-white/10 rounded px-8 py-1.5 text-xs text-white focus:outline-none" />
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1">
                        <button
                            className="w-full text-left px-3 py-2 rounded bg-white/10 text-white text-xs font-medium border border-white/10 flex items-center justify-between">
                            Global Tech Inc.
                            <span
                                className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded">Active</span>
                        </button>
                        <button
                            className="w-full text-left px-3 py-2 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-xs font-medium flex items-center justify-between">
                            Nexus Dynamics
                        </button>
                        <button
                            className="w-full text-left px-3 py-2 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-xs font-medium flex items-center justify-between">
                            Solaris Startups
                        </button>
                    </div>
                </div>
            </div>

            {/* Department Tree (API: GET /api/admin/departments) */}
            <div className="flex-1 glass-panel flex flex-col">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-medium text-white mb-1">Global Tech Inc. Structure</h2>
                        <p className="text-xs text-gray-500">Managing 6 departments and 24 active agent pods.</p>
                    </div>
                    <button className="btn btn-secondary text-xs py-1.5"><FolderPlus className="w-3 h-3" />
                        Add Department</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Exec Dept */}
                        <div className="dept-card">
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className="w-10 h-10 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex-center text-accent-purple">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <button className="text-gray-500 hover:text-white"><MoreHorizontal
                                        className="w-4 h-4" /></button>
                            </div>
                            <h3 className="text-sm font-medium text-white mb-1">Executive Office</h3>
                            <p className="text-[10px] text-gray-500 font-mono mb-4">ID: dept_exec_01</p>

                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <div className="flex -space-x-2">
                                    <div
                                        className="w-6 h-6 rounded-full bg-dark-200 border border-white/20 flex-center text-[8px] text-white z-20">
                                        CE</div>
                                    <div
                                        className="w-6 h-6 rounded-full bg-dark-200 border border-white/20 flex-center text-[8px] text-white z-10">
                                        CO</div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="flex items-center gap-1 text-[10px] text-accent-cyan"><Bot className="w-3 h-3" /> 3 Agents</span>
                                </div>
                            </div>
                        </div>

                        {/* Engineering Dept */}
                        <div className="dept-card border-accent-cyan/20 bg-accent-cyan/5">
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className="w-10 h-10 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex-center text-accent-cyan">
                                    <Terminal className="w-5 h-5" />
                                </div>
                                <button className="text-gray-500 hover:text-white"><MoreHorizontal
                                        className="w-4 h-4" /></button>
                            </div>
                            <h3 className="text-sm font-medium text-white mb-1">Engineering</h3>
                            <p className="text-[10px] text-gray-500 font-mono mb-4">ID: dept_eng_02</p>

                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <div className="flex -space-x-2">
                                    <div
                                        className="w-6 h-6 rounded-full bg-dark-200 border border-white/20 flex-center text-[8px] text-white z-20">
                                        EN</div>
                                    <div
                                        className="w-6 h-6 rounded-full bg-dark-200 border border-white/20 flex-center text-[8px] text-white z-10">
                                        QA</div>
                                    <div
                                        className="w-6 h-6 rounded-full bg-dark-300 border border-white/20 flex-center text-[8px] text-gray-400 z-0">
                                        +14</div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="flex items-center gap-1 text-[10px] text-accent-cyan"><Bot className="w-3 h-3" /> 8 Agents</span>
                                </div>
                            </div>
                        </div>

                        {/* Marketing Dept */}
                        <div className="dept-card">
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex-center text-rose-400">
                                    <LayoutTemplate className="w-5 h-5" />
                                </div>
                                <button className="text-gray-500 hover:text-white"><MoreHorizontal
                                        className="w-4 h-4" /></button>
                            </div>
                            <h3 className="text-sm font-medium text-white mb-1">Marketing</h3>
                            <p className="text-[10px] text-gray-500 font-mono mb-4">ID: dept_mkt_03</p>

                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <div className="flex -space-x-2">
                                    <div
                                        className="w-6 h-6 rounded-full bg-dark-200 border border-white/20 flex-center text-[8px] text-white z-20">
                                        MK</div>
                                    <div
                                        className="w-6 h-6 rounded-full bg-dark-200 border border-white/20 flex-center text-[8px] text-white z-10">
                                        PR</div>
                                    <div
                                        className="w-6 h-6 rounded-full bg-dark-300 border border-white/20 flex-center text-[8px] text-gray-400 z-0">
                                        +4</div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="flex items-center gap-1 text-[10px] text-accent-cyan"><Bot className="w-3 h-3" /> 5 Agents</span>
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

export default AdminDepartments;
