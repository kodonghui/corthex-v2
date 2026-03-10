"use client";
import React from "react";
import { BarChart3, Bot, Building, Building2, KeySquare, LayoutDashboard, Search, Settings, Users } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-900 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-blue-500/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-30%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[150px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-cyan/5 blur-[120px]; }
            
            .glass-panel { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass rounded-2xl overflow-hidden transition-all duration-300; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-white bg-white/[0.08] shadow-[inset_2px_0_0_0_rgba(59,130,246,0.5)]; }
            
            .btn { @apply inline-flex items-center justify-center px-4 py-2 font-medium text-sm rounded-lg transition-all gap-2 cursor-pointer; }
            .btn-primary { @apply bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:opacity-90; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        }
`;

function AdminCompanies() {
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
                <a href="/admin/companies" className="nav-item active"><Building2 className="w-4 h-4" />
                    Tenancy / Companies</a>
                <a href="/admin/settings" className="nav-item"><Settings className="w-4 h-4" /> Platform
                    Settings</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><Building2
                        className="w-4 h-4 inline mr-2 text-blue-400" />Workspace & Tenancy Directory</span>
            </div>
            <div className="flex items-center gap-3">
                <button className="btn btn-primary text-xs py-1.5"><Building className="w-3 h-3" /> Provision
                    New Workspace</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">

            <div className="glass-panel p-4 mb-6 flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" placeholder="Search workspaces by name or tenant ID..."
                        className="w-full bg-dark-200/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                <div className="flex gap-2">
                    <select
                        className="bg-dark-200/50 border border-white/10 text-xs px-3 py-2 rounded-lg text-gray-300 appearance-none pr-8 focus:outline-none">
                        <option>Plan: All</option>
                        <option>Enterprise</option>
                        <option>Pro</option>
                        <option>Starter</option>
                    </select>
                    <select
                        className="bg-dark-200/50 border border-white/10 text-xs px-3 py-2 rounded-lg text-gray-300 appearance-none pr-8 focus:outline-none">
                        <option>Status: Active</option>
                        <option>Suspended</option>
                        <option>In Trial</option>
                    </select>
                </div>
            </div>

            {/* Tenancy List (API: GET /api/admin/companies) */}
            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr
                            className="bg-white/[0.02] text-gray-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
                            <th className="py-4 px-6 font-medium">Workspace / Tenant ID</th>
                            <th className="py-4 px-6 font-medium">Subscription Plan</th>
                            <th className="py-4 px-6 font-medium">Metrics (Users / Agents)</th>
                            <th className="py-4 px-6 font-medium">Monthly Cost Limit</th>
                            <th className="py-4 px-6 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">

                        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex-center text-white text-xs font-bold">
                                        GT</div>
                                    <div>
                                        <p className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                            Global Tech Inc.</p>
                                        <p className="text-[10px] text-gray-500 font-mono">tn_globaltech_001</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <span
                                    className="bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded text-[10px] border border-accent-purple/20">Enterprise
                                    Custom</span>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex gap-4 text-xs font-mono">
                                    <span className="flex items-center gap-1 text-gray-400"><Users
                                            className="w-3 h-3 text-gray-500" /> 1,240</span>
                                    <span className="flex items-center gap-1 text-gray-400"><Bot
                                            className="w-3 h-3 text-accent-cyan" /> 142</span>
                                </div>
                            </td>
                            <td className="py-4 px-6 font-mono text-xs">
                                <div className="flex items-center gap-2">
                                    <span>$20,000</span>
                                    <div className="w-16 h-1 rounded flex-1 bg-dark-300 overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{width: "65%"}}></div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                                <button
                                    className="text-xs font-medium text-blue-400 hover:text-white transition-colors">Manage</button>
                            </td>
                        </tr>

                        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 flex-center text-xs font-bold">
                                        ND</div>
                                    <div>
                                        <p className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                            Nexus Dynamics</p>
                                        <p className="text-[10px] text-gray-500 font-mono">tn_nexusdyn_442</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <span
                                    className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] border border-blue-500/20">Enterprise
                                    Standard</span>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex gap-4 text-xs font-mono">
                                    <span className="flex items-center gap-1 text-gray-400"><Users
                                            className="w-3 h-3 text-gray-500" /> 45</span>
                                    <span className="flex items-center gap-1 text-gray-400"><Bot
                                            className="w-3 h-3 text-accent-cyan" /> 12</span>
                                </div>
                            </td>
                            <td className="py-4 px-6 font-mono text-xs">
                                <div className="flex items-center gap-2">
                                    <span>$5,000</span>
                                    <div className="w-16 h-1 rounded flex-1 bg-dark-300 overflow-hidden">
                                        <div className="h-full bg-rose-500" style={{width: "95%"}}></div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                                <button
                                    className="text-xs font-medium text-blue-400 hover:text-white transition-colors">Manage</button>
                            </td>
                        </tr>

                        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group opacity-70">
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded bg-dark-300 border border-white/10 text-gray-400 flex-center text-xs font-bold">
                                        SS</div>
                                    <div>
                                        <p
                                            className="font-medium text-gray-300 group-hover:text-blue-400 transition-colors">
                                            Solaris Startups</p>
                                        <p className="text-[10px] text-gray-500 font-mono">tn_solaris_891</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <span
                                    className="bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded text-[10px] border border-gray-500/20">Pro
                                    Trial</span>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex gap-4 text-xs font-mono">
                                    <span className="flex items-center gap-1 text-gray-400"><Users
                                            className="w-3 h-3 text-gray-500" /> 12</span>
                                    <span className="flex items-center gap-1 text-gray-400"><Bot
                                            className="w-3 h-3 text-accent-cyan" /> 3</span>
                                </div>
                            </td>
                            <td className="py-4 px-6 font-mono text-xs">
                                <div className="flex items-center gap-2">
                                    <span>$500</span>
                                    <div className="w-16 h-1 rounded flex-1 bg-dark-300 overflow-hidden">
                                        <div className="h-full bg-emerald-400" style={{width: "15%"}}></div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                                <button
                                    className="text-xs font-medium text-blue-400 hover:text-white transition-colors">Manage</button>
                            </td>
                        </tr>

                    </tbody>
                </table>
                <div className="p-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
                    Showing 1-10 of 142 Active Workspaces.
                    <div className="flex gap-1">
                        <button className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50">Prev</button>
                        <button className="px-2 py-1 rounded bg-white/5 hover:bg-white/10">Next</button>
                    </div>
                </div>
            </div>

        </div>
    </main>
    </>
  );
}

export default AdminCompanies;
