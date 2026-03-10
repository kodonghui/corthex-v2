"use client";
import React from "react";
import { Bot, CheckCircle2, LayoutDashboard, MoreVertical, Network, Search, UserPlus, Users, XCircle } from "lucide-react";

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
        }
`;

function AdminEmployees() {
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
                <a href="/admin/employees" className="nav-item active"><Users className="w-4 h-4" />
                    Employees</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><Users
                        className="w-4 h-4 inline mr-2 text-blue-400" />Identity & Access Management</span>
            </div>
            <div className="flex items-center gap-3">
                <button className="btn btn-primary text-xs py-1.5"><UserPlus className="w-3 h-3" /> Invite
                    Provision</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">

            <div className="glass-panel p-4 mb-6 flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" placeholder="Search users by email, name, or role..."
                        className="w-full bg-dark-200/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent-purple/50" />
                </div>
                <div className="flex gap-2">
                    <select
                        className="bg-dark-200/50 border border-white/10 text-xs px-3 py-2 rounded-lg text-gray-300 appearance-none pr-8 focus:outline-none">
                        <option>Tenant: Global Tech Inc.</option>
                        <option>Tenant: Nexus Dynamics</option>
                        <option>All Tenants</option>
                    </select>
                    <select
                        className="bg-dark-200/50 border border-white/10 text-xs px-3 py-2 rounded-lg text-gray-300 appearance-none pr-8 focus:outline-none">
                        <option>Status: Active</option>
                        <option>Suspended</option>
                        <option>Pending</option>
                    </select>
                </div>
            </div>

            {/* Users List (API: GET /api/admin/employees) */}
            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr
                            className="bg-white/[0.02] text-gray-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
                            <th className="py-4 px-6 font-medium">User & Email</th>
                            <th className="py-4 px-6 font-medium">Department</th>
                            <th className="py-4 px-6 font-medium">Role</th>
                            <th className="py-4 px-6 font-medium">MFA</th>
                            <th className="py-4 px-6 font-medium">Last Login</th>
                            <th className="py-4 px-6 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">

                        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full bg-gradient-accent flex-center text-white text-xs font-bold font-mono">
                                        AD</div>
                                    <div>
                                        <p
                                            className="font-medium text-white group-hover:text-accent-cyan transition-colors">
                                            Alice Doe (Admin)</p>
                                        <p className="text-[10px] text-gray-500 font-mono">alice@globaltech.inc</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6 text-xs">Executive Office</td>
                            <td className="py-4 px-6"><span
                                    className="bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded text-[10px] border border-accent-purple/20">Workspace
                                    Owner</span></td>
                            <td className="py-4 px-6 text-emerald-400"><CheckCircle2 className="w-4 h-4" />
                            </td>
                            <td className="py-4 px-6 font-mono text-[10px] text-gray-500">2 hours ago</td>
                            <td className="py-4 px-6 text-right">
                                <button className="text-gray-400 hover:text-white transition-colors p-1"><MoreVertical className="w-4 h-4" /></button>
                            </td>
                        </tr>

                        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full bg-dark-300 border border-white/10 flex-center text-gray-400 text-xs font-bold font-mono">
                                        BS</div>
                                    <div>
                                        <p
                                            className="font-medium text-white group-hover:text-accent-cyan transition-colors">
                                            Bob Smith</p>
                                        <p className="text-[10px] text-gray-500 font-mono">bob@globaltech.inc</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6 text-xs">Engineering</td>
                            <td className="py-4 px-6"><span
                                    className="bg-white/10 text-gray-300 px-2 py-0.5 rounded text-[10px] border border-white/10">Member</span>
                            </td>
                            <td className="py-4 px-6 text-emerald-400"><CheckCircle2 className="w-4 h-4" />
                            </td>
                            <td className="py-4 px-6 font-mono text-[10px] text-gray-500">Yesterday</td>
                            <td className="py-4 px-6 text-right">
                                <button className="text-gray-400 hover:text-white transition-colors p-1"><MoreVertical className="w-4 h-4" /></button>
                            </td>
                        </tr>

                        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group opacity-60">
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full bg-dark-300 border border-rose-500/30 flex-center text-rose-500 text-xs font-bold font-mono">
                                        CJ</div>
                                    <div>
                                        <p className="font-medium text-gray-400">Charlie Jones</p>
                                        <p className="text-[10px] text-gray-500 font-mono">charlie@globaltech.inc</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6 text-xs">Marketing</td>
                            <td className="py-4 px-6"><span
                                    className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded text-[10px] border border-rose-500/20">Suspended</span>
                            </td>
                            <td className="py-4 px-6 text-gray-600"><XCircle className="w-4 h-4" /></td>
                            <td className="py-4 px-6 font-mono text-[10px] text-gray-500">14 days ago</td>
                            <td className="py-4 px-6 text-right">
                                <button className="text-gray-400 hover:text-white transition-colors p-1"><MoreVertical className="w-4 h-4" /></button>
                            </td>
                        </tr>

                    </tbody>
                </table>
                <div className="p-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
                    Showing active identities for Global Tech Inc.
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

export default AdminEmployees;
