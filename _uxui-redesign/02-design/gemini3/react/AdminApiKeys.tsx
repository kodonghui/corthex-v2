"use client";
import React from "react";
import { AlertTriangle, BarChart3, Building2, KeySquare, LayoutDashboard, MoreVertical, Plus } from "lucide-react";

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
            .btn-primary { @apply bg-gradient-accent text-white hover:shadow-glow hover:opacity-90; }
            .btn-secondary { @apply bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1]; }
            
            .text-gradient { @apply bg-gradient-accent bg-clip-text text-transparent; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        }
`;

function AdminApiKeys() {
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
                <a href="/admin/api-keys" className="nav-item active"><KeySquare className="w-4 h-4" />
                    Platform API Keys</a>
                <a href="/admin/costs" className="nav-item"><BarChart3 className="w-4 h-4" /> Global
                    Costs</a>
                <a href="/admin/companies" className="nav-item"><Building2 className="w-4 h-4" /> Tenancy
                    / Companies</a>
            </div>
        </div>
    </aside>

    <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">

        <header
            className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-dark-300/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300"><KeySquare
                        className="w-4 h-4 inline mr-2 text-blue-400" />Platform Developer Keys</span>
            </div>
            <div className="flex items-center gap-3">
                <button className="btn btn-primary text-xs py-1.5"><Plus className="w-3 h-3" /> Generate
                    Master Key</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-6xl mx-auto">

                <h2 className="text-xl font-medium text-white mb-2">Global API Access</h2>
                <p className="text-sm text-gray-400 mb-8 max-w-2xl">Manage external provisioning keys, CI/CD tokens, and
                    master integrations. Do not distribute these keys to end-users; these bypass tenant-level isolation.
                </p>

                {/* API Keys List (API: GET /api/admin/api-keys) */}
                <div className="glass-panel overflow-hidden border-blue-500/20">
                    <div className="p-4 border-b border-white/5 bg-blue-500/5 flex justify-between items-center">
                        <div className="flex gap-4">
                            <span className="text-xs font-semibold text-white border-b-2 border-accent-cyan pb-1">Active
                                Keys (4)</span>
                            <span
                                className="text-xs font-medium text-gray-500 hover:text-white cursor-pointer pb-1">Revoked</span>
                        </div>
                        <input type="text" placeholder="Search by name or prefix..."
                            className="bg-dark-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none w-64" />
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr
                                className="bg-dark-300/30 text-gray-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
                                <th className="py-4 px-6 font-medium">Name & Purpose</th>
                                <th className="py-4 px-6 font-medium">Key Prefix</th>
                                <th className="py-4 px-6 font-medium">Permissions</th>
                                <th className="py-4 px-6 font-medium">Created / Last Used</th>
                                <th className="py-4 px-6 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">

                            <tr className="border-b border-white/5 hover:bg-white/[0.02] group">
                                <td className="py-4 px-6">
                                    <p className="font-medium text-white group-hover:text-accent-cyan transition-colors">
                                        Stripe Billing Webhook</p>
                                    <p className="text-[10px] text-gray-500 mt-1">Automated tenant provisioning</p>
                                </td>
                                <td className="py-4 px-6 font-mono text-xs text-gray-400">ctx_prod_****************<span
                                        className="text-white bg-white/10 px-1 rounded ml-1">v8mP</span></td>
                                <td className="py-4 px-6"><span
                                        className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[10px] border border-amber-500/20">Tenant
                                        Write</span></td>
                                <td className="py-4 px-6 font-mono text-[10px] text-gray-500">
                                    Created: Oct 12, 2025<br />
                                    Used: 2 mins ago
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <button className="text-gray-400 hover:text-white transition-colors p-1"><MoreVertical className="w-4 h-4" /></button>
                                </td>
                            </tr>

                            <tr className="border-b border-white/5 hover:bg-white/[0.02] group">
                                <td className="py-4 px-6">
                                    <p className="font-medium text-white group-hover:text-accent-cyan transition-colors">
                                        GitHub Actions CI/CD</p>
                                    <p className="text-[10px] text-gray-500 mt-1">Blueprint deployments</p>
                                </td>
                                <td className="py-4 px-6 font-mono text-xs text-gray-400">ctx_prod_****************<span
                                        className="text-white bg-white/10 px-1 rounded ml-1">x2Z1</span></td>
                                <td className="py-4 px-6"><span
                                        className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] border border-blue-500/20">Marketplace
                                        Write</span></td>
                                <td className="py-4 px-6 font-mono text-[10px] text-gray-500">
                                    Created: Nov 05, 2025<br />
                                    Used: 4 hours ago
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <button className="text-gray-400 hover:text-white transition-colors p-1"><MoreVertical className="w-4 h-4" /></button>
                                </td>
                            </tr>

                            <tr className="border-b border-white/5 hover:bg-white/[0.02] group">
                                <td className="py-4 px-6">
                                    <p className="font-medium text-white group-hover:text-accent-cyan transition-colors">
                                        Monitoring Grafana</p>
                                    <p className="text-[10px] text-gray-500 mt-1">Time-series stat scraping</p>
                                </td>
                                <td className="py-4 px-6 font-mono text-xs text-gray-400">ctx_read_****************<span
                                        className="text-white bg-white/10 px-1 rounded ml-1">9qLp</span></td>
                                <td className="py-4 px-6"><span
                                        className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] border border-emerald-500/20">Global
                                        Read-Only</span></td>
                                <td className="py-4 px-6 font-mono text-[10px] text-gray-500">
                                    Created: Jan 10, 2026<br />
                                    Used: Just now
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <button className="text-gray-400 hover:text-white transition-colors p-1"><MoreVertical className="w-4 h-4" /></button>
                                </td>
                            </tr>

                            <tr className="border-b border-white/5 hover:bg-white/[0.02] group bg-rose-500/5">
                                <td className="py-4 px-6">
                                    <p className="font-medium text-rose-400 flex items-center gap-2"><AlertTriangle className="w-3 h-3" /> Admin CLI Sandbox</p>
                                    <p className="text-[10px] text-gray-500 mt-1">Temporary access for debugging</p>
                                </td>
                                <td className="py-4 px-6 font-mono text-xs text-rose-400">ctx_omni_****************<span
                                        className="text-white bg-white/10 px-1 rounded ml-1">4fB2</span></td>
                                <td className="py-4 px-6"><span
                                        className="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded text-[10px] border border-rose-500/30 font-bold">Omni-Admin</span>
                                </td>
                                <td className="py-4 px-6 font-mono text-[10px] text-gray-500">
                                    Created: Today<br />
                                    Expires: In 2 hours
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <button
                                        className="text-rose-400 hover:text-white transition-colors font-medium text-xs">Revoke
                                        Now</button>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    </main>
    </>
  );
}

export default AdminApiKeys;
