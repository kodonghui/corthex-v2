"use client";
import React from "react";
import { Building, Contact, LayoutDashboard, Lock, MoreHorizontal, Search, ShieldCheck, UserPlus, Users } from "lucide-react";

const styles = `
@layer components {
            body { @apply bg-dark-900 text-gray-200 font-sans antialiased font-light min-h-screen overflow-hidden flex selection:bg-purple-500/30 selection:text-white; }
            .bg-ambient { @apply fixed inset-0 z-[-1] pointer-events-none; }
            .bg-ambient::before { content: ''; @apply absolute top-[-30%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[150px]; }
            .bg-ambient::after { content: ''; @apply absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-purple/10 blur-[120px]; }
            
            .glass-panel { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-glass rounded-2xl overflow-hidden transition-all duration-300; }
            
            .nav-item { @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors font-medium text-sm; }
            .nav-item.active { @apply text-white bg-white/[0.08] shadow-[inset_2px_0_0_0_rgba(168,85,247,1)]; }
            
            .btn { @apply inline-flex items-center justify-center px-4 py-2 font-medium text-sm rounded-lg transition-all gap-2 cursor-pointer; }
            .btn-primary { @apply bg-gradient-accent text-white hover:shadow-glow hover:opacity-90; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        }
`;

function AdminUsers() {
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
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Identity & Access</p>
                <a href="/admin/users" className="nav-item active"><Users className="w-4 h-4" /> Global
                    Users</a>
                <a href="/admin/employees" className="nav-item"><Contact className="w-4 h-4" /> Tenant
                    Employees</a>
                <a href="/admin/credentials" className="nav-item"><Lock className="w-4 h-4" />
                    Credentials</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><Users
                        className="w-4 h-4 inline mr-2 text-accent-purple" />Global User Directory</span>
            </div>
            <div className="flex items-center gap-3">
                <button className="btn btn-primary text-xs py-1.5"><UserPlus className="w-3 h-3" /> Create
                    Admin User</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">

            <div className="glass-panel p-4 mb-6 flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" placeholder="Search by email, name, or global ID..."
                        className="w-full bg-dark-200/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent-purple/50" />
                </div>
                <div className="flex gap-2">
                    <select
                        className="bg-dark-200/50 border border-white/10 text-xs px-3 py-2 rounded-lg text-gray-300 appearance-none pr-8 focus:outline-none focus:border-accent-purple/50">
                        <option>Role: All</option>
                        <option>Super Admin</option>
                        <option>Tenant Owner</option>
                        <option>Standard User</option>
                    </select>
                </div>
            </div>

            {/* Global Users Table (API: GET /api/admin/users) */}
            <div className="glass-panel overflow-hidden border-accent-purple/20">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr
                            className="bg-white/[0.02] text-gray-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
                            <th className="py-4 px-6 font-medium">User Profile</th>
                            <th className="py-4 px-6 font-medium">Global Role</th>
                            <th className="py-4 px-6 font-medium">Primary Workspace</th>
                            <th className="py-4 px-6 font-medium">Last Login</th>
                            <th className="py-4 px-6 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">

                        {/* User 1: Super Admin */}
                        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <img src="https://ui-avatars.com/api/?name=J+D&background=a855f7&color=fff&rounded=true"
                                        className="w-8 h-8 rounded-full border border-white/10" />
                                    <div>
                                        <p
                                            className="font-medium text-white group-hover:text-accent-purple transition-colors flex items-center gap-2">
                                            John Doe <ShieldCheck className="w-3 h-3 text-accent-cyan" />
                                        </p>
                                        <p className="text-[10px] text-gray-500 font-mono">john@corthex.io</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <span
                                    className="bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded text-[10px] border border-accent-purple/30 font-bold">PLATFORM
                                    ADMIN</span>
                            </td>
                            <td className="py-4 px-6">
                                <span className="text-xs text-gray-400 font-mono">tn_internal_000</span>
                            </td>
                            <td className="py-4 px-6 font-mono text-xs text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online
                            </td>
                            <td className="py-4 px-6 text-right">
                                <button className="text-gray-400 hover:text-white transition-colors p-1"><MoreHorizontal className="w-4 h-4" /></button>
                            </td>
                        </tr>

                        {/* User 2: Tenant Owner */}
                        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <img src="https://ui-avatars.com/api/?name=S+S&background=3b82f6&color=fff&rounded=true"
                                        className="w-8 h-8 rounded-full border border-white/10" />
                                    <div>
                                        <p
                                            className="font-medium text-white group-hover:text-accent-purple transition-colors">
                                            Sarah Smith</p>
                                        <p className="text-[10px] text-gray-500 font-mono">sarah.ceo@globaltech.com</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <span
                                    className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] border border-blue-500/20">Tenant
                                    Owner</span>
                            </td>
                            <td className="py-4 px-6 flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex-center text-white text-[8px] font-bold">
                                    GT</div>
                                <span className="text-xs text-gray-300">Global Tech Inc.</span>
                            </td>
                            <td className="py-4 px-6 font-mono text-[10px] text-gray-500">
                                2 hours ago
                            </td>
                            <td className="py-4 px-6 text-right">
                                <button className="text-gray-400 hover:text-white transition-colors p-1"><MoreHorizontal className="w-4 h-4" /></button>
                            </td>
                        </tr>

                        {/* User 3: Standard User across multiple instances */}
                        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <img src="https://ui-avatars.com/api/?name=M+J&background=10b981&color=fff&rounded=true"
                                        className="w-8 h-8 rounded-full border border-white/10" />
                                    <div>
                                        <p
                                            className="font-medium text-white group-hover:text-accent-purple transition-colors">
                                            Mike Johnson</p>
                                        <p className="text-[10px] text-gray-500 font-mono">mike.consultant@agency.io</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <span
                                    className="bg-dark-300 text-gray-400 px-2 py-0.5 rounded text-[10px] border border-white/10">User</span>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-gray-300 flex items-center gap-1"><Building className="w-3 h-3 text-gray-500" /> Nexus
                                        Dynamics</span>
                                    <span className="text-[10px] text-gray-500 italic">+ 2 other workspaces</span>
                                </div>
                            </td>
                            <td className="py-4 px-6 font-mono text-[10px] text-gray-500">
                                3 days ago
                            </td>
                            <td className="py-4 px-6 text-right">
                                <button className="text-gray-400 hover:text-white transition-colors p-1"><MoreHorizontal className="w-4 h-4" /></button>
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>

        </div>
    </main>
    </>
  );
}

export default AdminUsers;
